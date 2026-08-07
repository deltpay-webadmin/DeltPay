import React, { useState, useMemo, useCallback } from 'react';
import {
  ShieldCheck, ShieldAlert, FileText, Search, BookOpen,
  ChevronDown, ChevronRight, CheckCircle, XCircle, MinusCircle,
  AlertTriangle, Clock, Eye, ExternalLink, Gavel,
  Building2, CreditCard, ScrollText, FolderOpen, Scale,
  ClipboardCheck, Landmark, X,
  Info, Lock, FileCheck, Calendar,
  ArrowRight, Bell, Flame, TrendingUp, TrendingDown,
  ListChecks, Timer, UserCheck, Flag,
  Hash, MapPin, Stamp, Download,
  Zap, ChevronUp,
  RotateCcw, Sparkles, Target, Layers,
  BadgeCheck, Briefcase, ArrowUpRight, Filter,
  CircleDot, Play, GitBranch, Ban, Fingerprint,
  ScanLine, FileWarning, Server, Shield,
  Activity, Users, DollarSign, Store,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════
   CONTROL STATUS RIBBON — universal visual language
   ═══════════════════════════════════════════════════ */

type ControlStatus = 'green' | 'yellow' | 'red' | 'gray';

interface Control {
  key: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const CONTROLS: Control[] = [
  { key: 'kyc', label: 'KYC / AML', shortLabel: 'KYC', icon: Fingerprint },
  { key: 'ofac', label: 'OFAC Screening', shortLabel: 'OFAC', icon: ScanLine },
  { key: 'disclosures', label: 'Disclosures', shortLabel: 'Disc', icon: FileText },
  { key: 'contract', label: 'Contract', shortLabel: 'Contract', icon: ScrollText },
  { key: 'pci', label: 'PCI DSS', shortLabel: 'PCI', icon: Lock },
  { key: 'match', label: 'MATCH / TMF', shortLabel: 'MATCH', icon: ShieldAlert },
  { key: 'registrations', label: 'Registrations', shortLabel: 'Reg', icon: FileCheck },
  { key: 'vendor', label: 'Vendor / Policy', shortLabel: 'Vendor', icon: Building2 },
];

interface ControlState {
  status: ControlStatus;
  rule: string;
  currentStatus: string;
  missingProof: string;
  nextAction: string;
  lastCompleted: string;
}

const statusColors: Record<ControlStatus, { bg: string; border: string; text: string; dot: string; label: string }> = {
  green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Compliant' },
  yellow: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Action Needed' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', label: 'Blocked' },
  gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-400', dot: 'bg-gray-300', label: 'Not Assessed' },
};

function ControlRibbon({ controls, onControlClick, activeControl }: {
  controls: Record<string, ControlState>;
  onControlClick: (key: string) => void;
  activeControl: string | null;
}) {
  return (
    <div className="flex gap-1">
      {CONTROLS.map(c => {
        const state = controls[c.key];
        const s = state ? statusColors[state.status] : statusColors.gray;
        const Icon = c.icon;
        const isActive = activeControl === c.key;
        return (
          <button key={c.key} onClick={() => onControlClick(c.key)} title={c.label}
            className={`flex items-center gap-1 px-2 py-1 rounded-[4px] text-[10px] font-semibold transition-all border ${
              isActive ? `${s.bg} ${s.border} ${s.text} ring-1 ring-offset-1 ring-current` : `bg-white border-gray-200 hover:${s.bg}`
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            <span className={isActive ? s.text : 'text-gray-600'}>{c.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

function ControlDetail({ controlKey, state, onClose }: {
  controlKey: string;
  state: ControlState;
  onClose: () => void;
}) {
  const ctrl = CONTROLS.find(c => c.key === controlKey)!;
  const s = statusColors[state.status];
  const Icon = ctrl.icon;
  return (
    <div className={`rounded-[8px] border ${s.border} ${s.bg} p-4 mt-2 relative`}>
      <button onClick={onClose} className="absolute top-3 right-3 p-1 hover:bg-white/50 rounded"><X className="w-3.5 h-3.5 text-gray-400" /></button>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${s.text}`} />
        <h4 className="text-sm font-bold text-gray-900">{ctrl.label}</h4>
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${s.bg} ${s.text} border ${s.border}`}>{s.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><p className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Rule</p><p className="text-xs text-gray-700 leading-relaxed">{state.rule}</p></div>
        <div><p className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Current Status</p><p className="text-xs text-gray-700 leading-relaxed">{state.currentStatus}</p></div>
        <div><p className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Missing Proof</p><p className="text-xs text-gray-700 leading-relaxed">{state.missingProof || 'None \u2014 all evidence on file'}</p></div>
        <div><p className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Next Action</p><p className="text-xs text-gray-700 leading-relaxed">{state.nextAction}</p></div>
      </div>
      <div className="mt-3 pt-2 border-t border-gray-200/50 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">Last completed: {state.lastCompleted}</span>
        <button className="text-[10px] font-semibold text-brand hover:underline flex items-center gap-1">View full history <ArrowRight className="w-3 h-3" /></button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DATA — Regulatory reference
   ═══════════════════════════════════════════════════ */

interface PciSection {
  title: string;
  subtitle: string;
  items: { item: string; type: string; detail: string }[];
}

interface StateRule {
  st: string;
  name: string;
  status: 'enforced' | 'pending';
  law: string;
  threshold: string;
  aprReq: boolean;
  regReq: boolean;
  regBody: string;
  contractMod: boolean;
  contractNote?: string;
  disclosureItems: string[];
  notes: string;
  cofRestriction: string;
  forumRestriction: string;
}

interface VendorObligation {
  id: string;
  name: string;
  role: string;
  color: string;
  obligations: { item: string; type: string; detail: string }[];
}

interface HealthFactor {
  id: string;
  title: string;
  safe: string;
  mid: string;
  risk: string;
  detail: string;
  caselaw: string;
}

interface DocumentCategory {
  cat: string;
  icon: React.ElementType;
  docs: string[];
}

interface ResearchItem {
  topic: string;
  icon: React.ElementType;
  sources: string[];
}

const PCI: PciSection[] = [];

const STATES: StateRule[] = [];

const VENDORS: VendorObligation[] = [];

const HEALTH_FACTORS: HealthFactor[] = [];

const DOC_CATEGORIES: DocumentCategory[] = [];

const RESEARCH: ResearchItem[] = [];

/* ═══════════════════════════════════════════════════
   DATA — Merchants, deals, and events
   ═══════════════════════════════════════════════════ */

interface Merchant {
  id: string; name: string; state: string; type: 'mca' | 'processing' | 'both';
  activeDeals: number; monthlyVolume: string; riskScore: number;
  controls: Record<string, ControlState>;
}

const MERCHANTS: Merchant[] = [];

interface Deal {
  id: string; merchantId: string; merchant: string; state: string;
  amount: string; factorRate: string; stage: string; agent: string; date: string;
  blocked: boolean; blockReason: string;
  controls: Record<string, ControlState>;
}

const DEALS: Deal[] = [];

interface Deadline {
  id: string; date: string; dateShort: string; title: string; category: string;
  severity: 'critical' | 'warning' | 'info'; daysLeft: number;
}

const DEADLINES: Deadline[] = [];

interface RiskCategory {
  label: string; icon: React.ElementType; current: string; threshold: string;
  pct: number; trend: 'up' | 'down' | 'flat'; status: 'green' | 'yellow' | 'red';
}

const RISK_CATEGORIES: RiskCategory[] = [];

interface ChangeEvent {
  id: string; date: string; type: 'regulatory' | 'network' | 'vendor';
  title: string; impact: string; taskCreated: boolean;
}

const CHANGES: ChangeEvent[] = [];

interface EvidenceRecord {
  id: string; date: string; merchant: string; dealId?: string;
  control: string; type: string; detail: string; exportable: boolean;
}

const EVIDENCE: EvidenceRecord[] = [];

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

type TagType = 'deadline' | 'alert' | 'compliance' | 'track' | 'audit' | 'generate';
const tagCfg: Record<string, { bg: string; text: string }> = {
  deadline: { bg: 'bg-red-50', text: 'text-red-700' },
  alert: { bg: 'bg-amber-50', text: 'text-amber-700' },
  compliance: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
  track: { bg: 'bg-gray-100', text: 'text-gray-600' },
  audit: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  generate: { bg: 'bg-indigo-50', text: 'text-brand' },
};

function Tag({ type }: { type: string }) {
  const c = tagCfg[type] || tagCfg.track;
  return <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${c.bg} ${c.text} whitespace-nowrap`}>{type}</span>;
}

type Tab = 'today' | 'pipeline' | 'merchants' | 'monitoring' | 'audit' | 'rules';

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */

export function BackendCompliance() {
  const [tab, setTab] = useState<Tab>('today');
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [activeControl, setActiveControl] = useState<string | null>(null);
  const [healthState, setHealthState] = useState<Record<string, string>>({});
  const [expandedState, setExpandedState] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<'all' | 'enforced' | 'pending'>('all');
  const [rulesTab, setRulesTab] = useState<'states' | 'networks' | 'contracts' | 'vendors' | 'caselaw'>('states');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditControl, setAuditControl] = useState<string | null>(null);
  const [deadlineFilter, setDeadlineFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [monitoringView, setMonitoringView] = useState<'deadlines' | 'thresholds' | 'changes'>('deadlines');

  const toggleControl = useCallback((key: string) => {
    setActiveControl(prev => prev === key ? null : key);
  }, []);

  // Computed
  const dealsBlocked = DEALS.filter(d => d.blocked).length;
  const merchantsBlocked = MERCHANTS.filter(m => Object.values(m.controls).some(c => c.status === 'red')).length;
  const obligationsDue7d = DEADLINES.filter(d => d.daysLeft <= 7).length;
  const highRiskCount = RISK_CATEGORIES.filter(r => r.status === 'red' || r.status === 'yellow').length;

  const filteredStates = stateFilter === 'all' ? STATES : STATES.filter(s => s.status === stateFilter);

  const hAssessed = Object.keys(healthState).length;
  const hRisk = Object.values(healthState).filter(v => v === 'risk').length;
  const hSafe = Object.values(healthState).filter(v => v === 'safe').length;
  const hMid = Object.values(healthState).filter(v => v === 'mid').length;
  const hLevel = hAssessed < 3 ? '\u2014' : hRisk >= 3 ? 'High risk' : (hRisk >= 2 || (hRisk >= 1 && hMid >= 2)) ? 'Elevated' : 'Defensible';
  const hColor = hLevel.includes('High') ? 'text-red-700' : hLevel === 'Elevated' ? 'text-amber-700' : hLevel === 'Defensible' ? 'text-emerald-700' : 'text-gray-400';

  const filteredEvidence = EVIDENCE.filter(e => {
    if (auditControl && e.control !== auditControl) return false;
    if (auditSearch && !e.merchant.toLowerCase().includes(auditSearch.toLowerCase()) && !e.type.toLowerCase().includes(auditSearch.toLowerCase()) && !e.detail.toLowerCase().includes(auditSearch.toLowerCase())) return false;
    return true;
  });

  const filteredDeadlines = deadlineFilter === 'all' ? DEADLINES : DEADLINES.filter(d => d.severity === deadlineFilter);

  const activeMerchant = MERCHANTS.find(m => m.id === selectedMerchant);
  const activeDeal = DEALS.find(d => d.id === selectedDeal);
  const hasDealData = DEALS.length > 0;
  const hasMerchantData = MERCHANTS.length > 0;
  const hasDeadlineData = DEADLINES.length > 0;
  const hasRiskData = RISK_CATEGORIES.length > 0;

  const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { id: 'today', label: 'Today', icon: Target, badge: dealsBlocked + obligationsDue7d > 0 ? dealsBlocked + obligationsDue7d : undefined, badgeColor: 'bg-red-500 text-white' },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'merchants', label: 'Merchants', icon: Store },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'audit', label: 'Audit', icon: BadgeCheck },
    { id: 'rules', label: 'Rules', icon: BookOpen },
  ];

  return (
    <div className="px-6 py-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">System of record, action, and intelligence</p>
          </div>
        </div>
      </div>

      {/* ── Tab Bar — shared underline style ── */}
      <div>
        <div className="border-b border-gray-200 flex gap-6 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); setActiveControl(null); setSelectedMerchant(null); setSelectedDeal(null); }}
                className={`flex items-center gap-1.5 px-1 pb-3 -mb-px text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {t.badge !== undefined && (
                  <span className={`ml-1 min-w-[18px] h-[18px] flex items-center justify-center text-[9px] font-bold rounded-full px-1 ${t.badgeColor || 'bg-gray-100 text-gray-500'}`}>{t.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-5">

          {/* ═══════════════════════════════
              TODAY — personalized triage
              ═══════════════════════════════ */}
          {tab === 'today' && (
            <div className="space-y-5">
              {/* Top row: 4 KPIs */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Deals blocked from funding', value: dealsBlocked, color: dealsBlocked > 0 ? 'border-t-red-500' : 'border-t-emerald-500', icon: Ban, sub: hasDealData ? (dealsBlocked > 0 ? DEALS.filter(d => d.blocked).map(d => d.merchant).join(', ') : 'No blocks') : 'No deal data yet' },
                  { label: 'Merchants blocked from boarding', value: merchantsBlocked, color: merchantsBlocked > 0 ? 'border-t-red-500' : 'border-t-emerald-500', icon: Store, sub: hasMerchantData ? (merchantsBlocked > 0 ? MERCHANTS.filter(m => Object.values(m.controls).some(c => c.status === 'red')).map(m => m.name).join(', ') : 'No blocks') : 'No merchant data yet' },
                  { label: 'Obligations due in 7 days', value: obligationsDue7d, color: obligationsDue7d > 0 ? 'border-t-amber-500' : 'border-t-emerald-500', icon: Clock, sub: hasDeadlineData ? `${DEADLINES.filter(d => d.daysLeft <= 0).length} overdue, ${DEADLINES.filter(d => d.daysLeft > 0 && d.daysLeft <= 7).length} upcoming` : 'No deadline data yet' },
                  { label: 'High-risk trends', value: highRiskCount, color: highRiskCount > 0 ? 'border-t-amber-500' : 'border-t-emerald-500', icon: TrendingUp, sub: hasRiskData ? (RISK_CATEGORIES.filter(r => r.status !== 'green').map(r => r.label).slice(0, 3).join(', ') || 'No high-risk trends') : 'No risk data yet' },
                ].map((k, i) => {
                  const Icon = k.icon;
                  return (
                    <div key={i} className={`bg-white rounded-[8px] border border-gray-200 border-t-[3px] ${k.color} p-4`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">{k.label}</span>
                      </div>
                      <p className={`text-2xl font-bold ${k.value > 0 ? 'text-gray-900' : 'text-emerald-600'}`}>{k.value}</p>
                      <p className="text-[10px] text-gray-400 mt-1 truncate">{k.sub}</p>
                    </div>
                  );
                })}
              </div>

              {/* Middle: Needs action + Deadlines */}
              <div className="grid grid-cols-2 gap-5">
                {/* Needs action now */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-bold text-gray-900">Needs action now</h3>
                  </div>
                  <div className="space-y-1.5">
                    {DEADLINES.filter(d => d.daysLeft <= 7).slice(0, 10).map((item, i) => {
                      const sevColors = { critical: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-blue-400' };
                      return (
                        <div key={item.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-[6px] border transition-colors ${
                          item.daysLeft <= 0 ? 'bg-red-50/50 border-red-200' : item.daysLeft <= 2 ? 'bg-amber-50/30 border-amber-200' : 'bg-white border-gray-100 hover:border-gray-200'
                        }`}>
                          <span className="text-sm font-bold text-gray-900 w-5 text-right">{i + 1}</span>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sevColors[item.severity]}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{item.title}</p>
                            <p className="text-[10px] text-gray-400">{item.category}</p>
                          </div>
                          <span className={`text-[10px] font-mono font-bold shrink-0 ${
                            item.daysLeft <= 0 ? 'text-red-600' : item.daysLeft <= 2 ? 'text-amber-600' : 'text-gray-500'
                          }`}>{item.daysLeft <= 0 ? 'TODAY' : `${item.daysLeft}d`}</span>
                        </div>
                      );
                    })}
                    {DEADLINES.filter(d => d.daysLeft <= 7).length === 0 && (
                      <p className="py-8 text-center text-sm text-gray-400">No compliance actions due yet</p>
                    )}
                  </div>
                </div>

                {/* Deadlines this month */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-brand" />
                    <h3 className="text-sm font-bold text-gray-900">Deadlines this month</h3>
                  </div>
                  <div className="space-y-1">
                    {DEADLINES.map(d => {
                      const sevColors = { critical: 'border-l-red-500 bg-red-50/30', warning: 'border-l-amber-500 bg-amber-50/20', info: 'border-l-blue-400 bg-white' };
                      return (
                        <div key={d.id} className={`flex items-center gap-3 px-3 py-2 rounded-r-[6px] border border-l-[3px] border-gray-100 ${sevColors[d.severity]}`}>
                          <span className="text-xs font-mono font-bold text-gray-400 w-10">{d.date}</span>
                          <p className="text-xs text-gray-700 flex-1 truncate">{d.title}</p>
                          <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium shrink-0">{d.category}</span>
                        </div>
                      );
                    })}
                    {DEADLINES.length === 0 && (
                      <p className="py-8 text-center text-sm text-gray-400">No compliance deadlines yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom: Risk drift + What changed */}
              <div className="grid grid-cols-2 gap-5">
                {/* Portfolio risk drift */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-gray-900">Portfolio risk drift</h3>
                  </div>
                  <div className="space-y-2">
                    {RISK_CATEGORIES.map((r, i) => {
                      const Icon = r.icon;
                      const barColor = r.status === 'green' ? 'bg-emerald-500' : r.status === 'yellow' ? 'bg-amber-500' : 'bg-red-500';
                      const TrendIcon = r.trend === 'up' ? TrendingUp : r.trend === 'down' ? TrendingDown : ArrowRight;
                      return (
                        <div key={i} className="bg-white rounded-[6px] border border-gray-100 px-3 py-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs font-medium text-gray-700">{r.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900">{r.current}</span>
                              <span className="text-[10px] text-gray-400">/ {r.threshold}</span>
                              <TrendIcon className={`w-3 h-3 ${r.trend === 'up' ? 'text-red-500' : r.trend === 'down' ? 'text-amber-500' : 'text-gray-400'}`} />
                            </div>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(r.pct, 100)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {RISK_CATEGORIES.length === 0 && (
                      <p className="py-8 text-center text-sm text-gray-400">No portfolio risk data yet</p>
                    )}
                  </div>
                </div>

                {/* What changed */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-bold text-gray-900">What changed</h3>
                  </div>
                  <div className="space-y-1.5">
                    {CHANGES.map(ch => {
                      const typeColors = { regulatory: 'bg-purple-50 text-purple-700', network: 'bg-blue-50 text-blue-700', vendor: 'bg-gray-100 text-gray-600' };
                      return (
                        <div key={ch.id} className="bg-white rounded-[6px] border border-gray-100 px-3 py-2.5 hover:border-gray-200 transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] text-gray-400 font-mono">{ch.date}</span>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${typeColors[ch.type]}`}>{ch.type}</span>
                            {ch.taskCreated && <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><CheckCircle className="w-2.5 h-2.5" /> task created</span>}
                          </div>
                          <p className="text-xs font-semibold text-gray-900">{ch.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{ch.impact}</p>
                        </div>
                      );
                    })}
                    {CHANGES.length === 0 && (
                      <p className="py-8 text-center text-sm text-gray-400">No compliance changes yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════
              PIPELINE — what is blocked?
              ═══════════════════════════════ */}
          {tab === 'pipeline' && (
            <div>
              {/* Pipeline summary */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold ${dealsBlocked > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  {dealsBlocked > 0 ? `${dealsBlocked} deal${dealsBlocked > 1 ? 's' : ''} blocked` : 'No blocks'}
                </div>
                <span className="text-xs text-gray-400">{DEALS.length} active deals across {MERCHANTS.length} merchants</span>
              </div>

              {/* Deal cards */}
              <div className="space-y-3">
                {DEALS.map(deal => (
                  <div key={deal.id} className={`rounded-[8px] border ${deal.blocked ? 'border-red-200 bg-red-50/20' : 'border-gray-200 bg-white'} overflow-hidden`}>
                    <div className="px-4 py-3">
                      {/* Deal header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-gray-400">{deal.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${deal.blocked ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              {deal.blocked ? 'BLOCKED' : deal.stage}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-gray-900">{deal.merchant}</h3>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                            <span className="font-mono font-bold text-brand">{deal.state}</span>
                            <span>{deal.amount} @ {deal.factorRate}x</span>
                            <span>{deal.agent}</span>
                            <span>{deal.date}</span>
                          </div>
                        </div>
                        <button className="text-xs text-brand font-medium hover:underline flex items-center gap-1">
                          View deal <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Block reason */}
                      {deal.blocked && (
                        <div className="bg-red-50 rounded-[6px] border border-red-200 px-3 py-2 mb-3 flex items-center gap-2">
                          <Ban className="w-4 h-4 text-red-500 shrink-0" />
                          <p className="text-xs font-semibold text-red-800">{deal.blockReason}</p>
                        </div>
                      )}

                      {/* Control ribbon */}
                      <ControlRibbon controls={deal.controls} onControlClick={key => { setSelectedDeal(deal.id); toggleControl(key); }} activeControl={selectedDeal === deal.id ? activeControl : null} />
                    </div>

                    {/* Control detail */}
                    {selectedDeal === deal.id && activeControl && deal.controls[activeControl] && (
                      <div className="px-4 pb-4">
                        <ControlDetail controlKey={activeControl} state={deal.controls[activeControl]} onClose={() => setActiveControl(null)} />
                      </div>
                    )}
                  </div>
                ))}
                {DEALS.length === 0 && (
                  <p className="py-12 text-center text-sm text-gray-400">No deals yet</p>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════
              MERCHANTS — operating records
              ═══════════════════════════════ */}
          {tab === 'merchants' && !selectedMerchant && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs text-gray-500">{MERCHANTS.length} merchants &middot; {MERCHANTS.filter(m => Object.values(m.controls).some(c => c.status === 'red')).length} with blocks &middot; {MERCHANTS.filter(m => Object.values(m.controls).some(c => c.status === 'yellow')).length} with warnings</p>
              </div>
              <div className="space-y-2">
                {MERCHANTS.map(m => {
                  const reds = Object.values(m.controls).filter(c => c.status === 'red').length;
                  const yellows = Object.values(m.controls).filter(c => c.status === 'yellow').length;
                  const greens = Object.values(m.controls).filter(c => c.status === 'green').length;
                  return (
                    <div key={m.id} className={`rounded-[8px] border px-4 py-3 cursor-pointer transition-all hover:shadow-sm ${
                      reds > 0 ? 'border-red-200 bg-red-50/10 hover:bg-red-50/20' : yellows > 0 ? 'border-amber-200/50 bg-white hover:bg-amber-50/10' : 'border-gray-200 bg-white hover:bg-gray-50/50'
                    }`} onClick={() => { setSelectedMerchant(m.id); setActiveControl(null); }}>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-gray-400">{m.id}</span>
                            <span className="font-mono font-bold text-[10px] text-brand">{m.state}</span>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${m.type === 'mca' ? 'bg-purple-50 text-purple-700' : m.type === 'processing' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'}`}>{m.type === 'both' ? 'MCA + Processing' : m.type === 'mca' ? 'MCA' : 'Processing'}</span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">{m.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                            <span>{m.activeDeals} active deal{m.activeDeals !== 1 ? 's' : ''}</span>
                            <span>{m.monthlyVolume}/mo</span>
                          </div>
                        </div>
                        {/* Mini control ribbon */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          {CONTROLS.map(c => {
                            const state = m.controls[c.key];
                            const dot = state ? statusColors[state.status].dot : 'bg-gray-300';
                            return <span key={c.key} className={`w-2 h-2 rounded-full ${dot}`} title={`${c.label}: ${state ? statusColors[state.status].label : 'N/A'}`} />;
                          })}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                      </div>
                    </div>
                  );
                })}
                {MERCHANTS.length === 0 && (
                  <p className="py-12 text-center text-sm text-gray-400">No merchants yet</p>
                )}
              </div>
            </div>
          )}

          {/* Merchant Detail */}
          {tab === 'merchants' && selectedMerchant && activeMerchant && (
            <div>
              <button onClick={() => { setSelectedMerchant(null); setActiveControl(null); }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand mb-4 font-medium">
                <ChevronRight className="w-3 h-3 rotate-180" /> All merchants
              </button>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-gray-400">{activeMerchant.id}</span>
                    <span className="font-mono font-bold text-xs text-brand">{activeMerchant.state}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${activeMerchant.type === 'mca' ? 'bg-purple-50 text-purple-700' : activeMerchant.type === 'processing' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'}`}>{activeMerchant.type === 'both' ? 'MCA + Processing' : activeMerchant.type === 'mca' ? 'MCA' : 'Processing'}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{activeMerchant.name}</h2>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>{activeMerchant.activeDeals} active deals</span>
                    <span>{activeMerchant.monthlyVolume}/mo volume</span>
                    <span>Risk score: <span className={`font-bold ${activeMerchant.riskScore > 70 ? 'text-red-600' : activeMerchant.riskScore > 40 ? 'text-amber-600' : 'text-emerald-600'}`}>{activeMerchant.riskScore}</span></span>
                  </div>
                </div>
              </div>

              {/* Full control ribbon */}
              <div className="mb-3">
                <ControlRibbon controls={activeMerchant.controls} onControlClick={toggleControl} activeControl={activeControl} />
              </div>

              {/* Control detail panel */}
              {activeControl && activeMerchant.controls[activeControl] && (
                <ControlDetail controlKey={activeControl} state={activeMerchant.controls[activeControl]} onClose={() => setActiveControl(null)} />
              )}

              {/* All controls grid */}
              {!activeControl && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {CONTROLS.map(c => {
                    const state = activeMerchant.controls[c.key];
                    const s = state ? statusColors[state.status] : statusColors.gray;
                    const Icon = c.icon;
                    return (
                      <button key={c.key} onClick={() => setActiveControl(c.key)} className={`text-left rounded-[8px] border ${s.border} ${s.bg} p-3.5 hover:shadow-sm transition-all`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`w-4 h-4 ${s.text}`} />
                          <span className="text-xs font-bold text-gray-900">{c.label}</span>
                          <span className={`ml-auto w-2 h-2 rounded-full ${s.dot}`} />
                        </div>
                        <p className="text-[11px] text-gray-600 line-clamp-2">{state?.currentStatus || 'Not assessed'}</p>
                        {state?.nextAction && state.nextAction !== 'N/A' && (
                          <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1"><ArrowRight className="w-2.5 h-2.5" /> {state.nextAction}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Evidence for this merchant */}
              <div className="mt-5">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2"><BadgeCheck className="w-3.5 h-3.5 text-brand" /> Evidence trail</h4>
                <div className="space-y-1">
                  {EVIDENCE.filter(e => e.merchant === activeMerchant.name).map(e => {
                    const ctrl = CONTROLS.find(c => c.key === e.control);
                    return (
                      <div key={e.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-[6px] border border-gray-100">
                        <span className="text-[10px] font-mono text-gray-400 w-32 shrink-0">{e.date}</span>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ctrl ? statusColors[MERCHANTS.find(m => m.name === e.merchant)?.controls[e.control]?.status || 'gray'].dot : 'bg-gray-300'}`} />
                        <span className="text-xs font-medium text-gray-700 flex-1">{e.type}</span>
                        <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{e.detail}</span>
                        {e.exportable && <button className="p-1 hover:bg-white rounded"><Download className="w-3 h-3 text-gray-400" /></button>}
                      </div>
                    );
                  })}
                  {EVIDENCE.filter(e => e.merchant === activeMerchant.name).length === 0 && (
                    <p className="py-6 text-center text-sm text-gray-400">No evidence records yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════
              MONITORING — risk building
              ═══════════════════════════════ */}
          {tab === 'monitoring' && (
            <div>
              <div className="flex items-center gap-1 mb-5 bg-gray-50 rounded-[6px] p-0.5 w-fit">
                {([
                  { key: 'deadlines' as const, label: 'Deadlines & Expirations', icon: Calendar },
                  { key: 'thresholds' as const, label: 'Threshold Drift', icon: Activity },
                  { key: 'changes' as const, label: 'Regulatory Changes', icon: Bell },
                ]).map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.key} onClick={() => setMonitoringView(t.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${
                        monitoringView === t.key ? 'bg-white text-brand shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {monitoringView === 'deadlines' && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {(['all', 'critical', 'warning', 'info'] as const).map(f => (
                      <button key={f} onClick={() => setDeadlineFilter(f)} className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold border transition-colors ${deadlineFilter === f ? 'bg-brand/5 text-brand border-brand/20' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                        {f === 'all' ? `All (${DEADLINES.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${DEADLINES.filter(d => d.severity === f).length})`}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    {filteredDeadlines.map(d => {
                      const sevColors = { critical: 'border-l-red-500 bg-red-50/30', warning: 'border-l-amber-500 bg-amber-50/20', info: 'border-l-blue-400 bg-white' };
                      return (
                        <div key={d.id} className={`flex items-center gap-4 px-4 py-3 rounded-r-[6px] border border-l-[3px] border-gray-100 ${sevColors[d.severity]}`}>
                          <div className="w-12 shrink-0 text-center">
                            <p className="text-lg font-bold text-gray-900">{d.dateShort}</p>
                            <p className="text-[9px] text-gray-400 uppercase">{d.date.split(' ')[0]}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{d.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{d.category}</p>
                          </div>
                          <span className={`text-xs font-mono font-bold shrink-0 ${d.daysLeft <= 0 ? 'text-red-600' : d.daysLeft <= 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                            {d.daysLeft <= 0 ? 'TODAY' : `${d.daysLeft} days`}
                          </span>
                        </div>
                      );
                    })}
                    {filteredDeadlines.length === 0 && (
                      <p className="py-12 text-center text-sm text-gray-400">No compliance deadlines yet</p>
                    )}
                  </div>
                </div>
              )}

              {monitoringView === 'thresholds' && (
                <div className="space-y-3">
                  {RISK_CATEGORIES.map((r, i) => {
                    const Icon = r.icon;
                    const barColor = r.status === 'green' ? 'bg-emerald-500' : r.status === 'yellow' ? 'bg-amber-500' : 'bg-red-500';
                    const bgColor = r.status === 'green' ? 'bg-white border-gray-200' : r.status === 'yellow' ? 'bg-amber-50/30 border-amber-200' : 'bg-red-50/30 border-red-200';
                    const TrendIcon = r.trend === 'up' ? TrendingUp : r.trend === 'down' ? TrendingDown : ArrowRight;
                    return (
                      <div key={i} className={`rounded-[8px] border p-4 ${bgColor}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-900">{r.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-lg font-bold text-gray-900">{r.current}</span>
                              <span className="text-xs text-gray-400 ml-1">/ {r.threshold}</span>
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold ${r.trend === 'up' ? 'bg-red-50 text-red-600' : r.trend === 'down' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'}`}>
                              <TrendIcon className="w-3 h-3" />
                              {r.trend === 'up' ? 'Rising' : r.trend === 'down' ? 'Declining' : 'Stable'}
                            </div>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(r.pct, 100)}%` }} />
                        </div>
                        <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                          <span>0</span>
                          <span>{Math.round(r.pct)}% of threshold</span>
                          <span>{r.threshold}</span>
                        </div>
                      </div>
                    );
                  })}
                  {RISK_CATEGORIES.length === 0 && (
                    <p className="py-12 text-center text-sm text-gray-400">No threshold data yet</p>
                  )}
                </div>
              )}

              {monitoringView === 'changes' && (
                <div className="space-y-2">
                  {CHANGES.map(ch => {
                    const typeColors = { regulatory: 'bg-purple-50 text-purple-700 border-purple-200', network: 'bg-blue-50 text-blue-700 border-blue-200', vendor: 'bg-gray-50 text-gray-600 border-gray-200' };
                    const typeIcons = { regulatory: Landmark, network: CreditCard, vendor: Building2 };
                    const TypeIcon = typeIcons[ch.type];
                    return (
                      <div key={ch.id} className="bg-white rounded-[8px] border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TypeIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-[10px] font-mono text-gray-400">{ch.date}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${typeColors[ch.type]}`}>{ch.type}</span>
                          {ch.taskCreated && <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><CheckCircle className="w-2.5 h-2.5" /> task created</span>}
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">{ch.title}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">{ch.impact}</p>
                      </div>
                    );
                  })}
                  {CHANGES.length === 0 && (
                    <p className="py-12 text-center text-sm text-gray-400">No regulatory changes yet</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════
              AUDIT — prove what we did
              ═══════════════════════════════ */}
          {tab === 'audit' && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={auditSearch} onChange={e => setAuditSearch(e.target.value)}
                    placeholder="Search evidence records..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setAuditControl(null)} className={`px-2.5 py-1.5 rounded-[6px] text-[10px] font-semibold border whitespace-nowrap ${!auditControl ? 'bg-brand/5 text-brand border-brand/20' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>All</button>
                  {CONTROLS.map(c => (
                    <button key={c.key} onClick={() => setAuditControl(auditControl === c.key ? null : c.key)} className={`px-2.5 py-1.5 rounded-[6px] text-[10px] font-semibold border whitespace-nowrap ${auditControl === c.key ? 'bg-brand/5 text-brand border-brand/20' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                      {c.shortLabel}
                    </button>
                  ))}
                </div>
                <button className="ml-auto px-3 py-1.5 bg-brand text-white text-xs font-medium rounded-[6px] hover:bg-brand-hover flex items-center gap-1.5 shrink-0">
                  <Download className="w-3 h-3" /> Export All
                </button>
              </div>

              <div className="text-[10px] text-gray-400 mb-3">{filteredEvidence.length} records {auditControl ? `\u00B7 filtered by ${CONTROLS.find(c => c.key === auditControl)?.label}` : ''}</div>

              {/* Evidence table */}
              <div className="border border-gray-200 rounded-[8px] overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 flex items-center gap-4 text-[10px] text-gray-500 uppercase tracking-wide font-semibold border-b border-gray-200">
                  <span className="w-32">Timestamp</span>
                  <span className="w-40">Merchant</span>
                  <span className="w-16">Control</span>
                  <span className="w-40">Type</span>
                  <span className="flex-1">Detail</span>
                  <span className="w-8"></span>
                </div>
                {filteredEvidence.map(e => {
                  const ctrl = CONTROLS.find(c => c.key === e.control);
                  return (
                    <div key={e.id} className="px-4 py-2.5 flex items-center gap-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                      <span className="text-[10px] font-mono text-gray-400 w-32 shrink-0">{e.date}</span>
                      <span className="text-xs font-medium text-gray-900 w-40 truncate shrink-0">{e.merchant}</span>
                      <span className="w-16 shrink-0"><span className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{ctrl?.shortLabel}</span></span>
                      <span className="text-xs text-gray-700 w-40 truncate shrink-0">{e.type}</span>
                      <span className="text-[11px] text-gray-500 flex-1 truncate">{e.detail}</span>
                      {e.exportable && <button className="p-1 hover:bg-gray-100 rounded w-8 flex justify-center shrink-0"><Download className="w-3 h-3 text-gray-400" /></button>}
                    </div>
                  );
                })}
                {filteredEvidence.length === 0 && (
                  <p className="px-5 py-12 text-center text-sm text-gray-400">No evidence records yet</p>
                )}
              </div>

              {/* Document vault */}
              <div className="mt-6">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5 text-brand" /> Document Vault</h4>
                <div className="space-y-4">
                  {DOC_CATEGORIES.map((cat, ci) => {
                    const Icon = cat.icon;
                    return (
                      <div key={ci}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="w-3.5 h-3.5 text-brand" />
                          <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wide">{cat.cat}</span>
                          <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{cat.docs.length}</span>
                        </div>
                        <div className="space-y-1 ml-5">
                          {cat.docs.map((d, di) => (
                            <div key={di} className="flex items-center gap-3 px-3 py-2 bg-white rounded-[6px] border border-gray-100 hover:border-gray-200 transition-colors group">
                              <FileText className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="text-xs text-gray-700 flex-1">{d}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 hover:bg-gray-100 rounded"><Eye className="w-3 h-3 text-gray-400" /></button>
                                <button className="p-1 hover:bg-gray-100 rounded"><Download className="w-3 h-3 text-gray-400" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {DOC_CATEGORIES.length === 0 && (
                    <p className="py-12 text-center text-sm text-gray-400">No documents yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════
              RULES — what is the rule?
              ═══════════════════════════════ */}
          {tab === 'rules' && (
            <div>
              <div className="flex items-center gap-1 mb-5 bg-gray-50 rounded-[6px] p-0.5 w-fit">
                {([
                  { key: 'states' as const, label: 'State Rules', icon: Landmark },
                  { key: 'networks' as const, label: 'Card Networks & PCI', icon: CreditCard },
                  { key: 'contracts' as const, label: 'Contract Health', icon: Scale },
                  { key: 'vendors' as const, label: 'Vendor Obligations', icon: Building2 },
                  { key: 'caselaw' as const, label: 'Case Law & Research', icon: BookOpen },
                ]).map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.key} onClick={() => setRulesTab(t.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${
                        rulesTab === t.key ? 'bg-white text-brand shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* State Rules */}
              {rulesTab === 'states' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {(['all', 'enforced', 'pending'] as const).map(f => (
                      <button key={f} onClick={() => setStateFilter(f)} className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold border transition-colors ${stateFilter === f ? 'bg-brand/5 text-brand border-brand/20' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                        {f === 'all' ? `All (${STATES.length})` : f === 'enforced' ? `Enforced (${STATES.filter(s => s.status === 'enforced').length})` : `Pending (${STATES.filter(s => s.status === 'pending').length})`}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {filteredStates.map(s => {
                      const isExpanded = expandedState === s.st;
                      return (
                        <div key={s.st} className={`rounded-[8px] border transition-all ${isExpanded ? 'border-brand/20 shadow-sm' : 'border-gray-200'}`}>
                          <div className="px-4 py-3 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpandedState(isExpanded ? null : s.st)}>
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-extrabold font-mono text-brand w-8 shrink-0">{s.st}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-gray-900">{s.name}</span>
                                  <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded ${s.status === 'enforced' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{s.status}</span>
                                  {s.aprReq && <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-red-50 text-red-700">APR req</span>}
                                  {s.regReq && <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-cyan-50 text-cyan-700">registration</span>}
                                  {s.contractMod && <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-indigo-50 text-brand">addendum</span>}
                                </div>
                                <div className="flex gap-4 mt-1 text-[11px] text-gray-500">
                                  <span><span className="text-gray-400">Law:</span> {s.law}</span>
                                  <span><span className="text-gray-400">Threshold:</span> {s.threshold}</span>
                                  <span><span className="text-gray-400">Regulator:</span> {s.regBody}</span>
                                </div>
                              </div>
                              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-gray-100 pt-4 ml-11 space-y-4">
                              {s.contractMod && (
                                <div className="bg-indigo-50 rounded-[6px] p-3 border border-indigo-100">
                                  <p className="text-[10px] font-mono font-bold text-brand mb-1">CONTRACT MODIFICATION REQUIRED</p>
                                  <p className="text-xs text-gray-700 leading-relaxed">{s.contractNote}</p>
                                </div>
                              )}
                              {s.disclosureItems.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-mono font-bold text-emerald-700 mb-2">REQUIRED DISCLOSURE ITEMS</p>
                                  <div className="space-y-1.5">
                                    {s.disclosureItems.map((d, di) => (
                                      <div key={di} className="flex items-start gap-2">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                        <span className="text-xs text-gray-700 leading-relaxed">{d}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-gray-600 leading-relaxed">{s.notes}</p>
                              <div className="space-y-1 text-[11px] text-gray-500">
                                <p><span className="font-semibold text-gray-700">COJ:</span> {s.cofRestriction}</p>
                                <p><span className="font-semibold text-gray-700">Forum:</span> {s.forumRestriction}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {filteredStates.length === 0 && (
                      <p className="py-12 text-center text-sm text-gray-400">No state rules yet</p>
                    )}
                  </div>
                  <div className="mt-4 bg-amber-50 rounded-[8px] border border-amber-200 p-4 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-700 leading-relaxed"><span className="font-bold text-amber-700">MCAs are not loans.</span> These are commercial financing disclosure laws. Usury applies only if a court reclassifies the contract (see Contract Health). ~35-40 states have no MCA-specific laws.</p>
                  </div>
                </div>
              )}

              {/* Card Networks & PCI */}
              {rulesTab === 'networks' && (
                <div className="space-y-6">
                  {PCI.map((sec, si) => (
                    <div key={si}>
                      <div className="mb-3">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          {si === 0 && <Lock className="w-4 h-4 text-brand" />}
                          {si === 1 && <CreditCard className="w-4 h-4 text-blue-600" />}
                          {si === 2 && <CreditCard className="w-4 h-4 text-orange-600" />}
                          {si === 3 && <ShieldAlert className="w-4 h-4 text-red-600" />}
                          {si === 4 && <Clock className="w-4 h-4 text-purple-600" />}
                          {sec.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 ml-6">{sec.subtitle}</p>
                      </div>
                      <div className="space-y-2 ml-6">
                        {sec.items.map((it, ii) => (
                          <div key={ii} className="bg-gray-50 rounded-[6px] border border-gray-100 p-3 hover:border-gray-200 transition-colors">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-sm font-semibold text-gray-900">{it.item}</span>
                              <Tag type={it.type} />
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{it.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {PCI.length === 0 && (
                    <p className="py-12 text-center text-sm text-gray-400">No card network or PCI rules yet</p>
                  )}
                </div>
              )}

              {/* Contract Health */}
              {rulesTab === 'contracts' && (
                <div>
                  <div className="bg-gray-50 rounded-[8px] border border-gray-200 p-4 mb-5 flex items-start gap-2">
                    <Info className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-600 leading-relaxed"><span className="font-bold text-gray-900">Recharacterization risk.</span> Courts can decide an MCA is a loan. If that happens, usury laws apply (factor rate = 150-300%+ APR), contract can be voided, and collected payments clawed back. These 6 factors are what courts use. This runs automatically per deal.</p>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mb-5">
                    <div className="bg-gray-50 rounded-[8px] border border-gray-200 p-3.5"><p className="text-[10px] font-mono text-gray-400 uppercase mb-1">Assessed</p><p className="text-xl font-extrabold text-gray-900">{hAssessed}/{HEALTH_FACTORS.length}</p></div>
                    <div className={`rounded-[8px] border p-3.5 ${hRisk > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}><p className="text-[10px] font-mono text-gray-400 uppercase mb-1">Risk</p><p className={`text-xl font-extrabold ${hRisk > 0 ? 'text-red-700' : 'text-gray-400'}`}>{hRisk}</p></div>
                    <div className={`rounded-[8px] border p-3.5 ${hSafe > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}><p className="text-[10px] font-mono text-gray-400 uppercase mb-1">Safe</p><p className={`text-xl font-extrabold ${hSafe > 0 ? 'text-emerald-700' : 'text-gray-400'}`}>{hSafe}</p></div>
                    <div className={`rounded-[8px] border p-3.5 ${hLevel.includes('High') ? 'bg-red-50 border-red-200' : hLevel === 'Elevated' ? 'bg-amber-50 border-amber-200' : hLevel === 'Defensible' ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}><p className="text-[10px] font-mono text-gray-400 uppercase mb-1">Assessment</p><p className={`text-xl font-extrabold ${hColor}`}>{hLevel}</p></div>
                  </div>
                  <div className="space-y-3">
                    {HEALTH_FACTORS.map(f => (
                      <div key={f.id} className={`rounded-[8px] border p-4 transition-all ${healthState[f.id] === 'risk' ? 'border-red-200 bg-red-50/30' : healthState[f.id] === 'safe' ? 'border-emerald-200 bg-emerald-50/30' : healthState[f.id] === 'mid' ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200 bg-white'}`}>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">{f.title}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed mb-1">{f.detail}</p>
                        <p className="text-[10px] font-mono text-gray-400 mb-3">{f.caselaw}</p>
                        <div className="flex gap-2">
                          {([['safe', f.safe], ['mid', f.mid], ['risk', f.risk]] as const).map(([lv, lb]) => (
                            <button key={lv} onClick={() => setHealthState(p => ({ ...p, [f.id]: p[f.id] === lv ? undefined as any : lv }))}
                              className={`px-3 py-1.5 rounded-[6px] text-xs font-medium border transition-all ${healthState[f.id] === lv ? lv === 'safe' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : lv === 'risk' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                              {lv === 'safe' && <CheckCircle className="w-3 h-3 inline mr-1 -mt-px" />}
                              {lv === 'mid' && <MinusCircle className="w-3 h-3 inline mr-1 -mt-px" />}
                              {lv === 'risk' && <XCircle className="w-3 h-3 inline mr-1 -mt-px" />}
                              {lb}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {HEALTH_FACTORS.length === 0 && (
                      <p className="py-12 text-center text-sm text-gray-400">No contract health factors yet</p>
                    )}
                  </div>
                </div>
              )}

              {/* Vendor Obligations */}
              {rulesTab === 'vendors' && (
                <div className="space-y-6">
                  {VENDORS.map(v => (
                    <div key={v.id}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: v.color }} />
                        <h3 className="text-sm font-bold text-gray-900">{v.name}</h3>
                        <span className="text-xs font-mono text-gray-400">{v.role}</span>
                      </div>
                      <div className="space-y-2 ml-6">
                        {v.obligations.map((ob, i) => (
                          <div key={i} className="bg-gray-50 rounded-[6px] border border-gray-100 p-3 hover:border-gray-200 transition-colors">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-sm font-semibold text-gray-900">{ob.item}</span>
                              <Tag type={ob.type} />
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{ob.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {VENDORS.length === 0 && (
                    <p className="py-12 text-center text-sm text-gray-400">No vendor obligations yet</p>
                  )}
                </div>
              )}

              {/* Case Law */}
              {rulesTab === 'caselaw' && (
                <div className="space-y-5">
                  {RESEARCH.map((r, ri) => {
                    const Icon = r.icon;
                    return (
                      <div key={ri}>
                        <h4 className="text-xs font-bold text-brand uppercase tracking-wide mb-2 flex items-center gap-2"><Icon className="w-3.5 h-3.5" />{r.topic}</h4>
                        <div className="space-y-1 ml-6">
                          {r.sources.map((s, si) => (
                            <div key={si} className="flex items-start gap-2 px-3 py-2 bg-white rounded-[6px] border border-gray-100 hover:border-gray-200 transition-colors group">
                              <span className="text-[10px] text-gray-300 font-mono mt-0.5 shrink-0">{String(si + 1).padStart(2, '0')}</span>
                              <span className="text-xs text-gray-700 leading-relaxed flex-1">{s}</span>
                              <ExternalLink className="w-3 h-3 text-gray-300 mt-0.5 shrink-0 group-hover:text-brand transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {RESEARCH.length === 0 && (
                    <p className="py-12 text-center text-sm text-gray-400">No case law or research entries yet</p>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
