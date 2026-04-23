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

const PANELS = [
  {
    counter: '01 / 04',
    title: 'Ask in plain English',
    body: 'Tell Lens what you want to know and get a clear answer in seconds. No SQL, no dashboards, no reports to build. Just ask.',
    cta: 'Start asking',
    mockup: <ChatMockup />,
  },
  {
    counter: '02 / 04',
    title: 'Answers grounded in your data',
    body: 'Every answer is wired to your real Payments, POS, and bank feed — with the source cited, so you can verify and trust it.',
    cta: 'See how grounding works',
    mockup: <AnswerMockup />,
  },
  {
    counter: '03 / 04',
    title: 'Acts on your behalf',
    body: 'Ask Lens to pause a discount, reorder inventory, or nudge your team — and it does it. You approve, Lens executes.',
    cta: 'Explore actions',
    mockup: <ActionMockup />,
  },
  {
    counter: '04 / 04',
    title: 'Always on, always learning',
    body: 'Lens quietly watches your business and surfaces what matters — weekly digests, anomaly alerts, and proactive suggestions.',
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
  // Offset each panel so stack has visible stagger at the top
  const topOffset = 80 + index * 14;
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
          maxWidth: 1160, margin: '0 auto',
          background: C.white,
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(4,30,66,0.10), 0 1px 3px rgba(4,30,66,0.04)',
          border: `1px solid ${C.line}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        {/* Left — copy */}
        <div style={{ padding: 'clamp(28px, 4vw, 56px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{
              fontFamily: FONT, fontSize: 14, color: C.muted, marginBottom: 32,
              letterSpacing: '0.02em',
            }}>
              <span style={{ color: C.navy, fontWeight: 700 }}>{counter.split(' / ')[0]}</span>
              <span style={{ margin: '0 4px' }}>/</span>
              <span>{counter.split(' / ')[1]}</span>
              <span style={{ marginLeft: 12, color: C.navy, fontWeight: 600 }}>{title}</span>
            </div>
            <p style={{
              fontFamily: FONT, fontSize: 'clamp(18px, 1.9vw, 22px)',
              lineHeight: 1.55, color: C.navy, fontWeight: 500,
              letterSpacing: '-0.01em',
              margin: 0,
            }}>
              {body}
            </p>
          </div>
          <a
            href="/sign-up"
            style={{
              alignSelf: 'flex-start',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: C.navy, color: C.white,
              textDecoration: 'none',
              borderRadius: 999, padding: '12px 22px',
              fontSize: 14, fontWeight: 600, fontFamily: FONT,
            }}
          >
            {cta} <ArrowRight size={14} />
          </a>
        </div>
        {/* Right — mockup with soft indigo wash */}
        <div style={{
          padding: 'clamp(24px, 3vw, 40px)',
          background: `linear-gradient(135deg, rgba(73,69,255,0.12) 0%, rgba(73,69,255,0.04) 55%, ${C.grayBg} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: '100%', maxWidth: 440 }}>
            {mockup}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LensStackingPanels() {
  return (
    <section style={{
      position: 'relative',
      background: C.grayBg,
      padding: 'clamp(40px, 6vw, 96px) 0 clamp(120px, 16vw, 220px)',
    }}>
      {PANELS.map((p, i) => (
        <Panel key={p.counter} index={i} {...p} />
      ))}
    </section>
  );
}
