/**
 * DeltPay design-system primitives for the CRM.
 *
 * Implements the component contracts from DELTPAY_DESIGN_SPEC.md §3 on the
 * dark token set: the number is the hero, cobalt only means action/money,
 * status is always pill + word, and every numeral is tabular.
 */
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

// ── Money ───────────────────────────────────────────────────────
// Spec §2.2: on large metrics, cents render dimmed at the same size so the
// whole dollars carry the eye. Ship as one component so it's consistent.
export function Money({
  value,
  cents = true,
  className = '',
}: {
  value: number;
  cents?: boolean;
  className?: string;
}) {
  const neg = value < 0;
  const abs = Math.abs(value);
  const whole = Math.floor(abs);
  const fraction = Math.round((abs - whole) * 100);
  return (
    <span className={`tabular-nums ${className}`}>
      {neg && '−'}${whole.toLocaleString('en-US')}
      {cents && (
        <span className="text-(--dp-text-faint)">.{String(fraction).padStart(2, '0')}</span>
      )}
    </span>
  );
}

// ── Overline ────────────────────────────────────────────────────
export function Overline({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-[11px] font-bold uppercase tracking-[0.14em] text-(--dp-text-muted) ${className}`}>
      {children}
    </span>
  );
}

// ── Delta pill ──────────────────────────────────────────────────
// Direction is metric-dependent: pass invert for metrics where up is bad
// (chargeback rate, decision time). Flat deltas stay neutral.
export function DeltaPill({
  value,
  suffix = '%',
  invert = false,
  onGlass = false,
  className = '',
}: {
  value: number;
  suffix?: string;
  invert?: boolean;
  onGlass?: boolean;
  className?: string;
}) {
  const flat = value === 0;
  const favorable = invert ? value < 0 : value > 0;
  const tone = onGlass
    ? flat
      ? 'text-white/80 bg-black/25'
      : favorable
        ? 'text-[#7DF5B4] bg-black/25'
        : 'text-[#FFB0B3] bg-black/25'
    : flat
      ? 'text-(--dp-text-muted) bg-white/[0.08]'
      : favorable
        ? 'text-(--dp-success) bg-[rgba(52,199,123,0.14)]'
        : 'text-(--dp-danger) bg-[rgba(242,86,91,0.14)]';
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-[8px] px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${tone} ${className}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 1 })}
      {suffix}
    </span>
  );
}

// ── KpiTile ─────────────────────────────────────────────────────
export function KpiTile({
  label,
  value,
  delta,
  deltaSuffix,
  invertDelta,
  sub,
  glass = false,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  delta?: number;
  deltaSuffix?: string;
  invertDelta?: boolean;
  sub?: React.ReactNode;
  glass?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[12px] p-4 ${
        glass ? 'dp-glass' : 'bg-(--dp-bg-card) border border-(--dp-border)'
      } ${className}`}
    >
      <p className={`text-[12px] font-medium leading-tight ${glass ? 'text-white/60' : 'text-(--dp-text-muted)'}`}>{label}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className={`text-[28px] leading-[1.1] font-bold tabular-nums tracking-[-0.01em] ${glass ? 'text-white' : 'text-(--dp-text)'}`}>
          {value}
        </span>
        {delta !== undefined && (
          <DeltaPill value={delta} suffix={deltaSuffix} invert={invertDelta} onGlass={glass} />
        )}
      </div>
      {sub && <p className={`mt-1 text-[12px] leading-tight ${glass ? 'text-white/50' : 'text-(--dp-text-faint)'}`}>{sub}</p>}
    </div>
  );
}

// ── StatusPill ──────────────────────────────────────────────────
// Word + 14% tint of the same hue. Never a bare dot.
export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'capital' | 'accent';

const TONE_STYLE: Record<StatusTone, string> = {
  success: 'text-(--dp-success) bg-[rgba(52,199,123,0.14)]',
  warning: 'text-(--dp-warning) bg-[rgba(240,180,41,0.14)]',
  danger: 'text-(--dp-danger) bg-[rgba(242,86,91,0.14)]',
  neutral: 'text-(--dp-text-muted) bg-white/[0.08]',
  capital: 'text-[#A794FF] bg-[rgba(124,91,255,0.16)]',
  accent: 'text-(--dp-accent-text) bg-(--dp-accent-soft)',
};

export function StatusPill({
  tone,
  children,
  className = '',
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-[8px] px-[9px] py-[3px] text-[11px] font-bold whitespace-nowrap ${TONE_STYLE[tone]} ${className}`}>
      {children}
    </span>
  );
}

// ── Card ────────────────────────────────────────────────────────
export function Card({
  title,
  action,
  children,
  className = '',
  padded = true,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={`rounded-[16px] bg-(--dp-bg-card) border border-(--dp-border) ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <h3 className="text-[15px] font-bold text-(--dp-text)">{title}</h3>
          {action}
        </div>
      )}
      <div className={padded ? 'px-5 pb-5 pt-2' : ''}>{children}</div>
    </div>
  );
}

// ── HeroPanel ───────────────────────────────────────────────────
// Gradient money surface with a soft sphere glow — the one place gradients
// are allowed in the app.
export function HeroPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`dp-grad-panel relative overflow-hidden rounded-[16px] ${className}`}>
      <div className="dp-sphere" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}

// ── PageHeader ──────────────────────────────────────────────────
export function PageHeader({
  title,
  sub,
  actions,
  className = '',
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        <h1 className="text-[22px] leading-[1.25] font-bold text-(--dp-text) tracking-[-0.01em]">{title}</h1>
        {sub && <p className="mt-0.5 text-[13px] text-(--dp-text-muted)">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── FilterChip ──────────────────────────────────────────────────
export function FilterChip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
        active
          ? 'border-(--dp-accent) bg-(--dp-accent-soft) text-(--dp-accent-text)'
          : 'border-(--dp-border) bg-transparent text-(--dp-text-muted) hover:text-(--dp-text) hover:border-(--dp-border-strong)'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`tabular-nums text-[11px] ${active ? 'opacity-80' : 'text-(--dp-text-faint)'}`}>{count}</span>
      )}
    </button>
  );
}

// ── Buttons (spec §3) ───────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
const BTN: Record<BtnVariant, string> = {
  primary:
    'bg-(--dp-accent) text-white hover:bg-(--dp-accent-hover) active:bg-(--dp-accent-press) hover:shadow-[0_0_0_1px_rgba(46,107,255,.35),0_8px_32px_rgba(46,107,255,.20)]',
  secondary: 'bg-transparent text-(--dp-text) border border-(--dp-border-strong) hover:bg-white/[0.04]',
  ghost: 'bg-white/[0.06] text-(--dp-text) border border-(--dp-border) hover:bg-white/[0.1]',
  danger: 'bg-transparent text-(--dp-danger) border border-[rgba(242,86,91,.4)] hover:bg-[rgba(242,86,91,.08)]',
};

export function Btn({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sz =
    size === 'sm'
      ? 'h-8 px-4 text-[12px]'
      : size === 'lg'
        ? 'h-12 px-[26px] text-[15px]'
        : 'h-10 px-5 text-[14px]';
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-[10px] font-bold transition-all active:scale-[.98] disabled:opacity-40 disabled:pointer-events-none ${sz} ${BTN[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
