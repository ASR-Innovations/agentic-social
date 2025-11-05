'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight,
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  Shield,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuthStore } from '@/store/auth';

const features = [
  {
    icon: Zap,
    title: 'AI-Powered Content',
    description: 'Generate engaging content with advanced AI agents',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Users,
    title: 'Multi-Agent System',
    description: 'Specialized AI agents working together for your success',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Deep insights and actionable recommendations',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: MessageSquare,
    title: 'Unified Inbox',
    description: 'Manage all social conversations in one place',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security for your social accounts',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Globe,
    title: 'Multi-Platform',
    description: 'Connect all your social media accounts seamlessly',
    color: 'from-pink-500 to-rose-500'
  }
];

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user) {
      router.push('/app/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">AI Social</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => router.push('/signup')}
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge className="mb-6 bg-purple-100 dark:bg-white/10 text-purple-900 dark:text-white border-purple-200 dark:border-white/20">
            🚀 AI-Powered Social Media Management
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Transform Your Social Media with{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              AI Agents
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Let our multi-agent AI system handle content creation, scheduling, engagement, 
            and analytics while you focus on growing your business.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => router.push('/signup')}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => router.push('/login')}
            >
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Card className="glass-card h-full hover:scale-105 transition-transform duration-200">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <Card className="glass-card max-w-3xl mx-auto">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to revolutionize your social media?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Join thousands of businesses using AI to scale their social media presence.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => router.push('/signup')}
              >
                Get Started for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-8 mt-20 border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 text-sm">
          <p>© 2024 AI Social. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
