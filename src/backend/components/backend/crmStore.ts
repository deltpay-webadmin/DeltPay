/**
 * ────────────────────────────────────────────────────────────
 * Delt CRM — Supabase-backed store
 * ────────────────────────────────────────────────────────────
 * Persistent store backed by Supabase Postgres. Preserves the
 * pub/sub + React hook surface of the previous in-memory version
 * so page components don't need to change.
 *
 * Behavior:
 *   • On first hook subscription, `hydrate()` fetches all tables
 *     from Supabase and opens a realtime channel so multi-user
 *     updates stream in live.
 *   • Every action applies an optimistic local update, then writes
 *     to Supabase. On failure, state is rolled back and a toast fires.
 *   • If `supabase` is null (env vars missing), the store falls back
 *     to the original in-memory behavior so the app still runs.
 *
 * DB column names use snake_case; TS types stay camelCase. The
 * `fromDb*` / `toDb*` helpers do the conversion.
 */

import { useSyncExternalStore, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  evaluateApplication,
  defaultScoreInputs,
  stressTest,
  type PlaidInputs,
  type CrsInputs,
  type DataMerchInputs,
} from './underwritingScore';
import { capitalActions } from './capitalStore';

// ══════════════════════════════════════════════════════════════
// Types (unchanged — pages depend on this exact shape)
// ══════════════════════════════════════════════════════════════

// Short CRM sales cycle. Onboarding / underwriting happens outside the CRM,
// so a lead only moves New → Contacted → Qualified → Converted (handoff).
export type LeadStage =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Converted';

export const LEAD_STAGES: LeadStage[] = [
  'New',
  'Contacted',
  'Qualified',
  'Converted',
];

export interface LeadStepDetail {
  stage: LeadStage;
  completedAt: string | null;
}

export interface TimelineItem {
  icon?: any;
  title: string;
  description: string;
  user: string;
  timestamp: string;
}

export interface LeadTask {
  id: string;
  title: string;
  due: string;
  done: boolean;
}

export interface LeadNote {
  id: string;
  body: string;
  author: string;
  timestamp: string;
}

export interface LeadBundle {
  bundleName: string;
  amount: number;
  dateIssued: string;
  expiration: string;
  status: 'Not Assigned' | 'Credit Issued' | 'Order Placed' | 'Shipped' | 'Delivered';
}

// ── KYB intake (Stripe-style lead onboarding) ──
// Full Know-Your-Business payload captured during lead creation.
// Kept optional on Lead so legacy leads remain valid; persisted as a
// single `kyb` jsonb column in Supabase.
export type BusinessStructure =
  | 'Sole Proprietorship'
  | 'LLC'
  | 'Partnership'
  | 'C Corporation'
  | 'S Corporation'
  | 'Non-Profit'
  | 'Other';

export interface BusinessProfile {
  legalName: string;
  dba: string;
  structure: BusinessStructure;
  taxIdType: 'EIN' | 'SSN';
  taxIdLast4: string;
  stateOfIncorporation: string;
  yearFounded: string;
  website: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  mcc: string; // Merchant Category Code
  industry: string;
  productDescription: string;
}

