/**
 * Deal Room — the single surface that takes a verbal yes to a fully signed
 * merchant without leaving the CRM. One page per deal submission, laid out
 * as the SOP's stages (docs/sop-deal-flow.md):
 *
 *   1. Plaid bank connection        (lead-scoped hosted link)
 *   2. Funding application (DLT-APP) — owner + rep sign
 *   3. Underwriting                  (linked UW app, tier/terms)
 *   4. MCA agreement                 — in-person (iPad) or email; bank on file
 *   5. Delt countersignature         (contracts.countersign)
 *   6. Processor MPA + boarding      (existing boarding panel)
 *   7. Documents                     (uploads + auto-filed signed PDFs)
 *
 * Everything hangs off deal_submissions via the spine (lead_id /
 * submission_id), and every chip updates over realtime.
 */

import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAppNavigate } from '../NavigationContext';
import {
  ArrowLeft, Banknote, CheckCircle2, Circle, ExternalLink, FileSignature,
  Landmark, Loader2, PenLine, RefreshCw, Scale, Send, ShieldCheck, X,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useSession } from '../SessionContext';
import { useDealSubmissions, dealSubmissionActions, BOARDING_CHANNELS, type BoardingChannel, type DealSubmission } from '../dealSubmissionsStore';
import { useLeads, useUnderwriting, underwritingActions, type UWApplication } from '../crmStore';
import { usePlaidItems, usePlaidLinkRequests, plaidActions } from '../plaidStore';
import { useContracts, contractActions, type Contract } from '../contractsStore';
import { useApplicationForSubmission } from '../merchantApplicationsStore';
import { useDealDocuments } from '../dealDocumentsStore';
import { useCapital, capitalActions } from '../capitalStore';
import { DealDocumentsPanel } from '../DealDocumentsPanel';
import { MpaBoardingPanel } from '../MpaBoardingPanel';
import { fundingWriteback } from '../spineWritebacks';

const card = 'bg-white rounded-[8px] border border-gray-200 p-4';
const btnPrimary = 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white rounded-[6px] text-xs font-semibold hover:bg-brand/90 disabled:opacity-50';
const btnSecondary = 'inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-[6px] text-xs font-semibold hover:bg-gray-50 disabled:opacity-50';
const btnGhost = 'inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded';

