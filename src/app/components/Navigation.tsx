import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, X, ArrowRight, Globe, CreditCard, DollarSign, BarChart3,
  Star, User, AlignLeft, HelpCircle, LayoutDashboard, Calculator,
  ChevronDown, Menu, Globe2, ShieldAlert, Monitor,
} from 'lucide-react';
import deltLogoOnDark from '@/assets/delt-logo-on-dark.svg';
import deltLogoOnLight from '@/assets/delt-logo-on-light.svg';

/* ──────────────────────────────────────────────────────────────
   Navigation — Delt Capital chrome + full DeltPay mega-menus
   ────────────────────────────────────────────────────────────── */

/* Top ticker entries */
const TICKER = [
  '$110K  1.16×  • CLOSED',
  'ROSARIO CON.   $180K  1.14×  • WIRED',
  'BLOOM BTY.    $65K   1.19×  • FUNDED',
  'WILLIAMS LOG.  $80K   1.17×  • CLOSED',
  'WARD MKT.     $50K   1.18×  • WIRED',
  'ROBERTS AUTO  $95K   1.15×  • CLOSED',
  'DELT REST.    $110K  1.16×  • CLOSED',
  'ALPINE CAFE   $42K   1.20×  • FUNDED',
  'KENT SUPPLY   $140K  1.13×  • WIRED',
];

/* ── Solutions / Products mega-menu ── */
const productsCore = [
  { label: 'Payments',  description: 'In-store, online & mobile payment processing',  href: '/payments',         icon: CreditCard },
  { label: 'Capital',   description: 'Revenue-based funding with fast approvals',     href: '/capital',          icon: DollarSign },
  { label: 'Websites',  description: 'Professional websites built and managed for you', href: '/website-examples', icon: Globe },
  { label: 'Lens AI',   description: 'Ask your business questions in plain English',  href: '/lens-ai',          icon: BarChart3 },
];

const productsSecondary = [
  { label: 'How it works',  href: '/how-it-works' },
  { label: 'Compare plans', href: '/pricing' },
  { label: 'See a demo',    href: '/sandbox' },
  { label: 'Calculator',    href: '/calculator' },
];

/* ── By Business Type mega-menu ── */
const businessTypes = [
  { label: 'Restaurants & Food Service', description: 'POS, online ordering, table management',  href: '/industries/restaurants' },
  { label: 'Retail & E-commerce',        description: 'Inventory, checkout, multi-channel',      href: '/industries/retail' },
  { label: 'Professional Services',      description: 'Invoicing, scheduling, client management', href: '/industries/professional-services' },
  { label: 'Salon & Barber',             description: 'Appointments, memberships, tipping',       href: '/industries/salon-barber' },
  { label: 'Health & Wellness',          description: 'Bookings, memberships, HIPAA-ready',       href: '/industries/health-wellness' },
];

const specialized = [
  { label: 'International / USDT',   description: 'Same-day cross-border, settle in stablecoin',  href: '/solutions/international-usdt',   icon: Globe2 },
  { label: 'High Risk Processing',   description: 'Custom rates for every high-risk vertical',    href: '/solutions/high-risk-processing', icon: ShieldAlert },
];

/* ── Learn mega-menu ── */
const learnLinks = [
  { label: 'About Us',     description: 'Our story, team & mission',           href: '/about',         icon: User },
  { label: 'Blog',         description: 'Insights for growing businesses',     href: '/blog',          icon: AlignLeft },
  { label: 'Reviews',      description: 'What merchants are saying',           href: '/reviews',       icon: Star },
  { label: 'Case Studies', description: 'Real stories. Real numbers.',         href: '/case-studies',  icon: AlignLeft },
  { label: 'Careers',      description: 'Join the team',                       href: '/careers',       icon: User },
];

/* ── Support dropdown ── */
const supportLinks = [
  { label: 'Help Center',        description: 'Common questions answered',     href: '/help-center', icon: HelpCircle },
  { label: 'Contact & Support',  description: 'Sales, support, partnerships',  href: '/contact',     icon: CreditCard },
];

