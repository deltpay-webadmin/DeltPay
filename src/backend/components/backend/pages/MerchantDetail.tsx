import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, Edit, Plus, FileText, CreditCard, Banknote, Globe,
  ChevronDown, Send, CheckCircle, ExternalLink, Brain, Package, Gift, Copy,
  Users, Truck, Link2, X, ShieldAlert, StickyNote, Calendar, Megaphone, Trash2,
} from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';
import {
  useMerchants,
  merchantActions,
  underwritingActions,
  type Merchant,
  type PlanTier,
  type MerchantStatus,
} from '../crmStore';
import { useCapital, type CapitalDeal } from '../capitalStore';

/* ─── Shared sub-components ─── */

function StatCard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}

function HealthScoreCard({ score }: { score: number }) {
  const getColor = (s: number) => s >= 80 ? 'text-emerald-600' : s >= 60 ? 'text-amber-600' : 'text-red-600';
  const getStroke = (s: number) => s >= 80 ? '#34C77B' : s >= 60 ? '#F0B429' : '#F2565B';
  const c = 2 * Math.PI * 36;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-sm text-gray-600 mb-3">Health Score</p>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg className="transform -rotate-90 w-20 h-20">
            <circle cx="40" cy="40" r="36" stroke="#E5E7EB" strokeWidth="8" fill="none" />
            <circle cx="40" cy="40" r="36" stroke={getStroke(score)} strokeWidth="8" fill="none" strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round" className="transition-all duration-500" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${getColor(score)}`}>{score}</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500">Out of 100</p>
          <p className="text-xs text-gray-500 mt-1">{score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Fair'}</p>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (<div className="py-3 border-b border-gray-100 last:border-0"><p className="text-xs text-gray-500 mb-1">{label}</p><p className="text-sm font-medium text-gray-900">{value || '—'}</p></div>);
}

/* ─── Bundles (client-side credit issuance) ─── */
const BUNDLE_TIERS = [
  { id: 'welcome', name: 'Welcome Bundle', amount: 500 },
  { id: 'referrer', name: 'Referrer Reward', amount: 200 },
  { id: 'retention-light', name: 'Retention - Light', amount: 200 },
  { id: 'retention-medium', name: 'Retention - Medium', amount: 350 },
  { id: 'retention-full', name: 'Retention - Full', amount: 500 },
];
type CreditStatus = 'Active' | 'Partially Used' | 'Fully Used' | 'Expired';
interface BundleCredit { id: string; tier: string; amount: number; used: number; status: CreditStatus; expiration: string; }
const CARD_QTY_OPTIONS = [50, 100, 250, 500];
function creditStatusCls(s: CreditStatus) { return s === 'Active' ? 'bg-emerald-50 text-emerald-700' : s === 'Partially Used' ? 'bg-amber-50 text-amber-700' : s === 'Fully Used' ? 'bg-gray-100 text-gray-500' : s === 'Expired' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'; }

function BundlesAndReferralsCard({ merchantName, merchantId }: { merchantName: string; merchantId: string }) {
  const [credits, setCredits] = useState<BundleCredit[]>([]);
  const [issueDropdown, setIssueDropdown] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardQty, setCardQty] = useState(100);
  const [shipTo, setShipTo] = useState<'merchant' | 'agent'>('merchant');
  const [copied, setCopied] = useState(false);
  const [reminderSent, setReminderSent] = useState<string | null>(null);
  const referralLink = `https://deltpay.com/r/${merchantId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const handleIssue = (t: { id: string; name: string; amount: number }) => { const exp = new Date(); exp.setDate(exp.getDate() + 30); setCredits(prev => [...prev, { id: `bc-${Date.now()}`, tier: t.name, amount: t.amount, used: 0, status: 'Active', expiration: exp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }]); setIssueDropdown(false); };
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-5 py-3 border-b border-gray-200"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Package className="w-3.5 h-3.5 text-gray-400" /><h3 className="text-sm font-semibold text-gray-700">Bundles & Referrals</h3></div>
        <div className="relative"><button onClick={() => setIssueDropdown(!issueDropdown)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-brand hover:bg-indigo-50 border border-gray-200 rounded-[6px] transition-colors"><Gift className="w-3.5 h-3.5" />Issue Credit<ChevronDown className="w-3 h-3 ml-0.5" /></button>
          {issueDropdown && (<><div className="fixed inset-0 z-10" onClick={() => setIssueDropdown(false)} /><div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-[8px] shadow-lg py-1 w-60"><p className="px-3 py-1.5 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Select Tier</p>{BUNDLE_TIERS.map(t => (<button key={t.id} onClick={() => handleIssue(t)} className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><span>{t.name}</span><span className="text-xs font-semibold text-gray-900">${t.amount}</span></button>))}</div></>)}
        </div></div></div>
      <div className="px-5 py-3 border-b border-gray-200">
        {credits.length === 0 ? <p className="text-sm text-gray-400 py-3 text-center">No credits issued yet.</p> : (
          <div className="divide-y divide-gray-100">{credits.map(c => { const rem = c.amount - c.used; const pct = Math.round((c.used / c.amount) * 100); return (
            <div key={c.id} className="flex items-center gap-4 py-3"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><p className="text-sm font-medium text-gray-900">{c.tier}</p><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${creditStatusCls(c.status)}`}>{c.status}</span></div><div className="flex items-center gap-3 text-xs text-gray-500"><span>${c.used} used / <span className="font-medium text-gray-700">${rem} remaining</span></span><span className="text-gray-300">|</span><span>Expires {c.expiration}</span></div><div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full max-w-[200px]"><div className={`h-full rounded-full transition-all ${c.status === 'Fully Used' || c.status === 'Expired' ? 'bg-gray-300' : 'bg-brand'}`} style={{ width: `${pct}%` }} /></div></div>
              {(c.status === 'Active' || c.status === 'Partially Used') && (<button onClick={() => { setReminderSent(c.id); setTimeout(() => setReminderSent(null), 2000); }} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-brand hover:bg-indigo-50 border border-gray-200 rounded-[6px] transition-colors shrink-0"><Send className="w-3 h-3" />{reminderSent === c.id ? 'Sent!' : 'Remind'}</button>)}
            </div>); })}</div>)}
      </div>
      <div className="px-5 py-4 space-y-3">
        <div><p className="text-xs text-gray-500 font-medium mb-1.5">Referral Link</p><div className="flex items-center gap-2"><div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-[6px] text-sm text-gray-700 min-w-0"><Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" /><span className="truncate">{referralLink}</span></div><button onClick={() => { navigator.clipboard.writeText(referralLink).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:text-brand hover:bg-indigo-50 border border-gray-200 rounded-[6px] transition-colors shrink-0"><Copy className="w-3.5 h-3.5" />{copied ? 'Copied!' : 'Copy'}</button></div></div>
        <div className="flex items-center justify-end pt-1"><button onClick={() => setCardModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand hover:bg-indigo-50 border border-brand/20 rounded-[6px] transition-colors"><CreditCard className="w-3.5 h-3.5" />Order Referral Cards</button></div>
      </div>
      {cardModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/30" onClick={() => setCardModalOpen(false)} /><div className="relative bg-white rounded-[8px] shadow-2xl border border-gray-200 p-6 max-w-md w-full mx-4"><div className="flex items-center justify-between mb-5"><div><h3 className="text-lg font-bold text-gray-900">Order Referral Cards</h3><p className="text-xs text-gray-500 mt-0.5">Physical referral cards for {merchantName}</p></div><button onClick={() => setCardModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-[6px]"><X className="w-4 h-4 text-gray-500" /></button></div><div className="space-y-4"><div><label className="text-sm font-medium text-gray-700 block mb-2">Quantity</label><div className="grid grid-cols-4 gap-2">{CARD_QTY_OPTIONS.map(q => (<button key={q} onClick={() => setCardQty(q)} className={`py-2.5 rounded-[6px] text-sm font-medium border transition-colors ${cardQty === q ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 border-gray-200 hover:border-brand/30'}`}>{q}</button>))}</div></div><div><label className="text-sm font-medium text-gray-700 block mb-2">Ship To</label><div className="grid grid-cols-2 gap-2"><button onClick={() => setShipTo('merchant')} className={`flex items-center justify-center gap-2 py-2.5 rounded-[6px] text-sm font-medium border transition-colors ${shipTo === 'merchant' ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 border-gray-200'}`}><Truck className="w-4 h-4" />Merchant</button><button onClick={() => setShipTo('agent')} className={`flex items-center justify-center gap-2 py-2.5 rounded-[6px] text-sm font-medium border transition-colors ${shipTo === 'agent' ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 border-gray-200'}`}><Users className="w-4 h-4" />Agent</button></div></div></div><div className="flex items-center gap-3 mt-5"><button onClick={() => setCardModalOpen(false)} className="flex-1 px-4 py-2.5 bg-brand text-white text-sm font-semibold rounded-[6px] hover:bg-brand-hover transition-colors">Submit Order</button><button onClick={() => setCardModalOpen(false)} className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-[6px] hover:bg-gray-50 transition-colors">Cancel</button></div></div></div>)}
    </div>
  );
}

/* ─── Edit merchant modal ─── */
function EditMerchantModal({ merchant, onClose }: { merchant: Merchant; onClose: () => void }) {
  const [form, setForm] = useState({
    name: merchant.name,
    industry: merchant.industry,
    status: merchant.status,
    plan: merchant.plan,
    monthlyFee: String(merchant.monthlyFee),
    monthlyVolume: String(merchant.monthlyVolume),
    healthScore: String(merchant.healthScore),
    agent: merchant.agent,
    contactName: merchant.contactName || '',
    contactEmail: merchant.contactEmail || '',
    contactPhone: merchant.contactPhone || '',
    website: merchant.website || '',
    ein: merchant.ein || '',
    state: merchant.state || '',
  });
  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  const save = () => {
    merchantActions.update(merchant.id, {
      name: form.name.trim() || merchant.name,
      industry: form.industry.trim(),
      status: form.status as MerchantStatus,
      plan: form.plan as PlanTier,
      monthlyFee: Number(form.monthlyFee) || 0,
      monthlyVolume: Number(form.monthlyVolume) || 0,
      healthScore: Math.max(0, Math.min(100, Number(form.healthScore) || 0)),
      agent: form.agent.trim() || 'Unassigned',
      contactName: form.contactName.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      contactPhone: form.contactPhone.trim() || undefined,
      website: form.website.trim() || undefined,
      ein: form.ein.trim() || undefined,
      state: form.state.trim() || undefined,
    });
    onClose();
  };
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label className="text-xs text-gray-500 font-medium block mb-1">{label}</label>{children}</div>
  );
  const inputCls = 'w-full text-sm border border-gray-200 rounded-[6px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-[8px] shadow-2xl border border-gray-200 p-6 max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Edit Merchant</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-[6px]"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Business Name"><input className={inputCls} value={form.name} onChange={setField('name')} /></Field>
          <Field label="Industry"><input className={inputCls} value={form.industry} onChange={setField('industry')} /></Field>
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={setField('status')}>
              {['Active', 'Pending', 'Inactive'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Plan">
            <select className={inputCls} value={form.plan} onChange={setField('plan')}>
              {['Free', 'Growth', 'Custom'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Monthly Fee ($)"><input type="number" className={inputCls} value={form.monthlyFee} onChange={setField('monthlyFee')} /></Field>
          <Field label="Monthly Volume ($)"><input type="number" className={inputCls} value={form.monthlyVolume} onChange={setField('monthlyVolume')} /></Field>
          <Field label="Health Score (0–100)"><input type="number" className={inputCls} value={form.healthScore} onChange={setField('healthScore')} /></Field>
          <Field label="Assigned Agent"><input className={inputCls} value={form.agent} onChange={setField('agent')} /></Field>
          <Field label="Contact Name"><input className={inputCls} value={form.contactName} onChange={setField('contactName')} /></Field>
          <Field label="Contact Email"><input className={inputCls} value={form.contactEmail} onChange={setField('contactEmail')} /></Field>
          <Field label="Contact Phone"><input className={inputCls} value={form.contactPhone} onChange={setField('contactPhone')} /></Field>
          <Field label="Website"><input className={inputCls} value={form.website} onChange={setField('website')} /></Field>
          <Field label="EIN"><input className={inputCls} value={form.ein} onChange={setField('ein')} /></Field>
          <Field label="State"><input className={inputCls} value={form.state} onChange={setField('state')} /></Field>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <button onClick={save} className="flex-1 px-4 py-2.5 bg-brand text-white text-sm font-semibold rounded-[6px] hover:bg-brand-hover transition-colors">Save Changes</button>
          <button onClick={onClose} className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-[6px] hover:bg-gray-50 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function MerchantDetail() {
  const { navigate, currentPage } = useAppNavigate();
  const merchants = useMerchants();
  const { deals: capitalDeals } = useCapital();

  const urlParts = currentPage.split('/');
  const merchantId = decodeURIComponent(urlParts[2] || '');
  const [activeTab, setActiveTab] = useState(urlParts.length >= 4 && ['website', 'lens', 'outreach', 'payments', 'capital'].includes(urlParts[3]) ? (urlParts[3] === 'payments' || urlParts[3] === 'capital' ? 'overview' : urlParts[3]) : 'overview');
  const [editOpen, setEditOpen] = useState(false);

  /* ── Notes & Tasks (session-local working pad) ── */
  const [notes, setNotes] = useState<{ id: string; text: string; author: string; date: string }[]>([]);
  const [newNote, setNewNote] = useState('');
  const [tasks, setTasks] = useState<{ id: string; text: string; due: string; done: boolean }[]>([]);
  const [newTask, setNewTask] = useState('');

  const merchant = merchants.find(m => m.id === merchantId) || null;

  // Capital deals for this merchant, matched by business name.
  const merchantDeals: CapitalDeal[] = useMemo(
    () => (merchant ? capitalDeals.filter(d => d.merchant.toLowerCase() === merchant.name.toLowerCase()) : []),
    [capitalDeals, merchant],
  );
  const openDeals = merchantDeals.filter(d => d.status !== 'paid' && d.status !== 'approved');
  const mcaBalance = openDeals.reduce((s, d) => s + Math.max(0, d.totalOwed - d.collected), 0);
  const riskyDeals = openDeals.filter(d => d.status === 'default' || d.status === 'slow' || d.achStatus === 'nsf-retry' || d.achStatus === 'suspended');

  if (!merchant) {
    return (
      <div className="min-h-full bg-canvas flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-1">Merchant not found</p>
          <p className="text-sm text-gray-500 mb-4">No merchant with ID <span className="font-mono">{merchantId || '(none)'}</span>.</p>
          <button onClick={() => navigate('/merchants')} className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Merchants
          </button>
        </div>
      </div>
    );
  }

  const riskTone: 'green' | 'yellow' | 'red' =
    openDeals.some(d => d.status === 'default' || d.achStatus === 'suspended') || merchant.healthScore < 40 ? 'red'
    : riskyDeals.length > 0 || merchant.healthScore < 60 ? 'yellow'
    : 'green';

  const startMcaApplication = () => {
    underwritingActions.create({
      businessName: merchant.name,
      industry: merchant.industry,
      state: merchant.state || '',
      monthlyRevenue: merchant.monthlyVolume || undefined,
      source: 'Merchant CRM',
    });
    navigate('/underwriting');
  };

  const statusPill =
    merchant.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
    merchant.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
    'bg-gray-100 text-gray-500';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'outreach', label: 'Outreach' },
    { id: 'website', label: 'Website', active: merchant.products.website },
    { id: 'lens', label: 'Lens AI', active: merchant.products.lens },
  ];

  const products = [
    { name: 'Payments', active: merchant.products.processing, icon: <CreditCard className="w-3.5 h-3.5" />, color: 'bg-brand' },
    { name: 'Capital', active: merchant.products.capital, icon: <Banknote className="w-3.5 h-3.5" />, color: 'bg-emerald-500' },
    { name: 'Website', active: merchant.products.website, icon: <Globe className="w-3.5 h-3.5" />, color: 'bg-sky-500' },
    { name: 'Lens AI', active: merchant.products.lens, icon: <Brain className="w-3.5 h-3.5" />, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-full bg-canvas">
      {/* ═══ HEADER ═══ */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <button onClick={() => navigate('/merchants')} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"><ArrowLeft className="w-4 h-4" />Back to Merchants</button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-900">{merchant.name}</h1>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">{merchant.industry}</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusPill}`}>{merchant.status}</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border ${
                  riskTone === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                  riskTone === 'yellow' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${riskTone === 'green' ? 'bg-emerald-400' : riskTone === 'yellow' ? 'bg-amber-400' : 'bg-red-400'}`} />
                  {riskTone === 'green' ? 'Green' : riskTone === 'yellow' ? 'Yellow' : 'Red'} Risk
                </span>
              </div>
              <p className="text-sm text-gray-600">Assigned to: <span className="font-medium text-gray-900">{merchant.agent}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setEditOpen(true)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"><Edit className="w-4 h-4" />Edit</button>
              <button onClick={startMcaApplication} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />New MCA Application</button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="Monthly Volume" value={fmt(merchant.monthlyVolume)} subtitle="Processing volume" />
          <StatCard label="Active MCA Balance" value={fmt(mcaBalance)} subtitle={`Across ${openDeals.length} deal${openDeals.length !== 1 ? 's' : ''}`} />
          <HealthScoreCard score={merchant.healthScore} />
          <StatCard label="Plan Tier" value={merchant.plan} subtitle={merchant.monthlyFee > 0 ? `${fmt(merchant.monthlyFee)}/mo` : 'No subscription'} />
          <StatCard label="Capital Deployed" value={fmt(merchant.capitalDeployed || merchantDeals.reduce((s, d) => s + d.fundedAmt, 0))} subtitle={`${merchantDeals.length} lifetime deal${merchantDeals.length !== 1 ? 's' : ''}`} />
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-3 mb-6">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const isInactive = tab.active === false;
            return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-2 text-sm font-medium rounded-full border-2 transition-all flex items-center gap-2 ${isActive ? 'bg-brand/10 text-brand border-brand' : isInactive ? 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50 hover:border-gray-300' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>{tab.label}{tab.active !== undefined && <span className={`w-2 h-2 rounded-full ${isInactive ? 'bg-gray-300' : 'bg-emerald-400'}`} />}</button>);
          })}
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6">
              {/* Business Information */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900">Business Information</h2></div>
                <div className="px-5 py-2"><div className="grid grid-cols-2 gap-x-6">
                  <InfoField label="Business Name" value={merchant.name} />
                  <InfoField label="Industry" value={merchant.industry} />
                  <InfoField label="EIN" value={merchant.ein ? `**-***${merchant.ein.slice(-4)}` : ''} />
                  <InfoField label="State" value={merchant.state || ''} />
                  <InfoField label="Contact Name" value={merchant.contactName || ''} />
                  <InfoField label="Contact Email" value={merchant.contactEmail || ''} />
                  <InfoField label="Contact Phone" value={merchant.contactPhone || ''} />
                  <InfoField label="Website" value={merchant.website || ''} />
                </div></div>
                {merchant.notes && (
                  <div className="px-5 pb-4"><p className="text-xs text-gray-500 mb-1">Notes from onboarding</p><p className="text-sm text-gray-700 bg-gray-50 rounded-[6px] px-3 py-2">{merchant.notes}</p></div>
                )}
              </div>

              {/* Document Vault */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between"><h2 className="text-lg font-semibold text-gray-900">Document Vault</h2><button onClick={() => navigate('/documents')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Open Documents</button></div>
                <div className="px-5 py-8 text-center">
                  <FileText className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No documents on file for this merchant yet.</p>
                </div>
              </div>

              {/* ── Relationship Notes & Tasks ── */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-200"><div className="flex items-center gap-2"><StickyNote className="w-4 h-4 text-brand" /><h2 className="text-lg font-semibold text-gray-900">Notes & Tasks</h2></div></div>
                <div className="px-5 py-4 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Tasks</p>
                    {tasks.length === 0 && <p className="text-sm text-gray-400 mb-2">No open tasks.</p>}
                    <div className="space-y-2">{tasks.map(t => (
                      <div key={t.id} className="flex items-start gap-2.5 group">
                        <button onClick={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${t.done ? 'bg-brand border-brand' : 'border-gray-300 hover:border-brand'}`}>{t.done && <CheckCircle className="w-3 h-3 text-white" />}</button>
                        <div className="flex-1 min-w-0"><p className={`text-sm ${t.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{t.text}</p><div className="flex items-center gap-1.5 mt-0.5"><Calendar className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-400">{t.due}</span></div></div>
                        <button onClick={() => setTasks(p => p.filter(x => x.id !== t.id))} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"><Trash2 className="w-3 h-3 text-gray-400" /></button>
                      </div>
                    ))}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newTask.trim()) { setTasks(p => [...p, { id: `t-${Date.now()}`, text: newTask.trim(), due: 'No due date', done: false }]); setNewTask(''); } }} placeholder="Add a task..." className="flex-1 text-sm border border-gray-200 rounded-[6px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-gray-400" />
                      <button onClick={() => { if (newTask.trim()) { setTasks(p => [...p, { id: `t-${Date.now()}`, text: newTask.trim(), due: 'No due date', done: false }]); setNewTask(''); } }} className="px-3 py-1.5 bg-brand text-white text-xs font-medium rounded-[6px] hover:bg-indigo-700 transition-colors">Add</button>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Notes</p>
                    {notes.length === 0 && <p className="text-sm text-gray-400 mb-2">No notes yet.</p>}
                    <div className="space-y-3">{notes.map(n => (
                      <div key={n.id} className="bg-gray-50 rounded-[6px] px-3 py-2.5 group relative">
                        <p className="text-sm text-gray-800">{n.text}</p>
                        <div className="flex items-center gap-2 mt-1.5"><span className="text-xs text-gray-400">{n.author}</span><span className="text-xs text-gray-300">&bull;</span><span className="text-xs text-gray-400">{n.date}</span></div>
                        <button onClick={() => setNotes(p => p.filter(x => x.id !== n.id))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"><Trash2 className="w-3 h-3 text-gray-400" /></button>
                      </div>
                    ))}</div>
                    <div className="flex items-start gap-2 mt-2">
                      <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." rows={2} className="flex-1 text-sm border border-gray-200 rounded-[6px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-gray-400 resize-none" />
                      <button onClick={() => { if (newNote.trim()) { setNotes(p => [{ id: `n-${Date.now()}`, text: newNote.trim(), author: 'You', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }, ...p]); setNewNote(''); } }} className="px-3 py-1.5 bg-brand text-white text-xs font-medium rounded-[6px] hover:bg-indigo-700 transition-colors">Add</button>
                    </div>
                  </div>
                </div>
              </div>

              <BundlesAndReferralsCard merchantName={merchant.name} merchantId={merchant.id} />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cross-Product Risk Assessment */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2"><ShieldAlert className={`w-4 h-4 ${riskTone === 'green' ? 'text-emerald-500' : riskTone === 'yellow' ? 'text-amber-500' : 'text-red-500'}`} /><h3 className="text-sm font-semibold text-gray-700">Cross-Product Risk</h3></div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                    riskTone === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                    riskTone === 'yellow' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                    'bg-red-50 border-red-200 text-red-800'
                  }`}><span className={`w-2 h-2 rounded-full ${riskTone === 'green' ? 'bg-emerald-400' : riskTone === 'yellow' ? 'bg-amber-400' : 'bg-red-400'}`} />{riskTone === 'green' ? 'Green' : riskTone === 'yellow' ? 'Yellow' : 'Red'}</span>
                </div>
                <div className="px-5 py-4">
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-[6px] px-3 py-2">
                    <p className="font-medium text-gray-700 mb-1">Risk Factors</p>
                    <ul className="space-y-0.5">
                      <li className="flex items-center gap-1.5">
                        <span className={`w-1 h-1 rounded-full ${merchant.healthScore >= 60 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        Health score {merchant.healthScore}/100
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className={`w-1 h-1 rounded-full ${riskyDeals.length === 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {riskyDeals.length === 0 ? 'No delinquent capital positions' : `${riskyDeals.length} capital deal${riskyDeals.length > 1 ? 's' : ''} flagged (${riskyDeals.map(d => d.status === 'default' ? 'default' : d.achStatus === 'suspended' ? 'ACH suspended' : d.achStatus === 'nsf-retry' ? 'NSF' : 'slow pay').join(', ')})`}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className={`w-1 h-1 rounded-full ${openDeals.some(d => d.stackCount > 0) ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        {openDeals.some(d => d.stackCount > 0) ? 'Stacking detected on open deals' : 'No stacking detected'}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Product Adoption */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-200"><h3 className="text-sm font-semibold text-gray-700">Products</h3></div>
                <div className="px-5 py-4">
                  {products.map((item, i, arr) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 ${item.active ? item.color : 'bg-gray-300'}`}>{item.icon}</div>
                        {i < arr.length - 1 && <div className="w-px h-8 mt-1 bg-gray-200" />}
                      </div>
                      <div className="pt-0.5 pb-4"><div className="flex items-center gap-2"><p className={`text-sm font-medium ${item.active ? 'text-gray-900' : 'text-gray-400'}`}>{item.name}</p>{!item.active && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded">Inactive</span>}</div></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments Snapshot */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between"><div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-brand" /><h3 className="text-sm font-semibold text-gray-700">Payments Snapshot</h3></div><button onClick={() => navigate('/residuals')} className="text-xs text-brand hover:underline underline-offset-2 font-medium flex items-center gap-1">Full Residuals <ExternalLink className="w-3 h-3" /></button></div>
                <div className="px-5 py-4"><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-gray-500 mb-0.5">Monthly Volume</p><p className="text-lg font-bold text-gray-900">{fmt(merchant.monthlyVolume)}</p></div><div><p className="text-xs text-gray-500 mb-0.5">Subscription</p><p className="text-lg font-bold text-gray-900">{merchant.monthlyFee > 0 ? `${fmt(merchant.monthlyFee)}/mo` : '—'}</p></div></div></div>
              </div>

              {/* Capital Snapshot */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between"><div className="flex items-center gap-2"><Banknote className="w-4 h-4 text-brand" /><h3 className="text-sm font-semibold text-gray-700">Capital Snapshot</h3></div><button onClick={() => navigate('/capital')} className="text-xs text-brand hover:underline underline-offset-2 font-medium flex items-center gap-1">Full Capital <ExternalLink className="w-3 h-3" /></button></div>
                <div className="px-5 py-4">
                  <div className="grid grid-cols-2 gap-4 mb-3"><div><p className="text-xs text-gray-500 mb-0.5">Active Balance</p><p className="text-lg font-bold text-gray-900">{fmt(mcaBalance)}</p></div><div><p className="text-xs text-gray-500 mb-0.5">Active Deals</p><p className="text-lg font-bold text-gray-900">{openDeals.length}</p></div></div>
                  {openDeals.length > 0 ? (
                    <div className="space-y-2">{openDeals.map(d => {
                      const pct = d.totalOwed > 0 ? Math.round((d.collected / d.totalOwed) * 1000) / 10 : 0;
                      return (
                        <div key={d.id} className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate(`/deals/${d.id}`)}>
                          <span className="text-xs text-gray-500 w-28 shrink-0 group-hover:text-brand transition-colors">{d.id}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                          <span className="text-xs font-medium text-gray-700 w-10 text-right">{pct}%</span>
                        </div>
                      );
                    })}</div>
                  ) : (
                    <p className="text-sm text-gray-400">No active capital deals.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ OUTREACH TAB ═══ */}
        {activeTab === 'outreach' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Megaphone className="w-5 h-5 text-brand" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Send outreach, manage templates & campaigns</p>
                  <p className="text-xs text-gray-500 mt-0.5">Use the dedicated Outreach page for sends, automation rules, and template management</p>
                </div>
              </div>
              <button onClick={() => navigate('/outreach')} className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors flex items-center gap-1.5 shrink-0"><Send className="w-3.5 h-3.5" />Go to Outreach</button>
            </div>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900">Outreach History</h2><p className="text-xs text-gray-500 mt-1">Communications sent to {merchant.name}</p></div>
              <div className="px-5 py-10 text-center">
                <Megaphone className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No outreach sent to this merchant yet.</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ WEBSITE TAB ═══ */}
        {activeTab === 'website' && (
          <div className="space-y-6">
            {!merchant.products.website ? (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"><Globe className="w-8 h-8 text-gray-300" /></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Website Not Active</h3>
                  <p className="text-sm text-gray-500 mb-5 max-w-sm">This merchant hasn't activated a website yet.</p>
                  <button onClick={() => navigate('/outreach')} className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-brand-hover transition-colors">Send Website Offer</button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900">Site Overview</h2></div>
                <div className="px-5 py-4">
                  {merchant.website ? (
                    <a href={merchant.website.startsWith('http') ? merchant.website : `https://${merchant.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-info hover:underline underline-offset-2">{merchant.website} <ExternalLink className="w-3.5 h-3.5" /></a>
                  ) : (
                    <p className="text-sm text-gray-400">Website product is active, but no site URL is on file. Add one via Edit.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ LENS AI TAB ═══ */}
        {activeTab === 'lens' && (
          <div className="space-y-6">
            {!merchant.products.lens ? (
              <div className="bg-white rounded-lg border border-gray-200"><div className="py-16 flex flex-col items-center justify-center text-center px-6"><div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-4"><Brain className="w-7 h-7 text-purple-400" /></div><h3 className="text-lg font-semibold text-gray-900 mb-1">Lens AI Not Active</h3><p className="text-sm text-gray-500 mb-5 max-w-sm">Activate to unlock AI-powered insights.</p><button onClick={() => merchantActions.update(merchant.id, { products: { ...merchant.products, lens: true } })} className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-[6px] hover:bg-indigo-700 transition-colors">Activate Lens AI</button></div></div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between"><h2 className="text-lg font-semibold text-gray-900">Lens AI</h2><button onClick={() => navigate('/lens')} className="text-xs text-brand hover:underline font-medium flex items-center gap-1">Open Lens AI <ExternalLink className="w-3 h-3" /></button></div>
                <div className="px-5 py-10 text-center">
                  <Brain className="w-6 h-6 text-purple-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Lens AI is active for this merchant. Usage analytics will appear here once API activity is recorded.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {editOpen && <EditMerchantModal merchant={merchant} onClose={() => setEditOpen(false)} />}
    </div>
  );
}
