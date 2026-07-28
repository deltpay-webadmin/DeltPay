import React, { useState } from 'react';
import {
  RefreshCw, Zap, AlertTriangle, Landmark, Info, BarChart3, Activity,
} from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';
import { Money, Overline, DeltaPill, KpiTile, StatusPill, Card, HeroPanel, Btn } from '../../dp';

// ─── ALERTS / NOTIFICATIONS ─────────────────────────────────────
const ALERTS = [
  { id: 1, type: 'chargeback' as const, severity: 'critical' as const, time: '12m ago', title: 'Chargeback — Bella Vista Restaurant', body: 'Visa $487.00 · Reason 13.1 (Merch Not Received) · Deadline Apr 25', merchant: 'Bella Vista Restaurant', agent: 'Michael Chen', actions: ['Respond', 'View'] },
  { id: 2, type: 'chargeback' as const, severity: 'critical' as const, time: '2h ago', title: 'Chargeback — Metro Diner Group', body: 'MC $215.30 · Reason 4837 (No Auth) · Deadline Apr 22', merchant: 'Metro Diner Group', agent: 'James Miller', actions: ['Respond', 'View'] },
  { id: 3, type: 'interchange' as const, severity: 'warning' as const, time: '3h ago', title: 'IC Padding — Sunrise Cafe', body: 'Visa Qual +14bps ($19.95/mo · $239/yr est. overcharge)', merchant: 'Sunrise Cafe & Bakery', agent: 'Sarah Johnson', actions: ['Verify', 'Flag North'] },
  { id: 4, type: 'chargeback' as const, severity: 'warning' as const, time: '5h ago', title: 'CB Rate 0.72% — Harbor Marine', body: '3 chargebacks in 30 days. Exceeds 0.5% threshold. VDMP risk.', merchant: 'Harbor Marine Supply', agent: 'James Miller', actions: ['Risk Profile'] },
  { id: 5, type: 'risk' as const, severity: 'warning' as const, time: '1d ago', title: 'Volume ↓28% — Green Leaf Landscaping', body: '$58.4K → $42.1K MoM. Lens flags attrition risk.', merchant: 'Green Leaf Landscaping', agent: 'Sarah Johnson', actions: ['Lens Report'] },
  { id: 6, type: 'capital' as const, severity: 'critical' as const, time: '4d ago', title: 'NSF ×3 — Little Havana Barbershop', body: '3rd consecutive NSF on daily ACH ($68). Flagged Slow Pay.', merchant: 'Little Havana Barbershop', agent: null, actions: ['Collection Status'] },
  { id: 7, type: 'info' as const, severity: 'info' as const, time: '3d ago', title: 'April 2026 IC Schedule Published', body: 'Visa L2 sunset. CEDP Product 3 mandatory. Re-verify portfolio.', merchant: null, agent: null, actions: ['View Changes'] },
];

type AlertType = typeof ALERTS[number]['type'];

// ─── DASHBOARD DATA ─────────────────────────────────────────────
const PIPELINE = { leads: 8, newThisWeek: 2, inProgress: 5, won: 1, conversionRate: 12.5, avgTimeToFund: 5.2, uwQueue: 4, uwPending: 2 };
const MERCHANTS_DATA = { total: 8, active: 8, avgHealth: 78, churnRisk: 1, totalVolume: 522700, avgEffRate: 3.42, alertCount: 4 };
const CAPITAL = { deployed: 115000, outstanding: 72100, grossCollected: 82920, netAfterCOC: -42300, dailyACH: 861, defaultRate: 8.3, activeDeals: 7, renewalPipeline: 4, fundomateComm: 9660 };
const RESIDUALS = { period: 'March 2026', totalVolume: 522700, netRevenue: 11466.40, agentPayouts: 5733.20, deltRetained: 5733.20, merchants: 8 };
const TEAM = { agents: 4, topAgent: 'Michael Chen', topAgentVol: 187200, totalCommissions: 5733.20 };

const REVENUE_TREND = [
  { month: 'Oct', net: 6820, vol: 285000 },
  { month: 'Nov', net: 7450, vol: 318000 },
  { month: 'Dec', net: 8100, vol: 355000 },
  { month: 'Jan', net: 9200, vol: 412000 },
  { month: 'Feb', net: 10100, vol: 468000 },
  { month: 'Mar', net: 11466, vol: 522700 },
];
const maxRev = Math.max(...REVENUE_TREND.map(r => r.net));

