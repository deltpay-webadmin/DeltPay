import React, { useState, useMemo, useEffect } from 'react';
import { NavigationContext } from './NavigationContext';
import { SyncIndicator } from './SyncIndicator';
import { BackendDashboard } from './pages/BackendDashboard';
import { BackendLeads } from './pages/BackendLeads';
import { BackendMerchants } from './pages/BackendMerchants';
import { BackendUnderwriting } from './pages/BackendUnderwriting';
import { BackendDeals } from './pages/BackendDeals';
import { BackendAgents } from './pages/BackendAgents';
import { BackendFinancials } from './pages/BackendFinancials';
import { BackendLensAI } from './pages/BackendLensAI';
import { BackendSettings } from './pages/BackendSettings';
import { MerchantDetail } from './pages/MerchantDetail';
import { UnderwritingDetail } from './pages/UnderwritingDetail';
import { DealDetail } from './pages/DealDetail';
import { AgentDashboard } from './pages/AgentDashboard';
import { AgentCommissions } from './pages/AgentCommissions';
import { BackendOnboarding } from './pages/BackendOnboarding';
import { BackendRetention } from './pages/BackendRetention';
import { BackendEmployees } from './pages/BackendEmployees';
import { BackendPayroll } from './pages/BackendPayroll';
import { BackendAnalysis } from './pages/BackendAnalysis';
import { BackendResiduals, AgentResiduals } from './pages/BackendResiduals';
import { BackendCapital } from './pages/BackendCapital';
import { HelpCenter } from './pages/HelpCenter';
import { TemplateEditor } from './pages/TemplateEditor';
import { MerchantResidualDetail } from './pages/MerchantResidualDetail';
import { BackendDisputes } from './pages/BackendDisputes';
import { BackendOutreach } from './pages/BackendOutreach';
import { BackendCompliance } from './pages/BackendCompliance';
import { BackendWorkspace } from './pages/BackendWorkspace';
import { BackendActivityTimeline } from './pages/BackendActivityTimeline';
import { BackendTasks } from './pages/BackendTasks';
import { BackendInbox } from './pages/BackendInbox';
import { BackendWebsites } from './pages/BackendWebsites';
import { BackendSubscriptions } from './pages/BackendSubscriptions';
import { BackendDocuments } from './pages/BackendDocuments';
import { BackendPayments } from './pages/BackendPayments';
import { BackendReports } from './pages/BackendReports';
import {
  LayoutDashboard,
  Users,
  Store,
  ClipboardCheck,
  UserCircle,
  DollarSign,
  Sparkles,
  Search,
  Bell,
  Menu,
  X,
  Banknote,
  HelpCircle,
  ArrowLeftRight,
  CreditCard,
  ShieldAlert,
  Heart,
  Link2,
  Shield,
  ShieldCheck,
  Wrench,
  Briefcase,
  Receipt,
  ChevronRight,
  Home,
  FileText,
  Package,
  Send,
  Inbox,
  Globe,
  BarChart3,
  Upload,
  ArrowLeft,
  CalendarDays,
} from 'lucide-react';

// ── Types ──
type UserRole = 'admin' | 'agent';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string | null; // null → no overline header
  items: NavItem[];
}

