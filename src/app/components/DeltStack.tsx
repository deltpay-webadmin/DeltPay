import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router';

import img1 from 'figma:asset/2baa2d5ee7213101086c557f1114c817f24d2f4c.png';
import img2 from 'figma:asset/8534824e5f615d49c6c77c2d988563e0f9819d03.png';
import img3 from 'figma:asset/8a00efa0451c9c5dd9e5e4fd2e811eaa1284e1e7.png';
import img4 from 'figma:asset/4457bd0b9adf1f96e5c6b4783a3dc71ec0efa0af.png';

const C = {
  green: '#16C784',
  violet: '#16C784',
  amber: '#16C784',
  blue: '#16C784',
  indigo: '#4945FF',
  navy90: 'rgba(4,30,66,0.90)',
  navy75: 'rgba(4,30,66,0.75)',
  w90: 'rgba(242,242,247,0.90)',
  w75: 'rgba(242,242,247,0.75)',
  w50: 'rgba(242,242,247,0.50)',
  w30: 'rgba(242,242,247,0.30)',
  w15: 'rgba(242,242,247,0.15)',
  w08: 'rgba(242,242,247,0.08)',
};

const PANEL_COLORS = [C.green, C.violet, C.amber, C.blue];

const PANELS = [
  {
    id: 'storefront',
    href: '/website-examples',
    img: img4,
    num: '01 · Digital Presence',
    name: 'Get Online and Stay Online',
    descShort: 'Your professional storefront, live and selling.',
    headline: 'First, we build your storefront.',
    body: "Your website shouldn't be a headache. We design, host, and manage a professional shop built to turn visitors into customers. No waiting months for an agency—just a secure, mobile-ready site that's ready to take orders while you sleep.",
    unlock: 'Unlocks: Online orders and new customer traffic.',
    unlockIcon: '→',
    tagStrong: 'We handle the tech',
    tagSub: 'Built to sell',
    bgGrad: 'linear-gradient(160deg, #1a1400 0%, #3d2e00 40%, #2a1f00 100%)',
    imgPosition: 'center center',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    ),
  },
  {
    id: 'intelligence',
    href: '/delt-ai',
    img: img2,
    num: '02 · Intelligence',
    name: 'Stop the Guesswork',
    descShort: 'Clear answers, no spreadsheets.',
    headline: "Next, we show you what's actually working.",
    body: "Once you're live, we look at the numbers for you. Lens acts like a partner who's always watching the books, pointing out your busiest hours and your best-selling products. No messy spreadsheets—just clear, simple answers to your questions.",
    unlock: 'Unlocks: Clearer decisions and a plan to grow.',
    unlockIcon: '→',
    tagStrong: 'No more spreadsheets',
    tagSub: 'Real answers in plain English',
    bgGrad: 'linear-gradient(160deg, #0f0520 0%, #1a0a3d 40%, #12072a 100%)',
    imgPosition: 'center center',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    ),
  },
  {
    id: 'commerce',
    href: '/payments',
    img: img3,
    num: '03 · Commerce',
    name: 'Keep More of Your Money',
    descShort: 'Honest pricing, one simple system.',
    headline: 'Then, we audit your payments.',
    body: "Now that we see your sales, let's look at your costs. Are you losing too much to hidden fees? Delt brings your in-store and online payments into one place with fair, transparent pricing. We provide the hardware, so you get a clearer view of every dollar.",
    unlock: 'Unlocks: Lower fees and one simple system for everything.',
    unlockIcon: '→',
    tagStrong: 'Honest pricing',
    tagSub: 'Professional hardware included',
    bgGrad: 'linear-gradient(160deg, #001a1a 0%, #002a3d 40%, #001f2a 100%)',
    imgPosition: 'center center',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
    ),
  },
  {
    id: 'capital',
    href: '/apply',
    img: img1,
    num: '04 · Capital',
    name: 'Grow on Your Own Terms',
    descShort: 'Fast funding, no hoops.',
    headline: 'Finally, we fund your next big step.',
    body: "When it's time to expand, we make it easy. Because we already see your sales through Delt and your performance through Lens, we don't need weeks of paperwork to approve you. Access fast, revenue-based funding to hire or restock—usually in under 48 hours.",
    unlock: 'Full System Connected: Total control over your growth.',
    unlockIcon: '✓',
    tagStrong: 'Fast cash',
    tagSub: 'No bank-level hoops to jump through',
    bgGrad: 'linear-gradient(160deg, #00101a 0%, #00203d 40%, #00182a 100%)',
    imgPosition: 'center 40%',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ),
  },
];

type PanelState = 'active' | 'done' | 'compressed';

