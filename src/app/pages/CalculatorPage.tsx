import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Calculator, CheckCircle } from 'lucide-react';

export function CalculatorPage() {
  const [processingRate, setProcessingRate] = useState('2.9');
  const [perTransactionFee, setPerTransactionFee] = useState('0.30');
  const [monthlyVolume, setMonthlyVolume] = useState('50000');
  const [avgTransactionSize, setAvgTransactionSize] = useState('50');
  const [calculated, setCalculated] = useState(false);

  // Delt's only cost: a flat $89/mo for unlimited processing. Card fees
  // themselves are passed to card-paying customers via the cash-discount
  // program, so there is no percentage or per-transaction processing cost.
  const DELT_MONTHLY = 89;

  const calcSavings = () => {
    const volume = parseFloat(monthlyVolume.replace(/,/g, '')) || 0;
    const avgSize = parseFloat(avgTransactionSize.replace(/,/g, '')) || 1;
    const rate = parseFloat(processingRate) / 100 || 0;
    const perTxn = parseFloat(perTransactionFee) || 0;
    const numTransactions = volume / avgSize;

    const currentCost = volume * rate + numTransactions * perTxn;
    // Under the cash-discount program the card fee is passed to the
    // card-paying customer, so the merchant's entire cost with Delt is the
    // flat $89/mo — no matter the volume. Savings = everything they hand
    // their current processor today, minus that flat fee.
    const deltCost = DELT_MONTHLY;
    const savings = currentCost - deltCost;

    return { currentCost, deltCost, savings, numTransactions };
  };

  const { currentCost, deltCost, savings } = calcSavings();

  const formatCurrency = (val: number) =>
    val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

  const formatVolume = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    return num ? parseInt(num).toLocaleString() : '';
  };

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
            <p className="text-xs text-[#475569] mt-2">*Applies to new accounts on the Free plan. See <Link to="/terms" className="underline">Terms</Link>.</p>
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

                {/* Calculate Button */}
                <button
                  onClick={() => setCalculated(true)}
                  className="w-full py-3.5 bg-[#4945FF] hover:bg-[#3933CC] text-white rounded-lg transition-colors text-base"
                  style={{ fontWeight: 600 }}
                >
                  Calculate my savings
                </button>
              </div>

              {/* Delt pricing — one flat monthly fee, unlimited processing.
                  Card fees are passed to card-paying customers via the
                  cash-discount program, so there's no % or per-txn cost. */}
              <div className="mt-6 p-5 bg-[#4945FF]/8 rounded-xl border border-[#4945FF]/15">
                <div className="text-xs text-[#4945FF] mb-1 tracking-wider uppercase" style={{ fontWeight: 700 }}>Delt Pricing</div>
                <div className="text-2xl text-[#041E42]" style={{ fontWeight: 800 }}>$89/mo <span className="text-base align-middle" style={{ fontWeight: 600, color: '#475569' }}>flat</span></div>
                <div className="text-sm text-[#475569] mt-0.5">Unlimited processing · 0% card fees (passed to customers)</div>
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
                  className="w-full space-y-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div>
                    <p className="text-sm text-[#475569] mb-1">Your current monthly cost</p>
                    <p className="text-2xl text-[#041E42]" style={{ fontWeight: 700 }}>{formatCurrency(currentCost)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-[#475569] mb-1">With Delt — flat monthly</p>
                    <p className="text-2xl text-[#4945FF]" style={{ fontWeight: 700 }}>{formatCurrency(deltCost)}<span className="text-base" style={{ color: '#475569', fontWeight: 500 }}>/mo</span></p>
                    <p className="text-xs mt-1" style={{ color: '#1F845A', fontWeight: 600 }}>
                      Unlimited processing · card fees passed to your customers
                    </p>
                  </div>

                  <div className="h-px bg-[#E5E7EB]" />

                  <div>
                    <p className="text-sm text-[#475569] mb-1">Monthly savings</p>
                    <p className="text-3xl text-[#4945FF]" style={{ fontWeight: 800 }}>
                      {savings > 0 ? formatCurrency(savings) : '$0.00'}
                    </p>
                    {savings > 0 && (
                      <p className="text-sm text-[#4945FF] mt-1" style={{ fontWeight: 500 }}>
                        {formatCurrency(savings * 12)} saved per year on a flat $89/mo
                      </p>
                    )}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Link
                      to="/get-a-quote"
                      className="block w-full text-center py-3.5 bg-[#4945FF] hover:bg-[#3933CC] text-white rounded-lg transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      Get started with Delt
                    </Link>
                  </motion.div>
                  <p className="text-xs text-[#475569] mt-4 max-w-md">With Delt your only cost is a flat $89/mo for unlimited processing. Card fees are passed to card-paying customers as a service fee under a compliant cash-discount program, and cash customers receive the discounted price — so there's no percentage or per-transaction processing cost. Actual results vary by card mix, ticket size, and how customers choose to pay.</p>
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
