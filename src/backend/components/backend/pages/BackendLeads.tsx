import React, { useState, useMemo } from 'react';
import { toast } from 'sonner@2.0.3';
import { NewLeadFlow } from '../flows/NewLeadFlow';
import { QuickLeadFlow } from '../flows/QuickLeadFlow';
import { LeadImportFlow } from '../flows/LeadImportFlow';
import {
  Plus,
  Upload,
  Search,
  Phone,
  Mail,
  Building2,
  TrendingUp,
  Calendar,
  ChevronRight,
  X,
  MessageSquare,
  CheckSquare,
  Clock,
  DollarSign,
  User,
  Users,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  FileText,
  AlertTriangle,
  Gift,
  Loader2,
  LayoutGrid,
  List,
  Send,
  Edit,
  Save,
  Package,
  ChevronDown,
  UserPlus,
  Truck,
  XCircle,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import {
  useLeads,
  useReferrals,
  useReferralProgram,
  leadActions,
  referralActions,
  programActions,
  isDummyLead,
  scoreLead,
  type Lead as StoreLead,
} from '../crmStore';

// ── CRM sales cycle (short) ──
// Onboarding / underwriting lives outside the CRM; a lead only moves through
// these four stages before it's handed off.
const ALL_STAGES = [
  'New',
  'Contacted',
  'Qualified',
  'Converted',
] as const;
type StageName = (typeof ALL_STAGES)[number];

// ── Sorting ──
type SortKey = 'created' | 'business' | 'score' | 'stage' | 'status' | 'priority';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'created', label: 'Date Added' },
  { key: 'business', label: 'Business Name' },
  { key: 'score', label: 'Lead Score' },
  { key: 'stage', label: 'Pipeline Stage' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
];
const STATUS_ORDER = ['New', 'In Progress', 'Won', 'Not Qualified', 'Lost'];
const PRIORITY_ORDER = ['High', 'Medium', 'Low'];

type Lead = StoreLead;

