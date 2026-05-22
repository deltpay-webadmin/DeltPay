import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/* ════════════════════════════════════════════════════════════
   "Automated daily repayment" — Toast Capital inspired chart
   in Delt colors (#041E42 navy + #4945FF indigo, white BG).
   Shows 7 days of sales; Monday is closed (striped bar).
   Each bar has an indigo cap (the repayment slice) and a
   "+" badge — click it to open a popover showing the
   day's illustrative card sales and hold-back math.
   ════════════════════════════════════════════════════════════ */

interface DayBar {
  day: string;
  /** Percent height of the full bar (sales) */
  sales: number;
  /** Percent height of the repayment cap (always < sales). 0 = closed */
  cap: number;
  closed?: boolean;
  /** Illustrative dollar values shown in the tooltip */
  salesUsd?: number;
  repayUsd?: number;
}

/* Illustrative figures only — repayment ≈ 12% hold-back rate for the demo. */
const DAYS: DayBar[] = [
  { day: 'Sunday',    sales: 52, cap: 8,  salesUsd: 3120, repayUsd: 374 },
  { day: 'Monday',    sales: 0,  cap: 0,  closed: true },
  { day: 'Tuesday',   sales: 40, cap: 6,  salesUsd: 2400, repayUsd: 288 },
  { day: 'Wednesday', sales: 42, cap: 6,  salesUsd: 2520, repayUsd: 302 },
  { day: 'Thursday',  sales: 58, cap: 9,  salesUsd: 3480, repayUsd: 418 },
  { day: 'Friday',    sales: 75, cap: 12, salesUsd: 4500, repayUsd: 540 },
  { day: 'Saturday',  sales: 88, cap: 14, salesUsd: 5280, repayUsd: 634 },
];

