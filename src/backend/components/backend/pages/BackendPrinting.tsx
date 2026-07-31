import React, { useState, useMemo } from 'react';
import {
  Printer, Search, Plus, ExternalLink, Clock, Package, Truck,
  CheckCircle, X, FileImage, DollarSign, Layers, Flag, Shirt,
  Car, PanelTop, Sticker, Presentation, FileText,
} from 'lucide-react';

// ── Types ──
type OrderStatus = 'quote' | 'approved' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
type ArtworkStatus = 'pending' | 'received' | 'revision' | 'approved';

interface PrintOrder {
  id: string;
  merchantId: string;
  merchant: string;
  category: string;
  item: string;
  quantity: number;
  status: OrderStatus;
  artwork: ArtworkStatus;
  partnerCost: number;
  total: number;
  agent: string;
  orderedDate: string;
  dueDate: string;
  deliveredDate?: string;
  trackingNumber?: string;
  notes?: string;
}

// ── Fulfillment partner ──
const PARTNER = {
  name: 'Tinta Group',
  url: 'https://www.tintagroup.com/#service',
  blurb: 'Large-format print and visual solutions partner',
};

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; label: string }> = {
  quote: { color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', label: 'Quote' },
  approved: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'Approved' },
  in_production: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'In Production' },
  shipped: { color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', label: 'Shipped' },
  delivered: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Delivered' },
  cancelled: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Cancelled' },
};

