'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowRight,
  Chrome,
  Apple
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      toast.success('Welcome back!');
      router.push('/app/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome back</h1>
            <p className="text-text-muted">Sign in to your account to continue</p>
          </div>

          {/* Login Card */}
          <Card variant="buffer" className="p-8">
            <div className="space-y-6">
              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button
                  variant="brandOutline"
                  className="w-full justify-start h-11"
                  onClick={() => toast('Social login coming soon!')}
                >
                  <Chrome className="w-5 h-5 mr-3" />
                  Continue with Google
                </Button>
                <Button
                  variant="brandOutline"
                  className="w-full justify-start h-11"
                  onClick={() => toast('Social login coming soon!')}
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
                  <span className="px-4 bg-white text-text-muted">Or continue with email</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="Enter your email"
                    variant="clean"
                    className="pl-11"
                    error={errors.email?.message}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    variant="clean"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm text-text-muted cursor-pointer">
                    <input
                      {...register('rememberMe')}
                      type="checkbox"
                      className="rounded border-gray-300 text-brand-green focus:ring-brand-green focus:ring-offset-0"
                    />
                    <span>Remember me</span>
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-brand-green hover:text-brand-green/80 transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  variant="brand"
                  className="w-full h-11" 
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-text-muted text-sm">
                  Don't have an account?{' '}
                  <Link 
                    href="/signup" 
                    className="text-brand-green hover:text-brand-green/80 font-medium transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>

              {/* Demo Account */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-center text-sm text-text-muted mb-3">
                  Try the demo account
                </p>
                <Button
                  variant="brandOutline"
                  className="w-full h-11"
                  onClick={() => {
                    // Auto-fill demo credentials
                    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
                    if (emailInput && passwordInput) {
                      emailInput.value = 'demo@aisocial.com';
                      passwordInput.value = 'demo123456';
                    }
                  }}
                >
                  Use Demo Account
                </Button>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-text-muted">
            <p>
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-brand-green hover:text-brand-green/80 transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-brand-green hover:text-brand-green/80 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}