import { useState } from 'react';
import { Landmark, TrendingUp, DollarSign, Calendar, CheckCircle2, Clock, ArrowUpRight, Shield, Upload, ChevronLeft, Calculator } from 'lucide-react';
import { useToast, ToastContainer } from './ui/Toast';

export function CapitalDashboard() {
  const [showDetails, setShowDetails] = useState(false);
  const [showAllRepayments, setShowAllRepayments] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [savingsToolMode, setSavingsToolMode] = useState<'options' | 'calculator' | 'upload' | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  // Calculator state
  const [processingRate, setProcessingRate] = useState('2.9');
  const [perTransactionFee, setPerTransactionFee] = useState('0.30');
  const [monthlyVolume, setMonthlyVolume] = useState('50000');
  const [avgTransactionSize, setAvgTransactionSize] = useState('50');

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [emailAddress, setEmailAddress] = useState('');

  const loanBalance = 32400;
  const loanTotal = 55000;
  const paidPercent = ((loanTotal - loanBalance) / loanTotal) * 100;
  const dailyRepayment = 203;
  const estimatedPayoff = 'Aug 14, 2026';

  // Calculate savings
  const calculateSavings = () => {
    const volume = parseFloat(monthlyVolume) || 0;
    const rate = parseFloat(processingRate) || 0;
    const fee = parseFloat(perTransactionFee) || 0;
    const avgSize = parseFloat(avgTransactionSize) || 0;
    
    const numTransactions = avgSize > 0 ? volume / avgSize : 0;
    const currentCost = (volume * rate / 100) + (numTransactions * fee);
    
    // Delt's competitive rate
    const deltRate = 2.6;
    const deltFee = 0.10;
    const deltCost = (volume * deltRate / 100) + (numTransactions * deltFee);
    
    const savings = currentCost - deltCost;
    return { currentCost, deltCost, savings, deltRate, deltFee };
  };

  const savingsData = calculateSavings();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-[1080px] mx-auto px-10 pt-8 pb-0">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h1 className="mb-0.5" style={{ fontSize: 20, fontWeight: 600, color: '#0a2540', letterSpacing: '-0.3px' }}>Capital</h1>
            <p style={{ fontSize: 13, color: '#8898aa' }}>Loan balance, repayment progress, and savings tools</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSavingsToolMode('calculator')}
              className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-md text-sm transition-colors hover:bg-[#fafafa]"
              style={{ fontWeight: 500, color: '#425466', border: '1px solid #e6e6e6', backgroundColor: '#ffffff' }}
            >
              <Calculator className="w-3.5 h-3.5" /> Calculate Savings
            </button>
            <button
              onClick={() => setApplyModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-md text-sm text-white transition-colors"
              style={{ fontWeight: 500, backgroundColor: '#635bff' }}
            >
              <Landmark className="w-3.5 h-3.5" /> Apply for Capital
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1080px] mx-auto px-10 pb-8">
        {/* Active Loan Card */}
        <div className="border border-[#E8E8E8] rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#635bff]/8 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-[#635bff]" />
            </div>
            <div>
              <h2 className="text-base text-[#111]" style={{ fontWeight: 700 }}>Active Loan</h2>
              <span className="text-xs text-[#999]">Delt Capital Advance · Issued Jan 15, 2026</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#0cbc87] ml-2" style={{ fontWeight: 600 }}>Active</span>
          </div>

          {/* Loan stats — joined block matching Payments style */}
          <div
            className="grid grid-cols-4 mb-8 overflow-hidden"
            style={{ backgroundColor: '#f4f5f7', border: '1px solid #e6e6e6', borderRadius: 8 }}
          >
            {[
              { label: 'Original Amount', value: `$${loanTotal.toLocaleString()}`, dotColor: '#635bff' },
              { label: 'Remaining Balance', value: `$${loanBalance.toLocaleString()}`, dotColor: '#f5a623' },
              { label: 'Daily Repayment', value: `$${dailyRepayment}`, dotColor: '#0cbc87' },
              { label: 'Est. Payoff Date', value: estimatedPayoff, dotColor: '#635bff' },
            ].map((stat, i) => (
              <div
                key={i}
                className="px-5 py-[18px]"
                style={{ borderRight: i < 3 ? '1px solid #e6e6e6' : 'none', backgroundColor: '#f4f5f7' }}
              >
                <div className="flex items-center gap-1.5 mb-1.5" style={{ fontSize: 12, fontWeight: 450, color: '#8898aa' }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: stat.dotColor }} />
                  {stat.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#0a2540', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#999]" style={{ fontWeight: 500 }}>Repayment Progress</span>
              <span className="text-xs text-[#635bff]" style={{ fontWeight: 700 }}>{paidPercent.toFixed(1)}% paid</span>
            </div>
            <div className="h-3 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${paidPercent}%`, backgroundColor: '#635bff' }} />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-[#999]">${(loanTotal - loanBalance).toLocaleString()} repaid</span>
              <span className="text-[10px] text-[#999]">${loanBalance.toLocaleString()} remaining</span>
            </div>
          </div>
        </div>

        {/* Repayment History */}
        <div className="border border-[#E8E8E8] rounded-xl mb-8">
          <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
            <h3 className="text-base text-[#111]" style={{ fontWeight: 700 }}>Recent Repayments</h3>
            <button onClick={() => setShowAllRepayments(p => !p)} className="text-xs text-[#4945FF] hover:underline" style={{ fontWeight: 500 }}>{showAllRepayments ? 'Show less' : 'View all'}</button>
          </div>
          {[
            { date: 'Mar 4', amount: '$203.00', method: 'Auto-deducted from sales', status: 'completed' },
            { date: 'Mar 3', amount: '$203.00', method: 'Auto-deducted from sales', status: 'completed' },
            { date: 'Mar 2', amount: '$203.00', method: 'Auto-deducted from sales', status: 'completed' },
            { date: 'Mar 1', amount: '$203.00', method: 'Auto-deducted from sales', status: 'completed' },
            { date: 'Feb 28', amount: '$203.00', method: 'Auto-deducted from sales', status: 'completed' },
            { date: 'Feb 27', amount: '$203.00', method: 'Auto-deducted from sales', status: 'completed' },
            { date: 'Feb 26', amount: '$203.00', method: 'Auto-deducted from sales', status: 'completed' },
            { date: 'Feb 25', amount: '$203.00', method: 'Auto-deducted from sales', status: 'completed' },
            { date: 'Feb 24', amount: '$203.00', method: 'Auto-deducted from sales', status: 'completed' },
            { date: 'Feb 23', amount: '$203.00', method: 'Auto-deducted from sales', status: 'completed' },
          ].slice(0, showAllRepayments ? 10 : 5).map((r, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-3.5 border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                </div>
                <div>
                  <span className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{r.date}</span>
                  <div className="text-[10px] text-[#999]">{r.method}</div>
                </div>
              </div>
              <span className="text-sm text-[#111]" style={{ fontWeight: 600 }}>{r.amount}</span>
            </div>
          ))}
        </div>

        {/* Eligibility Card */}
        <div className="border border-[#4945FF]/15 rounded-2xl p-8 bg-[#4945FF]/[0.02]">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-[#4945FF]/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#4945FF]" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base text-[#111] mb-1" style={{ fontWeight: 700 }}>Eligibility for Additional Capital</h3>
              <p className="text-sm text-[#666] mb-4">Based on your current revenue and repayment track record</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-[#E8E8E8]">
                  <span className="text-xs text-[#999] block mb-1" style={{ fontWeight: 500 }}>Readiness Score</span>
                  <span className="text-xl text-[#4945FF]" style={{ fontWeight: 800 }}>87/100</span>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#E8E8E8]">
                  <span className="text-xs text-[#999] block mb-1" style={{ fontWeight: 500 }}>Max. Available</span>
                  <span className="text-xl text-[#111]" style={{ fontWeight: 700 }}>$62,000</span>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#E8E8E8]">
                  <span className="text-xs text-[#999] block mb-1" style={{ fontWeight: 500 }}>Eligible After</span>
                  <span className="text-xl text-[#111]" style={{ fontWeight: 700 }}>50% paid</span>
                  <div className="text-[10px] text-[#10B981] mt-0.5" style={{ fontWeight: 600 }}>Threshold met</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => addToast('info', 'Capital offers', 'You qualify for up to $62,000. Offer details sent to email.')} className="px-5 py-2.5 rounded-xl bg-[#4945FF] text-white text-sm hover:bg-[#3933CC] transition-colors" style={{ fontWeight: 600 }}>
                  Explore Offers
                </button>
                <button onClick={() => addToast('success', 'Advisor contacted', 'A capital advisor will reach out within 1 business day')} className="px-5 py-2.5 rounded-full border border-[#E8E8E8] text-sm text-[#333] hover:bg-[#F5F5F5] transition-colors" style={{ fontWeight: 500 }}>
                  Talk to Advisor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {applyModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setApplyModalOpen(false)}>
          <div className="bg-white rounded-2xl p-8 w-[420px] max-w-[90vw]" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#4945FF]/10 flex items-center justify-center mx-auto mb-3">
                <Landmark className="w-6 h-6 text-[#4945FF]" />
              </div>
              <h2 className="text-lg text-[#111]" style={{ fontWeight: 700 }}>Apply for Capital</h2>
              <p className="text-sm text-[#999] mt-1">Pre-approved for up to $62,000</p>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-[#999] block mb-1.5" style={{ fontWeight: 500 }}>Requested Amount</label>
                <input className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl text-lg text-[#111] outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF]" placeholder="$0.00" style={{ fontWeight: 700 }} />
              </div>
              <div>
                <label className="text-xs text-[#999] block mb-1.5" style={{ fontWeight: 500 }}>Purpose</label>
                <select className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#333] outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF]">
                  <option>Equipment purchase</option>
                  <option>Inventory expansion</option>
                  <option>Hiring & staffing</option>
                  <option>Marketing & advertising</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <button onClick={() => { setApplyModalOpen(false); addToast('success', 'Application submitted', 'We\'ll review your request within 24 hours'); }} className="w-full py-3 rounded-xl bg-[#4945FF] text-white text-sm hover:bg-[#3933CC] transition-colors" style={{ fontWeight: 600 }}>
              Submit Application
            </button>
            <button onClick={() => setApplyModalOpen(false)} className="w-full py-2 mt-2 text-sm text-[#999] hover:text-[#333] transition-colors">Cancel</button>
          </div>
        </div>
      )}
      {savingsToolMode === 'calculator' && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setSavingsToolMode(null)}>
          <div className="bg-white rounded-2xl p-6 w-[420px] max-w-[90vw]" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
            <button 
              onClick={() => setSavingsToolMode(null)}
              className="flex items-center gap-1.5 text-xs text-[#666] hover:text-[#111] mb-4 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Close
            </button>
            <div className="text-center mb-5">
              <h2 className="text-xl text-[#111] mb-2" style={{ fontWeight: 700 }}>Your current payment fees</h2>
            </div>
            <div className="space-y-3.5 mb-5">
              <div>
                <label className="text-xs text-[#666] block mb-1.5" style={{ fontWeight: 600 }}>Processing rate (%)</label>
                <div className="relative">
                  <input 
                    className="w-full px-3.5 py-2.5 border border-[#CFCFCF] rounded-lg text-sm text-[#111] outline-none focus:ring-2 focus:ring-[#4945FF]/40 focus:border-[#4945FF] transition-all" 
                    placeholder="2.9" 
                    value={processingRate}
                    onChange={e => setProcessingRate(e.target.value)}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#666]">%</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#666] block mb-1.5" style={{ fontWeight: 600 }}>Per-transaction fee ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#666]">$</span>
                  <input 
                    className="w-full pl-7 pr-3.5 py-2.5 border border-[#CFCFCF] rounded-lg text-sm text-[#111] outline-none focus:ring-2 focus:ring-[#4945FF]/40 focus:border-[#4945FF] transition-all" 
                    placeholder="0.30" 
                    value={perTransactionFee}
                    onChange={e => setPerTransactionFee(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#666] block mb-1.5" style={{ fontWeight: 600 }}>Monthly processing volume ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#666]">$</span>
                  <input 
                    className="w-full pl-7 pr-3.5 py-2.5 border border-[#CFCFCF] rounded-lg text-sm text-[#111] outline-none focus:ring-2 focus:ring-[#4945FF]/40 focus:border-[#4945FF] transition-all" 
                    placeholder="50,000" 
                    value={monthlyVolume}
                    onChange={e => setMonthlyVolume(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#666] block mb-1.5" style={{ fontWeight: 600 }}>Average transaction size ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#666]">$</span>
                  <input 
                    className="w-full pl-7 pr-3.5 py-2.5 border border-[#CFCFCF] rounded-lg text-sm text-[#111] outline-none focus:ring-2 focus:ring-[#4945FF]/40 focus:border-[#4945FF] transition-all" 
                    placeholder="50" 
                    value={avgTransactionSize}
                    onChange={e => setAvgTransactionSize(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                addToast('success', 'Savings calculated', `You could save $${savingsData.savings.toFixed(2)}/month with Delt`);
                setSavingsToolMode(null);
              }}
              className="w-full py-3 rounded-lg bg-[#4945FF] text-white text-sm hover:bg-[#3933CC] transition-colors mb-3" 
              style={{ fontWeight: 600 }}
            >
              Calculate my savings
            </button>
            {savingsData.savings > 0 && (
              <div className="bg-[#F5F5F5] rounded-lg p-3.5 mb-3">
                <div className="text-[10px] text-[#4945FF] mb-1" style={{ fontWeight: 700, letterSpacing: '0.5px' }}>DELT RATES</div>
                <div className="text-2xl text-[#111] mb-1" style={{ fontWeight: 700 }}>{savingsData.deltRate}% + ${savingsData.deltFee.toFixed(2)}</div>
                <div className="text-xs text-[#666]">Per transaction • No hidden fees</div>
              </div>
            )}
            <div className="flex items-center gap-2 justify-center text-xs text-[#666]">
              <Shield className="w-3.5 h-3.5" />
              <span>Your information is secure and will only be used to calculate your savings</span>
            </div>
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}