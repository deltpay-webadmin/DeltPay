/**
 * ────────────────────────────────────────────────────────────
 * Delt CRM — Plaid Data Vault store
 * ────────────────────────────────────────────────────────────
 * Mirrors the crmStore pattern: hydrate once on first subscription,
 * stream realtime changes from Supabase, expose hooks + actions.
 *
 * Reads come straight from Postgres (RLS: staff only):
 *   • plaid_items — connected institutions per lead
 *   • plaid_nodes — the hierarchical vault (path-keyed folders/documents)
 *
 * Writes go through the staff-authenticated edge function API
 * (/make-server-940653c6/plaid/*) with the signed-in user's JWT —
 * the browser never touches Plaid access tokens.
 */

import { useSyncExternalStore, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { serverBaseUrl } from '../../../app/lib/supabase';

// ══════════════════════════════════════════════════════════════
// OAuth resume — sessionStorage keys
// ══════════════════════════════════════════════════════════════
// Plaid OAuth banks navigate the whole tab away and back. The link_token +
// leadId are stashed at token creation; the App-level shim stashes the
// return URL (carrying oauth_state_id); PlaidOAuthResume in BackendPlaid
// reads both to finish the flow.

export const PLAID_LINK_SESSION_KEY = 'dp_plaid_link';
export const PLAID_OAUTH_HREF_KEY = 'dp_plaid_oauth_href';

// ══════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════

export interface PlaidItem {
  id: string;
  itemId: string;
  leadId: string | null;
  institutionId: string | null;
  institutionName: string | null;
  itemKey: string;
  products: string[];
  status: 'active' | 'error' | 'disconnected';
  error: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
}

export interface PlaidNode {
  path: string;
  parentPath: string | null;
  name: string;
  nodeType: 'folder' | 'document';
  docKind: string | null;
  leadId: string | null;
  itemId: string | null;
  data: any;
  updatedAt: string;
}

/** A "send the prospect a connect link" invite (plaid_link_requests row). */
export interface PlaidLinkRequest {
  linkToken: string;
  leadId: string | null;
  hostedLinkUrl: string;
  status: 'pending' | 'completed' | 'expired';
  itemId: string | null;
  createdAt: string;
  expiresAt: string | null;
  completedAt: string | null;
  /** Token the public email-track endpoints resolve (opens/clicks). */
  trackingId: string | null;
  /** Set when the CRM emailed the invite (vs clipboard copy). */
  emailedTo: string | null;
  emailedAt: string | null;
}

export interface PlaidStatus {
  configured: boolean;
  env: string;
  /** false when PLAID_ENV is set to an unrecognized value (server fails closed). */
  envValid: boolean;
  /** 'default' when PLAID_ENV is unset and the server fell back to sandbox. */
  envSource: 'env' | 'default';
  /** true when PLAID_REDIRECT_URI is set (OAuth banks enabled). */
  redirectUriSet: boolean;
  products: string[];
  webhookUrl: string;
  items: number;
  prospects: number;
}

interface PlaidState {
  items: PlaidItem[];
  nodes: PlaidNode[];
  requests: PlaidLinkRequest[];
  status: PlaidStatus | null;
}

interface PlaidSyncState {
  isLoading: boolean;
  /** item_ids with an in-flight server operation. */
  busy: string[];
  lastError: string | null;
}

// ══════════════════════════════════════════════════════════════
// Store
// ══════════════════════════════════════════════════════════════

let state: PlaidState = { items: [], nodes: [], requests: [], status: null };
let sync: PlaidSyncState = { isLoading: isSupabaseConfigured, busy: [], lastError: null };

const listeners = new Set<() => void>();

function set(next: Partial<PlaidState>) {
  state = { ...state, ...next };
  listeners.forEach(l => l());
}

function setSync(next: Partial<PlaidSyncState>) {
  sync = { ...sync, ...next };
  listeners.forEach(l => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  maybeHydrate();
  return () => listeners.delete(cb);
}

const getSnapshot = () => state;
const getSyncSnapshot = () => sync;

// ══════════════════════════════════════════════════════════════
// Mappers
// ══════════════════════════════════════════════════════════════

function fromDbItem(r: any): PlaidItem {
  return {
    id: r.id,
    itemId: r.item_id,
    leadId: r.lead_id ?? null,
    institutionId: r.institution_id ?? null,
    institutionName: r.institution_name ?? null,
    itemKey: r.item_key ?? '',
    products: r.products ?? [],
    status: r.status ?? 'active',
    error: r.error ?? null,
    lastSyncedAt: r.last_synced_at ?? null,
    createdAt: r.created_at ?? '',
  };
}

function fromDbRequest(r: any): PlaidLinkRequest {
  return {
    linkToken: r.link_token,
    leadId: r.lead_id ?? null,
    hostedLinkUrl: r.hosted_link_url ?? '',
    status: r.status ?? 'pending',
    itemId: r.item_id ?? null,
    createdAt: r.created_at ?? '',
    expiresAt: r.expires_at ?? null,
    completedAt: r.completed_at ?? null,
    trackingId: r.tracking_id ?? null,
    emailedTo: r.emailed_to ?? null,
    emailedAt: r.emailed_at ?? null,
  };
}

function fromDbNode(r: any): PlaidNode {
  return {
    path: r.path,
    parentPath: r.parent_path ?? null,
    name: r.name,
    nodeType: r.node_type,
    docKind: r.doc_kind ?? null,
    leadId: r.lead_id ?? null,
    itemId: r.item_id ?? null,
    data: r.data ?? {},
    updatedAt: r.updated_at ?? '',
  };
}

// ══════════════════════════════════════════════════════════════
// Hydration + realtime
// ══════════════════════════════════════════════════════════════

let hydrated = false;
let hydrating = false;

async function maybeHydrate() {
  if (hydrated || hydrating) return;
  if (!supabase) {
    hydrated = true;
    setSync({ isLoading: false });
    return;
  }
  hydrating = true;
  setSync({ isLoading: true, lastError: null });
  try {
    const [itemsRes, nodesRes, reqsRes] = await Promise.all([
      supabase.from('plaid_items').select('*').order('created_at', { ascending: false }),
      supabase.from('plaid_nodes').select('*').order('path', { ascending: true }),
      supabase.from('plaid_link_requests').select('*').order('created_at', { ascending: false }),
    ]);
    const firstErr = itemsRes.error || nodesRes.error;
    if (firstErr) throw firstErr;
    set({
      items: (itemsRes.data || []).map(fromDbItem),
      nodes: (nodesRes.data || []).map(fromDbNode),
      // Tolerate a missing table (migration not applied yet) — invites are
      // an enhancement, not a load-bearing read.
      requests: reqsRes.error ? [] : (reqsRes.data || []).map(fromDbRequest),
    });
    hydrated = true;
    setSync({ isLoading: false, lastError: null });
    subscribeRealtime();
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Plaid Vault] Hydration failed:', err);
    hydrated = true;
    setSync({ isLoading: false, lastError: err?.message || 'Failed to load' });
  } finally {
    hydrating = false;
  }
  // Fetch server config status in the background (needs a session).
  plaidActions.fetchStatus().catch(() => {});
}

function subscribeRealtime() {
  if (!supabase) return;
  const channel = supabase
    .channel('plaid-vault-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'plaid_items' },
      payload => {
        const { eventType, new: newRow, old: oldRow } = payload as any;
        if (eventType === 'DELETE') {
          set({ items: state.items.filter(i => i.id !== oldRow?.id) });
        } else {
          const mapped = fromDbItem(newRow);
          const exists = state.items.some(i => i.id === mapped.id);
          set({
            items: exists
              ? state.items.map(i => (i.id === mapped.id ? mapped : i))
              : [mapped, ...state.items],
          });
        }
      },
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'plaid_nodes' },
      payload => {
        const { eventType, new: newRow, old: oldRow } = payload as any;
        if (eventType === 'DELETE') {
          set({ nodes: state.nodes.filter(n => n.path !== oldRow?.path) });
        } else {
          const mapped = fromDbNode(newRow);
          const exists = state.nodes.some(n => n.path === mapped.path);
          const nodes = exists
            ? state.nodes.map(n => (n.path === mapped.path ? mapped : n))
            : [...state.nodes, mapped].sort((a, b) => (a.path < b.path ? -1 : 1));
          set({ nodes });
        }
      },
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'plaid_link_requests' },
      payload => {
        const { eventType, new: newRow, old: oldRow } = payload as any;
        if (eventType === 'DELETE') {
          set({ requests: state.requests.filter(r => r.linkToken !== oldRow?.link_token) });
        } else {
          const mapped = fromDbRequest(newRow);
          const exists = state.requests.some(r => r.linkToken === mapped.linkToken);
          set({
            requests: exists
              ? state.requests.map(r => (r.linkToken === mapped.linkToken ? mapped : r))
              : [mapped, ...state.requests],
          });
        }
      },
    )
    .subscribe();
  (globalThis as any).__deltPlaidChannel = channel;
}

