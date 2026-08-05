import React, { useMemo } from 'react';
import { Lock } from 'lucide-react';
import {
  estimateProgramEconomics, INTERCHANGE_EST,
  type RiskTierKey,
} from '../pricingPrograms';
import type { ExtractedData } from './BackendAnalysis';

const fmtWhole = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

interface AnalysisEconomicsCardProps {
  extracted: ExtractedData;
  riskTier: RiskTierKey;
  /** Key of the program recommended to the merchant (best savings), for the margin-vs-savings footnote. */
  bestSavingsKey: string | null;
}

/** Internal-only Delt economics for the analyzed statement. Never rendered in Merchant View. */
export function AnalysisEconomicsCard({ extracted, riskTier, bestSavingsKey }: AnalysisEconomicsCardProps) {
  const economics = useMemo(() => estimateProgramEconomics({
    monthlyVolume: extracted.totalVolume,
    monthlyTransactions: extracted.totalTransactions,
    currentMonthlyCost: extracted.currentMonthlyCost,
    riskTier,
  }), [extracted, riskTier]);

  const bestMargin = useMemo(
    () => economics.reduce((best, e) => (!best || e.margin > best.margin ? e : best), economics[0] ?? null),
    [economics],
  );

  const spreadBps = Math.round((extracted.effectiveRatePct - INTERCHANGE_EST) * 100);

  return (
    <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />
          Delt Economics
        </h2>
        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
          Internal only — hidden in Merchant View
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-5 pr-3 py-2.5">Program</th>
              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Annual Gross Revenue</th>
              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Est. Interchange (@ {INTERCHANGE_EST.toFixed(2)}%)</th>
              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Est. Annual Margin</th>
              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-3 pr-5 py-2.5">Margin (bps of vol.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {economics.map(e => {
              const isBest = bestMargin?.key === e.key;
              return (
                <tr key={e.key} className={isBest ? 'bg-emerald-50/50' : undefined}>
                  <td className="pl-5 pr-3 py-3 text-sm font-medium text-gray-900">
                    {e.name}
                    {isBest && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide">
                        Best margin
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">{fmtWhole(e.grossRevenue)}</td>
                  <td className="px-3 py-3 text-sm text-gray-500 text-right tabular-nums">{fmtWhole(e.interchangeCost)}</td>
                  <td className={`px-3 py-3 text-sm font-bold text-right tabular-nums ${e.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {fmtWhole(e.margin)}
                  </td>
                  <td className="pl-3 pr-5 py-3 text-sm text-gray-700 text-right tabular-nums">{e.marginBps}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-gray-100 space-y-1.5">
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-gray-700">Interchange optimization:</span>{' '}
          merchant currently pays {extracted.effectiveRatePct}% effective vs ~{INTERCHANGE_EST.toFixed(2)}% est. interchange —{' '}
          <span className={`font-semibold ${spreadBps > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>{spreadBps} bps</span> of addressable spread.
          Margin uses the flat {INTERCHANGE_EST.toFixed(2)}% estimate pending the full interchange engine.
        </p>
        {bestMargin && bestSavingsKey && bestMargin.key !== bestSavingsKey && (
          <p className="text-xs text-amber-600">
            Best merchant savings ≠ best Delt margin on this statement — {bestMargin.name} maximizes margin.
          </p>
        )}
      </div>
    </div>
  );
}
