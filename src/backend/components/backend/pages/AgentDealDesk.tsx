import React, { useMemo, useState } from 'react';
import { MessageSquare, Plus, Send, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useSession } from '../SessionContext';
import { useDealDesk, dealDeskActions, type DeskThread, type ThreadStatus } from '../dealDeskStore';

const STATUS_BADGE: Record<ThreadStatus, { cls: string; icon: React.ElementType }> = {
  Open: { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  Answered: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  Closed: { cls: 'bg-gray-50 text-gray-500 border-gray-200', icon: XCircle },
};

const inputCls =
  'w-full px-3 py-2 bg-white border border-gray-300 rounded-[6px] text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand';

export function AgentDealDesk() {
  const { role, agentId, agentName, displayName } = useSession();
  const { threads, messages, isLoading, isOnline } = useDealDesk();
  const isOps = role !== 'agent';

  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [merchant, setMerchant] = useState('');
  const [body, setBody] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const author = agentName || displayName;

  const threadMessages = useMemo(
    () => (openThreadId ? messages.filter(m => m.threadId === openThreadId) : []),
    [messages, openThreadId],
  );

  const createThread = async () => {
    if (!subject.trim() || !body.trim() || busy) return;
    setBusy(true);
    const ok = await dealDeskActions.createThread({
      agentId,
      agentName: author,
      subject: subject.trim(),
      merchantName: merchant.trim(),
      body: body.trim(),
    });
    setBusy(false);
    if (ok) {
      setSubject(''); setMerchant(''); setBody(''); setShowNew(false);
    }
  };

  const sendReply = async () => {
    if (!openThreadId || !reply.trim() || busy) return;
    setBusy(true);
    await dealDeskActions.reply(openThreadId, author, isOps, reply.trim());
    setBusy(false);
    setReply('');
  };

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Merchant on fire? Underwriting question? Raise it here — ops answers same business day.
        </p>
        <button
          onClick={() => setShowNew(v => !v)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Question
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-[8px] border border-gray-200 p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject *" className={inputCls} />
            <input value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="Merchant (optional)" className={inputCls} />
          </div>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} placeholder="What do you need? *" className={inputCls} />
          <div className="flex justify-end">
            <button
              onClick={createThread}
              disabled={!subject.trim() || !body.trim() || busy}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
              {busy ? 'Sending…' : 'Open Thread'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Threads</h2>
        </div>
        {threads.length === 0 ? (
          <div className="py-14 text-center">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {isLoading ? 'Loading…' : isOnline ? 'No threads yet.' : 'Offline mode — the deal desk requires the Supabase connection.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {threads.map((t: DeskThread) => {
              const Badge = STATUS_BADGE[t.status];
              const open = openThreadId === t.id;
              return (
                <div key={t.id}>
                  <button
                    onClick={() => setOpenThreadId(open ? null : t.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t.merchantName ? `${t.merchantName} · ` : ''}{isOps ? `${t.agentName} · ` : ''}{(t.updatedAt || t.createdAt || '').slice(0, 10)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-md shrink-0 ${Badge.cls}`}>
                      <Badge.icon className="w-3 h-3" />
                      {t.status}
                    </span>
                  </button>
                  {open && (
                    <div className="px-5 pb-5 space-y-3 bg-gray-50/50">
                      {threadMessages.map(m => (
                        <div
                          key={m.id}
                          className={`max-w-[85%] rounded-[10px] px-4 py-2.5 text-sm ${
                            m.fromOps
                              ? 'bg-indigo-50 border border-indigo-100 text-gray-800'
                              : 'bg-white border border-gray-200 text-gray-800 ml-auto'
                          }`}
                        >
                          <p className="text-[11px] font-semibold text-gray-500 mb-0.5">
                            {m.fromOps ? `${m.authorName || 'Delt Ops'} (Delt)` : m.authorName}
                            <span className="font-normal text-gray-400"> · {(m.createdAt || '').slice(0, 16).replace('T', ' ')}</span>
                          </p>
                          <p className="whitespace-pre-wrap">{m.body}</p>
                        </div>
                      ))}
                      {t.status !== 'Closed' && (
                        <div className="flex items-end gap-2 pt-1">
                          <textarea
                            value={reply}
                            onChange={e => setReply(e.target.value)}
                            rows={2}
                            placeholder={isOps ? 'Reply as Delt ops…' : 'Reply…'}
                            className={inputCls}
                          />
                          <button
                            onClick={sendReply}
                            disabled={!reply.trim() || busy}
                            className="p-2.5 rounded-[6px] text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-colors shrink-0"
                            title="Send"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {isOps && (
                        <div className="flex gap-2 pt-1">
                          {t.status !== 'Answered' && (
                            <button onClick={() => dealDeskActions.setStatus(t.id, 'Answered')} className="text-xs px-3 py-1.5 rounded-md border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100">Mark Answered</button>
                          )}
                          {t.status !== 'Closed' ? (
                            <button onClick={() => dealDeskActions.setStatus(t.id, 'Closed')} className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 bg-white hover:bg-gray-50">Close</button>
                          ) : (
                            <button onClick={() => dealDeskActions.setStatus(t.id, 'Open')} className="text-xs px-3 py-1.5 rounded-md border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100">Reopen</button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
