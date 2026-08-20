/**
 * ════════════════════════════════════════════════════════════════
 * Delt Cash-Flow Decision Model — v1.1.0
 * ════════════════════════════════════════════════════════════════
 * Standardized, deterministic lending recommendation from Plaid data.
 *
 * Design contract:
 *   • PURE — no I/O, no randomness, no clock reads. The same input
 *     snapshot always produces byte-identical output ("repeatable").
 *   • VERSIONED — MODEL_VERSION is stamped on every recommendation;
 *     policy changes require a version bump ("predictable").
 *   • EXPLAINABLE — every gate, point award and cap is emitted in the
 *     output trace, so an analyst can reproduce the decision by hand.
 *   • CONSERVATIVE — the offer is the MINIMUM of independent caps
 *     (revenue multiple, free-cash-flow affordability, balance buffer,
 *     requested amount) and must pass a payment stress test, shrinking
 *     until it does ("financially sound").
 *
 * Pipeline (strictly ordered):
 *   1. Sufficiency gates  → INSUFFICIENT_DATA if the file is too thin
 *   2. Knockout rules     → DECLINE on any hard failure
 *   3. Cash-flow score    → 0–100 across 8 weighted components
 *   4. Tier assignment    → pricing/term/cap parameters per tier
 *   5. Offer sizing       → min(caps), floored, stress-tested
 *   6. Recommendation     → PRE_APPROVE / REVIEW / DECLINE + conditions
 *
 * Plaid data alone cannot clear a file for funding — a PRE_APPROVE is
 * always conditioned on a credit-bureau pull. This model is the bank-
 * data leg of underwriting, not a replacement for it.
 */

export const MODEL_NAME = "Delt Cash-Flow Decision Model";
export const MODEL_VERSION = "1.1.0";

// ════════════════════════════════════════════════════════════════
// Policy constants — the ONLY place thresholds live.
// ════════════════════════════════════════════════════════════════

export const POLICY = {
  // 1. Sufficiency
  MIN_MONTHS_OF_DATA: 3,
  MIN_TRANSACTIONS: 50,

  // 2. Knockouts
  MIN_MONTHLY_REVENUE: 8_000,          // $ — below this the product doesn't fit
  MAX_NSF_90D: 5,                      // 6+ NSF/overdraft events in 90d
  MIN_DAYS_SINCE_NSF: 7,               // NSF within the last week
  MIN_DAILY_BALANCE_FLOOR: -500,       // $ — sustained negative balances
  MAX_REVENUE_DECLINE_3MO: -0.30,      // −30% in 3 months
  MAX_DEBT_POSITIONS: 2,               // 3+ detected loan/MCA positions
  MAX_DEBT_SERVICE_RATIO: 0.25,        // debt service ≥ 25% of revenue

  // 5. Offer sizing
  OFFER_FLOOR: 5_000,                  // $ — smallest advance we'll write
  OFFER_ROUNDING: 1_000,               // $ — round offers down to this step
  FALLBACK_OFFER_FLOOR: 500,           // $ — smallest theoretical starter offer on declines
  FALLBACK_OFFER_ROUNDING: 500,        // $ — starter offers step in finer increments to reach the floor
  ADB_BUFFER_MULTIPLE: 10,             // advance ≤ 10 × avg daily balance
  BUSINESS_DAYS_PER_MONTH: 21,
  STRESS_MAX_PAYMENT_PCT_ADB: 0.15,    // daily payment ≤ 15% of ADB

  // 6. Recommendation bands (on cash-flow score)
  PRE_APPROVE_MIN_SCORE: 65,
  REVIEW_MIN_SCORE: 50,
} as const;

export interface TierParams {
  tier: 1 | 2 | 3 | 4;
  label: string;
  minScore: number;
  factorMin: number;
  factorMax: number;
  termMonths: number;
  /** advance ≤ this × monthly revenue */
  maxAdvanceMultiple: number;
  /** daily payment ≤ this × daily revenue */
  paymentCapPctDailyRevenue: number;
}

