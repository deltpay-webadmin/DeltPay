import type { ReactNode, CSSProperties, ElementType } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { EASE_OUT_EXPO, REVEAL } from '@/app/lib/motion';
import { useIsMobile } from './useIsMobile';

/* ──────────────────────────────────────────────────────────────
   <Stagger> + <StaggerItem> — orchestrated sibling reveals.

   Wrap a group in <Stagger> and each child in <StaggerItem>; the
   children fade + rise in sequence (heading → body → CTA → media),
   ~90ms apart by default.

   trigger="inView" (default) reveals on scroll-into-view, once.
   trigger="mount"  reveals immediately on mount — used by the hero,
   which animates on load rather than on scroll.

   StaggerItem MUST be a descendant of Stagger (it relies on the
   parent to propagate the animation). Under prefers-reduced-motion
   both render as plain, instantly-visible elements.
   ────────────────────────────────────────────────────────────── */

export interface StaggerProps {
  children: ReactNode;
  as?: ElementType;
  /** 'inView' reveals on scroll; 'mount' reveals on load. */
  trigger?: 'inView' | 'mount';
  /** Seconds between each child. */
  stagger?: number;
  /** Seconds before the first child starts. */
  delayChildren?: number;
  amount?: number | 'some' | 'all';
  className?: string;
  style?: CSSProperties;
}

export function Stagger({
  children,
  as = 'div',
  trigger = 'inView',
  stagger = REVEAL.stagger,
  delayChildren = 0,
  amount,
  className,
  style,
}: StaggerProps) {
  const reduceMotion = useReducedMotion();
  const Comp = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduceMotion) {
    return (
      <Comp className={className} style={style} initial={false}>
        {children}
      </Comp>
    );
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren } },
  };

  const triggerProps =
    trigger === 'mount'
      ? { initial: 'hidden' as const, animate: 'show' as const }
      : {
          initial: 'hidden' as const,
          whileInView: 'show' as const,
          viewport: { ...REVEAL.viewport, ...(amount != null ? { amount } : {}) },
        };

  return (
    <Comp className={className} style={style} variants={container} {...triggerProps}>
      {children}
    </Comp>
  );
}

export interface StaggerItemProps {
  children: ReactNode;
  as?: ElementType;
  /** Desktop translate distance in px. Mobile is clamped smaller. */
  y?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

export function StaggerItem({
  children,
  as = 'div',
  y,
  duration = REVEAL.duration,
  className,
  style,
}: StaggerItemProps) {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const Comp = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduceMotion) {
    return (
      <Comp className={className} style={style} initial={false}>
        {children}
      </Comp>
    );
  }

  const travel = y ?? (isMobile ? REVEAL.yMobile : REVEAL.y);
  const item: Variants = {
    hidden: { opacity: 0, y: travel },
    show: { opacity: 1, y: 0, transition: { duration, ease: EASE_OUT_EXPO } },
  };

  return (
    <Comp className={className} style={style} variants={item}>
      {children}
    </Comp>
  );
}

export default Stagger;
