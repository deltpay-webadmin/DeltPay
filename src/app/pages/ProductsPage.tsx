import {
  CreditCard,
  Globe,
  BarChart3,
  Smartphone,
  Monitor,
  Wallet,
  Clock,
  Shield,
  Zap,
  Check,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router';
import { ProductCrossSell } from '../components/ProductCrossSell';

/* ─── Design tokens (Toast-inspired, Delt palette locked) ───── */
const NAVY     = '#041E42';
const PURPLE   = '#4945FF';
const LAVENDER = '#EDEBFF';
const IVORY    = '#F6F7FB';
const MUTED    = '#475569';
const MICRO    = '#94A3B8';
const HAIRLINE = 'rgba(4,30,66,0.10)';

export function ProductsPage() {
  const products = [
    {
      icon: CreditCard,
      title: 'Payment Processing',
      tagline: 'Accept payments anywhere, anytime',
      description:
        'Process payments online, in-person, or on-the-go. Accept all major credit cards, mobile wallets, and contactless payments.',
      features: [
        'Accept all major payment methods',
        'Contactless & mobile wallets',
        'Online payment gateway',
        'Recurring billing',
      ],
      stats: [
        { value: '2.6%', label: 'Transaction fee' },
        { value: '1–2 days', label: 'Deposit time' },
        { value: '99.9%', label: 'Uptime' },
      ],
      route: '/payments',
    },
    {
      icon: Wallet,
      title: 'Business Capital',
      tagline: 'Fast funding for your business',
      description:
        'Get the capital you need to grow with flexible financing. No lengthy applications, no collateral required.',
      features: [
        'Fast approval process',
        'Flexible repayment terms',
        'No collateral required',
        'Based on actual sales',
      ],
      stats: [
        { value: '$1K–$300K', label: 'Funding range' },
        { value: 'Next day', label: 'After approval' },
        { value: '8%', label: 'Starting rate' },
      ],
      route: '/capital',
    },
    {
      icon: Globe,
      title: 'Website Builder',
      tagline: 'Build your online presence',
      description:
        'Launch a professional website in minutes with drag-and-drop. Includes hosting, SSL, and seamless payment integration.',
      features: [
        'Drag & drop builder',
        'Mobile-responsive designs',
        'Free hosting & SSL',
        'Built-in e-commerce',
      ],
      stats: [
        { value: '100+', label: 'Templates' },
        { value: '0', label: 'Code needed' },
        { value: '24/7', label: 'Monitoring' },
      ],
      route: '/website-builder',
    },
    {
      icon: BarChart3,
      title: 'Business Analytics',
      tagline: 'AI-powered insights for growth',
      description:
        'Make data-driven decisions with powerful analytics and reporting. Real-time insights into sales, customers, and performance.',
      features: [
        'Real-time dashboards',
        'Predictive analytics',
        'Customer insights',
        'Sales forecasting',
      ],
      stats: [
        { value: 'Real-time', label: 'Updates' },
        { value: 'AI-powered', label: 'Insights' },
        { value: 'Unlimited', label: 'Reports*' },
      ],
      route: '/sandbox',
    },
  ];

  const hardware = [
    {
      icon: Smartphone,
      name: 'Delt Terminal',
      price: '$299',
      description: 'All-in-one terminal with touchscreen',
      features: ['5" touchscreen', 'WiFi & LTE', 'All-day battery', 'Built-in printer'],
    },
    {
      icon: Monitor,
      name: 'Delt Register',
      price: '$799',
      description: 'Complete POS system for your counter',
      features: ['13" display', 'Customer display', 'Cash drawer', 'Receipt printer'],
    },
    {
      icon: Smartphone,
      name: 'Delt Reader',
      price: '$49',
      description: 'Mobile card reader for phones',
      features: ['Bluetooth', 'Chip & tap', 'Portable', 'Long battery life'],
    },
  ];

  const integrations = [
    'QuickBooks', 'Shopify', 'WooCommerce', 'WordPress', 'Mailchimp', 'Zapier',
    'Slack', 'Xero', 'NetSuite', 'Salesforce', 'HubSpot', 'Square',
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#FFFFFF' }}>

      {/* ═══ 1. WHITE HERO (Toast editorial, centered) ═════════════ */}
      <section className="px-6 pt-24 pb-16 md:pt-32 md:pb-20" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }} className="text-center">
          {/* Breadcrumb chip */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: PURPLE }} />
            <span
              className="text-[12px] font-semibold uppercase"
              style={{ color: NAVY, letterSpacing: '0.14em' }}
            >
              Products
            </span>
          </div>
          <h1
            className="font-bold leading-[1.05] mb-6"
            style={{
              fontSize: 'clamp(40px, 5.5vw, 68px)',
              letterSpacing: '-0.03em',
              color: NAVY,
            }}
          >
            Everything you need to run your business.
          </h1>
          <p
            className="mx-auto leading-relaxed mb-9"
            style={{ fontSize: 'clamp(16px, 1.2vw, 18px)', color: MUTED, maxWidth: 620 }}
          >
            From payment processing to AI-powered analytics, Delt provides the tools you need
            to grow — integrated into one platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:brightness-110"
              style={{ background: PURPLE, fontSize: 15, boxShadow: `0 4px 18px ${PURPLE}40` }}
            >
              Get started
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact-sales"
              className="inline-flex items-center gap-2 font-semibold"
              style={{ color: PURPLE, fontSize: 15 }}
            >
              Talk to sales
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 2. ALTERNATING PRODUCT FEATURE BLOCKS (white) ═════════ */}
      <section className="px-6 py-12 md:py-16" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }} className="flex flex-col gap-20 md:gap-28">
          {products.map((product, index) => {
            const Icon = product.icon;
            const reverse = index % 2 === 1;
            return (
              <div
                key={product.title}
                className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center"
              >
                {/* Visual side — equal-weight card (all same neutral treatment) */}
                <div className={reverse ? 'md:order-2' : ''}>
                  <div
                    className="rounded-2xl p-8 md:p-10"
                    style={{
                      background: IVORY,
                      border: `1px solid ${HAIRLINE}`,
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                      style={{ background: '#FFFFFF', boxShadow: '0 4px 12px rgba(4,30,66,0.06)' }}
                    >
                      <Icon size={24} color={PURPLE} />
                    </div>
                    <div
                      className="text-[11px] font-bold uppercase mb-2"
                      style={{ color: PURPLE, letterSpacing: '0.16em' }}
                    >
                      {product.tagline}
                    </div>
                    <h3
                      className="font-bold mb-6 leading-[1.15]"
                      style={{
                        fontSize: 'clamp(24px, 2.6vw, 32px)',
                        color: NAVY,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {product.title}
                    </h3>
                    {/* Stats row */}
                    <div
                      className="grid grid-cols-3 gap-3 pt-6"
                      style={{ borderTop: `1px solid ${HAIRLINE}` }}
                    >
                      {product.stats.map((s) => (
                        <div key={s.label}>
                          <div
                            className="font-bold mb-1"
                            style={{
                              color: NAVY,
                              fontSize: 'clamp(18px, 1.8vw, 22px)',
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {s.value}
                          </div>
                          <div className="text-[11px]" style={{ color: MICRO }}>
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Copy side */}
                <div className={reverse ? 'md:order-1' : ''}>
                  <p className="leading-relaxed mb-6" style={{ color: MUTED, fontSize: 17 }}>
                    {product.description}
                  </p>
                  <ul className="flex flex-col gap-3 mb-7">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span
                          className="inline-flex items-center justify-center rounded-full flex-shrink-0"
                          style={{
                            width: 20,
                            height: 20,
                            background: `${PURPLE}15`,
                            marginTop: 2,
                          }}
                        >
                          <Check size={12} color={PURPLE} strokeWidth={3} />
                        </span>
                        <span style={{ color: NAVY, fontSize: 15, lineHeight: 1.5 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={product.route}
                    className="inline-flex items-center gap-2 font-semibold"
                    style={{ color: PURPLE, fontSize: 15 }}
                  >
                    Learn more about {product.title.split(' ')[0]}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <p
          className="text-center mt-12 text-xs"
          style={{ color: MICRO, maxWidth: 600, margin: '3rem auto 0' }}
        >
          *Subject to fair-use policy.
        </p>
      </section>

      {/* ═══ 3. HARDWARE — LAVENDER BAND ═══════════════════════════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: LAVENDER }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="text-center mb-14">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Delt hardware
            </div>
            <h2
              className="font-bold leading-[1.1] mb-4"
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              Hardware that works as hard as your team does.
            </h2>
            <p
              className="mx-auto leading-relaxed"
              style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', color: MUTED, maxWidth: 620 }}
            >
              Professional payment hardware designed for reliability and ease of use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hardware.map((device) => {
              const Icon = device.icon;
              return (
                <div
                  key={device.name}
                  className="rounded-2xl p-7 flex flex-col transition-transform"
                  style={{
                    background: '#FFFFFF',
                    border: `1px solid ${HAIRLINE}`,
                    boxShadow: '0 12px 28px rgba(4,30,66,0.05)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${PURPLE}12` }}
                  >
                    <Icon size={22} color={PURPLE} />
                  </div>
                  <h3
                    className="font-bold mb-1"
                    style={{ color: NAVY, fontSize: 20, letterSpacing: '-0.015em' }}
                  >
                    {device.name}
                  </h3>
                  <div
                    className="font-bold mb-4"
                    style={{ color: PURPLE, fontSize: 22, letterSpacing: '-0.02em' }}
                  >
                    {device.price}
                  </div>
                  <p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: MUTED, minHeight: 40 }}
                  >
                    {device.description}
                  </p>
                  <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                    {device.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <Check size={14} color={PURPLE} strokeWidth={3} />
                        <span style={{ color: NAVY }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact-sales"
                    className="inline-flex items-center justify-center gap-2 w-full rounded-full py-3 font-semibold text-white transition-colors"
                    style={{ background: PURPLE, fontSize: 14 }}
                  >
                    Order now
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 4. "BUILT FOR MODERN BUSINESSES" — white ══════════════ */}
      <section className="px-6 py-20 md:py-28" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="text-center mb-14">
            <div
              className="text-[12px] font-bold uppercase mb-3"
              style={{ color: PURPLE, letterSpacing: '0.18em' }}
            >
              Built for modern business
            </div>
            <h2
              className="font-bold leading-[1.1]"
              style={{
                fontSize: 'clamp(30px, 3.6vw, 44px)',
                color: NAVY,
                letterSpacing: '-0.025em',
              }}
            >
              Everything you need, integrated into one platform.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12 max-w-[960px] mx-auto">
            {[
              { icon: Shield, title: 'Bank-level security', description: 'PCI-DSS compliant with end-to-end encryption.' },
              { icon: Zap, title: 'Lightning fast', description: 'Process payments in under 2 seconds.' },
              { icon: Clock, title: 'Quick setup', description: 'Start accepting payments in minutes.' },
              { icon: Globe, title: 'Global reach', description: 'Accept payments from 135+ countries.' },
              { icon: BarChart3, title: 'Real-time analytics', description: 'Track business performance live.' },
              { icon: CreditCard, title: 'All payment types', description: 'Cards, wallets, contactless, and more.' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: `${PURPLE}12` }}
                  >
                    <Icon size={22} color={PURPLE} />
                  </div>
                  <h3
                    className="font-bold mb-2"
                    style={{ color: NAVY, fontSize: 17, letterSpacing: '-0.01em' }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 5. INTEGRATIONS — ivory ═══════════════════════════════ */}
      <section className="px-6 py-20 md:py-24" style={{ background: IVORY }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }} className="text-center">
          <div
            className="text-[12px] font-bold uppercase mb-3"
            style={{ color: PURPLE, letterSpacing: '0.18em' }}
          >
            Integrations
          </div>
          <h2
            className="font-bold leading-[1.1] mb-4"
            style={{
              fontSize: 'clamp(28px, 3.4vw, 40px)',
              color: NAVY,
              letterSpacing: '-0.025em',
            }}
          >
            Works with your favorite tools.
          </h2>
          <p
            className="mx-auto leading-relaxed mb-10"
            style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', color: MUTED, maxWidth: 560 }}
          >
            Seamlessly integrate with the software you already use.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {integrations.map((i) => (
              <div
                key={i}
                className="px-5 py-2.5 rounded-full font-medium transition-colors"
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${HAIRLINE}`,
                  color: NAVY,
                  fontSize: 14,
                }}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/contact-sales"
              className="inline-flex items-center gap-2 font-semibold"
              style={{ color: PURPLE, fontSize: 15 }}
            >
              View all integrations
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 6. PRODUCT CROSS-SELL (light) ═════════════════════════ */}
      <ProductCrossSell variant="light" />

      {/* ═══ 7. SMALL CENTERED FINAL CTA (white) ═══════════════════ */}
      <section className="px-6 py-20 md:py-24 text-center" style={{ background: '#FFFFFF' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <h2
            className="font-bold mb-4 leading-[1.1]"
            style={{
              fontSize: 'clamp(28px, 3.4vw, 40px)',
              color: NAVY,
              letterSpacing: '-0.025em',
            }}
          >
            Ready to get started?
          </h2>
          <p
            className="mb-8 leading-relaxed mx-auto"
            style={{ fontSize: 'clamp(15px, 1.2vw, 17px)', color: MUTED, maxWidth: 480 }}
          >
            Join thousands of businesses running on Delt. Free to start, no contracts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:brightness-110"
              style={{ background: PURPLE, fontSize: 15, boxShadow: `0 4px 18px ${PURPLE}40` }}
            >
              View pricing
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact-sales"
              className="inline-flex items-center gap-2 font-semibold"
              style={{ color: PURPLE, fontSize: 15 }}
            >
              Talk to sales
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 8. SMALL-PRINT LEGAL (ivory) ══════════════════════════ */}
      <div className="px-6 py-8" style={{ background: IVORY, borderTop: `1px solid ${HAIRLINE}` }}>
        <div
          className="max-w-4xl mx-auto"
          style={{ color: MICRO, fontSize: 11, lineHeight: 1.7 }}
        >
          <p>
            Illustrative stats shown on this page are representative examples. Actual results
            vary by business, volume, and plan. Hardware pricing subject to change. Some features
            are add-ons and may require the Growth or Personalized plan.
          </p>
        </div>
      </div>

    </div>
  );
}

export default ProductsPage;
