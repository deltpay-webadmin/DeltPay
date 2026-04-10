import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ── What-you-can-afford tiers (conservative estimates) ─────────────────── */

interface AffordItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  detail: string;
}

function BoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4945FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}
function MegaphoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4945FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4945FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function HammerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4945FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9"/><path d="M17.64 15L22 10.64"/><path d="M20.91 11.7a3 3 0 1 0-4.24-4.24l-1.42 1.42 4.24 4.24 1.42-1.42z"/>
    </svg>
  );
}
function StoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4945FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4945FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4945FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
function ZapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4945FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

function getTier(amount: number): { key: string; items: AffordItem[] } {
  if (amount < 22000) return {
    key: 'tier1',
    items: [
      { id: 'inv', icon: <BoxIcon />, label: 'Inventory restock', detail: 'Replenish 2–3 months of your top-selling SKUs' },
      { id: 'mkt', icon: <MegaphoneIcon />, label: 'Marketing campaign', detail: 'Paid social + creative assets for a full quarter' },
    ],
  };
  if (amount < 45000) return {
    key: 'tier2',
    items: [
      { id: 'bulk', icon: <BoxIcon />, label: 'Bulk inventory buy', detail: 'Stock ahead of peak season at volume pricing' },
      { id: 'hire', icon: <UsersIcon />, label: '1–2 new hires', detail: 'Full-time staff covered for 6+ months' },
    ],
  };
  if (amount < 80000) return {
    key: 'tier3',
    items: [
      { id: 'reno', icon: <HammerIcon />, label: 'Store renovation', detail: 'Full interior refresh, fixtures, and signage' },
      { id: 'team', icon: <UsersIcon />, label: '3–4 new hires', detail: 'Expand your floor, kitchen, or ops team' },
    ],
  };
  if (amount < 130000) return {
    key: 'tier4',
    items: [
      { id: 'equip', icon: <ZapIcon />, label: 'Major equipment upgrade', detail: 'Commercial-grade kitchen, machinery, or tech stack' },
      { id: 'dep', icon: <StoreIcon />, label: 'Second location deposit', detail: 'Secure lease + initial fit-out for a new space' },
    ],
  };
  if (amount < 190000) return {
    key: 'tier5',
    items: [
      { id: 'loc', icon: <StoreIcon />, label: 'New location build-out', detail: 'Lease, construction, permits, and opening inventory' },
      { id: 'fleet', icon: <TruckIcon />, label: 'Delivery fleet', detail: '3–4 branded vehicles, fully equipped and insured' },
    ],
  };
  return {
    key: 'tier6',
    items: [
      { id: 'flag', icon: <BuildingIcon />, label: 'Flagship location launch', detail: 'Full premium build-out in a high-traffic space' },
      { id: 'bigteam', icon: <UsersIcon />, label: 'Hire a full team', detail: '8–10 staff to run your expansion from day one' },
    ],
  };
}

