/**
 * ────────────────────────────────────────────────────────────
 * Call activity store — call_sessions + rep_meetings, by lead
 * ────────────────────────────────────────────────────────────
 * Read-mostly view over the Call Playbooks tables so the rest of the
 * CRM (lead list next-actions, lead workspace call history) can see
 * what happened on the phone. Same hydrate-on-first-subscribe pattern
 * as dealSubmissionsStore; writes stay in Call Playbooks itself.
 *
 * These tables exist only in the live Supabase project (no committed
 * migrations), so hydration failures degrade to empty state silently —
 * the pipeline must render fine without call data.
 */

import { useMemo, useSyncExternalStore } from 'react';
import { supabase } from '../../lib/supabase';

export interface LeadCallSession {
  id: string;
  createdAt: string;
  repName: string | null;
  leadId: string | null;
  disposition: string | null;
  connected: boolean;
  meetingBooked: boolean;
  durationSeconds: number;
  notes: string | null;
}

export interface LeadMeeting {
  id: string;
  leadId: string | null;
  merchantBusiness: string;
  mode: 'online' | 'in_person';
  location: string | null;
  meetingLink: string | null;
  startsAt: string;
  durationMin: number;
  repName: string | null;
  status: 'scheduled' | 'completed' | 'no_show' | 'cancelled';
}

interface CallActivityState {
  sessions: LeadCallSession[];
  meetings: LeadMeeting[];
  isLoading: boolean;
}

let state: CallActivityState = { sessions: [], meetings: [], isLoading: true };
const listeners = new Set<() => void>();

function set(patch: Partial<CallActivityState>) {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}

function fromDbSession(r: any): LeadCallSession {
  return {
    id: r.id,
    createdAt: r.created_at || '',
    repName: r.rep_name ?? null,
    leadId: r.lead_id ?? null,
    disposition: r.disposition ?? null,
    connected: Boolean(r.connected),
    meetingBooked: Boolean(r.meeting_booked),
    durationSeconds: Number(r.duration_seconds) || 0,
    notes: r.notes ?? null,
  };
}

function fromDbMeeting(r: any): LeadMeeting {
  return {
    id: r.id,
    leadId: r.lead_id ?? null,
    merchantBusiness: r.merchant_business || '',
    mode: (r.mode as LeadMeeting['mode']) || 'online',
    location: r.location ?? null,
    meetingLink: r.meeting_link ?? null,
    startsAt: r.starts_at || '',
    durationMin: Number(r.duration_min) || 30,
    repName: r.rep_name ?? null,
    status: (r.status as LeadMeeting['status']) || 'scheduled',
  };
}

let hydrated = false;
let hydrating = false;

async function load(): Promise<void> {
  if (!supabase) {
    set({ isLoading: false });
    return;
  }
  const [ss, mt] = await Promise.all([
    supabase
      .from('call_sessions')
      .select('id,created_at,rep_name,lead_id,disposition,connected,meeting_booked,duration_seconds,notes')
      .order('created_at', { ascending: false })
      .limit(2000),
    supabase
      .from('rep_meetings')
      .select('id,lead_id,merchant_business,mode,location,meeting_link,starts_at,duration_min,rep_name,status')
      .order('starts_at', { ascending: true })
      .limit(500),
  ]);
  // The call tables live only in the hosted project — a missing table (fresh
  // environment) must not break the pipeline views. Degrade to empty.
  if (ss.error || mt.error) {
    // eslint-disable-next-line no-console
    console.warn('[CallActivity] load failed (call tables missing?):', ss.error?.message || mt.error?.message);
  }
  set({
    sessions: ss.error ? [] : (ss.data || []).map(fromDbSession),
    meetings: mt.error ? [] : (mt.data || []).map(fromDbMeeting),
    isLoading: false,
  });
}

async function maybeHydrate() {
  if (hydrated || hydrating) return;
  hydrating = true;
  try {
    await load();
    hydrated = true;
  } finally {
    hydrating = false;
  }
}

export const callActivityActions = {
  /** Re-pull after a call is logged or a meeting booked. */
  async refresh(): Promise<void> {
    if (!hydrated) {
      await maybeHydrate();
      return;
    }
    await load();
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  void maybeHydrate();
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => state;

export function useCallActivityStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Call sessions (newest first) + meetings for one lead. */
export function useCallActivity(leadId: string) {
  const { sessions, meetings, isLoading } = useCallActivityStore();
  return useMemo(
    () => ({
      sessions: sessions.filter(s => s.leadId === leadId),
      meetings: meetings.filter(m => m.leadId === leadId),
      isLoading,
    }),
    [sessions, meetings, isLoading, leadId],
  );
}