// ── Date helpers ──
/** "Jul 24, 2026" from an ISO timestamp. */
function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Compact relative time, e.g. "3d ago", "2h ago", "just now". */
function timeAgo(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const secs = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ── Referral types ──
interface Referral {
  id: string;
  referringMerchant: string;
  referredBusiness: string;
  referralCode: string;
  date: string;
  status: 'Pending' | 'Contacted' | 'Converted' | 'Expired';
  rewardStatus: 'Pending' | 'Paid' | 'N/A';
  rewardAmount: string;
}

// ── Helpers ──
function stageIndex(stage: StageName): number {
  return ALL_STAGES.indexOf(stage);
}

function isQualifiedOrLater(stage: StageName): boolean {
  return ALL_STAGES.indexOf(stage) >= 2; // Qualified or later
}

// ── Bundle types from Settings ──
const BUNDLE_OPTIONS = [
  { id: 'welcome', name: 'Welcome Bundle', amount: 500 },
  { id: 'referrer', name: 'Referrer Reward', amount: 200 },
  { id: 'retention-light', name: 'Retention — Light', amount: 200 },
  { id: 'retention-medium', name: 'Retention — Medium', amount: 350 },
  { id: 'retention-full', name: 'Retention — Full', amount: 500 },
];

type BundleStatus = 'Not Assigned' | 'Credit Issued' | 'Order Placed' | 'Shipped' | 'Delivered';
const BUNDLE_STATUSES: BundleStatus[] = ['Not Assigned', 'Credit Issued', 'Order Placed', 'Shipped', 'Delivered'];

function bundleStatusCls(status: BundleStatus) {
  switch (status) {
    case 'Not Assigned': return 'bg-gray-100 text-gray-600';
    case 'Credit Issued': return 'bg-blue-50 text-blue-700';
    case 'Order Placed': return 'bg-amber-50 text-amber-700';
    case 'Shipped': return 'bg-violet-50 text-violet-700';
    case 'Delivered': return 'bg-emerald-50 text-emerald-700';
  }
}

// ── Welcome Bundle Section ──
function WelcomeBundleSection({ lead }: { lead: Lead }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const assigned = lead.bundle || null;

  const handleAssign = (bundle: typeof BUNDLE_OPTIONS[0]) => {
    leadActions.assignBundle(lead.id, { name: bundle.name, amount: bundle.amount });
    toast.success(`${bundle.name} assigned to ${lead.businessName}`);
    setDropdownOpen(false);
  };

  const cycleStatus = () => {
    if (!assigned) return;
    leadActions.cycleBundleStatus(lead.id);
    toast.success('Bundle status advanced');
  };

  return (
    <div className="px-6 py-5 border-b border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Package className="w-4 h-4 text-brand" />
        <p className="text-xs text-gray-500 font-medium">Welcome Bundle</p>
      </div>

      {lead.referredBy && (
        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-[6px] border border-indigo-200 mb-3">
          <UserPlus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <p className="text-xs text-indigo-700">
            <span className="font-medium">Referred by:</span> {lead.referredBy}
          </p>
        </div>
      )}

      {!assigned ? (
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-brand text-white text-xs font-medium rounded-[6px] hover:bg-brand-hover transition-colors"
          >
            <Gift className="w-3.5 h-3.5" />
            Assign Bundle
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-[8px] shadow-lg py-1 w-64">
                <p className="px-3 py-1.5 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Select Bundle</p>
                {BUNDLE_OPTIONS.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleAssign(b)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>{b.name}</span>
                    <span className="text-xs font-semibold text-gray-900">${b.amount}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-[8px] p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{assigned.bundleName}</p>
              <p className="text-xs text-gray-500 mt-0.5">${assigned.amount.toLocaleString()} credit</p>
            </div>
            <button
              onClick={cycleStatus}
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${bundleStatusCls(assigned.status)} cursor-pointer hover:opacity-80 transition-opacity`}
              title="Click to advance status"
            >
              {assigned.status}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-400 mb-0.5">Date Issued</p>
              <p className="text-gray-700 font-medium">{assigned.dateIssued}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Expires</p>
              <p className="text-gray-700 font-medium">{assigned.expiration}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              {BUNDLE_STATUSES.filter(s => s !== 'Not Assigned').map((s, i) => {
                const currentIdx = BUNDLE_STATUSES.indexOf(assigned.status);
                const thisIdx = BUNDLE_STATUSES.indexOf(s);
                const isComplete = thisIdx <= currentIdx;
                const icons: Record<string, React.ReactNode> = {
                  'Credit Issued': <DollarSign className="w-3 h-3" />,
                  'Order Placed': <Package className="w-3 h-3" />,
                  'Shipped': <Truck className="w-3 h-3" />,
                  'Delivered': <CheckCircle className="w-3 h-3" />,
                };
                return (
                  <React.Fragment key={s}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isComplete ? 'bg-brand text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {icons[s]}
                      </div>
                      <p className={`text-[9px] mt-1 text-center leading-tight ${isComplete ? 'text-brand font-medium' : 'text-gray-400'}`}>
                        {s === 'Credit Issued' ? 'Issued' : s === 'Order Placed' ? 'Ordered' : s}
                      </p>
                    </div>
                    {i < 3 && (
                      <div className={`h-0.5 w-4 shrink-0 rounded-full ${thisIdx < currentIdx ? 'bg-brand' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat Card ──
interface StatCardProps {
  label: string;
  value: string;
  trend?: { value: string; isPositive: boolean };
  icon?: React.ReactNode;
  variant?: 'default' | 'red';
}

function StatCard({ label, value, trend, icon, variant = 'default' }: StatCardProps) {
  const isRed = variant === 'red';
  return (
    <div className={`bg-white rounded-[8px] border p-5 ${isRed ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{label}</p>
        {icon && <div className={isRed ? 'text-red-400' : 'text-gray-400'}>{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <p className={`text-2xl font-bold ${isRed ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
        {trend && (
          <span className={`flex items-center text-sm font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : null}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Stage Progress (short CRM cycle) ──
function StageProgress({ stage }: { stage: StageName }) {
  const currentIdx = stageIndex(stage);

  // Short labels for compact display
  const shortLabels: Record<StageName, string> = {
    'New': 'New',
    'Contacted': 'Contacted',
    'Qualified': 'Qualified',
    'Converted': 'Converted',
  };

  return (
    <div className="mb-6">
      <p className="text-xs text-gray-500 mb-3">Pipeline Stage</p>
      <div className="flex items-center gap-1">
        {ALL_STAGES.map((s, index) => {
          const isComplete = index < currentIdx || (index === currentIdx && s === 'Converted');
          const isCurrent = index === currentIdx && s !== 'Converted';

          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                    isComplete
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    index + 1
                  )}
                </div>
                <p className="text-[10px] text-gray-600 mt-1 text-center leading-tight truncate w-full">{shortLabels[s]}</p>
              </div>
              {index < ALL_STAGES.length - 1 && (
                <div
                  className={`h-0.5 w-3 flex-shrink-0 rounded-full ${
                    index < currentIdx ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Lead Detail Panel ──
function LeadDetailPanel({ lead, onClose, onEdit, onDelete }: { lead: Lead | null; onClose: () => void; onEdit?: () => void; onDelete?: () => void }) {
  const [activeTab, setActiveTab] = useState<'activity' | 'notes' | 'tasks'>('activity');
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState('');
  if (!lead) return null;

  const isDeadEnd = lead.status === 'Not Qualified' || lead.status === 'Lost';

  const handleAdvanceStage = () => {
    if (isDeadEnd) {
      toast.error(`Can't advance a ${lead.status.toLowerCase()} lead — change its status first`);
      return;
    }
    const idx = ALL_STAGES.indexOf(lead.stage);
    if (idx >= ALL_STAGES.length - 1) {
      toast.info('Lead is already at the final stage');
      return;
    }
    if (leadActions.advanceStage(lead.id)) {
      toast.success(`Advanced to ${ALL_STAGES[idx + 1]}`);
    }
  };

  const handleConvert = () => {
    if (isDeadEnd) {
      toast.error(`A ${lead.status.toLowerCase()} lead can't be converted — change its status first`);
      return;
    }
    if (lead.stage === 'Converted') {
      toast.info('Lead is already converted');
      return;
    }
    if (leadActions.convert(lead.id)) {
      toast.success('Lead converted — handed off to onboarding');
    }
  };

  const handleMarkLost = () => {
    if (lead.status === 'Lost') { toast.info('Lead already lost'); return; }
    leadActions.markLost(lead.id);
    toast.success('Lead marked as lost');
  };

  const handleMarkNotQualified = () => {
    if (lead.status === 'Not Qualified') { toast.info('Lead already marked not qualified'); return; }
    leadActions.markNotQualified(lead.id);
    toast.success('Lead marked as not qualified');
  };

  const handleAddNote = () => {
    const body = newNote.trim();
    if (!body) { toast.error('Note cannot be empty'); return; }
    leadActions.addNote(lead.id, body);
    setNewNote('');
    toast.success('Note added');
  };

  const handleAddTask = () => {
    const title = newTask.trim();
    if (!title) { toast.error('Task title required'); return; }
    leadActions.addTask(lead.id, title, 'No due date');
    setNewTask('');
    toast.success('Task added');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700';
      case 'In Progress': return 'bg-amber-50 text-amber-700';
      case 'Won': return 'bg-emerald-50 text-emerald-700';
      case 'Not Qualified': return 'bg-orange-50 text-orange-700';
      case 'Lost': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-700';
      case 'Medium': return 'bg-amber-50 text-amber-700';
      case 'Low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 lg:pl-64">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{lead.businessName}</h2>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>{lead.status}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>{lead.priority} Priority</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onEdit && (
                <button onClick={onEdit} title="Edit lead" className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <Edit className="w-5 h-5 text-gray-500" />
                </button>
              )}
              {onDelete && (
                <button onClick={onDelete} title="Delete lead" className="p-2 hover:bg-red-50 rounded-md transition-colors">
                  <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-600" />
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600"><User className="w-4 h-4" /><span>{lead.contactName}</span></div>
            <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" /><span>{lead.contactPhone}</span></div>
            <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" /><span className="truncate">{lead.contactEmail}</span></div>
            <div className="flex items-center gap-2 text-gray-600"><Building2 className="w-4 h-4" /><span>{lead.industry}</span></div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div><p className="text-xs text-gray-500 mb-1">Monthly Sales</p><p className="text-lg font-bold text-gray-900">{lead.monthlySales}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Amount Requested</p><p className="text-lg font-bold text-gray-900">{lead.amountRequested}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Lead Score</p><div className="flex items-center gap-2"><p className="text-lg font-bold text-gray-900">{lead.score}/100</p><Star className="w-4 h-4 text-amber-500 fill-amber-500" /></div></div>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="px-6 py-5 border-b border-gray-200">
          <StageProgress stage={lead.stage} />
          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Added <span className="text-gray-700 font-medium">{formatDate(lead.createdAt)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Last activity <span className="text-gray-700 font-medium">{timeAgo(lead.updatedAt) || lead.lastActivity}</span>
            </span>
          </div>
        </div>

        {/* Welcome Bundle — visible at Qualified stage or later */}
        {isQualifiedOrLater(lead.stage) && (
          <WelcomeBundleSection lead={lead} />
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            {(['activity', 'notes', 'tasks'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab === 'activity' && <Clock className="w-4 h-4" />}
                  {tab === 'notes' && <MessageSquare className="w-4 h-4" />}
                  {tab === 'tasks' && <CheckSquare className="w-4 h-4" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {lead.timeline.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    {item.icon || <Clock className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">{item.user}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {lead.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{lead.notes}</p>
                      <p className="text-xs text-gray-500 mt-2">Added by {lead.assignedAgent}</p>
                    </div>
                  </div>
                </div>
              )}
              {(lead.extraNotes || []).map(n => (
                <div key={n.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-indigo-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{n.body}</p>
                      <p className="text-xs text-gray-500 mt-2">Added by {n.author} • {n.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add a new note..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={4}
              />
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Add Note
              </button>
            </div>
          )}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {(lead.tasks || []).map(t => (
                <div key={t.id} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => leadActions.toggleTask(lead.id, t.id)}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${t.done ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{t.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.due}</p>
                  </div>
                </div>
              ))}
              {(lead.tasks || []).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No tasks yet</p>
              )}
              <div className="flex items-center gap-2 pt-2">
                <input
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                  placeholder="New task title..."
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddTask}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  Add Task
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAdvanceStage}
              disabled={isDeadEnd || lead.stage === 'Converted'}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-[6px] hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next Stage
            </button>
            <button
              onClick={handleConvert}
              disabled={isDeadEnd || lead.stage === 'Converted'}
              title={isDeadEnd ? 'Change the status before converting' : undefined}
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-[6px] hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Convert
            </button>
            <button
              onClick={handleMarkNotQualified}
              className="px-4 py-2.5 bg-white border border-orange-300 text-orange-700 text-sm font-medium rounded-[6px] hover:bg-orange-50 transition-colors whitespace-nowrap"
            >
              Not Qualified
            </button>
            <button
              onClick={handleMarkLost}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-[6px] hover:bg-gray-50 transition-colors"
            >
              Mark Lost
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Referrals Tab ──
function ReferralsTab() {
  const program = useReferralProgram();
  const referrals = useReferrals();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(String(program.rewardAmount));
  const [freeMonths, setFreeMonths] = useState(String(program.freeMonths));
  const [planTier, setPlanTier] = useState<string>(program.planTier);

  // Re-sync local edit state when modal opens
  React.useEffect(() => {
    if (editModalOpen) {
      setRewardAmount(String(program.rewardAmount));
      setFreeMonths(String(program.freeMonths));
      setPlanTier(program.planTier);
    }
  }, [editModalOpen, program.rewardAmount, program.freeMonths, program.planTier]);

  const saveProgram = () => {
    programActions.update({
      rewardAmount: Number(rewardAmount) || 0,
      freeMonths: Number(freeMonths) || 0,
      planTier: planTier as typeof program.planTier,
    });
    setEditModalOpen(false);
    toast.success('Referral offer updated', {
      description: `$${rewardAmount} + ${freeMonths} month${Number(freeMonths) === 1 ? '' : 's'} free ${planTier}`,
    });
  };

  const contactReferral = (r: Referral) => {
    referralActions.setStatus(r.id, 'Contacted');
    toast.success(`${r.referredBusiness} contacted`, { description: `Outreach sent to ${r.referringMerchant}'s referral.` });
  };

  const convertReferral = (r: Referral) => {
    referralActions.setStatus(r.id, 'Converted');
    toast.success(`${r.referredBusiness} converted`, { description: 'Reward is now pending payout.' });
  };

  const payReward = (r: Referral) => {
    referralActions.payReward(r.id);
    toast.success(`Reward paid to ${r.referringMerchant}`, { description: `${r.rewardAmount} credited.` });
  };

  const convertedThisMonth = referrals.filter(r => r.status === 'Converted').length;

  const refStatusCls = (s: string) => {
    switch (s) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Contacted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Converted': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Expired': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const rewardCls = (s: string) => {
    switch (s) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Referral Offer Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-[8px] p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Refer a Business</h3>
            <p className="text-indigo-200 text-sm mt-1">For every successful referral that gets funded, both parties receive:</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="px-3 py-1.5 bg-white/20 rounded-[6px] text-sm font-medium">${program.rewardAmount} Account Credit</span>
              <span className="text-indigo-300">+</span>
              <span className="px-3 py-1.5 bg-white/20 rounded-[6px] text-sm font-medium">{program.freeMonths} Month{program.freeMonths > 1 ? 's' : ''} Free {program.planTier}</span>
            </div>
          </div>
          <button onClick={() => setEditModalOpen(true)} className="px-4 py-2 bg-white text-indigo-700 text-sm font-semibold rounded-[6px] hover:bg-indigo-50 transition-colors shrink-0 flex items-center gap-1.5">
            <Edit className="w-3.5 h-3.5" /> Edit Offer
          </button>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Referral Activity</h3>
          <p className="text-xs text-gray-500 mt-0.5">{referrals.length} referrals &middot; {convertedThisMonth} converted</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Referring Merchant</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Referred Business</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Referral Code</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Date</th>
                <th className="text-center px-5 py-3 text-xs text-gray-500 font-medium">Status</th>
                <th className="text-center px-5 py-3 text-xs text-gray-500 font-medium">Reward Status</th>
                <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Reward Amount</th>
                <th className="text-center px-5 py-3 text-xs text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {referrals.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-900">{r.referringMerchant}</td>
                  <td className="px-5 py-3 text-gray-700">{r.referredBusiness}</td>
                  <td className="px-5 py-3"><code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{r.referralCode}</code></td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{r.date}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium border rounded-md ${refStatusCls(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium border rounded-md ${rewardCls(r.rewardStatus)}`}>{r.rewardStatus}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-gray-900">{r.rewardAmount}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {r.status === 'Pending' && (
                        <button onClick={() => contactReferral(r)} title="Mark as contacted" className="p-1.5 hover:bg-blue-50 rounded-md text-gray-400 hover:text-blue-600">
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {(r.status === 'Pending' || r.status === 'Contacted') && (
                        <button onClick={() => convertReferral(r)} title="Mark as converted" className="p-1.5 hover:bg-emerald-50 rounded-md text-gray-400 hover:text-emerald-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {r.status === 'Converted' && r.rewardStatus === 'Pending' && (
                        <button onClick={() => payReward(r)} title="Pay reward" className="p-1.5 hover:bg-emerald-50 rounded-md text-gray-400 hover:text-emerald-700">
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {r.status === 'Expired' && (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Referral Offer Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditModalOpen(false)} />
          <div className="relative bg-white rounded-[8px] shadow-2xl border border-gray-200 p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Edit Referral Offer</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-[6px]"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Reward Amount ($)</label>
                <input type="number" value={rewardAmount} onChange={e => setRewardAmount(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Free Months</label>
                <input type="number" value={freeMonths} onChange={e => setFreeMonths(e.target.value)} min="1" max="12" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Plan Tier</label>
                <select value={planTier} onChange={e => setPlanTier(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  <option>Starter</option><option>Growth</option><option>Pro</option><option>Enterprise</option>
                </select>
              </div>
              <div className="bg-indigo-50 rounded-[6px] p-3">
                <p className="text-xs text-indigo-700"><span className="font-medium">Preview:</span> Refer a business &rarr; ${rewardAmount} credit + {freeMonths} month{Number(freeMonths) > 1 ? 's' : ''} free {planTier}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <button onClick={saveProgram} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-[6px] hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
              <button onClick={() => setEditModalOpen(false)} className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-[6px] hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sortable table header cell ──
function SortableTh({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: 'asc' | 'desc';
  onSort: (key: SortKey) => void;
}) {
  const active = activeKey === sortKey;
  return (
    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
      <button
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-1 uppercase tracking-wide hover:text-indigo-600 transition-colors ${active ? 'text-indigo-600' : 'text-gray-700'}`}
      >
        {label}
        {active ? (
          dir === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />
        )}
      </button>
    </th>
  );
}

// ── Confirm Dialog ──
function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-[12px] shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{title}</h3>
              <div className="text-sm text-gray-600 mt-1">{message}</div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-100">Cancel</button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Lead Modal ──
function EditLeadModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [form, setForm] = useState({
    businessName: lead.businessName || '',
    industry: lead.industry || '',
    contactName: lead.contactName || '',
    contactEmail: lead.contactEmail || '',
    contactPhone: lead.contactPhone || '',
    type: (lead.type || 'MCA') as Lead['type'],
    source: lead.source || '',
    monthlySales: lead.monthlySales || '',
    amountRequested: lead.amountRequested || '',
    assignedAgent: lead.assignedAgent || '',
    priority: (lead.priority || 'Medium') as Lead['priority'],
    status: (lead.status || 'New') as Lead['status'],
    stage: (lead.stage || 'New') as StageName,
    score: String(lead.score ?? 50),
    notes: lead.notes || '',
  });

  // When false, the score auto-tracks the live computed value as fields change.
  const [scoreManual, setScoreManual] = useState(false);

  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Live score derived from the form as data is entered.
  const autoScore = useMemo(
    () =>
      scoreLead({
        monthlySales: form.monthlySales,
        amountRequested: form.amountRequested,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        contactName: form.contactName,
        industry: form.industry,
        source: form.source,
        type: form.type,
        status: form.status,
        stage: form.stage,
      }),
    [form.monthlySales, form.amountRequested, form.contactEmail, form.contactPhone, form.contactName, form.industry, form.source, form.type, form.status, form.stage],
  );

  const displayedScore = scoreManual ? form.score : String(autoScore);

  const handleSave = () => {
    if (!form.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }
    if ((form.status === 'Not Qualified' || form.status === 'Lost') && form.stage === 'Converted') {
      toast.error(`A ${form.status.toLowerCase()} lead can't be in the Converted stage — change one of them`);
      return;
    }
    const rawScore = scoreManual ? Number(form.score) : autoScore;
    const scoreNum = Math.max(0, Math.min(100, rawScore || 0));
    leadActions.update(lead.id, {
      businessName: form.businessName.trim(),
      industry: form.industry,
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      type: form.type,
      source: form.source,
      monthlySales: form.monthlySales,
      amountRequested: form.amountRequested,
      assignedAgent: form.assignedAgent,
      priority: form.priority,
      status: form.status,
      stage: form.stage,
      score: scoreNum,
      notes: form.notes,
      lastActivity: 'just now',
    });
    leadActions.addTimeline(lead.id, {
      title: 'Lead details edited',
      description: 'Fields updated from backend',
      user: 'You',
      timestamp: 'just now',
    });
    toast.success(`${form.businessName} updated`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-[12px] shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Edit Lead</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          <FormInput label="Business Name *" value={form.businessName} onChange={v => update('businessName', v)} full />
          <FormInput label="Industry" value={form.industry} onChange={v => update('industry', v)} />
          <FormInput label="Contact Name" value={form.contactName} onChange={v => update('contactName', v)} />
          <FormInput label="Contact Email" value={form.contactEmail} onChange={v => update('contactEmail', v)} />
          <FormInput label="Contact Phone" value={form.contactPhone} onChange={v => update('contactPhone', v)} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select value={form.type} onChange={e => update('type', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>MCA</option><option>Residual</option><option>Processing</option><option>Leasing</option>
            </select>
          </div>
          <FormInput label="Source" value={form.source} onChange={v => update('source', v)} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
            <select value={form.priority} onChange={e => update('priority', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => update('status', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>New</option><option>In Progress</option><option>Won</option><option>Not Qualified</option><option>Lost</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Stage</label>
            <select value={form.stage} onChange={e => update('stage', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {ALL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <FormInput label="Monthly Sales" value={form.monthlySales} onChange={v => update('monthlySales', v)} placeholder="$50,000" />
          <FormInput label="Amount Requested" value={form.amountRequested} onChange={v => update('amountRequested', v)} placeholder="$100,000" />
          <FormInput label="Assigned Agent" value={form.assignedAgent} onChange={v => update('assignedAgent', v)} />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-600">Lead Score (0-100)</label>
              <button
                type="button"
                onClick={() => {
                  if (scoreManual) {
                    setScoreManual(false);
                  } else {
                    setScoreManual(true);
                    update('score', String(autoScore));
                  }
                }}
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors ${scoreManual ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                title={scoreManual ? 'Switch back to auto-scoring' : 'Auto-scored from lead data — click to override'}
              >
                {scoreManual ? 'Manual · switch to Auto' : `Auto (${autoScore})`}
              </button>
            </div>
            <input
              value={displayedScore}
              onChange={e => { setScoreManual(true); update('score', e.target.value); }}
              className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${scoreManual ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-1.5">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════
// Main Component
// ════════════════════════════════
export function BackendLeads({ openImport = false }: { openImport?: boolean } = {}) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mainTab, setMainTab] = useState<'leads' | 'referrals'>('leads');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [agentFilter, setAgentFilter] = useState<string>('All');
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [fullApplicationOpen, setFullApplicationOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(openImport);
  const [sortKey, setSortKey] = useState<SortKey>('created');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editLeadId, setEditLeadId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{ title: string; message: React.ReactNode; onConfirm: () => void } | null>(null);

  const leads = useLeads();
  const selectedLead = leads.find(l => l.id === selectedLeadId) || null;
  const editLead = leads.find(l => l.id === editLeadId) || null;


  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MCA': return 'bg-indigo-50 text-indigo-700';
      case 'Residual': return 'bg-purple-50 text-purple-700';
      case 'Leasing': return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700';
      case 'In Progress': return 'bg-amber-50 text-amber-700';
      case 'Won': return 'bg-emerald-50 text-emerald-700';
      case 'Not Qualified': return 'bg-orange-50 text-orange-700';
      case 'Lost': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const inProgressLeads = leads.filter(l => l.status === 'In Progress').length;
  const wonLeads = leads.filter(l => l.status === 'Won').length;
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0.0';
  const avgTimeToFunded = 5.2;

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (statusFilter !== 'All' && l.status !== statusFilter) return false;
      if (typeFilter !== 'All' && l.type !== typeFilter) return false;
      if (stageFilter !== 'All' && l.stage !== stageFilter) return false;
      if (agentFilter !== 'All' && l.assignedAgent !== agentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (
          !l.businessName.toLowerCase().includes(q) &&
          !l.contactName.toLowerCase().includes(q) &&
          !l.industry.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [leads, statusFilter, typeFilter, stageFilter, agentFilter, searchQuery]);

  // Original hydration order is created_at DESC, so array index acts as recency.
  const orderIndex = useMemo(() => {
    const m = new Map<string, number>();
    leads.forEach((l, i) => m.set(l.id, i));
    return m;
  }, [leads]);

  const sortedLeads = useMemo(() => {
    const arr = [...filteredLeads];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'business':
          cmp = a.businessName.localeCompare(b.businessName);
          break;
        case 'score':
          cmp = (a.score ?? 0) - (b.score ?? 0);
          break;
        case 'stage':
          cmp = ALL_STAGES.indexOf(a.stage) - ALL_STAGES.indexOf(b.stage);
          break;
        case 'status':
          cmp = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
          break;
        case 'priority':
          cmp = PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
          break;
        case 'created':
        default: {
          // Prefer the real created_at timestamp; fall back to hydration order.
          const ta = a.createdAt ? Date.parse(a.createdAt) : NaN;
          const tb = b.createdAt ? Date.parse(b.createdAt) : NaN;
          if (!isNaN(ta) && !isNaN(tb)) cmp = ta - tb;
          else cmp = (orderIndex.get(b.id) ?? 0) - (orderIndex.get(a.id) ?? 0);
          break;
        }
      }
      if (cmp === 0) cmp = a.businessName.localeCompare(b.businessName);
      return cmp * dir;
    });
    return arr;
  }, [filteredLeads, sortKey, sortDir, orderIndex]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'business' ? 'asc' : 'desc');
    }
  };

  // ── Selection ──
  const visibleIds = useMemo(() => sortedLeads.map(l => l.id), [sortedLeads]);
  const selectedVisibleCount = visibleIds.filter(id => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        visibleIds.forEach(id => next.delete(id));
        return next;
      }
      return new Set([...prev, ...visibleIds]);
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectDummies = () => {
    const dummyIds = leads.filter(isDummyLead).map(l => l.id);
    if (dummyIds.length === 0) {
      toast.info('No dummy or test leads detected');
      return;
    }
    setSelectedIds(new Set(dummyIds));
    toast.success(`${dummyIds.length} likely dummy lead${dummyIds.length === 1 ? '' : 's'} selected`, {
      description: 'Review the selection, then Delete.',
    });
  };

  // ── Delete flows (with confirmation) ──
  const requestDeleteOne = (lead: Lead) => {
    setConfirmState({
      title: 'Delete this lead?',
      message: (
        <>Permanently delete <span className="font-semibold text-gray-900">{lead.businessName}</span>. This cannot be undone.</>
      ),
      onConfirm: () => {
        leadActions.remove(lead.id);
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(lead.id);
          return next;
        });
        if (selectedLeadId === lead.id) setSelectedLeadId(null);
        setConfirmState(null);
        toast.success(`${lead.businessName} deleted`);
      },
    });
  };

  const requestDeleteSelected = () => {
    const ids = visibleIds.filter(id => selectedIds.has(id));
    if (ids.length === 0) return;
    setConfirmState({
      title: `Delete ${ids.length} lead${ids.length === 1 ? '' : 's'}?`,
      message: <>Permanently delete the selected lead{ids.length === 1 ? '' : 's'}. This cannot be undone.</>,
      onConfirm: () => {
        leadActions.removeMany(ids);
        clearSelection();
        setConfirmState(null);
        toast.success(`${ids.length} lead${ids.length === 1 ? '' : 's'} deleted`);
      },
    });
  };

  const dummyCount = useMemo(() => leads.filter(isDummyLead).length, [leads]);

  const setSelectedLead = (lead: Lead | null) => setSelectedLeadId(lead ? lead.id : null);

  const selectClass = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700';
      case 'In Progress': return 'bg-amber-50 text-amber-700';
      case 'Won': return 'bg-emerald-50 text-emerald-700';
      case 'Not Qualified': return 'bg-orange-50 text-orange-700';
      case 'Lost': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stageBadgeCls = (stage: StageName) => {
    switch (stage) {
      case 'New': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Contacted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Qualified': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Converted': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-canvas">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Leads</h1>
            <p className="text-sm text-gray-600 mt-1">{totalLeads} total leads in pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportOpen(true)}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-[6px] border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={() => setNewLeadOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-[6px] hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Lead
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard label="Total Leads" value={totalLeads.toString()} icon={<Users className="w-5 h-5" />} />
          <StatCard label="New" value={newLeads.toString()} trend={{ value: '+2 this week', isPositive: true }} icon={<Star className="w-5 h-5" />} />
          <StatCard label="In Progress" value={inProgressLeads.toString()} icon={<Clock className="w-5 h-5" />} />
          <StatCard label="Won" value={wonLeads.toString()} trend={{ value: '+1 this week', isPositive: true }} icon={<CheckCircle className="w-5 h-5" />} />
          <StatCard label="Conversion Rate" value={`${conversionRate}%`} icon={<TrendingUp className="w-5 h-5" />} />
          <StatCard label="Avg Time to Funded" value={`${avgTimeToFunded} days`} icon={<Calendar className="w-5 h-5" />} />
        </div>

        {/* Tabs: Leads / Referrals */}
        <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
          <button
            onClick={() => setMainTab('leads')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              mainTab === 'leads' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Leads Pipeline
          </button>
          <button
            onClick={() => setMainTab('referrals')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              mainTab === 'referrals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Referrals
          </button>
        </div>
      </div>

      {mainTab === 'referrals' ? (
        <div className="px-6 pb-6 flex-1 overflow-y-auto">
          <ReferralsTab />
        </div>
      ) : (
        <div className="px-6 pb-6 flex-1 overflow-y-auto space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-[8px] border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by business name, contact, or industry..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Won">Won</option>
                <option value="Not Qualified">Not Qualified</option>
                <option value="Lost">Lost</option>
              </select>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="All">All Types</option>
                <option value="MCA">MCA</option>
                <option value="Residual">Residual</option>
                <option value="Leasing">Leasing</option>
              </select>
              <select
                value={stageFilter}
                onChange={e => setStageFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="All">All Stages</option>
                {ALL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={agentFilter}
                onChange={e => setAgentFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="All">All Agents</option>
                {[...new Set(leads.map(l => l.assignedAgent))].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5 shrink-0">
                <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`} title="Table view"><List className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`} title="Kanban view"><LayoutGrid className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Sort + Bulk toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 flex items-center gap-1"><ArrowUpDown className="w-3.5 h-3.5" /> Sort</span>
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value as SortKey)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
              <button
                onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
                title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
                className="px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-1 text-sm"
              >
                {sortDir === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </button>
              <span className="text-xs text-gray-400">{sortedLeads.length} shown</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectDummies}
                className="px-3 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 flex items-center gap-1.5"
                title="Auto-select test / placeholder leads"
              >
                <Sparkles className="w-4 h-4" />
                Find dummy leads{dummyCount > 0 ? ` (${dummyCount})` : ''}
              </button>
            </div>
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50 border border-indigo-200 rounded-[8px] px-4 py-3">
              <p className="text-sm text-indigo-800 font-medium">
                {selectedIds.size} lead{selectedIds.size === 1 ? '' : 's'} selected
              </p>
              <div className="flex items-center gap-2">
                <button onClick={clearSelection} className="px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-100 rounded-md">
                  Clear
                </button>
                <button
                  onClick={requestDeleteSelected}
                  className="px-3 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Delete selected
                </button>
              </div>
            </div>
          )}

          {/* Kanban Board View */}
          {viewMode === 'kanban' ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {ALL_STAGES.map(stage => {
                const stageLeads = sortedLeads.filter(l => l.stage === stage);
                return (
                  <div key={stage} className="flex-shrink-0 w-72">
                    <div className="bg-gray-100 rounded-t-[8px] px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{stage}</h3>
                        <span className="text-[10px] bg-white text-gray-500 rounded-full px-2 py-0.5 font-medium">{stageLeads.length}</span>
                      </div>

                    </div>
                    <div className="bg-gray-50 rounded-b-[8px] p-2 min-h-[200px] space-y-2">
                      {stageLeads.length === 0 ? (
                        <div className="text-center py-8 text-xs text-gray-400">No leads</div>
                      ) : stageLeads.map(lead => {
                        return (
                          <button
                            key={lead.id}
                            onClick={() => setSelectedLead(lead)}
                            className="w-full text-left bg-white rounded-[8px] border border-gray-200 p-3 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-semibold text-gray-900 leading-tight">{lead.businessName}</p>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${getScoreColor(lead.score)}`}>{lead.score}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{lead.contactName}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getTypeColor(lead.type)}`}>{lead.type}</span>
                            </div>
                            {lead.blocker && (
                              <p className="text-[10px] text-red-600 mt-2 line-clamp-1">{lead.blocker}</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
          /* Leads Table */
          <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        ref={el => { if (el) el.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected; }}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded cursor-pointer"
                        title="Select all"
                      />
                    </th>
                    <SortableTh label="Business" sortKey="business" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Contact</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Type</th>
                    <SortableTh label="Stage" sortKey="stage" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Score" sortKey="score" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Status" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Added" sortKey="created" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedLeads.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">
                        No leads match your filters
                      </td>
                    </tr>
                  )}
                  {sortedLeads.map(lead => {
                    const isSelected = selectedIds.has(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className={`transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/60' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(lead.id)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{lead.businessName}</p>
                              <p className="text-xs text-gray-500">{lead.industry}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-900">{lead.contactName}</p>
                          <p className="text-xs text-gray-500">{lead.contactPhone}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(lead.type)}`}>{lead.type}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium border rounded-md ${stageBadgeCls(lead.stage)}`}>
                            {lead.stage}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-sm font-bold ${getScoreColor(lead.score)}`}>{lead.score}</span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={lead.status}
                            onChange={e => {
                              e.stopPropagation();
                              leadActions.setStatus(lead.id, e.target.value as any);
                              toast.success(`${lead.businessName} set to ${e.target.value}`);
                            }}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-indigo-500 ${selectClass(lead.status)}`}
                            onClick={e => e.stopPropagation()}
                          >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Won">Won</option>
                            <option value="Not Qualified">Not Qualified</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(lead.createdAt)}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 ml-6">{timeAgo(lead.updatedAt) || lead.lastActivity}</p>
                        </td>
                        <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setEditLeadId(lead.id)} title="Edit lead" className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                              <Edit className="w-4 h-4 text-gray-400 hover:text-indigo-600" />
                            </button>
                            <button onClick={() => requestDeleteOne(lead)} title="Delete lead" className="p-2 hover:bg-red-50 rounded-md transition-colors">
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                            </button>
                            <button onClick={() => setSelectedLead(lead)} title="Open" className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Lead Detail Panel */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onEdit={() => setEditLeadId(selectedLead.id)}
          onDelete={() => requestDeleteOne(selectedLead)}
        />
      )}

      {/* Edit Lead Modal */}
      {editLead && <EditLeadModal lead={editLead} onClose={() => setEditLeadId(null)} />}

      {/* Delete confirmation */}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}

      {/* Quick add (default) — full KYB intake one click away */}
      <QuickLeadFlow
        open={newLeadOpen}
        onClose={() => setNewLeadOpen(false)}
        onCreated={created => {
          setSelectedLeadId(created.id);
        }}
        onOpenFullApplication={() => {
          setNewLeadOpen(false);
          setFullApplicationOpen(true);
        }}
      />

      {/* Full KYB intake (Stripe-style slide-over) */}
      <NewLeadFlow
        open={fullApplicationOpen}
        onClose={() => setFullApplicationOpen(false)}
        onCreated={created => {
          setSelectedLeadId(created.id);
          toast.success(`Lead "${created.businessName}" created`);
        }}
      />

      {/* Spreadsheet Lead Import (Meta lead ads etc.) */}
      <LeadImportFlow open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}

// ────────────────────────────────────────────────
// New Lead Modal
// ────────────────────────────────────────────────
function NewLeadModal({ onClose, onCreate }: { onClose: () => void; onCreate: (lead: Lead) => void }) {
  const [form, setForm] = useState({
    businessName: '',
    industry: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    type: 'MCA' as Lead['type'],
    source: 'Website Inquiry',
    monthlySales: '',
    amountRequested: '',
    assignedAgent: 'Sarah Johnson',
    priority: 'Medium' as Lead['priority'],
    notes: '',
  });

  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }
    const created = leadActions.create(form as any);
    onCreate(created);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-[12px] shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">New Lead</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          <FormInput label="Business Name *" value={form.businessName} onChange={v => update('businessName', v)} full />
          <FormInput label="Industry" value={form.industry} onChange={v => update('industry', v)} />
          <FormInput label="Contact Name" value={form.contactName} onChange={v => update('contactName', v)} />
          <FormInput label="Contact Email" value={form.contactEmail} onChange={v => update('contactEmail', v)} />
          <FormInput label="Contact Phone" value={form.contactPhone} onChange={v => update('contactPhone', v)} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select
              value={form.type}
              onChange={e => update('type', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>MCA</option><option>Residual</option><option>Leasing</option>
            </select>
          </div>
          <FormInput label="Source" value={form.source} onChange={v => update('source', v)} />
          <FormInput label="Monthly Sales" value={form.monthlySales} onChange={v => update('monthlySales', v)} placeholder="$50,000" />
          <FormInput label="Amount Requested" value={form.amountRequested} onChange={v => update('amountRequested', v)} placeholder="$100,000" />
          <FormInput label="Assigned Agent" value={form.assignedAgent} onChange={v => update('assignedAgent', v)} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={e => update('priority', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Lead
          </button>
        </div>
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  full,
  placeholder,
}: { label: string; value: string; onChange: (v: string) => void; full?: boolean; placeholder?: string }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}