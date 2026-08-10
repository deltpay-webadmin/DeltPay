/**
 * Delt pricing programs — the single source for program economics, shared by
 * the Cost Calculator (deal modeling) and the Statement Analyzer (quoting
 * against a real statement).
 *
 * Matrices are keyed by monthly-volume band × risk tier.
 */

export const CASH_DISCOUNT_MATRIX: Record<string, Record<string, { serviceFee: number; monthlyFee: number }>> = {
  '0-10k':    { low: { serviceFee: 3.99, monthlyFee: 49 }, medium: { serviceFee: 3.99, monthlyFee: 69 }, high: { serviceFee: 4.00, monthlyFee: 99 } },
  '10k-25k':  { low: { serviceFee: 3.99, monthlyFee: 49 }, medium: { serviceFee: 3.99, monthlyFee: 69 }, high: { serviceFee: 4.00, monthlyFee: 89 } },
  '25k-50k':  { low: { serviceFee: 3.99, monthlyFee: 39 }, medium: { serviceFee: 3.99, monthlyFee: 59 }, high: { serviceFee: 4.00, monthlyFee: 79 } },
  '50k-100k': { low: { serviceFee: 3.99, monthlyFee: 29 }, medium: { serviceFee: 3.99, monthlyFee: 49 }, high: { serviceFee: 4.00, monthlyFee: 69 } },
  '100k+':    { low: { serviceFee: 3.99, monthlyFee: 0 },  medium: { serviceFee: 3.99, monthlyFee: 29 }, high: { serviceFee: 4.00, monthlyFee: 49 } },
};

export const FLAT_RATE_MATRIX: Record<string, Record<string, { rate: number; perTxn: number }>> = {
  '0-10k':    { low: { rate: 2.95, perTxn: 0.15 }, medium: { rate: 3.25, perTxn: 0.18 }, high: { rate: 3.65, perTxn: 0.22 } },
  '10k-25k':  { low: { rate: 2.75, perTxn: 0.12 }, medium: { rate: 3.05, perTxn: 0.15 }, high: { rate: 3.45, perTxn: 0.20 } },
  '25k-50k':  { low: { rate: 2.55, perTxn: 0.10 }, medium: { rate: 2.85, perTxn: 0.12 }, high: { rate: 3.25, perTxn: 0.18 } },
  '50k-100k': { low: { rate: 2.40, perTxn: 0.08 }, medium: { rate: 2.65, perTxn: 0.10 }, high: { rate: 3.05, perTxn: 0.15 } },
  '100k+':    { low: { rate: 2.25, perTxn: 0.06 }, medium: { rate: 2.50, perTxn: 0.08 }, high: { rate: 2.85, perTxn: 0.12 } },
};

export const VOLUME_BANDS = [
  { key: '0-10k', label: 'Under $10K', midpoint: 5000 },
  { key: '10k-25k', label: '$10K – $25K', midpoint: 17500 },
  { key: '25k-50k', label: '$25K – $50K', midpoint: 37500 },
  { key: '50k-100k', label: '$50K – $100K', midpoint: 75000 },
  { key: '100k+', label: '$100K+', midpoint: 150000 },
];

