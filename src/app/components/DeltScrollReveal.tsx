import { useRef, useEffect, useState } from 'react';
import logoWhite from 'figma:asset/419e83442bb1bf5965a966a8870b00dd4288dd57.png';

interface WordRevealProps {
  word: string;
  delay: number;
  variant: 'blur' | 'letter' | 'right';
  visible: boolean;
}

const WordReveal = ({ word, delay, variant, visible }: WordRevealProps) => {
  const variants = {
    blur: {
      hidden: { filter: 'blur(12px)', opacity: 0, transform: 'translateY(24px)' },
      visible: { filter: 'blur(0px)', opacity: 1, transform: 'translateY(0px)' },
    },
    letter: {
      hidden: { filter: 'blur(5px)', opacity: 0, transform: 'translateY(20px)' },
      visible: { filter: 'blur(0px)', opacity: 1, transform: 'translateY(0px)' },
    },
    right: {
      hidden: { filter: 'blur(8px)', opacity: 0, transform: 'translateX(40px)' },
      visible: { filter: 'blur(0px)', opacity: 1, transform: 'translateX(0px)' },
    },
  };
  const v = variants[variant];
  const style = visible ? v.visible : v.hidden;

  return (
    <span
      style={{
        display: 'inline-block',
        ...style,
        transition: `all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
        willChange: 'transform, opacity, filter',
      }}
    >
      {word}&nbsp;
    </span>
  );
};

interface ScrollScreenProps {
  text: string;
  align: 'center' | 'left' | 'right';
  variant: 'blur' | 'letter' | 'right';
  color: string;
  fontSize: string;
  staggerMs: number;
}

const ScrollScreen = ({ text, align, variant, color, fontSize, staggerMs }: ScrollScreenProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3, rootMargin: '-15% 0px -15% 0px' }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const words = text.split(' ');

  return (
    <div
      ref={ref}
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'left' ? 'flex-start' : 'center',
        padding: '0 8%',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          textAlign: align,
          fontSize,
          fontWeight: 800,
          color,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
        }}
      >
        {words.map((w, i) => (
          <WordReveal
            key={`${w}-${i}`}
            word={w}
            delay={i * staggerMs}
            variant={variant}
            visible={visible}
          />
        ))}
      </div>
    </div>
  );
};

const LogoScreen = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3, rootMargin: '-15% 0px -15% 0px' }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '32px',
      }}
    >
      <div
        style={{
          fontSize: 'clamp(20px, 3.5vw, 36px)',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '-0.02em',
          opacity: visible ? 1 : 0,
          filter: visible ? 'blur(0px)' : 'blur(8px)',
          transform: visible ? 'translateY(0)' : 'translateY(15px)',
          transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform, opacity, filter',
        }}
      >
        Meet
      </div>
      <img
        src={logoWhite}
        alt="Delt"
        style={{
          height: 'clamp(140px, 20vw, 275px)',
          width: 'auto',
          opacity: visible ? 1 : 0,
          filter: visible ? 'blur(0px)' : 'blur(16px)',
          transform: visible ? 'scale(1)' : 'scale(0.92)',
          transition: 'all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) 200ms',
          willChange: 'transform, opacity, filter',
        }}
      />
    </div>
  );
};

export default function DeltScrollReveal() {
  return (
    <div style={{
      background: '#041e42',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      WebkitFontSmoothing: 'antialiased',
    }}>
      <div style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '4px',
            textTransform: 'uppercase' as const,
            fontWeight: 500,
          }}>
            Scroll
          </div>
          <div style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, rgba(67,24,255,0.35), transparent)',
            margin: '14px auto 0',
          }} />
        </div>
      </div>

      <ScrollScreen
        text="Frozen accounts. Failed transactions. Fees you can't explain."
        align="center"
        variant="blur"
        color="rgba(255,255,255,0.88)"
        fontSize="clamp(32px, 6vw, 72px)"
        staggerMs={100}
      />

      <ScrollScreen
        text="Chargebacks with no warning. Delays in funding. Support that doesn't pick up."
        align="left"
        variant="letter"
        color="rgba(255,255,255,0.88)"
        fontSize="clamp(32px, 6vw, 72px)"
        staggerMs={65}
      />

      <ScrollScreen
        text="There's a better way to get paid."
        align="center"
        variant="right"
        color="#6847FF"
        fontSize="clamp(36px, 7vw, 84px)"
        staggerMs={110}
      />

      <LogoScreen />

      <div style={{ height: '30vh' }} />
    </div>
  );
}