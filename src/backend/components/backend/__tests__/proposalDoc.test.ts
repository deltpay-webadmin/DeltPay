import { describe, it, expect } from 'vitest';
import { buildProposalHtml } from '../proposalDoc';
import { quotePrograms } from '../pricingPrograms';
import type { ExtractedData } from '../pages/BackendAnalysis';

const extracted: ExtractedData = {
  merchantName: 'Sunrise Cafe',
  currentProcessor: 'Worldpay',
  statementPeriod: 'June 2026',
  totalVolume: 50_000,
  totalTransactions: 1_100,
  avgTicket: 45.45,
  effectiveRatePct: 3.5,
  fees: [
    { label: 'Discount Rate', amount: 1_400 },
    { label: 'Monthly Fees', amount: 150 },
    { label: 'Non-Qualified Surcharge', amount: 200 },
  ],
  chargebackCount: 1,
  currentMonthlyCost: 1_750,
  downgradeLines: [{ label: 'Non-Qualified Surcharge', amount: 200 }],
  pinDebitPresent: false,
  confidence: 'high',
  notes: '',
};

const programs = quotePrograms({
  monthlyVolume: extracted.totalVolume,
  monthlyTransactions: extracted.totalTransactions,
  currentMonthlyCost: extracted.currentMonthlyCost,
  riskTier: 'medium',
  category: 'restaurant',
  avgTicket: extracted.avgTicket,
});

const pageCount = (html: string) => html.split('<div class="page').length - 1;

describe('buildProposalHtml', () => {
  const html = buildProposalHtml({ extracted, programs, focusKey: null, category: 'restaurant' });

  it('brands every page with the real Delt lockup, not text', () => {
    expect(html).not.toContain('>DELT<');
    const logos = html.split('viewBox="74 153 552 174"').length - 1;
    expect(logos).toBe(pageCount(html) - 1 + 1); // logo on cover + every page
    expect(html).toContain('fill="#4945FF"');
    expect(html).toContain('fonts.googleapis.com/css2?family=Inter');
    expect(html).toContain("font-family: 'Inter'");
  });

  it('renders the findings page for a statement with downgrade signals', () => {
    expect(html).toContain('What We Found in Your Statement');
    expect(html).toContain('Non-Qualified Surcharge'); // the merchant's own fee line as evidence
    expect(html).toContain('Debit cards are taking the expensive route');
  });

  it('never leaks rep-facing audit language', () => {
    for (const repTerm of ['recoverable', 'recover', 'switch pitch', 'Re-qualify', 'quantify before quoting']) {
      expect(html).not.toContain(repTerm);
    }
  });

  it('includes testimonials and FAQ before the acceptance page', () => {
    expect(html).toContain('Merchants Already on Delt');
    expect(html).toContain('Northside Auto');
    expect(html).toContain('Common Questions');
    expect(html.indexOf('Common Questions')).toBeLessThan(html.indexOf('Next Steps'));
  });

  it('omits the findings page for a clean statement', () => {
    const clean = buildProposalHtml({
      extracted: {
        ...extracted,
        fees: [{ label: 'Discount Rate', amount: 1_600 }, { label: 'Monthly Fees', amount: 150 }],
        downgradeLines: [],
        pinDebitPresent: true,
        effectiveRatePct: 2.4,
      },
      programs, focusKey: null, category: 'restaurant',
    });
    expect(clean).not.toContain('What We Found in Your Statement');
    expect(pageCount(clean)).toBe(pageCount(html) - 1);
  });

  it('skips the findings page entirely when no category is provided', () => {
    const noCat = buildProposalHtml({ extracted, programs, focusKey: null });
    expect(noCat).not.toContain('What We Found in Your Statement');
  });

  it('renders the new pages in Spanish', () => {
    const es = buildProposalHtml({ extracted, programs, focusKey: null, category: 'restaurant', lang: 'es' });
    expect(es).toContain('Qué Encontramos en Su Estado de Cuenta');
    expect(es).toContain('Preguntas Frecuentes');
    expect(es).toContain('Comercios que Ya Usan Delt');
  });
});
