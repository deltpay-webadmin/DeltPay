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

  const lastPayroll = pastRuns.length ? pastRuns[0].totalNet : 0;
  const ytdPayroll = pastRuns.reduce((sum, run) => sum + run.totalNet, 0);
  const agentCommissionTotal = agentItems.reduce((sum, item) => sum + item.netPay, 0);
  const dealsEarningCommissions = 0;

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
          <StatCard label="Next Pay Date" value="—" icon={<Calendar className="w-5 h-5" />} sub="No payroll scheduled" highlight />
          <StatCard label="Payroll Amount" value={fmt(totalNet)} icon={<DollarSign className="w-5 h-5" />} sub={`${upcomingItems.length} payees`} />
          <StatCard label="Last Payroll Paid" value={fmt(lastPayroll)} icon={<CheckCircle className="w-5 h-5" />} sub={pastRuns.length ? 'Most recent completed run' : 'No payroll runs yet'} />
          <StatCard label="YTD Payroll" value={fmt(ytdPayroll)} icon={<TrendingUp className="w-5 h-5" />} sub="From recorded payroll runs" />
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
                <p className="text-sm font-medium text-gray-900">Pay Period: —</p>
                <p className="text-xs text-gray-500">No payroll schedule yet</p>
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
                    {employeeItems.length === 0 && (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">No employee payroll items yet</td></tr>
                    )}
                  </tbody>
                </table>
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
                    {agentItems.length === 0 && (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">No agent commission items yet</td></tr>
                    )}
                  </tbody>
                </table>
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
                <h3 className="text-sm font-semibold text-gray-900">Payroll Calendar</h3>
              </div>
              <div className="px-5 py-12 text-center text-sm text-gray-400">
                No payroll schedule yet
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-[8px] border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Upcoming Deadlines</h3>
              <p className="py-6 text-center text-sm text-gray-400">No payroll deadlines yet</p>
            </div>

            {/* Commission Integration Summary */}
            <div className="bg-white rounded-[8px] border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <UserCircle className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">Agent Commission Integration</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">Commission data will appear when payroll records are available.</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-[8px] p-3 text-center">
                  <p className="text-xl font-bold text-purple-700">{fmt(agentCommissionTotal)}</p>
                  <p className="text-[10px] text-purple-600 mt-0.5">Total Commissions This Period</p>
                </div>
                <div className="bg-purple-50 rounded-[8px] p-3 text-center">
                  <p className="text-xl font-bold text-purple-700">{agentItems.length}</p>
                  <p className="text-[10px] text-purple-600 mt-0.5">Agents With Payouts</p>
                </div>
                <div className="bg-purple-50 rounded-[8px] p-3 text-center">
                  <p className="text-xl font-bold text-purple-700">{dealsEarningCommissions}</p>
                  <p className="text-[10px] text-purple-600 mt-0.5">Deals Earning Commissions</p>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-3">
                <p className="py-4 text-center text-sm text-gray-400">No agent commission data yet</p>
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
                  {pastRuns.length === 0 && (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">No payroll runs yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
