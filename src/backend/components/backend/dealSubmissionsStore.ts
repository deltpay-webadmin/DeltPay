/**
 * ────────────────────────────────────────────────────────────
 * Deal submissions store — the agent MPA/deal pipeline
 * ────────────────────────────────────────────────────────────
 * Backs the agent "Submit a Deal" flow and the admin Agent Desk.
 * Rows move Submitted → Underwriting → Approved → Activated → Paid
 * (or Declined). Same pattern as residualsStore: hydrate on first
 * hook subscription, writes refresh, offline no-op without Supabase.
 */

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';
import { activationBonus } from './agentComp';

export type SubmissionStatus =
  | 'Submitted'
  | 'Underwriting'
  | 'Approved'
  | 'Activated'
  | 'Paid'
  | 'Declined';

export const SUBMISSION_PIPELINE: SubmissionStatus[] = [
  'Submitted',
  'Underwriting',
  'Approved',
  'Activated',
  'Paid',
];

export type BoardingChannel = 'Square' | 'Luqra' | 'Paysafe';

export const BOARDING_CHANNELS: BoardingChannel[] = ['Square', 'Luqra', 'Paysafe'];

export interface DealSubmission {
  id: string;
  agentId: string | null;
  agentName: string;
  /** Originating pipeline lead — the spine link that makes Plaid, contracts
   * and underwriting hang together for one prospect. */
  leadId: string | null;
  channel: BoardingChannel | null;
  merchantName: string;
  contactName: string;
  phone: string;
  email: string;
  vertical: string;
  monthlyVolume: number;
  wantsPos: boolean;
  wantsCapital: boolean;
  notes: string;
  status: SubmissionStatus;
  expectedBonus: number;
  createdAt: string;
  updatedAt: string;
  activatedAt: string | null;
}

interface SubmissionsState {
  submissions: DealSubmission[];
  isLoading: boolean;
  isOnline: boolean;
}

let state: SubmissionsState = { submissions: [], isLoading: true, isOnline: false };
const listeners = new Set<() => void>();

function set(patch: Partial<SubmissionsState>) {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}

function fromDb(r: any): DealSubmission {
  return {
    id: r.id,
    agentId: r.agent_id ?? null,
    agentName: r.agent_name || 'Unassigned',
    leadId: r.lead_id ?? null,
    channel: (r.channel as BoardingChannel | null) ?? null,
    merchantName: r.merchant_name,
    contactName: r.contact_name || '',
    phone: r.phone || '',
    email: r.email || '',
    vertical: r.vertical || '',
    monthlyVolume: Number(r.monthly_volume) || 0,
    wantsPos: Boolean(r.wants_pos),
    wantsCapital: Boolean(r.wants_capital),
    notes: r.notes || '',
    status: r.status as SubmissionStatus,
    expectedBonus: Number(r.expected_bonus) || 0,
    createdAt: r.created_at || '',
    updatedAt: r.updated_at || '',
    activatedAt: r.activated_at ?? null,
  };
}

let hydrated = false;
let hydrating = false;

