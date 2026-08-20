/**
 * Call Playbooks — guided cold-call scripts by product and industry.
 * This page is the admin/rep hub: Live Call, Meetings, the playbook
 * Library (A/B variant editing), and Performance (promote winners).
 *
 * The Live Call experience itself, the shared types, and the script
 * renderer live in ../callPlaybooks/ so the lead workspace can embed
 * calling without this page.
 */

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, BookOpen, CalendarCheck, ChevronLeft, Copy, ExternalLink,
  FlaskConical, Lightbulb, MapPin, MessageSquare, Pencil, Phone, RefreshCw,
  Save, TrendingUp, Trophy, Video,
} from 'lucide-react';
import { useSearchParams } from 'react-router';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import {
  PRODUCT_META, ScriptBody, CoachingNote, fmtPct, openSms, usageCount,
  type Card, type CallSession, type Meeting, type Playbook, type Variant,
} from '../callPlaybooks/core';
import { LiveCall } from '../callPlaybooks/LiveCall';
import { useCallPlaybooksData } from '../callPlaybooks/useCallPlaybooksData';

// ══════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════

export function BackendCallPlaybooks() {
  // Deep-link from a lead: /call-playbooks?lead=<id>&autostart=1 opens the
  // Live Call tab with the lead preloaded (and dials straight in).
  const [searchParams] = useSearchParams();
  const paramLeadId = searchParams.get('lead');
  const paramAutostart = searchParams.get('autostart') === '1';
  const [tab, setTab] = useState<'live' | 'meetings' | 'library' | 'performance'>('live');
  const { playbooks, cards, variants, sessions, leads, meetings, loading, reload } = useCallPlaybooksData();

  if (!isSupabaseConfigured) {
    return (
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Call Playbooks</h1>
        <div className="bg-white rounded-[8px] border border-gray-200 p-8 text-center text-sm text-gray-500">
          <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          Supabase is not configured — call playbooks need a live database connection.
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Call Playbooks</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Guided cold-call scripts by product and industry — cycle variants, log every dial, promote what books meetings.</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-[8px] p-1">
          {([
            { id: 'live', label: 'Live Call', icon: Phone },
            { id: 'meetings', label: 'Meetings', icon: CalendarCheck },
            { id: 'library', label: 'Playbooks', icon: BookOpen },
            { id: 'performance', label: 'Performance', icon: FlaskConical },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-[8px] border border-gray-200 p-10 text-center text-sm text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading playbooks…
        </div>
      ) : tab === 'live' ? (
        <LiveCall playbooks={playbooks} cards={cards} variants={variants} sessions={sessions} leads={leads} onLogged={reload}
          initialLeadId={paramLeadId} autostart={paramAutostart} />
      ) : tab === 'meetings' ? (
        <MeetingsView meetings={meetings} onChanged={reload} />
      ) : tab === 'library' ? (
        <Library playbooks={playbooks} cards={cards} variants={variants} sessions={sessions} onChanged={reload} />
      ) : (
        <Performance playbooks={playbooks} cards={cards} variants={variants} sessions={sessions} onChanged={reload} />
      )}
    </div>
  );
}

// ════════════════════════════════════
// MEETINGS (booked pipeline + show rates)
// ════════════════════════════════════

function fmtMeetingEt(iso: string): { day: string; time: string } {
  const d = new Date(iso);
  const now = new Date();
  const et = (x: Date) => x.toLocaleDateString('en-US', { timeZone: 'America/New_York' });
  const tomorrow = new Date(now.getTime() + 86400000);
  let day = d.toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric' });
  if (et(d) === et(now)) day = 'Today';
  else if (et(d) === et(tomorrow)) day = 'Tomorrow';
  const time = d.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }) + ' ET';
  return { day, time };
}

