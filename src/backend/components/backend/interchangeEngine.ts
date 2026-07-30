// ── Merchant Processing Intelligence Engine ──
// Models interchange economics for a processing statement: estimated card mix,
// published interchange categories, network assessments, downgrade leakage,
// card-brand compliance posture, and rate-optimization opportunities.
// All figures derived from a single monthly statement are estimates; the
// engine attaches its assumptions so generated documents can disclose them.

export interface StatementFeeRow {
  label: string;
  amount: number;
}

export interface StatementInput {
  currentProcessor: string;
  statementPeriod: string;
  totalVolume: number;
  totalTransactions: number;
  avgTicket: number;
  effectiveRate: number; // percent, e.g. 3.42
  fees: StatementFeeRow[];
  chargebackCount: number;
  currentMonthlyCost: number;
}

export interface ProposalInput {
  currentRate: number;
  deltRate: number;
  currentMonthlyCost: number;
  deltMonthlyCost: number;
  currentAnnualCost: number;
  deltAnnualCost: number;
  annualSavings: number;
  savingsPercent: number;
}

export type Network = 'Visa' | 'Mastercard' | 'Discover' | 'Amex';

export interface CardMixRow {
  network: Network;
  category: string;      // published interchange program name
  sharePct: number;      // share of gross volume
  volume: number;
  txns: number;
  ratePct: number;       // published rate
  perItem: number;       // published per-item fee
  cost: number;
  qualification: string; // what it takes to clear at this rate
}

export interface AssessmentRow {
  label: string;
  basis: string;
  amount: number;
}

export interface DowngradeFinding {
  program: string;
  trigger: string;
  penalty: string;
  remediation: string;
}

export interface Opportunity {
  title: string;
  rule: string;       // governing card-brand / regulatory rule
  evidence: string;   // what on this statement points at it
  action: string;
  estLowMonthly: number;
  estHighMonthly: number;
  includedInPricing: boolean; // already captured in the Delt rate vs additional upside
}

export interface ChargebackPosture {
  count: number;
  ratioPct: number;
  vdmpThresholdPct: number; // Visa Dispute Monitoring Program
  ecpThresholdPct: number;  // Mastercard Excessive Chargeback Program
  status: 'healthy' | 'watch' | 'at-risk';
  note: string;
}

// ── Delt-side deal economics (internal only — never merchant-facing) ──
// The spread between the merchant's current cost and the wholesale floor is a
// value pool. The merchant's "savings" and Delt's margin are the two shares of
// that pool; pricing is choosing the split. More margin now raises churn risk
// (a competitor running this same audit will surface our spread); the honest
// optimization target is lifetime value, not month-one profit.
export interface PricingScenario {
  name: string;
  merchantSavingsPct: number;   // vs current cost
  merchantMonthlyCost: number;
  effectiveRatePct: number;
  deltMarginMonthly: number;
  deltMarginBps: number;
  churnRisk: 'Low' | 'Moderate' | 'High';
  expectedLifeMonths: number;
  lifetimeValue: number;        // margin × expected life
  isCurrent: boolean;
  isRecommended: boolean;
}

export interface DealEconomics {
  valuePoolMonthly: number;     // current cost − wholesale floor
  merchantShareMonthly: number; // savings delivered
  deltShareMonthly: number;     // our margin
  merchantSharePct: number;
  deltSharePct: number;
  deltAnnualRevenue: number;
  waivedFeesMonthly: number;    // incumbent's fee lines we give up as goodwill
  waivedFeesPaybackMonths: number; // months of margin to recoup the waiver
  scenarios: PricingScenario[];
  recommendedScenario: string;
  retentionNote: string;
  passThroughNote: string;
}

export interface ProcessingIntelligence {
  cardMix: CardMixRow[];
  interchangeTotal: number;
  interchangeRatePct: number;
  assessments: AssessmentRow[];
  assessmentsTotal: number;
  wholesaleTotal: number;      // interchange + assessments = true cost floor
  wholesaleRatePct: number;
  currentMarkup: number;       // current cost above wholesale (spread + leakage)
  currentMarkupBps: number;
  deltMarkup: number;          // delt cost above wholesale
  deltMarkupBps: number;
  pricingModelDiagnosis: string;
  pricingModelDetail: string;
  downgradeLeakLow: number;    // $/mo attributed to downgrades & non-qual surcharges
  downgradeLeakHigh: number;
  downgradeFindings: DowngradeFinding[];
  junkFeesMonthly: number;
  junkFeeLabels: string[];
  chargebacks: ChargebackPosture;
  opportunities: Opportunity[];
  additionalUpsideLow: number;   // beyond the guaranteed Delt pricing, $/mo
  additionalUpsideHigh: number;
  stretchEffectiveRatePct: number; // delt rate if mid-range upside is captured
  economics: DealEconomics;
  assumptions: string[];
}

