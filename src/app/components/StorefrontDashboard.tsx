import { useState } from 'react';
import { Globe, Eye, Search, Link2, Share2, ExternalLink, CheckCircle2, AlertCircle, TrendingUp, BarChart3, ArrowUpRight, MapPin, Phone, Clock, Star, Package, Plus, Filter, ChevronRight, AlertTriangle, Tag, Grid3X3 } from 'lucide-react';
import { useToast, ToastContainer } from './ui/Toast';
import { ImageWithFallback } from './figma/ImageWithFallback';
import imgPastrami from "figma:asset/6869fc1cbb14fbdef43ab7d018f08d3f611802d0.png";
import imgGardenBowl from "figma:asset/9db573e75c6af4e826f461240de62edfa7897976.png";
import imgColdBrew from "figma:asset/b1e4abff3f34876564c0a268a4e64406c0813755.png";

const SEO_METRICS = [
  { label: 'Google Ranking', value: '#4', sub: 'for "pastrami sandwich near me"', good: true },
  { label: 'Monthly Visitors', value: '3,840', sub: '+22% vs last month', good: true },
  { label: 'Page Speed', value: '94/100', sub: 'Mobile performance', good: true },
  { label: 'SEO Score', value: '87/100', sub: '3 issues to fix', good: false },
];

const SEO_CHECKLIST = [
  { label: 'Meta title optimized', done: true },
  { label: 'Meta description set', done: true },
  { label: 'Open Graph tags', done: true },
  { label: 'Schema markup (LocalBusiness)', done: true },
  { label: 'Image alt text (3 missing)', done: false },
  { label: 'Sitemap submitted', done: true },
  { label: 'SSL certificate', done: true },
  { label: 'Mobile responsive', done: true },
];

const SOCIAL_LINKS = [
  { platform: 'Instagram', handle: '@delt.deli', followers: '2.4K', connected: true, color: '#E1306C' },
  { platform: 'Facebook', handle: 'Delt Deli & Market', followers: '1.8K', connected: true, color: '#1877F2' },
  { platform: 'Google Business', handle: 'Delt Deli', followers: '312 reviews', connected: true, color: '#4285F4' },
  { platform: 'TikTok', handle: '—', followers: '—', connected: false, color: '#000000' },
  { platform: 'X (Twitter)', handle: '—', followers: '—', connected: false, color: '#1DA1F2' },
];

const CATEGORIES = [
  { name: 'Sandwiches', count: 12, revenue: '$18,420' },
  { name: 'Salads', count: 8, revenue: '$12,890' },
  { name: 'Drinks', count: 15, revenue: '$8,640' },
  { name: 'Sides', count: 6, revenue: '$4,210' },
  { name: 'Desserts', count: 5, revenue: '$3,780' },
];

const INVENTORY = [
  { name: 'Pastrami', sku: 'INV-001', stock: 48, min: 20, status: 'ok', category: 'Protein', cost: '$8.40/lb' },
  { name: 'Sourdough Bread', sku: 'INV-012', stock: 12, min: 30, status: 'low', category: 'Bakery', cost: '$3.20/loaf' },
  { name: 'Spring Mix', sku: 'INV-023', stock: 6, min: 15, status: 'critical', category: 'Produce', cost: '$4.50/bag' },
  { name: 'Swiss Cheese', sku: 'INV-034', stock: 34, min: 10, status: 'ok', category: 'Dairy', cost: '$6.80/lb' },
  { name: 'Cold Brew Concentrate', sku: 'INV-045', stock: 8, min: 10, status: 'low', category: 'Beverage', cost: '$12.00/gal' },
  { name: 'Avocado', sku: 'INV-056', stock: 22, min: 15, status: 'ok', category: 'Produce', cost: '$2.10/ea' },
  { name: 'Chicken Breast', sku: 'INV-067', stock: 3, min: 12, status: 'critical', category: 'Protein', cost: '$7.20/lb' },
  { name: 'Olive Oil', sku: 'INV-078', stock: 18, min: 5, status: 'ok', category: 'Pantry', cost: '$14.00/btl' },
];

const MENU_ITEMS = [
  { name: 'Pastrami Sandwich', price: '$18.00', modifiers: 4, active: true },
  { name: 'Spinach Wrap', price: '$15.00', modifiers: 3, active: true },
  { name: 'Steak Salad', price: '$21.00', modifiers: 5, active: true },
  { name: 'Garden Bowl', price: '$14.00', modifiers: 2, active: true },
  { name: 'Cold Brew Coffee', price: '$5.00', modifiers: 1, active: true },
  { name: 'Seasonal Special', price: '$22.00', modifiers: 0, active: false },
];

