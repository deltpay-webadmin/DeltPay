import { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Clock, Mail } from 'lucide-react';
import { BusinessScene } from '../components/BusinessScene';

/* ─── Palette ────────────────────────────────────────── */
const NAVY      = '#041E42';
const NAVY_DEEP = '#041E42';
const PURPLE    = '#4945FF';
const PURPLE_HI = 'rgba(73,69,255,0.85)';
const WHITE     = '#FFFFFF';
const INK       = '#041E42';
const MUTED     = '#475569';
const HAIRLINE  = 'rgba(4,30,66,0.08)';

/* ─── Types ──────────────────────────────────────────── */
type Category = 'All' | 'Product' | 'Engineering' | 'Culture' | 'Customers' | 'Policy';

interface Post {
  id: number;
  category: Exclude<Category, 'All'>;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readMin: number;
}

/* ─── Data ───────────────────────────────────────────── */
const FEATURED: Post = {
  id: 0,
  category: 'Product',
  title: 'Why we rebuilt Capital for small business — and what we got wrong the first time.',
  excerpt:
    "The first version of Delt Capital was fast. It was also broken in ways we didn't fully see until our merchants started telling us — politely, then less politely. Here's what we learned, and how we rebuilt.",
  author: 'Avery Chen',
  date: 'Apr 18, 2026',
  readMin: 12,
};

const POSTS: Post[] = [
  {
    id: 1,
    category: 'Product',
    title: 'Shipping Lens AI: our first autonomous product.',
    excerpt: 'What it took to go from "AI assistant" to an agent that acts on your behalf.',
    author: 'Daniel Kim',
    date: 'Apr 11, 2026',
    readMin: 9,
  },
  {
    id: 2,
    category: 'Engineering',
    title: 'How we handle 3M transactions per hour.',
    excerpt: "A deep dive into the architecture powering Delt's payment processing at scale.",
    author: 'Marcus Webb',
    date: 'Apr 04, 2026',
    readMin: 14,
  },
  {
    id: 3,
    category: 'Customers',
    title: "Inside Roma Trattoria's 3× sales year.",
    excerpt: 'How a family-run Italian restaurant tripled revenue with Delt Payments and Capital.',
    author: 'Zara Okafor',
    date: 'Mar 28, 2026',
    readMin: 7,
  },
  {
    id: 4,
    category: 'Culture',
    title: 'Why we write before we code.',
    excerpt: "Every feature at Delt starts with a one-pager. Here's why that makes us faster, not slower.",
    author: 'Elena Rodriguez',
    date: 'Mar 21, 2026',
    readMin: 6,
  },
  {
    id: 5,
    category: 'Policy',
    title: 'On the new SMB lending disclosures.',
    excerpt: 'What the latest regulatory changes mean for merchants — and how Delt is responding.',
    author: 'Priya Patel',
    date: 'Mar 14, 2026',
    readMin: 8,
  },
  {
    id: 6,
    category: 'Product',
    title: 'Designing for distracted operators.',
    excerpt: 'Most software is designed for focused users. Our merchants are anything but.',
    author: 'Daniel Kim',
    date: 'Mar 07, 2026',
    readMin: 10,
  },
  {
    id: 7,
    category: 'Engineering',
    title: 'Our approach to zero-downtime migrations.',
    excerpt: 'Shipping database schema changes without ever taking the system offline.',
    author: 'Marcus Webb',
    date: 'Feb 28, 2026',
    readMin: 11,
  },
  {
    id: 8,
    category: 'Customers',
    title: 'How Bloom Salon cut no-shows by 40%.',
    excerpt: "A beauty studio in Portland used Delt's SMS reminders to transform its booking rate.",
    author: 'Zara Okafor',
    date: 'Feb 21, 2026',
    readMin: 5,
  },
  {
    id: 9,
    category: 'Product',
    title: 'The case against dashboards.',
    excerpt: "We removed half the charts from Lens and merchants loved it. Here's what we replaced them with.",
    author: 'Avery Chen',
    date: 'Feb 14, 2026',
    readMin: 8,
  },
];

const CATEGORIES: Category[] = ['All', 'Product', 'Engineering', 'Culture', 'Customers', 'Policy'];

