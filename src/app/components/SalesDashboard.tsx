import { Download, TrendingUp, ShoppingCart, DollarSign, Package, Users, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function SalesDashboard() {
  // Mock data for charts
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 65400, transactions: 1247, avgOrder: 52.45 },
    { month: 'Feb', revenue: 72800, transactions: 1389, avgOrder: 52.41 },
    { month: 'Mar', revenue: 68200, transactions: 1302, avgOrder: 52.38 },
    { month: 'Apr', revenue: 81500, transactions: 1556, avgOrder: 52.38 },
    { month: 'May', revenue: 89300, transactions: 1704, avgOrder: 52.40 },
    { month: 'Jun', revenue: 94700, transactions: 1808, avgOrder: 52.38 },
  ];

  const salesByCategory = [
    { name: 'Coffee & Espresso', value: 42500, percentage: 48.6 },
    { name: 'Food & Pastries', value: 26300, percentage: 30.1 },
    { name: 'Merchandise', value: 12400, percentage: 14.2 },
    { name: 'Seasonal Items', value: 6200, percentage: 7.1 },
  ];

  const salesByHour = [
    { hour: '6 AM', sales: 850 },
    { hour: '7 AM', sales: 2400 },
    { hour: '8 AM', sales: 4200 },
    { hour: '9 AM', sales: 3800 },
    { hour: '10 AM', sales: 2900 },
    { hour: '11 AM', sales: 3200 },
    { hour: '12 PM', sales: 5100 },
    { hour: '1 PM', sales: 4800 },
    { hour: '2 PM', sales: 3400 },
    { hour: '3 PM', sales: 2800 },
    { hour: '4 PM', sales: 3600 },
    { hour: '5 PM', sales: 4200 },
    { hour: '6 PM', sales: 2100 },
  ];

  const topProducts = [
    { name: 'Caramel Macchiato', units: 456, revenue: 2736, growth: 12.4 },
    { name: 'Avocado Toast', units: 389, revenue: 3501, growth: 8.7 },
    { name: 'Cold Brew', units: 367, revenue: 1835, growth: 15.2 },
    { name: 'Croissant', units: 334, revenue: 1336, growth: 5.3 },
    { name: 'Vanilla Latte', units: 312, revenue: 1872, growth: -2.1 },
    { name: 'Blueberry Muffin', units: 289, revenue: 1156, growth: 6.8 },
    { name: 'Cappuccino', units: 278, revenue: 1390, growth: 4.2 },
    { name: 'Breakfast Burrito', units: 245, revenue: 2205, growth: 18.9 },
  ];

  const recentSales = [
    { id: 'SALE-9823', time: 'Feb 9, 11:47 AM', items: 'Caramel Macchiato (2), Croissant', location: 'Downtown', customer: 'Sarah M.', amount: 23.50, method: 'Visa' },
    { id: 'SALE-9822', time: 'Feb 9, 11:43 AM', items: 'Cold Brew, Avocado Toast', location: 'Capitol Hill', customer: 'James K.', amount: 18.00, method: 'Apple Pay' },
    { id: 'SALE-9821', time: 'Feb 9, 11:38 AM', items: 'Vanilla Latte (3)', location: 'Downtown', customer: 'Emily R.', amount: 18.00, method: 'Google Pay' },
    { id: 'SALE-9820', time: 'Feb 9, 11:32 AM', items: 'Breakfast Burrito, OJ', location: 'Fremont', customer: 'Michael T.', amount: 13.50, method: 'Mastercard' },
    { id: 'SALE-9819', time: 'Feb 9, 11:28 AM', items: 'Cappuccino, Blueberry Muffin', location: 'Downtown', customer: 'Jessica P.', amount: 11.00, method: 'Visa' },
    { id: 'SALE-9818', time: 'Feb 9, 11:21 AM', items: 'Cold Brew (2), Croissant (2)', location: 'Capitol Hill', customer: 'David L.', amount: 24.00, method: 'Amex' },
  ];

  const COLORS = ['#4945FF', '#041E42', '#6B68FF', '#0A2E5C'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#041E42] mb-2">Sales Dashboard</h1>
          <p className="text-[#041E42]/50">Detailed sales analytics and product performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#041E42]/10 text-[#041E42] rounded-lg hover:bg-[#041E42]/5 transition-colors font-medium">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#4945ff] text-white rounded-lg hover:bg-[#3933CC] transition-colors font-medium">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4945FF] to-[#3933CC] rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#10B981] flex items-center gap-1 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              12.5%
            </div>
          </div>
          <div className="text-sm font-medium text-[#041E42]/50 mb-1">Total Revenue</div>
          <div className="text-3xl font-bold text-[#041E42]">$87,432</div>
          <div className="text-xs text-[#041E42]/40 mt-2">Last 30 days</div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#041E42] to-[#0A2E5C] rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#10B981] flex items-center gap-1 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              8.3%
            </div>
          </div>
          <div className="text-sm font-medium text-[#041E42]/50 mb-1">Total Orders</div>
          <div className="text-3xl font-bold text-[#041E42]">1,424</div>
          <div className="text-xs text-[#041E42]/40 mt-2">Last 30 days</div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6B68FF] to-[#4945FF] rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#10B981] flex items-center gap-1 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              3.2%
            </div>
          </div>
          <div className="text-sm font-medium text-[#041E42]/50 mb-1">Avg Order Value</div>
          <div className="text-3xl font-bold text-[#041E42]">$61.40</div>
          <div className="text-xs text-[#041E42]/40 mt-2">Last 30 days</div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0A2E5C] to-[#041E42] rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#10B981] flex items-center gap-1 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              15.8%
            </div>
          </div>
          <div className="text-sm font-medium text-[#041E42]/50 mb-1">Unique Customers</div>
          <div className="text-3xl font-bold text-[#041E42]">892</div>
          <div className="text-xs text-[#041E42]/40 mt-2">Last 30 days</div>
        </div>
      </div>

      {/* Charts Row 1: Revenue Trends & Sales by Category */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#041E42]/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#041E42]">Revenue Trend</h2>
              <p className="text-sm text-[#041E42]/50 mt-1">Monthly performance overview</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[#041E42]/40" />
              <span className="text-[#041E42]/50">Last 6 months</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#041E4215" />
              <XAxis dataKey="month" stroke="#041E4260" style={{ fontSize: '12px' }} />
              <YAxis stroke="#041E4260" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #041E4220', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend />
              <Line 
                key="revenue-line"
                type="monotone" 
                dataKey="revenue" 
                stroke="#4945FF" 
                strokeWidth={3}
                name="Revenue ($)"
                dot={{ fill: '#4945FF', r: 4 }}
              />
              <Line 
                key="transactions-line"
                type="monotone" 
                dataKey="transactions" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Transactions"
                dot={{ fill: '#10B981', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category - Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#041E42]">Sales by Category</h2>
            <p className="text-sm text-[#041E42]/50 mt-1">Product breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={salesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {salesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #041E4220', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {salesByCategory.map((category, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-[#041E42] font-medium">{category.name}</span>
                </div>
                <span className="text-[#041E42]/50 font-semibold">{category.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Sales by Hour */}
      <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#041E42]">Sales by Hour</h2>
            <p className="text-sm text-[#041E42]/50 mt-1">Peak business hours analysis</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesByHour}>
            <CartesianGrid strokeDasharray="3 3" stroke="#041E4215" />
            <XAxis dataKey="hour" stroke="#041E4260" style={{ fontSize: '12px' }} />
            <YAxis stroke="#041E4260" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #041E4220', 
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="sales" fill="#4945FF" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#041E42]">Top Performing Products</h2>
            <p className="text-sm text-[#041E42]/50 mt-1">Best sellers this month</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#041E42]/3 border-y border-[#041E42]/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Rank</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Product Name</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Units Sold</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Revenue</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#041E42]/10">
              {topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-[#041E42]/3 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4945FF]/10 text-[#4945FF] font-bold text-sm">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-[#041E42]">{product.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-[#041E42]/50">{product.units}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-[#041E42]">${product.revenue.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`flex items-center gap-1 text-sm font-semibold ${
                        product.growth >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                      }`}>
                        <TrendingUp className={`w-4 h-4 ${product.growth < 0 ? 'rotate-180' : ''}`} />
                        {Math.abs(product.growth)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#041E42]">Recent Sales</h2>
            <p className="text-sm text-[#041E42]/50 mt-1">Latest transactions</p>
          </div>
          <button className="text-[#4945ff] text-sm font-medium hover:text-[#3933CC]">
            View All Sales →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#041E42]/3 border-y border-[#041E42]/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Sale ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Date & Time</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Items</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Location</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Payment</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#041E42]/10">
              {recentSales.map((sale, index) => (
                <tr key={index} className="hover:bg-[#041E42]/3 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-[#4945ff] font-medium">{sale.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#041E42]/50">{sale.time}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#041E42] font-medium">{sale.items}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#041E42]/50">{sale.customer}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#041E42]/50">{sale.location}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#041E42]/50">{sale.method}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-[#041E42]">${sale.amount.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}