import { Heart, Compass, ShieldCheck, Rocket, ArrowRight, MapPin, Users, Building2 } from 'lucide-react';

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
const STATS = [
  { value: '<1 Day',  label: 'Live on day one',             sub: 'Median from signup to first sale' },
  { value: '$847',    label: 'Avg. monthly savings',       sub: 'vs. Square & Stripe' },
  { value: '$50M',    label: 'Capital deployed',           sub: 'Since 2019' },
  { value: '97%',     label: 'Owner retention',            sub: 'Twelve-month' },
];

const LEADERS = [
  { name: 'Avery Chen',      title: 'Chief Executive Officer',  initials: 'AC', bio: 'Started two businesses before building Delt; led payments operations at Block.' },
  { name: 'Priya Patel',     title: 'Chief Financial Officer',  initials: 'PP', bio: 'Finance lead at Plaid and Robinhood; CPA. Keeps the books honest.' },
  { name: 'Marcus Webb',     title: 'Chief Technology Officer', initials: 'MW', bio: 'Built payments infrastructure at Stripe including risk and ledger systems.' },
  { name: 'Elena Rodriguez', title: 'Chief Operating Officer',  initials: 'ER', bio: 'Scaled support and operations at DoorDash and Toast.' },
  { name: 'Daniel Kim',      title: 'Chief Product Officer',    initials: 'DK', bio: 'Designed Lens AI. Former product lead at Figma and Linear.' },
  { name: 'Zara Okafor',     title: 'Chief Marketing Officer',  initials: 'ZO', bio: 'Built brand strategy for Shopify and small-business organizations.' },
];

const VALUES = [
  { icon: Heart,       title: 'Owner first.',     description: 'Every product decision starts with one question: does this make running a business easier for the owner?' },
  { icon: Compass,     title: 'Honest by default.',   description: 'We tell business owners the truth about fees, terms, and who qualifies — even when it costs us the sale.' },
  { icon: ShieldCheck, title: 'Secure by design.',    description: 'Security is built into every layer, not added as an afterthought. PCI-compliant and SOC 2 certified.' },
  { icon: Rocket,      title: 'Ship weekly.',         description: 'We ship new features every week. Check the changelog and you\'ll see.' },
];

const PRESS = ['Forbes', 'TechCrunch', 'The Information', 'Axios', 'Bloomberg', 'Inc.'];

const COMPANY_FACTS = [
  { icon: Building2, label: 'Headquartered',   value: 'New York City' },
  { icon: Users,     label: 'Team',            value: '180 and growing' },
  { icon: MapPin,    label: 'Remote-first',    value: 'Americas & Europe' },
];

