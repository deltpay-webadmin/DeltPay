import { Toaster } from 'sonner@2.0.3';
import { DeltBackendLayout } from './components/backend/DeltBackendLayout';

/**
 * Self-contained Delt CRM / back-office application.
 *
 * This is the Delt-Backend project (https://github.com/deltpay-webadmin/Delt-Backend)
 * recreated as the authenticated experience for this site. It lives in an
 * isolated `src/backend` tree with its own shadcn `components/ui`, design
 * tokens (scoped under `.delt-backend-scope`), and Supabase data layer.
 *
 * It is rendered by `DashboardPage` only after a successful Supabase login.
 */
export default function DeltBackendApp() {
  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <DeltBackendLayout />
    </>
  );
}
