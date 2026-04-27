import { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useInView } from 'motion/react';
import { FundingApplicationDemo } from './FundingApplicationDemo';

/* ── Figma assets ─────────────────────────────────────────────────────────── */
import kuroImage      from 'figma:asset/4b959f6beef35f5174284dac44f7eb4795f2294a.png';
import handheldImg    from 'figma:asset/20435ca9d80721b62fa49d033930eab021c2b23d.png';

/* ── Palette ──────────────────────────────────────────────────────────────── */
const NAVY   = '#041E42';
const PURPLE = '#4945FF';
const GRAY   = '#6B7280';
const MUTED  = '#9CA0AB';
const BORDER = '#E8E8EC';
const BG     = '#FFFFFF';
const BG_ALT = '#F7F8FA';
const MONO   = "'JetBrains Mono', monospace";

/* ── Shared scroll-reveal wrapper ─────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-70px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── Feature pill ─────────────────────────────────────────────────────────── */
function Pill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 12px',
        borderRadius: 999,
        border: `1px solid ${BORDER}`,
        background: BG,
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: '0.06em',
        color: NAVY,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

/* ── Arrow CTA link ───────────────────────────────────────────────────────── */
function ArrowLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="text-sm font-bold inline-flex items-center gap-1.5 transition-all duration-200 hover:gap-2.5"
      style={{ color: PURPLE }}
    >
      {label} <span>→</span>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WEBSITE SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

