import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, useInView } from 'motion/react';
import lensIcon from 'figma:asset/86ab3fe0422dec5536bf8bfb4c1714db1dfe7b45.png';
import { CPULoadingAnimation } from './CPULoadingAnimation';

/* ═══════════════════════════════════════════════════════
   PALETTE — project colors
   ═══════════════════════════════════════════════════════ */
const NAVY = '#041E42';
const PURPLE = '#4945FF';
const GRAY = '#6B7280';
const MUTED = '#9CA0AB';
const BG = '#FFFFFF';
const BG_ALT = '#F7F7F8';
const BORDER = '#E8E8EC';
const MONO = "'JetBrains Mono', monospace";

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */
const products = [
  { label: 'Payments', stat: '2.5% + 10¢', statLabel: 'per transaction · Growth plan', desc: 'Every method. In-person, online, mobile. Free reader included.' },
  { label: 'Websites', stat: '48 hrs', statLabel: 'to go live · done for you', desc: 'Custom-designed. Hosted. SSL. SEO. Not a template.' },
  { label: 'Lens AI', stat: '+18%', statLabel: 'avg. revenue insight', desc: 'Trained on your data — not the internet. Knows your business, nothing else.' },
  { label: 'Capital', stat: '$25K–500K', statLabel: 'funding range', desc: 'Revenue-based. No equity. No personal guarantee. Hours, not weeks.' },
];

const merchants = ['Precision Auto', 'Summit HVAC', 'Bright Smile Dental', 'GreenScape', 'Atlas PT', 'Harbor Coffee'];

const integrations = [
  { name: 'QuickBooks', cat: 'Accounting' },
  { name: 'Mailchimp', cat: 'Email' },
  { name: 'Zapier', cat: 'Automation' },
  { name: 'Google Business', cat: 'Listings' },
  { name: 'Xero', cat: 'Accounting' },
  { name: 'Square (import)', cat: 'Migration' },
];

