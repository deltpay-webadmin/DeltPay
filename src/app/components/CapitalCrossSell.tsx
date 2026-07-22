/**
 * CapitalCrossSell — Merchant Services → Delt Capital cross-sell
 *
 * Surfaces the value loop for merchants who process payments with Delt:
 *   • Pre-approval based on processing history (no separate app)
 *   • Best rates available
 *   • Flexible repayment that flexes with daily sales
 *   • Funds in your account in 24–48 hours
 *
 * Three layout variants so it lives naturally across the funnel:
 *   • full   — full-width section (Payments, Pricing, Homepage)
 *   • banner — slim horizontal stripe (between page sections)
 *   • card   — compact inline card (Application form, Sandbox)
 */

import { Link } from 'react-router';
import { ArrowRight, BadgeCheck, Percent, Repeat, Zap, TrendingUp } from 'lucide-react';
import { FadeIn, Stagger, StaggerItem } from './motion';

const NAVY = '#041E42';
const PURPLE = '#4945FF';
const MUTED = '#475569';
const SURFACE_MUTED = '#F4F3FA';
const HAIRLINE = 'rgba(4,30,66,0.10)';

type Variant = 'full' | 'banner' | 'card';
type Theme = 'dark' | 'light';

interface CapitalCrossSellProps {
  variant?: Variant;
  theme?: Theme;
  /** Optional override for the eyebrow text */
  eyebrow?: string;
  /** Optional override for the headline */
  headline?: string;
  /** Optional override for the supporting copy */
  subhead?: string;
  /** Where the primary CTA points. Defaults to /capital */
  ctaHref?: string;
  /** Primary CTA label */
  ctaLabel?: string;
}

const PILLARS = [
  {
    icon: BadgeCheck,
    title: 'Pre-approved automatically',
    body: 'Process with Delt and we underwrite from your real sales — no separate application, no credit pull surprises.',
  },
  {
    icon: Percent,
    title: 'Our best rates',
    body: 'Active merchants get our lowest available pricing. The more you process, the better the offer.',
  },
  {
    icon: Repeat,
    title: 'Flexible repayment',
    body: 'A small percentage of daily card sales — it flexes up on busy days, down on slow ones.',
  },
  {
    icon: Zap,
    title: 'Funded in 24–48 hours',
    body: 'Accept an offer in your dashboard and the cash hits the bank account you already process into.',
  },
];

