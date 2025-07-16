import { useLocation, NavLink } from 'react-router-dom';
import { Home, BookOpen, MessageCircle, BarChart3, Settings, LogOut, TrendingUp, Sparkles, Calendar, User, PlusCircle, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const mainItems = [
  { title: 'Dashboard', url: '/app/dashboard', icon: Home },
  { title: 'Journal', url: '/app/journal', icon: BookOpen },
  { title: 'Chat', url: '/app/chat', icon: MessageCircle },
  { title: 'Insights', url: '/app/insights', icon: BarChart3 },
];

const exploreItems = [
  { title: 'Growth Journey', url: '/app/growth', icon: TrendingUp },
  { title: 'Mood Calendar', url: '/app/calendar', icon: Calendar },
  { title: 'AI Insights', url: '/app/ai-insights', icon: Sparkles },
];

const settingsItems = [
  { title: 'Profile', url: '/app/profile', icon: User },
  { title: 'Settings', url: '/app/settings', icon: Settings },
];

export function YouTubeSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user, signOut } = useAuth();
  const currentPath = location.pathname;
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ unreadInsights: 0, currentStreak: 0 });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: unreadInsights } = await supabase
        .from('insights')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      const { data: entries } = await supabase
        .from('journal_entries')
        .select('created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

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

      setStats({ unreadInsights: unreadInsights || 0, currentStreak });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const isActive = (path: string) => currentPath === path;
  
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-coral-500/20 text-coral-400 font-medium hover:bg-coral-500/25" 
      : "hover:bg-white/5 text-slate-300 hover:text-white";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className={`${collapsed ? 'w-16' : 'w-72'} border-r border-white/10 bg-slate-900/95 backdrop-blur-xl transition-all duration-300`}>
      <SidebarHeader className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-400 to-lavender-400 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">MindMate</h2>
                  <p className="text-xs text-slate-400">AI Wellness Companion</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex justify-center"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-400 to-lavender-400 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <SidebarTrigger className="text-slate-400 hover:text-white transition-colors" />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* User Profile Section */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-3 mb-4 bg-gradient-to-r from-coral-500/10 to-lavender-500/10 rounded-xl border border-white/10"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12 ring-2 ring-coral-400/30">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-coral-400 to-lavender-400 text-white font-semibold">
                    {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {profile?.display_name || 'User'}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-400">{stats.currentStreak} day streak</span>
                    </div>
                    {stats.unreadInsights > 0 && (
                      <Badge className="text-xs bg-coral-500 text-white px-1.5 py-0.5">
                        {stats.unreadInsights}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 text-sm font-medium px-2">
            {!collapsed && 'Home'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink 
                      to={item.url} 
                      className={`${getNavClass({ isActive: isActive(item.url) })} rounded-lg transition-all duration-200 flex items-center space-x-3 px-3 py-2`}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-sm font-medium"
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {item.title === 'Insights' && stats.unreadInsights > 0 && !collapsed && (
                        <Badge className="ml-auto bg-coral-500 text-white text-xs px-1.5 py-0.5">
                          {stats.unreadInsights}
                        </Badge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4 bg-white/10" />

        {/* Explore Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 text-sm font-medium px-2">
            {!collapsed && 'Explore'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {exploreItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink 
                      to={item.url} 
                      className={`${getNavClass({ isActive: isActive(item.url) })} rounded-lg transition-all duration-200 flex items-center space-x-3 px-3 py-2`}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-sm font-medium"
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4 bg-white/10" />

        {/* Quick Actions */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-2 mb-4"
            >
              <Button
                onClick={() => window.location.href = '/app/journal'}
                className="w-full bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white rounded-lg h-10 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New Entry
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/10">
        {/* Settings */}
        <SidebarMenu className="space-y-1 mb-4">
          {settingsItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="h-10">
                <NavLink 
                  to={item.url} 
                  className={`${getNavClass({ isActive: isActive(item.url) })} rounded-lg transition-all duration-200 flex items-center space-x-3 px-3 py-2`}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm font-medium"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-red-500/20 rounded-lg h-10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 text-sm font-medium"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}