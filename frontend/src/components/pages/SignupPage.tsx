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
  Chrome,
  Apple
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
  { text: '8+', regex: /.{8,}/ },
  { text: 'A-Z', regex: /[A-Z]/ },
  { text: 'a-z', regex: /[a-z]/ },
  { text: '0-9', regex: /\d/ },
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
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-emerald-500/85 to-teal-600/90" />
        <div className="absolute right-0 top-0 bottom-0 w-20">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 Q70,50 0,100 L100,100 L100,0 Z" fill="white" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-10 text-white h-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">SocialAI</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-bold leading-tight">
              Your AI-powered
              <span className="block text-white/90">social media partner</span>
            </h1>
            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm text-white/70">Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold">10M+</div>
                <div className="text-sm text-white/70">Posts</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 text-sm text-white/80"
          >
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-emerald-500 flex items-center justify-center text-xs font-medium">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span>Trusted by leading brands</span>
          </motion.div>
        </div>
      </div>


      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SocialAI</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Get started</h2>
              <p className="text-gray-500 text-sm">Create your account in seconds</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-11 bg-white hover:bg-gray-50 border-gray-200 rounded-xl text-sm"
                onClick={() => toast('Coming soon!')}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11 bg-white hover:bg-gray-50 border-gray-200 rounded-xl text-sm"
                onClick={() => toast('Coming soon!')}
              >
                <Apple className="w-4 h-4 mr-2" />
                Apple
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-gray-400">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input
                    {...register('firstName')}
                    placeholder="First name"
                    className="pl-9 h-11 bg-gray-50/80 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500"
                    error={errors.firstName?.message}
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input
                    {...register('lastName')}
                    placeholder="Last name"
                    className="pl-9 h-11 bg-gray-50/80 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500"
                    error={errors.lastName?.message}
                  />
                </div>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Email"
                  className="pl-9 h-11 bg-gray-50/80 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500"
                  error={errors.email?.message}
                />
              </div>

              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input
                  {...register('tenantName')}
                  placeholder="Company"
                  className="pl-9 h-11 bg-gray-50/80 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500"
                  error={errors.tenantName?.message}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="pl-9 pr-10 h-11 bg-gray-50/80 border-gray-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500"
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {watchedPassword && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-1"
                >
                  {passwordRequirements.map((req, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded-full transition-all ${
                        req.regex.test(watchedPassword) ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </motion.div>
              )}

              <div className="flex items-start gap-2 pt-1">
                <input
                  {...register('agreeToTerms')}
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                <label className="text-xs text-gray-500 leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-emerald-500 hover:underline">Terms</Link>
                  {' & '}
                  <Link href="/privacy" className="text-emerald-500 hover:underline">Privacy</Link>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-xs text-rose-500">{errors.agreeToTerms.message}</p>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium text-sm" 
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

            <p className="text-center text-gray-500 text-sm">
              Have an account?{' '}
              <Link href="/login" className="text-emerald-500 hover:text-emerald-600 font-medium">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
