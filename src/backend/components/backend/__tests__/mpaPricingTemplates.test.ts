import { describe, it, expect } from 'vitest';
import { applyPricingTemplate, builtInPricingTemplates } from '../mpaPricingTemplates';

describe('built-in Delt program templates', () => {
  it('Luqra gets flat-rate and cash-discount programs per risk tier', () => {
    const t = builtInPricingTemplates('Luqra', 5_000);
    expect(t.map((x) => x.key)).toEqual([
      'flat-low', 'flat-medium', 'flat-high',
      'cash-low', 'cash-medium', 'cash-high',
    ]);
  });

  it('Paysafe only gets flat-rate programs (its MPA has no cash-discount structure)', () => {
    const t = builtInPricingTemplates('Paysafe', 5_000);
    expect(t.map((x) => x.key)).toEqual(['flat-low', 'flat-medium', 'flat-high']);
    expect(t.every((x) => x.pricing.structure === 'flat_rate')).toBe(true);
  });

  it('prices off the deal volume band, matching the Cost Calculator matrix', () => {
    // $37.5K/mo → 25k-50k band; low-risk flat rate is 2.55% + $0.10.
    const low = builtInPricingTemplates('Luqra', 37_500).find((x) => x.key === 'flat-low')!;
    expect(low.pricing.qualifiedRatePct).toBe('2.55');
    expect(low.pricing.qualifiedItemFee).toBe('0.10');
    expect(low.pricing.applicationType).toBe('flat_rate');

    const paysafeLow = builtInPricingTemplates('Paysafe', 37_500).find((x) => x.key === 'flat-low')!;
    expect(paysafeLow.pricing.creditQualifiedRatePct).toBe('2.55');
    expect(paysafeLow.pricing.debitQualifiedRatePct).toBe('2.55');
    expect(paysafeLow.pricing.transactionFee).toBe('0.10');
  });

  it('cash discount maps service fee to the qualified rate and program fee to monthly service', () => {
    // $5K/mo → 0-10k band; low risk is 3.99% svc + $49/mo.
    const cd = builtInPricingTemplates('Luqra', 5_000).find((x) => x.key === 'cash-low')!;
    expect(cd.pricing.applicationType).toBe('cash_discount');
    expect(cd.pricing.qualifiedRatePct).toBe('3.99');
    expect(cd.pricing.monthlyServiceFee).toBe('49.00');
  });

  it('zero/unknown volume falls back to the smallest band instead of crashing', () => {
    expect(builtInPricingTemplates('Luqra', 0).length).toBe(6);
  });
});

describe('applyPricingTemplate', () => {
  it('overlays non-empty values and preserves merchant-specific entries', () => {
    const current = { qualifiedRatePct: '9.99', mccCode: '5812', agentName: 'Carlos' };
    const next = applyPricingTemplate(current, { qualifiedRatePct: '2.55', qualifiedItemFee: '0.10', mccCode: '' });
    expect(next).toEqual({
      qualifiedRatePct: '2.55',
      qualifiedItemFee: '0.10',
      mccCode: '5812',
      agentName: 'Carlos',
    });
  });

  it('does not mutate the current grid', () => {
    const current = { batchFee: '0.25' };
    applyPricingTemplate(current, { batchFee: '0.10' });
    expect(current.batchFee).toBe('0.25');
  });
});
