import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

/* ── Design tokens ── */
const T = {
  bg: '#03152E',
  surface: '#071D3A',
  card: '#0A2444',
  border: '#163057',
  accent: '#4945FF',
  accentLight: '#6C69FF',
  accentGlow: 'rgba(73,69,255,0.35)',
  green: '#22C55E',
  greenDim: 'rgba(34,197,94,0.08)',
  white: '#F4F4F6',
  gray1: '#C8CDD8',
  gray2: '#8B95A8',
  gray3: '#5E6A80',
  gray4: '#3A4358',
  serif: "'Instrument Serif', Georgia, serif",
  sans: "'DM Sans', -apple-system, sans-serif",
};

const TYPED_URL = 'theharlownyc.com';
const SITE_NAME = 'The Harlow';
const SITE_TAGLINE = 'Boutique Hotel & Rooftop Bar — New York City';
const HERO_IMG = 'https://images.unsplash.com/photo-1771206331424-44b8ec9acdf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBib3V0aXF1ZSUyMGhvdGVsJTIwbG9iYnklMjBlbGVnYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzcyNzE0MzQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

/* ── Phase timing (ms) ── */
const PHASE = {
  IDLE: 600,
  TYPE_CHAR: 55,
  PAUSE_AFTER_TYPE: 350,
  LOADING_DURATION: 1000,
  SECURE_HOLD: 3200,
  BADGE_STAGGER: 220,
  TOTAL_LOOP_PAD: 800,
};

type Stage = 'idle' | 'typing' | 'loading' | 'secure';

/* ── Lock SVG with animated shackle ── */
function AnimatedLock({ size = 18 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: -120 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 14, mass: 0.5 }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
    >
      {/* Glow ring behind the lock */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [1, 1.6, 1.3], opacity: [0.6, 0, 0] }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: size * 2.2,
          height: size * 2.2,
          borderRadius: '50%',
          border: `2px solid ${T.green}`,
        }}
      />
      {/* Shield glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.2] }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: size * 2,
          height: size * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${T.green}44 0%, transparent 70%)`,
        }}
      />
      <svg width={size} height={size * 1.15} viewBox="0 0 18 21" fill="none">
        {/* Lock body */}
        <motion.rect
          x="2" y="9" width="14" height="11" rx="2.5"
          fill={T.green}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.1, duration: 0.25, ease: 'easeOut' }}
          style={{ transformOrigin: 'center bottom' }}
        />
        {/* Keyhole */}
        <motion.circle
          cx="9" cy="14" r="1.5"
          fill="#fff"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 10 }}
        />
        {/* Shackle — slides down to lock */}
        <motion.path
          d="M5.5 9V6.5C5.5 4.01 7.01 2 9 2C10.99 2 12.5 4.01 12.5 6.5V9"
          stroke={T.green}
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={{ y: -4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 12 }}
        />
      </svg>
    </motion.div>
  );
}

/* ── Badge cards for SSL / DNS / Live ── */
const BADGES = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L2 4V7.5C2 11.09 4.56 14.41 8 15.5C11.44 14.41 14 11.09 14 7.5V4L8 1Z" stroke={T.green} strokeWidth="1.5" fill={`${T.green}15`} />
        <path d="M5.5 8L7.2 9.7L10.5 6.3" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'SSL auto-provisioned',
    sub: '256-bit encryption active',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke={T.accentLight} strokeWidth="1.5" fill={`${T.accent}15`} />
        <path d="M8 3V8L11 10" stroke={T.accentLight} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: 'DNS configured',
    sub: 'Propagation complete',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8L6.5 11.5L13 4.5" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Live in minutes',
    sub: 'Zero-downtime deploy',
  },
];

