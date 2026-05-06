import { useState, useRef, useEffect } from 'react';
import { ArrowRight, ChevronDown, Menu, X, Search } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';

/* ════════════════════════════════════════════════════════════
   NAVIGATION — Delt Capital editorial style
   Navy bar, mono ticker on top, simple text nav, indigo CTA.
   Ported from deltcapital.com layout.
   ════════════════════════════════════════════════════════════ */

const NAVY = '#041E42';
const NAVY_DEEP = '#020E22';
const CREAM = '#F7F5F0';
const INDIGO = '#4945FF';
const INDIGO_SOFT = '#A5B4FC';
const SUCCESS = '#1F845A';

/* ─── Ticker entries (mono) ──────────────────────────── */
const TICKER = [
  { name: 'ROSARIO CON.', amt: '$180K', x: '1.14×', state: 'WIRED' },
  { name: 'BLOOM BTY.',   amt: '$65K',  x: '1.19×', state: 'FUNDED' },
  { name: 'WILLIAMS LOG.',amt: '$80K',  x: '1.17×', state: 'CLOSED' },
  { name: 'WARD MKT.',    amt: '$50K',  x: '1.18×', state: 'WIRED' },
  { name: 'ROBERTS AUTO', amt: '$95K',  x: '1.15×', state: 'CLOSED' },
  { name: 'DELT REST.',   amt: '$110K', x: '1.16×', state: 'CLOSED' },
  { name: 'ALPINE CAFE',  amt: '$42K',  x: '1.20×', state: 'FUNDED' },
  { name: 'KENT SUPPLY',  amt: '$140K', x: '1.13×', state: 'WIRED' },
  { name: 'NORA BAKERY',  amt: '$28K',  x: '1.21×', state: 'FUNDED' },
];

/* ─── Primary nav items (mirrors deltcapital) ───────── */
const NAV_LINKS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Pricing',       href: '/pricing' },
  { label: 'Calculator',    href: '/calculator' },
  { label: 'About',         href: '/about' },
  { label: 'FAQ',           href: '/help-center' },
  { label: 'Talk',          href: '/contact' },
];

