/**
 * ────────────────────────────────────────────────────────────
 * Agent compensation program — single source of truth
 * ────────────────────────────────────────────────────────────
 * Mirrors docs/hiring/comp-plan-one-pager.md. If the program changes,
 * update the docs and this file together.
 */

/** Volume-banded activation bonus: bonus paid when a merchant activates. */
export const BONUS_BANDS: { maxVolume: number; bonus: number; label: string }[] = [
  { maxVolume: 10_000, bonus: 150, label: 'Under $10K' },
  { maxVolume: 25_000, bonus: 250, label: '$10K–$25K' },
  { maxVolume: 50_000, bonus: 400, label: '$25K–$50K' },
  { maxVolume: 100_000, bonus: 600, label: '$50K–$100K' },
  { maxVolume: Infinity, bonus: 1_000, label: '$100K+' },
];

/** Extra bonus when the account also takes KORONA POS or Delt Capital. */
export const MULTI_PRODUCT_KICKER = 100;

export function activationBonus(monthlyVolume: number, multiProduct: boolean): number {
  const band = BONUS_BANDS.find(b => monthlyVolume < b.maxVolume) ?? BONUS_BANDS[BONUS_BANDS.length - 1];
  return band.bonus + (multiProduct ? MULTI_PRODUCT_KICKER : 0);
}

export function bonusBandLabel(monthlyVolume: number): string {
  const band = BONUS_BANDS.find(b => monthlyVolume < b.maxVolume) ?? BONUS_BANDS[BONUS_BANDS.length - 1];
  return band.label;
}

/** Residual tier ladder: split % by active-account count. */
export const TIERS = [
  { tier: 1, split: 0.5, minAccounts: 0, label: 'Tier 1 — 50% Split' },
  { tier: 2, split: 0.6, minAccounts: 15, label: 'Tier 2 — 60% Split' },
  { tier: 3, split: 0.7, minAccounts: 35, label: 'Tier 3 — 70% Split' },
];

export function tierForAccounts(activeAccounts: number) {
  return [...TIERS].reverse().find(t => activeAccounts >= t.minAccounts) ?? TIERS[0];
}

export function nextTier(activeAccounts: number) {
  return TIERS.find(t => activeAccounts < t.minAccounts) ?? null;
}

/**
 * Rough net program revenue per month for a merchant, used only for the
 * pending-earnings estimate on submitted deals. Modeled on the comp plan's
 * stated assumption (~$70–$120/mo for a typical SMB cash-discount account),
 * scaled by volume and clamped to a sane range.
 */
export function estMonthlyNetRevenue(monthlyVolume: number): number {
  return Math.min(Math.max(monthlyVolume * 0.008, 50), 900);
}

/** Estimated first-year residual to the agent at Tier 1, for pipeline display. */
export function estFirstYearResidual(monthlyVolume: number): number {
  return Math.round(estMonthlyNetRevenue(monthlyVolume) * 0.5 * 12);
}

/** Fast Start program (first 90 days, one-time, $1,500 lifetime cap). */
export const FAST_START = {
  first30: { activations: 3, bonus: 500 },
  first90: { activations: 10, bonus: 1_000 },
  cap: 1_500,
};

/** Momentum kicker: 8+ activations in a calendar month → +$50 retro per activation. */
export const MOMENTUM_KICKER = { activations: 8, perDeal: 50 };

/** Active Producer status gates the wellness perks. */
export const ACTIVE_PRODUCER = { activations: 3, windowDays: 90 };

export const fmtUsd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
