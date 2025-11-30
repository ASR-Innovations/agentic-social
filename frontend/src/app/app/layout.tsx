'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Sparkles,
  Grid3X3,
  MessageSquare,
  BarChart3,
  Image,
  Radio,
  Users,
  Settings,
  Menu,
  X,
  Bell,
  Command,
  User,
  LogOut,
  ChevronDown,
  Search,
  Plus,
  Zap,
  Crown,
  ChevronRight,
  Gem,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/app/dashboard', badge: null, color: 'from-blue-500 to-cyan-400', glow: 'shadow-blue-500/40' },
  { id: 'ai-hub', label: 'AI Hub', icon: Sparkles, href: '/app/ai-hub', badge: '3', color: 'from-violet-500 to-purple-400', glow: 'shadow-violet-500/40' },
  { id: 'content', label: 'Content', icon: Grid3X3, href: '/app/content', badge: null, color: 'from-emerald-500 to-teal-400', glow: 'shadow-emerald-500/40' },
  { id: 'inbox', label: 'Inbox', icon: MessageSquare, href: '/app/inbox', badge: '12', color: 'from-rose-500 to-pink-400', glow: 'shadow-rose-500/40' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/app/analytics', badge: null, color: 'from-amber-500 to-orange-400', glow: 'shadow-amber-500/40' },
  { id: 'media', label: 'Media', icon: Image, href: '/app/media', badge: null, color: 'from-indigo-500 to-blue-400', glow: 'shadow-indigo-500/40' },
  { id: 'listening', label: 'Listening', icon: Radio, href: '/app/listening', badge: null, color: 'from-cyan-500 to-teal-400', glow: 'shadow-cyan-500/40' },
  { id: 'team', label: 'Team', icon: Users, href: '/app/team', badge: null, color: 'from-fuchsia-500 to-pink-400', glow: 'shadow-fuchsia-500/40' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/app/settings', badge: null, color: 'from-slate-500 to-gray-400', glow: 'shadow-slate-500/40' },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, isMobile } = useUIStore();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      if (isMobileView !== isMobile) {
        useUIStore.getState().setIsMobile(isMobileView);
        if (isMobileView && sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    const path = window.location.pathname;
    const item = sidebarItems.find(item => path.includes(item.id));
    if (item) setActiveItem(item.id);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <motion.div
          className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/50"
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex relative overflow-hidden">
      {/* Animated Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute -top-40 -left-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute -bottom-40 left-1/3 w-72 h-72 bg-fuchsia-600/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? (isMobile ? '100%' : '280px') : '0px',
          opacity: sidebarOpen ? 1 : 0,
        }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed inset-y-0 left-0 z-50 overflow-hidden ${isMobile ? 'w-full' : 'w-[280px]'}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full bg-[#0f0f14]/95 backdrop-blur-2xl border-r border-white/[0.06]">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <Link href="/app/dashboard" className="flex items-center gap-3.5 group">
                <motion.div
                  className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/30"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/25 to-transparent" />
                  <motion.div 
                    className="absolute inset-0 rounded-2xl"
                    animate={{ 
                      boxShadow: ['0 0 20px rgba(139, 92, 246, 0.3)', '0 0 40px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(139, 92, 246, 0.3)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">SocialAI</h1>
                  <p className="text-[10px] text-violet-400/80 font-semibold uppercase tracking-widest">Pro Dashboard</p>
                </div>
              </Link>
              {isMobile && (
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/5">
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-4">
            <motion.button
              whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-semibold text-sm shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plus className="w-5 h-5" />
              <span>Create New Post</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10" aria-label="Main menu">
            <p className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Main Menu</p>
            {sidebarItems.slice(0, 5).map((item, index) => {
              const isActive = activeItem === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                  transition={prefersReducedMotion ? {} : { duration: 0.3, delay: index * 0.03 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => { setActiveItem(item.id); if (isMobile) setSidebarOpen(false); }}
                    className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                      isActive
                        ? 'bg-white/[0.08] text-white'
                        : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b ${item.color}`}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <motion.div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-br ${item.color} shadow-lg ${item.glow}`
                          : 'bg-white/[0.05] group-hover:bg-white/[0.08]'
                      }`}
                      whileHover={!isActive ? { scale: 1.05 } : {}}
                    >
                      <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    </motion.div>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <motion.span 
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
                        }`}
                        animate={!isActive ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </Link>
                </motion.div>
              );
            })}

            <p className="px-4 py-3 mt-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tools</p>
            {sidebarItems.slice(5).map((item, index) => {
              const isActive = activeItem === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                  transition={prefersReducedMotion ? {} : { duration: 0.3, delay: (index + 5) * 0.03 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => { setActiveItem(item.id); if (isMobile) setSidebarOpen(false); }}
                    className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                      isActive ? 'bg-white/[0.08] text-white' : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b ${item.color}`}
                      />
                    )}
                    <motion.div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive ? `bg-gradient-to-br ${item.color} shadow-lg ${item.glow}` : 'bg-white/[0.05] group-hover:bg-white/[0.08]'
                      }`}
                      whileHover={!isActive ? { scale: 1.05 } : {}}
                    >
                      <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    </motion.div>
                    <span className="flex-1">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Pro Upgrade Card */}
          <div className="p-4">
            <motion.div
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/20 via-purple-600/15 to-fuchsia-600/20 border border-violet-500/20 p-5"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
            >
              {/* Animated glow */}
              <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-violet-500/30 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-500/30 rounded-full blur-2xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div 
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Crown className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <span className="text-sm font-bold text-white">Upgrade to Pro</span>
                    <p className="text-[10px] text-violet-300/80">Unlock all features</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">Get unlimited AI agents, advanced analytics, and priority support</p>
                <motion.button 
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10 hover:border-white/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-white/[0.06]">
            <motion.div
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer border border-white/[0.04] hover:border-white/[0.08]"
              whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="relative">
                <motion.div 
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-white font-bold text-sm">DU</span>
                </motion.div>
                <motion.div 
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0f0f14]"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Demo User</p>
                <p className="text-xs text-gray-500 truncate flex items-center gap-1.5">
                  <Gem className="w-3 h-3 text-violet-400" />
                  <span className="text-violet-400">Pro Plan</span>
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
            </motion.div>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mt-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? 'ml-[280px]' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-11 h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-all border border-white/[0.06] hover:border-white/[0.1]"
              >
                <Menu className="w-5 h-5 text-gray-400" />
              </motion.button>

              {/* Search Bar */}
              <motion.div 
                className="hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-96 group focus-within:border-violet-500/50 focus-within:bg-white/[0.05] transition-all"
                whileHover={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}
              >
                <Search className="w-4 h-4 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
                />
                <kbd className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] text-[10px] text-gray-500 font-medium border border-white/[0.06]">
                  <Command className="w-3 h-3" />K
                </kbd>
              </motion.div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Create */}
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white text-sm font-semibold shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                className="relative w-11 h-11 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-all border border-white/[0.06] hover:border-white/[0.1]"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                <motion.span 
                  className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full ring-2 ring-[#0a0a0f]"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>

              {/* User Avatar */}
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
              >
                <span className="text-white font-bold text-sm">DU</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto relative">
          <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
