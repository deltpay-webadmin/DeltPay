import { useState } from "react";
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ArrowRight, Check, Award, ShoppingBag, Printer, CreditCard, Sparkles, Users, MessageSquare } from 'lucide-react';

const COLORS = {
  navy: "#041e42",
  indigo: "#4945FF",
  indigoLight: "#6C69FF",
  indigoPale: "#EEEDFF",
  white: "#FFFFFF",
  gray50: "#F8F9FA",
  gray100: "#F1F3F5",
  gray200: "#E9ECEF",
  gray400: "#ADB5BD",
  gray600: "#6C757D",
  gray800: "#343A40",
  green: "#4945FF",
};

/* Toast tokens */
const NAVY      = '#041E42';
const PURPLE    = '#4945FF';
const LAVENDER  = '#EDEBFF';
const IVORY     = '#F6F7FB';
const MUTED     = '#475569';
const MICRO     = '#94A3B8';
const HAIRLINE  = 'rgba(4,30,66,0.10)';

const fonts = {
  heading: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
};

/* ─── FAQ data ──────────────────────────────────────────────── */
const FAQS = [
  {
    q: "What's actually included in Delt Zero processing?",
    a: 'Every Delt plan — Free, Growth, and Personalized — comes with $0 card processing. No percentage per transaction, no monthly processing minimum, no hidden swipe fees. You only pay the flat monthly plan price (or nothing, on Free).',
  },
  {
    q: "How do I decide between Free and Growth?",
    a: "If you just need to accept payments, Free works. If you want the website, online store, Lens AI analytics, and the full platform stitched together — that's Growth. Most merchants on Free upgrade to Growth within 90 days.",
  },
  {
    q: "Can I change plans later?",
    a: 'Yes. Upgrade, downgrade, or cancel at any time from your Delt dashboard. No contracts, no early-termination fees. Your data and configuration follow you between plans.',
  },
  {
    q: "Is there a setup fee or contract?",
    a: "No setup fees, no long-term contracts, no cancellation penalties. Pick a plan, get started today, change your mind whenever.",
  },
  {
    q: "What hardware comes with each plan?",
    a: "Every plan includes a free Delt card reader. Countertop terminals, printers, and kitchen display systems are available as add-ons — and bundled at a discount when you pick Growth or Personalized.",
  },
  {
    q: "What's the difference between Growth and Personalized?",
    a: "Growth is $89/month and includes the full platform out of the box. Personalized is for larger operations — custom feature sets, custom rates, loyalty and SMS, payroll and scheduling, inventory, and Capital access — all quoted to fit your business.",
  },
];

