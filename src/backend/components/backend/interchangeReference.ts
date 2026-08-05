/**
 * Published interchange reference + verification engine, shared by the
 * Statement Analyzer (AI-extracted interchange lines) and the Residuals
 * merchant detail (processor-reported lines).
 *
 * Compares reported interchange rates against the published Visa/MC/Amex/
 * Discover schedules and flags padding, misclassification, and downgrade
 * abuse. Published rates update each April & October — refresh this table
 * (and IC_SCHEDULE) every cycle.
 */

export const IC_SCHEDULE = {
  version: 'April 2026',
  effectiveDate: 'April 18, 2026',
  nextUpdate: 'October 2026',
  lastChecked: '2026-04-15',
};

export interface PublishedRate {
  network: 'Visa' | 'Mastercard' | 'Amex' | 'Discover';
  published: { rate: number; txnFee: number };
  program: string;
  /** Common statement labels/abbreviations processors use for this bucket. */
  aliases: string[];
  notes: string;
  /** Legitimate spread for wide buckets (rewards tiers, OptBlue tiers). */
  range?: { low: number; high: number };
  commonPadding: string;
}

export const PUBLISHED_RATES: Record<string, PublishedRate> = {
  'Visa Credit — Qual': {
    network: 'Visa',
    published: { rate: 1.51, txnFee: 0.10 },
    program: 'CPS Retail / CPS Retail 2',
    aliases: ['VS CRD QUAL', 'VISA QUAL', 'CPS RETAIL', 'VISA QUALIFIED', 'VISA CREDIT QUALIFIED'],
    notes: 'Card present, swiped/dipped/tapped. Most common qualified bucket.',
    commonPadding: 'Processors often blend Rewards 1 (1.65%) into this bucket at a higher blended rate',
  },
  'Visa Credit — Mid-Qual': {
    network: 'Visa',
    published: { rate: 1.99, txnFee: 0.10 },
    program: 'CPS Rewards 2 / EIRF',
    aliases: ['VS CRD MQUAL', 'VISA MID', 'EIRF CREDIT', 'VISA MID-QUALIFIED', 'VISA REWARDS', 'CPS REWARDS'],
    notes: 'Rewards cards or keyed-in transactions. Wide range depending on card tier.',
    range: { low: 1.65, high: 2.30 },
    commonPadding: "This is the #1 bucket for padding — it's a wide category and processors exploit the ambiguity",
  },
  'Visa Credit — Non-Qual': {
    network: 'Visa',
    published: { rate: 2.70, txnFee: 0.10 },
    program: 'Standard / Non-Qualified',
    aliases: ['VS CRD NQUAL', 'VISA NON-QUAL', 'VISA STD', 'VISA STANDARD', 'VISA NON-QUALIFIED'],
    notes: 'Catch-all downgrade bucket. Heavy volume here means transactions are being downgraded.',
    commonPadding: "High non-qual volume usually means the processor isn't submitting proper data — ask why",
  },
  'Visa Debit — Regulated': {
    network: 'Visa',
    published: { rate: 0.05, txnFee: 0.22 },
    program: 'Regulated Debit (Durbin)',
    aliases: ['VS DBT REG', 'VISA DEBIT REG', 'DURBIN VISA', 'VISA REGULATED DEBIT', 'VISA CHECK CARD REG'],
    notes: 'Durbin-regulated debit. Rate is set by the Federal Reserve, not Visa.',
    commonPadding: 'This rate is federally regulated — there is ZERO reason for variance. Any difference is markup.',
  },
  'Visa Debit — Exempt': {
    network: 'Visa',
    published: { rate: 0.80, txnFee: 0.15 },
    program: 'CPS Retail Debit (Exempt)',
    aliases: ['VS DBT EXEMPT', 'VISA DEBIT UNREGULATED', 'VISA EXEMPT DEBIT', 'VISA CHECK CARD'],
    notes: 'Small-bank debit cards exempt from Durbin. Higher than regulated.',
    commonPadding: "Sometimes blended with regulated debit to inflate the 'average' debit rate",
  },
  'MC Credit — Qual': {
    network: 'Mastercard',
    published: { rate: 1.58, txnFee: 0.10 },
    program: 'Merit III / Core',
    aliases: ['MC CRD QUAL', 'MC MERIT III', 'MC CORE', 'MC QUALIFIED', 'MASTERCARD QUAL', 'MC CREDIT QUALIFIED'],
    notes: 'Card present, standard consumer credit. Core Value tier.',
    commonPadding: "Watch for World and World Elite cards being bucketed here at a padded 'qualified' rate",
  },
  'MC Credit — Mid-Qual': {
    network: 'Mastercard',
    published: { rate: 2.05, txnFee: 0.10 },
    program: 'World / Enhanced Value',
    aliases: ['MC CRD MQUAL', 'MC MID', 'MC WORLD', 'MASTERCARD MID-QUALIFIED', 'MC ENHANCED'],
    notes: 'World and World Elite cards, or keyed transactions.',
    range: { low: 1.73, high: 2.40 },
    commonPadding: 'Similar to Visa mid-qual — wide bucket, easy to pad',
  },
  'MC Credit — Non-Qual': {
    network: 'Mastercard',
    published: { rate: 2.90, txnFee: 0.10 },
    program: 'Standard',
    aliases: ['MC CRD NQUAL', 'MC NON-QUAL', 'MC STD', 'MASTERCARD STANDARD', 'MC NON-QUALIFIED'],
    notes: 'Downgrade bucket — keyed without AVS, late settlement, missing data.',
    commonPadding: 'Same story as Visa non-qual: heavy volume here is a data-quality problem, not a card-mix problem',
  },
  'MC Debit — Regulated': {
    network: 'Mastercard',
    published: { rate: 0.05, txnFee: 0.22 },
    program: 'Regulated Debit (Durbin)',
    aliases: ['MC DBT REG', 'MC DEBIT REG', 'DURBIN MC', 'MASTERCARD REGULATED DEBIT'],
    notes: 'Same Durbin regulation as Visa. Federally set rate.',
    commonPadding: 'Identical to Visa regulated — any variance is pure markup.',
  },
  'MC Debit — Exempt': {
    network: 'Mastercard',
    published: { rate: 0.90, txnFee: 0.15 },
    program: 'Merit III Debit (Exempt)',
    aliases: ['MC DBT EXEMPT', 'MC DEBIT UNREGULATED', 'MASTERCARD EXEMPT DEBIT'],
    notes: 'Small-bank debit exempt from Durbin.',
    commonPadding: 'Blending with regulated debit inflates the average debit rate',
  },
  'Amex OptBlue': {
    network: 'Amex',
    published: { rate: 2.30, txnFee: 0.10 },
    program: 'OptBlue Tier 3',
    aliases: ['AMEX OPT', 'AMEX OPTBLUE', 'AX OPTBLUE', 'AMERICAN EXPRESS', 'AMEX'],
    notes: 'Amex OptBlue for merchants under $1M/yr Amex volume. Rates vary widely by tier.',
    range: { low: 1.60, high: 3.30 },
    commonPadding: 'Amex has the widest tier spread — always verify which OptBlue tier the merchant qualifies for',
  },
  'Discover — Qual': {
    network: 'Discover',
    published: { rate: 1.56, txnFee: 0.10 },
    program: 'Consumer Credit Card Present',
    aliases: ['DISC QUAL', 'DISCOVER QUAL', 'DISCOVER', 'DISC', 'DISCOVER QUALIFIED'],
    notes: 'Card present consumer Discover.',
    commonPadding: "Often lumped into a generic 'other networks' bucket at an inflated rate",
  },
};

