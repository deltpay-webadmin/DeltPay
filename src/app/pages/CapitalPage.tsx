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
} from 'lucide-react';
import { AutomatedRepayment } from '../components/AutomatedRepayment';
import { ProductCrossSell } from '../components/ProductCrossSell';

/* ─── Design tokens ─────────────────────────────────────────── */
const NAVY   = '#041E42';
const PURPLE = '#4945FF';

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

/* ─── FAQ accordion item ─────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: `${NAVY}1A` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        style={{ background: open ? `${NAVY}05` : '#FFFFFF' }}
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
              style={{ color: '#475569' }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Resource card ──────────────────────────────────────────── */
function ResourceCard({
  title,
  cta,
  icon: Icon,
}: {
  title: string;
  cta: 'Download' | 'Read';
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div
      className="group rounded-2xl border p-6 flex flex-col gap-4 cursor-pointer transition-all duration-200"
      style={{
        borderColor: `${NAVY}1A`,
        background: '#FFFFFF',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${PURPLE}22`;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${PURPLE}15` }}
      >
        <Icon size={18} className="text-[#4945FF]" />
      </div>
      <p
        className="font-semibold text-base leading-snug flex-1"
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
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#FFFFFF' }}>

      {/* ═══ 1. HERO ═══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden flex flex-col items-center justify-center text-center px-6 py-28 md:py-36"
        style={{ background: NAVY }}
      >
        {/* Purple glow blobs */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${PURPLE}30 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            bottom: '-15%',
            right: '-10%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${PURPLE}20 0%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
        />

        {/* Eyebrow pill */}
        <div
          className="relative inline-flex items-center rounded-full px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest"
          style={{
            background: `${PURPLE}25`,
            color: '#A8A5FF',
            border: `1px solid ${PURPLE}50`,
          }}
        >
          Delt Capital
        </div>

        {/* Headline */}
        <h1
          className="relative font-bold text-white leading-[1.1] max-w-4xl"
          style={{
            fontSize: 'clamp(36px, 5.5vw, 68px)',
            letterSpacing: '-0.03em',
          }}
        >
          Fast, easy, and flexible funding from a partner who gets it.
        </h1>

        {/* Subhead */}
        <p
          className="relative mt-6 max-w-2xl leading-relaxed"
          style={{
            fontSize: 'clamp(16px, 1.5vw, 20px)',
            color: 'rgba(255,255,255,0.72)',
          }}
        >
          Crunched for cash or ready to expand? Access loans ranging from{' '}
          <strong className="text-white">$1,000 to $300,000</strong> with Delt Capital. Requires an active Delt account with card processing history. Subject to eligibility.
        </p>

        {/* CTAs */}
        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg"
            style={{
              background: PURPLE,
              fontSize: 15,
              boxShadow: `0 4px 20px ${PURPLE}60`,
            }}
          >
            See if you're pre-qualified
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold transition-all duration-200"
            style={{
              border: '1.5px solid rgba(255,255,255,0.35)',
              color: '#FFFFFF',
              fontSize: 15,
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
            }}
          >
            Schedule a demo
          </Link>
        </div>
      </section>

      {/* ═══ 2. "A FINANCIAL PARTNER LIKE NO OTHER" ════════════════ */}
      <section className="px-6 py-24 md:py-32" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          {/* Intro */}
          <div className="max-w-2xl mb-14">
            <h2
              className="font-bold mb-4 leading-[1.15]"
              style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', color: NAVY, letterSpacing: '-0.025em' }}
            >
              A financial partner like no other
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#475569' }}>
              We've been building alongside small business owners for years. Which means
              industry-specific nuances like seasonality don't scare us one bit. What else
              sets us apart?
            </p>
          </div>

          {/* 3-card row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: Briefcase,
                title: 'Industry expertise',
                body: 'We know how retail, restaurants, salons, and pro-services actually work. Funding sized to real operations.',
              },
              {
                Icon: Zap,
                title: 'Fast and flexible loans',
                body: 'From $1,000 to $300,000. Funds typically arrive in your account as soon as the next business day after approval, subject to eligibility.',
              },
              {
                Icon: RefreshCw,
                title: 'Easy repayment',
                body: 'Payments flex with your daily sales. When revenue dips, so does your payment.',
              },
            ].map(({ Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-2xl border p-7 flex flex-col gap-5 transition-all duration-200"
                style={{ borderColor: `${NAVY}1A` }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${PURPLE}20`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                {/* Icon container */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-200 group-hover:bg-[#4945FF]"
                  style={{ background: NAVY }}
                >
                  <Icon size={24} color="#FFFFFF" />
                </div>
                <div>
                  <h3
                    className="font-bold text-lg mb-2"
                    style={{ color: NAVY, letterSpacing: '-0.015em' }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. AUTOMATED DAILY REPAYMENT ══════════════════════════ */}
      <section style={{ background: NAVY }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }} className="px-6 py-24 md:py-32">
          {/* Section headline */}
          <div className="text-center mb-14">
            <h2
              className="font-bold text-white mb-4 leading-[1.1]"
              style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', letterSpacing: '-0.025em' }}
            >
              Automated daily repayment
            </h2>
            <p
              className="mx-auto max-w-2xl leading-relaxed"
              style={{ fontSize: 'clamp(15px, 1.3vw, 18px)', color: 'rgba(255,255,255,0.65)' }}
            >
              In small business, unpredictability is, well, predictable. That's why Delt
              Capital repayment flexes with your cash flow.
            </p>
          </div>

          {/* Chart component — title suppressed; outer section heading takes precedence */}
          <div className="rounded-3xl overflow-hidden">
            <AutomatedRepayment hideTitle />
          </div>

          {/* Footnote */}
          <p
            className="text-center mt-8 text-xs"
            style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 560, margin: '2rem auto 0' }}
          >
            On days when your sales are higher, you'll pay more than on days your sales are lower.
          </p>
        </div>
      </section>

      {/* ═══ 4. FAQ ════════════════════════════════════════════════ */}
      <section className="px-6 py-24 md:py-32" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2
            className="font-bold mb-10 text-center"
            style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', color: NAVY, letterSpacing: '-0.025em' }}
          >
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. RESOURCES "MORE FOR YOUR BUSINESS" ════════════════ */}
      <section className="px-6 py-24 md:py-28" style={{ background: '#F8F9FC' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <h2
            className="font-bold mb-10"
            style={{ fontSize: 'clamp(26px, 3vw, 40px)', color: NAVY, letterSpacing: '-0.02em' }}
          >
            More for your business
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ResourceCard
              title="Small business expansion checklist"
              cta="Download"
              icon={Download}
            />
            <ResourceCard
              title="How much do small businesses make? (2026 data)"
              cta="Read"
              icon={BookOpen}
            />
            <ResourceCard
              title="Loans 101: Everything about applications"
              cta="Read"
              icon={BookOpen}
            />
          </div>
        </div>
      </section>

      {/* ═══ 6. PRODUCT CROSS-SELL ═════════════════════════════════ */}
      <ProductCrossSell currentProduct="capital" />

      {/* ═══ 7. FINAL CTA BANNER ═══════════════════════════════════ */}
      <section
        className="px-6 py-24 md:py-32 text-center relative overflow-hidden"
        style={{ background: NAVY }}
      >
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 100%, ${PURPLE}25 0%, transparent 70%)`,
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          <h2
            className="font-bold text-white mb-4 leading-[1.1]"
            style={{ fontSize: 'clamp(30px, 4vw, 54px)', letterSpacing: '-0.03em' }}
          >
            Get started today
          </h2>
          <p
            className="mb-10 leading-relaxed"
            style={{ fontSize: 'clamp(15px, 1.3vw, 18px)', color: 'rgba(255,255,255,0.65)' }}
          >
            Talk to a specialist and see how Delt Capital can help your business.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:brightness-110"
              style={{
                background: PURPLE,
                fontSize: 15,
                boxShadow: `0 4px 20px ${PURPLE}60`,
              }}
            >
              Schedule a demo
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold transition-all duration-200"
              style={{
                border: '1.5px solid rgba(255,255,255,0.35)',
                color: '#FFFFFF',
                fontSize: 15,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
              }}
            >
              See pricing
            </Link>
          </div>
          <p className="mt-8 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Questions about your application?{' '}
            <Link to="/help-center" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'underline' }}>
              Visit our Help Center
            </Link>
          </p>
        </div>
      </section>

      {/* ═══ 8. LEGAL FOOTNOTE ═════════════════════════════════════ */}
      <div
        className="px-6 py-8"
        style={{ background: NAVY, borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="max-w-4xl mx-auto flex flex-col gap-2"
          style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, lineHeight: 1.7 }}
        >
          <p>
            Delt Capital loans are issued by Delt Banking Partners, member FDIC. Loans are
            subject to credit approval and may not be available in certain jurisdictions.
          </p>
          <p>
            Pre-qualified offers are based on information about your business and your account
            history with Delt. All loans subject to credit approval.
          </p>
        </div>
      </div>

    </div>
  );
}

export default CapitalPage;
