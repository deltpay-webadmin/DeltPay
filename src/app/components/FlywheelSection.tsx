import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router';

const STEPS = [
  {
    badge: 'Storefront',
    name: 'Live in under 24 hours.',
    desc: 'We design, host, and manage your website so it\'s ready to convert from day one. Customers find you, browse your menu or catalog, and order online. This is where every Delt merchant begins.',
    unlock: 'Unlocks: online ordering & customer traffic',
    unlockIcon: '→',
    nodeName: 'Storefront',
    nodeStat: 'Live in under 24 hours',
    nodeIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    ),
    color: '#059669',
    colorBg: 'rgba(5,150,105,0.07)',
    colorBorder: 'rgba(5,150,105,0.18)',
    colorShadow: 'rgba(5,150,105,0.08)',
    colorNum: 'rgba(5,150,105,0.15)',
  },
  {
    badge: 'Commerce',
    name: 'Every transaction, in one system.',
    desc: 'Tap, chip, swipe — in store and online. Your checkout is already wired into your website. Hardware is included, pricing is interchange-plus, and every dollar in and out lives in one place.',
    unlock: 'Unlocks: real-time transaction data for Lens',
    unlockIcon: '→',
    nodeName: 'Commerce',
    nodeStat: 'Every transaction, one system',
    nodeIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
    ),
    color: '#D97706',
    colorBg: 'rgba(217,119,6,0.07)',
    colorBorder: 'rgba(217,119,6,0.18)',
    colorShadow: 'rgba(217,119,6,0.08)',
    colorNum: 'rgba(217,119,6,0.15)',
  },
  {
    badge: 'Intelligence',
    name: 'Lens turns transactions into insight.',
    desc: 'Because Delt processes your payments, Lens already knows your revenue patterns, busiest hours, and seasonal trends. No manual uploads. No new tools to learn. Just ask.',
    unlock: 'Unlocks: pre-qualified capital offers',
    unlockIcon: '→',
    nodeName: 'Lens Intelligence',
    nodeStat: 'Transactions → Insight',
    nodeIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    ),
    color: '#4318FF',
    colorBg: 'rgba(67,24,255,0.06)',
    colorBorder: 'rgba(67,24,255,0.15)',
    colorShadow: 'rgba(67,24,255,0.08)',
    colorNum: 'rgba(67,24,255,0.12)',
  },
  {
    badge: 'Capital',
    name: 'Capital, matched to your business.',
    desc: 'Because Lens understands your performance and Delt processes your payments, we can underwrite instantly. Revenue-based funding, no equity, average 48-hour disbursement.',
    unlock: 'All four products connected',
    unlockIcon: '✓',
    nodeName: 'Capital',
    nodeStat: 'Matched to your business',
    nodeIcon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ),
    color: '#2563EB',
    colorBg: 'rgba(37,99,235,0.07)',
    colorBorder: 'rgba(37,99,235,0.18)',
    colorShadow: 'rgba(37,99,235,0.08)',
    colorNum: 'rgba(37,99,235,0.12)',
  },
];

const CONN_GRADIENTS = [
  'linear-gradient(to bottom, #059669, #D97706)',
  'linear-gradient(to bottom, #D97706, #4318FF)',
  'linear-gradient(to bottom, #4318FF, #2563EB)',
];