/** Network assessment fees (separate from interchange), % of volume. */
export const NETWORK_FEES = {
  visa: { name: 'Visa', assessment: 0.14, accessFee: 0.0195 },
  mastercard: { name: 'Mastercard', assessment: 0.13, accessFee: 0.0195 },
  amex: { name: 'Amex', assessment: 0.15, accessFee: 0.0 },
  discover: { name: 'Discover', assessment: 0.13, accessFee: 0.0195 },
};

// ── Category matching ──
// Statement labels are free-form ("VS CRD QUAL", "Visa Qualified", "MC World
// Rewards"). Normalize both sides and match on canonical name, alias, or
// network + qualification keywords.

const normalize = (s: string) =>
  s.toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

interface CategorySignals {
  network: PublishedRate['network'] | null;
  debit: boolean;
  regulated: boolean;
  qual: 'qual' | 'mid' | 'non' | null;
}

function readSignals(label: string): CategorySignals {
  const n = ` ${normalize(label)} `;
  const network =
    /\b(VISA|VS)\b/.test(n) ? 'Visa'
    : /\b(MASTERCARD|MC|MASTER CARD)\b/.test(n) ? 'Mastercard'
    : /\b(AMEX|AMERICAN EXPRESS|AX)\b/.test(n) ? 'Amex'
    : /\b(DISCOVER|DISC)\b/.test(n) ? 'Discover'
    : null;
  const debit = /\b(DEBIT|DBT|CHECK CARD)\b/.test(n);
  const regulated = /\b(REG|REGULATED|DURBIN)\b/.test(n) && !/\bUNREGULATED\b/.test(n);
  const qual: CategorySignals['qual'] =
    /\b(NON QUAL|NQUAL|NONQUAL|STD|STANDARD)\b/.test(n) ? 'non'
    : /\b(MID QUAL|MQUAL|MIDQUAL|MID|EIRF|REWARDS|WORLD|ENHANCED)\b/.test(n) ? 'mid'
    : /\b(QUAL|QUALIFIED|CPS|MERIT|CORE)\b/.test(n) ? 'qual'
    : null;
  return { network, debit, regulated, qual };
}

