import { useState } from 'react';
import { Sparkles, ArrowRight, ChevronDown, Check, Zap, Database, Wand2 } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   PALETTE — strictly #FFFFFF / #041E42 / #4945FF
   ───────────────────────────────────────────────────────────── */
const C = {
  white:   '#FFFFFF',
  navy:    '#041E42',
  purple:  '#4945FF',
  body:    '#475569',
  muted:   '#94A3B8',
  grayBg:  '#F6F7FB',
};

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

/* ─────────────────────────────────────────────────────────────
   SUGGESTION PILLS
   ───────────────────────────────────────────────────────────── */
const SUGGESTIONS = [
  'Which products made me the most last month?',
  'When should I run a promo?',
  'Why are tips down?',
];

/* ─────────────────────────────────────────────────────────────
   FAQ DATA
   ───────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'What is Lens AI?',
    a: 'Lens is an AI assistant built into Delt that answers questions about your business in plain English. No dashboards to learn, no reports to build.',
  },
  {
    q: 'Do I need to set anything up?',
    a: "No. If you're on Delt Payments or POS, Lens is already connected to your data.",
  },
  {
    q: 'What can I ask Lens?',
    a: 'Anything about your sales, customers, inventory, staffing, or payouts. "Why did margin drop last week?", "Which locations need more staff Friday?", "Show me my top 10 customers by profit".',
  },
  {
    q: 'Does Lens make mistakes?',
    a: 'Every answer cites the underlying data so you can verify it. If Lens isn\'t sure, it says so.',
  },
  {
    q: 'Who can see my data?',
    a: 'Only you and the people you invite. Your data is never used to train shared models. Full audit log included.',
  },
  {
    q: 'Can Lens take actions?',
    a: 'Yes, on Pro. Lens can pause discounts, reorder inventory, send messages to staff, and more — always with your approval.',
  },
  {
    q: 'Is my data secure?',
    a: 'Encryption at rest (AES-256), in transit (TLS 1.3), SOC 2 Type II controls. Standard for banking.',
  },
  {
    q: 'Can I turn Lens off?',
    a: 'Yes. Lens can be disabled per-user or account-wide at any time.',
  },
];

/* ─────────────────────────────────────────────────────────────
   FEATURE ROWS DATA
   ───────────────────────────────────────────────────────────── */
interface FeatureRow {
  counter: string;
  headline: string;
  body: string;
  cta: string;
  mockup: React.ReactNode;
  flip: boolean;
}

/* ─────────────────────────────────────────────────────────────
   MOCKUP COMPONENTS
   ───────────────────────────────────────────────────────────── */
function ChatMockup() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* User bubble */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          background: C.purple, color: C.white, borderRadius: '18px 18px 4px 18px',
          padding: '10px 16px', fontSize: 13, maxWidth: '75%', fontFamily: FONT, lineHeight: 1.5,
        }}>
          Why are my weekends slower?
        </div>
      </div>
      {/* Lens reply */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: C.purple,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Sparkles size={13} color={C.white} />
        </div>
        <div style={{
          background: 'rgba(73,69,255,0.07)', borderRadius: '4px 18px 18px 18px',
          padding: '12px 16px', fontSize: 13, fontFamily: FONT, lineHeight: 1.6,
          color: C.navy, flex: 1,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: C.navy }}>Weekend revenue is 31% below weekday average:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Foot traffic drops after 3 pm both days', 'Average ticket is $4 lower Sat–Sun', 'Weekend staff-to-sales ratio is 1.4× weekday'].map(b => (
              <div key={b} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.purple, marginTop: 6, flexShrink: 0 }} />
                <span style={{ color: C.body }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DataMockup() {
  const bars = [42, 58, 37, 71, 65, 80, 54, 68, 75, 82, 60, 48];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        background: 'rgba(73,69,255,0.06)', border: '1px solid rgba(73,69,255,0.15)',
        borderRadius: 14, padding: '14px 16px',
      }}>
        <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Source: Payments · Last 30 days · 1,284 transactions
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: FONT }}>$84,320</div>
        <div style={{ fontSize: 13, color: C.body, fontFamily: FONT, marginTop: 2 }}>Total revenue · ↑ 12% vs prior period</div>
      </div>
      {/* Sparkline */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 44 }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            flex: 1, height: `${h}%`, borderRadius: 3,
            background: i === bars.length - 1 ? C.purple : 'rgba(73,69,255,0.25)',
            transition: 'height 0.3s ease',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}>30 days ago</span>
        <span style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}>Today</span>
      </div>
    </div>
  );
}

