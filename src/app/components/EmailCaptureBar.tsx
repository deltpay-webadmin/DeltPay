import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useHoneypot } from './Honeypot';
import { trackRateCheck } from '@/lib/pixel';

export function EmailCaptureBar() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { honeypotField, honeypotValue } = useHoneypot();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Email the rate-check lead to the team (fire-and-forget).
    fetch('/api/leads/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'rate-check', email, hp_extra_field: honeypotValue() }),
    }).catch(() => {});
    // Fire the Meta Pixel Lead so ad optimization + reporting see this
    // top-of-funnel capture (previously untracked).
    trackRateCheck({ content_name: 'homepage_rate_bar' });
    setSubmitted(true);
  };

  return (
    <section className="relative bg-[#080A28] pt-2 pb-16 lg:pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="bg-white/5 border border-white/10 backdrop-blur-sm p-6 lg:p-8"
          style={{ borderRadius: '6px' }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
            <div className="flex-1">
              <div
                className="mb-3"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#A5B4FC',
                }}
              >
                — Get started in minutes
              </div>
              <h3
                className="text-2xl lg:text-3xl text-white"
                style={{
                  fontFamily: "'Manrope', 'Inter Tight', sans-serif",
                  fontWeight: 600,
                  letterSpacing: '-0.035em',
                  lineHeight: 1.05,
                }}
              >
                See your custom rate in{' '}
                <em style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontStyle: 'italic', fontWeight: 400, color: '#A5B4FC' }}>
                  60 seconds.
                </em>
              </h3>
              <p className="text-sm text-white/60 mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
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
                {honeypotField}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="flex-1 px-5 py-4 bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-[#4945FF] focus:outline-none focus:ring-2 focus:ring-[#4945FF]/30 transition-all"
                  style={{ borderRadius: '6px', fontFamily: "'Inter', sans-serif" }}
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#4945FF] text-white hover:bg-[#3730A3] transition-all whitespace-nowrap"
                  style={{ borderRadius: '6px', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
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
