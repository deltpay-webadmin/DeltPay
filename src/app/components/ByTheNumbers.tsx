/* ──────────────────────────────────────────────────────────────
   ByTheNumbers — Delt Capital "Why Delt beats the bank" pattern
   Paper background. Mono eyebrow. Navy H2. 2-column layout.
   Comparison table with mono numbered rows + trait pills.
   ────────────────────────────────────────────────────────────── */

interface Row {
  num: string;
  metric: string;
  legacy: string;
  delt: string;
  pill?: string;
}

const ROWS: Row[] = [
  { num: '01', metric: 'Time to first dollar',  legacy: '2–6 weeks',          delt: '24 hours',         pill: '20× FASTER' },
  { num: '02', metric: 'Effective factor',       legacy: '1.35–1.49×',        delt: '1.18×',            pill: '19% CHEAPER' },
  { num: '03', metric: 'Paperwork',              legacy: '3 mo statements + returns', delt: 'Plaid link', pill: 'ZERO FILES' },
  { num: '04', metric: 'Credit pull',            legacy: 'Hard pull',         delt: 'Soft inquiry',     pill: 'NO FICO HIT' },
  { num: '05', metric: 'Collateral',             legacy: 'PG + UCC',          delt: 'None',             pill: 'UNENCUMBERED' },
  { num: '06', metric: 'Prepayment penalty',     legacy: 'Full factor owed',  delt: 'None',             pill: 'EARLY PAYS SAVE' },
];

const HIGHLIGHTS: { label: string; value: string; sub: string; icon: string; color: string }[] = [
  { label: 'MEDIAN TIME TO FUNDS', value: '24h',  sub: 'vs 2–6 weeks at a bank',     icon: '↯', color: '#F5B400' },
  { label: 'AVG SAVINGS VS SBA',    value: '19%',  sub: 'on total cost of capital',  icon: '–', color: '#697386' },
  { label: 'PAPERWORK REQUIRED',    value: '0',    sub: 'Plaid replaces the file box', icon: '⌀', color: '#697386' },
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
              BANKS VS DELT
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
              Why Delt beats<br />the bank.
            </h2>
          </div>
          <div>
            <p
              className="text-[15px] leading-[1.6]"
              style={{ color: 'var(--dc-on-light-muted)', fontFamily: 'var(--dc-font-body)' }}
            >
              Every row is a median across the last 12 months of our book, measured
              against publicly-reported bank SBA 7(a) averages. Updated quarterly.
            </p>
          </div>
        </div>

        {/* Comparison table */}
        <div
          className="mt-12 rounded-[12px] overflow-hidden"
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
              gridTemplateColumns: '160px 1fr 1fr',
              borderBottom: '1px solid rgba(4, 30, 66, 0.08)',
            }}
          >
            <div
              className="px-5 py-5 text-[11px] tracking-[0.14em]"
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
                className="h-7 w-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(4, 30, 66, 0.06)' }}
              >
                <span style={{ fontSize: 12, color: 'var(--dc-on-light-subtle)' }}>⌂</span>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--dc-font-display)',
                    fontWeight: 600,
                    fontSize: 15,
                    color: 'var(--dc-on-light)',
                  }}
                >
                  Traditional bank
                </div>
                <div
                  className="text-[10px] tracking-[0.14em] mt-0.5"
                  style={{
                    fontFamily: 'var(--dc-font-mono)',
                    color: 'var(--dc-on-light-subtle)',
                    textTransform: 'uppercase',
                  }}
                >
                  SBA 7(A) MEDIAN
                </div>
              </div>
            </div>
            <div
              className="px-5 py-5 flex items-center gap-3"
              style={{
                borderLeft: '1px solid rgba(4, 30, 66, 0.06)',
                background: 'rgba(73, 69, 255, 0.04)',
              }}
            >
              <div
                className="h-7 w-7 rounded-md flex items-center justify-center"
                style={{ background: 'var(--dc-indigo)' }}
              >
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>+</span>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--dc-font-display)',
                    fontWeight: 600,
                    fontSize: 15,
                    color: 'var(--dc-on-light)',
                  }}
                >
                  Delt.
                </div>
                <div
                  className="text-[10px] tracking-[0.14em] mt-0.5"
                  style={{
                    fontFamily: 'var(--dc-font-mono)',
                    color: 'var(--dc-indigo)',
                    textTransform: 'uppercase',
                  }}
                >
                  LIVE BOOK · Q1 TRAILING
                </div>
              </div>
            </div>
          </div>

          {/* Body rows */}
          {ROWS.map((row, i) => (
            <div
              key={row.num}
              className="grid items-center"
              style={{
                gridTemplateColumns: '160px 1fr 1fr',
                borderBottom:
                  i === ROWS.length - 1 ? 'none' : '1px solid rgba(4, 30, 66, 0.06)',
              }}
            >
              <div className="px-5 py-5">
                <div
                  className="text-[10px] tracking-[0.14em] mb-1"
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
                    fontSize: 14,
                    color: 'var(--dc-on-light)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {row.metric}
                </div>
              </div>
              <div
                className="px-5 py-5 flex items-center gap-3"
                style={{ borderLeft: '1px solid rgba(4, 30, 66, 0.06)' }}
              >
                <span
                  className="h-5 w-5 rounded-full flex items-center justify-center text-[11px]"
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
                    fontSize: 14,
                    color: 'var(--dc-on-light-muted)',
                  }}
                >
                  {row.legacy}
                </span>
              </div>
              <div
                className="px-5 py-5 flex items-center justify-between gap-3"
                style={{ borderLeft: '1px solid rgba(4, 30, 66, 0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-5 w-5 rounded-full flex items-center justify-center text-[11px]"
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
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--dc-on-light)',
                    }}
                  >
                    {row.delt}
                  </span>
                </div>
                {row.pill && (
                  <span
                    className="px-2.5 py-1 rounded-md"
                    style={{
                      fontFamily: 'var(--dc-font-mono)',
                      fontSize: 10,
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
                  className="text-[10px] tracking-[0.14em] mb-2"
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
                    fontSize: 36,
                    letterSpacing: '-0.03em',
                    color: 'var(--dc-on-light)',
                    lineHeight: 1,
                  }}
                >
                  {h.value}
                </div>
                <div
                  className="mt-2 text-[12px]"
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
