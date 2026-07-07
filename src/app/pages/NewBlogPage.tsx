import { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, Clock, Mail } from 'lucide-react';

/* ─── Images ─────────────────────────────────────────── */
import imgFeatured             from '@/assets/blog/blog-featured-capital-rebuild.png';
import imgLensAi               from '@/assets/blog/blog-lens-ai-agent.png';
import imgEngineeringScale     from '@/assets/blog/blog-engineering-scale.png';
import imgRomaTrattoria        from '@/assets/blog/blog-roma-trattoria.png';
import imgWritingBeforeCoding  from '@/assets/blog/blog-writing-before-coding.png';
import imgSmbLendingPolicy     from '@/assets/blog/blog-smb-lending-policy.png';
import imgDistractedOperators  from '@/assets/blog/blog-designing-distracted-operators.png';
import imgZeroDowntime         from '@/assets/blog/blog-zero-downtime-migrations.png';
import imgBloomSalon           from '@/assets/blog/blog-bloom-salon.png';
import imgAgainstDashboards    from '@/assets/blog/blog-case-against-dashboards.png';
import imgMerchantOnboarding   from '@/assets/blog/blog-merchant-onboarding-day.png';
import imgFraudProtection      from '@/assets/blog/blog-fraud-protection-essay.png';
import imgInterchange          from '@/assets/blog/blog-interchange-explained.png';
import imgKitchenDisplay       from '@/assets/blog/blog-kitchen-display-systems.png';
import imgSalonNoShows         from '@/assets/blog/blog-salon-no-shows-essay.png';
import imgWellnessMembership   from '@/assets/blog/blog-wellness-membership-engine.png';
import imgRetailInventory      from '@/assets/blog/blog-retail-inventory-truth.png';
import imgFounderLetter        from '@/assets/blog/blog-founder-letter-anniversary.png';
import imgSupportAsProduct     from '@/assets/blog/blog-support-as-product.png';

/* ─── Palette ────────────────────────────────────────── */
const NAVY      = '#041E42';
const NAVY_DEEP = '#020E22';
const PURPLE    = '#4945FF';
const PURPLE_HI = '#6D68FF';
const WHITE     = '#FFFFFF';
const INK       = '#0F172A';
const MUTED     = '#475569';
const HAIRLINE  = 'rgba(4,30,66,0.08)';