/**
 * Match a statement-reported card category label to a published reference
 * entry. Exact canonical/alias matches win; otherwise fall back to
 * network + debit/credit + qualification signals.
 */
export function matchPublishedCategory(label: string): { key: string; ref: PublishedRate } | null {
  const n = normalize(label);
  for (const [key, ref] of Object.entries(PUBLISHED_RATES)) {
    if (normalize(key) === n) return { key, ref };
    if (ref.aliases.some(a => normalize(a) === n)) return { key, ref };
  }

  const sig = readSignals(label);
  if (!sig.network) return null;
  const pick = (key: string) => ({ key, ref: PUBLISHED_RATES[key] });

  if (sig.network === 'Amex') return pick('Amex OptBlue');
  if (sig.network === 'Discover') return pick('Discover — Qual');

  const prefix = sig.network === 'Visa' ? 'Visa' : 'MC';
  if (sig.debit) {
    return pick(sig.regulated ? `${prefix} Debit — Regulated` : `${prefix} Debit — Exempt`);
  }
  if (sig.qual === 'non') return pick(`${prefix} Credit — Non-Qual`);
  if (sig.qual === 'mid') return pick(`${prefix} Credit — Mid-Qual`);
  if (sig.qual === 'qual') return pick(`${prefix} Credit — Qual`);
  return null;
}

// ── Verification engine ──

export type VerificationStatus = 'verified' | 'acceptable' | 'review' | 'flag' | 'alert' | 'unknown';

export interface InterchangeLineInput {
  /** Category label as printed on the statement. */
  category: string;
  /** Volume in dollars processed under this category. */
  volume: number;
  /** Transaction/item count for this category; 0 if not printed. */
  transactions?: number;
  /** Reported interchange rate, percent (e.g. 1.65). */
  ratePct: number;
  /** Reported per-item fee in dollars (e.g. 0.10). */
  perItemFee?: number;
}

export interface Verification {
  status: VerificationStatus;
  severity: number;
  message: string;
  matchedCategory: string | null;
  publishedRate: number;
  publishedTxnFee: number;
  diffBps: number;
  diffTxnFeeCents: number;
  ratePadding: number;
  txnPadding: number;
  totalPadding: number;
  annualImpact: number;
  estTxns: number;
  commonPadding: string;
  program: string;
  notes: string;
  range?: { low: number; high: number };
}

const EMPTY_VERIFICATION: Verification = {
  status: 'unknown', severity: 0,
  message: 'No published reference for this category — verify manually',
  matchedCategory: null, publishedRate: 0, publishedTxnFee: 0,
  diffBps: 0, diffTxnFeeCents: 0, ratePadding: 0, txnPadding: 0,
  totalPadding: 0, annualImpact: 0, estTxns: 0,
  commonPadding: '', program: '', notes: '',
};

/**
 * Verify one reported interchange line against the published schedule.
 * avgTicket estimates the transaction count when the statement doesn't
 * print per-category item counts.
 */
