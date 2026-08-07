import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  Users,
  DollarSign,
  Percent,
  TrendingUp,
  Plus,
  Search,
  Eye,
  Edit,
  UserX,
  MoreHorizontal,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  ChevronRight,
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Briefcase,
  Store,
  ArrowRightLeft,
  Star,
  X,
  ChevronDown,
  Upload,
  Info,
  Check,
} from 'lucide-react';
import { EmptyState } from '../EmptyPageState';

// ── Types ──
type AgentStatus = 'Active' | 'Inactive' | 'Probation';
type PipelineStatus = 'New' | 'In Review' | 'Approved' | 'Funded' | 'Declined';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: AgentStatus;
  merchants: number;
  monthlyVolume: number;
  dealsFunded: number;
  commissionEarned: number;
  defaultRate: number;
  lastActivity: string;
  agreementDate: string;
  commissionTier: string;
  initials: string;
  type: 'W-2' | 'Sub-ISO';
}

interface MerchantRow {
  name: string;
  volume: number;
  mcaStatus: string;
  type: string;
}

interface CommissionHistoryRow {
  month: string;
  earned: number;
  deals: number;
  status: string;
  paidDate: string;
}

interface PipelineRow {
  leadName: string;
  status: PipelineStatus;
  amount: number;
  submitted: string;
}

// ── Data ──
// Agents, their books, commission history, and pipeline are not yet backed by
// Supabase tables. Until they are, the roster starts empty rather than being
// populated with invented reps and merchants.
const agents: Agent[] = [];

const merchantPortfolios: Record<string, MerchantRow[]> = {};

const commissionHistories: Record<string, CommissionHistoryRow[]> = {};

const pipelineData: Record<string, PipelineRow[]> = {};

const defaultMerchants: MerchantRow[] = [];

const defaultCommHistory: CommissionHistoryRow[] = [];

const defaultPipeline: PipelineRow[] = [];

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtFull = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

function statusBadge(status: AgentStatus) {
  const map = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Inactive: 'bg-gray-100 text-gray-500 border-gray-200',
    Probation: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return map[status];
}

function mcaStatusBadge(s: string) {
  switch (s) {
    case 'Current': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Delinquent': return 'bg-red-50 text-red-700 border-red-200';
    case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
    default: return 'bg-gray-100 text-gray-500 border-gray-200';
  }
}

function pipelineStatusConfig(s: PipelineStatus) {
  switch (s) {
    case 'New': return { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock };
    case 'In Review': return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock };
    case 'Approved': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle };
    case 'Funded': return { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: CheckCircle };
    case 'Declined': return { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle };
  }
}

function typeBadge(t: string) {
  switch (t) {
    case 'MCA': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Lease': return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'Residual': return 'bg-teal-50 text-teal-700 border-teal-200';
    default: return 'bg-gray-100 text-gray-500 border-gray-200';
  }
}

