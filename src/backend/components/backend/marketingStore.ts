/**
 * ────────────────────────────────────────────────────────────
 * Delt CRM — Marketing / ad-accounts store
 * ────────────────────────────────────────────────────────────
 * Mirrors the plaidStore pattern: hydrate once on first subscription,
 * expose hooks + actions.
 *
 * Reads come straight from Postgres (RLS: staff only):
 *   • ad_connections    — connected ad providers (Meta today)
 *   • ad_insights_daily — campaign/day performance
 *
 * Connect / sync / disconnect go through the staff-authenticated edge
 * function API (/make-server-940653c6/ads/*) with the signed-in user's
 * JWT — the browser sends the Meta token once, on connect, and never
 * reads it back.
 */

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { makeAuthFetch } from '../../../app/lib/supabase';
import { refreshLeads } from './crmStore';

// ══════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════

export interface AdConnection {
  provider: string;
  accountId: string;
  accountName: string | null;
  currency: string | null;
  status: 'active' | 'error' | 'disconnected';
  error: string | null;
  lastSyncedAt: string | null;
}

export interface AdInsightRow {
  provider: string;
  accountId: string;
  campaignId: string;
  campaignName: string | null;
  day: string; // YYYY-MM-DD
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
}

export interface AdLead {
  leadId: string;
  createdTime: string | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  formName: string | null;
  campaignName: string | null;
  adName: string | null;
  isOrganic: boolean;
  matchedLeadId: string | null;
  matchBasis: string | null;
}

interface MarketingState {
  connections: AdConnection[];
  insights: AdInsightRow[];
  adLeads: AdLead[];
}

interface MarketingSyncState {
  isLoading: boolean;
  isBusy: boolean;
  lastError: string | null;
}

// ══════════════════════════════════════════════════════════════
// Store
// ══════════════════════════════════════════════════════════════

let state: MarketingState = { connections: [], insights: [], adLeads: [] };
let sync: MarketingSyncState = { isLoading: isSupabaseConfigured, isBusy: false, lastError: null };

const listeners = new Set<() => void>();

function set(next: Partial<MarketingState>) {
  state = { ...state, ...next };
  listeners.forEach(l => l());
}

function setSync(next: Partial<MarketingSyncState>) {
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

function fromDbConnection(r: any): AdConnection {
  return {
    provider: r.provider,
    accountId: r.account_id,
    accountName: r.account_name ?? null,
    currency: r.currency ?? null,
    status: r.status ?? 'active',
    error: r.error ?? null,
    lastSyncedAt: r.last_synced_at ?? null,
  };
}

function fromDbAdLead(r: any): AdLead {
  return {
    leadId: r.lead_id,
    createdTime: r.created_time ?? null,
    fullName: r.full_name ?? null,
    email: r.email ?? null,
    phone: r.phone ?? null,
    formName: r.form_name ?? null,
    campaignName: r.campaign_name ?? null,
    adName: r.ad_name ?? null,
    isOrganic: Boolean(r.is_organic),
    matchedLeadId: r.matched_lead_id ?? null,
    matchBasis: r.match_basis ?? null,
  };
}

function fromDbInsight(r: any): AdInsightRow {
  return {
    provider: r.provider,
    accountId: r.account_id,
    campaignId: r.campaign_id,
    campaignName: r.campaign_name ?? null,
    day: r.day,
    spend: Number(r.spend) || 0,
    impressions: Number(r.impressions) || 0,
    clicks: Number(r.clicks) || 0,
    leads: Number(r.leads) || 0,
  };
}

// ══════════════════════════════════════════════════════════════
// Hydration
// ══════════════════════════════════════════════════════════════

let hydrated = false;
let hydrating = false;

/** Trailing window we keep in memory — enough for 6 monthly cycles. */
const WINDOW_DAYS = 200;

function windowStart(): string {
  return new Date(Date.now() - WINDOW_DAYS * 86400_000).toISOString().slice(0, 10);
}

async function maybeHydrate() {
  if (hydrated || hydrating || !supabase) {
    if (!supabase) setSync({ isLoading: false });
    return;
  }
  hydrating = true;
  setSync({ isLoading: true, lastError: null });
  try {
    const [connRes, insRes, leadRes] = await Promise.all([
      supabase.from('ad_connections').select('*'),
      supabase
        .from('ad_insights_daily')
        .select('*')
        .gte('day', windowStart())
        .order('day', { ascending: true }),
      supabase.from('ad_leads').select('*').order('created_time', { ascending: false }),
    ]);
    const firstErr = connRes.error || insRes.error || leadRes.error;
    if (firstErr) throw firstErr;
    set({
      connections: (connRes.data || []).map(fromDbConnection),
      insights: (insRes.data || []).map(fromDbInsight),
      adLeads: (leadRes.data || []).map(fromDbAdLead),
    });
    hydrated = true;
    setSync({ isLoading: false, lastError: null });
    subscribeRealtime();
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Marketing] Hydration failed:', err);
    hydrated = true;
    setSync({ isLoading: false, lastError: err?.message || 'Failed to load' });
  } finally {
    hydrating = false;
  }
}

