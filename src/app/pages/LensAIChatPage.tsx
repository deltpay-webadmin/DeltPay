import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { ArrowUp, Plus, Mic, Sparkles, ChevronLeft, Copy, RefreshCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import deltLogoImg from '@/assets/delt-logo-on-light.svg';

/* ─────────────────────────────────────────────────────────────
   PALETTE — matches LensAIPage
   ───────────────────────────────────────────────────────────── */
const C = {
  white:  '#FFFFFF',
  navy:   '#041E42',
  purple: '#4945FF',
  body:   '#475569',
  muted:  '#94A3B8',
  grayBg: '#F6F7FB',
  line:   '#E2E8F0',
  faintPurple: 'rgba(73,69,255,0.06)',
};

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

/* ─────────────────────────────────────────────────────────────
   REPLY ENGINE — keyword matching with hardcoded sample data
   ───────────────────────────────────────────────────────────── */
type Reply = {
  text: string;
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
  followups?: string[];
};

function getLensReply(question: string): Reply {
  const q = question.toLowerCase().trim();

  // Greetings
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

  // What is Lens
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

  // Top products
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

  // Promos / when to run
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

  // Slow days / why slow
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

  // Tips down
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

  // Top customers
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

  // Slowest hour
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

  // Cashflow / deposits
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

  // Capital / loan
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

  // Pricing / fees
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

  // Reorder / inventory
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

  // Default fallback — echoes question, sets expectation, suggests prompts
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
   MESSAGE TYPE
   ───────────────────────────────────────────────────────────── */
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reply?: Reply;
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
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
      // strip ?q= from URL after consuming it so refresh doesn't re-fire
      setSearchParams({}, { replace: true });
      sendMessage(initialQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  const empty = messages.length === 0 && !isThinking;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        background: C.white, fontFamily: FONT, color: C.navy,
      }}
    >
      {/* ───── TOP BAR ───── */}
      <header
        style={{
          flexShrink: 0,
          height: 60,
          padding: '0 clamp(16px, 3vw, 32px)',
          borderBottom: `1px solid ${C.line}`,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            onClick={() => navigate('/lens-ai')}
            aria-label="Back to Lens"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 10px', borderRadius: 8,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: C.body, fontSize: 14, fontWeight: 500, fontFamily: FONT,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(4,30,66,0.05)'; e.currentTarget.style.color = C.navy; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.body; }}
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <div style={{ width: 1, height: 24, background: C.line }} />

          <Link to="/lens-ai" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 30, fontWeight: 500, lineHeight: 1,
                background: `linear-gradient(135deg, ${C.purple} 0%, ${C.navy} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.005em',
                paddingRight: '0.06em',
              }}
            >
              Lens
            </span>
            <span style={{ color: C.muted, fontSize: 13, fontWeight: 500 }}>by</span>
            <img src={deltLogoImg} alt="Delt" style={{ height: 12, width: 'auto', objectFit: 'contain', transform: 'translateY(1px)' }} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => { setMessages([]); setInput(''); }}
          style={{
            padding: '8px 14px', borderRadius: 8,
            background: 'transparent', border: `1px solid ${C.line}`, cursor: 'pointer',
            color: C.body, fontSize: 13, fontWeight: 600, fontFamily: FONT,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'background 0.15s, border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.color = C.navy; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.color = C.body; }}
        >
          <Sparkles size={14} />
          New chat
        </button>
      </header>

      {/* ───── SCROLLABLE THREAD ───── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 32px) 24px',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {empty && (
            <EmptyState onPick={(s) => sendMessage(s)} />
          )}

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
          padding: '12px clamp(16px, 4vw, 32px) clamp(16px, 3vw, 24px)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 30%)',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ maxWidth: 760, margin: '0 auto' }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 10px 10px 14px',
              background: C.white,
              border: `1.5px solid ${C.line}`,
              borderRadius: 18,
              boxShadow: '0 8px 28px -8px rgba(4,30,66,0.12), 0 2px 6px rgba(4,30,66,0.04)',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = C.purple; }}
            onBlur={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = C.line; }}
          >
            <button
              type="button"
              aria-label="Add context"
              style={{
                width: 34, height: 34, borderRadius: 10,
                border: 'none', background: 'transparent', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#64748B',
              }}
            >
              <Plus size={18} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Lens about your business…"
              autoFocus
              style={{
                flex: 1, minWidth: 0,
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: 16, lineHeight: 1.5, color: C.navy,
                fontFamily: FONT, padding: '6px 0',
              }}
            />

            <button
              type="button"
              aria-label="Voice input"
              style={{
                width: 34, height: 34, borderRadius: '50%',
                border: 'none', background: 'transparent', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#64748B',
              }}
            >
              <Mic size={17} />
            </button>

            <button
              type="submit"
              aria-label="Send"
              disabled={!input.trim() || isThinking}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                border: 'none', flexShrink: 0,
                background: input.trim() && !isThinking ? C.purple : '#CBD5E1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !isThinking ? 'pointer' : 'not-allowed',
                color: C.white,
                transition: 'background 0.15s',
              }}
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          </div>

          <p
            style={{
              margin: '10px 0 0',
              textAlign: 'center',
              fontSize: 12, color: C.muted, lineHeight: 1.5,
            }}
          >
            Lens uses sample data in this preview. Sign in to ask against your live Delt account.
          </p>
        </form>
      </div>

      {/* dot animation keyframes */}
      <style>{`
        @keyframes lensDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .lens-thinking-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${C.purple};
          animation: lensDot 1.2s ease-in-out infinite;
        }
        .lens-thinking-dot:nth-child(2) { animation-delay: 0.18s; }
        .lens-thinking-dot:nth-child(3) { animation-delay: 0.36s; }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
   ───────────────────────────────────────────────────────────── */
