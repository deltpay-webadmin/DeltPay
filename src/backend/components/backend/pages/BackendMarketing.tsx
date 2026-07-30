import React, { useEffect, useMemo, useState } from 'react';
import { Link2, Target, TrendingUp, ArrowRight, RefreshCw, X, Unplug, AlertTriangle, Download, CheckCircle2 } from 'lucide-react';
import { Overline, DeltaPill, KpiTile, Card, HeroPanel, Btn } from '../../dp';
import { useMarketing, useMarketingSync, marketingActions } from '../marketingStore';
import { useLeads } from '../crmStore';

// ══════════════════════════════════════
// Marketing performance — the return-on-ad-spend story.
//
// Two modes:
//   • Sample — the sculpted demo cycle, until an ad account connects.
//   • Live — real Meta campaign/day insights (marketingStore) blended with
//     CRM stages: Meta supplies impressions → clicks → leads; the CRM
//     supplies qualified → converted for Meta-sourced leads.
// ══════════════════════════════════════

const SAMPLE_CYCLE = {
  period: 'May 25 – Jun 24, 2026',
  spend: 18420,
  revenue: 96420,
  roas: 5.2,
  roasDelta: 8.4,
  cac: 542,
  cacDelta: -6.1,
  paybackDays: 41,
  funded: 34,
};

// ── Funnel stages ──
// Widths are perceptual, not linear — the story is the narrowing, then the
// green return flaring back out wider than the cost stem that produced it.
interface Stage {
  key: string;
  label: string;
  value: string;
  stepPct: string | null; // conversion from previous stage
  unit: string;           // unit-cost readout
  width: number;
}

const SAMPLE_STAGES: Stage[] = [
  { key: 'impressions', label: 'Impressions', value: '1.24M', stepPct: null, unit: '$14.85 CPM', width: 100 },
  { key: 'clicks', label: 'Clicks', value: '38.4K', stepPct: '3.1%', unit: '$0.48 CPC', width: 82 },
  { key: 'visits', label: 'Site visits', value: '29.6K', stepPct: '77%', unit: '$0.62 / visit', width: 72 },
  { key: 'leads', label: 'Leads', value: '1,184', stepPct: '4.0%', unit: '$15.56 / lead', width: 54 },
  { key: 'qualified', label: 'Qualified', value: '342', stepPct: '29%', unit: '$53.86 / qualified', width: 40 },
  { key: 'apps', label: 'Applications', value: '128', stepPct: '37%', unit: '$143.91 / application', width: 28 },
  { key: 'funded', label: 'Funded merchants', value: '34', stepPct: '27%', unit: '$542 CAC', width: 18 },
];

const RETURN_GEOM = { widthTop: 18, widthBottom: 46 };

const SAMPLE_STAGE_CHANNELS: Record<string, { channel: string; share: number }[]> = {
  impressions: [
    { channel: 'Google Ads', share: 46 }, { channel: 'Meta', share: 34 },
    { channel: 'LinkedIn', share: 12 }, { channel: 'Email', share: 3 }, { channel: 'SMS', share: 5 },
  ],
  clicks: [
    { channel: 'Google Ads', share: 51 }, { channel: 'Meta', share: 29 },
    { channel: 'LinkedIn', share: 8 }, { channel: 'Email', share: 6 }, { channel: 'SMS', share: 6 },
  ],
  visits: [
    { channel: 'Google Ads', share: 52 }, { channel: 'Meta', share: 28 },
    { channel: 'LinkedIn', share: 8 }, { channel: 'Email', share: 6 }, { channel: 'SMS', share: 6 },
  ],
  leads: [
    { channel: 'Google Ads', share: 44 }, { channel: 'Meta', share: 27 },
    { channel: 'LinkedIn', share: 7 }, { channel: 'Email', share: 13 }, { channel: 'SMS', share: 9 },
  ],
  qualified: [
    { channel: 'Google Ads', share: 46 }, { channel: 'Meta', share: 25 },
    { channel: 'LinkedIn', share: 6 }, { channel: 'Email', share: 14 }, { channel: 'SMS', share: 9 },
  ],
  apps: [
    { channel: 'Google Ads', share: 45 }, { channel: 'Meta', share: 26 },
    { channel: 'LinkedIn', share: 8 }, { channel: 'Email', share: 12 }, { channel: 'SMS', share: 9 },
  ],
  funded: [
    { channel: 'Google Ads', share: 44 }, { channel: 'Meta', share: 26 },
    { channel: 'LinkedIn', share: 9 }, { channel: 'Email', share: 12 }, { channel: 'SMS', share: 9 },
  ],
};

const SAMPLE_CHANNELS = [
  { name: 'Google Ads', spend: 8900, cac: 593, roas: 4.8 },
  { name: 'Meta', spend: 5200, cac: 578, roas: 4.4 },
  { name: 'LinkedIn', spend: 2100, cac: 700, roas: 3.1 },
  { name: 'SMS', spend: 1500, cac: 500, roas: 5.9 },
  { name: 'Email', spend: 720, cac: 180, roas: 9.6 },
];

