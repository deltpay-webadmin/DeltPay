import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Download,
  Eye,
  AlertCircle,
  Users,
  UserCircle,
  XCircle,
  CreditCard,
  Banknote,
  FileText,
} from 'lucide-react';
import { EmptyState } from '../EmptyPageState';

// ── Types ──
type PayeeCategory = 'Employee' | 'Agent Commission';
type PaymentMethod = 'Direct Deposit' | 'Check';
type RunStatus = 'Processed' | 'Pending' | 'Failed';

interface PayrollLineItem {
  id: string;
  name: string;
  category: PayeeCategory;
  type: 'Salary' | 'Hourly' | 'Commission';
  grossPay: number;
  deductions: number;
  taxes: number;
  netPay: number;
  paymentMethod: PaymentMethod;
}

interface PayrollRun {
  id: string;
  payDate: string;
  period: string;
  totalGross: number;
  totalNet: number;
  employeesPaid: number;
  agentsPaid: number;
  status: RunStatus;
}

// ── Data ──
const upcomingItems: PayrollLineItem[] = [];

const pastRuns: PayrollRun[] = [];

// ── Helpers ──
const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const runStatusCls = (s: RunStatus) => {
  switch (s) {
    case 'Processed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Failed': return 'bg-red-50 text-red-600 border-red-200';
  }
};

const runStatusIcon = (s: RunStatus) => {
  switch (s) {
    case 'Processed': return <CheckCircle className="w-3.5 h-3.5" />;
    case 'Pending': return <Clock className="w-3.5 h-3.5" />;
    case 'Failed': return <XCircle className="w-3.5 h-3.5" />;
  }
};

const categoryCls = (c: PayeeCategory) =>
  c === 'Employee'
    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
    : 'bg-purple-50 text-purple-700 border-purple-200';

