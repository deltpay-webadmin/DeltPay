import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowRight,
  Globe,
  Search,
  Sparkles,
  CreditCard,
  Shield,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router';
import { motion, useInView, AnimatePresence } from 'motion/react';

/* Site screenshot imports */
import kuroImage from 'figma:asset/1d0db1281bd14c754a9553ab1ad8506a3fe60f66.png';
import tundraImage from 'figma:asset/88a3efe80e4d12e8ba783b127acb1ca97214e38e.png';
import apexImage from 'figma:asset/f45d325d6e953354587659092d539fa3d5f262fe.png';
import gringosImage from 'figma:asset/75c26bd891b1a9364a0c6ffff2c13f39ddaca199.png';

const harlowImage =
  'https://images.unsplash.com/photo-1771206331424-44b8ec9acdf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBib3V0aXF1ZSUyMGhvdGVsJTIwbG9iYnklMjBpbnRlcmlvciUyMGVsZWdhbnR8ZW58MXx8fHwxNzcyNzI2ODM3fDA&ixlib=rb-4.1.0&q=80&w=1080';

/* ═══════════════════════════════════════════════════════════
   CONSTANTS & DATA
   ═══════════════════════════════════════════════════════════ */
const ACCENT = '#4945FF';
const DEEP = '#0a1628';

/* Ordered bottom→top (index 0 = foundation layer 01) */
const LAYERS = [
  {
    id: 'uptime',
    num: '01',
    headline: 'Always on.',
    detail:
      '99.9% uptime. Bank-grade security. The foundation you never think about — because you never have to.',
    icon: Shield,
    color: '#60A5FA',
  },
  {
    id: 'domain',
    num: '02',
    headline: 'Your brand, your domain.',
    detail:
      'yourbusiness.com — not yourname.someplatform.com. Your name. Your identity. Customers trust what they recognize.',
    icon: Globe,
    color: '#34D399',
  },
  {
    id: 'seo',
    num: '03',
    headline: 'Customers find you.',
    detail:
      "SEO-ready. Mobile-first. Fast on every device. Your site doesn't just exist — it works.",
    icon: Search,
    color: '#FBBF24',
  },
  {
    id: 'design',
    num: '04',
    headline: 'Looks like you hired an agency.',
    detail:
      "Professional design. Smooth animations. Modern layouts. This is the layer you'll screenshot and show everyone.",
    icon: Sparkles,
    color: '#F472B6',
  },
  {
    id: 'payments',
    num: '05',
    headline: 'Get paid on your site.',
    detail:
      'Accept payments directly. Every transaction builds your Delt profile for better capital terms. No other builder does this.',
    icon: CreditCard,
    color: '#A78BFA',
  },
  {
    id: 'launch',
    num: '06',
    headline: 'Live in days, not months.',
    detail:
      'Every layer below is impressive — but this is the one that makes you think "I could do this right now."',
    icon: Zap,
    color: '#4945FF',
  },
];

/* Visual order: 06 at top → 01 at bottom */
const DISPLAY_ORDER = [...LAYERS].reverse();

/* Group 2 = top 3 (layers 06, 05, 04) — enters first on scroll
   Group 1 = bottom 3 (layers 03, 02, 01) — enters second */
const GROUP_TOP_IDS = new Set(['launch', 'payments', 'design']);
const GROUP_BOT_IDS = new Set(['seo', 'domain', 'uptime']);

/* Default active: layer 06 */
const DEFAULT_ACTIVE = 'launch';

/* Showcase sites */
const SHOWCASE_SITES = [
  { name: 'Kuro', type: 'Restaurant', image: kuroImage },
  { name: 'Tundra', type: 'Outerwear', image: tundraImage },
  { name: 'Apex', type: 'Fitness', image: apexImage },
  { name: 'Gringos', type: 'Barbershop', image: gringosImage },
  { name: 'The Harlow', type: 'Boutique Hotel', image: harlowImage },
];

/* ═══════════════════════════════════════════════════════════
   LAYER CARD
   ═══════════════════════════════════════════════════════════ */
