import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { ScrollIndicator } from './ScrollIndicator';
import deltLogoImg from 'figma:asset/ba16007295b082bbfe774b1ba0c31a403b5502d6.png';

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4';

const FONT_GS =
  "'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

interface LensHeroProps {
  onAutoplay: () => void;
}

export function LensHero({ onAutoplay: _onAutoplay }: LensHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const handleReady = () => setVideoReady(true);
    if (el.readyState >= 2) setVideoReady(true);
    el.addEventListener('loadeddata', handleReady);
    el.addEventListener('canplay', handleReady);
    return () => {
      el.removeEventListener('loadeddata', handleReady);
      el.removeEventListener('canplay', handleReady);
    };
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Fontshare: General Sans */}
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=general-sans@200,300,400,500,600,700&display=swap');

        .lh-fadein {
          opacity: 0;
          transform: translateY(12px);
          animation: lhFadeIn 0.7s ease forwards;
        }
        .lh-fadein-d0 { animation-delay: 0.15s; }
        .lh-fadein-d1 { animation-delay: 0.35s; }
        .lh-fadein-d2 { animation-delay: 0.65s; }
        .lh-fadein-d3 { animation-delay: 1.05s; }
        .lh-fadein-d4 { animation-delay: 1.45s; }
        .lh-fadein-d5 { animation-delay: 1.85s; }

        @keyframes lhFadeIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Char reveal */
        .lh-char-wrap {
          display: inline-block;
          overflow: hidden;
          vertical-align: bottom;
        }
        .lh-char {
          display: inline-block;
          animation: lhCharUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .lh-char-0 { animation-delay: 0.55s; }
        .lh-char-1 { animation-delay: 0.64s; }
        .lh-char-2 { animation-delay: 0.73s; }
        .lh-char-3 { animation-delay: 0.82s; }
        @keyframes lhCharUp {
          from { transform: translateY(110%); }
          to   { transform: translateY(0); }
        }

        /* Headline gradient per spec: 144.5deg, white ~28% to transparent ~115% */
        .lh-title-gradient {
          background: linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }

        /* Lens wordmark gradient (keeps the Lens brand character) */
        .lens-gradient-char {
          background: linear-gradient(
            180deg,
            #FFFFFF 0%,
            #E6ECFF 22%,
            #B9C5F4 48%,
            #8A9AE3 70%,
            #6475CF 88%,
            #465AA8 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Shimmer for primary CTA */
        @keyframes lhShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Video fade-in */
        .lh-video {
          opacity: 0;
          transition: opacity 900ms ease;
        }
        .lh-video.is-ready {
          opacity: 1;
        }
      `}</style>

      {/* ══ Fullscreen looping background video ══ */}
      <video
        ref={videoRef}
        className={`lh-video absolute inset-0 w-full h-full object-cover ${videoReady ? 'is-ready' : ''}`}
        src={HERO_VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* 50% black overlay for readability */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* Subtle vignette for extra text contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      {/* ══ HERO CONTENT — vertically stacked, centered ══ */}
      <div
        className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center"
        style={{
          paddingTop: 'clamp(200px, 28vh, 280px)',
          paddingBottom: 'clamp(72px, 11vh, 102px)',
          fontFamily: FONT_GS,
        }}
      >
        <div className="flex flex-col items-center text-center px-6" style={{ gap: 40 }}>
          {/* Early access badge */}
          <div
            className="lh-fadein lh-fadein-d0 inline-flex items-center gap-2"
            style={{
              padding: '7px 14px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.20)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: FONT_GS,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#FFFFFF',
                display: 'inline-block',
              }}
            />
            <span style={{ color: 'rgba(255,255,255,0.60)' }}>Early access available from</span>
            <span style={{ color: '#FFFFFF' }}>&nbsp;May 1, 2026</span>
          </div>

          {/* Lens wordmark — char reveal, gradient fill */}
          <h1
            className="m-0"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(4.42rem, 10.3vw, 9.57rem)',
              fontWeight: 400,
              lineHeight: 0.9,
              letterSpacing: '0.02em',
            }}
          >
            {['L', 'e', 'n', 's'].map((char, i) => (
              <span key={i} className="lh-char-wrap">
                <span className={`lh-char lh-char-${i} lens-gradient-char`}>{char}</span>
              </span>
            ))}
          </h1>

          {/* "by Delt" */}
          <div
            className="lh-fadein lh-fadein-d2 flex items-center"
            style={{ gap: 10, marginTop: -12 }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: '1.1rem',
                fontFamily: FONT_GS,
                fontWeight: 400,
              }}
            >
              by
            </span>
            <Link to="/">
              <img
                src={deltLogoImg}
                alt="Delt"
                style={{ height: 44, width: 'auto', objectFit: 'contain' }}
              />
            </Link>
          </div>

          {/* Headline — Web3 style, gradient white → transparent */}
          <h2
            className="lh-fadein lh-fadein-d3 m-0 lh-title-gradient"
            style={{
              maxWidth: 613,
              fontFamily: FONT_GS,
              fontSize: 'clamp(36px, 5.4vw, 56px)',
              fontWeight: 500,
              lineHeight: 1.28,
              letterSpacing: '-0.01em',
            }}
          >
            The answers you've been missing, at the speed of your business.
          </h2>

          {/* Subtitle */}
          <p
            className="lh-fadein lh-fadein-d4 m-0"
            style={{
              marginTop: -16,
              maxWidth: 680,
              fontFamily: FONT_GS,
              fontSize: 15,
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.70)',
            }}
          >
            Lens turns hidden business signals into plain-English actions — with the money,
            timing, and next step already attached. Built on Delt's real-time data stack
            to surface decisions, not dashboards.
          </p>

          {/* CTA — layered pill button: white outer border, white fill, black text, top glow */}
          <div className="lh-fadein lh-fadein-d5 flex flex-col sm:flex-row items-center" style={{ gap: 12 }}>
            <Link
              to="/lens-chat"
              className="group/btn relative inline-flex items-center justify-center cursor-pointer"
              style={{
                padding: '0.6px',
                borderRadius: 999,
                background: 'rgba(255,255,255,1)',
                boxShadow: '0 10px 40px rgba(255,255,255,0.18)',
                textDecoration: 'none',
              }}
            >
              {/* top white glow streak */}
              <span
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  left: '50%',
                  top: -6,
                  width: '72%',
                  height: 14,
                  transform: 'translateX(-50%)',
                  background:
                    'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
                  filter: 'blur(6px)',
                  borderRadius: 999,
                }}
              />
              <span
                className="relative inline-flex items-center gap-2"
                style={{
                  background: '#FFFFFF',
                  color: '#000000',
                  borderRadius: 999,
                  padding: '11px 29px',
                  fontFamily: FONT_GS,
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                }}
              >
                {/* hover shimmer */}
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    borderRadius: 999,
                    background:
                      'linear-gradient(105deg, transparent 40%, rgba(0,0,0,0.06) 50%, transparent 60%)',
                    backgroundSize: '200% 100%',
                    animation: 'lhShimmer 2.2s linear infinite',
                  }}
                />
                <span className="relative z-10">Open Lens</span>
                <ArrowRight
                  className="w-4 h-4 relative z-10 transition-transform group-hover/btn:translate-x-0.5"
                />
              </span>
            </Link>

            {/* Secondary CTA — transparent pill with white border, white text */}
            <button
              onClick={() => {
                const el = document.getElementById('lens-proof');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative inline-flex items-center justify-center cursor-pointer"
              style={{
                padding: '0.6px',
                borderRadius: 999,
                background: 'rgba(255,255,255,1)',
                border: 'none',
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  left: '50%',
                  top: -6,
                  width: '72%',
                  height: 14,
                  transform: 'translateX(-50%)',
                  background:
                    'radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)',
                  filter: 'blur(6px)',
                  borderRadius: 999,
                }}
              />
              <span
                className="inline-flex items-center"
                style={{
                  background: '#000000',
                  color: '#FFFFFF',
                  borderRadius: 999,
                  padding: '11px 29px',
                  fontFamily: FONT_GS,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                See how it works
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
        onClick={() => {
          const el = document.getElementById('lens-proof');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </section>
  );
}
