import { useState } from 'react';
import { Sparkles, ChevronDown, Check, Plus, Mic, ArrowUp, Info } from 'lucide-react';
import { LensScrollRevealText } from '../components/LensScrollRevealText';
import { LensStackingPanels } from '../components/LensStackingPanels';

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
  line:    '#E2E8F0',
};

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

/* ─────────────────────────────────────────────────────────────
   SUGGESTION PILLS
   ───────────────────────────────────────────────────────────── */
const SUGGESTIONS = [
  'Which products made me the most last month?',
  'When should I run a promo?',
  'Why are tips down?',
  'Who are my top 10 customers?',
  'Show me my slowest hour',
];

/* ─────────────────────────────────────────────────────────────
   FAQ DATA
   ───────────────────────────────────────────────────────────── */
const FAQS = [
  { q: 'What is Lens AI?', a: 'Lens is an AI assistant built into Delt that answers questions about your business in plain English. No dashboards to learn, no reports to build.' },
  { q: 'Do I need to set anything up?', a: "No. If you're on Delt Payments or POS, Lens is already connected to your data." },
  { q: 'What can I ask Lens?', a: 'Anything about your sales, customers, inventory, staffing, or payouts. "Why did margin drop last week?", "Which locations need more staff Friday?", "Show me my top 10 customers by profit".' },
  { q: 'Does Lens make mistakes?', a: "Every answer cites the underlying data so you can verify it. If Lens isn't sure, it says so." },
  { q: 'Who can see my data?', a: 'Only you and the people you invite. Your data is never used to train shared models. Full audit log included.' },
  { q: 'Can Lens take actions?', a: 'Yes, on Pro. Lens can pause discounts, reorder inventory, send messages to staff, and more — always with your approval.' },
  { q: 'Is my data secure?', a: 'Encryption at rest (AES-256), in transit (TLS 1.3), SOC 2 Type II controls. Standard for banking.' },
  { q: 'Can I turn Lens off?', a: 'Yes. Lens can be disabled per-user or account-wide at any time.' },
];

/* ─────────────────────────────────────────────────────────────
   FAQ ITEM
   ───────────────────────────────────────────────────────────── */
