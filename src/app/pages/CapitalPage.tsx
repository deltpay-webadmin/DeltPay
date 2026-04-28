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
    a: 'We look at your card sales volume, how long you\'ve been using Delt, and whether there are any open bankruptcy filings. Log into your Delt dashboard — if you qualify, you\'ll see a pre-qualified offer waiting.',
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
    q: "What does it cost?",
    a: 'You pay one flat fee, set when you accept the offer. It never changes — no compounding interest, no application fee, no prepayment fee, no late fee.',
  },
  {
    q: "What can I use the loan for?",
    a: 'Anything your business needs — short-term cash flow, hiring, inventory, equipment, refinancing debt, renovation, or opening a new location.',
  },
  {
    q: "How fast will I get the money?",
    a: 'Money arrives in your account as soon as the next business day after approval, once you\'ve signed your loan agreement.',
  },
];

/* ─── Testimonial data ──────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote:
      "Repayment comes out of daily card sales automatically. On slow days we pay less. On busy days a little more. I never have to think about it.",
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
  // Card layout mimicking "funded businesses" tiles
  const tiles = [
    { industry: 'Coffee shop · Portland', amount: '$48,000', progress: 82 },
    { industry: 'Salon · Austin', amount: '$22,500', progress: 55 },
    { industry: 'Retail · Brooklyn', amount: '$110,000', progress: 38 },
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
            Funded this week
          </div>
          <div className="font-bold text-lg mt-1" style={{ color: NAVY }}>
            Across 6 industries
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${PURPLE}12` }}
        >
          <Briefcase size={18} color={PURPLE} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {tiles.map((t) => (
          <div
            key={t.industry}
            className="flex items-center gap-4 px-4 py-3 rounded-xl"
            style={{ background: IVORY }}
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs" style={{ color: MICRO }}>{t.industry}</div>
              <div className="font-semibold" style={{ color: NAVY, fontSize: 15 }}>{t.amount}</div>
            </div>
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: `${PURPLE}18` }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${t.progress}%`, background: PURPLE }}
              />
            </div>
          </div>
        ))}
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

function RepaymentMiniVisual() {
  // Simplified daily-sales-vs-repayment mini card
  const days = [
    { d: 'M', sales: 45, cap: 7 },
    { d: 'T', sales: 60, cap: 9 },
    { d: 'W', sales: 38, cap: 6 },
    { d: 'T', sales: 72, cap: 11 },
    { d: 'F', sales: 88, cap: 13 },
    { d: 'S', sales: 95, cap: 14 },
    { d: 'S', sales: 55, cap: 8 },
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
            This week
          </div>
          <div className="font-bold text-lg mt-1" style={{ color: NAVY }}>
            Sales → repayment
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: PURPLE, fontWeight: 600 }}>
          <span
            className="inline-block rounded-full"
            style={{ width: 8, height: 8, background: PURPLE }}
          />
          Daily repayment
        </div>
      </div>
      <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <div className="w-full flex flex-col justify-end" style={{ height: 120 }}>
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${d.cap}%`,
                  background: PURPLE,
                }}
              />
              <div
                className="w-full"
                style={{
                  height: `${d.sales - d.cap}%`,
                  background: NAVY,
                  opacity: 0.92,
                }}
              />
            </div>
            <span className="text-[10px]" style={{ color: MICRO, fontWeight: 600 }}>{d.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Resource card (Toast-style, lavender/ivory bg) ─────────── */
