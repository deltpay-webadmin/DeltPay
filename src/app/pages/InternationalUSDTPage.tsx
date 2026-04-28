import { motion } from 'motion/react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Check,
  Globe2,
  Zap,
  ShieldCheck,
  Banknote,
  Clock,
  Building2,
  ChevronRight,
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

/* ─── Feature highlights ─────────────────────────────────────── */
const HIGHLIGHTS = [
  {
    icon: Zap,
    title: 'Money in your account the same day',
    body: 'Your overseas buyer pays in USDT. The money lands in your US or EU bank account the same business day — no waiting a week.',
  },
  {
    icon: Globe2,
    title: 'Built for big invoices',
    body: 'Move six- and seven-figure invoices across borders without SWIFT delays, held funds, or surprise fees.',
  },
  {
    icon: ShieldCheck,
    title: 'Fully legal and screened',
    body: 'Every payment goes through real-time anti-money-laundering checks. Shield is a US-registered and licensed payment operator.',
  },
  {
    icon: Banknote,
    title: 'USD and EUR payouts',
    body: 'Your buyer sends USDT. You receive dollars or euros in your bank — or the other way around if you prefer.',
  },
];

/* ─── How it works steps ─────────────────────────────────────── */
const STEPS = [
  {
    n: '01',
    title: 'Send your buyer an invoice link',
    body: 'Share a Delt payment link or your account address with your international wholesale customer. Works like any other invoice.',
  },
  {
    n: '02',
    title: 'They pay in USDT',
    body: 'Your buyer sends USDT (a dollar-pegged digital currency) from anywhere in the world. No wire delays on their end.',
  },
  {
    n: '03',
    title: 'You get a same-day bank wire',
    body: 'Shield converts the USDT to dollars and wires it to your US or European bank account the same day. You never touch crypto.',
  },
];

/* ─── Verticals that use this ────────────────────────────────── */
const VERTICALS = [
  'Apparel & textiles',
  'Auto parts & equipment',
  'Consumer electronics',
  'Food & beverage importers',
  'Industrial supply',
  'Medical & dental wholesale',
  'Building materials',
  'Jewelry & precious metals',
];

