/* eslint-disable */
/**
 * Blog data module
 *
 * Generated from SEO research (see seo_blog_content.json). Each post has
 * the SEO surface (slug, seo_title, meta_description, primary_keyword, etc.)
 * plus the editorial card surface (excerpt, image, imageAlt) plus the long-form
 * markdown body for the post page.
 *
 * Adding a new post: append to POSTS, ensure slug is unique, and add a route
 * (already handled dynamically via the slug param in App.tsx).
 */

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

import seoData from './seo_blog_content.json';

export type Category = 'All' | 'Product' | 'Engineering' | 'Culture' | 'Customers' | 'Policy';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface LinkItem {
  anchor: string;
  href: string;
  source_name?: string;
}

export interface Post {
  /* Editorial / card */
  id: number;
  category: Exclude<Category, 'All'>;
  excerpt: string;
  author: string;
  date: string;
  readMin: number;
  image: string;
  imageAlt: string;

  /* SEO surface */
  slug: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  contentMarkdown: string;
  faqSchema: FaqItem[];
  internalLinks: LinkItem[];
  externalLinks: LinkItem[];
  ogImageAlt: string;
}

/** Map a photographic image + base editorial fields to one of the SEO records. */
function bind(
  /** Index of the post inside seo_blog_content.json `posts` array. */
  seoIdx: number,
  base: Pick<Post, 'id' | 'category' | 'author' | 'date' | 'readMin' | 'image' | 'imageAlt'>,
): Post {
  const seo = (seoData as any).posts[seoIdx];
  return {
    ...base,
    excerpt: seo.excerpt,
    slug: seo.slug,
    seoTitle: seo.seo_title,
    metaDescription: seo.meta_description,
    h1: seo.h1,
    primaryKeyword: seo.primary_keyword,
    secondaryKeywords: seo.secondary_keywords ?? [],
    contentMarkdown: seo.content_markdown,
    faqSchema: seo.faq_schema ?? [],
    internalLinks: seo.internal_links ?? [],
    externalLinks: seo.external_links ?? [],
    ogImageAlt: seo.og_image_alt ?? base.imageAlt,
  };
}

/* SEO post indexes (from seo_blog_content.json):
 *   0 Roma Trattoria      → FEATURED
 *   1 Hearth Bakery       → grid id 3
 *   2 North End Coffee    → grid id 1
 *   3 Camellia Florals    → grid id 2
 *   4 Page & Press Books  → grid id 4
 *   5 Marlowe & Sons      → grid id 5
 *   6 Mei's Dumpling      → grid id 6
 *   7 Anjali Yoga         → grid id 7
 *   8 Bloom Salon         → grid id 8
 *   9 Tessa & Tom Gelato  → grid id 9
 */

export const FEATURED: Post = bind(0, {
  id: 0,
  category: 'Customers',
  author: 'Avery Chen',
  date: 'Apr 18, 2026',
  readMin: 12,
  image: romaImg,
  imageAlt: 'Italian restaurant owner pouring wine for a guest in a warmly lit trattoria',
});

export const POSTS: Post[] = [
  bind(2, {
    id: 1, category: 'Customers', author: 'Daniel Kim', date: 'Apr 11, 2026', readMin: 9,
    image: coffeeImg,
    imageAlt: 'Barista handing payment terminal to customer in a brick-walled coffee shop',
  }),
  bind(3, {
    id: 2, category: 'Customers', author: 'Marcus Webb', date: 'Apr 04, 2026', readMin: 14,
    image: floristImg,
    imageAlt: 'Florist wrapping a bouquet in kraft paper at a sunlit workbench',
  }),
  bind(1, {
    id: 3, category: 'Customers', author: 'Zara Okafor', date: 'Mar 28, 2026', readMin: 7,
    image: featuredImg,
    imageAlt: 'Bakery owner reviewing capital offer on tablet beside sourdough loaves',
  }),
  bind(4, {
    id: 4, category: 'Customers', author: 'Elena Rodriguez', date: 'Mar 21, 2026', readMin: 6,
    image: bookstoreImg,
    imageAlt: 'Bookstore owner smiling with a book and coffee in a cozy bookstore-cafe',
  }),
  bind(5, {
    id: 5, category: 'Customers', author: 'Priya Patel', date: 'Mar 14, 2026', readMin: 8,
    image: butcherImg,
    imageAlt: 'Butcher handing a wrapped paper package across the counter to a customer',
  }),
  bind(6, {
    id: 6, category: 'Customers', author: 'Daniel Kim', date: 'Mar 07, 2026', readMin: 10,
    image: foodTruckImg,
    imageAlt: 'Food truck owner smiling as she hands food to a customer at golden hour',
  }),
  bind(7, {
    id: 7, category: 'Customers', author: 'Marcus Webb', date: 'Feb 28, 2026', readMin: 11,
    image: yogaImg,
    imageAlt: 'Yoga studio owner sitting cross-legged near sunlit windows with a tablet',
  }),
  bind(8, {
    id: 8, category: 'Customers', author: 'Zara Okafor', date: 'Feb 21, 2026', readMin: 5,
    image: salonImg,
    imageAlt: 'Salon owner working on a tablet next to a styling chair and round mirror',
  }),
  bind(9, {
    id: 9, category: 'Customers', author: 'Avery Chen', date: 'Feb 14, 2026', readMin: 8,
    image: gelatoImg,
    imageAlt: 'Father and daughter laughing together as they hand a gelato cone across the counter',
  }),
];

export const ALL_POSTS: Post[] = [FEATURED, ...POSTS];

export function getPostBySlug(slug: string): Post | undefined {
  return ALL_POSTS.find(p => p.slug === slug);
}

export const SITE_RECOMMENDATIONS = (seoData as any).site_recommendations;
