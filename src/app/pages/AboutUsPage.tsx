import { useState } from 'react';
import { Heart, Compass, ShieldCheck, Rocket, ArrowRight, MapPin, Users, Building2 } from 'lucide-react';
import pillarOxygen     from '@/app/assets/about/pillar-01_oxygen.jpg';
import pillarMainStreet from '@/app/assets/about/pillar-02_mainstreet.jpg';
import pillarBanks      from '@/app/assets/about/pillar-03_banks.jpg';
import pillarAccess     from '@/app/assets/about/pillar-04_access.jpg';

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
  { value: '<1 Day',  label: 'Go live on Payments',        sub: 'Median onboarding' },
  { value: '$847',    label: 'Avg. monthly savings',       sub: 'vs. Square / Stripe' },
  { value: '$50M',    label: 'Capital deployed',           sub: 'Since 2019' },
  { value: '97%',     label: 'Merchant retention',         sub: 'Twelve-month' },
];

const VALUES = [
  { icon: Heart,       title: 'Operators first.',     description: 'Every product decision starts with one question: does this make running a business easier?' },
  { icon: Compass,     title: 'Honest by default.',   description: 'We tell merchants the truth about fees, terms, and eligibility — even when it costs us the deal.' },
  { icon: ShieldCheck, title: 'Secure by design.',    description: 'Security is baked into every layer, not bolted on after. PCI, SOC 2, and passkeys are table stakes.' },
  { icon: Rocket,      title: 'Ship weekly.',         description: 'Momentum compounds. Our changelog is our north star — something ships every Friday.' },
];

const PRESS = ['Forbes', 'TechCrunch', 'The Information', 'Axios', 'Bloomberg', 'Inc.'];

const PILLARS = [
  {
    k: '01',
    t: 'Capital is the operator’s oxygen',
    d: 'Small businesses run on timing. The right capital at the right week is the difference between hiring, opening a second location, or stalling out. Speed isn’t a luxury — it’s the product.',
    img: pillarOxygen,
    tags: ['Speed', 'Cash flow', 'Growth'],
  },
  {
    k: '02',
    t: 'Main Street is the engine of the economy',
    d: 'Small businesses generate roughly half of US private-sector GDP and create the majority of net new jobs. Every dollar that lands in an operator’s account multiplies through payroll, suppliers, and local communities.',
    img: pillarMainStreet,
    tags: ['SMB', 'Jobs', 'GDP'],
  },
  {
    k: '03',
    t: 'Banks were never built for this',
    d: 'Legacy underwriting was designed for collateral and decade-long relationships, not for a roofer who needs a truck by Friday. A modern processor has to read live cash flow, not a paper file.',
    img: pillarBanks,
    tags: ['Legacy', 'Friction', 'Collateral'],
  },
  {
    k: '04',
    t: 'Closing the access gap is the work',
    d: 'Most credit-worthy operators in this country still get a “no” from the bank — usually for reasons that have nothing to do with their actual business. Our job is to give those operators a real, fairly-priced answer in hours.',
    img: pillarAccess,
    tags: ['Access', 'Fair pricing', 'Operators'],
  },
];