export interface Representative {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  dobMasked: string; // MM/DD/YYYY — never store full SSN client-side
  ssnLast4: string;
  ownershipPct: number;
  isOwner: boolean;
  isController: boolean;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface BeneficialOwner {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  ownershipPct: number;
  ssnLast4: string;
}

export interface ProcessingProfile {
  monthlyVolume: string;
  avgTicket: string;
  highTicket: string;
  cardPresentPct: number; // 0-100
  currentProcessor: string;
  currentEffectiveRate: string;
  acceptsAmex: boolean;
  hasChargebacks: boolean;
  chargebackRatePct: string;
  seasonalBusiness: boolean;
}

export interface BankOnFile {
  bankName: string;
  accountHolder: string;
  routingLast4: string;
  accountLast4: string;
  accountType: 'Checking' | 'Savings';
  verificationMethod: 'Plaid' | 'Voided Check' | 'Bank Letter' | 'Manual';
}

export interface UploadedDoc {
  id: string;
  kind:
    | 'Processing Statement'
    | 'Bank Statement'
    | 'Voided Check'
    | 'Drivers License'
    | 'EIN Letter'
    | 'Other';
  filename: string;
  size: number;
  uploadedAt: string;
}

export interface FundingRequest {
  requested: boolean;
  amount: string;
  useOfFunds: string;
  timeInBusinessMonths: string;
}

export interface KybIntake {
  business: BusinessProfile;
  representative: Representative;
  owners: BeneficialOwner[];
  processing: ProcessingProfile;
  funding: FundingRequest;
  bank: BankOnFile;
  documents: UploadedDoc[];
  attestation: {
    certifiedAccurate: boolean;
    authorizedToSign: boolean;
    signedAt: string;
    signedByName: string;
  };
}

/** Product lines a lead can be tagged with — either or both. */
export type ProductTag = 'Capital' | 'Processing';

export interface Lead {
  id: string;
  businessName: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  type: 'MCA' | 'Residual' | 'Processing' | 'Leasing';
  /** Product-line tags: Capital, Processing, or both. */
  products?: ProductTag[];
  source: string;
  monthlySales: string;
  amountRequested: string;
  score: number;
  status: 'New' | 'In Progress' | 'Not Qualified' | 'Won' | 'Lost';
  priority: 'High' | 'Medium' | 'Low';
  lastActivity: string;
  /** ISO timestamps from Supabase (DB-managed). */
  createdAt?: string;
  updatedAt?: string;
  assignedAgent: string;
  stage: LeadStage;
  timeline: TimelineItem[];
  notes: string;
  extraNotes?: LeadNote[];
  tasks?: LeadTask[];
  blocker?: string;
  stepDetails?: LeadStepDetail[];
  referredBy?: string;
  bundle?: LeadBundle | null;
  /** Full Stripe-style KYB intake captured during lead creation. */
  kyb?: KybIntake;
}

// ── Onboarding ──
export type OnbStep =
  | 'Application Submitted'
  | 'Bank Verification'
  | 'Identity Verification'
  | 'Underwriting'
  | 'Docs & E-Sign'
  | 'Funded';

export type SLAStatus = 'On Track' | 'At Risk' | 'Breached';

export interface OnboardingStepProgress {
  step: OnbStep;
  completedAt: string | null;
  slaTarget: string;
}

export interface OnboardingApp {
  id: string;
  merchantName: string;
  agent: string;
  currentStep: OnbStep;
  currentStepIndex: number;
  timeInStep: string;
  timeInStepHours: number;
  slaTarget: string;
  slaStatus: SLAStatus;
  submittedDate: string;
  blocker: string;
  steps: OnboardingStepProgress[];
  nudges?: number;
  lastNudge?: string;
}

// ── Underwriting ──
export type UWStage =
  | 'Intake'
  | 'Plaid Verification'
  | 'Credit Check'
  | 'MCA History'
  | 'Final Review'
  | 'Approved'
  | 'Declined';

export type ProductType = 'MCA' | 'Term Loan' | 'Line of Credit' | 'Revenue Based';

export type UWTier = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' | 'Decline';

export interface UWApplication {
  id: string;
  applicationId: string;
  businessName: string;
  dba?: string;
  industry: string;
  state: string;
  productType: ProductType;
  requestedAmount: number;
  monthlyRevenue: number;
  avgDailyBalance: number;
  monthsInBusiness: number;
  creditScore: number;
  existingPositions: number;
  submissionDate: string;
  reviewer: string;
  reviewerInitials: string;
  riskScore: number;
  stage: UWStage;
  daysInStage: number;
  slaThreshold: number;
  factorRate?: number;
  proposedPayback?: number;
  dailyPayment?: number;
  holdbackPct?: number;
  disclosureState?: string;
  missingDocs?: string[];
  notes?: string;
  source: string;
  // ── Rubric / scoring engine snapshot ──
  plaidInputs?: PlaidInputs;
  crsInputs?: CrsInputs;
  dataMerchInputs?: DataMerchInputs;
  plaidScore?: number;
  crsScore?: number;
  dataMerchScore?: number;
  compositeScore?: number;
  tier?: UWTier;
  disqualifiers?: string[];
  stressTest?: { passes: boolean; notes: string[] };
  approvedDealId?: string;
  declineReason?: string;
  assignedTo?: string;
}

// ── Merchants ──
export type MerchantStatus = 'Active' | 'Inactive' | 'Pending';
export type PlanTier = 'Free' | 'Growth' | 'Custom';

export interface MerchantProducts {
  processing: boolean;
  capital: boolean;
  website: boolean;
  lens: boolean;
}

export interface Merchant {
  id: string;
  name: string;
  industry: string;
  status: MerchantStatus;
  monthlyVolume: number;
  mcaBalance: number;
  capitalDeployed: number;
  healthScore: number;
  agent: string;
  products: MerchantProducts;
  plan: PlanTier;
  monthlyFee: number;
  // Optional contact/business info captured during onboarding.
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  state?: string;
  ein?: string;
  website?: string;
  notes?: string;
}

// ── Deals ──
export type DealStatus = 'Current' | 'Delinquent' | 'Default' | 'Paid Off' | 'Workout';
export type DealType = 'MCA' | 'Lease' | 'Residual';

export interface Deal {
  id: string;
  status: DealStatus;
  delinquencyLabel?: string;
  type: DealType;
  borrower: string;
  loanAmount: number;
  repaymentAmount: number;
  collected: number;
  outstanding: number;
  rate: number;
  dailyPayment: number;
  fundedDate: string;
  dueDate: string;
  agent: string;
  notes?: string;
}

// ── Referrals ──
export interface Referral {
  id: string;
  referringMerchant: string;
  referredBusiness: string;
  referralCode: string;
  date: string;
  status: 'Pending' | 'Contacted' | 'Converted' | 'Expired';
  rewardStatus: 'Pending' | 'Paid' | 'N/A';
  rewardAmount: string;
}

export interface ReferralProgram {
  rewardAmount: string;
  freeMonths: string;
  planTier: string;
}

export interface CrmState {
  leads: Lead[];
  onboarding: OnboardingApp[];
  underwriting: UWApplication[];
  referrals: Referral[];
  program: ReferralProgram;
  merchants: Merchant[];
  deals: Deal[];
}

// ══════════════════════════════════════════════════════════════
// Fallback seed data — used only when Supabase is NOT configured.
// Keeps the app functional in preview / contributor environments.
// ══════════════════════════════════════════════════════════════

const fallbackSeed: CrmState = {
  leads: [],
  onboarding: [],
  underwriting: [],
  referrals: [],
  program: { rewardAmount: '100', freeMonths: '1', planTier: 'Growth' },
  merchants: [],
  deals: [],
};

// ══════════════════════════════════════════════════════════════
// Store (pub/sub)
// ══════════════════════════════════════════════════════════════

interface SyncState {
  isLoading: boolean;
  isOnline: boolean;
  lastError: string | null;
}

let state: CrmState = {
  leads: [],
  onboarding: [],
  underwriting: [],
  referrals: [],
  program: { rewardAmount: '100', freeMonths: '1', planTier: 'Growth' },
  merchants: [],
  deals: [],
};

let sync: SyncState = {
  isLoading: isSupabaseConfigured,
  isOnline: isSupabaseConfigured,
  lastError: null,
};

const listeners = new Set<() => void>();

function set(next: Partial<CrmState>) {
  state = { ...state, ...next };
  listeners.forEach(l => l());
}

function setSync(next: Partial<SyncState>) {
  sync = { ...sync, ...next };
  listeners.forEach(l => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  maybeHydrate();
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

function getSyncSnapshot() {
  return sync;
}

// ══════════════════════════════════════════════════════════════
// DB ↔ TS mappers
// ══════════════════════════════════════════════════════════════

function fromDbLead(r: any): Lead {
  return {
    id: r.id,
    businessName: r.business_name,
    industry: r.industry,
    contactName: r.contact_name ?? '',
    contactEmail: r.contact_email ?? '',
    contactPhone: r.contact_phone ?? '',
    type: r.type,
    products: r.products ?? [],
    source: r.source ?? '',
    monthlySales: r.monthly_sales ?? '',
    amountRequested: r.amount_requested ?? '',
    score: r.score ?? 50,
    status: r.status,
    priority: r.priority,
    lastActivity: r.last_activity ?? '',
    assignedAgent: r.assigned_agent ?? '',
    stage: r.stage,
    timeline: r.timeline ?? [],
    notes: r.notes ?? '',
    extraNotes: r.extra_notes ?? [],
    tasks: r.tasks ?? [],
    blocker: r.blocker ?? undefined,
    stepDetails: r.step_details ?? undefined,
    referredBy: r.referred_by ?? undefined,
    bundle: r.bundle ?? null,
    kyb: r.kyb ?? undefined,
    createdAt: r.created_at ?? undefined,
    updatedAt: r.updated_at ?? undefined,
  };
}

export function toDbLead(l: Partial<Lead>): Record<string, any> {
  const out: Record<string, any> = {};
  if (l.id !== undefined) out.id = l.id;
  if (l.businessName !== undefined) out.business_name = l.businessName;
  if (l.industry !== undefined) out.industry = l.industry;
  if (l.contactName !== undefined) out.contact_name = l.contactName;
  if (l.contactEmail !== undefined) out.contact_email = l.contactEmail;
  if (l.contactPhone !== undefined) out.contact_phone = l.contactPhone;
  if (l.type !== undefined) out.type = l.type;
  if (l.products !== undefined) out.products = l.products;
  if (l.source !== undefined) out.source = l.source;
  if (l.monthlySales !== undefined) out.monthly_sales = l.monthlySales;
  if (l.amountRequested !== undefined) out.amount_requested = l.amountRequested;
  if (l.score !== undefined) out.score = l.score;
  if (l.status !== undefined) out.status = l.status;
  if (l.priority !== undefined) out.priority = l.priority;
  if (l.lastActivity !== undefined) out.last_activity = l.lastActivity;
  if (l.assignedAgent !== undefined) out.assigned_agent = l.assignedAgent;
  if (l.stage !== undefined) out.stage = l.stage;
  if (l.timeline !== undefined) out.timeline = l.timeline;
  if (l.notes !== undefined) out.notes = l.notes;
  if (l.extraNotes !== undefined) out.extra_notes = l.extraNotes;
  if (l.tasks !== undefined) out.tasks = l.tasks;
  if (l.blocker !== undefined) out.blocker = l.blocker;
  if (l.stepDetails !== undefined) out.step_details = l.stepDetails;
  if (l.referredBy !== undefined) out.referred_by = l.referredBy;
  if (l.bundle !== undefined) out.bundle = l.bundle;
  if (l.kyb !== undefined) out.kyb = l.kyb;
  return out;
}

function fromDbOnb(r: any): OnboardingApp {
  return {
    id: r.id,
    merchantName: r.merchant_name,
    agent: r.agent,
    currentStep: r.current_step,
    currentStepIndex: r.current_step_index ?? 0,
    timeInStep: r.time_in_step ?? '',
    timeInStepHours: Number(r.time_in_step_hours ?? 0),
    slaTarget: r.sla_target ?? '',
    slaStatus: r.sla_status ?? 'On Track',
    submittedDate: r.submitted_date ?? '',
    blocker: r.blocker ?? '',
    steps: r.steps ?? [],
    nudges: r.nudges ?? 0,
    lastNudge: r.last_nudge ?? undefined,
  };
}

function toDbOnb(o: Partial<OnboardingApp>): Record<string, any> {
  const out: Record<string, any> = {};
  if (o.id !== undefined) out.id = o.id;
  if (o.merchantName !== undefined) out.merchant_name = o.merchantName;
  if (o.agent !== undefined) out.agent = o.agent;
  if (o.currentStep !== undefined) out.current_step = o.currentStep;
  if (o.currentStepIndex !== undefined) out.current_step_index = o.currentStepIndex;
  if (o.timeInStep !== undefined) out.time_in_step = o.timeInStep;
  if (o.timeInStepHours !== undefined) out.time_in_step_hours = o.timeInStepHours;
  if (o.slaTarget !== undefined) out.sla_target = o.slaTarget;
  if (o.slaStatus !== undefined) out.sla_status = o.slaStatus;
  if (o.submittedDate !== undefined) out.submitted_date = o.submittedDate;
  if (o.blocker !== undefined) out.blocker = o.blocker;
  if (o.steps !== undefined) out.steps = o.steps;
  if (o.nudges !== undefined) out.nudges = o.nudges;
  if (o.lastNudge !== undefined) out.last_nudge = o.lastNudge;
  return out;
}

// `underwriting_apps.stage` is stored as a compact lowercase set.
// Map both directions so the UI keeps working against the new schema.
type UWDbStage = 'intake' | 'plaid' | 'crs' | 'datamerch' | 'review' | 'approved' | 'declined' | 'funded';

const UW_STAGE_TO_DB: Record<UWStage, UWDbStage> = {
  Intake: 'intake',
  'Plaid Verification': 'plaid',
  'Credit Check': 'crs',
  'MCA History': 'datamerch',
  'Final Review': 'review',
  Approved: 'approved',
  Declined: 'declined',
};

const UW_DB_TO_STAGE: Record<UWDbStage, UWStage> = {
  intake: 'Intake',
  plaid: 'Plaid Verification',
  crs: 'Credit Check',
  datamerch: 'MCA History',
  review: 'Final Review',
  approved: 'Approved',
  funded: 'Approved',
  declined: 'Declined',
};

function fromDbUw(r: any): UWApplication {
  const composite = r.composite_score != null ? Number(r.composite_score) : undefined;
  return {
    id: r.id,
    applicationId: r.application_id,
    businessName: r.merchant_name ?? '',
    industry: r.business_type ?? '',
    state: '',
    productType: 'MCA',
    requestedAmount: Number(r.requested_amount ?? 0),
    monthlyRevenue: Number(r.plaid_inputs?.monthlyRevenue ?? 0),
    avgDailyBalance: Number(r.plaid_inputs?.avgDailyBalance ?? 0),
    monthsInBusiness: 0,
    creditScore: Number(r.crs_inputs?.fico ?? 0),
    existingPositions: Number(r.datamerch_inputs?.currentOpenPositions ?? 0),
    submissionDate: r.created_at ? String(r.created_at).slice(0, 10) : '',
    reviewer: r.assigned_to ?? '',
    reviewerInitials: (r.assigned_to ?? '')
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    riskScore: composite ?? 0,
    stage: UW_DB_TO_STAGE[(r.stage as UWDbStage)] ?? 'Intake',
    daysInStage: 0,
    slaThreshold: 2,
    disclosureState: undefined,
    notes: r.notes ?? undefined,
    source: 'Manual',
    plaidInputs: r.plaid_inputs ?? undefined,
    crsInputs: r.crs_inputs ?? undefined,
    dataMerchInputs: r.datamerch_inputs ?? undefined,
    plaidScore: r.plaid_score != null ? Number(r.plaid_score) : undefined,
    crsScore: r.crs_score != null ? Number(r.crs_score) : undefined,
    dataMerchScore: r.datamerch_score != null ? Number(r.datamerch_score) : undefined,
    compositeScore: composite,
    tier: (r.tier as UWTier) ?? undefined,
    disqualifiers: r.disqualifiers ?? undefined,
    stressTest: r.stress_test ?? undefined,
    approvedDealId: r.approved_deal_id ?? undefined,
    declineReason: r.decline_reason ?? undefined,
    assignedTo: r.assigned_to ?? undefined,
  };
}

function toDbUw(a: Partial<UWApplication>): Record<string, any> {
  const out: Record<string, any> = {};
  if (a.id !== undefined) out.id = a.id;
  if (a.applicationId !== undefined) out.application_id = a.applicationId;
  if (a.businessName !== undefined) out.merchant_name = a.businessName;
  if (a.industry !== undefined) out.business_type = a.industry;
  if (a.requestedAmount !== undefined) out.requested_amount = a.requestedAmount;
  if (a.stage !== undefined) out.stage = UW_STAGE_TO_DB[a.stage];
  if (a.notes !== undefined) out.notes = a.notes ?? null;
  if (a.plaidInputs !== undefined) out.plaid_inputs = a.plaidInputs ?? null;
  if (a.crsInputs !== undefined) out.crs_inputs = a.crsInputs ?? null;
  if (a.dataMerchInputs !== undefined) out.datamerch_inputs = a.dataMerchInputs ?? null;
  if (a.plaidScore !== undefined) out.plaid_score = a.plaidScore ?? null;
  if (a.crsScore !== undefined) out.crs_score = a.crsScore ?? null;
  if (a.dataMerchScore !== undefined) out.datamerch_score = a.dataMerchScore ?? null;
  if (a.compositeScore !== undefined) out.composite_score = a.compositeScore ?? null;
  if (a.tier !== undefined) out.tier = a.tier ?? null;
  if (a.disqualifiers !== undefined) out.disqualifiers = a.disqualifiers ?? null;
  if (a.stressTest !== undefined) out.stress_test = a.stressTest ?? null;
  if (a.approvedDealId !== undefined) out.approved_deal_id = a.approvedDealId ?? null;
  if (a.declineReason !== undefined) out.decline_reason = a.declineReason ?? null;
  if (a.assignedTo !== undefined) out.assigned_to = a.assignedTo ?? null;
  return out;
}

function fromDbReferral(r: any): Referral {
  return {
    id: r.id,
    referringMerchant: r.referring_merchant,
    referredBusiness: r.referred_business,
    referralCode: r.referral_code,
    date: r.date ?? '',
    status: r.status,
    rewardStatus: r.reward_status,
    rewardAmount: r.reward_amount ?? '',
  };
}

function toDbReferral(r: Partial<Referral>): Record<string, any> {
  const out: Record<string, any> = {};
  if (r.id !== undefined) out.id = r.id;
  if (r.referringMerchant !== undefined) out.referring_merchant = r.referringMerchant;
  if (r.referredBusiness !== undefined) out.referred_business = r.referredBusiness;
  if (r.referralCode !== undefined) out.referral_code = r.referralCode;
  if (r.date !== undefined) out.date = r.date;
  if (r.status !== undefined) out.status = r.status;
  if (r.rewardStatus !== undefined) out.reward_status = r.rewardStatus;
  if (r.rewardAmount !== undefined) out.reward_amount = r.rewardAmount;
  return out;
}

function fromDbMerchant(r: any): Merchant {
  return {
    id: r.id,
    name: r.name,
    industry: r.industry ?? 'General',
    status: r.status ?? 'Pending',
    monthlyVolume: Number(r.monthly_volume ?? 0),
    mcaBalance: Number(r.mca_balance ?? 0),
    capitalDeployed: Number(r.capital_deployed ?? 0),
    healthScore: Number(r.health_score ?? 75),
    agent: r.agent ?? 'Unassigned',
    products: r.products ?? { processing: true, capital: false, website: false, lens: false },
    plan: r.plan ?? 'Free',
    monthlyFee: Number(r.monthly_fee ?? 0),
    contactName: r.contact_name ?? undefined,
    contactEmail: r.contact_email ?? undefined,
    contactPhone: r.contact_phone ?? undefined,
    state: r.state ?? undefined,
    ein: r.ein ?? undefined,
    website: r.website ?? undefined,
    notes: r.notes ?? undefined,
  };
}

function toDbMerchant(m: Partial<Merchant>): Record<string, any> {
  const out: Record<string, any> = {};
  if (m.id !== undefined) out.id = m.id;
  if (m.name !== undefined) out.name = m.name;
  if (m.industry !== undefined) out.industry = m.industry;
  if (m.status !== undefined) out.status = m.status;
  if (m.monthlyVolume !== undefined) out.monthly_volume = m.monthlyVolume;
  if (m.mcaBalance !== undefined) out.mca_balance = m.mcaBalance;
  if (m.capitalDeployed !== undefined) out.capital_deployed = m.capitalDeployed;
  if (m.healthScore !== undefined) out.health_score = m.healthScore;
  if (m.agent !== undefined) out.agent = m.agent;
  if (m.products !== undefined) out.products = m.products;
  if (m.plan !== undefined) out.plan = m.plan;
  if (m.monthlyFee !== undefined) out.monthly_fee = m.monthlyFee;
  if (m.contactName !== undefined) out.contact_name = m.contactName ?? null;
  if (m.contactEmail !== undefined) out.contact_email = m.contactEmail ?? null;
  if (m.contactPhone !== undefined) out.contact_phone = m.contactPhone ?? null;
  if (m.state !== undefined) out.state = m.state ?? null;
  if (m.ein !== undefined) out.ein = m.ein ?? null;
  if (m.website !== undefined) out.website = m.website ?? null;
  if (m.notes !== undefined) out.notes = m.notes ?? null;
  return out;
}

function fromDbDeal(r: any): Deal {
  return {
    id: r.id,
    status: r.status ?? 'Current',
    delinquencyLabel: r.delinquency_label ?? undefined,
    type: r.type ?? 'MCA',
    borrower: r.borrower ?? '',
    loanAmount: Number(r.loan_amount ?? 0),
    repaymentAmount: Number(r.repayment_amount ?? 0),
    collected: Number(r.collected ?? 0),
    outstanding: Number(r.outstanding ?? 0),
    rate: Number(r.rate ?? 1.35),
    dailyPayment: Number(r.daily_payment ?? 0),
    fundedDate: r.funded_date ?? '',
    dueDate: r.due_date ?? '',
    agent: r.agent ?? 'Unassigned',
    notes: r.notes ?? undefined,
  };
}

function toDbDeal(d: Partial<Deal>): Record<string, any> {
  const out: Record<string, any> = {};
  if (d.id !== undefined) out.id = d.id;
  if (d.status !== undefined) out.status = d.status;
  if (d.delinquencyLabel !== undefined) out.delinquency_label = d.delinquencyLabel ?? null;
  if (d.type !== undefined) out.type = d.type;
  if (d.borrower !== undefined) out.borrower = d.borrower;
  if (d.loanAmount !== undefined) out.loan_amount = d.loanAmount;
  if (d.repaymentAmount !== undefined) out.repayment_amount = d.repaymentAmount;
  if (d.collected !== undefined) out.collected = d.collected;
  if (d.outstanding !== undefined) out.outstanding = d.outstanding;
  if (d.rate !== undefined) out.rate = d.rate;
  if (d.dailyPayment !== undefined) out.daily_payment = d.dailyPayment;
  if (d.fundedDate !== undefined) out.funded_date = d.fundedDate || null;
  if (d.dueDate !== undefined) out.due_date = d.dueDate || null;
  if (d.agent !== undefined) out.agent = d.agent;
  if (d.notes !== undefined) out.notes = d.notes ?? null;
  return out;
}

function fromDbProgram(r: any): ReferralProgram {
  return {
    rewardAmount: r.reward_amount ?? '100',
    freeMonths: r.free_months ?? '1',
    planTier: r.plan_tier ?? 'Growth',
  };
}

function toDbProgram(p: Partial<ReferralProgram>): Record<string, any> {
  const out: Record<string, any> = {};
  if (p.rewardAmount !== undefined) out.reward_amount = String(p.rewardAmount);
  if (p.freeMonths !== undefined) out.free_months = String(p.freeMonths);
  if (p.planTier !== undefined) out.plan_tier = p.planTier;
  return out;
}

// ══════════════════════════════════════════════════════════════
// Hydration + realtime
// ══════════════════════════════════════════════════════════════

let hydrated = false;
let hydrating = false;

async function maybeHydrate() {
  if (hydrated || hydrating) return;

  if (!supabase) {
    // Offline mode — load fallback seed once so screens aren't empty.
    hydrated = true;
    set(fallbackSeed);
    setSync({ isLoading: false, isOnline: false });
    return;
  }

  hydrating = true;
  setSync({ isLoading: true, lastError: null });

  try {
    const [leadsRes, onbRes, uwRes, refRes, progRes, merchRes, dealsRes] = await Promise.all([
      supabase.from('pipeline_leads').select('*').order('created_at', { ascending: false }),
      supabase.from('onboarding_apps').select('*').order('id', { ascending: true }),
      supabase.from('underwriting_apps').select('*').order('id', { ascending: true }),
      supabase.from('referrals').select('*').order('id', { ascending: true }),
      supabase.from('referral_program').select('*').eq('id', 1).maybeSingle(),
      supabase.from('merchants').select('*').order('created_at', { ascending: false }),
      supabase.from('crm_deals').select('*').order('created_at', { ascending: false }),
    ]);

    // Per-table results: an RLS denial on one table must not blank the whole
    // CRM — apply what loaded, surface the first error, and only go offline
    // when every query failed.
    const results = [leadsRes, onbRes, uwRes, refRes, progRes, merchRes, dealsRes];
    const firstErr = results.find(r => r.error)?.error ?? null;
    const allFailed = results.every(r => r.error);
    if (allFailed) throw firstErr;

    set({
      leads: leadsRes.error ? [] : (leadsRes.data || []).map(fromDbLead),
      onboarding: onbRes.error ? [] : (onbRes.data || []).map(fromDbOnb),
      underwriting: uwRes.error ? [] : (uwRes.data || []).map(fromDbUw),
      referrals: refRes.error ? [] : (refRes.data || []).map(fromDbReferral),
      program: !progRes.error && progRes.data
        ? fromDbProgram(progRes.data)
        : { rewardAmount: '100', freeMonths: '1', planTier: 'Growth' },
      merchants: merchRes.error ? [] : (merchRes.data || []).map(fromDbMerchant),
      deals: dealsRes.error ? [] : (dealsRes.data || []).map(fromDbDeal),
    });

    hydrated = true;
    setSync({ isLoading: false, isOnline: true, lastError: firstErr?.message ?? null });
    subscribeRealtime();
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Delt CRM] Hydration failed:', err);
    hydrated = true; // don't retry-loop — user can refresh
    setSync({ isLoading: false, isOnline: false, lastError: err?.message || 'Failed to load' });
    toast.error('Unable to load CRM data — showing local snapshot.');
    // Keep whatever's already in state (likely empty) to stay functional.
  } finally {
    hydrating = false;
  }
}

function subscribeRealtime() {
  if (!supabase) return;
  const channel = supabase
    .channel('crm-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pipeline_leads' },
      payload => applyRealtime('leads', payload),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'onboarding_apps' },
      payload => applyRealtime('onboarding_apps', payload),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'underwriting_apps' },
      payload => applyRealtime('underwriting_apps', payload),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'referrals' },
      payload => applyRealtime('referrals', payload),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'referral_program' },
      payload => applyRealtime('referral_program', payload),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'merchants' },
      payload => applyRealtime('merchants', payload),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'crm_deals' },
      payload => applyRealtime('crm_deals', payload),
    )
    .subscribe();
  // Keep reference so it isn't GC'd.
  (globalThis as any).__deltCrmChannel = channel;
}

