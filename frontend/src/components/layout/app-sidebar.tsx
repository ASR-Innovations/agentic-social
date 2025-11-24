'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Calendar, 
  Sparkles, 
  BarChart3, 
  MessageSquare, 
  Radio,
  Image,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const navigation = [
  {
    name: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Content',
    href: '/app/content',
    icon: Calendar,
    badge: null,
  },
  {
    name: 'AI Hub',
    href: '/app/ai-hub',
    icon: Sparkles,
    badge: 'AI',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
  {
    name: 'Analytics',
    href: '/app/analytics',
    icon: BarChart3,
    badge: null,
  },
  {
    name: 'Inbox',
    href: '/app/inbox',
    icon: MessageSquare,
    badge: '3',
    badgeColor: 'bg-red-500',
  },
  {
    name: 'Listening',
    href: '/app/listening',
    icon: Radio,
    badge: null,
  },
  {
    name: 'Media',
    href: '/app/media',
    icon: Image,
    badge: null,
  },
  {
    name: 'Team',
    href: '/app/team',
    icon: Users,
    badge: null,
  },
  {
    name: 'Settings',
    href: '/app/settings',
    icon: Settings,
    badge: null,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar, isMobile } = useUIStore();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20',
          isMobile && !sidebarOpen && '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/app/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                AI Social
              </span>
            )}
          </Link>
          
          {/* Desktop Toggle */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden lg:flex"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                  active
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                  !sidebarOpen && 'justify-center'
                )}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0',
                    active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                  )}
                />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 font-medium">{item.name}</span>
                    {item.badge && (
                      <Badge
                        className={cn(
                          'text-xs px-2 py-0.5',
                          item.badgeColor || 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
                
                {/* Tooltip for collapsed state */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 bg-white bg-opacity-20 rounded text-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {sidebarOpen ? (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  AI Credits
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Used</span>
                  <span>750 / 1000</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: '75%' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
