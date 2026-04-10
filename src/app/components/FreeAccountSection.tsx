import { useState } from 'react';
import { ArrowRight, CreditCard, Smartphone, FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollReveal } from './MicroInteractions';

export function FreeAccountSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  const tools = [
    {
      icon: <CreditCard className="w-10 h-10 text-[#4945FF]" />,
      title: "Virtual Terminal",
      description: "The Delt Virtual Terminal allows you to securely take credit card payments online using any device that has an internet connection.",
      link: "#"
    },
    {
      icon: <Smartphone className="w-10 h-10 text-[#FF8C42]" />,
      title: "Point-of-Sale",
      description: "Save time and money by transforming your workstation, tablet or smartphone into a powerful point-of-sale to accept in-person payments.",
      link: "#"
    },
    {
      icon: <FileText className="w-10 h-10 text-[#A855F7]" />,
      title: "Invoicing",
      description: "Free invoicing software that lets you simplify your billing and payment operations under one platform, while saving significantly on processing fees.",
      link: "#"
    },
    {
      icon: <Shield className="w-10 h-10 text-[#DC2626]" />,
      title: "High-Risk Processing",
      description: "Specialized merchant accounts for high-risk industries like CBD, nutraceuticals, and subscription services. Get approved where traditional processors say no.",
      link: "#"
    },
    {
      icon: <AlertTriangle className="w-10 h-10 text-[#F59E0B]" />,
      title: "Chargeback Protection",
      description: "Advanced fraud prevention and chargeback management tools designed for high-risk merchants. Minimize disputes and protect your revenue.",
      link: "#"
    },
    {
      icon: <CheckCircle className="w-10 h-10 text-[#10B981]" />,
      title: "Industry Expertise",
      description: "Work with processors who understand your business model. We specialize in high-ticket sales, recurring billing, and complex payment structures.",
      link: "#"
    }
  ];

  const totalSlides = Math.ceil(tools.length / 3);

  return (
    <section className="py-24 lg:py-40 bg-gradient-to-b from-[#F0F4FF] via-[#E8ECFF] to-[#F0F4FF] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#4945FF]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#4945FF]/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-20 gap-10">
            <div className="lg:max-w-2xl">
              <div className="inline-block mb-4 px-4 py-2 bg-[#4945FF]/10 rounded-full">
                <span className="text-[#4945FF] font-semibold text-sm uppercase tracking-wide">No Setup Fees &bull; No Monthly Fees</span>
              </div>
              <h2 className="text-[60px] sm:text-[72px] font-bold text-[#041E42] mb-6 leading-tight" style={{ fontFamily: '"Codec Pro", "Codec", Inter, sans-serif' }}>
                Start for free, scale when you're ready
              </h2>
            </div>
            <div className="lg:max-w-lg">
              <p className="text-[#374151] text-xl leading-relaxed">
                When you sign up for your free Delt account, you get access to all the payment tools your business needs to grow, with no user fees or usage limits.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Tools Grid with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {tools.slice(activeSlide * 3, activeSlide * 3 + 3).map((tool, index) => (
              <motion.div
                key={`${activeSlide}-${index}`}
                className="bg-white rounded-2xl p-10 border border-gray-200 hover:border-[#4945FF] hover:shadow-2xl transition-all duration-300 flex flex-col group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {/* Icon */}
                <motion.div
                  className="mb-8"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  {tool.icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-3xl font-bold text-[#041E42] mb-5">
                  {tool.title}
                </h3>

                {/* Description */}
                <p className="text-[#6B7280] text-lg leading-relaxed mb-8 flex-1">
                  {tool.description}
                </p>

                {/* Learn More Link */}
                <a
                  href={tool.link}
                  className="text-[#4945FF] text-lg font-semibold flex items-center gap-2 hover:gap-4 transition-all duration-300"
                >
                  Learn more
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </a>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Carousel Dots */}
        <div className="flex justify-center items-center gap-3">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`rounded-full ${
                index === activeSlide
                  ? 'w-8 h-3 bg-[#4945FF]'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              layout
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
