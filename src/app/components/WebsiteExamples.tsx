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
        /* Uniform frame — each graphic is centered inside the same 540px
           tall stage, regardless of its natural aspect ratio. This makes all
           three panels read as a consistent set instead of mismatched sizes. */
        .we-preview-stage {
          flex: 1;
          height: 540px;
          min-height: 540px;
          border-radius: 20px;
          overflow: hidden;
          background: ${T.surface};
          border: 1px solid ${T.border};
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 30px 80px rgba(0,0,0,0.25), 0 4px 20px rgba(0,0,0,0.15);
        }
        .we-preview-stage > * {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
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
          .we-preview-stage { height: 420px; min-height: 420px; }
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
   Each preview mimics a distinct Framer Gallery aesthetic so the grid reads
   as 8 unique studio-quality sites rather than 8 variations of the same
   dark-photo-hero template. Styles referenced:
     Kuro      → Temper Studio (minimal-luxe cream/terracotta)
     Foamy     → Matcha Cartel (zine mosaic + neon chartreuse)
     Tundra    → Mr. Crank (dark B&W bilingual fashion)
     Gringos   → Monday Studio (electric-blue typographic maximalism)
     Aura      → Panton Vitra (retro burgundy modernist gradient)
     Atelier   → Panic Frame Travel (aerial photo editorial)
     Noir      → Huehaus (maximalist color-blob on black)
     Maison    → Wild Week Athens (brutalist cobalt-blue poster) */
const F = { sans: "'Plus Jakarta Sans', sans-serif", serif: "'Instrument Serif', Georgia, serif" };

/* ── 8 Distinct Style Genres ──
   Each preview is a different website genre so the grid reads as 8 completely
   different studios. Several cards include subtle animations (rotating rings,
   drifting blobs, running marquees) to show motion capability.
     Kuro      → LIGHT MINIMALIST editorial (cream, serif, spacious)
     Foamy     → COLORFUL PLAYFUL zine (neon + mosaic + bold type)
     Tundra    → DARK E-COMMERCE grid (product cards, prices, filters)
     Gringos   → ANIMATED RETRO (rotating badge on electric blue)
     Aura      → ANIMATED GRADIENT (slow-drifting sunset + orbit)
     Atelier   → PHOTO EDITORIAL (full-bleed aerial, glass cards)
     Noir      → MAXIMALIST ANIMATED (floating color blobs on black)
     Maison    → RETAIL GRID brutalist (cobalt poster + product tiles) */

/* KURO — Light minimalist editorial. Cream, lots of whitespace, one
   serif statement, single close-cropped food frame. Feels like a Michelin
   tasting-menu site. */
function KuroPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#FAF7F0', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px' }}>
        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 4, color: '#2B1F14' }}>KURO</span>
        <div style={{ display: 'flex', gap: 16 }}>
          {['Menu', 'Visit', 'Journal', 'Reserve'].map(n => <span key={n} style={{ fontSize: 7, color: 'rgba(43,31,20,0.5)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ padding: '32px 22px 0', maxWidth: '100%' }}>
        <div style={{ fontSize: 6.5, letterSpacing: 4, color: '#B88766', marginBottom: 12, fontWeight: 600 }}>SEASONAL — AUTUMN ’26</div>
        <div style={{ fontSize: 22, fontWeight: 300, color: '#2B1F14', fontFamily: F.serif, lineHeight: 1.05, marginBottom: 10, letterSpacing: -0.5 }}>
          <span style={{ fontStyle: 'italic' as const }}>Quiet</span> cooking<br/>for <span style={{ fontStyle: 'italic' as const }}>loud</span> years.
        </div>
        <div style={{ fontSize: 7, color: 'rgba(43,31,20,0.5)', lineHeight: 1.7, maxWidth: 160, marginBottom: 14 }}>Seven courses. No menu. Market-driven, fire-led, unhurried.</div>
      </div>
      <div style={{ position: 'absolute', top: '50%', right: 18, width: 100, height: 130, borderRadius: 2, overflow: 'hidden' }}>
        <img src={kuroHeroImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.25) saturate(0.9) brightness(0.95)' }} />
      </div>
      <div style={{ position: 'absolute', bottom: 14, left: 22, right: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'end', fontSize: 6.5, color: 'rgba(43,31,20,0.45)', letterSpacing: 1.5 }}>
        <div>
          <div style={{ marginBottom: 3, fontWeight: 700, color: '#2B1F14' }}>RESERVE →</div>
          <div>Tue–Sat · 5–10pm</div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ fontFamily: F.serif, fontSize: 8, fontStyle: 'italic' as const, color: '#2B1F14' }}>“Thoughtful.”</div>
          <div>— NYT</div>
        </div>
      </div>
    </div>
  );
}

