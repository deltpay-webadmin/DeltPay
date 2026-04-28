import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Check,
  Repeat,
  FileText,
  Shield,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Quote,
  Download,
  BookOpen,
} from 'lucide-react';
import { ScrollExpandingHero } from '../components/ScrollExpandingHero';
import { FreeAccountSection } from '../components/FreeAccountSection';
import { ProductCrossSell } from '../components/ProductCrossSell';
import { BusinessScene } from '../components/BusinessScene';

/* ─── Design tokens ─────────────────────────────────────────── */
const NAVY     = '#041E42';
const PURPLE   = '#4945FF';
const LAVENDER = '#EDEBFF';
const IVORY    = '#F6F7FB';
const MUTED    = '#475569';
const MICRO    = '#94A3B8';
const HAIRLINE = 'rgba(4,30,66,0.10)';
const JAKARTA  = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

/* ─── Testimonials ──────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote:
      "We moved to Delt for the rates, but what sold us was how quickly the team set up recurring ACH for our subscriptions. Saved us a full accounting hire.",
    name: 'Daniel Ortiz',
    role: 'CFO, Arcata Bookkeeping',
    location: 'Oakland, CA',
    business: 'Arcata Bookkeeping',
    initials: 'DO',
    theme: 'office' as const,
    metric: 'Saved 1 hire',
    accent: PURPLE,
  },
  {
    quote:
      "Flat-rate billing means no statement decoding at month end. I know exactly what I owe. Zero surprises in 18 months of running the register.",
    name: 'Maya Kapur',
    role: 'Owner, Kapur & Co.',
    location: 'Austin, TX',
    business: 'Kapur & Co.',
    initials: 'MK',
    theme: 'retail' as const,
    metric: 'Zero surprises',
    accent: NAVY,
  },
  {
    quote:
      "Cash-discount compliance used to be a nightmare. Delt handles the signage, the receipts, everything. Our effective processing cost is actually $0.",
    name: 'Jacob Reyes',
    role: 'GM, Reyes Auto Service',
    location: 'Phoenix, AZ',
    business: 'Reyes Auto Service',
    initials: 'JR',
    theme: 'auto' as const,
    metric: 'Effective 0%',
    accent: PURPLE,
  },
];

export function PaymentsPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const t = TESTIMONIALS[activeTestimonial];

  return (
    <div className="min-h-screen" style={{ fontFamily: JAKARTA, background: '#FFFFFF' }}>

      {/* ═══ 1. KEEP: Scroll expanding hero (brand-locked) ═════════ */}
      <ScrollExpandingHero />

      {/* ═══ 2. BREADCRUMB BAND (Toast-style) ══════════════════════ */}
      <section className="px-6 pt-20 pb-6" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: PURPLE }} />
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
              Payments
            </span>
          </div>
        </div>
      </section>

      {/* ═══ 3. THREE WAYS TO KEEP MORE OF EVERY SALE (white) ══════ */}
      <section className="py-16 lg:py-20" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-14 max-w-[780px]"
          >
            <div
              className="text-[12px] font-bold uppercase mb-4"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Pricing programs
            </div>
            <h2
              className="font-bold leading-[1.05] mb-5"
              style={{
                fontSize: 'clamp(32px, 4.4vw, 52px)',
                letterSpacing: '-0.025em',
                color: NAVY,
              }}
            >
              Three ways to pay less on every sale.
            </h2>
            <p className="text-[17px] leading-relaxed max-w-[620px]" style={{ color: MUTED }}>
              Pick the pricing that fits your business — or mix and match across locations.
              Rates are clear, and there's no long-term contract.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                tag: 'You pay $0',
                label: 'Cash Discount',
                headline: '0% processing cost',
                body: 'Show a cash price and a card price at checkout. Customers who pay by card cover the processing fee. Your cost is $0. Delt prints compliant signage and receipt disclosures automatically.',
                detail: 'Compliant in all 50 states',
                bullets: ['Automatic receipt disclosure', 'Compliant signage handled for you', 'Turn on or off per location'],
              },
              {
                tag: 'Most popular',
                label: 'Flat Rate',
                headline: '2.6% + $0.10 — one rate, every card',
                body: 'One flat processing rate no matter which card your customer swipes, taps, or dips. No surprises at month end — you always know your cost.',
                detail: 'No per-card-type surprises',
                bullets: ['Same rate for every card type', 'Easy to budget and plan around', 'No decoding your monthly statement'],
              },
              {
                tag: 'Transparent',
                label: 'Interchange Plus',
                headline: 'The card network\'s cost + a small Delt margin',
                body: 'You pay the card network\'s base cost plus a fixed Delt margin — nothing more. Full line-item statements so you know exactly where every dollar goes. Best for higher-volume businesses.',
                detail: 'Available on Growth & Custom',
                bullets: ['Line-item monthly statements', 'Competitive for high card sales', 'Monthly rate review'],
              },
            ].map((model, i) => (
              <motion.div
                key={model.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="rounded-2xl p-7 flex flex-col transition-colors"
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: NAVY }}
                  >
                    {model.label}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md"
                    style={{
                      color: PURPLE,
                      background: `${PURPLE}10`,
                      letterSpacing: '0.14em',
                    }}
                  >
                    {model.tag}
                  </span>
                </div>

                <div
                  className="font-bold mb-3 leading-tight"
                  style={{
                    fontSize: 24,
                    color: NAVY,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {model.headline}
                </div>
                <p
                  className="leading-relaxed mb-6"
                  style={{ color: MUTED, fontSize: 14.5 }}
                >
                  {model.body}
                </p>

                <ul className="space-y-2.5 mb-7">
                  {model.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <Check size={14} color={PURPLE} strokeWidth={3} className="flex-shrink-0 mt-0.5" />
                      <span style={{ color: NAVY, fontSize: 13.5 }}>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-5" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
                  <span
                    className="text-[11.5px] font-semibold uppercase"
                    style={{ color: MICRO, letterSpacing: '0.14em' }}
                  >
                    {model.detail}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. ACH — lavender full-bleed data band ════════════════ */}
      <section className="py-20 lg:py-28" style={{ background: LAVENDER }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-10">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              ACH · bank-to-bank transfer
            </div>
            <h2
              className="font-bold leading-[1.1] mb-4"
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              Send a $50,000 invoice. Pay 1% — not 2.6%.
            </h2>
            <p
              className="mx-auto leading-relaxed"
              style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', color: MUTED, maxWidth: 620 }}
            >
              ACH moves money directly from your customer's bank account to yours — no card network in the middle. Flat 1%, up to $100K per transfer. Great for big invoices, retainers, and recurring charges.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-stretch">
            {/* LEFT — 1% moment card (now on lavender band, inverted contrast) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl p-10 lg:p-14 flex flex-col justify-between"
              style={{
                background: '#FFFFFF',
                border: `1px solid ${HAIRLINE}`,
                boxShadow: '0 20px 50px rgba(4,30,66,0.06)',
                minHeight: 520,
              }}
            >
              <div>
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-8"
                  style={{ background: `${PURPLE}10`, border: `1px solid ${PURPLE}25` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: PURPLE }} />
                  <span
                    className="text-[11px] font-bold uppercase"
                    style={{ color: PURPLE, letterSpacing: '0.16em' }}
                  >
                    ACH / Bank transfer
                  </span>
                </div>
                <div
                  className="font-black leading-[0.88] mb-4"
                  style={{
                    fontSize: 'clamp(120px, 16vw, 200px)',
                    letterSpacing: '-0.04em',
                    color: NAVY,
                  }}
                >
                  1%
                </div>
                <div
                  className="font-semibold mb-3"
                  style={{ color: NAVY, fontSize: 22 }}
                >
                  per bank transfer
                </div>
                <p
                  className="leading-relaxed max-w-[420px]"
                  style={{ color: MUTED, fontSize: 16 }}
                >
                  Flat 1% — no card network markup. No surprises. Works for one-time and recurring payments up to $100K per transfer.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3">
                {[
                  'No card network markup',
                  'Recurring and one-time payments',
                  'Up to $100K per transfer',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: PURPLE }}
                    >
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </div>
                    <span className="font-medium" style={{ color: NAVY, fontSize: 14.5 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT — ACH feature cards 2x2 */}
            <div className="grid sm:grid-cols-2 gap-5 content-start">
              {[
                {
                  icon: TrendingDown,
                  title: 'Skip the card network fees',
                  body: 'ACH goes bank to bank — no Visa or Mastercard in the middle. You pay only the flat 1%.',
                  detail: 'Save 1.5–2.5% vs card processing',
                },
                {
                  icon: Repeat,
                  title: 'Set up recurring billing in minutes',
                  body: 'Auto-charge retainers, memberships, and installments. Customers authorize once — you never have to chase them again.',
                  detail: 'Variable and fixed amounts',
                },
                {
                  icon: FileText,
                  title: 'Send big invoices — get paid fast',
                  body: 'ACH handles up to $100K per transfer. Perfect for contractors, auto shops, and anyone billing large jobs.',
                  detail: 'Up to $100K per transfer',
                },
                {
                  icon: Shield,
                  title: 'Your customers\' bank info stays safe',
                  body: 'Card data never touches your system. NACHA-compliant rails with active fraud monitoring running 24/7.',
                  detail: 'NACHA compliant · secure by default',
                },
              ].map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.07 }}
                    className="rounded-2xl p-6 transition-colors"
                    style={{
                      background: '#FFFFFF',
                      border: `1px solid ${HAIRLINE}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${PURPLE}12` }}
                    >
                      <Icon size={18} color={PURPLE} strokeWidth={2.2} />
                    </div>
                    <h3
                      className="font-semibold mb-2"
                      style={{ color: NAVY, fontSize: 17, letterSpacing: '-0.01em' }}
                    >
                      {feat.title}
                    </h3>
                    <p className="leading-relaxed mb-4" style={{ color: MUTED, fontSize: 14 }}>
                      {feat.body}
                    </p>
                    <div className="pt-3" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
                      <span
                        className="text-[11px] font-semibold uppercase"
                        style={{ color: MICRO, letterSpacing: '0.14em' }}
                      >
                        {feat.detail}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. TESTIMONIAL (ivory, photo + quote + dots) ══════════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: IVORY }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div className="text-center mb-12">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              What owners are saying
            </div>
            <h2
              className="font-bold leading-[1.1]"
              style={{
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              Real savings. Real business owners.
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
                variant={t.accent === PURPLE ? 'purple' : 'navy'}
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
                  <div className="h-[2px] w-8 rounded-full" style={{ background: PURPLE }} />
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
              className="w-10 h-10 rounded-full flex items-center justify-center"
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
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ border: `1px solid ${HAIRLINE}`, background: '#FFFFFF', color: NAVY }}
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ 6. HONEST STATS RIBBON (white) ════════════════════════ */}
      <section className="py-14" style={{ background: '#FFFFFF' }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { big: '<1 Day', small: 'Ready to take payments', sub: 'Speed' },
              { big: '$847', small: 'Avg. monthly savings', sub: 'Savings' },
              { big: '$50M', small: 'Funded to small businesses', sub: 'Scale' },
              { big: '97%', small: 'Owners who stay with Delt', sub: 'Reliability' },
            ].map((s) => (
              <div key={s.small} className="text-center">
                <div
                  className="font-bold leading-none mb-2"
                  style={{
                    color: PURPLE,
                    fontSize: 'clamp(30px, 3.6vw, 44px)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {s.big}
                </div>
                <div className="font-semibold" style={{ color: NAVY, fontSize: 14 }}>
                  {s.small}
                </div>
                <div
                  className="text-[10.5px] uppercase mt-1"
                  style={{ color: MICRO, letterSpacing: '0.16em' }}
                >
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. KEEP — FreeAccountSection ══════════════════════════ */}
      <FreeAccountSection />

      {/* ═══ 8. RESOURCES 3-UP (white, lavender/ivory cards) ═══════ */}
      <section className="px-6 py-20 md:py-24" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="text-center mb-12">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Helpful reading
            </div>
            <h2
              className="font-bold leading-[1.1]"
              style={{
                fontSize: 'clamp(28px, 3.4vw, 40px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              Guides for business owners who take cards.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: 'How to read your processing statement', tag: 'Guide', cta: 'Read' as const, icon: BookOpen, bg: LAVENDER },
              { title: 'The small-business ACH playbook', tag: 'Playbook', cta: 'Download' as const, icon: Download, bg: IVORY },
              { title: 'In-person vs. online payments: what\'s different about fees?', tag: 'Guide', cta: 'Read' as const, icon: BookOpen, bg: LAVENDER },
            ].map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.title}
                  className="rounded-2xl p-7 flex flex-col gap-5 cursor-pointer transition-transform"
                  style={{ background: r.bg, minHeight: 240 }}
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
                    {r.tag}
                  </div>
                  <p
                    className="font-bold leading-snug flex-1"
                    style={{ color: NAVY, fontSize: 18 }}
                  >
                    {r.title}
                  </p>
                  <div className="flex items-center gap-1.5" style={{ color: PURPLE }}>
                    <span className="text-sm font-semibold">{r.cta}</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 9. PRODUCT CROSS-SELL (light) ═════════════════════════ */}
      <ProductCrossSell
        currentProduct="payments"
        variant="light"
        eyebrow="Everything in one place"
        title="Payments is just the start"
        subtitle="Add funding, a website, and sales insights when you're ready — all on the same account."
      />

      {/* ═══ 10. SMALL CENTERED FINAL CTA (white) ══════════════════ */}
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
            Start taking payments today.
          </h2>
          <p
            className="mb-8 leading-relaxed mx-auto"
            style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', color: MUTED, maxWidth: 480 }}
          >
            Free to start. Card reader included. No contracts. Upgrade when you're ready.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/apply"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:brightness-110"
              style={{ background: PURPLE, fontSize: 15, boxShadow: `0 4px 18px ${PURPLE}40` }}
            >
              Get started — free
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 font-semibold"
              style={{ color: PURPLE, fontSize: 15 }}
            >
              See pricing
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 11. SMALL-PRINT LEGAL (ivory) ═════════════════════════ */}
      <div className="px-6 py-8" style={{ background: IVORY, borderTop: `1px solid ${HAIRLINE}` }}>
        <div
          className="max-w-4xl mx-auto"
          style={{ color: MICRO, fontSize: 11, lineHeight: 1.7 }}
        >
          <p>
            Rates shown are representative examples. Actual processing rates depend on card type,
            average ticket size, and volume. The ACH flat rate applies to US bank
            transfers under $100,000 per transfer. Delt Zero eligibility subject to terms.
          </p>
        </div>
      </div>

    </div>
  );
}

export default PaymentsPage;
