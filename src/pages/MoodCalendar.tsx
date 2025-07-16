import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function MoodCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [moodEntries, setMoodEntries] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMoodData();
    }
  }, [user]);

  const fetchMoodData = async () => {
    setLoading(true);
    try {
      const [moodResult, journalResult] = await Promise.all([
        supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
      ]);

      if (moodResult.error) throw moodResult.error;
      if (journalResult.error) throw journalResult.error;

      setMoodEntries(moodResult.data || []);
      setJournalEntries(journalResult.data || []);
    } catch (error) {
      console.error('Error fetching mood data:', error);
      toast({
        title: "Error",
        description: "Failed to load mood data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMoodForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return moodEntries.find(entry => 
      entry.created_at.split('T')[0] === dateStr
    );
  };

  const getJournalForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return journalEntries.filter(entry => 
      entry.created_at.split('T')[0] === dateStr
    );
  };

  const getMoodColor = (moodValue: number) => {
    if (moodValue >= 4) return 'bg-green-400';
    if (moodValue >= 3) return 'bg-yellow-400';
    if (moodValue >= 2) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const selectedDateMood = selectedDate ? getMoodForDate(selectedDate) : null;
  const selectedDateJournals = selectedDate ? getJournalForDate(selectedDate) : [];

  const modifiers = {
    hasMood: (date: Date) => !!getMoodForDate(date),
    hasJournal: (date: Date) => getJournalForDate(date).length > 0,
  };

  const modifiersStyles = {
    hasMood: {
      border: '2px solid #f59e0b',
    },
    hasJournal: {
      backgroundColor: 'rgba(139, 92, 246, 0.3)',
    },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mood Calendar</h1>
          <p className="text-slate-300">Visualize your emotional journey over time</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <CalendarIcon className="w-5 h-5 text-coral-400" />
                <span>Mood Tracking Calendar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border border-white/10 bg-white/5 text-white"
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                  />
                </div>
              )}
              
              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded border-2 border-yellow-400"></div>
                  <span className="text-slate-300">Mood Tracked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-purple-400/30"></div>
                  <span className="text-slate-300">Journal Entry</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Selected Date Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedDate ? selectedDate.toLocaleDateString() : 'Select a Date'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDateMood ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Mood:</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getMoodColor(selectedDateMood.mood_value)}`}></div>
                      <span className="text-white font-medium">{selectedDateMood.mood_label}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400">
                    Value: {selectedDateMood.mood_value}/5
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-slate-400 text-sm">No mood data for this date</div>
                </div>
              )}

              {selectedDateJournals.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h4 className="text-white font-medium">Journal Entries:</h4>
                  {selectedDateJournals.map((entry, index) => (
                    <div key={entry.id} className="bg-white/5 rounded-lg p-3">
                      <h5 className="text-white text-sm font-medium mb-1">
                        {entry.title || `Entry ${index + 1}`}
                      </h5>
                      <p className="text-slate-300 text-xs line-clamp-3">
                        {entry.content}
                      </p>
                      {entry.themes && entry.themes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {entry.themes.slice(0, 2).map((theme: string, i: number) => (
                            <span 
                              key={i}
                              className="px-2 py-0.5 bg-lavender-500/20 text-lavender-400 text-xs rounded"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <BarChart3 className="w-5 h-5 text-coral-400" />
                <span>This Month</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-sm">Mood Entries:</span>
                <span className="text-white font-medium">{moodEntries.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-sm">Journal Entries:</span>
                <span className="text-white font-medium">{journalEntries.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-sm">Avg Mood:</span>
                <span className="text-white font-medium">
                  {moodEntries.length > 0 
                    ? (moodEntries.reduce((sum, entry) => sum + entry.mood_value, 0) / moodEntries.length).toFixed(1)
                    : '--'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}