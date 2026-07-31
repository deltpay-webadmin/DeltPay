// ── AI Management tab ──
// Admin-only view inside Lens AI: per-credentialed-user AI usage, spend
// trend, and monthly spending caps. Caps are soft enforcement — the edge
// functions reject over-cap calls with 402 quota_exceeded and log a
// 'blocked' ledger row, which this tab surfaces per user.
// Visibility gating lives in BackendLensAI; the real write gate is the
// admin-only RLS policy on ai_quotas.

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Pencil,
  RefreshCw,
  ShieldBan,
  X,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  useAiUsage,
  useAiUsageSync,
  aiUsageActions,
  mtdByUser,
  dailyTrend,
  byFeature,
  byModel,
  capFor,
  monthStartUtc,
  type UserMtd,
  type StaffInfo,
} from './aiUsageStore';
import { Tile, Breakdown, usd, FEATURE_LABELS, COBALT, INK_MUTED, HAIRLINE } from './AiUsageCard';

export function AiManagementTab() {
  const usage = useAiUsage();
  const { isLoading, isBusy, lastError } = useAiUsageSync();

  const perUser = useMemo(() => mtdByUser(usage), [usage]);
  const trend = useMemo(() => dailyTrend(usage, 30), [usage]);
  const features = useMemo(() => byFeature(usage), [usage]);
  const models = useMemo(() => byModel(usage), [usage]);

  const monthCost = perUser.reduce((a, u) => a + u.costUsd, 0);
  const monthCalls = perUser.reduce((a, u) => a + u.calls, 0);
  const monthBlocked = perUser.reduce((a, u) => a + u.blocked, 0);
  const activeUsers = perUser.filter(u => u.calls > 0 || u.blocked > 0).length;

  // One table row per staff member with activity or a personal cap, plus any
  // non-staff user_ids that show up in the ledger (customers, removed staff).
  const staffById = useMemo(() => new Map(usage.staff.map(s => [s.id, s])), [usage.staff]);
  const rows = useMemo(() => {
    const ids = new Set<string>();
    perUser.forEach(u => ids.add(u.userId));
    usage.quotas.filter(q => q.scope === 'user').forEach(q => ids.add(q.scopeId));
    const mtd = new Map(perUser.map(u => [u.userId, u]));
    return [...ids]
      .map(id => ({
        userId: id,
        staff: staffById.get(id) ?? null,
        mtd: mtd.get(id) ?? { userId: id, calls: 0, tokens: 0, costUsd: 0, blocked: 0 },
        cap: capFor(usage, id, staffById.has(id) ? 'staff' : 'customer'),
      }))
      .sort((a, b) => b.mtd.costUsd - a.mtd.costUsd);
  }, [perUser, usage, staffById]);

  if (isLoading) {
    return <p className="py-10 text-sm text-gray-400 text-center">Loading AI usage…</p>;
  }
  if (lastError) {
    return (
      <div className="bg-white rounded-[8px] border border-gray-200 px-5 py-4 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-gray-500">Could not load AI usage: {lastError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile label="Spend this month" value={usd(monthCost)} />
        <Tile label="AI calls" value={monthCalls.toLocaleString()} />
        <Tile label="Average per call" value={usd(monthCalls ? monthCost / monthCalls : 0)} />
        <Tile label="Active users" value={activeUsers.toLocaleString()} />
      </div>
      {monthBlocked > 0 && (
        <div className="flex items-center gap-2 -mt-3">
          <ShieldBan className="w-3.5 h-3.5 text-red-500" />
          <p className="text-xs text-red-600">
            {monthBlocked.toLocaleString()} call{monthBlocked === 1 ? '' : 's'} blocked by spending caps this month.
          </p>
        </div>
      )}

      {/* ── Trend ── */}
      <div className="bg-white rounded-[8px] border border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Daily spend — last 30 days</p>
          <button
            onClick={() => aiUsageActions.refresh()}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            title="Refresh usage data"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
        <ResponsiveContainer width="100%" height={160}>
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

      {/* ── Per-user table ── */}
      <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Usage by user — month to date</h2>
          <span className="text-xs text-gray-400">Caps are monthly, reset on the 1st (UTC)</span>
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">
            No AI usage recorded yet. Ask Lens a question or analyze a statement and it will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-2.5 font-medium">User</th>
                  <th className="px-3 py-2.5 font-medium text-right">Calls</th>
                  <th className="px-3 py-2.5 font-medium text-right">Tokens</th>
                  <th className="px-3 py-2.5 font-medium text-right">Spend</th>
                  <th className="px-3 py-2.5 font-medium text-right">Blocked</th>
                  <th className="px-3 py-2.5 font-medium">Monthly cap</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(r => (
                  <UserRow key={r.userId} row={r} isBusy={isBusy} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Breakdowns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Breakdown
          title="By feature — month to date"
          rows={features.map(f => ({
            label: FEATURE_LABELS[f.feature] ?? f.feature,
            sub: `${f.calls.toLocaleString()} call${f.calls === 1 ? '' : 's'}`,
            value: usd(f.costUsd),
          }))}
        />
        <Breakdown
          title="By model — month to date"
          rows={models.map(m => ({
            label: m.model.split('/').pop() ?? m.model,
            sub: `${m.provider} · ${m.calls.toLocaleString()} call${m.calls === 1 ? '' : 's'}`,
            value: usd(m.costUsd),
          }))}
        />
      </div>
    </div>
  );
}

// ── Per-user row with inline cap editor + drill-down ──

interface RowData {
  userId: string;
  staff: StaffInfo | null;
  mtd: UserMtd;
  cap: number | null;
}

function UserRow({ row, isBusy }: { row: RowData; isBusy: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const name = row.staff?.name ?? `${row.userId.slice(0, 8)}…`;
  const role = row.staff?.role ?? (row.staff ? 'agent' : 'external');
  const utilization = row.cap != null && row.cap > 0 ? row.mtd.costUsd / row.cap : null;

  const startEdit = () => {
    setDraft(row.cap != null ? String(row.cap) : '');
    setEditing(true);
  };
  const save = async () => {
    const v = draft.trim() === '' ? null : Number(draft);
    if (v != null && (!Number.isFinite(v) || v < 0)) return;
    try {
      await aiUsageActions.setQuota(row.userId, v);
      setEditing(false);
    } catch {
      // Toast already shown; keep the editor open so the value isn't lost.
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50/60">
        <td className="px-5 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-gray-400 hover:text-gray-600"
              title={expanded ? 'Collapse' : 'Show detail'}
            >
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            <div>
              <p className="text-sm text-gray-800 font-medium">{name}</p>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  role === 'admin'
                    ? 'bg-indigo-50 text-indigo-600'
                    : role === 'external'
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {role}
              </span>
            </div>
          </div>
        </td>
        <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">{row.mtd.calls.toLocaleString()}</td>
        <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">{row.mtd.tokens.toLocaleString()}</td>
        <td className="px-3 py-3 text-sm text-gray-900 text-right font-medium tabular-nums">{usd(row.mtd.costUsd)}</td>
        <td className="px-3 py-3 text-sm text-right tabular-nums">
          {row.mtd.blocked > 0 ? (
            <span className="text-red-600 font-medium">{row.mtd.blocked}</span>
          ) : (
            <span className="text-gray-300">0</span>
          )}
        </td>
        <td className="px-3 py-3 min-w-[190px]">
          {editing ? (
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-400">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') save();
                  if (e.key === 'Escape') setEditing(false);
                }}
                placeholder="No cap"
                autoFocus
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-[6px] focus:outline-none focus:border-indigo-400"
              />
              <button
                onClick={save}
                disabled={isBusy}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded disabled:opacity-40"
                title="Save cap (empty = remove)"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditing(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {row.cap == null ? (
                <span className="text-sm text-gray-400">No cap</span>
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-700 tabular-nums">{usd(row.cap)}</span>
                    {utilization != null && (
                      <span
                        className={`text-[11px] tabular-nums ${
                          utilization >= 1 ? 'text-red-600' : utilization >= 0.8 ? 'text-amber-600' : 'text-gray-400'
                        }`}
                      >
                        {Math.round(utilization * 100)}%
                      </span>
                    )}
                  </div>
                  {utilization != null && (
                    <div className="h-1 mt-1 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          utilization >= 1 ? 'bg-red-500' : utilization >= 0.8 ? 'bg-amber-400' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, utilization * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={startEdit}
                className="p-1 text-gray-300 hover:text-gray-600 rounded"
                title="Edit monthly cap"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </td>
        <td className="px-3 py-3" />
      </tr>
      {expanded && <UserDetailRow userId={row.userId} />}
    </>
  );
}

/** Drill-down: this user's MTD by-feature/by-model rollup and recent calls. */
function UserDetailRow({ userId }: { userId: string }) {
  const usage = useAiUsage();
  const since = monthStartUtc().toISOString();
  const mine = usage.recent.filter(r => r.userId === userId);
  const mineMtd = mine.filter(r => r.createdAt >= since && r.status === 'ok');

  const roll = (key: (r: (typeof mine)[number]) => string) => {
    const m = new Map<string, { calls: number; costUsd: number }>();
    for (const r of mineMtd) {
      const k = key(r);
      const cur = m.get(k) ?? { calls: 0, costUsd: 0 };
      cur.calls += 1;
      cur.costUsd += r.costUsd;
      m.set(k, cur);
    }
    return [...m.entries()].map(([label, v]) => ({ label, ...v })).sort((a, b) => b.costUsd - a.costUsd);
  };
  const feats = roll(r => FEATURE_LABELS[r.feature] ?? r.feature);
  const mods = roll(r => r.model.split('/').pop() ?? r.model);
  const recent = mine.slice(0, 10);

  return (
    <tr>
      <td colSpan={7} className="px-5 py-4 bg-gray-50/60">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <MiniList title="By feature" rows={feats.map(f => ({ label: f.label, value: usd(f.costUsd), sub: `${f.calls} calls` }))} />
          <MiniList title="By model" rows={mods.map(m => ({ label: m.label, value: usd(m.costUsd), sub: `${m.calls} calls` }))} />
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent calls</p>
            {recent.length === 0 ? (
              <p className="text-xs text-gray-400">No calls in the last 90 days.</p>
            ) : (
              <div className="space-y-1">
                {recent.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 truncate">
                      {new Date(r.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      {' · '}
                      {FEATURE_LABELS[r.feature] ?? r.feature}
                    </span>
                    {r.status === 'blocked' ? (
                      <span className="text-red-600 font-medium shrink-0 ml-2">blocked</span>
                    ) : r.status === 'error' ? (
                      <span className="text-amber-600 shrink-0 ml-2">error</span>
                    ) : (
                      <span className="text-gray-700 tabular-nums shrink-0 ml-2">{usd(r.costUsd)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

function MiniList({ title, rows }: { title: string; rows: { label: string; sub: string; value: string }[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-400">Nothing this month.</p>
      ) : (
        <div className="space-y-1">
          {rows.map(r => (
            <div key={r.label} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 truncate">
                {r.label} <span className="text-gray-400">· {r.sub}</span>
              </span>
              <span className="text-gray-800 tabular-nums shrink-0 ml-2">{r.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
