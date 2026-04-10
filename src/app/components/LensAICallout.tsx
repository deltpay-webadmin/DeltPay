import { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useInView } from 'motion/react';
import { CPULoadingAnimation } from './CPULoadingAnimation';

const NAVY   = '#041E42';
const PURPLE = '#4945FF';
const GRAY   = '#6B7280';
const MUTED  = '#9CA0AB';
const BORDER = '#E8E8EC';
const MONO   = "'JetBrains Mono', monospace";

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function LensAICallout() {
  return (
    <section
      style={{
        background: '#FFFFFF',
        borderBottom: `1px solid ${BORDER}`,
        padding: 'clamp(56px, 8vh, 96px) clamp(24px, 4vw, 48px)',
      }}
    >
      <div
        className="max-w-[1300px] mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(40px, 6vw, 80px)',
          alignItems: 'center',
        }}
      >

        {/* ── Left: Argument ── */}
        <div style={{ maxWidth: 520 }}>
          <Reveal>
            <div
              className="text-[11px] font-medium uppercase mb-4"
              style={{ fontFamily: MONO, letterSpacing: '1.2px', color: PURPLE }}
            >
              INTELLIGENCE
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h2
              className="text-[clamp(26px,3.5vw,42px)] font-bold leading-[1.1] mb-4"
              style={{
                letterSpacing: '-0.03em',
                color: NAVY,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
              }}
            >
              ChatGPT reads the internet,{' '}
              <br />
              <span
                style={{
                  background: 'linear-gradient(180deg, #3D4F9A 0%, #5A6AC0 30%, #7B8ADA 55%, #4945FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Lens
              </span>{' '}
              reads your books.
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="text-[17px] leading-relaxed mb-6" style={{ color: GRAY }}>
              Advanced predictive analytics powered by Lens to unlock growth
              and operational clarity.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="text-[15px] leading-relaxed mb-8" style={{ color: MUTED }}>
              General-purpose AI gives general-purpose answers. Lens gives answers
              that are worth money — because they're built on the data that actually
              runs your business.
            </p>
          </Reveal>

          <Reveal delay={0.22}>
            <Link
              to="/delt-ai"
              className="text-sm font-bold inline-flex items-center gap-1.5 transition-all duration-200 hover:gap-2.5"
              style={{ color: PURPLE }}
            >
              Ask Your Business <span>→</span>
            </Link>
          </Reveal>
        </div>

        {/* ── Right: CPU animation panel ── */}
        <Reveal delay={0.15} className="w-full">
          <div className="flex flex-col gap-3">
            <div
              className="rounded-xl border p-8 sm:p-10 flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(73,69,255,0.03) 0%, rgba(73,69,255,0.08) 100%)',
                borderColor: 'rgba(73,69,255,0.15)',
                minHeight: '320px',
              }}
            >
              <CPULoadingAnimation />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}