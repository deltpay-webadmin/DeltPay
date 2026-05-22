/* ─────────────────────────────────────────────────────────────────────────
   LensMarkMorph
   ─────────────────────────────────────────────────────────────────────────
   Premium canvas-based dot-morph animation inspired by Square's logo
   reveal. Particles bloom outward from the center as a halftone field,
   then reorganize into the LensMark aperture (outer ring + 6 iris blades
   + pupil core). After settling, particles do a subtle "breathing" pulse
   so the mark feels alive.

   Design goals:
   • Reads as premium / cinematic, not toy-like.
   • Crisp at any DPR (uses devicePixelRatio scaling).
   • Resolves into a shape that visually rhymes with the static LensMark
     SVG, so the transition between morph and final mark is seamless.
   • Honors prefers-reduced-motion (snaps to settled state).

   Tuning notes:
   • Particle count scales with size for visual density consistency.
   • Per-particle ease offsets create the staggered "settling" feel.
   • Halftone bloom phase peaks around 35% then settles by 100%.
   ───────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from 'react';

type Props = {
  size?: number;          // px (renders as size × size square)
  loop?: boolean;         // restart morph on a slow cadence
  loopDelayMs?: number;   // pause between loops
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
};

// Particle stores its source (bloom origin) and target (settled aperture)
// positions. We tween between them with eased timing.
type Particle = {
  // source = where it starts (jittered around center for bloom)
  sx: number;
  sy: number;
  // target = settled aperture position (normalized to canvas)
  tx: number;
  ty: number;
  // current
  x: number;
  y: number;
  // appearance
  r: number;          // radius in CSS px
  hue: number;        // 0..1 along violet→indigo spectrum
  // timing
  delay: number;      // 0..0.45 (per-particle stagger)
  // halftone phase: radial offset peak
  bloomR: number;     // px outward push at peak
  bloomAngle: number; // direction of bloom push
};

// Cubic-bezier-ish ease (out-quint feels premium / decelerates softly)
function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Build the target point cloud for the LensMark aperture, normalized to a
 * unit circle centered at (0,0) with radius ~0.46 (leaves room for glow).
 *
 *   - Outer ring of fine dots (sparse, premium)
 *   - 6 iris blade radial spokes (denser, like aperture leaves)
 *   - Inner pupil cluster (bright core)
 */
function buildAperturePoints(count: number): { x: number; y: number; weight: number }[] {
  const pts: { x: number; y: number; weight: number }[] = [];

  // Allocation: ~35% outer ring, ~45% iris blades, ~20% pupil core
  const ringN = Math.floor(count * 0.35);
  const irisN = Math.floor(count * 0.45);
  const pupilN = count - ringN - irisN;

  // ── Outer ring (r ≈ 0.46) — fine even spacing with slight jitter
  for (let i = 0; i < ringN; i++) {
    const a = (i / ringN) * Math.PI * 2;
    const jitter = (Math.random() - 0.5) * 0.01;
    const r = 0.46 + jitter;
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, weight: 0.8 });
  }

  // ── Iris blades — 6 blades, each a thin filled wedge from r=0.12 to r=0.34
  const bladeCount = 6;
  const perBlade = Math.floor(irisN / bladeCount);
  for (let b = 0; b < bladeCount; b++) {
    const bladeAngle = (b / bladeCount) * Math.PI * 2 - Math.PI / 2; // start at top
    for (let i = 0; i < perBlade; i++) {
      // Sample radial position along the blade
      const t = i / perBlade;
      // Wedge tapers: narrower near the pupil, wider near the rim
      const r = 0.13 + t * 0.22;                    // 0.13 → 0.35
      const halfWidth = 0.012 + t * 0.055;          // wedge opening
      const offset = (Math.random() - 0.5) * halfWidth * 2;
      const a = bladeAngle + offset;
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, weight: 1.0 });
    }
  }

  // ── Pupil core — bright dense cluster at center
  for (let i = 0; i < pupilN; i++) {
    // Gaussian-ish cluster around center
    const a = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 1.6) * 0.11;
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, weight: 1.2 });
  }

  return pts;
}

