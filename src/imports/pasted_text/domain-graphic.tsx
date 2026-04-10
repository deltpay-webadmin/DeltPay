import { useState, useEffect } from "react";

export default function DomainGraphic() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a1225",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap" rel="stylesheet" />

      <div style={{
        width: 560,
        height: 420,
        background: "linear-gradient(145deg, #070d1a 0%, #0c1629 40%, #0a1225 100%)",
        borderRadius: 22,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: 440,
          background: "#fff",
          borderRadius: 14,
          padding: 24,
          boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
          transform: loaded ? "translateY(0)" : "translateY(12px)",
          opacity: loaded ? 1 : 0,
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}>
          {/* Search bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            background: "#f8f9fa",
            borderRadius: 24,
            border: "1px solid #dfe1e5",
            marginBottom: 24,
          }}>
            <span style={{ fontSize: 14, color: "#999" }}>🔍</span>
            <span style={{
              fontSize: 13,
              color: "#333",
              fontWeight: 500,
            }}>best pizza near me</span>
          </div>

          {/* Result 1 - The merchant (winning) */}
          <div style={{
            marginBottom: 22,
            padding: 14,
            borderRadius: 10,
            background: loaded ? "rgba(73,69,255,0.04)" : "transparent",
            border: loaded ? "1px solid rgba(73,69,255,0.12)" : "1px solid transparent",
            transition: "all 0.8s ease 0.8s",
            position: "relative",
          }}>
            {loaded && (
              <div style={{
                position: "absolute",
                top: -8,
                right: 12,
                background: "#4945FF",
                color: "#fff",
                fontSize: 8,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 10,
                letterSpacing: "0.04em",
              }}>YOUR SITE</div>
            )}
            <div style={{
              fontSize: 11,
              color: "#28c840",
              fontFamily: "monospace",
              marginBottom: 3,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}>
              <span style={{ fontSize: 9 }}>🔒</span>
              joespizza.com
            </div>
            <div style={{
              fontSize: 16,
              color: "#1a0dab",
              fontWeight: 600,
              marginBottom: 4,
              lineHeight: 1.3,
            }}>Joe's Pizza — Wood-Fired Pizza & Italian Kitchen</div>
            <div style={{
              fontSize: 11,
              color: "#545454",
              lineHeight: 1.5,
            }}>Award-winning wood-fired pizza in Midtown. Fresh ingredients, craft cocktails. Order online for pickup or delivery. ★★★★★ 4.9</div>
          </div>

          {/* Result 2 - Competitor on subdomain */}
          <div style={{ marginBottom: 18, padding: "0 14px", opacity: 0.5 }}>
            <div style={{
              fontSize: 11,
              color: "#666",
              fontFamily: "monospace",
              marginBottom: 3,
            }}>tonys-slice.square.site</div>
            <div style={{
              fontSize: 14,
              color: "#1a0dab",
              fontWeight: 500,
              marginBottom: 3,
            }}>Tony's Slice Shop</div>
            <div style={{
              fontSize: 10.5,
              color: "#545454",
              lineHeight: 1.5,
            }}>Pizza restaurant. View menu and hours...</div>
          </div>

          {/* Result 3 - Another competitor */}
          <div style={{ padding: "0 14px", opacity: 0.35 }}>
            <div style={{
              fontSize: 11,
              color: "#666",
              fontFamily: "monospace",
              marginBottom: 3,
            }}>marcopizzeria.wixsite.com/home</div>
            <div style={{
              fontSize: 14,
              color: "#1a0dab",
              fontWeight: 500,
              marginBottom: 3,
            }}>Marco's Pizzeria — Home</div>
            <div style={{
              fontSize: 10.5,
              color: "#545454",
              lineHeight: 1.5,
            }}>Welcome to our website. We serve pizza and...</div>
          </div>
        </div>
      </div>
    </div>
  );
}