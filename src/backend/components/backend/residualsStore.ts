/**
 * ────────────────────────────────────────────────────────────
 * Residuals store — Supabase-backed processor residual reports
 * ────────────────────────────────────────────────────────────
 * Backs the Residuals page: monthly per-merchant residual rows
 * imported from processor CSVs, plus the import history. Follows
 * the same pattern as the other stores: hydrate on first hook
 * subscription, optimistic-free simple writes (imports are batch
 * inserts followed by a refresh), offline no-op when Supabase is
 * not configured.
 */

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';

export interface ResidualRow {
  id: string;
  importId: string | null;
  period: string;        // 'YYYY-MM'
  merchantId: string | null;
  merchantName: string;
  monthlyVolume: number;
  transactionCount: number;
  grossRevenue: number;
  processorFees: number;
  netRevenue: number;
  agent: string;
  agentShare: number;
  deltNet: number;
}

export interface ResidualImport {
  id: string;
  period: string;        // 'YYYY-MM'
  periodLabel: string;   // 'March 2026'
  filename: string;
  rowCount: number;
  status: string;
  createdAt: string;
}

interface ResidualsState {
  rows: ResidualRow[];
  imports: ResidualImport[];
  isLoading: boolean;
  isOnline: boolean;
}

let state: ResidualsState = {
  rows: [],
  imports: [],
  isLoading: true,
  isOnline: false,
};

const listeners = new Set<() => void>();

function set(patch: Partial<ResidualsState>) {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}

function fromDbRow(r: any): ResidualRow {
  return {
    id: r.id,
    importId: r.import_id ?? null,
    period: r.period,
    merchantId: r.merchant_id ?? null,
    merchantName: r.merchant_name,
    monthlyVolume: Number(r.monthly_volume) || 0,
    transactionCount: Number(r.transaction_count) || 0,
    grossRevenue: Number(r.gross_revenue) || 0,
    processorFees: Number(r.processor_fees) || 0,
    netRevenue: Number(r.net_revenue) || 0,
    agent: r.agent || 'Unassigned',
    agentShare: Number(r.agent_share) || 0,
    deltNet: Number(r.delt_net) || 0,
  };
}

function fromDbImport(r: any): ResidualImport {
  return {
    id: r.id,
    period: r.period,
    periodLabel: r.period_label,
    filename: r.filename,
    rowCount: Number(r.row_count) || 0,
    status: r.status || 'Processed',
    createdAt: r.created_at || '',
  };
}

let hydrated = false;
let hydrating = false;

async function maybeHydrate() {
  if (hydrated || hydrating) return;
  if (!supabase) {
    hydrated = true;
    set({ isLoading: false, isOnline: false });
    return;
  }
  hydrating = true;
  try {
    const [rowsRes, importsRes] = await Promise.all([
      supabase.from('residual_rows').select('*').order('period', { ascending: false }),
      supabase.from('residual_imports').select('*').order('created_at', { ascending: false }),
    ]);
    if (rowsRes.error) throw rowsRes.error;
    if (importsRes.error) throw importsRes.error;
    set({
      rows: (rowsRes.data || []).map(fromDbRow),
      imports: (importsRes.data || []).map(fromDbImport),
      isLoading: false,
      isOnline: true,
    });
    hydrated = true;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Residuals] Hydration failed:', err);
    hydrated = true;
    set({ isLoading: false, isOnline: false });
    toast.error('Unable to load residual reports.');
  } finally {
    hydrating = false;
  }
}

async function refresh(): Promise<void> {
  if (!supabase) return;
  const [rowsRes, importsRes] = await Promise.all([
    supabase.from('residual_rows').select('*').order('period', { ascending: false }),
    supabase.from('residual_imports').select('*').order('created_at', { ascending: false }),
  ]);
  if (!rowsRes.error && !importsRes.error) {
    set({
      rows: (rowsRes.data || []).map(fromDbRow),
      imports: (importsRes.data || []).map(fromDbImport),
      isOnline: true,
    });
  }
}

const CHUNK = 200;

export interface ResidualImportInput {
  period: string;       // 'YYYY-MM'
  periodLabel: string;
  filename: string;
  rows: Omit<ResidualRow, 'id' | 'importId'>[];
}

export const residualActions = {
  /**
   * Persist a parsed residual report: one residual_imports record plus its
   * rows (chunked). Returns the number of rows inserted, or -1 on failure.
   */
  async importReport(input: ResidualImportInput): Promise<number> {
    if (!supabase) {
      toast.error('Supabase is not configured — cannot save the report.');
      return -1;
    }
    const { data: imp, error: impErr } = await supabase
      .from('residual_imports')
      .insert({
        period: input.period,
        period_label: input.periodLabel,
        filename: input.filename,
        row_count: input.rows.length,
        status: 'Processed',
      })
      .select('id')
      .single();
    if (impErr || !imp) {
      // eslint-disable-next-line no-console
      console.error('[Residuals] Import record failed:', impErr);
      toast.error('Failed to record the import.');
      return -1;
    }
    let inserted = 0;
    for (let i = 0; i < input.rows.length; i += CHUNK) {
      const chunk = input.rows.slice(i, i + CHUNK).map(r => ({
        import_id: imp.id,
        period: input.period,
        merchant_id: r.merchantId,
        merchant_name: r.merchantName,
        monthly_volume: r.monthlyVolume,
        transaction_count: r.transactionCount,
        gross_revenue: r.grossRevenue,
        processor_fees: r.processorFees,
        net_revenue: r.netRevenue,
        agent: r.agent,
        agent_share: r.agentShare,
        delt_net: r.deltNet,
      }));
      const { error } = await supabase.from('residual_rows').insert(chunk);
      if (error) {
        // eslint-disable-next-line no-console
        console.error('[Residuals] Row chunk failed:', error);
        toast.error(`Some rows failed to save: ${error.message}`);
        break;
      }
      inserted += chunk.length;
    }
    await refresh();
    return inserted;
  },

  /** Delete an import batch and its rows (cascade). */
  async deleteImport(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('residual_imports').delete().eq('id', id);
    if (error) {
      toast.error(`Couldn't delete the report: ${error.message}`);
      return false;
    }
    await refresh();
    return true;
  },

  refresh,
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  void maybeHydrate();
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => state;

export function useResiduals() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