export const TIERS: TierParams[] = [
  { tier: 1, label: "Tier 1 — Prime cash flow",  minScore: 80, factorMin: 1.20, factorMax: 1.30, termMonths: 12, maxAdvanceMultiple: 1.20, paymentCapPctDailyRevenue: 0.12 },
  { tier: 2, label: "Tier 2 — Strong",           minScore: 65, factorMin: 1.30, factorMax: 1.38, termMonths: 10, maxAdvanceMultiple: 1.00, paymentCapPctDailyRevenue: 0.14 },
  { tier: 3, label: "Tier 3 — Standard",         minScore: 50, factorMin: 1.38, factorMax: 1.45, termMonths: 8,  maxAdvanceMultiple: 0.75, paymentCapPctDailyRevenue: 0.16 },
  { tier: 4, label: "Tier 4 — Watch",            minScore: 40, factorMin: 1.45, factorMax: 1.49, termMonths: 6,  maxAdvanceMultiple: 0.50, paymentCapPctDailyRevenue: 0.18 },
];

// ════════════════════════════════════════════════════════════════
// Input / output shapes
// ════════════════════════════════════════════════════════════════

/** Snapshot of vault metrics the model consumes (all from Plaid). */
export interface ModelInput {
  monthlyRevenue: number;
  revenueStdDevPct: number;
  revenueTrend: "growing" | "flat" | "declining";
  revenueChange3moPct: number;
  avgDailyBalance: number;
  minDailyBalance: number;
  nsfCount90d: number;
  daysSinceLastNsf: number;
  depositConcentration: "diversified" | "moderate" | "concentrated";
  monthsOfData: number;
  transactionCount: number;
  monthlyDebtService: number;
  detectedDebtPositions: number;
  debtServiceToRevenuePct: number;
  /** Context */
  requestedAmount: number;             // 0 = size the offer purely from caps
  bankVerified: boolean;
  identityVerified: boolean;
  institutionsConnected: number;
}

export interface GateResult {
  code: string;
  label: string;
  passed: boolean;
  value: string;
  threshold: string;
}

export interface ScoreComponent {
  key: string;
  label: string;
  points: number;
  max: number;
  value: string;
}

export interface OfferTerms {
  amount: number;
  factor: number;
  term_months: number;
  term_business_days: number;
  total_payback: number;
  daily_payment: number;
  est_monthly_payment: number;
  payment_pct_daily_revenue: number;
  payment_pct_adb: number;
  caps: { revenue_multiple: number; affordability: number; balance_buffer: number; requested: number | null };
  binding_cap: string;
  stress_iterations: number;
}

/**
 * Theoretical starter offer attached to DECLINE outputs. NON-BINDING:
 * the decision stands — this exists so the desk can still see what a
 * minimal processing-relationship offer would look like. It must never
 * be surfaced as an approvable offer.
 */
export interface FallbackOffer extends OfferTerms {
  non_binding: true;
  /** Which tier's parameters sized it: the assigned tier (affordability
   *  declines) or Tier 4's as a stand-in (hard-rule/score declines). */
  basis: "assigned_tier" | "tier4_params";
  floor: number;
}

export type Decision = "PRE_APPROVE" | "REVIEW" | "DECLINE" | "INSUFFICIENT_DATA";

export interface ModelOutput {
  model_name: string;
  model_version: string;
  decision: Decision;
  decision_label: string;
  tier: number | null;
  tier_label: string | null;
  score: { total: number; components: ScoreComponent[] };
  gates: { sufficiency: GateResult[]; knockouts: GateResult[] };
  offer: OfferTerms | null;
  /** Non-binding starter offer on declines; null everywhere else. */
  fallback_offer: FallbackOffer | null;
  conditions: string[];
  explanation: string[];
  input: ModelInput;
}

// ════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function gate(
  code: string, label: string, passed: boolean, value: string, threshold: string,
): GateResult {
  return { code, label, passed, value, threshold };
}

// ════════════════════════════════════════════════════════════════
// Stage 3 — cash-flow score (0–100)
// ════════════════════════════════════════════════════════════════

