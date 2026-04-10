import { useState, useEffect } from "react";

export function SpeedGraphic() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1400),
      setTimeout(() => setStep(3), 2000),
      setTimeout(() => setStep(4), 2600),
      setTimeout(() => setStep(5), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const days = [
    { day: "Mon", label: "Answer 5 questions", icon: "✎" },
    { day: "Tue", label: "Pick your style", icon: "◆" },
    { day: "Wed", label: "We build it", icon: "⚙" },
    { day: "Thu", label: "You review", icon: "✓" },
    { day: "Fri", label: "You're live", icon: "🟢" },
  ];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 580,
        padding: "40px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Timeline */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 0,
          width: "100%",
          position: "relative",
        }}>
          {/* Connecting line */}
          <div style={{
            position: "absolute",
            top: 24,
            left: 40,
            right: 40,
            height: 2,
            background: "rgba(255,255,255,0.08)",
            zIndex: 0,
          }}>
            <div style={{
              width: `${Math.min(step / 5 * 100, 100)}%`,
              height: "100%",
              background: "linear-gradient(90deg, #4945FF, #6C69FF)",
              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              borderRadius: 2,
            }} />
          </div>

          {days.map((d, i) => {
            const isActive = i < step;
            const isCurrent = i === step - 1;
            const isFinal = i === 4 && step >= 5;

            return (
              <div key={i} style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}>
                <div style={{
                  width: isCurrent || isFinal ? 48 : 40,
                  height: isCurrent || isFinal ? 48 : 40,
                  borderRadius: "50%",
                  background: isFinal
                    ? "linear-gradient(135deg, #10B981, #059669)"
                    : isActive
                      ? "linear-gradient(135deg, #4945FF, #6C69FF)"
                      : "rgba(255,255,255,0.06)",
                  border: isActive ? "none" : "1.5px solid rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isFinal ? 18 : 14,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.25)",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isFinal
                    ? "0 0 24px rgba(16,185,129,0.4)"
                    : isCurrent
                      ? "0 0 20px rgba(73,69,255,0.35)"
                      : "none",
                }}>
                  {d.icon}
                </div>

                <div style={{
                  marginTop: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.3)",
                  transition: "color 0.5s ease",
                }}>{d.day}</div>

                <div style={{
                  marginTop: 6,
                  fontSize: 10.5,
                  color: isActive ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)",
                  textAlign: "center",
                  lineHeight: 1.35,
                  transition: "color 0.5s ease",
                  maxWidth: 80,
                }}>{d.label}</div>
              </div>
            );
          })}
        </div>

        {/* Bottom comparison */}
        <div style={{
          marginTop: 48,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#4945FF",
            }} />
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
            }}>Delt: 5 days</span>
          </div>

          <div style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.2)",
            fontWeight: 500,
          }}>vs.</div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
            }} />
            <span style={{
              fontSize: 14,
              fontWeight: 500,
              color: "rgba(255,255,255,0.35)",
              textDecoration: "line-through",
            }}>Agency: 4–6 months</span>
          </div>
        </div>

        {/* Live indicator */}
        {step >= 5 && (
          <div style={{
            marginTop: 24,
            fontSize: 11,
            color: "#10B981",
            fontWeight: 600,
            letterSpacing: "0.06em",
            opacity: 0,
            animation: "fadeUp 0.6s ease forwards",
          }}>
            ● Your site is live
          </div>
        )}

        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}