/**
 * Real published interchange tables — the "full interchange engine" the
 * pricing heuristics were waiting on.
 *
 * Sources (all effective April 2026 cycle):
 *  - Visa USA Interchange Reimbursement Fees, rates effective April 18, 2026
 *  - Mastercard 2026–2027 U.S. Region Interchange Programs and Rates,
 *    effective April 17, 2026
 *  - Discover published interchange (consumer credit tiers, debit/prepaid,
 *    commercial), current schedule
 *  - American Express OptBlue Wholesale Discount Rates by industry
 *
 * Two consumers:
 *  1. estimateInterchange() — blends the schedules into a realistic network
 *     cost for a merchant category + average ticket, used by the Statement
 *     Analyzer's quoting and internal economics.
 *  2. INTERCHANGE_REFERENCE — the published tables themselves, rendered as a
 *     browsable reference in the analyzer (internal view).
 *
 * The blend uses documented card-mix assumptions (network share, debit vs
 * credit, regulated debit share, rewards mix). Those are estimates; the rates
 * themselves are the published figures.
 */

export const INTERCHANGE_SCHEDULE_VERSION = 'April 2026';

/** A published interchange fee: pct of ticket + fixed per-transaction fee. */
export interface IcFee {
  pct: number;
  perTxn: number;
  /** Per-transaction fee cap in dollars, where the schedule sets one. */
  cap?: number;
  /** Per-transaction fee minimum in dollars (e.g. Visa Restaurant min $0.04). */
  min?: number;
}

/** Durbin-regulated debit (issuers ≥ $10B assets) — identical across networks. */
export const REGULATED_DEBIT: IcFee = { pct: 0.05, perTxn: 0.21 };

/**
 * Network assessments & fees paid on top of interchange (Visa/MC assessments,
 * Discover data usage, Amex network fees), as % of volume. Estimate.
 */
export const ASSESSMENTS_PCT = 0.14;

export type MerchantCategory =
  | 'restaurant'
  | 'retail'
  | 'supermarket'
  | 'ecommerce'
  | 'services'
  | 'healthcare'
  | 'lodging'
  | 'petroleum'
  | 'b2b';

export const MERCHANT_CATEGORIES: { key: MerchantCategory; label: string }[] = [
  { key: 'retail', label: 'Retail' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'supermarket', label: 'Supermarket / Grocery' },
  { key: 'ecommerce', label: 'E-Commerce / Card-Not-Present' },
  { key: 'services', label: 'Professional Services' },
  { key: 'healthcare', label: 'Healthcare' },
  { key: 'lodging', label: 'Lodging / Travel' },
  { key: 'petroleum', label: 'Petroleum / Fuel' },
  { key: 'b2b', label: 'B2B / Wholesale' },
];

/**
 * Per-network anchor rates for one merchant category, taken from the fee
 * program that category qualifies for on each schedule.
 */
export interface CategoryRates {
  visa: { debit: IcFee; credit: IcFee; rewards: IcFee; premium: IcFee; commercial: IcFee };
  mastercard: { debit: IcFee; credit: IcFee; rewards: IcFee; premium: IcFee; commercial: IcFee };
  discover: { debit: IcFee; credit: IcFee; rewards: IcFee; premium: IcFee; commercial: IcFee };
  /** Amex OptBlue wholesale discount: rate by transaction size. */
  amex: { threshold: number; small: number; large: number };
}

/**
 * credit  = entry product (Visa "All Other" / MC Core / Discover Core)
 * rewards = mid rewards (Visa Signature / MC World / Discover Premium)
 * premium = top rewards (Visa Infinite Spend Qualified / MC World High
 *           Value & Elite / Discover Premium Plus)
 */
