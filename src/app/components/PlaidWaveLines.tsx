import { useEffect, useRef, useState } from 'react';

/* ──────────────────────────────────────────────────────────────
   PlaidWaveLines — decorative SVG background of dense concentric
   ripple lines emanating from the upper-left corner, modeled
   after the Plaid hero treatment. Tinted in Delt indigo
   (#4945ff). Covers the entire parent (which must be `relative`),
   absolute / pointer-events: none so it never blocks clicks.

   Cursor-tracking brightness halo: as the user moves the mouse
   over the hero, lines closest to the cursor brighten via a
   radial mask, creating a soft spotlight follow effect.
   ────────────────────────────────────────────────────────────── */

type Props = {
  /** Color of the lines. Default Delt indigo. */
  color?: string;
  /** Number of concentric ripple lines. */
  lineCount?: number;
  /** Spacing between successive lines (in viewBox units). */
  spacing?: number;
  /** Base opacity at idle. */
  baseOpacity?: number;
  /** Boost opacity inside the cursor spotlight. */
  hoverOpacity?: number;
  /** Spotlight radius in viewBox units. */
  spotlightRadius?: number;
  className?: string;
};

// The viewBox is sized generously so a single ellipse anchored at the
// top-left corner of the section can sweep all the way across to the
// far edges, giving us full-bleed coverage no matter the aspect ratio.
const VB_W = 2400;
const VB_H = 1400;

export function PlaidWaveLines({
  color = '#4945ff',
  lineCount = 70,
  spacing = 42,
  baseOpacity = 0.22,
  hoverOpacity = 0.9,
  spotlightRadius = 520,
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

  // Dense concentric ellipses anchored at (0, 0), each one slightly
  // larger than the last. Using ellipses (not circles) lets the ripple
  // stretch naturally across a wide hero — matching the Plaid look
  // where the lines fan out from the corner and cover the whole canvas.
  //
  // The aspect of each ring is slightly wider than tall so the lines
  // sweep more across than down, giving the upper-left "ripple" feel.
  const lines = Array.from({ length: lineCount }, (_, i) => {
    const r = (i + 1) * spacing;
    return { rx: r * 1.35, ry: r, key: i };
  });

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
        preserveAspectRatio="xMinYMin slice"
        style={{ position: 'absolute', inset: 0, opacity: baseOpacity }}
      >
        <g fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
          {lines.map((l) => (
            <ellipse key={`base-${l.key}`} cx={0} cy={0} rx={l.rx} ry={l.ry} />
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
        preserveAspectRatio="xMinYMin slice"
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
          {lines.map((l) => (
            <ellipse key={`hi-${l.key}`} cx={0} cy={0} rx={l.rx} ry={l.ry} />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default PlaidWaveLines;
