import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useInView } from 'motion/react';

// --- Animated word split (inspired by anime.js splitText + stagger from center) ---

function SplitTextReveal({
  text,
  className = '',
  as: Tag = 'span',
  wordDelay = 35,
  baseDuration = 600,
  initialZ = 80,
  staggerFrom = 'center' as 'center' | 'start' | 'end',
  startDelay = 0,
}: {
  text: string;
  className?: string;
  as?: 'h1' | 'p' | 'span' | 'div';
  wordDelay?: number;
  baseDuration?: number;
  initialZ?: number;
  staggerFrom?: 'center' | 'start' | 'end';
  startDelay?: number;
}) {
  const words = text.split(' ');
  const center = Math.floor(words.length / 2);

  const getDelay = (index: number) => {
    if (staggerFrom === 'center') {
      return Math.abs(index - center) * wordDelay + startDelay;
    }
    if (staggerFrom === 'end') {
      return (words.length - 1 - index) * wordDelay + startDelay;
    }
    return index * wordDelay + startDelay;
  };

  return (
    <Tag className={`${className}`} style={{ perspective: '800px' }}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block"
          initial={{
            opacity: 0,
            z: initialZ,
            rotateX: -15,
            filter: 'blur(6px)',
          }}
          animate={{
            opacity: 1,
            z: 0,
            rotateX: 0,
            filter: 'blur(0px)',
          }}
          transition={{
            duration: baseDuration / 1000,
            delay: getDelay(i) / 1000,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </Tag>
  );
}

// --- Animated counter ---

function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 1800,
  delay = 0,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;

    const startTime = performance.now() + delay;
    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * value));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, duration, delay]);

  return (
    <div ref={ref}>
      {prefix}{count}{suffix}
    </div>
  );
}

// --- Main Hero Component ---

export function WebsiteExamplesHero() {
  return (
    <section className="relative bg-[#041E42] text-white py-20 lg:py-28 overflow-hidden">
      {/* BuildModeGrid removed */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-2xl relative z-10">
          {/* Build mode badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-[#4945FF]/15 border border-[#4945FF]/25 rounded-full px-4 py-1.5 mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-[#4945FF]"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-[#4945FF] font-semibold tracking-wider uppercase">
              Portfolio
            </span>
          </motion.div>

          {/* Heading with split text animation */}
          <div style={{ perspective: '800px' }}>
            <SplitTextReveal
              text="See Our Work"
              as="h1"
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 block"
              wordDelay={60}
              baseDuration={700}
              initialZ={100}
              staggerFrom="start"
              startDelay={200}
            />
          </div>

          {/* Paragraph with split text animation */}
          <div style={{ perspective: '600px' }}>
            <SplitTextReveal
              text="Explore premium and professional websites built with Delt's Website Builder. Each site is designed to convert visitors into customers with stunning visuals and powerful features."
              as="p"
              className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10 block"
              wordDelay={25}
              baseDuration={500}
              initialZ={50}
              staggerFrom="center"
              startDelay={500}
            />
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <a
              href="#examples"
              className="group inline-flex items-center bg-[#4945FF] text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-[#3933CC] transition-all hover:shadow-lg hover:shadow-[#4945FF]/25"
            >
              View Examples
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center bg-white/8 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-white/15 transition-all border border-white/10"
            >
              See Pricing
            </a>
          </motion.div>
        </div>

        {/* Assembling browser mockup on the right */}
        <AssemblingBrowser />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4945FF]/30 to-transparent" />
    </section>
  );
}

// --- Animated Stats Bar ---

