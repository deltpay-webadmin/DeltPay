import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import {
  Briefcase,
  Zap,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  Wallet,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { AutomatedRepayment } from '../components/AutomatedRepayment';
import { ProductCrossSell } from '../components/ProductCrossSell';
import { BusinessScene } from '../components/BusinessScene';

/* ─── Design tokens ─────────────────────────────────────────── */
const NAVY      = '#041E42';
const PURPLE    = '#4945FF';
const PURPLE_DK = '#3730A3';
const LAVENDER  = '#EDEBFF';
const IVORY     = '#F6F7FB';
const MUTED     = '#475569';
const MICRO     = '#94A3B8';
const HAIRLINE  = 'rgba(4,30,66,0.10)';

/* ─── FAQ data — modeled on Square Loans Q&A, in Delt voice ──── */
const FAQS = [
  {
    q: "How do I become eligible for Delt Capital?",
    a: "Eligibility is based on your business — not a credit score. We look at how long you've been processing with Delt, your daily card volume, the mix of repeat vs. new customers, and your typical seasonality. We re-evaluate eligibility daily, so the longer you process with us, the better your offer tends to get.",
  },
  {
    q: "How do I request an offer?",
    a: "If you're pre-qualified, you'll see your offer right in your Delt dashboard and you'll get an email letting you know. From there, requesting funding takes about two minutes — no long forms, no paperwork uploads.",
  },
  {
    q: "How do you determine my offer amount?",
    a: "We size offers to your real cash flow. Inputs include your time on Delt, your processing volume and frequency, your customer mix, and your industry's typical seasonality. Offers currently range from $1,000 to $300,000.",
  },
  {
    q: "How does repayment work?",
    a: "Repayment is automatic — a fixed percentage of each day's card sales is held back until the advance is repaid. If you have a busy day, you pay a little more. If you have a slow day, you pay less. There's nothing to schedule, no invoices, no ACH to set up.",
  },
  {
    q: "Is there interest?",
    a: "No. Delt Capital uses a single flat fee, disclosed upfront. Your balance never grows — what you owe on day one is what you owe at the end. No compounding interest, ever.",
  },
  {
    q: "Can I prepay?",
    a: "Yes — at any time, with no prepayment penalty and no additional cost. The total amount you owe doesn't change because you paid early.",
  },
  {
    q: "What happens if I have a slow week?",
    a: "Repayment flexes with your sales. If your card volume drops, your hold-back drops with it. There's a small minimum payment over each 60-day window so the advance stays on track — your dashboard always shows where you stand.",
  },
  {
    q: "Are there late fees?",
    a: "No per-day late fees and no penalty interest — your balance never grows because you had a slow week. Each advance does carry a small rolling minimum (a 60-day target tied to your offer), so if collections fall behind that target your dashboard flags it and gives you a one-click ACH true-up. Pay it and you're back on track. No stacking fees, no calls from a collector.",
  },
  {
    q: "Does applying affect my credit?",
    a: "No. Checking your offer and requesting funding does not affect your personal or business credit score. There's no personal guarantee required either.",
  },
];

/* ─── Testimonials (kept from previous page) ─────────────────── */
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
      className="rounded-2xl overflow-hidden"
      style={{
        background: open ? IVORY : '#FFFFFF',
        border: `1px solid ${HAIRLINE}`,
        transition: 'background 0.2s ease',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        style={{ color: NAVY }}
      >
        <span className="font-semibold" style={{ fontSize: 16, lineHeight: 1.4 }}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'inline-flex', color: PURPLE, flexShrink: 0 }}
        >
          <ChevronDown size={20} />
        </motion.span>
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
            <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: MUTED }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Pillar card (3-up value props) ─────────────────────────── */
function PillarCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-2xl p-7 h-full flex flex-col"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${HAIRLINE}`,
        boxShadow: '0 8px 24px rgba(4,30,66,0.04)',
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{ background: `${PURPLE}14` }}
      >
        {icon}
      </div>
      <h3
        className="font-bold mb-2"
        style={{ color: NAVY, fontSize: 19, letterSpacing: '-0.01em', lineHeight: 1.25 }}
      >
        {title}
      </h3>
      <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}

