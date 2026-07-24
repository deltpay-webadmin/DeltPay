import { Star, ArrowRight, Quote, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { BusinessScene } from '../components/BusinessScene';

/* ─── Palette ────────────────────────────────────────── */
const NAVY   = '#041E42';
const PURPLE = '#4945FF';
const WHITE  = '#FFFFFF';
const BG     = '#F6F7FB';
const MUTED  = '#475569';

/* ─── Data ───────────────────────────────────────────── */
const STATS = [
  { value: '10,000+',  label: 'Businesses', icon: TrendingUp },
  { value: '$50M+',    label: 'Capital deployed', icon: DollarSign },
  { value: '4.9/5',    label: 'Avg rating', icon: Star },
  { value: '97%',      label: 'Retention', icon: Clock },
];

type Theme = 'hardware' | 'cafe' | 'bakery' | 'wellness' | 'auto' | 'restaurant' | 'retail' | 'salon' | 'dental' | 'office' | 'books' | 'fitness' | 'flowers';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  business: string;
  location: string;
  initials: string;
  theme: Theme;
  metric: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Switching to Delt Payments took an afternoon. We went from T+3 settlements to same-day deposits and haven't looked back.",
    name: 'Carlos Mendez',
    role: 'Owner',
    business: 'Northside Auto',
    location: 'Denver, CO',
    initials: 'CM',
    theme: 'auto',
    metric: 'Same-day deposits',
  },
  {
    quote: "Lens AI noticed a 22% spike in Tuesday evening sales we'd never seen ourselves. It just told us, unprompted. That's the tool I wanted for years.",
    name: 'Jess Park',
    role: 'Co-founder',
    business: 'Tangerine Studio',
    location: 'Brooklyn, NY',
    initials: 'JP',
    theme: 'salon',
    metric: '+22% Tue nights',
  },
  {
    quote: "The Capital offer popped up in my dashboard. I applied at 9am and had the funds clearing by 3pm. I've never experienced anything like it with a bank.",
    name: 'Dmitri Volkov',
    role: 'Proprietor',
    business: 'Oak & Ember',
    location: 'Chicago, IL',
    initials: 'DV',
    theme: 'restaurant',
    metric: 'Funded in 6h',
  },
  {
    quote: 'We run 3 locations. The multi-site POS view is the only reason I can leave the main store and not lose my mind.',
    name: 'Anika Johnson',
    role: 'Founder',
    business: 'Pico Pilates',
    location: 'Los Angeles, CA',
    initials: 'AJ',
    theme: 'fitness',
    metric: '3 locations',
  },
  {
    quote: 'Delt built our website in a day — not an exaggeration. The builder is genuinely good, the SEO works, and it costs less than our old WordPress plugin stack.',
    name: 'Sam Torres',
    role: 'Creative Director',
    business: 'Vista Vintage',
    location: 'Austin, TX',
    initials: 'ST',
    theme: 'retail',
    metric: 'Live in 1 day',
  },
  {
    quote: "Chargebacks used to eat 2 hours a week. With Delt's evidence-builder and auto-responses, we handle them in 10 minutes.",
    name: 'Fatima Nkosi',
    role: 'Operations Lead',
    business: 'Atlas Apothecary',
    location: 'Atlanta, GA',
    initials: 'FN',
    theme: 'flowers',
    metric: '−110 min/week',
  },
];

interface CaseStudy {
  business: string;
  metric: string;
  headline: string;
  description: string;
  initials: string;
  theme: Theme;
  stat: { label: string; value: string }[];
}

const CASE_STUDIES: CaseStudy[] = [
  {
    business: 'Roma Trattoria',
    metric: '+38% avg ticket',
    headline: 'How a family trattoria drove bigger checks.',
    description: "Delt's smart upsell prompts at checkout helped this NYC family trattoria lift average ticket size without raising a single price.",
    initials: 'RT',
    theme: 'restaurant',
    stat: [
      { label: 'Ticket', value: '+38%' },
      { label: 'Timeframe', value: '90 days' },
      { label: 'Locations', value: '1' },
    ],
  },
  {
    business: 'Bloom Salon',
    metric: '−2 hrs/week',
    headline: 'Automated reminders, reclaimed mornings.',
    description: 'Digital intake forms and SMS reminders gave Bloom Salon back 2 hours every week — mornings that used to disappear into paperwork.',
    initials: 'BS',
    theme: 'salon',
    stat: [
      { label: 'Saved', value: '2h/wk' },
      { label: 'No-shows', value: '−40%' },
      { label: 'Staff', value: '8' },
    ],
  },
  {
    business: 'Blue Wren Coffee',
    metric: '$18k Q1 capital',
    headline: 'Stocking up ahead of peak season.',
    description: 'A seasonal espresso bar used Delt Capital to pre-buy beans and milk ahead of their busiest quarter. Repayment scaled with sales.',
    initials: 'BW',
    theme: 'cafe',
    stat: [
      { label: 'Funded', value: '$18k' },
      { label: 'Repay', value: '6 mo' },
      { label: 'ROI', value: '3.2×' },
    ],
  },
];

