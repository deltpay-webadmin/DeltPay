import type { ReactNode, CSSProperties, ElementType } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EASE_OUT_EXPO, REVEAL } from '@/app/lib/motion';
import { useIsMobile } from './useIsMobile';

/* ──────────────────────────────────────────────────────────────
   <FadeIn> — Revolut-style reveal-on-scroll primitive.

   Fades opacity 0 → 1 and translates up (default 24px desktop /
   14px mobile) as the element scrolls into view. Triggers once and
   does NOT replay on scroll-up. Animates transform + opacity only.

   Accessibility: under prefers-reduced-motion the content renders
   instantly visible with no translate (a plain, un-animated element)
   — never left stuck at opacity 0.

   Usage:
     <FadeIn>…</FadeIn>
     <FadeIn as="section" delay={0.1} y={30} className="…">…</FadeIn>
   ────────────────────────────────────────────────────────────── */

export interface FadeInProps {
  children: ReactNode;
  /** Rendered element / motion tag. Default 'div'. */
  as?: ElementType;
  /** Seconds before this element starts (manual stagger). */
  delay?: number;
  /** Desktop translate distance in px. Mobile is clamped smaller. */
  y?: number;
  /** Animation duration in seconds. */
  duration?: number;
  /** How much of the element must be visible (whileInView `amount`). */
  amount?: number | 'some' | 'all';
  className?: string;
  style?: CSSProperties;
}

export function FadeIn({
  children,
  as = 'div',
  delay = 0,
  y,
  duration = REVEAL.duration,
  amount,
  className,
  style,
}: FadeInProps) {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const Comp = motion[as as keyof typeof motion] as typeof motion.div;

  // Reduced motion → render visible immediately, no transform, no flash.
  if (reduceMotion) {
    return (
      <Comp className={className} style={style} initial={false}>
        {children}
      </Comp>
    );
  }

  const travel = y ?? (isMobile ? REVEAL.yMobile : REVEAL.y);

  return (
    <Comp
      className={className}
      style={style}
      initial={{ opacity: 0, y: travel }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ ...REVEAL.viewport, ...(amount != null ? { amount } : {}) }}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </Comp>
  );
}

export default FadeIn;
