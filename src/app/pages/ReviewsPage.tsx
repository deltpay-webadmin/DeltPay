import { Star, ArrowRight } from 'lucide-react';

/* ─── Palette ────────────────────────────────────────── */
const NAVY   = '#041E42';
const PURPLE = '#4945FF';
const WHITE  = '#FFFFFF';
const BG     = '#F6F7FB';

/* ─── Data ───────────────────────────────────────────── */
const STATS = [
  { value: '10,000+',  label: 'Businesses' },
  { value: '$50M+',    label: 'Capital deployed' },
  { value: '4.9/5',    label: 'Avg rating' },
  { value: '97%',      label: 'Retention' },
];

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  business: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Switching to Delt Payments took an afternoon. We went from T+3 settlements to same-day deposits and haven't looked back.",
    name: 'Carlos Mendez',
    role: 'Owner',
    business: 'Northside Auto',
  },
  {
    quote: "Lens AI noticed a 22% spike in Tuesday evening sales we'd never seen ourselves. It just told us, unprompted. That's the tool I wanted for years.",
    name: 'Jess Park',
    role: 'Co-founder',
    business: 'Tangerine Studio',
  },
  {
    quote: "The Capital offer popped up in my dashboard. I applied at 9am and had the funds clearing by 3pm. I've never experienced anything like it with a bank.",
    name: 'Dmitri Volkov',
    role: 'Proprietor',
    business: 'Oak & Ember',
  },
  {
    quote: 'We run 3 locations. The multi-site POS view is the only reason I can leave the main store and not lose my mind.',
    name: 'Anika Johnson',
    role: 'Founder',
    business: 'Pico Pilates',
  },
  {
    quote: 'Delt built our website in a day — not an exaggeration. The builder is genuinely good, the SEO works, and it costs less than our old WordPress plugin stack. (Simple single-page site.)',
    name: 'Sam Torres',
    role: 'Creative Director',
    business: 'Vista Vintage',
  },
  {
    quote: "Chargebacks used to eat 2 hours a week. With Delt's evidence-builder and auto-responses, we handle them in 10 minutes. I can't explain how much that matters.",
    name: 'Fatima Nkosi',
    role: 'Operations Lead',
    business: 'Atlas Apothecary',
  },
];

const CASE_STUDIES = [
  {
    business: 'Roma Trattoria',
    metric: '+38% avg ticket',
    description: "How an NYC family trattoria drove bigger checks with Delt's smart upsell prompts.",
    gradientFrom: NAVY,
    gradientTo: '#1a3060',
  },
  {
    business: 'Bloom Salon',
    metric: '–2 hr/week ops',
    description: 'Automated booking reminders and digital intake forms gave the team back their mornings.',
    gradientFrom: PURPLE,
    gradientTo: '#2a2680',
  },
  {
    business: 'Blue Wren Coffee',
    metric: '$18k in Q1 capital',
    description: 'A seasonal espresso bar used Delt Capital to stock up ahead of their busiest quarter.',
    gradientFrom: '#0a1628',
    gradientTo: NAVY,
  },
];

const LOGOS = [
  'Flour & Salt',    'Bloom Salon',
  'Roma Trattoria',  'Riverside Dental',
  'Northside Auto',  'Tangerine Studio',
  'Pico Pilates',    'Oak & Ember',
  'Blue Wren Coffee','Granite Gym',
  'Atlas Apothecary','Vista Vintage',
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

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="flex-1 min-w-0 rounded-2xl border p-6 text-center"
      style={{ background: WHITE, borderColor: `${NAVY}1A` }}
    >
      <p className="text-3xl font-bold tracking-tight mb-1" style={{ color: NAVY }}>{value}</p>
      <p className="text-sm text-[#475569]">{label}</p>
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
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
      <Stars />
      <p className="text-sm text-[#475569] leading-relaxed flex-1">"{t.quote}"</p>
      <div>
        <p className="text-sm font-semibold" style={{ color: NAVY }}>{t.name}</p>
        <p className="text-xs text-[#94A3B8]">{t.role} · {t.business}</p>
      </div>
    </div>
  );
}

