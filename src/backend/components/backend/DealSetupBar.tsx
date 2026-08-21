/**
 * Deal setup bar — the two up-front decisions that shape everything below
 * in the Deal Room:
 *
 *   · Product path: payments only, or payments + Delt Capital. Drives which
 *     stages render (capital paperwork hides on payments-only deals).
 *   · Boarding channel: decides the paperwork — Luqra/Paysafe sign a Delt
 *     MPA through DocuSign; Square boards through the external OrderOut
 *     portal (no Delt-signed MPA).
 */

import { CheckCircle2 } from 'lucide-react';
import {
  dealSubmissionActions,
  productPath,
  productPathLabel,
  BOARDING_CHANNELS,
  type BoardingChannel,
  type DealSubmission,
  type ProductPath,
} from './dealSubmissionsStore';

const segBtn = (active: boolean) =>
  `px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-colors ${
    active ? 'bg-brand text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
  }`;

export function DealSetupBar({ sub, hasCapitalArtifacts, hasActiveMpaEnvelope }: {
  sub: DealSubmission;
  /** Underwriting file, DLT-APP/MCA envelope, or capital deal exists. */
  hasCapitalArtifacts: boolean;
  /** An MPA envelope is out — changing channel needs a confirm. */
  hasActiveMpaEnvelope: boolean;
}) {
  const path = productPath(sub);

  const setPath = (next: ProductPath) => {
    if (next === path) return;
    const wantsCapital = next === 'payments+capital';
    const msg = wantsCapital
      ? 'Add Delt Capital to this deal? This adds the funding application, underwriting, MCA and countersign stages, and updates the expected activation bonus.'
      : hasCapitalArtifacts
        ? 'Switch to Payments only? Capital paperwork already exists on this deal, so those stages stay visible until the envelopes are voided. The expected activation bonus updates.'
        : 'Switch to Payments only? The capital stages (funding application, underwriting, MCA, countersign) will be hidden, and the expected activation bonus updates.';
    if (!window.confirm(msg)) return;
    void dealSubmissionActions.setWantsCapital(sub.id, wantsCapital);
  };

  const setChannel = (channel: BoardingChannel) => {
    if (channel === sub.channel) return;
    if (hasActiveMpaEnvelope && !window.confirm(
      `A ${sub.channel} MPA envelope is already out. Changing the channel won't void it — void it from the boarding stage first. Change the channel anyway?`,
    )) return;
    void dealSubmissionActions.setChannel(sub.id, channel);
  };

  return (
    <div className="bg-white rounded-[8px] border border-gray-200 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Product path</p>
          <div className="inline-flex items-center gap-1.5">
            {(['payments-only', 'payments+capital'] as ProductPath[]).map(p => (
              <button key={p} className={segBtn(path === p)} onClick={() => setPath(p)}>
                {productPathLabel(p)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Boarding channel</p>
            {!sub.channel && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">Not set</span>
            )}
          </div>
          <div className="inline-flex items-center gap-1.5">
            {BOARDING_CHANNELS.map(c => (
              <button key={c} className={segBtn(sub.channel === c)} onClick={() => setChannel(c)}>
                {sub.channel === c && <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-px" />}
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-gray-400">
        The channel decides the paperwork — Luqra/Paysafe sign a Delt MPA in DocuSign; Square boards through the external OrderOut portal.
      </p>
    </div>
  );
}
