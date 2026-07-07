import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

/* Shared branded loader visual: DeltPay wordmark + spinner. */
function LoaderMark() {
  return (
    <>
      <div
        style={{
          fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: '#041E42',
        }}
      >
        Delt<span style={{ color: '#4945FF' }}>Pay</span>
      </div>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '3px solid rgba(73,69,255,0.18)',
          borderTopColor: '#4945FF',
          animation: 'deltpay-spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes deltpay-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

/**
 * Branded route loader shown while a lazy-loaded page chunk is fetching
 * (Suspense fallback) — keeps the screen from flashing blank.
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
        gap: 22,
        background: '#F6F7FB',
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
 * out. Skips the very first render (the index.html splash covers that), and
 * collapses to near-nothing for reduced-motion users.
 */
const HOLD_MS = 650;
const FADE_MS = 320;

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
        gap: 22,
        background: '#F6F7FB',
        opacity: phase === 'fading' ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: phase === 'fading' ? 'none' : 'auto',
      }}
    >
      <LoaderMark />
    </div>
  );
}
