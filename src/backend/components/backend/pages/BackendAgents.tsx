import React, { useMemo, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  Users,
  DollarSign,
  Percent,
  TrendingUp,
  Plus,
  Search,
  Eye,
  UserX,
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Store,
  Briefcase,
  Star,
  ChevronDown,
  X,
  Check,
  UserCheck,
} from 'lucide-react';
import { useAgents, agentActions, type AgentRecord } from '../agentsStore';
import { useMerchants, useLeads } from '../crmStore';
import { useDealSubmissions } from '../dealSubmissionsStore';
import { useResiduals } from '../residualsStore';
import { useSession } from '../SessionContext';
import { TIERS } from '../agentComp';

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function statusBadge(status: string) {
  return status === 'active'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-gray-100 text-gray-500 border-gray-200';
}

function statusLabel(status: string) {
  return status === 'active' ? 'Active' : 'Inactive';
}

function initialsOf(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?';
}

function splitLabel(split: number | null): string {
  if (split === null) return 'No split assigned';
  const tier = TIERS.find(t => t.split === split);
  return tier ? tier.label : `Custom — ${Math.round(split * 100)}% Split`;
}

/** 'YYYY-MM' → 'March 2026' */
function periodLabel(period: string): string {
  const [y, m] = period.split('-').map(Number);
  if (!y || !m) return period;
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ════════════════════════════════════════
// Main Component
// ════════════════════════════════════════
export function BackendAgents() {
  const { agents, isLoading } = useAgents();
  const merchants = useMerchants();
  const { rows: residualRows } = useResiduals();
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const session = useSession();

  const latestPeriod = useMemo(
    () => residualRows.reduce((max, r) => (r.period > max ? r.period : max), ''),
    [residualRows],
  );

  // Per-agent live metrics, keyed by agent name (merchants/residuals link by name).
  const metrics = useMemo(() => {
    const map = new Map<string, { merchants: number; volume: number; residual: number }>();
    for (const a of agents) map.set(a.name, { merchants: 0, volume: 0, residual: 0 });
    for (const m of merchants) {
      const entry = map.get(m.agent);
      if (entry) {
        entry.merchants += 1;
        entry.volume += m.monthlyVolume || 0;
      }
    }
    for (const r of residualRows) {
      if (r.period !== latestPeriod) continue;
      const entry = map.get(r.agent);
      if (entry) entry.residual += r.agentShare || 0;
    }
    return map;
  }, [agents, merchants, residualRows, latestPeriod]);

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalVolume = agents.reduce((s, a) => s + (metrics.get(a.name)?.volume || 0), 0);
  const totalResiduals = agents.reduce((s, a) => s + (metrics.get(a.name)?.residual || 0), 0);
  const agentsWithBook = agents.filter(a => (metrics.get(a.name)?.merchants || 0) > 0).length;

  const filtered = agents.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || statusLabel(a.status) === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedAgent = selectedId ? agents.find(a => a.id === selectedId) : null;

  if (selectedAgent) {
    return <AgentDetailView agent={selectedAgent} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 mt-1">Manage your sales team, Sub-ISOs, and agent performance.</p>
        </div>
        <button
          onClick={() => setOnboardOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-[6px] hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Onboard Agent
        </button>
      </div>

      {onboardOpen && (
        <OnboardAgentModal
          orgId={session.org?.id ?? null}
          onClose={() => setOnboardOpen(false)}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Users} label="Active Agents" value={String(activeAgents)} sub={`${agents.length} total on the roster`} variant="indigo" />
        <SummaryCard icon={DollarSign} label="Total Agent Volume" value={fmt(totalVolume)} sub="Combined monthly processing" variant="emerald" />
        <SummaryCard icon={TrendingUp} label={latestPeriod ? `Residuals · ${periodLabel(latestPeriod)}` : 'Residuals'} value={fmt(totalResiduals)} sub={latestPeriod ? 'Agent share, latest report' : 'No residual reports yet'} variant="purple" />
        <SummaryCard icon={Percent} label="Agents With a Book" value={String(agentsWithBook)} sub="Managing at least one merchant" variant="blue" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['All', 'Active', 'Inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-[6px] border transition-colors ${
                  statusFilter === s
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Agent Name</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Split</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Merchants</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Monthly Volume</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">{latestPeriod ? `Residual · ${periodLabel(latestPeriod)}` : 'Residual'}</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(agent => {
                const m = metrics.get(agent.name) || { merchants: 0, volume: 0, residual: 0 };
                return (
                  <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                          {initialsOf(agent.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{agent.name}</p>
                          <p className="text-xs text-gray-500">{agent.email || 'No email on file'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium border rounded-md ${statusBadge(agent.status)}`}>
                        {statusLabel(agent.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{agent.split !== null ? `${Math.round(agent.split * 100)}%` : '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{m.merchants}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(m.volume)}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">{m.residual > 0 ? fmt(m.residual) : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedId(agent.id)}
                          className="p-1.5 hover:bg-indigo-50 rounded-md text-gray-400 hover:text-indigo-600 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {agent.status === 'active' ? (
                          <button
                            onClick={async () => {
                              if (await agentActions.update(agent.id, { status: 'inactive' })) {
                                toast.success(`${agent.name} deactivated`);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-600 transition-colors"
                            title="Deactivate"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              if (await agentActions.update(agent.id, { status: 'active' })) {
                                toast.success(`${agent.name} reactivated`);
                              }
                            }}
                            className="p-1.5 hover:bg-emerald-50 rounded-md text-gray-400 hover:text-emerald-600 transition-colors"
                            title="Reactivate"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            {agents.length === 0
              ? 'No agents yet. Onboard your first agent to get started.'
              : 'No agents match your search or filter criteria.'}
          </div>
        )}
        {isLoading && (
          <div className="px-5 py-12 text-center text-sm text-gray-400">Loading agents…</div>
        )}
      </div>
    </div>
  );
}

// ── Summary Card ──
function SummaryCard({ icon: Icon, label, value, sub, variant }: {
  icon: React.ElementType; label: string; value: string; sub: string;
  variant: 'indigo' | 'emerald' | 'purple' | 'blue';
}) {
  const variantMap = {
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  };
  const v = variantMap[variant];
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
// Agent Detail View — live portfolio, residuals, and pipeline
// ════════════════════════════════════════
type DetailTab = 'portfolio' | 'commissions' | 'pipeline';

function AgentDetailView({ agent, onBack }: { agent: AgentRecord; onBack: () => void }) {
  const [tab, setTab] = useState<DetailTab>('portfolio');
  const merchants = useMerchants();
  const leads = useLeads();
  const { submissions } = useDealSubmissions();
  const { rows: residualRows } = useResiduals();
  const [tierOpen, setTierOpen] = useState(false);

  const book = merchants.filter(m => m.agent === agent.name);
  const agentLeads = leads.filter(l => l.assignedAgent === agent.name && l.status !== 'Won' && l.status !== 'Lost');
  const agentSubmissions = submissions.filter(
    s => s.agentId === agent.id || s.agentName === agent.name,
  );
  const agentResiduals = residualRows.filter(r => r.agent === agent.name);

  // Residual history grouped by period, newest first.
  const residualHistory = useMemo(() => {
    const byPeriod = new Map<string, { earned: number; accounts: number }>();
    for (const r of agentResiduals) {
      const entry = byPeriod.get(r.period) || { earned: 0, accounts: 0 };
      entry.earned += r.agentShare || 0;
      entry.accounts += 1;
      byPeriod.set(r.period, entry);
    }
    return [...byPeriod.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([period, v]) => ({ period, ...v }));
  }, [agentResiduals]);

  const totalVolume = book.reduce((s, m) => s + (m.monthlyVolume || 0), 0);
  const latest = residualHistory[0] ?? null;
  const activated = agentSubmissions.filter(s => s.status === 'Activated' || s.status === 'Paid').length;

  const setSplit = async (split: number | null) => {
    setTierOpen(false);
    if (split === agent.split) return;
    if (await agentActions.update(agent.id, { split })) {
      toast.success('Split updated', { description: splitLabel(split) });
    }
  };

  const joined = agent.createdAt
    ? new Date(agent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Back + Header */}
      <div>
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </button>

        <div className="bg-white rounded-[8px] border border-gray-200">
          <div className="px-6 py-5 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-700 flex-shrink-0">
                {initialsOf(agent.name)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{agent.name}</h1>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium border rounded-md ${statusBadge(agent.status)}`}>
                    {statusLabel(agent.status)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {agent.email || 'No email on file'}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-2">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined: {joined}</span>

                  {/* ── Inline Schedule B split editor (persists to agents.split) ── */}
                  <div className="relative">
                    <button
                      onClick={() => setTierOpen(!tierOpen)}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 -my-0.5 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors group cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-medium text-gray-700 group-hover:text-indigo-700">{splitLabel(agent.split)}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-indigo-500" />
                    </button>

                    {tierOpen && (
                      <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-[8px] shadow-xl z-50">
                        <div className="px-3 py-2.5 border-b border-gray-100">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Schedule B — Agent Split</p>
                        </div>
                        <div className="py-1">
                          {TIERS.map(tier => (
                            <button
                              key={tier.tier}
                              onClick={() => void setSplit(tier.split)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${agent.split === tier.split ? 'bg-indigo-50' : ''}`}
                            >
                              <span className="font-medium text-gray-900">{tier.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">{Math.round(tier.split * 100)}%</span>
                                {agent.split === tier.split && <Check className="w-4 h-4 text-indigo-600" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> ID: {agent.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats — all live */}
          <div className="border-t border-gray-200 px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickStat label="Merchants" value={String(book.length)} />
            <QuickStat label="Monthly Volume" value={fmt(totalVolume)} />
            <QuickStat label="Deals Activated" value={String(activated)} />
            <QuickStat
              label={latest ? `Residual · ${periodLabel(latest.period)}` : 'Residual'}
              value={latest ? fmt(latest.earned) : '—'}
              highlight
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 border-b border-gray-200 flex gap-0">
          {([
            { key: 'portfolio' as const, label: 'Merchant Portfolio', icon: Store },
            { key: 'commissions' as const, label: 'Residual History', icon: DollarSign },
            { key: 'pipeline' as const, label: 'Pipeline', icon: Briefcase },
          ]).map(t => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'portfolio' && (
          book.length === 0 ? (
            <EmptyTab
              icon={Store}
              title="No merchants yet"
              body={`Merchants assigned to ${agent.name} will appear here once a deal boards.`}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Business Name</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Industry</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Monthly Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {book.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center">
                            <Store className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <span className="font-medium text-gray-900">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{m.industry}</td>
                      <td className="px-4 py-3 text-gray-700">{m.status}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(m.monthlyVolume || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'commissions' && (
          residualHistory.length === 0 ? (
            <EmptyTab
              icon={DollarSign}
              title="No residual history"
              body={`${agent.name} has no rows in any imported residual report yet.`}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Period</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Accounts</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Agent Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {residualHistory.map(h => (
                    <tr key={h.period} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{periodLabel(h.period)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{h.accounts}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600">{fmt(h.earned)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'pipeline' && (
          agentLeads.length === 0 && agentSubmissions.length === 0 ? (
            <EmptyTab
              icon={Briefcase}
              title="No open pipeline"
              body={`Leads assigned to ${agent.name} and their submitted deals will appear here.`}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Kind</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Monthly Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {agentSubmissions.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.merchantName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">Deal submission</td>
                      <td className="px-4 py-3 text-gray-700">{s.status}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(s.monthlyVolume || 0)}</td>
                    </tr>
                  ))}
                  {agentLeads.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{l.businessName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">Lead</td>
                      <td className="px-4 py-3 text-gray-700">{l.stage}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{l.monthlySales || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function QuickStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${highlight ? 'text-emerald-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function EmptyTab({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="w-11 h-11 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <p className="mt-3 text-sm font-medium text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{body}</p>
    </div>
  );
}

// ════════════════════════════════════════
// Onboard Agent Modal — persists to public.agents
// ════════════════════════════════════════
function OnboardAgentModal({ orgId, onClose }: { orgId: string | null; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [split, setSplit] = useState<number>(TIERS[0].split);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      toast.error('Agent name is required.');
      return;
    }
    if (!orgId) {
      toast.error('No organization loaded — sign in again and retry.');
      return;
    }
    setSaving(true);
    const created = await agentActions.create({ orgId, name: name.trim(), email: email.trim(), split });
    setSaving(false);
    if (created) {
      toast.success(`${created.name} onboarded`, { description: splitLabel(created.split) });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-[10px] border border-gray-200 shadow-2xl w-full max-w-md mx-4">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Onboard Agent</h2>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Rivera"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Commission tier</label>
            <select
              value={split}
              onChange={e => setSplit(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              {TIERS.map(t => (
                <option key={t.tier} value={t.split}>{t.label}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-400">
            New agents start Active with an empty book. Their name becomes assignable on leads,
            merchants, and deal submissions immediately.
          </p>
        </div>
        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-[6px] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => void submit()}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-[6px] hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Onboard agent'}
          </button>
        </div>
      </div>
    </div>
  );
}
