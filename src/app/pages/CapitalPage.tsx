import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import {
  ArrowRight,
  DollarSign,
  Clock,
  TrendingUp,
  Zap,
  BarChart3,
  Landmark,
  Percent,
  CalendarCheck,
  RefreshCw,
  Lock,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { ScrollIndicator } from '../components/ScrollIndicator';

/* ═══ CONSTANTS ═══ */
const BG = '#041E42';
const NAVY = '#041E42';
const PURPLE = '#4945FF';
const GREEN = '#16C784';
const WHITE = '#FFFFFF';
const JAKARTA = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
const MONO = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

/* ═══ CountUp Hook ═══ */
function useCountUp(target: number, inView: boolean, duration = 1600) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = performance.now();
    function update(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [inView, target, duration]);

  return value;
}

/* ═══════════════════════════════════════════════════════════════
   HERO SECTION — New copy
   ═══════════════════════════════════════════════════════════════ */
function CapitalHero() {
  return (
    <section
      className="relative flex items-center overflow-hidden"
      style={{ background: BG, minHeight: '100vh' }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(73,69,255,0.07) 0%, rgba(0,0,0,0) 70%)`,
        }}
      />

      <div
        className="relative z-10 w-full mx-auto"
        style={{ maxWidth: 1120, padding: '180px 40px 120px', textAlign: 'center' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2"
          style={{
            padding: '6px 18px',
            borderRadius: 999,
            border: '1.5px solid rgba(73,69,255,0.4)',
            background: 'rgba(73,69,255,0.08)',
            marginBottom: 36,
          }}
        >
          <Landmark size={14} color={PURPLE} />
          <span
            style={{
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 600,
              color: PURPLE,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Delt Capital
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: JAKARTA,
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: 800,
            color: WHITE,
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            marginBottom: 28,
            maxWidth: 780,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Funding based on{' '}
          <span style={{ color: PURPLE }}>what you've earned,</span>
          {' '}not what a bank thinks.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          style={{
            fontFamily: JAKARTA,
            fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.5)',
            maxWidth: 640,
            margin: '0 auto 48px',
          }}
        >
          Traditional lenders approve too few small businesses, fund too little of what they need,
          and take too long to decide. Delt Capital gives merchants a better path forward with
          higher approval confidence, faster decisions, and transparent terms.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex items-center justify-center"
          style={{ gap: 16 }}
        >
          <Link
            to="/apply"
            className="inline-flex items-center no-underline"
            style={{
              gap: 10,
              background: PURPLE,
              color: WHITE,
              fontFamily: JAKARTA,
              fontSize: 15,
              fontWeight: 700,
              padding: '14px 32px',
              borderRadius: 14,
              boxShadow: '0 8px 32px rgba(73,69,255,0.3)',
            }}
          >
            Check Your Rate <ArrowRight size={16} />
          </Link>
          <span style={{ fontFamily: JAKARTA, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            No credit check to apply
          </span>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <ScrollIndicator style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)' }} />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT COMPARISON ROW
   ═══════════════════════════════════════════════════════════════ */
interface StatRowData {
  industryLabel: string;
  industryValue: number;
  industrySuffix: string;
  industryDesc: string;
  industrySource: string;
  deltValue: string;
  deltTarget: number;
  deltSuffix: string;
  deltPrefix?: string;
  deltIsText?: boolean;
  deltDesc: string;
}

const statRows: StatRowData[] = [
  {
    industryLabel: 'Industry average',
    industryValue: 36,
    industrySuffix: '%',
    industryDesc: 'Only about a third of small businesses that apply for funding get approved.',
    industrySource: 'Source: Federal Reserve Banks, Small Business Credit Survey',
    deltValue: '85%',
    deltTarget: 85,
    deltSuffix: '%',
    deltDesc: 'Most merchants who apply get funded because we underwrite using real sales data, not just a credit score.',
  },
  {
    industryLabel: 'Industry average',
    industryValue: 52,
    industrySuffix: '%',
    industryDesc: 'More than half of small businesses get only part of the financing they need — or none at all.',
    industrySource: 'Source: U.S. Small Business Administration',
    deltValue: '48hr',
    deltTarget: 48,
    deltSuffix: 'hr',
    deltDesc: 'From application to funding in as little as 48 hours. No waiting weeks. No endless back-and-forth.',
  },
  {
    industryLabel: 'Industry average',
    industryValue: 81,
    industrySuffix: '%',
    industryDesc: 'Most business owners say it is difficult to access affordable capital.',
    industrySource: 'Source: Goldman Sachs 10,000 Small Businesses Survey',
    deltValue: '$0',
    deltTarget: 0,
    deltSuffix: '',
    deltPrefix: '$',
    deltIsText: true,
    deltDesc: 'No application fees. No origination fees. No hidden charges. You see the full cost upfront before you sign.',
  },
];

function StatRow({ data, index }: { data: StatRowData; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const industryCount = useCountUp(data.industryValue, inView);
  const deltCount = useCountUp(data.deltTarget, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
      style={{ marginBottom: 60 }}
    >
      {/* Desktop: side-by-side grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 60px 1fr',
          alignItems: 'center',
          gap: 0,
        }}
        className="capital-stat-row"
      >
        {/* Industry card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20,
            padding: '40px 36px',
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: 20,
            }}
          >
            {data.industryLabel}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 'clamp(56px, 8vw, 84px)',
              fontWeight: 800,
              lineHeight: 1,
              color: 'rgba(255,255,255,0.12)',
              marginBottom: 16,
            }}
          >
            {industryCount}{data.industrySuffix}
          </div>
          <p
            style={{
              fontFamily: JAKARTA,
              fontSize: 15,
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.4)',
              maxWidth: 340,
              margin: '0 0 10px',
            }}
          >
            {data.industryDesc}
          </p>
          <div
            style={{
              fontFamily: JAKARTA,
              fontSize: 11,
              color: 'rgba(255,255,255,0.2)',
              fontStyle: 'italic',
            }}
          >
            {data.industrySource}
          </div>
        </div>

        {/* VS divider */}
        <div className="flex items-center justify-center">
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.2)',
            }}
          >
            vs
          </span>
        </div>

        {/* Delt card */}
        <div
          style={{
            background: 'rgba(73,69,255,0.06)',
            border: '1px solid rgba(73,69,255,0.18)',
            borderRadius: 20,
            padding: '40px 36px',
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: PURPLE,
              marginBottom: 20,
            }}
          >
            Delt Capital
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: data.deltIsText ? 'clamp(40px, 6vw, 64px)' : 'clamp(56px, 8vw, 84px)',
              fontWeight: 800,
              lineHeight: 1,
              color: PURPLE,
              marginBottom: 16,
            }}
          >
            {data.deltIsText
              ? data.deltValue
              : `${data.deltPrefix || ''}${deltCount}${data.deltSuffix}`}
          </div>
          <p
            style={{
              fontFamily: JAKARTA,
              fontSize: 15,
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 340,
              margin: 0,
            }}
          >
            {data.deltDesc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function FundingGapStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section style={{ background: BG, padding: '120px 0' }}>
      <div ref={ref} style={{ maxWidth: 1120, margin: '0 auto', padding: '0 40px' }}>
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: PURPLE,
            marginBottom: 24,
          }}
        >
          The funding gap
        </motion.div>

        {/* Section headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: MONO,
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            lineHeight: 1.15,
            color: WHITE,
            maxWidth: 680,
            marginBottom: 80,
          }}
        >
          Small businesses deserve better than a{' '}
          <span style={{ color: PURPLE }}>36% shot</span> at getting funded.
        </motion.h2>

        {/* Stat rows */}
        {statRows.map((row, i) => (
          <StatRow key={i} data={row} index={i} />
        ))}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.7 }}
          style={{ textAlign: 'center', marginTop: 40 }}
        >
          <h3
            style={{
              fontFamily: MONO,
              fontSize: 'clamp(20px, 3vw, 32px)',
              fontWeight: 700,
              color: WHITE,
              lineHeight: 1.3,
              marginBottom: 8,
            }}
          >
            Apply with <span style={{ color: PURPLE }}>confidence.</span>
          </h3>
          <p
            style={{
              fontFamily: JAKARTA,
              fontSize: 16,
              color: 'rgba(255,255,255,0.45)',
              marginBottom: 32,
            }}
          >
            See what your business may qualify for in minutes.
          </p>
          <Link
            to="/apply"
            className="inline-flex items-center no-underline"
            style={{
              gap: 10,
              background: PURPLE,
              color: WHITE,
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.04em',
              padding: '16px 40px',
              borderRadius: 10,
              boxShadow: '0 8px 30px rgba(73,69,255,0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            Check Your Rate <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 768px) {
          .capital-stat-row {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════ */
const howSteps = [
  { icon: BarChart3, title: 'Connect your sales', desc: 'We analyze your revenue through Delt — no paperwork, no financials to upload. If you process with us, you\u2019re already approved for a review.' },
  { icon: Zap, title: 'Get your offer in hours', desc: 'Our underwriting runs on live transaction data. Most merchants see an offer within 24 hours — some in minutes.' },
  { icon: DollarSign, title: 'Funds hit your account', desc: 'Accept your terms and capital is deposited directly. No wire delays, no waiting for checks to clear.' },
  { icon: RefreshCw, title: 'Repay as you earn', desc: 'A small, fixed percentage of daily sales goes toward repayment. Sell more, pay faster. Slow day? You pay less.' },
];

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section style={{ background: NAVY, padding: '120px 48px' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 80 }}>
          <div className="inline-flex items-center gap-2" style={{ padding: '6px 18px', borderRadius: 999, border: '1.5px solid rgba(73,69,255,0.3)', marginBottom: 24 }}>
            <span style={{ fontFamily: JAKARTA, fontSize: 12, fontWeight: 700, color: PURPLE, letterSpacing: '0.08em', textTransform: 'uppercase' }}>How It Works</span>
          </div>
          <h2 style={{ fontFamily: JAKARTA, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: WHITE, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            From application to funded in four steps
          </h2>
          <p style={{ fontFamily: JAKARTA, fontSize: 'clamp(1rem, 1.3vw, 1.15rem)', color: 'rgba(255,255,255,0.45)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            No banks. No board approval. No personal guarantees.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {howSteps.map((step, i) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: 'rgba(73,69,255,0.04)', border: '1px solid rgba(73,69,255,0.1)', borderRadius: 24, padding: 40, position: 'relative' }}
            >
              <div style={{ position: 'absolute', top: 20, right: 24, fontFamily: JAKARTA, fontSize: 48, fontWeight: 800, color: 'rgba(73,69,255,0.08)', lineHeight: 1 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(73,69,255,0.1)', marginBottom: 24 }}>
                <step.icon size={22} color={PURPLE} />
              </div>
              <h3 style={{ fontFamily: JAKARTA, fontSize: 20, fontWeight: 800, color: WHITE, marginBottom: 12 }}>{step.title}</h3>
              <p style={{ fontFamily: JAKARTA, fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GLOBE TRANSITION
   ═══════════════════════════════════════════════════════════════ */
function GlobeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div
      ref={ref}
      style={{
        background: NAVY,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 80,
        height: 'clamp(340px, 42vw, 560px)',
      }}
    >
      <motion.img
        src={globeImg}
        alt="Global network"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 'clamp(560px, 65vw, 980px)',
          height: 'auto',
          objectFit: 'contain',
          flexShrink: 0,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WHY DELT CAPITAL
   ═══════════════════════════════════════════════════════════════ */
const features = [
  { icon: Clock, title: 'Same-day decisions', desc: 'No weeks of back-and-forth. Most offers are generated within hours of connecting your Delt account.' },
  { icon: Percent, title: 'One flat factor rate', desc: 'No compounding interest, no variable APR. You see your total cost upfront and it never changes.' },
  { icon: TrendingUp, title: 'Revenue-synced repayment', desc: 'Repayment adjusts to your daily sales. Good months move faster. Slow months cost you less.' },
  { icon: Lock, title: 'No personal guarantee', desc: 'We underwrite based on business performance, not your personal credit score or home equity.' },
  { icon: CalendarCheck, title: 'No fixed due dates', desc: 'There are no monthly bills to miss. Repayment happens automatically as a percentage of daily sales.' },
  { icon: Layers, title: 'Stacks with your Delt tools', desc: 'Capital data flows into your dashboard, your Lens insights, and your storefront analytics.' },
];

function WhyDeltCapital() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section style={{ background: BG, padding: '120px 48px' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 80 }}>
          <div className="inline-flex items-center gap-2" style={{ padding: '6px 18px', borderRadius: 999, border: '1.5px solid rgba(73,69,255,0.3)', marginBottom: 24 }}>
            <span style={{ fontFamily: JAKARTA, fontSize: 12, fontWeight: 700, color: PURPLE, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Why Delt Capital</span>
          </div>
          <h2 style={{ fontFamily: JAKARTA, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: WHITE, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            Funding built for how business actually works
          </h2>
          <p style={{ fontFamily: JAKARTA, fontSize: 'clamp(1rem, 1.3vw, 1.15rem)', color: 'rgba(255,255,255,0.45)', maxWidth: 640, margin: '0 auto', lineHeight: 1.7 }}>
            Traditional lenders look at your past. We look at your momentum.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 36 }}
            >
              <div className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(73,69,255,0.08)', marginBottom: 20 }}>
                <f.icon size={20} color={PURPLE} />
              </div>
              <h3 style={{ fontFamily: JAKARTA, fontSize: 18, fontWeight: 700, color: WHITE, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontFamily: JAKARTA, fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FUNDING CALCULATOR
   ═══════════════════════════════════════════════════════════════ */
function FundingCalculator() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [monthlyRevenue, setMonthlyRevenue] = useState(50000);
  const [fundingAmount, setFundingAmount] = useState(25000);

  const factorRate = 1.15;
  const totalRepayment = fundingAmount * factorRate;
  const dailyRepayment = (totalRepayment / 180).toFixed(0);
  const holdbackPercent = (((totalRepayment / 180) / (monthlyRevenue / 30)) * 100).toFixed(1);

  return (
    <section style={{ background: NAVY, padding: '120px 48px' }}>
      <div ref={ref} style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="inline-flex items-center gap-2" style={{ padding: '6px 18px', borderRadius: 999, border: '1.5px solid rgba(73,69,255,0.3)', marginBottom: 24 }}>
            <span style={{ fontFamily: JAKARTA, fontSize: 12, fontWeight: 700, color: PURPLE, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Estimate Your Terms</span>
          </div>
          <h2 style={{ fontFamily: JAKARTA, fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: WHITE, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            See what you could qualify for
          </h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2, duration: 0.6 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '48px 56px' }}
        >
          <div style={{ marginBottom: 40 }}>
            <div className="flex justify-between" style={{ marginBottom: 12 }}>
              <span style={{ fontFamily: JAKARTA, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Monthly Revenue</span>
              <span style={{ fontFamily: JAKARTA, fontSize: 18, fontWeight: 800, color: WHITE }}>${monthlyRevenue.toLocaleString()}</span>
            </div>
            <input type="range" min={10000} max={500000} step={5000} value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(Number(e.target.value))} style={{ width: '100%', accentColor: PURPLE }} />
          </div>

          <div style={{ marginBottom: 48 }}>
            <div className="flex justify-between" style={{ marginBottom: 12 }}>
              <span style={{ fontFamily: JAKARTA, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Funding Amount</span>
              <span style={{ fontFamily: JAKARTA, fontSize: 18, fontWeight: 800, color: WHITE }}>${fundingAmount.toLocaleString()}</span>
            </div>
            <input type="range" min={5000} max={Math.min(monthlyRevenue * 2, 500000)} step={5000} value={fundingAmount} onChange={(e) => setFundingAmount(Number(e.target.value))} style={{ width: '100%', accentColor: PURPLE }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { label: 'Total Repayment', value: `$${totalRepayment.toLocaleString()}` },
              { label: 'Est. Daily Payment', value: `$${dailyRepayment}` },
              { label: 'Daily Holdback', value: `${holdbackPercent}%` },
            ].map((item) => (
              <div key={item.label} style={{ background: 'rgba(73,69,255,0.06)', borderRadius: 16, padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ fontFamily: JAKARTA, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontFamily: JAKARTA, fontSize: 28, fontWeight: 800, color: WHITE, letterSpacing: '-0.02em' }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link to="/apply" className="inline-flex items-center no-underline" style={{ gap: 10, background: PURPLE, color: WHITE, fontFamily: JAKARTA, fontSize: 15, fontWeight: 700, padding: '14px 36px', borderRadius: 14 }}>
              Get your real offer <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   USE CASES
   ═══════════════════════════════════════════════════════════════ */
const useCases = [
  { title: 'Inventory purchase', desc: 'Stock up before peak season without draining your operating cash.', amount: '$35,000' },
  { title: 'Equipment upgrade', desc: 'Replace aging POS terminals, kitchen equipment, or service tools.', amount: '$18,000' },
  { title: 'Marketing push', desc: 'Fund a campaign when your data shows the timing is right.', amount: '$12,000' },
  { title: 'New location deposit', desc: 'Secure a lease and build-out costs for your second location.', amount: '$75,000' },
];

function UseCases() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section style={{ background: BG, padding: '120px 48px' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ marginBottom: 60 }}>
          <div className="inline-flex items-center gap-2" style={{ padding: '6px 18px', borderRadius: 999, border: '1.5px solid rgba(73,69,255,0.3)', marginBottom: 24 }}>
            <span style={{ fontFamily: JAKARTA, fontSize: 12, fontWeight: 700, color: PURPLE, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Use Cases</span>
          </div>
          <h2 style={{ fontFamily: JAKARTA, fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800, color: WHITE, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
            Put capital to work where it matters
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {useCases.map((uc, i) => (
            <motion.div key={uc.title} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '32px 36px' }}
            >
              <div>
                <h3 style={{ fontFamily: JAKARTA, fontSize: 20, fontWeight: 700, color: WHITE, marginBottom: 6 }}>{uc.title}</h3>
                <p style={{ fontFamily: JAKARTA, fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0, maxWidth: 340 }}>{uc.desc}</p>
              </div>
              <div style={{ fontFamily: JAKARTA, fontSize: 28, fontWeight: 800, color: PURPLE, letterSpacing: '-0.02em', flexShrink: 0, marginLeft: 24 }}>
                {uc.amount}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FINAL CTA — Interactive Dot Grid
   ═══════════════════════════════════════════════════════════════ */
function InteractiveDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, w, h);

    const spacing = 28;
    const cols = Math.ceil(w / spacing) + 1;
    const rows = Math.ceil(h / spacing) + 1;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const hoverRadius = 160;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * spacing;
        const y = row * spacing;
        const dx = mx - x;
        const dy = my - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / hoverRadius);
        const baseAlpha = 0.08;
        const alpha = baseAlpha + influence * 0.55;
        const baseSize = 1.2;
        const size = baseSize + influence * 2.8;

        const r = Math.round(73 + influence * 100);
        const g = Math.round(69 + influence * 140);
        const b = Math.round(255);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();

        if (influence > 0.2) {
          const neighbors = [
            [col + 1, row],
            [col, row + 1],
            [col + 1, row + 1],
          ];
          for (const [nc, nr] of neighbors) {
            const nx = nc * spacing;
            const ny = nr * spacing;
            const ndx = mx - nx;
            const ndy = my - ny;
            const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
            const nInfluence = Math.max(0, 1 - ndist / hoverRadius);
            if (nInfluence > 0.2) {
              const lineAlpha = Math.min(influence, nInfluence) * 0.3;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(nx, ny);
              ctx.strokeStyle = `rgba(73,69,255,${lineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'auto' }}
    />
  );
}

function CapitalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: NAVY, padding: '180px 48px 200px', textAlign: 'center' }}
    >
      <InteractiveDots />

      <div className="absolute pointer-events-none" style={{ top: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(73,69,255,0.12) 0%, rgba(0,0,0,0) 70%)' }} />
      <div className="absolute pointer-events-none" style={{ top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(73,69,255,0.08) 0%, rgba(0,0,0,0) 70%)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(73,69,255,0.06) 0%, rgba(0,0,0,0) 70%)' }} />

      <div ref={ref} className="relative z-10" style={{ maxWidth: 760, margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: JAKARTA,
            fontSize: 'clamp(2.6rem, 5vw, 3.8rem)',
            fontWeight: 800,
            color: WHITE,
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          Ready to run your business smarter?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: JAKARTA,
            fontSize: 'clamp(1.05rem, 1.5vw, 1.2rem)',
            color: 'rgba(255,255,255,0.50)',
            lineHeight: 1.7,
            marginBottom: 48,
            maxWidth: 560,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Payments, funding, a website, and AI — all in one place. Start free today.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Link
            to="/apply"
            className="inline-flex items-center no-underline"
            style={{
              gap: 10,
              background: PURPLE,
              color: WHITE,
              fontFamily: JAKARTA,
              fontSize: 16,
              fontWeight: 700,
              padding: '16px 40px',
              borderRadius: 14,
              boxShadow: `0 8px 32px rgba(73,69,255,0.3)`,
            }}
          >
            Get started <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════════════════════════ */
export function CapitalPage() {
  return (
    <div style={{ minHeight: '100vh', background: NAVY }}>
      <CapitalHero />
      <FundingGapStats />
      <HowItWorks />
      <WhyDeltCapital />
      <UseCases />
      <CapitalCTA />
    </div>
  );
}