function ActionMockup() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        background: C.grayBg, borderRadius: 14, padding: '14px 16px',
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: 'rgba(73,69,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Wand2 size={16} color={C.purple} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, fontFamily: FONT }}>Inventory low on oat milk</div>
          <div style={{ fontSize: 12, color: C.body, fontFamily: FONT, marginTop: 3 }}>3 units left · Avg weekly use: 14 units</div>
        </div>
      </div>
      {/* Confirm card */}
      <div style={{
        border: `1.5px solid rgba(73,69,255,0.3)`, borderRadius: 14,
        padding: '16px 18px', background: C.white,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, fontFamily: FONT, marginBottom: 12 }}>
          Reorder 12 cases of oat milk?
        </div>
        <div style={{ fontSize: 12, color: C.body, fontFamily: FONT, marginBottom: 14 }}>
          From Meadow Ridge Dairy · Est. $82.80 · Ships in 2 days
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            background: C.purple, color: C.white, border: 'none',
            borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: FONT,
          }}>Confirm →</button>
          <button style={{
            background: 'transparent', color: C.muted, border: `1px solid #E2E8F0`,
            borderRadius: 8, padding: '8px 14px', fontSize: 13,
            cursor: 'pointer', fontFamily: FONT,
          }}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}

function ModelMockup() {
  const models = [
    { label: 'Fast', icon: <Zap size={14} /> },
    { label: 'Deep', icon: <Database size={14} /> },
    { label: 'Vision', icon: <Sparkles size={14} /> },
    { label: 'Code', icon: <Wand2 size={14} /> },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 13, color: C.body, fontFamily: FONT, lineHeight: 1.5 }}>
        Lens routes your question to the best model automatically.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {models.map((m, i) => (
          <div key={m.label} style={{
            border: i === 0 ? `2px solid ${C.purple}` : '1.5px solid #E2E8F0',
            borderRadius: 12, padding: '14px 16px',
            background: i === 0 ? 'rgba(73,69,255,0.06)' : C.white,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ color: i === 0 ? C.purple : C.muted }}>{m.icon}</span>
            <span style={{
              fontSize: 13, fontWeight: i === 0 ? 700 : 500,
              color: i === 0 ? C.purple : C.navy, fontFamily: FONT,
            }}>{m.label}</span>
            {i === 0 && (
              <span style={{
                marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                color: C.white, background: C.purple, borderRadius: 4, padding: '2px 6px',
              }}>Active</span>
            )}
          </div>
        ))}
      </div>
      <div style={{
        background: C.grayBg, borderRadius: 10, padding: '10px 14px',
        fontSize: 12, color: C.body, fontFamily: FONT,
      }}>
        Upgraded silently to a newer model last Tuesday. No action needed.
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FAQ ITEM
   ───────────────────────────────────────────────────────────── */
