/* ──────────────────────────────────────────────────────────────
   ByTheNumbers — "Why Delt beats your legacy processor" pattern
   Paper background. Mono eyebrow. Navy H2. 2-column layout.
   Comparison table with mono numbered rows + trait pills.
   ────────────────────────────────────────────────────────────── */

import deltLogoOnLight from '@/assets/delt-logo-on-light.svg';

interface Row {
  num: string;
  metric: string;
  legacy: string;
  delt: string;
  pill?: string;
}

const ROWS: Row[] = [
  { num: '01', metric: 'Processing cost',        legacy: '2.6% + $0.15 per transaction', delt: '0% with cash discount',           pill: 'MERCHANT PAYS NOTHING' },
  { num: '02', metric: 'Time to go live',        legacy: '3–10 business days',           delt: 'Under 1 day',                     pill: 'SAME-DAY ONBOARD' },
  { num: '03', metric: 'Settlement',             legacy: 'T+2 standard',                 delt: 'Next-day · same-day eligible',    pill: 'FASTER FUNDS' },
  { num: '04', metric: 'Hardware & POS',         legacy: 'Sold separately',              delt: 'Included',                        pill: 'NO LEASE' },
  { num: '05', metric: 'Chargeback support',     legacy: 'Self-serve portal only',       delt: 'Live dispute team',               pill: 'WE FIGHT FOR YOU' },
  { num: '06', metric: 'Capital access',         legacy: 'Requires third-party lender',  delt: 'Built-in · underwritten off deposits', pill: 'ONE LOGIN' },
  { num: '07', metric: 'Contract',               legacy: '36-month + early termination fee', delt: 'Month-to-month',              pill: 'NO LOCK-IN' },
  { num: '08', metric: 'Business intelligence',  legacy: 'Basic reports only',           delt: 'Lens AI · revenue + cash flow',   pill: 'ONLY AT DELT' },
  { num: '09', metric: 'Website',                legacy: 'Not included',                 delt: 'Custom site, built and managed',  pill: 'ONLY AT DELT' },
];

const HIGHLIGHTS: { label: string; value: string; sub: string; icon: string; color: string }[] = [
  { label: 'AVG MONTHLY SAVINGS',  value: '$847', sub: 'vs Stripe / Square baseline', icon: '↯', color: '#F5B400' },
  { label: 'TIME TO FIRST CHARGE', value: '<1 Day', sub: 'from sign-up to live POS',   icon: '–', color: '#697386' },
  { label: 'MERCHANT RETENTION',   value: '97%',  sub: 'twelve-month, all verticals',  icon: '✓', color: '#697386' },
];

