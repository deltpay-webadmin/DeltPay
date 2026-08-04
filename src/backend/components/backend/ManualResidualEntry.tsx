import React, { useState } from 'react';
import { Plus, Trash2, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { residualActions } from './residualsStore';

/**
 * Hand-entry alternative to the CSV import: pick a month, key each
 * merchant's numbers, and save through the same importReport path the CSV
 * upload uses — so statements, exports, and the agent views work unchanged.
 * Built for the handful-of-merchants stage; the CSV flow takes over at scale.
 */

interface EntryRow {
  merchant: string;
  agent: string;
  volume: string;
  txns: string;
  gross: string;
  fees: string;
  splitPct: string;
}

const EMPTY: EntryRow = { merchant: '', agent: '', volume: '', txns: '', gross: '', fees: '', splitPct: '50' };

const num = (s: string) => Number(s.replace(/[^0-9.]/g, '')) || 0;

const cellCls =
  'w-full px-2 py-1.5 bg-white border border-gray-200 rounded-[6px] text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-400';

export function ManualResidualEntry({ onClose }: { onClose: () => void }) {
  const [period, setPeriod] = useState('');
  const [rows, setRows] = useState<EntryRow[]>([{ ...EMPTY }]);
  const [busy, setBusy] = useState(false);

  const setCell = (i: number, key: keyof EntryRow, value: string) =>
    setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));

  const validRows = rows.filter(r => r.merchant.trim() && num(r.gross) > 0);
  const canSave = /^\d{4}-\d{2}$/.test(period) && validRows.length > 0 && !busy;

  const save = async () => {
    if (!canSave) return;
    setBusy(true);
    const [y, m] = period.split('-').map(Number);
    const periodLabel = new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const inserted = await residualActions.importReport({
      period,
      periodLabel,
      filename: 'Manual entry',
      rows: validRows.map(r => {
        const gross = num(r.gross);
        const fees = num(r.fees);
        const net = Math.max(gross - fees, 0);
        const split = Math.min(Math.max(num(r.splitPct), 0), 100) / 100;
        const agentShare = Math.round(net * split * 100) / 100;
        return {
          period,
          merchantId: null,
          merchantName: r.merchant.trim(),
          monthlyVolume: num(r.volume),
          transactionCount: Math.round(num(r.txns)),
          grossRevenue: gross,
          processorFees: fees,
          netRevenue: net,
          agent: r.agent.trim() || 'Unassigned',
          agentShare,
          deltNet: Math.round((net - agentShare) * 100) / 100,
        };
      }),
    });
    setBusy(false);
    if (inserted > 0) {
      toast.success(`${inserted} residual row${inserted !== 1 ? 's' : ''} saved for ${periodLabel}.`);
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Manual Residual Entry</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500">Period</label>
          <input
            type="month"
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-[6px] text-sm text-gray-700 focus:outline-none"
          />
          <span className="text-[11px] text-gray-400">
            Net = gross − fees; the agent share applies the split % to net. Saves through the same
            pipeline as CSV imports.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="pb-1 pr-2 font-medium min-w-[160px]">Merchant *</th>
                <th className="pb-1 pr-2 font-medium min-w-[120px]">Agent</th>
                <th className="pb-1 pr-2 font-medium">Volume</th>
                <th className="pb-1 pr-2 font-medium">Txns</th>
                <th className="pb-1 pr-2 font-medium">Gross rev *</th>
                <th className="pb-1 pr-2 font-medium">Processor fees</th>
                <th className="pb-1 pr-2 font-medium">Split %</th>
                <th className="pb-1 pr-2 font-medium text-right">Agent share</th>
                <th className="pb-1" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const net = Math.max(num(r.gross) - num(r.fees), 0);
                const share = net * Math.min(Math.max(num(r.splitPct), 0), 100) / 100;
                return (
                  <tr key={i}>
                    <td className="py-1 pr-2"><input value={r.merchant} onChange={e => setCell(i, 'merchant', e.target.value)} placeholder="Roma Trattoria" className={cellCls} /></td>
                    <td className="py-1 pr-2"><input value={r.agent} onChange={e => setCell(i, 'agent', e.target.value)} placeholder="Agent name" className={cellCls} /></td>
                    <td className="py-1 pr-2"><input value={r.volume} onChange={e => setCell(i, 'volume', e.target.value)} placeholder="25000" inputMode="numeric" className={cellCls} /></td>
                    <td className="py-1 pr-2"><input value={r.txns} onChange={e => setCell(i, 'txns', e.target.value)} placeholder="800" inputMode="numeric" className={cellCls} /></td>
                    <td className="py-1 pr-2"><input value={r.gross} onChange={e => setCell(i, 'gross', e.target.value)} placeholder="950" inputMode="numeric" className={cellCls} /></td>
                    <td className="py-1 pr-2"><input value={r.fees} onChange={e => setCell(i, 'fees', e.target.value)} placeholder="850" inputMode="numeric" className={cellCls} /></td>
                    <td className="py-1 pr-2"><input value={r.splitPct} onChange={e => setCell(i, 'splitPct', e.target.value)} inputMode="numeric" className={`${cellCls} w-16`} /></td>
                    <td className="py-1 pr-2 text-right font-mono text-emerald-600 whitespace-nowrap">
                      ${share.toFixed(2)}
                    </td>
                    <td className="py-1">
                      <button
                        onClick={() => setRows(prev => prev.filter((_, idx) => idx !== i))}
                        disabled={rows.length === 1}
                        className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setRows(prev => [...prev, { ...EMPTY }])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[6px] border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add row
          </button>
          <button
            onClick={() => void save()}
            disabled={!canSave}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-[6px] text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {busy ? 'Saving…' : `Save ${validRows.length} row${validRows.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
