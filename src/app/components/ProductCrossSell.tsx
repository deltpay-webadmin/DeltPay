import { CreditCard, TrendingUp, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

interface ProductCrossSellProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** Slug of the current product to de-emphasize or hide in the grid */
  currentProduct?: 'payments' | 'capital' | 'websites' | 'lens';
  /** 'dark' = navy background (default). 'light' = white background, navy text. */
  variant?: 'dark' | 'light';
}

const PRODUCTS = [
  {
    slug: 'payments' as const,
    icon: CreditCard,
    name: 'Payments',
    blurb: 'Accept every card, tap, and transfer — with the lowest transparent rates in the business.',
    path: '/payments',
    stat: '$847',
    statLabel: 'avg. monthly savings',
  },
  {
    slug: 'capital' as const,
    icon: TrendingUp,
    name: 'Capital',
    blurb: 'Fast, flexible funding from $1K–$300K. Repayment flexes with your daily sales.',
    path: '/capital',
    stat: '$50M',
    statLabel: 'capital deployed',
  },
  {
    slug: 'websites' as const,
    icon: Globe,
    name: 'Websites',
    blurb: 'Launch a site that actually sells in five days, not five months.',
    path: '/websites',
    stat: '5 days',
    statLabel: 'average go-live',
  },
  {
    slug: 'lens' as const,
    icon: Sparkles,
    name: 'Lens AI',
    blurb: 'Ask anything about your business and get an answer — not a dashboard.',
    path: '/lens-ai',
    stat: 'Always on',
    statLabel: 'AI business analyst',
  },
];

export function ProductCrossSell({
  eyebrow = 'One platform, every tool you need',
  title = 'Better together',
  subtitle = 'Every Delt product plugs into the same stack. Your data stays in one place — so you can move faster.',
  currentProduct,
  variant = 'dark',
}: ProductCrossSellProps) {
  const navigate = useNavigate();
  const products = PRODUCTS.filter((p) => p.slug !== currentProduct);
  const isLight = variant === 'light';

  return (
    <section
      className={`relative overflow-hidden py-20 lg:py-28 ${isLight ? 'bg-white' : 'bg-[#041E42] text-white'}`}
    >
      {/* Soft purple radial glow (grid removed for cleaner background) */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none ${
          isLight ? 'bg-[#4945FF]/8' : 'bg-[#4945FF]/15'
        }`}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div
            className="mb-6"
            style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: '12px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: isLight ? '#697386' : 'rgba(247, 245, 240, 0.65)',
            }}
          >
            — {eyebrow}
          </div>
          <h2
            className={`text-4xl sm:text-5xl mb-4 ${isLight ? 'text-[#041E42]' : 'text-white'}`}
            style={{
              fontFamily: "'Manrope', 'Inter Tight', sans-serif",
              fontWeight: 600,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
            }}
          >
            {title.split(' ').map((word, i, arr) => (
              i === arr.length - 1 ? (
                <em
                  key={i}
                  style={{
                    fontFamily: "'Source Serif Pro', Georgia, serif",
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: isLight ? '#3730A3' : '#A5B4FC',
                  }}
                >
                  {word}
                </em>
              ) : (
                <span key={i}>{word} </span>
              )
            ))}
          </h2>
          <p className={`text-lg ${isLight ? 'text-[#475569]' : 'text-white/70'}`} style={{ fontFamily: "'Inter', sans-serif" }}>{subtitle}</p>
        </div>

        <div className={`grid gap-5 ${products.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
          {products.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.slug}
                onClick={() => navigate(p.path)}
                className={`group text-left relative p-6 transition-all duration-300 ${
                  isLight
                    ? 'bg-white border border-[#041E42]/10 hover:border-[#4945FF]/60'
                    : 'bg-white/5 border border-white/10 hover:border-[#4945FF]/60 hover:bg-white/[0.08]'
                }`}
                style={{ borderRadius: '6px' }}
              >
                <div className="w-11 h-11 bg-[#4945FF] flex items-center justify-center mb-5" style={{ borderRadius: '6px' }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  <h3
                    className={`text-xl ${isLight ? 'text-[#041E42]' : 'text-white'}`}
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 600,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {p.name}
                  </h3>
                  <span
                    className="text-[#4945FF]"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '11px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {p.stat}
                  </span>
                </div>
                <p
                  className={`text-sm leading-relaxed mb-6 min-h-[60px] ${
                    isLight ? 'text-[#475569]' : 'text-white/65'
                  }`}
                >
                  {p.blurb}
                </p>
                <div className="flex items-center gap-2 text-[#4945FF] font-semibold text-sm group-hover:gap-3 transition-all">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
