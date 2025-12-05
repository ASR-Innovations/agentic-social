'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { 
  Eye, 
  EyeOff, 
  Sparkles, 
  Mail, 
  Lock,
  User,
  Building,
  ArrowRight,
  Check,
  Chrome,
  Apple,
  Zap,
  Shield,
  Star
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  tenantName: z.string().min(2, 'Company name must be at least 2 characters'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
});

type SignupForm = z.infer<typeof signupSchema>;

const passwordRequirements = [
  { text: '8+ characters', regex: /.{8,}/ },
  { text: 'Uppercase', regex: /[A-Z]/ },
  { text: 'Lowercase', regex: /[a-z]/ },
  { text: 'Number', regex: /\d/ },
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const watchedPassword = watch('password', '');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setValue('email', emailParam);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: SignupForm) => {
    try {
      await registerUser(data);
      toast.success('Account created successfully!');
      router.push('/onboarding');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      
      if (error.response?.status === 409 || errorMessage.includes('already exists')) {
        toast.error('This email is already registered. Please login instead.', {
          duration: 5000,
        });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-emerald-500/80 to-teal-600/90" />
        
        {/* Curved Edge */}
        <div className="absolute right-0 top-0 bottom-0 w-24">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 Q80,50 0,100 L100,100 L100,0 Z" fill="white" />
          </svg>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-all">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">SocialAI</span>
          </Link>

          {/* Main Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
                Transform your
                <span className="block">social presence</span>
                <span className="block text-emerald-200">with AI power</span>
              </h1>
              <p className="text-lg text-white/80 max-w-md">
                Join 50,000+ creators and businesses automating their content strategy with intelligent tools.
              </p>
            </motion.div>

            {/* Feature Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              {['AI Content', 'Multi-Platform', 'Analytics', 'Scheduling'].map((feature, i) => (
                <span 
                  key={feature}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20"
                >
                  {feature}
                </span>
              ))}
            </motion.div>
          </div>

         
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SocialAI</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-500">Start your 14-day free trial</p>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-11 bg-white hover:bg-gray-50 border-gray-200 rounded-xl"
                onClick={() => toast('Social signup coming soon!')}
              >
                <Chrome className="w-5 h-5 mr-2" />
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11 bg-white hover:bg-gray-50 border-gray-200 rounded-xl"
                onClick={() => toast('Social signup coming soon!')}
              >
                <Apple className="w-5 h-5 mr-2" />
                Apple
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">or</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Input
                    {...register('firstName')}
                    placeholder="First name"
                    className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500"
                    error={errors.firstName?.message}
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Input
                    {...register('lastName')}
                    placeholder="Last name"
                    className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500"
                    error={errors.lastName?.message}
                  />
                </div>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Email address"
                  className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500"
                  error={errors.email?.message}
                />
              </div>

              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  {...register('tenantName')}
                  placeholder="Company name"
                  className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500"
                  error={errors.tenantName?.message}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create password"
                  className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500"
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {watchedPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex gap-2"
                >
                  {passwordRequirements.map((req, i) => (
                    <div
                      key={i}
                      className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                        req.regex.test(watchedPassword)
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {req.text}
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  {...register('agreeToTerms')}
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                <label className="text-sm text-gray-500">
                  I agree to the{' '}
                  <Link href="/terms" className="text-emerald-500 hover:text-emerald-600 font-medium">Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-emerald-500 hover:text-emerald-600 font-medium">Privacy Policy</Link>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-rose-500">{errors.agreeToTerms.message}</p>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium shadow-lg shadow-gray-900/20" 
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-gray-500 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-500 hover:text-emerald-600 font-semibold">
                Sign in
              </Link>
            </p>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 pt-4 text-gray-400">
              <div className="flex items-center gap-1.5 text-xs">
                <Shield className="w-4 h-4" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Check className="w-4 h-4" />
                <span>GDPR</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Zap className="w-4 h-4" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
