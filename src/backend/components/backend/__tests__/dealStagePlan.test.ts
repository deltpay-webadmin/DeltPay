import { describe, it, expect } from 'vitest';
import { dealStagePlan } from '../dealStagePlan';

describe('dealStagePlan', () => {
  it('payments+capital shows the full flow, numbered sequentially', () => {
    const plan = dealStagePlan({ path: 'payments+capital', hasCapitalArtifacts: false, canCountersign: true });
    expect(plan.visible).toEqual(['plaid', 'application', 'underwriting', 'mca', 'countersign', 'mpa', 'documents']);
    expect(plan.numbers.plaid).toBe(1);
    expect(plan.numbers.countersign).toBe(5);
    expect(plan.numbers.documents).toBe(7);
    expect(plan.capitalForcedOpen).toBe(false);
  });

  it('skips countersign (and its number) without the permission', () => {
    const plan = dealStagePlan({ path: 'payments+capital', hasCapitalArtifacts: false, canCountersign: false });
    expect(plan.visible).not.toContain('countersign');
    expect(plan.numbers.countersign).toBeNull();
    expect(plan.numbers.mpa).toBe(5);
    expect(plan.numbers.documents).toBe(6);
  });

  it('payments-only is just MPA + documents, renumbered 1–2', () => {
    const plan = dealStagePlan({ path: 'payments-only', hasCapitalArtifacts: false, canCountersign: true });
    expect(plan.visible).toEqual(['mpa', 'documents']);
    expect(plan.numbers.mpa).toBe(1);
    expect(plan.numbers.documents).toBe(2);
    expect(plan.numbers.plaid).toBeNull();
    expect(plan.numbers.mca).toBeNull();
    expect(plan.capitalForcedOpen).toBe(false);
  });

  it('existing capital artifacts force the full flow open on a payments-only deal', () => {
    const plan = dealStagePlan({ path: 'payments-only', hasCapitalArtifacts: true, canCountersign: true });
    expect(plan.capitalForcedOpen).toBe(true);
    expect(plan.visible).toContain('mca');
    expect(plan.numbers.plaid).toBe(1);
    expect(plan.numbers.documents).toBe(7);
  });
});
