/**
 * ────────────────────────────────────────────────────────────────
 * Decision-model → CRM mapping helpers
 * ────────────────────────────────────────────────────────────────
 * Pure functions that translate the server-side Delt Cash-Flow
 * Decision Model output (the `recommendation` doc in plaid_nodes) into
 * the shapes the CRM persists and renders: tier labels, approval terms
 * (factor / holdback), disqualifier strings, and the analyst's
 * what-if check for a proposed advance. No React, no I/O.
 */

export type UWTierLabel = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' | 'Decline';

/** Offer terms as emitted by the model (subset the CRM consumes). */
export interface ModelOffer {
  amount: number;
  factor: number;
  term_months: number;
  term_business_days: number;
  total_payback: number;
  daily_payment: number;
  payment_pct_daily_revenue: number;
  caps?: Record<string, number | null>;
}

/** Map the model's numeric tier (1–4, null on declines) to the CRM label. */
export function tierFromModel(tier: number | null | undefined): UWTierLabel {
  if (tier === 1 || tier === 2 || tier === 3 || tier === 4) return `Tier ${tier}` as UWTierLabel;
  return 'Decline';
}

/**
 * Holdback % for the approval terms. The model has no holdback concept;
 * the offer's actual payment share of daily revenue is the same economic
 * quantity, so it becomes the holdback. Default 12 when no offer exists
 * (manual-terms path).
 */
export function holdbackFromOffer(offer: Pick<ModelOffer, 'payment_pct_daily_revenue'> | null | undefined): number {
  if (!offer || !Number.isFinite(offer.payment_pct_daily_revenue)) return 12;
  return Math.max(1, Math.round(offer.payment_pct_daily_revenue * 100));
}

/** Factor for the approval terms; model offers carry a single mid factor. */
export function factorFromOffer(offer: Pick<ModelOffer, 'factor'> | null | undefined): number {
  return offer?.factor && Number.isFinite(offer.factor) ? offer.factor : 1.4;
}

/** One-line provenance note for approvals and decision memos. */
export function modelNotes(rec: any): string {
  return `Model v${rec?.model_version ?? '?'} · score ${rec?.score?.total ?? 0}/100 · ${rec?.decision_label ?? 'no decision'}`;
}

/** Failed gate labels (sufficiency + knockouts) — feeds `disqualifiers`. */
export function failedKnockoutLabels(rec: any): string[] {
  const gates = [...(rec?.gates?.sufficiency ?? []), ...(rec?.gates?.knockouts ?? [])];
  return gates.filter((g: any) => g && g.passed === false).map((g: any) => String(g.label ?? g.code ?? 'gate'));
}

/**
 * What-if check for a proposed advance against a model offer's terms:
 * same factor and term, payment share capped at the level the model
 * already stress-approved for its own sized amount.
 */
export function checkProposedAmount(
  offer: ModelOffer | null | undefined,
  amount: number,
): { passes: boolean; dailyPayment: number; pctOfDailyRevenue: number; maxAmount: number } {
  if (!offer || !Number.isFinite(amount) || amount <= 0 || offer.term_business_days <= 0) {
    return { passes: false, dailyPayment: 0, pctOfDailyRevenue: 0, maxAmount: offer?.amount ?? 0 };
  }
  const dailyPayment = (amount * offer.factor) / offer.term_business_days;
  // Reconstruct daily revenue from the model's own sized offer.
  const dailyRevenue = offer.payment_pct_daily_revenue > 0
    ? offer.daily_payment / offer.payment_pct_daily_revenue
    : 0;
  const pctOfDailyRevenue = dailyRevenue > 0 ? dailyPayment / dailyRevenue : 1;
  // The model's sized amount is the stress-tested ceiling.
  const maxAmount = offer.amount;
  return {
    passes: amount <= maxAmount,
    dailyPayment: Math.round(dailyPayment * 100) / 100,
    pctOfDailyRevenue: Math.round(pctOfDailyRevenue * 1000) / 1000,
    maxAmount,
  };
}
