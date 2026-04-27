import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export function EmailCaptureBar() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="relative bg-[#041E42] pt-2 pb-16 lg:pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
            <div className="flex-1">
              <div className="text-xs font-semibold text-[#4945FF] uppercase tracking-wider mb-2">
                Get started in minutes
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                See your custom rate in 60 seconds.
              </h3>
              <p className="text-sm text-white/60 mt-2">
                Drop your email — we'll send a tailored quote and setup link, no call required.
              </p>
            </div>

            {submitted ? (
              <div className="flex items-center gap-3 rounded-xl bg-[#4945FF]/15 border border-[#4945FF]/40 px-5 py-4 lg:min-w-[420px]">
                <div className="w-8 h-8 rounded-full bg-[#4945FF] flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <div>
                  <div className="text-white font-semibold">You're in.</div>
                  <div className="text-sm text-white/60">Check your inbox — quote on the way.</div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 lg:min-w-[420px]"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="flex-1 px-5 py-4 bg-white/10 border border-white/15 rounded-xl text-white placeholder:text-white/40 focus:bg-white/15 focus:border-[#4945FF] focus:outline-none focus:ring-4 focus:ring-[#4945FF]/20 transition-all"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#4945FF] text-white rounded-xl hover:bg-[#3933CC] hover:shadow-[0_16px_40px_-12px_rgba(73,69,255,0.7)] transition-all font-semibold whitespace-nowrap"
                >
                  Get my quote
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
