/**
 * DeltLogo — official Delt brand mark + wordmark
 *
 *   ●▌  Delt
 *
 * Mark   = small circle + tall rounded pill, both indigo (#4945FF)
 * Wordmark = "Delt" set in a heavy display sans, with a slightly clipped
 *            "t" crossbar on the right (matches the brand artwork).
 *
 * The wordmark renders in `--delt-logo-fg` so a single component handles
 * both light- and dark-background variants:
 *   • onDark={true}  → wordmark is cream/white   (use over navy hero, footer)
 *   • onDark={false} → wordmark is navy (#041E42) (use over light surfaces)
 *
 * The mark stays indigo on every background — it is the brand's anchor.
 *
 * Sizing: pass `height` in px (defaults vary by surface). The whole logo
 * scales proportionally.
 */

import { Link } from 'react-router';

const INDIGO = '#4945FF';
const NAVY = '#041E42';
const CREAM = '#F7F5F0';

export interface DeltLogoProps {
  /** Render dark wordmark on light bg (false) or light wordmark on dark bg (true). */
  onDark?: boolean;
  /** Logo height in px. Width scales proportionally. */
  height?: number;
  /** Optional extra class on the wrapping <span>. */
  className?: string;
  /** Optional accessible label override. */
  ariaLabel?: string;
}

export function DeltLogo({
  onDark = false,
  height = 28,
  className,
  ariaLabel = 'Delt',
}: DeltLogoProps) {
  // Native intrinsic viewBox: 240 wide × 80 tall (3:1 aspect).
  // Scaled by `height` only — width auto-scales via SVG.
  const fg = onDark ? CREAM : NAVY;

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}
      aria-label={ariaLabel}
      role="img"
    >
      <svg
        height={height}
        viewBox="0 0 240 80"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        style={{ display: 'block' }}
      >
        {/* — Mark — */}
        {/* Small filled circle */}
        <circle cx="14" cy="56" r="11" fill={INDIGO} />
        {/* Tall rounded pill */}
        <rect x="32" y="14" width="22" height="56" rx="11" fill={INDIGO} />

        {/* — Wordmark "Delt" — */}
        <text
          x="74"
          y="62"
          fill={fg}
          style={{
            fontFamily:
              "var(--dc-font-display, 'Plus Jakarta Sans'), 'Inter', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 60,
            letterSpacing: '-0.02em',
          }}
        >
          Delt
        </text>
      </svg>
    </span>
  );
}

/**
 * DeltLogoLink — convenience wrapper that links the logo back to "/".
 * Used in the global Navigation header.
 */
export function DeltLogoLink({
  onDark = false,
  height = 28,
  className,
}: DeltLogoProps) {
  return (
    <Link
      to="/"
      aria-label="Delt — home"
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}
    >
      <DeltLogo onDark={onDark} height={height} ariaLabel="Delt — home" />
    </Link>
  );
}

export default DeltLogo;

// Re-export brand color constants in case other components want them.
export const DELT_BRAND = {
  INDIGO,
  NAVY,
  CREAM,
};
