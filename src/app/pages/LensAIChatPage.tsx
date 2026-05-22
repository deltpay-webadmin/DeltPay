import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import {
  ArrowUp, Paperclip, Mic, Sparkles, ChevronLeft, Copy, RefreshCcw,
  ThumbsUp, ThumbsDown, MessageSquarePlus, PanelLeftClose, PanelLeftOpen,
  MessageSquare,
} from 'lucide-react';
import deltLogoImg from '@/assets/delt-logo-on-dark.svg';

/* ─────────────────────────────────────────────────────────────
   PALETTE — deep-navy chat surface
   Matched to the marketing site's “Fewer tools. More money. Less
   stress.” GlobeStats section (#080A28) so the chat reads as one
   continuous brand surface. Lifted variants are used for the
   sidebar, cards / tables, and the composer.
   ───────────────────────────────────────────────────────────── */
const C = {
  bg:          '#080A28',  // matches GlobeStats hero bg
  bgRaised:    '#10133A',  // cards / tables / composer
  sidebar:     '#05071C',  // one step deeper than bg
  sidebarHov:  '#10133A',
  border:      '#252A55',
  borderSoft:  '#181C42',
  text:        '#ECECF1',
  textSoft:    '#B4B7D0',
  textMute:    '#8086A8',
  bubble:      '#161A40',   // user message bubble
  bubbleBd:    '#252A55',
  accent:      '#7C6BFF',
  accentDeep:  '#4945FF',
  accentSoft:  'rgba(124,107,255,0.16)',
  danger:      '#F87171',
};

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

/* ─────────────────────────────────────────────────────────────
   REPLY ENGINE — keyword matching with hardcoded sample data
   (unchanged — visual layer only redesign)
   ───────────────────────────────────────────────────────────── */
type Reply = {
  text: string;
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
  followups?: string[];
};

