import React, { useState } from 'react';
import { Settings, ChevronDown, Link2, Shield, Users, ClipboardList } from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';
import { ComingSoon } from '../ComingSoon';

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

type SettingsTab = 'general' | 'integrations' | 'roles' | 'users' | 'audit';

// ─── COMPONENT ──────────────────────────────────────────────────
export function BackendSettings() {
  const { currentPage } = useAppNavigate();

  // Derive initial tab from current route
  const initialTab: SettingsTab = currentPage === '/settings/integrations' ? 'integrations'
    : currentPage === '/settings/roles' ? 'roles'
    : currentPage === '/settings/bundles' ? 'general'
    : 'general';

  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [expandedSection, setExpandedSection] = useState<string | null>('company');

  const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'integrations', label: 'Integrations', icon: Link2 },
    { key: 'roles', label: 'Roles & Permissions', icon: Shield },
    { key: 'users', label: 'User Management', icon: Users },
    { key: 'audit', label: 'Audit Log', icon: ClipboardList },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1280px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mt-1">Platform configuration, access control, and integrations</p>
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
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ GENERAL ═══ */}
        {tab === 'general' && (
          <div className="space-y-2">
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
          <ComingSoon variant="inline" icon={Link2} title="Integrations" description="Integration health and configuration are in development." />
        )}

        {/* ═══ ROLES & PERMISSIONS ═══ */}
        {tab === 'roles' && (
          <ComingSoon variant="inline" icon={Shield} title="Roles & Permissions" description="Role definitions and the permission matrix are in development." />
        )}

        {/* ═══ USER MANAGEMENT ═══ */}
        {tab === 'users' && (
          <ComingSoon variant="inline" icon={Users} title="User Management" description="User invites, roles, and access management are in development." />
        )}

        {/* ═══ AUDIT LOG ═══ */}
        {tab === 'audit' && (
          <ComingSoon variant="inline" icon={ClipboardList} title="Audit Log" description="A full log of administrative actions is in development." />
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
