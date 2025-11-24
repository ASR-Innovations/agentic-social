'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Globe, Clock, Languages } from 'lucide-react';
import { useUIStore } from '@/store/ui';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
];

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export default function GeneralSettings() {
  const { theme, setTheme } = useUIStore();
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/New_York');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  const handleSave = () => {
    // Save general settings
    console.log('Saving general settings...');
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">General Settings</CardTitle>
          <CardDescription className="text-gray-400">
            Configure your basic preferences and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language */}
          <div>
            <label className="text-sm font-medium text-white mb-3 flex items-center">
              <Languages className="w-4 h-4 mr-2" />
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-gray-900">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="text-sm font-medium text-white mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz} className="bg-gray-900">
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label className="text-sm font-medium text-white mb-3 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="MM/DD/YYYY" className="bg-gray-900">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY" className="bg-gray-900">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD" className="bg-gray-900">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="gradient-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
