import { motion } from 'motion/react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Bell,
  Bot,
  Truck,
  RefreshCw,
  Trophy,
  TrendingDown,
  ChevronRight,
  Sparkles,
  Clock,
  Zap,
} from 'lucide-react';

/* ─── Design tokens (match Delt brand) ───────────────────────── */
const NAVY     = '#041E42';
const PURPLE   = '#4945FF';
const LAVENDER = '#EDEBFF';
const IVORY    = '#F6F7FB';
const MUTED    = '#475569';
const HAIRLINE = 'rgba(4,30,66,0.10)';
const JAKARTA  = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

/* ─── Headline stats (from Disputifier averages) ─────────────── */
const STATS = [
  { value: 'up to 95%', label: 'Reduction in incoming chargebacks' },
  { value: '230%',      label: 'Average increase in win rate' },
  { value: '0 min',     label: 'Time you spend managing them' },
  { value: '5x',        label: 'ROI guarantee on recovery' },
];

/* ─── Pain points ────────────────────────────────────────────── */
const PAINS = [
  'Chargeback ratio creeping toward the 1% Visa threshold',
  'Burning hours every week building representment packets',
  'Friendly fraud and "item not received" claims you can\'t prove',
  'Losing legitimate disputes to processor templates',
  'Paying flat monthly fees whether you win or lose',
  'No idea which alerts (RDR, Ethoca, Order Insight) you should be on',
];

/* ─── Four pillars ───────────────────────────────────────────── */
const PILLARS = [
  {
    icon: Bell,
    title: 'Block chargebacks with alerts',
    body: 'Plugged into every major alert program — RDR, Ethoca, Order Insight — so incoming disputes are auto-refunded before they hit your ratio.',
  },
  {
    icon: Trophy,
    title: 'Win disputes on autopilot',
    body: 'Representment built from optimized response templates and split-tested evidence. You keep the revenue you earned without lifting a finger.',
  },
  {
    icon: Bot,
    title: 'Prevent fraud with AI',
    body: 'AI screens every order, verifies risky transactions, and cancels confirmed fraud automatically — before it ever ships.',
  },
  {
    icon: Truck,
    title: 'Stop "order not received" claims',
    body: 'Proactive delivery alerts and customer notifications for late, lost, or undelivered packages — the #1 driver of friendly-fraud disputes.',
  },
];

/* ─── How it works steps ─────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    title: 'Connect your store',
    body: 'Self-enroll your MIDs in the portal. Works on every payment processor — Shopify, Stripe, Braintree, Adyen, you name it.',
  },
  {
    num: '02',
    title: 'Alerts go live in 24 hours',
    body: 'RDR, Ethoca, and Order Insight start blocking incoming disputes. Duplicate alerts, overlaps, and "can\'t finds" are auto-credited.',
  },
  {
    num: '03',
    title: 'Disputes get fought automatically',
    body: 'Every chargeback you do receive is answered with optimized evidence packets. AI handles refunds, cancellations, and fraud screening 24/7.',
  },
  {
    num: '04',
    title: 'You only pay when it works',
    body: 'No setup fees. No monthly minimums. No subscriptions. Success-based pricing — we make money when you save money.',
  },
];

/* ─── What makes this different ──────────────────────────────── */
const DIFFERENTIATORS = [
  { icon: Zap,         title: 'Fully automated',    body: 'Refunds, cancellations, representment, fraud review — all hands-off.' },
  { icon: ShieldCheck, title: 'Every processor',    body: 'Stripe, Braintree, Adyen, Authorize.net, Shopify Payments, and more.' },
  { icon: Clock,       title: '30-second support',  body: 'Average response time, available any hour your team needs help.' },
  { icon: TrendingDown,title: '20–50% cheaper',     body: 'Versus other chargeback platforms — with a better win rate.' },
  { icon: RefreshCw,   title: 'No contracts',       body: 'No monthly fees, no setup fees, no minimums. Cancel anytime.' },
  { icon: Sparkles,    title: '11,000+ merchants',  body: 'Trusted by growing e-commerce brands across every vertical.' },
];

