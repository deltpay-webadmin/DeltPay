// Persistence backends for the MPA wizard. The wizard itself is
// context-free; the CRM host injects staffBackend(applicationId) and the
// public link page injects tokenBackend(token). Both talk to the same
// mpa-application edge function — auth (JWT vs token) is the only
// difference, resolved server-side.

import { supabase } from '../../app/lib/supabase';
import type { ApplicationData, Masks, SecureData } from './types';

export interface ClientApplication {
  id: string;
  submissionId: string;
  status: 'draft' | 'submitted' | 'boarded' | 'void';
  currentStep: number;
  data: Partial<ApplicationData>;
  masks: Partial<Masks>;
  submittedAt: string | null;
  submission?: { merchantName: string; contactName: string };
}

export interface SaveArgs {
  data?: ApplicationData;
  secureUpdate?: Partial<SecureData>;
  currentStep?: number;
}

export interface UploadDocArgs {
  kind: 'voided_check' | 'drivers_license' | 'other';
  filename: string;
  contentType: string;
  contentBase64: string;
}

export interface MpaBackend {
  get(): Promise<ClientApplication>;
  save(args: SaveArgs): Promise<ClientApplication>;
  submit(): Promise<ClientApplication>;
  uploadDoc(args: UploadDocArgs): Promise<{ documentId: string }>;
}

async function invoke(body: Record<string, unknown>): Promise<any> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.functions.invoke('mpa-application', { body });
  if (error) {
    // supabase-js wraps non-2xx responses; surface the server's message.
    let message = error.message ?? 'Request failed';
    try {
      const ctx = (error as any).context;
      if (ctx && typeof ctx.json === 'function') {
        const payload = await ctx.json();
        if (payload?.problems?.length) message = payload.problems.join('\n');
        else if (payload?.error) message = payload.error;
      }
    } catch { /* keep default message */ }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export function staffBackend(applicationId: string): MpaBackend {
  const base = { applicationId };
  return {
    get: async () => (await invoke({ action: 'get', ...base })).application,
    save: async (args) => (await invoke({ action: 'save', ...base, ...args })).application,
    submit: async () => (await invoke({ action: 'submit', ...base })).application,
    uploadDoc: async (args) => await invoke({ action: 'upload-doc', ...base, ...args }),
  };
}

export function tokenBackend(token: string): MpaBackend {
  const base = { token };
  return {
    get: async () => (await invoke({ action: 'get', ...base })).application,
    save: async (args) => (await invoke({ action: 'save', ...base, ...args })).application,
    submit: async () => (await invoke({ action: 'submit', ...base })).application,
    uploadDoc: async (args) => await invoke({ action: 'upload-doc', ...base, ...args }),
  };
}