const typeCls = (t: string) => {
  switch (t) {
    case 'Salary': return 'bg-blue-50 text-blue-700';
    case 'Hourly': return 'bg-amber-50 text-amber-700';
    case 'Commission': return 'bg-emerald-50 text-emerald-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

// ── Stat Card ──
function StatCard({ label, value, icon, sub, highlight }: { label: string; value: string; icon: React.ReactNode; sub?: string; highlight?: boolean }) {
  return (
    <div className={`bg-white rounded-[8px] border p-5 ${highlight ? 'border-brand/30 ring-1 ring-brand/10' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{label}</p>
        <div className={highlight ? 'text-brand' : 'text-gray-400'}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

/**
 * The pay cycle is semi-monthly: the 1st covers the back half of the previous
 * month, the 15th covers the 1st–15th of the current one. Resolves the period
 * that is currently open and the date it pays out.
 */
function payPeriod(today: Date) {
  const y = today.getFullYear();
  const m = today.getMonth();
  const md = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const full = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const [start, end, payDate] =
    today.getDate() <= 15
      ? [new Date(y, m, 1), new Date(y, m, 15), new Date(y, m, 15)]
      : [new Date(y, m, 16), new Date(y, m + 1, 0), new Date(y, m + 1, 1)];

  const daysAway = Math.max(0, Math.ceil((payDate.getTime() - today.getTime()) / 86_400_000));
  return {
    label: `${md(start)}–${md(end)}, ${end.getFullYear()}`,
    payDate,
    payDateLabel: full(payDate),
    daysAway,
  };
}

/**
 * The recurring dates of the cycle itself — payroll on the 1st and 15th,
 * timesheets due the 25th — projected forward from today. These are schedule
 * rules, not recorded events, so they hold whether or not any run exists yet.
 */
function upcomingDeadlines(today: Date) {
  const md = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const y = today.getFullYear();
  const m = today.getMonth();
  const dates: { date: Date; label: string; type: 'pay' | 'deadline' }[] = [];

  for (const offset of [0, 1]) {
    dates.push({ date: new Date(y, m + offset, 1), label: 'Semi-Monthly Payroll', type: 'pay' });
    dates.push({ date: new Date(y, m + offset, 15), label: 'Semi-Monthly Payroll — Employees + Agent Commissions', type: 'pay' });
    dates.push({ date: new Date(y, m + offset, 25), label: 'Timesheet Submission Deadline', type: 'deadline' });
  }

  const midnight = new Date(y, m, today.getDate());
  return dates
    .filter(d => d.date >= midnight)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 4)
    .map(d => ({ ...d, date: md(d.date) }));
}

// ════════════════════════════════════════
// Main Component
// ════════════════════════════════════════
export function BackendPayroll() {
  const [tab, setTab] = useState<'upcoming' | 'history' | 'calendar'>('upcoming');

  const employeeItems = upcomingItems.filter(i => i.category === 'Employee');
  const agentItems = upcomingItems.filter(i => i.category === 'Agent Commission');

  const totalGross = upcomingItems.reduce((s, i) => s + i.grossPay, 0);
  const totalDeductions = upcomingItems.reduce((s, i) => s + i.deductions, 0);
  const totalTaxes = upcomingItems.reduce((s, i) => s + i.taxes, 0);
  const totalNet = upcomingItems.reduce((s, i) => s + i.netPay, 0);

  // Semi-monthly cycle: the 1st and the 15th. Everything below is derived from
  // today's date and the recorded runs — no figures are assumed.
  const now = new Date();
  const period = payPeriod(now);
  const paidRuns = pastRuns.filter(r => r.status === 'Processed');
  const lastRun = paidRuns[0] ?? null;
  const lastPayroll = lastRun?.totalNet ?? 0;
  const ytdPayroll = paidRuns
    .filter(r => new Date(r.payDate).getFullYear() === now.getFullYear())
    .reduce((s, r) => s + r.totalNet, 0);

  return (
    <div className="h-full flex flex-col bg-canvas">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mt-1">Manage employee and agent commission payouts</p>
          </div>
          <button className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-2">
            <Banknote className="w-4 h-4" /> Run Payroll
          </button>
        </div>
      </div>

      <div className="px-6 py-6 flex-1 overflow-y-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Next Pay Date" value={period.payDateLabel} icon={<Calendar className="w-5 h-5" />} sub={`Semi-monthly — in ${period.daysAway} day${period.daysAway === 1 ? '' : 's'}`} highlight />
          <StatCard label="Payroll Amount" value={fmt(totalNet)} icon={<DollarSign className="w-5 h-5" />} sub={`${upcomingItems.length} payees`} />
          <StatCard label="Last Payroll Paid" value={fmt(lastPayroll)} icon={<CheckCircle className="w-5 h-5" />} sub={lastRun ? lastRun.payDate : 'No runs recorded'} />
          <StatCard label="YTD Payroll" value={fmt(ytdPayroll)} icon={<TrendingUp className="w-5 h-5" />} sub={`Jan 1 – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          {(['upcoming', 'history', 'calendar'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Upcoming Tab ── */}
        {tab === 'upcoming' && (
          <div className="space-y-6">
            {/* Pay period info */}
            <div className="flex items-center gap-4 px-4 py-3 bg-brand/5 border border-brand/15 rounded-[8px]">
              <Calendar className="w-5 h-5 text-brand" />
              <div>
                <p className="text-sm font-medium text-gray-900">Pay Period: {period.label}</p>
                <p className="text-xs text-gray-500">Scheduled for {period.payDateLabel} &middot; Semi-monthly cycle</p>
              </div>
            </div>

            {/* Employees Section */}
            <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">Employees</h3>
                <span className="text-xs text-gray-500">({employeeItems.length})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Name</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Type</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Gross Pay</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Deductions</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Taxes</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Net Pay</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employeeItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${typeCls(item.type)}`}>{item.type}</span></td>
                        <td className="px-5 py-3 text-sm text-gray-700 text-right">{fmt(item.grossPay)}</td>
                        <td className="px-5 py-3 text-sm text-gray-500 text-right">{item.deductions > 0 ? `-${fmt(item.deductions)}` : '—'}</td>
                        <td className="px-5 py-3 text-sm text-gray-500 text-right">-{fmt(item.taxes)}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-gray-900 text-right">{fmt(item.netPay)}</td>
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1.5 text-xs text-gray-600">
                            {item.paymentMethod === 'Direct Deposit' ? <CreditCard className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                            {item.paymentMethod}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {employeeItems.length === 0 && (
                  <EmptyState icon={Users} title="No employee line items" description="Salaried and hourly staff staged for this period will be listed here." compact />
                )}
              </div>
            </div>

            {/* Agent Commissions Section */}
            <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">Agent Commissions</h3>
                <span className="text-xs text-gray-500">({agentItems.length})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Agent</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Type</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Gross Pay</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Deductions</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Taxes</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Net Pay</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {agentItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${typeCls(item.type)}`}>{item.type}</span></td>
                        <td className="px-5 py-3 text-sm text-gray-700 text-right">{fmt(item.grossPay)}</td>
                        <td className="px-5 py-3 text-sm text-gray-500 text-right">{item.deductions > 0 ? `-${fmt(item.deductions)}` : '—'}</td>
                        <td className="px-5 py-3 text-sm text-gray-500 text-right">-{fmt(item.taxes)}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-gray-900 text-right">{fmt(item.netPay)}</td>
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1.5 text-xs text-gray-600">
                            <CreditCard className="w-3.5 h-3.5" />{item.paymentMethod}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {agentItems.length === 0 && (
                  <EmptyState icon={UserCircle} title="No commission line items" description="Approved agent commissions roll into payroll automatically." compact />
                )}
              </div>
            </div>

            {/* Totals Row */}
            <div className="bg-white rounded-[8px] border border-gray-200 p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Gross</p>
                  <p className="text-lg font-bold text-gray-900">{fmt(totalGross)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Deductions</p>
                  <p className="text-lg font-bold text-red-600">-{fmt(totalDeductions)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Taxes</p>
                  <p className="text-lg font-bold text-red-600">-{fmt(totalTaxes)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Net Pay</p>
                  <p className="text-lg font-bold text-brand">{fmt(totalNet)}</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Review all line items before approving. Approved payroll is final.
                </div>
                <button className="px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Approve & Run
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Calendar Tab ── */}
        {tab === 'calendar' && (
          <div className="space-y-6">
            {/* Calendar Grid */}
            <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Payroll Calendar — {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand" /> Pay Date</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400" /> Deadline</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400" /> Completed</span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-[8px] overflow-hidden">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} className="bg-gray-50 px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">{d}</div>
                  ))}
                  {/* Lead-in blanks so the 1st lands on its real weekday */}
                  {Array.from({ length: new Date(now.getFullYear(), now.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`e${i}`} className="bg-white p-2 min-h-[72px]" />
                  ))}
                  {Array.from({ length: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                    const isPayDay = day === 1 || day === 15;
                    const isDeadline = day === 10 || day === 25;
                    const isPast = day < now.getDate();
                    const isToday = day === now.getDate();
                    return (
                      <div key={day} className={`bg-white p-2 min-h-[72px] ${isToday ? 'ring-2 ring-brand ring-inset' : ''}`}>
                        <span className={`text-xs font-medium ${isToday ? 'text-brand' : 'text-gray-700'}`}>{day}</span>
                        {isPayDay && (
                          <div className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold ${isPast ? 'bg-emerald-100 text-emerald-700' : 'bg-brand/10 text-brand'}`}>
                            {isPast ? 'Paid' : 'Pay Day'}
                          </div>
                        )}
                        {isDeadline && (
                          <div className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 text-amber-700">
                            {day === 10 ? 'Tax Filing' : 'Timesheets Due'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-[8px] border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Upcoming Deadlines</h3>
              <div className="space-y-2">
                {upcomingDeadlines(now).map(item => (
                  <div key={item.date + item.label} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-[6px]">
                    <Calendar className={`w-4 h-4 shrink-0 ${item.type === 'pay' ? 'text-brand' : 'text-amber-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{item.label}</p>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Commission Integration Summary */}
            <div className="bg-white rounded-[8px] border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <UserCircle className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">Agent Commission Integration</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">Commission payouts staged for this pay period, sourced from the Agent Commissions module.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-[8px] p-3 text-center">
                  <p className="text-xl font-bold text-purple-700">{fmt(agentItems.reduce((s, i) => s + i.netPay, 0))}</p>
                  <p className="text-[10px] text-purple-600 mt-0.5">Total Commissions This Period</p>
                </div>
                <div className="bg-purple-50 rounded-[8px] p-3 text-center">
                  <p className="text-xl font-bold text-purple-700">{new Set(agentItems.map(i => i.name)).size}</p>
                  <p className="text-[10px] text-purple-600 mt-0.5">Agents With Payouts</p>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-3">
                {agentItems.length > 0 ? (
                  <div className="space-y-2">
                    {agentItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded-[6px]">
                        <span className="text-gray-700 font-medium">{item.name}</span>
                        <span className="font-semibold text-gray-900">{fmt(item.netPay)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={UserCircle}
                    title="No commissions staged"
                    description="Approved agent commissions for this period will be listed here."
                    compact
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Payroll History</h3>
              <p className="text-xs text-gray-500 mt-0.5">{pastRuns.length} payroll runs this year</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Pay Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Period</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Total Gross</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Total Net</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">Employees</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">Agents</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pastRuns.map(run => (
                    <tr key={run.id} className={`hover:bg-gray-50/50 ${run.status === 'Failed' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{run.payDate}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{run.period}</td>
                      <td className="px-5 py-3 text-sm text-gray-700 text-right">{fmt(run.totalGross)}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-gray-900 text-right">{fmt(run.totalNet)}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 text-center">{run.employeesPaid}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 text-center">{run.agentsPaid}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${runStatusCls(run.status)}`}>
                          {runStatusIcon(run.status)}
                          {run.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 hover:bg-gray-100 rounded-[6px] transition-colors" title="View Detail">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-[6px] transition-colors" title="Download Report">
                            <Download className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pastRuns.length === 0 && (
                <EmptyState icon={Calendar} title="No payroll history" description="Completed payroll runs will be recorded here." compact />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
