/**
 * ────────────────────────────────────────────────────────────
 * Merchant applications store — the unified MPA intake
 * ────────────────────────────────────────────────────────────
 * One row per deal submission (merchant_applications). Rows are read via
 * RLS (safe: sensitive fields are ciphertext; `masks` carries last-4s) and
 * every mutation goes through the mpa-application edge function, which is
 * where encryption, validation, and PDF generation live. Same store shape
 * as dealSubmissionsStore: hydrate on first subscribe, realtime refresh,
 * offline no-op without Supabase.
 */

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';
import type { ApplicationData, LuqraPricing, Masks, PaysafePricing, PricingBundle } from '../../../features/mpa/types';

export type MpaStatus = 'draft' | 'submitted' | 'boarded' | 'void';

export interface MerchantApplication {
  id: string;
  submissionId: string;
  status: MpaStatus;
  currentStep: number;
  data: Partial<ApplicationData>;
  masks: Partial<Masks>;
  pricing: PricingBundle | null;
  hasLink: boolean;
  linkExpiresAt: string | null;
  submittedAt: string | null;
  boardedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MpaState {
  applications: MerchantApplication[];
  isLoading: boolean;
  isOnline: boolean;
}

let state: MpaState = { applications: [], isLoading: false, isOnline: Boolean(supabase) };
const listeners = new Set<() => void>();
let hydrated = false;
let channelBound = false;

function emit() {
  for (const fn of listeners) fn();
}

function fromDb(row: any): MerchantApplication {
  return {
    id: row.id,
    submissionId: row.submission_id,
    status: row.status,
    currentStep: row.current_step ?? 0,
    data: row.data ?? {},
    masks: row.masks ?? {},
    pricing: row.pricing ?? null,
    hasLink: Boolean(row.token_hash),
    linkExpiresAt: row.token_expires_at ?? null,
    submittedAt: row.submitted_at ?? null,
    boardedAt: row.boarded_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function refresh() {
  if (!supabase) return;
  const res = await supabase
    .from('merchant_applications')
    .select('*')
    .neq('status', 'void')
    .order('created_at', { ascending: false });
  if (res.error) return;
  state = { ...state, applications: (res.data ?? []).map(fromDb), isLoading: false };
  emit();
}

function maybeHydrate() {
  if (hydrated || !supabase) return;
  hydrated = true;
  state = { ...state, isLoading: true };
  void refresh();
  if (!channelBound) {
    channelBound = true;
    supabase
      .channel('merchant-applications-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'merchant_applications' }, () => {
        void refresh();
      })
      .subscribe();
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  maybeHydrate();
  return () => listeners.delete(fn);
}

export function useMerchantApplications(): MpaState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function useApplicationForSubmission(submissionId: string): MerchantApplication | null {
  const s = useMerchantApplications();
  return s.applications.find((a) => a.submissionId === submissionId) ?? null;
}

async function callMpa(body: Record<string, unknown>): Promise<any> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.functions.invoke('mpa-application', { body });
  if (error) {
    let message = error.message ?? 'Request failed';
    try {
      const ctx = (error as any).context;
      if (ctx && typeof ctx.json === 'function') {
        const payload = await ctx.json();
        if (payload?.error) message = payload.error;
      }
    } catch { /* keep default */ }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export const merchantApplicationActions = {
  /** Idempotent: returns the existing application for the submission if one exists. */
  async createForSubmission(submissionId: string): Promise<MerchantApplication | null> {
    try {
      const json = await callMpa({ action: 'create', submissionId });
      await refresh();
      const app = json.application;
      return state.applications.find((a) => a.id === app.id) ?? {
        ...app,
        pricing: app.pricing ?? null,
        hasLink: Boolean(app.hasLink),
        linkExpiresAt: app.linkExpiresAt ?? null,
        boardedAt: app.boardedAt ?? null,
        createdAt: '',
        updatedAt: '',
      };
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start the application');
      return null;
    }
  },

  async savePricing(applicationId: string, channel: 'Luqra' | 'Paysafe', pricing: LuqraPricing | PaysafePricing): Promise<boolean> {
    try {
      await callMpa({ action: 'save-pricing', applicationId, channel, pricing });
      await refresh();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save pricing');
      return false;
    }
  },

  async previewMpa(applicationId: string, channel: 'Luqra' | 'Paysafe'): Promise<{ pdfBase64: string; warnings: string[] } | null> {
    try {
      const json = await callMpa({ action: 'preview-mpa', applicationId, channel });
      return { pdfBase64: json.pdfBase64, warnings: json.warnings ?? [] };
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not generate the MPA preview');
      return null;
    }
  },

  async packet(applicationId: string, includeSensitive: boolean): Promise<string | null> {
    try {
      const json = await callMpa({ action: 'packet', applicationId, includeSensitive });
      return json.packet as string;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not build the boarding packet');
      return null;
    }
  },

  async markBoarded(applicationId: string): Promise<boolean> {
    try {
      await callMpa({ action: 'mark-boarded', applicationId });
      await refresh();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not mark as boarded');
      return false;
    }
  },

  async createLink(applicationId: string, applicantEmail?: string): Promise<{ url: string; expiresAt: string } | null> {
    try {
      const json = await callMpa({ action: 'create-link', applicationId, applicantEmail });
      await refresh();
      const url = `${window.location.origin}/#${json.path}`;
      return { url, expiresAt: json.expiresAt };
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create the merchant link');
      return null;
    }
  },

  async voidLink(applicationId: string): Promise<boolean> {
    try {
      await callMpa({ action: 'void-link', applicationId });
      await refresh();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not revoke the link');
      return false;
    }
  },

  refresh,
};
