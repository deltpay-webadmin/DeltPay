import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, LogIn, UserPlus, ChevronDown } from 'lucide-react';
import deltLogoWhite from '@/assets/delt-logo-on-dark.svg';
/*
 * Hero image for the sign-in split panel: a merchant in a premium retail
 * environment using a point-of-sale terminal (nano-banana-pro render).
 */
import heroMerchant from '@/assets/scenes/signin-merchant-pos.jpg';

const INDIGO = '#4945FF';
const NAVY = '#041E42';

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Notify the team of a sign-in attempt (email only — the password is
    // NEVER sent). Fire-and-forget.
    fetch('/api/leads/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'signin', email }),
    }).catch(() => {});
    // Simulated auth — replace with real endpoint
    setTimeout(() => {
      setLoading(false);
      setError('Invalid email or password. Try signing up instead.');
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-[#EEF0F5] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[1180px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[28px] overflow-hidden shadow-[0_30px_80px_-20px_rgba(4,30,66,0.25)]">
        {/* ── Left: photographic panel ─────────────────────────── */}
        <div className="relative hidden lg:block min-h-[640px]">
          <img
            src={heroMerchant}
            alt="Merchant at the point of sale in a premium retail store"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Legibility gradient — darkest at bottom for the headline */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />

          {/* Brand lockup + tagline */}
          <div className="relative z-10 p-9">
            <div className="flex items-baseline gap-1.5">
              <img src={deltLogoWhite} alt="Delt" className="h-5 w-auto" />
              <span
                className="text-white/95 text-[19px] leading-none font-medium"
                style={{ fontFamily: 'var(--dc-font-display)', letterSpacing: '-0.02em' }}
              >
                Pay
              </span>
            </div>
            <p className="mt-3 max-w-[19rem] text-[13px] leading-snug text-white/80">
              Payments for operators who don&rsquo;t overpay — flat rates,
              next-day deposits.
            </p>
          </div>

          {/* Display headline, anchored bottom-left */}
          <div className="absolute bottom-0 left-0 z-10 p-9">
            <h2
              className="text-white text-[52px] leading-[0.95]"
              style={{ fontFamily: 'var(--dc-font-display)', fontWeight: 600, letterSpacing: '-0.045em' }}
            >
              Payments that
              <br />
              keep you moving.
            </h2>
          </div>
        </div>

        {/* ── Right: form panel ────────────────────────────────── */}
        <div className="relative flex flex-col px-7 py-8 sm:px-12 sm:py-11">
          {/* Sign up link */}
          <div className="flex justify-end">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-[15px] font-medium text-[#041E42] hover:text-[#4945FF] transition-colors"
            >
              <UserPlus className="h-[18px] w-[18px]" strokeWidth={2} />
              Sign Up
            </Link>
          </div>

          {/* Header + form, vertically centered in the remaining space */}
          <div className="flex flex-1 flex-col justify-center">
            <div className="mx-auto w-full max-w-[380px]">
              <h1
                className="mb-8 text-[44px] leading-none text-[#041E42]"
                style={{ fontFamily: 'var(--dc-font-display)', fontWeight: 600, letterSpacing: '-0.04em' }}
              >
                Sign In
              </h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email / username */}
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full border border-[#E3E8EE] bg-white px-6 py-[15px] text-[15px] text-[#041E42] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#4945FF] focus:ring-2 focus:ring-[#4945FF]/15"
                  placeholder="Email or Username"
                  autoComplete="username"
                  required
                />

                {/* Password */}
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-full border border-[#E3E8EE] bg-white px-6 py-[15px] pr-12 text-[15px] text-[#041E42] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#4945FF] focus:ring-2 focus:ring-[#4945FF]/15"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#4945FF] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Forgot password */}
                <div>
                  <Link
                    to="/contact"
                    className="text-[14px] font-semibold text-[#4945FF] hover:text-[#3730FF] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-full py-[15px] text-[16px] font-semibold text-white shadow-[0_12px_28px_-8px_rgba(73,69,255,0.6)] transition-all hover:brightness-[1.05] active:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(90deg, #9C8CF8 0%, #6A5AF2 45%, #4B49F6 100%)' }}
                >
                  <LogIn className="h-5 w-5" strokeWidth={2.2} />
                  {loading ? 'Signing In…' : 'Sign In'}
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[#94A3B8]">© 2005–2026 Delt Pay LLC.</p>
            <div className="flex items-center gap-6">
              <Link
                to="/contact"
                className="text-[14px] text-[#475569] hover:text-[#4945FF] transition-colors"
              >
                Contact Us
              </Link>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1 text-[14px] text-[#475569] hover:text-[#4945FF] transition-colors"
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
