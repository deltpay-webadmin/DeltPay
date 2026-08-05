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
