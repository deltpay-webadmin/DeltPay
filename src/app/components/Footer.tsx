import { Link, useLocation } from 'react-router';
import deltLogoOnDark from '@/assets/delt-logo-on-dark.svg';
import deltInstagramQR from '@/assets/delt-instagram-qr.png';

/* ════════════════════════════════════════════════════════════
   FOOTER — Delt Capital editorial style.
   Navy surface, logo + tagline left, three minimal columns,
   thin hairline rule, legal row at the bottom.
   ════════════════════════════════════════════════════════════ */

const NAVY = '#080A28';
const CREAM = '#F7F5F0';
const INDIGO_SOFT = '#A5B4FC';

const PRODUCT = [
  { label: 'Payments',           href: '/payments' },
  { label: 'Capital',            href: '/capital' },
  { label: 'Websites',           href: '/website-examples' },
  { label: 'Lens AI',            href: '/lens-ai' },
  { label: 'International / USDT', href: '/solutions/international-usdt' },
  { label: 'High Risk',          href: '/solutions/high-risk-processing' },
  { label: 'Pricing',            href: '/pricing' },
  { label: 'Calculator',         href: '/calculator' },
];

const BUSINESS = [
  { label: 'Restaurants',           href: '/industries/restaurants' },
  { label: 'Retail & E-commerce',   href: '/industries/retail' },
  { label: 'Professional Services', href: '/industries/professional-services' },
  { label: 'Salon & Barber',        href: '/industries/salon-barber' },
  { label: 'Health & Wellness',     href: '/industries/health-wellness' },
  { label: 'See all',               href: '/business-types' },
];

const COMPANY = [
  { label: 'About',           href: '/about' },
  { label: "What's New",      href: '/whats-new' },
  { label: 'Reviews',         href: '/reviews' },
  { label: 'Case Studies',    href: '/case-studies' },
  { label: 'Careers',         href: '/careers' },
  { label: 'Contact',         href: '/contact' },
];

