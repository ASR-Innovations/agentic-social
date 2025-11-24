'use client';

import { useState } from 'react';
import { X, Plus, Calendar, Clock, Image as ImageIcon, Video, Sparkles, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MediaUploader } from './media-uploader';
import { PlatformSelector } from './platform-selector';
import { SchedulePicker } from './schedule-picker';
import { PostEditor } from './post-editor';

interface PostCreationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: any) => void;
  editingPost?: any;
}

export function PostCreationSidebar({
  isOpen,
  onClose,
  onSave,
  editingPost,
}: PostCreationSidebarProps) {
  const [content, setContent] = useState(editingPost?.content || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(editingPost?.platforms || []);
  const [scheduledDate, setScheduledDate] = useState<Date>(editingPost?.scheduledAt ? new Date(editingPost.scheduledAt) : new Date());
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [firstComment, setFirstComment] = useState(editingPost?.firstComment || '');
  const [linkPreview, setLinkPreview] = useState<any>(null);

  const handleSave = () => {
    const post = {
      id: editingPost?.id || `post-${Date.now()}`,
      content,
      platforms: selectedPlatforms,
      scheduledAt: scheduledDate,
      status: 'scheduled' as const,
      mediaType: mediaFiles.length > 0 ? 'image' as const : undefined,
      aiGenerated: false,
    };

    onSave(post);
    handleClose();
  };

  const handleClose = () => {
    setContent('');
    setSelectedPlatforms([]);
    setScheduledDate(new Date());
    setMediaFiles([]);
    setShowSchedulePicker(false);
    setShowMediaUploader(false);
    setFirstComment('');
    setLinkPreview(null);
    onClose();
  };

  const handleAIGenerate = () => {
    // TODO: Integrate with AI generation API
    const aiContent = `🚀 Exciting news! We're launching something amazing that will transform the way you work. Stay tuned for more updates! #Innovation #Technology #Future`;
    setContent(aiContent);
  };

  const handleLinkDetected = async (url: string) => {
    // Mock link preview - in production, this would call an API
    setLinkPreview({ url, loading: true });
    
    // Simulate API call
    setTimeout(() => {
      setLinkPreview({
        url,
        title: 'Example Link Title',
        description: 'This is a preview of the linked content. In production, this would fetch real metadata.',
        image: 'https://via.placeholder.com/150',
        loading: false,
      });
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[500px] bg-[#0a0a0f] border-l border-white/10 shadow-2xl overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0a0a0f] z-10">
        <h2 className="text-2xl font-bold text-white">
          {editingPost ? 'Edit Post' : 'Create Post'}
        </h2>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Platform Selection */}
        <div>
          <label className="text-sm font-medium text-white mb-3 block">
            Select Platforms *
          </label>
          <PlatformSelector
            selectedPlatforms={selectedPlatforms}
            onChange={setSelectedPlatforms}
          />
        </div>

        {/* Post Editor */}
        <PostEditor
          value={content}
          onChange={setContent}
          selectedPlatforms={selectedPlatforms as any}
          onAIGenerate={handleAIGenerate}
          firstComment={firstComment}
          onFirstCommentChange={setFirstComment}
          linkPreview={linkPreview}
          onLinkDetected={handleLinkDetected}
          mediaFiles={mediaFiles}
        />

        {/* Media Upload */}
        <div>
          <label className="text-sm font-medium text-white mb-3 block">
            Media (Optional)
          </label>
          {!showMediaUploader ? (
            <button
              onClick={() => setShowMediaUploader(true)}
              className="w-full border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                Click to add images or videos
              </p>
            </button>
          ) : (
            <MediaUploader
              onFilesSelected={setMediaFiles}
              onClose={() => setShowMediaUploader(false)}
            />
          )}
          {mediaFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {mediaFiles.map((file, index) => (
                <Badge key={index} variant="glass">
                  {file.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Picker */}
        <div>
          <label className="text-sm font-medium text-white mb-3 block">
            Schedule *
          </label>
          {!showSchedulePicker ? (
            <button
              onClick={() => setShowSchedulePicker(true)}
              className="w-full glass-card p-4 text-left hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-white font-medium">
                      {scheduledDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-sm text-gray-400">
                      {scheduledDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ) : (
            <SchedulePicker
              selectedDate={scheduledDate}
              onChange={setScheduledDate}
              onClose={() => setShowSchedulePicker(false)}
            />
          )}
        </div>

        {/* AI Suggestions */}
        <Card className="glass-card p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">AI Suggestions</span>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors">
              • Best time to post: 2:00 PM (based on your audience)
            </button>
            <button className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors">
              • Add 3-5 relevant hashtags for better reach
            </button>
            <button className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors">
              • Consider adding a call-to-action
            </button>
          </div>
        </Card>


      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-[#0a0a0f] border-t border-white/10 p-6 space-y-3">
        <Button
          className="w-full gradient-primary"
          onClick={handleSave}
          disabled={!content || selectedPlatforms.length === 0}
        >
          <Calendar className="w-4 h-4 mr-2" />
          {editingPost ? 'Update Post' : 'Schedule Post'}
        </Button>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              // Save as draft
              const post = {
                id: editingPost?.id || `post-${Date.now()}`,
                content,
                platforms: selectedPlatforms,
                scheduledAt: scheduledDate,
                status: 'draft' as const,
                mediaType: mediaFiles.length > 0 ? 'image' as const : undefined,
                aiGenerated: false,
              };
              onSave(post);
              handleClose();
            }}
          >
            Save Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
