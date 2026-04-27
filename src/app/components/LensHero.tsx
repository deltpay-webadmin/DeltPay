import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { ScrollIndicator } from './ScrollIndicator';
import deltLogoImg from 'figma:asset/ba16007295b082bbfe774b1ba0c31a403b5502d6.png';

const ACCENT = '#4945FF';
const DEEP = '#041E42';

/* ─────────────────────────────────────────────────────────────
   Portal geometry — mirrors LensPortal (DeltAiPage)
   ───────────────────────────────────────────────────────────── */
const CX = 400;
const CY = 400;
const VOID_R  = 150;
const MAIN_R  = 165;
const MID_R   = 200;
const OUTER_R = 230;

/* Constellation nodes (same layout as LensPortal) */
const CONSTELLATION = [
  { x: CX - 40, y: CY - 50, s: 2.5 },
  { x: CX + 55, y: CY - 30, s: 2 },
  { x: CX - 60, y: CY + 35, s: 3 },
  { x: CX + 30, y: CY + 55, s: 2 },
  { x: CX + 10, y: CY - 70, s: 1.5 },
  { x: CX - 25, y: CY + 10, s: 2.5 },
  { x: CX + 65, y: CY + 20, s: 1.5 },
  { x: CX - 10, y: CY - 20, s: 2 },
  { x: CX + 40, y: CY - 60, s: 1.8 },
  { x: CX - 50, y: CY - 15, s: 1.5 },
];
const EDGES = [
  [0,1],[1,4],[0,5],[2,5],[5,7],[7,1],[3,6],[6,1],[3,2],[8,1],[8,4],[0,9],[9,2],
];

/* Ambient particles between rings */
const PARTICLES = Array.from({ length: 30 }, (_, i) => {
  const angle = (i / 30) * Math.PI * 2 + i * 0.7;
  const r = 60 + (i % 7) * 18;
  return {
    x: CX + Math.cos(angle) * r,
    y: CY + Math.sin(angle) * r,
    size: 0.8 + (i % 4) * 0.5,
    id: i,
  };
});

/* Tick marks on outer ring */
const TICKS = Array.from({ length: 90 }, (_, i) => {
  const angle  = (i / 90) * Math.PI * 2 - Math.PI / 2;
  const isLong = i % 15 === 0;
  const isMed  = i % 5 === 0;
  const inner  = OUTER_R - (isLong ? 8 : isMed ? 5 : 2);
  return { angle, inner, isLong, isMed, i };
});

interface LensHeroProps {
  onAutoplay: () => void;
}

