import { CreditCard, Wallet, DollarSign, Globe, Sparkles, ShieldCheck, Search, ArrowRight, MessageCircle, Activity } from 'lucide-react';

/* ─── Palette ────────────────────────────────────────── */
const NAVY   = '#041E42';
const PURPLE = '#4945FF';
const WHITE  = '#FFFFFF';
const BG     = '#F6F7FB';

/* ─── Data ───────────────────────────────────────────── */
const CATEGORIES = [
  {
    icon: CreditCard,
    title: 'Payments',
    subtitle: 'Accepting payments, processing rates, refunds',
    count: 12,
  },
  {
    icon: Wallet,
    title: 'Payouts',
    subtitle: 'When money lands, holds, your bank account',
    count: 9,
  },
  {
    icon: DollarSign,
    title: 'Capital',
    subtitle: 'Business funding, repayment, who qualifies',
    count: 8,
  },
  {
    icon: Globe,
    title: 'Websites',
    subtitle: 'Builder, domains, SEO',
    count: 14,
  },
  {
    icon: Sparkles,
    title: 'Lens AI',
    subtitle: 'Your AI business advisor — questions & answers',
    count: 11,
  },
  {
    icon: ShieldCheck,
    title: 'Account & security',
    subtitle: 'Account access, staff logins, permissions',
    count: 10,
  },
];

const POPULAR_TAGS = ['Payouts', 'Refunds', 'Chargebacks', 'Tax', 'API keys'];

const POPULAR_ARTICLES = [
  {
    title: 'How payouts are scheduled',
    snippet: 'Learn how Delt calculates your deposit date and what can affect when money arrives.',
  },
  {
    title: 'Disputing a chargeback',
    snippet: 'Step-by-step guide to fighting a chargeback and submitting evidence through your dashboard.',
  },
  {
    title: 'Adding a team member',
    snippet: 'Add staff to your account, set what they can see, and manage logins.',
  },
  {
    title: 'Connecting your Square data on migration',
    snippet: 'How to import your historical Square transactions, customers, and catalog into Delt.',
  },
  {
    title: 'Refunding a customer',
    snippet: 'Give a customer their money back — full or partial — right from the payment record.',
  },
  {
    title: 'Resetting your admin password',
    snippet: "Regain access via email, SMS, or a backup passkey if you're locked out.",
  },
];

/* ─── Sub-components ─────────────────────────────────── */
function CategoryCard({
  icon: Icon,
  title,
  subtitle,
  count,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <div
      className="group rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-200 cursor-pointer"
      style={{ background: WHITE, borderColor: `${NAVY}1A` }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${PURPLE}66`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${PURPLE}14`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${NAVY}1A`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${PURPLE}15` }}
      >
        <Icon size={20} style={{ color: PURPLE }} />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm mb-0.5 tracking-tight" style={{ color: NAVY }}>
          {title}
        </p>
        <p className="text-xs text-[#475569]">{subtitle}</p>
      </div>
      <p className="text-xs text-[#94A3B8]">{count} articles</p>
    </div>
  );
}

