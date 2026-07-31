import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Eye,
  Phone,
  DollarSign,
  Users,
  Target,
  ArrowUp,
  Gauge,
} from 'lucide-react';
import { useCrm } from '../crmStore';
import type { Deal, Merchant, UWApplication } from '../crmStore';
import { useAppNavigate } from '../NavigationContext';
import { askLens } from '../lensAI';
import { AIError } from '../aiErrors';
import { useStaffRole } from '../staffStore';
import { AiManagementTab } from '../AiManagementTab';

type Tab = 'dashboard' | 'ask' | 'manage';

// ── Health Score Ring ──
function HealthRing({ score, size = 100 }: { score: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#34C77B' : score >= 50 ? '#F0B429' : '#F2565B';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 tabular-nums">{score}</span>
        <span className="text-[10px] text-gray-500 -mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ── Derived intelligence ──
// Everything on the dashboard is computed from the live CRM store. An empty
// pipeline renders an empty state, never canned numbers: fabricated
// analytics presented as insight would poison every decision made off them.

type Severity = 'critical' | 'warning' | 'info';

interface LensAlert {
  severity: Severity;
  title: string;
  desc: string;
  to?: string;
  actionLabel?: string;
}

const sevConfig = {
  critical: { bg: 'bg-red-50 border-red-200', iconBg: 'bg-red-100', icon: 'text-red-500', badge: 'bg-red-500 text-white' },
  warning: { bg: 'bg-amber-50 border-amber-200', iconBg: 'bg-amber-100', icon: 'text-amber-500', badge: 'bg-amber-500 text-white' },
  info: { bg: 'bg-indigo-50/60 border-indigo-200', iconBg: 'bg-indigo-100', icon: 'text-indigo-600', badge: 'bg-indigo-500 text-white' },
};

const fmtUsd = (n: number) =>
  n >= 1000 ? `$${Math.round(n / 1000).toLocaleString()}K` : `$${Math.round(n).toLocaleString()}`;

const dealOutstanding = (d: Deal) => Math.max(0, d.repaymentAmount - d.collected);

const nameList = (names: string[], max = 3) =>
  names.slice(0, max).join(', ') + (names.length > max ? ` and ${names.length - max} more` : '');

interface CrmSlice {
  deals: Deal[];
  merchants: Merchant[];
  underwriting: UWApplication[];
}

function deriveLensAlerts(crm: CrmSlice): LensAlert[] {
  const alerts: LensAlert[] = [];

  const defaults = crm.deals.filter(d => d.status === 'Default');
  if (defaults.length) {
    alerts.push({
      severity: 'critical',
      title: `${defaults.length} deal${defaults.length === 1 ? '' : 's'} in default`,
      desc: `${nameList(defaults.map(d => d.borrower))} — ${fmtUsd(defaults.reduce((s, d) => s + dealOutstanding(d), 0))} outstanding exposure.`,
      to: '/capital',
      actionLabel: 'View Capital',
    });
  }

  const delinquent = crm.deals.filter(d => d.status === 'Delinquent' || d.status === 'Workout');
  if (delinquent.length) {
    alerts.push({
      severity: 'warning',
      title: `${delinquent.length} deal${delinquent.length === 1 ? '' : 's'} delinquent or in workout`,
      desc: `${nameList(delinquent.map(d => d.borrower))} — ${fmtUsd(delinquent.reduce((s, d) => s + dealOutstanding(d), 0))} outstanding.`,
      to: '/capital',
      actionLabel: 'View Capital',
    });
  }

  const declining = crm.merchants.filter(m => m.healthScore > 0 && m.healthScore < 50);
  if (declining.length) {
    alerts.push({
      severity: 'warning',
      title: `${declining.length} merchant${declining.length === 1 ? '' : 's'} with declining health`,
      desc: `${nameList(declining.map(m => m.name))} — health scores below 50. Worth an agent touch-point before volume slips.`,
      to: '/retention',
      actionLabel: 'View Retention',
    });
  }

  const overSla = crm.underwriting.filter(
    u => u.stage !== 'Approved' && u.stage !== 'Declined' && u.daysInStage > u.slaThreshold,
  );
  if (overSla.length) {
    alerts.push({
      severity: 'warning',
      title: `${overSla.length} underwriting file${overSla.length === 1 ? '' : 's'} past SLA`,
      desc: `${nameList(overSla.map(u => u.businessName))} — sitting in stage longer than the SLA threshold.`,
      to: '/underwriting',
      actionLabel: 'View Underwriting',
    });
  }

  const renewals = crm.deals.filter(
    d => d.status === 'Current' && d.repaymentAmount > 0 && d.collected / d.repaymentAmount >= 0.5,
  );
  if (renewals.length) {
    alerts.push({
      severity: 'info',
      title: `${renewals.length} renewal opportunit${renewals.length === 1 ? 'y' : 'ies'} ready`,
      desc: `${nameList(renewals.map(d => d.borrower))} crossed the 50% repayment threshold. Combined renewal potential: ${fmtUsd(renewals.reduce((s, d) => s + d.loanAmount, 0))}.`,
      to: '/capital',
      actionLabel: 'View Deals',
    });
  }

  // Sector concentration only means something once there is a real book.
  const totalVol = crm.merchants.reduce((s, m) => s + (m.monthlyVolume || 0), 0);
  if (totalVol > 0 && crm.merchants.length >= 4) {
    const byIndustry = new Map<string, number>();
    crm.merchants.forEach(m => byIndustry.set(m.industry, (byIndustry.get(m.industry) ?? 0) + (m.monthlyVolume || 0)));
    const [topIndustry, topVol] = [...byIndustry.entries()].sort((a, b) => b[1] - a[1])[0];
    const share = topVol / totalVol;
    if (share >= 0.25) {
      alerts.push({
        severity: 'info',
        title: `Portfolio concentration — ${topIndustry} ${(share * 100).toFixed(0)}%`,
        desc: `${topIndustry} represents ${(share * 100).toFixed(0)}% of processing volume, above the 25% sector guideline. Consider diversifying new deal flow.`,
        to: '/merchants',
        actionLabel: 'View Merchants',
      });
    }
  }

  return alerts;
}

const suggestedPrompts = [
  { icon: Users, text: 'Which agents have the highest default rate over $50K?' },
  { icon: DollarSign, text: 'Projected cash position in 90 days?' },
  { icon: Phone, text: 'Merchants with declining volume not contacted 30 days.' },
  { icon: Target, text: 'What is our most profitable deal type this quarter?' },
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  table?: { headers: string[]; rows: string[][] };
  source?: string;
}

const sampleResponse: ChatMessage = {
  role: 'assistant',
  content:
    'Based on the current portfolio, **3 agents** have default rates exceeding the benchmark on deals over $50K. Marcus J. has the highest at 18.2%, driven primarily by two transportation-sector defaults in Q1 2026. Sarah K. follows at 12.5% with exposure concentrated in food & beverage. Devon R. sits at 8.3% — within acceptable range but trending upward.',
  table: {
    headers: ['Agent', 'Deals >$50K', 'Defaults', 'Default Rate', 'Total Exposure'],
    rows: [
      ['Marcus J.', '11', '2', '18.2%', '$142,000'],
      ['Sarah K.', '8', '1', '12.5%', '$81,000'],
      ['Devon R.', '12', '1', '8.3%', '$62,100'],
    ],
  },
  source: 'Analysis based on 31 deals funded since Jan 2025. Default defined as 60+ days delinquent. Data as of Apr 9, 2026.',
};

export function BackendLensAI() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  // Live CRM state — Lens answers against this snapshot.
  const crm = useCrm();
  // Real signed-in role, not the layout's cosmetic view-switcher. The
  // Management tab is admin-only; the enforcing gate is the RLS policy
  // on ai_quotas — this just hides a tab non-admins couldn't use.
  const { role } = useStaffRole();
  const isAdmin = role === 'admin';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  // Role can resolve (or change) after the tab was opened — kick non-admins
  // back to the dashboard rather than rendering an empty Management view.
  useEffect(() => {
    if (tab === 'manage' && !isAdmin) setTab('dashboard');
  }, [tab, isAdmin]);

  const handleSend = async (text?: string) => {
    const msg = text || chatInput.trim();
    if (!msg || thinking) return;
    const history = messages;
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setChatInput('');
    setThinking(true);
    try {
      const answer = await askLens(msg, history, crm);
      setMessages((prev) => [...prev, { role: 'assistant', ...answer }]);
    } catch (err) {
      // Only an unconfigured Lens justifies the canned sample answer. Every
      // other failure must show as a failure: sampleResponse asserts specific
      // agents, default rates, and dollar figures, so rendering it after a
      // rate limit or quota rejection presents invented portfolio analytics
      // as though Lens had actually read the data.
      const notConfigured = err instanceof AIError && err.isNotConfigured;
      if (notConfigured) {
        console.warn('[lens-ai] not configured, showing demo answer:', err);
        setMessages((prev) => [
          ...prev,
          {
            ...sampleResponse,
            content: `**Demo response — not real portfolio data.**\n\n${sampleResponse.content}`,
            source: 'Demo response — set the NEBIUS_API_KEY function secret for live portfolio analysis.',
          },
        ]);
      } else {
        console.error('[lens-ai] answer failed:', err);
        const quota = err instanceof AIError && err.isQuotaExceeded;
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: quota
              ? "**You've reached the AI usage limit for this period.** Lens will resume next cycle, or an admin can raise the limit."
              : `**Lens couldn't answer that.** ${err instanceof Error ? err.message : 'Unknown error'}\n\nNo data was analyzed — try again in a moment.`,
            source: 'Error — no portfolio data was read.',
          },
        ]);
      }
    } finally {
      setThinking(false);
    }
  };

  if (tab === 'ask') {
    return (
      <AskLens
        messages={messages}
        thinking={thinking}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleSend={handleSend}
        chatEndRef={chatEndRef}
        setTab={setTab}
        isAdmin={isAdmin}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1360px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* ── Header ── */}
        <div className="space-y-3">
          <p className="text-[13px] text-gray-500">Predictive intelligence for your portfolio</p>
          <TabSwitch tab={tab} setTab={setTab} isAdmin={isAdmin} />
        </div>
        {tab === 'manage' && isAdmin ? <AiManagementTab /> : <DashboardTab />}
      </div>
    </div>
  );
}

