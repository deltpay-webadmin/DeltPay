/**
 * ────────────────────────────────────────────────────────────
 * Capital offers store — the record that drives the offer emails
 * ────────────────────────────────────────────────────────────
 * One row per offer (capital_offers, migration 20260812_03). Writes go
 * straight to the table under RLS (capital.create to make one,
 * capital.modify_terms to change or advance it) — there's no edge function
 * in the path because nothing here is sensitive or needs server-side
 * computation.
 *
 * The status column is the whole point: capital-offer-sweep reads it every
 * 15 minutes and sends DC-7 (offer) → DC-8 (48h reminder) → DC-9 (decline
 * pivot) → DC-10 (unsigned-contract chase) → DC-11 (funded welcome). Moving
 * an offer here is what sends the email; there is no separate "send" button
 * to forget to press.
 *
 * Same store shape as capitalStore/merchantApplicationsStore: pub-sub,
 * hydrate on first subscribe, realtime refresh, no-op without Supabase.
 */

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';

export type OfferStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'declined'
  | 'contract_out'
  | 'signed'
  | 'funded'
  | 'expired'
  | 'withdrawn';

export type PaymentFrequency = 'daily' | 'weekly' | 'monthly';

export interface CapitalOffer {
  id: string;
  leadId: string | null;
  dealId: string | null;
  contractId: string | null;
  merchantName: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  amount: number;
  factor: number;
  payback: number;          // generated column: amount × factor
  termDays: number | null;
  holdbackPct: number | null;
  paymentAmount: number | null;
  paymentFrequency: PaymentFrequency;
  useOfFunds: string | null;
  notes: string | null;
  expiresAt: string;
  status: OfferStatus;
  declinedReason: string | null;
  offerSentAt: string | null;
  reminderSentAt: string | null;
  declineNotifiedAt: string | null;
  chaseCount: number;
  lastChaseAt: string | null;
  fundedNotifiedAt: string | null;
  contractSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Which statuses an offer can legally move to. Mirrors the state machine
 * documented on the migration — the DB doesn't enforce transitions, so this
 * is what stops someone marking a declined offer "funded" from a stale tab. */
export const NEXT_STATUSES: Record<OfferStatus, OfferStatus[]> = {
  draft: ['sent', 'withdrawn'],
  sent: ['accepted', 'declined', 'expired', 'withdrawn'],
  accepted: ['contract_out', 'declined', 'withdrawn'],
  contract_out: ['signed', 'declined', 'withdrawn'],
  signed: ['funded', 'withdrawn'],
  funded: [],
  declined: [],
  expired: [],
  withdrawn: [],
};

export const STATUS_LABELS: Record<OfferStatus, string> = {
  draft: 'Draft',
  sent: 'Offer sent',
  accepted: 'Accepted',
  contract_out: 'Contract out',
  signed: 'Signed',
  funded: 'Funded',
  declined: 'Declined',
  expired: 'Expired',
  withdrawn: 'Withdrawn',
};

/** What moving to this status will cause the sweep to email. Surfaced in the
 * UI so nobody changes a dropdown without knowing a merchant gets mail. */
export const STATUS_EMAIL: Partial<Record<OfferStatus, string>> = {
  sent: 'DC-7 — sends the offer, then a 48h reminder if it goes quiet',
  declined: 'DC-9 — sends the decline pivot',
  contract_out: 'DC-10 — chases the unsigned agreement at 24h and 72h',
  funded: 'DC-11 — sends the funded welcome',
};

interface OffersState {
  offers: CapitalOffer[];
  isLoading: boolean;
  isOnline: boolean;
  lastError: string | null;
}

let state: OffersState = { offers: [], isLoading: false, isOnline: Boolean(supabase), lastError: null };
const listeners = new Set<() => void>();
let hydrated = false;
let channelBound = false;

function emit() {
  state = { ...state };
  for (const fn of listeners) fn();
}

function fromDb(row: any): CapitalOffer {
  return {
    id: row.id,
    leadId: row.lead_id ?? null,
    dealId: row.deal_id ?? null,
    contractId: row.contract_id ?? null,
    merchantName: row.merchant_name,
    contactName: row.contact_name ?? null,
    contactEmail: row.contact_email ?? null,
    contactPhone: row.contact_phone ?? null,
    amount: Number(row.amount ?? 0),
    factor: Number(row.factor ?? 1.35),
    payback: Number(row.payback ?? 0),
    termDays: row.term_days ?? null,
    holdbackPct: row.holdback_pct == null ? null : Number(row.holdback_pct),
    paymentAmount: row.payment_amount == null ? null : Number(row.payment_amount),
    paymentFrequency: (row.payment_frequency ?? 'daily') as PaymentFrequency,
    useOfFunds: row.use_of_funds ?? null,
    notes: row.notes ?? null,
    expiresAt: row.expires_at,
    status: row.status as OfferStatus,
    declinedReason: row.declined_reason ?? null,
    offerSentAt: row.offer_sent_at ?? null,
    reminderSentAt: row.reminder_sent_at ?? null,
    declineNotifiedAt: row.decline_notified_at ?? null,
    chaseCount: row.chase_count ?? 0,
    lastChaseAt: row.last_chase_at ?? null,
    fundedNotifiedAt: row.funded_notified_at ?? null,
    contractSentAt: row.contract_sent_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function refresh() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('capital_offers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    state = { ...state, isLoading: false, lastError: error.message };
    emit();
    return;
  }
  state = { ...state, offers: (data ?? []).map(fromDb), isLoading: false, lastError: null };
  emit();
}

function maybeHydrate() {
  if (hydrated || !supabase) return;
  hydrated = true;
  state = { ...state, isLoading: true };
  void refresh();
  if (!channelBound) {
    channelBound = true;
    supabase
      .channel('capital-offers-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'capital_offers' }, () => {
        void refresh();
      })
      .subscribe();
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  maybeHydrate();
  return () => listeners.delete(fn);
}

export function useCapitalOffers(): OffersState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function useOffersForLead(leadId: string | null | undefined): CapitalOffer[] {
  const s = useCapitalOffers();
  if (!leadId) return [];
  return s.offers.filter((o) => o.leadId === leadId);
}

export interface NewOfferInput {
  leadId?: string | null;
  merchantName: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  amount: number;
  factor: number;
  termDays?: number | null;
  holdbackPct?: number | null;
  paymentAmount?: number | null;
  paymentFrequency?: PaymentFrequency;
  useOfFunds?: string | null;
  notes?: string | null;
  expiresAt: string;      // ISO
  /** Create it already sent — the sweep mails DC-7 within 15 minutes. */
  sendNow?: boolean;
}

export const offerActions = {
  async create(input: NewOfferInput): Promise<CapitalOffer | null> {
    if (!supabase) {
      toast.error('Supabase is not configured — offers need a live connection.');
      return null;
    }
    const status: OfferStatus = input.sendNow ? 'sent' : 'draft';
    if (status === 'sent' && !String(input.contactEmail || '').trim()) {
      toast.error("No email on this offer — save it as a draft, or add an address before sending.");
      return null;
    }
    const { data, error } = await supabase
      .from('capital_offers')
      .insert({
        lead_id: input.leadId || null,
        merchant_name: input.merchantName,
        contact_name: input.contactName || null,
        contact_email: (input.contactEmail || '').trim().toLowerCase() || null,
        contact_phone: input.contactPhone || null,
        amount: input.amount,
        factor: input.factor,
        term_days: input.termDays ?? null,
        holdback_pct: input.holdbackPct ?? null,
        payment_amount: input.paymentAmount ?? null,
        payment_frequency: input.paymentFrequency ?? 'daily',
        use_of_funds: input.useOfFunds || null,
        notes: input.notes || null,
        expires_at: input.expiresAt,
        status,
      })
      .select('*')
      .single();
    if (error) {
      // The partial unique index is the most likely rejection — say what it
      // means rather than leaking the constraint name.
      toast.error(
        error.message.includes('capital_offers_one_live_per_lead')
          ? 'This lead already has a live offer. Withdraw or close it first.'
          : `Could not create the offer: ${error.message}`,
      );
      return null;
    }
    await refresh();
    toast.success(status === 'sent' ? 'Offer created — the email goes out within 15 minutes.' : 'Offer saved as a draft.');
    return fromDb(data);
  },

  async setStatus(id: string, status: OfferStatus, extra?: { declinedReason?: string; dealId?: string; contractId?: string }): Promise<boolean> {
    if (!supabase) return false;
    const patch: Record<string, unknown> = { status };
    if (extra?.declinedReason !== undefined) patch.declined_reason = extra.declinedReason || null;
    if (extra?.dealId !== undefined) patch.deal_id = extra.dealId || null;
    if (extra?.contractId !== undefined) patch.contract_id = extra.contractId || null;
    // The chase clock starts when the envelope goes out, not when the offer
    // was made — otherwise a contract sent a week later gets chased instantly.
    if (status === 'contract_out') patch.contract_sent_at = new Date().toISOString();
    const { error } = await supabase.from('capital_offers').update(patch).eq('id', id);
    if (error) {
      toast.error(`Could not update the offer: ${error.message}`);
      return false;
    }
    await refresh();
    const mail = STATUS_EMAIL[status];
    toast.success(mail ? `Moved to ${STATUS_LABELS[status]} — ${mail.split('—')[1].trim()}.` : `Moved to ${STATUS_LABELS[status]}.`);
    return true;
  },

  async updateTerms(id: string, patch: Partial<NewOfferInput>): Promise<boolean> {
    if (!supabase) return false;
    const db: Record<string, unknown> = {};
    if (patch.amount !== undefined) db.amount = patch.amount;
    if (patch.factor !== undefined) db.factor = patch.factor;
    if (patch.termDays !== undefined) db.term_days = patch.termDays;
    if (patch.holdbackPct !== undefined) db.holdback_pct = patch.holdbackPct;
    if (patch.paymentAmount !== undefined) db.payment_amount = patch.paymentAmount;
    if (patch.paymentFrequency !== undefined) db.payment_frequency = patch.paymentFrequency;
    if (patch.expiresAt !== undefined) db.expires_at = patch.expiresAt;
    if (patch.useOfFunds !== undefined) db.use_of_funds = patch.useOfFunds || null;
    if (patch.notes !== undefined) db.notes = patch.notes || null;
    if (patch.contactEmail !== undefined) db.contact_email = (patch.contactEmail || '').trim().toLowerCase() || null;
    if (Object.keys(db).length === 0) return true;
    const { error } = await supabase.from('capital_offers').update(db).eq('id', id);
    if (error) {
      toast.error(`Could not save terms: ${error.message}`);
      return false;
    }
    await refresh();
    toast.success('Terms updated.');
    return true;
  },

  async remove(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('capital_offers').delete().eq('id', id);
    if (error) {
      toast.error(`Could not delete the offer: ${error.message}`);
      return false;
    }
    await refresh();
    toast.success('Offer deleted.');
    return true;
  },
};
