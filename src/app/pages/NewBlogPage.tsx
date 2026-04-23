import { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { BusinessScene } from '../components/BusinessScene';

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

/**
 * CategoryCover — themed illustrated covers per editorial category.
 * Each cover is a distinct visual language so the grid feels like a real magazine,
 * not a wall of gradient blobs.
 */
function CategoryCover({ post, className = '' }: { post: Post; className?: string }) {
  const { category, id } = post;

  // Customers → use a real BusinessScene photo (tied to the merchant in the article)
  if (category === 'Customers') {
    const customerTheme =
      post.title.includes('Roma') ? 'restaurant' :
      post.title.includes('Bloom') ? 'salon' :
      'cafe';
    const initials = post.title.includes('Roma') ? 'RT' : post.title.includes('Bloom') ? 'BS' : 'BW';
    const biz = post.title.includes('Roma') ? 'Roma Trattoria' : post.title.includes('Bloom') ? 'Bloom Salon' : 'Blue Wren Coffee';
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

  // Product → stylised UI mockup (window chrome + metric cards)
  if (category === 'Product') {
    const accents = ['#4945FF', '#6D68FF', '#2a2680'];
    const accent = accents[id % accents.length];
    return (
      <div
        className={className}
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, #0a1638 60%, ${accent} 140%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* soft radial glow */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle at 80% 20%, ${accent}55 0%, transparent 55%)`,
          }}
        />
        {/* browser window */}
        <div
          style={{
            position: 'absolute', left: '10%', top: '18%', right: '10%', bottom: '18%',
            background: WHITE, borderRadius: 10,
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}
        >
          {/* titlebar */}
          <div style={{ height: 14, background: '#F6F7FB', display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: '#ff5f57' }} />
            <span style={{ width: 5, height: 5, borderRadius: 99, background: '#febc2e' }} />
            <span style={{ width: 5, height: 5, borderRadius: 99, background: '#28c840' }} />
          </div>
          {/* metric tiles */}
          <div style={{ padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ background: `${PURPLE}14`, borderRadius: 5, padding: '6px 7px' }}>
              <div style={{ width: 18, height: 3, background: `${PURPLE}80`, borderRadius: 2, marginBottom: 3 }} />
              <div style={{ width: 34, height: 7, background: NAVY, borderRadius: 2 }} />
            </div>
            <div style={{ background: `${NAVY}10`, borderRadius: 5, padding: '6px 7px' }}>
              <div style={{ width: 14, height: 3, background: `${NAVY}60`, borderRadius: 2, marginBottom: 3 }} />
              <div style={{ width: 28, height: 7, background: PURPLE, borderRadius: 2 }} />
            </div>
            {/* sparkline */}
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
        {/* grid paper */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${PURPLE}14 1px, transparent 1px), linear-gradient(90deg, ${PURPLE}14 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
        }} />
        {/* terminal card */}
        <div style={{
          position: 'absolute', left: '8%', right: '8%', top: '16%', bottom: '16%',
          background: '#0b1026', borderRadius: 8,
          border: `1px solid ${PURPLE}40`,
          boxShadow: `0 0 0 1px ${PURPLE}20, 0 20px 40px -10px rgba(0,0,0,0.6)`,
          padding: 10,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 9,
          lineHeight: 1.45,
          color: '#94A3B8',
          overflow: 'hidden',
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

  // Culture → handwritten / notebook feel with a big quote glyph
  if (category === 'Culture') {
    return (
      <div
        className={className}
        style={{
          background: `linear-gradient(160deg, #f3f1ff 0%, ${WHITE} 60%)`,
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* ruled lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            position: 'absolute', left: '10%', right: '10%',
            top: `${22 + i * 14}%`, height: 1, background: `${NAVY}10`,
          }} />
        ))}
        {/* giant quote mark */}
        <div style={{
          position: 'absolute', left: '8%', top: '-5%',
          fontFamily: 'Georgia, serif', fontSize: 120, lineHeight: 1,
          color: `${PURPLE}30`, fontWeight: 700,
        }}>
          &ldquo;
        </div>
        {/* pen stroke */}
        <svg viewBox="0 0 200 80" style={{ position: 'absolute', right: '8%', bottom: '12%', width: '55%' }}>
          <path d="M10 50 Q 40 10, 80 40 T 160 30" stroke={PURPLE} strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="162" cy="29" r="4" fill={PURPLE} />
        </svg>
      </div>
    );
  }

  // Policy → document + marble building silhouette
  return (
    <div
      className={className}
      style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #1a3060 100%)`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* document */}
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
      {/* columns silhouette */}
      <div style={{ position: 'absolute', right: '10%', bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 4, opacity: 0.4 }}>
        {[40, 50, 60, 50, 40].map((h, i) => (
          <div key={i} style={{ width: 8, height: h, background: WHITE, borderRadius: '2px 2px 0 0' }} />
        ))}
        <div style={{ position: 'absolute', left: -4, right: -4, bottom: 60, height: 4, background: WHITE, borderRadius: 1 }} />
      </div>
    </div>
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
      <CategoryCover post={post} className="h-36" />
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
            {/* Illustrated left panel */}
            <div
              className="relative min-h-56 md:min-h-0 flex items-end p-8 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, #0a1638 55%, ${PURPLE} 130%)`,
              }}
            >
              {/* glow */}
              <div
                aria-hidden
                className="absolute"
                style={{
                  inset: 0,
                  background: `radial-gradient(circle at 85% 20%, ${PURPLE}55 0%, transparent 55%)`,
                }}
              />
              {/* stacked capital stats */}
              <div aria-hidden className="absolute right-6 top-6 flex flex-col gap-2" style={{ width: 180 }}>
                <div className="rounded-xl" style={{ background: `${WHITE}F2`, padding: '10px 12px', boxShadow: '0 10px 30px -8px rgba(0,0,0,0.35)' }}>
                  <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: PURPLE }}>Capital offer</div>
                  <div className="text-lg font-bold mt-0.5" style={{ color: NAVY }}>$42,000</div>
                  <div className="mt-2 h-1.5 rounded-full" style={{ background: `${NAVY}14` }}>
                    <div className="h-1.5 rounded-full" style={{ width: '68%', background: PURPLE }} />
                  </div>
                </div>
                <div className="rounded-xl flex items-center gap-2" style={{ background: `${WHITE}E6`, padding: '8px 12px' }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${PURPLE}22` }}>
                    <span className="text-xs" style={{ color: PURPLE }}>✓</span>
                  </div>
                  <div className="text-[11px] font-medium" style={{ color: NAVY }}>Funded in 24h</div>
                </div>
              </div>
              <p
                className="relative text-2xl font-bold tracking-tight leading-snug max-w-xs"
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
