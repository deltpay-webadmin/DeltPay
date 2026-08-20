import { describe, it, expect } from 'vitest';
import {
  tierFromModel,
  holdbackFromOffer,
  factorFromOffer,
  modelNotes,
  failedKnockoutLabels,
  checkProposedAmount,
  type ModelOffer,
} from '../modelMapping';

const offer: ModelOffer = {
  amount: 60_000,
  factor: 1.34,
  term_months: 10,
  term_business_days: 210,
  total_payback: 80_400,
  daily_payment: 382.86,
  payment_pct_daily_revenue: 0.134,
};

describe('tierFromModel', () => {
  it('maps numeric tiers to CRM labels', () => {
    expect(tierFromModel(1)).toBe('Tier 1');
    expect(tierFromModel(4)).toBe('Tier 4');
  });
  it('maps null/undefined/garbage to Decline', () => {
    expect(tierFromModel(null)).toBe('Decline');
    expect(tierFromModel(undefined)).toBe('Decline');
    expect(tierFromModel(0)).toBe('Decline');
    expect(tierFromModel(7)).toBe('Decline');
  });
});

describe('holdbackFromOffer / factorFromOffer', () => {
  it('derives holdback % from the offer payment share', () => {
    expect(holdbackFromOffer({ payment_pct_daily_revenue: 0.134 })).toBe(13);
    expect(holdbackFromOffer({ payment_pct_daily_revenue: 0.005 })).toBe(1);
  });
  it('falls back on missing offers', () => {
    expect(holdbackFromOffer(null)).toBe(12);
    expect(factorFromOffer(null)).toBe(1.4);
    expect(factorFromOffer(offer)).toBe(1.34);
  });
});

describe('modelNotes / failedKnockoutLabels', () => {
  const rec = {
    model_version: '1.1.0',
    decision_label: 'Decline — hard rule failure',
    score: { total: 41 },
    gates: {
      sufficiency: [{ label: 'Months of transaction history', passed: true }],
      knockouts: [
        { label: 'NSF events in 90 days', passed: false },
        { label: 'No NSF in the last week', passed: false },
        { label: 'Minimum monthly revenue', passed: true },
      ],
    },
  };
  it('builds a provenance note', () => {
    expect(modelNotes(rec)).toBe('Model v1.1.0 · score 41/100 · Decline — hard rule failure');
  });
  it('collects only failed gates, in order', () => {
    expect(failedKnockoutLabels(rec)).toEqual(['NSF events in 90 days', 'No NSF in the last week']);
    expect(failedKnockoutLabels({})).toEqual([]);
  });
});

describe('checkProposedAmount', () => {
  it('passes at or below the model-sized amount', () => {
    expect(checkProposedAmount(offer, 60_000).passes).toBe(true);
    expect(checkProposedAmount(offer, 50_000).passes).toBe(true);
  });
  it('fails above the model-sized amount and reports the max', () => {
    const out = checkProposedAmount(offer, 75_000);
    expect(out.passes).toBe(false);
    expect(out.maxAmount).toBe(60_000);
    expect(out.dailyPayment).toBeCloseTo((75_000 * 1.34) / 210, 1);
  });
  it('handles missing offers and junk amounts', () => {
    expect(checkProposedAmount(null, 10_000).passes).toBe(false);
    expect(checkProposedAmount(offer, 0).passes).toBe(false);
    expect(checkProposedAmount(offer, NaN).passes).toBe(false);
  });
});
