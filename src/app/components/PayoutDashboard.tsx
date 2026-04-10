import { Download, Calendar, DollarSign, Clock, CheckCircle, TrendingUp, Filter, Search } from 'lucide-react';

export function PayoutDashboard() {
  // Mock payout data
  const payouts = [
    {
      id: 'PO-2026-0156',
      date: '2026-02-07',
      amount: 12450.00,
      fee: 186.75,
      net: 12263.25,
      status: 'completed',
      method: 'Bank Transfer',
      account: '****4892',
      transactions: 156
    },
    {
      id: 'PO-2026-0155',
      date: '2026-02-05',
      amount: 8920.50,
      fee: 133.81,
      net: 8786.69,
      status: 'completed',
      method: 'Bank Transfer',
      account: '****4892',
      transactions: 124
    },
    {
      id: 'PO-2026-0154',
      date: '2026-02-03',
      amount: 15780.00,
      fee: 236.70,
      net: 15543.30,
      status: 'completed',
      method: 'Bank Transfer',
      account: '****4892',
      transactions: 198
    },
    {
      id: 'PO-2026-0153',
      date: '2026-01-31',
      amount: 11250.75,
      fee: 168.76,
      net: 11081.99,
      status: 'completed',
      method: 'Bank Transfer',
      account: '****4892',
      transactions: 142
    },
    {
      id: 'PO-2026-0152',
      date: '2026-01-29',
      amount: 9640.25,
      fee: 144.60,
      net: 9495.65,
      status: 'completed',
      method: 'Bank Transfer',
      account: '****4892',
      transactions: 118
    },
    {
      id: 'PO-2026-0151',
      date: '2026-01-27',
      amount: 13890.00,
      fee: 208.35,
      net: 13681.65,
      status: 'completed',
      method: 'Bank Transfer',
      account: '****4892',
      transactions: 167
    },
    {
      id: 'PO-2026-0150',
      date: '2026-01-24',
      amount: 10125.50,
      fee: 151.88,
      net: 9973.62,
      status: 'completed',
      method: 'Bank Transfer',
      account: '****4892',
      transactions: 135
    },
    {
      id: 'PO-2026-0149',
      date: '2026-01-22',
      amount: 7890.00,
      fee: 118.35,
      net: 7771.65,
      status: 'completed',
      method: 'Bank Transfer',
      account: '****4892',
      transactions: 98
    },
    {
      id: 'PO-2026-0148',
      date: '2026-01-20',
      amount: 14560.75,
      fee: 218.41,
      net: 14342.34,
      status: 'completed',
      method: 'Bank Transfer',
      account: '****4892',
      transactions: 189
    },
    {
      id: 'PO-2026-0147',
      date: '2026-01-17',
      amount: 6780.50,
      fee: 101.71,
      net: 6678.79,
      status: 'completed',
      method: 'Bank Transfer',
      account: '****4892',
      transactions: 87
    },
  ];

  // Calculate summary metrics
  const totalPayouts = payouts.reduce((sum, p) => sum + p.net, 0);
  const totalFees = payouts.reduce((sum, p) => sum + p.fee, 0);
  const pendingAmount = 4250.80;
  const nextPayoutDate = 'Feb 10, 2026';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#041E42] mb-2">Payouts</h1>
          <p className="text-[#041E42]/50">All deposits and transfers to your bank account</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#041E42]/10 text-[#041E42] rounded-lg hover:bg-[#041E42]/5 transition-colors font-medium">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#4945ff] text-white rounded-lg hover:bg-[#3730ff] transition-colors font-medium">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        {/* Total Payouts */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4945FF] to-[#3730FF] rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm font-medium text-[#041E42]/50 mb-1">Total Payouts</div>
          <div className="text-3xl font-bold text-[#041E42]">${totalPayouts.toLocaleString('en-US', { minimumFractionScale: 2, maximumFractionScale: 2 })}</div>
          <div className="text-xs text-[#041E42]/40 mt-2">Last 30 days</div>
        </div>

        {/* Pending Payout */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#041E42] to-[#0A2E5C] rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm font-medium text-[#041E42]/50 mb-1">Pending</div>
          <div className="text-3xl font-bold text-[#041E42]">${pendingAmount.toLocaleString('en-US', { minimumFractionScale: 2, maximumFractionScale: 2 })}</div>
          <div className="text-xs text-[#041E42]/40 mt-2">In transit</div>
        </div>

        {/* Next Payout */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6B68FF] to-[#4945FF] rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm font-medium text-[#041E42]/50 mb-1">Next Payout</div>
          <div className="text-2xl font-bold text-[#041E42]">{nextPayoutDate}</div>
          <div className="text-xs text-[#041E42]/40 mt-2">Estimated</div>
        </div>

        {/* Total Fees */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0A2E5C] to-[#041E42] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm font-medium text-[#041E42]/50 mb-1">Processing Fees</div>
          <div className="text-3xl font-bold text-[#041E42]">${totalFees.toLocaleString('en-US', { minimumFractionScale: 2, maximumFractionScale: 2 })}</div>
          <div className="text-xs text-[#041E42]/40 mt-2">Last 30 days</div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#041E42]">Payout History</h2>
            <p className="text-sm text-[#041E42]/50 mt-1">Itemized list of all deposits to your account</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#041E42]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search payouts..."
                className="pl-10 pr-4 py-2 border border-[#041E42]/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4945ff] focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#041E42]/3 border-y border-[#041E42]/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Payout ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Gross Amount</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Fees</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Net Amount</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Transactions</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Method</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#041E42]/10">
              {payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-[#041E42]/3 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-[#4945ff]">{payout.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#041E42]/40" />
                      <span className="text-sm text-[#041E42]">
                        {new Date(payout.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-[#041E42]/50">
                      ${payout.amount.toLocaleString('en-US', { minimumFractionScale: 2, maximumFractionScale: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-[#EF4444]">
                      -${payout.fee.toLocaleString('en-US', { minimumFractionScale: 2, maximumFractionScale: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-[#041E42]">
                      ${payout.net.toLocaleString('en-US', { minimumFractionScale: 2, maximumFractionScale: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-[#041E42]/50">{payout.transactions}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-[#041E42]">{payout.method}</div>
                      <div className="text-xs text-[#041E42]/40">{payout.account}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-[#D1FAE5] text-[#059669]">
                        <CheckCircle className="w-3 h-3" />
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="mt-6 pt-6 border-t border-[#041E42]/10 flex items-center justify-between">
          <div className="text-sm text-[#041E42]/50">
            Showing <span className="font-semibold text-[#041E42]">10</span> of <span className="font-semibold text-[#041E42]">156</span> payouts
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-[#041E42]/10 text-[#041E42]/50 rounded-lg hover:bg-[#041E42]/5 transition-colors text-sm font-medium">
              Previous
            </button>
            <button className="px-4 py-2 bg-[#4945ff] text-white rounded-lg hover:bg-[#3730ff] transition-colors text-sm font-medium">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-[#4945FF]/5 border border-[#4945FF]/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#4945ff] rounded-lg flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[#041E42] mb-2">About Payouts</h3>
            <p className="text-sm text-[#041E42]/60 leading-relaxed">
              Payouts are automatically processed every 2 business days and deposited to your linked bank account. 
              Processing fees (1.5% + $0.30 per transaction) are deducted from the gross amount. 
              View individual transaction details by clicking on any payout ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}