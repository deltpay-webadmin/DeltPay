import { useEffect, useMemo, useRef, useState } from 'react';

/* ──────────────────────────────────────────────────────────────
   PlaidWaveLines — parallel topographic contour field. Every
   horizontal line shares the same underlying wave function and
   is shifted vertically by a tight, constant spacing, so the
   wave crests stack into the ridged "moiré contour" pattern
   that appears in the Plaid hero (and in the user-supplied
   reference design 1:1).

   The wave is built from layered sines that vary along the x
   axis only (no per-line phase shift), and the amplitude grows
   smoothly from left to right so distortion intensifies toward
   the right edge — matching the reference exactly.

   Tinted in Delt indigo (#4945ff) by default. Positioned
   absolutely inside its parent (which must be `relative`),
   ignores pointer events.

   A cursor-tracking spotlight brightens the lines closest to
   the mouse via a radial mask.
   ────────────────────────────────────────────────────────────── */

type Props = {
  color?: string;
  /** Number of parallel contour lines. */
  lineCount?: number;
  /** Vertical spacing between successive lines (viewBox units). */
  spacing?: number;
  baseOpacity?: number;
  hoverOpacity?: number;
  spotlightRadius?: number;
  className?: string;
};

const VB_W = 2400;
const VB_H = 1400;
const POINTS_PER_LINE = 220; // dense sampling — the wave has sharp turns

export function PlaidWaveLines({
  color = '#4945ff',
  lineCount = 80,
  spacing = 24,
  baseOpacity = 0.7,
  hoverOpacity = 1,
  spotlightRadius = 460,
  className,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 1, h: 1 });

  useEffect(() => {
    const el = wrapRef.current?.parentElement;
    if (!el) return;

    const updateSize = () => {
      setSize({ w: el.clientWidth || 1, h: el.clientHeight || 1 });
    };
    updateSize();

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const handleLeave = () => setPos(null);

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    window.addEventListener('resize', updateSize);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  /* The shared wave function. All lines use this — the only thing
     that changes between lines is the vertical baseline. That is
     what aligns the crests into vertical "ridges" the way the
     reference image does.

     Three layered sines:
       • a long swell across the canvas
       • a mid wave that adds the rolling ridges
       • a finer wave that adds the textured crest detail

     The amplitudes are scaled by `ampScale(x)` which ramps from
     ~0.35 on the left to 1.0 on the right, matching the reference
     where the left side is calm and the right side is more agitated. */
  const baseWave = useMemo(() => {
    const sampleY = (x: number) => {
      // Clamp t to [0,1] so the off-canvas overshoot (x < 0 or x > VB_W)
      // doesn't produce NaN from Math.pow on a negative base.
      const tNorm = Math.max(0, Math.min(1, x / VB_W));
      const ampScale = 0.35 + Math.pow(tNorm, 1.15) * 0.85;

      const w1 = Math.sin(x * 0.0034) * 70;        // long swell
      const w2 = Math.sin(x * 0.0082 + 1.3) * 42;  // mid ridges
      const w3 = Math.sin(x * 0.019  + 2.6) * 16;  // fine detail
      const w4 = Math.sin(x * 0.041  + 0.9) * 6;   // crest texture

      return (w1 + w2 + w3 + w4) * ampScale;
    };

    // Pre-compute sample points once.
    const pts: Array<[number, number]> = [];
    for (let k = 0; k < POINTS_PER_LINE; k++) {
      const t = k / (POINTS_PER_LINE - 1);
      const x = -120 + t * (VB_W + 240);
      pts.push([x, sampleY(x)]);
    }
    return pts;
  }, []);

  /* Build all line paths by shifting the shared wave vertically.
     Lines are stacked tightly (every `spacing` units) and re-centered
     in the viewBox so the field appears to cover edge-to-edge. */
  const paths = useMemo(() => {
    const totalSpan = (lineCount - 1) * spacing;
    const startY = VB_H / 2 - totalSpan / 2;

    const out: string[] = [];
    for (let i = 0; i < lineCount; i++) {
      const yShift = startY + i * spacing;
      // Quadratic-through-midpoints smoothing for clean curves.
      let d = `M ${baseWave[0][0].toFixed(1)},${(baseWave[0][1] + yShift).toFixed(1)}`;
      for (let k = 1; k < baseWave.length - 1; k++) {
        const [x0, y0] = baseWave[k];
        const [x1, y1] = baseWave[k + 1];
        const mx = (x0 + x1) / 2;
        const my = (y0 + y1) / 2;
        d += ` Q ${x0.toFixed(1)},${(y0 + yShift).toFixed(1)} ${mx.toFixed(1)},${(my + yShift).toFixed(1)}`;
      }
      const last = baseWave[baseWave.length - 1];
      d += ` T ${last[0].toFixed(1)},${(last[1] + yShift).toFixed(1)}`;
      out.push(d);
    }
    return out;
  }, [baseWave, lineCount, spacing]);

  const spotCx = pos ? (pos.x / size.w) * VB_W : -10000;
  const spotCy = pos ? (pos.y / size.h) * VB_H : -10000;

  const spotlightId = 'plaid-wave-spotlight';
  const maskId = 'plaid-wave-mask';

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, opacity: baseOpacity }}
      >
        <g fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round">
          {paths.map((d, i) => (
            <path key={`base-${i}`} d={d} />
          ))}
        </g>
      </svg>

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: hoverOpacity,
          transition: 'opacity 220ms ease-out',
        }}
      >
        <defs>
          <radialGradient
            id={spotlightId}
            cx={spotCx}
            cy={spotCy}
            r={spotlightRadius}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="white" stopOpacity={1} />
            <stop offset="60%" stopColor="white" stopOpacity={0.35} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </radialGradient>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={VB_W}
            height={VB_H}
          >
            <rect x="0" y="0" width={VB_W} height={VB_H} fill={`url(#${spotlightId})`} />
          </mask>
        </defs>
        <g
          fill="none"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
          mask={`url(#${maskId})`}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        >
          {paths.map((d, i) => (
            <path key={`hi-${i}`} d={d} />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default PlaidWaveLines;
