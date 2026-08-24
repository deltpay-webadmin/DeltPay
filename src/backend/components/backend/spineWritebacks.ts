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
import { ensureCrmHydrated, leadActions, merchantActions, getMerchantBySubmission } from './crmStore';

export async function fundingWriteback(
  submissionId: string | null | undefined,
  event: 'funded' | 'boarded',
): Promise<void> {
  if (!submissionId) return;
  try {
    await dealSubmissionActions.advanceStatus(submissionId, 'Activated');
    if (!supabase) return;
    const { data: sub } = await supabase
      .from('deal_submissions')
      .select('*')
      .eq('id', submissionId)
      .maybeSingle();
    const leadId = (sub?.lead_id as string | null) ?? null;
    await ensureCrmHydrated();
    if (leadId) {
      leadActions.markWon(leadId, event === 'funded' ? 'Deal funded' : 'Merchant account approved & installed');
    }

    // Boarding IS the merchant's birth: create the merchant record from
    // what the deal already knows instead of making staff retype it in
    // "Add merchant". Idempotent via merchants.submission_id.
    if (event === 'boarded' && sub) {
      const already = getMerchantBySubmission(submissionId)
        ?? (await supabase.from('merchants').select('id').eq('submission_id', submissionId).maybeSingle()).data;
      if (!already) {
        const { data: app } = await supabase
          .from('merchant_applications')
          .select('data')
          .eq('submission_id', submissionId)
          .neq('status', 'void')
          .maybeSingle();
        const biz = (app?.data as any)?.business ?? null;
        const addr = (app?.data as any)?.locationAddress ?? null;
        merchantActions.create({
          name: biz?.dba || biz?.legalName || sub.merchant_name || 'New Merchant',
          industry: sub.vertical || 'General',
          status: 'Active',
          monthlyVolume: Number(sub.monthly_volume) || 0,
          agent: sub.agent_name || 'Unassigned',
          products: {
            processing: true,
            capital: Boolean(sub.wants_capital),
            website: false,
            lens: false,
          },
          contactName: biz ? `${biz.contactFirstName ?? ''} ${biz.contactLastName ?? ''}`.trim() || sub.contact_name || undefined : sub.contact_name || undefined,
          contactEmail: biz?.email || sub.email || undefined,
          contactPhone: biz?.phone || sub.phone || undefined,
          state: addr?.state || undefined,
          ein: biz?.ein || undefined,
          website: biz?.website || undefined,
          notes: `Boarded from deal submission ${submissionId}${leadId ? ` (lead ${leadId})` : ''}`,
          submissionId,
        });
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SpineWritebacks] fundingWriteback failed:', err);
  }
}