/* ─── Newsletter signup (Delt Dispatch) ─────────────────── */
function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Email the newsletter signup to the team (fire-and-forget).
    fetch('/api/leads/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'newsletter', email }),
    }).catch(() => {});
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <p className="text-base md:text-lg font-semibold" style={{ color: WHITE }}>
        You're subscribed — watch your inbox for the next Delt Dispatch.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
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
  );
}

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
  image: imgFeatured,
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
    image: imgLensAi,
  },
  {
    id: 2,
    category: 'Engineering',
    title: 'How we handle 3M transactions per hour.',
    excerpt: "A deep dive into the architecture powering Delt's payment processing at scale.",
    author: 'Marcus Webb',
    date: 'Apr 04, 2026',
    readMin: 14,
    image: imgEngineeringScale,
  },
  {
    id: 3,
    category: 'Customers',
    title: "Inside Roma Trattoria's 3× sales year.",
    excerpt: 'How a family-run Italian restaurant tripled revenue with Delt Payments and Capital.',
    author: 'Zara Okafor',
    date: 'Mar 28, 2026',
    readMin: 7,
    image: imgRomaTrattoria,
  },
  {
    id: 4,
    category: 'Culture',
    title: 'Why we write before we code.',
    excerpt: "Every feature at Delt starts with a one-pager. Here's why that makes us faster, not slower.",
    author: 'Elena Rodriguez',
    date: 'Mar 21, 2026',
    readMin: 6,
    image: imgWritingBeforeCoding,
  },
  {
    id: 5,
    category: 'Policy',
    title: 'On the new SMB lending disclosures.',
    excerpt: 'What the latest regulatory changes mean for merchants — and how Delt is responding.',
    author: 'Priya Patel',
    date: 'Mar 14, 2026',
    readMin: 8,
    image: imgSmbLendingPolicy,
  },
  {
    id: 6,
    category: 'Product',
    title: 'Designing for distracted operators.',
    excerpt: 'Most software is designed for focused users. Our merchants are anything but.',
    author: 'Daniel Kim',
    date: 'Mar 07, 2026',
    readMin: 10,
    image: imgDistractedOperators,
  },
  {
    id: 7,
    category: 'Engineering',
    title: 'Our approach to zero-downtime migrations.',
    excerpt: 'Shipping database schema changes without ever taking the system offline.',
    author: 'Marcus Webb',
    date: 'Feb 28, 2026',
    readMin: 11,
    image: imgZeroDowntime,
  },
  {
    id: 8,
    category: 'Customers',
    title: 'How Bloom Salon cut no-shows by 40%.',
    excerpt: "A beauty studio in Portland used Delt's SMS reminders to transform its booking rate.",
    author: 'Zara Okafor',
    date: 'Feb 21, 2026',
    readMin: 5,
    image: imgBloomSalon,
  },
  {
    id: 9,
    category: 'Product',
    title: 'The case against dashboards.',
    excerpt: "We removed half the charts from Lens and merchants loved it. Here's what we replaced them with.",
    author: 'Avery Chen',
    date: 'Feb 14, 2026',
    readMin: 8,
    image: imgAgainstDashboards,
  },
  {
    id: 10,
    category: 'Customers',
    title: 'What we learn from onboarding day.',
    excerpt: "Every new merchant unboxing a terminal teaches us something. Here are five lessons we've shipped from the first ten minutes of activation.",
    author: 'Zara Okafor',
    date: 'Feb 07, 2026',
    readMin: 6,
    image: imgMerchantOnboarding,
  },
  {
    id: 11,
    category: 'Engineering',
    title: 'Fraud is a craft, not a checkbox.',
    excerpt: 'Why our fraud models are written by people who answer the phone when things go wrong — and what that changes about the work.',
    author: 'Marcus Webb',
    date: 'Jan 31, 2026',
    readMin: 12,
    image: imgFraudProtection,
  },
  {
    id: 12,
    category: 'Product',
    title: 'Interchange, explained without the jargon.',
    excerpt: 'The fees behind every card swipe, written for an operator — not a payments lifer.',
    author: 'Avery Chen',
    date: 'Jan 24, 2026',
    readMin: 9,
    image: imgInterchange,
  },
  {
    id: 13,
    category: 'Product',
    title: 'Kitchen display systems, rebuilt for real tickets.',
    excerpt: 'A look at how we shipped a KDS that survives Friday-night service — and what it took to convince ourselves we needed one.',
    author: 'Daniel Kim',
    date: 'Jan 17, 2026',
    readMin: 8,
    image: imgKitchenDisplay,
  },
  {
    id: 14,
    category: 'Product',
    title: "Why salon no-shows are a product problem.",
    excerpt: "Reminders are table stakes. The real fix lives in deposits, waitlists, and the moment between booking and showing up.",
    author: 'Elena Rodriguez',
    date: 'Jan 10, 2026',
    readMin: 7,
    image: imgSalonNoShows,
  },
  {
    id: 15,
    category: 'Product',
    title: 'Building a membership engine for wellness.',
    excerpt: "How we designed recurring revenue tooling that yoga, pilates, and barre studios can actually run themselves.",
    author: 'Daniel Kim',
    date: 'Jan 03, 2026',
    readMin: 10,
    image: imgWellnessMembership,
  },
  {
    id: 16,
    category: 'Engineering',
    title: 'Inventory should tell the truth.',
    excerpt: "A retailer's stockroom is the cruelest place a software bug can live. Here's how we hold ourselves to a higher bar for inventory accuracy.",
    author: 'Marcus Webb',
    date: 'Dec 20, 2025',
    readMin: 11,
    image: imgRetailInventory,
  },
  {
    id: 17,
    category: 'Culture',
    title: 'A letter on our second anniversary.',
    excerpt: 'Two years in. A note to our merchants, our team, and our future selves — about what we built, what we broke, and what comes next.',
    author: 'Avery Chen',
    date: 'Dec 13, 2025',
    readMin: 5,
    image: imgFounderLetter,
  },
  {
    id: 18,
    category: 'Culture',
    title: 'Support is a product, not a cost center.',
    excerpt: "Our support team ships fixes, not just replies. Here's how we organize the work so the answer to 'who owns this?' is always the same: we do.",
    author: 'Elena Rodriguez',
    date: 'Dec 06, 2025',
    readMin: 7,
    image: imgSupportAsProduct,
  },
];

