/**
 * ────────────────────────────────────────────────────────────
 * LeadProgressBar — live milestone tracker for a lead
 * ────────────────────────────────────────────────────────────
 * Lead created ✓ → Bank connected ✓ → Underwriting (in progress) → Funded ✓
 *
 * Every checkmark is derived from live store data, so the bar advances
 * by itself as things actually happen (realtime stores push updates):
 *   • Lead created    — the lead row exists
 *   • Bank connected  — a Plaid item exists for the lead; a pending
 *                       hosted-link invite renders the step as in-progress
 *   • Underwriting    — a UW application exists (matched by business name),
 *                       or the onboarding pipeline reached Underwriting;
 *                       Approved / step past Underwriting completes it
 *   • Funded          — a funded deal for the business, or the onboarding
 *                       app reached Funded
 * Dead leads (Not Qualified / Lost, UW Declined) render a terminal badge.
 */

import React from 'react';
import { Check, X } from 'lucide-react';
import { useUnderwriting, useOnboarding, useDeals, type Lead } from './crmStore';
import { usePlaidItems, usePlaidLinkRequests } from './plaidStore';

type StepState = 'done' | 'active' | 'upcoming';

interface Step {
  key: string;
  label: string;
  state: StepState;
  caption: string;
}

function timeAgo(iso?: string | null): string {
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

export function useLeadMilestones(lead: Lead): { steps: Step[]; dead: string | null } {
  const items = usePlaidItems();
  const requests = usePlaidLinkRequests();
  const underwriting = useUnderwriting();
  const onboarding = useOnboarding();
  const deals = useDeals();

  const biz = lead.businessName.trim().toLowerCase();
  const leadItems = items.filter(i => i.leadId === lead.id);
  const pendingInvite = requests.find(r => r.leadId === lead.id && r.status === 'pending');
  const uwApp = underwriting.find(a => a.businessName.trim().toLowerCase() === biz);
  const onbApp = onboarding.find(o => o.merchantName.trim().toLowerCase() === biz);
  const deal = deals.find(d => d.borrower.trim().toLowerCase() === biz);

  const onbIdx = onbApp ? ONB_ORDER.indexOf(onbApp.currentStep) : -1;
  const uwIdx = ONB_ORDER.indexOf('Underwriting');

  // ── Terminal dead states ──
  const dead =
    lead.status === 'Not Qualified' ? 'Not Qualified'
    : lead.status === 'Lost' ? 'Lost'
    : uwApp?.stage === 'Declined' ? 'Declined in underwriting'
    : null;

  // ── Funded ──
  const funded = Boolean(deal) || onbApp?.currentStep === 'Funded';

  // ── Underwriting ──
  const uwDone = funded || uwApp?.stage === 'Approved' || (onbIdx > uwIdx && onbIdx !== -1);
  const uwActive = !uwDone && (Boolean(uwApp) || (onbApp ? onbIdx <= uwIdx : false));

  // ── Bank connected ──
  const connected = leadItems.length > 0;
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
      state: connected ? 'done' : pendingInvite ? 'active' : 'upcoming',
      caption: connected
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
      key: 'funded',
      label: 'Funded',
      state: funded ? 'done' : 'upcoming',
      caption: funded
        ? (deal?.fundedDate ? timeAgo(deal.fundedDate) : 'complete')
        : '—',
    },
  ];

  return { steps, dead };
}

function StepDot({ state, dead, light }: { state: StepState; dead: boolean; light?: boolean }) {
  if (state === 'done') {
    return (
      <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${
        dead
          ? (light ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-white/[0.06] border-(--dp-border) text-(--dp-text-faint)')
          : (light ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400')
      }`}>
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
      </span>
    );
  }
  if (state === 'active' && !dead) {
    return (
      <span className={`relative w-6 h-6 rounded-full flex items-center justify-center border ${light ? 'bg-blue-50 border-blue-300' : 'bg-[#2E6BFF]/15 border-[#2E6BFF]/50'}`}>
        <span className="absolute inline-flex w-2.5 h-2.5 rounded-full bg-[#2E6BFF]/60 animate-ping" />
        <span className="relative inline-flex w-2 h-2 rounded-full bg-[#2E6BFF]" />
      </span>
    );
  }
  return <span className={`w-6 h-6 rounded-full border ${light ? 'border-gray-200 bg-gray-50' : 'border-(--dp-border) bg-white/[0.03]'}`} />;
}

export function LeadProgressBar({ lead, compact, light }: { lead: Lead; compact?: boolean; light?: boolean }) {
  const { steps, dead } = useLeadMilestones(lead);

  const labelCls = (s: Step) =>
    light
      ? (dead ? 'text-gray-400' : s.state === 'done' ? 'text-gray-900' : s.state === 'active' ? 'text-blue-600' : 'text-gray-400')
      : (dead ? 'text-(--dp-text-faint)' : s.state === 'done' ? 'text-(--dp-text)' : s.state === 'active' ? 'text-[var(--dp-accent-text)]' : 'text-(--dp-text-faint)');

  return (
    <div className={`rounded-2xl border ${light ? 'border-gray-200 bg-gray-50/60' : 'border-(--dp-border) bg-(--dp-bg-card)'} ${compact ? 'px-3 py-2.5' : 'px-4 py-3'}`}>
      <div className="flex items-center">
        {steps.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center min-w-0" style={{ flex: '0 0 auto' }}>
              <StepDot state={s.state} dead={Boolean(dead)} light={light} />
              <span className={`mt-1.5 text-[11px] font-medium whitespace-nowrap ${labelCls(s)}`}>
                {s.label}
              </span>
              {!compact && (
                <span className={`text-[10px] whitespace-nowrap max-w-[110px] overflow-hidden text-ellipsis ${light ? 'text-gray-400' : 'text-(--dp-text-faint)'}`}>
                  {s.state === 'active' ? `${s.caption}…` : s.caption}
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${compact ? 'mb-4' : 'mb-8'} ${
                !dead && steps[i + 1].state !== 'upcoming'
                  ? (steps[i + 1].state === 'done' ? (light ? 'bg-emerald-300' : 'bg-emerald-400/40') : (light ? 'bg-blue-300' : 'bg-[#2E6BFF]/40'))
                  : (light ? 'bg-gray-200' : 'bg-(--dp-border)')
              }`} />
            )}
          </React.Fragment>
        ))}
        {dead && (
          <span className={`ml-3 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap self-start ${
            light ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-400/10 border-red-400/30 text-red-300'
          }`}>
            <X className="w-3 h-3" /> {dead}
          </span>
        )}
      </div>
    </div>
  );
}

/** Tiny inline variant for table rows / cards: four dots + connectors. */
export function LeadProgressDots({ lead }: { lead: Lead }) {
  const { steps, dead } = useLeadMilestones(lead);
  return (
    <span className="inline-flex items-center gap-1" title={steps.map(s => `${s.label}: ${s.state === 'done' ? '✓' : s.state === 'active' ? 'in progress' : '—'}`).join('  ·  ')}>
      {steps.map(s => (
        <span
          key={s.key}
          className={`w-2 h-2 rounded-full ${
            dead ? 'bg-(--dp-border)'
            : s.state === 'done' ? 'bg-emerald-400'
            : s.state === 'active' ? 'bg-[#2E6BFF] animate-pulse'
            : 'bg-(--dp-border)'
          }`}
        />
      ))}
      {dead && <X className="w-3 h-3 text-red-400" />}
    </span>
  );
}
