import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router';
import { NavigationContext } from './NavigationContext';
import { useSession } from './SessionContext';
import { useOrgTheme } from './useOrgTheme';
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
import { BackendPlaid } from './pages/BackendPlaid';
import { BackendMarketing } from './pages/BackendMarketing';
import { AgentSubmitDeal } from './pages/AgentSubmitDeal';
import { AgentDealDesk } from './pages/AgentDealDesk';
import { AgentResources } from './pages/AgentResources';
import { AgentLeaderboard } from './pages/AgentLeaderboard';
import { AgentTraining } from './pages/AgentTraining';
import { BackendAgentDesk } from './pages/BackendAgentDesk';
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
  Megaphone,
  Inbox,
  Globe,
  BarChart3,
  Upload,
  ArrowLeft,
  ArrowLeftRight,
  CalendarDays,
  Sun,
  Moon,
  PenTool,
  LogOut,
  Send,
  GraduationCap,
  Trophy,
  MessageSquare,
  BookOpen,
} from 'lucide-react';

// ── Types ──

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  /** '<module>.view' key from the RBAC matrix; undefined → visible to all roles */
  perm?: string;
}

interface NavGroup {
  label: string | null; // null → no overline header
  items: NavItem[];
}

// ── Admin sidebar: flat groups under overline headers (spec §4.2).
//    Items are filtered per-user by the RBAC matrix (see visibleGroups). ──
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
      { label: 'Leads', path: '/leads', icon: Users, perm: 'leads.view' },
      { label: 'Onboarding', path: '/onboarding', icon: Package, perm: 'merchants.view' },
      { label: 'Underwriting', path: '/underwriting', icon: ClipboardCheck, perm: 'underwriting.view' },
      { label: 'Analysis', path: '/analysis', icon: FileText, perm: 'analysis.view' },
    ],
  },
  {
    label: 'Merchants',
    items: [
      { label: 'All Merchants', path: '/merchants', icon: Store, perm: 'merchants.view' },
      { label: 'Portfolio', path: '/deals', icon: LayoutDashboard, perm: 'capital.view' },
      { label: 'Residuals', path: '/residuals', icon: Receipt, perm: 'residuals.view' },
      { label: 'Capital', path: '/capital', icon: Banknote, perm: 'capital.view' },
      { label: 'Retention', path: '/retention', icon: Heart, perm: 'health.view' },
    ],
  },
  {
    label: 'Operations',
    items: [
      // Tasks/Inbox/Activity Timeline stay URL-reachable but are not listed:
      // Workspace is the one-stop inbox+tasks+activity hub.
      { label: 'Payments', path: '/payments', icon: CreditCard, perm: 'capital.view' },
      { label: 'Documents & E-Sign', path: '/documents', icon: PenTool, perm: 'merchants.view' },
      { label: 'Disputes', path: '/disputes', icon: ShieldAlert, perm: 'merchants.view' },
      { label: 'Marketing', path: '/marketing', icon: Megaphone, perm: 'integrations.view' },
      { label: 'Compliance', path: '/compliance', icon: ShieldCheck, perm: 'general.view' },
    ],
  },
  {
    label: 'Team',
    items: [
      { label: 'Agents', path: '/agents', icon: UserCircle, perm: 'agents.view' },
      { label: 'Agent Desk', path: '/agent-desk', icon: Inbox, perm: 'agents.edit' },
      { label: 'Employees', path: '/employees', icon: Briefcase, perm: 'employees.view' },
      { label: 'Payroll', path: '/payroll', icon: Receipt, perm: 'payroll.view' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Lens AI', path: '/lens-ai', icon: Sparkles, perm: 'lens_ai.view' },
      { label: 'Financials', path: '/financials', icon: DollarSign, perm: 'financials.view' },
      { label: 'Reports', path: '/reports', icon: BarChart3, perm: 'financials.view' },
    ],
  },
  {
    label: 'Products',
    items: [
      { label: 'Websites', path: '/websites', icon: Globe, perm: 'merchants.view' },
      { label: 'Subscriptions', path: '/subscriptions', icon: CreditCard, perm: 'billing.view' },
    ],
  },
  {
    label: null,
    items: [{ label: 'Settings', path: '/settings', icon: Wrench, perm: 'general.view' }],
  },
];

