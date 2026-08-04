import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import {
  Landmark, FolderTree, Link2, RefreshCw, Search, ChevronRight, ChevronDown,
  Folder, FolderOpen, FileJson, ShieldCheck, ShieldAlert, Banknote, User,
  CreditCard, TrendingUp, TrendingDown, Minus, ArrowLeft, Trash2, Copy,
  AlertTriangle, CheckCircle2, XCircle, Clock, Zap, Send, Wallet, Activity,
  PieChart, Repeat, Gauge, ScrollText,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner@2.0.3';
import { useLeads, underwritingActions, type Lead } from '../crmStore';
import {
  usePlaidItems, usePlaidNodes, usePlaidStatus, usePlaidSync, plaidActions,
  PLAID_LINK_SESSION_KEY, PLAID_OAUTH_HREF_KEY,
  type PlaidItem, type PlaidNode,
} from '../plaidStore';
import {
  scorePlaid, evaluateApplication, defaultScoreInputs,
  type PlaidInputs, type SubScoreBreakdown, type ScoringResult,
} from '../underwritingScore';

// ══════════════════════════════════════════════════════════════
// Delt liquid-glass design tokens (dark navy var(--dp-bg-card) / indigo #2E6BFF)
// ══════════════════════════════════════════════════════════════

const GLASS = 'bg-(--dp-bg-card) border border-(--dp-border) rounded-2xl';
const GLASS_SOFT = 'bg-(--dp-bg-raised) border border-(--dp-border) rounded-xl';
const GLASS_HOVER = 'hover:bg-(--dp-bg-raised) transition-colors';
const TXT = 'text-(--dp-text)';
const TXT_MUTED = 'text-(--dp-text-muted)';
const TXT_FAINT = 'text-(--dp-text-faint)';
const BTN_PRIMARY =
  'inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-(--dp-accent) text-white text-sm font-bold hover:bg-(--dp-accent-hover) disabled:opacity-50 transition-all';
const BTN_GLASS =
  'inline-flex items-center gap-2 px-3 py-2 rounded-[10px] bg-white/[0.06] border border-(--dp-border) text-sm text-(--dp-text-secondary) hover:bg-(--dp-bg-raised) disabled:opacity-50 transition-colors';
const INPUT_GLASS =
  'bg-(--dp-bg-card) border border-(--dp-border) rounded-[10px] text-sm text-(--dp-text) placeholder:text-(--dp-text-faint) focus:outline-none focus:ring-2 focus:ring-(--dp-accent-soft) focus:border-(--dp-accent)';

// Chart series — validated for the dark navy surface (dataviz six checks).
const CHART_IN = '#059669';
const CHART_OUT = '#6366f1';
const CHART_GRID = 'rgba(127,147,184,0.18)';
const CHART_TICK = 'var(--dp-text-muted)';
const CHART_TOOLTIP = {
  contentStyle: {
    background: 'var(--dp-bg-surface)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 12,
    color: 'var(--dp-text)',
    fontSize: 12,
  },
  labelStyle: { color: 'var(--dp-text)' },
  itemStyle: { color: 'var(--dp-text-secondary)' },
} as const;

// ══════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════

const fmtMoney = (n: number | null | undefined, digits = 0) =>
  n == null
    ? '—'
    : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: digits });

const fmtPct = (n: number | null | undefined) =>
  n == null ? '—' : `${(n * 100).toFixed(1)}%`;