/* FOAMY — Colorful playful zine. Neon mosaic, speech-bubble blobs,
   chartreuse + lime stacked color. Animated spinning sparkle. */
function FoamyPreview() {
  const tiles = ['#2E3B1F', '#9DCC0A', '#F472B6', '#5D7A2E', '#67E8F9', '#FBBF24', '#9DCC0A', '#E8E3D4'];
  return (
    <div style={{ width: '100%', height: '100%', background: '#FFF6E0', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px' }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, color: '#2E3B1F' }}>FOAMY!</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Shop', 'Drops', 'Cart · 2'].map(n => <span key={n} style={{ fontSize: 7, color: '#2E3B1F', fontWeight: 700, padding: '3px 8px', background: n === 'Cart · 2' ? '#9DCC0A' : 'transparent', borderRadius: 20 }}>{n}</span>)}
        </div>
      </div>
      {/* Mosaic hero */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 40, gap: 4, padding: '4px 18px' }}>
        {tiles.map((bg, i) => (
          <div key={i} style={{
            background: bg,
            borderRadius: 6,
            gridColumn: i === 0 ? 'span 2' : i === 2 ? 'span 2' : 'span 1',
            gridRow: i === 0 || i === 2 ? 'span 2' : 'span 1',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {i === 0 && (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', inset: '50%', width: 28, height: 28, marginLeft: -14, marginTop: -14, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✿</motion.div>
            )}
            {i === 2 && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45), transparent 55%)' }} />}
          </div>
        ))}
      </div>
      {/* Jumbo wordmark */}
      <div style={{ padding: '10px 18px 4px', lineHeight: 0.82 }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: '#2E3B1F', letterSpacing: -2, fontFamily: F.sans, textTransform: 'lowercase' as const }}>matcha!</div>
        <div style={{ fontSize: 8, color: '#2E3B1F', letterSpacing: 2, fontWeight: 700, marginTop: 4 }}>DROP 07 · NOW SHIPPING</div>
      </div>
      {/* Marquee ticker */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#2E3B1F', color: '#9DCC0A', overflow: 'hidden', padding: '7px 0', whiteSpace: 'nowrap' as const }}>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'inline-block', fontSize: 8, fontWeight: 800, letterSpacing: 2 }}>
          {'★ CEREMONIAL UJI · FREE SHIP $50+ · ★ NEW MERCH · ★ CEREMONIAL UJI · FREE SHIP $50+ · ★ NEW MERCH · '.repeat(2)}
        </motion.div>
      </div>
    </div>
  );
}

/* TUNDRA — Dark e-commerce product grid. Shows real commerce UX —
   category chips, product cards with prices + sale badges, cart CTA. */
function TundraPreview() {
  const products = [
    { n: 'Shell Jacket', p: '$420', tag: 'SS26' },
    { n: 'Tech Trouser', p: '$285', tag: 'NEW' },
    { n: 'Field Cap', p: '$95', tag: '' },
    { n: 'Tote', p: '$140', tag: 'LAST' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: '#0B0B0C', position: 'relative', overflow: 'hidden', fontFamily: F.sans, color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3 }}>TUNDRA</span>
          <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>ツンドラ</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>⌕ SEARCH</span>
          <span style={{ fontSize: 6.5, padding: '2px 7px', background: '#67E8F9', color: '#0B0B0C', borderRadius: 20, fontWeight: 800 }}>BAG · 2</span>
        </div>
      </div>
      {/* Category chips */}
      <div style={{ display: 'flex', gap: 5, padding: '8px 14px 4px', overflow: 'hidden' }}>
        {['All', 'Outerwear', 'Bottoms', 'Caps'].map((c, i) => (
          <span key={c} style={{ fontSize: 6.5, padding: '3px 8px', borderRadius: 20, fontWeight: 600, letterSpacing: 0.5, background: i === 0 ? '#fff' : 'transparent', color: i === 0 ? '#0B0B0C' : 'rgba(255,255,255,0.6)', border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.15)' }}>{c}</span>
        ))}
      </div>
      {/* Product grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, padding: '4px 14px' }}>
        {products.map((pr, i) => (
          <div key={pr.n} style={{ background: '#141416', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'relative', aspectRatio: '1 / 0.85', background: i === 0 ? `linear-gradient(135deg, #2A2B2E 0%, #0B0B0C 100%)` : i === 1 ? '#1C2123' : i === 2 ? '#1A1A1A' : '#232327', overflow: 'hidden' }}>
              {i === 0 && <img src={tundraHeroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.1)' }} />}
              {i === 1 && <div style={{ position: 'absolute', inset: '20% 28%', background: 'linear-gradient(180deg, #3A3A3F 0%, #1C1C1F 100%)', borderRadius: 2 }} />}
              {i === 2 && <div style={{ position: 'absolute', top: '30%', left: '25%', right: '25%', bottom: '30%', background: 'radial-gradient(ellipse, #2A2A2A 40%, transparent 70%)', borderRadius: '50%' }} />}
              {i === 3 && <div style={{ position: 'absolute', inset: '18% 24%', background: '#1C1C1F', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }} />}
              {pr.tag && <div style={{ position: 'absolute', top: 3, left: 3, fontSize: 5, color: pr.tag === 'NEW' ? '#67E8F9' : '#fff', background: pr.tag === 'NEW' ? 'rgba(103,232,249,0.12)' : 'rgba(255,255,255,0.15)', padding: '1px 5px', borderRadius: 20, fontWeight: 700, letterSpacing: 1 }}>{pr.tag}</div>}
            </div>
            <div style={{ padding: '4px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 6.5, color: '#fff' }}>{pr.n}</span>
              <span style={{ fontSize: 6.5, color: '#67E8F9', fontWeight: 700 }}>{pr.p}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Bottom checkout bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 18px', background: '#fff', color: '#0B0B0C', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1 }}>SUBTOTAL · $705</div>
        <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: 2, padding: '5px 14px', background: '#0B0B0C', color: '#fff', borderRadius: 20 }}>CHECKOUT →</div>
      </div>
    </div>
  );
}

/* GRINGOS — Animated retro. Electric blue canvas, rotating circular
   "SINCE 2005" badge, bleeding italic serif wordmark. */
function GringosPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#1C35E0', position: 'relative', overflow: 'hidden', fontFamily: F.sans, color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', position: 'relative', zIndex: 2 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3 }}>● GRINGOS BARBERS</span>
        <div style={{ display: 'flex', gap: 14 }}>
          {['Book', 'Services', 'Shop'].map(n => <span key={n} style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.75)', letterSpacing: 1, fontWeight: 600 }}>{n}</span>)}
        </div>
      </div>
      {/* Jumbo wordmark that bleeds off */}
      <div style={{ position: 'absolute', top: '24%', left: -10, right: -10, lineHeight: 0.78, pointerEvents: 'none', zIndex: 1 }}>
        <div style={{ fontSize: 86, fontWeight: 900, color: '#fff', letterSpacing: -4, fontFamily: F.serif, fontStyle: 'italic' as const }}>Sharp.</div>
        <div style={{ fontSize: 86, fontWeight: 900, color: 'rgba(255,255,255,0.22)', letterSpacing: -4, fontFamily: F.serif, fontStyle: 'italic' as const, textAlign: 'right' as const }}>Clean.</div>
      </div>
      {/* Rotating badge bottom-left over pole */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', bottom: 76, left: 14, width: 56, height: 56, zIndex: 3 }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          <defs>
            <path id="circTxtG" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, fill: '#fff' }}>
            <textPath href="#circTxtG">SINCE 2005 · SHARP + CLEAN · </textPath>
          </text>
          <circle cx="50" cy="50" r="7" fill="#fff" />
        </svg>
      </motion.div>
      {/* Barber pole stripes animated */}
      <div style={{ position: 'absolute', right: 16, top: '38%', width: 6, height: 70, overflow: 'hidden', borderRadius: 3, border: '1px solid rgba(255,255,255,0.3)', zIndex: 2 }}>
        <motion.div animate={{ y: [0, -14] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{ width: '100%', height: '400%', background: 'repeating-linear-gradient(135deg, #fff 0 7px, #E8224C 7px 14px)' }} />
      </div>
      {/* Bottom info strip */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16, alignItems: 'end', zIndex: 2 }}>
        <div>
          <div style={{ fontSize: 6.5, letterSpacing: 2, color: 'rgba(255,255,255,0.6)', marginBottom: 4, fontWeight: 600 }}>BROOKLYN · LA · TOKYO</div>
          <div style={{ fontSize: 7, color: '#fff', lineHeight: 1.5 }}>Walk-ins Mon–Wed. Book the rest.</div>
        </div>
        {[{ n: 'CUT', p: '$35' }, { n: 'FADE', p: '$55' }, { n: 'SHAVE', p: '$40' }].map(s => (
          <div key={s.n} style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 10 }}>
            <div style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5, marginBottom: 2, fontWeight: 600 }}>{s.n}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{s.p}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* AURA — Animated gradient. Slow-drifting sunset gradient with
   orbiting sun and pulsing shapes. Meditative, screensaver feel. */
function AuraPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#1E0B1C', position: 'relative', overflow: 'hidden', fontFamily: F.sans }}>
      {/* Animated mesh gradient */}
      <motion.div
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 30%, #F4A261 0%, transparent 45%), radial-gradient(circle at 80% 70%, #E76F51 0%, transparent 50%), radial-gradient(circle at 50% 50%, #5C1A2A 0%, transparent 60%), linear-gradient(165deg, #FAE1D0 0%, #E8A89E 40%, #8B3A5A 100%)',
          backgroundSize: '200% 200%',
        }}
      />
      {/* Orbiting sun */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top: '30%', left: '30%', width: '1px', height: '1px' }}>
        <div style={{ position: 'absolute', top: -60, left: -12, width: 44, height: 44, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #FFE4B8 0%, #F4A261 40%, #E76F51 100%)', boxShadow: '0 0 30px rgba(244,162,97,0.5)' }} />
      </motion.div>
      {/* Pulsing circle */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.9, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '22%', left: '12%', width: 90, height: 140, background: '#5C1A2A', borderRadius: '50% 50% 45% 45%' }}
      />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', zIndex: 2 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#2B0F16' }}>AURA STUDIO</span>
        <div style={{ display: 'flex', gap: 14 }}>
          {['Treatments', 'Membership', 'Visit'].map(n => <span key={n} style={{ fontSize: 7, color: 'rgba(43,15,22,0.75)', letterSpacing: 1, fontWeight: 600 }}>{n}</span>)}
        </div>
      </div>
      {/* Jumbo year centered */}
      <div style={{ position: 'absolute', bottom: 72, left: 0, right: 0, textAlign: 'center' as const, lineHeight: 0.85, zIndex: 2 }}>
        <div style={{ fontSize: 68, fontWeight: 900, color: '#2B0F16', letterSpacing: -3, fontFamily: F.serif, fontStyle: 'italic' as const }}>breathe</div>
        <div style={{ fontSize: 7, color: 'rgba(43,15,22,0.65)', letterSpacing: 3, marginTop: 6, fontWeight: 600 }}>— SEASON OF SLOWNESS —</div>
      </div>
      {/* Bottom strip */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px', background: 'rgba(43,15,22,0.94)', backdropFilter: 'blur(8px)', color: '#FAE1D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <div>
          <div style={{ fontSize: 6.5, letterSpacing: 2, color: 'rgba(250,225,208,0.55)', marginBottom: 2, fontWeight: 600 }}>SPRING ’26 RITUALS</div>
          <div style={{ fontSize: 9, fontWeight: 700, fontFamily: F.serif, fontStyle: 'italic' as const }}>Book a 90-min reset.</div>
        </div>
        <div style={{ padding: '7px 16px', border: '1px solid #FAE1D0', borderRadius: 20, fontSize: 7, fontWeight: 700, letterSpacing: 2 }}>RESERVE</div>
      </div>
    </div>
  );
}

