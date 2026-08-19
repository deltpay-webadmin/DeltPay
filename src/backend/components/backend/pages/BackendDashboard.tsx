import React, { useMemo, useState } from 'react';
import {
  Zap, AlertTriangle, Landmark, Info, BarChart3, Activity, HeartPulse,
} from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';
import { Money, Overline, KpiTile, StatusPill, Card, HeroPanel, Btn } from '../../dp';
import { useLeads, useUnderwriting, useMerchants } from '../crmStore';
import { useCapital, type CapitalDeal } from '../capitalStore';

// ─── Derived alert model ────────────────────────────────────────
type AlertType = 'chargeback' | 'interchange' | 'risk' | 'capital' | 'info';

interface DerivedAlert {
  id: string;
  type: AlertType;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  body: string;
  merchant: string | null;
  to: string;
}

const TYPE_ICON: Record<string, { Icon: React.ElementType; cls: string }> = {
  chargeback: { Icon: Zap, cls: 'text-(--dp-danger) bg-[rgba(242,86,91,0.12)]' },
  interchange: { Icon: BarChart3, cls: 'text-(--dp-warning) bg-[rgba(240,180,41,0.12)]' },
  risk: { Icon: AlertTriangle, cls: 'text-(--dp-warning) bg-[rgba(240,180,41,0.12)]' },
  capital: { Icon: Landmark, cls: 'text-[#A794FF] bg-[rgba(124,91,255,0.14)]' },
  info: { Icon: Info, cls: 'text-(--dp-text-muted) bg-white/[0.06]' },
};

const fmtK = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}K` : `$${Math.round(n)}`;

/** Build live alerts from portfolio state — no canned notifications. */
function deriveAlerts(deals: CapitalDeal[], merchants: ReturnType<typeof useMerchants>): DerivedAlert[] {
  const alerts: DerivedAlert[] = [];
  for (const d of deals) {
    if (d.status === 'default') {
      alerts.push({
        id: `default-${d.id}`, type: 'capital', severity: 'critical',
        title: `Default — ${d.merchant}`,
        body: `${d.daysInDefault > 0 ? `${d.daysInDefault} days in default · ` : ''}${fmtK(d.totalOwed - d.collected)} outstanding on ${d.id}`,
        merchant: d.merchant, to: `/deals/${d.id}`,
      });
    } else if (d.achStatus === 'suspended') {
      alerts.push({
        id: `ach-susp-${d.id}`, type: 'capital', severity: 'critical',
        title: `ACH suspended — ${d.merchant}`,
        body: `Daily debit halted on ${d.id} · ${fmtK(d.totalOwed - d.collected)} outstanding`,
        merchant: d.merchant, to: `/deals/${d.id}`,
      });
    } else if (d.achStatus === 'nsf-retry') {
      alerts.push({
        id: `nsf-${d.id}`, type: 'capital', severity: 'warning',
        title: `NSF retry — ${d.merchant}`,
        body: `Daily ACH ($${d.dailyDebit || d.dailyPayment || 0}) bouncing on ${d.id}`,
        merchant: d.merchant, to: `/deals/${d.id}`,
      });
    } else if (d.status === 'slow') {
      alerts.push({
        id: `slow-${d.id}`, type: 'risk', severity: 'warning',
        title: `Slow pay — ${d.merchant}`,
        body: `Collections decelerating on ${d.id}${d.weeksBehind ? ` · ${d.weeksBehind} wks behind` : ''}`,
        merchant: d.merchant, to: `/deals/${d.id}`,
      });
    }
  }
  for (const m of merchants) {
    if (m.status === 'Active' && m.healthScore < 50) {
      alerts.push({
        id: `health-${m.id}`, type: 'risk', severity: 'warning',
        title: `Health ${m.healthScore} — ${m.name}`,
        body: 'Health score below 50 · churn risk',
        merchant: m.name, to: `/merchants/${m.id}`,
      });
    }
  }
  const rank = { critical: 0, warning: 1, info: 2 } as const;
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

/** Sum ledger collections by calendar month for the last 6 months. */
function collectionsTrend(deals: CapitalDeal[]) {
  const now = new Date();
  const months: { key: string; month: string; net: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      net: 0,
    });
  }
  const byKey = new Map(months.map(m => [m.key, m]));
  for (const deal of deals) {
    for (const p of deal.payments || []) {
      const bucket = byKey.get(p.payment_date.slice(0, 7));
      if (bucket) bucket.net += p.amount;
    }
  }
  return months;
}

// ─── Metric cell for the snapshot cards ─────────────────────────
function Metric({ label, value, tone }: { label: string; value: string | number; tone?: 'success' | 'danger' | 'warning' | 'accent' }) {
  const color =
    tone === 'success' ? 'text-(--dp-success)'
    : tone === 'danger' ? 'text-(--dp-danger)'
    : tone === 'warning' ? 'text-(--dp-warning)'
    : tone === 'accent' ? 'text-(--dp-accent-text)'
    : 'text-(--dp-text)';
  return (
    <div>
      <p className="text-[11px] font-medium text-(--dp-text-faint) leading-tight">{label}</p>
      <p className={`mt-0.5 text-[17px] font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

