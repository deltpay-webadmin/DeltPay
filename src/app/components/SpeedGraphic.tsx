import { useState, useEffect } from "react";

export function SpeedGraphic() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 700),
      setTimeout(() => setStep(2), 1300),
      setTimeout(() => setStep(3), 1900),
      setTimeout(() => setStep(4), 2500),
      setTimeout(() => setStep(5), 3100),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const days = [
    { day: "Mon", label: "Answer 5 questions", sub: "Kickoff call · 10 min" },
    { day: "Tue", label: "Pick your style", sub: "Review 3 directions" },
    { day: "Wed", label: "We build it", sub: "Design · Copy · Code" },
    { day: "Thu", label: "You review", sub: "One round of edits" },
    { day: "Fri", label: "You're live", sub: "Domain · SSL · Hosting" },
  ];

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
        maxWidth: 600,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        {/* Phone mockup preview at top */}
        <div style={{
          marginTop: 6,
          marginBottom: 20,
          position: "relative",
          width: 180,
          height: 150,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {/* Phone device */}
          <div style={{
            width: 78,
            height: 148,
            borderRadius: 16,
            background: "linear-gradient(180deg, #1a1a1c 0%, #0a0a0c 100%)",
            padding: 4,
            boxShadow: "0 18px 44px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)",
            transform: `scale(${0.85 + step * 0.03}) translateY(${-step * 2}px)`,
            transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            zIndex: 2,
          }}>
            {/* Notch */}
            <div style={{
              position: "absolute",
              top: 4,
              left: "50%",
              transform: "translateX(-50%)",
              width: 28,
              height: 5,
              borderRadius: 4,
              background: "#000",
              zIndex: 3,
            }} />
            {/* Screen */}
            <div style={{
              width: "100%",
              height: "100%",
              borderRadius: 12,
              overflow: "hidden",
              background: step >= 5
                ? "linear-gradient(180deg, #FFF8EC 0%, #F4E3C2 100%)"
                : step >= 3
                  ? "linear-gradient(180deg, #F6F7FB 0%, #E8EAF2 100%)"
                  : step >= 1
                    ? "#F6F7FB"
                    : "#1a1a1c",
              transition: "background 0.6s ease",
              position: "relative",
              padding: "10px 6px 6px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}>
              {step === 0 && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  color: "rgba(255,255,255,0.25)",
                }}>empty</div>
              )}
              {step >= 1 && (
                <div style={{
                  width: "100%",
                  height: 10,
                  borderRadius: 2,
                  background: step >= 2 ? "#041E42" : "rgba(4,30,66,0.25)",
                  transition: "background 0.4s ease",
                }} />
              )}
              {step >= 2 && (
                <>
                  <div style={{
                    width: "70%",
                    height: 4,
                    borderRadius: 2,
                    background: "rgba(4,30,66,0.4)",
                    marginTop: 2,
                  }} />
                  <div style={{
                    width: "50%",
                    height: 3,
                    borderRadius: 2,
                    background: "rgba(4,30,66,0.2)",
                  }} />
                </>
              )}
              {step >= 3 && (
                <div style={{
                  width: "100%",
                  height: 28,
                  borderRadius: 4,
                  background: step >= 5
                    ? "linear-gradient(135deg, #4A2E0E 0%, #8A5A24 50%, #D9994A 100%)"
                    : "linear-gradient(135deg, #4945FF 0%, #4945FF 100%)",
                  marginTop: 2,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {step >= 5 && (
                    <>
                      <div style={{ position: "absolute", top: "30%", left: "25%", width: 3, height: 3, borderRadius: "50%", background: "#E54444" }} />
                      <div style={{ position: "absolute", top: "55%", left: "60%", width: 3, height: 3, borderRadius: "50%", background: "#E54444" }} />
                      <div style={{ position: "absolute", top: "45%", left: "45%", width: 2, height: 2, borderRadius: "50%", background: "#65A944" }} />
                    </>
                  )}
                </div>
              )}
              {step >= 4 && (
                <div style={{
                  display: "flex",
                  gap: 3,
                  marginTop: 2,
                }}>
                  <div style={{ flex: 1, height: 14, borderRadius: 2, background: "rgba(4,30,66,0.15)" }} />
                  <div style={{ flex: 1, height: 14, borderRadius: 2, background: "rgba(4,30,66,0.15)" }} />
                  <div style={{ flex: 1, height: 14, borderRadius: 2, background: "rgba(4,30,66,0.15)" }} />
                </div>
              )}
              {step >= 5 && (
                <div style={{
                  marginTop: "auto",
                  width: "100%",
                  height: 10,
                  borderRadius: 5,
                  background: "#041E42",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 4.5,
                  color: "#fff",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}>ORDER</div>
              )}
            </div>
          </div>

          {/* Live badge */}
          {step >= 5 && (
            <div style={{
              position: "absolute",
              top: 6,
              right: 6,
              background: "#10B981",
              color: "#fff",
              fontSize: 8,
              fontWeight: 700,
              padding: "4px 9px",
              borderRadius: 10,
              letterSpacing: "0.08em",
              boxShadow: "0 6px 20px rgba(16,185,129,0.5)",
              display: "flex",
              alignItems: "center",
              gap: 5,
              animation: "fadeUp 0.6s ease forwards",
              opacity: 0,
              zIndex: 3,
            }}>
              <span style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 0 6px #fff",
                animation: "pulse 1.4s ease-in-out infinite",
              }} />
              LIVE
            </div>
          )}

          {/* Orbit rings */}
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1px solid rgba(73,69,255,0.12)",
            pointerEvents: "none",
            opacity: step >= 3 ? 1 : 0,
            transition: "opacity 0.6s ease",
          }} />
        </div>

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
            top: 18,
            left: 44,
            right: 44,
            height: 3,
            background: "rgba(255,255,255,0.08)",
            zIndex: 0,
            borderRadius: 2,
            overflow: "hidden",
          }}>
            <div style={{
              width: `${Math.min(step / 5 * 100, 100)}%`,
              height: "100%",
              background: "linear-gradient(90deg, #4945FF 0%, #4945FF 70%, #10B981 100%)",
              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              borderRadius: 2,
              boxShadow: "0 0 12px rgba(73,69,255,0.4)",
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
                  width: isCurrent || isFinal ? 38 : 32,
                  height: isCurrent || isFinal ? 38 : 32,
                  borderRadius: "50%",
                  background: isFinal
                    ? "linear-gradient(135deg, #10B981, #059669)"
                    : isActive
                      ? "linear-gradient(135deg, #4945FF, #4945FF)"
                      : "rgba(255,255,255,0.04)",
                  border: isActive ? "none" : "1.5px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isFinal || isCurrent ? 12 : 10,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.3)",
                  fontWeight: 700,
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isFinal
                    ? "0 0 28px rgba(16,185,129,0.5), 0 4px 12px rgba(16,185,129,0.3)"
                    : isCurrent
                      ? "0 0 24px rgba(73,69,255,0.45), 0 4px 10px rgba(73,69,255,0.25)"
                      : "none",
                  marginTop: isCurrent || isFinal ? 0 : 3,
                }}>
                  {isActive ? (isFinal ? "✓" : i + 1) : i + 1}
                </div>

                <div style={{
                  marginTop: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                  transition: "color 0.5s ease",
                  letterSpacing: "0.02em",
                }}>{d.day}</div>

                <div style={{
                  marginTop: 5,
                  fontSize: 11,
                  color: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  lineHeight: 1.35,
                  transition: "color 0.5s ease",
                  maxWidth: 92,
                  fontWeight: 500,
                }}>{d.label}</div>

                <div style={{
                  marginTop: 3,
                  fontSize: 9.5,
                  color: isActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)",
                  textAlign: "center",
                  lineHeight: 1.35,
                  transition: "color 0.5s ease",
                  maxWidth: 92,
                  letterSpacing: "0.01em",
                }}>{d.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Bottom comparison — premium card */}
        <div style={{
          marginTop: 24,
          display: "flex",
          alignItems: "stretch",
          gap: 12,
          width: "100%",
          maxWidth: 440,
        }}>
          <div style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(73,69,255,0.14) 0%, rgba(73,69,255,0.04) 100%)",
            border: "1px solid rgba(73,69,255,0.28)",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}>
            <div style={{
              fontSize: 9,
              color: "#4945FF",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>Delt</div>
            <div style={{
              fontSize: 20,
              color: "#fff",
              fontWeight: 700,
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: "-0.01em",
            }}>5 days</div>
            <div style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
            }}>Flat rate · zero surprises</div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            padding: "0 4px",
            fontSize: 11,
            color: "rgba(255,255,255,0.25)",
            fontWeight: 500,
            letterSpacing: "0.08em",
          }}>VS</div>

          <div style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}>
            <div style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.4)",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>Typical agency</div>
            <div style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 700,
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: "-0.01em",
              textDecoration: "line-through",
              textDecorationColor: "rgba(255,255,255,0.25)",
            }}>4–6 mo.</div>
            <div style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 500,
            }}>$8k–$40k + change orders</div>
          </div>
        </div>

        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.3); }
          }
        `}</style>
      </div>
    </div>
  );
}
