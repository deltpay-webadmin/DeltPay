import { Sparkles, ArrowRight, Check, Zap, Database, Wand2 } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   LENS STACKING PANELS
   --------------------------------------------------------------
   Four sticky panels that stack as you scroll — a Delt-palette
   take on Base44's home-page "features" carousel.
   ───────────────────────────────────────────────────────────── */

const C = {
  white: '#FFFFFF',
  navy: '#041E42',
  purple: '#4945FF',
  body: '#475569',
  muted: '#94A3B8',
  grayBg: '#F6F7FB',
  line: '#E2E8F0',
};

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

/* ── Mockups ─────────────────────────────────────────────────── */

function ChatMockup() {
  return (
    <div style={{
      background: C.white, borderRadius: 20,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: '0 8px 32px rgba(4,30,66,0.08)',
      border: `1px solid ${C.line}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12, borderBottom: `1px solid ${C.line}` }}>
        <div style={{
          width: 24, height: 24, borderRadius: 7, background: C.purple,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={12} color={C.white} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: FONT }}>Lens AI</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: C.muted }}>10:41 AM</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          background: C.purple, color: C.white, borderRadius: '16px 16px 4px 16px',
          padding: '10px 14px', fontSize: 13, maxWidth: '78%', fontFamily: FONT, lineHeight: 1.5,
        }}>
          Why was Tuesday slower than last week?
        </div>
      </div>
      <div style={{
        background: 'rgba(73,69,255,0.06)', borderRadius: '4px 16px 16px 16px',
        padding: '12px 14px', fontSize: 13, fontFamily: FONT, lineHeight: 1.55,
        color: C.navy, maxWidth: '92%',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Tuesday revenue was $4,208 — 18% below last Tuesday.</div>
        <div style={{ fontSize: 12, color: C.body, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div>• Foot traffic dropped 12% between 2–5pm</div>
          <div>• Lunch ticket avg fell $3.40 vs prior week</div>
          <div>• One POS terminal was offline 1h 14m</div>
        </div>
      </div>
    </div>
  );
}

function AnswerMockup() {
  const bars = [52, 61, 48, 74, 69, 58, 42];
  return (
    <div style={{
      background: C.white, borderRadius: 20,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 16,
      boxShadow: '0 8px 32px rgba(4,30,66,0.08)',
      border: `1px solid ${C.line}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Database size={14} color={C.purple} />
        <span style={{ fontSize: 11, color: C.muted, fontFamily: FONT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Grounded in your Payments data
        </span>
      </div>
      <div>
        <div style={{ fontSize: 13, color: C.body, fontFamily: FONT, marginBottom: 4 }}>Revenue — last 7 days</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.navy, fontFamily: FONT, letterSpacing: '-0.02em' }}>$42,180</div>
        <div style={{ fontSize: 12, color: C.purple, fontFamily: FONT, marginTop: 2, fontWeight: 600 }}>↑ 9% vs prior 7 days</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 72, paddingTop: 4 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%', height: `${h}%`, borderRadius: 4,
              background: i === 3 ? C.purple : `rgba(73,69,255,${0.18 + i * 0.03})`,
            }} />
            <span style={{ fontSize: 9, color: C.muted, fontFamily: FONT }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
            </span>
          </div>
        ))}
      </div>
      <div style={{
        background: C.grayBg, borderRadius: 10, padding: '10px 12px',
        fontSize: 12, color: C.body, fontFamily: FONT, lineHeight: 1.5,
      }}>
        Thursday spiked 23% — tied to a $490 catering order from a new account.
      </div>
    </div>
  );
}

