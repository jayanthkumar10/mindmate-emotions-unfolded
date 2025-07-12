
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Heart, Users, Clock, AlertCircle } from 'lucide-react';

export const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const problems = [
    {
      icon: Heart,
      title: "Emotional Isolation",
      description: "Millions feel alone with their thoughts, struggling to process complex emotions without judgment or understanding."
    },
    {
      icon: Clock,
      title: "No Time for Self-Care",
      description: "Busy lives leave little room for reflection, causing stress and emotions to build up without healthy outlets."
    },
    {
      icon: Users,
      title: "Lack of Safe Spaces",
      description: "Traditional therapy is expensive and inaccessible, while friends and family may not always understand."
    },
    {
      icon: AlertCircle,
      title: "Missed Warning Signs",
      description: "Without tracking patterns, we miss early signals of burnout, depression, or emotional overwhelm."
    }
  ];

  return (
    <section ref={ref} className="py-24 px-6 relative" id="problem">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
            animate={isInView ? { 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
            } : {}}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            Everyone Deserves to Feel
            <span className="block bg-gradient-to-r from-coral-400 to-lavender-400 bg-clip-text text-transparent">
              Understood
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            In our connected world, emotional loneliness has reached epidemic levels. 
            We're here to change that, one conversation at a time.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <motion.div
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full hover:bg-white/10 transition-all duration-300"
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                }}
                animate={{
                  y: [0, -5, 0]
                }}
                transition={{
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.5,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.div
                  className="w-16 h-16 mb-6 bg-gradient-to-br from-coral-500/20 to-lavender-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  <problem.icon className="w-8 h-8 text-coral-400" />
                </motion.div>
                
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-coral-300 transition-colors">
                  {problem.title}
                </h3>
                
                <p className="text-white/70 leading-relaxed">
                  {problem.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Emotional Connection Visual */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="relative inline-block">
            <motion.div
              className="text-6xl mb-4"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              💙
            </motion.div>
            <p className="text-white/60 text-lg">
              Your emotions matter. Your story matters. You matter.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
