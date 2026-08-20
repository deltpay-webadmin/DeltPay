/**
 * Deal Room — host page for a deal submission's stages.
 *
 * Submissions linked to a pipeline lead redirect to the lead workspace
 * (/leads/:leadId), which embeds the same DealRoomStages — one page per
 * prospect, end to end. This standalone host remains for lead-less
 * submissions (Agent Desk / Submit-a-Deal) so those flows keep working.
 */

import { ArrowLeft, Loader2 } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { useAppNavigate } from '../NavigationContext';
import { useDealSubmissions, dealSubmissionActions, BOARDING_CHANNELS, type BoardingChannel } from '../dealSubmissionsStore';
import { DealRoomStages } from '../DealRoomStages';

export function DealRoomPage() {
  const { submissionId = '' } = useParams<{ submissionId: string }>();
  const routerNavigate = useNavigate();
  const { navigate } = useAppNavigate();
  const { submissions, isLoading } = useDealSubmissions();

  const sub = submissions.find(s => s.id === submissionId) ?? null;

  if (isLoading) {
    return <div className="p-10 text-center"><Loader2 className="w-6 h-6 mx-auto animate-spin text-gray-300" /></div>;
  }
  if (!sub) {
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        Deal not found.{' '}
        <button className="text-brand hover:underline" onClick={() => navigate('/agent-desk')}>Back to Agent Desk</button>
      </div>
    );
  }
  if (sub.leadId) {
    return <Navigate to={`/dashboard/leads/${sub.leadId}`} replace />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button className="text-sm text-brand hover:underline inline-flex items-center gap-1" onClick={() => routerNavigate(-1)}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{sub.merchantName}</h1>
          <p className="text-xs text-gray-500">
            {sub.contactName || 'No contact'} · {sub.email || 'no email'} · {sub.phone || 'no phone'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-gray-500 font-medium">Channel</label>
          <select
            value={sub.channel ?? ''}
            onChange={(e) => void dealSubmissionActions.setChannel(sub.id, (e.target.value || null) as BoardingChannel | null)}
            className="px-2 py-1.5 bg-white border border-gray-300 rounded-[6px] text-xs text-gray-700 focus:outline-none"
          >
            <option value="">—</option>
            {BOARDING_CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <DealRoomStages submissionId={submissionId} />
    </div>
  );
}

export default DealRoomPage;