const fmtUsd = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function AutomatedRepayment({ hideTitle = false }: { hideTitle?: boolean }) {
  // Always render bars on mount — no scroll-trigger needed when embedded in a page section
  const inView = true;

  // Index of the open popover (null = none). Saturday (i=6) starts open as a hint.
  const [activeIdx, setActiveIdx] = useState<number | null>(6);
  const chartRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click + Escape
  useEffect(() => {
    if (activeIdx === null) return;
    const onClick = (e: MouseEvent) => {
      if (!chartRef.current) return;
      if (!chartRef.current.contains(e.target as Node)) setActiveIdx(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIdx(null);
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [activeIdx]);

  return (
    <section style={{ background: '#FFFFFF', padding: '48px 24px 64px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header — suppressed when parent section already has this heading */}
        {!hideTitle && (
          <div className="text-center mb-16">
            <div
              className="text-[12px] font-bold uppercase text-[#4945FF] mb-4"
              style={{ letterSpacing: '0.2em' }}
            >
              Delt Capital
            </div>
            <h2
              className="text-[#041E42] font-bold leading-[1.1] mb-6"
              style={{
                fontSize: 'clamp(36px, 5vw, 58px)',
                letterSpacing: '-0.025em',
              }}
            >
              Automated daily repayment.
            </h2>
            <p
              className="text-[#5b6478] mx-auto"
              style={{
                fontSize: 'clamp(16px, 1.3vw, 19px)',
                lineHeight: 1.6,
                maxWidth: 720,
              }}
            >
              Unpredictability is predictable. Delt Capital repayment flexes with your cash flow
              — on strong days you pay a little more, on slow days you pay a little less. Nothing
              to schedule, nothing to remember.
            </p>
          </div>
        )}

        {/* Chart */}
        <div
          ref={chartRef}
          className="relative rounded-3xl"
          style={{
            background: 'linear-gradient(180deg, #F7F7FB 0%, #EEEDF9 100%)',
            padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 48px) clamp(24px, 4vw, 40px)',
            border: '1px solid rgba(4,30,66,0.06)',
          }}
        >
          {/* Grid lines */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: 'clamp(32px, 5vw, 64px)',
              bottom: 'clamp(60px, 6vw, 80px)',
            }}
          >
            {[0.25, 0.5, 0.75].map((t) => (
              <div
                key={t}
                className="absolute left-0 right-0"
                style={{
                  top: `${t * 100}%`,
                  height: 1,
                  background: 'rgba(4,30,66,0.08)',
                }}
              />
            ))}
          </div>

          {/* Bars container */}
          <div
            className="relative flex items-end justify-between gap-[clamp(6px,1.5vw,18px)]"
            style={{ height: 'clamp(260px, 38vw, 380px)' }}
          >
            {DAYS.map((d, i) => {
              const total = d.closed ? 96 : d.sales + d.cap;
              const isOpen = activeIdx === i;
              // Position popover to the LEFT for the last two bars so it doesn't clip
              const popoverSide: 'left' | 'right' = i >= 5 ? 'left' : 'right';
              return (
                <div
                  key={d.day}
                  className="relative flex-1 flex flex-col items-center justify-end h-full"
                >
                  {d.closed ? (
                    // Closed day — striped navy bar
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={inView ? { scaleY: 1 } : {}}
                      transition={{
                        duration: 0.7,
                        delay: 0.1 + i * 0.06,
                        ease: [0.22, 0.9, 0.3, 1],
                      }}
                      style={{
                        width: '100%',
                        maxWidth: 88,
                        height: `${total}%`,
                        borderRadius: '10px 10px 0 0',
                        background:
                          'repeating-linear-gradient(45deg, rgba(4,30,66,0.18) 0, rgba(4,30,66,0.18) 6px, rgba(4,30,66,0.32) 6px, rgba(4,30,66,0.32) 12px)',
                        transformOrigin: 'bottom',
                        border: '1px solid rgba(4,30,66,0.22)',
                        borderBottom: 'none',
                      }}
                    />
                  ) : (
                    // Open day — navy bar with indigo cap + interactive plus badge
                    <>
                      <motion.div
                        className="relative w-full flex flex-col"
                        style={{ maxWidth: 88, height: `${total}%` }}
                        initial={{ scaleY: 0 }}
                        animate={inView ? { scaleY: 1 } : {}}
                        transition={{
                          duration: 0.7,
                          delay: 0.1 + i * 0.06,
                          ease: [0.22, 0.9, 0.3, 1],
                        }}
                      >
                        {/* Cap (repayment slice) */}
                        <div
                          style={{
                            height: `${(d.cap / total) * 100}%`,
                            background: '#4945FF',
                            borderRadius: '10px 10px 0 0',
                            boxShadow: '0 -4px 14px rgba(73,69,255,0.35)',
                          }}
                        />
                        {/* Main (sales slice) — navy */}
                        <div
                          style={{
                            flex: 1,
                            background: '#080A28',
                          }}
                        />
                      </motion.div>

                      {/* Interactive "+" badge floating over the cap seam */}
                      <motion.button
                        type="button"
                        aria-label={`${d.day} breakdown`}
                        aria-expanded={isOpen}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIdx(isOpen ? null : i);
                        }}
                        className="absolute left-1/2 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.3 + i * 0.06,
                          type: 'spring',
                          stiffness: 300,
                          damping: 22,
                        }}
                        style={{
                          bottom: `calc(${d.sales}% - 18px)`,
                          transform: 'translateX(-50%)',
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: '#FFFFFF',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          boxShadow: isOpen
                            ? '0 6px 18px rgba(4,30,66,0.22), 0 0 0 4px rgba(73,69,255,0.22)'
                            : '0 4px 12px rgba(4,30,66,0.18), 0 0 0 4px rgba(73,69,255,0.08)',
                          zIndex: isOpen ? 20 : 10,
                          transition: 'box-shadow 180ms ease',
                        }}
                      >
                        <div
                          className="rounded-full flex items-center justify-center"
                          style={{
                            width: 22,
                            height: 22,
                            background: '#4945FF',
                            color: '#FFFFFF',
                            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                            transition: 'transform 220ms cubic-bezier(0.22, 0.9, 0.3, 1)',
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </div>
                      </motion.button>

                      {/* Tooltip popover */}
                      <AnimatePresence>
                        {isOpen && d.salesUsd != null && d.repayUsd != null && (
                          <motion.div
                            key="popover"
                            initial={{ opacity: 0, y: 6, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            transition={{ duration: 0.18, ease: [0.22, 0.9, 0.3, 1] }}
                            role="dialog"
                            aria-label={`${d.day} hold-back breakdown`}
                            className="absolute"
                            style={{
                              bottom: `calc(${d.sales}% + 22px)`,
                              [popoverSide === 'right' ? 'left' : 'right']: 'calc(50% - 18px)',
                              width: 220,
                              padding: '14px 16px',
                              borderRadius: 14,
                              background: '#FFFFFF',
                              border: '1px solid rgba(4,30,66,0.10)',
                              boxShadow:
                                '0 12px 32px rgba(4,30,66,0.16), 0 2px 6px rgba(4,30,66,0.06)',
                              zIndex: 30,
                              textAlign: 'left',
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: '#4945FF',
                                marginBottom: 8,
                              }}
                            >
                              {d.day}
                            </div>

                            <div
                              className="flex items-center justify-between"
                              style={{ marginBottom: 6 }}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 2,
                                    background: '#080A28',
                                    display: 'inline-block',
                                  }}
                                />
                                <span style={{ fontSize: 12.5, color: '#475569' }}>Card sales</span>
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#041E42' }}>
                                {fmtUsd(d.salesUsd)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 2,
                                    background: '#4945FF',
                                    display: 'inline-block',
                                  }}
                                />
                                <span style={{ fontSize: 12.5, color: '#475569' }}>Hold-back</span>
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#4945FF' }}>
                                {fmtUsd(d.repayUsd)}
                              </span>
                            </div>

                            <div
                              style={{
                                marginTop: 10,
                                paddingTop: 10,
                                borderTop: '1px solid rgba(4,30,66,0.08)',
                                fontSize: 11,
                                color: '#94A3B8',
                                lineHeight: 1.4,
                              }}
                            >
                              ~12% of the day's card volume — illustrative only.
                            </div>

                            {/* Caret pointing down to the badge */}
                            <div
                              style={{
                                position: 'absolute',
                                bottom: -6,
                                [popoverSide === 'right' ? 'left' : 'right']: 18,
                                width: 12,
                                height: 12,
                                background: '#FFFFFF',
                                borderRight: '1px solid rgba(4,30,66,0.10)',
                                borderBottom: '1px solid rgba(4,30,66,0.10)',
                                transform: 'rotate(45deg)',
                              }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Axis line */}
          <div
            className="relative mt-[6px]"
            style={{ height: 1, background: 'rgba(8,10,40,0.4)' }}
          />

          {/* Day labels */}
          <div className="flex justify-between gap-[clamp(6px,1.5vw,18px)] mt-5">
            {DAYS.map((d) => (
              <div
                key={d.day}
                className="flex-1 text-center"
                style={{
                  fontSize: 'clamp(11px, 1.1vw, 14px)',
                  color: d.closed ? 'rgba(8,10,40,0.5)' : '#041E42',
                  fontWeight: d.closed ? 500 : 600,
                  letterSpacing: '-0.01em',
                }}
              >
                {d.day}
                {d.closed && (
                  <div
                    className="text-[10px] font-medium mt-0.5"
                    style={{ color: 'rgba(8,10,40,0.4)', letterSpacing: '0.05em' }}
                  >
                    CLOSED
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hint row + Legend */}
        <div
          className="text-center text-[12px] mt-6"
          style={{ color: '#94A3B8', letterSpacing: '0.02em' }}
        >
          Tap any <span style={{ color: '#4945FF', fontWeight: 600 }}>+</span> to see the day's breakdown.
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-4">
          <div className="flex items-center gap-2.5">
            <div
              className="rounded"
              style={{ width: 14, height: 14, background: '#080A28' }}
            />
            <span className="text-[14px] text-[#041E42] font-medium">Daily sales</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className="rounded"
              style={{ width: 14, height: 14, background: '#4945FF' }}
            />
            <span className="text-[14px] text-[#041E42] font-medium">Flexible repayment</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className="rounded border"
              style={{
                width: 14,
                height: 14,
                background:
                  'repeating-linear-gradient(45deg, rgba(4,30,66,0.18) 0, rgba(4,30,66,0.18) 2px, rgba(4,30,66,0.32) 2px, rgba(4,30,66,0.32) 4px)',
                borderColor: 'rgba(4,30,66,0.22)',
              }}
            />
            <span className="text-[14px] text-[#041E42] font-medium">Days closed = $0</span>
          </div>
        </div>
      </div>
    </section>
  );
}
