import { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  X, ChevronDown, ChevronUp, Plus, Trash2, Search, Send, Save,
  FileText, Mail, Eye, Printer, CreditCard, Calendar, Palette,
  Clock, DollarSign, Percent, Truck, Globe, Copy, Download,
  Check, AlertCircle, Users, Building, GripVertical, Hash,
} from 'lucide-react';

/* ── Customers (shared with CRM) ── */
const CUSTOMERS = [
  { id: 'C-001', name: 'Sarah Chen', email: 'sarah.c@gmail.com', phone: '(415) 555-0142', address: '142 Sullivan St, New York, NY 10012' },
  { id: 'C-002', name: 'Marcus Williams', email: 'marcus.w@outlook.com', phone: '(415) 555-0398', address: '88 Pine St, San Francisco, CA 94111' },
  { id: 'C-003', name: 'Emily Rodriguez', email: 'emily.r@yahoo.com', phone: '(415) 555-0817', address: '320 5th Ave, New York, NY 10001' },
  { id: 'C-004', name: "James O'Brien", email: 'james.ob@gmail.com', phone: '(415) 555-0263', address: '15 Federal St, Boston, MA 02110' },
  { id: 'C-005', name: 'Priya Patel', email: 'priya.p@icloud.com', phone: '(415) 555-0591', address: '400 Market St, San Francisco, CA 94103' },
  { id: 'C-006', name: 'David Kim', email: 'david.k@proton.me', phone: '(415) 555-0734', address: '225 Broadway, New York, NY 10007' },
  { id: 'C-007', name: 'Lisa Thompson', email: 'lisa.t@gmail.com', phone: '(415) 555-0456', address: '1100 Wilshire Blvd, Los Angeles, CA 90017' },
  { id: 'C-008', name: 'Alex Nguyen', email: 'alex.n@gmail.com', phone: '(415) 555-0189', address: '50 Milk St, Boston, MA 02109' },
  { id: 'C-009', name: 'Rachel Foster', email: 'rachel.f@outlook.com', phone: '(415) 555-0672', address: '77 Geary St, San Francisco, CA 94108' },
  { id: 'C-010', name: 'Omar Hassan', email: 'omar.h@gmail.com', phone: '(415) 555-0945', address: '500 N Michigan Ave, Chicago, IL 60611' },
];

/* ── Pre-built product catalog suggestions ── */
const PRODUCT_SUGGESTIONS = [
  { name: 'Web Design', rate: 150 },
  { name: 'Consulting', rate: 200 },
  { name: 'Photography', rate: 250 },
  { name: 'Catering Service', rate: 500 },
  { name: 'Event Planning', rate: 350 },
  { name: 'Monthly Retainer', rate: 1500 },
  { name: 'Custom Development', rate: 175 },
  { name: 'Branding Package', rate: 2500 },
];

/* ── Types ── */
interface LineItem {
  id: string;
  product: string;
  description: string;
  qty: number;
  rate: number;
}

type ViewMode = 'edit' | 'email' | 'payor' | 'pdf';

interface InvoiceBuilderProps {
  onClose: () => void;
  onSave?: (data: any) => void;
}

/* ── Helpers ── */
const genId = () => Math.random().toString(36).slice(2, 8);
const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
};
const dueDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
};

const TERMS_OPTIONS = [
  { label: 'Due on receipt', days: 0 },
  { label: 'Net 15', days: 15 },
  { label: 'Net 30', days: 30 },
  { label: 'Net 60', days: 60 },
];

/* ═══════════════════════════════════════════════════════════
   COLLAPSIBLE SIDEBAR SECTION
   ═══════════════════════════════════════════════════════════ */