// ── Admin sidebar: flat groups under overline headers (spec §4.2) ──
const adminGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { label: 'Overview', path: '/', icon: Home },
      { label: 'Workspace', path: '/workspace', icon: Inbox },
    ],
  },
  {
    label: 'Pipeline',
    items: [
      { label: 'Leads', path: '/leads', icon: Users },
      { label: 'Underwriting', path: '/underwriting', icon: ClipboardCheck },
      { label: 'Analysis', path: '/analysis', icon: FileText },
    ],
  },
  {
    label: 'Merchants',
    items: [
      { label: 'All Merchants', path: '/merchants', icon: Store },
      { label: 'Residuals', path: '/residuals', icon: Receipt },
      { label: 'Capital', path: '/capital', icon: Banknote },
      { label: 'Retention', path: '/retention', icon: Heart },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Disputes', path: '/disputes', icon: ShieldAlert },
      { label: 'Outreach', path: '/outreach', icon: Send },
      { label: 'Compliance', path: '/compliance', icon: ShieldCheck },
    ],
  },
  {
    label: 'Team',
    items: [
      { label: 'Agents', path: '/agents', icon: UserCircle },
      { label: 'Employees', path: '/employees', icon: Briefcase },
      { label: 'Payroll', path: '/payroll', icon: Receipt },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Lens AI', path: '/lens-ai', icon: Sparkles },
      { label: 'Financials', path: '/financials', icon: DollarSign },
      { label: 'Reports', path: '/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Products',
    items: [
      { label: 'Websites', path: '/websites', icon: Globe },
      { label: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'General', path: '/settings', icon: Wrench },
      { label: 'Integrations', path: '/settings/integrations', icon: Link2 },
      { label: 'Roles', path: '/settings/roles', icon: Shield },
      { label: 'Bundles', path: '/settings/bundles', icon: Package },
    ],
  },
];

// ── Agent sidebar (flat, no groups) ──
const agentGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'My Merchants', path: '/merchants', icon: Store },
      { label: 'My Leads', path: '/leads', icon: Users },
      { label: 'Commissions', path: '/commissions', icon: Banknote },
    ],
  },
];

// ── Page titles for the topbar ──
const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/workspace': 'Workspace',
  '/leads': 'Leads',
  '/leads/import': 'Import Leads',
  '/underwriting': 'Underwriting',
  '/analysis': 'Analysis',
  '/merchants': 'Merchants',
  '/residuals': 'Residuals',
  '/capital': 'Capital',
  '/retention': 'Retention',
  '/disputes': 'Disputes',
  '/outreach': 'Outreach',
  '/compliance': 'Compliance',
  '/agents': 'Agents',
  '/employees': 'Employees',
  '/payroll': 'Payroll',
  '/lens-ai': 'Lens AI',
  '/financials': 'Financials',
  '/reports': 'Reports',
  '/websites': 'Websites',
  '/subscriptions': 'Subscriptions',
  '/settings': 'Settings',
  '/settings/integrations': 'Integrations',
  '/settings/roles': 'Roles & Permissions',
  '/settings/bundles': 'Bundles',
  '/onboarding': 'Onboarding',
  '/deals': 'Deals',
  '/commissions': 'Commissions',
  '/my-residuals': 'My Residuals',
  '/tasks': 'Tasks',
  '/inbox': 'Inbox',
  '/documents': 'Documents',
  '/payments': 'Payments',
  '/activity-timeline': 'Activity',
};

function titleForPath(path: string): string {
  if (PAGE_TITLES[path]) return PAGE_TITLES[path];
  if (path.startsWith('/merchants/')) return 'Merchant';
  if (path.startsWith('/underwriting/')) return 'Underwriting';
  if (path.startsWith('/deals/')) return 'Deal';
  if (path.startsWith('/residuals/')) return 'Residuals';
  if (path.startsWith('/templates/')) return 'Template';
  return 'Overview';
}

// ── Breadcrumb helpers ──
function getBreadcrumbs(path: string): { label: string; path: string }[] {
  const crumbs: { label: string; path: string }[] = [{ label: 'Home', path: '/' }];
  if (path === '/') return crumbs;
  if (path.startsWith('/merchants/')) {
    const id = path.split('/')[2];
    crumbs.push({ label: 'Merchants', path: '/merchants' });
    crumbs.push({ label: id ? `Merchant #${id}` : 'Detail', path });
  } else if (path.startsWith('/underwriting/')) {
    const id = path.split('/')[2];
    crumbs.push({ label: 'Underwriting', path: '/underwriting' });
    crumbs.push({ label: id ? `Case #${id}` : 'Detail', path });
  } else if (path.startsWith('/deals/')) {
    const id = path.split('/')[2];
    crumbs.push({ label: 'Deals', path: '/deals' });
    crumbs.push({ label: id ? `Deal #${id}` : 'Detail', path });
  }
  return crumbs;
}

