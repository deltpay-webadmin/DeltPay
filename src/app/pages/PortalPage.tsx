import { useMemo } from 'react';
import { SandboxPage, type PortalData } from '@/app/pages/SandboxPage';
import { PageLoader } from '@/app/components/PageLoader';
import {
  useProfile,
  usePayments,
  useInvoices,
  useLoan,
  useLoanRepayments,
  useCapitalEligibility,
  submitCapitalApplication,
} from '@/app/lib/portalData';

/* Authenticated customer portal. Reuses the SandboxPage shell in `portal` mode
   (no demo banner / CTA, product-gated nav) and feeds it the signed-in
   merchant's real data pulled through RLS-scoped queries. */

const monthDay = (iso: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const monthDayYear = (iso: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const dollars2 = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function PortalPage() {
  const { data: profile, loading: profileLoading } = useProfile();
  const { data: payments } = usePayments();
  const { data: invoices } = useInvoices();
  const { data: loan } = useLoan();
  const { data: repayments } = useLoanRepayments(loan?.id);
  const { data: eligibility } = useCapitalEligibility();

  const productAccess = profile?.product_access ?? [];

  const portalData = useMemo<PortalData>(() => {
    // ── Delt Pay aggregates ──
    const now = new Date();
    const thisMonth = payments.filter((p) => {
      const d = new Date(p.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const collectedCents = thisMonth
      .filter((p) => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount_cents, 0);
    const outstanding = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue');
    const outstandingCents = outstanding.reduce((sum, i) => sum + i.amount_cents, 0);

    const invoiceRows = invoices.map((i) => ({
      id: i.number || i.id.slice(0, 8),
      client: i.client_name || '—',
      amount: dollars2(i.amount_cents),
      due: monthDay(i.due_date),
      status: i.status,
    }));

    // ── Delt Capital ──
    const capital = {
      loan: loan
        ? {
            originalAmountCents: loan.original_amount_cents,
            balanceCents: loan.balance_cents,
            dailyRepaymentCents: loan.daily_repayment_cents,
            estimatedPayoff: monthDayYear(loan.estimated_payoff),
            issuedAt: monthDayYear(loan.issued_at),
            status: loan.status,
          }
        : null,
      repayments: repayments.map((r) => ({
        date: monthDay(r.repaid_on),
        amountCents: r.amount_cents,
        method: r.method || 'Auto-deducted from sales',
        status: r.status,
      })),
      eligibility: eligibility
        ? {
            readinessScore: eligibility.readiness_score,
            maxAvailableCents: eligibility.max_available_cents,
            eligibleAfter: eligibility.eligible_after,
          }
        : null,
      onApply: async (input: { requestedAmountCents: number; purpose: string }) =>
        submitCapitalApplication({
          requested_amount_cents: input.requestedAmountCents,
          purpose: input.purpose,
        }),
    };

    return {
      home: { availableCents: collectedCents },
      payments: {
        metrics: {
          collectedCents,
          paymentsCount: thisMonth.length,
          outstandingCents,
          unpaidCount: outstanding.length,
          recurringCents: 0,
          activePlans: 0,
        },
        invoices: invoiceRows,
      },
      capital,
    };
  }, [payments, invoices, loan, repayments, eligibility]);

  // Wait for the profile so product-gating is correct on first paint.
  if (profileLoading) return <PageLoader />;

  return <SandboxPage mode="portal" productAccess={productAccess} data={portalData} />;
}