/* ─── Full-width section ──────────────────────────────────── */
function FullSection({
  theme = 'dark',
  eyebrow,
  headline,
  subhead,
  ctaHref = '/capital',
  ctaLabel = 'See your pre-approved offer',
}: CapitalCrossSellProps) {
  const isDark = theme === 'dark';
  const bg = isDark ? NAVY : '#FFFFFF';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : SURFACE_MUTED;
  const cardBorder = isDark ? 'rgba(255,255,255,0.10)' : HAIRLINE;
  const titleColor = isDark ? '#FFFFFF' : NAVY;
  const bodyColor = isDark ? 'rgba(255,255,255,0.65)' : MUTED;
  const eyebrowColor = isDark ? 'rgba(255,255,255,0.80)' : PURPLE;

  return (
    <section
      className="relative overflow-hidden py-20 lg:py-28"
      style={{ background: bg, color: titleColor }}
    >
      {/* glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: isDark ? 'rgba(73,69,255,0.18)' : 'rgba(73,69,255,0.08)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — staggered reveal */}
        <Stagger as="div" className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-end mb-14">
          <StaggerItem as="div">
            <div
              className="mb-6"
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: '12px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: eyebrowColor,
              }}
            >
              — {eyebrow ?? 'Process with Delt · Unlock Delt Capital'}
            </div>
            <h2
              className="mb-5"
              style={{
                fontSize: 'clamp(34px, 4vw, 52px)',
                color: titleColor,
                fontFamily: "'Manrope', 'Inter Tight', sans-serif",
                fontWeight: 600,
                letterSpacing: '-0.035em',
                lineHeight: 1.05,
              }}
            >
              {headline ?? (
                <>
                  Your sales already qualify you for{' '}
                  <em
                    style={{
                      fontFamily: "'Source Serif Pro', Georgia, serif",
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: isDark ? '#A5B4FC' : PURPLE,
                    }}
                  >
                    capital.
                  </em>
                </>
              )}
            </h2>
            <p className="text-lg max-w-xl" style={{ color: bodyColor }}>
              {subhead ??
                'Every Delt merchant gets pre-approved offers from Delt Capital — same company, different product. The longer you process with us, the better the rate and the bigger the offer.'}
            </p>
          </StaggerItem>

          {/* Sample offer card — rises in slightly after the copy. */}
          <StaggerItem
            as="div"
            className="p-6 lg:p-7"
            style={{
              borderRadius: '6px',
              background: isDark ? 'rgba(255,255,255,0.04)' : SURFACE_MUTED,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <div
              className="mb-3"
              style={{
                color: isDark ? '#A5B4FC' : PURPLE,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              — Sample pre-approved offer
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className="font-bold leading-none"
                style={{ color: titleColor, fontSize: 'clamp(36px,4vw,48px)', letterSpacing: '-0.02em' }}
              >
                $82,000
              </span>
              <span className="text-sm font-semibold" style={{ color: PURPLE }}>
                up to
              </span>
            </div>
            <div className="text-sm mb-5" style={{ color: bodyColor }}>
              Based on 6 months of card volume.
            </div>
            <div
              className="grid grid-cols-3 gap-3 pt-4"
              style={{ borderTop: `1px solid ${cardBorder}` }}
            >
              <div>
                <div className="text-xs uppercase font-semibold mb-1" style={{ color: bodyColor, letterSpacing: '0.08em' }}>
                  Rate
                </div>
                <div className="text-sm font-bold" style={{ color: titleColor }}>
                  Best available
                </div>
              </div>
              <div>
                <div className="text-xs uppercase font-semibold mb-1" style={{ color: bodyColor, letterSpacing: '0.08em' }}>
                  Repay
                </div>
                <div className="text-sm font-bold" style={{ color: titleColor }}>
                  % of daily sales
                </div>
              </div>
              <div>
                <div className="text-xs uppercase font-semibold mb-1" style={{ color: bodyColor, letterSpacing: '0.08em' }}>
                  Funded
                </div>
                <div className="text-sm font-bold" style={{ color: titleColor }}>
                  24–48 hrs
                </div>
              </div>
            </div>
          </StaggerItem>
        </Stagger>

        {/* Pillars — staggered per card, left-to-right / top-to-bottom */}
        <Stagger as="div" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-12">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <StaggerItem
              as="div"
              key={title}
              className="p-6 transition-all duration-300"
              style={{
                borderRadius: '6px',
                background: cardBg,
                border: `1px solid ${cardBorder}`,
              }}
            >
              <div
                className="w-11 h-11 flex items-center justify-center mb-5"
                style={{ borderRadius: '6px', background: PURPLE }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3
                className="text-base mb-2"
                style={{
                  color: titleColor,
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>
                {body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>

        {/* CTA row */}
        <FadeIn as="div" delay={0.05} className="flex flex-wrap items-center gap-4">
          <Link
            to={ctaHref}
            className="inline-flex items-center gap-2 px-7 py-3.5 text-white transition-all duration-200 hover:brightness-110"
            style={{
              borderRadius: '6px',
              background: PURPLE,
              fontSize: 15,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              letterSpacing: '-0.005em',
            }}
          >
            {ctaLabel}
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/capital"
            className="inline-flex items-center gap-2 font-semibold"
            style={{ color: isDark ? '#FFFFFF' : PURPLE, fontSize: 15 }}
          >
            How Delt Capital works
            <ArrowRight size={14} />
          </Link>
        </FadeIn>

        <p
          className="mt-6 text-xs"
          style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8', maxWidth: 720 }}
        >
          Delt Capital and Delt Merchant Services are products of the same company. Capital offers are
          subject to underwriting; rates and limits depend on processing volume and history. Loans
          issued by Delt Banking Partners, member FDIC.
        </p>
      </div>
    </section>
  );
}

/* ─── Slim banner ─────────────────────────────────────────── */
function BannerSection({
  eyebrow,
  headline,
  subhead,
  ctaHref = '/capital',
  ctaLabel = 'See pre-approved offers',
}: CapitalCrossSellProps) {
  return (
    <section className="px-6 py-10" style={{ background: '#FFFFFF' }}>
      <div
        className="max-w-[1240px] mx-auto rounded-3xl px-8 py-8 lg:px-12 lg:py-10 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #0a2a55 60%, ${PURPLE} 140%)`,
          boxShadow: '0 24px 60px -24px rgba(4,30,66,0.35)',
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.10)' }}
        >
          <TrendingUp className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <div
            className="text-[11px] uppercase font-bold mb-2"
            style={{ color: '#A8A5FF', letterSpacing: '0.16em' }}
          >
            {eyebrow ?? 'Delt Merchant Services + Delt Capital'}
          </div>
          <h3
            className="text-white font-bold leading-tight mb-2"
            style={{ fontSize: 'clamp(22px, 2.4vw, 30px)', letterSpacing: '-0.015em' }}
          >
            {headline ?? 'Process with Delt, get pre-approved for capital.'}
          </h3>
          <p className="text-white/70 max-w-2xl" style={{ fontSize: 15 }}>
            {subhead ??
              'Best rates, repayment that flexes with daily sales, deposited in 24–48 hours — all from the same dashboard you already use.'}
          </p>
        </div>

        <div className="flex-shrink-0">
          <Link
            to={ctaHref}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-all duration-200 hover:brightness-110"
            style={{ background: '#FFFFFF', color: NAVY, fontSize: 15 }}
          >
            {ctaLabel}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Compact inline card ─────────────────────────────────── */
function CardSection({
  eyebrow,
  headline,
  subhead,
  ctaHref = '/capital',
  ctaLabel = 'Learn about Delt Capital',
}: CapitalCrossSellProps) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: SURFACE_MUTED,
        border: `1px solid ${HAIRLINE}`,
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: PURPLE }}
        >
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <div
            className="text-[10.5px] uppercase font-bold mb-1"
            style={{ color: PURPLE, letterSpacing: '0.16em' }}
          >
            {eyebrow ?? 'Bonus when you process with Delt'}
          </div>
          <h3 className="text-lg font-bold leading-snug" style={{ color: NAVY }}>
            {headline ?? 'You’re also pre-approved for Delt Capital.'}
          </h3>
        </div>
      </div>

      <p className="text-sm leading-relaxed mb-5" style={{ color: MUTED }}>
        {subhead ??
          'Active merchants get our best rates, flexible daily repayment, and funds in 24–48 hours — no separate application required.'}
      </p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { k: 'Rate', v: 'Best available' },
          { k: 'Repay', v: 'Flexes with sales' },
          { k: 'Funded', v: '24–48 hrs' },
        ].map((s) => (
          <div key={s.k}>
            <div
              className="text-[10px] uppercase font-semibold mb-1"
              style={{ color: '#94A3B8', letterSpacing: '0.10em' }}
            >
              {s.k}
            </div>
            <div className="text-sm font-bold" style={{ color: NAVY }}>
              {s.v}
            </div>
          </div>
        ))}
      </div>

      <Link
        to={ctaHref}
        className="inline-flex items-center gap-2 font-semibold text-sm hover:gap-3 transition-all"
        style={{ color: PURPLE }}
      >
        {ctaLabel}
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export function CapitalCrossSell(props: CapitalCrossSellProps) {
  const { variant = 'full' } = props;
  if (variant === 'banner') return <BannerSection {...props} />;
  if (variant === 'card') return <CardSection {...props} />;
  return <FullSection {...props} />;
}

export default CapitalCrossSell;
