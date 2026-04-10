import { useState, useMemo } from 'react';
import { Search, Filter, ChevronRight, ArrowUpDown, Mail, Phone, Star, UserPlus, Download, X } from 'lucide-react';
import { useToast, ToastContainer } from './ui/Toast';

/* ── Customer data ── */
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpend: number;
  visits: number;
  lastVisit: string;
  daysSince: number;
  tier: 'vip' | 'regular' | 'new' | 'at-risk';
  tags: string[];
  avgTicket: number;
}

const CUSTOMERS: Customer[] = [
  { id: 'C-001', name: 'Sarah Chen', email: 'sarah.c@gmail.com', phone: '(415) 555-0142', totalSpend: 4820, visits: 62, lastVisit: 'Mar 3, 2026', daysSince: 1, tier: 'vip', tags: ['Catering', 'Loyalty'], avgTicket: 77.74 },
  { id: 'C-002', name: 'Marcus Williams', email: 'marcus.w@outlook.com', phone: '(415) 555-0398', totalSpend: 3340, visits: 48, lastVisit: 'Mar 2, 2026', daysSince: 2, tier: 'vip', tags: ['Loyalty'], avgTicket: 69.58 },
  { id: 'C-003', name: 'Emily Rodriguez', email: 'emily.r@yahoo.com', phone: '(415) 555-0817', totalSpend: 2190, visits: 34, lastVisit: 'Feb 28, 2026', daysSince: 4, tier: 'regular', tags: ['Weekday Regular'], avgTicket: 64.41 },
  { id: 'C-004', name: 'James O\'Brien', email: 'james.ob@gmail.com', phone: '(415) 555-0263', totalSpend: 1870, visits: 28, lastVisit: 'Feb 25, 2026', daysSince: 7, tier: 'regular', tags: ['Lunch'], avgTicket: 66.79 },
  { id: 'C-005', name: 'Priya Patel', email: 'priya.p@icloud.com', phone: '(415) 555-0591', totalSpend: 1540, visits: 22, lastVisit: 'Mar 4, 2026', daysSince: 0, tier: 'regular', tags: ['Weekend'], avgTicket: 70.00 },
  { id: 'C-006', name: 'David Kim', email: 'david.k@proton.me', phone: '(415) 555-0734', totalSpend: 980, visits: 15, lastVisit: 'Jan 18, 2026', daysSince: 45, tier: 'at-risk', tags: ['Declining'], avgTicket: 65.33 },
  { id: 'C-007', name: 'Lisa Thompson', email: 'lisa.t@gmail.com', phone: '(415) 555-0456', totalSpend: 720, visits: 11, lastVisit: 'Feb 10, 2026', daysSince: 22, tier: 'at-risk', tags: ['Declining'], avgTicket: 65.45 },
  { id: 'C-008', name: 'Alex Nguyen', email: 'alex.n@gmail.com', phone: '(415) 555-0189', totalSpend: 340, visits: 4, lastVisit: 'Mar 1, 2026', daysSince: 3, tier: 'new', tags: ['New'], avgTicket: 85.00 },
  { id: 'C-009', name: 'Rachel Foster', email: 'rachel.f@outlook.com', phone: '(415) 555-0672', totalSpend: 210, visits: 3, lastVisit: 'Feb 27, 2026', daysSince: 5, tier: 'new', tags: ['New'], avgTicket: 70.00 },
  { id: 'C-010', name: 'Omar Hassan', email: 'omar.h@gmail.com', phone: '(415) 555-0945', totalSpend: 156, visits: 2, lastVisit: 'Mar 3, 2026', daysSince: 1, tier: 'new', tags: ['New', 'Catering Lead'], avgTicket: 78.00 },
];

const TIER_CONFIG = {
  vip: { label: 'VIP', bg: 'bg-[#4945FF]/8', text: 'text-[#4945FF]' },
  regular: { label: 'Regular', bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]' },
  'new': { label: 'New', bg: 'bg-[#EFF6FF]', text: 'text-[#3B82F6]' },
  'at-risk': { label: 'At Risk', bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]' },
};

type SortKey = 'name' | 'totalSpend' | 'lastVisit' | 'visits';

