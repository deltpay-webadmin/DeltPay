/**
 * Capital → Offers. The form that records an offer, and the board that
 * shows where every live one stands.
 *
 * The status dropdown is the automation surface: moving an offer is what
 * sends the merchant email (DC-7 offer, DC-9 decline pivot, DC-10 unsigned
 * chase, DC-11 funded welcome — capital-offer-sweep picks it up within 15
 * minutes). Every transition that mails someone says so before you commit
 * it, because "I changed a dropdown and it emailed a merchant" is the kind
 * of surprise that makes people stop using the tool.
 */

import React, { useMemo, useState } from 'react';
import {
  Plus, Send, Clock, CheckCircle2, XCircle, FileSignature, Banknote,
  AlertTriangle, Mail, MailWarning, Trash2, ChevronDown, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  offerActions, useCapitalOffers, NEXT_STATUSES, STATUS_EMAIL, STATUS_LABELS,
  type CapitalOffer, type OfferStatus, type PaymentFrequency,
} from '../capitalOffersStore';

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const statusStyle: Record<OfferStatus, { bg: string; text: string; icon: React.ElementType }> = {
  draft:        { bg: 'bg-gray-100',    text: 'text-gray-600',    icon: Clock },
  sent:         { bg: 'bg-blue-50',     text: 'text-blue-700',    icon: Send },
  accepted:     { bg: 'bg-indigo-50',   text: 'text-indigo-700',  icon: CheckCircle2 },
  contract_out: { bg: 'bg-amber-50',    text: 'text-amber-700',   icon: FileSignature },
  signed:       { bg: 'bg-violet-50',   text: 'text-violet-700',  icon: FileSignature },
  funded:       { bg: 'bg-emerald-50',  text: 'text-emerald-700', icon: Banknote },
  declined:     { bg: 'bg-red-50',      text: 'text-red-700',     icon: XCircle },
  expired:      { bg: 'bg-orange-50',   text: 'text-orange-700',  icon: AlertTriangle },
  withdrawn:    { bg: 'bg-gray-100',    text: 'text-gray-500',    icon: XCircle },
};

const OPEN_STATUSES: OfferStatus[] = ['draft', 'sent', 'accepted', 'contract_out', 'signed'];

