import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, LabelList,
  AreaChart, Area, Tooltip, CartesianGrid,
} from 'recharts';
import { Download, TrendingDown } from 'lucide-react';
import type {
  ProcessingIntelligence,
  PricingProgram,
  PricingProgramKey,
} from '../interchangeEngine';

// Chart palette — validated against the CRM's dark card surface (#172341)
// with the dataviz six-checks validator. COBALT/GREEN pass the categorical
// checks; GRAY is the deliberate de-emphasis step (emphasis form), not a
// categorical hue.
const COBALT = '#4A7EFF'; // Delt (accent)
const GREEN = '#1ea365';  // savings / eliminated fees
const GRAY = '#6E7D9E';   // current cost (de-emphasis)
const INK = '#F2F5FA';
const INK_MUTED = '#98A6C2';
const HAIRLINE = '#2E3F6B';

interface FeeRow { label: string; amount: number }

interface Statement {
  currentProcessor: string;
  statementPeriod: string;
  totalVolume: number;
  effectiveRate: number;
  currentMonthlyCost: number;
  fees: FeeRow[];
}

interface Proposal {
  currentRate: number;
  currentMonthlyCost: number;
  currentAnnualCost: number;
}

const usd0 = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const tooltipStyle: React.CSSProperties = {
  background: '#0E1730',
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 12,
  color: INK,
};

function MoneyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      {label != null && <div style={{ color: INK_MUTED, marginBottom: 2 }}>{label}</div>}
      <div style={{ fontWeight: 600 }}>{usd(payload[0].value)}</div>
    </div>
  );
}

/**
 * Merchant-facing presentation of the statement analysis: cost, savings,
 * and a few charts. Deliberately simple — no interchange tables, no margins,
 * nothing internal. Everything reacts to the selected pricing program.
 */
