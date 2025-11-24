'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert } from '@/types';
import { Bell, Plus, AlertTriangle, TrendingUp, MessageCircle, Users } from 'lucide-react';
import { format } from 'date-fns';

interface AlertsPanelProps {
  alerts: Alert[];
  loading?: boolean;
  onCreateAlert?: () => void;
  onToggleAlert?: (alertId: string, isActive: boolean) => void;
  onEditAlert?: (alertId: string) => void;
}

export function AlertsPanel({
  alerts,
  loading,
  onCreateAlert,
  onToggleAlert,
  onEditAlert,
}: AlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'volume_spike':
        return <TrendingUp className="h-4 w-4" />;
      case 'sentiment_drop':
        return <AlertTriangle className="h-4 w-4" />;
      case 'keyword_match':
        return <MessageCircle className="h-4 w-4" />;
      case 'influencer_mention':
        return <Users className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'volume_spike':
        return 'Volume Spike';
      case 'sentiment_drop':
        return 'Sentiment Drop';
      case 'keyword_match':
        return 'Keyword Match';
      case 'influencer_mention':
        return 'Influencer Mention';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-400">Loading alerts...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Alert Configuration</span>
          </CardTitle>
          <Button
            onClick={onCreateAlert}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 glass-card rounded-lg hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-white font-semibold">{alert.name}</span>
                    {!alert.isActive && (
                      <Badge variant="secondary" className="text-xs bg-gray-500/20 text-gray-400">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {alert.conditions.map((condition, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-white/10 text-gray-400"
                      >
                        <span className="mr-1">{getAlertIcon(condition.type)}</span>
                        {getAlertTypeLabel(condition.type)}
                        {condition.threshold && ` (${condition.threshold})`}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Switch
                  checked={alert.isActive}
                  onCheckedChange={(checked) => onToggleAlert?.(alert.id, checked)}
                />
              </div>

              {/* Notification Channels */}
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-2">Notification Channels:</div>
                <div className="flex flex-wrap gap-2">
                  {alert.notifications.email && alert.notifications.email.length > 0 && (
                    <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">
                      Email ({alert.notifications.email.length})
                    </Badge>
                  )}
                  {alert.notifications.sms && alert.notifications.sms.length > 0 && (
                    <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                      SMS ({alert.notifications.sms.length})
                    </Badge>
                  )}
                  {alert.notifications.slack && (
                    <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400">
                      Slack
                    </Badge>
                  )}
                  {alert.notifications.webhook && (
                    <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-400">
                      Webhook
                    </Badge>
                  )}
                </div>
              </div>

              {/* Last Triggered */}
              {alert.lastTriggered && (
                <div className="text-xs text-gray-400 mb-3">
                  Last triggered: {format(new Date(alert.lastTriggered), 'MMM dd, yyyy HH:mm')}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditAlert?.(alert.id)}
                  className="text-gray-400 hover:text-white"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  View History
                </Button>
              </div>
            </div>
          ))}
        </div>

        {alerts.length === 0 && !loading && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No alerts configured</p>
            <Button
              onClick={onCreateAlert}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Alert
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
