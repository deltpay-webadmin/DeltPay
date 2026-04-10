import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, X, Sparkles, Pin, PinOff, Minimize2 } from 'lucide-react';
import lensOrbIcon from 'figma:asset/2bb89bf099aa846cbae2e04e01814e59ffa47260.png';
import type { PinnedChatData } from '../pages/SandboxPage';
import { useChatSessionsStorage } from './useLensChatStorage';
import type { StoredChatSession } from './useLensChatStorage';

const ACCENT = '#4945FF';
const PANEL_BG = '#041E42';

/* ── Context-aware prompts & insights per tab ── */
interface TabContext {
  greeting: string;
  insight: string;
  insightSeverity: 'info' | 'warning' | 'success';
  prompts: string[];
}

const TAB_CONTEXTS: Record<string, TabContext> = {
  dashboard: {
    greeting: 'What should I focus on today?',
    insight: 'Revenue is trending 7.2% above last month. Wednesday afternoons are your weakest window — consider a promo.',
    insightSeverity: 'info',
    prompts: ['Summarize my week', 'What needs attention?', 'Compare locations', 'Show top metrics'],
  },
  insights: {
    greeting: 'I can analyze your revenue and trends.',
    insight: 'Sales dipped 18% last Tuesday due to a street closure at Downtown. Midtown compensated with +12%.',
    insightSeverity: 'warning',
    prompts: ['Why are sales down?', 'Best performing day?', 'Customer spend trends', 'Revenue by location'],
  },
  catalog: {
    greeting: 'Need help managing inventory?',
    insight: '2 items are critically low: Spring Mix (6 units) and Chicken Breast (3 units). Recommend restocking today.',
    insightSeverity: 'warning',
    prompts: ['Which items to restock?', 'Slow-moving items', 'Pricing suggestions', 'Top margin items'],
  },
  'cash-flow': {
    greeting: 'I can help forecast your cash flow.',
    insight: 'Your next deposit of $4,218.30 arrives tomorrow. Cash position is healthy — $12,384 available.',
    insightSeverity: 'success',
    prompts: ['Cash flow forecast', 'Fee breakdown this month', 'Revenue by location', 'Customer spend trends'],
  },
  storefront: {
    greeting: 'Let me help optimize your storefront and catalog.',
    insight: 'Monthly visitors up 22% but 3 images are missing alt text. 2 items critically low stock. Fixing both could boost sales.',
    insightSeverity: 'info',
    prompts: ['How to improve SEO?', 'Which items to restock?', 'Slow-moving items', 'Competitor analysis'],
  },
  payments: {
    greeting: 'I can review your payment activity.',
    insight: 'You have 1 overdue invoice ($1,850 from TechStart LLC). Consider sending a payment reminder.',
    insightSeverity: 'warning',
    prompts: ['Show overdue invoices', 'Payment trends', 'Recurring revenue summary', 'Reduce processing fees'],
  },
  capital: {
    greeting: 'Let me assess your funding position.',
    insight: 'Your Readiness Score is 87/100. You\'ve repaid 41% — eligible for an additional $62K advance.',
    insightSeverity: 'success',
    prompts: ['Can I afford another loan?', 'Payoff timeline', 'Impact on cash flow', 'Compare offers'],
  },
  customers: {
    greeting: 'I can help you understand your customers.',
    insight: '2 VIP customers show declining visit frequency (down 40%+ in 6 weeks). A retention campaign could protect ~$4,200/mo in revenue.',
    insightSeverity: 'warning',
    prompts: ['Who are my VIPs?', 'At-risk customers', 'Customer lifetime value', 'Retention ideas'],
  },
  analytics: {
    greeting: 'I can help with cash flow, charts, and deep analysis.',
    insight: 'Your next deposit of $4,218.30 arrives tomorrow. Cash position is healthy — $12,384 available.',
    insightSeverity: 'success',
    prompts: ['Cash flow forecast', 'Fee breakdown this month', 'Revenue by location', 'Customer spend trends'],
  },
};

