import { motion } from 'motion/react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Check,
  ShieldAlert,
  Scale,
  Repeat,
  Zap,
  Lock,
  TrendingDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

/* ─── Design tokens (match Delt brand) ───────────────────────── */
const NAVY     = '#041E42';
const PURPLE   = '#4945FF';
const LAVENDER = '#EDEBFF';
const IVORY    = '#F6F7FB';
const MUTED    = '#475569';
const MICRO    = '#94A3B8';
const HAIRLINE = 'rgba(4,30,66,0.10)';
const JAKARTA  = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

/* ─── Verticals we approve ───────────────────────────────────── */
const VERTICALS = [
  { name: 'Travel & Tourism',           note: 'Tour operators, OTAs, ticketing' },
  { name: 'Nutraceuticals & Supplements', note: 'Continuity, free-trial, retail' },
  { name: 'Multilevel Marketing',       note: 'MLM, affiliate, network sales' },
  { name: 'Pharmaceuticals',            note: 'Telehealth & licensed pharma' },
  { name: 'CBD & Hemp',                 note: 'Federally compliant brands' },
  { name: 'Cryptocurrency & Blockchain', note: 'Exchanges, on/off-ramps, wallets' },
  { name: 'Debt Collection',            note: 'First & third-party collectors' },
  { name: 'Tech Support',               note: 'Remote IT & SaaS recovery' },
  { name: 'Cigars & Tobacco',           note: 'Retail, mail-order, B2B' },
  { name: 'Subscription Models',        note: 'Continuity, rebill, memberships' },
  { name: 'Firearms & Accessories',     note: 'FFL-compliant merchants' },
  { name: 'Adult Products',             note: 'Compliant DTC and platforms' },
  { name: 'Coaching & Info Products',   note: 'High-ticket digital sales' },
  { name: 'Dating & Companionship',     note: 'Apps, sites, premium tiers' },
  { name: 'And many more',              note: 'If you got told no, ask us.' },
];

/* ─── Feature highlights ─────────────────────────────────────── */
const HIGHLIGHTS = [
  {
    icon: Scale,
    title: 'Custom rate cards',
    body: 'Pricing built around your true risk profile — not a flat take-rate that punishes the entire vertical.',
  },
  {
    icon: Repeat,
    title: 'Rate match',
    body: 'Send us your current statement. If we can beat it, we will. If we can\'t, we\'ll match.',
  },
  {
    icon: TrendingDown,
    title: 'Rate compare',
    body: 'Side-by-side breakdown of your effective cost — interchange, assessments, processor margin, all of it.',
  },
  {
    icon: Lock,
    title: 'Stable MIDs',
    body: 'Underwriting that lasts. We build durable accounts, not 90-day burner MIDs that get shut off the second volume spikes.',
  },
  {
    icon: Zap,
    title: 'Fast approvals',
    body: 'Most high-risk merchants approved in 48–72 hours with documents in. Multi-MID structuring on day one if you need it.',
  },
  {
    icon: ShieldAlert,
    title: 'Chargeback toolkit',
    body: 'Alerts, deflection, and representment built in — so a 2% ratio doesn\'t become a TMF problem.',
  },
];

/* ─── Pain points ────────────────────────────────────────────── */
const PAINS = [
  'Account frozen or terminated by your processor',
  'Funds being held or rolled at higher reserves than promised',
  'Stripe, Square, or PayPal shut you down with no explanation',
  'New vertical and every aggregator says "we don\'t support that"',
  'Bumping into volume caps every single month',
  'Paying 8–12% effective and have no idea why',
];