const CATEGORY_COLOR: Record<Exclude<Category, 'All'>, string> = {
  Product:     PURPLE,
  Engineering: '#0B6CF0',
  Culture:     '#B45309',
  Customers:   '#0E8A5F',
  Policy:      NAVY,
};

/* ─── Sub-components ─────────────────────────────────── */

function CategoryCover({ post, className = '' }: { post: Post; className?: string }) {
  const { category } = post;

  // Customers → real BusinessScene photo
  if (category === 'Customers') {
    const customerTheme =
      post.title.includes('Roma')  ? 'restaurant' :
      post.title.includes('Bloom') ? 'salon' :
      'cafe';
    const initials = post.title.includes('Roma') ? 'RT' : post.title.includes('Bloom') ? 'BS' : 'BW';
    const biz      = post.title.includes('Roma') ? 'Roma Trattoria' : post.title.includes('Bloom') ? 'Bloom Salon' : 'Blue Wren Coffee';
    return (
      <div className={className} style={{ overflow: 'hidden' }}>
        <BusinessScene
          theme={customerTheme as any}
          initials={initials}
          businessName={biz}
          location="Customer story"
          aspect="landscape"
          variant="navy"
          className="w-full h-full !rounded-none"
        />
      </div>
    );
  }

  // Product → stylised UI mockup
  if (category === 'Product') {
    return (
      <div
        className={className}
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #0a1638 60%, ${PURPLE} 160%)`,
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle at 80% 20%, ${PURPLE_HI}55 0%, transparent 55%)`,
          }}
        />
        {/* browser window */}
        <div style={{
          position: 'absolute', left: '10%', top: '18%', right: '10%', bottom: '18%',
          background: WHITE, borderRadius: 10,
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.45)', overflow: 'hidden',
        }}>
          <div style={{ height: 14, background: '#F6F7FB', display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: '#ff5f57' }} />
            <span style={{ width: 5, height: 5, borderRadius: 99, background: '#febc2e' }} />
            <span style={{ width: 5, height: 5, borderRadius: 99, background: '#28c840' }} />
          </div>
          <div style={{ padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ background: `${PURPLE}14`, borderRadius: 5, padding: '6px 7px' }}>
              <div style={{ width: 18, height: 3, background: `${PURPLE}80`, borderRadius: 2, marginBottom: 3 }} />
              <div style={{ width: 34, height: 7, background: NAVY, borderRadius: 2 }} />
            </div>
            <div style={{ background: `${NAVY}10`, borderRadius: 5, padding: '6px 7px' }}>
              <div style={{ width: 14, height: 3, background: `${NAVY}60`, borderRadius: 2, marginBottom: 3 }} />
              <div style={{ width: 28, height: 7, background: PURPLE, borderRadius: 2 }} />
            </div>
            <div style={{ gridColumn: 'span 2', background: '#F6F7FB', borderRadius: 5, height: 26, position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <path d="M0 22 L15 18 L30 20 L45 12 L60 14 L75 6 L100 10" stroke={PURPLE} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M0 22 L15 18 L30 20 L45 12 L60 14 L75 6 L100 10 L100 30 L0 30 Z" fill={`${PURPLE}20`} />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Engineering → terminal/code feel
  if (category === 'Engineering') {
    return (
      <div
        className={className}
        style={{
          background: 'linear-gradient(135deg, #060e22 0%, #0a1628 100%)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${PURPLE}14 1px, transparent 1px), linear-gradient(90deg, ${PURPLE}14 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
        }} />
        <div style={{
          position: 'absolute', left: '8%', right: '8%', top: '16%', bottom: '16%',
          background: '#0b1026', borderRadius: 8,
          border: `1px solid ${PURPLE}40`,
          boxShadow: `0 0 0 1px ${PURPLE}20, 0 20px 40px -10px rgba(0,0,0,0.6)`,
          padding: 10,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 9, lineHeight: 1.45, color: '#94A3B8', overflow: 'hidden',
        }}>
          <div style={{ color: '#6D68FF' }}>$ deploy --region us-east-1</div>
          <div>✓ build succeeded <span style={{ color: '#28c840' }}>2.1s</span></div>
          <div>✓ tests passed <span style={{ color: '#28c840' }}>128/128</span></div>
          <div style={{ color: WHITE }}>→ rolling out <span style={{ color: PURPLE }}>v2026.04</span></div>
          <div style={{ color: '#6D68FF' }}>█</div>
        </div>
      </div>
    );
  }

  // Culture → notebook / handwritten
  if (category === 'Culture') {
    return (
      <div
        className={className}
        style={{
          background: `linear-gradient(160deg, #f3f1ff 0%, ${WHITE} 60%)`,
          position: 'relative', overflow: 'hidden',
        }}
      >
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            position: 'absolute', left: '10%', right: '10%',
            top: `${22 + i * 14}%`, height: 1, background: `${NAVY}10`,
          }} />
        ))}
        <div style={{
          position: 'absolute', left: '8%', top: '-5%',
          fontFamily: 'Georgia, serif', fontSize: 120, lineHeight: 1,
          color: `${PURPLE}30`, fontWeight: 700,
        }}>&ldquo;</div>
        <svg viewBox="0 0 200 80" style={{ position: 'absolute', right: '8%', bottom: '12%', width: '55%' }}>
          <path d="M10 50 Q 40 10, 80 40 T 160 30" stroke={PURPLE} strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="162" cy="29" r="4" fill={PURPLE} />
        </svg>
      </div>
    );
  }

  // Policy → document with seal
  return (
    <div
      className={className}
      style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #1a3060 100%)`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', left: '14%', top: '18%', width: '42%', bottom: '18%',
        background: WHITE, borderRadius: 4,
        boxShadow: '0 10px 30px -6px rgba(0,0,0,0.5)',
        padding: 10,
      }}>
        <div style={{ width: '70%', height: 4, background: NAVY, borderRadius: 2, marginBottom: 6 }} />
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{ width: `${60 + (i * 7) % 35}%`, height: 2, background: `${NAVY}40`, borderRadius: 1, marginBottom: 3 }} />
        ))}
        <div style={{ width: 22, height: 22, border: `2px solid ${PURPLE}`, borderRadius: 99, position: 'absolute', right: 8, bottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: PURPLE, transform: 'rotate(-12deg)' }}>SEAL</div>
      </div>
      <div style={{ position: 'absolute', right: '10%', bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 4, opacity: 0.4 }}>
        {[40, 50, 60, 50, 40].map((h, i) => (
          <div key={i} style={{ width: 8, height: h, background: WHITE, borderRadius: '2px 2px 0 0' }} />
        ))}
        <div style={{ position: 'absolute', left: -4, right: -4, bottom: 60, height: 4, background: WHITE, borderRadius: 1 }} />
      </div>
    </div>
  );
}

