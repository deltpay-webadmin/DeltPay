/**
 * DocuSign embedded-signing return page. The recipient view's returnUrl
 * lands here with ?event=signing_complete|cancel|decline|session_timeout.
 * Shown on the iPad after the merchant finishes — no data access, just a
 * "hand the tablet back" message. The signed PDF is captured server-side by
 * the docusign-connect webhook.
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router';

export function SigningCompletePage() {
  const location = useLocation();
  const event = useMemo(() => {
    // HashRouter: the query lives inside the hash — check both places.
    const search = location.search || window.location.hash.split('?')[1] || '';
    return new URLSearchParams(search.startsWith('?') ? search : `?${search}`).get('event') ?? '';
  }, [location.search]);

  const ok = event === 'signing_complete';
  const cancelled = event === 'cancel' || event === 'decline';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${ok ? 'bg-emerald-100' : 'bg-amber-100'}`}>
          {ok ? '✓' : '·'}
        </div>
        <h1 className="text-xl font-semibold text-gray-900">
          {ok ? 'All signed — thank you!' : cancelled ? 'Signing was not completed' : 'Signing session ended'}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {ok
            ? 'You can hand the tablet back to your representative. / Puede devolver la tableta a su representante.'
            : 'Please hand the tablet back to your representative to restart the signing session. / Devuelva la tableta a su representante para reiniciar la sesión de firma.'}
        </p>
      </div>
    </div>
  );
}