const SAMPLE_TREND = [
  { month: 'Feb', spend: 11200, revenue: 41800 },
  { month: 'Mar', spend: 13400, revenue: 52300 },
  { month: 'Apr', spend: 14100, revenue: 61900 },
  { month: 'May', spend: 16200, revenue: 74500 },
  { month: 'Jun', spend: 18420, revenue: 96420 },
  { month: 'Jul', spend: 19800, revenue: 104100 },
];

const fmtK = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${Math.round(n)}`);
const fmtNum = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n >= 10_000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();
const fmtMoney = (n: number) => (n >= 100 ? `$${Math.round(n).toLocaleString()}` : `$${n.toFixed(2)}`);
const pct = (a: number, b: number) => (b > 0 ? `${((a / b) * 100).toFixed(a / b < 0.1 ? 1 : 0)}%` : null);
const relTime = (iso: string | null) => {
  if (!iso) return 'never';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
};
const parseMoney = (s: string | undefined | null): number => {
  if (!s) return 0;
  const n = Number(String(s).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

// ── Live data assembly ──

interface LiveView {
  accountLabel: string;
  accountId: string;
  syncedAt: string | null;
  period: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  costPerLead: number | null;
  cplDelta: number | null;
  spendDelta: number | null;
  leadsDelta: number | null;
  qualified: number;
  converted: number;
  pipelineValue: number; // monthly volume of converted Meta-sourced leads
  stages: Stage[];
  stageChannels: Record<string, { channel: string; share: number }[]>;
  campaigns: { name: string; spend: number; leads: number; cpl: number | null }[];
  trend: { month: string; spend: number; leads: number }[];
}

const dayMs = 86400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

function isMetaLead(l: { id: string; source: string }): boolean {
  return l.id.startsWith('lead-meta') || /meta|facebook|instagram/i.test(l.source || '');
}

/** Perceptual funnel width: sqrt-scaled between a floor and full width. */
function liveWidth(v: number, max: number): number {
  if (max <= 0 || v <= 0) return 12;
  return Math.max(14, Math.round(18 + 82 * Math.sqrt(v / max)));
}

// ══════════════════════════════════════
// Sculpted funnel geometry (parameterized by stage list)
// ══════════════════════════════════════
const BAND_H = 56;
const GAP = 14;
const RETURN_H = 60;

interface Pt { x: number; y: number }

// Catmull-Rom → cubic bezier segments through pts (starting from pts[0]).
function splineThrough(pts: Pt[]): string {
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
  }
  return d;
}

// Width samples: the top edge, each band boundary (averaging the widths it
// separates), and the bottom edge — one smooth run, no verticals between.
function sidePoints(stages: Stage[], funnelH: number, side: 1 | -1): Pt[] {
  const x = (w: number) => 50 + (side * w) / 2;
  const pts: Pt[] = [{ x: x(stages[0].width), y: 0 }];
  for (let i = 1; i < stages.length; i++) {
    pts.push({ x: x((stages[i - 1].width + stages[i].width) / 2), y: i * BAND_H });
  }
  pts.push({ x: x(stages[stages.length - 1].width), y: funnelH });
  return pts;
}

function costPath(stages: Stage[], funnelH: number): string {
  const right = sidePoints(stages, funnelH, 1);
  const left = sidePoints(stages, funnelH, -1).reverse();
  return (
    `M ${left[left.length - 1].x} 0 L ${right[0].x} 0 ` +
    splineThrough(right) +
    `L ${left[0].x} ${funnelH} ` +
    splineThrough(left) +
    'Z'
  );
}

function returnPath(): string {
  const { widthTop: wt, widthBottom: wb } = RETURN_GEOM;
  const xRt = 50 + wt / 2, xRb = 50 + wb / 2;
  const xLt = 50 - wt / 2, xLb = 50 - wb / 2;
  return (
    `M ${xLt} 0 L ${xRt} 0 ` +
    `C ${xRt} ${RETURN_H * 0.55}, ${xRb} ${RETURN_H * 0.35}, ${xRb} ${RETURN_H} ` +
    `L ${xLb} ${RETURN_H} ` +
    `C ${xLb} ${RETURN_H * 0.35}, ${xLt} ${RETURN_H * 0.55}, ${xLt} 0 Z`
  );
}

// ══════════════════════════════════════
// Connect / manage dialog
// ══════════════════════════════════════

function MetaConnectDialog({
  open,
  onClose,
  connected,
}: {
  open: boolean;
  onClose: () => void;
  connected: { accountId: string; accountName: string | null; lastSyncedAt: string | null } | null;
}) {
  const [token, setToken] = useState('');
  const [accountId, setAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    if (!token.trim() || !accountId.trim()) return;
    setSubmitting(true);
    try {
      await marketingActions.connectMeta(token.trim(), accountId.trim());
      setToken('');
      setAccountId('');
      onClose();
    } catch {
      /* toast already shown by the store */
    } finally {
      setSubmitting(false);
    }
  };

  const disconnect = async () => {
    setSubmitting(true);
    try {
      await marketingActions.disconnectMeta();
      onClose();
    } catch { /* toast shown */ } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[440px] rounded-[14px] bg-(--dp-bg-card) border border-(--dp-border) shadow-2xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-(--dp-text)">Connect Meta Ads</h3>
            <p className="mt-1 text-[12px] text-(--dp-text-muted)">
              Paste a system-user access token with <span className="font-semibold">ads_read</span> and
              your ad account ID. The token is stored server-side and never shown again.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[8px] hover:bg-white/[0.06] text-(--dp-text-muted)">
            <X className="w-4 h-4" />
          </button>
        </div>

        {connected && (
          <div className="mt-4 flex items-center justify-between rounded-[10px] border border-(--dp-border) px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-(--dp-text) truncate">
                {connected.accountName || 'Meta account'}{' '}
                <span className="text-(--dp-text-faint) font-normal">{connected.accountId}</span>
              </p>
              <p className="text-[11px] text-(--dp-text-faint)">Synced {relTime(connected.lastSyncedAt)}</p>
            </div>
            <button
              onClick={disconnect}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-(--dp-danger) hover:opacity-80 disabled:opacity-50"
            >
              <Unplug className="w-3.5 h-3.5" /> Disconnect
            </button>
          </div>
        )}

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-(--dp-text-secondary) mb-1">Access token</label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="EAAG…"
              autoComplete="off"
              className="w-full h-9 px-3 rounded-[10px] bg-transparent border border-(--dp-border) text-[13px] text-(--dp-text) placeholder:text-(--dp-text-faint) focus:outline-none focus:border-(--dp-accent)"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-(--dp-text-secondary) mb-1">Ad account ID</label>
            <input
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              placeholder="act_1234567890"
              autoComplete="off"
              className="w-full h-9 px-3 rounded-[10px] bg-transparent border border-(--dp-border) text-[13px] text-(--dp-text) placeholder:text-(--dp-text-faint) focus:outline-none focus:border-(--dp-accent)"
            />
            <p className="mt-1 text-[11px] text-(--dp-text-faint)">
              Ads Manager → Account overview, or Business Settings → Ad accounts.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-[10px] text-[12px] font-bold text-(--dp-text-muted) hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <Btn variant="primary" size="sm" onClick={submit} disabled={submitting || !token.trim() || !accountId.trim()}>
            {submitting ? 'Validating…' : connected ? 'Replace connection' : 'Connect & pull 90 days'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// Lead reconciliation — Meta's lead list vs the CRM
// ══════════════════════════════════════

function LeadReconCard() {
  const { adLeads } = useMarketing();
  const { isBusy } = useMarketingSync();

  const missing = adLeads.filter(l => !l.matchedLeadId);
  const matched = adLeads.length - missing.length;
  const synced = adLeads.length > 0;

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

  return (
    <Card
      title="Lead reconciliation · Meta forms vs CRM"
      action={
        <div className="flex items-center gap-2">
          {synced && (
            <span className="text-[11px] text-(--dp-text-faint)">
              {adLeads.length} submissions · {matched} in CRM ·{' '}
              <span className={missing.length ? 'text-amber-500 font-bold' : ''}>
                {missing.length} missing
              </span>
            </span>
          )}
          <Btn variant="ghost" size="sm" onClick={() => marketingActions.syncMetaLeads()} disabled={isBusy}>
            <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
            {synced ? 'Re-check' : 'Pull lead forms'}
          </Btn>
        </div>
      }
    >
      {!synced ? (
        <p className="text-[13px] text-(--dp-text-faint) py-2">
          Pull the actual form submissions from Meta's Lead Ads API and cross-check them against the
          pipeline — any paid lead that never reached the CRM (a dropped Zapier run, a deleted row)
          shows up here with a one-click import. Requires the Facebook Page to be assigned to the
          system user that generated the token.
        </p>
      ) : missing.length === 0 ? (
        <div className="flex items-center gap-2.5 py-2 text-[13px] text-(--dp-text-faint)">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          Every lead Meta reported is present in the pipeline. Nothing has been dropped.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 text-[13px] text-(--dp-text)">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <span className="font-bold">{missing.length}</span> paid{' '}
                lead{missing.length === 1 ? '' : 's'} never made it into the pipeline.
              </span>
            </div>
            <Btn
              variant="primary"
              size="sm"
              disabled={isBusy}
              onClick={() => marketingActions.importMetaLeads(missing.map(l => l.leadId))}
            >
              <Download className="w-3.5 h-3.5" /> Import all
            </Btn>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-(--dp-text-faint)">
                  <th className="py-1.5 pr-3 font-bold">Lead</th>
                  <th className="py-1.5 pr-3 font-bold">Contact</th>
                  <th className="py-1.5 pr-3 font-bold">Campaign / form</th>
                  <th className="py-1.5 pr-3 font-bold">Submitted</th>
                  <th className="py-1.5 font-bold" />
                </tr>
              </thead>
              <tbody>
                {missing.map(l => (
                  <tr key={l.leadId} className="border-t border-(--dp-border)">
                    <td className="py-2 pr-3 font-semibold text-(--dp-text)">
                      {l.fullName || '—'}
                      {l.isOrganic && (
                        <span className="ml-1.5 text-[10px] font-bold text-(--dp-text-faint)">ORGANIC</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-(--dp-text-faint)">
                      {[l.email, l.phone].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td className="py-2 pr-3 text-(--dp-text-faint)">
                      {l.campaignName || l.adName || l.formName || '—'}
                    </td>
                    <td className="py-2 pr-3 text-(--dp-text-faint) whitespace-nowrap">{fmtDate(l.createdTime)}</td>
                    <td className="py-2 text-right">
                      <Btn
                        variant="ghost"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => marketingActions.importMetaLeads([l.leadId])}
                      >
                        Import
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}

// ══════════════════════════════════════
// Main page
// ══════════════════════════════════════

export function BackendMarketing() {
  const [drillKey, setDrillKey] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const { connections, insights } = useMarketing();
  const { isBusy } = useMarketingSync();
  const leads = useLeads();

  const metaConn = connections.find(c => c.provider === 'meta' && c.status !== 'disconnected') || null;

  const live: LiveView | null = useMemo(() => {
    if (!metaConn) return null;
    const rows = insights.filter(r => r.provider === 'meta');
    if (!rows.length) return null;

    const now = Date.now();
    const d30 = iso(now - 30 * dayMs);
    const d60 = iso(now - 60 * dayMs);
    const cur = rows.filter(r => r.day >= d30);
    const prev = rows.filter(r => r.day >= d60 && r.day < d30);

    const sum = (rs: typeof rows, k: 'spend' | 'impressions' | 'clicks' | 'leads') =>
      rs.reduce((s, r) => s + r[k], 0);

    const spend = sum(cur, 'spend');
    const impressions = sum(cur, 'impressions');
    const clicks = sum(cur, 'clicks');
    const leadCount = sum(cur, 'leads');
    const costPerLead = leadCount > 0 ? spend / leadCount : null;

    const pSpend = sum(prev, 'spend');
    const pLeads = sum(prev, 'leads');
    const pCpl = pLeads > 0 ? pSpend / pLeads : null;
    const delta = (a: number | null, b: number | null) =>
      a !== null && b !== null && b !== 0 ? Math.round(((a - b) / b) * 1000) / 10 : null;

    // CRM handoff — Meta-sourced leads by stage.
    const metaLeads = leads.filter(isMetaLead);
    const qualified = metaLeads.filter(l => l.stage === 'Qualified' || l.stage === 'Converted').length;
    const converted = metaLeads.filter(l => l.stage === 'Converted').length;
    const pipelineValue = metaLeads
      .filter(l => l.stage === 'Converted')
      .reduce((s, l) => s + parseMoney(l.monthlySales), 0);

    // Funnel stages: Meta supplies the top, the CRM the bottom.
    const maxV = Math.max(impressions, 1);
    const stages: Stage[] = [
      {
        key: 'impressions', label: 'Impressions', value: fmtNum(impressions), stepPct: null,
        unit: impressions > 0 ? `$${((spend / impressions) * 1000).toFixed(2)} CPM` : '—',
        width: liveWidth(impressions, maxV),
      },
      {
        key: 'clicks', label: 'Clicks', value: fmtNum(clicks), stepPct: pct(clicks, impressions),
        unit: clicks > 0 ? `$${(spend / clicks).toFixed(2)} CPC` : '—',
        width: liveWidth(clicks, maxV),
      },
      {
        key: 'leads', label: 'Leads', value: fmtNum(leadCount), stepPct: pct(leadCount, clicks),
        unit: costPerLead !== null ? `${fmtMoney(costPerLead)} / lead` : '—',
        width: liveWidth(leadCount, maxV),
      },
      {
        key: 'qualified', label: 'Qualified (CRM)', value: fmtNum(qualified), stepPct: pct(qualified, leadCount),
        unit: qualified > 0 ? `${fmtMoney(spend / qualified)} / qualified` : '—',
        width: liveWidth(qualified, maxV),
      },
      {
        key: 'converted', label: 'Converted (CRM)', value: fmtNum(converted), stepPct: pct(converted, qualified),
        unit: converted > 0 ? `${fmtMoney(spend / converted)} CAC` : '—',
        width: liveWidth(converted, maxV),
      },
    ];

    // Per-campaign aggregates (trailing 30d).
    const byCampaign = new Map<string, { name: string; spend: number; impressions: number; clicks: number; leads: number }>();
    for (const r of cur) {
      const c = byCampaign.get(r.campaignId) || {
        name: r.campaignName || r.campaignId, spend: 0, impressions: 0, clicks: 0, leads: 0,
      };
      c.spend += r.spend; c.impressions += r.impressions; c.clicks += r.clicks; c.leads += r.leads;
      byCampaign.set(r.campaignId, c);
    }
    const campaignAgg = [...byCampaign.values()].sort((a, b) => b.spend - a.spend);
    const campaigns = campaignAgg.slice(0, 6).map(c => ({
      name: c.name,
      spend: c.spend,
      leads: c.leads,
      cpl: c.leads > 0 ? c.spend / c.leads : null,
    }));

    // Stage drill-down: campaign share of each Meta-side stage.
    const shareOf = (k: 'impressions' | 'clicks' | 'leads') => {
      const total = sum(cur, k);
      if (total <= 0) return [];
      const top = [...campaignAgg].sort((a, b) => b[k] - a[k]).slice(0, 4);
      const shares = top
        .map(c => ({ channel: c.name, share: Math.round((c[k] / total) * 100) }))
        .filter(s => s.share > 0);
      const rest = 100 - shares.reduce((s, x) => s + x.share, 0);
      if (rest > 0 && campaignAgg.length > shares.length) shares.push({ channel: 'Other', share: rest });
      return shares;
    };
    const stageChannels: LiveView['stageChannels'] = {
      impressions: shareOf('impressions'),
      clicks: shareOf('clicks'),
      leads: shareOf('leads'),
    };

    // Monthly trend over the stored window (up to 6 months).
    const byMonth = new Map<string, { spend: number; leads: number }>();
    for (const r of rows) {
      const m = r.day.slice(0, 7);
      const t = byMonth.get(m) || { spend: 0, leads: 0 };
      t.spend += r.spend; t.leads += r.leads;
      byMonth.set(m, t);
    }
    const months = [...byMonth.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).slice(-6);
    const trend = months.map(([m, t]) => ({
      month: new Date(`${m}-15T00:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
      spend: t.spend,
      leads: t.leads,
    }));

    const fmtDay = (s: string) =>
      new Date(`${s}T00:00:00Z`).toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

    return {
      accountLabel: metaConn.accountName || 'Meta',
      accountId: metaConn.accountId,
      syncedAt: metaConn.lastSyncedAt,
      period: `${fmtDay(d30)} – ${fmtDay(iso(now))}, ${new Date(now).getUTCFullYear()}`,
      spend, impressions, clicks, leads: leadCount,
      costPerLead,
      cplDelta: delta(costPerLead, pCpl),
      spendDelta: delta(spend, pSpend || null),
      leadsDelta: delta(leadCount || null, pLeads || null),
      qualified, converted, pipelineValue,
      stages, stageChannels, campaigns, trend,
    };
  }, [metaConn, insights, leads]);

  const stages = live ? live.stages : SAMPLE_STAGES;
  const funnelH = stages.length * BAND_H;
  const stageChannels = live ? live.stageChannels : SAMPLE_STAGE_CHANNELS;
  const totalSampleSpend = useMemo(() => SAMPLE_CHANNELS.reduce((s, c) => s + c.spend, 0), []);
  const maxSampleTrend = useMemo(() => Math.max(...SAMPLE_TREND.map(t => t.revenue)), []);
  const drill = drillKey ? stageChannels[drillKey] : null;
  const drillStage = drillKey ? stages.find(s => s.key === drillKey) : null;
  const bestRoas = Math.max(...SAMPLE_CHANNELS.map(c => c.roas));
  const maxLiveTrend = live ? Math.max(...live.trend.map(t => t.spend), 1) : 1;
  const maxCampaignSpend = live ? Math.max(...live.campaigns.map(c => c.spend), 1) : 1;

  const returnValue = live
    ? (live.pipelineValue > 0 ? fmtK(live.pipelineValue) : '—')
    : '$96.4K';
  const returnLabel = live ? 'Attributed monthly volume' : 'Attributed revenue';
  const returnBadge = live
    ? (live.converted > 0 ? `${live.converted} converted` : 'awaiting conversions')
    : '5.2× return';

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1360px] mx-auto px-4 lg:px-8 py-6 space-y-6">

        {/* ═══ HERO ═══ */}
        <HeroPanel>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-8 p-6 lg:p-8">
            <div className="flex flex-col justify-center">
              <Overline className="text-white/60">
                {live ? `Meta Ads · last 30 days · ${live.period}` : `Return on ad spend · ${SAMPLE_CYCLE.period}`}
              </Overline>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="text-[44px] leading-none font-bold text-white tracking-[-0.02em] tabular-nums">
                  {live
                    ? (live.costPerLead !== null ? fmtMoney(live.costPerLead) : fmtK(live.spend))
                    : `${SAMPLE_CYCLE.roas.toFixed(1)}×`}
                </span>
                {live
                  ? (live.cplDelta !== null && <DeltaPill value={live.cplDelta} invert onGlass />)
                  : <DeltaPill value={SAMPLE_CYCLE.roasDelta} onGlass />}
              </div>
              <p className="mt-3 text-[14px] text-white/60">
                {live ? (
                  live.costPerLead !== null ? (
                    <>per lead — {fmtK(live.spend)} brought <span className="text-white/90 font-semibold">{fmtNum(live.leads)} leads</span> from {live.accountLabel} ({live.accountId})</>
                  ) : (
                    <>spent on {live.accountLabel} ({live.accountId}) — no lead events reported yet</>
                  )
                ) : (
                  <>{fmtK(SAMPLE_CYCLE.spend)} invested returned <span className="text-white/90 font-semibold">{fmtK(SAMPLE_CYCLE.revenue)}</span> in
                  first-90-day revenue from {SAMPLE_CYCLE.funded} funded merchants</>
                )}
              </p>
              <div className="mt-6 flex items-center gap-2">
                {live ? (
                  <>
                    <Btn variant="primary" size="sm" onClick={() => marketingActions.syncMeta(90)} disabled={isBusy}>
                      <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                      {isBusy ? 'Syncing…' : 'Sync now'}
                    </Btn>
                    <button
                      onClick={() => setConnectOpen(true)}
                      className="inline-flex items-center gap-1.5 h-8 px-4 rounded-[10px] text-[12px] font-bold text-white/80 border border-white/20 hover:bg-white/10 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" /> Manage connection
                    </button>
                  </>
                ) : (
                  <>
                    <Btn variant="primary" size="sm" onClick={() => setConnectOpen(true)}>
                      <Link2 className="w-3.5 h-3.5" /> Connect ad accounts
                    </Btn>
                    <button className="inline-flex items-center gap-1.5 h-8 px-4 rounded-[10px] text-[12px] font-bold text-white/80 border border-white/20 hover:bg-white/10 transition-colors">
                      <Target className="w-3.5 h-3.5" /> Set targets
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 content-center">
              {live ? (
                <>
                  <KpiTile glass label="Ad spend" value={fmtK(live.spend)} delta={live.spendDelta ?? undefined} sub="Last 30 days" />
                  <KpiTile glass label="Impressions" value={fmtNum(live.impressions)} sub="Meta campaigns" />
                  <KpiTile glass label="Clicks" value={fmtNum(live.clicks)} sub={live.impressions > 0 ? `${((live.clicks / live.impressions) * 100).toFixed(1)}% CTR` : '—'} />
                  <KpiTile glass label="Leads" value={fmtNum(live.leads)} delta={live.leadsDelta ?? undefined} sub={live.costPerLead !== null ? `${fmtMoney(live.costPerLead)} each` : '—'} />
                </>
              ) : (
                <>
                  <KpiTile glass label="Ad spend" value={fmtK(SAMPLE_CYCLE.spend)} sub="All paid channels" />
                  <KpiTile glass label="Attributed revenue" value={fmtK(SAMPLE_CYCLE.revenue)} sub="First 90 days" />
                  <KpiTile glass label="CAC" value={`$${SAMPLE_CYCLE.cac}`} delta={SAMPLE_CYCLE.cacDelta} invertDelta sub="Per funded merchant" />
                  <KpiTile glass label="Payback" value={`${SAMPLE_CYCLE.paybackDays}d`} sub="Spend recovered" />
                </>
              )}
            </div>
          </div>
        </HeroPanel>

        {/* ═══ THE FUNNEL ═══ */}
        <Card
          title="Spend → return"
          action={
            <span className="text-[11px] text-(--dp-text-faint)">
              {live
                ? `Live · ${live.accountLabel} · synced ${relTime(live.syncedAt)}`
                : 'Sample cycle · live once ad accounts connect'}
            </span>
          }
        >
          <div className="grid grid-cols-[minmax(120px,170px)_1fr_minmax(110px,160px)] gap-x-5 pt-2">

            {/* Left column — stage values */}
            <div>
              {stages.map(s => (
                <div key={s.key} className="flex flex-col justify-center items-end text-right" style={{ height: BAND_H }}>
                  <span className="text-[15px] font-bold tabular-nums text-(--dp-text) leading-tight">{s.value}</span>
                  <span className="text-[11px] text-(--dp-text-faint) leading-tight">
                    {s.label}
                    {s.stepPct && <span className="text-(--dp-text-muted)"> · {s.stepPct}</span>}
                  </span>
                </div>
              ))}
              <div style={{ height: GAP }} />
              <div className="flex flex-col justify-center items-end text-right" style={{ height: RETURN_H }}>
                <span className="text-[15px] font-bold tabular-nums text-(--dp-success) leading-tight">{returnValue}</span>
                <span className="text-[11px] text-(--dp-text-faint) leading-tight">{returnLabel}</span>
              </div>
            </div>

            {/* Center — the sculpted shape */}
            <div className="relative" style={{ height: funnelH + GAP + RETURN_H }}>
              <svg
                className="absolute inset-x-0 top-0 w-full"
                style={{ height: funnelH, filter: 'drop-shadow(0 16px 48px rgba(46,107,255,0.28))' }}
                viewBox={`0 0 100 ${funnelH}`}
                preserveAspectRatio="none"
                aria-hidden
              >
                <defs>
                  <linearGradient id="mkt-cost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--dp-accent)" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="var(--dp-accent)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="var(--dp-accent)" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path d={costPath(stages, funnelH)} fill="url(#mkt-cost)" />
              </svg>
              <svg
                className="absolute inset-x-0 w-full"
                style={{ top: funnelH + GAP, height: RETURN_H, filter: 'drop-shadow(0 12px 36px rgba(52,199,123,0.35))' }}
                viewBox={`0 0 100 ${RETURN_H}`}
                preserveAspectRatio="none"
                aria-hidden
              >
                <defs>
                  <linearGradient id="mkt-return" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--dp-success)" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="var(--dp-success)" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path d={returnPath()} fill="url(#mkt-return)" />
              </svg>
              {/* ROAS / conversions marker inside the return flare */}
              <div
                className="absolute inset-x-0 flex items-center justify-center"
                style={{ top: funnelH + GAP, height: RETURN_H }}
              >
                <span className="text-[13px] font-bold text-white tracking-[-0.01em]">{returnBadge}</span>
              </div>
              {/* Hover / drill bands */}
              {stages.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => setDrillKey(k => (k === s.key ? null : s.key))}
                  aria-label={`${s.label} — breakdown`}
                  className={`absolute inset-x-0 transition-colors ${
                    drillKey === s.key ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                  }`}
                  style={{ top: i * BAND_H, height: BAND_H }}
                />
              ))}
            </div>

            {/* Right column — unit economics, whisper-quiet */}
            <div>
              {stages.map(s => (
                <div key={s.key} className="flex items-center" style={{ height: BAND_H }}>
                  <span className={`text-[11px] tabular-nums ${s.key === 'funded' || s.key === 'converted' ? 'font-bold text-(--dp-accent-text)' : 'text-(--dp-text-faint)'}`}>
                    {s.unit}
                  </span>
                </div>
              ))}
              <div style={{ height: GAP }} />
              <div className="flex items-center" style={{ height: RETURN_H }}>
                <span className="text-[11px] font-bold tabular-nums text-(--dp-success)">
                  {live ? (live.converted > 0 ? `${live.converted} merchants` : '—') : `${SAMPLE_CYCLE.roas.toFixed(1)}× ROAS`}
                </span>
              </div>
            </div>
          </div>

          {/* Drill-down — composition of the selected stage */}
          {drill && drill.length > 0 && drillStage && (
            <div className="mt-5 pt-4 border-t border-(--dp-border)">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-bold text-(--dp-text-secondary)">
                  {drillStage.label} by {live ? 'campaign' : 'channel'}
                </p>
                <button onClick={() => setDrillKey(null)} className="text-[11px] text-(--dp-text-faint) hover:text-(--dp-text)">
                  Clear
                </button>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full">
                {drill.map((d, i) => (
                  <div
                    key={d.channel}
                    style={{
                      width: `${d.share}%`,
                      background: `color-mix(in srgb, var(--dp-accent) ${90 - i * 18}%, var(--dp-bg-card))`,
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {drill.map((d, i) => (
                  <span key={d.channel} className="inline-flex items-center gap-1.5 text-[11px] text-(--dp-text-muted) tabular-nums">
                    <span
                      className="w-2 h-2 rounded-[3px]"
                      style={{ background: `color-mix(in srgb, var(--dp-accent) ${90 - i * 18}%, var(--dp-bg-card))` }}
                    />
                    {d.channel} <span className="font-bold text-(--dp-text-secondary)">{d.share}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* ═══ LEAD RECONCILIATION ═══ */}
        {live && <LeadReconCard />}

        {/* ═══ CHANNELS / CAMPAIGNS + CYCLES ═══ */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card title={live ? 'Where the spend goes · by campaign' : 'Where the spend goes'}>
            {live ? (
              <>
                <div className="space-y-3.5">
                  {live.campaigns.map(ch => (
                    <div key={ch.name} className="grid grid-cols-[150px_1fr_auto] items-center gap-4">
                      <span className="text-[12px] font-semibold text-(--dp-text) truncate" title={ch.name}>{ch.name}</span>
                      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-(--dp-accent)" style={{ width: `${(ch.spend / maxCampaignSpend) * 100}%` }} />
                      </div>
                      <div className="flex items-baseline gap-3 tabular-nums">
                        <span className="text-[11px] text-(--dp-text-muted) w-[56px] text-right">{fmtK(ch.spend)}</span>
                        <span className="text-[11px] text-(--dp-text-faint) w-[58px] text-right">{ch.leads} leads</span>
                        <span className="text-[12px] font-bold w-[62px] text-right text-(--dp-accent-text)">
                          {ch.cpl !== null ? fmtMoney(ch.cpl) : '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {!live.campaigns.length && (
                    <p className="text-[12px] text-(--dp-text-muted)">No campaign activity in the last 30 days.</p>
                  )}
                </div>
                <p className="mt-4 text-[11px] text-(--dp-text-faint)">
                  Spend, leads, and cost per lead by campaign — trailing 30 days.
                </p>
              </>
            ) : (
              <>
                <div className="space-y-3.5">
                  {SAMPLE_CHANNELS.map(ch => {
                    const share = (ch.spend / totalSampleSpend) * 100;
                    return (
                      <div key={ch.name} className="grid grid-cols-[110px_1fr_auto] items-center gap-4">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[12px] font-semibold text-(--dp-text) truncate">{ch.name}</span>
                          {ch.roas === bestRoas && (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-(--dp-success)">Best</span>
                          )}
                        </div>
                        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-(--dp-accent)" style={{ width: `${share}%` }} />
                        </div>
                        <div className="flex items-baseline gap-3 tabular-nums">
                          <span className="text-[11px] text-(--dp-text-muted) w-[52px] text-right">{fmtK(ch.spend)}</span>
                          <span className="text-[11px] text-(--dp-text-faint) w-[62px] text-right">${ch.cac} CAC</span>
                          <span className={`text-[12px] font-bold w-[44px] text-right ${ch.roas >= 4 ? 'text-(--dp-success)' : 'text-(--dp-warning)'}`}>
                            {ch.roas.toFixed(1)}×
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-[11px] text-(--dp-text-faint)">
                  CAC and return per channel, last non-direct touch.
                </p>
              </>
            )}
          </Card>

          <Card
            title={
              <span className="inline-flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-(--dp-accent-text)" />
                {live ? 'Spend vs leads by month' : 'Spend vs return by cycle'}
              </span>
            }
          >
            {live ? (
              <>
                <div className={`grid gap-3 items-end h-[150px] pt-5`} style={{ gridTemplateColumns: `repeat(${Math.max(live.trend.length, 1)}, 1fr)` }}>
                  {live.trend.map(t => (
                    <div key={t.month} className="flex flex-col items-center justify-end h-full gap-1.5">
                      <span className="text-[10px] font-bold tabular-nums text-(--dp-success)">
                        {t.leads > 0 ? fmtMoney(t.spend / t.leads) : '—'}
                      </span>
                      <div className="flex items-end gap-1 w-full justify-center flex-1">
                        <div
                          className="w-[36%] max-w-[24px] rounded-t-[3px] bg-(--dp-accent)"
                          style={{ height: `${Math.max((t.spend / maxLiveTrend) * 100, 2)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-(--dp-text-muted)">{t.month}</span>
                      <span className="text-[10px] tabular-nums text-(--dp-text-faint)">{t.leads} leads</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-(--dp-text-muted)">
                    <span className="w-2 h-2 rounded-[3px] bg-(--dp-accent)" /> Spend · label = cost per lead
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-(--dp-text-faint)">
                    {live.trend.length} months <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-6 gap-3 items-end h-[150px] pt-5">
                  {SAMPLE_TREND.map(t => (
                    <div key={t.month} className="flex flex-col items-center justify-end h-full gap-1.5">
                      <span className="text-[10px] font-bold tabular-nums text-(--dp-success)">
                        {(t.revenue / t.spend).toFixed(1)}×
                      </span>
                      <div className="flex items-end gap-1 w-full justify-center flex-1">
                        <div
                          className="w-[22%] max-w-[18px] rounded-t-[3px] bg-(--dp-border-strong)"
                          style={{ height: `${(t.spend / maxSampleTrend) * 100}%` }}
                        />
                        <div
                          className="w-[22%] max-w-[18px] rounded-t-[3px] bg-(--dp-accent)"
                          style={{ height: `${(t.revenue / maxSampleTrend) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-(--dp-text-muted)">{t.month}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-(--dp-text-muted)">
                      <span className="w-2 h-2 rounded-[3px] bg-(--dp-border-strong)" /> Spend
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-(--dp-text-muted)">
                      <span className="w-2 h-2 rounded-[3px] bg-(--dp-accent)" /> Return
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-(--dp-text-faint)">
                    6 cycles <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      <MetaConnectDialog
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        connected={metaConn ? { accountId: metaConn.accountId, accountName: metaConn.accountName, lastSyncedAt: metaConn.lastSyncedAt } : null}
      />
    </div>
  );
}
