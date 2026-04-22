import { useState, useRef, useEffect } from 'react';
import { LayoutGrid, CreditCard, BarChart2, Asterisk, Building2, ShoppingBag, Activity, Search, X, Bell, MessageCircle, Settings, HelpCircle, Zap, Moon, Sun, Store, Sparkles, ArrowRight, Lock, Menu } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { HomeDashboard } from '../components/HomeDashboard';
import { PaymentsDashboard } from '../components/PaymentsDashboard';
import { InsightsDashboard } from '../components/InsightsDashboard';
import { CashFlowDashboard } from '../components/CashFlowDashboard';
import { CustomersDashboard } from '../components/CustomersDashboard';
import { CatalogDashboard } from '../components/CatalogDashboard';
import { StorefrontDashboard } from '../components/StorefrontDashboard';
import { CapitalDashboard } from '../components/CapitalDashboard';
import { LensChatSimulator } from '../components/LensChatSimulator';
import { LensFloatingPanel } from '../components/LensFloatingPanel';
import { DataVisualizationDashboard } from '../components/DataVisualizationDashboard';
import { useToast, ToastContainer } from '../components/ui/Toast';
import { usePinnedChatsStorage } from '../components/useLensChatStorage';
import deltLogo from 'figma:asset/cd29fb66b3efe415de89c3670fbb7049a934dd69.png';

/* ── Shared pinned-chat type ── */
export interface PinnedChatData {
  id: string;
  title: string;
  summary: string;
  layer?: string;
  layerColor?: string;
  messageCount: number;
  pinnedAt: number;
}

const UNLOCKED_VIEWS = new Set(['dashboard', 'lens-ai', 'analytics']);

const NAV_ITEMS_TOP = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'insights', label: 'Insights', icon: BarChart2 },
  { id: 'lens-ai', label: 'Lens AI', icon: Asterisk },
] as const;

const NAV_ITEMS_BOTTOM = [
  { id: 'capital', label: 'Capital', icon: Building2 },
  { id: 'storefront', label: 'Storefront', icon: ShoppingBag },
  { id: 'analytics', label: 'Analytics', icon: Activity },
] as const;

const NAV_ITEMS = [...NAV_ITEMS_TOP, ...NAV_ITEMS_BOTTOM] as const;

type NavId = (typeof NAV_ITEMS)[number]['id'];

const FULL_HEIGHT_VIEWS: NavId[] = ['lens-ai'];

