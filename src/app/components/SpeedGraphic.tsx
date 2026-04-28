import { useState, useEffect } from "react";

/* ════════════════════════════════════════════════════════════════
   SPEED GRAPHIC — minimal 5-day timeline.
   Just the days, sequential checkmarks, and a confident headline.
   ════════════════════════════════════════════════════════════════ */

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];

export function SpeedGraphic() {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      i++;
      setRevealed(i);
      if (i < DAYS.length) setTimeout(tick, 320);
    };
    const start = setTimeout(tick, 350);
    return () => clearTimeout(start);
  }, []);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px 32px",
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
        width: 540,
        height: 320,
        background: "radial-gradient(closest-side, rgba(73,69,255,0.18), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
        zIndex: 5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 56,
      }}>
        {/* ═══ Headline ═══ */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 42,
            fontWeight: 800,
            color: "#fff",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}>
            Live in{" "}
            <span style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 600,
              color: "#6C69FF",
            }}>5 days.</span>
          </div>
        </div>

        {/* ═══ Day rail ═══ */}
        <div style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 0,
          paddingTop: 28,
        }}>
          {/* Connector track — spans from center of first circle to center of last */}
          <div style={{
            position: "absolute",
            left: "calc(44px + 0px)",
            right: "calc(44px + 0px)",
            top: "calc(28px + 28px)",
            height: 2,
            background: "rgba(255,255,255,0.08)",
            zIndex: 0,
          }} />
          {/* Animated filled line */}
          <div style={{
            position: "absolute",
            left: "calc(44px + 0px)",
            top: "calc(28px + 28px)",
            height: 2,
            background: "linear-gradient(90deg, #4945FF, #6C69FF)",
            boxShadow: "0 0 10px rgba(73,69,255,0.7)",
            width: `calc((100% - 88px) * ${Math.max(0, revealed - 1) / (DAYS.length - 1)})`,
            zIndex: 1,
            transition: "width 0.55s cubic-bezier(0.16,1,0.3,1)",
          }} />

          {DAYS.map((d, i) => {
            const done = i < revealed;
            const isLast = i === DAYS.length - 1;
            const isLive = isLast && done;
            return (
              <div key={d} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                width: 88,
                position: "relative",
                zIndex: 2,
              }}>
                {/* Circle */}
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: done
                    ? "linear-gradient(135deg, #4945FF, #6C69FF)"
                    : "rgba(8,22,46,1)",
                  border: done
                    ? "none"
                    : "1.5px solid rgba(255,255,255,0.12)",
                  boxShadow: isLive
                    ? "0 0 0 6px rgba(73,69,255,0.18), 0 12px 28px rgba(73,69,255,0.5)"
                    : done
                      ? "0 6px 18px rgba(73,69,255,0.4)"
                      : "none",
                  transition: "all 0.45s ease",
                  opacity: done ? 1 : 0.7,
                }}>
                  {done ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="5 12.5 10 17.5 19 7.5" />
                    </svg>
                  ) : (
                    <span style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>{i + 1}</span>
                  )}
                </div>

                {/* Day label */}
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: done ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)",
                  transition: "color 0.4s ease",
                }}>{d}</div>

                {/* Live pill (only on last when revealed) */}
                {isLive && (
                  <div style={{
                    position: "absolute",
                    top: -28,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "4px 10px",
                    background: "rgba(52,211,153,0.16)",
                    border: "1px solid rgba(52,211,153,0.4)",
                    borderRadius: 50,
                    fontSize: 9,
                    fontWeight: 800,
                    color: "#34D399",
                    letterSpacing: "0.14em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    whiteSpace: "nowrap",
                  }}>
                    <span style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#34D399",
                      boxShadow: "0 0 6px rgba(52,211,153,0.9)",
                    }} />
                    LIVE
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
