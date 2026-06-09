/* ──────────────────────────────────────────────────────────────
   RiveraStatementProof
   Concrete proof block: one real-sounding merchant statement diff
   side-by-side with the savings story. The /STATEMENT/RIVERA_AUTO
   code panel is the Plaid-style API-keys cue applied to a payments
   statement — "here is the actual line item difference" rather
   than abstract marketing copy. Dark navy canvas matching the
   hero so the section reads as a continuation of the brand.
   ────────────────────────────────────────────────────────────── */

import { Link } from 'react-router';

const STATEMENT_LINES: Array<{
  key: string;
  value: string;
  good?: boolean;
  comment?: string;
  strike?: string;
}> = [
  { key: 'processing_volume', value: '$84,210.00' },
  { key: 'legacy_discount_rate', value: '2.94%', comment: 'old processor' },
  { key: 'delt_discount_rate', value: '0.00%', good: true, comment: 'delt zero, cash discount' },
  {
    key: 'junk_fees',
    value: '$0.00',
    good: true,
    strike: '$379.10',
    comment: 'pci, statement, batch, gateway',
  },
  { key: 'funding_speed', value: 'same_day', good: true },
  { key: 'monthly_savings', value: '$2,856.84', good: true },
];

export function RiveraStatementProof() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: 'var(--dc-bg-navy)',
        color: 'var(--dc-on-dark)',
      }}
    >
      {/* Subtle gradient wash — keeps the section visually distinct
          from the hero shader without reading as a separate brand. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 85% 10%, rgba(73,69,255,0.18) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(73,69,255,0.10) 0%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1320px] px-6 lg:px-10 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Copy column — left */}
          <div className="lg:col-span-5">
            <div
              className="text-[11px] tracking-[0.18em] uppercase mb-5"
              style={{
                fontFamily: 'var(--dc-font-mono)',
                color: 'var(--dc-on-dark-faint)',
              }}
            >
              — Proof, not promises
            </div>
            <h2
              style={{
                fontFamily: 'var(--dc-font-display)',
                fontSize: 'clamp(36px, 4.4vw, 60px)',
                lineHeight: 1.02,
                fontWeight: 600,
                letterSpacing: '-0.035em',
                color: 'var(--dc-on-dark)',
              }}
            >
              Want 0% net processing?<br />
              <span
                style={{
                  fontFamily: 'var(--dc-font-serif-italic)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#A5B4FC',
                }}
              >
                We&rsquo;ve got the rails.
              </span>
            </h2>
            <p
              className="mt-6 text-[17px] leading-[1.55] max-w-[460px]"
              style={{
                color: 'var(--dc-on-dark-muted)',
                fontFamily: 'var(--dc-font-body)',
              }}
            >
              You run the business. We&rsquo;ll handle the money. Here&rsquo;s a real
              merchant statement — line by line — before and after they moved
              to Delt.
            </p>

            <div className="mt-9 flex items-center gap-4 flex-wrap">
              <Link
                to="/get-a-quote"
                className="dc-btn-primary"
                style={{ fontSize: 15, fontWeight: 600, padding: '14px 24px', minHeight: 48 }}
              >
                Get a quote
                <span aria-hidden style={{ marginLeft: 2 }}>→</span>
              </Link>
              <Link
                to="/how-it-works"
                style={{
                  fontFamily: 'var(--dc-font-mono)',
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--dc-on-dark-muted)',
                  padding: '14px 4px',
                  borderBottom: '1px solid rgba(247,245,240,0.30)',
                }}
              >
                Read the docs →
              </Link>
            </div>

            <div
              className="mt-12 pt-6 grid grid-cols-3 gap-4 max-w-[420px]"
              style={{ borderTop: '1px solid var(--dc-rule-on-dark)' }}
            >
              <StatBig label="Saved / mo" big="$2,856" />
              <StatBig label="Funded" big="Same day" />
              <StatBig label="Switch time" big="48 hrs" />
            </div>
          </div>

          {/* Statement code panel — right */}
          <div className="lg:col-span-7">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(8,10,40,0.65)',
                border: '1px solid var(--dc-rule-on-dark-strong)',
                boxShadow:
                  '0 24px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.04)',
                backdropFilter: 'blur(14px)',
              }}
            >
              {/* Code panel header — looks like an API path */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{
                  borderBottom: '1px solid var(--dc-rule-on-dark)',
                  fontFamily: 'var(--dc-font-mono)',
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--dc-on-dark-muted)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex gap-1.5"
                    style={{ marginRight: 6 }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: 'rgba(247,245,240,0.18)' }} />
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: 'rgba(247,245,240,0.18)' }} />
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: 'rgba(247,245,240,0.18)' }} />
                  </span>
                  /statement/rivera_auto
                </div>
                <span style={{ color: 'var(--dc-on-dark-faint)', fontSize: 10 }}>
                  MAY 2026
                </span>
              </div>

              {/* Code lines */}
              <div className="px-6 py-7 space-y-3" style={{ fontFamily: 'var(--dc-font-mono)', fontSize: 14 }}>
                {STATEMENT_LINES.map((line, i) => (
                  <div
                    key={line.key}
                    className="flex items-baseline gap-4"
                    style={{ color: 'var(--dc-on-dark)' }}
                  >
                    <span
                      style={{
                        color: 'var(--dc-on-dark-faint)',
                        width: 18,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ color: '#A5B4FC' }}>{line.key}</span>
                      <span style={{ color: 'var(--dc-on-dark-muted)' }}>=</span>
                      {line.strike && (
                        <span
                          style={{
                            color: 'rgba(247,245,240,0.40)',
                            textDecoration: 'line-through',
                          }}
                        >
                          {line.strike}
                        </span>
                      )}
                      {line.strike && <span style={{ color: 'var(--dc-on-dark-muted)' }}>→</span>}
                      <span
                        style={{
                          color: line.good ? '#7DF9C3' : 'var(--dc-on-dark)',
                          fontWeight: line.good ? 600 : 400,
                        }}
                      >
                        {line.value}
                      </span>
                      {line.comment && (
                        <span style={{ color: 'rgba(247,245,240,0.40)', fontStyle: 'italic' }}>
                          # {line.comment}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
                <div className="flex items-baseline gap-4">
                  <span style={{ color: 'var(--dc-on-dark-faint)', width: 18, textAlign: 'right' }}>
                    {STATEMENT_LINES.length + 1}
                  </span>
                  <span style={{ color: '#A5B4FC' }}>
                    _<span style={{ opacity: 0.6 }} className="dc-cursor-blink">▍</span>
                  </span>
                </div>
              </div>

              {/* Footer caption inside panel */}
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{
                  borderTop: '1px solid var(--dc-rule-on-dark)',
                  fontFamily: 'var(--dc-font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--dc-on-dark-faint)',
                }}
              >
                <span>Rivera Auto Detail · Tampa, FL</span>
                <span style={{ color: '#7DF9C3' }}>↓ $2,856.84 / mo saved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBig({ label, big }: { label: string; big: string }) {
  return (
    <div>
      <div
        className="text-[10px] tracking-[0.14em] mb-2 uppercase"
        style={{ fontFamily: 'var(--dc-font-mono)', color: 'var(--dc-on-dark-faint)' }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--dc-font-display)',
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: '-0.025em',
          color: 'var(--dc-on-dark)',
          lineHeight: 1.05,
          whiteSpace: 'nowrap',
        }}
      >
        {big}
      </div>
    </div>
  );
}

export default RiveraStatementProof;
