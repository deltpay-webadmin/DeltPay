import { useState } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Navigation } from '../components/Navigation';
import { useAuth } from '@/app/lib/auth';

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Where to land after a successful sign-in: the route the user originally
  // tried to reach (set by <ProtectedRoute>), else the portal home.
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await signIn({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center px-6 py-12 pt-32">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-[#041E42] hover:text-[#4945FF] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4945FF] rounded-2xl mb-6">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#041E42] mb-3">Welcome back</h1>
          <p className="text-lg text-[#475569]">
            Sign in to your Delt account
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#041E42] mb-2">
                Email address
              </label>
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

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#041E42] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#4945FF] transition-colors text-[#041E42]"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#4945FF] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-2 border-[#E2E8F0] rounded text-[#4945FF] focus:ring-[#4945FF] focus:ring-offset-0 cursor-pointer"
                />
                <span className="ml-2 text-sm text-[#475569]">Remember me</span>
              </label>
              <Link to="/reset-password" className="text-sm font-medium text-[#4945FF] hover:text-[#3730FF] transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Error state */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4945FF] text-white py-3 rounded-lg font-semibold hover:bg-[#3730FF] transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-[#475569]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-[#4945FF] hover:text-[#3730FF] transition-colors">
            Sign up for free
          </Link>
        </p>

        {/* Legal Links */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#94A3B8]">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-[#4945FF] hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-[#4945FF] hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
