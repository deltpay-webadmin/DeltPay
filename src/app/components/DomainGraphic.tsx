import { useState, useEffect } from "react";

/* ════════════════════════════════════════════════════════════════
   DOMAIN GRAPHIC — premium Google SERP mockup inside a floating
   browser frame. Refined typography, elevated "YOUR SITE" pill,
   ambient glow, faint grid backdrop.
   ════════════════════════════════════════════════════════════════ */
export function DomainGraphic() {
  const [loaded, setLoaded] = useState(false);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 350);
    const t2 = setTimeout(() => setHighlight(true), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "28px 32px",
      boxSizing: "border-box",
      position: "relative",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        left: "18%",
        top: "30%",
        width: 320,
        height: 320,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(73,69,255,0.18) 0%, rgba(73,69,255,0) 70%)",
        opacity: loaded ? 1 : 0,
        transition: "opacity 1.2s ease",
        pointerEvents: "none",
        filter: "blur(8px)",
      }} />
      {/* Faint grid */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        opacity: 0.5,
        maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, #000 30%, transparent 80%)",
        pointerEvents: "none",
      }} />

      {/* Glass frame */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 540,
        transform: loaded ? "translateY(0)" : "translateY(16px)",
        opacity: loaded ? 1 : 0,
        transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {/* Outer glass ring */}
        <div style={{
          position: "absolute",
          inset: -7,
          borderRadius: 18,
          background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.01))",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 50px 110px rgba(0,0,0,0.55), 0 18px 40px rgba(73,69,255,0.16)",
          backdropFilter: "blur(8px)",
        }} />

        <div style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.06)",
        }}>
          {/* Browser chrome */}
          <div style={{
            background: "linear-gradient(180deg, #ECEEF1 0%, #DFE2E6 100%)",
            padding: "10px 14px 0",
            borderBottom: "1px solid #D0D2D5",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F56", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }} />
                <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFBD2E", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }} />
                <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#27C93F", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }} />
              </div>
              <div style={{
                flex: 1,
                display: "flex",
                gap: 4,
                marginTop: 2,
              }}>
                <div style={{
                  padding: "6px 12px",
                  background: "#fff",
                  borderRadius: "8px 8px 0 0",
                  fontSize: 10,
                  color: "#3C4043",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  maxWidth: 220,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  boxShadow: "0 -1px 0 rgba(0,0,0,0.04)",
                }}>
                  <span style={{ fontSize: 9 }}>🔍</span>
                  <span>best pizza near me — Google</span>
                </div>
                <div style={{
                  padding: "6px 10px",
                  fontSize: 10,
                  color: "rgba(60,64,67,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}>
                  <span style={{ fontSize: 8 }}>+</span>
                </div>
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 4px 10px",
            }}>
              <div style={{ display: "flex", gap: 6, color: "#5F6368", fontSize: 12 }}>
                <span>←</span>
                <span>→</span>
                <span>⟳</span>
              </div>
              <div style={{
                flex: 1,
                background: "#fff",
                borderRadius: 20,
                padding: "5px 12px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10.5,
                color: "#3C4043",
                border: "1px solid #DADCE0",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
              }}>
                <span style={{ fontSize: 9, color: "#5F6368" }}>🔒</span>
                <span style={{ fontWeight: 500 }}>google.com</span>
                <span style={{ color: "#5F6368" }}>/search?q=best+pizza+near+me</span>
              </div>
            </div>
          </div>

          {/* Page body */}
          <div style={{ padding: "14px 20px 18px", background: "#fff" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 10,
            }}>
              <div style={{
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: "-0.5px",
                display: "flex",
                fontFamily: "'Product Sans', 'Google Sans', -apple-system, sans-serif",
              }}>
                <span style={{ color: "#4285F4" }}>G</span>
                <span style={{ color: "#EA4335" }}>o</span>
                <span style={{ color: "#FBBC05" }}>o</span>
                <span style={{ color: "#4285F4" }}>g</span>
                <span style={{ color: "#34A853" }}>l</span>
                <span style={{ color: "#EA4335" }}>e</span>
              </div>
              <div style={{
                flex: 1,
                height: 32,
                background: "#fff",
                borderRadius: 20,
                border: "1px solid #DFE1E5",
                boxShadow: "0 1px 6px rgba(32,33,36,0.08)",
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                gap: 10,
                fontSize: 12,
                color: "#3C4043",
                fontWeight: 400,
              }}>
                <span style={{ fontSize: 12 }}>🔍</span>
                <span style={{ flex: 1 }}>best pizza near me</span>
                <span style={{ color: "#4285F4", fontSize: 11 }}>🎤</span>
                <span style={{ color: "#4285F4", fontSize: 11 }}>📷</span>
              </div>
            </div>

            <div style={{
              display: "flex",
              gap: 22,
              fontSize: 10.5,
              color: "#5F6368",
              paddingBottom: 8,
              borderBottom: "1px solid #EBEBEB",
              marginBottom: 10,
            }}>
              <span style={{ color: "#1A73E8", fontWeight: 500, borderBottom: "2px solid #1A73E8", paddingBottom: 10, marginBottom: -11 }}>All</span>
              <span>Maps</span>
              <span>Images</span>
              <span>News</span>
              <span>Videos</span>
              <span style={{ color: "#9AA0A6" }}>⋮</span>
            </div>

            <div style={{
              fontSize: 9.5,
              color: "#70757A",
              marginBottom: 10,
            }}>About 1,240,000 results (0.38 seconds)</div>

            {/* Featured result — Joe's */}
            <div style={{
              marginBottom: 14,
              padding: 12,
              borderRadius: 12,
              background: highlight
                ? "linear-gradient(135deg, rgba(73,69,255,0.07) 0%, rgba(108,105,255,0.025) 100%)"
                : "transparent",
              border: highlight ? "1px solid rgba(73,69,255,0.22)" : "1px solid transparent",
              boxShadow: highlight ? "0 8px 24px rgba(73,69,255,0.10)" : "none",
              transition: "all 0.8s ease",
              position: "relative",
            }}>
              {highlight && (
                <div style={{
                  position: "absolute",
                  top: -10,
                  right: 10,
                  background: "linear-gradient(135deg, #4945FF 0%, #6C69FF 100%)",
                  color: "#fff",
                  fontSize: 8.5,
                  fontWeight: 800,
                  padding: "4px 11px",
                  borderRadius: 999,
                  letterSpacing: "0.1em",
                  boxShadow: "0 8px 22px rgba(73,69,255,0.45), 0 0 0 1px rgba(108,105,255,0.55)",
                  textTransform: "uppercase",
                  fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                }}>Your Site</div>
              )}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}>
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #D62828 0%, #9A0000 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: "#fff",
                  fontWeight: 700,
                  flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(214,40,40,0.3), inset 0 1px 1px rgba(255,255,255,0.25)",
                }}>J</div>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <div style={{
                    fontSize: 10.5,
                    color: "#202124",
                    fontWeight: 500,
                  }}>Joe's Pizza</div>
                  <div style={{
                    fontSize: 10,
                    color: "#5F6368",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}>
                    <span>https://www.joespizza.com</span>
                    <span style={{ color: "#70757A" }}>▾</span>
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: 17,
                color: "#1A0DAB",
                fontWeight: 400,
                marginBottom: 5,
                lineHeight: 1.25,
                fontFamily: "'Times', 'Georgia', serif",
                letterSpacing: "-0.1px",
              }}>Joe's Pizza — Wood-Fired Pizza &amp; Italian Kitchen</div>
              <div style={{
                fontSize: 11,
                color: "#4D5156",
                lineHeight: 1.5,
                marginBottom: 8,
              }}>
                <span style={{ color: "#70757A", fontWeight: 500 }}>Nov 12, 2026 —</span>{" "}
                Award-winning wood-fired pizza in Midtown. Fresh ingredients, craft cocktails, and our famous Margherita. Order online for pickup or{" "}
                <span style={{ background: "rgba(255,234,0,0.35)", padding: "0 1px" }}>delivery</span>.
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                color: "#70757A",
                marginBottom: 10,
              }}>
                <span style={{ color: "#F59E0B", letterSpacing: "1px" }}>★★★★★</span>
                <span style={{ color: "#4D5156", fontWeight: 500 }}>Rating: 4.9</span>
                <span>· 2,400 reviews</span>
                <span>· $$</span>
                <span>· Italian</span>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 20px",
              }}>
                {[
                  { t: "Menu", d: "Wood-fired pizzas, pastas" },
                  { t: "Order Online", d: "Pickup or delivery" },
                  { t: "Reservations", d: "Book a table tonight" },
                  { t: "Hours & Location", d: "Open until 11 PM" },
                ].map((sl, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: "#1A0DAB", fontWeight: 400, lineHeight: 1.3 }}>{sl.t}</div>
                    <div style={{ fontSize: 9.5, color: "#70757A", lineHeight: 1.3 }}>{sl.d}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Result 2 — competitor on subdomain */}
            <div style={{ marginBottom: 12, opacity: 0.55 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 3,
              }}>
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#E8EAED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  color: "#70757A",
                }}>T</div>
                <div style={{
                  fontSize: 10,
                  color: "#5F6368",
                }}>tonys-slice.square.site</div>
              </div>
              <div style={{
                fontSize: 14,
                color: "#1A0DAB",
                fontWeight: 400,
                lineHeight: 1.3,
                fontFamily: "'Times', 'Georgia', serif",
                marginBottom: 3,
              }}>Tony's Slice Shop</div>
              <div style={{
                fontSize: 10.5,
                color: "#4D5156",
                lineHeight: 1.5,
              }}>Pizza restaurant. View menu and hours. Family-owned since 2012...</div>
            </div>

            {/* Result 3 */}
            <div style={{ opacity: 0.4 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 3,
              }}>
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#E8EAED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  color: "#70757A",
                }}>M</div>
                <div style={{
                  fontSize: 10,
                  color: "#5F6368",
                }}>marcopizzeria.wixsite.com › home</div>
              </div>
              <div style={{
                fontSize: 14,
                color: "#1A0DAB",
                fontWeight: 400,
                lineHeight: 1.3,
                fontFamily: "'Times', 'Georgia', serif",
                marginBottom: 3,
              }}>Marco's Pizzeria — Home</div>
              <div style={{
                fontSize: 10.5,
                color: "#4D5156",
                lineHeight: 1.5,
              }}>Welcome to our website. We serve pizza and pasta to the community...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
