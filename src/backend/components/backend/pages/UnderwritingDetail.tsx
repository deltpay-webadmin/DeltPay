import React, { useMemo, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Printer,
  RefreshCw,
  Link2,
} from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';
import { useUnderwriting, underwritingActions, type UWApplication, type UWStage } from '../crmStore';
import {
  scorePlaid,
  scoreCrs,
  scoreDataMerch,
  computeComposite,
  tierFromComposite,
  evaluateDisqualifiers,
  stressTest,
  defaultScoreInputs,
  WEIGHTS,
  type CrsInputs,
  type DataMerchInputs,
  type RevenueTrend,
  type DepositConcentration,
} from '../underwritingScore';
import { usePlaidNodes } from '../plaidStore';
import {
  describePlaidProvenance,
  stampManualEdit,
  fromVaultNode,
  type PlaidInputsWithProv,
} from '../underwritingProvenance';

// ══════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════
const fmt$ = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtWhen = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const tierStyle: Record<string, { bg: string; text: string; ring: string }> = {
  'Tier 1': { bg: 'bg-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-500' },
  'Tier 2': { bg: 'bg-lime-500', text: 'text-lime-700', ring: 'ring-lime-500' },
  'Tier 3': { bg: 'bg-amber-500', text: 'text-amber-700', ring: 'ring-amber-500' },
  'Tier 4': { bg: 'bg-red-500', text: 'text-red-700', ring: 'ring-red-500' },
  Decline: { bg: 'bg-gray-400', text: 'text-gray-600', ring: 'ring-gray-400' },
};

function tierLabelFrom(tier: 1 | 2 | 3 | 4 | 'decline'): string {
  return tier === 'decline' ? 'Decline' : `Tier ${tier}`;
}

