import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Zap, TrendingUp, Sliders, Clock, Calculator } from 'lucide-react';

/**
 * /get-funded — qualifying gate that runs BEFORE /apply.
 *
 * Goals (per product brief):
 * 1. Capture two qualifying answers that drive CRM lead tagging:
 *      - Currently accepts credit cards?  (yes / no / already with delt)
 *      - Open to switching processing to Delt?  (yes / maybe / no — capital only)
 * 2. Run the calculator inputs (volume, avg ticket, current rate) so the next
 *    page is personalized.
 * 3. Show a result snapshot (est. savings + pre-approval window) and forward
 *    to /apply?lead=...&volume=...&accepts=...&switch=... so ApplicationPage
 *    can route to the right CRM segment.
 *
 * Lead tag values are aligned to the four CRM playbooks:
 *   MS+CAP-Switcher          — accepts cards + open to switch
 *   CAP-Only                 — accepts cards + not switching
 *   MS+CAP-NewMerchant       — does not currently accept cards
 *   Existing-Customer-Upsell — already with Delt
 */

const NAVY = '#041E42';
const PURPLE = '#4945FF';
const MUTED = '#475569';
const MICRO = '#94A3B8';
const HAIRLINE = 'rgba(4,30,66,0.10)';

type AcceptsCards = 'yes' | 'no' | 'already-delt';
type OpenToSwitch = 'yes' | 'maybe' | 'no';

interface Answers {
  accepts: AcceptsCards | null;
  switchTo: OpenToSwitch | null;
  monthlyVolume: string;
  avgTicket: string;
  currentRate: string;
  currentPerTxn: string;
}

const DELT_RATE = 0.026;
const DELT_PER_TXN = 0.10;

function deriveLeadTag(a: Answers): string {
  if (a.accepts === 'already-delt') return 'Existing-Customer-Upsell';
  if (a.accepts === 'no') return 'MS+CAP-NewMerchant';
  if (a.switchTo === 'no') return 'CAP-Only';
  return 'MS+CAP-Switcher';
}

