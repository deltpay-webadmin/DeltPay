import { Link } from 'react-router';
import { PlaidWaveLines } from './PlaidWaveLines';
import { ExploreFeaturesWithAI } from './ExploreFeaturesWithAI';
import heroDavidPng from '@/app/assets/hero-david-cutout.png';
import heroDavidWebp from '@/app/assets/hero-david-cutout.webp';

/* ──────────────────────────────────────────────────────────────
   JuspayHero — Delt Pay home hero.

   Restyled to the premium Delt Capital hero language while keeping
   the SAME engraving image and the SAME headline / sub-head copy:

   1. Deep-navy printed field (--dc-bg-navy) with a single soft
      indigo highlight behind the figure — the flat purple wash is
      gone in favour of the darker, more premium Capital canvas.
   2. A live deal ticker rides the top of the fold (dc-ticker),
      the same proof-strip that anchors the Capital hero.
   3. The whole headline is a light indigo→periwinkle gradient
      (not just the verb), with the italic serif phrase carrying a
      deeper accent gradient — mirroring "We *fund* it."
   4. A three-up stat rail sits at the foot of the fold, matching
      the Capital hero's FUNDING RANGE / TIME TO FUNDS / CREDIT PULL
      rhythm — here tuned to Delt Pay's proof points.
   5. The engraving (David) stays exactly as before: a clean cutout
      on the right, in front of the contour field, behind the copy.
   ────────────────────────────────────────────────────────────── */

/* Illustrative live-proof entries, in the Capital deal-ticker format. */
const TICKER = [
  { name: 'Sunset Café', metric: '$0 fees', status: 'Live' },
  { name: 'River Ink Tattoo', metric: '$38K/mo', status: 'Settled' },
  { name: 'Maple & Co.', metric: 'Same-day payout', status: 'Wired' },
  { name: 'Harbor Goods', metric: '2,140 txns', status: 'Cleared' },
  { name: 'Bloom Floral', metric: '$12K/wk', status: 'Settled' },
  { name: 'Northside Auto', metric: '$0 fees', status: 'Live' },
];

/* Fold stat rail — Delt Pay proof points in the Capital stat rhythm. */
const STATS = [
  { label: 'Processing fees', value: '0%', unit: 'with pass-through' },
  { label: 'Settlement', value: 'Same day', unit: 'typical' },
  { label: 'Hardware', value: 'Included', unit: 'every plan' },
];

function TickerRow() {
  return (
    <>
      {TICKER.map((t, i) => (
        <span key={i}>
          <span style={{ color: 'var(--dc-on-dark-muted)' }}>{t.name}</span>
          <span style={{ color: 'var(--dc-indigo-soft)' }}>{t.metric}</span>
          <span className="dc-pill">{t.status}</span>
          <span className="dc-ticker__sep" aria-hidden>/</span>
        </span>
      ))}
    </>
  );
}

