import { useState, useEffect } from "react";

/* ════════════════════════════════════════════════════════════════
   AGENCY GRAPHIC — premium "before → after" composition.
   Floating glass frame, refined restaurant mockup, gradient connector.
   ════════════════════════════════════════════════════════════════ */
export function AgencyGraphic() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px 24px",
      boxSizing: "border-box",
      position: "relative",
    }}>
      {/* Ambient glow behind the AFTER card */}
      <div style={{
        position: "absolute",
        right: "12%",
        top: "50%",
        transform: "translateY(-50%)",
        width: 320,
        height: 320,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(73,69,255,0.18) 0%, rgba(73,69,255,0) 70%)",
        opacity: revealed ? 1 : 0,
        transition: "opacity 1.2s ease",
        pointerEvents: "none",
        filter: "blur(8px)",
      }} />

      <div style={{
        width: "100%",
        maxWidth: 580,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}>
        {/* ───────── BEFORE ───────── */}
        <div style={{
          width: 142,
          opacity: revealed ? 0.32 : 0.85,
          transition: "all 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: revealed ? "scale(0.9) rotate(-2deg)" : "scale(1) rotate(0deg)",
          flexShrink: 0,
          filter: revealed ? "saturate(0.7)" : "saturate(1)",
        }}>
          <div style={{
            background: "#f1efe6",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}>
            <div style={{
              background: "#dad7cd",
              padding: "6px 9px",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#bfbcb1" }} />
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#bfbcb1" }} />
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#bfbcb1" }} />
              <div style={{
                marginLeft: 6,
                background: "#cfccc1",
                borderRadius: 2,
                padding: "2px 6px",
                fontSize: 5.5,
                color: "#807c70",
                fontFamily: "monospace",
              }}>mysite.wixsite.com/joe-pizza</div>
            </div>
            <div style={{ padding: 11 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#3a3a3a",
                fontFamily: "Times New Roman, serif",
                textAlign: "center",
                marginBottom: 6,
              }}>Joe's Pizza Place!!!</div>
              <div style={{
                width: "100%",
                height: 44,
                background: "linear-gradient(135deg, #8B0000, #FF4500)",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 6,
                border: "2px dashed yellow",
              }}>
                <span style={{
                  color: "yellow",
                  fontSize: 7.5,
                  fontFamily: "Comic Sans MS, cursive",
                  fontWeight: 700,
                  textShadow: "1px 1px 0 #000",
                }}>🍕 BEST PIZZA IN TOWN!! 🍕</span>
              </div>
              <div style={{
                fontSize: 6,
                color: "#666",
                lineHeight: 1.5,
                fontFamily: "Times New Roman, serif",
                marginBottom: 6,
              }}>
                Welcome to our resturant we have been serving pizza since 2005. Call us for orders at 555-0123.
              </div>
              <div style={{
                background: "#cc0000",
                color: "white",
                textAlign: "center",
                padding: "3px 0",
                fontSize: 6.5,
                fontWeight: 700,
                borderRadius: 1,
                fontFamily: "Arial, sans-serif",
              }}>⚡ CLICK HERE TO ORDER ⚡</div>
              <div style={{
                marginTop: 6,
                fontSize: 5,
                color: "#aaa",
                textAlign: "center",
              }}>© 2019 — Powered by Wix.com</div>
            </div>
          </div>
          <div style={{
            textAlign: "center",
            marginTop: 14,
            fontSize: 9,
            color: "rgba(255,255,255,0.32)",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
          }}>Before</div>
        </div>

        {/* ───────── Animated connector ───────── */}
        <div style={{
          alignSelf: "center",
          flexShrink: 0,
          marginTop: -28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}>
          <div style={{
            width: 56,
            height: 1,
            background: revealed
              ? "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(73,69,255,0.7), rgba(108,105,255,0.9))"
              : "rgba(255,255,255,0.04)",
            transition: "background 1s ease 0.5s",
          }} />
          <div style={{
            fontSize: 14,
            color: revealed ? "#6C69FF" : "rgba(255,255,255,0.1)",
            transition: "color 1s ease 0.5s",
            fontWeight: 700,
            transform: "translateY(-9px)",
          }}>→</div>
        </div>

        {/* ───────── AFTER (premium glass frame) ───────── */}
        <div style={{
          width: 290,
          opacity: revealed ? 1 : 0.3,
          transition: "all 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: revealed ? "scale(1) rotate(0deg)" : "scale(0.96) rotate(1deg)",
          flexShrink: 0,
          position: "relative",
        }}>
          <div style={{
            position: "relative",
            background: "#0F0F12",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: revealed
              ? "0 40px 100px rgba(73,69,255,0.22), 0 14px 36px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)"
              : "0 8px 24px rgba(0,0,0,0.3)",
            transition: "box-shadow 1.4s ease",
          }}>
            {/* Browser chrome */}
            <div style={{
              background: "linear-gradient(180deg, #1c1c20 0%, #15151a 100%)",
              padding: "9px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#28c840" }} />
              <div style={{
                marginLeft: 14,
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 5,
                padding: "4px 10px",
                fontSize: 9,
                color: "rgba(255,255,255,0.55)",
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                display: "flex",
                alignItems: "center",
                gap: 5,
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <span style={{ color: "#28c840", fontSize: 8 }}>🔒</span>
                joespizza.com
              </div>
            </div>

            {/* Hero */}
            <div style={{
              width: "100%",
              background: "linear-gradient(180deg, #1A1308 0%, #2C1B0B 45%, #100A05 100%)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              padding: "10px 0 16px",
            }}>
              {/* Soft warm glow */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at 50% 50%, rgba(255,160,80,0.18), transparent 70%)",
              }} />
              {/* Top-bar nav */}
              <div style={{
                position: "relative",
                display: "flex",
                justifyContent: "space-between",
                padding: "0 18px 12px",
                alignItems: "center",
                zIndex: 2,
              }}>
                <span style={{
                  fontSize: 7,
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>Joe's Pizza</span>
                <div style={{ display: "flex", gap: 12 }}>
                  {["Menu", "Reserve", "Order", "About"].map((n, i) => (
                    <span key={i} style={{
                      fontSize: 7,
                      color: "rgba(255,255,255,0.5)",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                    }}>{n}</span>
                  ))}
                </div>
              </div>
              {/* Hero content */}
              <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{
                  fontSize: 7,
                  color: "rgba(255,200,140,0.6)",
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  fontWeight: 600,
                }}>Est. 2005 · Midtown</div>
                <div style={{
                  fontSize: 28,
                  fontWeight: 400,
                  color: "#fff",
                  fontFamily: "'Playfair Display', 'Instrument Serif', Georgia, serif",
                  letterSpacing: "-0.015em",
                  lineHeight: 1.05,
                  fontStyle: "italic",
                }}>Wood-Fired Pizza</div>
                <div style={{
                  fontSize: 9.5,
                  color: "rgba(255,255,255,0.5)",
                  marginTop: 8,
                  letterSpacing: "0.02em",
                }}>Handmade dough · San Marzano tomatoes · Fresh mozzarella</div>
                <div style={{
                  marginTop: 14,
                  display: "inline-flex",
                  gap: 8,
                }}>
                  <div style={{
                    background: "#fff",
                    color: "#111",
                    fontSize: 7.5,
                    fontWeight: 700,
                    padding: "6px 16px",
                    borderRadius: 16,
                    boxShadow: "0 6px 16px rgba(255,255,255,0.18)",
                  }}>Order Online</div>
                  <div style={{
                    background: "transparent",
                    color: "rgba(255,255,255,0.75)",
                    fontSize: 7.5,
                    fontWeight: 600,
                    padding: "6px 16px",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}>Reserve a Table</div>
                </div>
              </div>
            </div>

            {/* Featured row */}
            <div style={{ padding: "16px 20px 6px" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 11,
              }}>
                <span style={{
                  fontSize: 8,
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>Featured</span>
                <span style={{
                  fontSize: 7.5,
                  color: "rgba(255,255,255,0.35)",
                }}>View full menu →</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  {
                    name: "Margherita",
                    price: "$14",
                    desc: "Classic simplicity",
                    crust: "radial-gradient(ellipse at 50% 55%, #F4C77E 0%, #D9994A 35%, #8A5A24 70%, #4A2E0E 100%)",
                    toppings: [
                      { t: 30, l: 22, c: "#E54444", size: 10 },
                      { t: 45, l: 62, c: "#E54444", size: 12 },
                      { t: 65, l: 30, c: "#E54444", size: 9 },
                      { t: 55, l: 75, c: "#E54444", size: 8 },
                      { t: 40, l: 45, c: "#FFF8E1", size: 7 },
                      { t: 68, l: 58, c: "#FFF8E1", size: 8 },
                      { t: 25, l: 50, c: "#65A944", size: 5 },
                      { t: 72, l: 40, c: "#65A944", size: 4 },
                    ],
                  },
                  {
                    name: "Truffle Bianca",
                    price: "$22",
                    desc: "Black truffle & fontina",
                    crust: "radial-gradient(ellipse at 50% 50%, #F9EBC7 0%, #E0BE80 40%, #8A5A24 75%, #3E2112 100%)",
                    toppings: [
                      { t: 35, l: 28, c: "#FFFEF6", size: 14 },
                      { t: 52, l: 58, c: "#FFFEF6", size: 15 },
                      { t: 30, l: 62, c: "#FFFEF6", size: 10 },
                      { t: 65, l: 35, c: "#FFFEF6", size: 9 },
                      { t: 42, l: 48, c: "#2A1810", size: 4 },
                      { t: 55, l: 70, c: "#2A1810", size: 3 },
                      { t: 62, l: 50, c: "#2A1810", size: 4 },
                      { t: 38, l: 36, c: "#2A1810", size: 3 },
                    ],
                  },
                  {
                    name: "Diavola",
                    price: "$17",
                    desc: "Calabrian chili & honey",
                    crust: "radial-gradient(ellipse at 50% 50%, #EFB86A 0%, #C57934 40%, #7A3A12 75%, #3E1906 100%)",
                    toppings: [
                      { t: 30, l: 32, c: "#D62828", size: 7 },
                      { t: 28, l: 56, c: "#D62828", size: 6 },
                      { t: 48, l: 22, c: "#D62828", size: 7 },
                      { t: 58, l: 62, c: "#D62828", size: 8 },
                      { t: 70, l: 42, c: "#D62828", size: 6 },
                      { t: 40, l: 70, c: "#D62828", size: 6 },
                      { t: 55, l: 46, c: "#FFD670", size: 5 },
                      { t: 35, l: 44, c: "#FFD670", size: 4 },
                    ],
                  },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    flex: 1,
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "linear-gradient(180deg, #18181C 0%, #131318 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
                  }}>
                    <div style={{
                      width: "100%",
                      height: 64,
                      background: "linear-gradient(180deg, #2a1c10 0%, #120a04 100%)",
                      position: "relative",
                      overflow: "hidden",
                    }}>
                      {/* Pizza disc */}
                      <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: item.crust,
                        boxShadow: "0 3px 10px rgba(0,0,0,0.6), inset 0 -4px 8px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,230,180,0.25)",
                      }}>
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "50%",
                          background: "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.25) 0%, transparent 8%), radial-gradient(circle at 80% 75%, rgba(0,0,0,0.3) 0%, transparent 7%), radial-gradient(circle at 70% 15%, rgba(0,0,0,0.2) 0%, transparent 5%)",
                          pointerEvents: "none",
                        }} />
                        {item.toppings.map((top, ti) => (
                          <div key={ti} style={{
                            position: "absolute",
                            top: `${top.t}%`,
                            left: `${top.l}%`,
                            width: top.size,
                            height: top.size,
                            borderRadius: "50%",
                            background: top.c,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.25)",
                            transform: "translate(-50%, -50%)",
                          }} />
                        ))}
                        <div style={{
                          position: "absolute",
                          top: "15%",
                          left: "25%",
                          width: "40%",
                          height: "25%",
                          borderRadius: "50%",
                          background: "radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, transparent 70%)",
                          filter: "blur(2px)",
                          pointerEvents: "none",
                        }} />
                      </div>
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)",
                        pointerEvents: "none",
                      }} />
                    </div>
                    <div style={{ padding: "7px 9px 9px" }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 4,
                      }}>
                        <span style={{ fontSize: 7.5, color: "#fff", fontWeight: 700, letterSpacing: "-0.005em", lineHeight: 1.15 }}>{item.name}</span>
                        <span style={{ fontSize: 7, color: "#C8B07F", fontWeight: 600, flexShrink: 0 }}>{item.price}</span>
                      </div>
                      <div style={{ fontSize: 6.5, color: "rgba(255,255,255,0.4)", marginTop: 3, letterSpacing: "0.01em", lineHeight: 1.3 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews bar */}
            <div style={{
              margin: "10px 18px 14px",
              padding: "8px 12px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", gap: 1 }}>
                  {["★", "★", "★", "★", "★"].map((s, i) => (
                    <span key={i} style={{ fontSize: 8, color: "#F59E0B" }}>{s}</span>
                  ))}
                </div>
                <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>4.9 · 2,400+ reviews</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.04)" }}>Google</span>
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", padding: "3px 8px", borderRadius: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.04)" }}>Yelp</span>
              </div>
            </div>
          </div>

          {/* AFTER label */}
          <div style={{
            textAlign: "center",
            marginTop: 9,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
          }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>After</span>
            <span style={{ color: "rgba(255,255,255,0.18)", margin: "0 8px" }}>—</span>
            <span style={{
              background: "linear-gradient(90deg, #4945FF, #6C69FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Built with Delt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
