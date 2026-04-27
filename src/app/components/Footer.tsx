import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import logoImage from 'figma:asset/61527edee0ea2e963bace756584cec3657b62f9e.png';

const NAVY = '#041E42';

const socialIcons = [
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/' },
];

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const footerLinks = {
    Products: [
      { label: 'Payments', path: '/payments' },
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
    <footer ref={ref} className="relative overflow-hidden" style={{ background: '#FFFFFF', color: NAVY }}>
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
            <p className="text-sm mb-4" style={{ color: 'rgba(4,30,66,0.6)' }}>
              Everything you need to run and grow your business.
            </p>
            <address className="text-xs not-italic mb-6" style={{ color: 'rgba(4,30,66,0.55)', lineHeight: 1.6 }}>
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
                    style={{ color: 'rgba(4,30,66,0.45)' }}
                    aria-label={social.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                    whileHover={{ y: -3, scale: 1.2, color: NAVY }}
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
              <h3 className="font-bold mb-4" style={{ color: NAVY }}>{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm relative group inline-block transition-colors"
                      style={{ color: 'rgba(4,30,66,0.55)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = NAVY; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(4,30,66,0.55)'; }}
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-px group-hover:w-full transition-all duration-300" style={{ background: 'rgba(4,30,66,0.3)' }} />
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
          style={{ borderTop: '1px solid rgba(4,30,66,0.1)' }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm" style={{ color: 'rgba(4,30,66,0.5)' }}>
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
                  style={{ color: 'rgba(4,30,66,0.5)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = NAVY; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(4,30,66,0.5)'; }}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-px group-hover:w-full transition-all duration-300" style={{ background: 'rgba(4,30,66,0.3)' }} />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
