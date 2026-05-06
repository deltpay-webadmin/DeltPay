import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import {
  Banknote, Users, ShieldCheck, Puzzle, BadgeDollarSign, Brain, Layers,
  ArrowUpRight, TrendingUp, Check, X, Zap, ShoppingCart, BarChart3, Link2
} from 'lucide-react';

/* ── Mini visual components ── */

function SavingsBarChart() {
  const bars = [
    { label: 'Jan', h: 45 }, { label: 'Feb', h: 55 }, { label: 'Mar', h: 65 },
    { label: 'Apr', h: 50 }, { label: 'May', h: 75 }, { label: 'Jun', h: 85 },
  ];
  return (
    <div className="bg-white rounded-2xl p-5 w-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04]">
      <div className="flex justify-between items-center mb-4">
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#6B7280' }}>Monthly Savings</span>
        <span className="flex items-center gap-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#4945FF' }}>
          <ArrowUpRight size={12} color="#4945FF" /> +18%
        </span>
      </div>
      <div className="flex gap-3 items-end h-[90px]">
        {bars.map((b) => (
          <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5 h-full">
            <div className="flex-1 w-full rounded-md bg-[#f3f4f6] relative overflow-hidden flex items-end">
              <div className="w-full rounded-md" style={{ height: `${b.h}%`, background: 'linear-gradient(180deg, #6C63FF 0%, #4945FF 100%)', transition: 'height 0.6s ease' }} />
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RepeatBuyerFunnel() {
  const rows = [
    { label: 'Visitors', num: '12,480', w: '100%', bg: 'rgba(73,69,255,0.12)' },
    { label: 'First Purchase', num: '8,486', w: '68%', bg: 'rgba(73,69,255,0.2)' },
    { label: 'Return Visit', num: '5,242', w: '42%', bg: 'rgba(73,69,255,0.35)' },
    { label: 'Repeat Buyer', num: '3,494', w: '28%', bg: '#4945FF', textColor: '#fff' },
  ];
  return (
    <div className="bg-white rounded-2xl p-5 w-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04]">
      <div className="flex items-center gap-2 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#6B7280' }}>
        <ShoppingCart size={14} color="#4945FF" /> Customer Journey
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <div key={r.label} className="relative h-8 rounded-lg overflow-hidden flex items-center px-3">
            <div className="absolute inset-0 rounded-lg" style={{ width: r.w, background: r.bg }} />
            <span className="relative z-10 flex-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 600, color: r.textColor || '#374151' }}>{r.label}</span>
            <span className="relative z-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, color: r.textColor || '#374151' }}>{r.num}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: '#6C63FF', fontWeight: 600 }}>
        <Brain size={12} color="#4945FF" /> Lens recovering 1,200+ customers/mo
      </div>
    </div>
  );
}

function DisputeTimeline() {
  const items = [
    { time: '0:00h', label: 'Transaction flagged', icon: <Zap size={12} color="#7B75FF" /> },
    { time: '0:03h', label: 'Auto-hold applied', icon: <ShieldCheck size={12} color="#4945FF" /> },
    { time: '2:15h', label: 'Evidence compiled', icon: <BarChart3 size={12} color="#4945FF" /> },
    { time: '4:30h', label: 'Dispute won', icon: <Check size={12} color="#4945FF" /> },
  ];
  return (
    <div className="bg-white rounded-2xl p-5 w-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04]">
      <div className="flex items-center gap-2 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#6B7280' }}>
        <ShieldCheck size={14} color="#4945FF" /> Dispute Resolution
        <span className="ml-auto text-[10px] tracking-wide" style={{ fontWeight: 700, color: '#4945FF', background: 'rgba(73,69,255,0.08)', padding: '3px 8px', borderRadius: 6 }}>LIVE</span>
      </div>
      <div className="flex flex-col">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 relative pb-4 last:pb-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 bg-[rgba(73,69,255,0.08)]">{item.icon}</div>
            <div className="flex justify-between items-center flex-1 min-h-[28px]">
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#374151' }}>{item.label}</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{item.time}</span>
            </div>
            {i < items.length - 1 && <div className="absolute left-[13px] top-7 w-0.5 bg-[#e5e7eb]" style={{ height: 'calc(100% - 28px)' }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function UnifiedStackVisual() {
  const layers = [
    { name: 'Storefront', color: '#4945FF', icon: <ShoppingCart size={13} color="#fff" /> },
    { name: 'Payments', color: '#5E5AFF', icon: <BadgeDollarSign size={13} color="#fff" /> },
    { name: 'Intelligence', color: '#7B75FF', icon: <Brain size={13} color="#fff" /> },
    { name: 'Capital', color: '#9B97FF', icon: <TrendingUp size={13} color="#fff" /> },
  ];
  return (
    <div className="bg-white rounded-2xl p-5 w-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04]">
      <div className="flex items-center gap-2 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#6B7280' }}>
        <Link2 size={14} color="#4945FF" /> Delt Unified Stack
      </div>
      <div className="flex flex-col gap-1.5 mb-4">
        {layers.map((layer, i) => (
          <div key={layer.name} className="flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] text-white" style={{ background: layer.color, marginLeft: i * 8, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700 }}>
            {layer.icon} {layer.name}
            {i < layers.length - 1 && <ArrowUpRight size={10} color="rgba(255,255,255,0.6)" className="ml-auto rotate-90" />}
          </div>
        ))}
      </div>
      <div className="border-t border-[#f3f4f6] pt-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 600, color: '#9CA3AF' }}>
          <X size={12} color="#EF4444" /> 4+ separate tools
        </div>
        <div className="flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 600, color: '#4945FF' }}>
          <Check size={12} color="#4945FF" /> 1 unified platform
        </div>
      </div>
    </div>
  );
}

/* ── Card data ── */
interface CardData {
  id: string;
  icon: React.ReactNode;
  title: React.ReactNode;
  description: string;
  stats?: { value: string; label: string; color?: string }[];
  pill: { icon: React.ReactNode; text: string };
  visual: React.ReactNode;
  backTitle: string;
  backDesc: string;
  backList: string[];
  backIcon: React.ReactNode;
}

const cards: CardData[] = [
  {
    id: 'sale',
    icon: <BadgeDollarSign size={24} color="#4945FF" />,
    title: <>Keep more of <em className="not-italic" style={{ fontStyle: 'italic' }}>every sale</em></>,
    description: 'Your customers cover the cost — you keep every dollar.',
    stats: [{ value: '$2,400–$6,000', label: 'Recovered annually', color: '#4945FF' }],
    pill: { icon: <Banknote size={14} color="#4945FF" />, text: '100% fee transparency' },
    visual: <SavingsBarChart />,
    backTitle: 'Zero-Cost Processing',
    backDesc: 'Your customers cover the processing cost at checkout — you keep 100% of the sale. No monthly fees, no per-transaction charges, no hidden costs. Every dollar you ring up is a dollar you deposit.',
    backList: ['No monthly fees', 'No per-transaction charges', '100% of every sale deposited'],
    backIcon: <BadgeDollarSign size={32} color="#7B75FF" />,
  },
  {
    id: 'repeat',
    icon: <Brain size={22} color="#4945FF" />,
    title: <>Turn visitors into <em className="not-italic" style={{ fontStyle: 'italic' }}>repeat buyers</em></>,
    description: '',
    stats: [{ value: '+23%', label: 'Repeat purchase rate', color: '#4945FF' }],
    pill: { icon: <Users size={14} color="#4945FF" />, text: 'AI-powered recovery' },
    visual: <RepeatBuyerFunnel />,
    backTitle: 'AI Re-Engagement',
    backDesc: "Lens spots customers who haven't returned in 30 days and drafts a re-engagement offer. Your checkout remembers their last order. Your site adjusts to what's actually selling.",
    backList: ['30-day lapse detection', 'Auto-drafted re-engagement offers', 'Personalized checkout memory'],
    backIcon: <Brain size={32} color="#4945FF" />,
  },
  {
    id: 'chargeback',
    icon: <ShieldCheck size={24} color="#4945FF" />,
    title: <>Fewer chargebacks. <em className="not-italic" style={{ fontStyle: 'italic' }}>Cleaner books.</em></>,
    description: '',
    stats: [{ value: '91%', label: 'Dispute win rate' }, { value: '< 0.3%', label: 'Chargeback ratio' }],
    pill: { icon: <ShieldCheck size={14} color="#4945FF" />, text: 'Auto-flags suspicious transactions' },
    visual: <DisputeTimeline />,
    backTitle: 'Automated Dispute Defense',
    backDesc: 'Delt auto-flags suspicious transactions before they settle and generates dispute evidence from your records. Most responses go out within 24 hours — without you touching anything.',
    backList: ['Pre-settlement fraud flagging', 'Auto-generated dispute evidence', '24-hour response turnaround'],
    backIcon: <ShieldCheck size={32} color="#7B75FF" />,
  },
  {
    id: 'unified',
    icon: <Puzzle size={24} color="#4945FF" />,
    title: <>One login. <em className="not-italic" style={{ fontStyle: 'italic' }}>Zero headaches.</em></>,
    description: 'Everything works together out of the box. No setup fees, no middleware, no logins to remember.',
    stats: undefined,
    pill: { icon: <Layers size={14} color="#4945FF" />, text: '30% avg. savings vs. separate tools' },
    visual: <UnifiedStackVisual />,
    backTitle: 'Unified Platform',
    backDesc: 'Your storefront feeds your payments, your payments feed your intelligence, your intelligence unlocks your capital. One system, one bill, one dataset.',
    backList: ['Storefront → Payments → Intelligence → Capital', 'Single bill, single dataset', 'Zero integration maintenance'],
    backIcon: <Puzzle size={32} color="#4945FF" />,
  },
];

/* ── Expanded Card Modal ── */
function ExpandedCard({ card, onClose }: { card: CardData; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] grid place-items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Gradient backdrop — purple/blue wash matching example */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(200,210,255,0.7) 0%, rgba(235,230,255,0.85) 30%, rgba(255,255,255,0.9) 50%, rgba(210,200,255,0.6) 80%, rgba(180,190,255,0.5) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal — white bg, navy text, 2x larger */}
      <motion.div
        layoutId={`card-${card.id}`}
        className="relative z-10 w-[94vw] max-w-[900px] overflow-hidden rounded-3xl border border-black/[0.08] shadow-2xl"
        style={{
          background: '#fff',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow: '0 25px 80px rgba(73,69,255,0.12), 0 8px 32px rgba(0,0,0,0.08)',
        }}
        transition={{ type: 'spring', bounce: 0.05, duration: 0.5 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-xl border border-[#041E42]/15 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
        >
          <X size={16} color="#041E42" />
        </button>

        {/* Content area — white bg, navy text */}
        <div className="p-10 md:p-14">
          <div className="mb-6 text-[#4945FF]">{card.backIcon}</div>
          <motion.h3
            className="text-3xl md:text-[42px] text-[#041E42] mb-5"
            style={{ fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.35 }}
          >
            {card.backTitle}
          </motion.h3>
          <motion.p
            className="text-[#041E42]/55 text-[16px] md:text-[17px] mb-8 max-w-[640px]"
            style={{ lineHeight: 1.75 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17, duration: 0.35 }}
          >
            {card.backDesc}
          </motion.p>
          <motion.div
            className="space-y-3.5 mb-0"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.35 }}
          >
            {card.backList.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-[#041E42]/50 text-[15px]">
                <Check size={14} color="#4945FF" className="flex-shrink-0" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Stats footer — subtle gradient divider */}
        {card.stats && (
          <motion.div
            className="px-10 md:px-14 py-7"
            style={{
              borderTop: '1px solid rgba(4,30,66,0.06)',
              background: 'linear-gradient(180deg, rgba(73,69,255,0.02) 0%, rgba(73,69,255,0.06) 100%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.3 }}
          >
            <div className="flex gap-10">
              {card.stats.map((s, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-2xl md:text-3xl text-[#041E42]" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{s.value}</span>
                  <span className="text-xs text-[#041E42]/35">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Card Component ── */
function BentoCard({ card, delay, inView, onExpand }: { card: CardData; delay: number; inView: boolean; onExpand: () => void }) {
  return (
    <motion.div
      layoutId={`card-${card.id}`}
      className="rounded-2xl cursor-pointer relative overflow-hidden border border-black/[0.06] bg-white group"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={onExpand}
      whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(73,69,255,0.10), 0 8px 24px rgba(0,0,0,0.06)' }}
    >
      {/* ── Figure / Visual Area ── */}
      <div className="w-full h-80 group-hover:h-72 transition-all duration-300 bg-[#f0f3fa] p-4 rounded-t-2xl relative overflow-hidden">
        {/* Gradient overlay on hover */}
        <div
          style={{
            background: 'linear-gradient(124deg, #4945FF 1.5%, rgba(0,0,0,0) 69%)',
          }}
          className="absolute top-0 left-0 w-full h-full group-hover:opacity-100 opacity-0 transition-all duration-300 z-[1] rounded-t-2xl"
        />
        {/* Visual content positioned inside */}
        <div className="absolute bottom-2 right-3 w-[82%] z-[2] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[rgba(118,170,248,0.18)] border-4 border-transparent rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          {card.visual}
        </div>
      </div>

      {/* ── Article / Text Area ── */}
      <article className="p-6 pb-7 space-y-2.5">
        {/* Icon bar */}
        <div className="h-8 w-12 rounded-lg bg-[rgba(73,69,255,0.08)] flex items-center justify-center">
          {card.icon}
        </div>

        {/* Title */}
        <h3 className="text-[#0F1119] m-0" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
          {card.title}
        </h3>

        {/* Description or stats */}
        {card.description && (
          <p className="text-[#6B7280] m-0" style={{ fontSize: 14, lineHeight: 1.6 }}>{card.description}</p>
        )}
        {card.stats && !card.description && (
          <p className="text-[#6B7280] m-0" style={{ fontSize: 14, lineHeight: 1.6 }}>
            {card.stats.map(s => `${s.value} ${s.label.toLowerCase()}`).join(' · ')}
          </p>
        )}

        {/* "Learn more" link — slides in on hover */}
        <a
          className="text-sm text-[#4945FF] font-semibold group-hover:opacity-100 opacity-0 translate-y-2 group-hover:translate-y-0 pt-1 flex items-center gap-1 transition-all duration-300"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Click to expand
          <ArrowUpRight size={15} />
        </a>
      </article>
    </motion.div>
  );
}

/* ── Main Component ── */
export function ResultsBento() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expandedCard = cards.find((c) => c.id === expandedId);

  return (
    <section className="bg-white py-24 px-6 md:px-12" ref={ref}>
      <div className="text-center mb-5">
        <span className="inline-block text-xs tracking-[0.08em] uppercase border-[1.5px] border-[#4945FF] text-[#4945FF] px-[18px] py-1.5 rounded-full" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
          Platform Outcomes
        </span>
      </div>
      <h2 className="text-center text-[#0F1119] mb-15" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', letterSpacing: '-0.03em' }}>
        What changes when everything <span className="text-[#4945FF] italic">works together.</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1200px] mx-auto">
        {cards.map((card, i) => (
          <BentoCard
            key={card.id}
            card={card}
            delay={i * 0.1}
            inView={inView}
            onExpand={() => setExpandedId(card.id)}
          />
        ))}
      </div>

      <AnimatePresence>
        {expandedCard && (
          <ExpandedCard card={expandedCard} onClose={() => setExpandedId(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}