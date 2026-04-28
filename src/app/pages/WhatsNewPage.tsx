import { useState, useMemo } from 'react';
import { Rss, ArrowRight, ChevronRight, Sparkles, CreditCard, Scale, Cpu, Store, Package } from 'lucide-react';

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
type Tag = 'All' | 'Payments' | 'Regulation' | 'Tech & AI' | 'Retail';

interface NewsItem {
  date: string;
  monthLabel: string;    // e.g. 'April 2026'
  tag: Exclude<Tag, 'All'>;
  source?: string;       // short publication or body that owns the story
  title: string;
  description: string;
  ownerNote?: string;    // short "what this means for your shop" line
  highlight?: boolean;
}

const ITEMS: NewsItem[] = [
  {
    date: 'Apr 22, 2026',
    monthLabel: 'April 2026',
    tag: 'Regulation',
    source: 'Federal Reserve / merchant trade press',
    title: 'Visa and Mastercard credit interchange settlement takes effect.',
    description:
      'After years of court fights, the new interchange rules from the Visa/Mastercard merchant settlement go into effect this month. The biggest change for small businesses: clearer rights to surcharge credit-card payments at the register, and slightly lower swipe rates on certain credit categories.',
    ownerNote: 'If you accept credit cards, ask your processor whether your effective rate has dropped — it should.',
    highlight: true,
  },
  {
    date: 'Apr 15, 2026',
    monthLabel: 'April 2026',
    tag: 'Tech & AI',
    source: 'Industry reports',
    title: 'AI "shift managers" arrive for restaurants and retail.',
    description:
      'A wave of small-business tools launched this spring use AI to read your sales data and suggest staff schedules, prep lists, and reorder quantities. Early case studies from independent restaurants show 8–12% labor savings without cutting hours.',
    ownerNote: 'Worth a look if you build your weekly schedule by feel — these tools learn your rush hours.',
  },
  {
    date: 'Apr 08, 2026',
    monthLabel: 'April 2026',
    tag: 'Payments',
    source: 'Card networks',
    title: 'Tap to Pay on iPhone now supported in 30+ countries.',
    description:
      'Apple expanded Tap to Pay on iPhone to dozens more countries this quarter. For US owners it has been available for a while, but if you have international suppliers or pop-up locations abroad, you can now accept cards directly on an iPhone in most major markets.',
  },
  {
    date: 'Apr 02, 2026',
    monthLabel: 'April 2026',
    tag: 'Retail',
    source: 'NRF / industry surveys',
    title: 'Foot traffic up 4% YoY at independent shops in Q1.',
    description:
      'The latest National Retail Federation read on small independent retailers shows the first positive year-over-year foot-traffic quarter since 2023. Service businesses (salons, repair, fitness) led the gain. Apparel and home goods were flat.',
    ownerNote: 'If your numbers are not up, your category may be the issue — not your store.',
  },
  {
    date: 'Mar 26, 2026',
    monthLabel: 'March 2026',
    tag: 'Regulation',
    source: 'PCI Security Standards Council',
    title: 'PCI DSS 4.0 fully in force — every business that takes cards is on the hook.',
    description:
      'The PCI DSS 4.0 transition window closed at the end of March. PCI is the security standard for handling card data. If you use a modern processor that handles card storage for you (most owners do), there is little for you to do. If you store card numbers yourself, your annual self-assessment got longer.',
    ownerNote: 'Ask your processor whether they cover your PCI assessment. Most good ones do at no extra cost.',
  },
  {
    date: 'Mar 19, 2026',
    monthLabel: 'March 2026',
    tag: 'Payments',
    source: 'The Federal Reserve',
    title: 'FedNow now used by 1,200+ banks — instant deposits go mainstream.',
    description:
      'FedNow is the Federal Reserve\'s instant-payment rail. With more than 1,200 banks live, more processors are starting to offer same-day or instant deposits to small business accounts as a default, not a paid add-on.',
    ownerNote: 'Worth checking how fast your money currently lands. "1–2 business days" is starting to look slow.',
  },
  {
    date: 'Mar 11, 2026',
    monthLabel: 'March 2026',
    tag: 'Tech & AI',
    source: 'Industry analysts',
    title: 'Restaurant tech consolidation continues — fewer separate tools, more bundles.',
    description:
      'Two more big POS players announced bundled payments + scheduling + inventory packages this month, mirroring a clear industry trend: owners are tired of paying five vendors and getting five logins. Expect more bundling and more aggressive switching offers through the rest of the year.',
  },
  {
    date: 'Mar 04, 2026',
    monthLabel: 'March 2026',
    tag: 'Regulation',
    source: 'CFPB',
    title: 'CFPB clarifies overdraft and "junk fee" rules for small business accounts.',
    description:
      'The Consumer Financial Protection Bureau issued new guidance narrowing what banks can charge in overdraft and account fees, and how those have to be disclosed. Most rules apply to consumer accounts, but small-business deposit accounts at large banks are increasingly being held to the same standard.',
    ownerNote: 'If your bank\'s monthly fees crept up last year, this is a good moment to compare.',
  },
  {
    date: 'Feb 25, 2026',
    monthLabel: 'February 2026',
    tag: 'Retail',
    source: 'Square / Yelp small business reports',
    title: 'Tipping fatigue is real — average tip percent down 1.4 points.',
    description:
      'Multiple small-business reports this winter confirmed what owners have been seeing: average tip percentage on card payments fell from roughly 19.6% to 18.2% over the last twelve months, with the steepest drop at quick-service and counter-pickup spots. Sit-down restaurants held mostly steady.',
    ownerNote: 'Some owners are quietly removing the 25% tip preset on counter screens. Worth testing.',
  },
  {
    date: 'Feb 17, 2026',
    monthLabel: 'February 2026',
    tag: 'Tech & AI',
    source: 'Apple, Google, payment networks',
    title: 'Digital wallets cross 50% of in-person card volume for the first time.',
    description:
      'Apple Pay, Google Pay, and Samsung Pay (combined with tap-to-pay cards) now account for over half of in-person card transactions at small businesses, according to multiple network reports. The shift means contactless-capable hardware is no longer optional.',
    ownerNote: 'If your card reader does not take a tap, you are leaving sales on the counter.',
  },
];

