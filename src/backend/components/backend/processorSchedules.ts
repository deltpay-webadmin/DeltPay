/**
 * ────────────────────────────────────────────────────────────
 * Processor Schedule A library — Delt's contracted buy rates
 * ────────────────────────────────────────────────────────────
 * Source documents:
 *   • Paysafe "Delt Pay Schedule A" (ISO Flex Rev-Share, PCS Product
 *     Schedule Master 09-29-2022 V2) — 85% Delt / 15% Company, no flat
 *     bonus. Core schedule + Petroleum Card Services (PCS) variant.
 *   • Luqra ISO Agreement (010126, executed 06.03.26) Schedule A —
 *     risk-tiered residual split (90/90/70/70/50) with per-tier buy rates.
 *   • Square — 70/30 net split agreed; Schedule A not yet received.
 *
 * Used by the Schedule A composer to pre-populate merchant-facing
 * pricing templates: buy rates seed the sell columns, margin =
 * (sell − buy) × Delt share.
 */

export type FeeKind = 'pct' | 'usd' | 'pass' | 'text';

export interface FeeRow {
  label: string;
  kind: FeeKind;
  /** One value per tier column (single-element for 1-column schedules). */
  buy: (number | string)[];
  /** Footnote / qualifier shown small under the label. */
  note?: string;
}

export interface FeeSection {
  title: string;
  rows: FeeRow[];
}

export interface TierColumn {
  label: string;
  /** Delt's residual share of margin for merchants priced on this tier. */
  deltSharePct: number;
}

export interface ProcessorSchedule {
  id: string;
  processor: 'Paysafe' | 'Luqra' | 'Square';
  name: string;
  splitLabel: string;
  tiers: TierColumn[];
  sections: FeeSection[];
  notes: string[];
  /** True when the processor hasn't delivered a Schedule A yet. */
  pending?: boolean;
}

const usd = (n: number) => n;

