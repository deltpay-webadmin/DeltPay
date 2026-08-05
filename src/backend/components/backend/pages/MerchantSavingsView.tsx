import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, BadgeDollarSign, CheckCircle2, Download, ShieldCheck, TrendingDown, Users,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, Cell, LabelList,
} from 'recharts';
import type { ExtractedData } from './BackendAnalysis';
import type { ProgramQuote } from '../pricingPrograms';
import { useLang } from '../i18n';

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const fmtWhole = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** Plain-language walkthrough per program, keyed by ProgramQuote.key. */
const EXPLAINERS: Record<ProgramQuote['key'], { steps: string[] }> = {
  cash_discount: {
    steps: [
      'Every price in your store stays the same — customers paying by card simply see a small service fee on their receipt, with clear signage we provide.',
      'That fee covers the cost of card processing, so the fees you pay today go away. Your only cost is a flat monthly program fee.',
      'Delt handles the compliant signage, receipts, and setup. Cash-paying customers automatically pay the lower price.',
    ],
  },
  flat_rate: {
    steps: [
      'You pay one simple rate plus a few cents per transaction — the same on every card, every time.',
      'No more pages of line-item fees, tiers, or surprise charges. Your statement becomes one line you can actually read.',
      'Delt sets everything up and your rate is locked to your business profile — no rate creep over time.',
    ],
  },
  interchange_plus: {
    steps: [
      "Every card has a wholesale cost set by Visa and Mastercard, called interchange. You pay that cost directly — at true cost, with no markup hidden inside it.",
      'Delt adds one small, transparent margin on top. You can see exactly what the card networks charge and exactly what Delt earns.',
      'When the networks lower a rate, you get the savings automatically — nothing is absorbed or hidden.',
    ],
  },
};

const WHY_CASH_DISCOUNT = [
  { icon: Users, title: 'Customers cover the service fee', body: 'Card-paying customers add a small fee at checkout — the cost of processing stops coming out of your pocket.' },
  { icon: TrendingDown, title: 'Your cost drops to one flat fee', body: 'Instead of hundreds or thousands in monthly processing fees, you pay a single fixed program fee.' },
  { icon: ShieldCheck, title: 'No rate creep or surprise fees', body: 'There is no percentage rate to quietly go up over time. Your cost is the same every month.' },
  { icon: BadgeDollarSign, title: 'Compliance handled by Delt', body: 'Signage, receipt formatting, and card-network rules are all set up and kept current for you.' },
];

interface MerchantSavingsViewProps {
  extracted: ExtractedData;
  programs: ProgramQuote[];
  bestProgramKey: ProgramQuote['key'] | null;
  onExit: () => void;
  /** Generate the printable proposal for the currently selected program. */
  onDownloadProposal?: (selectedKey: ProgramQuote['key']) => void;
}

/**
 * Merchant-facing presentation of the statement analysis. Shows savings only —
 * receives no Delt profit/margin data by design (see pricingPrograms.ts:
 * ProgramEconomics stays out of ProgramQuote).
 */
