import { Navigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { YouTubeSidebar } from '@/components/YouTubeSidebar';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

function AppLayoutContent() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <YouTubeSidebar />
      <main className="flex-1 flex flex-col">
        {/* Header with hamburger menu */}
        <header className="h-16 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm flex items-center px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-white hover:bg-white/10 p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </header>
        
        <div className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <AppLayoutContent />
    </SidebarProvider>
  );
}