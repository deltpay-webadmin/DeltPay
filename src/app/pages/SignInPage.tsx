import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Eye, EyeOff, Lock, Mail, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import deltLogo from '@/assets/delt-logo-on-light.svg';
import deltIcon from '@/assets/delt-icon.svg';
/*
 * Right-panel slideshow imagery (nano-banana-pro renders): a merchant
 * running a POS terminal in store, and an in-office consultation over
 * revenue numbers — the two conversations Delt is built around.
 */
import slidePos from '@/assets/scenes/signin-merchant-pos.jpg';
import slideConsult from '@/assets/scenes/scene_office.jpg';

/** How long each slide stays up before auto-advancing. */
const SLIDE_MS = 7000;

/* ── Slide visuals ─────────────────────────────────────────────── */

function PhotoVisual({
  src,
  alt,
  chip,
}: {
  src: string;
  alt: string;
  chip: React.ReactNode;
}) {
  return (
    <div className="relative w-full max-w-[400px]">
      <img
        src={src}
        alt={alt}
        className="h-[300px] w-full rounded-2xl object-cover ring-1 ring-white/20 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7)]"
      />
      <div className="absolute -bottom-4 left-5 flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 shadow-[0_16px_40px_-10px_rgba(4,30,66,0.5)]">
        {chip}
      </div>
    </div>
  );
}