function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div style={{
      borderBottom: '1px solid #E2E8F0',
      overflow: 'hidden',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '20px 0', background: 'transparent',
          border: 'none', cursor: 'pointer', gap: 16, textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: C.navy, fontFamily: FONT, lineHeight: 1.4 }}>{q}</span>
        <span style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: '50%', border: `1.5px solid #CBD5E1`,
          transition: 'transform 0.25s ease, border-color 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          color: open ? C.purple : C.muted,
        }}>
          <ChevronDown size={15} />
        </span>
      </button>
      <div style={{
        maxHeight: open ? 200 : 0, overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <p style={{
          margin: 0, paddingBottom: 20, fontSize: 15, lineHeight: 1.7,
          color: C.body, fontFamily: FONT,
        }}>{a}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────── */
export function LensAIPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const featureRows: FeatureRow[] = [
    {
      counter: '01 / 04',
      headline: 'Ask at the speed of thought.',
      body: 'Tell Lens what you want to know and get a clear answer in seconds. It reads your transactions, inventory, and staff schedule so you don\'t have to.',
      cta: 'Ask Lens a question',
      mockup: <ChatMockup />,
      flip: false,
    },
    {
      counter: '02 / 04',
      headline: 'Grounded in your actual numbers.',
      body: 'Lens grounds every answer in your actual data — wired directly to your POS, payments, and bank feed — so you can always verify the source it pulled from.',
      cta: 'See how data grounding works',
      mockup: <DataMockup />,
      flip: true,
    },
    {
      counter: '03 / 04',
      headline: 'Actions, not just answers.',
      body: 'Ask Lens to pause a discount, reorder inventory, or message your staff — and it does it. Approve with one tap.',
      cta: 'Explore autonomous actions',
      mockup: <ActionMockup />,
      flip: false,
    },
    {
      counter: '04 / 04',
      headline: 'One assistant. Every model.',
      body: 'Lens uses the best model for the job — and upgrades silently when new ones ship. You get smarter outputs without picking a model.',
      cta: 'Get started with Lens',
      mockup: <ModelMockup />,
      flip: true,
    },
  ];

  return (
    <div style={{ fontFamily: FONT, color: C.navy, overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(73,69,255,0.12) 0%, #FFFFFF 65%)`,
        paddingTop: 'clamp(80px, 10vw, 140px)',
        paddingBottom: 'clamp(80px, 10vw, 140px)',
        textAlign: 'center',
      }}>
        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 14px', borderRadius: 999,
            border: '1.5px solid rgba(73,69,255,0.25)',
            background: 'rgba(73,69,255,0.06)',
            fontSize: 13, fontWeight: 600, color: C.purple,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: C.purple,
              animation: 'lensAIPulse 2s ease infinite',
            }} />
            Say hello to Lens AI
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          margin: '0 auto', maxWidth: 760,
          fontSize: 'clamp(2.4rem, 6vw, 4.25rem)',
          lineHeight: 1.08, letterSpacing: '-0.04em',
          fontWeight: 800, color: C.navy,
          padding: '0 20px',
        }}>
          Turn your sales data into{' '}
          <span style={{ color: C.purple }}>answers.</span>
        </h1>

        {/* Subhead */}
        <p style={{
          margin: '20px auto 0', maxWidth: 600,
          fontSize: 'clamp(16px, 2.2vw, 19px)', lineHeight: 1.7,
          color: C.body, padding: '0 20px',
        }}>
          Lens AI lets you ask plain-English questions about your business and get real answers in seconds. No dashboards to learn. No reports to build.
        </p>

        {/* Prompt input card */}
        <div style={{
          position: 'relative', maxWidth: 620, margin: '48px auto 0',
          padding: '0 20px',
        }}>
          {/* Purple glow blob behind card */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500, height: 200, borderRadius: '50%',
            background: 'rgba(73,69,255,0.30)',
            filter: 'blur(120px)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          <div style={{
            position: 'relative', zIndex: 1,
            background: C.white, borderRadius: 24,
            boxShadow: '0 8px 40px rgba(4,30,66,0.12), 0 1px 3px rgba(0,0,0,0.06)',
            padding: '12px 12px 12px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Sparkles size={18} color={C.purple} style={{ flexShrink: 0 }} />
            <input
              readOnly
              placeholder="Ask Lens: why was Tuesday slower than last week?"
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: 15, color: C.body, background: 'transparent',
                fontFamily: FONT,
              }}
            />
            <button style={{
              background: C.purple, color: C.white, border: 'none',
              borderRadius: 12, padding: '10px 20px', fontSize: 14,
              fontWeight: 600, cursor: 'pointer', flexShrink: 0,
              fontFamily: FONT, whiteSpace: 'nowrap',
            }}>
              Ask
            </button>
          </div>
        </div>

        {/* Label */}
        <p style={{ margin: '22px auto 10px', fontSize: 12, color: C.muted }}>
          Not sure where to start? Try one of these:
        </p>

        {/* Suggestion pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, padding: '0 20px' }}>
          {SUGGESTIONS.map(s => (
            <button key={s} style={{
              background: C.white, border: '1.5px solid #E2E8F0',
              borderRadius: 999, padding: '7px 14px',
              fontSize: 13, color: C.body, cursor: 'pointer',
              fontFamily: FONT, transition: 'border-color 0.2s, color 0.2s',
            }}>
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LIMITLESS SECTION — tight padding, acts as a bridge headline
      ══════════════════════════════════════════ */}
      <section style={{
        background: C.white, textAlign: 'center',
        padding: 'clamp(24px, 4vw, 48px) 20px',
      }}>
        <h2 style={{
          margin: 0,
          fontSize: 'clamp(2rem, 5vw, 3.75rem)',
          fontWeight: 800, letterSpacing: '-0.04em',
          color: C.navy, lineHeight: 1.1,
        }}>
          Consider yourself limitless.
        </h2>
      </section>

      {/* ══════════════════════════════════════════
          FEATURE ROWS
      ══════════════════════════════════════════ */}
      <section style={{ background: C.white }}>
        {featureRows.map((row) => (
          <div
            key={row.counter}
            style={{
              maxWidth: 1160,
              margin: '0 auto',
              padding: 'clamp(40px, 6vw, 80px) clamp(20px, 4vw, 56px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'clamp(32px, 5vw, 72px)',
              alignItems: 'center',
            }}
          >
            {/* Description — left on even rows (flip=true means description on right side order-wise) */}
            <div style={{ order: row.flip ? 2 : 1 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: C.muted, marginBottom: 16,
              }}>
                {row.counter}
              </div>
              <h3 style={{
                margin: '0 0 16px',
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 800, lineHeight: 1.15,
                letterSpacing: '-0.03em', color: C.navy,
              }}>
                {row.headline}
              </h3>
              <p style={{
                margin: '0 0 28px', fontSize: 16, lineHeight: 1.75, color: C.body,
              }}>
                {row.body}
              </p>
              <a href="#" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 15, fontWeight: 600, color: C.purple,
                textDecoration: 'none',
              }}>
                {row.cta} <ArrowRight size={15} />
              </a>
            </div>

            {/* Mockup card */}
            <div style={{ order: row.flip ? 1 : 2 }}>
              <div style={{
                background: `linear-gradient(135deg, rgba(73,69,255,0.07) 0%, #FFFFFF 60%)`,
                border: '1.5px solid rgba(73,69,255,0.12)',
                borderRadius: 24, padding: 'clamp(20px, 3vw, 32px)',
                boxShadow: '0 4px 32px rgba(4,30,66,0.06)',
              }}>
                {row.mockup}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ══════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════ */}
      <section style={{
        background: C.grayBg,
        padding: 'clamp(80px, 10vw, 120px) clamp(20px, 4vw, 56px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <h2 style={{
            margin: '0 0 16px',
            fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            fontWeight: 800, letterSpacing: '-0.03em', color: C.navy,
          }}>
            Pricing built for every business.
          </h2>
          <p style={{ margin: 0, fontSize: 17, color: C.body, lineHeight: 1.6 }}>
            Scale as you go with plans that match your operations.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          maxWidth: 860, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}>
          {/* Free */}
          <div style={{
            background: C.white, borderRadius: 24,
            border: '1.5px solid #E2E8F0',
            padding: 'clamp(28px, 4vw, 40px)',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 6 }}>Free</div>
            <div style={{ fontSize: 14, color: C.body, marginBottom: 28 }}>Included with every Delt account</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {['500 Lens questions/month', 'Plain-English answers', 'Connects to your POS + Payments', 'Email summaries'].map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'rgba(73,69,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Check size={11} color={C.purple} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: 14, color: C.body }}>{f}</span>
                </div>
              ))}
            </div>
            <button style={{
              width: '100%', padding: '13px 0',
              border: `1.5px solid ${C.purple}`, borderRadius: 12,
              background: 'transparent', color: C.purple,
              fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
            }}>
              Start using Lens
            </button>
          </div>

          {/* Pro */}
          <div style={{
            background: C.navy, borderRadius: 24,
            border: `1.5px solid rgba(73,69,255,0.3)`,
            padding: 'clamp(28px, 4vw, 40px)',
            position: 'relative',
          }}>
            {/* Most popular pill */}
            <div style={{
              position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
              background: C.purple, color: C.white, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '5px 14px', borderRadius: 999, whiteSpace: 'nowrap',
            }}>
              Most popular
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: C.white }}>Pro</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginLeft: 6 }}>$29/mo</span>
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>Everything in Free, plus:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {['Unlimited questions', 'Autonomous actions', 'Multi-location roll-up', 'Priority support'].map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'rgba(73,69,255,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Check size={11} color={C.white} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{f}</span>
                </div>
              ))}
            </div>
            <button style={{
              width: '100%', padding: '13px 0',
              border: 'none', borderRadius: 12,
              background: C.purple, color: C.white,
              fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
            }}>
              Upgrade to Pro
            </button>
          </div>
        </div>

        {/* Enterprise */}
        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: C.muted }}>
          Looking for enterprise?{' '}
          <a href="#" style={{ color: C.navy, fontWeight: 600, textDecoration: 'underline' }}>
            Schedule a call.
          </a>
        </p>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: C.muted, maxWidth: 600, margin: '16px auto 0', lineHeight: 1.6 }}>
          Lens AI answers are grounded in your connected data sources and are intended to assist decision-making, not replace it. Verify important business decisions independently. Question limits apply to Free tier and reset monthly.
        </p>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section style={{
        background: C.white,
        padding: 'clamp(80px, 10vw, 120px) clamp(20px, 4vw, 56px)',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{
            margin: '0 0 48px',
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            fontWeight: 800, letterSpacing: '-0.03em', color: C.navy,
          }}>
            Frequently asked questions
          </h2>
          <div style={{ borderTop: '1px solid #E2E8F0' }}>
            {FAQS.map((faq, i) => (
              <FaqItem
                key={i}
                q={faq.q}
                a={faq.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FOOTER
      ══════════════════════════════════════════ */}
      <section style={{
        background: C.purple,
        padding: 'clamp(80px, 10vw, 120px) clamp(20px, 4vw, 56px)',
        textAlign: 'center',
      }}>
        <h2 style={{
          margin: '0 0 16px',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800, letterSpacing: '-0.04em',
          color: C.white, lineHeight: 1.1,
        }}>
          Ready to stop guessing?
        </h2>
        <p style={{
          margin: '0 auto 40px', maxWidth: 480,
          fontSize: 18, lineHeight: 1.7,
          color: 'rgba(255,255,255,0.8)',
        }}>
          Lens is included in every Delt account. Start asking today — your first insights typically appear within a few days of your first transactions.
        </p>
        <a
          href="/sign-up"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: C.white, color: C.navy,
            textDecoration: 'none',
            border: 'none', borderRadius: 14,
            padding: '16px 36px', fontSize: 16,
            fontWeight: 700, cursor: 'pointer',
            fontFamily: FONT,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}
        >
          Create a free account
        </a>
        <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
          Need help with Lens?{' '}
          <a href="/help-center" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'underline' }}>
            Visit the Help Center
          </a>
        </p>
      </section>

      {/* Global keyframes */}
      <style>{`
        @keyframes lensAIPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.3); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}
