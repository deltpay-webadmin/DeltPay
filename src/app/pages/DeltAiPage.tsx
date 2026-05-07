import { useEffect, useRef, useState } from 'react';
import { LensHero } from '../components/LensHero';
import { Link } from 'react-router';
import { ChatGPTvsLens } from '../components/ChatGPTvsLens';

/* ════════════════════════════════════════════════════════════
   PALETTE (from lens-proof-section)
   ════════════════════════════════════════════════════════════ */
const C = {
  bg:          '#041E42',
  card:        '#07264D',
  border:      'rgba(255,255,255,0.08)',
  white:       '#ffffff',
  white70:     'rgba(255,255,255,0.7)',
  white50:     'rgba(255,255,255,0.5)',
  white35:     'rgba(255,255,255,0.35)',
  white08:     'rgba(255,255,255,0.08)',
  white05:     'rgba(255,255,255,0.05)',
  indigo:      '#4f46ff',
  indigoLight: '#7b61ff',
  green:       'rgba(73,69,255,0.9)',
  red:         'rgba(4,30,66,0.55)',
  amber:       'rgba(73,69,255,0.6)',
  blue:        'rgba(4,30,66,0.7)',
};

const FONT_SERIF = "'Playfair Display', Georgia, serif";
const FONT_SANS  = "'Plus Jakarta Sans', sans-serif";

/* ════════════════════════════════════════════════════════════
   ROTATING WORD HOOK
   ════════════════════════════════════════════════════════════ */
const WORDS = ['analyzed.', 'protected.', 'optimized.', 'prescribed.'];

function useRotatingWord() {
  const [word, setWord] = useState(WORDS[0]);
  const [fading, setFading] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        idx.current = (idx.current + 1) % WORDS.length;
        setWord(WORDS[idx.current]);
        setFading(false);
      }, 200);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return { word, fading };
}

/* ════════════════════════════════════════════════════════════
   REVEAL HOOK (intersection observer)
   ════════════════════════════════════════════════════════════ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ════════════════════════════════════════════════════════════
   PROOF CARD
   ════════════════════════════════════════════════════════════ */
interface ProofCardProps {
  badge:     string;
  badgeColor: string;
  badgeBg:   string;
  iconColor: string;
  icon:      React.ReactNode;
  title:     string;
  body:      React.ReactNode;
  middle:    React.ReactNode;
  actionBg:   string;
  actionBorder: string;
  actionValue: string;
  actionLabel: string;
  actionDesc:  string;
  note:      string;
  delay:     number;
}

function ProofCard(p: ProofCardProps) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 420,
        padding: 26,
        borderRadius: 20,
        background: `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, ${C.card} 22%)`,
        border: `1px solid ${C.border}`,
        boxShadow: '0 18px 50px rgba(0,0,0,0.26)',
        transition: 'transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, opacity 0.7s ease, translate 0.7s ease',
        transitionDelay: `${p.delay}s`,
        opacity: visible ? 1 : 0,
        translate: visible ? '0 0' : '0 28px',
      }}
      className="proof-card-hover"
    >
      {/* Shimmer on hover via CSS class */}
      <div className="proof-shimmer" />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '6px 10px', borderRadius: 999,
          background: p.badgeBg, color: p.badgeColor,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', fontFamily: FONT_SANS,
        }}>
          {p.badge}
        </span>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 42, height: 42, borderRadius: 12,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: p.iconColor,
        }}>
          {p.icon}
        </div>
      </div>

      {/* Title */}
      <h3 style={{
        margin: '0 0 14px', fontSize: 28, lineHeight: 1.05,
        letterSpacing: '-0.03em', color: C.white,
        fontFamily: FONT_SANS, fontWeight: 600,
      }}>
        {p.title}
      </h3>

      {/* Body */}
      <p style={{ margin: 0, color: C.white70, fontSize: 17, lineHeight: 1.7, fontFamily: FONT_SANS }}>
        {p.body}
      </p>

      {/* Middle widget */}
      {p.middle}

      {/* Action block */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        marginTop: 'auto', padding: 16, borderRadius: 16,
        background: p.actionBg, border: `1px solid ${p.actionBorder}`,
      }}>
        <div style={{
          flexShrink: 0, fontSize: 26, fontWeight: 700,
          lineHeight: 1, letterSpacing: '-0.04em',
          color: C.white, fontFamily: FONT_SANS,
        }}>
          {p.actionValue}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <strong style={{ fontSize: 13, color: C.white, fontFamily: FONT_SANS }}>{p.actionLabel}</strong>
          <span style={{ fontSize: 13, lineHeight: 1.45, color: C.white50, fontFamily: FONT_SANS }}>{p.actionDesc}</span>
        </div>
      </div>

      {/* Note */}
      <p style={{ margin: '14px 2px 0', color: C.white35, fontSize: 13, lineHeight: 1.6, fontFamily: FONT_SANS }}>
        {p.note}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════ */