// Retention heuristic: the deeper the savings we deliver, the harder it is
// for the next statement audit to dislodge us. Bands are calibrated to
// typical ISO attrition curves (industry churn ~18-22%/yr at parity pricing).
function retentionBand(savingsPct: number): { churnRisk: PricingScenario['churnRisk']; lifeMonths: number } {
  if (savingsPct >= 20) return { churnRisk: 'Low', lifeMonths: 60 };
  if (savingsPct >= 12) return { churnRisk: 'Moderate', lifeMonths: 40 };
  if (savingsPct >= 8) return { churnRisk: 'High', lifeMonths: 26 };
  return { churnRisk: 'High', lifeMonths: 16 };
}

function buildDealEconomics(
  input: StatementInput,
  proposal: ProposalInput,
  wholesaleTotal: number,
  deltMarkup: number,
  junkFeesMonthly: number,
): DealEconomics {
  const vol = input.totalVolume || 1;
  const pool = Math.max(0, input.currentMonthlyCost - wholesaleTotal);
  const merchantShare = Math.max(0, input.currentMonthlyCost - proposal.deltMonthlyCost);

  // Candidate splits: win-at-all-costs, the live proposal, a fatter-margin
  // middle, and profit-max. Each prices the merchant at a target savings level
  // and takes whatever is left above the floor as margin.
  const currentPct = proposal.savingsPercent;
  const candidates: { name: string; savingsPct: number; isCurrent: boolean }[] = [
    { name: 'Aggressive (max savings)', savingsPct: 30, isCurrent: false },
    { name: 'Current proposal', savingsPct: currentPct, isCurrent: true },
    { name: 'Balanced-profit', savingsPct: 15, isCurrent: false },
    { name: 'Profit-max', savingsPct: 8, isCurrent: false },
  ].filter(c => c.isCurrent || Math.abs(c.savingsPct - currentPct) > 2);

  const scenarios: PricingScenario[] = candidates
    .map(c => {
      const merchantCost = input.currentMonthlyCost * (1 - c.savingsPct / 100);
      const margin = Math.max(0, merchantCost - wholesaleTotal);
      const band = retentionBand(c.savingsPct);
      return {
        name: c.name,
        merchantSavingsPct: c.savingsPct,
        merchantMonthlyCost: merchantCost,
        effectiveRatePct: (merchantCost / vol) * 100,
        deltMarginMonthly: margin,
        deltMarginBps: (margin / vol) * 10000,
        churnRisk: band.churnRisk,
        expectedLifeMonths: band.lifeMonths,
        lifetimeValue: margin * band.lifeMonths,
        isCurrent: c.isCurrent,
        isRecommended: false,
      };
    })
    .sort((a, b) => b.merchantSavingsPct - a.merchantSavingsPct);

  const best = scenarios.reduce((a, b) => (b.lifetimeValue > a.lifetimeValue ? b : a), scenarios[0]);
  best.isRecommended = true;

  const paybackMonths = deltMarkup > 0 ? junkFeesMonthly / deltMarkup : 0;

  return {
    valuePoolMonthly: pool,
    merchantShareMonthly: merchantShare,
    deltShareMonthly: deltMarkup,
    merchantSharePct: pool > 0 ? (merchantShare / pool) * 100 : 0,
    deltSharePct: pool > 0 ? (deltMarkup / pool) * 100 : 0,
    deltAnnualRevenue: deltMarkup * 12,
    waivedFeesMonthly: junkFeesMonthly,
    waivedFeesPaybackMonths: paybackMonths,
    scenarios,
    recommendedScenario: best.name,
    retentionNote:
      `The savings we deliver are the retention moat: at ${currentPct.toFixed(1)}% delivered savings a competitor ` +
      `audit has little room to undercut us, while a profit-max split leaves ` +
      `${((input.currentMonthlyCost * 0.92 - wholesaleTotal) / vol * 10000).toFixed(0)} bps of visible spread for the ` +
      `next ISO to attack. Expected-life bands assume industry attrition of ~18–22%/yr at parity pricing, extending as delivered savings deepen.`,
    passThroughNote:
      `On interchange-plus, published interchange recoveries flow to the merchant by construction — our profit lever is ` +
      `the fixed margin line, which compounds monthly for the life of the account. The incumbent's fee lines we waive ` +
      `(${junkFeesMonthly.toFixed(2)}/mo) are their pure profit, not ours to lose: the waiver is a goodwill investment ` +
      `recouped by ${paybackMonths < 1 ? 'under a month' : `≈ ${paybackMonths.toFixed(1)} months`} of margin.`,
  };
}

