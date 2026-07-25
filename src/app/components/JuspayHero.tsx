import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ExploreFeaturesWithAI } from './ExploreFeaturesWithAI';
import heroWashingtonWebp from '@/app/assets/washington-cutout-forward.webp';

/* ──────────────────────────────────────────────────────────────
   JuspayHero — Delt Pay home hero, aligned to the Delt Capital
   hero plate.

   The visual field is a 1:1 port of deltcapital.com's hero:
   1. Engraving-plate dark: deep slate navy (#0c1a2a, banknote-
      reference) with a soft steel bloom behind the portrait and
      a whisper of indigo low-left.
   2. Banknote scanlines — fine horizontal security linework,
      like the field behind a portrait on a bill. A dim base
      always on, plus a brighter gradient copy revealed through
      a radial mask that follows the cursor.
   3. George Washington cutout (same asset as Delt Capital —
      the phone-facing-George pose) — anchored to the right edge,
      static (no parallax), with the same drop-shadow, 85% fade,
      breathing phone-spill glow, and responsive dimming
      breakpoints, sized 20% smaller than Capital's.

   Only the copy block differs: Delt Pay's headline, subhead,
   and CTAs are kept as-is.
   ────────────────────────────────────────────────────────────── */

export function JuspayHero() {
  const heroRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cursor-revealed scanline illumination (ported from Delt Capital).
  // Idle: the lit-lines layer starts fully faded out (--illum-op 0) and
  // the spotlight starts centered so that when it fades in it isn't
  // parked in a corner. On leave we don't move the spotlight — we leave
  // --mx/--my where the cursor last was and gently fade the layer out
  // in place, so it never darts to a corner.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return undefined;
    const OP_MAX = 0.155; // matches the layer's target opacity
    const sec = { x: 50, y: 40 };
    const curSec = { x: 50, y: 40 };
    let targetOp = 0;
    let curOp = 0;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      sec.x = ((e.clientX - r.left) / r.width) * 100;
      sec.y = ((e.clientY - r.top) / r.height) * 100;
      targetOp = OP_MAX;
    };
    const onEnter = () => { targetOp = OP_MAX; };
    const onLeave = () => { targetOp = 0; };
    const tick = () => {
      curSec.x += (sec.x - curSec.x) * 0.15;
      curSec.y += (sec.y - curSec.y) * 0.15;
      // Slow, symmetric opacity lerp so the fade in/out reads as a soft
      // dissolve rather than a snap.
      curOp += (targetOp - curOp) * 0.055;
      el.style.setProperty('--mx', curSec.x.toFixed(2) + '%');
      el.style.setProperty('--my', curSec.y.toFixed(2) + '%');
      el.style.setProperty('--illum-op', curOp.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      data-hero-section
      className="relative w-full overflow-hidden flex flex-col"
      style={{
        // Engraving-plate dark (Delt Capital hero field): deep slate navy
        // with a soft steel bloom behind the portrait and a whisper of
        // indigo low-left.
        backgroundColor: '#0c1a2a',
        backgroundImage:
          'radial-gradient(85% 90% at 74% 34%, rgba(43,74,114,0.42) 0%, rgba(12,26,42,0) 62%), radial-gradient(60% 70% at 8% 96%, rgba(73,69,255,0.10) 0%, rgba(12,26,42,0) 60%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'var(--dc-on-dark)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginTop: -64,
        paddingTop: 64,
        minHeight: 'calc(100vh / var(--site-zoom, 1))',
      }}
    >
      {/* Banknote scanlines — fine horizontal security linework, like the
          field behind a portrait on a bill. The mask is a centered, even
          vignette so the lines cover the whole plate uniformly and only
          soften at the very edges. */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background:
            'repeating-linear-gradient(180deg, rgba(125,160,205,0.10) 0px, rgba(125,160,205,0.10) 1px, transparent 1px, transparent 4px)',
          WebkitMaskImage:
            'radial-gradient(120% 130% at 50% 50%, black 55%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.12) 95%, transparent 100%)',
          maskImage:
            'radial-gradient(120% 130% at 50% 50%, black 55%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.12) 95%, transparent 100%)',
        }}
      />
      {/* Cursor-revealed illumination. The lines carry a cyan→sky→indigo→
          ivory gradient; two mask layers are composited with `intersect`:
          the 1px line pattern AND a large, soft regional glow that follows
          the cursor — so the lit area reads as a broad wash over the
          linework rather than a tight spotlight. */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          opacity: 'var(--illum-op, 0)',
          background:
            'linear-gradient(105deg, #6EE7F9 0%, #7DD3FC 25%, #A5B4FC 55%, #C7D2FE 78%, #F7F5F0 100%)',
          WebkitMaskImage:
            'repeating-linear-gradient(180deg, #000 0px, #000 1px, transparent 1px, transparent 4px), radial-gradient(circle 640px at var(--mx, 50%) var(--my, 40%), #000 0%, rgba(0,0,0,0.82) 32%, rgba(0,0,0,0.4) 62%, rgba(0,0,0,0.12) 84%, transparent 100%)',
          WebkitMaskRepeat: 'repeat, no-repeat',
          WebkitMaskComposite: 'source-in',
          maskImage:
            'repeating-linear-gradient(180deg, #000 0px, #000 1px, transparent 1px, transparent 4px), radial-gradient(circle 640px at var(--mx, 50%) var(--my, 40%), #000 0%, rgba(0,0,0,0.82) 32%, rgba(0,0,0,0.4) 62%, rgba(0,0,0,0.12) 84%, transparent 100%)',
          maskRepeat: 'repeat, no-repeat',
          maskComposite: 'intersect',
        }}
      />

      {/* Washington cutout — transparent WebP (phone held screen-toward-
          George), absolutely positioned on the right. Anchored to the
          section's right edge (right:0). On narrow
          viewports we push it partially off-screen and dim it so the copy
          stays readable. No parallax / scroll transform — the portrait
          sits static, matching Delt Capital. */}
      <style>{`
        @keyframes v1heroGlow { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
        /* Franklin-ratio portrait: anchored to the right so his head sits
           in the upper-right quadrant and coat/shoulders spread down and
           to the left. The wrapper shrink-wraps the img, so the phone-glow
           child can use % coordinates that track the portrait at any size.
           Mobile dim lives on the img (not the wrapper) because the wrapper
           carries an inline entrance opacity that would win otherwise. */
        .v1hero-washington {
          position: absolute;
          right: 0; bottom: 0;
          height: 60%; max-height: 540px;
          z-index: 2; pointer-events: none;
        }
        .v1hero-washington img {
          height: 100%; width: auto; display: block;
          max-width: none;
          filter: drop-shadow(0 8px 22px rgba(0,0,0,0.28));
          /* Slightly faded so the portrait supports the copy instead of
             competing with it; mobile queries below override with deeper dims. */
          opacity: 0.85;
        }
        @media (max-width: 1200px) {
          .v1hero-washington { right: 0; }
        }
        @media (max-width: 900px) {
          .v1hero-washington { right: -8%; bottom: 0; height: 66%; max-height: 496px; }
          .v1hero-washington img { opacity: 0.45; animation: none; }
        }
        @media (max-width: 560px) {
          .v1hero-washington { right: -20%; bottom: 0; height: 54%; }
          .v1hero-washington img { opacity: 0.28; }
        }
        @media (prefers-reduced-motion: reduce) {
          .v1hero-washington img { animation: none; }
          .v1hero-glow { animation: none !important; }
        }
      `}</style>
      <div
        className="v1hero-washington"
        aria-hidden
        style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1100ms ease-out 200ms',
        }}
      >
        {/* Breathing glow around the phone — the screen faces George in this
            pose, so the light reads as spill escaping past the phone's edges.
            Positioned in % of the portrait so it stays glued to the phone at
            every viewport. */}
        <div
          className="v1hero-glow"
          style={{
            position: 'absolute', left: '-3%', top: '32%', width: '46%', height: '58%',
            background:
              'radial-gradient(50% 42% at 42% 50%, rgba(129,140,248,0.28) 0%, rgba(73,69,255,0.10) 48%, rgba(12,26,42,0) 74%)',
            filter: 'blur(18px)',
            animation: 'v1heroGlow 5.5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <img src={heroWashingtonWebp} alt="" />
      </div>

      {/* ───── Copy block ───── */}
      <div className="relative z-[3] mx-auto w-full max-w-[1320px] px-6 lg:px-10 pt-8 lg:pt-10 pb-0 flex-1 flex flex-col">
        <div className="mt-10 lg:mt-16">
          <h1
            className="dc-display"
            style={{
              color: 'var(--dc-on-dark)',
              fontSize: 'clamp(44px, 6.6vw, 88px)',
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: '-0.05em',
              maxWidth: '14ch',
              // Extra bottom padding so the italic 'g/p' descenders in
              // 'nothing stops' don't get clipped by the section / next
              // block. Without this the descenders sit right on the
              // section's bottom mathematical edge.
              paddingBottom: '0.18em',
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
                  'linear-gradient(95deg, #818CF8 0%, #A5B4FC 50%, #C7D2FE 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                // Some browsers clip the painted gradient at the text
                // glyph box, cutting descenders. A tiny inline padding
                // expands the bounding box so 'g' and 'p' render fully.
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
            {/* Restored: the original iridescent "Explore Features with AI"
                pill. Opens ChatGPT in a new tab pre-seeded with a Delt
                exploration prompt — the same behavior the live site had
                before the hero rebuild. */}
            <ExploreFeaturesWithAI />
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