function BrowserMockup() {
  return (
    <div
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        border: `1px solid ${BORDER}`,
        boxShadow: '0 24px 80px rgba(4,30,66,0.12), 0 4px 16px rgba(4,30,66,0.06)',
        background: '#fff',
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          background: '#F4F5F7',
          borderBottom: `1px solid ${BORDER}`,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
          ))}
        </div>
        {/* URL bar */}
        <div
          style={{
            flex: 1,
            background: '#EAECF0',
            borderRadius: 6,
            padding: '4px 10px',
            fontFamily: MONO,
            fontSize: 11,
            color: MUTED,
            letterSpacing: '0.04em',
          }}
        >
          yourbusiness.com
        </div>
        {/* Reload icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      </div>

      {/* Screenshot */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
        <img
          src={kuroImage}
          alt="Merchant website example"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
        />
        {/* Subtle gradient at bottom */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(4,30,66,0.12) 0%, transparent 40%)',
          }}
        />
        {/* Live badge */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${BORDER}`,
            borderRadius: 999,
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.1em',
            color: NAVY,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'block' }} />
          LIVE
        </div>
      </div>
    </div>
  );
}

export function WebsiteCallout() {
  return (
    <section
      style={{
        background: BG_ALT,
        borderBottom: `1px solid ${BORDER}`,
        padding: 'clamp(56px, 8vh, 96px) clamp(24px, 4vw, 48px)',
      }}
    >
      <div
        className="max-w-[1300px] mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(40px, 6vw, 80px)',
          alignItems: 'center',
        }}
      >
        {/* Left: Copy */}
        <div style={{ maxWidth: 520 }}>
          <Reveal>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1.2px', color: PURPLE, marginBottom: 16 }}>
              DIGITAL STOREFRONT
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(26px, 3.5vw, 42px)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: NAVY,
                marginBottom: 18,
              }}
            >
              Digital Storefront
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: GRAY, marginBottom: 24, maxWidth: '44ch' }}>
              Professional architecture, custom-built to elevate your brand and maximize conversion.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
              {['Done-for-you', 'Mobile-ready', 'SSL hosted', 'SEO optimised'].map((t) => (
                <Pill key={t} label={t} />
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.22}>
            <ArrowLink to="/website-builder" label="View the Gallery" />
          </Reveal>
        </div>

        {/* Right: Browser mockup */}
        <Reveal delay={0.12} className="w-full">
          <BrowserMockup />
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAYMENTS SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

function TerminalVisual() {
  return (
    <div
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #0d1f3c 0%, #041E42 60%, #0a0f2a 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)',
        padding: 'clamp(24px, 4vw, 48px)',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 24,
        position: 'relative' as const,
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(73,69,255,0.18) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Terminal image */}
      <img
        src={handheldImg}
        alt="Delt Plus payment terminal"
        style={{
          width: '62%',
          maxWidth: 260,
          objectFit: 'contain',
          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Status bar */}
      <div
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
            LAST TRANSACTION
          </div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: '#fff' }}>
            $142.50
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 999,
            padding: '6px 12px',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'block' }} />
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', color: '#22C55E' }}>APPROVED</span>
        </div>
      </div>

      {/* Method tags */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        {['Tap', 'Chip', 'Swipe', 'Online'].map((m) => (
          <span
            key={m}
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 999,
              padding: '4px 10px',
            }}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PaymentsCallout() {
  return (
    <section
      style={{
        background: BG,
        borderBottom: `1px solid ${BORDER}`,
        padding: 'clamp(56px, 8vh, 96px) clamp(24px, 4vw, 48px)',
      }}
    >
      <div
        className="max-w-[1300px] mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(40px, 6vw, 80px)',
          alignItems: 'center',
        }}
      >
        {/* Left: Terminal visual */}
        <Reveal delay={0.1} className="w-full order-last lg:order-first">
          <TerminalVisual />
        </Reveal>

        {/* Right: Copy */}
        <div style={{ maxWidth: 520 }}>
          <Reveal>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1.2px', color: PURPLE, marginBottom: 16 }}>
              COMMERCE
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(26px, 3.5vw, 42px)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: NAVY,
                marginBottom: 18,
              }}
            >
              Commerce
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: GRAY, marginBottom: 24, maxWidth: '44ch' }}>
              Unified payment processing designed for seamless in-store and online transactions.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
              {['Bank-grade encryption', 'Same-day payouts', 'Free hardware', '2.5% + 10¢'].map((t) => (
                <Pill key={t} label={t} />
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.22}>
            <ArrowLink to="/payments" label="Experience Flow" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CAPITAL SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

export function CapitalCallout() {
  return (
    <section
      style={{
        background: BG_ALT,
        borderBottom: `1px solid ${BORDER}`,
        padding: 'clamp(56px, 8vh, 96px) clamp(24px, 4vw, 48px)',
      }}
    >
      <div
        className="max-w-[1300px] mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(40px, 6vw, 80px)',
          alignItems: 'center',
        }}
      >
        {/* Left: Copy */}
        <div style={{ maxWidth: 520 }}>
          <Reveal>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '1.2px', color: PURPLE, marginBottom: 16 }}>
              GROWTH CAPITAL
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(26px, 3.5vw, 42px)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: NAVY,
                marginBottom: 18,
              }}
            >
              Growth Capital
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: GRAY, marginBottom: 24, maxWidth: '44ch' }}>
              Flexible, revenue-based funding to fuel your next location, inventory, or expansion.
            </p>
          </Reveal>

          {/* Flywheel callout */}
          <Reveal delay={0.17}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(73,69,255,0.05) 0%, rgba(73,69,255,0.10) 100%)',
                border: `1px solid rgba(73,69,255,0.15)`,
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(73,69,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: PURPLE, marginBottom: 4 }}>THE FLYWHEEL</div>
                <p style={{ fontSize: 13, lineHeight: 1.55, color: GRAY, margin: 0 }}>
                  Payments → Lens insights → pre-qualified capital. The more you sell with Delt, the better your offer gets.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.20}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
              {['Revenue-based', 'No credit check', 'Hours not weeks', '$25K–$500K'].map((t) => (
                <Pill key={t} label={t} />
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <ArrowLink to="/apply" label="Fuel Your Growth" />
          </Reveal>
        </div>

        {/* Right: Funding demo */}
        <Reveal delay={0.12} className="w-full">
          <FundingApplicationDemo />
        </Reveal>
      </div>
    </section>
  );
}