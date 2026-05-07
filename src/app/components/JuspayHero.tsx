import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { HeroShaderBackground } from './HeroShaderBackground';

/* ──────────────────────────────────────────────────────────────
   JuspayHero — Delt Capital style
   Navy canvas. Mono volume eyebrow. Large display H1 with
   italic-serif rotating word. Stats strip + bottom hairline +
   meta strip ("SCROLL — THE NUMBERS ↓" · ledger line).
   ────────────────────────────────────────────────────────────── */

const ROTATING_WORDS = ['fund', 'back', 'build', 'power'];

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
      data-hero-section
      className="relative w-full overflow-hidden flex flex-col"
      style={{
        background: 'var(--dc-bg-navy)',
        color: 'var(--dc-on-dark)',
        // Bleed the hero (and its animated shader) UP behind the sticky 64px
        // global nav so the liquid-glass header has the gradient behind it
        // from the first paint instead of the white body. The negative top
        // margin pulls the section under the nav; the matching padding-top
        // keeps inner content visually anchored where it was before.
        marginTop: -64,
        paddingTop: 64,
        // Fill the viewport on load so the email-capture / next section sits
        // below the fold. Account for the site-wide CSS `zoom` applied at the
        // body level — `vh` is evaluated in the un-zoomed coordinate space,
        // so dividing by --site-zoom keeps the hero exactly one physical
        // viewport tall regardless of the active zoom factor. We no longer
        // subtract 64px (the nav) because the hero now extends behind it.
        minHeight: 'calc(100vh / var(--site-zoom, 1))',
      }}
    >
      {/* Live shader gradient — Delt indigo, animated */}
      <HeroShaderBackground />

      <div className="relative z-[1] mx-auto w-full max-w-[1320px] px-6 lg:px-10 pt-8 lg:pt-10 pb-0 flex-1 flex flex-col">
        {/* Top centered mono volume eyebrow removed per user request
            (was: VOL. VII · Q2 2026 · DIRECT FUNDING · EST. 2019 · QUOTING NOW). */}

        {/* Single-column copy block — the right-side visual was removed
            (no dashboard, no hero image). The animated shader gradient is
            the visual; the typography carries the fold. */}
        <div className="mt-8 lg:mt-10">
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

        </div>

        {/* Bottom hairline + meta strip — pinned to the bottom of the viewport so the
            hero owns the first fold and the email-capture bar lives below it. */}
        <div
          className="mt-auto pt-5 pb-6 flex items-center justify-between gap-4 flex-wrap"
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