// ── Agent sidebar (flat, no groups) ──
const agentGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'My Merchants', path: '/merchants', icon: Store, perm: 'merchants.view' },
      { label: 'My Leads', path: '/leads', icon: Users, perm: 'leads.view' },
      { label: 'Sales Tools', path: '/analysis', icon: Sparkles, perm: 'analysis.view' },
      { label: 'Training', path: '/training', icon: GraduationCap },
      { label: 'My Residuals', path: '/my-residuals', icon: Receipt, perm: 'residuals.view' },
      { label: 'Commissions', path: '/commissions', icon: Banknote, perm: 'compensation.view' },
    ],
  },
  {
    label: 'Grow',
    items: [
      { label: 'Submit a Deal', path: '/submit-deal', icon: Send, perm: 'leads.create' },
      { label: 'Deal Desk', path: '/deal-desk', icon: MessageSquare },
      { label: "President's Club", path: '/leaderboard', icon: Trophy },
      { label: 'Resources', path: '/resources', icon: BookOpen },
    ],
  },
];

// ── Page titles for the topbar ──
const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/workspace': 'Workspace',
  '/leads': 'Sales Leads',
  '/leads/import': 'Import Leads',
  '/underwriting': 'Underwriting',
  '/analysis': 'Analysis',
  '/merchants': 'All Merchants',
  '/residuals': 'Residual Reports',
  '/capital': 'Capital',
  '/retention': 'Retention & Churn',
  '/disputes': 'Disputes',
  '/marketing': 'Marketing Hub',
  '/outreach': 'Marketing Hub',
  '/compliance': 'Compliance',
  '/agents': 'Agents',
  '/employees': 'Employees',
  '/payroll': 'Payroll',
  '/lens-ai': 'Lens AI',
  '/financials': 'Financials',
  '/reports': 'Reports & Export Center',
  '/websites': 'Websites',
  '/subscriptions': 'Subscriptions',
  '/settings': 'Settings',
  '/settings/integrations': 'Integrations',
  '/settings/roles': 'Roles & Permissions',
  '/settings/bundles': 'Bundles',
  '/onboarding': 'Onboarding',
  '/deals': 'Portfolio',
  '/commissions': 'Commissions',
  '/my-residuals': 'My Residuals',
  '/submit-deal': 'Submit a Deal',
  '/deal-desk': 'Deal Desk',
  '/resources': 'Resources',
  '/training': 'Merchant Services Training',
  '/leaderboard': "President's Club",
  '/agent-desk': 'Agent Desk',
  '/tasks': 'Tasks',
  '/inbox': 'Inbox',
  '/documents': 'Documents & E-Sign',
  '/payments': 'Payments & Collections',
  '/activity-timeline': 'Activity Timeline',
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
  perm?: string;
}

