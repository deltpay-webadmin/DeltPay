import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Calculator, CheckCircle, Store, Globe } from 'lucide-react';

/* ─── Delt pricing model constants ─────────────────────────────────────────
   The calculator recommends the model that keeps the MOST money in the
   merchant's pocket, in this order of preference:

     1. Pass fees to customers (surcharge / cash-discount) — default ON.
        The card fee is added at checkout, so the merchant nets the full sale
        and only absorbs the non-surchargeable (debit) share.
     2. Interchange-plus — pay true network interchange plus a fixed Delt
        margin. Used when the merchant would rather not surcharge.
     3. Lowest flat rate — the last resort: one simple rate, dropped as low
        as Delt will go.

   Interchange / network / margin figures mirror the Payments page disclosure. */
const NETWORK_FEE = 0.0013; // 0.13% card-network assessments
const DELT_MARGIN = 0.0025; // 0.25% Delt interchange-plus margin

// Blended average interchange by how the card is accepted.
const INTERCHANGE = {
  present: 0.0165, // card-present (in person) runs cheaper
  notPresent: 0.02, // card-not-present (online, invoice, phone) runs higher
};
const INTERCHANGE_PER_TXN = 0.1;

// Lowest flat rate Delt will drop to — the last-resort model.
const FLAT = {
  present: { rate: 0.026, perTxn: 0.1 },
  notPresent: { rate: 0.029, perTxn: 0.1 },
};

// Share of volume that can't be surcharged (regulated debit). The merchant
// still absorbs this slice at interchange-plus even when passing fees.
const NON_SURCHARGEABLE = 0.2;

type Acceptance = 'present' | 'notPresent';

