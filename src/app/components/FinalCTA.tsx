import { Link } from 'react-router';
import { FadeIn } from './motion';

/* ──────────────────────────────────────────────────────────────
   FinalCTA — Delt Pay (merchant services) closing CTA.
   Editorial navy surface. Mono eyebrow, massive H2 with italic
   accent, body copy, two CTAs (Get a quote / Run the savings
   calculator), mono stat row.

   Copy is payments-focused — NOT lending. The merchant→Capital
   cross-sell lives in <CapitalCrossSell /> higher up the page,
   so this final close stays on the core processing pitch.
   ────────────────────────────────────────────────────────────── */

export function FinalCTA() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: 'var(--dc-bg-navy)', color: 'var(--dc-on-dark)' }}
    >
      {/* Soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(800px 500px at 80% 50%, rgba(73,69,255,0.18), transparent 60%)',
        }}
      />

      {/* Single fade-up of the whole CTA block — no stagger (per spec). */}
      <FadeIn as="div" className="relative mx-auto w-full max-w-[1200px] px-6 lg:px-10 py-28 lg:py-36">
        {/* Eyebrow */}
        <div className="dc-eyebrow" style={{ color: '#A5B4FC' }}>
          — READY WHEN YOU ARE
        </div>

        {/* Massive H2 */}
        <h2
          className="mt-6 dc-h2"
          style={{
            color: 'var(--dc-on-dark)',
            fontSize: 'clamp(44px, 6.5vw, 73.6px)',
            lineHeight: 1.04,
            fontWeight: 600,
            letterSpacing: '-0.04em',
            maxWidth: 920,
          }}
        >
          Start taking{' '}
          <span
            style={{
              fontFamily: 'var(--dc-font-serif-italic)',
              fontStyle: 'italic',
              fontWeight: 400,
              color: '#A5B4FC',
            }}
          >
            payments
          </span>{' '}
          this week.
        </h2>

        {/* Body */}
        <p
          className="mt-7 max-w-[620px] text-[16px] leading-[1.6]"
          style={{
            color: 'var(--dc-on-dark-muted)',
            fontFamily: 'var(--dc-font-body)',
          }}
        >
          Transparent pricing.{' '}
          <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>Same-day deposits</strong>.{' '}
          Hardware that works on day one.{' '}
          <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>0% net processing fees</strong>{' '}
          with cash discount — no surprise markups, no statement fees.{' '}
          <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>Instant onboarding</strong>,
          and a real person on the phone every time you call.
        </p>

        {/* Disclaimer */}
        <p
          className="mt-3 max-w-[620px] text-[12px] leading-[1.55]"
          style={{
            color: 'var(--dc-on-dark-faint)',
            fontFamily: 'var(--dc-font-body)',
          }}
        >
          Instant onboarding and same-day deposits are subject to underwriting
          approval and are not available to all merchants. Eligibility depends
          on business type, processing history, risk profile, batch cut-off
          time, and bank availability; some accounts require standard review
          (typically 24–48 hours) and standard next-business-day funding.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex items-center gap-3 flex-wrap">
          <Link to="/get-a-quote" className="dc-btn-primary dc-lg">
            Get a quote
            <span aria-hidden style={{ marginLeft: 2 }}>→</span>
          </Link>
          <Link to="/calculator" className="dc-btn-secondary dc-on-dark dc-lg">
            Run the savings calculator
          </Link>
        </div>

        {/* Bottom hairline + mono row */}
        <div
          className="mt-16 pt-6 flex items-center justify-between gap-4 flex-wrap"
          style={{ borderTop: '1px solid var(--dc-rule-on-dark)' }}
        >
          <span
            className="text-[11px] tracking-[0.18em]"
            style={{
              fontFamily: 'var(--dc-font-mono)',
              color: 'var(--dc-on-dark-faint)',
              textTransform: 'uppercase',
            }}
          >
            FIG. 99 — END OF FILE
          </span>
          <span
            className="text-[11px] tracking-[0.18em]"
            style={{
              fontFamily: 'var(--dc-font-mono)',
              color: 'var(--dc-on-dark-muted)',
              textTransform: 'uppercase',
            }}
          >
            0% NET PROCESSING · SAME-DAY DEPOSITS · INSTANT ONBOARDING
          </span>
        </div>
      </FadeIn>
    </section>
  );
}

export default FinalCTA;
