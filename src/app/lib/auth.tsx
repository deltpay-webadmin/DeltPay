import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/app/lib/supabase';

/* ────────────────────────────────────────────────────────────────────────────
   Auth context — a thin, typed wrapper over the existing `supabase` singleton.
   Layered on top (NOT a second client) so there is only ever one GoTrue
   instance on the origin. Provides session state + the handful of auth actions
   the customer portal needs.
   ──────────────────────────────────────────────────────────────────────────── */

/** Business/contact fields captured at sign-up, persisted into `profiles` by the
 *  `handle_new_user` DB trigger via `raw_user_meta_data`. */
export interface SignUpMetadata {
  first_name?: string;
  last_name?: string;
  business_name?: string;
  business_type?: string;
  industry?: string;
  website?: string;
  phone?: string;
  monthly_volume?: string;
  /** Which Delt products this account opted into: e.g. ['payments'], ['capital'],
   *  or both. Drives `profiles.product_access` and portal gating. */
  product_access?: string[];
}

interface AuthResult {
  error: string | null;
  /** True when sign-up succeeded but the user must confirm their email before a
   *  session exists (Supabase "Confirm email" is ON). */
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** True until the initial session lookup resolves — gate protected routes on this. */
  loading: boolean;
  signIn: (args: { email: string; password: string }) => Promise<AuthResult>;
  signUp: (args: { email: string; password: string; metadata?: SignUpMetadata }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Where the confirmation / recovery links return to. HashRouter routes live
 *  after the `#`; PKCE appends `?code=` to the query string, so these compose
 *  cleanly. */
const redirectTo = (path: string) =>
  typeof window !== 'undefined' ? `${window.location.origin}/#${path}` : undefined;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,

    async signIn({ email, password }) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },

    async signUp({ email, password, metadata }) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata as Record<string, unknown> | undefined,
          emailRedirectTo: redirectTo('/dashboard'),
        },
      });
      if (error) return { error: error.message };
      // When email confirmation is ON, signUp returns a user but no session.
      const needsEmailConfirmation = !data.session;
      return { error: null, needsEmailConfirmation };
    },

    async signOut() {
      await supabase.auth.signOut();
    },

    async resetPassword(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo('/reset-password'),
      });
      return { error: error?.message ?? null };
    },

    async updatePassword(newPassword) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error?.message ?? null };
    },
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}
