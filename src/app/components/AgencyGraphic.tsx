import { useState, useEffect } from "react";

export function AgencyGraphic() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 32px",
      boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 600,
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 24,
      }}>
        {/* BEFORE */}
        <div style={{
          width: 180,
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
          width: 320,
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
                      background: "#1a1a1a",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <div style={{
                        width: "100%",
                        height: 62,
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
                          {/* Char spots on crust */}
                          <div style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            background: "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.25) 0%, transparent 8%), radial-gradient(circle at 80% 75%, rgba(0,0,0,0.3) 0%, transparent 7%), radial-gradient(circle at 70% 15%, rgba(0,0,0,0.2) 0%, transparent 5%)",
                            pointerEvents: "none",
                          }} />
                          {/* Toppings */}
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
                          {/* Shine highlight */}
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
                        {/* Vignette */}
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
                          pointerEvents: "none",
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
