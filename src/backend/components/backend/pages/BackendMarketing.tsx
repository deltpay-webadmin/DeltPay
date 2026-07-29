import React, { useMemo, useState } from 'react';
import {
  Megaphone, Calendar, ChevronDown, Download, Target,
  MousePointerClick, TrendingUp, DollarSign, Plus,
} from 'lucide-react';
import { KpiTile, Card, StatusPill, Btn } from '../../dp';

// ══════════════════════════════════════
// Marketing performance — ad spend, CAC, ROAS
//
// Reporting-cycle numbers are entered per cycle from the ad platforms
// (Google/Meta exports) until the platform API integrations land; revenue
// is the first-90-day net revenue of merchants funded in the cycle,
// attributed last-non-direct-touch.
// ══════════════════════════════════════

const PERIOD = 'May 25 – Jun 24, 2026';

// ── Cycle KPIs ──
const CYCLE = {
  spend: 18420,
  revenue: 96420,
  funded: 34,
  cac: 542,       // spend / funded
  cacDelta: -6.1, // improving (down)
  roas: 5.2,      // revenue / spend
  roasDelta: 8.4,
  spendDelta: 8.2,
  revenueDelta: 12.4,
  fundedDelta: 13.3,
};

// ── Spend → return funnel ──
// Widths are compressed (not linear) so the bottom stages stay visible,
// mirroring the leadership funnel format.
interface FunnelStage {
  key: string;
  label: string;
  value: number;
  display?: string;      // override for non-count stages (revenue)
  pctOfPrev: number | null;
  width: number;         // % of funnel width, must be monotonically narrowing
  chip: string;          // unit-cost readout for the stage
  target?: { label: string; tone: 'success' | 'warning' };
  final?: boolean;       // green return stage
}

const FUNNEL: FunnelStage[] = [
  { key: 'impressions', label: 'Impressions', value: 1240000, pctOfPrev: null, width: 100, chip: 'CPM $14.85' },
  { key: 'clicks', label: 'Clicks', value: 38400, pctOfPrev: 3.1, width: 88, chip: 'CPC $0.48' },
  { key: 'visits', label: 'Site visits', value: 29600, pctOfPrev: 77.1, width: 79, chip: '$0.62 / visit' },
  { key: 'leads', label: 'Leads', value: 1184, pctOfPrev: 4.0, width: 62, chip: '$15.56 / lead', target: { label: 'target $12 / lead', tone: 'warning' } },
  { key: 'qualified', label: 'Qualified', value: 342, pctOfPrev: 28.9, width: 47, chip: '$53.86 / qualified' },
  { key: 'apps', label: 'Applications', value: 128, pctOfPrev: 37.4, width: 35, chip: '$143.91 / application' },
  { key: 'funded', label: 'Funded', value: 34, pctOfPrev: 26.6, width: 26, chip: 'CAC $541.76', target: { label: 'target $500 · 92%', tone: 'warning' } },
  { key: 'revenue', label: 'Revenue', value: 96420, display: '$96,420', pctOfPrev: null, width: 26, chip: 'ROAS 5.2×', target: { label: 'target 4.0× · 130%', tone: 'success' }, final: true },
];

// Per-channel contribution for the drill-down strip, keyed by stage.
const STAGE_CHANNEL_SPLIT: Record<string, { channel: string; share: number }[]> = {
  impressions: [
    { channel: 'Google Ads', share: 46 }, { channel: 'Meta', share: 34 },
    { channel: 'LinkedIn', share: 12 }, { channel: 'Email', share: 3 }, { channel: 'SMS', share: 5 },
  ],
  clicks: [
    { channel: 'Google Ads', share: 51 }, { channel: 'Meta', share: 29 },
    { channel: 'LinkedIn', share: 8 }, { channel: 'Email', share: 6 }, { channel: 'SMS', share: 6 },
  ],
  visits: [
    { channel: 'Google Ads', share: 52 }, { channel: 'Meta', share: 28 },
    { channel: 'LinkedIn', share: 8 }, { channel: 'Email', share: 6 }, { channel: 'SMS', share: 6 },
  ],
  leads: [
    { channel: 'Google Ads', share: 44 }, { channel: 'Meta', share: 27 },
    { channel: 'LinkedIn', share: 7 }, { channel: 'Email', share: 13 }, { channel: 'SMS', share: 9 },
  ],
  qualified: [
    { channel: 'Google Ads', share: 46 }, { channel: 'Meta', share: 25 },
    { channel: 'LinkedIn', share: 6 }, { channel: 'Email', share: 14 }, { channel: 'SMS', share: 9 },
  ],
  apps: [
    { channel: 'Google Ads', share: 45 }, { channel: 'Meta', share: 26 },
    { channel: 'LinkedIn', share: 8 }, { channel: 'Email', share: 12 }, { channel: 'SMS', share: 9 },
  ],
  funded: [
    { channel: 'Google Ads', share: 44 }, { channel: 'Meta', share: 26 },
    { channel: 'LinkedIn', share: 9 }, { channel: 'Email', share: 12 }, { channel: 'SMS', share: 9 },
  ],
  revenue: [
    { channel: 'Google Ads', share: 42 }, { channel: 'Meta', share: 24 },
    { channel: 'LinkedIn', share: 8 }, { channel: 'Email', share: 15 }, { channel: 'SMS', share: 11 },
  ],
};

