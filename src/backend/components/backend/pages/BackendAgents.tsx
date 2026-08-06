import React, { useMemo, useState } from 'react';
import {
  Users,
  DollarSign,
  Store,
  TrendingUp,
  Search,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import { useMerchants, useDeals, useCrmSync, type Merchant } from '../crmStore';
import { useResiduals } from '../residualsStore';
import { useDealSubmissions, SUBMISSION_PIPELINE, type DealSubmission } from '../dealSubmissionsStore';
import { tierForAccounts, TIERS, fmtUsd } from '../agentComp';
import { useAppNavigate } from '../NavigationContext';

/**
 * Agent roster.
 *
 * There is a `public.agents` table but no client code reads it yet, so the
 * roster is derived the same way AgentLeaderboard derives standings: the union
 * of agent names that actually appear on merchants, residual rows and deal
 * submissions. Everything shown traces back to one of those three.
 *
 * Deliberately absent, because nothing sources them: email, phone, agreement
 * date, W-2 vs Sub-ISO, default rate, and a Probation status (the table only
 * has active/inactive). Onboarding an agent needs a write path to
 * public.agents; until then there is no Create button, because the previous
 * one discarded everything it collected.
 */

interface AgentSummary {
  name: string;
  merchants: number;
  monthlyVolume: number;
  activations: number;
  residualShare: number;
  tierLabel: string;
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const UNASSIGNED = 'Unassigned';

export function BackendAgents() {
  const merchants = useMerchants();
  const deals = useDeals();
  const { isLoading: crmLoading } = useCrmSync();
  const { rows, isLoading: resLoading } = useResiduals();
  const { submissions, isLoading: subLoading } = useDealSubmissions();

  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const latestPeriod = useMemo(
    () => [...new Set(rows.map(r => r.period))].sort().reverse()[0],
    [rows],
  );

  const agents = useMemo<AgentSummary[]>(() => {
    const names = new Set<string>();
    for (const m of merchants) if (m.agent && m.agent !== UNASSIGNED) names.add(m.agent);
    for (const r of rows) if (r.agent && r.agent !== UNASSIGNED) names.add(r.agent);
    for (const s of submissions) if (s.agentName && s.agentName !== UNASSIGNED) names.add(s.agentName);

    return [...names].map(name => {
      const own = merchants.filter(m => m.agent === name);
      const residualShare = latestPeriod
        ? rows.filter(r => r.period === latestPeriod && r.agent === name).reduce((s, r) => s + r.agentShare, 0)
        : 0;
      return {
        name,
        merchants: own.length,
        monthlyVolume: own.reduce((s, m) => s + m.monthlyVolume, 0),
        activations: submissions.filter(s => s.agentName === name && (s.status === 'Activated' || s.status === 'Paid')).length,
        residualShare,
        tierLabel: tierForAccounts(own.length).label,
      };
    }).sort((a, b) => b.monthlyVolume - a.monthlyVolume);
  }, [merchants, rows, submissions, latestPeriod]);

  const filtered = useMemo(
    () => agents.filter(a => a.name.toLowerCase().includes(search.toLowerCase())),
    [agents, search],
  );

  const loading = crmLoading || resLoading || subLoading;

  if (selected) {
    return (
      <AgentDetailView
        name={selected}
        merchants={merchants.filter(m => m.agent === selected)}
        deals={deals}
        residualRows={rows.filter(r => r.agent === selected)}
        submissions={submissions.filter(s => s.agentName === selected)}
        onBack={() => setSelected(null)}
      />
    );
  }

  const totalVolume = agents.reduce((s, a) => s + a.monthlyVolume, 0);
  const totalResidualShare = agents.reduce((s, a) => s + a.residualShare, 0);

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <p className="text-sm text-gray-500 mt-1">
          Agents with activity on merchants, residuals or submitted deals.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Users} label="Agents" value={String(agents.length)} sub="With at least one account or deal" variant="indigo" />
        <SummaryCard icon={Store} label="Merchants Assigned" value={String(merchants.filter(m => m.agent !== UNASSIGNED).length)} sub={`${merchants.filter(m => m.agent === UNASSIGNED).length} unassigned`} variant="blue" />
        <SummaryCard icon={TrendingUp} label="Monthly Volume" value={fmt(totalVolume)} sub="Across assigned merchants" variant="emerald" />
        <SummaryCard
          icon={DollarSign}
          label="Residual Share"
          value={fmt(totalResidualShare)}
          sub={latestPeriod ? `Agent share — ${latestPeriod}` : 'No residual periods imported'}
          variant="purple"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-900 flex-1">Agent Roster</h2>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            {loading
              ? 'Loading…'
              : agents.length === 0
                ? 'No agents yet — an agent appears here once a merchant, residual row or submitted deal carries their name.'
                : 'No agents match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Agent</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Merchants</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Monthly Volume</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Deals Activated</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">
                    Residual Share{latestPeriod ? ` — ${latestPeriod}` : ''}
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Residual Tier</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(a => (
                  <tr key={a.name} onClick={() => setSelected(a.name)} className="transition-colors cursor-pointer hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{a.merchants}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(a.monthlyVolume)}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{a.activations}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtUsd(a.residualShare)}</td>
                    <td className="px-4 py-3 text-gray-700">{a.tierLabel}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelected(a.name)}
                          className="p-1.5 hover:bg-indigo-50 rounded-md text-gray-400 hover:text-indigo-600 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Residual tier ladder — the real comp program */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Residual Tier Ladder</h2>
          <p className="text-xs text-gray-500 mt-0.5">Split percentage by active-account count, per the agent comp plan.</p>
        </div>
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TIERS.map(t => (
            <div key={t.tier} className="border border-gray-200 rounded-[8px] p-4">
              <p className="text-sm font-semibold text-gray-900">{t.label}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t.minAccounts === 0 ? 'Starting tier' : `${t.minAccounts}+ active accounts`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Summary Card ──
function SummaryCard({ icon: Icon, label, value, sub, variant }: {
  icon: React.ElementType; label: string; value: string; sub: string;
  variant: 'indigo' | 'emerald' | 'blue' | 'purple';
}) {
  const map = {
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
  };
  const v = map[variant];
  return (
    <div className="bg-white rounded-[8px] border border-gray-200 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{label}</p>
        <div className={`w-9 h-9 ${v.bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${v.icon}`} />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs mt-2 text-gray-500">{sub}</p>
    </div>
  );
}

// ════════════════════════════════════════
// Agent Detail View
// ════════════════════════════════════════
type DetailTab = 'portfolio' | 'residuals' | 'pipeline';

function AgentDetailView({ name, merchants, deals, residualRows, submissions, onBack }: {
  name: string;
  merchants: Merchant[];
  deals: ReturnType<typeof useDeals>;
  residualRows: ReturnType<typeof useResiduals>['rows'];
  submissions: DealSubmission[];
  onBack: () => void;
}) {
  const { navigate } = useAppNavigate();
  const [tab, setTab] = useState<DetailTab>('portfolio');

  // Residual share by period — the closest thing to a commission history that
  // has a real source. There is no payout table, so no paid/pending status.
  const byPeriod = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of residualRows) m.set(r.period, (m.get(r.period) ?? 0) + r.agentShare);
    return [...m.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [residualRows]);

  const tier = tierForAccounts(merchants.length);

  const tabs: { key: DetailTab; label: string; count: number }[] = [
    { key: 'portfolio', label: 'Portfolio', count: merchants.length },
    { key: 'residuals', label: 'Residuals', count: byPeriod.length },
    { key: 'pipeline', label: 'Pipeline', count: submissions.length },
  ];

  return (
    <div className="px-6 py-6 space-y-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to agents
      </button>

      <div className="bg-white rounded-[8px] border border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-gray-600">
          <span>{merchants.length} merchant{merchants.length === 1 ? '' : 's'}</span>
          <span>{fmt(merchants.reduce((s, m) => s + m.monthlyVolume, 0))} monthly volume</span>
          <span>{tier.label}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[8px] border border-gray-200 overflow-x-auto">
        {tab === 'portfolio' && (
          merchants.length === 0 ? (
            <Empty text="No merchants assigned to this agent yet." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Merchant</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Monthly Volume</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Capital</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {merchants.map(m => {
                  const deal = deals.find(d => d.borrower === m.name);
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(m.monthlyVolume)}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{m.status}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{deal ? deal.status : '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/merchants/${m.id}`)}
                          className="p-1.5 hover:bg-indigo-50 rounded-md text-gray-400 hover:text-indigo-600 transition-colors"
                          title="View merchant"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}

        {tab === 'residuals' && (
          byPeriod.length === 0 ? (
            <Empty text="No residual rows for this agent — they appear once a processor report covering their accounts is imported." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Period</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Agent Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {byPeriod.map(([period, share]) => (
                  <tr key={period} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-900">{period}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtUsd(share)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {tab === 'pipeline' && (
          submissions.length === 0 ? (
            <Empty text="No deals submitted by this agent yet." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Merchant</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Monthly Volume</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.merchantName}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(s.monthlyVolume)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium border rounded-md ${
                        s.status === 'Declined'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : SUBMISSION_PIPELINE.indexOf(s.status) >= 3
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="px-5 py-12 text-center text-sm text-gray-500">{text}</div>;
}
