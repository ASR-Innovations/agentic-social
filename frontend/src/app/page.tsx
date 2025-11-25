'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Zap, TrendingUp, Users, BarChart3, MessageSquare } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            AI-Powered Social Media
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Management Platform
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Harness the power of 6 specialized AI agents to create, schedule, and optimize your social media content across all platforms.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/signup')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/login')}
              className="border-purple-400 text-purple-400 hover:bg-purple-400/10 px-8 py-6 text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="Content Creator Agent"
            description="Generate engaging, platform-optimized content with AI"
            color="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Strategy Agent"
            description="Plan and optimize your content strategy automatically"
            color="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="Engagement Agent"
            description="Manage interactions and build community"
            color="from-green-500 to-emerald-500"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Analytics Agent"
            description="Track performance and get actionable insights"
            color="from-orange-500 to-red-500"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Trend Detection"
            description="Stay ahead with real-time trend analysis"
            color="from-indigo-500 to-purple-500"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Competitor Analysis"
            description="Monitor and learn from your competition"
            color="from-pink-500 to-rose-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-20">
          <StatCard number="6" label="AI Agents" />
          <StatCard number="5+" label="Platforms" />
          <StatCard number="24/7" label="Automation" />
          <StatCard number="∞" label="Possibilities" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: any) {
  return (
    <div className="p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all hover:scale-105">
      <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: any) {
  return (
    <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10">
      <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
        {number}
      </div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}
