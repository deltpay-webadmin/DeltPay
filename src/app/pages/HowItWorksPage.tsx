import { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { Globe, CreditCard, TrendingUp, Sparkles, ArrowRight, Check } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import websiteImg from '@/assets/6371f372d9648e34936d619f0240fb4443da5f92.png';
import paymentsImg from '@/assets/payments_panel.png';
import capitalImg from '@/assets/294c7fbb10dd1c373bff0764a9c07ba072be56f8.png';
import lensAiImg from '@/assets/78721b9b7179a89090d323016aa6b043d0dda27d.png';

/* ── Product Data ── */
const products = [
  {
    id: 'website',
    title: 'Website',
    headline: 'A site that sells — from day one.',
    description:
      'We design and build your entire digital storefront: brand-aligned, mobile-optimized, and conversion-focused. No templates. No drag-and-drop. A real site, built by real designers, live in under two weeks.',
    bullets: [
      'Custom design tailored to your brand and audience',
      'Mobile-first, blazing-fast performance',
      'Hosting, SSL, and infrastructure fully managed',
      'SEO-ready architecture out of the box',
    ],
    icon: Globe,
    image: websiteImg,
    color: '#4945FF',
    stat: { value: '<14 days', label: 'Design to launch' },
  },
  {
    id: 'payments',
    title: 'Payments',
    headline: 'Accept payments everywhere. Keep more.',
    description:
      'Delt Payments is built directly into your site — no plugins, no third-party processors. Accept cards, contactless, and online payments with transparent pricing and instant settlement to your Delt balance; standard bank transfers in 1\u20132 business days.',
    bullets: [
      'Integrated checkout — minimal configuration — works out of the box for standard setups',
      'In-person POS and contactless tap-to-pay',
      'Real-time transaction monitoring & analytics',
      'PCI-compliant, encrypted by default',
    ],
    icon: CreditCard,
    image: paymentsImg,
    color: '#4945FF',
    stat: { value: '2.6%', label: 'Flat processing rate' },
  },
  {
    id: 'capital',
    title: 'Capital',
    headline: 'Funding matched to your momentum.',
    description:
      'Because Delt already processes your payments and tracks your performance, we can underwrite rapidly — typically within hours using your Delt data. Revenue-based funding with no equity dilution, no personal guarantees, and average 48-hour disbursement.',
    bullets: [
      'Revenue-based — repay as a % of daily sales',
      'No equity, no personal guarantee required',
      'Pre-qualified offers based on your Delt data',
      'Funds available in as little as 48 hours',
    ],
    icon: TrendingUp,
    image: capitalImg,
    color: '#4945FF',
    stat: { value: '48 hrs', label: 'Average disbursement' },
  },
  {
    id: 'ai',
    title: 'Lens AI',
    headline: 'Your business brain. Available around the clock.',
    description:
      'Lens is Delt\'s AI layer — a conversational analytics engine that watches your sales, traffic, and cash flow 24/7. Ask questions in plain English, get anomaly alerts before problems escalate, and surface opportunities you\'d otherwise miss.',
    bullets: [
      'Natural language queries — "How did Tuesday compare to last week?"',
      'Proactive anomaly detection & trend alerts',
      'Cross-product insights: site traffic → sales → cash flow',
      'Actionable recommendations, not just dashboards',
    ],
    icon: Sparkles,
    image: lensAiImg,
    color: '#4945FF',
    stat: { value: '24/7', label: 'Always monitoring*' },
  },
];

/* ── Stacking Card ── */
interface CardProps {
  i: number;
  product: typeof products[0];
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

function ProductCard({ i, product, progress, range, targetScale }: CardProps) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start'],
  });

  // Subtle settle (1.06 → 1) instead of a 1.5x zoom — keeps the
  // hero image cleanly framed inside the right column without
  // bleeding past the rounded card edge during scroll.
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.06, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);
  const Icon = product.icon;

  /* Each card sticks 24 px lower than the previous, creating an even deck */
  const stickyTop = 80 + i * 24;

  return (
    <div
      ref={container}
      className="h-screen flex items-center justify-center sticky"
      style={{ top: stickyTop }}
    >
      <motion.div
        style={{ scale }}
        className="hiw-card relative origin-top"
      >
        {/* Card inner */}
        <div className="hiw-card-inner">
          {/* Left content */}
          <div className="hiw-card-left">
            <div className="hiw-card-icon" style={{ background: `${product.color}15`, border: `1px solid ${product.color}30` }}>
              <Icon size={20} style={{ color: product.color }} />
            </div>
            <div className="hiw-card-label" style={{ color: product.color }}>{product.title}</div>
            <h2 className="hiw-card-headline">{product.headline}</h2>
            <p className="hiw-card-desc">{product.description}</p>

            <ul className="hiw-card-bullets">
              {product.bullets.map((b, idx) => (
                <li key={idx} className="hiw-card-bullet">
                  <Check size={14} style={{ color: product.color, flexShrink: 0, marginTop: 2 }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="hiw-card-stat">
              <span className="hiw-card-stat-value" style={{ color: product.color }}>{product.stat.value}</span>
              <span className="hiw-card-stat-label">{product.stat.label}</span>
              {product.id === 'ai' && <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>*Subject to service availability.</p>}
            </div>
          </div>

          {/* Right image */}
          <div className="hiw-card-right">
            <motion.div className="hiw-card-img-wrap" style={{ scale: imageScale }}>
              <ImageWithFallback
                src={product.image}
                alt={product.title}
                className="hiw-card-img"
              />
            </motion.div>
          </div>
        </div>

        {/* Step number */}
        <div className="hiw-card-step" style={{ background: product.color }}>
          {i + 1}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Page ── */
export function HowItWorksPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <div className="hiw-page" ref={containerRef}>
      {/* Hero */}
      <section className="hiw-hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="hiw-hero-content"
        >
          <div className="hiw-hero-badge">
            <span className="hiw-hero-badge-dot" />
            The Delt Platform
          </div>
          <h1 className="hiw-hero-title">
            Four products.<br />
            <span className="hiw-hero-title-accent">One platform.</span>
          </h1>
          <p className="hiw-hero-sub">
            Every Delt merchant starts with a site. Then payments flow in, capital unlocks,
            and Lens AI connects it all — giving you a business operating system, not just another tool.
          </p>
          <div className="hiw-hero-scroll-hint">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
                <rect x="1" y="1" width="18" height="26" rx="9" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                <motion.circle
                  cx="10" cy="8" r="2.5" fill="#4945FF"
                  animate={{ cy: [8, 18, 8] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </svg>
            </motion.div>
            <span>Scroll to explore</span>
          </div>
        </motion.div>
      </section>

      {/* Stacking Cards */}
      <section className="hiw-cards-section">
        {products.map((product, i) => {
          const targetScale = 1 - (products.length - i) * 0.04;
          return (
            <ProductCard
              key={product.id}
              i={i}
              product={product}
              progress={scrollYProgress}
              range={[i * 0.2, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </section>

      {/* Bottom CTA */}
      <section className="hiw-bottom-cta">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="hiw-bottom-cta-inner"
        >
          <h2 className="hiw-bottom-cta-heading">
            All four products.<br />One login. Zero friction.
          </h2>
          <p className="hiw-bottom-cta-sub">
            Every product feeds the next. Your site generates traffic, payments capture revenue,
            Capital fuels growth, and Lens keeps you ahead of it all.
          </p>
          <div className="hiw-bottom-cta-buttons">
            <Link to="/apply" className="hiw-cta-primary">
              Get started free <ArrowRight size={16} />
            </Link>
            <Link to="/pricing" className="hiw-cta-secondary">
              Compare plans <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

      <style>{`
        .hiw-page {
          background: #041E42;
          min-height: 100vh;
        }

        /* Hero */
        .hiw-hero {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 60px;
        }
        .hiw-hero-content {
          text-align: center;
          max-width: 700px;
        }
        .hiw-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #4945FF;
          background: rgba(73,69,255,0.08);
          border: 1px solid rgba(73,69,255,0.2);
          padding: 7px 18px;
          border-radius: 100px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 40px;
        }
        .hiw-hero-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #4945FF;
          box-shadow: 0 0 8px rgba(73,69,255,0.6);
        }
        .hiw-hero-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(2.8rem, 5.5vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.035em;
          color: #fff;
          margin: 0 0 28px;
        }
        .hiw-hero-title-accent {
          background: linear-gradient(90deg, #4945FF 0%, #7B78FF 60%, #4945FF 100%);
          background-size: 200% 100%;
          animation: hiw-shimmer 6s ease-in-out infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-style: italic;
          font-family: 'Playfair Display', serif;
        }
        @keyframes hiw-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .hiw-hero-sub {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px;
          line-height: 1.75;
          color: rgba(255,255,255,0.5);
          max-width: 560px;
          margin: 0 auto 48px;
        }
        .hiw-hero-scroll-hint {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: rgba(255,255,255,0.3);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* Cards section */
        .hiw-cards-section {
          padding-bottom: 10vh;
        }

        .hiw-card {
          width: min(85vw, 1100px);
          height: auto;
          min-height: 480px;
          border-radius: 20px;
          background: #041E42;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset;
        }

        .hiw-card-inner {
          display: flex;
          height: 100%;
          min-height: 480px;
        }

        .hiw-card-left {
          flex: 1;
          padding: 48px 44px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hiw-card-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .hiw-card-label {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .hiw-card-headline {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin: 0 0 16px;
        }

        .hiw-card-desc {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          line-height: 1.7;
          color: rgba(255,255,255,0.5);
          margin: 0 0 24px;
        }

        .hiw-card-bullets {
          list-style: none;
          padding: 0;
          margin: 0 0 28px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hiw-card-bullet {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          line-height: 1.5;
        }

        .hiw-card-stat {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .hiw-card-stat-value {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .hiw-card-stat-label {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .hiw-card-right {
          width: 45%;
          position: relative;
          flex-shrink: 0;
          padding: 28px 28px 28px 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hiw-card-img-wrap {
          width: 100%;
          height: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(73,69,255,0.10) 0%, rgba(255,255,255,0.04) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 16px 40px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.03);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hiw-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hiw-card-step {
          position: absolute;
          top: 20px;
          right: 24px;
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          z-index: 2;
        }

        /* Bottom CTA */
        .hiw-bottom-cta {
          padding: 100px 24px 120px;
          text-align: center;
        }
        .hiw-bottom-cta-inner {
          max-width: 640px;
          margin: 0 auto;
        }
        .hiw-bottom-cta-heading {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin: 0 0 20px;
        }
        .hiw-bottom-cta-sub {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          line-height: 1.75;
          color: rgba(255,255,255,0.45);
          margin: 0 0 40px;
        }
        .hiw-bottom-cta-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .hiw-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 34px;
          border-radius: 12px;
          background: #4945FF;
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s, box-shadow 0.3s;
          box-shadow: 0 0 28px rgba(73,69,255,0.25), 0 4px 14px rgba(0,0,0,0.2);
        }
        .hiw-cta-primary:hover {
          background: #4945FF;
          transform: translateY(-1px);
          box-shadow: 0 0 44px rgba(73,69,255,0.4), 0 8px 24px rgba(0,0,0,0.3);
        }
        .hiw-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 15px 30px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.75);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .hiw-cta-secondary:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.22);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .hiw-card-right {
            padding: 0 20px 20px;
            min-height: 280px;
          }
          .hiw-card-img-wrap {
            aspect-ratio: 4 / 3;
            height: auto;
          }
        }
        @media (max-width: 768px) {
          .hiw-card { width: 92vw; min-height: auto; }
          .hiw-card-inner {
            flex-direction: column-reverse;
            min-height: 540px;
          }
          .hiw-card-right {
            width: 100%;
            flex: 1;
            min-height: 0;
            padding: 0 20px 20px;
          }
          .hiw-card-left {
            flex: 1;
            min-height: 0;
            padding: 28px 24px;
          }
          .hiw-card-headline { font-size: 1.4rem; }
          .hiw-card-desc { font-size: 14px; }
          .hiw-card-stat-value { font-size: 22px; }
          .hiw-bottom-cta-buttons { flex-direction: column; }
          .hiw-hero { min-height: 70vh; padding: 100px 20px 40px; }
        }
      `}</style>
    </div>
  );
}