const ARTWORK_CONFIG: Record<ArtworkStatus, { color: string; bg: string; label: string }> = {
  pending: { color: 'text-gray-500', bg: 'bg-gray-100', label: 'Awaiting art' },
  received: { color: 'text-blue-700', bg: 'bg-blue-50', label: 'Art received' },
  revision: { color: 'text-amber-700', bg: 'bg-amber-50', label: 'Revision' },
  approved: { color: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Art approved' },
};

// ── Product catalog — what merchants can order through the partner. This is
//    the offering itself, not order history, so it stays populated. ──
interface CatalogCategory {
  key: string;
  label: string;
  icon: React.ElementType;
  blurb: string;
  items: string[];
}

const PRODUCT_CATALOG: CatalogCategory[] = [
  {
    key: 'signage', label: 'Signage', icon: PanelTop,
    blurb: 'Storefront and interior identity',
    items: ['Storefront channel letters', 'Monument & pylon signs', 'Window graphics', 'A-frame / sidewalk signs', 'ADA & wayfinding', 'Menu boards'],
  },
  {
    key: 'banners', label: 'Banners', icon: Layers,
    blurb: 'Vinyl and fabric large format',
    items: ['Vinyl banners', 'Mesh banners', 'Step & repeat backdrops', 'Pole banners', 'Retractable banner stands'],
  },
  {
    key: 'flags', label: 'Flags', icon: Flag,
    blurb: 'Outdoor attention drivers',
    items: ['Feather flags', 'Teardrop flags', 'Blade flags', 'Flagpole flags', 'Hardware & bases'],
  },
  {
    key: 'merch', label: 'Merchandise & Apparel', icon: Shirt,
    blurb: 'Branded staff and giveaway goods',
    items: ['T-shirts & polos', 'Hats & caps', 'Aprons & uniforms', 'Tote bags', 'Drinkware', 'Promotional items'],
  },
  {
    key: 'vehicle', label: 'Vehicle Graphics', icon: Car,
    blurb: 'Fleet and mobile branding',
    items: ['Full vehicle wraps', 'Partial wraps', 'Door decals & lettering', 'Magnetic signs', 'Window perf'],
  },
  {
    key: 'events', label: 'Events & Trade Show', icon: Presentation,
    blurb: 'Booth and activation builds',
    items: ['Pop-up displays', 'Table throws & runners', 'Backdrops', 'Modular booth systems', 'Event signage packages'],
  },
  {
    key: 'collateral', label: 'Print Collateral', icon: FileText,
    blurb: 'Everyday merchant printing',
    items: ['Business cards', 'Flyers & brochures', 'Menus', 'Letterhead & envelopes', 'Presentation folders', 'Rack cards'],
  },
  {
    key: 'decals', label: 'Stickers & Decals', icon: Sticker,
    blurb: 'Surface and floor applications',
    items: ['Die-cut stickers', 'Window decals', 'Floor graphics', 'Wall murals', 'Product labels'],
  },
];

const ORDERS: PrintOrder[] = [];

const fmt = (n: number) => `$${n.toLocaleString()}`;

// ── Order Detail Panel ──
function OrderDetailPanel({ order, onClose }: { order: PrintOrder; onClose: () => void }) {
  const scfg = STATUS_CONFIG[order.status];
  const acfg = ARTWORK_CONFIG[order.artwork];
  const margin = order.total - order.partnerCost;
  const marginPct = order.total > 0 ? (margin / order.total) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-xl bg-white shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">{order.item}</h2>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${scfg.bg} ${scfg.color}`}>{scfg.label}</span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">{order.id} &middot; {order.merchant}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-[6px]">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Order Total', value: fmt(order.total) },
              { label: 'Partner Cost', value: fmt(order.partnerCost) },
              { label: 'Margin', value: `${fmt(margin)} (${marginPct.toFixed(0)}%)` },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-[8px] p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">{s.label}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="border border-gray-200 rounded-[8px] divide-y divide-gray-100">
            {[
              { label: 'Category', value: order.category },
              { label: 'Quantity', value: order.quantity.toLocaleString() },
              { label: 'Artwork', value: acfg.label },
              { label: 'Agent', value: order.agent },
              { label: 'Ordered', value: order.orderedDate },
              { label: 'Due', value: order.dueDate },
              { label: 'Delivered', value: order.deliveredDate || '—' },
              { label: 'Tracking', value: order.trackingNumber || '—' },
              { label: 'Fulfilled by', value: PARTNER.name },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs text-gray-500">{r.label}</span>
                <span className="text-xs font-medium text-gray-900">{r.value}</span>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="bg-gray-50 rounded-[8px] p-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">Notes</p>
              <p className="text-xs text-gray-700 leading-relaxed">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex items-center gap-2">
          <button className="flex-1 px-4 py-2 bg-brand text-white text-xs font-medium rounded-[6px] hover:bg-brand-hover">
            Update Status
          </button>
          <button className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-medium rounded-[6px] hover:bg-gray-50">
            Upload Artwork
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──
export function BackendPrinting() {
  const [tab, setTab] = useState<'orders' | 'catalog'>('orders');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return ORDERS.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return o.merchant.toLowerCase().includes(q) || o.item.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, statusFilter]);

  const activeOrder = ORDERS.find(o => o.id === selectedOrder);
  const openOrders = ORDERS.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
  const inProduction = ORDERS.filter(o => o.status === 'in_production').length;
  const printRevenue = ORDERS.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const printCost = ORDERS.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.partnerCost, 0);
  const avgMargin = printRevenue > 0 ? ((printRevenue - printCost) / printRevenue) * 100 : 0;
  const catalogItemCount = PRODUCT_CATALOG.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-sm">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Signage, banners, flags, and branded merchandise for merchants</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Fulfilled by{' '}
              <a href={PARTNER.url} target="_blank" rel="noreferrer" className="text-brand hover:underline inline-flex items-center gap-0.5">
                {PARTNER.name} <ExternalLink className="w-3 h-3" />
              </a>
              {' '}&middot; {PARTNER.blurb}
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-xs font-medium rounded-[6px] hover:bg-brand-hover">
          <Plus className="w-3.5 h-3.5" /> New Print Order
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Open Orders', value: openOrders, sub: `of ${ORDERS.length} total`, color: 'border-t-brand', icon: Package },
          { label: 'In Production', value: inProduction, sub: 'with the partner', color: 'border-t-amber-500', icon: Printer },
          { label: 'Print Revenue', value: fmt(printRevenue), sub: 'all orders', color: 'border-t-emerald-500', icon: DollarSign },
          { label: 'Avg Margin', value: `${avgMargin.toFixed(1)}%`, sub: 'over partner cost', color: 'border-t-blue-500', icon: Truck },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className={`bg-white rounded-[8px] border border-gray-200 border-t-[3px] ${kpi.color} px-4 py-3`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {([
          { key: 'orders' as const, label: 'Orders' },
          { key: 'catalog' as const, label: `Product Catalog (${catalogItemCount})` },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px] ${
              tab === t.key ? 'text-brand border-brand' : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' ? (
        <>
          {/* Filters */}
          <div className="bg-white rounded-[8px] border border-gray-200 p-4 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-[6px] text-xs focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {(['all', 'quote', 'approved', 'in_production', 'shipped', 'delivered', 'cancelled'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1.5 rounded-[6px] text-[10px] font-semibold border whitespace-nowrap transition-colors ${
                    statusFilter === s
                      ? (s === 'all' ? 'bg-brand/5 text-brand border-brand/20' : `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color}`)
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}>{s === 'all' ? 'All' : STATUS_CONFIG[s].label}</button>
              ))}
            </div>
          </div>

          {/* Orders table */}
          <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Order</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Merchant</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Product</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Qty</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Artwork</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Total</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Margin</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(o => {
                    const scfg = STATUS_CONFIG[o.status];
                    const acfg = ARTWORK_CONFIG[o.artwork];
                    const margin = o.total - o.partnerCost;
                    return (
                      <tr key={o.id} onClick={() => setSelectedOrder(o.id)} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
                        <td className="px-4 py-3 text-[11px] font-mono text-gray-400">{o.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{o.merchant}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{o.item}</p>
                          <p className="text-[10px] text-gray-400">{o.category}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right tabular-nums">{o.quantity.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${acfg.bg} ${acfg.color}`}>
                            <FileImage className="w-3 h-3" />{acfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${scfg.bg} ${scfg.color}`}>{scfg.label}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right tabular-nums">{fmt(o.total)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-emerald-600 text-right tabular-nums">{fmt(margin)}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 text-gray-400" />{o.dueDate}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                        No print orders yet — merchant signage, banner, and merch orders will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Catalog */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRODUCT_CATALOG.map(cat => {
            const Icon = cat.icon;
            return (
              <div key={cat.key} className="bg-white rounded-[8px] border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-[8px] bg-brand/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-brand" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{cat.label}</h3>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">{cat.blurb}</p>
                <ul className="space-y-1.5">
                  {cat.items.map(item => (
                    <li key={item} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <CheckCircle className="w-3 h-3 text-gray-300 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && activeOrder && <OrderDetailPanel order={activeOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}
