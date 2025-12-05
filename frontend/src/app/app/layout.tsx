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
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/app/dashboard', badge: null },
  { id: 'ai-hub', label: 'AI Hub', icon: Sparkles, href: '/app/ai-hub', badge: '3' },
  { id: 'content', label: 'Content', icon: Grid3X3, href: '/app/content', badge: null },
  { id: 'inbox', label: 'Inbox', icon: MessageSquare, href: '/app/inbox', badge: '12' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/app/analytics', badge: null },
  { id: 'media', label: 'Media', icon: Image, href: '/app/media', badge: null },
  { id: 'listening', label: 'Listening', icon: Radio, href: '/app/listening', badge: null },
  { id: 'team', label: 'Team', icon: Users, href: '/app/team', badge: null },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/app/settings', badge: null },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex">
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
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <Link href="/app/dashboard" className="flex items-center gap-3 group">
                <motion.div
                  className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 tracking-tight">SocialAI</h1>
                  <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-widest">Pro Dashboard</p>
                </div>
              </Link>
              {isMobile && (
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" aria-label="Main menu">
            <p className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Main Menu</p>
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
                    className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-emerald-500"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                    }`}>
                      <item.icon className="w-[18px] h-[18px]" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}

            <p className="px-4 py-3 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tools</p>
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
                    className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-emerald-500"
                      />
                    )}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                    }`}>
                      <item.icon className="w-[18px] h-[18px]" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Pro Upgrade Card */}
          {/* <div className="p-4">
            <motion.div
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-5"
              whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
            >
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white">Upgrade to Pro</span>
                    <p className="text-[10px] text-gray-400">Unlock all features</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">Get unlimited AI agents, advanced analytics, and priority support</p>
                <button className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10 hover:border-white/20">
                  Learn More
                </button>
              </div>
            </motion.div>
          </div> */}

          {/* User Profile */}
          <div className="p-4 border-t border-gray-100">
            <motion.div
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer border border-gray-100"
              whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DU</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Demo User</p>
                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                  <Gem className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600">Pro Plan</span>
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
            </motion.div>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mt-2 p-2 rounded-xl bg-white border border-gray-200 shadow-lg"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-rose-600 hover:bg-rose-50 transition-all"
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
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all border border-gray-200"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </motion.button>

              {/* Search Bar */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 w-80 group focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <Search className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                />
                <kbd className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-200 text-[10px] text-gray-500 font-medium">
                  <Command className="w-3 h-3" />K
                </kbd>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Create */}
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                className="relative w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all border border-gray-200"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              </motion.button>

              {/* User Avatar */}
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center"
              >
                <span className="text-white font-bold text-sm">DU</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
