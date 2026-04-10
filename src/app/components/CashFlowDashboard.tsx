import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Building2, Clock, DollarSign, Filter, ArrowLeftRight, CreditCard } from 'lucide-react';
import { useToast, ToastContainer } from './ui/Toast';

const PROCESSING = [
  { id: 'TXN-4821', date: 'Mar 3', type: 'Card Sale', amount: '$847.20', status: 'completed', method: 'Visa ••4242' },
  { id: 'TXN-4820', date: 'Mar 3', type: 'Card Sale', amount: '$1,234.00', status: 'completed', method: 'Amex ••1001' },
  { id: 'TXN-4819', date: 'Mar 3', type: 'Refund', amount: '-$45.00', status: 'completed', method: 'Visa ••8899' },
  { id: 'TXN-4818', date: 'Mar 2', type: 'Card Sale', amount: '$562.80', status: 'pending', method: 'MC ••3456' },
  { id: 'TXN-4817', date: 'Mar 2', type: 'Card Sale', amount: '$389.50', status: 'completed', method: 'Visa ••7722' },
  { id: 'TXN-4816', date: 'Mar 2', type: 'ACH Transfer', amount: '$2,100.00', status: 'pending', method: 'Bank ••9012' },
];

const DEPOSITS = [
  { date: 'Mar 4', amount: '$4,218.30', status: 'scheduled', bank: 'Chase ••4501', eta: 'Tomorrow' },
  { date: 'Mar 3', amount: '$3,891.00', status: 'in-transit', bank: 'Chase ••4501', eta: 'Today' },
  { date: 'Mar 1', amount: '$5,120.45', status: 'deposited', bank: 'Chase ••4501', eta: 'Completed' },
  { date: 'Feb 28', amount: '$4,672.80', status: 'deposited', bank: 'Chase ••4501', eta: 'Completed' },
  { date: 'Feb 27', amount: '$3,945.60', status: 'deposited', bank: 'Chase ••4501', eta: 'Completed' },
];

const FEES = [
  { label: 'Processing fees', amount: '$1,248.30', percent: '2.6%', period: 'This month' },
  { label: 'Platform fee', amount: '$99.00', percent: '—', period: 'Monthly' },
  { label: 'Chargeback fees', amount: '$25.00', percent: '—', period: 'This month' },
  { label: 'International fees', amount: '$34.80', percent: '1.0%', period: 'This month' },
];

