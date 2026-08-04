import React, { useMemo, useState } from 'react';
import {
  Send,
  CheckCircle,
  Clock,
  XCircle,
  Banknote,
  TrendingUp,
  Store,
} from 'lucide-react';
import { useSession } from '../SessionContext';
import {
  useDealSubmissions,
  dealSubmissionActions,
  SUBMISSION_PIPELINE,
  type DealSubmission,
  type SubmissionStatus,
} from '../dealSubmissionsStore';
import {
  activationBonus,
  bonusBandLabel,
  estFirstYearResidual,
  fmtUsd,
} from '../agentComp';

const VERTICALS = [
  'Restaurant / Food Service',
  'Retail',
  'E-Commerce',
  'Salon / Barber',
  'Auto / Repair',
  'Professional Services',
  'Health & Wellness',
  'CBD / Vape / High-Risk',
  'Convenience / Liquor',
  'Other',
];

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  Submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  Underwriting: 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Activated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Declined: 'bg-red-50 text-red-600 border-red-200',
};

function StatusStepper({ status }: { status: SubmissionStatus }) {
  if (status === 'Declined') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600">
        <XCircle className="w-3.5 h-3.5" /> Declined
      </span>
    );
  }
  const idx = SUBMISSION_PIPELINE.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {SUBMISSION_PIPELINE.map((s, i) => (
        <React.Fragment key={s}>
          {i > 0 && <div className={`h-px w-3 ${i <= idx ? 'bg-emerald-400' : 'bg-gray-200'}`} />}
          <div
            title={s}
            className={`w-2.5 h-2.5 rounded-full ${
              i < idx ? 'bg-emerald-400' : i === idx ? 'bg-indigo-500 ring-2 ring-indigo-200' : 'bg-gray-200'
            }`}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 bg-white border border-gray-300 rounded-[6px] text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand';

export function AgentSubmitDeal() {
  const { role, agentId, agentName, displayName } = useSession();
  const { submissions, isLoading, isOnline } = useDealSubmissions();

  const [merchantName, setMerchantName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vertical, setVertical] = useState(VERTICALS[0]);
  const [volume, setVolume] = useState('');
  const [wantsPos, setWantsPos] = useState(false);
  const [wantsCapital, setWantsCapital] = useState(false);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const monthlyVolume = Number(volume.replace(/[^0-9.]/g, '')) || 0;
  const multiProduct = wantsPos || wantsCapital;
  const previewBonus = activationBonus(monthlyVolume, multiProduct);
  const previewResidual = estFirstYearResidual(monthlyVolume);

  // Agents see their own rows (RLS-scoped server-side); admins previewing see all.
  const mine = submissions;

  const pending = useMemo(
    () => mine.filter(s => ['Submitted', 'Underwriting', 'Approved'].includes(s.status)),
    [mine],
  );
  const pendingBonuses = pending.reduce((s, d) => s + d.expectedBonus, 0);
  const pendingResiduals = pending.reduce((s, d) => s + estFirstYearResidual(d.monthlyVolume), 0);
  const activated = mine.filter(s => s.status === 'Activated' || s.status === 'Paid');

  const canSubmit = merchantName.trim().length > 1 && monthlyVolume > 0 && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    const ok = await dealSubmissionActions.submit({
      agentId,
      agentName: agentName || displayName,
      merchantName: merchantName.trim(),
      contactName: contactName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      vertical,
      monthlyVolume,
      wantsPos,
      wantsCapital,
      notes: notes.trim(),
    });
    setBusy(false);
    if (ok) {
      setMerchantName(''); setContactName(''); setPhone(''); setEmail('');
      setVolume(''); setWantsPos(false); setWantsCapital(false); setNotes('');
    }
  };

  return (
    <div className="px-6 py-6 space-y-6">
      <p className="text-sm text-gray-500">
        Submit a merchant and watch it move through the pipeline. Your activation bonus is locked in
        the moment the account processes its first batch.
      </p>

      {/* Pending earnings strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-[8px] border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Clock className="w-3.5 h-3.5" /> Deals in pipeline</div>
          <p className="text-2xl font-bold text-gray-900">{pending.length}</p>
        </div>
        <div className="bg-white rounded-[8px] border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Banknote className="w-3.5 h-3.5" /> Pending bonuses</div>
          <p className="text-2xl font-bold text-indigo-600">{fmtUsd(pendingBonuses)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Paid on activation, next 15th</p>
        </div>
        <div className="bg-white rounded-[8px] border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><TrendingUp className="w-3.5 h-3.5" /> Est. first-year residuals in pipeline</div>
          <p className="text-2xl font-bold text-emerald-600">{fmtUsd(pendingResiduals)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Tier 1 estimate — modeled, not guaranteed</p>
        </div>
      </div>

      {/* Submission form */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Submit a Deal</h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Merchant / business name *</label>
            <input value={merchantName} onChange={e => setMerchantName(e.target.value)} placeholder="Roma Trattoria" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Contact name</label>
            <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Owner / decision maker" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(305) 555-0100" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="owner@business.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Vertical</label>
            <select value={vertical} onChange={e => setVertical(e.target.value)} className={inputCls}>
              {VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Estimated monthly card volume *</label>
            <input value={volume} onChange={e => setVolume(e.target.value)} placeholder="25000" inputMode="numeric" className={inputCls} />
          </div>
          <div className="md:col-span-2 flex flex-wrap items-center gap-6">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={wantsPos} onChange={e => setWantsPos(e.target.checked)} className="rounded border-gray-300" />
              Interested in KORONA POS
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={wantsCapital} onChange={e => setWantsCapital(e.target.checked)} className="rounded border-gray-300" />
              Interested in Delt Capital
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Notes for underwriting</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Current processor, pain points, timing…" className={inputCls} />
          </div>
        </div>
        {/* Live bonus preview */}
        <div className="px-5 pb-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 rounded-[8px] bg-indigo-50 border border-indigo-100 px-4 py-3">
            <p className="text-xs text-indigo-500 font-medium">Your bonus on activation</p>
            <p className="text-xl font-bold text-indigo-700">
              {monthlyVolume > 0 ? fmtUsd(previewBonus) : '—'}
              {monthlyVolume > 0 && (
                <span className="ml-2 text-xs font-medium text-indigo-500">
                  {bonusBandLabel(monthlyVolume)} band{multiProduct ? ' + $100 multi-product' : ''}
                </span>
              )}
            </p>
            {monthlyVolume > 0 && (
              <p className="text-[11px] text-indigo-400 mt-0.5">
                + est. {fmtUsd(previewResidual)} first-year residual at Tier 1 (modeled)
              </p>
            )}
          </div>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            {busy ? 'Submitting…' : 'Submit Deal'}
          </button>
        </div>
        {!isOnline && !isLoading && (
          <div className="px-5 pb-4 text-[11px] text-amber-600">
            Offline mode — submissions require the Supabase connection.
          </div>
        )}
      </div>

      {/* Pipeline table */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My Pipeline</h2>
          <span className="text-xs text-gray-400">{activated.length} activated</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Merchant</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Submitted</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Volume</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Bonus</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Progress</th>
                <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mine.map((d: DealSubmission) => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{d.merchantName}</p>
                    <p className="text-[11px] text-gray-400">{d.vertical}{d.wantsPos ? ' · POS' : ''}{d.wantsCapital ? ' · Capital' : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{(d.createdAt || '').slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmtUsd(d.monthlyVolume)}/mo</td>
                  <td className="px-4 py-3 text-right font-medium text-indigo-600">{fmtUsd(d.expectedBonus)}</td>
                  <td className="px-4 py-3"><StatusStepper status={d.status} /></td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-md ${STATUS_STYLES[d.status]}`}>
                      {(d.status === 'Activated' || d.status === 'Paid') && <CheckCircle className="w-3 h-3" />}
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
              {mine.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Store className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{isLoading ? 'Loading…' : 'No deals yet — your first submission starts your book.'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {role !== 'agent' && (
        <p className="text-[11px] text-gray-400">
          Admin preview: you're seeing all agents' submissions. Statuses are managed from the Agent Desk.
        </p>
      )}
    </div>
  );
}
