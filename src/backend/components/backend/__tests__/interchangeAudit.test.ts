import { describe, it, expect } from 'vitest';
import { auditQualification, type AuditInput } from '../interchangeAudit';

const base: AuditInput = {
  fees: [
    { label: 'Discount Rate', amount: 900 },
    { label: 'Transaction Fees', amount: 200 },
    { label: 'Monthly Fees', amount: 50 },
  ],
  downgradeLines: [],
  pinDebitPresent: true,
  notes: '',
  totalVolume: 50_000,
  totalTransactions: 1_100,
  avgTicket: 45.45,
  effectiveRatePct: 2.3,
  currentMonthlyCost: 1_150,
};

describe('auditQualification', () => {
  it('is quiet on a clean card-present statement', () => {
    const findings = auditQualification(base, 'retail');
    expect(findings).toHaveLength(0);
  });

  it('flags explicit downgrade lines from the extraction with a recovery estimate', () => {
    const findings = auditQualification({
      ...base,
      downgradeLines: [{ label: 'Visa EIRF Surcharge', amount: 120 }],
    }, 'retail');
    const f = findings.find(x => x.id === 'downgrade-lines')!;
    expect(f).toBeDefined();
    expect(f.severity).toBe('high'); // 120/1150 > 5% of total cost
    expect(f.estAnnualRecovery).toBe(Math.round(120 * 12 * 0.45));
    expect(f.detail).toContain('Visa EIRF Surcharge');
  });

  it('pattern-scans fee labels on older analyses without downgradeLines', () => {
    const findings = auditQualification({
      ...base,
      downgradeLines: null,
      fees: [...base.fees, { label: 'Non-Qualified Surcharge', amount: 40 }],
    }, 'retail');
    const f = findings.find(x => x.id === 'downgrade-lines')!;
    expect(f).toBeDefined();
    expect(f.detail).toContain('Non-Qualified Surcharge');
  });

  it('flags missing PIN debit at a card-present merchant, not online', () => {
    const retail = auditQualification({ ...base, pinDebitPresent: false }, 'retail');
    expect(retail.some(f => f.id === 'pin-debit-missing')).toBe(true);

    const online = auditQualification({ ...base, pinDebitPresent: false }, 'ecommerce');
    expect(online.some(f => f.id === 'pin-debit-missing')).toBe(false);
  });

  it('nudges to confirm PIN routing when the analysis predates detection', () => {
    const findings = auditQualification({ ...base, pinDebitPresent: null }, 'restaurant');
    const f = findings.find(x => x.id === 'pin-debit-unknown')!;
    expect(f).toBeDefined();
    expect(f.severity).toBe('info');
  });

  it('flags effective rates in non-qualified territory', () => {
    const findings = auditQualification({
      ...base,
      effectiveRatePct: 3.4,
      currentMonthlyCost: 1_700,
    }, 'retail');
    const f = findings.find(x => x.id === 'nonqual-pricing')!;
    expect(f).toBeDefined();
    expect(f.severity).toBe('high');
    expect(f.estAnnualRecovery).toBeGreaterThan(0);
  });

  it('raises the B2B enhanced-data opportunity, harder when Data Rate I shows', () => {
    const soft = auditQualification(base, 'b2b');
    expect(soft.find(x => x.id === 'b2b-enhanced-data')!.severity).toBe('info');

    const hard = auditQualification({
      ...base,
      downgradeLines: [{ label: 'MC Data Rate I', amount: 85 }],
    }, 'b2b');
    expect(hard.find(x => x.id === 'b2b-enhanced-data')!.severity).toBe('medium');
  });

  it('reads downgrade language out of the notes when fee lines are clean', () => {
    const findings = auditQualification({
      ...base,
      notes: 'Statement shows downgrade adjustments folded into the discount rate.',
    }, 'retail');
    expect(findings.some(f => f.id === 'downgrade-notes')).toBe(true);
  });

  it('sorts findings most severe first', () => {
    const findings = auditQualification({
      ...base,
      pinDebitPresent: null,
      effectiveRatePct: 3.5,
      downgradeLines: [{ label: 'EIRF', amount: 200 }],
    }, 'retail');
    const severities = findings.map(f => f.severity);
    const rank = { high: 0, medium: 1, info: 2 } as const;
    for (let i = 1; i < severities.length; i++) {
      expect(rank[severities[i]]).toBeGreaterThanOrEqual(rank[severities[i - 1]]);
    }
  });
});
