import { useRef, useEffect, useState, useCallback, type ReactNode, type CSSProperties } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';

/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL
   Fade + slide in when element enters viewport
   ═══════════════════════════════════════════════════════════ */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 40,
  duration = 0.7,
  once = true,
  threshold = 0.15,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const initialPos = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  }[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, ...initialPos, filter: 'blur(4px)' }}
      animate={isInView ? { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' } : {}}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STAGGER CHILDREN
   Wraps children and staggers their entrance
   ═══════════════════════════════════════════════════════════ */
export function StaggerChildren({
  children,
  className = '',
  staggerDelay = 0.08,
  direction = 'up',
  distance = 30,
  once = true,
  threshold = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  once?: boolean;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: { transition: { staggerChildren: staggerDelay } },
        hidden: {},
      }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItemVariants = (direction: 'up' | 'down' | 'left' | 'right' = 'up', distance = 30) => {
  const pos = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  }[direction];

  return {
    hidden: { opacity: 0, filter: 'blur(4px)', ...pos },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };
};

/* ═══════════════════════════════════════════════════════════
   MAGNETIC BUTTON
   Button that subtly follows the cursor when hovered
   ═══════════════════════════════════════════════════════════ */
export function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  style,
  onClick,
  as = 'button',
  href,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  style?: CSSProperties;
  onClick?: () => void;
  as?: 'button' | 'a';
  href?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 20, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) * strength);
      y.set((e.clientY - centerY) * strength);
    },
    [x, y, strength]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const Component = motion[as] as any;

  return (
    <Component
      ref={ref}
      className={className}
      style={{ ...style, x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      href={href}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </Component>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTER
   Counts up from 0 to target when in viewport
   ═══════════════════════════════════════════════════════════ */
export function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 2000,
  className = '',
  once = true,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   TILT CARD
   3D tilt effect on hover
   ═══════════════════════════════════════════════════════════ */
export function TiltCard({
  children,
  className = '',
  maxTilt = 8,
  scale = 1.02,
  style,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      rotateX.set(-y * maxTilt);
      rotateY.set(x * maxTilt);
    },
    [rotateX, rotateY, maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        ...style,
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 800,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SMOOTH ACCORDION
   Animated expand/collapse for FAQ etc
   ═══════════════════════════════════════════════════════════ */
export function SmoothAccordion({
  isOpen,
  children,
  className = '',
}: {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          className={className}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOVER GLOW
   Subtle glow that follows cursor over an element
   ═══════════════════════════════════════════════════════════ */
export function HoverGlow({
  children,
  className = '',
  glowColor = 'rgba(73, 69, 255, 0.15)',
  glowSize = 200,
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: glowSize,
            height: glowSize,
            x: mouseX,
            y: mouseY,
            translateX: '-50%',
            translateY: '-50%',
            background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TEXT SHIMMER
   Animated gradient shimmer across text
   ═══════════════════════════════════════════════════════════ */
export function TextShimmer({
  children,
  className = '',
  baseColor = '#041E42',
  shimmerColor = '#4945FF',
}: {
  children: ReactNode;
  className?: string;
  baseColor?: string;
  shimmerColor?: string;
}) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        backgroundImage: `linear-gradient(110deg, ${baseColor} 35%, ${shimmerColor} 50%, ${baseColor} 65%)`,
        backgroundSize: '250% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'textShimmer 3s ease-in-out infinite',
      }}
    >
      {children}
      <style>{`
        @keyframes textShimmer {
          0%, 100% { background-position: 100% center; }
          50% { background-position: 0% center; }
        }
      `}</style>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLOATING ELEMENT
   Gentle floating animation
   ═══════════════════════════════════════════════════════════ */
export function FloatingElement({
  children,
  className = '',
  amplitude = 10,
  duration = 4,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