function daysLeft(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

function relative(iso: string | null): string {
  if (!iso) return '—';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(0, mins)}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / (60 * 24))}d ago`;
}

/** Default expiry: 7 days out, which is what the offer copy promises. */
function defaultExpiry(): string {
  const d = new Date(Date.now() + 7 * 86400000);
  return d.toISOString().slice(0, 10);
}

// ══════════════════════════════════════════════════════════════
// New offer form
// ══════════════════════════════════════════════════════════════

function NewOfferModal({ onClose }: { onClose: () => void }) {
  const [merchantName, setMerchantName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [factor, setFactor] = useState('1.35');
  const [termDays, setTermDays] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('daily');
  const [holdbackPct, setHoldbackPct] = useState('');
  const [useOfFunds, setUseOfFunds] = useState('');
  const [notes, setNotes] = useState('');
  const [expiry, setExpiry] = useState(defaultExpiry());
  const [busy, setBusy] = useState(false);

  const amt = Number(amount) || 0;
  const fac = Number(factor) || 0;
  const payback = amt > 0 && fac > 0 ? amt * fac : 0;

  const submit = async (sendNow: boolean) => {
    if (!merchantName.trim()) { toast.error('Merchant name is required.'); return; }
    if (!(amt > 0)) { toast.error('Enter an offer amount.'); return; }
    if (!(fac >= 1 && fac <= 3)) { toast.error('Factor must be between 1.0 and 3.0.'); return; }
    if (sendNow && !contactEmail.trim()) { toast.error('An email address is required to send the offer.'); return; }
    const expiresAt = new Date(`${expiry}T23:59:59`).toISOString();
    if (new Date(expiresAt).getTime() <= Date.now()) { toast.error('Expiry has to be in the future.'); return; }

    setBusy(true);
    const created = await offerActions.create({
      merchantName: merchantName.trim(),
      contactName: contactName.trim() || null,
      contactEmail: contactEmail.trim() || null,
      amount: amt,
      factor: fac,
      termDays: termDays ? Number(termDays) : null,
      paymentAmount: paymentAmount ? Number(paymentAmount) : null,
      paymentFrequency,
      holdbackPct: holdbackPct ? Number(holdbackPct) : null,
      useOfFunds: useOfFunds.trim() || null,
      notes: notes.trim() || null,
      expiresAt,
      sendNow,
    });
    setBusy(false);
    if (created) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-[10px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">New capital offer</h2>
          <p className="text-xs text-gray-500 mt-1">
            Recording the offer is what turns on the follow-up sequence — the 48-hour reminder,
            the unsigned-contract chase and the funded welcome all run off this row.
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Merchant" required>
              <input value={merchantName} onChange={e => setMerchantName(e.target.value)} className={inputCls} placeholder="Acme Diner LLC" />
            </Field>
            <Field label="Contact name">
              <input value={contactName} onChange={e => setContactName(e.target.value)} className={inputCls} placeholder="Maria Alvarez" />
            </Field>
          </div>

          <Field label="Contact email" hint="Required to send. Without one the offer can still be saved as a draft.">
            <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} type="email" className={inputCls} placeholder="owner@acmediner.com" />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Amount" required>
              <input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" className={inputCls} placeholder="50000" />
            </Field>
            <Field label="Factor" required>
              <input value={factor} onChange={e => setFactor(e.target.value)} inputMode="decimal" className={inputCls} placeholder="1.35" />
            </Field>
            <Field label="Total payback">
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-semibold text-gray-900">
                {payback > 0 ? fmt(payback) : '—'}
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Payment" hint="Leave blank if you quoted a holdback instead.">
              <input value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} inputMode="decimal" className={inputCls} placeholder="450" />
            </Field>
            <Field label="Frequency">
              <select value={paymentFrequency} onChange={e => setPaymentFrequency(e.target.value as PaymentFrequency)} className={inputCls}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </Field>
            <Field label="Holdback %" hint="Alternative to a fixed payment.">
              <input value={holdbackPct} onChange={e => setHoldbackPct(e.target.value)} inputMode="decimal" className={inputCls} placeholder="12" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Estimated term (days)">
              <input value={termDays} onChange={e => setTermDays(e.target.value)} inputMode="numeric" className={inputCls} placeholder="180" />
            </Field>
            <Field label="Offer expires" required hint="Quoted verbatim in the email and the reminder.">
              <input value={expiry} onChange={e => setExpiry(e.target.value)} type="date" className={inputCls} />
            </Field>
          </div>

          <Field label="Use of funds" hint="Internal only — never appears in the email.">
            <input value={useOfFunds} onChange={e => setUseOfFunds(e.target.value)} className={inputCls} placeholder="Kitchen buildout" />
          </Field>

          <Field label="Notes" hint="Internal only.">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          </Field>

          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-xs text-blue-800">
              <strong>Only the terms above go in the email.</strong> Payment and term are omitted from the
              offer if you leave them blank rather than being guessed at — a merchant reading a number we
              didn't agree to is worse than one reading fewer numbers.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
          <button
            onClick={() => void submit(false)}
            disabled={busy}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            onClick={() => void submit(true)}
            disabled={busy}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-brand text-white hover:bg-brand-hover disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" /> {busy ? 'Saving…' : 'Create & send offer'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent';

function Field({ label, children, hint, required }: { label: string; children: React.ReactNode; hint?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Status control
// ══════════════════════════════════════════════════════════════

function StatusControl({ offer }: { offer: CapitalOffer }) {
  const [pending, setPending] = useState<OfferStatus | null>(null);
  const [reason, setReason] = useState('');
  const next = NEXT_STATUSES[offer.status];

  if (next.length === 0) {
    return <span className="text-[11px] text-gray-400">No further steps</span>;
  }

  if (pending) {
    const mail = STATUS_EMAIL[pending];
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-800">Move to {STATUS_LABELS[pending]}?</p>
        {mail
          ? <p className="text-[11px] text-amber-700 flex items-start gap-1"><Mail className="w-3 h-3 mt-0.5 shrink-0" /> This emails {offer.contactEmail || 'the merchant'}: {mail}</p>
          : <p className="text-[11px] text-gray-500">No email is sent for this step.</p>}
        {pending === 'declined' && (
          <input
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason (appears in the email — keep it plain)"
            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs"
          />
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              void offerActions.setStatus(offer.id, pending, pending === 'declined' ? { declinedReason: reason } : undefined);
              setPending(null);
              setReason('');
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-brand text-white hover:bg-brand-hover"
          >
            Confirm
          </button>
          <button onClick={() => { setPending(null); setReason(''); }} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {next.map(s => (
        <button
          key={s}
          onClick={() => setPending(s)}
          title={STATUS_EMAIL[s] ? `Emails the merchant — ${STATUS_EMAIL[s]}` : 'No email sent'}
          className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 inline-flex items-center gap-1"
        >
          {STATUS_EMAIL[s] && <Mail className="w-3 h-3 text-amber-500" />}
          {STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Row
// ══════════════════════════════════════════════════════════════

function OfferRow({ offer }: { offer: CapitalOffer }) {
  const [open, setOpen] = useState(false);
  const cfg = statusStyle[offer.status];
  const Icon = cfg.icon;
  const left = daysLeft(offer.expiresAt);
  const live = OPEN_STATUSES.includes(offer.status);
  const noEmail = !offer.contactEmail;

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50/60">
        <td className="py-3 px-3">
          <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 text-left">
            {open ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            <div>
              <p className="text-sm font-semibold text-gray-900">{offer.merchantName}</p>
              <p className="text-[11px] text-gray-500">{offer.contactEmail || <span className="text-amber-600">no email on file</span>}</p>
            </div>
          </button>
        </td>
        <td className="py-3 px-3">
          <p className="text-sm font-semibold text-gray-900">{fmt(offer.amount)}</p>
          <p className="text-[11px] text-gray-500">{fmt(offer.payback)} @ {offer.factor}</p>
        </td>
        <td className="py-3 px-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
            <Icon className="w-3 h-3" /> {STATUS_LABELS[offer.status]}
          </span>
        </td>
        <td className="py-3 px-3">
          {live ? (
            <span className={`text-xs font-medium ${left <= 1 ? 'text-red-600' : left <= 3 ? 'text-amber-600' : 'text-gray-600'}`}>
              {left <= 0 ? 'expired' : left === 1 ? '1 day left' : `${left} days left`}
            </span>
          ) : <span className="text-xs text-gray-400">—</span>}
        </td>
        <td className="py-3 px-3">
          <div className="flex items-center gap-1.5">
            {offer.offerSentAt && <Dot label={`Offer sent ${relative(offer.offerSentAt)}`} tone="blue" />}
            {offer.reminderSentAt && <Dot label={`48h reminder ${relative(offer.reminderSentAt)}`} tone="blue" />}
            {offer.chaseCount > 0 && <Dot label={`${offer.chaseCount} contract chase${offer.chaseCount > 1 ? 's' : ''}, last ${relative(offer.lastChaseAt)}`} tone="amber" />}
            {offer.declineNotifiedAt && <Dot label={`Decline pivot ${relative(offer.declineNotifiedAt)}`} tone="red" />}
            {offer.fundedNotifiedAt && <Dot label={`Funded welcome ${relative(offer.fundedNotifiedAt)}`} tone="emerald" />}
            {live && noEmail && (
              <span title="No email address — the sequence can't run for this offer" className="text-amber-500">
                <MailWarning className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-gray-100 bg-gray-50/40">
          <td colSpan={5} className="px-3 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-2">Terms as quoted</p>
                <dl className="text-xs space-y-1">
                  <Row k="Amount" v={fmt(offer.amount)} />
                  <Row k="Total payback" v={`${fmt(offer.payback)} (${offer.factor} factor)`} />
                  <Row k="Payment" v={offer.paymentAmount ? `${fmt(offer.paymentAmount)} ${offer.paymentFrequency}` : offer.holdbackPct ? `${offer.holdbackPct}% of ${offer.paymentFrequency} volume` : <span className="text-gray-400">not quoted — omitted from the email</span>} />
                  <Row k="Term" v={offer.termDays ? `~${offer.termDays} days` : <span className="text-gray-400">not quoted — omitted from the email</span>} />
                  <Row k="Expires" v={new Date(offer.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
                  {offer.useOfFunds && <Row k="Use of funds" v={offer.useOfFunds} />}
                  {offer.declinedReason && <Row k="Decline reason" v={offer.declinedReason} />}
                  {offer.notes && <Row k="Notes" v={offer.notes} />}
                </dl>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-2">Advance this offer</p>
                  <StatusControl offer={offer} />
                </div>
                {offer.status === 'draft' && (
                  <button
                    onClick={() => { if (confirm(`Delete the draft offer for ${offer.merchantName}?`)) void offerActions.remove(offer.id); }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" /> Delete draft
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="text-gray-500 w-32 shrink-0">{k}</dt>
      <dd className="text-gray-900 font-medium">{v}</dd>
    </div>
  );
}

function Dot({ label, tone }: { label: string; tone: 'blue' | 'amber' | 'red' | 'emerald' }) {
  const bg = { blue: 'bg-blue-400', amber: 'bg-amber-400', red: 'bg-red-400', emerald: 'bg-emerald-400' }[tone];
  return <span title={label} className={`w-2 h-2 rounded-full ${bg}`} />;
}

// ══════════════════════════════════════════════════════════════
// Tab
// ══════════════════════════════════════════════════════════════

export function CapitalOffersTab() {
  const { offers, isLoading, lastError } = useCapitalOffers();
  const [newOpen, setNewOpen] = useState(false);
  const [showClosed, setShowClosed] = useState(false);

  const { live, closed, M } = useMemo(() => {
    const live = offers.filter(o => OPEN_STATUSES.includes(o.status));
    const closed = offers.filter(o => !OPEN_STATUSES.includes(o.status));
    const funded = offers.filter(o => o.status === 'funded');
    const decided = offers.filter(o => ['funded', 'declined', 'expired'].includes(o.status));
    return {
      live,
      closed,
      M: {
        liveCount: live.length,
        liveValue: live.reduce((s, o) => s + o.amount, 0),
        fundedValue: funded.reduce((s, o) => s + o.amount, 0),
        // Close rate over offers that actually reached an outcome — counting
        // still-open offers as losses would understate it every single day.
        closeRate: decided.length > 0 ? funded.length / decided.length : null,
      },
    };
  }, [offers]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Offers</h2>
          <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
            Every offer you've made, and what the automation has sent about it. Advancing an offer here
            is what triggers the merchant email — there's no separate send step.
          </p>
        </div>
        <button
          onClick={() => setNewOpen(true)}
          className="shrink-0 px-4 py-2 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Offer
        </button>
      </div>

      {lastError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-800">Couldn't load offers</p>
          <p className="text-[11px] text-amber-700/80 mt-0.5">{lastError}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Live offers" value={String(M.liveCount)} />
        <Kpi label="Value outstanding" value={fmt(M.liveValue)} />
        <Kpi label="Funded to date" value={fmt(M.fundedValue)} />
        <Kpi
          label="Close rate"
          value={M.closeRate == null ? '—' : `${Math.round(M.closeRate * 100)}%`}
          sub={M.closeRate == null ? 'no decided offers yet' : 'of offers that reached an outcome'}
        />
      </div>

      {isLoading && offers.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-10">Loading offers…</p>
      )}

      {!isLoading && offers.length === 0 && (
        <div className="bg-white rounded-[8px] border border-gray-200 px-6 py-14 text-center">
          <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Banknote className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No offers recorded yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Record an offer here and the follow-up runs itself: the offer email, a 48-hour reminder if it
            goes quiet, a chase when the contract sits unsigned, and a welcome when it funds.
          </p>
          <button
            onClick={() => setNewOpen(true)}
            className="mt-4 px-4 py-2 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Offer
          </button>
        </div>
      )}

      {offers.length > 0 && (
        <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <Th>Merchant</Th><Th>Amount</Th><Th>Status</Th><Th>Expiry</Th><Th>Automation</Th>
              </tr>
            </thead>
            <tbody>
              {(showClosed ? [...live, ...closed] : live).map(o => <OfferRow key={o.id} offer={o} />)}
            </tbody>
          </table>
          {live.length === 0 && !showClosed && (
            <p className="text-xs text-gray-400 text-center py-8">No live offers. {closed.length} closed.</p>
          )}
          {closed.length > 0 && (
            <div className="border-t border-gray-100 px-3 py-2">
              <button onClick={() => setShowClosed(s => !s)} className="text-[11px] font-medium text-gray-500 hover:text-gray-800">
                {showClosed ? 'Hide' : 'Show'} {closed.length} closed offer{closed.length === 1 ? '' : 's'}
              </button>
            </div>
          )}
        </div>
      )}

      {newOpen && <NewOfferModal onClose={() => setNewOpen(false)} />}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left py-2.5 px-3 text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{children}</th>;
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-[8px] border border-gray-200 p-4">
      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