export function FlywheelSection() {
  const [activeStage, setActiveStage] = useState(0);
  const [pinned, setPinned] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevStageRef = useRef(0);

  const calcStage = useCallback(() => {
    const hotLine = window.innerHeight * 0.4;
    let best = 0;
    let bestDist = Infinity;

    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      const dist = Math.abs(mid - hotLine);
      if (r.top < window.innerHeight * 0.75 && dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });

    if (best !== prevStageRef.current) {
      prevStageRef.current = best;
      setActiveStage(best);
    }
  }, []);

  const checkPinned = useCallback(() => {
    if (!sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    const shouldPin = r.top <= 0 && r.bottom > 250;
    setPinned(prev => prev !== shouldPin ? shouldPin : prev);
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          calcStage();
          checkPinned();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    calcStage();
    return () => window.removeEventListener('scroll', onScroll);
  }, [calcStage, checkPinned]);

  const pct = Math.round(((activeStage + 1) / STEPS.length) * 100);

  return (
    <>
      <section className="fwl-section" ref={sectionRef}>
        {/* Sticky header */}
        <div className={`fwl-header${pinned ? ' fwl-pinned' : ''}`}>
          <div className="fwl-eyebrow">How Delt Works</div>
          <h2 className="fwl-title">Each layer makes the others stronger.</h2>
          <p className="fwl-subtitle">Most platforms bolt tools together. Delt is built so every product feeds the next — creating a flywheel that compounds over time.</p>
        </div>

        {/* Scroll area */}
        <div className="fwl-body">
          {/* LEFT steps */}
          <div className="fwl-steps">
            {STEPS.map((step, i) => (
              <div
                key={i}
                ref={el => { stepRefs.current[i] = el; }}
                className={`fwl-step fwl-step--${i + 1}${activeStage === i ? ' fwl-step-active' : ''}`}
                style={{ paddingTop: i === 0 ? 24 : undefined }}
              >
                <div className="fwl-badge" style={{ background: step.colorBg, color: step.color, borderColor: step.colorBorder }}>
                  <span className="fwl-badge-num" style={{ background: step.colorNum }}>{i + 1}</span>
                  {step.badge}
                </div>
                <div className="fwl-step-name">{step.name}</div>
                <p className="fwl-step-desc">{step.desc}</p>
                <div className="fwl-step-unlock" style={{ color: step.color }}>
                  <span className="fwl-unlock-dot" style={{ background: step.colorBg, borderColor: step.colorBorder }}>{step.unlockIcon}</span>
                  {step.unlock}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT sticky diagram */}
          <div className="fwl-diagram">
            <div className="fwl-frame">
              {STEPS.map((step, i) => (
                <div key={`node-${i}`}>
                  <div
                    className="fwl-node"
                    style={{
                      opacity: i <= activeStage ? 1 : 0.18,
                      transform: i <= activeStage ? 'translateX(0)' : 'translateX(-8px)',
                      borderColor: i === activeStage ? step.colorBorder : i < activeStage ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.06)',
                      boxShadow: i === activeStage ? `0 2px 20px ${step.colorShadow}` : 'none',
                      background: i <= activeStage ? '#FFFFFF' : '#F8F7F4',
                    }}
                  >
                    <div className="fwl-node-icon" style={{ background: step.colorBg, color: step.color }}>
                      {step.nodeIcon}
                    </div>
                    <div className="fwl-node-info">
                      <div className="fwl-node-name">{step.nodeName}</div>
                      <div className="fwl-node-stat" style={{ opacity: i <= activeStage ? 1 : 0, color: i <= activeStage ? '#8B8E9C' : '#B5B7C2' }}>
                        {step.nodeStat}
                      </div>
                    </div>
                    <div
                      className="fwl-node-check"
                      style={
                        i === activeStage
                          ? { borderColor: '#4318FF', color: 'white', background: '#4318FF' }
                          : i < activeStage
                          ? { borderColor: '#059669', color: '#059669', background: 'rgba(5,150,105,0.07)' }
                          : {}
                      }
                    >
                      ✓
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`fwl-conn${activeStage > i ? ' fwl-conn-lit' : ''}`}
                      data-conn={i + 1}
                      style={{
                        background: activeStage > i ? CONN_GRADIENTS[i] : 'rgba(0,0,0,0.06)',
                      }}
                    />
                  )}
                </div>
              ))}

              {/* Progress bar */}
              <div className="fwl-progress">
                <div className="fwl-progress-label">Stack</div>
                <div className="fwl-progress-bar">
                  {STEPS.map((step, i) => (
                    <div
                      key={i}
                      className="fwl-bar-seg"
                      style={
                        i <= activeStage
                          ? { background: step.color }
                          : {}
                      }
                    />
                  ))}
                </div>
                <div className="fwl-pct" style={{ color: activeStage === STEPS.length - 1 ? '#059669' : '#B5B7C2' }}>
                  {pct}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="fwl-cta">
        <div className="fwl-cta-heading">All four products connected.</div>
        <p className="fwl-cta-sub">Every Delt merchant begins the same way — a site that goes live in under 24 hours. What happens next is what makes the difference.</p>
        <Link to="/start" className="fwl-cta-btn">
          Get Started for Free
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </Link>
      </section>

      <style>{`
        /* ═══ LIGHT FLYWHEEL ═══ */
        .fwl-section {
          background: #F8F7F4;
          position: relative;
        }

        /* ── Sticky Header ── */
        .fwl-header {
          position: sticky;
          top: 0;
          z-index: 20;
          text-align: center;
          padding: 80px 60px 48px;
          background: linear-gradient(to bottom, #F8F7F4 70%, rgba(248,247,244,0) 100%);
          transition: padding 0.45s cubic-bezier(0.22,1,0.36,1), background 0.35s;
        }
        .fwl-pinned {
          padding: 20px 60px 16px;
          background: rgba(248,247,244,0.97);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 1px 0 rgba(0,0,0,0.06);
        }

        .fwl-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          color: #4318FF;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 16px;
          transition: margin 0.35s, font-size 0.35s;
        }
        .fwl-pinned .fwl-eyebrow { margin-bottom: 4px; font-size: 10px; }

        .fwl-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(32px, 3.5vw, 48px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.12;
          color: #0F1119;
          margin-bottom: 18px;
          transition: font-size 0.35s, margin 0.35s;
        }
        .fwl-pinned .fwl-title { font-size: clamp(17px, 1.8vw, 22px); margin-bottom: 0; }

        .fwl-subtitle {
          font-size: 19px;
          color: #4A4D5C;
          line-height: 1.65;
          max-width: 580px;
          margin: 0 auto;
          overflow: hidden;
          transition: opacity 0.3s, max-height 0.3s;
        }
        .fwl-pinned .fwl-subtitle { opacity: 0; max-height: 0; margin: 0 auto; }

        /* ── Body Layout ── */
        .fwl-body {
          display: flex;
          padding: 0 60px;
          gap: 72px;
          max-width: 1360px;
          margin: 0 auto;
        }

        /* ── Steps ── */
        .fwl-steps {
          flex: 1;
          max-width: 520px;
          padding: 32px 0 50vh;
        }

        .fwl-step {
          padding: 80px 0;
          opacity: 0.12;
          transition: opacity 0.5s ease;
        }
        .fwl-step:first-child { padding-top: 24px; }
        .fwl-step-active { opacity: 1; }

        .fwl-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 24px;
          border: 1px solid transparent;
        }

        .fwl-badge-num {
          width: 22px; height: 22px;
          border-radius: 7px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }

        .fwl-step-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: #0F1119;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .fwl-step-desc {
          font-size: 18px;
          line-height: 1.7;
          color: #4A4D5C;
          margin-bottom: 24px;
          max-width: 460px;
        }

        .fwl-step-unlock {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.02em;
          font-weight: 500;
        }

        .fwl-unlock-dot {
          width: 24px; height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid transparent;
        }

        /* ── Diagram ── */
        .fwl-diagram {
          position: sticky;
          top: calc(50vh - 260px);
          flex: 1;
          max-width: 520px;
          height: 540px;
          align-self: flex-start;
        }

        .fwl-frame {
          width: 100%; height: 100%;
          background: #FFFFFF;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 24px;
          padding: 36px 28px;
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03), 0 12px 40px rgba(0,0,0,0.04);
        }

        /* ── Nodes ── */
        .fwl-node {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.06);
          background: #F8F7F4;
          margin-bottom: 8px;
          position: relative;
          z-index: 2;
          transition:
            opacity 0.5s cubic-bezier(0.22,1,0.36,1),
            transform 0.5s cubic-bezier(0.22,1,0.36,1),
            border-color 0.4s,
            box-shadow 0.4s,
            background 0.4s;
        }

        .fwl-node-icon {
          width: 42px; height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .fwl-node-info { flex: 1; }

        .fwl-node-name {
          font-size: 15px;
          font-weight: 700;
          color: #0F1119;
          letter-spacing: -0.01em;
          margin-bottom: 2px;
        }

        .fwl-node-stat {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #B5B7C2;
          letter-spacing: 0.02em;
          transition: opacity 0.4s 0.15s;
        }

        .fwl-node-check {
          width: 26px; height: 26px;
          border-radius: 50%;
          border: 2px solid rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: transparent;
          flex-shrink: 0;
          transition: all 0.35s;
        }

        /* ── Connectors ── */
        .fwl-conn {
          width: 2px;
          height: 8px;
          margin: 0 0 0 39px;
          background: rgba(0,0,0,0.06);
          position: relative;
          z-index: 1;
          transition: background 0.5s;
          border-radius: 1px;
        }

        .fwl-conn-lit::after {
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 4px; height: 4px;
          border-radius: 50%;
          animation: fwl-flow 1.1s ease-in-out infinite;
        }

        .fwl-conn[data-conn="1"].fwl-conn-lit::after { background: #059669; }
        .fwl-conn[data-conn="2"].fwl-conn-lit::after { background: #D97706; }
        .fwl-conn[data-conn="3"].fwl-conn-lit::after { background: #4318FF; }

        @keyframes fwl-flow {
          0% { top: -2px; opacity: 0; }
          25% { opacity: 0.8; }
          100% { top: 10px; opacity: 0; }
        }

        @keyframes fwl-pop {
          0% { transform: scale(0.5); }
          55% { transform: scale(1.18); }
          100% { transform: scale(1); }
        }

        /* ── Progress Bar ── */
        .fwl-progress {
          position: absolute;
          bottom: 20px; left: 20px; right: 20px;
          background: #F8F7F4;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 14px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 3;
        }

        .fwl-progress-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #B5B7C2;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .fwl-progress-bar {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          margin: 0 16px;
        }

        .fwl-bar-seg {
          height: 6px;
          border-radius: 3px;
          flex: 1;
          background: rgba(0,0,0,0.06);
          transition: background 0.5s, box-shadow 0.5s;
        }

        .fwl-pct {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 700;
          color: #B5B7C2;
          min-width: 42px;
          text-align: right;
          transition: color 0.5s;
        }

        /* ── CTA ── */
        .fwl-cta {
          text-align: center;
          padding: 100px 60px 110px;
          background: #F8F7F4;
        }

        .fwl-cta-heading {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(26px, 2.8vw, 38px);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #0F1119;
          margin-bottom: 14px;
        }

        .fwl-cta-sub {
          font-size: 18px;
          color: #4A4D5C;
          line-height: 1.65;
          max-width: 480px;
          margin: 0 auto 36px;
        }

        .fwl-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #4945FF;
          color: white;
          padding: 18px 40px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: box-shadow 0.3s, transform 0.2s;
        }
        .fwl-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(4,30,66,0.2);
        }
        .fwl-cta-btn svg { transition: transform 0.2s; }
        .fwl-cta-btn:hover svg { transform: translateX(3px); }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .fwl-body {
            flex-direction: column;
            padding: 0 24px;
            gap: 32px;
          }
          .fwl-steps { max-width: 100%; padding-bottom: 20vh; }
          .fwl-diagram {
            position: relative;
            top: auto;
            max-width: 100%;
            height: 460px;
            order: -1;
            margin-bottom: 16px;
          }
          .fwl-header { padding: 60px 24px 32px; }
          .fwl-pinned { padding: 16px 24px 12px; }
          .fwl-step { padding: 48px 0; }
          .fwl-step-name { font-size: 24px; }
          .fwl-step-desc { font-size: 16px; }
          .fwl-cta { padding: 60px 24px 80px; }
        }
      `}</style>
    </>
  );
}