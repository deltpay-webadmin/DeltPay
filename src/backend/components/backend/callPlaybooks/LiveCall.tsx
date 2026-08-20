/**
 * Live Call — the guided in-call experience: setup, screenplay with A/B
 * variants and merge fields, one-tap objections, in-call actions (book a
 * meeting, send the application), and the end-call disposition log with
 * lead write-back. Runs on the Call Playbooks page and embedded in the
 * lead workspace (pass initialLeadId / autostart).
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowRight, CalendarCheck, CalendarPlus, Check, ChevronLeft, Clock,
  FlaskConical, Link2, Mail, MapPin, MessageSquare, Phone, PhoneOff,
  RefreshCw, RotateCcw, Video, X, Zap,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../../lib/supabase';
import { useSession } from '../SessionContext';
import { useAppNavigate } from '../NavigationContext';
import { dealSubmissionActions } from '../dealSubmissionsStore';
import { applyCallOutcome } from '../callOutcomes';
import {
  DISPOSITIONS, PRODUCT_META, STAGE_ORDER, ScriptBody, CoachingNote,
  assignVariant, fmtDur, fmtPct, invokeRepAction, matchIndustry, openSms,
  type Card, type CallSession, type LeadLite, type Playbook, type Variant,
} from './core';

// ══════════════════════════════════════
// LIVE CALL
// ══════════════════════════════════════

export function LiveCall({ playbooks, cards, variants, sessions, leads, onLogged, initialLeadId, autostart }: {
  playbooks: Playbook[]; cards: Card[]; variants: Variant[]; sessions: CallSession[];
  leads: LeadLite[]; onLogged: () => void;
  /** Preselect this lead (deep link from the pipeline). */
  initialLeadId?: string | null;
  /** Start the call as soon as the lead + playbook resolve. */
  autostart?: boolean;
}) {
  const session = useSession();
  const [product, setProduct] = useState<'deltpay' | 'deltcapital'>('deltpay');
  const [playbookId, setPlaybookId] = useState<string>('');
  const [leadId, setLeadId] = useState<string>(initialLeadId ?? '');
  const [repName, setRepName] = useState(() => localStorage.getItem('delt_rep_name') ?? '');
  const [inCall, setInCall] = useState(false);
  const [assignment, setAssignment] = useState<Record<string, Variant>>({});
  const [stage, setStage] = useState('intro');
  const [objectionCard, setObjectionCard] = useState<Card | null>(null);
  const [objectionsHit, setObjectionsHit] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [ending, setEnding] = useState(false);
  const [disposition, setDisposition] = useState<string>('');
  const [meetingBooked, setMeetingBooked] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [actionsLog, setActionsLog] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Default the rep name from the signed-in profile
  useEffect(() => {
    if (!repName && session.displayName) setRepName(session.displayName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.displayName]);

  const productBooks = playbooks.filter(p => p.product === product);
  const playbook = playbooks.find(p => p.id === playbookId) ?? null;
  const lead = leads.find(l => l.id === leadId) ?? null;

  // Auto-suggest playbook from the lead's industry
  useEffect(() => {
    if (!lead) return;
    const ind = matchIndustry(lead.industry);
    const match = productBooks.find(p => p.industry === ind) ?? productBooks.find(p => p.industry === 'Universal');
    if (match) setPlaybookId(match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId, product]);

  useEffect(() => {
    if (!playbookId && productBooks.length) {
      setPlaybookId(productBooks.find(p => p.industry === 'Universal')?.id ?? productBooks[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, playbooks]);

  const stageCards = useMemo(() =>
    cards.filter(c => c.playbook_id === playbook?.id)
      .sort((a, b) => a.sort_order - b.sort_order), [cards, playbook]);
  const objectionCards = useMemo(() =>
    cards.filter(c => !c.playbook_id && c.product === product && c.card_type === 'objection')
      .sort((a, b) => a.sort_order - b.sort_order), [cards, product]);

  const merge: Record<string, string> = useMemo(() => {
    const m: Record<string, string> = {};
    if (repName) m.rep_name = repName;
    if (lead) {
      m.business_name = lead.business_name;
      if (lead.contact_name) m.owner_first_name = lead.contact_name.split(' ')[0];
      if (lead.industry) m.business_type = lead.industry.toLowerCase();
    }
    return m;
  }, [repName, lead]);

  const startCall = () => {
    if (!playbook) return;
    localStorage.setItem('delt_rep_name', repName);
    const asg: Record<string, Variant> = {};
    for (const c of [...stageCards, ...objectionCards]) {
      const v = assignVariant(c, variants, sessions);
      if (v) asg[c.id] = v;
    }
    setAssignment(asg);
    setStage('intro');
    setObjectionCard(null);
    setObjectionsHit([]);
    setElapsed(0);
    setEnding(false);
    setDisposition('');
    setMeetingBooked(false);
    setNotes('');
    setActionsLog([]);
    setInCall(true);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };

  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; };
  useEffect(() => () => stopTimer(), []);

  // Deep-linked with autostart: dial as soon as the lead row and its
  // auto-matched playbook have resolved. One shot per mount.
  const autostarted = useRef(false);
  useEffect(() => {
    if (!autostart || autostarted.current || inCall || !playbook) return;
    if (initialLeadId && !lead) return; // lead list still loading
    autostarted.current = true;
    startCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autostart, playbook, lead, inCall]);

  const hitObjection = (c: Card) => {
    setObjectionCard(c);
    setObjectionsHit(prev => (prev.includes(c.id) ? prev : [...prev, c.id]));
  };

  const saveSession = async () => {
    if (!supabase || !playbook) return;
    setSaving(true);
    const dispo = DISPOSITIONS.find(d => d.code === disposition);
    const variant_map: Record<string, string> = {};
    Object.entries(assignment).forEach(([cid, v]) => { variant_map[cid] = v.id; });
    const { error } = await supabase.from('call_sessions').insert({
      rep_name: repName || null,
      lead_id: lead?.id ?? null,
      lead_name: lead ? (lead.contact_name ? `${lead.contact_name} — ${lead.business_name}` : lead.business_name) : null,
      playbook_id: playbook.id,
      variant_map,
      disposition: disposition || null,
      connected: dispo?.connected ?? false,
      conversation_30s: (dispo?.connected ?? false) && elapsed >= 30,
      meeting_booked: meetingBooked || !!dispo?.meeting,
      objections_hit: objectionsHit,
      duration_seconds: elapsed,
      notes: [notes, actionsLog.length ? `Actions: ${actionsLog.join(' | ')}` : ''].filter(Boolean).join('\n') || null,
    });
    setSaving(false);
    if (error) {
      toast.error(`Could not log the call: ${error.message}`);
      return;
    }
    // Write the outcome back to the lead (timeline + stage/status) so the
    // pipeline reflects the call without anyone re-typing it.
    if (lead?.id) {
      void applyCallOutcome(lead.id, disposition, {
        label: dispo?.label ?? disposition ?? 'Logged',
        durationSeconds: elapsed,
        notes: notes || undefined,
        repName: repName || undefined,
        meetingWhen: meetingBooked ? actionsLog.find(a => a.startsWith('Meeting booked'))?.replace('Meeting booked — ', '') : undefined,
      });
    }
    setInCall(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 4000);
    onLogged();
  };

  // ── Setup screen ──
  if (!inCall) {
    return (
      <div className="max-w-3xl space-y-4">
        {savedMsg && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-[8px] px-4 py-2.5">
            <Check className="w-4 h-4" /> Call logged — stats updated. Dial the next one.
          </div>
        )}
        <div className="bg-white rounded-[8px] border border-gray-200 p-5 space-y-4">
          <p className="text-[13px] font-semibold text-gray-900">Set up the call</p>

          <div className="flex gap-2">
            {(['deltpay', 'deltcapital'] as const).map(p => (
              <button key={p} onClick={() => { setProduct(p); setPlaybookId(''); }}
                className={`flex-1 border rounded-[8px] px-4 py-3 text-left transition-colors ${product === p ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-gray-300'}`}>
                <p className="text-[14px] font-semibold text-gray-900">{PRODUCT_META[p].label}</p>
                <p className="text-[12px] text-gray-500">{PRODUCT_META[p].sub}</p>
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-gray-600 block mb-1">Lead (optional — fills the script)</label>
              <select value={leadId} onChange={e => setLeadId(e.target.value)}
                className="w-full border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] bg-white">
                <option value="">No lead selected — practice mode</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.business_name}{l.contact_name ? ` — ${l.contact_name}` : ''}{l.industry ? ` (${l.industry})` : ''}
                  </option>
                ))}
              </select>
              {lead?.contact_phone && (
                <p className="text-[12px] text-gray-500 mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.contact_phone}</p>
              )}
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-600 block mb-1">Playbook</label>
              <select value={playbookId} onChange={e => setPlaybookId(e.target.value)}
                className="w-full border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] bg-white">
                {productBooks.map(p => <option key={p.id} value={p.id}>{p.industry} — {p.name}</option>)}
              </select>
              {lead && matchIndustry(lead.industry) && (
                <p className="text-[12px] text-indigo-600 mt-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Auto-matched to the lead's industry</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-gray-600 block mb-1">Your name (fills {'{{rep_name}}'})</label>
            <input value={repName} onChange={e => setRepName(e.target.value)} placeholder="e.g. Sarah"
              className="w-full sm:w-64 border border-gray-200 rounded-[6px] px-3 py-2 text-[13px]" />
          </div>

          {playbook && (
            <div className="border-t border-gray-100 pt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[12px] text-gray-500">
                {stageCards.length} stage cards · {objectionCards.length} objection cards ready
                {stageCards.some(c => c.test_mode) && (
                  <span className="ml-2 inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5 text-[11px] font-medium">
                    <FlaskConical className="w-3 h-3" /> A/B test running — variants rotate
                  </span>
                )}
              </div>
              <button onClick={startCall}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold rounded-[8px] px-5 py-2.5 transition-colors">
                <Phone className="w-4 h-4" /> Start call
              </button>
            </div>
          )}
        </div>

        <RepQuickstats sessions={sessions} repName={repName} />
      </div>
    );
  }

  // ── In-call: end-call panel ──
  if (ending) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="bg-white rounded-[8px] border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-gray-900">How did it end?</p>
            <span className="text-[12px] text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {fmtDur(elapsed)}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {DISPOSITIONS.map(d => (
              <button key={d.code} onClick={() => { setDisposition(d.code); if (d.meeting) setMeetingBooked(true); }}
                className={`flex items-start gap-2.5 border rounded-[8px] px-3 py-2.5 text-left transition-colors ${disposition === d.code ? d.color + ' ring-1 ring-current' : 'border-gray-200 hover:border-gray-300'}`}>
                <d.icon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <span className="block text-[13px] font-medium">{d.label}</span>
                  <span className="block text-[11px] opacity-70">{d.next}</span>
                </span>
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[13px] text-gray-700">
            <input type="checkbox" checked={meetingBooked} onChange={e => setMeetingBooked(e.target.checked)} className="rounded" />
            Meeting / appointment booked
          </label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes — what worked, what stalled, exact words they used…"
            className="w-full border border-gray-200 rounded-[6px] px-3 py-2 text-[13px]" />
          {actionsLog.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-[6px] px-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 mb-1">Actions taken on this call</p>
              {actionsLog.map((a, i) => <p key={i} className="text-[12px] text-emerald-900">• {a}</p>)}
            </div>
          )}
          {objectionsHit.length > 0 && (
            <p className="text-[12px] text-gray-500">
              Objections hit: {objectionsHit.map(id => cards.find(c => c.id === id)?.title).filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="flex items-center justify-between pt-1">
            <button onClick={() => setEnding(false)} className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Back to script
            </button>
            <button onClick={saveSession} disabled={!disposition || saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-[13px] font-semibold rounded-[8px] px-5 py-2.5">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Log call
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── In-call: live screenplay ──
  const currentCard = objectionCard ?? stageCards.find(c => c.card_type === stage) ?? stageCards[0];
  const currentVariant = currentCard ? assignment[currentCard.id] : null;

  return (
    <div className="max-w-6xl space-y-3">
      {/* Call header */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-[8px] border border-gray-200 px-4 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 truncate">
              {lead ? `${lead.contact_name ?? 'Owner'} — ${lead.business_name}` : 'Practice call'}
            </p>
            <p className="text-[11px] text-gray-500 truncate">{playbook?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[13px] font-mono tabular-nums ${elapsed >= 30 ? 'text-emerald-600 font-semibold' : 'text-gray-600'}`}>
            {fmtDur(elapsed)}{elapsed >= 30 && <span className="text-[10px] ml-1 align-middle">CONVO</span>}
          </span>
          <button onClick={() => { setEnding(true); }}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold rounded-[6px] px-3 py-1.5">
            <PhoneOff className="w-3.5 h-3.5" /> End call
          </button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-3 lg:items-start">
      <div className="space-y-3 min-w-0">
      {/* Stage tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {STAGE_ORDER.map(s => {
          const has = stageCards.some(c => c.card_type === s.type);
          if (!has) return null;
          const active = !objectionCard && stage === s.type;
          return (
            <button key={s.type} onClick={() => { setObjectionCard(null); setStage(s.type); }}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${active ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
              {s.label}
            </button>
          );
        })}
        {objectionCard && (
          <span className="px-4 py-1.5 rounded-full text-[13px] font-medium bg-rose-600 text-white whitespace-nowrap">
            Objection: {objectionCard.title}
          </span>
        )}
      </div>

      {/* Active card */}
      <div className="bg-white rounded-[8px] border border-gray-200 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {objectionCard ? 'Objection' : STAGE_ORDER.find(s => s.type === stage)?.label} · {currentCard?.title}
            </p>
            {currentVariant && (
              <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 border ${currentCard?.test_mode ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                {currentVariant.label}{currentVariant.is_control && !currentVariant.label.includes('control') ? ' · control' : ''}{currentCard?.test_mode ? ' · testing' : ''}
              </span>
            )}
          </div>
          {objectionCard && (
            <button onClick={() => setObjectionCard(null)}
              className="flex items-center gap-1 text-[12px] font-medium text-indigo-600 hover:text-indigo-800">
              <RotateCcw className="w-3.5 h-3.5" /> Back to script
            </button>
          )}
        </div>

        {currentVariant ? (
          <>
            <ScriptBody body={currentVariant.body} merge={merge} large />
            {currentVariant.coaching_note && <CoachingNote note={currentVariant.coaching_note} large />}
          </>
        ) : (
          <p className="text-sm text-gray-400">No script variant on this card yet — add one in the Playbooks tab.</p>
        )}

        {/* Next stage */}
        {!objectionCard && (
          <div className="flex justify-end mt-5">
            {(() => {
              const idx = STAGE_ORDER.findIndex(s => s.type === stage);
              const next = STAGE_ORDER.slice(idx + 1).find(s => stageCards.some(c => c.card_type === s.type));
              return next ? (
                <button onClick={() => setStage(next.type)}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-indigo-600 hover:text-indigo-800">
                  {next.label} <ArrowRight className="w-4 h-4" />
                </button>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* One-tap objection bar */}
      <div className="bg-white rounded-[8px] border border-gray-200 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">If they push back — one tap</p>
        <div className="flex flex-wrap gap-1.5">
          {objectionCards.map(c => (
            <button key={c.id} onClick={() => hitObjection(c)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${objectionCard?.id === c.id ? 'bg-rose-600 text-white border-rose-600' : objectionsHit.includes(c.id) ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-rose-300 hover:text-rose-700'}`}>
              {c.trigger_label ?? c.title}
            </button>
          ))}
        </div>
      </div>
      </div>{/* /left column */}

      {/* Right column — in-call actions */}
      <div className="space-y-3 mt-3 lg:mt-0">
        <ActionPanel
          product={product}
          lead={lead}
          repName={repName}
          onBooked={() => { setMeetingBooked(true); setDisposition('MEETING_BOOKED'); }}
          onLog={entry => setActionsLog(prev => [...prev, entry])}
        />
        {actionsLog.length > 0 && (
          <div className="bg-white rounded-[8px] border border-gray-200 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">This call</p>
            <div className="space-y-1.5">
              {actionsLog.map((a, i) => (
                <p key={i} className="text-[12px] text-gray-700 flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> {a}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>{/* /grid */}
    </div>
  );
}

// ════════════════════════════════════
// ACTION PANEL (in-call): book meeting · send app link
// ════════════════════════════════════
// Talks to the rep-actions edge function. Meetings send a confirmation
// email + .ics invite immediately; 24h/2h reminders run on pg_cron.
// Texts follow the house convention: we open the rep's SMS app
// (Google Voice) with the message prefilled — nothing sends silently.

export function ActionPanel({ product, lead, repName, onBooked, onLog }: {
  product: 'deltpay' | 'deltcapital';
  lead: LeadLite | null;
  repName: string;
  onBooked: (when: string) => void;
  onLog: (entry: string) => void;
}) {
  const { navigate } = useAppNavigate();
  const [email, setEmail] = useState(lead?.contact_email ?? '');
  const [phone, setPhone] = useState(lead?.contact_phone ?? '');
  const business = lead?.business_name ?? 'this merchant';
  const contactName = lead?.contact_name ?? '';

  // ── book meeting state ──
  const [showBook, setShowBook] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [mode, setMode] = useState<'online' | 'in_person'>('online');
  const [meetLink, setMeetLink] = useState(() => localStorage.getItem('delt_meet_link') ?? '');
  const [location, setLocation] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookedSms, setBookedSms] = useState<{ uri: string; body: string } | null>(null);
  const [appProduct, setAppProduct] = useState<'pay' | 'capital'>(product === 'deltcapital' ? 'capital' : 'pay');
  const [sending, setSending] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => { setEmail(lead?.contact_email ?? ''); setPhone(lead?.contact_phone ?? ''); }, [lead?.id]);
  useEffect(() => { setAppProduct(product === 'deltcapital' ? 'capital' : 'pay'); }, [product]);

  const flash = (msg: string) => { setDone(msg); setErr(null); setTimeout(() => setDone(null), 5000); };
  const fail = (msg: string) => { setErr(msg); setDone(null); };

  const book = async () => {
    if (!date || !time) { fail('Pick a date and time'); return; }
    const startsAt = new Date(`${date}T${time}`);
    if (isNaN(startsAt.getTime())) { fail('Invalid date/time'); return; }
    setBooking(true); setErr(null);
    if (mode === 'online' && meetLink) localStorage.setItem('delt_meet_link', meetLink);
    const r = await invokeRepAction({
      action: 'book_meeting',
      lead_id: lead?.id ?? null,
      product,
      merchant_business: business,
      contact_name: contactName || null,
      contact_email: email || null,
      contact_phone: phone || null,
      mode,
      location: mode === 'in_person' ? location || null : null,
      meeting_link: mode === 'online' ? meetLink || null : null,
      starts_at: startsAt.toISOString(),
      duration_min: duration,
      rep_name: repName || null,
    });
    setBooking(false);
    if (r.error) { fail(r.error); return; }
    const when = String(r.when ?? `${date} ${time}`);
    onBooked(when);
    onLog(`Meeting booked — ${when}${r.confirmation_emailed ? ' · invite emailed' : email ? ' · email failed' : ' · no email on file'}`);
    const sms = r.sms as { uri: string; body: string } | null;
    setBookedSms(sms ?? null);
    setShowBook(false);
    flash(r.confirmation_emailed
      ? `Booked — invite + reminders are on their way`
      : `Booked — no confirmation email sent (${email ? 'send failed' : 'no email on file'})`);
  };

  // The application sends from the lead workspace now (DLT-APP e-sign, MPA
  // merchant link, Plaid connect) — this starts/reuses the deal for the
  // lead and lands the rep on the page where every send lives.
  const sendLink = async (channel: 'email' | 'sms') => {
    if (!lead?.id) { fail('Save the call as a lead first — the application sends from its workspace'); return; }
    setSending(channel); setErr(null);
    const id = await dealSubmissionActions.createFromLead({
      id: lead.id,
      businessName: lead.business_name,
      contactName: contactName || undefined,
      contactEmail: email || undefined,
      contactPhone: phone || undefined,
    });
    setSending(null);
    if (!id) { fail('Could not start the deal'); return; }
    onLog(`Opened the deal workspace for ${business} to send the ${appProduct === 'pay' ? 'DeltPay' : 'Capital'} application`);
    navigate(`/leads/${lead.id}`);
  };

  const inputCls = 'w-full border border-gray-200 rounded-[6px] px-2.5 py-1.5 text-[13px]';

  return (
    <div className="bg-white rounded-[8px] border border-gray-200 p-4 space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Take action</p>

      {/* contact */}
      <div className="space-y-1.5">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="merchant@email.com" className={inputCls} type="email" />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(305) 555-0123" className={inputCls} type="tel" />
      </div>

      {err && <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-[6px] px-2.5 py-1.5">{err}</p>}
      {done && <p className="text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-[6px] px-2.5 py-1.5 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 shrink-0" /> {done}</p>}

      {/* ── Book meeting ── */}
      {!showBook ? (
        <button onClick={() => setShowBook(true)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold rounded-[8px] px-3 py-2.5">
          <CalendarPlus className="w-4 h-4" /> Book a meeting
        </button>
      ) : (
        <div className="border border-indigo-200 bg-indigo-50/40 rounded-[8px] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold text-gray-900">Book a meeting</p>
            <button onClick={() => setShowBook(false)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} min={new Date().toISOString().slice(0, 10)} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} />
          </div>
          <div className="flex rounded-[6px] border border-gray-200 overflow-hidden">
            {([['online', Video, 'Online'], ['in_person', MapPin, 'In person']] as const).map(([v, Icon, label]) => (
              <button key={v} onClick={() => setMode(v)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-[12px] font-medium py-1.5 whitespace-nowrap ${mode === v ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`}>
                <Icon className="w-3 h-3" /> {label}
              </button>
            ))}
          </div>
          <select value={duration} onChange={e => setDuration(Number(e.target.value))} className={inputCls}>
            {[15, 30, 45, 60].map(d => <option key={d} value={d}>{d} minutes</option>)}
          </select>
          {mode === 'online'
            ? <input value={meetLink} onChange={e => setMeetLink(e.target.value)} placeholder="Video link — optional" className={inputCls} />
            : <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Address — e.g. their shop" className={inputCls} />}
          <button onClick={book} disabled={booking}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[13px] font-semibold rounded-[6px] px-3 py-2">
            {booking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
            Book + send invite
          </button>
          <p className="text-[11px] text-gray-500">Emails a calendar invite now · auto-reminds them 24h and 2h before.</p>
        </div>
      )}
      {bookedSms && (
        <button onClick={() => { openSms(bookedSms.uri, bookedSms.body); onLog('Confirmation text opened'); }}
          className="w-full flex items-center justify-center gap-2 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[13px] font-semibold rounded-[8px] px-3 py-2">
          <MessageSquare className="w-4 h-4" /> Text them the confirmation too
        </button>
      )}

      {/* ── App link ── */}
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-gray-900 flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5 text-gray-400" /> Send the application</p>
          <div className="flex rounded-full border border-gray-200 overflow-hidden">
            {([['pay', 'Pay'], ['capital', 'Capital']] as const).map(([v, label]) => (
              <button key={v} onClick={() => setAppProduct(v)}
                className={`text-[11px] font-semibold px-2.5 py-1 ${appProduct === v ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button onClick={() => sendLink('sms')} disabled={sending !== null}
            className="flex items-center justify-center gap-1.5 border border-gray-200 hover:border-gray-400 disabled:opacity-50 text-gray-800 text-[12px] font-semibold rounded-[6px] px-2 py-2">
            {sending === 'sms' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />} Text link
          </button>
          <button onClick={() => sendLink('email')} disabled={sending !== null}
            className="flex items-center justify-center gap-1.5 border border-gray-200 hover:border-gray-400 disabled:opacity-50 text-gray-800 text-[12px] font-semibold rounded-[6px] px-2 py-2">
            {sending === 'email' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />} Email link
          </button>
        </div>
        <p className="text-[11px] text-gray-500">
          {appProduct === 'pay'
            ? 'Creates a real tokenized DeltPay application — saves as they go, 14-day link.'
            : 'Pre-filled deltcapital.com application — their name and business are already in it.'}
        </p>
      </div>
    </div>
  );
}

export function RepQuickstats({ sessions, repName }: { sessions: CallSession[]; repName: string }) {
  const mine = repName ? sessions.filter(s => s.rep_name === repName) : sessions;
  const today = mine.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString());
  const connects = today.filter(s => s.connected).length;
  const meetings = today.filter(s => s.meeting_booked).length;
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Dials today', v: today.length, sub: 'persist to 6–8 attempts per lead' },
        { label: 'Connects', v: connects, sub: `${fmtPct(connects, today.length)} rate — benchmark ~16%` },
        { label: 'Meetings / docs', v: meetings, sub: '4–5% of convos is solid, 15% is elite' },
      ].map(k => (
        <div key={k.label} className="bg-white rounded-[8px] border border-gray-200 px-4 py-3">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">{k.label}</p>
          <p className="text-xl font-bold text-gray-900">{k.v}</p>
          <p className="text-[11px] text-gray-500">{k.sub}</p>
        </div>
      ))}
    </div>
  );
}
