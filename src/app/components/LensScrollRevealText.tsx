import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';

/* ─────────────────────────────────────────────────────────────
   LENS HORIZON GRADIENT + SCROLL-REVEAL HEADLINE
   --------------------------------------------------------------
   Base44-style "sunset" that behaves like Delt's indigo.
   The outer container is a tall scrolling backdrop with a
   vertical gradient — warm indigo glow at the bottom fades up
   through white and back to a soft indigo glow at the top of
   the next section, like a horizon passing behind the viewport.
   The sticky inner layer pins the headline so it sits over the
   gradient at every scroll position. Letters light up word-by-
   word as the section scrolls.
   ───────────────────────────────────────────────────────────── */

const TEXT = 'Answers, not dashboards. The clarity your business deserves.';

function Word({
  word,
  progress,
  charStart,
  charEnd,
  totalChars,
}: {
  word: string;
  progress: MotionValue<number>;
  charStart: number;
  charEnd: number;
  totalChars: number;
}) {
  // Letter animation happens in the 0.05–0.55 slice of scroll progress.
  // Was 0.20–0.65, which left the first ~20% of the section visually dead:
  // the headline was a dim grey blob over a flat lavender wash, reading
  // as an empty band between the hero pills and the next section. Starting
  // at 0.05 means the first word is already lighting up the moment the
  // section enters the viewport, so there's always live content on screen.
  const animStart = 0.05;
  const animEnd = 0.55;
  const span = animEnd - animStart;
  const s = animStart + (charStart / totalChars) * span;
  const e = Math.min(animStart + ((charEnd + 4) / totalChars) * span, animEnd);
  const mid = s + (e - s) * 0.35;
  // Dim → indigo → navy (word ignites as it enters the horizon). When the
  // background gets saturated purple later, we overlay a mix-blend so the
  // navy text stays readable as white against the deep indigo.
  const color = useTransform(progress, [s, mid, e], ['#D7D5F3', '#4945FF', '#041E42']);
  return (
    <motion.span
      style={{
        color,
        display: 'inline-block',
        marginRight: '0.3em',
        whiteSpace: 'nowrap',
      }}
    >
      {word}
    </motion.span>
  );
}

