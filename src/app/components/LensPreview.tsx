import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { ArrowRight, BarChart3, TrendingUp, Shield, Users, Lightbulb, DollarSign, Send } from 'lucide-react';
import aiIcon from 'figma:asset/f4e6b69864ccf72e81b67d1397494cae42f32717.png';

const LENS_LAYERS = [
  { id: 'revenue', icon: BarChart3, title: 'Revenue Lens', stat: '12.4M pts/sec', color: '#7B8AFF', desc: 'Pinpoint what drives your sales' },
  { id: 'flowcast', icon: TrendingUp, title: 'FlowCast', stat: '94.7% accurate', color: '#6366F1', desc: 'Project revenue 7–90 days ahead' },
  { id: 'guardian', icon: Shield, title: 'Guardian', stat: '<50ms latency', color: '#818CF8', desc: 'Flag issues before they cost you' },
  { id: 'signals', icon: Users, title: 'CustomerSignals', stat: '2.1B indexed', color: '#60A5FA', desc: 'Know who drives your growth' },
  { id: 'engine', icon: Lightbulb, title: 'Decision Engine', stat: '+31% margins', color: '#A78BFA', desc: 'Model changes before you commit' },
  { id: 'capital', icon: DollarSign, title: 'Capital Index', stat: 'Adaptive', color: '#93C5FD', desc: 'Funding matched to your revenue' },
];

/* ── Simulated chat conversation ────────────────────────── */
const DEMO_MESSAGES = [
  { role: 'user' as const, text: 'What were my top-selling products last month?' },
  {
    role: 'assistant' as const,
    text: 'Based on your transaction data from January 2026, here are your top 5 products by revenue:',
    table: [
      { rank: 1, name: 'Wagyu Ribeye', revenue: '$18,750', orders: 150, trend: '+12%' },
      { rank: 2, name: 'Chilean Sea Bass', revenue: '$11,375', orders: 175, trend: '+8%' },
      { rank: 3, name: 'Duck Confit', revenue: '$9,600', orders: 200, trend: '+3%' },
      { rank: 4, name: 'Truffle Risotto', revenue: '$7,920', orders: 180, trend: '+15%' },
      { rank: 5, name: 'Lobster Tail', revenue: '$6,850', orders: 95, trend: '-2%' },
    ],
    summary: 'Your Wagyu Ribeye continues to dominate, and Truffle Risotto is your fastest-growing item at +15%. Consider promoting it more prominently.',
  },
];

/* ═══════════════════════════════════════════════════════════
   CHAT PREVIEW MOCKUP
   Animated mini chat UI rendered inline
   ═══════════════════════════════════════════════════════════ */