export function JuspayHero() {
  return (
    <section
      data-hero-section
      className="relative w-full overflow-hidden flex flex-col"
      style={{
        // Premium Delt Capital canvas: deep navy with a single soft
        // indigo highlight top-right (behind the figure) and a cooler
        // shadow lower-left — a printed field, not a flat block.
        background: `
          radial-gradient(110% 75% at 86% 16%, rgba(73, 69, 255, 0.28) 0%, transparent 56%),
          radial-gradient(90% 70% at 4% 96%, rgba(4, 6, 24, 0.65) 0%, transparent 60%),
          linear-gradient(160deg, #080A28 0%, #0B0E30 55%, #0E1140 100%)
        `,
        color: 'var(--dc-on-dark)',
        marginTop: -64,
        paddingTop: 64,
        minHeight: 'calc(100vh / var(--site-zoom, 1))',
      }}
    >
      {/* ───── Live deal ticker — rides just below the nav ───── */}
      <div className="dc-ticker relative z-[3]" aria-label="Recent Delt Pay activity">
        <div className="dc-ticker__track">
          <TickerRow />
          <TickerRow />
        </div>
      </div>

      {/* Contour texture — whisper, not pattern. Even quieter on mobile. */}
      <div className="hidden lg:block absolute inset-0" aria-hidden style={{ zIndex: 0 }}>
        <PlaidWaveLines color="#4945ff" baseOpacity={0.12} hoverOpacity={0.5} />
      </div>
      <div className="lg:hidden absolute inset-0" aria-hidden style={{ zIndex: 0 }}>
        <PlaidWaveLines color="#4945ff" baseOpacity={0.06} hoverOpacity={0.2} />
      </div>

      {/* David — clean cutout, no rectangle, no masks, no shadow.
          Just the engraving sitting on the gradient field.
          z-index 1 keeps him IN FRONT of the contour field but BEHIND
          the headline copy at z-[2]. */}
      <picture>
        <source srcSet={heroDavidWebp} type="image/webp" />
        <img
          src={heroDavidPng}
          alt=""
          aria-hidden
          className="pointer-events-none select-none hidden lg:block absolute"
          style={{
            // Slight negative right offset lets the figure bleed a touch
            // off the right edge, which shifts the POS terminal clear of
            // the headline copy without shrinking David.
            right: '-4%',
            bottom: 0,
            // Drive sizing by HEIGHT so the engraving fills the hero
            // vertically — head near the top, shoulders to the bottom.
            // The cutout's transparent left half lands behind the headline
            // column and never collides with copy.
            height: '78%',
            width: 'auto',
            maxWidth: 'none',
            zIndex: 1,
            opacity: 1,
            objectFit: 'contain',
            objectPosition: 'right bottom',
          }}
        />
      </picture>

      {/* Mobile David — centered, full-bust visible behind the copy.
          Sits behind a darkening gradient so the headline stays legible. */}
      <div
        className="lg:hidden absolute pointer-events-none"
        aria-hidden
        style={{
          right: '-20%',
          bottom: 0,
          width: '120%',
          height: '80%',
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        <picture>
          <source srcSet={heroDavidWebp} type="image/webp" />
          <img
            src={heroDavidPng}
            alt=""
            className="pointer-events-none select-none"
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              height: '100%',
              width: 'auto',
              opacity: 0.5,
              objectFit: 'contain',
              objectPosition: 'right bottom',
            }}
          />
        </picture>
        {/* Left-side darkening veil so copy stays readable */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(8,10,40,0.94) 0%, rgba(8,10,40,0.68) 30%, rgba(8,10,40,0.2) 65%, rgba(8,10,40,0) 100%)',
          }}
        />
      </div>

      {/* ───── Copy block ───── */}
      <div className="relative z-[2] mx-auto w-full max-w-[1320px] px-6 lg:px-10 pt-8 lg:pt-10 pb-0 flex-1 flex flex-col">
        <div className="mt-8 lg:mt-14">
          <h1
            className="dc-display"
            style={{
              fontSize: 'clamp(44px, 6.6vw, 88px)',
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: '-0.05em',
              maxWidth: '14ch',
              paddingBottom: '0.18em',
              // Full-headline light gradient — indigo → periwinkle —
              // the premium Capital treatment applied to the whole line.
              background:
                'linear-gradient(112deg, #E7EBFF 0%, #C6CEFF 44%, #AEB8FF 74%, #BEAEFF 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            You built it from nothing.<br />
            We make sure{' '}
            <span
              className="inline-block align-baseline"
              style={{
                fontFamily: 'var(--dc-font-serif-italic)',
                fontStyle: 'italic',
                fontWeight: 400,
                // Deeper accent gradient on the italic verb so it pops
                // against the lighter headline — the way Capital sets
                // "We *fund* it."
                background:
                  'linear-gradient(95deg, #6D74F5 0%, #8E8BFF 55%, #B7A6FF 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                paddingBottom: '0.12em',
              }}
            >
              nothing stops it.
            </span>
          </h1>

          <p
            className="mt-7 max-w-[540px] text-[18px] leading-[1.55]"
            style={{ color: 'rgba(247, 245, 240, 0.75)', fontFamily: 'var(--dc-font-body)' }}
          >
            Payments, capital, and AI in one stack —{' '}
            <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>
              0% processing fees
            </strong>
            ,{' '}
            <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>
              same-day funding
            </strong>
            , and business intelligence built in.
          </p>

          {/* CTAs — primary button + the iridescent AI pill. */}
          <div className="mt-10 flex items-center gap-7 flex-wrap">
            <Link
              to="/get-a-quote"
              className="dc-btn-primary dc-lg"
              style={{ fontSize: 16, fontWeight: 600, padding: '18px 30px', minHeight: 52 }}
            >
              Get a quote
              <span aria-hidden style={{ marginLeft: 4 }}>→</span>
            </Link>
            <ExploreFeaturesWithAI />
          </div>
        </div>

        {/* ───── Fold stat rail — Capital-style three-up ───── */}
        <div
          className="mt-auto pt-8 lg:pt-9 pb-10 lg:pb-12"
          style={{ borderTop: '1px solid var(--dc-rule-on-dark)', maxWidth: 620 }}
        >
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="dc-eyebrow dc-bare" style={{ marginBottom: 10 }}>
                  {s.label}
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span
                    className="dc-stat-num"
                    style={{ fontSize: 'clamp(24px, 3vw, 40px)', color: 'var(--dc-on-dark)' }}
                  >
                    {s.value}
                  </span>
                  <span className="dc-stat-unit">{s.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover style for the quiet link — defined inline so it travels
          with the component. */}
      <style>{`
        [data-hero-section] .dc-quiet-link:hover {
          color: #fff !important;
        }
        [data-hero-section] .dc-ticker { padding-left: 0; }
      `}</style>
    </section>
  );
}

export default JuspayHero;
