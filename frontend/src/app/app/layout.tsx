'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Search,
  Command,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/ui/search-bar';
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
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { logout, isAuthenticated } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, isMobile } = useUIStore();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setMounted(true);
    
    // Temporarily disable auth check for development
    // if (!isAuthenticated) {
    //   router.push('/login');
    // }

    // Detect mobile viewport and update UI store
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      if (isMobileView !== isMobile) {
        useUIStore.getState().setIsMobile(isMobileView);
        // Auto-close sidebar on mobile
        if (isMobileView && sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAuthenticated, router, isMobile, sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    // Set active item based on current path
    const path = window.location.pathname;
    const item = sidebarItems.find(item => path.includes(item.id));
    if (item) {
      setActiveItem(item.id);
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? (isMobile ? '100%' : '220px') : '0px',
          opacity: sidebarOpen ? 1 : 0,
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
        }
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 overflow-hidden shadow-lg ${
          isMobile ? 'w-full' : 'w-[220px]'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <Link href="/app/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-medium text-gray-900">
                AI Social
              </span>
            </Link>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main menu">
            {sidebarItems.map((item, index) => {
              const isActive = activeItem === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                  transition={
                    prefersReducedMotion
                      ? {}
                      : { duration: 0.3, delay: index * 0.05, ease: 'easeOut' }
                  }
                >
                  <Link
                    href={item.href}
                    onClick={() => {
                      setActiveItem(item.id);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant={isActive ? 'default' : 'primary'}
                        size="sm"
                        className={
                          isActive
                            ? 'bg-white/20 text-white border-white/30 text-[10px] px-1.5 py-0.5'
                            : 'text-[10px] px-1.5 py-0.5'
                        }
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  Demo User
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  Demo Company
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors text-xs h-8"
              onClick={handleLogout}
            >
              <LogOut className="w-3 h-3 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen && !isMobile ? 'ml-[220px]' : 'ml-0'
      }`}>
        {/* Top Bar */}
        <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200 p-3 md:p-4 shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] p-2"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </Button>
              
              {/* Search - Hidden on mobile, shown on tablet+ */}
              <div className="hidden md:block flex-1 max-w-md">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                  placeholder="Search..."
                  shortcut="⌘K"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              {/* Search button on mobile */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px]"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:flex hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px]"
                aria-label="Command palette"
              >
                <Command className="w-4 h-4 text-gray-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px]"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" aria-label="New notifications"></span>
              </Button>
              <button
                className="w-9 h-9 md:w-8 md:h-8 bg-gray-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-all"
                aria-label="User menu"
              >
                <User className="w-4 h-4 text-white" />
              </button>
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
      {isMobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}