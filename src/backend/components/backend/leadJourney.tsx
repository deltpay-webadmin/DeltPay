/**
 * ────────────────────────────────────────────────────────────
 * Lead journey — one derivation of "where is this deal, and
 * what's the ONE next action?"
 * ────────────────────────────────────────────────────────────
 * Fuses every store a prospect touches (leads, submissions, Plaid,
 * contracts, underwriting, capital, MPA, documents, calls/meetings)
 * into:
 *   • useLeadMilestones(lead)  — the 5-step progress bar model
 *     (moved here from LeadProgressBar, which re-exports it)
 *   • useLeadNextAction(lead)  — the guided-flow state machine:
 *     current stage label + the single recommended CTA + its handler
 *   • <NextActionButton/>      — that CTA as a drop-in button, used by
 *     the pipeline table rows and the lead detail/workspace headers
 *
 * Spine-resolved (submission_id / lead_id) with business-name fallback
 * for rows that predate the deal spine.
 */

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  ArrowRight, Banknote, CalendarCheck, FileSignature, Landmark, Loader2,
  PenLine, Phone, RotateCcw, Scale, ShieldCheck,
} from 'lucide-react';
import {
  leadActions, underwritingActions, useDeals, useOnboarding, useUnderwriting,
  type Lead, type OnboardingApp, type UWApplication,
} from './crmStore';
import { itemUiStatus, plaidActions, usePlaidItems, usePlaidLinkRequests } from './plaidStore';
import { dealSubmissionActions, useDealSubmissions, type DealSubmission } from './dealSubmissionsStore';
import { contractActions, useContracts, type Contract } from './contractsStore';
import { capitalActions, useCapital, type CapitalDeal } from './capitalStore';
import { useDealDocuments } from './dealDocumentsStore';
import { useApplicationForSubmission } from './merchantApplicationsStore';
import { useCallActivity, type LeadCallSession, type LeadMeeting } from './callActivityStore';
import { fundingWriteback } from './spineWritebacks';
import { useAppNavigate } from './NavigationContext';
import { useSession } from './SessionContext';

export type StepState = 'done' | 'active' | 'upcoming';

export interface Step {
  key: string;
  label: string;
  state: StepState;
  caption: string;
}

/** Everything the journey resolved for this lead, for consumers that need
 * more than the 5 steps (next-action engine, workspace panels). */
export interface LeadJourneyEntities {
  submission: DealSubmission | null;
  uwApp: UWApplication | undefined;
  onbApp: OnboardingApp | undefined;
  capitalDeal: CapitalDeal | null;
  appContract: Contract | null;
  mcaContract: Contract | null;
  dealContracts: Contract[];
  plaidConnected: boolean;
  plaidVerifying: boolean;
  hasPendingInvite: boolean;
  hasId: boolean;
  hasCheck: boolean;
  mpaDone: boolean;
  /** Money moved (capital) — one of the two ways a deal is won. */
  funded: boolean;
  /** Merchant account approved & installed (processing) — the other way. */
  boarded: boolean;
  sessions: LeadCallSession[];
  meetings: LeadMeeting[];
}

export function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '';
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const ONB_ORDER = ['Application Submitted', 'Bank Verification', 'Identity Verification', 'Underwriting', 'Docs & E-Sign', 'Funded'];

