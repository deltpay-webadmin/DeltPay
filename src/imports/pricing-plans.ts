import { useState, useRef, useEffect } from "react";

const PLANS = {
  starter: {
    name: "Starter",
    badge: null,
    monthly: 0,
    annual: 0,
    subtitle: "Get started risk-free",
    ideal: "New businesses, side hustles, testing the waters",
    cta: "Get Started — Free",
    ctaStyle: "outline",
    highlights: [
      "Done-for-you template website",
      "Free mobile card reader",
      "Invoice & payment links",
      "Basic Lens AI dashboard",
      "Capital pre-qualification",
    ],
    features: {
      website: [
        { label: "Done-for-you site", value: "Template" },
        { label: "SSL & hosting", value: true },
        { label: "Custom domain", value: "Subdomain" },
        { label: "Mobile-responsive", value: true },
        { label: "SEO optimization", value: "Basic" },
        { label: "Online ordering / booking", value: false },
        { label: "Design revisions", value: "—" },
      ],
      payments: [
        { label: "In-person rate", value: "2.7% + 10¢" },
        { label: "Online rate", value: "3.2% + 30¢" },
        { label: "Keyed rate", value: "3.4% + 15¢" },
        { label: "Mobile card reader", value: true },
        { label: "Wireless terminal", value: false },
        { label: "Full POS system", value: false },
        { label: "Settlement", value: "Next-day" },
        { label: "Digital wallets", value: true },
        { label: "Recurring billing", value: false },
      ],
      lens: [
        { label: "Revenue dashboard", value: "Basic" },
        { label: "Monthly summary email", value: true },
        { label: "FlowCast forecasting", value: false },
        { label: "Ask Lens (AI queries)", value: false },
        { label: "Decision Engine", value: false },
        { label: "Capital Index", value: false },
        { label: "Custom reports & API", value: false },
      ],
      capital: [
        { label: "Pre-qualification", value: true },
        { label: "Full application", value: false },
        { label: "Review speed", value: "—" },
        { label: "Max advance", value: "—" },
        { label: "Factor rate tier", value: "—" },
        { label: "Dedicated advisor", value: false },
      ],
    },
  },
  growth: {
    name: "Growth",
    badge: "Most Popular",
    monthly: 99,
    annual: 79,
    subtitle: "Everything to run and grow",
    ideal: "Restaurants, retail, service businesses with 1–5 locations",
    cta: "Start Free Trial",
    ctaStyle: "filled",
    social: "2,847 businesses started this week",
    highlights: [
      "Custom-designed website with your domain",
      "Free wireless terminal ($299 value)",
      "Lens AI — analytics, forecasting & Ask Lens",
      "Instant settlement",
      "Full MCA application access",
    ],
    features: {
      website: [
        { label: "Done-for-you site", value: "Custom" },
        { label: "SSL & hosting", value: true },
        { label: "Custom domain", value: true },
        { label: "Mobile-responsive", value: true },
        { label: "SEO optimization", value: "Full" },
        { label: "Online ordering / booking", value: true },
        { label: "Design revisions", value: "2/year" },
      ],
      payments: [
        { label: "In-person rate", value: "2.5% + 10¢" },
        { label: "Online rate", value: "2.9% + 30¢" },
        { label: "Keyed rate", value: "3.2% + 15¢" },
        { label: "Mobile card reader", value: true },
        { label: "Wireless terminal", value: "Free" },
        { label: "Full POS system", value: false },
        { label: "Settlement", value: "Instant" },
        { label: "Digital wallets", value: true },
        { label: "Recurring billing", value: true },
      ],
      lens: [
        { label: "Revenue dashboard", value: "Full" },
        { label: "Monthly summary email", value: true },
        { label: "FlowCast forecasting", value: true },
        { label: "Ask Lens (AI queries)", value: true },
        { label: "Decision Engine", value: false },
        { label: "Capital Index", value: false },
        { label: "Custom reports & API", value: false },
      ],
      capital: [
        { label: "Pre-qualification", value: true },
        { label: "Full application", value: true },
        { label: "Review speed", value: "Standard" },
        { label: "Max advance", value: "$150K" },
        { label: "Factor rate tier", value: "Standard" },
        { label: "Dedicated advisor", value: false },
      ],
    },
  },
  scale: {
    name: "Scale",
    badge: "Best Value",
    monthly: 199,
    annual: 159,
    subtitle: "Built for multi-location operations",
    ideal: "Multi-location, high-volume businesses, franchises",
    cta: "Start Free Trial",
    ctaStyle: "filled",
    highlights: [
      "Premium custom website design",
      "Full POS register system ($1,200+ value)",
      "Full Lens AI suite — all four layers",
      "Instant settlement",
      "Priority capital with preferred rates",
    ],
    features: {
      website: [
        { label: "Done-for-you site", value: "Premium" },
        { label: "SSL & hosting", value: true },
        { label: "Custom domain", value: true },
        { label: "Mobile-responsive", value: true },
        { label: "SEO optimization", value: "Full+" },
        { label: "Online ordering / booking", value: true },
        { label: "Design revisions", value: "Unlimited" },
      ],
      payments: [
        { label: "In-person rate", value: "2.3% + 10¢" },
        { label: "Online rate", value: "2.7% + 30¢" },
        { label: "Keyed rate", value: "3.0% + 15¢" },
        { label: "Mobile card reader", value: true },
        { label: "Wireless terminal", value: "Free" },
        { label: "Full POS system", value: "Free" },
        { label: "Settlement", value: "Instant" },
        { label: "Digital wallets", value: true },
        { label: "Recurring billing", value: true },
      ],
      lens: [
        { label: "Revenue dashboard", value: "Full" },
        { label: "Monthly summary email", value: true },
        { label: "FlowCast forecasting", value: true },
        { label: "Ask Lens (AI queries)", value: true },
        { label: "Decision Engine", value: true },
        { label: "Capital Index", value: true },
        { label: "Custom reports & API", value: true },
      ],
      capital: [
        { label: "Pre-qualification", value: true },
        { label: "Full application", value: true },
        { label: "Review speed", value: "Priority" },
        { label: "Max advance", value: "$500K+" },
        { label: "Factor rate tier", value: "Preferred" },
        { label: "Dedicated advisor", value: true },
      ],
    },
  },
};