function timeAgo(iso?: string | null): string {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ══════════════════════════════════════════════════════════════
// Plaid Link launcher
// ══════════════════════════════════════════════════════════════

/** Mounted only once a link_token exists; auto-opens the Plaid Link modal. */
function PlaidLinkOpener({
  token, receivedRedirectUri, onSuccess, onExit,
}: {
  token: string;
  /** Set when resuming after an OAuth bank redirect (must be the full return URL). */
  receivedRedirectUri?: string;
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit: () => void;
}) {
  const { open, ready } = usePlaidLink({ token, receivedRedirectUri, onSuccess, onExit });
  useEffect(() => {
    if (ready) open();
  }, [ready, open]);
  return null;
}

function PlaidLinkButton({
  leadId, disabled, compact,
}: {
  leadId: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const launch = async () => {
    setBusy(true);
    try {
      const t = await plaidActions.createLinkToken(leadId);
      setToken(t);
    } catch (err: any) {
      toast.error(`Couldn't start Plaid Link: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const onSuccess = useCallback(
    (publicToken: string, metadata: any) => {
      setToken(null);
      plaidActions.clearLinkSession();
      plaidActions.exchange(leadId, publicToken, {
        institution_id: metadata?.institution?.institution_id,
        name: metadata?.institution?.name,
      });
    },
    [leadId],
  );

  return (
    <>
      <button
        onClick={launch}
        disabled={disabled || busy}
        className={
          compact
            ? 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2E6BFF] text-white text-xs font-medium hover:bg-[#4A7EFF] disabled:opacity-50'
            : BTN_PRIMARY
        }
      >
        <Link2 className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
        {busy ? 'Starting…' : 'Connect bank'}
      </button>
      {token && (
        <PlaidLinkOpener
          token={token}
          onSuccess={onSuccess}
          onExit={() => { setToken(null); plaidActions.clearLinkSession(); }}
        />
      )}
    </>
  );
}

/**
 * Finishes a Plaid Link flow interrupted by an OAuth bank redirect.
 *
 * OAuth institutions (Chase etc.) navigate the tab to the bank and back to
 * /plaid-oauth-callback. The App-level shim stashes the return URL (which carries
 * oauth_state_id) and re-enters the CRM; this component — mounted with the
 * page — picks up the stashed link_token + leadId, re-opens Link with
 * receivedRedirectUri, and runs the normal exchange.
 */
function PlaidOAuthResume() {
  const [ctx, setCtx] = useState<{ href: string; token: string; leadId: string } | null>(() => {
    try {
      const href = sessionStorage.getItem(PLAID_OAUTH_HREF_KEY);
      const raw = sessionStorage.getItem(PLAID_LINK_SESSION_KEY);
      if (!href || !raw) return null;
      const { token, leadId, ts } = JSON.parse(raw);
      // OAuth link tokens are short-lived (~30 min) — drop stale contexts.
      if (!token || !leadId || !ts || Date.now() - ts > 30 * 60_000) return null;
      return { href, token, leadId };
    } catch {
      return null;
    }
  });

  const finish = useCallback(() => {
    plaidActions.clearLinkSession();
    setCtx(null);
  }, []);

  if (!ctx) return null;
  return (
    <PlaidLinkOpener
      token={ctx.token}
      receivedRedirectUri={ctx.href}
      onSuccess={(publicToken, metadata) => {
        finish();
        plaidActions.exchange(ctx.leadId, publicToken, {
          institution_id: metadata?.institution?.institution_id,
          name: metadata?.institution?.name,
        });
      }}
      onExit={finish}
    />
  );
}

// ══════════════════════════════════════════════════════════════
// Prospect rollup (lead + vault docs + scoring)
// ══════════════════════════════════════════════════════════════

interface ProspectRollup {
  lead: Lead;
  items: PlaidItem[];
  summary: any | null;
  cashFlow: any | null;
  plaidInputs: PlaidInputs | null;
  plaidScore: SubScoreBreakdown | null;
  prelim: ScoringResult | null;
  /** Server-side Delt Cash-Flow Decision Model output (authoritative). */
  recommendation: any | null;
}

function useProspects(): ProspectRollup[] {
  const leads = useLeads();
  const items = usePlaidItems();
  const nodes = usePlaidNodes();

  return useMemo(() => {
    const byKind = (leadId: string, kind: string) =>
      nodes.find(n => n.leadId === leadId && n.docKind === kind)?.data ?? null;

    return leads.map(lead => {
      const leadItems = items.filter(i => i.leadId === lead.id);
      const summary = byKind(lead.id, 'summary');
      const cashFlow = byKind(lead.id, 'cash_flow');
      const uwDoc = byKind(lead.id, 'underwriting_inputs');
      const recommendation = byKind(lead.id, 'recommendation');
      const plaidInputs: PlaidInputs | null = uwDoc?.plaidInputs ?? null;
      let plaidScore: SubScoreBreakdown | null = null;
      let prelim: ScoringResult | null = null;
      if (plaidInputs) {
        plaidScore = scorePlaid(plaidInputs);
        const seeded = defaultScoreInputs({
          monthlyRevenue: plaidInputs.monthlyRevenue || undefined,
          avgDailyBalance: plaidInputs.avgDailyBalance || undefined,
          existingPositions: uwDoc?.detected?.debt_positions || undefined,
        });
        prelim = evaluateApplication({ ...seeded, plaid: plaidInputs });
      }
      return { lead, items: leadItems, summary, cashFlow, plaidInputs, plaidScore, prelim, recommendation };
    });
  }, [leads, items, nodes]);
}

// ══════════════════════════════════════════════════════════════
// Badges
// ══════════════════════════════════════════════════════════════

const MODEL_DECISION_STYLE: Record<string, { cls: string; Icon: React.ElementType; label: string }> = {
  PRE_APPROVE: { cls: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300', Icon: CheckCircle2, label: 'Pre-Approved' },
  REVIEW: { cls: 'bg-amber-400/10 border-amber-400/30 text-amber-300', Icon: AlertTriangle, label: 'Review' },
  DECLINE: { cls: 'bg-red-400/10 border-red-400/30 text-red-300', Icon: XCircle, label: 'Decline' },
  INSUFFICIENT_DATA: { cls: 'bg-white/[0.06] border-(--dp-border-strong) text-(--dp-text-secondary)', Icon: Clock, label: 'More data' },
};

function ModelDecisionBadge({ decision }: { decision: string | null | undefined }) {
  if (!decision) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white/[0.05] border border-(--dp-border) text-(--dp-text-muted)">
        <Clock className="w-3 h-3" /> No data
      </span>
    );
  }
  const cfg = MODEL_DECISION_STYLE[decision] ?? MODEL_DECISION_STYLE.INSUFFICIENT_DATA;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${cfg.cls}`}>
      <cfg.Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

function TrendIcon({ trend }: { trend?: string }) {
  if (trend === 'growing') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-(--dp-text-faint)" />;
}

// ══════════════════════════════════════════════════════════════
// Charts (dark)
// ══════════════════════════════════════════════════════════════

function CashFlowChart({ monthly }: { monthly: any[] }) {
  const data = (monthly ?? []).slice(-12).map(m => ({
    month: m.month,
    Inflows: m.inflows,
    Outflows: m.outflows,
  }));
  if (!data.length) return <p className={`text-sm ${TXT_FAINT} py-8 text-center`}>No transaction history yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART_TICK }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: CHART_TICK }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
        />
        <RTooltip {...CHART_TOOLTIP} formatter={(v: any) => fmtMoney(Number(v))} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Legend wrapperStyle={{ fontSize: 12, color: 'var(--dp-text-secondary)' }} />
        <Bar dataKey="Inflows" fill={CHART_IN} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Outflows" fill={CHART_OUT} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function BalanceChart({ series }: { series: any[] }) {
  const data = (series ?? []).map(s => ({ date: s.date.slice(5), Balance: s.balance }));
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: CHART_TICK }} axisLine={false} tickLine={false} interval={13} />
        <YAxis
          tick={{ fontSize: 10, fill: CHART_TICK }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
        />
        <RTooltip {...CHART_TOOLTIP} formatter={(v: any) => fmtMoney(Number(v), 2)} />
        <Line type="monotone" dataKey="Balance" stroke={CHART_OUT} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ══════════════════════════════════════════════════════════════
// Small glass pieces
// ══════════════════════════════════════════════════════════════

function StatTile({ label, value, icon, glow }: { label: string; value: React.ReactNode; icon: React.ReactNode; glow?: boolean }) {
  return (
    <div className={`${GLASS} p-4 sm:p-5 relative overflow-hidden`}>
      {glow && (
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#2E6BFF]/25 blur-3xl pointer-events-none" />
      )}
      <div className="flex items-start justify-between mb-1.5">
        <p className={`text-xs sm:text-sm ${TXT_MUTED}`}>{label}</p>
        <span className="text-[#8FB0FF]">{icon}</span>
      </div>
      <p className={`text-2xl sm:text-3xl font-semibold tracking-tight ${TXT}`}>{value}</p>
    </div>
  );
}

function MetricTile({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className={`${GLASS_SOFT} p-3`}>
      <p className={`text-xs ${TXT_MUTED}`}>{label}</p>
      <p className={`text-lg font-semibold ${TXT} mt-0.5`}>{value}</p>
      {sub && <p className={`text-[11px] ${TXT_FAINT} mt-0.5`}>{sub}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Decision Model recommendation panel
// ══════════════════════════════════════════════════════════════

function GateRow({ g }: { g: any }) {
  return (
    <div className="flex items-center gap-2 py-1">
      {g.passed
        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
      <span className={`text-xs flex-1 ${g.passed ? 'text-(--dp-text-secondary)' : 'text-red-300'}`}>{g.label}</span>
      <span className={`text-[11px] ${g.passed ? TXT_FAINT : 'text-red-300'}`}>{g.value}</span>
      <span className={`text-[10px] ${TXT_FAINT} w-20 text-right`}>{g.threshold}</span>
    </div>
  );
}

function RecommendationView({ rec, onSendToUnderwriting }: { rec: any; onSendToUnderwriting?: () => void }) {
  const [showTrace, setShowTrace] = useState(false);
  const cfg = MODEL_DECISION_STYLE[rec.decision] ?? MODEL_DECISION_STYLE.INSUFFICIENT_DATA;
  const offer = rec.offer;

  return (
    <div className="space-y-4">
      {/* Decision banner */}
      <div className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3 ${cfg.cls}`}>
        <div className="flex items-center gap-3">
          <cfg.Icon className="w-6 h-6" />
          <div>
            <p className="text-base font-semibold">{rec.decision_label}</p>
            <p className="text-xs opacity-80">
              {rec.model_name} v{rec.model_version} · score {rec.score?.total ?? '—'}/100
              {rec.tier_label ? ` · ${rec.tier_label}` : ''} · {timeAgo(rec.computed_at)}
            </p>
          </div>
        </div>
        {onSendToUnderwriting && (
          <button onClick={onSendToUnderwriting} className={BTN_PRIMARY}>
            <Send className="w-4 h-4" /> Send to Underwriting
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Offer */}
        <div className={`${GLASS} p-4 relative overflow-hidden`}>
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-[#2E6BFF]/20 blur-3xl pointer-events-none" />
          <h4 className={`text-sm font-semibold ${TXT} mb-2 flex items-center gap-2`}>
            <Banknote className="w-4 h-4 text-[#8FB0FF]" /> Sized offer
          </h4>
          {offer ? (
            <>
              <p className={`text-3xl font-semibold tracking-tight ${TXT}`}>{fmtMoney(offer.amount)}</p>
              <p className={`text-xs ${TXT_MUTED} mt-1`}>
                factor {offer.factor} · {offer.term_months} mo · payback {fmtMoney(offer.total_payback)}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <MetricTile label="Daily payment" value={fmtMoney(offer.daily_payment, 2)} sub={`${fmtPct(offer.payment_pct_daily_revenue)} of daily revenue`} />
                <MetricTile label="Monthly est." value={fmtMoney(offer.est_monthly_payment)} sub={`${fmtPct(offer.payment_pct_adb)} of ADB`} />
              </div>
              <p className={`text-[11px] ${TXT_FAINT} mt-3 mb-1`}>Caps (offer = minimum):</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(offer.caps ?? {}).map(([k, v]) =>
                  v == null ? null : (
                    <span
                      key={k}
                      className={`px-2 py-0.5 rounded-full text-[10px] border ${
                        offer.binding_cap === k
                          ? 'bg-[#2E6BFF]/20 border-[#2E6BFF]/50 text-[var(--dp-accent-text)] font-medium'
                          : 'bg-white/[0.04] border-(--dp-border) text-(--dp-text-muted)'
                      }`}
                    >
                      {k.replace(/_/g, ' ')}: {fmtMoney(Number(v))}
                    </span>
                  ),
                )}
              </div>
            </>
          ) : (
            <p className={`text-sm ${TXT_FAINT}`}>No offer — see gates and conditions.</p>
          )}
        </div>

        {/* Score breakdown */}
        <div className={`${GLASS} p-4`}>
          <h4 className={`text-sm font-semibold ${TXT} mb-2 flex items-center gap-2`}>
            <Gauge className="w-4 h-4 text-[#8FB0FF]" /> Cash-flow score — {rec.score?.total ?? 0}/100
          </h4>
          <div className="space-y-1.5">
            {(rec.score?.components ?? []).map((cp: any) => (
              <div key={cp.key} className="flex items-center gap-2">
                <span className={`text-xs ${TXT_MUTED} w-36 truncate`} title={cp.value}>{cp.label}</span>
                <div className="flex-1 h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2E6BFF] to-[#8FB0FF]"
                    style={{ width: `${Math.max(0, Math.min(100, (cp.points / cp.max) * 100))}%` }}
                  />
                </div>
                <span className={`text-xs ${TXT_MUTED} w-10 text-right`}>{cp.points}/{cp.max}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gates + conditions */}
        <div className={`${GLASS} p-4`}>
          <h4 className={`text-sm font-semibold ${TXT} mb-2 flex items-center gap-2`}>
            <ShieldCheck className="w-4 h-4 text-[#8FB0FF]" /> Gates & conditions
          </h4>
          <div className="max-h-40 overflow-y-auto pr-1">
            {[...(rec.gates?.sufficiency ?? []), ...(rec.gates?.knockouts ?? [])].map((g: any) => (
              <GateRow key={g.code} g={g} />
            ))}
          </div>
          {(rec.conditions ?? []).length > 0 && (
            <>
              <p className={`text-[11px] ${TXT_FAINT} mt-2 mb-1`}>Conditions before funding:</p>
              <ul className="space-y-1">
                {rec.conditions.map((c: string, i: number) => (
                  <li key={i} className="text-xs text-amber-300/90 flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" /> {c}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Reasoning trace */}
      <div className={`${GLASS_SOFT} p-3`}>
        <button
          onClick={() => setShowTrace(v => !v)}
          className={`text-xs ${TXT_MUTED} hover:text-(--dp-text-secondary) inline-flex items-center gap-1.5`}
        >
          <ScrollText className="w-3.5 h-3.5" />
          {showTrace ? 'Hide' : 'Show'} model reasoning trace
        </button>
        {showTrace && (
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            {(rec.explanation ?? []).map((line: string, i: number) => (
              <li key={i} className={`text-xs ${TXT_MUTED}`}>{line}</li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Prospect detail
// ══════════════════════════════════════════════════════════════

function ProspectDetail({
  prospect, onBack, onOpenInExplorer,
}: {
  prospect: ProspectRollup;
  onBack: () => void;
  onOpenInExplorer: (path: string) => void;
}) {
  const nodes = usePlaidNodes();
  const { busy } = usePlaidSync();
  const { lead, items, summary, cashFlow, plaidInputs, recommendation } = prospect;
  const base = `/prospects/${lead.id}`;

  const accountDocs = nodes.filter(n => n.leadId === lead.id && n.docKind === 'account');
  const identityDocs = nodes.filter(n => n.leadId === lead.id && n.docKind === 'identity');
  const liabilityDocs = nodes.filter(n => n.leadId === lead.id && n.docKind === 'liabilities');
  const investmentDocs = nodes.filter(n => n.leadId === lead.id && n.docKind === 'investments');
  const recurringDocs = nodes.filter(n => n.leadId === lead.id && n.docKind === 'recurring');
  const idvDocs = nodes.filter(n => n.leadId === lead.id && n.docKind === 'identity_verification');
  const assetReport = nodes.find(n => n.leadId === lead.id && n.docKind === 'asset_report') ?? null;
  const [idvInput, setIdvInput] = useState('');
  const m = cashFlow?.metrics;

  const sendToUnderwriting = () => {
    if (!plaidInputs) return;
    const app = underwritingActions.create({
      businessName: lead.businessName,
      industry: lead.industry,
      requestedAmount: Number(String(lead.amountRequested).replace(/[^0-9.]/g, '')) || 50000,
      monthlyRevenue: plaidInputs.monthlyRevenue,
      avgDailyBalance: plaidInputs.avgDailyBalance,
      existingPositions: m?.detectedDebtPositions || 0,
      source: 'Plaid Vault',
    });
    underwritingActions.updateInputs(app.id, { plaidInputs });
    toast.success(`${lead.businessName} sent to Underwriting as ${app.applicationId} with live Plaid cash-flow data.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`p-2 rounded-xl border border-(--dp-border) ${GLASS_HOVER}`}>
            <ArrowLeft className="w-4 h-4 text-(--dp-text-secondary)" />
          </button>
          <div>
            <h2 className={`text-lg font-semibold ${TXT}`}>{lead.businessName}</h2>
            <p className={`text-xs ${TXT_MUTED}`}>
              {lead.industry} · Requested {lead.amountRequested || '—'} · {items.length} Plaid connection{items.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onOpenInExplorer(base)} className={BTN_GLASS}>
            <FolderTree className="w-4 h-4" /> Open in Explorer
          </button>
          <button
            onClick={() => plaidActions.syncAll(lead.id)}
            disabled={busy.includes('sync:all') || items.length === 0}
            className={BTN_GLASS}
          >
            <RefreshCw className="w-4 h-4" /> Sync
          </button>
          <PlaidLinkButton leadId={lead.id} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className={`${GLASS} border-dashed p-10 text-center`}>
          <Landmark className="w-8 h-8 text-(--dp-text-faint) mx-auto mb-3" />
          <p className={`text-sm ${TXT} font-medium`}>No bank connected yet</p>
          <p className={`text-xs ${TXT_FAINT} mt-1 mb-4`}>
            Connect this prospect's bank via Plaid Link to pull identity, account verification, financials and credit data.
          </p>
          <div className="flex items-center justify-center gap-2">
            <PlaidLinkButton leadId={lead.id} />
            <SandboxConnectButton leadId={lead.id} />
          </div>
        </div>
      ) : (
        <>
          {/* Decision model — the authoritative recommendation */}
          {recommendation ? (
            <RecommendationView rec={recommendation} onSendToUnderwriting={plaidInputs ? sendToUnderwriting : undefined} />
          ) : (
            <div className={`${GLASS_SOFT} p-4 text-sm ${TXT_FAINT}`}>
              Recommendation pending — sync this prospect to run the decision model.
            </div>
          )}

          {/* Verification strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className={`${GLASS} p-4`}>
              <div className={`flex items-center gap-2 text-sm font-medium ${TXT}`}>
                {summary?.identity_verified
                  ? <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  : <ShieldAlert className="w-4 h-4 text-amber-400" />}
                Identity
              </div>
              <p className={`text-xs ${TXT_MUTED} mt-1`}>
                {summary?.identity_verified ? 'Verified via Plaid Identity' : 'Not verified yet'}
              </p>
            </div>
            <div className={`${GLASS} p-4`}>
              <div className={`flex items-center gap-2 text-sm font-medium ${TXT}`}>
                <Banknote className={`w-4 h-4 ${summary?.bank_verified ? 'text-emerald-400' : 'text-amber-400'}`} />
                Bank Accounts
              </div>
              <p className={`text-xs ${TXT_MUTED} mt-1`}>
                {summary?.accounts ?? 0} account(s) · {summary?.bank_verified ? 'ACH verified' : 'unverified'}
              </p>
            </div>
            <div className={`${GLASS} p-4`}>
              <div className={`flex items-center gap-2 text-sm font-medium ${TXT}`}>
                <Wallet className="w-4 h-4 text-[#8FB0FF]" /> Balance
              </div>
              <p className={`text-xs ${TXT_MUTED} mt-1`}>
                {fmtMoney(summary?.depository_balance)} across depository accounts
              </p>
            </div>
            <div className={`${GLASS} p-4`}>
              <div className={`flex items-center gap-2 text-sm font-medium ${TXT}`}>
                <Activity className="w-4 h-4 text-[#8FB0FF]" /> Debt service
              </div>
              <p className={`text-xs ${TXT_MUTED} mt-1`}>
                {fmtMoney(summary?.monthly_debt_service ?? 0)}/mo · {summary?.detected_debt_positions ?? 0} position(s)
              </p>
            </div>
          </div>

          {/* Financials */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className={`lg:col-span-2 ${GLASS} p-4`}>
              <h3 className={`text-sm font-semibold ${TXT} mb-1`}>Monthly cash flow</h3>
              <p className={`text-xs ${TXT_FAINT} mb-3`}>Money in vs money out, from Plaid transactions</p>
              <CashFlowChart monthly={cashFlow?.monthly ?? []} />
              <h3 className={`text-sm font-semibold ${TXT} mt-4 mb-1`}>Daily balance (90d, reconstructed)</h3>
              <BalanceChart series={cashFlow?.balanceSeries ?? []} />
            </div>
            <div className={`${GLASS} p-4`}>
              <h3 className={`text-sm font-semibold ${TXT} mb-3`}>Underwriting metrics</h3>
              {m ? (
                <div className="grid grid-cols-2 gap-2">
                  <MetricTile label="Monthly revenue" value={fmtMoney(m.monthlyRevenue)} sub="3-mo average" />
                  <MetricTile
                    label="Trend"
                    value={<span className="inline-flex items-center gap-1"><TrendIcon trend={m.revenueTrend} />{m.revenueTrend}</span>}
                    sub={`${fmtPct(m.revenueChange3moPct)} over 3 mo`}
                  />
                  <MetricTile label="Avg daily balance" value={fmtMoney(m.avgDailyBalance)} />
                  <MetricTile label="Min daily balance" value={fmtMoney(m.minDailyBalance)} />
                  <MetricTile label="NSF / overdrafts (90d)" value={m.nsfCount90d} sub={m.daysSinceLastNsf >= 9999 ? 'never' : `last ${m.daysSinceLastNsf}d ago`} />
                  <MetricTile label="Deposit mix" value={m.depositConcentration} sub={`top source ${fmtPct(m.topDepositorSharePct)}`} />
                  <MetricTile label="Revenue volatility" value={fmtPct(m.revenueStdDevPct)} sub="stddev / mean" />
                  <MetricTile label="Data depth" value={`${m.monthsOfData} mo`} sub={`${m.transactionCount} transactions`} />
                  <MetricTile
                    label="Monthly debt service"
                    value={fmtMoney(m.monthlyDebtService ?? 0)}
                    sub={m.debtServiceToRevenuePct != null ? `${fmtPct(m.debtServiceToRevenuePct)} of revenue` : undefined}
                  />
                  <MetricTile
                    label="Detected loan positions"
                    value={
                      <span className={(m.detectedDebtPositions ?? 0) > 1 ? 'text-red-400' : undefined}>
                        {m.detectedDebtPositions ?? 0}
                      </span>
                    }
                    sub="from recurring outflows"
                  />
                  <MetricTile label="Recurring revenue streams" value={m.recurringRevenueStreams ?? 0} />
                  <MetricTile label="Investment assets" value={fmtMoney(m.investmentsValue ?? 0)} />
                </div>
              ) : (
                <p className={`text-sm ${TXT_FAINT}`}>Sync a connection to compute metrics.</p>
              )}

              {/* Verified Asset Report */}
              <div className="mt-4 border-t border-(--dp-border) pt-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className={`text-sm font-semibold ${TXT}`}>Verified Asset Report</p>
                    <p className={`text-[11px] ${TXT_FAINT}`}>Plaid-certified 90-day balances & ownership</p>
                  </div>
                  {!assetReport ? (
                    <button
                      onClick={() => plaidActions.createAssetReport(lead.id)}
                      className="px-3 py-1.5 rounded-xl border border-(--dp-border) bg-white/[0.06] text-xs font-medium text-(--dp-text-secondary) hover:bg-(--dp-bg-raised)"
                    >
                      Generate
                    </button>
                  ) : assetReport.data?.status !== 'ready' ? (
                    <button
                      onClick={() => plaidActions.refreshAssetReport(lead.id)}
                      className="px-3 py-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 text-xs font-medium text-amber-300 hover:bg-amber-400/20"
                    >
                      Generating… check status
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  )}
                </div>
                {assetReport?.data?.status === 'ready' && (
                  <div className="mt-2 space-y-1">
                    {(assetReport.data.items ?? []).map((it: any, i: number) => (
                      <div key={i} className={`text-xs ${TXT_MUTED}`}>
                        <span className="font-medium text-(--dp-text-secondary)">{it.institution_name}</span>
                        {' — '}
                        {(it.accounts ?? []).map((a: any) =>
                          `${a.name ?? 'acct'} ••${a.mask ?? ''} (${a.days_available ?? 0}d history)`
                        ).join(', ')}
                      </div>
                    ))}
                    <button
                      onClick={() => onOpenInExplorer(`${base}/financials/asset-report`)}
                      className="text-xs text-[#8FB0FF] hover:text-[var(--dp-accent-text)] hover:underline"
                    >
                      View full report in Explorer →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Identity + accounts + credit */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className={`${GLASS} p-4`}>
              <h3 className={`text-sm font-semibold ${TXT} mb-3 flex items-center gap-2`}>
                <User className="w-4 h-4 text-[#8FB0FF]" /> Identity verification
              </h3>
              {identityDocs.length === 0 && idvDocs.length === 0 && (
                <p className={`text-sm ${TXT_FAINT}`}>No identity data yet.</p>
              )}
              {idvDocs.length > 0 && (
                <div className="space-y-2 mb-3">
                  {idvDocs.map(doc => (
                    <div key={doc.path} className={`${GLASS_SOFT} p-3`}>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${TXT}`}>{doc.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          doc.data?.status === 'success'
                            ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
                            : doc.data?.status === 'failed'
                              ? 'bg-red-400/10 border-red-400/30 text-red-300'
                              : 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                        }`}>
                          {doc.data?.status ?? 'pending'}
                        </span>
                      </div>
                      <p className={`text-xs ${TXT_MUTED} mt-1`}>
                        KYC: {doc.data?.kyc_check?.status ?? '—'} · Docs: {doc.data?.documentary_verification?.status ?? '—'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-3">
                {identityDocs.map(doc => (
                  <div key={doc.path} className={`${GLASS_SOFT} p-3`}>
                    <p className={`text-xs ${TXT_FAINT} mb-1`}>{doc.data?.institution?.name ?? 'Institution'}</p>
                    {(doc.data?.owners ?? []).map((o: any, i: number) => (
                      <div key={i} className="text-sm text-(--dp-text-secondary)">
                        <p className={`font-medium ${TXT}`}>{(o.names ?? []).join(', ') || 'Unnamed owner'}</p>
                        <p className={`text-xs ${TXT_MUTED}`}>
                          {(o.emails ?? []).map((e: any) => e.data).slice(0, 2).join(' · ')}
                        </p>
                        <p className={`text-xs ${TXT_MUTED}`}>
                          {(o.phone_numbers ?? []).map((p: any) => p.data).slice(0, 2).join(' · ')}
                        </p>
                        {(o.addresses ?? []).slice(0, 1).map((a: any, j: number) => (
                          <p key={j} className={`text-xs ${TXT_FAINT}`}>
                            {[a.data?.street, a.data?.city, a.data?.region, a.data?.postal_code].filter(Boolean).join(', ')}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {/* Attach an IDV session created via your Plaid IDV template */}
              <div className="mt-3 border-t border-(--dp-border) pt-3">
                <p className={`text-[11px] ${TXT_FAINT} mb-1.5`}>
                  Ran a Plaid Identity Verification session elsewhere? Paste its ID (idv_…) to attach it.
                </p>
                <div className="flex items-center gap-1.5">
                  <input
                    value={idvInput}
                    onChange={e => setIdvInput(e.target.value)}
                    placeholder="idv_…"
                    className={`flex-1 min-w-0 px-2.5 py-1.5 text-xs font-mono ${INPUT_GLASS}`}
                  />
                  <button
                    onClick={() => {
                      const v = idvInput.trim();
                      if (!v) return;
                      plaidActions.attachIdv(lead.id, v).then(() => setIdvInput(''));
                    }}
                    disabled={!idvInput.trim()}
                    className="px-2.5 py-1.5 rounded-xl bg-[#2E6BFF] text-white text-xs font-medium hover:bg-[#4A7EFF] disabled:opacity-50"
                  >
                    Attach
                  </button>
                </div>
              </div>
            </div>

            <div className={`${GLASS} p-4`}>
              <h3 className={`text-sm font-semibold ${TXT} mb-3 flex items-center gap-2`}>
                <Banknote className="w-4 h-4 text-[#8FB0FF]" /> Verified accounts
              </h3>
              {accountDocs.length === 0 && <p className={`text-sm ${TXT_FAINT}`}>No accounts yet.</p>}
              <div className="space-y-2">
                {accountDocs.map(doc => {
                  const a = doc.data ?? {};
                  return (
                    <div key={doc.path} className={`flex items-center justify-between ${GLASS_SOFT} p-3`}>
                      <div>
                        <p className={`text-sm font-medium ${TXT}`}>
                          {a.name} ••{a.mask}
                          {a.verification?.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline ml-1.5 -mt-0.5" />
                          )}
                        </p>
                        <p className={`text-xs ${TXT_MUTED}`}>
                          {a.type}/{a.subtype}
                          {a.verification?.routing_last4 && ` · routing ••${a.verification.routing_last4}`}
                        </p>
                      </div>
                      <p className={`text-sm font-semibold ${TXT}`}>{fmtMoney(a.balances?.current, 2)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`${GLASS} p-4`}>
              <h3 className={`text-sm font-semibold ${TXT} mb-3 flex items-center gap-2`}>
                <CreditCard className="w-4 h-4 text-[#8FB0FF]" /> Credit data
              </h3>
              {liabilityDocs.length === 0 && (
                <p className={`text-sm ${TXT_FAINT}`}>
                  No liabilities reported. (Liability data appears when the linked institution supports it.)
                </p>
              )}
              <div className="space-y-3">
                {liabilityDocs.map(doc => {
                  const s = doc.data?.summary ?? {};
                  return (
                    <div key={doc.path} className={`${GLASS_SOFT} p-3 text-sm text-(--dp-text-secondary) space-y-1`}>
                      <p className={`text-xs ${TXT_FAINT}`}>{doc.data?.institution?.name ?? 'Institution'}</p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <MetricTile label="Credit cards" value={s.credit_cards ?? 0} />
                        <MetricTile label="Card balance" value={fmtMoney(s.total_credit_balance)} />
                        <MetricTile label="Mortgages" value={s.mortgages ?? 0} />
                        <MetricTile
                          label="Overdue"
                          value={
                            <span className={s.overdue_accounts ? 'text-red-400' : 'text-emerald-400'}>
                              {s.overdue_accounts ?? 0}
                            </span>
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recurring obligations + investments */}
          {(recurringDocs.length > 0 || investmentDocs.length > 0) && (
            <div className="grid lg:grid-cols-2 gap-4">
              <div className={`${GLASS} p-4`}>
                <h3 className={`text-sm font-semibold ${TXT} mb-3 flex items-center gap-2`}>
                  <Repeat className="w-4 h-4 text-[#8FB0FF]" /> Recurring streams & obligations
                </h3>
                {recurringDocs.length === 0 ? (
                  <p className={`text-sm ${TXT_FAINT}`}>No recurring streams detected yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recurringDocs.map(doc => {
                      const inflows = (doc.data?.inflow_streams ?? []).filter((s: any) => s.is_active);
                      const outflows = (doc.data?.outflow_streams ?? []).filter((s: any) => s.is_active);
                      const isDebt = (s: any) =>
                        s.category === 'LOAN_PAYMENTS' ||
                        /loan|advance|capital|lend|funding|mca|leas(e|ing)|financ/i.test(`${s.merchant_name ?? ''} ${s.description ?? ''}`);
                      return (
                        <div key={doc.path} className={`${GLASS_SOFT} p-3`}>
                          <p className={`text-xs ${TXT_FAINT} mb-2`}>{doc.data?.institution?.name ?? 'Institution'}</p>
                          {outflows.filter(isDebt).map((s: any) => (
                            <div key={s.stream_id} className="flex items-center justify-between py-1 text-sm">
                              <span className="text-red-300 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {s.merchant_name || s.description || 'Loan payment'}
                                <span className="text-[10px] text-red-400/70 uppercase">{s.frequency?.toLowerCase()}</span>
                              </span>
                              <span className="font-medium text-red-300">{fmtMoney(Math.abs(s.average_amount ?? 0), 2)}</span>
                            </div>
                          ))}
                          {inflows.slice(0, 4).map((s: any) => (
                            <div key={s.stream_id} className="flex items-center justify-between py-1 text-sm">
                              <span className="text-(--dp-text-secondary) flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                {s.merchant_name || s.description || 'Recurring deposit'}
                                <span className={`text-[10px] ${TXT_FAINT} uppercase`}>{s.frequency?.toLowerCase()}</span>
                              </span>
                              <span className="font-medium text-emerald-400">{fmtMoney(Math.abs(s.average_amount ?? 0), 2)}</span>
                            </div>
                          ))}
                          {outflows.filter((s: any) => !isDebt(s)).length > 0 && (
                            <p className={`text-[11px] ${TXT_FAINT} mt-1`}>
                              +{outflows.filter((s: any) => !isDebt(s)).length} other recurring outflow(s) — see Data Explorer
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className={`${GLASS} p-4`}>
                <h3 className={`text-sm font-semibold ${TXT} mb-3 flex items-center gap-2`}>
                  <PieChart className="w-4 h-4 text-[#8FB0FF]" /> Investment holdings
                </h3>
                {investmentDocs.length === 0 ? (
                  <p className={`text-sm ${TXT_FAINT}`}>No investment accounts on linked institutions.</p>
                ) : (
                  <div className="space-y-3">
                    {investmentDocs.map(doc => (
                      <div key={doc.path} className={`${GLASS_SOFT} p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-xs ${TXT_FAINT}`}>{doc.data?.institution?.name ?? 'Institution'}</p>
                          <p className={`text-sm font-semibold ${TXT}`}>{fmtMoney(doc.data?.total_value)}</p>
                        </div>
                        {(doc.data?.holdings ?? []).slice(0, 6).map((h: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-0.5 text-sm">
                            <span className="text-(--dp-text-secondary) truncate mr-3">
                              {h.ticker ? <span className={`font-mono text-xs ${TXT_MUTED} mr-1.5`}>{h.ticker}</span> : null}
                              {h.name ?? 'Holding'}
                            </span>
                            <span className={`${TXT_MUTED} whitespace-nowrap`}>{fmtMoney(h.value, 2)}</span>
                          </div>
                        ))}
                        {(doc.data?.holdings ?? []).length > 6 && (
                          <p className={`text-[11px] ${TXT_FAINT} mt-1`}>
                            +{(doc.data?.holdings ?? []).length - 6} more — see Data Explorer
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Data Explorer (file-system browser over plaid_nodes)
// ══════════════════════════════════════════════════════════════

const KIND_ICONS: Record<string, React.ElementType> = {
  summary: FileJson,
  identity: User,
  account: Banknote,
  transactions: Activity,
  cash_flow: TrendingUp,
  liabilities: CreditCard,
  underwriting_inputs: Zap,
  investments: PieChart,
  recurring: Repeat,
  identity_verification: ShieldCheck,
  asset_report: FileJson,
  recommendation: Gauge,
};

function DataExplorer({
  initialPath, onClearInitial,
}: {
  initialPath: string | null;
  onClearInitial: () => void;
}) {
  const nodes = usePlaidNodes();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['/prospects']));
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showRaw, setShowRaw] = useState(false);

  const byPath = useMemo(() => new Map(nodes.map(n => [n.path, n])), [nodes]);
  const children = useMemo(() => {
    const map = new Map<string, PlaidNode[]>();
    for (const n of nodes) {
      const key = n.parentPath ?? '__root__';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(n);
    }
    for (const list of map.values()) {
      list.sort((a, b) =>
        a.nodeType !== b.nodeType ? (a.nodeType === 'folder' ? -1 : 1) : a.name.localeCompare(b.name),
      );
    }
    return map;
  }, [nodes]);

  // Deep-link from the Prospects tab ("Open in Explorer").
  useEffect(() => {
    if (!initialPath) return;
    const parts = initialPath.split('/').filter(Boolean);
    const next = new Set(expanded);
    let acc = '';
    for (const p of parts) {
      acc += `/${p}`;
      next.add(acc);
    }
    setExpanded(next);
    setSelected(initialPath);
    onClearInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPath]);

  const toggle = (path: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const matches = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return nodes
      .filter(n => n.path.toLowerCase().includes(q) || n.name.toLowerCase().includes(q))
      .slice(0, 50);
  }, [nodes, query]);

  const renderTree = (parentKey: string, depth: number): React.ReactNode => {
    const list = children.get(parentKey) ?? [];
    return list.map(n => {
      const isFolder = n.nodeType === 'folder';
      const isOpen = expanded.has(n.path);
      const isSelected = selected === n.path;
      const Icon = isFolder ? (isOpen ? FolderOpen : Folder) : KIND_ICONS[n.docKind ?? ''] ?? FileJson;
      return (
        <div key={n.path}>
          <button
            onClick={() => {
              if (isFolder) toggle(n.path);
              setSelected(n.path);
            }}
            className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-left text-sm truncate ${
              isSelected ? 'bg-[#2E6BFF]/20 text-[var(--dp-accent-text)]' : `text-(--dp-text-secondary) ${GLASS_HOVER}`
            }`}
            style={{ paddingLeft: `${8 + depth * 14}px` }}
            title={n.path}
          >
            {isFolder ? (
              isOpen ? <ChevronDown className="w-3.5 h-3.5 text-(--dp-text-faint) flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-(--dp-text-faint) flex-shrink-0" />
            ) : (
              <span className="w-3.5" />
            )}
            <Icon className={`w-4 h-4 flex-shrink-0 ${isFolder ? 'text-amber-400' : 'text-[#8FB0FF]'}`} />
            <span className="truncate">{n.name}</span>
          </button>
          {isFolder && isOpen && renderTree(n.path, depth + 1)}
        </div>
      );
    });
  };

  const selectedNode = selected ? byPath.get(selected) ?? null : null;
  const crumbs = useMemo(() => {
    if (!selected) return [];
    const parts = selected.split('/').filter(Boolean);
    const out: { path: string; label: string }[] = [];
    let acc = '';
    for (const p of parts) {
      acc += `/${p}`;
      out.push({ path: acc, label: byPath.get(acc)?.name ?? p });
    }
    return out;
  }, [selected, byPath]);

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-4">
      {/* Tree pane */}
      <div className={`${GLASS} p-3 lg:h-[640px] overflow-y-auto`}>
        <div className="relative mb-2">
          <Search className="w-4 h-4 text-(--dp-text-faint) absolute left-2.5 top-2.5" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search paths…"
            className={`w-full pl-8 pr-3 py-2 ${INPUT_GLASS}`}
          />
        </div>
        {matches ? (
          <div className="space-y-0.5">
            {matches.length === 0 && <p className={`text-xs ${TXT_FAINT} p-2`}>No matches.</p>}
            {matches.map(n => (
              <button
                key={n.path}
                onClick={() => { setSelected(n.path); setQuery(''); }}
                className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-left text-sm text-(--dp-text-secondary) ${GLASS_HOVER}`}
                title={n.path}
              >
                {n.nodeType === 'folder'
                  ? <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  : <FileJson className="w-4 h-4 text-[#8FB0FF] flex-shrink-0" />}
                <span className="truncate">{n.path}</span>
              </button>
            ))}
          </div>
        ) : nodes.length === 0 ? (
          <p className={`text-xs ${TXT_FAINT} p-2`}>
            The vault is empty — connect a prospect's bank and folders will appear here automatically.
          </p>
        ) : (
          renderTree('__root__', 0)
        )}
      </div>

      {/* Content pane */}
      <div className={`${GLASS} p-4 lg:h-[640px] overflow-y-auto`}>
        {!selectedNode ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <FolderTree className="w-10 h-10 text-(--dp-text-muted) mb-3" />
            <p className={`text-sm ${TXT_MUTED}`}>Select a folder or document from the tree.</p>
            <p className={`text-xs ${TXT_FAINT} mt-1`}>
              Everything Plaid pulls is filed under <code className="bg-white/[0.06] px-1 rounded">/prospects/&lt;lead&gt;/…</code>
            </p>
          </div>
        ) : (
          <>
            {/* Breadcrumbs */}
            <div className={`flex items-center flex-wrap gap-1 text-xs ${TXT_MUTED} mb-3`}>
              {crumbs.map((c, i) => (
                <React.Fragment key={c.path}>
                  {i > 0 && <ChevronRight className="w-3 h-3 text-(--dp-text-faint)" />}
                  <button onClick={() => setSelected(c.path)} className="hover:text-[var(--dp-accent-text)]">
                    {c.label}
                  </button>
                </React.Fragment>
              ))}
              <button
                onClick={() => { navigator.clipboard?.writeText(selectedNode.path); toast.success('Path copied'); }}
                className="ml-2 p-1 rounded hover:bg-white/[0.08]"
                title="Copy path"
              >
                <Copy className="w-3 h-3 text-(--dp-text-faint)" />
              </button>
            </div>

            {selectedNode.nodeType === 'folder' ? (
              <FolderListing
                node={selectedNode}
                items={children.get(selectedNode.path) ?? []}
                onOpen={p => {
                  setSelected(p);
                  setExpanded(prev => new Set(prev).add(selectedNode.path));
                }}
              />
            ) : (
              <DocumentViewer node={selectedNode} showRaw={showRaw} onToggleRaw={() => setShowRaw(v => !v)} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FolderListing({
  node, items, onOpen,
}: {
  node: PlaidNode;
  items: PlaidNode[];
  onOpen: (path: string) => void;
}) {
  return (
    <div>
      <h3 className={`text-base font-semibold ${TXT} mb-1 flex items-center gap-2`}>
        <FolderOpen className="w-5 h-5 text-amber-400" /> {node.name}
      </h3>
      <p className={`text-xs ${TXT_FAINT} mb-4 font-mono`}>{node.path}</p>
      {items.length === 0 ? (
        <p className={`text-sm ${TXT_FAINT}`}>Empty folder.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className={`text-left text-xs ${TXT_FAINT} border-b border-(--dp-border)`}>
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">Type</th>
              <th className="py-2 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.map(c => {
              const Icon = c.nodeType === 'folder' ? Folder : KIND_ICONS[c.docKind ?? ''] ?? FileJson;
              return (
                <tr
                  key={c.path}
                  onClick={() => onOpen(c.path)}
                  className="border-b border-(--dp-border) hover:bg-(--dp-bg-raised) cursor-pointer"
                >
                  <td className="py-2">
                    <span className="inline-flex items-center gap-2 text-(--dp-text-secondary)">
                      <Icon className={`w-4 h-4 ${c.nodeType === 'folder' ? 'text-amber-400' : 'text-[#8FB0FF]'}`} />
                      {c.name}
                    </span>
                  </td>
                  <td className={`py-2 ${TXT_MUTED}`}>{c.nodeType === 'folder' ? 'Folder' : (c.docKind ?? 'document')}</td>
                  <td className={`py-2 ${TXT_FAINT}`}>{timeAgo(c.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function DocumentViewer({
  node, showRaw, onToggleRaw,
}: {
  node: PlaidNode;
  showRaw: boolean;
  onToggleRaw: () => void;
}) {
  const Icon = KIND_ICONS[node.docKind ?? ''] ?? FileJson;
  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className={`text-base font-semibold ${TXT} flex items-center gap-2`}>
          <Icon className="w-5 h-5 text-[#8FB0FF]" /> {node.name}
        </h3>
        <button
          onClick={onToggleRaw}
          className="px-2.5 py-1 rounded-lg border border-(--dp-border) bg-white/[0.05] text-xs text-(--dp-text-secondary) hover:bg-(--dp-bg-raised) flex-shrink-0"
        >
          {showRaw ? 'Pretty view' : 'Raw JSON'}
        </button>
      </div>
      <p className={`text-xs ${TXT_FAINT} mb-4 font-mono`}>{node.path} · {node.docKind ?? 'document'} · updated {timeAgo(node.updatedAt)}</p>

      {showRaw ? (
        <pre className="text-xs bg-black/40 border border-(--dp-border) text-(--dp-text-secondary) rounded-xl p-4 overflow-x-auto max-h-[440px] overflow-y-auto">
          {JSON.stringify(node.data, null, 2)}
        </pre>
      ) : node.docKind === 'recommendation' ? (
        <RecommendationView rec={node.data} />
      ) : node.docKind === 'transactions' ? (
        <TransactionsTable data={node.data} />
      ) : node.docKind === 'cash_flow' ? (
        <div className="space-y-4">
          <CashFlowChart monthly={node.data?.monthly ?? []} />
          <BalanceChart series={node.data?.balanceSeries ?? []} />
          <KeyValueGrid obj={node.data?.metrics ?? {}} />
        </div>
      ) : (
        <KeyValueGrid obj={node.data ?? {}} />
      )}
    </div>
  );
}

function TransactionsTable({ data }: { data: any }) {
  const txs: any[] = data?.transactions ?? [];
  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-sm">
        <span className="text-emerald-400 font-medium">In {fmtMoney(data?.inflows)}</span>
        <span className="text-[#8FB0FF] font-medium">Out {fmtMoney(data?.outflows)}</span>
        <span className={TXT_FAINT}>{txs.length} transactions</span>
      </div>
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto border border-(--dp-border) rounded-xl">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[var(--dp-bg-surface)]">
            <tr className={`text-left text-xs ${TXT_FAINT}`}>
              <th className="py-2 px-3 font-medium">Date</th>
              <th className="py-2 px-3 font-medium">Description</th>
              <th className="py-2 px-3 font-medium">Category</th>
              <th className="py-2 px-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {txs.map(t => (
              <tr key={t.transaction_id} className="border-t border-(--dp-border)">
                <td className={`py-1.5 px-3 ${TXT_MUTED} whitespace-nowrap`}>{t.date}</td>
                <td className="py-1.5 px-3 text-(--dp-text-secondary)">{t.merchant_name || t.name}</td>
                <td className={`py-1.5 px-3 ${TXT_FAINT} text-xs`}>{t.personal_finance_category?.primary ?? '—'}</td>
                <td className={`py-1.5 px-3 text-right font-medium whitespace-nowrap ${t.amount < 0 ? 'text-emerald-400' : 'text-(--dp-text-secondary)'}`}>
                  {t.amount < 0 ? '+' : '−'}{fmtMoney(Math.abs(t.amount), 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeyValueGrid({ obj }: { obj: Record<string, any> }) {
  const entries = Object.entries(obj ?? {});
  if (!entries.length) return <p className={`text-sm ${TXT_FAINT}`}>Empty document.</p>;
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {entries.map(([k, v]) => (
        <div key={k} className={`${GLASS_SOFT} p-3 overflow-hidden`}>
          <p className={`text-xs ${TXT_FAINT}`}>{k.replace(/_/g, ' ')}</p>
          <div className="text-sm text-(--dp-text-secondary) mt-0.5 break-words">
            {v == null ? (
              '—'
            ) : typeof v === 'object' ? (
              <pre className={`text-xs ${TXT_MUTED} whitespace-pre-wrap max-h-32 overflow-y-auto`}>{JSON.stringify(v, null, 1)}</pre>
            ) : typeof v === 'boolean' ? (
              v ? <span className="text-emerald-400">Yes</span> : <span className={TXT_MUTED}>No</span>
            ) : (
              String(v)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Connections tab
// ══════════════════════════════════════════════════════════════

function SandboxConnectButton({ leadId }: { leadId: string }) {
  const status = usePlaidStatus();
  const { busy } = usePlaidSync();
  // Render only once status confirms sandbox — the server rejects this
  // route in any other env, so don't show a button that can only error.
  if (status?.env !== 'sandbox') return null;
  return (
    <button
      onClick={() => plaidActions.sandboxQuickConnect(leadId)}
      disabled={busy.includes(`exchange:${leadId}`)}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-purple-400/30 bg-purple-400/10 text-purple-300 text-sm font-medium hover:bg-purple-400/20 disabled:opacity-50"
      title="Creates a Plaid sandbox test bank instantly (no Link UI)"
    >
      <Zap className="w-4 h-4" /> Sandbox test connect
    </button>
  );
}

function ConnectionsTab() {
  const items = usePlaidItems();
  const leads = useLeads();
  const status = usePlaidStatus();
  const { busy } = usePlaidSync();
  const [leadId, setLeadId] = useState('');

  const leadName = (id: string | null) => leads.find(l => l.id === id)?.businessName ?? id ?? '—';
  const unconnected = leads.filter(l => !items.some(i => i.leadId === l.id));

  return (
    <div className="space-y-4">
      {/* Connect card */}
      <div className={`${GLASS} p-4`}>
        <h3 className={`text-sm font-semibold ${TXT} mb-1`}>Connect a prospect's bank</h3>
        <p className={`text-xs ${TXT_FAINT} mb-3`}>
          Pick a lead, then launch Plaid Link. On success we pull identity, account & routing verification,
          transactions, and liabilities, and file it all under <code className="bg-white/[0.06] px-1 rounded">/prospects/&lt;lead&gt;/…</code>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={leadId}
            onChange={e => setLeadId(e.target.value)}
            className={`px-3 py-2 min-w-[240px] ${INPUT_GLASS}`}
          >
            <option value="">Select a lead…</option>
            {unconnected.map(l => (
              <option key={l.id} value={l.id}>{l.businessName} ({l.id})</option>
            ))}
            {items.length > 0 && <option disabled>── already connected ──</option>}
            {leads.filter(l => items.some(i => i.leadId === l.id)).map(l => (
              <option key={l.id} value={l.id}>{l.businessName} ({l.id})</option>
            ))}
          </select>
          {leadId ? (
            <>
              <PlaidLinkButton leadId={leadId} />
              <SandboxConnectButton leadId={leadId} />
            </>
          ) : (
            <span className={`text-xs ${TXT_FAINT}`}>Choose a lead to enable Link.</span>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className={`${GLASS} overflow-hidden`}>
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04]">
            <tr className={`text-left text-xs ${TXT_FAINT}`}>
              <th className="py-2.5 px-4 font-medium">Institution</th>
              <th className="py-2.5 px-4 font-medium">Prospect</th>
              <th className="py-2.5 px-4 font-medium">Products</th>
              <th className="py-2.5 px-4 font-medium">Status</th>
              <th className="py-2.5 px-4 font-medium">Last synced</th>
              <th className="py-2.5 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className={`py-10 text-center text-sm ${TXT_FAINT}`}>
                  No Plaid connections yet.
                </td>
              </tr>
            )}
            {items.map(it => (
              <tr key={it.id} className="border-t border-white/[0.06]">
                <td className="py-2.5 px-4">
                  <span className="inline-flex items-center gap-2 text-(--dp-text) font-medium">
                    <Landmark className="w-4 h-4 text-[#8FB0FF]" />
                    {it.institutionName ?? it.itemKey}
                  </span>
                  <p className={`text-[11px] ${TXT_FAINT} font-mono ml-6`}>{it.itemId.slice(0, 24)}…</p>
                </td>
                <td className="py-2.5 px-4 text-(--dp-text-secondary)">{leadName(it.leadId)}</td>
                <td className={`py-2.5 px-4 ${TXT_MUTED} text-xs`}>{it.products.join(', ')}</td>
                <td className="py-2.5 px-4">
                  {it.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                  ) : it.status === 'error' ? (
                    <span className="inline-flex items-center gap-1 text-red-400 text-xs" title={it.error ?? ''}><AlertTriangle className="w-3.5 h-3.5" /> Error</span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 ${TXT_FAINT} text-xs`}><XCircle className="w-3.5 h-3.5" /> Disconnected</span>
                  )}
                </td>
                <td className={`py-2.5 px-4 ${TXT_MUTED} text-xs`}>{timeAgo(it.lastSyncedAt)}</td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => plaidActions.syncItem(it.itemId)}
                      disabled={busy.includes(`sync:${it.itemId}`)}
                      className="p-1.5 rounded-lg border border-(--dp-border) text-(--dp-text-secondary) hover:bg-(--dp-bg-raised) disabled:opacity-50"
                      title="Sync now"
                    >
                      <RefreshCw className={`w-4 h-4 ${busy.includes(`sync:${it.itemId}`) ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Disconnect ${it.institutionName ?? it.itemKey} and delete its vault data?`)) {
                          plaidActions.removeItem(it.itemId);
                        }
                      }}
                      disabled={busy.includes(`remove:${it.itemId}`)}
                      className="p-1.5 rounded-lg border border-(--dp-border) text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                      title="Disconnect"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Config card */}
      <div className={`${GLASS} p-4`}>
        <h3 className={`text-sm font-semibold ${TXT} mb-2`}>Integration status</h3>
        {status ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
            <MetricTile
              label="Plaid credentials"
              value={status.configured
                ? <span className="text-emerald-400">Configured</span>
                : <span className="text-red-400">Missing</span>}
            />
            <MetricTile label="Environment" value={status.env} />
            <MetricTile label="Products" value={status.products.join(', ') || '—'} sub="+ liabilities & investments when supported" />
            <MetricTile
              label="Webhook URL"
              value={
                <button
                  onClick={() => { navigator.clipboard?.writeText(status.webhookUrl); toast.success('Webhook URL copied'); }}
                  className="text-[#8FB0FF] text-xs underline break-all text-left"
                >
                  {status.webhookUrl || '—'}
                </button>
              }
              sub="Attached to every connection automatically"
            />
          </div>
        ) : (
          <p className={`text-sm ${TXT_FAINT}`}>Sign in as staff to read integration status.</p>
        )}
        {status && !status.configured && (
          <div className="mt-3 border border-amber-400/30 bg-amber-400/10 rounded-xl p-3 text-xs text-amber-200">
            Add <code className="font-mono">PLAID_CLIENT_ID</code>, <code className="font-mono">PLAID_SECRET</code> and
            {' '}<code className="font-mono">PLAID_ENV</code> (sandbox / production) under
            {' '}<span className="font-medium">Supabase → Project Settings → Edge Functions → Secrets</span>,
            using the keys from your Plaid developer portal. The vault activates immediately — no redeploy needed.
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Page
// ══════════════════════════════════════════════════════════════

type TabKey = 'prospects' | 'explorer' | 'connections';

export function BackendPlaid() {
  const prospects = useProspects();
  const items = usePlaidItems();
  const nodes = usePlaidNodes();
  const status = usePlaidStatus();
  const { isLoading, busy } = usePlaidSync();

  const [tab, setTab] = useState<TabKey>('prospects');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [explorerPath, setExplorerPath] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const connected = prospects.filter(p => p.items.length > 0);
  const totalRevenue = connected.reduce((s, p) => s + (p.plaidInputs?.monthlyRevenue ?? 0), 0);
  const verifiedIdentities = connected.filter(p => p.summary?.identity_verified).length;
  const preApproved = connected.filter(p => p.recommendation?.decision === 'PRE_APPROVE').length;

  const filtered = prospects.filter(p =>
    !search.trim() ||
    p.lead.businessName.toLowerCase().includes(search.toLowerCase()) ||
    p.lead.id.toLowerCase().includes(search.toLowerCase()),
  );
  const detail = selectedLead ? prospects.find(p => p.lead.id === selectedLead) ?? null : null;

  const openInExplorer = (path: string) => {
    setExplorerPath(path);
    setTab('explorer');
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-4 sm:p-6 -m-1"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-32 left-1/4 w-[480px] h-[480px] rounded-full bg-[#2E6BFF]/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 w-[420px] h-[420px] rounded-full bg-[#2a6bff]/10 blur-[120px]" />

      <div className="relative space-y-6">
        {/* Resume an OAuth-interrupted Link flow, if one is stashed. */}
        <PlaidOAuthResume />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight ${TXT} flex items-center gap-2.5`}>
              <span className="w-9 h-9 rounded-xl bg-[#2E6BFF]/20 border border-[#2E6BFF]/40 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-[#8FB0FF]" />
              </span>
              Plaid Data Vault
            </h1>
            <p className={`text-sm ${TXT_MUTED} mt-1`}>
              Live bank, identity, financial and credit data for lending prospects — organized as a hierarchical file system.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => plaidActions.refresh()} className={BTN_GLASS}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={() => plaidActions.syncAll()}
              disabled={busy.includes('sync:all') || items.length === 0}
              className={BTN_PRIMARY}
            >
              <RefreshCw className={`w-4 h-4 ${busy.includes('sync:all') ? 'animate-spin' : ''}`} />
              Sync all connections
            </button>
          </div>
        </div>

        {/* Not-configured banner */}
        {status && !status.configured && (
          <div className="border border-amber-400/30 bg-amber-400/10 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-200">
              <p className="font-medium">Plaid credentials not configured yet</p>
              <p className="text-xs mt-1 text-amber-200/80">
                Add <code className="font-mono">PLAID_CLIENT_ID</code> and <code className="font-mono">PLAID_SECRET</code> from
                your Plaid developer portal as Supabase Edge Function secrets (plus <code className="font-mono">PLAID_ENV</code>=
                sandbox or production). See the Connections tab for details.
              </p>
            </div>
          </div>
        )}

        {/* Environment warnings */}
        {status && !status.envValid && (
          <div className="border border-red-400/30 bg-red-400/10 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-200">
              <p className="font-medium">PLAID_ENV is set to an unrecognized value ("{status.env}")</p>
              <p className="text-xs mt-1 text-red-200/80">
                All Plaid calls are blocked until the <code className="font-mono">PLAID_ENV</code> secret is set to
                {' '}<code className="font-mono">sandbox</code> or <code className="font-mono">production</code>.
              </p>
            </div>
          </div>
        )}
        {status && status.envValid && status.envSource === 'default' && (
          <div className="border border-amber-400/30 bg-amber-400/10 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-200">
              <p className="font-medium">PLAID_ENV is not set — defaulting to sandbox</p>
              <p className="text-xs mt-1 text-amber-200/80">
                Set the <code className="font-mono">PLAID_ENV</code> Edge Function secret explicitly
                (<code className="font-mono">sandbox</code> or <code className="font-mono">production</code>) so the
                environment is never ambiguous.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatTile label="Connected Prospects" value={`${connected.length}/${prospects.length}`} icon={<Link2 className="w-5 h-5" />} glow />
          <StatTile label="Verified Identities" value={verifiedIdentities} icon={<ShieldCheck className="w-5 h-5" />} />
          <StatTile label="Combined Monthly Revenue" value={fmtMoney(totalRevenue)} icon={<Banknote className="w-5 h-5" />} glow />
          <StatTile label="Pre-Approved (model)" value={connected.length ? preApproved : '—'} icon={<Gauge className="w-5 h-5" />} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5">
          {([
            ['prospects', 'Lending Prospects', Landmark],
            ['explorer', 'Data Explorer', FolderTree],
            ['connections', 'Connections', Link2],
          ] as [TabKey, string, React.ElementType][]).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => { setTab(key); if (key !== 'prospects') setSelectedLead(null); }}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${
                tab === key
                  ? 'bg-[#2E6BFF]/20 border-[#2E6BFF]/50 text-[var(--dp-accent-text)]'
                  : 'bg-white/[0.04] border-(--dp-border) text-(--dp-text-muted) hover:text-(--dp-text-secondary) hover:bg-white/[0.08]'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
              {key === 'explorer' && nodes.length > 0 && (
                <span className="text-[10px] bg-white/[0.1] text-(--dp-text-secondary) rounded-full px-1.5 py-0.5">{nodes.length}</span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className={`py-20 text-center text-sm ${TXT_FAINT}`}>Loading Plaid vault…</div>
        ) : tab === 'explorer' ? (
          <DataExplorer initialPath={explorerPath} onClearInitial={() => setExplorerPath(null)} />
        ) : tab === 'connections' ? (
          <ConnectionsTab />
        ) : detail ? (
          <ProspectDetail
            prospect={detail}
            onBack={() => setSelectedLead(null)}
            onOpenInExplorer={openInExplorer}
          />
        ) : (
          <div className="space-y-3">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-(--dp-text-faint) absolute left-3 top-2.5" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search prospects…"
                className={`w-full pl-9 pr-3 py-2 ${INPUT_GLASS}`}
              />
            </div>
            <div className={`${GLASS} overflow-x-auto`}>
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-white/[0.04]">
                  <tr className={`text-left text-xs ${TXT_FAINT}`}>
                    <th className="py-2.5 px-4 font-medium">Prospect</th>
                    <th className="py-2.5 px-4 font-medium">Requested</th>
                    <th className="py-2.5 px-4 font-medium">Connection</th>
                    <th className="py-2.5 px-4 font-medium">Identity</th>
                    <th className="py-2.5 px-4 font-medium">Monthly Revenue</th>
                    <th className="py-2.5 px-4 font-medium">Avg Balance</th>
                    <th className="py-2.5 px-4 font-medium">NSF 90d</th>
                    <th className="py-2.5 px-4 font-medium">Score</th>
                    <th className="py-2.5 px-4 font-medium">Model Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className={`py-12 text-center text-sm ${TXT_FAINT}`}>
                        No leads found. Add leads in the Pipeline first — each lead becomes a lending prospect here.
                      </td>
                    </tr>
                  )}
                  {filtered.map(p => {
                    const m = p.cashFlow?.metrics;
                    const modelScore = p.recommendation?.score?.total ?? null;
                    return (
                      <tr
                        key={p.lead.id}
                        onClick={() => setSelectedLead(p.lead.id)}
                        className="border-t border-white/[0.06] hover:bg-(--dp-bg-raised) cursor-pointer"
                      >
                        <td className="py-2.5 px-4">
                          <p className="font-medium text-(--dp-text)">{p.lead.businessName}</p>
                          <p className={`text-[11px] ${TXT_FAINT}`}>{p.lead.id} · {p.lead.industry}</p>
                        </td>
                        <td className="py-2.5 px-4 text-(--dp-text-secondary)">{p.lead.amountRequested || '—'}</td>
                        <td className="py-2.5 px-4" onClick={e => e.stopPropagation()}>
                          {p.items.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {p.items.length} bank{p.items.length > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <PlaidLinkButton leadId={p.lead.id} compact />
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          {p.summary?.identity_verified ? (
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          ) : p.items.length > 0 ? (
                            <ShieldAlert className="w-4 h-4 text-amber-400" />
                          ) : (
                            <span className="text-(--dp-text-muted)">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-(--dp-text-secondary)">
                          {m ? (
                            <span className="inline-flex items-center gap-1.5">
                              {fmtMoney(m.monthlyRevenue)} <TrendIcon trend={m.revenueTrend} />
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-(--dp-text-secondary)">{m ? fmtMoney(m.avgDailyBalance) : '—'}</td>
                        <td className="py-2.5 px-4">
                          {m ? (
                            <span className={m.nsfCount90d > 0 ? 'text-red-400 font-medium' : 'text-(--dp-text-secondary)'}>
                              {m.nsfCount90d}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-2.5 px-4">
                          {modelScore != null ? (
                            <span className={`font-semibold ${
                              modelScore >= 65 ? 'text-emerald-400' : modelScore >= 50 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {modelScore}
                            </span>
                          ) : p.plaidScore ? (
                            <span className={`font-semibold ${
                              p.plaidScore.total >= 70 ? 'text-emerald-400' : p.plaidScore.total >= 45 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {p.plaidScore.total}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-2.5 px-4">
                          <ModelDecisionBadge decision={p.recommendation?.decision ?? (p.prelim ? (
                            p.prelim.decision === 'Auto-Approve' ? 'PRE_APPROVE'
                            : p.prelim.decision === 'Auto-Decline' ? 'DECLINE'
                            : 'REVIEW'
                          ) : null)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
