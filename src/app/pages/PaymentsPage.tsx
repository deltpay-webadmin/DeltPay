import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowRight, Check, Zap, Repeat, FileText, Shield, CreditCard, TrendingDown, Users } from 'lucide-react';
import { ScrollExpandingHero } from '../components/ScrollExpandingHero';
import DeltScrollReveal from '../components/DeltScrollReveal';
import { FreeAccountSection } from '../components/FreeAccountSection';
import { ProductCrossSell } from '../components/ProductCrossSell';

const NAVY = '#041E42';
const PURPLE = '#4945FF';
const WHITE = '#FFFFFF';
const JAKARTA = '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
const TEXT_NAVY = '#041E42';
const TEXT_MUTED = '#475569';
const BORDER = 'rgba(4,30,66,0.08)';

export function PaymentsPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: JAKARTA }}>

      {/* KEEP — Scroll expanding hero ("Your business, instantly paid") */}
      <ScrollExpandingHero />

      {/* ═══════════════════════════════════════════
          THREE WAYS TO KEEP MORE OF EVERY SALE
          ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-28 bg-white border-t border-[#EEF0F4]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-14 max-w-[780px]"
          >
            <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#4945FF] mb-4">
              Pricing programs
            </div>
            <h2
              className="font-bold leading-[1.05] text-[#041E42] mb-5"
              style={{ fontSize: 'clamp(36px, 4.6vw, 56px)', letterSpacing: '-0.025em' }}
            >
              Three ways to keep more of every sale.
            </h2>
            <p className="text-[17px] leading-relaxed text-[#475569] max-w-[620px]">
              Pick the pricing structure that fits your business — or mix and match across locations.
              Whichever you choose, rates are transparent and there's no long-term contract.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                tag: 'Merchant-net $0',
                label: 'Cash Discount',
                headline: '0% net cost',
                body: 'Post two prices — cash and card. Customers who pay by card cover the fee. Your effective processing cost is $0. Delt handles all compliance signage automatically.',
                detail: 'Compliant in all 50 states',
                bullets: ['Automatic receipt disclosure', 'State-by-state signage', 'Opt-in or -out per location'],
                featured: false,
              },
              {
                tag: 'Most popular',
                label: 'Flat Rate',
                headline: 'One rate, every card',
                body: 'A single blended rate regardless of card type. Simple, predictable billing that\'s easy to forecast and reconcile — ideal for lower-volume or mixed-card merchants.',
                detail: 'No per-card-type surprises',
                bullets: ['Predictable monthly cost', 'Same rate for AMEX, Visa, Mastercard', 'No statement decoding'],
                featured: true,
              },
              {
                tag: 'Transparent',
                label: 'Interchange Plus',
                headline: 'Cost + a small margin',
                body: 'Pay the actual interchange rate set by card networks plus a fixed Delt margin. Full line-item transparency on every statement — best for high-volume merchants wanting competitive rates.',
                detail: 'Available on Growth & Custom',
                bullets: ['Competitive rate structure for high-volume merchants', 'Line-item statements', 'Monthly rate review'],
                featured: false,
              },
            ].map((model, i) => (
              <motion.div
                key={model.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className={`rounded-2xl p-7 flex flex-col ${
                  model.featured
                    ? 'bg-[#041E42] text-white border border-[#041E42]'
                    : 'bg-white border border-[#EEF0F4] hover:border-[#4945FF]/40'
                } transition-colors`}
              >
                <div className="flex items-center justify-between mb-6">
                  <span
                    className={`text-[13px] font-bold ${
                      model.featured ? 'text-white' : 'text-[#041E42]'
                    }`}
                  >
                    {model.label}
                  </span>
                  <span
                    className={`text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-md ${
                      model.featured
                        ? 'bg-[#4945FF] text-white'
                        : 'bg-[#4945FF]/10 text-[#4945FF]'
                    }`}
                  >
                    {model.tag}
                  </span>
                </div>

                <div
                  className={`text-[24px] font-bold mb-3 leading-tight ${
                    model.featured ? 'text-white' : 'text-[#041E42]'
                  }`}
                  style={{ letterSpacing: '-0.01em' }}
                >
                  {model.headline}
                </div>
                <p
                  className={`text-[14.5px] leading-relaxed mb-6 ${
                    model.featured ? 'text-white/70' : 'text-[#475569]'
                  }`}
                >
                  {model.body}
                </p>

                <ul className="space-y-2.5 mb-7">
                  {model.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <Check
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          model.featured ? 'text-white' : 'text-[#4945FF]'
                        }`}
                        strokeWidth={3}
                      />
                      <span
                        className={`text-[13.5px] ${
                          model.featured ? 'text-white/85' : 'text-[#041E42]'
                        }`}
                      >
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-5 border-t border-white/10" style={{ borderColor: model.featured ? 'rgba(255,255,255,0.12)' : BORDER }}>
                  <span
                    className={`text-[11.5px] font-semibold uppercase tracking-[0.14em] ${
                      model.featured ? 'text-white/60' : 'text-[#94A3B8]'
                    }`}
                  >
                    {model.detail}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ACH — big 1% moment
          ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-28 bg-[#F7F7FB]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-stretch">
            {/* LEFT — giant 1% card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl p-10 lg:p-14 flex flex-col justify-between"
              style={{ background: NAVY, minHeight: 520 }}
            >
              {/* Glow backdrop */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 85% 15%, rgba(73,69,255,0.4) 0%, transparent 55%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
              />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-bold tracking-[0.16em] uppercase text-white mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4945FF]" />
                  ACH / Bank transfer
                </div>
                <div
                  className="text-white font-black leading-[0.88] mb-4"
                  style={{ fontSize: 'clamp(120px, 16vw, 200px)', letterSpacing: '-0.04em' }}
                >
                  1%
                </div>
                <div className="text-white text-[22px] font-semibold mb-3">per transaction</div>
                <p className="text-white/70 text-[16px] leading-relaxed max-w-[420px]">
                  Flat rate. No card network markup. No surprises. Up to $100K per transfer,
                  recurring or one-time.
                </p>
              </div>

              <div className="relative mt-10 grid grid-cols-1 gap-3">
                {[
                  'No card network markup',
                  'Recurring & one-time support',
                  'Up to $100K per transaction',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-[#4945FF] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-white text-[14.5px] font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT — ACH feature cards 2x2 */}
            <div className="grid sm:grid-cols-2 gap-5 content-start">
              {[
                {
                  icon: TrendingDown,
                  title: 'No card network fees',
                  body: 'ACH bypasses Visa and Mastercard networks entirely. You pay only the flat 1%.',
                  detail: 'Save 1.5–2.5% vs card processing',
                },
                {
                  icon: Repeat,
                  title: 'Recurring billing built in',
                  body: 'Automate subscriptions, retainers, and installments. Customers authorize once.',
                  detail: 'Variable and fixed amounts',
                },
                {
                  icon: FileText,
                  title: 'Large invoice support',
                  body: 'ACH requests up to $100K. Perfect for contractors, agencies, and B2B.',
                  detail: 'Up to $100K per transaction',
                },
                {
                  icon: Shield,
                  title: 'Bank-level security',
                  body: 'NACHA-compliant rails with encrypted tokenization and fraud monitoring.',
                  detail: 'NACHA compliant · encrypted',
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
                    className="rounded-2xl p-6 bg-white border border-[#EEF0F4] hover:border-[#4945FF]/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#4945FF]/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-[#4945FF]" strokeWidth={2.2} />
                    </div>
                    <h3
                      className="text-[17px] font-semibold text-[#041E42] mb-2"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {feat.title}
                    </h3>
                    <p className="text-[14px] leading-relaxed text-[#475569] mb-4">{feat.body}</p>
                    <div className="pt-3 border-t border-[#EEF0F4]">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
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

      {/* ═══════════════════════════════════════════
          HONEST STATS RIBBON
          ═══════════════════════════════════════════ */}
      <section className="py-14 border-y border-[#EEF0F4] bg-white">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { big: '<1 Day', small: 'Go live', sub: 'Speed' },
              { big: '$847', small: 'Avg. monthly savings', sub: 'Savings' },
              { big: '$50M', small: 'Capital deployed', sub: 'Scale' },
              { big: '97%', small: 'Merchant retention', sub: 'Reliability' },
            ].map((s) => (
              <div key={s.small} className="text-center">
                <div
                  className="font-bold text-[#4945FF] leading-none mb-2"
                  style={{ fontSize: 'clamp(30px, 3.6vw, 44px)', letterSpacing: '-0.02em' }}
                >
                  {s.big}
                </div>
                <div className="text-[14px] text-[#041E42] font-semibold">{s.small}</div>
                <div className="text-[10.5px] text-[#94A3B8] uppercase tracking-[0.16em] mt-1">
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEEP — Everything you need */}
      <FreeAccountSection />

      {/* KEEP — Built for the counter */}
      <DeltScrollReveal />

      {/* ═══════════════════════════════════════════
          CROSS-SELL — continuity across products
          ═══════════════════════════════════════════ */}
      <ProductCrossSell
        currentProduct="payments"
        eyebrow="One platform, every tool you need"
        title="Payments is just the start"
        subtitle="Add capital, websites, and AI analytics when you're ready — they all run on the same account."
      />

      {/* ═══════════════════════════════════════════
          BOTTOM CTA
          ═══════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 text-center" style={{ backgroundColor: NAVY }}>
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-4xl lg:text-5xl font-bold mb-6 text-white"
              style={{ fontFamily: JAKARTA, letterSpacing: '-0.02em' }}
            >
              Start accepting payments today.
            </h2>
            <p className="text-lg mb-10 leading-relaxed text-white/60">
              Free to start. Hardware included. No contracts. Upgrade when you're ready.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 bg-[#4945FF] text-white hover:bg-[#3730FF]"
              >
                Get Started — Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 border border-white/15 text-white/70 hover:bg-white/5 hover:text-white"
              >
                See Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