function formatCurrency(val: number) {
  return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function GetFundedPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [a, setA] = useState<Answers>({
    accepts: null,
    switchTo: null,
    monthlyVolume: '',
    avgTicket: '',
    currentRate: '',
    currentPerTxn: '',
  });

  const skipCalculator = a.accepts === 'no' || a.accepts === 'already-delt';

  const calc = useMemo(() => {
    const volume = parseFloat(a.monthlyVolume.replace(/,/g, '')) || 0;
    const avg = parseFloat(a.avgTicket.replace(/,/g, '')) || 1;
    const rate = parseFloat(a.currentRate) / 100 || 0;
    const perTxn = parseFloat(a.currentPerTxn) || 0;
    const txns = volume / avg;
    const currentCost = volume * rate + txns * perTxn;
    const deltCost = volume * DELT_RATE + txns * DELT_PER_TXN;
    const savings = Math.max(0, currentCost - deltCost);
    // pre-approval window: roughly 0.5x – 1.5x monthly volume, capped at $300K
    const preApprovalLow = Math.min(volume * 0.5, 300_000);
    const preApprovalHigh = Math.min(volume * 1.5, 300_000);
    return { volume, currentCost, deltCost, savings, preApprovalLow, preApprovalHigh };
  }, [a]);

  const continueToApply = () => {
    const lead = deriveLeadTag(a);
    const params = new URLSearchParams({ lead });
    if (a.accepts) params.set('accepts', a.accepts);
    if (a.switchTo) params.set('switch', a.switchTo);
    if (a.monthlyVolume) params.set('volume', a.monthlyVolume.replace(/,/g, ''));
    if (a.avgTicket) params.set('avg', a.avgTicket.replace(/,/g, ''));
    if (a.currentRate) params.set('rate', a.currentRate);
    navigate(`/apply?${params.toString()}`);
  };

  // ── Stage 1 — qualifying questions ─────────────────────────────
  const stage1Valid =
    a.accepts !== null && (a.accepts !== 'yes' || a.switchTo !== null);

  // ── Stage 2 — calculator inputs (skipped for non-processors) ──
  const stage2Valid = skipCalculator || (a.monthlyVolume && a.avgTicket);

  const stages: Array<{ n: number; label: string }> = [
    { n: 1, label: 'About your business' },
    { n: 2, label: skipCalculator ? 'Volume estimate' : 'Your numbers' },
    { n: 3, label: 'Your offer' },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <section className="pt-12 lg:pt-16 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => (stage === 1 ? navigate(-1) : setStage((s) => (s - 1) as 1 | 2 | 3))}
            className="mb-6 flex items-center gap-2 text-[#041E42] hover:text-[#4945FF] transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-bold uppercase mb-4"
              style={{ color: PURPLE, background: `${PURPLE}10`, letterSpacing: '0.14em' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: PURPLE }} />
              Get funded
            </div>
            <h1
              className="font-bold mb-3"
              style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', color: NAVY, letterSpacing: '-0.02em' }}
            >
              See your offer in 60 seconds.
            </h1>
            <p className="text-[16px]" style={{ color: MUTED, maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
              A few quick questions so we can show you the right path — capital-only, processing-only, or both.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {stages.map((s, i) => (
              <div key={s.n} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-full text-[12px] font-bold transition-colors"
                  style={{
                    width: 28,
                    height: 28,
                    background: stage >= s.n ? PURPLE : '#E5E7EB',
                    color: stage >= s.n ? '#FFF' : MUTED,
                  }}
                >
                  {stage > s.n ? <Check size={14} /> : s.n}
                </div>
                <span
                  className="text-[12px] font-semibold uppercase hidden sm:inline"
                  style={{ color: stage >= s.n ? NAVY : MICRO, letterSpacing: '0.10em' }}
                >
                  {s.label}
                </span>
                {i < stages.length - 1 && (
                  <div className="hidden sm:block" style={{ width: 28, height: 1, background: HAIRLINE }} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_24px_60px_-24px_rgba(4,30,66,0.18)] border border-[#041E42]/8 p-7 lg:p-10">
            <AnimatePresence mode="wait">
              {stage === 1 && (
                <motion.div
                  key="stage1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="space-y-8">
                    {/* Q1 */}
                    <fieldset>
                      <legend className="text-[18px] font-bold mb-4" style={{ color: NAVY }}>
                        Do you currently accept credit card payments?
                      </legend>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {[
                          { v: 'yes' as const, label: 'Yes — currently processing', desc: 'With another provider today.' },
                          { v: 'no' as const, label: 'No — just getting started', desc: "Haven't taken a card yet." },
                          { v: 'already-delt' as const, label: 'Already with Delt', desc: 'Existing customer.' },
                        ].map((opt) => {
                          const selected = a.accepts === opt.v;
                          return (
                            <button
                              key={opt.v}
                              type="button"
                              onClick={() =>
                                setA((p) => ({
                                  ...p,
                                  accepts: opt.v,
                                  // reset Q2 if Q1 changes away from 'yes'
                                  switchTo: opt.v === 'yes' ? p.switchTo : null,
                                }))
                              }
                              className="text-left rounded-xl p-4 transition-all"
                              style={{
                                border: `2px solid ${selected ? PURPLE : HAIRLINE}`,
                                background: selected ? `${PURPLE}08` : '#FFF',
                              }}
                            >
                              <div className="font-bold mb-1" style={{ color: NAVY, fontSize: 14.5 }}>
                                {opt.label}
                              </div>
                              <div style={{ color: MUTED, fontSize: 12.5, lineHeight: 1.5 }}>{opt.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    {/* Q2 — only if Q1 = yes */}
                    <AnimatePresence>
                      {a.accepts === 'yes' && (
                        <motion.fieldset
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <legend className="text-[18px] font-bold mb-4 pt-2" style={{ color: NAVY }}>
                            Open to switching to Delt for processing?
                          </legend>
                          <div className="grid sm:grid-cols-3 gap-3">
                            {[
                              { v: 'yes' as const, label: 'Yes — show me savings', desc: 'I\u2019m comparing options.' },
                              { v: 'maybe' as const, label: 'Maybe', desc: 'Depends on the numbers.' },
                              { v: 'no' as const, label: 'No — just want capital', desc: "I'll stay on my current processor." },
                            ].map((opt) => {
                              const selected = a.switchTo === opt.v;
                              return (
                                <button
                                  key={opt.v}
                                  type="button"
                                  onClick={() => setA((p) => ({ ...p, switchTo: opt.v }))}
                                  className="text-left rounded-xl p-4 transition-all"
                                  style={{
                                    border: `2px solid ${selected ? PURPLE : HAIRLINE}`,
                                    background: selected ? `${PURPLE}08` : '#FFF',
                                  }}
                                >
                                  <div className="font-bold mb-1" style={{ color: NAVY, fontSize: 14.5 }}>
                                    {opt.label}
                                  </div>
                                  <div style={{ color: MUTED, fontSize: 12.5, lineHeight: 1.5 }}>
                                    {opt.desc}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </motion.fieldset>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-10 flex items-center justify-end gap-4">
                    <button
                      type="button"
                      disabled={!stage1Valid}
                      onClick={() => setStage(2)}
                      className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
                      style={{ background: PURPLE, fontSize: 15 }}
                    >
                      Continue
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {stage === 2 && (
                <motion.div
                  key="stage2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-6">
                    <h2 className="text-[20px] font-bold mb-2" style={{ color: NAVY }}>
                      {skipCalculator
                        ? 'Estimated monthly sales volume'
                        : 'Your current processing'}
                    </h2>
                    <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.6 }}>
                      {skipCalculator
                        ? "Roughly how much do you expect to process per month? We'll size your pre-approval window."
                        : 'Pull this from a recent statement — we use it to show savings and your Capital pre-approval.'}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-semibold mb-2" style={{ color: NAVY }}>
                        Monthly processing volume ($)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={a.monthlyVolume}
                        onChange={(e) =>
                          setA((p) => ({
                            ...p,
                            monthlyVolume: e.target.value.replace(/[^0-9]/g, ''),
                          }))
                        }
                        placeholder="50,000"
                        className="w-full px-4 py-3 bg-[#F6F7FB] border rounded-lg focus:bg-white focus:outline-none focus:ring-4 transition-all"
                        style={{
                          borderColor: HAIRLINE,
                          color: NAVY,
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold mb-2" style={{ color: NAVY }}>
                        Average ticket size ($)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={a.avgTicket}
                        onChange={(e) =>
                          setA((p) => ({ ...p, avgTicket: e.target.value.replace(/[^0-9.]/g, '') }))
                        }
                        placeholder="50"
                        className="w-full px-4 py-3 bg-[#F6F7FB] border rounded-lg focus:bg-white focus:outline-none focus:ring-4 transition-all"
                        style={{ borderColor: HAIRLINE, color: NAVY }}
                      />
                    </div>

                    {!skipCalculator && (
                      <>
                        <div>
                          <label className="block text-[13px] font-semibold mb-2" style={{ color: NAVY }}>
                            Current processing rate (%)
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={a.currentRate}
                            onChange={(e) =>
                              setA((p) => ({ ...p, currentRate: e.target.value.replace(/[^0-9.]/g, '') }))
                            }
                            placeholder="2.9"
                            className="w-full px-4 py-3 bg-[#F6F7FB] border rounded-lg focus:bg-white focus:outline-none focus:ring-4 transition-all"
                            style={{ borderColor: HAIRLINE, color: NAVY }}
                          />
                        </div>
                        <div>
                          <label className="block text-[13px] font-semibold mb-2" style={{ color: NAVY }}>
                            Per-transaction fee ($)
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={a.currentPerTxn}
                            onChange={(e) =>
                              setA((p) => ({ ...p, currentPerTxn: e.target.value.replace(/[^0-9.]/g, '') }))
                            }
                            placeholder="0.30"
                            className="w-full px-4 py-3 bg-[#F6F7FB] border rounded-lg focus:bg-white focus:outline-none focus:ring-4 transition-all"
                            style={{ borderColor: HAIRLINE, color: NAVY }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-10 flex items-center justify-between gap-4">
                    <Link
                      to="/calculator"
                      className="inline-flex items-center gap-2 text-[14px] font-semibold"
                      style={{ color: PURPLE }}
                    >
                      <Calculator size={16} />
                      Open full calculator
                    </Link>
                    <button
                      type="button"
                      disabled={!stage2Valid}
                      onClick={() => setStage(3)}
                      className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
                      style={{ background: PURPLE, fontSize: 15 }}
                    >
                      See my offer
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {stage === 3 && (
                <motion.div
                  key="stage3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-center mb-6">
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-bold uppercase mb-3"
                      style={{ color: PURPLE, background: `${PURPLE}10`, letterSpacing: '0.14em' }}
                    >
                      <Zap size={12} /> Your snapshot
                    </div>
                    <h2 className="text-[24px] font-bold" style={{ color: NAVY }}>
                      Here's what we can do for you.
                    </h2>
                  </div>

                  {/* Result cards */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {!skipCalculator && a.currentRate && (
                      <div
                        className="rounded-2xl p-6"
                        style={{ background: '#F4F3FA', border: `1px solid ${HAIRLINE}` }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp size={16} color={PURPLE} />
                          <div
                            className="text-[11px] font-bold uppercase"
                            style={{ color: PURPLE, letterSpacing: '0.14em' }}
                          >
                            Estimated savings
                          </div>
                        </div>
                        <div className="text-[28px] font-bold mb-1" style={{ color: NAVY }}>
                          {formatCurrency(calc.savings)}/mo
                        </div>
                        <div style={{ color: MUTED, fontSize: 13 }}>
                          {formatCurrency(calc.savings * 12)} per year vs. your current rate
                        </div>
                      </div>
                    )}

                    <div
                      className="rounded-2xl p-6"
                      style={{ background: NAVY, color: '#FFF' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sliders size={16} color="#FFF" />
                        <div
                          className="text-[11px] font-bold uppercase"
                          style={{ color: '#FFF', letterSpacing: '0.14em', opacity: 0.85 }}
                        >
                          Capital pre-approval window
                        </div>
                      </div>
                      <div className="text-[28px] font-bold mb-1">
                        {a.accepts === 'no'
                          ? 'After 30–60 days'
                          : `${formatCurrency(calc.preApprovalLow)} – ${formatCurrency(calc.preApprovalHigh)}`}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                        {a.accepts === 'no'
                          ? 'Once we see processing volume, your pre-approval lights up automatically.'
                          : 'Final amount confirmed after a quick verification — funded in 24–48 hours.'}
                      </div>
                    </div>
                  </div>

                  {/* Lead-tag context line */}
                  <div
                    className="rounded-xl p-4 mb-6"
                    style={{ background: '#F6F7FB', borderLeft: `4px solid ${PURPLE}` }}
                  >
                    <div style={{ color: NAVY, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                      What happens next
                    </div>
                    <div style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.55 }}>
                      {(() => {
                        const tag = deriveLeadTag(a);
                        if (tag === 'Existing-Customer-Upsell')
                          return 'We\u2019ll route you to your existing Delt account so we can pre-fill your offer instantly.';
                        if (tag === 'CAP-Only')
                          return "Capital-only flow. We won't touch your processor — just verify business + bank to fund you in 24\u201348 hrs.";
                        if (tag === 'MS+CAP-NewMerchant')
                          return 'New-merchant onboarding. We\u2019ll set up processing first; Capital pre-approval activates after ~30\u201360 days of volume.';
                        return 'Bundled application. You\u2019ll get a Delt processing account + your Capital offer in one short flow.';
                      })()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={continueToApply}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold text-white transition-all hover:brightness-110"
                    style={{ background: PURPLE, fontSize: 16, boxShadow: `0 4px 18px ${PURPLE}40` }}
                  >
                    Continue to application
                    <ArrowRight size={18} />
                  </button>

                  <div className="flex items-center justify-center gap-6 mt-6 text-[12px]" style={{ color: MICRO }}>
                    <div className="flex items-center gap-1.5">
                      <Check size={12} color={PURPLE} /> Soft pull only
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} color={PURPLE} /> 24\u201348 hr funding
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={12} color={PURPLE} /> No obligation
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}

export default GetFundedPage;