export const PROCESSOR_SCHEDULES: ProcessorSchedule[] = [
  {
    id: 'paysafe-core',
    processor: 'Paysafe',
    name: 'Paysafe — Core Schedule A',
    splitLabel: 'Revenue share: Delt Pay LLC 85% / Company 15% · No flat bonus',
    tiers: [{ label: 'Buy Rate', deltSharePct: 85 }],
    sections: [
      {
        title: 'Interchange',
        rows: [
          { label: 'Interchange, Dues, Fees, Assessments & Other Charges (All Cards)', kind: 'pass', buy: ['Passthrough'] },
          { label: 'PIN Debit Network and Switch Fees', kind: 'pass', buy: ['Passthrough'] },
        ],
      },
      {
        title: 'Transaction Processing Fees',
        rows: [
          { label: 'BIN Sponsorship', kind: 'pct', buy: [0.02] },
          { label: 'Interchange Clearing Fee', kind: 'pct', buy: [0.025], note: 'assessed only when merchant is billed' },
          { label: 'Authorization — Dial/IP/Internet/SSL', kind: 'usd', buy: [usd(0.03)] },
          { label: 'Capture', kind: 'usd', buy: [usd(0.015)] },
          { label: 'PIN Debit', kind: 'usd', buy: [usd(0.04)] },
          { label: 'EBT', kind: 'usd', buy: [usd(0.04)] },
          { label: 'Third Party Authorization', kind: 'usd', buy: [usd(0.10)] },
          { label: 'Batch Header', kind: 'usd', buy: [usd(0.05)] },
          { label: 'Electronic Address Verification', kind: 'usd', buy: [usd(0.02)] },
          { label: 'ARU Authorization', kind: 'usd', buy: [usd(0.50)] },
          { label: 'Voice Authorization', kind: 'usd', buy: [usd(1.00)] },
          { label: 'AVS Voice Authorization', kind: 'usd', buy: [usd(1.00)] },
          { label: 'American Express Opt Blue', kind: 'pct', buy: [0.25] },
        ],
      },
      {
        title: 'Monthly / Per Occurrence Fees',
        rows: [
          { label: 'Monthly Merchant on File Fee / iAccess Fee', kind: 'usd', buy: [usd(15.00)] },
          { label: 'Monthly Service Fee', kind: 'usd', buy: [usd(5.00)] },
          { label: 'Chargebacks', kind: 'usd', buy: [usd(10.00)] },
          { label: 'Retrievals', kind: 'usd', buy: [usd(10.00)] },
          { label: 'Monthly Minimum Fee', kind: 'usd', buy: [usd(7.50)] },
          { label: 'Paper Statement Fee', kind: 'usd', buy: [usd(5.00)] },
          { label: 'Early Termination Fee (optional)', kind: 'usd', buy: [usd(250.00)], note: 'assessed only when a closed merchant is billed an ETF' },
          { label: 'Annual Fee (optional)', kind: 'usd', buy: [usd(50.00)], note: 'assessed only when merchant is billed an Annual Fee' },
        ],
      },
      {
        title: 'Regulatory and Compliance Validation',
        rows: [
          { label: 'Monthly Enhanced Security Package', kind: 'usd', buy: [usd(6.00)] },
          { label: 'PCI Non-Compliance or Non-Validation Fee', kind: 'usd', buy: [usd(14.95)] },
          { label: 'Regulatory Product Fee', kind: 'usd', buy: [usd(2.00)] },
          { label: 'Regulatory Non-Compliance Fee', kind: 'usd', buy: [usd(10.00)] },
        ],
      },
    ],
    notes: ['No flat bonus on this schedule — economics are pure revenue share over buy rates.'],
  },
  {
    id: 'paysafe-pcs',
    processor: 'Paysafe',
    name: 'Paysafe — Petroleum Card Services (PCS)',
    splitLabel: 'Revenue share: Delt Pay LLC 85% / Company 15% · No flat bonus',
    tiers: [{ label: 'Buy Rate', deltSharePct: 85 }],
    sections: [
      {
        title: 'Interchange',
        rows: [
          { label: 'Interchange, Dues, Fees, Assessments & Other Charges (All Cards)', kind: 'pass', buy: ['Passthrough'] },
          { label: 'PIN Debit Network and Switch Fees', kind: 'pass', buy: ['Passthrough'] },
        ],
      },
      {
        title: 'Transaction Processing / Monthly / Per Occurrence Fees',
        rows: [
          { label: 'BIN Sponsorship', kind: 'pct', buy: [0.02] },
          { label: 'Authorization Fee', kind: 'usd', buy: [usd(0.00)] },
          { label: 'Bankcard (Visa, MC) Per Item Fee (Dial or IP)', kind: 'usd', buy: [usd(0.03)] },
          { label: 'Non-Bankcard (Amex, Discover, Voyager, WEX, EBT) Per Item Fee', kind: 'usd', buy: [usd(0.03)] },
          { label: 'Debit Per Item Fee (Dial or IP)', kind: 'usd', buy: [usd(0.04)] },
          { label: 'American Express Opt Blue', kind: 'pct', buy: [0.25] },
          { label: 'Voyager Discount (North Only)', kind: 'pct', buy: [3.50] },
          { label: 'Wex Discount (North Only)', kind: 'pct', buy: [3.50] },
          { label: 'Electronic Address Verification', kind: 'usd', buy: [usd(0.02)] },
          { label: 'Batch Header', kind: 'usd', buy: [usd(0.05)] },
          { label: 'Monthly Merchant on File Fee / Statement Cost', kind: 'usd', buy: [usd(32.50)] },
          { label: 'ACH Reject Fee', kind: 'usd', buy: [usd(25.00)], note: '$25.00 to merchant' },
          { label: 'Datawire Micronode Monthly Fee', kind: 'usd', buy: [usd(4.25)] },
          { label: 'Annual Fee (optional)', kind: 'usd', buy: [usd(50.00)], note: 'assessed only when merchant is billed an Annual Fee' },
          { label: 'Chargebacks', kind: 'usd', buy: [usd(10.00)] },
          { label: 'Retrievals', kind: 'usd', buy: [usd(10.00)] },
        ],
      },
      {
        title: 'Regulatory and Compliance Validation',
        rows: [
          { label: 'Regulatory Product Fee', kind: 'usd', buy: [usd(2.00)] },
          { label: 'Regulatory Non-Compliance Fee', kind: 'usd', buy: [usd(10.00)] },
          { label: 'Monthly Enhanced Security Package', kind: 'usd', buy: [usd(6.00)] },
          { label: 'PCI Non-Compliance Fee', kind: 'usd', buy: [usd(14.95)], note: '$29.95 to merchant — per merchant per month, if applicable' },
        ],
      },
    ],
    notes: ['Petroleum vertical schedule (PCS, a Paysafe company).'],
  },
  {
    id: 'luqra',
    processor: 'Luqra',
    name: 'Luqra — Schedule A (risk-tiered)',
    splitLabel: 'Residual split by risk tier: 90% / 90% / 70% / 70% / 50%',
    tiers: [
      { label: 'Low-Risk · 90%', deltSharePct: 90 },
      { label: 'Medium-Risk · 90%', deltSharePct: 90 },
      { label: 'Medium-Risk · 70%', deltSharePct: 70 },
      { label: 'High-Risk · 70%', deltSharePct: 70 },
      { label: 'High-Risk · 50%', deltSharePct: 50 },
    ],
    sections: [
      {
        title: 'Portfolio Fees',
        rows: [
          { label: 'Visa/MC/Disc/Amex — BIN Sponsor', kind: 'pct', buy: [0.02, 0.02, 0.10, 0.10, 0.25] },
          { label: 'Interchange & Association Fees', kind: 'pass', buy: ['Pass-Through', 'Pass-Through', 'Pass-Through', 'Pass-Through', 'Pass-Through'] },
        ],
      },
      {
        title: 'Transaction Fees',
        rows: [
          { label: 'Visa/MC/Disc/Amex — Transaction', kind: 'usd', buy: [0.02, 0.02, 0.05, 0.05, 0.10] },
          { label: 'PIN Debit/EBT — Transaction', kind: 'usd', buy: [0.02, 0.02, 0.05, 0.05, 0.10] },
          { label: 'Batch', kind: 'usd', buy: [0.02, 0.02, 0.05, 0.05, 0.10] },
          { label: 'AVS (Voice)', kind: 'usd', buy: [3.50, 3.50, 3.50, 3.50, 3.50] },
          { label: 'AVS (Electronic)', kind: 'usd', buy: [0.05, 0.05, 0.10, 0.10, 0.10] },
          { label: 'Wireless Transaction (Vendor Specific)', kind: 'usd', buy: [0.05, 0.05, 0.10, 0.10, 0.10] },
          { label: 'Other Transaction', kind: 'usd', buy: [0, 0, 0, 0, 0] },
          { label: 'Chargeback', kind: 'usd', buy: [10, 10, 15, 15, 15] },
          { label: 'Retrieval (12B Letters)', kind: 'usd', buy: [7, 7, 10, 10, 10] },
        ],
      },
      {
        title: 'Monthly & Annual — Per Occurrence Fees',
        rows: [
          { label: 'Account on File', kind: 'usd', buy: [5, 5, 8, 8, 10] },
          { label: 'Debit Access', kind: 'usd', buy: [0, 0, 0, 0, 0] },
          { label: 'Risk Monitoring', kind: 'pct', buy: [0, 0, 0.10, 0.10, 0.15] },
          { label: 'IRS Regulatory', kind: 'usd', buy: [2, 2, 4, 4, 5] },
          { label: 'Wireless Terminal Monthly (Vendor Specific)', kind: 'usd', buy: [15, 15, 15, 15, 15] },
          { label: 'Gateway Monitoring', kind: 'usd', buy: [0, 0, 10, 10, 25] },
          { label: 'Merchant Online Access', kind: 'usd', buy: [0, 0, 0, 0, 0] },
          { label: 'Monthly Minimum', kind: 'usd', buy: [0, 0, 50, 50, 50] },
          { label: 'Annual PCI / with Breach Insurance', kind: 'text', buy: ['$36.00 / $79.00', '$36.00 / $79.00', '$36.00 / $79.00', '$36.00 / $79.00', '$36.00 / $79.00'] },
          { label: 'Annual Fee', kind: 'usd', buy: [0, 0, 50, 50, 50] },
        ],
      },
      {
        title: 'Optional Services (all tiers)',
        rows: [
          { label: 'Merchant Advantage Program (opt-in, billed annually)', kind: 'text', buy: ['$199.00', '$199.00', '$199.00', '$199.00', '$199.00'], note: 'unlimited monthly paper & supplies' },
          { label: 'Gateway Setup', kind: 'text', buy: ['$0.00', '$0.00', '$0.00', '$0.00', '$0.00'] },
          { label: 'Gateway Monthly', kind: 'text', buy: ['$10.00 / service', '$10.00 / service', '$10.00 / service', '$10.00 / service', '$10.00 / service'], note: 'NMI: iSpy, Customer Vault' },
          { label: 'Gateway Transaction', kind: 'text', buy: ['$0.10', '$0.10', '$0.10', '$0.10', '$0.10'] },
          { label: 'Advanced Research / Reporting', kind: 'pass', buy: ['Pass-Through', 'Pass-Through', 'Pass-Through', 'Pass-Through', 'Pass-Through'] },
          { label: 'Program Transfer', kind: 'text', buy: ['5.00%', '5.00%', '5.00%', '5.00%', '5.00%'], note: 'of monthly revenue · waived with 50 approved deals in first 90 days · billed after first 120 days, +5%/yr' },
        ],
      },
    ],
    notes: [
      'High-Risk minimum pricing: Chargeback $30.00 / Retrievals $15.00.',
      'Merchant excessive VAMP: over 1.50% ratio (Visa or MC) forfeits that merchant\u2019s monthly residual until back under threshold.',
      'Portfolio excessive chargebacks: over 1.00% ratio (Visa or MC) forfeits portfolio monthly residual until back under threshold.',
      'Residual payments stop if total fees due drop below $250.00/month (per ISO agreement §3.01).',
    ],
  },
  {
    id: 'square',
    processor: 'Square',
    name: 'Square — Reseller (Schedule A pending)',
    splitLabel: 'Net split: Delt 70% / Square 30% (no Schedule A received yet)',
    tiers: [{ label: 'Net Split', deltSharePct: 70 }],
    sections: [
      {
        title: 'Economics',
        rows: [
          { label: 'Net revenue split (Delt / Square)', kind: 'text', buy: ['70% / 30%'] },
          { label: 'Published merchant pricing', kind: 'text', buy: ['Square standard rates apply'], note: 'e.g. published card-present / online rates — Delt is paid on net' },
        ],
      },
    ],
    notes: ['Awaiting Schedule A from Square — this entry carries the agreed 70/30 net split so deal economics can still be quoted. Replace with the full grid when received.'],
    pending: true,
  },
];

export function scheduleById(id: string): ProcessorSchedule | undefined {
  return PROCESSOR_SCHEDULES.find(s => s.id === id);
}

export function schedulesForChannel(channel: string | null): ProcessorSchedule[] {
  if (!channel) return PROCESSOR_SCHEDULES;
  return PROCESSOR_SCHEDULES.filter(s => s.processor === channel);
}

export const fmtBuy = (kind: FeeKind, v: number | string): string => {
  if (typeof v === 'string') return v;
  if (kind === 'pct') return `${v.toFixed(v < 0.1 ? 3 : 2)}%`;
  return `$${v.toFixed(2)}`;
};