const CATEGORY_RATES: Record<MerchantCategory, CategoryRates> = {
  restaurant: {
    visa: {
      debit: { pct: 1.19, perTxn: 0.10 },                    // CPS/Restaurant, Debit
      credit: { pct: 2.10, perTxn: 0, min: 0.04 },           // Restaurant, All Other Products
      rewards: { pct: 2.60, perTxn: 0, min: 0.04 },          // Restaurant, Signature
      premium: { pct: 2.60, perTxn: 0, min: 0.04 },          // Restaurant, Infinite
      commercial: { pct: 2.50, perTxn: 0.10 },               // Commercial Card Present
    },
    mastercard: {
      debit: { pct: 1.19, perTxn: 0.10 },                    // Restaurant debit
      credit: { pct: 1.65, perTxn: 0.10 },                   // Merit III Base, Core
      rewards: { pct: 1.85, perTxn: 0.10 },                  // Restaurant, World
      premium: { pct: 2.00, perTxn: 0.10 },                  // Restaurant, World Elite
      commercial: { pct: 1.90, perTxn: 0.10 },               // Data Rate II
    },
    discover: {
      debit: { pct: 1.19, perTxn: 0.10 },                    // Restaurants debit
      credit: { pct: 1.56, perTxn: 0.10 },                   // Restaurants, Core
      rewards: { pct: 2.30, perTxn: 0.10 },                  // Restaurants, Premium
      premium: { pct: 2.45, perTxn: 0.10 },                  // Restaurants, Premium Plus
      commercial: { pct: 2.45, perTxn: 0.15 },               // Electronic Business & Corporate
    },
    amex: { threshold: 200, small: 1.60, large: 2.40 },      // OptBlue Restaurant
  },
  retail: {
    visa: {
      debit: { pct: 0.80, perTxn: 0.15 },                    // CPS/Retail, Debit
      credit: { pct: 1.51, perTxn: 0.10 },                   // Product 2, All Other Products
      rewards: { pct: 1.65, perTxn: 0.10 },                  // Product 2, Signature
      premium: { pct: 2.30, perTxn: 0.10 },                  // Product 2, Infinite
      commercial: { pct: 2.50, perTxn: 0.10 },               // Commercial Card Present
    },
    mastercard: {
      debit: { pct: 1.05, perTxn: 0.15 },                    // Merit III Base debit
      credit: { pct: 1.65, perTxn: 0.10 },                   // Merit III Base, Core
      rewards: { pct: 1.90, perTxn: 0.10 },                  // Merit III Base, World
      premium: { pct: 2.30, perTxn: 0.10 },                  // Merit III Base, World Elite
      commercial: { pct: 1.90, perTxn: 0.10 },               // Data Rate II
    },
    discover: {
      debit: { pct: 1.10, perTxn: 0.16 },                    // Retail debit
      credit: { pct: 1.57, perTxn: 0.10 },                   // Retail, Core
      rewards: { pct: 1.74, perTxn: 0.10 },                  // Retail, Premium
      premium: { pct: 2.25, perTxn: 0.10 },                  // Retail, Premium Plus
      commercial: { pct: 2.45, perTxn: 0.15 },
    },
    amex: { threshold: 500, small: 1.60, large: 2.00 },      // OptBlue Retail
  },
  supermarket: {
    visa: {
      debit: { pct: 0, perTxn: 0.30 },                       // CPS/Supermarket, Debit ($0.30 flat)
      credit: { pct: 1.50, perTxn: 0.07 },                   // Supermarket—All Other, All Other Products
      rewards: { pct: 1.65, perTxn: 0.07 },                  // Supermarket—All Other, Signature
      premium: { pct: 2.00, perTxn: 0.07 },                  // Supermarket—All Other, Infinite
      commercial: { pct: 2.50, perTxn: 0.10 },
    },
    mastercard: {
      debit: { pct: 1.05, perTxn: 0.15, cap: 0.35 },         // Supermarket Base debit
      credit: { pct: 1.45, perTxn: 0.10 },                   // Supermarket Base, Core
      rewards: { pct: 1.70, perTxn: 0.10 },                  // Supermarket Base, World
      premium: { pct: 2.10, perTxn: 0.10 },                  // Supermarket Base, World Elite
      commercial: { pct: 1.90, perTxn: 0.10 },
    },
    discover: {
      debit: { pct: 1.10, perTxn: 0.16, cap: 0.36 },         // Supermarket debit (acquirer cap $0.36)
      credit: { pct: 1.40, perTxn: 0.05 },                   // Supermarket, Core
      rewards: { pct: 1.65, perTxn: 0.10 },                  // Supermarket, Premium
      premium: { pct: 2.10, perTxn: 0.10 },                  // Supermarket, Premium Plus
      commercial: { pct: 2.45, perTxn: 0.15 },
    },
    amex: { threshold: 500, small: 1.60, large: 2.00 },      // OptBlue Other
  },
  ecommerce: {
    visa: {
      debit: { pct: 1.65, perTxn: 0.15 },                    // CPS/e-Commerce Basic, Debit
      credit: { pct: 1.89, perTxn: 0.10 },                   // Product 1, All Other Products
      rewards: { pct: 2.05, perTxn: 0.10 },                  // Product 1, Signature
      premium: { pct: 2.60, perTxn: 0.10 },                  // Product 1, Infinite
      commercial: { pct: 2.70, perTxn: 0.10 },               // Commercial Card Not Present
    },
    mastercard: {
      debit: { pct: 1.65, perTxn: 0.15 },                    // Merit I debit
      credit: { pct: 1.95, perTxn: 0.10 },                   // Merit I, Core
      rewards: { pct: 2.20, perTxn: 0.10 },                  // Merit I, World
      premium: { pct: 2.60, perTxn: 0.10 },                  // Merit I, World Elite
      commercial: { pct: 2.65, perTxn: 0.10 },               // Data Rate I
    },
    discover: {
      debit: { pct: 1.75, perTxn: 0.20 },                    // E-Commerce debit
      credit: { pct: 1.91, perTxn: 0.10 },                   // E-Commerce, Core
      rewards: { pct: 2.05, perTxn: 0.10 },                  // E-Commerce, Premium
      premium: { pct: 2.55, perTxn: 0.10 },                  // E-Commerce, Premium Plus
      commercial: { pct: 2.45, perTxn: 0.15 },
    },
    amex: { threshold: 500, small: 1.60, large: 2.00 },      // OptBlue Mail Order & Internet
  },
  services: {
    visa: {
      debit: { pct: 0.80, perTxn: 0.15 },                    // CPS/Retail, Debit
      credit: { pct: 1.55, perTxn: 0.10 },                   // Services, All Other Products
      rewards: { pct: 1.85, perTxn: 0.10 },                  // Services, Signature
      premium: { pct: 2.30, perTxn: 0.10 },                  // Services, Infinite
      commercial: { pct: 2.50, perTxn: 0.10 },
    },
    mastercard: {
      debit: { pct: 1.05, perTxn: 0.15 },                    // Merit III Base debit
      credit: { pct: 1.65, perTxn: 0.10 },
      rewards: { pct: 1.90, perTxn: 0.10 },
      premium: { pct: 2.30, perTxn: 0.10 },
      commercial: { pct: 1.90, perTxn: 0.10 },
    },
    discover: {
      debit: { pct: 1.10, perTxn: 0.16 },
      credit: { pct: 1.57, perTxn: 0.10 },
      rewards: { pct: 1.74, perTxn: 0.10 },
      premium: { pct: 2.25, perTxn: 0.10 },
      commercial: { pct: 2.45, perTxn: 0.15 },
    },
    amex: { threshold: 500, small: 1.60, large: 2.00 },      // OptBlue Services/Prof Service
  },
  healthcare: {
    visa: {
      debit: { pct: 0.80, perTxn: 0.15 },
      credit: { pct: 1.43, perTxn: 0.05 },                   // Healthcare, non-premium products
      rewards: { pct: 1.43, perTxn: 0.05 },
      premium: { pct: 2.30, perTxn: 0.10 },                  // Healthcare, Infinite Spend Qualified
      commercial: { pct: 2.50, perTxn: 0.10 },
    },
    mastercard: {
      debit: { pct: 0.80, perTxn: 0.25 },                    // Emerging Markets debit
      credit: { pct: 1.65, perTxn: 0.10 },
      rewards: { pct: 1.90, perTxn: 0.10 },
      premium: { pct: 2.30, perTxn: 0.10 },
      commercial: { pct: 1.90, perTxn: 0.10 },
    },
    discover: {
      debit: { pct: 1.10, perTxn: 0.16 },
      credit: { pct: 1.57, perTxn: 0.10 },
      rewards: { pct: 1.74, perTxn: 0.10 },
      premium: { pct: 2.25, perTxn: 0.10 },
      commercial: { pct: 2.45, perTxn: 0.15 },
    },
    amex: { threshold: Infinity, small: 1.34, large: 1.34 }, // OptBlue Healthcare (all amounts)
  },
  lodging: {
    visa: {
      debit: { pct: 1.19, perTxn: 0.10 },                    // CPS/Hotel & Car Rental CP, Debit
      credit: { pct: 1.75, perTxn: 0.10 },                   // Travel, All Other Products
      rewards: { pct: 2.25, perTxn: 0.10 },                  // Travel, Signature
      premium: { pct: 2.55, perTxn: 0.10 },                  // Travel, Infinite
      commercial: { pct: 2.65, perTxn: 0.10 },               // Commercial Travel Service
    },
    mastercard: {
      debit: { pct: 1.15, perTxn: 0.15 },                    // Lodging & Auto Rental debit
      credit: { pct: 1.65, perTxn: 0.10 },                   // Lodging & Auto Rental, Core
      rewards: { pct: 2.25, perTxn: 0.10 },                  // T&E, World
      premium: { pct: 2.55, perTxn: 0.10 },                  // T&E, World High Value/Elite
      commercial: { pct: 2.35, perTxn: 0.10 },               // T&E Rate
    },
    discover: {
      debit: { pct: 1.35, perTxn: 0.16 },                    // Hotels/Car Rentals debit
      credit: { pct: 1.75, perTxn: 0.10 },                   // Hotels & Car Rentals, Core
      rewards: { pct: 2.25, perTxn: 0.10 },                  // Premium
      premium: { pct: 2.55, perTxn: 0.10 },                  // Premium Plus
      commercial: { pct: 2.45, perTxn: 0.15 },
    },
    amex: { threshold: 1000, small: 1.60, large: 2.40 },     // OptBlue Travel & Entertainment
  },
  petroleum: {
    visa: {
      debit: { pct: 0.80, perTxn: 0.15, cap: 0.95 },         // CPS/AFD, Debit
      credit: { pct: 1.15, perTxn: 0.25, cap: 1.10 },        // Fuel (all consumer products)
      rewards: { pct: 1.15, perTxn: 0.25, cap: 1.10 },
      premium: { pct: 1.15, perTxn: 0.25, cap: 1.10 },
      commercial: { pct: 2.20, perTxn: 0.10 },               // Commercial Level II – Fuel
    },
    mastercard: {
      debit: { pct: 0.70, perTxn: 0.17, cap: 0.95 },         // Petroleum CAT/AFD debit
      credit: { pct: 1.90, perTxn: 0, cap: 0.95 },           // Petroleum Base, Core
      rewards: { pct: 2.00, perTxn: 0, cap: 0.95 },          // Petroleum Base, World
      premium: { pct: 2.00, perTxn: 0, cap: 0.95 },
      commercial: { pct: 2.05, perTxn: 0.10 },               // Data Rate II (Petroleum MCCs)
    },
    discover: {
      debit: { pct: 0.76, perTxn: 0.16 },                    // Petroleum debit
      credit: { pct: 1.80, perTxn: 0.05 },                   // Petroleum (flat across tiers)
      rewards: { pct: 1.80, perTxn: 0.05 },
      premium: { pct: 1.80, perTxn: 0.05 },
      commercial: { pct: 2.45, perTxn: 0.15 },
    },
    amex: { threshold: 500, small: 1.60, large: 2.00 },      // OptBlue Other
  },
  b2b: {
    visa: {
      debit: { pct: 1.70, perTxn: 0.10 },                    // Business Debit, Card Present
      credit: { pct: 1.89, perTxn: 0.10 },                   // Product 1, All Other Products
      rewards: { pct: 2.05, perTxn: 0.10 },
      premium: { pct: 2.60, perTxn: 0.10 },
      commercial: { pct: 1.75, perTxn: 0.10 },               // Commercial Product 3 (L2/L3 data)
    },
    mastercard: {
      debit: { pct: 1.65, perTxn: 0.15 },
      credit: { pct: 1.95, perTxn: 0.10 },
      rewards: { pct: 2.20, perTxn: 0.10 },
      premium: { pct: 2.60, perTxn: 0.10 },
      commercial: { pct: 1.90, perTxn: 0.10 },               // Data Rate II
    },
    discover: {
      debit: { pct: 1.75, perTxn: 0.20 },
      credit: { pct: 1.91, perTxn: 0.10 },
      rewards: { pct: 2.05, perTxn: 0.10 },
      premium: { pct: 2.55, perTxn: 0.10 },
      commercial: { pct: 2.45, perTxn: 0.15 },               // Electronic Business & Corporate
    },
    amex: { threshold: 1000, small: 1.60, large: 2.00 },     // OptBlue B2B/Wholesale
  },
};