export function DeltStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);

  const calc = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const total = containerRef.current.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(scrolled / total, 0.999);
    const s = Math.floor(progress * PANELS.length);
    setStage(Math.max(0, Math.min(s, PANELS.length - 1)));
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { calc(); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    calc();
    return () => window.removeEventListener('scroll', onScroll);
  }, [calc]);

  const getState = (i: number): PanelState => {
    if (i < stage) return 'done';
    if (i === stage) return 'active';
    return 'compressed';
  };

  const scrollToPanel = (i: number) => {
    if (!containerRef.current) return;
    const top = containerRef.current.offsetTop;
    const total = containerRef.current.offsetHeight - window.innerHeight;
    const target = top + (total * i) / PANELS.length + 1;
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  const color = (i: number) => PANEL_COLORS[i];

  return (
    <>
      <div className="ds-experience" ref={containerRef}>
        <div className="ds-sticky">
          {/* Top bar */}
          <div className="ds-top">
            <div className="ds-eyebrow">How Delt Works</div>
            <div className="ds-counter">
              <div className="ds-pips">
                {PANELS.map((_p, i) => (
                  <div
                    key={i}
                    className="ds-pip"
                    onClick={() => scrollToPanel(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      className="ds-pip-fill"
                      style={{
                        width: i <= stage ? '100%' : '0%',
                        background: color(i),
                      }}
                    />
                  </div>
                ))}
              </div>
              <span className="ds-counter-label">{stage + 1} / {PANELS.length}</span>
            </div>
          </div>

          {/* Panels */}
          <div className="ds-panels">
            {PANELS.map((panel, i) => {
              const state = getState(i);
              const c = color(i);
              const isActive = state === 'active';
              const isCompressed = state === 'compressed';

              return (
                <div
                  key={panel.id}
                  className={`ds-panel ds-${state} ds-p${i}`}
                  onClick={(e) => {
                    if (!isActive) {
                      e.preventDefault();
                      scrollToPanel(i);
                    }
                  }}
                  style={{
                    borderColor: isActive ? C.w15 : C.w08,
                    boxShadow: isActive ? `0 0 60px -20px rgba(4,30,66,0.4)` : 'none',
                  }}
                >
                  {/* Background - solid navy for non-image area */}
                  <div className="ds-panel-solid-bg" />

                  {/* Top accent line */}
                  <div className="ds-accent" style={{
                    opacity: isActive ? 1 : 0,
                    background: C.w30,
                  }} />

                  {/* Content wrapper */}
                  <div className="ds-panel-content">
                    {/* Frosted glass text section */}
                    <div className="ds-frost" style={{
                      background: isActive ? 'rgba(4,30,66,0.98)' : 'rgba(4,30,66,0.95)',
                    }}>
                      <div className="ds-panel-icon" style={{
                        background: C.w08,
                        color: C.w50,
                      }}>
                        {panel.icon}
                      </div>
                      <div className="ds-panel-num" style={{
                        color: isActive ? C.w50 : C.w30,
                      }}>{panel.num}</div>
                      <div className={`ds-panel-name ds-name--${state}`}>
                        {panel.name}
                      </div>

                      {/* Short desc - visible when not active */}
                      {!isActive && !isCompressed && (
                        <p className="ds-desc-short">{panel.descShort}</p>
                      )}

                      {/* Expanded content - visible when active */}
                      <div className={`ds-expanded ${isActive ? 'ds-expanded-show' : ''}`}>
                        <div className="ds-headline">{panel.headline}</div>
                        <p className="ds-body">{panel.body}</p>
                        <div className="ds-unlock-row" style={{ borderColor: C.w08 }}>
                          <div className="ds-unlock" style={{ color: C.w50 }}>
                            <span className="ds-unlock-dot" style={{
                              background: C.w08,
                            }}>{panel.unlockIcon}</span>
                            {panel.unlock}
                          </div>
                          <Link
                            to={panel.href}
                            className="ds-cta-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
                            }}
                          >
                            Learn more →
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Image area (bottom portion) */}
                    <div className="ds-image-area">
                      <img
                        src={panel.img}
                        alt={panel.name}
                        className="ds-image-area-img"
                        style={{
                          opacity: isActive ? 0.85 : isCompressed ? 0.15 : 0.3,
                          objectPosition: panel.imgPosition || 'center center',
                        }}
                      />
                      <div className="ds-image-area-overlay" />
                      <div className={`ds-tag ${isActive ? 'ds-tag-show' : ''}`}>
                        <strong style={{ color: C.w75 }}>{panel.tagStrong}</strong>
                        <span>{panel.tagSub}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .ds-experience {
          position: relative;
          height: 450vh;
          background: #041E42;
        }

        .ds-sticky {
          position: sticky;
          top: 80px;
          height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
          padding: 0 40px;
          overflow: hidden;
        }

        .ds-top {
          padding: 32px 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .ds-eyebrow {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(18px, 2vw, 24px);
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .ds-counter {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: ${C.w30};
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ds-pips { display: flex; gap: 4px; }

        .ds-pip {
          width: 28px; height: 3px;
          border-radius: 2px;
          background: ${C.w08};
          overflow: hidden;
          position: relative;
        }

        .ds-pip-fill {
          position: absolute;
          inset: 0;
          border-radius: 2px;
          transition: width 0.5s cubic-bezier(0.22,1,0.36,1);
        }

        .ds-counter-label {
          font-family: 'JetBrains Mono', monospace;
        }

        /* ── Panels ── */
        .ds-panels {
          flex: 1;
          display: flex;
          gap: 12px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          align-items: stretch;
          padding-bottom: 32px;
        }

        .ds-panel {
          flex: 1;
          min-width: 0;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition:
            flex 0.7s cubic-bezier(0.22,1,0.36,1),
            opacity 0.5s ease,
            transform 0.6s cubic-bezier(0.22,1,0.36,1),
            border-color 0.5s,
            box-shadow 0.5s;
          border: 1px solid ${C.w08};
        }

        .ds-compressed { flex: 0.55; opacity: 0.4; transform: scale(0.97); }
        .ds-active { flex: 2.4; opacity: 1; transform: scale(1); }
        .ds-done { flex: 0.65; opacity: 0.5; }

        /* ── Background - solid navy for non-image area ── */
        .ds-panel-solid-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: #041E42;
          transition: opacity 0.5s;
        }

        /* ── Top accent ── */
        .ds-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          z-index: 10;
          transition: opacity 0.4s;
        }

        /* ── Content wrapper ── */
        .ds-panel-content {
          position: relative;
          z-index: 5;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        /* ── Frosted glass text section ── */
        .ds-frost {
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid ${C.w08};
          padding: 32px 28px;
          flex-shrink: 0;
          transition: background 0.4s;
        }

        .ds-panel-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .ds-panel-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 10px;
          transition: color 0.4s;
        }

        .ds-panel-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.2;
          color: #FFFFFF;
          transition: font-size 0.5s;
        }

        .ds-name--active { font-size: 24px; }
        .ds-name--compressed {
          font-size: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ds-name--done { font-size: 20px; }

        .ds-desc-short {
          font-size: 14px;
          color: ${C.w30};
          line-height: 1.55;
          margin-top: 10px;
        }

        /* ── Expanded content ── */
        .ds-expanded {
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          transition: opacity 0.5s 0.1s, max-height 0.5s;
        }
        .ds-expanded-show {
          opacity: 1;
          max-height: 600px;
        }

        .ds-headline {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #FFFFFF;
          margin: 16px 0 14px;
          line-height: 1.4;
        }

        .ds-body {
          font-size: 16px;
          line-height: 1.75;
          color: rgba(255,255,255,0.85);
        }

        .ds-unlock-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid;
          flex-wrap: wrap;
        }

        .ds-unlock {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .ds-unlock-dot {
          width: 24px; height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }

        .ds-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: ${C.indigo};
          color: white;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          flex-shrink: 0;
          transition: box-shadow 0.3s, transform 0.2s;
        }
        .ds-cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(67,24,255,0.3);
        }

        /* ── Image area (bottom portion) ── */
        .ds-image-area {
          flex: 1;
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-end;
          padding: 16px;
          overflow: hidden;
        }

        .ds-image-area-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.6s;
        }

        .ds-image-area-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top right, rgba(4,30,66,0.30) 0%, rgba(4,30,66,0.08) 50%, transparent 100%);
          pointer-events: none;
        }

        /* ── Tag pill ── */
        .ds-tag {
          font-size: 12px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 10px;
          background: ${C.navy75};
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid ${C.w08};
          color: ${C.w75};
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.4s 0.2s, transform 0.4s 0.2s;
          display: flex;
          gap: 6px;
          white-space: nowrap;
          position: relative;
          z-index: 2;
        }
        .ds-tag-show {
          opacity: 1;
          transform: translateY(0);
        }
        .ds-tag strong {
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .ds-sticky { padding: 0 16px; }
          .ds-panels {
            flex-direction: column;
            gap: 8px;
          }
          .ds-panel { flex: none !important; min-height: 120px; }
          .ds-active { min-height: 420px !important; }
          .ds-compressed { opacity: 0.5; transform: none; }
          .ds-experience { height: 600vh; }
        }
      `}</style>
    </>
  );
}