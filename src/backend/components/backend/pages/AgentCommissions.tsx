import React, { useMemo, useState } from 'react';
import {
  Download,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
} from 'lucide-react';
import { useCapital, type CapitalDeal } from '../capitalStore';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtFull = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

/** Commission earned on a deal: explicit commission field, else the referral commission. */
const dealCommission = (d: CapitalDeal) => d.commission ?? d.referralCommission ?? 0;

const periodOf = (d: CapitalDeal) => (d.funded || '').slice(0, 7); // 'YYYY-MM'

function periodLabelOf(period: string): string {
  const [y, m] = period.split('-').map(Number);
  if (!y || !m) return period || '—';
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function AgentCommissions() {
  const { deals, isLoading } = useCapital();

  // Deals that carry a commission for a rep/agent.
  const commissionDeals = useMemo(
    () => deals.filter(d => dealCommission(d) > 0),
    [deals],
  );

  const reps = useMemo(
    () => [...new Set(commissionDeals.map(d => d.rep).filter(Boolean) as string[])].sort(),
    [commissionDeals],
  );
  const [repChoice, setRepChoice] = useState('');
  const rep = repChoice || reps[0] || '';

  // If deals aren't attributed to reps, show the whole book so the page stays useful.
  const myDeals = useMemo(
    () => (rep ? commissionDeals.filter(d => d.rep === rep) : commissionDeals),
    [commissionDeals, rep],
  );

  const periods = useMemo(
    () => [...new Set(myDeals.map(periodOf).filter(Boolean))].sort().reverse(),
    [myDeals],
  );
  const currentPeriod = periods[0] ?? null;
  const currentDeals = myDeals.filter(d => periodOf(d) === currentPeriod);

  const totalVolume = currentDeals.reduce((s, d) => s + d.fundedAmt, 0);
  const totalEarned = currentDeals.reduce((s, d) => s + dealCommission(d), 0);
  const allPaid = currentDeals.length > 0 && currentDeals.every(d => d.commissionPaid);

  const statements = useMemo(() =>
    periods.map(p => {
      const pd = myDeals.filter(d => periodOf(d) === p);
      return {
        id: p,
        month: periodLabelOf(p),
        earned: pd.reduce((s, d) => s + dealCommission(d), 0),
        deals: pd.length,
        paid: pd.every(d => d.commissionPaid),
      };
    }),
  [periods, myDeals]);

  const exportCsv = (periodId?: string) => {
    const rows = periodId ? myDeals.filter(d => periodOf(d) === periodId) : myDeals;
    const header = ['Deal ID', 'Merchant', 'Funded', 'Funded Amount', 'Channel', 'Commission Rate', 'Commission', 'Paid'];
    const escape = (v: string | number | boolean | undefined) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [header.join(','), ...rows.map(d =>
      [d.id, d.merchant, d.funded, d.fundedAmt, d.channel, d.commissionRate ?? '', dealCommission(d), d.commissionPaid ? 'yes' : 'no'].map(escape).join(','),
    )];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = periodId ? `commissions-${periodId}.csv` : 'commissions-all.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isLoading && commissionDeals.length === 0) {
    return (
      <div className="px-6 py-6">
        <div className="bg-white rounded-[8px] border border-gray-200 py-16 text-center">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700">No commissions yet</p>
          <p className="text-xs text-gray-400 mt-1">Commissions appear here as funded deals with a commission or referral fee are recorded in Capital.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 mt-1">Track your earnings and download statements.</p>
        </div>
        <div className="flex items-center gap-3">
          {reps.length > 1 && (
            <select
              value={rep}
              onChange={e => setRepChoice(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-[6px] text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            >
              {reps.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          )}
          <button
            onClick={() => exportCsv()}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-[6px] text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>
      </div>

      {/* Current Period Card */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Current Period</h2>
          {allPaid ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              <CheckCircle className="w-3.5 h-3.5" />
              Paid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
              <Clock className="w-3.5 h-3.5" />
              Pending
            </span>
          )}
        </div>
        <div className="px-5 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Period</p>
              <p className="text-sm font-semibold text-gray-900">{currentPeriod ? periodLabelOf(currentPeriod) : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-emerald-600">{fmt(totalEarned)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Deals This Period</p>
              <p className="text-sm font-semibold text-gray-900">{currentDeals.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Volume Referred</p>
              <p className="text-sm font-semibold text-gray-900">{fmt(totalVolume)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Statement Table */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Statement{currentPeriod ? ` — ${periodLabelOf(currentPeriod)}` : ''}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Merchant</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Deal</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Funded Amount</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Rate</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Your Commission</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentDeals.map(d => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.merchant}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{d.id}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmt(d.fundedAmt)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{d.commissionRate != null ? `${(d.commissionRate * 100).toFixed(1)}%` : '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600">{fmtFull(dealCommission(d))}</td>
                  <td className="px-4 py-3 text-center">
                    {d.commissionPaid ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md"><CheckCircle className="w-3 h-3" />Paid</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-md"><Clock className="w-3 h-3" />Pending</span>
                    )}
                  </td>
                </tr>
              ))}
              {currentDeals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-400">No commission-bearing deals this period.</td>
                </tr>
              )}
            </tbody>
            {currentDeals.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-4 py-3 font-semibold text-gray-900">Total</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(totalVolume)}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">{fmtFull(totalEarned)}</td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Historical Statements */}
      {statements.length > 1 && (
        <div className="bg-white rounded-[8px] border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Historical Statements</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {statements.slice(1).map(s => (
              <div key={s.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-[8px] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.month}</p>
                    <p className="text-xs text-gray-500">{s.deals} deal{s.deals !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{fmt(s.earned)}</p>
                    {s.paid ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle className="w-3 h-3" />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => exportCsv(s.id)}
                    className="p-2 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                    title="Download CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
