import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router';
import { ArrowLeft, ArrowRight, Download, BookOpen, CheckCircle2 } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   RESOURCE PAGE
   --------------------------------------------------------------
   Backs the three cards in CapitalPage's "More for your business"
   panel. One shared layout, three pieces of content sourced from
   a slug-keyed config below. Tuned to the Delt Capital editorial
   spec (cream surface, navy display type, indigo accent) so it
   threads cleanly with the rest of the marketing pages.
   ───────────────────────────────────────────────────────────── */

const NAVY     = '#041E42';
const PURPLE   = '#4945FF';
const CREAM    = '#F7F5F0';
const PAPER    = '#FFFFFF';
const HAIRLINE = '#E2E8F0';
const MUTED    = '#475569';
const FAINT    = '#94A3B8';

interface Section {
  heading: string;
  body: string;
  bullets?: string[];
}

interface ResourceContent {
  slug: 'expansion-checklist' | 'sb-revenue-2026' | 'loans-101';
  kind: 'Template' | 'Research' | 'Guide';
  cta: 'Download' | 'Read';
  title: string;
  dek: string;
  readTime: string;
  publishedLabel: string;
  intro: string;
  highlights: string[];
  sections: Section[];
  closing?: string;
}

const RESOURCES: Record<ResourceContent['slug'], ResourceContent> = {
  'expansion-checklist': {
    slug: 'expansion-checklist',
    kind: 'Template',
    cta: 'Download',
    title: 'The small-business expansion checklist',
    dek: 'A field-tested 24-point readiness audit for opening location two — the financial, operational, and people moves that actually matter before you sign a second lease.',
    readTime: '8 min read',
    publishedLabel: 'Updated 2026',
    intro:
      'Most second locations don\'t fail because the idea was wrong. They fail because the operator scaled before the original was actually self-sustaining. This checklist walks you through the four readiness gates we see separate the merchants who multiply from the ones who multiply problems.',
    highlights: [
      'A 90-day cash runway test that goes deeper than "do I have enough?"',
      'The two staffing roles that have to exist before you sign a lease',
      'A POS / payments / payroll stack audit you can run in an afternoon',
      'Lease red flags that cost more to negotiate out than to walk away from',
    ],
    sections: [
      {
        heading: 'Gate 1 · Financial readiness',
        body:
          'Before a second location, the first one should fund itself, fund you, and still leave a reserve. We treat this as four hard tests, not a vibe.',
        bullets: [
          'Trailing 12-month operating margin ≥ 12% at location one',
          '90 days of fixed-cost reserves outside the operating account',
          'Owner draw consistent for the last 6 months — not a "best month" average',
          'Capital plan covers buildout + 6 months of rent + 90 days of payroll',
        ],
      },
      {
        heading: 'Gate 2 · Operational readiness',
        body:
          'A second location exposes every undocumented decision the first one runs on. If only you can open the store, train new vendors, or fix the POS, location two will starve location one of your time.',
        bullets: [
          'Opening + closing checklists exist on paper, not in your head',
          'Inventory reorder thresholds documented per SKU',
          'A non-owner manager has run a full week solo, twice',
          'Vendor list, contracts, and payment terms in one shared place',
        ],
      },
      {
        heading: 'Gate 3 · People readiness',
        body:
          'You need at least one person who can run a shift end-to-end without you, and a hiring pipeline you can lean on for the next two roles. Borrowed pipelines (one referral source, your spouse, "we\'ll find someone") count as zero.',
      },
      {
        heading: 'Gate 4 · Site + lease readiness',
        body:
          'Location quality compounds. A B-grade site at A-grade rent is a 5-year drag. Walk the trade area at three different times of day before signing anything, and price the lease against your best month, not your projection.',
        bullets: [
          'Trade area foot traffic counted in person, three time slots',
          'Comparable rents pulled from at least two brokers, not one',
          'Tenant improvement allowance covers ≥ 60% of buildout',
          'Personal guarantee capped or burns off after year three',
        ],
      },
    ],
    closing:
      'Working through this list takes a weekend. Skipping it costs years. When you\'re ready to fund the move, Delt Capital can pre-qualify you against your actual processing data — no projections, no decks.',
  },

  'sb-revenue-2026': {
    slug: 'sb-revenue-2026',
    kind: 'Research',
    cta: 'Read',
    title: 'How much do small businesses actually make? (2026 data)',
    dek: 'Median revenue, take-home, and margin benchmarks for U.S. small businesses in 2026 — segmented by category, location count, and years in operation.',
    readTime: '12 min read',
    publishedLabel: 'Published Q1 2026',
    intro:
      'Public benchmarks for small-business revenue are usually averages across millions of operators of every size, which makes them almost useless for the business in front of you. We pulled Delt\'s 2026 anonymized processing data — over 60,000 active merchants — and broke it down where the cuts actually matter: by category, by location count, and by years in operation.',
    highlights: [
      'Median revenue by category: F&B, retail, services, e-commerce',
      'Why "average" SMB revenue is misleading by 2-3x',
      'How margins shift between location 1 and location 2',
      'The five categories where take-home outpaces revenue growth',
    ],
    sections: [
      {
        heading: 'Median, not average',
        body:
          'Average revenue is dragged upward by the top 5% of operators in any category. We report median throughout — the merchant in the middle of the pack — because that\'s the operator most readers are benchmarking themselves against. Where the gap between mean and median is large, we flag it.',
      },
      {
        heading: 'Category benchmarks',
        body:
          'Single-location operators in the Delt dataset, trailing 12 months. Revenue is gross processed volume. Take-home is owner draw + retained earnings, self-reported in onboarding and validated against deposit history.',
        bullets: [
          'Food & beverage · median revenue $612K · median take-home $84K',
          'Specialty retail · median revenue $448K · median take-home $71K',
          'Personal services · median revenue $284K · median take-home $96K',
          'B2B services · median revenue $521K · median take-home $148K',
          'E-commerce (DTC) · median revenue $356K · median take-home $58K',
        ],
      },
      {
        heading: 'The location-two cliff',
        body:
          'Median take-home does NOT double when revenue does. Across our 2024–2026 cohort, operators who opened a second location saw revenue scale 1.78× while net take-home scaled 1.21× in year one. Margin recovery to single-location levels takes 14–22 months on average, longer in F&B.',
      },
      {
        heading: 'What predicts year-three survival',
        body:
          'Three signals in the first 18 months correlate with surviving past year three: positive operating margin within 9 months, ≥ 60% repeat-customer revenue by month 12, and at least one non-owner who can run a full shift solo. Operators who hit all three reach year three at 4.1× the rate of those who hit none.',
      },
    ],
    closing:
      'The full dataset, including segment-by-segment percentile bands, is available on request to operators on Delt Payments or Delt Capital. Reach out via the help center for a copy.',
  },

  'loans-101': {
    slug: 'loans-101',
    kind: 'Guide',
    cta: 'Read',
    title: 'Loans 101: everything about the application',
    dek: 'A plain-English walkthrough of every step a small-business loan goes through — from the first document request to funded — and the levers that actually move terms.',
    readTime: '10 min read',
    publishedLabel: 'Updated 2026',
    intro:
      'Most loan content is written for the lender, not the borrower. This guide flips that. We cover what every step means, what underwriting is actually looking at, and where you have leverage on rate, term, and personal guarantee — including the parts traditional lenders won\'t volunteer.',
    highlights: [
      'What underwriters look at first (it\'s not your credit score)',
      'The four document categories every lender will ask for',
      'How to read a term sheet line-by-line',
      'Where rate and term are actually negotiable — and where they aren\'t',
    ],
    sections: [
      {
        heading: 'Step 1 · Pre-qualification',
        body:
          'A soft check that estimates whether you\'re likely to qualify before a hard pull hits your credit. With Delt Capital, this runs against your actual processing data — no decks, no projections, no narrative — and returns a likely range in minutes.',
      },
      {
        heading: 'Step 2 · Document request',
        body:
          'Lenders ask for the same four buckets. Have them ready and you cut a week off the process.',
        bullets: [
          'Identity & ownership · Driver\'s license, EIN letter, ownership cap table',
          'Business financials · Last 24 months bank statements, P&L, balance sheet',
          'Tax · Last 2 years business + personal returns',
          'Operations · Lease, key vendor contracts, certificate of insurance',
        ],
      },
      {
        heading: 'Step 3 · Underwriting',
        body:
          'Underwriters care about three numbers more than anything else: debt service coverage ratio (DSCR), cash flow stability over trailing 12 months, and personal credit. Strong on two of three is usually enough; weak on cash flow stability is the hardest to overcome.',
      },
      {
        heading: 'Step 4 · Term sheet',
        body:
          'A term sheet has more negotiable items than borrowers realize. Rate is often the LEAST negotiable. The bigger levers are personal guarantee scope, prepayment penalties, covenants, and origination fees. Always read every line — and if a clause confuses you, it\'s probably the one you should push on.',
        bullets: [
          'Personal guarantee · scope (full vs. limited), burn-off after year 3',
          'Prepayment · penalty schedule, if any, and when it expires',
          'Covenants · DSCR / leverage ratios you must maintain',
          'Origination · fees folded into rate vs. paid up front',
        ],
      },
      {
        heading: 'Step 5 · Funding',
        body:
          'Once signed, funding usually hits within 1–5 business days. With Delt Capital it\'s next-day for pre-qualified merchants, with daily auto-repayment as a percentage of card volume so you never wake up to a payment shock.',
      },
    ],
    closing:
      'When you\'re ready to apply, Delt Capital underwrites against your real Delt Payments history — no business plan needed. Pre-qualify in two minutes and see your actual offer before you commit.',
  },
};

