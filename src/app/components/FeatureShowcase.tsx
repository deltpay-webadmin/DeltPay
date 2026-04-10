import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';

import img1 from 'figma:asset/2baa2d5ee7213101086c557f1114c817f24d2f4c.png';
import img2 from 'figma:asset/080a6a77267ecdd384e05d5046128ed62e465417.png';
import img3 from 'figma:asset/8a00efa0451c9c5dd9e5e4fd2e811eaa1284e1e7.png';
import img4 from 'figma:asset/d120830c92bacb39a1f3070e7c506e30e8057ae2.png';
import imgOpeningSoon from 'figma:asset/496c83121a61622788c4cbb9368f51d5c1b12be7.png';
import imgAurum from 'figma:asset/3ea9adc049f8a2b84a767eadb6637fa6647af044.png';
import imgAurumNew from 'figma:asset/da58c5b0e7f95a5236e84a96069a9be1ce7ed32d.png';
import imgAurumUpdated from 'figma:asset/d641c9f161f97e6f6f646d087e1e1efce846b760.png';
import imgAurumLatest from 'figma:asset/c4b3cdf48f36fa1787d6955c5ba5dd79cb8e9909.png';
import imgWebsiteGrid from 'figma:asset/bcbe34cc6e2d318e712bbd3f5af8fbedacda7cff.png';
import imgWebsiteGridV2 from 'figma:asset/bfa4c4f29954906f890043902a1ea6d43149fa05.png';

const features = [
  {
    badge: 'Digital Presence',
    title: 'A stunning website,\nlive this week',
    accentWord: 'stunning',
    desc: 'Tell us about your business. We build the rest — and it\'s live before the week is out.',
    bullets: ['Looks great on every phone, tablet, and screen', 'Customers find you — and trust you — on Google', 'Start taking orders the same day you launch'],
    img: imgWebsiteGridV2,
    href: '/website-examples',
  },
  {
    badge: 'AI Intelligence',
    title: 'Know where every\ndollar goes.',
    accentWord: 'every',
    desc: 'No spreadsheets. No guessing. Just a clear picture of what\'s working — and what to fix.',
    bullets: ['See which days, products, and customers drive profit', 'Know when a cash shortfall is coming before it hits', 'Get told what to do next — not just what happened'],
    img: img2,
    href: '/delt-ai',
  },
  {
    badge: 'Payment Processing',
    title: 'Transparent\npricing, always',
    accentWord: 'Transparent',
    desc: 'Every swipe, tap, or link payment lands in your account — with nothing skimmed off the top.',
    bullets: ['Keep more of every sale — no hidden markups', 'Money in your account the next morning', 'Hardware that works on day one, included'],
    img: img3,
    href: '/payments',
  },
  {
    badge: 'Business Funding',
    title: 'Capital waiting in your dashboard.',
    accentWord: 'Capital',
    desc: "We already see your revenue. That's your application. Most merchants are funded in under 48 hours.",
    bullets: ['Approved based on what you\'ve earned, not your credit', 'Traditional lenders would take weeks. We don\'t.', 'Repayment that flexes with your slow seasons'],
    img: img4,
    href: '/apply',
  },
];

