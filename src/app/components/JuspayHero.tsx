import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { HeroShaderBackground } from './HeroShaderBackground';
import { ExploreFeaturesWithAI } from './ExploreFeaturesWithAI';

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
              Payments + AI intelligence, in one stack.{' '}
              <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>
                0% net processing fees
              </strong>{' '}
              with cash discount.{' '}
              <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>Same-day deposits</strong>{' '}
              and{' '}
              <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>instant onboarding</strong>{' '}
              — not a call center's script. Delt Lens tells you what's working, what's not,
              and what to do next. Hardware that works on day one.
            </p>

            <p
              className="mt-3 max-w-[460px] text-[11px] leading-[1.55]"
              style={{ color: 'var(--dc-on-dark-faint)', fontFamily: 'var(--dc-font-body)' }}
            >
              Instant onboarding and same-day deposits are subject to underwriting approval
              and not available to all merchants.
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
            <div className="mt-9 flex items-center gap-3 flex-wrap">
              <Link to="/get-a-quote" className="dc-btn-primary dc-lg">
                Get a quote
                <span aria-hidden style={{ marginLeft: 2 }}>→</span>
              </Link>
              <ExploreFeaturesWithAI />
            </div>

            {/* Stats strip — desktop / tablet (3-col) */}
            <div
              className="hidden md:grid mt-12 pt-7 grid-cols-3 gap-6 max-w-[480px]"
              style={{ borderTop: '1px solid var(--dc-rule-on-dark)' }}
            >
              <Stat label="NET PROCESSING" big="0%" unit="with cash discount" />
              <Stat label="DEPOSITS" big="Same-day" unit="eligible accts" />
              <Stat label="ONBOARDING" big="Instant" unit="approval-based" />
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
                    className="ml-2 text-xs font-normal"
                    style={{ fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-on-dark-faint)', letterSpacing: '0.04em' }}
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
                  DEPOSITS
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
                    className="ml-2 text-xs font-normal"
                    style={{ fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-on-dark-faint)', letterSpacing: '0.04em' }}
                  >
                    eligible accts
                  </span>
                </div>
              </div>
              <div>
                <div
                  className="text-[10px] tracking-[0.14em] mb-1.5 uppercase"
                  style={{ fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-on-dark-faint)' }}
                >
                  ONBOARDING
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
                  Instant
                  <span
                    className="ml-2 text-xs font-normal"
                    style={{ fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-on-dark-faint)', letterSpacing: '0.04em' }}
                  >
                    approval-based
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
          className="hidden md:flex mt-auto pt-5 pb-6 items-center justify-between gap-4 flex-wrap"
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
            0% NET PROCESSING · SAME-DAY DEPOSITS · SINCE 2019
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
