import React, { useState, useMemo } from 'react';
import {
  Shield, AlertTriangle, Clock, CheckCircle, XCircle, ChevronRight,
  Search, Filter, ArrowUpRight, ArrowDownRight, DollarSign, FileText,
  Upload, GripVertical, Eye, Send, BarChart3, TrendingUp, TrendingDown,
  AlertCircle, Bell, Calculator, ExternalLink, Plus, RefreshCw,
  ChevronDown, X, Paperclip, MessageSquare, User, Calendar,
  Zap, Activity,
} from 'lucide-react';

// ══════════════════════════════════════
// TYPES & DATA
// ══════════════════════════════════════

type DisputeStage = 'new' | 'evidence' | 'draft' | 'review' | 'submitted' | 'awaiting' | 'won' | 'lost';
type Urgency = 'critical' | 'urgent' | 'normal';

interface Dispute {
  id: string;
  merchant: string;
  merchantId: string;
  vertical: string;
  cardNetwork: string;
  reasonCode: string;
  reasonLabel: string;
  reasonCategory: 'fraud' | 'service' | 'authorization' | 'processing';
  amount: number;
  transactionDate: string;
  disputeDate: string;
  responseDeadline: string;
  daysLeft: number;
  stage: DisputeStage;
  handler: string;
  cardLast4: string;
  arnNumber: string;
  evidenceTypes: string[];
  evidenceCollected: string[];
  notes: { author: string; text: string; date: string }[];
  outcome?: 'won' | 'lost';
  stageTimestamps: Partial<Record<DisputeStage, string>>;
}

interface PreChargebackAlert {
  id: string;
  merchant: string;
  source: 'Verifi CDRN' | 'Ethoca';
  amount: number;
  cardLast4: string;
  alertDate: string;
  expiresIn: number;
  transactionDate: string;
  status: 'pending' | 'refunded' | 'expired';
  descriptor: string;
}

interface MerchantRatio {
  merchant: string;
  txnCount: number;
  cbCount: number;
  network: string;
  threshold: number;
  ratio: number;
  pctOfThreshold: number;
}

interface ArgumentEffectiveness {
  combo: string;
  used: number;
  wins: number;
  losses: number;
}

interface ReasonCode {
  label: string;
  category: string;
  strategy: string;
  winRate: number;
  network: string;
  description: string;
  requiredEvidence: string[];
}

const DISPUTES: Dispute[] = [];

const PRE_ALERTS: PreChargebackAlert[] = [];

const ARGUMENT_EFFECTIVENESS: ArgumentEffectiveness[] = [];

// ── Reason code database ──
const REASON_CODES: Record<string, ReasonCode> = {};

// ── Helpers ──
const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const fmtK = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : fmt(n);
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const fmtDateFull = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const urgencyOf = (d: Dispute): Urgency => d.daysLeft <= 3 ? 'critical' : d.daysLeft <= 7 ? 'urgent' : 'normal';
const urgencyColor: Record<Urgency, { bg: string; text: string; dot: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
  urgent: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
  normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
};

const stageConfig: Record<DisputeStage, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-blue-700', bg: 'bg-blue-50' },
  evidence: { label: 'Evidence Collection', color: 'text-amber-700', bg: 'bg-amber-50' },
  draft: { label: 'Draft Response', color: 'text-orange-700', bg: 'bg-orange-50' },
  review: { label: 'Review', color: 'text-purple-700', bg: 'bg-purple-50' },
  submitted: { label: 'Submitted', color: 'text-brand', bg: 'bg-indigo-50' },
  awaiting: { label: 'Awaiting Decision', color: 'text-gray-700', bg: 'bg-gray-100' },
  won: { label: 'Won', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  lost: { label: 'Lost', color: 'text-red-700', bg: 'bg-red-50' },
};

const STAGE_ORDER: DisputeStage[] = ['new', 'evidence', 'draft', 'review', 'submitted', 'awaiting', 'won'];