const PRODUCT_TABS = [
  { key: "all", label: "Key Highlights" },
  { key: "payments", label: "Payments", icon: "💳" },
  { key: "website", label: "Websites", icon: "🌐" },
  { key: "lens", label: "Lens AI", icon: "📊" },
  { key: "capital", label: "Capital", icon: "💰" },
];

const FAQ_DATA = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes. Upgrade instantly — your new features activate immediately and we prorate the difference. Downgrade at the end of your current billing cycle. No penalties, no ETFs.",
  },
  {
    q: "What does the free plan include?",
    a: "Starter gives you a done-for-you template website on a Delt subdomain, a free mobile card reader, invoice and payment links, a basic Lens AI dashboard, and capital pre-qualification — all with zero monthly fees. You only pay processing fees per transaction.",
  },
  {
    q: "How does the free trial work on paid plans?",
    a: "Growth and Scale come with a 30-day free trial. You get full access to every feature on your plan. If it's not for you, cancel before day 30 and pay nothing. Hardware shipped during the trial must be returned if you cancel.",
  },
  {
    q: "Are there contracts or cancellation fees?",
    a: "No long-term contracts on Starter or monthly Growth/Scale. Annual plans commit for 12 months at a 20% discount. Hardware subsidies (free terminal on Growth, free POS on Scale) require a 12-month minimum commitment.",
  },
  {
    q: "How does Delt Capital work?",
    a: "Delt Capital offers merchant cash advances based on your processing history. Starter merchants can check their pre-qualified amount. Growth and Scale merchants can submit full applications. Scale merchants get priority review and preferred factor rates. All capital details live on our dedicated Capital site.",
  },
  {
    q: "What processing rates will I actually pay?",
    a: "The rates shown are your all-in rates — no hidden fees, no interchange markups, no PCI compliance fees. What you see is what you pay. Higher-tier plans unlock lower rates that can save hundreds per month at volume.",
  },
];

