import React, { useMemo, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronRight,
  Check,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Printer,
  RefreshCw,
  Link2,
  Landmark,
} from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';
import { useUnderwriting, underwritingActions, type UWApplication, type UWTier } from '../crmStore';
import { usePlaidNodes } from '../plaidStore';
import { RecommendationView } from '../RecommendationView';
import { tierFromModel, factorFromOffer, holdbackFromOffer, checkProposedAmount } from '../modelMapping';
import type { PlaidInputs, CrsInputs, DataMerchInputs, RevenueTrend, DepositConcentration } from '../uwInputs';

// ══════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════
const fmt$ = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const tierStyle: Record<string, { bg: string; text: string; ring: string }> = {
  'Tier 1': { bg: 'bg-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-500' },
  'Tier 2': { bg: 'bg-lime-500', text: 'text-lime-700', ring: 'ring-lime-500' },
  'Tier 3': { bg: 'bg-amber-500', text: 'text-amber-700', ring: 'ring-amber-500' },
  'Tier 4': { bg: 'bg-red-500', text: 'text-red-700', ring: 'ring-red-500' },
  Decline: { bg: 'bg-gray-400', text: 'text-gray-600', ring: 'ring-gray-400' },
};

// Neutral evidence seeds for a file whose blocks haven't been keyed yet.
// (Same defaults the retired composite engine used, so drafts round-trip.)
const safe = (v: number | undefined, d: number) => (Number.isFinite(v) && (v as number) > 0 ? (v as number) : d);
function seedInputs(app?: UWApplication): { plaid: PlaidInputs; crs: CrsInputs; dataMerch: DataMerchInputs } {
  const mr = safe(app?.monthlyRevenue, 30000);
  const adb = safe(app?.avgDailyBalance, 5000);
  const pos = safe(app?.existingPositions, 0);
  return {
    plaid: {
      avgDailyBalance: adb,
      minDailyBalance: Math.max(0, Math.round(adb * 0.3)),
      nsfCount90d: 0,
      daysSinceLastNsf: 9999,
      monthlyRevenue: mr,
      revenueStdDevPct: 0.15,
      revenueTrend: 'flat',
      depositConcentration: 'moderate',
      revenueChange3moPct: 0,
    },
    crs: {
      fico: safe(app?.creditScore, 650),
      businessCreditScore: undefined,
      derogatoryMarks: 0,
      creditUtilizationPct: 0.35,
      timeInFileYears: 6,
      activeBankruptcy: false,
    },
    dataMerch: {
      priorPositions: pos,
      priorDefaults: 0,
      earlyPayoffs: 0,
      currentOpenPositions: pos,
      positionSeniority: pos > 0 ? 2 : 1,
    },
  };
}

