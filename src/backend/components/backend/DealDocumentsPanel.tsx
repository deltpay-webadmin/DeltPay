import React, { useMemo, useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Loader2,
  AlertTriangle,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import {
  useDealDocuments,
  dealDocumentActions,
  DOC_KINDS,
  type DealDocument,
  type DocKind,
} from './dealDocumentsStore';

const EXTRACT_LABELS: Record<string, string> = {
  bank_name: 'Bank',
  routing_number: 'Routing #',
  account_number: 'Account #',
  account_holder: 'Account holder',
  full_name: 'Full name',
  date_of_birth: 'Date of birth',
  address_line: 'Address',
  city: 'City',
  state: 'State',
  zip: 'ZIP',
  license_number: 'License #',
  expiration: 'Expires',
  current_processor: 'Current processor',
  monthly_volume: 'Monthly volume',
  transaction_count: 'Transactions',
  effective_rate_pct: 'Effective rate %',
};

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="p-1 rounded text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ExtractedFields({ doc, copyable }: { doc: DealDocument; copyable: boolean }) {
  if (doc.extractStatus === 'pending') {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-indigo-500 mt-1">
        <Loader2 className="w-3 h-3 animate-spin" /> Reading document…
      </p>
    );
  }
  if (doc.extractStatus === 'failed') {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-amber-600 mt-1">
        <AlertTriangle className="w-3 h-3" /> Extraction failed — open the file and read it manually.
      </p>
    );
  }
  if (doc.extractStatus !== 'done' || !doc.extracted) return null;

  const entries = Object.entries(doc.extracted).filter(
    ([k, v]) => k !== 'confidence' && k !== 'notes' && v !== '' && v !== 0 && v != null,
  );
  const confidence = String(doc.extracted.confidence ?? '');
  const notes = String(doc.extracted.notes ?? '');

  return (
    <div className="mt-2 rounded-[8px] bg-indigo-50/60 border border-indigo-100 px-3 py-2">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-500 uppercase tracking-wide mb-1">
        <Sparkles className="w-3 h-3" /> Extracted{confidence ? ` · ${confidence} confidence` : ''}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
        {entries.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-gray-500">{EXTRACT_LABELS[k] ?? k}</span>
            <span className="flex items-center gap-0.5 font-mono font-medium text-gray-800 truncate">
              {String(v)}
              {copyable && <CopyButton value={String(v)} />}
            </span>
          </div>
        ))}
      </div>
      {notes && confidence !== 'high' && (
        <p className="text-[11px] text-gray-500 mt-1.5">{notes}</p>
      )}
    </div>
  );
}

/**
 * Documents on a deal submission: upload by kind, list with AI-extracted
 * fields, download via signed URL, delete. `copyable` adds copy buttons on
 * extracted values (the ops boarding-packet surface).
 */
export function DealDocumentsPanel({
  submissionId,
  orgId,
  uploadedBy,
  copyable = false,
}: {
  submissionId: string;
  orgId: string;
  uploadedBy: string;
  copyable?: boolean;
}) {
  const { documents } = useDealDocuments();
  const [kind, setKind] = useState<DocKind>('voided_check');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const docs = useMemo(
    () => documents.filter(d => d.submissionId === submissionId),
    [documents, submissionId],
  );

  const onFile = async (file: File | undefined) => {
    if (!file || busy) return;
    setBusy(true);
    await dealDocumentActions.upload({ orgId, submissionId, docKind: kind, file, uploadedBy });
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const open = async (doc: DealDocument) => {
    const url = await dealDocumentActions.signedUrl(doc.storagePath);
    if (url) window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={kind}
          onChange={e => setKind(e.target.value as DocKind)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-[6px] text-sm text-gray-600 focus:outline-none"
        >
          {DOC_KINDS.map(k => (
            <option key={k.kind} value={k.kind}>{k.label}</option>
          ))}
        </select>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={e => void onFile(e.target.files?.[0])}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-[6px] text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {busy ? 'Uploading…' : 'Upload'}
        </button>
        <span className="text-[11px] text-gray-400">
          PDF or photo, up to 20MB. Checks, licenses, and statements are read automatically.
        </span>
      </div>

      {docs.length === 0 ? (
        <p className="text-xs text-gray-400">
          No documents yet. A complete packet — voided check, ID, latest statement — means faster
          approval and a faster bonus.
        </p>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => {
            const kindLabel = DOC_KINDS.find(k => k.kind === doc.docKind)?.label ?? doc.docKind;
            return (
              <div key={doc.id} className="rounded-[8px] border border-gray-200 bg-white px-3 py-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.filename}</p>
                    <p className="text-[11px] text-gray-400">
                      {kindLabel} · {(doc.createdAt || '').slice(0, 10)}{doc.uploadedBy ? ` · ${doc.uploadedBy}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => void open(doc)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Open"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => void dealDocumentActions.remove(doc)}
                    className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <ExtractedFields doc={doc} copyable={copyable} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
