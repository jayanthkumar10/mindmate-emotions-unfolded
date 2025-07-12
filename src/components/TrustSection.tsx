
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Lock, Eye, Server, UserCheck, Shield, Key } from 'lucide-react';

export const TrustSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const trustFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "Your journal entries are encrypted before they leave your device. Not even we can read them."
    },
    {
      icon: Eye,
      title: "No Data Selling",
      description: "We never sell your personal data. Your information is not our product - your wellbeing is."
    },
    {
      icon: Server,
      title: "Local Processing",
      description: "Sensitive analysis happens on your device. Your most private thoughts never leave your control."
    },
    {
      icon: UserCheck,
      title: "You Own Your Data",
      description: "Export or delete your data anytime. Complete transparency about what we store and why."
    }
  ];

  return (
    <section ref={ref} className="py-24 px-6 relative" id="privacy">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 mb-8 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full"
            animate={isInView ? {
              scale: [1, 1.1, 1],
              rotateY: [0, 180, 360]
            } : {}}
            transition={{
              scale: { duration: 2, repeat: Infinity },
              rotateY: { duration: 4, repeat: Infinity }
            }}
          >
            <Shield className="w-10 h-10 text-green-400" />
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
            Your Privacy is
            <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Sacred
            </span>
          </h2>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            We believe mental health support should never come at the cost of your privacy. 
            That's why we've built privacy protection into every aspect of MindMate.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="group text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <motion.div
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full hover:bg-white/10 transition-all duration-300"
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                }}
                animate={{
                  y: [0, -5, 0]
                }}
                transition={{
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.div
                  className="w-16 h-16 mb-6 mx-auto bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  <feature.icon className="w-8 h-8 text-green-400" />
                </motion.div>
                
                <h3 className="text-lg font-semibold text-white mb-4 group-hover:text-green-300 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-white/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Security Badges */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {[
            { label: "SOC 2 Compliant", icon: Shield },
            { label: "GDPR Ready", icon: UserCheck },
            { label: "256-bit Encryption", icon: Key },
          ].map((badge, index) => (
            <motion.div
              key={index}
              className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3"
              whileHover={{ scale: 1.05 }}
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                opacity: {
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5
                }
              }}
            >
              <badge.icon className="w-5 h-5 text-green-400" />
              <span className="text-white/80 text-sm font-medium">{badge.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
