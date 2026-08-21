import { describe, it, expect } from 'vitest';
import { defaultScoreInputs, scorePlaid } from '../underwritingScore';
import {
  describePlaidProvenance,
  stampManualEdit,
  stampVaultPull,
  fromVaultNode,
} from '../underwritingProvenance';

const base = defaultScoreInputs().plaid;

describe('describePlaidProvenance', () => {
  it('inputs without a stamp (legacy apps, hand-typed worksheets) are manual', () => {
    expect(describePlaidProvenance(base).kind).toBe('manual');
    expect(describePlaidProvenance(undefined).kind).toBe('manual');
  });

  it('a vault pull reads as live plaid data with its pull timestamp', () => {
    const pulled = stampVaultPull(base, { pulledAt: '2026-04-09T10:23:00Z', leadId: 'lead-1' });
    const view = describePlaidProvenance(pulled);
    expect(view.kind).toBe('plaid');
    expect(view.pulledAt).toBe('2026-04-09T10:23:00Z');
    expect(view.leadId).toBe('lead-1');
  });

  it('a manual edit after a pull demotes the claim to plaid-edited', () => {
    const pulled = stampVaultPull(base, { pulledAt: '2026-04-09T10:23:00Z', leadId: 'lead-1' });
    const edited = stampManualEdit({ ...pulled, nsfCount90d: 3 }, '2026-04-10T08:00:00Z');
    const view = describePlaidProvenance(edited);
    expect(view.kind).toBe('plaid-edited');
    expect(view.editedAt).toBe('2026-04-10T08:00:00Z');
  });
});

describe('stampManualEdit', () => {
  it('leaves purely manual worksheets unstamped', () => {
    const out = stampManualEdit({ ...base, nsfCount90d: 2 });
    expect(out._prov).toBeUndefined();
  });
});

describe('fromVaultNode', () => {
  const nodeData = {
    plaidInputs: { ...base, monthlyRevenue: 42_000 },
    provenance: { source: 'plaid', generated_at: '2026-04-09T10:23:00Z' },
  };

  it('builds stamped inputs from an underwriting_inputs node', () => {
    const out = fromVaultNode(nodeData, 'lead-1');
    expect(out?.monthlyRevenue).toBe(42_000);
    expect(out?._prov).toEqual({ source: 'plaid-vault', pulledAt: '2026-04-09T10:23:00Z', leadId: 'lead-1' });
  });

  it('returns null on malformed node data', () => {
    expect(fromVaultNode(null, 'lead-1')).toBeNull();
    expect(fromVaultNode({}, 'lead-1')).toBeNull();
    expect(fromVaultNode({ plaidInputs: { monthlyRevenue: 'lots' } }, 'lead-1')).toBeNull();
  });
});

describe('scoring ignores the stamp', () => {
  it('stamped and unstamped inputs score identically', () => {
    const pulled = stampVaultPull(base, { pulledAt: '2026-04-09T10:23:00Z', leadId: 'lead-1' });
    expect(scorePlaid(pulled).total).toBe(scorePlaid(base).total);
  });
});
