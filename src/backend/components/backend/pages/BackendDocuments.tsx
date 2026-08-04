/**
 * Documents & E-Sign — live DocuSign contracts.
 *
 * Backed by the `contracts` table + `docusign` edge function via
 * contractsStore. Staff compose an MCA agreement from deal terms,
 * send it for signature, and track envelope status without leaving
 * the CRM. Deal/Merchant pages can prefill the composer through
 * stageEsignDraft() + navigate('/documents').
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText, Search, Send, X, PenTool, RefreshCw, Ban, Copy,
  File, FileCheck, FileClock, FileX, FolderOpen, AlertTriangle,
  CheckCircle, ExternalLink, Loader2, ShieldCheck, Download,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../../lib/supabase';
import {
  useContracts, useDocusignConfig, useContractsSync, contractActions,
  consumeEsignDraft, type Contract, type ContractStatus, type SendContractRequest,
} from '../contractsStore';
import { useMerchants, useDeals } from '../crmStore';

const STATUS_CONFIG: Record<ContractStatus, { color: string; bg: string; label: string; icon: React.ElementType }> = {
  draft: { color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', label: 'Draft', icon: File },
  sent: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Sent', icon: Send },
  delivered: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Viewed', icon: FileClock },
  completed: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Signed', icon: FileCheck },
  declined: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Declined', icon: FileX },
  voided: { color: 'text-gray-400', bg: 'bg-gray-50 border-gray-100', label: 'Voided', icon: FileX },
};

const usd = (n?: number | null) =>
  n == null ? '—' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** Mask an EIN as XX-XXXXXXX, digits only, capped at 9. */
const formatEin = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 9);
  return d.length > 2 ? `${d.slice(0, 2)}-${d.slice(2)}` : d;
};

/** Remittance periods per month by frequency (21 banking days is the MCA convention). */
const PERIODS_PER_MONTH: Record<'Daily' | 'Weekly' | 'Monthly', number> = {
  Daily: 21,
  Weekly: 13 / 3, // 52 weeks ÷ 12 months
  Monthly: 1,
};
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

// ── E-Sign composer modal ──

interface ComposerForm {
  merchantId: string;
  merchantName: string;
  dealId: string;
  signerName: string;
  signerEmail: string;
  signerTitle: string;
  hasGuarantor: boolean;
  guarantorName: string;
  guarantorEmail: string;
  merchantLegalName: string;
  dbaName: string;
  stateOfFormation: string;
  ein: string;
  businessAddress: string;
  purchasePrice: string;
  factorRate: string;
  termMonths: string;
  remittancePct: string;
  dailyRemittance: string;
  remittanceFrequency: 'Daily' | 'Weekly' | 'Monthly';
  remittanceMethod: 'ACH' | 'Split Funding' | 'Lockbox';
  effectiveDate: string;
  principalState: string;
}

const emptyForm = (): ComposerForm => ({
  merchantId: '', merchantName: '', dealId: '',
  signerName: '', signerEmail: '', signerTitle: '',
  hasGuarantor: false, guarantorName: '', guarantorEmail: '',
  merchantLegalName: '', dbaName: '', stateOfFormation: '', ein: '', businessAddress: '',
  purchasePrice: '', factorRate: '1.35', termMonths: '6', remittancePct: '', dailyRemittance: '',
  remittanceFrequency: 'Daily',
  remittanceMethod: 'ACH', effectiveDate: new Date().toISOString().slice(0, 10), principalState: '',
});

