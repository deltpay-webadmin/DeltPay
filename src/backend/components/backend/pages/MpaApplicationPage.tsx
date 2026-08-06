/**
 * CRM host for the MPA application wizard — the primary flow: Carlos or an
 * agent fills the unified merchant application with the merchant sitting
 * next to them, then boards it (channel + pricing + in-person DocuSign)
 * from the Agent Desk boarding panel. The wizard itself is context-free
 * (src/features/mpa) and also powers the public merchant link.
 */

import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { MpaWizard } from '../../../../features/mpa/MpaWizard';
import { staffBackend } from '../../../../features/mpa/api';
import { useLang } from '../i18n';

export function MpaApplicationPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { lang } = useLang();
  const backend = useMemo(() => staffBackend(applicationId ?? ''), [applicationId]);

  if (!applicationId) return null;

  return (
    <div className="min-h-full bg-gray-50 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <MpaWizard
            backend={backend}
            initialLang={lang === 'es' ? 'es' : 'en'}
            onDone={() => { /* stays on the success screen; boarding continues in Agent Desk */ }}
          />
        </div>
      </div>
    </div>
  );
}