function applyRealtime(table: string, payload: any) {
  const { eventType, new: newRow, old: oldRow } = payload;
  if (table === 'leads') {
    if (eventType === 'DELETE') {
      set({ leads: state.leads.filter(l => l.id !== oldRow?.id) });
    } else {
      const mapped = fromDbLead(newRow);
      const exists = state.leads.some(l => l.id === mapped.id);
      set({
        leads: exists
          ? state.leads.map(l => (l.id === mapped.id ? mapped : l))
          : [mapped, ...state.leads],
      });
    }
  } else if (table === 'onboarding_apps') {
    if (eventType === 'DELETE') {
      set({ onboarding: state.onboarding.filter(o => o.id !== oldRow?.id) });
    } else {
      const mapped = fromDbOnb(newRow);
      const exists = state.onboarding.some(o => o.id === mapped.id);
      set({
        onboarding: exists
          ? state.onboarding.map(o => (o.id === mapped.id ? mapped : o))
          : [...state.onboarding, mapped],
      });
    }
  } else if (table === 'underwriting_apps') {
    if (eventType === 'DELETE') {
      set({ underwriting: state.underwriting.filter(a => a.id !== oldRow?.id) });
    } else {
      const mapped = fromDbUw(newRow);
      const exists = state.underwriting.some(a => a.id === mapped.id);
      set({
        underwriting: exists
          ? state.underwriting.map(a => (a.id === mapped.id ? mapped : a))
          : [mapped, ...state.underwriting],
      });
    }
  } else if (table === 'referrals') {
    if (eventType === 'DELETE') {
      set({ referrals: state.referrals.filter(r => r.id !== oldRow?.id) });
    } else {
      const mapped = fromDbReferral(newRow);
      const exists = state.referrals.some(r => r.id === mapped.id);
      set({
        referrals: exists
          ? state.referrals.map(r => (r.id === mapped.id ? mapped : r))
          : [mapped, ...state.referrals],
      });
    }
  } else if (table === 'referral_program') {
    if (newRow) set({ program: fromDbProgram(newRow) });
  } else if (table === 'merchants') {
    if (eventType === 'DELETE') {
      set({ merchants: state.merchants.filter(m => m.id !== oldRow?.id) });
    } else {
      const mapped = fromDbMerchant(newRow);
      const exists = state.merchants.some(m => m.id === mapped.id);
      set({
        merchants: exists
          ? state.merchants.map(m => (m.id === mapped.id ? mapped : m))
          : [mapped, ...state.merchants],
      });
    }
  } else if (table === 'crm_deals') {
    if (eventType === 'DELETE') {
      set({ deals: state.deals.filter(d => d.id !== oldRow?.id) });
    } else {
      const mapped = fromDbDeal(newRow);
      const exists = state.deals.some(d => d.id === mapped.id);
      set({
        deals: exists
          ? state.deals.map(d => (d.id === mapped.id ? mapped : d))
          : [mapped, ...state.deals],
      });
    }
  }
}