const RESOURCES = [
  { label: 'Help Center',  href: '/help-center' },
  { label: 'Blog',         href: '/blog' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Apply',        href: '/apply' },
  { label: 'Get a quote',  href: '/get-a-quote' },
  { label: 'Support',      href: '/support' },
];

export function Footer() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  return (
    <footer className="dc-footer">
      <div className="dc-footer-inner">
        {/* Top — logo + tagline + columns */}
        <div className="dc-footer-grid">
          {/* Brand */}
          <div className="dc-footer-brand">
            <Link to="/" className="dc-footer-logo" aria-label="Delt home">
              {/* Single Delt wordmark — the only brand logo on the site.
                  Footer surface is navy, so we use the on-dark variant. */}
              <img
                src={deltLogoOnDark}
                alt="Delt"
                className="dc-footer-logo-img"
                draggable={false}
              />
            </Link>
            <p className="dc-footer-tagline">
              Run, grow, and{' '}
              <em className="dc-footer-italic">fund</em>{' '}
              your business — one platform, every tool you need.
            </p>
            <p className="dc-footer-meta">
              Powered by <span className="dc-footer-meta-strong">Delt Capital</span>.
              Direct lender. Equal-opportunity finance.
            </p>
          </div>

          {/* Three columns */}
          <div className="dc-footer-col">
            <div className="dc-footer-eyebrow">— PRODUCT</div>
            <ul className="dc-footer-list">
              {PRODUCT.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="dc-footer-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="dc-footer-col">
            <div className="dc-footer-eyebrow">— BY BUSINESS</div>
            <ul className="dc-footer-list">
              {BUSINESS.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="dc-footer-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="dc-footer-col">
            <div className="dc-footer-eyebrow">— COMPANY</div>
            <ul className="dc-footer-list">
              {COMPANY.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="dc-footer-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="dc-footer-col">
            <div className="dc-footer-eyebrow">— RESOURCES</div>
            <ul className="dc-footer-list">
              {RESOURCES.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="dc-footer-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Hairline */}
        <div className="dc-footer-rule" />

        {/* Instagram QR — main page only. Transparent PNG sits directly on
            the navy surface; the @delt.finance wordmark is baked into the
            image, so no caption/container is needed. */}
        {isHome && (
          <a
            href="https://instagram.com/delt.finance"
            target="_blank"
            rel="noopener noreferrer"
            className="dc-footer-qr"
            aria-label="Follow Delt on Instagram (@delt.finance)"
          >
            <img
              src={deltInstagramQR}
              alt="Scan to follow @delt.finance on Instagram"
              className="dc-footer-qr-img"
              draggable={false}
            />
          </a>
        )}

        {/* Bottom row */}
        <div className="dc-footer-bottom">
          <span className="dc-footer-copy">
            © 2026 Delt, Inc.
          </span>
          <div className="dc-footer-legal">
            <Link to="/terms" className="dc-footer-link">Terms of Use</Link>
            <Link to="/privacy" className="dc-footer-link">Privacy Policy</Link>
            <Link to="/contact" className="dc-footer-link">Communications</Link>
          </div>
        </div>
      </div>

      <style>{`
        .dc-footer {
          background: ${NAVY};
          color: ${CREAM};
          padding: 80px 24px 36px;
          border-top: 1px solid rgba(247, 245, 240, 0.06);
        }
        .dc-footer-inner {
          max-width: 1280px;
          margin: 0 auto;
        }
        .dc-footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr;
          gap: 44px;
          margin-bottom: 64px;
        }
        @media (max-width: 1100px) {
          .dc-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 36px;
          }
          .dc-footer-brand { grid-column: span 2; max-width: 600px; }
        }

        /* Brand block */
        .dc-footer-brand { max-width: 360px; }
        .dc-footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 20px;
        }
        /* Single SVG wordmark. Slightly larger than the header (32px vs
           28px) since the footer is a roomier surface and a touch more
           presence reads right — still well under "obnoxious". */
        .dc-footer-logo-img {
          display: block;
          height: 32px;
          width: auto;
        }

        .dc-footer-tagline {
          font-family: 'Manrope', sans-serif;
          font-size: 17px;
          line-height: 1.5;
          letter-spacing: -0.015em;
          color: rgba(247, 245, 240, 0.85);
          margin: 0 0 14px;
          max-width: 320px;
        }
        .dc-footer-italic {
          font-family: 'Source Serif Pro', Georgia, serif;
          font-style: italic;
          font-weight: 400;
          color: ${INDIGO_SOFT};
        }
        .dc-footer-meta {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: rgba(247, 245, 240, 0.5);
          margin: 0;
        }
        .dc-footer-meta-strong { color: rgba(247, 245, 240, 0.78); font-weight: 500; }

        /* Columns */
        .dc-footer-col { display: flex; flex-direction: column; }
        .dc-footer-eyebrow {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(247, 245, 240, 0.55);
          margin-bottom: 18px;
          font-weight: 500;
        }
        .dc-footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dc-footer-link {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: rgba(247, 245, 240, 0.78);
          text-decoration: none;
          transition: color 150ms ease-out;
          letter-spacing: -0.005em;
          display: block;
          padding: 5px 0;
        }
        .dc-footer-link:hover { color: ${CREAM}; }
        @media (max-width: 600px) {
          .dc-footer-link {
            padding: 8px 0;
            min-height: 44px;
            display: flex;
            align-items: center;
          }
          .dc-footer-list {
            gap: 2px;
          }
        }

        /* Rule */
        .dc-footer-rule {
          height: 1px;
          background: rgba(247, 245, 240, 0.10);
          margin-bottom: 24px;
        }

        /* Instagram QR — home page only.
           Transparent PNG, white marks on the navy surface. No container,
           no caption (the @delt.finance wordmark is baked into the image).
           Sized for reliable phone scanning (~160px on desktop, ~140px on
           mobile) — below ~140px most phone cameras struggle. */
        .dc-footer-qr {
          display: inline-block;
          line-height: 0;
          margin: 0 0 28px;
          opacity: 0.95;
          transition: opacity 200ms ease-out, transform 200ms ease-out;
        }
        .dc-footer-qr:hover {
          opacity: 1;
          transform: translateY(-1px);
        }
        .dc-footer-qr-img {
          display: block;
          width: 160px;
          height: auto;
          /* Keeps marks crisp on Retina without smoothing the QR squares. */
          image-rendering: -webkit-optimize-contrast;
        }
        @media (max-width: 600px) {
          .dc-footer-qr-img { width: 140px; }
        }

        /* Bottom row */
        .dc-footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .dc-footer-copy {
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          color: rgba(247, 245, 240, 0.5);
        }
        .dc-footer-legal {
          display: flex;
          gap: 22px;
        }
        .dc-footer-legal .dc-footer-link {
          font-size: 12.5px;
          color: rgba(247, 245, 240, 0.6);
        }

        @media (max-width: 980px) {
          .dc-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          .dc-footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 600px) {
          .dc-footer { padding: 56px 20px 28px; }
          .dc-footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
            margin-bottom: 40px;
          }
          .dc-footer-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </footer>
  );
}

export default Footer;
