
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HeroSection } from '@/components/HeroSection';
import { ProblemSection } from '@/components/ProblemSection';
import { SolutionDemo } from '@/components/SolutionDemo';
import { FeatureCards } from '@/components/FeatureCards';
import { TrustSection } from '@/components/TrustSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { FinalCTA } from '@/components/FinalCTA';
import { Navigation } from '@/components/Navigation';

const Index = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        className="fixed inset-0 pointer-events-none"
        style={{ 
          opacity: backgroundOpacity,
          scale: backgroundScale
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/30 to-pink-600/20" />
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Interactive cursor effect */}
      <motion.div
        className="fixed w-4 h-4 bg-coral-500/50 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
      />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection />
        <ProblemSection />
        <SolutionDemo />
        <FeatureCards />
        <TrustSection />
        <TestimonialsSection />
        <FinalCTA />
      </main>
    </div>
  );
};

export default Index;