/* ─── Hero offer card (right side of split hero) ─────────────── */
function HeroOfferCard() {
  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${HAIRLINE}`,
        boxShadow: '0 30px 60px rgba(4,30,66,0.10)',
      }}
    >
      {/* Top bar — fake browser chrome */}
      <div
        className="px-5 py-3.5 flex items-center gap-2"
        style={{ borderBottom: `1px solid ${HAIRLINE}`, background: IVORY }}
      >
        <span className="inline-block rounded-full" style={{ width: 9, height: 9, background: '#E5E7EB' }} />
        <span className="inline-block rounded-full" style={{ width: 9, height: 9, background: '#E5E7EB' }} />
        <span className="inline-block rounded-full" style={{ width: 9, height: 9, background: '#E5E7EB' }} />
        <span
          className="ml-3 text-[11px] font-semibold uppercase"
          style={{ color: MICRO, letterSpacing: '0.12em' }}
        >
          Delt Dashboard · Capital
        </span>
      </div>

      <div className="p-7 md:p-8">
        <div
          className="text-[11px] font-bold uppercase mb-3"
          style={{ color: PURPLE, letterSpacing: '0.16em' }}
        >
          Pre-qualified offer
        </div>
        <div
          className="font-bold leading-none mb-1"
          style={{
            color: NAVY,
            fontSize: 'clamp(48px, 5.4vw, 68px)',
            letterSpacing: '-0.04em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          $82,000
        </div>
        <div style={{ color: MUTED, fontSize: 13.5 }}>
          One flat fee · no interest · no personal guarantee
        </div>

        <div className="mt-6">
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
          <div className="flex items-center justify-between mt-2 text-xs" style={{ color: MUTED }}>
            <span>Available now</span>
            <span style={{ color: NAVY, fontWeight: 600 }}>$82,000</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            ['Approval', 'Same day'],
            ['Funding', 'Next day'],
            ['Fee', 'Flat, upfront'],
          ].map(([k, v]) => (
            <div
              key={k}
              className="rounded-xl p-3"
              style={{ background: IVORY, border: `1px solid ${HAIRLINE}` }}
            >
              <div className="text-[10px] font-bold uppercase" style={{ color: MICRO, letterSpacing: '0.12em' }}>{k}</div>
              <div className="font-semibold text-sm mt-1" style={{ color: NAVY }}>{v}</div>
            </div>
          ))}
        </div>

        <div
          className="mt-6 pt-5 flex items-center gap-2 text-[12px]"
          style={{ borderTop: `1px solid ${HAIRLINE}`, color: MUTED }}
        >
          <ShieldCheck size={14} color={PURPLE} />
          <span>Checking eligibility doesn't affect your credit</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Offer factors card (right side of custom-offer section) ── */
function OfferFactorsCard() {
  const factors = [
    { label: 'Time on Delt',       detail: '14 mo · steady',         strength: 88, icon: <Briefcase size={14} color={PURPLE} /> },
    { label: 'Daily card volume',  detail: '$4.8K avg · last 90d',   strength: 76, icon: <TrendingUp size={14} color={PURPLE} /> },
    { label: 'Customer mix',       detail: '62% repeat · 38% new',   strength: 70, icon: <RefreshCw size={14} color={PURPLE} /> },
    { label: 'Seasonality fit',    detail: 'Q4 lift · pre-funded',   strength: 82, icon: <Zap size={14} color={PURPLE} /> },
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
            What we read
          </div>
          <div className="font-bold text-lg mt-1" style={{ color: NAVY }}>
            Your offer factors
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
        {factors.map((s) => (
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

/* ─── Two-up speed cards (Easy application / Fast deposit) ───── */
function SpeedCard({
  eyebrow,
  title,
  body,
  bullets,
  icon,
}: {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-7 md:p-8 h-full flex flex-col"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${HAIRLINE}`,
        boxShadow: '0 8px 24px rgba(4,30,66,0.04)',
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{ background: `${PURPLE}14` }}
      >
        {icon}
      </div>
      <div
        className="text-[11px] font-bold uppercase mb-2"
        style={{ color: PURPLE, letterSpacing: '0.16em' }}
      >
        {eyebrow}
      </div>
      <h3
        className="font-bold mb-3"
        style={{ color: NAVY, fontSize: 'clamp(22px, 2vw, 26px)', letterSpacing: '-0.015em', lineHeight: 1.2 }}
      >
        {title}
      </h3>
      <p className="leading-relaxed mb-5" style={{ color: MUTED, fontSize: 15 }}>{body}</p>
      <ul className="flex flex-col gap-2.5 mt-auto">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5">
            <span
              className="inline-flex items-center justify-center rounded-full flex-shrink-0"
              style={{ width: 18, height: 18, background: `${PURPLE}15`, marginTop: 2 }}
            >
              <Check size={11} color={PURPLE} strokeWidth={3} />
            </span>
            <span style={{ color: NAVY, fontSize: 14, lineHeight: 1.55 }}>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export function CapitalPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const t = TESTIMONIALS[activeTestimonial];

  const heroChips = [
    'Apply in minutes, no long forms',
    'No interest — one flat fee',
    'Funded as soon as the next business day',
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#FFFFFF' }}>

      {/* ═══ 1. HERO — split, three value chips, dashboard offer card ═══ */}
      <section className="px-6 pt-32 pb-20 md:pt-40 md:pb-28" style={{ background: '#FFFFFF' }}>
        <div
          style={{ maxWidth: 1200, margin: '0 auto' }}
          className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-10 md:gap-16 items-center"
        >
          <div>
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
              className="font-bold leading-[1.03]"
              style={{
                fontSize: 'clamp(40px, 5.6vw, 72px)',
                letterSpacing: '-0.035em',
                color: NAVY,
              }}
            >
              Quick, easy funding for every stage of business.
            </h1>

            <p
              className="mt-6 max-w-xl leading-relaxed"
              style={{ fontSize: 'clamp(16px, 1.2vw, 18px)', color: MUTED }}
            >
              Delt Capital advances range from <strong style={{ color: NAVY }}>$1,000 to $300,000</strong>{' '}
              and repay as a small share of your daily card sales. No long forms, no compounding interest,
              no personal guarantee.
            </p>

            {/* Value chips */}
            <ul className="mt-8 flex flex-col gap-2.5">
              {heroChips.map((c) => (
                <li key={c} className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ width: 22, height: 22, background: `${PURPLE}18` }}
                  >
                    <Check size={13} color={PURPLE} strokeWidth={3} />
                  </span>
                  <span style={{ color: NAVY, fontSize: 15.5, fontWeight: 500 }}>{c}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:brightness-110"
                style={{
                  background: PURPLE,
                  fontSize: 15,
                  boxShadow: `0 4px 18px ${PURPLE}40`,
                }}
              >
                Check your eligibility
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 font-semibold transition-colors"
                style={{ color: PURPLE, fontSize: 15 }}
              >
                Talk to a specialist
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="relative">
            <HeroOfferCard />
          </div>
        </div>
      </section>

      {/* ═══ 2. THREE-UP VALUE PILLARS (lavender band) ═══════════════ */}
      <section className="px-6 py-20 md:py-24" style={{ background: LAVENDER }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PillarCard
              icon={<FileText size={22} color={PURPLE} />}
              title="Apply in minutes, no long forms."
              body="If you process with Delt, we already have what we need. Most owners finish in under two minutes — no tax returns, no bank statements to upload, no waiting on a loan officer to call back."
            />
            <PillarCard
              icon={<Wallet size={22} color={PURPLE} />}
              title="No interest. Just one flat fee."
              body="What you owe on day one is what you owe at the end. No compounding interest, no late fees, no prepayment penalty — your balance never grows."
            />
            <PillarCard
              icon={<Clock size={22} color={PURPLE} />}
              title="Get money as soon as tomorrow."
              body="Most approvals land same-day. Funds arrive in your linked account the next business day — or instantly with a Delt Checking account."
            />
          </div>
        </div>
      </section>

      {/* ═══ 3. CUSTOM OFFER — split, copy left, offer factors right ═══ */}
      <section className="px-6 py-20 md:py-28" style={{ background: '#FFFFFF' }}>
        <div
          style={{ maxWidth: 1120, margin: '0 auto' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center"
        >
          <div>
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              A custom offer, built for your business
            </div>
            <h2
              className="font-bold leading-[1.1] mb-5"
              style={{
                fontSize: 'clamp(30px, 3.6vw, 46px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              Process with Delt to get an offer sized to your real cash flow.
            </h2>
            <p className="leading-relaxed mb-6" style={{ color: MUTED, fontSize: 16.5 }}>
              We don't underwrite on a credit score and a tax return. We read the signals your business
              already gives off — how long you've been processing with us, your daily card volume, your
              customer mix, and your typical seasonality — and size an offer to your real cash flow.
              The longer you process with Delt, the better the offer tends to get.
            </p>
            <ul className="flex flex-col gap-3 mb-7">
              {[
                'Offers from $1,000 up to $300,000',
                'Re-evaluated daily as your sales evolve',
                'No tax returns, no collateral, no personal guarantee',
                'Checking your offer never affects your credit score',
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span
                    className="inline-flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ width: 20, height: 20, background: `${PURPLE}15`, marginTop: 2 }}
                  >
                    <Check size={12} color={PURPLE} strokeWidth={3} />
                  </span>
                  <span style={{ color: NAVY, fontSize: 15, lineHeight: 1.55 }}>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 font-semibold"
              style={{ color: PURPLE, fontSize: 15 }}
            >
              Check your eligibility
              <ArrowRight size={16} />
            </Link>
          </div>

          <OfferFactorsCard />
        </div>
      </section>

      {/* ═══ 4. AUTOMATED REPAYMENT — lavender full-bleed band ═════════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: LAVENDER }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div
            className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 md:gap-16 items-center mb-12"
          >
            <div>
              <div
                className="text-[12px] font-bold uppercase mb-3"
                style={{ color: PURPLE, letterSpacing: '0.18em' }}
              >
                Simplify your to-do list
              </div>
              <h2
                className="font-bold leading-[1.1] mb-4"
                style={{
                  fontSize: 'clamp(30px, 3.6vw, 46px)',
                  color: NAVY,
                  letterSpacing: '-0.025em',
                }}
              >
                Automated repayments that flex with your week.
              </h2>
              <p className="leading-relaxed" style={{ fontSize: 16.5, color: MUTED }}>
                Repayments happen automatically through your daily Delt card sales — so you have one
                less thing to think about. The percentage you pay stays the same; the dollar amount
                adjusts to match your cash flow. Quiet day, you pay less. Busy day, you pay a little
                more. Nothing to schedule. No invoices. And no interest, so your balance never grows.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {[
                { k: 'Fixed share of card sales',  v: 'not a flat monthly bill' },
                { k: 'Automatic from Delt',         v: 'no invoices, no transfers' },
                { k: 'No late fees',                v: 'no prepayment penalty' },
                { k: 'Typical target terms',        v: '90 to 360 days' },
              ].map((item) => (
                <li
                  key={item.k}
                  className="flex items-center justify-between px-5 py-4 rounded-2xl"
                  style={{ background: '#FFFFFF', border: `1px solid ${HAIRLINE}` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="inline-flex items-center justify-center rounded-full flex-shrink-0"
                      style={{ width: 22, height: 22, background: `${PURPLE}18` }}
                    >
                      <Check size={13} color={PURPLE} strokeWidth={3} />
                    </span>
                    <span style={{ color: NAVY, fontSize: 15, fontWeight: 600 }}>{item.k}</span>
                  </div>
                  <span style={{ color: MUTED, fontSize: 13.5 }}>{item.v}</span>
                </li>
              ))}
            </ul>
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
            Illustrative only — actual hold rate and term vary by offer. Your dashboard always shows
            current balance, hold rate, and projected payoff date.
          </p>
        </div>
      </section>

      {/* ═══ 5. FASTER ACCESS — 2-up (Easy application / Fast deposit) ═ */}
      <section className="px-6 py-20 md:py-28" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="text-center mb-12">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Faster access to funds
            </div>
            <h2
              className="font-bold leading-[1.1]"
              style={{
                fontSize: 'clamp(30px, 3.6vw, 46px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              From click to cash in your account — same week.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpeedCard
              icon={<FileText size={22} color={PURPLE} />}
              eyebrow="Easy application"
              title="A few clicks. No paperwork."
              body="If you're pre-qualified, you'll see your offer in your Delt dashboard and we'll email you. Requesting funding takes about two minutes — no tax returns, no statements to upload, no loan officer to call."
              bullets={[
                'Pre-qualified offers visible in your dashboard',
                'No documents to upload, no hard pull',
                'Notified by email the moment you become eligible',
              ]}
            />
            <SpeedCard
              icon={<Wallet size={22} color={PURPLE} />}
              eyebrow="Fast deposit"
              title="Money in your account, next day."
              body="Once approved, funds wire to your linked account on the next business day — or land instantly if you bank with a Delt Checking account. There's no waiting around for an underwriter to circle back."
              bullets={[
                'Next-business-day deposit by default',
                'Instant deposit with Delt Checking',
                'No origination fees, no upfront costs',
              ]}
            />
          </div>
        </div>
      </section>

      {/* ═══ 6. FUNDING-RANGE STATS BAND (navy) ════════════════════════ */}
      <section
        className="px-6 py-16 md:py-20"
        style={{
          background: NAVY,
          backgroundImage: `radial-gradient(ellipse at 20% 0%, ${PURPLE}33 0%, transparent 55%), radial-gradient(ellipse at 90% 100%, ${PURPLE}22 0%, transparent 60%)`,
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-left md:text-left">
            {[
              { v: '$1K–$300K', l: 'Offer range, sized to your cash flow' },
              { v: 'Same day',  l: 'Most approvals land the day you apply' },
              { v: 'Next day',  l: 'Funds in your account, business days' },
              { v: '$0',        l: 'Origination fees, late fees, prepay fees' },
            ].map((s) => (
              <div key={s.l}>
                <div
                  className="font-bold"
                  style={{
                    color: '#FFFFFF',
                    fontSize: 'clamp(28px, 3vw, 40px)',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.05,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {s.v}
                </div>
                <div
                  className="mt-2 max-w-[220px]"
                  style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13.5, lineHeight: 1.5 }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. TESTIMONIAL (ivory) ════════════════════════════════════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: IVORY }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div className="text-center mb-12">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Owners who funded with Delt
            </div>
            <h2
              className="font-bold leading-[1.1]"
              style={{
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              Real businesses. Real card sales. Real repayment.
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
              <BusinessScene
                theme={t.theme}
                initials={t.initials}
                businessName={t.business}
                location={t.location}
                metric={t.metric}
                aspect="portrait"
                variant={t.accent === '#4945FF' ? 'purple' : 'navy'}
              />
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

      {/* ═══ 8. FAQ ════════════════════════════════════════════════════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div className="text-center mb-10">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Talking money
            </div>
            <h2
              className="font-bold leading-[1.1]"
              style={{
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              Common questions, answered.
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((item, i) => (
              <FaqItem key={item.q} q={item.q} a={item.a} initialOpen={i === 0} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/help-center"
              className="inline-flex items-center gap-2 font-semibold"
              style={{ color: PURPLE, fontSize: 14.5 }}
            >
              Visit the Help Center for more
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 9. PRODUCT CROSS-SELL (existing) ════════════════════════ */}
      <ProductCrossSell currentProduct="capital" variant="light" />

      {/* ═══ 10. FINAL CTA ═══════════════════════════════════════════ */}
      <section className="px-6 py-20 md:py-24 text-center" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
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
              fontSize: 'clamp(30px, 3.6vw, 46px)',
              color: NAVY,
              fontFamily: "'Manrope', 'Inter Tight', sans-serif",
              fontWeight: 600,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
            }}
          >
            Get a custom offer{' '}
            <em style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontStyle: 'italic', fontWeight: 400, color: PURPLE_DK }}>
              in minutes.
            </em>
          </h2>
          <p
            className="mb-8 leading-relaxed mx-auto"
            style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', color: MUTED, maxWidth: 480 }}
          >
            Check your eligibility from your Delt dashboard — no paperwork, no hard pull, no obligation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-white transition-all duration-200 hover:brightness-110"
              style={{
                background: PURPLE,
                fontSize: 15,
                fontWeight: 600,
                boxShadow: `0 4px 18px ${PURPLE}40`,
              }}
            >
              Check your eligibility
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

      {/* ═══ 11. SMALL-PRINT LEGAL ═══════════════════════════════════ */}
      <div
        className="px-6 pt-9 pb-11"
        style={{ background: '#FFFFFF', borderTop: `1px solid ${HAIRLINE}` }}
      >
        <div
          className="max-w-4xl mx-auto flex flex-col gap-2"
          style={{ color: MICRO, fontSize: 11, lineHeight: 1.7 }}
        >
          <p>
            Delt Capital advances are issued by Delt Banking Partners, member FDIC. All advances are subject
            to credit approval and may not be available in every jurisdiction. Actual fees depend on payment
            card processing history, advance amount, and other eligibility factors.
          </p>
          <p>
            Pre-qualified offers are based on information about your business and your processing history
            with Delt. Checking your offer does not affect your personal or business credit score. A
            minimum payment is required and must be repaid as specified in the advance terms. Illustrative
            figures shown on this page are for demonstration only.
          </p>
        </div>
      </div>

    </div>
  );
}

export default CapitalPage;