// ── Channel efficiency ──
interface ChannelRow {
  name: string;
  spend: number;
  leads: number;
  funded: number;
  cac: number | null;   // null → organic-adjacent, spend too low to be meaningful
  roas: number;
}

const CHANNELS: ChannelRow[] = [
  { name: 'Google Ads', spend: 8900, leads: 521, funded: 15, cac: 593, roas: 4.8 },
  { name: 'Meta', spend: 5200, leads: 320, funded: 9, cac: 578, roas: 4.4 },
  { name: 'LinkedIn', spend: 2100, leads: 83, funded: 3, cac: 700, roas: 3.1 },
  { name: 'SMS', spend: 1500, leads: 106, funded: 3, cac: 500, roas: 5.9 },
  { name: 'Email', spend: 720, leads: 154, funded: 4, cac: 180, roas: 9.6 },
];

// ── Monthly trend: spend vs attributed revenue ──
const TREND = [
  { month: 'Feb', spend: 11200, revenue: 41800 },
  { month: 'Mar', spend: 13400, revenue: 52300 },
  { month: 'Apr', spend: 14100, revenue: 61900 },
  { month: 'May', spend: 16200, revenue: 74500 },
  { month: 'Jun', spend: 18420, revenue: 96420 },
  { month: 'Jul', spend: 19800, revenue: 104100 },
];

