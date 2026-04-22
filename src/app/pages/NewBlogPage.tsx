import { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

/* ─── Palette ────────────────────────────────────────── */
const NAVY   = '#041E42';
const PURPLE = '#4945FF';
const WHITE  = '#FFFFFF';
const BG     = '#F6F7FB';

/* ─── Types ──────────────────────────────────────────── */
type Category = 'All' | 'Product' | 'Engineering' | 'Culture' | 'Customers' | 'Policy';

interface Post {
  id: number;
  category: Exclude<Category, 'All'>;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  gradientFrom: string;
  gradientTo: string;
}

/* ─── Data ───────────────────────────────────────────── */
const FEATURED: Post = {
  id: 0,
  category: 'Product',
  title: 'Why we rebuilt capital for small business — and what we got wrong the first time.',
  excerpt:
    "The first version of Delt Capital was fast. It was also broken in ways we didn't fully see until our merchants started telling us — politely, then less politely. Here's what we learned, and how we rebuilt.",
  author: 'Avery Chen',
  date: 'Apr 18, 2026',
  gradientFrom: NAVY,
  gradientTo: PURPLE,
};

const POSTS: Post[] = [
  {
    id: 1,
    category: 'Product',
    title: 'Shipping Lens AI: our first autonomous product.',
    excerpt: 'What it took to go from "AI assistant" to an agent that acts on your behalf.',
    author: 'Daniel Kim',
    date: 'Apr 11, 2026',
    gradientFrom: NAVY,
    gradientTo: '#2a2680',
  },
  {
    id: 2,
    category: 'Engineering',
    title: 'How we handle 3M transactions per hour.',
    excerpt: "A deep dive into the architecture powering Delt's payment processing at scale.",
    author: 'Marcus Webb',
    date: 'Apr 04, 2026',
    gradientFrom: '#0a1628',
    gradientTo: NAVY,
  },
  {
    id: 3,
    category: 'Customers',
    title: "Inside Roma Trattoria's 3x sales year.",
    excerpt: 'How a family-run Italian restaurant tripled revenue with Delt Payments and Capital.',
    author: 'Zara Okafor',
    date: 'Mar 28, 2026',
    gradientFrom: PURPLE,
    gradientTo: '#2a2680',
  },
  {
    id: 4,
    category: 'Culture',
    title: 'Why we write before we code.',
    excerpt: "Every feature at Delt starts with a one-pager. Here's why that makes us faster, not slower.",
    author: 'Elena Rodriguez',
    date: 'Mar 21, 2026',
    gradientFrom: '#1a1060',
    gradientTo: PURPLE,
  },
  {
    id: 5,
    category: 'Policy',
    title: 'On the new SMB lending disclosures.',
    excerpt: 'What the latest regulatory changes mean for merchants — and how Delt is responding.',
    author: 'Priya Patel',
    date: 'Mar 14, 2026',
    gradientFrom: NAVY,
    gradientTo: '#1a3060',
  },
  {
    id: 6,
    category: 'Product',
    title: 'Designing for distracted operators.',
    excerpt: 'Most software is designed for focused users. Our merchants are anything but.',
    author: 'Daniel Kim',
    date: 'Mar 07, 2026',
    gradientFrom: '#2a0a6e',
    gradientTo: PURPLE,
  },
  {
    id: 7,
    category: 'Engineering',
    title: 'Our approach to zero-downtime migrations.',
    excerpt: 'Shipping database schema changes without ever taking the system offline.',
    author: 'Marcus Webb',
    date: 'Feb 28, 2026',
    gradientFrom: '#060e22',
    gradientTo: NAVY,
  },
  {
    id: 8,
    category: 'Customers',
    title: 'How Bloom Salon cut no-shows by 40%.',
    excerpt: "A beauty studio in Portland used Delt's SMS reminders to transform its booking rate.",
    author: 'Zara Okafor',
    date: 'Feb 21, 2026',
    gradientFrom: PURPLE,
    gradientTo: '#3a30ff',
  },
  {
    id: 9,
    category: 'Product',
    title: 'The case against dashboards.',
    excerpt: "We removed half the charts from Lens and merchants loved it. Here's what we replaced them with.",
    author: 'Avery Chen',
    date: 'Feb 14, 2026',
    gradientFrom: NAVY,
    gradientTo: '#0c2860',
  },
];

const CATEGORIES: Category[] = ['All', 'Product', 'Engineering', 'Culture', 'Customers', 'Policy'];

const CATEGORY_COLOR: Record<Exclude<Category, 'All'>, string> = {
  Product:     PURPLE,
  Engineering: NAVY,
  Culture:     NAVY,
  Customers:   PURPLE,
  Policy:      NAVY,
};

/* ─── Sub-components ─────────────────────────────────── */
function GradientThumb({
  from,
  to,
  className = '',
}: {
  from: string;
  to: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
    />
  );
}

function CategoryPill({
  category,
  small = false,
}: {
  category: Exclude<Category, 'All'>;
  small?: boolean;
}) {
  const color = CATEGORY_COLOR[category];
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}
      style={{ background: `${color}15`, color }}
    >
      {category}
    </span>
  );
}

