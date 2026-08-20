import React, { useState, useMemo } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  Search, FileText, Clock, Eye,
  LayoutGrid, List, Plus,
  CheckCircle, XCircle,
  ChevronDown,
} from 'lucide-react';
import { useAppNavigate } from '../NavigationContext';
import { useUnderwriting, underwritingActions, type UWStage, type UWApplication as Application } from '../crmStore';
import { NewApplicationFlow } from '../flows/NewApplicationFlow';
import { KpiTile, StatusPill, FilterChip, Btn, type StatusTone } from '../../dp';

const STAGES: UWStage[] = ['Intake', 'Plaid Verification', 'Credit Check', 'MCA History', 'Final Review', 'Approved', 'Declined'];

// One hue per stage — dots + pills, never color alone (the word is always there).
const STAGE_CONFIG: Record<UWStage, { dot: string; tone: StatusTone }> = {
  'Intake': { dot: '#5B8CFF', tone: 'accent' },
  'Plaid Verification': { dot: '#7C5BFF', tone: 'capital' },
  'Credit Check': { dot: '#3CC9E3', tone: 'accent' },
  'MCA History': { dot: '#F0B429', tone: 'warning' },
  'Final Review': { dot: '#2E6BFF', tone: 'accent' },
  'Approved': { dot: '#34C77B', tone: 'success' },
  'Declined': { dot: '#F2565B', tone: 'danger' },
};

const fmt = (n: number) => `$${n.toLocaleString()}`;

function riskTone(score: number): StatusTone {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
}

// Model score pill. compositeScore == null means the file has no bank data
// yet ("not scored") — neutral, never the red a genuine 0 would get.
function ScorePill({ app }: { app: Application }) {
  if (app.compositeScore == null) {
    return (
      <span title="Not scored — no bank data connected">
        <StatusPill tone="neutral">—</StatusPill>
      </span>
    );
  }
  return <StatusPill tone={riskTone(app.riskScore)}>{app.riskScore}</StatusPill>;
}

// ── Kanban Card ──
function KanbanCard({ app, onView }: { app: Application; onView: () => void }) {
  const overSLA = app.daysInStage >= app.slaThreshold;
  return (
    <div
      onClick={onView}
      className="bg-(--dp-bg-card) rounded-[12px] border border-(--dp-border) p-3.5 hover:border-(--dp-border-strong) hover:bg-(--dp-bg-raised) transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="font-mono text-[10px] text-(--dp-accent-text)">{app.applicationId}</span>
        <ScorePill app={app} />
      </div>
      <h4 className="text-[13px] font-bold text-(--dp-text) leading-snug mb-0.5">{app.businessName}</h4>
      <p className="text-[11px] text-(--dp-text-faint) mb-3">{app.industry}{app.state ? ` · ${app.state}` : ''}</p>

      <div className="flex items-baseline justify-between mb-3">
        <span className="text-[17px] font-bold tabular-nums text-(--dp-text)">{fmt(app.requestedAmount)}</span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-(--dp-text-faint)">{app.productType}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3 text-[11px] tabular-nums">
        <div><span className="text-(--dp-text-faint)">Rev </span><span className="text-(--dp-text-secondary) font-medium">{fmt(app.monthlyRevenue)}/mo</span></div>
        <div><span className="text-(--dp-text-faint)">ADB </span><span className="text-(--dp-text-secondary) font-medium">{fmt(app.avgDailyBalance)}</span></div>
        <div><span className="text-(--dp-text-faint)">FICO </span><span className="text-(--dp-text-secondary) font-medium">{app.creditScore}</span></div>
        <div><span className="text-(--dp-text-faint)">TIB </span><span className="text-(--dp-text-secondary) font-medium">{app.monthsInBusiness}mo</span></div>
      </div>

      {app.existingPositions > 0 && (
        <div className="mb-2">
          <StatusPill tone="warning">
            {app.existingPositions} existing position{app.existingPositions > 1 ? 's' : ''}
          </StatusPill>
        </div>
      )}

      {app.factorRate && (
        <div className="rounded-[8px] bg-white/[0.04] border border-(--dp-border) px-2.5 py-1.5 mb-2 text-[11px] tabular-nums">
          <div className="flex items-center justify-between">
            <span className="text-(--dp-text-faint)">Factor</span>
            <span className="font-bold text-(--dp-text-secondary)">{app.factorRate}x</span>
          </div>
          {app.dailyPayment && (
            <div className="flex items-center justify-between">
              <span className="text-(--dp-text-faint)">Daily</span>
              <span className="font-bold text-(--dp-text-secondary)">${app.dailyPayment}</span>
            </div>
          )}
        </div>
      )}

      {app.missingDocs && app.missingDocs.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2 text-[11px] text-(--dp-danger)">
          <FileText className="w-3 h-3" />
          {app.missingDocs.length} doc{app.missingDocs.length > 1 ? 's' : ''} needed
        </div>
      )}

      <div className="flex items-center justify-between pt-2.5 border-t border-(--dp-border)">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-(--dp-accent-soft) flex items-center justify-center">
            <span className="text-[8px] font-bold text-(--dp-accent-text)">{app.reviewerInitials}</span>
          </div>
          <span className="text-[11px] text-(--dp-text-faint)">{app.reviewer.split(' ')[0]}</span>
        </div>
        <div className={`flex items-center gap-1 text-[11px] tabular-nums ${overSLA ? 'text-(--dp-danger) font-bold' : 'text-(--dp-text-faint)'}`}>
          <Clock className="w-3 h-3" />
          {app.daysInStage}d
        </div>
      </div>
    </div>
  );
}