export function scoreCashFlow(i: ModelInput): { total: number; components: ScoreComponent[] } {
  const c: ScoreComponent[] = [];

  // Average daily balance (0–20)
  let adb = 0;
  if (i.avgDailyBalance >= 15_000) adb = 20;
  else if (i.avgDailyBalance >= 10_000) adb = 16;
  else if (i.avgDailyBalance >= 5_000) adb = 12;
  else if (i.avgDailyBalance >= 2_500) adb = 8;
  else if (i.avgDailyBalance >= 1_000) adb = 4;
  c.push({ key: "adb", label: "Average daily balance", points: adb, max: 20, value: usd(i.avgDailyBalance) });

  // Minimum balance resilience (0–10)
  let minb = 0;
  if (i.minDailyBalance >= 1_000) minb = 10;
  else if (i.minDailyBalance >= 0) minb = 7;
  else if (i.minDailyBalance >= -100) minb = 3;
  c.push({ key: "min_balance", label: "Minimum balance resilience", points: minb, max: 10, value: usd(i.minDailyBalance) });

  // NSF discipline (0–20)
  let nsf = 0;
  if (i.nsfCount90d === 0) nsf = 20;
  else if (i.nsfCount90d === 1) nsf = 14;
  else if (i.nsfCount90d === 2) nsf = 8;
  else if (i.nsfCount90d === 3) nsf = 4;
  if (i.nsfCount90d > 0 && i.daysSinceLastNsf < 30) nsf = Math.max(0, nsf - 4);
  c.push({ key: "nsf", label: "NSF / overdraft discipline", points: nsf, max: 20, value: `${i.nsfCount90d} in 90d (last ${i.daysSinceLastNsf >= 9999 ? "never" : `${i.daysSinceLastNsf}d ago`})` });

  // Revenue level (0–15)
  let rev = 0;
  if (i.monthlyRevenue >= 100_000) rev = 15;
  else if (i.monthlyRevenue >= 50_000) rev = 12;
  else if (i.monthlyRevenue >= 25_000) rev = 9;
  else if (i.monthlyRevenue >= 10_000) rev = 6;
  else if (i.monthlyRevenue >= POLICY.MIN_MONTHLY_REVENUE) rev = 3;
  c.push({ key: "revenue", label: "Monthly revenue level", points: rev, max: 15, value: usd(i.monthlyRevenue) });

  // Revenue stability (0–15)
  let stab = 0;
  if (i.revenueStdDevPct <= 0.10) stab = 15;
  else if (i.revenueStdDevPct <= 0.20) stab = 12;
  else if (i.revenueStdDevPct <= 0.35) stab = 8;
  else if (i.revenueStdDevPct <= 0.50) stab = 4;
  c.push({ key: "stability", label: "Revenue stability", points: stab, max: 15, value: `${pct(i.revenueStdDevPct)} volatility` });

  // Revenue trend (0–10)
  const trend = i.revenueTrend === "growing" ? 10 : i.revenueTrend === "flat" ? 6 : 0;
  c.push({ key: "trend", label: "Revenue trend", points: trend, max: 10, value: `${i.revenueTrend} (${pct(i.revenueChange3moPct)} / 3mo)` });

  // Deposit diversification (0–5)
  const conc = i.depositConcentration === "diversified" ? 5 : i.depositConcentration === "moderate" ? 3 : 0;
  c.push({ key: "concentration", label: "Deposit diversification", points: conc, max: 5, value: i.depositConcentration });

  // Existing debt load (0–5)
  let debt = 0;
  if (i.debtServiceToRevenuePct === 0) debt = 5;
  else if (i.debtServiceToRevenuePct < 0.05) debt = 4;
  else if (i.debtServiceToRevenuePct < 0.10) debt = 3;
  else if (i.debtServiceToRevenuePct < 0.15) debt = 1;
  c.push({ key: "debt_load", label: "Existing debt load", points: debt, max: 5, value: `${pct(i.debtServiceToRevenuePct)} of revenue (${i.detectedDebtPositions} position(s))` });

  const total = c.reduce((s, x) => s + x.points, 0);
  return { total, components: c };
}

// ════════════════════════════════════════════════════════════════
// Stage 5 — offer sizing (min of caps, stress-tested)
// ════════════════════════════════════════════════════════════════

