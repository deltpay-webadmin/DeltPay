import React, { useMemo, useState } from 'react';
import {
  CheckCircle, Circle, Plus, Search, X, CheckSquare, Clock,
} from 'lucide-react';
import { useLeads, leadActions, type Lead, type LeadTask } from '../crmStore';
import { useAppNavigate } from '../NavigationContext';

/**
 * Follow-up tasks across the pipeline.
 *
 * Tasks live on the lead (`pipeline_leads.tasks`, see LeadTask) — there is no
 * standalone tasks table. That bounds what this page can honestly show: a
 * title, a free-text due string, and done/not-done. The previous version
 * invented fifteen compliance tasks with priorities, categories, tags, SLA
 * dates and overdue math, none of which have a source, and its Create button
 * discarded whatever was typed into it.
 */

interface Row {
  task: LeadTask;
  lead: Lead;
}

export function BackendTasks() {
  const leads = useLeads();
  const { navigate } = useAppNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Done'>('Open');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [newOpen, setNewOpen] = useState(false);

  const rows = useMemo<Row[]>(
    () => leads.flatMap(lead => (lead.tasks ?? []).map(task => ({ task, lead }))),
    [leads],
  );

  const assignees = useMemo(
    () => ['All', ...Array.from(new Set(rows.map(r => r.lead.assignedAgent))).sort()],
    [rows],
  );

  const filtered = useMemo(() => rows.filter(r => {
    if (statusFilter === 'Open' && r.task.done) return false;
    if (statusFilter === 'Done' && !r.task.done) return false;
    if (assigneeFilter !== 'All' && r.lead.assignedAgent !== assigneeFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!r.task.title.toLowerCase().includes(q) && !r.lead.businessName.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [rows, statusFilter, assigneeFilter, search]);

  const openCount = rows.filter(r => !r.task.done).length;

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-500">
          Follow-ups recorded against pipeline leads. {openCount} open of {rows.length}.
        </p>
        <button
          onClick={() => setNewOpen(true)}
          className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col xl:flex-row xl:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks or leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              {(['Open', 'Done', 'All'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-[6px] border transition-colors ${
                    statusFilter === s
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <select
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-[6px] bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {assignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">
              {rows.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {rows.length === 0
                ? 'Follow-ups added to a lead show up here. Add one from a lead in Sales Leads, or with New Task above.'
                : 'Try a different status or assignee.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium w-10"></th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Task</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Lead</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Assignee</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(({ task, lead }) => (
                  <tr key={`${lead.id}:${task.id}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => leadActions.toggleTask(lead.id, task.id)}
                        title={task.done ? 'Mark as not done' : 'Mark as done'}
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        {task.done
                          ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                          : <Circle className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className={`px-4 py-3 ${task.done ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'}`}>
                      {task.title}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate('/leads')}
                        className="text-brand hover:underline underline-offset-2"
                      >
                        {lead.businessName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{lead.assignedAgent}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {task.due}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {newOpen && <NewTaskModal leads={leads} onClose={() => setNewOpen(false)} />}
    </div>
  );
}

/** Adds a real task to a real lead via leadActions.addTask. */
function NewTaskModal({ leads, onClose }: { leads: Lead[]; onClose: () => void }) {
  const [leadId, setLeadId] = useState(leads[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  const inputCls =
    'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !title.trim()) return;
    leadActions.addTask(leadId, title.trim(), due.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={submit} className="relative bg-white rounded-[8px] shadow-2xl w-full max-w-md mx-4">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">New Task</h2>
            <p className="text-sm text-gray-500 mt-0.5">Tasks are attached to a lead.</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {leads.length === 0 ? (
            <p className="text-sm text-gray-500">There are no leads to attach a task to yet.</p>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Lead</label>
                <select value={leadId} onChange={e => setLeadId(e.target.value)} className={inputCls}>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.businessName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Task</label>
                <input
                  autoFocus
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Follow up on pricing"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Due <span className="text-gray-400">(optional)</span></label>
                <input
                  value={due}
                  onChange={e => setDue(e.target.value)}
                  placeholder="Tomorrow at 2:00 PM"
                  className={inputCls}
                />
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-[6px] transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!leadId || !title.trim()}
            className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
}
