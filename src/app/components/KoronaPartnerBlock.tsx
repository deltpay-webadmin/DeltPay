/* ─────────────────────────────────────────────────────────────
   KoronaPartnerBlock
   ─────────────────────────────────────────────────────────────
   Reusable "Delt × KORONA POS" partnership module.

   Why this exists:
   Delt + KORONA POS is a real channel partnership. KORONA is a
   category leader for high-inventory retail, smoke shops, liquor,
   c-stores, and ticketed attractions — but they're less of a
   household name than Square / Clover / Toast. So every mention
   on the Delt site needs to (1) frame Delt as the lead brand
   (we curated this partner, we own the merchant relationship)
   while (2) embedding enough KORONA trust signal — ratings,
   merchant count, processor-agnostic positioning — to pre-empt
   the "wait, who's KORONA?" reaction in a single glance.

   Composition:
   • Eyebrow → "POS PARTNER"  (factual, not over-sold)
   • Big headline → vertical-specific (passed in)
   • Body paragraph → vertical-specific (passed in)
   • KORONA wordmark + trust micro-line (4.8/5 · 2,000+ merchants
     · processor-agnostic)
   • Verbatim KORONA-approved value props (4 bullets) — quoted
     from the partner branding kit so we're never off-message
   • Optional merchant testimonial (passed in)

   Two color variants:
   • 'light'   — for IVORY / white sections (HighRiskProcessing,
                 IndustryPage retail body, etc.)
   • 'dark'    — for navy / #080A28 surfaces (future use, e.g. a
                 future attractions page hero)
   ───────────────────────────────────────────────────────────── */

import { motion } from 'motion/react';
import { Check, Star, Building2, Shuffle } from 'lucide-react';
import koronaWordmark from '@/assets/korona-pos-wordmark.jpg';

// Delt brand tokens — kept inline so this component drops into any page
const NAVY     = '#041E42';
const PURPLE   = '#4945FF';
const LAVENDER = '#EDEBFF';
const MUTED    = '#475569';
const MICRO    = '#94A3B8';
const HAIRLINE = 'rgba(4,30,66,0.10)';

type Variant = 'light' | 'dark';

interface Props {
  /** Visual variant for the surrounding section background. */
  variant?: Variant;
  /** Short label above the title, e.g. "Delt × KORONA POS". Defaults to "POS PARTNER". */
  eyebrow?: string;
  /** Big bold title — vertical-specific framing. */
  title: string;
  /** Lead paragraph — explains why this partnership matters for the vertical. */
  body: string;
  /**
   * Up to 4 short value-prop bullets. Defaults to the four KORONA-approved
   * value props from the partner branding kit (paraphrased to fit on cards).
   * Pass your own to scope the message to a specific vertical.
   */
  bullets?: { title: string; body: string }[];
  /** Optional merchant quote from the KORONA sales kit. */
  testimonial?: {
    quote: string;
    name: string;
    role: string;
  };
}

// Default 4 value props — distilled from the KORONA partner kit's
// "What We Do" + the smoke/liquor sell sheets. These read on any vertical.
const DEFAULT_BULLETS: { title: string; body: string }[] = [
  {
    title: 'High-SKU inventory, mastered',
    body: 'Reorder points, vendor tracking, stock notifications, and deep custom reports — built for operators who carry thousands of items.',
  },
  {
    title: 'Multi-location ready',
    body: 'Run a single shop or a multi-state chain on the same platform. Add locations and franchises without rebuilding your stack.',
  },
  {
    title: 'Cloud-based, real-time',
    body: 'Access your POS data from store, home, or on the road. Updates push instantly across every register and location.',
  },
  {
    title: 'Award-winning 24/7 support',
    body: 'In-house team by phone, chat, email, or manual — recognized across G2, Capterra, and Software Advice.',
  },
];

// Tiny inline icons keyed to bullet positions, for visual rhythm
const BULLET_ICONS = [Building2, Shuffle, Check, Star];

