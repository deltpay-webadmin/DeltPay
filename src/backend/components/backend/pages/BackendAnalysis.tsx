import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Upload, FileText, Sparkles, Download, UserPlus, Clock,
  CheckCircle2, TrendingDown, Store,
  AlertCircle, Loader2, X, File, ArrowRight, Presentation,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAppNavigate } from '../NavigationContext';
import { BackendCostCalculator } from './BackendCostCalculator';
import { MerchantSavingsView } from './MerchantSavingsView';
import { AnalysisEconomicsCard } from './AnalysisEconomicsCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell, LabelList,
} from 'recharts';
import { supabase } from '../../../lib/supabase';
import { leadActions } from '../crmStore';
import { quotePrograms, RISK_TIERS, IC_PLUS_MARGIN, volumeBandKey, type ProgramQuote, type RiskTierKey } from '../pricingPrograms';
import { estimateInterchange, MERCHANT_CATEGORIES, type MerchantCategory } from '../interchangeRates';
import { InterchangeReferenceCard } from './InterchangeReferenceCard';
import { QualificationAuditCard } from './QualificationAuditCard';
import { openProposalPdf } from '../proposalDoc';
import { useSession } from '../SessionContext';
import { useLang } from '../i18n';

// ── Types ──
type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'done';
type HistoryStatus = 'Analyzed' | 'Lead Created' | 'Proposal Sent' | 'Won' | 'Lost';
const HISTORY_STATUSES: HistoryStatus[] = ['Analyzed', 'Lead Created', 'Proposal Sent', 'Won', 'Lost'];

interface FeeRow {
  label: string;
  amount: number;
}