function ArticleCard({ post }: { post: Post }) {
  return (
    <div
      className="group rounded-2xl border flex flex-col overflow-hidden transition-all duration-200 cursor-pointer"
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
      <GradientThumb from={post.gradientFrom} to={post.gradientTo} className="h-36 rounded-none" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <CategoryPill category={post.category} small />
        <h3 className="text-sm font-semibold tracking-tight leading-snug" style={{ color: NAVY }}>
          {post.title}
        </h3>
        <p className="text-xs text-[#475569] leading-relaxed flex-1">{post.excerpt}</p>
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: `${NAVY}1A` }}>
          <span className="text-xs text-[#94A3B8]">{post.author} · {post.date}</span>
          <span className="text-xs font-medium transition-colors" style={{ color: PURPLE }}>
            Read →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export function NewBlogPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filteredPosts = activeCategory === 'All'
    ? POSTS
    : POSTS.filter(p => p.category === activeCategory);

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
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: PURPLE }}>
            From the team
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight mb-4"
            style={{ color: NAVY, lineHeight: 1.08 }}
          >
            Essays, dispatches, and product stories.
          </h1>
          <p className="text-lg text-[#475569] max-w-xl">
            The people building Delt, writing about how and why.
          </p>
        </div>
      </section>

      {/* ══ FEATURED POST ══════════════════════════════════════ */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-3xl border overflow-hidden grid md:grid-cols-2 transition-all duration-200 cursor-pointer"
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
            {/* Gradient left panel */}
            <div
              className="min-h-56 md:min-h-0 flex items-end p-8"
              style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, ${PURPLE} 100%)`,
              }}
            >
              <p
                className="text-2xl font-bold tracking-tight leading-snug max-w-xs"
                style={{ color: WHITE }}
              >
                {FEATURED.title}
              </p>
            </div>

            {/* Right content */}
            <div className="p-8 flex flex-col justify-center gap-4">
              <CategoryPill category={FEATURED.category} />
              <h2 className="text-xl font-bold tracking-tight leading-snug" style={{ color: NAVY }}>
                {FEATURED.title}
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                {FEATURED.excerpt}
              </p>
              <p className="text-xs text-[#94A3B8]">
                By {FEATURED.author} · {FEATURED.date}
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                style={{ color: PURPLE }}
              >
                Read <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CATEGORY TABS ══════════════════════════════════════ */}
      <div className="sticky top-0 z-10 border-b" style={{ background: WHITE, borderColor: `${NAVY}1A` }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-1 py-1 overflow-x-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={
                  activeCategory === cat
                    ? { background: `${PURPLE}12`, color: PURPLE }
                    : { color: '#475569' }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ARTICLE GRID ═══════════════════════════════════════ */}
      <section className="py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map(post => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-14 flex items-center justify-center gap-6 text-sm" style={{ color: '#475569' }}>
            <button className="inline-flex items-center gap-1.5 hover:text-[#041E42] transition-colors">
              <ArrowLeft size={14} /> Previous
            </button>
            <span className="font-medium" style={{ color: NAVY }}>Page 1 of 3</span>
            <button className="inline-flex items-center gap-1.5 font-medium transition-colors" style={{ color: PURPLE }}>
              Next <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ══ NEWSLETTER CTA ═════════════════════════════════════ */}
      <section
        className="py-20 px-6"
        style={{ background: BG, borderTop: `1px solid ${NAVY}1A` }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold text-lg tracking-tight mb-1" style={{ color: NAVY }}>
              Never miss a post.
            </p>
            <p className="text-sm text-[#475569]">
              Get the latest essays and product stories in your inbox.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
            style={{ background: PURPLE, color: WHITE }}
          >
            Subscribe to the blog <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
