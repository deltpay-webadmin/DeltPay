import React, { useState } from "react";

const Check = ({ color = "#6366f1" }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill={color} opacity="0.1" />
    <path d="M6 10.5L8.5 13L14 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Dash = () => (
  <span style={{ color: "#cbd5e1", fontSize: 18, fontWeight: 300 }}>—</span>
);

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: 6 }}>
    <path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDown = ({ open }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{
      transition: "transform 0.3s ease",
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
    }}
  >
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FEATURES = [
  {
    category: "Payments",
    items: [
      { name: "Processing rate", free: "2.9% + $0.30", pro: "2.6% + $0.10" },
      { name: "Hardware", free: "Free mobile reader", pro: "Free wireless terminal" },
      { name: "Invoice & payment links", free: true, pro: true },
      { name: "Tap to Pay on iPhone & Android", free: false, pro: true },
      { name: "Settlement speed", free: "2-day", pro: "Next-day" },
      { name: "Chargeback protection", free: false, pro: true },
    ],
  },
  {
    category: "Websites",
    items: [
      { name: "Website type", free: "Template", pro: "Custom design" },
      { name: "Custom domain", free: false, pro: true },
      { name: "Online ordering & booking", free: false, pro: true },
      { name: "SEO optimization", free: false, pro: true },
    ],
  },
  {
    category: "Lens AI",
    items: [
      { name: "Analytics dashboard", free: "Basic", pro: "Advanced" },
      { name: "FlowCast forecasting", free: false, pro: true },
      { name: "Ask Lens (AI assistant)", free: false, pro: true },
      { name: "Custom reports & alerts", free: false, pro: true },
    ],
  },
  {
    category: "Capital",
    items: [
      { name: "Pre-qualification check", free: true, pro: true },
      { name: "Full MCA application", free: false, pro: true },
      { name: "Priority access & preferred rates", free: false, pro: true },
    ],
  },
];

const RATES = [
  { method: "Visa / Mastercard", free: "2.9% + $0.30", pro: "2.6% + $0.10" },
  { method: "Amex", free: "3.4% + $0.30", pro: "3.0% + $0.10" },
  { method: "Debit cards", free: "2.9% + $0.30", pro: "1.5% + $0.10" },
  { method: "ACH / bank transfer", free: "1.0%", pro: "0.8%" },
  { method: "Keyed-in transactions", free: "3.4% + $0.30", pro: "3.0% + $0.10" },
  { method: "Invoices", free: "2.9% + $0.30", pro: "2.6% + $0.10" },
];

function FeatureValue({ value }) {
  if (value === true) return <Check />;
  if (value === false) return <Dash />;
  return (
    <span style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>
      {value}
    </span>
  );
}

