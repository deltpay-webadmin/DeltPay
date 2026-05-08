import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';

import { ALL_POSTS, getPostBySlug, type Post } from '../blog/blogData';

const NAVY      = '#041E42';
const NAVY_DEEP = '#020E22';
const PURPLE    = '#4945FF';
const PURPLE_HI = '#6D68FF';
const WHITE     = '#FFFFFF';
const INK       = '#0F172A';
const MUTED     = '#475569';
const HAIRLINE  = 'rgba(4,30,66,0.08)';

/* ─── Minimal, safe markdown → HTML renderer ──────────────
 * Supports: # H1, ## H2, ### H3, **bold**, *italic*, [link](url),
 * `code`, blockquotes (>), ordered/unordered lists, paragraphs,
 * horizontal rules (---).
 *
 * Inputs come from our own JSON content (no user-submitted HTML),
 * but we still escape `<` / `>` / `&` first so the markdown is the
 * only source of HTML in the output.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderInline(s: string): string {
  // s is already HTML-escaped.
  // links: [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#4945FF;text-decoration:underline;text-underline-offset:2px;">${text}</a>`;
  });
  // bold **x**
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic *x*
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  // inline code `x`
  s = s.replace(/`([^`]+)`/g, '<code style="background:rgba(4,30,66,0.06);padding:1px 6px;border-radius:4px;font-size:0.92em;">$1</code>');
  return s;
}

function renderMarkdown(md: string): string {
  const escaped = escapeHtml(md);
  const lines = escaped.split(/\r?\n/);
  const out: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // blank line
    if (/^\s*$/.test(line)) { i++; continue; }

    // horizontal rule
    if (/^\s*---+\s*$/.test(line)) {
      out.push('<hr style="border:none;border-top:1px solid rgba(4,30,66,0.1);margin:32px 0;" />');
      i++; continue;
    }

    // headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const tag = `h${Math.min(level, 6)}`;
      const styles =
        level === 1 ? 'font-size:2rem;font-weight:800;letter-spacing:-0.02em;color:#041E42;margin:40px 0 16px;line-height:1.15;' :
        level === 2 ? 'font-size:1.5rem;font-weight:700;letter-spacing:-0.015em;color:#041E42;margin:36px 0 12px;line-height:1.2;' :
        level === 3 ? 'font-size:1.2rem;font-weight:700;color:#041E42;margin:28px 0 10px;line-height:1.25;' :
                      'font-size:1rem;font-weight:700;color:#041E42;margin:20px 0 8px;';
      out.push(`<${tag} style="${styles}">${renderInline(h[2])}</${tag}>`);
      i++; continue;
    }

    // blockquote (one or more consecutive `>` lines)
    if (/^\s*>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      out.push(
        `<blockquote style="border-left:4px solid #4945FF;padding:8px 18px;margin:20px 0;color:#475569;font-style:italic;background:rgba(73,69,255,0.04);border-radius:0 8px 8px 0;">${renderInline(buf.join(' '))}</blockquote>`,
      );
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(`<li style="margin:6px 0;">${renderInline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`);
        i++;
      }
      out.push(`<ul style="padding-left:24px;margin:14px 0;color:#0F172A;">${items.join('')}</ul>`);
      continue;
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li style="margin:6px 0;">${renderInline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        i++;
      }
      out.push(`<ol style="padding-left:26px;margin:14px 0;color:#0F172A;">${items.join('')}</ol>`);
      continue;
    }

    // paragraph: gather consecutive non-blank, non-list, non-heading lines
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^\s*---+\s*$/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p style="margin:16px 0;font-size:17px;line-height:1.7;color:#0F172A;">${renderInline(para.join(' '))}</p>`);
  }

  return out.join('\n');
}

function CategoryPill({ category }: { category: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide"
      style={{
        background: 'rgba(255,255,255,0.12)',
        color: WHITE,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.24)',
      }}
    >
      {category}
    </span>
  );
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = useMemo<Post | undefined>(() => (slug ? getPostBySlug(slug) : undefined), [slug]);

  /* ── SEO: <title>, meta description, OG/Twitter, canonical, FAQPage JSON-LD ── */
  useEffect(() => {
    if (!post) return;
    const prevTitle = document.title;
    document.title = post.seoTitle;

    setMetaTag('name', 'description', post.metaDescription);

    // OpenGraph
    setMetaTag('property', 'og:type', 'article');
    setMetaTag('property', 'og:title', post.seoTitle);
    setMetaTag('property', 'og:description', post.metaDescription);
    setMetaTag('property', 'og:url', `https://deltpay.com/#/blog/${post.slug}`);

    // Twitter
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', post.seoTitle);
    setMetaTag('name', 'twitter:description', post.metaDescription);

    // Canonical (note: hash routes are not ideal for SEO — see PR description)
    setCanonical(`https://deltpay.com/#/blog/${post.slug}`);

    // FAQPage JSON-LD
    let scriptEl: HTMLScriptElement | null = null;
    if (post.faqSchema && post.faqSchema.length > 0) {
      const faqJson = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faqSchema.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      };
      scriptEl = document.createElement('script');
      scriptEl.setAttribute('type', 'application/ld+json');
      scriptEl.setAttribute('data-faq-schema', post.slug);
      scriptEl.textContent = JSON.stringify(faqJson);
      document.head.appendChild(scriptEl);
    }

    // Article JSON-LD
    const articleJson = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.h1,
      description: post.metaDescription,
      author: { '@type': 'Person', name: post.author },
      datePublished: post.date,
      mainEntityOfPage: { '@type': 'WebPage', '@id': `https://deltpay.com/#/blog/${post.slug}` },
    };
    const articleScript = document.createElement('script');
    articleScript.setAttribute('type', 'application/ld+json');
    articleScript.setAttribute('data-article-schema', post.slug);
    articleScript.textContent = JSON.stringify(articleJson);
    document.head.appendChild(articleScript);

    return () => {
      document.title = prevTitle;
      if (scriptEl) scriptEl.remove();
      articleScript.remove();
    };
  }, [post]);

  if (!post) {
    return (
      <div style={{ background: WHITE, color: INK, minHeight: '70vh' }}>
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: MUTED }}>404 · Not found</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight" style={{ color: NAVY }}>That essay doesn't exist.</h1>
          <p className="mt-4 text-lg" style={{ color: MUTED }}>It may have moved, or the link could be stale.</p>
          <Link
            to="/blog"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
            style={{ background: NAVY, color: WHITE }}
          >
            <ArrowLeft size={14} /> Back to the blog
          </Link>
        </div>
      </div>
    );
  }

  // Recommend the next 3 posts after this one in ALL_POSTS order, wrapping.
  const idx = ALL_POSTS.findIndex(p => p.slug === post.slug);
  const next = idx >= 0 ? [1, 2, 3].map(o => ALL_POSTS[(idx + o) % ALL_POSTS.length]) : [];

  const bodyHtml = useMemo(() => renderMarkdown(post.contentMarkdown ?? ''), [post.contentMarkdown]);

  return (
    <div style={{ background: WHITE, color: INK, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ══ DARK HEADER ══ */}
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
              `radial-gradient(45% 75% at 90% 30%, ${PURPLE_HI}33 0%, transparent 60%)`,
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 pt-28 md:pt-36 pb-32 md:pb-40">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] mb-8 no-underline"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <ArrowLeft size={12} /> Back to the blog
          </Link>
          <CategoryPill category={post.category} />
          <h1
            className="mt-5 font-bold tracking-[-0.02em]"
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              lineHeight: 1.08,
              color: WHITE,
            }}
          >
            {post.h1}
          </h1>
          <div
            className="mt-6 flex items-center gap-3 text-sm flex-wrap"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <span className="font-semibold" style={{ color: WHITE }}>{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} strokeWidth={2.25} /> {post.readMin} min read
            </span>
          </div>
        </div>
      </section>

      {/* ══ HERO IMAGE ══
           Pulled up to overlap the dark header bottom edge — header padding
           below is sized to give the title + meta full breathing room above
           the image, so they never collide. */}
      <section className="px-6">
        <div className="max-w-4xl mx-auto -mt-20 md:-mt-24 relative z-10">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              boxShadow: '0 40px 80px -30px rgba(2,14,34,0.6), inset 0 0 0 1px rgba(255,255,255,0.1)',
              aspectRatio: '16/9',
              background: NAVY_DEEP,
            }}
          >
            <img
              src={post.image}
              alt={post.imageAlt}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* ══ BODY ══ */}
      <article className="px-6 py-16 md:py-20">
        <div
          className="max-w-3xl mx-auto"
          style={{ fontSize: 17, lineHeight: 1.7, color: INK }}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {/* FAQs */}
        {post.faqSchema && post.faqSchema.length > 0 && (
          <div className="max-w-3xl mx-auto mt-16">
            <h2
              className="text-2xl font-bold tracking-tight"
              style={{ color: NAVY }}
            >
              Frequently asked
            </h2>
            <div className="mt-6 space-y-4">
              {post.faqSchema.map((f, fi) => (
                <details
                  key={fi}
                  className="rounded-xl px-5 py-4"
                  style={{ background: '#F8FAFC', boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
                >
                  <summary
                    className="cursor-pointer font-semibold"
                    style={{ color: NAVY, listStyle: 'none' }}
                  >
                    {f.question}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>
                    {f.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* External sources */}
        {post.externalLinks && post.externalLinks.length > 0 && (
          <div className="max-w-3xl mx-auto mt-14 pt-8" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: MUTED }}>
              Sources
            </p>
            <ul className="mt-3 space-y-2 text-sm" style={{ color: MUTED }}>
              {post.externalLinks.map((l, li) => (
                <li key={li}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: PURPLE, textDecoration: 'underline', textUnderlineOffset: 2 }}
                  >
                    {l.source_name ? `${l.source_name} — ${l.anchor}` : l.anchor}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>

      {/* ══ NEXT POSTS ══ */}
      {next.length > 0 && (
        <section
          className="px-6 py-16 md:py-20"
          style={{ background: '#F8FAFC', borderTop: `1px solid ${HAIRLINE}` }}
        >
          <div className="max-w-6xl mx-auto">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: MUTED }}>
              Keep reading
            </p>
            <h2
              className="mt-2 text-3xl font-bold tracking-tight"
              style={{ color: NAVY }}
            >
              More from the team
            </h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {next.map(p => (
                <a
                  key={p.slug}
                  href={`#/blog/${p.slug}`}
                  className="rounded-2xl overflow-hidden bg-white no-underline transition-all"
                  style={{ boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
                >
                  <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: NAVY_DEEP }}>
                    <img
                      src={p.image}
                      alt={p.imageAlt}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: PURPLE }}>
                      {p.category}
                    </p>
                    <h3 className="mt-2 font-bold leading-snug" style={{ color: NAVY, fontSize: 16 }}>
                      {p.h1}
                    </h3>
                    <span
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"
                      style={{ color: PURPLE }}
                    >
                      Read <ArrowRight size={12} strokeWidth={2.5} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