const TOP_MERCHANTS = [
  { name: 'TechStart Solutions', vol: 125000, net: 2750, health: 92, alerts: 0 },
  { name: 'Metro Diner Group', vol: 89200, net: 1961, health: 68, alerts: 1 },
  { name: 'Harbor Marine Supply', vol: 76500, net: 1683, health: 55, alerts: 2 },
  { name: 'Bella Vista Restaurant', vol: 68900, net: 1515, health: 61, alerts: 1 },
  { name: 'Urban Fitness Center', vol: 52300, net: 1150, health: 85, alerts: 0 },
];

const TEAM_SNAP = [
  { name: 'Sarah Johnson', vol: '$131.9K', merchants: 3 },
  { name: 'Michael Chen', vol: '$187.2K', merchants: 3 },
  { name: 'James Miller', vol: '$165.7K', merchants: 2 },
  { name: 'Lyndon', vol: '$0', merchants: 0 },
];

const TYPE_ICON: Record<string, { Icon: React.ElementType; cls: string }> = {
  chargeback: { Icon: Zap, cls: 'text-(--dp-danger) bg-[rgba(242,86,91,0.12)]' },
  interchange: { Icon: BarChart3, cls: 'text-(--dp-warning) bg-[rgba(240,180,41,0.12)]' },
  risk: { Icon: AlertTriangle, cls: 'text-(--dp-warning) bg-[rgba(240,180,41,0.12)]' },
  capital: { Icon: Landmark, cls: 'text-[#A794FF] bg-[rgba(124,91,255,0.14)]' },
  info: { Icon: Info, cls: 'text-(--dp-text-muted) bg-white/[0.06]' },
};

