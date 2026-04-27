import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import deltLogo from 'figma:asset/0aad79b0de2748db75d51dfc7d33d272c0c47310.png';

/* ─────────────────────────────────────────────────────────
   Mini bar chart helper
───────────────────────────────────────────────────────── */
function MiniBar({ bars, color = '#4945FF' }: { bars: number[]; color?: string }) {
  const max = Math.max(...bars);
  return (
    <svg viewBox={`0 0 ${bars.length * 10} 44`} className="w-full" style={{ height: 44 }} preserveAspectRatio="none">
      {bars.map((v, i) => {
        const h = (v / max) * 38;
        return (
          <rect
            key={i}
            x={i * 10 + 1}
            y={44 - h}
            width="7"
            height={h}
            rx="1.5"
            fill={color}
            opacity={0.7 + (i / bars.length) * 0.3}
          />
        );
      })}
    </svg>
  );
}

function MiniLine({ pts, color = '#4945FF' }: { pts: number[]; color?: string }) {
  const max = Math.max(...pts), min = Math.min(...pts), range = max - min || 1;
  const W = 120, H = 44, pad = 4;
  const coords = pts.map((v, i) => ({
    x: (i / (pts.length - 1)) * W,
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }));
  let d = `M${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const p = coords[i - 1], c = coords[i];
    const cx1 = p.x + (c.x - p.x) * 0.4;
    const cx2 = c.x - (c.x - p.x) * 0.4;
    d += ` C${cx1},${p.y} ${cx2},${c.y} ${c.x},${c.y}`;
  }
  const areaD = d + ` L${coords[coords.length - 1].x},${H} L${coords[0].x},${H} Z`;
  const uid = 'dlp-line';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 44 }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${uid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2.5" fill="white" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

const BARS = [42, 48, 45, 50, 38, 52, 55, 44, 47, 53, 49, 56];
const LINE_PTS = [800, 950, 700, 1200, 1050, 900, 1100, 850, 1300, 1000, 750, 1150];

const CUSTOMERS = [
  { name: 'Aaron Dias...', email: 'aaron@gm...', loc: 'M' },
  { name: 'Camille Ver...', email: 'vergara_cm...', loc: 'A' },
  { name: 'Jake Ande...', email: 'jake2003@...', loc: 'A' },
  { name: 'Joan Grau', email: 'jgrau_259...', loc: 'A' },
];

const TASKS = [
  { initials: 'L',  title: 'Time off request',   meta: 'Lauren Hill · Chicago · By Aug 15', action: 'Review' },
  { initials: 'MT', title: 'Shift trade request', meta: 'Mike Thurman · LA · By Aug 15',    action: 'View'   },
];

const NAV = [
  { label: 'Dashboard',  active: true  },
  { label: 'Payments',   active: false },
  { label: 'Insights',   active: false },
  { label: 'Cash Flow',  active: false },
  { label: 'Customers',  active: false },
  { label: 'Catalog',    active: false },
  { label: 'Storefront', active: false },
  { label: 'Capital',    active: false },
  { label: 'Lens AI',    active: false },
];

/* ─────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────── */
export function DashboardLitePreview({ onClickOverride }: { onClickOverride?: () => void }) {
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const [ctaPos, setCtaPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setCtaPos({
        x: Math.min(Math.max(x, 12), 88),
        y: Math.min(Math.max(y, 8), 92),
      });
    });
  }, []);

  const handleClick = () => {
    if (onClickOverride) onClickOverride();
    else navigate('/demo');
  };

  return (
    <div
      ref={containerRef}
      className="dlp-root"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ userSelect: 'none' }}
    >
      {/* ── outer chrome ── */}
      <div className="dlp-chrome">

        {/* ─── Top banner ─── */}
        <div className="dlp-banner">
          <span className="dlp-banner-text">Like what you see? Start your free trial and use your own data.</span>
          <button className="dlp-banner-btn">Start Free Trial</button>
        </div>

        {/* ─── App shell ─── */}
        <div className="dlp-shell">

          {/* Sidebar */}
          <aside className="dlp-sidebar">
            <div className="dlp-logo-wrap">
              <img src={deltLogo} alt="Delt" className="dlp-logo" />
            </div>

            <div className="dlp-search">
              <svg className="dlp-search-icon" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="5.5" stroke="#999" strokeWidth="1.5" />
                <path d="M13.5 13.5 L17 17" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="dlp-search-ph">Search</span>
            </div>

            <nav className="dlp-nav">
              {NAV.map((item) => (
                <div
                  key={item.label}
                  className={`dlp-nav-item ${item.active ? 'dlp-nav-item--active' : ''}`}
                >
                  <div className="dlp-nav-icon-box" />
                  <span>{item.label}</span>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main className="dlp-main">
            <div className="dlp-topbar">
              <span className="dlp-page-title">Dashboard</span>
              <div className="dlp-topbar-right">
                <div className="dlp-topbar-icon">
                  <svg viewBox="0 0 20 20" fill="none" className="w-full h-full">
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <button className="dlp-quick-action">
                  <span className="dlp-qa-plus">+</span> Quick Action
                </button>
              </div>
            </div>

            <div className="dlp-content">
              <div className="dlp-location">
                <span className="dlp-location-label">Location</span>
                <span className="dlp-location-val">New York</span>
                <svg viewBox="0 0 12 8" fill="none" className="dlp-chevron">
                  <path d="M1 1.5l5 4 5-4" stroke="#555" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>

              <h2 className="dlp-greeting">Hello! You have <span className="dlp-amount">$12,384.23</span> available.</h2>

              <div className="dlp-actions">
                <button className="dlp-btn-primary">Transfer $2,324.12 now</button>
                <button className="dlp-btn-outline">Send an invoice</button>
                <button className="dlp-btn-outline">Take a payment</button>
                <button className="dlp-btn-more">···</button>
              </div>

              <div className="dlp-pinned-header">
                <div className="dlp-pin-icon" />
                <span className="dlp-pinned-title">Pinned data</span>
                <span className="dlp-pinned-count">5 items</span>
                <div className="dlp-pinned-right">
                  <span className="dlp-auto-update">⟳ Auto-updating</span>
                  <span className="dlp-see-all">See all ↑</span>
                </div>
              </div>

              <div className="dlp-cards">
                <div className="dlp-card">
                  <div className="dlp-card-header">
                    <div>
                      <div className="dlp-card-title">Weekly Sales by Location</div>
                      <div className="dlp-card-sub">Last 4 months</div>
                    </div>
                    <div className="dlp-card-dot" />
                  </div>
                  <div className="dlp-card-timestamp">⟳ Updated 2 min ago · Auto-refreshes</div>
                  <div className="dlp-chart-wrap">
                    <MiniBar bars={BARS} color="#4945FF" />
                  </div>
                </div>

                <div className="dlp-card">
                  <div className="dlp-card-header">
                    <div>
                      <div className="dlp-card-title">Customers with spend o...</div>
                      <div className="dlp-card-sub">Last 60 days</div>
                    </div>
                    <div className="dlp-card-dot" />
                  </div>
                  <div className="dlp-card-timestamp">⟳ Updated 5 min ago · Auto-refreshes</div>
                  <div className="dlp-table">
                    <div className="dlp-table-head">
                      <span>Name</span><span>Email</span><span>Loc</span>
                    </div>
                    {CUSTOMERS.map((c, i) => (
                      <div key={i} className="dlp-table-row">
                        <span className="dlp-table-name">{c.name}</span>
                        <span className="dlp-table-email">{c.email}</span>
                        <span>{c.loc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dlp-card">
                  <div className="dlp-card-header">
                    <div>
                      <div className="dlp-card-title">Weekly Sales of Top Mo...</div>
                      <div className="dlp-card-sub">Last 6 months</div>
                    </div>
                    <div className="dlp-card-dot" />
                  </div>
                  <div className="dlp-card-timestamp">⟳ Updated 3 min ago · Auto-refreshes</div>
                  <div className="dlp-chart-wrap">
                    <MiniLine pts={LINE_PTS} color="#4945FF" />
                  </div>
                </div>
              </div>

              <div className="dlp-more-pinned">+2 more pinned items · Click to manage</div>

              <div className="dlp-tasks-section">
                <div className="dlp-tasks-title">4 Tasks</div>
                {TASKS.map((t, i) => (
                  <div key={i} className="dlp-task">
                    <div className="dlp-task-avatar">{t.initials}</div>
                    <div className="dlp-task-info">
                      <div className="dlp-task-name">{t.title}</div>
                      <div className="dlp-task-meta">{t.meta}</div>
                    </div>
                    <span className="dlp-task-action">{t.action}</span>
                  </div>
                ))}
                <div className="dlp-see-more">↓ See 2 more</div>
              </div>

              <div className="dlp-perf-section">
                <div className="dlp-perf-title">Performance</div>
                <div className="dlp-perf-tabs">
                  {['Date', 'Today', 'This week', 'Checks', 'Closed', 'Open'].map((tab, i) => (
                    <span
                      key={tab}
                      className={`dlp-perf-tab ${i === 1 ? 'dlp-perf-tab--active' : ''} ${tab === 'Closed' ? 'dlp-perf-tab--closed' : ''}`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
                <div className="dlp-perf-label">Net sales</div>
                <div className="dlp-perf-bars">
                  {[30, 60, 80, 85, 65, 70, 92, 87, 45, 30].map((h, i) => (
                    <div key={i} className="dlp-perf-bar-col">
                      <div className="dlp-perf-bar" style={{ height: `${h}%` }} />
                      <div className="dlp-perf-bar-ghost" style={{ height: `${h * 0.4}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <style>{`
        .dlp-root {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          box-shadow:
            0 2px 8px rgba(0,0,0,0.06),
            0 16px 56px rgba(0,0,0,0.10),
            0 40px 100px rgba(73,69,255,0.07);
        }

        .dlp-chrome {
          background: #041E42;
          padding: 12px;
          border-radius: 16px;
        }

        /* ── Banner ── */
        .dlp-banner {
          background: #4945FF;
          padding: 7px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          border-radius: 8px 8px 0 0;
        }
        .dlp-banner-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          color: rgba(255,255,255,0.92);
        }
        .dlp-banner-btn {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          background: white;
          color: #4945FF;
          border: none;
          border-radius: 5px;
          padding: 4px 10px;
          cursor: pointer;
          white-space: nowrap;
        }

        /* ── Shell ── */
        .dlp-shell {
          display: flex;
          background: white;
          border-radius: 0 0 8px 8px;
          overflow: hidden;
          min-height: 480px;
        }

        /* ── Sidebar ── */
        .dlp-sidebar {
          width: 120px;
          flex-shrink: 0;
          background: #FAFAFA;
          border-right: 1px solid #EFEFEF;
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        .dlp-logo-wrap {
          height: 40px;
          padding: 0 12px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #EFEFEF;
          margin-bottom: 10px;
          flex-shrink: 0;
        }
        .dlp-logo { height: 20px; object-fit: contain; }

        .dlp-search {
          margin: 0 8px 8px;
          display: flex;
          align-items: center;
          gap: 5px;
          background: white;
          border: 1px solid #E8E8E8;
          border-radius: 7px;
          padding: 5px 8px;
          transition: background 0.15s;
        }
        .dlp-search:hover { background: #F3F4F6; }
        .dlp-search-icon { width: 10px; height: 10px; flex-shrink: 0; }
        .dlp-search-ph {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 9px;
          color: #BBB;
        }

        /* Nav */
        .dlp-nav { display: flex; flex-direction: column; gap: 1px; padding: 0 6px; }
        .dlp-nav-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 6px;
          border-radius: 6px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 9px;
          color: #666;
          transition: background 0.12s;
        }
        .dlp-nav-item:hover { background: #F0F0F0; }
        .dlp-nav-item--active {
          background: #4945FF !important;
          color: white;
          font-weight: 600;
        }
        .dlp-nav-icon-box {
          width: 11px; height: 11px;
          border-radius: 2px;
          background: currentColor;
          opacity: 0.25;
          flex-shrink: 0;
        }
        .dlp-nav-item--active .dlp-nav-icon-box { opacity: 0.6; }

        /* ── Main ── */
        .dlp-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

        .dlp-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 40px;
          padding: 0 16px;
          border-bottom: 1px solid #F0F0F0;
        }
        .dlp-page-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          color: #888;
        }
        .dlp-topbar-right { display: flex; align-items: center; gap: 8px; }
        .dlp-topbar-icon {
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 1px solid #E8E8E8;
          color: #888;
          padding: 3px;
          transition: background 0.12s;
        }
        .dlp-topbar-icon:hover { background: #F0F0F0; }
        .dlp-quick-action {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #111;
          color: white;
          border: none;
          border-radius: 7px;
          padding: 5px 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 9px;
          font-weight: 600;
          transition: background 0.12s;
        }
        .dlp-quick-action:hover { background: #333; }
        .dlp-qa-plus { font-size: 11px; opacity: 0.8; }

        .dlp-content { padding: 12px 16px; overflow: hidden; }

        .dlp-location {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1px solid #E8E8E8;
          border-radius: 7px;
          padding: 4px 8px;
          margin-bottom: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 9px;
          transition: background 0.12s;
        }
        .dlp-location:hover { background: #F3F4F6; }
        .dlp-location-label { color: #999; }
        .dlp-location-val { color: #333; font-weight: 600; }
        .dlp-chevron { width: 8px; height: 8px; }

        .dlp-greeting {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #111;
          margin: 0 0 10px;
          letter-spacing: -0.3px;
          line-height: 1.25;
        }
        .dlp-amount { font-weight: 700; }

        .dlp-actions { display: flex; align-items: center; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
        .dlp-btn-primary {
          background: #4945FF;
          color: white;
          border: none;
          border-radius: 100px;
          padding: 6px 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
          transition: background 0.12s;
        }
        .dlp-btn-primary:hover { background: #3730FF; }
        .dlp-btn-outline {
          background: white;
          color: #333;
          border: 1px solid #E8E8E8;
          border-radius: 100px;
          padding: 6px 11px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 9px;
          font-weight: 500;
          white-space: nowrap;
          transition: background 0.12s;
        }
        .dlp-btn-outline:hover { background: #F3F4F6; }
        .dlp-btn-more {
          width: 26px; height: 26px;
          border-radius: 50%;
          border: 1px solid #E8E8E8;
          background: white;
          font-size: 12px;
          color: #999;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: -1px;
          transition: background 0.12s;
        }
        .dlp-btn-more:hover { background: #F3F4F6; }

        .dlp-pinned-header { display: flex; align-items: center; gap: 5px; margin-bottom: 8px; }
        .dlp-pin-icon { width: 10px; height: 10px; border-radius: 2px; background: #4945FF; opacity: 0.4; }
        .dlp-pinned-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #333;
        }
        .dlp-pinned-count {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 9px;
          color: #999;
        }
        .dlp-pinned-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
        .dlp-auto-update, .dlp-see-all {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 8.5px;
          color: #4945FF;
        }

        /* Cards */
        .dlp-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 6px; }
        .dlp-card {
          border: 1px solid #EBEBEB;
          border-radius: 10px;
          padding: 10px;
          background: white;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
        }
        .dlp-card:hover {
          background: #F8F8FA;
          border-color: #DCDCE0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .dlp-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 3px; }
        .dlp-card-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 8.5px;
          font-weight: 600;
          color: #111;
          line-height: 1.3;
        }
        .dlp-card-sub {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 8px;
          color: #999;
          margin-top: 1px;
        }
        .dlp-card-dot { width: 7px; height: 7px; border-radius: 50%; background: #4945FF; flex-shrink: 0; margin-top: 1px; }
        .dlp-card-timestamp {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 7.5px;
          color: #BBB;
          margin-bottom: 6px;
        }
        .dlp-chart-wrap { overflow: hidden; }

        /* Table */
        .dlp-table { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 7.5px; }
        .dlp-table-head {
          display: grid;
          grid-template-columns: 2fr 2fr 0.6fr;
          gap: 4px;
          color: #999;
          font-weight: 600;
          padding-bottom: 4px;
          border-bottom: 1px solid #F0F0F0;
          margin-bottom: 2px;
        }
        .dlp-table-row {
          display: grid;
          grid-template-columns: 2fr 2fr 0.6fr;
          gap: 4px;
          padding: 3px 0;
          border-bottom: 1px solid #F8F8F8;
          color: #555;
          transition: background 0.1s;
          border-radius: 3px;
        }
        .dlp-table-row:hover { background: #F5F5F8; }
        .dlp-table-name { color: #4945FF; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dlp-table-email { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .dlp-more-pinned {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 8px;
          color: #4945FF;
          text-align: center;
          margin-bottom: 12px;
        }

        /* Tasks */
        .dlp-tasks-section {
          border: 1px solid #EBEBEB;
          border-radius: 10px;
          padding: 10px 12px;
          margin-bottom: 10px;
        }
        .dlp-tasks-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #111;
          margin-bottom: 8px;
        }
        .dlp-task {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 4px;
          border-bottom: 1px solid #F5F5F5;
          border-radius: 6px;
          transition: background 0.12s;
        }
        .dlp-task:hover { background: #F3F4F6; }
        .dlp-task:last-of-type { border-bottom: none; }
        .dlp-task-avatar {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #E8E8E8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 7px;
          font-weight: 700;
          color: #555;
          flex-shrink: 0;
        }
        .dlp-task-info { flex: 1; min-width: 0; }
        .dlp-task-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 9px;
          font-weight: 600;
          color: #222;
        }
        .dlp-task-meta {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 7.5px;
          color: #999;
          margin-top: 1px;
        }
        .dlp-task-action {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 8.5px;
          font-weight: 600;
          color: #4945FF;
        }
        .dlp-see-more {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 8.5px;
          color: #4945FF;
          text-align: center;
          margin-top: 6px;
        }

        /* Performance */
        .dlp-perf-section {
          border: 1px solid #EBEBEB;
          border-radius: 10px;
          padding: 10px 12px;
        }
        .dlp-perf-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #111;
          margin-bottom: 8px;
        }
        .dlp-perf-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
        .dlp-perf-tab {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 8px;
          padding: 3px 7px;
          border-radius: 100px;
          border: 1px solid #E8E8E8;
          color: #666;
          transition: background 0.12s;
        }
        .dlp-perf-tab:hover { background: #F3F4F6; }
        .dlp-perf-tab--active {
          background: #111 !important;
          color: white;
          border-color: #111;
          font-weight: 600;
        }
        .dlp-perf-tab--closed {
          background: #4945FF !important;
          color: white;
          border-color: #4945FF;
          font-weight: 600;
        }
        .dlp-perf-label {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 8px;
          color: #999;
          margin-bottom: 6px;
        }
        .dlp-perf-bars { display: flex; align-items: flex-end; gap: 4px; height: 60px; }
        .dlp-perf-bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          height: 100%;
          justify-content: flex-end;
        }
        .dlp-perf-bar { background: #4945FF; border-radius: 2px 2px 0 0; min-height: 2px; }
        .dlp-perf-bar-ghost { background: rgba(73,69,255,0.2); min-height: 2px; }
      `}</style>
    </div>
  );
}