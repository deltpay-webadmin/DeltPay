import { Link } from 'react-router';
import { PlaidWaveLines } from './PlaidWaveLines';
import heroDavidPng from '@/app/assets/hero-david-cutout.png';
import heroDavidWebp from '@/app/assets/hero-david-cutout.webp';

/* ──────────────────────────────────────────────────────────────
   JuspayHero — Delt Pay home hero, rebuilt to the Plaid bar.

   Design principles (vs. the previous version):
   1. Painted background. A hand-tuned indigo→violet linear
      gradient plus two soft radial vignettes act as a printed
      color field. The flat #080A28 navy is gone.
   2. Wave-line contour field is texture, not feature — opacity
      drops from 70% to ~14%. You should sense it, not read it.
   3. A single faint horizontal "shelf" gradient anchors the
      lower third (the way Plaid puts a metallic bar across
      Franklin's chest).
   4. David is the focal subject. Natural engraving tones with
      a duotone overlay (indigo shadows → warm highlights) so
      he picks up the brand color without going monochrome.
      Soft drop-shadow on the copy side gives him dimensional
      separation from the field.
   5. Typography: tighter tracking (-0.055em), tighter line-
      height (0.94), gradient shimmer on the italic verb.
   6. The fold owns ONLY five things: wordmark (in nav),
      headline, sub, primary CTA, quiet secondary text link.
      Stats and mono ledger are removed — they belong in the
      sections below, not the fold.
   ────────────────────────────────────────────────────────────── */

export function JuspayHero() {
  return (
    <section
      data-hero-section
      className="relative w-full overflow-hidden flex flex-col"
      style={{
        // Painted color field — deep indigo top-left → richer violet
        // bottom-right. The two radial vignettes (one warm highlight
        // behind David, one cooler shadow in the lower-left) give the
        // canvas a "printed" feel rather than a flat color block.
        background: `
          radial-gradient(120% 80% at 88% 18%, rgba(120, 95, 255, 0.35) 0%, transparent 55%),
          radial-gradient(90% 70% at 6% 92%, rgba(20, 18, 70, 0.55) 0%, transparent 60%),
          linear-gradient(135deg, #0B0D33 0%, #14123F 38%, #1C1856 70%, #221C66 100%)
        `,
        color: 'var(--dc-on-dark)',
        marginTop: -64,
        paddingTop: 64,
        minHeight: 'calc(100vh / var(--site-zoom, 1))',
      }}
    >
      {/* Contour texture — whisper, not pattern. */}
      <PlaidWaveLines color="#4945ff" baseOpacity={0.14} hoverOpacity={0.55} />

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
            right: -20,
            bottom: 0,
            height: '92%',
            width: 'auto',
            zIndex: 1,
            objectFit: 'contain',
            objectPosition: 'right bottom',
          }}
        />
      </picture>

      {/* Mobile David — simpler, lower opacity, no duotone overlay. */}
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
            opacity: 0.5,
            zIndex: 1,
          }}
        />
      </picture>

      {/* ───── Copy block ───── */}
      <div className="relative z-[2] mx-auto w-full max-w-[1320px] px-6 lg:px-10 pt-8 lg:pt-10 pb-0 flex-1 flex flex-col">
        <div className="mt-10 lg:mt-16">
          <h1
            className="dc-display"
            style={{
              color: 'var(--dc-on-dark)',
              fontSize: 'clamp(44px, 6.6vw, 88px)',
              lineHeight: 0.96,
              fontWeight: 600,
              letterSpacing: '-0.05em',
              maxWidth: '14ch',
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
                // Gradient shimmer — indigo → lavender → soft pink, the
                // way Plaid does "data into revolutionary".
                background:
                  'linear-gradient(95deg, #6366F1 0%, #A5B4FC 45%, #E9D5FF 85%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
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
            , and intelligence that grows with your business.
          </p>

          {/* CTAs — primary button + quiet text link. The secondary
              gets out of the way so the primary owns the eye. */}
          <div className="mt-10 flex items-center gap-7 flex-wrap">
            <Link
              to="/get-a-quote"
              className="dc-btn-primary dc-lg"
              style={{ fontSize: 16, fontWeight: 600, padding: '18px 30px', minHeight: 52 }}
            >
              Get a quote
              <span aria-hidden style={{ marginLeft: 4 }}>→</span>
            </Link>
            <Link
              to="/delt-ai-chat"
              className="dc-quiet-link"
              style={{
                color: 'rgba(247, 245, 240, 0.78)',
                fontFamily: 'var(--dc-font-body)',
                fontSize: 15,
                fontWeight: 500,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'color 180ms ease',
              }}
            >
              Explore features
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hover style for the quiet link — defined inline so it travels
          with the component. */}
      <style>{`
        [data-hero-section] .dc-quiet-link:hover {
          color: #fff !important;
        }
      `}</style>
    </section>
  );
}

export default JuspayHero;