export const RISK_TIERS = [
  { key: 'low', label: 'Low Risk', desc: 'Retail, professional svcs, healthcare', color: '#34C77B', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
  { key: 'medium', label: 'Medium Risk', desc: 'Restaurants, e-comm, subscription', color: '#F0B429', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
  { key: 'high', label: 'High Risk', desc: 'CBD, nutra, travel, high-chargeback', color: '#F2565B', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
];

/** Flat interchange cost estimate (% of card volume) pending the full interchange engine. */
export const INTERCHANGE_EST = 1.80;

export function volumeBandKey(monthlyVolume: number): string {
  if (monthlyVolume < 10_000) return '0-10k';
  if (monthlyVolume < 25_000) return '10k-25k';
  if (monthlyVolume < 50_000) return '25k-50k';
  if (monthlyVolume < 100_000) return '50k-100k';
  return '100k+';
}

export type RiskTierKey = 'low' | 'medium' | 'high';

export interface ProgramQuote {
  key: 'cash_discount' | 'flat_rate' | 'interchange_plus';
  name: string;
  tagline: string;
  /** What the merchant pays Delt per month under this program. */
  monthlyCost: number;
  annualCost: number;
  annualSavings: number;
  savingsPct: number;
  /** Headline pricing terms for the card. */
  terms: string;
  /** Effective rate the merchant experiences, when meaningful. */
  effectiveRatePct: number | null;
}

export interface QuoteInput {
  monthlyVolume: number;
  monthlyTransactions: number;
  /** The merchant's current total monthly processing cost. */
  currentMonthlyCost: number;
  riskTier: RiskTierKey;
}

// ── Per-deal rate overrides ──────────────────────────────────────────────
// The Statement Analyzer lets staff nudge program rates live while quoting.
// Overrides replace the matrix/heuristic number field-by-field; anything
// left undefined falls back to the band × tier default.

export interface ProgramOverrides {
  cashDiscount?: { serviceFee?: number; monthlyFee?: number };
  flatRate?: { rate?: number; perTxn?: number };
  interchangePlus?: { ratePct?: number };
}

export interface ResolvedProgramRates {
  cashDiscount: { serviceFee: number; monthlyFee: number };
  flatRate: { rate: number; perTxn: number };
  interchangePlus: { ratePct: number };
}

/**
 * The effective rates a quote runs on: band × tier defaults (plus the IC+
 * heuristic) with any per-deal overrides applied. Single source for
 * quotePrograms, estimateProgramEconomics, and the analyzer's rate editors.
 */
export function resolveProgramRates(input: QuoteInput, overrides?: ProgramOverrides): ResolvedProgramRates {
  const band = volumeBandKey(input.monthlyVolume);
  const cd = CASH_DISCOUNT_MATRIX[band][input.riskTier];
  const fr = FLAT_RATE_MATRIX[band][input.riskTier];
  const currentRate = input.monthlyVolume > 0 ? (input.currentMonthlyCost / input.monthlyVolume) * 100 : 0;
  // Interchange-plus estimate: undercut the current effective rate ~22%
  // with a 2.15% floor (heuristic pending the full interchange engine).
  const icRate = Math.max(2.15, Math.round(currentRate * 0.78 * 100) / 100);
  return {
    cashDiscount: {
      serviceFee: overrides?.cashDiscount?.serviceFee ?? cd.serviceFee,
      monthlyFee: overrides?.cashDiscount?.monthlyFee ?? cd.monthlyFee,
    },
    flatRate: {
      rate: overrides?.flatRate?.rate ?? fr.rate,
      perTxn: overrides?.flatRate?.perTxn ?? fr.perTxn,
    },
    interchangePlus: { ratePct: overrides?.interchangePlus?.ratePct ?? icRate },
  };
}

/**
 * Quote all three Delt programs against a merchant's current statement.
 * Cash discount passes the service fee to customers, so the merchant's own
 * cost collapses to the program fee — that's the headline program.
 */
export function quotePrograms(input: QuoteInput, overrides?: ProgramOverrides): ProgramQuote[] {
  const { monthlyVolume, monthlyTransactions, currentMonthlyCost } = input;

  const build = (
    key: ProgramQuote['key'],
    name: string,
    tagline: string,
    monthlyCost: number,
    terms: string,
    effectiveRatePct: number | null,
  ): ProgramQuote => {
    const monthlySavings = Math.max(0, currentMonthlyCost - monthlyCost);
    return {
      key,
      name,
      tagline,
      monthlyCost: Math.round(monthlyCost * 100) / 100,
      annualCost: Math.round(monthlyCost * 12),
      annualSavings: Math.round(monthlySavings * 12),
      savingsPct: currentMonthlyCost > 0 ? Math.round((monthlySavings / currentMonthlyCost) * 1000) / 10 : 0,
      terms,
      effectiveRatePct,
    };
  };

  const { cashDiscount: cd, flatRate: fr, interchangePlus } = resolveProgramRates(input, overrides);
  const icRate = interchangePlus.ratePct;

  return [
    build(
      'cash_discount',
      'Cash Discount',
      'Customers cover the service fee — your processing cost drops to the program fee.',
      cd.monthlyFee,
      `${cd.serviceFee.toFixed(2)}% service fee (customer-paid) · $${cd.monthlyFee}/mo program fee`,
      0,
    ),
    build(
      'flat_rate',
      'Flat Rate',
      'One predictable rate on every transaction, statement simplicity.',
      monthlyVolume * (fr.rate / 100) + monthlyTransactions * fr.perTxn,
      `${fr.rate.toFixed(2)}% + $${fr.perTxn.toFixed(2)}/txn`,
      monthlyVolume > 0
        ? Math.round(((monthlyVolume * (fr.rate / 100) + monthlyTransactions * fr.perTxn) / monthlyVolume) * 10000) / 100
        : fr.rate,
    ),
    build(
      'interchange_plus',
      'Interchange-Plus',
      'Pass-through interchange with a transparent Delt margin.',
      monthlyVolume * (icRate / 100),
      `~${icRate.toFixed(2)}% all-in effective`,
      icRate,
    ),
  ];
}

/**
 * Internal-only Delt economics per program. Deliberately a separate type from
 * ProgramQuote: quotes are merchant-safe and travel into merchant-facing views,
 * economics never should. Do not fold margin fields into ProgramQuote.
 */
export interface ProgramEconomics {
  key: ProgramQuote['key'];
  name: string;
  /** Annual gross revenue to Delt under this program. */
  grossRevenue: number;
  /** Annual estimated interchange cost (INTERCHANGE_EST % of volume). */
  interchangeCost: number;
  /** Annual estimated Delt margin. */
  margin: number;
  /** Margin as bps of annual volume, for at-a-glance comparison. */
  marginBps: number;
}

/**
 * Annualized Delt revenue/margin, mirroring the Cost Calculator's math.
 * Unlike the calculator, no card-ratio factor is applied: the analyzer's
 * volume is already card volume extracted from the statement.
 */
export function estimateProgramEconomics(input: QuoteInput, overrides?: ProgramOverrides): ProgramEconomics[] {
  const { monthlyVolume, monthlyTransactions } = input;
  const annualVolume = monthlyVolume * 12;
  const interchangeCost = annualVolume * (INTERCHANGE_EST / 100);

  const { cashDiscount: cd, flatRate: fr, interchangePlus } = resolveProgramRates(input, overrides);
  const icRate = interchangePlus.ratePct;

  const build = (key: ProgramQuote['key'], name: string, grossRevenue: number): ProgramEconomics => {
    const margin = grossRevenue - interchangeCost;
    return {
      key,
      name,
      grossRevenue: Math.round(grossRevenue),
      interchangeCost: Math.round(interchangeCost),
      margin: Math.round(margin),
      marginBps: annualVolume > 0 ? Math.round((margin / annualVolume) * 10000) : 0,
    };
  };

  return [
    build('cash_discount', 'Cash Discount', annualVolume * (cd.serviceFee / 100) + cd.monthlyFee * 12),
    build('flat_rate', 'Flat Rate', annualVolume * (fr.rate / 100) + monthlyTransactions * fr.perTxn * 12),
    build('interchange_plus', 'Interchange-Plus', annualVolume * (icRate / 100)),
  ];
}
