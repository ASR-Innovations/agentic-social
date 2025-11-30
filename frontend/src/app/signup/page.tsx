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
  Apple
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
  { text: 'At least 8 characters', regex: /.{8,}/ },
  { text: 'One uppercase letter', regex: /[A-Z]/ },
  { text: 'One lowercase letter', regex: /[a-z]/ },
  { text: 'One number', regex: /\d/ },
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

  // Pre-fill email from URL parameter if provided
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
      
      // If email already exists, show helpful message
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
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-cream/95 backdrop-blur-sm border-b border-gray-200 z-50 py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-green flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-text-primary">SocialAI</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          {/* <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Create your account</h1>
            <p className="text-sm text-text-muted">Start your 14-day free trial today</p>
          </div> */}

          {/* Signup Card */}
          <Card variant="glass" className="p-8">
            <div className="space-y-6">
              {/* Social Signup Buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-11"
                  onClick={() => toast('Social signup coming soon!')}
                >
                  <Chrome className="w-5 h-5 mr-3" />
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-11"
                  onClick={() => toast('Social signup coming soon!')}
                >
                  <Apple className="w-5 h-5 mr-3" />
                  Continue with Apple
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-text-muted">Or create with email</span>
                </div>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
                    <Input
                      {...register('firstName')}
                      placeholder="First name"
                      className="pl-11"
                      error={errors.firstName?.message}
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
                    <Input
                      {...register('lastName')}
                      placeholder="Last name"
                      className="pl-11"
                      error={errors.lastName?.message}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="Enter your email"
                    className="pl-11"
                    error={errors.email?.message}
                  />
                </div>

                {/* Company Name */}
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
                  <Input
                    {...register('tenantName')}
                    placeholder="Company name"
                    className="pl-11"
                    error={errors.tenantName?.message}
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="pl-11 pr-11"
                    error={errors.password?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-text-muted hover:text-text-primary transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Requirements */}
                {watchedPassword && (
                  <div className="space-y-2">
                    <p className="text-sm text-text-muted">Password requirements:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                            req.regex.test(watchedPassword) 
                              ? 'bg-brand-green' 
                              : 'bg-gray-300'
                          }`}>
                            {req.regex.test(watchedPassword) && (
                              <Check className="w-2.5 h-2.5 text-white" />
                            )}
                          </div>
                          <span className={`text-xs transition-colors ${
                            req.regex.test(watchedPassword) 
                              ? 'text-brand-green' 
                              : 'text-text-muted'
                          }`}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terms Agreement */}
                <div className="flex items-start space-x-2">
                  <input
                    {...register('agreeToTerms')}
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 text-brand-green focus:ring-brand-green focus:ring-offset-0 cursor-pointer"
                  />
                  <label className="text-sm text-text-muted cursor-pointer">
                    I agree to the{' '}
                    <Link href="/terms" className="text-brand-green hover:text-brand-green/80 transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-brand-green hover:text-brand-green/80 transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>
                )}

                <Button 
                  type="submit" 
                  variant="default"
                  className="w-full h-11" 
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-text-muted text-sm">
                  Already have an account?{' '}
                  <Link 
                    href="/login" 
                    className="text-brand-green hover:text-brand-green/80 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Features Preview */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-center text-sm text-text-muted mb-3">
                  What you'll get:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-text-primary">
                    <Check className="w-4 h-4 text-brand-green" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-text-primary">
                    <Check className="w-4 h-4 text-brand-green" />
                    <span>AI-powered content creation</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-text-primary">
                    <Check className="w-4 h-4 text-brand-green" />
                    <span>Multi-platform publishing</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-text-primary">
                    <Check className="w-4 h-4 text-brand-green" />
                    <span>Advanced analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
        </div>
      </div>
    </div>
  );
}