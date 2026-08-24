import React, { useEffect, useMemo, useState } from 'react';
import { Bell, FileText, UserPlus, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLeads } from './crmStore';
import { useSession } from './SessionContext';
import { useLang } from './i18n';

/**
 * Live notifications for the header bell: new pipeline leads (CRM store) and
 * recent statement analyses (statement_analyses). Unread state is a last-seen
 * timestamp per browser — opening the panel marks everything seen.
 */

const SEEN_KEY = 'delt-crm-notif-seen';
const WINDOW_DAYS = 14;
const MAX_ITEMS = 8;

interface Notif {
  id: string;
  kind: 'lead' | 'analysis';
  title: string;
  detail: string;
  at: string;
  path: string;
}

const fmtWhole = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function getSeen(): number {
  try {
    return Number(localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
}

function agoLabel(at: string, lang: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(at).getTime()) / 60000));
  if (lang === 'es') {
    if (mins < 1) return 'ahora mismo';
    if (mins < 60) return `hace ${mins} min`;
    if (mins < 1440) return `hace ${Math.floor(mins / 60)} h`;
    return `hace ${Math.floor(mins / 1440)} d`;
  }
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

export function NotificationsBell({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { t, lang } = useLang();
  const { can } = useSession();
  const leads = useLeads();
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState<number>(getSeen);
  /** Unread ids captured when the panel opens, so highlights persist while it's open. */
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [analyses, setAnalyses] = useState<Notif[]>([]);

  useEffect(() => {
    if (!supabase || !can('analysis.view')) return;
    let active = true;
    supabase
      .from('statement_analyses')
      .select('id, merchant_name, annual_savings, created_at')
      .order('created_at', { ascending: false })
      .limit(15)
      .then(({ data, error }) => {
        if (!active || error || !data) return;
        setAnalyses(data.map((r: any): Notif => ({
          id: `analysis-${r.id}`,
          kind: 'analysis',
          title: `${t('Statement analyzed')} — ${r.merchant_name}`,
          detail: `${fmtWhole(Number(r.annual_savings ?? 0))}${t('/yr')} ${t('projected savings')}`,
          at: r.created_at,
          path: '/analysis',
        })));
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [can, lang]);

  const items = useMemo(() => {
    const cutoff = Date.now() - WINDOW_DAYS * 86400000;
    const leadItems: Notif[] = can('leads.view')
      ? leads
          .filter(l => l.createdAt)
          .map((l): Notif => ({
            id: `lead-${l.id}`,
            kind: 'lead',
            title: `${t('New lead')} — ${l.businessName}`,
            detail: l.source || t('Pipeline'),
            at: l.createdAt as string,
            path: '/leads',
          }))
      : [];
    return [...leadItems, ...analyses]
      .filter(n => new Date(n.at).getTime() >= cutoff)
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, MAX_ITEMS);
  }, [leads, analyses, can, t]);

  const unreadCount = useMemo(
    () => items.filter(n => new Date(n.at).getTime() > seenAt).length,
    [items, seenAt],
  );

  const openPanel = () => {
    if (!open) {
      setHighlightIds(new Set(items.filter(n => new Date(n.at).getTime() > seenAt).map(n => n.id)));
      const now = Date.now();
      setSeenAt(now);
      try {
        localStorage.setItem(SEEN_KEY, String(now));
      } catch { /* private mode */ }
    }
    setOpen(v => !v);
  };

  const go = (path: string) => {
    setOpen(false);
    onNavigate(path);
  };

  return (
    <div className="relative">
      <button
        onClick={openPanel}
        className="relative p-2 hover:bg-white/[0.06] rounded-full transition-colors"
        aria-label={t('Notifications')}
      >
        <Bell className="w-[18px] h-[18px] text-(--dp-text-muted)" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-(--dp-accent) text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-(--dp-bg-raised) rounded-[12px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] border border-(--dp-border) z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-[13px] font-semibold text-(--dp-text)">{t('Notifications')}</p>
              {highlightIds.size > 0 && (
                <span className="text-[10px] font-bold text-(--dp-accent-text) bg-(--dp-accent-soft) px-2 py-0.5 rounded-full">
                  {highlightIds.size} {t('new')}
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-6 h-6 text-(--dp-text-faint) mx-auto mb-2" />
                <p className="text-[13px] text-(--dp-text-muted)">{t("You're all caught up.")}</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto py-1">
                {items.map(n => (
                  <button
                    key={n.id}
                    onClick={() => go(n.path)}
                    className="w-full px-4 py-2.5 text-left hover:bg-white/[0.05] transition-colors flex items-start gap-3"
                  >
                    <span className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      n.kind === 'lead' ? 'bg-(--dp-accent-soft)' : 'bg-white/[0.06]'
                    }`}>
                      {n.kind === 'lead'
                        ? <UserPlus className="w-3.5 h-3.5 text-(--dp-accent-text)" />
                        : <FileText className="w-3.5 h-3.5 text-(--dp-text-muted)" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-medium text-(--dp-text) truncate leading-snug">
                        {n.title}
                        {highlightIds.has(n.id) && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-(--dp-accent) ml-1.5 align-middle" />
                        )}
                      </span>
                      <span className="block text-[11px] text-(--dp-text-muted) truncate mt-0.5">
                        {n.detail} · {agoLabel(n.at, lang)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}
