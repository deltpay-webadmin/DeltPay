import { useState, useMemo } from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign, Filter, Download, Calendar, X, AlertTriangle, Star } from 'lucide-react';
import { useToast, ToastContainer } from './ui/Toast';

/* ═══════════════════════════════════════════════════════════
   MINI CHART HELPERS
   ═══════════════════════════════════════════════════════════ */

function SparkLine({ data, color = '#4945FF', height = 40 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const pad = 4;
  const uid = `spark-${Math.random().toString(36).slice(2, 8)}`;

  const coords = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: height - pad - ((v - min) / range) * (height - pad * 2),
  }));

  let d = `M${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.35;
    const cpx2 = curr.x - (curr.x - prev.x) * 0.35;
    d += ` C${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
  }
  const areaD = d + ` L${w},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${uid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2.5" fill="white" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   PERIOD-SPECIFIC DATA
   ═══════════════════════════════════════════════════════════ */

type Period = 'week' | 'month' | 'quarter';

interface KpiData { label: string; value: string; change: string; positive: boolean; icon: typeof DollarSign }
interface RevenueBar { label: string; value: number }
interface TopItem { name: string; units: number; revenue: string; trend: number }
interface CustomerTrend { label: string; value: string; change: string; positive: boolean; spark: number[] }

const PERIOD_CONFIG: Record<Period, {
  kpis: KpiData[];
  revenue: RevenueBar[];
  dateRange: string;
  chartSubtitle: string;
  topItems: TopItem[];
  customerTrends: CustomerTrend[];
}> = {
  week: {
    kpis: [
      { icon: DollarSign, label: 'Total Revenue', value: '$18,240', change: '+4.1%', positive: true },
      { icon: ShoppingBag, label: 'Total Orders', value: '312', change: '+8.6%', positive: true },
      { icon: Users, label: 'Active Customers', value: '187', change: '+3.2%', positive: true },
      { icon: TrendingUp, label: 'Avg. Order Value', value: '$58.46', change: '-2.8%', positive: false },
    ],
    revenue: [
      { label: 'Mon', value: 2180 },
      { label: 'Tue', value: 2640 },
      { label: 'Wed', value: 2420 },
      { label: 'Thu', value: 3150 },
      { label: 'Fri', value: 3810 },
      { label: 'Sat', value: 2490 },
      { label: 'Sun', value: 1550 },
    ],
    dateRange: 'Feb 24 – Mar 2, 2026',
    chartSubtitle: 'Daily gross revenue this week',
    topItems: [
      { name: 'Cold Brew Coffee', units: 94, revenue: '$470', trend: +18.3 },
      { name: 'Pastrami Sandwich', units: 78, revenue: '$1,404', trend: +5.6 },
      { name: 'Garden Bowl', units: 61, revenue: '$854', trend: +22.0 },
      { name: 'Spinach Wrap', units: 52, revenue: '$780', trend: -4.1 },
      { name: 'Avocado Toast', units: 48, revenue: '$672', trend: +31.2 },
    ],
    customerTrends: [
      { label: 'New customers', value: '34', change: '+8%', positive: true, spark: [3, 5, 4, 7, 6, 4, 5] },
      { label: 'Returning customers', value: '153', change: '+3%', positive: true, spark: [20, 22, 21, 24, 23, 19, 24] },
      { label: 'Churn risk', value: '8', change: '-12%', positive: true, spark: [11, 10, 9, 10, 8, 9, 8] },
      { label: 'Avg. visit frequency', value: '1.8x/wk', change: '+0.2', positive: true, spark: [1.4, 1.5, 1.6, 1.5, 1.7, 1.8, 1.8] },
    ],
  },
  month: {
    kpis: [
      { icon: DollarSign, label: 'Total Revenue', value: '$284,600', change: '+7.2%', positive: true },
      { icon: ShoppingBag, label: 'Total Orders', value: '4,218', change: '+11.3%', positive: true },
      { icon: Users, label: 'Active Customers', value: '596', change: '+14%', positive: true },
      { icon: TrendingUp, label: 'Avg. Order Value', value: '$67.48', change: '-1.2%', positive: false },
    ],
    revenue: [
      { label: 'Jan', value: 18200 },
      { label: 'Feb', value: 21400 },
      { label: 'Mar', value: 19800 },
      { label: 'Apr', value: 24600 },
      { label: 'May', value: 22100 },
      { label: 'Jun', value: 26300 },
      { label: 'Jul', value: 28500 },
      { label: 'Aug', value: 25800 },
      { label: 'Sep', value: 27200 },
      { label: 'Oct', value: 30100 },
      { label: 'Nov', value: 28900 },
      { label: 'Dec', value: 32200 },
    ],
    dateRange: 'Jan – Dec 2025',
    chartSubtitle: 'Monthly gross revenue, all locations',
    topItems: [
      { name: 'Pastrami Sandwich', units: 342, revenue: '$6,156', trend: +12.4 },
      { name: 'Spinach Wrap', units: 289, revenue: '$4,335', trend: +8.1 },
      { name: 'Steak Salad', units: 256, revenue: '$5,376', trend: -2.3 },
      { name: 'Garden Bowl', units: 234, revenue: '$3,276', trend: +15.6 },
      { name: 'Cold Brew Coffee', units: 198, revenue: '$990', trend: +22.1 },
    ],
    customerTrends: [
      { label: 'New customers', value: '184', change: '+14%', positive: true, spark: [12, 18, 15, 22, 19, 28, 24, 31] },
      { label: 'Returning customers', value: '412', change: '+6%', positive: true, spark: [45, 48, 42, 51, 49, 53, 50, 56] },
      { label: 'Churn risk', value: '23', change: '-8%', positive: true, spark: [34, 30, 28, 31, 26, 24, 23, 23] },
      { label: 'Avg. visit frequency', value: '2.8x/mo', change: '+0.3', positive: true, spark: [2.1, 2.3, 2.2, 2.5, 2.4, 2.6, 2.7, 2.8] },
    ],
  },
  quarter: {
    kpis: [
      { icon: DollarSign, label: 'Total Revenue', value: '$1.14M', change: '+18.6%', positive: true },
      { icon: ShoppingBag, label: 'Total Orders', value: '16,842', change: '+22.4%', positive: true },
      { icon: Users, label: 'Active Customers', value: '1,203', change: '+31%', positive: true },
      { icon: TrendingUp, label: 'Avg. Order Value', value: '$67.72', change: '+3.1%', positive: true },
    ],
    revenue: [
      { label: 'Q1 \'24', value: 198400 },
      { label: 'Q2 \'24', value: 221800 },
      { label: 'Q3 \'24', value: 237500 },
      { label: 'Q4 \'24', value: 264200 },
      { label: 'Q1 \'25', value: 242100 },
      { label: 'Q2 \'25', value: 268900 },
      { label: 'Q3 \'25', value: 291400 },
      { label: 'Q4 \'25', value: 336800 },
    ],
    dateRange: 'Q1 2024 – Q4 2025',
    chartSubtitle: 'Quarterly gross revenue, all locations',
    topItems: [
      { name: 'Pastrami Sandwich', units: 1406, revenue: '$25,308', trend: +16.8 },
      { name: 'Catering Platter', units: 312, revenue: '$46,800', trend: +42.1 },
      { name: 'Steak Salad', units: 1024, revenue: '$21,504', trend: +5.4 },
      { name: 'Spinach Wrap', units: 1148, revenue: '$17,220', trend: +11.9 },
      { name: 'Cold Brew (12-pack)', units: 520, revenue: '$10,400', trend: +38.7 },
    ],
    customerTrends: [
      { label: 'New customers', value: '742', change: '+31%', positive: true, spark: [82, 110, 130, 148, 156, 172, 188, 198] },
      { label: 'Returning customers', value: '461', change: '+12%', positive: true, spark: [380, 390, 400, 412, 420, 435, 448, 461] },
      { label: 'Churn risk', value: '18', change: '-24%', positive: true, spark: [42, 38, 35, 30, 28, 24, 20, 18] },
      { label: 'Avg. lifetime value', value: '$948', change: '+$124', positive: true, spark: [680, 720, 760, 810, 840, 880, 920, 948] },
    ],
  },
};

/* Map a normalized 0-1 value to an opacity for the bar color.
   Higher revenue → darker / more opaque. */
function barOpacity(normalized: number): number {
  // range: 0.28 (lightest) → 0.92 (darkest)
  return 0.28 + normalized * 0.64;
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function InsightsDashboard() {
  const [period, setPeriod] = useState<Period>('month');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { toasts, addToast, removeToast } = useToast();

  const data = PERIOD_CONFIG[period];

  const revenueMax = useMemo(() => Math.max(...data.revenue.map(r => r.value)), [data.revenue]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-[1080px] mx-auto px-10 pt-8 pb-0">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="mb-0.5" style={{ fontSize: 20, fontWeight: 600, color: '#0a2540', letterSpacing: '-0.3px' }}>Insights</h1>
            <p style={{ fontSize: 13, color: '#8898aa' }}>Revenue charts, top-selling items, and customer trends</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center overflow-hidden" style={{ border: '1px solid #e6e6e6', borderRadius: 6 }}>
              {(['week', 'month', 'quarter'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 transition-colors"
                  style={{
                    fontSize: 12,
                    fontWeight: period === p ? 600 : 450,
                    color: period === p ? '#0a2540' : '#8898aa',
                    backgroundColor: period === p ? '#f4f5f7' : '#ffffff',
                    textTransform: 'capitalize',
                    borderRight: '1px solid #e6e6e6',
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <button
              className="flex items-center gap-1.5 px-3 py-[7px] rounded-md text-sm transition-colors hover:bg-[#fafafa]"
              style={{ fontWeight: 500, color: '#425466', border: '1px solid #e6e6e6', backgroundColor: '#ffffff' }}
              onClick={() => setFilterOpen(true)}
            >
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-[7px] rounded-md text-sm transition-colors hover:bg-[#fafafa]"
              style={{ fontWeight: 500, color: '#425466', border: '1px solid #e6e6e6', backgroundColor: '#ffffff' }}
              onClick={() => addToast('success', 'Report exported', 'CSV file downloaded')}
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        {/* KPI row — joined block, same style as Payments */}
        <div
          className="grid grid-cols-4 mb-8 overflow-hidden"
          style={{ backgroundColor: '#f4f5f7', border: '1px solid #e6e6e6', borderRadius: 8 }}
        >
          {data.kpis.map((kpi, i) => {
            const dotColors = ['#0cbc87', '#635bff', '#f5a623', '#635bff'];
            return (
              <div
                key={`${period}-${i}`}
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
                  {kpi.change} vs last {period}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content on white background */}
      <div className="max-w-[1080px] mx-auto px-10 pb-8">
        {/* Revenue Chart */}
        <div className="border border-[#E8E8E8] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base text-[#111]" style={{ fontWeight: 700 }}>Revenue Over Time</h2>
              <p className="text-xs text-[#999] mt-0.5">{data.chartSubtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#999]" />
              <span className="text-xs text-[#666]">{data.dateRange}</span>
            </div>
          </div>

          {/* Y-axis labels + bars */}
          <div className="flex" style={{ height: 210 }}>
            {/* Y axis */}
            <div className="flex flex-col justify-between pr-3 py-1" style={{ width: 52 }}>
              {[1, 0.75, 0.5, 0.25, 0].map(pct => (
                <span key={pct} className="text-[10px] text-[#BBB] text-right" style={{ fontWeight: 500 }}>
                  {revenueMax >= 100000
                    ? `$${((revenueMax * pct) / 1000).toFixed(0)}K`
                    : revenueMax >= 10000
                    ? `$${((revenueMax * pct) / 1000).toFixed(1)}K`
                    : `$${(revenueMax * pct).toFixed(0)}`}
                </span>
              ))}
            </div>

            {/* Grid + Bars */}
            <div className="flex-1 relative">
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                <div
                  key={pct}
                  className="absolute left-0 right-0 border-t border-[#F0F0F0]"
                  style={{ top: `${pct * 100}%` }}
                />
              ))}

              {/* Bars */}
              <div className="relative z-10 flex items-end h-full gap-1 px-1">
                {data.revenue.map((bar, i) => {
                  const normalized = bar.value / revenueMax;
                  const opacity = barOpacity(normalized);
                  const fmt = bar.value >= 100000
                    ? `$${(bar.value / 1000).toFixed(0)}K`
                    : bar.value >= 1000
                    ? `$${(bar.value / 1000).toFixed(1)}K`
                    : `$${bar.value}`;
                  return (
                    <div key={`${period}-${i}`} className="flex-1 flex flex-col items-center group cursor-pointer" style={{ height: '100%', justifyContent: 'flex-end' }}>
                      <div className="relative w-full px-[2px]">
                        {/* Tooltip */}
                        <div
                          className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] text-[#111] bg-white border border-[#E8E8E8] px-2 py-0.5 rounded-md whitespace-nowrap z-10 pointer-events-none"
                          style={{ fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                        >
                          {fmt}
                        </div>
                        {/* Bar */}
                        <div
                          className="w-full rounded-t-[4px] transition-all duration-300 group-hover:brightness-110"
                          style={{
                            height: `${normalized * 180}px`,
                            backgroundColor: `rgba(73, 69, 255, ${opacity})`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex" style={{ paddingLeft: 52 }}>
            <div className="flex-1 flex gap-1 px-1">
              {data.revenue.map((bar, i) => (
                <div key={i} className="flex-1 text-center">
                  <span className="text-[10px] text-[#999]" style={{ fontWeight: 500 }}>{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Top Selling Items */}
          <div className="border border-[#E8E8E8] rounded-xl p-6">
            <h2 className="text-base text-[#111] mb-1" style={{ fontWeight: 700 }}>Top-Selling Items</h2>
            <p className="text-xs text-[#999] mb-4">By units sold this {period}</p>
            <div className="space-y-0">
              <div className="grid grid-cols-[1fr_70px_90px_70px] gap-2 py-2 border-b border-[#F0F0F0] text-[10px] text-[#999]" style={{ fontWeight: 600 }}>
                <span>ITEM</span><span className="text-right">UNITS</span><span className="text-right">REVENUE</span><span className="text-right">TREND</span>
              </div>
              {data.topItems.map((item, i) => (
                <div key={`${period}-${i}`} className="grid grid-cols-[1fr_70px_90px_70px] gap-2 py-3 border-b border-[#F8F8F8] items-center hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[10px] text-[#999]" style={{ fontWeight: 600 }}>{i + 1}</span>
                    <span className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{item.name}</span>
                  </div>
                  <span className="text-sm text-[#666] text-right">{item.units.toLocaleString()}</span>
                  <span className="text-sm text-[#333] text-right" style={{ fontWeight: 600 }}>{item.revenue}</span>
                  <span className={`text-xs text-right ${item.trend > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`} style={{ fontWeight: 600 }}>
                    {item.trend > 0 ? '+' : ''}{item.trend}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Trends */}
          <div className="border border-[#E8E8E8] rounded-xl p-6">
            <h2 className="text-base text-[#111] mb-1" style={{ fontWeight: 700 }}>Customer Trends</h2>
            <p className="text-xs text-[#999] mb-4">Activity and engagement metrics</p>
            <div className="space-y-4">
              {data.customerTrends.map((ct, i) => (
                <div key={`${period}-${i}`} className="flex items-center justify-between py-2 border-b border-[#F8F8F8] last:border-0">
                  <div className="flex-1">
                    <div className="text-xs text-[#999] mb-0.5" style={{ fontWeight: 500 }}>{ct.label}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-[#111]" style={{ fontWeight: 700 }}>{ct.value}</span>
                      <span className={`text-xs ${ct.positive ? 'text-[#10B981]' : 'text-[#EF4444]'}`} style={{ fontWeight: 600 }}>{ct.change}</span>
                    </div>
                  </div>
                  <div className="w-24">
                    <SparkLine data={ct.spark} color={ct.positive ? '#10B981' : '#EF4444'} height={28} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ Customer Pulse Section ═══ */}
        <div className="mt-8">
          <h2 className="text-base text-[#111] mb-1" style={{ fontWeight: 700 }}>Customer Pulse</h2>
          <p className="text-xs text-[#999] mb-4">Key customer health signals at a glance</p>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* VIP Alert */}
            <div className="border border-[#E8E8E8] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#4945FF]/8 flex items-center justify-center">
                  <Star className="w-4 h-4 text-[#4945FF]" />
                </div>
                <span className="text-xs text-[#999]" style={{ fontWeight: 500 }}>VIP Customers</span>
              </div>
              <div className="text-2xl text-[#111] mb-1" style={{ fontWeight: 700 }}>2</div>
              <div className="space-y-1.5 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#333]" style={{ fontWeight: 500 }}>Sarah Chen</span>
                  <span className="text-[#10B981]" style={{ fontWeight: 600 }}>$4,820</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#333]" style={{ fontWeight: 500 }}>Marcus Williams</span>
                  <span className="text-[#10B981]" style={{ fontWeight: 600 }}>$3,340</span>
                </div>
              </div>
            </div>

            {/* At-Risk Alert */}
            <div className="border border-[#FEE2E2] rounded-xl p-5 bg-[#FEF2F2]/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                </div>
                <span className="text-xs text-[#999]" style={{ fontWeight: 500 }}>At-Risk Customers</span>
              </div>
              <div className="text-2xl text-[#EF4444] mb-1" style={{ fontWeight: 700 }}>2</div>
              <div className="space-y-1.5 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#333]" style={{ fontWeight: 500 }}>David Kim</span>
                  <span className="text-[#EF4444]" style={{ fontWeight: 500 }}>45 days inactive</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#333]" style={{ fontWeight: 500 }}>Lisa Thompson</span>
                  <span className="text-[#EF4444]" style={{ fontWeight: 500 }}>22 days inactive</span>
                </div>
              </div>
            </div>

            {/* New Customers */}
            <div className="border border-[#E8E8E8] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <span className="text-xs text-[#999]" style={{ fontWeight: 500 }}>New This Month</span>
              </div>
              <div className="text-2xl text-[#111] mb-1" style={{ fontWeight: 700 }}>3</div>
              <div className="space-y-1.5 mt-2">
                {['Alex Nguyen', 'Rachel Foster', 'Omar Hassan'].map(name => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <span className="text-[#333]" style={{ fontWeight: 500 }}>{name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#3B82F6]" style={{ fontWeight: 600 }}>New</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Filter Modal */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setFilterOpen(false)}>
          <div className="bg-white p-6 rounded-2xl border border-[#E8E8E8] w-[320px]" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm text-[#111]" style={{ fontWeight: 700 }}>Filter Insights</h2>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5]" onClick={() => setFilterOpen(false)}>
                <X className="w-4 h-4 text-[#666]" />
              </button>
            </div>
            <div className="space-y-2.5 mb-5">
              {[{ k: 'revenue', l: 'Revenue' }, { k: 'orders', l: 'Orders' }, { k: 'customers', l: 'Customers' }, { k: 'aov', l: 'Avg. Order Value' }].map(f => (
                <label key={f.k} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#FAFAFA] cursor-pointer">
                  <input type="checkbox" className="accent-[#4945FF]" checked={activeFilters.includes(f.k)} onChange={e => e.target.checked ? setActiveFilters(p => [...p, f.k]) : setActiveFilters(p => p.filter(x => x !== f.k))} />
                  <span className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{f.l}</span>
                </label>
              ))}
            </div>
            <button className="w-full py-2.5 rounded-full bg-[#4945FF] text-white text-sm hover:bg-[#3933CC] transition-colors" style={{ fontWeight: 600 }} onClick={() => { setFilterOpen(false); addToast('success', 'Filters applied', `${activeFilters.length || 'No'} filters active`); }}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}