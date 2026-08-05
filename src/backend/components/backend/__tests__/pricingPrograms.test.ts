import { describe, it, expect } from 'vitest';
import {
  quotePrograms,
  estimateProgramEconomics,
  IC_PLUS_MARGIN,
  CASH_DISCOUNT_MATRIX,
  FLAT_RATE_MATRIX,
} from '../pricingPrograms';
import { estimateInterchange } from '../interchangeRates';

const input = {
  monthlyVolume: 50_000,
  monthlyTransactions: 1_100,
  currentMonthlyCost: 1_750, // 3.5% effective
  riskTier: 'medium' as const,
};

const ticket = input.monthlyVolume / input.monthlyTransactions;
const networkCost = estimateInterchange('retail', ticket).networkCostPct;

describe('estimateProgramEconomics', () => {
  it('computes cash-discount economics from the 50k-100k medium matrix', () => {
    const cd = CASH_DISCOUNT_MATRIX['50k-100k'].medium;
    const [econ] = estimateProgramEconomics(input);
    const annualVolume = input.monthlyVolume * 12;
    const gross = annualVolume * (cd.serviceFee / 100) + cd.monthlyFee * 12;
    const interchange = annualVolume * (networkCost / 100);
    expect(econ.key).toBe('cash_discount');
    expect(econ.grossRevenue).toBe(Math.round(gross));
    expect(econ.interchangeCost).toBe(Math.round(interchange));
    expect(econ.margin).toBe(Math.round(gross - interchange));
  });

  it('computes flat-rate margin as revenue minus real network cost', () => {
    const fr = FLAT_RATE_MATRIX['50k-100k'].medium;
    const econ = estimateProgramEconomics(input).find(e => e.key === 'flat_rate')!;
    const gross = input.monthlyVolume * 12 * (fr.rate / 100) + input.monthlyTransactions * fr.perTxn * 12;
    expect(econ.grossRevenue).toBe(Math.round(gross));
    expect(econ.margin).toBe(Math.round(gross - input.monthlyVolume * 12 * (networkCost / 100)));
  });

  it('prices interchange-plus as network cost plus the banded margin', () => {
    const quote = quotePrograms(input).find(q => q.key === 'interchange_plus')!;
    const margin = IC_PLUS_MARGIN['50k-100k'];
    const expectedMonthly =
      input.monthlyVolume * ((networkCost + margin.pct) / 100) +
      input.monthlyTransactions * margin.perTxn;
    expect(quote.monthlyCost).toBeCloseTo(expectedMonthly, 1);
    expect(quote.terms).toContain(`IC + ${margin.pct.toFixed(2)}%`);
  });

  it('interchange-plus economics margin equals the banded markup', () => {
    const econ = estimateProgramEconomics(input).find(e => e.key === 'interchange_plus')!;
    const margin = IC_PLUS_MARGIN['50k-100k'];
    const expected =
      input.monthlyVolume * 12 * (margin.pct / 100) +
      input.monthlyTransactions * margin.perTxn * 12;
    expect(econ.margin).toBeCloseTo(expected, 0);
  });

  it('keeps economics out of merchant-facing quotes', () => {
    for (const quote of quotePrograms(input)) {
      expect(quote).not.toHaveProperty('margin');
      expect(quote).not.toHaveProperty('grossRevenue');
      expect(quote).not.toHaveProperty('interchangeCost');
    }
  });
});
