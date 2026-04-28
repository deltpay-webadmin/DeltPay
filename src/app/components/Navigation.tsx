import { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowRight, Globe, CreditCard, DollarSign, BarChart3, Star, User, AlignLeft, HelpCircle, LayoutDashboard, Calculator, ChevronRight, Menu, ChevronDown, Globe2, ShieldAlert } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import logoImage from 'figma:asset/61527edee0ea2e963bace756584cec3657b62f9e.png';
import logoWhite from 'figma:asset/419e83442bb1bf5965a966a8870b00dd4288dd57.png';
import logoDark from 'figma:asset/746abd6783954952f0204b8234c57704fd17f698.png';
import { motion, AnimatePresence } from 'motion/react';

/* ═══════════════════════════════════════════════════════
   SOLUTIONS MEGA-MENU DATA
   ═══════════════════════════════════════════════════════ */

const ICON_COLOR = '#041E42';

const solutionsStartGrow = [
  {
    label: 'Website',
    description: 'Professional websites built and managed for you',
    href: '/website-examples',
    icon: Globe,
  },
  {
    label: 'Lens AI',
    description: 'Ask your business questions in plain English',
    href: '/lens-ai',
    icon: BarChart3,
  },
  {
    label: 'Payments',
    description: 'In-store, online & mobile payment processing',
    href: '/payments',
    icon: CreditCard,
  },
  {
    label: 'Capital',
    description: 'Revenue-based funding with fast approvals',
    href: '/capital',
    icon: DollarSign,
  },
];

const solutionsSecondary = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Compare plans', href: '/pricing' },
  { label: 'See a demo', href: '/sandbox' },
];

const solutionsBusinessTypes = [
  { label: 'Restaurants & Food Service', description: 'POS, online ordering, table management', href: '/industries/restaurants' },
  { label: 'Retail & E-commerce', description: 'Inventory, checkout, multi-channel', href: '/industries/retail' },
  { label: 'Professional Services', description: 'Invoicing, scheduling, client management', href: '/industries/professional-services' },
  { label: 'Salon & Barber', description: 'Appointments, memberships, tipping', href: '/industries/salon-barber' },
  { label: 'Health & Wellness', description: 'Bookings, memberships, HIPAA-ready', href: '/industries/health-wellness' },
];

/* ═══════════════════════════════════════════════════════
   RESOURCES MEGA-MENU DATA
   ═══════════════════════════════════════════════════════ */

const resourcesLearn = [
  { label: "What's New", description: 'Product updates & releases', href: '/whats-new', icon: Star, badge: 'LATEST' },
  { label: 'About Us', description: 'Our story, team & mission', href: '/about', icon: User },
  { label: 'Blog', description: 'Insights for growing businesses', href: '/blog', icon: AlignLeft },
  { label: 'Reviews', description: 'What merchants are saying', href: '/reviews', icon: Star },
];

const resourcesSupport = [
  { label: 'Help Center', description: 'Common questions answered', href: '/help-center', icon: HelpCircle },
  { label: 'Contact & Support', description: 'Sales, support, partnerships', href: '/contact', icon: CreditCard },
];

const resourcesCTAs = [
  { label: 'Demo', description: 'Dashboard sandbox preview', href: '/sandbox', icon: LayoutDashboard },
  { label: 'Calculator', description: 'Calculate your savings', href: '/calculator', icon: Calculator },
];

/* ═══════════════════════════════════════════════════════
   Shared heading component
   ═══════════════════════════════════════════════════════ */

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <div
    className="text-[12px] font-bold uppercase text-[#94A3B8] mb-4 pl-3"
    style={{ letterSpacing: '1.4px' }}
  >
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */

