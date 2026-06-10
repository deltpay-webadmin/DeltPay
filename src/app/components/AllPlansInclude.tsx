import { DollarSign, ShieldCheck, FileX, CreditCard, Headphones, Banknote } from 'lucide-react';

const NAVY = '#041E42';
const PURPLE = '#4945FF';
const LAVENDER = '#EDEBFF';
const IVORY = '#F6F7FB';
const MUTED = '#475569';
const HAIRLINE = 'rgba(4,30,66,0.10)';

const fonts = {
  heading: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
};

const ITEMS = [
  {
    icon: <DollarSign size={20} color={PURPLE} />,
    title: '$0 card processing',
    desc: 'Delt Zero on every plan — no percentage per swipe, dip, or tap.',
  },
  {
    icon: <FileX size={20} color={PURPLE} />,
    title: 'No contracts, no setup fee',
    desc: 'Month-to-month. Upgrade, downgrade, or cancel at any time.',
  },
  {
    icon: <CreditCard size={20} color={PURPLE} />,
    title: 'Free card reader',
    desc: 'Included with every plan. Pairs with any phone or tablet.',
  },
  {
    icon: <ShieldCheck size={20} color={PURPLE} />,
    title: 'PCI-DSS compliant',
    desc: 'End-to-end encryption and tokenization handled for you.',
  },
  {
    icon: <Headphones size={20} color={PURPLE} />,
    title: 'Human support, 24/7',
    desc: 'Real people on chat and phone — not a ticket queue.',
  },
  {
    icon: <Banknote size={20} color={PURPLE} />,
    title: 'Delt Capital eligible',
    desc: 'Pre-approval available as soon as you start processing.',
  },
];

export function AllPlansInclude() {
  return (
    <section style={{ background: IVORY, padding: '72px 24px', borderTop: `1px solid ${HAIRLINE}`, borderBottom: `1px solid ${HAIRLINE}` }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PURPLE,
            marginBottom: 12,
            fontFamily: fonts.heading,
          }}>Every plan includes</div>
          <h2 style={{
            fontSize: 'clamp(28px, 3.2vw, 40px)',
            fontWeight: 800,
            color: NAVY,
            letterSpacing: '-0.025em',
            margin: 0,
            lineHeight: 1.15,
            fontFamily: fonts.heading,
          }}>The fundamentals — on the house.</h2>
          <p style={{
            fontSize: 16,
            color: MUTED,
            marginTop: 12,
            maxWidth: 620,
            marginLeft: 'auto',
            marginRight: 'auto',
            fontFamily: fonts.heading,
            lineHeight: 1.55,
          }}>Whether you start on Free or land on Personalized, these are never an upcharge.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {ITEMS.map((item) => (
            <div key={item.title} style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '22px 22px',
              border: `1px solid ${HAIRLINE}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: LAVENDER,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>{item.icon}</div>
              <div style={{
                fontSize: 15,
                fontWeight: 800,
                color: NAVY,
                letterSpacing: '-0.01em',
                fontFamily: fonts.heading,
              }}>{item.title}</div>
              <div style={{
                fontSize: 13.5,
                color: MUTED,
                lineHeight: 1.5,
                fontFamily: fonts.heading,
              }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
