/**
 * Qualification audit — spots interchange downgrades and routing misses on an
 * analyzed statement and prices the recoverable margin against the published
 * schedules (interchangeRates.ts).
 *
 * Signals, in order of confidence:
 *  1. Explicit downgrade fee lines — EIRF, Non-Qualified, Mid-Qualified,
 *     Standard, Base Submission, key-entry surcharges, Data Rate I. Newer
 *     extractions list these verbatim in `downgradeLines`; older saved
 *     analyses are pattern-scanned across their fee labels and notes.
 *  2. PIN debit routing — the extraction reports whether the statement shows
 *     EFT-network activity (Interlink, Maestro, Pulse, Star, NYCE, Accel…).
 *     A card-present merchant with none is leaving debit routing savings on
 *     the table.
 *  3. Pricing at non-qualified levels — an effective rate at or above the
 *     networks' punitive tiers means most volume is clearing downgraded.
 *  4. B2B enhanced data — commercial cards without Level II/III data clear at
 *     Data Rate I instead of Data Rate II/III.
 *
 * Recovery figures are estimates and labeled as such; a downgraded charge is
 * typically ~40–50% recoverable once transactions re-qualify (CPS/Merit
 * qualification, batch timing, AVS + full data on key-entry).
 */

import {
  effectivePct, estimateInterchange, getCategoryRates,
  type IcFee, type MerchantCategory,
} from './interchangeRates';

export type FindingSeverity = 'high' | 'medium' | 'info';

export interface DowngradeFinding {
  id: string;
  severity: FindingSeverity;
  title: string;
  /** What the engine saw on the statement — the evidence. */
  detail: string;
  /** What to do about it — how the margin is earned. */
  action: string;
  /** Estimated annual recoverable margin in dollars; null when not computable. */
  estAnnualRecovery: number | null;
}

export interface AuditInput {
  fees: { label: string; amount: number }[];
  /** Verbatim downgrade lines from newer extractions; older rows lack them. */
  downgradeLines?: { label: string; amount: number }[] | null;
  /** Whether the statement shows PIN debit / EFT network activity; null = unknown. */
  pinDebitPresent?: boolean | null;
  notes?: string;
  totalVolume: number;
  totalTransactions: number;
  avgTicket: number;
  effectiveRatePct: number;
  currentMonthlyCost: number;
}

/** Share of a downgraded charge typically recoverable once re-qualified. */
const RECOVERABLE_SHARE = 0.45;

/** Card-mix assumptions shared with the blend (see interchangeRates.ts). */
const DEBIT_SHARE = 0.40;
const EXEMPT_DEBIT_SHARE = 0.40; // of debit volume (rest is regulated)

const DOWNGRADE_PATTERNS: { re: RegExp; kind: string }[] = [
  { re: /non.?qual/i, kind: 'Non-Qualified' },
  { re: /mid.?qual/i, kind: 'Mid-Qualified' },
  { re: /\beirf\b/i, kind: 'EIRF' },
  { re: /downgrade/i, kind: 'Downgrade' },
  { re: /base submission/i, kind: 'Base Submission' },
  { re: /\bstandard\b/i, kind: 'Standard tier' },
  { re: /key.?ent/i, kind: 'Key-Entry' },
  { re: /data rate i\b/i, kind: 'Data Rate I' },
];

/** Categories where cards are physically present and routing/qualification applies. */
const CARD_PRESENT: MerchantCategory[] = [
  'retail', 'restaurant', 'supermarket', 'services', 'healthcare', 'lodging', 'petroleum',
];

/** PIN debit base rate for a category (Mastercard PIN debit schedule). */
function pinDebitFee(category: MerchantCategory): IcFee {
  if (category === 'supermarket') return { pct: 1.05, perTxn: 0.15, cap: 0.35 };
  if (category === 'petroleum') return { pct: 0.75, perTxn: 0.17, cap: 0.95 };
  return { pct: 0.90, perTxn: 0.15 };
}

const round = (n: number) => Math.round(n);

