import { useState, useEffect } from "react";

/* ════════════════════════════════════════════════════════════════
   AGENCY GRAPHIC — Toast-inspired curated portfolio peek.
   Center phone showing a polished restaurant site, with two
   laptop/site cards peeking from behind for layered depth.
   ════════════════════════════════════════════════════════════════ */
export function AgencyGraphic() {
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
      padding: "20px 24px 56px",
      boxSizing: "border-box",
      position: "relative",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Ambient brand glow behind composition */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 520,
        height: 360,
        background: "radial-gradient(closest-side, rgba(73,69,255,0.18), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ═══ LEFT LAPTOP — Salon ═══ */}
      <div style={{
        position: "absolute",
        left: 16,
        top: "48%",
        transform: `translateY(-50%) rotate(-7deg) ${mounted ? "translateX(0)" : "translateX(-30px)"}`,
        opacity: mounted ? 1 : 0,
        transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s",
        width: 230,
      }}>
        <SiteCard
          accent="#F472B6"
          brand="MAEVE"
          tagline="Salon · West Loop"
          headline={<>Hair, sculpted with <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 500 }}>intention.</em></>}
          imageBg="linear-gradient(135deg, #1a0d1a, #3a1f2e 40%, #5a2a3f)"
          imageOverlay="radial-gradient(ellipse at 30% 30%, rgba(244,114,182,0.25), transparent 60%)"
          ctaLabel="Book"
          rating="4.9"
          reviews="312"
        />
      </div>

      {/* ═══ RIGHT LAPTOP — Boutique ═══ */}
      <div style={{
        position: "absolute",
        right: 16,
        top: "48%",
        transform: `translateY(-50%) rotate(7deg) ${mounted ? "translateX(0)" : "translateX(30px)"}`,
        opacity: mounted ? 1 : 0,
        transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s",
        width: 230,
      }}>
        <SiteCard
          accent="#34D399"
          brand="OAKLEAF"
          tagline="Outdoor Goods · Aspen"
          headline={<>Built for the <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 500 }}>long way home.</em></>}
          imageBg="linear-gradient(135deg, #0a1f17, #16352a 40%, #1f4f3a)"
          imageOverlay="radial-gradient(ellipse at 70% 40%, rgba(52,211,153,0.22), transparent 60%)"
          ctaLabel="Shop"
          rating="4.8"
          reviews="1.2k"
        />
      </div>

      {/* ═══ CENTER PHONE — Restaurant (hero) ═══ */}
      <div style={{
        position: "relative",
        zIndex: 10,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)",
        transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <PhoneMockup />
      </div>

      {/* ═══ Floating "Built with Delt" badge ═══ */}
      <div style={{
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: `translateX(-50%) ${mounted ? "translateY(0)" : "translateY(10px)"}`,
        opacity: mounted ? 1 : 0,
        transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.6s",
        zIndex: 20,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 50,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.85)",
      }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#4945FF",
          boxShadow: "0 0 8px rgba(73,69,255,0.8)",
        }} />
        Every site built with Delt
      </div>
    </div>
  );
}

