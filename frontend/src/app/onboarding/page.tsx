'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Instagram,
  Linkedin,
  Facebook,
  Youtube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { XIcon } from '@/components/icons/XIcon';

const platformConfig = [
  { 
    name: 'X (Twitter)', 
    platform: 'twitter',
    icon: XIcon, 
    iconColor: 'text-black',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-900'
  },
  // { 
  //   name: 'Instagram', 
  //   platform: 'instagram',
  //   icon: Instagram, 
  //   iconColor: 'text-pink-600',
  //   bgColor: 'bg-pink-50',
  //   textColor: 'text-pink-700'
  // },
  { 
    name: 'LinkedIn', 
    platform: 'linkedin',
    icon: Linkedin, 
    iconColor: 'text-[#0A66C2]',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  // { 
  //   name: 'Facebook', 
  //   platform: 'facebook',
  //   icon: Facebook, 
  //   iconColor: 'text-[#1877F2]',
  //   bgColor: 'bg-blue-50',
  //   textColor: 'text-blue-700'
  // },
  // { 
  //   name: 'YouTube', 
  //   platform: 'youtube',
  //   icon: Youtube, 
  //   iconColor: 'text-[#FF0000]',
  //   bgColor: 'bg-red-50',
  //   textColor: 'text-red-700'
  // },
  // { 
  //   name: 'TikTok', 
  //   platform: 'tiktok',
  //   icon: Sparkles, 
  //   iconColor: 'text-black',
  //   bgColor: 'bg-gray-50',
  //   textColor: 'text-gray-700'
  // },
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
    <div className="space-y-3">
      <p className="text-xs text-text-muted text-center mb-3">
        Connect your social media accounts to start managing them with AI
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {platformConfig.map((platform) => {
          const isConnected = connectedAccounts.includes(platform.platform);
          const isConnecting = connecting === platform.platform;
          const PlatformIcon = platform.icon;
          
          return (
            <div 
              key={platform.platform} 
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                isConnected 
                  ? 'bg-pastel-mint border-green-200' 
                  : 'bg-white border-gray-200 hover:border-brand-green'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className={`w-9 h-9 ${platform.bgColor} rounded-lg flex items-center justify-center shadow-sm`}>
                  <PlatformIcon className={`w-5 h-5 ${platform.iconColor}`} />
                </div>
                <div>
                  <span className={`text-xs font-semibold ${isConnected ? 'text-green-700' : 'text-text-primary'}`}>
                    {platform.name}
                  </span>
                  {isConnected && (
                    <p className="text-[10px] text-green-600 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      Connected
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant={isConnected ? "outline" : "default"}
                size="sm"
                onClick={() => handleConnect(platform.platform)}
                disabled={isConnecting}
                className="text-[10px] h-7 px-2.5"
              >
                {isConnecting ? 'Connecting...' : isConnected ? 'Reconnect' : 'Connect'}
              </Button>
            </div>
          );
        })}
      </div>
      <p className="text-text-muted text-[10px] text-center mt-2">
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
  const [direction, setDirection] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedCompanySize, setSelectedCompanySize] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      router.push('/app/dashboard');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
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
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-mint relative overflow-hidden">
      {/* Animated Background Elements - Static */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-brand-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gray-100 z-50">
        <motion.div 
          className="h-full bg-gradient-to-r from-brand-green via-emerald-400 to-brand-green"
          animate={{ 
            width: `${progress}%`
          }}
          transition={{ 
            duration: 0.5,
            ease: "easeOut"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-6">
          {/* Animated Content Area */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
              >
                {/* Step Header */}
                <div className="text-center space-y-2 mb-6">
                  <h1 className="text-xl md:text-2xl font-bold text-text-primary">
                    {currentStepData.title}
                  </h1>
                  <p className="text-sm text-text-muted">
                    {currentStepData.description}
                  </p>
                </div>

                {/* Step Content Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="space-y-6">
                    {/* Step-specific content */}
                    {currentStep === 0 && (
                      <div className="space-y-6">
                        <Input
                          label="Business Name"
                          placeholder="e.g., Acme Corporation"
                        />
                        <div className="space-y-6">
                          <div>
                            <div className="bg-gray-50 -mx-8 px-8 py-2.5 mb-4 border-y border-gray-100">
                              <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">Industry</label>
                            </div>
                        <div className="grid grid-cols-3 gap-2">
                          {['Technology', 'Healthcare', 'Finance', 'Retail', 'Education', 'Other'].map((industry) => (
                            <button
                              key={industry}
                              onClick={() => setSelectedIndustry(industry)}
                              className={`p-2 rounded-lg border-2 transition-all text-left ${
                                selectedIndustry === industry
                                  ? 'border-brand-green bg-brand-green/5 shadow-sm'
                                  : 'border-gray-200 bg-gray-50 hover:border-brand-green/50'
                              }`}
                            >
                              <p className={`text-[11px] font-medium transition-colors ${
                                selectedIndustry === industry ? 'text-brand-green' : 'text-text-primary'
                              }`}>{industry}</p>
                            </button>
                          ))}
                        </div>
                          </div>
                          <div>
                            <div className="bg-gray-50 -mx-8 px-8 py-2.5 mb-4 border-y border-gray-100">
                              <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">Company Size</label>
                            </div>
                        <div className="grid grid-cols-2 gap-2">
                          {['1-10', '11-50', '51-200', '201+'].map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedCompanySize(size)}
                              className={`p-2 rounded-lg border-2 transition-all text-left ${
                                selectedCompanySize === size
                                  ? 'border-brand-green bg-brand-green/5 shadow-sm'
                                  : 'border-gray-200 bg-gray-50 hover:border-brand-green/50'
                              }`}
                            >
                              <p className={`text-[11px] font-medium transition-colors ${
                                selectedCompanySize === size ? 'text-brand-green' : 'text-text-primary'
                              }`}>{size} employees</p>
                            </button>
                          ))}
                        </div>
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
                        <div className="bg-gray-50 -mx-8 px-8 py-2.5 mb-4 border-y border-gray-100">
                          <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">Brand Voice</label>
                        </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: 'Professional', emoji: '💼', desc: 'Formal' },
                          { name: 'Casual', emoji: '😊', desc: 'Relaxed' },
                          { name: 'Friendly', emoji: '🤝', desc: 'Warm' },
                          { name: 'Bold', emoji: '⚡', desc: 'Confident' }
                        ].map((tone) => (
                          <button
                            key={tone.name}
                            onClick={() => setSelectedVoice(tone.name)}
                            className={`p-2.5 rounded-lg border-2 transition-all text-left ${
                              selectedVoice === tone.name
                                ? 'border-brand-green bg-brand-green/5 shadow-sm'
                                : 'border-gray-200 bg-gray-50 hover:border-brand-green/50'
                            }`}
                          >
                            <div className="text-base mb-0.5">{tone.emoji}</div>
                            <p className="text-xs text-text-primary font-semibold mb-0.5">{tone.name}</p>
                            <p className="text-[10px] text-text-muted leading-tight">{tone.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                      <div>
                        <div className="bg-gray-50 -mx-8 px-8 py-2.5 mb-4 border-y border-gray-100">
                          <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">AI Automation Level</label>
                        </div>
                        <div className="space-y-2">
                        {[
                          { id: 'assisted', label: 'Assisted', desc: 'AI suggests, you approve', icon: Users },
                          { id: 'autonomous', label: 'Autonomous', desc: 'AI handles everything', icon: Zap },
                        ].map((level) => {
                          const LevelIcon = level.icon;
                          return (
                            <button
                              key={level.id}
                              onClick={() => setSelectedAutomation(level.id)}
                              className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border-2 transition-all ${
                                selectedAutomation === level.id
                                  ? 'border-brand-green bg-brand-green/5 shadow-sm'
                                  : 'border-gray-200 bg-gray-50 hover:border-brand-green/50'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                selectedAutomation === level.id ? 'bg-brand-green' : 'bg-gray-200'
                              }`}>
                                <LevelIcon className={`w-3.5 h-3.5 ${
                                  selectedAutomation === level.id ? 'text-white' : 'text-gray-500'
                                }`} />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-xs text-text-primary font-semibold leading-tight mb-0.5">{level.label}</p>
                                <p className="text-[10px] text-text-muted leading-tight">{level.desc}</p>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selectedAutomation === level.id
                                  ? 'border-brand-green bg-brand-green'
                                  : 'border-gray-300'
                              }`}>
                                {selectedAutomation === level.id && (
                                  <Check className="w-2.5 h-2.5 text-white" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-text-muted text-xs text-center mb-4">
                    Invite team members to collaborate on your social media strategy
                  </p>
                  <div className="space-y-3">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="colleague@company.com"
                    />
                    <div>
                      <label className="text-xs font-semibold text-text-primary mb-2 block">Role</label>
                      <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-text-primary focus:ring-2 focus:ring-brand-green focus:border-brand-green">
                        <option value="editor">Editor</option>
                        <option value="manager">Manager</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    <Button variant="default" className="w-full h-10 text-sm">
                      <Users className="w-3.5 h-3.5 mr-2" />
                      Send Invitation
                    </Button>
                  </div>
                  <div className="text-center">
                    <p className="text-text-muted text-[10px]">
                      You can always invite team members later from settings
                    </p>
                  </div>
                </div>
              )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-brand-green/10 to-emerald-50 rounded-xl p-3.5 border border-brand-green/20">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-brand-green flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-text-primary mb-0.5 leading-tight">AI-Powered Content</h3>
                          <p className="text-[10px] text-text-muted leading-tight">
                            Our AI will analyze your brand voice and create engaging content.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-primary mb-2 block">What would you like to post about?</label>
                      <textarea
                        placeholder="e.g., Announcing our new product launch, sharing industry insights..."
                        className="w-full h-24 bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2.5 text-xs text-text-primary placeholder:text-text-muted placeholder:text-[11px] focus:ring-0 focus:border-brand-green transition-colors resize-none"
                      />
                    </div>

                    <Button variant="default" className="w-full h-10 text-sm">
                      <Sparkles className="w-3.5 h-3.5 mr-2" />
                      Generate with AI
                    </Button>
                  </div>
                )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Fixed Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="h-11 px-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={skipOnboarding}
                className="text-text-muted hover:text-text-primary h-11"
              >
                Skip for now
              </Button>
            </div>

            <Button
              onClick={nextStep}
              variant="default"
              className="h-11 px-8 shadow-lg shadow-brand-green/20"
            >
              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  Complete Setup
                  <Check className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}