function CategoryPill({ category, small = false, onDark = false }: {
  category: Exclude<Category, 'All'>;
  small?: boolean;
  onDark?: boolean;
}) {
  const color = CATEGORY_COLOR[category];
  const size = small ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const bg = onDark ? `${WHITE}1f` : `${color}14`;
  const txt = onDark ? WHITE : color;
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wide ${size}`}
      style={{
        background: bg,
        color: txt,
        boxShadow: onDark ? 'inset 0 0 0 1px rgba(255,255,255,0.24)' : `inset 0 0 0 1px ${color}26`,
      }}
    >
      {category}
    </span>
  );
}

function AuthorRow({ author, date, readMin, muted = false }: {
  author: string; date: string; readMin: number; muted?: boolean;
}) {
  const initials = author.split(' ').map(p => p[0]).join('').slice(0, 2);
  return (
    <div className="flex items-center gap-2.5 text-xs" style={{ color: muted ? '#94A3B8' : MUTED }}>
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)`,
          color: WHITE,
        }}
      >
        {initials}
      </span>
      <span className="font-semibold" style={{ color: muted ? '#CBD5E1' : NAVY }}>{author}</span>
      <span>·</span>
      <span>{date}</span>
      <span>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock size={11} strokeWidth={2.25} />
        {readMin} min read
      </span>
    </div>
  );
}

