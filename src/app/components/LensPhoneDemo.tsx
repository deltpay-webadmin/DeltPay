import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import lensOrbImg from 'figma:asset/469f37b2152191081bbcb3a26c5c8b22bf58788b.png';

const DEEP = '#041E42';
const ACCENT = '#4945FF';

/* ═══════════════════════════════════════════════════════════
   SIMULATED LENS SCREENS
   ═══════════════════════════════════════════════════════════ */

function ScreenChat() {
  const [typedChars, setTypedChars] = useState(0);
  const question = 'What were my top-selling products last month?';

  useEffect(() => {
    if (typedChars < question.length) {
      const t = setTimeout(() => setTypedChars(c => c + 1), 40);
      return () => clearTimeout(t);
    }
  }, [typedChars, question.length]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F8F9FC' }}>
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #E8EAF0' }}>
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4945FF, #6366F1)' }}>
          <img src={lensOrbImg} alt="" className="w-5 h-5 object-contain" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#041E42' }}>Lens by Delt</div>
          <div style={{ fontSize: 10, color: '#10B981', fontWeight: 500 }}>Online</div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-hidden">
        <motion.div
          className="self-end px-3.5 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%]"
          style={{ backgroundColor: ACCENT }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span style={{ fontSize: 12, color: '#fff', lineHeight: 1.45 }}>
            {question.slice(0, typedChars)}
            {typedChars < question.length && (
              <span className="inline-block w-[1px] h-3.5 ml-0.5 bg-white/70" style={{ animation: 'lpdBlink 0.8s infinite' }} />
            )}
          </span>
        </motion.div>

        {typedChars >= question.length && (
          <motion.div
            className="self-start px-3.5 py-3 rounded-2xl rounded-tl-sm max-w-[92%]"
            style={{ backgroundColor: '#fff', border: '1px solid #E8EAF0' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p style={{ fontSize: 11, color: '#041E42', lineHeight: 1.5, marginBottom: 10 }}>
              Based on your transaction data from January 2026, here are your top 5 products by revenue:
            </p>
            <div style={{ fontSize: 10, borderRadius: 8, overflow: 'hidden', border: '1px solid #E8EAF0' }}>
              <div className="grid grid-cols-4 px-2.5 py-1.5" style={{ backgroundColor: '#F1F3F7', fontWeight: 600, color: '#6B7280' }}>
                <span>#</span><span>Product</span><span className="text-right">Revenue</span><span className="text-right">Trend</span>
              </div>
              {[
                { n: 1, name: 'Wagyu Ribeye', rev: '$18,750', trend: '+12%', up: true },
                { n: 2, name: 'Chilean Sea Bass', rev: '$11,375', trend: '+8%', up: true },
                { n: 3, name: 'Duck Confit', rev: '$9,600', trend: '+3%', up: true },
                { n: 4, name: 'Truffle Risotto', rev: '$7,920', trend: '+15%', up: true },
                { n: 5, name: 'Lobster Tail', rev: '$6,850', trend: '-2%', up: false },
              ].map((row, i) => (
                <motion.div
                  key={row.n}
                  className="grid grid-cols-4 px-2.5 py-1.5"
                  style={{ borderTop: '1px solid #F1F3F7', color: '#041E42' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.12 }}
                >
                  <span style={{ color: '#94A3B8' }}>{row.n}</span>
                  <span style={{ fontWeight: 500, fontSize: 10 }}>{row.name}</span>
                  <span className="text-right" style={{ fontWeight: 600 }}>{row.rev}</span>
                  <span className="text-right" style={{ fontWeight: 600, color: row.up ? '#10B981' : '#EF4444' }}>{row.trend}</span>
                </motion.div>
              ))}
            </div>
            <motion.p
              style={{ fontSize: 10, color: '#6B7280', marginTop: 8, lineHeight: 1.45 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              Truffle Risotto is your fastest-growing item at +15%. Consider promoting it more prominently.
            </motion.p>
          </motion.div>
        )}
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: '#fff', border: '1px solid #E0E3EA' }}>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>Ask Lens anything...</span>
          <div className="ml-auto w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 9L9 1M9 1H3M9 1V7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenAnalytics() {
  return (
    <div className="flex flex-col h-full px-4 pt-4" style={{ backgroundColor: '#F8F9FC' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#041E42' }}>Revenue Lens</div>
          <div style={{ fontSize: 10, color: '#6B7280' }}>Last 7 days</div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#ECFDF5', border: '1px solid #D1FAE5' }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#059669' }}>+12.4%</span>
        </div>
      </div>

      <motion.div className="mb-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#041E42', letterSpacing: -1.5 }}>$35,140</div>
        <div style={{ fontSize: 10, color: '#6B7280' }}>Weekly total revenue</div>
      </motion.div>

      <div className="flex items-end gap-1.5 mb-5" style={{ height: 100 }}>
        {[
          { label: 'Mon', val: 60 }, { label: 'Tue', val: 73 }, { label: 'Wed', val: 54 },
          { label: 'Thu', val: 88 }, { label: 'Fri', val: 82 }, { label: 'Sat', val: 100 }, { label: 'Sun', val: 42 },
        ].map((d, i) => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className="w-full rounded-t-sm"
              style={{ backgroundColor: i === 6 ? ACCENT : '#CBD5E1', opacity: i === 6 ? 1 : 0.5 }}
              initial={{ height: 0 }}
              animate={{ height: d.val }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <span style={{ fontSize: 8, color: '#94A3B8' }}>{d.label}</span>
          </div>
        ))}
      </div>

      {[
        { icon: '📈', text: 'Wednesday revenue dropped 18% vs. your 4-week average.', tag: 'Anomaly', color: '#F59E0B' },
        { icon: '👥', text: '3 top patients haven\'t visited in 30+ days.', tag: 'Retention', color: '#EF4444' },
        { icon: '💰', text: 'At current pace, advance pays off Apr 28.', tag: 'Capital', color: '#10B981' },
      ].map((ins, i) => (
        <motion.div
          key={i}
          className="flex gap-2.5 p-2.5 rounded-lg mb-2"
          style={{ backgroundColor: '#fff', border: '1px solid #E8EAF0' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 + i * 0.2 }}
        >
          <span style={{ fontSize: 14 }}>{ins.icon}</span>
          <div className="flex-1">
            <p style={{ fontSize: 10, color: '#041E42', lineHeight: 1.4 }}>{ins.text}</p>
            <span style={{ fontSize: 8, fontWeight: 700, color: ins.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{ins.tag}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ScreenFlowcast() {
  return (
    <div className="flex flex-col h-full px-4 pt-4" style={{ backgroundColor: '#F8F9FC' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2BB8F9, #4945FF)' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10L5 6L8 8L12 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#041E42' }}>FlowCast</div>
          <div style={{ fontSize: 9, color: '#6B7280' }}>90-day revenue projection</div>
        </div>
      </div>

      <motion.div className="p-3 rounded-xl mb-3" style={{ backgroundColor: '#fff', border: '1px solid #E8EAF0' }}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Projected Q2 Revenue</div>
        <div className="flex items-baseline gap-2">
          <span style={{ fontSize: 28, fontWeight: 800, color: '#041E42', letterSpacing: -1 }}>$428K</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#10B981' }}>↑ 8.3% YoY</span>
        </div>
      </motion.div>

      <motion.div className="p-3 rounded-xl mb-3" style={{ backgroundColor: '#fff', border: '1px solid #E8EAF0' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 8, fontWeight: 600 }}>REVENUE TREND</div>
        <svg viewBox="0 0 240 80" className="w-full" style={{ height: 70 }}>
          <defs>
            <linearGradient id="lpd-fc-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4945FF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#4945FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lpd-fc-proj" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2BB8F9" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#2BB8F9" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points="0,65 20,58 40,52 60,55 80,45 100,48 120,38 140,32 140,80 0,80" fill="url(#lpd-fc-fill)" />
          <polyline points="0,65 20,58 40,52 60,55 80,45 100,48 120,38 140,32" fill="none" stroke="#4945FF" strokeWidth="2" strokeLinecap="round" />
          <polygon points="140,32 160,28 180,22 200,18 220,15 240,12 240,80 140,80" fill="url(#lpd-fc-proj)" />
          <polyline points="140,32 160,28 180,22 200,18 220,15 240,12" fill="none" stroke="#2BB8F9" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
          <line x1="140" y1="0" x2="140" y2="80" stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="2 2" />
          <text x="70" y="78" fill="#94A3B8" fontSize="7" textAnchor="middle">Actual</text>
          <text x="190" y="78" fill="#2BB8F9" fontSize="7" textAnchor="middle">Projected</text>
        </svg>
      </motion.div>

      <motion.div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#fff', border: '1px solid #E8EAF0' }}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: '3px solid #10B981', background: 'rgba(16,185,129,0.08)' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#10B981' }}>94</span>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#041E42' }}>Prediction Confidence</div>
          <div style={{ fontSize: 9, color: '#6B7280' }}>Based on 18 months of transaction data</div>
        </div>
      </motion.div>

      <motion.div className="flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl"
        style={{ backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: ACCENT }}>Revenue Stability Score: A+</span>
      </motion.div>
    </div>
  );
}

function ScreenDecisionEngine() {
  const [simulating, setSimulating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSimulating(true), 600);
    const t2 = setTimeout(() => { setSimulating(false); setShowResult(true); }, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex flex-col h-full px-4 pt-4" style={{ backgroundColor: '#F8F9FC' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4E5DE6, #7C3AED)' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2V12M2 7H12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#041E42' }}>Decision Engine</div>
          <div style={{ fontSize: 9, color: '#6B7280' }}>Scenario modeling</div>
        </div>
      </div>

      <motion.div className="p-3 rounded-xl mb-3" style={{ backgroundColor: '#fff', border: '1px solid #E8EAF0' }}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Active Scenario</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#041E42', marginBottom: 8 }}>"What if I raise menu prices by 8%?"</div>
        <div className="flex gap-2">
          <div className="flex-1 p-2 rounded-lg" style={{ backgroundColor: '#F1F3F7' }}>
            <div style={{ fontSize: 8, color: '#6B7280' }}>Price Change</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#041E42' }}>+8%</div>
          </div>
          <div className="flex-1 p-2 rounded-lg" style={{ backgroundColor: '#F1F3F7' }}>
            <div style={{ fontSize: 8, color: '#6B7280' }}>Time Range</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#041E42' }}>90 days</div>
          </div>
        </div>
      </motion.div>

      {simulating && (
        <motion.div className="flex items-center justify-center gap-2 py-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: ACCENT, animation: `lpdPulse 1s ease infinite ${i * 0.2}s` }} />
            ))}
          </div>
          <span style={{ fontSize: 11, color: '#6B7280' }}>Analyzing 142K transactions...</span>
        </motion.div>
      )}

      {showResult && (
        <>
          <motion.div className="p-3 rounded-xl mb-2" style={{ backgroundColor: '#ECFDF5', border: '1px solid #D1FAE5' }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Projected Impact</div>
            <div className="flex items-baseline gap-2">
              <span style={{ fontSize: 26, fontWeight: 800, color: '#059669', letterSpacing: -1 }}>+$31K</span>
              <span style={{ fontSize: 10, color: '#6B7280' }}>/ quarter</span>
            </div>
          </motion.div>

          <motion.div className="space-y-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {[
              { label: 'Customer churn risk', value: 'Low (2.1%)', color: '#10B981' },
              { label: 'Competitor price gap', value: 'Within range', color: '#10B981' },
              { label: 'Demand elasticity', value: '-0.3 (inelastic)', color: ACCENT },
            ].map((item, i) => (
              <div key={i} className="flex justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: '#fff', border: '1px solid #E8EAF0' }}>
                <span style={{ fontSize: 10, color: '#6B7280' }}>{item.label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </motion.div>

          <motion.div className="mt-3 py-2.5 rounded-xl text-center" style={{ backgroundColor: ACCENT }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>Recommendation: Proceed ✓</span>
          </motion.div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PHONE FRAME
   ═══════════════════════════════════════════════════════════ */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative" style={{ width: 340, height: 700 }}>
      <div
        className="absolute inset-0 rounded-[52px] overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1A1A1F 0%, #0D0D10 50%, #1A1A1F 100%)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 40px 100px rgba(0,0,0,0.65), 0 10px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute rounded-[44px] overflow-hidden" style={{ top: 8, left: 8, right: 8, bottom: 8 }}>
          {/* Status bar */}
          <div
            className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 pt-3 pb-1.5"
            style={{ backgroundColor: 'rgba(248,249,252,0.95)', backdropFilter: 'blur(12px)' }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: '#041E42', WebkitFontSmoothing: 'antialiased' }}>9:41</span>
            <div className="rounded-full" style={{ width: 110, height: 30, backgroundColor: '#000', borderRadius: 20 }} />
            <div className="flex items-center gap-1.5">
              <svg width="16" height="12" viewBox="0 0 14 10" fill="#041E42"><rect x="0" y="6" width="3" height="4" rx="0.5"/><rect x="4" y="4" width="3" height="6" rx="0.5"/><rect x="8" y="1" width="3" height="9" rx="0.5"/><rect x="12" y="0" width="2" height="10" rx="0.5" opacity="0.3"/></svg>
              <svg width="22" height="12" viewBox="0 0 20 10" fill="none"><rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="#041E42" strokeWidth="1"/><rect x="19" y="3" width="1.5" height="4" rx="0.5" fill="#041E42"/><rect x="2" y="2" width="13" height="6" rx="1" fill="#10B981"/></svg>
            </div>
          </div>
          <div className="absolute inset-0 pt-11 overflow-hidden" style={{ backgroundColor: '#F8F9FC', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility' }}>
            {children}
          </div>
        </div>
      </div>
      {/* Side buttons */}
      <div className="absolute -left-[2px] top-[128px] w-[3px] h-[30px] rounded-l-sm" style={{ backgroundColor: '#2A2A30' }} />
      <div className="absolute -left-[2px] top-[175px] w-[3px] h-[54px] rounded-l-sm" style={{ backgroundColor: '#2A2A30' }} />
      <div className="absolute -left-[2px] top-[240px] w-[3px] h-[54px] rounded-l-sm" style={{ backgroundColor: '#2A2A30' }} />
      <div className="absolute -right-[2px] top-[190px] w-[3px] h-[68px] rounded-r-sm" style={{ backgroundColor: '#2A2A30' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCREEN SEQUENCE
   ═══════════════════════════════════════════════════════════ */
const SCREENS = [
  { id: 'chat', label: 'Lens Chat', Component: ScreenChat, duration: 7000 },
  { id: 'analytics', label: 'Revenue Lens', Component: ScreenAnalytics, duration: 5500 },
  { id: 'flowcast', label: 'FlowCast', Component: ScreenFlowcast, duration: 5500 },
  { id: 'decision', label: 'Decision Engine', Component: ScreenDecisionEngine, duration: 6000 },
] as const;

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT — Homepage Section
   ═══════════════════════════════════════════════════════════ */
export function LensPhoneDemo() {
  const [activeScreen, setActiveScreen] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

  // Only start cycling when in view
  useEffect(() => {
    if (isInView && !hasStarted) {
      setHasStarted(true);
    }
  }, [isInView, hasStarted]);

  // Auto-cycle
  useEffect(() => {
    if (!hasStarted) return;
    const t = setTimeout(() => {
      setActiveScreen(prev => (prev + 1) % SCREENS.length);
    }, SCREENS[activeScreen].duration);
    return () => clearTimeout(t);
  }, [activeScreen, hasStarted]);

  const ActiveComponent = SCREENS[activeScreen].Component;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:py-32"
      style={{ backgroundColor: DEEP }}
    >
      {/* Scoped keyframes */}
      <style>{`
        @keyframes lpdBlink { 0%,50% { opacity: 1 } 51%,100% { opacity: 0 } }
        @keyframes lpdPulse { 0%,100% { opacity: 0.3; transform: scale(0.8) } 50% { opacity: 1; transform: scale(1) } }
        @keyframes lpdFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
      `}</style>

      {/* Ambient glows */}
      <div className="absolute pointer-events-none" style={{
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 700, height: 700, borderRadius: '50%',
        background: `radial-gradient(circle, ${ACCENT}12 0%, ${ACCENT}06 30%, transparent 70%)`,
      }} />
      <div className="absolute pointer-events-none" style={{
        top: '30%', left: '55%', transform: 'translate(-50%, -50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(43,184,249,0.06) 0%, transparent 70%)',
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left: Text Content */}
          <div className="flex-1 text-center lg:text-left max-w-xl">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: `${ACCENT}15`, border: `1px solid ${ACCENT}25` }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981', boxShadow: '0 0 6px rgba(16,185,129,0.5)' }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', letterSpacing: 0.5 }}>AI-Powered Intelligence</span>
            </motion.div>

            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-5"
              style={{ color: '#F1F5F9' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              See{' '}
              <span style={{
                background: 'linear-gradient(135deg, #A5B4FC, #818CF8, #6366F1, #4945FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Lens</span>{' '}
              in action
            </motion.h2>

            <motion.p
              className="max-w-lg text-base sm:text-lg mb-8"
              style={{ color: '#64748B', lineHeight: 1.7 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Six AI layers that transform your transaction data into clear, actionable intelligence — included free with every Delt account.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link
                to="/delt-ai"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-white hover:brightness-110 transition-all cursor-pointer"
                style={{ backgroundColor: ACCENT, boxShadow: `0 6px 24px ${ACCENT}40` }}
              >
                Explore Lens <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/lens-chat"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full transition-all"
                style={{ border: '1px solid #1E293B', color: '#94A3B8' }}
              >
                Try it free
              </Link>
            </motion.div>
          </div>

          {/* Right: Phone */}
          <motion.div
            className="relative flex flex-col items-center flex-shrink-0"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <PhoneFrame>
              <AnimatePresence mode="wait">
                <motion.div
                  key={SCREENS[activeScreen].id}
                  className="h-full"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                >
                  <ActiveComponent />
                </motion.div>
              </AnimatePresence>
            </PhoneFrame>

            {/* Indicator dots */}
            <div className="flex items-center gap-3 mt-8">
              {SCREENS.map((screen, i) => (
                <button
                  key={screen.id}
                  onClick={() => setActiveScreen(i)}
                  className="cursor-pointer"
                >
                  <div
                    className="relative rounded-full transition-all duration-500"
                    style={{
                      width: i === activeScreen ? 32 : 8,
                      height: 8,
                      backgroundColor: i === activeScreen ? ACCENT : '#1E293B',
                      boxShadow: i === activeScreen ? `0 0 12px ${ACCENT}50` : 'none',
                      overflow: 'hidden',
                    }}
                  >
                    {i === activeScreen && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: '#7B8AFF', transformOrigin: 'left' }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: SCREENS[activeScreen].duration / 1000, ease: 'linear' }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Screen label */}
            <motion.div
              className="mt-3 px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              key={SCREENS[activeScreen].label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500, letterSpacing: 0.5 }}>
                {SCREENS[activeScreen].label}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}