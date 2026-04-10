import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'motion/react';
import { ArrowRight, ExternalLink, Globe, CreditCard, Search, Sparkles, Zap, BarChart3, Shield, Eye, TrendingUp, X, Check, Clock, MessageSquare, Palette, Code, Rocket } from 'lucide-react';
import { Link } from 'react-router';
import { ImageMouseTrail } from './ImageMouseTrail';
import { ScrollIndicator } from './ScrollIndicator';
import { AgencyGraphic } from './AgencyGraphic';
import { DomainGraphic } from './DomainGraphic';
import { SpeedGraphic } from './SpeedGraphic';

/* Real site screenshots */
import kuroImage from 'figma:asset/4b959f6beef35f5174284dac44f7eb4795f2294a.png';
import foamyImage from 'figma:asset/088f3daea90ee98aec312e35a83b0dfee399850b.png';
import tundraImage from 'figma:asset/a706f0e4f3a17abebbf6e8e3f419fc45771e6cea.png';
import gringosImage from 'figma:asset/75c26bd891b1a9364a0c6ffff2c13f39ddaca199.png';
import brightSmilesImage from 'figma:asset/5b60ca270d3f0aba22c37bd44b45b1894339e906.png';

/* Premium business images - New Delt mockups */
import clarityDentalImg from 'figma:asset/cd4719fdf9ecda05c463c809fefc3f09b5619964.png';
import roastRitualImg from 'figma:asset/6a31d85dee11b96111731564c371c6630c2e9eac.png';
import apexFitnessImg from 'figma:asset/29b3a1a979e0d3b06347c1d940badfa136b0e30d.png';
import bloomCoImg from 'figma:asset/aa784f0df7d8777f32149f8966d5cde90b88dfb8.png';
import meridianRealtyImg from 'figma:asset/f6460e07e9cba0b217391661a8e5cd8c0669858d.png';
import theGroveImg from 'figma:asset/408a42abed3cdd06ffc909dfc6f496224fbde3b7.png';
import aurumSpaImg from 'figma:asset/abad088739ca83caf2766ca2ae2c5e8fdcd6c0cb.png';

/* Feature walkthrough images */
import domainFeatureImg from 'figma:asset/ef017fc324ce7ff3c59c8bef86869d7625d5c1d6.png';

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════ */
const T = {
  bg: '#03152E',
  surface: '#071D3A',
  card: '#0A2444',
  border: '#163057',
  borderHi: '#1E4070',
  accent: '#4945FF',
  accentLight: '#6C69FF',
  accentDim: 'rgba(73,69,255,0.10)',
  accentGlow: 'rgba(73,69,255,0.35)',
  blue: '#3B82F6',
  green: '#22C55E',
  greenDim: 'rgba(34,197,94,0.10)',
  gold: '#F59E0B',
  white: '#F4F4F6',
  gray1: '#C8CDD8',
  gray2: '#8B95A8',
  gray3: '#5E6A80',
  gray4: '#3A4358',
  serif: "'Instrument Serif', Georgia, serif",
  heading: "'Plus Jakarta Sans', -apple-system, sans-serif",
  sans: "'DM Sans', -apple-system, sans-serif",
};

/* ═══════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 3,
      textTransform: 'uppercase' as const, color: T.accentLight,
      marginBottom: 14, fontFamily: T.sans,
    }}>{children}</div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CAROUSEL SITES DATA
   ═══════════════════════════════════════════════════════════ */
const CAROUSEL_ROW1 = [
  { name: 'Clarity Dental', type: 'Dental Studio', image: clarityDentalImg, color: '#1E3A5F', accent: '#60A5FA' },
  { name: 'Roast & Ritual', type: 'Specialty Coffee', image: roastRitualImg, color: '#2A1E14', accent: '#D4956B' },
  { name: 'Apex Fitness', type: 'Training Studio', image: apexFitnessImg, color: '#0E1F2E', accent: '#67E8F9' },
  { name: 'Bloom & Co', type: 'Florist', image: bloomCoImg, color: '#2A1A2A', accent: '#F4A5D9' },
  { name: 'Kuro', type: 'Fine Dining', image: kuroImage, color: '#1A0F0A', accent: '#D4A574' },
  { name: 'Foamy & Co.', type: 'Artisan Cafe', image: foamyImage, color: '#2A1E14', accent: '#D4956B' },
  { name: 'Gringos', type: 'Barbershop', image: gringosImage, color: '#1A2E1A', accent: '#86EFAC' },
  { name: 'Tundra', type: 'Fashion E-commerce', image: tundraImage, color: '#0E1F2E', accent: '#67E8F9' },
];

const CAROUSEL_ROW2 = [
  { name: 'Meridian Realty', type: 'Real Estate', image: meridianRealtyImg, color: '#1A1A1A', accent: '#E0E0E0' },
  { name: 'The Grove', type: 'Fine Dining', image: theGroveImg, color: '#1A0E0A', accent: '#C89968' },
  { name: 'Aurum Spa', type: 'Wellness & Beauty', image: aurumSpaImg, color: '#1A2422', accent: '#7BC9B5' },
  { name: 'Bright Smiles', type: 'Dental Practice', image: brightSmilesImage, color: '#1E3A5F', accent: '#60A5FA' },
  { name: 'Apex Fitness', type: 'Training Studio', image: apexFitnessImg, color: '#0E1F2E', accent: '#67E8F9' },
  { name: 'Roast & Ritual', type: 'Specialty Coffee', image: roastRitualImg, color: '#2A1E14', accent: '#D4956B' },
  { name: 'Clarity Dental', type: 'Dental Studio', image: clarityDentalImg, color: '#1E3A5F', accent: '#60A5FA' },
  { name: 'Bloom & Co', type: 'Florist', image: bloomCoImg, color: '#2A1A2A', accent: '#F4A5D9' },
];

/* ═══════════════════════════════════════════════════════════
   SITE CARD (for carousel)
   ═══════════════════════════════════════════════════════════ */
function SiteCard({ site }: { site: typeof CAROUSEL_ROW1[0] }) {
  const [hov, setHov] = useState(false);
  const isRealImage = typeof site.image === 'string' ? site.image.startsWith('http') : true;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 320, height: 220, borderRadius: 14, overflow: 'hidden',
        position: 'relative', flexShrink: 0,
        border: `1px solid ${hov ? site.accent + '44' : T.border}`,
        transform: hov ? 'translateY(-4px) scale(1.02)' : 'none',
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        cursor: 'pointer',
      }}
    >
      <img
        src={site.image}
        alt={site.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
        loading="lazy"
      />
      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 40%, transparent 65%)',
      }} />
      {/* Info */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 16px',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: T.sans }}>{site.name}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: T.sans, marginTop: 2 }}>{site.type} · Built with Delt</div>
      </div>
      {/* Hover CTA */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `${T.bg}E6`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: hov ? 1 : 0, transition: 'opacity 0.3s',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', borderRadius: 50,
          background: T.accent, color: '#fff',
          fontSize: 13, fontWeight: 700, fontFamily: T.sans,
        }}>
          View Site <ExternalLink size={14} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCROLLING GALLERY
   ═══════════════════════════════════════════════════════════ */
