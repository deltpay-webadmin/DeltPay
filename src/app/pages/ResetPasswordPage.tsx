import { useEffect, useState } from 'react';
import { Lock, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Navigation } from '../components/Navigation';
import { useAuth } from '@/app/lib/auth';
import { supabase } from '@/app/lib/supabase';

/* Password reset, two modes:
   1. "request" — the default. Enter your email, we send a recovery link.
   2. "update"  — the merchant arrives via that link. Supabase exchanges the
      code and fires a PASSWORD_RECOVERY auth event; we switch to the
      set-new-password form and call updateUser. */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword, updatePassword } = useAuth();
  const [mode, setMode] = useState<'request' | 'update'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);

  // The recovery link lands here and fires PASSWORD_RECOVERY once the session
  // is established — flip to the set-new-password form.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('update');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: reqError } = await resetPassword(email);
    setLoading(false);
    if (reqError) { setError(reqError); return; }
    setSent(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: updError } = await updatePassword(password);
    setLoading(false);
    if (updError) { setError(updError); return; }
    setDone(true);
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center px-6 py-12 pt-32">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-[#041E42] hover:text-[#4945FF] transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4945FF] rounded-2xl mb-6">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#041E42] mb-3">
              {mode === 'update' ? 'Set a new password' : 'Reset your password'}
            </h1>
            <p className="text-lg text-[#475569]">
              {mode === 'update'
                ? 'Choose a new password for your Delt account'
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            {/* Success states */}
            {done ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-[#4945FF] mx-auto mb-4" />
                <p className="text-[#041E42] font-semibold mb-6">Your password has been updated.</p>
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full bg-[#4945FF] text-white py-3 rounded-lg font-semibold hover:bg-[#3730FF] transition-all"
                >
                  Continue to sign in
                </button>
              </div>
            ) : sent ? (
              <div className="text-center py-4">
                <Mail className="h-12 w-12 text-[#4945FF] mx-auto mb-4" />
                <p className="text-[#041E42] font-semibold mb-2">Check your email</p>
                <p className="text-sm text-[#475569]">
                  If an account exists for <strong>{email}</strong>, a reset link is on its way.
                </p>
              </div>
            ) : mode === 'update' ? (
              /* Set-new-password form */
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#041E42] mb-2">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#4945FF] transition-colors text-[#041E42]"
                    placeholder="At least 8 characters"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#041E42] mb-2">Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#4945FF] transition-colors text-[#041E42]"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4945FF] text-white py-3 rounded-lg font-semibold hover:bg-[#3730FF] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Updating…' : 'Update password'}
                  {!loading && <ArrowRight className="h-5 w-5" />}
                </button>
              </form>
            ) : (
              /* Request-link form */
              <form onSubmit={handleRequest} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#041E42] mb-2">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#4945FF] transition-colors text-[#041E42]"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4945FF] text-white py-3 rounded-lg font-semibold hover:bg-[#3730FF] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                  {!loading && <ArrowRight className="h-5 w-5" />}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-[#475569]">
            Remembered it?{' '}
            <Link to="/signin" className="font-semibold text-[#4945FF] hover:text-[#3730FF] transition-colors">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
