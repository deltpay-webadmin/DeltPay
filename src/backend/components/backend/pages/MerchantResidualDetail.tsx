import React, { useMemo } from 'react';
import {
  ArrowLeft, Download, DollarSign, BarChart3, Activity,
  Building2, User, Phone, Mail, FileText,
} from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';
import { useMerchants } from '../crmStore';
import { useResiduals } from '../residualsStore';

// ── Helpers ──
const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const fmt0 = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtNum = (n: number) => new Intl.NumberFormat('en-US').format(n);

/** 'YYYY-MM' → 'Mar 2026' */
function periodLabel(period: string): string {
  const [y, m] = period.split('-').map(Number);
  if (!y || !m) return period;
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Residual deep-dive for one merchant. Everything on this page comes from
 * live data: the merchant record (crmStore) and imported residual rows
 * (residualsStore). Months with no imported report simply don't appear.
 */
export function MerchantResidualDetail() {
  const { currentPage, navigate } = useAppNavigate();
  const merchants = useMerchants();
  const { rows, isLoading } = useResiduals();

  const merchantId = currentPage.split('/residuals/')[1] || '';
  const merchant = merchants.find(m => m.id === merchantId) ?? null;

  const history = useMemo(() => {
    const mine = rows.filter(r =>
      (merchantId && r.merchantId === merchantId)
      || (merchant && r.merchantName.trim().toLowerCase() === merchant.name.trim().toLowerCase()),
    );
    return [...mine].sort((a, b) => (a.period < b.period ? 1 : -1));
  }, [rows, merchantId, merchant]);

  const totals = useMemo(() => ({
    volume: history.reduce((s, r) => s + r.monthlyVolume, 0),
    netRev: history.reduce((s, r) => s + r.netRevenue, 0),
    agentShare: history.reduce((s, r) => s + r.agentShare, 0),
    deltNet: history.reduce((s, r) => s + r.deltNet, 0),
  }), [history]);

  const exportCsv = () => {
    const lines = [
      'Period,Volume,Transactions,Gross Revenue,Processor Fees,Net Revenue,Agent,Agent Share,Delt Net',
      ...history.map(r => [
        r.period, r.monthlyVolume, r.transactionCount, r.grossRevenue,
        r.processorFees, r.netRevenue, `"${r.agent.replace(/"/g, '""')}"`, r.agentShare, r.deltNet,
      ].join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `residuals-${(merchant?.name || merchantId || 'merchant').replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!merchant && !isLoading && history.length === 0) {
    return (
      <div className="px-6 py-6">
        <button onClick={() => navigate('/residuals')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Residuals
        </button>
        <div className="bg-white border border-gray-200 rounded-[8px] px-6 py-14 text-center">
          <div className="w-11 h-11 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-gray-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-gray-900">Merchant not found</p>
          <p className="mt-1 text-sm text-gray-500">
            No merchant or residual history matches this link. It may have been removed.
          </p>
        </div>
      </div>
    );
  }

  const displayName = merchant?.name || history[0]?.merchantName || 'Merchant';

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate('/residuals')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Residuals
          </button>
          <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
          {merchant && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1.5">
              <span className="inline-flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {merchant.industry}</span>
              <span className="inline-flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Agent: {merchant.agent}</span>
              {merchant.contactEmail && <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {merchant.contactEmail}</span>}
              {merchant.contactPhone && <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {merchant.contactPhone}</span>}
            </div>
          )}
        </div>
        {history.length > 0 && (
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-[6px] hover:bg-gray-50 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Lifetime totals from imported reports */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={BarChart3} label="Reported Volume" value={fmt0(totals.volume)} />
        <Stat icon={Activity} label="Net Revenue" value={fmt(totals.netRev)} />
        <Stat icon={User} label="Agent Share" value={fmt(totals.agentShare)} />
        <Stat icon={DollarSign} label="Delt Net" value={fmt(totals.deltNet)} highlight />
      </div>

      {/* Monthly history */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Monthly Residuals</h2>
          <p className="text-xs text-gray-500 mt-0.5">One row per imported processor report.</p>
        </div>
        {history.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="w-11 h-11 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-900">No residual history yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Import a processor residual report on the Residuals page and this merchant's months will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Period</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Volume</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Transactions</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Gross Revenue</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Processor Fees</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Net Revenue</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Agent Share</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Delt Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{periodLabel(r.period)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt0(r.monthlyVolume)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtNum(r.transactionCount)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(r.grossRevenue)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(r.processorFees)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(r.netRevenue)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(r.agentShare)}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">{fmt(r.deltNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, highlight }: {
  icon: React.ElementType; label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-[8px] border border-gray-200 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{label}</p>
        <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-500" />
        </div>
      </div>
      <p className={`text-xl sm:text-2xl font-bold ${highlight ? 'text-emerald-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
