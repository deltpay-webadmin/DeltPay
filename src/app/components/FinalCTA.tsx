import { motion, useInView } from 'motion/react';
import { useRef, useEffect, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

const NAVY = '#041E42';
const PURPLE = '#4945FF';
const WHITE = '#FFFFFF';
const JAKARTA = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

/* ─── Interactive Dot Grid Canvas ─── */
function InteractiveDots({
  mouseRef,
  drawFnRef,
}: {
  mouseRef: React.RefObject<{ x: number; y: number }>;
  drawFnRef: React.MutableRefObject<(() => void) | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      ctx.clearRect(0, 0, w, h);

      const spacing = 32;
      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 1;
      const mx = mouseRef.current!.x;
      const my = mouseRef.current!.y;
      const hoverRadius = 160;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacing;
          const y = row * spacing;
          const dx = mx - x;
          const dy = my - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - dist / hoverRadius);

          const baseAlpha = 0.15;
          const alpha = baseAlpha + influence * 0.55;
          const baseSize = 1.5;
          const size = baseSize + influence * 3.5;

          const r = Math.round(73 + influence * 150);
          const g = Math.round(69 + influence * 150);
          const b = 255;

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fill();

          if (influence > 0.15) {
            const neighbors: [number, number][] = [
              [col + 1, row],
              [col, row + 1],
              [col + 1, row + 1],
            ];
            for (const [nc, nr] of neighbors) {
              if (nc >= cols || nr >= rows) continue;
              const nx = nc * spacing;
              const ny = nr * spacing;
              const ndx = mx - nx;
              const ndy = my - ny;
              const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
              const nInfluence = Math.max(0, 1 - ndist / hoverRadius);
              if (nInfluence > 0.15) {
                const lineAlpha = Math.min(influence, nInfluence) * 0.3;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(nx, ny);
                ctx.strokeStyle = `rgba(73,69,255,${lineAlpha})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
              }
            }
          }
        }
      }
    };

    drawFnRef.current = draw;

    // Initial static render + redraw on resize
    draw();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      drawFnRef.current = null;
    };
  }, [mouseRef, drawFnRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}

/* ─── Floating glow orbs ─── */
function GlowOrb({ top, left, right, bottom, size, opacity }: { top?: number; left?: number | string; right?: number; bottom?: number; size: number; opacity: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      animate={{ scale: [1, 1.15, 1], opacity: [opacity, opacity * 1.3, opacity] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        top, left, right, bottom,
        width: size, height: size,
        background: `radial-gradient(circle, rgba(73,69,255,${opacity}) 0%, rgba(0,0,0,0) 70%)`,
      }}
    />
  );
}

export function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const drawFnRef = useRef<(() => void) | null>(null);
  const pendingFrame = useRef(false);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const scheduleDraw = useCallback(() => {
    if (pendingFrame.current) return;
    pendingFrame.current = true;
    requestAnimationFrame(() => {
      pendingFrame.current = false;
      drawFnRef.current?.();
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Account for body zoom (0.8) — clientX/Y are unzoomed but getBoundingClientRect is zoomed
    const zoom = parseFloat(getComputedStyle(document.body).zoom) || 1;
    mouseRef.current = {
      x: (e.clientX / zoom) - rect.left,
      y: (e.clientY / zoom) - rect.top,
    };
    scheduleDraw();
  }, [scheduleDraw]);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
    scheduleDraw();
  }, [scheduleDraw]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ background: NAVY, cursor: 'default', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Interactive dot grid */}
      <InteractiveDots mouseRef={mouseRef} drawFnRef={drawFnRef} />

      {/* Glow orbs matching reference corners */}
      <GlowOrb top={-60} left={-60} size={280} opacity={0.1} />
      <GlowOrb top={-40} right={-40} size={240} opacity={0.07} />
      <GlowOrb bottom={-80} left="50%" size={500} opacity={0.05} />
      <GlowOrb bottom={40} left={80} size={180} opacity={0.06} />
      <GlowOrb bottom={60} right={100} size={200} opacity={0.08} />

      {/* Content */}
      <div
        ref={ref}
        className="relative z-10"
        style={{ maxWidth: 800, margin: '0 auto', padding: '60px 48px', textAlign: 'center', pointerEvents: 'none' }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: JAKARTA,
            fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)',
            fontWeight: 800,
            color: WHITE,
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            marginBottom: 20,
          }}
        >
          Start free. See the difference this week.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: JAKARTA,
            fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
            color: 'rgba(255,255,255,0.50)',
            lineHeight: 1.7,
            marginBottom: 44,
            maxWidth: 560,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Payments, funding, a website, and AI — all in one place. Start free today.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="flex justify-center"
          style={{ pointerEvents: 'auto' }}
        >
          <Link
            to="/get-funded"
            className="inline-flex items-center no-underline"
            style={{
              gap: 10,
              background: PURPLE,
              color: WHITE,
              fontFamily: JAKARTA,
              fontSize: 15,
              fontWeight: 700,
              padding: '14px 36px',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(73,69,255,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(73,69,255,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(73,69,255,0.3)'; }}
          >
            Get started <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}