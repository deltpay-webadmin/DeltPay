/**
 * Lead workspace — ONE page that carries a prospect end to end:
 *
 *   Call → Qualify → Application → Sign → Underwriting → Fund
 *
 * Header: live milestone bar + the single recommended next action.
 * Left column: the guided flow — embedded Live Call (scripts, dispositions,
 * lead write-back) and, once a deal is started, the full Deal Room stages.
 * Right column: the lead's details, call history, meetings, activity,
 * notes and tasks.
 *
 * Route: /dashboard/leads/:leadId (perm leads.view). Deal Room links for
 * lead-linked submissions redirect here — this is the deal's one home.
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Building2, Calendar, CalendarCheck, CheckSquare, Clock,
  Loader2, Mail, MessageSquare, Phone, PhoneCall, Star, User, X,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { leadActions, useCrmSync, useLeads, type Lead } from '../crmStore';
import { dealSubmissionActions } from '../dealSubmissionsStore';
import { useAppNavigate } from '../NavigationContext';
import { LeadProgressBar } from '../LeadProgressBar';
import { NextActionButton, useLeadMilestones, timeAgo } from '../leadJourney';
import { DealRoomStages } from '../DealRoomStages';
import { LiveCall } from '../callPlaybooks/LiveCall';
import { useCallPlaybooksData } from '../callPlaybooks/useCallPlaybooksData';
import { DISPOSITIONS } from '../callPlaybooks/core';

const card = 'bg-white rounded-[8px] border border-gray-200';

export function LeadWorkspacePage() {
  const { leadId = '' } = useParams<{ leadId: string }>();
  const { navigate } = useAppNavigate();
  const leads = useLeads();
  const { isLoading } = useCrmSync();
  const lead = leads.find(l => l.id === leadId) ?? null;

  if (!lead && isLoading) {
    return <div className="p-10 text-center"><Loader2 className="w-6 h-6 mx-auto animate-spin text-gray-300" /></div>;
  }
  if (!lead) {
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        Lead not found.{' '}
        <button className="text-brand hover:underline" onClick={() => navigate('/leads')}>Back to the pipeline</button>
      </div>
    );
  }
  return <LeadWorkspace lead={lead} />;
}

function statusChipCls(status: Lead['status']): string {
  switch (status) {
    case 'New': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Won': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Not Qualified': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Lost': return 'bg-gray-100 text-gray-600 border-gray-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function LeadWorkspace({ lead }: { lead: Lead }) {
  const routerNavigate = useNavigate();
  const { entities } = useLeadMilestones(lead);
  const { submission, sessions, meetings } = entities;
  const [calling, setCalling] = useState(false);
  const [startingDeal, setStartingDeal] = useState(false);
  const [rightTab, setRightTab] = useState<'activity' | 'notes' | 'tasks'>('activity');
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState('');

  const isDead = lead.status === 'Not Qualified' || lead.status === 'Lost';
  const isWon = lead.status === 'Won';
  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled' && new Date(m.startsAt).getTime() > Date.now());

  const startDeal = async () => {
    setStartingDeal(true);
    try {
      await dealSubmissionActions.createFromLead({
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
      // The submissions store refreshes on create — the stages render in place.
    } finally {
      setStartingDeal(false);
    }
  };

  const dispoLabel = (code: string | null) =>
    DISPOSITIONS.find(d => d.code === code)?.label ?? code ?? 'Logged';
  const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <button className="text-sm text-brand hover:underline inline-flex items-center gap-1" onClick={() => routerNavigate(-1)}>
            <ArrowLeft className="w-3.5 h-3.5" /> Pipeline
          </button>
          <div className="flex items-center gap-2.5 mt-1 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{lead.businessName}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusChipCls(lead.status)}`}>{lead.status}</span>
            <span className="text-xs text-gray-400">{lead.industry}</span>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
            {lead.contactName && <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5" />{lead.contactName}</span>}
            {lead.contactPhone && <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{lead.contactPhone}</span>}
            {lead.contactEmail && <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{lead.contactEmail}</span>}
            <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Added {lead.createdAt ? timeAgo(lead.createdAt) : '—'}</span>
          </div>
        </div>
        <NextActionButton lead={lead} size="md" />
      </div>

      {/* ── Live milestones ── */}
      <LeadProgressBar lead={lead} light />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-4 lg:items-start space-y-4 lg:space-y-0">
        {/* ══ Left column — the guided flow ══ */}
        <div className="space-y-4 min-w-0">
          {/* ── Call & qualify ── */}
          {calling ? (
            <div className={`${card} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5" /> Live call — {lead.businessName}
                </p>
                <button onClick={() => setCalling(false)} className="p-1 hover:bg-gray-100 rounded" title="Close the call panel">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <EmbeddedLiveCall leadId={lead.id} onLogged={() => setCalling(false)} />
            </div>
          ) : !isWon && (
            <div className={`${card} p-4`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5" /> Call & qualify
                  </p>
                  <p className="text-[12px] text-gray-500 mt-1">
                    {sessions.length
                      ? `${sessions.length} call${sessions.length === 1 ? '' : 's'} logged — last ${timeAgo(sessions[0]?.createdAt) || 'recently'} (${dispoLabel(sessions[0]?.disposition)})`
                      : 'No calls yet — the guided script opens right here with this lead loaded.'}
                  </p>
                </div>
                <button
                  onClick={() => setCalling(true)}
                  disabled={isDead}
                  title={isDead ? 'Reopen the lead before calling' : undefined}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-[6px] hover:bg-indigo-700 disabled:opacity-40"
                >
                  <Phone className="w-4 h-4" /> Start call
                </button>
              </div>
              {upcomingMeetings.length > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3 space-y-1.5">
                  {upcomingMeetings.map(m => (
                    <p key={m.id} className="text-[12px] text-gray-600 flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Meeting {new Date(m.startsAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      {m.mode === 'online' ? ' · online' : m.location ? ` · ${m.location}` : ' · in person'}
                      {m.repName ? ` · ${m.repName}` : ''}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Deal ── */}
          {submission ? (
            <DealRoomStages submissionId={submission.id} showChannelPicker />
          ) : (
            <div className={`${card} p-5 text-center`}>
              <p className="text-sm font-semibold text-gray-900">No deal started yet</p>
              <p className="text-[12px] text-gray-500 mt-1 max-w-md mx-auto">
                Starting the deal opens the full flow on this page — bank connection, the funding
                application, underwriting, the MCA signature and boarding, in order.
              </p>
              <button
                onClick={() => void startDeal()}
                disabled={startingDeal || isDead}
                title={isDead ? 'Reopen the lead before starting a deal' : undefined}
                className="mt-3 inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-[6px] hover:bg-brand/90 disabled:opacity-40"
              >
                {startingDeal ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Start deal
              </button>
            </div>
          )}
        </div>

        {/* ══ Right column — details & history ══ */}
        <div className="space-y-4">
          {/* Stats */}
          <div className={`${card} p-4`}>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-[10px] text-gray-400 uppercase font-semibold">Monthly sales</p><p className="text-sm font-bold text-gray-900 mt-0.5">{lead.monthlySales}</p></div>
              <div><p className="text-[10px] text-gray-400 uppercase font-semibold">Requested</p><p className="text-sm font-bold text-gray-900 mt-0.5">{lead.amountRequested}</p></div>
              <div><p className="text-[10px] text-gray-400 uppercase font-semibold">Score</p><p className="text-sm font-bold text-gray-900 mt-0.5 inline-flex items-center gap-1">{lead.score}<Star className="w-3 h-3 text-amber-500 fill-amber-500" /></p></div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 text-[12px] text-gray-500 space-y-1">
              <p className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{lead.type}{(lead.products ?? []).length ? ` · ${(lead.products ?? []).join(' · ')}` : ''}</p>
              <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{lead.assignedAgent || 'Unassigned'} · {lead.source}</p>
            </div>
            {!isWon && !isDead && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() => { leadActions.markNotQualified(lead.id); toast.success('Marked not qualified'); }}
                  className="flex-1 px-2 py-1.5 text-[11px] font-medium text-orange-700 border border-orange-200 rounded-[6px] hover:bg-orange-50"
                >
                  Not Qualified
                </button>
                <button
                  onClick={() => { leadActions.markLost(lead.id); toast.success('Marked lost'); }}
                  className="flex-1 px-2 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-[6px] hover:bg-gray-50"
                >
                  Mark Lost
                </button>
              </div>
            )}
          </div>

          {/* Call history */}
          {sessions.length > 0 && (
            <div className={`${card} p-4`}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Call history</p>
              <div className="space-y-2">
                {sessions.slice(0, 6).map(s => (
                  <div key={s.id} className="flex items-start gap-2 text-[12px]">
                    <Phone className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${s.connected ? 'text-emerald-500' : 'text-gray-300'}`} />
                    <div className="min-w-0">
                      <p className="text-gray-800 font-medium">{dispoLabel(s.disposition)}</p>
                      <p className="text-gray-400">
                        {timeAgo(s.createdAt) || 'recently'} · {fmtDur(s.durationSeconds)}{s.repName ? ` · ${s.repName}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity / notes / tasks */}
          <div className={card}>
            <div className="flex border-b border-gray-200">
              {(['activity', 'notes', 'tasks'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  className={`flex-1 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors inline-flex items-center justify-center gap-1.5 ${
                    rightTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab === 'activity' && <Clock className="w-3.5 h-3.5" />}
                  {tab === 'notes' && <MessageSquare className="w-3.5 h-3.5" />}
                  {tab === 'tasks' && <CheckSquare className="w-3.5 h-3.5" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="p-4 max-h-[420px] overflow-y-auto">
              {rightTab === 'activity' && (
                <div className="space-y-3">
                  {lead.timeline.length === 0 && <p className="text-[12px] text-gray-400 text-center py-3">No activity yet</p>}
                  {lead.timeline.map((item, i) => (
                    <div key={i} className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                        <Clock className="w-3 h-3 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-gray-900">{item.title}</p>
                        {item.description && <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>}
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.user} · {item.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {rightTab === 'notes' && (
                <div className="space-y-3">
                  {lead.notes && <p className="text-[12px] text-gray-800 bg-amber-50 border border-amber-200 rounded-[6px] p-2.5">{lead.notes}</p>}
                  {(lead.extraNotes || []).map(n => (
                    <div key={n.id} className="text-[12px] text-gray-800 bg-white border border-gray-200 rounded-[6px] p-2.5">
                      <p className="whitespace-pre-wrap">{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.author} · {n.timestamp}</p>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newNote.trim()) {
                          leadActions.addNote(lead.id, newNote.trim());
                          setNewNote('');
                        }
                      }}
                      placeholder="Add a note…"
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-[6px] text-[12px]"
                    />
                    <button
                      onClick={() => { if (newNote.trim()) { leadActions.addNote(lead.id, newNote.trim()); setNewNote(''); } }}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-semibold rounded-[6px] hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
              {rightTab === 'tasks' && (
                <div className="space-y-2">
                  {(lead.tasks || []).map(t => (
                    <label key={t.id} className="flex items-start gap-2 text-[12px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => leadActions.toggleTask(lead.id, t.id)}
                        className="mt-0.5 w-3.5 h-3.5 accent-indigo-600 rounded"
                      />
                      <span className={t.done ? 'text-gray-400 line-through' : 'text-gray-800'}>{t.title}</span>
                    </label>
                  ))}
                  {(lead.tasks || []).length === 0 && <p className="text-[12px] text-gray-400 text-center py-3">No tasks yet</p>}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      value={newTask}
                      onChange={e => setNewTask(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newTask.trim()) {
                          leadActions.addTask(lead.id, newTask.trim());
                          setNewTask('');
                        }
                      }}
                      placeholder="New task…"
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-[6px] text-[12px]"
                    />
                    <button
                      onClick={() => { if (newTask.trim()) { leadActions.addTask(lead.id, newTask.trim()); setNewTask(''); } }}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-semibold rounded-[6px] hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The Live Call experience with its own data load, preloaded on this lead
 * and dialing immediately. */
function EmbeddedLiveCall({ leadId, onLogged }: { leadId: string; onLogged: () => void }) {
  const { playbooks, cards, variants, sessions, leads, loading, reload } = useCallPlaybooksData();
  if (loading) {
    return <div className="py-8 text-center"><Loader2 className="w-5 h-5 mx-auto animate-spin text-gray-300" /></div>;
  }
  return (
    <LiveCall
      playbooks={playbooks}
      cards={cards}
      variants={variants}
      sessions={sessions}
      leads={leads}
      onLogged={() => { void reload(); onLogged(); }}
      initialLeadId={leadId}
      autostart
    />
  );
}
