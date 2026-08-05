import React, { useState, useCallback, useMemo } from 'react';
import {
  RotateCcw, ChevronDown, Lock, ArrowRight, BarChart3,
  DollarSign, Layers, UtensilsCrossed, Store, Wrench, Scissors,
  Stethoscope, Briefcase, ShoppingCart, Package, UserPlus, Link2,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  RISK_TIERS, VOLUME_BANDS, quotePrograms, estimateProgramEconomics,
  volumeBandKey, type RiskTierKey, type ProgramQuote,
} from '../pricingPrograms';
import { leadActions, useLeads } from '../crmStore';
import { supabase } from '../../../lib/supabase';

// ─── The calculator's job vs the Statement Analyzer's ───
// Analyzer = "we have their statement" (AI extraction of real costs).
// Calculator = the live-call path: no documents yet, quote all three Delt
// programs from numbers the merchant says out loud, coach the pitch, and
// SAVE the quote to a CRM lead so the conversation is never lost. When a
// statement shows up later, the analyzer takes over on the same lead.

const MERCHANT_TYPES = [
  { key: 'restaurant', label: 'Restaurant / Bar', icon: UtensilsCrossed, cdScore: 92 },
  { key: 'retail', label: 'Retail Store', icon: Store, cdScore: 88 },
  { key: 'auto', label: 'Auto / Repair', icon: Wrench, cdScore: 95 },
  { key: 'salon', label: 'Salon / Spa', icon: Scissors, cdScore: 85 },
  { key: 'medical', label: 'Medical / Dental', icon: Stethoscope, cdScore: 70 },
  { key: 'professional', label: 'Professional Svcs', icon: Briefcase, cdScore: 65 },
  { key: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart, cdScore: 20 },
  { key: 'other', label: 'Other', icon: Package, cdScore: 75 },
];

const PROGRAM_ICONS: Record<ProgramQuote['key'], React.ComponentType<{ className?: string }>> = {
  cash_discount: DollarSign,
  flat_rate: BarChart3,
  interchange_plus: Layers,
};

const RECEPTIVITY_LEVELS = [
  { key: 'eager', label: 'Open to it', desc: 'Already aware or interested', color: '#34C77B' },
  { key: 'neutral', label: 'Needs education', desc: "Hasn't heard of it or unsure", color: '#F0B429' },
  { key: 'resistant', label: 'Pushback', desc: 'Worried about customer reaction', color: '#F2565B' },
];

export const OBJECTIONS: Record<string, { title: string; reframe: string; talk: string; data: string }> = {
  customers_upset: {
    title: '"My customers will be upset"',
    reframe: "Reframe: it's not a surcharge — it's a discount for cash",
    talk: '"You\'re not charging more for cards — you\'re offering a discount for paying cash. Your posted prices stay the same. Gas stations have done this for decades and nobody blinks. We\'ll handle all the signage and compliance so your customers see it as a perk, not a penalty."',
    data: '97% of consumers complete the transaction even after seeing the fee. Churn from cash discount programs is under 1% in retail and food service.',
  },
  lose_sales: {
    title: '"I\'ll lose sales"',
    reframe: 'Reframe: your effective rate is 0% — reinvest that into growth',
    talk: '"Right now you\'re paying $X,000/year in processing fees. That\'s money leaving your business. On cash discount, that goes to zero. You could put that into marketing, staff, inventory — things that actually drive sales. The fee is transparent, it\'s legal, and your competitors are already doing it."',
    data: 'Average merchant saves $8,400/yr on cash discount. Less than 0.5% of merchants report measurable sales decline after 90 days.',
  },
  too_complicated: {
    title: '"Sounds complicated"',
    reframe: 'Reframe: we handle everything — zero work for you',
    talk: '"We program the terminal, provide the signage, and handle compliance. Your staff doesn\'t do anything different. The adjustment shows automatically on the receipt. It\'s genuinely plug-and-play — we\'ve done this hundreds of times."',
    data: 'Average onboarding takes 15 minutes. Terminal auto-applies the adjustment — no manual entry, no training required.',
  },
  is_it_legal: {
    title: '"Is this legal?"',
    reframe: "Reframe: it's a cash discount, not a surcharge — fully compliant",
    talk: '"Cash discounting is legal in all 50 states. It\'s different from surcharging, which has restrictions. We structure the program as a service fee with a cash discount — the same model gas stations use. We handle all signage requirements and receipt language to keep you compliant."',
    data: 'Legal in all 50 states. Visa, Mastercard, and Discover all permit properly structured cash discount programs. We handle compliance.',
  },
  customers_will_leave: {
    title: '"Customers will go to my competitor"',
    reframe: 'Reframe: your competitor is probably already doing this',
    talk: '"Honestly, a lot of your competitors are already on cash discount — they\'re just not advertising it. The businesses still paying 3-4% on every swipe are the ones falling behind. This is becoming the standard, not the exception."',
    data: 'Cash discount adoption among SMBs has grown 340% since 2020. In food service and auto repair, over 40% of merchants now use some form of non-cash adjustment.',
  },
};

