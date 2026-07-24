import React, { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  Check,
  Users,
} from 'lucide-react';
import { importLeads, type LeadImportOutcome } from '../crmStore';
import {
  autoMapHeaders,
  parseSpreadsheet,
  transformRows,
  hasDedupeCapableMapping,
  FIELD_LABELS,
  IDENTITY_FIELDS,
  MAX_IMPORT_ROWS,
  type ColumnMapping,
  type ImportRowResult,
  type LeadImportField,
} from './leadImport';

type ImportStep = 'upload' | 'map' | 'preview' | 'importing' | 'done';

const FIELD_OPTIONS = Object.entries(FIELD_LABELS) as Array<[LeadImportField, string]>;

export function LeadImportFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [outcome, setOutcome] = useState<LeadImportOutcome | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<ImportRowResult[]>(
    () => (step === 'preview' || step === 'importing' ? transformRows(rows, mappings) : []),
    [step, rows, mappings],
  );
  const okRows = results.filter(r => r.status === 'ok');
  const skippedRows = results.filter(r => r.status === 'skipped');
  const errorRows = results.filter(r => r.status === 'error');

  const reset = () => {
    setStep('upload');
    setFile(null);
    setRows([]);
    setMappings([]);
    setOutcome(null);
    setParseError(null);
    setDragOver(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleFile = async (f: File) => {
    setParseError(null);
    try {
      const parsed = await parseSpreadsheet(f);
      if (parsed.rows.length > MAX_IMPORT_ROWS) {
        toast.warning(`File has ${parsed.rows.length.toLocaleString()} rows — large imports may be slow.`);
      }
      setFile(f);
      setRows(parsed.rows);
      setMappings(autoMapHeaders(parsed.headers));
      setStep('map');
    } catch (err: any) {
      const msg = err?.message || 'Could not read file';
      setParseError(msg);
      toast.error(`Couldn't parse "${f.name}": ${msg}`);
    }
  };

  const updateMapping = (index: number, field: LeadImportField) => {
    setMappings(prev =>
      prev.map(m => {
        if (m.index === index) return { ...m, field, confidence: 'exact' as const };
        // Identity fields are single-holder: demote the previous owner.
        if (IDENTITY_FIELDS.includes(field) && m.field === field) {
          toast.info(`"${m.header}" was unmapped — only one column can map to ${FIELD_LABELS[field]}.`);
          return { ...m, field: 'skip' as const, confidence: 'none' as const };
        }
        return m;
      }),
    );
  };

  const runImport = async () => {
    if (!file || okRows.length === 0) return;
    setStep('importing');
    const result = await importLeads(
      okRows.map(r => r.dbRow!),
      {
        filename: file.name,
        rowCount: rows.length,
        skippedCount: skippedRows.length,
        errorCount: errorRows.length,
      },
    );
    setOutcome(result);
    setStep('done');
    if (result.failed > 0) {
      toast.error(`Import finished with errors — ${result.failed} rows failed.`);
    } else {
      toast.success(
        `Imported ${result.inserted} lead${result.inserted === 1 ? '' : 's'}${
          result.duplicates > 0 ? ` (${result.duplicates} already imported)` : ''
        }`,
      );
    }
  };

  if (!open) return null;

  const titles: Record<ImportStep, string> = {
    upload: 'Import Leads',
    map: 'Map Columns',
    preview: 'Review Import',
    importing: 'Importing Leads…',
    done: 'Import Complete',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={step === 'importing' ? undefined : close} />
      <div className="relative bg-white rounded-[8px] border border-gray-200 shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-brand" />
            {titles[step]}
            {file && step !== 'upload' && (
              <span className="text-xs font-normal text-gray-400 truncate max-w-[240px]">— {file.name}</span>
            )}
          </h2>
          {step !== 'importing' && (
            <button onClick={close} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        <div className="p-5 overflow-y-auto">
          {/* Step: Upload */}
          {step === 'upload' && (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-[8px] p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = '';
                  }}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    dragOver ? 'bg-brand/10' : 'bg-gray-100'
                  }`}>
                    <Upload className={`w-5 h-5 ${dragOver ? 'text-brand' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Drag & drop a lead spreadsheet here</p>
                    <p className="text-xs text-gray-400 mt-1">Meta lead ads exports or any CSV / Excel file — columns are auto-mapped</p>
                  </div>
                </div>
              </div>
              {parseError && (
                <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-[6px]">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="text-sm text-red-700">{parseError}</span>
                </div>
              )}
            </>
          )}

          {/* Step: Map */}
          {step === 'map' && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Detected {mappings.length} columns and {rows.length} rows. Confirm or remap each column, then preview.
              </p>
              <div className="border border-gray-200 rounded-[6px] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-2.5 w-[38%]">Detected Column</th>
                      <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2.5 w-10">→</th>
                      <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-2.5 w-[38%]">CRM Field</th>
                      <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-2.5 w-24">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mappings.map(m => (
                      <tr key={m.index}>
                        <td className="px-4 py-2.5">
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700 break-all">{m.header}</code>
                          {rows[0]?.[m.index] && (
                            <p className="text-[11px] text-gray-400 mt-1 truncate max-w-[220px]">e.g. {rows[0][m.index]}</p>
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-center text-gray-300">→</td>
                        <td className="px-4 py-2.5">
                          <select
                            value={m.field}
                            onChange={e => updateMapping(m.index, e.target.value as LeadImportField)}
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                          >
                            {FIELD_OPTIONS.map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {m.field === 'skip' ? (
                            <span className="text-xs text-gray-400 font-medium">Skipped</span>
                          ) : m.confidence === 'exact' ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <Check className="w-3.5 h-3.5" /> Mapped
                            </span>
                          ) : (
                            <span className="text-xs text-amber-600 font-medium">Review</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => setStep('preview')}
                  disabled={!hasDedupeCapableMapping(mappings)}
                  className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  Preview Rows
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2.5 bg-white text-gray-600 text-sm font-medium rounded-[6px] border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                {!hasDedupeCapableMapping(mappings) && (
                  <span className="text-xs text-amber-600">Map a Lead ID, email, phone, or contact name column to continue.</span>
                )}
              </div>
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && (
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {okRows.length} to import
                </span>
                {skippedRows.length > 0 && (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                    {skippedRows.length} skipped
                  </span>
                )}
                {errorRows.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" /> {errorRows.length} invalid
                  </span>
                )}
              </div>
              <div className="border border-gray-200 rounded-[6px] overflow-x-auto max-h-[45vh] overflow-y-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="sticky top-0">
                    <tr className="bg-gray-50">
                      {['', 'Business', 'Contact', 'Email', 'Phone', 'Amount', 'Status'].map((h, i) => (
                        <th key={i} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.map(r => (
                      <tr
                        key={r.rowNumber}
                        className={r.status === 'error' ? 'bg-red-50' : r.status === 'skipped' ? 'bg-amber-50/50' : ''}
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          {r.status === 'ok' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                r.status === 'error' ? 'text-red-600' : 'text-amber-600'
                              }`}
                              title={r.reason}
                            >
                              <AlertCircle className="w-3.5 h-3.5" /> {r.reason}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 max-w-[160px] truncate">
                          {r.dbRow?.business_name ?? r.values.businessName ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600 max-w-[130px] truncate">
                          {r.values.contactName ?? '—'}
                          {r.warning && (
                            <span className="block text-[11px] text-amber-600" title={r.warning}>{r.warning}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600 max-w-[170px] truncate">{r.values.contactEmail ?? '—'}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{r.dbRow?.contact_phone ?? r.values.contactPhone ?? '—'}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">{r.values.amountRequested ?? '—'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {r.dbRow && (
                            <span
                              className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${
                                r.dbRow.status === 'Lost' ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {r.dbRow.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={runImport}
                  disabled={okRows.length === 0}
                  className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Users className="w-4 h-4" />
                  Import {okRows.length} Lead{okRows.length === 1 ? '' : 's'}
                </button>
                <button
                  onClick={() => setStep('map')}
                  className="px-4 py-2.5 bg-white text-gray-600 text-sm font-medium rounded-[6px] border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Step: Importing */}
          {step === 'importing' && (
            <div className="flex flex-col items-center py-10 gap-4">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">Importing {okRows.length} leads…</p>
                <p className="text-xs text-gray-400 mt-1">Deduplicating against existing pipeline leads.</p>
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && outcome && (
            <div>
              <div className="grid grid-cols-3 gap-3">
                <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-[6px] text-center">
                  <p className="text-2xl font-bold text-emerald-700">{outcome.inserted}</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Imported</p>
                </div>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-[6px] text-center">
                  <p className="text-2xl font-bold text-gray-700">{outcome.duplicates}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Already imported</p>
                </div>
                <div className={`px-4 py-3 rounded-[6px] text-center border ${
                  outcome.failed > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-2xl font-bold ${outcome.failed > 0 ? 'text-red-700' : 'text-gray-700'}`}>{outcome.failed}</p>
                  <p className={`text-xs mt-0.5 ${outcome.failed > 0 ? 'text-red-700' : 'text-gray-500'}`}>Failed</p>
                </div>
              </div>
              {(skippedRows.length > 0 || errorRows.length > 0) && (
                <p className="text-xs text-gray-500 mt-3">
                  {skippedRows.length > 0 && `${skippedRows.length} row${skippedRows.length === 1 ? '' : 's'} skipped (test leads / in-file duplicates). `}
                  {errorRows.length > 0 && `${errorRows.length} invalid row${errorRows.length === 1 ? '' : 's'} not imported.`}
                </p>
              )}
              {outcome.errors.length > 0 && (
                <div className="mt-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-[6px]">
                  {outcome.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-700">{e}</p>
                  ))}
                </div>
              )}
              <button
                onClick={close}
                className="mt-4 px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
