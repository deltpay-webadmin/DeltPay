import { useState, useEffect, useRef, useCallback } from "react";

// ── Design tokens ──
const T = {
  bg: "#080B12",
  surface: "#0E1219",
  card: "#141920",
  cardHover: "#1A2030",
  border: "#1E2638",
  borderHi: "#2A3654",
  accent: "#5B3FE4",
  accentLight: "#7C6BF0",
  accentDim: "rgba(91,63,228,0.10)",
  accentGlow: "rgba(91,63,228,0.35)",
  blue: "#3B82F6",
  green: "#22C55E",
  greenDim: "rgba(34,197,94,0.10)",
  gold: "#F59E0B",
  white: "#F4F4F6",
  gray1: "#C8CDD8",
  gray2: "#8B95A8",
  gray3: "#5E6A80",
  gray4: "#3A4358",
};

// ── Reveal on scroll ──
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(28px)",
      transition: `all 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      ...style,
    }}>{children}</div>
  );
}

// ── Label ──
function Label({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 3,
      textTransform: "uppercase", color: T.accentLight,
      marginBottom: 14,
    }}>{children}</div>
  );
}

// ═══════════════════════════════════
// SECTION 1: HERO + SCROLLING GALLERY
// ═══════════════════════════════════

const SITES = [
  { name: "Meridian Dental", type: "Dental Office", color: "#1E3A5F", accent: "#60A5FA" },
  { name: "Stone & Gray Law", type: "Law Firm", color: "#2D1B0E", accent: "#D4A574" },
  { name: "Lux Salon & Spa", type: "Beauty Salon", color: "#3D1F3F", accent: "#E879A8" },
  { name: "Verde Kitchen", type: "Restaurant", color: "#1A2E1A", accent: "#86EFAC" },
  { name: "Atlas Construction", type: "General Contractor", color: "#1F1A0E", accent: "#FCD34D" },
  { name: "Peak Physio", type: "Physical Therapy", color: "#0E1F2E", accent: "#67E8F9" },
  { name: "Bright Path CPA", type: "Accounting Firm", color: "#1A1A2E", accent: "#A78BFA" },
  { name: "Coastal Realty", type: "Real Estate", color: "#0E2A2A", accent: "#2DD4BF" },
];

function SiteCard({ site, index }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 300, height: 210, borderRadius: 14, overflow: "hidden",
        background: site.color, position: "relative", flexShrink: 0,
        border: `1px solid ${hov ? site.accent + "44" : T.border}`,
        transform: hov ? "translateY(-4px) scale(1.02)" : "none",
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        cursor: "pointer",
      }}
    >
      {/* Fake site chrome */}
      <div style={{
        height: 28, background: "rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", padding: "0 10px", gap: 5,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF605C" }} />
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFBD44" }} />
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00CA4E" }} />
        <div style={{
          flex: 1, marginLeft: 8, height: 14, borderRadius: 4,
          background: "rgba(255,255,255,0.08)", fontSize: 8, color: T.gray3,
          display: "flex", alignItems: "center", paddingLeft: 8,
        }}>
          {site.name.toLowerCase().replace(/\s+/g, "")}.com
        </div>
      </div>

      {/* Fake site content */}
      <div style={{ padding: "18px 20px" }}>
        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, alignItems: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: site.accent, letterSpacing: 1 }}>
            {site.name.split(" ")[0].toUpperCase()}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {["About", "Services", "Contact"].map(n => (
              <div key={n} style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>{n}</div>
            ))}
          </div>
        </div>

        {/* Hero text */}
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 8, letterSpacing: -0.5 }}>
          {["Your smile, our priority.", "Justice. Delivered.", "Where beauty meets calm.", "Farm to table. Daily.", "Built to last.", "Move better. Live better.", "Numbers that work for you.", "Find your next home."][index]}
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", lineHeight: 1.5, marginBottom: 12 }}>
          Trusted by hundreds of clients. Book your appointment today.
        </div>

        {/* CTA */}
        <div style={{
          display: "inline-block", padding: "5px 14px", borderRadius: 6,
          background: site.accent, fontSize: 8, fontWeight: 700, color: site.color,
        }}>Book Now</div>
      </div>

      {/* Hover overlay */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "10px 16px",
        background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
        opacity: hov ? 1 : 0, transition: "opacity 0.3s",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{site.name}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{site.type} · Built with Delt</div>
      </div>
    </div>
  );
}

function ScrollingGallery() {
  const doubled = [...SITES, ...SITES];
  return (
    <div style={{ overflow: "hidden", width: "100%", position: "relative" }}>
      {/* Fade edges */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(90deg, ${T.bg}, transparent)`, zIndex: 2 }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(270deg, ${T.bg}, transparent)`, zIndex: 2 }} />
      <div style={{
        display: "flex", gap: 16,
        animation: "scrollGallery 40s linear infinite",
        width: "max-content",
      }}>
        {doubled.map((s, i) => <SiteCard key={i} site={s} index={i % SITES.length} />)}
      </div>
      <style>{`
        @keyframes scrollGallery {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${(300 + 16) * SITES.length}px); }
        }
      `}</style>
    </div>
  );
}

function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <section style={{
      background: T.bg, paddingTop: 60, position: "relative", overflow: "hidden",
    }}>
      {/* Grid texture */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.025,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }} />

      <div style={{
        maxWidth: 900, margin: "0 auto", textAlign: "center",
        padding: "0 24px 50px", position: "relative",
        opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(16px)",
        transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 14px", borderRadius: 50,
          background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`,
          marginBottom: 28, fontSize: 11, color: T.gray2,
        }}>
          <span style={{ color: T.green, fontSize: 8 }}>●</span>
          Now accepting new merchants
        </div>

        <h1 style={{
          fontSize: 58, fontWeight: 800,
          fontFamily: "'Instrument Serif', 'Playfair Display', Georgia, serif",
          color: T.white, lineHeight: 1.08, letterSpacing: -2,
          margin: "0 0 20px",
        }}>
          A website that looks like<br />
          <span style={{ color: T.accentLight }}>you mean business.</span>
        </h1>

        <p style={{
          fontSize: 16, color: T.gray2, lineHeight: 1.65,
          maxWidth: 480, margin: "0 auto 32px",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Professional sites for medical offices, law firms, salons, and
          every business that deserves to look as good online as they are in person.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{
            padding: "13px 30px", borderRadius: 50, border: "none",
            background: `linear-gradient(135deg, ${T.accent}, ${T.blue})`,
            color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit",
          }}>Get Your Site →</button>
          <button style={{
            padding: "13px 30px", borderRadius: 50,
            border: `1px solid ${T.border}`, background: "transparent",
            color: T.gray1, fontSize: 14, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit",
          }}>See Examples</button>
        </div>
      </div>

      <ScrollingGallery />

      {/* Second row scrolls opposite direction */}
      <div style={{ marginTop: 16, marginBottom: 50 }}>
        <div style={{ overflow: "hidden", width: "100%" }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(90deg, ${T.bg}, transparent)`, zIndex: 2 }} />
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(270deg, ${T.bg}, transparent)`, zIndex: 2 }} />
            <div style={{
              display: "flex", gap: 16,
              animation: "scrollGalleryReverse 45s linear infinite",
              width: "max-content",
            }}>
              {[...SITES.slice(4), ...SITES.slice(0, 4), ...SITES.slice(4), ...SITES.slice(0, 4)].map((s, i) => (
                <SiteCard key={`r2-${i}`} site={s} index={i % SITES.length} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollGalleryReverse {
          0% { transform: translateX(-${(300 + 16) * SITES.length}px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}

// ═══════════════════════════════════
// SECTION 2: FEATURE WALKTHROUGH
// ═══════════════════════════════════

const FEATURES = [
  {
    key: "domain",
    label: "Your Domain",
    title: "Your brand, your domain.",
    desc: "yourbusiness.com — not yourname.squarespace.com. Custom domain with auto-provisioned SSL. Your name, your corner of the internet.",
    previewType: "domain",
  },
  {
    key: "design",
    label: "Design",
    title: "Looks like you hired an agency.",
    desc: "Professional layouts, smooth animations, modern typography. Templates designed for your industry — not generic drag-and-drop. The site you've been embarrassed not to have.",
    previewType: "design",
  },
  {
    key: "payments",
    label: "Payments",
    title: "Get paid on your site.",
    desc: "Accept credit cards, ACH, and online payments directly. Every transaction builds your Delt profile for better capital terms. PCI-DSS Level 1. Tokenized.",
    previewType: "payments",
  },
  {
    key: "seo",
    label: "SEO & Speed",
    title: "Customers find you.",
    desc: "SEO-ready from day one. Mobile-first. Edge-cached for sub-second loads on every device. Your site doesn't just exist — it works.",
    previewType: "seo",
  },
  {
    key: "dashboard",
    label: "Dashboard",
    title: "Everything in one place.",
    desc: "Site analytics, payment transactions, capital status, and Lens AI insights — all in one dashboard. No toggling between your website builder, processor, and bank.",
    previewType: "dashboard",
  },
  {
    key: "golive",
    label: "Go Live",
    title: "Live in days, not months.",
    desc: "Answer a few questions. Pick your style. We build it. You're live in under a week — not a 6-month project with an agency you can't afford.",
    previewType: "golive",
  },
];

// Simulated preview panels
function FeaturePreview({ feature }) {
  const previews = {
    domain: (
      <div style={{ padding: 32 }}>
        <div style={{
          background: T.card, borderRadius: 12, overflow: "hidden",
          border: `1px solid ${T.border}`,
        }}>
          <div style={{ height: 32, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", padding: "0 12px", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF605C" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFBD44" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00CA4E" }} />
            <div style={{
              flex: 1, marginLeft: 12, height: 18, borderRadius: 5,
              background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center",
              paddingLeft: 10, fontSize: 11, color: T.gray2,
            }}>
              <span style={{ color: T.green, marginRight: 6 }}>🔒</span>
              yourbusiness.com
            </div>
          </div>
          <div style={{ padding: "40px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: T.white, marginBottom: 8, letterSpacing: -0.5 }}>Your Business Name</div>
            <div style={{ fontSize: 13, color: T.gray3 }}>Professional. Secure. Yours.</div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: T.gray3 }}>
          <span style={{ color: T.green }}>✓</span> SSL auto-provisioned · <span style={{ color: T.green }}>✓</span> DNS configured · <span style={{ color: T.green }}>✓</span> Live in minutes
        </div>
      </div>
    ),
    design: (
      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { name: "Medical", color: "#1E3A5F", accent: "#60A5FA" },
          { name: "Legal", color: "#2D1B0E", accent: "#D4A574" },
          { name: "Salon", color: "#3D1F3F", accent: "#E879A8" },
          { name: "Restaurant", color: "#1A2E1A", accent: "#86EFAC" },
        ].map(t => (
          <div key={t.name} style={{
            background: t.color, borderRadius: 10, padding: "20px 16px",
            border: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: t.accent, letterSpacing: 1.5, marginBottom: 10 }}>{t.name.toUpperCase()} TEMPLATE</div>
            <div style={{ height: 6, width: "80%", background: "rgba(255,255,255,0.15)", borderRadius: 3, marginBottom: 5 }} />
            <div style={{ height: 6, width: "60%", background: "rgba(255,255,255,0.08)", borderRadius: 3, marginBottom: 12 }} />
            <div style={{ height: 4, width: 40, background: t.accent, borderRadius: 2 }} />
          </div>
        ))}
      </div>
    ),
    payments: (
      <div style={{ padding: 32 }}>
        <div style={{ background: T.card, borderRadius: 12, padding: 24, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.gray3, letterSpacing: 1.5, marginBottom: 16 }}>RECENT TRANSACTIONS</div>
          {[
            { name: "Sarah M.", amount: "$150.00", method: "Visa •••• 4242", time: "2 min ago" },
            { name: "James K.", amount: "$85.00", method: "Mastercard •••• 8888", time: "15 min ago" },
            { name: "Online Booking", amount: "$200.00", method: "ACH Transfer", time: "1 hr ago" },
          ].map((tx, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 0", borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.white }}>{tx.name}</div>
                <div style={{ fontSize: 10, color: T.gray3, marginTop: 2 }}>{tx.method} · {tx.time}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.green }}>+{tx.amount}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 10, color: T.accentLight }}>
          Every transaction builds your capital profile →
        </div>
      </div>
    ),
    seo: (
      <div style={{ padding: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Page Speed", value: "98", unit: "/100", color: T.green },
            { label: "Mobile Score", value: "96", unit: "/100", color: T.green },
            { label: "SEO Score", value: "94", unit: "/100", color: T.green },
          ].map(s => (
            <div key={s.label} style={{
              background: T.card, borderRadius: 10, padding: "16px 12px", textAlign: "center",
              border: `1px solid ${T.border}`,
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: -1 }}>{s.value}<span style={{ fontSize: 12, color: T.gray3 }}>{s.unit}</span></div>
              <div style={{ fontSize: 9, color: T.gray3, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{
          background: T.card, borderRadius: 10, padding: 16, border: `1px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 10, color: T.gray3, marginBottom: 8 }}>GOOGLE SEARCH PREVIEW</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.blue, marginBottom: 2 }}>Your Business Name - Professional Services</div>
          <div style={{ fontSize: 11, color: T.green, marginBottom: 4 }}>yourbusiness.com</div>
          <div style={{ fontSize: 11, color: T.gray2, lineHeight: 1.5 }}>Trusted by hundreds of clients. Professional services with a personal touch. Book your appointment online today.</div>
        </div>
      </div>
    ),
    dashboard: (
      <div style={{ padding: 24 }}>
        <div style={{
          background: T.card, borderRadius: 12, padding: 20, border: `1px solid ${T.border}`,
        }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {["Overview", "Transactions", "Capital", "Lens AI"].map((tab, i) => (
              <div key={tab} style={{
                fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                background: i === 0 ? T.accentDim : "transparent",
                color: i === 0 ? T.accentLight : T.gray3,
              }}>{tab}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "This Month", value: "$12,450", sub: "+18% vs last month" },
              { label: "Capital Available", value: "$45,000", sub: "Pre-approved" },
              { label: "Lens AI Score", value: "87", sub: "Growing" },
            ].map(s => (
              <div key={s.label} style={{ background: T.surface, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 8, color: T.gray3, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.white, letterSpacing: -0.5 }}>{s.value}</div>
                <div style={{ fontSize: 8, color: T.green, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          {/* Mini chart placeholder */}
          <div style={{ height: 60, background: T.surface, borderRadius: 8, position: "relative", overflow: "hidden" }}>
            <svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.accent} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={T.accent} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,45 Q50,40 100,35 T200,25 T300,18 T400,10 L400,60 L0,60Z" fill="url(#cg)" />
              <path d="M0,45 Q50,40 100,35 T200,25 T300,18 T400,10" fill="none" stroke={T.accent} strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    ),
    golive: (
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 24 }}>
          {[
            { step: "1", label: "Answer questions", done: true },
            { step: "2", label: "Pick your style", done: true },
            { step: "3", label: "We build it", done: true },
            { step: "4", label: "You're live", done: false },
          ].map((s, i) => (
            <div key={s.step} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: s.done ? T.green : T.accentDim,
                border: s.done ? "none" : `2px dashed ${T.gray4}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                color: s.done ? T.bg : T.gray3,
              }}>{s.done ? "✓" : s.step}</div>
              {i < 3 && <div style={{ width: 40, height: 2, background: s.done ? T.green + "44" : T.border }} />}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 32 }}>
          {["Answer questions", "Pick your style", "We build it", "You're live"].map((l, i) => (
            <div key={l} style={{ fontSize: 9, color: i < 3 ? T.gray2 : T.accentLight, fontWeight: i === 3 ? 700 : 400, width: 76, textAlign: "center" }}>{l}</div>
          ))}
        </div>
        <div style={{
          background: T.greenDim, borderRadius: 12, padding: "20px 24px",
          border: `1px solid ${T.green}22`,
        }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: T.green, letterSpacing: -1 }}>~5 days</div>
          <div style={{ fontSize: 12, color: T.gray2, marginTop: 4 }}>From signup to live site. Not months. Days.</div>
        </div>
      </div>
    ),
  };
  return previews[feature.previewType] || null;
}

function FeatureWalkthrough() {
  const [active, setActive] = useState(0);

  return (
    <section style={{ background: T.bg, padding: "80px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <Reveal>
          <Label>WHAT YOU GET</Label>
          <h2 style={{
            fontSize: 38, fontWeight: 800,
            fontFamily: "'Instrument Serif', Georgia, serif",
            color: T.white, lineHeight: 1.12, letterSpacing: -1.5,
            margin: "0 0 50px",
          }}>
            Create, connect,<br />and go live
          </h2>
        </Reveal>

        <div style={{ display: "flex", gap: 0, minHeight: 420 }}>
          {/* Left nav */}
          <div style={{ width: 260, flexShrink: 0, borderRight: `1px solid ${T.border}` }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.key}
                onClick={() => setActive(i)}
                style={{
                  padding: "16px 20px",
                  cursor: "pointer",
                  borderLeft: `2px solid ${i === active ? T.accent : "transparent"}`,
                  background: i === active ? T.accentDim : "transparent",
                  transition: "all 0.25s ease",
                }}
              >
                <div style={{
                  fontSize: 15, fontWeight: 700,
                  color: i === active ? T.white : T.gray3,
                  transition: "color 0.25s",
                }}>{f.label}</div>
                {i === active && (
                  <div style={{
                    fontSize: 12, color: T.gray2, lineHeight: 1.5,
                    marginTop: 6, maxWidth: 200,
                  }}>{f.desc}</div>
                )}
                {i === active && (
                  <div style={{
                    marginTop: 10, fontSize: 11, fontWeight: 600,
                    color: T.accentLight, cursor: "pointer",
                  }}>Learn more →</div>
                )}
              </div>
            ))}
          </div>

          {/* Right preview */}
          <div style={{
            flex: 1, background: T.surface, borderRadius: "0 16px 16px 0",
            border: `1px solid ${T.border}`, borderLeft: "none",
            overflow: "hidden", position: "relative",
          }}>
            <div key={active} style={{
              animation: "fadeSlideIn 0.4s ease forwards",
            }}>
              <FeaturePreview feature={FEATURES[active]} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

// ═══════════════════════════════════
// SECTION 3: ECOSYSTEM STRIP
// ═══════════════════════════════════

function EcosystemStrip() {
  return (
    <section style={{ background: T.surface, padding: "60px 24px", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <Label>BUILT INTO THE DELT PLATFORM</Label>
          <h3 style={{
            fontSize: 24, fontWeight: 800, color: T.white, margin: "0 0 12px", letterSpacing: -0.5,
            fontFamily: "'Instrument Serif', Georgia, serif",
          }}>
            Your website is the front door. The platform is the building.
          </h3>
          <p style={{ fontSize: 14, color: T.gray3, marginBottom: 36 }}>
            Everything connects. Site → payments → capital → AI insights.
          </p>
        </Reveal>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { icon: "🌐", label: "Professional Website", color: T.accent },
            { icon: "→", label: "", color: "transparent" },
            { icon: "💳", label: "Payment Processing", color: T.blue },
            { icon: "→", label: "", color: "transparent" },
            { icon: "💰", label: "Capital Access", color: T.green },
            { icon: "→", label: "", color: "transparent" },
            { icon: "📊", label: "Lens AI Insights", color: T.gold },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              {item.label ? (
                <div style={{
                  background: item.color + "12", border: `1px solid ${item.color}22`,
                  borderRadius: 12, padding: "16px 20px", minWidth: 130,
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: item.color }}>{item.label}</div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", color: T.gray4, fontSize: 18 }}>→</div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════
// SECTION 4: TESTIMONIALS
// ═══════════════════════════════════

function Testimonials() {
  const testimonials = [
    {
      quote: "I had a GoDaddy site for three years that I was embarrassed to share. Delt built me something I actually send people to now.",
      name: "Dr. Maria Santos",
      role: "Meridian Dental",
      color: "#60A5FA",
    },
    {
      quote: "We went from no online presence to a site that generates 15 new client inquiries a month. In five days.",
      name: "James Crawford",
      role: "Stone & Gray Law",
      color: "#D4A574",
    },
    {
      quote: "The best part? My site payments count toward my capital access. No other website builder does that.",
      name: "Lisa Chen",
      role: "Lux Salon & Spa",
      color: "#E879A8",
    },
  ];

  return (
    <section style={{ background: T.bg, padding: "80px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <Reveal>
          <Label>MERCHANT STORIES</Label>
          <h2 style={{
            fontSize: 32, fontWeight: 800, color: T.white, margin: "0 0 40px", letterSpacing: -0.8,
            fontFamily: "'Instrument Serif', Georgia, serif",
          }}>
            Businesses like yours, online.
          </h2>
        </Reveal>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 100} style={{ flex: "1 1 280px" }}>
              <div style={{
                background: T.card, borderRadius: 16, padding: 28,
                border: `1px solid ${T.border}`, height: "100%",
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ fontSize: 22, color: t.color, marginBottom: 16 }}>"</div>
                <div style={{
                  fontSize: 14, color: T.gray1, lineHeight: 1.65,
                  flex: 1, marginBottom: 20,
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontStyle: "italic",
                }}>{t.quote}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.white }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: t.color, marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════
// SECTION 5: FINAL CTA
// ═══════════════════════════════════

function FinalCTA() {
  return (
    <section style={{
      background: `linear-gradient(170deg, ${T.bg}, ${T.accent}15)`,
      padding: "80px 24px 100px", textAlign: "center",
      borderTop: `1px solid ${T.border}`,
    }}>
      <Reveal>
        <h2 style={{
          fontSize: 40, fontWeight: 800, color: T.white,
          fontFamily: "'Instrument Serif', Georgia, serif",
          lineHeight: 1.12, letterSpacing: -1.5,
          margin: "0 0 16px",
        }}>
          Your site. Live in days.
        </h2>
        <p style={{
          fontSize: 15, color: T.gray2, maxWidth: 420,
          margin: "0 auto 32px", lineHeight: 1.6,
        }}>
          One platform. Professional website, payment processing,<br />
          capital access, and AI insights. All connected.
        </p>
        <button style={{
          padding: "16px 40px", borderRadius: 50, border: "none",
          background: `linear-gradient(135deg, ${T.accent}, ${T.blue})`,
          color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: `0 4px 24px ${T.accentGlow}`,
        }}>Get Your Delt Site →</button>
        <div style={{ marginTop: 14, fontSize: 12, color: T.gray3 }}>
          No contracts. No cancellation fees. Live in under a week.
        </div>
      </Reveal>
    </section>
  );
}

// ═══════════════════════════════════
// PAGE
// ═══════════════════════════════════

export default function DeltWebsiteShowcase() {
  return (
    <div style={{
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      color: T.white, background: T.bg,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <Hero />
      <FeatureWalkthrough />
      <EcosystemStrip />
      <Testimonials />
      <FinalCTA />
    </div>
  );
}