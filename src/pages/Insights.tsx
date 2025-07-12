import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Brain, Heart, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export default function Insights() {
  const { user } = useAuth();
  const [moodData, setMoodData] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [commonThemes, setCommonThemes] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    averageMood: 0,
    streak: 0,
  });

  useEffect(() => {
    if (user) {
      fetchMoodData();
      fetchInsights();
      fetchCommonThemes();
      fetchStats();
    }
  }, [user]);

  const fetchMoodData = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from('mood_entries')
      .select('mood_value, created_at')
      .eq('user_id', user?.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (data) {
      const chartData = data.map(entry => ({
        date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: entry.mood_value,
        fullDate: entry.created_at,
      }));
      setMoodData(chartData);
    }
  };

  const fetchInsights = async () => {
    const { data } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);

    setInsights(data || []);
  };

  const fetchCommonThemes = async () => {
    const { data } = await supabase
      .from('journal_entries')
      .select('themes')
      .eq('user_id', user?.id)
      .not('themes', 'is', null);

    if (data) {
      const allThemes = data.flatMap(entry => entry.themes || []);
      const themeCount = allThemes.reduce((acc: any, theme: string) => {
        acc[theme] = (acc[theme] || 0) + 1;
        return acc;
      }, {});

      const sortedThemes = Object.entries(themeCount)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 6)
        .map(([theme]) => theme);

      setCommonThemes(sortedThemes);
    }
  };

  const fetchStats = async () => {
    // Total entries
    const { count: totalEntries } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);

    // Average mood
    const { data: moodAvg } = await supabase
      .from('mood_entries')
      .select('mood_value')
      .eq('user_id', user?.id);

    const averageMood = moodAvg && moodAvg.length > 0 
      ? moodAvg.reduce((sum, entry) => sum + entry.mood_value, 0) / moodAvg.length
      : 0;

    // Writing streak (simplified - consecutive days with entries)
    const { data: recentEntries } = await supabase
      .from('journal_entries')
      .select('created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(30);

    let streak = 0;
    if (recentEntries && recentEntries.length > 0) {
      const today = new Date();
      let currentDate = new Date(today);
      
      for (const entry of recentEntries) {
        const entryDate = new Date(entry.created_at);
        const entryDateStr = entryDate.toDateString();
        const currentDateStr = currentDate.toDateString();
        
        if (entryDateStr === currentDateStr) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    setStats({
      totalEntries: totalEntries || 0,
      averageMood: Math.round(averageMood * 10) / 10,
      streak,
    });
  };

  const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
  const getMoodLabel = (value: number) => moodLabels[Math.round(value) - 1] || 'Unknown';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Insights & Analytics</h1>
        <p className="text-slate-300">Discover patterns in your emotional journey and personal growth</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-morphism border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Entries</p>
                  <p className="text-2xl font-bold text-white">{stats.totalEntries}</p>
                </div>
                <div className="w-12 h-12 bg-coral-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-coral-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-morphism border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Average Mood</p>
                  <p className="text-2xl font-bold text-white">{stats.averageMood}</p>
                  <p className="text-xs text-slate-500">{getMoodLabel(stats.averageMood)}</p>
                </div>
                <div className="w-12 h-12 bg-lavender-500/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-lavender-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-morphism border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Writing Streak</p>
                  <p className="text-2xl font-bold text-white">{stats.streak}</p>
                  <p className="text-xs text-slate-500">consecutive days</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Calendar className="w-5 h-5 text-coral-400" />
                <span>Mood Trend (30 Days)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {moodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      domain={[1, 5]} 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      labelFormatter={(value) => `Date: ${value}`}
                      formatter={(value: any) => [getMoodLabel(value), 'Mood']}
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="#FF6B6B"
                      fill="#FF6B6B"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No mood data yet</p>
                  <p className="text-sm text-slate-500 mt-2">Start tracking your mood to see trends</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Common Themes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Brain className="w-5 h-5 text-lavender-400" />
                <span>Common Themes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {commonThemes.length > 0 ? (
                <div className="space-y-3">
                  {commonThemes.map((theme, index) => (
                    <motion.div
                      key={theme}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <span className="text-white capitalize">{theme}</span>
                      <div className="w-2 h-2 bg-coral-400 rounded-full"></div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No themes detected yet</p>
                  <p className="text-sm text-slate-500 mt-2">Write more journal entries to discover patterns</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-morphism border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Brain className="w-5 h-5 text-coral-400" />
              <span>AI Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length > 0 ? (
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <h3 className="font-medium text-white mb-2">{insight.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{insight.content}</p>
                    <p className="text-xs text-slate-400 mt-3">
                      {new Date(insight.created_at).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No insights available yet</p>
                <p className="text-sm text-slate-500 mt-2">Keep journaling to receive personalized insights</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}