// ── Card-mix assumptions (documented estimates, not published figures) ──

/** Share of card volume by network — typical US Main Street mix. */
export const NETWORK_MIX = { visa: 0.50, mastercard: 0.27, amex: 0.17, discover: 0.06 } as const;

interface ProductMix {
  /** Share of Visa/MC/Discover volume on debit cards. */
  debitShare: number;
  /** Of debit volume, share on Durbin-regulated (big-bank) cards. */
  regulatedShare: number;
  /** Of credit volume: entry / rewards / premium / commercial (sums to 1). */
  credit: number;
  rewards: number;
  premium: number;
  commercial: number;
}

const DEFAULT_MIX: ProductMix = {
  debitShare: 0.40, regulatedShare: 0.60,
  credit: 0.35, rewards: 0.40, premium: 0.15, commercial: 0.10,
};

/** B2B volume skews heavily to commercial cards with little debit. */
const B2B_MIX: ProductMix = {
  debitShare: 0.10, regulatedShare: 0.60,
  credit: 0.15, rewards: 0.20, premium: 0.05, commercial: 0.60,
};

function mixFor(category: MerchantCategory): ProductMix {
  return category === 'b2b' ? B2B_MIX : DEFAULT_MIX;
}

/** Rates the audit layer compares against (interchangeAudit.ts). */
export function getCategoryRates(category: MerchantCategory): CategoryRates {
  return CATEGORY_RATES[category] ?? CATEGORY_RATES.retail;
}

