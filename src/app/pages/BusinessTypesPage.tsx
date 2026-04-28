import { Link } from 'react-router';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

/* ════════════════════════════════════════════════════════════
   Wave 4 — BusinessTypesPage (rebuilt)
   The "See every industry" hub. Clean, on-palette index that
   dispatches to the 5 full industry pages shipped in Wave 3.
   Palette: strictly #FFFFFF / #041E42 / #4945FF.
   ════════════════════════════════════════════════════════════ */

interface IndustryEntry {
  slug: string;
  name: string;
  eyebrow: string;
  tagline: string;
  bullets: string[];
  image: string;
  imageAlt: string;
}

const INDUSTRIES: IndustryEntry[] = [
  {
    slug: 'restaurants',
    name: 'Restaurants & Food Service',
    eyebrow: 'RESTAURANT',
    tagline:
      'One platform for the dining room, the kitchen, and the line out the door.',
    bullets: [
      'POS built for the line',
      'Branded online ordering, not a marketplace',
      'Same-day tips & payroll',
    ],
    image:
      'https://images.unsplash.com/photo-1504940892017-d23b9053d5d4?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Full-service restaurant',
  },
  {
    slug: 'retail',
    name: 'Retail & E-commerce',
    eyebrow: 'RETAIL',
    tagline:
      'Sell in-store, online, and anywhere in between — all running on one brain.',
    bullets: [
      'In-store and online inventory in sync',
      'Your own online store, built for you',
      'Funding that repays from your daily sales',
    ],
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Retail boutique interior',
  },
  {
    slug: 'professional-services',
    name: 'Professional Services',
    eyebrow: 'SERVICES',
    tagline:
      'Get paid faster. Spend less time chasing invoices and more on clients.',
    bullets: [
      'Proposals, invoices, and retainers in one place',
      'Client portal with ACH and auto-pay',
      'See which clients are actually profitable',
    ],
    image:
      'https://images.unsplash.com/photo-1664575601711-67110e027b9b?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Professional services consultant',
  },
  {
    slug: 'salon-barber',
    name: 'Salon & Barber',
    eyebrow: 'SALON',
    tagline: 'Booking, payments, and tipping — made for the chair.',
    bullets: [
      'Online booking synced to your calendar',
      'Full tip amount to staff, transparent splits',
      'Text reminders that cut no-shows',
    ],
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Modern salon interior',
  },
  {
    slug: 'health-wellness',
    name: 'Health & Wellness',
    eyebrow: 'WELLNESS',
    tagline: 'From the front desk to the follow-up, every touchpoint covered.',
    bullets: [
      'HIPAA-ready intake & payments',
      'Memberships, class packs, drop-ins',
      'Smart waitlists + rebooking',
    ],
    image:
      'https://images.unsplash.com/photo-1651077837628-52b3247550ae?auto=format&fit=crop&w=1400&q=80',
    imageAlt: 'Fitness and wellness studio',
  },
];

