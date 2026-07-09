import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useAuth } from '@/app/lib/auth';
import type {
  ProfileRow,
  PaymentRow,
  InvoiceRow,
  LoanRow,
  LoanRepaymentRow,
  CapitalEligibilityRow,
} from '@/app/lib/database.types';

/* Typed data hooks for the authenticated portal. Every query runs through the
   shared `supabase` singleton and is auto-scoped to the signed-in user by RLS
   (`auth.uid() = user_id`) — no explicit user filter needed for correctness,
   though we add `.eq('user_id', ...)` where it also helps the planner. */

interface QueryState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

/** The current user's profile row (incl. product_access). */
export function useProfile(): QueryState<ProfileRow | null> & { refetch: () => void } {
  const { user } = useAuth();
  const [state, setState] = useState<QueryState<ProfileRow | null>>({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    if (!user) { setState({ data: null, loading: false, error: null }); return; }
    setState((s) => ({ ...s, loading: true }));
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    setState({ data: (data as ProfileRow) ?? null, loading: false, error: error?.message ?? null });
  }, [user]);

  useEffect(() => { load(); }, [load]);
  return { ...state, refetch: load };
}

export function usePayments(): QueryState<PaymentRow[]> {
  const { user } = useAuth();
  const [state, setState] = useState<QueryState<PaymentRow[]>>({ data: [], loading: true, error: null });

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) { setState({ data: [], loading: false, error: null }); return; }
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      if (!active) return;
      setState({ data: (data as PaymentRow[]) ?? [], loading: false, error: error?.message ?? null });
    })();
    return () => { active = false; };
  }, [user]);

  return state;
}

export function useInvoices(): QueryState<InvoiceRow[]> {
  const { user } = useAuth();
  const [state, setState] = useState<QueryState<InvoiceRow[]>>({ data: [], loading: true, error: null });

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) { setState({ data: [], loading: false, error: null }); return; }
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      if (!active) return;
      setState({ data: (data as InvoiceRow[]) ?? [], loading: false, error: error?.message ?? null });
    })();
    return () => { active = false; };
  }, [user]);

  return state;
}

/** The user's active loan (most recent), or null if none. */
export function useLoan(): QueryState<LoanRow | null> {
  const { user } = useAuth();
  const [state, setState] = useState<QueryState<LoanRow | null>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) { setState({ data: null, loading: false, error: null }); return; }
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!active) return;
      setState({ data: (data as LoanRow) ?? null, loading: false, error: error?.message ?? null });
    })();
    return () => { active = false; };
  }, [user]);

  return state;
}

export function useLoanRepayments(loanId?: string): QueryState<LoanRepaymentRow[]> {
  const { user } = useAuth();
  const [state, setState] = useState<QueryState<LoanRepaymentRow[]>>({ data: [], loading: true, error: null });

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) { setState({ data: [], loading: false, error: null }); return; }
      let query = supabase
        .from('loan_repayments')
        .select('*')
        .order('repaid_on', { ascending: false });
      if (loanId) query = query.eq('loan_id', loanId);
      const { data, error } = await query;
      if (!active) return;
      setState({ data: (data as LoanRepaymentRow[]) ?? [], loading: false, error: error?.message ?? null });
    })();
    return () => { active = false; };
  }, [user, loanId]);

  return state;
}

export function useCapitalEligibility(): QueryState<CapitalEligibilityRow | null> {
  const { user } = useAuth();
  const [state, setState] = useState<QueryState<CapitalEligibilityRow | null>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) { setState({ data: null, loading: false, error: null }); return; }
      const { data, error } = await supabase
        .from('capital_eligibility')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!active) return;
      setState({ data: (data as CapitalEligibilityRow) ?? null, loading: false, error: error?.message ?? null });
    })();
    return () => { active = false; };
  }, [user]);

  return state;
}

/** Submit a capital application (real insert; user_id defaults to auth.uid()). */
export async function submitCapitalApplication(input: {
  requested_amount_cents: number;
  purpose?: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('capital_applications').insert({
    requested_amount_cents: input.requested_amount_cents,
    purpose: input.purpose,
  });
  return { error: error?.message ?? null };
}