function StepChip({ done, label }: { done: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
      done ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'
    }`}>
      {done ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
      {label}
    </span>
  );
}

function StageHeader({ n, title, icon: Icon, state }: { n: number; title: string; icon: any; state?: string }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <p className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-[10px] font-bold flex items-center justify-center">{n}</span>
        <Icon className="w-3.5 h-3.5" /> {title}
      </p>
      {state && <span className="text-[11px] font-medium text-gray-500">{state}</span>}
    </div>
  );
}

const envelopeChip = (c: Contract | null | undefined): string =>
  !c ? 'not sent' : c.status === 'completed' ? 'signed' : c.status;

/** Active (non-dead) contract of a kind on this submission, newest first. */
function activeContract(contracts: Contract[], submissionId: string, kind: Contract['kind']): Contract | null {
  return contracts.find(c => c.kind === kind && c.submissionId === submissionId
    && !['voided', 'declined'].includes(c.status)) ?? null;
}

export function DealRoomPage() {
  const { submissionId = '' } = useParams<{ submissionId: string }>();
  const routerNavigate = useNavigate();
  const { navigate } = useAppNavigate();
  const { can, org, displayName } = useSession();
  const { submissions, isLoading } = useDealSubmissions();
  const leads = useLeads();
  const uwApps = useUnderwriting();
  const items = usePlaidItems();
  const requests = usePlaidLinkRequests();
  const contracts = useContracts();
  const mpaApp = useApplicationForSubmission(submissionId);
  const { documents } = useDealDocuments();
  const { deals: capitalDeals } = useCapital();

  const sub = submissions.find(s => s.id === submissionId) ?? null;
  const lead = sub?.leadId ? leads.find(l => l.id === sub.leadId) ?? null : null;
  const uw = useMemo<UWApplication | null>(() => {
    if (!sub) return null;
    return uwApps.find(a => a.submissionId === sub.id)
      ?? uwApps.find(a => a.businessName.trim().toLowerCase() === sub.merchantName.trim().toLowerCase())
      ?? null;
  }, [uwApps, sub]);

  const appContract = sub ? activeContract(contracts, sub.id, 'deal_application') : null;
  const mcaContract = sub ? activeContract(contracts, sub.id, 'mca') : null;
  const mpaContract = sub ? activeContract(contracts, sub.id, 'mpa') : null;

  const plaidConnected = Boolean(sub?.leadId && items.some(i => i.leadId === sub.leadId && i.status === 'active'));
  const pendingInvite = sub?.leadId ? requests.find(r => r.leadId === sub.leadId && r.status === 'pending') ?? null : null;
  const subDocs = documents.filter(d => d.submissionId === submissionId);
  const hasId = subDocs.some(d => d.docKind === 'drivers_license');
  const hasCheck = subDocs.some(d => d.docKind === 'voided_check');
  const mpaDone = mpaApp?.status === 'boarded' || mpaContract?.status === 'completed';

  const [busy, setBusy] = useState<string | null>(null);
  const [mcaComposer, setMcaComposer] = useState<'embedded' | 'email' | null>(null);

  if (isLoading) {
    return <div className="p-10 text-center"><Loader2 className="w-6 h-6 mx-auto animate-spin text-gray-300" /></div>;
  }
  if (!sub) {
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        Deal not found.{' '}
        <button className="text-brand hover:underline" onClick={() => navigate('/agent-desk')}>Back to Agent Desk</button>
      </div>
    );
  }

  const openSession = async (contractId: string, recipient: 'signer' | 'guarantor' | 'rep', key: string) => {
    setBusy(key);
    try {
      const url = await contractActions.signingUrl(contractId, recipient);
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not open the signing session');
    } finally {
      setBusy(null);
    }
  };

  const countersign = async (contractId: string) => {
    setBusy(`cs:${contractId}`);
    try {
      const url = await contractActions.countersignUrl(contractId);
      if (url) window.open(url, '_blank', 'noopener');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Countersign session failed');
    } finally {
      setBusy(null);
    }
  };

  const envelopeActions = (c: Contract) => (
    <span className="inline-flex items-center gap-1">
      {(c.status === 'sent' || c.status === 'delivered') && (
        <>
          <button className={btnGhost} disabled={busy !== null} title="Refresh status"
            onClick={() => void contractActions.refreshStatus(c.id)}>
            <RefreshCw className="w-3 h-3" />
          </button>
          {c.mode === 'email' && (
            <button className={btnGhost} disabled={busy !== null} title="Re-send the DocuSign email"
              onClick={() => void contractActions.resend(c.id)}>
              <Send className="w-3 h-3" /> Resend
            </button>
          )}
          <button className={btnGhost} disabled={busy !== null} title="Void and start over"
            onClick={() => { if (window.confirm('Void this envelope? Signers can no longer sign it.')) void contractActions.void(c.id); }}>
            <X className="w-3 h-3" /> Void
          </button>
        </>
      )}
    </span>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button className="text-sm text-brand hover:underline inline-flex items-center gap-1" onClick={() => routerNavigate(-1)}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{sub.merchantName}</h1>
          <p className="text-xs text-gray-500">
            {sub.contactName || 'No contact'} · {sub.email || 'no email'} · {sub.phone || 'no phone'}
            {lead && <> · lead <button className="text-brand hover:underline" onClick={() => navigate('/leads')}>{lead.businessName}</button></>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-gray-500 font-medium">Channel</label>
          <select
            value={sub.channel ?? ''}
            onChange={(e) => void dealSubmissionActions.setChannel(sub.id, (e.target.value || null) as BoardingChannel | null)}
            className="px-2 py-1.5 bg-white border border-gray-300 rounded-[6px] text-xs text-gray-700 focus:outline-none"
          >
            <option value="">—</option>
            {BOARDING_CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* ── Packet summary ── */}
      <div className={`${card} flex flex-wrap items-center gap-2`}>
        <StepChip done={plaidConnected} label="Bank connected" />
        <StepChip done={appContract?.status === 'completed'} label="Application signed" />
        <StepChip done={Boolean(uw && (uw.stage === 'Approved'))} label="Underwriting approved" />
        <StepChip done={mcaContract?.status === 'completed'} label="MCA signed" />
        <StepChip done={Boolean(mcaContract?.countersignedAt)} label="Countersigned" />
        <StepChip done={Boolean(mpaDone)} label="MPA signed/boarded" />
        <StepChip done={hasId} label="Photo ID" />
        <StepChip done={hasCheck} label="Voided check" />
      </div>

      {/* ── 1. Plaid ── */}
      <div className={card}>
        <StageHeader n={1} title="Bank connection (Plaid)" icon={Landmark}
          state={plaidConnected ? 'Connected' : pendingInvite ? 'Link sent — waiting' : 'Not connected'} />
        {sub.leadId ? (
          <div className="flex flex-wrap items-center gap-2">
            {!plaidConnected && (
              <button className={btnPrimary} disabled={busy !== null}
                onClick={async () => { setBusy('plaid'); try { await plaidActions.createHostedLink(sub.leadId!); } finally { setBusy(null); } }}>
                {busy === 'plaid' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Landmark className="w-3.5 h-3.5" />}
                {pendingInvite ? 'New connect link' : 'Send connect link'}
              </button>
            )}
            {pendingInvite && !plaidConnected && (
              <span className="text-[11px] text-gray-400">
                Sent {pendingInvite.hostedLinkUrl ? '— link on the lead' : ''}; auto-reminders on day 1 & 3. Stay on the phone until they finish.
              </span>
            )}
            {plaidConnected && (
              <button className={btnGhost} onClick={() => navigate('/underwriting')}>
                Review in Plaid portal →
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs text-amber-600">
            No lead linked to this deal — create the lead first (Leads → Quick lead), then Start deal from it, so Plaid and underwriting attach to the same prospect.
          </p>
        )}
      </div>

      {/* ── 2. Funding application ── */}
      <div className={card}>
        <StageHeader n={2} title="Funding application (Form DLT-APP)" icon={FileSignature}
          state={envelopeChip(appContract)} />
        <div className="flex flex-wrap items-center gap-2">
          {!appContract && (
            <>
              <button className={btnPrimary} disabled={busy !== null || !sub.email}
                onClick={async () => {
                  setBusy('app-embedded');
                  try {
                    const c = await contractActions.sendApplication({ submissionId: sub.id, mode: 'embedded' });
                    await openSession(c.id, 'signer', 'app-owner');
                  } catch { /* toast in store */ } finally { setBusy(null); }
                }}>
                {busy === 'app-embedded' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />}
                Sign in person
              </button>
              <button className={btnSecondary} disabled={busy !== null || !sub.email}
                onClick={async () => {
                  setBusy('app-email');
                  try { await contractActions.sendApplication({ submissionId: sub.id, mode: 'email' }); }
                  catch { /* toast in store */ } finally { setBusy(null); }
                }}>
                {busy === 'app-email' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Email for signature
              </button>
              {!sub.email && <span className="text-[11px] text-amber-600">Add the merchant's email to the deal first.</span>}
            </>
          )}
          {appContract && appContract.status !== 'completed' && appContract.mode === 'embedded' && (
            <>
              <button className={btnPrimary} disabled={busy !== null}
                onClick={() => void openSession(appContract.id, 'signer', 'app-owner')}>
                {busy === 'app-owner' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />}
                Owner signs
              </button>
              <button className={btnSecondary} disabled={busy !== null}
                onClick={() => void openSession(appContract.id, 'rep', 'app-rep')}>
                {busy === 'app-rep' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />}
                You sign (rep)
              </button>
            </>
          )}
          {appContract && envelopeActions(appContract)}
          {appContract?.status === 'completed' && (
            <span className="text-[11px] text-emerald-600 font-medium">Signed{appContract.countersignedAt ? ' · acknowledged' : ''} — filed in Documents below.</span>
          )}
        </div>
      </div>

      {/* ── 3. Underwriting ── */}
      <div className={card}>
        <StageHeader n={3} title="Underwriting" icon={Scale}
          state={uw ? `${uw.stage}${uw.tier ? ` · ${uw.tier}` : ''}` : 'No file'} />
        <div className="flex flex-wrap items-center gap-2">
          {!uw && (
            <button className={btnPrimary} disabled={busy !== null}
              onClick={() => {
                const app = underwritingActions.create({
                  businessName: sub.merchantName,
                  industry: sub.vertical || 'General',
                  submissionId: sub.id,
                  leadId: sub.leadId ?? undefined,
                  contactName: sub.contactName || undefined,
                  contactEmail: sub.email || undefined,
                  contactPhone: sub.phone || undefined,
                  source: 'Deal Room',
                });
                navigate(`/underwriting/${app.id}`);
              }}>
              <Scale className="w-3.5 h-3.5" /> Create underwriting file
            </button>
          )}
          {uw && (
            <>
              <button className={btnSecondary} onClick={() => navigate(`/underwriting/${uw.id}`)}>
                Open underwriting file
              </button>
              {uw.stage === 'Approved' && (
                <span className="text-[11px] text-gray-500">
                  {uw.factorRate ? `Factor ${uw.factorRate}` : ''}{uw.proposedPayback ? ` · payback $${Math.round(uw.proposedPayback).toLocaleString()}` : ''}{uw.holdbackPct ? ` · ${uw.holdbackPct}% holdback` : ''}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── 4. MCA agreement ── */}
      <div className={card}>
        <StageHeader n={4} title="MCA agreement (Purchase & Sale of Future Receivables)" icon={Banknote}
          state={envelopeChip(mcaContract)} />
        <div className="flex flex-wrap items-center gap-2">
          {!mcaContract && (
            <>
              <button className={btnPrimary} disabled={busy !== null} onClick={() => setMcaComposer('embedded')}>
                <PenLine className="w-3.5 h-3.5" /> Sign in person
              </button>
              <button className={btnSecondary} disabled={busy !== null} onClick={() => setMcaComposer('email')}>
                <Send className="w-3.5 h-3.5" /> Email for signature
              </button>
              <span className="text-[11px] text-gray-400">
                Schedule A prefills from underwriting; the designated bank account fills from the application on file (never typed here).
              </span>
            </>
          )}
          {mcaContract && mcaContract.status !== 'completed' && mcaContract.mode === 'embedded' && (
            <>
              <button className={btnPrimary} disabled={busy !== null}
                onClick={() => void openSession(mcaContract.id, 'signer', 'mca-mer')}>
                {busy === 'mca-mer' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />}
                Merchant signs
              </button>
              {mcaContract.guarantorName && (
                <button className={btnSecondary} disabled={busy !== null}
                  onClick={() => void openSession(mcaContract.id, 'guarantor', 'mca-gua')}>
                  {busy === 'mca-gua' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />}
                  Guarantor signs
                </button>
              )}
            </>
          )}
          {mcaContract && envelopeActions(mcaContract)}
          {mcaContract?.status === 'completed' && (
            <span className="text-[11px] text-emerald-600 font-medium">
              Merchant side signed{mcaContract.countersignedAt ? ' · executed by Delt' : ' — awaiting Delt countersignature'}
            </span>
          )}
        </div>
      </div>

      {/* ── 5. Countersign ── */}
      {can('contracts.countersign') && (
        <div className={card}>
          <StageHeader n={5} title="Delt countersignature" icon={ShieldCheck}
            state={mcaContract?.countersignedAt ? 'Executed' : mcaContract ? 'Pending' : '—'} />
          <div className="flex flex-wrap items-center gap-2">
            {mcaContract && !mcaContract.countersignedAt && (
              <button className={btnPrimary} disabled={busy !== null}
                onClick={() => void countersign(mcaContract.id)}>
                {busy === `cs:${mcaContract.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                Countersign MCA now
              </button>
            )}
            {mcaContract?.countersignedAt && (
              <span className="text-[11px] text-emerald-600 font-medium">
                Countersigned {new Date(mcaContract.countersignedAt).toLocaleString()} by {mcaContract.countersignerEmail}
              </span>
            )}
            {!mcaContract && <span className="text-[11px] text-gray-400">Send the MCA first — the countersign step unlocks once the merchant side has signed.</span>}
            <span className="text-[11px] text-gray-400">The agreement is not executed — and funding stays blocked — until Delt countersigns.</span>
          </div>
        </div>
      )}

      {/* ── Funding gate ── */}
      {(() => {
        const capDeal = capitalDeals.find(d => d.submissionId === sub.id) ?? null;
        if (!capDeal) return null;
        return (
          <div className={card}>
            <StageHeader n={0} title={`Capital deal ${capDeal.id}`} icon={Banknote}
              state={capDeal.status === 'approved' ? 'Awaiting funding' : capDeal.status} />
            <div className="flex flex-wrap items-center gap-2">
              {capDeal.status === 'approved' && can('capital.fund') && (
                <button className={btnPrimary} disabled={busy !== null}
                  onClick={async () => {
                    setBusy('fund');
                    try {
                      const ok = await capitalActions.markFunded(capDeal.id);
                      if (ok) await fundingWriteback(sub.id, 'funded');
                    } finally { setBusy(null); }
                  }}>
                  {busy === 'fund' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Banknote className="w-3.5 h-3.5" />}
                  Mark funded
                </button>
              )}
              {capDeal.status === 'approved' && (
                <span className="text-[11px] text-gray-400">
                  The server verifies the full signed packet (all chips above green) before funding is allowed.
                </span>
              )}
              {capDeal.status !== 'approved' && capDeal.fundedAt && (
                <span className="text-[11px] text-emerald-600 font-medium">
                  Funded {new Date(capDeal.fundedAt).toLocaleDateString()} — ${capDeal.fundedAmt.toLocaleString()} at {capDeal.factor}
                </span>
              )}
              <button className={btnGhost} onClick={() => navigate(`/deals/${capDeal.id}`)}>Open deal →</button>
            </div>
          </div>
        );
      })()}

      {/* ── 6. Processor MPA + boarding ── */}
      <div className={card}>
        <StageHeader n={6} title="Processor MPA & boarding" icon={FileSignature}
          state={mpaApp ? mpaApp.status : 'not started'} />
        <MpaBoardingPanel submission={sub as DealSubmission} />
      </div>

      {/* ── 7. Documents ── */}
      <div className={card}>
        <StageHeader n={7} title="Documents (ID, voided check, signed PDFs)" icon={ExternalLink} />
        <DealDocumentsPanel
          submissionId={sub.id}
          orgId={org?.id ?? ''}
          uploadedBy={displayName}
          copyable
          contactName={sub.contactName}
          contactEmail={sub.email}
        />
      </div>

      {mcaComposer && (
        <McaComposerModal
          sub={sub}
          uw={uw}
          mode={mcaComposer}
          onClose={() => setMcaComposer(null)}
          onSent={async (contract) => {
            setMcaComposer(null);
            if (contract.mode === 'embedded') await openSession(contract.id, 'signer', 'mca-mer');
          }}
        />
      )}
    </div>
  );
}

