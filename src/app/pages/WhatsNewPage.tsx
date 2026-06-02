import { useState, useMemo } from 'react';
import { Rss, ArrowRight, ChevronRight, Sparkles, Shield, FileCheck, Package } from 'lucide-react';

/* ─── Palette ────────────────────────────────────────── */
const NAVY      = '#041E42';
const NAVY_DEEP = '#020E22';
const PURPLE    = '#4945FF';
const PURPLE_HI = '#6D68FF';
const WHITE     = '#FFFFFF';
const INK       = '#0F172A';
const MUTED     = '#475569';
const HAIRLINE  = 'rgba(4,30,66,0.08)';

/* ─── Data ───────────────────────────────────────────── */
type Tag = 'All' | 'Product' | 'Security' | 'Compliance';

interface ChangelogItem {
  date: string;
  monthLabel: string;    // e.g. 'April 2026'
  tag: Exclude<Tag, 'All'>;
  version?: string;
  title: string;
  description: string;
  highlight?: boolean;
}

const ITEMS: ChangelogItem[] = [
  {
    date: 'May 06, 2026',
    monthLabel: 'May 2026',
    tag: 'Product',
    title: 'Lens — ask your business anything, in plain English.',
    description:
      'Lens, our in-product AI, is now live for every Delt merchant. Ask things like "Why were Tuesdays slow last month?" or "Which products had the lowest margin?" and get a real answer in seconds — grounded in your live Payments, Capital, and POS data.',
    highlight: true,
  },
  {
    date: 'Apr 28, 2026',
    monthLabel: 'April 2026',
    tag: 'Product',
    title: '0% Cash Discount program — turn on in one click.',
    description:
      'Eligible merchants can now enable the 0% Cash Discount program directly from the dashboard. A compliant service fee is added at checkout for card payments, cash-paying customers receive the discount, and your effective processing cost drops to zero. Receipts and signage update automatically.',
  },
  {
    date: 'Apr 21, 2026',
    monthLabel: 'April 2026',
    tag: 'Product',
    title: 'Same-day international payments — powered by USDT.',
    description:
      'Send money to suppliers and contractors in 40+ countries the same business day. We handle the on/off-ramp, FX, and compliance — you see a single USD-denominated transaction. Available on the International Payments page.',
  },
  {
    date: 'Apr 14, 2026',
    monthLabel: 'April 2026',
    tag: 'Product',
    title: 'Capital — pre-qualified offers on the home dashboard.',
    description:
      'Merchants processing $2k+/month now see their pre-qualified Capital offer on the dashboard home, with a one-click path to apply. Offers refresh nightly based on processing volume and deposit history — no hard credit pull to view.',
  },
  {
    date: 'Apr 07, 2026',
    monthLabel: 'April 2026',
    tag: 'Product',
    title: 'Chargeback Management — automated responses with Disputifier.',
    description:
      'Our new Chargeback Management add-on (powered by Disputifier) automatically pulls transaction evidence, drafts a compelling-evidence response, and submits within the network deadline. Merchants are seeing recovery rates roughly 2× the industry average on representment-eligible cases.',
  },
  {
    date: 'Mar 31, 2026',
    monthLabel: 'March 2026',
    tag: 'Product',
    title: 'High-risk merchant onboarding — now self-serve.',
    description:
      'CBD, nutra, firearms accessories, and other high-risk verticals can now complete the full underwriting application online. Direct relationships with high-risk-friendly acquirers mean approvals in 3–5 business days instead of weeks of back-and-forth.',
  },
  {
    date: 'Mar 24, 2026',
    monthLabel: 'March 2026',
    tag: 'Product',
    title: 'Next-day funding — now standard on every Delt account.',
    description:
      'All US merchants now receive next-business-day funding by default at no extra cost. Batches close at 8 PM ET and land in your linked bank account the following business morning. No tier upgrade, no hidden fee.',
  },
  {
    date: 'Mar 17, 2026',
    monthLabel: 'March 2026',
    tag: 'Product',
    title: 'Websites — flippable showcase cards + new industry templates.',
    description:
      'The Website Builder ships with five new industry-specific templates (restaurants, salon, retail, health & wellness, professional services) and a redesigned showcase page with flippable cards so you can preview both the live site and the dashboard view side-by-side.',
  },
  {
    date: 'Mar 10, 2026',
    monthLabel: 'March 2026',
    tag: 'Product',
    title: 'Apple Tap to Pay on iPhone — generally available.',
    description:
      'Accept contactless cards and digital wallets directly on any iPhone XS or later — no card reader required. Now live for all US merchants on Delt Payments, including merchants on the 0% Cash Discount program.',
  },
  {
    date: 'Feb 24, 2026',
    monthLabel: 'February 2026',
    tag: 'Compliance',
    title: 'PCI DSS 4.0 certification complete.',
    description:
      'Delt has achieved full PCI DSS 4.0 compliance across all card-processing infrastructure. Merchants on standard integrations no longer need to complete their own SAQ-A questionnaire — Delt covers it.',
  },
  {
    date: 'Feb 17, 2026',
    monthLabel: 'February 2026',
    tag: 'Security',
    title: 'Passkey support for all admin accounts.',
    description:
      'All admin accounts can register a passkey (Face ID, Touch ID, or hardware key) as a primary or secondary authentication method. Passkeys are phishing-resistant and remove the need for SMS-based codes.',
  },
  {
    date: 'Feb 10, 2026',
    monthLabel: 'February 2026',
    tag: 'Product',
    title: 'Dual pricing programs on every quote.',
    description:
      'Every quote and pricing page now presents both programs side-by-side: flat-rate at 2.6% + $0.10 and the 0% Cash Discount alternative. Merchants can model their projected effective rate before they ever sign.',
  },
];

