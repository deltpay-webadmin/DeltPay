import React, { useMemo } from 'react';
import {
  Store,
  DollarSign,
  Percent,
  CheckCircle,
  Send,
  UserCheck,
  Banknote,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useLeads, useMerchants } from '../crmStore';
import { useCapital } from '../capitalStore';

const variantMap = {
  indigo: { bg: 'bg-indigo-50 border-indigo-100', icon: 'text-indigo-600' },
  emerald: { bg: 'bg-emerald-50 border-emerald-100', icon: 'text-emerald-600' },
  purple: { bg: 'bg-purple-50 border-purple-100', icon: 'text-purple-600' },
  blue: { bg: 'bg-blue-50 border-blue-100', icon: 'text-blue-600' },
};

const fmtK = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}K` : `$${Math.round(n)}`;

export function AgentDashboard() {
  const leads = useLeads();
  const merchants = useMerchants();
  const { deals } = useCapital();

  // ── Pipeline by lead status ──
  const pipeline = useMemo(() => {
    const count = (f: (l: (typeof leads)[number]) => boolean) => leads.filter(f).length;
    return [
      { stage: 'New', count: count(l => l.status === 'New'), color: 'bg-blue-500' },
      { stage: 'In Progress', count: count(l => l.status === 'In Progress'), color: 'bg-amber-500' },
      { stage: 'Won', count: count(l => l.status === 'Won'), color: 'bg-emerald-500' },
      { stage: 'Not Qualified', count: count(l => l.status === 'Not Qualified'), color: 'bg-gray-400' },
      { stage: 'Lost', count: count(l => l.status === 'Lost'), color: 'bg-red-500' },
    ];
  }, [leads]);
  const pipelineTotal = pipeline.reduce((s, p) => s + p.count, 0);

  // ── Summary ──
  const monthlyVolume = merchants.reduce((s, m) => s + m.monthlyVolume, 0);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthCommission = deals
    .filter(d => (d.funded || '').slice(0, 7) === thisMonth)
    .reduce((s, d) => s + (d.commission ?? d.referralCommission ?? 0), 0);
  const wonLeads = leads.filter(l => l.status === 'Won').length;
  const conversion = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0;

  const summaryCards = [
    { label: 'My Merchants', value: String(merchants.length), icon: Store, variant: 'indigo' as const, trend: `${merchants.filter(m => m.status === 'Active').length} active` },
    { label: 'Monthly Volume', value: fmtK(monthlyVolume), icon: DollarSign, variant: 'emerald' as const, trend: 'Across all merchants' },
    { label: "This Month's Commission", value: fmtK(monthCommission), icon: Banknote, variant: 'purple' as const, trend: 'From funded deals' },
    { label: 'Conversion Rate', value: `${conversion}%`, icon: Percent, variant: 'blue' as const, trend: `${wonLeads} of ${leads.length} leads won` },
  ];

  // ── Recent activity from live data ──
  const activity = useMemo(() => {
    const items: { icon: any; iconColor: string; text: string; time: string }[] = [];
    for (const d of [...deals].sort((a, b) => (b.funded || '').localeCompare(a.funded || '')).slice(0, 3)) {
      items.push({
        icon: CheckCircle,
        iconColor: 'text-emerald-500',
        text: `${d.merchant} funded — ${fmtK(d.fundedAmt)} ${d.channel === 'fundomate' ? 'Fundomate referral' : 'MCA'}`,
        time: d.funded,
      });
    }
    const recentLeads = [...leads]
      .filter(l => l.updatedAt)
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
      .slice(0, 3);
    for (const l of recentLeads) {
      const latest = l.timeline[0];
      items.push({
        icon: l.status === 'Won' ? UserCheck : Send,
        iconColor: l.status === 'Won' ? 'text-purple-500' : 'text-indigo-500',
        text: latest ? `${l.businessName}: ${latest.title}` : `${l.businessName} — ${l.status}`,
        time: l.updatedAt ? new Date(l.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
      });
    }
    return items;
  }, [deals, leads]);

  // ── Funded volume by month (last 6 months, from the capital book) ──
  const chartData = useMemo(() => {
    const now = new Date();
    const months: { key: string; month: string; funded: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        funded: 0,
      });
    }
    const byKey = new Map(months.map(m => [m.key, m]));
    for (const d of deals) {
      const bucket = byKey.get((d.funded || '').slice(0, 7));
      if (bucket) bucket.funded += d.fundedAmt;
    }
    return months;
  }, [deals]);
  const hasChartData = chartData.some(m => m.funded > 0);

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your pipeline and performance overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const v = variantMap[card.variant];
          return (
            <div key={card.label} className={`${v.bg} border rounded-[8px] p-4 sm:p-5`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">{card.label}</p>
                <div className={v.icon}><Icon className="w-5 h-5" /></div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs mt-2 text-gray-500">{card.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline + Activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mini Pipeline */}
        <div className="bg-white rounded-[8px] border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Pipeline</h2>
            <p className="text-xs text-gray-500 mt-0.5">{pipelineTotal} lead{pipelineTotal !== 1 ? 's' : ''} in pipeline</p>
          </div>
          <div className="px-5 py-4 space-y-4">
            {pipelineTotal > 0 ? (
              <>
                {/* Stacked bar */}
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                  {pipeline.filter(p => p.count > 0).map((p) => (
                    <div
                      key={p.stage}
                      className={`${p.color} transition-all`}
                      style={{ width: `${(p.count / pipelineTotal) * 100}%` }}
                    />
                  ))}
                </div>
                {/* Stage breakdown */}
                <div className="grid grid-cols-5 gap-2">
                  {pipeline.map((p) => (
                    <div key={p.stage} className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className={`w-2 h-2 rounded-full ${p.color}`} />
                        <span className="text-xs text-gray-500 truncate">{p.stage}</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{p.count}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 py-6 text-center">No leads in the pipeline yet.</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[8px] border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="px-5 py-2">
            {activity.length > 0 ? activity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className={`mt-0.5 ${a.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{a.text}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.time}</p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-gray-400 py-6 text-center">Activity from leads and funded deals will appear here.</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Funded Chart */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Funded Deals</h2>
          <p className="text-xs text-gray-500 mt-0.5">Capital funding volume — last 6 months</p>
        </div>
        <div className="px-5 py-4">
          {hasChartData ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A97AE' }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#8A97AE' }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Funded']}
                    contentStyle={{
                      backgroundColor: '#18233C',
                      border: '1px solid #33415F',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="funded" name="funded" fill="#2E6BFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400">
              Funding volume will chart here once deals are funded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
