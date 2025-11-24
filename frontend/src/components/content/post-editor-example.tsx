'use client';

/**
 * Example Usage of PostEditor Component
 * 
 * This file demonstrates how to use the PostEditor component
 * in different scenarios.
 */

import { useState } from 'react';
import { PostEditor } from './post-editor';
import { SocialPlatform } from '@/types';

// Example 1: Basic Usage
export function BasicPostEditorExample() {
  const [content, setContent] = useState('');
  const [selectedPlatforms] = useState<SocialPlatform[]>([
    SocialPlatform.TWITTER,
    SocialPlatform.INSTAGRAM,
  ]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">Basic Post Editor</h2>
      <PostEditor
        value={content}
        onChange={setContent}
        selectedPlatforms={selectedPlatforms}
      />
    </div>
  );
}

// Example 2: With AI Generation
export function AIEnabledPostEditorExample() {
  const [content, setContent] = useState('');
  const [selectedPlatforms] = useState<SocialPlatform[]>([
    SocialPlatform.LINKEDIN,
  ]);

  const handleAIGenerate = async () => {
    // Simulate AI generation
    const aiContent = `🚀 Exciting announcement! We're thrilled to share our latest innovation that will revolutionize the way you work. 

Our team has been working tirelessly to bring you cutting-edge features that combine AI-powered automation with intuitive design.

Stay tuned for the official launch! 🎉

#Innovation #Technology #AI #ProductLaunch`;
    
    setContent(aiContent);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">AI-Enabled Post Editor</h2>
      <PostEditor
        value={content}
        onChange={setContent}
        selectedPlatforms={selectedPlatforms}
        onAIGenerate={handleAIGenerate}
      />
    </div>
  );
}

// Example 3: Instagram with First Comment
export function InstagramPostEditorExample() {
  const [content, setContent] = useState('');
  const [firstComment, setFirstComment] = useState('');
  const [selectedPlatforms] = useState<SocialPlatform[]>([
    SocialPlatform.INSTAGRAM,
  ]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">Instagram Post Editor</h2>
      <PostEditor
        value={content}
        onChange={setContent}
        selectedPlatforms={selectedPlatforms}
        firstComment={firstComment}
        onFirstCommentChange={setFirstComment}
      />
      
      {/* Display the values */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <h3 className="text-sm font-medium text-white mb-2">Preview:</h3>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-gray-400">Caption:</span>
            <p className="text-sm text-white">{content || '(empty)'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">First Comment:</span>
            <p className="text-sm text-white">{firstComment || '(empty)'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Example 4: With Link Preview
export function LinkPreviewPostEditorExample() {
  const [content, setContent] = useState('');
  const [linkPreview, setLinkPreview] = useState<any>(null);
  const [selectedPlatforms] = useState<SocialPlatform[]>([
    SocialPlatform.FACEBOOK,
    SocialPlatform.LINKEDIN,
  ]);

  const handleLinkDetected = async (url: string) => {
    // Show loading state
    setLinkPreview({ url, loading: true });
    
    // Simulate API call to fetch link metadata
    setTimeout(() => {
      setLinkPreview({
        url,
        title: 'Amazing Article About Social Media Marketing',
        description: 'Learn the latest strategies and tactics to grow your social media presence and engage with your audience effectively.',
        image: 'https://via.placeholder.com/400x200',
        loading: false,
      });
    }, 1500);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">Post Editor with Link Preview</h2>
      <PostEditor
        value={content}
        onChange={setContent}
        selectedPlatforms={selectedPlatforms}
        linkPreview={linkPreview}
        onLinkDetected={handleLinkDetected}
      />
      
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400">
          💡 Tip: Paste a URL in the content to see the link preview feature in action!
        </p>
      </div>
    </div>
  );
}

// Example 5: With Media Attachments
export function MediaAttachmentPostEditorExample() {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [selectedPlatforms] = useState<SocialPlatform[]>([
    SocialPlatform.INSTAGRAM,
    SocialPlatform.FACEBOOK,
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">Post Editor with Media</h2>
      
      {/* File input for demo */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">
          Upload Media Files
        </label>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-purple-500 file:text-white
            hover:file:bg-purple-600
            cursor-pointer"
        />
      </div>
      
      <PostEditor
        value={content}
        onChange={setContent}
        selectedPlatforms={selectedPlatforms}
        mediaFiles={mediaFiles}
      />
    </div>
  );
}

// Example 6: Multi-Platform with All Features
export function CompletePostEditorExample() {
  const [content, setContent] = useState('');
  const [firstComment, setFirstComment] = useState('');
  const [linkPreview, setLinkPreview] = useState<any>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    SocialPlatform.INSTAGRAM,
    SocialPlatform.TWITTER,
    SocialPlatform.LINKEDIN,
  ]);

  const handleAIGenerate = async () => {
    const aiContent = `🎯 Exciting news for social media managers!

We've just launched our new AI-powered content creation tool that helps you:
✅ Generate engaging content in seconds
✅ Optimize for each platform automatically
✅ Schedule posts at the perfect time
✅ Track performance with advanced analytics

Ready to transform your social media strategy? Check it out: https://example.com/launch

#SocialMedia #AI #Marketing #ContentCreation`;
    
    setContent(aiContent);
  };

  const handleLinkDetected = async (url: string) => {
    setLinkPreview({ url, loading: true });
    
    setTimeout(() => {
      setLinkPreview({
        url,
        title: 'Revolutionary AI Social Media Tool',
        description: 'Transform your social media management with AI-powered automation and insights.',
        image: 'https://via.placeholder.com/400x200',
        loading: false,
      });
    }, 1000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Complete Post Editor Example</h2>
      
      {/* Platform Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-3">
          Select Platforms
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.values(SocialPlatform).map((platform) => (
            <button
              key={platform}
              onClick={() => {
                setSelectedPlatforms(prev =>
                  prev.includes(platform)
                    ? prev.filter(p => p !== platform)
                    : [...prev, platform]
                );
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPlatforms.includes(platform)
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          Upload Media (Optional)
        </label>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-purple-500 file:text-white
            hover:file:bg-purple-600
            cursor-pointer"
        />
      </div>
      
      {/* Post Editor */}
      <PostEditor
        value={content}
        onChange={setContent}
        selectedPlatforms={selectedPlatforms}
        onAIGenerate={handleAIGenerate}
        firstComment={firstComment}
        onFirstCommentChange={setFirstComment}
        linkPreview={linkPreview}
        onLinkDetected={handleLinkDetected}
        mediaFiles={mediaFiles}
      />
      
      {/* Summary */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <h3 className="text-sm font-medium text-white mb-3">Post Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Platforms:</span>
            <span className="text-white">{selectedPlatforms.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Content Length:</span>
            <span className="text-white">{content.length} characters</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Media Files:</span>
            <span className="text-white">{mediaFiles.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Has Link:</span>
            <span className="text-white">{linkPreview ? 'Yes' : 'No'}</span>
          </div>
          {selectedPlatforms.includes(SocialPlatform.INSTAGRAM) && (
            <div className="flex justify-between">
              <span className="text-gray-400">First Comment:</span>
              <span className="text-white">{firstComment ? 'Yes' : 'No'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export all examples
export const PostEditorExamples = {
  Basic: BasicPostEditorExample,
  AIEnabled: AIEnabledPostEditorExample,
  Instagram: InstagramPostEditorExample,
  LinkPreview: LinkPreviewPostEditorExample,
  MediaAttachment: MediaAttachmentPostEditorExample,
  Complete: CompletePostEditorExample,
};
