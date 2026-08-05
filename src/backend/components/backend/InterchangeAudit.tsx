import React, { Fragment, useMemo, useState } from 'react';
import { ShieldCheck, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import {
  IC_SCHEDULE, verifyInterchangeLine, verificationStatusIcon, verificationStatusColor,
  type InterchangeLineInput, type Verification,
} from './interchangeReference';

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const fmtWhole = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export interface AuditLine extends InterchangeLineInput {
  /** Total dollars the statement charged for this line. */
  cost?: number;
}

export interface InterchangeAuditSummary {
  auditedLines: number;
  flaggedLines: number;
  alertLines: number;
  monthlyPadding: number;
  annualPadding: number;
}

/** Run the verification engine over extracted lines; shared with the merchant rollup. */
export function auditInterchangeLines(lines: AuditLine[], avgTicket: number) {
  const rows = lines.map(line => ({ line, v: verifyInterchangeLine(line, avgTicket) }));
  const monthlyPadding = rows.reduce((s, r) => s + r.v.totalPadding, 0);
  const summary: InterchangeAuditSummary = {
    auditedLines: rows.filter(r => r.v.status !== 'unknown').length,
    flaggedLines: rows.filter(r => ['review', 'flag', 'alert'].includes(r.v.status)).length,
    alertLines: rows.filter(r => r.v.status === 'alert').length,
    monthlyPadding,
    annualPadding: monthlyPadding * 12,
  };
  return { rows, summary };
}

/**
 * Interchange audit for the Statement Analyzer: every extracted card-category
 * line compared against the published Visa/MC/Amex/Discover schedule, with
 * bps variance and estimated padding dollars.
 */
export function InterchangeAudit({ lines, avgTicket, assessmentFees }: {
  lines: AuditLine[];
  avgTicket: number;
  assessmentFees?: { label: string; amount: number }[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const { rows, summary } = useMemo(() => auditInterchangeLines(lines, avgTicket), [lines, avgTicket]);
  if (!lines.length) return null;

  const tone = summary.alertLines > 0
    ? { border: 'border-red-200', bg: 'bg-red-50/60', text: 'text-red-700', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> }
    : summary.flaggedLines > 0
      ? { border: 'border-amber-200', bg: 'bg-amber-50/60', text: 'text-amber-700', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> }
      : { border: 'border-emerald-200', bg: 'bg-emerald-50/60', text: 'text-emerald-700', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> };

  return (
    <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand" />
          Interchange Audit
        </h2>
        <span className="text-xs text-gray-400">
          vs published {IC_SCHEDULE.version} Visa/MC/Amex schedule
        </span>
      </div>

      {/* Summary banner */}
      <div className={`mx-5 mt-4 rounded-[8px] border ${tone.border} ${tone.bg} px-4 py-3 flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-2.5">
          {tone.icon}
          <div>
            <p className={`text-sm font-semibold ${tone.text}`}>
              {summary.alertLines > 0
                ? `${summary.alertLines} alert${summary.alertLines > 1 ? 's' : ''} — potential interchange padding detected`
                : summary.flaggedLines > 0
                  ? `${summary.flaggedLines} line${summary.flaggedLines > 1 ? 's' : ''} need review`
                  : 'All interchange rates match published schedules'}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {summary.auditedLines} of {rows.length} categories matched to the published schedule · next rate update {IC_SCHEDULE.nextUpdate}
            </p>
          </div>
        </div>
        {summary.monthlyPadding > 0.5 && (
          <div className="text-right shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Est. overcharge</p>
            <p className="text-lg font-bold text-red-600 tabular-nums">{fmt(summary.monthlyPadding)}<span className="text-xs font-medium">/mo</span></p>
            <p className="text-[11px] text-red-500 font-medium tabular-nums">{fmtWhole(summary.annualPadding)}/yr</p>
          </div>
        )}
      </div>

      {/* Audit table */}
      <div className="p-5 overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200">
              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-3 pr-2 py-2.5 w-10"></th>
              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Card Category</th>
              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Volume</th>
              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Reported</th>
              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Published</th>
              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Variance</th>
              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-3 pr-3 py-2.5">Est. Padding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(({ line, v }, i) => (
              <Fragment key={`${line.category}-${i}`}>
                <tr
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                >
                  <td className="pl-3 pr-2 py-2.5">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border"
                      style={{
                        color: verificationStatusColor(v.status),
                        borderColor: `${verificationStatusColor(v.status)}50`,
                        background: `${verificationStatusColor(v.status)}14`,
                      }}
                    >
                      {verificationStatusIcon(v.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-sm font-medium text-gray-900">{line.category}</span>
                    {v.matchedCategory && v.matchedCategory !== line.category && (
                      <span className="block text-[11px] text-gray-400">→ {v.matchedCategory}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-gray-700 text-right tabular-nums">{fmtWhole(line.volume)}</td>
                  <td className="px-3 py-2.5 text-sm text-gray-900 text-right tabular-nums">
                    {line.ratePct.toFixed(2)}%{line.perItemFee ? ` + $${line.perItemFee.toFixed(2)}` : ''}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-gray-500 text-right tabular-nums">
                    {v.matchedCategory ? `${v.publishedRate.toFixed(2)}% + $${v.publishedTxnFee.toFixed(2)}` : '—'}
                  </td>
                  <td className={`px-3 py-2.5 text-sm text-right font-semibold tabular-nums ${
                    v.diffBps > 5 ? 'text-red-600' : v.diffBps > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {v.matchedCategory ? `${v.diffBps > 0 ? '+' : ''}${v.diffBps} bps` : '—'}
                  </td>
                  <td className="pl-3 pr-3 py-2.5 text-sm text-right tabular-nums">
                    {v.totalPadding > 0.005
                      ? <span className="font-medium text-red-600">{fmt(v.totalPadding)}/mo</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                </tr>
                {expanded === i && (
                  <tr>
                    <td colSpan={7} className="bg-gray-50/70 px-5 py-3">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Verification</p>
                          <p className="text-gray-700 leading-relaxed">{v.message}</p>
                        </div>
                        {v.matchedCategory ? (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Published Program</p>
                            <p className="font-medium text-gray-900">{v.program}</p>
                            {v.range && <p className="text-amber-600 mt-0.5">Valid range: {v.range.low}% – {v.range.high}%</p>}
                            <p className="text-gray-500 mt-0.5">{v.notes}</p>
                          </div>
                        ) : <div />}
                        {v.totalPadding > 0.005 && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Dollar Impact</p>
                            <p className="text-gray-700">Rate padding: <span className="font-medium text-red-600 tabular-nums">{fmt(v.ratePadding)}/mo</span></p>
                            <p className="text-gray-700">Per-item padding: <span className="font-medium text-red-600 tabular-nums">{fmt(v.txnPadding)}/mo</span></p>
                            <p className="text-gray-900 font-semibold mt-1">Annual impact: <span className="text-red-600 tabular-nums">{fmtWhole(v.annualImpact)}/yr</span></p>
                          </div>
                        )}
                      </div>
                      {v.commonPadding && (
                        <p className="mt-3 text-xs text-gray-600 bg-brand/5 border border-brand/10 rounded-[6px] px-3 py-2">
                          <span className="font-semibold">Common padding tactic:</span> {v.commonPadding}
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>

        {assessmentFees && assessmentFees.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Network Assessments & Dues</p>
            <div className="flex flex-wrap gap-2">
              {assessmentFees.map((f, i) => (
                <span key={`${f.label}-${i}`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-[6px] text-xs text-gray-700">
                  {f.label}
                  <span className="font-semibold tabular-nums">{fmt(f.amount)}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
          {expanded === null ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          Click a row for the published program, valid range, and dollar impact. Padding estimates assume the statement's average ticket where item counts aren't printed.
        </p>
      </div>
    </div>
  );
}