/* ATELIER — Photo editorial minimalist. Full-bleed aerial, serif italic
   overlay, glass destination cards at bottom. Feels like a boutique
   travel / architecture magazine. */
function AtelierPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0B1610', position: 'relative', overflow: 'hidden', fontFamily: F.sans, color: '#fff' }}>
      <img src={showcaseArchImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '75%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,22,16,0.45) 0%, transparent 25%, transparent 55%, rgba(11,22,16,0.98) 85%)' }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 5 }}>ATELIER — STUDIO</span>
        <div style={{ display: 'flex', gap: 14 }}>
          {['Work', 'Studio', 'Journal'].map(n => <span key={n} style={{ fontSize: 7, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>{n}</span>)}
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 1, padding: '18px 20px 0' }}>
        <div style={{ fontSize: 6.5, letterSpacing: 3, color: 'rgba(255,255,255,0.75)', marginBottom: 8, textTransform: 'uppercase' as const, fontWeight: 600 }}>Somewhere off the map</div>
        <div style={{ fontSize: 30, fontWeight: 300, fontFamily: F.serif, fontStyle: 'italic' as const, lineHeight: 1, letterSpacing: -0.8 }}>Build where<br/>the land ends.</div>
      </div>
      {/* Film-strip index markers */}
      <div style={{ position: 'absolute', right: 16, top: '44%', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 1 }}>
        {['01', '02', '03'].map((n, i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: i === 0 ? 16 : 8, height: 1, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)' }} />
            <span style={{ fontSize: 6, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)', fontFamily: 'monospace', letterSpacing: 1 }}>{n}</span>
          </div>
        ))}
      </div>
      {/* Bottom destination cards */}
      <div style={{ position: 'absolute', bottom: 14, left: 20, right: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, zIndex: 1 }}>
        {[{ n: 'The Meridian', l: '42 stories', s: 'Downtown' }, { n: 'North Cove', l: 'Residential', s: '2027' }, { n: 'Hall No. 7', l: 'Civic', s: 'In progress' }].map(c => (
          <div key={c.n} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', borderRadius: 6, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 7.5, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{c.n}</div>
            <div style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.55)' }}>{c.l}</div>
            <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.35)', marginTop: 1, letterSpacing: 0.5 }}>{c.s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* NOIR — Maximalist animated. Dark canvas with drifting, colorful blobs
   that gently float. Tri-color italic wordmark. */
function NoirPreview() {
  const blobs = [
    { x: '-4%', y: '14%', size: 90, color: '#E85E27', delay: 0 },
    { x: '82%', y: '10%', size: 60, color: '#F472B6', delay: 0.8 },
    { x: '6%', y: '72%', size: 36, color: '#FBBF24', delay: 1.6 },
    { x: '84%', y: '68%', size: 44, color: '#A78BFA', delay: 2.4 },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: '#0A0A0A', position: 'relative', overflow: 'hidden', fontFamily: F.sans, color: '#fff' }}>
      {blobs.map((b, i) => (
        <motion.div key={i}
          animate={{ y: [0, -10, 0, 8, 0], x: [0, 6, 0, -6, 0] }}
          transition={{ duration: 8 + i, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
          style={{ position: 'absolute', top: b.y, left: b.x, width: b.size, height: b.size, background: b.color, borderRadius: '50%', filter: 'blur(0.5px)' }}
        />
      ))}
      {/* Horizontal pill */}
      <motion.div
        animate={{ scaleX: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '76%', left: '40%', width: 70, height: 24, background: '#67E8F9', borderRadius: 50 }}
      />
      {/* Nav */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3 }}>◌ NOIR BAR</span>
        <div style={{ display: 'flex', gap: 12 }}>
          {['Menu', 'Events', 'Reserve'].map(n => <span key={n} style={{ fontSize: 7, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, fontWeight: 600 }}>{n}</span>)}
        </div>
      </div>
      {/* Giant mixed-case wordmark */}
      <div style={{ position: 'relative', zIndex: 2, padding: '64px 20px 0', lineHeight: 0.92 }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: -2, fontFamily: F.sans }}>every</div>
        <div style={{ fontSize: 48, fontWeight: 300, color: '#F472B6', letterSpacing: -2, fontFamily: F.serif, fontStyle: 'italic' as const, marginLeft: 28 }}>sip is</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: '#67E8F9', letterSpacing: -2, fontFamily: F.sans }}>a story.</div>
      </div>
      {/* Bottom ribbon */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px', background: '#fff', color: '#0A0A0A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 2 }}>OPEN WED–SUN · 5PM–2AM</div>
        <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 2 }}>RESERVE →</div>
      </div>
    </div>
  );
}

