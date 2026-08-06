import React, { useMemo } from 'react';
import {
  ArrowLeft, ChevronRight, DollarSign,
} from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';
import { useMerchants, useCrmSync } from '../crmStore';
import { useResiduals, type ResidualRow } from '../residualsStore';

/**
 * Per-merchant residual detail.
 *
 * Everything here comes from `residual_rows` and the merchant record. The page
 * previously synthesised volume and fees from `id.charCodeAt()` and `Math.sin()`
 * for any merchant other than the first, and carried four further tabs —
 * interchange verification, equipment, chargebacks and batch history — with no
 * backing table between them. `residual_rows` holds volume, transaction count,
 * gross, processor fees, net and the agent split; card-level interchange,
 * devices, disputes and settlements are not stored anywhere, so those tabs are
 * gone rather than estimated.
 */

// ── Helpers ──
const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const fmt0 = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;
const fmtNum = (n: number) => new Intl.NumberFormat('en-US').format(n);

/** 'YYYY-MM' → 'Mar 2026'. */
function periodLabel(period: string): string {
  const [y, m] = period.split('-').map(Number);
  if (!y || !m) return period;
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const effRate = (r: ResidualRow) => (r.monthlyVolume > 0 ? r.grossRevenue / r.monthlyVolume : 0);
const avgTicket = (r: ResidualRow) => (r.transactionCount > 0 ? r.monthlyVolume / r.transactionCount : 0);

export function MerchantResidualDetail() {
  const { navigate, currentPage } = useAppNavigate();
  const merchants = useMerchants();
  const { isLoading: crmLoading } = useCrmSync();
  const { rows, isLoading: resLoading } = useResiduals();

  const merchantId = currentPage.split('/residuals/')[1] || '';
  const merchant = merchants.find(m => m.id === merchantId);

  const history = useMemo(
    () => rows
      .filter(r => r.merchantId === merchantId || (merchant && r.merchantName === merchant.name))
      .sort((a, b) => b.period.localeCompare(a.period)),
    [rows, merchantId, merchant],
  );

  const loading = crmLoading || resLoading;

  const Breadcrumb = (
    <div className="mb-1">
      <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-2">
        <button onClick={() => navigate('/residuals')} className="text-brand hover:underline font-medium">Residuals</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-600 font-medium">{merchant?.name ?? 'Merchant'}</span>
      </div>
      <button
        onClick={() => navigate('/residuals')}
        className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-hover font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Residuals
      </button>
    </div>
  );

  if (!merchant) {
    return (
      <div className="h-full overflow-y-auto bg-canvas">
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          {Breadcrumb}
          <div className="mt-6 bg-white rounded-[8px] border border-gray-200 px-6 py-16 text-center">
            <p className="text-sm text-gray-500">
              {loading ? 'Loading…' : 'Merchant not found.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Guarded: a merchant can easily have zero or one imported period.
  const latest = history[0];
  const prev = history[1];
  const volDelta = latest && prev && prev.monthlyVolume > 0
    ? (latest.monthlyVolume - prev.monthlyVolume) / prev.monthlyVolume
    : undefined;
  const revDelta = latest && prev && prev.netRevenue > 0
    ? (latest.netRevenue - prev.netRevenue) / prev.netRevenue
    : undefined;

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        {Breadcrumb}

        {/* ── Merchant Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4 mt-4 mb-5">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1.5">
              <h1 className="text-2xl font-bold text-gray-900">{merchant.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600">{merchant.industry}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {merchant.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              <span>Agent: <span className="font-medium text-brand">{merchant.agent}</span></span>
              <span>Plan: <span className="font-medium text-gray-700">{merchant.plan}</span></span>
            </div>
          </div>
        </div>

        {!latest ? (
          <div className="bg-white rounded-[8px] border border-gray-200 px-6 py-16 text-center">
            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">No residual periods yet</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {loading
                ? 'Loading…'
                : 'Rows appear here once a processor report covering this merchant is imported on Residuals.'}
            </p>
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
              <KpiCard label="Monthly Volume" value={fmt0(latest.monthlyVolume)} delta={volDelta} sub={prev ? 'vs. prior period' : periodLabel(latest.period)} accent="indigo" />
              <KpiCard label="Net Revenue" value={fmt(latest.netRevenue)} delta={revDelta} sub="Delt + Agent" accent="emerald" />
              <KpiCard label="Effective Rate" value={fmtPct(effRate(latest))} sub={`Avg ticket ${fmt(avgTicket(latest))}`} accent="blue" />
              <KpiCard label="Agent Share" value={fmt(latest.agentShare)} sub={latest.agent} accent="indigo" />
              <KpiCard label="Delt Net" value={fmt(latest.deltNet)} sub="After agent split" accent="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
              {/* Monthly History Table */}
              <Card title="Monthly Residual History" sub={`${history.length} imported ${history.length === 1 ? 'period' : 'periods'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {['Period', 'Volume', 'Txns', 'Gross Rev', 'Proc Fees', 'Net Rev', 'Agent', 'Delt Net', 'Eff Rate', 'Avg Ticket'].map(h => (
                          <Th key={h}>{h}</Th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((r, i) => (
                        <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${i === 0 ? 'bg-indigo-50/30' : ''}`}>
                          <td className={`px-3 py-2.5 text-sm font-semibold ${i === 0 ? 'text-brand' : 'text-gray-900'}`}>{periodLabel(r.period)}</td>
                          <td className="px-3 py-2.5 text-sm tabular-nums text-gray-900">{fmt0(r.monthlyVolume)}</td>
                          <td className="px-3 py-2.5 text-sm tabular-nums text-gray-600">{fmtNum(r.transactionCount)}</td>
                          <td className="px-3 py-2.5 text-sm tabular-nums text-gray-900">{fmt(r.grossRevenue)}</td>
                          <td className="px-3 py-2.5 text-sm tabular-nums text-red-600">{fmt(r.processorFees)}</td>
                          <td className="px-3 py-2.5 text-sm tabular-nums font-semibold text-gray-900">{fmt(r.netRevenue)}</td>
                          <td className="px-3 py-2.5 text-sm tabular-nums text-brand">{fmt(r.agentShare)}</td>
                          <td className="px-3 py-2.5 text-sm tabular-nums font-semibold text-emerald-600">{fmt(r.deltNet)}</td>
                          <td className="px-3 py-2.5 text-sm tabular-nums text-gray-700">{fmtPct(effRate(r))}</td>
                          <td className="px-3 py-2.5 text-sm tabular-nums text-gray-700">{fmt(avgTicket(r))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Right sidebar */}
              <div className="space-y-6">
                <Card title="Volume Trend" sub={`${history.length} imported ${history.length === 1 ? 'period' : 'periods'}`}>
                  <div className="flex items-end justify-between gap-1 h-16 px-1">
                    {[...history].reverse().map((r, i, arr) => {
                      const mx = Math.max(...arr.map(x => x.monthlyVolume)) || 1;
                      const isLast = i === arr.length - 1;
                      return (
                        <div key={r.id} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={`w-full max-w-[24px] rounded ${isLast ? 'bg-brand' : 'bg-brand/20'}`}
                            style={{ height: `${Math.max((r.monthlyVolume / mx) * 100, 6)}%`, transition: 'height 0.5s ease' }}
                          />
                          <span className="text-[9px] text-gray-400">{periodLabel(r.period).slice(0, 3)}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card title="Account Details">
                  <div className="space-y-2.5">
                    {[
                      { l: 'Industry', v: merchant.industry },
                      { l: 'Status', v: merchant.status },
                      { l: 'Plan', v: merchant.plan },
                      { l: 'Agent', v: merchant.agent },
                      merchant.contactName ? { l: 'Contact', v: merchant.contactName } : null,
                      merchant.contactEmail ? { l: 'Email', v: merchant.contactEmail } : null,
                      merchant.contactPhone ? { l: 'Phone', v: merchant.contactPhone } : null,
                      merchant.state ? { l: 'State', v: merchant.state } : null,
                    ].filter(Boolean).map((r, i) => (
                      <div key={i} className="flex justify-between items-start gap-3">
                        <span className="text-xs text-gray-500 shrink-0 min-w-[90px]">{r!.l}</span>
                        <span className="text-xs text-right font-medium text-gray-900">{r!.v}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Agent Split">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-[8px] bg-indigo-50 flex items-center justify-center text-sm font-bold text-brand">
                      {latest.agent.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{latest.agent}</p>
                      <p className="text-[11px] text-gray-500">{periodLabel(latest.period)}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-[8px] p-3 flex gap-3">
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-gray-500 mb-0.5">Agent</p>
                      <p className="text-base font-bold text-brand">{fmt(latest.agentShare)}</p>
                    </div>
                    <div className="w-px bg-gray-200" />
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-gray-500 mb-0.5">Delt</p>
                      <p className="text-base font-bold text-emerald-600">{fmt(latest.deltNet)}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{children}</th>;
}

function Card({ title, sub, children, right }: { title: string; sub?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[8px] border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
        {right}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function KpiCard({ label, value, sub, accent, delta }: {
  label: string; value: string; sub?: string; accent: string; delta?: number;
}) {
  const accents: Record<string, string> = {
    indigo: 'text-brand',
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
  };
  return (
    <div className="bg-white rounded-[8px] border border-gray-200 px-4 py-3.5">
      <p className="text-[11px] text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${accents[accent] ?? 'text-gray-900'}`}>{value}</p>
      <div className="flex items-center gap-1.5 mt-1">
        {delta !== undefined && (
          <span className={`text-[11px] font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {delta >= 0 ? '+' : ''}{(delta * 100).toFixed(1)}%
          </span>
        )}
        {sub && <span className="text-[11px] text-gray-400">{sub}</span>}
      </div>
    </div>
  );
}