/* ───── Phone Mockup — Restaurant ───── */
function PhoneMockup() {
  return (
    <div style={{
      width: 210,
      height: 430,
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
        {/* Inner frame */}
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: 34,
          background: "#000",
          padding: 3,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Screen */}
          <div style={{
            width: "100%",
            height: "100%",
            borderRadius: 31,
            background: "linear-gradient(180deg, #1a0a08 0%, #2d1410 30%, #4a2418 70%, #1a0a08 100%)",
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
              color: "rgba(255,255,255,0.95)",
              fontFamily: "'DM Sans', sans-serif",
              zIndex: 5,
            }}>
              <span>9:41</span>
              <span style={{
                display: "inline-block",
                width: 14,
                height: 6,
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: 1.5,
                position: "relative",
              }}>
                <span style={{
                  position: "absolute",
                  inset: 1,
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: 0.5,
                }} />
              </span>
            </div>

            {/* Dynamic island */}
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

            {/* Top nav */}
            <div style={{
              position: "absolute",
              top: 32,
              left: 0, right: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 18px",
              zIndex: 4,
            }}>
              <span style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.18em",
                color: "#fff",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>JOE'S</span>
              <span style={{ display: "flex", gap: 10, fontSize: 8, color: "rgba(255,255,255,0.85)" }}>
                <span>Menu</span>
                <span>Order</span>
                <span>☰</span>
              </span>
            </div>

            {/* Hero copy */}
            <div style={{
              position: "absolute",
              top: 78,
              left: 0, right: 0,
              textAlign: "center",
              padding: "0 16px",
            }}>
              <div style={{
                fontSize: 6.5,
                letterSpacing: "0.2em",
                color: "rgba(255,200,170,0.8)",
                fontWeight: 600,
                marginBottom: 6,
              }}>EST. 2005 · MIDTOWN</div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: 22,
                fontWeight: 500,
                color: "#fff",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}>
                Wood-Fired<br />Pizza
              </div>
              <div style={{
                fontSize: 7,
                color: "rgba(255,220,200,0.7)",
                marginTop: 8,
                lineHeight: 1.5,
              }}>San Marzano tomatoes ·<br />Fresh mozzarella</div>

              <div style={{
                marginTop: 11,
                display: "inline-block",
                padding: "6px 14px",
                background: "#fff",
                color: "#1a0a08",
                fontSize: 8,
                fontWeight: 700,
                borderRadius: 50,
              }}>Order Online</div>
            </div>

            {/* Bottom feature row — peek of menu */}
            <div style={{
              position: "absolute",
              bottom: 16,
              left: 10, right: 10,
              padding: 8,
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}>
                <span style={{
                  fontSize: 7,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: "#fff",
                }}>FEATURED</span>
                <span style={{ fontSize: 6.5, color: "rgba(255,255,255,0.5)" }}>see menu →</span>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {[
                  { name: "Margherita", price: "$14", grad: "radial-gradient(circle at 35% 35%, #f7d27a, #c47842 60%, #5a2a14)" },
                  { name: "Truffle", price: "$22", grad: "radial-gradient(circle at 35% 35%, #efe3c5, #b89968 60%, #4a3a20)" },
                  { name: "Diavola", price: "$17", grad: "radial-gradient(circle at 35% 35%, #ff8855, #c43a18 60%, #4a1410)" },
                ].map((p) => (
                  <div key={p.name} style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 7,
                    padding: 4,
                  }}>
                    <div style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: 5,
                      background: p.grad,
                      marginBottom: 4,
                    }} />
                    <div style={{ fontSize: 6.5, color: "#fff", fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 5.5, color: "rgba(255,255,255,0.55)" }}>{p.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───── Site Card — laptop-style framed mockup ───── */
function SiteCard({
  accent,
  brand,
  tagline,
  headline,
  imageBg,
  imageOverlay,
  ctaLabel,
  rating,
  reviews,
}: {
  accent: string;
  brand: string;
  tagline: string;
  headline: React.ReactNode;
  imageBg: string;
  imageOverlay: string;
  ctaLabel: string;
  rating: string;
  reviews: string;
}) {
  return (
    <div style={{
      width: "100%",
      borderRadius: 14,
      background: "#0c1c33",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 24px 48px rgba(0,0,0,0.4), 0 6px 16px rgba(0,0,0,0.25)",
      overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Top window chrome */}
      <div style={{
        height: 18,
        background: "#0a182b",
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "0 9px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
      </div>

      {/* Image hero */}
      <div style={{
        height: 96,
        background: imageBg,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: imageOverlay }} />
        {/* Top nav inside image */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 6.5,
          color: "rgba(255,255,255,0.85)",
          fontWeight: 600,
          letterSpacing: "0.16em",
        }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>{brand}</span>
          <span>● ● ●</span>
        </div>
        {/* Centered headline */}
        <div style={{
          position: "absolute",
          left: 0, right: 0,
          bottom: 12,
          textAlign: "center",
          padding: "0 12px",
          color: "#fff",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
        }}>{headline}</div>
      </div>

      {/* Bottom row */}
      <div style={{
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{tagline}</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.85)", marginTop: 3, fontWeight: 600 }}>
            <span style={{ color: accent }}>★</span> {rating} <span style={{ color: "rgba(255,255,255,0.4)" }}>· {reviews}</span>
          </div>
        </div>
        <div style={{
          padding: "5px 10px",
          background: accent,
          color: "#0a182b",
          fontSize: 8,
          fontWeight: 800,
          borderRadius: 50,
          letterSpacing: "0.04em",
        }}>{ctaLabel}</div>
      </div>
    </div>
  );
}
