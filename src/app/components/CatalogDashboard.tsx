import { useState } from 'react';
import { Package, Search, Plus, Filter, ChevronRight, AlertTriangle, Tag, Grid3X3 } from 'lucide-react';
import { useToast, ToastContainer } from './ui/Toast';

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

const SERVICES = [
  { name: 'Pastrami Sandwich', price: '$18.00', modifiers: 4, active: true },
  { name: 'Spinach Wrap', price: '$15.00', modifiers: 3, active: true },
  { name: 'Steak Salad', price: '$21.00', modifiers: 5, active: true },
  { name: 'Garden Bowl', price: '$14.00', modifiers: 2, active: true },
  { name: 'Cold Brew Coffee', price: '$5.00', modifiers: 1, active: true },
  { name: 'Seasonal Special', price: '$22.00', modifiers: 0, active: false },
];

export function CatalogDashboard() {
  const [tab, setTab] = useState<'inventory' | 'menu' | 'categories'>('inventory');
  const [searchVal, setSearchVal] = useState('');
  const { toasts, addToast, removeToast } = useToast();

  const lowStockCount = INVENTORY.filter(i => i.status !== 'ok').length;
  const filteredInventory = INVENTORY.filter(i => i.name.toLowerCase().includes(searchVal.toLowerCase()));
  const filteredMenu = SERVICES.filter(i => i.name.toLowerCase().includes(searchVal.toLowerCase()));

  return (
    <div className="min-h-screen bg-white">
      {/* Header section with subtle gray background */}
      <div style={{ background: '#F7F7F8' }}>
        <div className="max-w-[1040px] mx-auto px-8 pt-8 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[#111] mb-1" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Catalog</h1>
              <p className="text-sm text-[#999]">Manage inventory, menu items, and categories</p>
            </div>
            <button onClick={() => addToast('success', 'Item added', 'New item created in catalog')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4945FF] text-white text-sm hover:bg-[#3730FF] transition-colors" style={{ fontWeight: 600 }}>
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {/* Low stock alert */}
          {lowStockCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/20 mb-6">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
              <span className="text-sm text-[#92400E]" style={{ fontWeight: 500 }}>{lowStockCount} items need restocking</span>
              <button onClick={() => setSearchVal(INVENTORY.filter(i => i.status !== 'ok').map(i => i.name).join('|').replace(/\|/g, ' '))} className="ml-auto text-xs text-[#92400E] hover:underline" style={{ fontWeight: 600 }}>View all</button>
            </div>
          )}
        </div>
      </div>

      {/* Content on white background */}
      <div className="max-w-[1040px] mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-[#E8E8E8]">
          {([
            { id: 'inventory' as const, label: 'Inventory', icon: Package },
            { id: 'menu' as const, label: 'Menu / Services', icon: Tag },
            { id: 'categories' as const, label: 'Categories', icon: Grid3X3 },
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

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5F5] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-[#999]" />
            <input placeholder="Search items..." className="bg-transparent border-none outline-none text-sm text-[#333] placeholder-[#999] flex-1" value={searchVal} onChange={e => setSearchVal(e.target.value)} />
          </div>
          <button onClick={() => addToast('info', 'Filter', 'No additional filters available')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E8E8E8] text-sm text-[#666] hover:bg-[#F5F5F5] transition-colors">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>

        {/* Inventory Tab */}
        {tab === 'inventory' && (
          <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_90px_80px_70px_90px_80px] gap-2 px-6 py-3 bg-[#FAFAFA] border-b border-[#E8E8E8] text-[10px] text-[#999]" style={{ fontWeight: 600 }}>
              <span>ITEM</span><span>SKU</span><span className="text-right">STOCK</span><span className="text-right">MIN</span><span className="text-right">COST</span><span className="text-right">STATUS</span>
            </div>
            {filteredInventory.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_90px_80px_70px_90px_80px] gap-2 px-6 py-3.5 border-b border-[#F0F0F0] items-center hover:bg-[#FAFAFA] transition-colors cursor-pointer group">
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
        )}

        {/* Menu Tab */}
        {tab === 'menu' && (
          <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_90px_90px_80px_40px] gap-2 px-6 py-3 bg-[#FAFAFA] border-b border-[#E8E8E8] text-[10px] text-[#999]" style={{ fontWeight: 600 }}>
              <span>NAME</span><span className="text-right">PRICE</span><span className="text-right">MODIFIERS</span><span className="text-right">STATUS</span><span></span>
            </div>
            {filteredMenu.map((item, i) => (
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
            <button onClick={() => addToast('success', 'Category created', 'New category added')} className="border-2 border-dashed border-[#E8E8E8] rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-[#999] hover:text-[#4945FF] hover:border-[#4945FF]/30 transition-all">
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