'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CostBreakdown {
  model: string;
  requests: number;
  tokens: number;
  cost: number;
  percentage: number;
}

export function AICostTracker() {
  const [currentCost, setCurrentCost] = useState(127.50);
  const [budgetLimit, setBudgetLimit] = useState(500);
  const [costTrend, setCostTrend] = useState('+12%');
  const [projectedCost, setProjectedCost] = useState(385);
  const [breakdown, setBreakdown] = useState<CostBreakdown[]>([
    {
      model: 'GPT-4o-mini',
      requests: 1247,
      tokens: 156000,
      cost: 78.50,
      percentage: 61.6,
    },
    {
      model: 'GPT-4o',
      requests: 342,
      tokens: 89000,
      cost: 35.20,
      percentage: 27.6,
    },
    {
      model: 'Claude Haiku',
      requests: 892,
      tokens: 112000,
      cost: 11.30,
      percentage: 8.9,
    },
    {
      model: 'Claude Sonnet',
      requests: 89,
      tokens: 23000,
      cost: 2.50,
      percentage: 1.9,
    },
  ]);

  const usagePercentage = (currentCost / budgetLimit) * 100;
  const isNearLimit = usagePercentage > 80;
  const isOverLimit = usagePercentage > 100;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          AI Cost Tracker
        </CardTitle>
        <CardDescription className="text-gray-400">
          Monitor your AI usage and spending
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Current Usage</p>
              <p className="text-white text-3xl font-bold">${currentCost.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Monthly Budget</p>
              <p className="text-white text-xl font-semibold">${budgetLimit.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Budget Used</span>
              <span className={`font-semibold ${
                isOverLimit ? 'text-red-400' :
                isNearLimit ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {usagePercentage.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={Math.min(usagePercentage, 100)}
              className={`h-2 ${
                isOverLimit ? '[&>div]:bg-red-500' :
                isNearLimit ? '[&>div]:bg-yellow-500' :
                '[&>div]:bg-green-500'
              }`}
            />
          </div>

          {isNearLimit && (
            <div className={`p-3 rounded-lg flex items-start space-x-2 ${
              isOverLimit
                ? 'bg-red-500/10 border border-red-500/20'
                : 'bg-yellow-500/10 border border-yellow-500/20'
            }`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isOverLimit ? 'text-red-400' : 'text-yellow-400'
              }`} />
              <div>
                <p className="text-white font-semibold text-sm">
                  {isOverLimit ? 'Budget Exceeded' : 'Approaching Budget Limit'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {isOverLimit
                    ? 'You have exceeded your monthly AI budget. Consider upgrading your plan.'
                    : 'You are approaching your monthly AI budget limit. Monitor usage carefully.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cost Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex items-center space-x-2 mb-1">
              {costTrend.startsWith('+') ? (
                <TrendingUp className="w-4 h-4 text-red-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-400" />
              )}
              <p className="text-gray-400 text-xs">vs Last Month</p>
            </div>
            <p className={`text-xl font-bold ${
              costTrend.startsWith('+') ? 'text-red-400' : 'text-green-400'
            }`}>
              {costTrend}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <p className="text-gray-400 text-xs">Projected</p>
            </div>
            <p className="text-white text-xl font-bold">${projectedCost}</p>
          </div>
        </div>

        {/* Cost Breakdown by Model */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-sm">Cost Breakdown by Model</h4>
          {breakdown.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Badge variant="glass" className="text-xs">
                    {item.model}
                  </Badge>
                  <span className="text-gray-400 text-xs">
                    {item.requests.toLocaleString()} requests
                  </span>
                </div>
                <span className="text-white font-semibold">${item.cost.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={item.percentage} className="h-1.5 flex-1" />
                <span className="text-gray-400 text-xs w-12 text-right">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Cost Optimization Tips */}
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <h5 className="text-white font-semibold text-sm mb-2 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
            Cost Optimization Active
          </h5>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• 70% of requests routed to cost-efficient models</li>
            <li>• Response caching enabled (24h TTL)</li>
            <li>• Batch processing for non-urgent tasks</li>
            <li>• Estimated savings: $45/month</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button variant="secondary" className="flex-1" size="sm">
            View Detailed Report
          </Button>
          <Button variant="outline" className="flex-1" size="sm">
            Adjust Budget
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