export function MerchantSavingsView({ extracted, programs, bestProgramKey, onExit, onDownloadProposal }: MerchantSavingsViewProps) {
  const { t, tTerms, lang } = useLang();
  const [selectedKey, setSelectedKey] = useState<ProgramQuote['key']>(bestProgramKey ?? 'cash_discount');
  const selected = programs.find(p => p.key === selectedKey) ?? programs[0];

  const monthlySavings = useMemo(
    () => (selected ? Math.max(0, extracted.currentMonthlyCost - selected.monthlyCost) : 0),
    [selected, extracted.currentMonthlyCost],
  );

  const cumulativeSavings = useMemo(
    () => Array.from({ length: 36 }, (_, i) => ({ month: i + 1, saved: Math.round(monthlySavings * (i + 1)) })),
    [monthlySavings],
  );

  /** The program with the biggest real savings — offered as a redirect when the selected one saves nothing. */
  const bestSavingsProgram = useMemo(
    () => programs.reduce<ProgramQuote | null>((best, p) => (p.annualSavings > 0 && (!best || p.annualSavings > best.annualSavings) ? p : best), null),
    [programs],
  );

  if (!selected) return null;

  const monthLabel = (m: number) => {
    if (lang === 'es') return m < 12 ? `${m} meses` : m === 12 ? '1 año' : `${Math.round(m / 12)} años`;
    return m < 12 ? `${m} mo` : m % 12 === 0 ? `${m / 12} yr` : `${Math.floor(m / 12)}.${Math.round(((m % 12) / 12) * 10)} yr`;
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{extracted.merchantName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('Savings proposal prepared by Delt')}
            {extracted.statementPeriod && <> · {t('based on your statement for')} {extracted.statementPeriod}</>}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {onDownloadProposal && (
            <button
              onClick={() => onDownloadProposal(selectedKey)}
              className="px-3 py-2 text-xs font-medium bg-brand text-white rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              {t('Download Proposal')}
            </button>
          )}
          <button
            onClick={onExit}
            className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-[6px] hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('Exit Merchant View')}
          </button>
        </div>
      </div>

      {/* ── Hero banner: savings when there are savings, honest cost framing when not ── */}
      {selected.annualSavings > 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-[8px] px-6 py-8 text-center">
          <p className="text-sm text-emerald-600 font-medium mb-2">{t('Your Estimated Annual Savings with')} {t(selected.name)}</p>
          <p className="text-5xl font-bold text-emerald-700 tabular-nums">{fmtWhole(selected.annualSavings)}</p>
          <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
              {selected.savingsPct}% {t('less than you pay today')}
            </span>
            {monthlySavings > 0 && (
              <span className="text-sm text-emerald-600">
                {fmtWhole(monthlySavings)} {t('back in your pocket every month')}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-[8px] px-6 py-8 text-center">
          <p className="text-sm text-gray-500 font-medium mb-2">{t('Your Cost with')} {t(selected.name)}</p>
          <p className="text-5xl font-bold text-gray-900 tabular-nums">
            {fmt(selected.monthlyCost)}<span className="text-xl font-semibold text-gray-400">{t('/mo')}</span>
          </p>
          <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
            <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-sm font-bold">
              {t('About the same as you pay today')}
            </span>
            <span className="text-sm text-gray-500">{t('One simple, predictable cost — no surprise fees.')}</span>
          </div>
          {bestSavingsProgram && bestSavingsProgram.key !== selected.key && (
            <button
              onClick={() => setSelectedKey(bestSavingsProgram.key)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold hover:bg-emerald-200 transition-colors"
            >
              {t('Looking for savings?')} {t(bestSavingsProgram.name)} {t('would save you')} {fmtWhole(bestSavingsProgram.annualSavings)}{t('/yr')} →
            </button>
          )}
        </div>
      )}

      {/* ── Program selector ── */}
      <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">{t('Choose your program')}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{t('Tap a program to see how your numbers change.')}</p>
        </div>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {programs.map(p => {
            const isSelected = p.key === selectedKey;
            const recommended = p.key === bestProgramKey;
            return (
              <button
                key={p.key}
                onClick={() => setSelectedKey(p.key)}
                className={`text-left rounded-[8px] border p-4 flex flex-col transition-colors ${
                  isSelected
                    ? 'border-brand bg-brand/[0.03] shadow-[0_0_0_1px_var(--brand,#2E6BFF)]'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-brand" />}
                    {t(p.name)}
                  </p>
                  {recommended && (
                    <span className="px-2 py-0.5 rounded-full bg-brand text-white text-[10px] font-bold uppercase tracking-wide">
                      {t('Recommended')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{t(p.tagline)}</p>
                <p className="mt-3 inline-block text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-[6px] self-start">{tTerms(p.terms)}</p>
                <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-gray-500">{t("You'd pay")}</p>
                    <p className="text-sm font-bold text-gray-900 tabular-nums">{fmt(p.monthlyCost)}<span className="text-[11px] font-medium text-gray-400">/mo</span></p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500">{t("You'd save")}</p>
                    {p.annualSavings > 0 ? (
                      <p className="text-sm font-bold text-emerald-600 tabular-nums">{fmtWhole(p.annualSavings)}<span className="text-[11px] font-medium text-emerald-400">/yr</span></p>
                    ) : (
                      <p className="text-sm font-bold text-gray-500">{t('Same as today')}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Charts: cost comparison + cumulative savings (savings chart only when there are savings) ── */}
      <div className={`grid grid-cols-1 ${monthlySavings > 0 ? 'lg:grid-cols-2' : ''} gap-6`}>
        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">{t('What you pay: today vs. Delt')}</h3>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">{t('Annual processing cost')}</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: t('Today'), cost: Math.round(extracted.currentMonthlyCost * 12) },
                  { name: `${t('With')} ${t(selected.name)}`, cost: selected.annualCost },
                ]}
                margin={{ top: 24, right: 12, bottom: 0, left: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis hide />
                <ChartTooltip
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  formatter={(v: number) => [fmtWhole(v), t('Annual cost')]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="cost" radius={[4, 4, 0, 0]} barSize={64}>
                  <LabelList dataKey="cost" position="top" formatter={(v: number) => fmtWhole(v)} style={{ fontSize: 12, fill: '#374151', fontWeight: 600 }} />
                  <Cell fill="#9ca3af" />
                  <Cell fill="#2E6BFF" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {selected.key === 'cash_discount' && (
            <p className="text-[11px] text-gray-400 mt-2">
              {t('With Cash Discount, the service fee is paid by card-paying customers — your own cost is just the program fee.')}
            </p>
          )}
        </div>

        {monthlySavings > 0 && (
        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">{t('Your savings add up')}</h3>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">{t('Estimated total saved over time with')} {t(selected.name)}</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeSavings} margin={{ top: 12, right: 12, bottom: 0, left: 12 }}>
                <defs>
                  <linearGradient id="merchantSavingsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34C77B" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#34C77B" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="month" tickLine={false} axisLine={false}
                  ticks={[6, 12, 24, 36]} tickFormatter={monthLabel}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis hide />
                <ChartTooltip
                  formatter={(v: number) => [fmtWhole(v), t('Total saved')]}
                  labelFormatter={(m: number) => monthLabel(m)}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Area type="monotone" dataKey="saved" stroke="#10b981" strokeWidth={2} fill="url(#merchantSavingsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {t("After 3 years, that's an estimated")} <span className="font-semibold text-emerald-600">{fmtWhole(monthlySavings * 36)}</span> {t('kept in your business.')}
          </p>
        </div>
        )}
      </div>

      {/* ── What you're paying today ── */}
      {extracted.fees.length > 1 && (
        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{t("What you're paying today")}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{t('These fees go away or shrink with Delt.')}</p>
            </div>
            <p className="text-xs text-gray-500">
              {t('Current effective rate:')} <span className="font-bold text-gray-900">{extracted.effectiveRatePct}%</span>
              <span className="mx-1.5 text-gray-300">·</span>
              <span className="font-bold text-gray-900">{fmt(extracted.currentMonthlyCost)}</span>{t('/mo in fees')}
            </p>
          </div>
          <div className="mt-3" style={{ height: Math.max(120, extracted.fees.length * 34) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={extracted.fees} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 8 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category" dataKey="label" width={110}
                  tickLine={false} axisLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  formatter={(v: number) => [fmt(v), t('Amount')]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="amount" fill="#9ca3af" radius={[0, 4, 4, 0]} barSize={16}>
                  <LabelList dataKey="amount" position="right" formatter={(v: number) => fmtWhole(v)} style={{ fontSize: 11, fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Why Cash Discount ── */}
      <div className={`rounded-[8px] border overflow-hidden ${
        selectedKey === 'cash_discount' ? 'border-brand bg-brand/[0.02]' : 'border-gray-200 bg-white'
      }`}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">{t('Why merchants choose Cash Discount')}</h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WHY_CASH_DISCOUNT.map(item => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <item.icon className="w-4.5 h-4.5 text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t(item.title)}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{t(item.body)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How the selected program works ── */}
      <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">{t('How it works:')} {t(selected.name)}</h3>
        </div>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {EXPLAINERS[selectedKey].steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-brand text-white text-sm font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <p className="text-sm text-gray-600 leading-snug">{t(step)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <p className="text-[11px] text-gray-400 text-center pb-2">
        {t('Estimates based on your statement')}{extracted.statementPeriod ? ` (${extracted.statementPeriod})` : ''}. {t('Actual savings depend on your card mix and processing volume.')}
      </p>
    </div>
  );
}
