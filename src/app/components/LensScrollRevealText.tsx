import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';

/* ─────────────────────────────────────────────────────────────
   LENS HORIZON GRADIENT + SCROLL-REVEAL HEADLINE
   --------------------------------------------------------------
   A Delt-palette take on Base44's orange sunrise transition.
   A crisp horizontal indigo band sits near the top of the sticky
   frame and fades to white / light-lavender below (not a blurry
   radial blob). The Lens-specific headline lights up word-by-word
   as the section scrolls past.
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
  // Letter animation happens in the 0.15–0.60 slice of scroll progress
  const animStart = 0.15;
  const animEnd = 0.60;
  const span = animEnd - animStart;
  const s = animStart + (charStart / totalChars) * span;
  const e = Math.min(animStart + ((charEnd + 4) / totalChars) * span, animEnd);
  const mid = s + (e - s) * 0.35;
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
        <div className="lsrt-sticky">
          {/* Painterly horizon — crisp indigo band up top, smooth fade down */}
          <div className="lsrt-horizon" aria-hidden>
            <div className="lsrt-band" />
            <div className="lsrt-core" />
            <div className="lsrt-fade" />
          </div>

          {/* Headline — sits in the lower half, well clear of nav */}
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
        .lsrt-outer {
          position: relative;
          height: 360vh;
          background: #FFFFFF;
        }
        .lsrt-sticky {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          display: grid;
          grid-template-rows: 1fr 1fr;  /* horizon top half, text bottom half */
        }

        /* ── Painterly horizon stack ──────────────────────────────── */
        .lsrt-horizon {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 60vh;
          pointer-events: none;
        }
        /* Wide soft band — faint wash across the full width */
        .lsrt-band {
          position: absolute;
          left: -5%; right: -5%;
          top: 8vh;
          height: 32vh;
          background:
            linear-gradient(180deg,
              rgba(73,69,255,0.00) 0%,
              rgba(73,69,255,0.18) 18%,
              rgba(73,69,255,0.45) 42%,
              rgba(73,69,255,0.26) 62%,
              rgba(73,69,255,0.08) 82%,
              rgba(73,69,255,0.00) 100%);
          filter: blur(24px);
        }
        /* Crisp, saturated core — the "horizon line" — thin and bright */
        .lsrt-core {
          position: absolute;
          left: 0; right: 0;
          top: 22vh;
          height: 4vh;
          background:
            linear-gradient(180deg,
              rgba(73,69,255,0.00) 0%,
              rgba(73,69,255,0.85) 50%,
              rgba(73,69,255,0.00) 100%);
          filter: blur(8px);
          opacity: 0.9;
        }
        /* Long soft fade to white below */
        .lsrt-fade {
          position: absolute;
          left: 0; right: 0;
          top: 30vh;
          height: 30vh;
          background:
            linear-gradient(180deg,
              rgba(73,69,255,0.14) 0%,
              rgba(73,69,255,0.04) 55%,
              rgba(255,255,255,0) 100%);
        }

        /* ── Body / text ─────────────────────────────────────────── */
        .lsrt-body {
          grid-row: 2 / 3;
          align-self: center;
          justify-self: center;
          max-width: 1100px;
          padding: 0 48px;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .lsrt-text {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          font-size: clamp(2.25rem, 5.6vw, 4.5rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.035em;
          margin: 0;
        }

        /* On shorter screens — collapse the stack a bit */
        @media (max-height: 720px) {
          .lsrt-horizon { height: 52vh; }
          .lsrt-core { top: 18vh; }
          .lsrt-fade { top: 26vh; height: 26vh; }
        }
      `}</style>
    </>
  );
}