export function Navigation() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBtnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOrigin, setSearchOrigin] = useState({ x: 0, y: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Only these pages have a dark hero — nav starts transparent with white text.
     Every other page gets a solid white nav immediately so text is always visible. */
  const darkHeroPages = ['/', '/payments', '/delt-ai', '/how-it-works', '/website-examples'];
  const isDarkHero =
    darkHeroPages.some((p) => location.pathname === p) ||
    location.pathname.startsWith('/industries/');

  /* Track scroll so header becomes solid once user moves past the hero.
     This fixes the 'header vanishes on scroll' bug — it no longer disappears;
     it transitions to a frosted white bar with navy text. */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Reset scroll state when route changes so each page evaluates from the top */
  useEffect(() => {
    setIsScrolled(window.scrollY > 80);
  }, [location.pathname]);

  const isSolid = !isDarkHero || isHovered || !!activeDropdown || isScrolled;

  const openDropdown = (key: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveDropdown(key);
  };
  const closeDropdown = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 100);
  };

  // ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const frequentSearches = [
    { text: 'Payment processing fees', icon: '💳', link: '/pricing' },
    { text: 'Hardware setup guide', icon: '🖥️', link: '/support' },
    { text: 'API documentation', icon: '📚', link: '/support' },
    { text: 'Pricing plans comparison', icon: '💰', link: '/pricing' },
    { text: 'Delt AI Analytics', icon: '✨', link: '/delt-ai' },
    { text: 'Contact support team', icon: '💬', link: '/support' },
    { text: 'Business types overview', icon: '🏢', link: '/business-types' },
    { text: 'Shopping cart', icon: '🛒', link: '/cart' },
  ];

  const filteredSearches = searchQuery.trim()
    ? frequentSearches.filter(item =>
        item.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : frequentSearches;

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSearch = (query: string, link?: string) => {
    if (link) {
      navigate(link);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  /* Chevron SVG helper */
  const Chevron = ({ isOpen }: { isOpen: boolean }) => (
    <svg
      className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  /* Column heading */
  const ColHeading = ({ children }: { children: React.ReactNode }) => (
    <div
      className="text-[11px] font-bold uppercase text-[#94A3B8] mb-4"
      style={{ letterSpacing: '1.4px' }}
    >
      {children}
    </div>
  );

  return (
    <>
      {/* Background Overlay for dropdowns */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveDropdown(null)}
          />
        )}
      </AnimatePresence>

      <div
        id="delt-main-nav"
        className="fixed top-0 left-0 right-0 z-50"
        onMouseLeave={() => { setIsHovered(false); closeDropdown(); }}
      >
        {/* Centered container — constant width like Stripe */}
        <div className="flex justify-center pt-3 px-4">
          <div
            onMouseEnter={() => setIsHovered(true)}
            style={{
              width: '100%',
              maxWidth: 1080,
              backgroundColor: isSolid ? '#FFFFFF' : 'rgba(255,255,255,0)',
              borderRadius: 16,
              boxShadow: isSolid ? '0 12px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)' : 'none',
              overflow: 'hidden',
              transition: 'background-color 0.35s ease, box-shadow 0.35s ease',
            }}
          >
            {/* Nav bar row */}
            <div className="px-6 xl:px-8">
              <div className="flex justify-between items-center h-[68px]">

                {/* ── Left — Logo ── */}
                <div className="flex items-center">
                  <Link to="/" className="flex items-center">
                    <img
                      src={isSolid ? logoDark : logoWhite}
                      alt="Delt"
                      className="h-[72px] m-[0px]"
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        transition: 'opacity 0.3s ease',
                      }}
                    />
                  </Link>
                </div>

                {/* ── Center — Nav Links ── */}
                <nav className="hidden lg:flex items-center gap-1 xl:gap-2">

                  {/* ─── Solutions Mega Menu ─── */}
                  <div
                    className="relative"
                    onMouseEnter={() => openDropdown('solutions')}
                    onMouseLeave={() => closeDropdown()}
                  >
                    <button
                      className="flex items-center gap-1.5 px-4 py-2 text-[18px] font-medium transition-colors whitespace-nowrap"
                      style={{ color: isSolid ? '#041E42' : '#FFFFFF', transition: 'color 0.3s ease' }}
                    >
                      Solutions
                      <Chevron isOpen={activeDropdown === 'solutions'} />
                    </button>
                  </div>

                  {/* ─── Pricing ─── */}
                  <Link
                    to="/pricing"
                    className="px-4 py-2 text-[18px] font-medium transition-colors whitespace-nowrap"
                    style={{ color: isSolid ? '#041E42' : '#FFFFFF', transition: 'color 0.3s ease' }}
                  >
                    Pricing
                  </Link>

                  {/* ─── Resources Mega Menu ─── */}
                  <div
                    className="relative"
                    onMouseEnter={() => openDropdown('resources')}
                    onMouseLeave={() => closeDropdown()}
                  >
                    <button
                      className="flex items-center gap-1.5 px-4 py-2 text-[18px] font-medium transition-colors whitespace-nowrap"
                      style={{ color: isSolid ? '#041E42' : '#FFFFFF', transition: 'color 0.3s ease' }}
                    >
                      Resources
                      <Chevron isOpen={activeDropdown === 'resources'} />
                    </button>
                  </div>

                </nav>

                {/* ── Right — Actions ── */}
                <div className="flex items-center gap-3">

                  {/* Search (⌘K) */}
                  <button
                    ref={searchBtnRef}
                    onClick={() => {
                      if (searchBtnRef.current) {
                        const rect = searchBtnRef.current.getBoundingClientRect();
                        setSearchOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                      }
                      setShowSearch(true);
                      setSelectedIndex(0);
                    }}
                    className="hidden lg:flex p-2 transition-colors"
                    style={{ color: isSolid ? '#041E42' : '#FFFFFF', transition: 'color 0.3s ease' }}
                    aria-label="Search"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <Search className="h-5 w-5" />
                    </motion.div>
                  </button>

                  {/* Sign In */}
                  <Link
                    to="/signin"
                    className="hidden md:flex items-center px-4 py-1.5 text-[17px] font-medium transition-all whitespace-nowrap"
                    style={{
                      color: isSolid ? '#041E42' : '#FFFFFF',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    Sign in <span className="ml-1">›</span>
                  </Link>

                  {/* Contact Sales CTA */}
                  <Link
                    to="/contact-sales"
                    className="hidden md:flex items-center gap-1.5 px-5 py-2.5 text-[16px] font-semibold text-white bg-[#4945FF] rounded-full hover:bg-[#3933CC] transition-colors whitespace-nowrap"
                  >
                    Contact sales
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Mobile Hamburger Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden flex p-2 transition-colors"
                    style={{ color: isSolid ? '#041E42' : '#FFFFFF' }}
                    aria-label="Menu"
                  >
                    <Menu size={24} />
                  </button>

                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════
               MEGA-MENU DROPDOWNS — inside the same white box
               ═══════════════════════════════════════════════════ */}

            <AnimatePresence>
              {activeDropdown === 'solutions' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ overflow: 'hidden' }}
                  onMouseEnter={() => openDropdown('solutions')}
                  onMouseLeave={() => closeDropdown()}
                >
                  <div className="border-t border-[#F0F0F0]" />
                  
                  {/* Full Stack Header Banner */}
                  <div className="px-8 pt-6 pb-5">
                    <div 
                      className="rounded-2xl flex items-center justify-between px-6 py-5"
                      style={{ background: '#041E42' }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: '#4945FF' }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white text-[16px] font-bold mb-0.5" style={{ letterSpacing: '-0.01em' }}>
                            Go All-In
                          </div>
                          <div className="text-[13px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            Website + Payments + Lens AI + Capital — one plan, one price
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/pricing"
                        className="px-5 py-2.5 rounded-lg text-[14px] font-bold transition-all"
                        style={{ 
                          background: '#4945FF',
                          color: 'white',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#3933CC';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#4945FF';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        onClick={() => setActiveDropdown(null)}
                      >
                        See Plans →
                      </Link>
                    </div>
                  </div>

                  <div className="px-8 pb-8">
                    <div className="flex">

                      {/* Col 1 — Start & Grow */}
                      <div className="w-[300px] pr-8 border-r border-[#F3F4F6]">
                        <SectionHeading>Products</SectionHeading>
                        <div className="space-y-1">
                          {solutionsStartGrow.map((item) => {
                            const IconComp = item.icon;
                            return (
                              <Link
                                key={item.label}
                                to={item.href}
                                className="flex items-start gap-3.5 px-3 py-3 rounded-xl hover:bg-[#F6F7FB] transition-colors group"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <div
                                  className="w-[38px] h-[38px] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#4945FF]/15"
                                  style={{ backgroundColor: 'rgba(73,69,255,0.08)' }}
                                >
                                  <IconComp className="w-5 h-5" style={{ color: ICON_COLOR }} strokeWidth={1.4} />
                                </div>
                                <div>
                                  <div className="text-[15px] text-[#041E42] group-hover:text-[#4945FF] transition-colors leading-tight" style={{ fontWeight: 650 }}>
                                    {item.label}
                                  </div>
                                  <div className="text-[13px] text-[#94A3B8] leading-snug mt-0.5">
                                    {item.description}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        {/* Secondary links */}
                        <div className="mt-4 pt-4 border-t border-[#F3F4F6] pl-3 flex gap-5">
                          {solutionsSecondary.map((link) => (
                            <Link
                              key={link.label}
                              to={link.href}
                              className="text-[13px] font-medium text-[#94A3B8] hover:text-[#4945FF] transition-colors"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Col 2 — By Business Type */}
                      <div className="w-[300px] px-8 border-r border-[#F3F4F6]">
                        <SectionHeading>By Business Type</SectionHeading>
                        <div className="space-y-1">
                          {solutionsBusinessTypes.map((item) => (
                            <Link
                              key={item.label}
                              to={item.href}
                              className="block px-3 py-2.5 rounded-xl hover:bg-[#F6F7FB] transition-colors group"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <div className="text-[15px] text-[#041E42] group-hover:text-[#4945FF] transition-colors leading-tight" style={{ fontWeight: 600 }}>
                                {item.label}
                              </div>
                              <div className="text-[13px] text-[#94A3B8] leading-snug mt-0.5">
                                {item.description}
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-[#F3F4F6]">
                          <Link
                            to="/business-types"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[14px] font-semibold text-[#4945FF] hover:bg-[#4945FF]/8 transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            See all industries
                            <span className="text-[13px]">→</span>
                          </Link>
                        </div>
                      </div>

                      {/* Col 3 — Specialized solutions */}
                      <div className="flex-1 flex flex-col justify-between rounded-2xl ml-4" style={{ background: '#F6F7FB', padding: '24px 28px' }}>
                        <div>
                          <div className="text-[11px] font-bold uppercase text-[#4945FF] mb-4" style={{ letterSpacing: '1.4px' }}>
                            Specialized
                          </div>

                          {/* International USDT card */}
                          <Link
                            to="/solutions/international-usdt"
                            onClick={() => setActiveDropdown(null)}
                            className="block bg-white rounded-xl p-5 border border-[#4945FF]/15 mb-4 hover:border-[#4945FF]/40 hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'rgba(73,69,255,0.10)' }}
                              >
                                <Globe2 className="w-5 h-5 text-[#4945FF]" strokeWidth={1.6} />
                              </div>
                              <div className="flex-1">
                                <div className="text-[14px] font-bold text-[#041E42] group-hover:text-[#4945FF] transition-colors leading-tight mb-1">
                                  International USDT Payments
                                </div>
                                <div className="text-[12px] text-[#475569] leading-snug">
                                  Same-day cross-border settlement for wholesalers — powered by Shield.
                                </div>
                                <div className="text-[11px] font-semibold text-[#4945FF] mt-2 inline-flex items-center gap-1">
                                  Learn more <span>→</span>
                                </div>
                              </div>
                            </div>
                          </Link>

                          {/* High Risk card */}
                          <Link
                            to="/solutions/high-risk-processing"
                            onClick={() => setActiveDropdown(null)}
                            className="block bg-white rounded-xl p-5 border border-[#4945FF]/15 hover:border-[#4945FF]/40 hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'rgba(73,69,255,0.10)' }}
                              >
                                <ShieldAlert className="w-5 h-5 text-[#4945FF]" strokeWidth={1.6} />
                              </div>
                              <div className="flex-1">
                                <div className="text-[14px] font-bold text-[#041E42] group-hover:text-[#4945FF] transition-colors leading-tight mb-1">
                                  High Risk Processing
                                </div>
                                <div className="text-[12px] text-[#475569] leading-snug">
                                  Shut down by your processor? We approve every high-risk vertical — custom rates, rate match, rate compare.
                                </div>
                                <div className="text-[11px] font-semibold text-[#4945FF] mt-2 inline-flex items-center gap-1">
                                  Learn more <span>→</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>

                        <Link
                          to="/apply"
                          className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#4945FF] hover:text-[#3933CC] transition-colors mt-5"
                          onClick={() => setActiveDropdown(null)}
                        >
                          Get started for free <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {activeDropdown === 'resources' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ overflow: 'hidden' }}
                  onMouseEnter={() => openDropdown('resources')}
                  onMouseLeave={() => closeDropdown()}
                >
                  <div className="border-t border-[#F0F0F0]" />
                  <div className="px-8 pt-7 pb-0">
                    <div className="grid grid-cols-2 gap-2">

                      {/* LEARN column */}
                      <div className="pr-6 border-r border-[#F0F0F0]">
                        <ColHeading>Learn</ColHeading>
                        <div className="space-y-1">
                          {resourcesLearn.map((item) => {
                            const IconComp = item.icon;
                            return (
                              <Link
                                key={item.label}
                                to={item.href}
                                className="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-[#F6F7FB] transition-colors group"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#4945FF]/8 border border-[#4945FF]/15">
                                  <IconComp className="w-4 h-4 text-[#4945FF]" strokeWidth={1.5} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[14px] text-[#041E42] group-hover:text-[#4945FF] transition-colors leading-tight" style={{ fontWeight: 650 }}>
                                      {item.label}
                                    </span>
                                    {'badge' in item && item.badge && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#4945FF] text-white" style={{ letterSpacing: '0.04em' }}>
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[12px] text-[#94A3B8] leading-snug mt-0.5">{item.description}</div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* SUPPORT column */}
                      <div className="pl-6">
                        <ColHeading>Support</ColHeading>
                        <div className="space-y-1">
                          {resourcesSupport.map((item) => {
                            const IconComp = item.icon;
                            return (
                              <Link
                                key={item.label}
                                to={item.href}
                                className="flex items-start gap-3 px-2 py-2.5 rounded-xl hover:bg-[#F6F7FB] transition-colors group"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#4945FF]/8 border border-[#4945FF]/15">
                                  <IconComp className="w-4 h-4 text-[#4945FF]" strokeWidth={1.5} />
                                </div>
                                <div>
                                  <div className="text-[14px] text-[#041E42] group-hover:text-[#4945FF] transition-colors leading-tight" style={{ fontWeight: 650 }}>
                                    {item.label}
                                  </div>
                                  <div className="text-[12px] text-[#94A3B8] leading-snug mt-0.5">{item.description}</div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom CTA strip */}
                  <div className="mt-5 border-t border-[#F0F0F0] grid grid-cols-2">
                    {resourcesCTAs.map((item, i) => {
                      const IconComp = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.href}
                          className={`flex items-center gap-3 px-8 py-4 hover:bg-[#F6F7FB] transition-colors group ${i === 0 ? 'border-r border-[#F0F0F0]' : ''}`}
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#4945FF]">
                            <IconComp className="w-5 h-5 text-white" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1">
                            <div className="text-[14px] text-[#041E42] group-hover:text-[#4945FF] transition-colors leading-tight" style={{ fontWeight: 650 }}>
                              {item.label}
                            </div>
                            <div className="text-[12px] text-[#94A3B8] leading-snug mt-0.5">{item.description}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#C4C4C4] group-hover:text-[#4945FF] transition-colors flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* ── Mobile Menu Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-full max-w-[380px] bg-white z-[101] overflow-y-auto lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <img src={logoDark} alt="Delt" className="h-[60px]" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-[#F6F7FB] rounded-lg transition-colors"
                >
                  <X size={24} className="text-[#475569]" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-6">
                {/* Solutions Section */}
                <div className="mb-4">
                  <button
                    onClick={() => setMobileExpandedSection(mobileExpandedSection === 'solutions' ? null : 'solutions')}
                    className="w-full flex items-center justify-between py-3 text-lg font-semibold text-[#041E42]"
                  >
                    Solutions
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${mobileExpandedSection === 'solutions' ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileExpandedSection === 'solutions' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 py-2 space-y-1">
                          {solutionsStartGrow.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F6F7FB] transition-colors"
                              >
                                <Icon size={20} className="text-[#4945FF] mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-[#041E42]">{item.label}</div>
                                  <div className="text-sm text-[#475569]">{item.description}</div>
                                </div>
                              </Link>
                            );
                          })}
                          <div className="pt-2 mt-2 border-t border-gray-200 space-y-1">
                            <Link
                              to="/solutions/international-usdt"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F6F7FB] transition-colors"
                            >
                              <Globe2 size={20} className="text-[#4945FF] mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-[#041E42]">International USDT Payments</div>
                                <div className="text-sm text-[#475569]">Same-day settlement — powered by Shield</div>
                              </div>
                            </Link>
                            <Link
                              to="/solutions/high-risk-processing"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F6F7FB] transition-colors"
                            >
                              <ShieldAlert size={20} className="text-[#4945FF] mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-[#041E42]">High Risk Processing</div>
                                <div className="text-sm text-[#475569]">Custom rates for every high-risk vertical</div>
                              </div>
                            </Link>
                          </div>
                          <div className="pt-2 mt-2 border-t border-gray-200">
                            {solutionsSecondary.map((item) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-2 px-3 text-sm text-[#475569] hover:text-[#4945FF] transition-colors"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Pricing Link */}
                <Link
                  to="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-lg font-semibold text-[#041E42] hover:text-[#4945FF] transition-colors"
                >
                  Pricing
                </Link>

                {/* Resources Section */}
                <div className="mb-4">
                  <button
                    onClick={() => setMobileExpandedSection(mobileExpandedSection === 'resources' ? null : 'resources')}
                    className="w-full flex items-center justify-between py-3 text-lg font-semibold text-[#041E42]"
                  >
                    Resources
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${mobileExpandedSection === 'resources' ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileExpandedSection === 'resources' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 py-2 space-y-1">
                          {resourcesLearn.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F6F7FB] transition-colors"
                              >
                                <Icon size={20} className="text-[#4945FF] mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-[#041E42]">{item.label}</div>
                                  <div className="text-sm text-[#475569]">{item.description}</div>
                                </div>
                              </Link>
                            );
                          })}
                          <div className="pt-2 mt-2 border-t border-gray-200">
                            {resourcesSupport.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.href}
                                  to={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F6F7FB] transition-colors"
                                >
                                  <Icon size={20} className="text-[#4945FF] mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium text-[#041E42]">{item.label}</div>
                                    <div className="text-sm text-[#475569]">{item.description}</div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <Link
                    to="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-3 px-5 text-base font-semibold text-[#041E42] bg-[#F6F7FB] rounded-full hover:bg-[#F6F7FB] transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/contact-sales"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 px-5 text-base font-semibold text-white bg-[#4945FF] rounded-full hover:bg-[#3933CC] transition-colors"
                  >
                    Contact sales
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Apple Spotlight Search ── */}
      <AnimatePresence>
      {showSearch && (
        <motion.div
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => { setShowSearch(false); setSearchQuery(''); }}
        >
          {/* Frosted backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />

          {/* Spotlight container */}
          <div className="relative flex items-start justify-center pt-[min(20vh,160px)] px-4">
            <motion.div
              className="w-full max-w-[680px]"
              initial={{
                opacity: 0,
                scale: 0.35,
                y: searchOrigin.y - 160 || -60,
                x: 0,
                filter: 'blur(8px)',
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                x: 0,
                filter: 'blur(0px)',
              }}
              exit={{
                opacity: 0,
                scale: 0.5,
                y: -30,
                filter: 'blur(6px)',
              }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 32,
                mass: 0.8,
              }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div
                className="overflow-hidden"
                style={{
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'saturate(180%) blur(24px)',
                  WebkitBackdropFilter: 'saturate(180%) blur(24px)',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.28), 0 0 0 0.5px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.5)',
                }}
              >
                {/* Search input row */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.06]">
                  <motion.div
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.05 }}
                  >
                    <Search className="h-5 w-5 text-[#94A3B8] flex-shrink-0" />
                  </motion.div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search Delt..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setSelectedIndex(i => Math.min(i + 1, filteredSearches.length - 1));
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setSelectedIndex(i => Math.max(i - 1, 0));
                      } else if (e.key === 'Enter' && filteredSearches.length > 0) {
                        handleSearch(filteredSearches[selectedIndex].text, filteredSearches[selectedIndex].link);
                      } else if (e.key === 'Escape') {
                        setShowSearch(false);
                        setSearchQuery('');
                      }
                    }}
                    className="flex-1 text-[17px] text-[#1D1D1F] placeholder-[#94A3B8] bg-transparent focus:outline-none"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 rounded-full hover:bg-black/[0.06] transition-colors"
                    >
                      <X className="h-4 w-4 text-[#94A3B8]" />
                    </button>
                  )}
                  <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-md bg-black/[0.06] text-[12px] text-[#94A3B8]" style={{ fontFamily: 'monospace' }}>
                    esc
                  </kbd>
                </div>

                {/* Results */}
                <div className="py-3 max-h-[380px] overflow-y-auto">
                  <div className="px-4 pb-2">
                    <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-widest">
                      {searchQuery ? 'Results' : 'Frequent searches'}
                    </span>
                  </div>
                  {filteredSearches.length > 0 ? (
                    filteredSearches.map((item, index) => (
                      <motion.button
                        key={item.text}
                        className={`w-full flex items-center gap-3.5 px-4 py-2.5 text-left transition-colors ${
                          index === selectedIndex ? 'bg-[#4945FF]/[0.06]' : 'hover:bg-black/[0.03]'
                        }`}
                        onClick={() => handleSearch(item.text, item.link)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                      >
                        <span className="text-[20px] w-8 text-center flex-shrink-0">{item.icon}</span>
                        <span className="text-[15px] text-[#1D1D1F]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                          {item.text}
                        </span>
                        <ArrowRight className="ml-auto h-4 w-4 text-[#C7C7CC] flex-shrink-0" />
                      </motion.button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-[15px] text-[#94A3B8]">
                      No results for "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}