import { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Clock, Mail } from 'lucide-react';

import featuredImg     from '../assets/blog/blog_0_featured_capital.png';
import coffeeImg       from '../assets/blog/blog_1_lens_ai.png';
import floristImg      from '../assets/blog/blog_2_transactions.png';
import romaImg         from '../assets/blog/blog_3_roma_trattoria.png';
import bookstoreImg    from '../assets/blog/blog_4_write_before_code.png';
import butcherImg      from '../assets/blog/blog_5_lending_disclosures.png';
import foodTruckImg    from '../assets/blog/blog_6_distracted_operators.png';
import yogaImg         from '../assets/blog/blog_7_zero_downtime.png';
import salonImg        from '../assets/blog/blog_8_bloom_salon.png';
import gelatoImg       from '../assets/blog/blog_9_against_dashboards.png';

/* ─── Palette ────────────────────────────────────────── */
const NAVY      = '#041E42';
const NAVY_DEEP = '#020E22';
const PURPLE    = '#4945FF';
const PURPLE_HI = '#6D68FF';
const WHITE     = '#FFFFFF';
const INK       = '#0F172A';
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
  image: string;
  imageAlt: string;
}

/* ─── Data ───────────────────────────────────────────── */
const FEATURED: Post = {
  id: 0,
  category: 'Customers',
  title: 'How Hearth Bakery used $42K in capital to open a second location.',
  excerpt:
    "Funded in 24 hours off two years of deposits — not a credit score. Here's how a London sourdough shop went from one storefront to two without ever filling out a bank form.",
  author: 'Avery Chen',
  date: 'Apr 18, 2026',
  readMin: 12,
  image: featuredImg,
  imageAlt: 'Bakery owner reviewing capital offer on tablet beside sourdough loaves',
};

const POSTS: Post[] = [
  {
    id: 1,
    category: 'Customers',
    title: "Why North End Coffee replaced their old POS in a weekend.",
    excerpt: 'A two-location specialty coffee shop on what finally made tap-to-pay feel native.',
    author: 'Daniel Kim',
    date: 'Apr 11, 2026',
    readMin: 9,
    image: coffeeImg,
    imageAlt: 'Barista handing payment terminal to customer in a brick-walled coffee shop',
  },
  {
    id: 2,
    category: 'Customers',
    title: 'How Camellia Florals doubled wedding-season revenue.',
    excerpt: "A Brooklyn florist on using Delt Capital to pre-buy stems before peak season — and pay it back as orders cleared.",
    author: 'Marcus Webb',
    date: 'Apr 04, 2026',
    readMin: 14,
    image: floristImg,
    imageAlt: 'Florist wrapping a bouquet in kraft paper at a sunlit workbench',
  },
  {
    id: 3,
    category: 'Customers',
    title: "Inside Roma Trattoria's 3× sales year.",
    excerpt: 'How a family-run Italian restaurant tripled revenue with Delt Payments and Capital.',
    author: 'Zara Okafor',
    date: 'Mar 28, 2026',
    readMin: 7,
    image: romaImg,
    imageAlt: 'Italian restaurant owner pouring wine for a guest in a warmly lit trattoria',
  },
  {
    id: 4,
    category: 'Customers',
    title: "How Page & Press Books survived their slowest winter.",
    excerpt: "An indie bookstore-cafe on bridging six quiet weeks with revenue-based capital — and paying it back the moment foot traffic returned.",
    author: 'Elena Rodriguez',
    date: 'Mar 21, 2026',
    readMin: 6,
    image: bookstoreImg,
    imageAlt: 'Bookstore owner smiling with a book and coffee in a cozy bookstore-cafe',
  },
  {
    id: 5,
    category: 'Customers',
    title: "Why Marlowe & Sons Butchers switched processors after 22 years.",
    excerpt: 'A neighborhood butcher on getting funded for a new walk-in cooler in a single afternoon.',
    author: 'Priya Patel',
    date: 'Mar 14, 2026',
    readMin: 8,
    image: butcherImg,
    imageAlt: 'Butcher handing a wrapped paper package across the counter to a customer',
  },
  {
    id: 6,
    category: 'Customers',
    title: "How Mei's Dumpling Truck doubled stops in one summer.",
    excerpt: "A solo food-truck operator on using Delt Capital to add a second truck — and Delt Payments to never lose a sale to a dead reader.",
    author: 'Daniel Kim',
    date: 'Mar 07, 2026',
    readMin: 10,
    image: foodTruckImg,
    imageAlt: 'Food truck owner smiling as she hands food to a customer at golden hour',
  },
  {
    id: 7,
    category: 'Customers',
    title: 'How Anjali Yoga grew a single studio into three.',
    excerpt: "A boutique yoga studio on financing two expansions on deposit history alone — no personal guarantee, no collateral.",
    author: 'Marcus Webb',
    date: 'Feb 28, 2026',
    readMin: 11,
    image: yogaImg,
    imageAlt: 'Yoga studio owner sitting cross-legged near sunlit windows with a tablet',
  },
  {
    id: 8,
    category: 'Customers',
    title: 'How Bloom Salon cut no-shows by 40%.',
    excerpt: "A beauty studio in Portland used Delt's SMS reminders to transform its booking rate.",
    author: 'Zara Okafor',
    date: 'Feb 21, 2026',
    readMin: 5,
    image: salonImg,
    imageAlt: 'Salon owner working on a tablet next to a styling chair and round mirror',
  },
  {
    id: 9,
    category: 'Customers',
    title: "How Tessa & Tom turned their gelato shop into a 4-store chain.",
    excerpt: 'A father-daughter team on what it took to scale from one counter in Boston to four — funded entirely off card sales.',
    author: 'Avery Chen',
    date: 'Feb 14, 2026',
    readMin: 8,
    image: gelatoImg,
    imageAlt: 'Father and daughter laughing together as they hand a gelato cone across the counter',
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

/* ─── Post cover image ───────────────────────────────── */
function PostCover({ post, className = '' }: { post: Post; className?: string }) {
  return (
    <div className={className} style={{ overflow: 'hidden', position: 'relative', background: NAVY_DEEP }}>
      <img
        src={post.image}
        alt={post.imageAlt}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
      />
      {/* Subtle bottom shadow so the category pill always reads cleanly */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(2,14,34,0) 55%, rgba(2,14,34,0.35) 100%)',
          pointerEvents: 'none',
        }}
      />
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
      <PostCover post={post} className="h-44" />
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
export function NewBlogPage() {
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
            {/* Left: featured customer photo */}
            <div
              className="relative min-h-72 md:min-h-0 overflow-hidden"
              style={{ background: NAVY_DEEP }}
            >
              <img
                src={FEATURED.image}
                alt={FEATURED.imageAlt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
                className="group-hover:scale-[1.04]"
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(2,14,34,0) 55%, rgba(2,14,34,0.55) 100%)',
                }}
              />
              {/* Floor tag */}
              <div className="absolute left-6 bottom-6">
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
