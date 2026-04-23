import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';

/* ─────────────────────────────────────────────────────────────
   LENS-SPECIFIC SCROLL REVEAL TEXT
   --------------------------------------------------------------
   Mirrors the home page's "This is what running a business
   should feel like." letter-by-letter lighting animation, but
   plays over a soft indigo → white gradient band (Delt's answer
   to Base44's orange sunrise transition).
   ───────────────────────────────────────────────────────────── */

const TEXT = 'This is what running your business should feel like.';

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
  const s = 0.05 + (charStart / totalChars) * 0.45;
  const e = Math.min(0.05 + ((charEnd + 4) / totalChars) * 0.45, 0.55);
  const mid = s + (e - s) * 0.35;
  const color = useTransform(progress, [s, mid, e], ['#C5C3EE', '#4945FF', '#041E42']);
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
          {/* Indigo gradient sunrise — Delt's take on Base44's orange band */}
          <div className="lsrt-gradient" aria-hidden />
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
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        /* The gradient runs across the top ~45vh of the sticky frame
           and fades to white below, like the Base44 orange reference */
        .lsrt-gradient {
          position: absolute;
          left: 0; right: 0; top: 0;
          height: 55vh;
          background:
            radial-gradient(ellipse 90% 55% at 50% 0%,
              rgba(73,69,255,0.55) 0%,
              rgba(73,69,255,0.38) 25%,
              rgba(73,69,255,0.18) 50%,
              rgba(255,255,255,0) 85%);
          filter: blur(2px);
          pointer-events: none;
        }
        .lsrt-body {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          padding: 0 48px;
          text-align: center;
        }
        .lsrt-text {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          font-size: clamp(2.25rem, 6vw, 5rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.035em;
          margin: 0;
        }
      `}</style>
    </>
  );
}