/* ─── Solutions dropdown content (preserved) ────────── */
const SOLUTIONS = [
  { label: 'Payments',   href: '/payments',          blurb: 'Card processing with transparent rates.' },
  { label: 'Capital',    href: '/capital',           blurb: 'Revenue-based funding, fast approvals.' },
  { label: 'Websites',   href: '/website-examples',  blurb: 'Built for you in five days.' },
  { label: 'Lens AI',    href: '/lens-ai',           blurb: 'Ask your business in plain English.' },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close menus on route change
  useEffect(() => {
    setSolutionsOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const openSolutions = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSolutionsOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setSolutionsOpen(false), 150);
  };

  return (
    <header className="dc-nav-header">
      {/* ─── Top ticker bar ─────────────────────────── */}
      <div className="dc-ticker-bar">
        <div className="dc-ticker-track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="dc-ticker-item">
              <span className="dc-ticker-name">{t.name}</span>
              <span className="dc-ticker-amt">{t.amt}</span>
              <span className="dc-ticker-x">{t.x}</span>
              <span className="dc-ticker-dot">●</span>
              <span className={`dc-ticker-state dc-ticker-state--${t.state.toLowerCase()}`}>{t.state}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── Main nav row ──────────────────────────── */}
      <div className="dc-nav-row">
        <div className="dc-nav-inner">
          {/* Logo */}
          <Link to="/" className="dc-logo" aria-label="Delt home">
            <span className="dc-logo-mark" aria-hidden>
              <span className="dc-logo-bar dc-logo-bar--cream" />
              <span className="dc-logo-bar dc-logo-bar--indigo" />
            </span>
            <span className="dc-logo-text">
              <span className="dc-logo-text-light">Delt</span>
              <span className="dc-logo-text-indigo">Pay</span>
            </span>
          </Link>

          {/* Center nav */}
          <nav className="dc-nav-center" aria-label="Primary">
            {/* Solutions dropdown */}
            <div
              className="dc-nav-dropdown-wrap"
              onMouseEnter={openSolutions}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                className="dc-nav-link"
                onFocus={openSolutions}
                onBlur={scheduleClose}
                aria-expanded={solutionsOpen}
                aria-haspopup="true"
              >
                Solutions
                <ChevronDown size={14} className="dc-chevron" />
              </button>

              <AnimatePresence>
                {solutionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="dc-dropdown"
                    onMouseEnter={openSolutions}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="dc-dropdown-eyebrow">— FOUR PRODUCTS · ONE STACK</div>
                    <div className="dc-dropdown-grid">
                      {SOLUTIONS.map((s, i) => (
                        <Link key={s.href} to={s.href} className="dc-dropdown-item">
                          <span className="dc-dropdown-num">0{i + 1}</span>
                          <span className="dc-dropdown-body">
                            <span className="dc-dropdown-label">{s.label}</span>
                            <span className="dc-dropdown-blurb">{s.blurb}</span>
                          </span>
                          <ArrowRight size={14} className="dc-dropdown-arrow" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {NAV_LINKS.map((l) => (
              <Link key={l.href} to={l.href} className="dc-nav-link">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="dc-nav-right">
            <button className="dc-nav-icon" aria-label="Search" onClick={() => navigate('/help-center')}>
              <Search size={16} />
            </button>
            <Link to="/sign-in" className="dc-nav-link dc-nav-link--quiet">
              Login
            </Link>
            <Link to="/apply" className="dc-cta">
              Get Funded
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="dc-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ─── Mobile drawer ─────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="dc-mobile-drawer"
          >
            <div className="dc-mobile-eyebrow">— SOLUTIONS</div>
            {SOLUTIONS.map((s) => (
              <Link key={s.href} to={s.href} className="dc-mobile-link">
                {s.label}
              </Link>
            ))}
            <div className="dc-mobile-eyebrow" style={{ marginTop: 24 }}>— LEARN</div>
            {NAV_LINKS.map((l) => (
              <Link key={l.href} to={l.href} className="dc-mobile-link">
                {l.label}
              </Link>
            ))}
            <Link to="/apply" className="dc-cta dc-cta--mobile">
              Get Funded
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .dc-nav-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: ${NAVY};
          border-bottom: 1px solid rgba(247, 245, 240, 0.08);
        }

        /* ─── Ticker ─── */
        .dc-ticker-bar {
          background: ${NAVY_DEEP};
          border-bottom: 1px solid rgba(247, 245, 240, 0.06);
          overflow: hidden;
          height: 26px;
          position: relative;
        }
        .dc-ticker-track {
          display: flex;
          align-items: center;
          gap: 28px;
          height: 100%;
          width: max-content;
          animation: dc-ticker-scroll 100s linear infinite;
          padding-left: 0;
        }
        @keyframes dc-ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .dc-ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px;
          letter-spacing: 0.06em;
          color: rgba(247, 245, 240, 0.55);
          white-space: nowrap;
        }
        .dc-ticker-name { color: rgba(247, 245, 240, 0.85); font-weight: 500; }
        .dc-ticker-amt  { color: rgba(247, 245, 240, 0.95); font-weight: 600; }
        .dc-ticker-x    { color: ${INDIGO_SOFT}; font-weight: 500; }
        .dc-ticker-dot  { color: ${SUCCESS}; font-size: 7px; }
        .dc-ticker-state--wired  { color: ${INDIGO_SOFT}; }
        .dc-ticker-state--funded { color: #6EE7B7; }
        .dc-ticker-state--closed { color: rgba(247, 245, 240, 0.55); }

        /* ─── Main row ─── */
        .dc-nav-row {
          background: ${NAVY};
          padding: 16px 0;
        }
        .dc-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 32px;
        }

        /* Logo */
        .dc-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .dc-logo-mark {
          display: inline-flex;
          align-items: flex-end;
          gap: 3px;
          height: 20px;
        }
        .dc-logo-bar {
          width: 4px;
          border-radius: 1px;
        }
        .dc-logo-bar--cream  { height: 12px; background: ${CREAM}; }
        .dc-logo-bar--indigo { height: 20px; background: ${INDIGO}; }
        .dc-logo-text {
          font-family: 'Manrope', 'Inter Tight', sans-serif;
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.025em;
          line-height: 1;
          display: inline-flex;
          gap: 4px;
        }
        .dc-logo-text-light  { color: ${CREAM}; }
        .dc-logo-text-indigo { color: ${INDIGO_SOFT}; }

        /* Center nav */
        .dc-nav-center {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          justify-content: center;
        }

        .dc-nav-link {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: rgba(247, 245, 240, 0.78);
          padding: 8px 14px;
          background: transparent;
          border: 0;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 150ms ease-out;
          letter-spacing: -0.005em;
          position: relative;
        }
        .dc-nav-link::after {
          content: "";
          position: absolute;
          left: 14px; right: 14px;
          bottom: 4px;
          height: 1px;
          background: ${INDIGO_SOFT};
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 150ms ease-out;
        }
        .dc-nav-link:hover { color: ${CREAM}; }
        .dc-nav-link:hover::after { transform: scaleX(1); }
        .dc-nav-link--quiet { font-weight: 500; }

        .dc-chevron {
          opacity: 0.6;
          transition: transform 150ms ease-out;
        }
        .dc-nav-dropdown-wrap:hover .dc-chevron { transform: rotate(180deg); }

        /* Dropdown */
        .dc-nav-dropdown-wrap {
          position: relative;
        }
        .dc-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: ${NAVY};
          border: 1px solid rgba(247, 245, 240, 0.10);
          border-radius: 6px;
          padding: 20px;
          min-width: 480px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
        }
        .dc-dropdown-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 0.16em;
          color: ${INDIGO_SOFT};
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        .dc-dropdown-grid {
          display: grid;
          gap: 4px;
        }
        .dc-dropdown-item {
          display: grid;
          grid-template-columns: 36px 1fr 16px;
          gap: 12px;
          align-items: center;
          padding: 12px 14px;
          border-radius: 4px;
          text-decoration: none;
          color: ${CREAM};
          transition: background 120ms ease-out;
        }
        .dc-dropdown-item:hover { background: rgba(247, 245, 240, 0.05); }
        .dc-dropdown-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: rgba(247, 245, 240, 0.45);
        }
        .dc-dropdown-body { display: flex; flex-direction: column; gap: 2px; }
        .dc-dropdown-label {
          font-family: 'Manrope', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        .dc-dropdown-blurb {
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          color: rgba(247, 245, 240, 0.6);
          line-height: 1.4;
        }
        .dc-dropdown-arrow { color: ${INDIGO_SOFT}; opacity: 0.7; }

        /* Right cluster */
        .dc-nav-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .dc-nav-icon {
          background: transparent;
          border: 0;
          color: rgba(247, 245, 240, 0.6);
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: color 150ms ease-out, background 150ms ease-out;
        }
        .dc-nav-icon:hover { color: ${CREAM}; background: rgba(247, 245, 240, 0.06); }

        .dc-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: ${INDIGO};
          color: #FFFFFF;
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: -0.005em;
          padding: 9px 16px;
          border-radius: 6px;
          text-decoration: none;
          transition: filter 150ms ease-out, transform 100ms ease-out;
        }
        .dc-cta:hover { filter: brightness(1.1); }
        .dc-cta:active { transform: translateY(0.5px); }

        /* Mobile */
        .dc-mobile-toggle {
          display: none;
          background: transparent;
          border: 0;
          color: ${CREAM};
          cursor: pointer;
          padding: 8px;
        }
        .dc-mobile-drawer {
          background: ${NAVY_DEEP};
          padding: 20px 24px 28px;
          border-top: 1px solid rgba(247, 245, 240, 0.08);
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow: hidden;
        }
        .dc-mobile-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${INDIGO_SOFT};
          margin-bottom: 8px;
        }
        .dc-mobile-link {
          color: ${CREAM};
          text-decoration: none;
          font-family: 'Manrope', sans-serif;
          font-size: 17px;
          font-weight: 500;
          padding: 10px 0;
          border-bottom: 1px solid rgba(247, 245, 240, 0.06);
        }
        .dc-cta--mobile {
          margin-top: 20px;
          justify-content: center;
          padding: 14px 16px;
          font-size: 15px;
        }

        @media (max-width: 980px) {
          .dc-nav-center { display: none; }
          .dc-nav-right .dc-nav-link,
          .dc-nav-right .dc-nav-icon { display: none; }
          .dc-mobile-toggle { display: inline-flex; }
        }

        @media (max-width: 640px) {
          .dc-cta { display: none; }
          .dc-ticker-bar { height: 24px; }
        }
      `}</style>
    </header>
  );
}

export default Navigation;