export default function DeltPricing() {
  const [compareOpen, setCompareOpen] = useState(false);
  const [hoveredTier, setHoveredTier] = useState(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        fontFamily: "'General Sans', 'DM Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Instrument+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Hero Section */}
      <div
        style={{
          textAlign: "center",
          padding: "80px 24px 0",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#6366f1",
            marginBottom: 16,
          }}
        >
          Pricing
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 700,
            color: "#0f172a",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
          }}
        >
          Simple pricing.
          <br />
          <span style={{ color: "#6366f1" }}>Serious tools.</span>
        </h1>
        <p
          style={{
            marginTop: 16,
            fontSize: 17,
            lineHeight: 1.6,
            color: "#64748b",
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          One platform for payments, websites, AI analytics, and capital.
          <br />
          Start free — upgrade when you're ready.
        </p>
      </div>

      {/* Pricing Cards */}
      <div
        style={{
          display: "flex",
          gap: 24,
          maxWidth: 880,
          margin: "48px auto 0",
          padding: "0 24px",
          alignItems: "stretch",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Free Tier */}
        <div
          onMouseEnter={() => setHoveredTier("free")}
          onMouseLeave={() => setHoveredTier(null)}
          style={{
            flex: "1 1 380px",
            maxWidth: 420,
            background: "#fff",
            borderRadius: 20,
            border: "1px solid #e8eaed",
            padding: "36px 32px 32px",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s ease",
            transform: hoveredTier === "free" ? "translateY(-4px)" : "none",
            boxShadow:
              hoveredTier === "free"
                ? "0 20px 40px -12px rgba(0,0,0,0.1)"
                : "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Free
          </div>
          <div style={{ marginTop: 8 }}>
            <span
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontSize: 56,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              $0
            </span>
            <span style={{ fontSize: 16, color: "#94a3b8", marginLeft: 4 }}>/mo</span>
          </div>
          <p style={{ fontSize: 15, color: "#64748b", marginTop: 8, marginBottom: 28, lineHeight: 1.5 }}>
            Everything you need to launch and start selling. No monthly fee, ever.
          </p>

          <div
            style={{
              background: "#f8fafc",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 24,
              fontSize: 13,
              color: "#475569",
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontWeight: 600, color: "#0f172a" }}>Perfect for: </span>
            New businesses, side hustles, testing the waters
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            {[
              "Done-for-you template website",
              "Free mobile card reader",
              "Invoice & payment links",
              "Basic Lens AI dashboard",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flexShrink: 0, marginTop: 1 }}>
                  <Check />
                </div>
                <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>

          <button
            style={{
              marginTop: 32,
              width: "100%",
              padding: "14px 24px",
              borderRadius: 12,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              color: "#0f172a",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#6366f1";
              e.target.style.color = "#6366f1";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.color = "#0f172a";
            }}
          >
            Get Started — Free
            <Arrow />
          </button>
        </div>

        {/* Pro Tier */}
        <div
          onMouseEnter={() => setHoveredTier("pro")}
          onMouseLeave={() => setHoveredTier(null)}
          style={{
            flex: "1 1 380px",
            maxWidth: 420,
            background: "#fff",
            borderRadius: 20,
            border: "2px solid #6366f1",
            padding: "36px 32px 32px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            transition: "all 0.3s ease",
            transform: hoveredTier === "pro" ? "translateY(-4px)" : "none",
            boxShadow:
              hoveredTier === "pro"
                ? "0 20px 40px -12px rgba(99,102,241,0.25)"
                : "0 4px 16px -2px rgba(99,102,241,0.1)",
          }}
        >
          {/* Badge */}
          <div
            style={{
              position: "absolute",
              top: -13,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#6366f1",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "5px 16px",
              borderRadius: 100,
              whiteSpace: "nowrap",
            }}
          >
            Most Popular
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Pro
          </div>
          <div style={{ marginTop: 8 }}>
            <span
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontSize: 56,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              $99
            </span>
            <span style={{ fontSize: 16, color: "#94a3b8", marginLeft: 4 }}>/mo</span>
          </div>
          <p style={{ fontSize: 15, color: "#64748b", marginTop: 8, marginBottom: 28, lineHeight: 1.5 }}>
            The full Delt system. Lower rates, better tools, faster funding.
          </p>

          <div
            style={{
              background: "linear-gradient(135deg, #eef2ff 0%, #f0f0ff 100%)",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 24,
              fontSize: 13,
              color: "#475569",
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontWeight: 600, color: "#312e81" }}>Perfect for: </span>
            Restaurants, retail, service businesses ready to grow
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            {[
              ["Custom website with your domain", null],
              ["Free wireless terminal", "$299 value"],
              ["Full Lens AI — forecasting, alerts & Ask Lens", null],
              ["Priority capital with preferred rates", null],
            ].map(([item, badge], i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flexShrink: 0, marginTop: 1 }}>
                  <Check />
                </div>
                <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.4 }}>
                  {item}
                  {badge && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#6366f1",
                        background: "#eef2ff",
                        padding: "2px 8px",
                        borderRadius: 100,
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          <button
            style={{
              marginTop: 32,
              width: "100%",
              padding: "14px 24px",
              borderRadius: 12,
              border: "none",
              background: "#6366f1",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#4f46e5";
              e.target.style.boxShadow = "0 4px 16px rgba(99,102,241,0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#6366f1";
              e.target.style.boxShadow = "0 2px 8px rgba(99,102,241,0.3)";
            }}
          >
            Start Free Trial
            <Arrow />
          </button>

          <div
            style={{
              textAlign: "center",
              marginTop: 12,
              fontSize: 13,
              color: "#94a3b8",
            }}
          >
            2,847 businesses started this week
          </div>
        </div>
      </div>

      {/* Compare All Features Toggle */}
      <div style={{ maxWidth: 880, margin: "48px auto 0", padding: "0 24px" }}>
        <button
          onClick={() => setCompareOpen(!compareOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 600,
            color: "#6366f1",
            fontFamily: "inherit",
            transition: "color 0.2s",
          }}
        >
          Compare all features
          <ChevronDown open={compareOpen} />
        </button>

        {/* Feature Comparison Table */}
        <div
          style={{
            maxHeight: compareOpen ? 2000 : 0,
            overflow: "hidden",
            transition: "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #e8eaed",
              overflow: "hidden",
              marginTop: 8,
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 140px",
                padding: "16px 24px",
                borderBottom: "1px solid #f1f5f9",
                background: "#fafbfc",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Feature
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Free
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pro
              </div>
            </div>

            {/* Feature Rows */}
            {FEATURES.map((section, si) => (
              <div key={si}>
                {/* Category Header */}
                <div
                  style={{
                    padding: "14px 24px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #f1f5f9",
                    borderTop: si > 0 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {section.category}
                  </span>
                </div>
                {section.items.map((item, ii) => (
                  <div
                    key={ii}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 140px 140px",
                      padding: "14px 24px",
                      borderBottom: "1px solid #f8fafc",
                      alignItems: "center",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfe")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ fontSize: 14, color: "#475569" }}>{item.name}</div>
                    <div style={{ textAlign: "center" }}>
                      <FeatureValue value={item.free} />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <FeatureValue value={item.pro} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Processing Rates Section */}
      <div style={{ maxWidth: 880, margin: "64px auto 0", padding: "0 24px 80px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1px solid #e8eaed",
            padding: "40px 32px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#6366f1",
              marginBottom: 8,
            }}
          >
            Processing Rates at a Glance
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            All-in rates. No hidden fees.
          </h2>
          <p
            style={{
              marginTop: 8,
              marginBottom: 32,
              fontSize: 15,
              color: "#64748b",
              lineHeight: 1.5,
              maxWidth: 520,
            }}
          >
            What you see is what you pay — no interchange markups, no PCI compliance fees, no statement fees, no batch fees.
          </p>

          {/* Rates Table */}
          <div
            style={{
              borderRadius: 12,
              border: "1px solid #f1f5f9",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 140px",
                padding: "14px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Payment Method
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Free
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pro
              </div>
            </div>
            {RATES.map((rate, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 140px",
                  padding: "14px 20px",
                  borderBottom: i < RATES.length - 1 ? "1px solid #f8fafc" : "none",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfe")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ fontSize: 14, color: "#334155", fontWeight: 500 }}>
                  {rate.method}
                </div>
                <div style={{ fontSize: 14, color: "#64748b", textAlign: "center", fontFamily: "'Instrument Sans', sans-serif" }}>
                  {rate.free}
                </div>
                <div style={{ fontSize: 14, color: "#0f172a", textAlign: "center", fontWeight: 600, fontFamily: "'Instrument Sans', sans-serif" }}>
                  {rate.pro}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Note */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#94a3b8",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1C3.7 1 1 3.7 1 7s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 9.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5.5.2.5.5-.2.5-.5.5zM7.5 7c0 .3-.2.5-.5.5s-.5-.2-.5-.5V4.5c0-.3.2-.5.5-.5s.5.2.5.5V7z" fill="#94a3b8" />
            </svg>
            Processing volume over $50K/mo? Contact us for custom enterprise rates.
          </div>
        </div>
      </div>
    </div>
  );
}