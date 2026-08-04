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
import { useResiduals } from '../residualsStore';
import { useDealSubmissions } from '../dealSubmissionsStore';
import { useAppNavigate } from '../NavigationContext';
import { tierForAccounts, nextTier, fmtUsd } from '../agentComp';
import { Target, AlertTriangle, ArrowRight, HeartPulse } from 'lucide-react';

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
  const { rows: residualRows } = useResiduals();
  const { submissions } = useDealSubmissions();
  const { navigate } = useAppNavigate();

  // ── Tier ladder progress (active accounts drive the 50/60/70 split) ──
  const activeAccounts = merchants.filter(m => m.status === 'Active').length;
  const tier = tierForAccounts(activeAccounts);
  const next = nextTier(activeAccounts);
  const tierPct = next
    ? Math.min(100, Math.round((activeAccounts / next.minAccounts) * 100))
    : 100;

  // ── Deal pipeline: pending bonuses from submissions not yet activated ──
  const pendingDeals = submissions.filter(s =>
    ['Submitted', 'Underwriting', 'Approved'].includes(s.status),
  );
  const pendingBonuses = pendingDeals.reduce((s, d) => s + d.expectedBonus, 0);

  // ── Book health: merchants whose volume dropped >25% vs the prior residual
  //    period, or who vanished from the latest period entirely ──
  const healthFlags = useMemo(() => {
    const periods = [...new Set(residualRows.map(r => r.period))].sort().reverse();
    if (periods.length < 2) return [];
    const [latest, prev] = periods;
    const latestBy = new Map(
      residualRows.filter(r => r.period === latest).map(r => [r.merchantName, r]),
    );
    const flags: { merchant: string; note: string }[] = [];
    for (const r of residualRows.filter(x => x.period === prev)) {
      const now = latestBy.get(r.merchantName);
      if (!now) {
        flags.push({ merchant: r.merchantName, note: 'No processing in the latest period' });
      } else if (r.monthlyVolume > 0 && now.monthlyVolume < r.monthlyVolume * 0.75) {
        const drop = Math.round((1 - now.monthlyVolume / r.monthlyVolume) * 100);
        flags.push({ merchant: r.merchantName, note: `Volume down ${drop}% month over month` });
      }
    }
    return flags.slice(0, 3);
  }, [residualRows]);

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

      {/* Program row: tier ladder + deal pipeline + book health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tier progress */}
        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 flex items-center gap-1.5"><Target className="w-4 h-4 text-indigo-500" /> Tier Ladder</p>
            <span className="text-xs font-bold text-indigo-600">{Math.round(tier.split * 100)}% split</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{tier.label}</p>
          <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${tierPct}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {next
              ? `${next.minAccounts - activeAccounts} more active account${next.minAccounts - activeAccounts !== 1 ? 's' : ''} to Tier ${next.tier} (${Math.round(next.split * 100)}%)`
              : 'Top of the ladder — 70% on every account'}
          </p>
        </div>

        {/* Deal pipeline */}
        <button
          onClick={() => navigate('/submit-deal')}
          className="bg-white rounded-[8px] border border-gray-200 p-5 text-left hover:border-indigo-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 flex items-center gap-1.5"><Send className="w-4 h-4 text-indigo-500" /> Deals in Motion</p>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {pendingDeals.length} pending · <span className="text-indigo-600">{fmtUsd(pendingBonuses)}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Bonuses waiting on activation. Submit the next deal — it takes two minutes.
          </p>
        </button>

        {/* Book health */}
        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-2">
            <HeartPulse className="w-4 h-4 text-indigo-500" /> Book Health
          </p>
          {healthFlags.length === 0 ? (
            <>
              <p className="text-lg font-bold text-emerald-600">Healthy</p>
              <p className="text-xs text-gray-500 mt-2">No merchants flagged. Declining volume shows up here first — so you can save the account before the residual drops.</p>
            </>
          ) : (
            <div className="space-y-2">
              {healthFlags.map(f => (
                <div key={f.merchant} className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700"><span className="font-semibold">{f.merchant}</span> — {f.note}. Worth a call this week.</p>
                </div>
              ))}
            </div>
          )}
        </div>
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
