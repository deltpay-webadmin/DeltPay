/**
 * Per-recipient email timeline — what we sent, and what they did with it.
 *
 * Reads `email_events` (migrations 20260812_01_email_health +
 * _02_email_tracking). Every automated send writes a `sent` row carrying
 * Resend's email_id; the resend-webhook then attaches `delivered`, `opened`
 * and `clicked` rows against that same id. Grouping by id turns those rows
 * back into one message with a status.
 *
 * Why this exists: before it, opening a lead told you nothing about what
 * they'd already been mailed. "Got DP-4 Tuesday, opened it twice, never
 * clicked" is the difference between a cold call and a conversation.
 *
 * Opens are pixel-based — blocked images read as "no open" and Apple Mail
 * Privacy Protection fires the pixel whether or not a human looked. Clicks
 * are the signal worth trusting, which is why they're the loudest row here.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Mail, MailOpen, MousePointerClick, AlertTriangle, Ban, RefreshCw, Send, CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export interface EmailEventRow {
  id: number;
  created_at: string;
  email_id: string | null;
  recipient: string;
  event: string;
  reason: string | null;
  subject: string | null;
  campaign: string | null;
  link_url: string | null;
  kind: string | null;
}

/** Blueprint code → what a human calls it. Unknown codes render raw rather
 * than being hidden, so a newly-added sequence shows up without a code change
 * here. */
const CAMPAIGN_NAMES: Record<string, string> = {
  'DP-2': 'Application link',
  'DP-4': 'Stall reminder · 24h',
  'DP-5': 'Stall reminder · 72h',
  'DP-6': 'Stall reminder · final',
  'DP-7': 'Submitted to underwriting',
  'DP-8': 'Approved',
  'DP-10': 'Declined · pivot',
  'DP-14': 'Cross-sell · working capital',
  'DP-15': 'Referral invite',
  'DC-15': 'Capital renewal offer',
  'PLAID-1': 'Bank connect link',
  'PLAID-2': 'Connect reminder · day 1',
  'PLAID-3': 'Connect reminder · day 3',
  'PLAID-4': 'Bank connected',
};

/** One message, with everything that happened to it folded in. */
export interface Message {
  key: string;
  sentAt: string;
  subject: string;
  campaign: string | null;
  kind: string | null;
  delivered: boolean;
  opens: number;
  firstOpenAt: string | null;
  clicks: Array<{ at: string; url: string | null }>;
  problem: { event: string; reason: string | null } | null;
}

