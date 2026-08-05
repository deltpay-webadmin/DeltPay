import { describe, it, expect } from 'vitest';
import {
  quotePrograms,
  estimateProgramEconomics,
  INTERCHANGE_EST,
  CASH_DISCOUNT_MATRIX,
  FLAT_RATE_MATRIX,
} from '../pricingPrograms';

const input = {
  monthlyVolume: 50_000,
  monthlyTransactions: 1_100,
  currentMonthlyCost: 1_750, // 3.5% effective
  riskTier: 'medium' as const,
};

describe('estimateProgramEconomics', () => {
  it('computes cash-discount economics from the 50k-100k medium matrix', () => {
    const cd = CASH_DISCOUNT_MATRIX['50k-100k'].medium;
    const [econ] = estimateProgramEconomics(input);
    const annualVolume = input.monthlyVolume * 12;
    const gross = annualVolume * (cd.serviceFee / 100) + cd.monthlyFee * 12;
    const interchange = annualVolume * (INTERCHANGE_EST / 100);
    expect(econ.key).toBe('cash_discount');
    expect(econ.grossRevenue).toBe(Math.round(gross));
    expect(econ.interchangeCost).toBe(Math.round(interchange));
    expect(econ.margin).toBe(Math.round(gross - interchange));
  });

  it('computes flat-rate margin as revenue minus interchange', () => {
    const fr = FLAT_RATE_MATRIX['50k-100k'].medium;
    const econ = estimateProgramEconomics(input).find(e => e.key === 'flat_rate')!;
    const gross = input.monthlyVolume * 12 * (fr.rate / 100) + input.monthlyTransactions * fr.perTxn * 12;
    expect(econ.grossRevenue).toBe(Math.round(gross));
    expect(econ.margin).toBe(Math.round(gross - input.monthlyVolume * 12 * (INTERCHANGE_EST / 100)));
  });

  it('uses the same interchange-plus rate heuristic as quotePrograms', () => {
    const quote = quotePrograms(input).find(q => q.key === 'interchange_plus')!;
    const econ = estimateProgramEconomics(input).find(e => e.key === 'interchange_plus')!;
    expect(econ.grossRevenue).toBe(quote.annualCost);
  });

  it('keeps economics out of merchant-facing quotes', () => {
    for (const quote of quotePrograms(input)) {
      expect(quote).not.toHaveProperty('margin');
      expect(quote).not.toHaveProperty('grossRevenue');
      expect(quote).not.toHaveProperty('interchangeCost');
    }
  });
});

describe('quotePrograms — flat-rate undercut & IC+ breakdown', () => {
  // Sunrise Cafe shape: low current effective rate (2.86%) where the band's
  // matrix flat rate used to quote ~the same cost → $0 savings shown.
  const lowRateMerchant = {
    monthlyVolume: 37_500,
    monthlyTransactions: 812,
    currentMonthlyCost: 1_072.65,
    riskTier: 'medium' as const,
    interchangeFloorMonthly: 732.81,
  };

  it('flat rate always undercuts the current cost — never $0 savings', () => {
    const flat = quotePrograms(lowRateMerchant).find(p => p.key === 'flat_rate')!;
    expect(flat.monthlyCost).toBeLessThan(lowRateMerchant.currentMonthlyCost);
    expect(flat.annualSavings).toBeGreaterThan(0);
    expect(flat.terms).toContain('rate-matched');
  });

  it('keeps the matrix quote when it already beats the statement', () => {
    const flat = quotePrograms({ ...lowRateMerchant, currentMonthlyCost: 1_687.50 })
      .find(p => p.key === 'flat_rate')!;
    expect(flat.terms).not.toContain('rate-matched');
    expect(flat.monthlyCost).toBeLessThan(1_687.50);
  });

  it('rate-matched flat quote never dips below the interchange floor', () => {
    const flat = quotePrograms({ ...lowRateMerchant, currentMonthlyCost: 700 })
      .find(p => p.key === 'flat_rate')!;
    expect(flat.monthlyCost).toBeGreaterThanOrEqual(732.81);
  });

  it('interchange-plus exposes base + margin when floor data exists', () => {
    const ic = quotePrograms(lowRateMerchant).find(p => p.key === 'interchange_plus')!;
    expect(ic.icBaseMonthly).toBeCloseTo(732.81, 2);
    expect(ic.icMarginMonthly).toBeCloseTo(37_500 * 0.0025 + 812 * 0.10, 2);
    expect(ic.monthlyCost).toBeCloseTo(ic.icBaseMonthly! + ic.icMarginMonthly!, 1);
    expect(ic.terms).toContain('Interchange $732.81/mo');
  });

  it('interchange-plus omits the breakdown without floor data', () => {
    const ic = quotePrograms({ ...lowRateMerchant, interchangeFloorMonthly: null })
      .find(p => p.key === 'interchange_plus')!;
    expect(ic.icBaseMonthly).toBeUndefined();
  });
});
