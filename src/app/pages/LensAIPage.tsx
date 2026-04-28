import { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronDown, Check, Plus, Mic, ArrowUp, Info } from 'lucide-react';
import { LensScrollRevealText } from '../components/LensScrollRevealText';
import { LensStackingPanels } from '../components/LensStackingPanels';
import deltLogoImg from 'figma:asset/ba16007295b082bbfe774b1ba0c31a403b5502d6.png';

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
   TYPEWRITER — cycles prompts with real char-by-char typing,
   fast speed (Base44 feel). Runs only while the input is empty.
   ───────────────────────────────────────────────────────────── */
const TYPE_PROMPTS = [
  'Which products made me the most last month?',
  'Why was Tuesday slower than last week?',
  'Show me my top 10 customers by profit…',
  'When should I run my next promo?',
  'Who are my top spenders this quarter?',
];

function useTypewriter(prompts: string[], active: boolean) {
  const [text, setText] = useState('');
  const idxRef = useRef(0);      // which prompt
  const charRef = useRef(0);     // current char count
  const phaseRef = useRef<'typing' | 'holding' | 'deleting'>('typing');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      return;
    }

    const step = () => {
      const current = prompts[idxRef.current % prompts.length];
      let delay = 36; // fast typing speed (ms/char)

      if (phaseRef.current === 'typing') {
        charRef.current += 1;
        setText(current.slice(0, charRef.current));
        if (charRef.current >= current.length) {
          phaseRef.current = 'holding';
          delay = 1400;
        }
      } else if (phaseRef.current === 'holding') {
        phaseRef.current = 'deleting';
        delay = 240;
      } else {
        charRef.current -= 2; // delete a bit faster than typing
        if (charRef.current <= 0) {
          charRef.current = 0;
          setText('');
          phaseRef.current = 'typing';
          idxRef.current += 1;
          delay = 260;
        } else {
          setText(current.slice(0, charRef.current));
          delay = 22;
        }
      }

      timerRef.current = window.setTimeout(step, delay);
    };

    timerRef.current = window.setTimeout(step, 420);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [active, prompts]);

  return text;
}

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
  const [inputFocused, setInputFocused] = useState(false);
  const typedText = useTypewriter(TYPE_PROMPTS, !input && !inputFocused);

  return (
    <div style={{ fontFamily: FONT, color: C.navy, background: C.white }}>

      {/* ══════════════════════════════════════════════════════════
          1. HERO — Base44-style prominent chat
      ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingTop: 'clamp(72px, 9vw, 128px)',
        paddingBottom: 'clamp(56px, 7vw, 96px)',
        textAlign: 'center',
        /* Base44-style large horizontal-band hero gradient — a
           generous purple wash at the top softens to white through
           the middle and settles on a warm, on-palette off-white
           at the bottom. Layered radial accent keeps the top lively. */
        background: `
          linear-gradient(180deg,
            rgba(73,69,255,0.38) 0%,
            rgba(73,69,255,0.22) 16%,
            rgba(73,69,255,0.10) 32%,
            rgba(255,255,255,1)  60%,
            rgba(246,247,251,1)  100%)
        `,
      }}>
        {/* Top radial depth accent — adds the “sky” feel from Base44 */}
        <div aria-hidden style={{
          position: 'absolute', inset: '0 0 auto 0', height: '62%',
          background: `radial-gradient(ellipse 110% 85% at 50% 0%,
            rgba(73,69,255,0.30) 0%,
            rgba(73,69,255,0.12) 40%,
            rgba(255,255,255,0)  72%)`,
          pointerEvents: 'none',
        }} />

        {/* Softer dot texture */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, opacity: 0.32, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(73,69,255,0.09) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(180deg, #000 0%, transparent 80%)',
          WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 80%)',
        }} />

        {/* Eyebrow pill */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
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
            Say hello to Lens
          </span>
        </div>

        {/* ───── GRADIENT “Lens” WORDMARK + “by Delt” LOCKUP ─────
           Matches the LensHero portal wordmark — Playfair Display serif,
           char-by-char rise reveal, gradient that reads vibrant on a
           light background (brand purple → deep navy). */}
        <div
          aria-label="Lens by Delt"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: '0.015em',
            }}
          >
            {['L', 'e', 'n', 's'].map((ch, i) => (
              <span key={i} className="lens-word-wrap">
                <span className={`lens-word-char lens-word-char-${i} lens-word-gradient`}>{ch}</span>
              </span>
            ))}
          </h1>
          <div
            className="lens-lockup-by"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 10,
            }}
          >
            <span style={{ color: C.muted, fontSize: '0.95rem', fontWeight: 500 }}>by</span>
            <img
              src={deltLogoImg}
              alt="Delt"
              style={{ objectFit: 'contain', height: 26, width: 'auto' }}
            />
          </div>
        </div>

        {/* Headline */}
        <h2 style={{
          position: 'relative', margin: '0 auto', maxWidth: 820,
          fontSize: 'clamp(2.25rem, 5.5vw, 4.25rem)',
          lineHeight: 1.05, letterSpacing: '-0.04em',
          fontWeight: 800, color: C.navy,
          padding: '0 20px',
        }}>
          Turn your sales data into{' '}
          <span style={{ color: C.purple }}>answers.</span>
        </h2>

        {/* Subhead */}
        <p style={{
          position: 'relative', margin: '22px auto 0', maxWidth: 620,
          fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.65,
          color: C.body, padding: '0 20px',
        }}>
          Lens lets you ask plain-English questions about your business and get real
          answers in seconds. No dashboards to learn. No reports to build.
        </p>

        {/* ───── PROMINENT CHAT CARD (Base44 liquid-glass style) ───── */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1120,
          margin: 'clamp(40px, 5vw, 72px) auto 0',
          padding: '0 clamp(16px, 3vw, 32px)',
        }}>
          {/* Outer soft glow behind card */}
          <div aria-hidden style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '96%', height: 420, borderRadius: '50%',
            background: 'rgba(73,69,255,0.32)',
            filter: 'blur(160px)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          {/* Liquid-glass card — layered gradients + inner highlight */}
          <div className="lens-chat-card" style={{
            position: 'relative', zIndex: 1,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.82) 100%)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            borderRadius: 28,
            boxShadow: [
              '0 1px 0 rgba(255,255,255,0.9) inset',            // top highlight
              '0 -1px 0 rgba(255,255,255,0.5) inset',           // bottom highlight
              '0 40px 110px -24px rgba(4,30,66,0.22)',          // soft drop
              '0 18px 44px -10px rgba(4,30,66,0.12)',           // closer drop
              '0 2px 6px rgba(4,30,66,0.05)',
            ].join(', '),
            border: '1px solid rgba(255,255,255,0.8)',
            outline: '1px solid rgba(4,30,66,0.06)',
            outlineOffset: '-1px',
            overflow: 'hidden',
            minHeight: 'clamp(260px, 34vh, 360px)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Shimmer sweep on inner highlight — recurring polish pass */}
            <div aria-hidden className="lens-chat-shimmer" />
            {/* Input area — generous breathing room, animated typing placeholder */}
            <div style={{
              padding: 'clamp(28px, 4vw, 48px) clamp(28px, 4vw, 48px) 20px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              textAlign: 'left',
            }}>
              <div style={{ position: 'relative', minHeight: 84 }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  style={{
                    width: '100%', border: 'none', outline: 'none',
                    fontSize: 'clamp(20px, 2vw, 24px)', lineHeight: 1.5, color: C.navy,
                    background: 'transparent',
                    fontFamily: FONT, padding: '4px 0',
                    position: 'relative', zIndex: 1,
                  }}
                />
                {/* Typing placeholder — JS-driven typewriter, Base44-style */}
                {!input && !inputFocused && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    pointerEvents: 'none',
                    fontSize: 'clamp(20px, 2vw, 24px)', lineHeight: 1.5, color: C.muted,
                    fontFamily: FONT, padding: '4px 0',
                    display: 'flex', alignItems: 'center',
                    whiteSpace: 'pre',
                  }}>
                    <span>{typedText}</span>
                    <span className="lens-caret" />
                  </div>
                )}
              </div>
            </div>

            {/* Controls row — quieter, bottom-aligned */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0 28px 22px',
            }}>
              {/* Plus button — borderless, icon-only, like Base44 */}
              <button
                type="button"
                aria-label="Add context"
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  border: 'none', background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#64748B',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(4,30,66,0.05)';
                  e.currentTarget.style.color = C.navy;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748B';
                }}
              >
                <Plus size={18} />
              </button>

              {/* Plan toggle — borderless, inline label + subtle knob */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '6px 4px',
              }}>
                <button
                  type="button"
                  onClick={() => setPlanMode(!planMode)}
                  aria-label="Toggle plan mode"
                  style={{
                    position: 'relative',
                    width: 34, height: 20, borderRadius: 999,
                    border: 'none', padding: 0,
                    background: planMode ? C.purple : '#E2E8F0',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 2,
                    left: planMode ? 16 : 2,
                    width: 16, height: 16, borderRadius: '50%',
                    background: C.white,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                  }} />
                </button>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.navy, fontFamily: FONT }}>Plan</span>
                <Info size={13} color={C.muted} />
              </div>

              <div style={{ flex: 1 }} />

              {/* Mic — borderless, muted */}
              <button
                type="button"
                aria-label="Voice input"
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: 'none', background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#64748B',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(4,30,66,0.05)';
                  e.currentTarget.style.color = C.navy;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748B';
                }}
              >
                <Mic size={17} />
              </button>

              {/* Send — flat dark circle when empty, indigo when typed */}
              <button
                type="button"
                aria-label="Ask Lens"
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: 'none',
                  background: input.trim() ? C.purple : '#475569',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: C.white,
                  transition: 'background 0.2s',
                }}
              >
                <ArrowUp size={16} strokeWidth={2.5} />
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
            Simple pricing. No surprises.
          </h2>
          <p style={{ margin: 0, fontSize: 17, color: C.body, lineHeight: 1.6 }}>
            Start free, upgrade when you need more. No long-term contract.
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
            <div style={{ fontSize: 14, color: C.body, marginBottom: 28 }}>Comes with every Delt account — no setup needed</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {['500 questions a month', 'Answers in plain English', 'Plugs into your POS and payments', 'Weekly email summaries'].map(f => (
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
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>Everything in Free, and:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {['Unlimited questions', 'Lens can take actions for you', 'All locations in one view', 'Priority support'].map(f => (
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
          Processing over $100K/month?{' '}
          <a href="#" style={{ color: C.navy, fontWeight: 600, textDecoration: 'underline' }}>
            Let's talk custom rates.
          </a>
        </p>
        <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, maxWidth: 600, margin: '16px auto 0', lineHeight: 1.6 }}>
          Lens answers come from your own connected data and are meant to help you make decisions, not replace your judgment. Always double-check before making big moves. Question limits on the Free plan reset every month.
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
            Stop flying blind.
          </h2>
          <p style={{
            margin: '0 auto 40px', maxWidth: 480,
            fontSize: 18, lineHeight: 1.7,
            color: 'rgba(255,255,255,0.8)',
          }}>
            Lens comes with every Delt account. Ask your first question today — most owners see useful answers within their first few days.
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

      {/* Global keyframes + typing placeholder */}
      <style>{`
        @keyframes lensAIPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.3); }
        }

        /* ── “Lens” wordmark ──
           Playfair Display serif with a top-to-bottom gradient tuned
           for a light background. Mirrors LensHero's char-by-char rise. */
        .lens-word-wrap {
          display: inline-block;
          overflow: hidden;
          vertical-align: bottom;
          line-height: 0.95;
        }
        .lens-word-char {
          display: inline-block;
          animation: lensWordUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .lens-word-char-0 { animation-delay: 0.05s; }
        .lens-word-char-1 { animation-delay: 0.13s; }
        .lens-word-char-2 { animation-delay: 0.21s; }
        .lens-word-char-3 { animation-delay: 0.29s; }
        @keyframes lensWordUp {
          from { transform: translateY(110%); }
          to   { transform: translateY(0); }
        }
        .lens-word-gradient {
          background: linear-gradient(
            180deg,
            #7B73FF 0%,
            #5A52FF 22%,
            #4945FF 45%,
            #2E2AC7 68%,
            #1B2A6B 86%,
            #041E42 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }

        /* “by Delt” lockup fades in after the wordmark finishes rising */
        .lens-lockup-by {
          opacity: 0;
          animation: lensLockupIn 0.6s ease 0.65s forwards;
        }
        @keyframes lensLockupIn {
          to { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lens-word-char { animation: none; transform: none; }
          .lens-lockup-by { animation: none; opacity: 1; }
        }

        /* ── Chat card entrance ───────────────────────────────────
           Subtle upward fade-in with a breath of scale.
           Waits ~180ms so hero copy settles first. */
        .lens-chat-card {
          animation: lensChatEnter 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both;
          will-change: transform, opacity;
        }
        @keyframes lensChatEnter {
          0%   { opacity: 0; transform: translateY(16px) scale(0.985); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }

        /* ── Shimmer pass on inner highlight ─────────────────────
           A soft diagonal sheen travels across the top of the card
           every 6.5s, hinting at the glass surface. */
        .lens-chat-shimmer {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        /* Lift the real content above the shimmer so it stays crisp */
        .lens-chat-card > *:not(.lens-chat-shimmer) {
          position: relative;
          z-index: 1;
        }
        .lens-chat-shimmer::before {
          content: '';
          position: absolute;
          top: -40%;
          left: -60%;
          width: 55%;
          height: 180%;
          background: linear-gradient(115deg,
            rgba(255,255,255,0)    0%,
            rgba(255,255,255,0)    38%,
            rgba(255,255,255,0.55) 50%,
            rgba(255,255,255,0)    62%,
            rgba(255,255,255,0)    100%);
          filter: blur(1px);
          transform: translateX(0) rotate(0deg);
          animation: lensChatShimmer 6.5s ease-in-out 1.2s infinite;
          mix-blend-mode: screen;
        }
        @keyframes lensChatShimmer {
          0%   { transform: translateX(0);     opacity: 0; }
          8%   { opacity: 0.9; }
          45%  { transform: translateX(380%);  opacity: 0.9; }
          55%  { opacity: 0; }
          100% { transform: translateX(380%);  opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lens-chat-card { animation: none; }
          .lens-chat-shimmer::before { animation: none; opacity: 0; }
        }

        /* Blinking caret for the JS typewriter placeholder */
        .lens-caret {
          display: inline-block;
          width: 1.5px;
          height: 1.05em;
          background: #94A3B8;
          margin-left: 1px;
          vertical-align: middle;
          animation: lensBlink 1s step-end infinite;
        }
        @keyframes lensBlink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default LensAIPage;
