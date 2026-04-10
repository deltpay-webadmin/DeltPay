import { useState, useEffect } from "react";

export default function DeltPaymentsPage() {
  const [loaded, setLoaded] = useState(false);
  const [activeMethod, setActiveMethod] = useState(0);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  const anim = (d) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(20px)",
    transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${d}s`,
  });

  const methods = [
    { label: "Tap to Pay", icon: "contactless" },
    { label: "Chip & PIN", icon: "chip" },
    { label: "Swipe", icon: "swipe" },
    { label: "Online", icon: "online" },
    { label: "Bitcoin", icon: "btc" },
  ];

  return (
    <div style={{
      fontFamily: '"Satoshi", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      WebkitFontSmoothing: "antialiased",
      background: "#fff",
      color: "#0B1A3B",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap');
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(67,24,255,0.15); } 50% { box-shadow: 0 0 40px rgba(67,24,255,0.25); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      {/* ═══ HERO ═══ */}
      <section style={{
        background: "linear-gradient(170deg, #0B1A3B 0%, #0F1F45 40%, #131B3A 100%)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}/>
        {/* Gradient orbs */}
        <div style={{ position: "absolute", top: "10%", right: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(67,24,255,0.08), transparent 70%)", filter: "blur(40px)" }}/>
        <div style={{ position: "absolute", bottom: "10%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)", filter: "blur(40px)" }}/>

        <div style={{
          maxWidth: 1400, margin: "0 auto", padding: "120px 48px 80px",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 60, alignItems: "center",
          position: "relative", zIndex: 2, minHeight: "100vh",
        }}>
          {/* Left: Copy */}
          <div>
            {/* Breadcrumb */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 36,
              ...anim(0.05),
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                  <circle cx="7" cy="6" r="4" fill="#4318FF"/>
                  <circle cx="7" cy="15" r="4" fill="#6C5CE7" opacity="0.7"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>Delt</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>Payments</span>
            </div>

            <h1 style={{
              fontSize: "clamp(42px, 5.5vw, 72px)",
              fontWeight: 900, lineHeight: 1.02,
              letterSpacing: "-2.5px",
              color: "#fff", margin: "0 0 24px",
              ...anim(0.12),
            }}>
              Accept every
              <br/>payment.
              <br/><span style={{ color: "#4318FF" }}>Everywhere.</span>
            </h1>

            <p style={{
              fontSize: 18, lineHeight: 1.6,
              color: "rgba(255,255,255,0.45)",
              maxWidth: 440, margin: "0 0 36px",
              ...anim(0.2),
            }}>
              Tap, chip, swipe, online, and Bitcoin. Same-day payouts. Zero hidden fees. Hardware included on every plan.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, marginBottom: 48, ...anim(0.28) }}>
              <a href="/get-started" style={{
                fontSize: 15, fontWeight: 700, color: "#0B1A3B",
                background: "#fff", padding: "15px 30px", borderRadius: 10,
                textDecoration: "none", transition: "all 0.15s",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#4318FF"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#0B1A3B"; }}
              >
                Get Started — Free
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 7h12M8 2l5 5-5 5"/></svg>
              </a>
              <a href="/contact" style={{
                fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.6)",
                border: "1.5px solid rgba(255,255,255,0.12)",
                padding: "15px 30px", borderRadius: 10, textDecoration: "none",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
              >Talk to Sales</a>
            </div>

            {/* Payment method pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", ...anim(0.35) }}>
              {methods.map((m, i) => (
                <button key={i}
                  onClick={() => setActiveMethod(i)}
                  style={{
                    fontSize: 12, fontWeight: 600,
                    color: activeMethod === i ? "#fff" : "rgba(255,255,255,0.3)",
                    background: activeMethod === i ? "rgba(67,24,255,0.2)" : "rgba(255,255,255,0.03)",
                    border: activeMethod === i ? "1px solid rgba(67,24,255,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    padding: "8px 16px", borderRadius: 8,
                    cursor: "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  {m.icon === "btc" && <span style={{ color: "#F7931A", fontSize: 13 }}>₿</span>}
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Terminal device */}
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            ...anim(0.3),
          }}>
            <div style={{
              position: "relative",
              animation: "float 6s ease-in-out infinite",
            }}>
              {/* Terminal body */}
              <div style={{
                width: 280, background: "#1C1C2E",
                borderRadius: "32px 32px 20px 20px",
                padding: "0",
                boxShadow: "0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset",
                overflow: "hidden",
              }}>
                {/* NFC area */}
                <div style={{
                  background: "linear-gradient(180deg, #252540, #1C1C2E)",
                  padding: "32px 0 24px",
                  display: "flex", justifyContent: "center", alignItems: "center",
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M10 18c-2.2-2.2-2.2-5.8 0-8"/>
                      <path d="M7 21c-3.9-3.9-3.9-10.1 0-14"/>
                      <path d="M18 10c2.2 2.2 2.2 5.8 0 8"/>
                      <path d="M21 7c3.9 3.9 3.9 10.1 0 14"/>
                      <circle cx="14" cy="14" r="2" fill="rgba(255,255,255,0.3)"/>
                    </svg>
                  </div>
                </div>

                {/* Screen */}
                <div style={{
                  background: "#fff",
                  margin: "0 12px",
                  borderRadius: "14px 14px 0 0",
                  padding: "20px 20px 24px",
                  minHeight: 220,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                }}>
                  {/* Status bar */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", width: "100%",
                    marginBottom: 24, padding: "0 4px",
                  }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#A0A0B0" }}>11:11</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="#A0A0B0"><path d="M1 8h2v3H1zM4 6h2v5H4zM7 4h2v7H7zM10 1h2v10h-2z"/></svg>
                    </div>
                  </div>

                  {/* Delt logo on screen */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    marginBottom: 24,
                  }}>
                    <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
                      <circle cx="8" cy="7" r="5" fill="#4318FF"/>
                      <circle cx="8" cy="18" r="5" fill="#6C5CE7" opacity="0.7"/>
                    </svg>
                    <span style={{ fontSize: 24, fontWeight: 900, color: "#0B1A3B", letterSpacing: "-0.8px" }}>Delt</span>
                  </div>

                  {/* Transaction display */}
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#A0A0B0", marginBottom: 4 }}>Total</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: "#0B1A3B", letterSpacing: "-1px" }}>$173.88</div>
                    <div style={{ fontSize: 12, color: "#A0A0B0", marginTop: 4 }}>Tap, insert, or swipe to pay</div>
                  </div>
                </div>

                {/* Bottom gradient bar */}
                <div style={{
                  background: "linear-gradient(135deg, #4318FF, #6C5CE7)",
                  margin: "0 12px 12px",
                  borderRadius: "0 0 10px 10px",
                  padding: "12px",
                  textAlign: "center",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: "0.3px" }}>Swipe to Unlock</span>
                  <div style={{ marginTop: 4 }}>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="#fff"><path d="M10 1l5 5-5 5M0 6h14" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>

              {/* Floating approval badge */}
              <div style={{
                position: "absolute", bottom: 60, right: -100,
                background: "#fff", borderRadius: 12, padding: "12px 18px",
                boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
                display: "flex", alignItems: "center", gap: 10,
                animation: "float 5s ease-in-out infinite 1s",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, #10B981, #34D399)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                }}>✓</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0B1A3B" }}>Approved</div>
                  <div style={{ fontSize: 11, color: "#A0A0B0" }}>Same-day payout</div>
                </div>
              </div>

              {/* BTC badge */}
              <div style={{
                position: "absolute", top: 40, left: -80,
                background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)",
                borderRadius: 10, padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.08)",
                animation: "float 7s ease-in-out infinite 0.5s",
              }}>
                <div style={{ fontSize: 20, marginBottom: 4, textAlign: "center" }}>₿</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>BTC accepted</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES STRIP ═══ */}
      <section style={{
        background: "#fff",
        borderBottom: "1px solid #EBEBF0",
        padding: "0 48px",
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        }}>
          {[
            { val: "Same-day", label: "Payouts", sub: "Funds hit your account today" },
            { val: "₿ Bitcoin", label: "Accepted", sub: "Lightning-fast crypto payments" },
            { val: "$0", label: "Hidden fees", sub: "What you see is what you pay" },
            { val: "Free", label: "Hardware", sub: "Card reader on every plan" },
          ].map((f, i) => (
            <div key={i} style={{
              padding: "36px 28px",
              borderRight: i < 3 ? "1px solid #EBEBF0" : "none",
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#0B1A3B", letterSpacing: "-0.8px", lineHeight: 1 }}>{f.val}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#4318FF", marginTop: 4 }}>{f.label}</div>
              <div style={{ fontSize: 13, color: "#8888A0", marginTop: 6 }}>{f.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ RATES ═══ */}
      <section style={{ background: "#FAFAFC", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, fontWeight: 500, letterSpacing: "1.2px",
                textTransform: "uppercase", color: "#4318FF", marginBottom: 16,
              }}>Transparent Pricing</div>
              <h2 style={{
                fontSize: "clamp(28px, 3.5vw, 44px)",
                fontWeight: 900, lineHeight: 1.08, letterSpacing: "-1.2px",
                color: "#0B1A3B", marginBottom: 20,
              }}>
                All-in rates.
                <br/>No surprises.
              </h2>
              <p style={{
                fontSize: 16, lineHeight: 1.65, color: "#71717A",
                maxWidth: 400, marginBottom: 32,
              }}>
                No interchange markups, no PCI compliance fees, no monthly minimums, no statement fees. One rate. That's it.
              </p>
              <a href="/pricing" style={{
                fontSize: 14, fontWeight: 700, color: "#4318FF",
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
              }}>Compare all plans <span>→</span></a>
            </div>

            {/* Rate cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { tier: "Starter", rate: "2.7% + 10¢", settlement: "2-day", badge: "Free" },
                { tier: "Growth", rate: "2.5% + 10¢", settlement: "Next-day", badge: "$99/mo", featured: true },
                { tier: "Scale", rate: "2.3% + 10¢", settlement: "Same-day", badge: "$199/mo" },
              ].map((r, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "20px 24px",
                  background: r.featured ? "#0B1A3B" : "#fff",
                  border: r.featured ? "none" : "1px solid #EBEBF0",
                  borderRadius: 14,
                  transition: "transform 0.15s",
                  cursor: "default",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{
                      fontSize: 14, fontWeight: 700,
                      color: r.featured ? "#fff" : "#0B1A3B",
                      width: 70,
                    }}>{r.tier}</span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11, fontWeight: 500,
                      color: r.featured ? "rgba(255,255,255,0.3)" : "#A0A0B0",
                      padding: "3px 10px", borderRadius: 5,
                      background: r.featured ? "rgba(255,255,255,0.06)" : "#F5F5F8",
                    }}>{r.badge}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 16, fontWeight: 700,
                        color: r.featured ? "#fff" : "#0B1A3B",
                      }}>{r.rate}</div>
                      <div style={{ fontSize: 11, color: r.featured ? "rgba(255,255,255,0.3)" : "#A0A0B0" }}>in-person</div>
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 700,
                      color: r.featured ? "#4318FF" : "#10B981",
                    }}>{r.settlement}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BITCOIN SECTION ═══ */}
      <section style={{
        background: "#0B1A3B",
        padding: "80px 48px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          fontSize: 300, fontWeight: 900, color: "rgba(255,255,255,0.015)",
          letterSpacing: "-10px", userSelect: "none",
        }}>₿</div>

        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 14px 6px 8px", borderRadius: 6,
                background: "rgba(247,147,26,0.1)", border: "1px solid rgba(247,147,26,0.2)",
                marginBottom: 24,
              }}>
                <span style={{ fontSize: 16 }}>₿</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11, fontWeight: 600, color: "#F7931A",
                }}>Bitcoin Payments</span>
              </div>

              <h2 style={{
                fontSize: "clamp(28px, 3.5vw, 44px)",
                fontWeight: 900, lineHeight: 1.08, letterSpacing: "-1.2px",
                color: "#fff", marginBottom: 20,
              }}>
                Accept Bitcoin.
                <br/>Settle instantly.
              </h2>
              <p style={{
                fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.4)",
                maxWidth: 420, marginBottom: 32,
              }}>
                Your customers pay with Bitcoin. You receive dollars — or keep it as BTC. Lightning Network support for instant confirmation. Zero processing fees on Bitcoin transactions.
              </p>
              <div style={{ display: "flex", gap: 24 }}>
                {[
                  { v: "0%", l: "Processing fee" },
                  { v: "Instant", l: "Settlement" },
                  { v: "USD or BTC", l: "You choose" },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#F7931A", letterSpacing: "-0.5px" }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{
                width: 320, height: 320, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(247,147,26,0.08) 0%, transparent 70%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <div style={{
                  width: 180, height: 180, borderRadius: "50%",
                  background: "rgba(247,147,26,0.06)",
                  border: "1px solid rgba(247,147,26,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  animation: "glow 4s ease infinite",
                }}>
                  <span style={{ fontSize: 64, color: "#F7931A" }}>₿</span>
                </div>
                {/* Orbiting elements */}
                {["Lightning", "Instant", "0% fee"].map((t, i) => (
                  <div key={i} style={{
                    position: "absolute",
                    top: i === 0 ? "5%" : i === 1 ? "75%" : "40%",
                    left: i === 0 ? "60%" : i === 1 ? "10%" : "80%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8, padding: "6px 12px",
                    fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)",
                  }}>{t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SETTLEMENT ═══ */}
      <section style={{ background: "#fff", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, fontWeight: 500, letterSpacing: "1.2px",
            textTransform: "uppercase", color: "#4318FF", marginBottom: 16,
          }}>Settlement Speed</div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 900, letterSpacing: "-1.5px",
            color: "#0B1A3B", marginBottom: 16,
          }}>
            Your money. Faster.
          </h2>
          <p style={{
            fontSize: 17, color: "#71717A", maxWidth: 480,
            margin: "0 auto 48px", lineHeight: 1.6,
          }}>
            Most processors hold your funds for days. Delt gets your money to you the same day — or next day on Growth.
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
            maxWidth: 900, margin: "0 auto",
          }}>
            {[
              { speed: "2-day", plan: "Starter", desc: "Standard settlement for free plan merchants", active: false },
              { speed: "Next-day", plan: "Growth", desc: "Funds deposited by next business morning", active: true },
              { speed: "Same-day", plan: "Scale", desc: "Money in your account before close of business", active: false },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "32px 28px",
                background: s.active ? "#0B1A3B" : "#FAFAFC",
                border: s.active ? "none" : "1px solid #EBEBF0",
                borderRadius: 16,
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: 36, fontWeight: 900, letterSpacing: "-1px",
                  color: s.active ? "#4318FF" : "#0B1A3B",
                  marginBottom: 4,
                }}>{s.speed}</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11, fontWeight: 600,
                  color: s.active ? "rgba(255,255,255,0.3)" : "#A0A0B0",
                  textTransform: "uppercase", letterSpacing: "0.8px",
                  marginBottom: 12,
                }}>{s.plan}</div>
                <div style={{
                  fontSize: 13, color: s.active ? "rgba(255,255,255,0.35)" : "#8888A0",
                  lineHeight: 1.5,
                }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HARDWARE ═══ */}
      <section style={{
        background: "#FAFAFC", padding: "80px 48px",
        borderTop: "1px solid #EBEBF0",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 500, letterSpacing: "1.2px",
              textTransform: "uppercase", color: "#4318FF", marginBottom: 16,
            }}>Hardware</div>
            <h2 style={{
              fontSize: "clamp(28px, 3.5vw, 44px)",
              fontWeight: 900, letterSpacing: "-1.2px",
              color: "#0B1A3B", marginBottom: 12,
            }}>
              Built for the counter. And beyond.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { name: "Delt Reader", price: "Free", desc: "Bluetooth card reader. Tap, chip, and swipe. Pairs with any phone or tablet.", tag: "Included on every plan" },
              { name: "Delt Terminal", price: "Free on Growth", desc: "Standalone wireless terminal with touchscreen. Accepts all payment methods including NFC and Bitcoin.", tag: "$299 value" },
              { name: "Delt Register", price: "Free on Scale", desc: "Full countertop POS system with receipt printer, cash drawer, and customer-facing display.", tag: "$1,200+ value" },
            ].map((h, i) => (
              <div key={i} style={{
                background: "#fff", border: "1px solid #EBEBF0",
                borderRadius: 16, padding: "32px 28px",
                display: "flex", flexDirection: "column",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#4318FF"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(67,24,255,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#EBEBF0"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Placeholder device silhouette */}
                <div style={{
                  height: 140, background: "#F5F5F8", borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 24,
                }}>
                  <div style={{
                    width: i === 0 ? 48 : i === 1 ? 56 : 80,
                    height: i === 0 ? 32 : i === 1 ? 80 : 64,
                    borderRadius: i === 0 ? 8 : i === 1 ? 12 : 6,
                    background: "#0B1A3B",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                      <circle cx="6" cy="5" r="3.5" fill="#4318FF"/>
                      <circle cx="6" cy="13" r="3.5" fill="#6C5CE7" opacity="0.7"/>
                    </svg>
                  </div>
                </div>

                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, fontWeight: 600, color: "#4318FF",
                  background: "#F0EDFF", padding: "3px 10px",
                  borderRadius: 4, display: "inline-block",
                  alignSelf: "flex-start", marginBottom: 12,
                }}>{h.tag}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#0B1A3B", marginBottom: 4 }}>{h.name}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#4318FF", marginBottom: 12 }}>{h.price}</div>
                <div style={{ fontSize: 14, color: "#71717A", lineHeight: 1.55, flex: 1 }}>{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section style={{
        background: "#0B1A3B", padding: "72px 48px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 900, letterSpacing: "-1px",
            color: "#fff", marginBottom: 16,
          }}>
            Start accepting payments today.
          </h2>
          <p style={{
            fontSize: 17, color: "rgba(255,255,255,0.4)",
            marginBottom: 32, lineHeight: 1.6,
          }}>
            Free to start. Free hardware. No contracts. Upgrade when you're ready.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <a href="/get-started" style={{
              fontSize: 16, fontWeight: 700, color: "#0B1A3B",
              background: "#fff", padding: "16px 36px", borderRadius: 10,
              textDecoration: "none", transition: "all 0.15s",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#4318FF"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#0B1A3B"; }}
            >
              Get Started — Free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 7h12M8 2l5 5-5 5"/></svg>
            </a>
            <a href="/pricing" style={{
              fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.6)",
              border: "1.5px solid rgba(255,255,255,0.15)",
              padding: "16px 36px", borderRadius: 10, textDecoration: "none",
            }}>See Pricing</a>
          </div>
        </div>
      </section>
    </div>
  );
}