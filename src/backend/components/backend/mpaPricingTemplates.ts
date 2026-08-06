/**
 * MPA pricing templates — pure helpers behind the boarding panel's
 * one-click pricing fill.
 *
 * Two template sources feed the same dropdown:
 *   1. Built-ins, generated from the Delt program matrices in
 *      pricingPrograms.ts (single source shared with the Cost Calculator and
 *      Statement Analyzer) and parameterized by the deal's monthly volume —
 *      the quoted program and the boarded MPA can never drift apart.
 *   2. Saved templates from mpa_pricing_templates (org-wide, via the store).
 *
 * Applying is an overlay: only non-empty template values land on the grid,
 * so merchant-specific entries (MCC, agent code…) survive a template apply.
 */

import {
  CASH_DISCOUNT_MATRIX,
  FLAT_RATE_MATRIX,
  RISK_TIERS,
  volumeBandKey,
} from './pricingPrograms';

export type PricingValues = Record<string, string>;

export interface BuiltInTemplate {
  key: string;
  name: string;
  pricing: PricingValues;
}

const money = (n: number) => n.toFixed(2);

/**
 * Overlay a template onto the current grid values. Empty template entries
 * leave the current value alone; everything else wins.
 */
export function applyPricingTemplate(current: PricingValues, template: PricingValues): PricingValues {
  const next = { ...current };
  for (const [key, value] of Object.entries(template)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      next[key] = String(value);
    }
  }
  return next;
}

/**
 * Delt program templates for a processor, priced off the deal's monthly
 * card volume (band lookup mirrors the Cost Calculator). Paysafe's MPA has
 * no cash-discount structure, so it only gets the flat-rate programs.
 */
export function builtInPricingTemplates(
  channel: 'Luqra' | 'Paysafe',
  monthlyVolume: number,
): BuiltInTemplate[] {
  const band = volumeBandKey(monthlyVolume || 0);
  const out: BuiltInTemplate[] = [];

  for (const tier of RISK_TIERS) {
    const fr = FLAT_RATE_MATRIX[band][tier.key];
    const label = `Delt Flat Rate · ${tier.label} (${fr.rate.toFixed(2)}% + $${fr.perTxn.toFixed(2)})`;
    if (channel === 'Luqra') {
      out.push({
        key: `flat-${tier.key}`,
        name: label,
        pricing: {
          applicationType: 'flat_rate',
          discount: 'daily',
          qualifiedRatePct: money(fr.rate),
          qualifiedItemFee: money(fr.perTxn),
          amexQualifiedRatePct: money(fr.rate),
          amexQualifiedItemFee: money(fr.perTxn),
        },
      });
    } else {
      out.push({
        key: `flat-${tier.key}`,
        name: label,
        pricing: {
          structure: 'flat_rate',
          discountMethod: 'daily',
          creditQualifiedRatePct: money(fr.rate),
          debitQualifiedRatePct: money(fr.rate),
          transactionFee: money(fr.perTxn),
          amexQualifiedRatePct: money(fr.rate),
          amexTransactionFee: money(fr.perTxn),
        },
      });
    }
  }

  if (channel === 'Luqra') {
    for (const tier of RISK_TIERS) {
      const cd = CASH_DISCOUNT_MATRIX[band][tier.key];
      out.push({
        key: `cash-${tier.key}`,
        name: `Delt Cash Discount · ${tier.label} (${cd.serviceFee.toFixed(2)}% svc + $${cd.monthlyFee}/mo)`,
        pricing: {
          applicationType: 'cash_discount',
          discount: 'daily',
          qualifiedRatePct: money(cd.serviceFee),
          monthlyServiceFee: money(cd.monthlyFee),
        },
      });
    }
  }

  return out;
}
