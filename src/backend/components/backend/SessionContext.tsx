import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Real CRM identity: who is signed in, which org they belong to, their RBAC
 * role, their agent link, and the permission set their role allows.
 *
 * Loaded in one round trip from the get_me() RPC (see
 * supabase/migrations/20260731_02_role_permissions.sql). RLS enforces all of
 * this server-side regardless — the client copy only drives UI gating
 * (sidebar filtering, per-route guards, agent-scoped views).
 */

export type OrgRole = 'super_admin' | 'admin' | 'agent' | 'viewer';

export interface OrgBranding {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string | null;
}

export interface SessionInfo {
  /** true while get_me() is in flight */
  loading: boolean;
  /** false when the signed-in user has no active org membership */
  isMember: boolean;
  userId: string | null;
  role: OrgRole;
  agentId: string | null;
  agentName: string | null;
  displayName: string;
  email: string;
  org: OrgBranding | null;
  can: (perm: string) => boolean;
  signOut: () => Promise<void>;
}

const OFFLINE_ORG: OrgBranding = {
  id: 'offline',
  name: 'Delt',
  slug: 'deltpay',
  logoUrl: null,
  primaryColor: '#2E6BFF',
  secondaryColor: '#041e42',
  customDomain: null,
};

const DEFAULT_SESSION: SessionInfo = {
  loading: true,
  isMember: false,
  userId: null,
  role: 'viewer',
  agentId: null,
  agentName: null,
  displayName: '',
  email: '',
  org: null,
  can: () => false,
  signOut: async () => {},
};

const SessionContext = createContext<SessionInfo>(DEFAULT_SESSION);

export function useSession(): SessionInfo {
  return useContext(SessionContext);
}

interface MeRow {
  user_id: string;
  role: OrgRole;
  agent_id: string | null;
  agent_name: string | null;
  display_name: string | null;
  email: string | null;
  org: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    custom_domain: string | null;
  };
  perms: string[];
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ loading: boolean; me: MeRow | null }>({
    loading: Boolean(supabase),
    me: null,
  });

  useEffect(() => {
    if (!supabase) return; // offline/demo mode — full access below
    let active = true;
    supabase
      .rpc('get_me')
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('[Delt CRM] get_me failed:', error.message);
          setState({ loading: false, me: null });
          return;
        }
        setState({ loading: false, me: (data as MeRow | null) ?? null });
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<SessionInfo>(() => {
    const signOut = async () => {
      // DashboardPage's onAuthStateChange redirects to /signin on sign-out.
      await supabase?.auth.signOut();
    };

    if (!supabase) {
      // Offline/demo mode (stores fall back to seed data too).
      return {
        loading: false,
        isMember: true,
        userId: null,
        role: 'super_admin',
        agentId: null,
        agentName: null,
        displayName: 'Demo User',
        email: 'demo@deltpay.com',
        org: OFFLINE_ORG,
        can: () => true,
        signOut,
      };
    }

    const me = state.me;
    if (state.loading || !me) {
      return { ...DEFAULT_SESSION, loading: state.loading, signOut };
    }

    const perms = new Set(me.perms ?? []);
    return {
      loading: false,
      isMember: true,
      userId: me.user_id,
      role: me.role,
      agentId: me.agent_id,
      agentName: me.agent_name,
      displayName: me.display_name || me.email || 'Team member',
      email: me.email || '',
      org: {
        id: me.org.id,
        name: me.org.name,
        slug: me.org.slug,
        logoUrl: me.org.logo_url,
        primaryColor: me.org.primary_color,
        secondaryColor: me.org.secondary_color,
        customDomain: me.org.custom_domain,
      },
      can: (perm: string) => me.role === 'super_admin' || perms.has(perm),
      signOut,
    };
  }, [state]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
