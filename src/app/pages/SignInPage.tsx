import { useState } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Navigation } from '../components/Navigation';

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign in logic here
    console.log('Sign in:', { email, password, rememberMe });
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E8E9FF] flex items-center justify-center px-6 py-12 pt-32">
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
          <p className="text-lg text-[#64748B]">
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
                <span className="ml-2 text-sm text-[#64748B]">Remember me</span>
              </label>
              <a href="mailto:support@delt.com?subject=Password%20reset%20request" className="text-sm font-medium text-[#4945FF] hover:text-[#3730FF] transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-[#4945FF] text-white py-3 rounded-lg font-semibold hover:bg-[#3730FF] transition-all flex items-center justify-center gap-2 group"
            >
              Sign in
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#94A3B8]">or continue with</span>
            </div>
          </div>

          {/* Social Sign In */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#E2E8F0] rounded-lg hover:border-[#4945FF] hover:bg-[#F8F9FA] transition-all">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-[#041E42]">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#E2E8F0] rounded-lg hover:border-[#4945FF] hover:bg-[#F8F9FA] transition-all">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium text-[#041E42]">Facebook</span>
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-[#64748B]">
          Don't have an account?{' '}
          <a href="#/signup" className="font-semibold text-[#4945FF] hover:text-[#3730FF] transition-colors">
            Sign up for free
          </a>
        </p>

        {/* Legal Links */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#94A3B8]">
            By signing in, you agree to our{' '}
            <a href="#/terms" className="text-[#4945FF] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#/privacy" className="text-[#4945FF] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