export function BusinessTypesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ════════ Hero ════════ */}
      <section
        className="relative overflow-hidden pt-28 pb-20 px-6"
        style={{ background: '#041E42' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 15% 10%, rgba(73,69,255,0.32) 0%, transparent 55%)',
          }}
        />
        <div className="relative max-w-[1240px] mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-[13.5px] font-semibold mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#4945FF] mb-5">
              Every industry
            </div>
            <h1
              className="text-white font-bold leading-[1.04] mb-6 max-w-[900px]"
              style={{
                fontSize: 'clamp(40px, 5.2vw, 64px)',
                letterSpacing: '-0.025em',
              }}
            >
              Built for the way your business actually runs.
            </h1>
            <p className="text-[18px] text-white/70 max-w-[640px] leading-relaxed">
              Website, Payments, Lens AI, and Capital — set up for five of the
              most common types of small business. Pick yours and see
              exactly what you get.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════ Industry grid ════════ */}
      <section className="px-6 py-24">
        <div className="max-w-[1240px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {INDUSTRIES.map((ind, i) => (
              <motion.div
                key={ind.slug}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 0.9, 0.3, 1] }}
              >
                <Link
                  to={`/industries/${ind.slug}`}
                  className="group block rounded-2xl overflow-hidden border border-[#EEF0F4] bg-white hover:border-[#4945FF]/40 transition-colors h-full flex flex-col"
                  style={{ boxShadow: '0 2px 16px rgba(4,30,66,0.06)' }}
                >
                  {/* Photo */}
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: '16 / 10' }}
                  >
                    <img
                      src={ind.image}
                      alt={ind.imageAlt}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(4,30,66,0) 50%, rgba(4,30,66,0.55) 100%)',
                      }}
                    />
                    <div
                      className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10.5px] font-bold"
                      style={{
                        background: 'rgba(255,255,255,0.94)',
                        color: '#041E42',
                        letterSpacing: '0.14em',
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      {ind.eyebrow}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-7 flex flex-col flex-1">
                    <h3
                      className="text-[22px] font-semibold text-[#041E42] mb-3"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {ind.name}
                    </h3>
                    <p className="text-[15px] text-[#475569] leading-relaxed mb-5">
                      {ind.tagline}
                    </p>
                    <ul className="space-y-2 mb-7">
                      {ind.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2.5 text-[14px] text-[#041E42]"
                        >
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full mt-[9px] flex-shrink-0"
                            style={{ background: '#4945FF' }}
                          />
                          <span className="leading-snug">{b}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto inline-flex items-center gap-2 text-[14px] font-semibold text-[#4945FF] group-hover:gap-3 transition-all">
                      Explore {ind.name.split(' ')[0].toLowerCase()}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* "Don't see yours" card */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: INDUSTRIES.length * 0.06 }}
              className="rounded-2xl border border-dashed border-[#4945FF]/30 bg-white p-7 flex flex-col justify-between"
            >
              <div>
                <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#4945FF] mb-3">
                  More coming
                </div>
                <h3
                  className="text-[22px] font-semibold text-[#041E42] mb-3"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  Don&apos;t see your industry?
                </h3>
                <p className="text-[15px] text-[#475569] leading-relaxed mb-6">
                  Delt works for any business that takes payments. Talk with us
                  about your setup — we&apos;ll build a playbook for you.
                </p>
              </div>
              <Link
                to="/contact-sales"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#4945FF] text-white text-[14px] font-semibold hover:bg-[#3933CC] transition-colors self-start"
              >
                Talk with sales <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ Stats strip ════════ */}
      <section
        className="px-6 py-16 border-t border-[#94A3B8]/20"
        style={{ background: '#F6F7FB' }}
      >
        <div className="max-w-[1240px] mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: '<1 Day', label: 'Go live' },
              { value: '$847', label: 'Avg. monthly savings' },
              { value: '$50M', label: 'Capital deployed' },
              { value: '97%', label: 'Merchant retention' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div
                  className="text-[#041E42] font-bold mb-1"
                  style={{
                    fontSize: 'clamp(30px, 3.4vw, 42px)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {s.value}
                </div>
                <div className="text-[14px] text-[#475569]">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Final CTA ════════ */}
      <section className="pb-28 pt-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div
            className="rounded-3xl p-12 md:p-16 relative overflow-hidden"
            style={{ background: '#041E42' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 85% 15%, rgba(73,69,255,0.35) 0%, transparent 50%)',
              }}
            />
            <div className="relative grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#4945FF] mb-4">
                  Ready when you are
                </div>
                <h2
                  className="text-white font-bold leading-[1.08] mb-5"
                  style={{
                    fontSize: 'clamp(28px, 3.4vw, 40px)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  One platform. Priced flat. Built for your business.
                </h2>
                <p className="text-[16.5px] text-white/70 leading-relaxed max-w-[520px]">
                  Website, Payments, Lens AI, and Capital — one account, one
                  price, and someone who walks you through setup on day one.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#4945FF] text-white text-[15px] font-semibold hover:bg-[#3933CC] transition-colors"
                >
                  Start your free trial <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact-sales"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white/10 text-white text-[15px] font-semibold hover:bg-white/15 transition-colors border border-white/15 backdrop-blur-sm"
                >
                  Book a 20-minute demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
