import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

const COLORS = {
  navy: '#041e42',
  indigo: '#4945FF',
  white: '#FFFFFF',
  gray50: '#F6F7FB',
  gray600: '#475569',
  gray800: '#041E42',
};

const fonts = {
  heading: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
};

/* ─── Fade-in animation ─────────────────────────────── */
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: fonts.heading }}>

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 800,
              color: COLORS.navy,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: 32
            }}>
              We're building for the backbone of the economy.
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p style={{
              fontSize: 20,
              lineHeight: 1.6,
              color: COLORS.gray600,
              maxWidth: 720
            }}>
              Delt exists to give small businesses the same powerful tools that enterprise companies have —
              payments, capital, analytics, and a web presence — unified in one simple platform.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ══ MISSION ═══════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ backgroundColor: COLORS.gray50 }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: COLORS.indigo,
              marginBottom: 16
            }}>
              Our Mission
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              color: COLORS.navy,
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              marginBottom: 24
            }}>
              Level the playing field for every business owner
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: COLORS.gray600,
              marginBottom: 20
            }}>
              For too long, small businesses have been forced to choose between expensive, complicated enterprise
              software and cobbling together a dozen different tools. Delt was founded on the belief that every
              merchant deserves technology that's powerful, transparent, and built for how they actually work.
            </p>
            <p style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: COLORS.gray600
            }}>
              We started with a simple goal: build the operating system for modern commerce. Today, we're
              helping thousands of businesses process payments, grow their revenue, and make smarter decisions — all
              from one platform.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ══ VALUES ════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: COLORS.indigo,
              marginBottom: 16,
              textAlign: 'center'
            }}>
              What We Believe
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              color: COLORS.navy,
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              marginBottom: 64,
              textAlign: 'center'
            }}>
              The principles that guide us
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-16">
            {[
              {
                title: 'Transparency First',
                body: 'No hidden fees. No fine print. We publish our pricing openly and hold ourselves accountable to the standards we set.'
              },
              {
                title: 'Merchant Obsessed',
                body: 'Every feature we build starts with the question: does this make life easier for the people running their businesses?'
              },
              {
                title: 'Speed Matters',
                body: 'Whether it\'s funding often within 48 hours or near-instant transaction insights, we believe fast is better. Your time is valuable.'
              },
              {
                title: 'Built to Scale',
                body: 'From your first sale to your thousandth location, Delt grows with you. One platform for every stage.'
              }
            ].map((value, i) => (
              <FadeIn key={value.title} delay={0.15 + i * 0.05}>
                <div>
                  <h3 style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: COLORS.navy,
                    marginBottom: 12
                  }}>
                    {value.title}
                  </h3>
                  <p style={{
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: COLORS.gray600
                  }}>
                    {value.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ backgroundColor: COLORS.gray50 }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '2026', label: 'Founded' },
              { value: '5,000+', label: 'Merchants' },
              { value: '$2.4B+', label: 'Processed' },
              { value: '150+', label: 'Team Members' }
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    fontWeight: 900,
                    color: COLORS.navy,
                    letterSpacing: '-0.02em',
                    marginBottom: 8
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.gray600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {stat.label}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════ */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              color: COLORS.navy,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: 24
            }}>
              Ready to grow with Delt?
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: COLORS.gray600,
              marginBottom: 40
            }}>
              Join thousands of businesses building their future on our platform.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/get-a-quote"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '16px 32px',
                  backgroundColor: COLORS.indigo,
                  color: COLORS.white,
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3933CC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.indigo; }}
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact-sales"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '16px 32px',
                  border: `2px solid ${COLORS.navy}`,
                  color: COLORS.navy,
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.gray50;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Talk to Sales
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