function draftToForm(d: Partial<SendContractRequest>): ComposerForm {
  const f = emptyForm();
  f.merchantId = d.merchantId ?? '';
  f.merchantName = d.merchantName ?? '';
  f.dealId = d.dealId ?? '';
  f.signerName = d.signerName ?? '';
  f.signerEmail = d.signerEmail ?? '';
  f.signerTitle = d.signerTitle ?? '';
  if (d.guarantorName || d.guarantorEmail) {
    f.hasGuarantor = true;
    f.guarantorName = d.guarantorName ?? '';
    f.guarantorEmail = d.guarantorEmail ?? '';
  }
  const t = d.terms;
  if (t) {
    f.merchantLegalName = t.merchantLegalName ?? f.merchantName;
    f.dbaName = t.dbaName ?? '';
    f.stateOfFormation = t.stateOfFormation ?? '';
    f.ein = formatEin(t.ein ?? '');
    f.businessAddress = t.businessAddress ?? '';
    f.purchasePrice = t.purchasePrice ? String(t.purchasePrice) : '';
    f.factorRate = t.factorRate ? String(t.factorRate) : f.factorRate;
    f.remittancePct = t.remittancePct != null ? String(t.remittancePct) : '';
    f.dailyRemittance = t.dailyRemittance != null ? String(t.dailyRemittance) : '';
    f.remittanceFrequency = t.remittanceFrequency ?? 'Daily';
    f.remittanceMethod = t.remittanceMethod ?? 'ACH';
    f.effectiveDate = t.effectiveDate || f.effectiveDate;
    f.principalState = t.principalState ?? '';
  }
  return f;
}

const inputCls =
  'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand';
const labelCls = 'text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block';