/** Mock back-office cards: a live authorization feed + volume rollup. */
function TransactionsVisual() {
  const rows = [
    { name: 'Bluebird Café', card: 'Visa •• 4821', amount: '$86.40' },
    { name: 'Hartley Hardware', card: 'Mastercard •• 0937', amount: '$412.19' },
    { name: 'Salon Vera', card: 'Amex •• 3005', amount: '$129.00' },
  ];
  const bars = [38, 52, 44, 66, 58, 80, 72];
  return (
    <div className="relative w-full max-w-[400px] pb-20 pt-9">
      {/* Approval-rate chip, floating over the feed's top edge */}
      <div className="absolute left-2 top-0 z-20 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 ring-1 ring-black/5 shadow-[0_16px_40px_-10px_rgba(4,30,66,0.5)]">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <p className="text-[12px] font-semibold text-[#041E42]">
          99.2% <span className="font-normal text-[#64748B]">approval rate</span>
        </p>
      </div>

      {/* Live authorizations feed */}
      <div className="ml-auto w-[84%] rounded-2xl bg-white p-4 ring-1 ring-black/5 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7)]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#041E42]">Transactions</p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.name} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-[#041E42]">{r.name}</p>
                <p className="text-[10px] text-[#94A3B8]">{r.card}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[12px] font-semibold text-[#041E42]">{r.amount}</p>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-600">
                  Approved
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily volume rollup, overlapping the feed's bottom-left corner */}
      <div className="absolute bottom-0 left-0 z-10 w-[52%] rounded-2xl bg-white p-4 ring-1 ring-black/5 shadow-[0_20px_50px_-14px_rgba(4,30,66,0.6)]">
        <p className="text-[11px] text-[#64748B]">Today&rsquo;s volume</p>
        <p className="mt-0.5 text-[19px] font-semibold tracking-tight text-[#041E42]">$18,246.90</p>
        <div className="mt-2.5 flex h-10 items-end gap-1">
          {bars.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${i === bars.length - 1 ? 'bg-[#4945FF]' : 'bg-[#E0E7FF]'}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
          <TrendingUp className="h-3 w-3" /> +12% vs yesterday
        </p>
      </div>
    </div>
  );
}

/** Mock capital cards: an approved offer with sales-based payback. */
function CapitalVisual() {
  return (
    <div className="relative w-full max-w-[400px]">
      <div className="mx-auto w-[88%] rounded-2xl bg-white p-5 pb-8 ring-1 ring-black/5 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#041E42]">Working capital</p>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
            Approved
          </span>
        </div>
        <p className="mt-2 text-[30px] font-semibold tracking-tight text-[#041E42]">$60,000</p>
        <p className="text-[11px] text-[#64748B]">Repays as 8% of daily card sales</p>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="text-[#64748B]">Repaid so far</span>
            <span className="font-semibold text-[#041E42]">42%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#EEF0F5]">
            <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-[#9C8CF8] to-[#4945FF]" />
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 right-2 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 ring-1 ring-black/5 shadow-[0_16px_40px_-10px_rgba(4,30,66,0.5)]">
        <ArrowUpRight className="h-4 w-4 text-[#4945FF]" />
        <p className="text-[12px] font-semibold text-[#041E42]">
          Next-day deposit <span className="font-normal text-[#64748B]">· $2,418.60</span>
        </p>
      </div>
    </div>
  );
}

/* ── Slide deck ────────────────────────────────────────────────── */

const SLIDES = [
  {
    key: 'pos',
    headline: 'Smarter payments,\nright at the counter',
    description:
      'Modern POS hardware and flat-rate processing, set up side by side with your team — no hidden markups.',
    visual: (
      <PhotoVisual
        src={slidePos}
        alt="Merchant taking a card payment on a Delt point-of-sale terminal"
        chip={
          <>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <p className="text-[12px] font-semibold text-[#041E42]">
              Deposit arriving tomorrow <span className="font-normal text-[#64748B]">· $12,480.22</span>
            </p>
          </>
        }
      />
    ),
  },
  {
    key: 'backend',
    headline: 'Every transaction,\naccounted for',
    description:
      'Authorizations, settlements, and deposits move through your Delt back office in real time.',
    visual: <TransactionsVisual />,
  },
  {
    key: 'consult',
    headline: 'Capital built around\nyour revenue',
    description:
      'Sit down with a Delt advisor and unlock working capital sized to your card sales — not a bank formula.',
    visual: (
      <PhotoVisual
        src={slideConsult}
        alt="Delt advisor consulting with a business owner about lending"
        chip={
          <>
            <TrendingUp className="h-4 w-4 shrink-0 text-[#4945FF]" />
            <p className="text-[12px] font-semibold text-[#041E42]">
              Offer approved <span className="font-normal text-[#64748B]">· $60,000</span>
            </p>
          </>
        }
      />
    ),
  },
  {
    key: 'capital',
    headline: 'Funding that follows\nyour sales',
    description:
      'Track offers, payoff progress, and next-day deposits from the same dashboard you sell with.',
    visual: <CapitalVisual />,
  },
];

/* ── Page ──────────────────────────────────────────────────────── */

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState(0);

  // If a session already exists, skip the form and go straight to the CRM.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate('/dashboard', { replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  // Auto-advance the right-panel slideshow; picking a bar resets the clock.
  useEffect(() => {
    const timer = setTimeout(() => setSlide((s) => (s + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [slide]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'User not found'
          : signInError.message,
      );
      return;
    }

    // Authenticated — land the user in the Delt back-office CRM.
    navigate('/dashboard', { replace: true });
  };

  const active = SLIDES[slide];

  return (
    <div className="min-h-screen w-full bg-[#EEF0F5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <style>{`@keyframes deltSlideFill { from { width: 0% } to { width: 100% } }`}</style>

      <div className="grid w-full max-w-[1180px] grid-cols-1 overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_-20px_rgba(4,30,66,0.25)] lg:grid-cols-2">
        {/* ── Left: form panel ─────────────────────────────────── */}
        <div className="flex min-h-[680px] flex-col px-7 py-8 sm:px-12 sm:py-10">
          <Link to="/" aria-label="Delt home" className="w-fit">
            <img src={deltLogo} alt="Delt" className="h-7 w-auto" />
          </Link>

          <div className="flex flex-1 flex-col justify-center py-8">
            <div className="mx-auto w-full max-w-[380px]">
              <div className="mb-8 text-center">
                <h1
                  className="text-[30px] text-[#041E42]"
                  style={{ fontFamily: 'var(--dc-font-display)', fontWeight: 600, letterSpacing: '-0.03em' }}
                >
                  Welcome to Delt
                </h1>
                <p className="mx-auto mt-2 max-w-[280px] text-[14px] leading-relaxed text-[#64748B]">
                  Start your experience with Delt by signing in or signing up.
                </p>
              </div>

              {/* Sign In / Sign Up toggle */}
              <div className="mb-7 grid grid-cols-2 gap-1 rounded-xl border border-[#E3E8EE] bg-white p-1">
                <button
                  type="button"
                  className="rounded-lg bg-[#EEF0F5] py-2.5 text-[14px] font-semibold text-[#041E42]"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/get-a-quote')}
                  className="rounded-lg py-2.5 text-[14px] font-medium text-[#64748B] transition-colors hover:text-[#041E42]"
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-[#041E42]">
                    Email Address <span className="text-[#4945FF]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#E3E8EE] bg-white py-[13px] pl-11 pr-4 text-[15px] text-[#041E42] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#4945FF] focus:ring-2 focus:ring-[#4945FF]/15"
                      placeholder="Enter your email address"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className="block text-[13px] font-medium text-[#041E42]">
                      Password <span className="text-[#4945FF]">*</span>
                    </label>
                    <Link
                      to="/contact"
                      className="text-[12px] font-semibold text-[#4945FF] transition-colors hover:text-[#3730FF]"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#E3E8EE] bg-white py-[13px] pl-11 pr-12 text-[15px] text-[#041E42] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#4945FF] focus:ring-2 focus:ring-[#4945FF]/15"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#4945FF]"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="!mt-7 w-full rounded-xl py-[14px] text-[15px] font-semibold text-white shadow-[0_12px_28px_-8px_rgba(73,69,255,0.6)] transition-all hover:brightness-[1.05] active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: 'linear-gradient(90deg, #9C8CF8 0%, #6A5AF2 45%, #4B49F6 100%)' }}
                >
                  {loading ? 'Signing In…' : 'Sign In'}
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center gap-2 text-[12px] text-[#94A3B8] sm:flex-row sm:justify-between">
            <p>Copyright : Delt Pay, All Rights Reserved</p>
            <div className="flex items-center gap-2">
              <Link to="/terms" className="font-medium text-[#4945FF] transition-colors hover:text-[#3730FF]">
                Terms &amp; Conditions
              </Link>
              <span className="text-[#CBD5E1]">|</span>
              <Link to="/privacy" className="font-medium text-[#4945FF] transition-colors hover:text-[#3730FF]">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* ── Right: rotating brand panel ──────────────────────── */}
        <div className="hidden p-3 lg:block">
          <div
            className="relative flex h-full flex-col overflow-hidden rounded-[22px] px-10 pb-8 pt-10"
            style={{ background: 'linear-gradient(160deg, #0A2C63 0%, #041E42 55%, #030F23 100%)' }}
          >
            {/* Faint blueprint grid + indigo glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
                backgroundSize: '44px 44px',
              }}
            />
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-[340px] w-[340px] -translate-x-1/2 rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle, #4945FF 0%, transparent 70%)' }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={active.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative z-10 flex flex-1 flex-col"
              >
                {/* Slide visual */}
                <div className="flex flex-1 items-center justify-center pb-10">
                  {active.visual}
                </div>

                {/* Icon tile + headline + description */}
                <div className="text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_16px_40px_-10px_rgba(73,69,255,0.7)]">
                    <img src={deltIcon} alt="" className="h-7 w-auto" />
                  </div>
                  <h2
                    className="whitespace-pre-line text-[27px] leading-[1.15] text-white"
                    style={{ fontFamily: 'var(--dc-font-display)', fontWeight: 600, letterSpacing: '-0.025em' }}
                  >
                    {active.headline}
                  </h2>
                  <p className="mx-auto mt-3 max-w-[380px] text-[13px] leading-relaxed text-white/65">
                    {active.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Segmented progress bars — click to jump slides */}
            <div className="relative z-10 mt-8 flex items-center gap-2.5">
              {SLIDES.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={`Show slide ${i + 1} of ${SLIDES.length}`}
                  aria-current={i === slide}
                  className="group flex-1 py-2"
                >
                  <span className="block h-[5px] w-full overflow-hidden rounded-full bg-white/20 transition-colors group-hover:bg-white/30">
                    {i < slide && <span className="block h-full w-full rounded-full bg-white" />}
                    {i === slide && (
                      <span
                        key={slide}
                        className="block h-full rounded-full bg-white"
                        style={{ animation: `deltSlideFill ${SLIDE_MS}ms linear forwards` }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
