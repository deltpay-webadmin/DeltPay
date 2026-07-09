import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import {
  Briefcase,
  Zap,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  Download,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Quote,
  TrendingUp,
} from 'lucide-react';
import { AutomatedRepayment } from '../components/AutomatedRepayment';
import { ProductCrossSell } from '../components/ProductCrossSell';
import { BusinessScene } from '../components/BusinessScene';

/* ─── Design tokens ─────────────────────────────────────────── */
const NAVY      = '#041E42';
const PURPLE    = '#4945FF';
const LAVENDER  = '#EDEBFF'; // Toast peach equivalent for full-bleed data bands
const IVORY     = '#F6F7FB'; // Toast ivory equivalent for testimonial band
const MUTED     = '#475569';
const MICRO     = '#94A3B8';
const HAIRLINE  = 'rgba(4,30,66,0.10)';

/* ─── FAQ data ──────────────────────────────────────────────── */
const FAQS = [
  {
    q: "How do I know if I'm eligible?",
    a: 'Eligibility is based on your card processing volume, time on Delt, and status of any bankruptcy filings. Check your Delt dashboard for pre-qualified offers.',
  },
  {
    q: "Does applying affect my credit?",
    a: 'No. Applying for a Delt Capital loan does not affect your personal or business credit score, and there\'s no credit score requirement to apply.',
  },
  {
    q: "How does repayment work?",
    a: 'Repayment is a fixed percentage of daily card transactions processed through Delt. When sales are slower, you pay less. Target terms range from 90 to 360 days.',
  },
  {
    q: "What are the fees?",
    a: 'Delt Capital loans have a fixed fee that will not change regardless of how long it takes to repay. No compounding interest, no application fees, no prepayment fees, no late fees.',
  },
  {
    q: "What can I use the loan for?",
    a: 'Anything your business needs — short-term cash flow, hiring, inventory, equipment, refinancing debt, renovation, or opening a new location.',
  },
  {
    q: "How fast will I get funded?",
    a: 'Funds arrive in your account as soon as the next business day after approval, subject to processing time and completion of your loan agreement.',
  },
];

