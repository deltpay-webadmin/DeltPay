import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface Hardware {
  image: string;
  title: string;
  desc: string;
  features: string[];
}

interface HardwareCarouselProps {
  items: Hardware[];
}

export function HardwareCarousel({ items }: HardwareCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  };

  const nextIndex = (current + 1) % items.length;
  const prevIndex = (current - 1 + items.length) % items.length;

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <style>{`
        .hw-carousel-container {
          perspective: 1200px;
          perspective-origin: center center;
        }
        
        .hw-slide {
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
        
        .hw-slide-current {
          transform: perspective(1200px) translateZ(0px) scale(1.15);
          filter: brightness(1);
          z-index: 10;
        }
        
        .hw-slide-next {
          transform: perspective(1200px) translateX(32%) translateZ(-100px) rotateY(-42deg) scale(0.92);
          filter: brightness(0.6);
          z-index: 5;
        }
        
        .hw-slide-prev {
          transform: perspective(1200px) translateX(-32%) translateZ(-100px) rotateY(42deg) scale(0.92);
          filter: brightness(0.6);
          z-index: 5;
        }
        
        @media (max-width: 768px) {
          .hw-slide-next {
            transform: perspective(1200px) translateX(40%) translateZ(-80px) rotateY(-35deg) scale(0.85);
          }
          .hw-slide-prev {
            transform: perspective(1200px) translateX(-40%) translateZ(-80px) rotateY(35deg) scale(0.85);
          }
        }
      `}</style>

      {/* Navigation Buttons */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <ChevronLeft className="w-6 h-6" style={{ color: '#041E42' }} />
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <ChevronRight className="w-6 h-6" style={{ color: '#041E42' }} />
      </button>

      {/* Slides Container */}
      <div 
        className="hw-carousel-container relative w-full h-[600px] flex items-center justify-center overflow-visible"
      >
        <div className="relative w-full max-w-md h-full flex items-center justify-center">
          {items.map((item, index) => {
            const isCurrent = index === current;
            const isNext = index === nextIndex;
            const isPrev = index === prevIndex;
            
            if (!isCurrent && !isNext && !isPrev) return null;

            return (
              <motion.div
                key={index}
                className={`hw-slide absolute w-full max-w-sm ${
                  isCurrent ? 'hw-slide-current' : isNext ? 'hw-slide-next' : 'hw-slide-prev'
                }`}
                initial={false}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
                style={{
                  transformOrigin: 'center center',
                }}
              >
                <div 
                  className="rounded-2xl overflow-hidden border"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    borderColor: isCurrent ? '#4945FF' : 'rgba(4,30,66,0.1)',
                    borderWidth: isCurrent ? '2px' : '1px',
                    boxShadow: isCurrent 
                      ? '0 20px 60px rgba(73,69,255,0.25), 0 8px 24px rgba(0,0,0,0.12)' 
                      : '0 4px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.8s cubic-bezier(0.215, 0.61, 0.355, 1)',
                  }}
                >
                  {/* Image */}
                  <div 
                    className="aspect-[4/3] overflow-hidden" 
                    style={{ backgroundColor: '#F5F7FA' }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                      style={{ 
                        imageRendering: '-webkit-optimize-contrast',
                        transition: 'transform 0.8s cubic-bezier(0.215, 0.61, 0.355, 1)',
                        transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <motion.h3 
                      className="text-2xl font-bold mb-2" 
                      style={{ color: '#041E42' }}
                      initial={false}
                      animate={{
                        opacity: isCurrent ? 1 : 0.4,
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      {item.title}
                    </motion.h3>
                    
                    <motion.p 
                      className="text-base mb-5" 
                      style={{ color: 'rgba(8,10,40,0.6)' }}
                      initial={false}
                      animate={{
                        opacity: isCurrent ? 1 : 0.3,
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      {item.desc}
                    </motion.p>

                    <ul className="space-y-2.5">
                      {item.features.map((feature, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-center gap-2.5 text-sm" 
                          style={{ color: 'rgba(8,10,40,0.7)' }}
                          initial={false}
                          animate={{
                            opacity: isCurrent ? 1 : 0.3,
                            x: isCurrent ? 0 : -8,
                          }}
                          transition={{ 
                            duration: 0.5,
                            delay: isCurrent ? idx * 0.08 : 0,
                          }}
                        >
                          <Check 
                            className="w-4 h-4 flex-shrink-0" 
                            style={{ color: '#4945FF' }} 
                            strokeWidth={2.5} 
                          />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > current ? 1 : -1);
              setCurrent(index);
            }}
            className="transition-all duration-300"
            style={{
              width: index === current ? 32 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: index === current ? '#4945FF' : 'rgba(4,30,66,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
