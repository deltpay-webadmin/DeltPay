import { useEffect, useRef, useCallback } from 'react';

interface SparklesProps {
  density?: number;
  speed?: number;
  size?: number;
  direction?: 'top' | 'bottom' | 'left' | 'right';
  opacitySpeed?: number;
  color?: string;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  targetOpacity: number;
  fadeTimer: number;
  fadeDuration: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

export function Sparkles({
  density = 400,
  speed = 1,
  size = 1.2,
  direction = 'top',
  opacitySpeed = 1.5,
  color = '#32A7FF',
  className = '',
}: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const particles = useRef<Particle[]>([]);
  const rgb = hexToRgb(color);

  const initParticles = useCallback((w: number, h: number) => {
    const count = Math.floor((w * h) / (1e6 / density));
    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15 * speed,
        vy:
          direction === 'top'
            ? -(Math.random() * 0.4 + 0.1) * speed
            : direction === 'bottom'
            ? (Math.random() * 0.4 + 0.1) * speed
            : direction === 'left'
            ? -(Math.random() * 0.4 + 0.1) * speed
            : (Math.random() * 0.4 + 0.1) * speed,
        size: Math.random() * size + 0.3,
        opacity: Math.random(),
        targetOpacity: Math.random() > 0.5 ? 1 : 0,
        fadeTimer: 0,
        fadeDuration: (Math.random() * 2 + 1) / opacitySpeed,
      });
    }
    particles.current = arr;
  }, [density, speed, size, direction, opacitySpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = 0, h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      initParticles(w, h);
    };

    resize();
    window.addEventListener('resize', resize);

    const dt = 1 / 60;
    let running = false;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of particles.current) {
        // Fade
        p.fadeTimer += dt;
        if (p.fadeTimer >= p.fadeDuration) {
          p.fadeTimer = 0;
          p.fadeDuration = (Math.random() * 2 + 1) / opacitySpeed;
          p.targetOpacity = p.targetOpacity > 0.5 ? 0 : 1;
        }
        p.opacity += (p.targetOpacity - p.opacity) * 0.03 * opacitySpeed;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.y < -2) p.y = h + 2;
        if (p.y > h + 2) p.y = -2;
        if (p.x < -2) p.x = w + 2;
        if (p.x > w + 2) p.x = -2;

        // Draw
        if (p.opacity < 0.02) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${p.opacity})`;
        ctx.fill();
      }

      if (running) {
        raf.current = requestAnimationFrame(draw);
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      raf.current = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf.current);
    };

    // Only run the particle sim while the canvas is in the viewport
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      io.disconnect();
      stop();
      window.removeEventListener('resize', resize);
    };
  }, [initParticles, rgb, opacitySpeed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ pointerEvents: 'none' }}
    />
  );
}