const LOGOS: { name: string; theme: Theme }[] = [
  { name: 'Flour & Salt',     theme: 'bakery' },
  { name: 'Bloom Salon',      theme: 'salon' },
  { name: 'Roma Trattoria',   theme: 'restaurant' },
  { name: 'Riverside Dental', theme: 'dental' },
  { name: 'Northside Auto',   theme: 'auto' },
  { name: 'Tangerine Studio', theme: 'office' },
  { name: 'Pico Pilates',     theme: 'fitness' },
  { name: 'Oak & Ember',      theme: 'restaurant' },
  { name: 'Blue Wren Coffee', theme: 'cafe' },
  { name: 'Granite Gym',      theme: 'fitness' },
  { name: 'Atlas Apothecary', theme: 'flowers' },
  { name: 'Vista Vintage',    theme: 'retail' },
];

/* ─── Sub-components ─────────────────────────────────── */
function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} fill={PURPLE} style={{ color: PURPLE }} />
      ))}
    </div>
  );
}

function StatTile({ value, label, icon: Icon }: { value: string; label: string; icon: React.ComponentType<{ size: number; color: string }> }) {
  return (
    <div
      className="flex-1 min-w-0 rounded-2xl border p-6 flex flex-col items-center gap-2"
      style={{
        background: WHITE,
        borderColor: `${NAVY}14`,
        boxShadow: '0 4px 14px rgba(4,30,66,0.04)',
      }}
    >
      <div
        className="rounded-xl flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          background: `linear-gradient(135deg, ${PURPLE}18 0%, ${PURPLE}08 100%)`,
          border: `1px solid ${PURPLE}22`,
        }}
      >
        <Icon size={18} color={PURPLE} />
      </div>
      <p className="text-3xl font-bold tracking-tight text-center" style={{ color: NAVY, letterSpacing: '-0.02em' }}>{value}</p>
      <p className="text-xs font-medium text-center" style={{ color: MUTED, letterSpacing: '0.02em' }}>{label}</p>
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div
      className="rounded-3xl overflow-hidden border flex flex-col transition-all duration-200 cursor-pointer"
      style={{
        background: WHITE,
        borderColor: `${NAVY}12`,
        boxShadow: '0 4px 20px rgba(4,30,66,0.04)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${PURPLE}55`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px rgba(73,69,255,0.14)`;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${NAVY}12`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(4,30,66,0.04)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <BusinessScene
        theme={t.theme}
        initials={t.initials}
        businessName={t.business}
        location={t.location}
        metric={t.metric}
        aspect="landscape"
        variant={Math.random() > 0.5 ? 'navy' : 'purple'}
      />
      <div className="p-6 flex flex-col gap-4 flex-1">
        <Stars />
        <p className="text-sm leading-relaxed flex-1" style={{ color: MUTED, fontSize: 14 }}>&ldquo;{t.quote}&rdquo;</p>
        <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: `${NAVY}0A` }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: NAVY }}>{t.name}</p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>{t.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseStudyCard({ cs }: { cs: CaseStudy }) {
  return (
    <div
      className="group rounded-3xl overflow-hidden border flex flex-col transition-all duration-200 cursor-pointer"
      style={{
        borderColor: `${NAVY}12`,
        background: WHITE,
        boxShadow: '0 4px 20px rgba(4,30,66,0.04)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${PURPLE}55`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 50px rgba(73,69,255,0.16)`;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${NAVY}12`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(4,30,66,0.04)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <BusinessScene
        theme={cs.theme}
        initials={cs.initials}
        businessName={cs.business}
        metric={cs.metric}
        aspect="landscape"
        variant="navy"
      />
      {/* Content */}
      <div className="p-6 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-base leading-tight" style={{ color: NAVY, letterSpacing: '-0.01em' }}>{cs.headline}</h3>
        <p className="text-sm leading-relaxed flex-1" style={{ color: MUTED }}>{cs.description}</p>
        {/* Stat row */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t" style={{ borderColor: `${NAVY}0A` }}>
          {cs.stat.map(s => (
            <div key={s.label} className="flex flex-col">
              <span className="text-base font-bold" style={{ color: NAVY, letterSpacing: '-0.01em' }}>{s.value}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#94A3B8' }}>{s.label}</span>
            </div>
          ))}
        </div>
        <a
          href="#/case-studies"
          className="inline-flex items-center gap-1.5 text-sm font-semibold mt-1 transition-colors"
          style={{ color: PURPLE }}
        >
          Read the full story <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}

function LogoTile({ name, theme }: { name: string; theme: Theme }) {
  // Inline themed "logomark" — a tiny scene with the business initials
  const themeEmoji: Record<Theme, string> = {
    hardware: '🔨',
    cafe: '☕',
    bakery: '🥐',
    wellness: '🧘',
    auto: '🚗',
    restaurant: '🍝',
    retail: '🛍',
    salon: '✂',
    dental: '🦷',
    office: '📊',
    books: '📚',
    fitness: '🏋',
    flowers: '🌿',
  };
  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="rounded-2xl border flex items-center gap-3 p-3"
      style={{
        background: WHITE,
        borderColor: `${NAVY}12`,
        boxShadow: '0 2px 8px rgba(4,30,66,0.03)',
      }}
    >
      <div
        className="rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          width: 36,
          height: 36,
          background: `linear-gradient(135deg, ${PURPLE}22 0%, ${NAVY}12 100%)`,
          border: `1px solid ${PURPLE}22`,
          fontSize: 16,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: '-0.02em' }}>{initials}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold truncate" style={{ color: NAVY }}>{name}</div>
        <div className="text-[10px]" style={{ color: '#94A3B8' }}>{themeEmoji[theme]} Delt customer</div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export function ReviewsPage() {
  return (
    <div style={{ background: WHITE, color: NAVY, fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
      {/* ══ HERO ═══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden pt-28 pb-16 px-6"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -5%, ${PURPLE}22 0%, transparent 68%), ${WHITE}`,
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-12 items-center">
            {/* Left: copy */}
            <div>
              <p className="text-xs font-bold tracking-[0.18em] uppercase mb-4" style={{ color: PURPLE }}>
                Customer stories
              </p>
              <h1
                className="font-bold tracking-tight mb-5"
                style={{
                  fontSize: 'clamp(38px, 5.5vw, 64px)',
                  color: NAVY,
                  lineHeight: 1.05,
                  letterSpacing: '-0.025em',
                }}
              >
                Trusted by the businesses we serve.
              </h1>
              <p className="text-lg max-w-xl mb-8" style={{ color: MUTED, lineHeight: 1.55 }}>
                Thousands of merchants run their shops on Delt. Here are a few of their stories — raw, unedited, and in their own words.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: PURPLE, color: WHITE, border: 'none', cursor: 'pointer' }}
                >
                  Read the stories <ArrowRight size={14} />
                </button>
                <a
                  href="#/contact"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: `${NAVY}1A`, color: NAVY, background: WHITE }}
                >
                  Submit your story
                </a>
              </div>
              {/* Hero stars strip */}
              <div className="mt-10 flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <Stars />
                  <span className="text-sm font-semibold" style={{ color: NAVY }}>4.9 / 5</span>
                </div>
                <div className="h-6 w-px" style={{ background: `${NAVY}22` }} />
                <span className="text-sm" style={{ color: MUTED }}>From 2,400+ verified reviews</span>
              </div>
            </div>

            {/* Right: collage of 3 stacked business scenes */}
            <div className="relative h-[420px] hidden md:block">
              <div className="absolute top-0 right-0 w-[72%] h-[60%] rotate-[3deg]">
                <BusinessScene
                  theme="restaurant"
                  initials="RT"
                  businessName="Roma Trattoria"
                  location="New York"
                  metric="+38% ticket"
                  aspect="landscape"
                  variant="navy"
                />
              </div>
              <div className="absolute top-[28%] left-0 w-[68%] h-[56%] -rotate-[4deg] z-10">
                <BusinessScene
                  theme="cafe"
                  initials="BW"
                  businessName="Blue Wren Coffee"
                  location="Portland"
                  metric="$18k funded"
                  aspect="landscape"
                  variant="purple"
                />
              </div>
              <div className="absolute bottom-0 right-[4%] w-[66%] h-[52%] rotate-[2deg]">
                <BusinessScene
                  theme="salon"
                  initials="BS"
                  businessName="Bloom Salon"
                  location="Portland"
                  metric="−40% no-shows"
                  aspect="landscape"
                  variant="navy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ BY THE NUMBERS ═════════════════════════════════════ */}
      <section className="py-16 px-6" style={{ background: BG }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-center mb-3" style={{ color: PURPLE }}>
            By the numbers
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-center mb-10" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
            Real scale, real results.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(s => <StatTile key={s.label} {...s} />)}
          </div>
          <p className="text-xs mt-4 text-center" style={{ color: '#94A3B8' }}>
            As of Q1 2026. Rating based on verified app store reviews. Retention and capital figures are approximate. Individual results vary.
          </p>
        </div>
      </section>

      {/* ══ FEATURED TESTIMONIAL ═══════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-[1fr_1.15fr] gap-10 items-stretch">
            {/* Featured scene */}
            <div>
              <BusinessScene
                theme="bakery"
                initials="MR"
                businessName="Flour & Salt Bakery"
                location="Brooklyn, NY"
                metric="3x faster deposits"
                aspect="square"
                variant="purple"
              />
            </div>
            {/* Featured quote */}
            <div
              className="rounded-3xl p-10 md:p-12 flex flex-col justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, #0a1a3f 100%)`,
                boxShadow: '0 20px 60px rgba(4,30,66,0.25)',
              }}
            >
              {/* purple accent glow */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: -100, right: -100, width: 300, height: 300,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${PURPLE}40 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                }}
              />
              <Quote size={48} color={PURPLE} strokeWidth={1.8} style={{ marginBottom: 20, transform: 'scaleX(-1)' }} />
              <p
                className="font-bold tracking-tight leading-snug mb-6 relative"
                style={{
                  color: WHITE,
                  fontSize: 'clamp(22px, 2.6vw, 32px)',
                  letterSpacing: '-0.015em',
                }}
              >
                "Our payout hits the bank before the coffee&apos;s brewed. We've tried every processor out there — Delt is the only one that understands what a small business actually needs."
              </p>
              <div className="flex items-center gap-4 relative">
                <div
                  className="h-px flex-shrink-0"
                  style={{ width: 40, background: `${PURPLE}AA` }}
                />
                <div>
                  <p className="text-sm font-bold" style={{ color: WHITE }}>Maya Reyes</p>
                  <p className="text-sm" style={{ color: `rgba(255,255,255,0.7)` }}>Co-owner, Flour &amp; Salt Bakery · Brooklyn, NY</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIAL GRID ═══════════════════════════════════ */}
      <section id="stories" className="py-20 px-6" style={{ background: BG }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3" style={{ color: PURPLE }}>
            Reviews
          </p>
          <h2 className="text-4xl font-bold tracking-tight mb-3" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            What merchants are saying
          </h2>
          <p className="mb-12 max-w-2xl" style={{ color: MUTED, fontSize: 16 }}>
            From hardware stores to yoga studios — real operators, real numbers.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => <TestimonialCard key={t.name} t={t} />)}
          </div>
        </div>
      </section>

      {/* ══ CASE STUDIES ═══════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3" style={{ color: PURPLE }}>
                Case studies
              </p>
              <h2 className="text-4xl font-bold tracking-tight" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
                Deep dives
              </h2>
            </div>
            <a href="#/case-studies" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: PURPLE }}>
              View all stories <ArrowRight size={14} />
            </a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CASE_STUDIES.map(cs => (
              <CaseStudyCard key={cs.business} cs={cs} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ LOGO WALL ══════════════════════════════════════════ */}
      <section
        className="py-20 px-6 border-t"
        style={{ background: BG, borderColor: `${NAVY}10` }}
      >
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-center mb-3" style={{ color: PURPLE }}>
            Trusted by thousands
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
            The businesses on Delt.
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {LOGOS.map(logo => (
              <LogoTile key={logo.name} {...logo} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══════════════════════════════════════════ */}
      <section
        className="py-28 px-6 text-center relative overflow-hidden"
        style={{
          background: `radial-gradient(ellipse 70% 80% at 50% 110%, ${PURPLE}30 0%, transparent 65%), ${NAVY}`,
        }}
      >
        <div className="max-w-2xl mx-auto relative">
          <p className="text-xs font-bold tracking-[0.18em] uppercase mb-4" style={{ color: '#9DA8FF' }}>
            Your story could be next
          </p>
          <h2 className="text-5xl font-bold tracking-tight mb-5" style={{ color: WHITE, letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            Join them.
          </h2>
          <p className="mb-10 text-lg" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Create a free account and see why 10,000+ businesses run on Delt.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#/get-a-quote"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: PURPLE, color: WHITE, boxShadow: '0 8px 24px rgba(73,69,255,0.45)' }}
            >
              Create a free account <ArrowRight size={14} />
            </a>
            <a
              href="#/contact-sales"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold border"
              style={{ borderColor: 'rgba(255,255,255,0.25)', color: WHITE, background: 'rgba(255,255,255,0.05)' }}
            >
              Talk to sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