const categoryColors: Record<string, { bg: string; text: string }> = {
  fraud: { bg: 'bg-red-50', text: 'text-red-700' },
  service: { bg: 'bg-blue-50', text: 'text-blue-700' },
  authorization: { bg: 'bg-purple-50', text: 'text-purple-700' },
  processing: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

// ══════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════
export function BackendDisputes() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'workflow' | 'analytics' | 'alerts' | 'codes' | 'costcalc'>('inbox');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [evidenceModal, setEvidenceModal] = useState<string | null>(null);
  const [costCalcId, setCostCalcId] = useState<string | null>(null);

  // ── Active (non-resolved) disputes sorted by urgency ──
  const activeDisputes = useMemo(() =>
    DISPUTES.filter(d => d.stage !== 'won' && d.stage !== 'lost')
      .sort((a, b) => a.daysLeft - b.daysLeft),
  []);

  const filtered = useMemo(() => {
    let list = DISPUTES;
    if (stageFilter !== 'all') list = list.filter(d => d.stage === stageFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d => d.merchant.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.reasonCode.includes(q));
    }
    return list;
  }, [stageFilter, search]);

  // ── Analytics calculations ──
  const analytics = useMemo(() => {
    const resolved = DISPUTES.filter(d => d.stage === 'won' || d.stage === 'lost');
    const won = resolved.filter(d => d.outcome === 'won');
    const lost = resolved.filter(d => d.outcome === 'lost');
    const totalAmount = DISPUTES.reduce((s, d) => s + d.amount, 0);
    const recoveredAmount = won.reduce((s, d) => s + d.amount, 0);
    const lostAmount = lost.reduce((s, d) => s + d.amount, 0);
    const winRate = resolved.length > 0 ? won.length / resolved.length : 0;
    const pendingAmount = DISPUTES.filter(d => d.stage !== 'won' && d.stage !== 'lost').reduce((s, d) => s + d.amount, 0);

    // Win rate by reason code
    const byReasonCode: Record<string, { wins: number; total: number; code: string; label: string }> = {};
    resolved.forEach(d => {
      if (!byReasonCode[d.reasonCode]) byReasonCode[d.reasonCode] = { wins: 0, total: 0, code: d.reasonCode, label: d.reasonLabel };
      byReasonCode[d.reasonCode].total++;
      if (d.outcome === 'won') byReasonCode[d.reasonCode].wins++;
    });

    // Win rate by vertical
    const byVertical: Record<string, { wins: number; total: number }> = {};
    resolved.forEach(d => {
      if (!byVertical[d.vertical]) byVertical[d.vertical] = { wins: 0, total: 0 };
      byVertical[d.vertical].total++;
      if (d.outcome === 'won') byVertical[d.vertical].wins++;
    });

    // Win rate by evidence type
    const byEvidence: Record<string, { wins: number; total: number }> = {};
    resolved.forEach(d => {
      d.evidenceCollected.forEach(e => {
        if (!byEvidence[e]) byEvidence[e] = { wins: 0, total: 0 };
        byEvidence[e].total++;
        if (d.outcome === 'won') byEvidence[e].wins++;
      });
    });

    return {
      total: DISPUTES.length, active: activeDisputes.length, resolved: resolved.length,
      won: won.length, lost: lost.length, winRate, totalAmount, recoveredAmount, lostAmount, pendingAmount,
      byReasonCode, byVertical, byEvidence,
    };
  }, [activeDisputes]);

  const tabs = [
    { key: 'inbox' as const, label: 'Dispute Inbox', badge: activeDisputes.length },
    { key: 'workflow' as const, label: 'Representment Workflow', badge: DISPUTES.filter(d => !['won', 'lost'].includes(d.stage)).length },
    { key: 'codes' as const, label: 'Reason Codes' },
    { key: 'analytics' as const, label: 'Win/Loss Analytics' },
    { key: 'alerts' as const, label: 'Pre-CB Alerts', badge: PRE_ALERTS.filter(a => a.status === 'pending').length },
    { key: 'costcalc' as const, label: 'Cost Calculator' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mt-0.5">Chargeback management, representment workflow & analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Dispute integrations not connected</span>
            <button className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Log Dispute
            </button>
          </div>
        </div>

        {/* ── Urgency Summary Strip ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Critical (< 3 days)', count: activeDisputes.filter(d => d.daysLeft <= 3).length, amount: activeDisputes.filter(d => d.daysLeft <= 3).reduce((s, d) => s + d.amount, 0), color: 'red', accent: 'border-t-red-500' },
            { label: 'Urgent (3-7 days)', count: activeDisputes.filter(d => d.daysLeft > 3 && d.daysLeft <= 7).length, amount: activeDisputes.filter(d => d.daysLeft > 3 && d.daysLeft <= 7).reduce((s, d) => s + d.amount, 0), color: 'amber', accent: 'border-t-amber-500' },
            { label: 'Normal (> 7 days)', count: activeDisputes.filter(d => d.daysLeft > 7).length, amount: activeDisputes.filter(d => d.daysLeft > 7).reduce((s, d) => s + d.amount, 0), color: 'emerald', accent: 'border-t-emerald-500' },
            { label: 'Win Rate (Resolved)', count: analytics.resolved, amount: analytics.recoveredAmount, color: 'indigo', accent: 'border-t-brand', isRate: true },
          ].map((s, i) => (
            <div key={i} className={`bg-white rounded-[8px] border border-gray-200 border-t-2 ${s.accent} p-4`}>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-1.5">{s.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-xl font-bold text-gray-900 leading-none">
                  {s.isRate ? fmtPct(analytics.winRate) : s.count}
                </p>
                <p className="text-xs text-gray-400">{fmt(s.amount)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tab Nav ── */}
        <div className="border-b border-gray-200">
          <div className="flex gap-1">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px] flex items-center gap-2 ${
                  activeTab === t.key ? 'text-brand border-brand' : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {t.label}
                {t.badge !== undefined && (
                  <span className={`text-[10px] tabular-nums px-1.5 py-px rounded-full ${
                    activeTab === t.key ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-500'
                  }`}>{t.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════ */}
        {/* INBOX TAB                               */}
        {/* ════════════════════════════════════════ */}
        {activeTab === 'inbox' && (
          <div className="space-y-4">
            {/* Search + Filters */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search disputes, merchants, reason codes..."
                  className="w-full pl-8 pr-3 py-[7px] bg-white border border-gray-200 rounded-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>
              <div className="flex items-center gap-1">
                {['all', 'new', 'evidence', 'draft', 'review', 'submitted', 'awaiting'].map(s => (
                  <button key={s} onClick={() => setStageFilter(s)}
                    className={`px-2.5 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${stageFilter === s ? 'bg-brand/10 text-brand' : 'text-gray-500 hover:bg-gray-50'}`}>
                    {s === 'all' ? 'All Active' : stageConfig[s as DisputeStage]?.label || s}
                  </button>
                ))}
              </div>
            </div>

            {/* Dispute Table */}
            <div className="bg-white border border-gray-200 rounded-[8px] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <Th className="pl-5">Urgency</Th><Th>Dispute</Th><Th>Merchant</Th><Th>Reason Code</Th>
                    <Th>Amount</Th><Th>Deadline</Th><Th>Stage</Th><Th>Handler</Th><Th className="pr-5">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.filter(d => stageFilter === 'all' ? !['won', 'lost'].includes(d.stage) : true).sort((a, b) => a.daysLeft - b.daysLeft).map(d => {
                    const urg = urgencyOf(d);
                    const uc = urgencyColor[urg];
                    const sc = stageConfig[d.stage];
                    const isSelected = selectedDispute === d.id;
                    return (
                      <React.Fragment key={d.id}>
                        <tr onClick={() => setSelectedDispute(isSelected ? null : d.id)}
                          className={`border-b border-gray-100 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/40' : 'hover:bg-gray-50/80'}`}>
                          <td className="pl-5 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${uc.bg} ${uc.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${uc.dot} ${urg === 'critical' ? 'animate-pulse' : ''}`} />
                              {d.daysLeft <= 0 ? 'OVERDUE' : `${d.daysLeft}d left`}
                            </span>
                          </td>
                          <td className="py-3">
                            <p className="text-sm font-semibold text-gray-900">{d.id}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{d.cardNetwork} ****{d.cardLast4}</p>
                          </td>
                          <td className="py-3">
                            <p className="text-sm font-medium text-gray-900">{d.merchant}</p>
                            <p className="text-[10px] text-gray-400">{d.vertical}</p>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${categoryColors[d.reasonCategory].bg} ${categoryColors[d.reasonCategory].text}`}>
                                {d.reasonCategory.toUpperCase()}
                              </span>
                              <div>
                                <p className="text-xs font-semibold text-gray-900">{d.cardNetwork} {d.reasonCode}</p>
                                <p className="text-[10px] text-gray-400 max-w-[180px] truncate">{d.reasonLabel}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-sm font-semibold tabular-nums text-gray-900">{fmt(d.amount)}</td>
                          <td className="py-3">
                            <p className={`text-xs font-medium tabular-nums ${d.daysLeft <= 3 ? 'text-red-600' : d.daysLeft <= 7 ? 'text-amber-600' : 'text-gray-600'}`}>
                              {fmtDate(d.responseDeadline)}
                            </p>
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.bg} ${sc.color}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="py-3 text-xs text-gray-600">{d.handler}</td>
                          <td className="pr-5 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={(e) => { e.stopPropagation(); setEvidenceModal(d.id); }}
                                className="p-1.5 rounded-[4px] hover:bg-gray-100 text-gray-400 hover:text-brand transition-colors" title="Evidence Builder">
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setCostCalcId(d.id); }}
                                className="p-1.5 rounded-[4px] hover:bg-gray-100 text-gray-400 hover:text-brand transition-colors" title="Cost Calculator">
                                <Calculator className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded row */}
                        {isSelected && (
                          <tr><td colSpan={9} className="bg-gray-50 border-b border-gray-200 px-5 py-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              {/* Timeline */}
                              <div className="lg:col-span-2">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-3">Representment Pipeline</p>
                                <div className="flex items-center gap-1 mb-4">
                                  {STAGE_ORDER.map((st, i) => {
                                    const isDone = d.stageTimestamps[st] !== undefined;
                                    const isCurrent = d.stage === st;
                                    const isLost = d.stage === 'lost' && i === STAGE_ORDER.length - 1;
                                    return (
                                      <React.Fragment key={st}>
                                        <div className={`flex flex-col items-center gap-1`}>
                                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                            isDone && !isCurrent ? 'bg-emerald-100 text-emerald-700' :
                                            isCurrent ? 'bg-brand text-white ring-2 ring-brand/20' :
                                            isLost ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-400'
                                          }`}>
                                            {isDone && !isCurrent ? '✓' : i + 1}
                                          </div>
                                          <p className="text-[9px] text-gray-500 text-center leading-tight max-w-[60px]">{stageConfig[st].label}</p>
                                          {d.stageTimestamps[st] && <p className="text-[8px] text-gray-400">{fmtDate(d.stageTimestamps[st]!)}</p>}
                                        </div>
                                        {i < STAGE_ORDER.length - 1 && (
                                          <div className={`flex-1 h-0.5 mb-8 ${isDone ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                                        )}
                                      </React.Fragment>
                                    );
                                  })}
                                  {d.stage === 'lost' && (
                                    <>
                                      <div className="flex-1 h-0.5 mb-8 bg-red-200" />
                                      <div className="flex flex-col items-center gap-1">
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-red-100 text-red-700">✗</div>
                                        <p className="text-[9px] text-red-600 text-center">Lost</p>
                                        {d.stageTimestamps.lost && <p className="text-[8px] text-gray-400">{fmtDate(d.stageTimestamps.lost)}</p>}
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* Evidence Progress */}
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-2">Evidence Checklist</p>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {d.evidenceTypes.map(ev => {
                                    const collected = d.evidenceCollected.includes(ev);
                                    return (
                                      <div key={ev} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs ${collected ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {collected ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                                        {ev}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Notes & Details */}
                              <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-2">Details</p>
                                <div className="space-y-2 mb-4">
                                  <div className="flex justify-between text-xs"><span className="text-gray-500">Transaction</span><span className="text-gray-900 font-medium">{fmtDate(d.transactionDate)}</span></div>
                                  <div className="flex justify-between text-xs"><span className="text-gray-500">Dispute Filed</span><span className="text-gray-900 font-medium">{fmtDate(d.disputeDate)}</span></div>
                                  <div className="flex justify-between text-xs"><span className="text-gray-500">ARN</span><span className="text-gray-900 font-mono text-[10px]">{d.arnNumber.slice(0, 12)}...</span></div>
                                  <div className="flex justify-between text-xs"><span className="text-gray-500">Network</span><span className="text-gray-900 font-medium">{d.cardNetwork}</span></div>
                                </div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-2">Activity Log</p>
                                <div className="space-y-2 max-h-[140px] overflow-y-auto">
                                  {d.notes.map((n, i) => (
                                    <div key={i} className="bg-white rounded-[4px] border border-gray-200 px-2.5 py-2">
                                      <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[10px] font-semibold text-gray-700">{n.author}</span>
                                        <span className="text-[9px] text-gray-400">{fmtDate(n.date)}</span>
                                      </div>
                                      <p className="text-[11px] text-gray-600 leading-relaxed">{n.text}</p>
                                    </div>
                                  ))}
                                  {d.notes.length === 0 && <p className="text-xs text-gray-400 italic">No notes yet</p>}
                                </div>
                              </div>
                            </div>
                          </td></tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {filtered.filter(d => stageFilter === 'all' ? !['won', 'lost'].includes(d.stage) : true).length === 0 && (
                    <tr><td colSpan={9} className="py-12 text-center text-sm text-gray-400">No disputes yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* WORKFLOW TAB                             */}
        {/* ════════════════════════════════════════ */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            {/* Kanban-style stage columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {(['new', 'evidence', 'draft', 'review', 'submitted', 'awaiting', 'won'] as DisputeStage[]).map(stage => {
                const stageDisputes = DISPUTES.filter(d => d.stage === stage);
                const lostDisputes = stage === 'won' ? DISPUTES.filter(d => d.stage === 'lost') : [];
                const sc = stageConfig[stage];
                return (
                  <div key={stage} className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
                    <div className={`px-3 py-2.5 border-b border-gray-100 ${sc.bg}`}>
                      <div className="flex items-center justify-between">
                        <p className={`text-[11px] font-bold uppercase tracking-wide ${sc.color}`}>{sc.label}</p>
                        <span className={`text-[10px] font-bold tabular-nums px-1.5 py-px rounded-full ${sc.bg} ${sc.color}`}>{stageDisputes.length}</span>
                      </div>
                    </div>
                    <div className="p-2 space-y-2 min-h-[120px] max-h-[400px] overflow-y-auto">
                      {stageDisputes.map(d => {
                        const urg = urgencyOf(d);
                        return (
                          <div key={d.id} onClick={() => { setActiveTab('inbox'); setSelectedDispute(d.id); }}
                            className={`rounded-[6px] border p-2.5 cursor-pointer hover:shadow-sm transition-all ${
                              urg === 'critical' ? 'border-red-200 bg-red-50/30' : 'border-gray-200 hover:border-brand/30'
                            }`}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] font-bold text-gray-500">{d.id}</p>
                              {d.daysLeft <= 7 && d.stage !== 'won' && d.stage !== 'lost' && (
                                <span className={`text-[8px] font-bold px-1 py-px rounded ${urgencyColor[urg].bg} ${urgencyColor[urg].text}`}>
                                  {d.daysLeft <= 0 ? 'OVERDUE' : `${d.daysLeft}d`}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-gray-900 truncate">{d.merchant}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] text-gray-500">{d.cardNetwork} {d.reasonCode}</span>
                              <span className="text-xs font-bold tabular-nums text-gray-900">{fmt(d.amount)}</span>
                            </div>
                            {/* Evidence progress bar */}
                            {!['won', 'lost'].includes(d.stage) && d.evidenceTypes.length > 0 && (
                              <div className="mt-2">
                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-brand rounded-full" style={{ width: `${(d.evidenceCollected.length / d.evidenceTypes.length) * 100}%` }} />
                                </div>
                                <p className="text-[8px] text-gray-400 mt-0.5">{d.evidenceCollected.length}/{d.evidenceTypes.length} evidence</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {/* Show lost disputes in the Won column */}
                      {lostDisputes.map(d => (
                        <div key={d.id} className="rounded-[6px] border border-red-200 bg-red-50/30 p-2.5 cursor-pointer hover:shadow-sm"
                          onClick={() => { setActiveTab('inbox'); setStageFilter('all'); setSelectedDispute(d.id); }}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-bold text-gray-500">{d.id}</p>
                            <span className="text-[8px] font-bold px-1 py-px rounded bg-red-100 text-red-700">LOST</span>
                          </div>
                          <p className="text-xs font-semibold text-gray-900 truncate">{d.merchant}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-gray-500">{d.cardNetwork} {d.reasonCode}</span>
                            <span className="text-xs font-bold tabular-nums text-red-600">{fmt(d.amount)}</span>
                          </div>
                        </div>
                      ))}
                      {stageDisputes.length === 0 && lostDisputes.length === 0 && (
                        <p className="text-[10px] text-gray-400 text-center py-4">No disputes yet</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SLA Tracking */}
            <div className="bg-white rounded-[8px] border border-gray-200">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-900">SLA Tracking — Response Deadlines</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-100 bg-gray-50">
                    <Th className="pl-5">Dispute</Th><Th>Merchant</Th><Th>Stage</Th><Th>Deadline</Th><Th>Time Remaining</Th><Th>Handler</Th><Th>SLA Status</Th>
                  </tr></thead>
                  <tbody>
                  {activeDisputes.map(d => {
                      const urg = urgencyOf(d);
                      const slaStatus = d.daysLeft <= 0 ? 'BREACHED' : d.daysLeft <= 3 ? 'AT RISK' : 'ON TRACK';
                      const slaColor = d.daysLeft <= 0 ? 'text-red-700 bg-red-50' : d.daysLeft <= 3 ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50';
                      return (
                        <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="pl-5 py-2.5"><p className="text-sm font-semibold text-gray-900">{d.id}</p><p className="text-[10px] text-gray-400">{d.cardNetwork} {d.reasonCode}</p></td>
                          <td className="py-2.5 text-sm text-gray-700">{d.merchant}</td>
                          <td className="py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${stageConfig[d.stage].bg} ${stageConfig[d.stage].color}`}>{stageConfig[d.stage].label}</span></td>
                          <td className="py-2.5 text-xs tabular-nums text-gray-600">{fmtDateFull(d.responseDeadline)}</td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${d.daysLeft <= 0 ? 'bg-red-500' : d.daysLeft <= 3 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${Math.max(0, Math.min(100, ((30 - Math.max(0, d.daysLeft)) / 30) * 100))}%` }} />
                              </div>
                              <span className={`text-xs font-bold tabular-nums ${d.daysLeft <= 0 ? 'text-red-600' : d.daysLeft <= 3 ? 'text-amber-600' : 'text-gray-600'}`}>
                                {d.daysLeft <= 0 ? `${Math.abs(d.daysLeft)}d overdue` : `${d.daysLeft}d`}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 text-xs text-gray-600">{d.handler}</td>
                          <td className="py-2.5"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${slaColor}`}>{slaStatus}</span></td>
                        </tr>
                      );
                    })}
                    {activeDisputes.length === 0 && (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">No active disputes yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* REASON CODES TAB                        */}
        {/* ════════════════════════════════════════ */}
        {activeTab === 'codes' && (
          <div className="space-y-4">
            <div className="bg-white rounded-[8px] border border-gray-200">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Reason Code Classification Engine</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Auto-tagged codes with required evidence and representment strategy (CPFPP exam framework)</p>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {Object.entries(REASON_CODES).map(([code, info]) => {
                  const disputeCount = DISPUTES.filter(d => d.reasonCode === code).length;
                  return (
                    <div key={code} className="px-5 py-4 hover:bg-gray-50/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-brand">{code}</span>
                            <span className="text-[9px] text-gray-400 font-medium">{info.network}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{info.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${categoryColors[info.category === 'Fraud' ? 'fraud' : info.category === 'Authorization' ? 'authorization' : info.category === 'Processing Errors' ? 'processing' : 'service'].bg} ${categoryColors[info.category === 'Fraud' ? 'fraud' : info.category === 'Authorization' ? 'authorization' : info.category === 'Processing Errors' ? 'processing' : 'service'].text}`}>
                                {info.category.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-gray-400">{disputeCount} dispute{disputeCount !== 1 ? 's' : ''} in portfolio</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Historical Win Rate</p>
                          <p className={`text-lg font-bold ${info.winRate >= 0.6 ? 'text-emerald-600' : info.winRate >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>{fmtPct(info.winRate)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-2">Required Evidence</p>
                          <div className="space-y-1">
                            {info.requiredEvidence.map((ev, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                                <Paperclip className="w-3 h-3 text-gray-400 shrink-0" />
                                {ev}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-2">Recommended Strategy</p>
                          <p className="text-xs text-gray-600 leading-relaxed bg-indigo-50/50 rounded-[6px] p-3 border border-indigo-100">{info.strategy}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(REASON_CODES).length === 0 && (
                  <p className="px-5 py-12 text-center text-sm text-gray-400">No reason codes yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* ANALYTICS TAB                           */}
        {/* ════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Top KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <KpiCard label="Total Disputes" value={analytics.total.toString()} sub={`${analytics.active} active, ${analytics.resolved} resolved`} accent="indigo" />
              <KpiCard label="Win Rate" value={fmtPct(analytics.winRate)} sub={`${analytics.won}W / ${analytics.lost}L`} accent={analytics.winRate >= 0.6 ? 'emerald' : 'amber'} />
              <KpiCard label="Dollars Recovered" value={fmt(analytics.recoveredAmount)} sub="From won disputes" accent="emerald" />
              <KpiCard label="Dollars Lost" value={fmt(analytics.lostAmount)} sub="From lost disputes" accent="red" />
              <KpiCard label="At Risk" value={fmt(analytics.pendingAmount)} sub={`${analytics.active} pending disputes`} accent="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Win Rate by Reason Code */}
              <div className="bg-white rounded-[8px] border border-gray-200">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand" />
                  <h3 className="text-sm font-semibold text-gray-900">Win Rate by Reason Code</h3>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {Object.entries(analytics.byReasonCode).map(([code, data]) => {
                    const wr = data.total > 0 ? data.wins / data.total : 0;
                    return (
                      <div key={code}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-900">{code} <span className="text-gray-400 font-normal">({data.total})</span></span>
                          <span className={`text-xs font-bold ${wr >= 0.6 ? 'text-emerald-600' : wr >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>{fmtPct(wr)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${wr >= 0.6 ? 'bg-emerald-500' : wr >= 0.5 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${wr * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(analytics.byReasonCode).length === 0 && <p className="text-xs text-gray-400">No resolved disputes yet</p>}
                </div>
              </div>

              {/* Win Rate by Vertical */}
              <div className="bg-white rounded-[8px] border border-gray-200">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Win Rate by Vertical</h3>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {Object.entries(analytics.byVertical).sort((a, b) => (b[1].total > 0 ? b[1].wins / b[1].total : 0) - (a[1].total > 0 ? a[1].wins / a[1].total : 0)).map(([vert, data]) => {
                    const wr = data.total > 0 ? data.wins / data.total : 0;
                    return (
                      <div key={vert}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-900">{vert} <span className="text-gray-400 font-normal">({data.total})</span></span>
                          <span className={`text-xs font-bold ${wr >= 0.6 ? 'text-emerald-600' : wr >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>{fmtPct(wr)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${wr >= 0.6 ? 'bg-emerald-500' : wr >= 0.5 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${wr * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(analytics.byVertical).length === 0 && <p className="text-xs text-gray-400">No resolved disputes yet</p>}
                </div>
              </div>

              {/* Win Rate by Evidence Type */}
              <div className="bg-white rounded-[8px] border border-gray-200">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Win Rate by Evidence Type</h3>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {Object.entries(analytics.byEvidence).sort((a, b) => (b[1].total > 0 ? b[1].wins / b[1].total : 0) - (a[1].total > 0 ? a[1].wins / a[1].total : 0)).map(([ev, data]) => {
                    const wr = data.total > 0 ? data.wins / data.total : 0;
                    return (
                      <div key={ev}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-900">{ev} <span className="text-gray-400">({data.total})</span></span>
                          <span className={`text-xs font-bold ${wr >= 0.6 ? 'text-emerald-600' : wr >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>{fmtPct(wr)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${wr >= 0.6 ? 'bg-emerald-500' : wr >= 0.5 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${wr * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(analytics.byEvidence).length === 0 && <p className="text-xs text-gray-400">No resolved disputes yet</p>}
                </div>
              </div>
            </div>

            {/* Representment Argument Effectiveness */}
            <div className="bg-white rounded-[8px] border border-gray-200">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <div><h3 className="text-sm font-semibold text-gray-900">Representment Argument Effectiveness</h3><p className="text-xs text-gray-500 mt-0.5">Which evidence combinations actually win disputes</p></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-100 bg-gray-50">
                    <Th className="pl-5">Evidence Combination</Th><Th>Times Used</Th><Th>Wins</Th><Th>Losses</Th><Th>Win Rate</Th><Th>Verdict</Th>
                  </tr></thead>
                  <tbody>
                    {ARGUMENT_EFFECTIVENESS.map((row, i) => {
                      const wr = row.used > 0 ? row.wins / row.used : 0;
                      return (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="pl-5 py-2.5 text-sm text-gray-900">{row.combo}</td>
                          <td className="py-2.5 text-sm tabular-nums text-gray-600">{row.used}</td>
                          <td className="py-2.5 text-sm tabular-nums text-emerald-600 font-semibold">{row.wins}</td>
                          <td className="py-2.5 text-sm tabular-nums text-red-600 font-semibold">{row.losses}</td>
                          <td className="py-2.5"><span className={`text-sm font-bold ${wr >= 0.6 ? 'text-emerald-600' : wr > 0 ? 'text-amber-600' : 'text-red-600'}`}>{fmtPct(wr)}</span></td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${wr >= 0.8 ? 'bg-emerald-50 text-emerald-700' : wr >= 0.5 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                              {wr >= 0.8 ? 'STRONG' : wr >= 0.5 ? 'MODERATE' : 'WEAK'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {ARGUMENT_EFFECTIVENESS.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No representment data yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* PRE-CHARGEBACK ALERTS TAB                */}
        {/* ════════════════════════════════════════ */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-[8px] border border-amber-200 p-4 flex items-start gap-3">
              <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Pre-Chargeback Alerts (Phase 2)</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Connect Verifi CDRN or Ethoca to surface alerts <span className="font-semibold">before</span> they become formal disputes.
                  Proactive refunds are cheaper than fighting chargebacks and protect the merchant's CB ratio (must stay below 1% Visa / 1.5% MC).
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[8px] border border-gray-200">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Active Pre-Chargeback Alerts</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> {PRE_ALERTS.filter(a => a.status === 'pending').length} pending</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> {PRE_ALERTS.filter(a => a.status === 'refunded').length} refunded</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" /> {PRE_ALERTS.filter(a => a.status === 'expired').length} expired</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-100 bg-gray-50">
                    <Th className="pl-5">Alert</Th><Th>Source</Th><Th>Merchant</Th><Th>Descriptor</Th><Th>Amount</Th><Th>Card</Th><Th>Expires In</Th><Th>Status</Th><Th className="pr-5">Action</Th>
                  </tr></thead>
                  <tbody>
                    {PRE_ALERTS.map(a => {
                      const statusColors: Record<string, { bg: string; text: string }> = {
                        pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
                        refunded: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
                        expired: { bg: 'bg-gray-100', text: 'text-gray-500' },
                      };
                      const sc = statusColors[a.status];
                      return (
                        <tr key={a.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${a.status === 'pending' && a.expiresIn <= 24 ? 'bg-amber-50/30' : ''}`}>
                          <td className="pl-5 py-2.5">
                            <p className="text-sm font-semibold text-gray-900">{a.id}</p>
                            <p className="text-[10px] text-gray-400">{fmtDate(a.alertDate)}</p>
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.source === 'Verifi CDRN' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                              {a.source}
                            </span>
                          </td>
                          <td className="py-2.5 text-sm text-gray-900">{a.merchant}</td>
                          <td className="py-2.5 text-xs font-mono text-gray-500">{a.descriptor}</td>
                          <td className="py-2.5 text-sm font-semibold tabular-nums text-gray-900">{fmt(a.amount)}</td>
                          <td className="py-2.5 text-xs font-mono text-gray-500">****{a.cardLast4}</td>
                          <td className="py-2.5">
                            {a.status === 'pending' ? (
                              <span className={`text-xs font-bold tabular-nums ${a.expiresIn <= 24 ? 'text-red-600' : 'text-amber-600'}`}>{a.expiresIn}h</span>
                            ) : <span className="text-xs text-gray-400">-</span>}
                          </td>
                          <td className="py-2.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.bg} ${sc.text}`}>{a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
                          <td className="pr-5 py-2.5">
                            {a.status === 'pending' ? (
                              <button className="px-3 py-1.5 bg-brand text-white text-[10px] font-semibold rounded-[6px] hover:bg-brand-hover transition-colors">
                                Issue Refund
                              </button>
                            ) : <span className="text-xs text-gray-400">-</span>}
                          </td>
                        </tr>
                      );
                    })}
                    {PRE_ALERTS.length === 0 && (
                      <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">No pre-chargeback alerts yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CB Ratio Monitor */}
            <div className="bg-white rounded-[8px] border border-gray-200">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-semibold text-gray-900">Chargeback Ratio Monitor</h3>
              </div>
              <div className="px-5 py-4">
                <p className="py-8 text-center text-sm text-gray-400">No chargeback ratio data yet</p>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* CHARGEBACK COST CALCULATOR TAB          */}
        {/* ════════════════════════════════════════ */}
        {activeTab === 'costcalc' && (() => {
          const CB_FEE_MIN = 0;
          const CB_FEE_MAX = 0;
          const LABOR_RATE_PER_HOUR = 0;
          const AVG_HOURS_PER_DISPUTE = 0;
          const laborPerDispute = LABOR_RATE_PER_HOUR * AVG_HOURS_PER_DISPUTE;

          const merchantRatios: MerchantRatio[] = [];

          // Network fine tiers
          const fineExposure = merchantRatios.filter(m => m.pctOfThreshold >= 0.5);
          const criticalRatio = merchantRatios.filter(m => m.pctOfThreshold >= 0.8);

          // Per-dispute cost breakdown
          const disputeCosts = DISPUTES.map(d => {
            const cbFee = CB_FEE_MIN;
            const lostRevenue = d.amount;
            const networkFine = 0;
            const totalInaction = cbFee + lostRevenue + laborPerDispute + networkFine;
            const winProb = REASON_CODES[d.reasonCode]?.winRate ?? 0;
            const expectedRecovery = lostRevenue * winProb;
            const representmentCost = laborPerDispute;
            const netROI = expectedRecovery - representmentCost;
            const roiPct = representmentCost > 0 ? (netROI / representmentCost) * 100 : 0;
            return { ...d, cbFee, lostRevenue, laborCost: laborPerDispute, networkFine, totalInaction, winProb, expectedRecovery, representmentCost, netROI, roiPct };
          });

          // Aggregates
          const totalCBFees = disputeCosts.reduce((s, d) => s + d.cbFee, 0);
          const totalLostRevenue = disputeCosts.reduce((s, d) => s + d.lostRevenue, 0);
          const totalLaborCost = disputeCosts.reduce((s, d) => s + d.laborCost, 0);
          const totalNetworkFines = disputeCosts.reduce((s, d) => s + d.networkFine, 0);
          const totalInaction = totalCBFees + totalLostRevenue + totalLaborCost + totalNetworkFines;
          const totalExpectedRecovery = disputeCosts.reduce((s, d) => s + d.expectedRecovery, 0);
          const totalRepresentmentCost = disputeCosts.reduce((s, d) => s + d.representmentCost, 0);
          const portfolioROI = totalRepresentmentCost > 0 ? ((totalExpectedRecovery - totalRepresentmentCost) / totalRepresentmentCost) * 100 : 0;

          // Won/lost actuals
          const wonDisputes = disputeCosts.filter(d => d.outcome === 'won');
          const lostDisputes = disputeCosts.filter(d => d.outcome === 'lost');
          const actualRecovered = wonDisputes.reduce((s, d) => s + d.amount, 0);
          const actualLost = lostDisputes.reduce((s, d) => s + d.totalInaction, 0);
          const actualSaved = actualRecovered + wonDisputes.reduce((s, d) => s + d.cbFee + d.networkFine, 0);

          return (
            <div className="space-y-6">
              {/* Module ROI Banner */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[8px] border border-emerald-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-sm font-bold text-emerald-900">Dispute Management ROI</h3>
                    </div>
                    <p className="text-xs text-emerald-700 leading-relaxed max-w-xl">
                      Every dispute left unfought costs you the transaction amount <strong>plus</strong> chargeback fees, labor overhead, and potential card network fines.
                      This calculator shows the true cost of inaction and proves the ROI of systematic representment.
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-6">
                    <p className="text-[10px] text-emerald-600 uppercase tracking-wide font-bold mb-1">Portfolio ROI</p>
                    <p className="text-3xl font-bold text-emerald-700 tabular-nums">{portfolioROI.toFixed(0)}%</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">Expected return on representment</p>
                  </div>
                </div>
              </div>

              {/* Aggregate Cost KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="bg-white rounded-[8px] border border-gray-200 border-t-2 border-t-red-500 p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-1">Total CB Fees</p>
                  <p className="text-lg font-bold text-red-700 tabular-nums">{fmt(totalCBFees)}</p>
                  <p className="text-[10px] text-gray-400 mt-1">${CB_FEE_MIN}-${CB_FEE_MAX} per dispute</p>
                </div>
                <div className="bg-white rounded-[8px] border border-gray-200 border-t-2 border-t-red-500 p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-1">Lost Revenue</p>
                  <p className="text-lg font-bold text-red-700 tabular-nums">{fmt(totalLostRevenue)}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{DISPUTES.length} txn amounts</p>
                </div>
                <div className="bg-white rounded-[8px] border border-gray-200 border-t-2 border-t-amber-500 p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-1">Labor Cost</p>
                  <p className="text-lg font-bold text-amber-700 tabular-nums">{fmt(totalLaborCost)}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{AVG_HOURS_PER_DISPUTE}h × ${LABOR_RATE_PER_HOUR}/hr</p>
                </div>
                <div className="bg-white rounded-[8px] border border-gray-200 border-t-2 border-t-amber-500 p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-1">Fine Exposure</p>
                  <p className="text-lg font-bold text-amber-700 tabular-nums">{fmt(totalNetworkFines)}</p>
                  <p className="text-[10px] text-gray-400 mt-1">If ratio breaches</p>
                </div>
                <div className="bg-white rounded-[8px] border border-gray-200 border-t-2 border-t-red-500 p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-1">Total Cost (Inaction)</p>
                  <p className="text-lg font-bold text-red-700 tabular-nums">{fmt(totalInaction)}</p>
                  <p className="text-[10px] text-gray-400 mt-1">If no disputes fought</p>
                </div>
                <div className="bg-white rounded-[8px] border border-gray-200 border-t-2 border-t-emerald-500 p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-1">Actual Saved</p>
                  <p className="text-lg font-bold text-emerald-700 tabular-nums">{fmt(actualSaved)}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{wonDisputes.length} won disputes</p>
                </div>
              </div>

              {/* Per-Dispute Cost Breakdown Table */}
              <div className="bg-white rounded-[8px] border border-gray-200">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-red-500" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Per-Dispute Cost Breakdown</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Full cost analysis for every dispute — fee + lost revenue + labor + fine exposure</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700">{fmt(totalInaction)} total exposure</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <Th className="pl-5">Dispute</Th>
                        <Th>Txn Amount</Th>
                        <Th>CB Fee</Th>
                        <Th>Lost Revenue</Th>
                        <Th>Labor</Th>
                        <Th>Fine Risk</Th>
                        <Th>Total Inaction</Th>
                        <Th>Win Prob</Th>
                        <Th>Exp. Recovery</Th>
                        <Th className="pr-5">ROI</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {disputeCosts.sort((a, b) => b.totalInaction - a.totalInaction).map(d => {
                        const isResolved = d.stage === 'won' || d.stage === 'lost';
                        const rowBg = d.outcome === 'won' ? 'bg-emerald-50/30' : d.outcome === 'lost' ? 'bg-red-50/30' : '';
                        return (
                          <tr key={d.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${rowBg}`}>
                            <td className="pl-5 py-2.5">
                              <p className="text-sm font-medium text-gray-900">{d.merchant}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-gray-400 font-mono">{d.id}</span>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold ${stageConfig[d.stage].bg} ${stageConfig[d.stage].color}`}>{stageConfig[d.stage].label}</span>
                              </div>
                            </td>
                            <td className="py-2.5 text-sm font-semibold tabular-nums text-gray-900">{fmt(d.amount)}</td>
                            <td className="py-2.5 text-sm tabular-nums text-red-600">{fmt(d.cbFee)}</td>
                            <td className="py-2.5 text-sm tabular-nums text-red-600">{fmt(d.lostRevenue)}</td>
                            <td className="py-2.5 text-sm tabular-nums text-amber-600">{fmt(d.laborCost)}</td>
                            <td className="py-2.5 text-sm tabular-nums text-amber-600">{fmt(d.networkFine)}</td>
                            <td className="py-2.5">
                              <span className="text-sm font-bold tabular-nums text-red-700">{fmt(d.totalInaction)}</span>
                            </td>
                            <td className="py-2.5">
                              {isResolved ? (
                                <span className={`text-xs font-bold ${d.outcome === 'won' ? 'text-emerald-600' : 'text-red-600'}`}>{d.outcome === 'won' ? 'WON' : 'LOST'}</span>
                              ) : (
                                <span className={`text-xs font-semibold tabular-nums ${d.winProb >= 0.65 ? 'text-emerald-600' : d.winProb >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>{fmtPct(d.winProb)}</span>
                              )}
                            </td>
                            <td className="py-2.5 text-sm tabular-nums text-emerald-600">{fmt(d.expectedRecovery)}</td>
                            <td className="pr-5 py-2.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${d.roiPct >= 100 ? 'bg-emerald-50 text-emerald-700' : d.roiPct >= 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                {d.roiPct >= 0 ? '+' : ''}{d.roiPct.toFixed(0)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {disputeCosts.length === 0 && (
                        <tr><td colSpan={10} className="px-5 py-12 text-center text-sm text-gray-400">No dispute cost data yet</td></tr>
                      )}
                      {/* Totals row */}
                      <tr className="bg-gray-50 border-t-2 border-gray-200">
                        <td className="pl-5 py-3 text-sm font-bold text-gray-900">Portfolio Total ({DISPUTES.length} disputes)</td>
                        <td className="py-3 text-sm font-bold tabular-nums text-gray-900">{fmt(totalLostRevenue)}</td>
                        <td className="py-3 text-sm font-bold tabular-nums text-red-700">{fmt(totalCBFees)}</td>
                        <td className="py-3 text-sm font-bold tabular-nums text-red-700">{fmt(totalLostRevenue)}</td>
                        <td className="py-3 text-sm font-bold tabular-nums text-amber-700">{fmt(totalLaborCost)}</td>
                        <td className="py-3 text-sm font-bold tabular-nums text-amber-700">{fmt(totalNetworkFines)}</td>
                        <td className="py-3 text-base font-bold tabular-nums text-red-700">{fmt(totalInaction)}</td>
                        <td className="py-3 text-sm font-bold tabular-nums text-gray-600">{fmtPct(analytics.winRate)}</td>
                        <td className="py-3 text-sm font-bold tabular-nums text-emerald-700">{fmt(totalExpectedRecovery)}</td>
                        <td className="pr-5 py-3"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tabular-nums bg-emerald-100 text-emerald-800">+{portfolioROI.toFixed(0)}%</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card Network Fine Exposure */}
              <div className="bg-white rounded-[8px] border border-gray-200">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Card Network Fine Exposure</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Visa VDMP / Mastercard ECM program thresholds — fines escalate with each month in breach</p>
                    </div>
                  </div>
                  {criticalRatio.length > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700">{criticalRatio.length} approaching threshold</span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">All within limits</span>
                  )}
                </div>
                <div className="px-5 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="rounded-[6px] border border-blue-200 bg-blue-50/50 p-3">
                      <p className="text-[10px] text-blue-700 uppercase tracking-wide font-bold mb-2">Visa VDMP Fine Schedule</p>
                      <p className="py-3 text-center text-xs text-gray-400">No Visa fine schedule data yet</p>
                    </div>
                    <div className="rounded-[6px] border border-orange-200 bg-orange-50/50 p-3">
                      <p className="text-[10px] text-orange-700 uppercase tracking-wide font-bold mb-2">Mastercard ECM Fine Schedule</p>
                      <p className="py-3 text-center text-xs text-gray-400">No Mastercard fine schedule data yet</p>
                    </div>
                  </div>

                  {/* Per-merchant ratio vs threshold */}
                  <div className="space-y-3">
                    {merchantRatios.sort((a, b) => b.pctOfThreshold - a.pctOfThreshold).map((m, i) => {
                      const barColor = m.pctOfThreshold >= 0.8 ? 'bg-red-500' : m.pctOfThreshold >= 0.5 ? 'bg-amber-500' : 'bg-emerald-500';
                      const textColor = m.pctOfThreshold >= 0.8 ? 'text-red-600' : m.pctOfThreshold >= 0.5 ? 'text-amber-600' : 'text-emerald-600';
                      const monthlyFine = 0;
                      return (
                        <div key={i} className={`rounded-[6px] border p-3 ${m.pctOfThreshold >= 0.8 ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-gray-50/50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900">{m.merchant}</p>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-500">{m.network}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-gray-400">{m.cbCount} CB / {m.txnCount.toLocaleString()} txns</span>
                              <span className={`text-sm font-bold tabular-nums ${textColor}`}>{(m.ratio * 100).toFixed(2)}%</span>
                              {monthlyFine > 0 && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">~{fmt(monthlyFine)}/mo fine risk</span>}
                            </div>
                          </div>
                          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`absolute inset-y-0 left-0 rounded-full ${barColor}`} style={{ width: `${Math.min(m.pctOfThreshold * 100, 100)}%` }} />
                            <div className="absolute inset-y-0 right-0 w-px bg-red-500" style={{ left: '100%' }} />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-gray-400">0%</span>
                            <span className="text-[10px] text-gray-400">{fmtPct(m.pctOfThreshold)} of {m.network} threshold ({(m.threshold * 100).toFixed(1)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                    {merchantRatios.length === 0 && (
                      <p className="py-8 text-center text-sm text-gray-400">No chargeback ratio data yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ROI Summary — The Business Case */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost of Inaction */}
                <div className="bg-white rounded-[8px] border border-red-200">
                  <div className="px-5 py-3.5 border-b border-red-100 bg-red-50/50 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-red-900">Cost of Inaction (Not Fighting)</h3>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    {[
                      { label: 'Chargeback Fees', value: totalCBFees, desc: `$${CB_FEE_MIN}-$${CB_FEE_MAX} × ${DISPUTES.length} disputes`, icon: '💳' },
                      { label: 'Lost Transaction Revenue', value: totalLostRevenue, desc: 'Full amount of disputed transactions', icon: '📉' },
                      { label: 'Representment Labor', value: totalLaborCost, desc: `${AVG_HOURS_PER_DISPUTE}h × $${LABOR_RATE_PER_HOUR}/hr × ${DISPUTES.length} disputes`, icon: '⏱' },
                      { label: 'Network Fine Exposure', value: totalNetworkFines, desc: 'Escalating fines if CB ratio breaches', icon: '⚠' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                        <span className="text-lg">{item.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-[10px] text-gray-400">{item.desc}</p>
                        </div>
                        <span className="text-sm font-bold tabular-nums text-red-700">{fmt(item.value)}</span>
                      </div>
                    ))}
                    <div className="bg-red-50 rounded-[6px] p-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-red-800">Total Cost of Doing Nothing</p>
                      <span className="text-xl font-bold tabular-nums text-red-700">{fmt(totalInaction)}</span>
                    </div>
                  </div>
                </div>

                {/* Value of Fighting */}
                <div className="bg-white rounded-[8px] border border-emerald-200">
                  <div className="px-5 py-3.5 border-b border-emerald-100 bg-emerald-50/50 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-emerald-900">Value of Systematic Representment</h3>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    {[
                      { label: 'Expected Recovery (All)', value: totalExpectedRecovery, desc: `Based on ${fmtPct(analytics.winRate)} win rate`, positive: true },
                      { label: 'Actual Recovered (Won)', value: actualRecovered, desc: `${wonDisputes.length} disputes won`, positive: true },
                      { label: 'Fees + Fines Avoided', value: wonDisputes.reduce((s, d) => s + d.cbFee + d.networkFine, 0), desc: 'CB fees + network fines not incurred', positive: true },
                      { label: 'Representment Cost', value: totalRepresentmentCost, desc: `Labor investment (${DISPUTES.length} disputes)`, positive: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-[10px] text-gray-400">{item.desc}</p>
                        </div>
                        <span className={`text-sm font-bold tabular-nums ${item.positive ? 'text-emerald-700' : 'text-gray-600'}`}>{item.positive ? '+' : '-'}{fmt(item.value)}</span>
                      </div>
                    ))}
                    <div className="bg-emerald-50 rounded-[6px] p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-emerald-800">Net Expected Value</p>
                        <span className="text-xl font-bold tabular-nums text-emerald-700">+{fmt(totalExpectedRecovery - totalRepresentmentCost)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-emerald-700">Portfolio ROI on Representment</p>
                        <span className="text-lg font-bold tabular-nums text-emerald-800">+{portfolioROI.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="bg-brand/5 rounded-[6px] border border-brand/20 p-3 mt-2">
                      <p className="text-xs text-brand font-semibold mb-1">Bottom Line</p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        For every <strong className="text-gray-900">$1</strong> spent on representment labor, you recover an expected <strong className="text-emerald-700">${totalRepresentmentCost > 0 ? (totalExpectedRecovery / totalRepresentmentCost).toFixed(2) : '0.00'}</strong> in transaction revenue.
                        Not fighting disputes costs <strong className="text-red-700">{fmt(totalInaction)}</strong> across the portfolio — {totalRepresentmentCost > 0 ? (totalInaction / totalRepresentmentCost).toFixed(1) : '0.0'}× more than the cost of fighting them.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {DISPUTES.length} total disputes — {analytics.active} active
          </p>
          <p className="text-xs text-gray-400"><span className="text-brand font-bold">delt</span>pay.com</p>
        </div>
      </div>

      {/* ════════════════════════════════════════ */}
      {/* EVIDENCE BUILDER MODAL                   */}
      {/* ════════════════════════════════════════ */}
      {evidenceModal && (() => {
        const dispute = DISPUTES.find(d => d.id === evidenceModal);
        if (!dispute) return null;
        const rcInfo = REASON_CODES[dispute.reasonCode];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setEvidenceModal(null)} />
            <div className="relative bg-white rounded-[8px] shadow-2xl border border-gray-200 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Evidence Builder</h2>
                    <p className="text-xs text-gray-500">{dispute.id} — {dispute.merchant} — {dispute.cardNetwork} {dispute.reasonCode}</p>
                  </div>
                  <button onClick={() => setEvidenceModal(null)} className="p-2 hover:bg-gray-100 rounded-[6px] text-gray-500 text-lg">&times;</button>
                </div>
              </div>

              {rcInfo && (
                <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100">
                  <p className="text-[10px] text-indigo-600 uppercase tracking-wide font-bold mb-1">Recommended Strategy — {dispute.reasonCode}</p>
                  <p className="text-xs text-indigo-700 leading-relaxed">{rcInfo.strategy}</p>
                </div>
              )}

              <div className="px-6 py-5 space-y-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Required Evidence Collection</p>

                {dispute.evidenceTypes.map((ev, i) => {
                  const collected = dispute.evidenceCollected.includes(ev);
                  return (
                    <div key={i} className={`rounded-[6px] border p-3 ${collected ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 border-dashed bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {collected ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${collected ? 'text-emerald-800' : 'text-gray-700'}`}>{ev}</p>
                            {collected && <p className="text-[10px] text-emerald-600 mt-0.5">Uploaded &bull; Verified</p>}
                          </div>
                        </div>
                        {!collected ? (
                          <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-[6px] hover:bg-gray-50 flex items-center gap-1.5">
                              <Upload className="w-3 h-3" /> Upload
                            </button>
                            <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-[6px] hover:bg-gray-50 flex items-center gap-1.5">
                              <GripVertical className="w-3 h-3" /> From Vault
                            </button>
                          </div>
                        ) : (
                          <button className="px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-100 rounded-[4px] flex items-center gap-1">
                            <Eye className="w-3 h-3" /> View
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between sticky bottom-0 bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full" style={{ width: `${dispute.evidenceTypes.length ? (dispute.evidenceCollected.length / dispute.evidenceTypes.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{dispute.evidenceCollected.length}/{dispute.evidenceTypes.length} collected</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setEvidenceModal(null)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-[6px] hover:bg-gray-50">Cancel</button>
                  <button className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover flex items-center gap-2">
                    <Send className="w-3.5 h-3.5" /> Submit for Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ════════════════════════════════════════ */}
      {/* CHARGEBACK COST CALCULATOR MODAL         */}
      {/* ════════════════════════════════════════ */}
      {costCalcId && (() => {
        const dispute = DISPUTES.find(d => d.id === costCalcId);
        if (!dispute) return null;
        const cbFee = 0;
        const lostRevenue = dispute.amount;
        const laborCost = 0;
        const networkFineRisk = 0;
        const totalCostOfInaction = cbFee + lostRevenue + laborCost + networkFineRisk;
        const representmentCost = laborCost;
        const expectedRecovery = lostRevenue * (REASON_CODES[dispute.reasonCode]?.winRate ?? 0);
        const roi = representmentCost > 0 ? ((expectedRecovery - representmentCost) / representmentCost) * 100 : 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setCostCalcId(null)} />
            <div className="relative bg-white rounded-[8px] shadow-2xl border border-gray-200 w-full max-w-md mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Chargeback Cost Calculator</h2>
                    <p className="text-xs text-gray-500">{dispute.id} — {dispute.merchant}</p>
                  </div>
                  <button onClick={() => setCostCalcId(null)} className="p-2 hover:bg-gray-100 rounded-[6px] text-gray-500 text-lg">&times;</button>
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-3">Cost of Inaction (Not Fighting)</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Chargeback Fee', value: cbFee, note: 'Network / processor fee' },
                      { label: 'Lost Transaction Revenue', value: lostRevenue, note: 'Full transaction amount' },
                      { label: 'Representment Labor', value: laborCost, note: 'Staff time for response' },
                      { label: 'Network Fine Risk', value: networkFineRisk, note: 'If CB ratio breaches threshold' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <div><p className="text-sm text-gray-700">{item.label}</p><p className="text-[10px] text-gray-400">{item.note}</p></div>
                        <span className="text-sm font-semibold tabular-nums text-gray-900">{fmt(item.value)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                      <p className="text-sm font-bold text-red-700">Total Cost of Inaction</p>
                      <span className="text-lg font-bold tabular-nums text-red-700">{fmt(totalCostOfInaction)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-[6px] border border-emerald-200 p-3">
                  <p className="text-[10px] text-emerald-700 uppercase tracking-wide font-semibold mb-2">ROI of Fighting This Dispute</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-emerald-700">Win probability ({dispute.reasonCode})</span><span className="font-bold text-emerald-800">{fmtPct(REASON_CODES[dispute.reasonCode]?.winRate ?? 0)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-emerald-700">Expected recovery</span><span className="font-bold text-emerald-800">{fmt(expectedRecovery)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-emerald-700">Representment cost</span><span className="font-bold text-emerald-800">{fmt(representmentCost)}</span></div>
                    <div className="border-t border-emerald-300 pt-1.5 flex justify-between text-xs"><span className="text-emerald-800 font-bold">Expected ROI</span><span className="font-bold text-emerald-800 text-base">{roi.toFixed(0)}%</span></div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
                <button className="flex-1 px-4 py-2 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors">Fight This Dispute</button>
                <button onClick={() => setCostCalcId(null)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-[6px] hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ══════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`py-2.5 px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide text-left ${className}`}>
      {children}
    </th>
  );
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  const accentMap: Record<string, string> = {
    indigo: 'border-t-brand', emerald: 'border-t-emerald-500', amber: 'border-t-amber-500',
    red: 'border-t-red-500', blue: 'border-t-blue-500',
  };
  return (
    <div className={`bg-white rounded-[8px] border border-gray-200 border-t-2 ${accentMap[accent] || ''} p-4`}>
      <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-1.5">{label}</p>
      <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
    </div>
  );
}