/* ── Simulated responses ── */
const SIMULATED_RESPONSES: Record<string, string> = {
  'Why are sales down?': 'Sales dropped 18% last Tuesday, primarily driven by a 34% decline at your Downtown location due to a local street closure. Your Midtown location compensated with a 12% increase. Average ticket size remained stable at $47.20 — the issue was fewer transactions, not lower spend.',
  'Can I afford another loan?': 'Based on your current revenue velocity and the 87/100 readiness score, yes. A $55,000 advance would result in ~$203/day in repayments, well within your comfortable threshold. Your current loan is 41% repaid, passing the 50% eligibility mark for stacked capital.',
  'Which items to restock?': 'Critical: Spring Mix (6 units, min 15) and Chicken Breast (3 units, min 12) need immediate restocking. Low: Sourdough Bread (12 units, min 30) and Cold Brew Concentrate (8 units, min 10). I recommend placing orders today to avoid stockouts by Thursday.',
  'Show overdue invoices': 'You have 1 overdue invoice: INV-1023 from TechStart LLC for $1,850.00, due Mar 5 (1 day overdue). This client has a strong payment history — likely an oversight. Sending a gentle reminder could resolve it quickly.',
  'When is my next deposit?': 'Your next deposit of $4,218.30 is scheduled for tomorrow (Mar 5) to Chase ••4501. You also have $3,891.00 currently in transit, expected to land today. Over the past 5 deposits, your average settlement time has been 1.2 business days.',
  'How to improve SEO?': 'Quick wins: (1) Add alt text to 3 images missing it — this alone could boost your score to 92+. (2) Your page speed is already 94/100, which is great. (3) Consider adding structured data for your menu items to appear in rich search results. (4) Your Google Business profile has 312 reviews — encourage more to improve local ranking.',
  'Summarize my week': 'This week: $28,462 in revenue (+8.4% vs last week), 596 active customers, and $18,420 collected in payments. Your Downtown location led with $10,200. You had 1 anomaly flagged (Terminal #4 refund spike) and 4 tasks pending review. Capital repayment is on track at $203/day.',
  'Who are my VIPs?': 'Your top 2 VIP customers are Sarah Chen ($4,820 lifetime, 62 visits, $77.74 avg. ticket) and Marcus Williams ($3,340 lifetime, 48 visits). Together they represent 8% of your customer base but drive 31% of repeat revenue. Both visited within the last 2 days.',
  'At-risk customers': 'David Kim and Lisa Thompson are flagged as at-risk. David hasn\'t visited in 45 days (was averaging 2x/month), and Lisa\'s last visit was 22 days ago. Combined at-risk revenue: ~$1,700/month. A targeted re-engagement offer — like a 15% loyalty discount — could recover them.',
  'Customer lifetime value': 'Your average customer lifetime value is $1,617. VIPs average $4,080 (2.5x higher). New customers show strong early engagement: Alex Nguyen has an $85 avg. ticket after just 4 visits — potential VIP candidate. Focus retention efforts on customers in the $1K–$2K band for the highest ROI.',
  'Retention ideas': 'Based on your churn patterns: (1) Offer a "We miss you" 15% discount to customers inactive 30+ days. (2) Launch a VIP loyalty tier — your top 8% would love exclusive perks. (3) Birthday/anniversary emails have 4x open rates in your segment. (4) Consider a referral program — your VIPs are your best advocates.',
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export function LensFloatingPanel({ activeTab, visible, pinnedChats = [], onPinChat, onUnpinChat }: { activeTab: string; visible: boolean; pinnedChats?: PinnedChatData[]; onPinChat?: (chat: PinnedChatData) => void; onUnpinChat?: (chatId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { saveSession, markPinned } = useChatSessionsStorage();

  const ctx = TAB_CONTEXTS[activeTab] || TAB_CONTEXTS.dashboard;

  // Reset messages when tab changes
  useEffect(() => {
    // Save current floating chat before switching tabs
    if (messages.length > 0 && chatId) {
      const firstUser = messages.find(m => m.role === 'user');
      const session: StoredChatSession = {
        id: chatId,
        title: `${activeTab.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} — ${firstUser?.text.slice(0, 40) || 'Quick chat'}`,
        messages: messages.map(m => ({ ...m })),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinned: pinnedChats.some(c => c.id === chatId),
      };
      saveSession(session);
    }
    setMessages([]);
    setChatId(null);
  }, [activeTab]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  /* Auto-save floating chat messages */
  const saveCurrentChat = useCallback(() => {
    if (messages.length === 0 || !chatId) return;
    const firstUser = messages.find(m => m.role === 'user');
    const session: StoredChatSession = {
      id: chatId,
      title: `${activeTab.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} — ${firstUser?.text.slice(0, 40) || 'Quick chat'}`,
      messages: messages.map(m => ({ ...m })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: pinnedChats.some(c => c.id === chatId),
    };
    saveSession(session);
  }, [messages, chatId, activeTab, pinnedChats, saveSession]);

  useEffect(() => {
    if (messages.length > 0) {
      const timeout = setTimeout(saveCurrentChat, 500);
      return () => clearTimeout(timeout);
    }
  }, [messages, saveCurrentChat]);

  const isPinned = chatId ? pinnedChats.some(c => c.id === chatId) : false;

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;
    setInput('');

    const userMsgId = `u-${Date.now()}`;
    if (!chatId) {
      setChatId(`float-${userMsgId}`);
    }

    const userMsg: Message = { id: userMsgId, role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const response = SIMULATED_RESPONSES[msg] ||
        `Based on your ${activeTab.replace('-', ' ')} data, I'm analyzing this now. Your current metrics look healthy overall — revenue trending +7.2% and customer retention stable at 94%. Let me pull specific details for: "${msg}"`;
      const aiMsg: Message = { id: `a-${Date.now()}`, role: 'assistant', text: response };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const handlePinToggle = () => {
    if (!chatId || messages.length === 0) return;
    if (isPinned) {
      onUnpinChat?.(chatId);
      markPinned(chatId, false);
    } else {
      const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
      const firstUser = messages.find(m => m.role === 'user');
      onPinChat?.({
        id: chatId,
        title: firstUser?.text.slice(0, 50) || 'Lens Chat',
        summary: lastAssistant ? lastAssistant.text.slice(0, 140) + (lastAssistant.text.length > 140 ? '...' : '') : 'No response yet',
        messageCount: messages.length,
        pinnedAt: Date.now(),
      });
      markPinned(chatId, true);
      saveCurrentChat();
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Floating orb button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: '#4945FF', boxShadow: '0 8px 32px rgba(73,69,255,0.35)' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src={lensOrbIcon} alt="Lens AI" className="w-7 h-7 object-contain" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-6 right-6 z-[100] flex flex-col rounded-2xl overflow-hidden"
            style={{ width: 400, height: 560, backgroundColor: PANEL_BG, boxShadow: '0 24px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(4,30,66,0.6)' }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/15">
              <div className="flex items-center gap-3">
                <img src={lensOrbIcon} alt="" className="w-6 h-6 object-contain" />
                <div>
                  <span className="text-sm text-white" style={{ fontWeight: 700 }}>Lens AI</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6FD1B0] animate-pulse" />
                    <span className="text-[10px] text-white/60">
                      Context: <span style={{ fontWeight: 600, color: '#fff' }}>{activeTab.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && onPinChat && (
                  <button
                    onClick={handlePinToggle}
                    title={isPinned ? 'Unpin from Dashboard' : 'Pin to Dashboard'}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    {isPinned ? <PinOff className="w-4 h-4 text-white" /> : <Pin className="w-4 h-4 text-white/50" />}
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>
            </div>

            {/* Contextual insight banner */}
            <div className="px-5 py-3 border-b border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-white/70" />
                <p className="text-xs text-white/80 leading-relaxed">{ctx.insight}</p>
              </div>
            </div>

            {/* Messages area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) rgba(0,0,0,0)' }}>
              {messages.length === 0 ? (
                <div>
                  <p className="text-sm text-white/70 mb-4">{ctx.greeting}</p>
                  <div className="flex flex-wrap gap-2">
                    {ctx.prompts.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(p)}
                        className="px-3 py-1.5 rounded-lg text-xs border border-white/20 text-white/80 hover:bg-white/10 hover:border-white/35 hover:text-white transition-all"
                        style={{ fontWeight: 500 }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-white text-[#041E42] rounded-br-md'
                          : 'bg-white/12 text-white/90 rounded-bl-md'
                      }`} style={m.role === 'assistant' ? { backgroundColor: 'rgba(255,255,255,0.12)' } : undefined}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-white/50"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick prompts when messages exist */}
            {messages.length > 0 && !isTyping && (
              <div className="px-5 pb-2 flex gap-1.5 flex-wrap">
                {ctx.prompts.slice(0, 2).map((p, i) => (
                  <button key={i} onClick={() => handleSend(p)} className="px-2.5 py-1 rounded-md text-[10px] border border-white/20 text-white/60 hover:text-white hover:border-white/35 transition-all" style={{ fontWeight: 500 }}>
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-5 pb-4 pt-2">
              <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 focus-within:ring-2 focus-within:ring-white/15 focus-within:border-white/40 transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask Lens anything..."
                  disabled={isTyping}
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                  style={{
                    backgroundColor: input.trim() && !isTyping ? '#fff' : 'rgba(255,255,255,0.12)',
                    color: input.trim() && !isTyping ? PANEL_BG : 'rgba(255,255,255,0.3)',
                  }}
                >
                  <ArrowUp size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}