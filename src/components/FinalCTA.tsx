
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FinalCTA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-24 px-6 relative">
      <div className="max-w-4xl mx-auto text-center">
        {/* Background Effects */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-coral-500/10 via-lavender-500/10 to-coral-500/10 rounded-3xl backdrop-blur-sm"
          animate={isInView ? {
            background: [
              'radial-gradient(circle at 0% 50%, rgba(255,107,107,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 50%, rgba(232,226,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 0%, rgba(255,107,107,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 100%, rgba(232,226,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 50%, rgba(255,107,107,0.1) 0%, transparent 50%)',
            ]
          } : {}}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              animate={{
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 200 - 100],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: Math.random() * 8 + 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Sparkle Icon */}
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-coral-500/20 to-lavender-500/20 rounded-full"
              animate={isInView ? {
                scale: [1, 1.1, 1],
                rotate: [0, 360]
              } : {}}
              transition={{
                scale: { duration: 2, repeat: Infinity },
                rotate: { duration: 4, repeat: Infinity }
              }}
            >
              <Sparkles className="w-10 h-10 text-coral-400" />
            </motion.div>

            <motion.h2 
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-coral-200 to-lavender-200 bg-clip-text text-transparent leading-tight"
              animate={isInView ? { 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
              } : {}}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            >
              Begin Your Journey to
              <br />
              Self-Understanding
            </motion.h2>
            
            <motion.p 
              className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Join thousands who have discovered deeper self-awareness and emotional 
              balance through AI-powered companionship. Your transformation starts today.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white px-12 py-6 rounded-full text-xl font-semibold shadow-2xl hover:shadow-coral-500/25 transition-all duration-300 group"
                >
                  Start Your Journey
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 px-12 py-6 rounded-full text-xl backdrop-blur-sm group"
                >
                  <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Try Demo Now
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Badge */}
            <motion.p 
              className="text-white/50 text-sm mt-8"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.6 }}
            >
              ✓ No credit card required  ✓ Start free forever  ✓ Your data stays private
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
