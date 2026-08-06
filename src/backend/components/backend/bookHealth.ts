/**
 * Book health: flag merchants whose processing is slipping so the agent can
 * intervene before the residual disappears. Pure logic, unit-tested —
 * consumed by AgentDashboard.
 */

import type { ResidualRow } from './residualsStore';

export interface HealthFlag {
  merchant: string;
  note: string;
}

/** Volume drop (vs the prior period) beyond this fraction gets flagged. */
export const DROP_THRESHOLD = 0.25;

/** Max flags surfaced at once — the dashboard shows a nudge, not a report. */
export const MAX_FLAGS = 3;

/**
 * Compare the two most recent residual periods: flag merchants that vanished
 * from the latest period, or whose volume fell more than DROP_THRESHOLD.
 *
 * `limit` caps the result — MAX_FLAGS by default, which suits the dashboard
 * nudge. Pass Infinity for the full watchlist.
 */
export function computeHealthFlags(rows: ResidualRow[], limit: number = MAX_FLAGS): HealthFlag[] {
  const periods = [...new Set(rows.map(r => r.period))].sort().reverse();
  if (periods.length < 2) return [];
  const [latest, prev] = periods;
  const latestBy = new Map(rows.filter(r => r.period === latest).map(r => [r.merchantName, r]));
  const flags: HealthFlag[] = [];
  for (const r of rows.filter(x => x.period === prev)) {
    const now = latestBy.get(r.merchantName);
    if (!now) {
      flags.push({ merchant: r.merchantName, note: 'No processing in the latest period' });
    } else if (r.monthlyVolume > 0 && now.monthlyVolume < r.monthlyVolume * (1 - DROP_THRESHOLD)) {
      const drop = Math.round((1 - now.monthlyVolume / r.monthlyVolume) * 100);
      flags.push({ merchant: r.merchantName, note: `Volume down ${drop}% month over month` });
    }
  }
  return flags.slice(0, limit);
}