function getLensReply(question: string): Reply {
  const q = question.toLowerCase().trim();

  if (/^(hi|hey|hello|yo|sup|howdy)\b/.test(q)) {
    return {
      text: "Hey — I'm Lens. Ask me anything about your sales, customers, inventory, or payouts. Here are a few things people ask first:",
      followups: [
        'Which products made me the most last month?',
        'When should I run my next promo?',
        'Show me my top 10 customers',
      ],
    };
  }

  if (/(what|who) (is|are) lens|tell me about lens|what can you do|capabilities|how do you work/.test(q)) {
    return {
      text: "I'm Lens, an AI built into Delt. I read your live data from Delt POS, Payments, and Capital — then answer plain-English questions in seconds with a citation back to the underlying numbers.",
      bullets: [
        'Sales, profit, and margin — by product, location, hour, day',
        'Customer insights — top spenders, repeats, churn risk',
        'Inventory — what to reorder, what to mark down',
        'Cashflow — deposits, payouts, capital balances',
      ],
      followups: [
        'Why was last Tuesday slow?',
        'Show me my slowest hour this week',
        'Which products should I reorder?',
      ],
    };
  }

  if (/(top|best|most|highest).*(product|sku|item|seller|sold)|which products|what.*sells/.test(q)) {
    return {
      text: 'Your top 5 products by gross profit last month — Apr 1 to Apr 30, 2026:',
      table: {
        headers: ['Product', 'Units', 'Revenue', 'Gross profit'],
        rows: [
          ['House Burger', '1,284', '$22,470', '$13,920'],
          ['Iced Latte (16oz)',  '2,071', '$10,355', '$7,562'],
          ['Truffle Fries', '964', '$8,676', '$5,688'],
          ['Caesar Salad', '732', '$10,248', '$5,372'],
          ['Margherita Pizza', '518', '$11,396', '$5,114'],
        ],
      },
      followups: [
        'What hours sell the most burgers?',
        'Which products have the lowest margin?',
        'Compare April to March',
      ],
    };
  }

  if (/(when|should i).*(promo|discount|sale|offer)|run a promo|best time.*promo/.test(q)) {
    return {
      text: 'Tuesdays from 3–5 PM are your weakest revenue window — 38% below your weekly average. A 2-hour promo there typically lifts ticket count without cannibalizing weekend sales.',
      bullets: [
        'Suggested: 15% off any drink + side, Tue 3–5 PM',
        'Forecasted lift: +$1,840 over 4 weeks',
        'Risk: low — promo window doesn\'t overlap your peak hours',
      ],
      followups: [
        'Build me that promo',
        'Why are Tuesdays slow?',
        'What promos worked last quarter?',
      ],
    };
  }

  if (/(slow|slowest|down|low).*(day|tuesday|monday|wednesday|thursday|friday|week)|why.*(down|slow|low)/.test(q)) {
    return {
      text: 'Tuesdays were 22% below your 4-week average last month. Three drivers stand out:',
      bullets: [
        'Weather: 3 of 4 Tuesdays had rain after 2 PM (foot traffic -34%)',
        'Staffing: only 2 servers Tue afternoons vs 4 on busy days',
        'No active promo running mid-week',
      ],
      followups: [
        'Run a Tuesday promo',
        'Show me weather impact',
        'Compare staffing to revenue',
      ],
    };
  }

  if (/tips?.*(down|low|drop|fall)|why.*tips/.test(q)) {
    return {
      text: 'Tip percentage dropped from 18.4% to 15.7% over the last 3 weeks. Two likely causes:',
      bullets: [
        'Average ticket size rose 14% (larger checks tip a lower %)',
        'New default tip prompts on the POS were lowered from 20/22/25% to 18/20/22% on Apr 12',
      ],
      followups: [
        'Restore the higher tip prompts',
        'Tips by server',
        'Tips by day of week',
      ],
    };
  }

  if (/(top|best|biggest).*customer|who.*spend|loyal customer|vip|whales?/.test(q)) {
    return {
      text: 'Your top 10 customers by 12-month spend:',
      table: {
        headers: ['Customer', 'Visits', 'Total spent', 'Last visit'],
        rows: [
          ['Maria L.',  '47', '$3,420', '2 days ago'],
          ['James K.',  '39', '$2,985', '5 days ago'],
          ['Priya S.',  '52', '$2,710', 'yesterday'],
          ['Marcus T.', '31', '$2,180', '1 week ago'],
          ['Aisha R.',  '28', '$2,094', '3 days ago'],
          ['David C.',  '34', '$1,915', '4 days ago'],
          ['Sara M.',   '41', '$1,820', 'yesterday'],
          ['Liam B.',   '22', '$1,640', '6 days ago'],
          ['Noor A.',   '29', '$1,505', '2 days ago'],
          ['Eli W.',    '24', '$1,470', '1 week ago'],
        ],
      },
      followups: [
        'Email these 10 a thank-you offer',
        'Which of these haven\'t been back in 30 days?',
        'Show me top customers by profit, not revenue',
      ],
    };
  }

  if (/slow(est)? hour|dead hour|when.*(empty|quiet|slow)/.test(q)) {
    return {
      text: 'Your slowest hour, averaged across the last 4 weeks: Tuesday 3–4 PM ($142 avg revenue, vs $612 weekly hourly average).',
      bullets: [
        'Tue 3–4 PM: $142 avg',
        'Wed 2–3 PM: $189 avg',
        'Mon 4–5 PM: $204 avg',
      ],
      followups: [
        'What about my busiest hour?',
        'Run a promo at my slowest hour',
        'Show me hour-by-hour for this week',
      ],
    };
  }

  if (/(cash ?flow|deposit|payout|when.*paid|next deposit)/.test(q)) {
    return {
      text: 'Your next Delt Payments deposit lands tomorrow (May 8) for $4,217.84 — settles next-day on weekdays.',
      bullets: [
        'Pending in batch:  $4,217.84',
        '7-day rolling avg: $3,890/day',
        'Last 30 days net:  $116,720',
      ],
      followups: [
        'Show me my deposit history',
        'Set up daily payout email',
        'How much capital can I draw?',
      ],
    };
  }

  if (/(capital|loan|advance|funding|borrow|credit line)/.test(q)) {
    return {
      text: "Based on your last 90 days of processing, you pre-qualify for up to $42,000 in Delt Capital. Repaid as a small % of daily card sales — no fixed monthly payment.",
      bullets: [
        'Available: up to $42,000',
        'Daily holdback: 8–12% of card sales (you choose)',
        'Funding speed: same-day if approved before 2 PM ET',
      ],
      followups: [
        'Apply for $20,000',
        'How does repayment work?',
        'Compare to a bank line of credit',
      ],
    };
  }

  if (/(pricing|fee|rate|cost|how much|charge).*(delt|payment|process|card)|interchange/.test(q)) {
    return {
      text: 'Your effective rate last month was 2.41% — 0.18% below the SMB benchmark. Breakdown:',
      bullets: [
        'Interchange:        1.78%',
        'Delt platform fee:  0.49%',
        'Network/assessment: 0.14%',
        'Effective total:    2.41%',
      ],
      followups: [
        'How can I lower my rate?',
        'Show me chargebacks this month',
        'Compare to last quarter',
      ],
    };
  }

  if (/(reorder|restock|inventory|out of stock|low stock|running low)/.test(q)) {
    return {
      text: 'Five items are within 7 days of stockout based on current sell-through:',
      table: {
        headers: ['SKU', 'On hand', 'Days left', 'Suggested order'],
        rows: [
          ['Iced Latte cups (16oz)', '184', '4', '600'],
          ['House Burger patties',   '92',  '5', '400'],
          ['Truffle oil (1L)',       '3',   '6', '12'],
          ['To-go containers (M)',   '210', '7', '500'],
          ['Cold-brew concentrate',  '6',   '7', '24'],
        ],
      },
      followups: [
        'Place these orders for me',
        'Which items are over-stocked?',
        'Show me waste this month',
      ],
    };
  }

  return {
    text: `I'd answer that against your live Delt POS, Payments, and Capital data — once you're connected I can pull exact numbers. For "${question.trim()}", I'd typically look at the last 30–90 days, segment by location and product mix, and flag anomalies. Try one of these to see how Lens responds today:`,
    followups: [
      'Which products made me the most last month?',
      'When should I run my next promo?',
      'Show me my top 10 customers',
      'Why are tips down?',
    ],
  };
}