/** Shape returned by the analyze-statement edge function's extraction. */
export interface ExtractedData {
  merchantName: string;
  currentProcessor: string;
  statementPeriod: string;
  totalVolume: number;
  totalTransactions: number;
  avgTicket: number;
  effectiveRatePct: number;
  fees: FeeRow[];
  chargebackCount: number;
  currentMonthlyCost: number;
  /** Verbatim downgrade fee lines (EIRF, Non-Qual, Standard…); empty when none found. */
  downgradeLines: FeeRow[];
  /** Whether the statement shows PIN debit / EFT network activity; null on older analyses. */
  pinDebitPresent: boolean | null;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
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
  createdAt: string;
  currentRate: number;
  proposedRate: number;
  savings: number;
  status: HistoryStatus;
  leadId: string | null;
  /** Raw extraction saved with the analysis — lets history rows reopen the full view. */
  extraction: Partial<ExtractedData> | null;
  filename: string | null;
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const fmtWhole = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/**
 * Headline proposal: undercut the merchant's current effective rate by ~22%,
 * floored at the real network cost (published interchange + assessments,
 * interchangeRates.ts) plus the banded Delt margin — never quote below cost.
 */
function buildProposal(ex: ExtractedData): SavingsProposal {
  const currentRate = ex.effectiveRatePct;
  const ticket = ex.avgTicket > 0
    ? ex.avgTicket
    : ex.totalTransactions > 0 ? ex.totalVolume / ex.totalTransactions : 0;
  const margin = IC_PLUS_MARGIN[volumeBandKey(ex.totalVolume)];
  const floor = estimateInterchange('retail', ticket).networkCostPct
    + margin.pct + (ticket > 0 ? (margin.perTxn / ticket) * 100 : 0);
  const deltRate = Math.max(
    Math.round(floor * 100) / 100,
    Math.round(currentRate * 0.78 * 100) / 100,
  );
  const deltMonthlyCost = Math.round(ex.totalVolume * deltRate) / 100;
  const monthlySavings = Math.max(0, ex.currentMonthlyCost - deltMonthlyCost);
  const annualSavings = Math.round(monthlySavings * 12);
  return {
    currentRate,
    deltRate,
    currentMonthlyCost: ex.currentMonthlyCost,
    deltMonthlyCost,
    currentAnnualCost: Math.round(ex.currentMonthlyCost * 12),
    deltAnnualCost: Math.round(deltMonthlyCost * 12),
    annualSavings,
    savingsPercent: ex.currentMonthlyCost > 0
      ? Math.round((monthlySavings / ex.currentMonthlyCost) * 1000) / 10
      : 0,
  };
}

// Shared with the deal-documents flow (extract-deal-doc) — one rasterizer.
import { fileToBase64, pdfToImages } from '../docImaging';

function fromDbAnalysis(row: any): HistoryRow {
  return {
    id: row.id,
    merchantName: row.merchant_name,
    dateAnalyzed: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    createdAt: row.created_at,
    currentRate: Number(row.current_rate ?? 0),
    proposedRate: Number(row.proposed_rate ?? 0),
    savings: Number(row.annual_savings ?? 0),
    status: (row.status as HistoryStatus) ?? 'Analyzed',
    leadId: row.lead_id ?? null,
    extraction: row.extraction ?? null,
    filename: row.filename ?? null,
  };
}

/** Normalize a raw extraction (fresh from the edge function or reloaded from a saved row). */
function normalizeExtraction(raw: Partial<ExtractedData>, fallbackName: string): ExtractedData {
  return {
    merchantName: raw.merchantName?.trim() || fallbackName,
    currentProcessor: raw.currentProcessor || 'Unknown',
    statementPeriod: raw.statementPeriod || '—',
    totalVolume: Number(raw.totalVolume ?? 0),
    totalTransactions: Number(raw.totalTransactions ?? 0),
    avgTicket: Number(raw.avgTicket ?? 0),
    effectiveRatePct: Number(raw.effectiveRatePct ?? 0),
    fees: Array.isArray(raw.fees) ? raw.fees : [],
    chargebackCount: Number(raw.chargebackCount ?? 0),
    currentMonthlyCost: Number(raw.currentMonthlyCost ?? 0),
    downgradeLines: Array.isArray(raw.downgradeLines) ? raw.downgradeLines : [],
    pinDebitPresent: typeof raw.pinDebitPresent === 'boolean' ? raw.pinDebitPresent : null,
    confidence: (raw.confidence as ExtractedData['confidence']) ?? 'medium',
    notes: raw.notes || '',
  };
}

// ══════════════════════════════════════
// Main Component
// ══════════════════════════════════════
export function BackendAnalysis() {
  const { navigate } = useAppNavigate();
  const { displayName, email: sessionEmail } = useSession();
  const { t, tTerms, lang } = useLang();
  const [activeView, setActiveView] = useState<'cost-calculator' | 'statement-analyzer'>('cost-calculator');
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [proposal, setProposal] = useState<SavingsProposal | null>(null);
  const [autoLeadCreated, setAutoLeadCreated] = useState(false);
  const [autoLeadName, setAutoLeadName] = useState('');
  const [leadBannerVisible, setLeadBannerVisible] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);
  const [historyView, setHistoryView] = useState<'all' | 'merchant'>('all');
  const [merchantFilter, setMerchantFilter] = useState<string | null>(null);
  const [riskTier, setRiskTier] = useState<RiskTierKey>('medium');
  const [category, setCategory] = useState<MerchantCategory>('retail');
  const [merchantView, setMerchantView] = useState(false);
  /** Filename of a saved analysis reopened from history (no File object exists for it). */
  const [openedFilename, setOpenedFilename] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Load saved analyses ──
  const loadHistory = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('statement_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) {
      console.error('[analysis] history load failed:', error.message);
      return;
    }
    setHistory((data ?? []).map(fromDbAnalysis));
  }, []);

  useEffect(() => { void loadHistory(); }, [loadHistory]);

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

  /** Fallback merchant name derived from the filename when the statement doesn't show one. */
  const nameFromFile = (fileName: string) => {
    const cleaned = fileName
      .replace(/\.(pdf|png|jpg|jpeg|webp|gif|tiff?)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/statement|stmt|processing/gi, '')
      .trim();
    return cleaned.length > 2
      ? cleaned.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      : 'New Prospect';
  };

  // ── Real extraction via the analyze-statement edge function ──
  const analyze = async () => {
    const file = files[0];
    if (!file || !supabase) {
      if (!supabase) toast.error('Statement analysis needs a Supabase connection.');
      return;
    }
    setStatus('uploading');
    setAutoLeadCreated(false);
    setLeadBannerVisible(false);
    try {
      // PDFs are rendered to page images client-side so the cheap Nebius
      // vision model reads them; single images pass through as-is.
      const payload: Record<string, unknown> = { filename: file.name };
      if (file.type === 'application/pdf') {
        payload.images = await pdfToImages(file);
      } else {
        payload.mediaType = file.type || 'image/png';
        payload.dataBase64 = await fileToBase64(file);
      }
      setStatus('analyzing');

      const { data, error } = await supabase.functions.invoke('analyze-statement', {
        body: payload,
      });

      if (error) {
        // FunctionsHttpError carries the JSON error body from the function.
        let message = error.message;
        try {
          const body = await (error as any).context?.json?.();
          if (body?.message) message = body.message;
          else if (body?.error) message = body.error;
        } catch { /* keep the generic message */ }
        throw new Error(message);
      }
      if (data?.error) throw new Error(data.message || data.error);

      const raw = data.extraction as Partial<ExtractedData> & { effectiveRatePct?: number };
      const ex = normalizeExtraction(raw, nameFromFile(file.name));
      const prop = buildProposal(ex);
      setExtracted(ex);
      setProposal(prop);
      setStatus('done');
      setMerchantView(false);
      setOpenedFilename(null);

      // Persist so the history / merchant view survives reloads.
      const { data: saved, error: insErr } = await supabase.from('statement_analyses').insert({
        merchant_name: ex.merchantName,
        filename: file.name,
        extraction: raw,
        current_rate: prop.currentRate,
        proposed_rate: prop.deltRate,
        annual_savings: prop.annualSavings,
        status: 'Analyzed',
        model: data.model ?? null,
      }).select('id').single();
      if (insErr) console.error('[analysis] save failed:', insErr.message);
      setSavedAnalysisId(saved?.id ?? null);
      void loadHistory();
    } catch (err: any) {
      console.error('[analysis] extraction failed:', err);
      toast.error(err?.message || 'Statement analysis failed — try again.');
      setStatus('idle');
    }
  };

  // ── Real lead creation from the analyzed statement. The analysis is also
  //    filed into the new lead's Data Vault (/prospects/{leadId}/
  //    statement-analysis/...), so it sits with the prospect's other files
  //    in the Plaid Portal. ──
  const createLead = async () => {
    if (!extracted || !proposal) return;
    const lead = leadActions.create({
      businessName: extracted.merchantName,
      type: 'Processing' as any,
      source: 'Statement Analyzer',
      monthlySales: fmtWhole(extracted.totalVolume),
      notes:
        `Statement analysis (${extracted.statementPeriod}, ${extracted.currentProcessor}): ` +
        `effective rate ${proposal.currentRate}% → Delt ${proposal.deltRate}%, ` +
        `projected savings ${fmtWhole(proposal.annualSavings)}/yr.`,
    });
    setAutoLeadName(extracted.merchantName);
    setAutoLeadCreated(true);
    setLeadBannerVisible(true);
    toast.success(`Lead created for ${extracted.merchantName}`);

    if (supabase) {
      try {
        // Folders first (no-op when they already exist), then the document.
        await supabase.from('plaid_nodes').upsert([
          { path: `/prospects/${lead.id}`, name: extracted.merchantName, node_type: 'folder', lead_id: lead.id },
          { path: `/prospects/${lead.id}/statement-analysis`, name: 'Statement Analysis', node_type: 'folder', lead_id: lead.id },
        ], { onConflict: 'path', ignoreDuplicates: true });
        const { error: docErr } = await supabase.from('plaid_nodes').insert({
          path: `/prospects/${lead.id}/statement-analysis/${savedAnalysisId ?? crypto.randomUUID()}`,
          name: files[0]?.name ?? openedFilename ?? `Statement analysis — ${extracted.statementPeriod}`,
          node_type: 'document',
          doc_kind: 'statement_analysis',
          lead_id: lead.id,
          data: {
            extraction: extracted,
            proposal,
            filename: files[0]?.name ?? openedFilename ?? null,
            analyzedAt: new Date().toISOString(),
          },
        });
        if (docErr) throw docErr;
        if (savedAnalysisId) {
          await supabase.from('statement_analyses')
            .update({ lead_id: lead.id, status: 'Lead Created' })
            .eq('id', savedAnalysisId);
        }
        void loadHistory();
      } catch (err: any) {
        console.error('[analysis] vault filing failed:', err);
        toast.error(`Lead created, but filing the analysis failed: ${err?.message ?? err}`);
      }
    }
  };

  const updateStatus = async (id: string, next: HistoryStatus) => {
    setHistory(prev => prev.map(h => (h.id === id ? { ...h, status: next } : h)));
    if (!supabase) return;
    const { error } = await supabase.from('statement_analyses').update({ status: next }).eq('id', id);
    if (error) {
      toast.error(`Couldn't update status: ${error.message}`);
      void loadHistory();
    }
  };

  const reset = () => {
    setStatus('idle');
    setFiles([]);
    setExtracted(null);
    setProposal(null);
    setSavedAnalysisId(null);
    setMerchantView(false);
    setOpenedFilename(null);
  };

  /** Reopen a saved analysis from history in the full results view. */
  const openAnalysis = (row: HistoryRow) => {
    if (!row.extraction) {
      toast.error(t('This analysis was saved without its extraction data — re-run the statement to view it.'));
      return;
    }
    const ex = normalizeExtraction(row.extraction, row.merchantName);
    setExtracted(ex);
    setProposal(buildProposal(ex));
    setStatus('done');
    setFiles([]);
    setOpenedFilename(row.filename);
    setSavedAnalysisId(row.id);
    setMerchantView(false);
    setAutoLeadCreated(Boolean(row.leadId));
    setAutoLeadName(row.leadId ? row.merchantName : '');
    setLeadBannerVisible(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Delt program quotes against the extracted statement ──
  const programs: ProgramQuote[] = useMemo(() => {
    if (!extracted) return [];
    return quotePrograms({
      monthlyVolume: extracted.totalVolume,
      monthlyTransactions: extracted.totalTransactions,
      currentMonthlyCost: extracted.currentMonthlyCost,
      riskTier,
      category,
      avgTicket: extracted.avgTicket,
    });
  }, [extracted, riskTier, category]);
  const bestProgram = useMemo(
    () => programs.reduce<ProgramQuote | null>((best, p) => (!best || p.annualSavings > best.annualSavings ? p : best), null),
    [programs],
  );

  // ── Merchant rollup for the "By merchant" view ──
  const merchants = useMemo(() => {
    const map = new Map<string, { name: string; analyses: HistoryRow[] }>();
    for (const row of history) {
      const key = row.merchantName.toLowerCase();
      if (!map.has(key)) map.set(key, { name: row.merchantName, analyses: [] });
      map.get(key)!.analyses.push(row);
    }
    return [...map.values()].map(m => ({
      name: m.name,
      count: m.analyses.length,
      latest: m.analyses[0],
      bestSavings: Math.max(...m.analyses.map(a => a.savings)),
    }));
  }, [history]);

  const visibleHistory = useMemo(
    () => (merchantFilter
      ? history.filter(h => h.merchantName.toLowerCase() === merchantFilter.toLowerCase())
      : history),
    [history, merchantFilter],
  );

  const statusBadge = (s: HistoryStatus) => {
    const cfg: Record<HistoryStatus, string> = {
      'Analyzed': 'bg-gray-100 text-gray-600',
      'Lead Created': 'bg-blue-50 text-blue-700',
      'Proposal Sent': 'bg-amber-50 text-amber-700',
      'Won': 'bg-emerald-50 text-emerald-700',
      'Lost': 'bg-gray-100 text-gray-500',
    };
    return cfg[s];
  };

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* ── Header ── */}
        <div>
          <p className="text-sm text-gray-500 mt-0.5">{t('Cost calculator and statement analysis tools.')}</p>
        </div>

        {/* ── View Tabs ── */}
        <div className="border-b border-gray-200">
          <div className="flex gap-1">
            {([
              { key: 'cost-calculator' as const, label: 'Cost Calculator' },
              { key: 'statement-analyzer' as const, label: 'Statement Analyzer' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px] ${
                  activeView === tab.key
                    ? 'text-brand border-brand'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t(tab.label)}
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
                        {t('Drag & drop merchant statements here')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {t('PDF or image files — credit card processing statements')}
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
                    onClick={() => void analyze()}
                    disabled={!files.length || status === 'uploading' || status === 'analyzing'}
                    className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {status === 'uploading' || status === 'analyzing' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {status === 'uploading' ? t('Reading file...') : status === 'analyzing' ? t('Analyzing...') : t('Analyze Statement')}
                  </button>
                  {(status === 'uploading' || status === 'analyzing') && (
                    <p className="text-xs text-gray-400">
                      {status === 'uploading' ? t('Preparing the statement…') : t('AI is reading the statement and extracting every fee line…')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Results: two-column layout ── */}
            {status === 'done' && extracted && proposal && (
              <>
                {/* Reset bar */}
                <div className="flex items-center justify-between gap-3">
                  {merchantView ? (
                    <div />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      {openedFilename !== null || !files.length
                        ? <>{t('Saved analysis')} — {openedFilename ?? extracted.merchantName}</>
                        : <>{t('Analysis complete')} — {files[0]?.name}</>}
                      {extracted.confidence !== 'high' && (
                        <span className={`ml-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          extracted.confidence === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {t(`${extracted.confidence} confidence`)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMerchantView(v => !v)}
                      className={`px-4 py-2 text-sm font-medium rounded-[6px] transition-colors flex items-center gap-2 ${
                        merchantView
                          ? 'bg-brand text-white hover:bg-brand-hover'
                          : 'bg-white text-brand border border-brand hover:bg-brand/5'
                      }`}
                    >
                      <Presentation className="w-4 h-4" />
                      {merchantView ? t('Exit Merchant View') : t('Merchant View')}
                    </button>
                    <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2">
                      {t('Analyze another statement')}
                    </button>
                  </div>
                </div>

                {merchantView ? (
                  <MerchantSavingsView
                    extracted={extracted}
                    programs={programs}
                    bestProgramKey={bestProgram?.key ?? null}
                    onExit={() => setMerchantView(false)}
                    onDownloadProposal={key => {
                      const ok = openProposalPdf({ extracted, programs, focusKey: key, category, preparedBy: displayName, preparedByEmail: sessionEmail, lang });
                      if (!ok) toast.error('Pop-up blocked — allow pop-ups for this site to generate the proposal.');
                    }}
                  />
                ) : (
                <>
                {/* AI notes on the extraction */}
                {extracted.notes && (
                  <div className="bg-gray-50 border border-gray-200 rounded-[8px] px-4 py-3 text-xs text-gray-600 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-[1px]" />
                    <span>{extracted.notes}</span>
                  </div>
                )}

                {/* Lead created banner */}
                {leadBannerVisible && autoLeadCreated && (
                  <div className="bg-brand/5 border border-brand/20 rounded-[8px] px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                        <UserPlus className="w-4.5 h-4.5 text-brand" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Lead created: <span className="text-brand">{autoLeadName}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Added to pipeline as <span className="font-medium">New Lead</span> · Savings proposal noted
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* ── Left: Extracted Data ── */}
                  <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand" />
                        {t('Extracted Data')}
                      </h2>
                    </div>

                    <div className="px-5 py-4 space-y-4">
                      {/* Meta */}
                      <div className="grid grid-cols-2 gap-3">
                        <MetaField label={t('Merchant')} value={extracted.merchantName} highlight />
                        <MetaField label={t('Current Processor')} value={extracted.currentProcessor} />
                        <MetaField label={t('Statement Period')} value={extracted.statementPeriod} />
                        <MetaField label={t('Total Volume')} value={fmtWhole(extracted.totalVolume)} />
                        <MetaField label={t('Total Transactions')} value={extracted.totalTransactions.toLocaleString()} />
                        <MetaField label={t('Avg Ticket')} value={fmt(extracted.avgTicket)} />
                      </div>

                      {/* Fee breakdown */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('Fee Breakdown')}</p>
                        <div className="border border-gray-200 rounded-[6px] overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">{t('Fee Type')}</th>
                                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">{t('Amount')}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {extracted.fees.map((f, i) => (
                                <tr key={`${f.label}-${i}`}>
                                  <td className="px-3 py-2 text-sm text-gray-700">{f.label}</td>
                                  <td className="px-3 py-2 text-sm text-gray-900 text-right font-medium tabular-nums">{fmt(f.amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Fee composition — where the money goes */}
                      {extracted.fees.length > 1 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('Fee Composition')}</p>
                          <div className="border border-gray-200 rounded-[6px] p-3" style={{ height: Math.max(120, extracted.fees.length * 34) }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={extracted.fees} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 8 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                  type="category" dataKey="label" width={110}
                                  tickLine={false} axisLine={false}
                                  tick={{ fontSize: 11, fill: '#6b7280' }}
                                />
                                <ChartTooltip
                                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                  formatter={(v: number) => [fmt(v), 'Amount']}
                                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                                />
                                <Bar dataKey="amount" fill="#2E6BFF" radius={[0, 4, 4, 0]} barSize={16}>
                                  <LabelList dataKey="amount" position="right" formatter={(v: number) => fmtWhole(v)} style={{ fontSize: 11, fill: '#374151' }} />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* Bottom stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <MetaField label={t('Effective Rate')} value={`${extracted.effectiveRatePct}%`} />
                        <MetaField label={t('Chargebacks')} value={extracted.chargebackCount.toString()} warn={extracted.chargebackCount > 0} />
                        <MetaField label={t('Current Monthly Cost')} value={fmt(extracted.currentMonthlyCost)} highlight />
                      </div>
                    </div>
                  </div>

                  {/* ── Right: Delt Savings Proposal ── */}
                  <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-emerald-600" />
                        {t('Delt Savings Proposal')}
                      </h2>
                    </div>

                    <div className="px-5 py-4 flex-1 flex flex-col">
                      {/* Comparison table */}
                      <div className="border border-gray-200 rounded-[6px] overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5"></th>
                              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">{t('Current')}</th>
                              <th className="text-right text-[11px] font-semibold text-brand uppercase tracking-wide px-3 py-2.5">{t('With Delt')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            <CompareRow label={t('Effective Rate')} current={`${proposal.currentRate}%`} delt={`${proposal.deltRate}%`} />
                            <CompareRow label={t('Monthly Cost')} current={fmt(proposal.currentMonthlyCost)} delt={fmt(proposal.deltMonthlyCost)} />
                            <CompareRow label={t('Annual Cost')} current={fmtWhole(proposal.currentAnnualCost)} delt={fmtWhole(proposal.deltAnnualCost)} />
                            <tr className="bg-emerald-50/50">
                              <td className="px-3 py-3 text-sm font-semibold text-gray-900">{t('Annual Savings')}</td>
                              <td className="px-3 py-3 text-right"></td>
                              <td className="px-3 py-3 text-right">
                                <span className="text-base font-bold text-emerald-600">{fmtWhole(proposal.annualSavings)}</span>
                              </td>
                            </tr>
                            <tr className="bg-emerald-50/50">
                              <td className="px-3 py-3 text-sm font-semibold text-gray-900">{t('Savings %')}</td>
                              <td className="px-3 py-3 text-right"></td>
                              <td className="px-3 py-3 text-right">
                                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">{proposal.savingsPercent}%</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Savings callout */}
                      <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-[8px] p-4 text-center">
                        <p className="text-xs text-emerald-600 font-medium mb-1">{t('Projected Annual Savings')}</p>
                        <p className="text-3xl font-bold text-emerald-700">{fmtWhole(proposal.annualSavings)}</p>
                        <p className="text-xs text-emerald-500 mt-1">{proposal.savingsPercent}% {t('reduction in processing costs')}</p>
                      </div>

                      {/* CTA buttons */}
                      <div className="mt-auto pt-5 flex items-center gap-3">
                        <button
                          onClick={() => {
                            const ok = openProposalPdf({ extracted, programs, focusKey: bestProgram?.key ?? null, category, preparedBy: displayName, preparedByEmail: sessionEmail, lang });
                            if (!ok) toast.error('Pop-up blocked — allow pop-ups for this site to generate the proposal.');
                          }}
                          className="flex-1 px-4 py-2.5 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          {t('Generate Proposal PDF')}
                        </button>
                        {autoLeadCreated ? (
                          <button
                            onClick={() => navigate('/leads')}
                            className="flex-1 px-4 py-2.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-[6px] border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {t('Lead Created — View')}
                          </button>
                        ) : (
                          <button
                            onClick={() => void createLead()}
                            className="flex-1 px-4 py-2.5 bg-white text-brand text-sm font-medium rounded-[6px] border border-brand hover:bg-brand/5 transition-colors flex items-center justify-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            {t('Create Lead')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Delt Pricing Programs ── */}
                <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand" />
                      {t('Delt Pricing Programs')}
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{t('Industry')}</span>
                        <select
                          value={category}
                          onChange={e => setCategory(e.target.value as MerchantCategory)}
                          className="px-2.5 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-[6px] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/20"
                        >
                          {MERCHANT_CATEGORIES.map(c => (
                            <option key={c.key} value={c.key}>{t(c.label)}</option>
                          ))}
                        </select>
                      </div>
                      <span className="text-xs text-gray-400">{t('Risk tier')}</span>
                      <div className="flex rounded-[6px] border border-gray-200 overflow-hidden">
                        {RISK_TIERS.map(tier => (
                          <button
                            key={tier.key}
                            onClick={() => setRiskTier(tier.key as RiskTierKey)}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                              riskTier === tier.key ? 'bg-brand text-white' : 'bg-white text-gray-500 hover:text-gray-700'
                            }`}
                            title={t(tier.desc)}
                          >
                            {t(tier.label.replace(' Risk', ''))}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {programs.map(p => {
                      const recommended = bestProgram?.key === p.key;
                      return (
                        <div
                          key={p.key}
                          className={`rounded-[8px] border p-4 flex flex-col ${
                            recommended ? 'border-brand bg-brand/[0.03] shadow-[0_0_0_1px_var(--brand,#2E6BFF)]' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">{t(p.name)}</p>
                            {recommended && (
                              <span className="px-2 py-0.5 rounded-full bg-brand text-white text-[10px] font-bold uppercase tracking-wide">
                                {t('Recommended')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 leading-snug">{t(p.tagline)}</p>
                          <p className="mt-3 inline-block text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-[6px] self-start">{tTerms(p.terms)}</p>
                          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[11px] text-gray-500">{t('Merchant pays')}</p>
                              <p className="text-sm font-bold text-gray-900 tabular-nums">{fmt(p.monthlyCost)}<span className="text-[11px] font-medium text-gray-400">/mo</span></p>
                            </div>
                            <div>
                              <p className="text-[11px] text-gray-500">{t('Annual savings')}</p>
                              <p className="text-sm font-bold text-emerald-600 tabular-nums">{fmtWhole(p.annualSavings)}</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                              {p.savingsPct}% {t('less than today')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Annual cost comparison */}
                  <div className="px-5 pb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('Annual Processing Cost')}</p>
                    <div className="border border-gray-200 rounded-[6px] p-3" style={{ height: 180 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: t('Current'), cost: Math.round(extracted.currentMonthlyCost * 12), kind: 'current' },
                            ...programs.map(p => ({ name: t(p.name), cost: p.annualCost, kind: p.key })),
                          ]}
                          margin={{ top: 20, right: 12, bottom: 0, left: 12 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                          <YAxis hide />
                          <ChartTooltip
                            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                            formatter={(v: number) => [fmtWhole(v), 'Annual cost']}
                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                          />
                          <Bar dataKey="cost" radius={[4, 4, 0, 0]} barSize={44}>
                            <LabelList dataKey="cost" position="top" formatter={(v: number) => fmtWhole(v)} style={{ fontSize: 11, fill: '#374151' }} />
                            {[
                              { kind: 'current' },
                              ...programs,
                            ].map((entry: any, i) => (
                              <Cell key={i} fill={i === 0 ? '#9ca3af' : '#2E6BFF'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2">
                      {t("Cash Discount shows the merchant's own cost — the ≈4% service fee is customer-paid. Program pricing keyed to this statement's volume band and the selected risk tier.")}
                    </p>
                  </div>
                </div>

                {/* ── Delt Economics (internal only) ── */}
                <AnalysisEconomicsCard
                  extracted={extracted}
                  riskTier={riskTier}
                  category={category}
                  bestSavingsKey={bestProgram?.key ?? null}
                />

                {/* ── Downgrade & qualification audit (internal only) ── */}
                <QualificationAuditCard extracted={extracted} category={category} />

                {/* ── Published interchange schedules (internal only) ── */}
                <InterchangeReferenceCard category={category} avgTicket={extracted.avgTicket} />
                </>
                )}
              </>
            )}

            {/* ── History: all analyses / by merchant ── */}
            {!merchantView && (
            <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {t('Analysis History')}
                  {merchantFilter && (
                    <button
                      onClick={() => setMerchantFilter(null)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-medium hover:bg-brand/20 transition-colors"
                    >
                      {merchantFilter}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex rounded-[6px] border border-gray-200 overflow-hidden">
                    {([
                      { key: 'all' as const, label: 'All analyses' },
                      { key: 'merchant' as const, label: 'By merchant' },
                    ]).map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => { setHistoryView(tab.key); setMerchantFilter(null); }}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          historyView === tab.key
                            ? 'bg-brand text-white'
                            : 'bg-white text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {t(tab.label)}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {historyView === 'merchant' ? `${merchants.length} ${t('merchants')}` : `${visibleHistory.length} ${t('analyses')}`}
                  </span>
                </div>
              </div>

              {/* Merchant drill-in summary */}
              {merchantFilter && visibleHistory.length > 0 && (() => {
                const rows = [...visibleHistory].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
                const latest = rows[rows.length - 1];
                const best = rows.reduce((m, r) => Math.max(m, r.savings), 0);
                const linkedLead = rows.map(r => r.leadId).find(Boolean) ?? null;
                const trend = rows.map(r => ({
                  date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  rate: r.currentRate,
                }));
                return (
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <p className="text-[11px] text-gray-500 font-medium">{t('Statements analyzed')}</p>
                        <p className="text-lg font-bold text-gray-900 tabular-nums">{rows.length}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 font-medium">{t('Latest effective rate')}</p>
                        <p className="text-lg font-bold text-gray-900 tabular-nums">{latest.currentRate}%</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 font-medium">{t('Best annual savings')}</p>
                        <p className="text-lg font-bold text-emerald-600 tabular-nums">{fmtWhole(best)}</p>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {linkedLead && (
                          <button
                            onClick={() => navigate('/leads')}
                            className="px-3 py-2 bg-brand text-white text-xs font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-1.5"
                          >
                            {t('Open Lead')}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {trend.length >= 2 && (
                      <div className="mt-3" style={{ height: 110 }}>
                        <p className="text-[11px] text-gray-500 font-medium mb-1">{t('Effective rate over time')}</p>
                        <ResponsiveContainer width="100%" height={90}>
                          <LineChart data={trend} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                            <YAxis
                              width={40} tickLine={false} axisLine={false}
                              tick={{ fontSize: 10, fill: '#9ca3af' }}
                              domain={['dataMin - 0.2', 'dataMax + 0.2']}
                              tickFormatter={(v: number) => `${v}%`}
                            />
                            <ChartTooltip
                              formatter={(v: number) => [`${v}%`, 'Effective rate']}
                              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                            />
                            <Line type="monotone" dataKey="rate" stroke="#2E6BFF" strokeWidth={2} dot={{ r: 3, fill: '#2E6BFF' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                );
              })()}

              {history.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700">{t('No analyses yet')}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('Upload a merchant statement above — every analysis is saved here.')}</p>
                </div>
              ) : historyView === 'merchant' ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-5 pr-3 py-2.5">{t('Merchant')}</th>
                        <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">{t('Analyses')}</th>
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">{t('Last Analyzed')}</th>
                        <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">{t('Current → Proposed')}</th>
                        <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">{t('Best Savings')}</th>
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-3 pr-5 py-2.5">{t('Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {merchants.map(m => (
                        <tr
                          key={m.name}
                          onClick={() => { setHistoryView('all'); setMerchantFilter(m.name); }}
                          className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                        >
                          <td className="pl-5 pr-3 py-3">
                            <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                              <Store className="w-4 h-4 text-gray-300" />
                              {m.name}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">{m.count}</td>
                          <td className="px-3 py-3 text-sm text-gray-500">{m.latest.dateAnalyzed}</td>
                          <td className="px-3 py-3 text-sm text-right tabular-nums">
                            <span className="text-gray-700">{m.latest.currentRate}%</span>
                            <span className="text-gray-300 mx-1">→</span>
                            <span className="text-brand font-medium">{m.latest.proposedRate}%</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm font-medium text-emerald-600 tabular-nums">{fmtWhole(m.bestSavings)}/yr</span>
                          </td>
                          <td className="pl-3 pr-5 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(m.latest.status)}`}>
                              {t(m.latest.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-5 pr-3 py-2.5">{t('Merchant Name')}</th>
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">{t('Date Analyzed')}</th>
                        <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">{t('Current Rate')}</th>
                        <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">{t('Proposed Rate')}</th>
                        <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">{t('Savings')}</th>
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-3 pr-5 py-2.5">{t('Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {visibleHistory.map(row => (
                        <tr
                          key={row.id}
                          onClick={() => openAnalysis(row)}
                          title={t('Open saved analysis')}
                          className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                        >
                          <td className="pl-5 pr-3 py-3">
                            <span className="text-sm font-medium text-gray-900 hover:text-brand transition-colors inline-flex items-center gap-1.5">
                              {row.merchantName}
                              <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                            </span>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-500">{row.dateAnalyzed}</td>
                          <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">{row.currentRate}%</td>
                          <td className="px-3 py-3 text-sm text-brand text-right font-medium tabular-nums">{row.proposedRate}%</td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm font-medium text-emerald-600 tabular-nums">{fmtWhole(row.savings)}/yr</span>
                          </td>
                          <td className="pl-3 pr-5 py-3" onClick={e => e.stopPropagation()}>
                            <select
                              value={row.status}
                              onChange={e => void updateStatus(row.id, e.target.value as HistoryStatus)}
                              className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/20 ${statusBadge(row.status)}`}
                            >
                              {HISTORY_STATUSES.map(s => <option key={s} value={s}>{t(s)}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
