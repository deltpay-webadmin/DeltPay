import { useState } from "react";

/*
  This version includes a font toggle so you can preview which serif
  matches your original. Click the small buttons in the top-right to switch.
  Once you pick the right one, remove the toggle and hardcode that font.

  Fonts loaded:
  - Cormorant Garamond (italic)
  - Playfair Display (italic)
  - EB Garamond (italic)
  - Libre Baskerville (italic)
*/

export default function DeltHero() {
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [serifFont, setSerifFont] = useState("Playfair Display");

  const serifOptions = [
    "Playfair Display",
    "Cormorant Garamond",
    "EB Garamond",
    "Libre Baskerville",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;800&family=Cormorant+Garamond:ital,wght@1,400;1,500&family=Playfair+Display:ital,wght@1,400;1,500&family=EB+Garamond:ital,wght@1,400;1,500&family=Libre+Baskerville:ital@1&display=swap');
      `}</style>
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#080c19",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Font toggle - remove this block once you find the match */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 10,
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            maxWidth: "320px",
            justifyContent: "flex-end",
          }}
        >
          {serifOptions.map((font) => (
            <button
              key={font}
              onClick={() => setSerifFont(font)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border:
                  serifFont === font
                    ? "1px solid #9b8cff"
                    : "1px solid rgba(255,255,255,0.15)",
                background:
                  serifFont === font
                    ? "rgba(155,140,255,0.15)"
                    : "rgba(255,255,255,0.03)",
                color:
                  serifFont === font
                    ? "#9b8cff"
                    : "rgba(255,255,255,0.5)",
                fontSize: "11px",
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {font}
            </button>
          ))}
        </div>

        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(140,160,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(140,160,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "220px 220px",
            pointerEvents: "none",
          }}
        />

        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "900px",
            height: "600px",
            background:
              "radial-gradient(ellipse, rgba(100,85,220,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "1000px",
            padding: "0 32px",
          }}
        >
          {/* Status pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 22px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.03)",
              marginBottom: "44px",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#8b7ff0",
                boxShadow: "0 0 6px rgba(139,127,240,0.7)",
              }}
            />
            <span
              style={{
                fontSize: "13.5px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.015em",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Now accepting new merchants
            </span>
          </div>

          {/* Headline - Line 1: bold sans-serif */}
          <h1
            style={{
              fontSize: "66px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              margin: 0,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            A website that looks like
          </h1>

          {/* Headline - Line 2: italic serif */}
          <h2
            style={{
              fontSize: "68px",
              fontWeight: 400,
              color: "#9b8cff",
              lineHeight: 1.2,
              letterSpacing: "0.005em",
              margin: "4px 0 0 0",
              fontFamily: `'${serifFont}', 'Georgia', serif`,
              fontStyle: "italic",
            }}
          >
            you mean business.
          </h2>

          {/* Subheadline */}
          <p
            style={{
              fontSize: "17px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.7,
              maxWidth: "480px",
              margin: "36px 0 0 0",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Professional sites for restaurants, salons, law firms, and every
            business that deserves to look as good online as they are in person.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              marginTop: "44px",
            }}
          >
            {/* Primary CTA */}
            <button
              onMouseEnter={() => setHoveredBtn("primary")}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "18px 40px",
                borderRadius: "999px",
                border: "none",
                background:
                  "linear-gradient(135deg, #6858e7 0%, #5445d0 100%)",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                boxShadow:
                  hoveredBtn === "primary"
                    ? "0 0 40px rgba(104,88,231,0.55), 0 0 80px rgba(104,88,231,0.2)"
                    : "0 0 30px rgba(104,88,231,0.4), 0 0 60px rgba(104,88,231,0.15)",
                transition: "all 0.3s ease",
                letterSpacing: "0.01em",
              }}
            >
              Get Your Site
              <span style={{ fontSize: "17px", fontWeight: 400 }}>→</span>
            </button>

            {/* Secondary CTA */}
            <button
              onMouseEnter={() => setHoveredBtn("secondary")}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "18px 40px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.12)",
                background:
                  hoveredBtn === "secondary"
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(255,255,255,0.02)",
                color: "rgba(255,255,255,0.75)",
                fontSize: "16px",
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                transition: "all 0.3s ease",
                letterSpacing: "0.01em",
              }}
            >
              See Examples
            </button>
          </div>
        </div>
      </div>
    </>
  );
}