// ══════════════════════════════════════════════════════════════
// Optimistic write helper
// ══════════════════════════════════════════════════════════════

async function persist<T>(
  label: string,
  apply: () => void,
  rollback: () => void,
  op: () => Promise<{ error: { message: string } | null }>,
): Promise<void> {
  apply();
  if (!supabase) return; // offline mode: optimistic-only
  try {
    const { error } = await op();
    if (error) {
      rollback();
      // eslint-disable-next-line no-console
      console.error(`[Delt CRM] ${label} failed:`, error);
      toast.error(`Couldn't save ${label.toLowerCase()} — reverted.`);
    }
  } catch (err: any) {
    rollback();
    // eslint-disable-next-line no-console
    console.error(`[Delt CRM] ${label} threw:`, err);
    toast.error(`Couldn't save ${label.toLowerCase()} — reverted.`);
  }
}

// ══════════════════════════════════════════════════════════════
// Bulk import
// ══════════════════════════════════════════════════════════════

export interface LeadImportOutcome {
  inserted: number;
  duplicates: number;
  failed: number;
  errors: string[];
}

export interface LeadImportMeta {
  filename: string;
  rowCount: number;
  skippedCount: number;
  errorCount: number;
  notes?: string;
}

/** Refetch all leads from the DB and replace store state. */
export async function refreshLeads(): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('pipeline_leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (!error && data) set({ leads: data.map(fromDbLead) });
}

const IMPORT_CHUNK = 100;

/**
 * Bulk-upsert pre-mapped rows into pipeline_leads, deduped on external_id
 * (existing rows are left untouched), then record the batch in lead_imports
 * and refresh the store.
 */
export async function importLeads(
  dbRows: Record<string, any>[],
  meta: LeadImportMeta,
): Promise<LeadImportOutcome> {
  if (!supabase) {
    return { inserted: 0, duplicates: 0, failed: dbRows.length, errors: ['Supabase not configured'] };
  }
  const out: LeadImportOutcome = { inserted: 0, duplicates: 0, failed: 0, errors: [] };
  for (let i = 0; i < dbRows.length; i += IMPORT_CHUNK) {
    const chunk = dbRows.slice(i, i + IMPORT_CHUNK);
    const { data, error } = await supabase
      .from('pipeline_leads')
      .upsert(chunk, { onConflict: 'external_id', ignoreDuplicates: true })
      .select('id');
    if (error) {
      out.failed += chunk.length;
      out.errors.push(error.message);
      continue;
    }
    // ignoreDuplicates → ON CONFLICT DO NOTHING, which returns only rows
    // actually inserted; the remainder of the chunk hit existing external_ids.
    const insertedNow = data?.length ?? 0;
    out.inserted += insertedNow;
    out.duplicates += chunk.length - insertedNow;
  }
  const { error: logError } = await supabase.from('lead_imports').insert({
    filename: meta.filename,
    source: 'Meta Ads',
    row_count: meta.rowCount,
    inserted_count: out.inserted,
    duplicate_count: out.duplicates,
    skipped_count: meta.skippedCount,
    error_count: meta.errorCount + out.failed,
    notes: meta.notes ?? null,
  });
  if (logError) {
    // eslint-disable-next-line no-console
    console.error('[Delt CRM] Failed to record import batch:', logError);
  }
  await refreshLeads();
  return out;
}