function isDeepPage(path: string): boolean {
  return path.startsWith('/merchants/') || path.startsWith('/underwriting/') || path.startsWith('/deals/');
}

// ── Command Palette Data ──
interface CommandItem {
  label: string;
  path: string;
  group: string;
  icon: React.ElementType;
  keywords?: string;
}

const allCommands: CommandItem[] = [
  { label: 'Overview', path: '/', group: 'Navigation', icon: Home },
  { label: 'Workspace', path: '/workspace', group: 'Navigation', icon: Inbox, keywords: 'inbox email sms call messages tasks activity timeline' },
  { label: 'Leads', path: '/leads', group: 'Pipeline', icon: Users, keywords: 'sales pipeline' },
  { label: 'Import Leads', path: '/leads/import', group: 'Pipeline', icon: Upload, keywords: 'upload csv xlsx spreadsheet meta facebook instagram bulk import' },
  { label: 'Underwriting', path: '/underwriting', group: 'Pipeline', icon: ClipboardCheck },
  { label: 'Analysis', path: '/analysis', group: 'Pipeline', icon: FileText, keywords: 'deal analysis review cost calculator' },
  { label: 'All Merchants', path: '/merchants', group: 'Merchants', icon: Store },
  { label: 'Residuals', path: '/residuals', group: 'Merchants', icon: Receipt },
  { label: 'Capital', path: '/capital', group: 'Merchants', icon: Banknote },
  { label: 'Retention', path: '/retention', group: 'Merchants', icon: Heart },
  { label: 'Disputes', path: '/disputes', group: 'Operations', icon: ShieldAlert, keywords: 'chargeback representment evidence' },
  { label: 'Outreach', path: '/outreach', group: 'Operations', icon: Send, keywords: 'email sms campaign automation bulk send' },
  { label: 'Compliance', path: '/compliance', group: 'Operations', icon: ShieldCheck, keywords: 'compliance rules' },
  { label: 'Agents', path: '/agents', group: 'Team', icon: UserCircle },
  { label: 'Employees', path: '/employees', group: 'Team', icon: Briefcase },
  { label: 'Payroll', path: '/payroll', group: 'Team', icon: Receipt },
  { label: 'Lens AI', path: '/lens-ai', group: 'Intelligence', icon: Sparkles, keywords: 'ai analysis' },
  { label: 'Financials', path: '/financials', group: 'Intelligence', icon: DollarSign, keywords: 'revenue profit' },
  { label: 'Reports', path: '/reports', group: 'Intelligence', icon: BarChart3, keywords: 'data visualization' },
  { label: 'Websites', path: '/websites', group: 'Products', icon: Globe, keywords: 'sites domain builder analytics' },
  { label: 'Subscriptions', path: '/subscriptions', group: 'Products', icon: CreditCard, keywords: 'billing plans MRR SaaS' },
  { label: 'Integrations', path: '/settings/integrations', group: 'Settings', icon: Link2 },
  { label: 'Roles & Permissions', path: '/settings/roles', group: 'Settings', icon: Shield },
  { label: 'Bundles', path: '/settings/bundles', group: 'Settings', icon: Package },
  { label: 'General Settings', path: '/settings', group: 'Settings', icon: Wrench },
];

const adminUser = { name: 'John Doe', initials: 'JD', email: 'john.doe@delt.com', role: 'Operations Manager' };
const agentUser = { name: 'Marcus Johnson', initials: 'MJ', email: 'marcus.j@delt.com', role: 'Senior Sales Agent' };

// ── Shared row styles ──
const itemBase =
  'w-full flex items-center gap-2.5 h-[34px] px-3 rounded-[8px] text-[13px] transition-colors';
