/* ══════════════════════════════════════════════════════════════
   Shared motion tokens for Delt's scroll/reveal animations.

   These codify conventions ALREADY used by hand across the site
   (GlobeStats, ResultsBento, etc.) so the reusable primitives in
   ./components/motion produce reveals indistinguishable from the
   existing ones.

   Motion personality: restrained, financial-grade. Ease-out-expo,
   short travel, quick durations. No bounce / overshoot / rotation.
   ══════════════════════════════════════════════════════════════ */

/** Ease-out-expo — the house easing, matching existing components. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Reveal defaults. `y` is the desktop travel; `yMobile` the reduced
    travel used on small screens per the brief (~12–16px). */
export const REVEAL = {
  y: 24,
  yMobile: 14,
  duration: 0.6,
  /** Media/imagery gets a slightly longer duration than text. */
  mediaDuration: 0.75,
  /** Stagger between sibling elements (heading → body → CTA → media). */
  stagger: 0.09,
  /** whileInView viewport config — trigger once, 80px into the viewport. */
  viewport: { once: true, margin: '-80px' } as const,
} as const;

/** Breakpoint (px) below which reveals use the reduced mobile travel.
    Matches Tailwind's `md`. */
export const MOBILE_BREAKPOINT = 768;
