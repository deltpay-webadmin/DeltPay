import React, { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Eye,
  Phone,
  DollarSign,
  Users,
  Target,
  ArrowUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Tab = 'dashboard' | 'ask';

// ── Health Score Ring ──
function HealthRing({ score, size = 100 }: { score: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#34C77B' : score >= 50 ? '#F0B429' : '#F2565B';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 tabular-nums">{score}</span>
        <span className="text-[10px] text-gray-500 -mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ── Data ──
type AlertSeverity = 'critical' | 'warning' | 'info';
interface LensAlert {
  severity: AlertSeverity;
  title: string;
  desc: string;
  actions: string[];
}

const alerts: LensAlert[] = [];

const sevConfig = {
  critical: { bg: 'bg-red-50 border-red-200', iconBg: 'bg-red-100', icon: 'text-red-500', badge: 'bg-red-500 text-white' },
  warning: { bg: 'bg-amber-50 border-amber-200', iconBg: 'bg-amber-100', icon: 'text-amber-500', badge: 'bg-amber-500 text-white' },
  info: { bg: 'bg-indigo-50/60 border-indigo-200', iconBg: 'bg-indigo-100', icon: 'text-indigo-600', badge: 'bg-indigo-500 text-white' },
};

interface FlowCastPoint {
  month: string;
  projected: number;
  low: number;
  high: number;
  actual: number | null;
}

const flowCastData: FlowCastPoint[] = [];

const chartData: FlowCastPoint[] = [...flowCastData];

const suggestedPrompts = [
  { icon: Users, text: 'Which agents have the highest default rate over $50K?' },
  { icon: DollarSign, text: 'Projected cash position in 90 days?' },
  { icon: Phone, text: 'Merchants with declining volume not contacted 30 days.' },
  { icon: Target, text: 'What is our most profitable deal type this quarter?' },
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  table?: { headers: string[]; rows: string[][] };
  source?: string;
}

export function BackendLensAI() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const handleSend = (text?: string) => {
    const msg = text || chatInput.trim();
    if (!msg) return;
    const userMsg: ChatMessage = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
  };

  if (tab === 'ask') {
    return (
      <AskLens
        messages={messages}
        thinking={thinking}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleSend={handleSend}
        chatEndRef={chatEndRef}
        onBack={() => setTab('dashboard')}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1360px] mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-gray-500">Predictive intelligence for your portfolio</p>
          <TabSwitch tab={tab} setTab={setTab} />
        </div>
        <DashboardTab />
      </div>
    </div>
  );
}

function TabSwitch({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="flex rounded-[10px] border border-(--dp-border) p-0.5">
      <button
        onClick={() => setTab('dashboard')}
        className={`px-4 py-1.5 text-[13px] font-semibold rounded-[8px] transition-all ${
          tab === 'dashboard'
            ? 'bg-(--dp-accent-soft) text-(--dp-accent-text)'
            : 'text-(--dp-text-muted) hover:text-(--dp-text)'
        }`}
      >
        Dashboard
      </button>
      <button
        onClick={() => setTab('ask')}
        className={`px-4 py-1.5 text-[13px] font-semibold rounded-[8px] transition-all flex items-center gap-1.5 ${
          tab === 'ask'
            ? 'bg-(--dp-accent-soft) text-(--dp-accent-text)'
            : 'text-(--dp-text-muted) hover:text-(--dp-text)'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        Ask Lens
      </button>
    </div>
  );
}

// ════════════════════════════════════════
// Dashboard Tab
// ════════════════════════════════════════
function DashboardTab() {
  return (
    <div className="space-y-6">
      {/* Portfolio Health Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score */}
        <div className="bg-white rounded-[8px] border border-gray-200 p-5 flex flex-col items-center">
          <HealthRing score={0} size={96} />
          <p className="text-sm font-semibold text-gray-900 mt-3">Portfolio Health</p>
          <p className="text-xs text-gray-500">No portfolio data yet</p>
        </div>

        {/* Predicted Collections */}
        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">—</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">$0</p>
          <p className="text-sm text-gray-500 mt-1">Predicted Collections</p>
          <p className="text-xs text-gray-400 mt-0.5">Next 30 days</p>
        </div>

        {/* At-Risk Deals */}
        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">—</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">0</p>
          <p className="text-sm text-gray-500 mt-1">At-Risk Deals</p>
          <p className="text-xs text-gray-400 mt-0.5">$0 total exposure</p>
        </div>

        {/* Renewal Opportunities */}
        <div className="bg-white rounded-[8px] border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">—</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">0</p>
          <p className="text-sm text-gray-500 mt-1">Renewal Opportunities</p>
          <p className="text-xs text-gray-400 mt-0.5">&gt;50% repaid</p>
        </div>
      </div>

      {/* Alerts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Intelligent Alerts</h2>
          <span className="text-xs text-gray-500">{alerts.length} active</span>
        </div>
        {alerts.length === 0 && (
          <div className="bg-white rounded-[8px] border border-gray-200 py-12 text-center">
            <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">No insights yet</p>
            <p className="text-xs text-gray-400 mt-1">Lens will surface alerts here as it analyzes your portfolio.</p>
          </div>
        )}
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const sev = sevConfig[alert.severity];
            return (
              <div key={i} className={`${sev.bg} border rounded-[8px] p-4 sm:p-5 transition-all hover:shadow-sm`}>
                <div className="flex gap-4">
                  <div className={`w-9 h-9 ${sev.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {alert.severity === 'critical' ? (
                      <Zap className={`w-5 h-5 ${sev.icon}`} />
                    ) : alert.severity === 'warning' ? (
                      <AlertTriangle className={`w-5 h-5 ${sev.icon}`} />
                    ) : (
                      <Sparkles className={`w-5 h-5 ${sev.icon}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded ${sev.badge}`}>
                        {alert.severity}
                      </span>
                      <h3 className="text-sm font-semibold text-gray-900">{alert.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{alert.desc}</p>
                    <div className="flex items-center gap-2">
                      {alert.actions.map((action, j) => (
                        <button
                          key={j}
                          className={`px-3 py-1.5 text-xs font-medium rounded-[6px] transition-colors ${
                            j === 0
                              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FlowCast Chart */}
      <div className="bg-white rounded-[8px] border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">FlowCast</h2>
            <p className="text-xs text-gray-500">Projected collections — 6 month outlook with confidence bands</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-indigo-600 rounded" />
              <span className="text-gray-600">Projected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-indigo-100 rounded-sm border border-indigo-200" />
              <span className="text-gray-600">Confidence Band</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-gray-600">Actuals</span>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          {chartData.length === 0 ? (
            <div className="py-12 text-center">
              <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">No forecast data yet</p>
              <p className="text-xs text-gray-400 mt-1">Projections will appear once collections data is available.</p>
            </div>
          ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E6BFF" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2E6BFF" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E6BFF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2E6BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#98A6C2' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#98A6C2' }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  domain={[80000, 'auto']}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#20305A', border: '1px solid #435687', borderRadius: '8px', fontSize: '13px' }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = { projected: 'Projected', high: 'High', low: 'Low', actual: 'Actual' };
                    return [`$${value.toLocaleString()}`, labels[name] || name];
                  }}
                />
                {/* Confidence band */}
                <Area key="area-high" type="monotone" dataKey="high" stroke="none" fill="url(#bandGrad)" stackId="band" />
                <Area key="area-low" type="monotone" dataKey="low" stroke="none" fill="transparent" stackId="band-low" />
                {/* Projected line */}
                <Area key="area-projected" type="monotone" dataKey="projected" stroke="#2E6BFF" strokeWidth={2.5} fill="url(#projGrad)" />
                {/* Actuals */}
                <Area key="area-actual" type="monotone" dataKey="actual" stroke="#34C77B" strokeWidth={2.5} fill="none" dot={(props: any) => {
                  if (props.payload?.actual == null) return null;
                  return <circle key={`dot-actual-${props.cx}-${props.cy}`} cx={props.cx} cy={props.cy} r={4} fill="#34C77B" stroke="#172341" strokeWidth={2} />;
                }} connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// Ask Lens — conversational surface
// ════════════════════════════════════════
function Composer({
  chatInput,
  setChatInput,
  handleSend,
  autoFocus,
}: {
  chatInput: string;
  setChatInput: (v: string) => void;
  handleSend: () => void;
  autoFocus?: boolean;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow up to ~6 lines
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 152)}px`;
  }, [chatInput]);

  return (
    <div className="rounded-[20px] bg-(--dp-bg-card) border border-(--dp-border) focus-within:border-(--dp-accent) focus-within:shadow-[0_0_0_3px_var(--dp-accent-soft)] transition-shadow">
      <textarea
        ref={taRef}
        rows={1}
        autoFocus={autoFocus}
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Ask Lens about your portfolio…"
        className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[15px] leading-relaxed text-(--dp-text) placeholder:text-(--dp-text-faint) outline-none"
      />
      <div className="flex items-center justify-between px-3 pb-3 pl-5">
        <span className="text-[11px] text-(--dp-text-faint)">
          Enter to send · Shift+Enter for a new line
        </span>
        <button
          onClick={handleSend}
          disabled={!chatInput.trim()}
          aria-label="Send"
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            chatInput.trim()
              ? 'bg-(--dp-accent) hover:bg-(--dp-accent-hover) text-white'
              : 'bg-white/[0.06] text-(--dp-text-faint)'
          }`}
        >
          <ArrowUp className="w-4.5 h-4.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function LensAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-(--dp-accent-soft) border border-(--dp-border) flex items-center justify-center shrink-0">
      <Sparkles className="w-3.5 h-3.5 text-(--dp-accent-text)" />
    </div>
  );
}

function AskLens({
  messages,
  thinking,
  chatInput,
  setChatInput,
  handleSend,
  chatEndRef,
  onBack,
}: {
  messages: ChatMessage[];
  thinking: boolean;
  chatInput: string;
  setChatInput: (v: string) => void;
  handleSend: (text?: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
}) {
  const empty = messages.length === 0;

  return (
    <div className="h-full flex flex-col">
      {/* Slim header — just the mode switch */}
      <div className="shrink-0 flex items-center justify-between px-4 lg:px-8 pt-4">
        <p className="text-[13px] text-(--dp-text-muted)">Predictive intelligence for your portfolio</p>
        <div className="flex rounded-[10px] border border-(--dp-border) p-0.5">
          <button
            onClick={onBack}
            className="px-4 py-1.5 text-[13px] font-semibold rounded-[8px] text-(--dp-text-muted) hover:text-(--dp-text) transition-all"
          >
            Dashboard
          </button>
          <button className="px-4 py-1.5 text-[13px] font-semibold rounded-[8px] bg-(--dp-accent-soft) text-(--dp-accent-text) flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Ask Lens
          </button>
        </div>
      </div>

      {empty ? (
        /* ── Home state: greeting + centered composer + suggestions ── */
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-[720px] -mt-10">
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 rounded-[14px] bg-(--dp-accent-soft) border border-(--dp-border) flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6 text-(--dp-accent-text)" />
              </div>
              <h2 className="text-[30px] font-bold text-(--dp-text) tracking-[-0.02em]">
                What can Lens find for you?
              </h2>
              <p className="mt-2 text-[14px] text-(--dp-text-muted)">
                Ask about deals, merchants, agents, or projections — in plain language.
              </p>
            </div>

            <Composer chatInput={chatInput} setChatInput={setChatInput} handleSend={() => handleSend()} autoFocus />

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suggestedPrompts.map((prompt, i) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt.text)}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-[14px] border border-(--dp-border) text-left text-[13px] text-(--dp-text-secondary) hover:border-(--dp-border-strong) hover:bg-white/[0.03] transition-colors"
                  >
                    <Icon className="w-4 h-4 shrink-0 text-(--dp-accent-text)" />
                    {prompt.text}
                  </button>
                );
              })}
            </div>

            <p className="mt-6 text-center text-[11px] text-(--dp-text-faint)">
              Lens analyzes your live portfolio data. Responses are generated insights, not financial advice.
            </p>
          </div>
        </div>
      ) : (
        /* ── Conversation state ── */
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[760px] mx-auto px-4 py-8 space-y-7">
              {messages.map((msg, i) =>
                msg.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[80%] rounded-[18px] rounded-br-[6px] bg-(--dp-bg-raised) border border-(--dp-border) px-4 py-2.5 text-[14px] leading-relaxed text-(--dp-text)">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex gap-3">
                    <LensAvatar />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[14.5px] leading-[1.7] text-(--dp-text-secondary) whitespace-pre-wrap">
                        {msg.content.split('**').map((part, j) =>
                          j % 2 === 1 ? (
                            <span key={j} className="font-bold text-(--dp-text)">{part}</span>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </p>
                      {msg.table && (
                        <div className="mt-4 overflow-x-auto rounded-[12px] border border-(--dp-border)">
                          <table className="w-full text-[12.5px]">
                            <thead>
                              <tr className="border-b border-(--dp-border)">
                                {msg.table.headers.map((h, j) => (
                                  <th key={j} className={`px-3.5 py-2.5 ${j === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {msg.table.rows.map((row, j) => (
                                <tr key={j} className={j < msg.table!.rows.length - 1 ? 'border-b border-(--dp-border)' : ''}>
                                  {row.map((cell, k) => (
                                    <td
                                      key={k}
                                      className={`px-3.5 py-2.5 whitespace-nowrap tabular-nums ${
                                        k === 0 ? 'text-left font-semibold text-(--dp-text)' : 'text-right text-(--dp-text-secondary)'
                                      }`}
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
                      {msg.source && (
                        <p className="mt-3 text-[11.5px] text-(--dp-text-faint) flex items-center gap-1.5">
                          <Eye className="w-3 h-3" />
                          {msg.source}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}

              {thinking && (
                <div className="flex gap-3 items-center">
                  <LensAvatar />
                  <div className="flex items-center gap-1 pt-0.5">
                    {[0, 1, 2].map(d => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-(--dp-text-faint) animate-bounce"
                        style={{ animationDelay: `${d * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Pinned composer */}
          <div className="shrink-0 px-4 pb-5">
            <div className="max-w-[760px] mx-auto">
              <Composer chatInput={chatInput} setChatInput={setChatInput} handleSend={() => handleSend()} />
              <p className="mt-2 text-center text-[11px] text-(--dp-text-faint)">
                Lens analyzes your live portfolio data. Responses are generated insights, not financial advice.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
