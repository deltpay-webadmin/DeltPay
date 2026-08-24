/**
 * Shared self-serve MPA entry — the one real onboarding lane.
 *
 * Lower-volume merchants coming off any marketing form (get-a-quote,
 * /onboarding, /apply) open their own deal submission + merchant
 * application draft via the mpa-application edge function's `self-start`
 * action and get back a tokenized wizard path (`/apply/mpa/<token>`).
 * The function also emails the link, so a closed tab is recoverable.
 */

import { supabase } from '@/app/lib/supabase';

/** Volume tiers self-start accepts; larger merchants stay on the assisted lane. */
export type SelfServeTier = 'under10k' | '10k_50k';

/** Map human volume labels used across marketing forms to self-start tiers. */
export function tierForVolumeLabel(label: string): SelfServeTier | null {
  const v = label.trim().toLowerCase();
  if (v === 'under10k' || v.startsWith('under $10k')) return 'under10k';
  if (v === '10k_50k' || v.startsWith('$10k')) return '10k_50k';
  return null;
}

export interface SelfStartResult {
  ok: boolean;
  /** In-app path to the tokenized MPA wizard, e.g. /apply/mpa/<token>. */
  path?: string;
  error?: string;
}

export async function selfStartApplication(input: {
  name: string;
  email: string;
  phone?: string;
  business?: string;
  volume: SelfServeTier;
  honeypotValue?: string;
}): Promise<SelfStartResult> {
  try {
    const { data, error } = await supabase.functions.invoke('mpa-application', {
      body: {
        action: 'self-start',
        name: input.name,
        email: input.email,
        phone: input.phone ?? '',
        business: input.business ?? '',
        volume: input.volume,
        hp_extra_field: input.honeypotValue ?? '',
      },
    });
    if (error || !data?.ok || typeof data.path !== 'string') {
      return { ok: false, error: error?.message ?? data?.error };
    }
    return { ok: true, path: data.path };
  } catch (err: any) {
    return { ok: false, error: err?.message };
  }
}
