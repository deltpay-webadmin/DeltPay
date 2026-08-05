import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { auditQualification, type DowngradeFinding, type FindingSeverity } from '../interchangeAudit';
import type { MerchantCategory } from '../interchangeRates';
import type { ExtractedData } from './BackendAnalysis';
import { useLang } from '../i18n';

const fmtWhole = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

interface QualificationAuditCardProps {
  extracted: ExtractedData;
  category: MerchantCategory;
}

const SEVERITY: Record<FindingSeverity, { dot: string; chip: string; border: string; label: string }> = {
  high: { dot: 'bg-red-500', chip: 'bg-red-50 text-red-700', border: 'border-red-400', label: 'High' },
  medium: { dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700', border: 'border-amber-400', label: 'Medium' },
  info: { dot: 'bg-gray-300', chip: 'bg-gray-100 text-gray-600', border: 'border-gray-200', label: 'Check' },
};

/**
 * Downgrade & qualification audit for the analyzed statement — where the
 * merchant is clearing at punitive interchange tiers, missing PIN debit
 * routing, or lacking enhanced data, and what that margin is worth annually.
 *
 * Built to scan: the header carries severity counts and the recoverable
 * total; each finding is a single row (dot · title · evidence preview ·
 * $/yr) that expands to the full evidence and playbook. High-severity
 * findings start expanded. Internal-only — never rendered in Merchant View.
 */
export function QualificationAuditCard({ extracted, category }: QualificationAuditCardProps) {
  const { t } = useLang();

  const findings: DowngradeFinding[] = useMemo(() => auditQualification({
    fees: extracted.fees,
    downgradeLines: extracted.downgradeLines,
    pinDebitPresent: extracted.pinDebitPresent,
    notes: extracted.notes,
    totalVolume: extracted.totalVolume,
    totalTransactions: extracted.totalTransactions,
    avgTicket: extracted.avgTicket,
    effectiveRatePct: extracted.effectiveRatePct,
    currentMonthlyCost: extracted.currentMonthlyCost,
  }, category), [extracted, category]);

  // High-severity findings open on arrival; everything else stays folded.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  useEffect(() => {
    setExpanded(new Set(findings.filter(f => f.severity === 'high').map(f => f.id)));
  }, [findings]);

  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const totalRecovery = findings.reduce((s, f) => s + (f.estAnnualRecovery ?? 0), 0);
  const counts = findings.reduce(
    (acc, f) => { acc[f.severity] += 1; return acc; },
    { high: 0, medium: 0, info: 0 } as Record<FindingSeverity, number>,
  );
  const actionable = counts.high + counts.medium;

  return (
    <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
      {/* ── Scan line: what's wrong, how bad, what it's worth ── */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          {actionable > 0
            ? <ShieldAlert className="w-4 h-4 text-amber-500" />
            : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
          {t('Downgrade & Qualification Audit')}
          <span className="flex items-center gap-1.5 ml-1">
            {(['high', 'medium', 'info'] as FindingSeverity[]).map(sev => counts[sev] > 0 && (
              <span key={sev} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${SEVERITY[sev].chip}`}>
                {counts[sev]} {t(SEVERITY[sev].label)}
              </span>
            ))}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          {totalRecovery > 0 && (
            <span className="px-2.5 py-1 rounded-[6px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold tabular-nums">
              ~{fmtWhole(totalRecovery)}/yr
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
            {t('Internal only')}
          </span>
        </div>
      </div>

      {findings.length === 0 ? (
        <div className="px-5 py-6 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">{t('No downgrade signals on this statement')}</p>
            <p className="text-xs text-gray-500 mt-1">
              {t('No punitive-tier fee lines, and routing looks clean for this profile. The savings case rests on the processor markup, not qualification fixes.')}
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {findings.map(f => {
            const sev = SEVERITY[f.severity];
            const isOpen = expanded.has(f.id);
            return (
              <div key={f.id} className={`border-l-2 ${sev.border}`}>
                {/* One-line scan row */}
                <button
                  onClick={() => toggle(f.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50/60 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${sev.dot}`} />
                  <span className="text-sm font-semibold text-gray-900 shrink-0">{t(f.title)}</span>
                  {!isOpen && (
                    <span className="text-xs text-gray-400 truncate flex-1 min-w-0">{f.detail}</span>
                  )}
                  <span className="ml-auto flex items-center gap-2 shrink-0">
                    {f.estAnnualRecovery !== null && f.estAnnualRecovery > 0 && (
                      <span className="text-sm font-bold text-emerald-600 tabular-nums">
                        ~{fmtWhole(f.estAnnualRecovery)}/yr
                      </span>
                    )}
                    {isOpen
                      ? <ChevronDown className="w-4 h-4 text-gray-300" />
                      : <ChevronRight className="w-4 h-4 text-gray-300" />}
                  </span>
                </button>

                {/* Expanded: evidence + playbook */}
                {isOpen && (
                  <div className="px-4 pb-4 pl-9 space-y-1.5">
                    <p className="text-xs text-gray-600">{f.detail}</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">{t('How to earn it:')}</span> {f.action}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="px-5 py-2.5 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">
          {t('Recovery figures are estimates against the published April 2026 schedules; actual results depend on card mix and how much volume re-qualifies.')}
        </p>
      </div>
    </div>
  );
}
