import { useState, useEffect } from "react";

/* ════════════════════════════════════════════════════════════════
   DOMAIN GRAPHIC — Toast-inspired phone showing search results.
   The Delt customer is the #1 result (highlighted with brand glow,
   rating, "Top Match" pill). Competitors below in muted gray.
   Floating ranking pill peeks from the side for layered depth.
   ════════════════════════════════════════════════════════════════ */
export function DomainGraphic() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px 16px",
      boxSizing: "border-box",
      position: "relative",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 480,
        height: 320,
        background: "radial-gradient(closest-side, rgba(73,69,255,0.18), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ═══ Floating "RANK #1" pill — peeking left ═══ */}
      <div style={{
        position: "absolute",
        left: 36,
        top: "24%",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0) rotate(-4deg)" : "translateY(20px) rotate(-4deg)",
        transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s",
        zIndex: 5,
      }}>
        <div style={{
          padding: "12px 16px",
          background: "linear-gradient(135deg, rgba(73,69,255,0.95), rgba(108,105,255,0.85))",
          borderRadius: 14,
          boxShadow: "0 18px 40px rgba(73,69,255,0.4), 0 4px 12px rgba(0,0,0,0.2)",
          color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          minWidth: 140,
          border: "1px solid rgba(255,255,255,0.18)",
        }}>
          <div style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            opacity: 0.85,
          }}>Position</div>
          <div style={{
            fontSize: 32,
            fontWeight: 800,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginTop: 2,
          }}>#1</div>
          <div style={{
            fontSize: 10,
            opacity: 0.85,
            marginTop: 4,
            fontWeight: 500,
          }}>of 2,400 results</div>
        </div>
      </div>

      {/* ═══ Floating "+312% traffic" pill — peeking right ═══ */}
      <div style={{
        position: "absolute",
        right: 36,
        top: "60%",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0) rotate(5deg)" : "translateY(-20px) rotate(5deg)",
        transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.55s",
        zIndex: 5,
      }}>
        <div style={{
          padding: "11px 14px",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 12,
          boxShadow: "0 18px 40px rgba(0,0,0,0.3)",
          color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          minWidth: 130,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.65)",
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#34D399",
              boxShadow: "0 0 8px rgba(52,211,153,0.8)",
            }} />
            Traffic
          </div>
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: "-0.02em",
            color: "#34D399",
            marginTop: 4,
            lineHeight: 1,
          }}>+312%</div>
          <div style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.6)",
            marginTop: 4,
          }}>since launch</div>
        </div>
      </div>

      {/* ═══ CENTER PHONE — Search Results ═══ */}
      <div style={{
        position: "relative",
        zIndex: 10,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s",
      }}>
        <SearchPhone mounted={mounted} />
      </div>
    </div>
  );
}