// Underline tab nav, same pattern as the Disputes page.
function TabSwitch({ tab, setTab, isAdmin }: { tab: Tab; setTab: (t: Tab) => void; isAdmin?: boolean }) {
  const tabs: { key: Tab; label: string; icon?: React.ElementType }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'ask', label: 'Ask Lens', icon: Sparkles },
    ...(isAdmin ? [{ key: 'manage' as Tab, label: 'Management', icon: Gauge }] : []),
  ];
  return (
    <div className="border-b border-(--dp-border)">
      <div className="flex gap-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px] flex items-center gap-2 ${
                tab === t.key
                  ? 'text-(--dp-accent-text) border-(--dp-accent)'
                  : 'text-(--dp-text-muted) border-transparent hover:text-(--dp-text)'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// Dashboard Tab
// ════════════════════════════════════════
function DashboardTab() {
  const crm = useCrm();
  const { navigate } = useAppNavigate();

  const stats = useMemo(() => {
    const activeDeals = crm.deals.filter(d => d.status !== 'Paid Off');
    const outstanding = activeDeals.reduce((s, d) => s + dealOutstanding(d), 0);
    const atRisk = crm.deals.filter(d => d.status === 'Delinquent' || d.status === 'Default' || d.status === 'Workout');
    const atRiskExposure = atRisk.reduce((s, d) => s + dealOutstanding(d), 0);
    const renewals = crm.deals.filter(
      d => d.status === 'Current' && d.repaymentAmount > 0 && d.collected / d.repaymentAmount >= 0.5,
    );
    const renewalPotential = renewals.reduce((s, d) => s + d.loanAmount, 0);
    const health = crm.merchants.length
      ? Math.round(crm.merchants.reduce((s, m) => s + (m.healthScore || 0), 0) / crm.merchants.length)
      : null;
    return { activeDeals, outstanding, atRisk, atRiskExposure, renewals, renewalPotential, health };
  }, [crm]);

  const alerts = useMemo(() => deriveLensAlerts(crm), [crm]);

  const hasData =
    crm.merchants.length > 0 || crm.deals.length > 0 || crm.leads.length > 0 || crm.underwriting.length > 0;
  if (!hasData) {
    return (
      <div className="bg-white rounded-[8px] border border-gray-200 px-6 py-16 text-center">
        <div className="mx-auto w-12 h-12 rounded-[14px] bg-indigo-50 flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Lens has nothing to analyze yet</h2>
        <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
          Portfolio health, at-risk deals, and intelligent alerts appear here once the CRM has real
          leads, merchants, or deals — add a lead or analyze a statement to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio stat cards — live CRM figures */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[8px] border border-gray-200 p-5 flex flex-col items-center">
          {stats.health != null ? (
            <HealthRing score={stats.health} size={96} />
          ) : (
            <div className="h-24 flex items-center text-2xl font-bold text-gray-300">—</div>
          )}
          <p className="text-sm font-semibold text-gray-900 mt-3">Portfolio Health</p>
          <p className="text-xs text-gray-500">
            {stats.health != null
              ? `Average across ${crm.merchants.length} merchant${crm.merchants.length === 1 ? '' : 's'}`
              : 'No merchants yet'}
          </p>
        </div>

        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{fmtUsd(stats.outstanding)}</p>
          <p className="text-sm text-gray-500 mt-1">Outstanding Collections</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Across {stats.activeDeals.length} active deal{stats.activeDeals.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.atRisk.length}</p>
          <p className="text-sm text-gray-500 mt-1">At-Risk Deals</p>
          <p className="text-xs text-gray-400 mt-0.5">{fmtUsd(stats.atRiskExposure)} total exposure</p>
        </div>

        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-indigo-600" />
            </div>
            {stats.renewalPotential > 0 && (
              <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                {fmtUsd(stats.renewalPotential)} potential
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{stats.renewals.length}</p>
          <p className="text-sm text-gray-500 mt-1">Renewal Opportunities</p>
          <p className="text-xs text-gray-400 mt-0.5">&gt;50% repaid</p>
        </div>
      </div>

      {/* Alerts Section — derived from live pipeline state */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Intelligent Alerts</h2>
          <span className="text-xs text-gray-500">{alerts.length} active</span>
        </div>
        {alerts.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-[8px] px-5 py-4 text-sm text-emerald-700">
            No active alerts — nothing in the portfolio needs attention right now.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, i) => {
              const sev = sevConfig[alert.severity];
              return (
                <div key={i} className={`${sev.bg} border rounded-[8px] p-4 sm:p-5 transition-all hover:shadow-sm`}>
                  <div className="flex gap-4">
                    <div className={`w-9 h-9 ${sev.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      {alert.severity === 'critical' ? (
                        <Zap className={`w-5 h-5 ${sev.icon}`} />
                      ) : alert.severity === 'warning' ? (
                        <AlertTriangle className={`w-5 h-5 ${sev.icon}`} />
                      ) : (
                        <Sparkles className={`w-5 h-5 ${sev.icon}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded ${sev.badge}`}>
                          {alert.severity}
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900">{alert.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{alert.desc}</p>
                      {alert.to && (
                        <button
                          onClick={() => navigate(alert.to!)}
                          className="px-3 py-1.5 text-xs font-medium rounded-[6px] bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                        >
                          {alert.actionLabel ?? 'View'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Collections Progress — real repayment state per active deal */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Collections Progress</h2>
          <p className="text-xs text-gray-500">Repayment progress across active deals, largest outstanding first</p>
        </div>
        <div className="px-5 py-4">
          {stats.activeDeals.length === 0 ? (
            <p className="py-6 text-sm text-gray-400 text-center">
              No active deals to track yet — funded deals appear here with live repayment progress.
            </p>
          ) : (
            <div className="space-y-4">
              {[...stats.activeDeals]
                .sort((a, b) => dealOutstanding(b) - dealOutstanding(a))
                .slice(0, 8)
                .map(d => {
                  const pct = d.repaymentAmount > 0 ? Math.min(100, (d.collected / d.repaymentAmount) * 100) : 0;
                  const risky = d.status !== 'Current';
                  return (
                    <div key={d.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{d.borrower}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{d.type}</span>
                          {risky && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
                              {d.status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 tabular-nums shrink-0 ml-3">
                          {fmtUsd(d.collected)} of {fmtUsd(d.repaymentAmount)} · {fmtUsd(dealOutstanding(d))} left
                        </p>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${risky ? 'bg-red-400' : pct >= 50 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// Ask Lens — conversational surface
// ════════════════════════════════════════
function Composer({
  chatInput,
  setChatInput,
  handleSend,
  autoFocus,
}: {
  chatInput: string;
  setChatInput: (v: string) => void;
  handleSend: () => void;
  autoFocus?: boolean;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow up to ~6 lines
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 152)}px`;
  }, [chatInput]);

  return (
    <div className="rounded-[20px] bg-(--dp-bg-card) border border-(--dp-border) focus-within:border-(--dp-accent) focus-within:shadow-[0_0_0_3px_var(--dp-accent-soft)] transition-shadow">
      <textarea
        ref={taRef}
        rows={1}
        autoFocus={autoFocus}
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Ask Lens about your portfolio…"
        className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[15px] leading-relaxed text-(--dp-text) placeholder:text-(--dp-text-faint) outline-none"
      />
      <div className="flex items-center justify-between px-3 pb-3 pl-5">
        <span className="text-[11px] text-(--dp-text-faint)">
          Enter to send · Shift+Enter for a new line
        </span>
        <button
          onClick={handleSend}
          disabled={!chatInput.trim()}
          aria-label="Send"
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            chatInput.trim()
              ? 'bg-(--dp-accent) hover:bg-(--dp-accent-hover) text-white'
              : 'bg-white/[0.06] text-(--dp-text-faint)'
          }`}
        >
          <ArrowUp className="w-4.5 h-4.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function LensAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-(--dp-accent-soft) border border-(--dp-border) flex items-center justify-center shrink-0">
      <Sparkles className="w-3.5 h-3.5 text-(--dp-accent-text)" />
    </div>
  );
}

function AskLens({
  messages,
  thinking,
  chatInput,
  setChatInput,
  handleSend,
  chatEndRef,
  setTab,
  isAdmin,
}: {
  messages: ChatMessage[];
  thinking: boolean;
  chatInput: string;
  setChatInput: (v: string) => void;
  handleSend: (text?: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  setTab: (t: Tab) => void;
  isAdmin: boolean;
}) {
  const empty = messages.length === 0;

  return (
    <div className="h-full flex flex-col">
      {/* Slim header — just the mode switch */}
      <div className="shrink-0 px-4 lg:px-8 pt-4 space-y-3">
        <p className="text-[13px] text-(--dp-text-muted)">Predictive intelligence for your portfolio</p>
        <TabSwitch tab="ask" setTab={setTab} isAdmin={isAdmin} />
      </div>

      {empty ? (
        /* ── Home state: greeting + centered composer + suggestions ──
           m-auto centers when there's room and scrolls (instead of
           overlapping the tab bar) when there isn't. */
        <div className="flex-1 overflow-y-auto flex px-4">
          <div className="w-full max-w-[720px] m-auto py-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 rounded-[14px] bg-(--dp-accent-soft) border border-(--dp-border) flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6 text-(--dp-accent-text)" />
              </div>
              <h2 className="text-[30px] font-bold text-(--dp-text) tracking-[-0.02em]">
                What can Lens find for you?
              </h2>
              <p className="mt-2 text-[14px] text-(--dp-text-muted)">
                Ask about deals, merchants, agents, or projections — in plain language.
              </p>
            </div>

            <Composer chatInput={chatInput} setChatInput={setChatInput} handleSend={() => handleSend()} autoFocus />

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suggestedPrompts.map((prompt, i) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt.text)}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-[14px] border border-(--dp-border) text-left text-[13px] text-(--dp-text-secondary) hover:border-(--dp-border-strong) hover:bg-white/[0.03] transition-colors"
                  >
                    <Icon className="w-4 h-4 shrink-0 text-(--dp-accent-text)" />
                    {prompt.text}
                  </button>
                );
              })}
            </div>

            <p className="mt-6 text-center text-[11px] text-(--dp-text-faint)">
              Lens analyzes your live portfolio data. Responses are generated insights, not financial advice.
            </p>
          </div>
        </div>
      ) : (
        /* ── Conversation state ── */
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[760px] mx-auto px-4 py-8 space-y-7">
              {messages.map((msg, i) =>
                msg.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[80%] rounded-[18px] rounded-br-[6px] bg-(--dp-bg-raised) border border-(--dp-border) px-4 py-2.5 text-[14px] leading-relaxed text-(--dp-text)">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex gap-3">
                    <LensAvatar />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[14.5px] leading-[1.7] text-(--dp-text-secondary) whitespace-pre-wrap">
                        {msg.content.split('**').map((part, j) =>
                          j % 2 === 1 ? (
                            <span key={j} className="font-bold text-(--dp-text)">{part}</span>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </p>
                      {msg.table && (
                        <div className="mt-4 overflow-x-auto rounded-[12px] border border-(--dp-border)">
                          <table className="w-full text-[12.5px]">
                            <thead>
                              <tr className="border-b border-(--dp-border)">
                                {msg.table.headers.map((h, j) => (
                                  <th key={j} className={`px-3.5 py-2.5 ${j === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {msg.table.rows.map((row, j) => (
                                <tr key={j} className={j < msg.table!.rows.length - 1 ? 'border-b border-(--dp-border)' : ''}>
                                  {row.map((cell, k) => (
                                    <td
                                      key={k}
                                      className={`px-3.5 py-2.5 whitespace-nowrap tabular-nums ${
                                        k === 0 ? 'text-left font-semibold text-(--dp-text)' : 'text-right text-(--dp-text-secondary)'
                                      }`}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {msg.source && (
                        <p className="mt-3 text-[11.5px] text-(--dp-text-faint) flex items-center gap-1.5">
                          <Eye className="w-3 h-3" />
                          {msg.source}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}

              {thinking && (
                <div className="flex gap-3 items-center">
                  <LensAvatar />
                  <div className="flex items-center gap-1 pt-0.5">
                    {[0, 1, 2].map(d => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-(--dp-text-faint) animate-bounce"
                        style={{ animationDelay: `${d * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Pinned composer */}
          <div className="shrink-0 px-4 pb-5">
            <div className="max-w-[760px] mx-auto">
              <Composer chatInput={chatInput} setChatInput={setChatInput} handleSend={() => handleSend()} />
              <p className="mt-2 text-center text-[11px] text-(--dp-text-faint)">
                Lens analyzes your live portfolio data. Responses are generated insights, not financial advice.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