function CaseStudyCard({
  business,
  metric,
  description,
  gradientFrom,
  gradientTo,
}: {
  business: string;
  metric: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <div
      className="group rounded-3xl overflow-hidden border flex flex-col transition-all duration-200 cursor-pointer"
      style={{ borderColor: `${NAVY}1A` }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${PURPLE}66`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 3px ${PURPLE}14`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${NAVY}1A`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Gradient thumb */}
      <div
        className="h-36 flex items-end p-5"
        style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
      >
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: `${PURPLE}CC`, color: WHITE }}
        >
          {metric}
        </span>
      </div>
      {/* Content */}
      <div className="p-5 flex flex-col gap-2 flex-1" style={{ background: WHITE }}>
        <p className="font-semibold text-sm tracking-tight" style={{ color: NAVY }}>{business}</p>
        <p className="text-xs text-[#475569] leading-relaxed flex-1">{description}</p>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-xs font-semibold transition-colors mt-1"
          style={{ color: PURPLE }}
        >
          Read story <ArrowRight size={12} />
        </a>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export function ReviewsPage() {
  return (
    <div
      style={{ background: WHITE, color: NAVY, fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* ══ HERO ═══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden pt-28 pb-20 px-6"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -5%, ${PURPLE}22 0%, transparent 68%), ${WHITE}`,
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: PURPLE }}>
            Customer stories
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight mb-5"
            style={{ color: NAVY, lineHeight: 1.08 }}
          >
            Trusted by the businesses we serve.
          </h1>
          <p className="text-lg text-[#475569] max-w-xl mx-auto">
            Hear from real operators using Delt every day.
          </p>
        </div>
      </section>

      {/* ══ BY THE NUMBERS ═════════════════════════════════════ */}
      <section className="py-16 px-6" style={{ background: BG }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(s => <StatTile key={s.label} {...s} />)}
          </div>
          <p className="text-xs text-[#94A3B8] mt-4">As of Q1 2026. Rating based on verified app store reviews. Retention and capital figures are approximate. Individual results vary.</p>
        </div>
      </section>

      {/* ══ FEATURED TESTIMONIAL ═══════════════════════════════ */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-3xl p-10 md:p-14 relative overflow-hidden"
            style={{ background: NAVY }}
          >
            {/* Purple accent bar */}
            <div
              className="absolute left-0 top-10 bottom-10 w-1 rounded-r-full"
              style={{ background: PURPLE }}
            />
            <p
              className="text-2xl md:text-3xl font-bold tracking-tight leading-snug max-w-2xl"
              style={{ color: WHITE }}
            >
              "Our payout hits the bank before the coffee's brewed."
            </p>
            <p className="mt-6 text-sm font-medium" style={{ color: `${PURPLE}CC` }}>
              — Maya Reyes, Co-owner, Flour &amp; Salt Bakery
            </p>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIAL GRID ═══════════════════════════════════ */}
      <section className="py-16 px-6" style={{ background: BG }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: PURPLE }}>
            Reviews
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-10" style={{ color: NAVY }}>
            What merchants are saying
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map(t => <TestimonialCard key={t.name} t={t} />)}
          </div>
        </div>
      </section>

      {/* ══ CASE STUDIES ═══════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: PURPLE }}>
            Case studies
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-10" style={{ color: NAVY }}>
            Deep dives
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {CASE_STUDIES.map(cs => (
              <CaseStudyCard key={cs.business} {...cs} />
            ))}
          </div>
        </div>
      </section>

      {/* Mid-page CTA after testimonials */}
      <section className="py-12 px-6 text-center">
        <a
          href="#"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: PURPLE, color: WHITE }}
        >
          Ready to join them? Create a free account <ArrowRight size={14} />
        </a>
      </section>

      {/* ══ LOGO WALL ══════════════════════════════════════════ */}
      <section
        className="py-16 px-6 border-t border-b"
        style={{ background: BG, borderColor: `${NAVY}1A` }}
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-center mb-10 text-[#94A3B8]">
            Businesses on Delt
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
            {LOGOS.map(logo => (
              <div
                key={logo}
                className="rounded-xl border flex items-center justify-center p-3 text-center"
                style={{ background: WHITE, borderColor: `${NAVY}1A` }}
              >
                <span className="text-xs font-semibold text-[#94A3B8] leading-tight">{logo}</span>
              </div>
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
            Join them.
          </h2>
          <p className="text-[#475569] mb-8">
            Create a free account and see why 10,000+ businesses run on Delt.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: PURPLE, color: WHITE }}
          >
            Create a free account <ArrowRight size={14} />
          </a>
        </div>
      </section>
    </div>
  );
}