const CATEGORIES: Category[] = ['All', 'Product', 'Engineering', 'Culture', 'Customers', 'Policy'];
const POSTS_PER_PAGE = 6;

const CATEGORY_COLOR: Record<Exclude<Category, 'All'>, string> = {
  Product:     PURPLE,
  Engineering: '#0B6CF0',
  Culture:     '#B45309',
  Customers:   '#0E8A5F',
  Policy:      NAVY,
};

/* ─── Sub-components ─────────────────────────────────── */

function PostImage({ post, className = '' }: { post: Post; className?: string }) {
  return (
    <div className={className} style={{ overflow: 'hidden', background: `${NAVY}08` }}>
      <img
        src={post.image}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
      <PostImage post={post} className="h-44" />
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
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const filteredPosts = useMemo(
    () => (activeCategory === 'All' ? POSTS : POSTS.filter(p => p.category === activeCategory)),
    [activeCategory],
  );

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  // Clamp page if filter shrinks the list
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const goToPage = (page: number) => {
    const next = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(next);
    if (gridRef.current) {
      const top = gridRef.current.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

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
            href="#/blog"
            className="group block rounded-3xl overflow-hidden transition-all duration-300 grid md:grid-cols-[1.1fr_1fr]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1), 0 40px 80px -30px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Left: featured editorial image */}
            <div className="relative min-h-72 md:min-h-0 overflow-hidden">
              <img
                src={FEATURED.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, rgba(2,14,34,0.15) 0%, rgba(2,14,34,0.55) 100%)`,
                }}
              />
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
          <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {paginatedPosts.map(post => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>

          {paginatedPosts.length === 0 && (
            <div
              className="mt-8 rounded-2xl text-center py-16 px-6"
              style={{
                background: `${NAVY}06`,
                boxShadow: `inset 0 0 0 1px ${HAIRLINE}`,
                color: MUTED,
              }}
            >
              No essays in this category yet. Check back soon.
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="mt-16 flex items-center justify-center gap-8 text-sm"
              style={{ color: MUTED }}
            >
              <button
                type="button"
                onClick={() => !prevDisabled && goToPage(currentPage - 1)}
                disabled={prevDisabled}
                className="inline-flex items-center gap-1.5 font-semibold transition-colors"
                style={{
                  color: prevDisabled ? '#CBD5E1' : PURPLE,
                  cursor: prevDisabled ? 'default' : 'pointer',
                  opacity: prevDisabled ? 0.5 : 1,
                }}
              >
                <ArrowLeft size={14} strokeWidth={2.5} /> Previous
              </button>
              <span className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => {
                  const active = n === currentPage;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => goToPage(n)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold transition-all"
                      style={
                        active
                          ? { background: NAVY, color: WHITE }
                          : { color: MUTED, background: 'transparent' }
                      }
                      aria-current={active ? 'page' : undefined}
                    >
                      {n}
                    </button>
                  );
                })}
              </span>
              <button
                type="button"
                onClick={() => !nextDisabled && goToPage(currentPage + 1)}
                disabled={nextDisabled}
                className="inline-flex items-center gap-1.5 font-semibold transition-colors"
                style={{
                  color: nextDisabled ? '#CBD5E1' : PURPLE,
                  cursor: nextDisabled ? 'default' : 'pointer',
                  opacity: nextDisabled ? 0.5 : 1,
                }}
              >
                Next <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}
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
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