const itemActive =
  'text-white bg-white/[0.06] font-semibold shadow-[inset_2px_0_0_var(--dp-accent)]';
const itemIdle =
  'text-(--dp-text-muted) hover:text-(--dp-text) hover:bg-white/[0.04] font-medium';

// ════════════════════════════════════════
// Main Layout
// ════════════════════════════════════════
export function DeltBackendLayout() {
  const [currentPage, setCurrentPage] = useState('/');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);

  // ── Command palette keyboard shortcut ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(prev => !prev);
        setCmdQuery('');
      }
      if (e.key === 'Escape') setCmdPaletteOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filteredCommands = useMemo(() => {
    if (!cmdQuery) return allCommands;
    const q = cmdQuery.toLowerCase();
    return allCommands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q) ||
      (c.keywords && c.keywords.toLowerCase().includes(q))
    );
  }, [cmdQuery]);

  const cmdGroups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filteredCommands.forEach(c => {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    });
    return map;
  }, [filteredCommands]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const toggleRole = () => {
    setUserRole(r => (r === 'admin' ? 'agent' : 'admin'));
    setCurrentPage('/');
    setIsUserMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    if (path === '/') return currentPage === '/';
    if (path === '/settings') return currentPage === '/settings';
    return currentPage === path || currentPage.startsWith(path + '/');
  };

  // ── Render page content ──
  const renderPage = () => {
    if (userRole === 'agent') {
      if (currentPage.startsWith('/templates/')) return <TemplateEditor />;
      if (currentPage.startsWith('/merchants/')) return <MerchantDetail />;
      switch (currentPage) {
        case '/': return <AgentDashboard />;
        case '/merchants': return <BackendMerchants />;
        case '/leads': return <BackendLeads />;
        case '/commissions': return <AgentCommissions />;
        case '/my-residuals': return <AgentResiduals />;
        case '/support': return (
          <div className="px-6 py-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Support</h1>
            <div className="bg-white rounded-[8px] border border-gray-200 p-6">
              <div className="max-w-lg">
                <p className="text-sm text-gray-600 mb-4">Need help? Contact the operations team or submit a support ticket.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-[6px]">
                    <HelpCircle className="w-5 h-5 text-indigo-600" />
                    <div><p className="text-sm font-medium text-gray-900">Email Support</p><p className="text-xs text-gray-500">support@deltpay.com</p></div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-[6px]">
                    <HelpCircle className="w-5 h-5 text-indigo-600" />
                    <div><p className="text-sm font-medium text-gray-900">Phone</p><p className="text-xs text-gray-500">(800) 555-DELT</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        default: return <AgentDashboard />;
      }
    }

    // Admin routes
    if (currentPage.startsWith('/templates/')) return <TemplateEditor />;
    if (currentPage.startsWith('/merchants/')) return <MerchantDetail />;
    if (currentPage.startsWith('/underwriting/')) return <UnderwritingDetail />;
    if (currentPage.startsWith('/deals/')) return <DealDetail />;
    if (currentPage.startsWith('/residuals/')) return <MerchantResidualDetail />;
    switch (currentPage) {
      case '/': return <BackendDashboard />;
      case '/leads': return <BackendLeads />;
      case '/leads/import': return <BackendLeads openImport />;
      case '/onboarding': return <BackendOnboarding />;
      case '/merchants': return <BackendMerchants />;
      case '/retention': return <BackendRetention />;
      case '/underwriting': return <BackendUnderwriting />;
      case '/deals': return <BackendDeals />;
      case '/agents': return <BackendAgents />;
      case '/financials': return <BackendFinancials />;
      case '/lens-ai': return <BackendLensAI />;
      case '/settings': return <BackendSettings />;
      case '/settings/integrations': return <BackendSettings />;
      case '/settings/roles': return <BackendSettings />;
      case '/settings/bundles': return <BackendSettings />;
      case '/employees': return <BackendEmployees />;
      case '/payroll': return <BackendPayroll />;
      case '/analysis': return <BackendAnalysis />;
      case '/residuals': return <BackendResiduals />;
      case '/capital': return <BackendCapital />;
      case '/disputes': return <BackendDisputes />;
      case '/outreach': return <BackendOutreach />;
      case '/compliance': return <BackendCompliance />;
      case '/activity-timeline': return <BackendActivityTimeline />;
      case '/tasks': return <BackendTasks />;
      case '/inbox': return <BackendInbox />;
      case '/workspace': return <BackendWorkspace />;
      case '/websites': return <BackendWebsites />;
      case '/subscriptions': return <BackendSubscriptions />;
      case '/documents': return <BackendDocuments />;
      case '/payments': return <BackendPayments />;
      case '/reports': return <BackendReports />;
      default: return <BackendDashboard />;
    }
  };

  const user = userRole === 'admin' ? adminUser : agentUser;
  const groups = userRole === 'admin' ? adminGroups : agentGroups;

  // ── Sidebar nav body (shared desktop/mobile) ──
  const navBody = (
    <nav className="flex-1 overflow-y-auto px-3 pb-3">
      {groups.map((group, gi) => (
        <div key={group.label ?? `g${gi}`} className={gi === 0 ? '' : 'mt-5'}>
          {group.label && (
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-(--dp-text-faint)">
              {group.label}
            </p>
          )}
          <div className="space-y-px">
            {group.items.map(item => {
              const Icon = item.icon;
              const active = isActivePath(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`${itemBase} ${active ? itemActive : itemIdle}`}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.25 : 2} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const sidebarFooter = (
    <>
      <div className="border-t border-white/[0.06] px-3 py-2 space-y-px">
        <a href="#/" className={`${itemBase} ${itemIdle}`}>
          <ArrowLeft className="w-4 h-4" />
          Return to site
        </a>
        <button onClick={() => setHelpCenterOpen(true)} className={`${itemBase} ${itemIdle}`}>
          <HelpCircle className="w-4 h-4" />
          Help &amp; Support
        </button>
      </div>

      <div className="border-t border-white/[0.06] px-3 py-3">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-[8px] hover:bg-white/[0.04] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-(--dp-accent-soft) flex items-center justify-center shrink-0">
              <span className="text-(--dp-accent-text) text-xs font-bold">{user.initials}</span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[13px] font-semibold text-(--dp-text) truncate leading-tight">{user.name}</p>
              <p className="font-mono text-[10px] text-(--dp-text-faint) truncate leading-tight mt-0.5 uppercase tracking-wide">
                {user.role}
              </p>
            </div>
          </button>

          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
              <div className="absolute left-0 bottom-full mb-2 w-56 bg-(--dp-bg-raised) rounded-[12px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] border border-(--dp-border) py-1 z-50">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-[13px] font-semibold text-(--dp-text)">{user.name}</p>
                  <p className="text-[11px] text-(--dp-text-muted)">{user.email}</p>
                </div>
                <button className="w-full px-4 py-2 text-left text-[13px] text-(--dp-text-secondary) hover:bg-white/[0.05]">Profile Settings</button>
                <button
                  onClick={toggleRole}
                  className="w-full px-4 py-2 text-left text-[13px] text-(--dp-text-secondary) hover:bg-white/[0.05] flex items-center gap-2"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Switch to {userRole === 'admin' ? 'Agent' : 'Admin'} View
                </button>
                <div className="border-t border-white/[0.06] mt-1 pt-1">
                  <button className="w-full px-4 py-2 text-left text-[13px] text-(--dp-danger) hover:bg-[rgba(242,86,91,.08)]">Log Out</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  const logo = (
    <button onClick={() => handleNavigate('/')} className="flex items-center gap-2.5 group">
      {/* Placeholder mark — swapped for the real Delt logo when supplied */}
      <div className="w-7 h-7 bg-(--dp-accent) rounded-[8px] flex items-center justify-center">
        <span className="text-white text-xs font-black">D</span>
      </div>
      <span className="text-[15px] font-bold text-(--dp-text) group-hover:text-(--dp-accent-text) transition-colors">
        Delt
      </span>
    </button>
  );

  return (
    <NavigationContext.Provider value={{ navigate: handleNavigate, currentPage }}>
      <div className="flex h-screen bg-(--dp-bg-surface) font-sans">

        {/* ═══ Left Sidebar — 240px on bg-base ═══ */}
        <aside className="hidden lg:flex flex-col w-[240px] bg-(--dp-bg-base) border-r border-white/[0.06] shrink-0">
          <div className="px-6 h-16 flex items-center shrink-0">{logo}</div>
          {navBody}
          {sidebarFooter}
        </aside>

        {/* ═══ Right side: top bar + content ═══ */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* ── Topbar — 64px, page title + tools ── */}
          <header className="bg-(--dp-bg-surface) border-b border-white/[0.06] shrink-0 z-30">
            <div className="flex items-center h-16 px-4 lg:px-8 gap-3">
              {/* Mobile hamburger + logo */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-white/[0.06] rounded-[8px]"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-(--dp-text-secondary)" />
              </button>
              <div className="lg:hidden">{logo}</div>

              {/* Page title */}
              <h1 className="hidden lg:block text-[22px] font-bold text-(--dp-text) tracking-[-0.01em]">
                {titleForPath(currentPage)}
              </h1>

              {/* Right tools */}
              <div className="flex items-center gap-2 ml-auto">
                <SyncIndicator />

                {/* Search chip */}
                <button
                  onClick={() => setCmdPaletteOpen(true)}
                  className="hidden md:inline-flex items-center gap-2 h-9 pl-3 pr-2 rounded-full border border-(--dp-border) text-[13px] text-(--dp-text-faint) hover:border-(--dp-border-strong) hover:text-(--dp-text-muted) transition-colors w-56"
                >
                  <Search className="w-4 h-4" />
                  <span className="flex-1 text-left">Search</span>
                  <kbd className="font-mono text-[10px] text-(--dp-text-faint) bg-white/[0.06] border border-(--dp-border) rounded-[6px] px-1.5 py-0.5">⌘K</kbd>
                </button>
                <button
                  onClick={() => setCmdPaletteOpen(true)}
                  className="md:hidden p-2 hover:bg-white/[0.06] rounded-[8px]"
                  aria-label="Search"
                >
                  <Search className="w-[18px] h-[18px] text-(--dp-text-muted)" />
                </button>

                {/* Date-range chip */}
                <span className="hidden xl:inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-(--dp-border) text-[12px] font-semibold text-(--dp-text-muted)">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Last 30 days
                </span>

                {/* Role toggle */}
                <button
                  onClick={toggleRole}
                  className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-(--dp-border) text-[12px] font-semibold text-(--dp-text-muted) hover:text-(--dp-text) hover:border-(--dp-border-strong) transition-colors"
                  title="Switch view"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  {userRole === 'admin' ? 'Agent' : 'Admin'}
                </button>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-white/[0.06] rounded-full transition-colors" aria-label="Notifications">
                  <Bell className="w-[18px] h-[18px] text-(--dp-text-muted)" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-(--dp-accent) rounded-full" />
                </button>

                {/* Avatar */}
                <button
                  onClick={() => setIsUserMenuOpen(v => !v)}
                  className="w-8 h-8 rounded-full bg-(--dp-accent-soft) flex items-center justify-center"
                  aria-label="Account"
                >
                  <span className="text-(--dp-accent-text) text-xs font-bold">{user.initials}</span>
                </button>
              </div>
            </div>
          </header>

          {/* ── Breadcrumbs (deep pages only) ── */}
          {isDeepPage(currentPage) && (
            <div className="bg-(--dp-bg-surface) border-b border-white/[0.06] px-8 py-2.5 shrink-0">
              <nav className="flex items-center gap-1.5 text-[13px]">
                {getBreadcrumbs(currentPage).map((crumb, i, arr) => (
                  <React.Fragment key={crumb.path}>
                    {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-(--dp-text-faint)" />}
                    {i < arr.length - 1 ? (
                      <button
                        onClick={() => handleNavigate(crumb.path)}
                        className="text-(--dp-text-muted) hover:text-(--dp-accent-text) transition-colors"
                      >
                        {i === 0 ? <Home className="w-4 h-4" /> : crumb.label}
                      </button>
                    ) : (
                      <span className="text-(--dp-text) font-medium">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </div>
          )}

          {/* ── Content ── */}
          <main className="flex-1 overflow-y-auto">
            {renderPage()}
          </main>
        </div>

        {/* ═══ Mobile Sidebar Overlay ═══ */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="fixed left-0 top-0 bottom-0 w-[264px] bg-(--dp-bg-base) flex flex-col shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06] shrink-0">
                {logo}
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/[0.06] rounded-[8px]" aria-label="Close menu">
                  <X className="w-5 h-5 text-(--dp-text-muted)" />
                </button>
              </div>
              {navBody}
              <div className="border-t border-white/[0.06] px-3 py-3">
                <div className="flex items-center gap-2.5 px-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-(--dp-accent-soft) flex items-center justify-center shrink-0">
                    <span className="text-(--dp-accent-text) text-xs font-bold">{user.initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-(--dp-text) truncate">{user.name}</p>
                    <p className="text-[11px] text-(--dp-text-faint) truncate">{user.role}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ═══ Command Palette ═══ */}
        {cmdPaletteOpen && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setCmdPaletteOpen(false)} />
            <div className="relative w-full max-w-lg bg-(--dp-bg-card) rounded-[16px] shadow-[0_16px_40px_rgba(0,0,0,0.55)] border border-(--dp-border) overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-(--dp-border)">
                <Search className="w-5 h-5 text-(--dp-text-faint) shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={cmdQuery}
                  onChange={e => setCmdQuery(e.target.value)}
                  placeholder="Type a command or search…"
                  className="flex-1 text-[13px] text-(--dp-text) placeholder-(--dp-text-faint) outline-none bg-transparent"
                />
                <kbd className="font-mono text-[10px] text-(--dp-text-faint) bg-white/[0.06] border border-(--dp-border) rounded-[6px] px-1.5 py-0.5">ESC</kbd>
              </div>
              <div className="max-h-[50vh] overflow-y-auto py-2">
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[13px] text-(--dp-text-faint)">No results found</div>
                ) : (
                  Array.from(cmdGroups.entries()).map(([group, items]) => (
                    <div key={group}>
                      <p className="px-4 pt-3 pb-1 text-[10px] text-(--dp-text-faint) uppercase tracking-[0.14em] font-bold">{group}</p>
                      {items.map(item => {
                        const CmdIcon = item.icon;
                        return (
                          <button
                            key={item.path}
                            onClick={() => { handleNavigate(item.path); setCmdPaletteOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-(--dp-text-secondary) hover:bg-(--dp-accent-soft) hover:text-(--dp-accent-text) transition-colors"
                          >
                            <CmdIcon className="w-4 h-4 text-(--dp-text-faint)" />
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-(--dp-text-faint)" />
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-(--dp-border) px-4 py-2 flex items-center gap-4 text-[10px] text-(--dp-text-faint)">
                <span className="flex items-center gap-1"><kbd className="bg-white/[0.06] border border-(--dp-border) rounded px-1">&#8593;&#8595;</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/[0.06] border border-(--dp-border) rounded px-1">&#8629;</kbd> Open</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/[0.06] border border-(--dp-border) rounded px-1">esc</kbd> Close</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Help Center Modal ═══ */}
        {helpCenterOpen && (
          <HelpCenter onClose={() => setHelpCenterOpen(false)} />
        )}
      </div>
    </NavigationContext.Provider>
  );
}
