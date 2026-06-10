import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ExploreFeaturesWithAI } from './ExploreFeaturesWithAI';
import { PlaidWaveLines } from './PlaidWaveLines';
import heroDavidPng from '@/app/assets/hero-david.png';
import heroDavidWebp from '@/app/assets/hero-david.webp';

/* ──────────────────────────────────────────────────────────────
   JuspayHero — Delt Pay (merchant services) home hero.
   Navy canvas. Large display H1 with italic-serif rotating verb.
   Body copy is Payments + AI focused (not Capital/lending — that
   pitch lives in the dedicated CapitalCrossSell section further
   down the page). Stats strip + bottom mono ledger line.
   ────────────────────────────────────────────────────────────── */

// Payments + AI flavored verbs. 'fund' was the previous (Capital) word
// and has been removed — the merchant→Capital cross-sell lives lower on
// the page in its own section.
const ROTATING_WORDS = ['process', 'automate', 'grow', 'power'];

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
      {/* Plaid-style concentric wavy lines anchored to the top-left,
          tinted in Delt indigo. Brightens on cursor hover via an
          internal radial mask that follows the mouse. */}
      <PlaidWaveLines color="#4945ff" />

      {/* Atmospheric David — Plaid/Ben Franklin treatment: cropped low,
          desaturated, blended into the navy canvas so the copy on the
          left owns the fold. Replaces the previous animated shader. */}
      <picture>
        <source srcSet={heroDavidWebp} type="image/webp" />
        <img
          src={heroDavidPng}
          alt=""
          aria-hidden
          className="pointer-events-none select-none hidden lg:block absolute"
          style={{
            right: -60,
            bottom: -40,
            height: '78%',
            width: 'auto',
            objectFit: 'contain',
            objectPosition: 'right bottom',
            opacity: 0.55,
            zIndex: 0,
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
              className="mt-8 max-w-[460px] text-[17px] leading-[1.55]"
              style={{ color: 'var(--dc-on-dark-muted)', fontFamily: 'var(--dc-font-body)' }}
            >
              Payments + AI in one stack —{' '}
              <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>
                0% processing fees — yes really
              </strong>{' '}
              with cash discount.
            </p>

            {/* Hero CTA row — two buttons only.

                Pairing rationale: "Get a quote" is the actual conversion
                action (non-negotiable), and "Explore Features with AI"
                gives curious-but-not-ready visitors a self-serve path
                that signals Delt's AI posture without leaking them to
                a competitor's site. We dropped "See how pricing works"
                from this row because it duplicated the Pricing nav link,
                split attention from "Get a quote" (same intent, weaker
                CTA), and made the row feel crowded — two CTAs read
                cleaner and give the primary action more weight. The
                /calculator route is still reachable from nav/footer. */}
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
              <div>
                <div
                  className="text-[10px] tracking-[0.14em] mb-1.5 uppercase"
                  style={{ fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-on-dark-faint)' }}
                >
                  NET PROCESSING
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
                  0%
                  <span
                    className="ml-2 text-[10px] font-normal"
                    style={{ fontFamily: 'var(--dc-font-mono)', color: 'rgba(247, 245, 240, 0.32)', letterSpacing: '0.04em' }}
                  >
                    with cash discount
                  </span>
                </div>
              </div>
              <div>
                <div
                  className="text-[10px] tracking-[0.14em] mb-1.5 uppercase"
                  style={{ fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-on-dark-faint)' }}
                >
                  SAME-DAY APPROVALS
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
                  99%
                  <span
                    className="ml-2 text-[10px] font-normal"
                    style={{ fontFamily: 'var(--dc-font-mono)', color: 'rgba(247, 245, 240, 0.32)', letterSpacing: '0.04em' }}
                  >
                    approval-based
                  </span>
                </div>
              </div>
              <div>
                <div
                  className="text-[10px] tracking-[0.14em] mb-1.5 uppercase"
                  style={{ fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-on-dark-faint)' }}
                >
                  FUNDING
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
                  Same-day
                  <span
                    className="ml-2 text-[10px] font-normal"
                    style={{ fontFamily: 'var(--dc-font-mono)', color: 'rgba(247, 245, 240, 0.32)', letterSpacing: '0.04em' }}
                  >
                    eligible accts
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom hairline + meta strip — pinned to the bottom of the viewport so the
            hero owns the first fold and the email-capture bar lives below it.
            Hidden on mobile — the decorative "SCROLL" / mono ledger line is noise on phone. */}
        <div
          className="hidden md:flex mt-auto pt-5 pb-6 items-center justify-start gap-4 flex-wrap"
          style={{ borderTop: '1px solid var(--dc-rule-on-dark)' }}
        >
          <span
            className="text-[11px] tracking-[0.18em]"
            style={{
              fontFamily: 'var(--dc-font-mono)',
              color: 'var(--dc-on-dark-muted)',
              textTransform: 'uppercase',
            }}
          >
            0% NET PROCESSING · SAME-DAY DEPOSITS
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
      {/* Value + caveat stacked vertically so all three stats read with
          identical visual weight regardless of token length. "Same-day"
          no longer wraps next to its caveat, so 0% / Same-day / Instant
          all sit on one line at the same size and weight. */}
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

export default JuspayHero;
