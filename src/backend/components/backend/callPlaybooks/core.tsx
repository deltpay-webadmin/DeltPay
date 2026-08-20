/**
 * Call Playbooks — shared core: table types, dispositions, script
 * rendering, A/B variant assignment, and rep-action helpers.
 * Extracted from the BackendCallPlaybooks monolith so the Live Call
 * experience can also run embedded in the lead workspace.
 *
 * Backing tables (live project — no committed migrations):
 *   call_playbooks / playbook_cards / card_variants / call_sessions /
 *   rep_meetings, plus the rep-actions edge function.
 */

import React from 'react';
import {
  Ban, CalendarCheck, CircleDot, Clock, FileText, Flame, Lightbulb,
  PhoneOff, User, Voicemail, X,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

//                    powering the Performance tab and promote-winner flow

export interface Playbook {
  id: string; slug: string; product: 'deltpay' | 'deltcapital';
  industry: string; name: string; description: string | null; is_active: boolean;
}
export interface Card {
  id: string; slug: string; playbook_id: string | null; product: string | null;
  card_type: string; title: string; trigger_label: string | null;
  sort_order: number; test_mode: boolean; is_active: boolean;
}
export interface Variant {
  id: string; card_id: string; label: string; body: string;
  coaching_note: string | null; is_control: boolean; status: 'active' | 'retired';
}
export interface CallSession {
  id: string; created_at: string; rep_name: string | null; lead_id: string | null;
  lead_name: string | null; playbook_id: string | null;
  variant_map: Record<string, string>; disposition: string | null;
  connected: boolean; conversation_30s: boolean; meeting_booked: boolean;
  objections_hit: string[]; duration_seconds: number | null; notes: string | null;
}
export interface LeadLite {
  id: string; business_name: string; contact_name: string | null;
  contact_email: string | null; contact_phone: string | null; industry: string | null;
}
export interface Meeting {
  id: string; created_at: string; lead_id: string | null;
  product: 'deltpay' | 'deltcapital'; merchant_business: string;
  contact_name: string | null; contact_email: string | null; contact_phone: string | null;
  mode: 'online' | 'in_person'; location: string | null; meeting_link: string | null;
  starts_at: string; duration_min: number; rep_name: string | null; rep_email: string | null;
  notes: string | null; status: 'scheduled' | 'completed' | 'no_show' | 'cancelled';
  confirm_sent_at: string | null; remind_24h_sent_at: string | null; remind_2h_sent_at: string | null;
}

// ══════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════

export const STAGE_ORDER: { type: string; label: string }[] = [
  { type: 'intro', label: 'Intro' },
  { type: 'pitch', label: 'Pitch' },
  { type: 'qualification', label: 'Qual' },
  { type: 'close', label: 'Close' },
  { type: 'end_call', label: 'End' },
];

export const DISPOSITIONS: { code: string; label: string; icon: React.ElementType; color: string; next: string; meeting?: boolean; connected?: boolean }[] = [
  { code: 'MEETING_BOOKED', label: 'Meeting booked', icon: CalendarCheck, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', next: 'Calendar invite sent — prep the statement/docs ask', meeting: true, connected: true },
  { code: 'DOCS_PROMISED', label: 'Statement / docs promised', icon: FileText, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', next: 'Send secure upload link now; follow up in 24h', connected: true },
  { code: 'HOT', label: 'Hot — call back 24–48h', icon: Flame, color: 'text-orange-700 bg-orange-50 border-orange-200', next: 'Priority callback, same rep', connected: true },
  { code: 'CB_SCHED', label: 'Callback scheduled', icon: Clock, color: 'text-blue-700 bg-blue-50 border-blue-200', next: 'Requeue at the agreed time', connected: true },
  { code: 'NI_THINK', label: 'Soft no — not now', icon: CircleDot, color: 'text-gray-700 bg-gray-100 border-gray-200', next: 'Suppress 30 days, then requeue', connected: true },
  { code: 'NI_FINAL', label: 'Hard no', icon: Ban, color: 'text-red-700 bg-red-50 border-red-200', next: 'Remove from calling queue', connected: true },
  { code: 'GATEKEEPER', label: 'Gatekeeper — got referral', icon: User, color: 'text-purple-700 bg-purple-50 border-purple-200', next: 'Log the decision-maker contact, requeue', connected: true },
  { code: 'VM_LEFT', label: 'Voicemail left', icon: Voicemail, color: 'text-gray-600 bg-gray-50 border-gray-200', next: 'Retry — most connects take 6–8 attempts' },
  { code: 'NO_ANSWER', label: 'No answer', icon: PhoneOff, color: 'text-gray-600 bg-gray-50 border-gray-200', next: 'Retry — try the 4–5pm window' },
  { code: 'WRONG_NUM', label: 'Wrong number', icon: X, color: 'text-gray-600 bg-gray-50 border-gray-200', next: 'Flag lead data for cleanup' },
];

export const PRODUCT_META = {
  deltpay: { label: 'Deltpay', sub: 'Processing savings', chip: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  deltcapital: { label: 'DeltCapital', sub: 'Working capital', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
} as const;

// Map pipeline_leads.industry → playbook industry
export function matchIndustry(leadIndustry: string | null): string | null {
  if (!leadIndustry) return null;
  const s = leadIndustry.toLowerCase();
  if (/(restaurant|food|beverage|cafe|bakery|qsr)/.test(s)) return 'Restaurant';
  if (/(retail|store|shop|boutique)/.test(s)) return 'Retail';
  if (/(auto|automotive|repair|tire|mechanic)/.test(s)) return 'Automotive';
  if (/(salon|spa|beauty|barber|wellness|fitness)/.test(s)) return 'Salon & Spa';
  if (/(medical|dental|health|clinic|doctor|veterinar)/.test(s)) return 'Medical & Dental';
  if (/(e-?commerce|online|ecom)/.test(s)) return 'E-Commerce';
  return null;
}

export const fmtPct = (n: number, d: number) => (d === 0 ? '—' : `${((n / d) * 100).toFixed(1)}%`);
export const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// ══════════════════════════════════════
// SCRIPT BODY RENDERER
// ══════════════════════════════════════
// Conventions (match the seeded content):
//   {{merge_field}}          → filled from lead/rep, amber chip if unresolved
//   [GREEN]/[BLUE]/[RED] …   → color-coded conditional branch section
//   IF …:                    → bold branch label
//   (pause) (wait …)         → muted italic stage direction

const BRANCH_STYLE: Record<string, { border: string; bg: string; label: string; text: string }> = {
  GREEN: { border: 'border-emerald-300', bg: 'bg-emerald-50/60', label: 'bg-emerald-100 text-emerald-800', text: 'text-emerald-900' },
  BLUE: { border: 'border-blue-300', bg: 'bg-blue-50/60', label: 'bg-blue-100 text-blue-800', text: 'text-blue-900' },
  RED: { border: 'border-rose-300', bg: 'bg-rose-50/60', label: 'bg-rose-100 text-rose-800', text: 'text-rose-900' },
};

function renderInline(line: string, merge: Record<string, string>, key: number) {
  const parts = line.split(/(\{\{[^}]+\}\}|\([^)]*\))/g);
  return (
    <React.Fragment key={key}>
      {parts.map((p, i) => {
        const tok = p.match(/^\{\{([^}]+)\}\}$/);
        if (tok) {
          const v = merge[tok[1].trim()];
          return v
            ? <span key={i} className="font-semibold text-indigo-700 bg-indigo-50 rounded px-1">{v}</span>
            : <span key={i} className="font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 text-[13px]">{tok[1].trim()}</span>;
        }
        if (/^\([^)]*\)$/.test(p)) return <span key={i} className="italic text-gray-400">{p}</span>;
        return <span key={i}>{p}</span>;
      })}
    </React.Fragment>
  );
}

export function ScriptBody({ body, merge, large }: { body: string; merge: Record<string, string>; large?: boolean }) {
  // Group lines into plain / branch sections
  const lines = body.split('\n');
  const sections: { color: string | null; lines: string[] }[] = [{ color: null, lines: [] }];
  for (const raw of lines) {
    const m = raw.match(/^\[(GREEN|BLUE|RED)\]\s*(.*)$/);
    const isIf = /^IF\s.+:/.test(raw.trim()) || /^[A-Z][A-Z\s&/'-]+:$/.test(raw.trim());
    if (m) sections.push({ color: m[1], lines: [m[2]] });
    else if (isIf && sections[sections.length - 1].color === null) sections.push({ color: 'PLAIN_BRANCH', lines: [raw] });
    else sections[sections.length - 1].lines.push(raw);
  }
  const textSize = large ? 'text-[17px] leading-[1.85]' : 'text-[14px] leading-[1.8]';
  return (
    <div className="space-y-3">
      {sections.map((sec, si) => {
        if (sec.lines.every(l => !l.trim())) return null;
        if (sec.color && sec.color !== 'PLAIN_BRANCH') {
          const st = BRANCH_STYLE[sec.color];
          const [first, ...rest] = sec.lines;
          return (
            <div key={si} className={`border-l-[3px] ${st.border} ${st.bg} rounded-r-[8px] px-4 py-3`}>
              {first?.trim() && (
                <span className={`inline-block text-[11px] font-bold tracking-wide uppercase rounded px-1.5 py-0.5 mb-1.5 ${st.label}`}>{first.replace(/:$/, '')}</span>
              )}
              <div className={`${textSize} ${st.text} whitespace-pre-wrap`}>
                {rest.map((l, i) => <div key={i} className={l.trim() ? '' : 'h-3'}>{renderInline(l, merge, i)}</div>)}
              </div>
            </div>
          );
        }
        return (
          <div key={si} className={`${textSize} text-gray-800 whitespace-pre-wrap`}>
            {sec.lines.map((l, i) => {
              const isIf = /^IF\s.+:/.test(l.trim()) || /^[A-Z][A-Z\s&/'-]+:$/.test(l.trim());
              if (isIf) return <div key={i} className="font-bold text-gray-900 mt-2">{renderInline(l, merge, i)}</div>;
              return <div key={i} className={l.trim() ? '' : 'h-3'}>{renderInline(l, merge, i)}</div>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export function CoachingNote({ note, large }: { note: string; large?: boolean }) {
  return (
    <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-[8px] px-3.5 py-3 mt-4">
      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700 mb-0.5">Caller thinking</p>
        <p className={`${large ? 'text-[14px]' : 'text-[13px]'} text-amber-900 leading-relaxed`}>{note}</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// VARIANT ASSIGNMENT (A/B rotation)
// ══════════════════════════════════════
// test_mode ON  → round-robin: pick the ACTIVE variant with the fewest
//                 logged sessions, so exposure stays balanced.
// test_mode OFF → the control variant (or first active).

export function usageCount(variantId: string, cardId: string, sessions: CallSession[]) {
  return sessions.filter(s => s.variant_map?.[cardId] === variantId).length;
}

export function assignVariant(card: Card, variants: Variant[], sessions: CallSession[]): Variant | null {
  const active = variants.filter(v => v.card_id === card.id && v.status === 'active');
  if (active.length === 0) return null;
  if (!card.test_mode || active.length === 1) {
    return active.find(v => v.is_control) ?? active[0];
  }
  return [...active].sort((a, b) => usageCount(a.id, card.id, sessions) - usageCount(b.id, card.id, sessions))[0];
}

// ════════════════════════════════════
// Rep-action helpers (rep-actions edge function + SMS handoff)
// ════════════════════════════════════
// Meetings send a confirmation email + .ics invite immediately; 24h/2h
// reminders run on pg_cron. Texts follow the house convention: we open
// the rep's SMS app with the message prefilled — nothing sends silently.

export async function invokeRepAction(body: Record<string, unknown>): Promise<{ ok?: boolean; error?: string;[k: string]: unknown }> {
  if (!supabase) return { error: 'Supabase not configured' };
  const { data, error } = await supabase.functions.invoke('rep-actions', { body });
  if (error) {
    // FunctionsHttpError carries the response — try to surface the real message
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx) { const j = await ctx.json(); if (j?.error) return { error: String(j.error) }; }
    } catch { /* fall through */ }
    return { error: error.message || 'Request failed' };
  }
  return (data ?? {}) as { ok?: boolean; error?: string };
}

export function openSms(uri: string, body: string) {
  try { navigator.clipboard?.writeText(body); } catch { /* best effort */ }
  window.open(uri, '_self');
}
