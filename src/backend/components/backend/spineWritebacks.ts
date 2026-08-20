/**
 * ────────────────────────────────────────────────────────────
 * Spine write-backs — terminal deal events → submission + lead
 * ────────────────────────────────────────────────────────────
 * A deal is WON when it's funded (capital) or the merchant account is
 * boarded/installed (processing). Both events happen deep in their own
 * stores (mark_funded RPC, MPA mark-boarded), so pages call this after
 * the event succeeds and the lead + submission catch up automatically.
 *
 * Lives outside the stores to keep them decoupled (capitalStore and
 * crmStore already import each other's actions in one direction).
 */

import { supabase } from '../../lib/supabase';
import { dealSubmissionActions } from './dealSubmissionsStore';
import { ensureCrmHydrated, leadActions } from './crmStore';

export async function fundingWriteback(
  submissionId: string | null | undefined,
  event: 'funded' | 'boarded',
): Promise<void> {
  if (!submissionId) return;
  try {
    await dealSubmissionActions.advanceStatus(submissionId, 'Activated');
    if (!supabase) return;
    const { data } = await supabase
      .from('deal_submissions')
      .select('lead_id')
      .eq('id', submissionId)
      .maybeSingle();
    const leadId = (data?.lead_id as string | null) ?? null;
    if (!leadId) return;
    await ensureCrmHydrated();
    leadActions.markWon(leadId, event === 'funded' ? 'Deal funded' : 'Merchant account approved & installed');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SpineWritebacks] fundingWriteback failed:', err);
  }
}