/* ─── Testimonial data ──────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote:
      "Being able to automatically repay as a fixed percentage of daily card transactions is a game-changer. Not having to stress about monthly payments is a relief.",
    name: 'Priya Shah',
    role: 'Owner, Peninsula Hardware Supply',
    location: 'Portland, OR',
    business: 'Peninsula Hardware Supply',
    initials: 'PS',
    theme: 'hardware' as const,
    metric: '$42k funded',
    accent: '#4945FF',
  },
  {
    quote:
      "We funded our second location in 48 hours. No paperwork marathon, no 90-day wait. Delt Capital repaid itself from the new store's own card volume.",
    name: 'Marcus Thompson',
    role: "Founder, Thompson's Café",
    location: 'Austin, TX',
    business: "Thompson's Café",
    initials: 'MT',
    theme: 'cafe' as const,
    metric: 'Funded in 48h',
    accent: '#041E42',
  },
  {
    quote:
      "When summer sales dipped, our repayments dipped with them. That's the kind of financing that understands seasonal businesses.",
    name: 'Jennifer Wu',
    role: 'CEO, Wellness Studio Group',
    location: 'San Diego, CA',
    business: 'Wellness Studio Group',
    initials: 'JW',
    theme: 'wellness' as const,
    metric: 'Seasonal repay',
    accent: '#4945FF',
  },
];

/* ─── FAQ accordion item ─────────────────────────────────────── */
function FaqItem({ q, a, initialOpen = false }: { q: string; a: string; initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: HAIRLINE }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
        style={{ background: open ? IVORY : '#FFFFFF' }}
      >
        <span
          className="font-semibold text-base"
          style={{ color: NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {q}
        </span>
        <ChevronDown
          size={20}
          style={{
            color: PURPLE,
            flexShrink: 0,
            transition: 'transform 0.25s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p
              className="px-6 pb-5 text-sm leading-relaxed"
              style={{ color: MUTED }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Feature block (alternating two-column) ────────────────── */
type FeatureBlockProps = {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  reverse?: boolean;
  visual: React.ReactNode;
};

function FeatureBlock({ eyebrow, title, body, bullets, reverse, visual }: FeatureBlockProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
      {/* Visual side */}
      <div className={reverse ? 'md:order-2' : ''}>{visual}</div>
      {/* Copy side */}
      <div className={reverse ? 'md:order-1' : ''}>
        <div
          className="text-[12px] font-bold uppercase mb-3"
          style={{ color: PURPLE, letterSpacing: '0.18em' }}
        >
          {eyebrow}
        </div>
        <h3
          className="font-bold leading-[1.15] mb-4"
          style={{
            fontSize: 'clamp(24px, 2.4vw, 32px)',
            color: NAVY,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h3>
        <p
          className="leading-relaxed mb-6"
          style={{ color: MUTED, fontSize: 16 }}
        >
          {body}
        </p>
        <ul className="flex flex-col gap-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span
                className="inline-flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: 20,
                  height: 20,
                  background: `${PURPLE}15`,
                  marginTop: 2,
                }}
              >
                <Check size={12} color={PURPLE} strokeWidth={3} />
              </span>
              <span style={{ color: NAVY, fontSize: 15, lineHeight: 1.55 }}>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─── Visuals for feature blocks ─────────────────────────────── */
function IndustryVisual() {
  // Underwriting "signals we read" card — concrete, Square-style
  // ("we take into account your time using Square, processing volume,
  // customer mix, and more."). Pairs with copy about how we actually
  // underwrite vs. a generic credit formula.
  const signals = [
    {
      label: 'Time on Delt',
      detail: '14 mo · steady',
      strength: 88,
      icon: <Briefcase size={14} color={PURPLE} />,
    },
    {
      label: 'Daily card volume',
      detail: '$4.8K avg · last 90 days',
      strength: 76,
      icon: <TrendingUp size={14} color={PURPLE} />,
    },
    {
      label: 'Customer mix',
      detail: '62% repeat · 38% new',
      strength: 70,
      icon: <RefreshCw size={14} color={PURPLE} />,
    },
    {
      label: 'Seasonality fit',
      detail: 'Q4 lift · pre-funded',
      strength: 82,
      icon: <Zap size={14} color={PURPLE} />,
    },
  ];
  return (
    <div
      className="rounded-2xl p-6 md:p-7"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${HAIRLINE}`,
        boxShadow: '0 20px 40px rgba(4,30,66,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[11px] font-bold uppercase" style={{ color: MICRO, letterSpacing: '0.14em' }}>
            Underwriting signals
          </div>
          <div className="font-bold text-lg mt-1" style={{ color: NAVY }}>
            Read from your business — not a bureau
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${PURPLE}12` }}
        >
          <Briefcase size={18} color={PURPLE} />
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {signals.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl"
            style={{ background: IVORY }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${PURPLE}14` }}
            >
              {s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold" style={{ color: NAVY, fontSize: 13.5 }}>
                {s.label}
              </div>
              <div className="text-[11.5px]" style={{ color: MICRO }}>{s.detail}</div>
            </div>
            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: `${PURPLE}18` }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${s.strength}%`, background: PURPLE }}
              />
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-5 pt-4 flex items-center justify-between text-[11px]"
        style={{ borderTop: `1px solid ${HAIRLINE}`, color: MICRO, letterSpacing: '0.04em' }}
      >
        <span className="uppercase font-bold tracking-wider" style={{ color: PURPLE }}>No hard pull</span>
        <span>Re-evaluated daily</span>
      </div>
    </div>
  );
}

function SpeedVisual() {
  return (
    <div
      className="rounded-2xl p-6 md:p-7"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${HAIRLINE}`,
        boxShadow: '0 20px 40px rgba(4,30,66,0.06)',
      }}
    >
      <div className="flex items-baseline gap-2 mb-4">
        <span
          className="font-bold"
          style={{
            fontSize: 'clamp(48px, 5vw, 72px)',
            color: NAVY,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          $82,000
        </span>
      </div>
      <div
        className="text-[11px] font-bold uppercase mb-6"
        style={{ color: PURPLE, letterSpacing: '0.16em' }}
      >
        Pre-qualified offer
      </div>
      <div className="flex flex-col gap-2.5">
        {[
          ['Apply', 'under 2 min', true],
          ['Approval', 'same day', true],
          ['Funds arrive', 'next business day', true],
        ].map(([label, value, done]) => (
          <div
            key={label as string}
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: done ? `${PURPLE}08` : IVORY }}
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center justify-center rounded-full"
                style={{ width: 18, height: 18, background: PURPLE }}
              >
                <Check size={10} color="#FFFFFF" strokeWidth={3} />
              </span>
              <span style={{ color: NAVY, fontSize: 14, fontWeight: 600 }}>{label}</span>
            </div>
            <span style={{ color: MUTED, fontSize: 13 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RepaymentTermsVisual() {
  // Non-chart visual — deliberately different from the AutomatedRepayment
  // chart in the lavender band directly below this section. Frames the
  // offer as a clean "terms at a glance" receipt: principal, flat fee,
  // hold rate, term — the way an operator actually thinks about a deal.
  const terms: Array<{ k: string; v: string; sub?: string }> = [
    { k: 'Advance amount',  v: '$50,000',  sub: 'wired to your bank' },
    { k: 'One flat fee',    v: '$5,500',   sub: 'no interest, never grows' },
    { k: 'Daily hold rate', v: '8.0%',     sub: 'of each day’s card volume' },
    { k: 'Target term',     v: '~9 months', sub: '90 – 360 days typical' },
  ];
  return (
    <div
      className="rounded-2xl p-6 md:p-7"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${HAIRLINE}`,
        boxShadow: '0 20px 40px rgba(4,30,66,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[11px] font-bold uppercase" style={{ color: MICRO, letterSpacing: '0.14em' }}>
            Your offer
          </div>
          <div className="font-bold text-lg mt-1" style={{ color: NAVY }}>
            Terms at a glance
          </div>
        </div>
        <div
          className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
          style={{
            background: `${PURPLE}12`,
            color: PURPLE,
            letterSpacing: '0.14em',
          }}
        >
          Pre-qualified
        </div>
      </div>

      <div
        className="flex flex-col"
        style={{ border: `1px solid ${HAIRLINE}`, borderRadius: 14, overflow: 'hidden' }}
      >
        {terms.map((t, i) => (
          <div
            key={t.k}
            className="flex items-center justify-between px-4 py-3.5"
            style={{
              background: i % 2 === 0 ? IVORY : '#FFFFFF',
              borderTop: i === 0 ? 'none' : `1px solid ${HAIRLINE}`,
            }}
          >
            <div className="min-w-0">
              <div
                className="text-[11px] font-bold uppercase"
                style={{ color: MICRO, letterSpacing: '0.12em' }}
              >
                {t.k}
              </div>
              {t.sub && (
                <div style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>{t.sub}</div>
              )}
            </div>
            <div
              className="font-bold"
              style={{
                color: NAVY,
                fontSize: 18,
                letterSpacing: '-0.01em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {t.v}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11.5px]" style={{ color: MUTED }}>
        <Check size={12} color={PURPLE} strokeWidth={3} />
        <span>No late fees · no prepayment penalty · pay it off any time</span>
      </div>
    </div>
  );
}

/* ─── Resource visuals (subject-specific glyph illustrations) ── */
function ChecklistVisual() {
  const rows = [
    { label: 'Validate new market demand', done: true },
    { label: 'Secure expansion capital',   done: true },
    { label: 'Hire & onboard local team',  done: false },
    { label: 'Launch & measure',           done: false },
  ];
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center px-6"
    >
      <div
        className="w-full rounded-xl p-4 flex flex-col gap-2"
        style={{
          background: '#FFFFFF',
          border: `1px solid ${HAIRLINE}`,
          boxShadow: '0 8px 24px rgba(4,30,66,0.06)',
        }}
      >
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
              style={{
                background: r.done ? PURPLE : '#FFFFFF',
                border: r.done ? 'none' : `1.5px solid ${MICRO}`,
              }}
            >
              {r.done && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
            </div>
            <div
              className="h-1.5 rounded-full flex-1"
              style={{
                background: r.done ? 'rgba(73,69,255,0.18)' : 'rgba(148,163,184,0.25)',
                width: `${[88, 76, 92, 70][i]}%`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueChartVisual() {
  // Mini bar chart: 2024 / 2025 / 2026 revenue brackets
  const bars = [
    { h: 38, label: '2024' },
    { h: 58, label: '2025' },
    { h: 84, label: '2026' },
  ];
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-end justify-center gap-3 px-8 pb-5"
    >
      {bars.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5" style={{ width: 40 }}>
          <div
            className="w-full rounded-t-md"
            style={{
              height: b.h,
              background: i === bars.length - 1
                ? `linear-gradient(180deg, ${PURPLE} 0%, #6E6BFF 100%)`
                : 'rgba(73,69,255,0.32)',
            }}
          />
          <span className="text-[9px] font-bold" style={{ color: NAVY, letterSpacing: '0.04em' }}>
            {b.label}
          </span>
        </div>
      ))}
      {/* axis hairline */}
      <div
        className="absolute left-6 right-6"
        style={{ bottom: 22, height: 1, background: HAIRLINE }}
      />
    </div>
  );
}

function LoanStepsVisual() {
  const steps = ['Apply', 'Review', 'Funded'];
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center px-5"
    >
      <div className="flex items-center gap-2 w-full">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{
                background: i === steps.length - 1 ? PURPLE : '#FFFFFF',
                color: i === steps.length - 1 ? '#FFFFFF' : NAVY,
                border: i === steps.length - 1 ? 'none' : `1.5px solid ${HAIRLINE}`,
              }}
            >
              {i + 1}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] font-bold" style={{ color: NAVY, letterSpacing: '0.02em' }}>
                {s}
              </span>
              {i < steps.length - 1 && (
                <div
                  className="h-[2px] rounded-full"
                  style={{
                    background: i === 0 ? PURPLE : 'rgba(73,69,255,0.32)',
                    width: i === 0 ? '100%' : '60%',
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Resource card (developed: visual band + meta + footer CTA) */
function ResourceCard({
  to,
  title,
  excerpt,
  tag,
  cta,
  readTime,
  visualBg,
  visual,
}: {
  to: string;
  title: string;
  excerpt: string;
  tag: string;
  cta: 'Download' | 'Read';
  readTime: string;
  visualBg: string;
  visual: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl flex flex-col overflow-hidden transition-all duration-200"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${HAIRLINE}`,
        boxShadow: '0 1px 2px rgba(4,30,66,0.04)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = '0 18px 40px rgba(4,30,66,0.10)';
        el.style.borderColor = 'rgba(73,69,255,0.32)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '0 1px 2px rgba(4,30,66,0.04)';
        el.style.borderColor = HAIRLINE;
      }}
    >
      {/* Visual band */}
      <div
        className="relative w-full"
        style={{
          height: 152,
          background: visualBg,
          borderBottom: `1px solid ${HAIRLINE}`,
        }}
      >
        {visual}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-6 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase px-2 py-1 rounded"
            style={{
              color: PURPLE,
              background: 'rgba(73,69,255,0.10)',
              letterSpacing: '0.14em',
            }}
          >
            {tag}
          </span>
          <span className="text-[11px] font-medium" style={{ color: MICRO }}>
            · {readTime} read
          </span>
        </div>

        <h3
          className="font-bold text-[17px] leading-snug"
          style={{ color: NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.01em' }}
        >
          {title}
        </h3>

        <p className="text-[13.5px] leading-relaxed flex-1" style={{ color: MUTED }}>
          {excerpt}
        </p>

        {/* Footer CTA bar */}
        <div
          className="flex items-center justify-between pt-3 mt-1"
          style={{ borderTop: `1px solid ${HAIRLINE}` }}
        >
          <span className="text-[13px] font-semibold" style={{ color: PURPLE }}>
            {cta}
          </span>
          <ArrowRight
            size={14}
            color={PURPLE}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export function CapitalPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const t = TESTIMONIALS[activeTestimonial];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#FFFFFF' }}>

      {/* ═══ 1. WHITE SPLIT HERO (Toast pattern) ════════════════════ */}
      <section className="px-6 pt-32 pb-20 md:pt-40 md:pb-28" style={{ background: '#FFFFFF' }}>
        <div
          style={{ maxWidth: 1200, margin: '0 auto' }}
          className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-10 md:gap-16 items-center"
        >
          {/* Copy side */}
          <div>
            {/* Breadcrumb chip */}
            <div className="flex items-center gap-2 mb-6">
              <span
                className="inline-block rounded-full"
                style={{ width: 8, height: 8, background: PURPLE }}
              />
              <Link
                to="/products"
                className="text-[12px] font-semibold uppercase"
                style={{ color: MICRO, letterSpacing: '0.14em' }}
              >
                Products
              </Link>
              <ChevronRight size={12} color={MICRO} />
              <span
                className="text-[12px] font-semibold uppercase"
                style={{ color: NAVY, letterSpacing: '0.14em' }}
              >
                Capital
              </span>
            </div>

            <h1
              className="font-bold leading-[1.05]"
              style={{
                fontSize: 'clamp(40px, 5.5vw, 68px)',
                letterSpacing: '-0.03em',
                color: NAVY,
              }}
            >
              Fast, easy, and flexible funding from a partner who gets it.
            </h1>

            <p
              className="mt-6 max-w-xl leading-relaxed"
              style={{ fontSize: 'clamp(16px, 1.2vw, 18px)', color: MUTED }}
            >
              Access loans ranging from{' '}
              <strong style={{ color: NAVY }}>$1,000 to $300,000</strong> with Delt Capital.
              Repayment flexes with your daily card sales — nothing to schedule, nothing to
              remember.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/get-a-quote"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:brightness-110"
                style={{
                  background: PURPLE,
                  fontSize: 15,
                  boxShadow: `0 4px 18px ${PURPLE}40`,
                }}
              >
                See if you're pre-qualified
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 font-semibold transition-colors"
                style={{ color: PURPLE, fontSize: 15 }}
              >
                Schedule a demo
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Visual side — floating dashboard card */}
          <div className="relative">
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: '#FFFFFF',
                border: `1px solid ${HAIRLINE}`,
                boxShadow: '0 30px 60px rgba(4,30,66,0.10)',
              }}
            >
              {/* Top bar */}
              <div
                className="px-6 py-4 flex items-center gap-3"
                style={{ borderBottom: `1px solid ${HAIRLINE}` }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="inline-block rounded-full" style={{ width: 10, height: 10, background: '#E5E7EB' }} />
                  <span className="inline-block rounded-full" style={{ width: 10, height: 10, background: '#E5E7EB' }} />
                  <span className="inline-block rounded-full" style={{ width: 10, height: 10, background: '#E5E7EB' }} />
                </div>
                <div
                  className="ml-3 text-xs font-semibold"
                  style={{ color: NAVY }}
                >
                  Delt Capital · Pre-qualified offer
                </div>
              </div>
              {/* Body */}
              <div className="p-6 md:p-8" style={{ background: IVORY }}>
                <div
                  className="text-[11px] font-bold uppercase mb-2"
                  style={{ color: PURPLE, letterSpacing: '0.18em' }}
                >
                  You qualify for up to
                </div>
                <div
                  className="font-bold mb-1"
                  style={{
                    fontSize: 'clamp(44px, 6vw, 72px)',
                    color: NAVY,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}
                >
                  $82,000
                </div>
                <div className="text-sm" style={{ color: MUTED }}>
                  at <strong style={{ color: NAVY }}>8% flat fee</strong> · repay from daily card sales
                </div>

                {/* Progress rail */}
                <div className="mt-7">
                  <div
                    className="flex items-center justify-between text-[11px] font-semibold mb-2"
                    style={{ color: MICRO, letterSpacing: '0.1em' }}
                  >
                    <span>$1,000</span>
                    <span>$300,000</span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: `${PURPLE}18` }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: PURPLE }}
                      initial={{ width: 0 }}
                      animate={{ width: '62%' }}
                      transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                {/* Stats grid */}
                <div
                  className="mt-6 grid grid-cols-3 gap-3"
                >
                  {[
                    ['Approval', 'Same day'],
                    ['Funding', 'Next day'],
                    ['Fees', '$0 upfront'],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-xl p-3"
                      style={{ background: '#FFFFFF', border: `1px solid ${HAIRLINE}` }}
                    >
                      <div className="text-[10px] font-bold uppercase" style={{ color: MICRO, letterSpacing: '0.12em' }}>{k}</div>
                      <div className="font-semibold text-sm mt-1" style={{ color: NAVY }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2. SECTION HEADLINE (white) ═══════════════════════════ */}
      <section className="px-6 pt-10 pb-4" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }} className="text-center">
          <h2
            className="font-bold mb-4 leading-[1.1]"
            style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              color: NAVY,
              letterSpacing: '-0.025em',
            }}
          >
            A financial partner like no other
          </h2>
          <p
            className="mx-auto leading-relaxed"
            style={{ color: MUTED, fontSize: 'clamp(15px, 1.2vw, 17px)', maxWidth: 640 }}
          >
            We've been building alongside small-business owners for years, which means
            industry-specific nuances like seasonality don't scare us one bit.
          </p>
        </div>
      </section>

      {/* ═══ 3. ALTERNATING FEATURE BLOCKS (white) ══════════════════ */}
      <section className="px-6 py-12 md:py-16" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }} className="flex flex-col gap-20 md:gap-28">
          <FeatureBlock
            eyebrow="Built around your business"
            title="We know how your business actually works."
            body="We don't underwrite on a credit score and a tax return. We read the signals your business already gives off — daily card volume, time on Delt, customer mix, seasonality — and size an offer to your real cash flow. The longer you process with us, the better the offer gets."
            bullets={[
              'Sized to your processing volume — not a generic credit formula',
              'Offers re-evaluated daily as your sales evolve',
              'No tax returns, no collateral, no personal guarantee',
              'Funded retail, restaurants, salons, services, fitness & e-commerce',
            ]}
            visual={<IndustryVisual />}
          />
          <FeatureBlock
            reverse
            eyebrow="Fast & flexible"
            title="From $1K to $300K — funded as soon as tomorrow."
            body="Apply in minutes from your Delt dashboard. Most approvals land same-day and funds arrive in your account the next business day, subject to eligibility."
            bullets={[
              'Loan amounts from $1,000 to $300,000',
              'Fixed fee — no compounding interest or hidden charges',
              'No prepayment penalty, no late fees',
            ]}
            visual={<SpeedVisual />}
          />
          <FeatureBlock
            eyebrow="Easy repayment"
            title="One flat fee. No interest. No surprises."
            body="Your repayment is a fixed percentage of each day's card volume — quiet day, pay less; busy day, pay a little more. There's no compounding interest, no late fees, and no penalty if you pay it off early."
            bullets={[
              'One flat fee disclosed upfront — your balance never grows',
              'Automatic from daily card sales — no invoices, no transfers',
              'No late fees, no prepayment penalty',
              'Typical target terms of 90 to 360 days',
            ]}
            visual={<RepaymentTermsVisual />}
          />
        </div>
      </section>

      {/* ═══ 4. LAVENDER FULL-BLEED DATA BAND ═════════════════════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: LAVENDER }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="text-center mb-10">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Automated daily repayment
            </div>
            <h2
              className="font-bold leading-[1.1] mb-4"
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              A rhythm that matches your week.
            </h2>
            <p
              className="mx-auto leading-relaxed"
              style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', color: MUTED, maxWidth: 620 }}
            >
              In small business, unpredictability is predictable. Delt Capital repayment flexes
              with your cash flow — automatically.
            </p>
          </div>

          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#FFFFFF',
              border: `1px solid ${HAIRLINE}`,
              boxShadow: '0 20px 50px rgba(4,30,66,0.06)',
            }}
          >
            <AutomatedRepayment hideTitle />
          </div>

          <p
            className="text-center mt-8 text-xs"
            style={{ color: MICRO, maxWidth: 560, margin: '2rem auto 0' }}
          >
            On days when your sales are higher, you'll pay a little more. On days your sales are
            lower, you'll pay less. Illustrative only — actual terms vary by offer.
          </p>
        </div>
      </section>

      {/* ═══ 5. TESTIMONIAL (ivory, photo + quote, pagination) ═════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: IVORY }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div className="text-center mb-12">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Trusted by owners like you
            </div>
            <h2
              className="font-bold leading-[1.1]"
              style={{
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              Real merchants, real stories.
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-8 md:gap-12 items-center"
            >
              {/* Photo / scene panel */}
              <BusinessScene
                theme={t.theme}
                initials={t.initials}
                businessName={t.business}
                location={t.location}
                metric={t.metric}
                aspect="portrait"
                variant={t.accent === '#4945FF' ? 'purple' : 'navy'}
              />

              {/* Quote side */}
              <div>
                <p
                  className="italic leading-[1.35] mb-7"
                  style={{
                    fontSize: 'clamp(20px, 2.2vw, 28px)',
                    color: NAVY,
                    letterSpacing: '-0.015em',
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-[2px] w-8 rounded-full"
                    style={{ background: PURPLE }}
                  />
                  <div>
                    <div className="font-semibold" style={{ color: NAVY, fontSize: 15 }}>{t.name}</div>
                    <div style={{ color: MUTED, fontSize: 13 }}>{t.role} · {t.location}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination controls */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() =>
                setActiveTestimonial((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
              }
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ border: `1px solid ${HAIRLINE}`, background: '#FFFFFF', color: NAVY }}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === activeTestimonial ? 24 : 8,
                    height: 8,
                    background: i === activeTestimonial ? PURPLE : `${NAVY}25`,
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveTestimonial((i) => (i + 1) % TESTIMONIALS.length)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ border: `1px solid ${HAIRLINE}`, background: '#FFFFFF', color: NAVY }}
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ 6. FAQ (white) ════════════════════════════════════════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <h2
            className="font-bold mb-10 text-center leading-[1.1]"
            style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              color: NAVY,
              letterSpacing: '-0.025em',
            }}
          >
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((item, i) => (
              <FaqItem key={item.q} q={item.q} a={item.a} initialOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. RESOURCES 3-UP (white, lavender/ivory cards) ═══════ */}
      <section className="px-6 py-20 md:py-24" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="text-center mb-12">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              More for your business
            </div>
            <h2
              className="font-bold leading-[1.1]"
              style={{
                fontSize: 'clamp(28px, 3.4vw, 40px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              Guides, templates, and playbooks.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ResourceCard
              to="/resources/expansion-checklist"
              title="The small-business expansion checklist"
              excerpt="Eight things every owner needs ready before opening a second location — from market signals to capital readiness."
              tag="Template"
              cta="Download"
              readTime="8 min"
              visualBg={LAVENDER}
              visual={<ChecklistVisual />}
            />
            <ResourceCard
              to="/resources/sb-revenue-2026"
              title="How much do small businesses actually make? (2026 data)"
              excerpt="Median revenue, margin, and growth benchmarks across retail, food, and services — with the data you can compare against."
              tag="Research"
              cta="Read"
              readTime="12 min"
              visualBg={IVORY}
              visual={<RevenueChartVisual />}
            />
            <ResourceCard
              to="/resources/loans-101"
              title="Loans 101: everything about the application"
              excerpt="What lenders actually look at, the documents to prepare, and how Delt funds in days instead of weeks."
              tag="Guide"
              cta="Read"
              readTime="10 min"
              visualBg={LAVENDER}
              visual={<LoanStepsVisual />}
            />
          </div>
        </div>
      </section>

      {/* ═══ 8. EXISTING-CUSTOMER CROSS-SELL PANEL (ivory rounded) ═ */}
      <section className="px-6 pb-20" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div
            className="relative rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 items-center p-8 md:p-12"
            style={{ background: IVORY, border: `1px solid ${HAIRLINE}` }}
          >
            <div>
              <div
                className="text-[12px] font-bold uppercase mb-3"
                style={{ color: PURPLE, letterSpacing: '0.18em' }}
              >
                Already a Delt customer?
              </div>
              <h3
                className="font-bold leading-[1.15] mb-4"
                style={{
                  fontSize: 'clamp(24px, 2.6vw, 34px)',
                  color: NAVY,
                  letterSpacing: '-0.02em',
                }}
              >
                Check your personalized Capital dashboard to see if you're pre-qualified.
              </h3>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 font-semibold transition-colors"
                style={{ color: PURPLE, fontSize: 15 }}
              >
                Check eligibility
                <ArrowRight size={16} />
              </Link>
            </div>
            {/* Mini dashboard mock */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: '#FFFFFF',
                border: `1px solid ${HAIRLINE}`,
                boxShadow: '0 12px 30px rgba(4,30,66,0.06)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${PURPLE}12` }}
                >
                  <TrendingUp size={16} color={PURPLE} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase" style={{ color: MICRO, letterSpacing: '0.12em' }}>
                    Your offer
                  </div>
                  <div className="font-bold" style={{ color: NAVY, fontSize: 16 }}>
                    $82,000 available
                  </div>
                </div>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden mb-3"
                style={{ background: `${PURPLE}18` }}
              >
                <div className="h-full rounded-full" style={{ width: '62%', background: PURPLE }} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: MUTED }}>Used $0</span>
                <span style={{ color: MUTED }}>Remaining $82,000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 9. PRODUCT CROSS-SELL (existing component, light) ═════ */}
      <ProductCrossSell currentProduct="capital" variant="light" />

      {/* ═══ 10. SMALL CENTERED FINAL CTA (white, no navy slab) ═══ */}
      <section className="px-6 py-20 md:py-24 text-center" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <div
            className="mb-5"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#697386',
            }}
          >
            — FUND THE NEXT MOVE
          </div>
          <h2
            className="mb-4"
            style={{
              fontSize: 'clamp(28px, 3.4vw, 40px)',
              color: NAVY,
              fontFamily: "'Manrope', 'Inter Tight', sans-serif",
              fontWeight: 600,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
            }}
          >
            Get started{' '}
            <em style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontStyle: 'italic', fontWeight: 400, color: '#3730A3' }}>today.</em>
          </h2>
          <p
            className="mb-8 leading-relaxed mx-auto"
            style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', color: MUTED, maxWidth: 460, fontFamily: "'Inter', sans-serif" }}
          >
            Talk to a specialist and see how Delt Capital can help your business.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/get-a-quote"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-white transition-all duration-200 hover:brightness-110"
              style={{
                borderRadius: '6px',
                background: PURPLE,
                fontSize: 15,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
              }}
            >
              Get started
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/help-center"
              className="inline-flex items-center gap-2 font-semibold"
              style={{ color: PURPLE, fontSize: 15 }}
            >
              Visit the Help Center
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 11. SMALL-PRINT LEGAL BLOCK (soft gradient, no hard band) ═ */}
      <div
        className="px-6 pt-9 pb-11"
        style={{ background: '#FFFFFF', borderTop: `1px solid ${HAIRLINE}` }}
      >
        <div
          className="max-w-4xl mx-auto flex flex-col gap-2"
          style={{ color: MICRO, fontSize: 11, lineHeight: 1.7 }}
        >
          <p>
            Delt Capital loans are issued by Delt Banking Partners, member FDIC. Loans are
            subject to credit approval and may not be available in certain jurisdictions.
          </p>
          <p>
            Pre-qualified offers are based on information about your business and your account
            history with Delt. All loans subject to credit approval. Illustrative figures shown on
            this page are for demonstration only.
          </p>
        </div>
      </div>

    </div>
  );
}

export default CapitalPage;
