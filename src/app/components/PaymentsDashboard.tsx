import { useState, useMemo, useRef, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { CreditCard, FileText, RefreshCw, Send, Plus, DollarSign, Clock, CheckCircle2, AlertCircle, ChevronRight, Building, User, MapPin, ChevronDown, Lock, Search, X, Users } from 'lucide-react';
import { useToast, ToastContainer } from './ui/Toast';
import { InvoiceBuilder } from './InvoiceBuilder';

/* ── Customers for search ── */
const CUSTOMERS = [
  { id: 'C-001', name: 'Sarah Chen', email: 'sarah.c@gmail.com', phone: '(415) 555-0142', totalSpend: 4820 },
  { id: 'C-002', name: 'Marcus Williams', email: 'marcus.w@outlook.com', phone: '(415) 555-0398', totalSpend: 3340 },
  { id: 'C-003', name: 'Emily Rodriguez', email: 'emily.r@yahoo.com', phone: '(415) 555-0817', totalSpend: 2190 },
  { id: 'C-004', name: 'James O\'Brien', email: 'james.ob@gmail.com', phone: '(415) 555-0263', totalSpend: 1870 },
  { id: 'C-005', name: 'Priya Patel', email: 'priya.p@icloud.com', phone: '(415) 555-0591', totalSpend: 1540 },
  { id: 'C-006', name: 'David Kim', email: 'david.k@proton.me', phone: '(415) 555-0734', totalSpend: 980 },
  { id: 'C-007', name: 'Alex Nguyen', email: 'alex.n@gmail.com', phone: '(415) 555-0189', totalSpend: 340 },
  { id: 'C-008', name: 'Omar Hassan', email: 'omar.h@gmail.com', phone: '(415) 555-0945', totalSpend: 156 },
];

/* ── Unpaid invoices for attachment ── */
const UNPAID_INVOICES = [
  { id: 'INV-1024', client: 'Acme Corp', amount: 3400, amountStr: '$3,400.00', due: 'Mar 10', status: 'sent' as const },
  { id: 'INV-1023', client: 'TechStart LLC', amount: 1850, amountStr: '$1,850.00', due: 'Mar 5', status: 'overdue' as const },
  { id: 'INV-1022', client: 'Green Valley Catering', amount: 2200, amountStr: '$2,200.00', due: 'Mar 15', status: 'draft' as const },
];

const INVOICES = [
  { id: 'INV-1024', client: 'Acme Corp', amount: '$3,400.00', due: 'Mar 10', status: 'sent', daysLeft: 6 },
  { id: 'INV-1023', client: 'TechStart LLC', amount: '$1,850.00', due: 'Mar 5', status: 'overdue', daysLeft: -1 },
  { id: 'INV-1022', client: 'Green Valley Catering', amount: '$2,200.00', due: 'Mar 15', status: 'draft', daysLeft: 11 },
  { id: 'INV-1021', client: 'Event Horizon Inc', amount: '$4,800.00', due: 'Feb 28', status: 'paid', daysLeft: 0 },
  { id: 'INV-1020', client: 'Metro Offices', amount: '$780.00', due: 'Feb 25', status: 'paid', daysLeft: 0 },
];

const RECURRING = [
  { client: 'Acme Corp', plan: 'Monthly Catering', amount: '$3,400.00', next: 'Apr 1', frequency: 'Monthly', active: true },
  { client: 'Metro Offices', plan: 'Weekly Lunch Service', amount: '$780.00', next: 'Mar 10', frequency: 'Weekly', active: true },
  { client: 'TechStart LLC', plan: 'Quarterly Event Package', amount: '$5,500.00', next: 'Jun 1', frequency: 'Quarterly', active: true },
  { client: 'Green Valley', plan: 'Bi-weekly Delivery', amount: '$420.00', next: 'Mar 17', frequency: 'Bi-weekly', active: false },
];

/* Real-data props supplied by the authenticated portal. Optional — when absent
   the dashboard renders its built-in demo constants unchanged. */
export interface PaymentsMetrics {
  collectedCents: number;
  paymentsCount: number;
  outstandingCents: number;
  unpaidCount: number;
  recurringCents: number;
  activePlans: number;
}
export interface PaymentsInvoice {
  id: string;
  client: string;
  amount: string;   // preformatted, e.g. "$3,400.00"
  due: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | string;
}

const fmtCents0 = (cents: number) => `$${Math.round(cents / 100).toLocaleString()}`;

export function PaymentsDashboard({ forceTerminalKey, metrics, invoicesData }: { forceTerminalKey?: number; metrics?: PaymentsMetrics; invoicesData?: PaymentsInvoice[] }) {
  const [tab, setTab] = useState<'terminal' | 'invoices' | 'recurring'>('terminal');
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('09/28');
  const [cvc, setCvc] = useState('321');
  const [cardholderName, setCardholderName] = useState('Sarah Chen');
  const [billingAddress, setBillingAddress] = useState('142 Sullivan St, New York');
  const [postalCode, setPostalCode] = useState('10012');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ach'>('card');
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [billToMode, setBillToMode] = useState<'customer' | 'invoice' | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof CUSTOMERS[number] | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof UNPAID_INVOICES[number] | null>(null);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [invoiceDropdownOpen, setInvoiceDropdownOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{ amount: string; total: string; customer: string | null; method: string; refId: string } | null>(null);
  const [recurringItems, setRecurringItems] = useState(RECURRING);
  const [invoiceBuilderOpen, setInvoiceBuilderOpen] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const customerRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const billToRef = useRef<HTMLElement>(null);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) setCustomerDropdownOpen(false);
      if (invoiceRef.current && !invoiceRef.current.contains(e.target as Node)) setInvoiceDropdownOpen(false);
      if (billToRef.current && !billToRef.current.contains(e.target as Node)) setBillToMode(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Force terminal tab when quick action triggers */
  useEffect(() => {
    if (forceTerminalKey !== undefined && forceTerminalKey > 0) {
      setTab('terminal');
      setTimeout(() => {
        billToRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [forceTerminalKey]);

  /* Format helpers */
  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };
  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };
  const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
  const processingFee = Math.round(parsedAmount * 0.029 * 100) / 100;
  const total = Math.round((parsedAmount + processingFee) * 100) / 100;
  const cardBrand = cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : cardNumber.startsWith('3') ? 'Amex' : null;

  /* Search helpers */
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return CUSTOMERS;
    return CUSTOMERS.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.email.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch));
  }, [customerSearch]);

  const filteredInvoices = useMemo(() => {
    if (!invoiceSearch) return UNPAID_INVOICES;
    return UNPAID_INVOICES.filter(i => i.client.toLowerCase().includes(invoiceSearch.toLowerCase()));
  }, [invoiceSearch]);

  /* Attach invoices to customer */
  const attachInvoices = (customer: typeof CUSTOMERS[number]) => {
    setSelectedCustomer(customer);
    setSelectedInvoice(UNPAID_INVOICES.find(inv => inv.client === customer.name) || null);
  };

  /* Clear selection */
  const clearSelection = () => {
    setSelectedCustomer(null);
    setSelectedInvoice(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Upper stats area — white background, Stripe palette */}
      <div className="max-w-[1080px] mx-auto px-10 pt-8 pb-0">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h1 className="mb-0.5" style={{ fontSize: 20, fontWeight: 600, color: '#0a2540', letterSpacing: '-0.3px' }}>Payments</h1>
            <p style={{ fontSize: 13, color: '#8898aa' }}>Virtual terminal, invoicing, and recurring billing</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-md text-sm transition-colors hover:bg-[#fafafa]"
              style={{ fontWeight: 500, color: '#425466', border: '1px solid #e6e6e6', backgroundColor: '#ffffff' }}
              onClick={() => setInvoiceBuilderOpen(true)}
            >
              <FileText className="w-3.5 h-3.5" /> New Invoice
            </button>
            <button
              className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-md text-sm text-white transition-colors"
              style={{ fontWeight: 500, backgroundColor: '#635bff' }}
              onClick={() => {
                setTab('terminal');
                setTimeout(() => {
                  billToRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }}
            >
              <CreditCard className="w-3.5 h-3.5" /> Take a Payment
            </button>
          </div>
        </div>

        {/* KPI row — joined block, Stripe style */}
        <div
          className="grid grid-cols-3 mb-8 overflow-hidden"
          style={{ backgroundColor: '#f4f5f7', border: '1px solid #e6e6e6', borderRadius: 8 }}
        >
          {(metrics
            ? [
                { label: 'Collected This Month', value: fmtCents0(metrics.collectedCents), sub: `${metrics.paymentsCount} payments`, dotColor: '#0cbc87' },
                { label: 'Outstanding Invoices', value: fmtCents0(metrics.outstandingCents), sub: `${metrics.unpaidCount} unpaid`, dotColor: '#f5a623' },
                { label: 'Recurring Revenue', value: fmtCents0(metrics.recurringCents), valueSuffix: '/mo', sub: `${metrics.activePlans} active plans`, dotColor: '#635bff' },
              ]
            : [
                { label: 'Collected This Month', value: '$18,420', sub: '12 payments', dotColor: '#0cbc87' },
                { label: 'Outstanding Invoices', value: '$7,450', sub: '3 unpaid', dotColor: '#f5a623' },
                { label: 'Recurring Revenue', value: '$10,100', valueSuffix: '/mo', sub: '4 active plans', dotColor: '#635bff' },
              ]
          ).map((kpi, i) => (
            <div
              key={i}
              className="px-5 py-[18px]"
              style={{ borderRight: i < 2 ? '1px solid #e6e6e6' : 'none', backgroundColor: '#f4f5f7' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5" style={{ fontSize: 12, fontWeight: 450, color: '#8898aa' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: kpi.dotColor }} />
                {kpi.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#0a2540', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
                {kpi.value}
                {kpi.valueSuffix && <span style={{ fontSize: 13, fontWeight: 450, color: '#8898aa', letterSpacing: 0 }}>{kpi.valueSuffix}</span>}
              </div>
              <div style={{ fontSize: 12, color: '#adbdcc', marginTop: 2 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-[1080px] mx-auto px-10">
        <div className="flex items-center gap-0" style={{ borderBottom: '1px solid #e6e6e6', marginBottom: 28 }}>
          {([
            { id: 'terminal' as const, label: 'Virtual Terminal', icon: CreditCard },
            { id: 'invoices' as const, label: 'Invoicing', icon: FileText },
            { id: 'recurring' as const, label: 'Recurring Billing', icon: RefreshCw },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 pb-2.5 mr-6 transition-colors"
              style={{
                fontSize: 13,
                fontWeight: tab === t.id ? 550 : 450,
                color: tab === t.id ? '#0a2540' : '#8898aa',
                background: 'none',
                border: 'none',
                borderBottom: tab === t.id ? '1.5px solid #0a2540' : '1.5px solid transparent',
                paddingBottom: 10,
                marginRight: 24,
                cursor: 'pointer',
              }}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-[1080px] mx-auto px-10 pb-16">
        {/* Virtual Terminal — two-column layout */}
        {tab === 'terminal' && (
          <div className="flex gap-8 py-6">
            {/* ─── Left: Payment Form ─── */}
            <div className="flex-1 min-w-0">
              {/* ── Bill To: Customer or Invoice ── */}
              <section ref={billToRef} className="mb-8">
                <h3 className="text-sm text-[#111] mb-4" style={{ fontWeight: 700 }}>Bill To</h3>

                {/* Selected state — chip display */}
                {(selectedCustomer || selectedInvoice) && (
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {selectedCustomer && (
                      <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-[#4945FF]/6 border border-[#4945FF]/15">
                        <div className="w-5 h-5 rounded-full bg-[#4945FF]/15 flex items-center justify-center">
                          <span className="text-[9px] text-[#4945FF]" style={{ fontWeight: 700 }}>{selectedCustomer.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <span className="text-xs text-[#4945FF]" style={{ fontWeight: 600 }}>{selectedCustomer.name}</span>
                        <button onClick={() => { setSelectedCustomer(null); setBillToMode(null); setCustomerSearch(''); }} className="w-4 h-4 rounded-full hover:bg-[#4945FF]/15 flex items-center justify-center transition-colors">
                          <X className="w-3 h-3 text-[#4945FF]" />
                        </button>
                      </div>
                    )}
                    {selectedInvoice && (
                      <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-[#041E42]/6 border border-[#041E42]/15">
                        <FileText className="w-3.5 h-3.5 text-[#041E42]" />
                        <span className="text-xs text-[#041E42]" style={{ fontWeight: 600 }}>{selectedInvoice.id} · {selectedInvoice.amountStr}</span>
                        <button onClick={() => { setSelectedInvoice(null); if (!selectedCustomer) setBillToMode(null); setInvoiceSearch(''); setAmount(''); }} className="w-4 h-4 rounded-full hover:bg-[#041E42]/15 flex items-center justify-center transition-colors">
                          <X className="w-3 h-3 text-[#041E42]" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Two option cards */}
                {!selectedCustomer && !selectedInvoice && billToMode === null && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setBillToMode('customer')}
                      className="group flex flex-col items-center gap-3 p-5 border border-[#E8E8E8] rounded-xl hover:border-[#4945FF]/30 hover:bg-[#4945FF]/[0.02] transition-all text-center"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#4945FF]/8 flex items-center justify-center group-hover:bg-[#4945FF]/12 transition-colors">
                        <Users className="w-5 h-5 text-[#4945FF]" />
                      </div>
                      <div>
                        <div className="text-sm text-[#333]" style={{ fontWeight: 600 }}>Search Customer</div>
                        <p className="text-[11px] text-[#999] mt-0.5">Find a customer and bill them</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setBillToMode('invoice')}
                      className="group flex flex-col items-center gap-3 p-5 border border-[#E8E8E8] rounded-xl hover:border-[#041E42]/30 hover:bg-[#041E42]/[0.02] transition-all text-center"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#041E42]/8 flex items-center justify-center group-hover:bg-[#041E42]/12 transition-colors">
                        <FileText className="w-5 h-5 text-[#041E42]" />
                      </div>
                      <div>
                        <div className="text-sm text-[#333]" style={{ fontWeight: 600 }}>Attach Invoice</div>
                        <p className="text-[11px] text-[#999] mt-0.5">Link an existing unpaid invoice</p>
                      </div>
                    </button>
                  </div>
                )}

                {/* Customer search mode */}
                {billToMode === 'customer' && !selectedCustomer && (
                  <div ref={customerRef} className="relative">
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 border border-[#E8E8E8] rounded-xl focus-within:ring-2 focus-within:ring-[#4945FF]/20 focus-within:border-[#4945FF] transition-all">
                      <Search className="w-4 h-4 text-[#BBB] flex-shrink-0" />
                      <input
                        autoFocus
                        value={customerSearch}
                        onChange={e => { setCustomerSearch(e.target.value); setCustomerDropdownOpen(true); }}
                        onFocus={() => setCustomerDropdownOpen(true)}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-[#333] placeholder-[#BBB]"
                        placeholder="Search by name, email, or phone..."
                      />
                      <button onClick={() => { setBillToMode(null); setCustomerSearch(''); setCustomerDropdownOpen(false); }} className="w-5 h-5 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center">
                        <X className="w-3.5 h-3.5 text-[#999]" />
                      </button>
                    </div>
                    {customerDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E8E8E8] rounded-xl overflow-hidden z-20" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>
                        <div className="max-h-[240px] overflow-y-auto">
                          {filteredCustomers.length === 0 ? (
                            <div className="px-4 py-6 text-center text-xs text-[#999]">No customers found</div>
                          ) : filteredCustomers.map(c => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setSelectedCustomer(c);
                                setCardholderName(c.name);
                                setCustomerDropdownOpen(false);
                                setCustomerSearch('');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#4945FF]/8 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] text-[#4945FF]" style={{ fontWeight: 700 }}>{c.name.split(' ').map(n => n[0]).join('')}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-[#333] truncate" style={{ fontWeight: 500 }}>{c.name}</div>
                                <div className="text-[11px] text-[#999] truncate">{c.email}</div>
                              </div>
                              <span className="text-[11px] text-[#BBB] flex-shrink-0" style={{ fontWeight: 500 }}>${c.totalSpend.toLocaleString()}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Invoice search mode */}
                {billToMode === 'invoice' && !selectedInvoice && (
                  <div ref={invoiceRef} className="relative">
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 border border-[#E8E8E8] rounded-xl focus-within:ring-2 focus-within:ring-[#041E42]/20 focus-within:border-[#041E42] transition-all">
                      <Search className="w-4 h-4 text-[#BBB] flex-shrink-0" />
                      <input
                        autoFocus
                        value={invoiceSearch}
                        onChange={e => { setInvoiceSearch(e.target.value); setInvoiceDropdownOpen(true); }}
                        onFocus={() => setInvoiceDropdownOpen(true)}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-[#333] placeholder-[#BBB]"
                        placeholder="Search invoices by client name..."
                      />
                      <button onClick={() => { setBillToMode(null); setInvoiceSearch(''); setInvoiceDropdownOpen(false); }} className="w-5 h-5 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center">
                        <X className="w-3.5 h-3.5 text-[#999]" />
                      </button>
                    </div>
                    {invoiceDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E8E8E8] rounded-xl overflow-hidden z-20" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>
                        <div className="max-h-[240px] overflow-y-auto">
                          {filteredInvoices.length === 0 ? (
                            <div className="px-4 py-6 text-center text-xs text-[#999]">No unpaid invoices found</div>
                          ) : filteredInvoices.map(inv => (
                            <button
                              key={inv.id}
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setAmount(inv.amount.toString());
                                setDescription(`Payment for ${inv.id}`);
                                setInvoiceDropdownOpen(false);
                                setInvoiceSearch('');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-colors text-left"
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${inv.status === 'overdue' ? 'bg-[#FEE2E2]' : 'bg-[#041E42]/8'}`}>
                                <FileText className={`w-4 h-4 ${inv.status === 'overdue' ? 'text-[#EF4444]' : 'text-[#041E42]'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-[#333] truncate" style={{ fontWeight: 500 }}>{inv.client}</div>
                                <div className="text-[11px] text-[#999] truncate">{inv.id} · Due {inv.due}</div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-sm text-[#111]" style={{ fontWeight: 600 }}>{inv.amountStr}</div>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${inv.status === 'overdue' ? 'bg-[#FEE2E2] text-[#EF4444]' : inv.status === 'sent' ? 'bg-[#EFF6FF] text-[#4945FF]' : 'bg-[#F5F5F5] text-[#999]'}`} style={{ fontWeight: 600 }}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* After selecting customer, offer to also attach invoice */}
                {selectedCustomer && !selectedInvoice && (
                  <div className="mt-3">
                    <button
                      onClick={() => setBillToMode('invoice')}
                      className="flex items-center gap-2 text-xs text-[#4945FF] hover:text-[#3730FF] transition-colors py-1"
                      style={{ fontWeight: 500 }}
                    >
                      <Plus className="w-3.5 h-3.5" /> Attach an invoice for this customer
                    </button>
                  </div>
                )}
              </section>

              {/* Payment Amount */}
              <section className="mb-8">
                <h3 className="text-sm text-[#111] mb-4" style={{ fontWeight: 700 }}>Payment Amount</h3>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999] text-lg" style={{ fontWeight: 600 }}>$</span>
                  <input
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3.5 border border-[#E8E8E8] rounded-xl text-2xl text-[#111] outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF] transition-all"
                    placeholder="0.00"
                    style={{ fontWeight: 700 }}
                  />
                </div>
              </section>

              {/* Payment Method */}
              <section className="mb-8">
                <h3 className="text-sm text-[#111] mb-4" style={{ fontWeight: 700 }}>Payment Method</h3>
                <div className="flex items-center gap-2 mb-5">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-[#4945FF]/8 text-[#4945FF] ring-2 ring-[#4945FF]/25'
                        : 'border border-[#E8E8E8] text-[#666] hover:border-[#CCC]'
                    }`}
                    style={{ fontWeight: paymentMethod === 'card' ? 600 : 400 }}
                  >
                    <CreditCard className="w-4 h-4" /> Credit Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('ach')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all ${
                      paymentMethod === 'ach'
                        ? 'bg-[#4945FF]/8 text-[#4945FF] ring-2 ring-[#4945FF]/25'
                        : 'border border-[#E8E8E8] text-[#666] hover:border-[#CCC]'
                    }`}
                    style={{ fontWeight: paymentMethod === 'ach' ? 600 : 400 }}
                  >
                    <Building className="w-4 h-4" /> ACH Payment
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-4">
                    {/* Card number + expiry + CVC in a grouped row */}
                    <div className="border border-[#E8E8E8] rounded-xl overflow-hidden divide-y divide-[#E8E8E8]">
                      <div className="flex items-center px-4 py-3 gap-3">
                        <CreditCard className="w-4 h-4 text-[#BBB] flex-shrink-0" />
                        <input
                          value={cardNumber}
                          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                          className="flex-1 bg-transparent border-none outline-none text-sm text-[#333] placeholder-[#BBB]"
                          placeholder="Card number"
                        />
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <input
                            value={expiry}
                            onChange={e => setExpiry(formatExpiry(e.target.value))}
                            className="w-16 bg-transparent border-none outline-none text-sm text-[#333] placeholder-[#BBB] text-center"
                            placeholder="MM/YY"
                          />
                          <div className="w-px h-4 bg-[#E8E8E8]" />
                          <input
                            value={cvc}
                            onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-12 bg-transparent border-none outline-none text-sm text-[#333] placeholder-[#BBB] text-center"
                            placeholder="CVC"
                          />
                        </div>
                      </div>
                      <div className="flex items-center px-4 py-3 gap-3">
                        <User className="w-4 h-4 text-[#BBB] flex-shrink-0" />
                        <input
                          value={cardholderName}
                          onChange={e => setCardholderName(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-sm text-[#333] placeholder-[#BBB]"
                          placeholder="Cardholder name"
                        />
                      </div>
                    </div>

                    {/* Billing Address + Postal */}
                    <div className="grid grid-cols-[1fr_140px] gap-3">
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BBB]" />
                        <input
                          value={billingAddress}
                          onChange={e => setBillingAddress(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#333] placeholder-[#BBB] outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF] transition-all"
                          placeholder="Billing Address"
                        />
                      </div>
                      <input
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#333] placeholder-[#BBB] outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF] transition-all"
                        placeholder="Postal Code"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border border-[#E8E8E8] rounded-xl overflow-hidden divide-y divide-[#E8E8E8]">
                      <div className="flex items-center px-4 py-3 gap-3">
                        <Building className="w-4 h-4 text-[#BBB] flex-shrink-0" />
                        <input className="flex-1 bg-transparent border-none outline-none text-sm text-[#333] placeholder-[#BBB]" placeholder="Routing number" />
                      </div>
                      <div className="flex items-center px-4 py-3 gap-3">
                        <DollarSign className="w-4 h-4 text-[#BBB] flex-shrink-0" />
                        <input className="flex-1 bg-transparent border-none outline-none text-sm text-[#333] placeholder-[#BBB]" placeholder="Account number" />
                      </div>
                      <div className="flex items-center px-4 py-3 gap-3">
                        <User className="w-4 h-4 text-[#BBB] flex-shrink-0" />
                        <input className="flex-1 bg-transparent border-none outline-none text-sm text-[#333] placeholder-[#BBB]" placeholder="Account holder name" />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* More Options (collapsible) */}
              <section className="mb-8">
                <button
                  onClick={() => setMoreOptionsOpen(p => !p)}
                  className="flex items-center justify-between w-full text-sm text-[#333] py-2 group"
                  style={{ fontWeight: 600 }}
                >
                  More Options
                  <ChevronDown
                    className={`w-4 h-4 text-[#999] transition-transform ${moreOptionsOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {moreOptionsOpen && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-xs text-[#999] block mb-1.5" style={{ fontWeight: 500 }}>Description (optional)</label>
                      <input
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#333] placeholder-[#BBB] outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF] transition-all"
                        placeholder="e.g. Catering order for Acme Corp"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#999] block mb-1.5" style={{ fontWeight: 500 }}>Customer email (for receipt)</label>
                      <input
                        className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl text-sm text-[#333] placeholder-[#BBB] outline-none focus:ring-2 focus:ring-[#4945FF]/20 focus:border-[#4945FF] transition-all"
                        placeholder="customer@email.com"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* Process button */}
              <button
                disabled={processing || parsedAmount <= 0}
                onClick={() => {
                  if (parsedAmount <= 0) return;
                  const successData = {
                    amount: parsedAmount.toFixed(2),
                    total: total.toFixed(2),
                    customer: selectedCustomer?.name || null,
                    method: paymentMethod === 'card' ? (cardBrand ? `${cardBrand} ending ${cardNumber.replace(/\s/g, '').slice(-4)}` : 'Credit Card') : 'ACH Payment',
                    refId: `REF-${Date.now().toString(36).toUpperCase().slice(-6)}`,
                  };
                  setProcessing(true);
                  setTimeout(() => {
                    setProcessing(false);
                    setPaymentSuccess(successData);
                    setAmount(''); setCardNumber(''); setExpiry(''); setCvc(''); setCardholderName('');
                    setBillingAddress(''); setPostalCode(''); setDescription('');
                    setSelectedCustomer(null); setSelectedInvoice(null); setBillToMode(null);
                  }, 2000);
                }}
                className={`w-full py-3.5 rounded-full text-white text-sm transition-colors ${processing ? 'bg-[#4945FF]/60 cursor-wait' : parsedAmount <= 0 ? 'bg-[#E8E8E8] text-[#999] cursor-not-allowed' : 'bg-[#4945FF] hover:bg-[#3730FF]'}`}
                style={{ fontWeight: 600 }}
              >
                {processing ? 'Processing...' : 'Process Payment'}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-[#BBB]">
                <Lock className="w-3 h-3" />
                <span>Payments are encrypted end-to-end</span>
              </div>
            </div>

            {/* ─── Right: Live Receipt Preview ─── */}
            <div className="w-[340px] flex-shrink-0">
              <div className="sticky top-24 border border-[#E8E8E8] rounded-2xl overflow-hidden">
                {/* Receipt header */}
                <div className="bg-[#FAFAFA] px-6 py-5 text-center border-b border-[#E8E8E8]">
                  <span className="text-[10px] text-[#999] tracking-widest" style={{ fontWeight: 600 }}>PAYMENT SUMMARY</span>
                  <div className="mt-3 text-3xl text-[#111]" style={{ fontWeight: 800 }}>
                    ${parsedAmount > 0 ? parsedAmount.toFixed(2) : '0.00'}
                  </div>
                  {cardBrand && (
                    <span className="inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-[#4945FF]/8 text-[#4945FF]" style={{ fontWeight: 600 }}>
                      {cardBrand} •••• {cardNumber.replace(/\s/g, '').slice(-4)}
                    </span>
                  )}
                  {!cardBrand && cardNumber.length === 0 && (
                    <span className="inline-block mt-2 text-[10px] text-[#CCC]" style={{ fontWeight: 500 }}>No card entered</span>
                  )}
                </div>

                {/* Line items */}
                <div className="px-6 py-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#999]" style={{ fontWeight: 500 }}>Subtotal</span>
                    <span className="text-sm text-[#333]" style={{ fontWeight: 600 }}>${parsedAmount > 0 ? parsedAmount.toFixed(2) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#999]" style={{ fontWeight: 500 }}>Processing (2.9%)</span>
                    <span className="text-sm text-[#333]" style={{ fontWeight: 600 }}>${parsedAmount > 0 ? processingFee.toFixed(2) : '—'}</span>
                  </div>
                  <div className="border-t border-dashed border-[#E8E8E8] pt-3 flex items-center justify-between">
                    <span className="text-sm text-[#111]" style={{ fontWeight: 700 }}>Total</span>
                    <span className="text-lg text-[#111]" style={{ fontWeight: 800 }}>${parsedAmount > 0 ? total.toFixed(2) : '0.00'}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="border-t border-[#E8E8E8] px-6 py-4 space-y-2.5">
                  {[
                    ...(selectedCustomer ? [{ label: 'Customer', value: selectedCustomer.name }] : []),
                    ...(selectedInvoice ? [{ label: 'Invoice', value: `${selectedInvoice.id} · ${selectedInvoice.amountStr}` }] : []),
                    { label: 'Cardholder', value: cardholderName || '—' },
                    { label: 'Method', value: paymentMethod === 'card' ? (cardBrand ? `${cardBrand} ending ${cardNumber.replace(/\s/g, '').slice(-4)}` : 'Credit Card') : 'ACH Payment' },
                    { label: 'Description', value: description || '—' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[11px] text-[#BBB]" style={{ fontWeight: 500 }}>{row.label}</span>
                      <span className="text-xs text-[#666] text-right max-w-[180px] truncate" style={{ fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Status indicator */}
                <div className="border-t border-[#E8E8E8] px-6 py-3 bg-[#FAFAFA] flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#E8E8E8]" />
                  <span className="text-[10px] text-[#BBB]" style={{ fontWeight: 600 }}>Awaiting submission</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoices */}
        {tab === 'invoices' && (
          <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[80px_1fr_110px_90px_90px_40px] gap-2 px-6 py-3 bg-[#FAFAFA] border-b border-[#E8E8E8] text-[10px] text-[#999]" style={{ fontWeight: 600 }}>
              <span>ID</span><span>CLIENT</span><span className="text-right">AMOUNT</span><span className="text-right">DUE</span><span className="text-right">STATUS</span><span></span>
            </div>
            {(invoicesData ?? INVOICES).map((inv, i) => (
              <div key={i} className="grid grid-cols-[80px_1fr_110px_90px_90px_40px] gap-2 px-6 py-3.5 border-b border-[#F0F0F0] items-center hover:bg-[#FAFAFA] transition-colors cursor-pointer">
                <span className="text-xs text-[#999] font-mono">{inv.id}</span>
                <span className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{inv.client}</span>
                <span className="text-sm text-right text-[#111]" style={{ fontWeight: 600 }}>{inv.amount}</span>
                <span className="text-xs text-right text-[#666]">{inv.due}</span>
                <div className="flex justify-end">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-[#ECFDF5] text-[#10B981]' : inv.status === 'overdue' ? 'bg-[#FEE2E2] text-[#EF4444]' : inv.status === 'sent' ? 'bg-[#EFF6FF] text-[#4945FF]' : 'bg-[#F5F5F5] text-[#999]'}`} style={{ fontWeight: 600 }}>
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#CCC]" />
              </div>
            ))}
          </div>
        )}

        {/* Recurring */}
        {tab === 'recurring' && (
          <div className="space-y-4">
            {recurringItems.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-5 border border-[#E8E8E8] rounded-xl hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.active ? 'bg-[#4945FF]/8' : 'bg-[#F5F5F5]'}`}>
                    <RefreshCw className={`w-5 h-5 ${r.active ? 'text-[#4945FF]' : 'text-[#999]'}`} />
                  </div>
                  <div>
                    <div className="text-sm text-[#111]" style={{ fontWeight: 600 }}>{r.client}</div>
                    <span className="text-xs text-[#999]">{r.plan} · {r.frequency}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-[#111]" style={{ fontWeight: 700 }}>{r.amount}</div>
                    <span className="text-[10px] text-[#999]">Next: {r.next}</span>
                  </div>
                  <span
                    onClick={() => setRecurringItems(prev => prev.map((item, j) => j === i ? { ...item, active: !item.active } : item))}
                    className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${r.active ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#F5F5F5] text-[#999]'}`} style={{ fontWeight: 600 }}>
                    {r.active ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            ))}
            <button onClick={() => addToast('success', 'New plan created', 'Recurring billing plan has been set up')} className="w-full py-4 rounded-xl border-2 border-dashed border-[#E8E8E8] text-sm text-[#999] hover:text-[#4945FF] hover:border-[#4945FF]/30 transition-all flex items-center justify-center gap-2" style={{ fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Create Recurring Plan
            </button>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ═══ Payment Success Overlay ═══ */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
          <div
            className="bg-white rounded-3xl w-[420px] overflow-hidden text-center"
            style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.18)' }}
          >
            {/* Top band */}
            <div className="bg-[#ECFDF5] pt-10 pb-8 px-8">
              {/* Animated check circle */}
              <div className="mx-auto w-20 h-20 rounded-full bg-[#10B981] flex items-center justify-center mb-5" style={{ boxShadow: '0 8px 32px rgba(16,185,129,0.35)' }}>
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-[#111] mb-1" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Payment Successful</h2>
              <p className="text-sm text-[#10B981]" style={{ fontWeight: 600 }}>Transaction completed</p>
            </div>

            {/* Amount */}
            <div className="pt-8 pb-2 px-8">
              <div className="text-4xl text-[#111]" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                ${paymentSuccess.total}
              </div>
              <span className="text-xs text-[#999] mt-1 block" style={{ fontWeight: 500 }}>Total charged (incl. 2.9% processing)</span>
            </div>

            {/* Details card */}
            <div className="mx-8 mt-5 mb-6 rounded-xl bg-[#FAFAFA] border border-[#F0F0F0] overflow-hidden">
              {[
                { label: 'Subtotal', value: `$${paymentSuccess.amount}` },
                ...(paymentSuccess.customer ? [{ label: 'Customer', value: paymentSuccess.customer }] : []),
                { label: 'Method', value: paymentSuccess.method },
                { label: 'Reference', value: paymentSuccess.refId },
                { label: 'Date', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between px-5 py-3 ${i > 0 ? 'border-t border-[#F0F0F0]' : ''}`}>
                  <span className="text-xs text-[#999]" style={{ fontWeight: 500 }}>{row.label}</span>
                  <span className="text-xs text-[#333]" style={{ fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-8 pb-8 space-y-3">
              <button
                onClick={() => setPaymentSuccess(null)}
                className="w-full py-3.5 rounded-full bg-[#4945FF] text-white text-sm hover:bg-[#3730FF] transition-colors"
                style={{ fontWeight: 600 }}
              >
                Done
              </button>
              <button
                onClick={() => {
                  setPaymentSuccess(null);
                  addToast('info', 'Receipt sent', 'A receipt has been emailed to the customer');
                }}
                className="w-full py-3 rounded-full border border-[#E8E8E8] text-sm text-[#666] hover:bg-[#F5F5F5] transition-colors"
                style={{ fontWeight: 500 }}
              >
                Send Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Invoice Builder Overlay ═══ */}
      <AnimatePresence>
        {invoiceBuilderOpen && (
          <InvoiceBuilder
            onClose={() => setInvoiceBuilderOpen(false)}
            onSave={(data) => {
              addToast('success', 'Invoice saved', `${data.invoiceNo} for $${data.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been saved`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}