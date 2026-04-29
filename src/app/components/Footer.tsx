import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { motion, useInView } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import logoImage from 'figma:asset/61527edee0ea2e963bace756584cec3657b62f9e.png';

const NAVY = '#041E42';

/**
 * Detect whether a CSS color string represents a "dark" background.
 * Handles rgb/rgba and #hex inputs returned by getComputedStyle.
 * Returns null when the color is fully transparent so callers can
 * walk further up the tree.
 */
function colorBrightness(input: string): { lum: number; alpha: number } | null {
  if (!input) return null;
  const rgb = input.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const parts = rgb[1].split(',').map((s) => parseFloat(s.trim()));
    const [r, g, b] = parts;
    const a = parts.length === 4 ? parts[3] : 1;
    if (a === 0) return null;
    // Rec. 709 luminance
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return { lum, alpha: a };
  }
  const hex = input.replace('#', '');
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return { lum, alpha: 1 };
  }
  return null;
}

/**
 * Inspect a single element's background (solid + gradient stops).
 * Returns:
 *   true  → element has an opaque dark background
 *   false → element has an opaque light background
 *   null  → element is effectively transparent; caller should keep walking
 */
function inspectElementBg(node: HTMLElement): boolean | null {
  const cs = window.getComputedStyle(node);
  const bg = cs.backgroundColor;
  const parsed = colorBrightness(bg);
  if (parsed && parsed.alpha > 0.05) {
    return parsed.lum < 0.35;
  }
  // Check inline backgroundImage gradient stops crudely.
  const bgImage = cs.backgroundImage;
  if (bgImage && bgImage !== 'none') {
    const stops = bgImage.match(/rgba?\([^)]+\)|#[0-9a-f]{6}/gi) || [];
    let foundOpaque = false;
    let darkVote = 0;
    let lightVote = 0;
    for (const s of stops) {
      const p = colorBrightness(s);
      if (p && p.alpha > 0.05) {
        foundOpaque = true;
        if (p.lum < 0.35) darkVote++;
        else lightVote++;
      }
    }
    if (foundOpaque) return darkVote >= lightVote;
  }
  return null;
}

/**
 * Drill into a subtree to find the visually "last" element with a real
 * background — i.e. what visually butts up against the footer. We walk
 * down via lastElementChild but also scan trailing children for the last
 * one with a non-transparent background. This is needed when a page
 * wraps its content in a transparent <div>, so the footer's previous
 * sibling itself has no background but a nested <section> at the bottom
 * does (e.g. the dark CTA on /lens-ai).
 */
function findLastVisibleBg(root: HTMLElement, depth = 0): boolean | null {
  if (depth > 8) return null;
  // First, check the root element itself.
  const self = inspectElementBg(root);
  if (self !== null) return self;
  // Walk children from the END so we find what visually sits closest
  // to the footer.
  const children = Array.from(root.children) as HTMLElement[];
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    // Skip non-rendered nodes.
    const cs = window.getComputedStyle(child);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const result = findLastVisibleBg(child, depth + 1);
    if (result !== null) return result;
  }
  return null;
}

/**
 * Walk up the DOM from the previous sibling of `el` to find the first
 * element (or descendant) with a non-transparent background, and decide
 * if it's dark.
 */
function prevSectionIsDark(el: HTMLElement | null): boolean {
  if (!el) return false;
  let prev = el.previousElementSibling as HTMLElement | null;
  while (prev) {
    const result = findLastVisibleBg(prev);
    if (result !== null) return result;
    prev = prev.previousElementSibling as HTMLElement | null;
  }
  return false;
}

const socialIcons = [
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/' },
];

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  // Detect on mount + every route change so we adapt to the page above.
  useLayoutEffect(() => {
    if (!ref.current) return;
    setIsDark(prevSectionIsDark(ref.current));
  }, [location.pathname]);

  // Re-check after fonts/images load and on resize, since heights can shift.
  useEffect(() => {
    if (!ref.current) return;
    const recheck = () => setIsDark(prevSectionIsDark(ref.current));
    const t = setTimeout(recheck, 250);
    window.addEventListener('resize', recheck);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', recheck);
    };
  }, [location.pathname]);

  /* Themed tokens */
  const surface = isDark ? NAVY : '#FFFFFF';
  const heading = isDark ? '#FFFFFF' : NAVY;
  const body = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(4,30,66,0.55)';
  const muted = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(4,30,66,0.50)';
  const subtle = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(4,30,66,0.45)';
  const hairline = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(4,30,66,0.10)';
  const underline = isDark ? 'rgba(255,255,255,0.30)' : 'rgba(4,30,66,0.30)';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Note: grid-cols-6 = 1 logo col + 5 link columns */}
          {/* Logo column */}
          <motion.div
            className="col-span-2 md:col-span-3 lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center mb-6">
              <img src={logoImage} alt="Delt" className="h-8 w-auto" />
            </div>
            <p className="text-sm mb-4" style={{ color: body }}>
              Everything you need to run and grow your business.
            </p>
            <address className="text-xs not-italic mb-6" style={{ color: body, lineHeight: 1.6 }}>
              Delt Pay LLC<br />
              2726 NW 72nd Ave<br />
              Miami, FL 33122<br />
              <a href="tel:+18647293358" style={{ color: 'inherit' }} className="hover:underline">(864) 729-3358</a>
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
                    whileHover={{ y: -3, scale: 1.2, color: heading }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links], colIdx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + colIdx * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="font-bold mb-4" style={{ color: heading }}>{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm relative group inline-block transition-colors"
                      style={{ color: body }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = heading; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = body; }}
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-px group-hover:w-full transition-all duration-300" style={{ background: underline }} />
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
            <div className="text-sm" style={{ color: muted }}>
              &copy; 2026 Delt Pay LLC. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              {[
                { label: 'Privacy', path: '/privacy' },
                { label: 'Terms', path: '/terms' },
                { label: 'Sitemap', path: '/sitemap', ariaDisabled: true },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="relative group transition-colors"
                  style={{ color: muted }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = heading; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = muted; }}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-px group-hover:w-full transition-all duration-300" style={{ background: underline }} />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
