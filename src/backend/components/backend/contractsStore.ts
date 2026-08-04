/**
 * ────────────────────────────────────────────────────────────
 * Delt CRM — Contracts / E-Sign store (DocuSign)
 * ────────────────────────────────────────────────────────────
 * Mirrors the crmStore/plaidStore pattern: hydrate once on first
 * subscription, stream realtime changes from Supabase, expose
 * hooks + actions.
 *
 * Reads come straight from the `contracts` table (RLS: staff only).
 * Sends / status refreshes / voids go through the `docusign` edge
 * function with the signed-in user's JWT — DocuSign credentials
 * never touch the browser.
 */

import { useSyncExternalStore, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// ══════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════

/** Schedule A terms embedded in the agreement (mirrors the edge function). */
export interface AgreementTerms {
  merchantLegalName: string;
  dbaName?: string;
  stateOfFormation?: string;
  ein?: string;
  businessAddress?: string;
  purchasePrice: number;
  purchasedAmount: number;
  factorRate: number;
  remittancePct?: number;
  dailyRemittance?: number;
  remittanceFrequency?: 'Daily' | 'Weekly' | 'Monthly';
  remittanceMethod?: 'ACH' | 'Split Funding' | 'Lockbox';
  effectiveDate: string; // YYYY-MM-DD
  principalState?: string;
  hasGuarantor: boolean;
  guarantorName?: string;
  noticeEmail?: string; // defaults server-side to the merchant signer's email
  // Exhibit B designated bank account — optional; when omitted the merchant
  // fills them as required DocuSign text tabs at signing time
  bankName?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  bankAccountType?: string;
}

export type ContractStatus =
  | 'draft'
  | 'sent'
  | 'delivered'
  | 'completed'
  | 'declined'
  | 'voided';

export interface Contract {
  id: string;
  merchantId: string | null;
  merchantName: string;
  dealId: string | null;
  signerName: string;
  signerEmail: string;
  signerTitle: string | null;
  guarantorName: string | null;
  guarantorEmail: string | null;
  terms: AgreementTerms;
  envelopeId: string | null;
  status: ContractStatus;
  docusignStatus: string | null;
  lastError: string | null;
  sentAt: string | null;
  completedAt: string | null;
  createdAt: string;
  kind: 'mca' | 'deal_application';
  submissionId: string | null;
  signedStoragePath: string | null;
}

export interface DocusignConfig {
  configured: boolean;
  env: string;
  tokenOk: boolean;
  tokenError: string | null;
  accountId: string | null;
  consentUrl: string | null;
  hasCountersigner: boolean;
}

/** Payload for sending a new agreement. */
export interface SendContractRequest {
  merchantId?: string;
  merchantName: string;
  dealId?: string;
  signerName: string;
  signerEmail: string;
  signerTitle?: string;
  guarantorName?: string;
  guarantorEmail?: string;
  terms: AgreementTerms;
}

interface ContractsState {
  contracts: Contract[];
  config: DocusignConfig | null;
}

interface ContractsSyncState {
  isLoading: boolean;
  busy: string[]; // contract ids (or 'send') with an in-flight operation
  lastError: string | null;
}

// ══════════════════════════════════════════════════════════════
// Store
// ══════════════════════════════════════════════════════════════

let state: ContractsState = { contracts: [], config: null };
let sync: ContractsSyncState = { isLoading: isSupabaseConfigured, busy: [], lastError: null };

const listeners = new Set<() => void>();

function set(next: Partial<ContractsState>) {
  state = { ...state, ...next };
  listeners.forEach(l => l());
}

function setSync(next: Partial<ContractsSyncState>) {
  sync = { ...sync, ...next };
  listeners.forEach(l => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  maybeHydrate();
  return () => listeners.delete(cb);
}

const getSyncSnapshot = () => sync;

function markBusy(key: string, on: boolean) {
  setSync({ busy: on ? [...sync.busy, key] : sync.busy.filter(k => k !== key) });
}

// ══════════════════════════════════════════════════════════════
// Mappers
// ══════════════════════════════════════════════════════════════

function fromDb(r: any): Contract {
  return {
    id: r.id,
    merchantId: r.merchant_id ?? null,
    merchantName: r.merchant_name ?? '',
    dealId: r.deal_id ?? null,
    signerName: r.signer_name ?? '',
    signerEmail: r.signer_email ?? '',
    signerTitle: r.signer_title ?? null,
    guarantorName: r.guarantor_name ?? null,
    guarantorEmail: r.guarantor_email ?? null,
    terms: r.terms ?? {},
    envelopeId: r.envelope_id ?? null,
    status: (r.status ?? 'draft') as ContractStatus,
    docusignStatus: r.docusign_status ?? null,
    lastError: r.last_error ?? null,
    sentAt: r.sent_at ?? null,
    completedAt: r.completed_at ?? null,
    createdAt: r.created_at ?? '',
    kind: (r.kind ?? 'mca') as 'mca' | 'deal_application',
    submissionId: r.submission_id ?? null,
    signedStoragePath: r.signed_storage_path ?? null,
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
    const res = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
    if (res.error) throw res.error;
    set({ contracts: (res.data || []).map(fromDb) });
    hydrated = true;
    setSync({ isLoading: false, lastError: null });
    subscribeRealtime();
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Contracts] Hydration failed:', err);
    hydrated = true;
    setSync({ isLoading: false, lastError: err?.message || 'Failed to load' });
  } finally {
    hydrating = false;
  }
  contractActions.checkConfig().catch(() => {});
}

function subscribeRealtime() {
  if (!supabase) return;
  const channel = supabase
    .channel('contracts-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'contracts' },
      payload => {
        const { eventType, new: newRow, old: oldRow } = payload as any;
        if (eventType === 'DELETE') {
          set({ contracts: state.contracts.filter(c => c.id !== oldRow?.id) });
        } else {
          const mapped = fromDb(newRow);
          const exists = state.contracts.some(c => c.id === mapped.id);
          set({
            contracts: exists
              ? state.contracts.map(c => (c.id === mapped.id ? mapped : c))
              : [mapped, ...state.contracts],
          });
        }
      },
    )
    .subscribe();
  (globalThis as any).__deltContractsChannel = channel;
}

// ══════════════════════════════════════════════════════════════
// Edge function API
// ══════════════════════════════════════════════════════════════

async function callDocusign(body: Record<string, unknown>): Promise<any> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) throw new Error('You must be signed in to use e-sign');
  const { data, error } = await supabase.functions.invoke('docusign', { body });
  if (error) {
    // FunctionsHttpError carries the response; surface the server's message.
    let msg = error.message || 'Request failed';
    try {
      const ctx = await (error as any).context?.json?.();
      if (ctx?.error) msg = ctx.error;
    } catch { /* keep generic message */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

// ══════════════════════════════════════════════════════════════
// E-sign draft hand-off (Deal/Merchant pages → Documents page)
// ══════════════════════════════════════════════════════════════

let pendingDraft: Partial<SendContractRequest> | null = null;

/** Stash a prefilled request, then navigate('/documents') to open the modal. */
export function stageEsignDraft(draft: Partial<SendContractRequest>) {
  pendingDraft = draft;
}

/** One-shot read of the staged draft (Documents page calls this on mount). */
export function consumeEsignDraft(): Partial<SendContractRequest> | null {
  const d = pendingDraft;
  pendingDraft = null;
  return d;
}

// ══════════════════════════════════════════════════════════════
// Actions
// ══════════════════════════════════════════════════════════════

export const contractActions = {
  async refresh() {
    if (!supabase) return;
    const res = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
    if (!res.error && res.data) set({ contracts: res.data.map(fromDb) });
  },

  /** Is DocuSign configured server-side? (never returns secrets) */
  async checkConfig(): Promise<DocusignConfig | null> {
    try {
      const json = await callDocusign({ action: 'check-config' });
      const config: DocusignConfig = {
        configured: Boolean(json.configured),
        env: json.env ?? 'demo',
        tokenOk: Boolean(json.token_ok),
        tokenError: json.token_error ?? json.account_error ?? null,
        accountId: json.account_id ?? null,
        consentUrl: json.consent_url ?? null,
        hasCountersigner: Boolean(json.has_countersigner),
      };
      set({ config });
      return config;
    } catch {
      return null;
    }
  },

  /** Render the agreement from terms, create the envelope, send for signature. */
  async send(req: SendContractRequest): Promise<Contract> {
    markBusy('send', true);
    try {
      const json = await callDocusign({ action: 'send', ...req });
      const contract = fromDb(json.contract);
      const exists = state.contracts.some(c => c.id === contract.id);
      set({
        contracts: exists
          ? state.contracts.map(c => (c.id === contract.id ? contract : c))
          : [contract, ...state.contracts],
      });
      toast.success(`Agreement sent to ${req.signerEmail} for signature.`);
      return contract;
    } catch (err: any) {
      toast.error(`Send failed: ${err.message}`);
      throw err;
    } finally {
      markBusy('send', false);
    }
  },

  /** Send the Delt merchant application from a deal submission for e-signature. */
  async sendApplication(req: { submissionId: string; signerName?: string; signerEmail?: string }): Promise<Contract> {
    markBusy('send', true);
    try {
      const json = await callDocusign({ action: 'send-application', ...req });
      const contract = fromDb(json.contract);
      const exists = state.contracts.some(c => c.id === contract.id);
      set({
        contracts: exists
          ? state.contracts.map(c => (c.id === contract.id ? contract : c))
          : [contract, ...state.contracts],
      });
      toast.success(`Application sent to ${contract.signerEmail} for signature.`);
      return contract;
    } catch (err: any) {
      toast.error(`Send failed: ${err.message}`);
      throw err;
    } finally {
      markBusy('send', false);
    }
  },

  /** Pull the envelope's live status from DocuSign and sync the row. */
  async refreshStatus(contractId: string, opts?: { silent?: boolean }): Promise<Contract | null> {
    markBusy(contractId, true);
    try {
      const json = await callDocusign({ action: 'status', contractId });
      const contract = fromDb(json.contract);
      set({ contracts: state.contracts.map(c => (c.id === contract.id ? contract : c)) });
      return contract;
    } catch (err: any) {
      if (!opts?.silent) toast.error(`Status refresh failed: ${err.message}`);
      return null;
    } finally {
      markBusy(contractId, false);
    }
  },

  /**
   * Background-sync every in-flight envelope (sent/delivered) with DocuSign.
   * Runs once per page visit so statuses update without manual refreshes.
   */
  async refreshInFlight(): Promise<void> {
    const inFlight = state.contracts
      .filter(c => (c.status === 'sent' || c.status === 'delivered') && c.envelopeId)
      .slice(0, 10);
    if (!inFlight.length) return;
    const results = await Promise.allSettled(
      inFlight.map(c => contractActions.refreshStatus(c.id, { silent: true })),
    );
    const changed = results.filter(
      (r, i) => r.status === 'fulfilled' && r.value && r.value.status !== inFlight[i].status,
    ).length;
    if (changed) toast.info?.(`${changed} agreement${changed === 1 ? '' : 's'} changed status.`);
  },

  /** Void an in-flight envelope. */
  async void(contractId: string, reason?: string): Promise<boolean> {
    markBusy(contractId, true);
    try {
      const json = await callDocusign({ action: 'void', contractId, reason });
      const contract = fromDb(json.contract);
      set({ contracts: state.contracts.map(c => (c.id === contract.id ? contract : c)) });
      toast.success('Envelope voided.');
      return true;
    } catch (err: any) {
      toast.error(`Void failed: ${err.message}`);
      return false;
    } finally {
      markBusy(contractId, false);
    }
  },
};

// ══════════════════════════════════════════════════════════════
// Hooks
// ══════════════════════════════════════════════════════════════

export function useContracts() {
  const selector = useCallback(() => state.contracts, []);
  return useSyncExternalStore(subscribe, selector, selector);
}

export function useDocusignConfig() {
  const selector = useCallback(() => state.config, []);
  return useSyncExternalStore(subscribe, selector, selector);
}

export function useContractsSync() {
  return useSyncExternalStore(subscribe, getSyncSnapshot, getSyncSnapshot);
}
