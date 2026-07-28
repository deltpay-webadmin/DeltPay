import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import {
  Landmark, FolderTree, Link2, RefreshCw, Search, ChevronRight, ChevronDown,
  Folder, FolderOpen, FileJson, ShieldCheck, ShieldAlert, Banknote, User,
  CreditCard, TrendingUp, TrendingDown, Minus, ArrowLeft, Trash2, Copy,
  AlertTriangle, CheckCircle2, XCircle, Clock, Zap, Send, Wallet, Activity,
  PieChart, Repeat,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner@2.0.3';
import { useLeads, underwritingActions, type Lead } from '../crmStore';
import {
  usePlaidItems, usePlaidNodes, usePlaidStatus, usePlaidSync, plaidActions,
  type PlaidItem, type PlaidNode,
} from '../plaidStore';
import {
  scorePlaid, evaluateApplication, defaultScoreInputs,
  type PlaidInputs, type SubScoreBreakdown, type ScoringResult,
} from '../underwritingScore';
import { StatCard } from '../../shared/StatCard';

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

// Chart series colors — validated pair (inflows emerald / outflows blue).
const CHART_IN = '#059669';
const CHART_OUT = '#2563eb';

// ══════════════════════════════════════════════════════════════
// Plaid Link launcher
// ══════════════════════════════════════════════════════════════

/** Mounted only once a link_token exists; auto-opens the Plaid Link modal. */
function PlaidLinkOpener({
  token, onSuccess, onExit,
}: {
  token: string;
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit: () => void;
}) {
  const { open, ready } = usePlaidLink({ token, onSuccess, onExit });
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
            ? 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50'
            : 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50'
        }
      >
        <Link2 className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
        {busy ? 'Starting…' : 'Connect bank'}
      </button>
      {token && (
        <PlaidLinkOpener token={token} onSuccess={onSuccess} onExit={() => setToken(null)} />
      )}
    </>
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
      const plaidInputs: PlaidInputs | null = uwDoc?.plaidInputs ?? null;
      let plaidScore: SubScoreBreakdown | null = null;
      let prelim: ScoringResult | null = null;
      if (plaidInputs) {
        plaidScore = scorePlaid(plaidInputs);
        // Seed engine defaults with what Plaid actually observed — including
        // loan/MCA payment streams detected in recurring transactions.
        const seeded = defaultScoreInputs({
          monthlyRevenue: plaidInputs.monthlyRevenue || undefined,
          avgDailyBalance: plaidInputs.avgDailyBalance || undefined,
          existingPositions: uwDoc?.detected?.debt_positions || undefined,
        });
        prelim = evaluateApplication({ ...seeded, plaid: plaidInputs });
      }
      return { lead, items: leadItems, summary, cashFlow, plaidInputs, plaidScore, prelim };
    });
  }, [leads, items, nodes]);
}

