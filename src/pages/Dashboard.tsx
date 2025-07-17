import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MessageCircle, BarChart3, Smile, Bell, User, Sparkles, TrendingUp, Calendar, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import MoodSelector from '@/components/MoodSelector';

const moodEmojis = ['😢', '😕', '😐', '😊', '😄'];
const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [isSubmittingMood, setIsSubmittingMood] = useState(false);
  const [stats, setStats] = useState({
    totalEntries: 0,
    currentStreak: 0,
    weeklyMoodAvg: 0,
    unreadInsights: 0
  });
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchRecentEntries();
      fetchTodayMood();
      fetchStats();
      checkFirstVisit();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const fetchRecentEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, title, content, created_at, mood_label, mood_value')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) {
        console.error('Error fetching entries:', error);
      } else {
        setRecentEntries(data || []);
      }
    } catch (error) {
      console.error('Entries fetch error:', error);
    }
  };

  const fetchTodayMood = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('mood_entries')
        .select('mood_value')
        .eq('user_id', user?.id)
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching today mood:', error);
      } else if (data && data.length > 0) {
        setTodayMood(data[0].mood_value);
      }
    } catch (error) {
      console.error('Today mood fetch error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total entries count
      const { count: totalEntries } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Get current streak
      const { data: entries } = await supabase
        .from('journal_entries')
        .select('created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      // Get weekly mood average
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: weeklyMoods } = await supabase
        .from('mood_entries')
        .select('mood_value')
        .eq('user_id', user?.id)
        .gte('created_at', weekAgo.toISOString());

      // Get unread insights count
      const { count: unreadInsights } = await supabase
        .from('insights')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      // Calculate streak
      let currentStreak = 0;
      if (entries && entries.length > 0) {
        const today = new Date();
        let checkDate = new Date(today);
        
        for (const entry of entries) {
          const entryDate = new Date(entry.created_at);
          const diffTime = Math.abs(checkDate.getTime() - entryDate.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) {
            currentStreak++;
            checkDate = new Date(entryDate);
          } else {
            break;
          }
        }
      }

      // Calculate average mood
      const weeklyMoodAvg = weeklyMoods && weeklyMoods.length > 0 
        ? weeklyMoods.reduce((sum, mood) => sum + mood.mood_value, 0) / weeklyMoods.length
        : 0;

      setStats({
        totalEntries: totalEntries || 0,
        currentStreak,
        weeklyMoodAvg: Math.round(weeklyMoodAvg * 10) / 10,
        unreadInsights: unreadInsights || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const checkFirstVisit = async () => {
    try {
      const { data: entries } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1);
      
      setIsFirstVisit(!entries || entries.length === 0);
    } catch (error) {
      console.error('Error checking first visit:', error);
    }
  };

  const handleMoodSubmit = async (moodValue: number) => {
    if (isSubmittingMood) return;
    
    setIsSubmittingMood(true);
    try {
      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user?.id,
          mood_value: moodValue,
          mood_label: moodLabels[moodValue - 1],
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save mood. Please try again.",
          variant: "destructive",
        });
      } else {
        setTodayMood(moodValue);
        toast({
          title: "Mood saved!",
          description: "Your mood has been recorded for today.",
        });
        
        // Optionally save mood note if provided
        if (moodNote.trim()) {
          await supabase
            .from('journal_entries')
            .insert({
              user_id: user?.id,
              content: moodNote,
              title: `Mood Check-in - ${new Date().toLocaleDateString()}`,
              mood_value: moodValue,
              mood_label: moodLabels[moodValue - 1],
            });
          setMoodNote('');
        }
        
        // Refresh stats
        fetchStats();
      }
    } catch (error) {
      console.error('Error saving mood:', error);
      toast({
        title: "Error",
        description: "Failed to save mood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingMood(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getPersonalizedPrompt = () => {
    const prompts = [
      "What's bringing you joy today?",
      "How are you taking care of yourself today?",
      "What are you grateful for right now?",
      "What's one thing that made you smile today?",
      "How would you describe your energy level?",
      "What's on your mind today?",
      "What challenge are you working through?",
      "How are you feeling about your goals?",
      "What's inspiring you lately?",
      "What would make today feel successful?"
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const getMoodEmoji = (value: number) => moodEmojis[value - 1];
  const getMoodLabel = (value: number) => moodLabels[value - 1];

  const quickActions = [
    {
      title: 'New Journal Entry',
      description: recentEntries.length > 0 ? 'Continue your journey' : 'Start your first entry',
      icon: BookOpen,
      action: () => navigate('/app/journal'),
      color: 'from-coral-400 to-coral-600',
      notification: false,
    },
    {
      title: 'Chat with AI',
      description: 'Get personalized support',
      icon: MessageCircle,
      action: () => navigate('/app/chat'),
      color: 'from-lavender-400 to-lavender-600',
      notification: false,
    },
    {
      title: 'Voice Chat',
      description: 'Natural conversation',
      icon: Sparkles,
      action: () => navigate('/app/voice-chat'),
      color: 'from-purple-400 to-purple-600',
      notification: false,
    },
    {
      title: 'View Insights',
      description: stats.unreadInsights > 0 ? `${stats.unreadInsights} new insights` : 'Explore your patterns',
      icon: BarChart3,
      action: () => navigate('/app/insights'),
      color: 'from-slate-400 to-slate-600',
      notification: stats.unreadInsights > 0,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Enhanced Header with Avatar and Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 ring-2 ring-coral-400/30">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-coral-400 to-lavender-400 text-white text-lg font-semibold">
              {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {getGreeting()}, {profile?.display_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-slate-300 text-lg">
              {isFirstVisit ? "Welcome to your emotional wellness journey" : "Ready to continue your journey?"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
              <Bell className="w-5 h-5" />
              {stats.unreadInsights > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-coral-500 text-xs">
                  {stats.unreadInsights}
                </Badge>
              )}
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => navigate('/app/settings')}>
              <User className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="glass-morphism border-white/10 text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <BookOpen className="w-5 h-5 text-coral-400" />
              <span className="text-2xl font-bold text-white">{stats.totalEntries}</span>
            </div>
            <p className="text-slate-300 text-sm">Journal Entries</p>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-white/10 text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-lavender-400" />
              <span className="text-2xl font-bold text-white">{stats.currentStreak}</span>
            </div>
            <p className="text-slate-300 text-sm">Day Streak</p>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-white/10 text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-white">{stats.weeklyMoodAvg || '--'}</span>
            </div>
            <p className="text-slate-300 text-sm">Avg Mood</p>
          </CardContent>
        </Card>
        <Card className="glass-morphism border-white/10 text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{stats.unreadInsights}</span>
            </div>
            <p className="text-slate-300 text-sm">New Insights</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Mood Check-in */}
      <AnimatePresence>
        {todayMood === null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-8"
          >
            <Card className="glass-morphism border-white/10 overflow-hidden">
              <div className="bg-gradient-to-r from-coral-500/10 to-lavender-500/10 p-1">
                <Card className="bg-transparent border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Smile className="w-6 h-6 text-coral-400" />
                      <span>How are you feeling today?</span>
                    </CardTitle>
                    <p className="text-slate-300">{getPersonalizedPrompt()}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <MoodSelector 
                      onMoodSelect={handleMoodSubmit} 
                      selectedMood={undefined}
                    />
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Share what's on your mind today... (optional)"
                        value={moodNote}
                        onChange={(e) => setMoodNote(e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-coral-400 text-white placeholder:text-slate-400 resize-none"
                        rows={3}
                      />
                      {moodNote && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-slate-400"
                        >
                          This will be saved as a journal entry along with your mood
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Mood Display - Enhanced */}
      <AnimatePresence>
        {todayMood !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="glass-morphism border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-5xl">{getMoodEmoji(todayMood)}</div>
                    <div>
                      <p className="text-white font-medium text-lg">Today's Mood</p>
                      <p className="text-slate-300">{getMoodLabel(todayMood)}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Recorded at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTodayMood(null)}
                      className="text-slate-400 hover:text-white hover:bg-white/10"
                    >
                      Update
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate('/app/chat')}
                      className="bg-coral-500 hover:bg-coral-600 text-white"
                    >
                      Talk About It
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-coral-400" />
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="glass-morphism border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                <CardContent className="p-6" onClick={action.action}>
                  {action.notification && (
                    <div className="absolute top-3 right-3">
                      <div className="w-3 h-3 bg-coral-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-coral-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{action.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Enhanced Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-morphism border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-coral-400" />
                <span>Your Journey</span>
              </span>
              {recentEntries.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/app/journal')}
                  className="text-slate-400 hover:text-white hover:bg-white/10"
                >
                  View All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {recentEntries.length > 0 ? (
                <div className="space-y-4">
                  {recentEntries.map((entry: any, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate('/app/journal')}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-white group-hover:text-coral-400 transition-colors">
                          {entry.title || 'Untitled Entry'}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {entry.mood_value && (
                            <span className="text-lg">{getMoodEmoji(entry.mood_value)}</span>
                          )}
                          <span className="text-xs text-slate-400">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-2 mb-3">
                        {entry.content.substring(0, 150)}...
                      </p>
                      {entry.mood_label && (
                        <Badge variant="secondary" className="bg-coral-500/20 text-coral-400 border-coral-400/20">
                          {entry.mood_label}
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-coral-400/20 to-lavender-400/20 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Start Your Journey</h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Your first journal entry is the beginning of understanding yourself better. 
                    Share your thoughts, feelings, and experiences.
                  </p>
                  <Button 
                    onClick={() => navigate('/app/journal')}
                    className="bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Write Your First Entry
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}