export function KoronaPartnerBlock({
  variant = 'light',
  eyebrow = 'POS partner',
  title,
  body,
  bullets = DEFAULT_BULLETS,
  testimonial,
}: Props) {
  const isDark = variant === 'dark';

  // Surface tokens — switch by variant
  const surfaceBg     = isDark ? '#0B1130' : '#FFFFFF';
  const cardBg        = isDark ? 'rgba(255,255,255,0.04)' : '#FAFBFD';
  const cardBorder    = isDark ? 'rgba(255,255,255,0.10)' : HAIRLINE;
  const titleColor    = isDark ? '#FFFFFF' : NAVY;
  const bodyColor     = isDark ? 'rgba(255,255,255,0.72)' : MUTED;
  const subtleColor   = isDark ? 'rgba(255,255,255,0.55)' : MICRO;
  const eyebrowColor  = PURPLE;
  const accentChip    = isDark ? 'rgba(73,69,255,0.18)' : LAVENDER;
  const logoBg        = isDark ? 'rgba(255,255,255,0.94)' : '#FFFFFF';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55 }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: surfaceBg,
        border: `1px solid ${cardBorder}`,
      }}
    >
      <div className="p-8 lg:p-12">
        {/* ── Header row: eyebrow + KORONA wordmark + trust badges ── */}
        <div className="flex flex-wrap items-center justify-between gap-5 mb-7">
          <div
            className="text-[12px] font-bold uppercase"
            style={{ color: eyebrowColor, letterSpacing: '0.18em' }}
          >
            {eyebrow}
          </div>

          {/* Wordmark capsule — sits in a white pill so the dark KORONA
              lockup never fights the section background. */}
          <a
            href="https://koronapos.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="KORONA POS — visit koronapos.com"
            className="inline-flex items-center gap-3 rounded-full px-4 py-2 transition-all"
            style={{
              background: logoBg,
              border: `1px solid ${cardBorder}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <img
              src={koronaWordmark}
              alt="KORONA POS by COMBASE"
              className="block h-5 w-auto"
              style={{ objectFit: 'contain' }}
              draggable={false}
            />
          </a>
        </div>

        {/* ── Headline + body ── */}
        <h3
          className="font-extrabold leading-[1.08] mb-5"
          style={{
            color: titleColor,
            fontSize: 'clamp(28px, 3.4vw, 40px)',
            letterSpacing: '-0.02em',
            maxWidth: 760,
          }}
        >
          {title}
        </h3>
        <p
          className="text-[17px] leading-relaxed mb-7"
          style={{ color: bodyColor, maxWidth: 720 }}
        >
          {body}
        </p>

        {/* ── Trust micro-line — the "who's KORONA?" pre-empt ──
             Compact stat row that buys credibility in 2 seconds. */}
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-9 text-[13px] font-semibold"
          style={{ color: subtleColor }}
        >
          <span className="inline-flex items-center gap-2">
            <Star size={14} style={{ color: '#F59E0B' }} fill="#F59E0B" strokeWidth={0} />
            <span style={{ color: titleColor }}>4.8/5</span>
            <span>across G2, Capterra, Trustpilot</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Building2 size={14} style={{ color: eyebrowColor }} strokeWidth={2} />
            <span style={{ color: titleColor }}>2,000+</span>
            <span>North American merchants</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Shuffle size={14} style={{ color: eyebrowColor }} strokeWidth={2} />
            <span>Processor-agnostic — Delt handles payments</span>
          </span>
        </div>

        {/* ── Value-prop bullets (2×2 grid on lg, single column on sm) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          {bullets.slice(0, 4).map((b, i) => {
            const Icon = BULLET_ICONS[i % BULLET_ICONS.length];
            return (
              <div
                key={b.title}
                className="rounded-2xl p-5 flex items-start gap-4"
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: accentChip,
                    border: `1px solid ${isDark ? 'rgba(73,69,255,0.30)' : 'rgba(73,69,255,0.18)'}`,
                  }}
                >
                  <Icon size={16} style={{ color: eyebrowColor }} strokeWidth={2} />
                </div>
                <div>
                  <div
                    className="text-[15px] font-bold leading-tight mb-1"
                    style={{ color: titleColor, letterSpacing: '-0.005em' }}
                  >
                    {b.title}
                  </div>
                  <div
                    className="text-[14px] leading-relaxed"
                    style={{ color: bodyColor }}
                  >
                    {b.body}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Optional testimonial pulled from the KORONA sales kit ── */}
        {testimonial && (
          <div
            className="mt-7 rounded-2xl p-6 lg:p-7"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(73,69,255,0.18) 0%, rgba(73,69,255,0.06) 100%)'
                : `linear-gradient(135deg, ${LAVENDER} 0%, #FFFFFF 100%)`,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <blockquote
              className="text-[16px] lg:text-[17px] font-medium leading-[1.5] mb-4"
              style={{ color: titleColor, letterSpacing: '-0.005em' }}
            >
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <div className="text-[13px]" style={{ color: subtleColor }}>
              <span className="font-bold" style={{ color: titleColor }}>
                {testimonial.name}
              </span>
              <span> · {testimonial.role}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default KoronaPartnerBlock;
