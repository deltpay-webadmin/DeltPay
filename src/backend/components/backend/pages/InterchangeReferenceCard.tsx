import React, { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import {
  estimateInterchange, INTERCHANGE_REFERENCE, INTERCHANGE_SCHEDULE_VERSION,
  MERCHANT_CATEGORIES, REGULATED_DEBIT,
  type MerchantCategory, type NetworkReference,
} from '../interchangeRates';
import { useLang } from '../i18n';

interface InterchangeReferenceCardProps {
  category: MerchantCategory;
  avgTicket: number;
}

/**
 * Published interchange schedules (Visa / Mastercard / Discover / Amex
 * OptBlue), plus the blended baseline the analyzer uses for this statement.
 * Internal-only — never rendered in Merchant View.
 */
export function InterchangeReferenceCard({ category, avgTicket }: InterchangeReferenceCardProps) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [network, setNetwork] = useState<NetworkReference['network']>('visa');

  const ic = useMemo(() => estimateInterchange(category, avgTicket), [category, avgTicket]);
  const categoryLabel = MERCHANT_CATEGORIES.find(c => c.key === category)?.label ?? category;
  const ref = INTERCHANGE_REFERENCE.find(n => n.network === network)!;

  return (
    <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gray-400" />
          {t('Interchange Reference')}
          <span className="text-xs font-normal text-gray-400">
            {t('Published schedules')} · {INTERCHANGE_SCHEDULE_VERSION}
          </span>
        </span>
        <span className="flex items-center gap-3">
          <span className="text-xs text-gray-500 tabular-nums hidden sm:block">
            {t(categoryLabel)}: <span className="font-semibold text-gray-900">{ic.blendedPct.toFixed(2)}%</span> {t('blended interchange')}
          </span>
          {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {/* Blended baseline for this statement */}
          <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('Blended baseline for this statement')} — {t(categoryLabel)}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {ic.byNetwork.map(n => (
                <div key={n.network} className="bg-white border border-gray-200 rounded-[6px] px-3 py-2.5">
                  <p className="text-[11px] text-gray-500 font-medium">{n.label}</p>
                  <p className="text-sm font-bold text-gray-900 tabular-nums">{n.pct.toFixed(2)}%</p>
                </div>
              ))}
              <div className="bg-brand/5 border border-brand/20 rounded-[6px] px-3 py-2.5">
                <p className="text-[11px] text-brand font-medium">{t('Blended + assessments')}</p>
                <p className="text-sm font-bold text-brand tabular-nums">{ic.networkCostPct.toFixed(2)}%</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              {t('Blend assumes a typical US card mix (network share, debit vs credit, rewards tiers); regulated debit at')}{' '}
              {REGULATED_DEBIT.pct}% + ${REGULATED_DEBIT.perTxn.toFixed(2)}. {t('Rates themselves are the published figures.')}
            </p>
          </div>

          {/* Network tabs */}
          <div className="px-5 pt-4 flex gap-1 flex-wrap">
            {INTERCHANGE_REFERENCE.map(n => (
              <button
                key={n.network}
                onClick={() => setNetwork(n.network)}
                className={`px-3 py-1.5 text-xs font-medium rounded-[6px] transition-colors ${
                  network === n.network ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {n.name}
              </button>
            ))}
            <span className="ml-auto self-center text-[11px] text-gray-400">
              {t('Effective')}: {ref.effective}
            </span>
          </div>

          {/* Sections */}
          <div className="px-5 py-4 space-y-5">
            {ref.sections.map(section => (
              <div key={section.title}>
                <p className="text-xs font-semibold text-gray-700 mb-1.5">{t(section.title)}</p>
                {section.note && <p className="text-[11px] text-gray-400 mb-1.5">{t(section.note)}</p>}
                <div className="border border-gray-200 rounded-[6px] overflow-x-auto">
                  <table className="w-full min-w-[480px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                          {t('Fee Program')}
                        </th>
                        {section.columns.map(c => (
                          <th key={c} className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2 whitespace-nowrap">
                            {t(c)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {section.rows.map(row => (
                        <tr key={row.label}>
                          <td className="px-3 py-1.5 text-xs text-gray-700">{row.label}</td>
                          {row.values.map((v, i) => (
                            <td key={i} className="px-3 py-1.5 text-xs text-gray-900 text-right tabular-nums whitespace-nowrap">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