function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 'clamp(40px, 8vh, 80px)' }}>
      <div
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 60, height: 60, borderRadius: 18,
          background: `linear-gradient(135deg, ${C.purple} 0%, ${C.navy} 100%)`,
          color: C.white, marginBottom: 24,
          boxShadow: '0 12px 30px -8px rgba(73,69,255,0.5)',
        }}
      >
        <Sparkles size={26} strokeWidth={1.8} />
      </div>
      <h1
        style={{
          margin: 0,
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(2rem, 4.5vw, 3rem)',
          fontWeight: 500, lineHeight: 1.05, color: C.navy,
          letterSpacing: '0.005em',
        }}
      >
        What can I help you find?
      </h1>
      <p style={{ margin: '14px auto 36px', maxWidth: 480, color: C.body, fontSize: 16, lineHeight: 1.6 }}>
        Ask Lens anything about your sales, customers, inventory, or payouts. Try one of these to start:
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {SUGGESTIONS_EMPTY.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            style={{
              background: C.white, border: `1.5px solid ${C.line}`,
              borderRadius: 999, padding: '9px 16px',
              fontSize: 13, color: C.body, cursor: 'pointer',
              fontFamily: FONT, transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.purple;
              e.currentTarget.style.color = C.navy;
              e.currentTarget.style.background = C.faintPurple;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.line;
              e.currentTarget.style.color = C.body;
              e.currentTarget.style.background = C.white;
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
   ───────────────────────────────────────────────────────────── */
function MessageBlock({ message, onFollowup }: { message: Message; onFollowup: (q: string) => void }) {
  if (message.role === 'user') {
    return (
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(1.25rem, 2.4vw, 1.6rem)',
            fontWeight: 700, lineHeight: 1.3,
            color: C.navy, letterSpacing: '-0.01em',
          }}
        >
          {message.content}
        </h2>
      </div>
    );
  }

  // assistant
  const r = message.reply;
  return (
    <div style={{ marginBottom: 40 }}>
      {/* Lens label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div
          style={{
            width: 22, height: 22, borderRadius: 7,
            background: `linear-gradient(135deg, ${C.purple} 0%, ${C.navy} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.white, flexShrink: 0,
          }}
        >
          <Sparkles size={12} strokeWidth={2} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Lens</span>
      </div>

      {/* Body text */}
      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: C.navy }}>
        {message.content}
      </p>

      {/* Bullets */}
      {r?.bullets && r.bullets.length > 0 && (
        <ul style={{ margin: '14px 0 0', paddingLeft: 18, color: C.body, fontSize: 15, lineHeight: 1.75 }}>
          {r.bullets.map((b, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{b}</li>
          ))}
        </ul>
      )}

      {/* Table */}
      {r?.table && (
        <div
          style={{
            marginTop: 18,
            border: `1px solid ${C.line}`, borderRadius: 12,
            overflow: 'hidden', background: C.white,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.grayBg }}>
                {r.table.headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: i === 0 ? 'left' : 'right',
                      padding: '10px 14px',
                      fontSize: 12, fontWeight: 700, color: C.body,
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                      borderBottom: `1px solid ${C.line}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.table.rows.map((row, ri) => (
                <tr key={ri} style={{ borderTop: ri === 0 ? 'none' : `1px solid ${C.line}` }}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: '10px 14px',
                        textAlign: ci === 0 ? 'left' : 'right',
                        color: ci === 0 ? C.navy : C.body,
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
      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        <IconAction icon={<Copy size={14} />} label="Copy" onClick={() => navigator.clipboard?.writeText(message.content)} />
        <IconAction icon={<RefreshCcw size={14} />} label="Regenerate" onClick={() => onFollowup(message.reply?.followups?.[0] ?? '')} />
        <IconAction icon={<ThumbsUp size={14} />} label="Good" />
        <IconAction icon={<ThumbsDown size={14} />} label="Bad" />
      </div>

      {/* Followups */}
      {r?.followups && r.followups.length > 0 && (
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${C.line}` }}>
          <p
            style={{
              margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: C.muted,
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
                  padding: '12px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${C.line}`,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: C.navy, fontSize: 15, fontFamily: FONT, fontWeight: 500,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.purple; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.navy; }}
              >
                <span>{f}</span>
                <span style={{ color: C.muted, fontSize: 18, lineHeight: 1 }}>+</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ICON ACTION BUTTON
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
        padding: '6px 10px', borderRadius: 8,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: C.muted,
        transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(4,30,66,0.05)'; e.currentTarget.style.color = C.navy; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}
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
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div
          style={{
            width: 22, height: 22, borderRadius: 7,
            background: `linear-gradient(135deg, ${C.purple} 0%, ${C.navy} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.white, flexShrink: 0,
          }}
        >
          <Sparkles size={12} strokeWidth={2} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Lens</span>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
        <span className="lens-thinking-dot" />
        <span className="lens-thinking-dot" />
        <span className="lens-thinking-dot" />
      </div>
    </div>
  );
}