export function LensMarkMorph({
  size = 88,
  loop = true,
  loopDelayMs = 5200,
  className,
  style,
  ariaLabel = 'Lens',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const dprRef = useRef<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── HiDPI setup
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    dprRef.current = dpr;
    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // ── Particle count scales with size (premium density)
    // At size 88 → ~520 particles; at 120 → ~720.
    const count = Math.max(280, Math.floor(size * 6));

    // Build target cloud once
    const target = buildAperturePoints(count);

    // Build particle ensemble
    const cx = size / 2;
    const cy = size / 2;
    const scale = size; // unit-circle radius mapping (0.46 → 0.46*size)

    const particles: Particle[] = target.map((p, i) => {
      // Source: tight jittered cluster near center (the "seed" before bloom)
      const seedAngle = Math.random() * Math.PI * 2;
      const seedR = Math.pow(Math.random(), 2) * size * 0.04;
      const sx = cx + Math.cos(seedAngle) * seedR;
      const sy = cy + Math.sin(seedAngle) * seedR;

      // Target in canvas coords
      const tx = cx + p.x * scale;
      const ty = cy + p.y * scale;

      // Halftone bloom: each particle gets a unique outward push direction.
      // Push is along the line from center to target (so it naturally expands
      // before settling into target).
      const targetAngle = Math.atan2(ty - cy, tx - cx);
      // Slight angular jitter so it doesn't look like a perfect star
      const bloomAngle = targetAngle + (Math.random() - 0.5) * 0.6;

      // Bloom radius — particles destined for outer ring push further out
      const distFromCenter = Math.hypot(tx - cx, ty - cy);
      const bloomR = distFromCenter * 0.45 + Math.random() * size * 0.04;

      // Per-particle delay — outer ring lags slightly behind blades/pupil
      // so pupil ignites first, then blades open, then ring closes.
      const radialFactor = distFromCenter / (size * 0.5);
      const delay = radialFactor * 0.32 + Math.random() * 0.08;

      // Color: violet→indigo gradient based on weight + slight randomness
      const hue = Math.max(0, Math.min(1, p.weight * 0.5 + Math.random() * 0.4));

      // Particle radius: pupil dots are smaller & brighter, outer dots tiny,
      // blade dots medium.
      const baseR =
        p.weight > 1.1 ? 1.0 + Math.random() * 0.6  // pupil
        : p.weight < 0.9 ? 0.7 + Math.random() * 0.4  // ring
        : 0.9 + Math.random() * 0.55;                 // blades

      // Scale particle size with canvas size
      const r = baseR * (size / 88);

      return {
        sx, sy, tx, ty,
        x: sx, y: sy,
        r,
        hue,
        delay,
        bloomR,
        bloomAngle,
      };
    });
    particlesRef.current = particles;

    // Respect reduced motion: snap to settled state immediately
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Animation params
    const MORPH_DURATION = prefersReduced ? 0 : 1900; // ms
    const SETTLE_HOLD = 0; // ms (no extra hold before idle)

    let loopTimeout: number | null = null;

    function colorForHue(h: number, alpha: number): string {
      // Violet (#C9C2FF) → Indigo (#7C6BFF) → Deep (#4945FF)
      // h=0 → bright violet/lavender (pupil), h=1 → deep indigo (ring)
      const stops = [
        { r: 228, g: 222, b: 255 }, // bright lavender
        { r: 201, g: 194, b: 255 }, // violet
        { r: 124, g: 107, b: 255 }, // indigo
        { r: 73,  g: 69,  b: 255 }, // deep indigo
      ];
      const t = h * (stops.length - 1);
      const i = Math.floor(t);
      const f = t - i;
      const a = stops[Math.min(i, stops.length - 1)];
      const b = stops[Math.min(i + 1, stops.length - 1)];
      const r = Math.round(a.r + (b.r - a.r) * f);
      const g = Math.round(a.g + (b.g - a.g) * f);
      const bl = Math.round(a.b + (b.b - a.b) * f);
      return `rgba(${r},${g},${bl},${alpha})`;
    }

    function start() {
      startedAtRef.current = performance.now();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    function tick(now: number) {
      const elapsed = now - startedAtRef.current;
      const ctx2 = ctx!;
      ctx2.clearRect(0, 0, size, size);

      // Soft background glow (subtle indigo halo) — only when partially morphed
      const morphT = MORPH_DURATION === 0 ? 1 : Math.min(elapsed / MORPH_DURATION, 1);
      const glowAlpha = morphT > 0.2 ? Math.min((morphT - 0.2) / 0.8, 1) * 0.35 : 0;
      if (glowAlpha > 0) {
        const grad = ctx2.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
        grad.addColorStop(0, `rgba(124,107,255,${glowAlpha * 0.55})`);
        grad.addColorStop(0.55, `rgba(73,69,255,${glowAlpha * 0.18})`);
        grad.addColorStop(1, 'rgba(11,8,48,0)');
        ctx2.fillStyle = grad;
        ctx2.fillRect(0, 0, size, size);
      }

      // Draw particles
      ctx2.globalCompositeOperation = 'lighter'; // additive — premium glow feel

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Compute per-particle local progress with stagger
        const localT = MORPH_DURATION === 0
          ? 1
          : Math.max(0, Math.min(1, (elapsed / MORPH_DURATION - p.delay) / (1 - p.delay)));

        // Bloom phase: 0..0.45 push outward, 0.45..1 settle to target
        let bloomBoost = 0;
        if (localT < 0.45) {
          // ease in/out for bloom: peaks near localT ≈ 0.30
          const b = localT / 0.45;
          bloomBoost = Math.sin(b * Math.PI) * 0.75; // 0..0.75..0 over [0, 0.45]
        }

        // Bloom-displaced source position (source + bloom outward)
        const bx = p.sx + Math.cos(p.bloomAngle) * p.bloomR * bloomBoost;
        const by = p.sy + Math.sin(p.bloomAngle) * p.bloomR * bloomBoost;

        // Settle progress: 0 during bloom, 0..1 from 0.45 to 1.0
        const settleT = localT < 0.45 ? 0 : easeOutQuint((localT - 0.45) / 0.55);

        // Lerp from bloomed source → target
        p.x = bx + (p.tx - bx) * settleT;
        p.y = by + (p.ty - by) * settleT;

        // Idle "breathing" once fully settled (loops if loop=true)
        if (localT >= 1) {
          const breatheTime = (now - startedAtRef.current - MORPH_DURATION) / 1000;
          // Gentle radial pulse: ±1.5% target radius
          const dx = p.tx - cx;
          const dy = p.ty - cy;
          const pulse = 1 + Math.sin(breatheTime * 1.4 + i * 0.013) * 0.018;
          p.x = cx + dx * pulse;
          p.y = cy + dy * pulse;
        }

        // Alpha rises with localT — particles fade in as they emerge from seed
        const fadeIn = Math.min(localT * 2.2, 1);
        // Slight brightness boost during bloom peak
        const bloomGlow = bloomBoost > 0 ? 1 + bloomBoost * 0.4 : 1;
        const alpha = Math.min(fadeIn * 0.85 * bloomGlow, 1);

        // Radius gets a tiny pulse at bloom peak too
        const r = p.r * (1 + bloomBoost * 0.3);

        ctx2.beginPath();
        ctx2.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx2.fillStyle = colorForHue(p.hue, alpha);
        ctx2.fill();
      }

      ctx2.globalCompositeOperation = 'source-over';

      // After morph finishes, draw the pupil "ignition" — small bright core
      if (morphT >= 1) {
        const breatheTime = (now - startedAtRef.current - MORPH_DURATION) / 1000;
        const corePulse = 1 + Math.sin(breatheTime * 1.4) * 0.12;
        const coreR = size * 0.055 * corePulse;
        const coreGrad = ctx2.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
        coreGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
        coreGrad.addColorStop(0.35, 'rgba(228,222,255,0.55)');
        coreGrad.addColorStop(1, 'rgba(124,107,255,0)');
        ctx2.fillStyle = coreGrad;
        ctx2.beginPath();
        ctx2.arc(cx, cy, coreR * 3, 0, Math.PI * 2);
        ctx2.fill();
      }

      // Continue animating
      const finished = morphT >= 1;
      if (!finished) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (loop && !prefersReduced) {
        // Keep the breathing idle running, then restart morph after delay
        rafRef.current = requestAnimationFrame(tick);
        if (!loopTimeout) {
          loopTimeout = window.setTimeout(() => {
            loopTimeout = null;
            start();
          }, loopDelayMs);
        }
      } else {
        // Static settled — keep gentle breathing on next frame
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    start();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (loopTimeout) clearTimeout(loopTimeout);
    };
  }, [size, loop, loopDelayMs]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{
        display: 'block',
        width: size,
        height: size,
        // Premium soft glow underneath (CSS, in addition to canvas glow)
        filter: 'drop-shadow(0 6px 22px rgba(124,107,255,0.35))',
        ...style,
      }}
    />
  );
}

export default LensMarkMorph;
