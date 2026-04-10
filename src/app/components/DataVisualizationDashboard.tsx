import { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Rectangle
} from 'recharts';
import { ArrowDownLeft, ArrowUpRight, Building2, Clock, DollarSign, CreditCard, ArrowLeftRight, Filter, Users, Star, AlertTriangle, ChartArea, Wallet } from 'lucide-react';
import { useToast, ToastContainer } from './ui/Toast';
import { LockedWidget } from './ui/LockedWidget';

/* ── Cash Flow data ── */
const PROCESSING = [
  { id: 'TXN-4821', date: 'Mar 3', type: 'Card Sale', amount: '$847.20', status: 'completed', method: 'Visa ••4242' },
  { id: 'TXN-4820', date: 'Mar 3', type: 'Card Sale', amount: '$1,234.00', status: 'completed', method: 'Amex ••1001' },
  { id: 'TXN-4819', date: 'Mar 3', type: 'Refund', amount: '-$45.00', status: 'completed', method: 'Visa ••8899' },
  { id: 'TXN-4818', date: 'Mar 2', type: 'Card Sale', amount: '$562.80', status: 'pending', method: 'MC ••3456' },
  { id: 'TXN-4817', date: 'Mar 2', type: 'Card Sale', amount: '$389.50', status: 'completed', method: 'Visa ••7722' },
  { id: 'TXN-4816', date: 'Mar 2', type: 'ACH Transfer', amount: '$2,100.00', status: 'pending', method: 'Bank ••9012' },
];

const DEPOSITS = [
  { date: 'Mar 4', amount: '$4,218.30', status: 'scheduled', bank: 'Chase ••4501', eta: 'Tomorrow' },
  { date: 'Mar 3', amount: '$3,891.00', status: 'in-transit', bank: 'Chase ••4501', eta: 'Today' },
  { date: 'Mar 1', amount: '$5,120.45', status: 'deposited', bank: 'Chase ••4501', eta: 'Completed' },
  { date: 'Feb 28', amount: '$4,672.80', status: 'deposited', bank: 'Chase ••4501', eta: 'Completed' },
];

const FEES = [
  { label: 'Processing fees', amount: '$1,248.30', percent: '2.6%', period: 'This month' },
  { label: 'Platform fee', amount: '$99.00', percent: '—', period: 'Monthly' },
  { label: 'Chargeback fees', amount: '$25.00', percent: '—', period: 'This month' },
  { label: 'International fees', amount: '$34.80', percent: '1.0%', period: 'This month' },
];

/* ── Customer analytics data ── */
const CUSTOMERS_SUMMARY = [
  { id: 'C-001', name: 'Sarah Chen', totalSpend: 4820, visits: 62, tier: 'vip' as const, daysSince: 1, avgTicket: 77.74 },
  { id: 'C-002', name: 'Marcus Williams', totalSpend: 3340, visits: 48, tier: 'vip' as const, daysSince: 2, avgTicket: 69.58 },
  { id: 'C-003', name: 'Emily Rodriguez', totalSpend: 2190, visits: 34, tier: 'regular' as const, daysSince: 4, avgTicket: 64.41 },
  { id: 'C-006', name: 'David Kim', totalSpend: 980, visits: 15, tier: 'at-risk' as const, daysSince: 45, avgTicket: 65.33 },
  { id: 'C-007', name: 'Lisa Thompson', totalSpend: 720, visits: 11, tier: 'at-risk' as const, daysSince: 22, avgTicket: 65.45 },
  { id: 'C-008', name: 'Alex Nguyen', totalSpend: 340, visits: 4, tier: 'new' as const, daysSince: 3, avgTicket: 85.00 },
];

const TIER_CONFIG = {
  vip: { label: 'VIP', bg: 'bg-[#4945FF]/8', text: 'text-[#4945FF]' },
  regular: { label: 'Regular', bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]' },
  'new': { label: 'New', bg: 'bg-[#EFF6FF]', text: 'text-[#3B82F6]' },
  'at-risk': { label: 'At Risk', bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]' },
};

const customerByTier = [
  { name: 'VIP', value: 2, color: '#4945FF' },
  { name: 'Regular', value: 4, color: '#10B981' },
  { name: 'New', value: 3, color: '#3B82F6' },
  { name: 'At Risk', value: 2, color: '#EF4444' },
];

