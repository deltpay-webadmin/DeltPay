import { useState, useEffect } from "react";

export function AgencyGraphic() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      minHeight: 420,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 780,
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 32,
      }}>
        {/* BEFORE */}
        <div style={{
          width: 220,
          opacity: revealed ? 0.35 : 0.9,
          transition: "all 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: revealed ? "scale(0.92)" : "scale(1)",
          flexShrink: 0,
        }}>
          <div style={{
            background: "#f5f5f0",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}>
            <div style={{
              background: "#e8e8e3",
              padding: "7px 10px",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ccc" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ccc" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ccc" }} />
              <div style={{
                marginLeft: 6,
                background: "#ddd",
                borderRadius: 3,
                padding: "2px 7px",
                fontSize: 6.5,
                color: "#999",
                fontFamily: "monospace",
              }}>⚠ mysite.wixsite.com/joe-pizza</div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#333",
                fontFamily: "Times New Roman, serif",
                textAlign: "center",
                marginBottom: 6,
              }}>Joe's Pizza Place!!!</div>
              <div style={{
                width: "100%",
                height: 50,
                background: "linear-gradient(135deg, #8B0000, #FF4500)",
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 6,
                border: "2px dashed yellow",
              }}>
                <span style={{
                  color: "yellow",
                  fontSize: 8,
                  fontFamily: "Comic Sans MS, cursive",
                  fontWeight: 700,
                  textShadow: "1px 1px 0 #000",
                }}>🍕 BEST PIZZA IN TOWN!! 🍕</span>
              </div>
              <div style={{
                fontSize: 6.5,
                color: "#666",
                lineHeight: 1.5,
                fontFamily: "Times New Roman, serif",
                marginBottom: 6,
              }}>
                Welcome to our resturant we have been serving pizza since 2005. Call us for orders at 555-0123.
              </div>
              <div style={{
                background: "red",
                color: "white",
                textAlign: "center",
                padding: "4px 0",
                fontSize: 7,
                fontWeight: 700,
                borderRadius: 2,
                fontFamily: "Arial, sans-serif",
              }}>⚡ CLICK HERE TO ORDER ⚡</div>
              <div style={{
                marginTop: 6,
                fontSize: 5.5,
                color: "#aaa",
                textAlign: "center",
              }}>© 2019 — Powered by Wix.com</div>
            </div>
          </div>
          <div style={{
            textAlign: "center",
            marginTop: 10,
            fontSize: 9,
            color: "rgba(255,255,255,0.25)",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>Before</div>
        </div>

        {/* Arrow */}
        <div style={{
          alignSelf: "center",
          fontSize: 24,
          color: revealed ? "rgba(73,69,255,0.7)" : "rgba(255,255,255,0.08)",
          transition: "all 1s ease 0.5s",
          opacity: revealed ? 1 : 0,
          flexShrink: 0,
          marginTop: -20,
        }}>→</div>

        {/* AFTER */}
        <div style={{
          width: 340,
          opacity: revealed ? 1 : 0.3,
          transition: "all 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: revealed ? "scale(1)" : "scale(0.96)",
          flexShrink: 0,
        }}>
          <div style={{
            background: "#111111",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: revealed
              ? "0 20px 60px rgba(73,69,255,0.18), 0 8px 24px rgba(0,0,0,0.5)"
              : "0 4px 16px rgba(0,0,0,0.3)",
            transition: "box-shadow 1.4s ease",
          }}>
            <div style={{
              background: "#1a1a1a",
              padding: "9px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#28c840" }} />
              <div style={{
                marginLeft: 12,
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 6,
                padding: "4px 12px",
                fontSize: 9,
                color: "rgba(255,255,255,0.5)",
                fontFamily: "'JetBrains Mono', monospace",
                display: "flex",
                alignItems: "center",
                gap: 5,
                justifyContent: "center",
              }}>
                <span style={{ color: "#28c840", fontSize: 8 }}>🔒</span>
                joespizza.com
              </div>
            </div>

            <div style={{ background: "#111111" }}>
              <div style={{
                width: "100%",
                height: 130,
                background: "linear-gradient(180deg, #1a1208 0%, #2a1a0a 40%, #111111 100%)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(ellipse at 50% 40%, rgba(255,140,50,0.12), transparent 70%)",
                }} />
                <div style={{
                  position: "absolute",
                  top: 8,
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 20px",
                  alignItems: "center",
                }}>
                  <span style={{
                    fontSize: 7,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}>Joe's Pizza</span>
                  <div style={{ display: "flex", gap: 12 }}>
                    {["Menu", "Reserve", "Order", "About"].map((n, i) => (
                      <span key={i} style={{
                        fontSize: 7,
                        color: "rgba(255,255,255,0.35)",
                        fontWeight: 500,
                      }}>{n}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "center", position: "relative", zIndex: 1, marginTop: 10 }}>
                  <div style={{
                    fontSize: 7,
                    color: "rgba(255,200,120,0.5)",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}>Est. 2005 · Midtown</div>
                  <div style={{
                    fontSize: 26,
                    fontWeight: 400,
                    color: "#fff",
                    fontFamily: "'Playfair Display', serif",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.1,
                  }}>Wood-Fired Pizza</div>
                  <div style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.4)",
                    marginTop: 8,
                  }}>Handmade dough · San Marzano tomatoes · Fresh mozzarella</div>
                  <div style={{
                    marginTop: 14,
                    display: "inline-flex",
                    gap: 10,
                  }}>
                    <div style={{
                      background: "#fff",
                      color: "#111",
                      fontSize: 7.5,
                      fontWeight: 700,
                      padding: "6px 18px",
                      borderRadius: 20,
                    }}>Order Online</div>
                    <div style={{
                      background: "transparent",
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 7.5,
                      fontWeight: 500,
                      padding: "6px 18px",
                      borderRadius: 20,
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}>Reserve a Table</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: "16px 20px 6px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}>
                  <span style={{
                    fontSize: 8,
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}>Featured</span>
                  <span style={{
                    fontSize: 7.5,
                    color: "rgba(255,255,255,0.25)",
                  }}>View full menu →</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { name: "Margherita", price: "$14", desc: "Classic simplicity", gradient: "linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD853F 100%)" },
                    { name: "Truffle Bianca", price: "$22", desc: "Black truffle & fontina", gradient: "linear-gradient(135deg, #2F1B14 0%, #4A3228 50%, #3E2723 100%)" },
                    { name: "Diavola", price: "$17", desc: "Calabrian chili & honey", gradient: "linear-gradient(135deg, #5D1A0B 0%, #8B2500 50%, #A0522D 100%)" },
                  ].map((item, idx) => (
                    <div key={idx} style={{
                      flex: 1,
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "#1a1a1a",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <div style={{
                        width: "100%",
                        height: 48,
                        background: item.gradient,
                        position: "relative",
                      }}>
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          background: "radial-gradient(circle at 30% 60%, rgba(255,255,255,0.08), transparent 60%)",
                        }} />
                      </div>
                      <div style={{ padding: "8px 10px 10px" }}>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}>
                          <span style={{ fontSize: 8, color: "#fff", fontWeight: 600 }}>{item.name}</span>
                          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>{item.price}</span>
                        </div>
                        <div style={{ fontSize: 6.5, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                margin: "12px 20px 16px",
                padding: "9px 14px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.04)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ display: "flex" }}>
                    {["★", "★", "★", "★", "★"].map((s, i) => (
                      <span key={i} style={{ fontSize: 8, color: "#F59E0B" }}>{s}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>4.9 · 2,400+ reviews</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)" }}>Google</span>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)" }}>Yelp</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{
            textAlign: "center",
            marginTop: 10,
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            <span style={{ color: "rgba(255,255,255,0.35)" }}>After</span>
            <span style={{ color: "rgba(255,255,255,0.15)", margin: "0 6px" }}>—</span>
            <span style={{ color: "#4945FF" }}>Built with Delt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
