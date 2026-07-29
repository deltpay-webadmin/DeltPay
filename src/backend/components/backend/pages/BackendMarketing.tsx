import React, { useMemo, useState } from 'react';
import { Link2, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { Overline, DeltaPill, KpiTile, Card, HeroPanel, Btn } from '../../dp';

// ══════════════════════════════════════
// Marketing performance — the return-on-ad-spend story.
//
// Concept surface: sample cycle data stands in until the Google/Meta ad
// account integrations land. The funnel is drawn as one sculpted shape —
// spend narrows through conversion, then the return flares back out in
// green past the cost it took to win it.
// ══════════════════════════════════════

const CYCLE = {
  period: 'May 25 – Jun 24, 2026',
  spend: 18420,
  revenue: 96420,
  roas: 5.2,
  roasDelta: 8.4,
  cac: 542,
  cacDelta: -6.1,
  paybackDays: 41,
  funded: 34,
};

// ── Funnel stages ──
// Widths are perceptual, not linear — the story is the narrowing, then the
// green return flaring back out wider than the cost stem that produced it.
interface Stage {
  key: string;
  label: string;
  value: string;
  stepPct: string | null; // conversion from previous stage
  unit: string;           // unit-cost readout
  width: number;
}

const STAGES: Stage[] = [
  { key: 'impressions', label: 'Impressions', value: '1.24M', stepPct: null, unit: '$14.85 CPM', width: 100 },
  { key: 'clicks', label: 'Clicks', value: '38.4K', stepPct: '3.1%', unit: '$0.48 CPC', width: 82 },
  { key: 'visits', label: 'Site visits', value: '29.6K', stepPct: '77%', unit: '$0.62 / visit', width: 72 },
  { key: 'leads', label: 'Leads', value: '1,184', stepPct: '4.0%', unit: '$15.56 / lead', width: 54 },
  { key: 'qualified', label: 'Qualified', value: '342', stepPct: '29%', unit: '$53.86 / qualified', width: 40 },
  { key: 'apps', label: 'Applications', value: '128', stepPct: '37%', unit: '$143.91 / application', width: 28 },
  { key: 'funded', label: 'Funded merchants', value: '34', stepPct: '27%', unit: '$542 CAC', width: 18 },
];

const RETURN_STAGE = { label: 'Attributed revenue', value: '$96.4K', roas: '5.2× return', widthTop: 18, widthBottom: 46 };

const STAGE_CHANNELS: Record<string, { channel: string; share: number }[]> = {
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
};

const CHANNELS = [
  { name: 'Google Ads', spend: 8900, cac: 593, roas: 4.8 },
  { name: 'Meta', spend: 5200, cac: 578, roas: 4.4 },
  { name: 'LinkedIn', spend: 2100, cac: 700, roas: 3.1 },
  { name: 'SMS', spend: 1500, cac: 500, roas: 5.9 },
  { name: 'Email', spend: 720, cac: 180, roas: 9.6 },
];

const TREND = [
  { month: 'Feb', spend: 11200, revenue: 41800 },
  { month: 'Mar', spend: 13400, revenue: 52300 },
  { month: 'Apr', spend: 14100, revenue: 61900 },
  { month: 'May', spend: 16200, revenue: 74500 },
  { month: 'Jun', spend: 18420, revenue: 96420 },
  { month: 'Jul', spend: 19800, revenue: 104100 },
];

const fmtK = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`);

// ── Sculpted funnel geometry ──
// The cone is one continuous silhouette: a Catmull-Rom spline through the
// stage widths, so the taper is smooth with no stepped shoulders. Drawn in
// a 0–100 × pixel space, preserveAspectRatio="none" stretches it to fit.
const BAND_H = 56;
const GAP = 14;
const RETURN_H = 60;
const FUNNEL_H = STAGES.length * BAND_H;

interface Pt { x: number; y: number }

// Catmull-Rom → cubic bezier segments through pts (starting from pts[0]).
function splineThrough(pts: Pt[]): string {
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
  }
  return d;
}

// Width samples: the top edge, each band boundary (averaging the widths it
// separates), and the bottom edge — one smooth run, no verticals between.
function sidePoints(side: 1 | -1): Pt[] {
  const x = (w: number) => 50 + (side * w) / 2;
  const pts: Pt[] = [{ x: x(STAGES[0].width), y: 0 }];
  for (let i = 1; i < STAGES.length; i++) {
    pts.push({ x: x((STAGES[i - 1].width + STAGES[i].width) / 2), y: i * BAND_H });
  }
  pts.push({ x: x(STAGES[STAGES.length - 1].width), y: FUNNEL_H });
  return pts;
}

function costPath(): string {
  const right = sidePoints(1);
  const left = sidePoints(-1).reverse();
  return (
    `M ${left[left.length - 1].x} 0 L ${right[0].x} 0 ` +
    splineThrough(right) +
    `L ${left[0].x} ${FUNNEL_H} ` +
    splineThrough(left) +
    'Z'
  );
}

function returnPath(): string {
  const { widthTop: wt, widthBottom: wb } = RETURN_STAGE;
  const xRt = 50 + wt / 2, xRb = 50 + wb / 2;
  const xLt = 50 - wt / 2, xLb = 50 - wb / 2;
  return (
    `M ${xLt} 0 L ${xRt} 0 ` +
    `C ${xRt} ${RETURN_H * 0.55}, ${xRb} ${RETURN_H * 0.35}, ${xRb} ${RETURN_H} ` +
    `L ${xLb} ${RETURN_H} ` +
    `C ${xLb} ${RETURN_H * 0.35}, ${xLt} ${RETURN_H * 0.55}, ${xLt} 0 Z`
  );
}

// ── Main page ──
export function BackendMarketing() {
  const [drillKey, setDrillKey] = useState<string | null>(null);
  const totalSpend = useMemo(() => CHANNELS.reduce((s, c) => s + c.spend, 0), []);
  const maxTrend = useMemo(() => Math.max(...TREND.map(t => t.revenue)), []);
  const drill = drillKey ? STAGE_CHANNELS[drillKey] : null;
  const drillStage = drillKey ? STAGES.find(s => s.key === drillKey) : null;
  const bestRoas = Math.max(...CHANNELS.map(c => c.roas));

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1360px] mx-auto px-4 lg:px-8 py-6 space-y-6">

        {/* ═══ HERO — the return is the hero ═══ */}
        <HeroPanel>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-8 p-6 lg:p-8">
            <div className="flex flex-col justify-center">
              <Overline className="text-white/60">Return on ad spend · {CYCLE.period}</Overline>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="text-[44px] leading-none font-bold text-white tracking-[-0.02em] tabular-nums">
                  {CYCLE.roas.toFixed(1)}×
                </span>
                <DeltaPill value={CYCLE.roasDelta} onGlass />
              </div>
              <p className="mt-3 text-[14px] text-white/60">
                {fmtK(CYCLE.spend)} invested returned <span className="text-white/90 font-semibold">{fmtK(CYCLE.revenue)}</span> in
                first-90-day revenue from {CYCLE.funded} funded merchants
              </p>
              <div className="mt-6 flex items-center gap-2">
                <Btn variant="primary" size="sm">
                  <Link2 className="w-3.5 h-3.5" /> Connect ad accounts
                </Btn>
                <button className="inline-flex items-center gap-1.5 h-8 px-4 rounded-[10px] text-[12px] font-bold text-white/80 border border-white/20 hover:bg-white/10 transition-colors">
                  <Target className="w-3.5 h-3.5" /> Set targets
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 content-center">
              <KpiTile glass label="Ad spend" value={fmtK(CYCLE.spend)} sub="All paid channels" />
              <KpiTile glass label="Attributed revenue" value={fmtK(CYCLE.revenue)} sub="First 90 days" />
              <KpiTile glass label="CAC" value={`$${CYCLE.cac}`} delta={CYCLE.cacDelta} invertDelta sub="Per funded merchant" />
              <KpiTile glass label="Payback" value={`${CYCLE.paybackDays}d`} sub="Spend recovered" />
            </div>
          </div>
        </HeroPanel>

        {/* ═══ THE FUNNEL — spend narrows, return flares back ═══ */}
        <Card
          title="Spend → return"
          action={
            <span className="text-[11px] text-(--dp-text-faint)">
              Sample cycle · live once ad accounts connect
            </span>
          }
        >
          <div className="grid grid-cols-[minmax(120px,170px)_1fr_minmax(110px,160px)] gap-x-5 pt-2">

            {/* Left column — stage values */}
            <div>
              {STAGES.map(s => (
                <div key={s.key} className="flex flex-col justify-center items-end text-right" style={{ height: BAND_H }}>
                  <span className="text-[15px] font-bold tabular-nums text-(--dp-text) leading-tight">{s.value}</span>
                  <span className="text-[11px] text-(--dp-text-faint) leading-tight">
                    {s.label}
                    {s.stepPct && <span className="text-(--dp-text-muted)"> · {s.stepPct}</span>}
                  </span>
                </div>
              ))}
              <div style={{ height: GAP }} />
              <div className="flex flex-col justify-center items-end text-right" style={{ height: RETURN_H }}>
                <span className="text-[15px] font-bold tabular-nums text-(--dp-success) leading-tight">{RETURN_STAGE.value}</span>
                <span className="text-[11px] text-(--dp-text-faint) leading-tight">{RETURN_STAGE.label}</span>
              </div>
            </div>

            {/* Center — the sculpted shape */}
            <div className="relative" style={{ height: FUNNEL_H + GAP + RETURN_H }}>
              <svg
                className="absolute inset-x-0 top-0 w-full"
                style={{ height: FUNNEL_H, filter: 'drop-shadow(0 16px 48px rgba(46,107,255,0.28))' }}
                viewBox={`0 0 100 ${FUNNEL_H}`}
                preserveAspectRatio="none"
                aria-hidden
              >
                <defs>
                  <linearGradient id="mkt-cost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--dp-accent)" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="var(--dp-accent)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="var(--dp-accent)" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path d={costPath()} fill="url(#mkt-cost)" />
              </svg>
              <svg
                className="absolute inset-x-0 w-full"
                style={{ top: FUNNEL_H + GAP, height: RETURN_H, filter: 'drop-shadow(0 12px 36px rgba(52,199,123,0.35))' }}
                viewBox={`0 0 100 ${RETURN_H}`}
                preserveAspectRatio="none"
                aria-hidden
              >
                <defs>
                  <linearGradient id="mkt-return" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--dp-success)" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="var(--dp-success)" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path d={returnPath()} fill="url(#mkt-return)" />
              </svg>
              {/* ROAS marker inside the return flare */}
              <div
                className="absolute inset-x-0 flex items-center justify-center"
                style={{ top: FUNNEL_H + GAP, height: RETURN_H }}
              >
                <span className="text-[13px] font-bold text-white tracking-[-0.01em]">{RETURN_STAGE.roas}</span>
              </div>
              {/* Hover / drill bands */}
              {STAGES.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => setDrillKey(k => (k === s.key ? null : s.key))}
                  aria-label={`${s.label} — channel breakdown`}
                  className={`absolute inset-x-0 transition-colors ${
                    drillKey === s.key ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                  }`}
                  style={{ top: i * BAND_H, height: BAND_H }}
                />
              ))}
            </div>

            {/* Right column — unit economics, whisper-quiet */}
            <div>
              {STAGES.map(s => (
                <div key={s.key} className="flex items-center" style={{ height: BAND_H }}>
                  <span className={`text-[11px] tabular-nums ${s.key === 'funded' ? 'font-bold text-(--dp-accent-text)' : 'text-(--dp-text-faint)'}`}>
                    {s.unit}
                  </span>
                </div>
              ))}
              <div style={{ height: GAP }} />
              <div className="flex items-center" style={{ height: RETURN_H }}>
                <span className="text-[11px] font-bold tabular-nums text-(--dp-success)">{CYCLE.roas.toFixed(1)}× ROAS</span>
              </div>
            </div>
          </div>

          {/* Drill-down — channel composition of the selected stage */}
          {drill && drillStage && (
            <div className="mt-5 pt-4 border-t border-(--dp-border)">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-bold text-(--dp-text-secondary)">{drillStage.label} by channel</p>
                <button onClick={() => setDrillKey(null)} className="text-[11px] text-(--dp-text-faint) hover:text-(--dp-text)">
                  Clear
                </button>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full">
                {drill.map((d, i) => (
                  <div
                    key={d.channel}
                    style={{
                      width: `${d.share}%`,
                      background: `color-mix(in srgb, var(--dp-accent) ${90 - i * 18}%, var(--dp-bg-card))`,
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {drill.map((d, i) => (
                  <span key={d.channel} className="inline-flex items-center gap-1.5 text-[11px] text-(--dp-text-muted) tabular-nums">
                    <span
                      className="w-2 h-2 rounded-[3px]"
                      style={{ background: `color-mix(in srgb, var(--dp-accent) ${90 - i * 18}%, var(--dp-bg-card))` }}
                    />
                    {d.channel} <span className="font-bold text-(--dp-text-secondary)">{d.share}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* ═══ CHANNELS + CYCLES ═══ */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card title="Where the spend goes">
            <div className="space-y-3.5">
              {CHANNELS.map(ch => {
                const share = (ch.spend / totalSpend) * 100;
                return (
                  <div key={ch.name} className="grid grid-cols-[110px_1fr_auto] items-center gap-4">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[12px] font-semibold text-(--dp-text) truncate">{ch.name}</span>
                      {ch.roas === bestRoas && (
                        <span className="text-[9px] font-bold uppercase tracking-wide text-(--dp-success)">Best</span>
                      )}
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-(--dp-accent)" style={{ width: `${share}%` }} />
                    </div>
                    <div className="flex items-baseline gap-3 tabular-nums">
                      <span className="text-[11px] text-(--dp-text-muted) w-[52px] text-right">{fmtK(ch.spend)}</span>
                      <span className="text-[11px] text-(--dp-text-faint) w-[62px] text-right">${ch.cac} CAC</span>
                      <span className={`text-[12px] font-bold w-[44px] text-right ${ch.roas >= 4 ? 'text-(--dp-success)' : 'text-(--dp-warning)'}`}>
                        {ch.roas.toFixed(1)}×
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[11px] text-(--dp-text-faint)">
              CAC and return per channel, last non-direct touch.
            </p>
          </Card>

          <Card
            title={
              <span className="inline-flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-(--dp-accent-text)" /> Spend vs return by cycle
              </span>
            }
          >
            <div className="grid grid-cols-6 gap-3 items-end h-[150px] pt-5">
              {TREND.map(t => (
                <div key={t.month} className="flex flex-col items-center justify-end h-full gap-1.5">
                  <span className="text-[10px] font-bold tabular-nums text-(--dp-success)">
                    {(t.revenue / t.spend).toFixed(1)}×
                  </span>
                  <div className="flex items-end gap-1 w-full justify-center flex-1">
                    <div
                      className="w-[22%] max-w-[18px] rounded-t-[3px] bg-(--dp-border-strong)"
                      style={{ height: `${(t.spend / maxTrend) * 100}%` }}
                    />
                    <div
                      className="w-[22%] max-w-[18px] rounded-t-[3px] bg-(--dp-accent)"
                      style={{ height: `${(t.revenue / maxTrend) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-(--dp-text-muted)">{t.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-(--dp-text-muted)">
                  <span className="w-2 h-2 rounded-[3px] bg-(--dp-border-strong)" /> Spend
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-(--dp-text-muted)">
                  <span className="w-2 h-2 rounded-[3px] bg-(--dp-accent)" /> Return
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-(--dp-text-faint)">
                6 cycles <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
