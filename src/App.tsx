import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Chat from "./pages/Chat";
import Insights from "./pages/Insights";
import Growth from "./pages/Growth";
import Settings from "./pages/Settings";
import Debug from "./pages/Debug";
import Profile from "./pages/Profile";
import MoodCalendar from "./pages/MoodCalendar";
import VoiceChat from "./pages/VoiceChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/app" element={<AppLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="journal" element={<Journal />} />
              <Route path="chat" element={<Chat />} />
              <Route path="voice-chat" element={<VoiceChat />} />
              <Route path="insights" element={<Insights />} />
              <Route path="growth" element={<Growth />} />
              <Route path="profile" element={<Profile />} />
              <Route path="calendar" element={<MoodCalendar />} />
              <Route path="settings" element={<Settings />} />
              <Route path="debug" element={<Debug />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
