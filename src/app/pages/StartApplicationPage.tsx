import { useNavigate } from 'react-router';
import { JOTFORM_APP_URL } from '../lib/jotform';

const NAVY   = '#041E42';
const INDIGO = '#4945FF';
const JAK    = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

/**
 * StartApplicationPage — branded interstitial shown when a visitor clicks
 * "Get Started" or "Get a quote". Explains what's coming, then hands off to
 * the secure Jotform merchant application in a new tab.
 */
export function StartApplicationPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: JAK,
        background: 'linear-gradient(180deg, #EEF1F8 0%, #F6F7FB 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      {/* Pill badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 18px',
          borderRadius: 999,
          background: 'rgba(73,69,255,0.08)',
          color: INDIGO,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.01em',
          marginBottom: 24,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        Quick &amp; Easy Application
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: JAK,
          fontSize: 46,
          fontWeight: 800,
          color: NAVY,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        Get Started with DeltPay
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 18,
          color: '#5B6472',
          textAlign: 'center',
          maxWidth: 620,
          margin: '18px 0 0',
          lineHeight: 1.6,
        }}
      >
        Complete our secure form and we'll have you processing payments within 24 hours
      </p>

      {/* Card */}
      <div
        style={{
          marginTop: 40,
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 16px 60px rgba(4,30,66,0.08)',
          border: '1px solid rgba(4,30,66,0.06)',
          padding: '56px 48px',
          maxWidth: 720,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 17,
            color: '#3B4453',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto 36px',
          }}
        >
          You'll be taken to our secure application form to provide your business and
          owner information. Have your bank details and documents ready.
        </p>

        <button
          onClick={() => window.open(JOTFORM_APP_URL, '_blank', 'noopener,noreferrer')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '16px 40px',
            borderRadius: 12,
            background: INDIGO,
            color: '#fff',
            fontFamily: JAK,
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s, transform 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#3510d4'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = INDIGO; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Complete Application
        </button>

        <div style={{ marginTop: 28, fontSize: 13, color: '#9AA2B1' }}>
          Opens in a new tab · Secure form by JotForm
        </div>
      </div>

      {/* Back link */}
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: 32,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#5B6472',
          fontFamily: JAK,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        ← Back to home
      </button>
    </div>
  );
}