const allCommands: CommandItem[] = [
  { label: 'Overview', path: '/', group: 'Navigation', icon: Home },
  { label: 'Workspace', path: '/workspace', group: 'Navigation', icon: Inbox, keywords: 'inbox email sms call messages tasks activity timeline' },
  { label: 'Leads', path: '/leads', group: 'Pipeline', icon: Users, keywords: 'sales pipeline', perm: 'leads.view' },
  { label: 'Import Leads', path: '/leads/import', group: 'Pipeline', icon: Upload, keywords: 'upload csv xlsx spreadsheet meta facebook instagram bulk import', perm: 'leads.create' },
  { label: 'Onboarding', path: '/onboarding', group: 'Pipeline', icon: Package, keywords: 'merchant setup sla bank connections activation', perm: 'merchants.view' },
  { label: 'Underwriting', path: '/underwriting', group: 'Pipeline', icon: ClipboardCheck, keywords: 'plaid portal vault lending prospects bank credit identity verification', perm: 'underwriting.view' },
  { label: 'Analysis', path: '/analysis', group: 'Pipeline', icon: FileText, keywords: 'deal analysis review cost calculator', perm: 'analysis.view' },
  { label: 'All Merchants', path: '/merchants', group: 'Merchants', icon: Store, perm: 'merchants.view' },
  { label: 'Portfolio', path: '/deals', group: 'Merchants', icon: LayoutDashboard, keywords: 'deals capital deployment book', perm: 'capital.view' },
  { label: 'Residuals', path: '/residuals', group: 'Merchants', icon: Receipt, perm: 'residuals.view' },
  { label: 'Capital', path: '/capital', group: 'Merchants', icon: Banknote, perm: 'capital.view' },
  { label: 'Retention', path: '/retention', group: 'Merchants', icon: Heart, perm: 'health.view' },
  { label: 'Payments', path: '/payments', group: 'Operations', icon: CreditCard, keywords: 'ach collections fundings payment health', perm: 'capital.view' },
  { label: 'Documents & E-Sign', path: '/documents', group: 'Operations', icon: PenTool, keywords: 'contracts docusign envelopes esign', perm: 'merchants.view' },
  { label: 'Disputes', path: '/disputes', group: 'Operations', icon: ShieldAlert, keywords: 'chargeback representment evidence', perm: 'merchants.view' },
  { label: 'Marketing Hub', path: '/marketing', group: 'Operations', icon: Megaphone, keywords: 'ads ad spend cac roas funnel google meta outreach email sms campaign automation bulk send', perm: 'integrations.view' },
  { label: 'Compliance', path: '/compliance', group: 'Operations', icon: ShieldCheck, keywords: 'compliance rules', perm: 'general.view' },
  { label: 'Agents', path: '/agents', group: 'Team', icon: UserCircle, perm: 'agents.view' },
  { label: 'My Residuals (Agent view)', path: '/my-residuals', group: 'Team', icon: Receipt, keywords: 'agent portal residual statement book', perm: 'residuals.view' },
  { label: 'Commissions (Agent view)', path: '/commissions', group: 'Team', icon: Banknote, keywords: 'agent portal commission statement payout', perm: 'compensation.view' },
  { label: 'Agent Desk', path: '/agent-desk', group: 'Team', icon: Inbox, keywords: 'deal submissions pipeline mpa activate bonus deal desk support threads', perm: 'agents.edit' },
  { label: 'Submit a Deal', path: '/submit-deal', group: 'Team', icon: Send, keywords: 'mpa merchant application agent pipeline bonus', perm: 'leads.create' },
  { label: "President's Club", path: '/leaderboard', group: 'Team', icon: Trophy, keywords: 'leaderboard standings quarterly top producers' },
  { label: 'Resources', path: '/resources', group: 'Team', icon: BookOpen, keywords: 'playbooks objection scripts collateral leave-behinds' },
  { label: 'Training', path: '/training', group: 'Team', icon: GraduationCap, keywords: 'merchant services curriculum lessons quiz certification interchange pricing underwriting' },
  { label: 'Employees', path: '/employees', group: 'Team', icon: Briefcase, perm: 'employees.view' },
  { label: 'Payroll', path: '/payroll', group: 'Team', icon: Receipt, perm: 'payroll.view' },
  { label: 'Lens AI', path: '/lens-ai', group: 'Intelligence', icon: Sparkles, keywords: 'ai analysis', perm: 'lens_ai.view' },
  { label: 'Financials', path: '/financials', group: 'Intelligence', icon: DollarSign, keywords: 'revenue profit', perm: 'financials.view' },
  { label: 'Reports', path: '/reports', group: 'Intelligence', icon: BarChart3, keywords: 'data visualization', perm: 'financials.view' },
  { label: 'Websites', path: '/websites', group: 'Products', icon: Globe, keywords: 'sites domain builder analytics', perm: 'merchants.view' },
  { label: 'Subscriptions', path: '/subscriptions', group: 'Products', icon: CreditCard, keywords: 'billing plans MRR SaaS', perm: 'billing.view' },
  { label: 'Integrations', path: '/settings/integrations', group: 'Settings', icon: Link2, perm: 'integrations.view' },
  { label: 'Roles & Permissions', path: '/settings/roles', group: 'Settings', icon: Shield, perm: 'roles.view' },
  { label: 'General Settings', path: '/settings', group: 'Settings', icon: Wrench, perm: 'general.view' },
];

// ── Shared row styles ──
const itemBase =
  'w-full flex items-center gap-2.5 h-[34px] px-3 rounded-[8px] text-[13px] transition-colors';
const itemActive =
  'text-(--dp-text) bg-white/[0.06] font-semibold shadow-[inset_2px_0_0_var(--dp-accent)]';