// ─── ENGINE ───
function getSellingStrategy(merchantType: string, receptivity: string, savings: string) {
  const mt = MERCHANT_TYPES.find(m => m.key === merchantType);
  if (!mt) return null;
  const cdScore = mt.cdScore;
  let approach: string, opener: string, keyObjections: string[], closingMove: string;

  if (cdScore >= 85) {
    if (receptivity === 'eager') {
      approach = 'Confirm & Close';
      opener = `Lead with the savings number. "${mt.label} owners love this because it eliminates processing costs entirely. Based on your volume, you'd save roughly ${savings}/year."`;
      keyObjections = ['too_complicated'];
      closingMove = 'Go straight to paperwork. They\'re ready — don\'t oversell. "Let me get this set up for you. We can have you live this week."';
    } else if (receptivity === 'neutral') {
      approach = 'Educate & Anchor';
      opener = 'Start with a question: "What are you currently paying in processing fees?" Let them say the number. Then: "What if that went to zero?" Pause. Let it land.';
      keyObjections = ['customers_upset', 'too_complicated'];
      closingMove = `Anchor to a peer: "Most ${mt.label.toLowerCase()} owners I work with switched within the first meeting once they saw the math. Want me to run your numbers?"`;
    } else {
      approach = 'Empathize & Prove';
      opener = 'Validate the concern first: "I get it — when I first heard about cash discount, I had the same reaction. But here\'s what changed my mind..." Then lead with the data.';
      keyObjections = ['customers_upset', 'lose_sales', 'customers_will_leave'];
      closingMove = 'Offer a trial frame: "Tell you what — try it for 60 days. If you don\'t like it, we switch you to flat rate, no penalty. But I\'ve never had someone switch back."';
    }
  } else if (cdScore >= 50) {
    if (receptivity === 'eager') {
      approach = 'Validate & Structure';
      opener = `They're interested but this vertical has nuance. "Cash discount works great for your business — let me show you exactly how we structure it so it feels seamless for your clients."`;
      keyObjections = ['is_it_legal', 'customers_upset'];
      closingMove = 'Position the monthly fee as the "all-in cost" — compare it to what they\'re paying now. The delta sells itself.';
    } else if (receptivity === 'neutral') {
      approach = 'Numbers First';
      opener = 'Lead with their statement. "I looked at your processing — you\'re paying X%. On cash discount, your effective rate goes to zero. The math is pretty hard to argue with."';
      keyObjections = ['customers_upset', 'is_it_legal', 'too_complicated'];
      closingMove = `Side-by-side comparison: "Here's what you pay now, here's what you'd pay. The difference is ${savings}/year back in your pocket."`;
    } else {
      approach = 'Flat Rate Bridge';
      opener = `Start with flat rate as the "safe" option, then introduce cash discount as the upgrade: "We can definitely do flat rate at X%. But honestly, most of my ${mt.label.toLowerCase()} clients end up on cash discount once they see the savings."`;
      keyObjections = ['customers_upset', 'lose_sales', 'is_it_legal', 'customers_will_leave'];
      closingMove = 'Offer flat rate as the fallback: "We can start you on flat rate today and revisit cash discount in 90 days once you\'ve seen how we operate. Sound fair?"';
    }
  } else {
    approach = 'Flat Rate Default';
    opener = `Cash discount is tough for online-only merchants since all transactions are card. Lead with flat rate: "For e-commerce, we've got a clean flat rate at X% — no hidden fees, no surprises."`;
    keyObjections = [];
    closingMove = 'Focus on the Delt ecosystem value — payments are the wedge, then layer in websites, Lens AI, and capital as the retention play.';
  }

  return { approach, opener, keyObjections, closingMove, cdScore };
}

const AVG_TICKET_PRESETS: Record<string, number> = { '0-10k': 25, '10k-25k': 35, '25k-50k': 45, '50k-100k': 55, '100k+': 65 };

