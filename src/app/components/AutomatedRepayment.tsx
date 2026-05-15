import { motion } from 'motion/react';

/* ════════════════════════════════════════════════════════════
   "Automated daily repayment" \u2014 Toast Capital inspired chart
   in Delt colors (#041E42 navy + #4945FF indigo, white BG).
   Shows 7 days of sales; Monday is closed (striped bar).
   Each bar has an indigo cap (the repayment slice) and a
   "+" badge \u2014 the visual cue that repayment scales with sales.
   ════════════════════════════════════════════════════════════ */

interface DayBar {
  day: string;
  /** Percent height of the full bar (sales) */
  sales: number;
  /** Percent height of the repayment cap (always < sales). 0 = closed */
  cap: number;
  closed?: boolean;
}

const DAYS: DayBar[] = [
  { day: 'Sunday', sales: 52, cap: 8 },
  { day: 'Monday', sales: 0, cap: 0, closed: true },
  { day: 'Tuesday', sales: 40, cap: 6 },
  { day: 'Wednesday', sales: 42, cap: 6 },
  { day: 'Thursday', sales: 58, cap: 9 },
  { day: 'Friday', sales: 75, cap: 12 },
  { day: 'Saturday', sales: 88, cap: 14 },
];

export function AutomatedRepayment({ hideTitle = false }: { hideTitle?: boolean }) {
  // Always render bars on mount — no scroll-trigger needed when embedded in a page section
  const inView = true;

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
          className="relative rounded-3xl overflow-hidden"
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
              return (
                <div
                  key={d.day}
                  className="relative flex-1 flex flex-col items-center justify-end h-full"
                >
                  {d.closed ? (
                    // Closed day \u2014 striped navy bar
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
                    // Open day \u2014 navy bar with indigo cap + indigo plus badge
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
                        {/* Main (sales slice) \u2014 navy */}
                        <div
                          style={{
                            flex: 1,
                            background: '#080A28',
                          }}
                        />
                      </motion.div>

                      {/* "+" badge floating over the cap seam */}
                      <motion.div
                        className="absolute left-1/2 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
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
                          boxShadow:
                            '0 4px 12px rgba(4,30,66,0.18), 0 0 0 4px rgba(73,69,255,0.08)',
                        }}
                      >
                        <div
                          className="rounded-full flex items-center justify-center"
                          style={{
                            width: 22,
                            height: 22,
                            background: '#4945FF',
                            color: '#FFFFFF',
                          }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </div>
                      </motion.div>
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

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10">
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