/** Per-line audit commentary for a statement fee row. */
export function auditFeeLine(label: string, amount: number, s: StatementInput, intel: ProcessingIntelligence): string {
  const pctVol = (amount / s.totalVolume) * 100;
  if (/discount/i.test(label))
    return `Blended ${pctVol.toFixed(2)}% base rate vs a ${intel.interchangeRatePct.toFixed(2)}% modeled interchange floor — the spread is processor margin.`;
  if (/transaction/i.test(label))
    return `${(amount / Math.max(1, s.totalTransactions)).toFixed(2)}/txn authorization fee; network per-item cost is ≈ $0.02.`;
  if (/pci/i.test(label)) return 'Junk fee — PCI compliance tooling should be included, not billed. Waived on Delt.';
  if (/statement/i.test(label)) return 'Junk fee — paper/portal statement charge. Waived on Delt.';
  if (/batch/i.test(label)) return 'Per-batch settlement fee; also hints at settlement timing that risks downgrades. Waived on Delt.';
  if (/monthly|service|regulatory|annual/i.test(label)) return 'Recurring processor fee with no interchange basis. Waived on Delt.';
  if (/other|misc|non.?qual|surcharge/i.test(label))
    return `${pctVol.toFixed(2)}% of volume — the classic tiered-pricing bucket for non-qualified surcharges and downgrade billbacks. Primary leakage source.`;
  return 'Reviewed against published network fee schedules.';
}

// ── Published interchange reference (US card-present retail, abbreviated) ──
// Base shares model a typical card-present retail merchant and are re-weighted
// by average ticket before costing.
interface MixTemplate {
  network: Network;
  category: string;
  baseShare: number;
  ratePct: number;
  perItem: number;
  qualification: string;
  tier: 'regulated-debit' | 'exempt-debit' | 'core-credit' | 'rewards' | 'premium' | 'commercial';
}

