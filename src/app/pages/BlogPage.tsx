import { ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';

const BG      = '#FFFFFF';
const PURPLE  = '#4945FF';
const JAKARTA = '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
const MONO    = '"JetBrains Mono", "Fira Mono", monospace';

interface BlogPost {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  authors: { name: string; title: string; avatar?: string }[];
  featured?: boolean;
  tag?: string;
}

const POSTS: BlogPost[] = [
  {
    id: '1',
    category: 'Product',
    tag: 'NEW',
    title: 'Delt + AI: Building the future of payment intelligence',
    excerpt: 'Together, Delt and AI are building the most flexible and complete payment solution on the market—one that works for everyone, from small businesses to enterprises scaling at global levels.',
    date: 'February 6, 2026',
    authors: [
      { name: 'Sarah Mitchell', title: 'Product Lead, Delt AI',  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
      { name: 'David Chen',     title: 'CEO and Founder, Delt',  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
    ],
    featured: true,
  },
  {
    id: '2',
    category: 'Product',
    title: 'Delt Scale in 2026: Year in review',
    excerpt: '2026 was a breakout year for growth-stage businesses, as entrepreneurs launched more companies and generated revenue faster than ever. Three shifts stand out: customer bases are more international than ever, time-to-revenue has compressed, and founders are turning their attention to AI agents over AI infrastructure or copilots.',
    date: 'January 28, 2026',
    authors: [
      { name: 'Jesse Carey', title: 'Delt Scale', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
    ],
  },
  {
    id: '3',
    category: 'Capital',
    title: 'Businesses grow revenue 27 points faster after accepting Capital financing',
    excerpt: 'In a new study, we found a strong causal relationship between accepting financing and growing revenue on Delt. Learn which businesses are most likely to benefit, and how greater access to financing could drive significant GDP growth. *Based on Delt internal analysis; individual results vary.',
    date: 'January 22, 2026',
    authors: [
      { name: 'Jun Wen',     title: 'Data Science, Delt Capital', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
      { name: 'Tanay Jaeel', title: 'Product Lead, Delt Capital', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop' },
    ],
  },
  {
    id: '4',
    category: 'Intelligence',
    title: 'How Delt AI helps restaurants predict peak hours and optimize staffing',
    excerpt: 'Discover how our predictive analytics engine helps restaurant owners reduce labor costs by 15% while improving customer service during busy periods. *Based on Delt internal analysis; individual results vary.',
    date: 'January 15, 2026',
    authors: [
      { name: 'Maria Rodriguez', title: 'Product Manager, Delt AI', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
    ],
  },
  {
    id: '5',
    category: 'Company',
    title: 'Delt reaches 500,000 businesses milestone',
    excerpt: "From small coffee shops to multi-location franchises, we're proud to serve half a million businesses across the country. Here's what we've learned along the way.",
    date: 'January 10, 2026',
    authors: [
      { name: 'Alex Thompson', title: 'Chief Operating Officer', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop' },
    ],
  },
  {
    id: '6',
    category: 'Commerce',
    title: 'The future of contactless payments: QR codes vs NFC',
    excerpt: 'An in-depth look at emerging payment technologies and what they mean for brick-and-mortar businesses in 2026 and beyond.',
    date: 'January 5, 2026',
    authors: [
      { name: 'Kevin Park', title: 'Payment Technology Expert', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Product:      'rgba(73,69,255,1.0)',
  Capital:      'rgba(73,69,255,0.85)',
  Intelligence: 'rgba(73,69,255,0.7)',
  Commerce:     'rgba(73,69,255,0.55)',
  Company:      'rgba(73,69,255,0.4)',
  Industry:     'rgba(73,69,255,0.4)',
};

export function BlogPage() {
  const navigate = useNavigate();
  const featured = POSTS[0];
  const rest     = POSTS.slice(1);

  return (
    <div style={{ backgroundColor: BG, fontFamily: JAKARTA, minHeight: '100vh' }}>

      {/* ── Page header ───────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(4,30,66,0.4)' }}>
        <div className="max-w-[900px] mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 transition-colors group"
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            BACK
          </button>

          <div className="text-center">
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: PURPLE }}>
              WHAT&apos;S NEW
            </span>
            <h1 style={{ fontFamily: JAKARTA, fontSize: 'clamp(1.1rem,2vw,1.4rem)', fontWeight: 800, color: '#fff', lineHeight: 1, marginTop: 4, letterSpacing: '-0.02em' }}>
              What we&apos;re building &amp; shipping
            </h1>
          </div>

          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors"
            style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            DELT ON X
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ── Article list ──────────────────────────────── */}
      <div className="max-w-[900px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col gap-5">

          {/* Featured */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="group cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 18,
              padding: 'clamp(28px,4vw,44px)',
              transition: 'border-color 0.25s, background 0.25s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(73,69,255,0.4)';
              (e.currentTarget as HTMLElement).style.background  = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLElement).style.background  = 'rgba(255,255,255,0.03)';
            }}
          >
            {/* Category row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ display: 'inline-block', width: 3, height: 18, background: CATEGORY_COLORS[featured.category] || PURPLE, borderRadius: 2 }} />
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', color: CATEGORY_COLORS[featured.category] || PURPLE }}>
                {featured.category.toUpperCase()}
              </span>
              {featured.tag && (
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', background: 'rgba(73,69,255,0.18)', color: PURPLE, border: '1px solid rgba(73,69,255,0.4)', borderRadius: 4, padding: '2px 8px' }}>
                  {featured.tag}
                </span>
              )}
            </div>

            {/* Title */}
            <h2
              className="group-hover:text-[#4945FF]"
              style={{ fontFamily: JAKARTA, fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 22, transition: 'color 0.2s' }}
            >
              {featured.title}
            </h2>

            {/* Authors */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              {featured.authors.map((author, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {author.avatar && (
                    <img src={author.avatar} alt={author.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                  )}
                  <div>
                    <p style={{ fontFamily: JAKARTA, fontWeight: 700, fontSize: 13, color: '#fff', margin: 0 }}>{author.name}</p>
                    <p style={{ fontFamily: JAKARTA, fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{author.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Excerpt */}
            <p style={{ fontFamily: JAKARTA, fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>
              {featured.excerpt}
            </p>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20 }}>
              <button
                className="group/btn"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: JAKARTA, fontWeight: 700, fontSize: 14, color: PURPLE, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Read more
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>
                {featured.date}
              </span>
            </div>
          </motion.article>

          {/* Rest */}
          {rest.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.06 * (i + 1) }}
              className="group cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                padding: 'clamp(22px,3.5vw,36px)',
                transition: 'border-color 0.25s, background 0.25s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(73,69,255,0.32)';
                (e.currentTarget as HTMLElement).style.background  = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.background  = 'rgba(255,255,255,0.025)';
              }}
            >
              {/* Category row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ display: 'inline-block', width: 3, height: 15, background: CATEGORY_COLORS[post.category] || PURPLE, borderRadius: 2 }} />
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', color: CATEGORY_COLORS[post.category] || PURPLE }}>
                  {post.category.toUpperCase()}
                </span>
              </div>

              {/* Title */}
              <h2
                className="group-hover:text-[#4945FF]"
                style={{ fontFamily: JAKARTA, fontSize: 'clamp(1.05rem,2vw,1.5rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 14, transition: 'color 0.2s' }}
              >
                {post.title}
              </h2>

              {/* Authors */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                {post.authors.map((author, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {author.avatar && (
                      <img src={author.avatar} alt={author.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.1)' }} />
                    )}
                    <div>
                      <p style={{ fontFamily: JAKARTA, fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{author.name}</p>
                      <p style={{ fontFamily: JAKARTA, fontSize: 11, color: 'rgba(255,255,255,0.32)', margin: 0 }}>{author.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Excerpt */}
              <p style={{ fontFamily: JAKARTA, fontSize: 14, lineHeight: 1.72, color: 'rgba(255,255,255,0.44)', marginBottom: 20 }}>
                {post.excerpt}
              </p>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                <button
                  className="group/btn"
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: JAKARTA, fontWeight: 700, fontSize: 13, color: PURPLE, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Read more
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
                <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.04em' }}>
                  {post.date}
                </span>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center mt-14 pb-6"
        >
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.18)', marginBottom: 16 }}>
            GET UPDATES
          </p>
          <Link
            to="/contact"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(73,69,255,0.15)', border: '1px solid rgba(73,69,255,0.35)',
              color: PURPLE, borderRadius: 10, padding: '12px 28px',
              fontFamily: JAKARTA, fontWeight: 700, fontSize: 14,
              textDecoration: 'none', transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background   = 'rgba(73,69,255,0.25)';
              (e.currentTarget as HTMLElement).style.borderColor  = PURPLE;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background   = 'rgba(73,69,255,0.15)';
              (e.currentTarget as HTMLElement).style.borderColor  = 'rgba(73,69,255,0.35)';
            }}
          >
            Get updates from Delt
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