export function auditQualification(input: AuditInput, category: MerchantCategory): DowngradeFinding[] {
  const findings: DowngradeFinding[] = [];
  const ticket = input.avgTicket > 0
    ? input.avgTicket
    : input.totalTransactions > 0 ? input.totalVolume / input.totalTransactions : 40;
  const annualVolume = input.totalVolume * 12;

  // ── 1. Explicit downgrade lines ──
  const seen = new Map<string, number>();
  for (const line of input.downgradeLines ?? []) {
    seen.set(line.label, line.amount);
  }
  for (const fee of input.fees) {
    if (seen.has(fee.label)) continue;
    if (DOWNGRADE_PATTERNS.some(p => p.re.test(fee.label))) seen.set(fee.label, fee.amount);
  }
  if (seen.size > 0) {
    const lines = [...seen.entries()];
    const total = lines.reduce((s, [, amt]) => s + amt, 0);
    const recovery = total > 0 ? total * 12 * RECOVERABLE_SHARE : null;
    findings.push({
      id: 'downgrade-lines',
      severity: total > 0 && input.currentMonthlyCost > 0 && total / input.currentMonthlyCost > 0.05 ? 'high' : 'medium',
      title: 'Interchange downgrades on the statement',
      detail: lines
        .map(([label, amt]) => (amt > 0 ? `${label} (${fmtUsd(amt)}/mo)` : label))
        .join(' · '),
      action:
        'These lines are transactions clearing at punitive tiers (EIRF, Standard, Non-Qualified) instead of their CPS/Merit rate. ' +
        'Re-qualify them under Delt — settle batches daily, pass AVS + order data on key-entry, and fix MCC/processing setup. ' +
        'Roughly 40–50% of a downgraded charge is recoverable.',
      estAnnualRecovery: recovery !== null ? round(recovery) : null,
    });
  }

  // Notes sometimes carry downgrade evidence the fee lines buried.
  if (seen.size === 0 && input.notes && DOWNGRADE_PATTERNS.some(p => p.re.test(input.notes!))) {
    findings.push({
      id: 'downgrade-notes',
      severity: 'medium',
      title: 'Downgrade language in the statement notes',
      detail: `Extraction notes: “${input.notes.trim()}”`,
      action: 'The statement references downgraded tiers but buries the amounts. Pull the interchange detail pages and quantify before quoting.',
      estAnnualRecovery: null,
    });
  }

  // ── 2. PIN debit routing ──
  if (CARD_PRESENT.includes(category)) {
    if (input.pinDebitPresent === false) {
      const rates = getCategoryRates(category);
      const sigPct = effectivePct(rates.visa.debit, ticket);
      const pinPct = effectivePct(pinDebitFee(category), ticket);
      const deltaPct = sigPct - pinPct;
      const exemptDebitVolume = annualVolume * DEBIT_SHARE * EXEMPT_DEBIT_SHARE;
      findings.push({
        id: 'pin-debit-missing',
        severity: 'medium',
        title: 'PIN debit not enabled',
        detail:
          'No EFT-network activity (Interlink, Maestro, Pulse, Star, NYCE, Accel) on this statement — ' +
          'every debit card is routing as signature debit.',
        action:
          'Enable PIN debit routing at the terminal. Exempt signature debit clears at ' +
          `${sigPct.toFixed(2)}% effective on this ticket vs ~${pinPct.toFixed(2)}% on PIN networks` +
          (deltaPct > 0.05 ? ' — the spread on exempt debit volume is margin.' : '; on this ticket size the spread is thin, but routing choice also cuts downgrade risk.'),
        estAnnualRecovery: deltaPct > 0.05 ? round(exemptDebitVolume * (deltaPct / 100)) : null,
      });
    } else if (input.pinDebitPresent == null) {
      findings.push({
        id: 'pin-debit-unknown',
        severity: 'info',
        title: 'PIN debit routing unconfirmed',
        detail: 'This analysis predates PIN-debit detection (or the statement didn\'t show network detail).',
        action: 'Check the statement for EFT network lines (Interlink, Pulse, Star, NYCE). If absent, PIN routing is an easy win at a card-present merchant.',
        estAnnualRecovery: null,
      });
    }
  }

  // ── 3. Pricing at non-qualified levels ──
  const ic = estimateInterchange(category, ticket);
  const spreadPct = input.effectiveRatePct - ic.networkCostPct;
  if (input.effectiveRatePct >= 3.0 && spreadPct > 0.75) {
    findings.push({
      id: 'nonqual-pricing',
      severity: 'high',
      title: 'Effective rate at non-qualified levels',
      detail:
        `${input.effectiveRatePct}% effective vs ~${ic.networkCostPct.toFixed(2)}% published network cost for this profile — ` +
        `the networks' punitive tiers (Visa Non-Qualified 3.15%, MC Standard 3.15%, Discover Base 3.15%) start at 3.15%.`,
      action:
        'Most of this volume is either clearing downgraded or the processor is repricing it as tiered. ' +
        'Either way the spread is addressable — this is the strongest possible switch pitch.',
      estAnnualRecovery: round(annualVolume * (Math.max(0, spreadPct - 0.5) / 100)),
    });
  }

  // ── 4. B2B enhanced data (Level II/III) ──
  if (category === 'b2b') {
    const hasDataRateI = [...seen.keys()].some(l => /data rate i\b/i.test(l));
    // Data Rate I 2.65% + $0.10 vs Data Rate II 1.90% + $0.10 → 75 bps.
    const commercialVolume = annualVolume * 0.60;
    findings.push({
      id: 'b2b-enhanced-data',
      severity: hasDataRateI ? 'medium' : 'info',
      title: 'Commercial cards without Level II/III data',
      detail: hasDataRateI
        ? 'Data Rate I charges on the statement — commercial transactions are clearing without enhanced data.'
        : 'B2B volume clears at Data Rate I (2.65% + $0.10) unless Level II/III data (tax, PO number, line items) rides with each transaction.',
      action:
        'Enable Level II/III data pass-through — Delt terminals and gateways fill most fields automatically. ' +
        'Data Rate II (1.90% + $0.10) recovers ~75 bps on commercial volume; large-ticket programs go lower still.',
      estAnnualRecovery: round(commercialVolume * 0.0075),
    });
  }

  const order: Record<FindingSeverity, number> = { high: 0, medium: 1, info: 2 };
  return findings.sort((a, b) => order[a.severity] - order[b.severity]);
}

function fmtUsd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}