function SearchPhone({ mounted }: { mounted: boolean }) {
  return (
    <div style={{
      width: 232,
      height: 470,
      position: "relative",
      filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5)) drop-shadow(0 12px 24px rgba(0,0,0,0.3))",
    }}>
      {/* Outer bezel */}
      <div style={{
        position: "absolute",
        inset: 0,
        borderRadius: 38,
        background: "linear-gradient(155deg, #2a2a2e, #0e0e10)",
        padding: 4,
      }}>
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: 34,
          background: "#000",
          padding: 3,
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Screen — light app */}
          <div style={{
            width: "100%",
            height: "100%",
            borderRadius: 31,
            background: "#F7F8FA",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Status bar */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 18px",
              fontSize: 9,
              fontWeight: 600,
              color: "#0a182b",
              fontFamily: "'DM Sans', sans-serif",
              zIndex: 5,
            }}>
              <span>9:41</span>
              <span style={{
                display: "inline-block",
                width: 14,
                height: 6,
                border: "1px solid rgba(10,24,43,0.4)",
                borderRadius: 1.5,
                position: "relative",
              }}>
                <span style={{
                  position: "absolute",
                  inset: 1,
                  background: "#0a182b",
                  borderRadius: 0.5,
                }} />
              </span>
            </div>
            <div style={{
              position: "absolute",
              top: 7,
              left: "50%",
              transform: "translateX(-50%)",
              width: 70,
              height: 16,
              background: "#000",
              borderRadius: 10,
              zIndex: 6,
            }} />

            {/* Search bar */}
            <div style={{
              position: "absolute",
              top: 36,
              left: 16,
              right: 16,
              padding: "10px 12px",
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}>
              <span style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: "1.5px solid #4945FF",
                position: "relative",
              }}>
                <span style={{
                  position: "absolute",
                  bottom: -3,
                  right: -3,
                  width: 5,
                  height: 1.5,
                  background: "#4945FF",
                  transform: "rotate(45deg)",
                  borderRadius: 1,
                }} />
              </span>
              <span style={{
                fontSize: 11,
                color: "#0a182b",
                fontWeight: 500,
                flex: 1,
              }}>best pizza near me</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>×</span>
            </div>

            {/* Filters row */}
            <div style={{
              position: "absolute",
              top: 76,
              left: 16,
              right: 16,
              display: "flex",
              gap: 6,
              overflow: "hidden",
            }}>
              {[
                { label: "Open now", active: true },
                { label: "Top rated", active: false },
                { label: "Delivery", active: false },
                { label: "$$", active: false },
              ].map((f) => (
                <span key={f.label} style={{
                  padding: "5px 10px",
                  fontSize: 9,
                  fontWeight: 600,
                  borderRadius: 50,
                  background: f.active ? "#0a182b" : "#fff",
                  color: f.active ? "#fff" : "#0a182b",
                  border: f.active ? "none" : "1px solid #E5E7EB",
                  whiteSpace: "nowrap",
                }}>{f.label}</span>
              ))}
            </div>

            {/* Results header */}
            <div style={{
              position: "absolute",
              top: 108,
              left: 16,
              right: 16,
              fontSize: 9,
              color: "#6B7280",
              fontWeight: 500,
            }}>2,400 results · Sorted by relevance</div>

            {/* ═══ #1 result — Joe's Pizza (Delt customer) ═══ */}
            <div style={{
              position: "absolute",
              top: 130,
              left: 12,
              right: 12,
              padding: 11,
              background: "#fff",
              border: "1.5px solid #4945FF",
              borderRadius: 14,
              boxShadow: "0 12px 28px rgba(73,69,255,0.18), 0 0 0 4px rgba(73,69,255,0.08)",
              animation: mounted ? "domainPulse 2.4s ease-in-out infinite" : "none",
            }}>
              {/* Top match pill */}
              <div style={{
                position: "absolute",
                top: -8,
                right: 12,
                padding: "3px 9px",
                background: "linear-gradient(135deg, #4945FF, #6C69FF)",
                color: "#fff",
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.1em",
                borderRadius: 50,
                boxShadow: "0 4px 10px rgba(73,69,255,0.4)",
              }}>★ TOP MATCH</div>

              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                {/* Logo */}
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #c43a18, #7a1f0c)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>J</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#0a182b",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>Joe's Pizza</span>
                    <span style={{
                      fontSize: 8,
                      padding: "1px 5px",
                      background: "#EFEEFF",
                      color: "#4945FF",
                      borderRadius: 3,
                      fontWeight: 700,
                    }}>VERIFIED</span>
                  </div>
                  <div style={{
                    fontSize: 9,
                    color: "#4945FF",
                    fontWeight: 600,
                    marginTop: 2,
                  }}>joespizza.com</div>
                  <div style={{
                    fontSize: 9,
                    color: "#6B7280",
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}>Wood-fired pizza · Midtown · Fresh dough daily</div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 6,
                    fontSize: 9,
                  }}>
                    <span style={{ color: "#F59E0B", fontWeight: 700 }}>★ 4.9</span>
                    <span style={{ color: "#9CA3AF" }}>2,400 reviews</span>
                    <span style={{ color: "#10B981", fontWeight: 600 }}>● Open</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ #2-4 results — competitors (muted) ═══ */}
            {[
              { rank: "2", name: "Tony's Slice Shop", url: "tonys-slice.wixsite.com", rating: "4.2", reviews: "184" },
              { rank: "3", name: "Marco's Pizzeria", url: "marcospizza.squarespace.com", rating: "4.0", reviews: "97" },
              { rank: "4", name: "Pizza Express NYC", url: "pizzaexpress.business.site", rating: "3.8", reviews: "62" },
            ].map((r, i) => (
              <div key={r.rank} style={{
                position: "absolute",
                top: 234 + i * 52,
                left: 16,
                right: 16,
                padding: "10px 12px",
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 11,
                opacity: 0.55,
                filter: "saturate(0.4)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: "#E5E7EB",
                    color: "#6B7280",
                    fontSize: 8,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>{r.rank}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#0a182b",
                    }}>{r.name}</div>
                    <div style={{
                      fontSize: 8,
                      color: "#9CA3AF",
                      marginTop: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>{r.url}</div>
                    <div style={{
                      fontSize: 8,
                      color: "#6B7280",
                      marginTop: 3,
                    }}>★ {r.rating} · {r.reviews} reviews</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes domainPulse {
          0%, 100% { box-shadow: 0 12px 28px rgba(73,69,255,0.18), 0 0 0 4px rgba(73,69,255,0.08); }
          50% { box-shadow: 0 12px 28px rgba(73,69,255,0.28), 0 0 0 6px rgba(73,69,255,0.14); }
        }
      `}</style>
    </div>
  );
}