function PillarGallery() {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-row gap-2.5 w-full" style={{ height: 460 }}>
      {PILLARS.map((p, i) => {
        const isActive = i === active;
        return (
          <div
            key={p.k}
            role="button"
            tabIndex={0}
            aria-pressed={isActive}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            style={{
              position: 'relative',
              flex: isActive ? '1 1 0' : '0 0 88px',
              minWidth: 88,
              borderRadius: 18,
              overflow: 'hidden',
              cursor: 'pointer',
              outline: 'none',
              transition: 'flex 520ms cubic-bezier(0.22,1,0.36,1)',
              boxShadow: isActive
                ? '0 18px 40px rgba(4,30,66,0.22)'
                : '0 6px 14px rgba(4,30,66,0.10)',
            }}
          >
            <img
              src={p.img}
              alt=""
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover',
                filter: isActive ? 'none' : 'saturate(0.85) brightness(0.9)',
                transition: 'filter 520ms ease',
              }}
            />
            <div
              style={{
                position: 'absolute', inset: 0,
                background: isActive
                  ? 'linear-gradient(180deg, rgba(4,30,66,0.08) 0%, rgba(4,30,66,0.18) 45%, rgba(8,10,40,0.82) 100%)'
                  : 'linear-gradient(180deg, rgba(8,10,40,0.45) 0%, rgba(8,10,40,0.78) 100%)',
                transition: 'background 520ms ease',
              }}
            />
            {!isActive && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  fontSize: 15, fontWeight: 600,
                  color: WHITE,
                  letterSpacing: '-0.01em',
                  textShadow: '0 1px 2px rgba(0,0,0,0.35)',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.18em', color: '#C5C3EE',
                  }}>{p.k}</span>
                  <span style={{
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', maxHeight: 320,
                  }}>{p.t}</span>
                </div>
              </div>
            )}
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0,
              padding: '24px 28px 28px',
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 360ms ease 120ms, transform 360ms ease 120ms',
              pointerEvents: isActive ? 'auto' : 'none',
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11, fontWeight: 600,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#C5C3EE', marginBottom: 8,
              }}>{p.k} · Pillar</div>
              <h3 style={{
                margin: '0 0 10px',
                fontSize: 26, fontWeight: 700,
                color: WHITE, letterSpacing: '-0.02em', lineHeight: 1.2,
                maxWidth: 540,
              }}>{p.t}</h3>
              <p style={{
                margin: '0 0 14px',
                fontSize: 15, lineHeight: 1.55,
                color: 'rgba(255,255,255,0.88)',
                maxWidth: 560,
              }}>{p.d}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {p.tags.map((tag) => (
                  <span key={tag} style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    fontSize: 11, fontWeight: 500,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: WHITE,
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    backdropFilter: 'blur(4px)',
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const COMPANY_FACTS = [
  { icon: Building2, label: 'Headquartered',   value: 'New York City' },
  { icon: Users,     label: 'People',          value: '180 and growing' },
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
    <div style={{ background: WHITE, color: INK, fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>

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
            Building the economic backbone
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
            Delt exists because running a business is already hard enough. We handle the payments, the capital, the website, the books — so operators can focus on the work they actually love.
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
              style={{ color: NAVY, fontSize: 'clamp(1.5rem, 4vw, 3.25rem)', lineHeight: 1.1, overflowWrap: 'break-word', wordBreak: 'break-word' }}
            >
              We started with payments.
              <br />
              <span style={{ color: MUTED, fontWeight: 400 }}>We stayed for the rest of the back office.</span>
            </h2>
          </div>

          <div className="flex flex-col gap-7 text-[17px] leading-[1.7]" style={{ color: '#334155' }}>
            <p>
              Delt was founded in 2019 by a team of former small-business operators who were tired of stitching together seven different tools to run a single shop. We started with payments — fast, fair, transparent — and kept hearing the same thing from our first thousand merchants: <em>&ldquo;Great, what else can you do?&rdquo;</em>
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
              Today we&rsquo;re 180 people headquartered in New York City, with a remote-first engineering team spread across the Americas and Europe. We serve more than 10,000 businesses — restaurants, salons, gyms, retailers, and professional-services firms — processing over $2 billion in annual volume.
            </p>
            <p>
              We&rsquo;ve expanded from payments into working capital, a website builder, an AI business advisor (Lens), and a full point-of-sale stack. The surface area has grown; the mission hasn&rsquo;t changed. Make the back office disappear so operators can focus on the work they actually love.
            </p>
          </div>
        </div>
      </section>

      {/* PILLARS — hover-accordion gallery with images */}
      <section className="relative py-24 px-6" style={{ background: WHITE }}>
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: PURPLE }}>
              Why business lending
            </p>
            <h2
              className="font-bold tracking-[-0.015em]"
              style={{ color: NAVY, fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)', lineHeight: 1.08 }}
            >
              Capital is what turns small
              <br />
              businesses into big ones.
            </h2>
            <p className="mt-5 text-base leading-relaxed" style={{ color: MUTED, maxWidth: 620 }}>
              Small businesses are the economy. They employ nearly half of America, create most of
              its new jobs, and keep main streets standing. Modern, fairly-priced merchant services
              and lending are how those operators turn a good week into a growth year.
            </p>
          </div>
          <PillarGallery />
        </div>
      </section>

      {/* VALUES — dark panel */}
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
            We&rsquo;re hiring across engineering, product, design, and go-to-market. Remote-friendly, competitive comp, real equity.
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
