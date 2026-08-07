import React, { useState } from 'react';
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Building2,
  Percent,
  Zap,
  CreditCard,
  Briefcase,
  CircleDollarSign,
  PiggyBank,
  Activity,
  ExternalLink,
} from 'lucide-react';

type Period = 'month' | 'quarter' | 'year' | 'custom';

type BreakdownItem = { label: string; value: number; pct: number; color: string };
type CashFlowPoint = { week: string; label: string; inflows: number; outflows: number; net: number; threshold: number };
type FundingSource = { name: string; committed: number; deployed: number; available: number; coc: number; returnPct: number };
type FinancialTransaction = { date: string; desc: string; type: 'Income' | 'Expense'; amount: number; category: string };

const variantStyles: Record<string, { bg: string; icon: string }> = {
  emerald: { bg: 'bg-emerald-50 border-emerald-100', icon: 'text-emerald-600' },
  red: { bg: 'bg-red-50 border-red-100', icon: 'text-red-600' },
  indigo: { bg: 'bg-indigo-50 border-indigo-100', icon: 'text-indigo-600' },
  blue: { bg: 'bg-blue-50 border-blue-100', icon: 'text-blue-600' },
};

// ── Revenue & Expense Breakdowns ──
const revenueBreakdown: BreakdownItem[] = [];

const expenseBreakdown: BreakdownItem[] = [];

// ── Cash Flow Forecast (90 days) ──
const cashFlowData: CashFlowPoint[] = [];

const alertWeeks = cashFlowData.filter((d) => d.net < d.threshold);

// ── Capital Deployment ──
const capitalVariants: Record<string, { bg: string; icon: string }> = {
  ...variantStyles,
  orange: { bg: 'bg-orange-50 border-orange-100', icon: 'text-orange-600' },
};

const fundingSources: FundingSource[] = [];

// ── Recent Transactions ──
const transactions: FinancialTransaction[] = [];

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtK = (n: number) => {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return fmt(n);
};