export function WebsiteExamplesStats() {
  const stats = [
    { value: 500, suffix: '+', label: 'Sites Built' },
    { value: 4.9, suffix: '/5', label: 'Customer Rating', isDecimal: true },
    { value: 24, suffix: 'hr', label: 'Average Launch Time' },
    { value: 99.9, suffix: '%', label: 'Uptime Guarantee', isDecimal: true },
  ];

  return (
    <section className="py-12 border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="text-4xl font-bold text-[#4945FF] mb-2">
                {stat.isDecimal ? (
                  <AnimatedDecimalCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    delay={300 + i * 150}
                  />
                ) : (
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    delay={300 + i * 150}
                  />
                )}
              </div>
              <div className="text-sm text-[#6B7280]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Decimal counter for stats like 4.9 and 99.9
function AnimatedDecimalCounter({
  value,
  suffix = '',
  duration = 1800,
  delay = 0,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const [count, setCount] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;

    const startTime = performance.now() + delay;
    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      const current = eased * value;
      // Figure out decimal places from original value
      const decimalPlaces = (value.toString().split('.')[1] || '').length;
      setCount(current.toFixed(decimalPlaces));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, duration, delay]);

  return <div ref={ref}>{count}{suffix}</div>;
}

// --- Assembling browser mockup ---

function AssemblingBrowser() {
  return (
    <motion.div
      className="hidden lg:block absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 w-[340px] xl:w-[400px]"
      initial={{ opacity: 0, x: 60, rotateY: -12 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 0.9, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ perspective: '1000px' }}
    >
      <div className="bg-[#0d2a4a] rounded-xl border border-white/10 shadow-2xl shadow-black/30 overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#0a1f38] border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#041E42]/25" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#041E42]/25" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#041E42]/25" />
          </div>
          <div className="flex-1 mx-3">
            <div className="bg-white/5 rounded-md px-3 py-1 text-[10px] text-white/30 text-center">
              yoursite.delt.com
            </div>
          </div>
        </div>

        {/* Page content assembling */}
        <div className="p-4 space-y-3">
          {/* Nav bar */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <div className="w-16 h-3 bg-[#4945FF]/40 rounded" />
            <div className="flex gap-2">
              <div className="w-8 h-2 bg-white/10 rounded" />
              <div className="w-8 h-2 bg-white/10 rounded" />
              <div className="w-8 h-2 bg-white/10 rounded" />
            </div>
          </motion.div>

          {/* Hero image placeholder */}
          <motion.div
            className="h-28 bg-gradient-to-br from-[#4945FF]/20 to-[#4945FF]/5 rounded-lg border border-[#4945FF]/10 flex items-center justify-center overflow-hidden relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.6, ease: 'easeOut' }}
          >
            {/* Assembly lines */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute left-0 right-0 h-px bg-[#4945FF]/20"
                style={{ top: `${30 + i * 25}%` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.4 + i * 0.15, duration: 0.5 }}
              />
            ))}
            <motion.div
              className="text-[10px] text-[#4945FF]/40 font-semibold tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.4 }}
            >
              HERO SECTION
            </motion.div>
          </motion.div>

          {/* Content blocks assembling */}
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="space-y-1.5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + i * 0.15, duration: 0.5 }}
              >
                <div className="h-14 bg-white/5 rounded-md border border-white/5" />
                <div className="h-2 bg-white/8 rounded w-full" />
                <div className="h-2 bg-white/5 rounded w-3/4" />
              </motion.div>
            ))}
          </div>

          {/* CTA row */}
          <motion.div
            className="flex gap-2 pt-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 0.5 }}
          >
            <div className="h-6 w-20 bg-[#4945FF]/40 rounded-md" />
            <div className="h-6 w-16 bg-white/5 rounded-md border border-white/10" />
          </motion.div>

          {/* Footer */}
          <motion.div
            className="flex justify-between pt-2 border-t border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4, duration: 0.5 }}
          >
            <div className="w-12 h-2 bg-white/5 rounded" />
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-3 h-3 bg-white/5 rounded-full" />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Build progress bar */}
        <div className="px-4 pb-3">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#4945FF] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.8, duration: 2.2, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          <motion.div
            className="text-[9px] text-white/20 mt-1 text-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 }}
          >
            Built with Delt
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}