import { useState, useRef } from 'react';

const NAVY = '#041E42';
const INK = '#0A1430';
const INDIGO = '#4945FF';
const INDIGO_LIGHT = '#A5B4FC';
const CREAM = '#F4F1EA';
const FONT_DISPLAY = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

/* ─── Hero ──────────────────────────────────────────── */
function AuditHero() {
  return (
    <section style={{
      position: 'relative',
      background: `linear-gradient(160deg, ${INK} 0%, #1A1448 55%, #2D1B6B 100%)`,
      color: '#fff',
      padding: '120px 24px 80px',
      overflow: 'hidden',
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 80% 20%, ${INDIGO}33 0%, transparent 50%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 24,
        }}>
          Free statement audit
        </div>
        <h1 style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
          fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.045em',
          margin: 0, paddingBottom: '0.12em',
        }}>
          See what you're{' '}
          <span style={{
            fontStyle: 'italic',
            background: 'linear-gradient(95deg, #6366F1 0%, #A5B4FC 45%, #E9D5FF 85%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            paddingBottom: '0.08em',
          }}>actually paying.</span>
        </h1>
        <p style={{
          fontFamily: FONT_DISPLAY, fontSize: 19, lineHeight: 1.55,
          color: 'rgba(255,255,255,0.72)', maxWidth: 620, marginTop: 24,
        }}>
          Upload last month's processing statement. We'll send back a line-by-line breakdown of every fee, markup, and surcharge — and what the same volume costs on Delt.
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 24, marginTop: 32, flexWrap: 'wrap',
          fontFamily: FONT_DISPLAY, fontSize: 14, color: 'rgba(255,255,255,0.55)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check /> No call required
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check /> Results in 24 hours
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check /> Your statement stays private
          </span>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INDIGO_LIGHT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ─── Upload form ──────────────────────────────────── */
