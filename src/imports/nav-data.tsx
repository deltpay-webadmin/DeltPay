import { useState, useRef, useEffect } from "react";

const SOLUTIONS_LEFT = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="1.4" stroke="#4318FF"><circle cx="10" cy="10" r="8.5"/><ellipse cx="10" cy="10" rx="4" ry="8.5"/><path d="M2 10h16"/><path d="M3.5 5.5h13M3.5 14.5h13"/></svg>,
    title: "Launch Your Website",
    desc: "Done-for-you sites with hosting & security",
    href: "/solutions/websites",
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="1.4" stroke="#4318FF"><rect x="1.5" y="4" width="17" height="12" rx="2"/><path d="M1.5 8.5h17"/><path d="M5 12.5h4"/></svg>,
    title: "Accept Payments",
    desc: "In-store, online & mobile processing",
    href: "/solutions/payments",
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="1.4" stroke="#4318FF"><circle cx="10" cy="10" r="8.5"/><path d="M7.5 12.5L12.5 7.5M12.5 7.5H8.5M12.5 7.5v4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: "Get Funded",
    desc: "Revenue-based capital, fast approvals",
    href: "/capital",
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="1.4" stroke="#4318FF" strokeLinecap="round"><path d="M4 16V10"/><path d="M8 16V6"/><path d="M12 16V8"/><path d="M16 16V4"/></svg>,
    title: "Understand Your Business",
    desc: "AI-powered analytics with Lens",
    href: "/solutions/lens",
  },
];

const SOLUTIONS_INDUSTRIES = [
  { title: "Restaurants & Food Service", desc: "POS, online ordering, table management", href: "/industries/restaurants" },
  { title: "Retail & E-commerce", desc: "Inventory, checkout, multi-channel", href: "/industries/retail" },
  { title: "Professional Services", desc: "Invoicing, scheduling, client management", href: "/industries/professional-services" },
  { title: "Health & Wellness", desc: "Appointments, memberships, HIPAA-ready", href: "/industries/health-wellness" },
  { title: "Home Services", desc: "Estimates, mobile payments, dispatching", href: "/industries/home-services" },
];

const SOLUTIONS_SECONDARY = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Compare plans", href: "/pricing" },
  { label: "See a demo", href: "/sandbox" },
];

const RESOURCES_LEARN = [
  { title: "What's New", desc: "Product updates & releases", href: "/whats-new" },
  { title: "About Us", desc: "Our story, team & mission", href: "/about" },
  { title: "Reviews", desc: "What merchants are saying", href: "/reviews" },
  { title: "Blog", desc: "Insights for growing businesses", href: "/blog" },
];

const RESOURCES_SUPPORT = [
  { title: "FAQ", desc: "Common questions answered", href: "/faq" },
  { title: "Contact & Support", desc: "Sales, support, partnerships", href: "/contact" },
  { title: "Demo", desc: "Dashboard sandbox preview", href: "/sandbox" },
  { title: "Status", desc: "System uptime & incidents", href: "/status" },
];