function FeatureValue({ value }) {
  if (value === true)
    return (
      <span style={{ color: "#10B981", fontWeight: 700, fontSize: 15 }}>✓</span>
    );
  if (value === false)
    return (
      <span style={{ color: "#D1D5DB", fontWeight: 500, fontSize: 13 }}>—</span>
    );
  if (value === "Free")
    return (
      <span
        style={{
          color: "#10B981",
          fontWeight: 700,
          fontSize: 12,
          background: "#D1FAE5",
          padding: "2px 8px",
          borderRadius: 4,
        }}
      >
        Free
      </span>
    );
  return (
    <span style={{ color: "#1A1A2E", fontWeight: 600, fontSize: 13 }}>
      {value}
    </span>
  );
}

function PlanCard({ plan, isAnnual, activeTab }) {
  const [expanded, setExpanded] = useState(false);
  const p = PLANS[plan];
  const isFeatured = plan === "growth";
  const price = isAnnual ? p.annual : p.monthly;

  const showHighlights = activeTab === "all";
  const featureList = !showHighlights ? p.features[activeTab] : null;

  return (
    <div
      style={{
        background: "#fff",
        border: isFeatured ? "2px solid #4318FF" : "1.5px solid #E5E7EB",
        borderRadius: 16,
        padding: "32px 28px 28px",
        position: "relative",
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        boxShadow: isFeatured
          ? "0 8px 40px rgba(67,24,255,0.10), 0 1px 3px rgba(67,24,255,0.06)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        transform: isFeatured ? "scale(1.02)" : "none",
        transition: "box-shadow 0.3s, transform 0.3s",
        zIndex: isFeatured ? 2 : 1,
      }}
    >
      {p.badge && (
        <div
          style={{
            position: "absolute",
            top: -13,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              p.badge === "Most Popular"
                ? "linear-gradient(135deg, #4318FF 0%, #7B61FF 100%)"
                : "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            padding: "5px 18px",
            borderRadius: 20,
            whiteSpace: "nowrap",
          }}
        >
          {p.badge}
        </div>
      )}

      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#1A1A2E",
          marginBottom: 4,
        }}
      >
        {p.name}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 2 }}>
        {price === 0 ? (
          <span style={{ fontSize: 48, fontWeight: 800, color: "#1A1A2E", lineHeight: 1 }}>
            FREE
          </span>
        ) : (
          <>
            <span style={{ fontSize: 48, fontWeight: 800, color: "#1A1A2E", lineHeight: 1 }}>
              ${price}
            </span>
            <span style={{ fontSize: 16, color: "#6B7280", fontWeight: 400 }}>/mo</span>
          </>
        )}
      </div>

      <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>
        {price === 0
          ? "No monthly fee, ever"
          : isAnnual
          ? `$${p.monthly}/mo billed monthly`
          : `$${p.annual}/mo billed annually`}
      </div>
      <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>{p.subtitle}</div>

      {/* Ideal For */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#4318FF",
          background: "#F0EDFF",
          padding: "8px 14px",
          borderRadius: 8,
          marginBottom: 20,
          lineHeight: 1.4,
        }}
      >
        Perfect for: {p.ideal}
      </div>

      {/* Features */}
      <div style={{ flex: 1 }}>
        {showHighlights ? (
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                color: "#9CA3AF",
                marginBottom: 12,
              }}
            >
              Key Highlights
            </div>
            {p.highlights.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "7px 0",
                  fontSize: 14,
                  color: "#1A1A2E",
                  lineHeight: 1.45,
                }}
              >
                <span style={{ color: "#10B981", fontWeight: 700, fontSize: 15, flexShrink: 0, marginTop: 1 }}>
                  ✓
                </span>
                {h}
              </div>
            ))}
          </div>
        ) : (
          <div>
            {featureList.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: i < featureList.length - 1 ? "1px solid #F3F4F6" : "none",
                  fontSize: 14,
                  color: "#374151",
                }}
              >
                <span>{f.label}</span>
                <FeatureValue value={f.value} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ marginTop: 24 }}>
        <button
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
            border: p.ctaStyle === "outline" ? "2px solid #1A1A2E" : "none",
            background:
              p.ctaStyle === "filled"
                ? "linear-gradient(135deg, #4318FF 0%, #5B3AFF 100%)"
                : "transparent",
            color: p.ctaStyle === "filled" ? "#fff" : "#1A1A2E",
            letterSpacing: "0.2px",
          }}
          onMouseEnter={(e) => {
            if (p.ctaStyle === "filled") {
              e.target.style.background = "linear-gradient(135deg, #3610E0 0%, #4318FF 100%)";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 16px rgba(67,24,255,0.25)";
            } else {
              e.target.style.background = "#1A1A2E";
              e.target.style.color = "#fff";
            }
          }}
          onMouseLeave={(e) => {
            if (p.ctaStyle === "filled") {
              e.target.style.background = "linear-gradient(135deg, #4318FF 0%, #5B3AFF 100%)";
              e.target.style.transform = "none";
              e.target.style.boxShadow = "none";
            } else {
              e.target.style.background = "transparent";
              e.target.style.color = "#1A1A2E";
            }
          }}
        >
          {p.cta}
        </button>
        {p.social && (
          <div
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              textAlign: "center",
              marginTop: 10,
            }}
          >
            {p.social}
          </div>
        )}
      </div>
    </div>
  );
}

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open]);

  return (
    <div
      style={{
        borderBottom: "1px solid #E5E7EB",
        cursor: "pointer",
      }}
      onClick={() => setOpen(!open)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 0",
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A2E", flex: 1, paddingRight: 16 }}>
          {item.q}
        </span>
        <span
          style={{
            fontSize: 20,
            color: "#9CA3AF",
            transition: "transform 0.25s",
            transform: open ? "rotate(45deg)" : "none",
            flexShrink: 0,
            fontWeight: 300,
          }}
        >
          +
        </span>
      </div>
      <div
        ref={contentRef}
        style={{
          overflow: "hidden",
          maxHeight: open ? height : 0,
          transition: "max-height 0.3s ease",
        }}
      >
        <div style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, paddingBottom: 20, paddingRight: 40 }}>
          {item.a}
        </div>
      </div>
    </div>
  );
}

