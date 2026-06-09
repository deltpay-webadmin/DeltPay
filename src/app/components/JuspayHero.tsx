import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { HeroShaderBackground } from './HeroShaderBackground';
import { ExploreFeaturesWithAI } from './ExploreFeaturesWithAI';
import heroDavidPng from '@/app/assets/hero-david.png';
import heroDavidWebp from '@/app/assets/hero-david.webp';

/* ──────────────────────────────────────────────────────────────
   JuspayHero — Delt Pay (merchant services) home hero.
   Navy canvas with live shader. Two-column desktop layout: copy
   left, engraved Michelangelo David holding a Verifone VP550 on
   the right — the Delt mark that ties "you built the business"
   to its visual rhyme (the craftsman + his tool). Mobile collapses
   David to a low-opacity wash behind the type. Plaid-style "Built
   with" partner ledger pins the bottom of the hero for credibility.
   ────────────────────────────────────────────────────────────── */

const ROTATING_WORDS = ['process', 'automate', 'grow', 'power'];

// Plaid-style "Built with" partner ledger — names only, JetBrains Mono,
// pinned to the bottom-left of the hero so it never touches David's hand.
const HERO_PARTNERS = [
  'Verifone',
  'Paysafe',
  'Global Payments',
  'PAX',
  'Korona POS',
  'Plaid',
];

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
        marginTop: -64,
        paddingTop: 64,
        minHeight: 'calc(100vh / var(--site-zoom, 1))',
      }}
    >
      {/* Live shader gradient — Delt indigo, animated */}
      <HeroShaderBackground />

      {/* David — desktop right-side. Absolutely positioned against the
          hero section itself so he can bleed to the right edge and the
          bottom while the copy column keeps its natural rhythm inside
          the max-width container. */}
      <picture>
        <source srcSet={heroDavidWebp} type="image/webp" />
        <img
          src={heroDavidPng}
          alt=""
          aria-hidden
          className="pointer-events-none select-none hidden lg:block absolute"
          style={{
            // Plaid-Ben treatment: low + cropped low, blends into navy, no portrait halo.
            right: -60,
            bottom: -40,
            height: '78%',
            width: 'auto',
            objectFit: 'contain',
            objectPosition: 'right bottom',
            opacity: 0.55,
            zIndex: 0,
            // Desaturate + push toward the indigo of the canvas so David reads as
            // atmosphere, not as a separate portrait.
            filter: 'grayscale(0.85) saturate(0.6) brightness(0.85) hue-rotate(210deg)',
            mixBlendMode: 'luminosity',
            WebkitMaskImage:
              'linear-gradient(90deg, transparent 0%, #000 42%, #000 100%), linear-gradient(180deg, transparent 0%, #000 12%, #000 100%)',
            maskImage:
              'linear-gradient(90deg, transparent 0%, #000 42%, #000 100%), linear-gradient(180deg, transparent 0%, #000 12%, #000 100%)',
            WebkitMaskComposite: 'source-in',
            maskComposite: 'intersect',
          }}
        />
      </picture>
      {/* Mobile / tablet David wash — sits behind copy at low opacity so
          the type still owns the fold without losing the brand cue. */}
      <picture>
        <source srcSet={heroDavidWebp} type="image/webp" />
        <img
          src={heroDavidPng}
          alt=""
          aria-hidden
          className="pointer-events-none select-none lg:hidden absolute"
          style={{
            right: -100,
            bottom: -20,
            height: '70%',
            width: 'auto',
            opacity: 0.22,
            zIndex: 0,
            filter: 'grayscale(0.85) saturate(0.6) brightness(0.85) hue-rotate(210deg)',
            mixBlendMode: 'luminosity',
            WebkitMaskImage:
              'linear-gradient(90deg, transparent 0%, #000 55%, #000 100%)',
            maskImage:
              'linear-gradient(90deg, transparent 0%, #000 55%, #000 100%)',
          }}
        />
      </picture>

      <div className="relative z-[1] mx-auto w-full max-w-[1320px] px-6 lg:px-10 pt-8 lg:pt-10 pb-0 flex-1 flex flex-col">
        {/* Copy column — capped at 58% on desktop so David has the
            right half of the hero to himself, full width on mobile. */}
        <div className="mt-8 lg:mt-10">
          <div className="relative lg:max-w-[58%]">
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
              className="mt-8 max-w-[460px] text-[17px] leading-[1.55]"
              style={{ color: 'var(--dc-on-dark-muted)', fontFamily: 'var(--dc-font-body)' }}
            >
              Payments + AI in one stack —{' '}
              <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>
                0% processing fees — yes really
              </strong>{' '}
              with cash discount.
            </p>

            <div className="mt-9 flex items-center gap-4 flex-wrap">
              <Link
                to="/get-a-quote"
                className="dc-btn-primary dc-lg"
                style={{ fontSize: 16, fontWeight: 600, padding: '18px 30px', minHeight: 52 }}
              >
                Get a quote
                <span aria-hidden style={{ marginLeft: 2 }}>→</span>
              </Link>
              <ExploreFeaturesWithAI quiet />
            </div>

            {/* Stats strip — desktop / tablet (3-col) */}
            <div
              className="hidden md:grid mt-12 pt-7 grid-cols-3 gap-8 max-w-[540px]"
              style={{ borderTop: '1px solid var(--dc-rule-on-dark)' }}
            >
              <Stat label="NET PROCESSING" big="0%" unit="cash discount" />
              <Stat label="SAME-DAY APPROVALS" big="99%" unit="approval-based" />
              <Stat label="FUNDING" big="Same-day" unit="eligible accts" />
            </div>

            {/* Stats strip — mobile (stacked, no overlap) */}
            <div
              className="md:hidden mt-10 pt-6 space-y-5"
              style={{ borderTop: '1px solid var(--dc-rule-on-dark)' }}
            >
              <MobileStat label="NET PROCESSING" big="0%" unit="with cash discount" />
              <MobileStat label="SAME-DAY APPROVALS" big="99%" unit="approval-based" />
              <MobileStat label="FUNDING" big="Same-day" unit="eligible accts" />
            </div>
          </div>
        </div>

        {/* Plaid-style "Built with" partner ledger + mono meta line.
            Anchored at the bottom-left half so it never crowds David. */}
        <div
          className="hidden md:block mt-auto pt-5 pb-6"
          style={{ borderTop: '1px solid var(--dc-rule-on-dark)' }}
        >
          <div
            className="flex items-center gap-x-6 gap-y-2 flex-wrap"
            style={{
              maxWidth: '62%',
              fontFamily: 'var(--dc-font-mono)',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ color: 'var(--dc-on-dark-faint)' }}>Built with</span>
            {HERO_PARTNERS.map((p) => (
              <span
                key={p}
                style={{
                  color: 'var(--dc-on-dark-muted)',
                  fontWeight: 600,
                }}
              >
                {p}
              </span>
            ))}
          </div>
          <div
            className="mt-4"
            style={{
              fontFamily: 'var(--dc-font-mono)',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--dc-on-dark-faint)',
            }}
          >
            0% NET PROCESSING · SAME-DAY DEPOSITS
          </div>
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
      <div
        style={{
          fontFamily: 'var(--dc-font-display)',
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: '-0.025em',
          color: 'var(--dc-on-dark)',
          lineHeight: 1.05,
          whiteSpace: 'nowrap',
        }}
      >
        {big}
      </div>
      <div
        className="mt-1.5"
        style={{
          fontFamily: 'var(--dc-font-mono)',
          fontSize: 10,
          color: 'rgba(247, 245, 240, 0.32)',
          letterSpacing: '0.04em',
        }}
      >
        {unit}
      </div>
    </div>
  );
}

function MobileStat({ label, big, unit }: { label: string; big: string; unit: string }) {
  return (
    <div>
      <div
        className="text-[10px] tracking-[0.14em] mb-1.5 uppercase"
        style={{ fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-on-dark-faint)' }}
      >
        {label}
      </div>
      <div
        className="text-3xl font-semibold"
        style={{
          fontFamily: 'var(--dc-font-display)',
          letterSpacing: '-0.025em',
          color: 'var(--dc-on-dark)',
          lineHeight: 1,
        }}
      >
        {big}
        <span
          className="ml-2 text-[10px] font-normal"
          style={{ fontFamily: 'var(--dc-font-mono)', color: 'rgba(247, 245, 240, 0.32)', letterSpacing: '0.04em' }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

export default JuspayHero;