function DecisionBadge({ decision }: { decision: ScoringResult['decision'] | null }) {
  if (!decision) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-50 border border-gray-200 text-gray-500">
        <Clock className="w-3 h-3" /> No data
      </span>
    );
  }
  const cfg =
    decision === 'Auto-Approve'
      ? { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', Icon: CheckCircle2 }
      : decision === 'Auto-Decline'
        ? { bg: 'bg-red-50 border-red-200 text-red-700', Icon: XCircle }
        : { bg: 'bg-amber-50 border-amber-200 text-amber-700', Icon: AlertTriangle };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${cfg.bg}`}>
      <cfg.Icon className="w-3 h-3" /> {decision}
    </span>
  );
}

function TrendIcon({ trend }: { trend?: string }) {
  if (trend === 'growing') return <TrendingUp className="w-4 h-4 text-emerald-600" />;
  if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-600" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
}

// ══════════════════════════════════════════════════════════════
// Charts
// ══════════════════════════════════════════════════════════════

function CashFlowChart({ monthly }: { monthly: any[] }) {
  const data = (monthly ?? []).slice(-12).map(m => ({
    month: m.month,
    Inflows: m.inflows,
    Outflows: m.outflows,
  }));
  if (!data.length) return <p className="text-sm text-gray-400 py-8 text-center">No transaction history yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
        />
        <RTooltip formatter={(v: any) => fmtMoney(Number(v))} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
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
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} interval={13} />
        <YAxis
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
        />
        <RTooltip formatter={(v: any) => fmtMoney(Number(v), 2)} />
        <Line type="monotone" dataKey="Balance" stroke={CHART_OUT} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ══════════════════════════════════════════════════════════════
// Prospect detail
// ══════════════════════════════════════════════════════════════

function MetricTile({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ProspectDetail({
  prospect, onBack, onOpenInExplorer,
}: {
  prospect: ProspectRollup;
  onBack: () => void;
  onOpenInExplorer: (path: string) => void;
}) {
  const nodes = usePlaidNodes();
  const { busy } = usePlaidSync();
  const { lead, items, summary, cashFlow, plaidInputs, plaidScore, prelim } = prospect;
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
          <button onClick={onBack} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{lead.businessName}</h2>
            <p className="text-xs text-gray-500">
              {lead.industry} · Requested {lead.amountRequested || '—'} · {items.length} Plaid connection{items.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenInExplorer(base)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FolderTree className="w-4 h-4" /> Open in Explorer
          </button>
          <button
            onClick={() => plaidActions.syncAll(lead.id)}
            disabled={busy.includes('sync:all') || items.length === 0}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" /> Sync
          </button>
          <PlaidLinkButton leadId={lead.id} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
          <Landmark className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">No bank connected yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Connect this prospect's bank via Plaid Link to pull identity, account verification, financials and credit data.
          </p>
          <div className="flex items-center justify-center gap-2">
            <PlaidLinkButton leadId={lead.id} />
            <SandboxConnectButton leadId={lead.id} />
          </div>
        </div>
      ) : (
        <>
          {/* Verification + decision strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className={`rounded-xl border p-4 ${summary?.identity_verified ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                {summary?.identity_verified
                  ? <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  : <ShieldAlert className="w-4 h-4 text-amber-600" />}
                Identity
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {summary?.identity_verified ? 'Verified via Plaid Identity' : 'Not verified yet'}
              </p>
            </div>
            <div className={`rounded-xl border p-4 ${summary?.bank_verified ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <Banknote className={`w-4 h-4 ${summary?.bank_verified ? 'text-emerald-600' : 'text-amber-600'}`} />
                Bank Accounts
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {summary?.accounts ?? 0} account(s) · {summary?.bank_verified ? 'ACH verified' : 'unverified'}
              </p>
            </div>
            <div className="rounded-xl border bg-blue-50 border-blue-100 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <Wallet className="w-4 h-4 text-blue-600" /> Balance
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {fmtMoney(summary?.depository_balance)} across depository accounts
              </p>
            </div>
            <div className="rounded-xl border bg-purple-50 border-purple-100 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <Activity className="w-4 h-4 text-purple-600" /> Plaid Cash-Flow Score
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {plaidScore ? `${plaidScore.total}/100` : 'pending data'} · <DecisionBadge decision={prelim?.decision ?? null} />
              </p>
            </div>
          </div>

          {/* Financials */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Monthly cash flow</h3>
              <p className="text-xs text-gray-400 mb-3">Money in vs money out, from Plaid transactions</p>
              <CashFlowChart monthly={cashFlow?.monthly ?? []} />
              <h3 className="text-sm font-semibold text-gray-900 mt-4 mb-1">Daily balance (90d, reconstructed)</h3>
              <BalanceChart series={cashFlow?.balanceSeries ?? []} />
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Underwriting metrics</h3>
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
                      <span className={(m.detectedDebtPositions ?? 0) > 1 ? 'text-red-600' : undefined}>
                        {m.detectedDebtPositions ?? 0}
                      </span>
                    }
                    sub="from recurring outflows"
                  />
                  <MetricTile label="Recurring revenue streams" value={m.recurringRevenueStreams ?? 0} />
                  <MetricTile label="Investment assets" value={fmtMoney(m.investmentsValue ?? 0)} />
                </div>
              ) : (
                <p className="text-sm text-gray-400">Sync a connection to compute metrics.</p>
              )}

              {/* Verified Asset Report */}
              <div className="mt-4 border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Verified Asset Report</p>
                    <p className="text-[11px] text-gray-400">Plaid-certified 90-day balances & ownership</p>
                  </div>
                  {!assetReport ? (
                    <button
                      onClick={() => plaidActions.createAssetReport(lead.id)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Generate
                    </button>
                  ) : assetReport.data?.status !== 'ready' ? (
                    <button
                      onClick={() => plaidActions.refreshAssetReport(lead.id)}
                      className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-xs font-medium text-amber-700 hover:bg-amber-100"
                    >
                      Generating… check status
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  )}
                </div>
                {assetReport?.data?.status === 'ready' && (
                  <div className="mt-2 space-y-1">
                    {(assetReport.data.items ?? []).map((it: any, i: number) => (
                      <div key={i} className="text-xs text-gray-600">
                        <span className="font-medium">{it.institution_name}</span>
                        {' — '}
                        {(it.accounts ?? []).map((a: any) =>
                          `${a.name ?? 'acct'} ••${a.mask ?? ''} (${a.days_available ?? 0}d history)`
                        ).join(', ')}
                      </div>
                    ))}
                    <button
                      onClick={() => onOpenInExplorer(`${base}/financials/asset-report`)}
                      className="text-xs text-blue-600 hover:underline"
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
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" /> Identity verification
              </h3>
              {identityDocs.length === 0 && idvDocs.length === 0 && (
                <p className="text-sm text-gray-400">No identity data yet.</p>
              )}
              {idvDocs.length > 0 && (
                <div className="space-y-2 mb-3">
                  {idvDocs.map(doc => (
                    <div key={doc.path} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          doc.data?.status === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : doc.data?.status === 'failed'
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {doc.data?.status ?? 'pending'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        KYC: {doc.data?.kyc_check?.status ?? '—'} · Docs: {doc.data?.documentary_verification?.status ?? '—'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-3">
                {identityDocs.map(doc => (
                  <div key={doc.path} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">{doc.data?.institution?.name ?? 'Institution'}</p>
                    {(doc.data?.owners ?? []).map((o: any, i: number) => (
                      <div key={i} className="text-sm text-gray-700">
                        <p className="font-medium">{(o.names ?? []).join(', ') || 'Unnamed owner'}</p>
                        <p className="text-xs text-gray-500">
                          {(o.emails ?? []).map((e: any) => e.data).slice(0, 2).join(' · ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(o.phone_numbers ?? []).map((p: any) => p.data).slice(0, 2).join(' · ')}
                        </p>
                        {(o.addresses ?? []).slice(0, 1).map((a: any, j: number) => (
                          <p key={j} className="text-xs text-gray-400">
                            {[a.data?.street, a.data?.city, a.data?.region, a.data?.postal_code].filter(Boolean).join(', ')}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {/* Attach an IDV session created via your Plaid IDV template */}
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-[11px] text-gray-400 mb-1.5">
                  Ran a Plaid Identity Verification session elsewhere? Paste its ID (idv_…) to attach it.
                </p>
                <div className="flex items-center gap-1.5">
                  <input
                    value={idvInput}
                    onChange={e => setIdvInput(e.target.value)}
                    placeholder="idv_…"
                    className="flex-1 min-w-0 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button
                    onClick={() => {
                      const v = idvInput.trim();
                      if (!v) return;
                      plaidActions.attachIdv(lead.id, v).then(() => setIdvInput(''));
                    }}
                    disabled={!idvInput.trim()}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 disabled:opacity-50"
                  >
                    Attach
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-gray-400" /> Verified accounts
              </h3>
              {accountDocs.length === 0 && <p className="text-sm text-gray-400">No accounts yet.</p>}
              <div className="space-y-2">
                {accountDocs.map(doc => {
                  const a = doc.data ?? {};
                  return (
                    <div key={doc.path} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {a.name} ••{a.mask}
                          {a.verification?.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline ml-1.5 -mt-0.5" />
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {a.type}/{a.subtype}
                          {a.verification?.routing_last4 && ` · routing ••${a.verification.routing_last4}`}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{fmtMoney(a.balances?.current, 2)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" /> Credit data
              </h3>
              {liabilityDocs.length === 0 && (
                <p className="text-sm text-gray-400">
                  No liabilities reported. (Liability data appears when the linked institution supports it.)
                </p>
              )}
              <div className="space-y-3">
                {liabilityDocs.map(doc => {
                  const s = doc.data?.summary ?? {};
                  return (
                    <div key={doc.path} className="border border-gray-100 rounded-lg p-3 text-sm text-gray-700 space-y-1">
                      <p className="text-xs text-gray-400">{doc.data?.institution?.name ?? 'Institution'}</p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <MetricTile label="Credit cards" value={s.credit_cards ?? 0} />
                        <MetricTile label="Card balance" value={fmtMoney(s.total_credit_balance)} />
                        <MetricTile label="Mortgages" value={s.mortgages ?? 0} />
                        <MetricTile
                          label="Overdue"
                          value={
                            <span className={s.overdue_accounts ? 'text-red-600' : 'text-emerald-600'}>
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
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-gray-400" /> Recurring streams & obligations
                </h3>
                {recurringDocs.length === 0 ? (
                  <p className="text-sm text-gray-400">No recurring streams detected yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recurringDocs.map(doc => {
                      const inflows = (doc.data?.inflow_streams ?? []).filter((s: any) => s.is_active);
                      const outflows = (doc.data?.outflow_streams ?? []).filter((s: any) => s.is_active);
                      const isDebt = (s: any) =>
                        s.category === 'LOAN_PAYMENTS' ||
                        /loan|advance|capital|lend|funding|mca|leas(e|ing)|financ/i.test(`${s.merchant_name ?? ''} ${s.description ?? ''}`);
                      return (
                        <div key={doc.path} className="border border-gray-100 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-2">{doc.data?.institution?.name ?? 'Institution'}</p>
                          {outflows.filter(isDebt).map((s: any) => (
                            <div key={s.stream_id} className="flex items-center justify-between py-1 text-sm">
                              <span className="text-red-700 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {s.merchant_name || s.description || 'Loan payment'}
                                <span className="text-[10px] text-red-400 uppercase">{s.frequency?.toLowerCase()}</span>
                              </span>
                              <span className="font-medium text-red-700">{fmtMoney(Math.abs(s.average_amount ?? 0), 2)}</span>
                            </div>
                          ))}
                          {inflows.slice(0, 4).map((s: any) => (
                            <div key={s.stream_id} className="flex items-center justify-between py-1 text-sm">
                              <span className="text-gray-700 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                {s.merchant_name || s.description || 'Recurring deposit'}
                                <span className="text-[10px] text-gray-400 uppercase">{s.frequency?.toLowerCase()}</span>
                              </span>
                              <span className="font-medium text-emerald-600">{fmtMoney(Math.abs(s.average_amount ?? 0), 2)}</span>
                            </div>
                          ))}
                          {outflows.filter((s: any) => !isDebt(s)).length > 0 && (
                            <p className="text-[11px] text-gray-400 mt-1">
                              +{outflows.filter((s: any) => !isDebt(s)).length} other recurring outflow(s) — see Data Explorer
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-gray-400" /> Investment holdings
                </h3>
                {investmentDocs.length === 0 ? (
                  <p className="text-sm text-gray-400">No investment accounts on linked institutions.</p>
                ) : (
                  <div className="space-y-3">
                    {investmentDocs.map(doc => (
                      <div key={doc.path} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-400">{doc.data?.institution?.name ?? 'Institution'}</p>
                          <p className="text-sm font-semibold text-gray-900">{fmtMoney(doc.data?.total_value)}</p>
                        </div>
                        {(doc.data?.holdings ?? []).slice(0, 6).map((h: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-0.5 text-sm">
                            <span className="text-gray-700 truncate mr-3">
                              {h.ticker ? <span className="font-mono text-xs text-gray-500 mr-1.5">{h.ticker}</span> : null}
                              {h.name ?? 'Holding'}
                            </span>
                            <span className="text-gray-600 whitespace-nowrap">{fmtMoney(h.value, 2)}</span>
                          </div>
                        ))}
                        {(doc.data?.holdings ?? []).length > 6 && (
                          <p className="text-[11px] text-gray-400 mt-1">
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

          {/* Decisioning */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Lending decision</h3>
                <p className="text-xs text-gray-400">
                  Plaid cash-flow score is live; credit (CRS) and MCA history (DataMerch) use engine defaults until pulled — treat the composite as preliminary.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DecisionBadge decision={prelim?.decision ?? null} />
                <button
                  onClick={sendToUnderwriting}
                  disabled={!plaidInputs}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> Send to Underwriting
                </button>
              </div>
            </div>
            {plaidScore && prelim ? (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">
                    Plaid cash-flow score — <span className="font-semibold text-gray-900">{plaidScore.total}/100</span>
                  </p>
                  <div className="space-y-1.5">
                    {plaidScore.components.map(cp => (
                      <div key={cp.label} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-40 truncate">{cp.label}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.max(0, Math.min(100, (cp.points / cp.max) * 100))}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-12 text-right">{cp.points}/{cp.max}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Preliminary composite</p>
                  <p className="text-3xl font-bold text-gray-900">{prelim.composite}<span className="text-base text-gray-400 font-normal">/100</span></p>
                  <p className="text-sm text-gray-600 mt-1">{prelim.terms.label}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Suggested: {prelim.terms.holdbackMinPct}–{prelim.terms.holdbackMaxPct}% holdback ·
                    factor {prelim.terms.factorMin > 0 ? `${prelim.terms.factorMin}–${prelim.terms.factorMax}` : '—'} ·
                    max advance {fmtPct(prelim.terms.maxAdvancePctOfMonthlyRevenue)} of monthly revenue
                    {plaidInputs ? ` (~${fmtMoney(plaidInputs.monthlyRevenue * prelim.terms.maxAdvancePctOfMonthlyRevenue)})` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Disqualifiers</p>
                  {prelim.disqualifiers.length === 0 ? (
                    <p className="text-sm text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> None triggered
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {prelim.disqualifiers.map(d => (
                        <li key={d.code} className="text-sm text-red-600 flex items-start gap-1.5">
                          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{d.label}: <span className="text-red-500">{d.reason}</span></span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Connect and sync a bank to run the scoring engine.</p>
            )}
          </div>
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
            className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-left text-sm truncate ${
              isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
            style={{ paddingLeft: `${8 + depth * 14}px` }}
            title={n.path}
          >
            {isFolder ? (
              isOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            ) : (
              <span className="w-3.5" />
            )}
            <Icon className={`w-4 h-4 flex-shrink-0 ${isFolder ? 'text-amber-500' : 'text-blue-500'}`} />
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
      <div className="bg-white border border-gray-200 rounded-xl p-3 lg:h-[640px] overflow-y-auto">
        <div className="relative mb-2">
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search paths…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        {matches ? (
          <div className="space-y-0.5">
            {matches.length === 0 && <p className="text-xs text-gray-400 p-2">No matches.</p>}
            {matches.map(n => (
              <button
                key={n.path}
                onClick={() => { setSelected(n.path); setQuery(''); }}
                className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-left text-sm text-gray-700 hover:bg-gray-50"
                title={n.path}
              >
                {n.nodeType === 'folder'
                  ? <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  : <FileJson className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                <span className="truncate">{n.path}</span>
              </button>
            ))}
          </div>
        ) : nodes.length === 0 ? (
          <p className="text-xs text-gray-400 p-2">
            The vault is empty — connect a prospect's bank and folders will appear here automatically.
          </p>
        ) : (
          renderTree('__root__', 0)
        )}
      </div>

      {/* Content pane */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 lg:h-[640px] overflow-y-auto">
        {!selectedNode ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <FolderTree className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">Select a folder or document from the tree.</p>
            <p className="text-xs text-gray-400 mt-1">
              Everything Plaid pulls is filed under <code className="bg-gray-50 px-1 rounded">/prospects/&lt;lead&gt;/…</code>
            </p>
          </div>
        ) : (
          <>
            {/* Breadcrumbs */}
            <div className="flex items-center flex-wrap gap-1 text-xs text-gray-500 mb-3">
              {crumbs.map((c, i) => (
                <React.Fragment key={c.path}>
                  {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                  <button onClick={() => setSelected(c.path)} className="hover:text-blue-600">
                    {c.label}
                  </button>
                </React.Fragment>
              ))}
              <button
                onClick={() => { navigator.clipboard?.writeText(selectedNode.path); toast.success('Path copied'); }}
                className="ml-2 p-1 rounded hover:bg-gray-100"
                title="Copy path"
              >
                <Copy className="w-3 h-3 text-gray-400" />
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
      <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <FolderOpen className="w-5 h-5 text-amber-500" /> {node.name}
      </h3>
      <p className="text-xs text-gray-400 mb-4 font-mono">{node.path}</p>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Empty folder.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
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
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-2">
                    <span className="inline-flex items-center gap-2 text-gray-800">
                      <Icon className={`w-4 h-4 ${c.nodeType === 'folder' ? 'text-amber-500' : 'text-blue-500'}`} />
                      {c.name}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500">{c.nodeType === 'folder' ? 'Folder' : (c.docKind ?? 'document')}</td>
                  <td className="py-2 text-gray-400">{timeAgo(c.updatedAt)}</td>
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
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-500" /> {node.name}
        </h3>
        <button
          onClick={onToggleRaw}
          className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 flex-shrink-0"
        >
          {showRaw ? 'Pretty view' : 'Raw JSON'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-4 font-mono">{node.path} · {node.docKind ?? 'document'} · updated {timeAgo(node.updatedAt)}</p>

      {showRaw ? (
        <pre className="text-xs bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto max-h-[440px] overflow-y-auto">
          {JSON.stringify(node.data, null, 2)}
        </pre>
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
        <span className="text-emerald-600 font-medium">In {fmtMoney(data?.inflows)}</span>
        <span className="text-blue-600 font-medium">Out {fmtMoney(data?.outflows)}</span>
        <span className="text-gray-400">{txs.length} transactions</span>
      </div>
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto border border-gray-100 rounded-lg">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="text-left text-xs text-gray-400">
              <th className="py-2 px-3 font-medium">Date</th>
              <th className="py-2 px-3 font-medium">Description</th>
              <th className="py-2 px-3 font-medium">Category</th>
              <th className="py-2 px-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {txs.map(t => (
              <tr key={t.transaction_id} className="border-t border-gray-50">
                <td className="py-1.5 px-3 text-gray-500 whitespace-nowrap">{t.date}</td>
                <td className="py-1.5 px-3 text-gray-800">{t.merchant_name || t.name}</td>
                <td className="py-1.5 px-3 text-gray-400 text-xs">{t.personal_finance_category?.primary ?? '—'}</td>
                <td className={`py-1.5 px-3 text-right font-medium whitespace-nowrap ${t.amount < 0 ? 'text-emerald-600' : 'text-gray-700'}`}>
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
  if (!entries.length) return <p className="text-sm text-gray-400">Empty document.</p>;
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {entries.map(([k, v]) => (
        <div key={k} className="bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-hidden">
          <p className="text-xs text-gray-400">{k.replace(/_/g, ' ')}</p>
          <div className="text-sm text-gray-800 mt-0.5 break-words">
            {v == null ? (
              '—'
            ) : typeof v === 'object' ? (
              <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">{JSON.stringify(v, null, 1)}</pre>
            ) : typeof v === 'boolean' ? (
              v ? <span className="text-emerald-600">Yes</span> : <span className="text-gray-500">No</span>
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
  if (status && status.env !== 'sandbox') return null;
  return (
    <button
      onClick={() => plaidActions.sandboxQuickConnect(leadId)}
      disabled={busy.includes(`exchange:${leadId}`)}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 disabled:opacity-50"
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
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Connect a prospect's bank</h3>
        <p className="text-xs text-gray-400 mb-3">
          Pick a lead, then launch Plaid Link. On success we pull identity, account & routing verification,
          transactions, and liabilities, and file it all under <code className="bg-gray-50 px-1 rounded">/prospects/&lt;lead&gt;/…</code>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={leadId}
            onChange={e => setLeadId(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-w-[240px] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
            <span className="text-xs text-gray-400">Choose a lead to enable Link.</span>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-400">
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
                <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                  No Plaid connections yet.
                </td>
              </tr>
            )}
            {items.map(it => (
              <tr key={it.id} className="border-t border-gray-50">
                <td className="py-2.5 px-4">
                  <span className="inline-flex items-center gap-2 text-gray-800 font-medium">
                    <Landmark className="w-4 h-4 text-gray-400" />
                    {it.institutionName ?? it.itemKey}
                  </span>
                  <p className="text-[11px] text-gray-400 font-mono ml-6">{it.itemId.slice(0, 24)}…</p>
                </td>
                <td className="py-2.5 px-4 text-gray-700">{leadName(it.leadId)}</td>
                <td className="py-2.5 px-4 text-gray-500 text-xs">{it.products.join(', ')}</td>
                <td className="py-2.5 px-4">
                  {it.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                  ) : it.status === 'error' ? (
                    <span className="inline-flex items-center gap-1 text-red-600 text-xs" title={it.error ?? ''}><AlertTriangle className="w-3.5 h-3.5" /> Error</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gray-400 text-xs"><XCircle className="w-3.5 h-3.5" /> Disconnected</span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-gray-500 text-xs">{timeAgo(it.lastSyncedAt)}</td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => plaidActions.syncItem(it.itemId)}
                      disabled={busy.includes(`sync:${it.itemId}`)}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
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
                      className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 disabled:opacity-50"
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
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Integration status</h3>
        {status ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
            <MetricTile
              label="Plaid credentials"
              value={status.configured
                ? <span className="text-emerald-600">Configured</span>
                : <span className="text-red-600">Missing</span>}
            />
            <MetricTile label="Environment" value={status.env} />
            <MetricTile label="Products" value={status.products.join(', ') || '—'} sub="+ liabilities when supported" />
            <MetricTile
              label="Webhook URL"
              value={
                <button
                  onClick={() => { navigator.clipboard?.writeText(status.webhookUrl); toast.success('Webhook URL copied'); }}
                  className="text-blue-600 text-xs underline break-all text-left"
                >
                  {status.webhookUrl || '—'}
                </button>
              }
              sub="Set in Plaid dashboard for auto-refresh"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-400">Sign in as staff to read integration status.</p>
        )}
        {status && !status.configured && (
          <div className="mt-3 border border-amber-200 bg-amber-50 rounded-lg p-3 text-xs text-amber-800">
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
  const avgScore = connected.length
    ? Math.round(
        connected.reduce((s, p) => s + (p.plaidScore?.total ?? 0), 0) /
          Math.max(1, connected.filter(p => p.plaidScore).length),
      )
    : 0;

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-blue-600" /> Plaid Data Vault
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Live bank, identity, financial and credit data for lending prospects — organized as a hierarchical file system.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => plaidActions.refresh()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => plaidActions.syncAll()}
            disabled={busy.includes('sync:all') || items.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${busy.includes('sync:all') ? 'animate-spin' : ''}`} />
            Sync all connections
          </button>
        </div>
      </div>

      {/* Not-configured banner */}
      {status && !status.configured && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Plaid credentials not configured yet</p>
            <p className="text-xs mt-1">
              Add <code className="font-mono">PLAID_CLIENT_ID</code> and <code className="font-mono">PLAID_SECRET</code> from
              your Plaid developer portal as Supabase Edge Function secrets (plus <code className="font-mono">PLAID_ENV</code>=
              sandbox or production). See the Connections tab for details.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Connected Prospects" value={`${connected.length}/${prospects.length}`} variant="blue" icon={<Link2 className="w-5 h-5" />} />
        <StatCard label="Verified Identities" value={verifiedIdentities} variant="emerald" icon={<ShieldCheck className="w-5 h-5" />} />
        <StatCard label="Combined Monthly Revenue" value={fmtMoney(totalRevenue)} variant="purple" icon={<Banknote className="w-5 h-5" />} />
        <StatCard label="Avg Cash-Flow Score" value={connected.length ? `${avgScore}/100` : '—'} variant="orange" icon={<Activity className="w-5 h-5" />} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {([
          ['prospects', 'Lending Prospects', Landmark],
          ['explorer', 'Data Explorer', FolderTree],
          ['connections', 'Connections', Link2],
        ] as [TabKey, string, React.ElementType][]).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => { setTab(key); if (key !== 'prospects') setSelectedLead(null); }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
              tab === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
            {key === 'explorer' && nodes.length > 0 && (
              <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">{nodes.length}</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-sm text-gray-400">Loading Plaid vault…</div>
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
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search prospects…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-400">
                  <th className="py-2.5 px-4 font-medium">Prospect</th>
                  <th className="py-2.5 px-4 font-medium">Requested</th>
                  <th className="py-2.5 px-4 font-medium">Connection</th>
                  <th className="py-2.5 px-4 font-medium">Identity</th>
                  <th className="py-2.5 px-4 font-medium">Monthly Revenue</th>
                  <th className="py-2.5 px-4 font-medium">Avg Balance</th>
                  <th className="py-2.5 px-4 font-medium">NSF 90d</th>
                  <th className="py-2.5 px-4 font-medium">Plaid Score</th>
                  <th className="py-2.5 px-4 font-medium">Decision</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-sm text-gray-400">
                      No leads found. Add leads in the Pipeline first — each lead becomes a lending prospect here.
                    </td>
                  </tr>
                )}
                {filtered.map(p => {
                  const m = p.cashFlow?.metrics;
                  return (
                    <tr
                      key={p.lead.id}
                      onClick={() => setSelectedLead(p.lead.id)}
                      className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="py-2.5 px-4">
                        <p className="font-medium text-gray-800">{p.lead.businessName}</p>
                        <p className="text-[11px] text-gray-400">{p.lead.id} · {p.lead.industry}</p>
                      </td>
                      <td className="py-2.5 px-4 text-gray-700">{p.lead.amountRequested || '—'}</td>
                      <td className="py-2.5 px-4" onClick={e => e.stopPropagation()}>
                        {p.items.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {p.items.length} bank{p.items.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <PlaidLinkButton leadId={p.lead.id} compact />
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        {p.summary?.identity_verified ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        ) : p.items.length > 0 ? (
                          <ShieldAlert className="w-4 h-4 text-amber-500" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-gray-700">
                        {m ? (
                          <span className="inline-flex items-center gap-1.5">
                            {fmtMoney(m.monthlyRevenue)} <TrendIcon trend={m.revenueTrend} />
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-gray-700">{m ? fmtMoney(m.avgDailyBalance) : '—'}</td>
                      <td className="py-2.5 px-4">
                        {m ? (
                          <span className={m.nsfCount90d > 0 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                            {m.nsfCount90d}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-2.5 px-4">
                        {p.plaidScore ? (
                          <span className={`font-semibold ${
                            p.plaidScore.total >= 70 ? 'text-emerald-600' : p.plaidScore.total >= 45 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {p.plaidScore.total}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-2.5 px-4"><DecisionBadge decision={p.prelim?.decision ?? null} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
