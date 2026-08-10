/**
 * ────────────────────────────────────────────────────────────
 * MPA pricing templates store — saved fee schedules per processor
 * ────────────────────────────────────────────────────────────
 * Org-wide rows in mpa_pricing_templates, read and written directly via RLS
 * (nothing sensitive lives here — it's the same fee grid the boarding panel
 * edits). Same store shape as the other backend stores: hydrate on first
 * subscribe, realtime refresh, offline no-op without Supabase. Saving under
 * an existing name (case-insensitive) updates that template in place.
 */

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';
import type { PricingValues } from './mpaPricingTemplates';

export interface MpaPricingTemplate {
  id: string;
  channel: 'Luqra' | 'Paysafe';
  name: string;
  pricing: PricingValues;
  createdAt: string;
  updatedAt: string;
}

interface TemplatesState {
  templates: MpaPricingTemplate[];
  isLoading: boolean;
  isOnline: boolean;
}

let state: TemplatesState = { templates: [], isLoading: false, isOnline: Boolean(supabase) };
const listeners = new Set<() => void>();
let hydrated = false;
let channelBound = false;

function emit() {
  for (const fn of listeners) fn();
}

function fromDb(row: any): MpaPricingTemplate {
  return {
    id: row.id,
    channel: row.channel,
    name: row.name,
    pricing: row.pricing ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function refresh() {
  if (!supabase) return;
  const res = await supabase
    .from('mpa_pricing_templates')
    .select('*')
    .order('name', { ascending: true });
  if (res.error) return;
  state = { ...state, templates: (res.data ?? []).map(fromDb), isLoading: false };
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
      .channel('mpa-pricing-templates-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mpa_pricing_templates' }, () => {
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

export function useMpaPricingTemplates(channel?: 'Luqra' | 'Paysafe'): MpaPricingTemplate[] {
  const s = useSyncExternalStore(subscribe, () => state, () => state);
  return channel ? s.templates.filter((t) => t.channel === channel) : s.templates;
}

export const mpaPricingTemplateActions = {
  /** Create, or update in place when the name already exists for the channel. */
  async save(channel: 'Luqra' | 'Paysafe', name: string, pricing: PricingValues): Promise<boolean> {
    if (!supabase) {
      toast.error('Supabase is not configured');
      return false;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Template name is required');
      return false;
    }
    const existing = state.templates.find(
      (t) => t.channel === channel && t.name.toLowerCase() === trimmed.toLowerCase(),
    );
    const res = existing
      ? await supabase
          .from('mpa_pricing_templates')
          .update({ name: trimmed, pricing, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      : await supabase.from('mpa_pricing_templates').insert({ channel, name: trimmed, pricing });
    if (res.error) {
      toast.error(res.error.message);
      return false;
    }
    await refresh();
    toast.success(existing ? `Template "${trimmed}" updated` : `Template "${trimmed}" saved`);
    return true;
  },

  async remove(id: string): Promise<boolean> {
    if (!supabase) return false;
    const target = state.templates.find((t) => t.id === id);
    const res = await supabase.from('mpa_pricing_templates').delete().eq('id', id);
    if (res.error) {
      toast.error(res.error.message);
      return false;
    }
    await refresh();
    toast.success(target ? `Template "${target.name}" deleted` : 'Template deleted');
    return true;
  },

  refresh,
};
