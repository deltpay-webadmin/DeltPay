import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';

interface EarthProps {
  className?: string;
  theta?: number;
  dark?: number;
  scale?: number;
  diffuse?: number;
  mapSamples?: number;
  mapBrightness?: number;
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
  markers?: Array<{ location: [number, number]; size: number; color?: [number, number, number] }>;
  markerElevation?: number;
}

const Earth: React.FC<EarthProps> = ({
  className = '',
  theta = 0.25,
  dark = 1,
  scale = 1.1,
  diffuse = 1.2,
  mapSamples = 16000,
  mapBrightness = 6,
  baseColor = [0.4, 0.6509, 1],
  markerColor = [1, 0, 0],
  glowColor = [0.2745, 0.5765, 0.898],
  markers = [],
  markerElevation = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    let width = canvas.offsetWidth || 400;
    let phi = 0;
    let animId = 0;
    let running = false;
    let inView = false;
    let scrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    // Cap pixel ratio: 1.5 is plenty for a spinning globe and saves ~44% of
    // the shader work vs. the previous hard-coded 2.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: width * dpr,
      height: width * dpr,
      phi: 0,
      theta,
      dark,
      scale,
      diffuse,
      mapSamples,
      mapBrightness,
      baseColor,
      markerColor,
      glowColor,
      opacity: 1,
      offset: [0, 0],
      markers: markers.map(m => ({
        location: m.location,
        size: m.size,
        color: m.color,
      })),
      markerElevation,
    });

    // cobe v2 uses globe.update() in a rAF loop instead of onRender
    function animate() {
      phi += 0.003;
      const w = canvas.offsetWidth || width;
      if (w > 0) width = w;
      globe.update({ phi, width: width * dpr, height: width * dpr });
      if (running) {
        animId = requestAnimationFrame(animate);
      }
    }

    const start = () => {
      if (running) return;
      running = true;
      animId = requestAnimationFrame(animate);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(animId);
    };
    // Only animate if the canvas is both on-screen AND the user isn't
    // actively scrolling. The globe is the most expensive thing on the page,
    // so yielding to the scroll compositor gives the smoothest feel.
    const reconcile = () => {
      if (inView && !scrolling) start();
      else stop();
    };

    // Pause rotation while the user is scrolling; resume ~150ms after the
    // last scroll event. The globe looks static during fast scrolls (which
    // the user isn't focused on anyway) and smoothly resumes at rest.
    const onScroll = () => {
      if (!scrolling) {
        scrolling = true;
        stop();
      }
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        scrolling = false;
        scrollTimer = null;
        reconcile();
      }, 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Only spin the globe while it is on screen
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        reconcile();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    setReady(true);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
      stop();
      globe.destroy();
    };
  }, [theta, dark, scale, diffuse, mapSamples, mapBrightness]);

  return (
    <div
      className={`flex items-center justify-center z-10 ${className}`}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 1s ease' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          aspectRatio: '1',
          // Promote to its own compositor layer so globe paints don't
          // invalidate surrounding scroll-composited content.
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  );
};

export default Earth;