function fmt(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const mins = Math.round((now - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  if (mins < 60 * 24 * 7) return `${Math.round(mins / (60 * 24))}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const PROBLEM_EVENTS = ['bounced', 'complained', 'failed', 'send_error', 'delivery_delayed'];

export function foldMessages(rows: EmailEventRow[]): Message[] {
  // Group by Resend's email_id. Rows without one (send_error — the send
  // never reached Resend, so no id exists) stand alone on their own key so
  // failures stay visible instead of collapsing into each other.
  const groups = new Map<string, EmailEventRow[]>();
  rows.forEach(r => {
    const key = r.email_id || `no-id:${r.id}`;
    const list = groups.get(key) || [];
    list.push(r);
    groups.set(key, list);
  });

  const messages: Message[] = [];
  groups.forEach((list, key) => {
    const byTime = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const sent = byTime.find(r => r.event === 'sent');
    const anchor = sent || byTime[0];
    const opens = byTime.filter(r => r.event === 'opened');
    const clicks = byTime.filter(r => r.event === 'clicked');
    const problem = byTime.find(r => PROBLEM_EVENTS.includes(r.event));
    messages.push({
      key,
      sentAt: anchor.created_at,
      subject: byTime.find(r => r.subject)?.subject || '(no subject)',
      campaign: byTime.find(r => r.campaign)?.campaign || null,
      kind: byTime.find(r => r.kind)?.kind || null,
      delivered: byTime.some(r => r.event === 'delivered'),
      opens: opens.length,
      firstOpenAt: opens[0]?.created_at || null,
      clicks: clicks.map(c => ({ at: c.created_at, url: c.link_url })),
      problem: problem ? { event: problem.event, reason: problem.reason } : null,
    });
  });
  return messages.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

function StatusChip({ msg }: { msg: Message }) {
  // Worst-to-best: a bounce outranks a click. One chip, so the eye lands on
  // the single most important fact about this message.
  if (msg.problem) {
    const label = msg.problem.event === 'send_error' ? 'Never sent' : msg.problem.event;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700">
        <AlertTriangle className="w-3 h-3" /> {label}
      </span>
    );
  }
  if (msg.clicks.length > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
        <MousePointerClick className="w-3 h-3" /> Clicked
      </span>
    );
  }
  if (msg.opens > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
        <MailOpen className="w-3 h-3" /> Opened{msg.opens > 1 ? ` ${msg.opens}×` : ''}
      </span>
    );
  }
  if (msg.delivered) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
        <CheckCircle2 className="w-3 h-3" /> Delivered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">
      <Send className="w-3 h-3" /> Sent
    </span>
  );
}

export function EmailTimeline({ email }: { email?: string | null }) {
  const [rows, setRows] = useState<EmailEventRow[]>([]);
  const [optedOut, setOptedOut] = useState<{ reason: string; scope: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const address = (email || '').trim().toLowerCase();

  const load = useCallback(async () => {
    if (!supabase || !address) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const [events, sup] = await Promise.all([
      supabase
        .from('email_events')
        .select('id, created_at, email_id, recipient, event, reason, subject, campaign, link_url, kind')
        .eq('recipient', address)
        .order('created_at', { ascending: false })
        .limit(500),
      supabase
        .from('email_suppressions')
        .select('reason, scope')
        .eq('email', address)
        .maybeSingle(),
    ]);
    if (events.error) { setError(events.error.message); setRows([]); }
    else setRows((events.data || []) as EmailEventRow[]);
    setOptedOut(sup.data ? { reason: sup.data.reason, scope: sup.data.scope } : null);
    setLoading(false);
  }, [address]);

  useEffect(() => { void load(); }, [load]);

  const messages = useMemo(() => foldMessages(rows), [rows]);

  if (!address) {
    return <p className="text-xs text-gray-400 text-center py-6">No email address on this lead — nothing to track.</p>;
  }
  if (loading) {
    return <p className="text-xs text-gray-400 text-center py-6">Loading email history…</p>;
  }
  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-xs font-semibold text-amber-800">Couldn't load email history</p>
        <p className="text-[11px] text-amber-700/80 mt-0.5">{error}</p>
      </div>
    );
  }

  const clicked = messages.filter(m => m.clicks.length > 0).length;
  const opened = messages.filter(m => m.opens > 0).length;

  return (
    <div className="space-y-4">
      {/* Suppression banner — the single most important thing to know before
          you wonder why a sequence went quiet. */}
      {optedOut && (
        <div className={`rounded-lg border px-4 py-3 ${optedOut.scope === 'marketing' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
          <p className={`text-xs font-semibold flex items-center gap-1.5 ${optedOut.scope === 'marketing' ? 'text-amber-800' : 'text-red-800'}`}>
            <Ban className="w-3.5 h-3.5" />
            {optedOut.scope === 'marketing' ? 'Opted out of marketing' : 'Address suppressed'}
          </p>
          <p className={`text-[11px] mt-0.5 ${optedOut.scope === 'marketing' ? 'text-amber-700/80' : 'text-red-700/80'}`}>
            {optedOut.scope === 'marketing'
              ? `Reason: ${optedOut.reason}. Offers and referral invites are skipped; application and decision emails still send. A personal one-to-one email from you is fine.`
              : `Reason: ${optedOut.reason}. Every automated email to this address is blocked. Reach out by phone, or fix a typo'd address by deleting the row in email_suppressions.`}
          </p>
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-800">{messages.length}</span> sent ·{' '}
            <span className="font-semibold text-gray-800">{opened}</span> opened ·{' '}
            <span className="font-semibold text-gray-800">{clicked}</span> clicked
          </p>
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-800"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      )}

      {messages.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-6">
          No automated email sent to {address} yet.
        </p>
      )}

      {messages.map(msg => (
        <div key={msg.key} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            {msg.clicks.length > 0
              ? <MousePointerClick className="w-4 h-4 text-emerald-600" />
              : msg.opens > 0
                ? <MailOpen className="w-4 h-4 text-blue-600" />
                : <Mail className="w-4 h-4 text-gray-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-gray-900 truncate">{msg.subject}</p>
              <StatusChip msg={msg} />
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {msg.campaign && (
                <span className="text-[11px] font-medium text-indigo-600">
                  {CAMPAIGN_NAMES[msg.campaign] || msg.campaign}
                </span>
              )}
              {msg.kind === 'marketing' && (
                <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">marketing</span>
              )}
              <span className="text-xs text-gray-400">{fmt(msg.sentAt)}</span>
            </div>
            {msg.problem?.reason && (
              <p className="text-[11px] text-red-600 mt-1 break-words">{msg.problem.reason}</p>
            )}
            {msg.firstOpenAt && (
              <p className="text-[11px] text-gray-500 mt-1">First opened {fmt(msg.firstOpenAt)}</p>
            )}
            {msg.clicks.map((c, i) => (
              <p key={i} className="text-[11px] text-emerald-700 mt-1 break-all">
                Clicked {fmt(c.at)}{c.url ? ` — ${c.url}` : ''}
              </p>
            ))}
          </div>
        </div>
      ))}

      {messages.length > 0 && (
        <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
          Opens are tracked with an image pixel — blocked images read as "not opened", and some
          privacy proxies fire the pixel without a human looking. Clicks are the reliable signal.
        </p>
      )}
    </div>
  );
}