export function FundingApplicationDemo() {
  const [fundingAmount, setFundingAmount] = useState(50000);
  const [isInView, setIsInView] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const progress = ((fundingAmount - 10000) / 240000) * 100;
  const tier = getTier(fundingAmount);

  // Visibility detection
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => setIsInView(e.isIntersecting)),
      { threshold: 0.5 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-play animation
  useEffect(() => {
    if (!isInView || !sliderRef.current) return;

    setFundingAmount(10000);
    setShowCursor(false);

    let animationFrame: number;
    let startTime: number | null = null;
    const duration = 6000;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const p = elapsed / duration;

      if (sliderRef.current && containerRef.current) {
        const sliderRect = sliderRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const sliderWidth = sliderRect.width - 20;

        if (p < 0.05) {
          setFundingAmount(10000);
          setShowCursor(true);
          setCursorPosition({
            x: sliderRect.left - containerRect.left + 20,
            y: sliderRect.top - containerRect.top + 10,
          });
        } else if (p < 0.45) {
          const eased = easeInOutCubic((p - 0.05) / 0.4);
          const val = Math.round(10000 + (240000) * eased);
          setFundingAmount(val);
          const sp = (val - 10000) / 240000;
          setCursorPosition({
            x: sliderRect.left - containerRect.left + 20 + sliderWidth * sp,
            y: sliderRect.top - containerRect.top + 10,
          });
        } else if (p < 0.55) {
          setFundingAmount(250000);
          setCursorPosition({
            x: sliderRect.left - containerRect.left + 20 + sliderWidth,
            y: sliderRect.top - containerRect.top + 10,
          });
        } else if (p < 0.95) {
          const eased = easeInOutCubic((p - 0.55) / 0.4);
          const val = Math.round(250000 - 240000 * eased);
          setFundingAmount(val);
          const sp = (val - 10000) / 240000;
          setCursorPosition({
            x: sliderRect.left - containerRect.left + 20 + sliderWidth * sp,
            y: sliderRect.top - containerRect.top + 10,
          });
        } else if (p >= 1.0) {
          setFundingAmount(10000);
          setShowCursor(false);
          return;
        } else {
          setFundingAmount(10000);
          setCursorPosition({
            x: sliderRect.left - containerRect.left + 20,
            y: sliderRect.top - containerRect.top + 10,
          });
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView]);

  return (
    <div
      ref={containerRef}
      className="relative bg-white rounded-2xl p-8 border border-[#E5E7EB]"
      style={{ boxShadow: '0 20px 60px rgba(4,30,66,0.10), 0 4px 16px rgba(4,30,66,0.06)' }}
    >
      {/* Fake cursor */}
      {showCursor && (
        <div
          className="absolute pointer-events-none z-50"
          style={{ left: `${cursorPosition.x}px`, top: `${cursorPosition.y}px`, transform: 'translate(-2px, -2px)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="#041E42" stroke="white" strokeWidth="1.5"/>
          </svg>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-[#041E42]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Funding Application
        </h3>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            background: 'rgba(34,197,94,0.1)',
            color: '#16A34A',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 999,
            padding: '4px 12px',
          }}
        >
          Approved
        </span>
      </div>

      {/* Amount + Slider */}
      <div className="mb-5">
        <div className="text-sm text-[#6B7280] mb-2">Funding Amount</div>
        <div
          className="text-3xl font-bold text-[#041E42] mb-4"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}
        >
          ${fundingAmount.toLocaleString()}
        </div>

        <div ref={sliderRef} className="relative">
          <input
            type="range"
            min="10000"
            max="250000"
            step="1000"
            value={fundingAmount}
            onChange={(e) => setFundingAmount(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer slider-funding"
            style={{
              background: `linear-gradient(to right, #4945FF 0%, #4945FF ${progress}%, #E5E7EB ${progress}%, #E5E7EB 100%)`,
            }}
          />
          <style>{`
            .slider-funding::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #4945FF;
              cursor: pointer;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(73,69,255,0.35);
            }
            .slider-funding::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #4945FF;
              cursor: pointer;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(73,69,255,0.35);
            }
          `}</style>
        </div>

        <div className="flex justify-between mt-2" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#9CA0AB' }}>
          <span>$10K</span>
          <span>$250K</span>
        </div>
      </div>

      {/* What you can afford */}
      <div className="mb-5">
        <div
          className="text-[11px] uppercase mb-3"
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', color: '#9CA0AB' }}
        >
          What you can unlock
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tier.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 gap-3"
          >
            {tier.items.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(73,69,255,0.04) 0%, rgba(73,69,255,0.08) 100%)',
                  border: '1px solid rgba(73,69,255,0.12)',
                  borderRadius: 12,
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(73,69,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                  }}
                >
                  {item.icon}
                </div>
                <div
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    color: '#041E42',
                    marginBottom: 4,
                    lineHeight: 1.25,
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.5 }}>
                  {item.detail}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <button
        className="w-full text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
        style={{ background: '#4945FF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Get My Funding Amount
      </button>
    </div>
  );
}
