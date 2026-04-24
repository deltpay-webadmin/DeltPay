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
  // Letter animation happens in the 0.20–0.65 slice of scroll progress
  const animStart = 0.2;
  const animEnd = 0.65;
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

  // Base44-style sunset: gradient strip starts BELOW the viewport (only bottom
  // glow peeking), then rises UP through the viewport as you scroll. At the
  // end, the saturated bottom has passed the top — a soft top-glow remains.
  // IMPORTANT: the gradient strip is 320vh tall and we translate between
  // +20vh and -220vh, which keeps its bottom edge ALWAYS at or below the
  // bottom of the 100vh sticky viewport (320 - 220 = 100vh), so the blue
  // wash always reaches the bottom of the visual area — no hard edge.
  const gradientY = useTransform(scrollYProgress, [0, 1], ['20vh', '-220vh']);

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
        .lsrt-outer {
          position: relative;
          height: 320vh;
          background: #FFFFFF;
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
             the outer section scrolls proportionally. */
          .lsrt-outer { height: 400vh; }
          .lsrt-sticky { height: 125vh; }
        }

        /* The sunset: a tall vertical gradient strip positioned to start
           below the viewport. As scroll progresses, Framer Motion translates
           it upward so the saturated bottom glow enters, fills the frame,
           then exits the top leaving a soft residue. Much more saturated
           than Base44's original (indigo reads softer than orange) so the
           horizon is unmistakable. */
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
          background:
            linear-gradient(180deg,
              rgba(255,255,255,0)      0%,
              rgba(73,69,255,0.04)     5%,
              rgba(73,69,255,0.10)    12%,
              rgba(73,69,255,0.18)    20%,
              rgba(73,69,255,0.28)    30%,
              rgba(73,69,255,0.38)    42%,
              rgba(73,69,255,0.46)    55%,
              rgba(73,69,255,0.52)    70%,
              rgba(73,69,255,0.58)    85%,
              rgba(73,69,255,0.58)   100%);
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
          font-size: clamp(2.75rem, 7vw, 5.5rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.045em;
          margin: 0;
        }
      `}</style>
    </>
  );
}
