import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Upload, FileText, Sparkles, Download, UserPlus, Clock,
  CheckCircle2, XCircle, Send, TrendingDown, DollarSign,
  AlertCircle, Loader2, X, File, ArrowRight, ExternalLink,
  Flame, Lightbulb, BarChart3, ShieldCheck, ShieldAlert, Eye, Briefcase,
} from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';
import { BackendCostCalculator } from './BackendCostCalculator';
import { generateProposalPdf } from '../proposalPdf';
import { leadActions, useLeads } from '../crmStore';
import { MerchantPresentation } from './MerchantPresentation';
import {
  analyzeProcessing,
  auditFeeLine,
  buildPricingPrograms,
  type ProcessingIntelligence,
  type PricingProgram,
  type PricingProgramKey,
} from '../interchangeEngine';

// ── Types ──
type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'done';
type HistoryStatus = 'Lead Created' | 'Proposal Sent' | 'Won' | 'Lost';

interface FeeRow {
  label: string;
  amount: number;
}

interface ExtractedData {
  currentProcessor: string;
  statementPeriod: string;
  totalVolume: number;
  totalTransactions: number;
  avgTicket: number;
  effectiveRate: number;
  fees: FeeRow[];
  chargebackCount: number;
  currentMonthlyCost: number;
}

interface SavingsProposal {
  currentRate: number;
  deltRate: number;
  currentMonthlyCost: number;
  deltMonthlyCost: number;
  currentAnnualCost: number;
  deltAnnualCost: number;
  annualSavings: number;
  savingsPercent: number;
}

interface HistoryRow {
  id: string;
  merchantName: string;
  dateAnalyzed: string;
  currentRate: number;
  proposedRate: number;
  savings: number;
  status: HistoryStatus;
}

// ── Mock parsed result ──
const mockExtracted: ExtractedData = {
  currentProcessor: 'First Data / Clover',
  statementPeriod: 'March 2026',
  totalVolume: 87432,
  totalTransactions: 1847,
  avgTicket: 47.33,
  effectiveRate: 3.42,
  fees: [
    { label: 'Discount Rate', amount: 1842.18 },
    { label: 'Transaction Fees', amount: 369.40 },
    { label: 'Monthly Fees', amount: 25.00 },
    { label: 'PCI Fees', amount: 19.95 },
    { label: 'Statement Fees', amount: 10.00 },
    { label: 'Batch Fees', amount: 55.41 },
    { label: 'Other', amount: 668.24 },
  ],
  chargebackCount: 2,
  currentMonthlyCost: 2990.18,
};

const mockProposal: SavingsProposal = {
  currentRate: 3.42,
  deltRate: 2.61,
  currentMonthlyCost: 2990.18,
  deltMonthlyCost: 2282.18,
  currentAnnualCost: 35882.16,
  deltAnnualCost: 27386.16,
  annualSavings: 8496.00,
  savingsPercent: 23.7,
};

const historyData: HistoryRow[] = [
  { id: 'h1', merchantName: 'Mario\'s Pizzeria', dateAnalyzed: 'Apr 2, 2026', currentRate: 3.81, proposedRate: 2.74, savings: 7640, status: 'Won' },
  { id: 'h2', merchantName: 'Apex Plumbing LLC', dateAnalyzed: 'Mar 28, 2026', currentRate: 3.15, proposedRate: 2.48, savings: 4920, status: 'Proposal Sent' },
  { id: 'h3', merchantName: 'Bloom Florist', dateAnalyzed: 'Mar 21, 2026', currentRate: 4.02, proposedRate: 2.85, savings: 9360, status: 'Lead Created' },
  { id: 'h4', merchantName: 'QuickLube Auto Care', dateAnalyzed: 'Mar 14, 2026', currentRate: 3.55, proposedRate: 2.63, savings: 6120, status: 'Lost' },
];

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const fmtWhole = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const pctf = (n: number, d = 2) => `${n.toFixed(d)}%`;

// Statement Intelligence walks the analysis in its natural order:
// what you pay (breakdown) → what's wrong (issues/fat) → what to do
// (suggestions) → how we know (modeling).
type IntelTabKey = 'breakdown' | 'issues' | 'suggestions' | 'modeling' | 'economics';
const INTEL_TABS: { key: IntelTabKey; label: string; icon: React.ElementType; internal?: boolean }[] = [
  { key: 'breakdown', label: 'Breakdown', icon: FileText },
  { key: 'issues', label: 'Issues & Fat', icon: Flame },
  { key: 'suggestions', label: 'Suggestions', icon: Lightbulb },
  { key: 'modeling', label: 'Modeling', icon: BarChart3 },
  { key: 'economics', label: 'Deal Economics', icon: DollarSign, internal: true },
];

