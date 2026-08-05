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
  /**
   * True monthly interchange + assessment cost at published rates, when the
   * Statement Analyzer extracted real interchange lines. Grounds the
   * interchange-plus quote in actual cost instead of the heuristic.
   */
  interchangeFloorMonthly?: number | null;
}

/**
 * Quote all three Delt programs against a merchant's current statement.
 * Cash discount passes the service fee to customers, so the merchant's own
 * cost collapses to the program fee — that's the headline program.
 */
export function quotePrograms(input: QuoteInput): ProgramQuote[] {
  const { monthlyVolume, monthlyTransactions, currentMonthlyCost, riskTier, interchangeFloorMonthly } = input;
  const band = volumeBandKey(monthlyVolume);
  const currentRate = monthlyVolume > 0 ? (currentMonthlyCost / monthlyVolume) * 100 : 0;

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

  const cd = CASH_DISCOUNT_MATRIX[band][riskTier];
  const fr = FLAT_RATE_MATRIX[band][riskTier];

  // Interchange-plus: quote from the true cost basis (published interchange
  // + assessments + 0.25% + $0.10/txn Delt margin) when the analyzer
  // extracted real interchange lines; otherwise fall back to the heuristic —
  // undercut the current effective rate ~22% with a 2.15% floor.
  const hasFloor = interchangeFloorMonthly != null && monthlyVolume > 0;
  const heuristicRate = Math.max(2.15, Math.round(currentRate * 0.78 * 100) / 100);
  const icCost = hasFloor
    ? interchangeFloorMonthly! + monthlyVolume * 0.0025 + monthlyTransactions * 0.10
    : monthlyVolume * (heuristicRate / 100);
  const icRate = hasFloor
    ? Math.round((icCost / monthlyVolume) * 10000) / 100
    : heuristicRate;

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
      hasFloor
        ? 'True pass-through priced from this statement’s card mix at published interchange.'
        : 'Pass-through interchange with a transparent Delt margin.',
      icCost,
      hasFloor
        ? `IC pass-through + 0.25% + $0.10/txn (~${icRate.toFixed(2)}% all-in)`
        : `~${icRate.toFixed(2)}% all-in effective`,
      icRate,
    ),
  ];
}
