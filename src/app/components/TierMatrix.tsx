import { Check, Minus } from 'lucide-react';

const NAVY = '#041E42';
const PURPLE = '#4945FF';
const LAVENDER = '#EDEBFF';
const IVORY = '#F6F7FB';
const MUTED = '#475569';
const MICRO = '#94A3B8';
const HAIRLINE = 'rgba(4,30,66,0.10)';

const fonts = {
  heading: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
};

type CellValue = boolean | string;
type Row = { feature: string; free: CellValue; growth: CellValue; personalized: CellValue };
type Group = { label: string; rows: Row[] };

const GROUPS: Group[] = [
  {
    label: 'Payments',
    rows: [
      { feature: '$0 processing rate (Delt Zero)', free: true, growth: true, personalized: true },
      { feature: 'In-person, online, and keyed payments', free: true, growth: true, personalized: true },
      { feature: 'Custom interchange-plus rates', free: false, growth: false, personalized: true },
      { feature: 'Next-day funding', free: true, growth: true, personalized: 'Same-day available' },
      { feature: 'Multi-location routing', free: false, growth: true, personalized: true },
    ],
  },
  {
    label: 'Hardware',
    rows: [
      { feature: 'Free Delt card reader', free: true, growth: true, personalized: true },
      { feature: 'Countertop terminal discount', free: false, growth: true, personalized: 'Bundled' },
      { feature: 'Kitchen / receipt printers', free: 'Add-on', growth: 'Add-on', personalized: 'Bundled' },
      { feature: 'Full POS hardware suite', free: false, growth: false, personalized: true },
    ],
  },
  {
    label: 'Software & Storefront',
    rows: [
      { feature: 'Delt dashboard', free: true, growth: true, personalized: true },
      { feature: 'Website + online store', free: false, growth: true, personalized: true },
      { feature: 'Lens AI analytics', free: false, growth: true, personalized: 'Full suite' },
      { feature: 'Forecasting & anomaly alerts', free: false, growth: false, personalized: true },
      { feature: 'Inventory management', free: false, growth: false, personalized: true },
      { feature: 'Loyalty, SMS & gift cards', free: 'Add-on', growth: 'Add-on', personalized: true },
      { feature: 'Payroll & scheduling', free: 'Add-on', growth: 'Add-on', personalized: true },
    ],
  },
  {
    label: 'Capital',
    rows: [
      { feature: 'Delt Capital pre-approval', free: true, growth: true, personalized: true },
      { feature: 'Daily-flex repayment', free: true, growth: true, personalized: true },
      { feature: 'Best-tier capital rates', free: false, growth: true, personalized: true },
    ],
  },
  {
    label: 'Support & Security',
    rows: [
      { feature: 'PCI-DSS handled for you', free: true, growth: true, personalized: true },
      { feature: 'Chat + phone support', free: true, growth: true, personalized: true },
      { feature: 'Dedicated account manager', free: false, growth: false, personalized: true },
      { feature: 'Implementation & onboarding', free: 'Self-serve', growth: 'Guided', personalized: 'White-glove' },
    ],
  },
];

function Cell({ value, accent }: { value: CellValue; accent?: boolean }) {
  if (value === true) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: accent ? PURPLE : LAVENDER,
      }}>
        <Check size={15} color={accent ? '#FFFFFF' : PURPLE} strokeWidth={3} />
      </div>
    );
  }
  if (value === false) {
    return <Minus size={18} color={MICRO} />;
  }
  return (
    <span style={{
      fontSize: 12.5,
      fontWeight: 700,
      color: accent ? PURPLE : NAVY,
      letterSpacing: '-0.005em',
      fontFamily: fonts.heading,
    }}>{value}</span>
  );
}

export function TierMatrix() {
  return (
    <section style={{ background: '#FFFFFF', padding: '88px 24px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PURPLE,
            marginBottom: 12,
            fontFamily: fonts.heading,
          }}>Compare plans</div>
          <h2 style={{
            fontSize: 'clamp(28px, 3.2vw, 40px)',
            fontWeight: 800,
            color: NAVY,
            letterSpacing: '-0.025em',
            margin: 0,
            lineHeight: 1.15,
            fontFamily: fonts.heading,
          }}>Every feature, side by side.</h2>
          <p style={{
            fontSize: 16,
            color: MUTED,
            marginTop: 12,
            maxWidth: 620,
            marginLeft: 'auto',
            marginRight: 'auto',
            fontFamily: fonts.heading,
            lineHeight: 1.55,
          }}>The full picture — so you know exactly what's included before you pick.</p>
        </div>

        <div style={{
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 18,
          overflow: 'hidden',
          background: '#FFFFFF',
        }}>
          {/* Header row */}
          <div className="tier-matrix-row tier-matrix-head" style={{
            display: 'grid',
            gridTemplateColumns: '2.2fr 1fr 1fr 1fr',
            background: IVORY,
            borderBottom: `1px solid ${HAIRLINE}`,
            padding: '18px 24px',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: MUTED,
              fontFamily: fonts.heading,
            }}>Feature</div>
            <ColHead title="Free" sub="$0/mo" />
            <ColHead title="Growth" sub="$89/mo" accent />
            <ColHead title="Personalized" sub="Custom" />
          </div>

          {GROUPS.map((group, gi) => (
            <div key={group.label}>
              <div style={{
                padding: '14px 24px',
                background: '#FAFBFC',
                borderTop: gi === 0 ? 'none' : `1px solid ${HAIRLINE}`,
                borderBottom: `1px solid ${HAIRLINE}`,
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: NAVY,
                fontFamily: fonts.heading,
              }}>{group.label}</div>
              {group.rows.map((row, ri) => (
                <div key={row.feature} className="tier-matrix-row" style={{
                  display: 'grid',
                  gridTemplateColumns: '2.2fr 1fr 1fr 1fr',
                  padding: '16px 24px',
                  alignItems: 'center',
                  gap: 12,
                  borderTop: ri === 0 ? 'none' : `1px solid ${HAIRLINE}`,
                }}>
                  <div style={{
                    fontSize: 14,
                    color: NAVY,
                    fontWeight: 500,
                    fontFamily: fonts.heading,
                    lineHeight: 1.4,
                  }}>{row.feature}</div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}><Cell value={row.free} /></div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}><Cell value={row.growth} accent /></div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}><Cell value={row.personalized} /></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 760px) {
          .tier-matrix-row { grid-template-columns: 1.6fr 0.8fr 0.8fr 0.8fr !important; padding: 14px 14px !important; gap: 6px !important; }
          .tier-matrix-row > div:first-child { font-size: 12.5px !important; }
        }
      `}</style>
    </section>
  );
}

function ColHead({ title, sub, accent }: { title: string; sub: string; accent?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 15,
        fontWeight: 800,
        color: accent ? PURPLE : NAVY,
        letterSpacing: '-0.01em',
        fontFamily: fonts.heading,
      }}>{title}</div>
      <div style={{
        fontSize: 12,
        color: MUTED,
        marginTop: 2,
        fontFamily: fonts.heading,
        fontWeight: 600,
      }}>{sub}</div>
    </div>
  );
}
