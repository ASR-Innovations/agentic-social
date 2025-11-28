/**
 * Lazy-loaded page components for code splitting
 * This file centralizes all lazy imports for better maintainability
 */

import { lazy } from 'react';

// App pages - lazy loaded for code splitting
export const DashboardPage = lazy(() => import('@/app/app/dashboard/page'));
export const AIHubPage = lazy(() => import('@/app/app/ai-hub/page'));
export const ContentPage = lazy(() => import('@/app/app/content/page'));
export const AnalyticsPage = lazy(() => import('@/app/app/analytics/page'));
export const InboxPage = lazy(() => import('@/app/app/inbox/page'));
export const MediaPage = lazy(() => import('@/app/app/media/page'));
export const ListeningPage = lazy(() => import('@/app/app/listening/page'));
export const TeamPage = lazy(() => import('@/app/app/team/page'));
export const SettingsPage = lazy(() => import('@/app/app/settings/page'));

// Auth pages
export const LoginPage = lazy(() => import('@/app/login/page'));
export const SignupPage = lazy(() => import('@/app/signup/page'));
export const OnboardingPage = lazy(() => import('@/app/onboarding/page'));