function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderBottom: `1px solid ${C.line}`, overflow: 'hidden' }}>
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
      <div style={{ maxHeight: open ? 240 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
        <p style={{ margin: 0, paddingBottom: 20, fontSize: 15, lineHeight: 1.7, color: C.body, fontFamily: FONT }}>{a}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────── */
export function LensAIPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [planMode, setPlanMode] = useState(false);
  const [input, setInput] = useState('');

  return (
    <div style={{ fontFamily: FONT, color: C.navy, overflowX: 'hidden', background: C.white }}>

      {/* ══════════════════════════════════════════════════════════
          1. HERO — Base44-style prominent chat
      ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: `radial-gradient(ellipse 95% 65% at 50% -20%, rgba(73,69,255,0.18) 0%, rgba(73,69,255,0.06) 35%, #FFFFFF 70%)`,
        paddingTop: 'clamp(80px, 9vw, 120px)',
        paddingBottom: 'clamp(60px, 7vw, 90px)',
        textAlign: 'center',
      }}>
        {/* Softer dot texture */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(73,69,255,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(180deg, #000 0%, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 70%)',
        }} />

        {/* Eyebrow pill */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 999,
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
          position: 'relative', margin: '0 auto', maxWidth: 820,
          fontSize: 'clamp(2.5rem, 6.5vw, 5rem)',
          lineHeight: 1.05, letterSpacing: '-0.045em',
          fontWeight: 800, color: C.navy,
          padding: '0 20px',
        }}>
          Turn your sales data into{' '}
          <span style={{ color: C.purple }}>answers.</span>
        </h1>

        {/* Subhead */}
        <p style={{
          position: 'relative', margin: '22px auto 0', maxWidth: 620,
          fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.65,
          color: C.body, padding: '0 20px',
        }}>
          Lens AI lets you ask plain-English questions about your business and get real
          answers in seconds. No dashboards to learn. No reports to build.
        </p>

        {/* ───── PROMINENT CHAT CARD (Base44 style) ───── */}
        <div style={{
          position: 'relative', maxWidth: 720, margin: '56px auto 0',
          padding: '0 20px',
        }}>
          {/* Glow behind card */}
          <div aria-hidden style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%', height: 260, borderRadius: '50%',
            background: 'rgba(73,69,255,0.35)',
            filter: 'blur(120px)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          <div style={{
            position: 'relative', zIndex: 1,
            background: C.white, borderRadius: 28,
            boxShadow: '0 16px 48px rgba(4,30,66,0.10), 0 2px 6px rgba(4,30,66,0.04)',
            border: `1px solid ${C.line}`,
            overflow: 'hidden',
          }}>
            {/* Input area (multi-line feel) */}
            <div style={{ padding: '22px 24px 10px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Lens anything about your business…"
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  fontSize: 17, color: C.navy, background: 'transparent',
                  fontFamily: FONT, padding: '6px 0',
                }}
              />
            </div>

            {/* Controls row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px 14px',
            }}>
              {/* Plus button */}
              <button
                type="button"
                aria-label="Add context"
                style={{
                  width: 36, height: 36, borderRadius: 12,
                  border: `1px solid ${C.line}`, background: C.white,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: C.navy,
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.grayBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = C.white)}
              >
                <Plus size={17} />
              </button>

              {/* Plan toggle (pill-style with sliding knob) */}
              <button
                type="button"
                onClick={() => setPlanMode(!planMode)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '6px 10px 6px 6px', borderRadius: 999,
                  border: `1px solid ${C.line}`,
                  background: C.white, cursor: 'pointer', fontFamily: FONT,
                }}
              >
                <span style={{
                  position: 'relative',
                  width: 36, height: 22, borderRadius: 999,
                  background: planMode ? C.purple : '#CBD5E1',
                  transition: 'background 0.2s',
                }}>
                  <span style={{
                    position: 'absolute', top: 2,
                    left: planMode ? 16 : 2,
                    width: 18, height: 18, borderRadius: '50%',
                    background: C.white,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Plan</span>
                <Info size={13} color={C.muted} />
              </button>

              <div style={{ flex: 1 }} />

              {/* Mic */}
              <button
                type="button"
                aria-label="Voice input"
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: 'none', background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: C.muted,
                }}
              >
                <Mic size={17} />
              </button>

              {/* Send */}
              <button
                type="button"
                aria-label="Ask Lens"
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: 'none',
                  background: input.trim() ? C.purple : '#334155',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: C.white,
                  transition: 'background 0.15s, transform 0.1s',
                  boxShadow: input.trim() ? '0 4px 14px rgba(73,69,255,0.4)' : 'none',
                }}
              >
                <ArrowUp size={17} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Label */}
        <p style={{ position: 'relative', margin: '32px auto 12px', fontSize: 12, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          Not sure where to start? Try one of these:
        </p>

        {/* Suggestion pills */}
        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, padding: '0 20px', maxWidth: 900, margin: '0 auto' }}>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => setInput(s)}
              style={{
                background: C.white, border: `1.5px solid ${C.line}`,
                borderRadius: 999, padding: '8px 16px',
                fontSize: 13, color: C.body, cursor: 'pointer',
                fontFamily: FONT, transition: 'border-color 0.15s, color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.purple;
                e.currentTarget.style.color = C.navy;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.line;
                e.currentTarget.style.color = C.body;
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. GRADIENT TRANSITION + LIGHTING-UP TEXT
      ══════════════════════════════════════════════════════════ */}
      <LensScrollRevealText />

      {/* ══════════════════════════════════════════════════════════
          3. STACKING PANELS
      ══════════════════════════════════════════════════════════ */}
      <LensStackingPanels />

      {/* ══════════════════════════════════════════════════════════
          4. PRICING
      ══════════════════════════════════════════════════════════ */}
      <section style={{
        background: C.white,
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

        <div style={{
          maxWidth: 860, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}>
          {/* Free */}
          <div style={{
            background: C.white, borderRadius: 24,
            border: `1.5px solid ${C.line}`,
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

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: C.muted }}>
          Looking for enterprise?{' '}
          <a href="#" style={{ color: C.navy, fontWeight: 600, textDecoration: 'underline' }}>
            Schedule a call.
          </a>
        </p>
        <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, maxWidth: 600, margin: '16px auto 0', lineHeight: 1.6 }}>
          Lens AI answers are grounded in your connected data sources and are intended to assist decision-making, not replace it. Verify important business decisions independently. Question limits apply to Free tier and reset monthly.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. FAQ
      ══════════════════════════════════════════════════════════ */}
      <section style={{
        background: C.grayBg,
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
          <div style={{ borderTop: `1px solid ${C.line}` }}>
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

      {/* ══════════════════════════════════════════════════════════
          6. CTA FOOTER
      ══════════════════════════════════════════════════════════ */}
      <section style={{
        background: C.navy,
        padding: 'clamp(80px, 10vw, 120px) clamp(20px, 4vw, 56px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 60% 50% at 50% 100%, ${C.purple}25 0%, transparent 70%)`,
        }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
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
            Lens is included in every Delt account. Start asking today — your first insights
            typically appear within a few days of your first transactions.
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
        </div>
      </section>

      {/* Global keyframes */}
      <style>{`
        @keyframes lensAIPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}

export default LensAIPage;
