import { useState, useEffect } from "react";

/* ════════════════════════════════════════════════════════════════
   SPEED GRAPHIC — Toast-inspired clean 5-day workflow.
   Vertically stacked day cards with sequential checkmarks.
   The "Today" (Day 5) card has brand-purple glow & live status.
   No phone, no comparison cards — just a confident timeline.
   ════════════════════════════════════════════════════════════════ */

const DAYS = [
  { day: "MON", title: "Discovery", detail: "10-min kickoff call", icon: "🎙" },
  { day: "TUE", title: "Direction", detail: "Pick from 3 designs", icon: "🎨" },
  { day: "WED", title: "Build", detail: "Copy, design & code", icon: "⚙" },
  { day: "THU", title: "Refine", detail: "One round of edits", icon: "✦" },
  { day: "FRI", title: "Live", detail: "Domain · SSL · Hosting", icon: "✓" },
];

export function SpeedGraphic() {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      i++;
      setRevealedCount(i);
      if (i < DAYS.length) setTimeout(tick, 240);
    };
    const start = setTimeout(tick, 250);
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
        width: 480,
        height: 360,
        background: "radial-gradient(closest-side, rgba(73,69,255,0.16), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        width: "100%",
        maxWidth: 520,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        position: "relative",
        zIndex: 5,
      }}>
        {/* Header strip */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          paddingBottom: 14,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              marginBottom: 6,
            }}>Launch Timeline</div>
            <div style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: "-0.01em",
            }}>From signup to live in 5 days</div>
          </div>

          {/* Live status pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "6px 12px",
            background: "rgba(52,211,153,0.12)",
            border: "1px solid rgba(52,211,153,0.3)",
            borderRadius: 50,
            fontSize: 10,
            fontWeight: 700,
            color: "#34D399",
            letterSpacing: "0.1em",
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#34D399",
              boxShadow: "0 0 8px rgba(52,211,153,0.8)",
              animation: "speedDot 1.6s ease-in-out infinite",
            }} />
            ON TRACK
          </div>
        </div>

        {/* Day cards */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          position: "relative",
        }}>
          {/* Vertical connector line */}
          <div style={{
            position: "absolute",
            left: 28,
            top: 28,
            bottom: 28,
            width: 2,
            background: "rgba(255,255,255,0.06)",
            zIndex: 0,
          }} />
          {/* Animated filled connector */}
          <div style={{
            position: "absolute",
            left: 28,
            top: 28,
            width: 2,
            background: "linear-gradient(180deg, #4945FF, #6C69FF)",
            zIndex: 1,
            height: `calc(${(Math.max(0, revealedCount - 1) / (DAYS.length - 1)) * 100}% - 56px)`,
            transition: "height 0.6s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: "0 0 8px rgba(73,69,255,0.6)",
          }} />

          {DAYS.map((d, i) => {
            const revealed = i < revealedCount;
            const isLast = i === DAYS.length - 1;
            const isFinal = isLast && revealed;
            return (
              <div key={d.day} style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                background: isFinal
                  ? "linear-gradient(135deg, rgba(73,69,255,0.18), rgba(73,69,255,0.08))"
                  : "rgba(255,255,255,0.03)",
                border: isFinal
                  ? "1px solid rgba(73,69,255,0.45)"
                  : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                position: "relative",
                zIndex: 2,
                opacity: revealed ? 1 : 0.35,
                transform: revealed ? "translateX(0)" : "translateX(-12px)",
                transition: "all 0.55s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: isFinal
                  ? "0 18px 40px rgba(73,69,255,0.25), 0 0 0 1px rgba(73,69,255,0.2)"
                  : "none",
              }}>
                {/* Status circle */}
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: revealed
                    ? "linear-gradient(135deg, #4945FF, #6C69FF)"
                    : "rgba(255,255,255,0.04)",
                  border: revealed
                    ? "none"
                    : "1.5px solid rgba(255,255,255,0.15)",
                  boxShadow: revealed
                    ? "0 4px 14px rgba(73,69,255,0.45)"
                    : "none",
                  fontSize: 13,
                  color: "#fff",
                  fontWeight: 800,
                  transition: "all 0.4s ease",
                }}>
                  {revealed ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="5 12.5 10 17.5 19 7.5" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>{i + 1}</span>
                  )}
                </div>

                {/* Day label */}
                <div style={{
                  width: 36,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  color: revealed ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
                  flexShrink: 0,
                }}>{d.day}</div>

                {/* Title + detail */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: revealed ? "#fff" : "rgba(255,255,255,0.55)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: "-0.005em",
                  }}>{d.title}</div>
                  <div style={{
                    fontSize: 11,
                    color: revealed ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)",
                    marginTop: 2,
                  }}>{d.detail}</div>
                </div>

                {/* Right-side status */}
                {isFinal ? (
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    background: "rgba(52,211,153,0.18)",
                    border: "1px solid rgba(52,211,153,0.4)",
                    borderRadius: 50,
                    fontSize: 9,
                    fontWeight: 800,
                    color: "#34D399",
                    letterSpacing: "0.1em",
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
                ) : revealed ? (
                  <div style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.4)",
                  }}>DONE</div>
                ) : (
                  <div style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.25)",
                  }}>—</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom comparison strip */}
        <div style={{
          marginTop: 20,
          padding: "12px 16px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}>Typical agency</div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontSize: 16,
              color: "rgba(255,255,255,0.35)",
              textDecoration: "line-through",
              fontWeight: 500,
            }}>4–6 months</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>→</span>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontSize: 18,
              fontWeight: 600,
              color: "#fff",
              letterSpacing: "-0.01em",
            }}>5 days flat</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes speedDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
