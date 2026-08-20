/**
 * ────────────────────────────────────────────────────────────
 * Call outcomes — disposition → lead write-back
 * ────────────────────────────────────────────────────────────
 * Every logged call lands on the lead: a timeline entry always, plus the
 * stage/status transition the disposition implies. Called from the Live
 * Call flow right after the call_sessions insert succeeds.
 *
 * Rules:
 *   • Stage only ever moves forward (never downgrade a Qualified lead
 *     because a later dial went to voicemail).
 *   • Won leads are never touched — the deal already closed.
 *   • Best-effort: a failed write-back must never lose the call log,
 *     so errors surface as a toast and nothing throws.
 */

import { toast } from 'sonner@2.0.3';
import { ensureCrmHydrated, getLeadById, leadActions, LEAD_STAGES, type Lead, type LeadStage } from './crmStore';
import { callActivityActions } from './callActivityStore';

export interface CallOutcomeMeta {
  /** Human label of the disposition (shown on the lead timeline). */
  label: string;
  durationSeconds: number;
  notes?: string;
  repName?: string;
  /** When a meeting was booked on the call, its human-readable time. */
  meetingWhen?: string;
}

/** Minimum stage each connected disposition implies. */
const RAISE_TO: Record<string, LeadStage> = {
  MEETING_BOOKED: 'Qualified',
  DOCS_PROMISED: 'Qualified',
  HOT: 'Contacted',
  CB_SCHED: 'Contacted',
  GATEKEEPER: 'Contacted',
  NI_THINK: 'Contacted',
};

const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export async function applyCallOutcome(leadId: string, code: string, meta: CallOutcomeMeta): Promise<void> {
  // Keep the CRM's picture of call activity fresh regardless of how the
  // lead update below goes.
  void callActivityActions.refresh();
  try {
    await ensureCrmHydrated();
    const lead = getLeadById(leadId);
    if (!lead) return;

    const description = [
      `Duration ${fmtDur(meta.durationSeconds)}`,
      meta.meetingWhen ? `Meeting ${meta.meetingWhen}` : '',
      (meta.notes || '').slice(0, 120),
    ].filter(Boolean).join(' · ');
    leadActions.addTimeline(leadId, {
      title: `Call — ${meta.label}`,
      description: description || 'Logged from a live call',
      user: meta.repName || 'You',
      timestamp: 'just now',
    });

    if (lead.status === 'Won') return; // closed deals: log only

    if (code === 'NI_FINAL') {
      if (lead.status !== 'Not Qualified') leadActions.markNotQualified(leadId);
      return;
    }

    const patch: Partial<Lead> = { lastActivity: 'just now' };
    const target = RAISE_TO[code];
    if (target && lead.status !== 'Not Qualified' && lead.status !== 'Lost') {
      if (LEAD_STAGES.indexOf(target) > LEAD_STAGES.indexOf(lead.stage)) patch.stage = target;
      if (lead.status === 'New') patch.status = 'In Progress';
    }
    if (code === 'WRONG_NUM' && !lead.blocker) patch.blocker = 'Bad phone number';
    leadActions.update(leadId, patch);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[CallOutcomes] write-back failed:', err);
    toast.error('Call logged, but the lead could not be updated.');
  }
}