const customerSpendTrend = [
  { month: 'Sep', avgSpend: 58 },
  { month: 'Oct', avgSpend: 62 },
  { month: 'Nov', avgSpend: 59 },
  { month: 'Dec', avgSpend: 64 },
  { month: 'Jan', avgSpend: 67 },
  { month: 'Feb', avgSpend: 71 },
  { month: 'Mar', avgSpend: 68 },
];

type AnalyticsTab = 'charts' | 'cash-flow' | 'customers';

const monthlyRevenue = [
  { month: 'Jan', revenue: 42000, expenses: 28000, profit: 14000 },
  { month: 'Feb', revenue: 48000, expenses: 30000, profit: 18000 },
  { month: 'Mar', revenue: 55000, expenses: 32000, profit: 23000 },
  { month: 'Apr', revenue: 51000, expenses: 29000, profit: 22000 },
  { month: 'May', revenue: 63000, expenses: 35000, profit: 28000 },
  { month: 'Jun', revenue: 71000, expenses: 38000, profit: 33000 },
  { month: 'Jul', revenue: 68000, expenses: 36000, profit: 32000 },
  { month: 'Aug', revenue: 79000, expenses: 41000, profit: 38000 },
  { month: 'Sep', revenue: 85000, expenses: 43000, profit: 42000 },
  { month: 'Oct', revenue: 92000, expenses: 46000, profit: 46000 },
  { month: 'Nov', revenue: 88000, expenses: 44000, profit: 44000 },
  { month: 'Dec', revenue: 105000, expenses: 52000, profit: 53000 },
];

const RevenueBar = (props: any) => {
  const { x, y, width, height, revenue } = props;
  const fill = revenue >= 85000 ? '#16C784' : revenue >= 60000 ? '#4945FF' : revenue >= 45000 ? '#A78BFA' : '#CBD5E1';
  return <Rectangle x={x} y={y} width={width} height={height} fill={fill} radius={[4, 4, 0, 0]} />;
};

const dailyTransactions = [
  { day: 'Mon', online: 142, inStore: 98, mobile: 67 },
  { day: 'Tue', online: 158, inStore: 112, mobile: 73 },
  { day: 'Wed', online: 175, inStore: 125, mobile: 89 },
  { day: 'Thu', online: 162, inStore: 108, mobile: 81 },
  { day: 'Fri', online: 210, inStore: 156, mobile: 104 },
  { day: 'Sat', online: 245, inStore: 198, mobile: 132 },
  { day: 'Sun', online: 189, inStore: 145, mobile: 95 },
];

const categoryBreakdown = [
  { name: 'Food & Beverage', value: 35, color: '#4945FF' },
  { name: 'Retail', value: 25, color: '#16C784' },
  { name: 'Services', value: 20, color: '#FF6B6B' },
  { name: 'Online', value: 12, color: '#FFB347' },
  { name: 'Other', value: 8, color: '#A78BFA' },
];

const performanceMetrics = [
  { metric: 'Revenue Growth', value: 85 },
  { metric: 'Customer Retention', value: 72 },
  { metric: 'Avg Order Value', value: 68 },
  { metric: 'Conversion Rate', value: 91 },
  { metric: 'Customer Satisfaction', value: 88 },
  { metric: 'Repeat Purchases', value: 76 },
];

const hourlyTraffic = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  visitors: Math.round(Math.sin((i - 6) * Math.PI / 12) * 400 + 500 + Math.random() * 100),
  conversions: Math.round(Math.sin((i - 6) * Math.PI / 12) * 60 + 80 + Math.random() * 20),
}));

const COLORS = ['#4945FF', '#16C784', '#FF6B6B', '#FFB347', '#A78BFA'];

type TimeRange = '7d' | '30d' | '90d' | '12m';

const CustomTooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #E8E8E8',
  borderRadius: '12px',
  padding: '12px 16px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  fontSize: '13px',
};

