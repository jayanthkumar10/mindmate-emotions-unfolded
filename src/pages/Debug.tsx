import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bug, Database, Zap, MessageSquare, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SystemTester from '@/components/SystemTester';

export default function Debug() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [systemInfo, setSystemInfo] = useState<any>({});
  const [dbStats, setDbStats] = useState<any>({});
  const [apiHealth, setApiHealth] = useState<any>({});

  useEffect(() => {
    loadSystemInfo();
    loadDbStats();
    checkApiHealth();
  }, []);

  const loadSystemInfo = () => {
    setSystemInfo({
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      localStorage: {
        theme: localStorage.getItem('theme'),
        lastVisit: localStorage.getItem('lastVisit'),
      },
      user: {
        id: user?.id,
        email: user?.email,
        created_at: user?.created_at,
        last_sign_in_at: user?.last_sign_in_at,
      }
    });
  };

  const loadDbStats = async () => {
    try {
      const [profiles, journals, moods, chats, insights] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('mood_entries').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('insights').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
      ]);

      setDbStats({
        profiles: profiles.count,
        journals: journals.count,
        moods: moods.count,
        chats: chats.count,
        insights: insights.count,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading DB stats:', error);
      toast({
        title: "Database Error",
        description: "Failed to load database statistics",
        variant: "destructive",
      });
    }
  };

  const checkApiHealth = async () => {
    const healthChecks = [];
    
    // Test AI Chat endpoint
    try {
      const chatStart = Date.now();
      const chatResponse = await fetch(`https://ncrzjqerxvtdnpkysdcq.functions.supabase.co/ai-companion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Health check',
          context: {},
          type: 'chat',
        }),
      });
      
      healthChecks.push({
        name: 'AI Chat',
        status: chatResponse.ok ? 'healthy' : 'error',
        responseTime: Date.now() - chatStart,
        statusCode: chatResponse.status
      });
    } catch (error) {
      healthChecks.push({
        name: 'AI Chat',
        status: 'error',
        responseTime: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test Journal Analysis endpoint
    try {
      const analysisStart = Date.now();
      const analysisResponse = await fetch(`https://ncrzjqerxvtdnpkysdcq.functions.supabase.co/ai-companion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test journal entry for health check',
          context: {},
          type: 'analyze_journal',
        }),
      });
      
      healthChecks.push({
        name: 'Journal Analysis',
        status: analysisResponse.ok ? 'healthy' : 'error',
        responseTime: Date.now() - analysisStart,
        statusCode: analysisResponse.status
      });
    } catch (error) {
      healthChecks.push({
        name: 'Journal Analysis',
        status: 'error',
        responseTime: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setApiHealth({
      checks: healthChecks,
      lastChecked: new Date().toISOString()
    });
  };

  const clearUserData = async () => {
    if (!confirm('Are you sure? This will delete ALL your data permanently.')) return;
    
    try {
      await Promise.all([
        supabase.from('chat_messages').delete().eq('user_id', user?.id),
        supabase.from('insights').delete().eq('user_id', user?.id),
        supabase.from('journal_entries').delete().eq('user_id', user?.id),
        supabase.from('mood_entries').delete().eq('user_id', user?.id),
      ]);

      toast({
        title: "Data Cleared",
        description: "All user data has been permanently deleted",
      });
      
      loadDbStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear user data",
        variant: "destructive",
      });
    }
  };

  const generateTestData = async () => {
    try {
      // Create test mood entries
      const testMoods = Array.from({ length: 7 }, (_, i) => ({
        user_id: user?.id,
        mood_value: Math.floor(Math.random() * 5) + 1,
        mood_label: ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'][Math.floor(Math.random() * 5)],
        created_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString()
      }));

      await supabase.from('mood_entries').insert(testMoods);

      // Create test journal entries
      const testJournals = [
        {
          user_id: user?.id,
          title: 'A Great Day',
          content: 'Today was wonderful! I felt grateful for my family and accomplished my goals. The weather was perfect and I had a productive day at work.',
          mood_value: 4,
          mood_label: 'Happy'
        },
        {
          user_id: user?.id,
          title: 'Reflecting on Challenges',
          content: 'I faced some difficulties today, but I learned a lot about myself. Sometimes challenges help us grow, even when they are uncomfortable.',
          mood_value: 3,
          mood_label: 'Neutral'
        },
        {
          user_id: user?.id,
          title: 'Gratitude Practice',
          content: 'I am grateful for my health, my relationships, and the opportunities I have. Taking time to appreciate these things makes me feel more positive.',
          mood_value: 5,
          mood_label: 'Very Happy'
        }
      ];

      await supabase.from('journal_entries').insert(testJournals);

      toast({
        title: "Test Data Generated",
        description: "Sample moods and journal entries have been created",
      });
      
      loadDbStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate test data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-2">
          <Bug className="w-8 h-8 text-coral-400" />
          <span>Debug & Testing Console</span>
        </h1>
        <p className="text-slate-300">System diagnostics and testing tools for MindMate</p>
      </motion.div>

      <Tabs defaultValue="testing" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full bg-white/5 border border-white/10">
          <TabsTrigger value="testing" className="data-[state=active]:bg-coral-500">Testing</TabsTrigger>
          <TabsTrigger value="database" className="data-[state=active]:bg-coral-500">Database</TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-coral-500">API Health</TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-coral-500">System Info</TabsTrigger>
        </TabsList>

        <TabsContent value="testing">
          <SystemTester />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Database className="w-5 h-5 text-coral-400" />
                <span>Database Statistics</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadDbStats}
                  className="ml-auto text-slate-400 hover:text-white"
                >
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-coral-400">{dbStats.profiles || 0}</div>
                  <div className="text-sm text-slate-400">Profiles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-lavender-400">{dbStats.journals || 0}</div>
                  <div className="text-sm text-slate-400">Journal Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{dbStats.moods || 0}</div>
                  <div className="text-sm text-slate-400">Mood Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{dbStats.chats || 0}</div>
                  <div className="text-sm text-slate-400">Chat Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{dbStats.insights || 0}</div>
                  <div className="text-sm text-slate-400">Insights</div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={generateTestData}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Generate Test Data
                </Button>
                <Button 
                  onClick={clearUserData}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Clear All Data
                </Button>
              </div>

              {dbStats.lastUpdated && (
                <p className="text-xs text-slate-400 mt-4">
                  Last updated: {new Date(dbStats.lastUpdated).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Zap className="w-5 h-5 text-coral-400" />
                <span>API Health Status</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkApiHealth}
                  className="ml-auto text-slate-400 hover:text-white"
                >
                  Check Again
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiHealth.checks?.map((check: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        check.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <p className="font-medium text-white">{check.name}</p>
                        {check.error && (
                          <p className="text-sm text-red-400">{check.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {check.responseTime && (
                        <span className="text-sm text-slate-400">{check.responseTime}ms</span>
                      )}
                      <Badge className={
                        check.status === 'healthy' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }>
                        {check.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {apiHealth.lastChecked && (
                <p className="text-xs text-slate-400 mt-4">
                  Last checked: {new Date(apiHealth.lastChecked).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <BarChart className="w-5 h-5 text-coral-400" />
                <span>System Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">User Session</h4>
                  <pre className="bg-slate-800/50 p-3 rounded-lg text-xs text-slate-300 overflow-auto">
                    {JSON.stringify(systemInfo.user, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Environment</h4>
                  <div className="bg-slate-800/50 p-3 rounded-lg text-xs text-slate-300 space-y-1">
                    <div><strong>URL:</strong> {systemInfo.url}</div>
                    <div><strong>Timestamp:</strong> {systemInfo.timestamp}</div>
                    <div><strong>User Agent:</strong> {systemInfo.userAgent}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Local Storage</h4>
                  <pre className="bg-slate-800/50 p-3 rounded-lg text-xs text-slate-300 overflow-auto">
                    {JSON.stringify(systemInfo.localStorage, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}