function ActionMockup() {
  return (
    <div style={{
      background: C.white, borderRadius: 20,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: '0 8px 32px rgba(4,30,66,0.08)',
      border: `1px solid ${C.line}`,
    }}>
      <div style={{
        background: C.grayBg, borderRadius: 12, padding: '12px 14px',
        display: 'flex', gap: 12, alignItems: 'center',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, background: 'rgba(73,69,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Wand2 size={15} color={C.purple} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, fontFamily: FONT }}>
            Oat milk is running low
          </div>
          <div style={{ fontSize: 12, color: C.body, fontFamily: FONT, marginTop: 2 }}>
            3 units left · Avg weekly use: 14
          </div>
        </div>
      </div>
      <div style={{
        border: `1.5px solid rgba(73,69,255,0.3)`, borderRadius: 12,
        padding: '14px 16px', background: C.white,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, fontFamily: FONT, marginBottom: 10 }}>
          Reorder 12 cases from Meadow Ridge?
        </div>
        <div style={{ fontSize: 12, color: C.body, fontFamily: FONT, marginBottom: 12 }}>
          Est. $82.80 · Ships in 2 days
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            background: C.purple, color: C.white, border: 'none',
            borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <Check size={12} /> Confirm
          </button>
          <button style={{
            background: 'transparent', color: C.muted, border: `1px solid ${C.line}`,
            borderRadius: 8, padding: '8px 14px', fontSize: 12,
            cursor: 'pointer', fontFamily: FONT,
          }}>Dismiss</button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Zap size={11} color={C.muted} />
        <span style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}>Always with your approval</span>
      </div>
    </div>
  );
}

function DigestMockup() {
  return (
    <div style={{
      background: C.white, borderRadius: 20,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: '0 8px 32px rgba(4,30,66,0.08)',
      border: `1px solid ${C.line}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: `1px solid ${C.line}` }}>
        <div style={{
          width: 24, height: 24, borderRadius: 7, background: C.purple,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={12} color={C.white} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: FONT }}>Your Monday digest</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'Weekend revenue', value: '$12,840', trend: '+7%', good: true },
          { label: 'Top item', value: 'Cortado', trend: '142 sold', good: true },
          { label: 'Slowest hour', value: 'Sat 3pm', trend: '-18% vs avg', good: false },
        ].map(r => (
          <div key={r.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 0', borderBottom: `1px dashed ${C.line}`,
          }}>
            <span style={{ fontSize: 12, color: C.body, fontFamily: FONT }}>{r.label}</span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: FONT }}>{r.value}</span>
              <span style={{
                fontSize: 11, fontFamily: FONT, fontWeight: 600,
                color: r.good ? C.purple : C.muted,
              }}>{r.trend}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        background: 'rgba(73,69,255,0.06)', borderRadius: 10, padding: '10px 12px',
        fontSize: 12, color: C.navy, fontFamily: FONT, lineHeight: 1.5,
      }}>
        <strong>Heads up:</strong> Matching Friday's staffing would have saved ~$180 in labor.
      </div>
    </div>
  );
}

/* ── Panel data ─────────────────────────────────────────────── */

/* Panel copy is framed around the Brian Tracy idea that customers
   buy outcomes, transformations, and improvements — not features.
   So each panel leads with the outcome (a calmer week, fewer
   blind spots, more time back) instead of describing the
   underlying capability. The capability is still there, but it
   now sits in service of the transformation. */
const PANELS = [
  {
    counter: '01 / 04',
    title: 'Stop guessing. Start knowing.',
    body: 'You stop digging through dashboards and start getting straight answers. Ask in plain English and have what you need in seconds — the kind of clarity that turns a hunch into a decision you can stand behind.',
    cta: 'Start asking',
    mockup: <ChatMockup />,
  },
  {
    counter: '02 / 04',
    title: 'Trust every number you act on.',
    body: 'You replace gut calls with answers you can verify. Every reply is wired to your real Payments, POS, and bank feed and shows its source — so when you change a price, cut a shift, or call a supplier, you know the move is grounded in truth, not in a report.',
    cta: 'See how grounding works',
    mockup: <AnswerMockup />,
  },
  {
    counter: '03 / 04',
    title: 'Get hours back every week.',
    body: 'You go from running the busywork to running the business. Tell Lens to pause a discount, reorder stock, or nudge a teammate and it does it for you — you stay in control, you stop being the bottleneck, you get your evenings back.',
    cta: 'Explore actions',
    mockup: <ActionMockup />,
  },
  {
    counter: '04 / 04',
    title: 'Spot the problem before it costs you.',
    body: 'You stop finding out about the bad week on Sunday. Lens watches the business with you — surfacing the slow shift, the missed reorder, the small leak — so you fix what matters early instead of paying for it at month-end.',
    cta: 'Get started with Lens',
    mockup: <DigestMockup />,
  },
];

/* ── Sticky panel ────────────────────────────────────────────── */

function Panel({
  counter, title, body, cta, mockup, index,
}: {
  counter: string; title: string; body: string; cta: string;
  mockup: React.ReactNode; index: number;
}) {
  // Offset each panel so stack has visible stagger, clearing the floating
  // pill nav with room to breathe. NOTE: site uses body { zoom: 0.8 } on
  // desktop (see theme.css), so the nav actually renders at ~64 visual px
  // (not 80). We want ~40px of visual breathing room below the nav before
  // the panel locks — that's ~104 visual px = 130px CSS. Each subsequent
  // panel staggers 14px down from the previous.
  const topOffset = 130 + index * 14;
  return (
    <div
      style={{
        position: 'sticky',
        top: topOffset,
        padding: '0 clamp(16px, 4vw, 48px)',
        marginBottom: 'clamp(40px, 6vw, 80px)',
      }}
    >
      <div
        style={{
          maxWidth: 1280, margin: '0 auto',
          background: C.white,
          borderRadius: 32,
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(4,30,66,0.12), 0 2px 6px rgba(4,30,66,0.05)',
          border: `1px solid ${C.line}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          minHeight: 560,
        }}
      >
        {/* Left — copy */}
        <div style={{ padding: 'clamp(36px, 5vw, 72px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 32 }}>
          <div>
            <div style={{
              fontFamily: FONT, fontSize: 15, color: C.muted, marginBottom: 40,
              letterSpacing: '0.02em',
            }}>
              <span style={{ color: C.navy, fontWeight: 700 }}>{counter.split(' / ')[0]}</span>
              <span style={{ margin: '0 4px' }}>/</span>
              <span>{counter.split(' / ')[1]}</span>
              <span style={{ marginLeft: 14, color: C.navy, fontWeight: 600 }}>{title}</span>
            </div>
            <p style={{
              fontFamily: FONT, fontSize: 'clamp(22px, 2.4vw, 30px)',
              lineHeight: 1.4, color: C.navy, fontWeight: 500,
              letterSpacing: '-0.015em',
              margin: 0,
            }}>
              {body}
            </p>
          </div>
          <a
            href="/sign-up"
            style={{
              alignSelf: 'flex-start',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: C.navy, color: C.white,
              textDecoration: 'none',
              borderRadius: 999, padding: '16px 28px',
              fontSize: 15, fontWeight: 600, fontFamily: FONT,
            }}
          >
            {cta} <ArrowRight size={16} />
          </a>
        </div>
        {/* Right — mockup with soft indigo wash */}
        <div style={{
          padding: 'clamp(32px, 4vw, 56px)',
          background: `linear-gradient(135deg, rgba(73,69,255,0.14) 0%, rgba(73,69,255,0.05) 55%, ${C.grayBg} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: '100%', maxWidth: 520 }}>
            {mockup}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section intro ───────────────────────────────────────────
   Reframes the stack around the outcome philosophy: customers
   buy the result, not the tool. Kept intentionally plain — a
   short eyebrow, one strong sentence, one supporting line — so
   the cards underneath feel like the proof, not a brochure list.
   ─────────────────────────────────────────────────────────── */
function StackIntro() {
  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 880,
        margin: '0 auto',
        padding: '0 clamp(20px, 4vw, 48px) clamp(48px, 7vw, 96px)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: C.purple,
          marginBottom: 20,
        }}
      >
What you actually get
      </div>
      <h2
        style={{
          fontFamily: FONT,
          fontSize: 'clamp(1.75rem, 4vw, 3rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          color: C.navy,
          margin: '0 0 18px',
        }}
      >
You’re not buying software. You’re buying a better business.
      </h2>
      <p
        style={{
          fontFamily: FONT,
          fontSize: 'clamp(15px, 1.4vw, 18px)',
          lineHeight: 1.65,
          color: C.body,
          margin: 0,
        }}
      >
Owners don’t buy features — they buy outcomes, improvements, and transformations. Lens is the transformation: fewer blind spots, faster decisions, hours back in your week, and a business that runs steadier than it did last month.
      </p>
    </div>
  );
}

export function LensStackingPanels() {
  return (
    <section style={{
      position: 'relative',
      /* Base44-style soft lavender wash backdrop behind the panels */
      background:
        'linear-gradient(180deg, #FFFFFF 0%, #F4F2FF 18%, #EDEBFF 50%, #F4F2FF 82%, #FFFFFF 100%)',
      padding: 'clamp(60px, 8vw, 120px) 0 clamp(140px, 18vw, 240px)',
    }}>
      {/* Soft radial accents for depth */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background:
          'radial-gradient(ellipse 60% 40% at 20% 30%, rgba(73,69,255,0.10) 0%, transparent 60%),' +
          'radial-gradient(ellipse 50% 35% at 85% 75%, rgba(73,69,255,0.10) 0%, transparent 60%)',
      }} />
      <StackIntro />
      {PANELS.map((p, i) => (
        <Panel key={p.counter} index={i} {...p} />
      ))}
    </section>
  );
}