/* Mono eyebrow */
function MonoEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[10px] tracking-[0.18em] mb-3 pl-0.5"
      style={{
        fontFamily: 'var(--dc-font-mono)',
        color: 'var(--dc-on-light-subtle)',
        textTransform: 'uppercase',
      }}
    >
      — {children}
    </div>
  );
}

/* ── Logo ──
   Single Delt wordmark SVG (the only brand logo on the site). Two
   variants: white-on-dark for navy/hero surfaces, navy-on-light for
   light surfaces. The asset itself includes the indigo accent bar +
   dot, so we just render it as <img>. Height is the only knob: 28px
   in the 64px header keeps it legible without dominating the row. */
function DeltPayLogo({ onDark = true }: { onDark?: boolean }) {
  return (
    <img
      src={onDark ? deltLogoOnDark : deltLogoOnLight}
      alt="Delt"
      width={undefined}
      height={28}
      style={{
        display: 'block',
        height: 28,
        width: 'auto',
        // Slight optical adjust: the mark sits with generous internal
        // top-padding in the SVG; pull it up a hair so it visually
        // aligns with the nav row baseline.
        marginTop: -1,
      }}
      draggable={false}
    />
  );
}

/* ── Mega-menu container ── */
function MegaPanel({ children, width = 920 }: { children: React.ReactNode; width?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-[60]"
      style={{ width }}
    >
      <div
        className="rounded-[10px] overflow-hidden"
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(4, 30, 66, 0.10)',
          boxShadow: '0 24px 72px rgba(4, 30, 66, 0.18), 0 4px 12px rgba(4, 30, 66, 0.06)',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/* ── Mega item link ── */
function MegaItem({
  label, description, href, icon: Icon, badge,
}: {
  label: string;
  description?: string;
  href: string;
  icon?: any;
  badge?: string;
}) {
  return (
    <Link
      to={href}
      className="group flex items-start gap-3 p-3 -m-1 rounded-[6px] transition-colors"
      style={{ }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(73, 69, 255, 0.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {Icon && (
        <div
          className="flex-shrink-0 mt-0.5 h-8 w-8 rounded-[6px] flex items-center justify-center"
          style={{ background: 'rgba(4, 30, 66, 0.05)' }}
        >
          <Icon size={16} color="#041E42" strokeWidth={1.75} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div
            className="text-[14px] font-semibold leading-tight"
            style={{ color: '#041E42', fontFamily: 'var(--dc-font-display)' }}
          >
            {label}
          </div>
          {badge && (
            <span
              className="px-1.5 py-0.5 rounded-[4px] text-[9px] tracking-[0.14em]"
              style={{
                fontFamily: 'var(--dc-font-mono)',
                background: 'rgba(73, 69, 255, 0.10)',
                color: '#3730A3',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {description && (
          <div
            className="mt-1 text-[12px] leading-[1.45]"
            style={{ color: '#697386', fontFamily: 'var(--dc-font-body)' }}
          >
            {description}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ── Top-level dropdown trigger button ── */
function NavTrigger({
  label, open, onEnter, onLeave,
}: {
  label: string;
  open: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="inline-flex items-center gap-1 text-[13px] font-medium tracking-[-0.005em] transition-colors px-1 py-2"
      style={{
        color: open ? '#FFFFFF' : 'rgba(247, 245, 240, 0.78)',
        fontFamily: 'var(--dc-font-body)',
      }}
    >
      {label}
      <ChevronDown
        size={12}
        style={{
          transition: 'transform 200ms',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          opacity: 0.6,
        }}
      />
    </button>
  );
}

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState<null | 'products' | 'biz' | 'resources'>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const closeTimer = useRef<number | null>(null);

  const openWithCancel = (m: typeof openMenu) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenMenu(m);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 140);
  };

  // Close on route change
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname]);

  /* ── Liquid-glass mode: ON only while a hero section sits behind the nav.
     We watch every [data-hero-section] element. As long as any of them is
     still overlapping the top 80px of the viewport (where the sticky nav
     lives), we render the translucent glass. Once the hero scrolls out, we
     flip to solid #041E42. Re-runs on every route change so newly-mounted
     hero sections (or pages without one) are picked up immediately. */
  const [overHero, setOverHero] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let frame = 0;
    const computeOverHero = () => {
      frame = 0;
      const heroes = document.querySelectorAll<HTMLElement>('[data-hero-section]');
      if (heroes.length === 0) {
        setOverHero(false);
        return;
      }
      // Glass while any hero still covers the top 80px slab the nav occupies.
      let anyBehind = false;
      heroes.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < 80 && r.bottom > 0) anyBehind = true;
      });
      setOverHero(anyBehind);
    };
    const onScrollOrResize = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(computeOverHero);
    };
    // Initial check after the page settles (hero may mount one frame later).
    const initial = window.requestAnimationFrame(computeOverHero);
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.cancelAnimationFrame(initial);
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [location.pathname]);

  const glassStyle: React.CSSProperties = {
    // Liquid glass: nearly clear, the backdrop blur does the work. Just
    // a whisper of tint to keep text legible over the bright shader
    // peaks, plus a hairline divider so the bar separates from content.
    background:
      'linear-gradient(180deg, rgba(4, 30, 66, 0.18) 0%, rgba(4, 30, 66, 0.08) 100%)',
    backdropFilter: 'blur(22px) saturate(160%)',
    WebkitBackdropFilter: 'blur(22px) saturate(160%)',
    borderBottom: '1px solid rgba(247, 245, 240, 0.06)',
    boxShadow: 'inset 0 1px 0 rgba(247, 245, 240, 0.05)',
  };
  const solidStyle: React.CSSProperties = {
    background: '#080A28',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    borderBottom: '1px solid rgba(247, 245, 240, 0.08)',
    boxShadow: 'none',
  };

  return (
    <header
      className="dc-nav-header sticky top-0 z-50"
      style={{
        ...(overHero ? glassStyle : solidStyle),
        transition: 'background 220ms ease, backdrop-filter 220ms ease, border-color 220ms ease, box-shadow 220ms ease',
      }}
    >
      {/* Main nav row */}
      <nav
        className="relative"
        style={{
          height: 64,
        }}
      >
        <div className="mx-auto h-full flex items-center justify-between gap-6 px-6 lg:px-10 max-w-[1400px]">
          {/* Logo */}
          <Link to="/" className="flex items-center" aria-label="DeltPay home">
            <DeltPayLogo onDark />
          </Link>

          {/* Center menu (desktop) */}
          <div
            className="hidden lg:flex items-center gap-7 relative"
            onMouseLeave={scheduleClose}
          >
            {/* PRODUCTS */}
            <div
              className="relative"
              onMouseEnter={() => openWithCancel('products')}
            >
              <NavTrigger
                label="Products"
                open={openMenu === 'products'}
                onEnter={() => openWithCancel('products')}
                onLeave={() => {}}
              />
              <AnimatePresence>
                {openMenu === 'products' && (
                  <MegaPanel width={760}>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 p-6">
                      <div>
                        <MonoEyebrow>CORE PRODUCTS</MonoEyebrow>
                        <div className="space-y-1.5">
                          {productsCore.map((it) => (
                            <MegaItem key={it.label} {...it} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <MonoEyebrow>EXPLORE</MonoEyebrow>
                        <div className="space-y-1">
                          {productsSecondary.map((it) => (
                            <Link
                              key={it.label}
                              to={it.href}
                              className="group flex items-center justify-between p-3 -m-1 rounded-[6px] transition-colors"
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(73, 69, 255, 0.05)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <span
                                className="text-[14px] font-medium"
                                style={{ color: '#041E42', fontFamily: 'var(--dc-font-display)' }}
                              >
                                {it.label}
                              </span>
                              <ArrowRight size={14} color="#4945FF" style={{ opacity: 0.5 }} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div
                      className="px-6 py-4 flex items-center justify-between"
                      style={{
                        background: 'rgba(73, 69, 255, 0.05)',
                        borderTop: '1px solid rgba(4, 30, 66, 0.06)',
                      }}
                    >
                      <span
                        className="text-[11px] tracking-[0.14em]"
                        style={{
                          fontFamily: 'var(--dc-font-mono)',
                          color: 'var(--dc-on-light-subtle)',
                          textTransform: 'uppercase',
                        }}
                      >
                        — NEW · Median time to funds 24h
                      </span>
                      <Link
                        to="/get-a-quote"
                        className="dc-btn-primary"
                      >
                        Get Funded
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </MegaPanel>
                )}
              </AnimatePresence>
            </div>

            {/* BY BUSINESS TYPE */}
            <div
              className="relative"
              onMouseEnter={() => openWithCancel('biz')}
            >
              <NavTrigger
                label="By business"
                open={openMenu === 'biz'}
                onEnter={() => openWithCancel('biz')}
                onLeave={() => {}}
              />
              <AnimatePresence>
                {openMenu === 'biz' && (
                  <MegaPanel width={860}>
                    <div className="grid grid-cols-[1.3fr_1fr] gap-8 p-6">
                      <div>
                        <MonoEyebrow>BY INDUSTRY</MonoEyebrow>
                        <div className="space-y-1.5">
                          {businessTypes.map((it) => (
                            <MegaItem key={it.label} {...it} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <MonoEyebrow>SPECIALIZED</MonoEyebrow>
                        <div className="space-y-1.5">
                          {specialized.map((it) => (
                            <MegaItem key={it.label} {...it} />
                          ))}
                        </div>
                        <div
                          className="mt-5 pt-5"
                          style={{ borderTop: '1px solid rgba(4, 30, 66, 0.08)' }}
                        >
                          <Link
                            to="/business-types"
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium"
                            style={{ color: '#4945FF', fontFamily: 'var(--dc-font-body)' }}
                          >
                            See all business types
                            <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </MegaPanel>
                )}
              </AnimatePresence>
            </div>

            {/* HARDWARE (plain link — shoppable, kept separate from software products) */}
            <Link
              to="/hardware"
              className="text-[13px] font-medium tracking-[-0.005em] px-1 py-2 transition-colors"
              style={{
                color: 'rgba(247, 245, 240, 0.78)',
                fontFamily: 'var(--dc-font-body)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 240, 0.78)')}
            >
              Hardware
            </Link>

            {/* RESOURCES — merged Learn + Support into one menu to trim the
                top-level bar from 6 items to 4. Two labeled columns: editorial
                "Learn" links on the left, "Help & contact" on the right. */}
            <div
              className="relative"
              onMouseEnter={() => openWithCancel('resources')}
            >
              <NavTrigger
                label="Resources"
                open={openMenu === 'resources'}
                onEnter={() => openWithCancel('resources')}
                onLeave={() => {}}
              />
              <AnimatePresence>
                {openMenu === 'resources' && (
                  <MegaPanel width={820}>
                    <div className="grid grid-cols-[1.35fr_1fr] gap-8 p-6">
                      <div>
                        <MonoEyebrow>LEARN</MonoEyebrow>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          {learnLinks.map((it) => (
                            <MegaItem key={it.label} {...it} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <MonoEyebrow>HELP &amp; CONTACT</MonoEyebrow>
                        <div className="space-y-1.5">
                          {supportLinks.map((it) => (
                            <MegaItem key={it.label} {...it} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div
                      className="px-6 py-4 flex items-center justify-end"
                      style={{
                        background: 'rgba(73, 69, 255, 0.05)',
                        borderTop: '1px solid rgba(4, 30, 66, 0.06)',
                      }}
                    >
                      <Link to="/calculator" className="dc-btn-secondary">
                        Run the calculator
                      </Link>
                    </div>
                  </MegaPanel>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="h-9 w-9 rounded-full flex items-center justify-center transition-colors"
              style={{ color: 'rgba(247, 245, 240, 0.7)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(247, 245, 240, 0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Search size={16} />
            </button>
            {/* Pricing moved out of the center menu to sit beside the CTA —
                it's a high-intent, conversion-adjacent link, so it belongs
                next to "Get Started" rather than buried among the browse menus. */}
            <Link
              to="/pricing"
              className="text-[13px] font-medium px-3 py-2 transition-colors"
              style={{
                color: 'rgba(247, 245, 240, 0.78)',
                fontFamily: 'var(--dc-font-body)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 240, 0.78)')}
            >
              Pricing
            </Link>
            <Link
              to="/signin"
              className="text-[13px] font-medium px-3 py-2 transition-colors"
              style={{
                color: 'rgba(247, 245, 240, 0.78)',
                fontFamily: 'var(--dc-font-body)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 240, 0.78)')}
            >
              Login
            </Link>
            <Link to="/get-a-quote" className="dc-btn-primary">
              Get Started
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="lg:hidden h-10 w-10 rounded-md flex items-center justify-center"
            style={{ color: '#F7F5F0' }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden"
            style={{
              background: '#080A28',
              borderTop: '1px solid rgba(247, 245, 240, 0.08)',
            }}
          >
            <div className="px-6 py-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <MobileSection title="PRODUCTS" links={productsCore.map((p) => ({ label: p.label, href: p.href }))} />
              <MobileSection title="BY BUSINESS"
                links={[
                  ...businessTypes.map((b) => ({ label: b.label, href: b.href })),
                  ...specialized.map((s) => ({ label: s.label, href: s.href })),
                  { label: 'See all business types', href: '/business-types' },
                ]}
              />
              <MobileSection title="LEARN" links={learnLinks.map((l) => ({ label: l.label, href: l.href }))} />
              <MobileSection title="SUPPORT" links={supportLinks.map((s) => ({ label: s.label, href: s.href }))} />
              <MobileSection title="MORE"
                links={[
                  { label: 'Hardware',    href: '/hardware' },
                  { label: 'Pricing',     href: '/pricing' },
                  { label: 'Calculator',  href: '/calculator' },
                  { label: 'How it works',href: '/how-it-works' },
                  { label: 'See a demo',  href: '/sandbox' },
                ]}
              />
              <div className="pt-4 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(247, 245, 240, 0.08)' }}>
                <Link to="/signin" className="dc-btn-secondary dc-on-dark dc-lg w-full justify-center">Login</Link>
                <Link to="/get-a-quote" className="dc-btn-primary dc-lg w-full justify-center">
                  Get Started <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[80] flex items-start justify-center pt-24 px-6"
            style={{ background: 'rgba(2, 14, 34, 0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSearchOpen(false)}
          >
            <div
              className="w-full max-w-[640px] rounded-[10px] p-2"
              style={{ background: '#FFFFFF', boxShadow: '0 30px 80px rgba(0,0,0,0.4)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <Search size={18} color="#697386" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/help-center?q=${encodeURIComponent(searchQuery)}`);
                      setSearchOpen(false);
                    }
                    if (e.key === 'Escape') setSearchOpen(false);
                  }}
                  placeholder="Search products, industries, help…"
                  className="flex-1 outline-none text-[15px]"
                  style={{ fontFamily: 'var(--dc-font-body)', color: '#041E42' }}
                />
                <span
                  className="text-[10px] tracking-[0.14em] px-2 py-1 rounded"
                  style={{
                    fontFamily: 'var(--dc-font-mono)',
                    color: '#697386',
                    background: 'rgba(4,30,66,0.05)',
                  }}
                >
                  ESC
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileSection({
  title, links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div
        className="text-[10px] tracking-[0.18em] mb-3"
        style={{
          fontFamily: 'var(--dc-font-mono)',
          color: 'rgba(247, 245, 240, 0.5)',
        }}
      >
        — {title}
      </div>
      <div className="flex flex-col">
        {links.map((l) => (
          <Link
            key={l.label}
            to={l.href}
            className="py-2 text-[15px]"
            style={{ color: '#F7F5F0', fontFamily: 'var(--dc-font-display)', fontWeight: 500 }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Navigation;