function ChatPreviewMockup() {
  const [showMessages, setShowMessages] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!isInView) return;
    const t1 = setTimeout(() => setShowMessages(true), 600);
    const t2 = setTimeout(() => setShowTable(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isInView]);

  return (
    <div ref={ref} className="bg-white rounded-xl overflow-hidden flex flex-col h-[520px] shadow-inner">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#E5E7EB] bg-[#FAFBFC]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4945FF] to-[#6366F1] flex items-center justify-center">
          <img src={aiIcon} alt="Lens" className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#041E42]">Lens by Delt</div>
          <div className="text-[10px] text-[#4945FF] font-medium">Online</div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {showMessages && (
            <>
              {/* User message */}
              <motion.div
                className="flex justify-end"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="bg-[#4945FF] text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]">
                  <p className="text-sm">{DEMO_MESSAGES[0].text}</p>
                </div>
              </motion.div>

              {/* Assistant message */}
              <motion.div
                className="flex gap-2.5 justify-start"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-7 h-7 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <img src={aiIcon} alt="AI" className="w-4 h-4" />
                </div>
                <div className="bg-[#F8FAFC] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%]">
                  <p className="text-sm text-[#041E42] mb-2">{DEMO_MESSAGES[1].text}</p>

                  {/* Table */}
                  {showTable && DEMO_MESSAGES[1].table && (
                    <motion.div
                      className="rounded-lg overflow-hidden border border-[#E5E7EB] mb-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-[#F1F3F5] text-[#64748B]">
                            <th className="px-2.5 py-1.5 text-left font-medium">#</th>
                            <th className="px-2.5 py-1.5 text-left font-medium">Product</th>
                            <th className="px-2.5 py-1.5 text-right font-medium">Revenue</th>
                            <th className="px-2.5 py-1.5 text-right font-medium">Trend</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DEMO_MESSAGES[1].table.map((row, i) => (
                            <motion.tr
                              key={row.rank}
                              className="border-t border-[#F1F3F5]"
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.25, delay: i * 0.08 }}
                            >
                              <td className="px-2.5 py-1.5 text-[#94A3B8]">{row.rank}</td>
                              <td className="px-2.5 py-1.5 text-[#041E42] font-medium">{row.name}</td>
                              <td className="px-2.5 py-1.5 text-right text-[#041E42]">{row.revenue}</td>
                              <td className={`px-2.5 py-1.5 text-right font-medium ${row.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-400'}`}>
                                {row.trend}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}

                  {showTable && (
                    <motion.p
                      className="text-xs text-[#64748B] leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {DEMO_MESSAGES[1].summary}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-[#E5E7EB] bg-[#FAFBFC]">
        <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5">
          <span className="flex-1 text-sm text-[#94A3B8]">Ask Lens anything...</span>
          <div className="w-8 h-8 rounded-lg bg-[#4945FF] flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LENS PREVIEW — Main export
   ═══════════════════════════════════════════════════════════ */

/* ── Barrier height in pixels — how much "extra" scroll the
     user must traverse while the section is stuck in place.
     Tune this to control how long the pause feels.
     ──────────────────────────────────────────────────────── */
const BARRIER_PX = 350;

export function LensPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const [activeLayer, setActiveLayer] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate through layers
  useEffect(() => {
    if (!isAutoPlaying || !isInView) return;
    const interval = setInterval(() => {
      setActiveLayer((prev) => (prev + 1) % LENS_LAYERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isInView]);

  return (
    /* Outer wrapper adds extra scroll height via padding-bottom.
       The inner section is sticky at top:0 so it "pauses" in the
       viewport while the user scrolls through the barrier zone,
       then releases naturally into the next section / CTA. */
    <div style={{ paddingBottom: BARRIER_PX, backgroundColor: '#03152E' }}>
      <section
        ref={sectionRef}
        className="relative py-24 lg:py-36 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #03152E 0%, #051D3B 50%, #03152E 100%)',
          position: 'sticky',
          top: 0,
        }}
      >
        {/* Ambient glows */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full opacity-15 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(ellipse, #4945FF 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(circle, #7B8AFF 0%, transparent 70%)' }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `
                linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
              `,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section header */}
          <motion.div
            className="text-center mb-16 lg:mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#4945FF]/30 bg-[#4945FF]/10 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4945FF] animate-pulse" />
              <span className="text-[#4945FF] text-sm font-medium tracking-wide">AI-Powered Intelligence</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight">
              Meet <span className="bg-gradient-to-r from-[#4945FF] to-[#7B8AFF] bg-clip-text text-transparent">Lens</span> by Delt
            </h2>
            <p className="text-lg lg:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
              Six AI layers that transform your transaction data into clear, actionable intelligence — included with every Delt account.
            </p>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left column — Live chat preview */}
            <motion.div
              className="lg:col-span-7 relative"
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative group">
                {/* Dynamic glow behind card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeLayer}
                    className="absolute -inset-4 rounded-3xl opacity-20 pointer-events-none blur-2xl"
                    style={{ background: `radial-gradient(ellipse at center, ${LENS_LAYERS[activeLayer].color}40, transparent 70%)` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                </AnimatePresence>

                {/* Browser chrome wrapper */}
                <motion.div
                  className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0A1628] shadow-2xl shadow-black/50"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Browser bar */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#0D1B2E] border-b border-white/[0.06]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="bg-white/[0.05] rounded-md px-3 py-1.5 text-[11px] text-white/30 font-mono">
                        lens.delt.com
                      </div>
                    </div>
                  </div>

                  {/* Live chat mockup */}
                  <ChatPreviewMockup />
                </motion.div>

                {/* Floating badges */}
                <motion.div
                  className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-[#4945FF] text-white text-xs font-semibold shadow-lg shadow-[#4945FF]/25 z-10"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Real-time AI
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -left-2 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md text-white/70 text-xs font-medium border border-white/[0.1] shadow-lg z-10"
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                >
                  6 intelligence layers
                </motion.div>
              </div>
            </motion.div>

            {/* Right column — Layer cards + CTA */}
            <div className="lg:col-span-5">
              <motion.p
                className="text-[11px] font-semibold text-white/25 uppercase tracking-[0.2em] mb-4 ml-1"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Intelligence Layers
              </motion.p>

              <div className="space-y-1">
                {LENS_LAYERS.map((layer, i) => {
                  const Icon = layer.icon;
                  const isActive = activeLayer === i;
                  return (
                    <motion.button
                      key={layer.id}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-colors border ${
                        isActive
                          ? 'bg-white/[0.07] border-white/[0.1]'
                          : 'bg-transparent border-transparent hover:bg-white/[0.03]'
                      }`}
                      onMouseEnter={() => {
                        setIsAutoPlaying(false);
                        setActiveLayer(i);
                      }}
                      onMouseLeave={() => setIsAutoPlaying(true)}
                      onClick={() => setActiveLayer(i)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.35 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ x: 3 }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ backgroundColor: isActive ? `${layer.color}25` : `${layer.color}12` }}
                      >
                        <Icon className="w-[18px] h-[18px]" style={{ color: isActive ? layer.color : `${layer.color}90` }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-white/70'}`}>
                          {layer.title}
                        </div>
                        <div className={`text-xs truncate transition-colors ${isActive ? 'text-white/50' : 'text-white/30'}`}>
                          {layer.desc}
                        </div>
                      </div>
                      {isActive && (
                        <motion.span
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white/50 flex-shrink-0"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.15 }}
                        >
                          {layer.stat}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5 mt-5 ml-4">
                {LENS_LAYERS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveLayer(i);
                      setIsAutoPlaying(false);
                      setTimeout(() => setIsAutoPlaying(true), 5000);
                    }}
                    className="relative w-6 h-1 rounded-full overflow-hidden bg-white/10"
                  >
                    {activeLayer === i && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-[#4945FF]"
                        layoutId="lensProgressDot"
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Link
                  to="/delt-ai"
                  className="group inline-flex items-center gap-2 bg-[#4945FF] hover:bg-[#3933CC] text-white px-7 py-3.5 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-[#4945FF]/20"
                >
                  Explore Lens
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <p className="text-white/30 text-xs mt-3 ml-1">
                  Included free with every Delt account
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}