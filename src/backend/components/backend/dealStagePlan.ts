// ══════════════════════════════════════════════════════════════
// Which Deal Room stages a deal shows, and how they're numbered.
//
// Payments-only deals skip the capital paperwork entirely (Plaid pull,
// DLT-APP, underwriting, MCA, countersign) — their flow is just the
// processor MPA/boarding plus the documents panel. Deals that already
// carry capital artifacts (an underwriting file, a sent DLT-APP or MCA
// envelope, a capital deal) keep every stage visible regardless of the
// path, so nothing with real envelopes ever disappears from view.
// ══════════════════════════════════════════════════════════════
import type { ProductPath } from './dealSubmissionsStore';

export type DealStageKey =
  | 'plaid'
  | 'application'
  | 'underwriting'
  | 'mca'
  | 'countersign'
  | 'mpa'
  | 'documents';

const ALL_STAGES: DealStageKey[] = ['plaid', 'application', 'underwriting', 'mca', 'countersign', 'mpa', 'documents'];
const PAYMENTS_ONLY_STAGES: DealStageKey[] = ['mpa', 'documents'];

export interface DealStagePlan {
  visible: DealStageKey[];
  /** Sequential display number per stage; null when the stage is hidden. */
  numbers: Record<DealStageKey, number | null>;
  /** Payments-only, but capital artifacts exist — stages forced visible. */
  capitalForcedOpen: boolean;
}

export function dealStagePlan(opts: {
  path: ProductPath;
  hasCapitalArtifacts: boolean;
  canCountersign: boolean;
}): DealStagePlan {
  const capitalForcedOpen = opts.path === 'payments-only' && opts.hasCapitalArtifacts;
  const showCapital = opts.path === 'payments+capital' || capitalForcedOpen;
  const visible = (showCapital ? ALL_STAGES : PAYMENTS_ONLY_STAGES)
    .filter(k => k !== 'countersign' || opts.canCountersign);

  const numbers = Object.fromEntries(ALL_STAGES.map(k => [k, null])) as Record<DealStageKey, number | null>;
  visible.forEach((k, i) => { numbers[k] = i + 1; });

  return { visible, numbers, capitalForcedOpen };
}