export function BrowserAddressBarAnimation() {
  const [stage, setStage] = useState<Stage>('idle');
  const [typedChars, setTypedChars] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [pageVisible, setPageVisible] = useState(false);
  const [badgesVisible, setBadgesVisible] = useState(false);
  const loopRef = useRef(true);

  /* Cursor blink */
  useEffect(() => {
    if (stage !== 'secure') {
      const id = setInterval(() => setShowCursor(c => !c), 530);
      return () => clearInterval(id);
    }
    setShowCursor(false);
  }, [stage]);

  const runAnimation = useCallback(() => {
    setStage('idle');
    setTypedChars(0);
    setPageVisible(false);
    setBadgesVisible(false);

    let elapsed = PHASE.IDLE;

    // Typing
    const t1 = setTimeout(() => {
      setStage('typing');
      for (let i = 1; i <= TYPED_URL.length; i++) {
        setTimeout(() => setTypedChars(i), i * PHASE.TYPE_CHAR);
      }
    }, elapsed);

    elapsed += TYPED_URL.length * PHASE.TYPE_CHAR + PHASE.PAUSE_AFTER_TYPE;

    // Loading
    const t2 = setTimeout(() => setStage('loading'), elapsed);
    elapsed += PHASE.LOADING_DURATION;

    // Secure
    const t3 = setTimeout(() => {
      setStage('secure');
      setTimeout(() => setPageVisible(true), 250);
      setTimeout(() => setBadgesVisible(true), 600);
    }, elapsed);
    elapsed += PHASE.SECURE_HOLD;

    // Loop
    const t4 = setTimeout(() => {
      if (loopRef.current) runAnimation();
    }, elapsed + PHASE.TOTAL_LOOP_PAD);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  useEffect(() => {
    loopRef.current = true;
    const cleanup = runAnimation();
    return () => { loopRef.current = false; cleanup?.(); };
  }, [runAnimation]);

  const displayedText = stage === 'idle' ? '' : stage === 'typing' ? TYPED_URL.slice(0, typedChars) : TYPED_URL;
  const isSecure = stage === 'secure';

  return (
    <div style={{ padding: '20px 16px 16px' }}>
      {/* ═══ ZOOMED-IN ADDRESS BAR ═══ */}
      <motion.div
        animate={isSecure ? {
          boxShadow: `0 0 60px ${T.accentGlow}, 0 4px 30px rgba(0,0,0,0.4)`,
        } : {
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          borderRadius: 14,
          overflow: 'hidden',
          background: T.card,
          border: `1px solid ${isSecure ? T.accent + '55' : T.border}`,
          transition: 'border-color 0.4s ease',
        }}
      >
        {/* ── Title bar ── */}
        <div style={{
          height: 40,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 7,
        }}>
          {/* Traffic lights */}
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF605C' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FFBD44' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#00CA4E' }} />

          {/* ── Address bar — ZOOMED IN ── */}
          <div style={{
            flex: 1,
            marginLeft: 14,
            height: 28,
            borderRadius: 8,
            background: isSecure ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 12,
            paddingRight: 12,
            gap: 8,
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.3s ease',
          }}>
            {/* Padlock */}
            <AnimatePresence>
              {isSecure && <AnimatedLock size={14} />}
            </AnimatePresence>

            {/* Loading spinner */}
            <AnimatePresence>
              {stage === 'loading' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  style={{ flexShrink: 0, display: 'flex' }}
                >
                  <motion.svg
                    width="14" height="14" viewBox="0 0 14 14"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                  >
                    <circle cx="7" cy="7" r="5.5" stroke={T.gray4} strokeWidth="1.5" fill="none" />
                    <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke={T.accentLight} strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </motion.svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* URL text — larger for zoom effect */}
            <div style={{
              flex: 1,
              fontSize: 13,
              fontFamily: T.sans,
              fontWeight: 500,
              color: isSecure ? T.white : T.gray2,
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              letterSpacing: 0.3,
              transition: 'color 0.3s ease',
            }}>
              {isSecure && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 0.5, width: 'auto' }}
                  transition={{ duration: 0.3 }}
                  style={{ color: T.gray3, marginRight: 0 }}
                >
                  https://
                </motion.span>
              )}
              <span>{displayedText}</span>
              {/* Blinking cursor */}
              {(stage === 'idle' || stage === 'typing') && (
                <span style={{
                  display: 'inline-block',
                  width: 2,
                  height: 15,
                  background: showCursor ? T.accentLight : 'rgba(0,0,0,0)',
                  marginLeft: 1,
                  borderRadius: 1,
                  transition: 'background 0.05s',
                }} />
              )}
            </div>

            {/* Secure indicator text */}
            <AnimatePresence>
              {isSecure && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  style={{
                    flexShrink: 0,
                    fontSize: 9,
                    fontWeight: 700,
                    color: T.green,
                    fontFamily: T.sans,
                    letterSpacing: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.green }} />
                  Secure
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Page content area ── */}
        <div style={{ position: 'relative', minHeight: 180, overflow: 'hidden' }}>
          {/* Loading bar */}
          <AnimatePresence>
            {stage === 'loading' && (
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '90%' }}
                exit={{ width: '100%', opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{
                  position: 'absolute', top: 0, left: 0, height: 2, zIndex: 2,
                  background: `linear-gradient(90deg, ${T.accent}, ${T.accentLight}, ${T.accent})`,
                  borderRadius: 1,
                }}
              />
            )}
          </AnimatePresence>

          {/* Empty / loading state */}
          <AnimatePresence>
            {!pageVisible && (
              <motion.div
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  padding: '40px 32px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                }}
              >
                {stage === 'loading' ? (
                  <>
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      style={{ width: 200, height: 80, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}
                    />
                    <motion.div
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.15 }}
                      style={{ width: 140, height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.04)' }}
                    />
                    <motion.div
                      animate={{ opacity: [0.15, 0.3, 0.15] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
                      style={{ width: 100, height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.03)' }}
                    />
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: T.gray4, fontFamily: T.sans }}>
                    Enter a web address
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Premium site loaded ── */}
          <AnimatePresence>
            {pageVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'relative' }}
              >
                {/* Hero image */}
                <div style={{ position: 'relative', height: 100, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <ImageWithFallback
                      src={HERO_IMG}
                      alt="Boutique hotel"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
                    />
                  </motion.div>
                  {/* Gradient overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(10,36,68,0.3) 0%, rgba(10,36,68,0.85) 100%)',
                  }} />
                  {/* Site name overlay */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    style={{
                      position: 'absolute', bottom: 12, left: 16, right: 16,
                    }}
                  >
                    <div style={{
                      fontSize: 20,
                      fontWeight: 400,
                      color: '#fff',
                      fontFamily: T.serif,
                      letterSpacing: 1,
                      lineHeight: 1.1,
                    }}>
                      {SITE_NAME}
                    </div>
                    <div style={{
                      fontSize: 8,
                      color: 'rgba(255,255,255,0.55)',
                      fontFamily: T.sans,
                      fontWeight: 500,
                      letterSpacing: 1.5,
                      textTransform: 'uppercase' as const,
                      marginTop: 4,
                    }}>
                      {SITE_TAGLINE}
                    </div>
                  </motion.div>
                </div>

                {/* Mini nav bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '8px 16px',
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  {['Rooms', 'Dining', 'Rooftop', 'Book Now'].map((item, i) => (
                    <div key={item} style={{
                      fontSize: 8,
                      fontWeight: i === 3 ? 700 : 500,
                      color: i === 3 ? T.accentLight : T.gray3,
                      fontFamily: T.sans,
                      letterSpacing: 0.8,
                      textTransform: 'uppercase' as const,
                    }}>
                      {item}
                    </div>
                  ))}
                </motion.div>

                {/* Content rows */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  style={{ padding: '12px 16px 16px' }}
                >
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { w: '55%', h: 36 },
                      { w: '45%', h: 36 },
                    ].map((block, i) => (
                      <div key={i} style={{
                        width: block.w,
                        height: block.h,
                        borderRadius: 6,
                        background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)`,
                        border: `1px solid ${T.border}`,
                      }} />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ═══ PROMINENT SSL / DNS / LIVE BADGES ═══ */}
      <AnimatePresence>
        {badgesVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 14,
              justifyContent: 'center',
            }}
          >
            {BADGES.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 16, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: i * PHASE.BADGE_STAGGER / 1000,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  padding: '10px 6px 9px',
                  borderRadius: 10,
                  background: i === 0 ? T.greenDim : i === 1 ? `${T.accent}0A` : T.greenDim,
                  border: `1px solid ${i === 1 ? T.accent + '22' : T.green + '22'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {badge.icon}
                </div>
                <div style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: T.white,
                  fontFamily: T.sans,
                  textAlign: 'center',
                  lineHeight: 1.2,
                  letterSpacing: 0.2,
                }}>
                  {badge.label}
                </div>
                <div style={{
                  fontSize: 7.5,
                  color: T.gray3,
                  fontFamily: T.sans,
                  textAlign: 'center',
                  letterSpacing: 0.2,
                }}>
                  {badge.sub}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
