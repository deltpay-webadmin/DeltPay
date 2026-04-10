import { useState, useEffect } from "react";

export default function DeltHeroHub() {
  const [loaded, setLoaded] = useState(false);
  const [activeProduct, setActiveProduct] = useState(0);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  useEffect(() => {
    const t = setInterval(() => setActiveProduct(p => (p + 1) % 4), 4000);
    return () => clearInterval(t);
  }, []);

  const s = (delay) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(20px)",
    transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  const products = [
    { label: "Payments", stat: "2.5% + 10¢", statLabel: "per transaction · Growth plan", desc: "Every method. In-person, online, mobile. Free reader included." },
    { label: "Websites", stat: "48 hrs", statLabel: "to go live · done for you", desc: "Custom-designed. Hosted. SSL. SEO. Not a template." },
    { label: "Lens AI", stat: "+18%", statLabel: "avg. revenue insight", desc: "Trained on your data — not the internet. Knows your business, nothing else." },
    { label: "Capital", stat: "$25K–500K", statLabel: "funding range", desc: "Revenue-based. No equity. No personal guarantee. Hours, not weeks." },
  ];

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
      WebkitFontSmoothing: "antialiased",
      background: "#FFFFFF",
      overflowX: "hidden",
      color: "#0A0A14",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>

      {/* ═══ HERO ═══ */}
      <section style={{ borderBottom: "1px solid #E8E8EC" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "100px 48px 64px" }}>

          {/* Eyebrow */}
          <div style={{ marginBottom: 32, ...s(0.05) }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "6px 16px 6px 10px",
              border: "1px solid #E8E8EC", borderRadius: 6, background: "#FAFAFA",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }}/>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12, fontWeight: 500, color: "#6B7280",
              }}>v1.0 — Now onboarding merchants</span>
            </div>
          </div>

          {/* Headline */}
          <div style={{ maxWidth: 720, marginBottom: 20, ...s(0.1) }}>
            <h1 style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 700, lineHeight: 1.08,
              letterSpacing: "-2px", color: "#0A0A14", margin: 0,
            }}>
              The platform your
              <br/>business is{" "}
              <span style={{ color: "#4318FF", position: "relative", display: "inline-block" }}>
                missing
                <svg style={{ position: "absolute", bottom: -3, left: 0, width: "100%", height: 6 }} viewBox="0 0 200 6" preserveAspectRatio="none">
                  <path d="M0 5 Q50 0 100 3 T200 1" stroke="#4318FF" strokeWidth="2" fill="none" opacity="0.3"/>
                </svg>
              </span>.
            </h1>
          </div>

          {/* Sub-headline — the hub positioning */}
          <p style={{
            fontSize: 13, fontWeight: 600, color: "#4318FF",
            letterSpacing: "0.3px", marginBottom: 12, textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
            ...s(0.16),
          }}>
            Payments · Websites · AI · Capital — one hub
          </p>

          {/* Subhead */}
          <p style={{
            fontSize: 18, lineHeight: 1.65, color: "#6B7280",
            maxWidth: 540, margin: "0 0 36px",
            ...s(0.22),
          }}>
            Delt is the operating hub for your revenue. Process payments, launch your website, get funded, and understand your business with AI — all from one dashboard. Connects to the tools you already use.
          </p>

          {/* CTAs + stats row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            ...s(0.3),
          }}>
            <a href="/get-started" style={{
              fontSize: 15, fontWeight: 700, color: "#fff",
              background: "#0A0A14", padding: "14px 30px", borderRadius: 8,
              textDecoration: "none", transition: "all 0.2s",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#4318FF"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#0A0A14"; e.currentTarget.style.transform = "none"; }}
            >
              Get Started — Free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 7h12M8 2l5 5-5 5"/></svg>
            </a>
            <a href="/demo" style={{
              fontSize: 15, fontWeight: 600, color: "#0A0A14",
              border: "1.5px solid #D1D1D8", padding: "14px 30px",
              borderRadius: 8, textDecoration: "none", background: "#fff",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#0A0A14"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#D1D1D8"}
            >See a Demo</a>

            <div style={{ height: 32, width: 1, background: "#E8E8EC", margin: "0 8px" }}/>

            <div style={{ display: "flex", gap: 28 }}>
              {[
                { v: "5 min", l: "Setup" },
                { v: "$0/mo", l: "To start" },
                { v: "48 hr", l: "Funding" },
              ].map((st, i) => (
                <div key={i}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#0A0A14", letterSpacing: "-0.3px" }}>{st.v}</div>
                  <div style={{ fontSize: 11, color: "#9CA0AB", fontWeight: 500 }}>{st.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ PRODUCT SHOWCASE STRIP ═══ */}
        <div style={{ background: "#0A0A14", ...s(0.45) }}>
          <div style={{
            maxWidth: 1300, margin: "0 auto", padding: "0 48px",
            display: "flex", height: 360,
          }}>
            {/* Left: Product tabs */}
            <div style={{
              width: 280, flexShrink: 0,
              borderRight: "1px solid rgba(255,255,255,0.06)",
              padding: "32px 24px 32px 0",
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, fontWeight: 500, letterSpacing: "1.2px",
                textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
                marginBottom: 12, paddingLeft: 14,
              }}>The Hub</div>

              {products.map((p, i) => (
                <div key={i} onClick={() => setActiveProduct(i)} style={{
                  padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                  background: activeProduct === i ? "rgba(67,24,255,0.1)" : "transparent",
                  borderLeft: activeProduct === i ? "2px solid #4318FF" : "2px solid transparent",
                  transition: "all 0.25s",
                }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    color: activeProduct === i ? "#fff" : "rgba(255,255,255,0.4)",
                    transition: "color 0.25s", marginBottom: 2,
                  }}>{p.label}</div>
                  <div style={{
                    fontSize: 12, lineHeight: 1.4,
                    color: activeProduct === i ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)",
                    transition: "color 0.25s",
                  }}>{p.desc}</div>
                </div>
              ))}
            </div>

            {/* Center: Active stat */}
            <div style={{
              flex: 1, padding: "40px 48px",
              display: "flex", flexDirection: "column", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}>
              {products.map((p, i) => (
                <div key={i} style={{
                  position: i === activeProduct ? "relative" : "absolute",
                  opacity: activeProduct === i ? 1 : 0,
                  transform: activeProduct === i ? "translateY(0)" : "translateY(12px)",
                  transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                  pointerEvents: activeProduct === i ? "auto" : "none",
                }}>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11, fontWeight: 500, color: "#4318FF",
                    letterSpacing: "0.5px", marginBottom: 16, textTransform: "uppercase",
                  }}>{p.label}</div>
                  <div style={{
                    fontSize: 64, fontWeight: 800, color: "#fff",
                    letterSpacing: "-2px", lineHeight: 1, marginBottom: 8,
                  }}>{p.stat}</div>
                  <div style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{p.statLabel}</div>
                </div>
              ))}

              {/* Progress dots */}
              <div style={{
                position: "absolute", bottom: 32, right: 0,
                display: "flex", gap: 6,
              }}>
                {products.map((_, i) => (
                  <div key={i} onClick={() => setActiveProduct(i)} style={{
                    width: activeProduct === i ? 24 : 6, height: 6, borderRadius: 3,
                    background: activeProduct === i ? "#4318FF" : "rgba(255,255,255,0.12)",
                    transition: "all 0.3s", cursor: "pointer",
                  }}/>
                ))}
              </div>
            </div>

            {/* Right: Live feed + integrations hint */}
            <div style={{
              width: 250, flexShrink: 0,
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              padding: "32px 0 32px 28px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}>
              <div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, fontWeight: 500, letterSpacing: "1.2px",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
                  marginBottom: 16,
                }}>Live Feed</div>

                {[
                  { n: "Maria's Bakery", a: "$847.50" },
                  { n: "Peak Fitness", a: "$2,340" },
                  { n: "BlueLine Plumbing", a: "$1,125" },
                ].map((tx, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginBottom: 14,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{tx.n}</div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{tx.a}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.3px" }}>✓ approved</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Integrations hint */}
              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: 16,
              }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, fontWeight: 500, letterSpacing: "1px",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
                  marginBottom: 10,
                }}>Connects to</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["QuickBooks", "Mailchimp", "Zapier", "Google"].map((tool, i) => (
                    <span key={i} style={{
                      fontSize: 11, fontWeight: 600,
                      color: "rgba(255,255,255,0.3)",
                      padding: "4px 10px", borderRadius: 5,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.02)",
                    }}>{tool}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LOGO STRIP ═══ */}
      <section style={{ borderBottom: "1px solid #E8E8EC", padding: "20px 48px", background: "#FAFAFA" }}>
        <div style={{
          maxWidth: 1300, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 48, flexWrap: "wrap",
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, fontWeight: 500, color: "#C4C4CC",
            letterSpacing: "0.5px", textTransform: "uppercase",
          }}>Merchants</span>
          {["Precision Auto", "Summit HVAC", "Bright Smile Dental", "GreenScape", "Atlas PT", "Harbor Coffee"].map((n, i) => (
            <span key={i} style={{
              fontSize: 14, fontWeight: 700, color: "#D4D4DC",
              whiteSpace: "nowrap", transition: "color 0.15s", cursor: "default",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#8888A0"}
              onMouseLeave={e => e.currentTarget.style.color = "#D4D4DC"}
            >{n}</span>
          ))}
        </div>
      </section>

      {/* ═══ LENS AI CALLOUT ═══ */}
      <section style={{ background: "#fff", padding: "72px 48px", borderBottom: "1px solid #E8E8EC" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", gap: 48, alignItems: "center" }}>
          {/* Left: The argument */}
          <div style={{ flex: 1, maxWidth: 540 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 500, letterSpacing: "1.2px",
              textTransform: "uppercase", color: "#4318FF", marginBottom: 16,
            }}>Lens AI</div>
            <h2 style={{
              fontSize: "clamp(26px, 3.5vw, 40px)",
              fontWeight: 700, lineHeight: 1.15, letterSpacing: "-1px",
              color: "#0A0A14", marginBottom: 16,
            }}>
              It doesn't know who won
              <br/>the Super Bowl.
            </h2>
            <p style={{
              fontSize: 17, lineHeight: 1.65, color: "#6B7280", marginBottom: 24,
            }}>
              Lens is trained exclusively on your business data — your transactions, your revenue patterns, your seasonal trends. It doesn't know random facts. It knows that your Tuesday lunch rush outperforms Friday by 22%, and that you should reorder inventory by Thursday.
            </p>
            <p style={{
              fontSize: 15, lineHeight: 1.6, color: "#9CA0AB", marginBottom: 32,
            }}>
              General-purpose AI gives general-purpose answers. Lens gives answers that are worth money — because they're built on the data that actually runs your business.
            </p>
            <a href="/solutions/lens" style={{
              fontSize: 14, fontWeight: 700, color: "#4318FF",
              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
              transition: "gap 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.gap = "10px"}
              onMouseLeave={e => e.currentTarget.style.gap = "6px"}
            >
              Explore Lens AI <span>→</span>
            </a>
          </div>

          {/* Right: Comparison */}
          <div style={{ flex: 1, maxWidth: 520 }}>
            <div style={{
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              {/* ChatGPT example */}
              <div style={{
                background: "#FAFAFA", border: "1px solid #E8E8EC",
                borderRadius: 12, padding: "20px 24px",
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: "#9CA0AB",
                  textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10,
                }}>General AI</div>
                <div style={{
                  fontSize: 14, color: "#6B7280", marginBottom: 12, fontStyle: "italic",
                }}>"How's my revenue trending?"</div>
                <div style={{
                  background: "#fff", borderRadius: 8, padding: "14px 16px",
                  border: "1px solid #E8E8EC", fontSize: 14, color: "#9CA0AB", lineHeight: 1.5,
                }}>
                  I don't have access to your business data. You could try exporting your sales from your POS system and analyzing trends in a spreadsheet...
                </div>
              </div>

              {/* Lens example */}
              <div style={{
                background: "#0A0A14", border: "1px solid #1E1E32",
                borderRadius: 12, padding: "20px 24px",
              }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11, fontWeight: 500, color: "#4318FF",
                  letterSpacing: "0.5px", marginBottom: 10,
                }}>LENS AI</div>
                <div style={{
                  fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 12, fontStyle: "italic",
                }}>"How's my revenue trending?"</div>
                <div style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "14px 16px",
                  border: "1px solid rgba(255,255,255,0.06)", fontSize: 14,
                  color: "rgba(255,255,255,0.8)", lineHeight: 1.55,
                }}>
                  Revenue is <span style={{ color: "#34D399", fontWeight: 700 }}>up 18% month-over-month</span>, driven by a 23% increase in Saturday transactions since you added online ordering. Your average ticket size grew from $42 to $49. At this rate, you'll clear $84K this quarter.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HUB POSITIONING ═══ */}
      <section style={{ background: "#FAFAFA", padding: "72px 48px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, fontWeight: 500, letterSpacing: "1.2px",
            textTransform: "uppercase", color: "#4318FF", marginBottom: 12,
          }}>Your Revenue Hub</div>
          <h2 style={{
            fontSize: "clamp(26px, 3.5vw, 40px)",
            fontWeight: 700, lineHeight: 1.15, letterSpacing: "-1px",
            color: "#0A0A14", marginBottom: 16,
          }}>
            Delt doesn't replace your stack.
            <br/>It makes your stack work.
          </h2>
          <p style={{
            fontSize: 17, color: "#6B7280", maxWidth: 520,
            margin: "0 auto 48px", lineHeight: 1.6,
          }}>
            Your payments, invoices, website traffic, and capital — all flowing through one hub. Connected to the tools you already rely on.
          </p>

          {/* Integration grid */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 48,
          }}>
            {[
              { name: "QuickBooks", cat: "Accounting" },
              { name: "Mailchimp", cat: "Email" },
              { name: "Zapier", cat: "Automation" },
              { name: "Google Business", cat: "Listings" },
              { name: "Xero", cat: "Accounting" },
              { name: "Square (import)", cat: "Migration" },
            ].map((tool, i) => (
              <div key={i} style={{
                background: "#fff", border: "1px solid #E8E8EC",
                borderRadius: 10, padding: "14px 20px",
                textAlign: "center", minWidth: 140,
                transition: "all 0.2s", cursor: "default",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#4318FF"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8E8EC"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0A0A14", marginBottom: 2 }}>{tool.name}</div>
                <div style={{ fontSize: 11, color: "#9CA0AB" }}>{tool.cat}</div>
              </div>
            ))}
          </div>

          {/* The four products */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
            background: "#E8E8EC", borderRadius: 14, overflow: "hidden",
            border: "1px solid #E8E8EC",
          }}>
            {[
              { label: "Payments", desc: "Process every transaction. Manage your receivables. Free hardware on every plan.",
                icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" strokeWidth="1.3" stroke="#4318FF"><rect x="1.5" y="4.5" width="19" height="13" rx="2.5"/><path d="M1.5 9.5h19"/><path d="M5.5 13.5h4"/></svg> },
              { label: "Websites", desc: "Your storefront, built for you. Custom design, hosting, SSL, SEO.",
                icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" strokeWidth="1.3" stroke="#4318FF"><circle cx="11" cy="11" r="9.5"/><ellipse cx="11" cy="11" rx="4" ry="9.5"/><path d="M2 11h18"/></svg> },
              { label: "Lens AI", desc: "Intelligence trained on your data. Revenue trends, forecasting, natural-language queries.",
                icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" strokeWidth="1.3" stroke="#4318FF" strokeLinecap="round"><path d="M4 18V11"/><path d="M8.5 18V7"/><path d="M13 18V9"/><path d="M17.5 18V4"/></svg> },
              { label: "Capital", desc: "Revenue-based funding. Apply in minutes. No equity, no personal guarantee.",
                icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none" strokeWidth="1.3" stroke="#4318FF"><circle cx="11" cy="11" r="9.5"/><path d="M8 14l6-6M14 8h-3.5M14 8v3.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
            ].map((p, i) => (
              <a key={i} href="#" style={{
                background: "#fff", padding: "32px 28px",
                textDecoration: "none", transition: "background 0.2s",
                display: "flex", flexDirection: "column", cursor: "pointer",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: "#F5F3FF", border: "1px solid #EDEDF5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>{p.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#0A0A14", marginBottom: 8 }}>{p.label}</div>
                <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.55, flex: 1 }}>{p.desc}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#4318FF", marginTop: 18, display: "flex", alignItems: "center", gap: 5 }}>
                  Explore <span>→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}