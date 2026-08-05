import { describe, it, expect } from 'vitest';
import {
  matchPublishedCategory, verifyInterchangeLine, computeInterchangeFloor,
  PUBLISHED_RATES,
} from '../interchangeReference';

describe('matchPublishedCategory', () => {
  it('matches canonical names and aliases exactly', () => {
    expect(matchPublishedCategory('Visa Credit — Qual')?.key).toBe('Visa Credit — Qual');
    expect(matchPublishedCategory('VS CRD QUAL')?.key).toBe('Visa Credit — Qual');
    expect(matchPublishedCategory('mc merit iii')?.key).toBe('MC Credit — Qual');
  });

  it('matches free-form statement labels by network + qualification signals', () => {
    expect(matchPublishedCategory('Visa Qualified Credit')?.key).toBe('Visa Credit — Qual');
    expect(matchPublishedCategory('MC World Rewards')?.key).toBe('MC Credit — Mid-Qual');
    expect(matchPublishedCategory('Visa Non-Qualified')?.key).toBe('Visa Credit — Non-Qual');
    expect(matchPublishedCategory('VISA DEBIT REGULATED')?.key).toBe('Visa Debit — Regulated');
    expect(matchPublishedCategory('American Express')?.key).toBe('Amex OptBlue');
    expect(matchPublishedCategory('Discover Card Present')?.key).toBe('Discover — Qual');
  });

  it('returns null for labels with no network signal', () => {
    expect(matchPublishedCategory('Monthly Service Fee')).toBeNull();
  });
});

describe('verifyInterchangeLine', () => {
  it('verifies an exact match to the published rate', () => {
    const pub = PUBLISHED_RATES['Visa Credit — Qual'].published;
    const v = verifyInterchangeLine(
      { category: 'VS CRD QUAL', volume: 10_000, ratePct: pub.rate, perItemFee: pub.txnFee },
      50,
    );
    expect(v.status).toBe('verified');
    expect(v.diffBps).toBe(0);
    expect(v.totalPadding).toBe(0);
  });

  it('flags padding above published and prices the impact', () => {
    // 1.65% reported vs 1.51% published = +14 bps on $10,000 → $14/mo rate padding.
    const v = verifyInterchangeLine(
      { category: 'VS CRD QUAL', volume: 10_000, ratePct: 1.65, perItemFee: 0.10 },
      50,
    );
    expect(v.status).toBe('flag');
    expect(v.diffBps).toBe(14);
    expect(v.ratePadding).toBeCloseTo(14, 5);
    expect(v.annualImpact).toBeCloseTo(168, 5);
  });

  it('treats any variance on regulated debit as an alert', () => {
    const v = verifyInterchangeLine(
      { category: 'VISA DEBIT REG', volume: 5_000, ratePct: 0.07, perItemFee: 0.22 },
      50,
    );
    expect(v.status).toBe('alert');
    expect(v.severity).toBe(3);
  });

  it('accepts wide-range buckets within the published band', () => {
    const v = verifyInterchangeLine(
      { category: 'Amex OptBlue', volume: 2_000, ratePct: 2.35, perItemFee: 0.10 },
      50,
    );
    expect(['acceptable', 'verified']).toContain(v.status);
  });

  it('uses printed transaction counts over the avg-ticket estimate', () => {
    const v = verifyInterchangeLine(
      { category: 'VS CRD QUAL', volume: 10_000, transactions: 300, ratePct: 1.51, perItemFee: 0.15 },
      50,
    );
    // $0.05 over on 300 printed txns = $15/mo, not 200 estimated txns.
    expect(v.estTxns).toBe(300);
    expect(v.txnPadding).toBeCloseTo(15, 5);
  });

  it('returns unknown with no padding for unmatched categories', () => {
    const v = verifyInterchangeLine(
      { category: 'Gateway Fee', volume: 1_000, ratePct: 3.5 },
      50,
    );
    expect(v.status).toBe('unknown');
    expect(v.totalPadding).toBe(0);
  });
});

describe('computeInterchangeFloor', () => {
  it('prices lines at published interchange plus network assessments', () => {
    const floor = computeInterchangeFloor(
      [{ category: 'VS CRD QUAL', volume: 10_000, transactions: 200, ratePct: 1.65, perItemFee: 0.10 }],
      50,
    );
    // Published 1.51% + $0.10×200 = $171 interchange; Visa assessments 0.1595% = $15.95.
    expect(floor).not.toBeNull();
    expect(floor!.interchange).toBeCloseTo(171, 2);
    expect(floor!.assessments).toBeCloseTo(15.95, 2);
    expect(floor!.total).toBeCloseTo(186.95, 2);
  });

  it('falls back to reported cost for unmatched lines and null for empty input', () => {
    const floor = computeInterchangeFloor(
      [{ category: 'Misc Bucket', volume: 1_000, transactions: 10, ratePct: 2.0, perItemFee: 0.10 }],
      50,
    );
    expect(floor!.total).toBeCloseTo(1_000 * 0.02 + 10 * 0.10, 2);
    expect(computeInterchangeFloor([], 50)).toBeNull();
  });
});