export function useLeadMilestones(lead: Lead): { steps: Step[]; dead: string | null; entities: LeadJourneyEntities } {
  const items = usePlaidItems();
  const requests = usePlaidLinkRequests();
  const underwriting = useUnderwriting();
  const onboarding = useOnboarding();
  const deals = useDeals();
  const { submissions } = useDealSubmissions();
  const contracts = useContracts();
  const { deals: capitalDeals } = useCapital();
  const { documents } = useDealDocuments();
  const { sessions, meetings } = useCallActivity(lead.id);

  const biz = lead.businessName.trim().toLowerCase();
  const leadItems = items.filter(i => i.leadId === lead.id);
  const pendingInvite = requests.find(r => r.leadId === lead.id && r.status === 'pending');
  // Spine-resolved (submission_id/lead_id) with name-match fallback for
  // legacy rows that predate the deal spine.
  const submission = submissions.find(s => s.leadId === lead.id && s.status !== 'Declined') ?? null;
  const uwApp = underwriting.find(a => a.leadId === lead.id)
    ?? (submission ? underwriting.find(a => a.submissionId === submission.id) : undefined)
    ?? underwriting.find(a => a.businessName.trim().toLowerCase() === biz);
  const onbApp = onboarding.find(o => o.merchantName.trim().toLowerCase() === biz);
  const legacyDeal = deals.find(d => d.borrower.trim().toLowerCase() === biz);
  const capitalDeal = (submission ? capitalDeals.find(d => d.submissionId === submission.id) : undefined)
    ?? (uwApp?.approvedDealId ? capitalDeals.find(d => d.id === uwApp.approvedDealId) : undefined)
    ?? null;
  const dealContracts = submission
    ? contracts.filter(c => c.submissionId === submission.id && !['voided', 'declined'].includes(c.status))
    : contracts.filter(c => c.leadId === lead.id && !['voided', 'declined'].includes(c.status));
  const mcaContract = dealContracts.find(c => c.kind === 'mca') ?? null;
  const appContract = dealContracts.find(c => c.kind === 'deal_application') ?? null;
  const mpaContract = dealContracts.find(c => c.kind === 'mpa') ?? null;
  const mpaApp = useApplicationForSubmission(submission?.id ?? '');
  const subDocs = submission ? documents.filter(d => d.submissionId === submission.id) : [];
  const hasId = subDocs.some(d => d.docKind === 'drivers_license');
  const hasCheck = subDocs.some(d => d.docKind === 'voided_check');
  const mpaDone = mpaApp?.status === 'boarded' || mpaContract?.status === 'completed';
  const signedDone = Boolean(mcaContract && mcaContract.status === 'completed' && mcaContract.countersignedAt);
  const signedActive = !signedDone && dealContracts.length > 0;

  const onbIdx = onbApp ? ONB_ORDER.indexOf(onbApp.currentStep) : -1;
  const uwIdx = ONB_ORDER.indexOf('Underwriting');

  // ── Terminal dead states ──
  const dead =
    lead.status === 'Not Qualified' ? 'Not Qualified'
    : lead.status === 'Lost' ? 'Lost'
    : uwApp?.stage === 'Declined' ? 'Declined in underwriting'
    : null;

  // ── Won: funded (capital) or boarded (processing) ──
  const funded = Boolean(capitalDeal && (capitalDeal.fundedAt || capitalDeal.status !== 'approved'))
    || Boolean(legacyDeal) || onbApp?.currentStep === 'Funded';
  const boarded = Boolean(mpaApp?.status === 'boarded')
    || Boolean(submission && (submission.status === 'Activated' || submission.status === 'Paid'));

  // ── Underwriting ──
  const uwDone = funded || uwApp?.stage === 'Approved' || (onbIdx > uwIdx && onbIdx !== -1);
  const uwActive = !uwDone && (Boolean(uwApp) || (onbApp ? onbIdx <= uwIdx : false));

  // ── Bank connected ──
  // "Connected" (done) only once transaction data has actually landed;
  // until the first successful sync the step pulses as "verifying".
  const connected = leadItems.length > 0;
  const verifying = connected && leadItems.every(i => itemUiStatus(i) === 'verifying');
  const needsRepair = leadItems.some(i => itemUiStatus(i) === 'reconnect');
  const firstItem = leadItems.slice().sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))[0];

  const steps: Step[] = [
    {
      key: 'created',
      label: 'Lead created',
      state: 'done',
      caption: lead.createdAt ? timeAgo(lead.createdAt) : (lead.source || ''),
    },
    {
      key: 'plaid',
      label: 'Bank connected',
      state: connected && !verifying ? 'done' : (verifying || pendingInvite) ? 'active' : 'upcoming',
      caption: needsRepair
        ? 'reconnect needed'
        : verifying
          ? 'verifying bank data'
          : connected
            ? (firstItem?.institutionName || `${leadItems.length} connection${leadItems.length === 1 ? '' : 's'}`)
            : pendingInvite
              ? `invite sent ${timeAgo(pendingInvite.createdAt)}`
              : 'not connected',
    },
    {
      key: 'underwriting',
      label: 'Underwriting',
      state: uwDone ? 'done' : uwActive ? 'active' : 'upcoming',
      caption: uwDone
        ? (uwApp?.stage === 'Approved' ? 'Approved' : 'cleared')
        : uwActive
          ? (uwApp?.stage || onbApp?.currentStep || 'in review')
          : connected ? 'ready to start' : 'awaiting bank data',
    },
    {
      key: 'signed',
      label: 'Signed',
      state: signedDone ? 'done' : signedActive ? 'active' : 'upcoming',
      caption: signedDone
        ? 'MCA executed'
        : mcaContract
          ? (mcaContract.status === 'completed' ? 'awaiting countersign' : `MCA ${mcaContract.status}`)
          : signedActive
            ? `${dealContracts.length} envelope${dealContracts.length === 1 ? '' : 's'} out`
            : '—',
    },
    {
      key: 'funded',
      label: 'Funded',
      state: (funded || boarded) ? 'done' : 'upcoming',
      caption: funded
        ? (legacyDeal?.fundedDate ? timeAgo(legacyDeal.fundedDate) : 'complete')
        : boarded ? 'boarded' : '—',
    },
  ];

  const entities: LeadJourneyEntities = {
    submission,
    uwApp,
    onbApp,
    capitalDeal,
    appContract,
    mcaContract,
    dealContracts,
    plaidConnected: connected,
    plaidVerifying: verifying,
    hasPendingInvite: Boolean(pendingInvite),
    hasId,
    hasCheck,
    mpaDone: Boolean(mpaDone),
    funded,
    boarded,
    sessions,
    meetings,
  };

  return { steps, dead, entities };
}

