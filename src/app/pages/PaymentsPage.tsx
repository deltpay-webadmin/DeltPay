import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { ScrollExpandingHero } from '../components/ScrollExpandingHero';
import DeltScrollReveal from '../components/DeltScrollReveal';
import { FreeAccountSection } from '../components/FreeAccountSection';

/* ═══ CONSTANTS ═══ */
const BG = '#03152E';
const NAVY = '#041E42';
const PURPLE = '#4945FF';
const WHITE = '#FFFFFF';
const LIGHT_BG = '#FAFAFA';
const LIGHT_NAVY = '#F5F7FA';
const BORDER = 'rgba(4,30,66,0.1)';
const TEXT_NAVY = '#041E42';
const TEXT_MUTED = 'rgba(4,30,66,0.5)';
const JAKARTA = '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif';

export function PaymentsPage() {
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, fontFamily: JAKARTA }}>

      {/* ═══════════════════════════════════════════
          SCROLL EXPANDING HERO
          ═══════════════════════════════════════════ */}
      <ScrollExpandingHero />

      {/* ═══════════════════════════════════════════
          PRICING PROGRAMS
          ═══════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 relative bg-gradient-to-b from-[#F0F4FF] via-[#E8ECFF] to-[#F0F4FF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: 'rgba(73,69,255,0.1)', border: `1px solid rgba(73,69,255,0.3)` }}>
              <span className="text-xs font-bold tracking-wide" style={{ color: PURPLE }}>PRICING PROGRAMS</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4 leading-tight" style={{ fontFamily: JAKARTA, color: TEXT_NAVY, letterSpacing: '-0.02em' }}>
              Three ways to keep more of every sale.
            </h2>
            <p className="text-lg leading-relaxed max-w-xl" style={{ color: TEXT_MUTED }}>
              Choose the pricing structure that fits your business — or mix and match across your locations.
            </p>
          </motion.div>

          {/* 3-column Pricing Programs Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                key: 'cash',
                label: 'Cash Discount',
                tag: 'Zero Cost',
                tagColor: '#16C784',
                tagBg: 'rgba(22,199,132,0.10)',
                tagBorder: 'rgba(22,199,132,0.25)',
                icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/>,
                headline: '0% net cost',
                body: 'Post two prices — cash and card. Customers who pay by card cover the fee. Your effective processing cost is $0. Delt handles all compliance signage and disclosure automatically.',
                detail: 'Compliant in all 50 states',
              },
              {
                key: 'flatrate',
                label: 'Flat Rate',
                tag: 'Predictable',
                tagColor: '#8a94a6',
                tagBg: 'rgba(138,148,166,0.10)',
                tagBorder: 'rgba(138,148,166,0.25)',
                icon: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
                headline: 'One rate, every card',
                body: 'A single blended rate regardless of card type. Simple, predictable billing that\'s easy to forecast and reconcile — ideal for lower-volume or mixed-card merchants.',
                detail: 'No per-card-type surprises',
              },
              {
                key: 'interchange',
                label: 'Interchange Plus',
                tag: 'Transparent',
                tagColor: '#f0a04b',
                tagBg: 'rgba(240,160,75,0.10)',
                tagBorder: 'rgba(240,160,75,0.25)',
                icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
                headline: 'Cost + a small margin',
                body: 'Pay the actual interchange rate set by card networks plus a fixed Delt margin. Full line-item transparency on every statement — best for high-volume merchants wanting the lowest effective rate.',
                detail: 'Available on Growth & Custom',
              },
            ].map((model, i) => (
              <motion.div
                key={model.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl p-6 flex flex-col transition-all duration-200"
                style={{ backgroundColor: '#FAFBFC', border: `1px solid ${BORDER}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 28px rgba(4,30,66,0.09)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(4,30,66,0.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.borderColor = BORDER; }}
              >
                {/* label + tag */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: 'rgba(4,30,66,0.06)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TEXT_NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        {model.icon}
                      </svg>
                    </span>
                    <span className="text-sm font-bold" style={{ color: TEXT_NAVY }}>{model.label}</span>
                  </div>
                  <span className="text-xs font-bold tracking-wide px-2 py-1 rounded-md" style={{ color: model.tagColor, backgroundColor: model.tagBg, border: `1px solid ${model.tagBorder}` }}>
                    {model.tag}
                  </span>
                </div>

                <div className="text-base font-black mb-2" style={{ color: TEXT_NAVY }}>{model.headline}</div>
                <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: TEXT_MUTED }}>{model.body}</p>

                <div className="flex items-center gap-2 mt-auto">
                  <span className="inline-block" style={{ width: 16, height: 2, background: BORDER, borderRadius: 1 }} />
                  <span className="text-xs font-semibold" style={{ color: TEXT_MUTED, letterSpacing: '0.03em' }}>{model.detail}</span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ACH PROCESSING
          ═══════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 relative bg-gradient-to-b from-[#F0F4FF] via-[#E8ECFF] to-[#F0F4FF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: 'rgba(73,69,255,0.1)', border: `1px solid rgba(73,69,255,0.3)` }}>
              <span className="text-xs font-bold tracking-wide" style={{ color: PURPLE }}>ACH / BANK TRANSFER</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4 leading-tight" style={{ fontFamily: JAKARTA, color: TEXT_NAVY, letterSpacing: '-0.02em' }}>
              ACH processing
            </h2>
            <p className="text-lg leading-relaxed max-w-xl" style={{ color: TEXT_MUTED }}>
              Accept bank-to-bank payments directly. One flat rate, no card network fees — ideal for large invoices and recurring billing.
            </p>
          </motion.div>

          {/* ACH Feature Grid */}
          <div className="grid lg:grid-cols-3 gap-6 items-start">

            {/* ACH Rate Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl p-8 relative overflow-hidden"
              style={{
                background: '#041E42',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(4,30,66,0.2)',
                minHeight: 400
              }}
            >
              {/* Decorative gradient orbs */}
              <div style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(73,69,255,0.25) 0%, rgba(73,69,255,0) 70%)',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                bottom: -60,
                left: -60,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0) 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-8" style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  <span className="text-xs font-bold tracking-wide uppercase text-white">ACH / Bank Transfer</span>
                </div>

                <div className="mb-4 text-white" style={{
                  fontFamily: JAKARTA,
                  fontSize: 'clamp(56px,5.5vw,72px)',
                  fontWeight: 900,
                  lineHeight: 0.95,
                  letterSpacing: '-0.03em'
                }}>
                  1%
                </div>

                <p className="text-base font-semibold mb-2 text-white">
                  per transaction
                </p>

                <p className="text-sm leading-relaxed mb-10 text-white/70">
                  Flat rate. No card network markup. No surprises.
                </p>

                <div className="flex flex-col gap-4">
                  {[
                    'No card network markup',
                    'Recurring & one-time support',
                    'Up to $100K per transaction',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg" style={{
                        background: 'rgba(16,185,129,0.2)',
                        border: '1px solid rgba(16,185,129,0.4)'
                      }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="text-sm font-semibold text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ACH Feature Cards */}
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
              {[
                {
                  icon: <><path d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></>,
                  title: 'No card network fees',
                  body: 'ACH payments bypass Visa and Mastercard networks entirely. You pay only the flat 1% Delt rate — nothing added by card associations.',
                  detail: 'Save 1.5–2.5% vs card processing',
                },
                {
                  icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
                  title: 'Recurring billing built in',
                  body: 'Schedule and automate recurring ACH charges for subscriptions, retainers, or installment plans. Customers authorize once, you collect automatically.',
                  detail: 'Supports variable & fixed amounts',
                },
                {
                  icon: <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
                  title: 'Large invoice support',
                  body: 'Send ACH payment requests up to $100,000 per transaction. Perfect for contractors, agencies, B2B sellers, and anyone with high-ticket clients.',
                  detail: 'Up to $100K per transaction',
                },
                {
                  icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
                  title: 'Bank-level security',
                  body: 'All ACH transfers are processed through NACHA-compliant rails with encrypted tokenization, fraud monitoring, and return-code management handled automatically.',
                  detail: 'NACHA compliant · encrypted',
                },
              ].map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="rounded-2xl p-6 transition-all duration-200"
                  style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 28px rgba(4,30,66,0.09)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(4,30,66,0.18)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.borderColor = BORDER; }}
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg mb-4" style={{ backgroundColor: 'rgba(4,30,66,0.06)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT_NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {feat.icon}
                    </svg>
                  </span>
                  <div className="text-base font-black mb-2" style={{ color: TEXT_NAVY }}>{feat.title}</div>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: TEXT_MUTED }}>{feat.body}</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-block" style={{ width: 16, height: 2, background: BORDER, borderRadius: 1 }} />
                    <span className="text-xs font-semibold" style={{ color: TEXT_MUTED, letterSpacing: '0.03em' }}>{feat.detail}</span>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          EVERYTHING YOU NEED. NOTHING YOU DON'T.
          ═══════════════════════════════════════════ */}
      <FreeAccountSection />

      {/* ═══════════════════════════════════════════
          BUILT FOR THE COUNTER. AND BEYOND.
          ══════════════════════════════════════════ */}
      <DeltScrollReveal />

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
            <h2 className="text-4xl lg:text-5xl font-black mb-6" style={{ fontFamily: JAKARTA, color: WHITE, letterSpacing: '-0.02em' }}>
              Start accepting payments today.
            </h2>
            <p className="text-lg mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Free to start. Hardware included. No contracts. Upgrade when you&apos;re ready.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link 
                to="/apply"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 group"
                style={{ backgroundColor: WHITE, color: NAVY }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = PURPLE; e.currentTarget.style.color = WHITE; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = WHITE; e.currentTarget.style.color = NAVY; }}
              >
                Get Started — Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200"
                style={{ border: `1.5px solid rgba(255,255,255,0.15)`, color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = WHITE; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
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