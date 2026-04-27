import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ChevronDown,
  MoreHorizontal,
  Pin,
  PinOff,
  X,
  LayoutGrid,
  List,
  ArrowUp,
  RefreshCw,
  Sparkles,
  MessageSquare,
  ExternalLink,
  Lock,
} from 'lucide-react';
import type { PinnedChatData } from '../pages/SandboxPage';
import lensOrbIcon from 'figma:asset/2bb89bf099aa846cbae2e04e01814e59ffa47260.png';
import { LockedWidget } from './ui/LockedWidget';

/* ════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════ */

function AnimatedNumber({ value, prefix = '$', duration = 1200 }: { value: number; prefix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    const step = (ts: number) => {
      if (ref.current === null) ref.current = ts;
      const progress = Math.min((ts - ref.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(ease * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    ref.current = null;
    requestAnimationFrame(step);
  }, [value, duration]);
  return <span>{prefix}{display.toLocaleString()}</span>;
}

/* ════════════════════════════════════════════════════════════
   PINNED DATA TYPES & DEFAULTS
   ════════════════════════════════════════════════════════════ */
interface PinnedItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'chart-bar' | 'chart-line' | 'table' | 'metric';
  pinned: boolean;
  lastUpdated: string;
  data?: any;
}

const DEFAULT_PINNABLE_ITEMS: PinnedItem[] = [
  {
    id: 'weekly-sales-loc',
    title: 'Weekly Sales by Location',
    subtitle: 'Last 4 months',
    type: 'chart-bar',
    pinned: true,
    lastUpdated: '2 min ago',
    data: { bars: [42, 48, 45, 50, 38, 52, 55, 44, 47, 53, 49, 56] },
  },
  {
    id: 'top-customers',
    title: 'Customers with spend over $500',
    subtitle: 'Last 60 days',
    type: 'table',
    pinned: true,
    lastUpdated: '5 min ago',
    data: {
      rows: [
        { name: 'Aaron Dias-Melim', email: 'aaron@gmail.com', loc: 'M' },
        { name: 'Camille Vergara', email: 'vergara_cml@gmail.com', loc: 'A' },
        { name: 'Jake Anderson', email: 'jake2003@gmail.com', loc: 'A' },
        { name: 'Joan Grau', email: 'jgrau_25@gmail.com', loc: 'A' },
        { name: 'Elisa Rizzo', email: 'rizzo_elisa@yahoo.com', loc: 'A' },
      ],
    },
  },
  {
    id: 'weekly-modifiers',
    title: 'Weekly Sales of Top Modifier',
    subtitle: 'Last 4 months',
    type: 'chart-line',
    pinned: true,
    lastUpdated: '3 min ago',
    data: { points: [800, 950, 700, 1200, 1050, 900, 1100, 850, 1300, 1000, 750, 1150] },
  },
  {
    id: 'best-selling',
    title: 'Best-selling items this month',
    subtitle: 'Last 12 months',
    type: 'table',
    pinned: false,
    lastUpdated: '8 min ago',
    data: {
      items: [
        { name: 'Pastrami san...', units: 118, gross: '2,142.00', net: '1,820.70' },
        { name: 'Spinach wrap', units: 102, gross: '1,953.00', net: '1,718.64' },
        { name: 'Steak salad', units: 93, gross: '1,152.00', net: '1,025.28' },
        { name: 'Garden salad', units: 64, gross: '944.00', net: '708.00' },
      ],
    },
  },
  {
    id: 'weekly-orders',
    title: 'Weekly Orders with Customization',
    subtitle: 'Last 4 months',
    type: 'chart-bar',
    pinned: false,
    lastUpdated: '4 min ago',
    data: { bars: [420, 480, 510, 390, 550, 470, 530, 460, 520, 580, 500, 540] },
  },
  {
    id: 'hourly-sales',
    title: 'Hourly Sales Distribution',
    subtitle: 'Last 4 months',
    type: 'chart-line',
    pinned: false,
    lastUpdated: '6 min ago',
    data: { points: [50, 120, 280, 450, 380, 520, 610, 490, 350, 200, 130, 70] },
  },
  {
    id: 'lens-insight-revenue',
    title: 'Lens: Revenue Anomaly Alert',
    subtitle: 'Auto-generated insight',
    type: 'metric',
    pinned: true,
    lastUpdated: 'Live',
    data: { value: '-18%', label: 'Wednesday vs 4-week avg', severity: 'warning' },
  },
  {
    id: 'lens-insight-retention',
    title: 'Lens: Customer Retention Risk',
    subtitle: 'Auto-generated insight',
    type: 'metric',
    pinned: true,
    lastUpdated: 'Live',
    data: { value: '3', label: 'Top customers inactive 30+ days', severity: 'danger' },
  },
  {
    id: 'lens-insight-capital',
    title: 'Lens: Capital Payoff Estimate',
    subtitle: 'Auto-generated insight',
    type: 'metric',
    pinned: false,
    lastUpdated: 'Live',
    data: { value: 'Apr 28', label: 'Estimated payoff date', severity: 'success' },
  },
];

/* ════════════════════════════════════════════════════════════
   MINI CHART COMPONENTS FOR PINNED CARDS
   ════════════════════════════════════════════════════════════ */

function MiniBarChart({ bars, color = '#4945FF' }: { bars: number[]; color?: string }) {
  const max = Math.max(...bars);
  const uid = `bar-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox={`0 0 ${bars.length * 14} 64`} className="w-full" style={{ height: 72 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {bars.map((val, i) => {
        const barH = (val / max) * 56;
        const x = i * 14 + 1;
        return (
          <rect key={i} x={x} y={64 - barH} width="10" height={barH} rx="2.5" fill={`url(#${uid})`} />
        );
      })}
    </svg>
  );
}