function subscribeRealtime() {
  if (!supabase) return;
  const channel = supabase
    .channel('marketing-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ad_connections' },
      payload => {
        const { eventType, new: newRow, old: oldRow } = payload as any;
        if (eventType === 'DELETE') {
          set({ connections: state.connections.filter(c => c.provider !== oldRow?.provider) });
        } else {
          const mapped = fromDbConnection(newRow);
          const exists = state.connections.some(c => c.provider === mapped.provider);
          set({
            connections: exists
              ? state.connections.map(c => (c.provider === mapped.provider ? mapped : c))
              : [...state.connections, mapped],
          });
          // A fresh sync just landed — pull the new rows.
          marketingActions.refreshInsights().catch(() => {});
        }
      },
    )
    .subscribe();
  (globalThis as any).__deltMarketingChannel = channel;
}

// ══════════════════════════════════════════════════════════════
// Server API (staff JWT)
// ══════════════════════════════════════════════════════════════

const authFetch = makeAuthFetch('/ads', 'You must be signed in to manage ad accounts');

// ══════════════════════════════════════════════════════════════
// Actions
// ══════════════════════════════════════════════════════════════

export const marketingActions = {
  async refreshInsights() {
    if (!supabase) return;
    const [connRes, insRes, leadRes] = await Promise.all([
      supabase.from('ad_connections').select('*'),
      supabase
        .from('ad_insights_daily')
        .select('*')
        .gte('day', windowStart())
        .order('day', { ascending: true }),
      supabase.from('ad_leads').select('*').order('created_time', { ascending: false }),
    ]);
    if (!connRes.error && connRes.data) set({ connections: connRes.data.map(fromDbConnection) });
    if (!insRes.error && insRes.data) set({ insights: insRes.data.map(fromDbInsight) });
    if (!leadRes.error && leadRes.data) set({ adLeads: leadRes.data.map(fromDbAdLead) });
  },

  /** Pull actual lead-form submissions from Meta and reconcile vs the CRM. */
  async syncMetaLeads() {
    setSync({ isBusy: true });
    try {
      const json = await authFetch('/meta/leads/sync', { method: 'POST', body: '{}' });
      toast.success(
        `Lead forms synced — ${json.total} submissions, ${json.matched} in CRM, ${json.missing} missing.`,
      );
      await marketingActions.refreshInsights();
      return json;
    } catch (err: any) {
      toast.error(`Lead sync failed: ${err.message}`);
      throw err;
    } finally {
      setSync({ isBusy: false });
    }
  },

  /** Import missing Meta submissions into the pipeline. */
  async importMetaLeads(leadIds: string[]) {
    setSync({ isBusy: true });
    try {
      const json = await authFetch('/meta/leads/import', {
        method: 'POST',
        body: JSON.stringify({ leadIds }),
      });
      toast.success(
        `Imported ${json.imported} lead${json.imported === 1 ? '' : 's'} into the pipeline` +
          (json.skipped ? ` (${json.skipped} already present)` : '') + '.',
      );
      await Promise.all([marketingActions.refreshInsights(), refreshLeads()]);
      return json;
    } catch (err: any) {
      toast.error(`Import failed: ${err.message}`);
      throw err;
    } finally {
      setSync({ isBusy: false });
    }
  },

  /** Validate + store the Meta token server-side, then run the first sync. */
  async connectMeta(accessToken: string, adAccountId: string) {
    setSync({ isBusy: true });
    try {
      const json = await authFetch('/meta/connect', {
        method: 'POST',
        body: JSON.stringify({ accessToken, adAccountId }),
      });
      const name = json.account?.account_name || json.account?.account_id || 'Meta';
      const rows = json.sync?.rows;
      toast.success(
        rows !== undefined
          ? `Connected ${name} — pulled ${rows} days of campaign data.`
          : `Connected ${name}.`,
      );
      await marketingActions.refreshInsights();
      return json;
    } catch (err: any) {
      toast.error(`Meta connection failed: ${err.message}`);
      throw err;
    } finally {
      setSync({ isBusy: false });
    }
  },

  /** Re-pull the trailing window from Meta. */
  async syncMeta(days = 90) {
    setSync({ isBusy: true });
    try {
      const json = await authFetch('/meta/sync', {
        method: 'POST',
        body: JSON.stringify({ days }),
      });
      toast.success(`Meta synced — ${json.rows} campaign-days across ${json.campaigns} campaigns.`);
      await marketingActions.refreshInsights();
      return json;
    } catch (err: any) {
      toast.error(`Meta sync failed: ${err.message}`);
      throw err;
    } finally {
      setSync({ isBusy: false });
    }
  },

  /** Remove the stored token; keeps pulled insights for history. */
  async disconnectMeta() {
    setSync({ isBusy: true });
    try {
      await authFetch('/meta', { method: 'DELETE' });
      toast.success('Meta ad account disconnected.');
      await marketingActions.refreshInsights();
    } catch (err: any) {
      toast.error(`Disconnect failed: ${err.message}`);
      throw err;
    } finally {
      setSync({ isBusy: false });
    }
  },
};

// ══════════════════════════════════════════════════════════════
// Hooks
// ══════════════════════════════════════════════════════════════

export function useMarketing(): MarketingState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useMarketingSync(): MarketingSyncState {
  return useSyncExternalStore(subscribe, getSyncSnapshot, getSyncSnapshot);
}