/* ─── Tag meta ───────────────────────────────────────── */
const TAG_META: Record<
  Exclude<Tag, 'All'>,
  { icon: React.ElementType; accent: string; label: string }
> = {
  Payments:     { icon: CreditCard, accent: PURPLE,    label: 'Payments' },
  Regulation:   { icon: Scale,      accent: '#B45309', label: 'Regulation' },
  'Tech & AI':  { icon: Cpu,        accent: '#0B6CF0', label: 'Tech & AI' },
  Retail:       { icon: Store,      accent: '#0E8A5F', label: 'Retail' },
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
function TimelineEntry({ item, index }: { item: NewsItem; index: number }) {
  const { accent } = TAG_META[item.tag];
  return (
    <article className="relative grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-6 md:gap-10">
      {/* Left gutter — date + rail dot */}
      <div className="relative pt-1">
        <div className="sticky top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
            {item.date}
          </p>
          {item.source && (
            <p
              className="mt-1 text-[11px] leading-snug"
              style={{ color: '#94A3B8' }}
            >
              {item.source}
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
        {item.ownerNote && (
          <div
            className="mb-5 rounded-lg px-4 py-3 text-[14px] leading-relaxed"
            style={{
              background: `${accent}0A`,
              boxShadow: `inset 0 0 0 1px ${accent}26`,
              color: NAVY,
            }}
          >
            <span className="font-semibold" style={{ color: accent }}>What this means for your shop:</span>{' '}
            <span style={{ color: MUTED }}>{item.ownerNote}</span>
          </div>
        )}
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
          style={{ color: PURPLE }}
        >
          Read the full story
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

  const tabs: Tag[] = ['All', 'Payments', 'Regulation', 'Tech & AI', 'Retail'];

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
              The Delt Dispatch · Industry digest
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
            What&rsquo;s new in{' '}
            <span
              style={{
                background: `linear-gradient(90deg, ${WHITE} 0%, #C4BEFF 60%, ${PURPLE_HI} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              your industry.
            </span>
          </h1>

          <p
            className="mt-7 text-lg md:text-xl max-w-xl leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.72)' }}
          >
              Payments rules, retail trends, and the small-business news that actually matters — in plain English, with what it means for your shop.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all"
              style={{
                background: WHITE,
                color: NAVY,
                boxShadow: '0 12px 30px -10px rgba(0,0,0,0.4)',
              }}
            >
              <Rss size={15} strokeWidth={2.5} />
              Subscribe by RSS
            </a>
            <a
              href="#changelog"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              Read the latest
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
              { label: 'Stories this quarter', value: '38' },
              { label: 'Sources we read',      value: '60+' },
              { label: 'New every week',       value: 'Fri' },
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
                That&rsquo;s the last three months of industry news.
              </p>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>
                Looking for older stories? Browse the full archive.
              </p>
              <a
                href="#"
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
              The Delt Dispatch, in your inbox every Friday.
            </h2>
            <p className="mt-4 text-base md:text-lg leading-relaxed max-w-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
              One short email a week. What changed in payments, retail, and small-business rules — and what it means for your shop. No spam.
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
