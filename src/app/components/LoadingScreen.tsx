import { useState, useEffect, useRef } from 'react';
import logoImage from 'figma:asset/61527edee0ea2e963bace756584cec3657b62f9e.png';

// Fixed number of points for smooth interpolation between shapes
const POINT_COUNT = 64;
const CX = 150;
const CY = 150;
const OUTER_R = 90;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate star/polygon points as flat [x1,y1,x2,y2,...] array
// Always produces exactly POINT_COUNT points for consistent morphing
function generateShape(): number[] {
  const innerR = randomInt(15, 75);
  const spikes = randomInt(3, 32); // How many spike pairs
  const points: number[] = [];

  for (let i = 0; i < POINT_COUNT; i++) {
    // Map i to a spike pattern
    const angle = (2 * Math.PI * i) / POINT_COUNT - Math.PI / 2;
    // Create spiky pattern: alternate between outer and inner radius
    const spikePhase = (i / POINT_COUNT) * spikes * 2 * Math.PI;
    const r = OUTER_R + (innerR - OUTER_R) * Math.max(0, Math.sin(spikePhase));
    points.push(
      CX + Math.round(r * Math.cos(angle)),
      CY + Math.round(r * Math.sin(angle)),
    );
  }
  return points;
}

// Generate a smooth circle
function generateCircle(r: number): number[] {
  const points: number[] = [];
  for (let i = 0; i < POINT_COUNT; i++) {
    const angle = (2 * Math.PI * i) / POINT_COUNT - Math.PI / 2;
    points.push(
      CX + Math.round(r * Math.cos(angle)),
      CY + Math.round(r * Math.sin(angle)),
    );
  }
  return points;
}

// Convert flat array to SVG polygon points string
function toPointsString(arr: number[]): string {
  let s = '';
  for (let i = 0; i < arr.length; i += 2) {
    s += `${Math.round(arr[i])},${Math.round(arr[i + 1])} `;
  }
  return s.trim();
}

// Lerp between two arrays
function lerp(from: number[], to: number[], t: number): number[] {
  return from.map((v, i) => v + (to[i] - v) * t);
}

// Easing: inOutCirc (matches the anime.js example)
function easeInOutCirc(t: number): number {
  return t < 0.5
    ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2
    : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2;
}

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [phase, setPhase] = useState<'morph' | 'resolve' | 'logo'>('morph');
  const [polygonPoints, setPolygonPoints] = useState('');

  const currentShapeRef = useRef<number[]>(generateCircle(OUTER_R));
  const targetShapeRef = useRef<number[]>(generateShape());
  const animStartRef = useRef(0);
  const morphCountRef = useRef(0);
  const rafRef = useRef(0);
  const morphDuration = 500; // matches anime.js example duration
  const totalMorphs = 8;

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Set initial polygon
  useEffect(() => {
    setPolygonPoints(toPointsString(currentShapeRef.current));
    animStartRef.current = performance.now();
  }, []);

  // Morph animation loop
  useEffect(() => {
    if (phase !== 'morph') return;
    let running = true;

    function tick(now: number) {
      if (!running) return;

      const elapsed = now - animStartRef.current;
      const progress = Math.min(elapsed / morphDuration, 1);
      const eased = easeInOutCirc(progress);

      const interpolated = lerp(currentShapeRef.current, targetShapeRef.current, eased);
      setPolygonPoints(toPointsString(interpolated));

      if (progress >= 1) {
        morphCountRef.current++;
        currentShapeRef.current = targetShapeRef.current;

        if (morphCountRef.current >= totalMorphs) {
          // Final morph: resolve to circle
          targetShapeRef.current = generateCircle(50);
          setPhase('resolve');
          return;
        }

        targetShapeRef.current = generateShape();
        animStartRef.current = now;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  // Resolve animation: morph to circle then show logo
  useEffect(() => {
    if (phase !== 'resolve') return;
    let running = true;
    const start = performance.now();
    const duration = 600;

    function tick(now: number) {
      if (!running) return;
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeInOutCirc(progress);
      const interpolated = lerp(currentShapeRef.current, targetShapeRef.current, eased);
      setPolygonPoints(toPointsString(interpolated));

      if (progress >= 1) {
        setPhase('logo');
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  // Logo phase: show logo then fade out
  useEffect(() => {
    if (phase !== 'logo') return;
    const fadeTimer = setTimeout(() => setIsAnimatingOut(true), 1400);
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }, 2200);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [phase]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#080A28] flex items-center justify-center transition-opacity duration-700 ${
        isAnimatingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Ambient glow behind morph */}
      <div
        className="absolute rounded-full transition-all duration-700"
        style={{
          width: phase === 'logo' ? 600 : 400,
          height: phase === 'logo' ? 600 : 400,
          background: 'radial-gradient(circle, rgba(73,69,255,0.3) 0%, rgba(73,69,255,0.06) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Morphing polygon SVG */}
      <div
        className="absolute transition-all ease-out"
        style={{
          opacity: phase === 'logo' ? 0 : 1,
          transform: phase === 'resolve' ? 'scale(0.5)' : 'scale(1)',
          transitionDuration: phase === 'resolve' ? '600ms' : phase === 'logo' ? '500ms' : '0ms',
        }}
      >
        <svg width="300" height="300" viewBox="0 0 300 300">
          <defs>
            <filter id="morphGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Shadow echo polygon */}
          <polygon
            points={polygonPoints}
            fill="none"
            stroke="#4945FF"
            strokeWidth="1.5"
            opacity="0.2"
            style={{ transform: 'scale(1.12)', transformOrigin: 'center' }}
          />
          {/* Main morphing polygon */}
          <polygon
            points={polygonPoints}
            fill="#4945FF"
            filter="url(#morphGlow)"
          />
          {/* Inner highlight */}
          <polygon
            points={polygonPoints}
            fill="url(#innerShine)"
            opacity="0.25"
          />
          <defs>
            <radialGradient id="innerShine" cx="40%" cy="35%">
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Orbiting particles during morph */}
      {phase === 'morph' && (
        <div className="absolute" style={{ width: 0, height: 0 }}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 4 + (i % 3),
                height: 4 + (i % 3),
                backgroundColor: `rgba(73, 69, 255, ${0.4 + (i % 3) * 0.15})`,
                animation: `orbit ${2.5 + i * 0.4}s linear infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Logo + tagline reveal */}
      <div
        className="flex flex-col items-center gap-5 transition-all duration-700 ease-out"
        style={{
          opacity: phase === 'logo' ? 1 : 0,
          transform: phase === 'logo' ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(16px)',
          transitionDelay: phase === 'logo' ? '100ms' : '0ms',
        }}
      >
        {/* Delt logo icon image */}
        <div className="relative">
          <img
            src={logoImage}
            alt="Delt"
            className="h-20 sm:h-24 relative z-10"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              filter: 'brightness(0) invert(1)',
            }}
          />
          {/* Glow behind logo */}
          <div
            className="absolute inset-0 -m-4"
            style={{
              background: 'radial-gradient(circle, rgba(73,69,255,0.4) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
        </div>

        {/* Tagline */}
        <div
          className="text-white/50 text-lg sm:text-xl tracking-[0.15em] transition-all duration-600"
          style={{
            opacity: phase === 'logo' ? 1 : 0,
            transform: phase === 'logo' ? 'translateY(0)' : 'translateY(10px)',
            transitionDelay: phase === 'logo' ? '400ms' : '0ms',
          }}
        >
          Grow at your speed
        </div>
      </div>

      <style>{`
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(110px) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: rotate(360deg) translateX(110px) rotate(-360deg);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
