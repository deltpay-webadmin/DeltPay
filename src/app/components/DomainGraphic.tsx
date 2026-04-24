import { useState, useEffect } from "react";

export function DomainGraphic() {
  const [loaded, setLoaded] = useState(false);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 400);
    const t2 = setTimeout(() => setHighlight(true), 1600);
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
      padding: "20px 28px",
      boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 520,
        borderRadius: 14,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.25)",
        transform: loaded ? "translateY(0)" : "translateY(16px)",
        opacity: loaded ? 1 : 0,
        transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}>
        {/* Browser chrome */}
        <div style={{
          background: "linear-gradient(180deg, #E8EAED 0%, #DFE1E5 100%)",
          padding: "10px 14px 0",
          borderBottom: "1px solid #D0D2D5",
        }}>
          {/* Traffic lights + tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F56" }} />
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFBD2E" }} />
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#27C93F" }} />
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
                maxWidth: 200,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                <span style={{ fontSize: 9 }}>🔍</span>
                <span>best pizza near me - Google</span>
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
          {/* Address bar */}
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
            }}>
              <span style={{ fontSize: 9, color: "#5F6368" }}>🔒</span>
              <span style={{ fontWeight: 500 }}>google.com</span>
              <span style={{ color: "#5F6368" }}>/search?q=best+pizza+near+me</span>
            </div>
          </div>
        </div>

        {/* Google page body */}
        <div style={{ padding: "14px 20px 18px", background: "#fff" }}>
          {/* Google logo + search */}
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

          {/* Result tabs */}
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

          {/* Featured result — Joe's (highlighted) */}
          <div style={{
            marginBottom: 14,
            padding: 11,
            borderRadius: 10,
            background: highlight ? "rgba(73,69,255,0.05)" : "transparent",
            border: highlight ? "1px solid rgba(73,69,255,0.18)" : "1px solid transparent",
            transition: "all 0.8s ease",
            position: "relative",
          }}>
            {highlight && (
              <div style={{
                position: "absolute",
                top: -9,
                right: 10,
                background: "linear-gradient(135deg, #4945FF, #6C69FF)",
                color: "#fff",
                fontSize: 8,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 10,
                letterSpacing: "0.06em",
                boxShadow: "0 4px 12px rgba(73,69,255,0.4)",
              }}>YOUR SITE</div>
            )}
            {/* Breadcrumb row */}
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
                boxShadow: "0 2px 6px rgba(214,40,40,0.3)",
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
            {/* Star rating */}
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
            {/* Sitelinks grid */}
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

          {/* Result 3 — another wix */}
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
  );
}