// ─── COMPONENT ──────────────────────────────────────────────────
export function BackendDashboard() {
  const { navigate } = useAppNavigate();
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [alertFilter, setAlertFilter] = useState<'all' | AlertType>('all');

  const leads = useLeads();
  const underwriting = useUnderwriting();
  const merchants = useMerchants();
  const { deals } = useCapital();

  // ── Pipeline ──
  const weekAgo = Date.now() - 7 * 86400000;
  const newThisWeek = leads.filter(l => l.createdAt && new Date(l.createdAt).getTime() >= weekAgo).length;
  const wonLeads = leads.filter(l => l.status === 'Won').length;
  const pipeline = {
    leads: leads.length,
    newThisWeek,
    inProgress: leads.filter(l => l.status === 'In Progress').length,
    won: wonLeads,
    conversionRate: leads.length > 0 ? Math.round((wonLeads / leads.length) * 1000) / 10 : 0,
    qualified: leads.filter(l => l.stage === 'Qualified').length,
    uwQueue: underwriting.filter(a => a.stage !== 'Approved' && a.stage !== 'Declined').length,
    uwPending: underwriting.filter(a => a.stage === 'Final Review').length,
  };

  // ── Merchants ──
  const activeMerchants = merchants.filter(m => m.status === 'Active');
  const totalVolume = merchants.reduce((s, m) => s + m.monthlyVolume, 0);
  const subRevenue = merchants.reduce((s, m) => s + m.monthlyFee, 0);
  const avgHealth = merchants.length > 0
    ? Math.round(merchants.reduce((s, m) => s + m.healthScore, 0) / merchants.length)
    : 0;
  const churnRisk = activeMerchants.filter(m => m.healthScore < 50).length;

  // ── Capital ──
  const openDeals = deals.filter(d => d.status !== 'paid' && d.status !== 'approved');
  const capital = {
    deployed: openDeals.reduce((s, d) => s + d.fundedAmt, 0),
    outstanding: openDeals.reduce((s, d) => s + Math.max(0, d.totalOwed - d.collected), 0),
    grossCollected: deals.reduce((s, d) => s + d.collected, 0),
    dailyACH: deals.filter(d => d.status === 'active').reduce((s, d) => s + (d.dailyDebit || d.dailyPayment || 0), 0),
    defaultRate: deals.length > 0 ? Math.round((deals.filter(d => d.status === 'default').length / deals.length) * 1000) / 10 : 0,
    activeDeals: deals.filter(d => d.status === 'active').length,
    renewalPipeline: deals.filter(d => d.renewalEligible).length,
    fundomateComm: deals.filter(d => d.channel === 'fundomate').reduce((s, d) => s + d.referralCommission, 0),
  };

  // Net revenue: subscriptions + realized factor profit + referral commissions.
  const factorProfit = deals.reduce((s, d) => s + Math.max(0, d.collected - d.fundedAmt), 0);
  const netRevenue = subRevenue + factorProfit + capital.fundomateComm;

  const trend = useMemo(() => collectionsTrend(deals), [deals]);
  const maxTrend = Math.max(1, ...trend.map(r => r.net));
  const hasTrendData = trend.some(r => r.net > 0);

  const topMerchants = [...merchants].sort((a, b) => b.monthlyVolume - a.monthlyVolume).slice(0, 5);

  // ── Team snapshot (merchants grouped by agent) ──
  const team = useMemo(() => {
    const byAgent = new Map<string, { name: string; vol: number; merchants: number }>();
    for (const m of merchants) {
      const key = m.agent || 'Unassigned';
      const row = byAgent.get(key) || { name: key, vol: 0, merchants: 0 };
      row.vol += m.monthlyVolume;
      row.merchants += 1;
      byAgent.set(key, row);
    }
    return [...byAgent.values()].sort((a, b) => b.vol - a.vol);
  }, [merchants]);

  const alerts = useMemo(() => deriveAlerts(deals, merchants), [deals, merchants]);
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const filteredAlerts = alertFilter === 'all' ? alerts : alerts.filter(a => a.type === alertFilter);

  const periodLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1360px] mx-auto px-4 lg:px-8 py-6 space-y-6">

        {/* ═══ HERO BALANCE CARD — the number is the hero ═══ */}
        <HeroPanel>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-8 p-6 lg:p-8">
            <div className="flex flex-col justify-center">
              <Overline className="text-white/60">Net revenue · {periodLabel}</Overline>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Money
                  value={netRevenue}
                  className="text-[44px] leading-none font-bold text-white tracking-[-0.02em]"
                />
              </div>
              <p className="mt-3 text-[14px] text-white/60">
                {fmtK(totalVolume)} monthly volume across {merchants.length} merchant{merchants.length !== 1 ? 's' : ''} ·{' '}
                {capital.activeDeals} active capital deal{capital.activeDeals !== 1 ? 's' : ''}
              </p>
              <div className="mt-6 flex items-center gap-2">
                <Btn variant="primary" size="sm" onClick={() => navigate('/financials')}>
                  View financials
                </Btn>
                <button
                  onClick={() => navigate('/capital')}
                  className="inline-flex items-center gap-1.5 h-8 px-4 rounded-[10px] text-[12px] font-bold text-white/80 border border-white/20 hover:bg-white/10 transition-colors"
                >
                  <Landmark className="w-3.5 h-3.5" /> Capital portfolio
                </button>
              </div>
            </div>

            {/* 2×2 glass KPI tiles */}
            <div className="grid grid-cols-2 gap-3 content-center">
              <KpiTile glass label="Total volume" value={fmtK(totalVolume)} sub="Monthly, all merchants" />
              <KpiTile glass label="Subscriptions" value={fmtK(subRevenue)} sub="Recurring / month" />
              <KpiTile glass label="Factor profit" value={fmtK(factorProfit)} sub="Realized to date" />
              <KpiTile glass label="Avg health" value={avgHealth} sub={`${churnRisk} churn risk`} />
            </div>
          </div>
        </HeroPanel>

        {/* ═══ CRITICAL ALERT STRIP ═══ */}
        {criticalCount > 0 && (
          <div className="flex items-center justify-between gap-4 rounded-[12px] border border-[rgba(242,86,91,.35)] bg-[rgba(242,86,91,.08)] px-5 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <StatusPill tone="danger">{criticalCount} critical</StatusPill>
              <p className="text-[13px] text-(--dp-text-secondary) truncate">
                {alerts.filter(a => a.severity === 'critical').map(a => a.merchant || a.title).filter(Boolean).join(' · ')}
              </p>
            </div>
            <button
              onClick={() => setAlertFilter('capital')}
              className="shrink-0 text-[12px] font-bold text-(--dp-danger) hover:underline"
            >
              Review →
            </button>
          </div>
        )}

        {/* ═══ MAIN GRID ═══ */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ─── LEFT ─── */}
          <div className="space-y-6 min-w-0">

            {/* Collections trend from the real payment ledger */}
            <Card
              title="Capital collections"
              action={<span className="text-[12px] text-(--dp-text-faint)">Last 6 months</span>}
            >
              {hasTrendData ? (
                <div className="flex items-end justify-between gap-3 h-[170px] pt-2">
                  {trend.map((r, i) => {
                    const pct = (r.net / maxTrend) * 100;
                    const isCurrent = i === trend.length - 1;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full gap-1.5">
                        <span className={`text-[11px] font-semibold tabular-nums ${isCurrent ? 'text-(--dp-text)' : 'text-(--dp-text-faint)'}`}>
                          {r.net > 0 ? fmtK(r.net) : '—'}
                        </span>
                        <div className="flex-1 w-full flex flex-col justify-end">
                          <div
                            className={`w-full rounded-[6px] ${isCurrent ? 'bg-(--dp-accent)' : 'bg-(--dp-accent-soft)'}`}
                            style={{ height: `${Math.max(pct, 2)}%`, transition: 'height .5s ease', minHeight: 4 }}
                          />
                        </div>
                        <span className={`text-[11px] ${isCurrent ? 'text-(--dp-accent-text) font-bold' : 'text-(--dp-text-faint) font-medium'}`}>
                          {r.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[170px] flex items-center justify-center text-[13px] text-(--dp-text-faint)">
                  No payments recorded yet — collections will chart here as they post.
                </div>
              )}
            </Card>

            {/* Pipeline + Capital snapshots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                title={<span className="inline-flex items-center gap-2"><Activity className="w-4 h-4 text-(--dp-accent-text)" />Pipeline</span>}
                action={<button onClick={() => navigate('/leads')} className="text-[12px] font-bold text-(--dp-accent-text) hover:underline">View →</button>}
              >
                <div className="grid grid-cols-4 gap-3">
                  <Metric label="Leads" value={pipeline.leads} />
                  <Metric label="New (7d)" value={pipeline.newThisWeek} tone="accent" />
                  <Metric label="Active" value={pipeline.inProgress} />
                  <Metric label="Won" value={pipeline.won} tone="success" />
                </div>
                <div className="h-px bg-(--dp-border) my-3.5" />
                <div className="grid grid-cols-4 gap-3">
                  <Metric label="Conversion" value={`${pipeline.conversionRate}%`} />
                  <Metric label="Qualified" value={pipeline.qualified} />
                  <Metric label="UW queue" value={pipeline.uwQueue} />
                  <Metric label="UW review" value={pipeline.uwPending} tone={pipeline.uwPending > 0 ? 'warning' : undefined} />
                </div>
              </Card>

              <Card
                title={<span className="inline-flex items-center gap-2"><Landmark className="w-4 h-4 text-(--dp-accent-text)" />Capital</span>}
                action={<button onClick={() => navigate('/capital')} className="text-[12px] font-bold text-(--dp-accent-text) hover:underline">View →</button>}
              >
                <div className="grid grid-cols-4 gap-3">
                  <Metric label="Deployed" value={fmtK(capital.deployed)} />
                  <Metric label="Outstanding" value={fmtK(capital.outstanding)} />
                  <Metric label="Collected" value={fmtK(capital.grossCollected)} tone="success" />
                  <Metric label="Daily ACH" value={`$${Math.round(capital.dailyACH)}`} />
                </div>
                <div className="h-px bg-(--dp-border) my-3.5" />
                <div className="grid grid-cols-4 gap-3">
                  <Metric label="Default" value={`${capital.defaultRate}%`} tone={capital.defaultRate > 5 ? 'danger' : 'success'} />
                  <Metric label="Active" value={capital.activeDeals} />
                  <Metric label="Renewals" value={capital.renewalPipeline} />
                  <Metric label="Fundomate" value={fmtK(capital.fundomateComm)} tone="accent" />
                </div>
              </Card>
            </div>

            {/* Top merchants — spec table: overline headers, hairlines, amounts right */}
            <Card
              title="Top merchants by volume"
              action={<button onClick={() => navigate('/merchants')} className="text-[12px] font-bold text-(--dp-accent-text) hover:underline">All merchants →</button>}
              padded={false}
            >
              {topMerchants.length > 0 ? (
                <table className="w-full mt-1">
                  <thead>
                    <tr className="border-b border-(--dp-border)">
                      <th className="px-5 py-2.5 text-left">Merchant</th>
                      <th className="px-5 py-2.5 text-right">Volume</th>
                      <th className="px-5 py-2.5 text-right">Sub rev</th>
                      <th className="px-5 py-2.5 text-left">Health</th>
                      <th className="px-5 py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topMerchants.map((m, i) => (
                      <tr
                        key={m.id}
                        className={`h-[52px] hover:bg-(--dp-bg-raised) transition-colors cursor-pointer ${i < topMerchants.length - 1 ? 'border-b border-(--dp-border)' : ''}`}
                        onClick={() => navigate(`/merchants/${m.id}`)}
                      >
                        <td className="px-5 text-[13px] font-semibold text-(--dp-text)">{m.name}</td>
                        <td className="px-5 text-[13px] text-right tabular-nums text-(--dp-text-secondary)">{fmtK(m.monthlyVolume)}</td>
                        <td className="px-5 text-[13px] text-right tabular-nums font-semibold text-(--dp-text)">${m.monthlyFee.toLocaleString()}/mo</td>
                        <td className="px-5">
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${m.healthScore >= 80 ? 'bg-(--dp-success)' : m.healthScore >= 60 ? 'bg-(--dp-warning)' : 'bg-(--dp-danger)'}`}
                                style={{ width: `${m.healthScore}%` }}
                              />
                            </div>
                            <span className="text-[12px] font-bold tabular-nums text-(--dp-text-muted)">{m.healthScore}</span>
                          </div>
                        </td>
                        <td className="px-5 text-right">
                          {m.status === 'Active'
                            ? <StatusPill tone="success">Active</StatusPill>
                            : m.status === 'Pending'
                              ? <StatusPill tone="warning">Pending</StatusPill>
                              : <StatusPill tone="danger">Inactive</StatusPill>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-[13px] text-(--dp-text-faint)">
                  No merchants yet — add your first from the Merchants page.
                </div>
              )}
            </Card>
          </div>

          {/* ─── RIGHT: Alerts + team ─── */}
          <div className="space-y-6 xl:sticky xl:top-6">
            <Card
              title={
                <span className="inline-flex items-center gap-2">
                  Alerts
                  {alerts.length > 0 && <StatusPill tone={criticalCount > 0 ? 'danger' : 'warning'}>{alerts.length}</StatusPill>}
                </span>
              }
              padded={false}
            >
              <div className="flex gap-1.5 px-5 pb-3 pt-1">
                {(['all', 'capital', 'risk'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setAlertFilter(f)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                      alertFilter === f
                        ? 'border-(--dp-accent) bg-(--dp-accent-soft) text-(--dp-accent-text)'
                        : 'border-(--dp-border) text-(--dp-text-muted) hover:text-(--dp-text)'
                    }`}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="max-h-[520px] overflow-y-auto border-t border-(--dp-border)">
                {filteredAlerts.map((a, idx) => {
                  const t = TYPE_ICON[a.type] || TYPE_ICON.info;
                  const isExp = expandedAlert === a.id;
                  return (
                    <div
                      key={a.id}
                      onClick={() => setExpandedAlert(isExp ? null : a.id)}
                      className={`px-5 py-3.5 cursor-pointer transition-colors hover:bg-(--dp-bg-raised) ${idx < filteredAlerts.length - 1 ? 'border-b border-(--dp-border)' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-7 h-7 rounded-[8px] ${t.cls} flex items-center justify-center shrink-0 mt-0.5`}>
                          <t.Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="font-mono text-[10px] text-(--dp-text-faint)">live</span>
                            {a.severity === 'critical' && <StatusPill tone="danger">Critical</StatusPill>}
                          </div>
                          <p className="text-[13px] font-bold text-(--dp-text) leading-snug">{a.title}</p>
                          <p className="text-[12px] text-(--dp-text-muted) leading-relaxed mt-0.5">{a.body}</p>
                        </div>
                      </div>
                      {isExp && (
                        <div className="mt-3 pt-3 border-t border-(--dp-border)">
                          <div className="flex gap-1.5">
                            <Btn
                              size="sm"
                              variant="primary"
                              onClick={e => {
                                e.stopPropagation();
                                navigate(a.to);
                              }}
                            >
                              View
                            </Btn>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredAlerts.length === 0 && (
                  <div className="py-10 px-5 text-center">
                    <HeartPulse className="w-5 h-5 text-(--dp-success) mx-auto mb-2" />
                    <p className="text-[13px] text-(--dp-text-muted)">
                      All clear — no open alerts on the portfolio.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Team snapshot">
              {team.length > 0 ? (
                <div className="space-y-3">
                  {team.map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-(--dp-accent-soft) flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-(--dp-accent-text)">
                          {a.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-(--dp-text) truncate">{a.name}</p>
                        <p className="text-[11px] text-(--dp-text-faint)">{a.merchants} merchant{a.merchants !== 1 ? 's' : ''}</p>
                      </div>
                      <span className="text-[13px] font-bold tabular-nums text-(--dp-text-secondary)">{fmtK(a.vol)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-(--dp-text-faint) py-2">
                  Agents appear here once merchants are assigned.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
