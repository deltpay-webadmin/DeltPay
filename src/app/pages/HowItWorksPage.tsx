import { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { Globe, CreditCard, TrendingUp, Sparkles, ArrowRight, Check } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import websiteImg from 'figma:asset/6371f372d9648e34936d619f0240fb4443da5f92.png';
import capitalImg from 'figma:asset/294c7fbb10dd1c373bff0764a9c07ba072be56f8.png';
import lensAiImg from 'figma:asset/78721b9b7179a89090d323016aa6b043d0dda27d.png';

/* ── Product Data ── */
const products = [
  {
    id: 'website',
    title: 'Website',
    headline: 'A site that sells — from day one.',
    description:
      'We design and build your entire website: custom to your brand, fast on mobile, and ready to take orders. No templates, no drag-and-drop. A real site, built by real designers, live in under two weeks.',
    bullets: [
      'Custom design that fits your brand and your customers',
      'Fast on every phone and screen size',
      'Hosting, security, and maintenance fully handled',
      'Built so customers and search engines can find you',
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
      'Delt Payments is built right into your site — no extra plugins, no third-party processors. Accept cards, contactless, and online payments with clear pricing. Money lands in your Delt account the same day; standard bank deposits in 1\u20132 business days.',
    bullets: [
      'Works out of the box — no technical setup required',
      'In-person POS, card reader, and contactless tap-to-pay',
      'See every sale as it happens',
      'Secure by default — card data is protected end to end',
    ],
    icon: CreditCard,
    image: 'https://images.unsplash.com/photo-1715635845732-b52d2f408a40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250YWN0bGVzcyUyMHBheW1lbnQlMjBjYXJkJTIwdGVybWluYWwlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzc1MTM3MTczfDA&ixlib=rb-4.1.0&q=80&w=1080',
    color: '#4945FF',
    stat: { value: '2.6%', label: 'Flat processing rate' },
  },
  {
    id: 'capital',
    title: 'Capital',
    headline: 'Get funded based on what you already earn.',
    description:
      'Because Delt already sees your card sales and tracks your business, we can approve you fast — usually within hours. Funding that pays itself back from your daily sales, no equity given up, no personal guarantee required, money in your account in as little as 48 hours.',
    bullets: [
      'Pays itself back from a fixed share of your daily card sales',
      'No equity, no personal guarantee required',
      'Pre-qualified offers waiting in your dashboard',
      'Money in your account in as little as 48 hours',
    ],
    icon: TrendingUp,
    image: capitalImg,
    color: '#4945FF',
    stat: { value: '48 hrs', label: 'Avg. time to funding' },
  },
  {
    id: 'ai',
    title: 'Lens AI',
    headline: 'Your business brain. Available around the clock.',
    description:
      'Lens AI is your always-on business brain. It watches your sales, website traffic, and cash flow around the clock. Ask it anything in plain English and get a real answer. It also spots problems and opportunities before you do.',
    bullets: [
      'Ask questions in plain English — "How did Tuesday compare to last week?"',
      'Alerts you when something unusual happens — before it becomes a problem',
      'Connects your website traffic, card sales, and cash in one view',
      'Tells you what to do, not just what happened',
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

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.5, 1]);
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
            Built for Business Owners
          </div>
          <h1 className="hiw-hero-title">
            Four tools.<br />
            <span className="hiw-hero-title-accent">One place.</span>
          </h1>
          <p className="hiw-hero-sub">
            Start with a website. Add payments. Get funded when you need it. Lens AI ties it all together — so you always know where your business stands.
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
            Everything your business needs.<br />One login. No complexity.
          </h2>
          <p className="hiw-bottom-cta-sub">
            Your website brings customers. Payments capture the sale. Capital funds your next move. Lens AI shows you what’s working — and what isn’t.
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
          overflow: hidden;
          flex-shrink: 0;
        }
        .hiw-card-img-wrap {
          width: 100%; height: 100%;
        }
        .hiw-card-img {
          width: 100%; height: 100%;
          object-fit: cover;
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