/** Effective cost of one fee as % of an average-ticket transaction. */
export function effectivePct(fee: IcFee, ticket: number): number {
  if (ticket <= 0) return fee.pct;
  let dollars = (fee.pct / 100) * ticket + fee.perTxn;
  if (fee.min !== undefined) dollars = Math.max(dollars, (fee.pct / 100) * ticket + fee.min);
  if (fee.cap !== undefined) dollars = Math.min(dollars, fee.cap);
  return (dollars / ticket) * 100;
}

export interface InterchangeEstimate {
  /** Blended interchange as % of volume across all four networks. */
  blendedPct: number;
  /** Blended interchange + network assessments — the true network cost. */
  networkCostPct: number;
  /** Per-network blended interchange %, for display. */
  byNetwork: { network: 'visa' | 'mastercard' | 'discover' | 'amex'; label: string; pct: number }[];
}

/**
 * Blend the published schedules into an expected interchange cost for a
 * merchant category at a given average ticket.
 */
export function estimateInterchange(category: MerchantCategory, avgTicket: number): InterchangeEstimate {
  const rates = CATEGORY_RATES[category] ?? CATEGORY_RATES.retail;
  const mix = mixFor(category);
  const ticket = avgTicket > 0 ? avgTicket : 40; // sane default when the statement lacks a ticket

  const blendNetwork = (n: CategoryRates['visa']): number => {
    const debit =
      mix.regulatedShare * effectivePct(REGULATED_DEBIT, ticket) +
      (1 - mix.regulatedShare) * effectivePct(n.debit, ticket);
    const credit =
      mix.credit * effectivePct(n.credit, ticket) +
      mix.rewards * effectivePct(n.rewards, ticket) +
      mix.premium * effectivePct(n.premium, ticket) +
      mix.commercial * effectivePct(n.commercial, ticket);
    return mix.debitShare * debit + (1 - mix.debitShare) * credit;
  };

  const visa = blendNetwork(rates.visa);
  const mastercard = blendNetwork(rates.mastercard);
  const discover = blendNetwork(rates.discover);
  const amex = ticket <= rates.amex.threshold ? rates.amex.small : rates.amex.large;

  const blendedPct =
    NETWORK_MIX.visa * visa +
    NETWORK_MIX.mastercard * mastercard +
    NETWORK_MIX.discover * discover +
    NETWORK_MIX.amex * amex;

  const round2 = (n: number) => Math.round(n * 100) / 100;
  return {
    blendedPct: round2(blendedPct),
    networkCostPct: round2(blendedPct + ASSESSMENTS_PCT),
    byNetwork: [
      { network: 'visa', label: 'Visa', pct: round2(visa) },
      { network: 'mastercard', label: 'Mastercard', pct: round2(mastercard) },
      { network: 'discover', label: 'Discover', pct: round2(discover) },
      { network: 'amex', label: 'Amex OptBlue', pct: round2(amex) },
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Published reference tables (for the analyzer's Interchange Reference panel)
// ═══════════════════════════════════════════════════════════════════════════

export interface ReferenceSection {
  title: string;
  note?: string;
  columns: string[];
  rows: { label: string; values: string[] }[];
}

export interface NetworkReference {
  network: 'visa' | 'mastercard' | 'discover' | 'amex';
  name: string;
  effective: string;
  sections: ReferenceSection[];
}

const r = (label: string, ...values: string[]) => ({ label, values });

export const INTERCHANGE_REFERENCE: NetworkReference[] = [
  {
    network: 'visa',
    name: 'Visa USA',
    effective: 'April 18, 2026',
    sections: [
      {
        title: 'Consumer Check Card (Debit) — Card Present',
        note: 'Regulated (issuer ≥ $10B assets): 0.05% + $0.21 on every program.',
        columns: ['Exempt'],
        rows: [
          r('CPS/Supermarket, Debit', '$0.30'),
          r('CPS/Retail, Debit', '0.80% + $0.15'),
          r('CPS/Automated Fuel Dispenser, Debit', '0.80% + $0.15 ($0.95 cap)'),
          r('CPS/Small Ticket, Debit', '1.55% + $0.04'),
          r('CPS/Restaurant, Debit', '1.19% + $0.10'),
          r('CPS/Hotel & Car Rental CP, Debit', '1.19% + $0.10'),
          r('CPS/Passenger Transport CP, Debit', '1.19% + $0.10'),
          r('CPS/Retail Key Entry, Debit', '1.65% + $0.15'),
        ],
      },
      {
        title: 'Consumer Check Card (Debit) — Card Not Present',
        columns: ['Exempt'],
        rows: [
          r('CPS/Retail 2 – Card Not Present, Debit', '0.65% + $0.15 ($2.00 cap)'),
          r('CPS/Utility, Debit', '$0.65'),
          r('CPS/Card Not Present, Debit', '1.65% + $0.15'),
          r('CPS/e-Commerce Basic, Debit', '1.65% + $0.15'),
          r('CPS/e-Commerce Preferred Retail, Debit', '1.60% + $0.15'),
          r('CPS/Account Funding, Debit', '1.75% + $0.20'),
          r('EIRF, Debit', '1.75% + $0.20'),
          r('Standard, Debit', '1.90% + $0.25'),
        ],
      },
      {
        title: 'Consumer Credit — Card Present',
        columns: ['Infinite (SQ)', 'Signature', 'Trad. Rewards', 'All Other'],
        rows: [
          r('Supermarket — All Other', '2.00% + $0.07', '1.65% + $0.07', '1.50% + $0.07', '1.50% + $0.07'),
          r('Product 2 (Retail)', '2.30% + $0.10', '1.65% + $0.10', '1.65% + $0.10', '1.51% + $0.10'),
          r('Small Ticket', '2.20% (min $0.04)', '2.20% (min $0.04)', '1.90% (min $0.04)', '1.90% (min $0.04)'),
          r('Fuel', '1.15% + $0.25 ($1.10 cap)', '1.15% + $0.25 ($1.10 cap)', '1.15% + $0.25 ($1.10 cap)', '1.15% + $0.25 ($1.10 cap)'),
          r('Restaurant', '2.60% (min $0.04)', '2.60% (min $0.04)', '2.10% (min $0.04)', '2.10% (min $0.04)'),
          r('Travel', '2.55% + $0.10', '2.25% + $0.10', '1.95% + $0.10', '1.75% + $0.10'),
          r('Services (≥$100)', '2.30% + $0.10', '1.85% + $0.10', '1.70% + $0.10', '1.55% + $0.10'),
          r('Healthcare (≥$500)', '2.30% + $0.10', '1.43% + $0.05', '1.43% + $0.05', '1.43% + $0.05'),
          r('Insurance', '2.25% + $0.10', '1.43% + $0.05', '1.43% + $0.05', '1.43% + $0.05'),
          r('Real Estate (≥$500)', '2.15% + $0.10', '1.43% + $0.05', '1.43% + $0.05', '1.43% + $0.05'),
          r('Charity', '1.35% + $0.05', '1.35% + $0.05', '1.35% + $0.05', '1.35% + $0.05'),
          r('Government', '1.55% + $0.10', '1.55% + $0.10', '1.55% + $0.10', '1.55% + $0.10'),
          r('Non-Qualified Consumer Credit', '3.15% + $0.10', '3.15% + $0.10', '3.15% + $0.10', '3.15% + $0.10'),
        ],
      },
      {
        title: 'Consumer Credit — Card Not Present',
        note: 'CNP incentives: EMV token −0.05%, DCAP −0.10%, DCAP+token −0.15% (CPS-qualified).',
        columns: ['Infinite (SQ)', 'Signature', 'Trad. Rewards', 'All Other'],
        rows: [
          r('Product 1 (CNP / e-Commerce)', '2.60% + $0.10', '2.05% + $0.10', '2.04% + $0.10', '1.89% + $0.10'),
          r('Recurring', '2.30% + $0.05', '1.53% + $0.05', '1.53% + $0.05', '1.53% + $0.05'),
          r('Restaurant 1', '2.70% (min $0.08)', '2.70% (min $0.08)', '2.20% (min $0.08)', '2.20% (min $0.08)'),
          r('Travel 1', '2.55% + $0.10', '2.25% + $0.10', '1.95% + $0.10', '1.75% + $0.10'),
          r('Services 1 (≥$100)', '2.40% + $0.10', '1.95% + $0.10', '1.80% + $0.10', '1.65% + $0.10'),
          r('Healthcare 1 (≥$500)', '2.40% + $0.10', '1.53% + $0.05', '1.53% + $0.05', '1.53% + $0.05'),
          r('CPS/Utility', '$0.75', '$0.75', '$0.75', '$0.75'),
        ],
      },
      {
        title: 'Business & Commercial',
        note: 'Business credit tiers run Spend Tier I → V by card spend profile.',
        columns: ['Rate'],
        rows: [
          r('Business Product 2 (Tier I–V)', '1.90% – 2.25% + $0.10'),
          r('Business Product 3 (Tier I–V)', '2.40% – 2.75% + $0.10'),
          r('Business Product 1 (Tier I–V)', '2.65% – 3.00% + $0.10'),
          r('Business Debit, Card Present (exempt)', '1.70% + $0.10'),
          r('Business Debit, Card Not Present (exempt)', '2.45% + $0.10'),
          r('Commercial Product 3 (Purchasing & Corporate T&E)', '1.75% + $0.10'),
          r('Commercial Level II – Fuel', '2.20% + $0.10'),
          r('Commercial Card Present', '2.50% + $0.10'),
          r('Commercial Card Not Present', '2.70% + $0.10'),
          r('Commercial Product Large Ticket', '1.30% + $35.00'),
          r('GSA Large Ticket', '1.20% + $39.00'),
        ],
      },
    ],
  },
  {
    network: 'mastercard',
    name: 'Mastercard U.S.',
    effective: 'April 17, 2026',
    sections: [
      {
        title: 'Consumer Credit',
        columns: ['Core', 'Enhanced', 'World', 'World High Value / Elite'],
        rows: [
          r('Merit III Base (card present)', '1.65% + $0.10', '1.80% + $0.10', '1.90% + $0.10', '2.30% + $0.10'),
          r('Merit I (card not present)', '1.95% + $0.10', '2.10% + $0.10', '2.20% + $0.10', '2.60% + $0.10'),
          r('Key-entered / Full UCAF', '1.95% + $0.10', '2.10% + $0.10', '2.20% + $0.10', '2.60% + $0.10'),
          r('Supermarket Base', '1.45% + $0.10', '1.60% + $0.10', '1.70% + $0.10', '2.10% + $0.10'),
          r('Restaurant', 'Merit III', 'Merit III', '1.85% + $0.10', '2.00% + $0.10'),
          r('Lodging & Auto Rental', '1.65% + $0.10', '1.75% + $0.10', 'T&E', 'T&E'),
          r('T&E', '—', '—', '2.25% + $0.10', '2.55% + $0.10'),
          r('Petroleum Base', '1.90% ($0.95 max)', '1.90% ($0.95 max)', '2.00% ($0.95 max)', '2.00% ($0.95 max)'),
          r('Small Ticket, Card Present (≤$5)', '1.65% + $0.02', '1.80% + $0.02', '1.90% + $0.02', '2.30% + $0.02'),
          r('Public Sector', '1.55% + $0.10', '1.55% + $0.10', '1.55% + $0.10', '1.55% + $0.10'),
          r('Charities', '2.00% + $0.10', '2.00% + $0.10', '2.00% + $0.10', '2.00% + $0.10'),
          r('Utilities', '$0.75', '$0.75', '$0.75', '$0.75'),
          r('Standard (non-qualified)', '3.15% + $0.10', '3.15% + $0.10', '3.15% + $0.10', '3.15% + $0.10'),
        ],
      },
      {
        title: 'Unregulated Consumer Debit & Prepaid',
        note: 'Regulated (issuer ≥ $10B assets): 0.05% + $0.21 (+$0.01 with fraud adjustment).',
        columns: ['Debit', 'Prepaid'],
        rows: [
          r('Merit III Base (card present)', '1.05% + $0.15', '1.15% + $0.15'),
          r('Merit I (card not present)', '1.65% + $0.15', '1.76% + $0.20'),
          r('Supermarket Base', '1.05% + $0.15 ($0.35 max)', '1.05% + $0.15 ($0.35 max)'),
          r('Restaurant', '1.19% + $0.10', '1.19% + $0.10'),
          r('Lodging & Auto Rental', '1.15% + $0.15', '1.15% + $0.15'),
          r('Petroleum CAT/AFD & Service Station', '0.70% + $0.17 ($0.95 max)', '0.70% + $0.17 ($0.95 max)'),
          r('Small Ticket Base', '1.55% + $0.04', '1.55% + $0.04'),
          r('Emerging Markets', '0.80% + $0.25', '0.80% + $0.25'),
          r('Utilities', '$0.65', '$0.65'),
          r('Standard (non-qualified)', '1.90% + $0.25', '1.90% + $0.25'),
        ],
      },
      {
        title: 'Commercial — Small Business Credit',
        columns: ['Level 1 / Core', 'Level 3 / World Elite', 'Level 5'],
        rows: [
          r('Data Rate I (standard)', '2.65% + $0.10', '2.85% + $0.10', '3.00% + $0.10'),
          r('Data Rate II (with L2 data)', '1.90% + $0.10', '2.10% + $0.10', '2.25% + $0.10'),
          r('T&E Rate', '2.35% + $0.10', '2.55% + $0.10', '2.70% + $0.10'),
          r('Standard (non-qualified)', '2.95% + $0.10', '3.15% + $0.10', '3.30% + $0.10'),
          r('Utilities', '$1.50', '$1.50', '$1.50'),
        ],
      },
      {
        title: 'Commercial — Debit / Prepaid / Large Market Credit',
        columns: ['Comm. Debit', 'Comm. Prepaid', 'Large Market Credit'],
        rows: [
          r('Data Rate I', '2.65% + $0.10', '2.65% + $0.10', '2.70% + $0.10'),
          r('Data Rate II', '2.10% + $0.10', '2.65% + $0.10', '2.50% + $0.10'),
          r('Data Rate III', '—', '—', '1.90% + $0.10'),
          r('Large Ticket', '—', '—', '1.45% + $35.00'),
          r('T&E Rate', '2.35% + $0.10', '2.35% + $0.10', '2.65% + $0.10'),
          r('Standard', '2.95% + $0.10', '2.95% + $0.10', '2.95% + $0.10'),
        ],
      },
      {
        title: 'Commercial Payments Account (Large Ticket)',
        columns: ['Rate'],
        rows: [
          r('Large Ticket 1 ($10,000 – $25,000)', '1.20%'),
          r('Large Ticket 2 ($25,000.01 – $100,000)', '1.00%'),
          r('Large Ticket 3 ($100,000.01 – $500,000)', '0.90%'),
          r('Large Ticket 4 ($500,000.01 – $1,000,000)', '0.80%'),
          r('Large Ticket 5 (> $1,000,000)', '0.70%'),
        ],
      },
      {
        title: 'PIN Debit',
        columns: ['Rate'],
        rows: [
          r('PIN Debit All Other Base', '0.90% + $0.15'),
          r('PIN Debit Convenience Base', '0.75% + $0.17 ($0.95 max)'),
          r('PIN Debit Supermarket/Warehouse Base', '1.05% + $0.15 ($0.35 max)'),
          r('PIN Regulated POS Debit', '0.05% + $0.21'),
        ],
      },
    ],
  },
  {
    network: 'discover',
    name: 'Discover',
    effective: 'Current schedule',
    sections: [
      {
        title: 'Consumer Credit',
        note: 'Tiers by cardholder product: Core (entry) → Premium Plus (top rewards).',
        columns: ['Core', 'Core Plus', 'Premium', 'Premium Plus'],
        rows: [
          r('Retail', '1.57% + $0.10', '1.72% + $0.10', '1.74% + $0.10', '2.25% + $0.10'),
          r('Restaurants', '1.56% + $0.10', '1.90% + $0.10', '2.30% + $0.10', '2.45% + $0.10'),
          r('Supermarket', '1.40% + $0.05', '1.62% + $0.10', '1.65% + $0.10', '2.10% + $0.10'),
          r('Hotels & Car Rentals', '1.75% + $0.10', '1.92% + $0.10', '2.25% + $0.10', '2.55% + $0.10'),
          r('Passenger Transport', '1.75% + $0.10', '1.92% + $0.10', '2.25% + $0.10', '2.55% + $0.10'),
          r('Card Not Present / E-Commerce / Key Entry', '1.91% + $0.10', '2.03% + $0.10', '2.05% + $0.10', '2.55% + $0.10'),
          r('E-Commerce Secured', '1.80% + $0.10', '1.90% + $0.10', '1.95% + $0.10', '2.40% + $0.10'),
          r('Recurring Payments', '1.35% + $0.05', '1.35% + $0.05', '1.45% + $0.05', '1.80% + $0.05'),
          r('Insurance', '1.43% + $0.05', '1.43% + $0.05', '1.43% + $0.05', '2.30% + $0.05'),
          r('Real Estate', '1.10%', '1.10%', '1.10%', '2.30% + $0.10'),
          r('Charity', '1.45% + $0.05', '1.50% + $0.05', '1.50% + $0.05', '2.30% + $0.10'),
          r('Micro Ticket / Express Services', '1.95%', '1.95%', '1.97%', '2.05% + $0.05'),
        ],
      },
      {
        title: 'Consumer Credit — Flat Across All Tiers',
        columns: ['Rate'],
        rows: [
          r('Utilities', '$0.75'),
          r('Public Services', '1.55% + $0.10'),
          r('Petroleum', '1.80% + $0.05'),
          r('Base Submission Level', '3.15% + $0.10'),
        ],
      },
      {
        title: 'Debit (Unregulated)',
        note: 'Regulated (issuer ≥ $10B assets): 0.05% + $0.21. Supermarket debit acquirer interchange capped at $0.36/txn.',
        columns: ['Rate'],
        rows: [
          r('Retail', '1.10% + $0.16'),
          r('Restaurants', '1.19% + $0.10'),
          r('Supermarket', '1.10% + $0.16'),
          r('Hotels / Car Rentals', '1.35% + $0.16'),
          r('Card Not Present / E-Commerce / Key Entry', '1.75% + $0.20'),
          r('Recurring Payments', '1.20% + $0.05'),
          r('Petroleum', '0.76% + $0.16'),
          r('Insurance', '0.80% + $0.25'),
          r('Emerging Markets / Charity', '0.90% + $0.20'),
          r('Debt Repayment', '0.70% + $0.16 ($2.40 max)'),
          r('Utilities', '$0.75'),
          r('Base Submission Level', '1.90% + $0.25'),
        ],
      },
      {
        title: 'Commercial',
        note: 'US Commercial B2B 1 (0%) and B2B 2 (6%) apply only to negotiated B2B BIN ranges.',
        columns: ['Rate'],
        rows: [
          r('Electronic Business & Corporate', '2.45% + $0.15'),
          r('Electronic Commercial Debit', '2.45% + $0.15'),
          r('Electronic Commercial Prepaid', '2.65% + $0.10'),
          r('Large Ticket Business & Corporate', '0.90% + $20.00'),
          r('Large Ticket Commercial Debit', '0.90% + $20.00'),
          r('Commercial Base', '3.05% + $0.10'),
          r('Commercial Utilities', '$1.50'),
          r('US Commercial B2B 1 (negotiated BINs)', '0.00%'),
          r('US Commercial B2B 2 (penalty tier)', '6.00%'),
        ],
      },
    ],
  },
  {
    network: 'amex',
    name: 'American Express (OptBlue)',
    effective: 'Current program',
    sections: [
      {
        title: 'Wholesale Discount Rate by Industry',
        note: 'Assessed by the OptBlue participant on the face value of each charge.',
        columns: ['Small Ticket', 'Large Ticket'],
        rows: [
          r('Restaurant (≤/> $200)', '1.60%', '2.40%'),
          r('Retail (≤/> $500)', '1.60%', '2.00%'),
          r('Services / Professional Services (≤/> $500)', '1.60%', '2.00%'),
          r('B2B / Wholesale (≤/> $1,000)', '1.60%', '2.00%'),
          r('Mail Order & Internet (≤/> $500)', '1.60%', '2.00%'),
          r('Travel & Entertainment (≤/> $1,000)', '1.60%', '2.40%'),
          r('Other (≤/> $500)', '1.60%', '2.00%'),
          r('Healthcare (all amounts)', '1.34%', '1.34%'),
          r('Emerging Markets (all amounts)', '1.18%', '1.18%'),
          r('Residential Rent / Long-Term Care (all amounts)', '1.08%', '1.08%'),
          r('Utilities (≤/> $1,000)', '$0.68/txn', '1.88%'),
          r('Prepaid Cards — All Industries (≤/> $200)', '1.60%', '2.00%'),
        ],
      },
      {
        title: 'Network Assessment Fees',
        columns: ['Amount'],
        rows: [
          r('Program Participation Fee (all charges)', '0.12%'),
          r('Card Not Present Fee (non-swiped)', '0.30%'),
          r('Inbound Fee (foreign-issued cards)', '0.60%'),
          r('Existing Merchant Conversion Fee', 'from 0.30%'),
        ],
      },
    ],
  },
];