function ArticleCard({ post }: { post: Post }) {
  return (
    <article
      className="group rounded-2xl flex flex-col overflow-hidden transition-all duration-200 cursor-pointer bg-white"
      style={{
        boxShadow: `inset 0 0 0 1px ${HAIRLINE}, 0 1px 0 rgba(4,30,66,0.02)`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          `inset 0 0 0 1px ${PURPLE}4D, 0 24px 48px -20px rgba(4,30,66,0.2), 0 0 0 4px ${PURPLE}14`;
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          `inset 0 0 0 1px ${HAIRLINE}, 0 1px 0 rgba(4,30,66,0.02)`;
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      <CategoryCover post={post} className="h-44" />
      <div className="p-6 flex flex-col gap-3 flex-1">
        <CategoryPill category={post.category} small />
        <h3
          className="text-[17px] font-bold tracking-tight leading-snug transition-colors"
          style={{ color: NAVY }}
        >
          {post.title}
        </h3>
        <p className="text-sm leading-relaxed flex-1" style={{ color: MUTED }}>
          {post.excerpt}
        </p>
        <div className="pt-4 mt-2 border-t" style={{ borderColor: HAIRLINE }}>
          <AuthorRow author={post.author} date={post.date} readMin={post.readMin} />
        </div>
      </div>
    </article>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filteredPosts = useMemo(
    () => (activeCategory === 'All' ? POSTS : POSTS.filter(p => p.category === activeCategory)),
    [activeCategory],
  );

  return (
    <div style={{ background: WHITE, color: INK, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ══ DARK HERO + FEATURED ══════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: NAVY_DEEP, color: WHITE }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              `radial-gradient(55% 80% at 15% 0%, ${PURPLE}66 0%, transparent 55%),` +
              `radial-gradient(45% 75% at 90% 30%, ${PURPLE_HI}33 0%, transparent 60%),` +
              `radial-gradient(90% 60% at 50% 120%, ${NAVY} 0%, transparent 70%)`,
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

        <div className="relative max-w-6xl mx-auto px-6 pt-28 md:pt-36 pb-16 md:pb-20">
          <div className="flex items-center gap-2 mb-6">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#E0DCFF',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)',
              }}
            >
              From the team
            </span>
          </div>
          <h1
            className="font-bold tracking-[-0.02em] max-w-4xl"
            style={{
              fontSize: 'clamp(2.5rem, 5.6vw, 4.75rem)',
              lineHeight: 1.03,
              color: WHITE,
            }}
          >
            Essays, dispatches,
            <br />
            <span
              style={{
                background: `linear-gradient(90deg, ${WHITE} 0%, #C4BEFF 60%, ${PURPLE_HI} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontStyle: 'italic',
              }}
            >
              and product stories.
            </span>
          </h1>
          <p
            className="mt-6 text-lg md:text-xl max-w-xl leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.72)' }}
          >
            The people building Delt, writing about how and why.
          </p>
        </div>

        {/* ── Featured article — dark card that lives inside the hero ── */}
        <div className="relative max-w-6xl mx-auto px-6 pb-24">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-5"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Editor&rsquo;s pick
          </p>
          <a
            href="#"
            className="group block rounded-3xl overflow-hidden transition-all duration-300 grid md:grid-cols-[1.1fr_1fr]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1), 0 40px 80px -30px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Left: illustrated capital scene */}
            <div
              className="relative min-h-72 md:min-h-0 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, #0a1638 55%, ${PURPLE} 140%)`,
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 85% 20%, ${PURPLE}66 0%, transparent 55%)`,
                }}
              />
              {/* Capital offer card */}
              <div
                className="absolute right-6 top-8 rounded-2xl p-4 w-52 transition-transform duration-500 group-hover:-translate-y-1"
                style={{
                  background: 'rgba(255,255,255,0.98)',
                  boxShadow: '0 20px 40px -12px rgba(0,0,0,0.4)',
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: PURPLE }}>
                  Capital offer
                </p>
                <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: NAVY }}>
                  $42,000
                </p>
                <div className="mt-3 h-1.5 rounded-full" style={{ background: `${NAVY}14` }}>
                  <div className="h-1.5 rounded-full" style={{ width: '68%', background: `linear-gradient(90deg, ${PURPLE} 0%, ${PURPLE_HI} 100%)` }} />
                </div>
                <p className="mt-2 text-[10px] font-medium" style={{ color: MUTED }}>
                  68% of offer used · 12 months
                </p>
              </div>
              {/* Funded badge */}
              <div
                className="absolute right-6 top-44 rounded-xl px-3 py-2 flex items-center gap-2 transition-transform duration-500 group-hover:-translate-y-1"
                style={{
                  background: 'rgba(255,255,255,0.94)',
                  boxShadow: '0 10px 24px -8px rgba(0,0,0,0.3)',
                }}
              >
                <span
                  className="w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-bold"
                  style={{ background: `${PURPLE}22`, color: PURPLE }}
                >
                  ✓
                </span>
                <span className="text-[11px] font-semibold" style={{ color: NAVY }}>
                  Funded in 24h
                </span>
              </div>

              {/* Floor tag */}
              <div className="absolute left-8 bottom-8">
                <CategoryPill category={FEATURED.category} onDark />
              </div>
            </div>

            {/* Right: text */}
            <div className="p-8 md:p-10 flex flex-col gap-5">
              <h2
                className="font-bold tracking-[-0.015em]"
                style={{
                  color: WHITE,
                  fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
                  lineHeight: 1.15,
                }}
              >
                {FEATURED.title}
              </h2>
              <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
                {FEATURED.excerpt}
              </p>
              <div className="mt-auto pt-4 border-t flex items-center justify-between gap-4 flex-wrap" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <AuthorRow author={FEATURED.author} date={FEATURED.date} readMin={FEATURED.readMin} muted />
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-transform group-hover:translate-x-1"
                  style={{ color: PURPLE_HI }}
                >
                  Read the essay
                  <ArrowRight size={14} strokeWidth={2.5} />
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* soft transition to white */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${WHITE})` }}
        />
      </section>

      {/* ══ STICKY CATEGORY BAR ═══════════════════════════════ */}
      <div
        className="sticky top-0 z-20 backdrop-blur-md"
        style={{
          background: 'rgba(255,255,255,0.86)',
          borderBottom: `1px solid ${HAIRLINE}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              {CATEGORIES.map(cat => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="flex-shrink-0 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
                    style={
                      active
                        ? { background: NAVY, color: WHITE }
                        : { color: MUTED, background: 'transparent' }
                    }
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            <p className="hidden sm:block text-xs font-medium" style={{ color: '#94A3B8' }}>
              <span style={{ color: NAVY, fontWeight: 700 }}>{filteredPosts.length}</span> essays
            </p>
          </div>
        </div>
      </div>

      {/* ══ ARTICLE GRID ══════════════════════════════════════ */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {filteredPosts.map(post => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <div
            className="mt-16 flex items-center justify-center gap-8 text-sm"
            style={{ color: MUTED }}
          >
            <button
              className="inline-flex items-center gap-1.5 opacity-40 cursor-default"
              disabled
            >
              <ArrowLeft size={14} /> Previous
            </button>
            <span className="flex items-center gap-2">
              {[1, 2, 3].map(n => (
                <span
                  key={n}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold"
                  style={
                    n === 1
                      ? { background: NAVY, color: WHITE }
                      : { color: MUTED, background: 'transparent' }
                  }
                >
                  {n}
                </span>
              ))}
            </span>
            <button
              className="inline-flex items-center gap-1.5 font-semibold transition-colors"
              style={{ color: PURPLE }}
            >
              Next <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </section>

      {/* ══ NEWSLETTER — dark band ════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: NAVY }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              `radial-gradient(50% 100% at 90% 50%, ${PURPLE}40 0%, transparent 55%),` +
              `radial-gradient(40% 80% at 10% 10%, ${PURPLE_HI}2a 0%, transparent 60%)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mail size={16} strokeWidth={2.5} style={{ color: PURPLE_HI }} />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: PURPLE_HI }}>
                The Delt Dispatch
              </p>
            </div>
            <h2
              className="font-bold tracking-[-0.015em]"
              style={{
                fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
                lineHeight: 1.1,
                color: WHITE,
              }}
            >
              Never miss a post.
            </h2>
            <p className="mt-4 text-base md:text-lg leading-relaxed max-w-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
              One thoughtful email every other week. Essays, product stories, and the occasional engineering deep dive.
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
