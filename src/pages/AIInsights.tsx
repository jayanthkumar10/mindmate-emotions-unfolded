import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, TrendingUp, MessageSquare, Calendar, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Insight {
  id: string;
  title: string;
  content: string;
  insight_type: string;
  is_read: boolean;
  created_at: string;
  data: any;
}

export default function AIInsights() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: "Error",
        description: "Failed to load insights.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    setGeneratingInsights(true);
    try {
      // Fetch recent journal entries and mood data
      const { data: journalEntries } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: moodEntries } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Generate insights even with minimal data
      if (!journalEntries || journalEntries.length === 0) {
        toast({
          title: "No data available",
          description: "Write at least one journal entry to generate insights.",
          variant: "destructive",
        });
        return;
      }

      // Call AI service to generate insights using Supabase function invoke
      const { data: aiResponse, error: functionError } = await supabase.functions.invoke('ai-companion', {
        body: {
          message: `Generate personalized insights about my emotional wellness journey. I have ${journalEntries.length} journal entries and ${moodEntries?.length || 0} mood entries.`,
          type: 'generate_insights',
          context: {
            journalEntries: journalEntries,
            moodEntries: moodEntries || [],
            userId: user?.id,
          },
        },
      });

      if (functionError) {
        throw new Error('Failed to generate insights');
      }
      
      // Create mock insights if AI doesn't return proper format
      let insightsToCreate = [];
      
      if (aiResponse.insights && Array.isArray(aiResponse.insights)) {
        insightsToCreate = aiResponse.insights;
      } else {
        // Generate basic insights based on available data
        insightsToCreate = [
          {
            title: "Emotional Journey Analysis",
            content: `Based on your ${journalEntries.length} journal entries, you've been actively engaging in self-reflection. This is a positive step towards emotional wellness.`,
            type: 'pattern',
            data: { entryCount: journalEntries.length }
          },
          {
            title: "Growth Opportunity",
            content: "Consistent journaling shows your commitment to personal growth. Consider setting specific emotional wellness goals to track your progress.",
            type: 'growth',
            data: {}
          }
        ];
        
        if (moodEntries && moodEntries.length > 0) {
          const avgMood = moodEntries.reduce((sum, entry) => sum + entry.mood_value, 0) / moodEntries.length;
          insightsToCreate.push({
            title: "Mood Pattern Insight",
            content: `Your average mood rating is ${avgMood.toFixed(1)}/5. ${avgMood >= 3 ? 'You generally maintain a positive outlook!' : 'Consider exploring strategies to boost your emotional wellbeing.'}`,
            type: 'mood',
            data: { averageMood: avgMood }
          });
        }
      }
      
      for (const insight of insightsToCreate) {
        await supabase.from('insights').insert({
          user_id: user?.id,
          title: insight.title,
          content: insight.content,
          insight_type: insight.type || 'pattern',
          data: insight.data || {},
        });
      }

      await fetchInsights();
      
      toast({
        title: "Success",
        description: `Generated ${insightsToCreate.length} new insights!`,
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate new insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingInsights(false);
    }
  };

  const markAsRead = async (insightId: string) => {
    try {
      await supabase
        .from('insights')
        .update({ is_read: true })
        .eq('id', insightId)
        .eq('user_id', user?.id);

      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, is_read: true }
            : insight
        )
      );
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  const filteredInsights = insights.filter(insight => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !insight.is_read;
    return insight.insight_type === activeTab;
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return TrendingUp;
      case 'mood': return Brain;
      case 'growth': return Sparkles;
      case 'advice': return MessageSquare;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'from-blue-400 to-blue-600';
      case 'mood': return 'from-green-400 to-green-600';
      case 'growth': return 'from-purple-400 to-purple-600';
      case 'advice': return 'from-coral-400 to-coral-600';
      default: return 'from-slate-400 to-slate-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Insights</h1>
          <p className="text-slate-300">
            Discover patterns and growth opportunities from your emotional wellness journey
          </p>
        </div>
        <Button
          onClick={generateNewInsights}
          disabled={generatingInsights}
          className="bg-gradient-to-r from-coral-500 to-lavender-500 hover:from-coral-600 hover:to-lavender-600 text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${generatingInsights ? 'animate-spin' : ''}`} />
          {generatingInsights ? 'Generating...' : 'Generate New Insights'}
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-morphism border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-coral-400" />
              <span className="text-2xl font-bold text-white">{insights.length}</span>
            </div>
            <p className="text-slate-300 text-sm">Total Insights</p>
          </CardContent>
        </Card>
        
        <Card className="glass-morphism border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Eye className="w-5 h-5 text-lavender-400" />
              <span className="text-2xl font-bold text-white">{insights.filter(i => !i.is_read).length}</span>
            </div>
            <p className="text-slate-300 text-sm">Unread</p>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-white">{insights.filter(i => i.insight_type === 'pattern').length}</span>
            </div>
            <p className="text-slate-300 text-sm">Patterns</p>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Brain className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">{insights.filter(i => i.insight_type === 'growth').length}</span>
            </div>
            <p className="text-slate-300 text-sm">Growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 bg-slate-800/50">
          <TabsTrigger value="all" className="data-[state=active]:bg-coral-500">All</TabsTrigger>
          <TabsTrigger value="unread" className="data-[state=active]:bg-coral-500">Unread</TabsTrigger>
          <TabsTrigger value="pattern" className="data-[state=active]:bg-coral-500">Patterns</TabsTrigger>
          <TabsTrigger value="mood" className="data-[state=active]:bg-coral-500">Mood</TabsTrigger>
          <TabsTrigger value="growth" className="data-[state=active]:bg-coral-500">Growth</TabsTrigger>
          <TabsTrigger value="advice" className="data-[state=active]:bg-coral-500">Advice</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-12"
              >
                <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin"></div>
              </motion.div>
            ) : filteredInsights.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-coral-400/20 to-lavender-400/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-coral-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">No insights yet</h3>
                <p className="text-slate-300 mb-6">
                  {activeTab === 'unread' 
                    ? "All insights have been read!" 
                    : "Start journaling to unlock AI-powered insights about your emotional patterns and growth opportunities."
                  }
                </p>
                <Button
                  onClick={generateNewInsights}
                  disabled={generatingInsights}
                  className="bg-coral-500 hover:bg-coral-600 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Your First Insights
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid gap-4"
              >
                {filteredInsights.map((insight, index) => {
                  const IconComponent = getInsightIcon(insight.insight_type);
                  const colorClass = getInsightColor(insight.insight_type);
                  
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`glass-morphism border-white/10 ${!insight.is_read ? 'ring-2 ring-coral-400/30' : ''} hover:border-white/20 transition-all duration-200`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="font-semibold text-white text-lg">{insight.title}</h3>
                                  {!insight.is_read && (
                                    <Badge className="bg-coral-500 text-white text-xs">New</Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 capitalize">
                                    {insight.insight_type}
                                  </Badge>
                                </div>
                                <p className="text-slate-300 leading-relaxed mb-3">{insight.content}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-slate-400">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    {new Date(insight.created_at).toLocaleDateString()} at {new Date(insight.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {!insight.is_read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsRead(insight.id)}
                                  className="text-slate-400 hover:text-white hover:bg-white/10"
                                >
                                  <EyeOff className="w-4 h-4 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}