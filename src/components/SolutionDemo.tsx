
import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MessageCircle, BarChart3, Brain, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const SolutionDemo = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeTab, setActiveTab] = useState('journal');

  const tabs = [
    { id: 'journal', label: 'Smart Journaling', icon: MessageCircle },
    { id: 'insights', label: 'Mood Analytics', icon: BarChart3 },
    { id: 'chat', label: 'AI Companion', icon: Brain },
  ];

  const renderDemoContent = () => {
    switch (activeTab) {
      case 'journal':
        return (
          <motion.div
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key="journal"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">Today's Entry</h4>
                <span className="text-coral-400 text-sm">😊 Optimistic</span>
              </div>
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-white/80 leading-relaxed">
                  Had a challenging day at work, but I'm proud of how I handled the pressure. 
                  I took breaks when needed and asked for help...
                </p>
                <motion.div
                  className="flex items-center space-x-2 text-sm text-white/60"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI is analyzing your emotional patterns...</span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        );
      case 'insights':
        return (
          <motion.div
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key="insights"
          >
            <h4 className="text-white font-semibold mb-4">Your Growth Journey</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Happy Days', value: '65%', color: 'from-green-400 to-green-600' },
                  { label: 'Mindful Moments', value: '23', color: 'from-blue-400 to-blue-600' },
                  { label: 'Growth Insights', value: '12', color: 'from-purple-400 to-purple-600' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/60">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 'chat':
        return (
          <motion.div
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key="chat"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-coral-400 to-lavender-400 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium">MindMate AI</span>
              </div>
              <motion.p
                className="text-white/80 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                I noticed you mentioned feeling overwhelmed yesterday, but today you seem more balanced. 
                What helped you shift your perspective?
              </motion.p>
              <motion.div
                className="flex items-center space-x-2 text-coral-400 text-sm"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-coral-400 rounded-full animate-pulse" />
                <span>Typing...</span>
              </motion.div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <section ref={ref} className="py-24 px-6" id="demo">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-coral-200 bg-clip-text text-transparent">
            Meet Your AI Companion
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Experience the future of emotional wellness through intelligent journaling and personalized insights
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Demo Interface */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Tab Navigation */}
            <div className="flex space-x-2 mb-6">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  } transition-all duration-300`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Demo Content */}
            <motion.div
              className="min-h-[300px]"
              animate={{ 
                scale: [1, 1.01, 1],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {renderDemoContent()}
            </motion.div>
          </motion.div>

          {/* Features List */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {[
              {
                title: "Intelligent Pattern Recognition",
                description: "Our AI learns your unique emotional patterns and provides personalized insights to help you understand yourself better."
              },
              {
                title: "Privacy-First Design", 
                description: "Your thoughts remain yours. End-to-end encryption ensures your journal entries are completely private and secure."
              },
              {
                title: "Proactive Mental Health",
                description: "Get gentle reminders and support before small stresses become overwhelming challenges."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-coral-500/20 to-lavender-500/20 rounded-xl flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Sparkles className="w-6 h-6 text-coral-400" />
                </motion.div>
                <div>
                  <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
