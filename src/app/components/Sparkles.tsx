import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   SPARKLES
   --------------------------------------------------------------
   Self-contained <canvas> particle field — no external deps.
   Inspired by the Sparkles snippet the team referenced for the
   Lens "Ready to stop guessing?" CTA. Renders a dense field of
   small bright dots that drift upward (configurable direction)
   with a gentle twinkle. The field is windowed to its container,
   uses devicePixelRatio for crisp dots, and pauses when offscreen
   or when the user prefers reduced motion.

   Usage:
     <Sparkles density={1800} speed={1.2} color="#48b6ff"
               direction="top" className="…" />

   Props mirror the snippet so it can be swapped 1:1 later if we
   migrate to a shared lib version.
   ───────────────────────────────────────────────────────────── */

type Direction = 'top' | 'bottom' | 'left' | 'right';

interface SparklesProps {
  /** Particles per million pixels of canvas. ~1800 = dense field. */
  density?: number;
  /** Multiplier on per-frame velocity. 1.0 = baseline. */
  speed?: number;
  /** Particle color. Any valid CSS color. */
  color?: string;
  /** Drift direction for particles. */
  direction?: Direction;
  /** Optional className for the wrapper canvas. */
  className?: string;
  /** Min/max particle radius in CSS px. */
  minSize?: number;
  maxSize?: number;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  /** Twinkle phase 0..2π */
  tw: number;
  /** Twinkle speed (rad/frame) */
  ts: number;
  /** Base opacity 0..1 */
  base: number;
}

export function Sparkles({
  density = 1800,
  speed = 1.2,
  color = '#48b6ff',
  direction = 'top',
  className,
  minSize = 0.4,
  maxSize = 1.6,
}: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Honor reduced-motion: render a single still frame, no animation.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let widthCss = 0;
    let heightCss = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let running = true;

    const seedParticles = () => {
      // density is "per million CSS pixels" so it stays balanced across sizes.
      const area = widthCss * heightCss;
      const target = Math.max(40, Math.round((area / 1_000_000) * density));
      particles = new Array(target).fill(0).map(() => makeParticle(true));
    };

    const makeParticle = (anywhere: boolean): Particle => {
      // Spawn somewhere along the trailing edge so the field "flows" in,
      // unless we're seeding the initial frame — in which case scatter.
      const r = Math.random() * (maxSize - minSize) + minSize;
      let x: number, y: number;
      if (anywhere) {
        x = Math.random() * widthCss;
        y = Math.random() * heightCss;
      } else {
        if (direction === 'top') {
          x = Math.random() * widthCss;
          y = heightCss + r;
        } else if (direction === 'bottom') {
          x = Math.random() * widthCss;
          y = -r;
        } else if (direction === 'left') {
          x = widthCss + r;
          y = Math.random() * heightCss;
        } else {
          x = -r;
          y = Math.random() * heightCss;
        }
      }
      // Velocity along the chosen axis with a tiny lateral wobble.
      const baseV = (0.18 + Math.random() * 0.4) * speed;
      const lateral = (Math.random() - 0.5) * 0.06 * speed;
      let vx = 0;
      let vy = 0;
      if (direction === 'top') {
        vy = -baseV;
        vx = lateral;
      } else if (direction === 'bottom') {
        vy = baseV;
        vx = lateral;
      } else if (direction === 'left') {
        vx = -baseV;
        vy = lateral;
      } else {
        vx = baseV;
        vy = lateral;
      }
      return {
        x,
        y,
        r,
        vx,
        vy,
        tw: Math.random() * Math.PI * 2,
        ts: 0.015 + Math.random() * 0.04,
        base: 0.45 + Math.random() * 0.55,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      widthCss = Math.max(1, rect.width);
      heightCss = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(widthCss * dpr);
      canvas.height = Math.round(heightCss * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles();
    };

    const respawn = (p: Particle) => {
      Object.assign(p, makeParticle(false));
    };

    const step = () => {
      if (!running) return;
      ctx.clearRect(0, 0, widthCss, heightCss);
      ctx.fillStyle = color;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.tw += p.ts;
        // Twinkle modulates opacity around base level.
        const a = p.base * (0.55 + 0.45 * Math.sin(p.tw));
        ctx.globalAlpha = Math.min(1, Math.max(0, a));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        // Wrap or respawn when leaving the canvas in the drift direction.
        if (
          (direction === 'top' && p.y < -2) ||
          (direction === 'bottom' && p.y > heightCss + 2) ||
          (direction === 'left' && p.x < -2) ||
          (direction === 'right' && p.x > widthCss + 2) ||
          p.x < -10 ||
          p.x > widthCss + 10 ||
          p.y < -10 ||
          p.y > heightCss + 10
        ) {
          respawn(p);
        }
      }
      ctx.globalAlpha = 1;
      raf = window.requestAnimationFrame(step);
    };

    resize();

    if (reduced) {
      // One static frame is more than enough texture.
      ctx.fillStyle = color;
      for (const p of particles) {
        ctx.globalAlpha = p.base * 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      raf = window.requestAnimationFrame(step);
    }

    // Re-seed on container size changes so density stays balanced.
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pause when the section is fully offscreen — saves cycles on long pages.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !running && !reduced) {
            running = true;
            raf = window.requestAnimationFrame(step);
          } else if (!e.isIntersecting && running) {
            running = false;
            window.cancelAnimationFrame(raf);
          }
        }
      },
      { threshold: 0.01 }
    );
    io.observe(canvas);

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [density, speed, color, direction, minSize, maxSize]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

export default Sparkles;
