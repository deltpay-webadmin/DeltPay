import { useEffect, useRef, useState } from 'react';

/* ──────────────────────────────────────────────────────────────
   PlaidWaveLines — decorative SVG background of concentric wavy
   lines, modeled after the Plaid hero treatment but tinted in
   Delt indigo (#4945ff). Positioned in the upper-left of the
   parent (which must be `relative`), absolute / pointer-events:
   none so it never blocks clicks.

   Adds a cursor-tracking brightness halo: as the user moves the
   mouse over the hero, the lines closest to the cursor brighten
   (via a radial mask) creating a soft spotlight follow effect.
   ────────────────────────────────────────────────────────────── */

type Props = {
  /** Color of the lines. Default Delt indigo. */
  color?: string;
  /** Number of concentric wave lines. */
  lineCount?: number;
  /** Base opacity at idle. */
  baseOpacity?: number;
  /** Boost opacity inside the cursor spotlight. */
  hoverOpacity?: number;
  /** Spotlight radius in px. */
  spotlightRadius?: number;
  className?: string;
};

export function PlaidWaveLines({
  color = '#4945ff',
  lineCount = 22,
  baseOpacity = 0.18,
  hoverOpacity = 0.85,
  spotlightRadius = 320,
  className,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = wrapRef.current?.parentElement;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const handleLeave = () => setPos(null);

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  // Generate `lineCount` concentric quadratic wave paths anchored to the
  // top-left corner. Each successive line steps further from the corner
  // along both axes, producing the woven, contour-map feel Plaid uses.
  const lines = Array.from({ length: lineCount }, (_, i) => {
    const step = 22 + i * 18;        // distance from corner
    const amp = 14 + i * 1.2;        // wave amplitude grows outward
    const yEnd = step + i * 6;       // where the curve meets the left edge
    const xEnd = step + i * 12;      // where the curve meets the top edge
    // Path runs from a point on the top edge, swoops down-left through
    // two control curves, and ends on the left edge — mimicking Plaid's
    // upper-left "ripples from the corner" composition.
    const d = `
      M ${xEnd} 0
      C ${xEnd - amp} ${step * 0.35}, ${step * 0.55} ${yEnd - amp}, 0 ${yEnd}
    `;
    return { d, key: i };
  });

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
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMinYMin slice"
        style={{ position: 'absolute', inset: 0, opacity: baseOpacity }}
      >
        <g fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
          {lines.map((l) => (
            <path key={`base-${l.key}`} d={l.d} />
          ))}
        </g>
      </svg>

      {/* Spotlight layer — same lines, brighter, masked by a radial
          gradient centered on the cursor. When pos is null (no hover),
          we anchor the spotlight off-canvas so the layer fades out. */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMinYMin slice"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: hoverOpacity,
          transition: 'opacity 220ms ease-out',
        }}
      >
        <defs>
          {/* Radial gradient used as a luminance mask — white in the
              center (lines fully shown) → black at the edge (lines
              hidden). The gradient follows the cursor via the
              gradientUnits="userSpaceOnUse" cx/cy. */}
          <radialGradient
            id={spotlightId}
            cx={pos ? `${(pos.x / (wrapRef.current?.parentElement?.clientWidth || 1)) * 1200}` : '-500'}
            cy={pos ? `${(pos.y / (wrapRef.current?.parentElement?.clientHeight || 1)) * 800}` : '-500'}
            r={spotlightRadius}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="white" stopOpacity={1} />
            <stop offset="60%" stopColor="white" stopOpacity={0.35} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </radialGradient>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="800">
            <rect x="0" y="0" width="1200" height="800" fill={`url(#${spotlightId})`} />
          </mask>
        </defs>
        <g
          fill="none"
          stroke={color}
          strokeWidth={1.25}
          strokeLinecap="round"
          mask={`url(#${maskId})`}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        >
          {lines.map((l) => (
            <path key={`hi-${l.key}`} d={l.d} />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default PlaidWaveLines;
