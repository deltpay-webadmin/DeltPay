import { motion } from 'motion/react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Check,
  Zap,
  Store,
  ShoppingBag,
  Layers,
  Clock,
  FileCheck,
  Wallet,
  MapPin,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

/* ─── Design tokens (match Delt brand) ───────────────────────── */
const NAVY     = '#041E42';
const PURPLE   = '#4945FF';
const LAVENDER = '#EDEBFF';
const IVORY    = '#F6F7FB';
const MUTED    = '#475569';
const HAIRLINE = 'rgba(4,30,66,0.10)';
const JAKARTA  = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

/* ─── The stack a merchant gets, boarded through Delt ────────── */
const STACK = [
  {
    icon: Store,
    title: 'Square POS',
    body:
      'Board onto Square — register, terminals, and the whole ecosystem — through Delt as an official reseller. Same Square you know, set up and supported by us.',
  },
  {
    icon: ShoppingBag,
    title: 'Commission-free online ordering',
    body:
      'Every merchant gets a branded ordering page with zero per-order commission. Guests order direct; the ticket drops straight into the POS.',
  },
  {
    icon: Layers,
    title: 'Delivery aggregator',
    body:
      'DoorDash, Uber Eats, Grubhub and more, consolidated onto one screen and injected into your POS. No more tablet wall, no more re-keying orders.',
  },
  {
    icon: Zap,
    title: 'Instant Funding',
    body:
      'Your money the moment the batch closes — not next business day. Powered by our banking partner, turned on for merchants boarded through Delt.',
  },
];

/* ─── Instant funding: the headline breakthrough ─────────────── */
const FUNDING_POINTS = [
  {
    stat: '0-day',
    label: 'settlement',
    body: 'Funds land the moment you batch out — no waiting on next-day ACH.',
  },
  {
    stat: '7-day',
    label: 'access',
    body: 'Weekends and holidays included. The batch closes, the money moves.',
  },
];

/* ─── Simple onboarding — what merchants DON\'T have to give ───── */
const ONBOARDING = [
  {
    icon: FileCheck,
    title: 'A short form',
    body: 'Business details, category, and owner contact. That’s the merchant’s entire lift.',
  },
  {
    icon: Store,
    title: 'Delt boards the account',
    body: 'We complete the Square setup on the back end with the correct reseller link — no data entry, no Square redirect.',
  },
  {
    icon: Wallet,
    title: 'Funded from day one',
    body: 'Instant Funding switches on once the account is live, so cash flow starts the first time they batch.',
  },
];

/* ─── What the merchant never has to hand over ───────────────── */
const NO_HASSLE = [
  'No SSN required to start',
  'No banking information up front',
  'No document uploads',
  'No Square redirect or second login',
  'No commission on your own online orders',
  'No next-day wait for your money',
];

