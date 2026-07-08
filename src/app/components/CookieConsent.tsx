import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CONSENT_EVENT,
  OPEN_EVENT,
  getChoice,
  initConsent,
  setChoice,
  type ConsentRecord,
} from '@/lib/consent';

/* ════════════════════════════════════════════════════════════
   COOKIE CONSENT BANNER — Delt brand.
   A clean, on-brand card pinned bottom-left (EN/ES). Cookie icon,
   Accept all (indigo) + Decline (ghost) buttons, and an embedded
   "Cookie & Privacy Policy" link in the agree text that points at
   the on-site policy (#/privacy) as a real href and SPA-navigates
   on click.

   The consent CORE (persistence, events, pixel gating, the public
   window.DeltConsent API) lives in @/lib/consent. This component is
   only the UI: it shows when the visitor hasn't decided, hides on a
   decision, and reopens on window.DeltConsent.open().
   ════════════════════════════════════════════════════════════ */

const INDIGO = '#4945FF';
const INDIGO_DEEP = '#3730A3';
const NAVY = '#080A28';

type Lang = 'en' | 'es';

interface Copy {
  title: string;
  bodyBefore: string;
  linkText: string;
  bodyAfter: string;
  accept: string;
  decline: string;
}

const COPY: Record<Lang, Copy> = {
  en: {
    title: 'We use cookies',
    bodyBefore:
      'We use cookies to run this site, remember your preferences, and measure our marketing. You can accept or decline non-essential cookies. See our ',
    linkText: 'Cookie & Privacy Policy',
    bodyAfter: '.',
    accept: 'Accept all',
    decline: 'Decline',
  },
  es: {
    title: 'Usamos cookies',
    bodyBefore:
      'Usamos cookies para hacer funcionar este sitio, recordar tus preferencias y medir nuestro marketing. Puedes aceptar o rechazar las cookies no esenciales. Consulta nuestra ',
    linkText: 'Política de Cookies y Privacidad',
    bodyAfter: '.',
    accept: 'Aceptar todo',
    decline: 'Rechazar',
  },
};

function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  const nav = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
  return nav.toLowerCase().startsWith('es') ? 'es' : 'en';
}

/** Route the "Cookie & Privacy Policy" link points at (HashRouter). */
const PRIVACY_HREF = '#/privacy';

export function CookieConsent() {
  const navigate = useNavigate();
  const [lang] = useState<Lang>(detectLang);
  // Only decide visibility on the client, after we can read storage.
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Boot the consent core (idempotent): registers the gating
    // listener and publishes window.DeltConsent.
    initConsent();

    // Show on first visit (no stored choice).
    if (getChoice() === null) setVisible(true);

    // Reopen when asked (footer "Cookie preferences" link, API).
    const onOpen = () => setVisible(true);
    // Hide as soon as a decision lands (covers set() from anywhere).
    const onDecision = (e: Event) => {
      const detail = (e as CustomEvent<ConsentRecord>).detail;
      if (detail?.choice) setVisible(false);
    };

    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener(CONSENT_EVENT, onDecision as EventListener);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener(CONSENT_EVENT, onDecision as EventListener);
    };
  }, []);

  // Move focus into the banner when it appears for keyboard/AT users.
  useEffect(() => {
    if (visible) cardRef.current?.focus();
  }, [visible]);

  if (!visible) return null;

  const t = COPY[lang];

  const handlePolicyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Real href for accessibility / new-tab, but SPA-navigate on a
    // plain click so we don't hard-reload the app.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate('/privacy');
  };

  return (
    <div
      ref={cardRef}
      className="delt-cookie"
      role="dialog"
      aria-modal="false"
      aria-label={t.title}
      tabIndex={-1}
    >
      <div className="delt-cookie__head">
        <span className="delt-cookie__icon" aria-hidden="true">
          {/* Inline cookie glyph — self-contained, no icon dep. */}
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff"
               strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z" />
            <path d="M8.5 8.5v.01M15 9.5v.01M9.5 14.5v.01M14 14v.01M12 12v.01" />
          </svg>
        </span>
        <h2 className="delt-cookie__title">{t.title}</h2>
      </div>

      <p className="delt-cookie__body">
        {t.bodyBefore}
        <a
          href={PRIVACY_HREF}
          className="delt-cookie__link"
          onClick={handlePolicyClick}
        >
          {t.linkText}
        </a>
        {t.bodyAfter}
      </p>

      <div className="delt-cookie__actions">
        <button
          type="button"
          className="delt-cookie__btn delt-cookie__btn--accept"
          onClick={() => setChoice('accepted')}
        >
          {t.accept}
        </button>
        <button
          type="button"
          className="delt-cookie__btn delt-cookie__btn--decline"
          onClick={() => setChoice('declined')}
        >
          {t.decline}
        </button>
      </div>

      <style>{`
        .delt-cookie {
          position: fixed;
          left: 20px;
          bottom: 20px;
          z-index: 9998;
          width: min(400px, calc(100vw - 40px));
          box-sizing: border-box;
          padding: 22px 22px 20px;
          background: #ffffff;
          border: 1px solid rgba(4, 30, 66, 0.08);
          border-radius: 18px;
          box-shadow: 0 18px 48px rgba(8, 10, 40, 0.22), 0 2px 8px rgba(8, 10, 40, 0.08);
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
          color: ${NAVY};
          animation: delt-cookie-in 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .delt-cookie:focus { outline: none; }

        .delt-cookie__head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .delt-cookie__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: ${INDIGO};
          flex: 0 0 auto;
        }
        .delt-cookie__title {
          font-family: 'Manrope', 'Inter', sans-serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.015em;
          margin: 0;
          color: ${NAVY};
        }

        .delt-cookie__body {
          font-size: 14px;
          line-height: 1.55;
          color: #425466;
          margin: 0 0 18px;
        }
        .delt-cookie__link {
          color: ${INDIGO};
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .delt-cookie__link:hover { color: ${INDIGO_DEEP}; }

        .delt-cookie__actions {
          display: flex;
          gap: 10px;
        }
        .delt-cookie__btn {
          appearance: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          border-radius: 12px;
          padding: 11px 18px;
          transition: background 150ms ease, border-color 150ms ease, color 150ms ease, transform 120ms ease;
        }
        .delt-cookie__btn:active { transform: translateY(1px); }
        .delt-cookie__btn:focus-visible {
          outline: 2px solid ${INDIGO};
          outline-offset: 2px;
        }
        .delt-cookie__btn--accept {
          flex: 1 1 auto;
          background: ${INDIGO};
          color: #ffffff;
        }
        .delt-cookie__btn--accept:hover { background: ${INDIGO_DEEP}; }
        .delt-cookie__btn--decline {
          flex: 0 0 auto;
          background: #ffffff;
          color: ${NAVY};
          border: 1px solid rgba(4, 30, 66, 0.18);
        }
        .delt-cookie__btn--decline:hover { background: rgba(4, 30, 66, 0.04); }

        @keyframes delt-cookie-in {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .delt-cookie { animation: none; }
        }
        @media (max-width: 520px) {
          .delt-cookie { left: 12px; right: 12px; bottom: 12px; width: auto; }
        }
      `}</style>
    </div>
  );
}

export default CookieConsent;