export function LensScrollRevealText() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Base44-style sunset: gradient strip starts with its saturated bottom
  // already poking into the lower third of the viewport (so the section
  // never reads as a flat empty band), then rises UP through the viewport
  // as you scroll. At the end, the saturated bottom has passed the top —
  // a soft top-glow remains.
  //
  // Was starting at +20vh (sunset entirely BELOW the viewport — first
  // chunk of scroll showed no gradient at all). Now starts at -30vh so
  // the bottom ⅔ of the viewport already shows indigo glow on entry.
  const gradientY = useTransform(scrollYProgress, [0, 1], ['-30vh', '-220vh']);

  const words = TEXT.split(' ');
  let ci = 0;
  const wordData = words.map((w) => {
    const start = ci;
    ci += w.length;
    return { word: w, charStart: start, charEnd: start + w.length - 1 };
  });
  const totalChars = ci;

  return (
    <>
      <div ref={containerRef} className="lsrt-outer">
        {/* The sticky layer contains BOTH the moving gradient and the pinned
            headline. The gradient is a tall vertical sunset strip that
            translates upward as you scroll — exactly Base44's rising-horizon
            behavior. */}
        <div className="lsrt-sticky">
          <motion.div
            className="lsrt-sunset"
            style={{ y: gradientY }}
            aria-hidden
          />
          <div className="lsrt-body">
            <p className="lsrt-text">
              {wordData.map((wd, i) => (
                <Word
                  key={i}
                  word={wd.word}
                  progress={scrollYProgress}
                  charStart={wd.charStart}
                  charEnd={wd.charEnd}
                  totalChars={totalChars}
                />
              ))}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        /* The outer scroll container provides vertical room for the
           rising-sun effect. Taller = more time to reveal the gradient. */
        /* overflow:hidden on the outer would break position:sticky. Instead
           we mask the moving sunset inside .lsrt-sticky (which has its own
           overflow:hidden — safe because sticky clips only the viewport,
           not the parent scroll area). */
        /* NOTE: the site applies body { zoom: 0.8 } on desktop (see
           theme.css). vh units are based on the actual viewport, so a
           100vh sticky element shrinks to 80vh of visible space and
           leaves a white strip at the bottom of the visual area.
           We compensate by sizing in terms of 125vh on desktop
           (100 / 0.8 = 125) so the sticky frame visually fills the
           entire viewport. Mobile has no zoom and uses 100vh directly. */
        /* Match the lavender wash of the section above (Lens chat hero) and
           the section below (stacking panels) so this scroll-tall block no
           longer renders as a giant white slab between two purple-tinted
           sections. The moving sunset still rises through it; the soft
           lavender base just removes the visible white gap at the top of
           the section before the gradient saturates the bottom. */
        /* Shorter outer (was 320vh / 400vh) — with the headline now
           lighting up immediately and the sunset glow already in view
           on entry, we no longer need the long lead-in to reach the
           interesting state. Shorter = the dead-band feel goes away
           because the visible portion is always populated, AND the
           viewer reaches the stacking-panels section faster. */
        .lsrt-outer {
          position: relative;
          height: 240vh;
          background:
            linear-gradient(180deg,
              #EDEBFF 0%,
              #F4F2FF 18%,
              #FFFFFF 50%,
              #F4F2FF 82%,
              #EDEBFF 100%);
        }

        /* Sticky layer pins the headline AND contains the moving sunset.
           Both gradient and text scroll-track together. */
        .lsrt-sticky {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        @media (min-width: 1024px) {
          /* Desktop has body { zoom: 0.8 } — size everything at 125%
             so the sticky frame fills the full visible viewport and
             the outer section scrolls proportionally. Outer trimmed
             from 400vh to 300vh to remove the empty lead-in band. */
          .lsrt-outer { height: 300vh; }
          .lsrt-sticky { height: 125vh; }
        }

        /* The sunset: a tall vertical gradient strip positioned to start
           below the viewport. As scroll progresses, Framer Motion translates
           it upward so the saturated bottom glow enters, fills the frame,
           then exits the top leaving a soft residue.

           BANDING FIX: Many subtly-spaced color stops in a low-saturation
           lavender gradient produce visible horizontal bands on most
           displays (8-bit panels can't smoothly resolve 0.04 → 0.10 →
           0.18 alpha steps in a single hue). We replace the multi-stop
           ramp with TWO smooth stops + a tiny SVG noise mask layered on
           top to dither the transition. The result is an unmistakable
           horizon glow with no perceptible bands. */
        .lsrt-sunset {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          /* Taller than its translate range so the bottom edge never enters
             the sticky viewport. Sticky frame is up to 125vh on desktop;
             we translate from +20vh to -220vh (240vh of motion), so we need
             the strip to be at least 125 + 220 = 345vh. We use 400vh for
             comfortable buffer on desktop and it also covers mobile. */
          height: 400vh;
          pointer-events: none;
          will-change: transform;
          /* Single smooth ramp from transparent → saturated indigo.
             Two stops, one ease — no plateaus, no banding. */
          background:
            linear-gradient(180deg,
              rgba(255,255,255,0)   0%,
              rgba(73,69,255,0.58) 100%);
        }
        /* Fine-grain noise dither breaks any residual quantization
           bands on 8-bit displays. Inline SVG so no asset request,
           tiled small for grain rather than blotches, very low alpha
           so it reads as texture not noise. */
        .lsrt-sunset::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.5;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          background-size: 160px 160px;
        }

        .lsrt-body {
          max-width: 1200px;
          padding: 0 48px;
          text-align: center;
          position: relative;
          z-index: 2;
        }
        .lsrt-text {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          /* Tuned down — site-wide body { zoom: 1.08 } visually inflates
             everything ~8% beyond what the prior 0.8-zoom calibration
             expected, which was making the headline overflow on narrow
             desktops and crowd the gradient. Slightly smaller clamp +
             tighter line-height keeps the two-line headline comfortably
             inside a single screen at all widths. */
          font-size: clamp(2.25rem, 5.6vw, 4.25rem);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.04em;
          margin: 0;
          max-width: 18ch;
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </>
  );
}
