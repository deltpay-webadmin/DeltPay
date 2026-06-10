/* ──────────────────────────────────────────────────────────────
   CustomerLogoStrip — the "Citi · Chime · Greendot · Rocket"
   moment from Plaid. Sits directly under the hero on the same
   dark canvas, signals scale before the page asks for anything.

   Wordmarks are rendered as set type (no PNG dependency) so the
   strip stays sharp at any resolution. Slight tonal variation
   per logo keeps the row from feeling like a list, while staying
   monochrome enough to read as a brand-trust band.
   ────────────────────────────────────────────────────────────── */

type LogoStyle = {
  font: 'display' | 'serif' | 'mono' | 'body';
  weight: number;
  letterSpacing: string;
  italic?: boolean;
  textTransform?: 'uppercase' | 'none';
};

type Logo = {
  name: string;
  style: LogoStyle;
};

// Same Main-Street merchants featured in the deeper carousel, surfaced
// in their most recognizable wordmark style. Keeping the row diverse
// across font / weight / case mimics the visual variety of real
// printed customer logos.
const LOGOS: Logo[] = [
  { name: 'Ironwood',          style: { font: 'serif',   weight: 600, letterSpacing: '-0.01em' } },
  { name: 'HALCYON',           style: { font: 'display', weight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' } },
  { name: 'Bluefin',           style: { font: 'display', weight: 700, letterSpacing: '-0.04em' } },
  { name: 'Maple Leaf',        style: { font: 'serif',   weight: 500, letterSpacing: '-0.005em', italic: true } },
  { name: 'GRANITE PEAK',      style: { font: 'mono',    weight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' } },
  { name: 'La Rosita',         style: { font: 'serif',   weight: 600, letterSpacing: '-0.01em', italic: true } },
  { name: 'Atlas',             style: { font: 'display', weight: 800, letterSpacing: '-0.03em' } },
  { name: 'Vesper',            style: { font: 'serif',   weight: 500, letterSpacing: '0.04em' } },
  { name: 'Pacific Strength',  style: { font: 'display', weight: 700, letterSpacing: '-0.025em', textTransform: 'uppercase' } },
  { name: 'Lone Star',         style: { font: 'serif',   weight: 600, letterSpacing: '-0.005em' } },
  { name: 'Saltwater',         style: { font: 'display', weight: 500, letterSpacing: '0.06em' } },
  { name: 'Brightline',        style: { font: 'display', weight: 700, letterSpacing: '-0.02em' } },
];

const FONT_MAP: Record<LogoStyle['font'], string> = {
  display: 'var(--dc-font-display)',
  serif:   'var(--dc-font-serif-italic)',
  mono:    'var(--dc-font-mono)',
  body:    'var(--dc-font-body)',
};

export function CustomerLogoStrip() {
  return (
    <section
      aria-label="Customers using Delt"
      style={{
        // Pure black band — exactly the Plaid treatment. Acts as the
        // "shelf" the hero rests on, gives the eye a hard reset before
        // the content section that follows.
        background: '#000',
        color: '#fff',
        padding: '40px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        {/* Tiny mono eyebrow — quiet trust signal. */}
        <div
          style={{
            fontFamily: 'var(--dc-font-mono)',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.42)',
            textAlign: 'center',
            marginBottom: 28,
          }}
        >
          — 10,000+ merchants run on Delt
        </div>

        {/* Logo row — wraps on smaller widths. Gap is tight enough to
            read as a single band on desktop. */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            columnGap: 44,
            rowGap: 24,
            opacity: 0.85,
          }}
        >
          {LOGOS.map((logo) => (
            <span
              key={logo.name}
              className="dc-logo-mark"
              style={{
                fontFamily: FONT_MAP[logo.style.font],
                fontStyle: logo.style.italic ? 'italic' : 'normal',
                fontWeight: logo.style.weight,
                letterSpacing: logo.style.letterSpacing,
                textTransform: logo.style.textTransform || 'none',
                fontSize: logo.style.font === 'mono' ? 14 : 22,
                color: 'rgba(255, 255, 255, 0.78)',
                whiteSpace: 'nowrap',
                transition: 'color 220ms ease, opacity 220ms ease',
                lineHeight: 1,
              }}
            >
              {logo.name}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .dc-logo-mark:hover {
          color: #fff !important;
        }
      `}</style>
    </section>
  );
}

export default CustomerLogoStrip;
