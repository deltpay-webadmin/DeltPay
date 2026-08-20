import { Clock, MapPin, Zap, Brain } from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { AnimatedClock } from './AnimatedClock';
import { ScrollReveal, AnimatedCounter, StaggerChildren, staggerItemVariants } from './MicroInteractions';

function AnimatedIcon({ icon: Icon, animation, className }: { icon: any; animation: string; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      className="inline-flex items-center justify-center w-16 h-16 bg-[#4945FF]/10 rounded-full mb-6"
      initial={{ scale: 0, rotate: -180 }}
      animate={isInView ? { scale: 1, rotate: 0 } : {}}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
      whileHover={{ scale: 1.15, rotate: 5 }}
    >
      <Icon className={className} />
    </motion.div>
  );
}

export function ValueProps() {
  const benefits = [
    {
      icon: MapPin,
      number: '100',
      suffix: '%',
      numericTarget: 100,
      headline: 'Accept payments anywhere',
      description: 'In-person, online, or on-the-go — every way your customers want to pay, covered.',
      animation: 'animate-pin-bounce',
    },
    {
      icon: Brain,
      number: 'AI',
      suffix: '',
      numericTarget: 0,
      headline: 'Smart analytics & insights',
      description: 'AI-powered dashboards surface what matters most, so every decision is backed by real intelligence.',
      animation: 'animate-pulse',
      isText: true,
    },
    {
      icon: Zap,
      number: '10',
      suffix: 'min',
      numericTarget: 10,
      headline: 'We build it. You own it.',
      description: "Tell us about your business and we'll have a professional website live for you in minutes.",
      animation: 'animate-lightning-charge',
    },
    {
      icon: Clock,
      number: 'Fast',
      suffix: '',
      numericTarget: 0,
      headline: 'Money in your account fast',
      description: 'Next-day payouts standard — same-day eligible for qualifying merchants.',
      animation: 'animate-clock-tick',
      isText: true,
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16" staggerDelay={0.12}>
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.headline}
                className="text-center"
                variants={staggerItemVariants('up', 40)}
              >
                {benefit.icon === Clock ? (
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 bg-[#4945FF]/10 rounded-full mb-6"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                  >
                    <AnimatedClock className="w-8 h-8 text-[#4945FF]" />
                  </motion.div>
                ) : (
                  <AnimatedIcon icon={Icon} animation={benefit.animation} className="w-8 h-8 text-[#4945FF]" />
                )}
                <div className="text-4xl lg:text-5xl font-bold text-[#4945FF] mb-4">
                  {benefit.isText ? (
                    benefit.number
                  ) : (
                    <AnimatedCounter
                      target={benefit.numericTarget}
                      suffix={benefit.suffix}
                      duration={1800}
                    />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-[#041E42] mb-3">{benefit.headline}</h3>
                <p className="text-[#6B7280] leading-relaxed">{benefit.description}</p>
              </motion.div>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}