const fmt = (n: number) => n.toLocaleString('en-US');
const fmtK = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`);

// ── Funnel row ──
// Trapezoid bars via clip-path: each bar tapers from its own width to the
// next stage's width, so the stack reads as one continuous funnel.
function FunnelRow({
  stage,
  nextWidth,
  selected,
  onSelect,
}: {
  stage: FunnelStage;
  nextWidth: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const wTop = stage.width;
  const wBottom = stage.final ? stage.width : nextWidth;
  const xTop = (100 - wTop) / 2;
  const xBottom = (100 - wBottom) / 2;
  // Ink ramps with depth; the return stage flips to success green.
  const depth = 1 - stage.width / 100; // 0 wide → 1 narrow
  const fill = stage.final
    ? 'var(--dp-success)'
    : `color-mix(in srgb, var(--dp-accent) ${Math.round(18 + depth * 74)}%, var(--dp-bg-card))`;
  const darkInk = depth < 0.3 && !stage.final;

  return (
    <div className="grid grid-cols-[110px_1fr_150px] items-center gap-3">
      {/* Stage label + step conversion */}
      <div className="text-right">
        <p className="text-[12px] font-semibold text-(--dp-text) leading-tight">{stage.label}</p>
        {stage.pctOfPrev !== null && (
          <p className="text-[10px] text-(--dp-text-faint) tabular-nums">{stage.pctOfPrev.toFixed(1)}% of prev</p>
        )}
      </div>

      {/* Trapezoid segment */}
      <button
        onClick={onSelect}
        title={`Drill into ${stage.label.toLowerCase()} by channel`}
        className={`relative h-[42px] w-full transition-opacity ${selected ? '' : 'hover:opacity-90'}`}
      >
        <div
          className="absolute inset-0"
          style={{
            background: fill,
            clipPath: `polygon(${xTop}% 0, ${100 - xTop}% 0, ${100 - xBottom}% 100%, ${xBottom}% 100%)`,
          }}
        />
        {selected && (
          <div
            className="absolute inset-0"
            style={{
              boxShadow: 'inset 0 0 0 2px var(--dp-accent-text)',
              clipPath: `polygon(${xTop}% 0, ${100 - xTop}% 0, ${100 - xBottom}% 100%, ${xBottom}% 100%)`,
            }}
          />
        )}
        <span
          className={`absolute inset-0 flex items-center justify-center text-[13px] font-bold tabular-nums ${
            stage.final ? 'text-white' : darkInk ? 'text-(--dp-text)' : 'text-white'
          }`}
        >
          {stage.display ?? fmt(stage.value)}
        </span>
      </button>

      {/* Unit-cost chip + target */}
      <div className="flex flex-col items-start gap-1">
        <span className="text-[11px] font-bold tabular-nums text-(--dp-text-secondary) bg-white/[0.06] border border-(--dp-border) rounded-[8px] px-2 py-0.5 whitespace-nowrap">
          {stage.chip}
        </span>
        {stage.target && (
          <StatusPill tone={stage.target.tone} className="!text-[10px]">{stage.target.label}</StatusPill>
        )}
      </div>
    </div>
  );
}

// ── Main page ──
export function BackendMarketing() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const totalSpend = useMemo(() => CHANNELS.reduce((s, c) => s + c.spend, 0), []);
  const maxTrend = useMemo(() => Math.max(...TREND.map(t => t.revenue)), []);
  const drill = selectedStage ? STAGE_CHANNEL_SPLIT[selectedStage] : null;
  const drillStage = selectedStage ? FUNNEL.find(s => s.key === selectedStage) : null;

  return (
    <div className="px-4 lg:px-8 py-6 space-y-5">
      {/* Header row (topbar owns the h1) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-(--dp-accent-soft) flex items-center justify-center">
            <Megaphone className="w-4.5 h-4.5 text-(--dp-accent-text)" />
          </div>
          <p className="text-[13px] text-(--dp-text-muted)">
            Ad spend, acquisition cost, and return across every paid channel — one reporting cycle at a time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-(--dp-bg-card) border border-(--dp-border) text-[12px] font-semibold text-(--dp-text) hover:border-(--dp-border-strong) transition-colors">
            <Calendar className="w-3.5 h-3.5 text-(--dp-text-muted)" />
            {PERIOD}
            <ChevronDown className="w-3.5 h-3.5 text-(--dp-text-faint)" />
          </button>
          <Btn variant="secondary" size="sm"><Target className="w-3.5 h-3.5" /> KPI targets</Btn>
          <Btn variant="primary" size="sm"><Plus className="w-3.5 h-3.5" /> Reporting cycle</Btn>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <KpiTile label="Ad spend" value={fmtK(CYCLE.spend)} delta={CYCLE.spendDelta} invertDelta sub="All paid channels, this cycle" />
        <KpiTile label="Attributed revenue" value={fmtK(CYCLE.revenue)} delta={CYCLE.revenueDelta} sub="First-90-day net revenue" />
        <KpiTile label="CAC" value={`$${CYCLE.cac}`} delta={CYCLE.cacDelta} invertDelta sub="Blended, per funded merchant" />
        <KpiTile label="ROAS" value={`${CYCLE.roas.toFixed(1)}×`} delta={CYCLE.roasDelta} sub="Revenue ÷ spend" />
        <KpiTile label="Funded merchants" value={CYCLE.funded} delta={CYCLE.fundedDelta} sub="Won from paid this cycle" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Spend → return funnel */}
        <Card
          className="xl:col-span-2"
          title={
            <span className="inline-flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-(--dp-accent-text)" />
              Ad spend → return funnel
            </span>
          }
          action={
            <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-(--dp-text-muted) hover:text-(--dp-text) transition-colors">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          }
        >
          <p className="text-[11px] text-(--dp-text-faint) mb-4 -mt-1">
            Click any stage to drill into the channel distribution · widths compressed so the bottom stays visible
          </p>
          <div className="space-y-0.5">
            {FUNNEL.map((stage, i) => (
              <FunnelRow
                key={stage.key}
                stage={stage}
                nextWidth={FUNNEL[i + 1]?.width ?? stage.width}
                selected={selectedStage === stage.key}
                onSelect={() => setSelectedStage(s => (s === stage.key ? null : stage.key))}
              />
            ))}
          </div>

          {/* Drill-down strip */}
          {drill && drillStage && (
            <div className="mt-4 rounded-[12px] bg-white/[0.04] border border-(--dp-border) p-3.5">
              <p className="text-[11px] font-bold text-(--dp-text-secondary) mb-2.5">
                {drillStage.label} by channel
              </p>
              <div className="flex h-3 w-full overflow-hidden rounded-full">
                {drill.map((d, i) => (
                  <div
                    key={d.channel}
                    style={{
                      width: `${d.share}%`,
                      background: `color-mix(in srgb, var(--dp-accent) ${88 - i * 17}%, var(--dp-bg-card))`,
                    }}
                    title={`${d.channel} · ${d.share}%`}
                  />
                ))}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                {drill.map((d, i) => (
                  <span key={d.channel} className="inline-flex items-center gap-1.5 text-[11px] text-(--dp-text-muted) tabular-nums">
                    <span
                      className="w-2 h-2 rounded-[3px]"
                      style={{ background: `color-mix(in srgb, var(--dp-accent) ${88 - i * 17}%, var(--dp-bg-card))` }}
                    />
                    {d.channel} <span className="font-bold text-(--dp-text-secondary)">{d.share}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-[10px] leading-relaxed text-(--dp-text-faint)">
            <DollarSign className="inline w-3 h-3 mr-0.5 -mt-px" />
            Attribution: last non-direct touch. Spend entered per reporting cycle from Google/Meta exports until the
            platform APIs land. Revenue = first-90-day net revenue of merchants funded in the cycle.
          </p>
        </Card>

        {/* Channel efficiency */}
        <Card
          title={
            <span className="inline-flex items-center gap-2">
              <Target className="w-4 h-4 text-(--dp-accent-text)" />
              Channel efficiency
            </span>
          }
        >
          <div className="space-y-4">
            {CHANNELS.map(ch => {
              const share = (ch.spend / totalSpend) * 100;
              return (
                <div key={ch.name}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[12px] font-semibold text-(--dp-text)">{ch.name}</span>
                    <span className="text-[11px] tabular-nums text-(--dp-text-muted)">{fmtK(ch.spend)} · {share.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden mb-1.5">
                    <div className="h-full rounded-full bg-(--dp-accent)" style={{ width: `${share}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-(--dp-text-faint) tabular-nums">
                      {fmt(ch.leads)} leads · {ch.funded} funded · CAC {ch.cac === null ? '—' : `$${ch.cac}`}
                    </span>
                    <StatusPill tone={ch.roas >= 4 ? 'success' : 'warning'} className="!text-[10px]">
                      {ch.roas.toFixed(1)}× ROAS
                    </StatusPill>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Spend vs revenue trend */}
      <Card
        title={
          <span className="inline-flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-(--dp-accent-text)" />
            Spend vs attributed revenue
          </span>
        }
        action={<span className="text-[11px] text-(--dp-text-faint)">Last 6 cycles · ROAS labeled per cycle</span>}
      >
        <div className="grid grid-cols-6 gap-3 items-end h-[190px] pt-6">
          {TREND.map(t => {
            const roas = t.revenue / t.spend;
            return (
              <div key={t.month} className="flex flex-col items-center justify-end h-full gap-1.5">
                <span className="text-[10px] font-bold tabular-nums text-(--dp-success)">{roas.toFixed(1)}×</span>
                <div className="flex items-end gap-1 w-full justify-center flex-1">
                  <div
                    className="w-[26%] max-w-[26px] rounded-t-[4px] bg-(--dp-border-strong)"
                    style={{ height: `${(t.spend / maxTrend) * 100}%` }}
                    title={`Spend ${fmtK(t.spend)}`}
                  />
                  <div
                    className="w-[26%] max-w-[26px] rounded-t-[4px] bg-(--dp-accent)"
                    style={{ height: `${(t.revenue / maxTrend) * 100}%` }}
                    title={`Revenue ${fmtK(t.revenue)}`}
                  />
                </div>
                <span className="text-[11px] text-(--dp-text-muted)">{t.month}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-(--dp-text-muted)">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-(--dp-border-strong)" /> Ad spend
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-(--dp-text-muted)">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-(--dp-accent)" /> Attributed revenue
          </span>
        </div>
      </Card>
    </div>
  );
}
