import { TrendingUp, Zap, Clock, Sliders, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

interface CapitalCrossSellProps {
  /** 'dark' = navy on-palette (default for light pages). 'light' = white card on tinted bg. */
  variant?: 'dark' | 'light';
  /** Headline override */
  title?: string;
  /** Subhead override */
  subtitle?: string;
  /** Eyebrow override */
  eyebrow?: string;
}

const NAVY = '#041E42';
const PURPLE = '#4945FF';
const MUTED = '#475569';
const MICRO = '#94A3B8';
const HAIRLINE = 'rgba(4,30,66,0.10)';

/**
 * Capital-led cross-sell for Merchant Services audiences.
 *
 * Story: when you process with Delt, you automatically get a pre-approval
 * offer for Capital — accept it or request more. No separate application,
 * best rates, flexible repayment, funded in 24–48 hours.
 */
export function CapitalCrossSell({
  variant = 'dark',
  eyebrow = 'One company, two products',
  title = 'Process with Delt. Get pre-approved for Capital — automatically.',
  subtitle = "Every merchant on Delt gets an automatic pre-approval offer based on processing history. Accept it as-is or request more — your sales are your application.",
}: CapitalCrossSellProps) {
  const isDark = variant === 'dark';

  const points = [
    { icon: Zap, label: 'Auto pre-approval', detail: 'No separate application — your processing is your application.' },
    { icon: TrendingUp, label: 'Best rates', detail: 'Loyalty pricing for active Delt merchants.' },
    { icon: Sliders, label: 'Flexible repayment', detail: 'Daily holdback flexes with your sales.' },
    { icon: Clock, label: '24–48 hr funding', detail: 'Deposited straight into your Delt account.' },
  ];

  return (
    <section
      className="relative overflow-hidden py-20 lg:py-24"
      style={{ background: isDark ? NAVY : '#FFFFFF' }}
    >
      {/* Soft purple glow */}
      <div
        className="absolute pointer-events-none rounded-full blur-[140px]"
        style={{
          top: '-120px',
          right: '-120px',
          width: 520,
          height: 520,
          background: isDark ? `${PURPLE}40` : `${PURPLE}18`,
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full blur-[140px]"
        style={{
          bottom: '-160px',
          left: '-120px',
          width: 460,
          height: 460,
          background: isDark ? `${PURPLE}25` : `${PURPLE}10`,
        }}
      />

      <div className="relative max-w-[1240px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-start">
          {/* LEFT — message */}
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-semibold mb-6"
              style={{
                color: isDark ? '#FFFFFF' : PURPLE,
                background: isDark ? 'rgba(255,255,255,0.08)' : `${PURPLE}10`,
                border: isDark ? '1px solid rgba(255,255,255,0.16)' : `1px solid ${PURPLE}20`,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: PURPLE }} />
              {eyebrow}
            </div>

            <h2
              className="font-bold leading-[1.05] mb-5"
              style={{
                fontSize: 'clamp(30px, 4vw, 48px)',
                letterSpacing: '-0.025em',
                color: isDark ? '#FFFFFF' : NAVY,
              }}
            >
              {title}
            </h2>

            <p
              className="leading-relaxed mb-8"
              style={{
                fontSize: 'clamp(15px, 1.15vw, 17px)',
                color: isDark ? 'rgba(255,255,255,0.72)' : MUTED,
                maxWidth: 560,
              }}
            >
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/capital"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:brightness-110"
                style={{
                  background: PURPLE,
                  fontSize: 15,
                  boxShadow: `0 4px 18px ${PURPLE}40`,
                }}
              >
                See your pre-approval
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact-sales"
                className="inline-flex items-center gap-2 font-semibold transition-colors"
                style={{
                  color: isDark ? '#FFFFFF' : PURPLE,
                  fontSize: 15,
                }}
              >
                Talk to a specialist
                <ArrowRight size={14} />
              </Link>
            </div>

            <p
              className="mt-6"
              style={{
                fontSize: 12,
                color: isDark ? 'rgba(255,255,255,0.45)' : MICRO,
                lineHeight: 1.6,
                maxWidth: 520,
              }}
            >
              Delt Capital and Delt Merchant Services are products of the same company. Offers are
              presented to qualified merchants based on processing history; you can accept the
              pre-approved amount or request a higher line.
            </p>
          </div>

          {/* RIGHT — four feature points */}
          <div className="grid sm:grid-cols-2 gap-3.5">
            {points.map(({ icon: Icon, label, detail }) => (
              <div
                key={label}
                className="rounded-2xl p-5 transition-colors"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.10)'
                    : `1px solid ${HAIRLINE}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: PURPLE }}
                >
                  <Icon size={18} color="#FFFFFF" />
                </div>
                <div
                  className="font-bold mb-1"
                  style={{
                    color: isDark ? '#FFFFFF' : NAVY,
                    fontSize: 15.5,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {label}
                </div>
                <p
                  className="leading-relaxed"
                  style={{
                    color: isDark ? 'rgba(255,255,255,0.65)' : MUTED,
                    fontSize: 13.5,
                  }}
                >
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CapitalCrossSell;
