'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting your account...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Get OAuth parameters from URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        throw new Error(error);
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      // Get stored platform and redirect URL
      const platform = localStorage.getItem('oauth_platform');
      const redirectUrl = localStorage.getItem('oauth_redirect') || '/app/dashboard';

      if (!platform) {
        throw new Error('Platform information not found');
      }

      setMessage(`Connecting your ${platform} account...`);

      // Exchange code for tokens via backend
      const redirectUri = `${window.location.origin}/oauth/callback`;
      await apiClient.connectSocialAccount({
        platform: platform as any,
        code: code,
        redirectUri,
      });

      // Clean up localStorage
      localStorage.removeItem('oauth_platform');
      localStorage.removeItem('oauth_redirect');

      setStatus('success');
      setMessage(`Successfully connected your ${platform} account!`);
      toast.success(`${platform} account connected successfully!`);

      // Redirect back after a short delay
      setTimeout(() => {
        router.push(redirectUrl);
      }, 2000);
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to connect account. Please try again.');
      toast.error('Failed to connect account');

      // Redirect back after a short delay
      setTimeout(() => {
        const redirectUrl = localStorage.getItem('oauth_redirect') || '/app/dashboard';
        localStorage.removeItem('oauth_platform');
        localStorage.removeItem('oauth_redirect');
        router.push(redirectUrl);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="mb-6">
            {status === 'loading' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                <Loader2 className="w-12 h-12 text-indigo-600" />
              </motion.div>
            )}
            {status === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              >
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              >
                <XCircle className="w-12 h-12 text-red-600 mx-auto" />
              </motion.div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' && 'Connecting Account'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Connection Failed'}
          </h1>

          <p className="text-gray-600 mb-6">{message}</p>

          {status === 'loading' && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {(status === 'success' || status === 'error') && (
            <p className="text-sm text-gray-500">
              Redirecting you back...
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
