import Earth from '@/app/components/ui/globe';
import { Sparkles } from '@/app/components/ui/sparkles';
import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Link } from 'react-router';

/* ──────────────────────────────────────────────────────────────
   GlobeStats — navy hero-style stats row over a spinning globe.
   Restored from the original homepage "By The Numbers" pattern.
   Plus Jakarta sans, deep navy ground, blue/violet markers.
   ────────────────────────────────────────────────────────────── */

const stats: { label: string; value: string; trait: string; long?: boolean }[] = [
  { label: 'Same-day approvals', value: '99%', trait: 'Approvals' },
  { label: 'Approval decisions', value: '1 hr', trait: 'Speed' },
  { label: 'Merchant funding (eligible)', value: 'Same-day', trait: 'Funding', long: true },
  { label: 'US-based support', value: '24/7/365', trait: 'Support', long: true },
];

const MARKERS = [
  { location: [38.9072, -77.0369], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [51.5074, -0.1278], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [48.8566, 2.3522], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [52.52, 13.405], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [41.9028, 12.4964], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [40.4168, -3.7038], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [55.7558, 37.6173], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [39.9042, 116.4074], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [35.6762, 139.6503], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [37.5665, 126.978], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [28.6139, 77.209], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [-33.8688, 151.2093], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [-15.7975, -47.8919], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [19.4326, -99.1332], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [45.4215, -75.6972], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [-34.6037, -58.3816], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [30.0444, 31.2357], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [-1.2921, 36.8219], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [-33.9249, 18.4241], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [6.5244, 3.3792], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [1.3521, 103.8198], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [13.7563, 100.5018], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [3.139, 101.6869], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [-6.2088, 106.8456], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [14.5995, 120.9842], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [41.0082, 28.9784], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [59.3293, 18.0686], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [60.1699, 24.9384], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [50.0755, 14.4378], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [52.2297, 21.0122], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [-22.9068, -43.1729], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [-33.4489, -70.6693], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [4.711, -74.0721], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [-12.0464, -77.0428], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [24.7136, 46.6753], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [25.2048, 55.2708], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [35.6892, 51.389], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [33.3152, 44.3661], size: 0.015, color: [0.286, 0.271, 1] },
  { location: [31.7683, 35.2137], size: 0.015, color: [0.286, 0.271, 1] },
] as { location: [number, number]; size: number; color: [number, number, number] }[];

export function GlobeStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <>
      <section className="gs-section" ref={ref}>
        <div className="gs-card">
          {/* Stats row — top of section */}
          <div className="gs-stats">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="gs-stat"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="gs-stat-label">{stat.label}</span>
                <span className={stat.long ? 'gs-stat-value gs-stat-value-long' : 'gs-stat-value'}>{stat.value}</span>
                <span className="gs-stat-trait">{stat.trait}</span>
              </motion.div>
            ))}
          </div>

          {/* Globe area */}
          <div className="gs-globe-area">
            <div className="gs-globe-text">
              <motion.h2
                className="gs-globe-heading"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                Fewer tools.<br />More money. Less stress.
              </motion.h2>
              <motion.p
                className="gs-globe-sub"
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.65, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                Trusted by 10,000+ businesses worldwide.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ marginTop: 28 }}
              >
                <Link to="/contact" className="gs-schedule-btn">
                  Schedule a call <span className="gs-schedule-arrow">›</span>
                </Link>
              </motion.div>
            </div>

            {/* Globe — large enough to fill the section width, bottom third clipped */}
            <motion.div
              className="gs-globe-wrap"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 1.5 }}
            >
              <Earth
                dark={1}
                scale={1.1}
                baseColor={[0.4, 0.6509, 1]}
                glowColor={[0.2745, 0.5765, 0.898]}
                markerColor={[0.3, 0.5, 1]}
                mapBrightness={6}
                mapSamples={40000}
                diffuse={1.2}
                className="w-full h-full"
                markerElevation={0}
                markers={MARKERS}
              />
            </motion.div>

            {/* Gradient fade — bottom of globe dissolves into navy */}
            <div className="gs-globe-fade" />

            {/* Sparkles */}
            <div className="gs-sparkles-wrap">
              <Sparkles
                density={600}
                speed={0.8}
                size={1}
                direction="top"
                opacitySpeed={1.5}
                color="#4A7BFF"
                className="absolute inset-0 w-full h-full"
              />
              <div className="gs-sparkles-glow" />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .gs-section {
          background: #080A28;
          padding: 0 48px 0;
          position: relative;
          overflow: hidden;
        }

        .gs-card {
          max-width: 1600px;
          margin: 0 auto;
          background: transparent;
          border: none;
          border-radius: 0;
          padding: 48px 64px 0;
          position: relative;
        }

        .gs-stats {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin: 0 0 72px;
          padding: 0 8%;
        }
        .gs-stat {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 0 0 auto;
        }
        .gs-stat:last-child {
          align-items: flex-end;
          text-align: right;
        }
        .gs-stat:nth-child(2),
        .gs-stat:nth-child(3) {
          align-items: center;
          text-align: center;
        }
        .gs-stat-label {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.35);
        }
        .gs-stat-value {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1;
          white-space: nowrap;
        }
        /* Longer word/values (Same-day, 24/7/365) — scale down so they fit on one line */
        .gs-stat-value-long {
          font-size: clamp(1.75rem, 3.2vw, 2.6rem);
        }
        .gs-stat-trait {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #16C784;
        }

        /* Globe layout */
        .gs-globe-area {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .gs-globe-text {
          position: relative;
          text-align: center;
          z-index: 5;
          padding-bottom: 32px;
        }

        /*
         * Globe is 90vw wide so it fills the section nicely — clearly readable as a sphere.
         * Bottom ~30% is hidden by negative margin + clipped by section overflow:hidden.
         * Gradient fade softens the cut.
         */
        .gs-globe-wrap {
          width: 90vw;
          height: 90vw;
          max-width: 1200px;
          max-height: 1200px;
          margin-top: 16px;
          /* Hide roughly the bottom 30% */
          margin-bottom: -28vw;
          position: relative;
          z-index: 2;
          flex-shrink: 0;
        }

        /* Smooth bottom fade */
        .gs-globe-fade {
          position: absolute;
          bottom: 0;
          left: -48px;
          right: -48px;
          height: 22vw;
          background: linear-gradient(to bottom, rgba(8,10,40,0) 0%, rgba(8,10,40,0.75) 60%, #080A28 90%);
          pointer-events: none;
          z-index: 3;
        }

        .gs-globe-heading {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin: 0 0 16px;
        }
        .gs-globe-sub {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }
        .gs-schedule-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 12px 28px;
          border-radius: 999px;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .gs-schedule-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.2);
        }
        .gs-schedule-arrow {
          font-size: 18px;
          transition: transform 0.2s;
        }
        .gs-schedule-btn:hover .gs-schedule-arrow {
          transform: translateX(2px);
        }

        /* Sparkles */
        .gs-sparkles-wrap {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        .gs-sparkles-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 60%;
          background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(74,123,255,0.15), transparent 70%);
          pointer-events: none;
          filter: blur(40px);
        }

        @media (max-width: 900px) {
          .gs-section { padding: 0 16px; }
          .gs-card { padding: 40px 24px 0; }
          .gs-stats { flex-wrap: wrap; gap: 32px; margin-bottom: 60px; }
          .gs-globe-wrap {
            width: 96vw;
            height: 96vw;
            margin-bottom: -32vw;
          }
          .gs-globe-fade { height: 28vw; left: -16px; right: -16px; }
        }
      `}</style>
    </>
  );
}

export default GlobeStats;
