import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform } from 'motion/react';
import { ScrollIndicator } from './ScrollIndicator';

export function DeltPanelHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  // Hero heading moves up and scales down
  const headingY = useTransform(scrollYProgress, [0, 0.55], [0, -200]);
  const headingScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.8]);
  const headingOpacity = useTransform(scrollYProgress, [0.4, 0.6], [1, 0]);

  // Scroll hint fades out as user scrolls
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <>
      <section
        ref={sectionRef}
        style={{ background: '#080A28', position: 'relative', height: '140vh' }}
      >
        {/* Sticky viewport */}
        <div style={{
          position: 'sticky', top: 0,
          height: '100vh', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* Hero heading — centered, moves up on scroll */}
          <motion.div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 24px',
              y: headingY,
              scale: headingScale,
              opacity: headingOpacity,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <div className="dph-hero-inner" style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? 'none' : 'translateY(16px)',
              transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
              pointerEvents: 'auto',
            }}>
              <h1 className="dph-hero-title">
                The Standard for Modern Commerce.
              </h1>
              <p className="dph-hero-subtitle">
                The integrated platform unifying website,<br />
                payments, analytics, and funding — from day one.
              </p>
              <div className="dph-hero-ctas">
                <Link to="/start" className="dph-hero-btn-primary">Get Started for Free</Link>
                <Link to="/pricing" className="dph-hero-btn-secondary">Learn more</Link>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link to="/contact" className="dph-hero-btn-text">Speak to a human</Link>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <ScrollIndicator style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 20, opacity: scrollHintOpacity }} />

          {/* Background gradient overlay */}
          <div className="dph-hero-bg" />
        </div>
      </section>

      <style>{`
        .dph-hero-bg {
          position: absolute;
          inset: 0;
          background: #080A28;
          z-index: 0;
          pointer-events: none;
        }
        .dph-hero-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(73,69,255,0.08), transparent 60%);
          pointer-events: none;
        }

        .dph-hero-inner {
          max-width: 900px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .dph-hero-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(2.8rem, 6vw, 5.2rem);
          font-weight: 900;
          letter-spacing: -0.035em;
          line-height: 1.05;
          color: #fff;
          margin: 0 0 28px;
          max-width: 14ch;
        }

        .dph-hero-subtitle {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(1rem, 1.5vw, 1.25rem);
          color: rgba(255,255,255,0.6);
          line-height: 1.65;
          letter-spacing: -0.01em;
          margin: 0 0 40px;
        }

        .dph-hero-ctas {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .dph-hero-btn-primary {
          display: inline-flex;
          align-items: center;
          padding: 13px 28px;
          border-radius: 999px;
          background: #4945FF;
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          text-decoration: none;
          transition: background 200ms ease, transform 150ms ease;
        }
        .dph-hero-btn-primary:hover {
          background: #3d3ae0;
          transform: translateY(-1px);
        }

        .dph-hero-btn-secondary {
          display: inline-flex;
          align-items: center;
          padding: 12px 26px;
          border-radius: 999px;
          background: rgba(255,255,255,0.00);
          border: 1.5px solid rgba(255,255,255,0.35);
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          transition: border-color 200ms ease, background 200ms ease;
        }
        .dph-hero-btn-secondary:hover {
          border-color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.06);
        }

        .dph-hero-btn-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: color 200ms ease;
        }
        .dph-hero-btn-text:hover {
          color: rgba(255,255,255,0.8);
        }

        @media (prefers-reduced-motion: reduce) {
          .dph-hero-inner {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}