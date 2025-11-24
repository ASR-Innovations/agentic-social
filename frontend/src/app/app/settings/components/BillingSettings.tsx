'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, Download, Calendar, DollarSign, Check, Crown,
  TrendingUp, Users, Zap
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    features: ['5 Social Accounts', '100 Posts/Month', 'Basic Analytics', 'Email Support'],
    icon: Zap
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    features: ['20 Social Accounts', '500 Posts/Month', 'Advanced Analytics', 'AI Features', 'Priority Support'],
    icon: TrendingUp,
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 199,
    features: ['50 Social Accounts', 'Unlimited Posts', 'Full Analytics Suite', 'All AI Features', 'Team Collaboration', '24/7 Support'],
    icon: Users
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    features: ['Unlimited Everything', 'White Label', 'Custom Integrations', 'Dedicated Support', 'SLA Guarantee'],
    icon: Crown
  },
];

const invoices = [
  { id: '1', date: '2024-01-01', amount: 79, status: 'paid', plan: 'Professional' },
  { id: '2', date: '2023-12-01', amount: 79, status: 'paid', plan: 'Professional' },
  { id: '3', date: '2023-11-01', amount: 79, status: 'paid', plan: 'Professional' },
];

export default function BillingSettings() {
  const { tenant } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Current Plan</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 rounded-lg glass border border-primary/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white capitalize">{tenant?.planTier} Plan</h3>
                  <p className="text-gray-400 text-sm">Billed monthly</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">$79</p>
                <p className="text-gray-400 text-sm">/month</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Next billing date: January 1, 2024</p>
              <Button variant="secondary">Change Plan</Button>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg glass border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Social Accounts</p>
              <p className="text-2xl font-bold text-white">8 / 20</p>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className="p-4 rounded-lg glass border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Posts This Month</p>
              <p className="text-2xl font-bold text-white">247 / 500</p>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '49%' }}></div>
              </div>
            </div>
            <div className="p-4 rounded-lg glass border border-white/10">
              <p className="text-gray-400 text-sm mb-1">AI Budget</p>
              <p className="text-2xl font-bold text-white">$127 / $500</p>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Available Plans</CardTitle>
              <CardDescription className="text-gray-400">
                Choose the plan that fits your needs
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-white text-gray-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Annual <Badge variant="success" className="ml-2 text-xs">Save 20%</Badge>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 rounded-lg glass border ${
                  plan.popular ? 'border-primary' : 'border-white/10'
                } relative`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <div className="text-center mb-4">
                  <plan.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <div className="mt-2">
                    {plan.price ? (
                      <>
                        <span className="text-3xl font-bold text-white">
                          ${billingCycle === 'annual' ? Math.round(plan.price * 0.8) : plan.price}
                        </span>
                        <span className="text-gray-400 text-sm">/mo</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-white">Custom</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? 'default' : 'secondary'}
                  className="w-full"
                >
                  {plan.price ? 'Upgrade' : 'Contact Sales'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Payment Method</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your payment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg glass border border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">•••• •••• •••• 4242</p>
                <p className="text-gray-400 text-sm">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="secondary">Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Billing History</CardTitle>
          <CardDescription className="text-gray-400">
            View and download your invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg glass border border-white/10">
                <div className="flex items-center space-x-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">{invoice.plan} Plan</p>
                    <p className="text-gray-400 text-sm">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-white font-medium">${invoice.amount}</p>
                    <Badge variant="success" className="text-xs">Paid</Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