const KIND_ICON: Record<ResourceContent['kind'], typeof Download> = {
  Template: Download,
  Research: BookOpen,
  Guide: BookOpen,
};

export function ResourcePage() {
  const { slug } = useParams<{ slug: string }>();
  const content = slug ? RESOURCES[slug as ResourceContent['slug']] : undefined;

  // Top-of-page on every navigation — these articles are entered from
  // a card click, so the user expects to land at the title.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  if (!content) {
    return <Navigate to="/capital" replace />;
  }

  const KindIcon = KIND_ICON[content.kind];

  return (
    <div style={{ background: PAPER, color: NAVY, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* ═══ HERO ════════════════════════════════════════════════ */}
      <section
        className="px-6 pt-32 pb-16 md:pt-40 md:pb-20"
        style={{ background: CREAM }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <Link
            to="/capital"
            className="inline-flex items-center gap-1.5 mb-10 text-sm font-semibold transition-colors"
            style={{ color: PURPLE }}
          >
            <ArrowLeft size={15} />
            Back to Capital
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: PAPER, border: `1px solid ${HAIRLINE}` }}
            >
              <KindIcon size={18} color={PURPLE} />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold uppercase"
                style={{ color: PURPLE, letterSpacing: '0.18em' }}
              >
                {content.kind}
              </span>
              <span style={{ color: FAINT }}>·</span>
              <span className="text-[12px]" style={{ color: MUTED }}>
                {content.publishedLabel}
              </span>
              <span style={{ color: FAINT }}>·</span>
              <span className="text-[12px]" style={{ color: MUTED }}>
                {content.readTime}
              </span>
            </div>
          </div>

          <h1
            className="font-bold mb-6 leading-[1.05]"
            style={{
              fontSize: 'clamp(36px, 5.5vw, 64px)',
              letterSpacing: '-0.035em',
              color: NAVY,
            }}
          >
            {content.title}
          </h1>
          <p
            className="text-lg leading-relaxed max-w-[680px]"
            style={{ color: MUTED, fontSize: 'clamp(17px, 1.5vw, 20px)' }}
          >
            {content.dek}
          </p>
        </div>
      </section>

      {/* ═══ HIGHLIGHTS PANEL ═════════════════════════════════════ */}
      <section className="px-6 -mt-10 md:-mt-14 pb-12 relative z-10">
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div
            className="rounded-2xl p-7 md:p-9"
            style={{
              background: PAPER,
              border: `1px solid ${HAIRLINE}`,
              boxShadow: '0 20px 50px rgba(4,30,66,0.06)',
            }}
          >
            <div
              className="text-[11px] font-bold uppercase mb-4"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              What you&rsquo;ll get
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
              {content.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5">
                  <CheckCircle2 size={17} color={PURPLE} className="flex-shrink-0 mt-0.5" />
                  <span style={{ color: NAVY, fontSize: 14.5, lineHeight: 1.55 }}>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ BODY ════════════════════════════════════════════════ */}
      <section className="px-6 py-12 md:py-16">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p
            className="leading-relaxed mb-12"
            style={{ color: MUTED, fontSize: 18, lineHeight: 1.7 }}
          >
            {content.intro}
          </p>

          {content.sections.map((s) => (
            <div key={s.heading} className="mb-10">
              <h2
                className="font-bold mb-3 leading-tight"
                style={{
                  fontSize: 'clamp(20px, 2.2vw, 26px)',
                  letterSpacing: '-0.02em',
                  color: NAVY,
                }}
              >
                {s.heading}
              </h2>
              <p
                className="leading-relaxed"
                style={{ color: MUTED, fontSize: 17, lineHeight: 1.7 }}
              >
                {s.body}
              </p>
              {s.bullets && (
                <ul className="mt-5 space-y-2.5">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full"
                        style={{ background: PURPLE }}
                      />
                      <span style={{ color: NAVY, fontSize: 16, lineHeight: 1.65 }}>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {content.closing && (
            <div
              className="mt-12 p-7 rounded-2xl"
              style={{ background: CREAM, border: `1px solid ${HAIRLINE}` }}
            >
              <p style={{ color: NAVY, fontSize: 16, lineHeight: 1.65, margin: 0 }}>
                {content.closing}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ FOOTER CTA ══════════════════════════════════════════ */}
      <section
        className="px-6 py-16 md:py-20 text-center"
        style={{ background: PURPLE }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2
            className="font-bold mb-4 leading-[1.1]"
            style={{
              fontSize: 'clamp(28px, 3.8vw, 44px)',
              letterSpacing: '-0.025em',
              color: '#FFFFFF',
            }}
          >
            Ready to put this to work?
          </h2>
          <p
            className="mb-8 mx-auto leading-relaxed"
            style={{
              fontSize: 'clamp(15px, 1.2vw, 17px)',
              color: 'rgba(255,255,255,0.85)',
              maxWidth: 480,
            }}
          >
            Pre-qualify against your real processing data in two minutes. No business
            plan, no projections, no commitment.
          </p>
          <Link
            to="/get-a-quote"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold transition-all duration-200 hover:brightness-105"
            style={{
              background: '#FFFFFF',
              color: PURPLE,
              fontSize: 15,
              boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
            }}
          >
            See if you&rsquo;re pre-qualified
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default ResourcePage;
