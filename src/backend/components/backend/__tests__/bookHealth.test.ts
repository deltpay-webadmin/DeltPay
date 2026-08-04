import { describe, it, expect } from 'vitest';
import { computeHealthFlags, DROP_THRESHOLD, MAX_FLAGS } from '../bookHealth';
import type { ResidualRow } from '../residualsStore';

let seq = 0;
function row(period: string, merchantName: string, monthlyVolume: number): ResidualRow {
  return {
    id: `r${++seq}`,
    importId: null,
    period,
    merchantId: null,
    merchantName,
    monthlyVolume,
    transactionCount: 100,
    grossRevenue: monthlyVolume * 0.04,
    processorFees: monthlyVolume * 0.03,
    netRevenue: monthlyVolume * 0.01,
    agent: 'Test Agent',
    agentShare: monthlyVolume * 0.005,
    deltNet: monthlyVolume * 0.005,
  };
}

describe('computeHealthFlags', () => {
  it('needs two periods to say anything', () => {
    expect(computeHealthFlags([])).toEqual([]);
    expect(computeHealthFlags([row('2026-07', 'Solo Cafe', 20_000)])).toEqual([]);
  });

  it('flags a merchant that vanished from the latest period', () => {
    const flags = computeHealthFlags([
      row('2026-06', 'Gone Deli', 15_000),
      row('2026-06', 'Steady Shop', 20_000),
      row('2026-07', 'Steady Shop', 20_000),
    ]);
    expect(flags).toHaveLength(1);
    expect(flags[0].merchant).toBe('Gone Deli');
    expect(flags[0].note).toMatch(/No processing/);
  });

  it('flags a drop beyond the threshold with the right percentage', () => {
    const flags = computeHealthFlags([
      row('2026-06', 'Slipping Salon', 40_000),
      row('2026-07', 'Slipping Salon', 20_000), // -50%
    ]);
    expect(flags).toHaveLength(1);
    expect(flags[0].note).toMatch(/down 50%/);
  });

  it('does not flag a drop inside the threshold', () => {
    const okDrop = 1 - DROP_THRESHOLD + 0.01; // e.g. -24%
    const flags = computeHealthFlags([
      row('2026-06', 'Fine Foods', 40_000),
      row('2026-07', 'Fine Foods', 40_000 * okDrop),
    ]);
    expect(flags).toEqual([]);
  });

  it('a healthy or growing book produces no flags', () => {
    const flags = computeHealthFlags([
      row('2026-06', 'Grower', 30_000),
      row('2026-07', 'Grower', 45_000),
    ]);
    expect(flags).toEqual([]);
  });

  it('caps the nudge list at MAX_FLAGS', () => {
    const rows: ResidualRow[] = [];
    for (let i = 0; i < 6; i++) rows.push(row('2026-06', `Churner ${i}`, 10_000));
    rows.push(row('2026-07', 'Anchor', 10_000));
    rows.push(row('2026-06', 'Anchor', 10_000));
    expect(computeHealthFlags(rows)).toHaveLength(MAX_FLAGS);
  });

  it('compares the two most recent periods, not older ones', () => {
    const flags = computeHealthFlags([
      row('2026-05', 'Ancient History', 99_000),
      row('2026-06', 'Current Merchant', 20_000),
      row('2026-07', 'Current Merchant', 20_000),
    ]);
    // 'Ancient History' is two periods back — outside the comparison window.
    expect(flags).toEqual([]);
  });
});