function ComposerModal({ initial, onClose }: { initial: ComposerForm; onClose: () => void }) {
  const [form, setForm] = useState<ComposerForm>(initial);
  const [sending, setSending] = useState(false);
  // Daily ACH auto-calculates from payback ÷ term until the user types their own number.
  const [achManual, setAchManual] = useState(initial.dailyRemittance !== '');
  const merchants = useMerchants();
  const deals = useDeals();

  const up = (patch: Partial<ComposerForm>) => setForm(f => ({ ...f, ...patch }));

  const price = parseFloat(form.purchasePrice) || 0;
  const factor = parseFloat(form.factorRate) || 0;
  const purchasedAmount = Math.round(price * factor * 100) / 100;
  const months = parseFloat(form.termMonths) || 0;
  const periodsPerMonth = PERIODS_PER_MONTH[form.remittanceFrequency];
  const autoDailyAch = purchasedAmount > 0 && months > 0
    ? Math.round(purchasedAmount / (months * periodsPerMonth))
    : 0;
  const dailyAchValue = achManual ? form.dailyRemittance : (autoDailyAch ? String(autoDailyAch) : '');

  const pickMerchant = (id: string) => {
    const m = merchants.find(x => x.id === id);
    if (!m) { up({ merchantId: '' }); return; }
    up({
      merchantId: m.id,
      merchantName: m.name,
      merchantLegalName: form.merchantLegalName || m.name,
      signerName: form.signerName || m.contactName || '',
      signerEmail: form.signerEmail || m.contactEmail || '',
      ein: form.ein || formatEin(m.ein || ''),
      principalState: form.principalState || m.state || '',
      stateOfFormation: form.stateOfFormation || m.state || '',
    });
  };

  const submit = async () => {
    if (!form.merchantName.trim()) { toast.error('Merchant name is required.'); return; }
    if (!form.signerName.trim() || !/.+@.+\..+/.test(form.signerEmail)) {
      toast.error('Signer name and a valid email are required.'); return;
    }
    if (!(price > 0) || !(factor > 0)) { toast.error('Advance amount and factor rate must be positive.'); return; }
    if (form.hasGuarantor && (!form.guarantorName.trim() || !/.+@.+\..+/.test(form.guarantorEmail))) {
      toast.error('Guarantor name and a valid email are required (or turn the guarantor off).'); return;
    }
    setSending(true);
    try {
      await contractActions.send({
        merchantId: form.merchantId || undefined,
        merchantName: form.merchantName.trim(),
        dealId: form.dealId || undefined,
        signerName: form.signerName.trim(),
        signerEmail: form.signerEmail.trim(),
        signerTitle: form.signerTitle.trim() || undefined,
        guarantorName: form.hasGuarantor ? form.guarantorName.trim() : undefined,
        guarantorEmail: form.hasGuarantor ? form.guarantorEmail.trim() : undefined,
        terms: {
          merchantLegalName: form.merchantLegalName.trim() || form.merchantName.trim(),
          dbaName: form.dbaName.trim() || undefined,
          stateOfFormation: form.stateOfFormation.trim() || undefined,
          ein: form.ein.trim() || undefined,
          businessAddress: form.businessAddress.trim() || undefined,
          purchasePrice: price,
          purchasedAmount,
          factorRate: factor,
          remittancePct: parseFloat(form.remittancePct) || undefined,
          dailyRemittance: parseFloat(dailyAchValue) || undefined,
          remittanceFrequency: form.remittanceFrequency,
          remittanceMethod: form.remittanceMethod,
          effectiveDate: form.effectiveDate,
          principalState: form.principalState.trim() || undefined,
          hasGuarantor: form.hasGuarantor,
          guarantorName: form.hasGuarantor ? form.guarantorName.trim() : undefined,
        },
      });
      onClose();
    } catch {
      /* toast already shown by the store */
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[8px] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-bold text-gray-900">Send MCA Agreement for E-Signature</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Merchant */}
          <div>
            <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wide mb-2">Merchant</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Link CRM Merchant (optional)</label>
                <select value={form.merchantId} onChange={e => pickMerchant(e.target.value)} className={inputCls}>
                  <option value="">— Not linked —</option>
                  {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Link Deal (optional)</label>
                <select value={form.dealId} onChange={e => up({ dealId: e.target.value })} className={inputCls}>
                  <option value="">— Not linked —</option>
                  {deals.map(d => <option key={d.id} value={d.id}>{d.id} · {d.borrower}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Merchant Name *</label>
                <input value={form.merchantName} onChange={e => up({ merchantName: e.target.value })} className={inputCls} placeholder="Havana Bites Cafe" />
              </div>
              <div>
                <label className={labelCls}>Legal Name</label>
                <input value={form.merchantLegalName} onChange={e => up({ merchantLegalName: e.target.value })} className={inputCls} placeholder="Havana Bites LLC" />
              </div>
              <div>
                <label className={labelCls}>DBA</label>
                <input value={form.dbaName} onChange={e => up({ dbaName: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Federal EIN</label>
                <input value={form.ein} onChange={e => up({ ein: formatEin(e.target.value) })}
                  inputMode="numeric" maxLength={10} className={inputCls} placeholder="12-3456789" />
              </div>
              <div>
                <label className={labelCls}>State of Formation</label>
                <input value={form.stateOfFormation} onChange={e => up({ stateOfFormation: e.target.value })} className={inputCls} placeholder="FL" />
              </div>
              <div>
                <label className={labelCls}>Principal State of Operations</label>
                <input value={form.principalState} onChange={e => up({ principalState: e.target.value })} className={inputCls} placeholder="FL" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Business Address</label>
                <input value={form.businessAddress} onChange={e => up({ businessAddress: e.target.value })} className={inputCls} placeholder="123 Calle Ocho, Miami, FL 33135" />
              </div>
            </div>
          </div>

          {/* Terms */}
          <div>
            <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wide mb-2">Schedule A — Deal Terms</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Advance Amount (Purchase Price) *</label>
                <input type="number" min="0" value={form.purchasePrice} onChange={e => up({ purchasePrice: e.target.value })} className={inputCls} placeholder="50000" />
              </div>
              <div>
                <label className={labelCls}>Factor Rate *</label>
                <input type="number" step="0.01" min="1" value={form.factorRate} onChange={e => up({ factorRate: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Purchased Amount</label>
                <div className="px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-[6px] text-xs font-semibold text-brand">
                  {purchasedAmount > 0 ? usd(purchasedAmount) : '—'}
                </div>
              </div>
              <div>
                <label className={labelCls}>Est. Term (months)</label>
                <input type="number" step="1" min="1" max="36" value={form.termMonths} onChange={e => up({ termMonths: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Remittance %</label>
                <input type="number" step="0.5" min="0" max="100" value={form.remittancePct} onChange={e => up({ remittancePct: e.target.value })} className={inputCls} placeholder="12" />
              </div>
              <div>
                <label className={labelCls}>ACH Frequency</label>
                <select value={form.remittanceFrequency}
                  onChange={e => up({ remittanceFrequency: e.target.value as ComposerForm['remittanceFrequency'] })}
                  className={inputCls}>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  Est. {form.remittanceFrequency} ACH
                  {achManual ? (
                    <button type="button" onClick={() => { setAchManual(false); up({ dailyRemittance: '' }); }}
                      className="ml-1.5 text-brand normal-case font-semibold hover:underline">auto</button>
                  ) : (
                    <span className="ml-1.5 text-brand/70 normal-case">auto</span>
                  )}
                </label>
                <input type="number" min="0" value={dailyAchValue}
                  onChange={e => { setAchManual(true); up({ dailyRemittance: e.target.value }); }}
                  className={`${inputCls} ${!achManual ? 'bg-indigo-50/50 border-indigo-100' : ''}`} placeholder="—" />
                <p className="text-[9px] text-gray-400 mt-0.5">
                  {achManual
                    ? 'Manual — click “auto” to recalculate'
                    : form.remittanceFrequency === 'Daily'
                      ? `Payback ÷ (${months || '—'} mo × 21 banking days)`
                      : form.remittanceFrequency === 'Weekly'
                        ? `Payback ÷ (${months || '—'} mo × 4.33 weeks)`
                        : `Payback ÷ ${months || '—'} months`}
                </p>
              </div>
              <div>
                <label className={labelCls}>Remittance Method</label>
                <select value={form.remittanceMethod} onChange={e => up({ remittanceMethod: e.target.value as ComposerForm['remittanceMethod'] })} className={inputCls}>
                  <option>ACH</option>
                  <option>Split Funding</option>
                  <option>Lockbox</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Effective Date</label>
                <input type="date" value={form.effectiveDate} onChange={e => up({ effectiveDate: e.target.value })} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Signers */}
          <div>
            <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wide mb-2">Signers</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Signer Name *</label>
                <input value={form.signerName} onChange={e => up({ signerName: e.target.value })} className={inputCls} placeholder="Maria Gonzalez" />
              </div>
              <div>
                <label className={labelCls}>Signer Email *</label>
                <input type="email" value={form.signerEmail} onChange={e => up({ signerEmail: e.target.value })} className={inputCls} placeholder="owner@business.com" />
              </div>
              <div>
                <label className={labelCls}>Title</label>
                <input value={form.signerTitle} onChange={e => up({ signerTitle: e.target.value })} className={inputCls} placeholder="Owner / Managing Member" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input type="checkbox" id="guarantor" checked={form.hasGuarantor} onChange={e => up({ hasGuarantor: e.target.checked })} className="rounded" />
              <label htmlFor="guarantor" className="text-xs text-gray-600">Include personal guarantor (Limited Performance Guarantee)</label>
            </div>
            {form.hasGuarantor && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className={labelCls}>Guarantor Name *</label>
                  <input value={form.guarantorName} onChange={e => up({ guarantorName: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Guarantor Email *</label>
                  <input type="email" value={form.guarantorEmail} onChange={e => up({ guarantorEmail: e.target.value })} className={inputCls} />
                </div>
              </div>
            )}
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed">
            Sending generates the Delt Pay Purchase &amp; Sale of Future Receivables Agreement with Schedule A
            populated from the terms above, and emails a DocuSign envelope to each signer. Status updates land
            back on this page automatically.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-[8px] shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-[6px]">Cancel</button>
          <button onClick={submit} disabled={sending}
            className="px-4 py-2 bg-brand text-white text-xs font-medium rounded-[6px] hover:bg-brand-hover disabled:opacity-60 inline-flex items-center gap-1.5">
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {sending ? 'Sending…' : 'Send for Signature'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Config banner ──

function ConfigBanner() {
  const config = useDocusignConfig();
  if (config === null) return null;
  if (config.configured && config.tokenOk) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-[8px] px-4 py-2.5">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>DocuSign connected ({config.env === 'production' ? 'production' : 'demo sandbox'}
          {config.accountId ? ` · account ${config.accountId.slice(0, 8)}…` : ''}).
          {!config.hasCountersigner && ' No countersigner set — envelopes complete on the merchant signature alone.'}
        </span>
      </div>
    );
  }
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-[8px] px-4 py-3">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-800 leading-relaxed">
          <p className="font-bold mb-1">DocuSign isn't fully connected yet</p>
          {!config.configured ? (
            <p>
              Set the <code className="font-mono">DOCUSIGN_INTEGRATION_KEY</code>,{' '}
              <code className="font-mono">DOCUSIGN_USER_ID</code> and{' '}
              <code className="font-mono">DOCUSIGN_PRIVATE_KEY</code> secrets on the{' '}
              <code className="font-mono">docusign</code> edge function (Supabase → Edge Functions → Secrets),
              then reload. Optional: <code className="font-mono">DOCUSIGN_ENV=production</code> when you leave the
              demo sandbox, and <code className="font-mono">DOCUSIGN_COUNTERSIGNER_NAME/EMAIL</code> to add a
              Delt Pay countersignature step.
            </p>
          ) : (
            <p>
              Credentials are set but DocuSign rejected the token: <b>{config.tokenError || 'unknown error'}</b>
              {config.consentUrl && (
                <>
                  {' '}If this is the one-time consent step,{' '}
                  <a href={config.consentUrl} target="_blank" rel="noreferrer" className="underline font-semibold inline-flex items-center gap-0.5">
                    grant consent here <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  while signed in as the API user, then retry.
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ──

export function BackendDocuments() {
  const contracts = useContracts();
  const { isLoading, busy } = useContractsSync();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');
  const [composer, setComposer] = useState<ComposerForm | null>(null);

  // A Deal/Merchant page may have staged a prefilled request before navigating here.
  useEffect(() => {
    const draft = consumeEsignDraft();
    if (draft) setComposer(draftToForm(draft));
  }, []);

  // Once contracts load, silently sync every in-flight envelope with DocuSign
  // so statuses are current without manual refresh clicks.
  useEffect(() => {
    if (!isLoading) contractActions.refreshInFlight();
  }, [isLoading]);

  const filtered = useMemo(() => {
    return contracts.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.merchantName.toLowerCase().includes(q) ||
          c.signerName.toLowerCase().includes(q) ||
          c.signerEmail.toLowerCase().includes(q) ||
          (c.dealId || '').toLowerCase().includes(q) ||
          (c.envelopeId || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [contracts, search, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    contracts.forEach(x => { c[x.status] = (c[x.status] || 0) + 1; });
    return c;
  }, [contracts]);

  const awaiting = (counts['sent'] || 0) + (counts['delivered'] || 0);
  const signed = counts['completed'] || 0;
  const dead = (counts['declined'] || 0) + (counts['voided'] || 0);

  return (
    <div className="px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">
              {contracts.length} agreement{contracts.length === 1 ? '' : 's'} &middot; {awaiting} awaiting signature
            </p>
          </div>
        </div>
        <button onClick={() => setComposer(emptyForm())}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-xs font-medium rounded-[6px] hover:bg-brand-hover">
          <PenTool className="w-3.5 h-3.5" /> New E-Sign Request
        </button>
      </div>

      <ConfigBanner />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Agreements', value: contracts.length, color: 'border-t-brand', icon: FolderOpen },
          { label: 'Signed & Complete', value: signed, color: 'border-t-emerald-500', icon: FileCheck },
          { label: 'Awaiting Signature', value: awaiting, color: 'border-t-amber-500', icon: FileClock },
          { label: 'Declined / Voided', value: dead, color: 'border-t-gray-400', icon: FileX },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className={`bg-white rounded-[8px] border border-gray-200 border-t-[3px] ${kpi.color} px-4 py-3`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[8px] border border-gray-200 p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search merchant, signer, deal, envelope..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {(['all', 'sent', 'delivered', 'completed', 'declined', 'voided'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded-[6px] text-[10px] font-semibold border whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? (s === 'all' ? 'bg-brand/5 text-brand border-brand/20' : `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color}`)
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}>{s === 'all' ? `All (${contracts.length})` : STATUS_CONFIG[s].label}</button>
          ))}
        </div>
      </div>

      {/* Contract table */}
      <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 flex items-center gap-4 text-[10px] text-gray-500 uppercase tracking-wide font-semibold border-b border-gray-200">
          <span className="flex-1">Agreement</span>
          <span className="w-28">Advance</span>
          <span className="w-32">Signer</span>
          <span className="w-24">Sent</span>
          <span className="w-24">Status</span>
          <span className="w-20">Actions</span>
        </div>

        {isLoading && (
          <div className="px-5 py-16 text-center">
            <Loader2 className="w-6 h-6 text-gray-300 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-gray-400">Loading agreements…</p>
          </div>
        )}

        {!isLoading && filtered.map(c => {
          const scfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.draft;
          const SIcon = scfg.icon;
          const isBusy = busy.includes(c.id);
          const inFlight = c.status === 'sent' || c.status === 'delivered';
          return (
            <div key={c.id} className="px-4 py-3 flex items-center gap-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {c.dealId && <span className="text-[9px] font-mono text-brand bg-indigo-50 px-1.5 py-0.5 rounded">{c.dealId}</span>}
                  {c.envelopeId && (
                    <button
                      onClick={() => { navigator.clipboard?.writeText(c.envelopeId!); toast.success('Envelope ID copied.'); }}
                      title="Copy envelope ID"
                      className="text-[9px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded inline-flex items-center gap-1 hover:bg-gray-100">
                      {c.envelopeId.slice(0, 8)}… <Copy className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-gray-900 truncate">MCA Agreement — {c.merchantName}</h4>
                <span className="text-[10px] text-gray-400">
                  Factor {c.terms?.factorRate ?? '—'} &middot; Payback {usd(c.terms?.purchasedAmount)}
                  {c.guarantorName ? ' · + guarantor' : ''}
                </span>
              </div>
              <span className="w-28 shrink-0 text-[11px] font-semibold text-gray-700">{usd(c.terms?.purchasePrice)}</span>
              <div className="w-32 shrink-0 min-w-0">
                <p className="text-[10px] text-gray-600 truncate">{c.signerName}</p>
                <p className="text-[9px] text-gray-400 truncate">{c.signerEmail}</p>
              </div>
              <span className="w-24 shrink-0 text-[10px] font-mono text-gray-500">{fmtDate(c.sentAt)}</span>
              <span className={`w-24 shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded border ${scfg.bg} ${scfg.color}`}>
                <SIcon className="w-3 h-3" />{scfg.label}
              </span>
              <div className="w-20 shrink-0 flex items-center gap-1">
                {isBusy ? (
                  <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                ) : (
                  <>
                    {inFlight && (
                      <button onClick={() => contractActions.refreshStatus(c.id)} className="p-1 hover:bg-gray-100 rounded" title="Refresh DocuSign status">
                        <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}
                    {inFlight && (
                      <button
                        onClick={() => { if (window.confirm(`Void the envelope for ${c.merchantName}? Signers can no longer sign it.`)) contractActions.void(c.id); }}
                        className="p-1 hover:bg-red-50 rounded" title="Void envelope">
                        <Ban className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    )}
                    {c.status === 'completed' && (c.signedStoragePath ? (
                      <button
                        onClick={async () => {
                          const { data } = await supabase!.storage.from('deal-docs').createSignedUrl(c.signedStoragePath!, 3600);
                          if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener');
                        }}
                        className="p-1 hover:bg-emerald-50 rounded"
                        title="Download signed PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" title="Completed" />
                    ))}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {!isLoading && filtered.length === 0 && (
          <div className="px-5 py-16 text-center">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-1">
              {contracts.length === 0 ? 'No agreements yet' : 'No agreements match your filters'}
            </p>
            {contracts.length === 0 && (
              <p className="text-xs text-gray-400">
                Send your first MCA agreement with “New E-Sign Request”, or from any deal’s detail page.
              </p>
            )}
          </div>
        )}
      </div>

      {composer && <ComposerModal initial={composer} onClose={() => setComposer(null)} />}
    </div>
  );
}