const MEETING_STATUS_META: Record<Meeting['status'], { label: string; cls: string }> = {
  scheduled: { label: 'Scheduled', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed: { label: 'Showed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  no_show: { label: 'No-show', cls: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
};

function MeetingsView({ meetings, onChanged }: { meetings: Meeting[]; onChanged: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const now = Date.now();

  const upcoming = meetings.filter(m => m.status === 'scheduled' && new Date(m.starts_at).getTime() >= now);
  const needsOutcome = meetings.filter(m => m.status === 'scheduled' && new Date(m.starts_at).getTime() < now)
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
  const decided = meetings.filter(m => m.status === 'completed' || m.status === 'no_show');
  const showed = decided.filter(m => m.status === 'completed').length;
  const weekAhead = upcoming.filter(m => new Date(m.starts_at).getTime() < now + 7 * 86400000);
  const recent = meetings.filter(m => m.status !== 'scheduled')
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()).slice(0, 10);

  const setStatus = async (m: Meeting, status: Meeting['status']) => {
    if (!supabase) return;
    if (status === 'cancelled' && !window.confirm(`Cancel the meeting with ${m.merchant_business}? (No email is sent — let them know yourself.)`)) return;
    setBusy(m.id);
    const { error } = await supabase.from('rep_meetings').update({ status }).eq('id', m.id);
    setBusy(null);
    if (error) { window.alert(`Could not update: ${error.message}`); return; }
    onChanged();
  };

  const reminderSms = (m: Meeting) => {
    const { day, time } = fmtMeetingEt(m.starts_at);
    const where = m.mode === 'online'
      ? (m.meeting_link ? ` Join link: ${m.meeting_link}` : '')
      : (m.location ? ` Address: ${m.location}` : '');
    return `Hi ${(m.contact_name || '').split(' ')[0] || 'there'}, it's ${m.rep_name || 'your rep'} with Delt — quick reminder we're on for ${day === 'Today' ? `today at ${time}` : `${day} at ${time}`}.${where} Reply here if anything changes.`;
  };

  const MeetingRow = ({ m, outcome }: { m: Meeting; outcome?: boolean }) => {
    const { day, time } = fmtMeetingEt(m.starts_at);
    const phone = (m.contact_phone || '').replace(/[^+\d]/g, '');
    return (
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-gray-100 first:border-t-0">
        <div className="w-28 shrink-0">
          <p className={`text-[13px] font-semibold ${day === 'Today' ? 'text-indigo-700' : 'text-gray-900'}`}>{day}</p>
          <p className="text-[12px] text-gray-500">{time}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-gray-900 truncate">
            {m.merchant_business}
            {m.contact_name && <span className="font-normal text-gray-500"> — {m.contact_name}</span>}
          </p>
          <p className="text-[12px] text-gray-500 flex items-center gap-2 flex-wrap">
            <span className={`inline-block text-[10px] font-semibold uppercase rounded px-1 py-0.5 border ${PRODUCT_META[m.product].chip}`}>{PRODUCT_META[m.product].label}</span>
            <span className="flex items-center gap-1">{m.mode === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}{m.mode === 'online' ? 'Online' : (m.location || 'In person')}</span>
            {m.rep_name && <span>· {m.rep_name}</span>}
          </p>
        </div>
        {!outcome && m.status === 'scheduled' && (
          <div className="flex items-center gap-1 text-[10px] font-medium" title="Confirmation / 24h reminder / 2h reminder">
            {[['Invite', m.confirm_sent_at], ['24h', m.remind_24h_sent_at], ['2h', m.remind_2h_sent_at]].map(([label, sent]) => (
              <span key={label as string} className={`rounded px-1.5 py-0.5 border ${sent ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                {label as string}{sent ? ' ✓' : ''}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          {m.status === 'scheduled' && m.mode === 'online' && m.meeting_link && !outcome && (
            <a href={m.meeting_link} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 px-1.5">
              <ExternalLink className="w-3 h-3" /> Join
            </a>
          )}
          {m.status === 'scheduled' && phone && !outcome && (
            <button onClick={() => openSms(`sms:${phone}?&body=${encodeURIComponent(reminderSms(m))}`, reminderSms(m))}
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-[6px] px-2 py-1">
              <MessageSquare className="w-3 h-3" /> Text
            </button>
          )}
          {outcome ? (
            <>
              <button onClick={() => setStatus(m, 'completed')} disabled={busy === m.id}
                className="text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-[6px] px-2.5 py-1">Showed</button>
              <button onClick={() => setStatus(m, 'no_show')} disabled={busy === m.id}
                className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-[6px] px-2.5 py-1">No-show</button>
            </>
          ) : m.status === 'scheduled' ? (
            <button onClick={() => setStatus(m, 'cancelled')} disabled={busy === m.id}
              className="text-[11px] text-gray-400 hover:text-red-600 px-1.5">Cancel</button>
          ) : (
            <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 border ${MEETING_STATUS_META[m.status].cls}`}>{MEETING_STATUS_META[m.status].label}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Upcoming', v: String(upcoming.length), sub: 'scheduled meetings on the books' },
          { label: 'Next 7 days', v: String(weekAhead.length), sub: 'this week\u2019s pipeline' },
          { label: 'Show rate', v: decided.length ? `${((showed / decided.length) * 100).toFixed(0)}%` : '—', sub: `${showed} showed · ${decided.length - showed} no-show`, warn: decided.length >= 5 && showed / decided.length < 0.6 },
          { label: 'Awaiting outcome', v: String(needsOutcome.length), sub: 'past meetings — mark showed / no-show', warn: needsOutcome.length > 0 },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-[8px] border px-4 py-3 ${k.warn ? 'border-amber-300' : 'border-gray-200'}`}>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">{k.label}</p>
            <p className="text-xl font-bold text-gray-900">{k.v}</p>
            <p className="text-[11px] text-gray-500">{k.sub}</p>
          </div>
        ))}
      </div>

      {needsOutcome.length > 0 && (
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-amber-600 mb-2">Did they show?</p>
          <div className="bg-white rounded-[8px] border border-amber-200">
            {needsOutcome.map(m => <MeetingRow key={m.id} m={m} outcome />)}
          </div>
        </div>
      )}

      <div>
        <p className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-2">Upcoming</p>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-[8px] border border-gray-200 p-8 text-center text-[13px] text-gray-400">
            Nothing on the books yet — book meetings from the Live Call action panel and they'll show up here with automatic reminders.
          </div>
        ) : (
          <div className="bg-white rounded-[8px] border border-gray-200">
            {upcoming.map(m => <MeetingRow key={m.id} m={m} />)}
          </div>
        )}
      </div>

      {recent.length > 0 && (
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-2">Recent outcomes</p>
          <div className="bg-white rounded-[8px] border border-gray-200">
            {recent.map(m => <MeetingRow key={m.id} m={m} />)}
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-[8px] px-4 py-3 text-[12px] text-gray-500">
        Reminders go out automatically — invite on booking, then 24h and 2h before (badges above turn green as each lands). A personal text on top of the emails is the single best show-rate booster: use the Text button.
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// LIBRARY (playbook editor)
// ══════════════════════════════════════

function Library({ playbooks, cards, variants, sessions, onChanged }: {
  playbooks: Playbook[]; cards: Card[]; variants: Variant[]; sessions: CallSession[]; onChanged: () => void;
}) {
  const [productFilter, setProductFilter] = useState<'all' | 'deltpay' | 'deltcapital'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const open = playbooks.find(p => p.id === openId) ?? null;

  if (open) {
    return <PlaybookEditor playbook={open} cards={cards} variants={variants} sessions={sessions}
      onBack={() => setOpenId(null)} onChanged={onChanged} />;
  }

  const list = playbooks
    .filter(p => productFilter === 'all' || p.product === productFilter)
    .sort((a, b) => a.product === b.product
      ? (a.industry === 'Universal' ? -1 : b.industry === 'Universal' ? 1 : a.industry.localeCompare(b.industry))
      : (a.product === 'deltpay' ? -1 : 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(['all', 'deltpay', 'deltcapital'] as const).map(f => (
          <button key={f} onClick={() => setProductFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium border ${productFilter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
            {f === 'all' ? 'All' : PRODUCT_META[f].label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map(p => {
          const pbCards = cards.filter(c => c.playbook_id === p.id);
          const objCount = cards.filter(c => !c.playbook_id && c.product === p.product && c.card_type === 'objection').length;
          const vCount = variants.filter(v => pbCards.some(c => c.id === v.card_id) && v.status === 'active').length;
          const pbSessions = sessions.filter(s => s.playbook_id === p.id);
          const convos = pbSessions.filter(s => s.conversation_30s).length;
          const meetings = pbSessions.filter(s => s.meeting_booked).length;
          const testing = pbCards.some(c => c.test_mode);
          return (
            <button key={p.id} onClick={() => setOpenId(p.id)}
              className="bg-white rounded-[8px] border border-gray-200 hover:border-indigo-300 hover:shadow-sm p-4 text-left transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 border ${PRODUCT_META[p.product].chip}`}>
                  {PRODUCT_META[p.product].label}
                </span>
                {testing && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5">
                    <FlaskConical className="w-3 h-3" /> A/B live
                  </span>
                )}
              </div>
              <p className="text-[14px] font-semibold text-gray-900">{p.industry}</p>
              <p className="text-[12px] text-gray-500 line-clamp-2 mt-0.5">{p.description}</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-400">
                <span>{pbCards.length} cards</span>
                <span>{vCount} variants</span>
                <span>{objCount} objections</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                <span className="text-gray-500">{pbSessions.length} calls</span>
                <span className={meetings > 0 ? 'text-emerald-600 font-medium' : 'text-gray-400'}>
                  {meetings} meetings{convos > 0 ? ` · ${fmtPct(meetings, convos)} of convos` : ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-[8px] px-4 py-3 text-[12px] text-gray-500 flex items-start gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <span>Objection cards are shared per product — edit them once inside any playbook and every deck gets the update. Every script card carries a "Caller thinking" note so green reps learn the why while they read.</span>
      </div>
    </div>
  );
}

function PlaybookEditor({ playbook, cards, variants, sessions, onBack, onChanged }: {
  playbook: Playbook; cards: Card[]; variants: Variant[]; sessions: CallSession[];
  onBack: () => void; onChanged: () => void;
}) {
  const stageCards = cards.filter(c => c.playbook_id === playbook.id).sort((a, b) => a.sort_order - b.sort_order);
  const objCards = cards.filter(c => !c.playbook_id && c.product === playbook.product && c.card_type === 'objection').sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-4 max-w-4xl">
      <button onClick={onBack} className="flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4" /> All playbooks
      </button>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">{playbook.name}</h2>
          <span className={`text-[10px] font-semibold uppercase rounded px-1.5 py-0.5 border ${PRODUCT_META[playbook.product].chip}`}>{PRODUCT_META[playbook.product].label}</span>
        </div>
        <p className="text-[13px] text-gray-500">{playbook.description}</p>
      </div>

      <div className="space-y-3">
        <p className="text-[12px] font-bold uppercase tracking-wider text-gray-400">Stage cards</p>
        {stageCards.map(c => (
          <CardEditor key={c.id} card={c} variants={variants.filter(v => v.card_id === c.id)} sessions={sessions} onChanged={onChanged} />
        ))}
        <p className="text-[12px] font-bold uppercase tracking-wider text-gray-400 pt-2">
          Shared {PRODUCT_META[playbook.product].label} objections <span className="normal-case font-normal">(edits apply to every {PRODUCT_META[playbook.product].label} playbook)</span>
        </p>
        {objCards.map(c => (
          <CardEditor key={c.id} card={c} variants={variants.filter(v => v.card_id === c.id)} sessions={sessions} onChanged={onChanged} />
        ))}
      </div>
    </div>
  );
}

function CardEditor({ card, variants, sessions, onChanged }: {
  card: Card; variants: Variant[]; sessions: CallSession[]; onChanged: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const active = variants.filter(v => v.status === 'active');

  const toggleTest = async () => {
    if (!supabase) return;
    setBusy(true);
    await supabase.from('playbook_cards').update({ test_mode: !card.test_mode }).eq('id', card.id);
    setBusy(false); onChanged();
  };

  const addVariant = async () => {
    if (!supabase) return;
    const base = active.find(v => v.is_control) ?? active[0];
    setBusy(true);
    await supabase.from('card_variants').insert({
      card_id: card.id,
      label: `v${variants.length + 1} · challenger`,
      body: base?.body ?? '',
      coaching_note: base?.coaching_note ?? null,
      is_control: false,
    });
    setBusy(false); onChanged();
  };

  return (
    <div className="bg-white rounded-[8px] border border-gray-200">
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 w-24 shrink-0">{card.card_type.replace('_', ' ')}</span>
          <span className="text-[13px] font-semibold text-gray-900">{card.title}</span>
          {card.test_mode && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5">
              <FlaskConical className="w-3 h-3" /> testing {active.length} variants
            </span>
          )}
        </div>
        <span className="text-[11px] text-gray-400">{active.length} variant{active.length === 1 ? '' : 's'}</span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={toggleTest} disabled={busy || active.length < 2}
              title={active.length < 2 ? 'Add a second variant to start a test' : ''}
              className={`flex items-center gap-1.5 text-[12px] font-medium rounded-[6px] px-2.5 py-1.5 border transition-colors disabled:opacity-40 ${card.test_mode ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'}`}>
              <FlaskConical className="w-3.5 h-3.5" /> {card.test_mode ? 'A/B test ON — variants rotate' : 'Start A/B test'}
            </button>
            <button onClick={addVariant} disabled={busy}
              className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-400 rounded-[6px] px-2.5 py-1.5">
              <Copy className="w-3.5 h-3.5" /> Add variant (copies control)
            </button>
          </div>
          {variants.sort((a, b) => (b.is_control ? 1 : 0) - (a.is_control ? 1 : 0)).map(v => (
            <VariantEditor key={v.id} variant={v} card={card} sessions={sessions} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  );
}

function VariantEditor({ variant, card, sessions, onChanged }: {
  variant: Variant; card: Card; sessions: CallSession[]; onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(variant.body);
  const [note, setNote] = useState(variant.coaching_note ?? '');
  const [label, setLabel] = useState(variant.label);
  const [busy, setBusy] = useState(false);
  const uses = usageCount(variant.id, card.id, sessions);

  const save = async () => {
    if (!supabase) return;
    setBusy(true);
    await supabase.from('card_variants').update({ body, coaching_note: note || null, label }).eq('id', variant.id);
    setBusy(false); setEditing(false); onChanged();
  };
  const retire = async () => {
    if (!supabase) return;
    if (!window.confirm(`Retire ${variant.label}? It stops being served on new calls (history is kept).`)) return;
    setBusy(true);
    await supabase.from('card_variants').update({ status: 'retired' }).eq('id', variant.id);
    setBusy(false); onChanged();
  };
  const restore = async () => {
    if (!supabase) return;
    setBusy(true);
    await supabase.from('card_variants').update({ status: 'active' }).eq('id', variant.id);
    setBusy(false); onChanged();
  };
  const makeControl = async () => {
    if (!supabase) return;
    setBusy(true);
    await supabase.from('card_variants').update({ is_control: false }).eq('card_id', card.id);
    await supabase.from('card_variants').update({ is_control: true }).eq('id', variant.id);
    setBusy(false); onChanged();
  };

  return (
    <div className={`border rounded-[8px] p-3.5 ${variant.status === 'retired' ? 'border-gray-100 bg-gray-50 opacity-60' : variant.is_control ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {editing ? (
            <input value={label} onChange={e => setLabel(e.target.value)} className="text-[12px] border border-gray-200 rounded px-2 py-0.5 w-40" />
          ) : (
            <span className="text-[12px] font-semibold text-gray-800">{variant.label}</span>
          )}
          {variant.is_control && <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 rounded px-1.5 py-0.5">CONTROL</span>}
          {variant.status === 'retired' && <span className="text-[10px] font-bold text-gray-500 bg-gray-200 rounded px-1.5 py-0.5">RETIRED</span>}
          <span className="text-[11px] text-gray-400">{uses} calls</span>
        </div>
        <div className="flex items-center gap-1.5">
          {variant.status === 'active' && !variant.is_control && (
            <button onClick={makeControl} disabled={busy} className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 px-1.5">Make control</button>
          )}
          {editing ? (
            <button onClick={save} disabled={busy} className="flex items-center gap-1 text-[11px] font-semibold text-white bg-indigo-600 rounded px-2 py-1"><Save className="w-3 h-3" /> Save</button>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 px-1.5"><Pencil className="w-3 h-3" /> Edit</button>
          )}
          {variant.status === 'active'
            ? <button onClick={retire} disabled={busy} className="text-[11px] text-gray-400 hover:text-red-600 px-1.5">Retire</button>
            : <button onClick={restore} disabled={busy} className="text-[11px] text-gray-400 hover:text-emerald-600 px-1.5">Restore</button>}
        </div>
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={10}
            className="w-full border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] font-mono leading-relaxed" />
          <div>
            <label className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">Caller thinking (coaching note)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              className="w-full border border-amber-200 bg-amber-50/50 rounded-[6px] px-3 py-2 text-[13px] mt-1" />
          </div>
          <p className="text-[11px] text-gray-400">Formatting: {'{{merge_fields}}'} · [GREEN]/[BLUE]/[RED] branch labels · (pause) stage directions · IF …: bold branches</p>
        </div>
      ) : (
        <>
          <ScriptBody body={variant.body} merge={{}} />
          {variant.coaching_note && <CoachingNote note={variant.coaching_note} />}
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// PERFORMANCE (A/B results + promote winner)
// ══════════════════════════════════════

const MIN_CONNECTS_PER_VARIANT = 50; // sample-size gate before declaring a winner

function Performance({ playbooks, cards, variants, sessions, onChanged }: {
  playbooks: Playbook[]; cards: Card[]; variants: Variant[]; sessions: CallSession[]; onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  // Funnel totals
  const dials = sessions.length;
  const connects = sessions.filter(s => s.connected).length;
  const convos = sessions.filter(s => s.conversation_30s).length;
  const meetings = sessions.filter(s => s.meeting_booked).length;

  // Cards under test, or with >1 active variant, or any card with usage across 2+ variants
  const testCards = cards.filter(c => {
    const act = variants.filter(v => v.card_id === c.id && v.status === 'active');
    return c.test_mode || act.length > 1;
  });

  // Objection frequency
  const objFreq = useMemo(() => {
    const freq: Record<string, number> = {};
    sessions.forEach(s => (s.objections_hit ?? []).forEach(id => { freq[id] = (freq[id] ?? 0) + 1; }));
    return Object.entries(freq)
      .map(([id, n]) => ({ card: cards.find(c => c.id === id), n }))
      .filter(x => x.card)
      .sort((a, b) => b.n - a.n)
      .slice(0, 8);
  }, [sessions, cards]);

  const promote = async (winner: Variant, card: Card) => {
    if (!supabase) return;
    const losers = variants.filter(v => v.card_id === card.id && v.status === 'active' && v.id !== winner.id);
    if (!window.confirm(
      `Promote "${winner.label}" as the winner on "${card.title}"?\n\nThis makes it the control, retires ${losers.length} other variant(s), and stops the rotation — every rep gets the winning script.`
    )) return;
    setBusy(true);
    await supabase.from('card_variants').update({ is_control: false }).eq('card_id', card.id);
    await supabase.from('card_variants').update({ is_control: true }).eq('id', winner.id);
    for (const l of losers) await supabase.from('card_variants').update({ status: 'retired' }).eq('id', l.id);
    await supabase.from('playbook_cards').update({ test_mode: false }).eq('id', card.id);
    setBusy(false); onChanged();
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Funnel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Dials', v: dials, sub: '12–20 dials per booked meeting is normal' },
          { label: 'Connect rate', v: fmtPct(connects, dials), sub: 'benchmark ~16.6% · below 10% = list problem', warn: dials >= 30 && connects / Math.max(dials, 1) < 0.10 },
          { label: 'Conversations >30s', v: fmtPct(convos, connects), sub: '30–50% of connects is healthy' },
          { label: 'Convo → meeting', v: fmtPct(meetings, convos), sub: '4–5% solid · 15% elite · <2% = fix script or list', warn: convos >= 30 && meetings / Math.max(convos, 1) < 0.02 },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-[8px] border px-4 py-3 ${k.warn ? 'border-red-300' : 'border-gray-200'}`}>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold flex items-center gap-1">
              {k.label}{k.warn && <AlertTriangle className="w-3 h-3 text-red-500" />}
            </p>
            <p className="text-xl font-bold text-gray-900">{k.v}</p>
            <p className="text-[11px] text-gray-500">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Experiments */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-2">Script experiments</p>
        {testCards.length === 0 ? (
          <div className="bg-white rounded-[8px] border border-gray-200 p-6 text-center text-[13px] text-gray-400">
            No cards have multiple variants yet — add a challenger variant in the Playbooks tab to start a test.
          </div>
        ) : (
          <div className="space-y-3">
            {testCards.map(card => {
              const pb = playbooks.find(p => p.id === card.playbook_id);
              const act = variants.filter(v => v.card_id === card.id && v.status === 'active');
              const rows = act.map(v => {
                const vs = sessions.filter(s => s.variant_map?.[card.id] === v.id);
                const c = vs.filter(s => s.connected).length;
                const cv = vs.filter(s => s.conversation_30s).length;
                const m = vs.filter(s => s.meeting_booked).length;
                return { v, calls: vs.length, connects: c, convos: cv, meetings: m, rate: cv > 0 ? m / cv : 0 };
              }).sort((a, b) => b.rate - a.rate);
              const leader = rows[0];
              const ready = rows.length > 1 && rows.every(r => r.connects >= MIN_CONNECTS_PER_VARIANT);
              return (
                <div key={card.id} className="bg-white rounded-[8px] border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">
                        {card.title}
                        <span className="text-gray-400 font-normal"> — {pb ? pb.name : `shared ${card.product} objection`}</span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {card.test_mode
                          ? `Rotating ${act.length} variants evenly across calls`
                          : `${act.length} active variants (rotation off — control is served)`}
                      </p>
                    </div>
                    {ready ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                        <Trophy className="w-3.5 h-3.5" /> Sample size reached — pick a winner
                      </span>
                    ) : rows.length > 1 && (
                      <span className="text-[11px] text-gray-400">
                        Keep testing — {MIN_CONNECTS_PER_VARIANT}+ connects per variant before calling it
                      </span>
                    )}
                  </div>
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="text-[10px] text-gray-400 uppercase tracking-wide">
                        <th className="text-left py-1.5 font-semibold">Variant</th>
                        <th className="text-right py-1.5 font-semibold">Calls</th>
                        <th className="text-right py-1.5 font-semibold">Connects</th>
                        <th className="text-right py-1.5 font-semibold">Convos</th>
                        <th className="text-right py-1.5 font-semibold">Meetings</th>
                        <th className="text-right py-1.5 font-semibold">Convo→Mtg</th>
                        <th className="text-right py-1.5 font-semibold" />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(r => (
                        <tr key={r.v.id} className="border-t border-gray-100">
                          <td className="py-2">
                            <span className="font-medium text-gray-800">{r.v.label}</span>
                            {r.v.is_control && <span className="ml-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-100 rounded px-1 py-0.5">CONTROL</span>}
                            {rows.length > 1 && r === leader && r.meetings > 0 && <span className="ml-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded px-1 py-0.5">LEADING</span>}
                          </td>
                          <td className="text-right text-gray-600">{r.calls}</td>
                          <td className="text-right text-gray-600">
                            {r.connects}
                            <span className="text-gray-300"> / {MIN_CONNECTS_PER_VARIANT}</span>
                          </td>
                          <td className="text-right text-gray-600">{r.convos}</td>
                          <td className="text-right font-semibold text-gray-900">{r.meetings}</td>
                          <td className="text-right font-semibold text-gray-900">{fmtPct(r.meetings, r.convos)}</td>
                          <td className="text-right">
                            {rows.length > 1 && (
                              <button onClick={() => promote(r.v, card)} disabled={busy}
                                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 disabled:opacity-40">
                                Promote winner
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Objection frequency */}
      {objFreq.length > 0 && (
        <div className="bg-white rounded-[8px] border border-gray-200 p-4">
          <p className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-2">Most-hit objections</p>
          <div className="space-y-1.5">
            {objFreq.map(({ card, n }) => (
              <div key={card!.id} className="flex items-center gap-3">
                <span className="text-[12px] text-gray-700 w-56 truncate">{card!.title}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-rose-400 h-2 rounded-full" style={{ width: `${(n / objFreq[0].n) * 100}%` }} />
                </div>
                <span className="text-[12px] text-gray-500 w-8 text-right">{n}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Rising objection = tune that card first. Falling objection after a script change = the change is working.</p>
        </div>
      )}

      {/* Methodology */}
      <div className="bg-gray-50 border border-gray-200 rounded-[8px] px-4 py-3 text-[12px] text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Testing rules baked into this page</p>
        <p>• Change ONE card per test (opener only, or close only) — never two whole scripts at once.</p>
        <p>• Rotation splits calls evenly; wait for {MIN_CONNECTS_PER_VARIANT}+ connects per variant and 2–3 weeks before promoting.</p>
        <p>• Within 1–2 points = tie; only promote clear gaps (e.g. 6.5% vs 3%). Then the winner becomes control and the next single-variable test starts.</p>
      </div>
    </div>
  );
}
