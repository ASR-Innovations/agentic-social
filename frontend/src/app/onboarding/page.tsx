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
import { Button } from '@/components/ui/button';
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
    <div className="space-y-3">
      <p className="text-sm text-text-muted text-center mb-3">
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
                <div className={`w-9 h-9 bg-gradient-to-r ${platform.color} rounded-lg flex items-center justify-center shadow-sm`}>
                  <PlatformIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className={`text-sm font-medium ${isConnected ? 'text-green-700' : 'text-text-primary'}`}>
                    {platform.name}
                  </span>
                  {isConnected && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Connected
                    </p>
                  )}
                </div>
              </div>
              <Button 
                variant={isConnected ? "brandOutline" : "brand"}
                size="sm"
                onClick={() => handleConnect(platform.platform)}
                disabled={isConnecting}
                className="text-xs h-8 px-3"
              >
                {isConnecting ? 'Connecting...' : isConnected ? 'Reconnect' : 'Connect'}
              </Button>
            </div>
          );
        })}
      </div>
      <p className="text-text-muted text-xs text-center mt-2">
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
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);
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
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-mint relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-20 w-72 h-72 bg-brand-green/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gray-100 z-50">
        <motion.div 
          className="h-full bg-gradient-to-r from-brand-green via-emerald-400 to-brand-green bg-[length:200%_100%]"
          initial={{ width: 0 }}
          animate={{ 
            width: `${progress}%`,
            backgroundPosition: ['0% 0%', '100% 0%']
          }}
          transition={{ 
            width: { duration: 0.6, ease: "easeOut" },
            backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ 
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="space-y-5"
          >
            {/* Step Progress Indicator */}
            <motion.div 
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {onboardingSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className={`relative ${index === currentStep ? 'w-12' : 'w-2'} h-2 rounded-full transition-all duration-500 ${
                    index <= currentStep ? 'bg-brand-green' : 'bg-gray-200'
                  }`}
                  initial={false}
                  animate={{
                    width: index === currentStep ? 48 : 8,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {index === currentStep && (
                    <motion.div
                      className="absolute inset-0 bg-emerald-400 rounded-full"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Step Header with Icon */}
            <motion.div 
              className="text-center space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-green to-emerald-400 shadow-lg shadow-brand-green/30"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.4
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <currentStepData.icon className="w-8 h-8 text-white" />
              </motion.div>
              
              <div>
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1 bg-brand-green/10 rounded-full mb-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-xs font-semibold text-brand-green">
                    Step {currentStep + 1} of {onboardingSteps.length}
                  </span>
                </motion.div>
                
                <motion.h1 
                  className="text-2xl md:text-3xl font-bold text-text-primary mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {currentStepData.title}
                </motion.h1>
                <motion.p 
                  className="text-sm text-text-muted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {currentStepData.description}
                </motion.p>
              </div>
            </motion.div>

            {/* Step Content Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 backdrop-blur-sm"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
                {/* Step-specific content */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <Input
                      label="Business Name"
                      placeholder="e.g., Acme Corporation"
                    />
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-text-primary mb-2 block">Industry</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Technology', 'Healthcare', 'Finance', 'Retail', 'Education', 'Other'].map((industry) => (
                            <button
                              key={industry}
                              className="p-2 rounded-lg bg-gray-50 border-2 border-transparent hover:border-brand-green hover:bg-brand-green/5 transition-all text-left group"
                            >
                              <p className="text-xs text-text-primary font-medium group-hover:text-brand-green transition-colors">{industry}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-primary mb-2 block">Company Size</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['1-10', '11-50', '51-200', '201+'].map((size) => (
                            <button
                              key={size}
                              className="p-2 rounded-lg bg-gray-50 border-2 border-transparent hover:border-brand-green hover:bg-brand-green/5 transition-all text-left group"
                            >
                              <p className="text-xs text-text-primary font-medium group-hover:text-brand-green transition-colors">{size} employees</p>
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
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-text-primary mb-2 block">Brand Voice</label>
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
                            <div className="text-lg mb-1">{tone.emoji}</div>
                            <p className="text-xs text-text-primary font-semibold">{tone.name}</p>
                            <p className="text-xs text-text-muted">{tone.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-text-primary mb-2 block">AI Automation Level</label>
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
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                selectedAutomation === level.id ? 'bg-brand-green' : 'bg-gray-200'
                              }`}>
                                <LevelIcon className={`w-4 h-4 ${
                                  selectedAutomation === level.id ? 'text-white' : 'text-gray-500'
                                }`} />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-xs text-text-primary font-semibold">{level.label}</p>
                                <p className="text-xs text-text-muted">{level.desc}</p>
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
                  <p className="text-text-muted text-center mb-6">
                    Invite team members to collaborate on your social media strategy
                  </p>
                  <div className="space-y-3">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="colleague@company.com"
                    />
                    <div>
                      <label className="text-sm font-medium text-text-primary mb-2 block">Role</label>
                      <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-text-primary focus:ring-2 focus:ring-brand-green focus:border-brand-green">
                        <option value="editor">Editor</option>
                        <option value="manager">Manager</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    <Button variant="brand" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Send Invitation
                    </Button>
                  </div>
                  <div className="text-center">
                    <p className="text-text-muted text-sm">
                      You can always invite team members later from settings
                    </p>
                  </div>
                </div>
              )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-brand-green/10 to-emerald-50 rounded-xl p-4 border border-brand-green/20">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-green flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-text-primary mb-1">AI-Powered Content</h3>
                          <p className="text-xs text-text-muted">
                            Our AI will analyze your brand voice and create engaging content.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-text-primary mb-2 block">What would you like to post about?</label>
                      <textarea
                        placeholder="e.g., Announcing our new product launch, sharing industry insights..."
                        className="w-full h-24 bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:ring-0 focus:border-brand-green transition-colors resize-none"
                      />
                    </div>
                    
                    <Button variant="brand" className="w-full h-11 text-sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate with AI
                    </Button>
                  </div>
                )}
            </motion.div>

            {/* Navigation */}
            <motion.div 
              className="flex items-center justify-between pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center gap-3">
                {currentStep > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="brandOutline" 
                      onClick={prevStep} 
                      className="h-11 px-5"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </motion.div>
                )}
                <Button 
                  variant="ghost" 
                  onClick={skipOnboarding} 
                  className="text-text-muted hover:text-text-primary h-11"
                >
                  Skip for now
                </Button>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={nextStep} 
                  variant="brand" 
                  className="h-11 px-8 shadow-lg shadow-brand-green/30 hover:shadow-xl hover:shadow-brand-green/40 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <span className="relative z-10 flex items-center">
                    {currentStep === onboardingSteps.length - 1 ? (
                      <>
                        Complete Setup
                        <Check className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Completion Indicator */}
            <motion.div
              className="text-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-green/10 to-emerald-50 rounded-full">
                <motion.div
                  className="w-2 h-2 rounded-full bg-brand-green"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-xs font-medium text-brand-green">
                  {Math.round(progress)}% Complete
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}