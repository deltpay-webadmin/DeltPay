import { Toaster } from 'sonner@2.0.3';
import { DeltBackendLayout } from './components/backend/DeltBackendLayout';
import { SessionProvider, useSession } from './components/backend/SessionContext';
import { LanguageProvider } from './components/backend/i18n';

/**
 * Self-contained Delt CRM / back-office application.
 *
 * This is the Delt-Backend project (https://github.com/deltpay-webadmin/Delt-Backend)
 * recreated as the authenticated experience for this site. It lives in an
 * isolated `src/backend` tree with its own shadcn `components/ui`, design
 * tokens (scoped under `.delt-backend-scope`), and Supabase data layer.
 *
 * It is rendered by `DashboardPage` only after a successful Supabase login.
 * SessionProvider then resolves the user's org membership, RBAC role, and
 * permission set (get_me RPC); users without a membership see an
 * access-pending screen instead of the CRM.
 */

function Gate() {
  const { loading, isMember, email, signOut } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--dp-bg-surface) text-(--dp-text-muted)">
        Loading workspace…
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-(--dp-bg-surface) px-6 text-center">
        <h1 className="text-xl font-bold text-(--dp-text)">Access pending</h1>
        <p className="max-w-md text-sm text-(--dp-text-muted)">
          {email ? `${email} is signed in but ` : 'Your account '}has not been added to a
          workspace yet. Ask an administrator to invite you, then sign in again.
        </p>
        <button
          onClick={() => void signOut()}
          className="mt-2 rounded-[8px] border border-(--dp-border) px-4 py-2 text-sm text-(--dp-text-secondary) hover:text-(--dp-text)"
        >
          Sign out
        </button>
      </div>
    );
  }

  return <DeltBackendLayout />;
}

export default function DeltBackendApp() {
  return (
    <SessionProvider>
      <LanguageProvider>
        <Toaster position="top-right" richColors theme="dark" />
        <Gate />
      </LanguageProvider>
    </SessionProvider>
  );
}
