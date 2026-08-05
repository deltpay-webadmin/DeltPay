/**
 * ────────────────────────────────────────────────────────────
 * Deal desk store — agent ↔ ops support threads
 * ────────────────────────────────────────────────────────────
 * Agents raise deal/merchant questions in-portal; ops answers them.
 * Threads carry a status (Open/Answered/Closed); messages are a flat
 * list keyed by thread. Same store pattern as residualsStore.
 */

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';

export type ThreadStatus = 'Open' | 'Answered' | 'Closed';

export interface DeskThread {
  id: string;
  agentId: string | null;
  agentName: string;
  subject: string;
  merchantName: string;
  status: ThreadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DeskMessage {
  id: string;
  threadId: string;
  authorName: string;
  fromOps: boolean;
  body: string;
  createdAt: string;
}

interface DeskState {
  threads: DeskThread[];
  messages: DeskMessage[];
  isLoading: boolean;
  isOnline: boolean;
}

let state: DeskState = { threads: [], messages: [], isLoading: true, isOnline: false };
const listeners = new Set<() => void>();

function set(patch: Partial<DeskState>) {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}

function threadFromDb(r: any): DeskThread {
  return {
    id: r.id,
    agentId: r.agent_id ?? null,
    agentName: r.agent_name || 'Unassigned',
    subject: r.subject,
    merchantName: r.merchant_name || '',
    status: r.status as ThreadStatus,
    createdAt: r.created_at || '',
    updatedAt: r.updated_at || '',
  };
}

function messageFromDb(r: any): DeskMessage {
  return {
    id: r.id,
    threadId: r.thread_id,
    authorName: r.author_name || '',
    fromOps: Boolean(r.from_ops),
    body: r.body,
    createdAt: r.created_at || '',
  };
}

let hydrated = false;
let hydrating = false;

async function loadAll() {
  const [threadsRes, messagesRes] = await Promise.all([
    supabase!.from('deal_desk_threads').select('*').order('updated_at', { ascending: false }),
    supabase!.from('deal_desk_messages').select('*').order('created_at', { ascending: true }),
  ]);
  if (threadsRes.error) throw threadsRes.error;
  if (messagesRes.error) throw messagesRes.error;
  set({
    threads: (threadsRes.data || []).map(threadFromDb),
    messages: (messagesRes.data || []).map(messageFromDb),
    isLoading: false,
    isOnline: true,
  });
}

async function maybeHydrate() {
  if (hydrated || hydrating) return;
  if (!supabase) {
    hydrated = true;
    set({ isLoading: false, isOnline: false });
    return;
  }
  hydrating = true;
  try {
    await loadAll();
    hydrated = true;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[DealDesk] Hydration failed:', err);
    hydrated = true;
    set({ isLoading: false, isOnline: false });
    toast.error('Unable to load the deal desk.');
  } finally {
    hydrating = false;
  }
}

async function refresh(): Promise<void> {
  if (!supabase) return;
  try {
    await loadAll();
  } catch {
    /* transient — next action retries */
  }
}

export const dealDeskActions = {
  async createThread(input: {
    agentId: string | null;
    agentName: string;
    subject: string;
    merchantName: string;
    body: string;
  }): Promise<boolean> {
    if (!supabase) {
      toast.error('Supabase is not configured — cannot open a thread.');
      return false;
    }
    const { data: thread, error } = await supabase
      .from('deal_desk_threads')
      .insert({
        agent_id: input.agentId,
        agent_name: input.agentName,
        subject: input.subject,
        merchant_name: input.merchantName,
      })
      .select('id')
      .single();
    if (error || !thread) {
      toast.error(`Couldn't open the thread: ${error?.message ?? 'unknown error'}`);
      return false;
    }
    const { error: msgErr } = await supabase.from('deal_desk_messages').insert({
      thread_id: thread.id,
      author_name: input.agentName,
      from_ops: false,
      body: input.body,
    });
    if (msgErr) toast.error(`Thread opened but the message failed: ${msgErr.message}`);
    await refresh();
    return true;
  },

  async reply(threadId: string, authorName: string, fromOps: boolean, body: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('deal_desk_messages').insert({
      thread_id: threadId,
      author_name: authorName,
      from_ops: fromOps,
      body,
    });
    if (error) {
      toast.error(`Couldn't send the reply: ${error.message}`);
      return false;
    }
    const { error: statusErr } = await supabase
      .from('deal_desk_threads')
      .update({ status: fromOps ? 'Answered' : 'Open', updated_at: new Date().toISOString() })
      .eq('id', threadId);
    if (statusErr) toast.error(`Reply sent but the thread status didn't update: ${statusErr.message}`);
    await refresh();
    return true;
  },

  async setStatus(threadId: string, status: ThreadStatus): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('deal_desk_threads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', threadId);
    if (error) {
      toast.error(`Couldn't update the thread: ${error.message}`);
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

export function useDealDesk() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
