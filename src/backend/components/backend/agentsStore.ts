/**
 * ────────────────────────────────────────────────────────────
 * Agents store — Supabase-backed sales team roster
 * ────────────────────────────────────────────────────────────
 * Backs the Agents page with the real `public.agents` table (the
 * same rows the DB resolves assigned_agent names against). Follows
 * the standard store pattern: hydrate on first hook subscription,
 * realtime channel for cross-session updates, writes go straight
 * to Supabase and refresh local state.
 */

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';

export interface AgentRecord {
  id: string;
  orgId: string;
  name: string;
  email: string;
  userId: string | null;
  status: string;        // 'active' | 'inactive'
  /** Residual split as a fraction (0.5 = 50%). Null until assigned. */
  split: number | null;
  createdAt: string;
}

interface AgentsState {
  agents: AgentRecord[];
  isLoading: boolean;
  isOnline: boolean;
}

let state: AgentsState = {
  agents: [],
  isLoading: true,
  isOnline: false,
};

const listeners = new Set<() => void>();

function set(patch: Partial<AgentsState>) {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}

function fromDbAgent(r: any): AgentRecord {
  return {
    id: r.id,
    orgId: r.org_id,
    name: r.name,
    email: r.email || '',
    userId: r.user_id ?? null,
    status: r.status || 'active',
    split: r.split === null || r.split === undefined ? null : Number(r.split),
    createdAt: r.created_at || '',
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
      .from('agents')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    set({ agents: (data || []).map(fromDbAgent), isLoading: false, isOnline: true });
    hydrated = true;
    subscribeRealtime();
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Agents] Hydration failed:', err);
    hydrated = true;
    set({ isLoading: false, isOnline: false });
  } finally {
    hydrating = false;
  }
}

function subscribeRealtime() {
  if (!supabase) return;
  const channel = supabase
    .channel('agents-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'agents' },
      payload => {
        const { eventType, new: newRow, old: oldRow } = payload as any;
        if (eventType === 'DELETE') {
          set({ agents: state.agents.filter(a => a.id !== oldRow?.id) });
        } else {
          const mapped = fromDbAgent(newRow);
          const exists = state.agents.some(a => a.id === mapped.id);
          set({
            agents: exists
              ? state.agents.map(a => (a.id === mapped.id ? mapped : a))
              : [...state.agents, mapped].sort((a, b) => a.name.localeCompare(b.name)),
          });
        }
      },
    )
    .subscribe();
  (globalThis as any).__deltAgentsChannel = channel;
}

async function refresh(): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('name', { ascending: true });
  if (!error) set({ agents: (data || []).map(fromDbAgent), isOnline: true });
}

export interface InviteResult {
  ok: boolean;
  emailSent?: boolean;
  /** Hand-off link when the invite email could not be delivered. */
  inviteLink?: string;
  error?: string;
}

export const agentActions = {
  /**
   * Full onboarding: auth invite email + agents row + org membership,
   * via the admin-users edge function (service-role work never runs in
   * the browser). Works for agents and for admin/viewer staff invites.
   */
  async invite(input: { name: string; email: string; role?: 'agent' | 'admin' | 'viewer'; split?: number | null }): Promise<InviteResult> {
    if (!supabase) return { ok: false, error: 'Supabase is not configured.' };
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: {
        action: 'invite',
        name: input.name,
        email: input.email,
        role: input.role ?? 'agent',
        split: input.split ?? null,
      },
    });
    if (error) {
      // supabase-js wraps non-2xx responses; surface the function's message.
      let message = error.message;
      try {
        const ctx = (error as any).context;
        if (ctx && typeof ctx.json === 'function') {
          const payload = await ctx.json();
          if (payload?.error) message = payload.error;
        }
      } catch { /* keep the generic message */ }
      return { ok: false, error: message };
    }
    await refresh();
    return { ok: true, emailSent: Boolean(data?.emailSent), inviteLink: data?.inviteLink };
  },

  /** Insert an agent row directly (no portal login). Returns the record or null. */
  async create(input: { orgId: string; name: string; email: string; split?: number | null }): Promise<AgentRecord | null> {
    if (!supabase) {
      toast.error('Supabase is not configured — cannot save the agent.');
      return null;
    }
    const { data, error } = await supabase
      .from('agents')
      .insert({
        org_id: input.orgId,
        name: input.name,
        email: input.email || null,
        split: input.split ?? null,
        status: 'active',
      })
      .select('*')
      .single();
    if (error || !data) {
      toast.error(`Couldn't save the agent: ${error?.message ?? 'unknown error'}`);
      return null;
    }
    await refresh();
    return fromDbAgent(data);
  },

  async update(id: string, patch: { name?: string; email?: string; split?: number | null; status?: string }): Promise<boolean> {
    if (!supabase) return false;
    const out: Record<string, any> = {};
    if (patch.name !== undefined) out.name = patch.name;
    if (patch.email !== undefined) out.email = patch.email || null;
    if (patch.split !== undefined) out.split = patch.split;
    if (patch.status !== undefined) out.status = patch.status;
    const { error } = await supabase.from('agents').update(out).eq('id', id);
    if (error) {
      toast.error(`Couldn't update the agent: ${error.message}`);
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

export function useAgents() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
