
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Quote, Star } from 'lucide-react';

export const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Manager",
      content: "MindMate helped me recognize patterns in my stress that I never noticed before. The AI insights are surprisingly accurate and genuinely helpful.",
      rating: 5,
      mood: "More self-aware"
    },
    {
      name: "Marcus Rodriguez",
      role: "Graduate Student",
      content: "Having someone to talk to at 2 AM when anxiety hits different. The privacy aspect makes me feel safe to be completely honest.",
      rating: 5,
      mood: "Less anxious"
    },
    {
      name: "Emma Thompson",
      role: "Startup Founder",
      content: "The proactive check-ins during high-stress periods are game-changing. It's like having a therapist who knows exactly when I need support.",
      rating: 5,
      mood: "More balanced"
    }
  ];

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-coral-200 bg-clip-text text-transparent">
            Real Stories of
            <span className="block bg-gradient-to-r from-coral-400 to-lavender-400 bg-clip-text text-transparent">
              Transformation
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Join thousands who have found their path to better mental health with MindMate
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <motion.div
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 h-full relative overflow-hidden group-hover:bg-white/10 transition-all duration-300"
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                  boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
                }}
                animate={{
                  y: [0, -3, 0]
                }}
                transition={{
                  y: {
                    duration: 5,
                    repeat: Infinity,
                    delay: index * 0.4,
                    ease: "easeInOut"
                  }
                }}
              >
                {/* Quote Icon */}
                <motion.div
                  className="absolute top-6 right-6 opacity-20"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Quote className="w-12 h-12 text-coral-400" />
                </motion.div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <Star className="w-5 h-5 fill-coral-400 text-coral-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Content */}
                <motion.p 
                  className="text-white/80 leading-relaxed mb-6 text-lg"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.3 }}
                >
                  "{testimonial.content}"
                </motion.p>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-white/60 text-sm">{testimonial.role}</div>
                  </div>
                  
                  <motion.div
                    className="bg-gradient-to-r from-coral-500/20 to-lavender-500/20 rounded-full px-3 py-1"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <span className="text-coral-300 text-sm font-medium">
                      {testimonial.mood}
                    </span>
                  </motion.div>
                </div>

                {/* Decorative gradient */}
                <motion.div
                  className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-coral-500/10 to-lavender-500/10 rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {[
            { value: "50K+", label: "Active Users" },
            { value: "95%", label: "Feel More Understood" },
            { value: "2.5M+", label: "Journal Entries" },
            { value: "4.9★", label: "Average Rating" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 1 + index * 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-coral-400 to-lavender-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
