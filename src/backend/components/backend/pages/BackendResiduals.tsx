import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useAppNavigate } from '../NavigationContext';
import { toast } from 'sonner@2.0.3';
import {
  Upload, FileSpreadsheet, CheckCircle2, Download, X, Loader2, ArrowUpDown,
  TrendingUp, TrendingDown, DollarSign, Users, BarChart3,
  CalendarDays, Building2, AlertCircle, Check, RefreshCw, Trash2,
} from 'lucide-react';
import { useResiduals, residualActions, type ResidualRow } from '../residualsStore';
import { useMerchants } from '../crmStore';
import { useSession } from '../SessionContext';
import { ManualResidualEntry } from '../ManualResidualEntry';

// ── Types ──
type UploadStep = 'idle' | 'uploaded' | 'mapping' | 'processing' | 'done';

interface ColumnMapping {
  detected: string;
  index: number;
  mappedTo: string;
}

const SYSTEM_FIELDS = ['Merchant ID', 'Name', 'Volume', 'Transactions', 'Gross Revenue', 'Processor Fees', 'Net Revenue', 'Agent', 'Agent Share'] as const;

/** Default agent split applied when the report doesn't carry an Agent Share column. */
const DEFAULT_AGENT_SPLIT = 0.5;

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const fmtWhole = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** Minimal CSV parser with quoted-field support. Returns rows of cells. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else cell += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(cell); cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(v => v.trim() !== '')) rows.push(row);
      row = [];
    } else {
      cell += c;
    }
  }
  row.push(cell);
  if (row.some(v => v.trim() !== '')) rows.push(row);
  return rows;
}

/** Auto-map a CSV header to a system field by fuzzy match. */
function guessField(header: string): string {
  const h = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (/^mid$|merchantid|^id$/.test(h)) return 'Merchant ID';
  if (/agentshare|agentpay|commission/.test(h)) return 'Agent Share';
  if (/agent|rep\b|salesrep/.test(h)) return 'Agent';
  if (/name|merchant|dba/.test(h)) return 'Name';
  if (/txn|trans|count/.test(h)) return 'Transactions';
  if (/gross/.test(h)) return 'Gross Revenue';
  if (/fee|proc/.test(h)) return 'Processor Fees';
  if (/net/.test(h)) return 'Net Revenue';
  if (/vol|sales|amount/.test(h)) return 'Volume';
  return 'Skip';
}

