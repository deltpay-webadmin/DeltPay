/**
 * ────────────────────────────────────────────────────────────
 * Deal documents store — merchant paperwork on a submission
 * ────────────────────────────────────────────────────────────
 * Files live in the private 'deal-docs' storage bucket at
 * org/{orgId}/{submissionId}/{uuid}-{filename}; each upload also writes a
 * deal_documents row. Extractable kinds (voided check, license, statement)
 * are sent to the extract-deal-doc edge function in the background and the
 * structured result is cached on the row for the ops boarding packet.
 */

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';
import { fileToExtractionPayload } from './docImaging';

export type DocKind =
  | 'voided_check'
  | 'drivers_license'
  | 'statement'
  | 'signed_application'
  | 'signed_mca'
  | 'signed_mpa'
  | 'decision_memo'
  | 'other';
export type ExtractStatus = 'none' | 'pending' | 'done' | 'failed';

export const DOC_KINDS: { kind: DocKind; label: string; extractable: boolean }[] = [
  { kind: 'voided_check', label: 'Voided Check', extractable: true },
  { kind: 'drivers_license', label: "Driver's License", extractable: true },
  { kind: 'statement', label: 'Processing Statement', extractable: true },
  { kind: 'signed_application', label: 'Signed Application', extractable: false },
  { kind: 'other', label: 'Other', extractable: false },
];

export interface DealDocument {
  id: string;
  submissionId: string;
  docKind: DocKind;
  filename: string;
  storagePath: string;
  extracted: Record<string, unknown> | null;
  extractStatus: ExtractStatus;
  uploadedBy: string;
  createdAt: string;
}

interface DocsState {
  documents: DealDocument[];
  isLoading: boolean;
  isOnline: boolean;
}

let state: DocsState = { documents: [], isLoading: true, isOnline: false };
const listeners = new Set<() => void>();

function set(patch: Partial<DocsState>) {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}

function fromDb(r: any): DealDocument {
  return {
    id: r.id,
    submissionId: r.submission_id,
    docKind: r.doc_kind as DocKind,
    filename: r.filename,
    storagePath: r.storage_path,
    extracted: r.extracted ?? null,
    extractStatus: (r.extract_status ?? 'none') as ExtractStatus,
    uploadedBy: r.uploaded_by || '',
    createdAt: r.created_at || '',
  };
}

let hydrated = false;
let hydrating = false;

async function maybeHydrate() {
  if (hydrated || hydrating) return;
  if (!supabase) {
    hydrated = true;
    set({ isLoading: false, isOnline: false });
    return;
  }
  hydrating = true;
  try {
    const { data, error } = await supabase
      .from('deal_documents')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    set({ documents: (data || []).map(fromDb), isLoading: false, isOnline: true });
    hydrated = true;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[DealDocuments] Hydration failed:', err);
    hydrated = true;
    set({ isLoading: false, isOnline: false });
  } finally {
    hydrating = false;
  }
}

async function refresh(): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('deal_documents')
    .select('*')
    .order('created_at', { ascending: true });
  if (!error) set({ documents: (data || []).map(fromDb), isOnline: true });
}

/** Background AI extraction; failures mark the row, never throw. */
async function runExtraction(docId: string, docKind: DocKind, filename: string, file: File) {
  if (!supabase) return;
  try {
    const payload = await fileToExtractionPayload(file);
    const { data, error } = await supabase.functions.invoke('extract-deal-doc', {
      body: { docKind, filename, ...payload },
    });
    if (error) {
      // Surface the edge function's structured message when present.
      let message = error.message ?? 'extraction failed';
      try {
        const body = await (error as any).context?.json?.();
        if (body?.message || body?.error) message = body.message ?? body.error;
      } catch { /* keep the generic message */ }
      throw new Error(message);
    }
    await supabase
      .from('deal_documents')
      .update({ extracted: data?.extraction ?? null, extract_status: 'done' })
      .eq('id', docId);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[DealDocuments] Extraction failed:', err?.message);
    await supabase.from('deal_documents').update({ extract_status: 'failed' }).eq('id', docId);
  } finally {
    await refresh();
  }
}

export const dealDocumentActions = {
  /**
   * Upload a document to storage, record it, and kick off extraction for
   * extractable kinds. orgId comes from the caller's session (org scoping
   * is also enforced by the storage policies).
   */
  async upload(args: {
    orgId: string;
    submissionId: string;
    docKind: DocKind;
    file: File;
    uploadedBy: string;
  }): Promise<boolean> {
    if (!supabase) {
      toast.error('Supabase is not configured — cannot upload documents.');
      return false;
    }
    const { orgId, submissionId, docKind, file, uploadedBy } = args;
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File exceeds 20MB.');
      return false;
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `org/${orgId}/${submissionId}/${crypto.randomUUID()}-${safeName}`;

    const { error: upErr } = await supabase.storage.from('deal-docs').upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });
    if (upErr) {
      toast.error(`Upload failed: ${upErr.message}`);
      return false;
    }

    const extractable = DOC_KINDS.find(k => k.kind === docKind)?.extractable ?? false;
    const { data: row, error: rowErr } = await supabase
      .from('deal_documents')
      .insert({
        submission_id: submissionId,
        doc_kind: docKind,
        filename: file.name,
        storage_path: path,
        extract_status: extractable ? 'pending' : 'none',
        uploaded_by: uploadedBy,
      })
      .select('id')
      .single();
    if (rowErr || !row) {
      toast.error(`Couldn't record the document: ${rowErr?.message ?? 'unknown error'}`);
      await supabase.storage.from('deal-docs').remove([path]);
      return false;
    }

    await refresh();
    if (extractable) void runExtraction(row.id, docKind, file.name, file);
    return true;
  },

  async remove(doc: DealDocument): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('deal_documents').delete().eq('id', doc.id);
    if (error) {
      toast.error(`Couldn't delete the document: ${error.message}`);
      return false;
    }
    await supabase.storage.from('deal-docs').remove([doc.storagePath]);
    await refresh();
    return true;
  },

  /** Short-lived signed URL for viewing/downloading a private document. */
  async signedUrl(storagePath: string): Promise<string | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.storage.from('deal-docs').createSignedUrl(storagePath, 3600);
    if (error || !data?.signedUrl) {
      toast.error(`Couldn't open the document: ${error?.message ?? 'unknown error'}`);
      return null;
    }
    return data.signedUrl;
  },

  refresh,
};

// Realtime: the docusign-connect webhook inserts signed-application rows
// server-side; subscribe so they appear in open panels without a refresh.
let realtimeStarted = false;
function subscribeRealtime() {
  if (!supabase || realtimeStarted) return;
  realtimeStarted = true;
  const channel = supabase
    .channel('deal-documents-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'deal_documents' },
      payload => {
        const { eventType, new: newRow, old: oldRow } = payload as any;
        if (eventType === 'DELETE') {
          set({ documents: state.documents.filter(d => d.id !== oldRow?.id) });
        } else {
          const mapped = fromDb(newRow);
          const exists = state.documents.some(d => d.id === mapped.id);
          set({
            documents: exists
              ? state.documents.map(d => (d.id === mapped.id ? mapped : d))
              : [...state.documents, mapped],
          });
        }
      },
    )
    .subscribe();
  (globalThis as any).__deltDealDocsChannel = channel;
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  void maybeHydrate();
  subscribeRealtime();
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => state;

export function useDealDocuments() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
