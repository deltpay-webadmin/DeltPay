import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, LogIn, UserPlus, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import deltLogoWhite from '@/assets/delt-logo-on-dark.svg';
/*
 * Hero image for the sign-in split panel: a merchant in a premium retail
 * environment using a point-of-sale terminal (nano-banana-pro render).
 */
import heroMerchant from '@/assets/scenes/signin-merchant-pos.jpg';

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const inputClass =
    'w-full rounded-[12px] border border-(--dp-border) bg-(--dp-bg-card) px-4 h-12 text-[15px] text-(--dp-text) placeholder:text-(--dp-text-faint) outline-none transition-shadow focus:border-(--dp-accent) focus:shadow-[0_0_0_3px_var(--dp-accent-soft)]';

  return (
    // This screen is the door to the dark back-office, so it carries the
    // CRM's token scope (DeltPay dark system + Inter).
    <div className="delt-backend-scope min-h-screen w-full !bg-(--dp-bg-base) flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[1180px] grid grid-cols-1 lg:grid-cols-2 bg-(--dp-bg-surface) rounded-[16px] overflow-hidden border border-white/[0.08] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
        {/* ── Left: photographic panel with cobalt wash ─────────── */}
        <div className="relative hidden lg:block min-h-[640px]">
          <img
            src={heroMerchant}
            alt="Merchant at the point of sale in a premium retail store"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Cobalt-tinted legibility wash — darkest at the bottom headline */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,10,22,0.92)] via-[rgba(10,16,32,0.35)] to-[rgba(10,16,32,0.55)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,16,32,0.4)_0%,rgba(20,41,92,0.25)_45%,rgba(46,107,255,0.28)_100%)] mix-blend-multiply" />

          {/* Brand lockup + tagline */}
          <div className="relative z-10 p-9">
            <img src={deltLogoWhite} alt="Delt" className="h-6 w-auto" />
            <p className="mt-3 max-w-[19rem] text-[13px] leading-snug text-white/70">
              Payments for operators who don&rsquo;t overpay — flat rates,
              next-day deposits.
            </p>
          </div>

          {/* Display headline, anchored bottom-left */}
          <div className="absolute bottom-0 left-0 z-10 p-9">
            <h2 className="text-white text-[52px] leading-[1.02] font-black tracking-[-0.035em]">
              Payments that
              <br />
              keep you moving.
            </h2>
            <p className="mt-4 flex items-center gap-2 text-[12px] text-white/60">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-(--dp-success)" />
              Read-only bank connection. No impact to your credit.
            </p>
          </div>
        </div>

        {/* ── Right: form panel ────────────────────────────────── */}
        <div className="relative flex flex-col px-7 py-8 sm:px-12 sm:py-11">
          {/* Sign up link */}
          <div className="flex justify-end">
            <Link
              to="/get-a-quote"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-(--dp-text-muted) hover:text-(--dp-accent-text) transition-colors"
            >
              <UserPlus className="h-[18px] w-[18px]" strokeWidth={2} />
              Sign Up
            </Link>
          </div>

          {/* Header + form, vertically centered in the remaining space */}
          <div className="flex flex-1 flex-col justify-center">
            <div className="mx-auto w-full max-w-[380px]">
              <h1 className="text-[40px] leading-none text-(--dp-text) font-bold tracking-[-0.03em]">
                Sign in
              </h1>
              <p className="mt-2 mb-8 text-[14px] text-(--dp-text-muted)">
                Your money, clearly. Pick up where you left off.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email / username */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[12px] font-medium text-(--dp-text-muted)"
                  >
                    Email or username
                  </label>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@business.com"
                    autoComplete="username"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-[12px] font-medium text-(--dp-text-muted)"
                    >
                      Password
                    </label>
                    <Link
                      to="/contact"
                      className="text-[12px] font-semibold text-(--dp-accent-text) hover:text-[#7FA3FF] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pr-12`}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-(--dp-text-faint) hover:text-(--dp-accent-text) transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-[12px] border border-[rgba(242,86,91,0.4)] bg-[rgba(242,86,91,0.1)] px-4 py-3 text-[13px] text-(--dp-danger)">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-[12px] h-12 text-[15px] font-bold text-white bg-(--dp-accent) transition-all hover:bg-(--dp-accent-hover) hover:shadow-[0_0_0_1px_rgba(46,107,255,0.35),0_8px_32px_rgba(46,107,255,0.2)] active:bg-(--dp-accent-press) active:scale-[.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <LogIn className="h-5 w-5" strokeWidth={2.2} />
                  {loading ? 'Signing In…' : 'Sign In'}
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-6">
              <Link
                to="/contact"
                className="text-[13px] text-(--dp-text-muted) hover:text-(--dp-accent-text) transition-colors"
              >
                Contact Us
              </Link>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1 text-[13px] text-(--dp-text-muted) hover:text-(--dp-accent-text) transition-colors"
              >
                English
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
