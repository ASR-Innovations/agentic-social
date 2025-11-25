'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Building,
  Link as LinkIcon,
  Brain,
  Users,
  Zap,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Youtube
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

const platformConfig = [
  { 
    name: 'Twitter', 
    platform: 'twitter',
    icon: Twitter, 
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  { 
    name: 'Instagram', 
    platform: 'instagram',
    icon: Instagram, 
    color: 'from-pink-500 to-purple-600',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700'
  },
  { 
    name: 'LinkedIn', 
    platform: 'linkedin',
    icon: Linkedin, 
    color: 'from-blue-600 to-blue-800',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  { 
    name: 'Facebook', 
    platform: 'facebook',
    icon: Facebook, 
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  { 
    name: 'YouTube', 
    platform: 'youtube',
    icon: Youtube, 
    color: 'from-red-500 to-red-700',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  },
  { 
    name: 'TikTok', 
    platform: 'tiktok',
    icon: Sparkles, 
    color: 'from-gray-800 to-pink-600',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700'
  },
];

const SocialAccountsStep = () => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);

  useEffect(() => {
    // Load connected accounts
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const accounts = await apiClient.getSocialAccounts();
      setConnectedAccounts(accounts.map((acc: any) => acc.platform));
    } catch (error) {
      console.error('Failed to load connected accounts:', error);
    }
  };

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    try {
      // Get OAuth URL from backend
      const response = await apiClient.client.get(`/social-accounts/auth-url/${platform}`);
      const { url } = response.data;
      
      // Store the platform we're connecting for the callback
      if (typeof window !== 'undefined') {
        localStorage.setItem('oauth_platform', platform);
        localStorage.setItem('oauth_redirect', window.location.href);
      }
      
      // Redirect to OAuth URL
      window.location.href = url;
    } catch (error: any) {
      console.error(`Failed to connect ${platform}:`, error);
      toast.error(error.response?.data?.message || `Failed to connect ${platform}. Please try again.`);
      setConnecting(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-300 text-center mb-6">
        Connect your social media accounts to start managing them with AI
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platformConfig.map((platform) => {
          const isConnected = connectedAccounts.includes(platform.platform);
          const isConnecting = connecting === platform.platform;
          const PlatformIcon = platform.icon;
          
          return (
            <div 
              key={platform.platform} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                isConnected 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${platform.color} rounded-xl flex items-center justify-center shadow-md`}>
                  <PlatformIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className={`font-medium ${isConnected ? 'text-green-700' : 'text-white'}`}>
                    {platform.name}
                  </span>
                  {isConnected && (
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                      <Check className="w-3 h-3" />
                      Connected
                    </p>
                  )}
                </div>
              </div>
              <Button 
                variant={isConnected ? "outline" : "secondary"}
                size="sm"
                onClick={() => handleConnect(platform.platform)}
                disabled={isConnecting}
                className={isConnected ? 'border-green-200 text-green-700 hover:bg-green-50' : ''}
              >
                {isConnecting ? 'Connecting...' : isConnected ? 'Reconnect' : 'Connect'}
              </Button>
            </div>
          );
        })}
      </div>
      <p className="text-gray-400 text-sm text-center mt-4">
        You can connect more platforms later from your settings
      </p>
    </div>
  );
};

const onboardingSteps = [
  {
    id: 'profile',
    title: 'Business Profile',
    description: 'Tell us about your business',
    icon: Building,
  },
  {
    id: 'connect',
    title: 'Connect Platforms',
    description: 'Link your social media accounts',
    icon: LinkIcon,
  },
  {
    id: 'ai-setup',
    title: 'AI Configuration',
    description: 'Customize your AI preferences',
    icon: Brain,
  },
  {
    id: 'team',
    title: 'Team Setup',
    description: 'Invite your team members',
    icon: Users,
  },
  {
    id: 'first-post',
    title: 'First Post',
    description: 'Create your first AI-powered post',
    icon: Zap,
  },
];

export default function OnboardingPage() {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      router.push('/app/dashboard');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    router.push('/app/dashboard');
  };

  if (!mounted) {
    return null;
  }

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">AI Social</span>
            </div>
            <Badge className="bg-white/10 text-white border-white/20 mb-4">
              Welcome! Let's get you set up
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {onboardingSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    index <= currentStep 
                      ? 'bg-primary border-primary text-white' 
                      : 'border-gray-600 text-gray-400'
                  }`}>
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < onboardingSteps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 transition-all ${
                      index < currentStep ? 'bg-primary' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-white font-medium">{currentStepData.title}</p>
              <p className="text-gray-400 text-sm">{currentStepData.description}</p>
            </div>
          </div>

          {/* Step Content */}
          <Card className="glass-card mb-8">
            <CardHeader className="text-center">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4`}>
                <currentStepData.icon className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">{currentStepData.title}</CardTitle>
              <CardDescription className="text-gray-400">
                {currentStepData.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step-specific content */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <Input
                    label="Business Name"
                    placeholder="Enter your business name"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Industry</label>
                      <select className="glass-input w-full">
                        <option value="">Select your industry</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="retail">Retail</option>
                        <option value="education">Education</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Company Size</label>
                      <select className="glass-input w-full">
                        <option value="">Select company size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201+">201+ employees</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <SocialAccountsStep />
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-white mb-3 block">Brand Voice</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Professional', 'Casual', 'Friendly', 'Bold'].map((tone) => (
                        <button
                          key={tone}
                          className="p-3 rounded-lg glass border border-white/10 hover:border-white/20 transition-colors text-left"
                        >
                          <p className="text-white font-medium">{tone}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-white mb-3 block">AI Automation Level</label>
                    <div className="space-y-3">
                      {[
                        { id: 'assisted', label: 'Assisted', desc: 'AI suggests, you approve' },
                        { id: 'autonomous', label: 'Autonomous', desc: 'AI handles everything' },
                      ].map((level) => (
                        <label key={level.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg glass border border-white/10 hover:border-white/20">
                          <input
                            type="radio"
                            name="automation"
                            className="text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="text-white font-medium">{level.label}</p>
                            <p className="text-gray-400 text-sm">{level.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-gray-300 text-center mb-6">
                    Invite team members to collaborate on your social media strategy
                  </p>
                  <div className="space-y-3">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="colleague@company.com"
                    />
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">Role</label>
                      <select className="glass-input w-full">
                        <option value="editor">Editor</option>
                        <option value="manager">Manager</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    <Button variant="secondary" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Send Invitation
                    </Button>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">
                      You can always invite team members later from settings
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <p className="text-gray-300 text-center mb-6">
                    Let's create your first AI-powered social media post!
                  </p>
                  <textarea
                    placeholder="What would you like to post about? Our AI will help you create engaging content..."
                    className="w-full h-24 glass-input resize-none"
                  />
                  <div className="flex items-center justify-center">
                    <Button className="gradient-primary">
                      <Zap className="w-4 h-4 mr-2" />
                      Generate with AI
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentStep > 0 && (
                <Button variant="secondary" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button variant="ghost" onClick={skipOnboarding} className="text-gray-400 hover:text-white">
                Skip for now
              </Button>
            </div>

            <Button onClick={nextStep} className="gradient-primary">
              {currentStep === onboardingSteps.length - 1 ? 'Complete Setup' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Step indicator */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Step {currentStep + 1} of {onboardingSteps.length}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}