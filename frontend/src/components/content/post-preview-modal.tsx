'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { X, Edit, Copy, Trash2, Calendar, Clock, Image as ImageIcon, Video, FileText, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Post } from './calendar-grid';

interface PostPreviewModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (post: Post) => void;
  onDuplicate: (post: Post) => void;
  onDelete: (post: Post) => void;
}

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
};

const platformColors: Record<string, string> = {
  instagram: 'from-pink-500 to-purple-500',
  twitter: 'from-blue-400 to-blue-600',
  linkedin: 'from-blue-600 to-blue-800',
  facebook: 'from-blue-500 to-indigo-600',
};

export function PostPreviewModal({
  post,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}: PostPreviewModalProps) {
  if (!isOpen || !post) return null;

  const getMediaIcon = () => {
    switch (post.mediaType) {
      case 'image':
        return ImageIcon;
      case 'video':
        return Video;
      case 'carousel':
        return FileText;
      default:
        return FileText;
    }
  };

  const MediaIcon = getMediaIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white">Post Preview</h2>
            <Badge
              variant={
                post.status === 'published' ? 'success' :
                post.status === 'scheduled' ? 'warning' :
                post.status === 'failed' ? 'destructive' :
                'secondary'
              }
            >
              {post.status}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Platforms */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {post.platforms.map(platform => {
                const Icon = platformIcons[platform] || FileText;
                const colorClass = platformColors[platform] || 'from-gray-500 to-gray-700';
                
                return (
                  <div
                    key={platform}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg glass-button"
                  >
                    <div className={`w-5 h-5 rounded bg-gradient-to-r ${colorClass} flex items-center justify-center`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white capitalize">{platform}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                <Calendar className="w-4 h-4 inline mr-1" />
                Scheduled Date
              </label>
              <div className="text-white font-medium">
                {format(new Date(post.scheduledAt), 'MMMM d, yyyy')}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                <Clock className="w-4 h-4 inline mr-1" />
                Scheduled Time
              </label>
              <div className="text-white font-medium">
                {format(new Date(post.scheduledAt), 'h:mm a')}
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Content
            </label>
            <div className="glass-card p-4">
              <p className="text-white whitespace-pre-wrap">{post.content}</p>
            </div>
          </div>

          {/* Media Type */}
          {post.mediaType && (
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Media Type
              </label>
              <div className="flex items-center space-x-2">
                <MediaIcon className="w-5 h-5 text-gray-400" />
                <span className="text-white capitalize">{post.mediaType}</span>
              </div>
            </div>
          )}

          {/* AI Generated Badge */}
          {post.aiGenerated && (
            <div>
              <Badge variant="glass" className="text-sm">
                <span className="mr-1">✨</span>
                AI Generated Content
              </Badge>
            </div>
          )}

          {/* Platform Previews */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-3 block">
              Platform Previews
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {post.platforms.map(platform => {
                const Icon = platformIcons[platform] || FileText;
                const colorClass = platformColors[platform] || 'from-gray-500 to-gray-700';
                
                return (
                  <Card key={platform} className="glass-card p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`w-6 h-6 rounded bg-gradient-to-r ${colorClass} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-medium capitalize">{platform}</span>
                    </div>
                    <div className="text-sm text-gray-300 line-clamp-3">
                      {post.content}
                    </div>
                    {post.mediaType && (
                      <div className="mt-3 h-32 bg-white/5 rounded flex items-center justify-center">
                        <MediaIcon className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <Button
            variant="destructive"
            onClick={() => {
              onDelete(post);
              onClose();
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                onDuplicate(post);
                onClose();
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button
              className="gradient-primary"
              onClick={() => {
                onEdit(post);
                onClose();
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
