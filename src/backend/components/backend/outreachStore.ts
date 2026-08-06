/**
 * ────────────────────────────────────────────────────────────
 * Delt CRM — per-lead outreach engagement store
 * ────────────────────────────────────────────────────────────
 * Mirrors the crmStore/plaidStore pattern (hydrate once, stream realtime,
 * expose hooks), scoped to the CRM connect-link campaign so the lead
 * panel can show sent → opened → clicked without loading the full
 * Outreach analytics page. Reads only: outreach_events is written by
 * service-role edge functions (send route, email-track, Plaid confirm).
 *
 * RLS: readable with leads.view — agents included. Only the Outreach
 * analytics PAGE is gated by integrations.view; this per-lead read is not.
 */

import { useSyncExternalStore, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const CONNECT_LINK_CAMPAIGN = 'crm-connect-link';

export interface OutreachEvent {
  id: number;
  createdAt: string;
  leadId: string | null;
  leadEmail: string | null;
  event: 'sent' | 'opened' | 'clicked' | 'responded' | 'bounced';
}

interface OutreachState {
  events: OutreachEvent[];
  isLoading: boolean;
}

let state: OutreachState = { events: [], isLoading: isSupabaseConfigured };
const listeners = new Set<() => void>();

function set(next: Partial<OutreachState>) {
  state = { ...state, ...next };
  listeners.forEach(l => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  maybeHydrate();
  return () => listeners.delete(cb);
}

function fromDb(r: any): OutreachEvent {
  return {
    id: r.id,
    createdAt: r.created_at ?? '',
    leadId: r.lead_id ?? null,
    leadEmail: r.lead_email ?? null,
    event: r.event,
  };
}

let hydrated = false;
let hydrating = false;

async function maybeHydrate() {
  if (hydrated || hydrating) return;
  if (!supabase) {
    hydrated = true;
    set({ isLoading: false });
    return;
  }
  hydrating = true;
  try {
    const { data, error } = await supabase
      .from('outreach_events')
      .select('id, created_at, lead_id, lead_email, event')
      .eq('campaign', CONNECT_LINK_CAMPAIGN)
      .order('created_at', { ascending: false })
      .limit(2000);
    if (error) throw error;
    set({ events: (data || []).map(fromDb), isLoading: false });
    hydrated = true;
    subscribeRealtime();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Outreach] Hydration failed:', err);
    hydrated = true;
    set({ isLoading: false });
  } finally {
    hydrating = false;
  }
}

function subscribeRealtime() {
  if (!supabase) return;
  const channel = supabase
    .channel('lead-outreach-sync')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'outreach_events' },
      payload => {
        const row = (payload as any).new;
        if (row?.campaign !== CONNECT_LINK_CAMPAIGN) return;
        const mapped = fromDb(row);
        if (state.events.some(e => e.id === mapped.id)) return;
        set({ events: [mapped, ...state.events] });
      },
    )
    .subscribe();
  (globalThis as any).__deltOutreachChannel = channel;
}

export interface LeadOutreachStatus {
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  respondedAt: string | null;
}

const EMPTY: LeadOutreachStatus = { sentAt: null, openedAt: null, clickedAt: null, respondedAt: null };
const statusCache = new Map<string, LeadOutreachStatus>();

/** Latest engagement per funnel step for one lead's connect-link emails. */
export function useLeadOutreach(leadId: string | null): LeadOutreachStatus {
  const selector = useCallback(() => {
    if (!leadId) return EMPTY;
    let sentAt: string | null = null;
    let openedAt: string | null = null;
    let clickedAt: string | null = null;
    let respondedAt: string | null = null;
    // events are newest-first; keep the most recent timestamp per step.
    for (const e of state.events) {
      if (e.leadId !== leadId) continue;
      if (e.event === 'sent' && !sentAt) sentAt = e.createdAt;
      else if (e.event === 'opened' && !openedAt) openedAt = e.createdAt;
      else if (e.event === 'clicked' && !clickedAt) clickedAt = e.createdAt;
      else if (e.event === 'responded' && !respondedAt) respondedAt = e.createdAt;
    }
    // Return a cached object when nothing changed so useSyncExternalStore
    // doesn't loop on a fresh reference every render.
    const key = `${leadId}:${sentAt}:${openedAt}:${clickedAt}:${respondedAt}`;
    const cached = statusCache.get(key);
    if (cached) return cached;
    const next = { sentAt, openedAt, clickedAt, respondedAt };
    statusCache.set(key, next);
    return next;
  }, [leadId]);
  return useSyncExternalStore(subscribe, selector, selector);
}
