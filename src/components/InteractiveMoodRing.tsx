
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const InteractiveMoodRing = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="absolute -bottom-20 -right-20 w-64 h-64 pointer-events-auto cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Outer Ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-gradient-to-r from-coral-400 to-lavender-400"
        animate={{
          rotate: [0, 360],
          borderColor: isHovered 
            ? ['#FF6B6B', '#E8E2FF', '#FF6B6B'] 
            : ['#FF6B6B', '#FF6B6B']
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          borderColor: { duration: 2, repeat: Infinity }
        }}
        style={{
          background: `conic-gradient(from 0deg, 
            rgba(255, 107, 107, 0.3), 
            rgba(232, 226, 255, 0.3), 
            rgba(255, 107, 107, 0.3))`
        }}
      />

      {/* Inner Pulsing Circle */}
      <motion.div
        className="absolute inset-8 rounded-full bg-gradient-to-br from-coral-500/20 to-lavender-500/20 backdrop-blur-sm"
        animate={{
          scale: isHovered ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Center Dot */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: isHovered ? [0, 180, 360] : 0 }}
        transition={{ duration: 2 }}
      >
        <div className="w-8 h-8 rounded-full bg-white/80 shadow-lg" />
      </motion.div>

      {/* Floating Mood Indicators */}
      {[...Array(6)].map((_, index) => {
        const angle = (index * 60) * (Math.PI / 180);
        const radius = 80;
        return (
          <motion.div
            key={index}
            className="absolute w-3 h-3 rounded-full bg-white/60"
            style={{
              left: '50%',
              top: '50%',
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
            }}
            animate={{
              scale: isHovered ? [1, 1.5, 1] : [1, 1.2, 1],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: 2,
              delay: index * 0.2,
              repeat: Infinity
            }}
          />
        );
      })}
    </motion.div>
  );
};
