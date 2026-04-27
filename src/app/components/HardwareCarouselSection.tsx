import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import mobileImg   from 'figma:asset/e3202fe2235abc07be703ccec24eca3b3bc18e03.png';
import handheldImg from 'figma:asset/20435ca9d80721b62fa49d033930eab021c2b23d.png';
import registerImg from 'figma:asset/9b5d95f36a51ff95c50792aa50ba94069496e249.png';

// ─── Slide data ───────────────────────────────────────────────────────────────

const SLIDES = [
  {
    id: 'mobile',
    title: 'One',
    subtitle: 'Mobile',
    description: 'Accept chip, swipe, and contactless',
    features: ['EMV certified', 'Bluetooth enabled', 'All-day battery'],
    img: mobileImg,
    imgScale: 1,
  },
  {
    id: 'handheld',
    title: 'Plus',
    subtitle: 'Handheld',
    description: 'Turn any counter into a payment terminal',
    features: ['No extra hardware', 'Instant activation', 'Secure & encrypted'],
    img: handheldImg,
    imgScale: 1.05,
  },
  {
    id: 'register',
    title: 'Max',
    subtitle: 'Register',
    description: 'Full-featured POS for high volume',
    features: ['Receipt printer', 'PIN pad built-in', 'Ethernet + WiFi'],
    img: registerImg,
    imgScale: 1.1,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSlideState(i: number, current: number, total: number): string {
  const diff = ((i - current) % total + total) % total;
  if (diff === 0) return 'current';
  if (diff === 1) return 'next';
  if (diff === total - 1) return 'previous';
  return 'hidden';
}

// ─── Arrow button ─────────────────────────────────────────────────────────────

function Arrow({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'left' ? 'Previous slide' : 'Next slide'}
      style={{
        background: 'none',
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
        opacity: 0.4,
        transition: 'opacity 0.25s, transform 0.25s',
        zIndex: 10,
        padding: '8px',
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = '0.4';
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {dir === 'left'
          ? <polyline points="15 18 9 12 15 6" />
          : <polyline points="9 6 15 12 9 18" />
        }
      </svg>
    </button>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

function HardwareCarousel() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = SLIDES.length;

  const go = useCallback((dir: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrent((c) => (c + dir + total) % total);
    setTimeout(() => setTransitioning(false), 800);
  }, [transitioning, total]);

  useEffect(() => {
    timerRef.current = setInterval(() => go(1), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [go]);

  const handleNav = (dir: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    go(dir);
    timerRef.current = setInterval(() => go(1), 5000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 0 0px',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        userSelect: 'none',
      }}
    >
      <style>{`
        :root {
          --hw-slide-width: min(28vw, 320px);
          --hw-slide-aspect: 3 / 4;
          --hw-dur: 800ms;
          --hw-ease: cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hw-slider {
          width: calc(3 * var(--hw-slide-width));
          display: flex;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hw-slides-wrapper {
          width: 100%;
          display: grid;
          place-items: center;
          position: relative;
          height: calc(var(--hw-slide-width) * 4 / 3 * 1.18);
          overflow: visible;
        }
        .hw-slides-wrapper > * { grid-area: 1 / -1; }

        /* ── Individual slide ── */
        .hw-slide {
          width: var(--hw-slide-width);
          aspect-ratio: var(--hw-slide-aspect);
          perspective: 1000px;
          transition: transform var(--hw-dur) var(--hw-ease), opacity var(--hw-dur) var(--hw-ease);
          pointer-events: none;
          border-radius: 20px;
          overflow: hidden;
        }

        .hw-slide[data-state="current"] {
          transform: perspective(1000px) translate3d(0, 0, 0) rotateY(0deg) scale(1.12);
          pointer-events: auto;
          z-index: 3;
        }
        .hw-slide[data-state="next"] {
          transform: perspective(1000px) translate3d(calc(var(--hw-slide-width) * 1.05), 0, 0) rotateY(-45deg) scale(1);
          z-index: 1;
        }
        .hw-slide[data-state="previous"] {
          transform: perspective(1000px) translate3d(calc(var(--hw-slide-width) * -1.05), 0, 0) rotateY(45deg) scale(1);
          z-index: 1;
        }
        .hw-slide[data-state="hidden"] {
          transform: perspective(1000px) translate3d(0, 0, -400px) scale(0.8);
          opacity: 0 !important;
          visibility: hidden;
          z-index: 0;
        }

        .hw-slide-inner {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 20px;
          background: rgba(255,255,255,0.06);
        }

        .hw-slide-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: filter var(--hw-dur) var(--hw-ease), opacity var(--hw-dur) var(--hw-ease);
        }
        .hw-slide[data-state="current"] .hw-slide-img {
          filter: drop-shadow(0 25px 60px rgba(0,0,0,0.6));
          opacity: 1;
        }
        .hw-slide:not([data-state="current"]) .hw-slide-img {
          filter: brightness(0.45) saturate(0.6);
          opacity: 0.55;
        }

        /* ── Text overlays ── */
        .hw-slide-info {
          width: var(--hw-slide-width);
          aspect-ratio: var(--hw-slide-aspect);
          position: relative;
          pointer-events: none;
          z-index: 10;
        }

        .hw-info-text-wrap {
          position: absolute;
          bottom: -18%;
          left: 0%;
          z-index: 2;
        }

        .hw-info-line {
          overflow: hidden;
        }

        .hw-info-line span {
          display: block;
          transition: opacity var(--hw-dur) var(--hw-ease), transform var(--hw-dur) var(--hw-ease);
        }

        .hw-slide-info[data-state="current"] .hw-info-line span {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          transition-delay: 250ms;
        }
        .hw-slide-info:not([data-state="current"]) .hw-info-line span {
          opacity: 0;
          transform: translate3d(0, 110%, 0);
          transition-delay: 0ms;
        }

        .hw-info-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(2.2rem, 4.5vw, 4rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.03em;
          text-transform: uppercase;
          line-height: 1.05;
        }

        .hw-info-subtitle {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(1.1rem, 2.2vw, 1.8rem);
          font-weight: 600;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          margin-left: 4px;
          line-height: 1.15;
          letter-spacing: 0.04em;
        }

        .hw-info-desc {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(0.68rem, 1.1vw, 0.88rem);
          font-weight: 400;
          color: rgba(255,255,255,0.38);
          margin-top: 6px;
          margin-left: 4px;
        }

        @media (max-width: 768px) {
          :root {
            --hw-slide-width: min(58vw, 240px);
          }
        }
      `}</style>

      {/* ── Slider row ── */}
      <div className="hw-slider">
        <Arrow dir="left" onClick={() => handleNav(-1)} />

        <div className="hw-slides-wrapper">
          {/* Image slides */}
          {SLIDES.map((s, i) => {
            const state = getSlideState(i, current, total);
            return (
              <div key={s.id} className="hw-slide" data-state={state}>
                <div className="hw-slide-inner">
                  <ImageWithFallback
                    className="hw-slide-img"
                    src={s.img}
                    alt={s.subtitle + ' payment device'}
                    style={{ transform: `scale(${s.imgScale})` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Text overlays */}
          {SLIDES.map((s, i) => {
            const state = getSlideState(i, current, total);
            return (
              <div key={s.id + '-info'} className="hw-slide-info" data-state={state}>
                <div className="hw-info-text-wrap">
                  <div className="hw-info-line hw-info-title">
                    <span>{s.title}</span>
                  </div>
                  <div className="hw-info-line hw-info-subtitle">
                    <span>{s.subtitle}</span>
                  </div>
                  <div className="hw-info-line hw-info-desc">
                    <span>{s.description}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Arrow dir="right" onClick={() => handleNav(1)} />
      </div>

      {/* ── Feature pills ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 28,
          marginTop: 28,
          position: 'relative',
          zIndex: 2,
          minHeight: 44,
          flexWrap: 'wrap',
          padding: '0 16px',
        }}
      >
        {SLIDES[current].features.map((f, i) => (
          <div
            key={f}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.42)',
              letterSpacing: '0.01em',
              transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: `${i * 80}ms`,
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#4945FF',
                flexShrink: 0,
              }}
            />
            {f}
          </div>
        ))}
      </div>

      {/* ── Nav dots ── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 14,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {SLIDES.map((s, i) => (
          <button
            key={s.id + '-dot'}
            onClick={() => handleNav(i - current)}
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              borderRadius: i === current ? 4 : '50%',
              border: i === current ? '1px solid #4945FF' : '1px solid rgba(255,255,255,0.2)',
              background: i === current ? '#4945FF' : 'transparent',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

export default function HardwareCarouselSection() {
  return (
    <section
      style={{
        backgroundColor: '#041E42',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Ambient top glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '450px',
          background:
            'radial-gradient(ellipse at center top, rgba(73,69,255,0.13) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 24px 0',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 14px',
            borderRadius: 100,
            marginBottom: 12,
            backgroundColor: 'rgba(73,69,255,0.15)',
            border: '1px solid rgba(73,69,255,0.35)',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#4945FF',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Hardware Included
          </span>
        </div>

        {/* Headline */}
        <h2
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginBottom: 20,
          }}
        >
          Built for the counter.
          <br />
          And beyond.
        </h2>

        {/* Sub-copy */}
        <p
          style={{
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.55)',
            maxWidth: '52ch',
            margin: '0 auto',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Free hardware on every plan. EMV-certified terminals, mobile readers, and
          tap-to-pay on your iPhone — all included.
        </p>
      </div>

      {/* Carousel */}
      <div style={{ position: 'relative', zIndex: 1, paddingTop: '48px', paddingBottom: '48px' }}>
        <HardwareCarousel />
      </div>

      {/* Fine-print */}
      <p
        style={{
          textAlign: 'center',
          fontSize: 13,
          color: 'rgba(255,255,255,0.22)',
          padding: '0 24px 48px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          position: 'relative',
          zIndex: 1,
          margin: 0,
        }}
      >
        All hardware is free with your monthly plan. No leasing. No contracts.
      </p>
    </section>
  );
}