export default function DeltPricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div
      style={{
        fontFamily:
          '"General Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: "#FAFAFA",
        minHeight: "100vh",
        color: "#1A1A2E",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "56px 24px 0" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#4318FF",
            marginBottom: 16,
          }}
        >
          Pricing
        </div>
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 16,
            color: "#1A1A2E",
            letterSpacing: "-0.5px",
          }}
        >
          Simple pricing.
          <br />
          <span style={{ color: "#4318FF" }}>Serious tools.</span>
        </h1>
        <p
          style={{
            fontSize: 18,
            color: "#6B7280",
            maxWidth: 520,
            margin: "0 auto 32px",
            lineHeight: 1.6,
          }}
        >
          One platform for payments, websites, AI analytics, and capital. Start
          free — upgrade when you're ready.
        </p>

        {/* Toggle */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            background: "#fff",
            padding: "6px 8px",
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            marginBottom: 32,
          }}
        >
          <button
            onClick={() => setIsAnnual(false)}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: !isAnnual ? "#1A1A2E" : "transparent",
              color: !isAnnual ? "#fff" : "#6B7280",
              transition: "all 0.2s",
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: isAnnual ? "#1A1A2E" : "transparent",
              color: isAnnual ? "#fff" : "#6B7280",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Annual
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: isAnnual
                  ? "rgba(255,255,255,0.2)"
                  : "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                color: isAnnual ? "#fff" : "#fff",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Product Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          padding: "0 24px 32px",
          flexWrap: "wrap",
        }}
      >
        {PRODUCT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: activeTab === tab.key ? "1.5px solid #4318FF" : "1.5px solid #E5E7EB",
              cursor: "pointer",
              background: activeTab === tab.key ? "#F0EDFF" : "#fff",
              color: activeTab === tab.key ? "#4318FF" : "#6B7280",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {tab.icon && <span style={{ fontSize: 14 }}>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Plan Cards */}
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 24px 64px",
          display: "flex",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        <PlanCard plan="starter" isAnnual={isAnnual} activeTab={activeTab} />
        <PlanCard plan="growth" isAnnual={isAnnual} activeTab={activeTab} />
        <PlanCard plan="scale" isAnnual={isAnnual} activeTab={activeTab} />
      </div>

      {/* Processing Rates Comparison */}
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 24px 64px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #E5E7EB",
            padding: "32px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#4318FF",
              marginBottom: 8,
            }}
          >
            Processing Rates at a Glance
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            All-in rates. No hidden fees.
          </div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 24, maxWidth: 520 }}>
            What you see is what you pay — no interchange markups, no PCI compliance fees, no statement fees.
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
                minWidth: 560,
              }}
            >
              <thead>
                <tr>
                  {["Transaction Type", "Starter", "Growth", "Scale"].map(
                    (h, i) => (
                      <th
                        key={i}
                        style={{
                          textAlign: i === 0 ? "left" : "center",
                          padding: "12px 16px",
                          borderBottom: "2px solid #E5E7EB",
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          color: "#9CA3AF",
                          background: i === 2 ? "#F0EDFF" : "transparent",
                          borderRadius: i === 2 ? "8px 8px 0 0" : 0,
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {[
                  ["In-person (tap, dip, swipe)", "2.7% + 10¢", "2.5% + 10¢", "2.3% + 10¢"],
                  ["Online", "3.2% + 30¢", "2.9% + 30¢", "2.7% + 30¢"],
                  ["Keyed / card-on-file", "3.4% + 15¢", "3.2% + 15¢", "3.0% + 15¢"],
                  ["Settlement speed", "Next-day", "Instant", "Same-day"],
                ].map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        style={{
                          textAlign: ci === 0 ? "left" : "center",
                          padding: "14px 16px",
                          borderBottom:
                            ri < 3 ? "1px solid #F3F4F6" : "none",
                          fontWeight: ci > 0 ? 700 : 400,
                          color: ci > 0 ? "#1A1A2E" : "#374151",
                          background: ci === 2 ? "#F0EDFF" : "transparent",
                          fontSize: ci > 0 ? 15 : 14,
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enterprise CTA */}
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 24px 64px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #1A1A2E 0%, #2D1B69 100%)",
            borderRadius: 16,
            padding: "40px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              Processing over $250K/month?
            </div>
            <div style={{ fontSize: 15, color: "#9CA3AF", maxWidth: 480, lineHeight: 1.6 }}>
              Custom interchange-plus pricing, volume discounts, dedicated account management, and white-glove onboarding. Let's build something tailored.
            </div>
          </div>
          <button
            style={{
              padding: "14px 32px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              border: "2px solid rgba(255,255,255,0.25)",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.1)";
              e.target.style.borderColor = "rgba(255,255,255,0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.borderColor = "rgba(255,255,255,0.25)";
            }}
          >
            Contact Sales
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#4318FF",
              marginBottom: 8,
            }}
          >
            FAQ
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>Common questions</div>
        </div>
        <div>
          {FAQ_DATA.map((item, i) => (
            <FAQItem key={i} item={item} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px 64px",
          borderTop: "1px solid #E5E7EB",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Ready to get started?
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#6B7280",
            maxWidth: 440,
            margin: "0 auto 28px",
            lineHeight: 1.6,
          }}
        >
          Join thousands of businesses running on Delt. Start free — no credit
          card required.
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            style={{
              padding: "14px 36px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              background: "linear-gradient(135deg, #4318FF 0%, #5B3AFF 100%)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Get Started — Free
          </button>
          <button
            style={{
              padding: "14px 36px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              border: "2px solid #E5E7EB",
              background: "#fff",
              color: "#1A1A2E",
              cursor: "pointer",
            }}
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}