export function CashFlowDashboard() {
  const [tab, setTab] = useState<'processing' | 'deposits' | 'transfers' | 'fees'>('processing');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  return (
    <div className="min-h-screen bg-white">
      {/* Header and Summary section with subtle gray background */}
      <div style={{ background: '#F7F7F8' }}>
        <div className="max-w-[1040px] mx-auto px-8 pt-8 pb-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[#111] mb-1" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cash Flow</h1>
            <p className="text-sm text-[#999]">Processing, deposits, bank transfers, and fees</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: DollarSign, label: 'Available Balance', value: '$12,384.23', sub: 'Ready to transfer' },
              { icon: Clock, label: 'Pending', value: '$4,218.30', sub: 'Next deposit: Tomorrow' },
              { icon: ArrowUpRight, label: 'This Week In', value: '$28,462.00', sub: '+8.4% vs last week' },
              { icon: ArrowDownLeft, label: 'This Week Out', value: '$3,124.60', sub: 'Fees + refunds' },
            ].map((card, i) => (
              <div key={i} className="border border-[#E8E8E8] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#4945FF]/8 flex items-center justify-center">
                    <card.icon className="w-4 h-4 text-[#4945FF]" />
                  </div>
                  <span className="text-xs text-[#999]" style={{ fontWeight: 500 }}>{card.label}</span>
                </div>
                <div className="text-2xl text-[#111]" style={{ fontWeight: 700 }}>{card.value}</div>
                <span className="text-[11px] text-[#999]">{card.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content on white background */}
      <div className="max-w-[1040px] mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-[#E8E8E8]">
          {([
            { id: 'processing' as const, label: 'Processing', icon: CreditCard },
            { id: 'deposits' as const, label: 'Deposits', icon: Building2 },
            { id: 'transfers' as const, label: 'Bank Transfers', icon: ArrowLeftRight },
            { id: 'fees' as const, label: 'Fees', icon: DollarSign },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${tab === t.id ? 'border-[#4945FF] text-[#111]' : 'border-transparent text-[#999] hover:text-[#666]'}`}
              style={{ fontWeight: tab === t.id ? 600 : 400 }}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Processing */}
        {tab === 'processing' && (
          <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[80px_80px_120px_120px_100px_90px] gap-2 px-6 py-3 bg-[#FAFAFA] border-b border-[#E8E8E8] text-[10px] text-[#999]" style={{ fontWeight: 600 }}>
              <span>ID</span><span>DATE</span><span>TYPE</span><span>METHOD</span><span className="text-right">AMOUNT</span><span className="text-right">STATUS</span>
            </div>
            {PROCESSING.map((txn, i) => (
              <div key={i} className="grid grid-cols-[80px_80px_120px_120px_100px_90px] gap-2 px-6 py-3.5 border-b border-[#F0F0F0] items-center hover:bg-[#FAFAFA] transition-colors cursor-pointer">
                <span className="text-xs text-[#999] font-mono">{txn.id}</span>
                <span className="text-xs text-[#666]">{txn.date}</span>
                <span className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{txn.type}</span>
                <span className="text-xs text-[#999]">{txn.method}</span>
                <span className={`text-sm text-right ${txn.amount.startsWith('-') ? 'text-[#EF4444]' : 'text-[#333]'}`} style={{ fontWeight: 600 }}>{txn.amount}</span>
                <div className="flex justify-end">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${txn.status === 'completed' ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#FEF3C7] text-[#F59E0B]'}`} style={{ fontWeight: 600 }}>
                    {txn.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Deposits */}
        {tab === 'deposits' && (
          <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[100px_1fr_120px_120px_100px] gap-2 px-6 py-3 bg-[#FAFAFA] border-b border-[#E8E8E8] text-[10px] text-[#999]" style={{ fontWeight: 600 }}>
              <span>DATE</span><span>BANK</span><span className="text-right">AMOUNT</span><span className="text-right">ETA</span><span className="text-right">STATUS</span>
            </div>
            {DEPOSITS.map((dep, i) => (
              <div key={i} className="grid grid-cols-[100px_1fr_120px_120px_100px] gap-2 px-6 py-3.5 border-b border-[#F0F0F0] items-center hover:bg-[#FAFAFA] transition-colors">
                <span className="text-xs text-[#666]">{dep.date}</span>
                <span className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{dep.bank}</span>
                <span className="text-sm text-right text-[#333]" style={{ fontWeight: 600 }}>{dep.amount}</span>
                <span className="text-xs text-right text-[#999]">{dep.eta}</span>
                <div className="flex justify-end">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${dep.status === 'deposited' ? 'bg-[#ECFDF5] text-[#10B981]' : dep.status === 'in-transit' ? 'bg-[#EFF6FF] text-[#4945FF]' : 'bg-[#F5F5F5] text-[#999]'}`} style={{ fontWeight: 600 }}>
                    {dep.status === 'deposited' ? 'Deposited' : dep.status === 'in-transit' ? 'In Transit' : 'Scheduled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bank Transfers */}
        {tab === 'transfers' && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#4945FF]/8 flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight className="w-7 h-7 text-[#4945FF]" />
            </div>
            <h3 className="text-base text-[#111] mb-2" style={{ fontWeight: 700 }}>Transfer Funds</h3>
            <p className="text-sm text-[#999] mb-6 max-w-sm mx-auto">Move money between your Delt balance and connected bank accounts</p>
            <div className="max-w-md mx-auto border border-[#E8E8E8] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#F0F0F0]">
                <div><span className="text-xs text-[#999]">From</span><div className="text-sm text-[#111]" style={{ fontWeight: 600 }}>Delt Balance</div></div>
                <ArrowUpRight className="w-4 h-4 text-[#999]" />
                <div className="text-right"><span className="text-xs text-[#999]">To</span><div className="text-sm text-[#111]" style={{ fontWeight: 600 }}>Chase ••4501</div></div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-[#999] block mb-1" style={{ fontWeight: 500 }}>Amount</label>
                <input
                  className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-lg text-[#111] outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF]"
                  placeholder="$0.00"
                  style={{ fontWeight: 700 }}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
              </div>
              <button
                className={`w-full py-3 rounded-xl text-white text-sm transition-colors ${transferring ? 'bg-[#4945FF]/60 cursor-wait' : !transferAmount ? 'bg-[#E8E8E8] text-[#999] cursor-not-allowed' : 'bg-[#4945FF] hover:bg-[#3730FF]'}`}
                style={{ fontWeight: 600 }}
                disabled={transferring || !transferAmount}
                onClick={() => {
                  if (!transferAmount) return;
                  setTransferring(true);
                  setTimeout(() => {
                    addToast('success', 'Transfer initiated', `$${transferAmount} sent to Chase ••4501`);
                    setTransferAmount('');
                    setTransferring(false);
                  }, 1500);
                }}
              >
                {transferring ? 'Transferring...' : 'Initiate Transfer'}
              </button>
            </div>
          </div>
        )}

        {/* Fees */}
        {tab === 'fees' && (
          <div className="space-y-4">
            <div className="border border-[#E8E8E8] rounded-xl p-6">
              <h3 className="text-base text-[#111] mb-4" style={{ fontWeight: 700 }}>Fee Summary — March 2026</h3>
              <div className="grid grid-cols-2 gap-4">
                {FEES.map((fee, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-4 rounded-lg bg-[#FAFAFA]">
                    <div>
                      <div className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{fee.label}</div>
                      <span className="text-[10px] text-[#999]">{fee.period} {fee.percent !== '—' && `· ${fee.percent} rate`}</span>
                    </div>
                    <span className="text-sm text-[#111]" style={{ fontWeight: 700 }}>{fee.amount}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E8E8E8]">
                <span className="text-sm text-[#111]" style={{ fontWeight: 700 }}>Total Fees</span>
                <span className="text-lg text-[#111]" style={{ fontWeight: 700 }}>$1,407.10</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}