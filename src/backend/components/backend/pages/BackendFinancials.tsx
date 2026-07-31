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
import {
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
} from 'recharts';

type Period = 'month' | 'quarter' | 'year' | 'custom';

// ── Summary Data ──
const summaryCards = [
  { label: 'Total Revenue', value: '$0', raw: 0, trend: '—', positive: true, icon: DollarSign, variant: 'emerald' as const },
  { label: 'Total Expenses', value: '$0', raw: 0, trend: '—', positive: true, icon: CreditCard, variant: 'red' as const },
  { label: 'Net Profit', value: '$0', raw: 0, trend: '—', positive: true, icon: TrendingUp, variant: 'indigo' as const },
  { label: 'Cash Flow', value: '$0', raw: 0, trend: '—', positive: true, icon: Activity, variant: 'blue' as const },
];

const variantStyles: Record<string, { bg: string; icon: string }> = {
  emerald: { bg: 'bg-emerald-50 border-emerald-100', icon: 'text-emerald-600' },
  red: { bg: 'bg-red-50 border-red-100', icon: 'text-red-600' },
  indigo: { bg: 'bg-indigo-50 border-indigo-100', icon: 'text-indigo-600' },
  blue: { bg: 'bg-blue-50 border-blue-100', icon: 'text-blue-600' },
};

// ── Revenue & Expense Breakdowns ──
interface BreakdownRow { label: string; value: number; pct: number; color: string }

const revenueBreakdown: BreakdownRow[] = [];

const expenseBreakdown: BreakdownRow[] = [];

// ── Cash Flow Forecast (90 days) ──
const cashFlowData = Array.from({ length: 13 }, (_, i) => ({
  week: `W${i + 1}`,
  label: `Week ${i + 1}`,
  inflows: 0,
  outflows: 0,
  net: 0,
  threshold: 10000,
}));

// Only flag a shortfall once there is real forecast activity — an all-zero
// forecast means "no data yet", not "every week is below threshold".
const alertWeeks = cashFlowData.filter((d) => (d.inflows > 0 || d.outflows > 0) && d.net < d.threshold);

// ── Capital Deployment ──
const capitalCards = [
  { label: 'Available Capital', value: '$0', icon: PiggyBank, variant: 'emerald' as const },
  { label: 'Deployed', value: '$0', icon: Zap, variant: 'indigo' as const },
  { label: 'Utilization', value: '0.0%', icon: Percent, variant: 'blue' as const },
  { label: '30-Day Need', value: '$0', icon: Briefcase, variant: 'orange' as const },
];

const capitalVariants: Record<string, { bg: string; icon: string }> = {
  ...variantStyles,
  orange: { bg: 'bg-orange-50 border-orange-100', icon: 'text-orange-600' },
};

interface FundingSource { name: string; committed: number; deployed: number; available: number; coc: number; returnPct: number }

const fundingSources: FundingSource[] = [];

// ── Recent Transactions ──
interface LedgerTxn { date: string; desc: string; type: 'Income' | 'Expense'; amount: number; category: string }

const transactions: LedgerTxn[] = [];

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtK = (n: number) => {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return fmt(n);
};

export function BackendFinancials() {
  const [period, setPeriod] = useState<Period>('month');

  const cocSources = fundingSources.filter((f) => f.coc > 0);
  const avgCoc = cocSources.length > 0
    ? cocSources.reduce((s, f) => s + f.coc, 0) / cocSources.length
    : null;
  const avgReturn = fundingSources.length > 0
    ? fundingSources.reduce((s, f) => s + f.returnPct, 0) / fundingSources.length
    : null;

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
              {card.trend === '—' ? (
                <p className="text-xs mt-2 text-gray-400">No prior period to compare</p>
              ) : (
                <p className={`text-xs mt-2 flex items-center gap-1 ${card.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {card.positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {card.trend} vs last period
                </p>
              )}
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
            {revenueBreakdown.map((item) => (
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
            {revenueBreakdown.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">
                No revenue recorded yet — income streams will appear here.
              </p>
            )}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-[8px] border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Expense Breakdown</h2>
            <p className="text-xs text-gray-500 mt-0.5">Total: {fmt(expenseBreakdown.reduce((s, e) => s + e.value, 0))}</p>
          </div>
          <div className="px-5 py-4 space-y-5">
            {expenseBreakdown.map((item) => (
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
            {expenseBreakdown.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">
                No expenses recorded yet — cost categories will appear here.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cash Flow Forecast */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Cash Flow Forecast</h2>
            <p className="text-xs text-gray-500 mt-0.5">90-day projection — inflows vs outflows</p>
          </div>
          {alertWeeks.length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              {alertWeeks.length} week(s) below $10K threshold
            </div>
          )}
        </div>
        <div className="px-5 py-4">
          {/* Legend */}
          <div className="flex items-center gap-5 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-600">Inflows</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-xs text-gray-600">Outflows</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-indigo-500" />
              <span className="text-xs text-gray-600">Net Position</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-amber-400 border-t border-dashed border-amber-400" />
              <span className="text-xs text-gray-600">Threshold ($10K)</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E6BFF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2E6BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A97AE' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#8A97AE' }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18233C', border: '1px solid #33415F', borderRadius: '8px', fontSize: '13px' }}
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === 'inflows' ? 'Inflows' : name === 'outflows' ? 'Outflows' : 'Net',
                  ]}
                />
                <ReferenceLine y={10000} stroke="#F0B429" strokeDasharray="6 4" strokeWidth={1.5} />
                <Area type="monotone" dataKey="net" stroke="#2E6BFF" strokeWidth={2} fill="url(#netGrad)" />
                <Area type="monotone" dataKey="inflows" stroke="#34C77B" strokeWidth={2} fill="none" dot={false} />
                <Area type="monotone" dataKey="outflows" stroke="#F87F83" strokeWidth={2} fill="none" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
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
                  const util = ((src.deployed / src.committed) * 100).toFixed(0);
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
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                      No funding sources yet — capital providers will appear here once added.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-4 py-3 font-semibold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(fundingSources.reduce((s, f) => s + f.committed, 0))}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(fundingSources.reduce((s, f) => s + f.deployed, 0))}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">{fmt(fundingSources.reduce((s, f) => s + f.available, 0))}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{avgCoc !== null ? `Avg ${avgCoc.toFixed(1)}%` : '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-indigo-600">{avgReturn !== null ? `${avgReturn.toFixed(1)}%` : '—'}</td>
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
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                    No transactions yet — ledger activity will appear here.
                  </td>
                </tr>
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