function ArticleRow({ title, snippet }: { title: string; snippet: string }) {
  return (
    <div
      className="group rounded-2xl border p-5 flex flex-col gap-2 transition-all duration-200 cursor-pointer"
      style={{ background: WHITE, borderColor: `${NAVY}1A` }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${PURPLE}66`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${PURPLE}14`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${NAVY}1A`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <p className="text-sm font-semibold tracking-tight" style={{ color: NAVY }}>{title}</p>
      <p className="text-xs text-[#475569] leading-relaxed flex-1">{snippet}</p>
      <a
        href="#"
        className="inline-flex items-center gap-1 text-xs font-semibold transition-colors"
        style={{ color: PURPLE }}
      >
        Read <ArrowRight size={11} />
      </a>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export function HelpCenterPage() {
  return (
    <div
      style={{ background: WHITE, color: NAVY, fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* ══ HERO / SEARCH ══════════════════════════════════════ */}
      <section
        className="relative overflow-hidden pt-28 pb-20 px-6"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -5%, ${PURPLE}22 0%, transparent 68%), ${WHITE}`,
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: PURPLE }}>
            Help Center
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight mb-8"
            style={{ color: NAVY, lineHeight: 1.08 }}
          >
            Pick a topic below
          </h1>

          {/* Search bar */}
          <div
            className="rounded-3xl border flex items-center gap-3 px-5 py-4 mb-6 transition-all focus-within:ring-2"
            style={{ background: WHITE, borderColor: `${NAVY}1A`, boxShadow: '0 2px 12px rgba(4,30,66,.07)' }}
          >
            <Search size={18} style={{ color: '#94A3B8', flexShrink: 0 }} />
            <input
              type="search"
              placeholder="Search for help…"
              className="text-sm flex-1 outline-none bg-transparent"
              style={{ color: NAVY, fontFamily: 'system-ui, -apple-system, sans-serif' }}
            />
          </div>

          {/* Popular pills */}
          <div className="flex items-center justify-center flex-wrap gap-2">
            <span className="text-xs text-[#94A3B8]">Popular:</span>
            {POPULAR_TAGS.map(tag => (
              <a
                key={tag}
                href="#"
                className="inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium transition-all"
                style={{
                  borderColor: `${NAVY}20`,
                  color: '#475569',
                  background: WHITE,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = `${PURPLE}66`;
                  (e.currentTarget as HTMLAnchorElement).style.color = PURPLE;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = `${NAVY}20`;
                  (e.currentTarget as HTMLAnchorElement).style.color = '#475569';
                }}
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CATEGORY CARDS ═════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: PURPLE }}>
            Browse by topic
          </p>
          <h2 className="text-2xl font-bold tracking-tight mb-10" style={{ color: NAVY }}>
            What do you need help with?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map(cat => (
              <CategoryCard key={cat.title} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ POPULAR ARTICLES ═══════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: BG }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: PURPLE }}>
            Top reads
          </p>
          <h2 className="text-2xl font-bold tracking-tight mb-10" style={{ color: NAVY }}>
            Commonly needed guides
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_ARTICLES.map(a => (
              <ArticleRow key={a.title} {...a} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ STILL NEED HELP ════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: PURPLE }}>
            Need more?
          </p>
          <h2 className="text-2xl font-bold tracking-tight mb-10" style={{ color: NAVY }}>
            Didn't find the answer?
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {/* Talk to a human */}
            <div
              className="rounded-2xl border p-8 flex flex-col gap-4 transition-all duration-200"
              style={{ background: WHITE, borderColor: `${NAVY}1A` }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${PURPLE}66`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${PURPLE}14`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${NAVY}1A`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${PURPLE}15` }}
              >
                <MessageCircle size={20} style={{ color: PURPLE }} />
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: NAVY }}>Talk to a human</p>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Mon–Fri 8am–8pm ET, Sat 9am–5pm ET. Average response under 2 minutes during business hours. Outside these hours, leave a message and we'll reply the next business day.
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all self-start"
                style={{ background: PURPLE, color: WHITE }}
              >
                Start a chat <ArrowRight size={14} />
              </button>
            </div>

            {/* Email support */}
            <div
              className="rounded-2xl border p-8 flex flex-col gap-4 transition-all duration-200"
              style={{ background: WHITE, borderColor: `${NAVY}1A` }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${PURPLE}66`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${PURPLE}14`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${NAVY}1A`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${PURPLE}15` }}
              >
                <Activity size={20} style={{ color: PURPLE }} />
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: NAVY }}>Email support</p>
                <p className="text-sm text-[#475569] leading-relaxed">
                  For questions about chargebacks, funding, or account setup — email us and a specialist will reply within one business day.
                </p>
              </div>
              <a
                href="mailto:support@delt.co"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all self-start"
                style={{ background: `${NAVY}0F`, color: NAVY }}
              >
                support@delt.co <ArrowRight size={14} />
              </a>
            </div>

            {/* Status */}
            <div
              className="rounded-2xl border p-8 flex flex-col gap-4 transition-all duration-200"
              style={{ background: WHITE, borderColor: `${NAVY}1A` }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${PURPLE}66`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${PURPLE}14`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${NAVY}1A`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${NAVY}0F` }}
              >
                <Activity size={20} style={{ color: NAVY }} />
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: NAVY }}>System status</p>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: '#16c784' }}
                  />
                  <span className="text-sm font-medium" style={{ color: '#0e7a49' }}>
                    All systems operational
                  </span>
                </div>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Payments, Payouts, Capital, Websites, and Lens AI are all running normally.
                </p>
              </div>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors self-start"
                style={{ color: PURPLE }}
              >
                View status page <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
