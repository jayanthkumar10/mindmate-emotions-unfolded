import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Award, Sparkles, BarChart3, Heart, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function Growth() {
  const { user } = useAuth();
  const [moodData, setMoodData] = useState<any[]>([]);
  const [journalStats, setJournalStats] = useState<any>({});
  const [insights, setInsights] = useState<any[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchGrowthData();
    }
  }, [user]);

  const fetchGrowthData = async () => {
    try {
      // Fetch mood data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: moods } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Fetch journal entries
      const { data: journals } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      // Fetch insights
      const { data: userInsights } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setMoodData(moods || []);
      setInsights(userInsights || []);
      
      // Calculate journal stats
      if (journals) {
        const totalWords = journals.reduce((sum, journal) => sum + journal.content.split(' ').length, 0);
        const avgWordsPerEntry = journals.length > 0 ? Math.round(totalWords / journals.length) : 0;
        const themeFrequency = {};
        
        journals.forEach(journal => {
          if (journal.themes && Array.isArray(journal.themes)) {
            journal.themes.forEach((theme: string) => {
              themeFrequency[theme] = (themeFrequency[theme] || 0) + 1;
            });
          }
        });

        const topThemes = Object.entries(themeFrequency)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([theme, count]) => ({ theme, count: count as number }));

        setJournalStats({
          totalEntries: journals.length,
          totalWords,
          avgWordsPerEntry,
          topThemes,
        });

        // Calculate streak
        let streak = 0;
        const today = new Date();
        let checkDate = new Date(today);
        
        for (const journal of journals) {
          const journalDate = new Date(journal.created_at);
          const diffTime = Math.abs(checkDate.getTime() - journalDate.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) {
            streak++;
            checkDate = new Date(journalDate);
          } else {
            break;
          }
        }
        setCurrentStreak(streak);
      }
    } catch (error) {
      console.error('Error fetching growth data:', error);
    }
  };

  const getMoodTrend = () => {
    if (moodData.length < 2) return 'stable';
    const recent = moodData.slice(-7);
    const earlier = moodData.slice(-14, -7);
    
    if (recent.length === 0 || earlier.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, mood) => sum + mood.mood_value, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, mood) => sum + mood.mood_value, 0) / earlier.length;
    
    if (recentAvg > earlierAvg + 0.5) return 'improving';
    if (recentAvg < earlierAvg - 0.5) return 'declining';
    return 'stable';
  };

  const moodTrend = getMoodTrend();
  const avgMood = moodData.length > 0 
    ? moodData.reduce((sum, mood) => sum + mood.mood_value, 0) / moodData.length 
    : 0;

  const milestones = [
    { id: 1, title: 'First Journal Entry', achieved: journalStats.totalEntries > 0, icon: '📝' },
    { id: 2, title: '7-Day Streak', achieved: currentStreak >= 7, icon: '🔥' },
    { id: 3, title: '10 Entries', achieved: journalStats.totalEntries >= 10, icon: '📚' },
    { id: 4, title: '30-Day Streak', achieved: currentStreak >= 30, icon: '💎' },
    { id: 5, title: '50 Entries', achieved: journalStats.totalEntries >= 50, icon: '🏆' },
    { id: 6, title: 'Mood Tracker', achieved: moodData.length >= 7, icon: '😊' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Your Growth Journey</h1>
        <p className="text-slate-300 text-lg">
          Track your emotional wellness progress and celebrate your achievements
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-morphism border-white/10 text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="w-6 h-6 text-coral-400" />
                <span className="text-3xl font-bold text-white">{currentStreak}</span>
              </div>
              <p className="text-slate-300">Day Streak</p>
              <Badge 
                className={`mt-2 ${moodTrend === 'improving' ? 'bg-green-500' : 
                              moodTrend === 'declining' ? 'bg-red-500' : 'bg-blue-500'}`}
              >
                {moodTrend === 'improving' ? '📈 Improving' : 
                 moodTrend === 'declining' ? '📉 Needs attention' : '📊 Stable'}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-morphism border-white/10 text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Heart className="w-6 h-6 text-lavender-400" />
                <span className="text-3xl font-bold text-white">{avgMood.toFixed(1)}</span>
              </div>
              <p className="text-slate-300">Avg Mood</p>
              <div className="text-2xl mt-2">
                {avgMood >= 4 ? '😄' : avgMood >= 3 ? '😊' : avgMood >= 2 ? '😐' : '😔'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-morphism border-white/10 text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Brain className="w-6 h-6 text-green-400" />
                <span className="text-3xl font-bold text-white">{journalStats.totalEntries || 0}</span>
              </div>
              <p className="text-slate-300">Journal Entries</p>
              <p className="text-xs text-slate-400 mt-2">
                {journalStats.totalWords || 0} words total
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-morphism border-white/10 text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <span className="text-3xl font-bold text-white">{insights.length}</span>
              </div>
              <p className="text-slate-300">AI Insights</p>
              <p className="text-xs text-slate-400 mt-2">
                {insights.filter(i => !i.is_read).length} unread
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-coral-400" />
                <span>Milestones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * milestone.id }}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      milestone.achieved 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-slate-800/50 border border-slate-700/50'
                    }`}
                  >
                    <div className="text-2xl">{milestone.icon}</div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        milestone.achieved ? 'text-green-400' : 'text-slate-300'
                      }`}>
                        {milestone.title}
                      </p>
                    </div>
                    {milestone.achieved && (
                      <div className="text-green-400">
                        <Award className="w-5 h-5" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-lavender-400" />
                <span>Recent Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-coral-400/20 to-lavender-400/20 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-coral-400" />
                    </div>
                    <p className="text-slate-300 mb-4">No insights yet</p>
                    <p className="text-sm text-slate-400">Keep journaling to unlock AI-powered insights about your emotional patterns!</p>
                  </div>
                ) : (
                  insights.slice(0, 5).map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">{insight.title}</h4>
                        {!insight.is_read && (
                          <Badge className="bg-coral-500 text-white text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm">{insight.content}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(insight.created_at).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Themes */}
      {journalStats.topThemes && journalStats.topThemes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-coral-400" />
                <span>Your Top Themes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {journalStats.topThemes.map((theme, index) => (
                  <motion.div
                    key={theme.theme}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="text-center p-4 bg-gradient-to-r from-coral-500/10 to-lavender-500/10 rounded-lg border border-white/10"
                  >
                    <div className="text-2xl font-bold text-coral-400 mb-2">{theme.count}</div>
                    <div className="text-white font-medium capitalize">{theme.theme}</div>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-coral-400 to-lavender-400 h-2 rounded-full"
                        style={{ width: `${(theme.count / journalStats.topThemes[0].count) * 100}%` }}
                      ></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}