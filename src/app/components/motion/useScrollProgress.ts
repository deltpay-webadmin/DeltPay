import type { RefObject } from 'react';
import { useScroll, useReducedMotion, type MotionValue } from 'motion/react';

/* ──────────────────────────────────────────────────────────────
   useScrollProgress — thin wrapper over motion's useScroll.

   Returns a 0→1 `scrollYProgress` MotionValue for a target element
   as it passes through the viewport, plus a `reduceMotion` flag so
   consumers can skip scroll-linked transforms (parallax, scrubs)
   for users who prefer reduced motion.

   Scroll position is read via motion's built-in rAF loop — no
   manual scroll listeners — and only drives `transform`/`opacity`.

   Default offset ['start end', 'end start'] = progress runs from
   when the element's top enters the viewport bottom to when its
   bottom leaves the viewport top.
   ────────────────────────────────────────────────────────────── */

type ScrollOffset = Parameters<typeof useScroll>[0] extends { offset?: infer O }
  ? O
  : never;

export function useScrollProgress(
  ref: RefObject<HTMLElement>,
  offset: ScrollOffset = ['start end', 'end start'] as ScrollOffset,
): { scrollYProgress: MotionValue<number>; reduceMotion: boolean } {
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return { scrollYProgress, reduceMotion };
}

export default useScrollProgress;