// ══════════════════════════════════════════════════════════════
// Server API (staff JWT)
// ══════════════════════════════════════════════════════════════

async function authFetch(route: string, options: RequestInit = {}): Promise<any> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('You must be signed in to use the Plaid vault');
  const url = `${serverBaseUrl}/plaid${route.startsWith('/') ? route : `/${route}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...((options.headers as Record<string, string>) || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error || `Request failed (${res.status})`);
  }
  return json;
}

function markBusy(key: string, on: boolean) {
  setSync({ busy: on ? [...sync.busy, key] : sync.busy.filter(k => k !== key) });
}

// ══════════════════════════════════════════════════════════════
// Actions
// ══════════════════════════════════════════════════════════════

export const plaidActions = {
  /** Re-fetch items + nodes from Postgres (realtime usually covers this). */
  async refresh() {
    if (!supabase) return;
    const [itemsRes, nodesRes, reqsRes] = await Promise.all([
      supabase.from('plaid_items').select('*').order('created_at', { ascending: false }),
      supabase.from('plaid_nodes').select('*').order('path', { ascending: true }),
      supabase.from('plaid_link_requests').select('*').order('created_at', { ascending: false }),
    ]);
    if (!itemsRes.error && itemsRes.data) set({ items: itemsRes.data.map(fromDbItem) });
    if (!nodesRes.error && nodesRes.data) set({ nodes: nodesRes.data.map(fromDbNode) });
    if (!reqsRes.error && reqsRes.data) set({ requests: reqsRes.data.map(fromDbRequest) });
  },

  /** Server-side config status (are Plaid keys set, which env, webhook URL). */
  async fetchStatus(): Promise<PlaidStatus | null> {
    try {
      const json = await authFetch('/status', { method: 'GET' });
      const status: PlaidStatus = {
        configured: Boolean(json.configured),
        env: json.env ?? 'sandbox',
        envValid: json.env_valid !== false,
        envSource: json.env_source === 'default' ? 'default' : 'env',
        redirectUriSet: Boolean(json.redirect_uri_set),
        products: json.products ?? [],
        webhookUrl: json.webhook_url ?? '',
        items: json.items ?? 0,
        prospects: json.prospects ?? 0,
      };
      set({ status });
      return status;
    } catch {
      return null;
    }
  },

  /** Create a Plaid Link token for a lead. Returns the link_token. */
  async createLinkToken(leadId: string): Promise<string> {
    const json = await authFetch('/link-token', {
      method: 'POST',
      body: JSON.stringify({ leadId }),
    });
    // Stash the resume context: OAuth institutions bounce the whole tab to
    // the bank and back to /plaid-oauth-callback, and Plaid requires re-initializing
    // Link with the SAME link_token after the redirect.
    try {
      sessionStorage.setItem(
        PLAID_LINK_SESSION_KEY,
        JSON.stringify({ token: json.link_token, leadId, ts: Date.now() }),
      );
    } catch { /* storage unavailable — OAuth resume just won't work */ }
    return json.link_token as string;
  },

  /** Drop any stashed OAuth-resume context (call on Link success/exit). */
  clearLinkSession() {
    try {
      sessionStorage.removeItem(PLAID_LINK_SESSION_KEY);
      sessionStorage.removeItem(PLAID_OAUTH_HREF_KEY);
    } catch { /* ignore */ }
  },

  /** Exchange a Link public_token; the server pulls + files everything. */
  async exchange(
    leadId: string,
    publicToken: string,
    institution?: { institution_id?: string; name?: string },
  ) {
    markBusy(`exchange:${leadId}`, true);
    try {
      const json = await authFetch('/exchange', {
        method: 'POST',
        body: JSON.stringify({ leadId, publicToken, institution }),
      });
      toast.success(
        `Connected ${json.institution_name || 'bank'} — pulled ${json.sync?.accounts ?? 0} account(s).`,
      );
      await plaidActions.refresh();
      return json;
    } catch (err: any) {
      toast.error(`Plaid connection failed: ${err.message}`);
      throw err;
    } finally {
      markBusy(`exchange:${leadId}`, false);
    }
  },

  /**
   * Mint a Plaid-hosted "connect your bank" URL for a prospect and copy it
   * to the clipboard. Staff text/email the link; the prospect completes
   * Link on their own device and the connection lands in the vault
   * automatically (webhook, or the sweep during Sync all / nightly cron).
   */
  async createHostedLink(leadId: string): Promise<string> {
    markBusy(`invite:${leadId}`, true);
    try {
      const json = await authFetch('/hosted-link', {
        method: 'POST',
        body: JSON.stringify({ leadId }),
      });
      const url = String(json.hosted_link_url ?? '');
      let copied = false;
      try {
        await navigator.clipboard.writeText(url);
        copied = true;
      } catch { /* clipboard blocked — fall through to prompt */ }
      if (copied) {
        toast.success('Secure connect link copied — text or email it to the prospect. Valid for 7 days.');
      } else {
        window.prompt('Copy this secure connect link and send it to the prospect (valid 7 days):', url);
      }
      await plaidActions.refresh();
      return url;
    } catch (err: any) {
      toast.error(`Couldn't create connect link: ${err.message}`);
      throw err;
    } finally {
      markBusy(`invite:${leadId}`, false);
    }
  },

  /**
   * Email the hosted connect link to the lead. The server reuses the
   * pending link (or mints one), sends the branded invite with open/click
   * tracking, logs the outreach event, appends the lead timeline, and
   * advances New → Contacted.
   */
  async emailHostedLink(
    leadId: string,
    opts: { to?: string; note?: string } = {},
  ): Promise<{ emailedTo: string; duplicate: boolean }> {
    markBusy(`invite:${leadId}`, true);
    try {
      const json = await authFetch('/hosted-link/email', {
        method: 'POST',
        body: JSON.stringify({ leadId, ...opts }),
      });
      const emailedTo = String(json.emailed_to ?? opts.to ?? '');
      if (json.duplicate) {
        toast.info?.(`Already sent to ${emailedTo} moments ago.`);
      } else {
        toast.success(`Application link emailed to ${emailedTo} — valid for 7 days.`);
      }
      await plaidActions.refresh();
      return { emailedTo, duplicate: Boolean(json.duplicate) };
    } catch (err: any) {
      toast.error(`Couldn't email the connect link: ${err.message}`);
      throw err;
    } finally {
      markBusy(`invite:${leadId}`, false);
    }
  },

  /** Sandbox-only instant test connection (no Link UI). */
  async sandboxQuickConnect(leadId: string) {
    markBusy(`exchange:${leadId}`, true);
    try {
      const json = await authFetch('/sandbox/quick-connect', {
        method: 'POST',
        body: JSON.stringify({ leadId }),
      });
      toast.success(`Sandbox bank connected for ${leadId}.`);
      await plaidActions.refresh();
      return json;
    } catch (err: any) {
      toast.error(`Sandbox connect failed: ${err.message}`);
      throw err;
    } finally {
      markBusy(`exchange:${leadId}`, false);
    }
  },

  /** Re-pull one item from Plaid into the vault. */
  async syncItem(itemId: string) {
    markBusy(`sync:${itemId}`, true);
    try {
      const json = await authFetch('/sync', {
        method: 'POST',
        body: JSON.stringify({ itemId }),
      });
      toast.success(`Synced — ${json.transactions_added ?? 0} new transaction(s).`);
      await plaidActions.refresh();
      return json;
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`);
      throw err;
    } finally {
      markBusy(`sync:${itemId}`, false);
    }
  },

  /** Re-pull every connected item (optionally scoped to one lead). */
  async syncAll(leadId?: string) {
    markBusy('sync:all', true);
    try {
      const json = await authFetch('/sync-all', {
        method: 'POST',
        body: JSON.stringify(leadId ? { leadId } : {}),
      });
      const results: any[] = json.results ?? [];
      const failed = results.filter(r => r && r.ok === false).length;
      toast.success(
        failed
          ? `Synced ${results.length - failed}/${results.length} connection(s) — ${failed} failed.`
          : `Synced ${results.length} connection(s).`,
      );
      await plaidActions.refresh();
      return results;
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`);
      throw err;
    } finally {
      markBusy('sync:all', false);
    }
  },

  /** Attach an existing Plaid Identity Verification session to a lead. */
  async attachIdv(leadId: string, identityVerificationId: string) {
    try {
      const json = await authFetch('/idv/attach', {
        method: 'POST',
        body: JSON.stringify({ leadId, identityVerificationId }),
      });
      toast.success(`IDV session attached (status: ${json.status ?? 'unknown'}).`);
      await plaidActions.refresh();
      return json;
    } catch (err: any) {
      toast.error(`IDV attach failed: ${err.message}`);
      throw err;
    }
  },

  /** Kick off a 90-day verified Asset Report across a lead's connections. */
  async createAssetReport(leadId: string) {
    try {
      const json = await authFetch('/asset-report', {
        method: 'POST',
        body: JSON.stringify({ leadId }),
      });
      toast.success('Asset report requested — Plaid is generating it (usually under a minute).');
      await plaidActions.refresh();
      return json;
    } catch (err: any) {
      toast.error(`Asset report failed: ${err.message}`);
      throw err;
    }
  },

  /** Poll a pending asset report (webhook does this automatically too). */
  async refreshAssetReport(leadId: string) {
    try {
      const json = await authFetch('/asset-report/refresh', {
        method: 'POST',
        body: JSON.stringify({ leadId }),
      });
      if (json.status === 'ready') toast.success('Asset report is ready.');
      else toast.info?.('Asset report still generating — try again shortly.');
      await plaidActions.refresh();
      return json;
    } catch (err: any) {
      toast.error(`Asset report refresh failed: ${err.message}`);
      throw err;
    }
  },

  /** Disconnect an institution and remove its vault data. */
  async removeItem(itemId: string) {
    markBusy(`remove:${itemId}`, true);
    try {
      await authFetch(`/items/${encodeURIComponent(itemId)}`, { method: 'DELETE' });
      toast.success('Connection removed.');
      await plaidActions.refresh();
    } catch (err: any) {
      toast.error(`Disconnect failed: ${err.message}`);
      throw err;
    } finally {
      markBusy(`remove:${itemId}`, false);
    }
  },
};

// ══════════════════════════════════════════════════════════════
// Hooks
// ══════════════════════════════════════════════════════════════

export function usePlaidItems() {
  const selector = useCallback(() => state.items, []);
  return useSyncExternalStore(subscribe, selector, selector);
}

export function usePlaidNodes() {
  const selector = useCallback(() => state.nodes, []);
  return useSyncExternalStore(subscribe, selector, selector);
}

export function usePlaidLinkRequests() {
  const selector = useCallback(() => state.requests, []);
  return useSyncExternalStore(subscribe, selector, selector);
}

export function usePlaidStatus() {
  const selector = useCallback(() => state.status, []);
  return useSyncExternalStore(subscribe, selector, selector);
}

export function usePlaidSync() {
  return useSyncExternalStore(subscribe, getSyncSnapshot, getSyncSnapshot);
}