function ResourceCard({
  title,
  tag,
  cta,
  icon: Icon,
  bg,
}: {
  title: string;
  tag: string;
  cta: 'Download' | 'Read';
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  bg: string;
}) {
  return (
    <div
      className="group rounded-2xl p-7 flex flex-col gap-5 cursor-pointer transition-all duration-200"
      style={{
        background: bg,
        minHeight: 240,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: '#FFFFFF' }}
      >
        <Icon size={18} color={PURPLE} />
      </div>
      <div
        className="text-[11px] font-bold uppercase"
        style={{ color: PURPLE, letterSpacing: '0.14em' }}
      >
        {tag}
      </div>
      <p
        className="font-bold text-lg leading-snug flex-1"
        style={{ color: NAVY, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {title}
      </p>
      <div className="flex items-center gap-1.5" style={{ color: PURPLE }}>
        <span className="text-sm font-semibold">{cta}</span>
        <ArrowRight size={14} />
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export function CapitalPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const t = TESTIMONIALS[activeTestimonial];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#FFFFFF' }}>

      {/* ═══ 1. WHITE SPLIT HERO (Toast pattern) ════════════════════ */}
      <section className="px-6 pt-16 pb-20 md:pt-24 md:pb-28" style={{ background: '#FFFFFF' }}>
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
              Business funding that pays itself back from your daily sales.
            </h1>

            <p
              className="mt-6 max-w-xl leading-relaxed"
              style={{ fontSize: 'clamp(16px, 1.2vw, 18px)', color: MUTED }}
            >
              Borrow from{' '}
              <strong style={{ color: NAVY }}>$1,000 to $300,000</strong> through Delt Capital.
              A fixed share of each day's card sales goes toward repayment automatically — nothing to schedule, nothing to remember.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/sign-up"
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
            Built for businesses like yours
          </h2>
          <p
            className="mx-auto leading-relaxed"
            style={{ color: MUTED, fontSize: 'clamp(15px, 1.2vw, 17px)', maxWidth: 640 }}
          >
            We've worked with restaurants, retailers, salons, and contractors for years.
            Your busy season and your slow months are things we plan for — not ignore.
          </p>
        </div>
      </section>

      {/* ═══ 3. ALTERNATING FEATURE BLOCKS (white) ══════════════════ */}
      <section className="px-6 py-12 md:py-16" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }} className="flex flex-col gap-20 md:gap-28">
          <FeatureBlock
            eyebrow="Made for your type of business"
            title="We know how your business actually works."
            body="Retail, restaurants, salons, auto shops, contractors — we've funded them all. Your offer is sized to what your business actually earns, not a generic formula."
            bullets={[
              'Approval based on your card sales history — not just your credit score',
              'Offers that account for your busy and slow seasons',
              'No collateral and no lengthy paperwork',
            ]}
            visual={<IndustryVisual />}
          />
          <FeatureBlock
            reverse
            eyebrow="Fast approval, fast funding"
            title="From $1K to $300K — money in your account as soon as tomorrow."
            body="Apply in minutes from your Delt dashboard. Most approvals are same-day. Money arrives in your account the next business day, subject to eligibility."
            bullets={[
              'Borrow from $1,000 to $300,000',
              'One fixed fee — no compounding interest, no hidden charges',
              'No penalty for paying early, no late fees',
            ]}
            visual={<SpeedVisual />}
          />
          <FeatureBlock
            eyebrow="Repayment that moves with your sales"
            title="Slow week? You pay less. Busy weekend? A little more."
            body="Repayment is a fixed percentage of each day's card sales. It comes out automatically — no invoices to pay, no transfers to set up. When business is quiet, your repayment is too."
            bullets={[
              'A fixed share of each day\'s card sales — never a flat monthly bill',
              'Fully automatic — no invoices, no manual transfers',
              'Target repayment windows of 90 to 360 days',
            ]}
            visual={<RepaymentMiniVisual />}
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
              Your repayment follows your sales — automatically.
            </h2>
            <p
              className="mx-auto leading-relaxed"
              style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', color: MUTED, maxWidth: 620 }}
            >
              Slow Tuesdays. Packed Fridays. Holiday rushes. Delt Capital repayment moves with your business — not against it.
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
            Higher sales day — a little more comes off. Slower day — a little less. Illustrative only — actual terms vary by offer.
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
              Real business owners. Real results.
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
              Guides for small business owners.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ResourceCard
              title="The checklist for opening a second location"
              tag="Template"
              cta="Download"
              icon={Download}
              bg={LAVENDER}
            />
            <ResourceCard
              title="How much do small businesses actually make? (2026 data)"
              tag="Research"
              cta="Read"
              icon={BookOpen}
              bg={IVORY}
            />
            <ResourceCard
              title="Business funding 101: how to apply and what to expect"
              tag="Guide"
              cta="Read"
              icon={BookOpen}
              bg={LAVENDER}
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
                Already using Delt?
              </div>
              <h3
                className="font-bold leading-[1.15] mb-4"
                style={{
                  fontSize: 'clamp(24px, 2.6vw, 34px)',
                  color: NAVY,
                  letterSpacing: '-0.02em',
                }}
              >
                Log in and check your dashboard — your pre-qualified offer may already be waiting.
              </h3>
              <Link
                to="/login"
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
          <h2
            className="font-bold mb-4 leading-[1.1]"
            style={{
              fontSize: 'clamp(28px, 3.4vw, 40px)',
              color: NAVY,
              letterSpacing: '-0.025em',
            }}
          >
            Ready to get funded?
          </h2>
          <p
            className="mb-8 leading-relaxed mx-auto"
            style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', color: MUTED, maxWidth: 460 }}
          >
            Book a quick call and we'll walk you through what your business qualifies for.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:brightness-110"
              style={{
                background: PURPLE,
                fontSize: 15,
                boxShadow: `0 4px 18px ${PURPLE}40`,
              }}
            >
              Schedule a demo
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

      {/* ═══ 11. SMALL-PRINT LEGAL BLOCK (grey, not navy) ═════════ */}
      <div
        className="px-6 py-8"
        style={{ background: IVORY, borderTop: `1px solid ${HAIRLINE}` }}
      >
        <div
          className="max-w-4xl mx-auto flex flex-col gap-2"
          style={{ color: MICRO, fontSize: 11, lineHeight: 1.7 }}
        >
          <p>
            Delt Capital loans are issued by Delt Banking Partners, member FDIC. All loans are
            subject to approval and may not be available in all locations.
          </p>
          <p>
            Pre-qualified offers are based on your business information and your history with Delt. All loans subject to approval. Dollar figures shown on this page are for illustration only.
          </p>
        </div>
      </div>

    </div>
  );
}

export default CapitalPage;
