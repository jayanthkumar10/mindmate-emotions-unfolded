
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingJournalPages } from '@/components/FloatingJournalPages';
import { InteractiveMoodRing } from '@/components/InteractiveMoodRing';

export const HeroSection = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        className="max-w-7xl mx-auto px-6 text-center relative z-10"
        style={{ y, opacity }}
      >
        {/* Main Headlines */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-6"
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-lavender-200 to-coral-200 bg-clip-text text-transparent leading-tight"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            style={{
              backgroundSize: '200% 200%'
            }}
          >
            Your AI Companion
            <br />
            for Inner Growth
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Journal your thoughts, discover patterns, and grow with AI-powered insights 
            that understand your emotional journey
          </motion.p>
        </motion.div>

        {/* Interactive Elements */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <Button 
            size="lg"
            className="bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-coral-500/25 transition-all duration-300 group"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Start Your Journey
            </motion.span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg"
            className="text-white border border-white/20 hover:bg-white/10 px-8 py-4 rounded-full text-lg backdrop-blur-sm group"
          >
            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Watch Demo
          </Button>
        </motion.div>

        {/* Floating Elements */}
        <FloatingJournalPages />
        <InteractiveMoodRing />
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-8 h-8 text-white/60" />
      </motion.div>
    </section>
  );
};