function sizeOffer(
  i: ModelInput,
  tier: TierParams,
  explanation: string[],
  opts?: { floor?: number; rounding?: number },
): OfferTerms | null {
  const floor = opts?.floor ?? POLICY.OFFER_FLOOR;
  const rounding = opts?.rounding ?? POLICY.OFFER_ROUNDING;
  const termDays = tier.termMonths * POLICY.BUSINESS_DAYS_PER_MONTH;
  const factor = Math.round(((tier.factorMin + tier.factorMax) / 2) * 100) / 100;
  const dailyRevenue = (i.monthlyRevenue * 12) / 252;
  const dailyDebtService = i.monthlyDebtService / POLICY.BUSINESS_DAYS_PER_MONTH;

  // Cap A — revenue multiple for the tier.
  const capRevenue = tier.maxAdvanceMultiple * i.monthlyRevenue;

  // Cap B — affordability: the payment must fit inside the tier's share of
  // daily revenue AFTER existing debt service is paid.
  const maxDailyPayment = Math.max(0, dailyRevenue * tier.paymentCapPctDailyRevenue - dailyDebtService);
  const capAffordability = (maxDailyPayment * termDays) / factor;

  // Cap C — balance buffer: never advance more than a multiple of ADB.
  const capBalance = POLICY.ADB_BUFFER_MULTIPLE * i.avgDailyBalance;

  // Cap D — never offer more than was asked for (when an ask exists).
  const capRequested = i.requestedAmount > 0 ? i.requestedAmount : null;

  const rawCap = Math.min(capRevenue, capAffordability, capBalance, capRequested ?? Infinity);
  const bindingCap =
    rawCap === capAffordability ? "affordability"
    : rawCap === capRevenue ? "revenue_multiple"
    : rawCap === capBalance ? "balance_buffer"
    : "requested";

  let amount = Math.floor(rawCap / rounding) * rounding;
  explanation.push(
    `Offer caps — revenue multiple ${usd(capRevenue)}, affordability ${usd(capAffordability)}, ` +
    `balance buffer ${usd(capBalance)}${capRequested ? `, requested ${usd(capRequested)}` : ""}; ` +
    `binding cap: ${bindingCap}.`,
  );

  // Stress loop — shrink deterministically until the payment passes both
  // the daily-revenue share and the ADB share, or the offer floors out.
  let iterations = 0;
  while (amount >= floor) {
    const dailyPayment = (amount * factor) / termDays;
    const pctDaily = dailyRevenue > 0 ? dailyPayment / dailyRevenue : 1;
    const pctAdb = i.avgDailyBalance > 0 ? dailyPayment / i.avgDailyBalance : 1;
    const affordable = dailyPayment <= maxDailyPayment + 1e-9;
    const bufferOk = pctAdb <= POLICY.STRESS_MAX_PAYMENT_PCT_ADB;
    if (affordable && bufferOk) {
      if (iterations > 0) explanation.push(`Stress test shrank the offer ${iterations}× to ${usd(amount)}.`);
      return {
        amount,
        factor,
        term_months: tier.termMonths,
        term_business_days: termDays,
        total_payback: Math.round(amount * factor),
        daily_payment: Math.round(dailyPayment * 100) / 100,
        est_monthly_payment: Math.round(dailyPayment * POLICY.BUSINESS_DAYS_PER_MONTH),
        payment_pct_daily_revenue: Math.round(pctDaily * 1000) / 1000,
        payment_pct_adb: Math.round(pctAdb * 1000) / 1000,
        caps: {
          revenue_multiple: Math.round(capRevenue),
          affordability: Math.round(capAffordability),
          balance_buffer: Math.round(capBalance),
          requested: capRequested,
        },
        binding_cap: bindingCap,
        stress_iterations: iterations,
      };
    }
    amount -= rounding;
    iterations++;
  }
  explanation.push(`No offer ≥ ${usd(floor)} passes the payment stress test.`);
  return null;
}

/**
 * Theoretical starter offer for DECLINE outputs. Sized with the same
 * caps and stress test as a real offer, but floored at
 * FALLBACK_OFFER_FLOOR and using Tier 4's parameters when no tier was
 * assigned. Purely informational — the decline stands.
 */