/* ─── Sub-components ─────────────────────────────────── */
function StatTile({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <div
      className="flex flex-col gap-1 px-6 py-6"
      style={{ borderRight: `1px solid rgba(255,255,255,0.08)` }}
    >
      <p
        className="text-4xl md:text-5xl font-bold tracking-[-0.02em]"
        style={{
          background: `linear-gradient(180deg, ${WHITE} 0%, #C4BEFF 140%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {value}
      </p>
      <p className="mt-2 text-sm font-semibold" style={{ color: WHITE }}>{label}</p>
      <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {sub}
      </p>
    </div>
  );
}

function LeaderCard({ name, title, initials, bio }: { name: string; title: string; initials: string; bio: string }) {
  return (
    <div
      className="group relative rounded-2xl p-6 transition-all duration-200 bg-white"
      style={{
        boxShadow: `inset 0 0 0 1px ${HAIRLINE}, 0 1px 0 rgba(4,30,66,0.02)`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `inset 0 0 0 1px ${PURPLE}4D, 0 12px 30px -16px rgba(73,69,255,0.35)`;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `inset 0 0 0 1px ${HAIRLINE}, 0 1px 0 rgba(4,30,66,0.02)`;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold tracking-wide"
          style={{
            background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)`,
            color: WHITE,
            boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.08), 0 6px 16px -6px rgba(73,69,255,0.5)',
          }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[15px] tracking-tight truncate" style={{ color: NAVY }}>{name}</p>
          <p className="text-xs font-medium mt-0.5" style={{ color: PURPLE }}>{title}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed" style={{ color: MUTED }}>{bio}</p>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <div
      className="group relative rounded-2xl p-7 overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.04)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `inset 0 0 0 1px ${PURPLE_HI}66`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.08)';
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(80% 60% at 100% 0%, ${PURPLE}26 0%, transparent 60%)`,
        }}
      />
      <div className="relative flex items-start justify-between mb-6">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: 'rgba(109,104,255,0.15)',
            boxShadow: 'inset 0 0 0 1px rgba(109,104,255,0.3)',
          }}
        >
          <Icon size={20} strokeWidth={2} style={{ color: PURPLE_HI }} />
        </div>
        <span
          className="text-[11px] font-mono opacity-50"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          0{index + 1}
        </span>
      </div>
      <h3 className="relative text-lg font-bold tracking-tight mb-2" style={{ color: WHITE }}>{title}</h3>
      <p className="relative text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{description}</p>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export function AboutUsPage() {
  return (
    <div style={{ background: WHITE, color: INK, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ══ HERO — dark manifesto ═════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: NAVY_DEEP, color: WHITE }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              `radial-gradient(55% 80% at 15% 5%, ${PURPLE}66 0%, transparent 55%),` +
              `radial-gradient(40% 70% at 90% 35%, ${PURPLE_HI}33 0%, transparent 60%),` +
              `radial-gradient(90% 60% at 50% 110%, ${NAVY} 0%, transparent 70%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.055] mix-blend-soft-light"
          style={{
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-28 md:pt-36 pb-20 md:pb-24">
          <div className="flex items-center gap-2 mb-6">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#E0DCFF',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)',
              }}
            >
              About Delt
            </span>
          </div>

          <h1
            className="font-bold tracking-[-0.02em] max-w-5xl"
            style={{
              fontSize: 'clamp(2.75rem, 6.5vw, 5.5rem)',
              lineHeight: 1.02,
              color: WHITE,
            }}
          >
            Building tools for the people who keep the economy running
            <br />
            of{' '}
            <span
              style={{
                background: `linear-gradient(90deg, ${PURPLE_HI} 0%, #C4BEFF 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontStyle: 'italic',
              }}
            >
              Main Street.
            </span>
          </h1>

          <p
            className="mt-8 text-lg md:text-xl max-w-2xl leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.72)' }}
          >
            Delt exists because running a business is already hard enough. We handle payments, capital, your website, and your numbers — so you can focus on the work you actually love.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#/careers"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all"
              style={{
                background: PURPLE,
                color: WHITE,
                boxShadow: '0 18px 40px -14px rgba(73,69,255,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              See open roles
              <ArrowRight size={14} strokeWidth={2.5} />
            </a>
            <a
              href="#our-story"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: WHITE,
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)',
              }}
            >
              Read our story
            </a>
          </div>

          {/* Company facts row */}
          <div className="mt-16 flex flex-wrap gap-x-10 gap-y-4">
            {COMPANY_FACTS.map(f => (
              <div key={f.label} className="flex items-center gap-2.5">
                <f.icon size={16} strokeWidth={2} style={{ color: PURPLE_HI }} />
                <div>
                  <span className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {f.label}
                  </span>
                  <span className="ml-2 text-sm font-semibold" style={{ color: WHITE }}>{f.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NUMBERS — anchored inside the hero, bleeding into it */}
        <div className="relative max-w-6xl mx-auto px-6 pb-20">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    borderRight: i !== STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  }}
                  className="md:!border-b-0"
                >
                  <StatTile {...s} />
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
            As of Q1 2026 · figures approximate · savings estimates based on merchant survey
          </p>
        </div>
      </section>

      {/* ══ OUR STORY — editorial two-column ══════════════════ */}
      <section id="our-story" className="relative py-28 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[5fr_7fr] gap-14 md:gap-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: PURPLE }}>
              Our story
            </p>
            <h2
              className="font-bold tracking-[-0.015em] sticky top-28"
              style={{ color: NAVY, fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.05 }}
            >
              We started with payments.
              <br />
              <span style={{ color: MUTED, fontWeight: 400 }}>We stayed for the rest of the back office.</span>
            </h2>
          </div>

          <div className="flex flex-col gap-7 text-[17px] leading-[1.7]" style={{ color: '#334155' }}>
            <p>
              Delt was founded in 2019 by people who had run small businesses and were tired of using seven different tools just to manage one shop. We started with payments — fast, fair, transparent — and kept hearing the same thing from our first thousand business owners: <em>&ldquo;Great, what else can you do?&rdquo;</em>
            </p>

            <figure
              className="relative rounded-2xl p-7 my-2"
              style={{
                background: `linear-gradient(180deg, #F8F7FF 0%, ${WHITE} 100%)`,
                boxShadow: `inset 0 0 0 1px ${HAIRLINE}`,
              }}
            >
              <span
                aria-hidden
                className="absolute -top-3 left-6 text-5xl leading-none font-serif"
                style={{ color: PURPLE }}
              >
                &ldquo;
              </span>
              <blockquote
                className="text-lg md:text-[22px] font-semibold tracking-tight leading-snug"
                style={{ color: NAVY }}
              >
                We&rsquo;d rather ship one thing that actually works for a laundromat in Cleveland than ten features nobody asked for.
              </blockquote>
              <figcaption className="mt-4 text-sm" style={{ color: MUTED }}>
                Avery Chen · Co-founder & CEO
              </figcaption>
            </figure>

            <p>
              Today we’re 180 people headquartered in New York City, with a remote-first team across the Americas and Europe. We serve more than 10,000 businesses — restaurants, salons, gyms, retail shops, and service businesses — processing over $2 billion in annual card sales.
            </p>
            <p>
              We’ve grown from payments into working capital, a website builder, an AI business advisor called Lens, and a full POS stack. The product has grown; the mission hasn’t changed. Make the back office invisible so business owners can focus on the work they actually love.
            </p>
          </div>
        </div>
      </section>

      {/* ══ LEADERSHIP ════════════════════════════════════════ */}
      <section
        className="relative py-24 px-6 border-y"
        style={{
          borderColor: HAIRLINE,
          background: `radial-gradient(80% 100% at 50% 0%, #F7F6FF 0%, ${WHITE} 70%)`,
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: PURPLE }}>
                Leadership
              </p>
              <h2
                className="font-bold tracking-[-0.015em]"
                style={{ color: NAVY, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.1 }}
              >
                The team building Delt.
              </h2>
            </div>
            <p className="text-sm max-w-md" style={{ color: MUTED }}>
              Former operators, engineers, and designers who’ve built and scaled payments products.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {LEADERS.map(l => <LeaderCard key={l.name} {...l} />)}
          </div>
        </div>
      </section>

      {/* ══ VALUES — dark panel ══════════════════════════════ */}
      <section
        className="relative overflow-hidden py-24 px-6"
        style={{ background: NAVY, color: WHITE }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              `radial-gradient(50% 70% at 85% 0%, ${PURPLE}40 0%, transparent 55%),` +
              `radial-gradient(60% 80% at 10% 100%, ${PURPLE_HI}1f 0%, transparent 60%)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: PURPLE_HI }}>
              What we believe
            </p>
            <h2
              className="font-bold tracking-[-0.015em]"
              style={{ color: WHITE, fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)', lineHeight: 1.08 }}
            >
              Four principles that shape
              <br />
              every decision we make.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => <ValueCard key={v.title} {...v} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══ PRESS — clean, editorial ═════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-center mb-10" style={{ color: '#94A3B8' }}>
            As seen in
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {PRESS.map(pub => (
              <span
                key={pub}
                className="text-xl md:text-2xl tracking-tight select-none"
                style={{
                  color: '#94A3B8',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontWeight: 500,
                }}
              >
                {pub}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-24 md:py-28 px-6"
        style={{
          background: `linear-gradient(180deg, ${WHITE} 0%, #F5F4FF 100%)`,
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background: `radial-gradient(60% 100% at 50% 100%, ${PURPLE}22 0%, transparent 60%)`,
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2
            className="font-bold tracking-[-0.015em]"
            style={{ color: NAVY, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.05 }}
          >
            Come build with us.
          </h2>
          <p className="mt-5 text-lg leading-relaxed" style={{ color: MUTED }}>
            We’re hiring in engineering, product, design, and sales. Remote-friendly, competitive pay, real equity.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#/careers"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all"
              style={{
                background: PURPLE,
                color: WHITE,
                boxShadow: '0 18px 40px -14px rgba(73,69,255,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              See open roles
              <ArrowRight size={14} strokeWidth={2.5} />
            </a>
            <a
              href="#/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: NAVY }}
            >
              Or just say hi
              <ArrowRight size={14} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