const fmtK = (n: number) => `$${(n / 1000).toFixed(0)}K`;

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
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);
  const [alertFilter, setAlertFilter] = useState<'all' | AlertType>('all');

  const criticalCount = ALERTS.filter(a => a.severity === 'critical').length;
  const filteredAlerts = alertFilter === 'all' ? ALERTS : ALERTS.filter(a => a.type === alertFilter);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1360px] mx-auto px-4 lg:px-8 py-6 space-y-6">

        {/* ═══ HERO BALANCE CARD — the number is the hero ═══ */}
        <HeroPanel>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-8 p-6 lg:p-8">
            <div className="flex flex-col justify-center">
              <Overline className="text-white/60">Net revenue · {RESIDUALS.period}</Overline>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Money
                  value={RESIDUALS.netRevenue}
                  className="text-[44px] leading-none font-bold text-white tracking-[-0.02em]"
                />
                <DeltaPill value={12.5} onGlass />
              </div>
              <p className="mt-3 text-[14px] text-white/60">
                {fmtK(RESIDUALS.totalVolume)} processed across {RESIDUALS.merchants} merchants ·{' '}
                <Money value={RESIDUALS.agentPayouts} cents={false} className="text-white/80" /> paid to {TEAM.agents} agents
              </p>
              <div className="mt-6 flex items-center gap-2">
                <Btn variant="primary" size="sm" onClick={() => navigate('/financials')}>
                  View financials
                </Btn>
                <button className="inline-flex items-center gap-1.5 h-8 px-4 rounded-[10px] text-[12px] font-bold text-white/80 border border-white/20 hover:bg-white/10 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
            </div>

            {/* 2×2 glass KPI tiles */}
            <div className="grid grid-cols-2 gap-3 content-center">
              <KpiTile glass label="Total volume" value={fmtK(RESIDUALS.totalVolume)} delta={11.7} />
              <KpiTile glass label="Delt retained" value={fmtK(RESIDUALS.deltRetained)} sub="After agent splits" />
              <KpiTile glass label="Effective rate" value={`${MERCHANTS_DATA.avgEffRate}%`} sub="Portfolio average" />
              <KpiTile glass label="Avg health" value={MERCHANTS_DATA.avgHealth} delta={-2.1} invertDelta={false} sub={`${MERCHANTS_DATA.churnRisk} churn risk`} />
            </div>
          </div>
        </HeroPanel>

        {/* ═══ CRITICAL ALERT STRIP ═══ */}
        {criticalCount > 0 && (
          <div className="flex items-center justify-between gap-4 rounded-[12px] border border-[rgba(242,86,91,.35)] bg-[rgba(242,86,91,.08)] px-5 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <StatusPill tone="danger">{criticalCount} critical</StatusPill>
              <p className="text-[13px] text-(--dp-text-secondary) truncate">
                {ALERTS.filter(a => a.severity === 'critical').map(a => a.merchant || a.title).filter(Boolean).join(' · ')}
              </p>
            </div>
            <button
              onClick={() => setAlertFilter('chargeback')}
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

            {/* Revenue trend — title states the insight */}
            <Card
              title="Net revenue up 13.5% this month"
              action={<span className="text-[12px] text-(--dp-text-faint)">Last 6 months</span>}
            >
              <div className="flex items-end justify-between gap-3 h-[170px] pt-2">
                {REVENUE_TREND.map((r, i) => {
                  const pct = (r.net / maxRev) * 100;
                  const isCurrent = i === REVENUE_TREND.length - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center h-full gap-1.5">
                      <span className={`text-[11px] font-semibold tabular-nums ${isCurrent ? 'text-(--dp-text)' : 'text-(--dp-text-faint)'}`}>
                        ${(r.net / 1000).toFixed(1)}K
                      </span>
                      <div className="flex-1 w-full flex flex-col justify-end">
                        <div
                          className={`w-full rounded-[6px] ${isCurrent ? 'bg-(--dp-accent)' : 'bg-(--dp-accent-soft)'}`}
                          style={{ height: `${pct}%`, transition: 'height .5s ease', minHeight: 4 }}
                        />
                      </div>
                      <span className={`text-[11px] ${isCurrent ? 'text-(--dp-accent-text) font-bold' : 'text-(--dp-text-faint) font-medium'}`}>
                        {r.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Pipeline + Capital snapshots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                title={<span className="inline-flex items-center gap-2"><Activity className="w-4 h-4 text-(--dp-accent-text)" />Pipeline</span>}
                action={<button onClick={() => navigate('/leads')} className="text-[12px] font-bold text-(--dp-accent-text) hover:underline">View →</button>}
              >
                <div className="grid grid-cols-4 gap-3">
                  <Metric label="Leads" value={PIPELINE.leads} />
                  <Metric label="New" value={PIPELINE.newThisWeek} tone="accent" />
                  <Metric label="Active" value={PIPELINE.inProgress} />
                  <Metric label="Won" value={PIPELINE.won} tone="success" />
                </div>
                <div className="h-px bg-(--dp-border) my-3.5" />
                <div className="grid grid-cols-4 gap-3">
                  <Metric label="Conversion" value={`${PIPELINE.conversionRate}%`} />
                  <Metric label="Avg fund" value={`${PIPELINE.avgTimeToFund}d`} />
                  <Metric label="UW queue" value={PIPELINE.uwQueue} />
                  <Metric label="UW pending" value={PIPELINE.uwPending} tone="warning" />
                </div>
              </Card>

              <Card
                title={<span className="inline-flex items-center gap-2"><Landmark className="w-4 h-4 text-(--dp-accent-text)" />Capital</span>}
                action={<button onClick={() => navigate('/capital')} className="text-[12px] font-bold text-(--dp-accent-text) hover:underline">View →</button>}
              >
                <div className="grid grid-cols-4 gap-3">
                  <Metric label="Deployed" value={fmtK(CAPITAL.deployed)} />
                  <Metric label="Outstanding" value={fmtK(CAPITAL.outstanding)} />
                  <Metric label="Collected" value={fmtK(CAPITAL.grossCollected)} tone="success" />
                  <Metric label="Daily ACH" value={`$${CAPITAL.dailyACH}`} />
                </div>
                <div className="h-px bg-(--dp-border) my-3.5" />
                <div className="grid grid-cols-4 gap-3">
                  <Metric label="Default" value={`${CAPITAL.defaultRate}%`} tone={CAPITAL.defaultRate > 5 ? 'danger' : 'success'} />
                  <Metric label="Active" value={CAPITAL.activeDeals} />
                  <Metric label="Renewals" value={CAPITAL.renewalPipeline} />
                  <Metric label="Fundomate" value={`$${(CAPITAL.fundomateComm / 1000).toFixed(1)}K`} tone="accent" />
                </div>
              </Card>
            </div>

            {/* Top merchants — spec table: overline headers, hairlines, amounts right */}
            <Card
              title="Top merchants by volume"
              action={<button onClick={() => navigate('/merchants')} className="text-[12px] font-bold text-(--dp-accent-text) hover:underline">All merchants →</button>}
              padded={false}
            >
              <table className="w-full mt-1">
                <thead>
                  <tr className="border-b border-(--dp-border)">
                    <th className="px-5 py-2.5 text-left">Merchant</th>
                    <th className="px-5 py-2.5 text-right">Volume</th>
                    <th className="px-5 py-2.5 text-right">Net rev</th>
                    <th className="px-5 py-2.5 text-left">Health</th>
                    <th className="px-5 py-2.5 text-right">Alerts</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_MERCHANTS.map((m, i) => (
                    <tr
                      key={i}
                      className={`h-[52px] hover:bg-(--dp-bg-raised) transition-colors cursor-pointer ${i < TOP_MERCHANTS.length - 1 ? 'border-b border-(--dp-border)' : ''}`}
                      onClick={() => navigate('/merchants')}
                    >
                      <td className="px-5 text-[13px] font-semibold text-(--dp-text)">{m.name}</td>
                      <td className="px-5 text-[13px] text-right tabular-nums text-(--dp-text-secondary)">{fmtK(m.vol)}</td>
                      <td className="px-5 text-[13px] text-right tabular-nums font-semibold text-(--dp-text)">${m.net.toLocaleString()}</td>
                      <td className="px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${m.health >= 80 ? 'bg-(--dp-success)' : m.health >= 60 ? 'bg-(--dp-warning)' : 'bg-(--dp-danger)'}`}
                              style={{ width: `${m.health}%` }}
                            />
                          </div>
                          <span className="text-[12px] font-bold tabular-nums text-(--dp-text-muted)">{m.health}</span>
                        </div>
                      </td>
                      <td className="px-5 text-right">
                        {m.alerts > 0
                          ? <StatusPill tone="danger">{m.alerts} open</StatusPill>
                          : <StatusPill tone="success">Clean</StatusPill>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* ─── RIGHT: Alerts + team ─── */}
          <div className="space-y-6 xl:sticky xl:top-6">
            <Card
              title={<span className="inline-flex items-center gap-2">Alerts<StatusPill tone="danger">{ALERTS.length}</StatusPill></span>}
              padded={false}
            >
              <div className="flex gap-1.5 px-5 pb-3 pt-1">
                {(['all', 'chargeback', 'interchange', 'risk'] as const).map(f => (
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
                            <span className="font-mono text-[10px] text-(--dp-text-faint)">{a.time}</span>
                            {a.severity === 'critical' && <StatusPill tone="danger">Critical</StatusPill>}
                          </div>
                          <p className="text-[13px] font-bold text-(--dp-text) leading-snug">{a.title}</p>
                          <p className="text-[12px] text-(--dp-text-muted) leading-relaxed mt-0.5">{a.body}</p>
                        </div>
                      </div>
                      {isExp && (
                        <div className="mt-3 pt-3 border-t border-(--dp-border)">
                          {a.merchant && (
                            <p className="text-[12px] text-(--dp-text-muted) mb-2.5">
                              {a.merchant}{a.agent ? ` · ${a.agent}` : ''}
                            </p>
                          )}
                          <div className="flex gap-1.5">
                            {a.actions.map((act, ai) => (
                              <Btn
                                key={ai}
                                size="sm"
                                variant={ai === 0 ? 'primary' : 'ghost'}
                                onClick={e => e.stopPropagation()}
                              >
                                {act}
                              </Btn>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Team snapshot">
              <div className="space-y-3">
                {TEAM_SNAP.map((a, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-(--dp-accent-soft) flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-(--dp-accent-text)">
                        {a.name.split(' ').map(p => p[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-(--dp-text) truncate">{a.name}</p>
                      <p className="text-[11px] text-(--dp-text-faint)">{a.merchants} merchant{a.merchants !== 1 ? 's' : ''}</p>
                    </div>
                    <span className="text-[13px] font-bold tabular-nums text-(--dp-text-secondary)">{a.vol}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
