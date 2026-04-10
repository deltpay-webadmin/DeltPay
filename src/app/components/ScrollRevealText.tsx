import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';

const TEXT = "This is what running a business should feel like.";

/* Each character snaps between muted → accent → dark */
function Char({ char, progress, start, end }: {
  char: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const mid = start + (end - start) * 0.35;
  const color = useTransform(
    progress,
    [start, mid, end],
    ['#B8B8E8', '#4945FF', '#041E42']
  );
  return <motion.span style={{ color, transition: 'none' }}>{char}</motion.span>;
}

function Word({ word, progress, charStart, totalChars }: {
  word: string;
  progress: MotionValue<number>;
  charStart: number;
  totalChars: number;
}) {
  return (
    <span style={{ display: 'inline-block', marginRight: '0.3em', whiteSpace: 'nowrap' }}>
      {word.split('').map((char, i) => {
        const idx = charStart + i;
        // Reveal all text within 0.05–0.55 of scroll so it finishes well before sticky unpins
        const s = 0.05 + (idx / totalChars) * 0.45;
        const e = s + (4 / totalChars) * 0.45;
        return <Char key={i} char={char} progress={progress} start={s} end={Math.min(e, 0.55)} />;
      })}
    </span>
  );
}

export function ScrollRevealText() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Pre-compute word/char positions
  const words = TEXT.split(' ');
  let ci = 0;
  const wordData = words.map((w) => {
    const start = ci;
    ci += w.length;
    return { word: w, charStart: start };
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
          height: 400vh;
          background: linear-gradient(180deg, #f4f5f7 0%, #f8f9fb 15%, #f8f9fb 85%, #f4f5f7 100%);
        }
        .srt-sticky {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
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
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          font-size: clamp(3.5rem, 7vw, 6rem);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.035em;
          margin: 0;
        }
      `}</style>
    </>
  );
}