// ══════════════════════════════════════════════════════════════
// Small field components
// ══════════════════════════════════════════════════════════════
function NumField({
  label, value, onChange, step = 1, min, suffix,
}: {
  label: string; value: number; onChange: (n: number) => void;
  step?: number; min?: number; suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-600">{label}</label>
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

function VendorCard({
  title, meta, lastPulled, onPull, children,
}: { title: string; meta: string; lastPulled: string; onPull: () => void; children?: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-[8px]">
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-gray-900">{title}</span>
          <span className="inline-flex items-center gap-1.5 rounded-[8px] px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Connected
          </span>
        </div>
        <button
          onClick={onPull}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Pull data
        </button>
      </div>
      <div className="px-4 py-3">
        {children}
        <p className={`text-[11px] text-gray-400 ${children ? 'mt-3 pt-3 border-t border-gray-100' : ''}`}>
          {meta} · Last pulled {lastPulled}
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

// ══════════════════════════════════════════════════════════════
// Main
// ══════════════════════════════════════════════════════════════
export function UnderwritingDetail() {
  const { navigate, currentPage } = useAppNavigate();
  const allApps = useUnderwriting();
  const nodes = usePlaidNodes();

  const appIdFromUrl = currentPage.startsWith('/underwriting/') ? currentPage.split('/underwriting/')[1] : '';
  const app: UWApplication | undefined = useMemo(
    () => allApps.find(a => a.id === appIdFromUrl) || allApps[0],
    [allApps, appIdFromUrl],
  );

  // The authoritative verdict: the Delt Cash-Flow Decision Model output,
  // linked through the lead. No client-side re-scoring anywhere.
  const rec = useMemo(
    () => (app?.leadId ? nodes.find(n => n.leadId === app.leadId && n.docKind === 'recommendation')?.data ?? null : null),
    [nodes, app?.leadId],
  );
  const offer = rec?.offer ?? null;

  const seeded = useMemo(() => seedInputs(app), [app?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [plaid, setPlaid] = useState<PlaidInputs>(app?.plaidInputs ?? seeded.plaid);
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

  // Manual terms — the only approval path when the model has no offer.
  const [manualFactor, setManualFactor] = useState<number>(1.4);
  const [manualHoldback, setManualHoldback] = useState<number>(12);
  const [manualTier, setManualTier] = useState<UWTier>('Tier 4');

  // Reload local editor state when navigating to a different application.
  const loadedId = useRef<string | undefined>(app?.id);
  useEffect(() => {
    if (app && app.id !== loadedId.current) {
      loadedId.current = app.id;
      const s = seedInputs(app);
      setPlaid(app.plaidInputs ?? s.plaid);
      setCrs(app.crsInputs ?? s.crs);
      setDm(app.dataMerchInputs ?? s.dataMerch);
      setRequested(app.requestedAmount ?? 50000);
      setProposedAdvance(app.requestedAmount ?? 50000);
    }
  }, [app]);

  // What-if check for a proposed advance against the model's sized offer.
  const whatIf = useMemo(
    () => (offer ? checkProposedAmount(offer, proposedAdvance) : null),
    [offer, proposedAdvance],
  );

  // Display values: live model verdict first, then whatever the server
  // write-through last persisted on the row (legacy / between-sync state).
  const displayScore: number | null = rec?.score?.total ?? app?.compositeScore ?? null;
  const displayTier: string | null = rec ? tierFromModel(rec.tier ?? null) : (app?.tier ?? null);
  const displayDisqualifiers: string[] = rec
    ? [...(rec.gates?.sufficiency ?? []), ...(rec.gates?.knockouts ?? [])].filter((g: any) => !g.passed).map((g: any) => g.label)
    : (app?.disqualifiers ?? []);
  const ts = tierStyle[displayTier ?? 'Decline'] ?? tierStyle.Decline;

  const modelApprovable = Boolean(rec && (rec.decision === 'PRE_APPROVE' || rec.decision === 'REVIEW') && offer);

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

  const manualTermsValid =
    Number.isFinite(manualFactor) && manualFactor > 1 && manualFactor < 2 &&
    Number.isFinite(manualHoldback) && manualHoldback >= 1 && manualHoldback <= 50;

  const confirmApprove = async () => {
    if (!app || approving) return;
    if (!modelApprovable && !manualTermsValid) {
      toast.error('Enter valid manual terms (factor 1–2, holdback 1–50%) to approve without a model offer.');
      return;
    }
    setApproving(true);
    saveDraft(true);
    const dealId = await underwritingActions.approve(
      app.id,
      modelApprovable
        ? { recommendation: rec }
        : { factor: manualFactor, holdbackPct: manualHoldback, tier: manualTier, recommendation: rec ?? undefined },
    );
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
  const approveFactor = modelApprovable ? factorFromOffer(offer) : manualFactor;
  const approveHoldback = modelApprovable ? holdbackFromOffer(offer) : manualHoldback;
  const approveTier = modelApprovable ? tierFromModel(rec?.tier ?? null) : manualTier;

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
          {/* ── LEFT: Evidence inputs (not scored — the model is the scorer) ── */}
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
                  lastPulled="on last sync"
                  onPull={() => { saveDraft(true); toast.success('Recorded', { description: 'Live Plaid data refreshes on prospect sync in the Plaid Portal.' }); }}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                    <VendorField label="Bank verification" good value={<span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" />Verified</span>} />
                    <VendorField label="IDV status" good value={<span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" />Verified</span>} />
                    <VendorField label="OFAC screening" good value={<span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" />Clear</span>} />
                    <VendorField label="3-mo avg revenue" value={fmt$(plaid.monthlyRevenue || 0)} />
                    <VendorField label="NSF count (90d)" good={plaid.nsfCount90d === 0} value={plaid.nsfCount90d} />
                    <VendorField label="Avg daily balance" value={fmt$(plaid.avgDailyBalance || 0)} />
                  </div>
                </VendorCard>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <VendorCard
                    title="CRS Credit"
                    meta="Personal + business credit (evidence — not model-scored)"
                    lastPulled="manually"
                    onPull={() => toast.success('Recorded — vendor integration pending')}
                  >
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <VendorField label="Personal FICO" value={crs.fico} />
                      <VendorField label="Derogatory marks" good={crs.derogatoryMarks === 0} value={crs.derogatoryMarks} />
                    </div>
                  </VendorCard>
                  <VendorCard
                    title="DataMerch"
                    meta="MCA industry database (evidence — not model-scored)"
                    lastPulled="manually"
                    onPull={() => toast.success('Recorded — vendor integration pending')}
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
              score={<span className="text-[10px] font-semibold text-gray-400 uppercase">from bank data</span>}
            >
              <div className="grid grid-cols-2 gap-3 pt-2">
                <NumField label="Avg Daily Balance" value={plaid.avgDailyBalance} step={500} min={0} suffix="$"
                  onChange={n => setPlaid({ ...plaid, avgDailyBalance: n })} />
                <NumField label="Min Daily Balance" value={plaid.minDailyBalance} step={500} suffix="$"
                  onChange={n => setPlaid({ ...plaid, minDailyBalance: n })} />
                <NumField label="Monthly Revenue (avg 3mo)" value={plaid.monthlyRevenue} step={1000} min={0} suffix="$"
                  onChange={n => setPlaid({ ...plaid, monthlyRevenue: n })} />
                <NumField label="Revenue σ (stddev/mean)" value={plaid.revenueStdDevPct} step={0.05} min={0} suffix="0–1"
                  onChange={n => setPlaid({ ...plaid, revenueStdDevPct: n })} />
                <NumField label="NSF count (90d)" value={plaid.nsfCount90d} step={1} min={0}
                  onChange={n => setPlaid({ ...plaid, nsfCount90d: n })} />
                <NumField label="Days since last NSF" value={plaid.daysSinceLastNsf} step={1} min={0}
                  onChange={n => setPlaid({ ...plaid, daysSinceLastNsf: n })} />
                <NumField label="Revenue change 3mo" value={plaid.revenueChange3moPct} step={0.05} suffix="±%"
                  onChange={n => setPlaid({ ...plaid, revenueChange3moPct: n })} />
                <SelectField<RevenueTrend> label="Revenue trend" value={plaid.revenueTrend}
                  options={[{ value: 'growing', label: 'Growing' }, { value: 'flat', label: 'Flat' }, { value: 'declining', label: 'Declining' }]}
                  onChange={v => setPlaid({ ...plaid, revenueTrend: v })} />
                <SelectField<DepositConcentration> label="Deposit concentration" value={plaid.depositConcentration}
                  options={[{ value: 'diversified', label: 'Diversified' }, { value: 'moderate', label: 'Moderate' }, { value: 'concentrated', label: 'Concentrated' }]}
                  onChange={v => setPlaid({ ...plaid, depositConcentration: v })} />
              </div>
            </Section>

            <Section
              title="CRS Credit — evidence"
              open={openCrs}
              onToggle={() => setOpenCrs(o => !o)}
              score={<span className="text-[10px] font-semibold text-gray-400 uppercase">recorded, not scored</span>}
            >
              <div className="grid grid-cols-2 gap-3 pt-2">
                <NumField label="Personal FICO" value={crs.fico} step={5} min={300}
                  onChange={n => setCrs({ ...crs, fico: n })} />
                <NumField label="Business Credit (optional)" value={crs.businessCreditScore ?? 0} step={5} min={0}
                  onChange={n => setCrs({ ...crs, businessCreditScore: n || undefined })} />
                <NumField label="Derogatory marks" value={crs.derogatoryMarks} step={1} min={0}
                  onChange={n => setCrs({ ...crs, derogatoryMarks: n })} />
                <NumField label="Credit utilization" value={crs.creditUtilizationPct} step={0.05} min={0} suffix="0–1"
                  onChange={n => setCrs({ ...crs, creditUtilizationPct: n })} />
                <NumField label="Time in file (yrs)" value={crs.timeInFileYears} step={0.5} min={0}
                  onChange={n => setCrs({ ...crs, timeInFileYears: n })} />
                <div className="flex items-end pb-1">
                  <div className="w-full">
                    <BoolField label="Active bankruptcy" value={crs.activeBankruptcy} onChange={b => setCrs({ ...crs, activeBankruptcy: b })} />
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title="DataMerch MCA — evidence"
              open={openDm}
              onToggle={() => setOpenDm(o => !o)}
              score={<span className="text-[10px] font-semibold text-gray-400 uppercase">recorded, not scored</span>}
            >
              <div className="grid grid-cols-2 gap-3 pt-2">
                <NumField label="Prior MCA positions" value={dm.priorPositions} step={1} min={0}
                  onChange={n => setDm({ ...dm, priorPositions: n })} />
                <NumField label="Prior defaults" value={dm.priorDefaults} step={1} min={0}
                  onChange={n => setDm({ ...dm, priorDefaults: n })} />
                <NumField label="Current open positions" value={dm.currentOpenPositions} step={1} min={0}
                  onChange={n => setDm({ ...dm, currentOpenPositions: n })} />
                <NumField label="Early payoffs" value={dm.earlyPayoffs} step={1} min={0}
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

          {/* ── RIGHT: Model verdict (sticky) ── */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-4 space-y-4">
              {rec ? (
                <RecommendationView rec={rec} />
              ) : (
                <div className="bg-white border border-gray-200 rounded-[8px] p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Landmark className="w-4 h-4 text-gray-400" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Not scored</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    No bank data connected — the Delt Cash-Flow Decision Model scores a file from its
                    Plaid connection. Link this application to a prospect and connect their bank in the
                    Plaid Portal to get a decision.
                  </p>
                  {(app.compositeScore != null || (app.disqualifiers ?? []).length > 0) && (
                    <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Last persisted verdict</p>
                      {app.compositeScore != null && (
                        <div className="flex justify-between"><span className="text-gray-400">Score</span><span className="font-semibold">{app.compositeScore}/100{app.tier ? ` (${app.tier})` : ''}</span></div>
                      )}
                      {(app.disqualifiers ?? []).map((d, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-red-600"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />{d}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* What-if: proposed advance vs. the model's sized offer */}
              {offer && (
                <div className="bg-white border border-gray-200 rounded-[8px] p-4">
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">What-if: proposed advance</h3>
                  <NumField label="Proposed advance $" value={proposedAdvance} step={5000} min={0} suffix="$"
                    onChange={n => setProposedAdvance(n)} />
                  {whatIf && (
                    <>
                      <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-[6px] ${whatIf.passes ? 'bg-emerald-50' : 'bg-red-50'}`}>
                        {whatIf.passes ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                        <span className={`text-xs font-bold ${whatIf.passes ? 'text-emerald-700' : 'text-red-700'}`}>
                          {whatIf.passes ? 'WITHIN MODEL OFFER' : 'ABOVE MODEL OFFER'}
                        </span>
                        <span className="text-[11px] text-gray-500 ml-auto tabular-nums">
                          Daily debit {fmt$(whatIf.dailyPayment)} · {(whatIf.pctOfDailyRevenue * 100).toFixed(1)}% of rev
                        </span>
                      </div>
                      {!whatIf.passes && (
                        <p className="mt-2 text-[11px] text-gray-500">
                          Model-supported maximum: <strong>{fmt$(whatIf.maxAmount)}</strong> at factor {offer.factor} over {offer.term_months} mo.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

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
                    <div className="flex justify-between"><span className="text-gray-400">Model score</span><span className="font-bold">{displayScore != null ? `${displayScore}/100` : 'Not scored'}{displayTier ? ` (${displayTier})` : ''}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Model decision</span><span className="font-medium">{rec?.decision_label ?? '—'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Requested</span><span>{fmt$(requested)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Sized offer</span><span>{offer ? `${fmt$(offer.amount)} · factor ${offer.factor} · ${holdbackFromOffer(offer)}% holdback` : '—'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Failed gates</span><span>{displayDisqualifiers.length === 0 ? 'None' : displayDisqualifiers.join(', ')}</span></div>
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
            {displayScore != null
              ? <>Model <strong className="text-gray-900">{displayScore}</strong> · <span className={ts.text}>{displayTier ?? '—'}</span></>
              : <>Not scored — no bank data</>}
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
                title={modelApprovable ? 'Approve on the model\'s sized offer' : 'No model offer — approving requires manual terms'}
                className="h-10 px-5 text-sm font-bold text-white bg-emerald-600 rounded-[10px] hover:bg-emerald-500 flex items-center gap-1.5 transition-colors"
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
              <p className="text-xs text-gray-500 mt-0.5">
                {modelApprovable
                  ? 'Terms come from the model\'s sized offer. A Capital deal will be created.'
                  : 'No model offer on this file — enter manual terms. A Capital deal will be created.'}
              </p>
            </div>
            <div className="px-5 py-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Merchant</span><span className="font-medium">{app.businessName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Funded amount</span><span className="font-medium">{fmt$(requested)}</span></div>
              {modelApprovable ? (
                <>
                  <div className="flex justify-between"><span className="text-gray-500">Factor</span><span className="font-medium">{approveFactor.toFixed(2)}x</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Total owed</span><span className="font-medium">{fmt$(Math.round(requested * approveFactor))}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Holdback</span><span className="font-medium">{approveHoldback}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tier</span><span className="font-medium">{approveTier}</span></div>
                  {offer && requested > offer.amount && (
                    <p className="text-[11px] text-amber-600 pt-1">
                      Requested exceeds the model's sized offer ({fmt$(offer.amount)}).
                    </p>
                  )}
                </>
              ) : (
                <div className="pt-1 space-y-3">
                  <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-[6px] px-2.5 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    Approving without a model offer. Terms below are manual and on your judgment.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField label="Factor" value={manualFactor} step={0.01} min={1} suffix="x" onChange={setManualFactor} />
                    <NumField label="Holdback %" value={manualHoldback} step={1} min={1} suffix="%" onChange={setManualHoldback} />
                  </div>
                  <SelectField<UWTier> label="Tier" value={manualTier}
                    options={[
                      { value: 'Tier 1', label: 'Tier 1' }, { value: 'Tier 2', label: 'Tier 2' },
                      { value: 'Tier 3', label: 'Tier 3' }, { value: 'Tier 4', label: 'Tier 4' },
                      { value: 'Decline', label: 'Decline (override)' },
                    ]}
                    onChange={setManualTier} />
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Total owed</span><span className="font-medium">{fmt$(Math.round(requested * (manualTermsValid ? manualFactor : 0)))}</span></div>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={() => setApproveOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-[6px]">Cancel</button>
              <button onClick={confirmApprove} disabled={approving || (!modelApprovable && !manualTermsValid)}
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
