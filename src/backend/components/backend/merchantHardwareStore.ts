/**
 * ────────────────────────────────────────────────────────────
 * Merchant hardware store — devices per merchant + install state
 * ────────────────────────────────────────────────────────────
 * Backs the "Hardware & Installs" card on the merchant detail
 * page. One row per physical device with a small status ladder
 * (ordered → shipped → installed → active, or returned) and
 * free-text install notes. Same pattern as dealSubmissionsStore:
 * hydrate on first hook subscription, writes refresh, offline
 * no-op without Supabase.
 */

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';

export type HardwareStatus = 'ordered' | 'shipped' | 'installed' | 'active' | 'returned';

export const HARDWARE_LADDER: HardwareStatus[] = ['ordered', 'shipped', 'installed', 'active'];

export type HardwareChannel = 'Square' | 'Luqra' | 'Paysafe' | 'Other';

export const HARDWARE_CHANNELS: HardwareChannel[] = ['Square', 'Luqra', 'Paysafe', 'Other'];

export interface MerchantHardware {
  id: string;
  merchantId: string;
  model: string;
  serial: string;
  channel: HardwareChannel;
  status: HardwareStatus;
  installedAt: string | null;
  installNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface HardwareState {
  devices: MerchantHardware[];
  isLoading: boolean;
  isOnline: boolean;
}

let state: HardwareState = { devices: [], isLoading: true, isOnline: false };
const listeners = new Set<() => void>();

function set(patch: Partial<HardwareState>) {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}

export function fromDb(r: any): MerchantHardware {
  return {
    id: r.id,
    merchantId: r.merchant_id,
    model: r.model || '',
    serial: r.serial || '',
    channel: (r.channel as HardwareChannel) || 'Other',
    status: (r.status as HardwareStatus) || 'ordered',
    installedAt: r.installed_at ?? null,
    installNotes: r.install_notes || '',
    createdAt: r.created_at || '',
    updatedAt: r.updated_at || '',
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
      .from('merchant_hardware')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    set({ devices: (data || []).map(fromDb), isLoading: false, isOnline: true });
    hydrated = true;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[MerchantHardware] Hydration failed:', err);
    hydrated = true;
    set({ isLoading: false, isOnline: false });
  } finally {
    hydrating = false;
  }
}

async function refresh(): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('merchant_hardware')
    .select('*')
    .order('created_at', { ascending: false });
  if (!error) set({ devices: (data || []).map(fromDb), isOnline: true });
}

export interface HardwareInput {
  merchantId: string;
  model: string;
  serial: string;
  channel: HardwareChannel;
}

export const merchantHardwareActions = {
  async add(input: HardwareInput): Promise<boolean> {
    if (!supabase) {
      toast.error('Supabase is not configured — cannot save the device.');
      return false;
    }
    const { error } = await supabase.from('merchant_hardware').insert({
      merchant_id: input.merchantId,
      model: input.model,
      serial: input.serial,
      channel: input.channel,
    });
    if (error) {
      // eslint-disable-next-line no-console
      console.error('[MerchantHardware] Add failed:', error);
      toast.error(`Couldn't save the device: ${error.message}`);
      return false;
    }
    await refresh();
    return true;
  },

  async setStatus(id: string, status: HardwareStatus): Promise<boolean> {
    if (!supabase) return false;
    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    // Stamp the install date the first time a device reaches installed, so
    // the record survives later status edits.
    const existing = state.devices.find(d => d.id === id);
    if ((status === 'installed' || status === 'active') && !existing?.installedAt) {
      patch.installed_at = new Date().toISOString();
    }
    const { error } = await supabase.from('merchant_hardware').update(patch).eq('id', id);
    if (error) {
      toast.error(`Couldn't update the device: ${error.message}`);
      return false;
    }
    await refresh();
    return true;
  },

  async setInstallNotes(id: string, installNotes: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('merchant_hardware')
      .update({ install_notes: installNotes, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast.error(`Couldn't save the install notes: ${error.message}`);
      return false;
    }
    await refresh();
    return true;
  },

  async remove(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('merchant_hardware').delete().eq('id', id);
    if (error) {
      toast.error(`Couldn't remove the device: ${error.message}`);
      return false;
    }
    await refresh();
    return true;
  },

  refresh,
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  void maybeHydrate();
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => state;

export function useMerchantHardware() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Devices for one merchant, newest first (rows are already sorted). */
export function devicesForMerchant(devices: MerchantHardware[], merchantId: string): MerchantHardware[] {
  return devices.filter(d => d.merchantId === merchantId);
}

/** The next rung on the status ladder, or null when there isn't one. */
export function nextHardwareStatus(status: HardwareStatus): HardwareStatus | null {
  const idx = HARDWARE_LADDER.indexOf(status);
  if (idx === -1 || idx === HARDWARE_LADDER.length - 1) return null;
  return HARDWARE_LADDER[idx + 1];
}