// ══════════════════════════════════════════════════════════════
// Next-action engine
// ══════════════════════════════════════════════════════════════

export interface LeadNextAction {
  key: string;
  /** Where the deal is — short label for the row/header. */
  stageLabel: string;
  /** The ONE recommended action, as button text. */
  cta: string;
  hint?: string;
  icon: React.ElementType;
  /** Permission required to run it; callers fall back to a passive label. */
  perm?: string;
  tone: 'primary' | 'secondary' | 'won' | 'dead';
  run: (navigate: (page: string) => void) => void | Promise<void>;
}

/** The one page that drives this lead's deal end-to-end: the lead workspace. */
export function leadWorkspacePath(lead: Lead, _submissionId?: string | null): string | null {
  return `/leads/${lead.id}`;
}

const callPath = (lead: Lead, autostart: boolean) =>
  `/call-playbooks?lead=${encodeURIComponent(lead.id)}${autostart ? '&autostart=1' : ''}`;

/** Dispositions that mean "we actually spoke to them". */
const CONNECTED_DISPOS = new Set(['MEETING_BOOKED', 'DOCS_PROMISED', 'HOT', 'CB_SCHED', 'NI_THINK', 'GATEKEEPER']);

export function useLeadNextAction(lead: Lead): LeadNextAction {
  const { dead, entities } = useLeadMilestones(lead);

  return useMemo<LeadNextAction>(() => {
    const {
      submission, uwApp, capitalDeal, appContract, mcaContract,
      plaidConnected, hasPendingInvite, hasId, hasCheck, mpaDone,
      funded, boarded, sessions, meetings,
    } = entities;
    const dealPath = leadWorkspacePath(lead, submission?.id);
    const goDeal = (navigate: (p: string) => void) => { if (dealPath) navigate(dealPath); };

    // 1 — closed-lost / disqualified / declined
    if (dead) {
      return {
        key: 'reopen', stageLabel: 'Closed', cta: 'Reopen', hint: dead, icon: RotateCcw, tone: 'dead',
        run: () => {
          leadActions.update(lead.id, { status: 'In Progress', lastActivity: 'just now' });
          leadActions.addTimeline(lead.id, { title: 'Lead reopened', description: `Was: ${dead}`, user: 'You', timestamp: 'just now' });
          toast.success('Lead reopened');
        },
      };
    }

    // 2 — won: funded (capital) or boarded (processing)
    if (funded || boarded) {
      return {
        key: 'won', stageLabel: 'Won', cta: 'View deal', icon: Banknote, tone: 'won',
        hint: funded ? 'Deal funded' : 'Merchant boarded',
        run: navigate => {
          if (capitalDeal) navigate(`/deals/${capitalDeal.id}`);
          else goDeal(navigate);
        },
      };
    }

    // 3 — approved capital deal awaiting funding
    if (capitalDeal?.status === 'approved') {
      const packetComplete = plaidConnected && appContract?.status === 'completed'
        && mcaContract?.status === 'completed' && Boolean(mcaContract?.countersignedAt)
        && mpaDone && hasId && hasCheck;
      if (packetComplete) {
        return {
          key: 'fund', stageLabel: 'Fund', cta: 'Mark funded', icon: Banknote, tone: 'primary', perm: 'capital.fund',
          hint: 'Signed packet complete',
          run: async () => {
            const ok = await capitalActions.markFunded(capitalDeal.id);
            if (ok) await fundingWriteback(capitalDeal.submissionId ?? submission?.id, 'funded');
          },
        };
      }
      return {
        key: 'packet', stageLabel: 'Fund', cta: 'Complete signed packet', icon: FileSignature, tone: 'primary',
        hint: 'Funding is gated on the full packet', run: goDeal,
      };
    }

    // 4 — MCA signed, Delt countersignature outstanding
    if (mcaContract?.status === 'completed' && !mcaContract.countersignedAt) {
      return {
        key: 'countersign', stageLabel: 'Countersign', cta: 'Countersign MCA', icon: ShieldCheck, tone: 'primary',
        perm: 'contracts.countersign', hint: 'Merchant side signed',
        run: async () => {
          try {
            const url = await contractActions.countersignUrl(mcaContract.id);
            if (url) window.open(url, '_blank', 'noopener');
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Countersign session failed');
          }
        },
      };
    }

    // 4.5 — fully executed, packet items still missing (processing-only deals)
    if (mcaContract?.countersignedAt && !(mpaDone && hasId && hasCheck)) {
      return {
        key: 'board', stageLabel: 'Board & docs', cta: 'Collect docs / board MPA', icon: FileSignature, tone: 'primary',
        hint: [!mpaDone && 'MPA', !hasId && 'photo ID', !hasCheck && 'voided check'].filter(Boolean).join(' · ') + ' missing',
        run: goDeal,
      };
    }

    // 5 — MCA out for signature
    if (mcaContract && mcaContract.status !== 'completed') {
      return {
        key: 'mca-out', stageLabel: 'Sign', cta: 'Track MCA signature', icon: PenLine, tone: 'secondary',
        hint: `MCA ${mcaContract.status}`, run: goDeal,
      };
    }

    // 6 — approved in UW, agreement not sent yet
    if (uwApp?.stage === 'Approved' && !mcaContract) {
      return {
        key: 'send-mca', stageLabel: 'Sign', cta: 'Send MCA agreement', icon: PenLine, tone: 'primary',
        hint: uwApp.tier ? `Approved · ${uwApp.tier}` : 'Approved', run: goDeal,
      };
    }

    // 7 — underwriting in progress
    if (uwApp && uwApp.stage !== 'Approved' && uwApp.stage !== 'Declined') {
      return {
        key: 'open-uw', stageLabel: 'Underwriting', cta: 'Open UW file', icon: Scale, tone: 'secondary',
        hint: uwApp.stage,
        run: navigate => navigate(`/underwriting/${uwApp.id}`),
      };
    }

    // 8 — application signed, no UW file yet
    if (appContract?.status === 'completed' && !uwApp && submission) {
      return {
        key: 'create-uw', stageLabel: 'Underwriting', cta: 'Create UW file', icon: Scale, tone: 'primary',
        hint: 'Application signed',
        run: navigate => {
          const app = underwritingActions.create({
            businessName: submission.merchantName,
            industry: submission.vertical || 'General',
            submissionId: submission.id,
            leadId: submission.leadId ?? lead.id,
            contactName: submission.contactName || undefined,
            contactEmail: submission.email || undefined,
            contactPhone: submission.phone || undefined,
            source: 'Deal Room',
          });
          navigate(`/underwriting/${app.id}`);
        },
      };
    }

    // 9 — application out for signature
    if (appContract && appContract.status !== 'completed') {
      return {
        key: 'app-out', stageLabel: 'Application', cta: 'Track application', icon: FileSignature, tone: 'secondary',
        hint: `DLT-APP ${appContract.status}`, run: goDeal,
      };
    }

    // 10 — bank connected, application not sent
    if (submission && plaidConnected && !appContract) {
      return {
        key: 'send-app', stageLabel: 'Application', cta: 'Send funding application', icon: FileSignature, tone: 'primary',
        hint: 'Bank connected', run: goDeal,
      };
    }

    // 11 — deal started, bank not connected
    if (submission && !plaidConnected) {
      return {
        key: 'send-plaid', stageLabel: 'Application', icon: Landmark, tone: 'primary',
        cta: hasPendingInvite ? 'Resend connect link' : 'Send bank connect link',
        hint: hasPendingInvite ? 'Invite out — auto-reminders running' : 'Bank data unlocks everything',
        run: async () => {
          try {
            await plaidActions.createHostedLink(lead.id);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Could not create the connect link');
          }
        },
      };
    }

    // 12 — qualified (by stage or by call outcome), deal not started
    const lastDispo = sessions[0]?.disposition ?? null;
    if (lead.stage === 'Qualified' || lead.stage === 'Converted'
      || lastDispo === 'MEETING_BOOKED' || lastDispo === 'DOCS_PROMISED') {
      return {
        key: 'start-deal', stageLabel: 'Qualified', cta: 'Start deal', icon: ArrowRight, tone: 'primary',
        hint: 'Open one page that runs Plaid → application → sign → fund',
        run: async navigate => {
          const id = await dealSubmissionActions.createFromLead({
            id: lead.id,
            businessName: lead.businessName,
            contactName: lead.contactName,
            contactPhone: lead.contactPhone,
            contactEmail: lead.contactEmail,
            industry: lead.industry,
            monthlySales: lead.monthlySales,
            type: lead.type,
            products: lead.products,
            assignedAgent: lead.assignedAgent,
          });
          if (id) navigate(`/leads/${lead.id}`);
        },
      };
    }

    // 13 — meeting on the calendar
    const nextMeeting = meetings.find(m => m.status === 'scheduled' && new Date(m.startsAt).getTime() > Date.now());
    if (nextMeeting) {
      return {
        key: 'meeting', stageLabel: 'Meeting set', cta: 'Prep meeting', icon: CalendarCheck, tone: 'secondary',
        hint: new Date(nextMeeting.startsAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        run: navigate => navigate(callPath(lead, false)),
      };
    }

    // 14 — spoke before, needs a follow-up dial
    if (lastDispo && CONNECTED_DISPOS.has(lastDispo)) {
      return {
        key: 'call-again', stageLabel: 'Follow up', cta: 'Call again', icon: Phone, tone: 'primary',
        hint: sessions[0] ? `Last call ${timeAgo(sessions[0].createdAt)}` : undefined,
        run: navigate => navigate(callPath(lead, true)),
      };
    }

    // 15 — cold: pick up the phone
    return {
      key: 'call', stageLabel: lead.stage === 'New' ? 'New' : 'Contact', cta: 'Start call', icon: Phone, tone: 'primary',
      hint: sessions.length ? `${sessions.length} dial${sessions.length === 1 ? '' : 's'} so far` : 'Guided script, one tap',
      run: navigate => navigate(callPath(lead, true)),
    };
  }, [lead, dead, entities]);
}

// ══════════════════════════════════════════════════════════════
// <NextActionButton/> — the CTA, drop-in
// ══════════════════════════════════════════════════════════════

const TONE_CLS: Record<LeadNextAction['tone'], string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600',
  secondary: 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50',
  won: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
  dead: 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50',
};

