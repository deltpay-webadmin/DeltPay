import { Heart, Compass, ShieldCheck, Rocket, ArrowRight } from 'lucide-react';

/* ─── Palette ────────────────────────────────────────── */
const NAVY   = '#041E42';
const PURPLE = '#4945FF';
const WHITE  = '#FFFFFF';
const BG     = '#F6F7FB';

/* ─── Data ───────────────────────────────────────────── */
const STATS = [
  { value: '<1 Day',  label: 'Go live (Payments)' },
  { value: '$847',    label: 'Avg monthly savings' },
  { value: '$50M',    label: 'Capital deployed' },
  { value: '97%',     label: 'Merchant retention' },
];

const LEADERS = [
  { name: 'Avery Chen',      title: 'Chief Executive Officer',   initials: 'AC' },
  { name: 'Priya Patel',     title: 'Chief Financial Officer',   initials: 'PP' },
  { name: 'Marcus Webb',     title: 'Chief Technology Officer',  initials: 'MW' },
  { name: 'Elena Rodriguez', title: 'Chief Operating Officer',   initials: 'ER' },
  { name: 'Daniel Kim',      title: 'Chief Product Officer',     initials: 'DK' },
  { name: 'Zara Okafor',     title: 'Chief Marketing Officer',   initials: 'ZO' },
];

const VALUES = [
  { icon: Heart,       title: 'Operators first',      description: 'Every product decision starts with one question: does this make running a business easier?' },
  { icon: Compass,     title: 'Honest by default',    description: 'We tell merchants the truth about fees, terms, and eligibility — even when it costs us the deal.' },
  { icon: ShieldCheck, title: 'Secure by design',     description: 'Security is baked into every layer, not bolted on after. PCI, SOC 2, and passkeys are table stakes.' },
  { icon: Rocket,      title: 'Ship weekly',          description: 'We believe momentum compounds. Our changelog is our north star — something ships every Friday.' },
];

const PRESS = ['Forbes', 'TechCrunch', 'The Information', 'Axios', 'Bloomberg', 'Inc.'];

/* ─── Sub-components ─────────────────────────────────── */
function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="flex-1 min-w-0 rounded-2xl p-6 border"
      style={{ background: WHITE, borderColor: `${NAVY}1A` }}
    >
      <p className="text-3xl font-bold tracking-tight mb-1" style={{ color: NAVY }}>{value}</p>
      <p className="text-sm text-[#475569]">{label}</p>
    </div>
  );
}

function LeaderCard({ name, title, initials }: { name: string; title: string; initials: string }) {
  return (
    <div
      className="group rounded-2xl border p-6 flex flex-col items-center text-center gap-4 transition-all duration-200"
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
      {/* Avatar */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ring-2"
        style={{ background: NAVY, color: WHITE, ringColor: PURPLE }}
      >
        {initials}
      </div>
      <div>
        <p className="font-semibold text-sm" style={{ color: NAVY }}>{name}</p>
        <p className="text-xs text-[#94A3B8] mt-0.5">{title}</p>
      </div>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-200"
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
      <div>
        <p className="font-semibold mb-1.5 tracking-tight" style={{ color: NAVY }}>{title}</p>
        <p className="text-sm text-[#475569] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export function AboutUsPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: WHITE, color: NAVY, fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* ══ HERO ═══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden pt-28 pb-24 px-6"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -5%, ${PURPLE}22 0%, transparent 68%), ${WHITE}`,
        }}
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: PURPLE }}>
            About Delt
          </p>
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-3xl"
            style={{ color: NAVY, lineHeight: 1.04 }}
          >
            Building the economic backbone of Main Street.
          </h1>
          <p className="text-lg text-[#475569] max-w-xl mb-10 leading-relaxed">
            Delt exists because running a business is already hard enough. We handle the rest.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: PURPLE, color: WHITE }}
            >
              See open roles <ArrowRight size={14} />
            </a>
            <a
              href="#our-story"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border transition-all"
              style={{ color: NAVY, borderColor: `${NAVY}33`, background: 'transparent' }}
            >
              Our story
            </a>
          </div>
        </div>
      </section>

      {/* ══ NUMBERS ════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: BG }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(s => <StatTile key={s.label} {...s} />)}
          </div>
          <p className="text-xs text-[#94A3B8] mt-4">As of Q1 2026. All figures approximate. Avg monthly savings based on a survey of merchants who switched from Square or Stripe; individual savings vary.</p>
        </div>
      </section>

      {/* ══ OUR STORY ══════════════════════════════════════════ */}
      <section id="our-story" className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2
              className="text-4xl font-bold tracking-tight sticky top-24"
              style={{ color: NAVY }}
            >
              Our story
            </h2>
          </div>
          <div className="flex flex-col gap-6 text-[#475569] leading-relaxed">
            <p>
              Delt was founded in 2019 by a team of former small-business operators who were tired of stitching together seven different tools to run a single shop. We started with payments — fast, fair, transparent — and kept hearing the same thing from our first thousand merchants: "Great, what else can you do?"
            </p>
            <p>
              Today we're a team of 180 people headquartered in New York City, with a remote-first engineering team spread across the Americas and Europe. We serve more than 10,000 businesses — restaurants, salons, gyms, retailers, and professional-services firms — and together those businesses process over $2 billion in annual volume through Delt.
            </p>
            <p>
              We've expanded from payments into working capital, a website builder, an AI business advisor (Lens), and a full point-of-sale stack. But the mission hasn't changed: make the back office disappear so operators can focus on the work they actually love.
            </p>
          </div>
        </div>
      </section>

      {/* ══ LEADERSHIP ═════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: BG }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: PURPLE }}>
            Leadership
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-12" style={{ color: NAVY }}>
            The team building Delt
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {LEADERS.map(l => <LeaderCard key={l.name} {...l} />)}
          </div>
        </div>
      </section>

      {/* ══ VALUES ═════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: PURPLE }}>
            What we believe
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-12" style={{ color: NAVY }}>
            Our values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map(v => <ValueCard key={v.title} {...v} />)}
          </div>
        </div>
      </section>

      {/* ══ PRESS ══════════════════════════════════════════════ */}
      <section className="py-20 px-6 border-t border-b" style={{ borderColor: `${NAVY}1A`, background: BG }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-center mb-8 text-[#94A3B8]">
            As seen in
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
            {PRESS.map(pub => (
              <span
                key={pub}
                className="text-lg font-serif tracking-tight text-[#94A3B8] hover:text-[#475569] transition-colors cursor-default select-none"
              >
                {pub}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══════════════════════════════════════════ */}
      <section
        className="py-24 px-6 text-center"
        style={{
          background: `radial-gradient(ellipse 70% 80% at 50% 110%, ${PURPLE}20 0%, transparent 65%), ${WHITE}`,
        }}
      >
        <div className="max-w-xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: NAVY }}>
            Come build with us.
          </h2>
          <p className="text-[#475569] mb-8">
            We're hiring across engineering, product, design, and go-to-market. Remote-friendly.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: PURPLE, color: WHITE }}
          >
            See open roles <ArrowRight size={14} />
          </a>
        </div>
      </section>
    </div>
  );
}
