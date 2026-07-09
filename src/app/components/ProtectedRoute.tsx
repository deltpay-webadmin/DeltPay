import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/app/lib/auth';
import { PageLoader } from '@/app/components/PageLoader';

/* Gates its child routes behind a live Supabase session. While the initial
   session lookup is in flight we show the branded loader (avoids a flash of the
   sign-in page for already-authenticated users). Unauthenticated visitors are
   sent to /signin, remembering where they were headed so we can bounce them
   back after login. */
export function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/signin" replace state={{ from: location }} />;

  return <Outlet />;
}
