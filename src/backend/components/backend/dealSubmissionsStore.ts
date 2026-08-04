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

export interface DealSubmission {
  id: string;
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
  status: SubmissionStatus;
  expectedBonus: number;
  createdAt: string;
  updatedAt: string;
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

  async setStatus(id: string, status: SubmissionStatus): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('deal_submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast.error(`Couldn't update the deal: ${error.message}`);
      return false;
    }
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
