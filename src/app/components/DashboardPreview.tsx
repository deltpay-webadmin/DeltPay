import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const BAR_HEIGHTS = [65, 45, 78, 55, 90, 72, 85, 60, 95, 48, 82, 70];

export function DashboardPreview() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 800); }, []);

  return (
    <div className="dp-wrapper">
      <div className="dp-frame">
        {/* Top bar */}
        <div className="dp-topbar">
          <div className="dp-topbar-left">
            <div className="dp-avatar">JM</div>
            <span className="dp-greeting">Good morning, Jessica</span>
          </div>
          <div className="dp-badge">New York</div>
        </div>

        {/* Body */}
        <div className="dp-body">
          <div className="dp-balance">
            <div className="dp-balance-label">Available balance</div>
            <div className="dp-balance-value">$12,384.23</div>
          </div>

          <div className="dp-actions">
            <button className="dp-action-btn dp-primary">Transfer $2,324.12</button>
            <button className="dp-action-btn dp-secondary">Send invoice</button>
            <button className="dp-action-btn dp-secondary">Take payment</button>
          </div>

          <div className="dp-cards">
            <div className="dp-card">
              <div className="dp-card-label">Net sales today</div>
              <div className="dp-card-value">$32,167</div>
              <div className="dp-card-trend dp-up">+12.4%</div>
            </div>
            <div className="dp-card">
              <div className="dp-card-label">Transactions</div>
              <div className="dp-card-value">847</div>
              <div className="dp-card-trend dp-up">+8.2%</div>
            </div>
          </div>

          <div className="dp-chart">
            <div className="dp-chart-header">
              <span className="dp-chart-title">Weekly revenue</span>
              <span className="dp-chart-period">Last 7 days</span>
            </div>
            <div className="dp-chart-bars">
              {BAR_HEIGHTS.map((h, i) => (
                <motion.div
                  key={i}
                  className="dp-bar"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: `${h}%`, transformOrigin: 'bottom' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lens AI floating card */}
      <motion.div
        className="dp-lens"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="dp-lens-header">
          <div className="dp-lens-icon">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="#fff">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <span className="dp-lens-name">Lens AI</span>
          <span className="dp-lens-context">Dashboard</span>
        </div>
        <div className="dp-lens-message">
          Revenue is trending <strong>7.2% above last month</strong>. Wednesday afternoons are your weakest window — consider a promo.
        </div>
      </motion.div>

      <style>{`
        .dp-wrapper {
          position: relative;
          display: inline-block;
          width: 100%;
          font-family: 'DM Sans', 'Plus Jakarta Sans', sans-serif;
          color: #fff;
          transform: scale(1.25);
          transform-origin: center;
        }
        .dp-frame {
          background: #FFFFFF;
          border: 1px solid #E9ECEF;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 80px rgba(73,69,255,0.08);
        }
        .dp-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid #E9ECEF;
        }
        .dp-topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dp-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #4945FF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
        }
        .dp-greeting {
          font-size: 13px;
          font-weight: 500;
          color: #334155;
        }
        @media (max-width: 768px) {
          .dp-greeting {
            display: none;
          }
        }
        .dp-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          color: #4945FF;
          background: rgba(73,69,255,0.08);
          padding: 4px 10px;
          border-radius: 100px;
        }
        .dp-body { padding: 20px; }
        .dp-balance { margin-bottom: 20px; }
        .dp-balance-label {
          font-size: 11px;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 4px;
        }
        .dp-balance-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 32px;
          font-weight: 800;
          color: #0F172A;
        }
        .dp-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }
        .dp-action-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        }
        .dp-primary {
          background: #4945FF;
          color: #fff;
        }
        .dp-secondary {
          background: #F8FAFC;
          color: #475569;
          border: 1px solid #E2E8F0;
        }
        .dp-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        .dp-card {
          background: #F8FAFC;
          border: 1px solid #E9ECEF;
          border-radius: 10px;
          padding: 14px;
        }
        .dp-card-label {
          font-size: 10px;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 6px;
        }
        .dp-card-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 18px;
          font-weight: 700;
          color: #0F172A;
        }
        .dp-card-trend {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          margin-top: 4px;
        }
        .dp-up { color: #16C784; }
        .dp-chart {
          background: #F8FAFC;
          border: 1px solid #E9ECEF;
          border-radius: 10px;
          padding: 14px;
        }
        .dp-chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .dp-chart-title {
          font-size: 10px;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: 'JetBrains Mono', monospace;
        }
        .dp-chart-period {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: #94A3B8;
          background: #F1F5F9;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .dp-chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 60px;
        }
        .dp-bar {
          flex: 1;
          background: #4945FF;
          border-radius: 3px 3px 0 0;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .dp-bar:hover { opacity: 1; }

        /* Lens AI */
        .dp-lens {
          position: absolute;
          bottom: -16px;
          right: -16px;
          background: #080A28;
          border: 1px solid rgba(73,69,255,0.3);
          border-radius: 14px;
          padding: 14px 18px;
          max-width: 260px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
          z-index: 2;
        }
        .dp-lens-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .dp-lens-icon {
          width: 20px;
          height: 20px;
          background: #4945FF;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dp-lens-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          color: #6B4FFF;
        }
        .dp-lens-context {
          font-size: 9px;
          color: #475569;
          margin-left: auto;
        }
        .dp-lens-message {
          font-size: 12px;
          line-height: 1.5;
          color: #94A3B8;
        }
        .dp-lens-message strong {
          color: #fff;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}