// ══════════════════════════════════════════════════════════════
// Hooks
// ══════════════════════════════════════════════════════════════

export function useCrm() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useLeads() {
  const selector = useCallback(() => state.leads, []);
  return useSyncExternalStore(subscribe, selector, selector);
}

export function useOnboarding() {
  const selector = useCallback(() => state.onboarding, []);
  return useSyncExternalStore(subscribe, selector, selector);
}

export function useUnderwriting() {
  const selector = useCallback(() => state.underwriting, []);
  return useSyncExternalStore(subscribe, selector, selector);
}

export function useMerchants() {
  const selector = useCallback(() => state.merchants, []);
  return useSyncExternalStore(subscribe, selector, selector);
}

export function useDeals() {
  const selector = useCallback(() => state.deals, []);
  return useSyncExternalStore(subscribe, selector, selector);
}

export function useReferrals() {
  const selector = useCallback(() => state.referrals, []);
  return useSyncExternalStore(subscribe, selector, selector);
}

export function useReferralProgram() {
  const selector = useCallback(() => state.program, []);
  return useSyncExternalStore(subscribe, selector, selector);
}

/** Exposes hydration & connectivity status for UI indicators. */
export function useCrmSync() {
  return useSyncExternalStore(subscribe, getSyncSnapshot, getSyncSnapshot);
}

// ══════════════════════════════════════════════════════════════
// Actions (signatures unchanged — pages unchanged)
// ══════════════════════════════════════════════════════════════

const nowStamp = () =>
  new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

// ── Lead actions ──
export const leadActions = {
  create(lead: Partial<Lead>): Lead {
    // Generate an ID that's unique against current state.
    const used = new Set(state.leads.map(l => l.id));
    let n = state.leads.length + 1;
    let id = `lead-${String(n).padStart(3, '0')}`;
    while (used.has(id)) id = `lead-${String(++n).padStart(3, '0')}`;

    const businessName = lead.businessName || 'New Business';
    const industry = lead.industry || 'General';
    const contactName = lead.contactName || '';
    const contactEmail = lead.contactEmail || '';
    const contactPhone = lead.contactPhone || '';
    const type = (lead.type as any) || 'MCA';
    const source = lead.source || 'Manual';
    const monthlySales = lead.monthlySales || '$0';
    const amountRequested = lead.amountRequested || '$0';
    // Auto-derive the score from whatever data we have unless one was passed in.
    const score =
      lead.score ??
      scoreLead({
        monthlySales,
        amountRequested,
        contactEmail,
        contactPhone,
        contactName,
        industry,
        source,
        type,
        referredBy: lead.referredBy,
        status: 'New',
        stage: 'New',
      });

    const created: Lead = {
      id,
      businessName,
      industry,
      contactName,
      contactEmail,
      contactPhone,
      type,
      source,
      monthlySales,
      amountRequested,
      score,
      status: 'New',
      priority: (lead.priority as any) || 'Medium',
      lastActivity: 'just now',
      assignedAgent: lead.assignedAgent || 'Unassigned',
      stage: 'New',
      timeline: [{ title: 'Lead created', description: 'Manually added via CRM', user: lead.assignedAgent || 'System', timestamp: 'just now' }],
      notes: lead.notes || '',
      extraNotes: [],
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const prev = state.leads;
    persist(
      'lead',
      () => set({ leads: [created, ...state.leads] }),
      () => set({ leads: prev }),
      () => supabase!.from('pipeline_leads').insert(toDbLead(created)).then(r => ({ error: r.error })),
    );
    return created;
  },

  update(id: string, patch: Partial<Lead>) {
    const prev = state.leads;
    const lead = state.leads.find(l => l.id === id);
    if (!lead) return;
    // Recompute the score when scoring inputs change and the caller didn't
    // pass an explicit score — so the score stays in sync as data is added.
    let effective = patch;
    if (patch.score === undefined && SCORING_FIELDS.some(k => k in patch)) {
      const merged = { ...lead, ...patch };
      effective = { ...patch, score: scoreLead(merged) };
    }
    persist(
      'lead',
      () => set({ leads: state.leads.map(l => (l.id === id ? { ...l, ...effective } : l)) }),
      () => set({ leads: prev }),
      () => supabase!.from('pipeline_leads').update(toDbLead(effective)).eq('id', id).then(r => ({ error: r.error })),
    );
  },

  toggleProduct(id: string, tag: ProductTag) {
    const lead = state.leads.find(l => l.id === id);
    if (!lead) return;
    const cur = lead.products ?? [];
    const products = cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag];
    leadActions.update(id, { products });
  },

  /** Add or remove a product tag across many leads; skips no-ops. */
  tagProductMany(ids: string[], tag: ProductTag, on: boolean) {
    for (const id of ids) {
      const lead = state.leads.find(l => l.id === id);
      if (!lead) continue;
      const cur = lead.products ?? [];
      const has = cur.includes(tag);
      if (on && !has) leadActions.update(id, { products: [...cur, tag] });
      else if (!on && has) leadActions.update(id, { products: cur.filter(t => t !== tag) });
    }
  },

  setStatus(id: string, status: Lead['status']) {
    leadActions.update(id, { status, lastActivity: 'just now' });
    leadActions.addTimeline(id, { title: `Status set to ${status}`, description: 'Updated from pipeline', user: 'You', timestamp: 'just now' });
  },

  /** Returns false if the lead can't advance (dead-ended or already at the end). */
  advanceStage(id: string): boolean {
    const lead = state.leads.find(l => l.id === id);
    if (!lead) return false;
    // A disqualified/lost lead cannot be progressed or converted.
    if (lead.status === 'Not Qualified' || lead.status === 'Lost') return false;
    const idx = LEAD_STAGES.indexOf(lead.stage);
    if (idx < 0 || idx >= LEAD_STAGES.length - 1) return false;
    const next = LEAD_STAGES[idx + 1];
    const patch: Partial<Lead> = { stage: next, lastActivity: 'just now' };
    if (next === 'Converted') patch.status = 'Won';
    else if (lead.status === 'New') patch.status = 'In Progress';
    leadActions.update(id, patch);
    leadActions.addTimeline(id, { title: `Advanced to ${next}`, description: 'Pipeline stage promoted', user: 'You', timestamp: 'just now' });
    return true;
  },

  /**
   * Convert (win) a lead — the CRM's terminal success, handing off to
   * onboarding elsewhere. Blocked for disqualified/lost leads.
   * Returns false if the conversion was refused.
   */
  convert(id: string): boolean {
    const lead = state.leads.find(l => l.id === id);
    if (!lead) return false;
    if (lead.status === 'Not Qualified' || lead.status === 'Lost') return false;
    leadActions.update(id, { stage: 'Converted', status: 'Won', lastActivity: 'just now' });
    leadActions.addTimeline(id, { title: 'Lead converted', description: 'Won — handed off to onboarding', user: 'You', timestamp: 'just now' });
    // Hand off into the onboarding pipeline (skip if one already exists).
    const exists = state.onboarding.some(
      o => o.merchantName.toLowerCase() === lead.businessName.toLowerCase() && o.currentStep !== 'Funded',
    );
    if (!exists) {
      onboardingActions.create({
        merchantName: lead.businessName,
        agent: lead.assignedAgent || 'Unassigned',
      });
    }
    return true;
  },

  markLost(id: string) {
    leadActions.update(id, { status: 'Lost', lastActivity: 'just now' });
    leadActions.addTimeline(id, { title: 'Lead marked lost', description: 'Closed-lost from pipeline', user: 'You', timestamp: 'just now' });
  },

  markNotQualified(id: string) {
    leadActions.update(id, { status: 'Not Qualified', lastActivity: 'just now' });
    leadActions.addTimeline(id, { title: 'Lead marked not qualified', description: 'Did not meet qualification criteria', user: 'You', timestamp: 'just now' });
  },

  /** Force a fresh score recompute from the lead's current data. */
  recomputeScore(id: string) {
    const lead = state.leads.find(l => l.id === id);
    if (!lead) return;
    leadActions.update(id, { score: scoreLead(lead) });
  },

  addNote(id: string, body: string, author = 'You') {
    const lead = state.leads.find(l => l.id === id);
    if (!lead) return;
    const note: LeadNote = { id: `n-${Date.now()}`, body, author, timestamp: nowStamp() };
    leadActions.update(id, { extraNotes: [...(lead.extraNotes || []), note], lastActivity: 'just now' });
    leadActions.addTimeline(id, { title: 'Note added', description: body.slice(0, 80), user: author, timestamp: 'just now' });
  },

  toggleTask(id: string, taskId: string) {
    const lead = state.leads.find(l => l.id === id);
    if (!lead) return;
    const tasks = (lead.tasks || []).map(t => (t.id === taskId ? { ...t, done: !t.done } : t));
    leadActions.update(id, { tasks });
  },

  addTask(id: string, title: string, due = 'No due date') {
    const lead = state.leads.find(l => l.id === id);
    if (!lead) return;
    const task: LeadTask = { id: `t-${Date.now()}`, title, due, done: false };
    leadActions.update(id, { tasks: [...(lead.tasks || []), task] });
  },

  addTimeline(id: string, item: TimelineItem) {
    const lead = state.leads.find(l => l.id === id);
    if (!lead) return;
    leadActions.update(id, { timeline: [item, ...lead.timeline] });
  },

  assignBundle(id: string, bundle: { name: string; amount: number }) {
    const now = new Date();
    const exp = new Date(now);
    exp.setDate(exp.getDate() + 30);
    const b: LeadBundle = {
      bundleName: bundle.name,
      amount: bundle.amount,
      dateIssued: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      expiration: exp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Credit Issued',
    };
    leadActions.update(id, { bundle: b });
    leadActions.addTimeline(id, { title: `Bundle assigned: ${bundle.name}`, description: `$${bundle.amount} credit issued`, user: 'You', timestamp: 'just now' });
  },

  cycleBundleStatus(id: string) {
    const lead = state.leads.find(l => l.id === id);
    if (!lead || !lead.bundle) return;
    const order: LeadBundle['status'][] = ['Credit Issued', 'Order Placed', 'Shipped', 'Delivered'];
    const idx = order.indexOf(lead.bundle.status);
    const next = order[Math.min(idx + 1, order.length - 1)];
    leadActions.update(id, { bundle: { ...lead.bundle, status: next } });
  },

  /** Permanently delete a single lead (optimistic + Supabase). */
  remove(id: string) {
    const prev = state.leads;
    const lead = state.leads.find(l => l.id === id);
    if (!lead) return;
    persist(
      'delete lead',
      () => set({ leads: state.leads.filter(l => l.id !== id) }),
      () => set({ leads: prev }),
      () => supabase!.from('pipeline_leads').delete().eq('id', id).then(r => ({ error: r.error })),
    );
  },

  /** Permanently delete many leads in one shot (optimistic + Supabase). */
  removeMany(ids: string[]) {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    const prev = state.leads;
    persist(
      'delete leads',
      () => set({ leads: state.leads.filter(l => !idSet.has(l.id)) }),
      () => set({ leads: prev }),
      () => supabase!.from('pipeline_leads').delete().in('id', ids).then(r => ({ error: r.error })),
    );
  },
};

