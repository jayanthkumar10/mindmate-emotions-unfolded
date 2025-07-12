import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, MessageCircle, BarChart3, Smile } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import MoodSelector from '@/components/MoodSelector';

const moodEmojis = ['😢', '😕', '😐', '😊', '😄'];
const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [todayMood, setTodayMood] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchRecentEntries();
      fetchTodayMood();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    setProfile(data);
  };

  const fetchRecentEntries = async () => {
    const { data } = await supabase
      .from('journal_entries')
      .select('id, title, content, created_at, mood_label')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(3);
    setRecentEntries(data || []);
  };

  const fetchTodayMood = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('mood_entries')
      .select('mood_value')
      .eq('user_id', user?.id)
      .gte('created_at', today)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (data && data.length > 0) {
      setTodayMood(data[0].mood_value);
    }
  };

  const handleMoodSelect = async (moodValue: number) => {
    const { error } = await supabase
      .from('mood_entries')
      .insert({
        user_id: user?.id,
        mood_value: moodValue,
        mood_label: moodLabels[moodValue - 1],
      });

    if (!error) {
      setTodayMood(moodValue);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'New Journal Entry',
      description: 'Capture your thoughts and feelings',
      icon: BookOpen,
      action: () => navigate('/app/journal'),
      color: 'from-coral-400 to-coral-600',
    },
    {
      title: 'Chat with AI',
      description: 'Get support and insights',
      icon: MessageCircle,
      action: () => navigate('/app/chat'),
      color: 'from-lavender-400 to-lavender-600',
    },
    {
      title: 'View Insights',
      description: 'Explore your patterns and growth',
      icon: BarChart3,
      action: () => navigate('/app/insights'),
      color: 'from-slate-400 to-slate-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          {getGreeting()}, {profile?.display_name || 'there'}!
        </h1>
        <p className="text-slate-300">
          How are you feeling today? Let's check in with yourself.
        </p>
      </motion.div>

      {/* Mood Check-in */}
      {todayMood === null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Smile className="w-5 h-5 text-coral-400" />
                <span>Quick Mood Check-in</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MoodSelector onMoodSelect={handleMoodSelect} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Today's Mood Display */}
      {todayMood !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="glass-morphism border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-4">
                <span className="text-4xl">{moodEmojis[todayMood - 1]}</span>
                <div>
                  <p className="text-white font-medium">Today's Mood</p>
                  <p className="text-slate-300">{moodLabels[todayMood - 1]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-morphism border-white/10 hover:bg-white/5 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6" onClick={action.action}>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                <p className="text-slate-300 text-sm">{action.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-morphism border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Journal Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEntries.length > 0 ? (
              <div className="space-y-4">
                {recentEntries.map((entry: any, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => navigate('/app/journal')}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{entry.title || 'Untitled Entry'}</h4>
                      <span className="text-xs text-slate-400">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm line-clamp-2">
                      {entry.content.substring(0, 120)}...
                    </p>
                    {entry.mood_label && (
                      <span className="inline-block mt-2 px-2 py-1 bg-coral-500/20 text-coral-400 text-xs rounded-full">
                        {entry.mood_label}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No journal entries yet</p>
                <Button 
                  onClick={() => navigate('/app/journal')}
                  className="bg-coral-500 hover:bg-coral-600 text-white"
                >
                  Write Your First Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}