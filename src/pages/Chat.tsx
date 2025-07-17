import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading chat history:', error);
    } else {
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        type: msg.message_type as 'user' | 'ai',
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));
      setMessages(formattedMessages);
    }
  };

  const getContextForAI = async () => {
    // Get ALL journal entries for comprehensive knowledge base
    const { data: journalEntries } = await supabase
      .from('journal_entries')
      .select('content, title, themes, sentiment_score, mood_label, mood_value, created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    // Get ALL mood entries for pattern analysis
    const { data: moodEntries } = await supabase
      .from('mood_entries')
      .select('mood_value, mood_label, created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user?.id)
      .single();

    return {
      allJournalEntries: journalEntries || [],
      allMoodEntries: moodEntries || [],
      userProfile: profile,
      conversationHistory: messages.slice(-10), // Extended context
      totalEntries: journalEntries?.length || 0,
      totalMoods: moodEntries?.length || 0,
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setLoading(true);

    try {
      // Save user message to database
      await supabase.from('chat_messages').insert({
        user_id: user?.id,
        message_type: 'user',
        content: userMessage.content,
      });

      // Get context for AI
      const context = await getContextForAI();

      // Send to AI using Supabase edge function invoke
      const { data: aiData, error: functionError } = await supabase.functions.invoke('ai-companion', {
        body: {
          message: userMessage.content,
          context,
          type: 'chat',
        },
      });

      if (functionError) {
        throw functionError;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiData.response || 'I apologize, but I encountered an issue processing your message. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save AI message to database
      await supabase.from('chat_messages').insert({
        user_id: user?.id,
        message_type: 'ai',
        content: aiMessage.content,
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">AI Companion</h1>
        <p className="text-slate-300">Have a conversation with your personal AI companion</p>
      </motion.div>

      <Card className="flex-1 flex flex-col glass-morphism border-white/10">
        <CardHeader className="py-4">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Bot className="w-5 h-5 text-coral-400" />
            <span>MindMate AI</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto"></div>
          </CardTitle>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-coral-400/20 to-lavender-400/20 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-coral-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Welcome to MindMate AI</h3>
                <p className="text-slate-300 max-w-lg mx-auto mb-6 leading-relaxed">
                  I'm your compassionate AI companion, here to provide emotional support and insights. 
                  I can help you process feelings, work through challenges, and celebrate your growth.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-coral-400 font-medium mb-2">💭 Feeling Overwhelmed?</h4>
                    <p className="text-slate-400 text-sm">"I'm feeling stressed about work and don't know how to manage it all."</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-lavender-400 font-medium mb-2">🌱 Personal Growth</h4>
                    <p className="text-slate-400 text-sm">"How can I build better habits and stay motivated?"</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-coral-400 font-medium mb-2">💙 Relationship Support</h4>
                    <p className="text-slate-400 text-sm">"I'm having trouble communicating with someone I care about."</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-lavender-400 font-medium mb-2">✨ Celebrating Wins</h4>
                    <p className="text-slate-400 text-sm">"I accomplished something important and want to share!"</p>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-coral-500 text-white'
                        : 'bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'ai' && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-coral-400 to-lavender-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className={`text-xs mt-2 opacity-70 ${
                          message.type === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 border border-white/10 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-coral-400 to-lavender-400 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={messages.length === 0 ? "Share what's on your mind..." : "Continue the conversation..."}
                disabled={loading}
                className="flex-1 bg-white/5 border-white/10 focus:border-coral-400 text-white placeholder:text-slate-400"
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="bg-coral-500 hover:bg-coral-600 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}