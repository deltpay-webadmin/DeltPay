import { Link } from 'react-router';
import { ArrowRight, Home } from 'lucide-react';

/* ─── Design tokens (match Delt brand) ───────────────────────── */
const NAVY   = '#041E42';
const PURPLE = '#4945FF';
const MUTED  = '#475569';

/**
 * 404 fallback. Rendered by the nested <Routes> in App.tsx whenever a URL
 * doesn't match any known route, so unknown links degrade gracefully into a
 * branded "page not found" screen (with the site nav + footer still around it)
 * instead of an empty body.
 */
export function NotFoundPage() {
  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        background: '#fff',
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: PURPLE,
          marginBottom: 16,
        }}
      >
        Error 404
      </div>

      <h1
        style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 700,
          color: NAVY,
          lineHeight: 1.05,
          margin: 0,
          maxWidth: 640,
        }}
      >
        We couldn&apos;t find that page.
      </h1>

      <p
        style={{
          fontSize: 18,
          color: MUTED,
          marginTop: 18,
          maxWidth: 520,
          lineHeight: 1.55,
        }}
      >
        The link may be broken or the page may have moved. Let&apos;s get you
        back on track.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          justifyContent: 'center',
          marginTop: 36,
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: PURPLE,
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 999,
            padding: '15px 28px',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <Home size={16} /> Back to home
        </Link>

        <Link
          to="/contact"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#fff',
            color: NAVY,
            textDecoration: 'none',
            border: `1px solid ${NAVY}1A`,
            borderRadius: 999,
            padding: '15px 28px',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Contact us <ArrowRight size={16} />
        </Link>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 20px',
          justifyContent: 'center',
          marginTop: 44,
          fontSize: 14,
        }}
      >
        {[
          { label: 'Payments', to: '/payments' },
          { label: 'Capital', to: '/capital' },
          { label: 'Hardware', to: '/hardware' },
          { label: 'Pricing', to: '/pricing' },
          { label: 'Support', to: '/support' },
        ].map((l) => (
          <Link
            key={l.to}
            to={l.to}
            style={{ color: PURPLE, textDecoration: 'none', fontWeight: 500 }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </main>
  );
}

export default NotFoundPage;