// ════════════════════════════════════════
// Main Component
// ════════════════════════════════════════
export function BackendAgents() {
  const [agentList, setAgentList] = useState<Agent[]>(agents);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AgentStatus>('All');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  // Stats follow the live list (module seeds + anything onboarded this session)
  const activeAgents = agentList.filter(a => a.status === 'Active').length;
  const totalVolume = agentList.reduce((s, a) => s + a.monthlyVolume, 0);
  const totalCommPaid = agentList.reduce((s, a) => s + a.commissionEarned, 0);
  const activeWithDeals = agentList.filter(a => a.status === 'Active' && a.dealsFunded > 0);
  const avgConversion = activeWithDeals.length > 0
    ? Math.round(activeWithDeals.reduce((s, a) => s + (a.dealsFunded / Math.max(a.merchants, 1)) * 100, 0) / activeWithDeals.length)
    : 0;

  const handleOnboard = (a: { name: string; email: string; phone: string; type: 'W-2' | 'Sub-ISO'; tier: string }) => {
    const created: Agent = {
      id: `AGT-${String(agentList.length + 1).padStart(3, '0')}`,
      name: a.name,
      email: a.email,
      phone: a.phone,
      status: 'Active',
      merchants: 0,
      monthlyVolume: 0,
      dealsFunded: 0,
      commissionEarned: 0,
      defaultRate: 0,
      lastActivity: 'Just now',
      agreementDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      commissionTier: a.tier,
      initials: a.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      type: a.type,
    };
    setAgentList(prev => [created, ...prev]);
    setOnboardOpen(false);
    toast.success(`${created.name} onboarded`, { description: `${created.id} · ${created.commissionTier}` });
  };

  const filtered = agentList.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (selectedAgent) {
    return (
      <AgentDetailView
        agent={selectedAgent}
        onBack={() => setSelectedAgent(null)}
      />
    );
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

      {onboardOpen && <OnboardAgentModal onClose={() => setOnboardOpen(false)} onCreate={handleOnboard} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Users} label="Total Agents" value={String(activeAgents)} sub={`${agentList.length} total, ${agentList.length - activeAgents} inactive/probation`} variant="indigo" />
        <SummaryCard icon={DollarSign} label="Total Agent Volume" value={fmt(totalVolume)} sub="Combined monthly processing" variant="emerald" />
        <SummaryCard icon={TrendingUp} label="Commissions Paid This Month" value={fmt(totalCommPaid)} sub={`Across ${agentList.filter(a => a.commissionEarned > 0).length} agents`} variant="purple" />
        <SummaryCard icon={Percent} label="Avg Agent Conversion Rate" value={`${avgConversion}%`} sub="Active agents with deals" variant="blue" />
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
            {(['All', 'Active', 'Inactive', 'Probation'] as const).map(s => (
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
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Merchants</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Monthly Volume</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Deals Funded</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Commission Earned</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Default Rate</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Last Activity</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(agent => (
                <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                        {agent.initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{agent.name}</p>
                        <p className="text-xs text-gray-500">{agent.id} &middot; {agent.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium border rounded-md ${statusBadge(agent.status)}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{agent.merchants}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmt(agent.monthlyVolume)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{agent.dealsFunded}</td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600">{fmt(agent.commissionEarned)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={agent.defaultRate >= 15 ? 'text-red-600 font-medium' : agent.defaultRate >= 8 ? 'text-amber-600' : 'text-gray-700'}>
                      {agent.defaultRate > 0 ? `${agent.defaultRate}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{agent.lastActivity}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1 relative">
                      <button
                        onClick={() => setSelectedAgent(agent)}
                        className="p-1.5 hover:bg-indigo-50 rounded-md text-gray-400 hover:text-indigo-600 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-red-50 rounded-md text-gray-400 hover:text-red-600 transition-colors"
                        title="Deactivate"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <EmptyState
            icon={Users}
            title={agentList.length === 0 ? 'No agents yet' : 'No matching agents'}
            description={agentList.length === 0
              ? 'Onboard a rep to start tracking their book, commissions, and pipeline.'
              : 'No agents match your search or filter criteria.'}
            compact
          />
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
// Schedule B Tiers & Schedule A Data
// ════════════════════════════════════════
interface ScheduleBTier {
  id: string;
  label: string;
  split: number;
}

const scheduleBTiers: ScheduleBTier[] = [
  { id: 'standard', label: 'Standard', split: 50 },
  { id: 'silver', label: 'Silver', split: 55 },
  { id: 'gold', label: 'Gold', split: 60 },
  { id: 'platinum', label: 'Platinum', split: 65 },
];

interface ScheduleABreakdown {
  qualifiedRate: number;
  midQual: number;
  nonQual: number;
  transactionFee: number;
  monthlyFee: number;
  effectiveRate: number;
}

// Per-merchant Schedule A pricing, keyed by merchant name. Populated from the
// pricing book once merchant records exist; the detail panel falls back to
// "not on file" for any merchant missing an entry.
const merchantScheduleA: Record<string, ScheduleABreakdown> = {};


const DELT_BUY_RATE = 1.55;

// ════════════════════════════════════════
// Agent Detail View
// ════════════════════════════════════════
type DetailTab = 'portfolio' | 'commissions' | 'pipeline';

function AgentDetailView({ agent, onBack }: { agent: Agent; onBack: () => void }) {
  const [tab, setTab] = useState<DetailTab>('portfolio');
  const [showReassignModal, setShowReassignModal] = useState(false);

  // ── Schedule B tier state ──
  const parseTier = (tier: string): { tierId: string; split: number } => {
    const match = tier.match(/(\d+)%/);
    const split = match ? parseInt(match[1]) : 50;
    const found = scheduleBTiers.find(t => t.split === split);
    return { tierId: found?.id || 'custom', split };
  };
  const initial = parseTier(agent.commissionTier);
  const [tierDropdownOpen, setTierDropdownOpen] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState(initial.tierId);
  const [customSplit, setCustomSplit] = useState(initial.split);
  const [tierEffectiveDate] = useState('Apr 9, 2026');
  const [tierSaved, setTierSaved] = useState(false);
  const tierRef = useRef<HTMLDivElement>(null);

  const currentSplit = selectedTierId === 'custom'
    ? customSplit
    : scheduleBTiers.find(t => t.id === selectedTierId)?.split || 50;
  const currentTierLabel = selectedTierId === 'custom'
    ? `Custom — ${currentSplit}% Split`
    : `${scheduleBTiers.find(t => t.id === selectedTierId)?.label} — ${currentSplit}% Split`;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tierRef.current && !tierRef.current.contains(e.target as Node)) setTierDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectTier = (tierId: string) => {
    setSelectedTierId(tierId);
    if (tierId !== 'custom') {
      setCustomSplit(scheduleBTiers.find(t => t.id === tierId)!.split);
      setTierDropdownOpen(false);
      setTierSaved(true);
      setTimeout(() => setTierSaved(false), 2500);
    }
  };
  const saveCustomSplit = () => {
    setTierDropdownOpen(false);
    setTierSaved(true);
    setTimeout(() => setTierSaved(false), 2500);
  };

  // ── Schedule A / rate popover state ──
  const [ratePopover, setRatePopover] = useState<string | null>(null);
  const [uploadedScheduleA, setUploadedScheduleA] = useState<Set<string>>(new Set(['Metro Diner Group', 'Peak Construction Co', 'Bay Area Plumbing', 'Coastal Seafood Inc']));

  const merchants = merchantPortfolios[agent.id] || defaultMerchants;
  const commHistory = commissionHistories[agent.id] || defaultCommHistory;
  const pipeline = pipelineData[agent.id] || defaultPipeline;

  const totalMerchantVolume = merchants.reduce((s, m) => s + m.volume, 0);
  const totalCommissions = commHistory.reduce((s, c) => s + c.earned, 0);
  const pipelineFunded = pipeline.filter(p => p.status === 'Funded').length;
  const pipelineActive = pipeline.filter(p => p.status !== 'Funded' && p.status !== 'Declined').length;

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
            {/* Agent Info */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-700 flex-shrink-0">
                {agent.initials}
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{agent.name}</h1>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium border rounded-md ${statusBadge(agent.status)}`}>
                    {agent.status}
                  </span>
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 rounded-md">
                    {agent.type}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {agent.email}</span>
                  <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {agent.phone}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-2">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Agreement: {agent.agreementDate}</span>

                  {/* ── Inline Schedule B Tier Editor ── */}
                  <div className="relative" ref={tierRef}>
                    <button
                      onClick={() => setTierDropdownOpen(!tierDropdownOpen)}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 -my-0.5 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors group cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-medium text-gray-700 group-hover:text-indigo-700">{currentTierLabel}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-indigo-500" />
                    </button>
                    <span className="ml-1 text-[11px] text-gray-400">Effective {tierEffectiveDate}</span>
                    {tierSaved && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium animate-pulse">
                        <Check className="w-3 h-3" /> Saved
                      </span>
                    )}

                    {tierDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-[8px] shadow-xl z-50">
                        <div className="px-3 py-2.5 border-b border-gray-100">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Schedule B — Agent Split</p>
                        </div>
                        <div className="py-1">
                          {scheduleBTiers.map(tier => (
                            <button
                              key={tier.id}
                              onClick={() => selectTier(tier.id)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${selectedTierId === tier.id ? 'bg-indigo-50' : ''}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-2 h-2 rounded-full ${
                                  tier.id === 'standard' ? 'bg-gray-400' : tier.id === 'silver' ? 'bg-slate-400' : tier.id === 'gold' ? 'bg-amber-500' : 'bg-violet-500'
                                }`} />
                                <span className="font-medium text-gray-900">{tier.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">{tier.split}%</span>
                                {selectedTierId === tier.id && <Check className="w-4 h-4 text-indigo-600" />}
                              </div>
                            </button>
                          ))}
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <button
                              onClick={() => setSelectedTierId('custom')}
                              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${selectedTierId === 'custom' ? 'bg-indigo-50' : ''}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                <span className="font-medium text-gray-900">Custom</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Negotiated</span>
                                {selectedTierId === 'custom' && <Check className="w-4 h-4 text-indigo-600" />}
                              </div>
                            </button>
                            {selectedTierId === 'custom' && (
                              <div className="px-3 pb-3 pt-1">
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="number"
                                      min={1}
                                      max={99}
                                      value={customSplit}
                                      onChange={e => setCustomSplit(Math.min(99, Math.max(1, parseInt(e.target.value) || 0)))}
                                      className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent tabular-nums"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                                  </div>
                                  <button onClick={saveCustomSplit} className="px-3 py-2 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors">
                                    Save
                                  </button>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1.5">Override for negotiated split agreements</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> ID: {agent.id}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-[6px] hover:bg-gray-50 transition-colors">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setShowReassignModal(true)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-[6px] hover:bg-amber-100 transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Reassign Portfolio
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-[6px] hover:bg-red-100 transition-colors">
                <UserX className="w-4 h-4" />
                Deactivate
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="border-t border-gray-200 px-6 py-4 grid grid-cols-2 sm:grid-cols-5 gap-4">
            <QuickStat label="Merchants" value={String(agent.merchants)} />
            <QuickStat label="Monthly Volume" value={fmt(agent.monthlyVolume)} />
            <QuickStat label="Deals Funded" value={String(agent.dealsFunded)} />
            <QuickStat label="This Month" value={fmt(agent.commissionEarned)} highlight />
            <QuickStat label="Default Rate" value={`${agent.defaultRate}%`} danger={agent.defaultRate >= 15} warning={agent.defaultRate >= 8 && agent.defaultRate < 15} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 border-b border-gray-200 flex gap-0">
          {([
            { key: 'portfolio' as const, label: 'Merchant Portfolio', icon: Store },
            { key: 'commissions' as const, label: 'Commission History', icon: DollarSign },
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

        {/* Tab Content */}
        {tab === 'portfolio' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Business Name</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Monthly Volume</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Deal Type</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">MCA Status</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Schedule A Rate</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Delt Spread</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Schedule A</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {merchants.map((m, i) => {
                  const schedA = merchantScheduleA[m.name];
                  const hasDoc = uploadedScheduleA.has(m.name);
                  const spread = schedA ? (schedA.effectiveRate - DELT_BUY_RATE) : null;

                  return (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center">
                            <Store className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <span className="font-medium text-gray-900">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(m.volume)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium border rounded-md ${typeBadge(m.type)}`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium border rounded-md ${mcaStatusBadge(m.mcaStatus)}`}>
                          {m.mcaStatus}
                        </span>
                      </td>

                      {/* Schedule A Rate with popover */}
                      <td className="px-4 py-3 text-right relative">
                        {schedA ? (
                          <div className="relative inline-block">
                            <button
                              onClick={() => setRatePopover(ratePopover === m.name ? null : m.name)}
                              className="inline-flex items-center gap-1 text-gray-900 font-medium tabular-nums hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                              {schedA.effectiveRate.toFixed(2)}%
                              <Info className="w-3 h-3 text-gray-400" />
                            </button>
                            {ratePopover === m.name && (
                              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-[8px] shadow-xl z-50 py-1">
                                <div className="px-3 py-2 border-b border-gray-100">
                                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Rate Breakdown</p>
                                </div>
                                <div className="px-3 py-2 space-y-1.5">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Qualified Rate</span>
                                    <span className="font-medium text-gray-900 tabular-nums">{schedA.qualifiedRate.toFixed(2)}%</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Mid-Qualified</span>
                                    <span className="font-medium text-gray-900 tabular-nums">{schedA.midQual.toFixed(2)}%</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Non-Qualified</span>
                                    <span className="font-medium text-gray-900 tabular-nums">{schedA.nonQual.toFixed(2)}%</span>
                                  </div>
                                  <div className="flex justify-between text-xs border-t border-gray-100 pt-1.5">
                                    <span className="text-gray-500">Transaction Fee</span>
                                    <span className="font-medium text-gray-900 tabular-nums">${schedA.transactionFee.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Monthly Fee</span>
                                    <span className="font-medium text-gray-900 tabular-nums">${schedA.monthlyFee.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs border-t border-gray-100 pt-1.5">
                                    <span className="text-gray-500 font-medium">Effective Rate</span>
                                    <span className="font-bold text-indigo-600 tabular-nums">{schedA.effectiveRate.toFixed(2)}%</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Delt Spread */}
                      <td className="px-4 py-3 text-right">
                        {spread !== null ? (
                          <span className={`font-medium tabular-nums ${spread >= 1.0 ? 'text-emerald-600' : spread >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>
                            {spread.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Upload Schedule A */}
                      <td className="px-4 py-3 text-center">
                        {hasDoc ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            On File
                          </span>
                        ) : (
                          <button
                            onClick={() => setUploadedScheduleA(prev => new Set([...prev, m.name]))}
                            className="p-1.5 hover:bg-indigo-50 rounded-md text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Upload Schedule A"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-4 py-3 font-semibold text-gray-900">Total ({merchants.length} merchants)</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(totalMerchantVolume)}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {tab === 'commissions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Period</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Deals</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Earned</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Paid / Due Date</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commHistory.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.month}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{c.deals}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">{fmtFull(c.earned)}</td>
                    <td className="px-4 py-3 text-center">
                      {c.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.paidDate}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-4 py-3 font-semibold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{commHistory.reduce((s, c) => s + c.deals, 0)}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">{fmtFull(totalCommissions)}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {tab === 'pipeline' && (
          <div>
            {/* Pipeline summary strip */}
            <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-200 flex items-center gap-6 text-xs">
              <span className="text-gray-500">
                <span className="font-semibold text-gray-900">{pipelineActive}</span> active leads
              </span>
              <span className="text-gray-500">
                <span className="font-semibold text-emerald-600">{pipelineFunded}</span> funded
              </span>
              <span className="text-gray-500">
                Total pipeline: <span className="font-semibold text-gray-900">{fmt(pipeline.reduce((s, p) => s + p.amount, 0))}</span>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Lead / Merchant</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pipeline.map((p, i) => {
                    const config = pipelineStatusConfig(p.status);
                    const StatusIcon = config.icon;
                    return (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{p.leadName}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-md ${config.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">{fmt(p.amount)}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{p.submitted}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Reassign Modal */}
      {showReassignModal && (
        <ReassignModal
          agent={agent}
          onClose={() => setShowReassignModal(false)}
        />
      )}
    </div>
  );
}

// ── Quick Stat ──
function QuickStat({ label, value, highlight, danger, warning }: {
  label: string; value: string; highlight?: boolean; danger?: boolean; warning?: boolean;
}) {
  let valColor = 'text-gray-900';
  if (highlight) valColor = 'text-emerald-600';
  if (warning) valColor = 'text-amber-600';
  if (danger) valColor = 'text-red-600';
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${valColor}`}>{value}</p>
    </div>
  );
}

// ── Reassign Portfolio Modal ──
function ReassignModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const [targetAgent, setTargetAgent] = useState('');
  const availableAgents = agents.filter(a => a.id !== agent.id && a.status === 'Active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-[8px] shadow-2xl w-full max-w-md mx-4">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Reassign Portfolio</h2>
            <p className="text-sm text-gray-500 mt-0.5">Transfer {agent.name}'s {agent.merchants} merchants to another agent.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">From Agent</label>
            <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-[6px] text-sm text-gray-700">
              {agent.name} — {agent.merchants} merchants, {fmt(agent.monthlyVolume)} volume
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Transfer To</label>
            <select
              value={targetAgent}
              onChange={e => setTargetAgent(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select an agent...</option>
              {availableAgents.map(a => (
                <option key={a.id} value={a.id}>{a.name} — {a.merchants} merchants</option>
              ))}
            </select>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-[6px] p-3 flex gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              This will reassign all {agent.merchants} merchants and their active deals to the selected agent. Commission history will remain with {agent.name}. This action cannot be easily undone.
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-[6px] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            disabled={!targetAgent}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-[6px] hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Reassign Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Onboard Agent modal ──
function OnboardAgentModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (a: { name: string; email: string; phone: string; type: 'W-2' | 'Sub-ISO'; tier: string }) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'W-2' | 'Sub-ISO'>('W-2');
  const [tier, setTier] = useState('Tier 1 — 50% Split');

  const inputCls =
    'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onCreate({ name: name.trim(), email: email.trim(), phone: phone.trim() || '—', type, tier });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit} className="bg-white rounded-[12px] shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Onboard Agent</h2>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-[8px] text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1">Full name</label>
            <input required autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Jordan Alvarez" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jordan@deltpay.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1">Agent type</label>
              <select value={type} onChange={e => setType(e.target.value as 'W-2' | 'Sub-ISO')} className={inputCls}>
                <option>W-2</option>
                <option>Sub-ISO</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1">Commission tier</label>
              <select value={tier} onChange={e => setTier(e.target.value)} className={inputCls}>
                <option>Tier 1 — 50% Split</option>
                <option>Tier 2 — 60% Split</option>
                <option>Tier 3 — 70% Split</option>
              </select>
            </div>
          </div>
          <p className="text-[11px] text-gray-400">New agents start Active on the selected tier with an empty book. Agreement date is set to today.</p>
        </div>
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-[10px] hover:bg-white">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-[10px] hover:bg-indigo-700">Onboard Agent</button>
        </div>
      </form>
    </div>
  );
}
