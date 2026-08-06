import React, { useMemo, useState } from 'react';
import {
  Users,
  DollarSign,
  Search,
  Eye,
  Globe,
  CheckCircle,
  CreditCard,
  BarChart3,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useMerchants, useCrmSync, type Merchant, type PlanTier } from '../crmStore';
import { useAppNavigate } from '../NavigationContext';

type TopTab = 'plans' | 'iso';

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** "Jan 2025" from an ISO timestamp; blank when the row predates created_at. */
const memberSince = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// ── Helpers ──
function planBadge(plan: PlanTier) {
  switch (plan) {
    case 'Free': return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'Growth': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Custom': return 'bg-purple-50 text-purple-700 border-purple-200';
  }
}

// ════════════════════════════════════════
// Main Component
// ════════════════════════════════════════
export function BackendSubscriptions() {
  const merchants = useMerchants();
  const { isLoading } = useCrmSync();
  const { navigate } = useAppNavigate();

  const [topTab, setTopTab] = useState<TopTab>('plans');
  const [planFilter, setPlanFilter] = useState<'All' | PlanTier>('All');
  const [agentFilter, setAgentFilter] = useState('All Agents');
  const [search, setSearch] = useState('');

  const agentOptions = useMemo(
    () => ['All Agents', ...Array.from(new Set(merchants.map(m => m.agent))).sort()],
    [merchants],
  );

  const filtered = useMemo(() => merchants.filter(m => {
    const matchPlan = planFilter === 'All' || m.plan === planFilter;
    const matchAgent = agentFilter === 'All Agents' || m.agent === agentFilter;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchPlan && matchAgent && matchSearch;
  }), [merchants, planFilter, agentFilter, search]);

  // ── Stats, all derived from real merchant rows ──
  const total = merchants.length;
  const paid = merchants.filter(m => m.monthlyFee > 0);
  const freeCount = merchants.filter(m => m.plan === 'Free').length;
  const growthCount = merchants.filter(m => m.plan === 'Growth').length;
  const customCount = merchants.filter(m => m.plan === 'Custom').length;
  const monthlyRevenue = merchants.reduce((sum, m) => sum + m.monthlyFee, 0);
  const avgRevenue = total > 0 ? Math.round(monthlyRevenue / total) : 0;
  const paidVolume = paid.reduce((sum, m) => sum + m.monthlyVolume, 0);

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Top Tab Bar */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {([
            { key: 'plans' as const, label: 'Merchant Plans' },
            { key: 'iso' as const, label: 'ISO Tenants' },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTopTab(t.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                topTab === t.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {topTab === 'iso' ? (
        <ISOTenantsPlaceholder />
      ) : (
        <>
          {/* Header */}
          <div>
            <p className="text-sm text-gray-500 mt-1">Track plan tiers and subscription revenue across all merchants.</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard icon={Users} label="Total Merchants" value={String(total)} sub={`${paid.length} paid, ${freeCount} free`} variant="indigo" />
            <SummaryCard icon={DollarSign} label="Monthly Subscription Revenue" value={fmt(monthlyRevenue)} sub={`${paid.length} paying merchants`} variant="emerald" />
            <SummaryCard icon={CreditCard} label="Avg Revenue Per Merchant" value={fmt(avgRevenue)} sub="Across all merchants" variant="blue" />
            <SummaryCard icon={BarChart3} label="Volume on Paid Plans" value={fmt(paidVolume)} sub="Monthly processing volume" variant="purple" />
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-[8px] border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200 flex flex-col xl:flex-row xl:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search merchants..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Plan Tier filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-medium">Plan:</span>
                  {(['All', 'Free', 'Growth', 'Custom'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setPlanFilter(p)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-[6px] border transition-colors ${
                        planFilter === p
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="hidden xl:block w-px h-6 bg-gray-200" />

                {/* Agent dropdown */}
                <div className="relative">
                  <select
                    value={agentFilter}
                    onChange={e => setAgentFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium border border-gray-200 rounded-[6px] bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                  >
                    {agentOptions.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Merchant Name</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Plan Tier</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Monthly Fee</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Monthly Volume</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Website</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Capital</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Member Since</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(m => (
                    <tr key={m.id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{m.name}</p>
                          <p className="text-xs text-gray-500">{m.agent}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium border rounded-md ${planBadge(m.plan)}`}>
                          {m.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {m.monthlyFee === 0 ? <span className="text-gray-400">Free</span> : `$${m.monthlyFee}`}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(m.monthlyVolume)}</td>
                      <td className="px-4 py-3 text-center">
                        {m.products.website ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-md bg-emerald-50 text-emerald-700 border-emerald-200">
                            <Globe className="w-3 h-3" />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 text-xs font-medium border rounded-md bg-gray-100 text-gray-500 border-gray-200">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {m.products.capital ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-50 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{memberSince(m.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/merchants/${m.id}`)}
                            className="p-1.5 hover:bg-indigo-50 rounded-md text-gray-400 hover:text-indigo-600 transition-colors"
                            title="View merchant"
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

            {filtered.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-gray-500">
                {isLoading
                  ? 'Loading…'
                  : merchants.length === 0
                    ? 'No merchants yet — plan tiers and subscription revenue appear here once merchants are boarded.'
                    : 'No merchants match your current filters.'}
              </div>
            )}
          </div>

          {/* Plan Distribution */}
          {total > 0 && (
            <PlanDistribution starter={freeCount} growth={growthCount} intelligence={customCount} total={total} />
          )}
        </>
      )}
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

// ── Plan Distribution Visualization ──
function PlanDistribution({ starter, growth, intelligence, total }: {
  starter: number; growth: number; intelligence: number; total: number;
}) {
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const plans = [
    { name: 'Free', price: 'Free', count: starter, pct: pct(starter), badgeColor: 'bg-gray-100 text-gray-600', barTrack: 'bg-gray-100', barFill: 'bg-gray-400' },
    { name: 'Growth', price: '$99/mo', count: growth, pct: pct(growth), badgeColor: 'bg-blue-50 text-blue-700', barTrack: 'bg-blue-100', barFill: 'bg-blue-500' },
    { name: 'Custom', price: 'Custom', count: intelligence, pct: pct(intelligence), badgeColor: 'bg-purple-50 text-purple-700', barTrack: 'bg-purple-100', barFill: 'bg-purple-500' },
  ];

  return (
    <div className="bg-white rounded-[8px] border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Plan Distribution</h3>
        <p className="text-xs text-gray-500 mt-0.5">{total} total merchants across all plan tiers</p>
      </div>

      {/* Stacked bar overview */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex h-3 rounded-full overflow-hidden">
          {plans.map(p => (
            <div
              key={p.name}
              className={`${p.barFill} transition-all`}
              style={{ width: `${p.pct}%` }}
            />
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="px-5 pb-5 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map(p => (
          <div key={p.name} className="border border-gray-200 rounded-[8px] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md ${p.badgeColor}`}>
                {p.name}
              </span>
              <span className="text-xs text-gray-500">{p.price}</span>
            </div>
            <div className="flex items-end justify-between mb-3">
              <p className="text-3xl font-bold text-gray-900">{p.count}</p>
              <p className="text-sm text-gray-500">{p.pct}%</p>
            </div>
            <div className={`h-2 rounded-full ${p.barTrack}`}>
              <div
                className={`h-2 rounded-full ${p.barFill} transition-all`}
                style={{ width: `${p.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ISO Tenants ──
// Multi-tenant ISO licensing has no backing tables: `orgs` covers only branding
// for the current tenant, and there is no source for tier, override, commission
// or per-tenant revenue. The tab stays visible as a known gap rather than
// reporting invented tenant economics.
function ISOTenantsPlaceholder() {
  return (
    <div className="bg-white rounded-[8px] border border-gray-200 px-6 py-16 text-center">
      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Building2 className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1.5">No ISO tenants yet</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto">
        Multi-tenant ISO licensing isn't wired up yet. Tenant revenue, agent counts and
        white-label settings appear here once ISO orgs are onboarded.
      </p>
    </div>
  );
}
