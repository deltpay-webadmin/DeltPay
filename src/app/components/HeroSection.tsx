import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { Link } from 'react-router';

// --- Word-by-word cinematic text reveal ---
function CinematicHeading() {
  const words = ['Everything', 'you', 'need', 'to', 'run', 'your', 'business'];

  return (
    <h1
      className="text-4xl sm:text-5xl lg:text-6xl xl:text-[3.75rem] font-bold text-white leading-[1.1] mb-6"
      style={{ letterSpacing: '-0.02em' }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em] last:mr-0"
          initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.6,
            delay: 0.3 + i * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

// --- Animated Delt Terminal ---
function AnimatedTerminal() {
  return (
    <motion.div
      className="bg-gradient-to-br from-[#041E42] to-[#4945FF] rounded-xl p-6 text-white relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 1.5, delay: 1.4, ease: 'easeInOut' }}
        style={{ skewX: '-12deg' }}
      />

      {/* Terminal header */}
      <motion.div
        className="text-sm mb-8 opacity-80"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 0.8, x: 0 }}
        transition={{ duration: 0.4, delay: 0.9 }}
      >
        Delt Terminal
      </motion.div>

      {/* Input rows building in */}
      <div className="space-y-4">
        {[0.2, 0.15, 0.3].map((opacity, i) => (
          <motion.div
            key={i}
            className="relative overflow-hidden rounded"
            style={{ height: i === 2 ? 64 : 48 }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{
              duration: 0.5,
              delay: 1.0 + i * 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div
              className="absolute inset-0 rounded backdrop-blur-sm"
              style={{ backgroundColor: `rgba(255,255,255,${opacity + 0.05})` }}
            />
            {/* Typing cursor effect on last row */}
            {i === 2 && (
              <motion.div
                className="absolute left-3 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white/60"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 2.0 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        className="mt-8 flex justify-between items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.6 }}
      >
        <div className="text-xs opacity-60">Tap, chip, or swipe</div>
        <motion.div
          className="w-12 h-8 bg-white/20 rounded"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 1.8 }}
        />
      </motion.div>
    </motion.div>
  );
}

// --- Payment approved floating card ---
function PaymentCard() {
  return (
    <motion.div
      className="absolute -bottom-5 -left-6 sm:-bottom-6 sm:-left-8 bg-white rounded-xl shadow-2xl shadow-black/8 p-5 border border-[#E5E7EB] z-20"
      initial={{ opacity: 0, y: 30, x: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: 2.0,
      }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="w-11 h-11 bg-[#4945FF] rounded-full flex items-center justify-center"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 2.3 }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 2.5, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>
        <div>
          <motion.div
            className="text-sm font-semibold text-[#041E42]"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 2.4 }}
          >
            Payment approved
          </motion.div>
          <motion.div
            className="text-xs text-[#6B7280]"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 2.5 }}
          >
            $2,450.00
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Scrolling ticker ---
const businesses = [
  "Tony's Original Pizza",
  'Luxe Hair Studio',
  'Precision Auto Repair',
  'Summit HVAC Services',
  'Bright Smile Dental',
  'GreenScape Landscaping',
  'Artisan Bake House',
  'CoreFit Training',
  'Bloom Boutique',
  'Harbor Coffee Co.',
];

function Ticker() {
  return (
    <motion.div
      className="mt-16 lg:mt-24 -mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 2.2 }}
    >
      <div className="relative overflow-hidden">
        {/* Fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#041E42] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#041E42] to-transparent" />

        <div className="flex gap-16 animate-ticker whitespace-nowrap">
          {[...businesses, ...businesses].map((name, i) => (
            <div
              key={i}
              className="text-2xl sm:text-3xl font-bold text-white/10 select-none flex-shrink-0"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// --- Subtle floating particles ---
function HeroParticles() {
  const particles = useRef(
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 55 + Math.random() * 40,
      y: 10 + Math.random() * 70,
      size: 3 + Math.random() * 4,
      duration: 6 + Math.random() * 6,
      delay: Math.random() * 3,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#4945FF]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.08, 0.2, 0.08],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// --- Main Hero ---
export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax transforms for the terminal (moves slightly opposite to mouse)
  const terminalX = useTransform(smoothX, [-0.5, 0.5], [12, -12]);
  const terminalY = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  // Lighter parallax for the payment card
  const cardX = useTransform(smoothX, [-0.5, 0.5], [18, -18]);
  const cardY = useTransform(smoothY, [-0.5, 0.5], [12, -12]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  return (
    <section
      ref={containerRef}
      className="relative pt-32 lg:pt-40 pb-20 lg:pb-32 overflow-hidden bg-[#041E42]"
      onMouseMove={handleMouseMove}
    >
      {/* Subtle radial glow for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(73,69,255,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(73,69,255,0.04) 0%, transparent 70%)',
        }}
      />
      <HeroParticles />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="max-w-xl">
            <CinematicHeading />

            <motion.p
              className="text-lg lg:text-xl text-white/85 mb-8 leading-relaxed max-w-[800px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              Payments, AI-powered tools, websites, and funding. All in one
              powerful platform built for modern businesses.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/get-funded"
                  className="get-started-btn inline-flex justify-center items-center px-8 py-4 rounded-xl font-medium transition-all text-lg bg-[#4945FF] text-white border-2 border-[#4945FF] hover:bg-[#3933CC] hover:border-[#3933CC] relative overflow-hidden"
                >
                  Get Started for Free
                </Link>
              </motion.div>
              <motion.a
                href="#products"
                className="inline-flex justify-center items-center border-2 border-white/30 text-white px-8 py-4 rounded-xl font-medium hover:bg-white/10 hover:border-white/50 transition-all text-lg"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                See Products
              </motion.a>
            </motion.div>
          </div>

          {/* Right — Animated Terminal with parallax */}
          <div className="relative">
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl shadow-black/5 p-8 border border-[#E5E7EB]"
              style={{ x: terminalX, y: terminalY }}
              initial={{ opacity: 0, y: 40, rotateY: -5 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatedTerminal />

              {/* Payment card with its own parallax layer */}
              <motion.div style={{ x: cardX, y: cardY }} className="contents">
                <PaymentCard />
              </motion.div>
            </motion.div>

            {/* Decorative glow behind terminal */}
            <motion.div
              className="absolute -inset-8 rounded-3xl opacity-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(73,69,255,0.08) 0%, transparent 70%)',
              }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            />
          </div>
        </div>
      </div>

      {/* Ticker */}
      <Ticker />
    </section>
  );
}