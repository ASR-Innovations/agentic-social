'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell, Mail, Smartphone, MessageSquare, TrendingUp, 
  AlertCircle, CheckCircle, Users, Calendar, Save
} from 'lucide-react';

const notificationCategories = [
  {
    id: 'posts',
    name: 'Posts & Publishing',
    icon: Calendar,
    notifications: [
      { id: 'post_published', label: 'Post published successfully', email: true, push: true, inApp: true },
      { id: 'post_failed', label: 'Post failed to publish', email: true, push: true, inApp: true },
      { id: 'post_scheduled', label: 'Post scheduled', email: false, push: false, inApp: true },
    ]
  },
  {
    id: 'engagement',
    name: 'Engagement & Analytics',
    icon: TrendingUp,
    notifications: [
      { id: 'engagement_spike', label: 'Engagement spike detected', email: true, push: true, inApp: true },
      { id: 'milestone_reached', label: 'Follower milestone reached', email: true, push: true, inApp: true },
      { id: 'daily_summary', label: 'Daily performance summary', email: true, push: false, inApp: false },
    ]
  },
  {
    id: 'inbox',
    name: 'Inbox & Messages',
    icon: MessageSquare,
    notifications: [
      { id: 'new_message', label: 'New message received', email: true, push: true, inApp: true },
      { id: 'message_assigned', label: 'Message assigned to you', email: true, push: true, inApp: true },
      { id: 'sla_warning', label: 'SLA deadline approaching', email: true, push: true, inApp: true },
    ]
  },
  {
    id: 'team',
    name: 'Team & Collaboration',
    icon: Users,
    notifications: [
      { id: 'team_invite', label: 'New team member invited', email: true, push: false, inApp: true },
      { id: 'approval_request', label: 'Approval request received', email: true, push: true, inApp: true },
      { id: 'mention', label: 'You were mentioned', email: true, push: true, inApp: true },
    ]
  },
  {
    id: 'alerts',
    name: 'Alerts & Monitoring',
    icon: AlertCircle,
    notifications: [
      { id: 'crisis_detected', label: 'Crisis detected', email: true, push: true, inApp: true },
      { id: 'budget_alert', label: 'Budget threshold reached', email: true, push: true, inApp: true },
      { id: 'account_issue', label: 'Social account connection issue', email: true, push: true, inApp: true },
    ]
  },
];

export default function NotificationsSettings() {
  const [notifications, setNotifications] = useState(notificationCategories);
  const [emailDigest, setEmailDigest] = useState('daily');
  const [quietHours, setQuietHours] = useState({ enabled: false, start: '22:00', end: '08:00' });

  const toggleNotification = (categoryId: string, notificationId: string, channel: 'email' | 'push' | 'inApp') => {
    setNotifications(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          notifications: category.notifications.map(notif => {
            if (notif.id === notificationId) {
              return { ...notif, [channel]: !notif[channel] };
            }
            return notif;
          })
        };
      }
      return category;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Notification Channels</CardTitle>
          <CardDescription className="text-gray-400">
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg glass border border-white/10">
              <div className="flex items-center space-x-3 mb-2">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="text-white font-medium">Email</h3>
              </div>
              <p className="text-gray-400 text-sm mb-3">Receive notifications via email</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="p-4 rounded-lg glass border border-white/10">
              <div className="flex items-center space-x-3 mb-2">
                <Smartphone className="w-5 h-5 text-primary" />
                <h3 className="text-white font-medium">Push</h3>
              </div>
              <p className="text-gray-400 text-sm mb-3">Browser and mobile push notifications</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="p-4 rounded-lg glass border border-white/10">
              <div className="flex items-center space-x-3 mb-2">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="text-white font-medium">In-App</h3>
              </div>
              <p className="text-gray-400 text-sm mb-3">Notifications within the app</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      {notifications.map((category) => (
        <Card key={category.id} className="glass-card">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <category.icon className="w-5 h-5 text-primary" />
              <CardTitle className="text-white">{category.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {category.notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 rounded-lg glass border border-white/10">
                  <p className="text-white text-sm">{notification.label}</p>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notification.email}
                        onChange={() => toggleNotification(category.id, notification.id, 'email')}
                        className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary"
                      />
                      <span className="text-gray-400 text-xs">Email</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notification.push}
                        onChange={() => toggleNotification(category.id, notification.id, 'push')}
                        className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary"
                      />
                      <span className="text-gray-400 text-xs">Push</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notification.inApp}
                        onChange={() => toggleNotification(category.id, notification.id, 'inApp')}
                        className="w-4 h-4 text-primary bg-white/10 border-white/20 rounded focus:ring-primary"
                      />
                      <span className="text-gray-400 text-xs">In-App</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Email Digest */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Email Digest</CardTitle>
          <CardDescription className="text-gray-400">
            Receive a summary of your activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 'realtime', label: 'Real-time', desc: 'Receive emails immediately' },
              { id: 'daily', label: 'Daily Digest', desc: 'Once per day summary' },
              { id: 'weekly', label: 'Weekly Digest', desc: 'Once per week summary' },
              { id: 'never', label: 'Never', desc: 'No email digests' },
            ].map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg glass border border-white/10 hover:border-white/20 transition-colors">
                <input
                  type="radio"
                  name="digest"
                  value={option.id}
                  checked={emailDigest === option.id}
                  onChange={(e) => setEmailDigest(e.target.value)}
                  className="w-4 h-4 text-primary bg-white/10 border-white/20 focus:ring-primary"
                />
                <div>
                  <p className="text-white font-medium">{option.label}</p>
                  <p className="text-gray-400 text-sm">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Quiet Hours</CardTitle>
          <CardDescription className="text-gray-400">
            Pause notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Enable Quiet Hours</p>
              <p className="text-gray-400 text-sm">No push notifications during this time</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={quietHours.enabled}
                onChange={(e) => setQuietHours({ ...quietHours, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="time"
                value={quietHours.start}
                onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })}
              />
              <Input
                label="End Time"
                type="time"
                value={quietHours.end}
                onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gradient-primary">
          <Save className="w-4 h-4 mr-2" />
          Save Notification Preferences
        </Button>
      </div>
    </div>
  );
}
