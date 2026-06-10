import { useEffect, useMemo, useRef, useState } from 'react';

/* ──────────────────────────────────────────────────────────────
   PlaidWaveLines — topographic contour-map background, modeled
   after the Plaid hero treatment. Dozens of horizontal lines
   undulate across the canvas using layered sine waves, producing
   the organic "flowing contour" feel rather than perfect
   concentric arcs. Tinted in Delt indigo (#4945ff) by default.

   Covers the entire parent (which must be `relative`), is
   absolutely positioned, and ignores pointer events so it never
   blocks clicks.

   Cursor-tracking brightness halo: as the user moves the mouse
   over the hero, the lines closest to the cursor brighten via a
   radial mask, creating a soft spotlight follow effect.
   ────────────────────────────────────────────────────────────── */

type Props = {
  /** Color of the lines. Default Delt indigo. */
  color?: string;
  /** Number of horizontal contour lines. */
  lineCount?: number;
  /** Vertical spacing between successive lines (viewBox units). */
  spacing?: number;
  /** Base opacity at idle. */
  baseOpacity?: number;
  /** Boost opacity inside the cursor spotlight. */
  hoverOpacity?: number;
  /** Spotlight radius in viewBox units. */
  spotlightRadius?: number;
  className?: string;
};

// Wide, generous viewBox so the contour field flows naturally across
// any hero aspect ratio. `xMinYMid slice` keeps lines anchored to the
// left edge and vertically centered when the container is shorter or
// taller than the viewBox.
const VB_W = 2400;
const VB_H = 1400;

// Number of points along each line — higher = smoother curves but
// more SVG nodes. 90 keeps the file lightweight while staying smooth.
const POINTS_PER_LINE = 90;

export function PlaidWaveLines({
  color = '#4945ff',
  lineCount = 90,
  spacing = 22,
  baseOpacity = 0.45,
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

  /* Build the contour paths once. Each line is a smooth horizontal
     curve whose vertical offset is the sum of two sine waves with
     phase that shifts per line — this is what gives the topographic
     "flowing wood-grain" look. The lines start slightly above the
     viewBox and end slightly below so there is no visible top or
     bottom edge inside the hero. */
  const paths = useMemo(() => {
    // Place lines so they comfortably extend off both top and bottom
    // — total vertical span ≈ lineCount * spacing, recentered.
    const totalSpan = (lineCount - 1) * spacing;
    const startY = VB_H / 2 - totalSpan / 2;

    const out: string[] = [];
    for (let i = 0; i < lineCount; i++) {
      const baseY = startY + i * spacing;
      // Three layered sines with line-dependent phase — yields the
      // wandering, non-repeating topographic field.
      const a1 = 38 + (i % 5) * 3;     // amplitude wave 1
      const a2 = 22 + ((i * 7) % 9);   // amplitude wave 2
      const a3 = 10;                   // amplitude wave 3 (fine detail)
      const f1 = 0.0018;               // low frequency (long swells)
      const f2 = 0.0042;               // mid frequency
      const f3 = 0.011;                // high frequency (jitter)
      const p1 = i * 0.42;
      const p2 = i * 0.83 + 1.7;
      const p3 = i * 0.17 + 3.1;

      const pts: string[] = [];
      for (let k = 0; k < POINTS_PER_LINE; k++) {
        const t = k / (POINTS_PER_LINE - 1);
        // Extend slightly beyond viewBox horizontally so lines bleed off both edges
        const x = -100 + t * (VB_W + 200);
        const y =
          baseY +
          Math.sin(x * f1 + p1) * a1 +
          Math.sin(x * f2 + p2) * a2 +
          Math.sin(x * f3 + p3) * a3;
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      // Smooth polyline using SVG's quadratic-through-midpoints trick
      // — start at first point, then for each midpoint between
      // consecutive samples emit a Q with the sample as control.
      let d = `M ${pts[0]}`;
      const coords = pts.map((p) => p.split(',').map(Number) as [number, number]);
      for (let k = 1; k < coords.length - 1; k++) {
        const [x0, y0] = coords[k];
        const [x1, y1] = coords[k + 1];
        const mx = (x0 + x1) / 2;
        const my = (y0 + y1) / 2;
        d += ` Q ${x0.toFixed(1)},${y0.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
      }
      const last = coords[coords.length - 1];
      d += ` T ${last[0].toFixed(1)},${last[1].toFixed(1)}`;
      out.push(d);
    }
    return out;
  }, [lineCount, spacing]);

  // Map cursor pixel position into viewBox coordinates for the
  // spotlight gradient center.
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
      {/* Base layer — lines at low opacity, always visible */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, opacity: baseOpacity }}
      >
        <g fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
          {paths.map((d, i) => (
            <path key={`base-${i}`} d={d} />
          ))}
        </g>
      </svg>

      {/* Spotlight layer — same lines, brighter, masked by a radial
          gradient centered on the cursor. When pos is null (no hover),
          the gradient sits far off-canvas so the layer is invisible. */}
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
          strokeWidth={1.25}
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
