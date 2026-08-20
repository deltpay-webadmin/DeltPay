/**
 * ────────────────────────────────────────────────────────────────
 * Underwriting input shapes
 * ────────────────────────────────────────────────────────────────
 * Data shapes for the evidence captured on an underwriting file.
 * Plaid inputs are produced server-side from live bank data
 * (supabase/functions/_shared/plaid.ts → underwriting_inputs docs);
 * CRS and DataMerch blocks are staff-keyed evidence — recorded on the
 * file but NOT scored: the Delt Cash-Flow Decision Model
 * (supabase/functions/_shared/decision_model.ts) is the only scorer.
 */

export type RevenueTrend = 'growing' | 'flat' | 'declining';
export type DepositConcentration = 'diversified' | 'moderate' | 'concentrated';

/** Signals pulled from Plaid (cash-flow risk). */
export interface PlaidInputs {
  avgDailyBalance: number;          // $
  minDailyBalance: number;          // $
  nsfCount90d: number;              // count over last 90d
  daysSinceLastNsf: number;         // 9999 if never
  monthlyRevenue: number;           // $ avg over last 3 mo
  revenueStdDevPct: number;         // 0–1, stddev / mean across last 3 months
  revenueTrend: RevenueTrend;
  depositConcentration: DepositConcentration;
  revenueChange3moPct: number;      // signed change last 3 mo, e.g. -0.30 = -30%
}

/** Evidence from CRS / credit bureau (recorded, not scored). */
export interface CrsInputs {
  fico: number;                     // personal FICO
  businessCreditScore?: number;     // optional (e.g. PAYDEX, Intelliscore)
  derogatoryMarks: number;          // collections + judgments + liens
  creditUtilizationPct: number;     // 0–1
  timeInFileYears: number;          // length of credit file
  activeBankruptcy: boolean;
}

/** Evidence from DataMerch / industry MCA history (recorded, not scored). */
export interface DataMerchInputs {
  priorPositions: number;           // total historical MCA positions
  priorDefaults: number;            // # of prior MCA defaults/charge-offs
  earlyPayoffs: number;             // positive signal
  currentOpenPositions: number;     // currently outstanding
  positionSeniority: 1 | 2 | 3 | 4; // 1 = senior; we'd be in 2/3/4 if stacked
}
