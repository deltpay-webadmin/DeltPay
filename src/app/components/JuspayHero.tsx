import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardPreview } from './DashboardPreview';
import { HeroShaderBackground } from './HeroShaderBackground';

/* ──────────────────────────────────────────────────────────────
   JuspayHero — Delt Capital style
   Navy canvas. Mono volume eyebrow. Large display H1 with
   italic-serif rotating word. Stats strip + bottom hairline +
   meta strip ("SCROLL — THE NUMBERS ↓" · ledger line).
   ────────────────────────────────────────────────────────────── */

const ROTATING_WORDS = ['back', 'wire', 'fund', 'fuel'];

export function JuspayHero() {
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setWordIdx((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: 'var(--dc-bg-navy)', color: 'var(--dc-on-dark)' }}
    >
      {/* Live shader gradient — Delt indigo, animated */}
      <HeroShaderBackground />

      <div className="relative z-[1] mx-auto w-full max-w-[1320px] px-6 lg:px-10 pt-10 lg:pt-14 pb-0">
        {/* Top centered mono volume eyebrow */}
        <div className="flex justify-center">
          <div
            className="flex items-center gap-3 text-[11px] tracking-[0.18em]"
            style={{
              fontFamily: 'var(--dc-font-mono)',
              color: 'var(--dc-on-dark-muted)',
              textTransform: 'uppercase',
            }}
          >
            <span>VOL. VII</span>
            <span style={{ color: 'var(--dc-on-dark-faint)' }}>·</span>
            <span>Q2 2026</span>
            <span style={{ color: 'var(--dc-on-dark-faint)' }}>·</span>
            <span>DIRECT FUNDING</span>
            <span style={{ color: 'var(--dc-on-dark-faint)' }}>·</span>
            <span>EST. 2019</span>
            <span style={{ color: 'var(--dc-on-dark-faint)' }}>·</span>
            <span className="inline-flex items-center gap-2" style={{ color: '#A5B4FC' }}>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: '#A5B4FC', boxShadow: '0 0 8px #A5B4FC' }}
              />
              QUOTING NOW
            </span>
          </div>
        </div>

        {/* Main 2-col split */}
        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-start">
          {/* LEFT: copy */}
          <div className="relative">
            <h1
              className="dc-display"
              style={{
                color: 'var(--dc-on-dark)',
                fontSize: 'clamp(48px, 7vw, 92px)',
                lineHeight: 0.96,
                fontWeight: 600,
                letterSpacing: '-0.045em',
              }}
            >
              You built the<br />
              business.<br />
              We{' '}
              <span className="relative inline-block align-baseline" style={{ minWidth: '2ch' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIdx}
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -18, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                    className="inline-block"
                    style={{
                      fontFamily: 'var(--dc-font-serif-italic)',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: '#A5B4FC',
                    }}
                  >
                    {ROTATING_WORDS[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
              {' '}it.
            </h1>

            <p
              className="mt-8 max-w-[460px] text-[16px] leading-[1.55]"
              style={{ color: 'var(--dc-on-dark-muted)', fontFamily: 'var(--dc-font-body)' }}
            >
              Payments + revenue-based capital, in one stack. Process from{' '}
              <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>
                $5,000 to $500,000+
              </strong>{' '}
              monthly and unlock funding underwritten off your deposits — not your FICO,
              not your collateral, not a call center's script. Median factor{' '}
              <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>1.18×</strong>.
              Median time to funds,{' '}
              <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>24 hours</strong>.
            </p>

            <div className="mt-9 flex items-center gap-3 flex-wrap">
              <Link to="/apply" className="dc-btn-primary dc-lg">
                Get Funded
                <span aria-hidden style={{ marginLeft: 2 }}>→</span>
              </Link>
              <Link to="/calculator" className="dc-btn-secondary dc-on-dark dc-lg">
                See how pricing works
              </Link>
            </div>

            {/* Stats strip */}
            <div
              className="mt-12 pt-7 grid grid-cols-3 gap-6 max-w-[480px]"
              style={{ borderTop: '1px solid var(--dc-rule-on-dark)' }}
            >
              <Stat label="TODAY'S MEDIAN" big="1.18×" unit="factor" />
              <Stat label="TIME TO FUNDS" big="24h" unit="median" />
              <Stat label="SOFT-PULL" big="Yes" unit="only" />
            </div>
          </div>

          {/* RIGHT: dashboard preview, framed */}
          <div className="relative lg:pt-2">
            <div
              className="relative rounded-[12px] overflow-hidden flex items-center justify-center"
              style={{
                border: '1px solid var(--dc-rule-on-dark)',
                background: 'rgba(247, 245, 240, 0.02)',
                aspectRatio: '4 / 3',
                minHeight: 380,
                padding: '40px 32px',
              }}
            >
              <div
                style={{ width: '100%', maxWidth: 480 }}
                className="jh-dp-fit"
              >
                <DashboardPreview />
              </div>
              <style>{`.jh-dp-fit .dp-wrapper { transform: none !important; }`}</style>
            </div>
            {/* Caption */}
            <div className="mt-4 flex justify-end">
              <span
                className="text-[11px] tracking-[0.14em]"
                style={{
                  fontFamily: 'var(--dc-font-mono)',
                  color: 'var(--dc-on-dark-faint)',
                  textTransform: 'uppercase',
                }}
              >
                FIG. 01 — THE OFFER, IN MOTION
              </span>
            </div>
          </div>
        </div>

        {/* Bottom hairline + meta strip */}
        <div
          className="mt-14 pt-5 pb-7 flex items-center justify-between gap-4 flex-wrap"
          style={{ borderTop: '1px solid var(--dc-rule-on-dark)' }}
        >
          <span
            className="text-[11px] tracking-[0.18em]"
            style={{
              fontFamily: 'var(--dc-font-mono)',
              color: 'var(--dc-on-dark-faint)',
              textTransform: 'uppercase',
            }}
          >
            SCROLL — THE NUMBERS ↓
          </span>
          <span
            className="text-[11px] tracking-[0.18em]"
            style={{
              fontFamily: 'var(--dc-font-mono)',
              color: 'var(--dc-on-dark-muted)',
              textTransform: 'uppercase',
            }}
          >
            $200M+ DEPLOYED · 2,850+ FUNDED · SINCE 2019
          </span>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, big, unit }: { label: string; big: string; unit: string }) {
  return (
    <div>
      <div
        className="text-[10px] tracking-[0.14em] mb-2"
        style={{
          fontFamily: 'var(--dc-font-mono)',
          color: 'var(--dc-on-dark-faint)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          style={{
            fontFamily: 'var(--dc-font-display)',
            fontWeight: 600,
            fontSize: 32,
            letterSpacing: '-0.025em',
            color: 'var(--dc-on-dark)',
            lineHeight: 1,
          }}
        >
          {big}
        </span>
        <span
          style={{
            fontFamily: 'var(--dc-font-mono)',
            fontSize: 11,
            color: 'var(--dc-on-dark-faint)',
            letterSpacing: '0.04em',
          }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

export default JuspayHero;