function DeltLogo() {
  return (
    <a href="/" style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
      <svg width="26" height="34" viewBox="0 0 26 34" fill="none">
        <circle cx="10" cy="8" r="5" fill="#4318FF"/>
        <circle cx="10" cy="21" r="5" fill="#7B61FF"/>
      </svg>
      <span style={{ fontSize: 26, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.5px", lineHeight: 1 }}>Delt</span>
    </a>
  );
}

function NavItem({ label, hasDropdown, active, href }) {
  return (
    <a
      href={href || "#"}
      style={{
        fontSize: 15,
        fontWeight: 500,
        color: active ? "#4318FF" : "#1A1A2E",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "8px 0",
        cursor: "pointer",
        transition: "color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {hasDropdown && (
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
          style={{ transition: "transform 0.2s", transform: active ? "rotate(180deg)" : "none", opacity: 0.4 }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </a>
  );
}

function SolutionsDropdown() {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 25px 60px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)",
      border: "1px solid #E5E7EB",
      display: "flex",
      width: 820,
      overflow: "hidden",
      animation: "dropIn 0.18s ease-out",
    }}>
      {/* Col 1: Outcome-led */}
      <div style={{ width: 280, padding: "24px 20px", borderRight: "1px solid #F3F4F6" }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "1.4px",
          textTransform: "uppercase", color: "#9CA3AF", marginBottom: 14, paddingLeft: 12,
        }}>Start & Grow</div>

        {SOLUTIONS_LEFT.map((item, i) => (
          <a key={i} href={item.href} style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            padding: "10px 12px", borderRadius: 10, textDecoration: "none",
            transition: "background 0.12s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: "#F5F3FF", border: "1px solid #EDE9FE",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: 1,
            }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 650, color: "#1A1A2E", marginBottom: 1 }}>{item.title}</div>
              <div style={{ fontSize: 12.5, color: "#9CA3AF", lineHeight: 1.35 }}>{item.desc}</div>
            </div>
          </a>
        ))}

        {/* Secondary links */}
        <div style={{ borderTop: "1px solid #F3F4F6", marginTop: 12, paddingTop: 12, paddingLeft: 12, display: "flex", gap: 16 }}>
          {SOLUTIONS_SECONDARY.map((link, i) => (
            <a key={i} href={link.href} style={{
              fontSize: 12.5, fontWeight: 500, color: "#9CA3AF", textDecoration: "none",
              transition: "color 0.12s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#4318FF"}
              onMouseLeave={e => e.currentTarget.style.color = "#9CA3AF"}
            >{link.label}</a>
          ))}
        </div>
      </div>

      {/* Col 2: Business types with descriptions */}
      <div style={{ width: 280, padding: "24px 20px", borderRight: "1px solid #F3F4F6" }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "1.4px",
          textTransform: "uppercase", color: "#9CA3AF", marginBottom: 14, paddingLeft: 12,
        }}>By Business Type</div>

        {SOLUTIONS_INDUSTRIES.map((item, i) => (
          <a key={i} href={item.href} style={{
            display: "block", padding: "9px 12px", borderRadius: 8,
            textDecoration: "none", transition: "background 0.12s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E", marginBottom: 1 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.35 }}>{item.desc}</div>
          </a>
        ))}

        <div style={{ borderTop: "1px solid #F3F4F6", marginTop: 10, paddingTop: 10 }}>
          <a href="/industries" style={{
            fontSize: 13, fontWeight: 600, color: "#4318FF", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 5, padding: "8px 12px",
            borderRadius: 8, transition: "background 0.12s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#F5F3FF"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >See all industries <span style={{ fontSize: 12 }}>→</span></a>
        </div>
      </div>

      {/* Col 3: Featured panel */}
      <div style={{
        flex: 1, padding: "24px 24px",
        background: "linear-gradient(180deg, #F8F7FF 0%, #F0EDFF 100%)",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "1.4px",
            textTransform: "uppercase", color: "#7B61FF", marginBottom: 14,
          }}>Featured</div>

          {/* Stat card */}
          <div style={{
            background: "#fff", borderRadius: 12, padding: "20px",
            border: "1px solid #EDE9FE", marginBottom: 16,
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#4318FF", lineHeight: 1, marginBottom: 4 }}>$2.4B+</div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.4 }}>processed by Delt merchants in the last 12 months</div>
          </div>

          {/* Testimonial snippet */}
          <div style={{
            background: "#fff", borderRadius: 12, padding: "16px 18px",
            border: "1px solid #EDE9FE",
          }}>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, fontStyle: "italic", marginBottom: 10 }}>
              "Switched from Square — the done-for-you website alone was worth it. Then we got funded in 48 hours."
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1A2E" }}>Marcus R.</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>Owner, Precision Auto Repair</div>
          </div>
        </div>

        <a href="/get-started" style={{
          fontSize: 13, fontWeight: 700, color: "#4318FF", textDecoration: "none",
          display: "flex", alignItems: "center", gap: 6, marginTop: 16,
        }}>
          Get started for free <span>→</span>
        </a>
      </div>
    </div>
  );
}