export function BackendFinancials() {
  const [period, setPeriod] = useState<Period>('month');
  const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.value, 0);
  const totalExpenses = expenseBreakdown.reduce((sum, item) => sum + item.value, 0);
  const netProfit = totalRevenue - totalExpenses;
  const cashFlow = cashFlowData.reduce((sum, point) => sum + point.net, 0);
  const committedCapital = fundingSources.reduce((sum, source) => sum + source.committed, 0);
  const deployedCapital = fundingSources.reduce((sum, source) => sum + source.deployed, 0);
  const availableCapital = fundingSources.reduce((sum, source) => sum + source.available, 0);
  const utilization = committedCapital ? (deployedCapital / committedCapital) * 100 : 0;
  const cocSources = fundingSources.filter((source) => source.coc > 0);
  const avgCoc = cocSources.length
    ? cocSources.reduce((sum, source) => sum + source.coc, 0) / cocSources.length
    : 0;
  const avgReturn = fundingSources.length
    ? fundingSources.reduce((sum, source) => sum + source.returnPct, 0) / fundingSources.length
    : 0;
  const summaryCards = [
    { label: 'Revenue', value: fmt(totalRevenue), trend: '—', icon: TrendingUp, variant: 'emerald' },
    { label: 'Expenses', value: fmt(totalExpenses), trend: '—', icon: TrendingDown, variant: 'red' },
    { label: 'Net Profit', value: fmt(netProfit), trend: '—', icon: DollarSign, variant: 'indigo' },
    { label: 'Cash Flow', value: fmt(cashFlow), trend: '—', icon: Wallet, variant: 'blue' },
  ];
  const capitalCards = [
    { label: 'Committed Capital', value: fmt(committedCapital), icon: Briefcase, variant: 'indigo' },
    { label: 'Deployed Capital', value: fmt(deployedCapital), icon: CircleDollarSign, variant: 'blue' },
    { label: 'Available Capital', value: fmt(availableCapital), icon: PiggyBank, variant: 'emerald' },
    { label: 'Utilization', value: `${utilization.toFixed(0)}%`, icon: Percent, variant: 'orange' },
  ];

  const periods: { key: Period; label: string }[] = [
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'Quarter' },
    { key: 'year', label: 'Year' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-md">
            Super Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Tabs */}
          <div className="flex bg-gray-100 rounded-[6px] p-0.5">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-[4px] transition-colors ${
                  period === p.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-[6px] text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const v = variantStyles[card.variant];
          return (
            <div key={card.label} className={`${v.bg} border rounded-[8px] p-4 sm:p-5`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">{card.label}</p>
                <div className={v.icon}><Icon className="w-5 h-5" /></div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs mt-2 flex items-center gap-1 text-gray-500">
                {card.trend} vs last period
              </p>
            </div>
          );
        })}
      </div>

      {/* Revenue & Expense Breakdown — Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-white rounded-[8px] border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h2>
            <p className="text-xs text-gray-500 mt-0.5">Total: {fmt(revenueBreakdown.reduce((s, r) => s + r.value, 0))}</p>
          </div>
          <div className="px-5 py-4 space-y-5">
            {revenueBreakdown.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No revenue data yet</p>
            ) : revenueBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{fmtK(item.value)}</span>
                    <span className="text-xs text-gray-500 w-12 text-right">{item.pct}%</span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-[8px] border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Expense Breakdown</h2>
            <p className="text-xs text-gray-500 mt-0.5">Total: {fmt(expenseBreakdown.reduce((s, e) => s + e.value, 0))}</p>
          </div>
          <div className="px-5 py-4 space-y-5">
            {expenseBreakdown.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No expense data yet</p>
            ) : expenseBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{fmtK(item.value)}</span>
                    <span className="text-xs text-gray-500 w-12 text-right">{item.pct}%</span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cash Flow Forecast */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Cash Flow Forecast</h2>
            <p className="text-xs text-gray-500 mt-0.5">Forecast data will appear here when available</p>
          </div>
          {alertWeeks.length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              {alertWeeks.length} week(s) below threshold
            </div>
          )}
        </div>
        <div className="px-5 py-4">
          <div className="h-72 flex items-center justify-center text-sm text-gray-400">
            No cash flow forecast data yet
          </div>
        </div>
      </div>

      {/* Capital Deployment */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Capital Deployment</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {capitalCards.map((card) => {
            const Icon = card.icon;
            const v = capitalVariants[card.variant];
            return (
              <div key={card.label} className={`${v.bg} border rounded-[8px] p-4 sm:p-5`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{card.label}</p>
                  <div className={v.icon}><Icon className="w-5 h-5" /></div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* Funding Source Table */}
        <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Funding Source</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Committed</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Deployed</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Available</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">COC Rate</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fundingSources.map((src) => {
                  const util = src.committed ? ((src.deployed / src.committed) * 100).toFixed(0) : '0';
                  return (
                    <tr key={src.name} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-indigo-50 rounded flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{src.name}</p>
                            <p className="text-xs text-gray-500">{util}% utilized</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(src.committed)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(src.deployed)}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600">{fmt(src.available)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{src.coc > 0 ? `${src.coc.toFixed(1)}%` : '—'}</td>
                      <td className="px-4 py-3 text-right font-medium text-indigo-600">{src.returnPct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
                {fundingSources.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No funding sources yet</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-4 py-3 font-semibold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(fundingSources.reduce((s, f) => s + f.committed, 0))}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(fundingSources.reduce((s, f) => s + f.deployed, 0))}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">{fmt(fundingSources.reduce((s, f) => s + f.available, 0))}</td>
                  <td className="px-4 py-3 text-right text-gray-500">Avg {avgCoc.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right font-semibold text-indigo-600">{avgReturn.toFixed(1)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Description</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Type</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Amount</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{tx.date}</td>
                  <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{tx.desc}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs border rounded-md ${
                        tx.type === 'Income'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.amount >= 0 ? '+' : ''}{fmt(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{tx.category}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
          <span>Showing {transactions.length} most recent</span>
          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">View All Transactions</button>
        </div>
      </div>
    </div>
  );
}
