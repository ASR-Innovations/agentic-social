'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Users, 
  BarChart3, 
  MessageSquare,
  ArrowRight,
  Check,
  Sparkles,
  Shield,
  Clock,
  Globe,
  Target,
  Rocket,
  Star,
  Heart,
  Calendar,
  Image as ImageIcon,
  LayoutDashboard,
  PieChart,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-cyan-50/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Buffer</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">Pricing</a>
              <a href="#about" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">About</a>
              <a href="#blog" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">Blog</a>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                Log in
              </Button>
              <Button
                onClick={() => router.push('/signup')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Get started now
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Features</a>
              <a href="#pricing" className="block py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Pricing</a>
              <a href="#about" className="block py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">About</a>
              <a href="#blog" className="block py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Blog</a>
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/login')}
                  className="w-full justify-center"
                >
                  Log in
                </Button>
                <Button
                  onClick={() => router.push('/signup')}
                  className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Get started now
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto pt-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              Your social media
              <span className="block mt-1">workspace</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Schedule posts, analyze performance, and manage all your social media in one place. Built for teams and individuals who want to grow their online presence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => router.push('/signup')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-base font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Get started for free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">140,000+</div>
              <div className="text-sm text-gray-700 mt-1">Users</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">7,500,000+</div>
              <div className="text-sm text-gray-700 mt-1">Posts Scheduled</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">32</div>
              <div className="text-sm text-gray-700 mt-1">Platforms</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">99%</div>
              <div className="text-sm text-gray-700 mt-1">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500 text-sm font-medium mb-8">TRUSTED BY LEADING BRANDS</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-40">
            {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((company) => (
              <div key={company} className="text-center text-2xl font-bold text-gray-400">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Six AI Agents, Infinite Possibilities
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Each agent specializes in a specific aspect of social media management, working together to amplify your brand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-7 h-7" />}
              title="Content Creator"
              description="Generate platform-optimized content that resonates with your audience. From captions to hashtags, create engaging posts in seconds."
              features={['AI-powered copywriting', 'Multi-platform optimization', 'Brand voice consistency']}
            />
            <FeatureCard
              icon={<Zap className="w-7 h-7" />}
              title="Strategy Planner"
              description="Build data-driven content strategies that align with your goals. Get intelligent recommendations for posting times and content mix."
              features={['Content calendar automation', 'Optimal timing analysis', 'Goal-based planning']}
            />
            <FeatureCard
              icon={<MessageSquare className="w-7 h-7" />}
              title="Engagement Manager"
              description="Never miss a conversation. Automatically respond to comments, messages, and mentions while maintaining your authentic voice."
              features={['Smart reply suggestions', 'Sentiment analysis', 'Priority inbox']}
            />
            <FeatureCard
              icon={<BarChart3 className="w-7 h-7" />}
              title="Analytics Engine"
              description="Transform data into actionable insights. Track performance across all platforms with intelligent reporting and recommendations."
              features={['Cross-platform analytics', 'Custom dashboards', 'Predictive insights']}
            />
            <FeatureCard
              icon={<TrendingUp className="w-7 h-7" />}
              title="Trend Detector"
              description="Stay ahead of the curve with real-time trend analysis. Discover viral content opportunities before your competition."
              features={['Real-time monitoring', 'Industry-specific trends', 'Viral prediction']}
            />
            <FeatureCard
              icon={<Users className="w-7 h-7" />}
              title="Competitor Analyst"
              description="Learn from the best in your industry. Track competitor strategies and identify opportunities to differentiate your brand."
              features={['Competitive benchmarking', 'Strategy insights', 'Gap analysis']}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No complex setup. No learning curve. Just connect and let AI do the heavy lifting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard
              number="01"
              title="Connect Your Accounts"
              description="Link your social media profiles in one click. We support all major platforms including Twitter, LinkedIn, Instagram, and more."
              icon={<Globe className="w-8 h-8" />}
            />
            <StepCard
              number="02"
              title="Configure Your AI"
              description="Tell us about your brand, goals, and preferences. Our AI agents learn your unique voice and style instantly."
              icon={<Brain className="w-8 h-8" />}
            />
            <StepCard
              number="03"
              title="Watch the Magic Happen"
              description="Sit back as your AI team creates, schedules, and optimizes content. Review and approve with a single click."
              icon={<Sparkles className="w-8 h-8" />}
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <StatCard number="10K+" label="Active Users" />
            <StatCard number="2M+" label="Posts Created" />
            <StatCard number="98%" label="Time Saved" />
            <StatCard number="4.9/5" label="User Rating" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include access to all 6 AI agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              name="Starter"
              price="29"
              description="Perfect for individuals and small teams"
              features={[
                '3 social accounts',
                '50 AI-generated posts/month',
                'Basic analytics',
                'Email support'
              ]}
            />
            <PricingCard
              name="Professional"
              price="79"
              description="For growing businesses and agencies"
              features={[
                '10 social accounts',
                'Unlimited AI posts',
                'Advanced analytics',
                'Priority support',
                'Team collaboration',
                'Custom branding'
              ]}
              highlighted
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For large organizations"
              features={[
                'Unlimited accounts',
                'Unlimited everything',
                'Dedicated account manager',
                'Custom integrations',
                'SLA guarantee',
                'White-label options'
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of brands using AI to scale their social media presence.
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/signup')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-6 text-lg shadow-xl shadow-indigo-500/30"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">SocialAI</span>
              </div>
              <p className="text-sm">
                AI-powered social media management for modern brands.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2024 SocialAI. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, features }: any) {
  return (
    <div className="group p-8 rounded-2xl bg-white border border-gray-200 hover:border-indigo-200 hover:shadow-xl transition-all duration-300">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {features.map((feature: string, index: number) => (
          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepCard({ number, title, description, icon }: any) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white shadow-lg flex items-center justify-center text-indigo-600">
        {icon}
      </div>
      <div className="text-5xl font-bold text-indigo-600/20 mb-4">{number}</div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: any) {
  return (
    <div className="text-center">
      <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
}

function PricingCard({ name, price, description, features, highlighted }: any) {
  return (
    <div className={`p-8 rounded-2xl ${highlighted ? 'bg-indigo-600 text-white ring-4 ring-indigo-600 ring-offset-4' : 'bg-white border border-gray-200'}`}>
      <h3 className={`text-2xl font-bold mb-2 ${highlighted ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
      <p className={`text-sm mb-6 ${highlighted ? 'text-indigo-100' : 'text-gray-600'}`}>{description}</p>
      <div className="mb-6">
        <span className="text-5xl font-bold">${price}</span>
        {price !== 'Custom' && <span className={highlighted ? 'text-indigo-100' : 'text-gray-600'}>/month</span>}
      </div>
      <Button
        className={`w-full mb-8 ${highlighted ? 'bg-white text-indigo-600 hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
      >
        Get Started
      </Button>
      <ul className="space-y-3">
        {features.map((feature: string, index: number) => (
          <li key={index} className="flex items-center gap-3">
            <Check className={`w-5 h-5 flex-shrink-0 ${highlighted ? 'text-white' : 'text-indigo-600'}`} />
            <span className={`text-sm ${highlighted ? 'text-indigo-50' : 'text-gray-600'}`}>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
