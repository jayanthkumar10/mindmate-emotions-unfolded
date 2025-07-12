
import React from 'react';
import { motion } from 'framer-motion';

export const FloatingJournalPages = () => {
  const pages = [
    { x: -200, y: -100, rotation: -15, delay: 0 },
    { x: 200, y: -50, rotation: 12, delay: 0.5 },
    { x: -150, y: 100, rotation: -8, delay: 1 },
    { x: 250, y: 120, rotation: 18, delay: 1.5 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {pages.map((page, index) => (
        <motion.div
          key={index}
          className="absolute w-32 h-40 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-2xl"
          initial={{ 
            x: page.x, 
            y: page.y, 
            rotate: page.rotation,
            opacity: 0,
            scale: 0.8
          }}
          animate={{ 
            x: page.x + Math.sin(Date.now() * 0.001 + index) * 20,
            y: page.y + Math.cos(Date.now() * 0.001 + index) * 15,
            rotate: page.rotation + Math.sin(Date.now() * 0.002 + index) * 5,
            opacity: 0.6,
            scale: 1
          }}
          transition={{ 
            duration: 2, 
            delay: page.delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Page Lines */}
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, lineIndex) => (
              <motion.div
                key={lineIndex}
                className="h-1 bg-white/30 rounded"
                style={{ width: `${Math.random() * 40 + 60}%` }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ 
                  duration: 3, 
                  delay: lineIndex * 0.1,
                  repeat: Infinity 
                }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