// ─── HELPERS ───
const fmt = (n: number | null | undefined) => n != null ? '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—';
const fmtSigned = (n: number | null | undefined) => n != null ? (n >= 0 ? '+' : '-') + '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—';

// ══════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════
export function BackendCostCalculator() {
  const leads = useLeads();

  const [step, setStep] = useState(1);
  const [program, setProgram] = useState<ProgramQuote['key']>('cash_discount');
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [riskTier, setRiskTier] = useState<RiskTierKey | null>(null);
  const [merchantType, setMerchantType] = useState<string | null>(null);
  const [receptivity, setReceptivity] = useState<string | null>(null);
  const [avgTicket, setAvgTicket] = useState('');
  const [currentRate, setCurrentRate] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [expandedObj, setExpandedObj] = useState<string | null>(null);
  const [attachLeadId, setAttachLeadId] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedTo, setSavedTo] = useState<{ id: string; name: string } | null>(null);

  const mtData = MERCHANT_TYPES.find(m => m.key === merchantType);
  const riskData = RISK_TIERS.find(r => r.key === riskTier);

  const vol = Math.max(0, parseFloat(monthlyVolume) || 0);
  const band = vol > 0 ? volumeBandKey(vol) : null;
  const bandLabel = band ? VOLUME_BANDS.find(b => b.key === band)?.label : null;
  const ticket = parseFloat(avgTicket) || (band ? AVG_TICKET_PRESETS[band] : 40);
  const monthlyTxns = ticket > 0 ? Math.round(vol / ticket) : 0;
  const cr = parseFloat(currentRate);
  const currentMonthlyCost = cr > 0 ? vol * (cr / 100) : 0;

  const quotes = useMemo(() => {
    if (!(vol > 0) || !riskTier) return null;
    return quotePrograms({ monthlyVolume: vol, monthlyTransactions: monthlyTxns, currentMonthlyCost, riskTier });
  }, [vol, monthlyTxns, currentMonthlyCost, riskTier]);

  const economics = useMemo(() => {
    if (!(vol > 0) || !riskTier) return null;
    return estimateProgramEconomics({ monthlyVolume: vol, monthlyTransactions: monthlyTxns, currentMonthlyCost, riskTier });
  }, [vol, monthlyTxns, currentMonthlyCost, riskTier]);

  const selectedQuote = quotes?.find(q => q.key === program) ?? null;
  const selectedEcon = economics?.find(e => e.key === program) ?? null;
  const bestMarginProgram = useMemo(() => {
    if (!economics?.length) return null;
    return economics.reduce((a, b) => (b.margin > a.margin ? b : a));
  }, [economics]);

  const hasCurrentRate = cr > 0;
  const merchantSavings = hasCurrentRate && selectedQuote ? selectedQuote.annualSavings : null;
  const savingsStr = merchantSavings != null ? '$' + Math.abs(merchantSavings).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '$X,XXX';

  const strategy = useMemo(() => {
    if (!merchantType || !receptivity) return null;
    return getSellingStrategy(merchantType, receptivity, savingsStr);
  }, [merchantType, receptivity, savingsStr]);

  const reset = useCallback(() => {
    setStep(1); setProgram('cash_discount'); setMonthlyVolume(''); setRiskTier(null);
    setMerchantType(null); setReceptivity(null); setAvgTicket(''); setCurrentRate('');
    setMerchantName(''); setExpandedObj(null); setAttachLeadId(''); setSavedTo(null);
  }, []);

  const canAdvanceTo2 = Boolean(merchantType && receptivity && vol > 0 && riskTier);
  const cdScore = mtData ? mtData.cdScore : 0;
  const cdScoreColor = cdScore >= 80 ? 'text-emerald-600' : cdScore >= 50 ? 'text-amber-600' : 'text-red-600';
  const cdScoreBarColor = cdScore >= 80 ? 'bg-emerald-500' : cdScore >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const cdScoreLabel = cdScore >= 80 ? 'High Fit' : cdScore >= 50 ? 'Moderate Fit' : 'Low Fit — Consider Flat Rate';

  // ── Save the quote to the CRM: new lead or attach to an existing one.
  //    The quote is also filed into the lead's Data Vault so it sits next
  //    to statement analyses and Plaid data in the prospect's folder. ──
  const saveQuote = useCallback(async () => {
    if (!quotes || !selectedQuote || saving) return;
    setSaving(true);
    try {
      const summary =
        `Pricing quote (${selectedQuote.name}): ${selectedQuote.terms}` +
        (hasCurrentRate ? ` — projected savings ${fmt(selectedQuote.annualSavings)}/yr vs ${cr.toFixed(2)}% current.` : '.');

      let leadId: string;
      let leadName: string;
      const existing = attachLeadId ? leads.find(l => l.id === attachLeadId) : null;
      if (existing) {
        leadId = existing.id;
        leadName = existing.businessName;
        leadActions.addTimeline(existing.id, {
          title: 'Pricing quote saved',
          description: summary,
          user: 'You',
          timestamp: 'just now',
        });
      } else {
        const lead = leadActions.create({
          businessName: merchantName || 'New Prospect',
          type: 'Processing' as any,
          source: 'Cost Calculator',
          industry: mtData?.label || 'General',
          monthlySales: fmt(vol),
          notes: summary,
        });
        leadId = lead.id;
        leadName = lead.businessName;
      }

      if (supabase) {
        await supabase.from('plaid_nodes').upsert([
          { path: `/prospects/${leadId}`, name: leadName, node_type: 'folder', lead_id: leadId },
          { path: `/prospects/${leadId}/pricing-quotes`, name: 'Pricing Quotes', node_type: 'folder', lead_id: leadId },
        ], { onConflict: 'path', ignoreDuplicates: true });
        const { error: docErr } = await supabase.from('plaid_nodes').insert({
          path: `/prospects/${leadId}/pricing-quotes/${crypto.randomUUID()}`,
          name: `Quote — ${selectedQuote.name} (${bandLabel ?? ''})`.trim(),
          node_type: 'document',
          doc_kind: 'pricing_quote',
          lead_id: leadId,
          data: {
            inputs: {
              merchantName: merchantName || null,
              merchantType, receptivity, riskTier,
              monthlyVolume: vol, avgTicket: ticket, monthlyTransactions: monthlyTxns,
              currentRatePct: hasCurrentRate ? cr : null,
            },
            selectedProgram: selectedQuote.key,
            quotes,
            cdFitScore: cdScore,
            strategy: strategy ? { approach: strategy.approach, closingMove: strategy.closingMove } : null,
            quotedAt: new Date().toISOString(),
          },
        });
        if (docErr) throw docErr;
      }

      setSavedTo({ id: leadId, name: leadName });
      toast.success(existing ? `Quote saved to ${leadName}` : `Lead created — quote saved to ${leadName}`);
    } catch (err: any) {
      console.error('[calculator] save failed:', err);
      toast.error(`Couldn't save quote: ${err?.message ?? err}`);
    } finally {
      setSaving(false);
    }
  }, [quotes, selectedQuote, saving, attachLeadId, leads, merchantName, mtData, vol, ticket, monthlyTxns, hasCurrentRate, cr, cdScore, strategy, bandLabel, merchantType, receptivity, riskTier]);

  const steps = [
    { n: 1, label: 'Qualify' },
    { n: 2, label: 'Quote' },
    { n: 3, label: 'Playbook' },
  ];

  return (
    <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Live Quote Calculator</h2>
            <p className="text-xs text-gray-400 mt-0.5">No statement needed — quote all three programs from the numbers the merchant gives you, then save it to a lead.</p>
          </div>
          <button onClick={reset} className="px-3.5 py-2 border border-gray-200 rounded-[6px] text-sm text-gray-500 bg-white hover:bg-gray-50 inline-flex items-center gap-2 font-medium transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Start Over
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-1 bg-gray-100 rounded-[8px] p-1">
          {steps.map(s => {
            const isActive = step === s.n;
            const isDone = step > s.n;
            const canClick = s.n <= step || (s.n === 2 && canAdvanceTo2) || (s.n === 3 && canAdvanceTo2);
            return (
              <button
                key={s.n}
                onClick={() => canClick && setStep(s.n)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[6px] text-sm font-medium transition-all ${
                  isActive ? 'bg-white shadow-sm text-gray-900' : isDone ? 'text-emerald-600' : 'text-gray-400'
                } ${canClick ? 'cursor-pointer' : 'cursor-default opacity-40'}`}
              >
                <span className={`rounded-full flex items-center justify-center text-[11px] font-bold ${
                  isActive ? 'bg-brand text-white' : isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'
                }`} style={{ width: 22, height: 22 }}>
                  {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : s.n}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>

        {/* ═══ STEP 1: QUALIFY ═══ */}
        {step === 1 && (
          <div className="space-y-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left */}
              <div className="space-y-5">
                {/* Merchant Name */}
                <FieldGroup label="Merchant Name">
                  <input
                    type="text" value={merchantName} onChange={e => setMerchantName(e.target.value)}
                    placeholder="e.g. Mario's Pizzeria"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-[8px] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </FieldGroup>

                {/* Business Type */}
                <FieldGroup label="Business Type">
                  <div className="grid grid-cols-4 gap-2">
                    {MERCHANT_TYPES.map(mt => {
                      const Icon = mt.icon;
                      const active = merchantType === mt.key;
                      return (
                        <button
                          key={mt.key}
                          onClick={() => setMerchantType(mt.key)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-[8px] border transition-all text-center ${
                            active
                              ? 'border-brand bg-indigo-50/50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${active ? 'text-brand' : 'text-gray-400'}`} />
                          <span className="text-[11px] font-medium text-gray-600 leading-tight">{mt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </FieldGroup>

                {/* Monthly card volume — a real number, not a guess */}
                <FieldGroup label="Monthly Card Volume" hint="Type the number the merchant gives you — the quote uses it exactly. Chips are quick-fill shortcuts.">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-mono">$</span>
                    <input
                      type="number" min="0" value={monthlyVolume} onChange={e => setMonthlyVolume(e.target.value)}
                      placeholder="e.g. 42000"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-[8px] text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {VOLUME_BANDS.map(b => (
                      <button
                        key={b.key}
                        onClick={() => setMonthlyVolume(String(b.midpoint))}
                        className={`px-3 py-1.5 rounded-[6px] text-xs font-medium font-mono transition-all ${
                          band === b.key
                            ? 'bg-brand text-white'
                            : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </FieldGroup>

                {/* Risk */}
                <FieldGroup label="Risk Category">
                  <div className="space-y-1.5">
                    {RISK_TIERS.map(tier => {
                      const active = riskTier === tier.key;
                      return (
                        <button
                          key={tier.key}
                          onClick={() => setRiskTier(tier.key as RiskTierKey)}
                          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] border transition-all text-left ${
                            active ? `${tier.bg} ${tier.border}` : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: tier.color, boxShadow: active ? `0 0 8px ${tier.color}40` : 'none' }} />
                          <div>
                            <p className={`text-sm font-semibold ${active ? tier.text : 'text-gray-700'}`}>{tier.label}</p>
                            <p className="text-[11px] text-gray-500">{tier.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </FieldGroup>
              </div>

              {/* Right */}
              <div className="space-y-5">
                {/* Receptivity */}
                <FieldGroup label="Cash Discount Receptivity" hint="How did the merchant respond when you brought up cash discount?">
                  <div className="space-y-2">
                    {RECEPTIVITY_LEVELS.map(r => {
                      const active = receptivity === r.key;
                      return (
                        <button
                          key={r.key}
                          onClick={() => setReceptivity(r.key)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-[8px] border transition-all text-left ${
                            active ? 'border-brand bg-indigo-50/30' : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: r.color, boxShadow: active ? `0 0 10px ${r.color}50` : 'none' }} />
                          <div>
                            <p className={`text-sm font-semibold ${active ? 'text-gray-900' : 'text-gray-600'}`}>{r.label}</p>
                            <p className="text-[11px] text-gray-500">{r.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </FieldGroup>

                {/* CD Fit Score */}
                {merchantType && (
                  <div className="bg-white border border-gray-200 rounded-[8px] p-4">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Cash Discount Fit</span>
                      <span className={`text-lg font-bold font-mono ${cdScoreColor}`}>{cdScore}/100</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full ${cdScoreBarColor}`} style={{ width: `${cdScore}%`, transition: 'width 0.4s ease' }} />
                    </div>
                    <p className={`text-xs font-semibold ${cdScoreColor}`}>{cdScoreLabel}</p>
                    {cdScore < 50 && (
                      <p className="text-[11px] text-gray-500 mt-2 p-2 bg-red-50 rounded-[6px] leading-relaxed">
                        This vertical is tough for cash discount — most transactions are card-not-present. The playbook will default to flat rate with a cash discount upsell path.
                      </p>
                    )}
                  </div>
                )}

                {/* Overrides */}
                <FieldGroup label="Optional Overrides">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-1 block">Avg Ticket $</label>
                      <input type="number" value={avgTicket} onChange={e => setAvgTicket(e.target.value)}
                        placeholder={band ? `~$${AVG_TICKET_PRESETS[band]}` : '—'}
                        className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-[6px] text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-1 block">Current Rate %</label>
                      <input type="number" step="0.01" value={currentRate} onChange={e => setCurrentRate(e.target.value)}
                        placeholder="e.g. 3.50"
                        className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-[6px] text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Add their current rate to unlock savings numbers in the quote and playbook.</p>
                </FieldGroup>
              </div>
            </div>

            {canAdvanceTo2 && (
              <div className="flex justify-end pt-5 border-t border-gray-100 mt-6">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded-[6px] hover:bg-brand-hover transition-colors inline-flex items-center gap-2">
                  Quote All Programs <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ STEP 2: QUOTE ═══ */}
        {step === 2 && canAdvanceTo2 && quotes && (
          <div className="space-y-5">
            {/* All three programs, side by side */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {quotes.map(q => {
                const Icon = PROGRAM_ICONS[q.key];
                const active = program === q.key;
                const recommended = q.key === 'cash_discount' && cdScore >= 50;
                return (
                  <button
                    key={q.key}
                    onClick={() => setProgram(q.key)}
                    className={`relative flex flex-col gap-2 p-4 rounded-[8px] border text-left transition-all ${
                      active ? 'border-brand bg-indigo-50/30' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4.5 h-4.5 ${active ? 'text-brand' : 'text-gray-400'}`} style={{ width: 18, height: 18 }} />
                      <p className="text-sm font-semibold text-gray-900">{q.name}</p>
                      {recommended && (
                        <span className="absolute top-2 right-2.5 text-[9px] font-bold tracking-wide text-brand bg-indigo-100 px-2 py-0.5 rounded">RECOMMENDED</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug">{q.tagline}</p>
                    <p className="text-xs font-mono text-gray-700">{q.terms}</p>
                    <div className="flex items-baseline justify-between border-t border-gray-100 pt-2 mt-auto">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide">Merchant pays</span>
                      <span className="text-sm font-bold font-mono text-gray-900">{fmt(q.monthlyCost)}/mo</span>
                    </div>
                    {hasCurrentRate && (
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">Saves</span>
                        <span className={`text-sm font-bold font-mono ${q.annualSavings > 0 ? 'text-emerald-600' : 'text-gray-500'}`}>{fmt(q.annualSavings)}/yr</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
              {/* Pricing Output */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-[8px] p-6 text-center">
                  {merchantName && <p className="text-lg font-semibold text-gray-900 mb-1">{merchantName}</p>}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-[11px] text-gray-500 font-medium mb-5">
                    <span className="w-2 h-2 rounded-full" style={{ background: riskData?.color }} />
                    {riskData?.label} · {fmt(vol)}/mo card volume
                  </div>

                  {program === 'cash_discount' && (
                    <div className="flex items-center justify-center gap-0">
                      <div className="flex-1 px-4">
                        <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Merchant Effective Rate</p>
                        <p className="text-5xl font-bold text-emerald-600 font-mono leading-none">0.00<span className="text-xl opacity-60 ml-0.5">%</span></p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-2">processing cost eliminated</p>
                      </div>
                      <div className="w-px h-16 bg-gray-200" />
                      <div className="flex-1 px-4">
                        <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Cost to Merchant</p>
                        <p className="text-5xl font-bold text-gray-900 font-mono leading-none">{fmt(selectedQuote?.monthlyCost)}<span className="text-xl text-brand ml-0.5">/mo</span></p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-2">program fee only</p>
                      </div>
                    </div>
                  )}
                  {program === 'flat_rate' && (
                    <div>
                      <p className="text-6xl font-bold text-gray-900 font-mono leading-none">
                        {selectedQuote?.effectiveRatePct != null ? selectedQuote.effectiveRatePct.toFixed(2) : '—'}<span className="text-2xl text-brand ml-0.5">%</span>
                      </p>
                      <p className="text-sm text-gray-500 font-mono mt-2">{selectedQuote?.terms}</p>
                    </div>
                  )}
                  {program === 'interchange_plus' && (
                    <div>
                      <p className="text-6xl font-bold text-gray-900 font-mono leading-none">
                        {selectedQuote?.effectiveRatePct != null ? `~${selectedQuote.effectiveRatePct.toFixed(2)}` : '—'}<span className="text-2xl text-brand ml-0.5">%</span>
                      </p>
                      <p className="text-sm text-gray-500 font-mono mt-2">pass-through interchange + transparent margin</p>
                      {!hasCurrentRate && (
                        <p className="text-[11px] text-amber-600 mt-2">Enter their current rate in Step 1 for a sharper interchange-plus estimate.</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-brand font-medium">
                    <Lock className="w-3 h-3" /> Matrix-locked — no discretionary adjustments
                  </div>
                </div>

                {/* Savings */}
                {merchantSavings != null && (
                  <div className={`border rounded-[8px] p-4 ${merchantSavings > 0 ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Merchant Saves</p>
                    <p className={`text-2xl font-bold font-mono ${merchantSavings > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmtSigned(merchantSavings)}/yr</p>
                    <p className="text-[11px] text-gray-500 mt-1">vs their current {cr.toFixed(2)}% — {fmt(currentMonthlyCost * 12)}/yr in processing costs</p>
                  </div>
                )}

                {/* Save to CRM */}
                <div className="bg-white border border-gray-200 rounded-[8px] p-4">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Save This Quote</p>
                  {savedTo ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-[6px] px-3 py-2.5">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      Saved to <span className="font-semibold">{savedTo.name}</span> — filed in the lead's Data Vault under Pricing Quotes.
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={attachLeadId}
                        onChange={e => setAttachLeadId(e.target.value)}
                        className="flex-1 min-w-[220px] px-3 py-2 bg-white border border-gray-200 rounded-[6px] text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      >
                        <option value="">Create a new lead{merchantName ? ` — ${merchantName}` : ''}</option>
                        {leads.map(l => (
                          <option key={l.id} value={l.id}>Attach to: {l.businessName}</option>
                        ))}
                      </select>
                      <button
                        onClick={saveQuote}
                        disabled={saving}
                        className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-[6px] hover:bg-brand-hover transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        {attachLeadId ? <Link2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        {saving ? 'Saving…' : attachLeadId ? 'Save to Lead' : 'Create Lead + Save'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Delt Economics Sidebar */}
              <div className="bg-gray-50 border border-gray-200 rounded-[8px] p-4 space-y-3 h-fit">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" /> Delt Economics <span className="text-gray-400 font-normal normal-case text-[9px]">(internal)</span>
                </div>

                {selectedEcon && (
                  <div className="space-y-2">
                    <EconRow label="Gross Revenue" value={fmt(selectedEcon.grossRevenue)} accent />
                    <EconRow label="Est. Interchange" value={fmt(selectedEcon.interchangeCost)} />
                    <EconRow label="Annual Margin" value={fmt(selectedEcon.margin)} color="text-emerald-600"
                      sub={`${selectedEcon.marginBps} bps of volume`} />
                  </div>
                )}

                {economics && bestMarginProgram && (
                  <div className="bg-indigo-50 rounded-[6px] p-3 mt-2">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Margin by Program</p>
                    <div className="space-y-1.5">
                      {economics.map(e => (
                        <div key={e.key} className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-500">{e.name}</span>
                          <span className={`text-xs font-bold font-mono ${e.key === bestMarginProgram.key ? 'text-emerald-600' : 'text-gray-500'}`}>{fmt(e.margin)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] mt-2 font-medium text-emerald-600">
                      {bestMarginProgram.name} is the best margin for Delt.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-5 border-t border-gray-100">
              <button onClick={() => setStep(1)} className="px-4 py-2 border border-gray-200 rounded-[6px] text-sm text-gray-500 bg-white hover:bg-gray-50 font-medium">← Back</button>
              <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded-[6px] hover:bg-brand-hover transition-colors inline-flex items-center gap-2">
                View Playbook <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: PLAYBOOK ═══ */}
        {step === 3 && strategy && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between bg-indigo-50/50 border border-indigo-100 rounded-[8px] p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{strategy.approach}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {merchantName || mtData?.label} · {RECEPTIVITY_LEVELS.find(r => r.key === receptivity)?.label} · CD Fit: {cdScore}/100
                </p>
              </div>
              <span className="text-[11px] font-semibold text-brand bg-indigo-100 px-3 py-1.5 rounded-[6px] whitespace-nowrap">
                {selectedQuote?.name} · {fmt(vol)}/mo
              </span>
            </div>

            {/* Opening Move */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-brand flex items-center justify-center text-xs font-bold font-mono">1</span>
                <span className="text-sm font-semibold text-gray-700">Opening Move</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-[8px] p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{strategy.opener}</p>
              </div>
            </div>

            {/* Objections */}
            {strategy.keyObjections.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-brand flex items-center justify-center text-xs font-bold font-mono">2</span>
                  <span className="text-sm font-semibold text-gray-700">Handle These Objections</span>
                  <span className="text-[11px] text-gray-400">Most likely for this merchant profile</span>
                </div>
                <div className="space-y-2">
                  {/* Primary objections */}
                  {strategy.keyObjections.map(objKey => {
                    const obj = OBJECTIONS[objKey];
                    if (!obj) return null;
                    const isOpen = expandedObj === objKey;
                    return (
                      <div key={objKey} className={`border rounded-[8px] overflow-hidden transition-colors ${isOpen ? 'border-brand/20' : 'border-gray-200'}`}>
                        <button onClick={() => setExpandedObj(isOpen ? null : objKey)} className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 text-left transition-colors">
                          <span className="text-sm font-semibold text-gray-800">{obj.title}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 space-y-3 bg-white">
                            <p className="text-xs font-semibold text-brand italic">{obj.reframe}</p>
                            <div>
                              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">What to say:</p>
                              <div className="text-sm text-gray-700 leading-relaxed p-3 bg-indigo-50/50 rounded-[6px]" style={{ borderLeft: '3px solid #4318FF' }}>
                                {obj.talk}
                              </div>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                              <BarChart3 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
                              {obj.data}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* Secondary objections */}
                  {Object.keys(OBJECTIONS).filter(k => !strategy.keyObjections.includes(k)).map(objKey => {
                    const obj = OBJECTIONS[objKey];
                    const isOpen = expandedObj === objKey;
                    return (
                      <div key={objKey} className={`border rounded-[8px] overflow-hidden opacity-60 transition-colors ${isOpen ? 'border-brand/15 opacity-100' : 'border-gray-100'}`}>
                        <button onClick={() => setExpandedObj(isOpen ? null : objKey)} className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 text-left transition-colors">
                          <span className="text-sm font-medium text-gray-600">{obj.title}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 space-y-3 bg-white">
                            <p className="text-xs font-semibold text-brand italic">{obj.reframe}</p>
                            <div>
                              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">What to say:</p>
                              <div className="text-sm text-gray-700 leading-relaxed p-3 bg-indigo-50/50 rounded-[6px]" style={{ borderLeft: '3px solid #4318FF' }}>
                                {obj.talk}
                              </div>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                              <BarChart3 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
                              {obj.data}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Closing Move */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold font-mono">
                  {strategy.keyObjections.length > 0 ? '3' : '2'}
                </span>
                <span className="text-sm font-semibold text-gray-700">Closing Move</span>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-[8px] p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{strategy.closingMove}</p>
              </div>
            </div>

            {/* Quick Reference */}
            {merchantSavings != null && (
              <div className="bg-white border border-gray-200 rounded-[8px] p-4">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Reference Numbers</p>
                <div className="grid grid-cols-4 gap-3">
                  <QRItem label="Merchant Saves" value={`${fmtSigned(merchantSavings)}/yr`} color="text-emerald-600" />
                  <QRItem label="Current Rate" value={`${cr.toFixed(2)}%`} />
                  <QRItem label="New Rate" value={selectedQuote?.effectiveRatePct != null ? `${selectedQuote.effectiveRatePct.toFixed(2)}%` : '—'} color="text-emerald-600" />
                  <QRItem label="Delt Margin" value={`${fmt(selectedEcon?.margin)}/yr`} />
                </div>
              </div>
            )}

            <div className="flex justify-start pt-5 border-t border-gray-100">
              <button onClick={() => setStep(2)} className="px-4 py-2 border border-gray-200 rounded-[6px] text-sm text-gray-500 bg-white hover:bg-gray-50 font-medium">← Back to Quote</button>
            </div>
          </div>
        )}
    </div>
  );
}

// ── Sub-components ──

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {hint && <p className="text-xs text-gray-400 -mt-1">{hint}</p>}
      {children}
    </div>
  );
}

function EconRow({ label, value, color, sub, accent }: { label: string; value: string; color?: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`flex flex-wrap justify-between items-baseline ${accent ? 'border-t border-gray-200 pt-2.5 mt-1' : ''}`}>
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className={`text-sm font-bold font-mono ${color || (accent ? 'text-gray-900' : 'text-gray-600')}`}>{value}</span>
      {sub && <span className="w-full text-right text-[10px] text-gray-400 font-mono">{sub}</span>}
    </div>
  );
}

function QRItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-base font-bold font-mono ${color || 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
