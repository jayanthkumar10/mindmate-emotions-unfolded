import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Journal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<any[]>([]);
  const [currentEntry, setCurrentEntry] = useState({
    title: '',
    content: '',
    entry_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load journal entries",
        variant: "destructive",
      });
    } else {
      setEntries(data || []);
    }
  };

  const handleSave = async () => {
    if (!currentEntry.content.trim()) {
      toast({
        title: "Content Required",
        description: "Please write something before saving",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Analyze entry with AI
      let analysisData = null;
      try {
        const { data, error } = await supabase.functions.invoke('ai-companion', {
          body: {
            message: currentEntry.content,
            type: 'analyze_journal',
          },
        });
        
        if (!error && data) {
          analysisData = data;
        }
      } catch (error) {
        console.error('AI analysis failed:', error);
      }

      const entryData = {
        user_id: user?.id,
        title: currentEntry.title || `Entry from ${new Date(currentEntry.entry_date).toLocaleDateString()}`,
        content: currentEntry.content,
        created_at: new Date(currentEntry.entry_date).toISOString(),
        themes: analysisData?.themes || [],
        sentiment_score: analysisData?.sentiment_score || null,
      };

      let result;
      if (editingId) {
        result = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', editingId);
      } else {
        result = await supabase
          .from('journal_entries')
          .insert(entryData);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Success",
        description: editingId ? "Entry updated successfully" : "Entry saved successfully",
      });

      // Reset form
      setCurrentEntry({ title: '', content: '', entry_date: new Date().toISOString().split('T')[0] });
      setIsEditing(false);
      setEditingId(null);
      fetchEntries();

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry: any) => {
    setCurrentEntry({
      title: entry.title,
      content: entry.content,
      entry_date: new Date(entry.created_at).toISOString().split('T')[0],
    });
    setEditingId(entry.id);
    setIsEditing(true);
  };

  const handleNewEntry = () => {
    setCurrentEntry({ title: '', content: '', entry_date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
    setIsEditing(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Journal</h1>
          <p className="text-slate-300">Capture your thoughts and track your emotional journey</p>
        </div>
        <Button
          onClick={handleNewEntry}
          className="bg-coral-500 hover:bg-coral-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Writing Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Calendar className="w-5 h-5 text-coral-400" />
                <span>{editingId ? 'Edit Entry' : 'New Entry'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Entry title (optional)"
                  value={currentEntry.title}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/5 border-white/10 focus:border-coral-400 text-white"
                />
                <Input
                  type="date"
                  value={currentEntry.entry_date}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, entry_date: e.target.value }))}
                  className="bg-white/5 border-white/10 focus:border-coral-400 text-white"
                />
              </div>
              
              <Textarea
                placeholder="What's on your mind today? Write freely about your thoughts, feelings, and experiences..."
                value={currentEntry.content}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[300px] bg-white/5 border-white/10 focus:border-coral-400 text-white resize-none"
              />

              <div className="flex justify-end space-x-2">
                {isEditing && (
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditingId(null);
                      setCurrentEntry({ title: '', content: '', entry_date: new Date().toISOString().split('T')[0] });
                    }}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  disabled={loading || !currentEntry.content.trim()}
                  className="bg-coral-500 hover:bg-coral-600 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : (editingId ? 'Update' : 'Save Entry')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Entries List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-white">Recent Entries</h2>
          
          {entries.length === 0 ? (
            <Card className="glass-morphism border-white/10">
              <CardContent className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No entries yet</p>
                <p className="text-sm text-slate-500 mt-2">Start journaling to see your entries here</p>
              </CardContent>
            </Card>
          ) : (
            entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="glass-morphism border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                  onClick={() => handleEdit(entry)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white line-clamp-1">
                        {entry.title || 'Untitled Entry'}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-slate-300 text-sm line-clamp-3 mb-3">
                      {entry.content}
                    </p>
                    
                    {entry.themes && entry.themes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.themes.slice(0, 3).map((theme: string, i: number) => (
                          <span 
                            key={i}
                            className="px-2 py-0.5 bg-lavender-500/20 text-lavender-400 text-xs rounded"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}