/* ─── Tag meta ───────────────────────────────────────── */
const TAG_META: Record<
  Exclude<Tag, 'All'>,
  { icon: React.ElementType; accent: string; label: string }
> = {
  Product:    { icon: Sparkles,  accent: PURPLE,    label: 'Product' },
  Security:   { icon: Shield,    accent: '#0E8A5F', label: 'Security' },
  Compliance: { icon: FileCheck, accent: '#B45309', label: 'Compliance' },
};

/* ─── Sub-components ─────────────────────────────────── */
function TagBadge({ tag, size = 'md' }: { tag: Exclude<Tag, 'All'>; size?: 'sm' | 'md' }) {
  const { icon: Icon, accent, label } = TAG_META[tag];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide ${pad}`}
      style={{ background: `${accent}14`, color: accent, boxShadow: `inset 0 0 0 1px ${accent}26` }}
    >
      <Icon size={size === 'sm' ? 11 : 12} strokeWidth={2.25} />
      {label}
    </span>
  );
}

/* A single entry along the timeline rail */
function TimelineEntry({ item, index }: { item: ChangelogItem; index: number }) {
  const { accent } = TAG_META[item.tag];
  return (
    <article className="relative grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-6 md:gap-10">
      {/* Left gutter — date + rail dot */}
      <div className="relative pt-1">
        <div className="sticky top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
            {item.date}
          </p>
          {item.version && (
            <p
              className="mt-1 text-[11px] font-mono"
              style={{ color: '#94A3B8', letterSpacing: '0.02em' }}
            >
              {item.version}
            </p>
          )}
        </div>

        {/* Rail dot */}
        <span
          aria-hidden
          className="absolute top-2 -right-[9px] md:-right-[21px] w-4 h-4 rounded-full"
          style={{
            background: WHITE,
            boxShadow: `0 0 0 2px ${accent}, 0 0 0 6px ${accent}1F`,
          }}
        />
      </div>

      {/* Card */}
      <div
        className="group rounded-2xl border p-6 md:p-7 transition-all duration-200 bg-white"
        style={{
          borderColor: HAIRLINE,
          boxShadow: '0 1px 0 rgba(4,30,66,0.03), 0 20px 40px -24px rgba(4,30,66,0.12)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}4D`;
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            `0 1px 0 rgba(4,30,66,0.03), 0 24px 48px -20px rgba(4,30,66,0.2), 0 0 0 4px ${accent}14`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = HAIRLINE;
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            '0 1px 0 rgba(4,30,66,0.03), 0 20px 40px -24px rgba(4,30,66,0.12)';
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <TagBadge tag={item.tag} />
          {item.highlight && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded-full"
              style={{
                color: NAVY,
                background: 'linear-gradient(90deg, #FEF3C7, #FDE68A)',
                boxShadow: 'inset 0 0 0 1px rgba(180,83,9,0.25)',
              }}
            >
              <Sparkles size={10} strokeWidth={2.5} />
              Featured
            </span>
          )}
        </div>
        <h3
          className="text-xl md:text-[22px] font-bold tracking-tight leading-[1.2] mb-3"
          style={{ color: NAVY }}
        >
          {item.title}
        </h3>
        <p className="text-[15px] leading-relaxed mb-5" style={{ color: MUTED }}>
          {item.description}
        </p>
        <a
          href="#/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
          style={{ color: PURPLE }}
        >
          Read the full note
          <ChevronRight size={14} strokeWidth={2.5} />
        </a>

        {/* subtle accent bar along the bottom */}
        <div
          aria-hidden
          className="mt-6 h-0.5 w-10 rounded-full transition-all duration-300 group-hover:w-24"
          style={{ background: accent }}
        />
      </div>
    </article>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export function WhatsNewPage() {
  const [activeTab, setActiveTab] = useState<Tag>('All');

  const filtered = useMemo(
    () => (activeTab === 'All' ? ITEMS : ITEMS.filter(i => i.tag === activeTab)),
    [activeTab],
  );

  // Group by month for the timeline
  const grouped = useMemo(() => {
    const map = new Map<string, ChangelogItem[]>();
    filtered.forEach(i => {
      if (!map.has(i.monthLabel)) map.set(i.monthLabel, []);
      map.get(i.monthLabel)!.push(i);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const tabs: Tag[] = ['All', 'Product', 'Security', 'Compliance'];

  return (
    <div style={{ background: WHITE, color: INK, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ══ DARK HERO ══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: NAVY_DEEP,
          color: WHITE,
        }}
      >
        {/* noise + glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              `radial-gradient(60% 80% at 20% 10%, ${PURPLE}55 0%, transparent 55%),` +
              `radial-gradient(50% 70% at 85% 30%, ${PURPLE_HI}33 0%, transparent 60%),` +
              `radial-gradient(80% 60% at 50% 100%, ${NAVY} 0%, transparent 70%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-soft-light"
          style={{
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-28 md:pt-36 pb-36">
          <div className="flex items-center gap-2 mb-6">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#E0DCFF',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: '#6EE7B7',
                  boxShadow: '0 0 8px #6EE7B7',
                }}
              />
              What&rsquo;s new
            </span>
          </div>

          <h1
            className="font-bold tracking-[-0.02em] max-w-4xl"
            style={{
              fontSize: 'clamp(2.75rem, 6vw, 5rem)',
              lineHeight: 1.03,
              color: WHITE,
            }}
          >
            Every ship,
            <br />
            <span
              style={{
                background: `linear-gradient(90deg, ${WHITE} 0%, #C4BEFF 60%, ${PURPLE_HI} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              every week.
            </span>
          </h1>

          <p
            className="mt-7 text-lg md:text-xl max-w-xl leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.72)' }}
          >
            The updates, features, and fixes we ship at Delt — written in plain English, dated, and searchable.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#/blog"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all"
              style={{
                background: WHITE,
                color: NAVY,
                boxShadow: '0 12px 30px -10px rgba(0,0,0,0.4)',
              }}
            >
              <Rss size={15} strokeWidth={2.5} />
              Subscribe to RSS
            </a>
            <a
              href="#changelog"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              Jump to the latest
              <ArrowRight size={14} strokeWidth={2.5} />
            </a>
          </div>

          {/* Quick stats strip */}
          <div
            className="mt-14 grid grid-cols-3 gap-0 rounded-2xl overflow-hidden max-w-2xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            {[
              { label: 'Shipped this quarter', value: '42' },
              { label: 'Avg. releases / week',  value: '3.2' },
              { label: 'Open roadmap items',   value: '28' },
            ].map((s, i) => (
              <div
                key={s.label}
                className="px-5 py-4"
                style={{
                  borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: WHITE }}>
                  {s.value}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STICKY FILTER BAR ═════════════════════════════════ */}
      <div
        id="changelog"
        className="sticky top-0 z-20 backdrop-blur-md"
        style={{
          background: 'rgba(255,255,255,0.86)',
          borderBottom: `1px solid ${HAIRLINE}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabs.map(tab => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-shrink-0 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
                    style={
                      active
                        ? { background: NAVY, color: WHITE }
                        : { color: MUTED, background: 'transparent' }
                    }
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
            <p className="hidden sm:block text-xs font-medium" style={{ color: '#94A3B8' }}>
              Showing <span style={{ color: NAVY, fontWeight: 700 }}>{filtered.length}</span> of {ITEMS.length}
            </p>
          </div>
        </div>
      </div>

      {/* ══ TIMELINE FEED ═════════════════════════════════════ */}
      <section className="relative py-16 md:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Vertical rail */}
            <div
              aria-hidden
              className="absolute left-[139px] md:left-[179px] top-2 bottom-0 w-px"
              style={{
                background: `linear-gradient(to bottom, ${HAIRLINE}, ${HAIRLINE} 94%, transparent)`,
              }}
            />

            {grouped.map(([month, items]) => (
              <div key={month} className="mb-16 last:mb-0">
                {/* Month header */}
                <div className="relative mb-10 grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-6 md:gap-10">
                  <div />
                  <div className="flex items-center gap-3">
                    <h2
                      className="text-[11px] font-bold uppercase tracking-[0.22em]"
                      style={{ color: NAVY }}
                    >
                      {month}
                    </h2>
                    <div className="flex-1 h-px" style={{ background: HAIRLINE }} />
                    <span className="text-[11px] font-medium" style={{ color: '#94A3B8' }}>
                      {items.length} update{items.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {/* Entries */}
                <div className="flex flex-col gap-8">
                  {items.map((item, i) => (
                    <TimelineEntry key={item.date + i} item={item} index={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* End-of-feed */}
          <div
            className="mt-16 grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-6 md:gap-10"
          >
            <div />
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: `linear-gradient(180deg, ${WHITE} 0%, #F8F7FF 100%)`,
                boxShadow: `inset 0 0 0 1px ${HAIRLINE}`,
              }}
            >
              <Package size={22} strokeWidth={2} style={{ color: PURPLE }} className="mx-auto mb-3" />
              <p className="font-semibold" style={{ color: NAVY }}>
                That&rsquo;s the last three months.
              </p>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>
                Looking for something older? Browse the full archive.
              </p>
              <a
                href="#/blog"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: PURPLE }}
              >
                See the archive
                <ArrowRight size={14} strokeWidth={2.5} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SUBSCRIBE BAND ════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: NAVY }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              `radial-gradient(60% 120% at 85% 50%, ${PURPLE}40 0%, transparent 55%),` +
              `radial-gradient(40% 80% at 10% 10%, ${PURPLE_HI}2a 0%, transparent 60%)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div>
            <h2
              className="font-bold tracking-tight"
              style={{
                fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
                lineHeight: 1.1,
                color: WHITE,
              }}
            >
              Get the changelog in your inbox every Friday.
            </h2>
            <p className="mt-4 text-base md:text-lg leading-relaxed max-w-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
              One email. The ship notes, the why behind them, and the occasional engineering post. No sales pitch.
            </p>
          </div>
          <form
            onSubmit={e => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
            }}
          >
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/40"
              style={{ color: WHITE }}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all"
              style={{
                background: WHITE,
                color: NAVY,
                boxShadow: '0 10px 24px -10px rgba(0,0,0,0.5)',
              }}
            >
              Subscribe
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
