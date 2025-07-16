import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
}

export default function TestAll() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);
    const testResults: TestResult[] = [];

    // Test 1: Authentication
    testResults.push({
      name: 'Authentication',
      status: user ? 'passed' : 'failed',
      message: user ? 'User is authenticated' : 'User not authenticated'
    });

    // Test 2: Database Connection
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      testResults.push({
        name: 'Database Connection',
        status: error ? 'failed' : 'passed',
        message: error ? `Database error: ${error.message}` : 'Database connection successful'
      });
    } catch (error) {
      testResults.push({
        name: 'Database Connection',
        status: 'failed',
        message: 'Failed to connect to database'
      });
    }

    // Test 3: Profile Access
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      testResults.push({
        name: 'Profile Access',
        status: error ? 'failed' : 'passed',
        message: error ? `Profile error: ${error.message}` : 'Profile access working'
      });
    } catch (error) {
      testResults.push({
        name: 'Profile Access',
        status: 'failed',
        message: 'Profile access failed'
      });
    }

    // Test 4: Journal Functionality
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user?.id)
        .limit(1);
      
      testResults.push({
        name: 'Journal Access',
        status: error ? 'failed' : 'passed',
        message: error ? `Journal error: ${error.message}` : 'Journal functionality working'
      });
    } catch (error) {
      testResults.push({
        name: 'Journal Access',
        status: 'failed',
        message: 'Journal access failed'
      });
    }

    // Test 5: AI Edge Function
    try {
      const response = await fetch(`https://ncrzjqerxvtdnpkysdcq.functions.supabase.co/ai-companion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test message',
          type: 'chat',
          context: {}
        }),
      });
      
      testResults.push({
        name: 'AI Chat Function',
        status: response.ok ? 'passed' : 'failed',
        message: response.ok ? 'AI chat function accessible' : 'AI chat function failed'
      });
    } catch (error) {
      testResults.push({
        name: 'AI Chat Function',
        status: 'failed',
        message: 'AI function network error'
      });
    }

    // Test 6: Mood Entries
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user?.id)
        .limit(1);
      
      testResults.push({
        name: 'Mood Tracking',
        status: error ? 'failed' : 'passed',
        message: error ? `Mood error: ${error.message}` : 'Mood tracking working'
      });
    } catch (error) {
      testResults.push({
        name: 'Mood Tracking',
        status: 'failed',
        message: 'Mood tracking failed'
      });
    }

    // Test 7: Insights Generation
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user?.id)
        .limit(1);
      
      testResults.push({
        name: 'Insights System',
        status: error ? 'failed' : 'passed',
        message: error ? `Insights error: ${error.message}` : 'Insights system working'
      });
    } catch (error) {
      testResults.push({
        name: 'Insights System',
        status: 'failed',
        message: 'Insights system failed'
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default: return null;
    }
  };

  const passedTests = results.filter(r => r.status === 'passed').length;
  const totalTests = results.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Tests</h1>
          <p className="text-slate-300">Comprehensive testing of all MindMate features</p>
        </div>
        <Button
          onClick={runAllTests}
          disabled={testing}
          className="bg-coral-500 hover:bg-coral-600 text-white"
        >
          <Play className="w-4 h-4 mr-2" />
          {testing ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </motion.div>

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <Card className="glass-morphism border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">{passedTests}</div>
              <div className="text-sm text-slate-400">Passed</div>
            </CardContent>
          </Card>
          <Card className="glass-morphism border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">{totalTests - passedTests}</div>
              <div className="text-sm text-slate-400">Failed</div>
            </CardContent>
          </Card>
          <Card className="glass-morphism border-white/10">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%</div>
              <div className="text-sm text-slate-400">Success Rate</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {testing && (
        <Card className="glass-morphism border-white/10">
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Running comprehensive system tests...</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="glass-morphism border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <span className="text-white font-medium">{result.name}</span>
                </div>
                <span className="text-slate-400 text-sm">{result.message}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {results.length === 0 && !testing && (
        <Card className="glass-morphism border-white/10">
          <CardContent className="p-12 text-center">
            <Play className="w-16 h-16 text-coral-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Ready to Test</h3>
            <p className="text-slate-300">Click "Run All Tests" to verify all MindMate features are working properly</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}