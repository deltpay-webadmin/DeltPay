// ── AI Usage card ──
// Reads the ai_usage ledger written by the AI edge functions and answers the
// phase-1 question: what did AI cost this month, and who spent it.
// Staff-only by RLS (ai_usage_staff_read); renders nothing useful to others.

import React, { useEffect, useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { supabase } from '../../lib/supabase';

const COBALT = '#4A7EFF';
const INK_MUTED = '#98A6C2';
const HAIRLINE = '#2E3F6B';

interface DailyRow {
  day: string;
  subject_type: string;
  feature: string;
  provider: string;
  model: string;
  calls: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
}

interface UsageRow {
  user_id: string;
  cost_usd: number;
  created_at: string;
}

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: n < 1 ? 4 : 2 });

const FEATURE_LABELS: Record<string, string> = {
  lens_chat: 'Lens AI chat',
  statement_analyzer: 'Statement Analyzer',
};

export function AiUsageCard() {
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [byUser, setByUser] = useState<{ name: string; cost: number; calls: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) {
        setError('Supabase is not configured');
        setLoading(false);
        return;
      }
      const since = new Date(Date.now() - 30 * 864e5).toISOString();

      const [dailyRes, usageRes, staffRes] = await Promise.all([
        supabase.from('ai_usage_daily').select('*').gte('day', since.slice(0, 10)).order('day'),
        supabase.from('ai_usage').select('user_id, cost_usd, created_at').gte('created_at', since),
        supabase.from('staff_profiles').select('id, full_name, email'),
      ]);
      if (!active) return;

      if (dailyRes.error) {
        setError(dailyRes.error.message);
        setLoading(false);
        return;
      }
      setDaily((dailyRes.data ?? []) as DailyRow[]);

      // ai_usage.user_id has no FK to staff_profiles, so resolve names client-side.
      const names = new Map<string, string>(
        (staffRes.data ?? []).map((s: { id: string; full_name?: string; email?: string }) => [
          s.id,
          s.full_name || s.email || s.id.slice(0, 8),
        ]),
      );
      const totals = new Map<string, { cost: number; calls: number }>();
      for (const r of (usageRes.data ?? []) as UsageRow[]) {
        const key = names.get(r.user_id) ?? `${r.user_id.slice(0, 8)}…`;
        const cur = totals.get(key) ?? { cost: 0, calls: 0 };
        cur.cost += Number(r.cost_usd);
        cur.calls += 1;
        totals.set(key, cur);
      }
      setByUser(
        [...totals.entries()]
          .map(([name, v]) => ({ name, ...v }))
          .sort((a, b) => b.cost - a.cost),
      );
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthKey = monthStart.toISOString().slice(0, 10);

  const monthRows = daily.filter(r => r.day >= monthKey);
  const monthCost = monthRows.reduce((a, r) => a + Number(r.cost_usd), 0);
  const monthCalls = monthRows.reduce((a, r) => a + Number(r.calls), 0);
  const avgCall = monthCalls ? monthCost / monthCalls : 0;

  // Cost per day for the trend, zero-filled so gaps read as zero not as a break.
  const trend = (() => {
    const byDay = new Map<string, number>();
    for (const r of daily) byDay.set(r.day, (byDay.get(r.day) ?? 0) + Number(r.cost_usd));
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - (29 - i) * 864e5).toISOString().slice(0, 10);
      return { day: d, cost: byDay.get(d) ?? 0 };
    });
  })();

  const byFeature = (() => {
    const m = new Map<string, { cost: number; calls: number }>();
    for (const r of monthRows) {
      const cur = m.get(r.feature) ?? { cost: 0, calls: 0 };
      cur.cost += Number(r.cost_usd);
      cur.calls += Number(r.calls);
      m.set(r.feature, cur);
    }
    return [...m.entries()].map(([k, v]) => ({ feature: k, ...v })).sort((a, b) => b.cost - a.cost);
  })();

  return (
    <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" />
          AI Usage &amp; Cost
        </h2>
        <span className="text-xs text-gray-400">Month to date &middot; last 30 days</span>
      </div>

      {loading ? (
        <p className="px-5 py-6 text-sm text-gray-400">Loading usage…</p>
      ) : error ? (
        <div className="px-5 py-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500">Could not load AI usage: {error}</p>
        </div>
      ) : monthCalls === 0 ? (
        <p className="px-5 py-6 text-sm text-gray-400">
          No AI usage recorded yet. Ask Lens a question or analyze a statement and it will appear here.
        </p>
      ) : (
        <div className="px-5 py-4 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Tile label="Spend this month" value={usd(monthCost)} />
            <Tile label="AI calls" value={monthCalls.toLocaleString()} />
            <Tile label="Average per call" value={usd(avgCall)} />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Daily spend — last 30 days</p>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke={HAIRLINE} strokeWidth={1} />
                <XAxis
                  dataKey="day"
                  tickFormatter={(d: string) => d.slice(5)}
                  interval={6}
                  tickLine={false}
                  axisLine={{ stroke: HAIRLINE }}
                  tick={{ fill: INK_MUTED, fontSize: 11 }}
                />
                <YAxis
                  tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                  width={52}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: INK_MUTED, fontSize: 11 }}
                />
                <Tooltip
                  formatter={(v: number) => usd(v)}
                  contentStyle={{ background: '#0E1730', border: `1px solid ${HAIRLINE}`, borderRadius: 6, fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke={COBALT}
                  strokeWidth={2}
                  fill={COBALT}
                  fillOpacity={0.1}
                  isAnimationActive={false}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Breakdown
              title="By feature"
              rows={byFeature.map(f => ({
                label: FEATURE_LABELS[f.feature] ?? f.feature,
                sub: `${f.calls.toLocaleString()} call${f.calls === 1 ? '' : 's'}`,
                value: usd(f.cost),
              }))}
            />
            <Breakdown
              title="By user — last 30 days"
              rows={byUser.map(u => ({
                label: u.name,
                sub: `${u.calls.toLocaleString()} call${u.calls === 1 ? '' : 's'}`,
                value: usd(u.cost),
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-[6px] px-4 py-3">
      <p className="text-[11px] text-gray-500 font-medium">{label}</p>
      <p className="text-lg font-semibold text-gray-900 mt-0.5 tabular-nums">{value}</p>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { label: string; sub: string; value: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
      <div className="border border-gray-200 rounded-[6px] overflow-hidden">
        {rows.length === 0 ? (
          <p className="px-3 py-3 text-xs text-gray-400">Nothing recorded yet.</p>
        ) : (
          <table className="w-full">
            <tbody className="divide-y divide-gray-100">
              {rows.map(r => (
                <tr key={r.label}>
                  <td className="px-3 py-2">
                    <p className="text-sm text-gray-700">{r.label}</p>
                    <p className="text-[11px] text-gray-400">{r.sub}</p>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium tabular-nums align-top">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