export function LensHero({ onAutoplay }: LensHeroProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasRun = useRef(false);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (hasRun.current || !svgRef.current) return;
    hasRun.current = true;

    const svgEl = svgRef.current;

    /* ── Set portal layers invisible initially ── */
    try {
      // Dynamic import to prevent crash if animejs fails to load
      import('animejs').then(({ createTimeline, animate, stagger, svg, utils }) => {
        utils.set(svgEl.querySelectorAll(
          '.p-outer-glow, .p-mid-ring, .p-mid-dash, .p-void-edge, .p-crosshair'
        ), { opacity: 0 });
        utils.set(svgEl.querySelectorAll('.p-constellation'), { opacity: 0 });
        utils.set(svgEl.querySelectorAll('.p-particle'),      { opacity: 0 });
        utils.set(svgEl.querySelector('.p-void')!,             { opacity: 0 });
        utils.set(svgEl.querySelector('.p-core-pulse')!,       { opacity: 0 });
        utils.set(svgEl.querySelector('.p-core-dot')!,         { opacity: 0, scale: 0 });
        utils.set(svgEl.querySelectorAll('.p-scan-arc'),       { opacity: 0 });
        utils.set(svgEl.querySelector('.p-tick-group')!,       { opacity: 0 });
        utils.set(svgEl.querySelector('.p-charge-ring')!,      { opacity: 0, scale: 0 });
        utils.set(svgEl.querySelector('.p-surge-flash')!,      { opacity: 0, scale: 0 });
        utils.set(svgEl.querySelector('.p-inner-charge')!,     { opacity: 0 });
        utils.set(svgEl.querySelector('.p-ambient-bg')!,       { opacity: 0 });

        /* ═══════════════════════════════════════════════════════
           POWER-UP TIMELINE — 7 phases over ~7 seconds
           ═══════════════════════════════════════════════════════ */
        const tl = createTimeline({ defaults: { ease: 'outQuad' } });

        /* ── PHASE 1: Cold Start (0–1200ms) ──
           Ambient glow fades in, void appears dimly, faint core flicker */
        tl.add(svgEl.querySelector('.p-ambient-bg') as SVGElement, {
          opacity: [0, 0.6], duration: 1200, ease: 'inOutQuad',
        }, 0);
        tl.add(svgEl.querySelector('.p-void') as SVGElement, {
          opacity: [0, 0.3], duration: 1000, ease: 'inOutQuad',
        }, 200);
        tl.add(svgEl.querySelector('.p-core-dot') as SVGElement, {
          scale: [0, 0.4], opacity: [0, 0.3], duration: 600, ease: 'outQuad',
        }, 600);
        /* Flicker the core dot */
        tl.add(svgEl.querySelector('.p-core-dot') as SVGElement, {
          opacity: [0.3, 0.05, 0.4, 0.1, 0.5], duration: 800, ease: 'linear',
        }, 900);

        /* ── PHASE 2: Initial Spark (1200–2400ms) ──
           Core ignites, inner charge ring pulses out, void solidifies */
        tl.add(svgEl.querySelector('.p-core-dot') as SVGElement, {
          scale: [0.4, 1.2, 0.8], opacity: [0.5, 1, 0.9], duration: 600, ease: 'outBack',
        }, 1200);
        tl.add(svgEl.querySelector('.p-core-pulse') as SVGElement, {
          opacity: [0, 0.6], duration: 500,
        }, 1300);
        tl.add(svgEl.querySelector('.p-charge-ring') as SVGElement, {
          opacity: [0, 0.5], scale: [0, 1], duration: 800, ease: 'outQuad',
        }, 1400);
        tl.add(svgEl.querySelector('.p-charge-ring') as SVGElement, {
          opacity: [0.5, 0], scale: [1, 2.5], duration: 600, ease: 'outQuad',
        }, 2000);
        tl.add(svgEl.querySelector('.p-void') as SVGElement, {
          opacity: [0.3, 0.8], duration: 800, ease: 'inOutQuad',
        }, 1500);
        tl.add(svgEl.querySelector('.p-void-edge') as SVGElement, {
          opacity: [0, 0.15], duration: 600,
        }, 1800);
        tl.add(svgEl.querySelector('.p-inner-charge') as SVGElement, {
          opacity: [0, 0.25], duration: 800,
        }, 1600);

        /* ── PHASE 3: Energy Gathering (2400–3600ms) ──
           Constellation nodes light up one by one, particles drift in */
        tl.add(svgEl.querySelectorAll('.p-constellation'), {
          opacity: [0, 0.35], duration: 400, delay: stagger(60, { from: 'center' }),
        }, 2400);
        tl.add(svgEl.querySelectorAll('.p-particle'), {
          opacity: [0, 0.15], duration: 500, delay: stagger(40, { from: 'random' }),
        }, 2600);
        tl.add(svgEl.querySelector('.p-void') as SVGElement, {
          opacity: [0.8, 1], duration: 600,
        }, 2800);
        tl.add(svgEl.querySelector('.p-void-edge') as SVGElement, {
          opacity: [0.15, 0.3], duration: 500,
        }, 3000);

        /* ── PHASE 4: Ring Ignition (3600–4800ms) ──
           Main energy ring draws in with building layered glow */
        const mainDrawable = svg.createDrawable(
          svgEl.querySelector('.p-main-ring-core') as SVGElement
        );
        tl.add(svgEl.querySelector('.p-main-ring-core') as SVGElement, {
          opacity: [0, 0.3], duration: 400,
        }, 3600);
        tl.add(mainDrawable, {
          draw: ['0 0', '0 1'], duration: 1800, ease: 'inOutCirc',
        }, 3600);
        /* Glow builds progressively */
        tl.add(svgEl.querySelector('.p-main-glow-soft') as SVGElement, {
          opacity: [0, 0.12], duration: 800, ease: 'inOutQuad',
        }, 3800);
        tl.add(svgEl.querySelector('.p-main-glow-soft') as SVGElement, {
          opacity: [0.12, 0.35], duration: 600, ease: 'inOutQuad',
        }, 4400);
        tl.add(svgEl.querySelector('.p-main-glow-bright') as SVGElement, {
          opacity: [0, 0.25], duration: 600, ease: 'inOutQuad',
        }, 4000);
        tl.add(svgEl.querySelector('.p-main-glow-bright') as SVGElement, {
          opacity: [0.25, 0.65], duration: 500, ease: 'inOutQuad',
        }, 4600);
        tl.add(svgEl.querySelector('.p-main-ring-core') as SVGElement, {
          opacity: [0.3, 0.88], duration: 600,
        }, 4400);
        tl.add(svgEl.querySelector('.p-main-edge') as SVGElement, {
          opacity: [0, 0.4], duration: 600,
        }, 4200);
        /* Surge flash at ring completion */
        tl.add(svgEl.querySelector('.p-surge-flash') as SVGElement, {
          opacity: [0, 0.6], scale: [0.8, 1.1], duration: 300, ease: 'outQuad',
        }, 4800);
        tl.add(svgEl.querySelector('.p-surge-flash') as SVGElement, {
          opacity: [0.6, 0], scale: [1.1, 1.4], duration: 500, ease: 'outQuad',
        }, 5100);

        /* ── PHASE 5: System Expansion (4800–5800ms) ──
           Mid rings, outer data ring, tick marks all come online */
        tl.add(svgEl.querySelectorAll('.p-mid-ring, .p-mid-dash'), {
          opacity: [0, 0.14], duration: 600,
        }, 4800);
        tl.add(svgEl.querySelectorAll('.p-outer-glow'), {
          opacity: [0, 0.08], duration: 600,
        }, 4900);
        tl.add(svgEl.querySelectorAll('.p-outer-glow'), {
          opacity: [0.08, 0.2], duration: 500,
        }, 5300);
        const outerDrawable = svg.createDrawable(
          svgEl.querySelector('.p-outer-data-ring') as SVGElement
        );
        tl.add(svgEl.querySelector('.p-outer-data-ring') as SVGElement, {
          opacity: [0, 0.28], duration: 400,
        }, 5000);
        tl.add(outerDrawable, {
          draw: ['0 0', '0 1'], duration: 1200, ease: 'inOutCirc',
        }, 5000);
        tl.add(svgEl.querySelector('.p-tick-group') as SVGElement, {
          opacity: [0, 1], duration: 800, ease: 'inOutQuad',
        }, 5200);

        /* ── PHASE 6: Full Power (5800–6600ms) ──
           Constellation + particles surge to full, scanning arcs spin up */
        tl.add(svgEl.querySelectorAll('.p-constellation'), {
          opacity: [0.35, 0.6], duration: 500, delay: stagger(20, { from: 'random' }),
        }, 5800);
        tl.add(svgEl.querySelectorAll('.p-particle'), {
          opacity: [0.15, 0.3], duration: 500, delay: stagger(20, { from: 'random' }),
        }, 5900);
        tl.add(svgEl.querySelectorAll('.p-scan-arc'), {
          opacity: [0, 1], duration: 800, ease: 'inOutQuad',
        }, 5800);
        tl.add(svgEl.querySelector('.p-inner-charge') as SVGElement, {
          opacity: [0.25, 0], duration: 600,
        }, 6000);
        tl.add(svgEl.querySelector('.p-core-dot') as SVGElement, {
          scale: [0.8, 1], opacity: [0.9, 1], duration: 400, ease: 'outElastic(1, .6)',
        }, 6000);

        /* ── PHASE 7: Online Lock (6600–7200ms) ──
           Crosshair locks, final brightness settle */
        tl.add(svgEl.querySelector('.p-crosshair') as SVGElement, {
          opacity: [0, 0.35], duration: 400, ease: 'outQuad',
        }, 6600);
        tl.add(svgEl.querySelector('.p-crosshair') as SVGElement, {
          opacity: [0.35, 0.25], duration: 300,
        }, 7000);

        /* ── Infinite ambient loops ── */
        animate(svgEl.querySelector('.p-tick-group') as SVGElement, {
          rotate: '360deg', duration: 60000, loop: true, ease: 'linear',
        });

        animate(svgEl.querySelectorAll('.p-constellation'), {
          opacity: [0.4, () => 0.2 + Math.random() * 0.5],
          duration: () => 2000 + Math.random() * 3000,
          loop: true, ease: 'inOutSine', alternate: true,
          delay: stagger(60, { from: 'random' }),
        });

        animate(svgEl.querySelectorAll('.p-particle'), {
          translateX: () => `${(Math.random() - 0.5) * 4}px`,
          translateY: () => `${(Math.random() - 0.5) * 4}px`,
          opacity: [0.3, () => 0.1 + Math.random() * 0.3],
          duration: () => 3000 + Math.random() * 4000,
          loop: true, ease: 'inOutSine', alternate: true,
          delay: stagger(60, { from: 'random' }),
        });

        animate(svgEl.querySelector('.p-core-pulse') as SVGElement, {
          opacity: [0.2, 0.5], duration: 3000,
          loop: true, ease: 'inOutSine', alternate: true,
        });
      }).catch((e) => {
        console.warn('LensHero: anime.js dynamic import failed, using CSS fallback', e);
        svgEl.style.opacity = '1';
      });
    } catch (e) {
      /* If anime.js fails, make SVG portal visible via CSS fallback */
      console.warn('LensHero: anime.js portal animation failed, using CSS fallback', e);
      svgEl.style.opacity = '1';
    }
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: DEEP }}
    >
      {/* ── Scoped CSS for text entrance animations (no JS dependency) ── */}
      <style>{`
        .lh-fadein {
          opacity: 0;
          transform: translateY(12px);
          animation: lhFadeIn 0.6s ease forwards;
        }
        .lh-fadein-d1 { animation-delay: 0.3s; }
        .lh-fadein-d2 { animation-delay: 0.6s; }
        .lh-fadein-d3 { animation-delay: 1.1s; }
        .lh-fadein-d4 { animation-delay: 1.5s; }
        .lh-fadein-d5 { animation-delay: 1.9s; }

        @keyframes lhFadeIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Lens char reveal from bottom */
        .lh-char-wrap {
          display: inline-block;
          overflow: hidden;
          vertical-align: bottom;
        }
        .lh-char {
          display: inline-block;
          animation: lhCharUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .lh-char-0 { animation-delay: 0.5s; }
        .lh-char-1 { animation-delay: 0.58s; }
        .lh-char-2 { animation-delay: 0.66s; }
        .lh-char-3 { animation-delay: 0.74s; }

        @keyframes lhCharUp {
          from { transform: translateY(110%); }
          to { transform: translateY(0); }
        }

        /* Subtitle has lower final opacity */
        .lh-subtitle {
          opacity: 0;
          animation: lhSubIn 0.6s ease forwards;
          animation-delay: 1.5s;
        }
        @keyframes lhSubIn {
          to { opacity: 0.55; transform: translateY(0); }
        }

        /* Glacial gradient text for "Lens" title */
        .glacial-text {
          /* gradient applied via inline styles on child spans */
        }
        .lens-gradient-char {
          background: linear-gradient(
            180deg,
            #FFFFFF 0%,
            #D6DEFF 18%,
            #A8B4E8 40%,
            #7B8ADA 62%,
            #5A6AC0 80%,
            #3D4F9A 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Radial bg accent behind the orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '50%', top: '32%', width: '900px', height: '900px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* ══ PORTAL — centered, upper portion ══ */}
      <div
        className="absolute pointer-events-none left-1/2"
        style={{
          top: 'clamp(60px, 8vh, 120px)',
          transform: 'translateX(-50%)',
          width: 'clamp(280px, 38vw, 480px)',
          height: 'clamp(280px, 38vw, 480px)',
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 800 800"
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="hv-void" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#000"    stopOpacity="0.95" />
              <stop offset="70%"  stopColor="#020818" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0A1430" stopOpacity="0.8" />
            </radialGradient>
            <radialGradient id="hv-ambient" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#60A5FA" stopOpacity="0.1" />
              <stop offset="40%"  stopColor="#1E3A8A" stopOpacity="0.12" />
              <stop offset="70%"  stopColor="#1E3A8A" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#041E42" stopOpacity="0" />
            </radialGradient>
            <filter id="hg-heavy" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
            <filter id="hg-med" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id="hg-sm" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* Ambient background glow */}
          <circle className="p-ambient-bg" cx={CX} cy={CY} r="350" fill="url(#hv-ambient)" opacity="0" />

          {/* Blue diffuse halos */}
          <circle className="p-outer-glow" cx={CX} cy={CY} r={MID_R + 20}
            fill="none" stroke="#3B82F6" strokeWidth="50"
            filter="url(#hg-heavy)" opacity="0" />
          <circle className="p-outer-glow" cx={CX} cy={CY} r={MAIN_R}
            fill="none" stroke="#60A5FA" strokeWidth="35"
            filter="url(#hg-heavy)" opacity="0" />

          {/* Outer data ring */}
          <circle className="p-outer-data-ring" cx={CX} cy={CY} r={OUTER_R}
            fill="none" stroke="#3B82F6" strokeWidth="1.2"
            strokeDasharray="4 8" opacity="0" />
          <circle cx={CX} cy={CY} r={OUTER_R}
            fill="none" stroke="#60A5FA" strokeWidth="5"
            filter="url(#hg-med)" opacity="0.12" />

          {/* Tick marks */}
          <g className="p-tick-group" style={{ transformOrigin: `${CX}px ${CY}px` }}>
            {TICKS.map(({ angle, inner, isLong, isMed, i: idx }) => (
              <line
                key={`t-${idx}`}
                x1={CX + Math.cos(angle) * inner} y1={CY + Math.sin(angle) * inner}
                x2={CX + Math.cos(angle) * OUTER_R} y2={CY + Math.sin(angle) * OUTER_R}
                stroke="#60A5FA"
                strokeWidth={isLong ? 1 : 0.4}
                opacity={isLong ? 0.4 : isMed ? 0.2 : 0.08}
              />
            ))}
          </g>

          {/* Mid translucent ring */}
          <circle className="p-mid-ring" cx={CX} cy={CY} r={MID_R}
            fill="none" stroke="#93C5FD" strokeWidth="1" opacity="0" />
          <circle className="p-mid-dash" cx={CX} cy={CY} r={MID_R - 15}
            fill="none" stroke="#60A5FA" strokeWidth="0.5"
            strokeDasharray="6 6" opacity="0" />

          {/* Main energy ring — layered glow */}
          <circle className="p-main-glow-soft" cx={CX} cy={CY} r={MAIN_R}
            fill="none" stroke="#93C5FD" strokeWidth="24"
            filter="url(#hg-med)" opacity="0" />
          <circle className="p-main-glow-bright" cx={CX} cy={CY} r={MAIN_R}
            fill="none" stroke="#BFDBFE" strokeWidth="10"
            filter="url(#hg-sm)" opacity="0" />
          <circle className="p-main-ring-core" cx={CX} cy={CY} r={MAIN_R}
            fill="none" stroke="#EFF6FF" strokeWidth="3.5" opacity="0" />
          <circle className="p-main-edge" cx={CX} cy={CY} r={MAIN_R - 4}
            fill="none" stroke="#60A5FA" strokeWidth="1.2" opacity="0" />

          {/* Void */}
          <circle className="p-void" cx={CX} cy={CY} r={VOID_R} fill="url(#hv-void)" opacity="0" />
          <circle className="p-void-edge" cx={CX} cy={CY} r={VOID_R}
            fill="none" stroke="#1E3A8A" strokeWidth="1" opacity="0" />

          {/* Inner charge ring — expanding energy ring during spark phase */}
          <circle className="p-inner-charge" cx={CX} cy={CY} r={VOID_R - 30}
            fill="none" stroke="#60A5FA" strokeWidth="0.8"
            strokeDasharray="3 5" opacity="0"
            style={{ transformOrigin: `${CX}px ${CY}px`, animation: 'spinCCW 4s linear infinite' }} />

          {/* Charge ring — expands outward from core during ignition */}
          <circle className="p-charge-ring" cx={CX} cy={CY} r={VOID_R * 0.4}
            fill="none" stroke="#93C5FD" strokeWidth="2"
            filter="url(#hg-sm)" opacity="0"
            style={{ transformOrigin: `${CX}px ${CY}px` }} />

          {/* Surge flash — bright ring flash at ring completion */}
          <circle className="p-surge-flash" cx={CX} cy={CY} r={MAIN_R}
            fill="none" stroke="#BFDBFE" strokeWidth="8"
            filter="url(#hg-med)" opacity="0"
            style={{ transformOrigin: `${CX}px ${CY}px` }} />

          {/* Constellation */}
          {EDGES.map(([a, b], i) => (
            <line key={`ce-${i}`} className="p-constellation"
              x1={CONSTELLATION[a].x} y1={CONSTELLATION[a].y}
              x2={CONSTELLATION[b].x} y2={CONSTELLATION[b].y}
              stroke="#60A5FA" strokeWidth="0.4" opacity="0" />
          ))}
          {CONSTELLATION.map((n, i) => (
            <g key={`cn-${i}`} className="p-constellation">
              <circle cx={n.x} cy={n.y} r={n.s * 2.5} fill="#60A5FA" opacity="0.08">
                <animate attributeName="r" values={`${n.s*2};${n.s*3.5};${n.s*2}`} dur={`${3+i*0.4}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={n.x} cy={n.y} r={n.s} fill="#93C5FD" opacity="0.7">
                <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${2+i*0.3}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={n.x} cy={n.y} r={n.s * 0.5} fill="#fff" opacity="0.9" />
            </g>
          ))}

          {/* Ambient particles */}
          {PARTICLES.map((p) => (
            <circle key={`ap-${p.id}`} className="p-particle"
              cx={p.x} cy={p.y} r={p.size}
              fill={p.id % 3 === 0 ? '#60A5FA' : '#93C5FD'} opacity="0" />
          ))}

          {/* Scanning arcs */}
          <circle className="p-scan-arc" cx={CX} cy={CY} r={MAIN_R + 1}
            fill="none" stroke="#BFDBFE" strokeWidth="3"
            strokeDasharray="50 970" strokeLinecap="round" opacity="0"
            style={{ transformOrigin: `${CX}px ${CY}px`, animation: 'spinCW 6s linear infinite' }} />
          <circle className="p-scan-arc" cx={CX} cy={CY} r={OUTER_R}
            fill="none" stroke="#60A5FA" strokeWidth="2"
            strokeDasharray="40 1400" strokeLinecap="round" opacity="0"
            style={{ transformOrigin: `${CX}px ${CY}px`, animation: 'spinCCW 18s linear infinite' }} />
          <circle className="p-scan-arc" cx={CX} cy={CY} r={VOID_R - 20}
            fill="none" stroke="#93C5FD" strokeWidth="0.8"
            strokeDasharray="20 790" strokeLinecap="round" opacity="0"
            style={{ transformOrigin: `${CX}px ${CY}px`, animation: 'spinCCW 10s linear infinite' }} />

          {/* Crosshair */}
          <g className="p-crosshair" opacity="0">
            <line x1={CX-35} y1={CY} x2={CX-12} y2={CY} stroke="#60A5FA" strokeWidth="0.6" />
            <line x1={CX+12} y1={CY} x2={CX+35} y2={CY} stroke="#60A5FA" strokeWidth="0.6" />
            <line x1={CX} y1={CY-35} x2={CX} y2={CY-12} stroke="#60A5FA" strokeWidth="0.6" />
            <line x1={CX} y1={CY+12} x2={CX} y2={CY+35} stroke="#60A5FA" strokeWidth="0.6" />
          </g>

          {/* Core pulse */}
          <circle className="p-core-pulse" cx={CX} cy={CY} r="10"
            fill="#60A5FA" filter="url(#hg-sm)" opacity="0"
            style={{ transformOrigin: `${CX}px ${CY}px` }}>
            <animate attributeName="r" values="8;16;8" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle className="p-core-dot" cx={CX} cy={CY} r="3"
            fill="#fff" opacity="0"
            style={{ transformOrigin: `${CX}px ${CY}px` }} />
        </svg>
      </div>

      {/* ══ TEXT CONTENT — below orb, centered ══ */}
      <div
        className="relative z-10 w-full min-h-screen flex flex-col items-center justify-end"
        style={{ paddingBottom: 'clamp(140px, 14vh, 200px)', paddingTop: 'clamp(340px, 46vh, 560px)' }}
      >
        <div className="flex flex-col items-center text-center px-6">
          {/* Title — "Lens" with char-by-char CSS reveal */}
          <h1
            className="mb-6"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(4.42rem, 10.3vw, 9.57rem)',
              fontWeight: 400,
              lineHeight: 0.9,
              letterSpacing: '0.02em',
            }}
          >
            {['L', 'e', 'n', 's'].map((char, i) => (
              <span key={i} className="lh-char-wrap">
                <span className={`lh-char lh-char-${i} lens-gradient-char`}>{char}</span>
              </span>
            ))}
          </h1>

          {/* "by" text + Delt logo */}
          <div
            className="lh-fadein lh-fadein-d3 flex items-center gap-2 mb-14"
          >
            <span style={{ color: '#8892B0', fontSize: '1.32rem' }}>by</span>
            <Link to="/">
              <img
                src={deltLogoImg}
                alt="Delt"
                className="w-auto"
                style={{ objectFit: 'contain', height: '58px' }}
              />
            </Link>
          </div>

          {/* Subtitle */}
          <p
            className="lh-subtitle mb-14 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 380, transform: 'translateY(8px)', fontSize: 'clamp(1.44rem, 2.5vw, 1.73rem)' }}
          >
            The answers you've been missing.
          </p>

          {/* Buttons */}
          <div className="lh-fadein lh-fadein-d5 flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/demo?view=lens-ai"
              className="group/btn relative inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-full font-semibold text-white transition-all hover:brightness-110 cursor-pointer overflow-hidden"
              style={{
                backgroundColor: ACCENT,
                boxShadow: `0 6px 24px ${ACCENT}40`,
                fontSize: '1.15rem',
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.12) 55%, transparent 60%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.8s ease-in-out infinite',
                }}
              />
              <span className="relative z-10">Open Lens</span>
              <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById('lens-features');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold transition-all cursor-pointer hover:text-white"
              style={{ color: '#94A3B8', fontSize: '1.15rem' }}
            >
              See how it works
            </button>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <ScrollIndicator
        style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
        onClick={() => {
          const el = document.getElementById('lens-features');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </section>
  );
}