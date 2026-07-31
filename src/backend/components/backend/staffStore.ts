/**
 * ────────────────────────────────────────────────────────────
 * Delt CRM — signed-in staff identity store
 * ────────────────────────────────────────────────────────────
 * Who is the current user and what is their staff role? First real
 * role-gated UI (the AI Management tab) needs this; the userRole toggle
 * in DeltBackendLayout is a cosmetic demo switcher, not auth.
 *
 * Reads auth.getSession() for the uid, then the caller's own
 * staff_profiles row for the role. Non-staff (or signed-out) callers
 * resolve to role null. UI should fail closed on null — RLS on the
 * underlying tables is the real enforcement either way.
 */

import { useSyncExternalStore } from 'react';
import { supabase } from '../../lib/supabase';

export type StaffRole = 'admin' | 'agent';

interface StaffIdentity {
  userId: string | null;
  role: StaffRole | null;
  isLoading: boolean;
}

let state: StaffIdentity = { userId: null, role: null, isLoading: !!supabase };

const listeners = new Set<() => void>();

function set(next: Partial<StaffIdentity>) {
  state = { ...state, ...next };
  listeners.forEach(l => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  maybeHydrate();
  return () => listeners.delete(cb);
}

const getSnapshot = () => state;

let hydrated = false;
let hydrating = false;
let watchingAuth = false;

async function maybeHydrate() {
  if (hydrated || hydrating || !supabase) {
    if (!supabase) set({ isLoading: false });
    return;
  }
  hydrating = true;
  try {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id ?? null;
    if (!uid) {
      set({ userId: null, role: null, isLoading: false });
    } else {
      const { data: profile } = await supabase
        .from('staff_profiles')
        .select('role')
        .eq('id', uid)
        .maybeSingle();
      const role = profile?.role === 'admin' ? 'admin' : profile ? 'agent' : null;
      set({ userId: uid, role, isLoading: false });
    }
    hydrated = true;

    if (!watchingAuth) {
      watchingAuth = true;
      supabase.auth.onAuthStateChange((_event, session) => {
        // Different (or no) user — refetch the role on next subscription tick.
        if (session?.user?.id !== state.userId) {
          hydrated = false;
          maybeHydrate();
        }
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Staff] identity hydration failed:', err);
    hydrated = true;
    set({ isLoading: false });
  } finally {
    hydrating = false;
  }
}

export function useStaffRole(): StaffIdentity {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
