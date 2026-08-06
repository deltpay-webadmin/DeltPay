import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  TrendingDown,
  Eye,
  X,
  Megaphone,
  ExternalLink,
  Banknote,
} from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';
import { useMerchants, useCrmSync, type Merchant, type PlanTier } from '../crmStore';
import { useResiduals } from '../residualsStore';
import { computeHealthFlags } from '../bookHealth';

/**
 * Retention watchlist.
 *
 * The only genuine churn signal in the codebase is the volume-decline flag in
 * bookHealth.ts, computed from imported residual periods. Risk scores, portal
 * logins, support-ticket counts and contact recency have no data source, so
 * they are not shown rather than invented. Merchant.healthScore is a real
 * column but nothing ever computes it — fromDbMerchant defaults every row to
 * 75 — so it is deliberately not surfaced as a risk score.
 */

interface WatchlistRow {
  merchantName: string;
  note: string;
  merchant?: Merchant;
  volumeTrend: number[];
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function planBadgeCls(plan: PlanTier) {
  switch (plan) {
    case 'Free': return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'Growth': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Custom': return 'bg-purple-50 text-purple-700 border-purple-200';
  }
}

// Sparkline
function Sparkline({ data, color = '#2E6BFF' }: { data: number[]; color?: string }) {
  if (data.length < 2) return <span className="text-xs text-gray-400">Not enough periods</span>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 140;
  const h = 36;
  const pad = 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${pad},${h - pad} ${points} ${w - pad},${h - pad}`;

  return (
    <svg width={w} height={h} className="block">
      <polygon points={areaPoints} fill={color} opacity={0.1} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ════════════════════════════════
// Main Component
// ════════════════════════════════
export function BackendRetention() {
  const { navigate } = useAppNavigate();
  const merchants = useMerchants();
  const { rows, isLoading } = useResiduals();
  const { isLoading: crmLoading } = useCrmSync();
  const [selected, setSelected] = useState<WatchlistRow | null>(null);

  const watchlist = useMemo<WatchlistRow[]>(() => {
    // Infinity: this is the full watchlist, not the dashboard's 3-item nudge.
    const flags = computeHealthFlags(rows, Infinity);
    const byMerchant = new Map<string, number[]>();
    for (const r of [...rows].sort((a, b) => a.period.localeCompare(b.period))) {
      const t = byMerchant.get(r.merchantName) ?? [];
      t.push(r.monthlyVolume);
      byMerchant.set(r.merchantName, t);
    }
    return flags.map(f => ({
      merchantName: f.merchant,
      note: f.note,
      merchant: merchants.find(m => m.name === f.merchant),
      volumeTrend: byMerchant.get(f.merchant) ?? [],
    }));
  }, [rows, merchants]);

  const periodCount = useMemo(() => new Set(rows.map(r => r.period)).size, [rows]);
  const loading = isLoading || crmLoading;

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-500 mt-1">
          Merchants whose processing volume is slipping, based on imported residual periods.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard icon={ShieldAlert} label="Merchants Flagged" value={String(watchlist.length)} sub="Volume decline or no processing" variant="amber" />
        <SummaryCard icon={Banknote} label="Volume At Risk" value={fmt(watchlist.reduce((s, w) => s + (w.merchant?.monthlyVolume ?? 0), 0))} sub="Monthly volume on flagged accounts" variant="red" />
        <SummaryCard icon={TrendingDown} label="Periods Imported" value={String(periodCount)} sub="Two or more needed to compare" variant="blue" />
      </div>

      {/* Outreach cross-link */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-[8px] border border-indigo-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
            <Megaphone className="w-4.5 h-4.5 text-brand" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Follow up with flagged merchants from Outreach</p>
            <p className="text-xs text-gray-500 mt-0.5">Log calls and nudges against the account so the next agent can see what's already been tried.</p>
          </div>
        </div>
        <button onClick={() => navigate('/outreach')} className="px-4 py-2 bg-brand text-white text-xs font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-1.5 shrink-0">View Outreach <ExternalLink className="w-3 h-3" /></button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Volume Decline Watchlist</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Compares the two most recent residual periods &middot; flags a drop over 25% or no processing at all
          </p>
        </div>

        {watchlist.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            {loading
              ? 'Loading…'
              : periodCount < 2
                ? 'At least two residual periods are needed to spot a decline. Import another processor report on Residuals.'
                : 'No merchants are showing a volume decline in the latest period.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Merchant Name</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Signal</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Plan Tier</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Monthly Volume</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Agent</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {watchlist.map(w => (
                  <tr
                    key={w.merchantName}
                    onClick={() => setSelected(w)}
                    className="transition-colors cursor-pointer border-l-[3px] border-l-amber-500 bg-amber-50/30 hover:bg-amber-50/50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{w.merchantName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 text-[11px] font-medium border rounded-md whitespace-nowrap bg-amber-50 text-amber-700 border-amber-200">
                        {w.note}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {w.merchant ? (
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium border rounded-md ${planBadgeCls(w.merchant.plan)}`}>
                          {w.merchant.plan}
                        </span>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {w.merchant ? fmt(w.merchant.monthlyVolume) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{w.merchant?.agent ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelected(w)}
                          className="p-1.5 hover:bg-indigo-50 rounded-md text-gray-400 hover:text-indigo-600 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && <DetailPanel row={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ── Summary Card ──
function SummaryCard({ icon: Icon, label, value, sub, variant }: {
  icon: React.ElementType; label: string; value: string; sub: string;
  variant: 'amber' | 'red' | 'blue';
}) {
  const map = {
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
    red: { bg: 'bg-red-50', icon: 'text-red-600' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  };
  const v = map[variant];
  return (
    <div className="bg-white rounded-[8px] border border-gray-200 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{label}</p>
        <div className={`w-9 h-9 ${v.bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${v.icon}`} />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs mt-2 text-gray-500">{sub}</p>
    </div>
  );
}

// ── Detail Panel ──
function DetailPanel({ row, onClose }: { row: WatchlistRow; onClose: () => void }) {
  return (
    <div className="bg-white rounded-[8px] border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{row.merchantName}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{row.note}</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors" title="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">Volume Trend</p>
          <Sparkline data={row.volumeTrend} color="#DC2626" />
          <p className="text-xs text-gray-400 mt-1.5">
            {row.volumeTrend.length} imported {row.volumeTrend.length === 1 ? 'period' : 'periods'}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium mb-2">Account</p>
          {row.merchant ? (
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between"><dt className="text-gray-500">Plan</dt><dd className="text-gray-900">{row.merchant.plan}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Monthly volume</dt><dd className="text-gray-900">{fmt(row.merchant.monthlyVolume)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Agent</dt><dd className="text-gray-900">{row.merchant.agent}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="text-gray-900">{row.merchant.status}</dd></div>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">
              This name appears in the residual report but isn't matched to a merchant record yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