export function NextActionButton({ lead, size = 'sm', className = '' }: {
  lead: Lead;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const action = useLeadNextAction(lead);
  const { navigate } = useAppNavigate();
  const { can } = useSession();
  const [busy, setBusy] = useState(false);

  const sizeCls = size === 'sm'
    ? 'px-2.5 py-1.5 text-[11px] gap-1'
    : 'px-4 py-2.5 text-sm gap-1.5';

  if (action.perm && !can(action.perm)) {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] text-gray-400 ${className}`} title={action.hint}>
        <action.icon className="w-3 h-3" /> {action.stageLabel} — waiting
      </span>
    );
  }

  const Icon = action.icon;
  return (
    <button
      onClick={async e => {
        e.stopPropagation();
        if (busy) return;
        setBusy(true);
        try {
          await action.run(navigate);
        } finally {
          setBusy(false);
        }
      }}
      disabled={busy}
      title={action.hint}
      className={`inline-flex items-center whitespace-nowrap font-semibold rounded-[6px] transition-colors disabled:opacity-50 ${sizeCls} ${TONE_CLS[action.tone]} ${className}`}
    >
      {busy
        ? <Loader2 className={size === 'sm' ? 'w-3 h-3 animate-spin' : 'w-4 h-4 animate-spin'} />
        : <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      {action.cta}
    </button>
  );
}
