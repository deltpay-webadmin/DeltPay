/**
 * MPA boarding panel — lives in the Agent Desk expanded row.
 *
 * Drives the full boarding lifecycle for a deal:
 *   1. Start (or resume) the unified MPA application wizard — staff fill it
 *      with the merchant present, or send the merchant a secure link.
 *   2. Once complete: pick the processor channel, enter pricing
 *      (Luqra/Paysafe), preview the filled MPA PDF, and either open an
 *      in-person DocuSign signing session (iPad) or send for remote
 *      signature. Square deals get the OrderOut portal link + copy packet.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BookmarkPlus, ClipboardCopy, ExternalLink, FileSignature, FileText, Link2, Loader2, PenLine, RefreshCw, Send, Trash2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { DealSubmission } from './dealSubmissionsStore';
import {
  merchantApplicationActions as mpaActions,
  useApplicationForSubmission,
  type MerchantApplication,
} from './merchantApplicationsStore';
import { contractActions, useContracts } from './contractsStore';
import { applyPricingTemplate, builtInPricingTemplates } from './mpaPricingTemplates';
import { mpaPricingTemplateActions, useMpaPricingTemplates } from './mpaPricingTemplatesStore';
import { fundingWriteback } from './spineWritebacks';
import type { LuqraPricing, PaysafePricing } from '../../../features/mpa/types';

const ORDEROUT_URL = 'https://reseller.orderout.co/portal/links?org=delt&iso=all';

const btnPrimary =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50';
const btnSecondary =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50';
const btnGhost =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50';

const STATUS_CHIP: Record<string, string> = {
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  submitted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  boarded: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

// ── Pricing field descriptors (kept minimal for v1) ──

const LUQRA_DEFAULT: LuqraPricing = {
  applicationType: 'flat_rate', discount: 'daily', businessType: 'retail',
  qualifiedRatePct: '', qualifiedItemFee: '', midQualifiedRatePct: '', midQualifiedItemFee: '',
  nonQualifiedRatePct: '', nonQualifiedItemFee: '', amexQualifiedRatePct: '', amexQualifiedItemFee: '',
  pinDebitRatePct: '', pinDebitItemFee: '', batchFee: '', chargebackFee: '25.00', retrievalFee: '15.00',
  monthlyMinimumFee: '', annualFee: '', regulatoryFee: '', monthlyServiceFee: '', aofOccurrenceFee: '',
  earlyDeconversionFee: '', pciAnnualFee: '', pciMonthlyFee: '', mccCode: '', agentName: '', agentCode: '',
};

const PAYSAFE_DEFAULT: PaysafePricing = {
  structure: 'flat_rate', discountMethod: 'daily',
  creditQualifiedRatePct: '', debitQualifiedRatePct: '', transactionFee: '',
  amexQualifiedRatePct: '', amexTransactionFee: '', errRatePct: '', interchangeCreditBps: '',
  avsFee: '', batchHeaderFee: '', monthlyMinimumFee: '', monthlyServiceFee: '', annualFee: '',
  regulatoryFee: '', applicationFee: '', chargebackFee: '25.00', retrievalFee: '15.00',
  earlyTerminationBeforeYear1: '', earlyTerminationAfterYear1: '', pciNonComplianceFee: '',
  mccSic: '', salesName: '', salesOfficeNumber: '',
};

interface PricingField { key: string; label: string; select?: string[] }

const LUQRA_FIELDS: PricingField[] = [
  { key: 'applicationType', label: 'Pricing type', select: ['flat_rate', 'tiered', 'cash_discount', 'interchange', 'err', 'cpvcnp'] },
  { key: 'discount', label: 'Discount', select: ['daily', 'monthly'] },
  { key: 'businessType', label: 'Business type', select: ['retail', 'restaurant', 'internet', 'moto'] },
  { key: 'qualifiedRatePct', label: 'Qualified rate %' },
  { key: 'qualifiedItemFee', label: 'Per-item fee $' },
  { key: 'amexQualifiedRatePct', label: 'Amex rate %' },
  { key: 'amexQualifiedItemFee', label: 'Amex per-item $' },
  { key: 'pinDebitRatePct', label: 'PIN debit rate %' },
  { key: 'pinDebitItemFee', label: 'PIN debit per-item $' },
  { key: 'batchFee', label: 'Batch fee $' },
  { key: 'chargebackFee', label: 'Chargeback fee $' },
  { key: 'retrievalFee', label: 'Retrieval fee $' },
  { key: 'monthlyMinimumFee', label: 'Monthly minimum $' },
  { key: 'monthlyServiceFee', label: 'Monthly service $' },
  { key: 'annualFee', label: 'Annual fee $' },
  { key: 'regulatoryFee', label: 'Regulatory fee $' },
  { key: 'pciAnnualFee', label: 'PCI annual $' },
  { key: 'earlyDeconversionFee', label: 'Early deconversion $' },
  { key: 'aofOccurrenceFee', label: 'AOF / month $' },
  { key: 'mccCode', label: 'MCC' },
  { key: 'agentName', label: 'Agent name' },
  { key: 'agentCode', label: 'Agent code' },
];

const PAYSAFE_FIELDS: PricingField[] = [
  { key: 'structure', label: 'Pricing structure', select: ['flat_rate', 'interchange_plus', 'tiered', 'err'] },
  { key: 'discountMethod', label: 'Discount method', select: ['daily', 'monthly'] },
  { key: 'creditQualifiedRatePct', label: 'Credit qualified %' },
  { key: 'debitQualifiedRatePct', label: 'Debit qualified %' },
  { key: 'transactionFee', label: 'Transaction fee $' },
  { key: 'amexQualifiedRatePct', label: 'Amex OptBlue %' },
  { key: 'amexTransactionFee', label: 'Amex per-item $' },
  { key: 'avsFee', label: 'AVS fee $' },
  { key: 'batchHeaderFee', label: 'Batch header $' },
  { key: 'monthlyMinimumFee', label: 'Monthly minimum $' },
  { key: 'monthlyServiceFee', label: 'Statement fee $' },
  { key: 'annualFee', label: 'Annual fee $' },
  { key: 'regulatoryFee', label: 'Regulatory fee $' },
  { key: 'applicationFee', label: 'Application fee $' },
  { key: 'chargebackFee', label: 'Chargeback fee $' },
  { key: 'retrievalFee', label: 'Retrieval fee $' },
  { key: 'earlyTerminationBeforeYear1', label: 'ETF < 1 yr $' },
  { key: 'earlyTerminationAfterYear1', label: 'ETF > 1 yr $' },
  { key: 'mccSic', label: 'MCC/SIC' },
  { key: 'salesName', label: 'Sales name' },
  { key: 'salesOfficeNumber', label: 'Sales office #' },
];

function PricingGrid({
  fields, value, onChange,
}: {
  fields: PricingField[];
  value: Record<string, string>;
  onChange: (key: string, v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
      {fields.map((f) => (
        <label key={f.key} className="block">
          <span className="block text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">{f.label}</span>
          {f.select ? (
            <select
              value={value[f.key] ?? ''}
              onChange={(e) => onChange(f.key, e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-[6px] text-xs text-gray-700 focus:outline-none"
            >
              {f.select.map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
            </select>
          ) : (
            <input
              value={value[f.key] ?? ''}
              onChange={(e) => onChange(f.key, e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-[6px] text-xs text-gray-700 focus:outline-none"
            />
          )}
        </label>
      ))}
    </div>
  );
}

export function MpaBoardingPanel({ submission }: { submission: DealSubmission }) {
  const navigate = useNavigate();
  const app = useApplicationForSubmission(submission.id);
  const contracts = useContracts();
  const mpaContract = useMemo(
    () => contracts.find((c) => c.kind === 'mpa' && c.submissionId === submission.id
      && !['voided', 'declined'].includes(c.status)) ?? null,
    [contracts, submission.id],
  );

  const [busy, setBusy] = useState<string | null>(null);
  const [pricingDraft, setPricingDraft] = useState<Record<string, string> | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [linkInfo, setLinkInfo] = useState<{ url: string; expiresAt: string } | null>(null);
  const [templateSel, setTemplateSel] = useState('');

  const channel = submission.channel;
  const isProcessorChannel = channel === 'Luqra' || channel === 'Paysafe';
  const savedTemplates = useMpaPricingTemplates(isProcessorChannel ? (channel as 'Luqra' | 'Paysafe') : undefined);
  const monthlyVolume = Number(String(app?.data?.profile?.monthlyVolume ?? '').replace(/[^0-9.]/g, '')) || 0;
  const builtInTemplates = useMemo(
    () => (isProcessorChannel ? builtInPricingTemplates(channel as 'Luqra' | 'Paysafe', monthlyVolume) : []),
    [isProcessorChannel, channel, monthlyVolume],
  );

  const startApplication = async (thenNavigate: boolean) => {
    setBusy('start');
    const created = await mpaActions.createForSubmission(submission.id);
    setBusy(null);
    if (created && thenNavigate) navigate(`/dashboard/mpa/${created.id}`);
    return created;
  };

  const sendMerchantLink = async () => {
    setBusy('link');
    let target: MerchantApplication | null = app;
    if (!target) target = await startApplication(false);
    if (target) {
      const link = await mpaActions.createLink(target.id, submission.email || undefined);
      if (link) {
        setLinkInfo(link);
        void navigator.clipboard.writeText(link.url);
        toast.success('Merchant link copied to clipboard');
      }
    }
    setBusy(null);
  };

  const currentPricing = (): Record<string, string> => {
    if (pricingDraft) return pricingDraft;
    const stored = channel === 'Luqra' ? app?.pricing?.luqra : app?.pricing?.paysafe;
    return { ...(channel === 'Luqra' ? LUQRA_DEFAULT : PAYSAFE_DEFAULT), ...(stored as any) };
  };

  const savePricing = async (): Promise<boolean> => {
    if (!app || !isProcessorChannel) return false;
    return mpaActions.savePricing(app.id, channel as 'Luqra' | 'Paysafe', currentPricing() as any);
  };

  const selectTemplate = (value: string) => {
    setTemplateSel(value);
    if (!value) return;
    const pricing = value.startsWith('builtin:')
      ? builtInTemplates.find((t) => `builtin:${t.key}` === value)?.pricing
      : savedTemplates.find((t) => `saved:${t.id}` === value)?.pricing;
    if (pricing) {
      setPricingDraft(applyPricingTemplate(currentPricing(), pricing));
      toast.success('Template applied — review the grid before generating');
    }
  };

  const saveAsTemplate = async () => {
    if (!isProcessorChannel) return;
    const name = window.prompt(`Save the current ${channel} pricing grid as a template:`);
    if (!name?.trim()) return;
    setBusy('template');
    const ok = await mpaPricingTemplateActions.save(channel as 'Luqra' | 'Paysafe', name, currentPricing());
    setBusy(null);
    if (ok) setTemplateSel('');
  };

  const selectedSavedTemplate = templateSel.startsWith('saved:')
    ? savedTemplates.find((t) => t.id === templateSel.slice('saved:'.length)) ?? null
    : null;

  const deleteSelectedTemplate = async () => {
    if (!selectedSavedTemplate) return;
    if (!window.confirm(`Delete the "${selectedSavedTemplate.name}" template for everyone in the org?`)) return;
    setBusy('template');
    const ok = await mpaPricingTemplateActions.remove(selectedSavedTemplate.id);
    setBusy(null);
    if (ok) setTemplateSel('');
  };

  const previewPdf = async () => {
    if (!app || !isProcessorChannel) return;
    setBusy('preview');
    const ok = await savePricing();
    if (ok) {
      const res = await mpaActions.previewMpa(app.id, channel as 'Luqra' | 'Paysafe');
      if (res) {
        setWarnings(res.warnings);
        const bytes = Uint8Array.from(atob(res.pdfBase64), (c) => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        window.open(url, '_blank');
      }
    }
    setBusy(null);
  };

  const signNow = async (mode: 'embedded' | 'email') => {
    if (!app || !isProcessorChannel) return;
    setBusy(mode === 'embedded' ? 'sign' : 'email');
    try {
      const ok = await savePricing();
      if (!ok) return;
      const { contract, warnings: w } = await contractActions.sendMpa({ applicationId: app.id, mode });
      setWarnings(w);
      if (mode === 'embedded') {
        const url = await contractActions.signingUrl(contract.id);
        setSigningUrl(url);
      }
    } catch {
      /* toasts handled in the stores */
    } finally {
      setBusy(null);
    }
  };

  const regenerateSigningUrl = async () => {
    if (!mpaContract) return;
    setBusy('regen');
    try {
      setSigningUrl(await contractActions.signingUrl(mpaContract.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create a signing session');
    } finally {
      setBusy(null);
    }
  };

  const copyPacket = async (includeSensitive: boolean) => {
    if (!app) return;
    if (includeSensitive && !window.confirm('Copy the FULL packet including SSNs and bank numbers? Paste it straight into the OrderOut portal, then clear your clipboard.')) {
      return;
    }
    setBusy('packet');
    const text = await mpaActions.packet(app.id, includeSensitive);
    setBusy(null);
    if (text) {
      await navigator.clipboard.writeText(text);
      toast.success(includeSensitive ? 'Full boarding packet copied' : 'Boarding packet copied (masked)');
    }
  };

  return (
    <div className="mt-4 rounded-[8px] border border-gray-200 bg-white p-4" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <FileSignature className="w-3.5 h-3.5" /> MPA Application & Boarding
        </p>
        {app && (
          <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold border rounded ${STATUS_CHIP[app.status] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
            {app.status === 'draft' ? `Draft — step ${app.currentStep + 1}` : app.status}
          </span>
        )}
      </div>

      {/* ── No application yet ── */}
      {!app && (
        <div className="flex flex-wrap items-center gap-2">
          <button className={btnPrimary} disabled={busy !== null} onClick={() => void startApplication(true)}>
            {busy === 'start' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3.5 h-3.5" />}
            Start MPA application
          </button>
          <button className={btnGhost} disabled={busy !== null} onClick={() => void sendMerchantLink()}>
            {busy === 'link' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
            Send merchant link
          </button>
          <span className="text-[11px] text-gray-400">
            Fill it together in person, or send the merchant a secure link.
          </span>
        </div>
      )}

      {/* ── Draft in progress ── */}
      {app && app.status === 'draft' && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button className={btnPrimary} onClick={() => navigate(`/dashboard/mpa/${app.id}`)}>
            <PenLine className="w-3.5 h-3.5" /> Resume application
          </button>
          <button className={btnGhost} disabled={busy !== null} onClick={() => void sendMerchantLink()}>
            {busy === 'link' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
            {app.hasLink ? 'New merchant link' : 'Send merchant link'}
          </button>
          {app.hasLink && (
            <button className={btnGhost} onClick={() => void mpaActions.voidLink(app.id)}>Revoke link</button>
          )}
        </div>
      )}

      {linkInfo && (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          Merchant link copied — expires {new Date(linkInfo.expiresAt).toLocaleDateString()}.{' '}
          <span className="font-mono break-all">{linkInfo.url}</span>
        </div>
      )}

      {/* ── Completed application: boarding ── */}
      {app && (app.status === 'submitted' || app.status === 'boarded') && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <button className={btnGhost} onClick={() => navigate(`/dashboard/mpa/${app.id}`)}>
              <FileText className="w-3.5 h-3.5" /> View application
            </button>
            {!channel && (
              <span className="text-[11px] text-amber-600 font-medium">
                Pick a channel above (Square / Luqra / Paysafe) to continue boarding.
              </span>
            )}
          </div>

          {/* Luqra / Paysafe: pricing + generate + sign */}
          {isProcessorChannel && app.status !== 'boarded' && (
            <div className="mt-2">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                {channel} pricing (goes on the MPA)
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <select
                  value={templateSel}
                  onChange={(e) => selectTemplate(e.target.value)}
                  className="px-2 py-1.5 bg-white border border-gray-300 rounded-[6px] text-xs text-gray-700 focus:outline-none max-w-[280px]"
                >
                  <option value="">Apply pricing template…</option>
                  <optgroup label="Delt programs (from deal volume)">
                    {builtInTemplates.map((t) => (
                      <option key={t.key} value={`builtin:${t.key}`}>{t.name}</option>
                    ))}
                  </optgroup>
                  {savedTemplates.length > 0 && (
                    <optgroup label="Saved templates">
                      {savedTemplates.map((t) => (
                        <option key={t.id} value={`saved:${t.id}`}>{t.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <button className={btnGhost} disabled={busy !== null} onClick={() => void saveAsTemplate()}>
                  {busy === 'template' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                  Save as template
                </button>
                {selectedSavedTemplate && (
                  <button
                    className={btnGhost}
                    disabled={busy !== null}
                    title={`Delete "${selectedSavedTemplate.name}"`}
                    onClick={() => void deleteSelectedTemplate()}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <PricingGrid
                fields={channel === 'Luqra' ? LUQRA_FIELDS : PAYSAFE_FIELDS}
                value={currentPricing()}
                onChange={(k, v) => setPricingDraft({ ...currentPricing(), [k]: v })}
              />
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button className={btnPrimary} disabled={busy !== null} onClick={() => void signNow('embedded')}>
                  {busy === 'sign' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSignature className="w-3.5 h-3.5" />}
                  Generate MPA & sign now (in person)
                </button>
                <button className={btnSecondary} disabled={busy !== null} onClick={() => void signNow('email')}>
                  {busy === 'email' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send for remote signature
                </button>
                <button className={btnGhost} disabled={busy !== null} onClick={() => void previewPdf()}>
                  {busy === 'preview' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                  Preview PDF
                </button>
              </div>
            </div>
          )}

          {/* Paysafe Section V — the rep's site-survey certification. Staff
              capture only; the merchant self-complete link never sees it. */}
          {channel === 'Paysafe' && app.status !== 'boarded' && (
            <SiteSurveyCard app={app} />
          )}

          {/* Square: OrderOut handoff */}
          {channel === 'Square' && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <a href={ORDEROUT_URL} target="_blank" rel="noreferrer" className={btnPrimary}>
                <ExternalLink className="w-3.5 h-3.5" /> Open OrderOut portal
              </a>
              <button className={btnSecondary} disabled={busy !== null} onClick={() => void copyPacket(true)}>
                <ClipboardCopy className="w-3.5 h-3.5" /> Copy full packet
              </button>
              <button className={btnGhost} disabled={busy !== null} onClick={() => void copyPacket(false)}>
                <ClipboardCopy className="w-3.5 h-3.5" /> Copy masked packet
              </button>
              {app.status !== 'boarded' && (
                <button className={btnGhost} disabled={busy !== null}
                  onClick={async () => {
                    const ok = await mpaActions.markBoarded(app.id);
                    // Boarded = merchant account approved & installed — one of
                    // the two ways a deal is won; the lead follows.
                    if (ok) await fundingWriteback(app.submissionId, 'boarded');
                  }}>
                  Mark boarded
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Envelope status + signing session ── */}
      {mpaContract && (
        <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span className="font-semibold">{(mpaContract.terms as any)?.channel} MPA envelope:</span>
            <span className="inline-flex px-1.5 py-0.5 rounded bg-white border border-gray-200 font-medium">{mpaContract.status}</span>
            {(mpaContract.terms as any)?.mode === 'embedded' && mpaContract.status !== 'completed' && (
              <button className={btnGhost} disabled={busy !== null} onClick={() => void regenerateSigningUrl()}>
                {busy === 'regen' ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                New signing session
              </button>
            )}
            {(mpaContract.terms as any)?.rep && mpaContract.status !== 'completed' && (
              <button
                className={btnGhost}
                disabled={busy !== null}
                title="Open your own signature stop (agent line / site-survey certification)"
                onClick={async () => {
                  setBusy('rep');
                  try {
                    const url = await contractActions.signingUrl(mpaContract.id, 'rep');
                    window.open(url, '_blank', 'noopener');
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Could not open the rep signing session');
                  } finally {
                    setBusy(null);
                  }
                }}
              >
                {busy === 'rep' ? <Loader2 className="w-3 h-3 animate-spin" /> : <PenLine className="w-3 h-3" />}
                Sign as rep
              </button>
            )}
            <button
              className={btnGhost}
              onClick={() => void contractActions.refreshStatus(mpaContract.id)}
            >
              <RefreshCw className="w-3 h-3" /> Refresh status
            </button>
          </div>
          {signingUrl && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <a href={signingUrl} target="_blank" rel="noreferrer" className={btnPrimary}>
                <ExternalLink className="w-3.5 h-3.5" /> Open signing session
              </a>
              <button
                className={btnSecondary}
                onClick={() => { void navigator.clipboard.writeText(signingUrl); toast.success('Signing link copied — open it on the iPad within ~5 minutes'); }}
              >
                <ClipboardCopy className="w-3.5 h-3.5" /> Copy signing link
              </button>
              <span className="text-[11px] text-gray-400">Link expires in ~5 minutes — regenerate any time.</span>
            </div>
          )}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
          <p className="font-semibold mb-0.5">Fill warnings ({warnings.length}):</p>
          {warnings.slice(0, 6).map((w, i) => <p key={i}>• {w}</p>)}
          {warnings.length > 6 && <p>…and {warnings.length - 6} more</p>}
        </div>
      )}
    </div>
  );
}

// ── Paysafe Section V — Merchant Site Survey (rep's certification) ──

interface SiteSurveyValue {
  locationType: string;
  areaZoned: string;
  businessLocation: string;
  permanentSignage: boolean;
  businessLegitimate: boolean;
  inventoryConsistent: boolean;
  surveyedBy: string;
  surveyedAt: string;
  notes: string;
}

const EMPTY_SURVEY: SiteSurveyValue = {
  locationType: '', areaZoned: '', businessLocation: '',
  permanentSignage: true, businessLegitimate: true, inventoryConsistent: true,
  surveyedBy: '', surveyedAt: '', notes: '',
};

function SiteSurveyCard({ app }: { app: MerchantApplication }) {
  const existing = ((app.data as any)?.siteSurvey ?? null) as SiteSurveyValue | null;
  const [open, setOpen] = useState(!existing);
  const [survey, setSurvey] = useState<SiteSurveyValue>(existing ?? EMPTY_SURVEY);
  const [saving, setSaving] = useState(false);
  const up = (patch: Partial<SiteSurveyValue>) => setSurvey(s => ({ ...s, ...patch }));

  const save = async () => {
    if (!survey.locationType || !survey.areaZoned || !survey.businessLocation) {
      toast.error('Location type, zoning, and owned/leased are required for the survey.');
      return;
    }
    setSaving(true);
    const ok = await mpaActions.saveData(app.id, {
      ...(app.data as any),
      siteSurvey: { ...survey, surveyedAt: survey.surveyedAt || new Date().toISOString().slice(0, 10) },
    });
    setSaving(false);
    if (ok) {
      toast.success('Site survey saved — it fills Section V on the Paysafe MPA.');
      setOpen(false);
    }
  };

  const sel = 'px-2 py-1.5 bg-white border border-gray-300 rounded-[6px] text-xs text-gray-700 focus:outline-none';
  const tri = (label: string, value: boolean, onChange: (v: boolean) => void) => (
    <label className="flex items-center gap-2 text-xs text-gray-600">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="rounded" />
      {label}
    </label>
  );

  return (
    <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
      <button
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          Site survey — Section V (your certification, required by Paysafe)
        </span>
        <span className={`text-[11px] font-medium ${existing ? 'text-emerald-600' : 'text-amber-600'}`}>
          {existing ? `Surveyed ${existing.surveyedAt || ''}` : 'Not completed — Paysafe will kick the file back'}
        </span>
      </button>
      {open && (
        <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-wrap gap-2">
            <select className={sel} value={survey.locationType} onChange={(e) => up({ locationType: e.target.value })}>
              <option value="">Location type…</option>
              <option value="storefront">Storefront</option>
              <option value="office">Office</option>
              <option value="warehouse">Warehouse</option>
              <option value="home">Home</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </select>
            <select className={sel} value={survey.areaZoned} onChange={(e) => up({ areaZoned: e.target.value })}>
              <option value="">Area zoned…</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="residential">Residential</option>
            </select>
            <select className={sel} value={survey.businessLocation} onChange={(e) => up({ businessLocation: e.target.value })}>
              <option value="">Premises…</option>
              <option value="owned">Owned</option>
              <option value="leased">Leased</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-4">
            {tri('Permanent signage', survey.permanentSignage, (v) => up({ permanentSignage: v }))}
            {tri('Business appears legitimate', survey.businessLegitimate, (v) => up({ businessLegitimate: v }))}
            {tri('Inventory consistent with business', survey.inventoryConsistent, (v) => up({ inventoryConsistent: v }))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className={btnSecondary} disabled={saving} onClick={() => void save()}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSignature className="w-3.5 h-3.5" />}
              Save survey
            </button>
            <span className="text-[11px] text-gray-400">
              You sign the certification line via “Sign as rep” after the MPA envelope is generated.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