const parseNum = (v: string) => {
  const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

function periodLabelOf(period: string): string {
  const [y, m] = period.split('-').map(Number);
  if (!y || !m) return period;
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function defaultPeriod(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1); // reports usually cover the prior month
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ══════════════════════════════════════
// Admin Residuals View
// ══════════════════════════════════════
export function BackendResiduals() {
  const { navigate } = useAppNavigate();
  const { rows, imports, isLoading } = useResiduals();
  const merchants = useMerchants();

  const [step, setStep] = useState<UploadStep>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importPeriod, setImportPeriod] = useState(defaultPeriod());
  const [importResult, setImportResult] = useState<{ rows: number; agentsMatched: number } | null>(null);
  const [agentFilter, setAgentFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState<string>('latest');
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Derived data ──
  const periods = useMemo(
    () => [...new Set(rows.map(r => r.period))].sort().reverse(),
    [rows],
  );
  const activePeriod = periodFilter === 'latest' ? (periods[0] ?? null) : periodFilter;
  const periodRows = useMemo(
    () => rows.filter(r => r.period === activePeriod),
    [rows, activePeriod],
  );
  const agents = useMemo(() => [...new Set(periodRows.map(r => r.agent))].sort(), [periodRows]);

  const filtered = useMemo(
    () => periodRows.filter(r => agentFilter === 'All' || r.agent === agentFilter),
    [periodRows, agentFilter],
  );

  const totals = useMemo(() => ({
    volume: filtered.reduce((s, r) => s + r.monthlyVolume, 0),
    transactions: filtered.reduce((s, r) => s + r.transactionCount, 0),
    gross: filtered.reduce((s, r) => s + r.grossRevenue, 0),
    procFees: filtered.reduce((s, r) => s + r.processorFees, 0),
    net: filtered.reduce((s, r) => s + r.netRevenue, 0),
    agentPay: filtered.reduce((s, r) => s + r.agentShare, 0),
    deltNet: filtered.reduce((s, r) => s + r.deltNet, 0),
  }), [filtered]);

  // ── Upload flow ──
  const handleFiles = useCallback(async (incoming: FileList | File[]) => {
    const f = Array.from(incoming).find(f =>
      f.name.endsWith('.csv') || f.type === 'text/csv'
    );
    if (!f) {
      toast.error('Please upload a CSV file exported from your processor.');
      return;
    }
    const text = await f.text();
    const parsed = parseCsv(text);
    if (parsed.length < 2) {
      toast.error('That file has no data rows.');
      return;
    }
    setFile(f);
    setCsvRows(parsed);
    setStep('uploaded');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    void handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const startMapping = () => {
    const header = csvRows[0] || [];
    setColumnMappings(header.map((h, i) => ({ detected: h.trim(), index: i, mappedTo: guessField(h) })));
    setStep('mapping');
  };

  const updateMapping = (idx: number, value: string) => {
    setColumnMappings(prev => prev.map((m, i) => (i === idx ? { ...m, mappedTo: value } : m)));
  };

  const processReport = async () => {
    const col = (field: string) => columnMappings.find(m => m.mappedTo === field)?.index ?? -1;
    const nameCol = col('Name');
    if (nameCol < 0) {
      toast.error('Map a column to "Name" before processing.');
      return;
    }
    setStep('processing');

    const idCol = col('Merchant ID');
    const volCol = col('Volume');
    const txnCol = col('Transactions');
    const grossCol = col('Gross Revenue');
    const feesCol = col('Processor Fees');
    const netCol = col('Net Revenue');
    const agentCol = col('Agent');
    const shareCol = col('Agent Share');

    const merchantByName = new Map(merchants.map(m => [m.name.toLowerCase(), m]));
    let agentsMatched = 0;

    const parsedRows = csvRows.slice(1).map(cells => {
      const name = (cells[nameCol] || '').trim();
      const gross = grossCol >= 0 ? parseNum(cells[grossCol]) : 0;
      const fees = feesCol >= 0 ? parseNum(cells[feesCol]) : 0;
      const net = netCol >= 0 ? parseNum(cells[netCol]) : gross - fees;
      const known = merchantByName.get(name.toLowerCase());
      let agent = agentCol >= 0 ? (cells[agentCol] || '').trim() : '';
      if (!agent && known) { agent = known.agent; }
      if (agent && agent !== 'Unassigned') agentsMatched++;
      const share = shareCol >= 0 ? parseNum(cells[shareCol]) : +(net * DEFAULT_AGENT_SPLIT).toFixed(2);
      return {
        period: importPeriod,
        merchantId: known?.id ?? (idCol >= 0 ? (cells[idCol] || '').trim() || null : null),
        merchantName: name,
        monthlyVolume: volCol >= 0 ? parseNum(cells[volCol]) : 0,
        transactionCount: txnCol >= 0 ? Math.round(parseNum(cells[txnCol])) : 0,
        grossRevenue: gross,
        processorFees: fees,
        netRevenue: net,
        agent: agent || 'Unassigned',
        agentShare: share,
        deltNet: +(net - share).toFixed(2),
      };
    }).filter(r => r.merchantName);

    if (parsedRows.length === 0) {
      toast.error('No valid rows found in the file.');
      setStep('mapping');
      return;
    }

    const inserted = await residualActions.importReport({
      period: importPeriod,
      periodLabel: periodLabelOf(importPeriod),
      filename: file?.name || 'report.csv',
      rows: parsedRows,
    });

    if (inserted >= 0) {
      setImportResult({ rows: inserted, agentsMatched });
      setStep('done');
      setPeriodFilter(importPeriod);
      toast.success(`${inserted} residual rows imported for ${periodLabelOf(importPeriod)}`);
    } else {
      setStep('mapping');
    }
  };

  const resetUpload = () => {
    setStep('idle');
    setFile(null);
    setCsvRows([]);
    setImportResult(null);
    setShowUpload(false);
  };

  const downloadImport = (importId: string, filename: string) => {
    const importRows = rows.filter(r => r.importId === importId);
    const header = ['Merchant ID', 'Name', 'Volume', 'Transactions', 'Gross Revenue', 'Processor Fees', 'Net Revenue', 'Agent', 'Agent Share', 'Delt Net'];
    const escape = (v: string | number | null) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [header.join(','), ...importRows.map(r =>
      [r.merchantId, r.merchantName, r.monthlyVolume, r.transactionCount, r.grossRevenue, r.processorFees, r.netRevenue, r.agent, r.agentShare, r.deltNet].map(escape).join(','),
    )];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\.csv$/i, '') + '-processed.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasData = rows.length > 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mt-0.5">Upload processor residual reports and distribute agent commissions.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowManualEntry(v => !v); setShowUpload(false); }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-[6px] hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Manual Entry
            </button>
            <button
              onClick={() => { setShowUpload(true); setShowManualEntry(false); setStep('idle'); setFile(null); setCsvRows([]); }}
              className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Report
            </button>
          </div>
        </div>

        {/* ── Manual Entry ── */}
        {showManualEntry && <ManualResidualEntry onClose={() => setShowManualEntry(false)} />}

        {/* ── Upload Section ── */}
        {showUpload && (
          <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-brand" />
                {step === 'mapping' ? 'Column Mapping' : step === 'processing' ? 'Processing Report...' : step === 'done' ? 'Report Processed' : 'Upload Residual Report'}
              </h2>
              <button onClick={resetUpload} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-5">
              {/* Step: Upload */}
              {(step === 'idle' || step === 'uploaded') && (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <label className="text-sm text-gray-600 font-medium">Report period</label>
                    <input
                      type="month"
                      value={importPeriod}
                      onChange={e => setImportPeriod(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-[8px] p-8 text-center cursor-pointer transition-colors ${
                      dragOver ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={e => e.target.files && handleFiles(e.target.files)}
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        dragOver ? 'bg-brand/10' : 'bg-gray-100'
                      }`}>
                        <Upload className={`w-5 h-5 ${dragOver ? 'text-brand' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Drag & drop residual report here</p>
                        <p className="text-xs text-gray-400 mt-1">CSV export from your processor</p>
                      </div>
                    </div>
                  </div>

                  {file && (
                    <div className="mt-4">
                      <div className="flex items-center gap-3 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-[6px]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">{csvRows.length - 1} data rows</span>
                        <button onClick={() => { setFile(null); setCsvRows([]); setStep('idle'); }} className="p-0.5 hover:bg-emerald-100 rounded transition-colors">
                          <X className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                      <button
                        onClick={startMapping}
                        className="mt-3 px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-2"
                      >
                        <ArrowUpDown className="w-4 h-4" />
                        Detect & Map Columns
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Step: Column Mapping */}
              {step === 'mapping' && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    We detected {columnMappings.length} columns in <span className="font-medium text-gray-700">{file?.name}</span>. Confirm or remap each to its system field. Unmapped columns are skipped.
                  </p>
                  <div className="border border-gray-200 rounded-[6px] overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-2.5 w-1/3">Detected Column</th>
                          <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-2.5 w-16">→</th>
                          <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-2.5 w-1/3">System Field</th>
                          <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-2.5 w-20">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {columnMappings.map((m, i) => (
                          <tr key={`${m.detected}-${i}`}>
                            <td className="px-4 py-3">
                              <code className="text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700">{m.detected || `(column ${i + 1})`}</code>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-300">→</td>
                            <td className="px-4 py-3">
                              <select
                                value={m.mappedTo}
                                onChange={e => updateMapping(i, e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                              >
                                {SYSTEM_FIELDS.map(f => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                                <option value="Skip">Skip</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {m.mappedTo !== 'Skip' ? (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                  <Check className="w-3.5 h-3.5" /> Mapped
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 font-medium">Skipped</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    Agent assignment: an "Agent" column wins; otherwise the merchant's assigned agent from the CRM is used. Without an "Agent Share" column, a {DEFAULT_AGENT_SPLIT * 100}% split of net revenue is applied.
                  </p>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => void processReport()}
                      className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Process Report
                    </button>
                    <button
                      onClick={() => setStep('uploaded')}
                      className="px-4 py-2.5 bg-white text-gray-600 text-sm font-medium rounded-[6px] border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Processing */}
              {step === 'processing' && (
                <div className="flex flex-col items-center py-10 gap-4">
                  <Loader2 className="w-8 h-8 text-brand animate-spin" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">Processing residual report...</p>
                    <p className="text-xs text-gray-400 mt-1">Matching merchants, calculating agent splits, and saving rows.</p>
                  </div>
                </div>
              )}

              {/* Step: Done */}
              {step === 'done' && importResult && (
                <div className="flex items-center gap-3 py-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Report processed successfully</p>
                    <p className="text-xs text-gray-500">
                      {importResult.rows} rows saved for {periodLabelOf(importPeriod)} · {importResult.agentsMatched} rows matched to an agent
                    </p>
                  </div>
                  <button onClick={resetUpload} className="ml-auto px-4 py-2 bg-white text-gray-600 text-sm font-medium rounded-[6px] border border-gray-200 hover:bg-gray-50 transition-colors">
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Summary + table (live data) ── */}
        {hasData && activePeriod ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <SummaryCard label="Report Period" value={periodLabelOf(activePeriod)} icon={<CalendarDays className="w-4 h-4 text-brand" />} />
              <SummaryCard label="Total Volume" value={fmtWhole(totals.volume)} icon={<BarChart3 className="w-4 h-4 text-emerald-600" />} />
              <SummaryCard label="Total Net Revenue" value={fmt(totals.net)} icon={<DollarSign className="w-4 h-4 text-blue-600" />} />
              <SummaryCard label="Total Agent Payouts" value={fmt(totals.agentPay)} icon={<Users className="w-4 h-4 text-amber-600" />} />
              <SummaryCard label="Delt Retained" value={fmt(totals.deltNet)} icon={<DollarSign className="w-4 h-4 text-violet-600" />} />
            </div>

            {/* ── Filters ── */}
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={agentFilter}
                onChange={e => setAgentFilter(e.target.value)}
                className="px-3 py-[7px] bg-white border border-gray-200 rounded-[6px] text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              >
                <option value="All">All Agents</option>
                {agents.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select
                value={activePeriod}
                onChange={e => setPeriodFilter(e.target.value)}
                className="px-3 py-[7px] bg-white border border-gray-200 rounded-[6px] text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              >
                {periods.map(p => <option key={p} value={p}>{periodLabelOf(p)}</option>)}
              </select>
              <span className="text-xs text-gray-400 ml-auto">
                Showing <span className="font-medium text-gray-700">{filtered.length}</span> of {periodRows.length} merchants
              </span>
            </div>

            {/* ── Parsed Report Table ── */}
            <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <Th className="pl-5">Merchant Name</Th>
                      <Th className="text-right">Monthly Volume</Th>
                      <Th className="text-right">Transactions</Th>
                      <Th className="text-right">Gross Revenue</Th>
                      <Th className="text-right">Processor Fees</Th>
                      <Th className="text-right">Net Revenue</Th>
                      <Th>Agent</Th>
                      <Th className="text-right">Agent Share</Th>
                      <Th className="text-right pr-5">Delt Net</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="pl-5 py-3">
                          {r.merchantId ? (
                            <button
                              onClick={() => navigate(`/merchants/${r.merchantId}`)}
                              className="text-sm font-medium text-brand hover:underline underline-offset-2"
                            >
                              {r.merchantName}
                            </button>
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{r.merchantName}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 text-right tabular-nums">{fmtWhole(r.monthlyVolume)}</td>
                        <td className="px-3 py-3 text-sm text-gray-600 text-right tabular-nums">{r.transactionCount.toLocaleString()}</td>
                        <td className="px-3 py-3 text-sm text-gray-900 text-right tabular-nums">{fmt(r.grossRevenue)}</td>
                        <td className="px-3 py-3 text-sm text-red-600 text-right tabular-nums">-{fmt(r.processorFees)}</td>
                        <td className="px-3 py-3 text-sm text-gray-900 text-right font-medium tabular-nums">{fmt(r.netRevenue)}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">{r.agent}</td>
                        <td className="px-3 py-3 text-sm text-amber-700 text-right font-medium tabular-nums">{fmt(r.agentShare)}</td>
                        <td className="px-3 py-3 text-sm text-emerald-700 text-right font-medium tabular-nums pr-5">{fmt(r.deltNet)}</td>
                      </tr>
                    ))}

                    {/* Totals row */}
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td className="pl-5 py-3 text-sm font-bold text-gray-900">Total</td>
                      <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right tabular-nums">{fmtWhole(totals.volume)}</td>
                      <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right tabular-nums">{totals.transactions.toLocaleString()}</td>
                      <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right tabular-nums">{fmt(totals.gross)}</td>
                      <td className="px-3 py-3 text-sm font-bold text-red-600 text-right tabular-nums">-{fmt(totals.procFees)}</td>
                      <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right tabular-nums">{fmt(totals.net)}</td>
                      <td className="px-3 py-3"></td>
                      <td className="px-3 py-3 text-sm font-bold text-amber-700 text-right tabular-nums">{fmt(totals.agentPay)}</td>
                      <td className="px-3 py-3 text-sm font-bold text-emerald-700 text-right tabular-nums pr-5">{fmt(totals.deltNet)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          !isLoading && (
            <div className="bg-white rounded-[8px] border border-gray-200 py-16 text-center">
              <FileSpreadsheet className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">No residual reports yet</p>
              <p className="text-xs text-gray-400 mt-1">Upload your first processor report to populate residuals and agent commissions.</p>
            </div>
          )
        )}

        {/* ── Upload History ── */}
        {imports.length > 0 && (
          <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                Upload History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <Th className="pl-5">Period</Th>
                    <Th>File</Th>
                    <Th>Upload Date</Th>
                    <Th className="text-right">Rows</Th>
                    <Th>Status</Th>
                    <Th className="pr-5 text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {imports.map(h => (
                    <tr key={h.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="pl-5 py-3 text-sm font-medium text-gray-900">{h.periodLabel}</td>
                      <td className="px-3 py-3 text-sm text-gray-500">{h.filename}</td>
                      <td className="px-3 py-3 text-sm text-gray-500">{h.createdAt ? new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                      <td className="px-3 py-3 text-sm text-gray-600 text-right tabular-nums">{h.rowCount}</td>
                      <td className="px-3 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          {h.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 pr-5 text-right">
                        <div className="inline-flex items-center gap-3">
                          <button
                            onClick={() => downloadImport(h.id, h.filename)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline underline-offset-2"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete the ${h.periodLabel} report (${h.rowCount} rows)? This cannot be undone.`)) {
                                void residualActions.deleteImport(h.id);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline underline-offset-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info note */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-[8px] px-4 py-3">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">
            Processed reports auto-populate agent commission statements under <span className="font-semibold">Team → Agents</span>. Agents can view their allocated residuals in the <span className="font-semibold">My Residuals</span> section of their portal.
          </p>
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════
// Agent "My Residuals" View
// ══════════════════════════════════════
export function AgentResiduals() {
  const { rows, isLoading } = useResiduals();
  const { role, agentName } = useSession();

  const agents = useMemo(() => [...new Set(rows.map(r => r.agent))].filter(a => a !== 'Unassigned').sort(), [rows]);
  const [agentChoice, setAgentChoice] = useState<string>('');
  // Agents are pinned to their own identity (RLS already scopes their rows
  // server-side); admins previewing this page can browse any agent.
  const agent = role === 'agent' ? (agentName ?? '') : (agentChoice || agents[0] || '');

  const myRows = useMemo(
    () => (role === 'agent' ? rows : rows.filter(r => r.agent === agent)),
    [rows, agent, role],
  );
  const periods = useMemo(() => [...new Set(myRows.map(r => r.period))].sort().reverse(), [myRows]);
  const currentPeriod = periods[0] ?? null;
  const currentRows = myRows.filter(r => r.period === currentPeriod);
  const prevRows = periods[1] ? myRows.filter(r => r.period === periods[1]) : [];

  const myTotal = currentRows.reduce((s, r) => s + r.agentShare, 0);
  const myVolume = currentRows.reduce((s, r) => s + r.monthlyVolume, 0);
  const prevTotal = prevRows.reduce((s, r) => s + r.agentShare, 0);
  const trend = myTotal - prevTotal;
  const trendPct = prevTotal > 0 ? ((trend / prevTotal) * 100).toFixed(1) : null;

  const statements = useMemo(() =>
    periods.map(p => {
      const pr = myRows.filter(r => r.period === p);
      return {
        id: p,
        period: periodLabelOf(p),
        merchants: pr.length,
        volume: pr.reduce((s, r) => s + r.monthlyVolume, 0),
        commission: pr.reduce((s, r) => s + r.agentShare, 0),
      };
    }),
  [periods, myRows]);

  const downloadStatement = (periodId: string) => {
    const pr = myRows.filter(r => r.period === periodId);
    const lines = [
      ['Merchant', 'Volume', 'Transactions', 'My Share'].join(','),
      ...pr.map(r => [`"${r.merchantName.replace(/"/g, '""')}"`, r.monthlyVolume, r.transactionCount, r.agentShare].join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `residual-statement-${periodId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isLoading && rows.length === 0) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="bg-white rounded-[8px] border border-gray-200 py-16 text-center">
            <FileSpreadsheet className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">No residual statements yet</p>
            <p className="text-xs text-gray-400 mt-1">Statements appear here after operations uploads the monthly processor report.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 mt-0.5">Your residual income from merchant processing portfolios.</p>
          {role !== 'agent' && agents.length > 1 && (
            <select
              value={agent}
              onChange={e => setAgentChoice(e.target.value)}
              className="px-3 py-[7px] bg-white border border-gray-200 rounded-[6px] text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            >
              {agents.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard label="My Merchants" value={currentRows.length.toString()} icon={<Building2 className="w-4 h-4 text-brand" />} />
          <SummaryCard label="My Volume" value={fmtWhole(myVolume)} icon={<BarChart3 className="w-4 h-4 text-emerald-600" />} />
          <SummaryCard label="My Commission" value={fmt(myTotal)} icon={<DollarSign className="w-4 h-4 text-amber-600" />} />
          <div className="bg-white rounded-[8px] border border-gray-200 p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-gray-500 font-medium leading-tight">vs Last Period</span>
              {trend >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
            </div>
            <p className={`text-lg font-bold leading-none ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trendPct != null ? `${trend >= 0 ? '+' : ''}${trendPct}%` : '—'}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">{trendPct != null ? `${trend >= 0 ? '+' : ''}${fmt(trend)}` : 'No prior period'}</p>
          </div>
        </div>

        {/* Agent Table */}
        <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              {currentPeriod ? `${periodLabelOf(currentPeriod)} — My Merchants` : 'My Merchants'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <Th className="pl-5">Merchant Name</Th>
                  <Th className="text-right">Volume</Th>
                  <Th className="text-right">Transactions</Th>
                  <Th className="text-right pr-5">My Share</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentRows.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="pl-5 py-3 text-sm font-medium text-gray-900">{r.merchantName}</td>
                    <td className="px-3 py-3 text-sm text-gray-900 text-right tabular-nums">{fmtWhole(r.monthlyVolume)}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 text-right tabular-nums">{r.transactionCount.toLocaleString()}</td>
                    <td className="px-3 py-3 text-sm text-emerald-700 text-right font-medium tabular-nums pr-5">{fmt(r.agentShare)}</td>
                  </tr>
                ))}
                {currentRows.length > 0 && (
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td className="pl-5 py-3 text-sm font-bold text-gray-900">Total</td>
                    <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right tabular-nums">{fmtWhole(myVolume)}</td>
                    <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right tabular-nums">
                      {currentRows.reduce((s, r) => s + r.transactionCount, 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-sm font-bold text-emerald-700 text-right tabular-nums pr-5">{fmt(myTotal)}</td>
                  </tr>
                )}
                {currentRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-sm text-gray-400">No residual rows for this agent yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historical Statements */}
        {statements.length > 0 && (
          <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                Historical Statements
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <Th className="pl-5">Period</Th>
                    <Th className="text-right">Merchants</Th>
                    <Th className="text-right">Volume</Th>
                    <Th className="text-right">Commission</Th>
                    <Th className="pr-5 text-right">Download</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {statements.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="pl-5 py-3 text-sm font-medium text-gray-900">{s.period}</td>
                      <td className="px-3 py-3 text-sm text-gray-600 text-right">{s.merchants}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 text-right tabular-nums">{fmtWhole(s.volume)}</td>
                      <td className="px-3 py-3 text-sm text-emerald-700 text-right font-medium tabular-nums">{fmt(s.commission)}</td>
                      <td className="px-3 py-3 pr-5 text-right">
                        <button
                          onClick={() => downloadStatement(s.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline underline-offset-2"
                        >
                          <Download className="w-3.5 h-3.5" />
                          CSV
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ══════════════════════════════════════
// Shared sub-components
// ══════════════════════════════════════

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[8px] border border-gray-200 p-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-gray-500 font-medium leading-tight">{label}</span>
        {icon}
      </div>
      <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide text-left ${className}`}>
      {children}
    </th>
  );
}