const MIX_TEMPLATE: MixTemplate[] = [
  { network: 'Visa', category: 'Regulated Debit (Durbin)', baseShare: 0.22, ratePct: 0.05, perItem: 0.22, tier: 'regulated-debit',
    qualification: 'Issuer > $10B in assets — rate capped by Reg II regardless of processor' },
  { network: 'Mastercard', category: 'Regulated Debit (Durbin)', baseShare: 0.10, ratePct: 0.05, perItem: 0.22, tier: 'regulated-debit',
    qualification: 'Issuer > $10B in assets — rate capped by Reg II regardless of processor' },
  { network: 'Visa', category: 'CPS/Retail Debit (Exempt)', baseShare: 0.09, ratePct: 0.80, perItem: 0.15, tier: 'exempt-debit',
    qualification: 'Swiped/dipped, settled ≤ 1 day, auth = clearing amount' },
  { network: 'Mastercard', category: 'Merit III Debit (Exempt)', baseShare: 0.04, ratePct: 1.05, perItem: 0.15, tier: 'exempt-debit',
    qualification: 'Card-present, settled ≤ 1 day, full magstripe/EMV data' },
  { network: 'Visa', category: 'CPS/Retail Credit', baseShare: 0.11, ratePct: 1.51, perItem: 0.10, tier: 'core-credit',
    qualification: 'Card-present, one auth, settled ≤ 1 day, auth = clearing' },
  { network: 'Visa', category: 'Rewards Traditional', baseShare: 0.09, ratePct: 1.65, perItem: 0.10, tier: 'rewards',
    qualification: 'Consumer rewards product meeting CPS/Retail requirements' },
  { network: 'Visa', category: 'Signature Preferred / Infinite', baseShare: 0.06, ratePct: 2.10, perItem: 0.10, tier: 'premium',
    qualification: 'Premium consumer product — rate set by product, CPS-qualified' },
  { network: 'Visa', category: 'Commercial Retail', baseShare: 0.03, ratePct: 2.50, perItem: 0.10, tier: 'commercial',
    qualification: 'Business/corporate card; improves with Level 2/3 data' },
  { network: 'Mastercard', category: 'Merit III Core Credit', baseShare: 0.07, ratePct: 1.58, perItem: 0.10, tier: 'core-credit',
    qualification: 'Card-present, settled ≤ 1 day, auth data intact' },
  { network: 'Mastercard', category: 'World', baseShare: 0.06, ratePct: 1.77, perItem: 0.10, tier: 'rewards',
    qualification: 'World consumer product meeting Merit III requirements' },
  { network: 'Mastercard', category: 'World Elite', baseShare: 0.04, ratePct: 2.20, perItem: 0.10, tier: 'premium',
    qualification: 'Premium consumer product — rate set by product' },
  { network: 'Mastercard', category: 'Commercial Data Rate II', baseShare: 0.02, ratePct: 2.50, perItem: 0.10, tier: 'commercial',
    qualification: 'Business card with Level 2 data (sales tax, customer code)' },
  { network: 'Discover', category: 'PSL Retail', baseShare: 0.03, ratePct: 1.56, perItem: 0.10, tier: 'core-credit',
    qualification: 'Card-present retail, timely settlement' },
  { network: 'Amex', category: 'OptBlue Retail', baseShare: 0.04, ratePct: 1.95, perItem: 0.10, tier: 'rewards',
    qualification: 'OptBlue program; tier set by average Amex ticket' },
];

// Amex OptBlue retail tiers are ticket-banded.
function amexOptBlueRate(avgTicket: number): number {
  if (avgTicket < 75) return 1.60;
  if (avgTicket <= 1000) return 1.95;
  return 2.40;
}

// Visa Fixed Acquirer Network Fee — simplified card-present per-location tier (est.)
function estimateFanf(monthlyVolume: number): number {
  if (monthlyVolume < 5_000) return 2.0;
  if (monthlyVolume < 25_000) return 9.0;
  if (monthlyVolume < 75_000) return 30.0;
  if (monthlyVolume < 200_000) return 60.0;
  return 125.0;
}

// Re-weight the base mix by average ticket: high tickets skew credit/commercial,
// micro-tickets skew regulated debit.
function buildCardMix(input: StatementInput): CardMixRow[] {
  const t = input.avgTicket;
  // -0.06 (micro ticket, more debit) .. +0.14 (large ticket, more credit/commercial)
  const creditShift = Math.max(-0.06, Math.min(0.14, (t - 60) / 900));

  const shares = MIX_TEMPLATE.map(m => {
    let s = m.baseShare;
    if (m.tier === 'regulated-debit' || m.tier === 'exempt-debit') s *= 1 - creditShift * 1.6;
    if (m.tier === 'premium' || m.tier === 'commercial') s *= 1 + creditShift * 3.2;
    if (m.tier === 'rewards') s *= 1 + creditShift * 1.2;
    return s;
  });
  const total = shares.reduce((a, b) => a + b, 0);

  return MIX_TEMPLATE.map((m, i) => {
    const share = shares[i] / total;
    const volume = input.totalVolume * share;
    const txns = input.totalTransactions * share;
    const ratePct = m.network === 'Amex' ? amexOptBlueRate(t) : m.ratePct;
    const cost = volume * (ratePct / 100) + txns * m.perItem;
    return {
      network: m.network,
      category: m.category,
      sharePct: share * 100,
      volume,
      txns,
      ratePct,
      perItem: m.perItem,
      cost,
      qualification: m.qualification,
    };
  });
}