export function CalculatorPage() {
  const [processingRate, setProcessingRate] = useState('2.9');
  const [perTransactionFee, setPerTransactionFee] = useState('0.30');
  const [monthlyVolume, setMonthlyVolume] = useState('50000');
  const [avgTransactionSize, setAvgTransactionSize] = useState('50');
  const [acceptance, setAcceptance] = useState<Acceptance>('present');
  const [passFees, setPassFees] = useState(true);
  const [calculated, setCalculated] = useState(false);

  const calcSavings = () => {
    const volume = parseFloat(monthlyVolume.replace(/,/g, '')) || 0;
    const avgSize = parseFloat(avgTransactionSize.replace(/,/g, '')) || 1;
    const rate = parseFloat(processingRate) / 100 || 0;
    const perTxn = parseFloat(perTransactionFee) || 0;
    const numTransactions = avgSize > 0 ? volume / avgSize : 0;

    const currentCost = volume * rate + numTransactions * perTxn;

    // Interchange-plus for the selected acceptance type.
    const icpRate = INTERCHANGE[acceptance] + NETWORK_FEE + DELT_MARGIN;
    const interchangePlusCost = volume * icpRate + numTransactions * INTERCHANGE_PER_TXN;

    // Lowest flat rate — the last-resort floor.
    const flat = FLAT[acceptance];
    const flatCost = volume * flat.rate + numTransactions * flat.perTxn;

    let deltCost: number;
    let model: 'surcharge' | 'interchange' | 'flat';

    if (passFees) {
      // Fees passed to customers — merchant only absorbs the non-surchargeable
      // (debit) share at interchange-plus.
      deltCost = interchangePlusCost * NON_SURCHARGEABLE;
      model = 'surcharge';
    } else if (interchangePlusCost <= flatCost) {
      deltCost = interchangePlusCost;
      model = 'interchange';
    } else {
      // Last resort: lower the flat rate as far as it goes.
      deltCost = flatCost;
      model = 'flat';
    }

    const savings = currentCost - deltCost;

    return { currentCost, deltCost, savings, numTransactions, model, icpRate, flat };
  };

  const { currentCost, deltCost, savings, model, icpRate, flat } = calcSavings();

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

  const formatPct = (val: number) => `${(val * 100).toFixed(2)}%`;

  const MODEL_COPY: Record<typeof model, { label: string; blurb: string; rate: string; rateNote: string }> = {
    surcharge: {
      label: 'Pass fees to your customers',
      blurb:
        'Add a small card fee at checkout — your customers cover processing and you keep the full sale. You only absorb non-surchargeable debit.',
      rate: '$0 net',
      rateNote: 'Fees passed to customers · No hidden fees',
    },
    interchange: {
      label: 'Interchange-plus pricing',
      blurb:
        'Pay the true network interchange plus a fixed 0.25% Delt margin — no tiered markups, full line-item transparency.',
      rate: `${formatPct(icpRate)} + $${INTERCHANGE_PER_TXN.toFixed(2)}`,
      rateNote: 'Interchange + 0.25% margin · No hidden fees',
    },
    flat: {
      label: 'Lowest flat rate',
      blurb: 'One simple rate on every card — dropped as low as Delt will go. No math, no surprises.',
      rate: `${formatPct(flat.rate)} + $${flat.perTxn.toFixed(2)}`,
      rateNote: 'Per transaction · No hidden fees',
    },
  };
  const activeModel = MODEL_COPY[model];

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      {/* Hero */}
      <div className="pt-28 pb-12 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4" style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#475569',
          }}>— Savings Calculator</div>

          <h1 className="text-5xl md:text-6xl text-[#041E42] mb-4" style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.02 }}>
            Calculate your{' '}
            <span className="italic text-[#4945FF]" style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontWeight: 500 }}>
              savings.
            </span>
          </h1>
          <p className="text-[#475569] text-base max-w-xl mx-auto">See exactly how much you'd keep on Delt vs. your current processor. Real numbers, no fine print.</p>
          <div className="mt-5">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#EEF1FF] text-[#4945FF] rounded-md text-sm" style={{ fontWeight: 600 }}>
              <CheckCircle className="w-4 h-4" />
              Free processing on first $5K in sales*
            </span>
            <p className="text-xs text-[#475569] mt-2">*Applies to new accounts on the Growth ($89/mo) or Personalized plan — not the Free plan. See <Link to="/terms" className="underline">Terms</Link>.</p>
          </div>
        </motion.div>
      </div>

      {/* Calculator Card */}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 pb-24">
        <motion.div
          className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left - Form */}
            <div className="p-8 md:p-10">
              <h2 className="text-xl text-[#041E42] mb-6" style={{ fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Your current payment fees
              </h2>

              <div className="space-y-5">
                {/* Acceptance type */}
                <div>
                  <label className="block text-sm text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>How do you take payments?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: 'present' as const, icon: Store, title: 'In person', sub: 'Card present' },
                      { key: 'notPresent' as const, icon: Globe, title: 'Online', sub: 'Invoice · phone' },
                    ]).map(({ key, icon: Icon, title, sub }) => {
                      const active = acceptance === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setAcceptance(key)}
                          className={`flex items-center gap-2.5 px-3.5 py-3 rounded-lg border text-left transition-all ${
                            active
                              ? 'border-[#4945FF] bg-[#4945FF]/8 ring-2 ring-[#4945FF]/15'
                              : 'border-[#E5E7EB] hover:border-[#4945FF]/40'
                          }`}
                        >
                          <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[#4945FF]' : 'text-[#9CA3AF]'}`} />
                          <span className="leading-tight">
                            <span className={`block text-sm ${active ? 'text-[#041E42]' : 'text-[#374151]'}`} style={{ fontWeight: 600 }}>{title}</span>
                            <span className="block text-xs text-[#9CA3AF]">{sub}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Processing Rate */}
                <div>
                  <label className="block text-sm text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Processing rate (%)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={processingRate}
                      onChange={(e) => setProcessingRate(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#041E42] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF] transition-all"
                      placeholder="2.9"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">%</span>
                  </div>
                </div>

                {/* Per-transaction fee */}
                <div>
                  <label className="block text-sm text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Per-transaction fee ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">$</span>
                    <input
                      type="text"
                      value={perTransactionFee}
                      onChange={(e) => setPerTransactionFee(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-[#E5E7EB] rounded-lg text-[#041E42] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF] transition-all"
                      placeholder="0.30"
                    />
                  </div>
                </div>

                {/* Monthly Volume */}
                <div>
                  <label className="block text-sm text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Monthly processing volume ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">$</span>
                    <input
                      type="text"
                      value={monthlyVolume}
                      onChange={(e) => setMonthlyVolume(e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={() => setMonthlyVolume(prev => prev.replace(/,/g, ''))}
                      className="w-full pl-8 pr-4 py-3 border border-[#E5E7EB] rounded-lg text-[#041E42] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF] transition-all"
                      placeholder="50,000"
                    />
                  </div>
                </div>

                {/* Average Transaction Size */}
                <div>
                  <label className="block text-sm text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Average transaction size ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">$</span>
                    <input
                      type="text"
                      value={avgTransactionSize}
                      onChange={(e) => setAvgTransactionSize(e.target.value.replace(/[^0-9.]/g, ''))}
                      className="w-full pl-8 pr-4 py-3 border border-[#E5E7EB] rounded-lg text-[#041E42] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF] transition-all"
                      placeholder="50"
                    />
                  </div>
                </div>

                {/* Pass fees to customers toggle */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                  <div className="flex-1">
                    <div className="text-sm text-[#041E42]" style={{ fontWeight: 600 }}>Pass processing fees to customers</div>
                    <p className="text-xs text-[#475569] mt-0.5">
                      {passFees
                        ? 'On — a small card fee is added at checkout, so you keep the most of every sale.'
                        : 'Off — you absorb processing on Delt interchange-plus.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={passFees}
                    aria-label="Pass processing fees to customers"
                    onClick={() => setPassFees(v => !v)}
                    className={`relative inline-flex flex-shrink-0 h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4945FF]/30 ${
                      passFees ? 'bg-[#4945FF]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        passFees ? 'translate-x-[22px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={() => setCalculated(true)}
                  className="w-full py-3.5 bg-[#4945FF] hover:bg-[#3933CC] text-white rounded-lg transition-colors text-base"
                  style={{ fontWeight: 600 }}
                >
                  Calculate my savings
                </button>
              </div>

              {/* Delt Rates */}
              <div className="mt-6 p-5 bg-[#4945FF]/8 rounded-xl border border-[#4945FF]/15">
                <div className="text-xs text-[#4945FF] mb-1 tracking-wider uppercase" style={{ fontWeight: 700 }}>Your Delt Rate</div>
                <div className="text-2xl text-[#041E42]" style={{ fontWeight: 800 }}>{activeModel.rate}</div>
                <div className="text-sm text-[#475569] mt-0.5">{activeModel.rateNote}</div>
              </div>
            </div>

            {/* Right - Results */}
            <div className="p-8 md:p-10 bg-[#F3F4FF] border-t md:border-t-0 md:border-l border-[#E5E7EB] flex flex-col items-center justify-center">
              {!calculated ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#F0EDFF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-8 h-8 text-[#4945FF]" />
                  </div>
                  <p className="text-[#475569]">Fill out the form to see your savings</p>
                </div>
              ) : (
                <motion.div
                  key={model}
                  className="w-full space-y-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Recommended model */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#4945FF]/10 text-[#4945FF] rounded-full text-xs" style={{ fontWeight: 700 }}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Best fit: {activeModel.label}
                  </div>

                  <div>
                    <p className="text-sm text-[#475569] mb-1">Your current monthly cost</p>
                    <p className="text-2xl text-[#041E42]" style={{ fontWeight: 700 }}>{formatCurrency(currentCost)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-[#475569] mb-1">With Delt</p>
                    <p className="text-2xl text-[#4945FF]" style={{ fontWeight: 700 }}>{formatCurrency(deltCost)}</p>
                  </div>

                  <div className="h-px bg-[#E5E7EB]" />

                  <div>
                    <p className="text-sm text-[#475569] mb-1">Monthly savings</p>
                    <p className="text-3xl text-[#4945FF]" style={{ fontWeight: 800 }}>
                      {savings > 0 ? formatCurrency(savings) : '$0.00'}
                    </p>
                    {savings > 0 && (
                      <p className="text-sm text-[#4945FF] mt-1" style={{ fontWeight: 500 }}>
                        {formatCurrency(savings * 12)} saved per year
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-[#475569]">{activeModel.blurb}</p>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Link
                      to="/apply"
                      className="block w-full text-center py-3.5 bg-[#4945FF] hover:bg-[#3933CC] text-white rounded-lg transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      Get started with Delt
                    </Link>
                  </motion.div>
                  <p className="text-xs text-[#475569] mt-4 max-w-md">Savings estimates are illustrative and based on the rates you entered and the payment model shown. Actual savings depend on card mix, plan, volume, and applicable surcharge regulations. Debit cards can't be surcharged and are billed at interchange-plus.</p>
                  <p className="text-sm text-[#475569] mt-2">Questions? <Link to="/support" className="text-[#4945FF] underline">Chat with us</Link></p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
