/**
 * ────────────────────────────────────────────────────────────
 * Schedule A composer — pre-populated merchant pricing templates
 * ────────────────────────────────────────────────────────────
 * Built for speed: pick the processor (auto-selected from the deal's
 * boarding channel), and the full Schedule A grid is pre-populated from
 * Delt's contracted buy rates (processorSchedules.ts). Staff only touch
 * the sell column; margin per line and Delt's residual share compute
 * live. Print produces a clean merchant-facing document — sell rates
 * only, buy rates and margins never leave the CRM.
 */

import React, { useMemo, useState } from 'react';
import { X, Printer, RotateCcw } from 'lucide-react';
import {
  PROCESSOR_SCHEDULES, scheduleById, fmtBuy,
  type ProcessorSchedule, type FeeRow,
} from './processorSchedules';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function rowKey(sectionTitle: string, label: string) {
  return `${sectionTitle}::${label}`;
}

function numericBuy(row: FeeRow, tierIdx: number): number | null {
  const v = row.buy[tierIdx];
  return typeof v === 'number' ? v : null;
}

function defaultSell(row: FeeRow, tierIdx: number): string {
  const v = row.buy[tierIdx];
  if (typeof v === 'number') {
    return row.kind === 'pct' ? v.toFixed(v < 0.1 ? 3 : 2) : v.toFixed(2);
  }
  return String(v ?? '');
}