function ScrollingGallery({ sites, direction = 'left', speed = 40 }: { sites: typeof CAROUSEL_ROW1; direction?: 'left' | 'right'; speed?: number }) {
  const doubled = [...sites, ...sites];
  const CARD_W = 320;
  const GAP = 16;
  const totalW = sites.length * (CARD_W + GAP);
  const keyframeName = direction === 'left' ? 'scrollLeft' : 'scrollRight';

  return (
    <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
      {/* Fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(90deg, ${T.bg}, transparent)`, zIndex: 2 }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(270deg, ${T.bg}, transparent)`, zIndex: 2 }} />
      <div style={{
        display: 'flex', gap: GAP,
        animation: `${keyframeName} ${speed}s linear infinite`,
        width: 'max-content',
      }}>
        {doubled.map((s, i) => <SiteCard key={`${s.name}-${i}`} site={s} />)}
      </div>
      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${totalW}px); }
        }
        @keyframes scrollRight {
          0% { transform: translateX(-${totalW}px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 1: HERO
   ═══════════════════════════════════════════════════════════ */
function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  // Scroll-driven animation: section is 250vh tall, sticky inner viewport
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  // Phase 1 (0–0.35): heading starts centered, snaps upward
  // Phase 2 (0.35–0.6): carousel row 1 fades in from below
  // Phase 3 (0.6–0.85): carousel row 2 fades in from below
  const headingY = useTransform(scrollYProgress, [0, 0.35], [0, -180]);
  const headingScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.85]);

  const c1Opacity = useTransform(scrollYProgress, [0.25, 0.5], [0, 1]);
  const c1Y = useTransform(scrollYProgress, [0.25, 0.5], [80, 0]);

  const c2Opacity = useTransform(scrollYProgress, [0.45, 0.7], [0, 1]);
  const c2Y = useTransform(scrollYProgress, [0.45, 0.7], [80, 0]);

  // Scroll indicator fades out quickly as user starts scrolling
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section
      ref={sectionRef}
      style={{ background: T.bg, position: 'relative', height: '250vh' }}
    >
      {/* Sticky viewport */}
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh', overflow: 'hidden',
      }}>
        {/* Heading — starts dead center, snaps up on scroll */}
        <motion.div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 24px',
            y: headingY,
            scale: headingScale,
          }}
        >
          <div style={{
            maxWidth: 900, textAlign: 'center',
            opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 14px', borderRadius: 50,
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`,
              marginBottom: 28, fontSize: 11, color: T.gray2, fontFamily: T.sans,
            }}>
              <span style={{ color: T.green, fontSize: 8 }}>&#9679;</span>
              Now accepting new merchants
            </div>

            <h1 style={{
              margin: '0 0 24px',
              WebkitFontSmoothing: 'antialiased',
            }}>
              <span style={{
                display: 'block',
                fontSize: 66, fontWeight: 800,
                fontFamily: T.heading,
                color: T.white, letterSpacing: '-0.025em',
                lineHeight: 1.08,
              }}>A website that looks like</span>
              <span style={{
                display: 'block',
                fontSize: 68, fontWeight: 400,
                color: T.accentLight,
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                letterSpacing: '0.005em',
                lineHeight: 1.2,
                marginTop: 4,
              }}>you mean business.</span>
            </h1>

            <p style={{
              fontSize: 16, color: T.gray2, lineHeight: 1.65,
              maxWidth: 480, margin: '0 auto 36px', fontFamily: T.sans,
            }}>
              Your business makes a great first impression in person. Your website should too.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/apply" style={{
                padding: '13px 30px', borderRadius: 50, border: 'none',
                background: `linear-gradient(135deg, ${T.accent}, ${T.blue})`,
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: T.sans, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                Get Your Site <ArrowRight size={16} />
              </Link>
              <a href="#showcase" style={{
                padding: '13px 30px', borderRadius: 50,
                border: `1px solid ${T.border}`, background: 'transparent',
                color: T.gray1, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: T.sans, textDecoration: 'none',
              }}>
                See Examples
              </a>
            </div>
          </div>
        </motion.div>

        {/* Carousel row 1 — slides up into view */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 100, left: 0, right: 0,
            opacity: c1Opacity,
            y: c1Y,
          }}
        >
          <ScrollingGallery sites={CAROUSEL_ROW1} direction="left" speed={42} />
        </motion.div>

        {/* Carousel row 2 — slides up into view after row 1 */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 20, left: 0, right: 0,
            opacity: c2Opacity,
            y: c2Y,
          }}
        >
          <ScrollingGallery sites={CAROUSEL_ROW2} direction="right" speed={48} />
        </motion.div>

        {/* Scroll indicator */}
        <ScrollIndicator style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', opacity: scrollHintOpacity }} />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 2: FEATURE WALKTHROUGH
   ═══════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    key: 'design', label: 'Design',
    title: 'Looks like you hired an agency.',
    desc: 'Hand-crafted templates for restaurants, salons, retailers, law firms, and more. Real typography, real photography, real motion — not generic drag-and-drop.',
    cta: 'Browse templates →',
    icon: Sparkles, color: '#F472B6',
  },
  {
    key: 'domain', label: 'Your Domain',
    title: 'Found first. Chosen first.',
    desc: 'A real domain ranks higher. Your customers find you before they find competitors stuck on subdomains. Plus SSL, instant DNS, and zero-downtime deploys.',
    cta: 'How domains work →',
    icon: Globe, color: '#34D399',
  },
  {
    key: 'golive', label: 'Go Live',
    title: 'Live in 5 days, not 5 months.',
    desc: 'Answer a few questions, pick your style, and our team takes it from there — professional copy, imagery, and integrations included. No agency retainer required.',
    cta: 'Start the process →',
    icon: Zap, color: '#4945FF',
  },
];

function FeaturePreview({ feature }: { feature: typeof FEATURES[0] }) {
  const previews: Record<string, React.ReactNode> = {

    /* ── Design ──────────────────────────────────────────────── */
    design: (
      <AgencyGraphic />
    ),

    /* ── Domain ─────────────────────────────────────────────── */
    domain: (
      <DomainGraphic />
    ),

    /* ── Go Live ─────────────────────────────────────────────── */
    golive: (
      <SpeedGraphic />
    ),
  };
  return <>{previews[feature.key] || null}</>;
}

function FeatureWalkthrough() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-10% 0px -10% 0px' }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const progressHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <>
      <div ref={containerRef} className="we-scroll-container">
        {/* Scrolling left: text sections */}
        <div className="we-text-track">
          {FEATURES.map((f, i) => (
            <div
              key={f.key}
              ref={(el) => { sectionRefs.current[i] = el; }}
              className="we-text-section"
            >
              <div className={`we-text-inner ${activeIndex === i ? 'we-text-active' : ''}`}>
                <span className="we-badge">{f.label}</span>
                <h2 className="we-title">{f.title}</h2>
                <p className="we-desc">{f.desc}</p>
                <span className="we-cta">{f.cta}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sticky right: progress bar + preview */}
        <div className="we-sticky-side">
          {/* Vertical progress bar */}
          <div className="we-progress-bar">
            <motion.div className="we-progress-fill" style={{ height: progressHeight }} />
            <div className="we-progress-dots">
              {FEATURES.map((_, i) => (
                <div
                  key={i}
                  className={`we-dot ${i <= activeIndex ? 'we-dot-active' : ''}`}
                  style={{ top: `${(i / (FEATURES.length - 1)) * 100}%` }}
                >
                  <div className="we-dot-inner" />
                </div>
              ))}
            </div>
          </div>

          {/* Preview stage */}
          <div className="we-preview-stage">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: '100%' }}
              >
                <FeaturePreview feature={FEATURES[activeIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        .we-scroll-container {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1300px;
          margin: 0 auto;
          background: ${T.bg};
        }
        .we-text-track { order: 1; }
        .we-text-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 80px 60px;
        }
        .we-text-inner {
          opacity: 0.25;
          transform: translateY(12px);
          transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1),
                      transform 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        .we-text-active {
          opacity: 1;
          transform: translateY(0);
        }
        .we-badge {
          display: inline-block;
          font-family: ${T.heading};
          font-size: 12px;
          font-weight: 700;
          color: ${T.accentLight};
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .we-title {
          font-family: ${T.heading};
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 800;
          color: ${T.white};
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0 0 20px;
          -webkit-font-smoothing: antialiased;
        }
        .we-desc {
          font-family: ${T.sans};
          font-size: 15px;
          color: ${T.gray2};
          line-height: 1.7;
          margin: 0 0 28px;
          max-width: 400px;
        }
        .we-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: ${T.sans};
          font-size: 14px;
          font-weight: 700;
          color: ${T.accentLight};
          cursor: pointer;
          transition: gap 0.25s;
        }
        .we-cta:hover { gap: 12px; }
        .we-sticky-side {
          order: 2;
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          padding: 40px 60px 40px 20px;
          gap: 24px;
        }
        .we-progress-bar {
          position: relative;
          width: 3px;
          height: 300px;
          background: ${T.gray4};
          border-radius: 999px;
          flex-shrink: 0;
        }
        .we-progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(180deg, ${T.accent} 0%, ${T.green} 100%);
          border-radius: 999px;
        }
        .we-progress-dots {
          position: absolute;
          top: 0;
          left: 50%;
          height: 100%;
          transform: translateX(-50%);
        }
        .we-dot {
          position: absolute;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${T.bg};
          border: 2.5px solid ${T.gray4};
          transition: border-color 0.4s, box-shadow 0.4s;
        }
        .we-dot-active {
          border-color: ${T.accent};
          box-shadow: 0 0 0 4px rgba(73,69,255,0.2);
        }
        .we-dot-inner {
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          background: ${T.accent};
          transform: scale(0);
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .we-dot-active .we-dot-inner {
          transform: scale(1);
        }
        .we-preview-stage {
          flex: 1;
          min-height: 440px;
          border-radius: 20px;
          overflow: hidden;
          background: ${T.surface};
          border: 1px solid ${T.border};
          position: relative;
          box-shadow: 0 30px 80px rgba(0,0,0,0.25), 0 4px 20px rgba(0,0,0,0.15);
        }
        @media (max-width: 900px) {
          .we-scroll-container { grid-template-columns: 1fr; }
          .we-sticky-side {
            position: relative;
            height: auto;
            padding: 40px 20px;
            order: 1;
          }
          .we-text-track { order: 2; }
          .we-text-section { min-height: auto; padding: 40px 20px; }
          .we-text-inner { opacity: 1; transform: none; }
          .we-progress-bar { display: none; }
          .we-preview-stage { min-height: 320px; }
        }
      `}</style>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 3: ECOSYSTEM STRIP  — 3D flip cards
   ══════════════════════════════════════════════════════════ */
const ECO_ITEMS = [
  {
    label: 'Website & Storefront', num: '01',
    icon: Globe,
    frontHeadline: 'Outdated Storefronts',
    frontSubtext: 'Most business sites are static brochures that are hard to update and slow to load.',
    backTitle: 'Dynamic Presence',
    backBody: 'We build high-conversion sites that are natively wired into your payments. No agencies, no technical debt—just a storefront that works as hard as you do.',
    backTag: 'Auto-optimized for SEO.',
    accentColor: '#4945FF',
  },
  {
    label: 'Data & Insights', num: '02',
    icon: Eye,
    frontHeadline: 'Flying Blind',
    frontSubtext: 'Spreadsheets and "Business Intelligence" tools take too much time to decipher.',
    backTitle: 'Autonomous Intelligence',
    backBody: 'Lens acts as your digital analyst, spotting revenue leaks and drafting customer re-engagement offers before you even ask.',
    backTag: 'Decisions, not just dashboards.',
    accentColor: '#6C69FF',
  },
  {
    label: 'Payments & Commerce', num: '03',
    icon: CreditCard,
    frontHeadline: 'Hidden Fees & Delays',
    frontSubtext: 'Traditional processors lock your cash behind 3-day windows and complicated rates.',
    backTitle: 'Instant Liquidity',
    backBody: 'Get paid the moment you make a sale. Our unified system offers instant settlement and transparent pricing, keeping your cash flow moving.',
    backTag: 'Real-time settlement.',
    accentColor: '#3B82F6',
  },
  {
    label: 'Funding & Capital', num: '04',
    icon: TrendingUp,
    frontHeadline: 'The Funding Gap',
    frontSubtext: 'Applying for a loan shouldn\'t feel like a second job with endless paperwork and weeks of waiting.',
    backTitle: 'Frictionless Capital',
    backBody: 'Because we process your payments, we already know you\'re a good bet. Access revenue-based funding with zero applications and 48-hour payouts.',
    backTag: 'Pre-approved by performance.',
    accentColor: '#22C55E',
  },
];

function EcoFlipCard({ item, index }: { item: typeof ECO_ITEMS[0]; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = item.icon;

  return (
    <Reveal delay={index * 80}>
      <div
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        style={{ perspective: 800, cursor: 'pointer' }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{
            transformStyle: 'preserve-3d',
            position: 'relative',
            height: 224,
          }}
        >
          {/* ── FRONT FACE (The Problem) ── */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: T.card,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 12, padding: '36px 24px',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${item.accentColor}18`,
              border: `1px solid ${item.accentColor}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={18} color={item.accentColor} strokeWidth={2.5} />
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
              color: T.gray4, fontFamily: T.sans,
            }}>{item.label}</span>
            <span style={{
              fontSize: 20, fontWeight: 800, letterSpacing: -0.5,
              color: T.white, fontFamily: T.heading,
              WebkitFontSmoothing: 'antialiased', textAlign: 'center',
            }}>{item.frontHeadline}</span>
            <span style={{
              fontSize: 12, color: T.gray2, fontFamily: T.sans, lineHeight: 1.6,
              textAlign: 'center', maxWidth: 220,
            }}>{item.frontSubtext}</span>
          </div>

          {/* ── BACK FACE ── */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(160deg, ${T.card} 0%, #041E42 100%)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '16px 14px', gap: 0, overflow: 'hidden',
          }}>
            {/* Subtle accent glow */}
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 80, height: 80, borderRadius: '50%',
              background: `radial-gradient(circle, ${item.accentColor}20, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            {/* Title */}
            <span style={{
              fontSize: 16, fontWeight: 800, color: T.white,
              fontFamily: T.heading, letterSpacing: -0.3,
              WebkitFontSmoothing: 'antialiased', marginBottom: 8, textAlign: 'center',
            }}>{item.backTitle}</span>

            {/* Body */}
            <span style={{
              fontSize: 11, color: T.gray1, fontFamily: T.sans,
              lineHeight: 1.65, textAlign: 'center', maxWidth: 240, marginBottom: 12,
            }}>{item.backBody}</span>

            {/* Tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 6,
              background: 'rgba(22,199,132,0.1)',
              border: '1px solid rgba(22,199,132,0.25)',
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: '#16C784',
                boxShadow: '0 0 6px rgba(22,199,132,0.5)',
              }} />
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#16C784',
                fontFamily: T.sans, letterSpacing: 0.2,
              }}>{item.backTag}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </Reveal>
  );
}

const HIW_STEPS = [
  {
    number: '1',
    title: 'Strategic Discovery',
    description:
      'A focused consultation to understand your goals, audience, and competitive landscape — then we architect a site built to perform.',
    expandedDetails: {
      subtitle: 'One conversation. Total clarity.',
      bullets: [
        { icon: MessageSquare, text: 'A deep-dive call to map your goals, audience, and competitors' },
        { icon: BarChart3, text: 'Competitive analysis of your industry landscape' },
        { icon: Palette, text: 'Brand alignment — tone, visuals, and positioning' },
        { icon: Clock, text: 'Timeline and milestone planning tailored to your launch' },
      ],
      stat: { value: '1 hr', label: 'Average discovery session' },
    },
  },
  {
    number: '2',
    title: 'Design, Refinement & Launch',
    description:
      'You review a fully designed site before anything goes live. We refine to your standard, then handle hosting, security, and infrastructure.',
    expandedDetails: {
      subtitle: 'Pixel-perfect. Battle-tested. Yours.',
      bullets: [
        { icon: Palette, text: 'Full design mockup delivered for your review and feedback' },
        { icon: Code, text: 'Responsive development across every device and browser' },
        { icon: Shield, text: 'SSL, hosting, security, and infrastructure — all handled' },
        { icon: Rocket, text: 'Launch-day QA and performance optimization included' },
      ],
      stat: { value: '5 days', label: 'Average design-to-launch' },
    },
  },
  {
    number: '3',
    title: 'Revenue-Ready From Day One',
    description:
      'Your site launches with payments fully integrated. No delays, no dependencies — just a digital presence that converts immediately.',
    expandedDetails: {
      subtitle: 'Go live. Get paid. Immediately.',
      bullets: [
        { icon: CreditCard, text: 'Delt payment processing built in from launch — no plugins' },
        { icon: Shield, text: 'PCI-compliant, encrypted transactions by default' },
        { icon: BarChart3, text: 'Real-time sales dashboard and analytics from minute one' },
        { icon: Check, text: 'Ongoing support and updates — we never disappear' },
      ],
      stat: { value: '$0', label: 'Extra integration cost' },
    },
  },
];

function HowItWorksStrip() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  useEffect(() => {
    if (selectedStep !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedStep]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedStep(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const selectedData = selectedStep !== null ? HIW_STEPS[selectedStep] : null;

  return (
    <section style={{ background: T.bg, padding: '100px 24px 100px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <h3 style={{
            fontSize: 'clamp(38px, 6vw, 67px)', fontWeight: 800, color: T.white,
            margin: '0 0 16px', letterSpacing: -1, fontFamily: T.heading,
            WebkitFontSmoothing: 'antialiased',
          }}>
            How it <span style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              color: '#4945FF',
              fontWeight: 700,
            }}>works</span>
          </h3>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', marginBottom: 56, fontFamily: T.sans, maxWidth: 480, margin: '0 auto 60px', lineHeight: 1.7 }}>
            Building a world-class digital presence shouldn't be complicated. We've simplified the process without compromising the result.
          </p>
        </Reveal>

        {/* Steps grid */}
        <div className="hiw-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, position: 'relative', alignItems: 'stretch' }}>
          {HIW_STEPS.map((step, i) => (
            <Reveal key={step.number} delay={i * 120}>
              <motion.button
                layoutId={`hiw-card-${step.number}`}
                onClick={() => setSelectedStep(i)}
                className="hiw-card"
                style={{
                  position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none',
                  padding: '44px 28px 40px', borderRadius: 20, height: '100%',
                  fontFamily: T.sans, width: '100%',
                }}
                whileHover={{ scale: 1.03, borderColor: 'rgba(73,69,255,0.3)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <motion.div
                  layoutId={`hiw-circle-${step.number}`}
                  style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4945FF, #6B68FF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 24, boxShadow: '0 8px 24px rgba(73,69,255,0.25)',
                  }}
                >
                  <motion.span
                    layoutId={`hiw-num-${step.number}`}
                    style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}
                  >
                    {step.number}
                  </motion.span>
                </motion.div>
                <motion.h4
                  layoutId={`hiw-title-${step.number}`}
                  style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}
                >
                  {step.title}
                </motion.h4>
                <motion.p
                  layoutId={`hiw-desc-${step.number}`}
                  style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}
                >
                  {step.description}
                </motion.p>
              </motion.button>
            </Reveal>
          ))}
        </div>

        <style>{`
          .hiw-card { transition: border-color 0.3s ease, background 0.3s ease; }
          .hiw-card:hover { background: rgba(255,255,255,0.06) !important; }
          @media (max-width: 768px) {
            .hiw-steps-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          }
        `}</style>
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {selectedStep !== null && selectedData && (
          <>
            <motion.div
              style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedStep(null)}
            />
            <div style={{ position: 'fixed', inset: 0, zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, pointerEvents: 'none' }}>
              <motion.div
                layoutId={`hiw-card-${selectedData.number}`}
                style={{
                  background: '#0A1628', borderRadius: 24, boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)',
                  width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
                  pointerEvents: 'auto', position: 'relative',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <button
                  onClick={() => setSelectedStep(null)}
                  style={{
                    position: 'absolute', top: 24, right: 24, zIndex: 10,
                    width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.7)' }} />
                </button>

                <div style={{ padding: '40px 40px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
                    <motion.div
                      layoutId={`hiw-circle-${selectedData.number}`}
                      style={{
                        width: 80, height: 80, borderRadius: '50%', background: '#4945FF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: '0 8px 24px rgba(73,69,255,0.25)',
                      }}
                    >
                      <motion.span layoutId={`hiw-num-${selectedData.number}`} style={{ fontSize: 30, fontWeight: 800, color: '#fff' }}>
                        {selectedData.number}
                      </motion.span>
                    </motion.div>
                    <div style={{ flex: 1, paddingTop: 4 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4945FF', marginBottom: 8 }}>
                        Step {selectedData.number}
                      </div>
                      <motion.h3 layoutId={`hiw-title-${selectedData.number}`} style={{ fontSize: 26, fontWeight: 800, color: T.white, margin: 0 }}>
                        {selectedData.title}
                      </motion.h3>
                    </div>
                  </div>
                </div>

                <motion.div style={{ padding: '16px 40px 0' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.15 }}>
                  <p style={{ fontSize: 17, color: '#4945FF', fontWeight: 600, fontFamily: T.sans }}>{selectedData.expandedDetails.subtitle}</p>
                </motion.div>

                <div style={{ padding: '16px 40px 0' }}>
                  <motion.p layoutId={`hiw-desc-${selectedData.number}`} style={{ fontSize: 15, color: T.gray3, lineHeight: 1.65 }}>
                    {selectedData.description}
                  </motion.p>
                </div>

                <motion.div style={{ padding: '28px 40px 0' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.2 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {selectedData.expandedDetails.bullets.map((bullet, idx) => {
                      const IconComp = bullet.icon;
                      return (
                        <motion.div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + idx * 0.07 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(73,69,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <IconComp style={{ width: 20, height: 20, color: '#4945FF' }} />
                          </div>
                          <p style={{ color: 'rgba(255,255,255,0.8)', paddingTop: 8, lineHeight: 1.6, fontSize: 14, margin: 0 }}>{bullet.text}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div style={{ padding: '28px 40px 40px' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.4 }}>
                  <div style={{ background: 'rgba(73,69,255,0.08)', border: '1px solid rgba(73,69,255,0.15)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#4945FF' }}>{selectedData.expandedDetails.stat.value}</div>
                    <div style={{ fontSize: 14, color: T.gray3 }}>{selectedData.expandedDetails.stat.label}</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 4: MOUSE TRAIL INTERACTIVE
   ═══════════════════════════════════════════════════════════ */
const trailImages = [
  'https://images.unsplash.com/photo-1706700392626-5279fb90ae73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1649000808933-1f4aac7cad9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1556712955-d2072199f5d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1763259109035-214a66cbd4c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1761778304143-4c89e7dd2457?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1691096673900-014e7ff94636?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1770581939371-326fc1537f10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  'https://images.unsplash.com/photo-1614812511804-a62c6ce2f5fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
];

function Testimonials() {
  return (
    <section style={{ background: '#FFFFFF' }}>
      <ImageMouseTrail
        items={trailImages}
        maxNumberOfImages={5}
        distance={25}
        imgClass="sm:w-40 w-28 sm:h-48 h-36"
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', padding: '4rem 1.5rem',
          }}
        >
          <article style={{ position: 'relative', zIndex: 50, mixBlendMode: 'difference' }}>
            <h2 style={{
              fontSize: 'clamp(36px, 8vw, 80px)',
              fontWeight: 700,
              color: '#FFFFFF',
              textAlign: 'center',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              fontFamily: T.heading,
            }}>
              we create<br />beautiful websites
            </h2>
          </article>
        </div>
      </ImageMouseTrail>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 5: SHOWCASE GRID — Premium Framer-style gallery
   ══════════════════════════════════════════════════════════ */
const showcaseSpaImg = 'https://images.unsplash.com/photo-1769011496342-2bd1ad232d8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjB3ZWxsbmVzcyUyMGludGVyaW9yJTIwbW9kZXJufGVufDF8fHx8MTc3MjgyOTE0Nnww&ixlib=rb-4.1.0&q=80&w=1080';
const showcaseArchImg = 'https://images.unsplash.com/photo-1674981208693-de5a9c4c4f44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNoaXRlY3R1cmUlMjBmaXJtJTIwbW9kZXJuJTIwYnVpbGRpbmclMjBkZXNpZ258ZW58MXx8fHwxNzcyODI5MTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080';
const showcaseBarImg = 'https://images.unsplash.com/photo-1767022724924-993b00fc04b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGJhciUyMGRhcmslMjBtb29keSUyMGludGVyaW9yfGVufDF8fHx8MTc3MjgyOTE1MXww&ixlib=rb-4.1.0&q=80&w=1080';
const showcaseBakeryImg = 'https://images.unsplash.com/photo-1719512039766-ca2f92cad537?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwYmFrZXJ5JTIwcGFzdHJ5JTIwZGlzcGxheSUyMGVsZWdhbnR8ZW58MXx8fHwxNzcyODI5MTQ4fDA&ixlib=rb-4.1.0&q=80&w=1080';

/* ── Background images for rendered previews ── */
const kuroHeroImg = 'https://images.unsplash.com/photo-1766832255363-c9f060ade8b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcmVzdGF1cmFudCUyMGRhcmslMjBlbGVnYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzcyODM0NjA1fDA&ixlib=rb-4.1.0&q=80&w=1080';
const foamyHeroImg = 'https://images.unsplash.com/photo-1758417675743-0c97ae21e2ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGVjaWFsdHklMjBjb2ZmZWUlMjBsYXR0ZSUyMGFydCUyMGNvenklMjBjYWZlfGVufDF8fHx8MTc3MjgzNDYwNnww&ixlib=rb-4.1.0&q=80&w=1080';
const tundraHeroImg = 'https://images.unsplash.com/photo-1635650804263-1a1941e14df5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBzdHJlZXR3ZWFyJTIwdXJiYW4lMjBzdHlsZXxlbnwxfHx8fDE3NzI4MDIyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080';
const gringosHeroImg = 'https://images.unsplash.com/photo-1768938896401-fe52fd18d3af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJiZXJzaG9wJTIwaGFpcmN1dCUyMHZpbnRhZ2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzI4MzQ2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080';

/* ── Fake Website Preview Renderers ──
   These render mini website UIs so every showcase card looks like
   a real premium website screenshot, not just a raw photo. */
const F = { sans: "'Plus Jakarta Sans', sans-serif", serif: "'Instrument Serif', Georgia, serif" };

function KuroPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0A0806', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <img src={kuroHeroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px' }}>
          <span style={{ fontSize: 13, fontWeight: 300, letterSpacing: 6, color: '#D4A574', fontFamily: F.serif, fontStyle: 'italic' }}>Kuro</span>
          <div style={{ display: 'flex', gap: 14 }}>
            {['Menu', 'Reserve', 'Private Dining'].map(n => <span key={n} style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5 }}>{n}</span>)}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 7, letterSpacing: 5, color: '#D4A574', marginBottom: 12, textTransform: 'uppercase' as const, fontWeight: 600 }}>FINE DINING EXPERIENCE</div>
          <div style={{ fontSize: 28, fontWeight: 300, color: '#fff', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 10 }}>Where Flavor<br/>Meets Art.</div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 180, marginBottom: 16 }}>An intimate culinary journey through seasonal Japanese-inspired cuisine.</div>
          <div style={{ padding: '7px 22px', borderRadius: 50, border: '1px solid #D4A574', fontSize: 8, fontWeight: 700, color: '#D4A574', letterSpacing: 0.5 }}>Reserve a Table</div>
        </div>
        <div style={{ padding: '10px 18px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[{ l: 'Tasting Menu', p: '$185' }, { l: 'Omakase', p: '$250' }, { l: 'Wine Pairing', p: '+$95' }].map(m => (
              <div key={m.l} style={{ textAlign: 'center' as const, padding: '6px 10px', background: 'rgba(212,165,116,0.06)', borderRadius: 8, border: '1px solid rgba(212,165,116,0.1)' }}>
                <div style={{ fontSize: 7, fontWeight: 600, color: '#fff' }}>{m.l}</div>
                <div style={{ fontSize: 7, color: '#D4A574', marginTop: 1 }}>{m.p}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FoamyPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#1C1410', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <img src={foamyHeroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#C4956B' }}>FOAMY & CO.</span>
          <div style={{ display: 'flex', gap: 14 }}>
            {['Menu', 'Locations', 'Order'].map(n => <span key={n} style={{ fontSize: 7, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>{n}</span>)}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 18px' }}>
          <div style={{ fontSize: 7, letterSpacing: 4, color: '#C4956B', marginBottom: 10, textTransform: 'uppercase' as const, fontWeight: 600 }}>ARTISAN COFFEE ROASTERS</div>
          <div style={{ fontSize: 26, fontWeight: 300, color: '#fff', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.15, marginBottom: 8 }}>Crafted<br/>with Care.</div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 170, marginBottom: 16 }}>Single-origin beans roasted in-house. Every cup tells a story from farm to table.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ padding: '7px 18px', borderRadius: 50, background: '#C4956B', fontSize: 8, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>Order Ahead</div>
            <div style={{ padding: '7px 18px', borderRadius: 50, border: '1px solid rgba(196,149,107,0.3)', fontSize: 8, fontWeight: 600, color: '#C4956B', letterSpacing: 0.5 }}>Our Story</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '10px 18px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[{ name: 'Espresso', price: '$4.50' }, { name: 'Americano', price: '$5.00' }, { name: 'Mocha', price: '$6.50' }].map(c => (
            <div key={c.name} style={{ flex: 1, background: 'rgba(196,149,107,0.06)', borderRadius: 8, padding: 8, border: '1px solid rgba(196,149,107,0.1)' }}>
              <div style={{ fontSize: 7, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{c.name}</div>
              <div style={{ fontSize: 7, color: '#C4956B' }}>{c.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TundraPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#F8F8F6', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3, color: '#0E1F2E', textTransform: 'uppercase' as const }}>TUNDRA</span>
        <div style={{ display: 'flex', gap: 14 }}>
          {['New', 'Men', 'Women', 'Sale'].map(n => <span key={n} style={{ fontSize: 7, color: 'rgba(0,0,0,0.4)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ padding: '10px 18px 8px' }}>
        <div style={{ fontSize: 7, letterSpacing: 3, color: 'rgba(0,0,0,0.3)', fontWeight: 600, marginBottom: 4 }}>NEW ARRIVALS FOR 2026</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 18px' }}>
        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '3/4' }}>
          <img src={tundraHeroImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: '#fff' }}>Technical Parka</div>
            <div style={{ fontSize: 7, color: '#67E8F9' }}>$320</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[{ name: 'Down Vest', price: '$180', bg: '#E8E6E0' }, { name: 'Rain Shell', price: '$240', bg: '#D4D8DC' }].map(p => (
            <div key={p.name} style={{ flex: 1, background: p.bg, borderRadius: 10, padding: '12px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: '#1A1A1A' }}>{p.name}</div>
              <div style={{ fontSize: 7, color: 'rgba(0,0,0,0.5)' }}>{p.price}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 18px', marginTop: 8, borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Jackets', 'Boots', 'Layers', 'Accessories'].map(c => (
            <div key={c} style={{ padding: '5px 10px', borderRadius: 50, border: '1px solid rgba(0,0,0,0.08)', fontSize: 7, color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>{c}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GringosPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0E1A0E', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <img src={gringosHeroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#86EFAC', textTransform: 'uppercase' as const }}>GRINGOS</span>
          <div style={{ display: 'flex', gap: 14 }}>
            {['Services', 'Locations', 'Shop', 'Book Now'].map(n => <span key={n} style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>{n}</span>)}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 18px' }}>
          <div style={{ fontSize: 7, letterSpacing: 4, color: '#86EFAC', marginBottom: 12, textTransform: 'uppercase' as const, fontWeight: 600 }}>PREMIUM BARBERSHOP EST. 2005</div>
          <div style={{ fontSize: 28, fontWeight: 300, color: '#fff', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 10 }}>Craft. Sharp.<br/>Results.</div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 170, marginBottom: 16 }}>Traditional barbering meets modern style. Walk-ins welcome, appointments preferred.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ padding: '7px 18px', borderRadius: 50, background: '#86EFAC', fontSize: 8, fontWeight: 700, color: '#0E1A0E', letterSpacing: 0.5 }}>Book Now</div>
            <div style={{ padding: '7px 18px', borderRadius: 50, border: '1px solid rgba(134,239,172,0.3)', fontSize: 8, fontWeight: 600, color: '#86EFAC', letterSpacing: 0.5 }}>Services</div>
          </div>
        </div>
        <div style={{ padding: '10px 18px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ name: 'Classic Cut', price: '$35' }, { name: 'Fade & Beard', price: '$55' }, { name: 'Hot Towel Shave', price: '$40' }].map(s => (
              <div key={s.name} style={{ flex: 1, background: 'rgba(134,239,172,0.05)', borderRadius: 8, padding: 8, border: '1px solid rgba(134,239,172,0.1)' }}>
                <div style={{ fontSize: 7, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 7, color: '#86EFAC' }}>{s.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AuraPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0C0A14', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <img src={aurumSpaImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#A78BFA', textTransform: 'uppercase' as const }}>AURA</span>
          <div style={{ display: 'flex', gap: 14 }}>
            {['Services', 'About', 'Book'].map(n => <span key={n} style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>{n}</span>)}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 7, letterSpacing: 4, color: '#A78BFA', marginBottom: 10, textTransform: 'uppercase' as const, fontWeight: 600 }}>LUXURY WELLNESS STUDIO</div>
          <div style={{ fontSize: 26, fontWeight: 300, color: '#fff', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.15, marginBottom: 8 }}>Find Your<br/>Inner Balance</div>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: 180, marginBottom: 16 }}>A sanctuary designed for renewal. Premium spa experiences tailored to you.</div>
          <div style={{ padding: '7px 22px', borderRadius: 50, background: '#A78BFA', fontSize: 8, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>Book Your Experience</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[{ n: '12+', l: 'Treatments' }, { n: '4.9', l: 'Rating' }, { n: '8K', l: 'Clients' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#A78BFA' }}>{s.n}</div>
              <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AtelierPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#F5F3EE', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: '#1A1A1A', textTransform: 'uppercase' as const }}>ATELIER</span>
        <div style={{ display: 'flex', gap: 14 }}>
          {['Projects', 'Studio', 'Contact'].map(n => <span key={n} style={{ fontSize: 7, color: 'rgba(0,0,0,0.4)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ position: 'relative', height: '52%', overflow: 'hidden' }}>
        <img src={showcaseArchImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ fontSize: 7, letterSpacing: 3, color: 'rgba(0,0,0,0.35)', marginBottom: 8, textTransform: 'uppercase' as const, fontWeight: 600 }}>FEATURED PROJECT</div>
        <div style={{ fontSize: 20, fontWeight: 300, color: '#1A1A1A', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.15, marginBottom: 8 }}>The Meridian<br/>Tower</div>
        <div style={{ fontSize: 7, color: 'rgba(0,0,0,0.4)', lineHeight: 1.7, marginBottom: 14 }}>A 42-story mixed-use development redefining the downtown skyline with sustainable design.</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ padding: '6px 16px', borderRadius: 50, background: '#1A1A1A', fontSize: 7, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>View Project</div>
          <div style={{ padding: '6px 16px', borderRadius: 50, border: '1px solid rgba(0,0,0,0.15)', fontSize: 7, fontWeight: 600, color: '#1A1A1A', letterSpacing: 0.5 }}>All Work</div>
        </div>
      </div>
    </div>
  );
}

function NoirPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0D0D0D', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <img src={showcaseBarImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px' }}>
          <span style={{ fontSize: 12, fontWeight: 300, letterSpacing: 6, color: '#F472B6', fontFamily: F.serif, fontStyle: 'italic' }}>Noir</span>
          <div style={{ display: 'flex', gap: 14 }}>
            {['Menu', 'Reserve', 'Events'].map(n => <span key={n} style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5 }}>{n}</span>)}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 18px' }}>
          <div style={{ fontSize: 7, letterSpacing: 4, color: '#F472B6', marginBottom: 12, textTransform: 'uppercase' as const, fontWeight: 600 }}>COCKTAIL LOUNGE & BAR</div>
          <div style={{ fontSize: 28, fontWeight: 300, color: '#fff', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 10 }}>Every Sip,<br/>a Story.</div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 170, marginBottom: 16 }}>Craft cocktails. Rare spirits. An atmosphere that turns strangers into regulars.</div>
          <div style={{ padding: '7px 18px', borderRadius: 50, border: '1px solid #F472B6', fontSize: 7, fontWeight: 700, color: '#F472B6', letterSpacing: 0.5, display: 'inline-block', width: 'fit-content' }}>Reserve a Table</div>
        </div>
        <div style={{ padding: '10px 18px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 6, letterSpacing: 2, color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>SIGNATURE COCKTAILS</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ name: 'Velvet Dusk', price: '$18' }, { name: 'Midnight Bloom', price: '$22' }, { name: 'Smoke & Ember', price: '$20' }].map(c => (
              <div key={c.name} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 7, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: 7, color: '#F472B6' }}>{c.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MaisonPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#FDF8F0', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize: 13, fontWeight: 300, letterSpacing: 2, color: '#8B6914', fontFamily: F.serif, fontStyle: 'italic' }}>Maison</span>
        <div style={{ display: 'flex', gap: 14 }}>
          {['Menu', 'Catering', 'Visit'].map(n => <span key={n} style={{ fontSize: 7, color: 'rgba(0,0,0,0.35)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ position: 'relative', height: '48%', overflow: 'hidden' }}>
        <img src={showcaseBakeryImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #FDF8F0 0%, transparent 50%)' }} />
      </div>
      <div style={{ padding: '4px 18px 14px' }}>
        <div style={{ fontSize: 7, letterSpacing: 4, color: '#C4956B', marginBottom: 8, textTransform: 'uppercase' as const, fontWeight: 600 }}>ARTISAN PÂTISSERIE</div>
        <div style={{ fontSize: 22, fontWeight: 300, color: '#3D2B1F', fontFamily: F.serif, fontStyle: 'italic', lineHeight: 1.15, marginBottom: 8 }}>Baked with<br/>Passion.</div>
        <div style={{ fontSize: 7, color: 'rgba(0,0,0,0.4)', lineHeight: 1.7, marginBottom: 14 }}>French-inspired pastries crafted daily. From croissants to custom celebration cakes.</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ padding: '6px 18px', borderRadius: 50, background: '#8B6914', fontSize: 7, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>Order Now</div>
          <div style={{ padding: '6px 18px', borderRadius: 50, border: '1px solid rgba(139,105,20,0.3)', fontSize: 7, fontWeight: 600, color: '#8B6914', letterSpacing: 0.5 }}>Our Menu</div>
        </div>
      </div>
      <div style={{ padding: '0 18px 14px', display: 'flex', gap: 8 }}>
        {[{ name: 'Croissants', from: '$4' }, { name: 'Tarts', from: '$8' }, { name: 'Macarons', from: '$3' }].map(it => (
          <div key={it.name} style={{ flex: 1, background: 'rgba(139,105,20,0.05)', borderRadius: 8, padding: 8, border: '1px solid rgba(139,105,20,0.1)', textAlign: 'center' as const }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: '#3D2B1F' }}>{it.name}</div>
            <div style={{ fontSize: 7, color: '#8B6914', marginTop: 1 }}>from {it.from}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SITE_PREVIEWS: Record<string, React.FC> = {
  'Kuro': KuroPreview,
  'Foamy & Co.': FoamyPreview,
  'Tundra': TundraPreview,
  'Gringos': GringosPreview,
  'Aura Wellness': AuraPreview,
  'Atelier': AtelierPreview,
  'Noir': NoirPreview,
  'Maison': MaisonPreview,
};

const SHOWCASE_SITES = [
  { name: 'Kuro', type: 'Restaurant', image: kuroImage, accent: '#D4A574' },
  { name: 'Foamy & Co.', type: 'Café', image: foamyImage, accent: '#C4956B' },
  { name: 'Tundra', type: 'E-commerce', image: tundraImage, accent: '#67E8F9' },
  { name: 'Gringos', type: 'Barbershop', image: gringosImage, accent: '#86EFAC' },
  { name: 'Aura Wellness', type: 'Spa & Wellness', image: aurumSpaImg, accent: '#A78BFA' },
  { name: 'Atelier', type: 'Architecture', image: meridianRealtyImg, accent: '#60A5FA' },
  { name: 'Noir', type: 'Cocktail Bar', image: bloomCoImg, accent: '#F472B6' },
  { name: 'Maison', type: 'Pâtisserie', image: roastRitualImg, accent: '#FBBF24' },
];

function ShowcaseCard({ site, index }: { site: typeof SHOWCASE_SITES[0]; index: number }) {
  const [hov, setHov] = useState(false);
  const PreviewComponent = SITE_PREVIEWS[site.name];

  return (
    <Reveal delay={index * 60}>
      <motion.div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        animate={{ y: hov ? -8 : 0, scale: hov ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ borderRadius: 16, overflow: 'hidden', cursor: 'pointer', position: 'relative', background: T.card }}
      >
        {/* Tall dominant screenshot or rendered website preview */}
        <div style={{ position: 'relative', aspectRatio: '4 / 5', overflow: 'hidden', borderRadius: 16 }}>
          {PreviewComponent ? (
            <motion.div
              animate={{ scale: hov ? 1.03 : 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%', height: '100%', transformOrigin: 'top center' }}
            >
              <PreviewComponent />
            </motion.div>
          ) : (
            <motion.img
              src={site.image} alt={site.name} loading="lazy"
              animate={{ scale: hov ? 1.05 : 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
            />
          )}
          {/* Hover overlay */}
          <motion.div
            animate={{ opacity: hov ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(3,21,46,0.55)',
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            }}
          >
            <motion.div
              animate={{ y: hov ? 0 : 12, opacity: hov ? 1 : 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 50,
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: T.sans, letterSpacing: 0.3,
              }}
            >
              View Site <ExternalLink size={14} strokeWidth={2} />
            </motion.div>
          </motion.div>
          {/* Accent line at bottom */}
          <motion.div
            animate={{ scaleX: hov ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: site.accent, transformOrigin: 'left' }}
          />
        </div>

        {/* Minimal info — Framer-style */}
        <div style={{ padding: '16px 4px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: site.accent, flexShrink: 0,
            boxShadow: hov ? `0 0 8px ${site.accent}88` : 'none', transition: 'box-shadow 0.3s',
          }} />
          <span style={{
            fontSize: 14, fontWeight: 700, color: T.white, fontFamily: T.heading,
            letterSpacing: -0.2, WebkitFontSmoothing: 'antialiased', flex: 1,
          }}>{site.name}</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: T.gray3, fontFamily: T.sans, flexShrink: 0 }}>{site.type}</span>
        </div>
      </motion.div>
    </Reveal>
  );
}

function ShowcaseGrid() {
  return (
    <section id="showcase" style={{ background: T.bg, padding: '100px 24px 80px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Label>FEATURED SITES</Label>
            <h2 style={{
              fontSize: 'clamp(32px, 5.5vw, 52px)', fontWeight: 800, color: T.white,
              letterSpacing: -1, fontFamily: T.heading, margin: '0 0 14px',
              WebkitFontSmoothing: 'antialiased',
            }}>
              See what we've built.
            </h2>
            <p style={{ fontSize: 15, color: T.gray3, fontFamily: T.sans }}>
              Real businesses. Real results. All powered by Delt.
            </p>
          </div>
        </Reveal>

        <div className="showcase-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
        }}>
          {SHOWCASE_SITES.map((site, i) => (
            <ShowcaseCard key={site.name} site={site} index={i} />
          ))}
        </div>
        <style>{`
          @media (max-width: 1024px) { .showcase-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 600px) { .showcase-grid { grid-template-columns: 1fr !important; max-width: 400px; margin: 0 auto !important; } }
        `}</style>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 6: FINAL CTA
   ═══════════════════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section style={{
      background: 'linear-gradient(180deg, #F8F9FB 0%, #FFFFFF 50%, #F8F9FB 100%)',
      padding: '80px 24px 100px', textAlign: 'center',
      borderTop: `1px solid #E2E6ED`,
    }}>
      <Reveal>
        <h2 style={{
          fontSize: 'clamp(32px, 5.5vw, 52px)', fontWeight: 800, color: '#041E42',
          fontFamily: T.heading, lineHeight: 1.1, letterSpacing: -1,
          margin: '0 0 18px',
          WebkitFontSmoothing: 'antialiased',
        }}>
          Your site. Live in days.
        </h2>
        <p style={{
          fontSize: 15, color: '#6B7280', maxWidth: 420,
          margin: '0 auto 32px', lineHeight: 1.6, fontFamily: T.sans,
        }}>
          One platform. Professional website, payment processing,<br />
          capital access, and AI insights. All connected.
        </p>
        <Link to="/apply" style={{
          padding: '16px 40px', borderRadius: 50, border: 'none',
          background: `linear-gradient(135deg, ${T.accent}, ${T.blue})`,
          color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          fontFamily: T.sans, textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          boxShadow: `0 4px 24px ${T.accentGlow}`,
        }}>
          Get Your Delt Site <ArrowRight size={18} />
        </Link>
        <div style={{ marginTop: 14, fontSize: 12, color: '#9AA3B2', fontFamily: T.sans }}>
          No contracts. No cancellation fees. Live in under a week.
        </div>
      </Reveal>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE EXPORT
   ═══════════════════════════════════════════════════════════ */
export function WebsiteExamples() {
  return (
    <div style={{ fontFamily: T.sans, color: T.white, background: T.bg, position: 'relative' }}>
      <Hero />
      <FeatureWalkthrough />
      <HowItWorksStrip />
      <ShowcaseGrid />
      <Testimonials />
      <FinalCTA />
    </div>
  );
}