import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDataSection, setShowDataSection] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (!error && data) {
      setProfile(data);
      setDisplayName(data.display_name || '');
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setProfile(prev => ({ ...prev, display_name: displayName }));
    }
    
    setLoading(false);
  };

  const exportData = async () => {
    try {
      // Fetch all user data
      const [journalRes, moodRes, chatRes, insightsRes] = await Promise.all([
        supabase.from('journal_entries').select('*').eq('user_id', user?.id),
        supabase.from('mood_entries').select('*').eq('user_id', user?.id),
        supabase.from('chat_messages').select('*').eq('user_id', user?.id),
        supabase.from('insights').select('*').eq('user_id', user?.id),
      ]);

      const exportData = {
        profile: profile,
        journal_entries: journalRes.data || [],
        mood_entries: moodRes.data || [],
        chat_messages: chatRes.data || [],
        insights: insightsRes.data || [],
        exported_at: new Date().toISOString(),
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindmate-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const deleteAllData = async () => {
    if (!confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete all user data
      await Promise.all([
        supabase.from('journal_entries').delete().eq('user_id', user?.id),
        supabase.from('mood_entries').delete().eq('user_id', user?.id),
        supabase.from('chat_messages').delete().eq('user_id', user?.id),
        supabase.from('insights').delete().eq('user_id', user?.id),
      ]);

      toast({
        title: "Success",
        description: "All data deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-300">Manage your account and privacy preferences</p>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-morphism border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <User className="w-5 h-5 text-coral-400" />
              <span>Profile Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-white">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                className="bg-white/5 border-white/10 focus:border-coral-400 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Email</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-white/5 border-white/10 text-slate-400"
              />
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>

            <Button
              onClick={updateProfile}
              disabled={loading || displayName === profile?.display_name}
              className="bg-coral-500 hover:bg-coral-600 text-white"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-morphism border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Shield className="w-5 h-5 text-coral-400" />
              <span>Privacy & Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="text-green-400 font-medium mb-2">Your Data is Secure</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>✓ All data is encrypted in transit and at rest</p>
                <p>✓ Only you can access your personal information</p>
                <p>✓ AI processing happens securely without storing personal details</p>
                <p>✓ You have complete control over your data</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className="text-white font-medium">Show data management options</p>
                <p className="text-sm text-slate-400">View options to export or delete your data</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowDataSection(!showDataSection)}
                className="text-slate-300 hover:text-white"
              >
                {showDataSection ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            {showDataSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-4 border-t border-white/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-2 mb-3">
                      <Download className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Export Data</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      Download all your data in JSON format
                    </p>
                    <Button 
                      onClick={exportData}
                      variant="outline"
                      className="w-full border-blue-400 text-blue-400 hover:bg-blue-400/10"
                    >
                      Export My Data
                    </Button>
                  </div>

                  <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                    <div className="flex items-center space-x-2 mb-3">
                      <Trash2 className="w-5 h-5 text-red-400" />
                      <span className="text-white font-medium">Delete Data</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      Permanently delete all your data
                    </p>
                    <Button 
                      onClick={deleteAllData}
                      variant="outline"
                      className="w-full border-red-400 text-red-400 hover:bg-red-400/10"
                    >
                      Delete All Data
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    <strong>Note:</strong> Data deletion is permanent and cannot be undone. 
                    Consider exporting your data first if you might want it later.
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* App Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-morphism border-white/10">
          <CardHeader>
            <CardTitle className="text-white">About MindMate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Version</p>
                <p className="text-white">1.0.0</p>
              </div>
              <div>
                <p className="text-slate-400">Account Created</p>
                <p className="text-white">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <p className="text-slate-400 text-sm">
                MindMate is your personal AI companion for emotional wellness. 
                All processing happens securely, and your privacy is our top priority.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}