function sizeFallbackOffer(
  i: ModelInput,
  tier: TierParams | null,
  explanation: string[],
): FallbackOffer | null {
  const params = tier ?? TIERS[TIERS.length - 1];
  const basis: FallbackOffer["basis"] = tier ? "assigned_tier" : "tier4_params";
  const trace: string[] = [];
  const offer = sizeOffer(i, params, trace, {
    floor: POLICY.FALLBACK_OFFER_FLOOR,
    rounding: POLICY.FALLBACK_OFFER_ROUNDING,
  });
  explanation.push(...trace.map(line => `Fallback sizing: ${line}`));
  if (!offer) return null;
  explanation.push(
    `Theoretical starter offer (NON-BINDING): ${usd(offer.amount)} using ${params.label} parameters, ` +
    `${usd(POLICY.FALLBACK_OFFER_FLOOR)} floor — informational only; decision remains unchanged.`,
  );
  return { ...offer, non_binding: true, basis, floor: POLICY.FALLBACK_OFFER_FLOOR };
}

// ════════════════════════════════════════════════════════════════
// The model
// ════════════════════════════════════════════════════════════════

export function runDecisionModel(i: ModelInput): ModelOutput {
  const explanation: string[] = [];
  const conditions: string[] = [];

  // ── Stage 1: sufficiency ──
  const sufficiency: GateResult[] = [
    gate("months_of_data", "Months of transaction history", i.monthsOfData >= POLICY.MIN_MONTHS_OF_DATA, `${i.monthsOfData} mo`, `≥ ${POLICY.MIN_MONTHS_OF_DATA} mo`),
    gate("transaction_count", "Transaction sample size", i.transactionCount >= POLICY.MIN_TRANSACTIONS, `${i.transactionCount}`, `≥ ${POLICY.MIN_TRANSACTIONS}`),
    gate("bank_verified", "Bank account verified (Plaid Auth)", i.bankVerified, i.bankVerified ? "yes" : "no", "yes"),
  ];
  const insufficient = sufficiency.filter(g => !g.passed);

  // ── Stage 2: knockouts ──
  const knockouts: GateResult[] = [
    gate("min_revenue", "Minimum monthly revenue", i.monthlyRevenue >= POLICY.MIN_MONTHLY_REVENUE, usd(i.monthlyRevenue), `≥ ${usd(POLICY.MIN_MONTHLY_REVENUE)}`),
    gate("nsf_count", "NSF events in 90 days", i.nsfCount90d <= POLICY.MAX_NSF_90D, `${i.nsfCount90d}`, `≤ ${POLICY.MAX_NSF_90D}`),
    gate("nsf_recency", "No NSF in the last week", i.daysSinceLastNsf > POLICY.MIN_DAYS_SINCE_NSF, i.daysSinceLastNsf >= 9999 ? "never" : `${i.daysSinceLastNsf}d ago`, `> ${POLICY.MIN_DAYS_SINCE_NSF}d`),
    gate("balance_floor", "Minimum daily balance floor", i.minDailyBalance >= POLICY.MIN_DAILY_BALANCE_FLOOR, usd(i.minDailyBalance), `≥ ${usd(POLICY.MIN_DAILY_BALANCE_FLOOR)}`),
    gate("revenue_collapse", "Revenue not collapsing", i.revenueChange3moPct > POLICY.MAX_REVENUE_DECLINE_3MO, pct(i.revenueChange3moPct), `> ${pct(POLICY.MAX_REVENUE_DECLINE_3MO)}`),
    gate("stacking", "Existing loan/MCA positions", i.detectedDebtPositions <= POLICY.MAX_DEBT_POSITIONS, `${i.detectedDebtPositions}`, `≤ ${POLICY.MAX_DEBT_POSITIONS}`),
    gate("debt_service", "Debt service share of revenue", i.debtServiceToRevenuePct < POLICY.MAX_DEBT_SERVICE_RATIO, pct(i.debtServiceToRevenuePct), `< ${pct(POLICY.MAX_DEBT_SERVICE_RATIO)}`),
  ];
  const failedKnockouts = knockouts.filter(g => !g.passed);

  // ── Stage 3: score (always computed for visibility) ──
  const score = scoreCashFlow(i);
  explanation.push(`Cash-flow score: ${score.total}/100.`);

  const base = {
    model_name: MODEL_NAME,
    model_version: MODEL_VERSION,
    score,
    gates: { sufficiency, knockouts },
    input: i,
  };

  if (insufficient.length) {
    explanation.unshift(
      `Insufficient data: ${insufficient.map(g => `${g.label} (${g.value}, needs ${g.threshold})`).join("; ")}.`,
    );
    return {
      ...base,
      decision: "INSUFFICIENT_DATA",
      decision_label: "Insufficient Data — keep collecting",
      // No fallback offer here: with a file this thin the sizing inputs
      // are noise, and the honest message is "keep collecting".
      tier: null, tier_label: null, offer: null, fallback_offer: null,
      conditions: insufficient.map(g => `Resolve: ${g.label} (${g.value}, needs ${g.threshold})`),
      explanation,
    };
  }

  if (failedKnockouts.length) {
    explanation.unshift(
      `Declined on knockout rule(s): ${failedKnockouts.map(g => `${g.label} (${g.value}, limit ${g.threshold})`).join("; ")}.`,
    );
    return {
      ...base,
      decision: "DECLINE",
      decision_label: "Decline — hard rule failure",
      tier: null, tier_label: null, offer: null,
      fallback_offer: sizeFallbackOffer(i, null, explanation),
      conditions: [],
      explanation,
    };
  }

  // ── Stage 4: tier ──
  const tier = TIERS.find(t => score.total >= t.minScore) ?? null;
  if (!tier) {
    explanation.push(`Score ${score.total} is below the Tier 4 floor (${TIERS[3].minScore}).`);
    return {
      ...base,
      decision: "DECLINE",
      decision_label: "Decline — cash-flow score below tier floor",
      tier: null, tier_label: null, offer: null,
      fallback_offer: sizeFallbackOffer(i, null, explanation),
      conditions: [],
      explanation,
    };
  }
  explanation.push(`${tier.label} (score ≥ ${tier.minScore}): factor ${tier.factorMin}–${tier.factorMax}, ${tier.termMonths} mo term.`);

  // ── Stage 5: offer ──
  const offer = sizeOffer(i, tier, explanation);
  if (!offer) {
    return {
      ...base,
      decision: "DECLINE",
      decision_label: "Decline — no affordable offer",
      tier: tier.tier, tier_label: tier.label, offer: null,
      fallback_offer: sizeFallbackOffer(i, tier, explanation),
      conditions: [],
      explanation,
    };
  }
  explanation.push(
    `Offer: ${usd(offer.amount)} at ${offer.factor} over ${offer.term_months} mo — ` +
    `daily ${usd(offer.daily_payment)} (${pct(offer.payment_pct_daily_revenue)} of daily revenue).`,
  );

  // ── Stage 6: decision + conditions ──
  conditions.push("Confirm with credit bureau (CRS/FICO) before funding — bank data only.");
  if (!i.identityVerified) conditions.push("Complete identity verification (Plaid Identity or IDV).");
  if (i.monthsOfData < 6) conditions.push(`Limited history (${i.monthsOfData} mo) — re-run after next full month of data.`);
  if (i.institutionsConnected < 1) conditions.push("Connect at least one bank.");
  if (i.detectedDebtPositions > 0) conditions.push(`Verify ${i.detectedDebtPositions} detected debt position(s) against DataMerch before funding.`);

  const decision: Decision = score.total >= POLICY.PRE_APPROVE_MIN_SCORE ? "PRE_APPROVE"
    : score.total >= POLICY.REVIEW_MIN_SCORE ? "REVIEW"
    : "REVIEW"; // tier 4 band (40–49) always goes to a human

  explanation.push(
    decision === "PRE_APPROVE"
      ? `Score ${score.total} ≥ ${POLICY.PRE_APPROVE_MIN_SCORE}: pre-approve, subject to ${conditions.length} condition(s).`
      : `Score ${score.total} in review band: route to manual underwriting with the sized offer as a starting point.`,
  );

  return {
    ...base,
    decision,
    decision_label:
      decision === "PRE_APPROVE" ? "Pre-Approved — pending conditions" : "Manual Review — offer sized",
    tier: tier.tier,
    tier_label: tier.label,
    offer,
    fallback_offer: null,
    conditions,
    explanation,
  };
}