export function DeltAiPage() {
  const { word, fading } = useRotatingWord();

  const headerReveal = useReveal();
  const kickerReveal = useReveal();
  const thesisReveal = useReveal();
  const ctaReveal    = useReveal();

  const handleAutoplay = () => {
    const el = document.getElementById('lens-proof');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.white }}>
      {/* ══ HERO — keep exactly as-is ══ */}
      <LensHero onAutoplay={handleAutoplay} />

      {/* ══ PROOF SECTION ══ */}
      <section
        id="lens-proof"
        style={{
          position: 'relative',
          maxWidth: 1320,
          margin: '0 auto',
          padding: 'clamp(120px, 12vw, 180px) clamp(20px, 4vw, 56px) clamp(80px, 9vw, 112px)',
          overflow: 'clip',
        }}
      >
        {/* Radial gradient accent */}
        <div style={{
          position: 'absolute', inset: '-40px auto auto 50%',
          width: 720, height: 420,
          transform: 'translateX(-50%)',
          background: `radial-gradient(circle, rgba(79,70,255,0.14) 0%, rgba(52,211,153,0.06) 28%, transparent 70%)`,
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }} />

        {/* ─── Section header ─── */}
        <div
          ref={headerReveal.ref}
          style={{
            position: 'relative', zIndex: 1,
            textAlign: 'center', maxWidth: 760, margin: '0 auto 28px',
            transition: 'opacity 0.7s ease, translate 0.7s ease',
            opacity: headerReveal.visible ? 1 : 0,
            translate: headerReveal.visible ? '0 0' : '0 26px',
          }}
        >
          <div style={{
            display: 'inline-block', marginBottom: 14,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: C.indigoLight,
            fontFamily: FONT_SANS,
          }}>
            SEE WHAT LENS CATCHES
          </div>

          <h2 style={{
            margin: 0,
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            lineHeight: 1.04, letterSpacing: '-0.04em',
            fontWeight: 700, color: C.white,
            fontFamily: FONT_SANS,
          }}>
            Your business,{' '}
            <span style={{
              display: 'inline-block', minWidth: '12ch',
              color: C.indigoLight,
              opacity: fading ? 0 : 1,
              filter: fading ? 'blur(6px)' : 'blur(0)',
              transform: fading ? 'translateY(8px)' : 'translateY(0)',
              transition: 'opacity 0.18s ease, filter 0.18s ease, transform 0.18s ease',
              fontFamily: FONT_SANS,
            }}>
              {word}
            </span>
          </h2>

          <p style={{
            margin: '20px auto 0', maxWidth: 700,
            fontSize: 18, lineHeight: 1.7,
            color: C.white50, fontFamily: FONT_SANS,
          }}>
            Lens turns hidden business signals into plain-English actions owners can take immediately — with the money, timing, and next step attached.
          </p>
        </div>

        {/* ─── Kicker pill ─── */}
        <div
          ref={kickerReveal.ref}
          style={{
            position: 'relative', zIndex: 1,
            textAlign: 'center', marginBottom: 36,
            transition: 'opacity 0.7s ease, translate 0.7s ease',
            opacity: kickerReveal.visible ? 1 : 0,
            translate: kickerReveal.visible ? '0 0' : '0 26px',
          }}
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', borderRadius: 999,
            border: `1px solid ${C.white08}`,
            background: 'rgba(255,255,255,0.03)',
            color: C.white70, fontSize: 14,
            fontFamily: FONT_SANS,
          }}>
            Real signals. Real money. Real decisions.
          </span>
        </div>

        {/* ─── Cards grid ─── */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 22,
        }}>
          {/* Card 1 — Profit Leak */}
          <ProofCard
            badge="PROFIT LEAK"
            badgeColor={C.green}
            badgeBg="rgba(52,211,153,0.12)"
            iconColor={C.green}
            icon={
              <svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
                <path d="M12 4v16M8 8l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 14h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.45"/>
              </svg>
            }
            title="Hidden Costs"
            body={<>You're spending <strong style={{ color: C.white }}>$800/mo</strong> on <strong style={{ color: C.white }}>4 software subscriptions</strong> you haven't logged into since October.</>}
            middle={
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '18px 0 24px' }}>
                {['4 unused tools', '$800 monthly waste', 'Last used: October'].map(pill => (
                  <span key={pill} style={{
                    padding: '8px 10px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: C.white50, fontSize: 12, lineHeight: 1,
                    fontFamily: FONT_SANS,
                  }}>{pill}</span>
                ))}
              </div>
            }
            actionBg="rgba(52,211,153,0.12)"
            actionBorder="rgba(52,211,153,0.2)"
            actionValue="+$9,600"
            actionLabel="Projected annual savings"
            actionDesc="One-click cancel"
            note="Quiet waste compounds fast. Lens catches it before it becomes normal."
            delay={0.08}
          />

          {/* Card 2 — Burn Watchdog */}
          <ProofCard
            badge="CASH RISK"
            badgeColor={C.amber}
            badgeBg="rgba(251,191,36,0.12)"
            iconColor={C.amber}
            icon={
              <svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
                <path d="M4 17l5-5 4 4 7-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="19" cy="7" r="1.8" fill="currentColor" opacity="0.4"/>
              </svg>
            }
            title="Cash Shortfall"
            body={<>At your current pace, payroll will be <strong style={{ color: C.white }}>$3k short by next Friday</strong>.</>}
            middle={
              <div style={{ position: 'relative', margin: '20px 0 24px', paddingTop: 18 }}>
                {/* Track */}
                <div style={{
                  height: 8, borderRadius: 999,
                  background: `linear-gradient(90deg, ${C.green}, ${C.amber} 62%, rgba(248,113,113,0.9) 100%)`,
                }} />
                {/* Danger line */}
                <div style={{
                  position: 'absolute', right: '18%', top: 8,
                  width: 2, height: 24, borderRadius: 999,
                  background: C.red,
                }} />
                <div style={{
                  position: 'absolute', right: '12%', top: 0,
                  color: C.red, fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.04em', fontFamily: FONT_SANS,
                }}>Shortfall</div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginTop: 10, color: C.white35,
                  fontSize: 11, textTransform: 'uppercase',
                  letterSpacing: '0.08em', fontFamily: FONT_SANS,
                }}>
                  <span>Today</span>
                  <span>Tue</span>
                  <span style={{ color: C.red, fontWeight: 700 }}>Fri</span>
                </div>
              </div>
            }
            actionBg="rgba(248,113,113,0.12)"
            actionBorder="rgba(248,113,113,0.2)"
            actionValue="$5,000"
            actionLabel="Recommended move"
            actionDesc="Pull from your Delt line now to avoid late fees"
            note="Not just a warning — a path to fix it before the shortfall hits."
            delay={0.16}
          />

          {/* Card 3 — VIP Alert */}
          <ProofCard
            badge="CUSTOMER CHURN"
            badgeColor={C.indigoLight}
            badgeBg="rgba(123,97,255,0.14)"
            iconColor={C.indigoLight}
            icon={
              <svg viewBox="0 0 24 24" fill="none" width={20} height={20}>
                <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M5 19c0-3.4 3.1-6 7-6s7 2.6 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            }
            title="At-risk Customers"
            body={<>Your <strong style={{ color: C.white }}>5 biggest spenders</strong> haven't been back in <strong style={{ color: C.white }}>3 weeks</strong>. They usually come every <strong style={{ color: C.white }}>10 days</strong>.</>}
            middle={
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                margin: '22px 0 24px', padding: '14px 16px',
                borderRadius: 14, background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                {[true, true, false, false, false].map((active, i) => (
                  <span key={i} style={{
                    width: 14, height: 14, borderRadius: 999,
                    display: 'inline-block',
                    background: active
                      ? 'rgba(96,165,250,0.7)'
                      : 'rgba(248,113,113,0.85)',
                    boxShadow: active ? undefined : '0 0 16px rgba(248,113,113,0.24)',
                  }} />
                ))}
                <span style={{ marginLeft: 8, fontSize: 12, color: C.white50, fontFamily: FONT_SANS }}>
                  3 of 5 at churn risk
                </span>
              </div>
            }
            actionBg="rgba(79,70,255,0.12)"
            actionBorder="rgba(123,97,255,0.22)"
            actionValue="15% OFF"
            actionLabel="Recommended action"
            actionDesc='Send a "We miss you" text now'
            note="Revenue risk is easier to recover when you catch it early."
            delay={0.24}
          />
        </div>

        {/* ─── Thesis line ─── */}
        <div
          ref={thesisReveal.ref}
          style={{
            position: 'relative', zIndex: 1,
            textAlign: 'center', marginTop: 54,
            transition: 'opacity 0.7s ease, translate 0.7s ease',
            opacity: thesisReveal.visible ? 1 : 0,
            translate: thesisReveal.visible ? '0 0' : '0 26px',
          }}
        >
          <div style={{
            width: 48, height: 2, margin: '0 auto 16px',
            borderRadius: 999,
            background: `linear-gradient(90deg, ${C.green}, ${C.indigoLight})`,
            opacity: 0.85,
          }} />
          <p style={{ margin: 0, fontSize: 16, color: C.white50, fontFamily: FONT_SANS }}>
            Lens doesn't surface dashboards. It surfaces decisions.
          </p>
        </div>
      </section>

      {/* ══ CHATGPT vs LENS COMPARISON ══ */}
      <ChatGPTvsLens />

      {/* ══ HOW IT WORKS ══ */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 'clamp(40px, 6vw, 80px) clamp(20px, 4vw, 56px)',
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
          {[
            {
              label: 'Reads like a briefing',
              text:  'Lens speaks in plain language, not technical fragments or dashboard jargon.',
              accent: C.green,
            },
            {
              label: 'Shows what changed',
              text:  'Merchants see the new signal immediately — and exactly why it matters right now.',
              accent: C.blue,
            },
            {
              label: 'Points toward action',
              text:  'Every important insight creates a next step, not just another metric to stare at.',
              accent: C.indigoLight,
            },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 36, height: 3, borderRadius: 999, background: item.accent }} />
              <h3 style={{
                margin: 0, fontSize: 22, color: C.white,
                fontFamily: FONT_SANS, fontWeight: 600,
              }}>{item.label}</h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: C.white50, fontFamily: FONT_SANS }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <div style={{
        background: C.bg,
        padding: 'clamp(60px, 8vw, 96px) clamp(20px, 4vw, 56px) clamp(80px, 10vw, 120px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient glow behind the card */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: 800, height: 400,
          background: 'radial-gradient(ellipse, rgba(79,70,255,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        <section
          ref={ctaReveal.ref}
          style={{
            maxWidth: 860,
            margin: '0 auto',
            position: 'relative', zIndex: 1,
            transition: 'opacity 0.7s ease, translate 0.7s ease',
            opacity: ctaReveal.visible ? 1 : 0,
            translate: ctaReveal.visible ? '0 0' : '0 26px',
          }}
        >
          <div style={{
            borderRadius: 28,
            border: '1px solid rgba(79,70,255,0.22)',
            background: 'linear-gradient(160deg, rgba(79,70,255,0.2) 0%, rgba(4,30,66,0.9) 55%, rgba(3,21,46,1) 100%)',
            padding: 'clamp(40px, 6vw, 64px)',
            textAlign: 'center',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 40px 100px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* top glow */}
            <div style={{
              position: 'absolute', top: -80, left: '50%',
              transform: 'translateX(-50%)',
              width: 400, height: 200,
              background: 'radial-gradient(circle, rgba(79,70,255,0.35) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }} />

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 14px', borderRadius: 999,
              border: `1px solid rgba(79,70,255,0.3)`,
              background: 'rgba(79,70,255,0.12)',
              color: C.indigoLight, fontSize: 12, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              marginBottom: 24, fontFamily: FONT_SANS,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.indigoLight, display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
              Now available
            </div>

            <h2 style={{
              margin: '0 0 16px',
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              lineHeight: 1.06, letterSpacing: '-0.04em',
              color: C.white, fontFamily: FONT_SANS, fontWeight: 700,
            }}>
              Ask anything about your business.
            </h2>

            <p style={{
              margin: '0 auto 36px', maxWidth: 520,
              fontSize: 18, lineHeight: 1.7,
              color: C.white50, fontFamily: FONT_SANS,
            }}>
              Get answers you can act on — with the money, timing, and next step already attached.
            </p>

            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 24, fontFamily: FONT_SANS, maxWidth: 440, margin: '0 auto 24px' }}>AI-generated insights should be reviewed before acting. Delt is not liable for decisions made solely on AI output.</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              <Link
                to="/onboarding"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 32px', borderRadius: 999,
                  background: C.indigo,
                  boxShadow: `0 8px 32px rgba(79,70,255,0.4)`,
                  color: C.white, fontSize: 16, fontWeight: 600,
                  textDecoration: 'none', fontFamily: FONT_SANS,
                  transition: 'filter 0.2s',
                }}
              >
                Get started
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>

              <button
                onClick={() => document.getElementById('lens-proof')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 28px', borderRadius: 999,
                  border: `1px solid ${C.border}`,
                  background: 'rgba(255,255,255,0.04)',
                  color: C.white70, fontSize: 16, fontWeight: 500,
                  cursor: 'pointer', fontFamily: FONT_SANS,
                  transition: 'background 0.2s',
                }}
              >
                See how it works
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Global hover styles ── */}
      <style>{`
        .proof-card-hover {
          cursor: default;
        }
        .proof-card-hover:hover {
          transform: translateY(-6px) !important;
          border-color: rgba(255,255,255,0.14) !important;
          box-shadow: 0 26px 70px rgba(0,0,0,0.34) !important;
        }
        .proof-shimmer {
          position: absolute;
          top: 0; left: -120%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          transition: left 0.7s ease;
          pointer-events: none;
        }
        .proof-card-hover:hover .proof-shimmer {
          left: 160%;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}