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
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';

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
  const router = useRouter();
  const { user, tenant, logout, isAuthenticated } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, isMobile } = useUIStore();

  useEffect(() => {
    setMounted(true);
    
    // Temporarily disable auth check for development
    // if (!isAuthenticated) {
    //   router.push('/login');
    // }
  }, [isAuthenticated, router]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? (isMobile ? '100%' : '280px') : '0px',
          opacity: sidebarOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 overflow-hidden shadow-2xl ${
          isMobile ? 'w-full' : 'w-[280px]'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <Link href="/app/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  setActiveItem(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  activeItem === item.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${
                  activeItem === item.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge className={`text-xs ${
                    activeItem === item.id
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                  }`}>
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  Demo User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Demo Company
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen && !isMobile ? 'ml-[280px]' : 'ml-0'
      }`}>
        {/* Top Bar */}
        <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200 p-4 shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </Button>
              
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search... (⌘K)"
                  className="bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 w-80 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-lg">
                <Command className="w-4 h-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 rounded-lg">
                <Bell className="w-4 h-4 text-gray-600" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></div>
              </Button>
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-shadow ml-2">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}