export function verifyInterchangeLine(line: InterchangeLineInput, avgTicket: number): Verification {
  const match = matchPublishedCategory(line.category);
  if (!match) return EMPTY_VERIFICATION;
  const { key, ref } = match;
  const pub = ref.published;
  const perItem = line.perItemFee ?? 0;

  const diffBps = Math.round(line.ratePct * 100) - Math.round(pub.rate * 100);
  const diffTxnFeeCents = Math.round((perItem - pub.txnFee) * 100);
  const estTxns = line.transactions && line.transactions > 0
    ? line.transactions
    : avgTicket > 0 ? Math.round(line.volume / avgTicket) : 0;
  const ratePadding = Math.max(line.volume * (diffBps / 10000), 0);
  const txnPadding = line.perItemFee != null ? Math.max(estTxns * (perItem - pub.txnFee), 0) : 0;
  const totalPadding = ratePadding + txnPadding;

  const withinRange = !!ref.range && line.ratePct >= ref.range.low && line.ratePct <= ref.range.high;

  let status: VerificationStatus, severity: number, message: string;
  if (diffBps === 0 && diffTxnFeeCents <= 0) {
    status = 'verified'; severity = 0; message = 'Exact match to published rate';
  } else if (diffBps > 0 && diffBps <= 2 && diffTxnFeeCents <= 0) {
    status = 'verified'; severity = 0; message = 'Within rounding tolerance';
  } else if (withinRange && diffBps <= 10) {
    status = 'acceptable'; severity = 1;
    message = `Within published range (${ref.range!.low}%–${ref.range!.high}%). ${diffBps} bps above base.`;
  } else if (withinRange) {
    status = 'review'; severity = 2;
    message = `Within range but ${diffBps} bps above base rate. Request card-level detail to verify.`;
  } else if (diffBps > 0 && diffBps <= 5) {
    status = 'review'; severity = 1;
    message = `${diffBps} bps above published. Minor — could be assessment pass-through or rounding.`;
  } else if (diffBps > 5 && diffBps <= 15) {
    status = 'flag'; severity = 2;
    message = `${diffBps} bps above published rate. Likely padding — request line-item interchange detail.`;
  } else if (diffBps > 15) {
    status = 'alert'; severity = 3;
    message = `${diffBps} bps above published — significant overcharge. Escalate to the processor.`;
  } else if (diffBps < 0) {
    status = 'verified'; severity = 0;
    message = `${Math.abs(diffBps)} bps below published. Favorable.`;
  } else {
    status = 'review'; severity = 1; message = 'Unable to determine — review manually';
  }

  // Regulated debit is federally set — any variance is markup, full stop.
  if (key.includes('Regulated') && (diffBps > 0 || diffTxnFeeCents > 0)) {
    status = 'alert'; severity = 3;
    message = `Regulated debit is federally set. ANY variance is pure markup. Reported ${line.ratePct}% + $${perItem.toFixed(2)} vs published ${pub.rate}% + $${pub.txnFee.toFixed(2)}.`;
  }

  return {
    status, severity, message,
    matchedCategory: key,
    publishedRate: pub.rate,
    publishedTxnFee: pub.txnFee,
    diffBps, diffTxnFeeCents,
    ratePadding, txnPadding, totalPadding,
    annualImpact: totalPadding * 12,
    estTxns,
    commonPadding: ref.commonPadding,
    program: ref.program,
    notes: ref.notes,
    range: ref.range,
  };
}

/**
 * True monthly interchange + assessment cost if every line were billed at
 * the published rate — the floor a pass-through (interchange-plus) price
 * builds on. Returns null when there's nothing to compute.
 */
export function computeInterchangeFloor(
  lines: InterchangeLineInput[],
  avgTicket: number,
): { interchange: number; assessments: number; total: number } | null {
  if (!lines.length) return null;
  let interchange = 0;
  let assessments = 0;
  for (const line of lines) {
    const match = matchPublishedCategory(line.category);
    if (!match) {
      // Unmatched lines: take the reported cost basis so the floor stays honest.
      const txns = line.transactions ?? (avgTicket > 0 ? Math.round(line.volume / avgTicket) : 0);
      interchange += line.volume * (line.ratePct / 100) + txns * (line.perItemFee ?? 0);
      continue;
    }
    const pub = match.ref.published;
    const txns = line.transactions && line.transactions > 0
      ? line.transactions
      : avgTicket > 0 ? Math.round(line.volume / avgTicket) : 0;
    interchange += line.volume * (pub.rate / 100) + txns * pub.txnFee;
    const net = match.ref.network;
    const fees = net === 'Visa' ? NETWORK_FEES.visa
      : net === 'Mastercard' ? NETWORK_FEES.mastercard
      : net === 'Amex' ? NETWORK_FEES.amex
      : NETWORK_FEES.discover;
    assessments += line.volume * ((fees.assessment + fees.accessFee) / 100);
  }
  return { interchange, assessments, total: interchange + assessments };
}

export const verificationStatusIcon = (s: VerificationStatus) =>
  s === 'verified' || s === 'acceptable' ? '✓' : s === 'review' ? '?' : s === 'flag' ? '⚑' : s === 'alert' ? '✕' : '—';

export const verificationStatusColor = (s: VerificationStatus) =>
  s === 'verified' || s === 'acceptable' ? '#34C77B'
  : s === 'review' ? '#F0B429'
  : s === 'flag' ? '#F59849'
  : s === 'alert' ? '#F2565B'
  : '#6b7280';
