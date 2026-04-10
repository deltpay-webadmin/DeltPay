import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0A0F1E",
  surface: "#111827",
  surfaceAlt: "#151D2E",
  card: "#1A2235",
  cardHover: "#1E2740",
  border: "#1E293B",
  borderLight: "#2A3548",
  accent: "#3B6BF7",
  accentGlow: "rgba(59,107,247,0.15)",
  accentSoft: "rgba(59,107,247,0.08)",
  green: "#10B981",
  greenSoft: "rgba(16,185,129,0.12)",
  greenGlow: "rgba(16,185,129,0.25)",
  red: "#EF4444",
  redSoft: "rgba(239,68,68,0.12)",
  amber: "#F59E0B",
  amberSoft: "rgba(245,158,11,0.12)",
  white: "#F8FAFC",
  gray100: "#E2E8F0",
  gray200: "#CBD5E1",
  gray300: "#94A3B8",
  gray400: "#64748B",
  gray500: "#475569",
};

const formatCurrency = (n) => {
  if (n >= 1000) return "$" + (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return "$" + n.toLocaleString();
};

const formatFull = (n) => "$" + n.toLocaleString();

// Animated counter
function AnimatedNumber({ value, prefix = "$", duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = (ts) => {
      if (!ref.current) ref.current = ts;
      const progress = Math.min((ts - ref.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(ease * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    ref.current = null;
    requestAnimationFrame(step);
  }, [value, duration]);
  return <span>{prefix}{display.toLocaleString()}</span>;
}

// Sparkline
function Sparkline({ data, color = COLORS.green, width = 120, height = 32 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#sg-${color.replace("#","")})`}
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Mini progress ring
function ProgressRing({ percent, size = 44, stroke = 4, color = COLORS.accent }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={COLORS.border} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
}

// Revenue bar chart
function RevenueChart({ data }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100, padding: "0 4px" }}>
      {data.map((d, i) => {
        const h = (d.value / max) * 80 + 10;
        const isToday = i === data.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: "100%", height: h, borderRadius: 4,
              background: isToday ? `linear-gradient(180deg, ${COLORS.accent}, ${COLORS.accent}88)` : COLORS.borderLight,
              opacity: isToday ? 1 : 0.6,
              transition: "height 0.6s ease",
              position: "relative"
            }}>
              {isToday && <div style={{
                position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
                fontSize: 10, fontWeight: 600, color: COLORS.accent, whiteSpace: "nowrap"
              }}>{formatCurrency(d.value)}</div>}
            </div>
            <span style={{ fontSize: 9, color: COLORS.gray400, letterSpacing: 0.5 }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DeltDashboard() {
  const [loaded, setLoaded] = useState(false);
  const [capitalExpanded, setCapitalExpanded] = useState(false);
  const [lensInput, setLensInput] = useState("");

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const revenueData = [
    { label: "Mon", value: 4200 }, { label: "Tue", value: 5100 },
    { label: "Wed", value: 3800 }, { label: "Thu", value: 6200 },
    { label: "Fri", value: 5800 }, { label: "Sat", value: 7100 },
    { label: "Sun", value: 2940 }
  ];

  const weeklySparkline = [3200, 3800, 4100, 3600, 4500, 4200, 4800, 5100, 4600, 5300, 4900, 5600];
  const todayRevenue = 2940;
  const yesterdayRevenue = 7100;
  const weekTotal = 35140;
  const lastWeekTotal = 31200;
  const weekChange = ((weekTotal - lastWeekTotal) / lastWeekTotal * 100).toFixed(1);

  const nextSettlement = 4823;
  const settDate = "Tomorrow, Mar 4";

  const capitalFunded = 75000;
  const capitalRepaid = 48750;
  const capitalRemaining = capitalFunded - capitalRepaid;
  const capitalPercent = Math.round((capitalRepaid / capitalFunded) * 100);
  const payoffDate = "Apr 28, 2026";

  const insights = [
    { icon: "📈", text: "Your Wednesday revenue has dropped 18% vs. your 4-week average. This appears unusual for your practice.", tag: "Anomaly", color: COLORS.amber },
    { icon: "👥", text: "3 of your top 15 patients by revenue haven't visited in 30+ days.", tag: "Retention", color: COLORS.red },
    { icon: "💰", text: "Based on current pace, your advance pays off Apr 28. You'll be eligible for a larger renewal.", tag: "Capital", color: COLORS.green },
  ];

  const transactions = [
    { name: "Sarah Mitchell", amount: 385, time: "2:34 PM", type: "Visa •4821" },
    { name: "James Chen", amount: 1250, time: "1:15 PM", type: "ACH Transfer" },
    { name: "Maria Garcia", amount: 220, time: "11:48 AM", type: "MC •7733" },
    { name: "Robert Kim", amount: 675, time: "10:22 AM", type: "Visa •2109" },
    { name: "Linda Park", amount: 410, time: "9:05 AM", type: "Visa •5544" },
  ];

  const cardStyle = (delay = 0) => ({
    background: COLORS.card,
    borderRadius: 16,
    border: `1px solid ${COLORS.border}`,
    padding: "20px 24px",
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(12px)",
    transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  const labelStyle = {
    fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
    color: COLORS.gray400, textTransform: "uppercase", marginBottom: 8
  };

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg, color: COLORS.white,
      fontFamily: "'DM Sans', 'SF Pro Display', -apple-system, sans-serif",
    }}>
      {/* Top Bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 32px", borderBottom: `1px solid ${COLORS.border}`,
        background: `${COLORS.surface}cc`, backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.accent}, #6366F1)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 14, letterSpacing: -0.5
          }}>D</div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.3 }}>Delt</span>
          <span style={{ fontSize: 12, color: COLORS.gray400, marginLeft: 4, fontWeight: 500 }}>Merchant OS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {["Dashboard", "Transactions", "Money", "Analytics", "Lens AI", "Customers"].map((item, i) => (
            <span key={item} style={{
              fontSize: 13, fontWeight: i === 0 ? 600 : 400,
              color: i === 0 ? COLORS.white : COLORS.gray400,
              cursor: "pointer", padding: "6px 0",
              borderBottom: i === 0 ? `2px solid ${COLORS.accent}` : "2px solid transparent",
              transition: "all 0.2s"
            }}>{item}</span>
          ))}
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: COLORS.surfaceAlt,
            border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 600, color: COLORS.gray300, cursor: "pointer"
          }}>⚙</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>
        {/* Greeting */}
        <div style={{
          marginBottom: 28,
          opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(8px)",
          transition: "all 0.4s ease"
        }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>
            Good afternoon
          </h1>
          <p style={{ fontSize: 14, color: COLORS.gray400, margin: "4px 0 0", fontWeight: 400 }}>
            Sunday, March 3 — Here's how your practice is performing today.
          </p>
        </div>

        {/* ROW 1: Revenue + Settlement + Capital */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
          
          {/* TODAY'S REVENUE */}
          <div style={cardStyle(50)}>
            <div style={labelStyle}>Today's Revenue</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1.5 }}>
                <AnimatedNumber value={todayRevenue} />
              </span>
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: todayRevenue >= yesterdayRevenue ? COLORS.green : COLORS.gray400,
                display: "flex", alignItems: "center", gap: 2
              }}>
                {todayRevenue >= yesterdayRevenue ? "↑" : "↓"} vs yesterday
              </span>
            </div>
            <div style={{ fontSize: 12, color: COLORS.gray400, marginBottom: 16 }}>
              6 transactions today
            </div>
            <RevenueChart data={revenueData} />
          </div>

          {/* NEXT SETTLEMENT */}
          <div style={cardStyle(100)}>
            <div style={labelStyle}>Next Settlement</div>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1.5, marginBottom: 4 }}>
              <AnimatedNumber value={nextSettlement} />
            </div>
            <div style={{ fontSize: 13, color: COLORS.gray300, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green, display: "inline-block", boxShadow: `0 0 8px ${COLORS.greenGlow}` }} />
              {settDate}
            </div>
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: COLORS.gray400 }}>This week</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{formatFull(weekTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: COLORS.gray400 }}>vs. last week</span>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                  background: COLORS.greenSoft, color: COLORS.green
                }}>+{weekChange}%</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <Sparkline data={weeklySparkline} />
              </div>
            </div>
          </div>

          {/* CAPITAL STATUS */}
          <div style={{
            ...cardStyle(150),
            background: `linear-gradient(135deg, ${COLORS.card}, ${COLORS.surfaceAlt})`,
            position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: -40, right: -40, width: 120, height: 120,
              borderRadius: "50%", background: COLORS.accentSoft, filter: "blur(40px)"
            }} />
            <div style={{ ...labelStyle, position: "relative" }}>Capital</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, position: "relative" }}>
              <ProgressRing percent={capitalPercent} size={52} stroke={5} color={COLORS.accent} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray200 }}>{capitalPercent}% repaid</div>
                <div style={{ fontSize: 12, color: COLORS.gray400 }}>{formatFull(capitalRemaining)} remaining</div>
              </div>
            </div>
            <div style={{
              background: COLORS.accentSoft, borderRadius: 10, padding: "12px 14px",
              border: `1px solid ${COLORS.accent}22`, position: "relative"
            }}>
              <div style={{ fontSize: 11, color: COLORS.gray300, marginBottom: 2 }}>Estimated payoff</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.white }}>{payoffDate}</div>
            </div>
            <button
              onClick={() => setCapitalExpanded(!capitalExpanded)}
              style={{
                marginTop: 12, width: "100%", padding: "8px 0", borderRadius: 8,
                background: "transparent", border: `1px solid ${COLORS.borderLight}`,
                color: COLORS.gray300, fontSize: 12, fontWeight: 500, cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {capitalExpanded ? "Hide details ↑" : "View details →"}
            </button>
            {capitalExpanded && (
              <div style={{ marginTop: 12, fontSize: 12, color: COLORS.gray400, lineHeight: 1.6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Funded amount</span><span style={{ color: COLORS.gray200 }}>{formatFull(capitalFunded)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Total repaid</span><span style={{ color: COLORS.green }}>{formatFull(capitalRepaid)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Daily remittance</span><span style={{ color: COLORS.gray200 }}>$438</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: Lens AI Insights + Live Transactions */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>
          
          {/* LENS AI */}
          <div style={cardStyle(200)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `linear-gradient(135deg, ${COLORS.accent}, #8B5CF6)`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
                }}>✦</div>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>Lens AI</span>
              </div>
              <span style={{
                fontSize: 11, color: COLORS.accent, fontWeight: 500, cursor: "pointer",
                padding: "4px 10px", borderRadius: 20, border: `1px solid ${COLORS.accent}33`,
                background: COLORS.accentSoft
              }}>Open Lens →</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {insights.map((ins, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, padding: "14px 16px", borderRadius: 12,
                  background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
                  cursor: "pointer", transition: "all 0.2s",
                  opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateX(-8px)",
                  transitionDelay: `${300 + i * 100}ms`
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = COLORS.cardHover; e.currentTarget.style.borderColor = ins.color + "44"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = COLORS.surfaceAlt; e.currentTarget.style.borderColor = COLORS.border; }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{ins.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: COLORS.gray200, lineHeight: 1.5 }}>{ins.text}</div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: ins.color, marginTop: 6,
                      display: "inline-block", padding: "2px 8px", borderRadius: 10,
                      background: ins.color + "18", letterSpacing: 0.5, textTransform: "uppercase"
                    }}>{ins.tag}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Lens AI Input */}
            <div style={{
              display: "flex", gap: 8, padding: "10px 14px", borderRadius: 12,
              background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
              alignItems: "center"
            }}>
              <span style={{ fontSize: 16, opacity: 0.5 }}>✦</span>
              <input
                value={lensInput}
                onChange={e => setLensInput(e.target.value)}
                placeholder="Ask Lens anything about your business..."
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: COLORS.white, fontSize: 13, fontFamily: "inherit"
                }}
              />
              <span style={{
                fontSize: 11, color: COLORS.gray500, padding: "2px 6px",
                borderRadius: 4, border: `1px solid ${COLORS.border}`
              }}>⏎</span>
            </div>
          </div>

          {/* LIVE TRANSACTIONS */}
          <div style={cardStyle(250)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={labelStyle}>Recent Transactions</div>
              <span style={{ fontSize: 11, color: COLORS.accent, fontWeight: 500, cursor: "pointer" }}>View all →</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {transactions.map((tx, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: i < transactions.length - 1 ? `1px solid ${COLORS.border}` : "none",
                  opacity: loaded ? 1 : 0, transition: `opacity 0.4s ease ${350 + i * 60}ms`
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.gray100 }}>{tx.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.gray500, marginTop: 2 }}>{tx.type} · {tx.time}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.green, letterSpacing: -0.3 }}>
                    +{formatFull(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 3: QBO + Quick Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          
          {/* QBO Connection Prompt */}
          <div style={{
            ...cardStyle(300),
            background: `linear-gradient(135deg, ${COLORS.surfaceAlt}, #1A1F30)`,
            border: `1px dashed ${COLORS.borderLight}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: "28px 24px", cursor: "pointer"
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, marginBottom: 14,
              background: COLORS.greenSoft, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, border: `1px solid ${COLORS.green}22`
            }}>📊</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.white, marginBottom: 6 }}>
              Connect QuickBooks
            </div>
            <div style={{ fontSize: 12, color: COLORS.gray400, lineHeight: 1.5, marginBottom: 14 }}>
              Unlock profit margins, cash flow forecasting, and 10x smarter AI insights.
            </div>
            <div style={{
              padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: COLORS.green, color: COLORS.white, letterSpacing: 0.3
            }}>Connect QBO →</div>
          </div>

          {/* Quick Stats */}
          <div style={cardStyle(350)}>
            <div style={labelStyle}>This Month</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Total Revenue", value: "$142,800", change: "+8.3%", up: true },
                { label: "Transactions", value: "384", change: "+12%", up: true },
                { label: "Avg. Transaction", value: "$372", change: "-2.1%", up: false },
                { label: "New Patients", value: "18", change: "+5", up: true },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: COLORS.gray400 }}>{s.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.white }}>{s.value}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10,
                      background: s.up ? COLORS.greenSoft : COLORS.redSoft,
                      color: s.up ? COLORS.green : COLORS.red
                    }}>{s.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ecosystem Status */}
          <div style={cardStyle(400)}>
            <div style={labelStyle}>Your Delt Ecosystem</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "💳", name: "Payments", status: "Active", color: COLORS.green },
                { icon: "💰", name: "Capital", status: "65% repaid", color: COLORS.accent },
                { icon: "✦", name: "Lens AI", status: "Active", color: COLORS.green },
                { icon: "🌐", name: "Website", status: "Not set up", color: COLORS.gray500 },
              ].map((p, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 10,
                  background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`
                }}>
                  <span style={{ fontSize: 16 }}>{p.icon}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: COLORS.gray200 }}>{p.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: p.color,
                    padding: "2px 8px", borderRadius: 10,
                    background: p.color === COLORS.gray500 ? COLORS.surfaceAlt : p.color + "18"
                  }}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}