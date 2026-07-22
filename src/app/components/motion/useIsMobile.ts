import { useEffect, useState } from 'react';
import { MOBILE_BREAKPOINT } from '@/app/lib/motion';

/* Tracks whether the viewport is below the mobile breakpoint, so reveal
   primitives can shorten their translate distance on phones. SSR-safe
   default (false) — this is a client-only SPA, and the value resolves on
   mount before any whileInView animation fires, so there is no flash. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isMobile;
}