const hubProducts = [
  {
    label: 'Payments', desc: 'Process every transaction. Manage your receivables. Free hardware on every plan.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" strokeWidth="1.3" stroke={NAVY}>
        <rect x="1.5" y="4.5" width="19" height="13" rx="2.5" />
        <path d="M1.5 9.5h19" />
        <path d="M5.5 13.5h4" />
      </svg>
    ),
  },
  {
    label: 'Websites', desc: 'Your storefront, built for you. Custom design, hosting, SSL, SEO.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" strokeWidth="1.3" stroke={NAVY}>
        <circle cx="11" cy="11" r="9.5" />
        <ellipse cx="11" cy="11" rx="4" ry="9.5" />
        <path d="M2 11h18" />
      </svg>
    ),
  },
  {
    label: 'Lens AI', desc: 'Intelligence trained on your data. Revenue trends, forecasting, natural-language queries.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" strokeWidth="1.3" stroke={NAVY} strokeLinecap="round">
        <path d="M4 18V11" />
        <path d="M8.5 18V7" />
        <path d="M13 18V9" />
        <path d="M17.5 18V4" />
      </svg>
    ),
  },
  {
    label: 'Capital', desc: 'Revenue-based funding. Apply in minutes. No equity, no personal guarantee.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" strokeWidth="1.3" stroke={NAVY}>
        <circle cx="11" cy="11" r="9.5" />
        <path d="M8 14l6-6M14 8h-3.5M14 8v3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL WRAPPER
   ═══════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */
export function DeltHeroHub() {
  const [activeProduct, setActiveProduct] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveProduct(p => (p + 1) % 4), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: BG, color: NAVY }}>

      {/* ═══ HERO ═══ */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-12 pt-20 sm:pt-24 lg:pt-[100px] pb-14 lg:pb-16">

          {/* Eyebrow */}
          <Reveal delay={0.05}>
            <div className="mb-8">
              <div
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-md border"
                style={{ borderColor: BORDER, background: BG_ALT }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#4945FF]" />
                <span
                  className="text-xs font-medium"
                  style={{ fontFamily: MONO, color: GRAY }}
                >
                  v1.0 — Now onboarding merchants
                </span>
              </div>
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={0.1}>
            <div className="max-w-[720px] mb-5">
              <h1
                className="text-[clamp(40px,6vw,72px)] font-bold leading-[1.08] m-0"
                style={{ letterSpacing: '-2px', color: NAVY }}
              >
                The platform your
                <br />business is{' '}
                <span className="relative inline-block" style={{ color: PURPLE }}>
                  missing
                  <svg
                    className="absolute bottom-[-3px] left-0 w-full h-1.5"
                    viewBox="0 0 200 6"
                    preserveAspectRatio="none"
                  >
                    <path d="M0 5 Q50 0 100 3 T200 1" stroke={PURPLE} strokeWidth="2" fill="none" opacity="0.3" />
                  </svg>
                </span>.
              </h1>
            </div>
          </Reveal>

          {/* Hub positioning */}
          <Reveal delay={0.16}>
            <p
              className="text-[13px] font-semibold uppercase mb-3"
              style={{ fontFamily: MONO, color: PURPLE, letterSpacing: '0.3px' }}
            >
              Payments · Websites · AI · Capital — one hub
            </p>
          </Reveal>

          {/* Subhead */}
          <Reveal delay={0.22}>
            <p className="text-lg leading-relaxed max-w-[540px] mb-9" style={{ color: GRAY }}>
              Delt is the operating hub for your revenue. Process payments, launch your website, get funded, and understand your business with AI — all from one dashboard. Connects to the tools you already use.
            </p>
          </Reveal>

          {/* CTAs + stats */}
          <Reveal delay={0.3}>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to="/start"
                className="inline-flex items-center gap-2 text-[15px] font-bold text-white px-[30px] py-3.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: NAVY }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = PURPLE; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = NAVY; }}
              >
                Get Started — Free
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 7h12M8 2l5 5-5 5" />
                </svg>
              </Link>
              <Link
                to="/sandbox"
                className="text-[15px] font-semibold px-[30px] py-3.5 rounded-lg border-[1.5px] bg-white transition-colors duration-150"
                style={{ color: NAVY, borderColor: '#D1D1D8' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = NAVY; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D1D1D8'; }}
              >
                See a Demo
              </Link>

              <div className="h-8 w-px mx-2 hidden sm:block" style={{ background: BORDER }} />

              <div className="flex gap-7 hidden sm:flex">
                {[
                  { v: '5 min', l: 'Setup' },
                  { v: '$0/mo', l: 'To start' },
                  { v: '48 hr', l: 'Funding' },
                ].map((st, i) => (
                  <div key={i}>
                    <div className="text-base font-bold" style={{ color: NAVY, letterSpacing: '-0.3px' }}>{st.v}</div>
                    <div className="text-[11px] font-medium" style={{ color: MUTED }}>{st.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* ═══ PRODUCT SHOWCASE STRIP ═══ */}
        <Reveal delay={0.45}>
          <div style={{ background: NAVY }}>
            <div className="max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-12 flex flex-col lg:flex-row" style={{ minHeight: 360 }}>

              {/* Left: Product tabs */}
              <div
                className="w-full lg:w-[280px] flex-shrink-0 py-8 pr-0 lg:pr-6 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:border-r lg:border-white/[0.06]"
              >
                <div
                  className="text-[10px] font-medium uppercase mb-3 pl-3.5 hidden lg:block"
                  style={{ fontFamily: MONO, letterSpacing: '1.2px', color: 'rgba(255,255,255,0.25)' }}
                >
                  The Hub
                </div>

                {products.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveProduct(i)}
                    className="text-left px-3.5 py-3 rounded-lg transition-all duration-200 flex-shrink-0"
                    style={{
                      background: activeProduct === i ? 'rgba(73,69,255,0.1)' : 'transparent',
                      borderLeft: activeProduct === i ? `2px solid ${PURPLE}` : '2px solid transparent',
                    }}
                  >
                    <div
                      className="text-sm font-semibold mb-0.5 transition-colors duration-200"
                      style={{ color: activeProduct === i ? '#fff' : 'rgba(255,255,255,0.4)' }}
                    >
                      {p.label}
                    </div>
                    <div
                      className="text-xs leading-snug transition-colors duration-200 hidden lg:block"
                      style={{ color: activeProduct === i ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)' }}
                    >
                      {p.desc}
                    </div>
                  </button>
                ))}
              </div>

              {/* Center: Active stat */}
              <div className="flex-1 py-8 lg:py-10 px-0 lg:px-12 flex flex-col justify-center relative overflow-hidden">
                {products.map((p, i) => (
                  <div
                    key={i}
                    className="transition-all duration-400"
                    style={{
                      position: i === activeProduct ? 'relative' : 'absolute',
                      opacity: activeProduct === i ? 1 : 0,
                      transform: activeProduct === i ? 'translateY(0)' : 'translateY(12px)',
                      transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                      pointerEvents: activeProduct === i ? 'auto' : 'none',
                    }}
                  >
                    <div
                      className="text-[11px] font-medium uppercase mb-4"
                      style={{ fontFamily: MONO, color: PURPLE, letterSpacing: '0.5px' }}
                    >
                      {p.label}
                    </div>
                    <div
                      className="text-[clamp(40px,8vw,64px)] font-extrabold text-white leading-none mb-2"
                      style={{ letterSpacing: '-2px' }}
                    >
                      {p.stat}
                    </div>
                    <div className="text-[15px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {p.statLabel}
                    </div>
                  </div>
                ))}

                {/* Progress dots */}
                <div className="absolute bottom-8 right-0 flex gap-1.5">
                  {products.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveProduct(i)}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: activeProduct === i ? 24 : 6,
                        background: activeProduct === i ? PURPLE : 'rgba(255,255,255,0.12)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Right: Live feed + integrations */}
              <div
                className="w-full lg:w-[250px] flex-shrink-0 py-8 pl-0 lg:pl-7 hidden lg:flex flex-col justify-between"
                style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <div
                    className="text-[10px] font-medium uppercase mb-4"
                    style={{ fontFamily: MONO, letterSpacing: '1.2px', color: 'rgba(255,255,255,0.25)' }}
                  >
                    Live Feed
                  </div>
                  {[
                    { n: "Maria's Bakery", a: '$847.50' },
                    { n: 'Peak Fitness', a: '$2,340' },
                    { n: 'BlueLine Plumbing', a: '$1,125' },
                  ].map((tx, i) => (
                    <div key={i} className="flex justify-between items-center mb-3.5">
                      <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>{tx.n}</div>
                      <div className="text-right">
                        <div className="text-[13px] font-bold text-white">{tx.a}</div>
                        <div className="text-[9px] font-bold uppercase" style={{ color: '#34D399', letterSpacing: '0.3px' }}>
                          ✓ approved
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Integrations hint */}
                <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div
                    className="text-[10px] font-medium uppercase mb-2.5"
                    style={{ fontFamily: MONO, letterSpacing: '1px', color: 'rgba(255,255,255,0.2)' }}
                  >
                    Connects to
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['QuickBooks', 'Mailchimp', 'Zapier', 'Google'].map((tool, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-[5px]"
                        style={{
                          color: 'rgba(255,255,255,0.3)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          background: 'rgba(255,255,255,0.02)',
                        }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ LOGO STRIP ═══ */}
      <section className="py-5 px-6 sm:px-12" style={{ borderBottom: `1px solid ${BORDER}`, background: BG_ALT }}>
        <div className="max-w-[1300px] mx-auto flex items-center justify-center gap-10 sm:gap-12 flex-wrap">
          <span
            className="text-[11px] font-medium uppercase"
            style={{ fontFamily: MONO, color: '#C4C4CC', letterSpacing: '0.5px' }}
          >
            Merchants
          </span>
          {merchants.map((n, i) => (
            <span
              key={i}
              className="text-sm font-bold whitespace-nowrap transition-colors duration-150 cursor-default"
              style={{ color: '#D4D4DC' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#8888A0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#D4D4DC'; }}
            >
              {n}
            </span>
          ))}
        </div>
      </section>

      {/* ═══ LENS AI CALLOUT ═══ */}
      <section className="py-16 lg:py-[72px] px-6 sm:px-10 lg:px-12" style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-[1300px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-12 items-start lg:items-center">

          {/* Left: Argument */}
          <div className="flex-1 max-w-[540px]">
            <Reveal>
              <div
                className="text-[11px] font-medium uppercase mb-4"
                style={{ fontFamily: MONO, letterSpacing: '1.2px', color: PURPLE }}
              >
                Lens AI
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h2
                className="text-[clamp(26px,3.5vw,40px)] font-bold leading-[1.15] mb-4"
                style={{ letterSpacing: '-1px', color: NAVY }}
              >
                ChatGPT reads the internet.
                <br /><span className="bg-gradient-to-r from-[#4945FF] to-[#4945FF] bg-clip-text text-transparent">Lens</span> reads your books.
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="text-[17px] leading-relaxed mb-6" style={{ color: GRAY }}>
                Lens is trained exclusively on your business data — your transactions, your revenue patterns, your seasonal trends. It doesn't know random facts. It knows that your Tuesday lunch rush outperforms Friday by 22%, and that you should reorder inventory by Thursday.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="text-[15px] leading-relaxed mb-8" style={{ color: MUTED }}>
                General-purpose AI gives general-purpose answers. Lens gives answers that are worth money — because they're built on the data that actually runs your business.
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <Link
                to="/delt-ai"
                className="text-sm font-bold inline-flex items-center gap-1.5 transition-all duration-200 hover:gap-2.5"
                style={{ color: PURPLE }}
              >
                Explore Lens AI <span>→</span>
              </Link>
            </Reveal>
          </div>

          {/* Right: Comparison cards */}
          <Reveal delay={0.15} className="flex-1 max-w-[520px] w-full">
            <div className="flex flex-col gap-3">
              {/* CPU Loading Animation - replaces both boxes */}
              <div 
                className="rounded-xl border p-8 sm:p-10 flex items-center justify-center" 
                style={{ 
                  background: 'linear-gradient(135deg, rgba(73,69,255,0.03) 0%, rgba(73,69,255,0.08) 100%)', 
                  borderColor: 'rgba(73,69,255,0.15)',
                  minHeight: '320px'
                }}
              >
                <CPULoadingAnimation />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ HUB POSITIONING ═══ */}
      <section className="py-16 lg:py-[72px] px-6 sm:px-10 lg:px-12" style={{ background: BG_ALT }}>
        <div className="max-w-[1300px] mx-auto text-center">
          <Reveal>
            <div
              className="text-[11px] font-medium uppercase mb-3"
              style={{ fontFamily: MONO, letterSpacing: '1.2px', color: PURPLE }}
            >
              Your Revenue Hub
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h2
              className="text-[clamp(26px,3.5vw,40px)] font-bold leading-[1.15] mb-4"
              style={{ letterSpacing: '-1px', color: NAVY }}
            >
              Delt doesn't replace your stack.
              <br />It makes your stack work.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-[17px] max-w-[520px] mx-auto mb-12 leading-relaxed" style={{ color: GRAY }}>
              Your payments, invoices, website traffic, and capital — all flowing through one hub. Connected to the tools you already rely on.
            </p>
          </Reveal>

          {/* Integration grid */}
          <Reveal delay={0.18}>
            <div className="flex justify-center gap-3 flex-wrap mb-12">
              {integrations.map((tool, i) => (
                <div
                  key={i}
                  className="bg-white border rounded-[10px] px-5 py-3.5 text-center min-w-[140px] transition-all duration-200 cursor-default hover:-translate-y-0.5"
                  style={{ borderColor: BORDER }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = PURPLE; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
                >
                  <div className="text-sm font-bold mb-0.5" style={{ color: NAVY }}>{tool.name}</div>
                  <div className="text-[11px]" style={{ color: MUTED }}>{tool.cat}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Product cards grid */}
          <Reveal delay={0.24}>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-[14px] overflow-hidden border"
              style={{ background: BORDER, borderColor: BORDER }}
            >
              {hubProducts.map((p, i) => {
                // Map each product to its corresponding route
                const routeMap: { [key: string]: string } = {
                  'Payments': '/payments',
                  'Websites': '/website-examples',
                  'Lens AI': '/delt-ai',
                  'Capital': '/apply',
                };
                
                return (
                  <Link
                    key={i}
                    to={routeMap[p.label] || '#'}
                    className="bg-white p-7 sm:p-8 flex flex-col text-left transition-colors duration-200 hover:bg-[#FAFAFA] group"
                  >
                    <div
                      className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-5 border"
                      style={{ background: '#F5F3FF', borderColor: '#EDEDF5' }}
                    >
                      {p.icon}
                    </div>
                    <div className="text-[17px] font-bold mb-2" style={{ color: NAVY }}>{p.label}</div>
                    <div className="text-sm leading-relaxed flex-1" style={{ color: GRAY }}>{p.desc}</div>
                    <div className="text-[13px] font-semibold mt-[18px] flex items-center gap-1.5 transition-all duration-200 group-hover:gap-2.5" style={{ color: PURPLE }}>
                      Explore <span>→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}