export function SandboxPage() {
  const navigate = useNavigate();
  const [activeMenuItem, setActiveMenuItem] = useState<NavId>('dashboard');
  const [searchFocused, setSearchFocused] = useState(false);
  const { pinnedChats, pinChat, unpinChat } = usePinnedChatsStorage();
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [forceTerminalKey, setForceTerminalKey] = useState(0);
  const quickActionRef = useRef<HTMLDivElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarSearchVal, setSidebarSearchVal] = useState('');
  const { toasts, addToast, removeToast } = useToast();
  const notifRef = useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isFullHeight = FULL_HEIGHT_VIEWS.includes(activeMenuItem);

  /* Check for view query parameter and set active menu item */
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const view = params.get('view');
    if (view && NAV_ITEMS.some(item => item.id === view)) {
      setActiveMenuItem(view as NavId);
    }
  }, []);

  /* Close quick-action menu on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (quickActionRef.current && !quickActionRef.current.contains(e.target as Node)) {
        setQuickActionOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (quickActionOpen || notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [quickActionOpen, notifOpen]);

  const QUICK_ACTIONS = [
    { icon: CreditCard, label: 'Take a Payment', target: 'payments' as NavId },
    { icon: Store, label: 'Manage Storefront', target: 'storefront' as NavId },
    { icon: Sparkles, label: 'Ask Lens AI', target: 'lens-ai' as NavId },
  ];

  const handlePinChat = (chat: PinnedChatData) => {
    pinChat(chat);
  };

  const handleUnpinChat = (chatId: string) => {
    unpinChat(chatId);
  };

  /* Sidebar icon handlers */
  const SIDEBAR_ICONS = [
    { Icon: Bell, label: 'Notifications', action: () => setNotifOpen(p => !p) },
    { Icon: MessageCircle, label: 'Messages', action: () => addToast('info', 'Messages', 'No new messages') },
    { Icon: Settings, label: 'Settings', action: () => addToast('info', 'Settings', 'Settings panel coming soon') },
    { Icon: HelpCircle, label: 'Help', action: () => addToast('info', 'Help Center', 'Visit support.delt.com') },
    { Icon: Zap, label: 'Automations', action: () => addToast('info', 'Automations', '3 automations active') },
  ];

  const NOTIFICATIONS = [
    { id: '1', title: 'Payment received', desc: '$847.20 from Sarah Chen', time: '2m ago', read: false },
    { id: '2', title: 'Low stock alert', desc: 'Spring Mix is critically low', time: '15m ago', read: false },
    { id: '3', title: 'Invoice overdue', desc: 'INV-1023 from TechStart LLC', time: '1h ago', read: false },
    { id: '4', title: 'New customer', desc: 'Omar Hassan signed up', time: '3h ago', read: true },
  ];

  const [readNotifs, setReadNotifs] = useState<Set<string>>(new Set());
  const markNotifRead = (id: string) => setReadNotifs(p => new Set(p).add(id));
  const unreadCount = NOTIFICATIONS.filter(n => !n.read && !readNotifs.has(n.id)).length;

  /* Navigation helper for child components */
  const handleNavigate = (tabId: string) => setActiveMenuItem(tabId as NavId);

  /* Sidebar search filtering */
  const filteredNavItems = sidebarSearchVal
    ? NAV_ITEMS.filter(item => item.label.toLowerCase().includes(sidebarSearchVal.toLowerCase()))
    : NAV_ITEMS;

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .sandbox-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 100;
          width: 240px !important;
        }
        .sandbox-sidebar.mobile-open {
          transform: translateX(0);
        }
        .sandbox-main-content {
          width: 100% !important;
          padding-bottom: 80px;
        }
        .sandbox-top-banner {
          flex-direction: column;
          gap: 8px !important;
          padding: 12px 16px !important;
        }
        .sandbox-top-banner p {
          font-size: 12px !important;
          text-align: center;
        }
        .sandbox-floating-cta {
          bottom: 80px !important;
          right: 16px !important;
          left: 16px !important;
          padding: 14px 20px !important;
          font-size: 14px !important;
          justify-content: center !important;
        }
        .sandbox-mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 99;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .sandbox-mobile-overlay.visible {
          opacity: 1;
          pointer-events: auto;
        }
        .sandbox-mobile-header {
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: white;
          border-bottom: 1px solid #e6e6e6;
        }
        .sandbox-mobile-nav {
          display: flex !important;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e6e6e6;
          padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
          z-index: 50;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
        }
        .sandbox-mobile-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 4px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .sandbox-mobile-nav-item.active {
          background: rgba(99, 91, 255, 0.08);
        }
        .sandbox-mobile-nav-label {
          font-size: 10px;
          font-weight: 500;
        }
        .lens-floating-panel {
          display: none !important;
        }
        /* Make content scrollable with better touch behavior */
        .sandbox-main-content {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        /* Adjust dashboard cards for mobile */
        .dashboard-card {
          margin: 12px !important;
        }
        /* Hide quick action button on mobile */
        [style*="Quick Action"] {
          display: none !important;
        }
      }
      @media (min-width: 769px) {
        .sandbox-mobile-header {
          display: none !important;
        }
        .sandbox-mobile-nav {
          display: none !important;
        }
      }
    `}</style>
    <div
      className={`overflow-hidden bg-white flex flex-col relative ${darkMode ? 'dashboard-dark' : ''}`}
      style={{ height: 'calc(100vh / 0.8)' }}
    >
      {/* ═══ Branded demo banner (navy, not purple) ═══ */}
      <div
        className="sandbox-top-banner flex items-center justify-center gap-4 px-8 py-2.5 flex-shrink-0 relative"
        style={{ backgroundColor: '#041E42' }}
      >
        <p className="text-white text-sm">
          <strong style={{ fontWeight: 600 }}>Live demo.</strong>
          {'  '}Some features are reserved for trial accounts.
        </p>
        <motion.button
          onClick={() => navigate('/signup')}
          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-white cursor-pointer transition-all text-xs"
          style={{ fontWeight: 600, backgroundColor: '#4945FF' }}
          whileHover={{ backgroundColor: '#3933CC' }}
          whileTap={{ scale: 0.97 }}
        >
          Start Free Trial <ArrowRight size={12} />
        </motion.button>
      </div>

      {/* ═══ Mobile Header ═══ */}
      <div className="sandbox-mobile-header">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={24} style={{ color: '#0a2540' }} />
        </button>
        <img
          src={deltLogo}
          alt="Delt"
          className="h-12"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
        >
          <Bell size={20} style={{ color: '#0a2540' }} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#4945FF] rounded-full" />
          )}
        </button>
      </div>

      {/* ═══ Mobile Menu Overlay ═══ */}
      <div
        className={`sandbox-mobile-overlay ${mobileMenuOpen ? 'visible' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div className="flex flex-1 min-h-0">
      {/* ═══ Left Sidebar ═══ */}
      <aside
        className={`sandbox-sidebar flex flex-col flex-shrink-0 ${mobileMenuOpen ? 'mobile-open' : ''}`}
        style={{ width: 200, backgroundColor: '#fafafa', borderRight: '1px solid #e6e6e6' }}
      >
        {/* Delt Demo Logo */}
        <div className="px-3 pt-5 pb-5 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="transition-opacity hover:opacity-80"
          >
            <img
              src={deltLogo}
              alt="Delt"
              className="h-[84px]"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          </button>
        </div>

        {/* Search */}
        <div className="px-2 pb-2">
          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all ${
              searchFocused ? 'bg-white ring-2 ring-[#635bff]/25' : 'bg-white/60 hover:bg-white'
            }`}
            style={{ border: '1px solid #e6e6e6' }}
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#adbdcc' }} />
            <input
              placeholder="Search"
              value={sidebarSearchVal}
              onChange={e => setSidebarSearchVal(e.target.value)}
              className="bg-transparent border-none outline-none flex-1"
              style={{ fontSize: 13, fontWeight: 400, color: '#0a2540' }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {sidebarSearchVal && (
              <button onClick={() => setSidebarSearchVal('')} style={{ color: '#adbdcc' }} className="hover:text-[#425466]">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-1">
          {sidebarSearchVal ? (
            <>
              {filteredNavItems.map((item) => {
                const isActive = activeMenuItem === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveMenuItem(item.id); setSidebarSearchVal(''); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-2.5 py-[7px] rounded-md text-left transition-all mb-px"
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 550 : 450,
                      color: isActive ? '#0a2540' : '#425466',
                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                      boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
                    }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ opacity: isActive ? 0.8 : 0.55 }} />
                    {item.label}
                  </button>
                );
              })}
              {filteredNavItems.length === 0 && (
                <p className="text-center py-4" style={{ fontSize: 12, color: '#adbdcc' }}>No results for "{sidebarSearchVal}"</p>
              )}
            </>
          ) : (
            <>
              {/* Top tier: daily workflow */}
              {NAV_ITEMS_TOP.map((item) => {
                const isActive = activeMenuItem === item.id;
                const isLocked = !UNLOCKED_VIEWS.has(item.id);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveMenuItem(item.id); setSidebarSearchVal(''); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-2.5 py-[7px] rounded-md text-left transition-all mb-px"
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 450,
                      color: isActive ? '#635bff' : isLocked ? '#b0bec5' : '#425466',
                      backgroundColor: isActive ? 'rgba(99,91,255,0.08)' : 'transparent',
                      boxShadow: 'none',
                      cursor: isLocked ? 'default' : 'pointer',
                    }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? '#635bff' : isLocked ? '#c5cdd4' : '#8898aa' }} />
                    <span className="flex-1">{item.label}</span>
                    {isLocked && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: '#c5cdd4' }} />}
                  </button>
                );
              })}

              {/* Divider */}
              <div className="my-2" style={{ height: 1, backgroundColor: '#ebebeb' }} />

              {/* Bottom tier: secondary */}
              {NAV_ITEMS_BOTTOM.map((item) => {
                const isActive = activeMenuItem === item.id;
                const isLocked = !UNLOCKED_VIEWS.has(item.id);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveMenuItem(item.id); setSidebarSearchVal(''); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-2.5 py-[7px] rounded-md text-left transition-all mb-px"
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 450,
                      color: isActive ? '#635bff' : isLocked ? '#b0bec5' : '#425466',
                      backgroundColor: isActive ? 'rgba(99,91,255,0.08)' : 'transparent',
                      boxShadow: 'none',
                      cursor: isLocked ? 'default' : 'pointer',
                    }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? '#635bff' : isLocked ? '#c5cdd4' : '#8898aa' }} />
                    <span className="flex-1">{item.label}</span>
                    {isLocked && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: '#c5cdd4' }} />}
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-3 flex items-center gap-1 relative">
          {SIDEBAR_ICONS.map((item, i) => (
            <div key={i} className="relative" ref={i === 0 ? notifRef : undefined}>
              <button
                onClick={item.action}
                title={item.label}
                className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-white"
                style={{ color: '#8898aa' }}
              >
                <item.Icon className="w-[15px] h-[15px]" />
              </button>
              {/* Badge for Bell */}
              {i === 0 && unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#EF4444] text-white text-[8px] flex items-center justify-center" style={{ fontWeight: 700 }}>{unreadCount}</span>
              )}
              {/* Notification dropdown */}
              {i === 0 && notifOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl overflow-hidden z-50" style={{ border: '1px solid #e6e6e6', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <span className="text-sm" style={{ fontWeight: 700, color: '#0a2540' }}>Notifications</span>
                    <button onClick={() => { setReadNotifs(new Set(NOTIFICATIONS.map(n => n.id))); }} className="hover:underline" style={{ fontSize: 10, color: '#635bff', fontWeight: 500 }}>Mark all read</button>
                  </div>
                  {NOTIFICATIONS.map(n => {
                    const isRead = n.read || readNotifs.has(n.id);
                    return (
                      <button key={n.id} onClick={() => { markNotifRead(n.id); setNotifOpen(false); }} className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fafafa] ${!isRead ? 'bg-[#635bff]/[0.02]' : ''}`}>
                        {!isRead && <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: '#635bff' }} />}
                        {isRead && <div className="w-1.5 h-1.5 flex-shrink-0 mt-1.5" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs" style={{ fontWeight: isRead ? 400 : 600, color: '#0a2540' }}>{n.title}</div>
                          <div className="text-[11px] truncate" style={{ color: '#8898aa' }}>{n.desc}</div>
                        </div>
                        <span className="text-[10px] flex-shrink-0" style={{ color: '#adbdcc' }}>{n.time}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className={`sandbox-main-content flex-1 ${isFullHeight ? 'overflow-hidden' : 'overflow-auto'}`}>
        {/* ── Global Top Bar ── */}
        {!isFullHeight && (
          <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md" style={{ borderBottom: '1px solid #f0f0f0' }}>
            <div className="max-w-[1080px] mx-auto px-10 py-3 flex items-center justify-between">
              <span className="text-sm" style={{ fontWeight: 500, color: '#8898aa' }}>
                {NAV_ITEMS.find(n => n.id === activeMenuItem)?.label}
              </span>

              <div className="flex items-center gap-2">
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(d => !d)}
                  className="w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-[#fafafa]"
                  style={{ color: '#8898aa', border: '1px solid #e6e6e6' }}
                  title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={darkMode ? 'sun' : 'moon'}
                      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={isFullHeight ? 'h-screen' : ''}>
          {activeMenuItem === 'dashboard' ? (
            <HomeDashboard pinnedChats={pinnedChats} onUnpinChat={handleUnpinChat} onNavigateToLens={() => setActiveMenuItem('lens-ai')} onNavigate={handleNavigate} />
          ) : activeMenuItem === 'insights' ? (
            <InsightsDashboard />
          ) : activeMenuItem === 'storefront' ? (
            <StorefrontDashboard />
          ) : activeMenuItem === 'payments' ? (
            <PaymentsDashboard forceTerminalKey={forceTerminalKey} />
          ) : activeMenuItem === 'capital' ? (
            <CapitalDashboard />
          ) : activeMenuItem === 'lens-ai' ? (
            <LensChatSimulator embedded pinnedChats={pinnedChats} onPinChat={handlePinChat} onUnpinChat={handleUnpinChat} key={forceTerminalKey} />
          ) : activeMenuItem === 'analytics' ? (
            <DataVisualizationDashboard />
          ) : null}

          {/* ── Locked view overlay ─ branded navy card, intentional IP-protection state ── */}
          <AnimatePresence>
            {!UNLOCKED_VIEWS.has(activeMenuItem) && (
              <motion.div
                key="lock-overlay"
                className="absolute inset-0 z-40 flex items-center justify-center"
                style={{
                  /* Soft navy wash instead of blurry white — reads as 'intentional' not 'broken' */
                  background:
                    'radial-gradient(ellipse at center, rgba(4,30,66,0.78) 0%, rgba(4,30,66,0.92) 70%)',
                  backdropFilter: 'blur(6px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(6px) saturate(140%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <motion.div
                  className="relative flex flex-col items-center gap-5 text-center rounded-2xl px-10 py-9 overflow-hidden"
                  style={{
                    background: '#041E42',
                    boxShadow:
                      '0 32px 80px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
                    border: '1px solid rgba(73,69,255,0.22)',
                    maxWidth: 400,
                  }}
                  initial={{ opacity: 0, scale: 0.92, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 12 }}
                  transition={{ duration: 0.26, type: 'spring', stiffness: 300, damping: 28 }}
                >
                  {/* Indigo radial glow behind the icon */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      top: -40,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 260,
                      height: 260,
                      background:
                        'radial-gradient(circle, rgba(73,69,255,0.35) 0%, transparent 60%)',
                    }}
                  />

                  {/* Lock icon badge — Delt indigo */}
                  <div
                    className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(73,69,255,0.18)',
                      border: '1px solid rgba(73,69,255,0.35)',
                    }}
                  >
                    <Lock className="w-6 h-6" style={{ color: '#FFFFFF' }} strokeWidth={2.2} />
                  </div>

                  {/* Label */}
                  <div className="relative flex flex-col gap-2">
                    <div
                      className="text-[11px] font-bold uppercase"
                      style={{ letterSpacing: '0.18em', color: '#4945FF' }}
                    >
                      Available on trial
                    </div>
                    <p style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 19, letterSpacing: '-0.3px' }}>
                      {NAV_ITEMS.find(n => n.id === activeMenuItem)?.label}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13.5, lineHeight: 1.6 }}>
                      This view is reserved for trial and live accounts. Your free dashboard already includes
                      Home, Lens AI, and Analytics.
                    </p>
                  </div>

                  {/* CTA — Delt indigo */}
                  <motion.button
                    onClick={() => navigate('/signup')}
                    className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm"
                    style={{ backgroundColor: '#4945FF', fontWeight: 600, letterSpacing: '-0.01em' }}
                    whileHover={{ scale: 1.02, backgroundColor: '#3933CC' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Start 14-day trial <ArrowRight size={14} />
                  </motion.button>

                  {/* Back link */}
                  <button
                    onClick={() => setActiveMenuItem('dashboard')}
                    className="relative text-xs hover:underline"
                    style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}
                  >
                    Back to Dashboard
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ Omnipresent Lens AI Floating Panel ═══ */}
      <div className="lens-floating-panel">
        <LensFloatingPanel activeTab={activeMenuItem} visible={activeMenuItem !== 'lens-ai'} pinnedChats={pinnedChats} onPinChat={handlePinChat} onUnpinChat={handleUnpinChat} />
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ═══ Mobile Bottom Navigation ═══ */}
      <div className="sandbox-mobile-nav">
        {[
          { id: 'dashboard', icon: LayoutGrid, label: 'Home' },
          { id: 'insights', icon: BarChart2, label: 'Insights' },
          { id: 'lens-ai', icon: Asterisk, label: 'Lens AI' },
          { id: 'analytics', icon: Activity, label: 'Analytics' },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeMenuItem === item.id;
          return (
            <div
              key={item.id}
              className={`sandbox-mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveMenuItem(item.id as NavId)}
            >
              <Icon
                size={20}
                style={{ color: isActive ? '#635bff' : '#8898aa' }}
              />
              <span
                className="sandbox-mobile-nav-label"
                style={{ color: isActive ? '#635bff' : '#8898aa' }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ═══ Floating "Start Free Trial" CTA ═══ */}
      <motion.button
        onClick={() => navigate('/signup')}
        className="sandbox-floating-cta fixed bottom-6 right-24 z-[90] flex items-center gap-2.5 px-8 py-4 rounded-full text-white text-base cursor-pointer"
        style={{
          background: '#635bff',
          boxShadow: '0 8px 32px rgba(99,91,255,0.40), 0 2px 8px rgba(0,0,0,0.12)',
          fontWeight: 600,
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.06, boxShadow: '0 16px 48px rgba(99,91,255,0.50), 0 4px 12px rgba(0,0,0,0.15)' }}
        whileTap={{ scale: 0.97 }}
      >
        Start Free Trial <ArrowRight size={18} />
      </motion.button>
      </div>
    </div>
    </>
  );
}