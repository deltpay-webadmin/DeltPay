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
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#4945FF',
            marginBottom: 40,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            textTransform: 'uppercase',
          }}
        >
          What merchants are saying
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
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  color: '#1A1A2E',
                  lineHeight: 1.6,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 500,
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
                  background: t.color === '#16C784' ? 'rgba(22,199,132,0.12)' : 'rgba(73,69,255,0.12)',
                  color: t.color,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 20,
                  marginBottom: 24,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
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