function MiniLineChart({ points, color = '#4945FF' }: { points: number[]; color?: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 200;
  const h = 72;
  const pad = 6;
  const uid = `line-${Math.random().toString(36).slice(2, 8)}`;

  // Build smooth bezier path
  const coords = points.map((v, i) => ({
    x: (i / (points.length - 1)) * w,
    y: h - pad - ((v - min) / range) * (h - pad * 2),
  }));

  let d = `M${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
    const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
    d += ` C${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
  }

  const areaD = d + ` L${coords[coords.length - 1].x},${h} L${coords[0].x},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 72 }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${uid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="3" fill="white" stroke={color} strokeWidth="2" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════
   PINNED CARD
   ════════════════════════════════════════════════════════════ */
function PinnedCard({ item, onTogglePin }: { item: PinnedItem; onTogglePin: (id: string) => void }) {
  const isLens = item.id.startsWith('lens-');
  const isLive = item.lastUpdated === 'Live';

  return (
    <div className="bg-white rounded-xl border border-[#E8E8E8] p-5 hover:shadow-md transition-shadow group relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5">
            {isLens && <Sparkles className="w-3.5 h-3.5 text-[#4945FF] flex-shrink-0" />}
            <h4 className="text-sm text-[#111] truncate" style={{ fontWeight: 600 }}>{item.title}</h4>
          </div>
          <p className="text-xs text-[#999] mt-0.5">{item.subtitle}</p>
        </div>
        <div className="flex items-center gap-1">
          {item.pinned && (
            <button
              onClick={() => onTogglePin(item.id)}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F5F5F5] transition-colors"
              title="Unpin"
            >
              <div className="w-2 h-2 rounded-full bg-[#4945FF]" />
            </button>
          )}
          {!item.pinned && (
            <button
              onClick={() => onTogglePin(item.id)}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F5F5F5] transition-colors opacity-0 group-hover:opacity-100"
              title="Pin"
            >
              <Pin className="w-3.5 h-3.5 text-[#999]" />
            </button>
          )}
          <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F5F5F5] transition-colors opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="w-4 h-4 text-[#999]" />
          </button>
        </div>
      </div>

      {/* Auto-update badge */}
      <div className="flex items-center gap-1.5 mb-3">
        {isLive ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-[#4945FF] px-1.5 py-0.5 rounded-full bg-[#4945FF]/8" style={{ fontWeight: 600 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4945FF] animate-pulse" />
            Live · Auto-updates
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-[#999]" style={{ fontWeight: 500 }}>
            <RefreshCw className="w-2.5 h-2.5" />
            Updated {item.lastUpdated} · Auto-refreshes
          </span>
        )}
      </div>

      {/* Content — individually blurred */}
      <LockedWidget blurAmount={6} height={80} dimOverlay>
        {item.type === 'chart-bar' && item.data?.bars && (
          <MiniBarChart bars={item.data.bars} />
        )}
        {item.type === 'chart-line' && item.data?.points && (
          <MiniLineChart points={item.data.points} />
        )}
        {item.type === 'table' && item.data?.rows && (
          <div className="text-xs">
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-[#F0F0F0] text-[#999]" style={{ fontWeight: 600 }}>
              <span>Name</span><span>Email</span><span className="text-right">Loc</span>
            </div>
            {item.data.rows.slice(0, 4).map((row: any, i: number) => (
              <div key={i} className="grid grid-cols-3 gap-2 py-1.5 border-b border-[#F8F8F8]">
                <span className="text-[#4945FF] truncate" style={{ fontWeight: 500 }}>{row.name}</span>
                <span className="text-[#666] truncate">{row.email}</span>
                <span className="text-[#666] text-right">{row.loc}</span>
              </div>
            ))}
          </div>
        )}
        {item.type === 'table' && item.data?.items && (
          <div className="text-xs">
            <div className="grid grid-cols-4 gap-2 py-1.5 border-b border-[#F0F0F0] text-[#999]" style={{ fontWeight: 600 }}>
              <span>Items</span><span className="text-right">Units</span><span className="text-right">Gross</span><span className="text-right">Net</span>
            </div>
            {item.data.items.slice(0, 4).map((row: any, i: number) => (
              <div key={i} className="grid grid-cols-4 gap-2 py-1.5 border-b border-[#F8F8F8]">
                <span className="text-[#333] truncate">{row.name}</span>
                <span className="text-[#666] text-right">{row.units}</span>
                <span className="text-[#666] text-right">{row.gross}</span>
                <span className="text-[#666] text-right">{row.net}</span>
              </div>
            ))}
          </div>
        )}
        {item.type === 'metric' && item.data && (
          <div className="flex items-center gap-4 py-2">
            <div
              className="text-3xl"
              style={{
                fontWeight: 800,
                letterSpacing: -1,
                color: item.data.severity === 'warning' ? '#F59E0B' : item.data.severity === 'danger' ? '#EF4444' : '#10B981',
              }}
            >
              {item.data.value}
            </div>
            <div className="text-xs text-[#666] leading-snug">{item.data.label}</div>
          </div>
        )}
      </LockedWidget>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PINNED CHAT CARD (from Lens AI)
   ════════════════════════════════════════════════════════════ */
function PinnedChatCard({ chat, onUnpin, onOpen }: { chat: PinnedChatData; onUnpin?: (id: string) => void; onOpen?: () => void }) {
  const timeAgo = () => {
    const diff = Date.now() - chat.pinnedAt;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-xl border border-[#E8E8E8] p-5 hover:shadow-md transition-shadow group relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <img src={lensOrbIcon} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
            <h4 className="text-sm text-[#111] truncate" style={{ fontWeight: 600 }}>{chat.title}</h4>
          </div>
          {chat.layer && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider"
              style={{ backgroundColor: `${chat.layerColor}12`, border: `1px solid ${chat.layerColor}25`, color: chat.layerColor }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: chat.layerColor }} />
              {chat.layer}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Pin indicator - always visible */}
          <button
            onClick={() => onUnpin?.(chat.id)}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F5F5F5] transition-colors"
            title="Unpin"
          >
            <div className="w-2 h-2 rounded-full bg-[#4945FF]" />
          </button>
          <button
            onClick={() => onOpen?.()}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F5F5F5] transition-colors opacity-0 group-hover:opacity-100"
            title="Open in Lens"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#999]" />
          </button>
        </div>
      </div>

      {/* Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 text-[10px] text-[#4945FF] px-1.5 py-0.5 rounded-full bg-[#4945FF]/8" style={{ fontWeight: 600 }}>
          <MessageSquare className="w-2.5 h-2.5" />
          {chat.messageCount} messages
        </span>
        <span className="text-[10px] text-[#999]" style={{ fontWeight: 500 }}>
          Pinned {timeAgo()}
        </span>
      </div>

      {/* Summary */}
      <p className="text-xs text-[#555] leading-relaxed line-clamp-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {chat.summary}
      </p>

      {/* Open in Lens link */}
      <button
        onClick={() => onOpen?.()}
        className="mt-3 text-xs text-[#4945FF] hover:underline flex items-center gap-1"
        style={{ fontWeight: 500 }}
      >
        Open in Lens AI <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PINNED DATA MODAL
   ════════════════════════════════════════════════════════════ */
function PinnedDataModal({
  items,
  onClose,
  onTogglePin,
  pinnedChats = [],
  onUnpinChat,
  onNavigateToLens,
}: {
  items: PinnedItem[];
  onClose: () => void;
  onTogglePin: (id: string) => void;
  pinnedChats?: PinnedChatData[];
  onUnpinChat?: (id: string) => void;
  onNavigateToLens?: () => void;
}) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  // Filter to only show pinned items
  const pinnedItems = items.filter(item => item.pinned);
  
  const sorted = [...pinnedItems].sort((a, b) => {
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return 0; // date = default order
  });

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E8E8E8]">
        <div className="flex items-center justify-between px-8 py-5">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] transition-colors">
            <X className="w-5 h-5 text-[#333]" />
          </button>
          <h2 className="text-base text-[#111]" style={{ fontWeight: 700 }}>Pinned data</h2>
          <div style={{ width: 32 }} />
        </div>

        <div className="flex items-center justify-between px-8 pb-4">
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8E8E8] hover:bg-[#F5F5F5] transition-colors">
              <ArrowUp className="w-4 h-4 text-[#666]" />
            </button>
            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'name' : 'date')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E8E8] text-sm text-[#333] hover:bg-[#F5F5F5] transition-colors"
              style={{ fontWeight: 500 }}
            >
              Sort by <span style={{ fontWeight: 700 }}>{sortBy === 'date' ? 'Date created' : 'Name'}</span>
            </button>
          </div>
          <div className="flex items-center border border-[#E8E8E8] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-[#F5F5F5]' : 'hover:bg-[#F5F5F5]'}`}
            >
              <List className="w-4 h-4 text-[#666]" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-[#F5F5F5]' : 'hover:bg-[#F5F5F5]'}`}
            >
              <LayoutGrid className="w-4 h-4 text-[#666]" />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-update banner */}
      <div className="px-8 pt-4 pb-2">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#4945FF]/5 border border-[#4945FF]/10">
          <RefreshCw className="w-3.5 h-3.5 text-[#4945FF]" />
          <span className="text-xs text-[#4945FF]" style={{ fontWeight: 500 }}>
            Pinned items auto-update in real time. Lens AI insights refresh continuously as new data flows in.
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className={`px-8 py-4 ${viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-3'}`}>
        {pinnedChats.map((chat) => (
          <PinnedChatCard key={`chat-${chat.id}`} chat={chat} onUnpin={onUnpinChat} onOpen={() => { onClose(); onNavigateToLens?.(); }} />
        ))}
        {sorted.map((item) => (
          <PinnedCard key={item.id} item={item} onTogglePin={onTogglePin} />
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TASKS
   ════════════════════════════════════════════════════════════ */
const TASKS = [
  { id: 1, initials: 'L', title: 'Time off request', meta: 'Lauren Hill • Chicago • By Aug 15', action: 'Review' },
  { id: 2, initials: 'MT', title: 'Shift trade request', meta: 'Mike Thurman • LA • By Aug 15', action: 'View' },
  { id: 3, initials: 'SJ', title: 'Expense approval', meta: 'Sarah Jenkins • NY • By Aug 16', action: 'Review' },
  { id: 4, initials: 'RK', title: 'Inventory reorder', meta: 'Robert Kim • Fremont • By Aug 17', action: 'Approve' },
];

/* ════════════════════════════════════════════════════════════
   PERFORMANCE CHART
   ════════════════════════════════════════════════════════════ */
function PerformanceChart() {
  const hours = ['7 am', '8', '9', '10', '11', '12 pm', '1', '2', '3', '4'];
  const netSales =  [800, 3200, 4800, 5100, 3900, 4200, 5600, 5200, 2100, 800];
  const laborCost = [600, 1800, 2400, 2600, 2100, 2300, 2800, 2600, 1400, 600];
  const max = Math.max(...netSales.map((v, i) => v + laborCost[i]));

  return (
    <div>
      <div className="flex items-end gap-[6px]" style={{ height: 180 }}>
        {hours.map((hr, i) => {
          const netH = (netSales[i] / max) * 160;
          const labH = (laborCost[i] / max) * 160;
          return (
            <div key={hr} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-stretch">
                <div className="rounded-t-sm" style={{ height: netH, backgroundColor: '#4945FF' }} />
                <div style={{ height: labH, backgroundColor: '#4945FF', opacity: 0.25 }} />
              </div>
              <span className="text-[10px] text-[#999] mt-1">{hr}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#4945FF]" />
          <span className="text-xs text-[#666]">Net sales minus labor</span>
          <span className="text-xs text-[#333]" style={{ fontWeight: 600 }}>$24,462.00</span>
          <span className="text-xs text-[#999]">77.35%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#4945FF]/25" />
          <span className="text-xs text-[#666]">Labor cost</span>
          <span className="text-xs text-[#333]" style={{ fontWeight: 600 }}>$14,148.00</span>
          <span className="text-xs text-[#999]">22.65%</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ════════════════════════════════════════════════════════════ */
export function HomeDashboard({ pinnedChats = [], onUnpinChat, onNavigateToLens, onNavigate }: { pinnedChats?: PinnedChatData[]; onUnpinChat?: (chatId: string) => void; onNavigateToLens?: () => void; onNavigate?: (tabId: string) => void }) {
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [pinnedModalOpen, setPinnedModalOpen] = useState(false);
  const [items, setItems] = useState<PinnedItem[]>(DEFAULT_PINNABLE_ITEMS);
  const [perfTab, setPerfTab] = useState<'today' | 'week'>('today');
  const [perfChecks, setPerfChecks] = useState<'closed' | 'open'>('closed');
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('New York');
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);

  const pinnedItems = items.filter(i => i.pinned);
  const visibleTasks = showAllTasks ? TASKS : TASKS.slice(0, 2);

  const togglePin = useCallback((id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, pinned: !item.pinned } : item));
  }, []);

  // Simulate auto-update timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => {
        if (item.lastUpdated === 'Live') return item;
        // Randomly update a timestamp
        if (Math.random() > 0.7) {
          const mins = Math.floor(Math.random() * 5) + 1;
          return { ...item, lastUpdated: `${mins} min ago` };
        }
        return item;
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {pinnedModalOpen && (
        <PinnedDataModal
          items={items}
          onClose={() => setPinnedModalOpen(false)}
          onTogglePin={togglePin}
          pinnedChats={pinnedChats}
          onUnpinChat={onUnpinChat}
          onNavigateToLens={onNavigateToLens}
        />
      )}

      <div className="max-w-[960px] mx-auto px-8 py-8">

        {/* Location Picker */}
        <div className="mb-6 relative">
          <button onClick={() => setLocationOpen(p => !p)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E8E8] text-sm text-[#333] hover:bg-[#F5F5F5] transition-colors">
            <span className="text-[#999]">Location</span>
            <span style={{ fontWeight: 600 }}>{selectedLocation}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#999] transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
          </button>
          {locationOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-48 bg-white border border-[#E8E8E8] rounded-xl overflow-hidden z-20" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
              {['New York', 'Los Angeles', 'Chicago', 'Fremont'].map(loc => (
                <button key={loc} onClick={() => { setSelectedLocation(loc); setLocationOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#FAFAFA] transition-colors ${selectedLocation === loc ? 'text-[#4945FF]' : 'text-[#333]'}`} style={{ fontWeight: selectedLocation === loc ? 600 : 400 }}>{loc}</button>
              ))}
            </div>
          )}
        </div>

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-[#111] mb-4" style={{ fontSize: '1.65rem', fontWeight: 600, letterSpacing: -0.3 }}>
            Hello! You have <AnimatedNumber value={12384} prefix="$" />.23 available.
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => onNavigate?.('analytics')} className="px-5 py-2.5 rounded-full bg-[#4945FF] text-white text-sm hover:bg-[#3933CC] transition-colors" style={{ fontWeight: 600 }}>
              Transfer $2,324.12 now
            </button>
            <button onClick={() => onNavigate?.('payments')} className="px-5 py-2.5 rounded-full border border-[#E8E8E8] text-sm text-[#333] hover:bg-[#F5F5F5] transition-colors" style={{ fontWeight: 500 }}>
              Send an invoice
            </button>
            <button onClick={() => onNavigate?.('payments')} className="px-5 py-2.5 rounded-full border border-[#E8E8E8] text-sm text-[#333] hover:bg-[#F5F5F5] transition-colors" style={{ fontWeight: 500 }}>
              Take a payment
            </button>
            <div className="relative">
              <button onClick={() => setMoreActionsOpen(p => !p)} className="w-10 h-10 rounded-full border border-[#E8E8E8] flex items-center justify-center text-[#999] hover:bg-[#F5F5F5] transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {moreActionsOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-52 bg-white border border-[#E8E8E8] rounded-xl overflow-hidden py-1 z-20" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                  {[
                    { label: 'View Insights', tab: 'insights' },
                    { label: 'Open Storefront', tab: 'storefront' },
                    { label: 'View Analytics', tab: 'analytics' },
                    { label: 'Ask Lens AI', tab: 'lens-ai' },
                  ].map(item => (
                    <button key={item.tab} onClick={() => { onNavigate?.(item.tab); setMoreActionsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-[#333] hover:bg-[#FAFAFA] transition-colors" style={{ fontWeight: 500 }}>{item.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ Pinned Data Preview ═══ */}
        {(pinnedItems.length > 0 || pinnedChats.length > 0) && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-[#4945FF]" />
                <h2 className="text-sm text-[#111]" style={{ fontWeight: 700 }}>
                  Pinned data
                </h2>
                <span className="text-xs text-[#999] ml-1">{pinnedItems.length + pinnedChats.length} items</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-[#4945FF] px-2 py-1 rounded-full bg-[#4945FF]/5" style={{ fontWeight: 500 }}>
                  <RefreshCw className="w-2.5 h-2.5" />
                  Auto-updating
                </span>
                <button
                  onClick={() => setPinnedModalOpen(true)}
                  className="text-xs text-[#4945FF] hover:underline"
                  style={{ fontWeight: 500 }}
                >
                  See all →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Pinned Lens chats first */}
              {pinnedChats.slice(0, 3).map((chat) => (
                <PinnedChatCard key={`chat-${chat.id}`} chat={chat} onUnpin={onUnpinChat} onOpen={onNavigateToLens} />
              ))}
              {/* Then regular pinned items */}
              {pinnedItems.slice(0, Math.max(0, 3 - pinnedChats.length)).map((item) => (
                <PinnedCard key={item.id} item={item} onTogglePin={togglePin} />
              ))}
            </div>

            {(pinnedItems.length + pinnedChats.length) > 3 && (
              <button
                onClick={() => setPinnedModalOpen(true)}
                className="mt-3 w-full py-2.5 rounded-lg border border-dashed border-[#E8E8E8] text-xs text-[#999] hover:text-[#4945FF] hover:border-[#4945FF]/30 transition-all"
                style={{ fontWeight: 500 }}
              >
                +{(pinnedItems.length + pinnedChats.length) - 3} more pinned items · Click to manage
              </button>
            )}
          </div>
        )}

        {/* ═══ Tasks ═══ */}
        <div className="border border-[#E8E8E8] rounded-xl mb-8">
          <div className="px-6 py-4 border-b border-[#F0F0F0]">
            <h2 className="text-base text-[#111]" style={{ fontWeight: 700 }}>
              {TASKS.length} Tasks
            </h2>
          </div>
          <div className="divide-y divide-[#F0F0F0]">
            {visibleTasks.map((task) => {
              const done = completedTasks.has(task.id);
              return (
              <div key={task.id} className={`flex items-center justify-between px-6 py-4 hover:bg-[#FAFAFA] transition-colors ${done ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs ${done ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#F5F5F5] text-[#666]'}`}
                    style={{ fontWeight: 600 }}
                  >
                    {done ? '✓' : task.initials}
                  </div>
                  <div>
                    <div className={`text-sm ${done ? 'text-[#999] line-through' : 'text-[#111]'}`} style={{ fontWeight: 600 }}>{task.title}</div>
                    <div className="text-xs text-[#999] mt-0.5">{task.meta}</div>
                  </div>
                </div>
                {!done ? (
                  <button onClick={() => setCompletedTasks(p => new Set(p).add(task.id))} className="text-sm text-[#4945FF] hover:underline" style={{ fontWeight: 500 }}>
                    {task.action}
                  </button>
                ) : (
                  <span className="text-xs text-[#10B981]" style={{ fontWeight: 500 }}>Done</span>
                )}
              </div>
              );
            })}
          </div>
          {TASKS.length > 2 && (
            <button
              onClick={() => setShowAllTasks(!showAllTasks)}
              className="w-full flex items-center justify-center gap-1.5 px-6 py-3 text-sm text-[#4945FF] hover:bg-[#FAFAFA] transition-colors border-t border-[#F0F0F0]"
              style={{ fontWeight: 500 }}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showAllTasks ? 'rotate-180' : ''}`} />
              {showAllTasks ? 'Show less' : `See ${TASKS.length - 2} more`}
            </button>
          )}
        </div>

        {/* ═══ Performance ═══ */}
        <div className="border border-[#E8E8E8] rounded-xl mb-8">
          <div className="px-6 py-4 border-b border-[#F0F0F0]">
            <h2 className="text-base text-[#111] mb-4" style={{ fontWeight: 700 }}>Performance</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#E8E8E8] rounded-lg overflow-hidden">
                <span className="px-3 py-1.5 text-xs text-[#999]" style={{ fontWeight: 500 }}>Date</span>
                <button
                  onClick={() => setPerfTab('today')}
                  className={`px-3 py-1.5 text-xs transition-colors ${perfTab === 'today' ? 'bg-[#F5F5F5] text-[#111]' : 'text-[#999] hover:bg-[#FAFAFA]'}`}
                  style={{ fontWeight: perfTab === 'today' ? 700 : 500 }}
                >
                  Today
                </button>
                <button
                  onClick={() => setPerfTab('week')}
                  className={`px-3 py-1.5 text-xs transition-colors ${perfTab === 'week' ? 'bg-[#F5F5F5] text-[#111]' : 'text-[#999] hover:bg-[#FAFAFA]'}`}
                  style={{ fontWeight: perfTab === 'week' ? 700 : 500 }}
                >
                  This week
                </button>
              </div>
              <div className="flex items-center border border-[#E8E8E8] rounded-lg overflow-hidden">
                <span className="px-3 py-1.5 text-xs text-[#999]" style={{ fontWeight: 500 }}>Checks</span>
                <button
                  onClick={() => setPerfChecks('closed')}
                  className={`px-3 py-1.5 text-xs transition-colors ${perfChecks === 'closed' ? 'bg-[#F5F5F5] text-[#111]' : 'text-[#999] hover:bg-[#FAFAFA]'}`}
                  style={{ fontWeight: perfChecks === 'closed' ? 700 : 500 }}
                >
                  Closed
                </button>
                <button
                  onClick={() => setPerfChecks('open')}
                  className={`px-3 py-1.5 text-xs transition-colors ${perfChecks === 'open' ? 'bg-[#F5F5F5] text-[#111]' : 'text-[#999] hover:bg-[#FAFAFA]'}`}
                  style={{ fontWeight: perfChecks === 'open' ? 700 : 500 }}
                >
                  Open
                </button>
              </div>
            </div>
          </div>
          <div className="px-6 py-6">
            <div className="mb-1 text-xs text-[#999]">Net sales</div>
            <LockedWidget blurAmount={8} height={220} dimOverlay>
              <div className="text-3xl text-[#111] mb-6" style={{ fontWeight: 700, letterSpacing: -1 }}>
                $32,167.82
              </div>
              <PerformanceChart />
            </LockedWidget>
          </div>
        </div>

        {/* ═══ Pin CTA ═══ */}
        <div className="mb-8">
          <button
            onClick={() => setPinnedModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-[#E8E8E8] text-sm text-[#999] hover:text-[#4945FF] hover:border-[#4945FF]/30 transition-all group"
            style={{ fontWeight: 500 }}
          >
            <Pin className="w-4 h-4 group-hover:text-[#4945FF] transition-colors" />
            Pin chats, insights, and data cards here — they'll update automatically
          </button>
        </div>

      </div>
    </div>
  );
}