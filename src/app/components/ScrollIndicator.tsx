import { motion } from 'motion/react';

interface ScrollIndicatorProps {
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function ScrollIndicator({ style, onClick }: ScrollIndicatorProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2.5 cursor-pointer"
      style={{ ...style }}
      onClick={onClick}
    >
      {/* Text */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 2.8,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.30)',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        }}
      >
        Scroll to explore
      </span>

      {/* Two-tone animated mouse */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
        style={{ width: 22, height: 34 }}
      >
        {/* Mouse outline */}
        <svg
          width="22"
          height="34"
          viewBox="0 0 22 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer border - gradient */}
          <defs>
            <linearGradient id="mouseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(73,69,255,0.5)" />
              <stop offset="100%" stopColor="rgba(22,199,132,0.5)" />
            </linearGradient>
          </defs>
          
          {/* Mouse body */}
          <rect
            x="1"
            y="1"
            width="20"
            height="32"
            rx="10"
            stroke="url(#mouseGradient)"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Scroll wheel - animated */}
          <motion.rect
            x="9"
            y="7"
            width="4"
            height="8"
            rx="2"
            fill="rgba(73,69,255,0.4)"
            animate={{ y: [7, 11, 7], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