function buildAssessments(input: StatementInput, mix: CardMixRow[]): AssessmentRow[] {
  const volBy = (n: Network) => mix.filter(m => m.network === n).reduce((a, m) => a + m.volume, 0);
  const txnBy = (n: Network) => mix.filter(m => m.network === n).reduce((a, m) => a + m.txns, 0);
  const mcAssessRate = input.avgTicket > 1000 ? 0.1475 : 0.1375;

  return [
    { label: 'Visa assessments', basis: '0.14% of Visa volume', amount: volBy('Visa') * 0.0014 },
    { label: 'Visa APF (auth processing)', basis: '$0.0195 per Visa auth', amount: txnBy('Visa') * 0.0195 },
    { label: 'Visa FANF (est.)', basis: 'Fixed monthly, per location, volume-tiered', amount: estimateFanf(input.totalVolume) },
    { label: 'Mastercard assessments', basis: `${mcAssessRate}% of MC volume`, amount: volBy('Mastercard') * (mcAssessRate / 100) },
    { label: 'Mastercard NABU', basis: '$0.0195 per MC auth', amount: txnBy('Mastercard') * 0.0195 },
    { label: 'Mastercard merchant location fee', basis: '$15/yr billed monthly', amount: 1.25 },
    { label: 'Discover assessments', basis: '0.13% of Discover volume', amount: volBy('Discover') * 0.0013 },
    { label: 'Amex OptBlue network fee', basis: '0.15% of Amex volume', amount: volBy('Amex') * 0.0015 },
  ];
}

const feeMatch = (fees: StatementFeeRow[], re: RegExp) =>
  fees.filter(f => re.test(f.label)).reduce((a, f) => a + f.amount, 0);