export function MerchantPresentation({
  statement,
  proposal,
  intel,
  programs,
  activeProgram,
  onSelectProgram,
  onGeneratePdf,
}: {
  statement: Statement;
  proposal: Proposal;
  intel: ProcessingIntelligence;
  programs: PricingProgram[];
  activeProgram: PricingProgram;
  onSelectProgram: (key: PricingProgramKey) => void;
  onGeneratePdf: () => void;
}) {
  const monthlyNow = proposal.currentMonthlyCost;
  const monthlyDelt = activeProgram.merchantMonthlyCost;
  const annualSavings = activeProgram.annualSavings;

  const costData = [
    { name: 'Today', value: monthlyNow, fill: GRAY },
    { name: 'With Delt', value: monthlyDelt, fill: COBALT },
  ];

  // Fee lines classified by what happens to them on Delt: junk fees are
  // eliminated, the non-qualified "Other" bucket is reduced, market cost
  // lines are repriced.
  const feeData = useMemo(() => {
    const goesAway = (label: string) =>
      /pci|statement|batch|monthly|service|annual|other|misc|non.?qual|surcharge/i.test(label);
    return [...statement.fees]
      .sort((a, b) => b.amount - a.amount)
      .map(f => ({ name: f.label, value: f.amount, away: goesAway(f.label) }));
  }, [statement.fees]);

  const savingsData = useMemo(() => {
    const perMonth = annualSavings / 12;
    return Array.from({ length: 37 }, (_, m) => ({ month: m, total: perMonth * m }));
  }, [annualSavings]);

  // Clean y-axis ticks (0 / 10k / 20k …) — pick the round step that yields 2–4 ticks.
  const yTicks = useMemo(() => {
    const max = annualSavings * 3;
    const step = [2500, 5000, 10000, 25000, 50000, 100000].find(s => max / s <= 4) ?? 200000;
    const ticks: number[] = [];
    for (let v = 0; v <= max; v += step) ticks.push(v);
    return ticks;
  }, [annualSavings]);

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <div className="bg-white rounded-[8px] border border-gray-200 px-8 py-8 text-center">
        <p className="text-sm text-gray-500">Based on your {statement.statementPeriod} statement from {statement.currentProcessor}</p>
        <p className="text-[52px] leading-tight font-semibold text-emerald-600 mt-2">{usd0(annualSavings)}</p>
        <p className="text-sm font-medium text-gray-700">projected savings per year — {activeProgram.savingsPct.toFixed(0)}% less than you pay today</p>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile label="You pay today" value={usd(monthlyNow)} sub={`per month · ${proposal.currentRate}% effective rate`} />
        <StatTile label="With Delt" value={usd(monthlyDelt)} sub={`per month · ${activeProgram.effectiveRatePct.toFixed(2)}% effective rate`} accent />
        <StatTile label="You keep" value={usd(activeProgram.monthlySavings)} sub="back in your pocket, every month" good />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Chart: monthly cost, today vs Delt ── */}
        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">Your monthly processing cost</h3>
          <p className="text-xs text-gray-500 mb-3">{activeProgram.name} — {activeProgram.tagline.toLowerCase()}</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={costData} layout="vertical" margin={{ top: 4, right: 90, bottom: 4, left: 0 }}>
              <XAxis type="number" hide domain={[0, monthlyNow * 1.15]} />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tickLine={false}
                axisLine={false}
                tick={{ fill: INK_MUTED, fontSize: 12 }}
              />
              <Tooltip cursor={{ fill: 'rgba(110,125,158,0.08)' }} content={<MoneyTooltip />} />
              <Bar dataKey="value" barSize={22} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {costData.map(d => <Cell key={d.name} fill={d.fill} />)}
                <LabelList dataKey="value" position="right" formatter={(v: number) => usd0(v)} style={{ fill: INK, fontSize: 13, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            {usd(activeProgram.monthlySavings)} less every month on the same volume.
          </p>
        </div>

        {/* ── Chart: where today's fees go ── */}
        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">Where your money goes today</h3>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-0.5 mb-3">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: GRAY }} /> Repriced with Delt</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: GREEN }} /> Eliminated or reduced</span>
          </div>
          <ResponsiveContainer width="100%" height={feeData.length * 34 + 8}>
            <BarChart data={feeData} layout="vertical" margin={{ top: 0, right: 76, bottom: 0, left: 0 }}>
              <XAxis type="number" hide domain={[0, (feeData[0]?.value ?? 1) * 1.15]} />
              <YAxis
                type="category"
                dataKey="name"
                width={124}
                tickLine={false}
                axisLine={false}
                tick={{ fill: INK_MUTED, fontSize: 11 }}
              />
              <Tooltip cursor={{ fill: 'rgba(110,125,158,0.08)' }} content={<MoneyTooltip />} />
              <Bar dataKey="value" barSize={18} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {feeData.map(d => <Cell key={d.name} fill={d.away ? GREEN : GRAY} />)}
                <LabelList dataKey="value" position="right" formatter={(v: number) => usd0(v)} style={{ fill: INK, fontSize: 11, fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Chart: savings over time ── */}
      <div className="bg-white rounded-[8px] border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900">Your savings add up</h3>
        <p className="text-xs text-gray-500 mb-3">Cumulative savings at the {activeProgram.name} rate — {usd0(annualSavings * 3)} over three years</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={savingsData} margin={{ top: 16, right: 70, bottom: 4, left: 8 }}>
            <CartesianGrid vertical={false} stroke={HAIRLINE} strokeWidth={1} />
            <XAxis
              dataKey="month"
              ticks={[12, 24, 36]}
              tickFormatter={(m: number) => `Year ${m / 12}`}
              tickLine={false}
              axisLine={{ stroke: HAIRLINE }}
              tick={{ fill: INK_MUTED, fontSize: 12 }}
            />
            <YAxis
              ticks={yTicks}
              domain={[0, annualSavings * 3]}
              tickFormatter={(v: number) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`)}
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fill: INK_MUTED, fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }: any) =>
                active && payload?.length ? (
                  <div style={tooltipStyle}>
                    <div style={{ color: INK_MUTED, marginBottom: 2 }}>Month {payload[0].payload.month}</div>
                    <div style={{ fontWeight: 600 }}>{usd0(payload[0].value)} saved</div>
                  </div>
                ) : null
              }
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke={GREEN}
              strokeWidth={2}
              isAnimationActive={false}
              fill={GREEN}
              fillOpacity={0.1}
              dot={false}
              activeDot={{ r: 4, fill: GREEN, stroke: '#172341', strokeWidth: 2 }}
              label={(props: any) =>
                props.index === savingsData.length - 1 ? (
                  <text x={props.x + 8} y={props.y + 4} fill={INK} fontSize={13} fontWeight={600}>
                    {usd0(annualSavings * 3)}
                  </text>
                ) : <g />
              }
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Program choice, simplified ── */}
      <div className="bg-white rounded-[8px] border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Choose how you want to pay</h3>
        <p className="text-xs text-gray-500 mb-3">Every option beats what you pay today — they differ in who covers the card fees.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {programs.map(pg => (
            <button
              key={pg.key}
              onClick={() => onSelectProgram(pg.key)}
              className={`text-left px-3 py-2.5 rounded-[6px] border transition-colors ${
                pg.key === activeProgram.key
                  ? 'border-brand bg-brand/5 ring-1 ring-brand'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <p className={`text-xs font-semibold ${pg.key === activeProgram.key ? 'text-brand' : 'text-gray-800'}`}>{pg.name}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{pg.passThrough ? 'Customers cover card fees' : 'You cover card fees'}</p>
              <p className="text-[11px] font-medium text-emerald-600 mt-1 tabular-nums">Save {usd0(pg.annualSavings)}/yr</p>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-500 mt-3">
          <span className="font-semibold">Cardholder impact:</span> {activeProgram.cardholderImpact}
        </p>
      </div>

      {/* ── CTA ── */}
      <button
        onClick={onGeneratePdf}
        className="w-full px-4 py-3.5 bg-brand text-white text-sm font-semibold rounded-[8px] hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        Get this proposal as a PDF
      </button>
    </div>
  );
}

function StatTile({ label, value, sub, accent, good }: { label: string; value: string; sub: string; accent?: boolean; good?: boolean }) {
  return (
    <div className={`rounded-[8px] border px-5 py-4 ${
      good ? 'bg-emerald-50 border-emerald-200' : accent ? 'bg-brand/5 border-brand/30' : 'bg-white border-gray-200'
    }`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${good ? 'text-emerald-700' : accent ? 'text-brand' : 'text-gray-900'}`}>{value}</p>
      <p className="text-[11px] text-gray-500 mt-1">{sub}</p>
    </div>
  );
}