/* ─── FAQ accordion item ─────────────────────────────────────── */
function FaqItem({ q, a, initialOpen = false }: { q: string; a: string; initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: HAIRLINE }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
        style={{ background: open ? IVORY : '#FFFFFF' }}
      >
        <span
          className="font-semibold text-base"
          style={{ color: NAVY, fontFamily: fonts.heading }}
        >
          {q}
        </span>
        <ChevronDown
          size={20}
          style={{
            color: PURPLE,
            flexShrink: 0,
            transition: 'transform 0.25s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p
              className="px-6 pb-5 text-sm leading-relaxed"
              style={{ color: MUTED, fontFamily: fonts.heading }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PricingPage() {
  const navigate = useNavigate();
  
  const tiers = [
    {
      name: "Free",
      outcome: "Start getting paid today. No monthly cost.",
      price: 0,
      cta: "Shop Now",
      ctaStyle: "outline",
      ctaRoute: "/signup",
      belowCta: "Accept payments anywhere with no monthly fees.",
      features: [
        { text: "Accept in-person and online payments", included: true },
        { text: "Card reader included at no cost", included: true },
        { text: "Add-ons available as you grow", included: false },
      ],
    },
    {
      name: "Growth",
      outcome: "Everything you need to run and understand your business.",
      price: 89,
      originalPrice: 149,
      cta: "Get a Demo",
      ctaStyle: "primary",
      ctaRoute: "/contact-sales",
      belowCta: "The full platform — website, payments, and intelligence.",
      features: [
        { text: "Website and online store included", included: true },
        { text: "Lens AI analytics included", included: true },
        { text: "Add-ons available as you grow", included: false },
      ],
      bundle: true,
    },
    {
      name: "Personalized",
      outcome: "For businesses ready to run the full operation from one place.",
      price: null,
      cta: "Get a Quote",
      ctaStyle: "outline",
      ctaRoute: "/get-a-quote",
      belowCta: "Custom features, custom rates. Solutions include, but not limited to:",
      features: [
        { text: "Full Lens AI suite", included: false },
        { text: "Forecasting and advanced analytics", included: false },
        { text: "Website with built-in online store", included: false },
        { text: "Loyalty, SMS, and gift cards", included: false },
        { text: "Integrated payroll and tips", included: false },
        { text: "Employee scheduling and time tracking", included: false },
        { text: "Inventory management", included: false },
        { text: "Delt Capital access", included: false },
        { text: "Hardware setup of your choosing", included: false },
      ],
    },
  ];

  /* Add-ons 3-up (lavender cards) */
  const addOns = [
    {
      icon: <Users size={22} color={PURPLE} />,
      name: 'Payroll & Scheduling',
      desc: 'Run payroll, track hours, and schedule shifts — all tied to the same system that rings sales.',
      price: 'from $29/mo',
    },
    {
      icon: <MessageSquare size={22} color={PURPLE} />,
      name: 'Loyalty, SMS & Gift Cards',
      desc: 'Bring regulars back and win new ones with text marketing, loyalty points, and digital gift cards.',
      price: 'from $39/mo',
    },
    {
      icon: <Sparkles size={22} color={PURPLE} />,
      name: 'Advanced Lens AI',
      desc: 'Forecasting, anomaly alerts, cohort tracking, and AI copilots tuned to your operation.',
      price: 'from $49/mo',
    },
  ];

  /* Hardware ivory band */
  const hardware = [
    {
      icon: <CreditCard size={22} color={PURPLE} />,
      name: 'Card Reader',
      desc: 'Bluetooth reader that pairs with any phone or tablet. Included free on every plan.',
      price: 'Included',
    },
    {
      icon: <ShoppingBag size={22} color={PURPLE} />,
      name: 'Countertop Terminal',
      desc: 'Tap, dip, swipe, scan. Sleek hardware that looks as good as the brand it sits next to.',
      price: 'from $199',
    },
    {
      icon: <Printer size={22} color={PURPLE} />,
      name: 'Kitchen & Receipt Printers',
      desc: 'Thermal printers that never jam, synced to every ticket that hits the line.',
      price: 'from $129',
    },
  ];

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
          }
          .bundle-callout {
            flex-direction: column !important;
            text-align: center !important;
            padding: 24px 20px !important;
            gap: 16px !important;
          }
          .bundle-button {
            width: 100% !important;
          }
        }
        @media (max-width: 768px) {
          .processing-programs {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .pricing-header {
            font-size: 32px !important;
          }
        }
      `}</style>

      {/* ═══ 1. HERO + BUNDLE + TIER CARDS (kept) ═══════════════════ */}
      <div style={{
        minHeight: "auto",
        background: COLORS.white,
        fontFamily: fonts.heading,
        padding: "180px 24px 80px",
      }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{
            display: 'inline-block',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PURPLE,
            background: LAVENDER,
            padding: '6px 14px',
            borderRadius: 999,
          }}>• Pricing · All plans</span>
        </div>

        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="pricing-header" style={{
            fontSize: 42,
            fontWeight: 800,
            color: COLORS.navy,
            letterSpacing: "-0.025em",
            margin: 0,
            lineHeight: 1.15,
          }}>Pick a plan. See results this week.</h2>
          <p style={{
            fontSize: 17,
            color: COLORS.gray600,
            marginTop: 12,
            fontWeight: 400,
          }}>Every plan includes $0 processing with Delt Zero.</p>
          <p style={{ fontSize: 13, color: COLORS.gray600, marginTop: 10 }}>
            Questions? <Link to="/support" style={{ color: COLORS.indigo, textDecoration: 'underline' }}>Chat with us</Link>
          </p>
        </div>

        {/* Bundle callout */}
        <div className="bundle-callout" style={{
          background: COLORS.navy,
          borderRadius: 16,
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 200,
            height: "100%",
            background: `radial-gradient(circle at 80% 50%, rgba(73,69,255,0.15), transparent 70%)`,
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              color: COLORS.white,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}>Most merchants choose the full platform.</div>
            <div style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
              marginTop: 2,
            }}>Website, payments, Lens AI, and capital — better together, built as one.</div>
          </div>
          <div
            className="bundle-button"
            onClick={() => navigate('/demo')}
            style={{
              position: "relative",
              zIndex: 1,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: COLORS.white,
              fontSize: 13,
              fontWeight: 600,
              padding: "9px 20px",
              borderRadius: 10,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            That's Growth at $89/mo →
          </div>
        </div>

        {/* Tier cards */}
        <div className="pricing-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
        }}>
          {tiers.map((tier, i) => (
            <div key={i} style={{
              background: COLORS.white,
              borderRadius: 16,
              border: `1px solid ${COLORS.gray200}`,
              padding: "32px 28px",
              position: "relative",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
            }}>
              <div style={{
                fontSize: 20,
                fontWeight: 800,
                color: COLORS.navy,
                letterSpacing: "-0.01em",
              }}>{tier.name}</div>

              <div style={{
                fontSize: 13.5,
                color: COLORS.gray600,
                marginTop: 6,
                lineHeight: 1.4,
                minHeight: 38,
              }}>{tier.outcome}</div>

              {/* Price */}
              <div style={{ marginTop: 20, marginBottom: 20 }}>
                {tier.price !== null ? (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    {tier.originalPrice && (
                      <span style={{
                        fontSize: 18,
                        color: COLORS.gray400,
                        textDecoration: "line-through",
                        fontWeight: 500,
                      }}>${tier.originalPrice}</span>
                    )}
                    <span style={{
                      fontSize: 48,
                      fontWeight: 800,
                      color: COLORS.navy,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}>${tier.price}</span>
                    <span style={{
                      fontSize: 15,
                      color: COLORS.gray600,
                      fontWeight: 500,
                    }}>/mo</span>
                  </div>
                ) : (
                  <div style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: COLORS.navy,
                    letterSpacing: "-0.02em",
                    fontStyle: "italic",
                  }}>Custom</div>
                )}
              </div>

              {/* CTA */}
              <button 
                onClick={() => navigate(tier.ctaRoute)}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  borderRadius: 12,
                  border: tier.ctaStyle === "primary" ? "none" : `1.5px solid ${COLORS.navy}`,
                  background: tier.ctaStyle === "primary" ? COLORS.indigo : "transparent",
                  color: tier.ctaStyle === "primary" ? COLORS.white : COLORS.navy,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: fonts.heading,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (tier.ctaStyle === "primary") {
                    e.currentTarget.style.background = "#3933CC";
                  } else {
                    e.currentTarget.style.background = "#F6F7FB";
                  }
                }}
                onMouseLeave={(e) => {
                  if (tier.ctaStyle === "primary") {
                    e.currentTarget.style.background = COLORS.indigo;
                  } else {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {tier.cta}
              </button>

              {/* Below CTA descriptor */}
              <div style={{
                fontSize: 13,
                color: COLORS.gray600,
                marginTop: 16,
                marginBottom: 20,
                lineHeight: 1.45,
              }}>{tier.belowCta}</div>

              {/* Features */}
              <div style={{
                borderTop: `1px solid ${COLORS.gray200}`,
                paddingTop: 20,
                flex: 1,
              }}>
                {tier.features.map((f, j) => (
                  <div key={j} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 14,
                    fontSize: 13.5,
                    color: COLORS.gray800,
                    lineHeight: 1.4,
                  }}>
                    <span style={{
                      color: f.included ? (tier.bundle ? COLORS.indigo : COLORS.green) : COLORS.gray400,
                      fontSize: f.included ? 15 : 16,
                      lineHeight: 1.3,
                      flexShrink: 0,
                    }}>{f.included ? "✓" : "＋"}</span>
                    {f.text}
                  </div>
                ))}
              </div>

              {/* View all features link — only on Free and Growth */}
              {tier.name !== "Personalized" && (
                <div style={{
                  borderTop: `1px solid ${COLORS.gray200}`,
                  paddingTop: 16,
                  marginTop: 8,
                }}>
                  <span
                    onClick={() => navigate('/products')}
                    style={{
                      fontSize: 13.5,
                      color: COLORS.indigo,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >View all features →</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* ═══ 2. ADD-ONS 3-UP (LAVENDER CARDS on white) ══════════════ */}
      <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: PURPLE,
              marginBottom: 12,
            }}>Add-ons</div>
            <h2 style={{
              fontSize: 'clamp(28px, 3.2vw, 40px)',
              fontWeight: 800,
              color: NAVY,
              letterSpacing: '-0.025em',
              margin: 0,
              lineHeight: 1.15,
              fontFamily: fonts.heading,
            }}>Extend any plan as you grow.</h2>
            <p style={{
              fontSize: 17,
              color: MUTED,
              marginTop: 14,
              maxWidth: 640,
              marginLeft: 'auto',
              marginRight: 'auto',
              fontFamily: fonts.heading,
            }}>Bolt on only what you need. Every add-on stays inside the same Delt dashboard — no extra logins, no duct tape.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {addOns.map((a) => (
              <div key={a.name} style={{
                background: LAVENDER,
                borderRadius: 20,
                padding: '32px 28px',
                border: `1px solid ${HAIRLINE}`,
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18,
                  boxShadow: '0 2px 8px rgba(4,30,66,0.06)',
                }}>{a.icon}</div>
                <div style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: NAVY,
                  letterSpacing: '-0.01em',
                  marginBottom: 8,
                  fontFamily: fonts.heading,
                }}>{a.name}</div>
                <div style={{
                  fontSize: 14.5,
                  color: MUTED,
                  lineHeight: 1.55,
                  marginBottom: 18,
                  flex: 1,
                  fontFamily: fonts.heading,
                }}>{a.desc}</div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: PURPLE,
                  letterSpacing: '-0.01em',
                  fontFamily: fonts.heading,
                }}>{a.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. HARDWARE IVORY BAND ═══════════════════════════════ */}
      <section style={{ background: IVORY, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 1fr) minmax(0, 2fr)',
            gap: 48,
            alignItems: 'start',
          }} className="hw-grid">
            <div>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: PURPLE,
                marginBottom: 12,
              }}>Hardware</div>
              <h2 style={{
                fontSize: 'clamp(28px, 3vw, 38px)',
                fontWeight: 800,
                color: NAVY,
                letterSpacing: '-0.025em',
                margin: 0,
                lineHeight: 1.15,
                marginBottom: 16,
                fontFamily: fonts.heading,
              }}>Hardware that works as hard as your team does.</h2>
              <p style={{
                fontSize: 16,
                color: MUTED,
                lineHeight: 1.6,
                marginBottom: 24,
                fontFamily: fonts.heading,
              }}>Tap, dip, swipe, print, ring — every piece of Delt hardware is tuned to the software, so it just works from day one.</p>
              <button
                onClick={() => navigate('/products')}
                style={{
                  background: 'transparent',
                  border: `1.5px solid ${NAVY}`,
                  color: NAVY,
                  padding: '12px 22px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: fonts.heading,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                See all hardware <ArrowRight size={16} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}>
              {hardware.map((h) => (
                <div key={h.name} style={{
                  background: '#FFFFFF',
                  borderRadius: 18,
                  padding: '24px 22px',
                  border: `1px solid ${HAIRLINE}`,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 200,
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: LAVENDER,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}>{h.icon}</div>
                  <div style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: NAVY,
                    letterSpacing: '-0.01em',
                    marginBottom: 6,
                    fontFamily: fonts.heading,
                  }}>{h.name}</div>
                  <div style={{
                    fontSize: 13.5,
                    color: MUTED,
                    lineHeight: 1.5,
                    flex: 1,
                    fontFamily: fonts.heading,
                  }}>{h.desc}</div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: PURPLE,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    marginTop: 14,
                    fontFamily: fonts.heading,
                  }}>{h.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 860px) {
            .hw-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          }
        `}</style>
      </section>

      {/* ═══ 4. FAQ (white) ═════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: PURPLE,
              marginBottom: 12,
            }}>FAQ</div>
            <h2 style={{
              fontSize: 'clamp(28px, 3.2vw, 40px)',
              fontWeight: 800,
              color: NAVY,
              letterSpacing: '-0.025em',
              margin: 0,
              lineHeight: 1.15,
              fontFamily: fonts.heading,
            }}>Questions before you pick a plan?</h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} initialOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. RECOGNITION / AWARDS (muted, small, centered) ═══════ */}
      <section style={{ background: IVORY, padding: '56px 24px', borderTop: `1px solid ${HAIRLINE}`, borderBottom: `1px solid ${HAIRLINE}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: MICRO,
            marginBottom: 22,
            fontFamily: fonts.heading,
          }}>Recognized by operators everywhere</div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 32,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {[
              { label: 'G2 · Leader 2026' },
              { label: 'Capterra · Top 20' },
              { label: 'Forbes Fintech 50' },
              { label: 'Fast Company · Most Innovative' },
              { label: 'Inc. · Best Workplaces' },
            ].map((a) => (
              <div key={a.label} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: NAVY,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '-0.005em',
                opacity: 0.65,
                fontFamily: fonts.heading,
              }}>
                <Award size={16} color={PURPLE} />
                {a.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. SMALL CENTERED FINAL CTA (white) ═══════════════════ */}
      <section style={{ background: '#FFFFFF', padding: '88px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 3.2vw, 40px)',
            fontWeight: 800,
            color: NAVY,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            margin: 0,
            marginBottom: 14,
            fontFamily: fonts.heading,
          }}>Pick a plan today. See your first sale this week.</h2>
          <p style={{
            fontSize: 17,
            color: MUTED,
            lineHeight: 1.55,
            marginBottom: 28,
            fontFamily: fonts.heading,
          }}>No contracts. No setup fees. Switch or cancel anytime.</p>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/signup')}
              style={{
                background: PURPLE,
                color: '#FFFFFF',
                border: 'none',
                padding: '15px 28px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: fonts.heading,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#3933CC'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = PURPLE; }}
            >
              Start on Free <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/contact-sales')}
              style={{
                background: 'transparent',
                color: NAVY,
                border: `1.5px solid ${NAVY}`,
                padding: '15px 28px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: fonts.heading,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = IVORY; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Talk to sales
            </button>
          </div>
        </div>
      </section>

      {/* ═══ 7. SMALL-PRINT LEGAL (ivory, above footer) ════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F3FA 100%)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <p style={{
            fontSize: 11,
            lineHeight: 1.7,
            color: MICRO,
            fontFamily: fonts.heading,
            margin: 0,
          }}>
            Delt Zero $0 processing applies to eligible domestic card transactions on Delt hardware and Delt-hosted checkout; certain card-not-present, international, or keyed-entry transactions may incur standard interchange pass-through. Promotional Growth pricing of $89/mo reflects a limited-time offer from the regular price of $149/mo and is subject to change. Hardware pricing shown is a starting configuration; actual cost depends on the bundle and quantity selected. Add-on pricing is billed monthly and can be removed at any time. All plans are subject to Delt's Merchant Terms of Service and applicable Acceptable Use Policy. Delt Capital financing is offered through Delt Capital LLC to qualified merchants based on processing history and other underwriting criteria; not all applicants will qualify.
          </p>
        </div>
      </section>
    </>
  );
}
