// ── AI Usage card ──
// Compact Reports-page summary of the ai_usage ledger: what did AI cost
// this month, and who spent it. Reads the shared aiUsageStore (also
// consumed by the AI Management tab on Lens AI, which is the deep view).
// Staff-only by RLS (ai_usage_staff_read); renders nothing useful to others.

import React, { useMemo } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAiUsage, useAiUsageSync, mtdByUser, dailyTrend, byFeature } from './aiUsageStore';

// recharts can't read CSS variables, so the chart palette is hard-coded.
export const COBALT = '#4A7EFF';
export const INK_MUTED = '#98A6C2';
export const HAIRLINE = '#2E3F6B';

export const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: n < 1 ? 4 : 2 });

export const FEATURE_LABELS: Record<string, string> = {
  lens_chat: 'Lens AI chat',
  statement_analyzer: 'Statement Analyzer',
};

export function AiUsageCard() {
  const usage = useAiUsage();
  const { isLoading, lastError } = useAiUsageSync();

  const perUser = useMemo(() => mtdByUser(usage), [usage]);
  const trend = useMemo(() => dailyTrend(usage, 30), [usage]);
  const features = useMemo(() => byFeature(usage), [usage]);

  const names = useMemo(() => new Map(usage.staff.map(s => [s.id, s.name])), [usage.staff]);

  const monthCost = perUser.reduce((a, u) => a + u.costUsd, 0);
  const monthCalls = perUser.reduce((a, u) => a + u.calls, 0);
  const avgCall = monthCalls ? monthCost / monthCalls : 0;

  return (
    <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" />
          AI Usage &amp; Cost
        </h2>
        <span className="text-xs text-gray-400">Month to date &middot; last 30 days</span>
      </div>

      {isLoading ? (
        <p className="px-5 py-6 text-sm text-gray-400">Loading usage…</p>
      ) : lastError ? (
        <div className="px-5 py-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500">Could not load AI usage: {lastError}</p>
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
              rows={features.map(f => ({
                label: FEATURE_LABELS[f.feature] ?? f.feature,
                sub: `${f.calls.toLocaleString()} call${f.calls === 1 ? '' : 's'}`,
                value: usd(f.costUsd),
              }))}
            />
            <Breakdown
              title="By user — month to date"
              rows={perUser
                .filter(u => u.calls > 0)
                .map(u => ({
                  label: names.get(u.userId) ?? `${u.userId.slice(0, 8)}…`,
                  sub: `${u.calls.toLocaleString()} call${u.calls === 1 ? '' : 's'}`,
                  value: usd(u.costUsd),
                }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-[6px] px-4 py-3">
      <p className="text-[11px] text-gray-500 font-medium">{label}</p>
      <p className="text-lg font-semibold text-gray-900 mt-0.5 tabular-nums">{value}</p>
    </div>
  );
}

export function Breakdown({ title, rows }: { title: string; rows: { label: string; sub: string; value: string }[] }) {
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