/**
 * Heuristic: does this lead look like junk / test / placeholder data?
 * Used by the backend "Find dummy leads" helper so staff can clear
 * seed and test rows quickly without hand-picking each one.
 */
export function isDummyLead(l: Lead): boolean {
  const name = (l.businessName || '').trim();
  const lower = name.toLowerCase();
  if (!name) return true;
  // Angle-bracket placeholders Meta injects, e.g. "<test lead: dummy data…>"
  if (name.startsWith('<') || name.includes('dummy') || name.includes('test lead')) return true;
  // Obvious keyword placeholders
  if (/\b(test|demo|sample|asdf|qwerty|placeholder|delete\s*me)\b/.test(lower)) return true;
  // A bare social handle or email fragment with no real business identity
  if (name.startsWith('@')) return true;
  return false;
}

/** Parse a money-ish string ("$45,000", "45000") into a number. */
function parseMoney(v?: string): number {
  if (!v) return 0;
  const n = Number(String(v).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** Fields that feed the lead score — used to decide when to recompute. */
const SCORING_FIELDS: (keyof Lead)[] = [
  'monthlySales',
  'amountRequested',
  'contactEmail',
  'contactPhone',
  'contactName',
  'industry',
  'source',
  'status',
  'stage',
  'referredBy',
  'type',
];

/**
 * Heuristic lead score (0–100) derived from whatever data is on the lead.
 * Works for quick-capture leads and Meta imports — not just full KYB — so a
 * lead's score becomes meaningful and improves as staff fill in more data.
 * Deterministic and pure, so the same inputs always yield the same score.
 */
export function scoreLead(l: Partial<Lead>): number {
  let score = 50;

  // Monthly processing / sales volume — the strongest signal.
  const sales = parseMoney(l.monthlySales);
  if (sales >= 100_000) score += 22;
  else if (sales >= 50_000) score += 15;
  else if (sales >= 20_000) score += 9;
  else if (sales >= 5_000) score += 4;
  else if (sales > 0) score += 1;

  // Requested amount vs. monthly sales — a sane ask scores higher.
  const req = parseMoney(l.amountRequested);
  if (sales > 0 && req > 0) {
    const ratio = req / sales;
    if (ratio <= 1.5) score += 8;
    else if (ratio <= 3) score += 3;
    else if (ratio > 6) score -= 8;
  }

  // Contact completeness — reachable leads convert.
  if (l.contactEmail && l.contactEmail.includes('@')) score += 4;
  if (l.contactPhone && l.contactPhone.replace(/\D/g, '').length >= 10) score += 4;
  if (l.contactName && l.contactName.trim()) score += 2;
  if (l.industry && l.industry.trim() && l.industry !== 'General') score += 2;

  // Source quality.
  const src = (l.source || '').toLowerCase();
  if (src.includes('referral') || src.includes('partner')) score += 8;
  else if (src.includes('website') || src.includes('inbound') || src.includes('event')) score += 4;
  else if (src.includes('cold')) score -= 4;
  if (l.referredBy) score += 4;

  // Pipeline progress — later stages carry more conviction.
  const stageIdx = l.stage ? LEAD_STAGES.indexOf(l.stage) : 0;
  if (stageIdx > 0) score += Math.min(stageIdx * 2, 12);

  // Status dispositions clamp the score to a sensible band.
  if (l.status === 'Won') score = Math.max(score, 90);
  else if (l.status === 'Lost') score = Math.min(score, 25);
  else if (l.status === 'Not Qualified') score = Math.min(score, 15);

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ── Onboarding actions ──
const ONB_STEPS: OnbStep[] = ['Application Submitted', 'Bank Verification', 'Identity Verification', 'Underwriting', 'Docs & E-Sign', 'Funded'];
const ONB_SLA_TARGETS: Record<OnbStep, string> = {
  'Application Submitted': '—',
  'Bank Verification': '24 hrs',
  'Identity Verification': '24 hrs',
  Underwriting: '48 hrs',
  'Docs & E-Sign': '72 hrs',
  Funded: '24 hrs',
};

export const onboardingActions = {
  create(partial: Partial<OnboardingApp>): OnboardingApp {
    const used = new Set(state.onboarding.map(o => o.id));
    let n = state.onboarding.length + 1;
    let id = `ONB-${String(n).padStart(3, '0')}`;
    while (used.has(id)) id = `ONB-${String(++n).padStart(3, '0')}`;
    const app: OnboardingApp = {
      id,
      merchantName: partial.merchantName || 'New Merchant',
      agent: partial.agent || 'Unassigned',
      currentStep: 'Application Submitted',
      currentStepIndex: 0,
      timeInStep: '0 hrs',
      timeInStepHours: 0,
      slaTarget: ONB_SLA_TARGETS['Bank Verification'],
      slaStatus: 'On Track',
      submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      blocker: '',
      steps: ONB_STEPS.map((step, i) => ({
        step,
        completedAt: i === 0 ? nowStamp() : null,
        slaTarget: ONB_SLA_TARGETS[step],
      })),
      nudges: 0,
    };
    const prev = state.onboarding;
    persist(
      'onboarding app',
      () => set({ onboarding: [...state.onboarding, app] }),
      () => set({ onboarding: prev }),
      () => supabase!.from('onboarding_apps').insert(toDbOnb(app)).then(r => ({ error: r.error })),
    );
    return app;
  },

  nudge(id: string) {
    const prev = state.onboarding;
    const target = state.onboarding.find(o => o.id === id);
    if (!target) return;
    const patch = { nudges: (target.nudges || 0) + 1, lastNudge: nowStamp() };
    persist(
      'onboarding nudge',
      () =>
        set({
          onboarding: state.onboarding.map(o => (o.id === id ? { ...o, ...patch } : o)),
        }),
      () => set({ onboarding: prev }),
      () => supabase!.from('onboarding_apps').update(toDbOnb(patch)).eq('id', id).then(r => ({ error: r.error })),
    );
  },

  reassign(id: string, newAgent: string) {
    const prev = state.onboarding;
    persist(
      'reassign',
      () =>
        set({
          onboarding: state.onboarding.map(o => (o.id === id ? { ...o, agent: newAgent } : o)),
        }),
      () => set({ onboarding: prev }),
      () => supabase!.from('onboarding_apps').update({ agent: newAgent }).eq('id', id).then(r => ({ error: r.error })),
    );
  },

  advance(id: string) {
    const target = state.onboarding.find(o => o.id === id);
    if (!target) return;
    const wasFunded = target.currentStep === 'Funded';
    const nextIdx = Math.min(target.currentStepIndex + 1, ONB_STEPS.length - 1);
    const nextStep = ONB_STEPS[nextIdx];
    const steps = target.steps.map((s, i) => (i === target.currentStepIndex ? { ...s, completedAt: nowStamp() } : s));
    const patch: Partial<OnboardingApp> = {
      currentStep: nextStep,
      currentStepIndex: nextIdx,
      steps,
      timeInStep: '0 hrs',
      timeInStepHours: 0,
      slaStatus: 'On Track',
    };
    const prev = state.onboarding;
    persist(
      'advance step',
      () =>
        set({
          onboarding: state.onboarding.map(o => (o.id === id ? { ...o, ...patch } : o)),
        }),
      () => set({ onboarding: prev }),
      () => supabase!.from('onboarding_apps').update(toDbOnb(patch)).eq('id', id).then(r => ({ error: r.error })),
    );

    // Reaching Funded completes onboarding — promote to an active merchant,
    // carrying over contact/business data from the source lead when we have it.
    if (!wasFunded && nextStep === 'Funded') {
      const already = state.merchants.some(
        m => m.name.toLowerCase() === target.merchantName.toLowerCase(),
      );
      if (!already) {
        const lead = state.leads.find(
          l => l.businessName.toLowerCase() === target.merchantName.toLowerCase(),
        );
        merchantActions.create({
          name: target.merchantName,
          industry: lead?.industry || 'General',
          status: 'Active',
          agent: target.agent,
          monthlyVolume: lead ? parseMoney(lead.monthlySales) : 0,
          contactName: lead?.contactName || undefined,
          contactEmail: lead?.contactEmail || undefined,
          contactPhone: lead?.contactPhone || undefined,
          state: lead?.kyb?.business.state || undefined,
          website: lead?.kyb?.business.website || undefined,
          notes: lead ? `Funded via onboarding ${id} (lead ${lead.id})` : `Funded via onboarding ${id}`,
        });
      }
    }
  },
};

// ── Underwriting actions ──
// Map a scoring-engine RiskTier (1-4 | 'decline') to the UWTier label stored in DB.
function tierLabel(tier: 1 | 2 | 3 | 4 | 'decline'): UWTier {
  return tier === 'decline' ? 'Decline' : (`Tier ${tier}` as UWTier);
}

/**
 * Run the pure scoring engine over an application's inputs and return the
 * derived rubric patch (sub-scores, composite, tier, disqualifiers, stress test).
 * Falls back to engine defaults for any missing input block.
 */
function deriveScores(app: UWApplication): Partial<UWApplication> {
  const seed = defaultScoreInputs({
    monthlyRevenue: app.monthlyRevenue || undefined,
    avgDailyBalance: app.avgDailyBalance || undefined,
    fico: app.creditScore || undefined,
    existingPositions: app.existingPositions || undefined,
  });
  const inputs = {
    plaid: app.plaidInputs ?? seed.plaid,
    crs: app.crsInputs ?? seed.crs,
    dataMerch: app.dataMerchInputs ?? seed.dataMerch,
  };
  const result = evaluateApplication(inputs);

  // Stress test against the requested amount at the tier's mid factor / 252-day term.
  const factor =
    result.terms.factorMin > 0
      ? (result.terms.factorMin + result.terms.factorMax) / 2
      : 1.4;
  const termDays = 252;
  const avgDailyRevenue = (inputs.plaid.monthlyRevenue || 0) / 21;
  const st =
    app.requestedAmount > 0
      ? stressTest({
          advanceAmount: app.requestedAmount,
          factorRate: factor,
          termDays,
          avgDailyRevenue,
          avgDailyBalance: inputs.plaid.avgDailyBalance,
          tier: result.terms.tier,
        })
      : null;

  return {
    plaidInputs: inputs.plaid,
    crsInputs: inputs.crs,
    dataMerchInputs: inputs.dataMerch,
    plaidScore: result.plaidScore.total,
    crsScore: result.crsScore.total,
    dataMerchScore: result.dataMerchScore.total,
    compositeScore: result.composite,
    riskScore: result.composite,
    tier: tierLabel(result.terms.tier),
    disqualifiers: result.disqualifiers.map(d => d.reason),
    stressTest: st ? { passes: st.passes, notes: st.flags } : undefined,
  };
}

export const underwritingActions = {
  create(partial: Partial<UWApplication>): UWApplication {
    const used = new Set(state.underwriting.map(a => a.id));
    let n = state.underwriting.length + 1;
    let id = `app-${String(n).padStart(3, '0')}`;
    while (used.has(id)) id = `app-${String(++n).padStart(3, '0')}`;
    const appId = `UW-2026-${String(200 + n).padStart(4, '0')}`;
    const base: UWApplication = {
      id,
      applicationId: appId,
      businessName: partial.businessName || 'New Applicant',
      industry: partial.industry || 'General',
      state: partial.state || '',
      productType: (partial.productType as ProductType) || 'MCA',
      requestedAmount: partial.requestedAmount ?? 50000,
      monthlyRevenue: partial.monthlyRevenue ?? 30000,
      avgDailyBalance: partial.avgDailyBalance ?? 5000,
      monthsInBusiness: partial.monthsInBusiness ?? 0,
      creditScore: partial.creditScore ?? 650,
      existingPositions: partial.existingPositions ?? 0,
      submissionDate: new Date().toISOString().slice(0, 10),
      reviewer: partial.reviewer || '',
      reviewerInitials: '',
      riskScore: 0,
      stage: 'Intake',
      daysInStage: 0,
      slaThreshold: 2,
      source: partial.source || 'Manual',
      assignedTo: partial.assignedTo || partial.reviewer || undefined,
    };
    const app: UWApplication = { ...base, ...deriveScores(base) };
    const prev = state.underwriting;
    persist(
      'underwriting app',
      () => set({ underwriting: [app, ...state.underwriting] }),
      () => set({ underwriting: prev }),
      () => supabase!.from('underwriting_apps').insert(toDbUw(app)).then(r => ({ error: r.error })),
    );
    return app;
  },

  update(id: string, patch: Partial<UWApplication>) {
    const prev = state.underwriting;
    persist(
      'underwriting app',
      () =>
        set({
          underwriting: state.underwriting.map(a => (a.id === id ? { ...a, ...patch } : a)),
        }),
      () => set({ underwriting: prev }),
      () => supabase!.from('underwriting_apps').update(toDbUw(patch)).eq('id', id).then(r => ({ error: r.error })),
    );
  },

  /**
   * Merge new rubric inputs, recompute all scores via the pure engine, and
   * persist the inputs + derived scores/tier/disqualifiers/stress test together.
   */
  updateInputs(
    id: string,
    partial: { plaidInputs?: PlaidInputs; crsInputs?: CrsInputs; dataMerchInputs?: DataMerchInputs; requestedAmount?: number },
  ) {
    const current = state.underwriting.find(a => a.id === id);
    if (!current) return;
    const merged: UWApplication = {
      ...current,
      plaidInputs: partial.plaidInputs ?? current.plaidInputs,
      crsInputs: partial.crsInputs ?? current.crsInputs,
      dataMerchInputs: partial.dataMerchInputs ?? current.dataMerchInputs,
      requestedAmount: partial.requestedAmount ?? current.requestedAmount,
    };
    // Mirror key scalars so the kanban summary stays in sync with the inputs.
    if (merged.plaidInputs) {
      merged.monthlyRevenue = merged.plaidInputs.monthlyRevenue;
      merged.avgDailyBalance = merged.plaidInputs.avgDailyBalance;
    }
    if (merged.crsInputs) merged.creditScore = merged.crsInputs.fico;
    if (merged.dataMerchInputs) merged.existingPositions = merged.dataMerchInputs.currentOpenPositions;

    const scored = deriveScores(merged);
    underwritingActions.update(id, {
      plaidInputs: merged.plaidInputs,
      crsInputs: merged.crsInputs,
      dataMerchInputs: merged.dataMerchInputs,
      requestedAmount: merged.requestedAmount,
      monthlyRevenue: merged.monthlyRevenue,
      avgDailyBalance: merged.avgDailyBalance,
      creditScore: merged.creditScore,
      existingPositions: merged.existingPositions,
      ...scored,
    });
  },

  setStage(id: string, stage: UWStage) {
    underwritingActions.update(id, { stage, daysInStage: 0 });
  },

  /**
   * Atomic Approve → Capital handoff:
   *   1. mark app approved
   *   2. INSERT a new capital_deals row from the rubric snapshot
   *   3. link approved_deal_id back on the app + mark funded
   *   4. reload both stores so the new deal shows in Capital immediately
   * Returns the new Capital deal id, or null on failure.
   */
  async approve(id: string): Promise<string | null> {
    const app = state.underwriting.find(a => a.id === id);
    if (!app) return null;

    const scored = app.compositeScore != null ? app : { ...app, ...deriveScores(app) };
    const result = evaluateApplication({
      plaid: scored.plaidInputs ?? defaultScoreInputs().plaid,
      crs: scored.crsInputs ?? defaultScoreInputs().crs,
      dataMerch: scored.dataMerchInputs ?? defaultScoreInputs().dataMerch,
    });
    const terms = result.terms;
    const factor = terms.factorMin > 0 ? +((terms.factorMin + terms.factorMax) / 2).toFixed(4) : 1.4;
    const holdback = terms.holdbackMinPct > 0 ? Math.round((terms.holdbackMinPct + terms.holdbackMaxPct) / 2) : 12;
    const fundedAmt = app.requestedAmount || 0;
    const totalOwed = Math.round(fundedAmt * factor);
    const dealId = nextCapitalDealId();
    const today = new Date().toISOString().slice(0, 10);
    const notesSnapshot = [
      `Underwriting ${app.applicationId} (${scored.tier ?? tierLabel(terms.tier)})`,
      `Composite ${scored.compositeScore ?? result.composite}/100`,
      `Plaid ${scored.plaidScore ?? result.plaidScore.total} · CRS ${scored.crsScore ?? result.crsScore.total} · DataMerch ${scored.dataMerchScore ?? result.dataMerchScore.total}`,
    ].join(' | ');

    // 1. mark approved
    underwritingActions.update(id, { stage: 'Approved', tier: scored.tier ?? tierLabel(terms.tier) });

    // 2. insert capital deal (capitalActions handles its own Supabase write)
    capitalActions.create({
      id: dealId,
      merchant: app.businessName,
      type: 'Capital',
      channel: 'self',
      funded: today,
      fundedAmt,
      factor,
      totalOwed,
      collected: 0,
      holdback,
      status: 'active',
      notes: notesSnapshot,
    });

    // 3. link the deal back + mark funded
    const prev = state.underwriting;
    await persist(
      'underwriting app',
      () =>
        set({
          underwriting: state.underwriting.map(a =>
            a.id === id ? { ...a, approvedDealId: dealId, stage: 'Approved' } : a,
          ),
        }),
      () => set({ underwriting: prev }),
      () =>
        supabase!
          .from('underwriting_apps')
          .update({ approved_deal_id: dealId, stage: 'funded' })
          .eq('id', id)
          .then(r => ({ error: r.error })),
    );

    // 4. refresh capital store so the new deal renders immediately
    void capitalActions.refresh();
    return dealId;
  },

  decline(id: string, reason?: string) {
    underwritingActions.update(id, {
      stage: 'Declined',
      daysInStage: 0,
      declineReason: reason || undefined,
    });
  },
};

/**
 * Compute the next `DELT-YYYY-NNN` capital deal id from the live capital store,
 * falling back to a year-prefixed counter. Kept here (not capitalStore) because
 * the underwriting approve flow owns the DELT- naming convention.
 */
function nextCapitalDealId(): string {
  const year = new Date().getFullYear();
  const prefix = `DELT-${year}-`;
  const existing = capitalActions.allIds().filter(id => id.startsWith(prefix));
  let max = 0;
  for (const id of existing) {
    const n = parseInt(id.slice(prefix.length), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

// ── Referral actions ──
export const referralActions = {
  setStatus(id: string, status: Referral['status']) {
    const target = state.referrals.find(r => r.id === id);
    if (!target) return;
    const nextRewardStatus: Referral['rewardStatus'] =
      status === 'Converted'
        ? target.rewardStatus === 'N/A'
          ? 'Pending'
          : target.rewardStatus
        : target.rewardStatus;
    const prev = state.referrals;
    persist(
      'referral status',
      () =>
        set({
          referrals: state.referrals.map(r =>
            r.id === id ? { ...r, status, rewardStatus: nextRewardStatus } : r,
          ),
        }),
      () => set({ referrals: prev }),
      () =>
        supabase!
          .from('referrals')
          .update({ status, reward_status: nextRewardStatus })
          .eq('id', id)
          .then(r => ({ error: r.error })),
    );
  },

  payReward(id: string) {
    const prev = state.referrals;
    persist(
      'reward payout',
      () =>
        set({
          referrals: state.referrals.map(r => (r.id === id ? { ...r, rewardStatus: 'Paid' } : r)),
        }),
      () => set({ referrals: prev }),
      () => supabase!.from('referrals').update({ reward_status: 'Paid' }).eq('id', id).then(r => ({ error: r.error })),
    );
  },

  create(partial: Partial<Referral>) {
    const used = new Set(state.referrals.map(r => r.id));
    let n = state.referrals.length + 1;
    let id = `REF-${String(n).padStart(3, '0')}`;
    while (used.has(id)) id = `REF-${String(++n).padStart(3, '0')}`;
    const ref: Referral = {
      id,
      referringMerchant: partial.referringMerchant || 'Unknown',
      referredBusiness: partial.referredBusiness || 'Prospect',
      referralCode: partial.referralCode || `CODE-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending',
      rewardStatus: 'Pending',
      rewardAmount: `$${state.program.rewardAmount}`,
    };
    const prev = state.referrals;
    persist(
      'referral',
      () => set({ referrals: [ref, ...state.referrals] }),
      () => set({ referrals: prev }),
      () => supabase!.from('referrals').insert(toDbReferral(ref)).then(r => ({ error: r.error })),
    );
    return ref;
  },
};

// ── Program actions ──
export const programActions = {
  update(patch: Partial<ReferralProgram>) {
    // Coerce to strings (interface stores strings; callers sometimes pass Number()).
    const coerced: Partial<ReferralProgram> = {};
    if (patch.rewardAmount !== undefined) coerced.rewardAmount = String(patch.rewardAmount);
    if (patch.freeMonths !== undefined) coerced.freeMonths = String(patch.freeMonths);
    if (patch.planTier !== undefined) coerced.planTier = patch.planTier;

    const prev = state.program;
    persist(
      'referral program',
      () => set({ program: { ...state.program, ...coerced } }),
      () => set({ program: prev }),
      () =>
        supabase!
          .from('referral_program')
          .upsert({ id: 1, ...toDbProgram(coerced) })
          .then(r => ({ error: r.error })),
    );
  },
};

// ── Merchant actions ──
export const merchantActions = {
  create(partial: Partial<Merchant>): Merchant {
    const used = new Set(state.merchants.map(m => m.id));
    let n = state.merchants.length + 1;
    let id = `merchant-${String(n).padStart(3, '0')}`;
    while (used.has(id)) id = `merchant-${String(++n).padStart(3, '0')}`;
    const merchant: Merchant = {
      id,
      name: partial.name || 'New Merchant',
      industry: partial.industry || 'General',
      status: (partial.status as MerchantStatus) || 'Pending',
      monthlyVolume: partial.monthlyVolume ?? 0,
      mcaBalance: partial.mcaBalance ?? 0,
      capitalDeployed: partial.capitalDeployed ?? 0,
      healthScore: partial.healthScore ?? 75,
      agent: partial.agent || 'Unassigned',
      products: partial.products || { processing: true, capital: false, website: false, lens: false },
      plan: (partial.plan as PlanTier) || 'Free',
      monthlyFee: partial.monthlyFee ?? 0,
      contactName: partial.contactName,
      contactEmail: partial.contactEmail,
      contactPhone: partial.contactPhone,
      state: partial.state,
      ein: partial.ein,
      website: partial.website,
      notes: partial.notes,
    };
    const prev = state.merchants;
    persist(
      'merchant',
      () => set({ merchants: [merchant, ...state.merchants] }),
      () => set({ merchants: prev }),
      () => supabase!.from('merchants').insert(toDbMerchant(merchant)).then(r => ({ error: r.error })),
    );
    return merchant;
  },

  update(id: string, patch: Partial<Merchant>) {
    const prev = state.merchants;
    persist(
      'merchant',
      () => set({ merchants: state.merchants.map(m => (m.id === id ? { ...m, ...patch } : m)) }),
      () => set({ merchants: prev }),
      () => supabase!.from('merchants').update(toDbMerchant(patch)).eq('id', id).then(r => ({ error: r.error })),
    );
  },

  remove(id: string) {
    const prev = state.merchants;
    persist(
      'delete merchant',
      () => set({ merchants: state.merchants.filter(m => m.id !== id) }),
      () => set({ merchants: prev }),
      () => supabase!.from('merchants').delete().eq('id', id).then(r => ({ error: r.error })),
    );
  },
};

// ── Deal actions ──
export const dealActions = {
  create(partial: Partial<Deal>): Deal {
    const used = new Set(state.deals.map(d => d.id));
    let n = state.deals.length + 1;
    const next = () => `D-${String(2000 + n).padStart(4, '0')}`;
    while (used.has(next())) n++;
    const id = partial.id || next();
    const loan = partial.loanAmount ?? 0;
    const rate = partial.rate ?? 1.35;
    const repayment = partial.repaymentAmount ?? Math.round(loan * rate);
    const today = new Date();
    const due = new Date(today);
    due.setMonth(due.getMonth() + 9);
    const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
    const deal: Deal = {
      id,
      status: (partial.status as DealStatus) || 'Current',
      delinquencyLabel: partial.delinquencyLabel,
      type: (partial.type as DealType) || 'MCA',
      borrower: partial.borrower || 'New Borrower',
      loanAmount: loan,
      repaymentAmount: repayment,
      collected: partial.collected ?? 0,
      outstanding: partial.outstanding ?? repayment,
      rate,
      dailyPayment: partial.dailyPayment ?? Math.round(repayment / 150),
      fundedDate: partial.fundedDate || fmtDate(today),
      dueDate: partial.dueDate || fmtDate(due),
      agent: partial.agent || 'Unassigned',
      notes: partial.notes,
    };
    const prev = state.deals;
    persist(
      'deal',
      () => set({ deals: [deal, ...state.deals] }),
      () => set({ deals: prev }),
      () => supabase!.from('crm_deals').insert(toDbDeal(deal)).then(r => ({ error: r.error })),
    );
    return deal;
  },

  update(id: string, patch: Partial<Deal>) {
    const prev = state.deals;
    persist(
      'deal',
      () => set({ deals: state.deals.map(d => (d.id === id ? { ...d, ...patch } : d)) }),
      () => set({ deals: prev }),
      () => supabase!.from('crm_deals').update(toDbDeal(patch)).eq('id', id).then(r => ({ error: r.error })),
    );
  },

  remove(id: string) {
    const prev = state.deals;
    persist(
      'delete deal',
      () => set({ deals: state.deals.filter(d => d.id !== id) }),
      () => set({ deals: prev }),
      () => supabase!.from('crm_deals').delete().eq('id', id).then(r => ({ error: r.error })),
    );
  },
};
