import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';

const TEXT = "This is what running a business should feel like.";

/* Each word tweens as a single unit between muted → accent → dark */
function Word({ word, progress, charStart, charEnd, totalChars }: {
  word: string;
  progress: MotionValue<number>;
  charStart: number;
  charEnd: number;
  totalChars: number;
}) {
  // Reveal all text within 0.10–0.85 of scroll so it stretches across most of the
  // sticky pin (no long empty scroll tail after the last word lights up).
  const s = 0.10 + (charStart / totalChars) * 0.75;
  const e = Math.min(0.10 + ((charEnd + 4) / totalChars) * 0.75, 0.92);
  const mid = s + (e - s) * 0.35;
  const color = useTransform(progress, [s, mid, e], ['#B8B8E8', '#4945FF', '#041E42']);
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

export function ScrollRevealText() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Pre-compute word positions (by character index, used for staggered reveal)
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
      <div ref={containerRef} id="scroll-reveal-section" className="srt-outer">
        <div className="srt-sticky">
          <div className="srt-dots" />
          <div className="srt-body">
            <p className="srt-text">
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
        .srt-outer {
          position: relative;
          /* 220vh of scroll track keeps the reveal lively without an empty tail.
             Divide by --site-zoom so the track measures correctly under the
             body-level CSS zoom. */
          height: calc(220vh / var(--site-zoom, 1));
          background: linear-gradient(180deg, #f4f5f7 0%, #f8f9fb 15%, #f8f9fb 85%, #f4f5f7 100%);
        }
        .srt-sticky {
          position: sticky;
          top: 0;
          width: 100%;
          /* Match a single physical viewport regardless of zoom. */
          height: calc(100vh / var(--site-zoom, 1));
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .srt-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(4,30,66,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .srt-body {
          position: relative;
          z-index: 1;
          max-width: 1050px;
          padding: 0 48px;
          text-align: center;
        }
        .srt-text {
          font-family: 'Manrope', 'Inter Tight', system-ui, sans-serif;
          font-size: clamp(3.5rem, 7vw, 6rem);
          font-weight: 600;
          line-height: 1.05;
          letter-spacing: -0.045em;
          margin: 0;
        }
      `}</style>
    </>
  );
}