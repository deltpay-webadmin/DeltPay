/**
 * Public merchant application page — /#/apply/mpa/:token.
 *
 * The tokenized link a rep sends when the merchant isn't in the room. The
 * token authenticates every call to the mpa-application edge function
 * (only its hash is stored server-side; links expire and lock after
 * submission). Renders the same context-free wizard the CRM uses.
 */

import { useMemo } from 'react';
import { useParams } from 'react-router';
import { MpaWizard } from '../../features/mpa/MpaWizard';
import { tokenBackend } from '../../features/mpa/api';

export function MpaApplyPage() {
  const { token } = useParams<{ token: string }>();
  const backend = useMemo(() => tokenBackend(token ?? ''), [token]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <div className="text-xl font-bold tracking-tight text-gray-900">Delt Pay</div>
          <p className="text-sm text-gray-500">Secure merchant application</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          {token ? (
            <MpaWizard backend={backend} />
          ) : (
            <p className="py-10 text-center text-sm text-gray-500">
              This link is invalid or has expired. Please contact your representative for a new one.
            </p>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          Your information is encrypted in transit and at rest, and is used only to open your merchant account.
        </p>
      </div>
    </div>
  );
}