type LayerData = (typeof LAYERS)[0];

function LayerCard({
  layer,
  isActive,
  onClick,
  staggerDelay,
}: {
  layer: LayerData;
  isActive: boolean;
  onClick: () => void;
  staggerDelay: number;
}) {
  const Icon = layer.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: staggerDelay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        border: isActive
          ? `1px solid ${layer.color}60`
          : '1px solid rgba(255,255,255,0.06)',
        background: isActive
          ? `linear-gradient(135deg, ${layer.color}0A 0%, rgba(10,22,40,0.95) 100%)`
          : 'rgba(255, 255, 255, 0.025)',
        backdropFilter: 'blur(16px)',
        boxShadow: isActive
          ? `0 0 40px ${layer.color}15, 0 8px 32px rgba(0,0,0,0.4)`
          : '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'border 0.4s, background 0.4s, box-shadow 0.4s',
      }}
    >
      <div className="flex items-center px-5 sm:px-7 py-4 sm:py-5 gap-4 sm:gap-5">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: isActive
              ? `${layer.color}20`
              : 'rgba(255,255,255,0.04)',
            transition: 'background 0.4s',
          }}
        >
          <Icon
            className="w-[18px] h-[18px]"
            style={{
              color: isActive ? layer.color : '#475569',
              transition: 'color 0.4s',
            }}
          />
        </div>

        {/* Number */}
        <div
          className="text-[11px] tracking-[0.12em] shrink-0"
          style={{
            color: isActive ? layer.color : '#475569',
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            transition: 'color 0.4s',
          }}
        >
          {layer.num}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div
            style={{
              color: isActive ? '#F1F5F9' : '#94A3B8',
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9375rem',
              lineHeight: 1.3,
              transition: 'color 0.4s',
            }}
          >
            {layer.headline}
          </div>

          <AnimatePresence initial={false}>
            {isActive && (
              <motion.div
                key="desc"
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 6 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div
                  className="max-w-[420px]"
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                  }}
                >
                  {layer.detail}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dot indicator */}
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: isActive ? layer.color : 'rgba(255,255,255,0.2)',
            boxShadow: isActive ? `0 0 12px ${layer.color}80` : 'none',
            transition: 'all 0.4s',
          }}
        />
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AUTO-SCROLLING SHOWCASE CAROUSEL
   ═══════════════════════════════════════════════════════════ */
function ShowcaseCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const items = [...SHOWCASE_SITES, ...SHOWCASE_SITES];
  const CARD_W = 340;
  const GAP = 20;
  const totalW = SHOWCASE_SITES.length * (CARD_W + GAP);

  return (
    <div ref={ref} className="overflow-hidden mt-20 sm:mt-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-10 px-6">
          <p
            className="text-[10px] tracking-[0.2em] mb-3"
            style={{
              color: '#64748B',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
            }}
          >
            BUILT WITH DELT
          </p>
          <h3
            style={{
              color: '#F1F5F9',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              letterSpacing: '-0.02em',
            }}
          >
            Real sites. Real businesses.
          </h3>
        </div>

        {/* Carousel */}
        <div
          className="overflow-hidden"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
          }}
        >
          <div
            className="flex items-end"
            style={{
              gap: GAP,
              width: totalW * 2,
              animation: 'showcaseScroll 35s linear infinite',
            }}
          >
            {items.map((site, i) => (
              <div
                key={`${site.name}-${i}`}
                className="shrink-0 rounded-xl overflow-hidden relative"
                style={{
                  width: CARD_W,
                  height: 200,
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                <img
                  src={site.image}
                  alt={site.name}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)',
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                  <div
                    className="text-sm mb-0.5"
                    style={{
                      color: '#F1F5F9',
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {site.name}
                  </div>
                  <span
                    className="text-[10px] tracking-[0.08em]"
                    style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                    }}
                  >
                    {site.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes showcaseScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${totalW}px); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export function WebsiteDeconstruction() {
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);

  /* Scroll-trigger refs for the two groups */
  const topGroupRef = useRef<HTMLDivElement>(null);
  const botGroupRef = useRef<HTMLDivElement>(null);
  const topInView = useInView(topGroupRef, { once: true, margin: '-80px' });
  const botInView = useInView(botGroupRef, { once: true, margin: '-80px' });

  /* Auto-expand: layer 06 when top group enters, then layer 03 if clicked into bottom */
  const topAutoFired = useRef(false);
  useEffect(() => {
    if (topInView && !topAutoFired.current) {
      topAutoFired.current = true;
      const timer = setTimeout(() => {
        setActiveLayerId(DEFAULT_ACTIVE);
      }, 3 * 150 + 500);
      return () => clearTimeout(timer);
    }
  }, [topInView]);

  const handleSelect = useCallback((id: string) => {
    setActiveLayerId((prev) => (prev === id ? null : id));
  }, []);

  /* Split display order into top group and bottom group */
  const topLayers = DISPLAY_ORDER.filter((l) => GROUP_TOP_IDS.has(l.id));
  const botLayers = DISPLAY_ORDER.filter((l) => GROUP_BOT_IDS.has(l.id));

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: DEEP,
        paddingTop: 'clamp(80px, 12vh, 140px)',
        paddingBottom: 'clamp(60px, 8vh, 100px)',
      }}
    >
      {/* Background radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 900,
          height: 900,
          left: '50%',
          top: '35%',
          transform: 'translate(-50%, -50%)',
          background: activeLayerId
            ? `radial-gradient(circle, ${
                LAYERS.find((l) => l.id === activeLayerId)?.color ?? ACCENT
              }10 0%, transparent 60%)`
            : `radial-gradient(circle, ${ACCENT}08 0%, transparent 60%)`,
          transition: 'background 0.8s',
        }}
      />

      <div className="relative z-10 max-w-xl mx-auto px-5 sm:px-6">
        {/* Hero Title */}
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2
            style={{
              color: '#F8FAFC',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            Your site,
            <br />
            <span style={{ color: '#94A3B8' }}>built layer by layer.</span>
          </h2>
          <p
            className="mt-4 max-w-md mx-auto"
            style={{
              color: '#64748B',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9375rem',
              lineHeight: 1.65,
            }}
          >
            Bottom to top. Like a building going up. Watch your digital
            foundation get laid — then see everything stack on top.
          </p>
        </motion.div>

        {/* ─── Layer Stack ─── */}
        <div className="flex flex-col gap-2.5">
          {/* Top group: layers 06, 05, 04 */}
          <div ref={topGroupRef} className="flex flex-col gap-2.5">
            {topInView &&
              topLayers.map((layer, i) => (
                <LayerCard
                  key={layer.id}
                  layer={layer}
                  isActive={activeLayerId === layer.id}
                  onClick={() => handleSelect(layer.id)}
                  staggerDelay={i * 0.15}
                />
              ))}
          </div>

          {/* Bottom group: layers 03, 02, 01 */}
          <div ref={botGroupRef} className="flex flex-col gap-2.5">
            {botInView &&
              botLayers.map((layer, i) => (
                <LayerCard
                  key={layer.id}
                  layer={layer}
                  isActive={activeLayerId === layer.id}
                  onClick={() => handleSelect(layer.id)}
                  staggerDelay={i * 0.15}
                />
              ))}
          </div>
        </div>

        {/* CTA */}
        <CtaBlock />
      </div>

      {/* Showcase carousel — full width */}
      <ShowcaseCarousel />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CTA BLOCK
   ═══════════════════════════════════════════════════════════ */
function CtaBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className="text-center mt-14 sm:mt-18"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <p
        className="mb-5"
        style={{
          color: '#F1F5F9',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: '1.25rem',
          letterSpacing: '-0.02em',
        }}
      >
        All of this. One platform.
      </p>
      <Link
        to="/pricing"
        className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm text-white transition-all hover:brightness-110"
        style={{
          background: ACCENT,
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
          boxShadow: `0 4px 24px ${ACCENT}40`,
        }}
      >
        Start building with Delt
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}