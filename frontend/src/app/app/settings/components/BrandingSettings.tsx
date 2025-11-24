'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Upload, Palette, Type, Image } from 'lucide-react';

export default function BrandingSettings() {
  const [brandName, setBrandName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#8B5CF6');
  const [secondaryColor, setSecondaryColor] = useState('#EC4899');
  const [fontFamily, setFontFamily] = useState('Inter');

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Brand Identity</CardTitle>
          <CardDescription className="text-gray-400">
            Customize your brand appearance across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            label="Brand Name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Enter your brand name"
          />

          <div>
            <label className="text-sm font-medium text-white mb-3 block">Brand Logo</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center border-2 border-dashed border-white/20">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <Button variant="secondary" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-xs text-gray-500">PNG or SVG. Max 2MB. Recommended: 512x512px</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white mb-3 flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#8B5CF6"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-3 flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#EC4899"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-3 flex items-center">
              <Type className="w-4 h-4 mr-2" />
              Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Inter" className="bg-gray-900">Inter</option>
              <option value="Roboto" className="bg-gray-900">Roboto</option>
              <option value="Open Sans" className="bg-gray-900">Open Sans</option>
              <option value="Lato" className="bg-gray-900">Lato</option>
              <option value="Montserrat" className="bg-gray-900">Montserrat</option>
            </select>
          </div>

          <div className="flex justify-end">
            <Button className="gradient-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Branding
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* White Label Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">White Label Settings</CardTitle>
          <CardDescription className="text-gray-400">
            Available on Enterprise plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg glass border border-white/10">
            <p className="text-white font-medium mb-2">Custom Domain</p>
            <p className="text-gray-400 text-sm mb-3">Use your own domain for the platform</p>
            <Button variant="secondary" disabled>Upgrade to Enable</Button>
          </div>
          <div className="p-4 rounded-lg glass border border-white/10">
            <p className="text-white font-medium mb-2">Remove Branding</p>
            <p className="text-gray-400 text-sm mb-3">Hide all platform branding from reports and emails</p>
            <Button variant="secondary" disabled>Upgrade to Enable</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
