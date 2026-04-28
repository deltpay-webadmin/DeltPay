import { useState, useEffect } from "react";

/* ════════════════════════════════════════════════════════════════
   SPEED GRAPHIC — premium "5 days timeline" composition.
   Floating glass frame, real device bezel, animated rail, and
   elevated DELT vs AGENCY comparison cards.
   ════════════════════════════════════════════════════════════════ */
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
      padding: "24px 28px",
      boxSizing: "border-box",
      position: "relative",
    }}>
      {/* Ambient backdrop glow */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 380,
        height: 200,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(73,69,255,0.18) 0%, rgba(73,69,255,0) 70%)",
        opacity: step >= 1 ? 1 : 0,
        transition: "opacity 1.2s ease",
        pointerEvents: "none",
        filter: "blur(10px)",
      }} />

      {/* Glass frame */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 520,
        padding: "24px 22px 22px",
        borderRadius: 18,
        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 40px 90px rgba(0,0,0,0.45), 0 12px 28px rgba(73,69,255,0.10), inset 0 1px 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(8px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        {/* ═══════════ Phone with real bezel ═══════════ */}
        <div style={{
          marginBottom: 20,
          position: "relative",
          width: 200,
          height: 154,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {/* Soft local glow */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 50%, rgba(73,69,255,0.22) 0%, rgba(73,69,255,0) 65%)",
            opacity: step >= 3 ? 1 : 0,
            transition: "opacity 0.8s ease",
            pointerEvents: "none",
            filter: "blur(6px)",
          }} />

          {/* Phone device — premium frame with double bezel + reflection */}
          <div style={{
            position: "relative",
            width: 84,
            height: 152,
            borderRadius: 18,
            padding: 2,
            background: "linear-gradient(160deg, #2a2a30 0%, #0c0c10 100%)",
            boxShadow: "0 22px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)",
            transform: `scale(${0.92 + step * 0.025}) translateY(${-step * 1.5}px)`,
            transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 2,
          }}>
            <div style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: 16,
              padding: 3,
              background: "#000",
            }}>
              {/* Notch */}
              <div style={{
                position: "absolute",
                top: 5,
                left: "50%",
                transform: "translateX(-50%)",
                width: 32,
                height: 6,
                borderRadius: 4,
                background: "#000",
                zIndex: 3,
                boxShadow: "0 0 0 1px rgba(255,255,255,0.04)",
              }} />
              {/* Screen */}
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: 13,
                overflow: "hidden",
                background: step >= 5
                  ? "linear-gradient(180deg, #FFF8EC 0%, #F4E3C2 100%)"
                  : step >= 3
                    ? "linear-gradient(180deg, #F6F7FB 0%, #E8EAF2 100%)"
                    : step >= 1
                      ? "#F6F7FB"
                      : "#15151A",
                transition: "background 0.6s ease",
                position: "relative",
                padding: "12px 7px 7px",
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
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}>empty</div>
                )}
                {step >= 1 && (
                  <div style={{
                    width: "100%",
                    height: 11,
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
                    height: 30,
                    borderRadius: 4,
                    background: step >= 5
                      ? "linear-gradient(135deg, #4A2E0E 0%, #8A5A24 50%, #D9994A 100%)"
                      : "linear-gradient(135deg, #4945FF 0%, #6C69FF 100%)",
                    marginTop: 2,
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: step >= 5
                      ? "0 4px 8px rgba(74,46,14,0.35)"
                      : "0 4px 10px rgba(73,69,255,0.4)",
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
                    height: 11,
                    borderRadius: 5,
                    background: "#041E42",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 5,
                    color: "#fff",
                    fontWeight: 700,
                    letterSpacing: "0.6px",
                  }}>ORDER</div>
                )}

                {/* Glassy reflection */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: "60%",
                  bottom: "60%",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)",
                  pointerEvents: "none",
                }} />
              </div>
            </div>
          </div>

          {/* LIVE badge */}
          {step >= 5 && (
            <div style={{
              position: "absolute",
              top: 10,
              right: 22,
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              color: "#fff",
              fontSize: 8.5,
              fontWeight: 800,
              padding: "5px 11px",
              borderRadius: 999,
              letterSpacing: "0.12em",
              boxShadow: "0 8px 24px rgba(16,185,129,0.5), 0 0 0 1px rgba(16,185,129,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              animation: "fadeUp 0.6s ease forwards",
              opacity: 0,
              zIndex: 3,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 0 8px #fff",
                animation: "pulse 1.4s ease-in-out infinite",
              }} />
              LIVE
            </div>
          )}
        </div>

        {/* ═══════════ Timeline ═══════════ */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 0,
          width: "100%",
          position: "relative",
        }}>
          {/* Connecting rail */}
          <div style={{
            position: "absolute",
            top: 18,
            left: "10%",
            right: "10%",
            height: 3,
            background: "rgba(255,255,255,0.06)",
            zIndex: 0,
            borderRadius: 2,
            overflow: "hidden",
          }}>
            <div style={{
              width: `${Math.min(step / 5 * 100, 100)}%`,
              height: "100%",
              background: "linear-gradient(90deg, #4945FF 0%, #6C69FF 70%, #10B981 100%)",
              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              borderRadius: 2,
              boxShadow: "0 0 14px rgba(73,69,255,0.6)",
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
                      ? "linear-gradient(135deg, #4945FF, #6C69FF)"
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
                    ? "0 0 32px rgba(16,185,129,0.55), 0 4px 12px rgba(16,185,129,0.3), inset 0 1px 1px rgba(255,255,255,0.25)"
                    : isCurrent
                      ? "0 0 26px rgba(73,69,255,0.5), 0 4px 10px rgba(73,69,255,0.28), inset 0 1px 1px rgba(255,255,255,0.25)"
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
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>{d.day}</div>

                <div style={{
                  marginTop: 5,
                  fontSize: 10.5,
                  color: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  lineHeight: 1.35,
                  transition: "color 0.5s ease",
                  maxWidth: 88,
                  fontWeight: 500,
                }}>{d.label}</div>

                <div style={{
                  marginTop: 3,
                  fontSize: 9,
                  color: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                  textAlign: "center",
                  lineHeight: 1.35,
                  transition: "color 0.5s ease",
                  maxWidth: 88,
                  letterSpacing: "0.01em",
                }}>{d.sub}</div>
              </div>
            );
          })}
        </div>

        {/* ═══════════ Comparison cards (premium) ═══════════ */}
        <div style={{
          marginTop: 28,
          display: "flex",
          alignItems: "stretch",
          gap: 14,
          width: "100%",
          maxWidth: 460,
        }}>
          {/* DELT card — featured */}
          <div style={{
            position: "relative",
            flex: 1,
            padding: "14px 16px 14px",
            borderRadius: 14,
            background: "linear-gradient(135deg, rgba(73,69,255,0.18) 0%, rgba(73,69,255,0.04) 100%)",
            border: "1px solid rgba(73,69,255,0.4)",
            boxShadow: "0 14px 36px rgba(73,69,255,0.20), inset 0 1px 0 rgba(255,255,255,0.07)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            overflow: "hidden",
          }}>
            {/* Top sheen */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(108,105,255,0.55), transparent)",
            }} />
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{
                fontSize: 9,
                color: "#A6A4FF",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>Delt</div>
              <span style={{
                fontSize: 7,
                color: "#10B981",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "3px 7px",
                borderRadius: 999,
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981" }} />
                Live
              </span>
            </div>
            <div style={{
              fontSize: 22,
              color: "#fff",
              fontWeight: 700,
              fontFamily: "'Playfair Display', 'Instrument Serif', Georgia, serif",
              letterSpacing: "-0.01em",
              fontStyle: "italic",
              lineHeight: 1.05,
              marginTop: 2,
            }}>5 days</div>
            <div style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.75)",
              fontWeight: 500,
              marginTop: 2,
            }}>Flat rate · zero surprises</div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            padding: "0 2px",
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            fontWeight: 600,
            letterSpacing: "0.1em",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>VS</div>

          {/* AGENCY card — muted */}
          <div style={{
            flex: 1,
            padding: "14px 16px 14px",
            borderRadius: 14,
            background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.45)",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>Typical agency</div>
              <span style={{
                fontSize: 7,
                color: "rgba(255,255,255,0.4)",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "3px 7px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>Months</span>
            </div>
            <div style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 700,
              fontFamily: "'Playfair Display', 'Instrument Serif', Georgia, serif",
              letterSpacing: "-0.01em",
              fontStyle: "italic",
              lineHeight: 1.05,
              marginTop: 2,
              textDecoration: "line-through",
              textDecorationColor: "rgba(255,255,255,0.25)",
            }}>4–6 mo.</div>
            <div style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 500,
              marginTop: 2,
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
