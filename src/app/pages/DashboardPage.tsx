import { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// The CRM is a large, self-contained app — load it lazily so it never
// weighs down the public marketing bundle.
const DeltBackendApp = lazy(() => import('@/backend/DeltBackendApp'));

/**
 * Authenticated route that hosts the Delt back-office CRM.
 *
 * Renders nothing until we know the session state. With no session the user
 * is bounced to /signin; with a valid session the full CRM is mounted inside
 * `.delt-backend-scope` (which carries the CRM's own design tokens). The
 * `crm-active` body class neutralizes the marketing site's global zoom.
 */
export function DashboardPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setChecked(true);
      if (!data.session) navigate('/signin', { replace: true });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      if (!next) navigate('/signin', { replace: true });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  // Toggle native scale for the CRM while this page is mounted.
  useEffect(() => {
    document.body.classList.add('crm-active');
    return () => document.body.classList.remove('crm-active');
  }, []);

  if (!checked || !session) {
    return (
      <div className="delt-backend-scope flex min-h-screen items-center justify-center bg-canvas text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="delt-backend-scope">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-canvas text-muted-foreground">
            Loading workspace…
          </div>
        }
      >
        <DeltBackendApp />
      </Suspense>
    </div>
  );
}