// ── Main ──
export function BackendUnderwriting() {
  const { navigate } = useAppNavigate();
  const APPLICATIONS = useUnderwriting();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [activeTab, setActiveTab] = useState<'All' | UWStage>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewerFilter, setReviewerFilter] = useState('All');
  const [newAppOpen, setNewAppOpen] = useState(false);

  const filtered = useMemo(() => {
    return APPLICATIONS.filter(app => {
      if (activeTab !== 'All' && app.stage !== activeTab) return false;
      if (reviewerFilter !== 'All' && app.reviewer !== reviewerFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return app.applicationId.toLowerCase().includes(q) || app.businessName.toLowerCase().includes(q) || app.industry.toLowerCase().includes(q);
      }
      return true;
    });
  }, [APPLICATIONS, activeTab, searchQuery, reviewerFilter]);

  const inQueueCount = APPLICATIONS.filter(a => !['Approved', 'Declined'].includes(a.stage)).length;
  const approvedCount = APPLICATIONS.filter(a => a.stage === 'Approved').length;
  const declinedCount = APPLICATIONS.filter(a => a.stage === 'Declined').length;
  const totalDecided = approvedCount + declinedCount;
  const approvalRate = totalDecided > 0 ? ((approvedCount / totalDecided) * 100).toFixed(1) : '0.0';
  const pipelineValue = APPLICATIONS.filter(a => !['Declined'].includes(a.stage)).reduce((s, a) => s + a.requestedAmount, 0);
  const overSLACount = APPLICATIONS.filter(a => a.daysInStage >= a.slaThreshold && !['Approved', 'Declined'].includes(a.stage)).length;
  const avgDaysToDecision = totalDecided > 0 ? (APPLICATIONS.filter(a => ['Approved', 'Declined'].includes(a.stage)).reduce((s, a) => s + a.daysInStage, 0) / totalDecided).toFixed(1) : '—';

  const handleAdvance = (app: Application) => {
    const order: UWStage[] = ['Intake', 'Plaid Verification', 'Credit Check', 'MCA History', 'Final Review', 'Approved'];
    const idx = order.indexOf(app.stage);
    if (idx < 0 || idx === order.length - 1) return;
    const next = order[idx + 1];
    underwritingActions.setStage(app.id, next);
    toast.success(`${app.businessName} → ${next}`);
  };

  const handleApprove = (app: Application) => {
    underwritingActions.approve(app.id);
    toast.success(`${app.businessName} approved`, { description: `${fmt(app.requestedAmount)} ${app.productType}` });
  };

  const handleDecline = (app: Application) => {
    underwritingActions.decline(app.id);
    toast.error(`${app.businessName} declined`);
  };

  const tabs: Array<'All' | UWStage> = ['All', ...STAGES];
  const kanbanStages = STAGES;

  const matchesFilters = (a: Application) =>
    (!searchQuery || a.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) || a.businessName.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (reviewerFilter === 'All' || a.reviewer === reviewerFilter);

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-6">

      {/* Header row — the topbar owns the page title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-(--dp-text-muted)">
          Underwritten in-house with Plaid, CRS &amp; DataMerch ·{' '}
          <span className="tabular-nums">{inQueueCount} in pipeline</span> ·{' '}
          {overSLACount > 0
            ? <span className="text-(--dp-danger) font-semibold">{overSLACount} over SLA</span>
            : 'All within SLA'}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-[10px] border border-(--dp-border) p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              aria-label="Board view"
              className={`p-1.5 rounded-[8px] transition-colors ${viewMode === 'kanban' ? 'bg-(--dp-accent-soft) text-(--dp-accent-text)' : 'text-(--dp-text-faint) hover:text-(--dp-text-muted)'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              className={`p-1.5 rounded-[8px] transition-colors ${viewMode === 'table' ? 'bg-(--dp-accent-soft) text-(--dp-accent-text)' : 'text-(--dp-text-faint) hover:text-(--dp-text-muted)'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Btn variant="primary" size="sm" onClick={() => setNewAppOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> New application
          </Btn>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <KpiTile label="In pipeline" value={inQueueCount} sub={`${APPLICATIONS.length} total applications`} />
        <KpiTile label="Avg decision time" value={`${avgDaysToDecision}d`} sub="SLA: 5 business days" />
        <KpiTile label="Approval rate" value={`${approvalRate}%`} sub={`${approvedCount} of ${totalDecided} decided`} />
        <KpiTile label="Pipeline value" value={`$${(pipelineValue / 1000).toFixed(0)}K`} sub={`${APPLICATIONS.length - declinedCount} active`} />
        <KpiTile
          label="Over SLA"
          value={<span className={overSLACount > 0 ? 'text-(--dp-danger)' : undefined}>{overSLACount}</span>}
          sub={overSLACount > 0 ? 'Needs attention' : 'All on track'}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--dp-text-faint)" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by business, ref, or industry"
            className="w-full h-10 pl-10 pr-3 bg-(--dp-bg-card) border border-(--dp-border) rounded-[10px] text-[13px] text-(--dp-text) focus:outline-none focus:border-(--dp-accent) focus:shadow-[0_0_0_3px_var(--dp-accent-soft)] transition-shadow"
          />
        </div>
        {viewMode === 'table' && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {tabs.map(tab => (
              <FilterChip
                key={tab}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                count={tab === 'All' ? APPLICATIONS.length : APPLICATIONS.filter(a => a.stage === tab).length}
              >
                {tab}
              </FilterChip>
            ))}
          </div>
        )}
        <select
          value={reviewerFilter}
          onChange={e => setReviewerFilter(e.target.value)}
          className="h-10 px-3 bg-(--dp-bg-card) border border-(--dp-border) rounded-[10px] text-[12px] font-semibold text-(--dp-text-muted) focus:outline-none focus:border-(--dp-accent)"
        >
          <option value="All">All reviewers</option>
          <option>David Kim</option>
          <option>Sarah Mitchell</option>
          <option>Michael Torres</option>
        </select>
      </div>

      {/* ── BOARD VIEW ── */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanStages.map(stage => {
            const cfg = STAGE_CONFIG[stage];
            const stageApps = APPLICATIONS.filter(a => a.stage === stage && matchesFilters(a));
            const stageValue = stageApps.reduce((s, a) => s + a.requestedAmount, 0);
            const done = stage === 'Approved' || stage === 'Declined';

            return (
              <div key={stage} className={`min-w-[272px] w-[272px] flex-shrink-0 ${done ? 'opacity-80' : ''}`}>
                {/* Column header — dot + overline + count */}
                <div className="flex items-center justify-between px-1 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-(--dp-text-muted)">{stage}</span>
                    <span className="text-[11px] font-bold tabular-nums text-(--dp-text-faint)">{stageApps.length}</span>
                  </div>
                  {stageValue > 0 && (
                    <span className="text-[11px] tabular-nums text-(--dp-text-faint)">{fmt(stageValue)}</span>
                  )}
                </div>

                {/* Column body */}
                <div className="space-y-2.5 min-h-[220px] rounded-[12px]">
                  {stageApps.map(app => (
                    <KanbanCard key={app.id} app={app} onView={() => navigate(`/underwriting/${app.id}`)} />
                  ))}
                  {stageApps.length === 0 && (
                    <div className="rounded-[12px] border border-dashed border-(--dp-border) py-10 text-center">
                      <p className="text-[12px] text-(--dp-text-faint)">No applications</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW — 52px rows, hairlines, amounts right ── */
        <div className="rounded-[16px] bg-(--dp-bg-card) border border-(--dp-border) overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-(--dp-border)">
                  <th className="px-4 py-3 whitespace-nowrap text-left">Ref</th>
                  <th className="px-4 py-3 whitespace-nowrap text-left">Business</th>
                  <th className="px-4 py-3 whitespace-nowrap text-left">Product</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Amount</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Mo. revenue</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">ADB</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">FICO</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Positions</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">TIB</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Score</th>
                  <th className="px-4 py-3 whitespace-nowrap text-left">Stage</th>
                  <th className="px-4 py-3 whitespace-nowrap text-left">Reviewer</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Days</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, i) => {
                  const cfg = STAGE_CONFIG[app.stage];
                  const overSLA = app.daysInStage >= app.slaThreshold && !['Approved', 'Declined'].includes(app.stage);
                  return (
                    <tr
                      key={app.id}
                      className={`h-[52px] hover:bg-(--dp-bg-raised) transition-colors ${i < filtered.length - 1 ? 'border-b border-(--dp-border)' : ''}`}
                    >
                      <td className="px-4">
                        <button
                          onClick={() => navigate(`/underwriting/${app.id}`)}
                          className="font-mono text-[11px] font-semibold text-(--dp-accent-text) hover:underline"
                        >
                          {app.applicationId}
                        </button>
                      </td>
                      <td className="px-4">
                        <p className="text-[13px] font-semibold text-(--dp-text) whitespace-nowrap">{app.businessName}</p>
                        <p className="text-[11px] text-(--dp-text-faint) whitespace-nowrap">{app.industry}{app.state ? ` · ${app.state}` : ''}</p>
                      </td>
                      <td className="px-4 text-[11px] font-bold uppercase tracking-wide text-(--dp-text-faint) whitespace-nowrap">{app.productType}</td>
                      <td className="px-4 text-[13px] text-right font-semibold tabular-nums text-(--dp-text)">{fmt(app.requestedAmount)}</td>
                      <td className="px-4 text-[12px] text-right tabular-nums text-(--dp-text-muted)">{fmt(app.monthlyRevenue)}</td>
                      <td className="px-4 text-[12px] text-right tabular-nums text-(--dp-text-muted)">{fmt(app.avgDailyBalance)}</td>
                      <td className="px-4 text-[12px] text-right tabular-nums text-(--dp-text-secondary)">{app.creditScore}</td>
                      <td className="px-4 text-right">
                        {app.existingPositions > 0
                          ? <StatusPill tone="warning">{app.existingPositions}</StatusPill>
                          : <span className="text-[12px] text-(--dp-text-faint) tabular-nums">0</span>}
                      </td>
                      <td className="px-4 text-[12px] text-right tabular-nums text-(--dp-text-muted)">{app.monthsInBusiness}mo</td>
                      <td className="px-4 text-right"><ScorePill app={app} /></td>
                      <td className="px-4">
                        <div className="relative inline-flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full absolute left-2.5 pointer-events-none" style={{ backgroundColor: cfg.dot }} />
                          <select
                            value={app.stage}
                            onClick={e => e.stopPropagation()}
                            onChange={e => {
                              const next = e.target.value as UWStage;
                              underwritingActions.setStage(app.id, next);
                              toast.success(`${app.businessName} → ${next}`);
                            }}
                            className="appearance-none pl-6 pr-6 py-1 rounded-[8px] bg-white/[0.05] border border-(--dp-border) text-[11px] font-bold text-(--dp-text-secondary) focus:outline-none focus:border-(--dp-accent) cursor-pointer"
                          >
                            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 pointer-events-none text-(--dp-text-faint)" />
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <div className="w-5 h-5 rounded-full bg-(--dp-accent-soft) flex items-center justify-center">
                            <span className="text-[8px] font-bold text-(--dp-accent-text)">{app.reviewerInitials}</span>
                          </div>
                          <span className="text-[12px] text-(--dp-text-muted)">{app.reviewer.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className={`px-4 text-[12px] text-right tabular-nums ${overSLA ? 'text-(--dp-danger) font-bold' : 'text-(--dp-text-muted)'}`}>
                        {app.daysInStage}d
                      </td>
                      <td className="px-4">
                        <div className="flex items-center justify-end gap-0.5" onClick={e => e.stopPropagation()}>
                          <button onClick={() => navigate(`/underwriting/${app.id}`)} title="Open" className="p-1.5 rounded-[8px] text-(--dp-text-faint) hover:text-(--dp-accent-text) hover:bg-(--dp-accent-soft)">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {!['Approved', 'Declined'].includes(app.stage) && (
                            <>
                              <button onClick={() => handleAdvance(app)} title="Advance stage" className="p-1.5 rounded-[8px] text-(--dp-text-faint) hover:text-(--dp-accent-text) hover:bg-(--dp-accent-soft)">
                                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                              </button>
                              {app.stage === 'Final Review' && (
                                <>
                                  <button onClick={() => handleApprove(app)} title="Approve" className="p-1.5 rounded-[8px] text-(--dp-text-faint) hover:text-(--dp-success) hover:bg-[rgba(52,199,123,.12)]">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDecline(app)} title="Decline" className="p-1.5 rounded-[8px] text-(--dp-text-faint) hover:text-(--dp-danger) hover:bg-[rgba(242,86,91,.12)]">
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-14 text-center">
              <p className="text-[13px] text-(--dp-text-muted) mb-3">No applications match your filters</p>
              <Btn size="sm" onClick={() => { setSearchQuery(''); setActiveTab('All'); setReviewerFilter('All'); }}>
                Clear filters
              </Btn>
            </div>
          )}
        </div>
      )}

      <NewApplicationFlow
        open={newAppOpen}
        onClose={() => setNewAppOpen(false)}
        onCreated={app => {
          toast.success(`Application ${app.applicationId} created`, { description: app.businessName });
        }}
      />

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-(--dp-text-faint)">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5"><StatusPill tone="success">80+</StatusPill> Low risk</span>
          <span className="inline-flex items-center gap-1.5"><StatusPill tone="warning">60–79</StatusPill> Medium</span>
          <span className="inline-flex items-center gap-1.5"><StatusPill tone="danger">&lt;60</StatusPill> High risk</span>
          <span className="text-(--dp-border-strong)">|</span>
          <span>ADB = Avg Daily Balance · TIB = Time in Business · SLA = 5 business days</span>
        </div>
        <p className="tabular-nums">{APPLICATIONS.length} total applications</p>
      </div>
    </div>
  );
}
