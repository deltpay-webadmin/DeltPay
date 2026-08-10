import React, { useMemo, useState } from 'react';
import { Inbox, ChevronRight, ChevronDown, XCircle, ClipboardCopy, Paperclip, FileSpreadsheet } from 'lucide-react';
import {
  useDealSubmissions,
  dealSubmissionActions,
  SUBMISSION_PIPELINE,
  BOARDING_CHANNELS,
  type SubmissionStatus,
  type BoardingChannel,
  type DealSubmission,
} from '../dealSubmissionsStore';
import { useDealDesk } from '../dealDeskStore';
import { AgentDealDesk } from './AgentDealDesk';
import { fmtUsd, activationBonus } from '../agentComp';
import { useSession } from '../SessionContext';
import { DealDocumentsPanel, CopyButton } from '../DealDocumentsPanel';
import { ScheduleAComposer } from '../ScheduleAComposer';
import { MpaBoardingPanel } from '../MpaBoardingPanel';

const STATUS_BADGE: Record<SubmissionStatus, string> = {
  Submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  Underwriting: 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Activated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Declined: 'bg-red-50 text-red-600 border-red-200',
};

/**
 * Admin desk for the agent program: advance deal submissions through the
 * pipeline and answer deal-desk threads. Activating a deal is the trigger
 * that locks in the agent's activation bonus (paid on the next 15th).
 */
function packetText(s: DealSubmission): string {
  return [
    `Merchant: ${s.merchantName}`,
    `Contact: ${s.contactName}`,
    `Phone: ${s.phone}`,
    `Email: ${s.email}`,
    `Vertical: ${s.vertical}`,
    `Monthly volume: ${fmtUsd(s.monthlyVolume)}`,
    `Products: Processing${s.wantsPos ? ' + KORONA POS' : ''}${s.wantsCapital ? ' + Delt Capital' : ''}`,
    `Agent: ${s.agentName}`,
    `Channel: ${s.channel ?? 'unassigned'}`,
    s.notes ? `Notes: ${s.notes}` : '',
  ].filter(Boolean).join('\n');
}

/**
 * Comp-plan rule: bonus bands at $400+ are set by the merchant's first full
 * month of actual processing, not the application estimate. This confirms
 * the real volume and recomputes the bonus — keeping the agent's pipeline
 * number honest before payout.
 */
function RebandControl({ submission }: { submission: DealSubmission }) {
  const [actual, setActual] = useState('');
  const [busy, setBusy] = useState(false);
  const volume = Number(actual.replace(/[^0-9.]/g, '')) || 0;
  const newBonus = volume > 0
    ? activationBonus(volume, submission.wantsPos || submission.wantsCapital)
    : null;

  return (
    <div className="mt-3 rounded-[8px] border border-amber-200 bg-amber-50/60 px-4 py-3">
      <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide mb-1.5">
        Confirm actual volume
      </p>
      <p className="text-[11px] text-amber-700/80 mb-2">
        Bands $400+ are set by the first full month of real processing. Current bonus: {fmtUsd(submission.expectedBonus)} at {fmtUsd(submission.monthlyVolume)}/mo estimated.
      </p>
      <div className="flex items-center gap-2">
        <input
          value={actual}
          onChange={e => setActual(e.target.value)}
          placeholder="Actual monthly volume"
          inputMode="numeric"
          className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-[6px] text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        <button
          onClick={async () => {
            if (!volume || busy) return;
            setBusy(true);
            const ok = await dealSubmissionActions.reband(submission.id, volume);
            setBusy(false);
            if (ok) setActual('');
          }}
          disabled={!volume || busy}
          className="px-3 py-2 rounded-[6px] text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          {busy ? 'Saving…' : newBonus != null ? `Set bonus ${fmtUsd(newBonus)}` : 'Confirm'}
        </button>
      </div>
    </div>
  );
}

function PacketRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-2 text-sm py-1 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="flex items-center gap-0.5 font-medium text-gray-900 text-right truncate">
        {value}
        <CopyButton value={value} />
      </span>
    </div>
  );
}

