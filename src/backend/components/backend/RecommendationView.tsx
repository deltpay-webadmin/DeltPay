/**
 * ────────────────────────────────────────────────────────────────
 * Decision Model recommendation panel (shared)
 * ────────────────────────────────────────────────────────────────
 * Renders the server-side Delt Cash-Flow Decision Model output (the
 * `recommendation` doc from plaid_nodes): decision banner, sized offer
 * (or non-binding starter offer on declines), score breakdown, gates &
 * conditions, and the reasoning trace. Used by the Plaid Portal and by
 * UnderwritingDetail — the model is the only scorer in the CRM.
 *
 * Styling uses the dark liquid-glass --dp-* tokens.
 */

import React, { useState } from 'react';
import {
  ShieldCheck, Banknote, Gauge, ScrollText, Send, ClipboardCheck,
  AlertTriangle, CheckCircle2, XCircle, Clock,
} from 'lucide-react';

const GLASS = 'bg-(--dp-bg-card) border border-(--dp-border) rounded-2xl';
const GLASS_SOFT = 'bg-(--dp-bg-raised) border border-(--dp-border) rounded-xl';
const TXT = 'text-(--dp-text)';
const TXT_MUTED = 'text-(--dp-text-muted)';
const TXT_FAINT = 'text-(--dp-text-faint)';
const BTN_PRIMARY =
  'inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-(--dp-accent) text-white text-sm font-bold hover:bg-(--dp-accent-hover) disabled:opacity-50 transition-all';
const BTN_GLASS =
  'inline-flex items-center gap-2 px-3 py-2 rounded-[10px] bg-white/[0.06] border border-(--dp-border) text-sm text-(--dp-text-secondary) hover:bg-(--dp-bg-raised) disabled:opacity-50 transition-colors';

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

function MetricTile({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className={`${GLASS_SOFT} p-3`}>
      <p className={`text-xs ${TXT_MUTED}`}>{label}</p>
      <p className={`text-lg font-semibold ${TXT} mt-0.5`}>{value}</p>
      {sub && <p className={`text-[11px] ${TXT_FAINT} mt-0.5`}>{sub}</p>}
    </div>
  );
}

export const MODEL_DECISION_STYLE: Record<string, { cls: string; Icon: React.ElementType; label: string }> = {
  PRE_APPROVE: { cls: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300', Icon: CheckCircle2, label: 'Pre-Approved' },
  REVIEW: { cls: 'bg-amber-400/10 border-amber-400/30 text-amber-300', Icon: AlertTriangle, label: 'Review' },
  DECLINE: { cls: 'bg-red-400/10 border-red-400/30 text-red-300', Icon: XCircle, label: 'Decline' },
  INSUFFICIENT_DATA: { cls: 'bg-white/[0.06] border-(--dp-border-strong) text-(--dp-text-secondary)', Icon: Clock, label: 'More data' },
};

export function ModelDecisionBadge({ decision }: { decision: string | null | undefined }) {
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

export function GateRow({ g }: { g: any }) {
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

export function RecommendationView({ rec, onSendToUnderwriting, existingAppId, muted }: {
  rec: any;
  onSendToUnderwriting?: () => void;
  /** applicationId of an underwriting file already open for this lead — replaces the send button. */
  existingAppId?: string;
  /** Render the send button de-emphasized (declined / insufficient-data files). */
  muted?: boolean;
}) {
  const [showTrace, setShowTrace] = useState(false);
  const cfg = MODEL_DECISION_STYLE[rec.decision] ?? MODEL_DECISION_STYLE.INSUFFICIENT_DATA;
  const offer = rec.offer;
  // Non-binding starter offer on declines (model >= 1.1.0); older persisted
  // recommendations simply lack the field.
  const fallback = !offer ? (rec.fallback_offer ?? null) : null;

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
        {existingAppId ? (
          <span className={`${BTN_GLASS} cursor-default`} title="An underwriting file is already open for this prospect.">
            <ClipboardCheck className="w-4 h-4" /> In Underwriting · {existingAppId}
          </span>
        ) : onSendToUnderwriting ? (
          <button onClick={onSendToUnderwriting} className={muted ? BTN_GLASS : BTN_PRIMARY}>
            <Send className="w-4 h-4" /> Send to Underwriting
          </button>
        ) : null}
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
          ) : fallback ? (
            <>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-semibold tracking-tight text-amber-300">{fmtMoney(fallback.amount)}</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-400/15 border border-amber-400/40 text-amber-300">
                  Non-binding
                </span>
              </div>
              <p className="text-xs text-amber-300/90 mt-1">
                Theoretical starter offer — non-binding, prospect does not qualify
              </p>
              <p className={`text-xs ${TXT_MUTED} mt-1`}>
                factor {fallback.factor} · {fallback.term_months} mo · payback {fmtMoney(fallback.total_payback)}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <MetricTile label="Daily payment" value={fmtMoney(fallback.daily_payment, 2)} sub={`${fmtPct(fallback.payment_pct_daily_revenue)} of daily revenue`} />
                <MetricTile label="Monthly est." value={fmtMoney(fallback.est_monthly_payment)} sub={`${fmtPct(fallback.payment_pct_adb)} of ADB`} />
              </div>
              <p className={`text-[11px] ${TXT_FAINT} mt-3`}>
                Sized for a minimal processing relationship ({fmtMoney(fallback.floor)} floor). The decline stands — see gates.
              </p>
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
            {/* Failures first — the reason for a decline must never hide below the fold. */}
            {[...(rec.gates?.sufficiency ?? []), ...(rec.gates?.knockouts ?? [])]
              .sort((a: any, b: any) => Number(a.passed) - Number(b.passed))
              .map((g: any) => (
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