async function maybeHydrate() {
  if (hydrated || hydrating) return;
  if (!supabase) {
    hydrated = true;
    set({ isLoading: false, isOnline: false });
    return;
  }
  hydrating = true;
  try {
    const { data, error } = await supabase
      .from('deal_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    set({ submissions: (data || []).map(fromDb), isLoading: false, isOnline: true });
    hydrated = true;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[DealSubmissions] Hydration failed:', err);
    hydrated = true;
    set({ isLoading: false, isOnline: false });
    toast.error('Unable to load deal submissions.');
  } finally {
    hydrating = false;
  }
}

async function refresh(): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('deal_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  if (!error) set({ submissions: (data || []).map(fromDb), isOnline: true });
}

export interface SubmissionInput {
  agentId: string | null;
  agentName: string;
  merchantName: string;
  contactName: string;
  phone: string;
  email: string;
  vertical: string;
  monthlyVolume: number;
  wantsPos: boolean;
  wantsCapital: boolean;
  notes: string;
}

export const dealSubmissionActions = {
  async submit(input: SubmissionInput): Promise<boolean> {
    if (!supabase) {
      toast.error('Supabase is not configured — cannot submit the deal.');
      return false;
    }
    const { error } = await supabase.from('deal_submissions').insert({
      agent_id: input.agentId,
      agent_name: input.agentName,
      merchant_name: input.merchantName,
      contact_name: input.contactName,
      phone: input.phone,
      email: input.email,
      vertical: input.vertical,
      monthly_volume: input.monthlyVolume,
      wants_pos: input.wantsPos,
      wants_capital: input.wantsCapital,
      notes: input.notes,
      expected_bonus: activationBonus(input.monthlyVolume, input.wantsPos || input.wantsCapital),
    });
    if (error) {
      // eslint-disable-next-line no-console
      console.error('[DealSubmissions] Submit failed:', error);
      toast.error(`Couldn't submit the deal: ${error.message}`);
      return false;
    }
    await refresh();
    return true;
  },

  /**
   * Create (or reuse) the deal submission for a pipeline lead — the "Start
   * deal" action. Idempotent: an open (non-Declined) submission already
   * linked to this lead is returned instead of creating a duplicate.
   */
  async createFromLead(lead: {
    id: string;
    businessName: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    industry?: string;
    monthlySales?: string;
    type?: string;
    products?: string[];
    assignedAgent?: string;
  }): Promise<string | null> {
    if (!supabase) {
      toast.error('Supabase is not configured — cannot start a deal.');
      return null;
    }
    const { data: existing } = await supabase
      .from('deal_submissions')
      .select('id')
      .eq('lead_id', lead.id)
      .neq('status', 'Declined')
      .limit(1)
      .maybeSingle();
    if (existing?.id) return existing.id as string;

    const monthlyVolume = parseFloat((lead.monthlySales || '').replace(/[^0-9.]/g, '')) || 0;
    const wantsCapital = lead.type === 'MCA' || (lead.products ?? []).includes('Capital');
    const { data, error } = await supabase
      .from('deal_submissions')
      .insert({
        lead_id: lead.id,
        agent_name: lead.assignedAgent || '',
        merchant_name: lead.businessName,
        contact_name: lead.contactName || null,
        phone: lead.contactPhone || null,
        email: lead.contactEmail || null,
        vertical: lead.industry || null,
        monthly_volume: monthlyVolume,
        wants_pos: false,
        wants_capital: wantsCapital,
        notes: '',
        expected_bonus: activationBonus(monthlyVolume, wantsCapital),
      })
      .select('id')
      .single();
    if (error) {
      // eslint-disable-next-line no-console
      console.error('[DealSubmissions] createFromLead failed:', error);
      toast.error(`Couldn't start the deal: ${error.message}`);
      return null;
    }
    await refresh();
    return data.id as string;
  },

  async setChannel(id: string, channel: BoardingChannel | null): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('deal_submissions')
      .update({ channel, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast.error(`Couldn't set the channel: ${error.message}`);
      return false;
    }
    await refresh();
    return true;
  },

  async setStatus(id: string, status: SubmissionStatus): Promise<boolean> {
    if (!supabase) return false;
    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    // Stamp activation once so quarter attribution (leaderboard, Fast Start
    // windows) survives later edits to the row.
    const existing = state.submissions.find(s => s.id === id);
    if (status === 'Activated' && !existing?.activatedAt) {
      patch.activated_at = new Date().toISOString();
    }
    const { error } = await supabase.from('deal_submissions').update(patch).eq('id', id);
    if (error) {
      toast.error(`Couldn't update the deal: ${error.message}`);
      return false;
    }
    await refresh();
    return true;
  },

  /**
   * Confirm the merchant's actual monthly volume (comp plan: bands ≥$400 are
   * set by the first full month of real processing) and recompute the bonus.
   */
  async reband(id: string, actualMonthlyVolume: number): Promise<boolean> {
    if (!supabase) return false;
    const existing = state.submissions.find(s => s.id === id);
    if (!existing) return false;
    const expected = activationBonus(actualMonthlyVolume, existing.wantsPos || existing.wantsCapital);
    const { error } = await supabase
      .from('deal_submissions')
      .update({
        monthly_volume: actualMonthlyVolume,
        expected_bonus: expected,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) {
      toast.error(`Couldn't confirm the volume: ${error.message}`);
      return false;
    }
    toast.success(`Bonus re-banded to ${expected.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}.`);
    await refresh();
    return true;
  },

  refresh,
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  void maybeHydrate();
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => state;

export function useDealSubmissions() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
