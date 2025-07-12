
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Brain, Shield, TrendingUp, Heart, Clock, Zap } from 'lucide-react';

export const FeatureCards = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const features = [
    {
      icon: Brain,
      title: "Smart Memory",
      subtitle: "I remember what matters to you",
      description: "Your AI companion learns from every conversation, remembering important details about your life, goals, and challenges to provide truly personalized support.",
      gradient: "from-blue-500 to-purple-600",
      bgGradient: "from-blue-500/10 to-purple-600/10"
    },
    {
      icon: TrendingUp,
      title: "Mood Analytics",
      subtitle: "See patterns in your emotional journey",
      description: "Beautiful visualizations help you understand your emotional patterns over time, identifying triggers and celebrating your growth milestones.",
      gradient: "from-green-500 to-teal-600",
      bgGradient: "from-green-500/10 to-teal-600/10"
    },
    {
      icon: Shield,
      title: "Privacy First",
      subtitle: "Your thoughts, your control",
      description: "Bank-level encryption ensures your personal reflections remain completely private. You own your data, and you decide who sees it.",
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-500/10 to-red-600/10"
    },
    {
      icon: Heart,
      title: "Proactive Care",
      subtitle: "Support when you need it most",
      description: "Advanced emotional intelligence detects when you might need extra support, offering gentle check-ins and helpful resources.",
      gradient: "from-pink-500 to-rose-600",
      bgGradient: "from-pink-500/10 to-rose-600/10"
    },
    {
      icon: Clock,
      title: "Perfect Timing",
      subtitle: "Available 24/7 for your schedule",
      description: "No appointments needed. Your AI companion is always there when you need to talk, whether it's 3 AM or during your lunch break.",
      gradient: "from-indigo-500 to-blue-600",
      bgGradient: "from-indigo-500/10 to-blue-600/10"
    },
    {
      icon: Zap,
      title: "Instant Insights",
      subtitle: "Immediate understanding and support",
      description: "Get real-time emotional insights and coping strategies tailored to your current state of mind and personal history.",
      gradient: "from-yellow-500 to-orange-600",
      bgGradient: "from-yellow-500/10 to-orange-600/10"
    }
  ];

  return (
    <section ref={ref} className="py-24 px-6" id="features">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-lavender-200 bg-clip-text text-transparent">
            Designed for Your
            <span className="block bg-gradient-to-r from-coral-400 to-lavender-400 bg-clip-text text-transparent">
              Emotional Wellbeing
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Every feature is crafted to support your mental health journey with intelligence, empathy, and respect for your privacy.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <motion.div
                className={`relative bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm border border-white/10 rounded-3xl p-8 h-full overflow-hidden group-hover:border-white/20 transition-all duration-500`}
                whileHover={{ 
                  scale: 1.02, 
                  y: -8,
                  boxShadow: "0 25px 50px rgba(0,0,0,0.4)"
                }}
                animate={{
                  y: [0, -3, 0]
                }}
                transition={{
                  y: {
                    duration: 6,
                    repeat: Infinity,
                    delay: index * 0.3,
                    ease: "easeInOut"
                  }
                }}
              >
                {/* Glassmorphism background effect */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-lg" />
                
                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    className={`w-16 h-16 mb-6 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 10 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-coral-300 group-hover:to-lavender-300 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-coral-300 font-semibold mb-4 text-sm uppercase tracking-wide">
                    {feature.subtitle}
                  </p>
                  
                  <p className="text-white/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Floating decorative elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                />
                
                <motion.div
                  className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-white/5 backdrop-blur-sm"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
