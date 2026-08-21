import { describe, it, expect } from 'vitest';
import {
  activationBonus,
  bonusBandLabel,
  tierForAccounts,
  nextTier,
  estMonthlyNetRevenue,
  estFirstYearResidual,
  quarterOf,
  capitalCommission,
  BONUS_BANDS,
  MULTI_PRODUCT_KICKER,
  TIERS,
  RECRUITING_OVERRIDE,
  REFERRAL_PARTNER_SPLIT,
} from '../agentComp';

describe('activation bonus bands', () => {
  it('matches the comp plan at band boundaries', () => {
    expect(activationBonus(0, false)).toBe(150);
    expect(activationBonus(9_999, false)).toBe(150);
    expect(activationBonus(10_000, false)).toBe(250);
    expect(activationBonus(24_999, false)).toBe(250);
    expect(activationBonus(25_000, false)).toBe(400);
    expect(activationBonus(50_000, false)).toBe(600);
    expect(activationBonus(99_999, false)).toBe(600);
    expect(activationBonus(100_000, false)).toBe(1_000);
    expect(activationBonus(1_000_000, false)).toBe(1_000);
  });

  it('adds the multi-product kicker on any band', () => {
    expect(activationBonus(5_000, true)).toBe(150 + MULTI_PRODUCT_KICKER);
    expect(activationBonus(100_000, true)).toBe(1_000 + MULTI_PRODUCT_KICKER);
  });

  it('labels the band the volume falls in', () => {
    expect(bonusBandLabel(5_000)).toBe('Under $10K');
    expect(bonusBandLabel(60_000)).toBe('$50K–$100K');
    expect(bonusBandLabel(250_000)).toBe('$100K+');
  });

  it('bands ascend monotonically', () => {
    const bonuses = BONUS_BANDS.map(b => b.bonus);
    expect([...bonuses].sort((a, b) => a - b)).toEqual(bonuses);
  });
});

describe('tier ladder', () => {
  it('starts at Tier 1 and promotes at the documented thresholds', () => {
    expect(tierForAccounts(0).tier).toBe(1);
    expect(tierForAccounts(14).tier).toBe(1);
    expect(tierForAccounts(15).tier).toBe(2);
    expect(tierForAccounts(34).tier).toBe(2);
    expect(tierForAccounts(35).tier).toBe(3);
    expect(tierForAccounts(500).tier).toBe(3);
  });

  it('nextTier points at the next rung and null at the top', () => {
    expect(nextTier(0)?.tier).toBe(2);
    expect(nextTier(15)?.tier).toBe(3);
    expect(nextTier(35)).toBeNull();
  });

  it('splits match the 50/60/70 ladder', () => {
    expect(TIERS.map(t => t.split)).toEqual([0.5, 0.6, 0.7]);
  });
});

describe('residual estimates', () => {
  it('clamps net revenue to the documented floor and ceiling', () => {
    expect(estMonthlyNetRevenue(0)).toBe(50);
    expect(estMonthlyNetRevenue(1_000_000)).toBe(900);
    expect(estMonthlyNetRevenue(12_500)).toBe(100); // 12,500 * 0.008
  });

  it('first-year residual is 12 months at the Tier 1 split', () => {
    expect(estFirstYearResidual(12_500)).toBe(Math.round(100 * 0.5 * 12));
  });
});

describe('capital commission and partner programs', () => {
  it('pays 3% of the funded amount, as the posting promises', () => {
    expect(capitalCommission(50_000)).toBe(1_500);
    expect(capitalCommission(10_000)).toBe(300);
    expect(capitalCommission(0)).toBe(0);
  });

  it('override and referral terms match the posting', () => {
    expect(RECRUITING_OVERRIDE.rate).toBe(0.1);
    expect(RECRUITING_OVERRIDE.recruitBonus).toBe(250);
    expect(RECRUITING_OVERRIDE.recruitBonusAtActivations).toBe(5);
    expect(REFERRAL_PARTNER_SPLIT).toBe(0.15);
  });
});

describe('quarterOf', () => {
  it('maps month edges to the right quarter', () => {
    expect(quarterOf('2026-01-15')).toBe('Q1 2026');
    expect(quarterOf('2026-03-31')).toBe('Q1 2026');
    expect(quarterOf('2026-04-01')).toBe('Q2 2026');
    expect(quarterOf('2026-12-31')).toBe('Q4 2026');
  });

  it('rejects malformed input instead of inventing a quarter', () => {
    expect(quarterOf('')).toBe('');
    expect(quarterOf('garbage')).toBe('');
    expect(quarterOf('2026-13-01')).toBe('');
  });
});
