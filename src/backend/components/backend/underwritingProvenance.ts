// ══════════════════════════════════════════════════════════════
// Provenance for underwriting Plaid inputs.
//
// The underwriting case page must never claim data was "pulled" when an
// analyst typed it in by hand. We stamp a `_prov` key inside the existing
// `plaid_inputs` jsonb (round-trips verbatim through crmStore; the scoring
// engine reads only its named fields, so the extra key is invisible to it).
// Apps written before this stamp existed simply render as manual entry.
// ══════════════════════════════════════════════════════════════
import type { PlaidInputs } from './underwritingScore';

export interface PlaidProvenance {
  source: 'plaid-vault' | 'manual';
  /** ISO timestamp of the vault snapshot (provenance.generated_at). */
  pulledAt?: string;
  /** ISO timestamp of the last manual edit made after a vault pull. */
  editedAt?: string;
  /** Lead whose vault the inputs came from — enables live re-pull. */
  leadId?: string;
}

export type PlaidInputsWithProv = PlaidInputs & { _prov?: PlaidProvenance };

export interface PlaidProvenanceView {
  kind: 'plaid' | 'plaid-edited' | 'manual';
  pulledAt?: string;
  editedAt?: string;
  leadId?: string;
}

export function describePlaidProvenance(inputs: PlaidInputsWithProv | undefined | null): PlaidProvenanceView {
  const prov = inputs?._prov;
  if (!prov || prov.source !== 'plaid-vault' || !prov.pulledAt) return { kind: 'manual' };
  return {
    kind: prov.editedAt ? 'plaid-edited' : 'plaid',
    pulledAt: prov.pulledAt,
    editedAt: prov.editedAt,
    leadId: prov.leadId,
  };
}

/**
 * Record that a human changed a field. Only meaningful after a vault pull —
 * purely manual worksheets stay unstamped.
 */
export function stampManualEdit(inputs: PlaidInputsWithProv, at: string = new Date().toISOString()): PlaidInputsWithProv {
  const prov = inputs._prov;
  if (!prov || prov.source !== 'plaid-vault' || !prov.pulledAt) return inputs;
  return { ...inputs, _prov: { ...prov, editedAt: at } };
}

/** Stamp freshly pulled vault inputs (used at write time by Send to Underwriting and the case-page pull). */
export function stampVaultPull(
  inputs: PlaidInputs,
  opts: { pulledAt?: string; leadId: string },
): PlaidInputsWithProv {
  return {
    ...inputs,
    _prov: {
      source: 'plaid-vault',
      pulledAt: opts.pulledAt ?? new Date().toISOString(),
      leadId: opts.leadId,
    },
  };
}

/**
 * Build stamped inputs from a vault `underwriting_inputs` node's `data`
 * (shape written by supabase/functions/_shared/plaid.ts). Null when the
 * node doesn't carry a usable PlaidInputs payload.
 */
export function fromVaultNode(nodeData: any, leadId: string): PlaidInputsWithProv | null {
  const p = nodeData?.plaidInputs;
  if (!p || typeof p !== 'object') return null;
  if (typeof p.monthlyRevenue !== 'number' || typeof p.avgDailyBalance !== 'number') return null;
  return stampVaultPull(p as PlaidInputs, {
    pulledAt: typeof nodeData?.provenance?.generated_at === 'string' ? nodeData.provenance.generated_at : undefined,
    leadId,
  });
}
