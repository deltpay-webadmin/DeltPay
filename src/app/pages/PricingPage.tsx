import { useState } from "react";
import { useNavigate } from 'react-router';

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
  green: "#10B981",
};

const fonts = {
  heading: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
};

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
      ctaRoute: "/demo",
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
        @media (max-width: 480px) {
          .pricing-header {
            font-size: 32px !important;
          }
        }
      `}</style>
      <div style={{
        minHeight: "100vh",
        background: COLORS.white,
        fontFamily: fonts.heading,
        padding: "180px 24px 60px",
      }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
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
          }}>Transparent processing from 2.6% + $0.10. No setup fees, no monthly minimums.</p>
        </div>

        {/* Bundle callout */}
        <div className="bundle-callout" style={{
          background: `linear-gradient(135deg, ${COLORS.navy} 0%, #0a2d5c 50%, #0d3468 100%)`,
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
                    e.currentTarget.style.background = "#3530e0";
                  } else {
                    e.currentTarget.style.background = "#F8F9FA";
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
                  <span style={{
                    fontSize: 13.5,
                    color: COLORS.indigo,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}>View all features →</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}