/* ─────────────────────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────────────────────── */
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reply?: Reply;
};

type Thread = {
  id: string;
  title: string;
  createdAt: number;
};

const SUGGESTIONS_EMPTY = [
  'Which products made me the most last month?',
  'When should I run a promo?',
  'Why are tips down?',
  'Who are my top 10 customers?',
  'Show me my slowest hour',
];

/* ─────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────── */
export function LensAIChatPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Recent threads (sample — backed by in-memory state for the preview)
  const [threads, setThreads] = useState<Thread[]>(() => [
    { id: 't-1', title: 'When should I run a promo?',         createdAt: Date.now() - 1000 * 60 * 32 },
    { id: 't-2', title: 'Top products by gross profit',       createdAt: Date.now() - 1000 * 60 * 60 * 5 },
    { id: 't-3', title: 'Why are tips down this month?',      createdAt: Date.now() - 1000 * 60 * 60 * 26 },
    { id: 't-4', title: 'Slowest hour — staffing impact',     createdAt: Date.now() - 1000 * 60 * 60 * 72 },
  ]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const seededRef = useRef(false);

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  // Seed initial question from query string (?q=...) once
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    if (initialQ.trim()) {
      setSearchParams({}, { replace: true });
      sendMessage(initialQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Collapse sidebar by default on narrow screens
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 880px)');
    const apply = () => setSidebarOpen(!mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Auto-grow textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [input]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    // If this is the first message of the session, create a thread entry
    if (messages.length === 0 && !activeThreadId) {
      const id = `t-${Date.now()}`;
      setActiveThreadId(id);
      setThreads((prev) => [
        { id, title: trimmed.length > 48 ? trimmed.slice(0, 48) + '…' : trimmed, createdAt: Date.now() },
        ...prev,
      ]);
    }

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    const reply = getLensReply(trimmed);
    const delay = 700 + Math.min(1100, trimmed.length * 14);
    window.setTimeout(() => {
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply.text,
        reply,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
    }, delay);
  }

  function newChat() {
    setMessages([]);
    setInput('');
    setActiveThreadId(null);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const empty = messages.length === 0 && !isThinking;

  const groupedThreads = useMemo(() => {
    const now = Date.now();
    const buckets: Record<string, Thread[]> = { Today: [], Yesterday: [], 'Previous 7 days': [], Older: [] };
    for (const t of threads) {
      const ageHrs = (now - t.createdAt) / 36e5;
      if (ageHrs < 24)       buckets.Today.push(t);
      else if (ageHrs < 48)  buckets.Yesterday.push(t);
      else if (ageHrs < 168) buckets['Previous 7 days'].push(t);
      else                   buckets.Older.push(t);
    }
    return buckets;
  }, [threads]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        display: 'flex',
        background: C.bg, fontFamily: FONT, color: C.text,
      }}
    >
      {/* ───── SIDEBAR ───── */}
      <aside
        style={{
          width: sidebarOpen ? 264 : 0,
          flexShrink: 0,
          background: C.sidebar,
          borderRight: sidebarOpen ? `1px solid ${C.borderSoft}` : 'none',
          display: 'flex', flexDirection: 'column',
          transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        <div style={{ width: 264, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Sidebar top: collapse + logo */}
          <div
            style={{
              height: 56, flexShrink: 0,
              padding: '0 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <Link
              to="/lens-ai"
              style={{
                display: 'inline-flex', alignItems: 'baseline',
                padding: '6px 8px', borderRadius: 8, textDecoration: 'none',
              }}
              aria-label="Lens home"
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: 28, fontWeight: 500, lineHeight: 1,
                  color: C.text,
                  letterSpacing: '0.005em',
                  paddingRight: '0.06em',
                }}
              >
                Lens
              </span>
            </Link>

            <IconButton
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={18} />
            </IconButton>
          </div>

          {/* New chat */}
          <div style={{ padding: '4px 8px 8px' }}>
            <button
              type="button"
              onClick={newChat}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.text, fontSize: 14, fontWeight: 500, fontFamily: FONT,
                cursor: 'pointer',
                transition: 'background 120ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.sidebarHov; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <MessageSquarePlus size={16} />
              New chat
            </button>
          </div>

          {/* Thread list */}
          <nav
            style={{
              flex: 1, overflowY: 'auto',
              padding: '4px 8px 12px',
            }}
          >
            {(['Today', 'Yesterday', 'Previous 7 days', 'Older'] as const).map((label) => {
              const list = groupedThreads[label];
              if (!list || list.length === 0) return null;
              return (
                <div key={label} style={{ marginTop: 12 }}>
                  <div
                    style={{
                      padding: '6px 12px',
                      fontSize: 11, fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: C.textMute,
                    }}
                  >
                    {label}
                  </div>
                  {list.map((t) => {
                    const active = t.id === activeThreadId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          // Sample preview behaviour — selecting a stored thread just opens a fresh chat.
                          setActiveThreadId(t.id);
                          setMessages([]);
                          setInput('');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px', borderRadius: 8,
                          background: active ? C.sidebarHov : 'transparent',
                          border: 'none', cursor: 'pointer',
                          color: C.text, fontFamily: FONT,
                          fontSize: 13.5, fontWeight: 400,
                          textAlign: 'left',
                          transition: 'background 120ms',
                        }}
                        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = C.sidebarHov; }}
                        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <MessageSquare size={14} style={{ color: C.textSoft, flexShrink: 0 }} />
                        <span
                          style={{
                            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                            flex: 1,
                          }}
                        >
                          {t.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* Sidebar bottom — preview status + Delt brand lockup */}
          <div
            style={{
              padding: '12px 14px 14px',
              borderTop: `1px solid ${C.borderSoft}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 12, color: C.textMute, lineHeight: 1.4 }}>
              Preview mode
              <br />
              <span style={{ fontSize: 11 }}>Sample data</span>
            </div>
            <a
              href="https://delt.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Delt"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                opacity: 0.85, transition: 'opacity 120ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.85'; }}
            >
              <span style={{ fontSize: 11, color: C.textMute, fontWeight: 500 }}>by</span>
              <img
                src={deltLogoImg}
                alt="Delt"
                style={{ height: 12, width: 'auto', objectFit: 'contain' }}
              />
            </a>
          </div>
        </div>
      </aside>

      {/* ───── MAIN COLUMN ───── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* TOP BAR */}
        <header
          style={{
            flexShrink: 0,
            height: 56,
            padding: '0 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: C.bg,
            borderBottom: `1px solid ${C.borderSoft}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!sidebarOpen && (
              <IconButton
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                title="Open sidebar"
              >
                <PanelLeftOpen size={18} />
              </IconButton>
            )}
            <button
              type="button"
              onClick={() => navigate('/lens-ai')}
              aria-label="Back to Lens"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 8,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: C.textSoft, fontSize: 13.5, fontWeight: 500, fontFamily: FONT,
                transition: 'background 120ms, color 120ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.bgRaised; e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textSoft; }}
            >
              <ChevronLeft size={15} />
              Back
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 12, color: C.textMute,
                padding: '4px 10px',
                borderRadius: 999,
                border: `1px solid ${C.border}`,
                background: C.bgRaised,
              }}
            >
              Sample data
            </span>
          </div>
        </header>

        {/* ───── SCROLLABLE THREAD ───── */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 16px 16px',
          }}
        >
          <div style={{ maxWidth: 768, margin: '0 auto' }}>
            {empty && <EmptyState onPick={(s) => sendMessage(s)} />}

            {messages.map((m) => (
              <MessageBlock key={m.id} message={m} onFollowup={(q) => sendMessage(q)} />
            ))}

            {isThinking && <ThinkingBlock />}
          </div>
        </div>

        {/* ───── INPUT BAR (sticky bottom) ───── */}
        <div
          style={{
            flexShrink: 0,
            padding: '8px 16px 16px',
            background: `linear-gradient(180deg, rgba(33,33,33,0) 0%, ${C.bg} 35%)`,
          }}
        >
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            style={{ maxWidth: 768, margin: '0 auto' }}
          >
            <div
              className="lens-composer"
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'flex-end', gap: 8,
                padding: '10px 10px 10px 14px',
                background: C.bgRaised,
                border: `1px solid ${C.border}`,
                borderRadius: 24,
                boxShadow: '0 4px 24px -8px rgba(0,0,0,0.5)',
                transition: 'border-color 120ms',
              }}
            >
              <IconButton aria-label="Attach" title="Attach">
                <Paperclip size={18} />
              </IconButton>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Lens about your business…"
                rows={1}
                autoFocus
                style={{
                  flex: 1, minWidth: 0,
                  resize: 'none',
                  border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 15.5, lineHeight: 1.55, color: C.text,
                  fontFamily: FONT,
                  padding: '8px 0',
                  maxHeight: 200,
                }}
              />

              <IconButton aria-label="Voice input" title="Voice input">
                <Mic size={18} />
              </IconButton>

              <button
                type="submit"
                aria-label="Send"
                disabled={!input.trim() || isThinking}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: 'none', flexShrink: 0,
                  background: input.trim() && !isThinking ? C.text : '#4A4A4A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: input.trim() && !isThinking ? 'pointer' : 'not-allowed',
                  color: input.trim() && !isThinking ? C.bg : C.textMute,
                  transition: 'background 120ms',
                }}
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            </div>

            <p
              style={{
                margin: '10px 0 0',
                textAlign: 'center',
                fontSize: 12, color: C.textMute, lineHeight: 1.5,
              }}
            >
              Lens uses sample data in this preview. Sign in to ask against your live Delt account.
            </p>
          </form>
        </div>
      </main>

      {/* keyframes + scoped focus styles */}
      <style>{`
        @keyframes lensDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .lens-thinking-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${C.textSoft};
          animation: lensDot 1.2s ease-in-out infinite;
        }
        .lens-thinking-dot:nth-child(2) { animation-delay: 0.18s; }
        .lens-thinking-dot:nth-child(3) { animation-delay: 0.36s; }

        .lens-composer:focus-within {
          border-color: ${C.accent} !important;
          box-shadow: 0 0 0 3px ${C.accentSoft}, 0 4px 24px -8px rgba(0,0,0,0.5) !important;
        }

        /* Dark-themed scrollbar inside the chat */
        .lens-chat-scroll::-webkit-scrollbar { width: 10px; }
        .lens-chat-scroll::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 10px; }
        .lens-chat-scroll::-webkit-scrollbar-thumb:hover { background: #4A4A4A; }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ICON BUTTON — flat hover, monochrome, ChatGPT-style
   ───────────────────────────────────────────────────────────── */
function IconButton({
  children, onClick, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...rest}
      style={{
        width: 34, height: 34, borderRadius: 8,
        border: 'none', background: 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: C.textSoft, flexShrink: 0,
        transition: 'background 120ms, color 120ms',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = C.bgRaised; e.currentTarget.style.color = C.text; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textSoft; }}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   LENS MARK — custom premium avatar (camera-aperture / iris)
   Replaces the generic Sparkles glyph. Six iridescent iris blades
   rotated around a glowing inner pupil, set in a soft indigo halo.
   Reads as both "lens" (optical) and "AI" (luminous gradient orb).
   Sizes 22 (assistant message label) and 44 (empty-state hero).
   ───────────────────────────────────────────────────────────── */
function LensMark({
  size = 26,
  glow = true,
}: { size?: number; glow?: boolean }) {
  // Unique IDs so multiple <LensMark>s on a page don't collide on gradient ids.
  const id = useMemo(() => Math.random().toString(36).slice(2, 9), []);
  const blades = [0, 60, 120, 180, 240, 300];
  return (
    <div
      aria-hidden="true"
      style={{
        width: size, height: size, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        filter: glow ? `drop-shadow(0 4px 14px rgba(124,107,255,0.45))` : 'none',
      }}
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          {/* Outer body — deep indigo orb */}
          <radialGradient id={`lm-body-${id}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%"  stopColor="#A097FF" />
            <stop offset="45%" stopColor="#5A52E8" />
            <stop offset="100%" stopColor="#1B1857" />
          </radialGradient>
          {/* Iris blade gradient — violet to teal sweep for an iridescent feel */}
          <linearGradient id={`lm-blade-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#C9C2FF" stopOpacity="0.95" />
            <stop offset="55%"  stopColor="#7C6BFF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#3B2EB8" stopOpacity="0" />
          </linearGradient>
          {/* Bright pupil */}
          <radialGradient id={`lm-pupil-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="40%" stopColor="#E4DEFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#9C8FFF" stopOpacity="0" />
          </radialGradient>
          {/* Specular top highlight */}
          <radialGradient id={`lm-spec-${id}`} cx="38%" cy="22%" r="32%">
            <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer ring + body */}
        <circle cx="32" cy="32" r="30" fill={`url(#lm-body-${id})`} />
        <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

        {/* Iris blades — 6 elongated wedges rotated around the center */}
        <g transform="translate(32 32)">
          {blades.map((deg) => (
            <path
              key={deg}
              d="M 0 -22 L 8 -6 L 0 0 L -8 -6 Z"
              fill={`url(#lm-blade-${id})`}
              transform={`rotate(${deg})`}
              opacity="0.92"
            />
          ))}
        </g>

        {/* Inner pupil with bright core */}
        <circle cx="32" cy="32" r="8.5" fill="#0B0830" />
        <circle cx="32" cy="32" r="8.5" fill={`url(#lm-pupil-${id})`} />

        {/* Specular sheen */}
        <circle cx="32" cy="32" r="30" fill={`url(#lm-spec-${id})`} />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
   ───────────────────────────────────────────────────────────── */
function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 'clamp(40px, 10vh, 100px)' }}>
      <div style={{ display: 'inline-flex', marginBottom: 22 }}>
        <LensMark size={56} />
      </div>
      <h1
        style={{
          margin: 0,
          fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 'clamp(1.85rem, 4vw, 2.6rem)',
          fontWeight: 500, lineHeight: 1.1, color: C.text,
          letterSpacing: '0.005em',
        }}
      >
        What can I help you find?
      </h1>
      <p
        style={{
          margin: '12px auto 32px', maxWidth: 460,
          color: C.textSoft, fontSize: 15, lineHeight: 1.6,
        }}
      >
        Ask anything about your sales, customers, inventory, or payouts.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {SUGGESTIONS_EMPTY.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            style={{
              background: C.bgRaised, border: `1px solid ${C.border}`,
              borderRadius: 999, padding: '9px 16px',
              fontSize: 13, color: C.text, cursor: 'pointer',
              fontFamily: FONT, transition: 'all 120ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.accent;
              e.currentTarget.style.background = C.sidebarHov;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.background = C.bgRaised;
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MESSAGE BLOCK
     - user:      right-aligned soft bubble (Claude/Gemini style)
     - assistant: full-width flush-left with small Lens avatar
   ───────────────────────────────────────────────────────────── */
function MessageBlock({ message, onFollowup }: { message: Message; onFollowup: (q: string) => void }) {
  if (message.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <div
          style={{
            maxWidth: '80%',
            padding: '11px 16px',
            borderRadius: 18,
            background: C.bubble,
            border: `1px solid ${C.bubbleBd}`,
            color: C.text,
            fontSize: 15.5, lineHeight: 1.55,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  // assistant
  const r = message.reply;
  return (
    <div style={{ marginBottom: 36 }}>
      {/* Lens label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <LensMark size={26} />
        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>Lens</span>
      </div>

      {/* Body text */}
      <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: C.text }}>
        {message.content}
      </p>

      {/* Bullets */}
      {r?.bullets && r.bullets.length > 0 && (
        <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: C.textSoft, fontSize: 15, lineHeight: 1.75 }}>
          {r.bullets.map((b, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{b}</li>
          ))}
        </ul>
      )}

      {/* Table */}
      {r?.table && (
        <div
          style={{
            marginTop: 16,
            border: `1px solid ${C.border}`, borderRadius: 12,
            overflow: 'hidden', background: C.bgRaised,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.sidebar }}>
                {r.table.headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: i === 0 ? 'left' : 'right',
                      padding: '10px 14px',
                      fontSize: 11.5, fontWeight: 700, color: C.textSoft,
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.table.rows.map((row, ri) => (
                <tr key={ri} style={{ borderTop: ri === 0 ? 'none' : `1px solid ${C.borderSoft}` }}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: '10px 14px',
                        textAlign: ci === 0 ? 'left' : 'right',
                        color: ci === 0 ? C.text : C.textSoft,
                        fontWeight: ci === 0 ? 600 : 500,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', gap: 2, marginTop: 12 }}>
        <IconAction icon={<Copy size={14} />} label="Copy" onClick={() => navigator.clipboard?.writeText(message.content)} />
        <IconAction icon={<RefreshCcw size={14} />} label="Regenerate" onClick={() => onFollowup(message.reply?.followups?.[0] ?? '')} />
        <IconAction icon={<ThumbsUp size={14} />} label="Good" />
        <IconAction icon={<ThumbsDown size={14} />} label="Bad" />
      </div>

      {/* Followups */}
      {r?.followups && r.followups.length > 0 && (
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${C.borderSoft}` }}>
          <p
            style={{
              margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: C.textMute,
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}
          >
            Related
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {r.followups.map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onFollowup(f)}
                style={{
                  textAlign: 'left',
                  padding: '11px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${C.borderSoft}`,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: C.text, fontSize: 14.5, fontFamily: FONT, fontWeight: 500,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'color 120ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.text; }}
              >
                <span>{f}</span>
                <span style={{ color: C.textMute, fontSize: 18, lineHeight: 1 }}>+</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ICON ACTION BUTTON (under assistant messages)
   ───────────────────────────────────────────────────────────── */
function IconAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 8px', borderRadius: 6,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: C.textMute,
        transition: 'background 120ms, color 120ms',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = C.bgRaised; e.currentTarget.style.color = C.text; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textMute; }}
    >
      {icon}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   THINKING (typing indicator)
   ───────────────────────────────────────────────────────────── */
function ThinkingBlock() {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <LensMark size={26} />
        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>Lens</span>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
        <span className="lens-thinking-dot" />
        <span className="lens-thinking-dot" />
        <span className="lens-thinking-dot" />
      </div>
    </div>
  );
}