export function StorefrontDashboard() {
  const [tab, setTab] = useState<'website' | 'seo' | 'social' | 'inventory' | 'menu' | 'categories'>('website');
  const [socialLinks, setSocialLinks] = useState(SOCIAL_LINKS);
  const [seoItems, setSeoItems] = useState(SEO_CHECKLIST);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  return (
    <div className="min-h-screen bg-white">
      {/* Header section with subtle gray background */}
      <div style={{ background: '#F7F7F8' }}>
        <div className="max-w-[1040px] mx-auto px-8 pt-8 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[#111] mb-1" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Storefront</h1>
              <p className="text-sm text-[#999]">Website, SEO, social links, inventory, and menu management</p>
            </div>
            <button onClick={() => addToast('info', 'Site preview', 'Opening deltdeli.com preview...')} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#4945FF] text-white text-sm hover:bg-[#3730FF] transition-colors" style={{ fontWeight: 600 }}>
              <Eye className="w-4 h-4" /> Preview Site
            </button>
          </div>
        </div>
      </div>

      {/* Content on white background */}
      <div className="max-w-[1040px] mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-[#E8E8E8]">
          {([
            { id: 'website' as const, label: 'Website & Domain', icon: Globe },
            { id: 'seo' as const, label: 'SEO', icon: Search },
            { id: 'social' as const, label: 'Social Links', icon: Share2 },
            { id: 'inventory' as const, label: 'Inventory', icon: Package },
            { id: 'menu' as const, label: 'Menu', icon: Grid3X3 },
            { id: 'categories' as const, label: 'Categories', icon: Tag },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${tab === t.id ? 'border-[#4945FF] text-[#111]' : 'border-transparent text-[#999] hover:text-[#666]'}`}
              style={{ fontWeight: tab === t.id ? 600 : 400 }}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Website Tab */}
        {tab === 'website' && (
          <div className="space-y-6">
            {/* Domain */}
            <div className="border border-[#E8E8E8] rounded-xl p-6">
              <h3 className="text-base text-[#111] mb-4" style={{ fontWeight: 700 }}>Domain</h3>
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#FAFAFA]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#111]" style={{ fontWeight: 600 }}>deltdeli.com</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981]" style={{ fontWeight: 600 }}>Active</span>
                    </div>
                    <span className="text-xs text-[#999]">SSL secured · Renews Apr 12, 2027</span>
                  </div>
                </div>
                <button onClick={() => addToast('info', 'Domain settings', 'DNS management panel coming soon')} className="text-sm text-[#4945FF] hover:underline" style={{ fontWeight: 500 }}>Manage</button>
              </div>
            </div>

            {/* Website Preview */}
            <div className="border border-[#E8E8E8] rounded-xl p-6">
              <h3 className="text-base text-[#111] mb-4" style={{ fontWeight: 700 }}>Website</h3>
              <div className="rounded-xl border border-[#E8E8E8] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FAFAFA] border-b border-[#E8E8E8]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[11px] text-[#999] bg-white px-3 py-0.5 rounded border border-[#E8E8E8]">deltdeli.com</span>
                  </div>
                </div>
                {/* ── Hero Section ── */}
                <div className="relative overflow-hidden" style={{ height: 220 }}>
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1758612798971-a8adb6cba7eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXN0YXVyYW50JTIwaW50ZXJpb3IlMjB3YXJtJTIwbGlnaHRpbmd8ZW58MXx8fHwxNzcyNjU2OTczfDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Restaurant interior"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#041E42]/80 via-[#041E42]/70 to-[#041E42]/90" />
                  <div className="relative flex items-center justify-between px-6 pt-4">
                    <span className="text-white text-xs tracking-[0.2em] uppercase" style={{ fontWeight: 700 }}>Delt Deli</span>
                    <div className="flex items-center gap-4">
                      {['Menu', 'Catering', 'About', 'Contact'].map(l => (
                        <span key={l} className="text-white/70 text-[10px] hover:text-white cursor-pointer transition-colors" style={{ fontWeight: 500 }}>{l}</span>
                      ))}
                    </div>
                  </div>
                  <div className="relative text-center mt-8 px-6">
                    <h2 className="text-white mb-2" style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Delt Deli & Market</h2>
                    <p className="text-white/60 text-xs mb-4">Fresh ingredients, bold flavors, served daily in the heart of NYC</p>
                    <div className="flex items-center justify-center gap-2.5">
                      <button className="px-5 py-1.5 rounded-full bg-[#4945FF] text-white text-[11px]" style={{ fontWeight: 600 }}>Order Now</button>
                      <button className="px-5 py-1.5 rounded-full border border-white/30 text-white text-[11px] backdrop-blur-sm" style={{ fontWeight: 500 }}>View Menu</button>
                    </div>
                  </div>
                </div>
                {/* ── Featured Items ── */}
                <div className="px-5 py-5 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] text-[#111]" style={{ fontWeight: 700 }}>Popular Items</h3>
                    <span className="text-[10px] text-[#4945FF] cursor-pointer" style={{ fontWeight: 500 }}>See all</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Pastrami Sandwich', price: '$18', img: imgPastrami },
                      { name: 'Garden Bowl', price: '$14', img: imgGardenBowl },
                      { name: 'Cold Brew', price: '$5', img: imgColdBrew },
                    ].map((item, i) => (
                      <div key={i} className="group cursor-pointer">
                        <div className="rounded-lg overflow-hidden mb-1.5" style={{ aspectRatio: '4/3' }}>
                          <ImageWithFallback src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="text-[10px] text-[#333] truncate" style={{ fontWeight: 600 }}>{item.name}</div>
                        <div className="text-[10px] text-[#999]">{item.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* ── Info Bar ── */}
                <div className="px-5 py-4 bg-[#FAFAFA] border-t border-[#F0F0F0]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#666]">
                        <MapPin className="w-3 h-3 text-[#999]" />
                        <span>142 Sullivan St, NYC</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#666]">
                        <Clock className="w-3 h-3 text-[#999]" />
                        <span>7am – 9pm Daily</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#666]">
                        <Phone className="w-3 h-3 text-[#999]" />
                        <span>(212) 555-0187</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className="w-3 h-3 text-[#F59E0B]" fill={s <= 4 ? '#F59E0B' : 'none'} />
                      ))}
                      <span className="text-[10px] text-[#999] ml-1" style={{ fontWeight: 500 }}>4.8 (312)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button onClick={() => addToast('info', 'Website editor', 'Drag-and-drop editor coming soon')} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E8E8E8] text-sm text-[#333] hover:bg-[#F5F5F5] transition-colors" style={{ fontWeight: 500 }}>
                  Edit Website
                </button>
                <button onClick={() => addToast('success', 'Opening site', 'Redirecting to deltdeli.com')} className="flex items-center gap-2 text-sm text-[#4945FF] hover:underline" style={{ fontWeight: 500 }}>
                  <ExternalLink className="w-3.5 h-3.5" /> Visit site
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {tab === 'seo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {SEO_METRICS.map((m, i) => (
                <div key={i} className="border border-[#E8E8E8] rounded-xl p-5">
                  <span className="text-xs text-[#999] block mb-2" style={{ fontWeight: 500 }}>{m.label}</span>
                  <div className="text-2xl text-[#111]" style={{ fontWeight: 700 }}>{m.value}</div>
                  <span className={`text-[11px] ${m.good ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} style={{ fontWeight: 500 }}>{m.sub}</span>
                </div>
              ))}
            </div>
            <div className="border border-[#E8E8E8] rounded-xl p-6">
              <h3 className="text-base text-[#111] mb-4" style={{ fontWeight: 700 }}>SEO Checklist</h3>
              <div className="grid grid-cols-2 gap-2">
                {seoItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSeoItems(prev => prev.map((si, j) => j === i ? { ...si, done: !si.done } : si));
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-[#FAFAFA] transition-colors cursor-pointer w-full text-left"
                  >
                    {item.done ? <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />}
                    <span className={`text-sm ${item.done ? 'text-[#666]' : 'text-[#333]'}`} style={{ fontWeight: item.done ? 400 : 500 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Social Tab */}
        {tab === 'social' && (
          <div className="space-y-4">
            {socialLinks.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-5 border border-[#E8E8E8] rounded-xl hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                    <Link2 className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <div className="text-sm text-[#111]" style={{ fontWeight: 600 }}>{s.platform}</div>
                    <span className="text-xs text-[#999]">{s.handle}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {s.connected && <span className="text-sm text-[#666]">{s.followers}</span>}
                  <button
                    onClick={() => {
                      if (s.connected) {
                        addToast('info', `${s.platform}`, `Managing ${s.platform} connection`);
                      } else {
                        setSocialLinks(prev => prev.map((sl, j) => j === i ? { ...sl, connected: true, handle: `@delt.deli`, followers: '0' } : sl));
                        addToast('success', `${s.platform} connected`, `Your ${s.platform} account is now linked`);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${s.connected ? 'border border-[#E8E8E8] text-[#333] hover:bg-[#F5F5F5]' : 'bg-[#4945FF] text-white hover:bg-[#3730FF]'}`} style={{ fontWeight: 600 }}>
                    {s.connected ? 'Manage' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inventory Tab */}
        {tab === 'inventory' && (
          <div>
            {/* Low stock alert */}
            {INVENTORY.filter(i => i.status !== 'ok').length > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/20 mb-6">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                <span className="text-sm text-[#92400E]" style={{ fontWeight: 500 }}>{INVENTORY.filter(i => i.status !== 'ok').length} items need restocking</span>
              </div>
            )}
            <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_90px_80px_70px_90px_80px] gap-2 px-6 py-3 bg-[#FAFAFA] border-b border-[#E8E8E8] text-[10px] text-[#999]" style={{ fontWeight: 600 }}>
                <span>ITEM</span><span>SKU</span><span className="text-right">STOCK</span><span className="text-right">MIN</span><span className="text-right">COST</span><span className="text-right">STATUS</span>
              </div>
              {INVENTORY.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px_80px_70px_90px_80px] gap-2 px-6 py-3.5 border-b border-[#F0F0F0] items-center hover:bg-[#FAFAFA] transition-colors cursor-pointer">
                  <div>
                    <div className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{item.name}</div>
                    <div className="text-[10px] text-[#999]">{item.category}</div>
                  </div>
                  <span className="text-xs text-[#999] font-mono">{item.sku}</span>
                  <span className={`text-sm text-right ${item.status === 'critical' ? 'text-[#EF4444]' : item.status === 'low' ? 'text-[#F59E0B]' : 'text-[#333]'}`} style={{ fontWeight: 600 }}>{item.stock}</span>
                  <span className="text-xs text-[#999] text-right">{item.min}</span>
                  <span className="text-xs text-[#666] text-right">{item.cost}</span>
                  <div className="flex justify-end">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.status === 'critical' ? 'bg-[#FEE2E2] text-[#EF4444]' : item.status === 'low' ? 'bg-[#FEF3C7] text-[#F59E0B]' : 'bg-[#ECFDF5] text-[#10B981]'}`} style={{ fontWeight: 600 }}>
                      {item.status === 'critical' ? 'Critical' : item.status === 'low' ? 'Low' : 'In Stock'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {tab === 'menu' && (
          <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_90px_90px_80px_40px] gap-2 px-6 py-3 bg-[#FAFAFA] border-b border-[#E8E8E8] text-[10px] text-[#999]" style={{ fontWeight: 600 }}>
              <span>NAME</span><span className="text-right">PRICE</span><span className="text-right">MODIFIERS</span><span className="text-right">STATUS</span><span></span>
            </div>
            {MENU_ITEMS.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_90px_90px_80px_40px] gap-2 px-6 py-3.5 border-b border-[#F0F0F0] items-center hover:bg-[#FAFAFA] transition-colors cursor-pointer">
                <span className="text-sm text-[#333]" style={{ fontWeight: 500 }}>{item.name}</span>
                <span className="text-sm text-[#333] text-right" style={{ fontWeight: 600 }}>{item.price}</span>
                <span className="text-xs text-[#999] text-right">{item.modifiers} options</span>
                <div className="flex justify-end">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.active ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#F5F5F5] text-[#999]'}`} style={{ fontWeight: 600 }}>
                    {item.active ? 'Active' : 'Draft'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#CCC]" />
              </div>
            ))}
          </div>
        )}

        {/* Categories Tab */}
        {tab === 'categories' && (
          <div className="grid grid-cols-3 gap-4">
            {CATEGORIES.map((cat, i) => (
              <div key={i} className="border border-[#E8E8E8] rounded-xl p-5 hover:shadow-sm transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4945FF]/8 flex items-center justify-center">
                    <Grid3X3 className="w-5 h-5 text-[#4945FF]" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#CCC] group-hover:text-[#4945FF] transition-colors" />
                </div>
                <h3 className="text-sm text-[#111] mb-0.5" style={{ fontWeight: 600 }}>{cat.name}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#999]">{cat.count} items</span>
                  <span className="text-xs text-[#666]" style={{ fontWeight: 600 }}>{cat.revenue}</span>
                </div>
              </div>
            ))}
            <button onClick={() => addToast('success', 'Category created', 'New category added')} className="border-2 border-dashed border-[#E8E8E8] rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-[#999] hover:text-[#4945FF] hover:border-[#4945FF]/30 transition-all cursor-pointer">
              <Plus className="w-5 h-5" />
              <span className="text-xs" style={{ fontWeight: 500 }}>Add Category</span>
            </button>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}