export function BackendAgentDesk() {
  const [view, setView] = useState<'submissions' | 'desk'>('submissions');
  const { submissions, isLoading } = useDealSubmissions();
  const { threads } = useDealDesk();
  const [statusFilter, setStatusFilter] = useState<'All' | SubmissionStatus>('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const [packetCopied, setPacketCopied] = useState(false);
  const [scheduleDeal, setScheduleDeal] = useState<DealSubmission | null>(null);
  const { org, displayName } = useSession();

  const openThreads = threads.filter(t => t.status === 'Open').length;

  const filtered = useMemo(
    () => (statusFilter === 'All' ? submissions : submissions.filter(s => s.status === statusFilter)),
    [submissions, statusFilter],
  );

  const advance = (id: string, status: SubmissionStatus) => {
    const idx = SUBMISSION_PIPELINE.indexOf(status);
    if (idx >= 0 && idx < SUBMISSION_PIPELINE.length - 1) {
      void dealSubmissionActions.setStatus(id, SUBMISSION_PIPELINE[idx + 1]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 flex items-center gap-6 px-4 lg:px-8 pt-4 border-b border-white/[0.06]">
        {([
          { key: 'submissions' as const, label: 'Deal Submissions', badge: submissions.filter(s => s.status === 'Submitted').length },
          { key: 'desk' as const, label: 'Deal Desk', badge: openThreads },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`px-1 pb-3 text-[13px] font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              view === t.key
                ? 'border-(--dp-accent) text-(--dp-accent-text)'
                : 'border-transparent text-(--dp-text-muted) hover:text-(--dp-text)'
            }`}
          >
            {t.label}
            {t.badge > 0 && (
              <span className="min-w-5 h-5 px-1 rounded-full bg-(--dp-accent) text-white text-[10px] font-bold inline-flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === 'desk' ? (
          <AgentDealDesk />
        ) : (
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Advance deals through the pipeline. Activation locks in the agent's bonus for the next 15th payout.
              </p>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'All' | SubmissionStatus)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-[6px] text-sm text-gray-600 focus:outline-none"
              >
                {['All', ...SUBMISSION_PIPELINE, 'Declined'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-[8px] border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Merchant</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Agent</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Contact</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Volume</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Bonus</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(s => {
                    const canAdvance = SUBMISSION_PIPELINE.indexOf(s.status) >= 0
                      && s.status !== 'Paid';
                    const nextStatus = canAdvance
                      ? SUBMISSION_PIPELINE[SUBMISSION_PIPELINE.indexOf(s.status) + 1]
                      : null;
                    return (
                      <React.Fragment key={s.id}>
                      <tr
                        className="hover:bg-gray-50/50 cursor-pointer"
                        onClick={() => setOpenId(openId === s.id ? null : s.id)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 flex items-center gap-1.5">
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-300 transition-transform ${openId === s.id ? 'rotate-180' : ''}`} />
                            {s.merchantName}
                            {s.channel && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gray-100 text-gray-600 border border-gray-200">{s.channel}</span>
                            )}
                          </p>
                          <p className="text-[11px] text-gray-400 pl-5">
                            {s.vertical}{s.wantsPos ? ' · POS' : ''}{s.wantsCapital ? ' · Capital' : ''}
                            {s.notes ? ` — ${s.notes.slice(0, 60)}${s.notes.length > 60 ? '…' : ''}` : ''}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{s.agentName}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {s.contactName}{s.phone ? ` · ${s.phone}` : ''}{s.email ? ` · ${s.email}` : ''}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">{fmtUsd(s.monthlyVolume)}/mo</td>
                        <td className="px-4 py-3 text-right font-medium text-indigo-600">{fmtUsd(s.expectedBonus)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs border rounded-md ${STATUS_BADGE[s.status]}`}>{s.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {nextStatus && (
                            <button
                              onClick={e => { e.stopPropagation(); advance(s.id, s.status); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                            >
                              {nextStatus}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          {s.status !== 'Declined' && s.status !== 'Paid' && (
                            <button
                              onClick={e => { e.stopPropagation(); void dealSubmissionActions.setStatus(s.id, 'Declined'); }}
                              className="ml-2 p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Decline"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                      {openId === s.id && (
                        <tr>
                          <td colSpan={7} className="px-6 pb-6 pt-2 bg-gray-50/50">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Boarding packet */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Boarding Packet</p>
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={s.channel ?? ''}
                                      onClick={e => e.stopPropagation()}
                                      onChange={e => void dealSubmissionActions.setChannel(s.id, (e.target.value || null) as BoardingChannel | null)}
                                      className="px-2 py-1.5 bg-white border border-gray-300 rounded-[6px] text-xs text-gray-600 focus:outline-none"
                                    >
                                      <option value="">Channel…</option>
                                      {BOARDING_CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <button
                                      onClick={() => {
                                        void navigator.clipboard.writeText(packetText(s));
                                        setPacketCopied(true);
                                        setTimeout(() => setPacketCopied(false), 1500);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                    >
                                      <ClipboardCopy className="w-3.5 h-3.5" />
                                      {packetCopied ? 'Copied!' : 'Copy packet'}
                                    </button>
                                    <button
                                      onClick={e => { e.stopPropagation(); setScheduleDeal(s); }}
                                      title="Pre-populated merchant Schedule A from Delt's contracted buy rates"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                    >
                                      <FileSpreadsheet className="w-3.5 h-3.5" />
                                      Schedule A
                                    </button>
                                  </div>
                                </div>
                                <div className="rounded-[8px] border border-gray-200 bg-white px-4 py-2">
                                  <PacketRow label="Merchant" value={s.merchantName} />
                                  <PacketRow label="Contact" value={s.contactName} />
                                  <PacketRow label="Phone" value={s.phone} />
                                  <PacketRow label="Email" value={s.email} />
                                  <PacketRow label="Vertical" value={s.vertical} />
                                  <PacketRow label="Monthly volume" value={fmtUsd(s.monthlyVolume)} />
                                  <PacketRow label="Products" value={`Processing${s.wantsPos ? ' + KORONA POS' : ''}${s.wantsCapital ? ' + Delt Capital' : ''}`} />
                                  <PacketRow label="Agent" value={s.agentName} />
                                  {s.notes && <PacketRow label="Notes" value={s.notes} />}
                                </div>
                                {(s.status === 'Approved' || s.status === 'Activated') && (
                                  <RebandControl submission={s} />
                                )}
                              </div>
                              {/* Documents + extracted fields */}
                              <div>
                                <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                  <Paperclip className="w-3.5 h-3.5" /> Documents
                                </p>
                                <DealDocumentsPanel
                                  submissionId={s.id}
                                  orgId={org?.id ?? ''}
                                  uploadedBy={displayName}
                                  copyable
                                  contactName={s.contactName}
                                  contactEmail={s.email}
                                />
                              </div>
                            </div>
                            {/* Unified MPA application + processor boarding */}
                            <MpaBoardingPanel submission={s} />
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">{isLoading ? 'Loading…' : 'No submissions match.'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {scheduleDeal && (
        <ScheduleAComposer
          merchantName={scheduleDeal.merchantName}
          contactName={scheduleDeal.contactName}
          channel={scheduleDeal.channel}
          onClose={() => setScheduleDeal(null)}
        />
      )}
    </div>
  );
}
