/**
 * ────────────────────────────────────────────────────────────
 * Delt CRM — AI usage & quota store
 * ────────────────────────────────────────────────────────────
 * Single data layer for everything AI-cost-related in the CRM: the
 * AI Management tab on Lens AI and the summary card on Reports both
 * read from here, so the ledger is fetched once, not per component.
 *
 * Reads (RLS: staff only):
 *   • ai_usage_daily — per-day rollup of ok calls (spend/trend/breakdowns)
 *   • ai_usage       — raw ledger rows incl. error/blocked (per-user MTD,
 *                      blocked counts, drill-down; the daily view hides
 *                      non-ok rows by design)
 *   • staff_profiles — id → name/email/role (no FK from ai_usage.user_id)
 *   • ai_quotas      — monthly caps (writes are admin-only by RLS)
 *
 * Month boundary is UTC first-of-month, matching checkQuota() in
 * supabase/functions/_shared/metering.ts.
 */

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// ══════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════

export interface AiDailyRow {
  day: string; // YYYY-MM-DD
  subjectType: string;
  feature: string;
  provider: string;
  model: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export interface AiUsageRow {
  userId: string;
  subjectType: string;
  feature: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  status: string; // ok | error | blocked
  createdAt: string;
}

export interface StaffInfo {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
}

export interface AiQuotaRow {
  scope: 'user' | 'default';
  scopeId: string;
  monthlyCostCapUsd: number | null;
}

interface AiUsageState {
  daily: AiDailyRow[];
  recent: AiUsageRow[];
  staff: StaffInfo[];
  quotas: AiQuotaRow[];
}

interface AiUsageSyncState {
  isLoading: boolean;
  isBusy: boolean;
  lastError: string | null;
}

// ══════════════════════════════════════════════════════════════
// Store
// ══════════════════════════════════════════════════════════════

let state: AiUsageState = { daily: [], recent: [], staff: [], quotas: [] };
let sync: AiUsageSyncState = { isLoading: isSupabaseConfigured, isBusy: false, lastError: null };

const listeners = new Set<() => void>();

function set(next: Partial<AiUsageState>) {
  state = { ...state, ...next };
  listeners.forEach(l => l());
}

function setSync(next: Partial<AiUsageSyncState>) {
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

function fromDbDaily(r: any): AiDailyRow {
  return {
    day: r.day,
    subjectType: r.subject_type,
    feature: r.feature,
    provider: r.provider,
    model: r.model,
    calls: Number(r.calls) || 0,
    inputTokens: Number(r.input_tokens) || 0,
    outputTokens: Number(r.output_tokens) || 0,
    costUsd: Number(r.cost_usd) || 0,
  };
}

function fromDbUsage(r: any): AiUsageRow {
  return {
    userId: r.user_id,
    subjectType: r.subject_type,
    feature: r.feature,
    provider: r.provider,
    model: r.model,
    inputTokens: Number(r.input_tokens) || 0,
    outputTokens: Number(r.output_tokens) || 0,
    costUsd: Number(r.cost_usd) || 0,
    status: r.status ?? 'ok',
    createdAt: r.created_at,
  };
}

function fromDbStaff(r: any): StaffInfo {
  return {
    id: r.id,
    name: r.full_name || r.email || r.id.slice(0, 8),
    email: r.email ?? null,
    role: r.role ?? null,
  };
}

function fromDbQuota(r: any): AiQuotaRow {
  return {
    scope: r.scope,
    scopeId: r.scope_id,
    monthlyCostCapUsd: r.monthly_cost_cap_usd == null ? null : Number(r.monthly_cost_cap_usd),
  };
}

// ══════════════════════════════════════════════════════════════
// Hydration
// ══════════════════════════════════════════════════════════════

let hydrated = false;
let hydrating = false;

/** Trailing ledger window kept in memory — trend needs 30d, drill-down 90d. */
const WINDOW_DAYS = 90;

function windowStartIso(): string {
  return new Date(Date.now() - WINDOW_DAYS * 86400_000).toISOString();
}

async function fetchAll() {
  if (!supabase) return;
  const since = windowStartIso();
  const [dailyRes, usageRes, staffRes, quotaRes] = await Promise.all([
    supabase.from('ai_usage_daily').select('*').gte('day', since.slice(0, 10)).order('day'),
    supabase
      .from('ai_usage')
      .select('user_id, subject_type, feature, provider, model, input_tokens, output_tokens, cost_usd, status, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5000),
    supabase.from('staff_profiles').select('id, full_name, email, role'),
    supabase.from('ai_quotas').select('scope, scope_id, monthly_cost_cap_usd'),
  ]);
  const firstErr = dailyRes.error || usageRes.error || staffRes.error || quotaRes.error;
  if (firstErr) throw firstErr;
  set({
    daily: (dailyRes.data || []).map(fromDbDaily),
    recent: (usageRes.data || []).map(fromDbUsage),
    staff: (staffRes.data || []).map(fromDbStaff),
    quotas: (quotaRes.data || []).map(fromDbQuota),
  });
}

async function maybeHydrate() {
  if (hydrated || hydrating || !supabase) {
    if (!supabase) setSync({ isLoading: false });
    return;
  }
  hydrating = true;
  setSync({ isLoading: true, lastError: null });
  try {
    await fetchAll();
    hydrated = true;
    setSync({ isLoading: false, lastError: null });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[AiUsage] Hydration failed:', err);
    hydrated = true;
    setSync({ isLoading: false, lastError: err?.message || 'Failed to load' });
  } finally {
    hydrating = false;
  }
}

// ══════════════════════════════════════════════════════════════
// Derived helpers — pure functions over state, shared by the
// Management tab and the Reports card.
// ══════════════════════════════════════════════════════════════

/** UTC first-of-month, mirroring checkQuota() server-side. */
export function monthStartUtc(): Date {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export interface UserMtd {
  userId: string;
  calls: number;
  tokens: number;
  costUsd: number;
  blocked: number;
}

/** Month-to-date rollup per user from the raw ledger rows. */
export function mtdByUser(s: AiUsageState): UserMtd[] {
  const since = monthStartUtc().toISOString();
  const m = new Map<string, UserMtd>();
  for (const r of s.recent) {
    if (r.createdAt < since) continue;
    const cur = m.get(r.userId) ?? { userId: r.userId, calls: 0, tokens: 0, costUsd: 0, blocked: 0 };
    if (r.status === 'blocked') {
      cur.blocked += 1;
    } else if (r.status === 'ok') {
      cur.calls += 1;
      cur.tokens += r.inputTokens + r.outputTokens;
      cur.costUsd += r.costUsd;
    }
    m.set(r.userId, cur);
  }
  return [...m.values()].sort((a, b) => b.costUsd - a.costUsd);
}

/** Daily total spend, zero-filled so gaps read as zero not as a break. */
export function dailyTrend(s: AiUsageState, days = 30): { day: string; cost: number }[] {
  const byDay = new Map<string, number>();
  for (const r of s.daily) byDay.set(r.day, (byDay.get(r.day) ?? 0) + r.costUsd);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 864e5).toISOString().slice(0, 10);
    return { day: d, cost: byDay.get(d) ?? 0 };
  });
}

function mtdDailyRows(s: AiUsageState): AiDailyRow[] {
  const monthKey = monthStartUtc().toISOString().slice(0, 10);
  return s.daily.filter(r => r.day >= monthKey);
}

export function byFeature(s: AiUsageState): { feature: string; calls: number; costUsd: number }[] {
  const m = new Map<string, { calls: number; costUsd: number }>();
  for (const r of mtdDailyRows(s)) {
    const cur = m.get(r.feature) ?? { calls: 0, costUsd: 0 };
    cur.calls += r.calls;
    cur.costUsd += r.costUsd;
    m.set(r.feature, cur);
  }
  return [...m.entries()].map(([feature, v]) => ({ feature, ...v })).sort((a, b) => b.costUsd - a.costUsd);
}

export function byModel(s: AiUsageState): { model: string; provider: string; calls: number; costUsd: number }[] {
  const m = new Map<string, { provider: string; calls: number; costUsd: number }>();
  for (const r of mtdDailyRows(s)) {
    const cur = m.get(r.model) ?? { provider: r.provider, calls: 0, costUsd: 0 };
    cur.calls += r.calls;
    cur.costUsd += r.costUsd;
    m.set(r.model, cur);
  }
  return [...m.entries()].map(([model, v]) => ({ model, ...v })).sort((a, b) => b.costUsd - a.costUsd);
}

/** The cap that applies to a user: their row, else the subject-type default. */
export function capFor(s: AiUsageState, userId: string, subjectType = 'staff'): number | null {
  const user = s.quotas.find(q => q.scope === 'user' && q.scopeId === userId);
  if (user) return user.monthlyCostCapUsd;
  const def = s.quotas.find(q => q.scope === 'default' && q.scopeId === subjectType);
  return def ? def.monthlyCostCapUsd : null;
}

// ══════════════════════════════════════════════════════════════
// Actions
// ══════════════════════════════════════════════════════════════

export const aiUsageActions = {
  async refresh() {
    if (!supabase) return;
    try {
      await fetchAll();
      setSync({ lastError: null });
    } catch (err: any) {
      setSync({ lastError: err?.message || 'Failed to refresh' });
    }
  },

  /**
   * Set (or clear, with null) a user's monthly spend cap. Admin-only by
   * RLS — a non-admin write comes back as a Postgres error and surfaces
   * in the toast, which is the server-side gate doing its job.
   */
  async setQuota(userId: string, capUsd: number | null) {
    if (!supabase) return;
    setSync({ isBusy: true });
    try {
      if (capUsd == null) {
        const { error } = await supabase
          .from('ai_quotas')
          .delete()
          .match({ scope: 'user', scope_id: userId });
        if (error) throw error;
        set({ quotas: state.quotas.filter(q => !(q.scope === 'user' && q.scopeId === userId)) });
        toast.success('Spending cap removed.');
      } else {
        const { data: session } = await supabase.auth.getSession();
        const { error } = await supabase.from('ai_quotas').upsert({
          scope: 'user',
          scope_id: userId,
          monthly_cost_cap_usd: capUsd,
          updated_by: session.session?.user?.id ?? null,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
        const next = state.quotas.filter(q => !(q.scope === 'user' && q.scopeId === userId));
        set({ quotas: [...next, { scope: 'user', scopeId: userId, monthlyCostCapUsd: capUsd }] });
        toast.success(`Monthly cap set to $${capUsd}.`);
      }
    } catch (err: any) {
      toast.error(`Could not update cap: ${err?.message || 'unknown error'}`);
      throw err;
    } finally {
      setSync({ isBusy: false });
    }
  },
};

// ══════════════════════════════════════════════════════════════
// Hooks
// ══════════════════════════════════════════════════════════════

export function useAiUsage(): AiUsageState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useAiUsageSync(): AiUsageSyncState {
  return useSyncExternalStore(subscribe, getSyncSnapshot, getSyncSnapshot);
}
