import React, { useMemo } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { auditQualification, type DowngradeFinding, type FindingSeverity } from '../interchangeAudit';
import type { MerchantCategory } from '../interchangeRates';
import type { ExtractedData } from './BackendAnalysis';
import { useLang } from '../i18n';

const fmtWhole = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

interface QualificationAuditCardProps {
  extracted: ExtractedData;
  category: MerchantCategory;
}

const SEVERITY_STYLE: Record<FindingSeverity, { badge: string; label: string }> = {
  high: { badge: 'bg-red-50 text-red-700', label: 'High' },
  medium: { badge: 'bg-amber-50 text-amber-700', label: 'Medium' },
  info: { badge: 'bg-gray-100 text-gray-600', label: 'Check' },
};

/**
 * Downgrade & qualification audit for the analyzed statement — where the
 * merchant is clearing at punitive interchange tiers, missing PIN debit
 * routing, or lacking enhanced data, and what that margin is worth annually.
 * Internal-only — never rendered in Merchant View.
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

  const totalRecovery = findings.reduce((s, f) => s + (f.estAnnualRecovery ?? 0), 0);
  const actionable = findings.filter(f => f.severity !== 'info');

  return (
    <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          {actionable.length > 0
            ? <ShieldAlert className="w-4 h-4 text-amber-500" />
            : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
          {t('Downgrade & Qualification Audit')}
        </h2>
        <div className="flex items-center gap-2">
          {totalRecovery > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tabular-nums">
              ~{fmtWhole(totalRecovery)}/yr {t('recoverable margin')}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
            {t('Internal only — hidden in Merchant View')}
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
          {findings.map(f => (
            <div key={f.id} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${SEVERITY_STYLE[f.severity].badge}`}>
                    {t(SEVERITY_STYLE[f.severity].label)}
                  </span>
                  {t(f.title)}
                </p>
                {f.estAnnualRecovery !== null && f.estAnnualRecovery > 0 && (
                  <span className="text-sm font-bold text-emerald-600 tabular-nums">
                    ~{fmtWhole(f.estAnnualRecovery)}/yr
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1.5">{f.detail}</p>
              <p className="text-xs text-gray-500 mt-1.5">
                <span className="font-semibold text-gray-700">{t('How to earn it:')}</span> {f.action}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-3 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">
          {t('Recovery figures are estimates against the published April 2026 schedules; actual results depend on card mix and how much volume re-qualifies.')}
        </p>
      </div>
    </div>
  );
}
