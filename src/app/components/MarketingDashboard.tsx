import { Download, TrendingUp, TrendingDown, DollarSign, Users, Target, Mail, MousePointerClick, Share2, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';

export function MarketingDashboard() {
  // Mock data for marketing metrics
  const campaignPerformanceData = [
    { month: 'Jan', adSpend: 12400, revenue: 54200, leads: 342, conversions: 128 },
    { month: 'Feb', adSpend: 14800, revenue: 68900, leads: 423, conversions: 165 },
    { month: 'Mar', adSpend: 13200, revenue: 61500, leads: 389, conversions: 152 },
    { month: 'Apr', adSpend: 15600, revenue: 78400, leads: 467, conversions: 198 },
    { month: 'May', adSpend: 17200, revenue: 89300, leads: 512, conversions: 224 },
    { month: 'Jun', adSpend: 18500, revenue: 96800, leads: 548, conversions: 247 },
  ];

  const channelPerformance = [
    { name: 'Paid Social', spend: 28400, conversions: 342, roas: 4.8 },
    { name: 'Google Ads', spend: 24200, conversions: 298, roas: 5.2 },
    { name: 'Email Marketing', spend: 8900, conversions: 187, roas: 8.4 },
    { name: 'Content Marketing', spend: 12600, conversions: 156, roas: 3.9 },
    { name: 'Influencer', spend: 15200, conversions: 124, roas: 3.2 },
  ];

  const channelBreakdown = [
    { name: 'Paid Social', value: 31.8, amount: 28400 },
    { name: 'Google Ads', value: 27.1, amount: 24200 },
    { name: 'Influencer', value: 17.0, amount: 15200 },
    { name: 'Content', value: 14.1, amount: 12600 },
    { name: 'Email', value: 10.0, amount: 8900 },
  ];

  const leadFunnelData = [
    { name: 'Impressions', value: 485000, fill: '#4945FF' },
    { name: 'Clicks', value: 24250, fill: '#6B68FF' },
    { name: 'Leads', value: 2181, fill: '#8E8CFF' },
    { name: 'MQLs', value: 872, fill: '#041E42' },
    { name: 'Customers', value: 247, fill: '#0A2E5C' },
  ];

  const conversionRateData = [
    { stage: 'Click Rate', rate: 5.0 },
    { stage: 'Lead Conv.', rate: 9.0 },
    { stage: 'MQL Rate', rate: 40.0 },
    { stage: 'Close Rate', rate: 28.3 },
  ];

  const recentCampaigns = [
    { 
      name: 'Summer Promo 2026', 
      channel: 'Paid Social', 
      budget: 8500, 
      spent: 7840, 
      leads: 234, 
      conversions: 67, 
      roas: 5.2,
      status: 'active' 
    },
    { 
      name: 'Google Search - Coffee', 
      channel: 'Google Ads', 
      budget: 6200, 
      spent: 6200, 
      leads: 189, 
      conversions: 58, 
      roas: 5.8,
      status: 'active' 
    },
    { 
      name: 'Email - Newsletter June', 
      channel: 'Email', 
      budget: 1200, 
      spent: 1150, 
      leads: 142, 
      conversions: 48, 
      roas: 9.2,
      status: 'completed' 
    },
    { 
      name: 'Instagram Stories', 
      channel: 'Paid Social', 
      budget: 4800, 
      spent: 4320, 
      leads: 167, 
      conversions: 42, 
      roas: 4.6,
      status: 'active' 
    },
    { 
      name: 'Influencer Partnership', 
      channel: 'Influencer', 
      budget: 7500, 
      spent: 7500, 
      leads: 98, 
      conversions: 31, 
      roas: 3.4,
      status: 'completed' 
    },
  ];

  const COLORS = ['#4945FF', '#041E42', '#6B68FF', '#0A2E5C', '#3933CC'];

  // Calculate key metrics
  const totalAdSpend = 89300;
  const totalRevenue = 449100;
  const totalCustomers = 1114;
  const avgCustomerValue = 403.14;
  const roas = (totalRevenue / totalAdSpend).toFixed(2);
  const roi = (((totalRevenue - totalAdSpend) / totalAdSpend) * 100).toFixed(1);
  const cac = (totalAdSpend / totalCustomers).toFixed(2);
  const ltv = (avgCustomerValue * 3.2).toFixed(2); // Assuming 3.2x multiplier for LTV

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#041E42] mb-2">Marketing Hub</h1>
          <p className="text-[#041E42]/50">Campaign performance, ROI analysis, and customer acquisition metrics</p>
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

      {/* Key Marketing Metrics Row */}
      <div className="grid grid-cols-5 gap-6">
        {/* ROAS */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4945FF] to-[#3933CC] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#10B981] flex items-center gap-1 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              18.2%
            </div>
          </div>
          <div className="text-sm font-medium text-[#041E42]/50 mb-1">ROAS</div>
          <div className="text-3xl font-bold text-[#041E42]">{roas}x</div>
          <div className="text-xs text-[#041E42]/40 mt-2">Return on Ad Spend</div>
        </div>

        {/* ROI */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#041E42] to-[#0A2E5C] rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#10B981] flex items-center gap-1 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              15.4%
            </div>
          </div>
          <div className="text-sm font-medium text-[#041E42]/50 mb-1">ROI</div>
          <div className="text-3xl font-bold text-[#041E42]">{roi}%</div>
          <div className="text-xs text-[#041E42]/40 mt-2">Return on Investment</div>
        </div>

        {/* CAC */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6B68FF] to-[#4945FF] rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#10B981] flex items-center gap-1 text-sm font-semibold">
              <TrendingDown className="w-4 h-4" />
              8.7%
            </div>
          </div>
          <div className="text-sm font-medium text-[#041E42]/50 mb-1">CAC</div>
          <div className="text-3xl font-bold text-[#041E42]">${cac}</div>
          <div className="text-xs text-[#041E42]/40 mt-2">Customer Acq. Cost</div>
        </div>

        {/* LTV */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0A2E5C] to-[#041E42] rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#10B981] flex items-center gap-1 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              12.3%
            </div>
          </div>
          <div className="text-sm font-medium text-[#041E42]/50 mb-1">LTV</div>
          <div className="text-3xl font-bold text-[#041E42]">${ltv}</div>
          <div className="text-xs text-[#041E42]/40 mt-2">Customer Lifetime Value</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3933CC] to-[#4945FF] rounded-xl flex items-center justify-center">
              <MousePointerClick className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#10B981] flex items-center gap-1 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              5.8%
            </div>
          </div>
          <div className="text-sm font-medium text-[#041E42]/50 mb-1">Conversion Rate</div>
          <div className="text-3xl font-bold text-[#041E42]">11.3%</div>
          <div className="text-xs text-[#041E42]/40 mt-2">Lead to Customer</div>
        </div>
      </div>

      {/* Charts Row 1: Ad Spend vs Revenue & Channel Performance */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ad Spend vs Revenue - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#041E42]/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#041E42]">Marketing Spend vs Revenue</h2>
              <p className="text-sm text-[#041E42]/50 mt-1">Campaign ROI performance over time</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[#041E42]/40" />
              <span className="text-[#041E42]/50">Last 6 months</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={campaignPerformanceData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
              <Area 
                key="revenue-area"
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue ($)"
              />
              <Area 
                key="adspend-area"
                type="monotone" 
                dataKey="adSpend" 
                stroke="#EF4444" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSpend)"
                name="Ad Spend ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Spend Breakdown - Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#041E42]">Spend by Channel</h2>
            <p className="text-sm text-[#041E42]/50 mt-1">Budget allocation</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={channelBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {channelBreakdown.map((entry, index) => (
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
            {channelBreakdown.map((channel, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-[#041E42] font-medium">{channel.name}</span>
                </div>
                <span className="text-[#041E42]/50 font-semibold">{channel.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Channel Performance & Lead Funnel */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Channel Performance by ROAS */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#041E42]">Channel Performance (ROAS)</h2>
              <p className="text-sm text-[#041E42]/50 mt-1">Return on ad spend by channel</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#041E4215" />
              <XAxis type="number" stroke="#041E4260" style={{ fontSize: '12px' }} />
              <YAxis type="category" dataKey="name" stroke="#041E4260" style={{ fontSize: '12px' }} width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #041E4220', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="roas" fill="#4945FF" radius={[0, 8, 8, 0]} name="ROAS" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Funnel */}
        <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#041E42]">Marketing Funnel</h2>
              <p className="text-sm text-[#041E42]/50 mt-1">Lead conversion journey</p>
            </div>
          </div>
          <div className="space-y-4">
            {leadFunnelData.map((stage, index) => {
              const prevValue = index > 0 ? leadFunnelData[index - 1].value : stage.value;
              const conversionRate = ((stage.value / prevValue) * 100).toFixed(1);
              const width = ((stage.value / leadFunnelData[0].value) * 100).toFixed(1);
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#041E42]">{stage.name}</span>
                    <div className="flex items-center gap-3">
                      {index > 0 && (
                        <span className="text-xs text-[#041E42]/50 font-medium">{conversionRate}% conv.</span>
                      )}
                      <span className="text-sm font-bold text-[#041E42]">{stage.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#041E42]/5 rounded-lg h-10 relative overflow-hidden">
                    <div 
                      className="h-full rounded-lg flex items-center justify-start px-4 transition-all duration-500"
                      style={{ 
                        width: `${width}%`,
                        backgroundColor: stage.fill
                      }}
                    >
                      <span className="text-white text-xs font-bold">{width}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-6 border-t border-[#041E42]/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#041E42]/50">Overall Conversion Rate</span>
              <span className="text-2xl font-bold text-[#10B981]">
                {((leadFunnelData[4].value / leadFunnelData[0].value) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-white rounded-2xl p-6 border border-[#041E42]/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#041E42]">Active Campaigns</h2>
            <p className="text-sm text-[#041E42]/50 mt-1">Current marketing initiatives</p>
          </div>
          <button className="text-[#4945ff] text-sm font-medium hover:text-[#3933CC]">
            View All Campaigns →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#041E42]/3 border-y border-[#041E42]/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Campaign Name</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Channel</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Budget</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Spent</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Leads</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Conversions</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">ROAS</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-[#041E42]/50 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#041E42]/10">
              {recentCampaigns.map((campaign, index) => (
                <tr key={index} className="hover:bg-[#041E42]/3 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-[#041E42]">{campaign.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {campaign.channel === 'Email' && <Mail className="w-4 h-4 text-[#041E42]/40" />}
                      {campaign.channel === 'Paid Social' && <Share2 className="w-4 h-4 text-[#041E42]/40" />}
                      {campaign.channel === 'Google Ads' && <Target className="w-4 h-4 text-[#041E42]/40" />}
                      {campaign.channel === 'Influencer' && <Users className="w-4 h-4 text-[#041E42]/40" />}
                      <span className="text-sm text-[#041E42]/50">{campaign.channel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-[#041E42]/50">${campaign.budget.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-[#041E42]">${campaign.spent.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-[#041E42]/50">{campaign.leads}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-[#041E42]">{campaign.conversions}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-bold ${
                      campaign.roas >= 5 ? 'text-[#10B981]' : campaign.roas >= 3 ? 'text-[#041E42]/70' : 'text-[#EF4444]'
                    }`}>
                      {campaign.roas.toFixed(1)}x
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        campaign.status === 'active' 
                          ? 'bg-[#D1FAE5] text-[#059669]' 
                          : 'bg-[#041E42]/5 text-[#041E42]/50'
                      }`}>
                        {campaign.status === 'active' ? 'Active' : 'Completed'}
                      </span>
                    </div>
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