const itemIdle =
  'text-(--dp-text-muted) hover:text-(--dp-text) hover:bg-white/[0.04] font-medium';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  agent: 'Agent',
  viewer: 'Viewer',
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts
    .slice(0, 2)
    .map(p => p[0]!.toUpperCase())
    .join('');
}

/** Route guard: RLS enforces this server-side; the redirect is just UX. */
function Guard({ perm, children }: { perm?: string; children: React.ReactElement }) {
  const { can } = useSession();
  if (perm && !can(perm)) return <Navigate to="/dashboard" replace />;
  return children;
}

// ════════════════════════════════════════
// Main Layout
// ════════════════════════════════════════
export function DeltBackendLayout() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const session = useSession();
  const { role, can, org, displayName, email, signOut } = session;
  useOrgTheme(org);

  // The CRM mounts under /dashboard/* — internal paths stay in the legacy
  // '/leads' shape so useAppNavigate() consumers keep working unchanged.
  const currentPage = location.pathname.replace(/^\/dashboard/, '') || '/';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return localStorage.getItem('delt-crm-theme') === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('delt-crm-theme', theme);
    } catch {
      /* private mode — theme just won't persist */
    }
  }, [theme]);

  // ── Agent-view preview for admins: flips the sidebar and home page to the
  // agent workspace without touching identity or permissions. Real agents are
  // always in agent view; the pages themselves already let admins pick which
  // agent's book to inspect (AgentResiduals/AgentCommissions pickers). ──
  const [agentViewPreview, setAgentViewPreview] = useState(() => {
    try {
      return localStorage.getItem('delt-crm-agent-view') === '1';
    } catch {
      return false;
    }
  });
  const agentView = role === 'agent' || agentViewPreview;

  useEffect(() => {
    try {
      localStorage.setItem('delt-crm-agent-view', agentViewPreview ? '1' : '0');
    } catch {
      /* private mode — preview just won't persist */
    }
  }, [agentViewPreview]);

  const toggleAgentView = () => {
    setAgentViewPreview(v => !v);
    setIsUserMenuOpen(false);
    handleNavigate('/');
  };

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

  const permittedCommands = useMemo(
    () => allCommands.filter(c => !c.perm || can(c.perm)),
    [can],
  );

  const filteredCommands = useMemo(() => {
    if (!cmdQuery) return permittedCommands;
    const q = cmdQuery.toLowerCase();
    return permittedCommands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q) ||
      (c.keywords && c.keywords.toLowerCase().includes(q))
    );
  }, [cmdQuery, permittedCommands]);

  const cmdGroups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filteredCommands.forEach(c => {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    });
    return map;
  }, [filteredCommands]);

  const handleNavigate = (page: string) => {
    routerNavigate(page === '/' ? '/dashboard' : `/dashboard${page}`);
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    if (path === '/') return currentPage === '/';
    if (path === '/settings') return currentPage.startsWith('/settings');
    return currentPage === path || currentPage.startsWith(path + '/');
  };

  const user = {
    name: displayName || 'Team member',
    initials: initialsOf(displayName || email || '?'),
    email,
    role: ROLE_LABELS[role] ?? role,
  };

  // Agents get the focused agent workspace; admins/viewers get the full
  // sidebar filtered down to what their role can see.
  const groups = useMemo<NavGroup[]>(() => {
    const source = agentView ? agentGroups : adminGroups;
    return source
      .map(g => ({ ...g, items: g.items.filter(item => !item.perm || can(item.perm)) }))
      .filter(g => g.items.length > 0);
  }, [agentView, can]);

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
                {role !== 'agent' && (
                  <button
                    onClick={toggleAgentView}
                    className="w-full px-4 py-2 text-left text-[13px] text-(--dp-text-secondary) hover:bg-white/[0.05] flex items-center gap-2"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    {agentViewPreview ? 'Switch to Admin View' : 'Switch to Agent View'}
                  </button>
                )}
                <div className="border-t border-white/[0.06] mt-1 pt-1">
                  <button
                    onClick={() => { setIsUserMenuOpen(false); void signOut(); }}
                    className="w-full px-4 py-2 text-left text-[13px] text-(--dp-danger) hover:bg-[rgba(242,86,91,.08)] flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
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
      {org?.logoUrl ? (
        <img src={org.logoUrl} alt={org.name} className="w-7 h-7 rounded-[8px] object-contain" />
      ) : (
        /* Delt brand mark — geometry lifted from the official logo asset
           (rounded bar + dot, brand indigo). Inline SVG so it renders crisp
           at any DPI; slight baseline nudge optically centers it against
           the wordmark text. */
        <svg
          viewBox="0 0 125.2 168.3"
          className="h-6 w-auto shrink-0 translate-y-[1px]"
          aria-hidden="true"
        >
          <rect x="74.4" width="50.8" height="168.3" rx="17.2" fill="#4945FF" />
          <circle cx="33.3" cy="117.5" r="33.3" fill="#4945FF" />
        </svg>
      )}
      {/* Brand lockup reads just "Delt" — the full org legal name lives in
          Settings, not the sidebar. */}
      <span className="text-[17px] font-bold tracking-tight text-(--dp-text) group-hover:text-(--dp-accent-text) transition-colors">
        Delt
      </span>
    </button>
  );

  const roleHome = agentView ? <AgentDashboard /> : <BackendDashboard />;

  return (
    <NavigationContext.Provider value={{ navigate: handleNavigate, currentPage }}>
      <div className={`flex h-screen bg-(--dp-bg-surface) font-sans ${theme === 'light' ? 'dp-light' : ''}`}>

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
                {agentViewPreview && role !== 'agent' && (
                  <button
                    onClick={toggleAgentView}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-(--dp-accent-soft) border border-(--dp-accent) text-[12px] font-semibold text-(--dp-accent-text) hover:opacity-80 transition-opacity"
                    title="You are previewing the agent workspace. Click to return to admin view."
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Agent view — Exit
                  </button>
                )}
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

                {/* Theme toggle */}
                <button
                  onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
                  className="p-2 hover:bg-white/[0.06] rounded-full transition-colors"
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                  {theme === 'dark'
                    ? <Sun className="w-[18px] h-[18px] text-(--dp-text-muted)" />
                    : <Moon className="w-[18px] h-[18px] text-(--dp-text-muted)" />}
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

          {/* ── Content: real routes under /dashboard/* — deep links and the
                back button work, and every page is reachable by URL ── */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route index element={roleHome} />
              <Route path="workspace" element={<BackendWorkspace />} />
              <Route path="leads" element={<Guard perm="leads.view"><BackendLeads /></Guard>} />
              <Route path="leads/import" element={<Guard perm="leads.create"><BackendLeads openImport /></Guard>} />
              <Route path="onboarding" element={<Guard perm="merchants.view"><BackendOnboarding /></Guard>} />
              <Route path="merchants" element={<Guard perm="merchants.view"><BackendMerchants /></Guard>} />
              <Route path="merchants/:merchantId/*" element={<Guard perm="merchants.view"><MerchantDetail /></Guard>} />
              <Route path="underwriting" element={<Guard perm="underwriting.view"><UnderwritingHub /></Guard>} />
              <Route path="underwriting/:caseId" element={<Guard perm="underwriting.view"><UnderwritingDetail /></Guard>} />
              <Route path="deals" element={<Guard perm="capital.view"><BackendDeals /></Guard>} />
              <Route path="deals/:dealId" element={<Guard perm="capital.view"><DealDetail /></Guard>} />
              <Route path="residuals" element={<Guard perm="residuals.view"><BackendResiduals /></Guard>} />
              <Route path="residuals/:merchantId" element={<Guard perm="residuals.view"><MerchantResidualDetail /></Guard>} />
              <Route path="my-residuals" element={<Guard perm="residuals.view"><AgentResiduals /></Guard>} />
              <Route path="capital" element={<Guard perm="capital.view"><BackendCapital /></Guard>} />
              <Route path="retention" element={<Guard perm="health.view"><BackendRetention /></Guard>} />
              <Route path="templates/:templateId" element={<TemplateEditor />} />
              <Route path="tasks" element={<BackendTasks />} />
              <Route path="inbox" element={<BackendInbox />} />
              <Route path="payments" element={<Guard perm="capital.view"><BackendPayments /></Guard>} />
              <Route path="activity-timeline" element={<Guard perm="leads.view"><BackendActivityTimeline /></Guard>} />
              <Route path="documents" element={<Guard perm="merchants.view"><BackendDocuments /></Guard>} />
              <Route path="disputes" element={<Guard perm="merchants.view"><BackendDisputes /></Guard>} />
              <Route path="marketing" element={<Guard perm="integrations.view"><MarketingHub /></Guard>} />
              <Route path="outreach" element={<Guard perm="integrations.view"><MarketingHub initialView="outreach" /></Guard>} />
              <Route path="compliance" element={<Guard perm="general.view"><BackendCompliance /></Guard>} />
              <Route path="agents" element={<Guard perm="agents.view"><BackendAgents /></Guard>} />
              <Route path="employees" element={<Guard perm="employees.view"><BackendEmployees /></Guard>} />
              <Route path="payroll" element={<Guard perm="payroll.view"><BackendPayroll /></Guard>} />
              <Route path="analysis" element={<Guard perm="analysis.view"><BackendAnalysis /></Guard>} />
              <Route path="lens-ai" element={<Guard perm="lens_ai.view"><BackendLensAI /></Guard>} />
              <Route path="financials" element={<Guard perm="financials.view"><BackendFinancials /></Guard>} />
              <Route path="reports" element={<Guard perm="financials.view"><BackendReports /></Guard>} />
              <Route path="websites" element={<Guard perm="merchants.view"><BackendWebsites /></Guard>} />
              <Route path="subscriptions" element={<Guard perm="billing.view"><BackendSubscriptions /></Guard>} />
              <Route path="commissions" element={<Guard perm="compensation.view"><AgentCommissions /></Guard>} />
              <Route path="submit-deal" element={<Guard perm="leads.create"><AgentSubmitDeal /></Guard>} />
              <Route path="deal-desk" element={<AgentDealDesk />} />
              <Route path="resources" element={<AgentResources />} />
              <Route path="leaderboard" element={<AgentLeaderboard />} />
              <Route path="training" element={<AgentTraining />} />
              <Route path="agent-desk" element={<Guard perm="agents.edit"><BackendAgentDesk /></Guard>} />
              <Route path="support" element={<SupportPage />} />
              <Route path="settings" element={<Guard perm="general.view"><BackendSettings /></Guard>} />
              <Route path="settings/integrations" element={<Guard perm="integrations.view"><BackendSettings /></Guard>} />
              <Route path="settings/roles" element={<Guard perm="roles.view"><BackendSettings /></Guard>} />
              <Route path="settings/bundles" element={<Guard perm="general.view"><BackendSettings /></Guard>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
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

// ── Agent support page ──
function SupportPage() {
  return (
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
}

// ── Underwriting hub: the Plaid portal is the front door; the scoring
// pipeline sits behind a second tab. Deep links (/underwriting/:id) still
// open the case detail directly. ──
function UnderwritingHub() {
  const [view, setView] = useState<'portal' | 'pipeline'>('portal');
  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 flex items-center gap-6 px-4 lg:px-8 pt-4 border-b border-white/[0.06]">
        {([
          { key: 'portal' as const, label: 'Plaid Portal' },
          { key: 'pipeline' as const, label: 'Pipeline' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`px-1 pb-3 text-[13px] font-semibold border-b-2 transition-colors ${
              view === t.key
                ? 'border-(--dp-accent) text-(--dp-accent-text)'
                : 'border-transparent text-(--dp-text-muted) hover:text-(--dp-text)'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {view === 'portal' ? <BackendPlaid /> : <BackendUnderwriting />}
      </div>
    </div>
  );
}

// ── Marketing hub: paid performance (ad spend / CAC / ROAS) is the front
// door; the outreach campaign engine sits behind a second tab. The legacy
// /outreach path deep-links straight to that tab. ──
function MarketingHub({ initialView = 'performance' }: { initialView?: 'performance' | 'outreach' }) {
  const [view, setView] = useState<'performance' | 'outreach'>(initialView);
  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 flex items-center gap-6 px-4 lg:px-8 pt-4 border-b border-white/[0.06]">
        {([
          { key: 'performance' as const, label: 'Performance' },
          { key: 'outreach' as const, label: 'Outreach' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`px-1 pb-3 text-[13px] font-semibold border-b-2 transition-colors ${
              view === t.key
                ? 'border-(--dp-accent) text-(--dp-accent-text)'
                : 'border-transparent text-(--dp-text-muted) hover:text-(--dp-text)'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {view === 'performance' ? <BackendMarketing /> : <BackendOutreach />}
      </div>
    </div>
  );
}