export function FeatureShowcase() {
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

  // Progress bar
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <>
      <div ref={containerRef} className="fs-scroll-container">
        {/* Sticky right: image + progress */}
        <div className="fs-sticky-side">
          {/* Progress bar */}
          <div className="fs-progress-bar">
            <motion.div className="fs-progress-fill" style={{ width: progressWidth }} />
            <div className="fs-progress-dots">
              {features.map((f, i) => (
                <div
                  key={f.badge}
                  className={`fs-dot ${i <= activeIndex ? 'fs-dot-active' : ''}`}
                  style={{ top: `${(i / (features.length - 1)) * 100}%` }}
                >
                  <div className="fs-dot-inner" />
                </div>
              ))}
            </div>
          </div>

          {/* Image stage */}
          <div className="fs-img-stage">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={features[activeIndex].img}
                alt={features[activeIndex].badge}
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="fs-img"
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Scrolling left: text sections */}
        <div className="fs-text-track">
          {features.map((f, i) => (
            <div
              key={f.badge}
              ref={(el) => { sectionRefs.current[i] = el; }}
              className="fs-text-section"
            >
              <div className={`fs-text-inner ${activeIndex === i ? 'fs-text-active' : ''}`}>
                <span className="fs-badge">{f.badge}</span>
                <h2 className="fs-title">{renderAccentTitle(f.title, f.accentWord)}</h2>
                <p className="fs-desc">{f.desc}</p>
                <ul className="fs-bullets">
                  {f.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <Link to={f.href} className="fs-link">
                  Learn more <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* ── Scroll snap ──
         * Apply proximity snap to the root while this component is mounted.
         * Only .fs-text-section carries scroll-snap-align, so every other
         * section on the page still scrolls freely — the snap only engages
         * once the user is inside FeatureShowcase.
         */
        @media (min-width: 901px) {
          html {
            scroll-snap-type: y proximity;
          }
        }

        .fs-scroll-container {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1300px;
          margin: 0 auto;
          background: #fff;
        }

        /* ── Left: scrolling text ── */
        .fs-text-track {
          order: 1;
        }
        .fs-text-section {
          height: 100vh;
          display: flex;
          align-items: center;
          padding: 80px 60px 80px 60px;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        .fs-text-inner {
          opacity: 0.3;
          transform: translateY(12px);
          transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1),
                      transform 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        .fs-text-active {
          opacity: 1;
          transform: translateY(0);
        }

        .fs-badge {
          display: inline-block;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15.6px;
          font-weight: 800;
          color: #4945FF;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .fs-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.4rem);
          font-weight: 800;
          color: #0F1119;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin: 0 0 24px;
          white-space: pre-line;
        }
        .fs-accent {
          background: linear-gradient(90deg, #4945FF, #6C63FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .fs-reveal-wrap {
          position: relative;
          display: inline-block;
          vertical-align: baseline;
        }
        .fs-reveal-blurred {
          display: inline-block;
          color: #0F1119;
          filter: blur(5px);
          opacity: 0.3;
        }
        .fs-reveal-clear {
          position: absolute;
          top: 0;
          left: 0;
          display: inline-block;
          white-space: nowrap;
          clip-path: inset(0 100% 0 0);
        }
        .fs-reveal-panel {
          position: absolute;
          top: -6%;
          left: 0;
          width: 3px;
          height: 112%;
          background: rgba(73, 69, 255, 0.12);
          border-left: 2px solid rgba(73, 69, 255, 0.35);
          pointer-events: none;
        }
        .fs-desc {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 17px;
          color: rgba(0,0,0,0.55);
          line-height: 1.7;
          margin: 0 0 32px;
          max-width: 440px;
        }
        .fs-bullets {
          list-style: none;
          padding: 0;
          margin: 0 0 36px;
        }
        .fs-bullets li {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          color: #3A3D4A;
          padding: 7px 0 7px 26px;
          position: relative;
          line-height: 1.5;
        }
        .fs-bullets li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #16C784;
          font-weight: 700;
          font-size: 14px;
        }
        .fs-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #4945FF;
          text-decoration: none;
          transition: gap 0.25s;
        }
        .fs-link:hover { gap: 14px; }

        /* ── Right: sticky image ── */
        .fs-sticky-side {
          order: 2;
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          padding: 40px 60px 40px 20px;
          gap: 24px;
        }

        /* Vertical progress bar */
        .fs-progress-bar {
          position: relative;
          width: 3px;
          height: 260px;
          background: #E9ECEF;
          border-radius: 999px;
          flex-shrink: 0;
        }
        .fs-progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(180deg, #4945FF 0%, #16C784 100%);
          border-radius: 999px;
        }
        .fs-progress-dots {
          position: absolute;
          top: 0;
          left: 50%;
          height: 100%;
          transform: translateX(-50%);
        }
        .fs-dot {
          position: absolute;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          border: 2.5px solid #E9ECEF;
          transition: border-color 0.4s, box-shadow 0.4s;
        }
        .fs-dot-active {
          border-color: #4945FF;
          box-shadow: 0 0 0 4px rgba(73,69,255,0.15);
        }
        .fs-dot-inner {
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          background: #4945FF;
          transform: scale(0);
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .fs-dot-active .fs-dot-inner {
          transform: scale(1);
        }

        /* Image */
        .fs-img-stage {
          flex: 1;
          height: 520px;
          border-radius: 32px;
          overflow: hidden;
          background: linear-gradient(160deg, #f5f7fa 0%, #e8ecf2 100%);
          position: relative;
          box-shadow: 0 30px 80px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.03);
        }
        .fs-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 32px;
        }

        /* ── Mobile ── */
        @media (max-width: 900px) {
          .fs-scroll-container {
            grid-template-columns: 1fr;
          }
          .fs-sticky-side {
            display: none;
          }
          .fs-text-track { order: 2; }
          .fs-text-section {
            height: auto;
            min-height: auto;
            padding: 40px 20px;
            scroll-snap-align: none;
            scroll-snap-stop: normal;
          }
          .fs-text-inner {
            opacity: 1;
            transform: none;
          }
          .fs-progress-bar { display: none; }
          .fs-img-stage { height: 280px; }
        }
      `}</style>
    </>
  );
}

function renderAccentTitle(title: string, accentWord: string) {
  if (!accentWord) return title;
  const parts = title.split(accentWord);
  if (accentWord === 'Transparent') {
    return (
      <>
        {parts[0]}
        <RevealWord word={accentWord} />
        {parts[1]}
      </>
    );
  }
  return (
    <>
      {parts[0]}
      <span className="fs-accent">{accentWord}</span>
      {parts[1]}
    </>
  );
}

function RevealWord({ word }: { word: string }) {
  const clearRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const clearEl = clearRef.current;
    const panelEl = panelRef.current;
    if (!clearEl || !panelEl) return;

    let progress = 0;
    let direction = 1;
    let paused = false;
    let pauseTimer: ReturnType<typeof setTimeout>;
    const SPEED = 0.0048;
    let raf: number;

    function ease(t: number) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function tick() {
      if (!paused) {
        progress += SPEED * direction;
        if (progress >= 1) {
          progress = 1;
          direction = -1;
          paused = true;
          clearTimeout(pauseTimer);
          pauseTimer = setTimeout(() => { paused = false; }, 1800);
        } else if (progress <= 0) {
          progress = 0;
          direction = 1;
          paused = true;
          clearTimeout(pauseTimer);
          pauseTimer = setTimeout(() => { paused = false; }, 1200);
        }
      }
      const p = ease(Math.max(0, Math.min(1, progress)));
      const pct = (p * 100).toFixed(2);
      clearEl.style.clipPath = `inset(0 ${(100 - p * 100).toFixed(2)}% 0 0)`;
      panelEl.style.left = `${pct}%`;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(pauseTimer);
    };
  }, []);

  return (
    <span className="fs-reveal-wrap">
      <span className="fs-reveal-blurred">{word}</span>
      <span className="fs-reveal-clear" ref={clearRef}>{word}</span>
      <span className="fs-reveal-panel" ref={panelRef} />
    </span>
  );
}