export function analyzeProcessing(input: StatementInput, proposal: ProposalInput): ProcessingIntelligence {
  const vol = input.totalVolume || 1;
  const mix = buildCardMix(input);
  const interchangeTotal = mix.reduce((a, m) => a + m.cost, 0);
  const assessments = buildAssessments(input, mix);
  const assessmentsTotal = assessments.reduce((a, r) => a + r.amount, 0);
  const wholesaleTotal = interchangeTotal + assessmentsTotal;

  const currentMarkup = Math.max(0, input.currentMonthlyCost - wholesaleTotal);
  const deltMarkup = Math.max(0, proposal.deltMonthlyCost - wholesaleTotal);

  // ── Fee-line forensics ──
  const otherFees = feeMatch(input.fees, /other|misc|non.?qual|surcharge|downgrade|billback|enhanced/i);
  const junkLabels = input.fees
    .filter(f => /pci|statement|batch|regulatory|annual|monthly fee|service fee|iRS|reporting/i.test(f.label))
    .map(f => f.label);
  const junkFeesMonthly = feeMatch(input.fees, /pci|statement|batch|regulatory|annual|monthly fee|service fee|reporting/i);
  const discountFees = feeMatch(input.fees, /discount/i);

  const otherPctOfVolume = (otherFees / vol) * 100;
  // Non-qualified surcharges and downgraded interchange typically hide in the
  // "Other" bucket on tiered statements; attribute 40–75% of it to leakage.
  const downgradeLeakLow = otherFees * 0.4;
  const downgradeLeakHigh = otherFees * 0.75;

  // ── Pricing model diagnosis ──
  const hasSingleDiscountLine = discountFees > 0;
  const heavyOther = otherPctOfVolume > 0.25;
  let pricingModelDiagnosis: string;
  let pricingModelDetail: string;
  if (hasSingleDiscountLine && heavyOther) {
    pricingModelDiagnosis = 'Tiered (bundled) pricing with non-qualified surcharges';
    pricingModelDetail =
      `A single blended "Discount Rate" line (${((discountFees / vol) * 100).toFixed(2)}% of volume) plus an ` +
      `"Other" bucket at ${otherPctOfVolume.toFixed(2)}% of volume is the signature of qual/mid-qual/non-qual tiered pricing. ` +
      `Rewards, premium, keyed and downgraded transactions are being billed back at padded surcharge rates rather than passed through at published interchange.`;
  } else if (hasSingleDiscountLine) {
    pricingModelDiagnosis = 'Bundled flat-rate pricing';
    pricingModelDetail =
      'A single blended discount rate hides the spread between low-cost regulated debit and premium credit. ' +
      'The merchant overpays on debit-heavy days and the processor keeps the difference.';
  } else {
    pricingModelDiagnosis = 'Interchange-plus (verify pass-through integrity)';
    pricingModelDetail =
      'Fee lines suggest cost-plus pricing; the audit should verify interchange is passed through at published rates with no padding.';
  }

  // ── Downgrade findings ──
  const downgradeFindings: DowngradeFinding[] = [
    {
      program: 'Visa EIRF → Standard',
      trigger: 'Settlement later than 1 day after auth, missing CPS data, or auth/clearing amount mismatch',
      penalty: '+0.79% to +1.19% vs CPS/Retail on every downgraded sale',
      remediation: 'Auto-close batches daily; ensure terminal passes full EMV/AVS data; reversals for unused auths (Visa Misuse of Authorization rules)',
    },
    {
      program: 'Mastercard Merit III → Standard',
      trigger: 'Settlement > 24 hours, stale authorization, or missing POS entry-mode data',
      penalty: '+1.37% vs Merit III core on every downgraded sale',
      remediation: 'Daily auto-batch; auth-to-settle window enforcement; full track/EMV data on every dip',
    },
    {
      program: 'Commercial cards clearing at Data Rate I / Standard',
      trigger: 'Missing Level 2 data (sales tax amount, customer code) on business/corporate cards',
      penalty: '+0.50% to +0.85% vs enhanced-data rates',
      remediation: 'Enable automatic Level 2/3 data enrichment at the gateway',
    },
  ];

  // ── Chargeback posture (Visa VDMP ≥ 0.9%, Mastercard ECP ≥ 1.5% w/ 100+ disputes) ──
  const cbRatio = input.totalTransactions > 0 ? (input.chargebackCount / input.totalTransactions) * 100 : 0;
  const cbStatus: ChargebackPosture['status'] = cbRatio >= 0.9 ? 'at-risk' : cbRatio >= 0.45 ? 'watch' : 'healthy';
  const chargebacks: ChargebackPosture = {
    count: input.chargebackCount,
    ratioPct: cbRatio,
    vdmpThresholdPct: 0.9,
    ecpThresholdPct: 1.5,
    status: cbStatus,
    note:
      cbStatus === 'healthy'
        ? `At ${cbRatio.toFixed(2)}% the dispute ratio is well inside Visa VDMP (0.9%) and Mastercard ECP (1.5%) thresholds. Maintain with dispute alerts and Visa CE 3.0 compelling-evidence responses on friendly fraud.`
        : cbStatus === 'watch'
          ? `At ${cbRatio.toFixed(2)}% the dispute ratio is trending toward Visa's 0.9% VDMP threshold. Deploy pre-dispute alerts (Verifi/Ethoca) and CE 3.0 evidence workflows now.`
          : `At ${cbRatio.toFixed(2)}% the merchant is at or above network monitoring thresholds — program placement adds fines and remediation requirements. Immediate dispute-management program required.`,
  };

  // ── Opportunities ──
  const exemptDebitVol = mix.filter(m => m.category.includes('Exempt')).reduce((a, m) => a + m.volume, 0);
  const commercialVol = mix.filter(m => m.category.includes('Commercial')).reduce((a, m) => a + m.volume, 0);
  const markupCompression = Math.max(0, currentMarkup - deltMarkup);

  const opportunities: Opportunity[] = [
    {
      title: 'Move from tiered pricing to true interchange-plus',
      rule: 'Pricing structure — processor level (no card-brand restriction)',
      evidence: `${pricingModelDiagnosis}; current cost runs ${(((input.currentMonthlyCost - wholesaleTotal) / vol) * 100).toFixed(2)}% above the interchange + assessments floor.`,
      action: 'Delt bills published interchange at cost with one transparent margin line — every downgrade recovery flows to the merchant, not the processor.',
      estLowMonthly: markupCompression * 0.9,
      estHighMonthly: markupCompression,
      includedInPricing: true,
    },
    {
      title: 'Eliminate interchange downgrades at the terminal',
      rule: 'Visa CPS qualification & Misuse of Authorization; Mastercard Merit III timeliness',
      evidence: `"Other" fees of ${otherPctOfVolume.toFixed(2)}% of volume indicate non-qualified billbacks${feeMatch(input.fees, /batch/i) > 0 ? '; batch fees on the statement suggest manual/irregular settlement timing' : ''}.`,
      action: 'Daily auto-close, auth/clearing amount matching, full EMV + AVS data pass-through, auth reversals on voided sales.',
      estLowMonthly: downgradeLeakLow,
      estHighMonthly: downgradeLeakHigh,
      includedInPricing: true,
    },
    {
      title: 'Least-cost debit routing (Reg II dual routing)',
      rule: 'Durbin Amendment / Regulation II — every debit card must support two unaffiliated networks',
      evidence: `≈ ${((exemptDebitVol / vol) * 100).toFixed(0)}% of volume modeled as exempt debit that can route over regional PIN/PINless networks (Pulse, NYCE, STAR, Accel) below signature-network pricing.`,
      action: 'Enable intelligent debit routing that picks the cheapest compliant network per transaction.',
      estLowMonthly: exemptDebitVol * 0.0015,
      estHighMonthly: exemptDebitVol * 0.0035,
      includedInPricing: false,
    },
    {
      title: 'Level 2/3 data on commercial cards',
      rule: 'Visa/Mastercard enhanced-data interchange programs',
      evidence: `≈ ${((commercialVol / vol) * 100).toFixed(0)}% of volume modeled as business/corporate cards currently clearing without enhanced data.`,
      action: 'Gateway-level auto-population of tax amount, customer code, and line-item detail.',
      estLowMonthly: commercialVol * 0.004,
      estHighMonthly: commercialVol * 0.007,
      includedInPricing: false,
    },
    {
      title: 'Strip non-processing junk fees',
      rule: 'Processor billing practice — not a card-brand cost',
      evidence: junkLabels.length
        ? `${junkLabels.join(', ')} total ${junkFeesMonthly.toFixed(2)}/mo with no interchange basis.`
        : 'No obvious junk-fee lines detected this period.',
      action: 'Delt waives PCI, statement, and batch fees; PCI compliance tooling is included.',
      estLowMonthly: junkFeesMonthly,
      estHighMonthly: junkFeesMonthly,
      includedInPricing: true,
    },
  ];

  const upside = opportunities.filter(o => !o.includedInPricing);
  const additionalUpsideLow = upside.reduce((a, o) => a + o.estLowMonthly, 0);
  const additionalUpsideHigh = upside.reduce((a, o) => a + o.estHighMonthly, 0);
  const upsideMid = (additionalUpsideLow + additionalUpsideHigh) / 2;
  const stretchEffectiveRatePct = ((proposal.deltMonthlyCost - upsideMid) / vol) * 100;

  return {
    cardMix: mix,
    interchangeTotal,
    interchangeRatePct: (interchangeTotal / vol) * 100,
    assessments,
    assessmentsTotal,
    wholesaleTotal,
    wholesaleRatePct: (wholesaleTotal / vol) * 100,
    currentMarkup,
    currentMarkupBps: (currentMarkup / vol) * 10000,
    deltMarkup,
    deltMarkupBps: (deltMarkup / vol) * 10000,
    pricingModelDiagnosis,
    pricingModelDetail,
    downgradeLeakLow,
    downgradeLeakHigh,
    downgradeFindings,
    junkFeesMonthly,
    junkFeeLabels: junkLabels,
    chargebacks,
    opportunities,
    additionalUpsideLow,
    additionalUpsideHigh,
    stretchEffectiveRatePct,
    economics: buildDealEconomics(input, proposal, wholesaleTotal, deltMarkup, junkFeesMonthly),
    assumptions: [
      'Card mix is modeled from total volume, transaction count, and average ticket against a card-present retail baseline, re-weighted for ticket size; the statement does not disclose per-brand volumes.',
      'Interchange and assessment rates reflect published US card-present schedules (Visa CPS, Mastercard Merit III, Discover PSL, Amex OptBlue) current as of the most recent April/October network release.',
      'Regulated (Durbin) debit is capped at 0.05% + $0.22 by Regulation II for issuers over $10B in assets and is identical on every processor — savings on that portion come only from markup, not interchange.',
      'Downgrade leakage is estimated from the non-interchange "Other" fee bucket typical of tiered statements; a line-item interchange report from the current processor would refine it.',
      'Visa FANF is estimated from the card-present per-location tier for this volume band.',
      'Delt pricing is interchange-plus: published interchange and assessments at cost, one transparent margin, junk fees waived.',
    ],
  };
}