function SidebarSection({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#F0F0F0]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFAFA] transition-colors"
      >
        <span className="text-sm text-[#333]" style={{ fontWeight: 600 }}>{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#999]" /> : <ChevronDown className="w-4 h-4 text-[#999]" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOGGLE
   ═══════════════════════════════════════════════════════════ */
function Toggle({ checked, onChange, label, badge }: { checked: boolean; onChange: (v: boolean) => void; label: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#555]" style={{ fontWeight: 500 }}>{label}</span>
        {badge && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#4945FF]/10 text-[#4945FF]" style={{ fontWeight: 700 }}>{badge}</span>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors relative ${checked ? 'bg-[#4945FF]' : 'bg-[#DDD]'}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN INVOICE BUILDER
   ═══════════════════════════════════════════════════════════ */
export function InvoiceBuilder({ onClose, onSave }: InvoiceBuilderProps) {
  const [view, setView] = useState<ViewMode>('edit');
  const [customer, setCustomer] = useState<typeof CUSTOMERS[number] | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const customerRef = useRef<HTMLDivElement>(null);

  const [invoiceNo] = useState(() => `INV-${1024 + Math.floor(Math.random() * 100)}`);
  const [terms, setTerms] = useState(TERMS_OPTIONS[2]); // Net 30
  const [termsOpen, setTermsOpen] = useState(false);
  const [invoiceDate] = useState(today());
  const [due, setDue] = useState(dueDate(30));
  const [memo, setMemo] = useState('');

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: genId(), product: '', description: '', qty: 1, rate: 0 },
  ]);

  // Sidebar options
  const [showTotal, setShowTotal] = useState(true);
  const [enableDiscount, setEnableDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [enableShipping, setEnableShipping] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [enableLateFees, setEnableLateFees] = useState(false);
  const [taxRate, setTaxRate] = useState(0);

  // Product suggestion dropdown
  const [activeSuggestionRow, setActiveSuggestionRow] = useState<string | null>(null);

  // saved state
  const [saved, setSaved] = useState(false);

  /* Close customer dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) {
        setCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Filter customers */
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return CUSTOMERS;
    const q = customerSearch.toLowerCase();
    return CUSTOMERS.filter(c =>
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [customerSearch]);

  /* Computations */
  const subtotal = lineItems.reduce((sum, li) => sum + li.qty * li.rate, 0);
  const discountAmount = enableDiscount ? subtotal * (discountPercent / 100) : 0;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (taxRate / 100);
  const shipping = enableShipping ? shippingFee : 0;
  const total = afterDiscount + taxAmount + shipping;

  /* Line item helpers */
  const addLine = () => setLineItems(prev => [...prev, { id: genId(), product: '', description: '', qty: 1, rate: 0 }]);
  const removeLine = (id: string) => setLineItems(prev => prev.length > 1 ? prev.filter(l => l.id !== id) : prev);
  const updateLine = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleTermsChange = (t: typeof TERMS_OPTIONS[number]) => {
    setTerms(t);
    setDue(dueDate(t.days));
    setTermsOpen(false);
  };

  const handleSave = () => {
    setSaved(true);
    onSave?.({ invoiceNo, customer, lineItems, subtotal, total, terms: terms.label, invoiceDate, due, memo });
    setTimeout(() => setSaved(false), 2000);
  };

  /* ─── View tabs ─── */
  const VIEW_TABS: { id: ViewMode; label: string; icon: any }[] = [
    { id: 'edit', label: 'Edit', icon: FileText },
    { id: 'email', label: 'Email view', icon: Mail },
    { id: 'payor', label: 'Payor view', icon: Eye },
    { id: 'pdf', label: 'PDF view', icon: Printer },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-white"
    >
      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-[#E8E8E8] bg-white flex-shrink-0" style={{ zoom: 1.25 }}>
        <div className="flex items-center gap-1">
          {VIEW_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs transition-all ${
                view === t.id
                  ? 'bg-[#4945FF]/8 text-[#4945FF]'
                  : 'text-[#777] hover:text-[#333] hover:bg-[#F5F5F5]'
              }`}
              style={{ fontWeight: view === t.id ? 600 : 450 }}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#F5F5F5] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#999]" />
          </button>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── Left: Content Area ─── */}
        <div className="flex-1 overflow-y-auto bg-[#F7F7F8]">
          <AnimatePresence mode="wait">
            {view === 'edit' && <EditView key="edit" {...{ customer, setCustomer, customerSearch, setCustomerSearch, customerDropdownOpen, setCustomerDropdownOpen, customerRef, filteredCustomers, invoiceNo, terms, termsOpen, setTermsOpen, handleTermsChange, invoiceDate, due, lineItems, addLine, removeLine, updateLine, activeSuggestionRow, setActiveSuggestionRow, memo, setMemo, subtotal, discountAmount, enableDiscount, taxAmount, taxRate, shipping, enableShipping, total, showTotal, discountPercent }} />}
            {view === 'email' && <EmailView key="email" {...{ invoiceNo, customer, total }} />}
            {view === 'payor' && <PayorView key="payor" {...{ invoiceNo, customer, total, due, lineItems, subtotal, taxAmount, discountAmount, shipping }} />}
            {view === 'pdf' && <PDFView key="pdf" {...{ invoiceNo, customer, terms, invoiceDate, due, lineItems, subtotal, discountAmount, enableDiscount, taxAmount, taxRate, shipping, enableShipping, total, memo, showTotal, discountPercent }} />}
          </AnimatePresence>
        </div>

        {/* ─── Right Sidebar ─── */}
        <div className="w-[280px] border-l border-[#E8E8E8] bg-white overflow-y-auto flex-shrink-0" style={{ zoom: 1.25 }}>
          <SidebarSection title="Payment options" defaultOpen>
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-[#999]" style={{ fontWeight: 600, letterSpacing: 0.5 }}>ACCEPTED METHODS</span>
                <button className="text-[10px] text-[#4945FF]" style={{ fontWeight: 600 }}>Set up</button>
              </div>
              <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                {['Visa', 'MC', 'Amex', 'ACH', 'Apple Pay'].map(m => (
                  <span key={m} className="text-[9px] px-2 py-1 rounded bg-[#F5F5F5] text-[#666] border border-[#E8E8E8]" style={{ fontWeight: 600 }}>{m}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#555]" style={{ fontWeight: 500 }}>Payment details</span>
                <button className="text-[10px] text-[#4945FF]" style={{ fontWeight: 600 }}>Manage</button>
              </div>
            </div>
          </SidebarSection>

          <SidebarSection title="More options" defaultOpen>
            <div className="space-y-0.5">
              <Toggle checked={showTotal} onChange={setShowTotal} label="Invoice total" />
              <Toggle checked={enableDiscount} onChange={setEnableDiscount} label="Discount" />
              {enableDiscount && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex items-center gap-2 py-1.5 pl-4">
                    <input
                      type="number"
                      value={discountPercent || ''}
                      onChange={e => setDiscountPercent(Number(e.target.value))}
                      className="w-16 px-2 py-1 border border-[#E0E0E0] rounded text-xs text-[#333] outline-none focus:border-[#4945FF]"
                      placeholder="0"
                    />
                    <span className="text-xs text-[#999]">%</span>
                  </div>
                </motion.div>
              )}
              <Toggle checked={enableShipping} onChange={setEnableShipping} label="Shipping fee" />
              {enableShipping && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex items-center gap-2 py-1.5 pl-4">
                    <span className="text-xs text-[#999]">$</span>
                    <input
                      type="number"
                      value={shippingFee || ''}
                      onChange={e => setShippingFee(Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-[#E0E0E0] rounded text-xs text-[#333] outline-none focus:border-[#4945FF]"
                      placeholder="0.00"
                    />
                  </div>
                </motion.div>
              )}
              <Toggle checked={enableLateFees} onChange={setEnableLateFees} label="Late fees" />
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-[#555]" style={{ fontWeight: 500 }}>Sales tax</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={taxRate || ''}
                    onChange={e => setTaxRate(Number(e.target.value))}
                    className="w-12 px-1.5 py-0.5 border border-[#E0E0E0] rounded text-[11px] text-[#333] text-right outline-none focus:border-[#4945FF]"
                    placeholder="0"
                  />
                  <span className="text-[11px] text-[#999]">%</span>
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-[#F7F7F8] border border-[#E8E8E8]">
              <p className="text-[10px] text-[#999] leading-relaxed">You can change defaults in your settings or customize them per customer.</p>
            </div>
          </SidebarSection>

          <SidebarSection title="Design">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#555]" style={{ fontWeight: 500 }}>Accent color</span>
                <div className="flex items-center gap-1.5">
                  {['#4945FF', '#041E42', '#10B981', '#F59E0B', '#EF4444'].map(c => (
                    <div key={c} className="w-5 h-5 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: c, boxShadow: '0 0 0 1px #E0E0E0' }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#555]" style={{ fontWeight: 500 }}>Logo</span>
                <button className="text-[10px] text-[#4945FF]" style={{ fontWeight: 600 }}>Upload</button>
              </div>
            </div>
          </SidebarSection>

          <SidebarSection title="Scheduling">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#555]" style={{ fontWeight: 500 }}>Send later</span>
                <button className="text-[10px] px-2 py-1 rounded bg-[#F5F5F5] text-[#666] border border-[#E8E8E8]" style={{ fontWeight: 500 }}>Schedule</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#555]" style={{ fontWeight: 500 }}>Auto-remind</span>
                <button className="text-[10px] px-2 py-1 rounded bg-[#F5F5F5] text-[#666] border border-[#E8E8E8]" style={{ fontWeight: 500 }}>Set up</button>
              </div>
            </div>
          </SidebarSection>
        </div>
      </div>

      {/* ═══ BOTTOM BAR ═══ */}
      <div className="flex items-center justify-between px-6 h-16 border-t border-[#E8E8E8] bg-white flex-shrink-0">
        <button className="text-xs text-[#4945FF] hover:text-[#3730FF] transition-colors" style={{ fontWeight: 600 }}>
          Print or download
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all ${
              saved
                ? 'bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20'
                : 'border border-[#E8E8E8] text-[#333] hover:bg-[#F5F5F5]'
            }`}
            style={{ fontWeight: 600 }}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={() => {
              handleSave();
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#4945FF] text-white text-sm hover:bg-[#3730FF] transition-colors"
            style={{ fontWeight: 600 }}
          >
            <Send className="w-4 h-4" />
            Review and send
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EDIT VIEW
   ═══════════════════════════════════════════════════════════ */
function EditView({
  customer, setCustomer, customerSearch, setCustomerSearch,
  customerDropdownOpen, setCustomerDropdownOpen, customerRef, filteredCustomers,
  invoiceNo, terms, termsOpen, setTermsOpen, handleTermsChange,
  invoiceDate, due, lineItems, addLine, removeLine, updateLine,
  activeSuggestionRow, setActiveSuggestionRow,
  memo, setMemo, subtotal, discountAmount, enableDiscount, taxAmount, taxRate,
  shipping, enableShipping, total, showTotal, discountPercent,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="max-w-[760px] mx-auto py-8 px-6"
      style={{ zoom: 1.25 }}
    >
      {/* Invoice header card */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        {/* Top accent band */}
        <div className="h-1.5 bg-gradient-to-r from-[#4945FF] to-[#6C69FF]" />

        <div className="p-8">
          {/* Company + Invoice title */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-[#4945FF] mb-1" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: -0.5 }}>INVOICE</h1>
              <div className="text-sm text-[#333]" style={{ fontWeight: 600 }}>Delt Pay</div>
              <div className="text-xs text-[#999] leading-relaxed mt-0.5">
                100 Finance Ave, Suite 200<br />
                New York, NY 10001
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#999] leading-relaxed">
                hello@delt.com<br />
                +1 (800) 555-0190<br />
                <span className="text-[#4945FF]">https://www.delt.com</span>
              </div>
            </div>
          </div>

          {/* Customer + Invoice details row */}
          <div className="flex gap-8 mb-10">
            {/* Customer selector */}
            <div className="flex-1">
              <label className="block text-[10px] text-[#999] mb-2" style={{ fontWeight: 600, letterSpacing: 0.5 }}>BILL TO</label>
              {customer ? (
                <div className="p-4 rounded-xl bg-[#4945FF]/[0.03] border border-[#4945FF]/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#111]" style={{ fontWeight: 600 }}>{customer.name}</span>
                    <button
                      onClick={() => setCustomer(null)}
                      className="w-5 h-5 rounded-full hover:bg-[#4945FF]/10 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-[#4945FF]" />
                    </button>
                  </div>
                  <div className="text-xs text-[#666] leading-relaxed">
                    {customer.email}<br />
                    {customer.address}
                  </div>
                </div>
              ) : (
                <div ref={customerRef} className="relative">
                  <div className="flex items-center gap-2 px-3 py-2.5 border border-[#E0E0E0] rounded-xl focus-within:ring-2 focus-within:ring-[#4945FF]/20 focus-within:border-[#4945FF] transition-all bg-white">
                    <Search className="w-3.5 h-3.5 text-[#BBB] flex-shrink-0" />
                    <input
                      value={customerSearch}
                      onChange={e => { setCustomerSearch(e.target.value); setCustomerDropdownOpen(true); }}
                      onFocus={() => setCustomerDropdownOpen(true)}
                      className="flex-1 bg-transparent border-none outline-none text-sm text-[#333] placeholder-[#BBB]"
                      placeholder="Add customer..."
                    />
                  </div>
                  {customerDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E8E8E8] rounded-xl overflow-hidden z-20" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>
                      <div className="max-h-[220px] overflow-y-auto">
                        {filteredCustomers.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-[#999]">No customers found</div>
                        ) : filteredCustomers.map((c: typeof CUSTOMERS[number]) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setCustomer(c);
                              setCustomerDropdownOpen(false);
                              setCustomerSearch('');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAFAFA] transition-colors text-left"
                          >
                            <div className="w-7 h-7 rounded-full bg-[#4945FF]/8 flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] text-[#4945FF]" style={{ fontWeight: 700 }}>{c.name.split(' ').map((n: string) => n[0]).join('')}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-[#333] truncate" style={{ fontWeight: 500 }}>{c.name}</div>
                              <div className="text-[10px] text-[#999] truncate">{c.email}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-[#F0F0F0] px-4 py-2.5">
                        <button className="flex items-center gap-2 text-xs text-[#4945FF] hover:text-[#3730FF]" style={{ fontWeight: 600 }}>
                          <Plus className="w-3.5 h-3.5" /> Add new customer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Invoice details */}
            <div className="w-[240px] flex-shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#999]" style={{ fontWeight: 600 }}>Invoice no.</span>
                <span className="text-xs text-[#333] font-mono" style={{ fontWeight: 600 }}>{invoiceNo}</span>
              </div>
              <div className="flex items-center justify-between relative">
                <span className="text-[10px] text-[#999]" style={{ fontWeight: 600 }}>Terms</span>
                <button
                  onClick={() => setTermsOpen(!termsOpen)}
                  className="flex items-center gap-1 text-xs text-[#333] hover:text-[#4945FF] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  {terms.label} <ChevronDown className="w-3 h-3" />
                </button>
                {termsOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-[#E8E8E8] rounded-lg overflow-hidden z-20 w-[140px]" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                    {TERMS_OPTIONS.map(t => (
                      <button
                        key={t.label}
                        onClick={() => handleTermsChange(t)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-[#FAFAFA] transition-colors ${terms.label === t.label ? 'text-[#4945FF] bg-[#4945FF]/[0.03]' : 'text-[#555]'}`}
                        style={{ fontWeight: terms.label === t.label ? 600 : 400 }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#999]" style={{ fontWeight: 600 }}>Invoice date</span>
                <span className="text-xs text-[#333]" style={{ fontWeight: 500 }}>{invoiceDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#999]" style={{ fontWeight: 600 }}>Due date</span>
                <span className="text-xs text-[#333]" style={{ fontWeight: 500 }}>{due}</span>
              </div>
            </div>
          </div>

          {/* ─── Line Items Table ─── */}
          <div className="mb-8">
            <h3 className="text-xs text-[#111] mb-3" style={{ fontWeight: 700 }}>Product or service</h3>
            <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[28px_1fr_1.2fr_70px_90px_90px_32px] gap-2 px-4 py-2.5 bg-[#FAFAFA] border-b border-[#E8E8E8]">
                <span className="text-[9px] text-[#BBB]" style={{ fontWeight: 600 }}>#</span>
                <span className="text-[9px] text-[#999]" style={{ fontWeight: 600 }}>PRODUCT/SERVICE</span>
                <span className="text-[9px] text-[#999]" style={{ fontWeight: 600 }}>DESCRIPTION</span>
                <span className="text-[9px] text-[#999] text-center" style={{ fontWeight: 600 }}>QTY</span>
                <span className="text-[9px] text-[#999] text-right" style={{ fontWeight: 600 }}>RATE</span>
                <span className="text-[9px] text-[#999] text-right" style={{ fontWeight: 600 }}>AMOUNT</span>
                <span />
              </div>

              {/* Rows */}
              {lineItems.map((li, idx) => (
                <div key={li.id} className="grid grid-cols-[28px_1fr_1.2fr_70px_90px_90px_32px] gap-2 px-4 py-2.5 border-b border-[#F0F0F0] items-center group hover:bg-[#FAFAFA]/50 transition-colors relative">
                  <span className="text-[10px] text-[#CCC]">{idx + 1}</span>
                  <div className="relative">
                    <input
                      value={li.product}
                      onChange={e => { updateLine(li.id, 'product', e.target.value); setActiveSuggestionRow(li.id); }}
                      onFocus={() => setActiveSuggestionRow(li.id)}
                      onBlur={() => setTimeout(() => setActiveSuggestionRow(null), 150)}
                      className="w-full bg-transparent border-none outline-none text-xs text-[#333] placeholder-[#CCC]"
                      placeholder="Service name..."
                      style={{ fontWeight: 500 }}
                    />
                    {activeSuggestionRow === li.id && li.product.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E8E8E8] rounded-lg overflow-hidden z-20" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                        {PRODUCT_SUGGESTIONS.filter(p => p.name.toLowerCase().includes(li.product.toLowerCase())).slice(0, 4).map(p => (
                          <button
                            key={p.name}
                            onMouseDown={() => {
                              updateLine(li.id, 'product', p.name);
                              updateLine(li.id, 'rate', p.rate);
                              setActiveSuggestionRow(null);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-[#FAFAFA] transition-colors"
                          >
                            <span className="text-[#333]" style={{ fontWeight: 500 }}>{p.name}</span>
                            <span className="text-[#999]">${p.rate}/hr</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    value={li.description}
                    onChange={e => updateLine(li.id, 'description', e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs text-[#666] placeholder-[#CCC]"
                    placeholder="Description..."
                  />
                  <input
                    type="number"
                    value={li.qty || ''}
                    onChange={e => updateLine(li.id, 'qty', Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none text-xs text-[#333] text-center placeholder-[#CCC]"
                    placeholder="1"
                    style={{ fontWeight: 500 }}
                  />
                  <div className="flex items-center justify-end">
                    <span className="text-xs text-[#BBB] mr-0.5">$</span>
                    <input
                      type="number"
                      value={li.rate || ''}
                      onChange={e => updateLine(li.id, 'rate', Number(e.target.value))}
                      className="w-full bg-transparent border-none outline-none text-xs text-[#333] text-right placeholder-[#CCC]"
                      placeholder="0.00"
                      style={{ fontWeight: 500 }}
                    />
                  </div>
                  <div className="text-xs text-right text-[#111]" style={{ fontWeight: 600 }}>
                    ${fmt(li.qty * li.rate)}
                  </div>
                  <button
                    onClick={() => removeLine(li.id)}
                    className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#FEE2E2] transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-[#EF4444]" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add line + Clear */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={addLine}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0E0E0] text-xs text-[#555] hover:border-[#4945FF] hover:text-[#4945FF] transition-all"
                style={{ fontWeight: 500 }}
              >
                <Plus className="w-3.5 h-3.5" /> Add line item
              </button>
              {lineItems.length > 1 && (
                <button
                  onClick={() => {}}
                  className="text-xs text-[#999] hover:text-[#EF4444] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Clear all lines
                </button>
              )}
            </div>
          </div>

          {/* ─── Totals + Message ─── */}
          <div className="flex gap-8">
            {/* Left: message */}
            <div className="flex-1">
              <label className="block text-[10px] text-[#999] mb-2" style={{ fontWeight: 600, letterSpacing: 0.5 }}>MESSAGE TO CUSTOMER</label>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                className="w-full h-24 p-3 border border-[#E0E0E0] rounded-xl text-xs text-[#333] placeholder-[#CCC] outline-none focus:border-[#4945FF] focus:ring-2 focus:ring-[#4945FF]/10 resize-none transition-all"
                placeholder="Tell your customer how you want to get paid..."
              />
            </div>

            {/* Right: totals */}
            <div className="w-[240px] flex-shrink-0">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#666]">Subtotal</span>
                  <span className="text-xs text-[#111]" style={{ fontWeight: 600 }}>${fmt(subtotal)}</span>
                </div>
                {enableDiscount && discountPercent > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#666]">Discount ({discountPercent}%)</span>
                    <span className="text-xs text-[#EF4444]" style={{ fontWeight: 600 }}>-${fmt(discountAmount)}</span>
                  </div>
                )}
                {taxRate > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#666]">Sales tax ({taxRate}%)</span>
                    <span className="text-xs text-[#111]" style={{ fontWeight: 600 }}>${fmt(taxAmount)}</span>
                  </div>
                )}
                {enableShipping && shipping > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#666]">Shipping</span>
                    <span className="text-xs text-[#111]" style={{ fontWeight: 600 }}>${fmt(shipping)}</span>
                  </div>
                )}
                <div className="border-t border-[#E8E8E8] pt-3 mt-3 flex items-center justify-between">
                  <span className="text-sm text-[#111]" style={{ fontWeight: 700 }}>Invoice total</span>
                  <span className="text-lg text-[#111]" style={{ fontWeight: 800, letterSpacing: -0.5 }}>${fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMAIL VIEW
   ═══════════════════════════════════════════════════════════ */
function EmailView({ invoiceNo, customer, total }: { invoiceNo: string; customer: any; total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="max-w-[600px] mx-auto py-10 px-6"
      style={{ zoom: 1.25 }}
    >
      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="p-10 text-center">
          <h2 className="text-[#111] mb-1" style={{ fontSize: '1.35rem', fontWeight: 800 }}>Your invoice is ready!</h2>
          <p className="text-sm text-[#999]" style={{ fontWeight: 500 }}>Total ${fmt(total)}</p>

          <div className="mt-6 mb-8">
            <div className="text-[10px] text-[#999] mb-1" style={{ fontWeight: 600, letterSpacing: 1 }}>BALANCE DUE</div>
            <div className="text-[#111]" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: -1.5 }}>${fmt(total)}</div>
          </div>

          <div className="border border-[#F0F0F0] rounded-xl p-6 mb-8 bg-[#FAFAFA]">
            <p className="text-sm text-[#666] italic">The email message you write will go here</p>
          </div>

          <button className="mx-auto px-10 py-3 rounded-xl bg-[#4945FF] text-white text-sm hover:bg-[#3730FF] transition-colors" style={{ fontWeight: 600 }}>
            View details
          </button>

          <div className="mt-8 pt-6 border-t border-[#F0F0F0]">
            <div className="text-sm text-[#333]" style={{ fontWeight: 600 }}>Delt Pay</div>
            <div className="text-xs text-[#999] mt-1 leading-relaxed">
              525 Wheatfield St<br />
              North Tonawanda, NY 14120-7034
            </div>
            <div className="mt-3 space-y-0.5">
              <div className="text-xs text-[#4945FF]">patrick@paydelt.com</div>
              <div className="text-xs text-[#4945FF]">+1 (305) 215-2199</div>
              <div className="text-xs text-[#4945FF]">https://www.deltpay.com</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F0F0F0]">
            <p className="text-[10px] text-[#BBB] leading-relaxed">
              If you receive an email that seems fraudulent, please check with the business owner before paying.
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            <div className="text-xs text-[#BBB]">Powered by</div>
            <span className="text-xs text-[#4945FF]" style={{ fontWeight: 800, letterSpacing: -0.3 }}>Delt</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAYOR VIEW
   ═══════════════════════════════════════════════════════════ */
function PayorView({ invoiceNo, customer, total, due, lineItems, subtotal, taxAmount, discountAmount, shipping }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="max-w-[700px] mx-auto py-10 px-6"
      style={{ zoom: 1.25 }}
    >
      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0] bg-[#FAFAFA]">
          <span className="text-sm text-[#4945FF]" style={{ fontWeight: 800, letterSpacing: -0.3 }}>Delt</span>
          <button className="text-xs text-[#999] hover:text-[#333] transition-colors flex items-center gap-1.5" style={{ fontWeight: 500 }}>
            <Users className="w-3.5 h-3.5" /> Sign in
          </button>
        </div>

        <div className="p-8 flex gap-8">
          {/* Left: balance */}
          <div className="flex-1">
            <div className="text-[10px] text-[#999] mb-1" style={{ fontWeight: 600, letterSpacing: 1 }}>BALANCE DUE</div>
            <div className="text-[#111] mb-4" style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: -1.5 }}>${fmt(total)}</div>
            <p className="text-xs text-[#999] leading-relaxed mb-6">
              Contact {customer?.name || 'the merchant'} if you're not sure how to pay this invoice.
            </p>
            <div className="text-[9px] text-[#CCC]">&copy; 2026 Delt Inc. All rights reserved.</div>
          </div>

          {/* Right: invoice details */}
          <div className="w-[260px] flex-shrink-0">
            <div className="bg-[#FAFAFA] rounded-xl border border-[#F0F0F0] p-5 mb-4">
              <div className="text-sm text-[#111] mb-3" style={{ fontWeight: 700 }}>Delt Pay</div>
              <div className="space-y-2">
                {[
                  { label: 'Invoice', value: invoiceNo },
                  { label: 'Due date', value: due },
                  { label: 'Invoice amount', value: `$${fmt(total)}` },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-[10px] text-[#999]" style={{ fontWeight: 500 }}>{r.label}</span>
                    <span className="text-xs text-[#333]" style={{ fontWeight: 600 }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 rounded-lg border border-[#E0E0E0] text-xs text-[#555] hover:bg-[#F5F5F5] transition-colors" style={{ fontWeight: 500 }}>
                View Invoice
              </button>
            </div>

            <div className="bg-[#FAFAFA] rounded-xl border border-[#F0F0F0] p-4">
              <div className="text-[10px] text-[#999] mb-1" style={{ fontWeight: 600 }}>Merchant details</div>
              <div className="text-xs text-[#555]">Email: hello@delt.com</div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-[#CCC]">
              <Check className="w-3 h-3" />
              Information is protected and kept confidential
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PDF VIEW
   ═══════════════════════════════════════════════════════════ */
function PDFView({
  invoiceNo, customer, terms, invoiceDate, due, lineItems,
  subtotal, discountAmount, enableDiscount, taxAmount, taxRate,
  shipping, enableShipping, total, memo, showTotal, discountPercent,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="max-w-[680px] mx-auto py-10 px-6"
      style={{ zoom: 1.25 }}
    >
      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div className="p-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-[#4945FF] mb-2" style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: -0.3 }}>INVOICE</h1>
              <div className="text-xs text-[#333]" style={{ fontWeight: 600 }}>Delt Pay</div>
              <div className="text-[11px] text-[#999] leading-relaxed">
                100 Finance Ave, Suite 200<br />
                New York, NY 10001
              </div>
            </div>
            <div className="text-right text-[11px] text-[#999] leading-relaxed">
              hello@delt.com<br />
              +1 (800) 555-0190<br />
              https://www.delt.com
            </div>
          </div>

          {/* Accent bar */}
          <div className="h-0.5 bg-gradient-to-r from-[#4945FF] to-[#6C69FF] mb-6 rounded-full" />

          {/* Invoice details */}
          <div className="mb-6">
            <div className="text-xs text-[#111] mb-2" style={{ fontWeight: 700 }}>Invoice details</div>
            <div className="text-[11px] text-[#666] leading-relaxed space-y-0.5">
              <div>Invoice no.: {invoiceNo}</div>
              <div>Terms: {terms.label}</div>
              <div>Invoice date: {invoiceDate}</div>
              <div>Due date: {due}</div>
            </div>
            {customer && (
              <div className="mt-3 text-[11px] text-[#666] leading-relaxed">
                <span className="text-[#111]" style={{ fontWeight: 600 }}>Bill to:</span><br />
                {customer.name}<br />
                {customer.email}<br />
                {customer.address}
              </div>
            )}
          </div>

          {/* Line items table */}
          <div className="border border-[#E8E8E8] rounded-lg overflow-hidden mb-6">
            <div className="grid grid-cols-[24px_1.2fr_1.5fr_60px_80px_80px] gap-2 px-4 py-2 bg-[#FAFAFA] border-b border-[#E8E8E8]">
              <span className="text-[9px] text-[#999]" style={{ fontWeight: 600 }}>#</span>
              <span className="text-[9px] text-[#999]" style={{ fontWeight: 600 }}>Product or service</span>
              <span className="text-[9px] text-[#999]" style={{ fontWeight: 600 }}>Description</span>
              <span className="text-[9px] text-[#999] text-center" style={{ fontWeight: 600 }}>Qty</span>
              <span className="text-[9px] text-[#999] text-right" style={{ fontWeight: 600 }}>Rate</span>
              <span className="text-[9px] text-[#999] text-right" style={{ fontWeight: 600 }}>Amount</span>
            </div>
            {lineItems.filter((li: LineItem) => li.product || li.rate > 0).map((li: LineItem, idx: number) => (
              <div key={li.id} className="grid grid-cols-[24px_1.2fr_1.5fr_60px_80px_80px] gap-2 px-4 py-2.5 border-b border-[#F0F0F0]">
                <span className="text-[10px] text-[#CCC]">{idx + 1}</span>
                <span className="text-[11px] text-[#333]" style={{ fontWeight: 500 }}>{li.product || '—'}</span>
                <span className="text-[11px] text-[#666]">{li.description || '—'}</span>
                <span className="text-[11px] text-[#333] text-center">{li.qty}</span>
                <span className="text-[11px] text-[#333] text-right">${fmt(li.rate)}</span>
                <span className="text-[11px] text-[#111] text-right" style={{ fontWeight: 600 }}>${fmt(li.qty * li.rate)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-[220px] space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#666]">Subtotal</span>
                <span className="text-[#111]" style={{ fontWeight: 600 }}>${fmt(subtotal)}</span>
              </div>
              {enableDiscount && discountPercent > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#666]">Discount ({discountPercent}%)</span>
                  <span className="text-[#EF4444]" style={{ fontWeight: 600 }}>-${fmt(discountAmount)}</span>
                </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#666]">Tax ({taxRate}%)</span>
                  <span className="text-[#111]" style={{ fontWeight: 600 }}>${fmt(taxAmount)}</span>
                </div>
              )}
              {enableShipping && shipping > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#666]">Shipping</span>
                  <span className="text-[#111]" style={{ fontWeight: 600 }}>${fmt(shipping)}</span>
                </div>
              )}
              {showTotal && (
                <div className="flex justify-between border-t border-[#E8E8E8] pt-2 mt-2">
                  <span className="text-xs text-[#111]" style={{ fontWeight: 700 }}>Total</span>
                  <span className="text-sm text-[#111]" style={{ fontWeight: 800 }}>${fmt(total)}</span>
                </div>
              )}
            </div>
          </div>

          {memo && (
            <div className="mt-8 pt-4 border-t border-[#F0F0F0]">
              <div className="text-[10px] text-[#999] mb-1" style={{ fontWeight: 600 }}>Note</div>
              <p className="text-[11px] text-[#666] leading-relaxed">{memo}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}