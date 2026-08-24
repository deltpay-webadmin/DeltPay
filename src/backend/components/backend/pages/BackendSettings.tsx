import React, { useState } from 'react';
import {
  Settings, ChevronDown, Link2, Shield, Users,
  Plus, Check, X, Eye, EyeOff, Lock, Unlock, UserCircle, Languages,
} from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';
import { useLang } from '../i18n';
import { useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../../lib/supabase';
import { useSession } from '../SessionContext';
import { contractActions } from '../contractsStore';

// ─── ROLE DEFINITIONS ───────────────────────────────────────────
const ROLES = [
  { id: 'super_admin', name: 'Super Admin', description: 'Full platform access. Company settings, financials, RBAC, all modules.', color: '#2E6BFF', isSystem: true },
  { id: 'admin', name: 'Admin', description: 'Operational access across all modules. Cannot modify roles, billing, or company settings.', color: '#2BB56D', isSystem: true },
  { id: 'agent', name: 'Agent', description: 'Portfolio-scoped access. Sees only assigned merchants, leads, and own compensation.', color: '#F0B429', isSystem: true },
  { id: 'viewer', name: 'Viewer', description: 'Read-only access to assigned modules. Cannot create, edit, or delete records.', color: '#6b7280', isSystem: false },
];

const PERMISSION_MODULES = [
  { section: 'Pipeline', modules: [
    { key: 'leads', name: 'Leads', actions: ['view', 'create', 'edit', 'delete', 'assign', 'export'] },
    { key: 'underwriting', name: 'Underwriting', actions: ['view', 'review', 'approve', 'decline', 'assign'] },
    { key: 'cost_calculator', name: 'Cost Calculator', actions: ['view', 'use'] },
    { key: 'analysis', name: 'Statement Analysis', actions: ['view', 'create', 'edit', 'export'] },
  ]},
  { section: 'Merchants', modules: [
    { key: 'merchants', name: 'All Merchants', actions: ['view', 'create', 'edit', 'delete', 'export'] },
    { key: 'residuals', name: 'Residuals', actions: ['view', 'upload', 'edit', 'verify_ic', 'export'] },
    { key: 'capital', name: 'Capital', actions: ['view', 'create', 'approve', 'fund', 'modify_terms', 'write_off'] },
    { key: 'health', name: 'Health & Retention', actions: ['view', 'create_action', 'resolve'] },
  ]},
  { section: 'Team', modules: [
    { key: 'agents', name: 'Agents', actions: ['view', 'create', 'edit', 'deactivate', 'view_all'] },
    { key: 'compensation', name: 'Compensation', actions: ['view', 'edit', 'view_all'] },
    { key: 'employees', name: 'Employees', actions: ['view', 'create', 'edit', 'deactivate'] },
    { key: 'payroll', name: 'Payroll', actions: ['view', 'run', 'approve', 'export'] },
  ]},
  { section: 'Intelligence', modules: [
    { key: 'lens_ai', name: 'Lens AI', actions: ['view', 'configure', 'export'] },
    { key: 'financials', name: 'Financials', actions: ['view', 'export', 'edit_projections'] },
  ]},
  { section: 'Settings', modules: [
    { key: 'general', name: 'General Settings', actions: ['view', 'edit'] },
    { key: 'integrations', name: 'Integration Health', actions: ['view', 'configure', 'disconnect'] },
    { key: 'roles', name: 'Roles & Permissions', actions: ['view', 'edit'] },
    { key: 'bundles', name: 'Bundles', actions: ['view', 'create', 'edit', 'delete'] },
    { key: 'billing', name: 'Platform Billing', actions: ['view', 'manage'] },
  ]},
];

const DEFAULT_PERMS: Record<string, any> = {
  super_admin: 'all',
  admin: { denied: ['roles.edit', 'billing.manage', 'general.edit', 'capital.write_off'] },
  agent: { allowed: ['leads.view', 'leads.create', 'leads.edit', 'underwriting.view', 'cost_calculator.view', 'cost_calculator.use', 'analysis.view', 'analysis.create', 'analysis.export', 'merchants.view', 'residuals.view', 'capital.view', 'health.view', 'agents.view', 'compensation.view', 'lens_ai.view'] },
  viewer: { allowed: ['leads.view', 'merchants.view', 'residuals.view', 'capital.view', 'health.view', 'financials.view', 'lens_ai.view'] },
};

// ─── INTEGRATIONS ───────────────────────────────────────────────
// Static catalog only. "Connected" is reserved for integrations that are
// actually wired into this codebase; everything else is available-to-connect.
// No fabricated sync times or health scores.
const INTEGRATIONS = [
  { id: 'plaid', name: 'Plaid', category: 'Underwriting', status: 'connected', description: 'Bank verification, transaction data, identity' },
  { id: 'docusign', name: 'DocuSign', category: 'E-Sign', status: 'connected', description: 'MCA agreements, MPA packets, countersigning' },
  { id: 'resend', name: 'Resend', category: 'Email', status: 'connected', description: 'Transactional and lifecycle email delivery' },
  { id: 'meta', name: 'Meta Ads', category: 'Marketing', status: 'connected', description: 'Lead ads sync and campaign insights' },
  { id: 'north', name: 'North (NAB)', category: 'Processor', status: 'disconnected', description: 'ISO payment processing, residual reports' },
  { id: 'ach', name: 'ACH.com', category: 'Payments', status: 'disconnected', description: 'Recurring ACH debits for MCA collections' },
  { id: 'sentilink', name: 'SentiLink', category: 'Underwriting', status: 'disconnected', description: 'Synthetic identity fraud detection' },
  { id: 'crs', name: 'CRS Credit', category: 'Underwriting', status: 'disconnected', description: 'Commercial credit reporting' },
  { id: 'datamerch', name: 'DataMerch', category: 'Risk', status: 'disconnected', description: 'MCA industry default database' },
  { id: 'qbo', name: 'QuickBooks Online', category: 'Accounting', status: 'disconnected', description: 'Chart of accounts, MCA journal entries' },
  { id: 'stripe', name: 'Stripe', category: 'Billing', status: 'disconnected', description: 'Platform billing and subscription management' },
];

// ─── GENERAL SETTINGS ───────────────────────────────────────────
interface SettingsField {
  label: string; value: any; type: string; readonly?: boolean;
  description?: string; options?: string[];
}
interface SettingsSection {
  key: string; title: string; icon: string; fields: SettingsField[];
}

const GENERAL_SECTIONS: SettingsSection[] = [
  { key: 'company', title: 'Company Profile', icon: '🏢', fields: [
    { label: 'Company Name', value: 'Delt Pay LLC', type: 'text' },
    { label: 'Legal Entity', value: 'Delt Pay LLC', type: 'text' },
    { label: 'Registered Address', value: '1603 Capitol Ave Ste 415 #644712, Cheyenne, WY', type: 'text' },
    { label: 'Primary Phone', value: '(305) 799-1018', type: 'text' },
    { label: 'Primary Email', value: 'David@deltpay.com', type: 'text' },
    { label: 'Website', value: 'deltpay.com', type: 'text' },
    { label: 'Entity Type', value: 'LLC — S-Corp Election', type: 'text', readonly: true },
  ]},
  { key: 'branding', title: 'Brand & Appearance', icon: '🎨', fields: [
    { label: 'Primary Color', value: '#2E6BFF', type: 'color' },
    { label: 'Secondary Color', value: '#041e42', type: 'color' },
    { label: 'Heading Font', value: 'DM Sans', type: 'select', options: ['DM Sans', 'Inter', 'Outfit', 'Plus Jakarta Sans'] },
    { label: 'Mono Font', value: 'JetBrains Mono', type: 'select', options: ['JetBrains Mono', 'Fira Code', 'Source Code Pro'] },
    { label: 'White-Label Agent Portal', value: true, type: 'toggle' },
  ]},
  { key: 'notifications', title: 'Notifications', icon: '🔔', fields: [
    { label: 'New Lead Alert', value: true, type: 'toggle' },
    { label: 'Underwriting Status Change', value: true, type: 'toggle' },
    { label: 'Chargeback Filed (CRITICAL)', value: true, type: 'toggle', description: 'Notifies both agent AND super admin immediately' },
    { label: 'Interchange Verification Flag', value: true, type: 'toggle', description: 'Auto-verifies against published April/October schedule' },
    { label: 'Merchant Churn Risk', value: true, type: 'toggle' },
    { label: 'MCA Default Alert', value: true, type: 'toggle' },
    { label: 'NSF / Slow Pay Alert', value: true, type: 'toggle' },
    { label: 'Notification Channel', value: 'Email + SMS + In-App', type: 'select', options: ['Email Only', 'In-App Only', 'Email + In-App', 'Email + SMS + In-App'] },
  ]},
  { key: 'processing', title: 'Processing Defaults', icon: '💳', fields: [
    { label: 'Default Program', value: 'Cash Discount', type: 'select', options: ['Cash Discount', 'Flat Rate', 'Interchange Plus'] },
    { label: 'Default Service Fee (CD)', value: '3.99%', type: 'text' },
    { label: 'Interchange Schedule', value: 'April 2026', type: 'text', readonly: true },
    { label: 'Next Rate Update', value: 'October 2026', type: 'text', readonly: true },
    { label: 'Auto-Verify Interchange', value: true, type: 'toggle' },
    { label: 'Margin Floor', value: '0.50%', type: 'text' },
    { label: 'Agent Pricing Override', value: false, type: 'toggle', description: 'If off, agents cannot modify matrix-locked rates' },
  ]},
  { key: 'capital', title: 'Capital Defaults', icon: '🏦', fields: [
    { label: 'Cost of Capital', value: '12%', type: 'text' },
    { label: 'Default Factor Range', value: '1.25x – 1.45x', type: 'text' },
    { label: 'Max Position Size', value: '$50,000', type: 'text' },
    { label: 'Auto-Stack Detection', value: true, type: 'toggle' },
    { label: 'NSF Retry Attempts', value: '3', type: 'select', options: ['1', '2', '3', '4', '5'] },
    { label: 'Default ACH Schedule', value: 'Daily (Mon-Fri)', type: 'select', options: ['Daily (Mon-Fri)', 'Weekly', 'Bi-Weekly'] },
  ]},
  { key: 'data', title: 'Data & Privacy', icon: '🔒', fields: [
    { label: 'Data Retention Period', value: '7 years', type: 'select', options: ['3 years', '5 years', '7 years', '10 years', 'Indefinite'] },
    { label: 'GLBA Compliance Mode', value: true, type: 'toggle' },
    { label: 'FCRA Disclosure Enabled', value: true, type: 'toggle' },
    { label: 'Two-Factor Authentication', value: 'Required for Admin+', type: 'select', options: ['Disabled', 'Optional', 'Required for Admin+', 'Required for All'] },
    { label: 'Audit Log Retention', value: 'Indefinite', type: 'select', options: ['1 year', '3 years', '7 years', 'Indefinite'] },
  ]},
];

type SettingsTab = 'general' | 'integrations' | 'roles' | 'users';

interface MemberRow {
  userId: string;
  role: string;
  agentId: string | null;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

// ─── COMPONENT ──────────────────────────────────────────────────
export function BackendSettings() {
  const { currentPage, navigate } = useAppNavigate();
  const { lang, setLang, t } = useLang();
  // The tabs map below uses `t` as its loop variable — alias the translator.
  const tabLabel = t;

  // Tab state follows the route so /settings/integrations and /settings/roles
  // deep-link correctly and refresh/back keep their place.
  const TAB_PATHS: Record<SettingsTab, string> = {
    general: '/settings',
    integrations: '/settings/integrations',
    roles: '/settings/roles',
    users: '/settings',
  };
  const initialTab: SettingsTab = currentPage === '/settings/integrations' ? 'integrations'
    : currentPage === '/settings/roles' ? 'roles'
    : 'general';

  const [tab, setTabState] = useState<SettingsTab>(initialTab);
  const setTab = (next: SettingsTab) => {
    setTabState(next);
    const path = TAB_PATHS[next];
    if (path !== currentPage && (next === 'integrations' || next === 'roles' || currentPage.startsWith('/settings/'))) {
      navigate(path);
    }
  };
  const [expandedSection, setExpandedSection] = useState<string | null>('company');
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // ── Live org members (replaces the old hardcoded USERS list) ──
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) { setMembersLoading(false); return; }
      const { data, error } = await supabase
        .from('org_members')
        .select('user_id, role, agent_id, display_name, email, status, created_at')
        .order('created_at', { ascending: true });
      if (!active) return;
      if (error) {
        console.error('[Settings] org_members load failed:', error.message);
      } else {
        setMembers((data || []).map((r: any) => ({
          userId: r.user_id,
          role: r.role,
          agentId: r.agent_id ?? null,
          name: r.display_name || r.email || 'Member',
          email: r.email || '',
          status: r.status || 'active',
          createdAt: r.created_at || '',
        })));
      }
      setMembersLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const roleCounts = members.reduce<Record<string, number>>((acc, m) => {
    acc[m.role] = (acc[m.role] || 0) + 1;
    return acc;
  }, {});

  const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'integrations', label: 'Integrations', icon: Link2 },
    { key: 'roles', label: 'Roles & Permissions', icon: Shield },
    { key: 'users', label: 'User Management', icon: Users },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1280px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mt-1">{t('Platform configuration, access control, and integrations')}</p>
        </div>

        {/* ── Language / Idioma ── */}
        <div className="mb-6 bg-white border border-gray-200 rounded-[8px] px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
              <Languages className="w-4.5 h-4.5 text-brand" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{t('Language')} / Idioma</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('Applies to your workspace on this device.')}</p>
            </div>
          </div>
          <div className="flex rounded-[6px] border border-gray-200 overflow-hidden">
            {([
              { key: 'en' as const, label: 'English' },
              { key: 'es' as const, label: 'Español' },
            ]).map(o => (
              <button
                key={o.key}
                onClick={() => setLang(o.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  lang === o.key ? 'bg-brand text-white' : 'bg-white text-gray-500 hover:text-gray-700'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-0">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px] flex items-center gap-1.5 ${
                  tab === t.key
                    ? 'text-brand border-brand'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {tabLabel(t.label)}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ GENERAL ═══ */}
        {tab === 'general' && (
          <div className="space-y-2">
            <EsignSettingsCard />
            {GENERAL_SECTIONS.map(section => {
              const open = expandedSection === section.key;
              return (
                <div key={section.key} className={`border rounded-[8px] overflow-hidden transition-colors ${open ? 'border-brand' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setExpandedSection(open ? null : section.key)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{section.icon}</span>
                      <span className="text-sm font-semibold text-gray-900">{section.title}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="px-5 pb-5 bg-white">
                      {section.fields.map((f, i) => (
                        <div key={i} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 font-medium">{f.label}</p>
                            {f.description && <p className="text-[11px] text-gray-400 mt-0.5">{f.description}</p>}
                          </div>
                          <div className="w-[280px] flex justify-end">
                            {f.type === 'toggle' ? (
                              <Toggle value={f.value} />
                            ) : f.type === 'color' ? (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-[6px] border border-gray-200" style={{ background: f.value }} />
                                <span className="text-sm font-mono text-gray-600">{f.value}</span>
                              </div>
                            ) : f.type === 'select' ? (
                              <select defaultValue={f.value} className="w-full px-3 py-2 border border-gray-200 rounded-[6px] text-sm text-gray-900 bg-white focus:outline-none focus:border-brand">
                                {f.options?.map(o => <option key={o}>{o}</option>)}
                              </select>
                            ) : (
                              <input
                                type="text"
                                defaultValue={f.value}
                                readOnly={f.readonly}
                                className={`w-full px-3 py-2 border border-gray-200 rounded-[6px] text-sm font-mono text-gray-900 focus:outline-none focus:border-brand ${f.readonly ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
                        <button className="px-5 py-2 bg-brand text-white rounded-[6px] text-sm font-semibold hover:bg-brand-hover transition-colors">Save Changes</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ INTEGRATIONS ═══ */}
        {tab === 'integrations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {INTEGRATIONS.map(int => (
              <div key={int.id} className={`border rounded-[8px] p-5 flex flex-col gap-2.5 ${int.status === 'disconnected' ? 'border-dashed border-gray-300 opacity-60' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{int.name}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{int.category}</p>
                  </div>
                  <span className={`text-[11px] font-semibold ${int.status === 'connected' ? 'text-emerald-600' : 'text-red-500'}`}>
                    ● {int.status === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{int.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* ═══ ROLES & PERMISSIONS ═══ */}
        {tab === 'roles' && (
          <div>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Roles</h2>
                <p className="text-sm text-gray-400 mt-0.5">System roles define baseline access. Permissions enforced across all modules.</p>
              </div>
              <button className="px-4 py-2 bg-brand text-white rounded-[6px] text-sm font-semibold hover:bg-brand-hover inline-flex items-center gap-1.5 transition-colors">
                <Plus className="w-4 h-4" /> Custom Role
              </button>
            </div>
            <div className="space-y-2.5">
              {ROLES.map(role => {
                const open = expandedRole === role.id;
                return (
                  <div key={role.id} className={`border rounded-[8px] overflow-hidden transition-colors ${open ? 'border-brand' : 'border-gray-200'}`}>
                    <button
                      onClick={() => setExpandedRole(open ? null : role.id)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-white text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-[8px] flex items-center justify-center text-sm font-bold font-mono" style={{ background: `${role.color}12`, color: role.color }}>
                          {role.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{role.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 max-w-[500px]">{role.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-500">{roleCounts[role.id] || 0} user{(roleCounts[role.id] || 0) !== 1 ? 's' : ''}</span>
                        {role.isSystem && <span className="text-[10px] font-semibold text-brand bg-brand/8 px-2 py-0.5 rounded">System</span>}
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    {open && (
                      <div className="px-5 pb-5 border-t border-gray-100 bg-white">
                        {PERMISSION_MODULES.map(section => (
                          <div key={section.section} className="mt-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pb-1.5 border-b border-gray-100">{section.section}</p>
                            {section.modules.map(mod => {
                              const isFull = role.id === 'super_admin';
                              const denied = DEFAULT_PERMS[role.id]?.denied || [];
                              const allowed = DEFAULT_PERMS[role.id]?.allowed || [];
                              return (
                                <div key={mod.key} className="flex items-center justify-between py-1.5">
                                  <span className="text-sm text-gray-700 font-medium min-w-[160px]">{mod.name}</span>
                                  <div className="flex gap-1 flex-wrap">
                                    {mod.actions.map(action => {
                                      const pk = `${mod.key}.${action}`;
                                      let ok: boolean;
                                      if (isFull) ok = true;
                                      else if (denied.length) ok = !denied.includes(pk);
                                      else ok = allowed.includes(pk);
                                      return (
                                        <span
                                          key={action}
                                          className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${
                                            ok ? 'text-emerald-600 bg-emerald-500/8' : 'text-gray-300 bg-gray-50 line-through'
                                          }`}
                                        >
                                          {action}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ USER MANAGEMENT ═══ */}
        {tab === 'users' && (
          <div>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Users & Access</h2>
                <p className="text-sm text-gray-400 mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''} in your organization</p>
              </div>
              <button className="px-4 py-2 bg-brand text-white rounded-[6px] text-sm font-semibold hover:bg-brand-hover inline-flex items-center gap-1.5 transition-colors">
                <Plus className="w-4 h-4" /> Invite User
              </button>
            </div>
            <div className="border border-gray-200 rounded-[8px] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['User', 'Role', 'Status', 'Joined'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map(user => {
                    const role = ROLES.find(r => r.id === user.role) ?? ROLES[ROLES.length - 1];
                    const avatar = user.name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
                    return (
                      <tr key={user.userId} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-xs font-bold font-mono" style={{ background: `${role.color}12`, color: role.color }}>
                              {avatar}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                              <p className="text-[11px] text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-[6px] border" style={{ background: `${role.color}10`, color: role.color, borderColor: `${role.color}25` }}>
                            {role.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-[7px] h-[7px] rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="text-sm text-gray-600">{user.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {membersLoading && (
                <div className="px-5 py-8 text-center text-sm text-gray-400">Loading members…</div>
              )}
              {!membersLoading && members.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-gray-500">No members found.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ─────────────────────────────────────────────
function Toggle({ value }: { value: boolean }) {
  const [on, setOn] = useState(value);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-brand' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all ${on ? 'left-[23px]' : 'left-[3px]'}`} />
    </button>
  );
}


// ── E-Sign settings: the Delt countersigner identity ──
// Stored in org_esign_settings (RLS: read all staff, write general.edit).
// Without a countersigner the docusign function refuses to send MCA
// agreements — the contract is not executed until Delt countersigns.
function EsignSettingsCard() {
  const { can, org } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const canEdit = can('general.edit');

  useEffect(() => {
    if (!supabase || !org?.id) { setLoaded(true); return; }
    void supabase
      .from('org_esign_settings')
      .select('countersigner_name, countersigner_email')
      .eq('org_id', org.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setName(data.countersigner_name ?? '');
          setEmail(data.countersigner_email ?? '');
        }
        setLoaded(true);
      });
  }, [org?.id]);

  const save = async () => {
    if (!supabase || !org?.id) return;
    if (!name.trim() || !/.+@.+\..+/.test(email)) {
      toast.error('Countersigner name and a valid email are required.');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('org_esign_settings')
      .upsert({
        org_id: org.id,
        countersigner_name: name.trim(),
        countersigner_email: email.trim(),
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    if (error) {
      toast.error(`Could not save: ${error.message}`);
    } else {
      toast.success('Countersigner saved — MCA envelopes now route to them for execution.');
      void contractActions.checkConfig();
    }
  };

  return (
    <div className="border border-gray-200 rounded-[8px] bg-white px-5 py-4">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-lg">✍️</span>
        <span className="text-sm font-semibold text-gray-900">E-Sign — Delt countersigner</span>
      </div>
      <p className="text-[11px] text-gray-400 mb-3">
        Who executes agreements for Delt Pay LLC (the Purchaser signature block). MCA envelopes
        cannot be sent until this is set; the countersignature happens in the CRM via
        “Countersign now”.
      </p>
      {loaded && (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              readOnly={!canEdit}
              className="w-56 px-3 py-2 border border-gray-200 rounded-[6px] text-sm text-gray-900 bg-white focus:outline-none focus:border-brand read-only:bg-gray-50"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              readOnly={!canEdit}
              className="w-64 px-3 py-2 border border-gray-200 rounded-[6px] text-sm text-gray-900 bg-white focus:outline-none focus:border-brand read-only:bg-gray-50"
            />
          </div>
          {canEdit && (
            <button
              onClick={() => void save()}
              disabled={saving}
              className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-[6px] hover:bg-brand/90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
