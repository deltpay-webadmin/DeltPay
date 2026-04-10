import React from 'react';

interface MarqueeLineProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: number;
}

const MarqueeLine = ({ children, direction = 'left', speed = 30 }: MarqueeLineProps) => {
  const items = Array(10).fill(children);

  return (
    <div style={{
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      width: '100%',
    }}>
      <div style={{
        display: 'inline-flex',
        animation: `marquee-${direction} ${speed}s linear infinite`,
        willChange: 'transform',
      }}>
        {[0, 1].map(copy => (
          <span
            key={copy}
            style={{
              display: 'inline-block',
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 700,
              letterSpacing: '-0.07em',
              lineHeight: '90%',
              textTransform: 'uppercase',
              color: 'rgba(73, 69, 255, 0.35)',
              userSelect: 'none',
            }}
          >
            {items.map((text, i) => (
              <React.Fragment key={i}>
                {text}
                <span style={{ padding: '0 24px' }}> </span>
              </React.Fragment>
            ))}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default function DeltMarquee() {
  return (
    <div style={{
      background: '#ffffff',
      padding: '80px 0',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      WebkitFontSmoothing: 'antialiased',
    }}>
      <MarqueeLine direction="left" speed={156}>
        Website · Payments · Capital · Intelligence ·
      </MarqueeLine>

      <div style={{ height: '16px' }} />

      <MarqueeLine direction="right" speed={180}>
        Built for merchants · Powered by Lens ·
      </MarqueeLine>
    </div>
  );
}