export function SquareResellerPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: JAKARTA, background: '#FFFFFF' }}>

      {/* ═══ 1. HERO ═════════════════════════════════════════════ */}
      <section
        data-hero-section
        className="relative overflow-hidden pt-44 pb-24 lg:pt-48 lg:pb-28"
        style={{ background: NAVY, marginTop: -64 }}
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
              Square + Online Ordering
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
              <Sparkles size={14} style={{ color: '#9C9AFF' }} />
              <span
                className="text-[11px] font-bold uppercase"
                style={{ color: '#FFFFFF', letterSpacing: '0.14em' }}
              >
                New · Now available through Delt
              </span>
            </div>

            <h1
              className="text-[44px] lg:text-[72px] font-extrabold leading-[1.02] mb-6"
              style={{ color: '#FFFFFF', letterSpacing: '-0.025em' }}
            >
              Square + online ordering,
              <br />
              funded the instant you batch.
            </h1>
            <h2
              className="text-[24px] lg:text-[36px] font-bold leading-[1.12] mb-8 max-w-[820px]"
              style={{ color: '#9C9AFF', letterSpacing: '-0.02em' }}
            >
              Delt is now an official Square reseller with Instant Funding.
            </h2>

            <p
              className="text-[18px] lg:text-[20px] leading-relaxed mb-10 max-w-[720px]"
              style={{ color: 'rgba(255,255,255,0.78)' }}
            >
              Board your business onto Square through Delt and get the full stack — POS,
              commission-free online ordering, and every delivery app on one screen — plus
              Instant Funding that puts your money in the bank the moment the batch closes.
              No next-day wait. No SSN or documents to get started.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/get-a-quote"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-bold transition-all"
                style={{ background: '#FFFFFF', color: NAVY }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Get set up on Square <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact-sales"
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
                Talk to our team <ArrowRight size={16} />
              </Link>
            </div>

            {/* Quick proof bar */}
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
              {[
                'Instant Funding',
                'Square POS',
                'Commission-free ordering',
                'US & Canada',
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

      {/* ═══ 2. THE BREAKTHROUGH — INSTANT FUNDING ═══════════════ */}
      <section className="py-20 lg:py-24" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <div
                className="text-[12px] font-bold uppercase mb-4"
                style={{ color: PURPLE, letterSpacing: '0.18em' }}
              >
                The breakthrough
              </div>
              <h2
                className="text-[36px] lg:text-[48px] font-extrabold leading-[1.05] mb-5"
                style={{ color: NAVY, letterSpacing: '-0.02em' }}
              >
                Stop waiting on next-day settlement.
              </h2>
              <p className="text-[17px] leading-relaxed mb-4" style={{ color: MUTED }}>
                Standard card settlement means today’s sales show up tomorrow — sometimes
                the day after, never on weekends. That gap is where payroll gets tight and
                inventory orders get delayed.
              </p>
              <p className="text-[17px] leading-relaxed" style={{ color: MUTED }}>
                Merchants boarded onto Square through Delt get <strong style={{ color: NAVY }}>
                Instant Funding</strong> — your revenue the moment the batch closes, seven days
                a week. It’s the cash-flow upgrade that used to be reserved for the biggest
                accounts, now switched on the day you go live.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div
                className="rounded-3xl p-8 lg:p-10"
                style={{ background: NAVY }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(156,154,255,0.15)', border: '1px solid rgba(156,154,255,0.28)' }}
                  >
                    <Clock size={22} style={{ color: '#9C9AFF' }} strokeWidth={1.7} />
                  </div>
                  <div className="text-[13px] font-bold uppercase" style={{ color: '#9C9AFF', letterSpacing: '0.16em' }}>
                    Money in, the moment you close
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {FUNDING_POINTS.map((f) => (
                    <div key={f.label}>
                      <div className="text-[34px] lg:text-[40px] font-extrabold leading-none mb-1" style={{ color: '#FFFFFF' }}>
                        {f.stat}
                      </div>
                      <div
                        className="text-[12px] font-bold uppercase mb-3"
                        style={{ color: '#9C9AFF', letterSpacing: '0.14em' }}
                      >
                        {f.label}
                      </div>
                      <div className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
                        {f.body}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="text-[13px] mt-8 pt-6"
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    borderTop: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  Instant Funding is powered by our banking partner and subject to
                  underwriting approval.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. THE FULL STACK ═══════════════════════════════════ */}
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
              One stack, boarded through Delt
            </div>
            <h2
              className="text-[36px] lg:text-[48px] font-extrabold leading-[1.1] mb-5"
              style={{ color: NAVY, letterSpacing: '-0.02em' }}
            >
              Everything a modern storefront runs on — from one partner.
            </h2>
            <p className="text-[17px] leading-relaxed" style={{ color: MUTED }}>
              You bring the business; Delt handles the setup, the support, and the payouts.
              No stitching together three vendors and four logins.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STACK.map((h, i) => {
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

          <div
            className="mt-6 rounded-2xl px-7 py-5 flex items-start gap-3"
            style={{ background: LAVENDER, border: `1px solid ${HAIRLINE}` }}
          >
            <Check size={18} style={{ color: PURPLE }} strokeWidth={2.5} className="mt-0.5 flex-shrink-0" />
            <div className="text-[14px] leading-relaxed" style={{ color: NAVY }}>
              <strong>Prefer Clover?</strong> The same reseller stack — online ordering,
              delivery aggregation, and Instant Funding — is available on Clover POS too.
              Tell us which register your business runs on.
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. ONBOARDING ═══════════════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="mb-14 max-w-[760px]">
            <div
              className="text-[12px] font-bold uppercase mb-4"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              How you get set up
            </div>
            <h2
              className="text-[36px] lg:text-[44px] font-extrabold leading-[1.1] mb-5"
              style={{ color: NAVY, letterSpacing: '-0.02em' }}
            >
              Live in a form, not a paperwork marathon.
            </h2>
            <p className="text-[16px] leading-relaxed" style={{ color: MUTED }}>
              Because Delt boards the account as an official reseller, the merchant’s side
              of onboarding is a short intake — not a stack of documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {ONBOARDING.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-2xl p-7 relative"
                  style={{ background: IVORY, border: `1px solid ${HAIRLINE}` }}
                >
                  <div
                    className="absolute top-6 right-6 text-[13px] font-extrabold"
                    style={{ color: 'rgba(4,30,66,0.18)' }}
                  >
                    0{i + 1}
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: 'rgba(73,69,255,0.10)',
                      border: '1px solid rgba(73,69,255,0.18)',
                    }}
                  >
                    <Icon size={22} style={{ color: PURPLE }} strokeWidth={1.6} />
                  </div>
                  <div className="text-[19px] font-extrabold mb-2" style={{ color: NAVY }}>
                    {s.title}
                  </div>
                  <div className="text-[15px] leading-relaxed" style={{ color: MUTED }}>
                    {s.body}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="rounded-2xl p-8"
            style={{ background: IVORY, border: `1px solid ${HAIRLINE}` }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {NO_HASSLE.map((p) => (
                <div key={p} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(73,69,255,0.10)', border: '1px solid rgba(73,69,255,0.20)' }}
                  >
                    <Check size={14} style={{ color: PURPLE }} strokeWidth={2.5} />
                  </div>
                  <div className="text-[15px] font-semibold leading-snug" style={{ color: NAVY }}>
                    {p}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. AVAILABILITY STRIP ═══════════════════════════════ */}
      <section className="py-14" style={{ background: IVORY }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div
            className="rounded-2xl px-8 py-7 flex flex-col sm:flex-row sm:items-center gap-5"
            style={{ background: '#FFFFFF', border: `1px solid ${HAIRLINE}` }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(73,69,255,0.10)', border: '1px solid rgba(73,69,255,0.18)' }}
            >
              <MapPin size={22} style={{ color: PURPLE }} strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <div className="text-[18px] font-extrabold mb-1" style={{ color: NAVY }}>
                Available across the US and Canada
              </div>
              <div className="text-[15px] leading-relaxed" style={{ color: MUTED }}>
                Restaurants, retail, salons, and service businesses on both sides of the
                border can board onto Square through Delt with Instant Funding.
              </div>
            </div>
            <Link
              to="/get-a-quote"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[14px] font-bold transition-all flex-shrink-0"
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
              Check availability <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 6. CTA ══════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div
            className="rounded-3xl p-10 lg:p-14 text-center"
            style={{ background: NAVY }}
          >
            <h2
              className="text-[32px] lg:text-[44px] font-extrabold leading-[1.1] mb-4"
              style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
            >
              Run on Square. Get paid the instant you close.
            </h2>
            <p
              className="text-[17px] leading-relaxed mb-8 max-w-[640px] mx-auto"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              Board onto Square through Delt and turn on Instant Funding, commission-free
              online ordering, and every delivery app on one screen. One partner, one setup,
              money that moves the moment you do.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/get-a-quote"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-bold transition-all"
                style={{ background: '#FFFFFF', color: NAVY }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Get set up on Square <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact-sales"
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
                Talk to our team <ArrowRight size={16} />
              </Link>
            </div>
            <p className="text-[12.5px] mt-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Delt is an official Square reseller. Square and Clover are trademarks of their
              respective owners. Instant Funding and same-day access are subject to
              underwriting approval and not available to all merchants.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SquareResellerPage;
