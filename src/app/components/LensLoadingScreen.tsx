import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────────────────────
   LensLoadingScreen — the original "portal" Lens splash.

   Recreates the early Lens identity: a glowing iris/portal ring
   over a deep navy field, with six numbered tick marks (#1–#6)
   around the perimeter and a faint inner orbital constellation.

   "More alive" motion layer:
     • Outer ring breathes (radius + glow pulse)
     • Tick ring slowly rotates so the #1–#6 indices orbit
     • A radial scanning sweep wipes across the ring
     • Inner constellation rotates the other way
     • A handful of particles drift along the ring
     • Six "intelligence layer" pips light up in sequence,
       gated to the on-screen INITIALIZING / Building the lens…
       copy lockup on the right
   ───────────────────────────────────────────────────────────── */

const NAVY = '#041E42';
const RING = '#7FB8FF';      // bright cyan-ish ring (matches screenshot)
const RING_SOFT = '#3F7AD6';
const TEXT = '#E6EEF9';
const TEXT_MUTED = '#8FA3C2';

// The 6 layer pips under the copy lockup (matches screenshot colors)
const LAYER_COLORS = ['#4945FF', '#23D4FF', '#7B5BFF', '#5B6BFF', '#FF8A3D', '#3DE0A6'];

interface LensLoadingScreenProps {
  /** Total time visible before fade-out begins (ms). Default 2600. */
  duration?: number;
  /** Called once the splash has fully unmounted. */
  onComplete?: () => void;
  /** Force-show even if already shown this session. Default false. */
  force?: boolean;
  /** sessionStorage key. Default 'lens.splash.seen'. */
  storageKey?: string;
}

export function LensLoadingScreen({
  duration = 2600,
  onComplete,
  force = false,
  storageKey = 'lens.splash.seen',
}: LensLoadingScreenProps) {
  // Decide synchronously on first render whether to show, so the splash
  // doesn't flash for a frame before disappearing.
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (force) return true;
    try {
      return window.sessionStorage.getItem(storageKey) !== '1';
    } catch {
      return true;
    }
  });
  const [fadingOut, setFadingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Lock scroll while visible
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [visible]);

  // Timed fade + unmount
  useEffect(() => {
    if (!visible) return;
    const fadeAt = window.setTimeout(() => setFadingOut(true), duration);
    const removeAt = window.setTimeout(() => {
      setVisible(false);
      try { window.sessionStorage.setItem(storageKey, '1'); } catch { /* noop */ }
      onComplete?.();
    }, duration + 700);
    return () => {
      window.clearTimeout(fadeAt);
      window.clearTimeout(removeAt);
    };
  }, [visible, duration, onComplete, storageKey]);

  // Allow click / Escape to skip
  useEffect(() => {
    if (!visible) return;
    const skip = () => setFadingOut(true);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') skip(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  if (!visible) return null;

  // Geometry for the portal SVG (viewBox 0 0 600 600, center 300,300)
  const C = 300;
  const R_OUTER = 220;   // bright outer ring radius
  const R_GLOW  = 240;
  const R_TICK  = 250;   // where the #1–#6 labels sit
  const R_MID   = 165;   // faint mid ring
  const R_INNER = 70;    // dark inner void edge

  // Six tick positions, evenly spaced; #1 at top-right, going CCW like screenshot
  const ticks = Array.from({ length: 6 }, (_, i) => {
    // start at -60° and go counter-clockwise, matches the screenshot layout
    const deg = -60 - i * 60;
    const rad = (deg * Math.PI) / 180;
    return {
      label: `#${i + 1}`,
      x: C + R_TICK * Math.cos(rad),
      y: C + R_TICK * Math.sin(rad),
    };
  });

  // Small constellation dots inside the void
  const innerDots = [
    { x: C,        y: C - 25, r: 2.2, o: 0.9 },
    { x: C - 38,   y: C + 8,  r: 1.4, o: 0.55 },
    { x: C + 32,   y: C + 18, r: 1.6, o: 0.7 },
    { x: C - 12,   y: C + 36, r: 1.2, o: 0.45 },
    { x: C + 18,   y: C - 28, r: 1.0, o: 0.4 },
    { x: C - 28,   y: C - 20, r: 1.0, o: 0.4 },
  ];

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="Building Lens"
      onClick={() => setFadingOut(true)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: NAVY,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 650ms ease',
        cursor: 'pointer',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        color: TEXT,
      }}
    >
      {/* ── Top chrome: LENS · BY DELT  /  BUILDING LENS… ───────── */}
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 36px',
          fontSize: 12,
          letterSpacing: '0.16em',
          fontWeight: 600,
          color: TEXT_MUTED,
        }}
      >
        <div>
          <span style={{ color: TEXT }}>LENS</span>
          <span style={{ opacity: 0.55 }}> · BY DELT</span>
        </div>
        <div className="lens-splash-blink">BUILDING LENS…</div>
      </div>

      {/* ── Faint dotted grid background (the speckle in the screenshot) ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(127,184,255,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.0) 70%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.0) 70%)',
        }}
      />

      {/* ── Two-column layout: portal on the left, copy on the right ── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 48,
          padding: '0 24px',
          maxWidth: 1100,
          width: '100%',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* PORTAL */}
        <div
          className="lens-portal-wrap"
          style={{
            position: 'relative',
            width: 'min(46vw, 460px)',
            aspectRatio: '1 / 1',
            flex: '0 0 auto',
          }}
        >
          {/* Soft ambient bloom behind ring */}
          <div
            aria-hidden
            className="lens-portal-bloom"
            style={{
              position: 'absolute',
              inset: '-12%',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(127,184,255,0.28) 0%, rgba(127,184,255,0.10) 38%, transparent 70%)',
              filter: 'blur(28px)',
            }}
          />

          <svg
            viewBox="0 0 600 600"
            width="100%"
            height="100%"
            style={{ position: 'relative', display: 'block' }}
          >
            <defs>
              <radialGradient id="lensRingGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"  stopColor={RING}     stopOpacity="0" />
                <stop offset="78%" stopColor={RING}     stopOpacity="0.55" />
                <stop offset="92%" stopColor={RING}     stopOpacity="0.18" />
                <stop offset="100%" stopColor={RING}    stopOpacity="0" />
              </radialGradient>

              <radialGradient id="lensVoid" cx="50%" cy="50%" r="50%">
                <stop offset="0%"  stopColor="#0A2A55" stopOpacity="1" />
                <stop offset="70%" stopColor={NAVY}    stopOpacity="1" />
                <stop offset="100%" stopColor={NAVY}   stopOpacity="1" />
              </radialGradient>

              <linearGradient id="lensSweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={RING} stopOpacity="0" />
                <stop offset="50%"  stopColor={RING} stopOpacity="0.85" />
                <stop offset="100%" stopColor={RING} stopOpacity="0" />
              </linearGradient>

              <filter id="lensBlur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>

            {/* Outer bloom disk */}
            <circle cx={C} cy={C} r={R_GLOW} fill="url(#lensRingGlow)" />

            {/* Slow rotating tick ring (#1–#6 labels) */}
            <g
              className="lens-tick-ring"
              style={{ transformOrigin: `${C}px ${C}px` }}
            >
              {ticks.map((t, i) => (
                <text
                  key={i}
                  x={t.x}
                  y={t.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={TEXT_MUTED}
                  fontSize="11"
                  fontFamily="'JetBrains Mono', ui-monospace, monospace"
                  style={{ letterSpacing: '0.05em' }}
                >
                  {t.label}
                </text>
              ))}
            </g>

            {/* Faint mid ring */}
            <circle
              cx={C}
              cy={C}
              r={R_MID}
              fill="none"
              stroke={RING_SOFT}
              strokeWidth="1"
              strokeOpacity="0.28"
              strokeDasharray="2 6"
            />

            {/* Bright primary ring */}
            <circle
              className="lens-ring-pulse"
              cx={C}
              cy={C}
              r={R_OUTER}
              fill="none"
              stroke={RING}
              strokeWidth="4"
              strokeOpacity="0.95"
              filter="url(#lensBlur)"
            />
            <circle
              cx={C}
              cy={C}
              r={R_OUTER}
              fill="none"
              stroke={RING}
              strokeWidth="2"
              strokeOpacity="1"
            />

            {/* Scanning sweep — a rotating gradient stroke arc */}
            <g
              className="lens-sweep"
              style={{ transformOrigin: `${C}px ${C}px` }}
            >
              <circle
                cx={C}
                cy={C}
                r={R_OUTER}
                fill="none"
                stroke="url(#lensSweep)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${R_OUTER * 1.2} ${R_OUTER * 6.3}`}
                opacity="0.9"
                filter="url(#lensBlur)"
              />
            </g>

            {/* Dark inner void */}
            <circle cx={C} cy={C} r={R_INNER + 30} fill="url(#lensVoid)" />

            {/* Inner constellation — rotates the opposite direction */}
            <g
              className="lens-constellation"
              style={{ transformOrigin: `${C}px ${C}px` }}
            >
              {innerDots.map((d, i) => (
                <circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r={d.r}
                  fill={RING}
                  opacity={d.o}
                />
              ))}
              {/* a couple of hairline links to suggest a constellation */}
              <line x1={C} y1={C - 25} x2={C + 32} y2={C + 18} stroke={RING} strokeOpacity="0.18" strokeWidth="0.6" />
              <line x1={C} y1={C - 25} x2={C - 38} y2={C + 8}  stroke={RING} strokeOpacity="0.18" strokeWidth="0.6" />
              <line x1={C + 32} y1={C + 18} x2={C - 12} y2={C + 36} stroke={RING} strokeOpacity="0.14" strokeWidth="0.6" />
            </g>

            {/* Center pinpoint */}
            <circle cx={C} cy={C} r="2.5" fill={TEXT} opacity="0.9" />
            <circle cx={C} cy={C} r="6" fill={RING} opacity="0.25" />

            {/* Particles drifting along the ring */}
            {[0, 1, 2, 3].map((i) => (
              <circle
                key={`p-${i}`}
                className={`lens-particle lens-particle-${i}`}
                cx={C + R_OUTER}
                cy={C}
                r={1.6}
                fill={RING}
                opacity="0.9"
                style={{ transformOrigin: `${C}px ${C}px` }}
              />
            ))}
          </svg>
        </div>

        {/* COPY LOCKUP */}
        <div style={{ flex: '0 1 380px', minWidth: 260 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.22em',
              fontWeight: 600,
              color: '#B7C7E0',
              marginBottom: 14,
            }}
          >
            INITIALIZING
          </div>
          <div
            style={{
              fontSize: 'clamp(34px, 4.6vw, 56px)',
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: TEXT,
              marginBottom: 18,
            }}
          >
            Building the<br />lens<span className="lens-ellipsis">…</span>
          </div>
          <div
            style={{
              fontSize: 16,
              color: TEXT_MUTED,
              marginBottom: 22,
            }}
          >
            Six intelligence layers coming online.
          </div>

          {/* Six layer pips that light up in sequence */}
          <div style={{ display: 'flex', gap: 10 }}>
            {LAYER_COLORS.map((c, i) => (
              <div
                key={i}
                className="lens-layer-pip"
                style={{
                  width: 36,
                  height: 6,
                  borderRadius: 3,
                  background: c,
                  opacity: 0.22,
                  animation: `lensPipOn 2.4s ${i * 0.28}s cubic-bezier(.2,.7,.2,1) infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Animations ─────────────────────────────────────────── */}
      <style>{`
        @keyframes lensTickSpin    { to   { transform: rotate(360deg); } }
        @keyframes lensSweepSpin   { to   { transform: rotate(360deg); } }
        @keyframes lensConSpin     { to   { transform: rotate(-360deg); } }
        @keyframes lensRingBreathe {
          0%, 100% { stroke-opacity: 0.55; transform: scale(1); }
          50%      { stroke-opacity: 1;    transform: scale(1.012); }
        }
        @keyframes lensBloomBreathe {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.04); }
        }
        @keyframes lensBlink {
          0%, 60%, 100% { opacity: 1; }
          70%, 90%      { opacity: 0.35; }
        }
        @keyframes lensPipOn {
          0%, 100% { opacity: 0.22; transform: scaleY(1); }
          50%      { opacity: 1;    transform: scaleY(1.15); }
        }
        @keyframes lensParticle {
          to { transform: rotate(360deg); }
        }
        @keyframes lensEllipsis {
          0%   { opacity: 0.2; }
          50%  { opacity: 1;   }
          100% { opacity: 0.2; }
        }

        .lens-tick-ring     { animation: lensTickSpin 36s linear infinite; }
        .lens-sweep         { animation: lensSweepSpin 4.5s linear infinite; }
        .lens-constellation { animation: lensConSpin 28s linear infinite; }
        .lens-ring-pulse    {
          animation: lensRingBreathe 3.2s ease-in-out infinite;
          transform-origin: ${C}px ${C}px;
        }
        .lens-portal-bloom  { animation: lensBloomBreathe 3.2s ease-in-out infinite; }
        .lens-splash-blink  { animation: lensBlink 1.6s ease-in-out infinite; }
        .lens-ellipsis      { animation: lensEllipsis 1.4s ease-in-out infinite; }

        .lens-particle      { animation: lensParticle linear infinite; }
        .lens-particle-0    { animation-duration: 7s;  }
        .lens-particle-1    { animation-duration: 9s;  animation-delay: -2s; }
        .lens-particle-2    { animation-duration: 11s; animation-delay: -5s; }
        .lens-particle-3    { animation-duration: 13s; animation-delay: -8s; }

        @media (prefers-reduced-motion: reduce) {
          .lens-tick-ring,
          .lens-sweep,
          .lens-constellation,
          .lens-ring-pulse,
          .lens-portal-bloom,
          .lens-particle,
          .lens-splash-blink,
          .lens-ellipsis,
          .lens-layer-pip {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default LensLoadingScreen;
