import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Upload, FileText, Sparkles, Download, UserPlus, Clock,
  CheckCircle2, TrendingDown, Store,
  AlertCircle, Loader2, X, File, ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAppNavigate } from '../NavigationContext';
import { BackendCostCalculator } from './BackendCostCalculator';
import { supabase } from '../../../lib/supabase';
import { leadActions } from '../crmStore';

// ── Types ──
type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'done';
type HistoryStatus = 'Analyzed' | 'Lead Created' | 'Proposal Sent' | 'Won' | 'Lost';
const HISTORY_STATUSES: HistoryStatus[] = ['Analyzed', 'Lead Created', 'Proposal Sent', 'Won', 'Lost'];

interface FeeRow {
  label: string;
  amount: number;
}

/** Shape returned by the analyze-statement edge function's extraction. */
interface ExtractedData {
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
  currentRate: number;
  proposedRate: number;
  savings: number;
  status: HistoryStatus;
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const fmtWhole = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/**
 * Delt pricing heuristic pending the full interchange engine: undercut the
 * merchant's current effective rate by ~22% with a 2.15% floor. Numbers stay
 * consistent with the Cost Calculator's positioning.
 */
function buildProposal(ex: ExtractedData): SavingsProposal {
  const currentRate = ex.effectiveRatePct;
  const deltRate = Math.max(2.15, Math.round(currentRate * 0.78 * 100) / 100);
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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? '');
      resolve(url.slice(url.indexOf(',') + 1)); // strip the data: prefix
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function fromDbAnalysis(row: any): HistoryRow {
  return {
    id: row.id,
    merchantName: row.merchant_name,
    dateAnalyzed: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    currentRate: Number(row.current_rate ?? 0),
    proposedRate: Number(row.proposed_rate ?? 0),
    savings: Number(row.annual_savings ?? 0),
    status: (row.status as HistoryStatus) ?? 'Analyzed',
  };
}

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
  const [leadBannerVisible, setLeadBannerVisible] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);
  const [historyView, setHistoryView] = useState<'all' | 'merchant'>('all');
  const [merchantFilter, setMerchantFilter] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const dataBase64 = await fileToBase64(file);
      setStatus('analyzing');

      const { data, error } = await supabase.functions.invoke('analyze-statement', {
        body: { filename: file.name, mediaType: file.type || 'application/pdf', dataBase64 },
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
      const ex: ExtractedData = {
        merchantName: raw.merchantName?.trim() || nameFromFile(file.name),
        currentProcessor: raw.currentProcessor || 'Unknown',
        statementPeriod: raw.statementPeriod || '—',
        totalVolume: Number(raw.totalVolume ?? 0),
        totalTransactions: Number(raw.totalTransactions ?? 0),
        avgTicket: Number(raw.avgTicket ?? 0),
        effectiveRatePct: Number(raw.effectiveRatePct ?? 0),
        fees: Array.isArray(raw.fees) ? raw.fees : [],
        chargebackCount: Number(raw.chargebackCount ?? 0),
        currentMonthlyCost: Number(raw.currentMonthlyCost ?? 0),
        confidence: (raw.confidence as ExtractedData['confidence']) ?? 'medium',
        notes: raw.notes || '',
      };
      const prop = buildProposal(ex);
      setExtracted(ex);
      setProposal(prop);
      setStatus('done');

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
          name: files[0]?.name ?? `Statement analysis — ${extracted.statementPeriod}`,
          node_type: 'document',
          doc_kind: 'statement_analysis',
          lead_id: lead.id,
          data: {
            extraction: extracted,
            proposal,
            filename: files[0]?.name ?? null,
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
  };

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
                    onClick={() => void analyze()}
                    disabled={!files.length || status === 'uploading' || status === 'analyzing'}
                    className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {status === 'uploading' || status === 'analyzing' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {status === 'uploading' ? 'Reading file...' : status === 'analyzing' ? 'Analyzing...' : 'Analyze Statement'}
                  </button>
                  {(status === 'uploading' || status === 'analyzing') && (
                    <p className="text-xs text-gray-400">
                      {status === 'uploading' ? 'Preparing the statement…' : 'AI is reading the statement and extracting every fee line…'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Results: two-column layout ── */}
            {status === 'done' && extracted && proposal && (
              <>
                {/* Reset bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Analysis complete — {files[0]?.name}
                    {extracted.confidence !== 'high' && (
                      <span className={`ml-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        extracted.confidence === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {extracted.confidence} confidence
                      </span>
                    )}
                  </div>
                  <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2">
                    Analyze another statement
                  </button>
                </div>

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
                        Extracted Data
                      </h2>
                    </div>

                    <div className="px-5 py-4 space-y-4">
                      {/* Meta */}
                      <div className="grid grid-cols-2 gap-3">
                        <MetaField label="Merchant" value={extracted.merchantName} highlight />
                        <MetaField label="Current Processor" value={extracted.currentProcessor} />
                        <MetaField label="Statement Period" value={extracted.statementPeriod} />
                        <MetaField label="Total Volume" value={fmtWhole(extracted.totalVolume)} />
                        <MetaField label="Total Transactions" value={extracted.totalTransactions.toLocaleString()} />
                        <MetaField label="Avg Ticket" value={fmt(extracted.avgTicket)} />
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

                      {/* Bottom stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <MetaField label="Effective Rate" value={`${extracted.effectiveRatePct}%`} />
                        <MetaField label="Chargebacks" value={extracted.chargebackCount.toString()} warn={extracted.chargebackCount > 0} />
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
                            <CompareRow label="Effective Rate" current={`${proposal.currentRate}%`} delt={`${proposal.deltRate}%`} />
                            <CompareRow label="Monthly Cost" current={fmt(proposal.currentMonthlyCost)} delt={fmt(proposal.deltMonthlyCost)} />
                            <CompareRow label="Annual Cost" current={fmtWhole(proposal.currentAnnualCost)} delt={fmtWhole(proposal.deltAnnualCost)} />
                            <tr className="bg-emerald-50/50">
                              <td className="px-3 py-3 text-sm font-semibold text-gray-900">Annual Savings</td>
                              <td className="px-3 py-3 text-right"></td>
                              <td className="px-3 py-3 text-right">
                                <span className="text-base font-bold text-emerald-600">{fmtWhole(proposal.annualSavings)}</span>
                              </td>
                            </tr>
                            <tr className="bg-emerald-50/50">
                              <td className="px-3 py-3 text-sm font-semibold text-gray-900">Savings %</td>
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
                        <p className="text-xs text-emerald-600 font-medium mb-1">Projected Annual Savings</p>
                        <p className="text-3xl font-bold text-emerald-700">{fmtWhole(proposal.annualSavings)}</p>
                        <p className="text-xs text-emerald-500 mt-1">{proposal.savingsPercent}% reduction in processing costs</p>
                      </div>

                      {/* CTA buttons */}
                      <div className="mt-auto pt-5 flex items-center gap-3">
                        <button className="flex-1 px-4 py-2.5 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" />
                          Generate Proposal PDF
                        </button>
                        {autoLeadCreated ? (
                          <button
                            onClick={() => navigate('/leads')}
                            className="flex-1 px-4 py-2.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-[6px] border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Lead Created — View
                          </button>
                        ) : (
                          <button
                            onClick={() => void createLead()}
                            className="flex-1 px-4 py-2.5 bg-white text-brand text-sm font-medium rounded-[6px] border border-brand hover:bg-brand/5 transition-colors flex items-center justify-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            Create Lead
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── History: all analyses / by merchant ── */}
            <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Analysis History
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
                    ]).map(t => (
                      <button
                        key={t.key}
                        onClick={() => { setHistoryView(t.key); setMerchantFilter(null); }}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          historyView === t.key
                            ? 'bg-brand text-white'
                            : 'bg-white text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {historyView === 'merchant' ? `${merchants.length} merchants` : `${visibleHistory.length} analyses`}
                  </span>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700">No analyses yet</p>
                  <p className="text-xs text-gray-400 mt-1">Upload a merchant statement above — every analysis is saved here.</p>
                </div>
              ) : historyView === 'merchant' ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-5 pr-3 py-2.5">Merchant</th>
                        <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Analyses</th>
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Last Analyzed</th>
                        <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Current → Proposed</th>
                        <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Best Savings</th>
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-3 pr-5 py-2.5">Status</th>
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
                              {m.latest.status}
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
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-5 pr-3 py-2.5">Merchant Name</th>
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Date Analyzed</th>
                        <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Current Rate</th>
                        <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Proposed Rate</th>
                        <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Savings</th>
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide pl-3 pr-5 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {visibleHistory.map(row => (
                        <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="pl-5 pr-3 py-3 text-sm font-medium text-gray-900">{row.merchantName}</td>
                          <td className="px-3 py-3 text-sm text-gray-500">{row.dateAnalyzed}</td>
                          <td className="px-3 py-3 text-sm text-gray-700 text-right tabular-nums">{row.currentRate}%</td>
                          <td className="px-3 py-3 text-sm text-brand text-right font-medium tabular-nums">{row.proposedRate}%</td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm font-medium text-emerald-600 tabular-nums">{fmtWhole(row.savings)}/yr</span>
                          </td>
                          <td className="pl-3 pr-5 py-3">
                            <select
                              value={row.status}
                              onChange={e => void updateStatus(row.id, e.target.value as HistoryStatus)}
                              className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/20 ${statusBadge(row.status)}`}
                            >
                              {HISTORY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
