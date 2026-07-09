/* Row shapes for the customer-portal tables, mirroring the SQL in
   supabase/migrations/. Hand-authored because this session cannot reach the
   live project to run `generate_typescript_types`; once Supabase access is
   available, regenerate and replace this file for a fully-synced definition. */

export interface ProfileRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  business_type: string | null;
  industry: string | null;
  website: string | null;
  phone: string | null;
  monthly_volume: string | null;
  product_access: string[];
  created_at: string;
  updated_at: string;
}

export interface PaymentRow {
  id: string;
  user_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  method: string | null;
  customer_name: string | null;
  customer_email: string | null;
  description: string | null;
  created_at: string;
}

export interface InvoiceRow {
  id: string;
  user_id: string;
  number: string | null;
  client_name: string | null;
  amount_cents: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | string;
  due_date: string | null;
  created_at: string;
}

export interface LoanRow {
  id: string;
  user_id: string;
  original_amount_cents: number;
  balance_cents: number;
  daily_repayment_cents: number;
  factor_rate: number | null;
  status: 'active' | 'paid' | 'pending' | string;
  issued_at: string | null;
  estimated_payoff: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanRepaymentRow {
  id: string;
  loan_id: string;
  user_id: string;
  amount_cents: number;
  method: string | null;
  status: string;
  repaid_on: string;
  created_at: string;
}

export interface CapitalEligibilityRow {
  id: string;
  user_id: string;
  readiness_score: number | null;
  max_available_cents: number | null;
  eligible_after: string | null;
  updated_at: string;
}

/** A capital application insert payload. */
export interface CapitalApplicationInsert {
  requested_amount_cents: number;
  purpose?: string;
}