// ══════════════════════════════════════════════════════════════
// Small field components
// ══════════════════════════════════════════════════════════════
function NumField({
  label, value, onChange, step = 1, min, suffix, impact,
}: {
  label: string; value: number; onChange: (n: number) => void;
  step?: number; min?: number; suffix?: string; impact?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-600">{label}</label>
        {impact && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">{impact}</span>}
      </div>
      <div className="relative">
        <input
          type="number"
          value={Number.isFinite(value) ? value : ''}
          step={step}
          min={min}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-[6px] text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
        />
        {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">{suffix}</span>}
      </div>
    </div>
  );
}

function SelectField<T extends string>({
  label, value, options, onChange,
}: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-[6px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function BoolField({ label, value, onChange }: { label: string; value: boolean; onChange: (b: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <label className="text-xs text-gray-600">{label}</label>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-9 h-5 rounded-full transition-colors ${value ? 'bg-red-500' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  );
}

function VendorField({ label, value, good }: { label: string; value: React.ReactNode; good?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 tabular-nums ${good ? 'text-emerald-700' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function SourcePill({ kind, label }: { kind: 'live' | 'edited' | 'manual'; label: string }) {
  const styles = {
    live: 'bg-emerald-50 text-emerald-700',
    edited: 'bg-amber-50 text-amber-700',
    manual: 'bg-gray-100 text-gray-600',
  } as const;
  const dot = { live: 'bg-emerald-500', edited: 'bg-amber-500', manual: 'bg-gray-400' } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[8px] px-2 py-0.5 text-[10px] font-bold ${styles[kind]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[kind]}`} />
      {label}
    </span>
  );
}

function VendorCard({
  title, meta, pill, action, footer, children,
}: {
  title: string; meta: string; pill: React.ReactNode;
  action?: React.ReactNode; footer?: string; children?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-[8px]">
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-gray-900">{title}</span>
          {pill}
        </div>
        {action}
      </div>
      <div className="px-4 py-3">
        {children}
        <p className={`text-[11px] text-gray-400 ${children ? 'mt-3 pt-3 border-t border-gray-100' : ''}`}>
          {meta}{footer ? ` · ${footer}` : ''}
        </p>
      </div>
    </div>
  );
}

function Section({
  title, open, onToggle, children, score,
}: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode; score?: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-[8px] overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        {score}
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t border-gray-100">{children}</div>}
    </div>
  );
}

function ScoreBar({ label, raw, weightPct, color }: { label: string; raw: number; weightPct: number; color: string }) {
  const weighted = (raw * weightPct) / 100;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600">{label} <span className="text-gray-400">({weightPct}%)</span></span>
        <span className="font-semibold text-gray-900 tabular-nums">{raw}/100 → {weighted.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${raw}%` }} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Main
// ══════════════════════════════════════════════════════════════
export function UnderwritingDetail() {
  const { navigate, currentPage } = useAppNavigate();
  const allApps = useUnderwriting();

  const appIdFromUrl = currentPage.startsWith('/underwriting/') ? currentPage.split('/underwriting/')[1] : '';
  const app: UWApplication | undefined = useMemo(
    () => allApps.find(a => a.id === appIdFromUrl) || allApps[0],
    [allApps, appIdFromUrl],
  );

  // Seed defaults from the application's headline figures.
  const seeded = useMemo(
    () => defaultScoreInputs({
      monthlyRevenue: app?.monthlyRevenue,
      avgDailyBalance: app?.avgDailyBalance,
      fico: app?.creditScore,
      existingPositions: app?.existingPositions,
    }),
    [app?.id], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [plaid, setPlaid] = useState<PlaidInputsWithProv>(app?.plaidInputs ?? seeded.plaid);
  const [crs, setCrs] = useState<CrsInputs>(app?.crsInputs ?? seeded.crs);
  const [dm, setDm] = useState<DataMerchInputs>(app?.dataMerchInputs ?? seeded.dataMerch);
  const [requested, setRequested] = useState<number>(app?.requestedAmount ?? 50000);
  const [proposedAdvance, setProposedAdvance] = useState<number>(app?.requestedAmount ?? 50000);

  const [openPlaid, setOpenPlaid] = useState(true);
  const [openCrs, setOpenCrs] = useState(false);
  const [openDm, setOpenDm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [approving, setApproving] = useState(false);

  // Reload local editor state when navigating to a different application.
  const loadedId = useRef<string | undefined>(app?.id);
  useEffect(() => {
    if (app && app.id !== loadedId.current) {
      loadedId.current = app.id;
      const s = defaultScoreInputs({
        monthlyRevenue: app.monthlyRevenue,
        avgDailyBalance: app.avgDailyBalance,
        fico: app.creditScore,
        existingPositions: app.existingPositions,
      });
      setPlaid(app.plaidInputs ?? s.plaid);
      setCrs(app.crsInputs ?? s.crs);
      setDm(app.dataMerchInputs ?? s.dataMerch);
      setRequested(app.requestedAmount ?? 50000);
      setProposedAdvance(app.requestedAmount ?? 50000);
    }
  }, [app]);

  // ── Live Plaid vault state (only resolves when the case is linked to a lead) ──
  const plaidNodes = usePlaidNodes();
  const vaultUwNode = useMemo(
    () => (app?.leadId ? plaidNodes.find(n => n.leadId === app.leadId && n.docKind === 'underwriting_inputs') ?? null : null),
    [plaidNodes, app?.leadId],
  );
  const vaultSummary = useMemo(
    () => (app?.leadId ? plaidNodes.find(n => n.leadId === app.leadId && n.docKind === 'summary')?.data ?? null : null),
    [plaidNodes, app?.leadId],
  );
  const screeningDocs = useMemo(
    () => (app?.leadId ? plaidNodes.filter(n => n.leadId === app.leadId && n.docKind === 'watchlist_screening') : []),
    [plaidNodes, app?.leadId],
  );
  const plaidProv = describePlaidProvenance(plaid);

  // Manual edits invalidate the "pulled from vault" claim.
  const editPlaid = (patch: Partial<PlaidInputsWithProv>) =>
    setPlaid(p => stampManualEdit({ ...p, ...patch }));

  // ── Live scoring (pure engine) ──
  const result = useMemo(() => {
    const inputs = { plaid, crs, dataMerch: dm };
    const p = scorePlaid(plaid);
    const c = scoreCrs(crs);
    const d = scoreDataMerch(dm);
    const composite = computeComposite(p.total, c.total, d.total);
    const dq = evaluateDisqualifiers(inputs);
    const terms = dq.length > 0 ? tierFromComposite(0) : tierFromComposite(composite);
    return { p, c, d, composite, dq, terms };
  }, [plaid, crs, dm]);

  const factorMid = result.terms.factorMin > 0 ? (result.terms.factorMin + result.terms.factorMax) / 2 : 1.4;
  const stress = useMemo(() => stressTest({
    advanceAmount: proposedAdvance,
    factorRate: factorMid,
    termDays: 252,
    avgDailyRevenue: (plaid.monthlyRevenue || 0) / 21,
    avgDailyBalance: plaid.avgDailyBalance,
    tier: result.terms.tier,
  }), [proposedAdvance, factorMid, plaid.monthlyRevenue, plaid.avgDailyBalance, result.terms.tier]);

  const tierLabel = tierLabelFrom(result.terms.tier);
  const ts = tierStyle[tierLabel] ?? tierStyle.Decline;

  const canApprove =
    !!app &&
    result.dq.length === 0 &&
    result.terms.tier !== 'decline' &&
    (result.terms.tier as number) <= 3 &&
    stress.passes;

  // ── Persistence ──
  const saveDraft = (silent = false) => {
    if (!app) return;
    underwritingActions.updateInputs(app.id, {
      plaidInputs: plaid,
      crsInputs: crs,
      dataMerchInputs: dm,
      requestedAmount: requested,
    });
    if (!silent) toast.success('Draft saved');
  };

  // Autosave on input change (debounced).
  const firstRun = useRef(true);
  useEffect(() => {
    if (!app) return;
    if (firstRun.current) { firstRun.current = false; return; }
    const t = setTimeout(() => saveDraft(true), 700);
    return () => clearTimeout(t);
  }, [plaid, crs, dm, requested]); // eslint-disable-line react-hooks/exhaustive-deps

  const moveToReview = () => {
    if (!app) return;
    saveDraft(true);
    underwritingActions.setStage(app.id, 'Final Review');
    toast.success('Moved to Final Review');
  };

  const confirmApprove = async () => {
    if (!app || approving) return;
    setApproving(true);
    saveDraft(true);
    const dealId = await underwritingActions.approve(app.id);
    setApproving(false);
    setApproveOpen(false);
    if (dealId) {
      toast.success(`Approved — Capital deal ${dealId} created`, { description: `${fmt$(requested)} funded.` });
      navigate(`/capital`);
    } else {
      toast.error('Approve failed — see console.');
    }
  };

  const confirmDecline = () => {
    if (!app) return;
    underwritingActions.decline(app.id, declineReason.trim() || undefined);
    setDeclineOpen(false);
    toast.error(`${app.businessName} declined`);
    navigate('/underwriting');
  };

  if (!app) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">No application found.</p>
          <button onClick={() => navigate('/underwriting')} className="text-sm text-brand hover:underline">← Back to pipeline</button>
        </div>
      </div>
    );
  }

  const stageDone = app.stage === 'Approved' || app.stage === 'Declined';

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="max-w-[1440px] mx-auto px-6 py-5 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/underwriting')} className="p-1.5 hover:bg-gray-100 rounded-[6px]">
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </button>
            <div className="w-10 h-10 rounded-[8px] bg-indigo-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{app.businessName}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="font-mono">{app.applicationId}</span>
                <span>·</span>
                <span>{app.industry}</span>
                <span>·</span>
                <span>Stage: {app.stage}</span>
                {app.contactName && (
                  <>
                    <span>·</span>
                    <span>{app.contactName}{app.contactEmail ? ` (${app.contactEmail})` : ''}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {app.submissionId && (
            <button
              onClick={() => navigate(`/deal-room/${app.submissionId}`)}
              className="px-3 py-1.5 bg-white border border-indigo-300 text-indigo-700 text-xs font-semibold rounded-[6px] hover:bg-indigo-50 transition-colors"
            >
              Open Deal Room →
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ── LEFT: Inputs ── */}
          <div className="lg:col-span-7 space-y-4">
            {/* Data sources — underwriting runs in-house off these connections */}
            <div>
              <div className="flex items-center gap-2 px-1 pb-2">
                <Link2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Data sources</span>
              </div>
              <div className="space-y-3">
                <VendorCard
                  title="Plaid"
                  meta="Bank verification, cash flow, identity"
                  pill={
                    plaidProv.kind === 'plaid' ? <SourcePill kind="live" label="Live — Plaid vault" />
                    : plaidProv.kind === 'plaid-edited' ? <SourcePill kind="edited" label="Plaid data · edited" />
                    : <SourcePill kind="manual" label="Manual entry" />
                  }
                  footer={
                    plaidProv.pulledAt
                      ? `Pulled from Plaid vault ${fmtWhen(plaidProv.pulledAt)}${plaidProv.editedAt ? ` · adjusted by hand ${fmtWhen(plaidProv.editedAt)}` : ''}`
                      : 'Manual entry — no pull recorded'
                  }
                  action={vaultUwNode ? (
                    <button
                      onClick={() => {
                        const fresh = fromVaultNode(vaultUwNode.data, app.leadId!);
                        if (!fresh) { toast.error('Vault snapshot is missing cash-flow inputs.'); return; }
                        setPlaid(fresh);
                        toast.success('Plaid inputs refreshed from the vault', {
                          description: `Snapshot pulled ${fmtWhen(fresh._prov?.pulledAt)}.`,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Pull from vault
                    </button>
                  ) : undefined}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                    {vaultSummary && (
                      <>
                        <VendorField label="Bank verification" good={Boolean(vaultSummary.bank_verified)}
                          value={vaultSummary.bank_verified
                            ? <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" />Verified</span>
                            : 'Not verified'} />
                        <VendorField label="IDV status" good={Boolean(vaultSummary.identity_verified)}
                          value={vaultSummary.identity_verified
                            ? <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" />Verified</span>
                            : 'Not verified'} />
                        <VendorField label="OFAC screening"
                          good={screeningDocs.length > 0 && screeningDocs.every(d => !d.data?.hit_count)}
                          value={screeningDocs.length === 0
                            ? 'Not screened'
                            : screeningDocs.some(d => d.data?.hit_count)
                              ? `${screeningDocs.reduce((n, d) => n + (Number(d.data?.hit_count) || 0), 0)} hit(s)`
                              : <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" />Clear</span>} />
                      </>
                    )}
                    <VendorField label="3-mo avg revenue" value={fmt$(plaid.monthlyRevenue || 0)} />
                    <VendorField label="NSF count (90d)" good={plaid.nsfCount90d === 0} value={plaid.nsfCount90d} />
                    <VendorField label="Avg daily balance" value={fmt$(plaid.avgDailyBalance || 0)} />
                  </div>
                </VendorCard>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <VendorCard
                    title="CRS Credit"
                    meta="Personal + business credit"
                    pill={<SourcePill kind="manual" label="Manual entry — no integration" />}
                    footer="Bureau pull is a manual step (SOP: Credit Check) — key the report in below"
                  >
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <VendorField label="Personal FICO" value={crs.fico} />
                      <VendorField label="Derogatory marks" good={crs.derogatoryMarks === 0} value={crs.derogatoryMarks} />
                    </div>
                  </VendorCard>
                  <VendorCard
                    title="DataMerch"
                    meta="MCA industry database"
                    pill={<SourcePill kind="manual" label="Manual entry — no integration" />}
                    footer="datamerch.com lookup is a manual step (SOP: MCA History) — key the result in below"
                  >
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <VendorField label="Open positions" good={dm.currentOpenPositions === 0} value={dm.currentOpenPositions} />
                      <VendorField label="Prior defaults" good={dm.priorDefaults === 0} value={dm.priorDefaults} />
                    </div>
                  </VendorCard>
                </div>
              </div>
            </div>

            <Section
              title="Plaid Cash Flow Inputs"
              open={openPlaid}
              onToggle={() => setOpenPlaid(o => !o)}
              score={<span className="text-xs font-semibold text-indigo-600">{result.p.total}/100</span>}
            >
              <div className="grid grid-cols-2 gap-3 pt-2">
                <NumField label="Avg Daily Balance" value={plaid.avgDailyBalance} step={500} min={0} suffix="$"
                  impact={`${result.p.components[0].points}/20`}
                  onChange={n => editPlaid({ avgDailyBalance: n })} />
                <NumField label="Min Daily Balance" value={plaid.minDailyBalance} step={500} suffix="$"
                  impact={`${result.p.components[1].points}/10`}
                  onChange={n => editPlaid({ minDailyBalance: n })} />
                <NumField label="Monthly Revenue (avg 3mo)" value={plaid.monthlyRevenue} step={1000} min={0} suffix="$"
                  onChange={n => editPlaid({ monthlyRevenue: n })} />
                <NumField label="Revenue σ (stddev/mean)" value={plaid.revenueStdDevPct} step={0.05} min={0} suffix="0–1"
                  impact={`${result.p.components[3].points}/15`}
                  onChange={n => editPlaid({ revenueStdDevPct: n })} />
                <NumField label="NSF count (90d)" value={plaid.nsfCount90d} step={1} min={0}
                  impact={`${result.p.components[2].points}/20`}
                  onChange={n => editPlaid({ nsfCount90d: n })} />
                <NumField label="Days since last NSF" value={plaid.daysSinceLastNsf} step={1} min={0}
                  impact={`${result.p.components[6].points}/10`}
                  onChange={n => editPlaid({ daysSinceLastNsf: n })} />
                <NumField label="Revenue change 3mo" value={plaid.revenueChange3moPct} step={0.05} suffix="±%"
                  onChange={n => editPlaid({ revenueChange3moPct: n })} />
                <SelectField<RevenueTrend> label="Revenue trend" value={plaid.revenueTrend}
                  options={[{ value: 'growing', label: 'Growing' }, { value: 'flat', label: 'Flat' }, { value: 'declining', label: 'Declining' }]}
                  onChange={v => editPlaid({ revenueTrend: v })} />
                <SelectField<DepositConcentration> label="Deposit concentration" value={plaid.depositConcentration}
                  options={[{ value: 'diversified', label: 'Diversified' }, { value: 'moderate', label: 'Moderate' }, { value: 'concentrated', label: 'Concentrated' }]}
                  onChange={v => editPlaid({ depositConcentration: v })} />
              </div>
            </Section>

            <Section
              title="CRS Credit Inputs"
              open={openCrs}
              onToggle={() => setOpenCrs(o => !o)}
              score={<span className="text-xs font-semibold text-indigo-600">{result.c.total}/100</span>}
            >
              <div className="grid grid-cols-2 gap-3 pt-2">
                <NumField label="Personal FICO" value={crs.fico} step={5} min={300}
                  impact={`${result.c.components[0].points}/40`}
                  onChange={n => setCrs({ ...crs, fico: n })} />
                <NumField label="Business Credit (optional)" value={crs.businessCreditScore ?? 0} step={5} min={0}
                  onChange={n => setCrs({ ...crs, businessCreditScore: n || undefined })} />
                <NumField label="Derogatory marks" value={crs.derogatoryMarks} step={1} min={0}
                  impact={`${result.c.components[2].points}/15`}
                  onChange={n => setCrs({ ...crs, derogatoryMarks: n })} />
                <NumField label="Credit utilization" value={crs.creditUtilizationPct} step={0.05} min={0} suffix="0–1"
                  impact={`${result.c.components[3].points}/10`}
                  onChange={n => setCrs({ ...crs, creditUtilizationPct: n })} />
                <NumField label="Time in file (yrs)" value={crs.timeInFileYears} step={0.5} min={0}
                  impact={`${result.c.components[4].points}/10`}
                  onChange={n => setCrs({ ...crs, timeInFileYears: n })} />
                <div className="flex items-end pb-1">
                  <div className="w-full">
                    <BoolField label="Active bankruptcy" value={crs.activeBankruptcy} onChange={b => setCrs({ ...crs, activeBankruptcy: b })} />
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title="DataMerch MCA Inputs"
              open={openDm}
              onToggle={() => setOpenDm(o => !o)}
              score={<span className="text-xs font-semibold text-indigo-600">{result.d.total}/100</span>}
            >
              <div className="grid grid-cols-2 gap-3 pt-2">
                <NumField label="Prior MCA positions" value={dm.priorPositions} step={1} min={0}
                  impact={`${result.d.components[0].points}/25`}
                  onChange={n => setDm({ ...dm, priorPositions: n })} />
                <NumField label="Prior defaults" value={dm.priorDefaults} step={1} min={0}
                  impact={`${result.d.components[1].points}/30`}
                  onChange={n => setDm({ ...dm, priorDefaults: n })} />
                <NumField label="Current open positions" value={dm.currentOpenPositions} step={1} min={0}
                  impact={`${result.d.components[2].points}/20`}
                  onChange={n => setDm({ ...dm, currentOpenPositions: n })} />
                <NumField label="Early payoffs" value={dm.earlyPayoffs} step={1} min={0}
                  impact={`${result.d.components[4].points}/10`}
                  onChange={n => setDm({ ...dm, earlyPayoffs: n })} />
                <SelectField<string> label="Our position seniority" value={String(dm.positionSeniority)}
                  options={[{ value: '1', label: '1st (senior)' }, { value: '2', label: '2nd' }, { value: '3', label: '3rd' }, { value: '4', label: '4th+' }]}
                  onChange={v => setDm({ ...dm, positionSeniority: Number(v) as 1 | 2 | 3 | 4 })} />
              </div>
            </Section>

            <div className="bg-white border border-gray-200 rounded-[8px] p-4">
              <NumField label="Requested Amount" value={requested} step={5000} min={0} suffix="$"
                onChange={n => setRequested(n)} />
            </div>
          </div>

          {/* ── RIGHT: Score panel (sticky) ── */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-4 space-y-4">
              {/* Composite + tier */}
              <div className="bg-white border border-gray-200 rounded-[8px] p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Composite score</p>
                <div className="mt-2 flex flex-wrap items-baseline gap-3">
                  <span className="text-[44px] leading-none font-bold text-gray-900 tabular-nums tracking-[-0.02em]">{result.composite}</span>
                  <span className="text-sm text-gray-400 tabular-nums">/ 100</span>
                  <span className={`inline-block px-2.5 py-1 rounded-[8px] text-xs font-bold text-white ${ts.bg}`}>{tierLabel}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{result.terms.label}</p>
                <div className="mt-5 space-y-3">
                  <ScoreBar label="Plaid Cash Flow" raw={result.p.total} weightPct={WEIGHTS.plaid * 100} color="bg-[#2E6BFF]" />
                  <ScoreBar label="CRS Credit" raw={result.c.total} weightPct={WEIGHTS.crs * 100} color="bg-[#7C5BFF]" />
                  <ScoreBar label="DataMerch MCA" raw={result.d.total} weightPct={WEIGHTS.dataMerch * 100} color="bg-[#3CC9E3]" />
                </div>
              </div>

              {/* Recommended terms */}
              {result.terms.tier !== 'decline' && (
                <div className="bg-white border border-gray-200 rounded-[8px] p-4">
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Recommended Terms</h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Factor</p>
                      <p className="text-sm font-bold text-gray-900">{result.terms.factorMin.toFixed(2)}–{result.terms.factorMax.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Holdback</p>
                      <p className="text-sm font-bold text-gray-900">{result.terms.holdbackMinPct}–{result.terms.holdbackMaxPct}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Max Advance</p>
                      <p className="text-sm font-bold text-gray-900">{fmt$(plaid.monthlyRevenue * result.terms.maxAdvancePctOfMonthlyRevenue)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Disqualifiers */}
              {result.dq.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-[8px] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Hard Disqualifiers</span>
                  </div>
                  <ul className="space-y-1.5">
                    {result.dq.map(d => (
                      <li key={d.code} className="flex items-start gap-1.5 text-xs text-red-700">
                        <X className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span><strong>{d.label}:</strong> {d.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stress test */}
              <div className="bg-white border border-gray-200 rounded-[8px] p-4">
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Income-to-Holdback Stress Test</h3>
                <NumField label="Proposed advance $" value={proposedAdvance} step={5000} min={0} suffix="$"
                  onChange={n => setProposedAdvance(n)} />
                <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-[6px] ${stress.passes ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  {stress.passes ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                  <span className={`text-xs font-bold ${stress.passes ? 'text-emerald-700' : 'text-red-700'}`}>
                    {stress.passes ? 'PASSES' : 'FAILS'}
                  </span>
                  <span className="text-[11px] text-gray-500 ml-auto tabular-nums">
                    Daily debit {fmt$(stress.dailyDebit)} · {(stress.pctOfDailyRevenue * 100).toFixed(1)}% of rev
                  </span>
                </div>
                {stress.flags.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {stress.flags.map((f, i) => <li key={i} className="text-[11px] text-red-600">• {f}</li>)}
                  </ul>
                )}
                {!stress.passes && stress.suggestedMaxAdvance > 0 && (
                  <p className="mt-2 text-[11px] text-gray-500">
                    Suggested max advance: <strong>{fmt$(stress.suggestedMaxAdvance)}</strong> · or extend term to ~{stress.suggestedMinTermDays} days.
                  </p>
                )}
              </div>

              {/* One-page summary */}
              <div className="bg-white border border-gray-200 rounded-[8px] overflow-hidden">
                <button onClick={() => setShowSummary(s => !s)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-900">One-Page Summary</span>
                  </div>
                  {showSummary ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>
                {showSummary && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 text-xs text-gray-700 space-y-1.5">
                    <div className="flex justify-between"><span className="text-gray-400">Merchant</span><span className="font-medium">{app.businessName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Application</span><span className="font-mono">{app.applicationId}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Composite</span><span className="font-bold">{result.composite}/100 ({tierLabel})</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Plaid / CRS / DM</span><span className="tabular-nums">{result.p.total} / {result.c.total} / {result.d.total}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Requested</span><span>{fmt$(requested)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Factor / Holdback</span><span>{result.terms.factorMin.toFixed(2)}–{result.terms.factorMax.toFixed(2)} / {result.terms.holdbackMinPct}–{result.terms.holdbackMaxPct}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Stress test</span><span className={stress.passes ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>{stress.passes ? 'Pass' : 'Fail'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Disqualifiers</span><span>{result.dq.length === 0 ? 'None' : result.dq.map(d => d.code).join(', ')}</span></div>
                    <button onClick={() => window.print()} className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-brand hover:underline">
                      <Printer className="w-3 h-3" /> Print / screenshot
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-30">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Composite <strong className="text-gray-900">{result.composite}</strong> · <span className={ts.text}>{tierLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => saveDraft()} className="h-10 px-5 text-sm font-bold text-gray-900 border border-gray-300 rounded-[10px] hover:bg-white/[0.04] transition-colors">
              Save Draft
            </button>
            {!stageDone && (
              <button onClick={moveToReview} className="h-10 px-5 text-sm font-bold text-indigo-600 border border-indigo-200 rounded-[10px] hover:bg-indigo-50 transition-colors">
                Move to Final Review
              </button>
            )}
            {!stageDone && (
              <button onClick={() => setDeclineOpen(true)} className="h-10 px-5 text-sm font-bold text-red-500 border border-red-200 rounded-[10px] hover:bg-red-50 transition-colors">
                Decline
              </button>
            )}
            {!stageDone && (
              <button
                onClick={() => setApproveOpen(true)}
                disabled={!canApprove}
                title={canApprove ? '' : 'Requires Tier ≤ 3, no disqualifiers, passing stress test'}
                className="h-10 px-5 text-sm font-bold text-white bg-emerald-600 rounded-[10px] hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" /> Approve &amp; Fund
              </button>
            )}
            {stageDone && (
              <span className={`px-3 py-2 text-sm font-semibold rounded-[6px] ${app.stage === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {app.stage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Approve confirmation modal */}
      {approveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setApproveOpen(false)}>
          <div className="bg-white rounded-[10px] shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Approve &amp; Fund</h3>
              <p className="text-xs text-gray-500 mt-0.5">A Capital deal will be created from this application.</p>
            </div>
            <div className="px-5 py-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Merchant</span><span className="font-medium">{app.businessName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Funded amount</span><span className="font-medium">{fmt$(requested)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Factor</span><span className="font-medium">{factorMid.toFixed(4)}x</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total owed</span><span className="font-medium">{fmt$(Math.round(requested * factorMid))}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Holdback</span><span className="font-medium">{Math.round((result.terms.holdbackMinPct + result.terms.holdbackMaxPct) / 2)}%</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tier</span><span className="font-medium">{tierLabel}</span></div>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={() => setApproveOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-[6px]">Cancel</button>
              <button onClick={confirmApprove} disabled={approving}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-[6px] hover:bg-emerald-700 disabled:opacity-50">
                {approving ? 'Funding…' : 'Confirm & Create Deal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline modal */}
      {declineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeclineOpen(false)}>
          <div className="bg-white rounded-[10px] shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Decline Application</h3>
            </div>
            <div className="px-5 py-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
              <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={3} placeholder="Why is this being declined?"
                className="w-full px-3 py-2 border border-gray-200 rounded-[6px] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={() => setDeclineOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-[6px]">Cancel</button>
              <button onClick={confirmDecline} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-[6px] hover:bg-red-700">Confirm Decline</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnderwritingDetail;
