import React, { useMemo } from 'react';
import { BarChart3, Database, RefreshCw } from 'lucide-react';
import { useMarketing, useMarketingSync, marketingActions } from '../marketingStore';

const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const number = (value: number) => new Intl.NumberFormat('en-US').format(value);

/** Marketing performance is intentionally rendered from connected live data only. */
export function BackendMarketing() {
  const { connections, insights } = useMarketing();
  const { isLoading, isBusy } = useMarketingSync();
  const totals = useMemo(() => insights.reduce(
    (result, row) => ({
      spend: result.spend + row.spend,
      impressions: result.impressions + row.impressions,
      clicks: result.clicks + row.clicks,
      leads: result.leads + row.leads,
    }),
    { spend: 0, impressions: 0, clicks: 0, leads: 0 },
  ), [insights]);

  const hasLiveData = connections.length > 0 && insights.length > 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1360px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Marketing performance</h1>
            <p className="mt-1 text-sm text-gray-500">Connected advertising account results</p>
          </div>
          <button
            onClick={() => marketingActions.refreshInsights()}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-[6px] border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="min-h-[320px] rounded-[8px] border border-gray-200 bg-white flex items-center justify-center text-sm text-gray-400">Loading marketing data…</div>
        ) : hasLiveData ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Spend', value: money(totals.spend) },
                { label: 'Impressions', value: number(totals.impressions) },
                { label: 'Clicks', value: number(totals.clicks) },
                { label: 'Leads', value: number(totals.leads) },
              ].map(metric => (
                <div key={metric.label} className="rounded-[8px] border border-gray-200 bg-white p-5">
                  <p className="text-xs text-gray-500">{metric.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{metric.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[8px] border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Connected accounts</h2>
              <div className="mt-3 space-y-2">
                {connections.map(connection => (
                  <div key={`${connection.provider}-${connection.accountId}`} className="flex items-center justify-between rounded-[6px] bg-gray-50 px-3 py-2 text-sm">
                    <span className="text-gray-700">{connection.accountName || connection.provider}</span>
                    <span className="text-gray-400">{connection.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="min-h-[320px] rounded-[8px] border border-gray-200 bg-white flex flex-col items-center justify-center px-6 text-center">
            <Database className="w-9 h-9 text-gray-300 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900">No marketing data yet</h2>
            <p className="mt-1 max-w-md text-sm text-gray-400">Connect an advertising account and sync it to see live spend, impressions, clicks, and leads.</p>
          </div>
        )}
      </div>
    </div>
  );
}