export function CustomersDashboard() {
  const [searchVal, setSearchVal] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('totalSpend');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const filtered = useMemo(() => {
    let list = CUSTOMERS.filter(c =>
      c.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      c.email.toLowerCase().includes(searchVal.toLowerCase())
    );
    if (tierFilter !== 'all') list = list.filter(c => c.tier === tierFilter);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'totalSpend') cmp = a.totalSpend - b.totalSpend;
      else if (sortKey === 'visits') cmp = a.visits - b.visits;
      else if (sortKey === 'lastVisit') cmp = a.daysSince - b.daysSince;
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [searchVal, tierFilter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(false); }
  };

  const totalCustomers = CUSTOMERS.length;
  const vipCount = CUSTOMERS.filter(c => c.tier === 'vip').length;
  const atRiskCount = CUSTOMERS.filter(c => c.tier === 'at-risk').length;
  const avgSpend = Math.round(CUSTOMERS.reduce((s, c) => s + c.totalSpend, 0) / totalCustomers);

  return (
    <div className="min-h-screen bg-white">
      {/* Header and KPI section with subtle gray background */}
      <div style={{ background: '#F7F7F8' }}>
        <div className="max-w-[1040px] mx-auto px-8 pt-8 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[#111] mb-1" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Customers</h1>
              <p className="text-sm text-[#999]">Contact info, spend history, and engagement tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => addToast('success', 'Exported', 'Customer data CSV downloaded')} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E8E8E8] text-sm text-[#333] hover:bg-[#F5F5F5] transition-colors" style={{ fontWeight: 500 }}>
                <Download className="w-4 h-4" /> Export
              </button>
              <button onClick={() => setAddCustomerOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4945FF] text-white text-sm hover:bg-[#3730FF] transition-colors" style={{ fontWeight: 600 }}>
                <UserPlus className="w-4 h-4" /> Add Customer
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Customers', value: totalCustomers.toString(), sub: '3 new this week' },
              { label: 'VIP Customers', value: vipCount.toString(), sub: `${((vipCount / totalCustomers) * 100).toFixed(0)}% of total` },
              { label: 'At-Risk', value: atRiskCount.toString(), sub: 'Declining frequency' },
              { label: 'Avg. Lifetime Spend', value: `$${avgSpend.toLocaleString()}`, sub: 'Per customer' },
            ].map((kpi, i) => (
              <div key={i} className="border border-[#E8E8E8] rounded-xl p-5">
                <span className="text-xs text-[#999] block mb-2" style={{ fontWeight: 500 }}>{kpi.label}</span>
                <div className="text-2xl text-[#111]" style={{ fontWeight: 700 }}>{kpi.value}</div>
                <span className="text-[11px] text-[#999]">{kpi.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content on white background */}
      <div className="max-w-[1040px] mx-auto px-8 py-8">
        {/* Search + Filter row */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5F5] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#999]" />
            <input
              placeholder="Search by name or email..."
              className="bg-transparent border-none outline-none text-sm text-[#333] placeholder-[#999] flex-1"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
            />
          </div>
          <div className="flex items-center border border-[#E8E8E8] rounded-lg overflow-hidden">
            {['all', 'vip', 'regular', 'new', 'at-risk'].map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1.5 text-xs transition-colors ${tierFilter === t ? 'bg-[#F5F5F5] text-[#111]' : 'text-[#999] hover:bg-[#FAFAFA]'}`}
                style={{ fontWeight: tierFilter === t ? 600 : 400 }}
              >
                {t === 'all' ? 'All' : t === 'at-risk' ? 'At Risk' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Table */}
          <div className={`border border-[#E8E8E8] rounded-xl overflow-hidden ${selectedCustomer ? 'flex-1' : 'w-full'}`}>
            <div className="grid grid-cols-[1fr_140px_90px_110px_80px_40px] gap-2 px-6 py-3 bg-[#FAFAFA] border-b border-[#E8E8E8]">
              {[
                { key: 'name' as SortKey, label: 'CUSTOMER' },
                { key: 'totalSpend' as SortKey, label: 'TOTAL SPEND' },
                { key: 'visits' as SortKey, label: 'VISITS' },
                { key: 'lastVisit' as SortKey, label: 'LAST VISIT' },
              ].map(col => (
                <button key={col.key} onClick={() => toggleSort(col.key)} className="flex items-center gap-1 text-[10px] text-[#999] hover:text-[#666] transition-colors" style={{ fontWeight: 600 }}>
                  {col.label}
                  <ArrowUpDown className="w-3 h-3" style={{ opacity: sortKey === col.key ? 1 : 0.3 }} />
                </button>
              ))}
              <span className="text-[10px] text-[#999] text-right" style={{ fontWeight: 600 }}>TIER</span>
              <span />
            </div>
            {filtered.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomer(selectedCustomer?.id === c.id ? null : c)}
                className={`grid grid-cols-[1fr_140px_90px_110px_80px_40px] gap-2 px-6 py-3.5 border-b border-[#F0F0F0] items-center hover:bg-[#FAFAFA] transition-colors cursor-pointer ${selectedCustomer?.id === c.id ? 'bg-[#4945FF]/[0.03]' : ''}`}
              >
                <div>
                  <div className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{c.name}</div>
                  <div className="text-[11px] text-[#999]">{c.email}</div>
                </div>
                <span className="text-sm text-[#111]" style={{ fontWeight: 600 }}>${c.totalSpend.toLocaleString()}</span>
                <span className="text-sm text-[#666]">{c.visits}</span>
                <div>
                  <span className="text-xs text-[#666]">{c.lastVisit}</span>
                  {c.daysSince === 0 && <div className="text-[10px] text-[#10B981]" style={{ fontWeight: 600 }}>Today</div>}
                  {c.daysSince > 0 && c.daysSince <= 7 && <div className="text-[10px] text-[#999]">{c.daysSince}d ago</div>}
                  {c.daysSince > 7 && <div className="text-[10px] text-[#F59E0B]">{c.daysSince}d ago</div>}
                </div>
                <div className="flex justify-end">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${TIER_CONFIG[c.tier].bg} ${TIER_CONFIG[c.tier].text}`} style={{ fontWeight: 600 }}>
                    {TIER_CONFIG[c.tier].label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#CCC]" />
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-[#999]">No customers found</div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedCustomer && (
            <div className="w-[300px] flex-shrink-0 border border-[#E8E8E8] rounded-xl p-6 self-start sticky top-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-[#4945FF]/10 flex items-center justify-center text-[#4945FF]" style={{ fontSize: 18, fontWeight: 700 }}>
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-sm text-[#111]" style={{ fontWeight: 700 }}>{selectedCustomer.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${TIER_CONFIG[selectedCustomer.tier].bg} ${TIER_CONFIG[selectedCustomer.tier].text}`} style={{ fontWeight: 600 }}>
                    {TIER_CONFIG[selectedCustomer.tier].label}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2.5 text-sm text-[#666]">
                  <Mail className="w-4 h-4 text-[#999]" /> {selectedCustomer.email}
                </div>
                <div className="flex items-center gap-2.5 text-sm text-[#666]">
                  <Phone className="w-4 h-4 text-[#999]" /> {selectedCustomer.phone}
                </div>
              </div>

              <div className="border-t border-[#F0F0F0] pt-4 space-y-3">
                {[
                  { label: 'Total Spend', value: `$${selectedCustomer.totalSpend.toLocaleString()}` },
                  { label: 'Total Visits', value: selectedCustomer.visits.toString() },
                  { label: 'Avg. Ticket', value: `$${selectedCustomer.avgTicket.toFixed(2)}` },
                  { label: 'Last Visit', value: selectedCustomer.lastVisit },
                  { label: 'Customer Since', value: 'Aug 2024' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-[#999]" style={{ fontWeight: 500 }}>{row.label}</span>
                    <span className="text-sm text-[#111]" style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {selectedCustomer.tags.length > 0 && (
                <div className="border-t border-[#F0F0F0] pt-4 mt-4">
                  <span className="text-[10px] text-[#999] block mb-2" style={{ fontWeight: 600 }}>TAGS</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCustomer.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#666]" style={{ fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <button onClick={() => addToast('success', 'Email sent', `Draft email opened for ${selectedCustomer.name}`)} className="flex-1 py-2 rounded-lg border border-[#E8E8E8] text-xs text-[#333] hover:bg-[#F5F5F5] transition-colors" style={{ fontWeight: 500 }}>
                  Send Email
                </button>
                <button onClick={() => addToast('info', 'Full profile', `Showing complete history for ${selectedCustomer.name}`)} className="flex-1 py-2 rounded-lg bg-[#4945FF] text-xs text-white hover:bg-[#3730FF] transition-colors" style={{ fontWeight: 600 }}>
                  View Full Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {addCustomerOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setAddCustomerOpen(false)}>
          <div className="bg-white rounded-2xl p-8 w-[420px] max-w-[90vw]" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg text-[#111]" style={{ fontWeight: 700 }}>Add Customer</h2>
              <button onClick={() => setAddCustomerOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5]"><X className="w-4 h-4 text-[#666]" /></button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-[#999] block mb-1.5" style={{ fontWeight: 500 }}>Full Name</label>
                <input className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#333] outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF]" placeholder="John Doe" />
              </div>
              <div>
                <label className="text-xs text-[#999] block mb-1.5" style={{ fontWeight: 500 }}>Email</label>
                <input className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#333] outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF]" placeholder="john@email.com" />
              </div>
              <div>
                <label className="text-xs text-[#999] block mb-1.5" style={{ fontWeight: 500 }}>Phone</label>
                <input className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#333] outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF]" placeholder="(555) 000-0000" />
              </div>
            </div>
            <button onClick={() => { setAddCustomerOpen(false); addToast('success', 'Customer added', 'New customer has been created'); }} className="w-full py-3 rounded-xl bg-[#4945FF] text-white text-sm hover:bg-[#3730FF] transition-colors" style={{ fontWeight: 600 }}>
              Add Customer
            </button>
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}