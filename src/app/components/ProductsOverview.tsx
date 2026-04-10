import { CreditCard, DollarSign, Globe, BarChart3 } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ScrollReveal, TiltCard, StaggerChildren, staggerItemVariants, HoverGlow } from './MicroInteractions';
import lensIcon from 'figma:asset/469f37b2152191081bbcb3a26c5c8b22bf58788b.png';

export function ProductsOverview() {
  const products = [
    {
      icon: CreditCard,
      name: 'Payments',
      stat: '100%',
      statLabel: 'Accept payments anywhere',
      description: 'In-person, online, and mobile. One platform.',
      link: '#payments',
      cta: 'Start accepting payments',
    },
    {
      icon: null,
      iconImage: lensIcon,
      name: 'Lens by Delt',
      stat: 'AI',
      statLabel: 'Smart analytics & insights',
      description: 'Dashboards that surface what matters.',
      link: '/delt-ai?demo=true',
      cta: 'See Ai in action',
    },
    {
      icon: Globe,
      name: 'Site Builder',
      stat: '10min',
      statLabel: 'Professional site, built for you',
      description: 'Tell us about your business. We build it. You own it.',
      link: '/website-builder',
      cta: 'Start building',
    },
    {
      icon: DollarSign,
      name: 'Capital',
      stat: 'Instant',
      statLabel: 'Money in your account today',
      description: 'Funded on your sales, not your credit.',
      link: '#capital',
      cta: 'See funding options',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-[#F6F7FB]" id="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#041E42] mb-4">
            Everything your business needs
          </h2>
          <p className="text-lg lg:text-xl text-[#6B7280] max-w-2xl mx-auto">
            Powerful tools designed to help you start, run, and grow your business
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" staggerDelay={0.1}>
          {products.map((product) => {
            const Icon = product.icon;
            const isHashLink = product.link.startsWith('#');
            return (
              <motion.div key={product.name} variants={staggerItemVariants('up', 35)}>
                <TiltCard
                  className="bg-white rounded-lg p-8 shadow-sm border border-[#E5E7EB] hover:shadow-xl transition-shadow h-full"
                  maxTilt={6}
                  scale={1.03}
                >
                  <HoverGlow glowColor="rgba(73, 69, 255, 0.08)" glowSize={250}>
                    <motion.div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${product.iconImage ? '' : 'bg-[#4945FF]'}`}
                      whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                    >
                      {product.iconImage ? (
                        <img src={product.iconImage} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : Icon ? (
                        <Icon className="w-6 h-6 text-white" />
                      ) : null}
                    </motion.div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#041E42', marginBottom: '12px' }}>{product.name}</h3>
                    <p style={{ fontSize: '28px', fontWeight: 700, color: '#4945FF', lineHeight: 1.2, marginBottom: '8px' }}>{product.stat}</p>
                    <p style={{ fontSize: '14px', color: '#666', marginTop: '8px', marginBottom: '24px', lineHeight: 1.5 }}>{product.description}</p>
                    {isHashLink ? (
                      <a
                        href={product.link}
                        className="inline-flex items-center group whitespace-nowrap"
                        style={{ fontSize: '14px', color: '#4945FF', fontWeight: 600 }}
                      >
                        {product.cta}
                        <motion.span
                          className="inline-block ml-1"
                          initial={{ x: 0 }}
                          whileHover={{ x: 4 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          &rarr;
                        </motion.span>
                      </a>
                    ) : (
                      <Link
                        to={product.link}
                        className="inline-flex items-center group whitespace-nowrap"
                        style={{ fontSize: '14px', color: '#4945FF', fontWeight: 600 }}
                      >
                        {product.cta}
                        <motion.span
                          className="inline-block ml-1"
                          initial={{ x: 0 }}
                          whileHover={{ x: 4 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          &rarr;
                        </motion.span>
                      </Link>
                    )}
                  </HoverGlow>
                </TiltCard>
              </motion.div>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}