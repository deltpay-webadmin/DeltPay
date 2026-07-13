import { useState } from 'react';

export function SocialProof() {
  const [currentRate, setCurrentRate] = useState('');
  const [currentTransactionFee, setCurrentTransactionFee] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [avgTransactionSize, setAvgTransactionSize] = useState('');
  const [email, setEmail] = useState('');
  const [showResults, setShowResults] = useState(false);

  const calculateSavings = () => {
    const volume = parseFloat(monthlyVolume) || 0;
    const avgSize = parseFloat(avgTransactionSize) || 50;
    const transactionCount = volume / avgSize;

    // Current provider fees
    const currentRateDecimal = parseFloat(currentRate) / 100 || 0.029;
    const currentTransFee = parseFloat(currentTransactionFee) || 0.30;
    const currentTotal = (volume * currentRateDecimal) + (transactionCount * currentTransFee);

    // Delt rates: 2.6% + $0.10 per transaction
    const deltTotal = (volume * 0.026) + (transactionCount * 0.10);

    const monthlySavings = currentTotal - deltTotal;
    const annualSavings = monthlySavings * 12;

    return { monthlySavings, annualSavings, currentTotal, deltTotal };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Email submitted - show unblurred results
    alert(`Results sent to ${email}!`);
  };

  const { monthlySavings, annualSavings } = calculateSavings();
  const hasInputs = currentRate && currentTransactionFee && monthlyVolume && avgTransactionSize;

  return (
    <section className="py-40 lg:py-44 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* Promotional Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#16C784] to-[#0FA968] text-white px-6 py-2.5 rounded-full mb-6 shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-sm">Free processing on first $5K in sales*</span>
          </div>
          <p className="text-xs text-[#94A3B8] mb-6 -mt-3">*On the Growth ($89/mo) or Personalized plan — not the Free plan.</p>

          <h2 className="text-[51px] sm:text-[61px] font-bold text-[#041E42] mb-4" style={{ fontFamily: '"Codec Pro", "Codec", Inter, sans-serif' }}>
            Calculate your <span className="text-[#4945FF] italic">savings</span>
          </h2>
          <p className="text-lg text-[#6B7280] max-w-[800px] mx-auto">
            Calculate your savings with Delt
          </p>
        </div>

        <div className="max-w-5xl mx-auto relative">
          {/* Calculator View - Always Visible */}
          <div className="bg-white rounded-2xl p-8 lg:p-10 transition-shadow duration-300 border border-[#E5E7EB]" style={{ boxShadow: '0 8px 40px rgba(4,30,66,0.08), 0 2px 12px rgba(4,30,66,0.05)' }}>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column - Input Fields */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#041E42] mb-6">
                    Your current payment fees
                  </h3>
                  
                  <form onSubmit={handleCalculate} className="space-y-5">
                    {/* Processing Rate */}
                    <div>
                      <label className="block text-sm font-medium text-[#64748B] mb-2">
                        Processing rate (%)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={currentRate}
                          onChange={(e) => setCurrentRate(e.target.value)}
                          placeholder="2.9"
                          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-base text-[#041E42] placeholder:text-[#94A3B8] hover:border-[#4945FF]/30 focus:bg-white focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-medium">%</span>
                      </div>
                    </div>

                    {/* Transaction Fee */}
                    <div>
                      <label className="block text-sm font-medium text-[#64748B] mb-2">
                        Per-transaction fee ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-medium">$</span>
                        <input
                          type="text"
                          value={currentTransactionFee}
                          onChange={(e) => setCurrentTransactionFee(e.target.value)}
                          placeholder="0.30"
                          className="w-full pl-9 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-base text-[#041E42] placeholder:text-[#94A3B8] hover:border-[#4945FF]/30 focus:bg-white focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Monthly Volume */}
                    <div>
                      <label className="block text-sm font-medium text-[#64748B] mb-2">
                        Monthly processing volume ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-medium">$</span>
                        <input
                          type="text"
                          value={monthlyVolume}
                          onChange={(e) => setMonthlyVolume(e.target.value)}
                          placeholder="50,000"
                          className="w-full pl-9 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-base text-[#041E42] placeholder:text-[#94A3B8] hover:border-[#4945FF]/30 focus:bg-white focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Average Transaction Size */}
                    <div>
                      <label className="block text-sm font-medium text-[#64748B] mb-2">
                        Average transaction size ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-medium">$</span>
                        <input
                          type="text"
                          value={avgTransactionSize}
                          onChange={(e) => setAvgTransactionSize(e.target.value)}
                          placeholder="50"
                          className="w-full pl-9 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-base text-[#041E42] placeholder:text-[#94A3B8] hover:border-[#4945FF]/30 focus:bg-white focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!hasInputs}
                      className="w-full px-6 py-3.5 bg-[#4945FF] text-white rounded-xl hover:bg-[#3933CC] hover:shadow-lg transition-all font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Calculate my savings
                    </button>
                  </form>
                </div>

                {/* Delt Rates Info */}
                <div className="bg-[#F9FAFB] rounded-xl p-6 border border-[#E5E7EB]">
                  <div className="text-xs font-bold text-[#4945FF] mb-2 tracking-wide">DELT RATES</div>
                  <div className="text-3xl font-bold text-[#041E42] mb-1">2.6% + $0.10</div>
                  <div className="text-sm text-[#64748B]">Per transaction • No hidden fees</div>
                </div>
              </div>

              {/* Right Column - Results */}
              <div className="flex flex-col justify-center">
                {!showResults ? (
                  <div className="text-center text-[#6B7280]">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-base font-medium">Fill out the form to see your savings</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Results Card - Blurred until email entered */}
                    <div className={`bg-[#F9FAFB] rounded-2xl p-8 border-2 transition-all duration-300 ${!email ? 'blur-md border-[#E5E7EB]' : 'border-[#4945FF]'}`}>
                      <div className="text-center space-y-4">
                        <div>
                          <div className="text-sm font-medium text-[#16C784] mb-2">
                            Your Potential Annual Savings
                          </div>
                          <div className="text-5xl font-bold text-[#2D1F44] mb-2">
                            {formatCurrency(annualSavings)}
                          </div>
                          <div className="text-base text-[#5A4A74]">
                            Save {formatCurrency(monthlySavings)} every month
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-[#94A3B8] mb-1">Your current cost</div>
                              <div className="font-bold text-[#041E42]">
                                {formatCurrency(calculateSavings().currentTotal)}
                                <span className="text-xs font-normal text-[#94A3B8]">/mo</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-[#94A3B8] mb-1">With Delt</div>
                              <div className="font-bold text-[#16C784]">
                                {formatCurrency(calculateSavings().deltTotal)}
                                <span className="text-xs font-normal text-[#94A3B8]">/mo</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email Capture Overlay - Shows when results are calculated but email not entered */}
                    {!email && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4 border border-[#E5E7EB]">
                          <div className="text-center mb-4">
                            <div className="w-12 h-12 bg-[#4945FF] rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h4 className="text-lg font-bold text-[#041E42] mb-1">
                              Get your detailed savings report
                            </h4>
                            <p className="text-sm text-[#6B7280]">
                              Enter your email to see your full results
                            </p>
                          </div>
                          <form onSubmit={handleEmailSubmit} className="space-y-3">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="your.email@company.com"
                              required
                              className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#041E42] font-medium placeholder:text-[#CBD5E1] focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/20 transition-all"
                            />
                            <button
                              type="submit"
                              className="w-full px-6 py-3 bg-[#4945FF] text-white rounded-xl hover:bg-[#3730FF] hover:shadow-lg transition-all font-medium"
                            >
                              Get my results
                            </button>
                          </form>
                        </div>
                      </div>
                    )}

                    {/* Success state - Email entered */}
                    {email && (
                      <div className="mt-4 text-center">
                        <div className="bg-white rounded-xl p-4 border-2 border-[#16C784] shadow-sm">
                          <div className="text-sm text-[#0FA968] font-medium">
                            ✓ Detailed report sent to <strong className="text-[#0A7D4F]">{email}</strong>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setShowResults(false);
                            setEmail('');
                            setCurrentRate('');
                            setCurrentTransactionFee('');
                            setMonthlyVolume('');
                            setAvgTransactionSize('');
                          }}
                          className="mt-4 text-sm text-[#6B7280] hover:text-[#041E42] font-medium transition-colors"
                        >
                          Start over
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}