/* MAISON — Retail grid brutalist. Cream poster canvas, cobalt display
   type, 4-up product tile grid with prices + SKU codes, weekly drop bar. */
function MaisonPreview() {
  const items = [
    { d: 'THU', n: 'Croissant', p: '$4', sku: '#001' },
    { d: 'FRI', n: 'Tarte', p: '$8', sku: '#002' },
    { d: 'SAT', n: 'Macaron', p: '$3', sku: '#003' },
    { d: 'SUN', n: 'Canelé', p: '$5', sku: '#004' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: '#F7F2E8', position: 'relative', overflow: 'hidden', fontFamily: F.sans, color: '#0A1A3C' }}>
      {/* Top meta strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 18px', borderBottom: '1px solid rgba(10,26,60,0.15)', fontSize: 6.5, fontFamily: 'monospace', letterSpacing: 1 }}>
        <span>PARIS — LYON — BROOKLYN</span>
        <span>VOL. 07 / APR ’26</span>
      </div>
      {/* Jumbo cobalt type */}
      <div style={{ padding: '12px 18px 4px', lineHeight: 0.82 }}>
        <div style={{ fontSize: 56, fontWeight: 900, color: '#1C4EE8', letterSpacing: -3, fontFamily: F.sans }}>MAISON</div>
        <div style={{ fontSize: 18, fontWeight: 300, color: '#0A1A3C', fontFamily: F.serif, fontStyle: 'italic' as const, letterSpacing: -0.5, marginTop: 2 }}>une pâtisserie.</div>
      </div>
      {/* 4-up product tile grid */}
      <div style={{ padding: '8px 18px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
        {items.map((it, i) => (
          <div key={it.d} style={{ background: i === 0 ? '#1C4EE8' : '#fff', borderRadius: 2, padding: '8px 10px', border: i === 0 ? 'none' : '1px solid rgba(10,26,60,0.12)', position: 'relative', overflow: 'hidden' }}>
            {i === 0 && (
              <img src={showcaseBakeryImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'luminosity', opacity: 0.85 }} />
            )}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 6, fontFamily: 'monospace', color: i === 0 ? 'rgba(247,242,232,0.7)' : 'rgba(10,26,60,0.5)', letterSpacing: 1 }}>{it.sku}</span>
              <span style={{ fontSize: 6.5, fontWeight: 700, color: i === 0 ? '#F7F2E8' : '#0A1A3C', letterSpacing: 1 }}>{it.d}</span>
            </div>
            <div style={{ position: 'relative', marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: i === 0 ? '#F7F2E8' : '#0A1A3C', fontFamily: F.serif, fontStyle: 'italic' as const }}>{it.n}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: i === 0 ? '#F7F2E8' : '#1C4EE8' }}>{it.p}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Bottom CTA bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#1C4EE8', color: '#F7F2E8', padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: 2 }}>THIS WEEK’S DROP →</div>
        <div style={{ fontSize: 7, letterSpacing: 1, fontFamily: 'monospace' }}>07 ITEMS / 3 DAYS</div>
      </div>
    </div>
  );
}

/* ─── Hide original preview renderers below ───────────────────────── */

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