export function HighRiskProcessingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: JAKARTA, background: '#FFFFFF' }}>

      {/* ═══ 1. HERO ═════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden pt-28 pb-24 lg:pt-32 lg:pb-28"
        style={{ background: NAVY }}
      >
        {/* Ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -160,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(73,69,255,0.45), transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: -200,
            left: -100,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(73,69,255,0.22), transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

        <div className="relative max-w-[1240px] mx-auto px-6 lg:px-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className="inline-block rounded-full"
              style={{ width: 8, height: 8, background: '#9C9AFF' }}
            />
            <Link
              to="/products"
              className="text-[12px] font-semibold uppercase"
              style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.14em' }}
            >
              Solutions
            </Link>
            <ChevronRight size={12} color="rgba(255,255,255,0.55)" />
            <span
              className="text-[12px] font-semibold uppercase"
              style={{ color: '#FFFFFF', letterSpacing: '0.14em' }}
            >
              High Risk Processing
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-[920px]"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              <AlertTriangle size={14} style={{ color: '#9C9AFF' }} />
              <span
                className="text-[11px] font-bold uppercase"
                style={{ color: '#FFFFFF', letterSpacing: '0.14em' }}
              >
                For merchants who keep getting told no
              </span>
            </div>

            <h1
              className="text-[44px] lg:text-[72px] font-extrabold leading-[1.02] mb-6"
              style={{ color: '#FFFFFF', letterSpacing: '-0.025em' }}
            >
              Shut down by
              <br />
              your processor?
            </h1>
            <h2
              className="text-[28px] lg:text-[40px] font-bold leading-[1.1] mb-8 max-w-[760px]"
              style={{ color: '#9C9AFF', letterSpacing: '-0.02em' }}
            >
              Tired of Stripe shutting you down?
            </h2>

            <p
              className="text-[18px] lg:text-[20px] leading-relaxed mb-10 max-w-[680px]"
              style={{ color: 'rgba(255,255,255,0.78)' }}
            >
              Delt approves every major high-risk vertical with a real underwriting team,
              custom rate cards, and stable MIDs that don't disappear the second your
              volume scales. Bring us your statement — we'll match it, beat it, or tell
              you straight up that we can't.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/contact-sales"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-bold transition-all"
                style={{ background: '#FFFFFF', color: NAVY }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Get approved <ArrowRight size={16} />
              </Link>
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-bold transition-all"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.22)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.16)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
                }}
              >
                Send your statement <ArrowRight size={16} />
              </Link>
            </div>

            {/* Quick proof bar */}
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
              {[
                'Custom rates',
                'Rate match',
                'Rate compare',
                'All high-risk verticals',
              ].map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <Check size={16} style={{ color: '#9C9AFF' }} strokeWidth={2.5} />
                  <span className="text-[13px] font-semibold" style={{ color: '#FFFFFF' }}>
                    {p}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 2. WE SEE YOU ═══════════════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <div
                className="text-[12px] font-bold uppercase mb-4"
                style={{ color: PURPLE, letterSpacing: '0.18em' }}
              >
                If any of this sounds familiar
              </div>
              <h2
                className="text-[36px] lg:text-[48px] font-extrabold leading-[1.05] mb-5"
                style={{ color: NAVY, letterSpacing: '-0.02em' }}
              >
                We've seen it before. We've fixed it before.
              </h2>
              <p className="text-[17px] leading-relaxed" style={{ color: MUTED }}>
                The big aggregators are great until they're not. The second your
                vertical hits their risk model, you're frozen, rolled, or terminated —
                often without a phone call. That's the gap Delt was built for.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div
                className="rounded-2xl p-8"
                style={{ background: IVORY, border: `1px solid ${HAIRLINE}` }}
              >
                <div className="space-y-4">
                  {PAINS.map((p) => (
                    <div key={p} className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(73,69,255,0.10)', border: '1px solid rgba(73,69,255,0.20)' }}
                      >
                        <Check size={14} style={{ color: PURPLE }} strokeWidth={2.5} />
                      </div>
                      <div className="text-[16px] font-semibold leading-snug" style={{ color: NAVY }}>
                        {p}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. HIGHLIGHTS ═══════════════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: IVORY }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-14 max-w-[760px]"
          >
            <div
              className="text-[12px] font-bold uppercase mb-4"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              How we approve
            </div>
            <h2
              className="text-[36px] lg:text-[48px] font-extrabold leading-[1.1] mb-5"
              style={{ color: NAVY, letterSpacing: '-0.02em' }}
            >
              Real underwriting. Real rates. Real accounts that survive scale.
            </h2>
            <p className="text-[17px] leading-relaxed" style={{ color: MUTED }}>
              Every Delt high-risk merchant gets a dedicated underwriter, a custom
              rate card built from your statement, and a structure designed to last.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HIGHLIGHTS.map((h, i) => {
              const Icon = h.icon;
              return (
                <motion.div
                  key={h.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="rounded-2xl p-7"
                  style={{
                    background: '#FFFFFF',
                    border: `1px solid ${HAIRLINE}`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: 'rgba(73,69,255,0.10)',
                      border: '1px solid rgba(73,69,255,0.18)',
                    }}
                  >
                    <Icon size={22} style={{ color: PURPLE }} strokeWidth={1.6} />
                  </div>
                  <div
                    className="text-[20px] font-extrabold mb-2"
                    style={{ color: NAVY, letterSpacing: '-0.01em' }}
                  >
                    {h.title}
                  </div>
                  <div className="text-[15px] leading-relaxed" style={{ color: MUTED }}>
                    {h.body}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 4. VERTICALS ════════════════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="mb-14 max-w-[760px]">
            <div
              className="text-[12px] font-bold uppercase mb-4"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Verticals we approve
            </div>
            <h2
              className="text-[36px] lg:text-[44px] font-extrabold leading-[1.1] mb-5"
              style={{ color: NAVY, letterSpacing: '-0.02em' }}
            >
              Every high-risk vertical that aggregators say no to.
            </h2>
            <p className="text-[16px] leading-relaxed" style={{ color: MUTED }}>
              Not on the list? Ask us anyway — our underwriting team writes accounts
              for verticals most processors won't even quote.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VERTICALS.map((v) => (
              <div
                key={v.name}
                className="rounded-xl p-5 transition-all"
                style={{
                  background: IVORY,
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(73,69,255,0.10)', border: '1px solid rgba(73,69,255,0.18)' }}
                  >
                    <Check size={16} style={{ color: PURPLE }} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-[15px] font-bold leading-tight" style={{ color: NAVY }}>
                      {v.name}
                    </div>
                    <div className="text-[13px] mt-1" style={{ color: MUTED }}>
                      {v.note}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4b. KORONA POS PARTNERSHIP ═══════════════════════════
           Smoke/vape/CBD + liquor + c-stores sit in our high-risk
           processing book AND in KORONA's strongest POS verticals.
           This module pairs the two stories: Delt handles the payments
           that aggregators reject, KORONA handles the high-SKU /
           age-verified retail POS. Frames Delt as the lead brand. */}
      <section className="py-20 lg:py-24" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <KoronaPartnerBlock
            title="For smoke shops, liquor stores, and c-stores: pair Delt's high-risk payments with KORONA POS."
            body={
              "Most aggregators won't touch tobacco, vape, CBD, or liquor. "
              + "Most modern POS systems aren't built for high-SKU, age-verified, "
              + "compliance-heavy retail. We solved both halves: Delt underwrites "
              + "the payment processing other shops were shut off from, and our "
              + "POS partner KORONA brings the inventory depth, age-verification, "
              + "and multi-location tooling these categories actually need."
            }
            bullets={[
              {
                title: 'Age verification & compliance',
                body: "Built-in age prompts, restricted-item rules, and audit trails for tobacco, vape, CBD, and alcohol. Compliance is in the workflow, not a sticky note.",
              },
              {
                title: 'High-SKU inventory mastery',
                body: 'Reorder points, vendor tracking, stock alerts, and deep custom reports for operators carrying thousands of items.',
              },
              {
                title: 'Multi-location & franchise ready',
                body: "From a single neighborhood shop to a multi-state chain. Add locations without rebuilding your stack.",
              },
              {
                title: 'Award-winning 24/7 support',
                body: "In-house team by phone, chat, email, or manual \u2014 recognized across G2, Capterra, and Software Advice.",
              },
            ]}
            testimonial={{
              quote:
                "Don't think you can find a better value for the money out there. The inventory management aspect is great and the customer service is outstanding. If I am out of town, my employees have been able to call the support line, and the KORONA POS staff has been able to help night or day.",
              name: 'Jake H.',
              role: 'Elite Smoke and Vape',
            }}
          />
        </div>
      </section>

      {/* ═══ 5. RATE COMPARE BANNER ══════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: IVORY }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left — pitch */}
            <div className="lg:col-span-7">
              <div
                className="rounded-3xl p-10 h-full flex flex-col justify-center"
                style={{
                  background: `linear-gradient(135deg, ${LAVENDER} 0%, #FFFFFF 100%)`,
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <div
                  className="text-[12px] font-bold uppercase mb-4"
                  style={{ color: PURPLE, letterSpacing: '0.18em' }}
                >
                  Rate compare · Rate match
                </div>
                <h2
                  className="text-[34px] lg:text-[44px] font-extrabold leading-[1.05] mb-5"
                  style={{ color: NAVY, letterSpacing: '-0.02em' }}
                >
                  Send us a statement. Get a real number back.
                </h2>
                <p className="text-[16px] leading-relaxed mb-7" style={{ color: MUTED }}>
                  We don't quote off vibes. Send last month's processing statement
                  and we'll return a line-by-line comparison — interchange, assessments,
                  processor margin, monthly fees, the whole stack — within 24 hours.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/contact-sales"
                    className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-bold transition-all"
                    style={{ background: PURPLE, color: '#FFFFFF' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#3933CC';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = PURPLE;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Send your statement <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right — promise card */}
            <div className="lg:col-span-5">
              <div
                className="rounded-3xl p-8 h-full flex flex-col"
                style={{ background: NAVY }}
              >
                <div
                  className="text-[12px] font-bold uppercase mb-4"
                  style={{ color: '#9C9AFF', letterSpacing: '0.18em' }}
                >
                  Our promise
                </div>
                <div className="space-y-5 flex-1">
                  {[
                    { stat: '1', text: 'We beat your current rate, or' },
                    { stat: '2', text: 'We match your current rate, or' },
                    { stat: '3', text: 'We tell you flat-out we can\'t and why.' },
                  ].map((p) => (
                    <div key={p.stat} className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[16px] font-extrabold"
                        style={{ background: 'rgba(255,255,255,0.10)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.20)' }}
                      >
                        {p.stat}
                      </div>
                      <div className="text-[17px] font-semibold leading-snug" style={{ color: '#FFFFFF' }}>
                        {p.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="text-[13px] mt-7 pt-5"
                  style={{
                    color: 'rgba(255,255,255,0.65)',
                    borderTop: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  No song and dance. No "let me check with my manager."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. CTA ══════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div
            className="rounded-3xl p-10 lg:p-14 text-center"
            style={{
              background: NAVY,
            }}
          >
            <h2
              className="text-[32px] lg:text-[44px] font-extrabold leading-[1.1] mb-4"
              style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
            >
              You build the business. We'll keep the lights on.
            </h2>
            <p
              className="text-[17px] leading-relaxed mb-8 max-w-[640px] mx-auto"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              48–72 hour approvals for most high-risk verticals. Multi-MID structures
              available on day one. Bring your statement and let's get you off the
              aggregator hamster wheel.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/contact-sales"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-bold transition-all"
                style={{ background: '#FFFFFF', color: NAVY }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Talk to underwriting <ArrowRight size={16} />
              </Link>
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-bold transition-all"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.22)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.16)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
                }}
              >
                Apply now <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