export function ByTheNumbers() {
  return (
    <section
      className="relative w-full py-24 lg:py-28"
      style={{ background: 'var(--dc-bg-paper)', color: 'var(--dc-on-light)' }}
    >
      <div className="mx-auto w-full max-w-[1200px] px-6 lg:px-10">
        {/* Header — 2 col */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 items-end">
          <div>
            <div className="dc-eyebrow dc-on-light" style={{ color: 'var(--dc-indigo)' }}>
              LEGACY PROCESSOR VS DELT
            </div>
            <h2
              className="mt-4 dc-h2"
              style={{
                color: 'var(--dc-on-light)',
                fontSize: 'clamp(36px, 5vw, 56px)',
                lineHeight: 1.05,
                fontWeight: 600,
                letterSpacing: '-0.035em',
              }}
            >
              Why merchants leave<br />legacy processors.
            </h2>
          </div>
          <div>
            <p
              className="text-[15px] leading-[1.6]"
              style={{ color: 'var(--dc-on-light-muted)', fontFamily: 'var(--dc-font-body)' }}
            >
              Every row is a median across the last 12 months of our book, measured
              against the published rates and onboarding times of leading legacy
              processors. Updated quarterly.
            </p>
          </div>
        </div>

        {/* Comparison table — desktop only (replaced by stacked cards on mobile) */}
        <div className="hidden md:block mt-12 overflow-x-auto -mx-2 px-2">
        <div
          className="rounded-[12px] overflow-hidden min-w-[600px]"
          style={{
            background: 'var(--dc-bg-white)',
            border: '1px solid rgba(4, 30, 66, 0.08)',
            boxShadow: 'var(--dc-shadow-card)',
          }}
        >
          {/* Header row */}
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: '180px 1fr 1fr',
              borderBottom: '1px solid rgba(4, 30, 66, 0.08)',
            }}
          >
            <div
              className="px-5 py-5 text-[13px] tracking-[0.14em]"
              style={{
                fontFamily: 'var(--dc-font-mono)',
                color: 'var(--dc-on-light-subtle)',
                textTransform: 'uppercase',
              }}
            >
              — METRIC
            </div>
            <div
              className="px-5 py-5 flex items-center gap-3"
              style={{ borderLeft: '1px solid rgba(4, 30, 66, 0.06)' }}
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(4, 30, 66, 0.06)' }}
              >
                <span style={{ fontSize: 14, color: 'var(--dc-on-light-subtle)' }}>⌂</span>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--dc-font-display)',
                    fontWeight: 600,
                    fontSize: 17,
                    color: 'var(--dc-on-light)',
                  }}
                >
                  Flat-rate processor
                </div>
                <div
                  className="text-[12px] tracking-[0.14em] mt-1"
                  style={{
                    fontFamily: 'var(--dc-font-mono)',
                    color: 'var(--dc-on-light-subtle)',
                    textTransform: 'uppercase',
                  }}
                >
                  PUBLISHED RATE CARD
                </div>
              </div>
            </div>
            <div
              className="px-5 py-5 flex items-center"
              style={{
                borderLeft: '1px solid rgba(4, 30, 66, 0.06)',
              }}
            >
              <img
                src={deltLogoOnLight}
                alt="Delt"
                style={{ display: 'block', height: 22, width: 'auto' }}
              />
            </div>
          </div>

          {/* Body rows */}
          {ROWS.map((row, i) => (
            <div
              key={row.num}
              className="grid items-center"
              style={{
                gridTemplateColumns: '180px 1fr 1fr',
                borderBottom:
                  i === ROWS.length - 1 ? 'none' : '1px solid rgba(4, 30, 66, 0.06)',
              }}
            >
              <div className="px-5 py-6">
                <div
                  className="text-[12px] tracking-[0.14em] mb-1.5"
                  style={{
                    fontFamily: 'var(--dc-font-mono)',
                    color: 'var(--dc-on-light-subtle)',
                  }}
                >
                  {row.num}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--dc-font-display)',
                    fontWeight: 600,
                    fontSize: 17,
                    color: 'var(--dc-on-light)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {row.metric}
                </div>
              </div>
              <div
                className="px-5 py-6 flex items-center gap-3"
                style={{ borderLeft: '1px solid rgba(4, 30, 66, 0.06)' }}
              >
                <span
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[13px]"
                  style={{
                    background: 'rgba(4, 30, 66, 0.06)',
                    color: 'var(--dc-on-light-subtle)',
                  }}
                >
                  ×
                </span>
                <span
                  style={{
                    fontFamily: 'var(--dc-font-body)',
                    fontSize: 16,
                    color: 'var(--dc-on-light-muted)',
                  }}
                >
                  {row.legacy}
                </span>
              </div>
              <div
                className="px-5 py-6 flex items-center justify-between gap-3"
                style={{ borderLeft: '1px solid rgba(4, 30, 66, 0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-6 w-6 rounded-full flex items-center justify-center text-[13px]"
                    style={{
                      background: 'rgba(73, 69, 255, 0.12)',
                      color: 'var(--dc-indigo)',
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--dc-font-body)',
                      fontSize: 16,
                      fontWeight: 500,
                      color: 'var(--dc-on-light)',
                    }}
                  >
                    {row.delt}
                  </span>
                </div>
                {row.pill && (
                  <span
                    className="px-3 py-1.5 rounded-md"
                    style={{
                      fontFamily: 'var(--dc-font-mono)',
                      fontSize: 12,
                      letterSpacing: '0.14em',
                      background: 'rgba(73, 69, 255, 0.10)',
                      color: 'var(--dc-indigo-deep)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {row.pill}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Comparison — mobile stacked cards */}
        <div className="md:hidden mt-10 space-y-3">
          {ROWS.map((row) => (
            <div
              key={row.num}
              className="rounded-[14px] p-4"
              style={{
                background: 'var(--dc-bg-white)',
                border: '1px solid rgba(4, 30, 66, 0.10)',
                boxShadow: 'var(--dc-shadow-card)',
              }}
            >
              <div
                className="text-[11px] tracking-[0.14em] mb-2 uppercase"
                style={{
                  fontFamily: 'var(--dc-font-mono)',
                  color: 'var(--dc-on-light-subtle)',
                }}
              >
                {row.num} — {row.metric}
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span
                  className="text-sm line-through"
                  style={{
                    fontFamily: 'var(--dc-font-body)',
                    color: 'var(--dc-on-light-subtle)',
                  }}
                >
                  {row.legacy}
                </span>
                <span
                  className="text-base font-semibold text-right"
                  style={{
                    fontFamily: 'var(--dc-font-body)',
                    color: 'var(--dc-on-light)',
                  }}
                >
                  {row.delt}
                </span>
              </div>
              {row.pill && (
                <span
                  className="inline-block mt-3 px-2.5 py-1 rounded-full"
                  style={{
                    fontFamily: 'var(--dc-font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    background: 'rgba(73, 69, 255, 0.10)',
                    color: 'var(--dc-indigo-deep)',
                    textTransform: 'uppercase',
                  }}
                >
                  {row.pill}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Highlight stat cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.label}
              className="rounded-[12px] p-6 flex items-center justify-between"
              style={{
                background: 'var(--dc-bg-white)',
                border: '1px solid rgba(4, 30, 66, 0.08)',
                boxShadow: 'var(--dc-shadow-card)',
              }}
            >
              <div>
                <div
                  className="text-[12px] tracking-[0.14em] mb-2"
                  style={{
                    fontFamily: 'var(--dc-font-mono)',
                    color: 'var(--dc-on-light-subtle)',
                    textTransform: 'uppercase',
                  }}
                >
                  {h.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--dc-font-display)',
                    fontWeight: 600,
                    fontSize: 40,
                    letterSpacing: '-0.03em',
                    color: 'var(--dc-on-light)',
                    lineHeight: 1,
                  }}
                >
                  {h.value}
                </div>
                <div
                  className="mt-2 text-[14px]"
                  style={{
                    fontFamily: 'var(--dc-font-body)',
                    color: 'var(--dc-on-light-subtle)',
                  }}
                >
                  {h.sub}
                </div>
              </div>
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-[14px]"
                style={{
                  background: 'rgba(4, 30, 66, 0.05)',
                  color: h.color,
                  fontWeight: 600,
                }}
              >
                {h.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ByTheNumbers;
