import React, { useMemo } from 'react';
import { Trophy, Crown, TrendingUp, Store } from 'lucide-react';
import { useSession } from '../SessionContext';
import { useDealSubmissions } from '../dealSubmissionsStore';
import { useResiduals } from '../residualsStore';
import { fmtUsd } from '../agentComp';

function quarterOf(dateIso: string): string {
  const y = dateIso.slice(0, 4);
  const m = Number(dateIso.slice(5, 7));
  if (!y || !m) return '';
  return `Q${Math.ceil(m / 3)} ${y}`;
}

function currentQuarter(): string {
  return quarterOf(new Date().toISOString());
}

const RANK_STYLES = [
  'bg-amber-50 border-amber-200',
  'bg-gray-50 border-gray-200',
  'bg-orange-50 border-orange-200',
];

export function AgentLeaderboard() {
  const { role, agentName } = useSession();
  const { submissions } = useDealSubmissions();
  const { rows } = useResiduals();

  const quarter = currentQuarter();

  const standings = useMemo(() => {
    const byAgent = new Map<string, { activations: number; residuals: number }>();
    const bump = (agent: string) => {
      if (!agent || agent === 'Unassigned') return null;
      if (!byAgent.has(agent)) byAgent.set(agent, { activations: 0, residuals: 0 });
      return byAgent.get(agent)!;
    };

    for (const s of submissions) {
      if ((s.status === 'Activated' || s.status === 'Paid') && quarterOf(s.updatedAt || s.createdAt) === quarter) {
        const e = bump(s.agentName);
        if (e) e.activations += 1;
      }
    }
    const latestPeriod = [...new Set(rows.map(r => r.period))].sort().reverse()[0];
    if (latestPeriod) {
      for (const r of rows.filter(x => x.period === latestPeriod)) {
        const e = bump(r.agent);
        if (e) e.residuals += r.agentShare;
      }
    }
    return [...byAgent.entries()]
      .map(([agent, v]) => ({ agent, ...v }))
      .sort((a, b) => b.activations - a.activations || b.residuals - a.residuals);
  }, [submissions, rows, quarter]);

  return (
    <div className="px-6 py-6 space-y-6">
      <p className="text-sm text-gray-500">
        {quarter} standings. Top producers join the founding team in Miami for the quarterly
        President's Club dinner.
      </p>

      {standings.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-gray-200 py-16 text-center">
          <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700">The board is open</p>
          <p className="text-xs text-gray-400 mt-1">
            Standings build from activated deals this quarter and the latest residual period. First
            activation takes the crown.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[8px] border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">President's Club — {quarter}</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {standings.map((s, i) => {
              const me = role === 'agent' && s.agent === agentName;
              return (
                <div
                  key={s.agent}
                  className={`flex items-center gap-4 px-5 py-4 ${me ? 'bg-indigo-50/50' : ''}`}
                >
                  <div
                    className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${
                      RANK_STYLES[i] ?? 'bg-white border-gray-200'
                    }`}
                  >
                    {i === 0 ? (
                      <Crown className="w-4 h-4 text-amber-500" />
                    ) : (
                      <span className="text-sm font-bold text-gray-600">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {s.agent}
                      {me && <span className="ml-2 text-[11px] font-medium text-indigo-600">you</span>}
                      {i < 3 && (
                        <span className="ml-2 text-[11px] font-medium text-amber-600">President's Club</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-right shrink-0">
                    <div>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 justify-end"><Store className="w-3 h-3" /> Activations</p>
                      <p className="text-sm font-bold text-gray-900">{s.activations}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 justify-end"><TrendingUp className="w-3 h-3" /> Monthly residuals</p>
                      <p className="text-sm font-bold text-emerald-600">{fmtUsd(s.residuals)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[11px] text-gray-400">
        Activations count deals reaching Activated this quarter; residuals are the latest imported
        period. Rankings refresh as ops processes deals and residual reports.
      </p>
    </div>
  );
}
