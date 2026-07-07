import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

/*
 * Shared branded loader visual — the SAME look as the initial app splash in
 * index.html (#app-loader): navy background, the Delt logo easing in with a
 * gentle breathe, and a slim indeterminate gradient sweep underneath. Keep the
 * two in sync if the splash design changes.
 */
function LoaderMark() {
  return (
    <>
      <img
        src="/delt-logo.svg"
        alt="Delt"
        style={{
          width: 'clamp(150px, 22vw, 210px)',
          height: 'auto',
          opacity: 0,
          transform: 'translateY(8px) scale(0.98)',
          animation:
            'dp-loader-in 0.45s cubic-bezier(0.22,1,0.36,1) forwards, dp-loader-breathe 2.6s ease-in-out 0.45s infinite',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          width: 'clamp(160px, 24vw, 220px)',
          height: 3,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '42%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #4945ff, #6e8bff, #b47bff)',
            animation: 'dp-loader-sweep 1.25s ease-in-out infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes dp-loader-in {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dp-loader-breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.035); opacity: 0.92; }
        }
        @keyframes dp-loader-sweep {
          0% { left: -45%; }
          100% { left: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          img[alt="Delt"] { animation: dp-loader-in 0.3s ease forwards !important; }
        }
      `}</style>
    </>
  );
}

const LOADER_BG = '#041e42';

/**
 * Suspense fallback while a lazy-loaded page chunk fetches — keeps the screen
 * from flashing blank, in the same branded style as the splash.
 */
export function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30,
        background: LOADER_BG,
      }}
    >
      <LoaderMark />
    </div>
  );
}

/**
 * Route-transition overlay: a deliberate branded loading moment on EVERY page
 * navigation, not just when a chunk fetches. Shows instantly on route change,
 * holds for a minimum time so the transition reads as intentional, then fades
 * out (same 0.5s ease as the splash). Skips the very first render (the
 * index.html splash covers that) and shortens for reduced-motion users.
 */
const HOLD_MS = 650;
const FADE_MS = 500;

export function RouteTransitionLoader() {
  const { pathname } = useLocation();
  const [phase, setPhase] = useState<'hidden' | 'shown' | 'fading'>('hidden');
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const hold = reduced ? 150 : HOLD_MS;
    setPhase('shown');
    const t1 = window.setTimeout(() => setPhase('fading'), hold);
    const t2 = window.setTimeout(() => setPhase('hidden'), hold + FADE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  if (phase === 'hidden') return null;
  return (
    <div
      role="status"
      aria-label="Loading page"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30,
        background: LOADER_BG,
        opacity: phase === 'fading' ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: phase === 'fading' ? 'none' : 'auto',
      }}
    >
      <LoaderMark />
    </div>
  );
}
