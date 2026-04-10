import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { DashboardPreview } from './DashboardPreview';

const CYCLING_WORDS = ['always found.', 'instantly paid.', 'one step ahead.', 'running itself.'];

/* ── Mesh Gradient Blob ── */
interface Blob {
  cx: number; cy: number; // orbit center (normalized 0-1)
  orbitRx: number; orbitRy: number; // orbit radii (normalized)
  speed: number; phase: number; // orbit speed & phase offset
  radius: number; // blob radius (normalized to w)
  color: [number, number, number, number]; // rgba
  breathSpeed: number; breathAmp: number; // pulsing
}

/* ── Animated Mesh Gradient Canvas ── */
function MeshGradientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });

  const handleMove = useCallback((e: MouseEvent) => {
    const z = 0.8;
    mouse.current.tx = (e.clientX / z) / window.innerWidth;
    mouse.current.ty = (e.clientY / z) / window.innerHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = 0, h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };

    // Each blob orbits around its center point with different speeds/phases
    const blobs: Blob[] = [
      // Main large purple glow — slow wide orbit bottom-left
      { cx: 0.25, cy: 0.72, orbitRx: 0.15, orbitRy: 0.12, speed: 0.3, phase: 0, radius: 0.65, color: [73, 69, 255, 0.75], breathSpeed: 1.2, breathAmp: 0.1 },
      // Secondary purple — orbits center-left
      { cx: 0.35, cy: 0.55, orbitRx: 0.2, orbitRy: 0.18, speed: 0.45, phase: 1.8, radius: 0.45, color: [90, 80, 255, 0.55], breathSpeed: 0.9, breathAmp: 0.12 },
      // Bright purple hotspot — tighter orbit
      { cx: 0.2, cy: 0.65, orbitRx: 0.08, orbitRy: 0.1, speed: 0.7, phase: 3.2, radius: 0.22, color: [120, 100, 255, 0.7], breathSpeed: 1.6, breathAmp: 0.15 },
      // Upper atmosphere blue-purple
      { cx: 0.4, cy: 0.25, orbitRx: 0.18, orbitRy: 0.1, speed: 0.25, phase: 0.9, radius: 0.5, color: [50, 45, 200, 0.35], breathSpeed: 0.7, breathAmp: 0.08 },
      // Right-side deep navy shadow
      { cx: 0.78, cy: 0.4, orbitRx: 0.12, orbitRy: 0.2, speed: 0.2, phase: 2.5, radius: 0.55, color: [4, 15, 40, 0.85], breathSpeed: 0.5, breathAmp: 0.06 },
      // Bottom purple wash
      { cx: 0.45, cy: 0.95, orbitRx: 0.25, orbitRy: 0.08, speed: 0.35, phase: 4.1, radius: 0.55, color: [73, 69, 255, 0.5], breathSpeed: 1.0, breathAmp: 0.1 },
      // Subtle teal shimmer
      { cx: 0.3, cy: 0.5, orbitRx: 0.12, orbitRy: 0.15, speed: 0.55, phase: 5.0, radius: 0.2, color: [22, 180, 160, 0.1], breathSpeed: 1.3, breathAmp: 0.2 },
      // Top-right darkness
      { cx: 0.7, cy: 0.1, orbitRx: 0.1, orbitRy: 0.08, speed: 0.15, phase: 1.2, radius: 0.5, color: [3, 10, 28, 0.7], breathSpeed: 0.4, breathAmp: 0.05 },
      // Wandering bright accent — fast orbit
      { cx: 0.15, cy: 0.8, orbitRx: 0.22, orbitRy: 0.25, speed: 0.6, phase: 2.0, radius: 0.18, color: [140, 120, 255, 0.65], breathSpeed: 2.0, breathAmp: 0.18 },
    ];

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMove);

    let t = 0;
    let running = false;
    const draw = () => {
      t += 0.008; // 2x faster time progression
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.03;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.03;

      // Deep navy base
      ctx.fillStyle = '#041E42';
      ctx.fillRect(0, 0, w, h);

      // Animate & draw each blob
      for (const blob of blobs) {
        // Orbital position
        const bx = (blob.cx + Math.sin(t * blob.speed + blob.phase) * blob.orbitRx) * w;
        const by = (blob.cy + Math.cos(t * blob.speed * 0.7 + blob.phase + 1.5) * blob.orbitRy) * h;

        // Mouse repulsion for depth feel
        const mx = mouse.current.x * w;
        const my = mouse.current.y * h;
        const dx = bx - mx;
        const dy = by - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repel = Math.max(0, 1 - dist / (w * 0.4)) * 30;
        const fx = dist > 0 ? (dx / dist) * repel : 0;
        const fy = dist > 0 ? (dy / dist) * repel : 0;

        const finalX = bx + fx;
        const finalY = by + fy;

        // Breathing radius
        const breathe = 1 + Math.sin(t * blob.breathSpeed + blob.phase * 2) * blob.breathAmp;
        const rad = blob.radius * w * breathe;

        // Draw
        const [r, g, b, a] = blob.color;
        const grad = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, rad);
        grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
        grad.addColorStop(0.3, `rgba(${r},${g},${b},${a * 0.7})`);
        grad.addColorStop(0.6, `rgba(${r},${g},${b},${a * 0.25})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Soft center darkening for text readability
      const contentGlow = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, w * 0.22);
      contentGlow.addColorStop(0, 'rgba(4,30,66,0.25)');
      contentGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = contentGlow;
      ctx.fillRect(0, 0, w, h);

      // Bottom fade into section below
      const botV = ctx.createLinearGradient(0, h * 0.78, 0, h);
      botV.addColorStop(0, 'rgba(4,30,66,0)');
      botV.addColorStop(1, 'rgba(4,30,66,1)');
      ctx.fillStyle = botV;
      ctx.fillRect(0, h * 0.78, w, h * 0.22);

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

    // Only animate while the hero canvas is in the viewport
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      io.disconnect();
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
    };
  }, [handleMove]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

export function JuspayHero() {
  const [loaded, setLoaded] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % CYCLING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const titleY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);
  const subY = useTransform(scrollYProgress, [0.05, 0.5], [0, -60]);
  const subOpacity = useTransform(scrollYProgress, [0.05, 0.35], [1, 0]);

  return (
    <>
      <section ref={sectionRef} className="ih-section">
        <MeshGradientCanvas />

        {/* Noise overlay */}
        <div className="ih-noise" />

        <div className="ih-container">
          <motion.div
            className="ih-content"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Left column */}
            <div className="ih-left">
              <motion.h1
                className="ih-title"
                style={{ y: titleY, opacity: titleOpacity, scale: titleScale }}
              >
                <motion.span
                  className="ih-title-line"
                  initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  Your business,
                </motion.span>
                <motion.span
                  className="ih-title-line ih-title-accent"
                  initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="ih-cycling-wrapper">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={CYCLING_WORDS[wordIndex]}
                        className="ih-title-accent"
                        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {CYCLING_WORDS[wordIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </motion.span>
              </motion.h1>

              <motion.p className="ih-subtitle" style={{ y: subY, opacity: subOpacity }}>
                Launch your site, accept payments,<br />
                and access capital — all from one platform.
              </motion.p>
              <motion.p className="ih-subtitle-ai" style={{ y: subY, opacity: subOpacity }}>
                Powered by AI that learns your business.
              </motion.p>

              <motion.div className="ih-ctas" style={{ y: subY, opacity: subOpacity }}>
                <Link to="/apply" className="ih-btn-primary">
                  Get Started <span className="ih-btn-arrow">›</span>
                </Link>
                <Link to="/sandbox" className="ih-btn-ghost">
                  See the demo <span className="ih-btn-arrow">›</span>
                </Link>
              </motion.div>

              <motion.p className="ih-social-proof" style={{ y: subY, opacity: subOpacity }}>
                <span className="ih-social-proof-dot" />
                Join 200+ merchants who went live this month
              </motion.p>
            </div>

            {/* Right column — dashboard graphic */}
            <motion.div
              className="ih-right"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <DashboardPreview />
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom transition band */}
        <div className="ih-transition" />
      </section>

      {/* Trust bar */}
      <section className="ih-trust">
        <div className="ih-trust-inner">
          <span className="ih-trust-label">Trusted by growing businesses nationwide</span>
          <div className="ih-trust-marquee">
            <div className="ih-trust-track">
              {[...Array(2)].map((_, setIdx) => (
                ['Bloom & Co.', 'Ember Kitchen', 'Atlas Fitness', 'Pinecone Roasters', 'Riverwalk Retail', 'Basecamp Outdoors', 'Lumen Salon', 'Horizon Brewing', 'Crestview Dental', 'Sage & Vine', 'Northpoint Auto', 'Tidal Wave Surf', 'Copper Lane Café', 'Sterling Home Services', 'Jade Wellness Studio', 'Oakbridge Supply', 'Moonrise Bakery', 'Ironclad Barber', 'Verdant Gardens', 'Summit Cycle Co.', 'Harborview Deli', 'Foxglove Florals', 'Ridgeline Gear', 'Prism Optometry', 'Kindling Coffee'].map((name) => (
                  <span key={`${setIdx}-${name}`} className="ih-trust-item">{name}</span>
                ))
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .ih-section {
          background: #041E42;
          position: relative;
          overflow: hidden;
          min-height: 110vh;
          display: flex;
          flex-direction: column;
        }

        .ih-noise {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0.03;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 128px 128px;
        }

        .ih-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 220px 48px 160px;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .ih-content {
          text-align: left;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 250px;
          align-items: center;
          width: 100%;
          position: relative;
          z-index: 2;
        }

        .ih-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .ih-right {
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: center;
        }

        .ih-dash-img {
          width: 100%;
          max-width: 580px;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 25px 80px rgba(0,0,0,0.5), 0 0 100px rgba(73,69,255,0.15);
          transform: perspective(1200px) rotateY(-8deg) rotateX(2deg);
          transition: transform 0.4s ease;
        }

        .ih-dash-img:hover {
          transform: perspective(1200px) rotateY(-4deg) rotateX(1deg);
        }

        .ih-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #4945FF;
          background: rgba(73,69,255,0.08);
          border: 1px solid rgba(73,69,255,0.18);
          padding: 7px 18px;
          border-radius: 100px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 40px;
          backdrop-filter: blur(12px);
        }

        .ih-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4945FF;
          box-shadow: 0 0 8px rgba(73,69,255,0.6);
          animation: ih-pulse 2s ease-in-out infinite;
        }

        @keyframes ih-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(73,69,255,0.6); }
          50% { opacity: 0.5; box-shadow: 0 0 16px rgba(73,69,255,0.9); }
        }

        .ih-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(2.8rem, 5.5vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.035em;
          color: #fff;
          margin: 0 0 28px;
        }

        .ih-title-line {
          display: block;
        }

        .ih-cycling-wrapper {
          display: inline-block;
          position: relative;
          overflow: hidden;
          vertical-align: bottom;
          height: 1.55em;
          padding-top: 0.1em;
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 8%,
            black 90%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 8%,
            black 90%,
            transparent 100%
          );
        }

        .ih-cycling-wrapper .ih-title-accent {
          display: inline-block;
        }

        .ih-title-accent {
          color: #FFFFFF;
          text-shadow: 0 0 20px rgba(123, 97, 255, 0.8), 0 0 60px rgba(123, 97, 255, 0.4);
          -webkit-text-fill-color: #FFFFFF;
          background: none;
          -webkit-background-clip: unset;
          background-clip: unset;
          background-size: unset;
          animation: none;
          font-style: italic;
          font-family: 'Playfair Display', serif;
        }

        .ih-subtitle {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px;
          line-height: 1.75;
          color: rgba(255,255,255,0.7);
          max-width: 460px;
          margin: 0 0 0;
          text-align: left;
        }

        .ih-subtitle-ai {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px;
          line-height: 1.75;
          color: rgba(255,255,255,0.7);
          max-width: 460px;
          margin: 20px 0 48px;
          text-align: left;
        }

        .ih-br { display: block; }

        .ih-ctas {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .ih-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 34px;
          border-radius: 12px;
          background: #4318FF;
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s, box-shadow 0.3s;
          box-shadow: 0 0 28px rgba(67,24,255,0.25), 0 4px 14px rgba(0,0,0,0.2);
        }
        .ih-btn-primary:hover {
          background: #3712e0;
          transform: translateY(-1px);
          box-shadow: 0 0 44px rgba(67,24,255,0.4), 0 8px 24px rgba(0,0,0,0.3);
        }

        .ih-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 15px 30px;
          border-radius: 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
          backdrop-filter: blur(8px);
        }
        .ih-btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.22);
        }

        .ih-btn-arrow {
          font-size: 18px;
          transition: transform 0.2s;
        }
        .ih-btn-primary:hover .ih-btn-arrow,
        .ih-btn-ghost:hover .ih-btn-arrow {
          transform: translateX(2px);
        }

        .ih-social-proof {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          line-height: 1.5;
          color: rgba(255,255,255,0.5);
          max-width: 460px;
          margin: 20px 0 0;
          text-align: left;
        }

        .ih-social-proof-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4945FF;
          box-shadow: 0 0 8px rgba(73,69,255,0.6);
          animation: ih-pulse 2s ease-in-out infinite;
          margin-right: 8px;
        }

        /* Bottom transition */
        .ih-transition {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(to bottom, rgba(4,30,66,0), #041E42);
          z-index: 3;
          pointer-events: none;
        }

        /* Trust section */
        .ih-trust {
          background: #041E42;
          padding: 40px 0 40px;
          width: 100%;
        }

        .ih-trust-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .ih-trust-label {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ih-trust-marquee {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(90deg, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, black 5%, black 95%, transparent);
        }

        .ih-trust-track {
          display: flex;
          animation: ih-marquee 32s linear infinite;
        }

        .ih-trust-item {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: rgba(255,255,255,0.25);
          letter-spacing: -0.01em;
          white-space: nowrap;
          padding: 0 32px;
          flex-shrink: 0;
          transition: color 0.3s;
        }

        @keyframes ih-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @media (max-width: 900px) {
          .ih-container { padding: 160px 24px 100px; }
          .ih-content { grid-template-columns: 1fr; gap: 48px; text-align: center; }
          .ih-left { align-items: center; }
          .ih-right { display: none; }
          .ih-subtitle { text-align: center; }
          .ih-trust { padding: 80px 24px 60px; }
          .ih-br { display: none; }
        }
      `}</style>
    </>
  );
}