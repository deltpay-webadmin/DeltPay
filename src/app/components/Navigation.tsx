import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, X, ArrowRight, Globe, CreditCard, DollarSign, BarChart3,
  Star, User, AlignLeft, HelpCircle, LayoutDashboard, Calculator,
  ChevronDown, Menu, Globe2, ShieldAlert,
} from 'lucide-react';

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
  { label: 'Lens',      description: 'Ask your business questions in plain English (by Delt)',  href: '/lens-ai',          icon: BarChart3 },
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
  { label: "What's New",   description: 'Product updates & releases',          href: '/whats-new',     icon: Star,         badge: 'LATEST' },
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

/* ── Logo ── */
function DeltPayLogo({ onDark = true }: { onDark?: boolean }) {
  const cream = '#F7F5F0';
  const indigo = '#4945FF';
  return (
    <div className="flex items-center gap-2.5">
      {/* Two-bar mark */}
      <div className="flex items-end gap-[3px]" aria-hidden>
        <span
          className="block rounded-[1px]"
          style={{
            width: 4, height: 16,
            background: onDark ? cream : '#041E42',
          }}
        />
        <span
          className="block rounded-[1px]"
          style={{ width: 4, height: 22, background: indigo }}
        />
      </div>
      <span
        className="font-semibold tracking-[-0.02em] text-[20px]"
        style={{
          fontFamily: 'var(--dc-font-display)',
          color: onDark ? cream : '#041E42',
        }}
      >
        Delt<span style={{ color: indigo }}>Pay</span>
      </span>
    </div>
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

  const [openMenu, setOpenMenu] = useState<null | 'products' | 'biz' | 'learn' | 'support'>(null);
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

  return (
    <header
      className="dc-nav-header sticky top-0 z-50"
      style={{ background: 'var(--dc-bg-navy)' }}
    >
      {/* Top ticker bar */}
      <div
        className="dc-ticker"
        style={{
          background: '#020E22',
          borderBottom: '1px solid rgba(247, 245, 240, 0.08)',
          height: 32,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="flex whitespace-nowrap"
          style={{
            fontFamily: 'var(--dc-font-mono)',
            color: 'rgba(247, 245, 240, 0.55)',
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            animation: 'dc-ticker-scroll 90s linear infinite',
            paddingTop: 10,
            gap: 40,
          }}
        >
          {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span style={{ color: 'rgba(247, 245, 240, 0.8)', fontWeight: 500 }}>
                {t.split('  ')[0]}
              </span>
              <span style={{ color: 'rgba(247, 245, 240, 0.4)' }}>
                {t.split('  ').slice(1).join(' ')}
              </span>
              <span style={{ color: 'rgba(247, 245, 240, 0.25)' }}>·</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes dc-ticker-scroll { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }`}</style>
      </div>

      {/* Main nav row */}
      <nav
        className="relative"
        style={{
          borderBottom: '1px solid rgba(247, 245, 240, 0.08)',
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
                        to="/apply"
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

            {/* LEARN */}
            <div
              className="relative"
              onMouseEnter={() => openWithCancel('learn')}
            >
              <NavTrigger
                label="Learn"
                open={openMenu === 'learn'}
                onEnter={() => openWithCancel('learn')}
                onLeave={() => {}}
              />
              <AnimatePresence>
                {openMenu === 'learn' && (
                  <MegaPanel width={760}>
                    <div className="p-6">
                      <MonoEyebrow>RESOURCES</MonoEyebrow>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {learnLinks.map((it) => (
                          <MegaItem key={it.label} {...it} />
                        ))}
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
                        — VOL. VII · Q2 2026
                      </span>
                      <Link to="/calculator" className="dc-btn-secondary">
                        Run the calculator
                      </Link>
                    </div>
                  </MegaPanel>
                )}
              </AnimatePresence>
            </div>

            {/* SUPPORT */}
            <div
              className="relative"
              onMouseEnter={() => openWithCancel('support')}
            >
              <NavTrigger
                label="Support"
                open={openMenu === 'support'}
                onEnter={() => openWithCancel('support')}
                onLeave={() => {}}
              />
              <AnimatePresence>
                {openMenu === 'support' && (
                  <MegaPanel width={520}>
                    <div className="p-6">
                      <MonoEyebrow>HELP &amp; CONTACT</MonoEyebrow>
                      <div className="space-y-1.5">
                        {supportLinks.map((it) => (
                          <MegaItem key={it.label} {...it} />
                        ))}
                      </div>
                    </div>
                  </MegaPanel>
                )}
              </AnimatePresence>
            </div>

            {/* PRICING (plain link) */}
            <Link
              to="/pricing"
              className="text-[13px] font-medium tracking-[-0.005em] px-1 py-2 transition-colors"
              style={{
                color: 'rgba(247, 245, 240, 0.78)',
                fontFamily: 'var(--dc-font-body)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 240, 0.78)')}
            >
              Pricing
            </Link>
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
            <Link to="/apply" className="dc-btn-primary">
              Get Funded
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
              background: '#041E42',
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
                  { label: 'Pricing',     href: '/pricing' },
                  { label: 'Calculator',  href: '/calculator' },
                  { label: 'How it works',href: '/how-it-works' },
                  { label: 'See a demo',  href: '/sandbox' },
                ]}
              />
              <div className="pt-4 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(247, 245, 240, 0.08)' }}>
                <Link to="/signin" className="dc-btn-secondary dc-on-dark dc-lg w-full justify-center">Login</Link>
                <Link to="/apply" className="dc-btn-primary dc-lg w-full justify-center">
                  Get Funded <ArrowRight size={14} />
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