export function InternationalUSDTPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: JAKARTA, background: '#FFFFFF' }}>

      {/* ═══ 1. HERO ═════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden pt-28 pb-24 lg:pt-32 lg:pb-28"
        style={{
          background: `linear-gradient(180deg, ${LAVENDER} 0%, #FFFFFF 100%)`,
        }}
      >
        {/* Soft ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(73,69,255,0.18), transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: -160,
            left: -100,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(73,69,255,0.10), transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

        <div className="relative max-w-[1240px] mx-auto px-6 lg:px-12">
          {/* Breadcrumb */}
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
              Solutions
            </Link>
            <ChevronRight size={12} color={MICRO} />
            <span
              className="text-[12px] font-semibold uppercase"
              style={{ color: NAVY, letterSpacing: '0.14em' }}
            >
              International USDT Payments
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left — copy */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                  style={{
                    background: 'rgba(73,69,255,0.08)',
                    border: '1px solid rgba(73,69,255,0.18)',
                  }}
                >
                  <span
                    className="text-[11px] font-bold uppercase"
                    style={{ color: PURPLE, letterSpacing: '0.14em' }}
                  >
                    Powered by Shield
                  </span>
                </div>

                <h1
                  className="text-[44px] lg:text-[64px] font-extrabold leading-[1.05] mb-6"
                  style={{ color: NAVY, letterSpacing: '-0.025em' }}
                >
                  Same-day USDT
                  <br />
                  <span style={{ color: PURPLE }}>cross-border payments</span>
                  <br />
                  for wholesalers.
                </h1>

                <p
                  className="text-[18px] lg:text-[20px] leading-relaxed mb-8 max-w-[640px]"
                  style={{ color: MUTED }}
                >
                  Your overseas buyer pays you in USDT. The money lands in your US or European bank account the same day — in dollars.
                  No SWIFT delays. No held funds. No surprise fees.
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
                    Talk to a specialist <ArrowRight size={16} />
                  </Link>
                  <a
                    href="https://www.getshield.xyz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-bold transition-all"
                    style={{
                      background: '#FFFFFF',
                      color: NAVY,
                      border: `1px solid ${HAIRLINE}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = IVORY;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                  >
                    Visit Shield <ArrowRight size={16} />
                  </a>
                </div>

                {/* Quick proof bar */}
                <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                  {[
                    { icon: Clock, label: 'Same-day bank deposit' },
                    { icon: ShieldCheck, label: 'AML screened' },
                    { icon: Banknote, label: 'USD & EUR payouts' },
                  ].map((p) => {
                    const Icon = p.icon;
                    return (
                      <div key={p.label} className="flex items-center gap-2">
                        <Icon size={16} style={{ color: PURPLE }} />
                        <span className="text-[13px] font-semibold" style={{ color: NAVY }}>
                          {p.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Right — flow card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative rounded-3xl p-8 shadow-xl"
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <div
                  className="text-[11px] font-bold uppercase mb-5"
                  style={{ color: PURPLE, letterSpacing: '0.18em' }}
                >
                  How a payment flows
                </div>

                {/* Buyer */}
                <div
                  className="rounded-xl p-4 mb-3"
                  style={{ background: IVORY, border: `1px solid ${HAIRLINE}` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[12px] font-semibold uppercase" style={{ color: MICRO, letterSpacing: '0.12em' }}>
                      Buyer in Singapore
                    </div>
                    <Globe2 size={16} style={{ color: PURPLE }} />
                  </div>
                  <div className="text-[20px] font-extrabold" style={{ color: NAVY }}>
                    250,000 USDT
                  </div>
                  <div className="text-[12px]" style={{ color: MUTED }}>
                    Pays your invoice in USDT (dollar-pegged digital currency)
                  </div>
                </div>

                <div className="flex justify-center my-2">
                  <ArrowRight size={18} style={{ color: PURPLE, transform: 'rotate(90deg)' }} />
                </div>

                {/* Shield */}
                <div
                  className="rounded-xl p-4 mb-3"
                  style={{
                    background: 'rgba(73,69,255,0.08)',
                    border: `1px solid rgba(73,69,255,0.20)`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[12px] font-semibold uppercase" style={{ color: PURPLE, letterSpacing: '0.12em' }}>
                      Shield handles it
                    </div>
                    <ShieldCheck size={16} style={{ color: PURPLE }} />
                  </div>
                  <div className="text-[14px] font-semibold" style={{ color: NAVY }}>
                    Fraud check → convert USDT to dollars → wire to your bank
                  </div>
                  <div className="text-[12px]" style={{ color: MUTED }}>
                    Happens automatically, every time
                  </div>
                </div>

                <div className="flex justify-center my-2">
                  <ArrowRight size={18} style={{ color: PURPLE, transform: 'rotate(90deg)' }} />
                </div>

                {/* You */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: NAVY }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[12px] font-semibold uppercase" style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em' }}>
                      Your US bank
                    </div>
                    <Building2 size={16} style={{ color: '#FFFFFF' }} />
                  </div>
                  <div className="text-[20px] font-extrabold" style={{ color: '#FFFFFF' }}>
                    $249,500 USD
                  </div>
                  <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Same-day wire · 1% all-in
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2. HIGHLIGHTS ═══════════════════════════════════════ */}
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
              What you get
            </div>
            <h2
              className="text-[36px] lg:text-[48px] font-extrabold leading-[1.1] mb-5"
              style={{ color: NAVY, letterSpacing: '-0.02em' }}
            >
              Getting paid overseas should feel like getting paid down the street.
            </h2>
            <p className="text-[17px] leading-relaxed" style={{ color: MUTED }}>
              Delt partners with <a href="https://www.getshield.xyz/" target="_blank" rel="noopener noreferrer" style={{ color: PURPLE, fontWeight: 600 }}>Shield</a> — a licensed payment platform for international business — so you
              can accept USDT from buyers anywhere in the world and have the money in your bank the same day.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

      {/* ═══ 3. HOW IT WORKS ═════════════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: IVORY }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="mb-14 max-w-[760px]">
            <div
              className="text-[12px] font-bold uppercase mb-4"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              How it works
            </div>
            <h2
              className="text-[36px] lg:text-[44px] font-extrabold leading-[1.1]"
              style={{ color: NAVY, letterSpacing: '-0.02em' }}
            >
              Three steps from invoice to bank account.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl p-7"
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <div
                  className="text-[14px] font-extrabold mb-4 inline-block px-3 py-1 rounded-full"
                  style={{
                    color: PURPLE,
                    background: 'rgba(73,69,255,0.10)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {s.n}
                </div>
                <div
                  className="text-[20px] font-extrabold mb-2"
                  style={{ color: NAVY, letterSpacing: '-0.01em' }}
                >
                  {s.title}
                </div>
                <div className="text-[15px] leading-relaxed" style={{ color: MUTED }}>
                  {s.body}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. WHO USES IT ══════════════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <div
                className="text-[12px] font-bold uppercase mb-4"
                style={{ color: PURPLE, letterSpacing: '0.18em' }}
              >
                Who uses this
              </div>
              <h2
                className="text-[34px] lg:text-[40px] font-extrabold leading-[1.1] mb-5"
                style={{ color: NAVY, letterSpacing: '-0.02em' }}
              >
                Built for wholesalers and US exporters who need to get paid faster.
              </h2>
              <p className="text-[16px] leading-relaxed" style={{ color: MUTED }}>
                If your buyers want to pay in USDT and you're tired of waiting three days for a bank wire to clear, this is the solution.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div
                className="rounded-2xl p-8"
                style={{ background: IVORY, border: `1px solid ${HAIRLINE}` }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VERTICALS.map((v) => (
                    <div key={v} className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: PURPLE }}
                      >
                        <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                      </div>
                      <div className="text-[15px] font-semibold" style={{ color: NAVY }}>
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. SHIELD PARTNERSHIP ═══════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: NAVY }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div
                className="text-[12px] font-bold uppercase mb-4"
                style={{ color: '#9C9AFF', letterSpacing: '0.18em' }}
              >
                Partnership
              </div>
              <h2
                className="text-[34px] lg:text-[42px] font-extrabold leading-[1.1] mb-5"
                style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
              >
                Delt + Shield: accept USDT payments, get paid in dollars.
              </h2>
              <p
                className="text-[17px] leading-relaxed mb-6"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                Shield is a US-registered and internationally licensed payment operator built specifically for businesses doing cross-border deals. Through our partnership, qualifying Delt customers get direct access to Shield's same-day USDT-to-dollars service — set up by your Delt account team, no crypto knowledge needed.
              </p>
              <a
                href="https://www.getshield.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-bold transition-all"
                style={{ background: '#FFFFFF', color: NAVY }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Learn more about Shield <ArrowRight size={16} />
              </a>
            </div>

            <div className="lg:col-span-5">
              <div
                className="rounded-2xl p-8"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { stat: 'Same-day', label: 'bank wires' },
                    { stat: 'From 1%', label: 'all-in fee' },
                    { stat: '$0', label: 'monthly fees' },
                    { stat: 'US + EU', label: 'payout rails' },
                  ].map((s) => (
                    <div key={s.label}>
                      <div
                        className="text-[28px] font-extrabold leading-none mb-1"
                        style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
                      >
                        {s.stat}
                      </div>
                      <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
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
              background: `linear-gradient(135deg, ${LAVENDER} 0%, #FFFFFF 100%)`,
              border: `1px solid ${HAIRLINE}`,
            }}
          >
            <h2
              className="text-[32px] lg:text-[44px] font-extrabold leading-[1.1] mb-4"
              style={{ color: NAVY, letterSpacing: '-0.02em' }}
            >
              Ready to get paid by overseas customers today instead of next week?
            </h2>
            <p
              className="text-[17px] leading-relaxed mb-8 max-w-[640px] mx-auto"
              style={{ color: MUTED }}
            >
              Tell us about your sales volume and which countries you sell to — we'll get you set up with Shield inside your Delt account.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
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
                Talk to a specialist <ArrowRight size={16} />
              </Link>
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-bold transition-all"
                style={{
                  background: '#FFFFFF',
                  color: NAVY,
                  border: `1px solid ${HAIRLINE}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = IVORY;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
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
