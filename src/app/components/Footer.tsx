import { Facebook, Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { motion, useInView } from 'motion/react';
import { useMemo, useRef } from 'react';
import logoImage from 'figma:asset/61527edee0ea2e963bace756584cec3657b62f9e.png';
import logoWhite from 'figma:asset/419e83442bb1bf5965a966a8870b00dd4288dd57.png';

/**
 * Footer — Delt Capital editorial style.
 *
 * - Always renders on a navy or ink surface, with cream type.
 * - DARK_FOOTER_ROUTES picks the deeper ink (#0F0E17) for pages whose
 *   final section is already navy (continuity); other pages fade from
 *   their lighter content into a navy footer for a clean break.
 * - Mono uppercase eyebrows for column headings.
 * - One italic-serif word as accent in the closing CTA.
 */

const NAVY = '#041E42';
const INK = '#0F0E17';
const CREAM = '#F7F5F0';

const DARK_FOOTER_ROUTES = new Set<string>([
  '/',
  '/lens-ai',
  '/business-types',
  '/case-studies',
  '/investor-relations',
  '/website-builder',
  '/how-it-works',
  '/delt-ai',
  '/reviews',
]);

const socialIcons = [
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/' },
];

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const location = useLocation();

  const isDeepInk = useMemo(() => {
    const path = (location.pathname || '/').replace(/\/$/, '') || '/';
    return DARK_FOOTER_ROUTES.has(path);
  }, [location.pathname]);

  /* Editorial palette — always cream-on-dark */
  const surface = isDeepInk ? INK : NAVY;
  const heading = CREAM;
  const body = 'rgba(247,245,240,0.75)';
  const muted = 'rgba(247,245,240,0.55)';
  const subtle = 'rgba(247,245,240,0.45)';
  const hairline = 'rgba(247,245,240,0.10)';
  const hairlineStrong = 'rgba(247,245,240,0.20)';

  const footerLinks = {
    Products: [
      { label: 'Payments', path: '/products' },
      { label: 'Capital', path: '/apply' },
      { label: 'Website Builder', path: '/website-builder' },
      { label: 'Business Tools', path: '/delt-ai' },
    ],
    Solutions: [
      { label: 'Retail', path: '/business-types' },
      { label: 'Restaurants', path: '/business-types' },
      { label: 'Professional Services', path: '/business-types' },
      { label: 'E-commerce', path: '/business-types' },
    ],
    Resources: [
      { label: 'Help Center', path: '/support' },
      { label: 'Blog', path: '/blog' },
      { label: 'Pricing', path: '/pricing' },
    ],
    Company: [
      { label: 'About Us', path: '/about' },
      { label: 'Careers', path: '/careers' },
      { label: 'Contact', path: '/contact-sales' },
    ],
    Legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
    ],
  };

  return (
    <footer
      ref={ref}
      className="relative overflow-hidden transition-colors duration-300"
      style={{ background: surface, color: heading }}
    >
      {/* Top editorial CTA strip */}
      <div
        className="relative z-10"
        style={{ borderBottom: `1px solid ${hairline}` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, ui-monospace, Menlo, monospace',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: subtle,
                  marginBottom: 16,
                }}
              >
                — VOL. I · 2026 · DELT PAY · EST. 2019
              </div>
              <h2
                style={{
                  fontFamily: '"Manrope", "Inter Tight", ui-sans-serif, system-ui, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '-0.035em',
                  lineHeight: 1.05,
                  fontSize: 'clamp(34px, 4vw, 56px)',
                  color: heading,
                  maxWidth: 720,
                }}
              >
                Run it. Grow it.{' '}
                <span
                  style={{
                    fontFamily: '"Source Serif Pro", Georgia, serif',
                    fontStyle: 'italic',
                    fontWeight: 400,
                  }}
                >
                  Fund it.
                </span>
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/contact-sales"
                className="inline-flex items-center gap-2"
                style={{
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#FFFFFF',
                  background: '#4945FF',
                  padding: '12px 18px',
                  borderRadius: 6,
                  transition: 'background-color 150ms ease-out',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#3730A3'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#4945FF'; }}
              >
                Talk to a specialist
                <ArrowRight className="w-4 h-4" strokeWidth={1.6} />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2"
                style={{
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                  fontSize: 13,
                  fontWeight: 500,
                  color: heading,
                  background: 'transparent',
                  padding: '12px 18px',
                  borderRadius: 6,
                  border: `1px solid ${hairlineStrong}`,
                  transition: 'background-color 150ms ease-out, border-color 150ms ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(247,245,240,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(247,245,240,0.40)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = hairlineStrong;
                }}
              >
                See how pricing works
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Logo column */}
          <motion.div
            className="col-span-2 md:col-span-3 lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center mb-6">
              <img src={logoWhite || logoImage} alt="Delt" className="h-8 w-auto" />
            </div>
            <p
              style={{
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 14,
                lineHeight: 1.6,
                color: body,
                marginBottom: 16,
              }}
            >
              Everything you need to run and grow your business.
            </p>
            <address
              className="not-italic mb-6"
              style={{
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 13,
                color: muted,
                lineHeight: 1.7,
              }}
            >
              Delt Pay LLC<br />
              2726 NW 72nd Ave<br />
              Miami, FL 33122<br />
              <a
                href="tel:+18647293358"
                style={{ color: 'inherit' }}
                className="hover:underline"
              >
                (864) 729-3358
              </a>
            </address>
            <div className="flex gap-4">
              {socialIcons.map((social, i) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className="transition-colors"
                    style={{ color: subtle }}
                    aria-label={social.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                    whileHover={{ y: -2, color: heading }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Link columns — mono uppercase eyebrows */}
          {Object.entries(footerLinks).map(([category, links], colIdx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + colIdx * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3
                style={{
                  fontFamily: 'JetBrains Mono, ui-monospace, Menlo, monospace',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: subtle,
                  marginBottom: 18,
                }}
              >
                — {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="dc-footer-link inline-block"
                      style={{
                        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                        fontSize: 14,
                        color: body,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = heading; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = body; }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom row */}
        <motion.div
          className="pt-8"
          style={{ borderTop: `1px solid ${hairline}` }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div
              style={{
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 13,
                color: muted,
              }}
            >
              &copy; 2026 Delt Pay LLC. All rights reserved.
            </div>
            <div className="flex gap-6">
              {[
                { label: 'Privacy', path: '/privacy' },
                { label: 'Terms', path: '/terms' },
                { label: 'Sitemap', path: '/sitemap' },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="dc-footer-link"
                  style={{
                    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                    fontSize: 13,
                    color: muted,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = heading; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = muted; }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