function AuditForm() {
  const [email, setEmail] = useState('');
  const [biz, setBiz] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      alert('File must be under 20 MB');
      return;
    }
    setFile(f);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !biz || !file) return;
    // Email the audit lead + statement attachment to the team. Read the file
    // as a data URL, then fire-and-forget so the UI isn't blocked. If the read
    // fails, still send the lead details without the attachment.
    const post = (fileB64?: string) =>
      fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'audit', email, biz, fileName: file.name, fileB64 }),
      }).catch(() => {});
    const reader = new FileReader();
    reader.onload = () => post(typeof reader.result === 'string' ? reader.result : undefined);
    reader.onerror = () => post(undefined);
    reader.readAsDataURL(file);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section style={{ background: CREAM, padding: '96px 24px' }}>
        <div style={{
          maxWidth: 640, margin: '0 auto', background: '#fff',
          border: '1px solid rgba(10,20,48,0.08)', borderRadius: 16,
          padding: '48px 40px', textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 24px', borderRadius: '50%',
            background: `${INDIGO}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{
            fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 600,
            letterSpacing: '-0.025em', color: INK, margin: 0,
          }}>
            Statement received.
          </h2>
          <p style={{
            fontFamily: FONT_DISPLAY, fontSize: 16, lineHeight: 1.55,
            color: 'rgba(10,20,48,0.65)', marginTop: 12,
          }}>
            We'll have your line-by-line breakdown in your inbox within 24 hours.
            No call, no follow-up unless you want one.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ background: CREAM, padding: '64px 24px 96px' }}>
      <div style={{
        maxWidth: 720, margin: '-72px auto 0', position: 'relative', zIndex: 2,
        background: '#fff', border: '1px solid rgba(10,20,48,0.08)',
        borderRadius: 20, padding: 'clamp(32px, 5vw, 48px)',
        boxShadow: '0 20px 60px rgba(10,20,48,0.08)',
      }}>
        <form onSubmit={handleSubmit}>
          <Label>Email</Label>
          <Input
            type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourbusiness.com"
          />

          <Label style={{ marginTop: 20 }}>Business name</Label>
          <Input
            type="text" required value={biz}
            onChange={(e) => setBiz(e.target.value)}
            placeholder="Acme Coffee Co."
          />

          <Label style={{ marginTop: 20 }}>Your last processing statement</Label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0] || null);
            }}
            onClick={() => inputRef.current?.click()}
            style={{
              marginTop: 8,
              border: `2px dashed ${dragging ? INDIGO : 'rgba(10,20,48,0.18)'}`,
              borderRadius: 12,
              padding: '32px 24px',
              background: dragging ? `${INDIGO}08` : '#FAFAF7',
              cursor: 'pointer',
              transition: 'border-color 160ms, background 160ms',
              textAlign: 'center',
            }}
          >
            <input
              ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
            {file ? (
              <div>
                <div style={{
                  fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 600, color: INK,
                }}>
                  {file.name}
                </div>
                <div style={{
                  fontFamily: FONT_MONO, fontSize: 11, color: 'rgba(10,20,48,0.5)',
                  marginTop: 4, letterSpacing: '0.05em',
                }}>
                  {(file.size / 1024).toFixed(0)} KB · CLICK TO REPLACE
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  fontFamily: FONT_DISPLAY, fontSize: 15, color: INK, marginBottom: 4,
                }}>
                  Drop a PDF or image here, or click to choose a file
                </div>
                <div style={{
                  fontFamily: FONT_MONO, fontSize: 11, color: 'rgba(10,20,48,0.5)',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  PDF · PNG · JPG · Max 20 MB
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!email || !biz || !file}
            style={{
              marginTop: 32,
              width: '100%',
              background: (!email || !biz || !file) ? 'rgba(73,69,255,0.4)' : INDIGO,
              color: '#fff', border: 'none',
              padding: '18px 28px', borderRadius: 12, cursor: (!email || !biz || !file) ? 'not-allowed' : 'pointer',
              fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em',
              boxShadow: (!email || !biz || !file) ? 'none' : '0 8px 24px rgba(73,69,255,0.28)',
              transition: 'background 160ms, box-shadow 160ms, transform 160ms',
            }}
            onMouseEnter={(e) => {
              if (!email || !biz || !file) return;
              e.currentTarget.style.background = '#5C58FF';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              if (!email || !biz || !file) return;
              e.currentTarget.style.background = INDIGO;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Run my free audit
          </button>

          <p style={{
            fontFamily: FONT_DISPLAY, fontSize: 12, lineHeight: 1.5,
            color: 'rgba(10,20,48,0.45)', textAlign: 'center', marginTop: 16,
          }}>
            We treat your statement like a privileged document. It's never shared, sold, or used to train models.
          </p>
        </form>
      </div>
    </section>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <label style={{
      display: 'block', fontFamily: FONT_MONO, fontSize: 11,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: 'rgba(10,20,48,0.55)', marginBottom: 8, ...style,
    }}>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%', padding: '14px 16px',
        background: '#FAFAF7',
        border: '1px solid rgba(10,20,48,0.12)',
        borderRadius: 10,
        fontFamily: FONT_DISPLAY, fontSize: 16, color: INK,
        outline: 'none', transition: 'border-color 160ms, background 160ms',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = INDIGO;
        e.currentTarget.style.background = '#fff';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'rgba(10,20,48,0.12)';
        e.currentTarget.style.background = '#FAFAF7';
      }}
    />
  );
}

/* ─── What we'll find ──────────────────────────────── */
function WhatWeFind() {
  const items = [
    {
      kicker: 'The markup line',
      title: 'Non-qualified surcharges',
      body: 'The fee your processor charges when a card "doesn\'t qualify" for the rate on your contract. We\'ll show you exactly how often it hits and what it should cost.',
    },
    {
      kicker: 'The silent line',
      title: 'PCI non-compliance fees',
      body: 'Often $20–$40 a month for "non-compliance" with a standard you were never told you had to comply with. We tell you how to fix it or kill it.',
    },
    {
      kicker: 'The hidden line',
      title: 'Annual & batch fees',
      body: 'The one-off charges that show up once a year, once a month, once a batch. Most owners never notice them. We add them up.',
    },
  ];
  return (
    <section style={{ background: '#fff', padding: '96px 24px', borderTop: '1px solid rgba(10,20,48,0.06)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(10,20,48,0.45)', marginBottom: 16,
        }}>
          What we'll find
        </div>
        <h2 style={{
          fontFamily: FONT_DISPLAY, fontSize: 'clamp(1.75rem, 3.6vw, 2.5rem)',
          fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1,
          color: INK, margin: '0 0 48px', maxWidth: 720,
        }}>
          Three lines on your statement that almost always come back overcharged.
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
        }}>
          {items.map((it) => (
            <div key={it.title} style={{
              background: '#FAFAF7', border: '1px solid rgba(10,20,48,0.08)',
              borderRadius: 16, padding: 28,
            }}>
              <div style={{
                fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: INDIGO, marginBottom: 12,
              }}>
                {it.kicker}
              </div>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600,
                letterSpacing: '-0.02em', color: INK, marginBottom: 10,
              }}>
                {it.title}
              </div>
              <p style={{
                fontFamily: FONT_DISPLAY, fontSize: 14, lineHeight: 1.6,
                color: 'rgba(10,20,48,0.65)', margin: 0,
              }}>
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works strip ───────────────────────────── */
function HowItWorks() {
  const steps = [
    { n: '01', t: 'Upload your statement', d: 'Drop a PDF or image. One page or twenty — we read all of it.' },
    { n: '02', t: 'We audit every line', d: 'A real payments analyst, not a chatbot. No call, no pitch.' },
    { n: '03', t: 'Get your number', d: 'A side-by-side: what you pay today vs. what the same volume costs on Delt.' },
  ];
  return (
    <section style={{ background: INK, color: '#fff', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 16,
        }}>
          How it works
        </div>
        <h2 style={{
          fontFamily: FONT_DISPLAY, fontSize: 'clamp(1.75rem, 3.6vw, 2.5rem)',
          fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1,
          color: '#fff', margin: '0 0 56px', maxWidth: 720,
        }}>
          Three steps. Twenty-four hours. No phone calls.
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 32,
        }}>
          {steps.map((s) => (
            <div key={s.n}>
              <div style={{
                fontFamily: FONT_MONO, fontSize: 13, letterSpacing: '0.08em',
                color: INDIGO_LIGHT, marginBottom: 16,
              }}>
                {s.n}
              </div>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600,
                letterSpacing: '-0.02em', color: '#fff', marginBottom: 10,
              }}>
                {s.t}
              </div>
              <p style={{
                fontFamily: FONT_DISPLAY, fontSize: 15, lineHeight: 1.6,
                color: 'rgba(255,255,255,0.65)', margin: 0,
              }}>
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Page export ──────────────────────────────────── */
export function AuditPage() {
  return (
    <main style={{ background: CREAM }}>
      <AuditHero />
      <AuditForm />
      <WhatWeFind />
      <HowItWorks />
    </main>
  );
}
