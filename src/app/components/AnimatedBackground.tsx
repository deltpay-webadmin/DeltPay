import { motion } from 'motion/react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated Waves with Grid Pattern */}
      <svg className="absolute w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* Grid Pattern */}
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(73, 69, 255, 0.1)" strokeWidth="0.5"/>
          </pattern>
          
          {/* Gradients with Grid */}
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0EAFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C7D9FF" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4E3FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#B8D0FF" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EBF3FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D9E7FF" stopOpacity="0.3" />
          </linearGradient>
          
          {/* Mask for grid on waves only */}
          <mask id="wave-mask">
            <motion.path
              d="M-100 200 Q 200 100, 400 200 T 800 200 T 1200 200 T 1600 200 L 1600 0 L -100 0 Z"
              fill="white"
              initial={{ d: "M-100 200 Q 200 100, 400 200 T 800 200 T 1200 200 T 1600 200 L 1600 0 L -100 0 Z" }}
              animate={{ 
                d: [
                  "M-100 200 Q 200 100, 400 200 T 800 200 T 1200 200 T 1600 200 L 1600 0 L -100 0 Z",
                  "M-100 250 Q 200 150, 400 250 T 800 250 T 1200 250 T 1600 250 L 1600 0 L -100 0 Z",
                  "M-100 200 Q 200 100, 400 200 T 800 200 T 1200 200 T 1600 200 L 1600 0 L -100 0 Z"
                ]
              }}
              transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M-100 300 Q 300 200, 600 300 T 1100 300 T 1600 300 L 1600 0 L -100 0 Z"
              fill="white"
              initial={{ d: "M-100 300 Q 300 200, 600 300 T 1100 300 T 1600 300 L 1600 0 L -100 0 Z" }}
              animate={{ 
                d: [
                  "M-100 300 Q 300 200, 600 300 T 1100 300 T 1600 300 L 1600 0 L -100 0 Z",
                  "M-100 350 Q 300 250, 600 350 T 1100 350 T 1600 350 L 1600 0 L -100 0 Z",
                  "M-100 300 Q 300 200, 600 300 T 1100 300 T 1600 300 L 1600 0 L -100 0 Z"
                ]
              }}
              transition={{ duration: 21.25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.path
              d="M-100 150 Q 250 80, 500 150 T 900 150 T 1300 150 T 1700 150 L 1700 0 L -100 0 Z"
              fill="white"
              initial={{ d: "M-100 150 Q 250 80, 500 150 T 900 150 T 1300 150 T 1700 150 L 1700 0 L -100 0 Z" }}
              animate={{ 
                d: [
                  "M-100 150 Q 250 80, 500 150 T 900 150 T 1300 150 T 1700 150 L 1700 0 L -100 0 Z",
                  "M-100 180 Q 250 110, 500 180 T 900 180 T 1300 180 T 1700 180 L 1700 0 L -100 0 Z",
                  "M-100 150 Q 250 80, 500 150 T 900 150 T 1300 150 T 1700 150 L 1700 0 L -100 0 Z"
                ]
              }}
              transition={{ duration: 15.3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </mask>
        </defs>
        
        {/* Wave 1 - Light blue */}
        <motion.path
          d="M-100 200 Q 200 100, 400 200 T 800 200 T 1200 200 T 1600 200 L 1600 0 L -100 0 Z"
          fill="url(#gradient1)"
          initial={{ d: "M-100 200 Q 200 100, 400 200 T 800 200 T 1200 200 T 1600 200 L 1600 0 L -100 0 Z" }}
          animate={{ 
            d: [
              "M-100 200 Q 200 100, 400 200 T 800 200 T 1200 200 T 1600 200 L 1600 0 L -100 0 Z",
              "M-100 250 Q 200 150, 400 250 T 800 250 T 1200 250 T 1600 250 L 1600 0 L -100 0 Z",
              "M-100 200 Q 200 100, 400 200 T 800 200 T 1200 200 T 1600 200 L 1600 0 L -100 0 Z"
            ]
          }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Wave 2 - Lighter blue */}
        <motion.path
          d="M-100 300 Q 300 200, 600 300 T 1100 300 T 1600 300 L 1600 0 L -100 0 Z"
          fill="url(#gradient2)"
          initial={{ d: "M-100 300 Q 300 200, 600 300 T 1100 300 T 1600 300 L 1600 0 L -100 0 Z" }}
          animate={{ 
            d: [
              "M-100 300 Q 300 200, 600 300 T 1100 300 T 1600 300 L 1600 0 L -100 0 Z",
              "M-100 350 Q 300 250, 600 350 T 1100 350 T 1600 350 L 1600 0 L -100 0 Z",
              "M-100 300 Q 300 200, 600 300 T 1100 300 T 1600 300 L 1600 0 L -100 0 Z"
            ]
          }}
          transition={{ duration: 21.25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        {/* Wave 3 - Very light blue */}
        <motion.path
          d="M-100 150 Q 250 80, 500 150 T 900 150 T 1300 150 T 1700 150 L 1700 0 L -100 0 Z"
          fill="url(#gradient3)"
          initial={{ d: "M-100 150 Q 250 80, 500 150 T 900 150 T 1300 150 T 1700 150 L 1700 0 L -100 0 Z" }}
          animate={{ 
            d: [
              "M-100 150 Q 250 80, 500 150 T 900 150 T 1300 150 T 1700 150 L 1700 0 L -100 0 Z",
              "M-100 180 Q 250 110, 500 180 T 900 180 T 1300 180 T 1700 180 L 1700 0 L -100 0 Z",
              "M-100 150 Q 250 80, 500 150 T 900 150 T 1300 150 T 1700 150 L 1700 0 L -100 0 Z"
            ]
          }}
          transition={{ duration: 15.3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        
        {/* Grid overlay - only on wave areas */}
        <rect width="100%" height="100%" fill="url(#grid-pattern)" mask="url(#wave-mask)" opacity="0.4" />
      </svg>
      
      {/* Additional floating orbs for depth */}
      <motion.div
        className="absolute top-20 right-1/4 w-64 h-64 bg-[#4945FF] opacity-5 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12.75, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-32 left-1/4 w-96 h-96 bg-[#7C9CFF] opacity-5 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      {/* Gradient fade at bottom to blend with rest of page */}

    </div>
  );
}
