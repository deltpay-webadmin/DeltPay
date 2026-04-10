import { useState } from 'react';
import { ArrowRight, BookOpen, TrendingUp, Zap, Building2, Globe, Cpu } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';

const BG     = '#03152E';
const PURPLE = '#4945FF';
const JAKARTA = '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
const MONO   = '"JetBrains Mono", "Fira Mono", monospace';

interface Article {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: { name: string; role: string; avatar: string };
  image: string;
  featured?: boolean;
}

const CATEGORY_META: Record<string, { color: string; icon: React.ReactNode }> = {
  'All':           { color: '#fff',     icon: <BookOpen className="w-3.5 h-3.5" /> },
  'Payments':      { color: '#4945FF',  icon: <Zap className="w-3.5 h-3.5" /> },
  'Growth':        { color: '#22c55e',  icon: <TrendingUp className="w-3.5 h-3.5" /> },
  'Intelligence':  { color: '#06b6d4',  icon: <Cpu className="w-3.5 h-3.5" /> },
  'Commerce':      { color: '#f59e0b',  icon: <Globe className="w-3.5 h-3.5" /> },
  'Business':      { color: '#a78bfa',  icon: <Building2 className="w-3.5 h-3.5" /> },
};

const ARTICLES: Article[] = [
  {
    id: '1',
    category: 'Intelligence',
    title: 'How Lens AI predicts your busiest days — before they happen',
    excerpt: 'We trained Lens on over 500 million transactions to give business owners a 30-day revenue forecast with 94% accuracy. Here\'s how it works and what it means for staffing, inventory, and cash flow.',
    date: 'March 12, 2026',
    readTime: '8 min read',
    author: { name: 'Maria Rodriguez', role: 'Head of Product, Lens', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    featured: true,
  },
  {
    id: '2',
    category: 'Payments',
    title: 'The contactless revolution: Why NFC is winning',
    excerpt: 'Contactless payments now account for 67% of all in-person transactions on the Delt network. We break down the data, the hardware, and what it means for your checkout flow.',
    date: 'March 7, 2026',
    readTime: '5 min read',
    author: { name: 'Kevin Park', role: 'Payment Technology', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
    image: 'https://images.unsplash.com/photo-1746723378067-83a345ff3160?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: '3',
    category: 'Growth',
    title: 'From $0 to $1M: What the fastest-growing Delt merchants have in common',
    excerpt: 'We studied the top 500 fastest-growing merchants on our platform to understand what separates breakout businesses from the pack. The findings might surprise you.',
    date: 'February 28, 2026',
    readTime: '11 min read',
    author: { name: 'Alex Thompson', role: 'Chief Operating Officer', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop' },
    image: 'https://images.unsplash.com/photo-1590097521824-d20a96b7504e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: '4',
    category: 'Commerce',
    title: 'Building a storefront that converts: 9 data-backed lessons',
    excerpt: 'Delt merchants with optimized storefronts see 2.3× higher conversion rates than average. We analyzed thousands of sites to find out exactly what moves the needle.',
    date: 'February 20, 2026',
    readTime: '7 min read',
    author: { name: 'Sarah Mitchell', role: 'Product Lead, Storefront', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    image: 'https://images.unsplash.com/photo-1612703769284-0103b1e5ef70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: '5',
    category: 'Growth',
    title: 'Delt Capital: How revenue-based financing changed the game',
    excerpt: 'Revenue-based financing gave thousands of businesses access to capital without giving up equity. After two years and $400M deployed, here\'s what we\'ve learned.',
    date: 'February 14, 2026',
    readTime: '9 min read',
    author: { name: 'Jun Wen', role: 'Data Science, Delt Capital', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    image: 'https://images.unsplash.com/photo-1653378972336-103e1ea62721?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: '6',
    category: 'Business',
    title: 'Why 2026 is the year of the AI-powered small business',
    excerpt: 'AI is no longer a luxury for enterprise. With Lens, even a solo operator can get insights that used to require a full analytics team. We explore what this shift means.',
    date: 'February 6, 2026',
    readTime: '6 min read',
    author: { name: 'David Chen', role: 'CEO and Founder, Delt', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
    image: 'https://images.unsplash.com/photo-1638687095222-c7897398d16b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: '7',
    category: 'Payments',
    title: 'Understanding payment failure rates — and how to fix yours',
    excerpt: 'The average payment failure rate on most platforms is 8–12%. On Delt, our merchants average 2.4%. Here\'s the playbook we use to keep approvals high.',
    date: 'January 29, 2026',
    readTime: '6 min read',
    author: { name: 'Tanay Jaeel', role: 'Product Lead, Commerce', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop' },
    image: 'https://images.unsplash.com/photo-1551282320-545807182396?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
  {
    id: '8',
    category: 'Intelligence',
    title: 'Asking your business the right questions with Lens AI',
    excerpt: 'Most business owners don\'t know what to ask their data. Lens changes that with natural-language queries that surface insights you didn\'t know you needed.',
    date: 'January 20, 2026',
    readTime: '4 min read',
    author: { name: 'Jesse Carey', role: 'Product, Delt Intelligence', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
    image: 'https://images.unsplash.com/photo-1638687095222-c7897398d16b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  },
];

const CATEGORIES = ['All', 'Payments', 'Growth', 'Intelligence', 'Commerce', 'Business'];

export function NewBlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const featured = ARTICLES[0];
  const filtered  = (activeCategory === 'All' ? ARTICLES.slice(1) : ARTICLES.filter(a => a.category === activeCategory && !a.featured));

  return (
    <div style={{ backgroundColor: BG, fontFamily: JAKARTA, minHeight: '100vh' }}>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(60px,10vh,110px) 0 clamp(48px,8vh,80px)' }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(73,69,255,0.12)', border: '1px solid rgba(73,69,255,0.3)', borderRadius: 999, padding: '5px 14px', marginBottom: 24 }}>
              <BookOpen className="w-3 h-3" style={{ color: PURPLE }} />
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', color: PURPLE }}>DELT BLOG</span>
            </div>
            <h1 style={{ fontFamily: JAKARTA, fontSize: 'clamp(2.6rem,6vw,5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20 }}>
              Insights for<br />
              <span style={{ color: PURPLE }}>growing businesses</span>
            </h1>
            <p style={{ fontFamily: JAKARTA, fontSize: 'clamp(1rem,1.6vw,1.2rem)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '52ch' }}>
              Research, guides, and stories from the Delt team — covering payments, AI, capital, and the future of commerce.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Featured ───────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,7vh,72px) 0' }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>FEATURED</p>
            <article
              className="group cursor-pointer"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', transition: 'border-color 0.25s, background 0.25s' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(73,69,255,0.4)`;
                (e.currentTarget as HTMLElement).style.background  = `rgba(255,255,255,0.05)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(255,255,255,0.07)`;
                (e.currentTarget as HTMLElement).style.background  = `rgba(255,255,255,0.03)`;
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', overflow: 'hidden', minHeight: 380 }}>
                <img
                  src={featured.image}
                  alt={featured.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                  className="group-hover:scale-[1.04]"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(3,21,46,0.1), rgba(3,21,46,0))' }} />
                {/* Category pill on image */}
                <div style={{ position: 'absolute', top: 20, left: 20 }}>
                  <span style={{
                    fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em',
                    background: 'rgba(3,21,46,0.75)', backdropFilter: 'blur(8px)',
                    border: `1px solid ${CATEGORY_META[featured.category]?.color || PURPLE}40`,
                    color: CATEGORY_META[featured.category]?.color || PURPLE,
                    borderRadius: 6, padding: '5px 10px',
                  }}>
                    {featured.category.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: 'clamp(32px,5vw,56px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>{featured.date}</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>{featured.readTime}</span>
                  </div>
                  <h2 style={{ fontFamily: JAKARTA, fontSize: 'clamp(1.4rem,2.5vw,2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20, transition: 'color 0.2s' }}
                    className="group-hover:text-[#4945FF]"
                  >
                    {featured.title}
                  </h2>
                  <p style={{ fontFamily: JAKARTA, fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
                    {featured.excerpt}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={featured.author.avatar} alt={featured.author.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                    <div>
                      <p style={{ fontFamily: JAKARTA, fontWeight: 700, fontSize: 13, color: '#fff' }}>{featured.author.name}</p>
                      <p style={{ fontFamily: JAKARTA, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{featured.author.role}</p>
                    </div>
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: JAKARTA, fontWeight: 700, fontSize: 13, color: PURPLE, background: 'none', border: 'none', cursor: 'pointer' }}
                    className="group/btn"
                  >
                    Read article
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </article>
          </motion.div>
        </div>
      </section>

      {/* ── Category filter + Grid ─────────────────────────── */}
      <section style={{ padding: '0 0 clamp(60px,10vh,100px)' }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12">

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 28 }}>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat;
              const meta = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em',
                    padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                    border: isActive ? `1px solid ${meta?.color || '#fff'}40` : '1px solid rgba(255,255,255,0.08)',
                    background: isActive ? `${meta?.color || '#fff'}18` : 'rgba(255,255,255,0.03)',
                    color: isActive ? (meta?.color || '#fff') : 'rgba(255,255,255,0.35)',
                    transition: 'all 0.2s',
                  }}
                >
                  {meta?.icon}
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article, i) => {
              const catColor = CATEGORY_META[article.category]?.color || PURPLE;
              return (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.04 * i }}
                  className="group cursor-pointer flex flex-col"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    transition: 'border-color 0.25s, background 0.25s, transform 0.25s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${catColor}40`;
                    (e.currentTarget as HTMLElement).style.background  = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLElement).style.transform   = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLElement).style.background  = 'rgba(255,255,255,0.03)';
                    (e.currentTarget as HTMLElement).style.transform   = 'translateY(0)';
                  }}
                >
                  {/* Image */}
                  <div style={{ height: 200, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                    <img
                      src={article.image}
                      alt={article.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                      className="group-hover:scale-[1.06]"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,21,46,0.5) 0%, transparent 50%)' }} />
                    {/* Category badge */}
                    <div style={{ position: 'absolute', top: 14, left: 14 }}>
                      <span style={{
                        fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em',
                        background: 'rgba(3,21,46,0.8)', backdropFilter: 'blur(8px)',
                        border: `1px solid ${catColor}40`,
                        color: catColor, borderRadius: 5, padding: '4px 9px',
                      }}>
                        {article.category.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>{article.date}</span>
                      <span style={{ width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'inline-block' }} />
                      <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>{article.readTime}</span>
                    </div>

                    <h3
                      style={{ fontFamily: JAKARTA, fontSize: 'clamp(1rem,1.5vw,1.15rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.3, marginBottom: 12, transition: 'color 0.2s', flex: 1 }}
                      className="group-hover:text-[#4945FF]"
                    >
                      {article.title}
                    </h3>

                    <p style={{ fontFamily: JAKARTA, fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.4)', marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {article.excerpt}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={article.author.avatar} alt={article.author.name} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.1)' }} />
                        <span style={{ fontFamily: JAKARTA, fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{article.author.name}</span>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: JAKARTA, fontWeight: 700, fontSize: 12, color: catColor }}>
                        Read <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Newsletter CTA ─────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(56px,9vh,90px) 0' }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 28 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(73,69,255,0.1)', border: '1px solid rgba(73,69,255,0.25)', borderRadius: 999, padding: '5px 14px' }}>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', color: PURPLE }}>NEWSLETTER</span>
            </div>
            <h2 style={{ fontFamily: JAKARTA, fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.035em', lineHeight: 1.1, maxWidth: '18ch' }}>
              Get the latest insights in your inbox
            </h2>
            <p style={{ fontFamily: JAKARTA, fontSize: 16, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: '44ch' }}>
              Join 40,000+ merchants, operators, and founders who read the Delt Blog every week.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  fontFamily: JAKARTA, fontSize: 14, color: '#fff',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10, padding: '13px 20px', outline: 'none', minWidth: 260,
                }}
                onFocus={e => (e.currentTarget.style.borderColor = `rgba(73,69,255,0.5)`)}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              <Link
                to="/contact"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: PURPLE, color: '#fff', border: 'none', borderRadius: 10,
                  padding: '13px 28px', fontFamily: JAKARTA, fontWeight: 700, fontSize: 14,
                  textDecoration: 'none', transition: 'background 0.2s, transform 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#3733d4';
                  (e.currentTarget as HTMLElement).style.transform  = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = PURPLE;
                  (e.currentTarget as HTMLElement).style.transform  = 'translateY(0)';
                }}
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
              NO SPAM. UNSUBSCRIBE ANYTIME.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