// ══════════════════════════════════════
// Main Component
// ══════════════════════════════════════
export function BackendAnalysis() {
  const { navigate } = useAppNavigate();
  const [activeView, setActiveView] = useState<'cost-calculator' | 'statement-analyzer'>('cost-calculator');
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [proposal, setProposal] = useState<SavingsProposal | null>(null);
  const [autoLeadCreated, setAutoLeadCreated] = useState(false);
  const [autoLeadName, setAutoLeadName] = useState('');
  const [autoLeadIsNew, setAutoLeadIsNew] = useState(true);
  const [leadBannerVisible, setLeadBannerVisible] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>(historyData);
  const [intelTab, setIntelTab] = useState<IntelTabKey>('breakdown');
  // Merchant view is presentation mode: everything internal (margins, deal
  // economics, CRM chrome, other merchants' history) disappears so the
  // analysis can be shown to the merchant directly.
  const [viewMode, setViewMode] = useState<'agent' | 'merchant'>('agent');
  const inputRef = useRef<HTMLInputElement>(null);
  // Subscribe to the CRM store so it hydrates from Supabase before we
  // create/dedupe leads against it.
  useLeads();

  const intel = useMemo(
    () => (extracted && proposal ? analyzeProcessing(extracted, proposal) : null),
    [extracted, proposal],
  );

  const [programKey, setProgramKey] = useState<PricingProgramKey>('interchange-plus');
  const programs = useMemo(
    () => (extracted && proposal && intel ? buildPricingPrograms(extracted, proposal, intel) : null),
    [extracted, proposal, intel],
  );
  const activeProgram = programs?.find(p => p.key === programKey) ?? programs?.[0] ?? null;
  const maxProgramMargin = programs ? Math.max(...programs.map(p => p.deltMarginMonthly)) : 0;

  const handleFiles = useCallback((incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter(f =>
      f.type === 'application/pdf' || f.type.startsWith('image/')
    );
    if (valid.length) setFiles(prev => [...prev, ...valid]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const analyze = () => {
    if (!files.length) return;
    setStatus('uploading');
    setAutoLeadCreated(false);
    setLeadBannerVisible(false);
    setIntelTab('breakdown');
    setProgramKey('interchange-plus');
    setViewMode('agent');
    setTimeout(() => {
      setStatus('analyzing');
      setTimeout(() => {
        setExtracted(mockExtracted);
        setProposal(mockProposal);
        setStatus('done');

        // Auto-create lead from the uploaded statement
        const fileName = files[0]?.name || 'Statement';
        const merchantName = fileName
          .replace(/\.(pdf|png|jpg|jpeg|tiff?)$/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/statement|stmt|processing/gi, '')
          .trim();
        const derivedName = merchantName.length > 2
          ? merchantName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
          : 'New Prospect';

        // Persist to the pipeline: scrapes the statement's processing profile
        // into the lead's KYB intake, attaches the statement document, and
        // links the savings proposal. Dedupes against existing leads by name.
        const { isNew } = leadActions.createFromStatement({
          merchantName: derivedName,
          fileName,
          fileSize: files[0]?.size || 0,
          statement: mockExtracted,
          proposal: mockProposal,
        });

        setAutoLeadName(derivedName);
        setAutoLeadIsNew(isNew);
        setAutoLeadCreated(true);
        setLeadBannerVisible(true);

        // Add to history
        const newEntry: HistoryRow = {
          id: `h-auto-${Date.now()}`,
          merchantName: derivedName,
          dateAnalyzed: 'Apr 9, 2026',
          currentRate: mockProposal.currentRate,
          proposedRate: mockProposal.deltRate,
          savings: mockProposal.annualSavings,
          status: 'Lead Created',
        };
        setHistory(prev => [newEntry, ...prev]);
      }, 2200);
    }, 800);
  };

  const handleGenerateProposal = () => {
    if (!extracted || !proposal) return;
    // The proposal document reflects the pricing program the agent selected.
    const effective = activeProgram
      ? {
          ...proposal,
          deltRate: Number(activeProgram.effectiveRatePct.toFixed(2)),
          deltMonthlyCost: activeProgram.merchantMonthlyCost,
          deltAnnualCost: activeProgram.merchantMonthlyCost * 12,
          annualSavings: activeProgram.annualSavings,
          savingsPercent: Number(activeProgram.savingsPct.toFixed(1)),
        }
      : proposal;
    generateProposalPdf({
      merchantName: autoLeadName || 'Merchant',
      sourceFileName: files[0]?.name || 'statement.pdf',
      statement: extracted,
      proposal: effective,
      program: activeProgram ?? undefined,
    });
  };

  const reset = () => {
    setStatus('idle');
    setFiles([]);
    setExtracted(null);
    setProposal(null);
  };

  const statusBadge = (s: HistoryStatus) => {
    const cfg: Record<HistoryStatus, string> = {
      'Lead Created': 'bg-blue-50 text-blue-700',
      'Proposal Sent': 'bg-amber-50 text-amber-700',
      'Won': 'bg-emerald-50 text-emerald-700',
      'Lost': 'bg-gray-100 text-gray-500',
    };
    return cfg[s];
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* ── Header ── */}
        <div>
          <p className="text-sm text-gray-500 mt-0.5">Cost calculator and statement analysis tools.</p>
        </div>

        {/* ── View Tabs ── */}
        <div className="border-b border-gray-200">
          <div className="flex gap-1">
            {([
              { key: 'cost-calculator' as const, label: 'Cost Calculator' },
              { key: 'statement-analyzer' as const, label: 'Statement Analyzer' },
            ]).map(t => (
              <button
                key={t.key}
                onClick={() => setActiveView(t.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px] ${
                  activeView === t.key
                    ? 'text-brand border-brand'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {activeView === 'cost-calculator' && (
          <BackendCostCalculator />
        )}

        {activeView === 'statement-analyzer' && (
          <>
            {/* ── Upload Section ── */}
            {status !== 'done' && (
              <div className="bg-white rounded-[8px] border border-gray-200 p-6">
                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-[8px] p-10 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? 'border-brand bg-brand/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,image/*"
                    multiple
                    className="hidden"
                    onChange={e => e.target.files && handleFiles(e.target.files)}
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      dragOver ? 'bg-brand/10' : 'bg-gray-100'
                    }`}>
                      <Upload className={`w-6 h-6 ${dragOver ? 'text-brand' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Drag & drop merchant statements here
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF or image files — credit card processing statements
                      </p>
                    </div>
                  </div>
                </div>

                {/* File list */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((f, i) => (
                      <div key={`${f.name}-${i}`} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-[6px]">
                        <File className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-700 truncate flex-1">{f.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                        <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="p-0.5 hover:bg-gray-200 rounded transition-colors">
                          <X className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={analyze}
                    disabled={!files.length || status === 'uploading' || status === 'analyzing'}
                    className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {status === 'uploading' || status === 'analyzing' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {status === 'uploading' ? 'Uploading...' : status === 'analyzing' ? 'Analyzing...' : 'Analyze Statement'}
                  </button>
                  {(status === 'uploading' || status === 'analyzing') && (
                    <p className="text-xs text-gray-400">
                      {status === 'uploading' ? 'Uploading file...' : 'AI is extracting fees and calculating savings...'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Results: two-column layout ── */}
            {status === 'done' && extracted && proposal && (
              <>
                {/* Reset bar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Analysis complete — {files[0]?.name}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1 bg-gray-100 rounded-[6px] p-1">
                      {([
                        { key: 'agent' as const, label: 'Agent view', icon: Briefcase },
                        { key: 'merchant' as const, label: 'Merchant view', icon: Eye },
                      ]).map(v => (
                        <button
                          key={v.key}
                          onClick={() => {
                            setViewMode(v.key);
                            if (v.key === 'merchant' && intelTab === 'economics') setIntelTab('breakdown');
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-[5px] flex items-center gap-1.5 transition-colors ${
                            viewMode === v.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <v.icon className="w-3.5 h-3.5" />
                          {v.label}
                        </button>
                      ))}
                    </div>
                    {viewMode === 'agent' && (
                      <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2">
                        Analyze another statement
                      </button>
                    )}
                  </div>
                </div>

                {/* Auto-lead created banner */}
                {viewMode === 'agent' && leadBannerVisible && autoLeadCreated && (
                  <div className="bg-brand/5 border border-brand/20 rounded-[8px] px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                        <UserPlus className="w-4.5 h-4.5 text-brand" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {autoLeadIsNew ? 'Lead auto-created' : 'Existing lead updated'}: <span className="text-brand">{autoLeadName}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {autoLeadIsNew
                            ? <>Added to pipeline as <span className="font-medium">New Lead</span> · Statement attached · Savings proposal linked</>
                            : <>Matched in pipeline · Statement attached · Processing profile refreshed · Savings proposal linked</>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => navigate('/leads')}
                        className="px-3.5 py-2 bg-brand text-white text-xs font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-1.5"
                      >
                        View in Pipeline
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setLeadBannerVisible(false)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Merchant view is its own simple presentation: cost, savings, graphs. */}
                {viewMode === 'merchant' && intel && programs && activeProgram ? (
                  <MerchantPresentation
                    statement={extracted}
                    proposal={proposal}
                    intel={intel}
                    programs={programs}
                    activeProgram={activeProgram}
                    onSelectProgram={setProgramKey}
                    onGeneratePdf={handleGenerateProposal}
                  />
                ) : (
                <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* ── Left: Extracted Data ── */}
                  <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand" />
                        Extracted Data
                      </h2>
                    </div>

                    <div className="px-5 py-4 space-y-4">
                      {/* Meta */}
                      <div className="grid grid-cols-2 gap-3">
                        <MetaField label="Current Processor" value={extracted.currentProcessor} />
                        <MetaField label="Statement Period" value={extracted.statementPeriod} />
                        <MetaField label="Total Volume" value={fmtWhole(extracted.totalVolume)} />
                        <MetaField label="Total Transactions" value={extracted.totalTransactions.toLocaleString()} />
                        <MetaField label="Avg Ticket" value={fmt(extracted.avgTicket)} />
                        <MetaField label="Effective Rate" value={`${extracted.effectiveRate}%`} />
                      </div>

                      {/* Fee breakdown */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fee Breakdown</p>
                        <div className="border border-gray-200 rounded-[6px] overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">Fee Type</th>
                                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {extracted.fees.map(f => (
                                <tr key={f.label}>
                                  <td className="px-3 py-2 text-sm text-gray-700">{f.label}</td>
                                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium tabular-nums">{fmt(f.amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Bottom stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <MetaField label="Chargeback Count" value={extracted.chargebackCount.toString()} warn={extracted.chargebackCount > 0} />
                        <MetaField label="Current Monthly Cost" value={fmt(extracted.currentMonthlyCost)} highlight />
                      </div>
                    </div>
                  </div>

                  {/* ── Right: Delt Savings Proposal ── */}
                  <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-emerald-600" />
                        Delt Savings Proposal
                      </h2>
                    </div>

                    <div className="px-5 py-4 flex-1 flex flex-col">
                      {/* Pricing program selector */}
                      {programs && activeProgram && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pricing Program</p>
                          <div className="grid grid-cols-2 gap-2">
                            {programs.map(pg => (
                              <button
                                key={pg.key}
                                onClick={() => setProgramKey(pg.key)}
                                className={`text-left px-3 py-2.5 rounded-[6px] border transition-colors ${
                                  pg.key === activeProgram.key
                                    ? 'border-brand bg-brand/5 ring-1 ring-brand'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-xs font-semibold ${pg.key === activeProgram.key ? 'text-brand' : 'text-gray-800'}`}>{pg.name}</span>
                                  <span className={`px-1.5 py-px rounded-full text-[10px] font-semibold whitespace-nowrap ${
                                    pg.passThrough ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {pg.passThrough ? 'Customer pays' : 'Merchant pays'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 mt-1">{pg.headlineRate}</p>
                                <p className="text-[11px] font-medium text-emerald-600 mt-0.5 tabular-nums">
                                  Saves {fmtWhole(pg.annualSavings)}/yr ({pg.savingsPct.toFixed(0)}%)
                                </p>
                                {viewMode === 'agent' && (
                                  <p className="text-[11px] text-gray-400 mt-0.5 tabular-nums">
                                    Margin {fmt(pg.deltMarginMonthly)}/mo
                                    {pg.deltMarginMonthly === maxProgramMargin && (
                                      <span className="ml-1.5 px-1.5 py-px rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">Highest margin</span>
                                    )}
                                  </p>
                                )}
                              </button>
                            ))}
                          </div>
                          <div className="mt-2 bg-gray-50 rounded-[6px] px-3 py-2.5 space-y-1">
                            <p className="text-[11px] text-gray-600"><span className="font-semibold">Best for:</span> {activeProgram.bestFor}</p>
                            <p className="text-[11px] text-gray-600"><span className="font-semibold">Cardholder impact:</span> {activeProgram.cardholderImpact}</p>
                            {activeProgram.compliance.length > 1 && (
                              <details className="text-[11px] text-gray-500">
                                <summary className="cursor-pointer font-semibold text-gray-600 select-none">Compliance requirements ({activeProgram.compliance.length})</summary>
                                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                                  {activeProgram.compliance.map(c => <li key={c}>{c}</li>)}
                                </ul>
                              </details>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Comparison table */}
                      <div className="border border-gray-200 rounded-[6px] overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5"></th>
                              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Current</th>
                              <th className="text-right text-[11px] font-semibold text-brand uppercase tracking-wide px-3 py-2.5">With Delt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            <CompareRow
                              label="Effective Rate"
                              current={`${proposal.currentRate}%`}
                              delt={`${(activeProgram?.effectiveRatePct ?? proposal.deltRate).toFixed(2)}%`}
                            />
                            <CompareRow
                              label="Monthly Cost"
                              current={fmt(proposal.currentMonthlyCost)}
                              delt={fmt(activeProgram?.merchantMonthlyCost ?? proposal.deltMonthlyCost)}
                            />
                            <CompareRow
                              label="Annual Cost"
                              current={fmtWhole(proposal.currentAnnualCost)}
                              delt={fmtWhole(activeProgram ? activeProgram.merchantMonthlyCost * 12 : proposal.deltAnnualCost)}
                            />
                            <tr className="bg-emerald-50/50">
                              <td className="px-3 py-3 text-sm font-semibold text-gray-900">Annual Savings</td>
                              <td className="px-3 py-3 text-right"></td>
                              <td className="px-3 py-3 text-right">
                                <span className="text-base font-bold text-emerald-600">{fmtWhole(activeProgram?.annualSavings ?? proposal.annualSavings)}</span>
                              </td>
                            </tr>
                            <tr className="bg-emerald-50/50">
                              <td className="px-3 py-3 text-sm font-semibold text-gray-900">Savings %</td>
                              <td className="px-3 py-3 text-right"></td>
                              <td className="px-3 py-3 text-right">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                                  {(activeProgram?.savingsPct ?? proposal.savingsPercent).toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Savings callout */}
                      <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-[8px] p-4 text-center">
                        <p className="text-xs text-emerald-600 font-medium mb-1">Projected Annual Savings — {activeProgram?.name ?? 'Interchange-Plus'}</p>
                        <p className="text-3xl font-bold text-emerald-700">{fmtWhole(activeProgram?.annualSavings ?? proposal.annualSavings)}</p>
                        <p className="text-xs text-emerald-500 mt-1">
                          {(activeProgram?.savingsPct ?? proposal.savingsPercent).toFixed(1)}% reduction in processing costs
                        </p>
                      </div>

                      {/* CTA buttons */}
                      <div className="mt-auto pt-5 flex items-center gap-3">
                        <button
                          onClick={handleGenerateProposal}
                          className="flex-1 px-4 py-2.5 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Generate Proposal PDF
                        </button>
                        {viewMode === 'agent' && (autoLeadCreated ? (
                          <button
                            onClick={() => navigate('/leads')}
                            className="flex-1 px-4 py-2.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-[6px] border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Lead Created — View
                          </button>
                        ) : (
                          <button className="flex-1 px-4 py-2.5 bg-white text-brand text-sm font-medium rounded-[6px] border border-brand hover:bg-brand/5 transition-colors flex items-center justify-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Create Lead
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Statement Intelligence: breakdown → issues/fat → suggestions → modeling ── */}
                {intel && (
                  <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand" />
                        Statement Intelligence
                      </h2>
                      <div className="flex gap-1 bg-gray-100 rounded-[6px] p-1">
                        {INTEL_TABS.filter(t => viewMode === 'agent' || !t.internal).map(t => (
                          <button
                            key={t.key}
                            onClick={() => setIntelTab(t.key)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-[5px] flex items-center gap-1.5 transition-colors ${
                              intelTab === t.key
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <t.icon className="w-3.5 h-3.5" />
                            {t.label}
                            {t.internal && (
                              <span className="px-1.5 py-px rounded-full bg-gray-200 text-gray-500 text-[10px] font-semibold">Internal</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      {intelTab === 'breakdown' && <IntelBreakdown extracted={extracted} proposal={proposal} intel={intel} />}
                      {intelTab === 'issues' && <IntelIssues extracted={extracted} intel={intel} merchantView={viewMode === 'merchant'} />}
                      {intelTab === 'suggestions' && <IntelSuggestions intel={intel} />}
                      {intelTab === 'modeling' && <IntelModeling extracted={extracted} proposal={proposal} intel={intel} />}
                      {intelTab === 'economics' && viewMode === 'agent' && <IntelEconomics intel={intel} />}
                    </div>
                  </div>
                )}
                </>
                )}
              </>
            )}

            {/* ── History Table (internal — hidden in merchant view) ── */}
            {(status !== 'done' || viewMode === 'agent') && (
            <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Analysis History
                </h2>
                <span className="text-xs text-gray-400">{history.length} analyses</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-5 pr-3 py-2.5">Merchant Name</th>
                      <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Date Analyzed</th>
                      <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Current Rate</th>
                      <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Proposed Rate</th>
                      <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Savings</th>
                      <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-3 pr-5 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="pl-5 pr-3 py-3 text-sm font-medium text-gray-900">{row.merchantName}</td>
                        <td className="px-3 py-3 text-sm text-gray-500">{row.dateAnalyzed}</td>
                        <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">{row.currentRate}%</td>
                        <td className="px-3 py-3 text-sm text-brand text-right font-medium tabular-nums">{row.proposedRate}%</td>
                        <td className="px-3 py-3 text-right">
                          <span className="text-sm font-medium text-emerald-600 tabular-nums">{fmtWhole(row.savings)}/yr</span>
                        </td>
                        <td className="pl-3 pr-5 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// Sub-components
// ══════════════════════════════════════

function MetaField({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-[6px] px-3 py-2.5">
      <p className="text-[11px] text-gray-500 font-medium mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${
        highlight ? 'text-brand' : warn ? 'text-amber-600' : 'text-gray-900'
      }`}>
        {value}
        {warn && <AlertCircle className="inline w-3.5 h-3.5 ml-1 -mt-0.5" />}
      </p>
    </div>
  );
}

function CompareRow({ label, current, delt }: { label: string; current: string; delt: string }) {
  return (
    <tr>
      <td className="px-3 py-2.5 text-sm text-gray-700">{label}</td>
      <td className="px-3 py-2.5 text-sm text-gray-500 text-right tabular-nums">{current}</td>
      <td className="px-3 py-2.5 text-sm text-gray-900 text-right font-medium tabular-nums">{delt}</td>
    </tr>
  );
}

// ══════════════════════════════════════
// Statement Intelligence tabs
// ══════════════════════════════════════

const intelTh = 'text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2';
const intelThRight = 'text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2';

/** 1 — Breakdown: where every dollar of the current cost goes. */
function IntelBreakdown({ extracted, proposal, intel }: { extracted: ExtractedData; proposal: SavingsProposal; intel: ProcessingIntelligence }) {
  const rows: { label: string; amount: string; rate: string; tone?: 'floor' | 'fat' | 'delt' }[] = [
    { label: 'Modeled interchange (optimized qualification)', amount: fmt(intel.interchangeTotal), rate: pctf(intel.interchangeRatePct) },
    { label: 'Network assessments & fixed fees', amount: fmt(intel.assessmentsTotal), rate: pctf((intel.assessmentsTotal / extracted.totalVolume) * 100) },
    { label: 'Wholesale cost floor — identical on any processor', amount: fmt(intel.wholesaleTotal), rate: pctf(intel.wholesaleRatePct), tone: 'floor' },
    { label: 'Current processor spread + downgrade leakage + junk fees', amount: fmt(intel.currentMarkup), rate: `${intel.currentMarkupBps.toFixed(0)} bps`, tone: 'fat' },
    { label: 'Current all-in cost', amount: fmt(extracted.currentMonthlyCost), rate: pctf(extracted.effectiveRate), tone: 'floor' },
    { label: 'Delt transparent margin (all-inclusive)', amount: fmt(intel.deltMarkup), rate: `${intel.deltMarkupBps.toFixed(0)} bps`, tone: 'delt' },
    { label: 'Delt all-in cost', amount: fmt(proposal.deltMonthlyCost), rate: pctf(proposal.deltRate), tone: 'delt' },
  ];
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cost Layers</p>
        <div className="border border-gray-200 rounded-[6px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className={intelTh}>Layer</th>
                <th className={intelThRight}>Monthly</th>
                <th className={intelThRight}>Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(r => (
                <tr key={r.label} className={r.tone === 'floor' ? 'bg-gray-50/70' : r.tone === 'delt' ? 'bg-emerald-50/50' : ''}>
                  <td className={`px-3 py-2 text-sm ${r.tone ? 'font-medium text-gray-900' : 'text-gray-700'}`}>{r.label}</td>
                  <td className={`px-3 py-2 text-sm text-right tabular-nums ${r.tone === 'fat' ? 'text-red-600 font-semibold' : 'text-gray-900 font-medium'}`}>{r.amount}</td>
                  <td className="px-3 py-2 text-sm text-gray-500 text-right tabular-nums">{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fee-Line Audit</p>
        <div className="border border-gray-200 rounded-[6px] overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-gray-50">
                <th className={intelTh}>Fee line</th>
                <th className={intelThRight}>Amount</th>
                <th className={intelThRight}>% of volume</th>
                <th className={intelTh}>Audit note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {extracted.fees.map(f => (
                <tr key={f.label}>
                  <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{f.label}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium tabular-nums">{fmt(f.amount)}</td>
                  <td className="px-3 py-2 text-sm text-gray-500 text-right tabular-nums">{pctf((f.amount / extracted.totalVolume) * 100)}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{auditFeeLine(f.label, f.amount, extracted, intel)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** 2 — Issues & Fat: what's wrong and what it costs. */
function IntelIssues({ extracted, intel, merchantView = false }: { extracted: ExtractedData; intel: ProcessingIntelligence; merchantView?: boolean }) {
  const cb = intel.chargebacks;
  const cbOk = cb.status === 'healthy';
  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-[6px] px-4 py-3">
        <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {intel.pricingModelDiagnosis}
        </p>
        <p className="text-xs text-amber-700 mt-1">{intel.pricingModelDetail}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FatCard
          label="Processor spread above floor"
          value={`${fmt(intel.currentMarkup)}/mo`}
          sub={`${intel.currentMarkupBps.toFixed(0)} bps over the wholesale cost floor`}
        />
        <FatCard
          label="Downgrade & surcharge leakage"
          value={`${fmt(intel.downgradeLeakLow)}–${fmt(intel.downgradeLeakHigh)}/mo`}
          sub="Non-qualified billbacks recoverable via clean qualification"
        />
        <FatCard
          label={merchantView ? 'Junk fees you\'re paying today' : 'Incumbent\'s pure-profit fees'}
          value={`${fmt(intel.junkFeesMonthly)}/mo`}
          sub={intel.junkFeeLabels.length
            ? merchantView
              ? `${intel.junkFeeLabels.join(' · ')} — all waived on Delt`
              : `${intel.junkFeeLabels.join(' · ')} — their margin, our wedge in the pitch`
            : 'None detected'}
        />
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Downgrade Exposure</p>
        <div className="border border-gray-200 rounded-[6px] overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="bg-gray-50">
                <th className={intelTh}>Downgrade path</th>
                <th className={intelTh}>Trigger</th>
                <th className={intelTh}>Penalty</th>
                <th className={intelTh}>Remediation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {intel.downgradeFindings.map(d => (
                <tr key={d.program}>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">{d.program}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{d.trigger}</td>
                  <td className="px-3 py-2 text-xs text-red-600 font-medium whitespace-nowrap">{d.penalty}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{d.remediation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`rounded-[6px] border px-4 py-3 flex items-start gap-3 ${
        cbOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
      }`}>
        {cbOk
          ? <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          : <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />}
        <div>
          <p className={`text-sm font-semibold ${cbOk ? 'text-emerald-800' : 'text-amber-800'}`}>
            Dispute posture: {cb.status === 'healthy' ? 'Healthy' : cb.status === 'watch' ? 'Watch' : 'At risk'} — {cb.count} chargeback{cb.count === 1 ? '' : 's'} ({pctf(cb.ratioPct)}) on {extracted.totalTransactions.toLocaleString()} transactions
          </p>
          <p className={`text-xs mt-0.5 ${cbOk ? 'text-emerald-700' : 'text-amber-700'}`}>{cb.note}</p>
        </div>
      </div>
    </div>
  );
}

/** 3 — Suggestions: prioritized actions with estimated value. */
function IntelSuggestions({ intel }: { intel: ProcessingIntelligence }) {
  return (
    <div className="space-y-3">
      {intel.opportunities.map(o => (
        <div key={o.title} className="border border-gray-200 rounded-[6px] px-4 py-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{o.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{o.rule}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-semibold text-emerald-600 tabular-nums">
                {o.estLowMonthly === o.estHighMonthly ? fmt(o.estLowMonthly) : `${fmt(o.estLowMonthly)}–${fmt(o.estHighMonthly)}`}/mo
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                o.includedInPricing ? 'bg-brand/10 text-brand' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {o.includedInPricing ? 'In Delt rate' : 'Additional upside'}
              </span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            <p className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Evidence:</span> {o.evidence}</p>
            <p className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Action:</span> {o.action}</p>
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400">
        Additional upside beyond the guaranteed Delt rate: {fmtWhole(intel.additionalUpsideLow * 12)}–{fmtWhole(intel.additionalUpsideHigh * 12)}/yr,
        a stretch effective rate of ≈ {pctf(intel.stretchEffectiveRatePct)}.
      </p>
    </div>
  );
}

/** 4 — Modeling: the card mix, assessments, and assumptions behind the numbers. */
function IntelModeling({ extracted, proposal, intel }: { extracted: ExtractedData; proposal: SavingsProposal; intel: ProcessingIntelligence }) {
  const upsideMid = (intel.additionalUpsideLow + intel.additionalUpsideHigh) / 2;
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estimated Card Mix at Published Interchange</p>
        <div className="border border-gray-200 rounded-[6px] overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-gray-50">
                <th className={intelTh}>Interchange program</th>
                <th className={intelThRight}>Share</th>
                <th className={intelThRight}>Volume</th>
                <th className={intelThRight}>Published rate</th>
                <th className={intelThRight}>Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {intel.cardMix.map(m => (
                <tr key={`${m.network}-${m.category}`}>
                  <td className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">{m.network} — {m.category}</td>
                  <td className="px-3 py-2 text-sm text-gray-500 text-right tabular-nums">{pctf(m.sharePct, 1)}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right tabular-nums">{fmtWhole(m.volume)}</td>
                  <td className="px-3 py-2 text-sm text-gray-500 text-right tabular-nums whitespace-nowrap">{pctf(m.ratePct)} + {fmt(m.perItem)}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium tabular-nums">{fmt(m.cost)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50/70">
                <td className="px-3 py-2 text-sm font-semibold text-gray-900">Modeled interchange total</td>
                <td className="px-3 py-2 text-sm text-gray-500 text-right">100%</td>
                <td className="px-3 py-2 text-sm font-semibold text-gray-900 text-right tabular-nums">{fmtWhole(extracted.totalVolume)}</td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-semibold text-gray-900 text-right tabular-nums">{fmt(intel.interchangeTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Network Assessments (Modeled)</p>
          <div className="border border-gray-200 rounded-[6px] overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-gray-100">
                {intel.assessments.map(a => (
                  <tr key={a.label}>
                    <td className="px-3 py-2">
                      <p className="text-sm text-gray-700">{a.label}</p>
                      <p className="text-[11px] text-gray-400">{a.basis}</p>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium tabular-nums align-top">{fmt(a.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50/70">
                  <td className="px-3 py-2 text-sm font-semibold text-gray-900">Total</td>
                  <td className="px-3 py-2 text-sm font-semibold text-gray-900 text-right tabular-nums">{fmt(intel.assessmentsTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Savings Projection</p>
          <div className="border border-gray-200 rounded-[6px] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className={intelTh}></th>
                  <th className={intelThRight}>Monthly</th>
                  <th className={intelThRight}>Year 1</th>
                  <th className={intelThRight}>3 Years</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-3 py-2 text-sm text-gray-700">Guaranteed pricing</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium tabular-nums">{fmt(proposal.annualSavings / 12)}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium tabular-nums">{fmtWhole(proposal.annualSavings)}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium tabular-nums">{fmtWhole(proposal.annualSavings * 3)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-sm text-gray-700">Optimization upside (mid)</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium tabular-nums">{fmt(upsideMid)}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium tabular-nums">{fmtWhole(upsideMid * 12)}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium tabular-nums">{fmtWhole(upsideMid * 36)}</td>
                </tr>
                <tr className="bg-emerald-50/50">
                  <td className="px-3 py-2 text-sm font-semibold text-gray-900">Total potential</td>
                  <td className="px-3 py-2 text-sm font-bold text-emerald-600 text-right tabular-nums">{fmt(proposal.annualSavings / 12 + upsideMid)}</td>
                  <td className="px-3 py-2 text-sm font-bold text-emerald-600 text-right tabular-nums">{fmtWhole(proposal.annualSavings + upsideMid * 12)}</td>
                  <td className="px-3 py-2 text-sm font-bold text-emerald-600 text-right tabular-nums">{fmtWhole((proposal.annualSavings + upsideMid * 12) * 3)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 bg-gray-50 rounded-[6px] px-3 py-2.5">
            <p className="text-[11px] text-gray-500 font-medium mb-0.5">Stretch effective rate with full optimization</p>
            <p className="text-sm font-semibold text-brand">{pctf(intel.stretchEffectiveRatePct)}</p>
          </div>
        </div>
      </div>

      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer font-semibold text-gray-600 select-none">Methodology & assumptions</summary>
        <ul className="mt-2 space-y-1 list-disc pl-5">
          {intel.assumptions.map(a => <li key={a}>{a}</li>)}
        </ul>
      </details>
    </div>
  );
}

/** 5 — Deal Economics (internal): the value-pool split and the profit/retention balance. */
function IntelEconomics({ intel }: { intel: ProcessingIntelligence }) {
  const eco = intel.economics;
  const riskTone = (r: 'Low' | 'Moderate' | 'High') =>
    r === 'Low' ? 'bg-emerald-50 text-emerald-700' : r === 'Moderate' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600';
  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-400 flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5" />
        Internal view — deal profitability and retention balance. Never included in the merchant proposal.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-gray-200 bg-gray-50 rounded-[6px] px-4 py-3">
          <p className="text-[11px] text-gray-500 font-medium">Value pool (spread above wholesale floor)</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5 tabular-nums">{fmt(eco.valuePoolMonthly)}/mo</p>
          <p className="text-[11px] text-gray-500 mt-1">Everything the incumbent charges above true cost — the pot being split</p>
        </div>
        <div className="border border-emerald-200 bg-emerald-50/60 rounded-[6px] px-4 py-3">
          <p className="text-[11px] text-gray-500 font-medium">Delt share (our margin)</p>
          <p className="text-sm font-bold text-emerald-700 mt-0.5 tabular-nums">
            {fmt(eco.deltShareMonthly)}/mo · {pctf(eco.deltSharePct, 0)}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">{fmtWhole(eco.deltAnnualRevenue)}/yr recurring revenue on this account</p>
        </div>
        <div className="border border-blue-200 bg-blue-50/60 rounded-[6px] px-4 py-3">
          <p className="text-[11px] text-gray-500 font-medium">Merchant share (delivered savings)</p>
          <p className="text-sm font-bold text-blue-700 mt-0.5 tabular-nums">
            {fmt(eco.merchantShareMonthly)}/mo · {pctf(eco.merchantSharePct, 0)}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">The retention moat — what keeps the next audit from flipping them</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pricing Scenarios — Profit vs Retention</p>
        <div className="border border-gray-200 rounded-[6px] overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="bg-gray-50">
                <th className={intelTh}>Scenario</th>
                <th className={intelThRight}>Merchant rate</th>
                <th className={intelThRight}>Savings</th>
                <th className={intelThRight}>Delt margin</th>
                <th className={intelTh}>Churn risk</th>
                <th className={intelThRight}>Est. life</th>
                <th className={intelThRight}>Lifetime value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {eco.scenarios.map(s => (
                <tr key={s.name} className={s.isRecommended ? 'bg-emerald-50/50' : ''}>
                  <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
                    <span className={s.isRecommended || s.isCurrent ? 'font-semibold' : ''}>{s.name}</span>
                    {s.isCurrent && <span className="ml-2 px-1.5 py-px rounded-full bg-brand/10 text-brand text-[10px] font-semibold">Current</span>}
                    {s.isRecommended && <span className="ml-2 px-1.5 py-px rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">LTV-optimal</span>}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right tabular-nums">{pctf(s.effectiveRatePct)}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right tabular-nums">{pctf(s.merchantSavingsPct, 1)}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium tabular-nums whitespace-nowrap">
                    {fmt(s.deltMarginMonthly)}/mo <span className="text-gray-400 font-normal">({s.deltMarginBps.toFixed(0)} bps)</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${riskTone(s.churnRisk)}`}>{s.churnRisk}</span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-500 text-right tabular-nums">{s.expectedLifeMonths} mo</td>
                  <td className="px-3 py-2 text-sm font-semibold text-right tabular-nums text-gray-900">{fmtWhole(s.lifetimeValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded-[6px] px-4 py-3">
          <p className="text-xs font-semibold text-gray-600 mb-1">Retention math</p>
          <p className="text-xs text-gray-500">{eco.retentionNote}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-[6px] px-4 py-3">
          <p className="text-xs font-semibold text-gray-600 mb-1">Where our profit actually lives</p>
          <p className="text-xs text-gray-500">{eco.passThroughNote}</p>
        </div>
      </div>
    </div>
  );
}

function FatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-red-100 bg-red-50/50 rounded-[6px] px-4 py-3">
      <p className="text-[11px] text-gray-500 font-medium">{label}</p>
      <p className="text-sm font-bold text-red-600 mt-0.5 tabular-nums">{value}</p>
      <p className="text-[11px] text-gray-500 mt-1">{sub}</p>
    </div>
  );
}