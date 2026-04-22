import { CreditCard, TrendingUp, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

interface ProductCrossSellProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** Slug of the current product to de-emphasize or hide in the grid */
  currentProduct?: 'payments' | 'capital' | 'websites' | 'lens';
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
    stat: '24/7',
    statLabel: 'AI business analyst',
  },
];

export function ProductCrossSell({
  eyebrow = 'One platform, every tool you need',
  title = 'Better together',
  subtitle = 'Every Delt product plugs into the same stack. Your data stays in one place — so you can move faster.',
  currentProduct,
}: ProductCrossSellProps) {
  const navigate = useNavigate();
  const products = PRODUCTS.filter((p) => p.slug !== currentProduct);

  return (
    <section className="relative overflow-hidden bg-[#041E42] text-white py-20 lg:py-28">
      {/* Backdrop */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#4945FF]/15 blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#4945FF]" />
            {eyebrow}
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{title}</h2>
          <p className="text-lg text-white/70">{subtitle}</p>
        </div>

        <div className={`grid gap-5 ${products.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
          {products.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.slug}
                onClick={() => navigate(p.path)}
                className="group text-left relative rounded-2xl p-6 bg-white/5 border border-white/10 hover:border-[#4945FF]/60 hover:bg-white/[0.08] transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-[#4945FF] flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                  <span className="text-xs uppercase tracking-wider text-[#4945FF] font-semibold">
                    {p.stat}
                  </span>
                </div>
                <p className="text-sm text-white/65 leading-relaxed mb-6 min-h-[60px]">
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