// ── Compact Schedule A composer for the Deal Room ──
// (The full composer stays on /documents; this one prefills from the spine
// and always sends with submissionId + bank-on-file.)

function McaComposerModal({ sub, uw, mode, onClose, onSent }: {
  sub: DealSubmission;
  uw: UWApplication | null;
  mode: 'embedded' | 'email';
  onClose: () => void;
  onSent: (c: Contract) => void | Promise<void>;
}) {
  const approvedAdvance = uw?.proposedPayback && uw?.factorRate
    ? Math.round(uw.proposedPayback / uw.factorRate)
    : uw?.requestedAmount;
  const [form, setForm] = useState({
    legalName: sub.merchantName,
    signerName: sub.contactName || '',
    signerEmail: sub.email || '',
    signerTitle: 'Owner',
    purchasePrice: approvedAdvance ? String(approvedAdvance) : '',
    factorRate: uw?.factorRate ? String(uw.factorRate) : '1.35',
    termMonths: '6',
    hasGuarantor: true,
    guarantorName: sub.contactName || '',
    guarantorEmail: sub.email || '',
  });
  const [sending, setSending] = useState(false);
  const up = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }));

  const price = parseFloat(form.purchasePrice) || 0;
  const factor = parseFloat(form.factorRate) || 0;
  const payback = Math.round(price * factor * 100) / 100;
  const months = parseFloat(form.termMonths) || 0;
  const dailyAch = payback > 0 && months > 0 ? Math.round(payback / (months * 21)) : 0;

  const submit = async () => {
    if (!form.signerName.trim() || !/.+@.+\..+/.test(form.signerEmail)) {
      toast.error('Signer name and a valid email are required.'); return;
    }
    if (!(price > 0) || !(factor > 0)) { toast.error('Advance and factor must be positive.'); return; }
    setSending(true);
    try {
      const contract = await contractActions.send({
        merchantName: sub.merchantName,
        submissionId: sub.id,
        leadId: sub.leadId ?? undefined,
        mode,
        useBankOnFile: true,
        signerName: form.signerName.trim(),
        signerEmail: form.signerEmail.trim(),
        signerTitle: form.signerTitle.trim() || undefined,
        guarantorName: form.hasGuarantor ? form.guarantorName.trim() : undefined,
        guarantorEmail: form.hasGuarantor ? form.guarantorEmail.trim() : undefined,
        terms: {
          merchantLegalName: form.legalName.trim() || sub.merchantName,
          purchasePrice: price,
          purchasedAmount: payback,
          factorRate: factor,
          dailyRemittance: dailyAch || undefined,
          remittanceFrequency: 'Daily',
          remittanceMethod: 'ACH',
          effectiveDate: new Date().toISOString().slice(0, 10),
          hasGuarantor: form.hasGuarantor,
          guarantorName: form.hasGuarantor ? form.guarantorName.trim() : undefined,
        },
      });
      await onSent(contract);
    } catch { /* toast in store */ } finally {
      setSending(false);
    }
  };

  const input = 'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:ring-2 focus:ring-brand/20';
  const label = 'text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[8px] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900">
            MCA agreement — {mode === 'embedded' ? 'sign in person' : 'email for signature'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div><span className={label}>Merchant legal name</span>
            <input className={input} value={form.legalName} onChange={e => up({ legalName: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><span className={label}>Signer name</span>
              <input className={input} value={form.signerName} onChange={e => up({ signerName: e.target.value })} /></div>
            <div><span className={label}>Signer email</span>
              <input className={input} value={form.signerEmail} onChange={e => up({ signerEmail: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><span className={label}>Advance ($)</span>
              <input className={input} value={form.purchasePrice} onChange={e => up({ purchasePrice: e.target.value })} /></div>
            <div><span className={label}>Factor rate</span>
              <input className={input} value={form.factorRate} onChange={e => up({ factorRate: e.target.value })} /></div>
            <div><span className={label}>Term (months)</span>
              <input className={input} value={form.termMonths} onChange={e => up({ termMonths: e.target.value })} /></div>
          </div>
          <p className="text-[11px] text-gray-500">
            Payback <b>${payback.toLocaleString()}</b> · est. daily ACH <b>${dailyAch.toLocaleString()}</b> · bank account fills from the application on file (Exhibit B).
          </p>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" checked={form.hasGuarantor} onChange={e => up({ hasGuarantor: e.target.checked })} className="rounded" />
            Personal guaranty (Article 7)
          </label>
          {form.hasGuarantor && (
            <div className="grid grid-cols-2 gap-3">
              <div><span className={label}>Guarantor name</span>
                <input className={input} value={form.guarantorName} onChange={e => up({ guarantorName: e.target.value })} /></div>
              <div><span className={label}>Guarantor email</span>
                <input className={input} value={form.guarantorEmail} onChange={e => up({ guarantorEmail: e.target.value })} /></div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200">
          <button className={btnSecondary} onClick={onClose}>Cancel</button>
          <button className={btnPrimary} disabled={sending} onClick={() => void submit()}>
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : mode === 'embedded' ? <PenLine className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
            {mode === 'embedded' ? 'Generate & open signing' : 'Send for signature'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DealRoomPage;
