import { useEffect, useRef, useState } from 'react';

const FONT_SANS  = "'Plus Jakarta Sans', sans-serif";
const FONT_SERIF = "'Playfair Display', Georgia, serif";

const ROWS = [
  {
    topic:   'Data source',
    chatgpt: 'The entire internet',
    lens:    'Your actual transactions, payroll, customers & cash',
  },
  {
    topic:   'What it knows',
    chatgpt: 'Everything in general, nothing about you',
    lens:    'Your slow Tuesdays, your VIP churn, your payroll gap',
  },
  {
    topic:   'Output',
    chatgpt: 'Answers to questions you thought to ask',
    lens:    'Decisions you needed — before you knew to ask',
  },
  {
    topic:   'Action attached',
    chatgpt: 'Suggestions based on best practices',
    lens:    'Exact move, exact amount, exact timing',
  },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export function ChatGPTvsLens() {
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        background: '#03152E',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(56px, 8vw, 96px) clamp(20px, 5vw, 64px)',
        transition: 'opacity 0.8s ease, translate 0.8s ease',
        opacity: visible ? 1 : 0,
        translate: visible ? '0 0' : '0 32px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Headline ── */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{
            display: 'inline-block',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#7b61ff',
            fontFamily: FONT_SANS, marginBottom: 16,
          }}>
            WHY LENS IS DIFFERENT
          </div>

          <h2 style={{
            margin: 0,
            fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            lineHeight: 1.1, letterSpacing: '-0.035em',
            color: '#fff', fontFamily: FONT_SANS, fontWeight: 700,
          }}>
            ChatGPT reads the internet.{' '}
            <span style={{
              fontFamily: FONT_SERIF, fontStyle: 'italic',
              background: 'linear-gradient(118deg, #fff 0%, #c4b9ff 45%, #7b61ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Lens knows your business.
            </span>
          </h2>

          <p style={{
            margin: '18px auto 0', maxWidth: 580,
            fontSize: 17, lineHeight: 1.7,
            color: 'rgba(255,255,255,0.72)', fontFamily: FONT_SANS,
          }}>
            Generic AI gives you generic answers. Lens is trained on the one dataset that actually matters — yours.
          </p>
        </div>

        {/* ── Comparison card ── */}
        <div style={{
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        }}>

          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              padding: '22px 28px',
              fontSize: 15, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#c4b9ff',
              fontFamily: FONT_SANS,
              display: 'flex', alignItems: 'center',
              background: 'rgba(79,70,255,0.07)',
            }}>
              Category
            </div>
            {/* ChatGPT header */}
            <div style={{
              padding: '22px 28px',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              {/* ChatGPT icon */}
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10 1.6 0 3.11-.376 4.447-1.042L21 22l-1.042-4.553A9.954 9.954 0 0022 12C22 6.477 17.523 2 12 2z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8v4l2.5 2.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{
                fontSize: 18, fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                fontFamily: FONT_SANS,
              }}>ChatGPT</span>
            </div>
            {/* Lens header */}
            <div style={{
              padding: '22px 28px',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(79,70,255,0.07)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(79,70,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#7b61ff" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="4" stroke="#7b61ff" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="1.5" fill="#7b61ff"/>
                </svg>
              </div>
              <span style={{
                fontSize: 18, fontWeight: 700,
                color: '#c4b9ff',
                fontFamily: FONT_SANS, letterSpacing: '-0.01em',
              }}>Lens by Delt</span>
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <div
              key={row.topic}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                borderBottom: i < ROWS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : undefined,
                transition: 'background 0.2s',
              }}
              className="cvl-row"
            >
              {/* Topic */}
              <div style={{
                padding: '20px 24px',
                fontSize: 13, fontWeight: 600,
                color: '#d4caff',
                fontFamily: FONT_SANS,
                display: 'flex', alignItems: 'center',
                background: 'rgba(79,70,255,0.04)',
                borderRight: '1px solid rgba(79,70,255,0.12)',
              }}>
                {row.topic}
              </div>

              {/* ChatGPT value */}
              <div style={{
                padding: '20px 24px',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {/* X mark */}
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'rgba(248,113,113,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 1l6 6M7 1L1 7" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <span style={{
                  fontSize: 14, lineHeight: 1.5,
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: FONT_SANS,
                }}>
                  {row.chatgpt}
                </span>
              </div>

              {/* Lens value */}
              <div style={{
                padding: '20px 24px',
                borderLeft: '1px solid rgba(79,70,255,0.2)',
                background: 'rgba(79,70,255,0.05)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {/* Check mark */}
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'rgba(52,211,153,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5l2.5 2.5L8 1" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{
                  fontSize: 14, lineHeight: 1.5,
                  color: '#ffffff',
                  fontFamily: FONT_SANS, fontWeight: 500,
                }}>
                  {row.lens}
                </span>
              </div>
            </div>
          ))}

          {/* Footer bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            background: 'rgba(255,255,255,0.02)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ padding: '14px 24px', background: 'rgba(79,70,255,0.04)', borderRight: '1px solid rgba(79,70,255,0.12)' }} />
            <div style={{
              padding: '14px 24px',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              fontSize: 12, color: 'rgba(255,255,255,0.45)',
              fontFamily: FONT_SANS, fontStyle: 'italic',
            }}>
              Great for research
            </div>
            <div style={{
              padding: '14px 24px',
              borderLeft: '1px solid rgba(79,70,255,0.2)',
              background: 'rgba(79,70,255,0.05)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#34d399', animation: 'cvlPulse 2s ease infinite',
              }} />
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: '#34d399', fontFamily: FONT_SANS,
              }}>
                Built for your business
              </span>
            </div>
          </div>
        </div>

        {/* ── Pull quote ── */}
        <p style={{
          textAlign: 'center',
          margin: '40px auto 0',
          maxWidth: 560,
          fontSize: 16,
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.6)',
          fontFamily: FONT_SERIF,
          fontStyle: 'italic',
        }}>
          "The best AI for your business isn't the smartest one — it's the one that already knows you."
        </p>
      </div>

      <style>{`
        .cvl-row:hover {
          background: rgba(255,255,255,0.015) !important;
        }
        @keyframes cvlPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}