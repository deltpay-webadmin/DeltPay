import { describe, it, expect } from 'vitest';
import {
  ASSESSMENTS_PCT,
  estimateInterchange,
  INTERCHANGE_REFERENCE,
  MERCHANT_CATEGORIES,
  NETWORK_MIX,
} from '../interchangeRates';

describe('estimateInterchange', () => {
  it('returns a plausible blended rate for every category', () => {
    for (const { key } of MERCHANT_CATEGORIES) {
      const est = estimateInterchange(key, 45);
      // Published US interchange lives well inside 0.5%–3% blended.
      expect(est.blendedPct).toBeGreaterThan(0.5);
      expect(est.blendedPct).toBeLessThan(3);
      expect(est.networkCostPct).toBeCloseTo(est.blendedPct + ASSESSMENTS_PCT, 5);
      expect(est.byNetwork).toHaveLength(4);
    }
  });

  it('costs more for restaurants than supermarkets (rewards-heavy vs capped debit)', () => {
    const restaurant = estimateInterchange('restaurant', 40);
    const supermarket = estimateInterchange('supermarket', 40);
    expect(restaurant.blendedPct).toBeGreaterThan(supermarket.blendedPct);
  });

  it('costs more card-not-present than card-present retail', () => {
    const cnp = estimateInterchange('ecommerce', 60);
    const cp = estimateInterchange('retail', 60);
    expect(cnp.blendedPct).toBeGreaterThan(cp.blendedPct);
  });

  it('per-transaction fees weigh more on small tickets', () => {
    const small = estimateInterchange('retail', 8);
    const large = estimateInterchange('retail', 200);
    expect(small.blendedPct).toBeGreaterThan(large.blendedPct);
  });

  it('applies the Amex OptBlue large-ticket tier above the threshold', () => {
    const below = estimateInterchange('restaurant', 150); // ≤ $200 → 1.60%
    const above = estimateInterchange('restaurant', 250); // > $200 → 2.40%
    const amexBelow = below.byNetwork.find(n => n.network === 'amex')!.pct;
    const amexAbove = above.byNetwork.find(n => n.network === 'amex')!.pct;
    expect(amexBelow).toBe(1.60);
    expect(amexAbove).toBe(2.40);
  });

  it('survives a missing average ticket', () => {
    const est = estimateInterchange('retail', 0);
    expect(est.blendedPct).toBeGreaterThan(0.5);
    expect(Number.isFinite(est.blendedPct)).toBe(true);
  });
});

describe('reference data integrity', () => {
  it('network mix sums to 1', () => {
    const total = Object.values(NETWORK_MIX).reduce((s, v) => s + v, 0);
    expect(total).toBeCloseTo(1, 5);
  });

  it('covers all four networks with consistent table shapes', () => {
    expect(INTERCHANGE_REFERENCE.map(n => n.network).sort())
      .toEqual(['amex', 'discover', 'mastercard', 'visa']);
    for (const network of INTERCHANGE_REFERENCE) {
      expect(network.sections.length).toBeGreaterThan(0);
      for (const section of network.sections) {
        expect(section.rows.length).toBeGreaterThan(0);
        for (const row of section.rows) {
          expect(row.values).toHaveLength(section.columns.length);
        }
      }
    }
  });
});