export function ChargebackManagementPage() {
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
              Chargeback Management
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
              <ShieldCheck size={14} style={{ color: '#9C9AFF' }} />
              <span
                className="text-[11px] font-bold uppercase"
                style={{ color: '#FFFFFF', letterSpacing: '0.14em' }}
              >
                Powered by Disputifier · 10× ROI guaranteed
              </span>
            </div>

            <h1
              className="text-[44px] lg:text-[72px] font-extrabold leading-[1.02] mb-6"
              style={{ color: '#FFFFFF', letterSpacing: '-0.025em' }}
            >
              Stop losing money
              <br />
              to chargebacks.
            </h1>
            <h2
              className="text-[28px] lg:text-[40px] font-bold leading-[1.1] mb-8 max-w-[760px]"
              style={{ color: '#9C9AFF', letterSpacing: '-0.02em' }}
            >
              Slash chargebacks up to 95%. Win more disputes. Zero hands-on time.
            </h2>

            <p
              className="text-[18px] lg:text-[20px] leading-relaxed mb-10 max-w-[680px]"
              style={{ color: 'rgba(255,255,255,0.78)' }}
            >
              Delt's chargeback management — powered by Disputifier — is the #1 automated
              chargeback platform. We block incoming disputes with alerts, fight the rest
              with AI-optimized representment, and screen fraud before it ships. You only
              pay when we save or win you money.
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
                Get protected <ArrowRight size={16} />
              </Link>
              <a
                href="https://www.disputifier.com/"
                target="_blank"
                rel="noopener noreferrer"
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
                Learn about our partner <ArrowRight size={16} />
              </a>
            </div>

            {/* Quick proof bar */}
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
              {[
                'Success-based pricing',
                'Every payment processor',
                '11,000+ merchants',
                'No contracts',
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

      {/* ═══ 2. STATS BAND ═══════════════════════════════════════ */}
      <section className="py-16 lg:py-20" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div
            className="text-[12px] font-bold uppercase mb-8 text-center"
            style={{ color: PURPLE, letterSpacing: '0.18em' }}
          >
            Average results across 11,000+ merchants
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-7 text-center"
                style={{
                  background: IVORY,
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <div
                  className="text-[36px] lg:text-[44px] font-extrabold mb-2"
                  style={{ color: NAVY, letterSpacing: '-0.02em' }}
                >
                  {s.value}
                </div>
                <div className="text-[14px] leading-snug" style={{ color: MUTED }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. WE SEE YOU ═══════════════════════════════════════ */}
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
                Chargebacks are quietly killing your margin.
              </h2>
              <p className="text-[17px] leading-relaxed" style={{ color: MUTED }}>
                Friendly fraud, "item not received," and processor template losses
                add up fast — and worse, they push your ratio toward thresholds
                that get MIDs frozen. We close every one of those holes.
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

      {/* ═══ 4. FOUR PILLARS ═════════════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: '#FFFFFF' }}>
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
              How we protect your revenue
            </div>
            <h2
              className="text-[36px] lg:text-[48px] font-extrabold leading-[1.1] mb-5"
              style={{ color: NAVY, letterSpacing: '-0.02em' }}
            >
              Four layers of defense. One platform.
            </h2>
            <p className="text-[17px] leading-relaxed" style={{ color: MUTED }}>
              Block before they hit. Win the ones that do. Catch fraud before it
              ships. Keep the post-purchase experience clean. Fully automated.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PILLARS.map((h, i) => {
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
                    background: IVORY,
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

      {/* ═══ 5. HOW IT WORKS ═════════════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="mb-14 max-w-[760px]">
            <div
              className="text-[12px] font-bold uppercase mb-4"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              How it works
            </div>
            <h2
              className="text-[36px] lg:text-[44px] font-extrabold leading-[1.1] mb-5"
              style={{ color: NAVY, letterSpacing: '-0.02em' }}
            >
              Live in 24 hours. Hands-off forever.
            </h2>
            <p className="text-[16px] leading-relaxed" style={{ color: MUTED }}>
              Switching is easy and instant. No spreadsheets, no manual MID setup,
              no engineering work — self-enroll in the portal and we handle the rest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <div
                key={s.num}
                className="rounded-2xl p-7"
                style={{
                  background: IVORY,
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <div
                  className="text-[14px] font-bold mb-4"
                  style={{ color: PURPLE, letterSpacing: '0.08em' }}
                >
                  {s.num}
                </div>
                <div
                  className="text-[18px] font-extrabold mb-2 leading-tight"
                  style={{ color: NAVY, letterSpacing: '-0.01em' }}
                >
                  {s.title}
                </div>
                <div className="text-[14px] leading-relaxed" style={{ color: MUTED }}>
                  {s.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. DIFFERENTIATORS ══════════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="mb-14 max-w-[760px]">
            <div
              className="text-[12px] font-bold uppercase mb-4"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Why merchants switch to Delt
            </div>
            <h2
              className="text-[36px] lg:text-[44px] font-extrabold leading-[1.1] mb-5"
              style={{ color: NAVY, letterSpacing: '-0.02em' }}
            >
              The smartest, merchant-friendly chargeback platform.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DIFFERENTIATORS.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.title}
                  className="rounded-2xl p-6"
                  style={{
                    background: IVORY,
                    border: `1px solid ${HAIRLINE}`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'rgba(73,69,255,0.10)',
                        border: '1px solid rgba(73,69,255,0.18)',
                      }}
                    >
                      <Icon size={20} style={{ color: PURPLE }} strokeWidth={1.6} />
                    </div>
                    <div>
                      <div
                        className="text-[17px] font-extrabold mb-1 leading-tight"
                        style={{ color: NAVY }}
                      >
                        {d.title}
                      </div>
                      <div className="text-[14px] leading-relaxed" style={{ color: MUTED }}>
                        {d.body}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 7. PRICING PROMISE ══════════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: '#FFFFFF' }}>
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
                  Success-based pricing
                </div>
                <h2
                  className="text-[34px] lg:text-[44px] font-extrabold leading-[1.05] mb-5"
                  style={{ color: NAVY, letterSpacing: '-0.02em' }}
                >
                  You only pay when we save you money.
                </h2>
                <p className="text-[16px] leading-relaxed mb-7" style={{ color: MUTED }}>
                  No setup fees. No subscription. No monthly minimums. Pick the
                  services you want — alerts, representment, fraud, delivery —
                  and pay only when we stop or win a chargeback for you.
                  Pricing typically saves 20–50% vs. other platforms.
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
                    See the savings <ArrowRight size={16} />
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
                  Our guarantee
                </div>
                <div className="space-y-5 flex-1">
                  {[
                    { stat: '10×', text: 'ROI guaranteed across the platform.' },
                    { stat: '5×',  text: 'ROI guarantee on chargeback recovery.' },
                    { stat: '30s', text: 'Average support response, any hour.' },
                  ].map((p) => (
                    <div key={p.stat} className="flex items-start gap-4">
                      <div
                        className="px-3 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[14px] font-extrabold"
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
                  Powered by Disputifier — trusted by 11,000+ growing merchants.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 8. CTA ══════════════════════════════════════════════ */}
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
              Stop fighting chargebacks. Start winning them.
            </h2>
            <p
              className="text-[17px] leading-relaxed mb-8 max-w-[640px] mx-auto"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              Most merchants are live in under 24 hours and see their dispute ratio
              drop within the first billing cycle. Talk to us about turning your
              chargebacks into a non-issue.
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
                Talk to sales <ArrowRight size={16} />
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