function ResourcesDropdown() {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 25px 60px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)",
      border: "1px solid #E5E7EB",
      display: "flex",
      width: 520,
      overflow: "hidden",
      animation: "dropIn 0.18s ease-out",
    }}>
      {/* Learn */}
      <div style={{ flex: 1, padding: "24px 20px", borderRight: "1px solid #F3F4F6" }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "1.4px",
          textTransform: "uppercase", color: "#9CA3AF", marginBottom: 14, paddingLeft: 12,
        }}>Learn</div>

        {RESOURCES_LEARN.map((item, i) => (
          <a key={i} href={item.href} style={{
            display: "block", padding: "9px 12px", borderRadius: 8,
            textDecoration: "none", transition: "background 0.12s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E", marginBottom: 1 }}>{item.title}</div>
            <div style={{ fontSize: 12.5, color: "#9CA3AF", lineHeight: 1.35 }}>{item.desc}</div>
          </a>
        ))}
      </div>

      {/* Support */}
      <div style={{ flex: 1, padding: "24px 20px" }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "1.4px",
          textTransform: "uppercase", color: "#9CA3AF", marginBottom: 14, paddingLeft: 12,
        }}>Support</div>

        {RESOURCES_SUPPORT.map((item, i) => (
          <a key={i} href={item.href} style={{
            display: "block", padding: "9px 12px", borderRadius: 8,
            textDecoration: "none", transition: "background 0.12s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E", marginBottom: 1 }}>{item.title}</div>
            <div style={{ fontSize: 12.5, color: "#9CA3AF", lineHeight: 1.35 }}>{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function DeltNav() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const closeTimer = useRef(null);

  const handleOpen = (key) => { clearTimeout(closeTimer.current); setOpenDropdown(key); };
  const handleClose = () => { closeTimer.current = setTimeout(() => setOpenDropdown(null), 150); };
  const handleDropdownEnter = () => { clearTimeout(closeTimer.current); };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ position: "relative", zIndex: 50, background: "#fff", borderBottom: "1px solid #F3F4F6" }}>
        <nav style={{
          maxWidth: 1280, margin: "0 auto", padding: "0 32px",
          height: 72, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <DeltLogo />

          <div style={{ display: "flex", alignItems: "center", gap: 36, position: "relative" }}>
            {/* Solutions */}
            <div style={{ position: "relative" }}
              onMouseEnter={() => handleOpen("solutions")}
              onMouseLeave={handleClose}
            >
              <NavItem label="Solutions" hasDropdown active={openDropdown === "solutions"} />
              {openDropdown === "solutions" && (
                <div onMouseEnter={handleDropdownEnter} onMouseLeave={handleClose}
                  style={{ position: "absolute", top: "100%", left: -120, paddingTop: 10, zIndex: 100 }}>
                  <SolutionsDropdown />
                </div>
              )}
            </div>

            <NavItem label="Pricing" href="/pricing" />

            {/* Resources */}
            <div style={{ position: "relative" }}
              onMouseEnter={() => handleOpen("resources")}
              onMouseLeave={handleClose}
            >
              <NavItem label="Resources" hasDropdown active={openDropdown === "resources"} />
              {openDropdown === "resources" && (
                <div onMouseEnter={handleDropdownEnter} onMouseLeave={handleClose}
                  style={{ position: "absolute", top: "100%", right: -60, paddingTop: 10, zIndex: 100 }}>
                  <ResourcesDropdown />
                </div>
              )}
            </div>

            <NavItem label="Capital" href="/capital" />
          </div>

          {/* Utility */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a href="/contact" style={{
              fontSize: 14, fontWeight: 500, color: "#6B7280", textDecoration: "none",
              transition: "color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#1A1A2E"}
              onMouseLeave={e => e.currentTarget.style.color = "#6B7280"}
            >Contact Sales</a>

            <a href="/signin" style={{
              fontSize: 14, fontWeight: 500, color: "#1A1A2E", textDecoration: "none",
              transition: "color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#4318FF"}
              onMouseLeave={e => e.currentTarget.style.color = "#1A1A2E"}
            >Sign in</a>

            <a href="/get-started" style={{
              fontSize: 14, fontWeight: 700, color: "#fff",
              background: "linear-gradient(135deg, #4318FF 0%, #5B3AFF 100%)",
              padding: "9px 22px", borderRadius: 9, textDecoration: "none",
              whiteSpace: "nowrap", transition: "all 0.2s",
              boxShadow: "0 1px 3px rgba(67,24,255,0.15)",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "linear-gradient(135deg, #3610E0 0%, #4318FF 100%)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(67,24,255,0.25)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "linear-gradient(135deg, #4318FF 0%, #5B3AFF 100%)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(67,24,255,0.15)";
              }}
            >Get Started</a>
          </div>
        </nav>

        {openDropdown && (
          <div style={{
            position: "fixed", inset: 0, top: 72,
            background: "rgba(0,0,0,0.03)", zIndex: 40, pointerEvents: "none",
          }}/>
        )}
      </div>

      {/* Demo hero to show nav in context */}
      <div style={{
        background: "linear-gradient(180deg, #F0F2F8 0%, #FAFAFA 100%)",
        minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", padding: "80px 32px",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}>
        <div style={{ maxWidth: 660, textAlign: "center" }}>
          <h1 style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(38px, 5.5vw, 60px)", fontWeight: 400, fontStyle: "italic",
            color: "#1A1A2E", lineHeight: 1.1, marginBottom: 24, letterSpacing: "-1px",
          }}>
            Everything you need to run your business.
          </h1>
          <p style={{
            fontSize: 18, color: "#6B7280", lineHeight: 1.6,
            maxWidth: 500, margin: "0 auto 36px",
          }}>
            Payments, AI-powered tools, funding, and a website — one powerful platform built for modern businesses.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <a href="/get-started" style={{
              fontSize: 15, fontWeight: 700, color: "#fff",
              background: "linear-gradient(135deg, #4318FF 0%, #5B3AFF 100%)",
              padding: "14px 32px", borderRadius: 10, textDecoration: "none",
            }}>Get Started for Free</a>
            <a href="/demo" style={{
              fontSize: 15, fontWeight: 600, color: "#1A1A2E",
              border: "1.5px solid #D1D5DB", padding: "14px 32px",
              borderRadius: 10, textDecoration: "none", background: "#fff",
            }}>See a Demo</a>
          </div>
        </div>

        {/* Change log */}
        <div style={{
          marginTop: 80, background: "#fff", borderRadius: 12,
          border: "1px solid #E5E7EB", padding: "24px 32px",
          maxWidth: 640, width: "100%",
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "1.5px",
            textTransform: "uppercase", color: "#4318FF", marginBottom: 16,
          }}>What Changed in This Version</div>
          <div style={{ fontSize: 14, color: "#374151", lineHeight: 2 }}>
            <div style={{ display: "flex", gap: 10 }}><span style={{ color: "#10B981", fontWeight: 700 }}>+</span> Solutions mega-menu now 3 columns: outcomes, industries, featured panel</div>
            <div style={{ display: "flex", gap: 10 }}><span style={{ color: "#10B981", fontWeight: 700 }}>+</span> Business types now have descriptions (not bare text links)</div>
            <div style={{ display: "flex", gap: 10 }}><span style={{ color: "#10B981", fontWeight: 700 }}>+</span> Featured panel with social proof stat + merchant testimonial</div>
            <div style={{ display: "flex", gap: 10 }}><span style={{ color: "#10B981", fontWeight: 700 }}>+</span> Secondary links row: "How it works · Compare plans · See a demo"</div>
            <div style={{ display: "flex", gap: 10 }}><span style={{ color: "#10B981", fontWeight: 700 }}>+</span> Resources split into two columns: Learn + Support</div>
            <div style={{ display: "flex", gap: 10 }}><span style={{ color: "#10B981", fontWeight: 700 }}>+</span> Added "Blog" and "Status" pages to Resources for depth</div>
            <div style={{ display: "flex", gap: 10 }}><span style={{ color: "#4318FF", fontWeight: 700 }}>~</span> Icons: brand purple monochrome, consistent stroke weight</div>
          </div>
        </div>
      </div>
    </>
  );
}