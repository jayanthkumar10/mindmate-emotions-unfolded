import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function VoiceChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const handleConnect = async () => {
    if (!isConnected) {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Voice chat is now active. Start speaking!",
        });
      } catch (error) {
        toast({
          title: "Permission Required",
          description: "Please allow microphone access to use voice chat.",
          variant: "destructive",
        });
      }
    } else {
      setIsConnected(false);
      setIsRecording(false);
      toast({
        title: "Disconnected",
        description: "Voice chat session ended.",
      });
    }
  };

  const toggleRecording = () => {
    if (isConnected) {
      setIsRecording(!isRecording);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Voice Chat</h1>
        <p className="text-slate-300">Have a natural conversation with your AI companion</p>
      </motion.div>

      {/* Connection Status */}
      <Card className="glass-morphism border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span>Voice Assistant Status</span>
            <Badge className={`${isConnected ? 'bg-green-500' : 'bg-slate-500'} text-white`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Controls */}
          <div className="flex justify-center">
            <Button
              onClick={handleConnect}
              size="lg"
              className={`w-32 h-32 rounded-full ${
                isConnected 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              {isConnected ? (
                <>
                  <PhoneOff className="w-8 h-8 mb-2" />
                  <span>End Call</span>
                </>
              ) : (
                <>
                  <Phone className="w-8 h-8 mb-2" />
                  <span>Start Call</span>
                </>
              )}
            </Button>
          </div>

          {/* Voice Controls */}
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center space-x-4"
            >
              <Button
                onClick={toggleRecording}
                variant={isRecording ? "default" : "outline"}
                size="lg"
                className={`w-20 h-20 rounded-full ${
                  isRecording 
                    ? 'bg-coral-500 hover:bg-coral-600 text-white animate-pulse' 
                    : 'border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {isRecording ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </Button>

              <Button
                onClick={toggleMute}
                variant="outline"
                size="lg"
                className="w-20 h-20 rounded-full border-white/20 text-white hover:bg-white/10"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </Button>
            </motion.div>
          )}

          {/* Status Messages */}
          <div className="text-center space-y-2">
            {!isConnected && (
              <p className="text-slate-400">Click "Start Call" to begin your voice conversation</p>
            )}
            {isConnected && !isRecording && (
              <p className="text-slate-400">Click the microphone to start speaking</p>
            )}
            {isConnected && isRecording && (
              <p className="text-coral-400 animate-pulse">Listening... Speak naturally</p>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-white font-medium mb-2">🎯 Natural Conversation</h3>
              <p className="text-slate-400 text-sm">Speak naturally like you would with a friend. No need for specific commands.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-white font-medium mb-2">🧠 Context Aware</h3>
              <p className="text-slate-400 text-sm">Your AI companion knows your journal history and can reference past conversations.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-white font-medium mb-2">💝 Emotional Support</h3>
              <p className="text-slate-400 text-sm">Get immediate emotional support and guidance through difficult moments.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-white font-medium mb-2">🌱 Growth Focused</h3>
              <p className="text-slate-400 text-sm">Receive personalized advice for your personal development goals.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}