export function DataVisualizationDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('12m');
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>('charts');
  const [cashFlowTab, setCashFlowTab] = useState<'processing' | 'deposits' | 'fees'>('processing');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const kpis = [
    { label: 'Total Revenue', value: '$847,200', change: '+18.3%', positive: true },
    { label: 'Avg Transaction', value: '$68.40', change: '+5.2%', positive: true },
    { label: 'Active Customers', value: '2,847', change: '+12.1%', positive: true },
    { label: 'Churn Rate', value: '2.4%', change: '-0.8%', positive: true },
  ];

  return (
    <div className="max-w-[1080px] mx-auto px-10 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="mb-0.5" style={{ fontSize: 20, fontWeight: 600, color: '#0a2540', letterSpacing: '-0.3px' }}>Analytics</h1>
          <p style={{ fontSize: 13, color: '#8898aa' }}>Charts, cash flow, and customer analytics</p>
        </div>
        <div className="flex items-center gap-1 overflow-hidden rounded-md" style={{ border: '1px solid #e6e6e6', backgroundColor: '#f4f5f7' }}>
          {(['7d', '30d', '90d', '12m'] as TimeRange[]).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className="px-3 py-1.5 transition-all"
              style={{
                fontSize: 12,
                fontWeight: timeRange === range ? 600 : 450,
                color: timeRange === range ? '#0a2540' : '#8898aa',
                backgroundColor: timeRange === range ? '#ffffff' : 'transparent',
                borderRight: '1px solid #e6e6e6',
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row — joined block, matching Payments style */}
      <div
        className="grid grid-cols-4 mb-8 overflow-hidden"
        style={{ backgroundColor: '#f4f5f7', border: '1px solid #e6e6e6', borderRadius: 8 }}
      >
        {kpis.map((kpi, i) => {
          const dotColors = ['#0cbc87', '#635bff', '#f5a623', '#635bff'];
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="px-5 py-[18px]"
              style={{ borderRight: i < 3 ? '1px solid #e6e6e6' : 'none', backgroundColor: '#f4f5f7' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5" style={{ fontSize: 12, fontWeight: 450, color: '#8898aa' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dotColors[i] }} />
                {kpi.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#0a2540', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 12, marginTop: 2, fontWeight: 600, color: kpi.positive ? '#0cbc87' : '#ef4444' }}>
                {kpi.change}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Tabs */}
      <div className="flex items-center gap-0 mb-8" style={{ borderBottom: '1px solid #e6e6e6' }}>
        {([
          { id: 'charts' as const, label: 'Charts', icon: ChartArea },
          { id: 'cash-flow' as const, label: 'Cash Flow', icon: Wallet },
          { id: 'customers' as const, label: 'Customers', icon: Users },
        ]).map(t => (
          <button key={t.id} onClick={() => setAnalyticsTab(t.id)}
            className="flex items-center gap-1.5 transition-colors"
            style={{
              fontSize: 13,
              fontWeight: analyticsTab === t.id ? 550 : 450,
              color: analyticsTab === t.id ? '#0a2540' : '#8898aa',
              background: 'none',
              border: 'none',
              borderBottom: analyticsTab === t.id ? '1.5px solid #0a2540' : '1.5px solid transparent',
              paddingBottom: 10,
              marginRight: 24,
              cursor: 'pointer',
            }}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══ Charts Tab ═══ */}
      {analyticsTab === 'charts' && (
      <>
      {/* Row 1: Revenue Bar Chart + Pie */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="col-span-2 bg-white border border-[#E8E8E8] rounded-2xl p-6"
        >
          <h3 className="text-sm text-[#111] mb-1" style={{ fontWeight: 700 }}>Revenue vs Expenses</h3>
          <p className="text-xs text-[#999] mb-5" style={{ fontWeight: 400 }}>Monthly breakdown for 2025</p>
          {/* Color legend */}
          <div className="flex items-center gap-4 mb-4">
            {[
              { color: '#16C784', label: '$85k+' },
              { color: '#4945FF', label: '$60k–$84k' },
              { color: '#A78BFA', label: '$45k–$59k' },
              { color: '#CBD5E1', label: 'Below $45k' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-[#999]" style={{ fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip contentStyle={CustomTooltipStyle} formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} />
              <Bar dataKey="revenue" barSize={18} name="Revenue" shape={RevenueBar} />
              <Bar dataKey="expenses" fill="#E8E8E8" radius={[4, 4, 0, 0]} barSize={18} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white border border-[#E8E8E8] rounded-2xl p-6"
        >
          <h3 className="text-sm text-[#111] mb-1" style={{ fontWeight: 700 }}>Revenue by Category</h3>
          <p className="text-xs text-[#999] mb-3" style={{ fontWeight: 400 }}>Distribution breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryBreakdown.map((entry, idx) => (
                  <Cell key={`cat-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={CustomTooltipStyle} formatter={(value: number) => [`${value}%`, undefined]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-2">
            {categoryBreakdown.map(c => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[#666] flex-1" style={{ fontWeight: 400 }}>{c.name}</span>
                <span className="text-[#333]" style={{ fontWeight: 600 }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2: Stacked Bar + Radar */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="bg-white border border-[#E8E8E8] rounded-2xl p-6"
        >
          <h3 className="text-sm text-[#111] mb-1" style={{ fontWeight: 700 }}>Transactions by Channel</h3>
          <p className="text-xs text-[#999] mb-5" style={{ fontWeight: 400 }}>Weekly transaction volume</p>
          <LockedWidget blurAmount={7} height={260} dimOverlay>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyTransactions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CustomTooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="online" stackId="a" fill="#4945FF" radius={[0, 0, 0, 0]} name="Online" />
                <Bar dataKey="inStore" stackId="a" fill="#16C784" name="In-Store" />
                <Bar dataKey="mobile" stackId="a" fill="#A78BFA" radius={[4, 4, 0, 0]} name="Mobile" />
              </BarChart>
            </ResponsiveContainer>
          </LockedWidget>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white border border-[#E8E8E8] rounded-2xl p-6"
        >
          <h3 className="text-sm text-[#111] mb-1" style={{ fontWeight: 700 }}>Performance Metrics</h3>
          <p className="text-xs text-[#999] mb-5" style={{ fontWeight: 400 }}>Key business health indicators</p>
          <LockedWidget blurAmount={7} height={260} dimOverlay>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={performanceMetrics} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#E8E8E8" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#999' }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar name="Score" dataKey="value" stroke="#4945FF" fill="#4945FF" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </LockedWidget>
        </motion.div>
      </div>

      {/* Row 3: Hourly Traffic Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="bg-white border border-[#E8E8E8] rounded-2xl p-6 mb-6"
      >
        <h3 className="text-sm text-[#111] mb-1" style={{ fontWeight: 700 }}>Hourly Traffic & Conversions</h3>
        <p className="text-xs text-[#999] mb-5" style={{ fontWeight: 400 }}>24-hour site visitor pattern</p>
        <LockedWidget blurAmount={7} height={260} dimOverlay>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={hourlyTraffic}>
              <defs>
                <linearGradient id="dvd-gradVisitors-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4945FF" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#4945FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dvd-gradConversions-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16C784" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#16C784" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CustomTooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="visitors" stroke="#4945FF" strokeWidth={2} fill="url(#dvd-gradVisitors-area)" name="Visitors" />
              <Area type="monotone" dataKey="conversions" stroke="#16C784" strokeWidth={2} fill="url(#dvd-gradConversions-area)" name="Conversions" />
            </AreaChart>
          </ResponsiveContainer>
        </LockedWidget>
      </motion.div>

      {/* Row 4: Profit Trend Line */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-white border border-[#E8E8E8] rounded-2xl p-6"
      >
        <h3 className="text-sm text-[#111] mb-1" style={{ fontWeight: 700 }}>Profit Trend</h3>
        <p className="text-xs text-[#999] mb-5" style={{ fontWeight: 400 }}>Monthly net profit trajectory</p>
        <LockedWidget blurAmount={7} height={220} dimOverlay>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip contentStyle={CustomTooltipStyle} formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} />
              <Line type="monotone" dataKey="profit" stroke="#16C784" strokeWidth={3} dot={{ r: 4, fill: '#16C784', stroke: '#fff', strokeWidth: 2 }} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </LockedWidget>
      </motion.div>
      </>
      )}

      {/* ═══ Cash Flow Tab ═══ */}
      {analyticsTab === 'cash-flow' && (
        <div>
          {/* Cash Flow Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { icon: DollarSign, label: 'Available Balance', value: '$12,384.23', sub: 'Ready to transfer' },
              { icon: Clock, label: 'Pending', value: '$4,218.30', sub: 'Next deposit: Tomorrow' },
              { icon: ArrowUpRight, label: 'This Week In', value: '$28,462.00', sub: '+8.4% vs last week' },
              { icon: ArrowDownLeft, label: 'This Week Out', value: '$3,124.60', sub: 'Fees + refunds' },
            ].map((card, i) => (
              <div key={i} className="border border-[#E8E8E8] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#4945FF]/8 flex items-center justify-center">
                    <card.icon className="w-4 h-4 text-[#4945FF]" />
                  </div>
                  <span className="text-xs text-[#999]" style={{ fontWeight: 500 }}>{card.label}</span>
                </div>
                <div className="text-2xl text-[#111]" style={{ fontWeight: 700 }}>{card.value}</div>
                <span className="text-[11px] text-[#999]">{card.sub}</span>
              </div>
            ))}
          </div>

          {/* Cash Flow Sub-Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b border-[#E8E8E8]">
            {([
              { id: 'processing' as const, label: 'Processing', icon: CreditCard },
              { id: 'deposits' as const, label: 'Deposits', icon: Building2 },
              { id: 'fees' as const, label: 'Fees', icon: DollarSign },
            ]).map(t => (
              <button key={t.id} onClick={() => setCashFlowTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${cashFlowTab === t.id ? 'border-[#4945FF] text-[#111]' : 'border-transparent text-[#999] hover:text-[#666]'}`}
                style={{ fontWeight: cashFlowTab === t.id ? 600 : 400 }}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          {/* Processing */}
          {cashFlowTab === 'processing' && (
            <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
              <div className="grid grid-cols-[80px_80px_120px_120px_100px_90px] gap-2 px-6 py-3 bg-[#FAFAFA] border-b border-[#E8E8E8] text-[10px] text-[#999]" style={{ fontWeight: 600 }}>
                <span>ID</span><span>DATE</span><span>TYPE</span><span>METHOD</span><span className="text-right">AMOUNT</span><span className="text-right">STATUS</span>
              </div>
              <LockedWidget blurAmount={5} dimOverlay>
                {PROCESSING.map((txn, i) => (
                  <div key={i} className="grid grid-cols-[80px_80px_120px_120px_100px_90px] gap-2 px-6 py-3.5 border-b border-[#F0F0F0] items-center hover:bg-[#FAFAFA] transition-colors cursor-pointer">
                    <span className="text-xs text-[#999] font-mono">{txn.id}</span>
                    <span className="text-xs text-[#666]">{txn.date}</span>
                    <span className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{txn.type}</span>
                    <span className="text-xs text-[#999]">{txn.method}</span>
                    <span className={`text-sm text-right ${txn.amount.startsWith('-') ? 'text-[#EF4444]' : 'text-[#333]'}`} style={{ fontWeight: 600 }}>{txn.amount}</span>
                    <div className="flex justify-end">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${txn.status === 'completed' ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#FEF3C7] text-[#F59E0B]'}`} style={{ fontWeight: 600 }}>
                        {txn.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </LockedWidget>
            </div>
          )}

          {/* Deposits */}
          {cashFlowTab === 'deposits' && (
            <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
              <div className="grid grid-cols-[100px_1fr_120px_120px_100px] gap-2 px-6 py-3 bg-[#FAFAFA] border-b border-[#E8E8E8] text-[10px] text-[#999]" style={{ fontWeight: 600 }}>
                <span>DATE</span><span>BANK</span><span className="text-right">AMOUNT</span><span className="text-right">ETA</span><span className="text-right">STATUS</span>
              </div>
              <LockedWidget blurAmount={5} dimOverlay>
                {DEPOSITS.map((dep, i) => (
                  <div key={i} className="grid grid-cols-[100px_1fr_120px_120px_100px] gap-2 px-6 py-3.5 border-b border-[#F0F0F0] items-center hover:bg-[#FAFAFA] transition-colors">
                    <span className="text-xs text-[#666]">{dep.date}</span>
                    <span className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{dep.bank}</span>
                    <span className="text-sm text-right text-[#333]" style={{ fontWeight: 600 }}>{dep.amount}</span>
                    <span className="text-xs text-right text-[#999]">{dep.eta}</span>
                    <div className="flex justify-end">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${dep.status === 'deposited' ? 'bg-[#ECFDF5] text-[#10B981]' : dep.status === 'in-transit' ? 'bg-[#EFF6FF] text-[#4945FF]' : 'bg-[#F5F5F5] text-[#999]'}`} style={{ fontWeight: 600 }}>
                        {dep.status === 'deposited' ? 'Deposited' : dep.status === 'in-transit' ? 'In Transit' : 'Scheduled'}
                      </span>
                    </div>
                  </div>
                ))}
              </LockedWidget>
            </div>
          )}

          {/* Fees */}
          {cashFlowTab === 'fees' && (
            <div className="border border-[#E8E8E8] rounded-xl p-6">
              <h3 className="text-base text-[#111] mb-4" style={{ fontWeight: 700 }}>Fee Summary — March 2026</h3>
              <div className="grid grid-cols-2 gap-4">
                {FEES.map((fee, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-4 rounded-lg bg-[#FAFAFA]">
                    <div>
                      <div className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{fee.label}</div>
                      <span className="text-[10px] text-[#999]">{fee.period} {fee.percent !== '—' && `· ${fee.percent} rate`}</span>
                    </div>
                    <span className="text-sm text-[#111]" style={{ fontWeight: 700 }}>{fee.amount}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E8E8E8]">
                <span className="text-sm text-[#111]" style={{ fontWeight: 700 }}>Total Fees</span>
                <span className="text-lg text-[#111]" style={{ fontWeight: 700 }}>$1,407.10</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Customers Tab ═══ */}
      {analyticsTab === 'customers' && (
        <div>
          {/* Customer KPI row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Customers', value: '10', change: '+3 this month' },
              { label: 'VIP Customers', value: '2', change: '20% of base' },
              { label: 'At-Risk', value: '2', change: 'Down from 3' },
              { label: 'Avg. Spend', value: '$1,618', change: '+$124 vs last Q' },
            ].map((kpi, i) => (
              <div key={i} className="border border-[#E8E8E8] rounded-xl p-5">
                <p className="text-xs text-[#999] mb-1" style={{ fontWeight: 500 }}>{kpi.label}</p>
                <p className="text-xl text-[#111]" style={{ fontWeight: 700 }}>{kpi.value}</p>
                <span className="text-[11px] text-[#16C784]" style={{ fontWeight: 500 }}>{kpi.change}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Tier Breakdown Pie */}
            <div className="border border-[#E8E8E8] rounded-2xl p-6">
              <h3 className="text-sm text-[#111] mb-1" style={{ fontWeight: 700 }}>Customer Segments</h3>
              <p className="text-xs text-[#999] mb-3" style={{ fontWeight: 400 }}>Distribution by tier</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={customerByTier} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {customerByTier.map((entry, idx) => (
                      <Cell key={`tier-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 mt-2">
                {customerByTier.map(c => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-[#666] flex-1" style={{ fontWeight: 400 }}>{c.name}</span>
                    <span className="text-[#333]" style={{ fontWeight: 600 }}>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Avg Spend Trend */}
            <div className="border border-[#E8E8E8] rounded-2xl p-6">
              <h3 className="text-sm text-[#111] mb-1" style={{ fontWeight: 700 }}>Avg. Ticket Trend</h3>
              <p className="text-xs text-[#999] mb-5" style={{ fontWeight: 400 }}>Customer average spend over time</p>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={customerSpendTrend}>
                  <defs>
                    <linearGradient id="dvd-gradSpend-customer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4945FF" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#4945FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip contentStyle={CustomTooltipStyle} formatter={(value: number) => [`$${value}`, 'Avg Spend']} />
                  <Area type="monotone" dataKey="avgSpend" stroke="#4945FF" strokeWidth={2} fill="url(#dvd-gradSpend-customer)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Customers Table */}
          <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8E8E8] bg-[#FAFAFA]">
              <h3 className="text-sm text-[#111]" style={{ fontWeight: 700 }}>Top Customers</h3>
            </div>
            <div className="grid grid-cols-[1fr_100px_80px_100px_80px_80px] gap-2 px-6 py-3 border-b border-[#E8E8E8] text-[10px] text-[#999]" style={{ fontWeight: 600 }}>
              <span>NAME</span><span className="text-right">TOTAL SPEND</span><span className="text-right">VISITS</span><span className="text-right">AVG TICKET</span><span className="text-right">LAST SEEN</span><span className="text-right">TIER</span>
            </div>
            <LockedWidget blurAmount={5} dimOverlay>
              {CUSTOMERS_SUMMARY.map((c, i) => {
                const tier = TIER_CONFIG[c.tier];
                return (
                  <div key={i} className="grid grid-cols-[1fr_100px_80px_100px_80px_80px] gap-2 px-6 py-3.5 border-b border-[#F0F0F0] items-center hover:bg-[#FAFAFA] transition-colors cursor-pointer">
                    <span className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{c.name}</span>
                    <span className="text-sm text-[#333] text-right" style={{ fontWeight: 600 }}>${c.totalSpend.toLocaleString()}</span>
                    <span className="text-sm text-[#666] text-right">{c.visits}</span>
                    <span className="text-sm text-[#666] text-right">${c.avgTicket.toFixed(2)}</span>
                    <span className="text-xs text-[#999] text-right">{c.daysSince === 0 ? 'Today' : `${c.daysSince}d ago`}</span>
                    <div className="flex justify-end">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${tier.bg} ${tier.text}`} style={{ fontWeight: 600 }}>{tier.label}</span>
                    </div>
                  </div>
                );
              })}
            </LockedWidget>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}