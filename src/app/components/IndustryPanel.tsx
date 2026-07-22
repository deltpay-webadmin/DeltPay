import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

/* ════════════════════════════════════════════════════════════
   "Made for how you actually work." panel
   4 industry cards inspired by the approved mockup.
   Routes to /industries/{slug} \u2014 real pages exist (placeholder
   content until Wave 3 fleshes them out).
   Palette: strictly #FFFFFF / #041E42 / #4945FF.
   ════════════════════════════════════════════════════════════ */

interface CardDef {
  slug: string;
  category: string;
  title: string;
  image: string;
}

/* Bespoke, on-brand industry photography generated with Higgsfield
   (soul_2), color-graded to Delt's indigo/navy palette — replacing the
   previous generic Unsplash stock. Served from the Higgsfield CDN, same
   external-image pattern as before; the optimized _min.webp variants keep
   the page weight in check. */
const CARDS: CardDef[] = [
  {
    slug: 'restaurants',
    category: 'RESTAURANT',
    title: 'Full service',
    image:
      'https://d8j0ntlcm91z4.cloudfront.net/user_3GrS2UWtF81Y8aeL6zXsuXMKa8U/hf_20260722_150358_98dc2d76-98de-4261-a4bf-8de7036f240b_min.webp',
  },
  {
    slug: 'retail',
    category: 'RETAIL',
    title: 'Boutique',
    image:
      'https://d8j0ntlcm91z4.cloudfront.net/user_3GrS2UWtF81Y8aeL6zXsuXMKa8U/hf_20260722_150409_a6978ddf-ceaf-4d7d-a704-3183d94e8f65_min.webp',
  },
  {
    slug: 'health-wellness',
    category: 'FITNESS',
    title: 'Studio',
    image:
      'https://d8j0ntlcm91z4.cloudfront.net/user_3GrS2UWtF81Y8aeL6zXsuXMKa8U/hf_20260722_150411_b739f001-e731-4b84-8a5a-4fda4bef1e5a_min.webp',
  },
  {
    slug: 'salon-barber',
    category: 'SERVICES',
    title: 'Salon & spa',
    image:
      'https://d8j0ntlcm91z4.cloudfront.net/user_3GrS2UWtF81Y8aeL6zXsuXMKa8U/hf_20260722_150413_b9868ff5-bcb2-46a5-8ba5-fab897ce4961_min.webp',
  },
];

export function IndustryPanel() {
  return (
    <section style={{ background: '#FFFFFF', padding: '120px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header row */}
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <div>
            <div
              className="mb-4"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#697386',
              }}
            >
              — FOR YOUR KIND OF BUSINESS
            </div>
            <h2
              className="text-[#041E42]"
              style={{
                fontSize: 'clamp(34px, 5vw, 56px)',
                fontFamily: "'Manrope', 'Inter Tight', sans-serif",
                fontWeight: 600,
                letterSpacing: '-0.035em',
                lineHeight: 1.05,
                maxWidth: 820,
              }}
            >
              Made for how you actually{' '}
              <em
                style={{
                  fontFamily: "'Source Serif Pro', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#3730A3',
                }}
              >
                work.
              </em>
            </h2>
          </div>
          <Link
            to="/business-types"
            className="inline-flex items-center gap-2 text-[#041E42] text-[15px] font-semibold hover:text-[#4945FF] transition-colors group"
          >
            See every industry
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 0.9, 0.3, 1] }}
            >
              <Link
                to={`/industries/${c.slug}`}
                className="group relative block overflow-hidden rounded-2xl"
                style={{
                  aspectRatio: '3 / 4',
                  boxShadow: '0 2px 16px rgba(4,30,66,0.08)',
                }}
              >
                {/* Image */}
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />

                {/* Bottom gradient for legible text */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(4,30,66,0) 40%, rgba(8,10,40,0.55) 75%, rgba(8,10,40,0.9) 100%)',
                  }}
                />

                {/* Category pill (top) */}
                <div
                  className="absolute top-5 left-5 px-3 py-1 rounded-full text-[10.5px] font-bold"
                  style={{
                    background: 'rgba(255,255,255,0.92)',
                    color: '#041E42',
                    letterSpacing: '0.14em',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  {c.category}
                </div>

                {/* Title + arrow (bottom) */}
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div
                    className="text-white font-semibold"
                    style={{
                      fontSize: 22,
                      letterSpacing: '-0.01em',
                      lineHeight: 1.15,
                    }}
                  >
                    {c.title}
                  </div>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: '#4945FF' }}
                  >
                    <ArrowRight className="w-4 h-4 text-white" strokeWidth={2.4} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
