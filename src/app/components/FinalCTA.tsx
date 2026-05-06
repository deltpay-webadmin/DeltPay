import { Link } from 'react-router';

/* ──────────────────────────────────────────────────────────────
   FinalCTA — Delt Capital "Ready when your business is." style
   Massive cream H2 on navy. Editorial mono eyebrow. Two CTAs.
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

      <div className="relative mx-auto w-full max-w-[1200px] px-6 lg:px-10 py-28 lg:py-36">
        {/* Eyebrow */}
        <div className="dc-eyebrow" style={{ color: '#A5B4FC' }}>
          THE OFFER STANDS
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
          Ready when your{' '}
          <span
            style={{
              fontFamily: 'var(--dc-font-serif-italic)',
              fontStyle: 'italic',
              fontWeight: 400,
              color: '#A5B4FC',
            }}
          >
            business
          </span>{' '}
          is.
        </h2>

        {/* Body */}
        <p
          className="mt-7 max-w-[560px] text-[16px] leading-[1.6]"
          style={{
            color: 'var(--dc-on-dark-muted)',
            fontFamily: 'var(--dc-font-body)',
          }}
        >
          One application. Soft-pull only. A median{' '}
          <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>1.18×</strong>{' '}
          factor and{' '}
          <strong style={{ color: 'var(--dc-on-dark)', fontWeight: 600 }}>24-hour</strong>{' '}
          time to funds. We answer in under an hour, every hour we're open.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex items-center gap-3 flex-wrap">
          <Link to="/apply" className="dc-btn-primary dc-lg">
            Get Funded
            <span aria-hidden style={{ marginLeft: 2 }}>→</span>
          </Link>
          <Link to="/calculator" className="dc-btn-secondary dc-on-dark dc-lg">
            Run the calculator
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
            $200M+ DEPLOYED · 2,850+ FUNDED · SOFT-PULL ONLY
          </span>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