export function ScheduleAComposer({
  merchantName = '', contactName = '', channel = null, onClose,
}: {
  merchantName?: string;
  contactName?: string;
  channel?: string | null;
  onClose: () => void;
}) {
  const initial = useMemo(() => {
    const match = PROCESSOR_SCHEDULES.find(s => s.processor === channel);
    return match?.id ?? 'paysafe-core';
  }, [channel]);

  const [scheduleId, setScheduleId] = useState(initial);
  const [tierIdx, setTierIdx] = useState(0);
  const [legalName, setLegalName] = useState(merchantName);
  const [dba, setDba] = useState('');
  const [contact, setContact] = useState(contactName);
  const [effectiveDate, setEffectiveDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sell, setSell] = useState<Record<string, string>>({});

  const schedule: ProcessorSchedule = scheduleById(scheduleId) ?? PROCESSOR_SCHEDULES[0];
  const tier = schedule.tiers[Math.min(tierIdx, schedule.tiers.length - 1)];
  const safeTierIdx = Math.min(tierIdx, schedule.tiers.length - 1);

  const sellFor = (section: string, row: FeeRow): string => {
    const k = rowKey(section, row.label);
    return sell[k] ?? defaultSell(row, safeTierIdx);
  };

  const marginFor = (section: string, row: FeeRow): number | null => {
    const buy = numericBuy(row, safeTierIdx);
    if (buy == null) return null;
    const s = parseFloat(sellFor(section, row));
    if (!Number.isFinite(s)) return null;
    return s - buy;
  };

  const resetSell = () => setSell({});

  const switchSchedule = (id: string) => {
    setScheduleId(id);
    setTierIdx(0);
    setSell({});
  };

  const printDoc = () => {
    const sections = schedule.sections.map(sec => `
      <tr><td colspan="2" class="section">${esc(sec.title)}</td></tr>
      ${sec.rows.map(row => {
        const v = sellFor(sec.title, row);
        const display = row.kind === 'pct' && /^[\d.]+$/.test(v) ? `${v}%`
          : row.kind === 'usd' && /^[\d.]+$/.test(v) ? `$${parseFloat(v).toFixed(2)}`
          : v;
        return `<tr><td>${esc(row.label)}${row.note ? `<div class="note">${esc(row.note)}</div>` : ''}</td><td class="val">${esc(display)}</td></tr>`;
      }).join('')}
    `).join('');

    const html = `<!doctype html><html><head><title>Schedule A — ${esc(dba || legalName || 'Merchant')}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #16213e; margin: 40px; }
        .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2E6BFF; padding-bottom: 14px; }
        .brand { font-size: 26px; font-weight: 800; color: #0B1B3F; letter-spacing: .01em; }
        .brand span { color: #2E6BFF; }
        h1 { font-size: 17px; margin: 4px 0 0; }
        .meta { font-size: 12px; text-align: right; color: #4a5670; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 12px; }
        td { border: 1px solid #d8deeb; padding: 6px 10px; }
        td.section { background: #0B1B3F; color: #fff; font-weight: 700; font-size: 11px; letter-spacing: .04em; text-transform: uppercase; }
        td.val { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; width: 130px; }
        .note { font-size: 10px; color: #7a849c; }
        .sig { margin-top: 36px; display: flex; gap: 40px; }
        .sig div { flex: 1; }
        .line { border-bottom: 1px solid #16213e; height: 34px; }
        .lbl { font-size: 10px; color: #4a5670; margin-top: 4px; }
        .foot { margin-top: 28px; font-size: 10px; color: #7a849c; }
        @media print { body { margin: 18px; } }
      </style></head><body>
      <div class="head">
        <div>
          <div class="brand">Delt <span>Pay</span></div>
          <h1>Merchant Pricing — Schedule A</h1>
        </div>
        <div class="meta">
          <strong>${esc(legalName || '________________________')}</strong><br/>
          ${dba ? `DBA: ${esc(dba)}<br/>` : ''}
          ${contact ? `Contact: ${esc(contact)}<br/>` : ''}
          Effective date: ${esc(effectiveDate)}
        </div>
      </div>
      <table>${sections}</table>
      <div class="sig">
        <div><div class="line"></div><div class="lbl">Merchant — Authorized Signature &amp; Date</div></div>
        <div><div class="line"></div><div class="lbl">Delt Pay LLC — Authorized Signature &amp; Date</div></div>
      </div>
      <div class="foot">Interchange, dues, assessments and network pass-through charges are billed at cost. Pricing subject to the Merchant Processing Agreement.</div>
      <script>window.onload = () => window.print();</script>
      </body></html>`;

    const w = window.open('', '_blank', 'width=900,height=1100');
    if (!w) return;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Schedule A composer</h2>
            <p className="text-xs text-gray-500">{schedule.splitLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetSell} title="Reset sell rates to buy rates" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={printDoc} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#2E6BFF] text-white hover:bg-[#2458d6]">
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md"><X className="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>

        {/* Merchant + processor selectors */}
        <div className="px-5 py-3 border-b border-gray-100 grid grid-cols-2 lg:grid-cols-6 gap-2">
          <select value={scheduleId} onChange={e => switchSchedule(e.target.value)} className="lg:col-span-2 px-2 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700">
            {PROCESSOR_SCHEDULES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {schedule.tiers.length > 1 && (
            <select value={safeTierIdx} onChange={e => { setTierIdx(Number(e.target.value)); setSell({}); }} className="px-2 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700">
              {schedule.tiers.map((t, i) => <option key={t.label} value={i}>{t.label}</option>)}
            </select>
          )}
          <input value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="Merchant legal name" className="px-2 py-1.5 border border-gray-300 rounded-md text-xs" />
          <input value={dba} onChange={e => setDba(e.target.value)} placeholder="DBA (optional)" className="px-2 py-1.5 border border-gray-300 rounded-md text-xs" />
          <input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} className="px-2 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700" />
        </div>

        {schedule.pending && (
          <div className="mx-5 mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
            Square hasn't delivered a Schedule A yet — only the agreed 70/30 net split is on file. Swap in the full grid when it arrives.
          </div>
        )}

        {/* Grid */}
        <div className="overflow-y-auto px-5 py-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400">
                <th className="py-1.5 pr-2 font-semibold">Fee</th>
                <th className="py-1.5 px-2 font-semibold text-right w-28">Buy (Delt cost)</th>
                <th className="py-1.5 px-2 font-semibold text-right w-32">Sell (merchant)</th>
                <th className="py-1.5 pl-2 font-semibold text-right w-28">Margin · {tier.deltSharePct}% share</th>
              </tr>
            </thead>
            <tbody>
              {schedule.sections.map(sec => (
                <React.Fragment key={sec.title}>
                  <tr><td colSpan={4} className="pt-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-[#2E6BFF]">{sec.title}</td></tr>
                  {sec.rows.map(row => {
                    const buy = row.buy[safeTierIdx];
                    const editable = typeof buy === 'number';
                    const margin = marginFor(sec.title, row);
                    const k = rowKey(sec.title, row.label);
                    return (
                      <tr key={k} className="border-t border-gray-100">
                        <td className="py-1.5 pr-2 text-gray-700">
                          {row.label}
                          {row.note && <div className="text-[10px] text-gray-400">{row.note}</div>}
                        </td>
                        <td className="py-1.5 px-2 text-right text-gray-400 tabular-nums whitespace-nowrap">{fmtBuy(row.kind, buy)}</td>
                        <td className="py-1.5 px-2 text-right">
                          {editable ? (
                            <span className="inline-flex items-center gap-1 justify-end">
                              {row.kind === 'usd' && <span className="text-gray-400">$</span>}
                              <input
                                value={sellFor(sec.title, row)}
                                onChange={e => setSell(prev => ({ ...prev, [k]: e.target.value }))}
                                className="w-20 px-1.5 py-1 border border-gray-300 rounded text-right text-xs tabular-nums focus:border-[#2E6BFF] focus:outline-none"
                              />
                              {row.kind === 'pct' && <span className="text-gray-400">%</span>}
                            </span>
                          ) : (
                            <span className="text-gray-500">{fmtBuy(row.kind, buy)}</span>
                          )}
                        </td>
                        <td className={`py-1.5 pl-2 text-right tabular-nums whitespace-nowrap ${margin == null ? 'text-gray-300' : margin > 0 ? 'text-emerald-600 font-medium' : margin < 0 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                          {margin == null ? '—' : `${row.kind === 'pct' ? `${margin.toFixed(3)}%` : `$${margin.toFixed(2)}`}`}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {schedule.notes.length > 0 && (
            <div className="mt-4 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Internal notes (never printed)</p>
              {schedule.notes.map(n => <p key={n} className="text-[11px] text-gray-500 leading-relaxed">• {n}</p>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
