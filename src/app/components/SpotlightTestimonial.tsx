import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const testimonials = [
  {
    quote: "Delt replaced three different tools we were paying for. One dashboard, one login, one bill. Our team actually uses it every day now.",
    name: 'Sarah Kim',
    role: 'Operations Lead, Bloom & Barrel',
    metric: '3 tools replaced',
    color: '#4945FF',
  },
  {
    quote: "We got approved for capital in 48 hours and the repayment just comes out of daily sales. No awkward bank meetings, no personal guarantee.",
    name: 'Marcus Rivera',
    role: 'Owner, Rivera Auto Detail',
    metric: '$52K funded',
    color: '#16C784',
  },
  {
    quote: "Lens told us our Tuesday lunch traffic was dropping before we even noticed. We adjusted the menu and saw a 20% bump in two weeks.",
    name: 'Priya Nair',
    role: 'Co-founder, Saffron Kitchen',
    metric: '20% revenue lift',
    color: '#4945FF',
  },
];

export function SpotlightTestimonial() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[active];

  return (
    <section
      style={{
        background: '#FFFFFF',
        padding: '100px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(73,69,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.18em',
            color: '#697386',
            marginBottom: 40,
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: 'uppercase',
          }}
        >
          — IN THEIR WORDS
        </motion.div>

        {/* Quote */}
        <div style={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <p
                style={{
                  fontSize: 'clamp(22px, 3vw, 32px)',
                  color: '#041E42',
                  lineHeight: 1.4,
                  fontFamily: "'Source Serif Pro', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                  marginBottom: 32,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Metric badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: t.color === '#16C784' ? 'rgba(31,132,90,0.10)' : 'rgba(73,69,255,0.10)',
                  color: t.color === '#16C784' ? '#1F845A' : '#3730A3',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  padding: '6px 12px',
                  borderRadius: 4,
                  marginBottom: 24,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {t.metric}
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {t.name}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {t.role}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: i === active ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === active ? '#4945FF' : 'rgba(73,69,255,0.25)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}