'use client';

import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { Sparkles, Hash, AtSign, Link as LinkIcon, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SocialPlatform } from '@/types';

interface PostEditorProps {
  value: string;
  onChange: (value: string) => void;
  selectedPlatforms: SocialPlatform[];
  onAIGenerate?: () => void;
  firstComment?: string;
  onFirstCommentChange?: (value: string) => void;
  linkPreview?: LinkPreviewData;
  onLinkDetected?: (url: string) => void;
  mediaFiles?: File[];
  className?: string;
}

interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  loading?: boolean;
}

interface CharacterLimit {
  platform: SocialPlatform;
  limit: number;
  name: string;
}

interface ValidationError {
  type: 'character_limit' | 'required_field' | 'invalid_format';
  message: string;
  platform?: SocialPlatform;
}

const PLATFORM_LIMITS: CharacterLimit[] = [
  { platform: SocialPlatform.TWITTER, limit: 280, name: 'Twitter/X' },
  { platform: SocialPlatform.INSTAGRAM, limit: 2200, name: 'Instagram' },
  { platform: SocialPlatform.FACEBOOK, limit: 63206, name: 'Facebook' },
  { platform: SocialPlatform.LINKEDIN, limit: 3000, name: 'LinkedIn' },
  { platform: SocialPlatform.TIKTOK, limit: 2200, name: 'TikTok' },
  { platform: SocialPlatform.THREADS, limit: 500, name: 'Threads' },
  { platform: SocialPlatform.PINTEREST, limit: 500, name: 'Pinterest' },
];

// Common hashtags for autocomplete
const POPULAR_HASHTAGS = [
  'marketing', 'socialmedia', 'business', 'entrepreneur', 'startup',
  'technology', 'innovation', 'digital', 'branding', 'contentmarketing',
  'smallbusiness', 'success', 'motivation', 'inspiration', 'growth',
  'leadership', 'strategy', 'tips', 'trending', 'viral'
];

export function PostEditor({
  value,
  onChange,
  selectedPlatforms,
  onAIGenerate,
  firstComment = '',
  onFirstCommentChange,
  linkPreview,
  onLinkDetected,
  mediaFiles = [],
  className = '',
}: PostEditorProps) {
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const firstCommentRef = useRef<HTMLTextAreaElement>(null);

  // Calculate character counts for each platform
  const characterCounts = selectedPlatforms.map(platform => {
    const limit = PLATFORM_LIMITS.find(l => l.platform === platform);
    return {
      platform,
      count: value.length,
      limit: limit?.limit || 280,
      name: limit?.name || platform,
      exceeded: limit ? value.length > limit.limit : false,
    };
  });

  // Get the most restrictive limit
  const mostRestrictiveLimit = characterCounts.reduce((min, curr) => 
    curr.limit < min.limit ? curr : min,
    characterCounts[0] || { limit: 280, count: 0, platform: SocialPlatform.TWITTER, name: 'Twitter/X', exceeded: false }
  );

  // Detect URLs in content
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = value.match(urlRegex);
    if (urls && urls.length > 0 && onLinkDetected) {
      onLinkDetected(urls[0]);
    }
  }, [value, onLinkDetected]);

  // Validate content
  useEffect(() => {
    const errors: ValidationError[] = [];

    // Check character limits
    characterCounts.forEach(({ platform, count, limit, name, exceeded }) => {
      if (exceeded) {
        errors.push({
          type: 'character_limit',
          message: `Content exceeds ${name} character limit (${count}/${limit})`,
          platform,
        });
      }
    });

    // Check required fields
    if (!value.trim()) {
      errors.push({
        type: 'required_field',
        message: 'Content is required',
      });
    }

    setValidationErrors(errors);
  }, [value, characterCounts]);

  // Handle text change
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(cursorPos);

    // Check for hashtag trigger
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
    
    if (hashtagMatch) {
      setHashtagQuery(hashtagMatch[1]);
      setShowHashtagSuggestions(true);
      setShowMentionSuggestions(false);
    } else {
      setShowHashtagSuggestions(false);
    }

    // Check for mention trigger
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentionSuggestions(true);
      setShowHashtagSuggestions(false);
    } else {
      setShowMentionSuggestions(false);
    }
  };

  // Handle hashtag selection
  const handleHashtagSelect = (hashtag: string) => {
    if (!textareaRef.current) return;

    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const hashtagStart = textBeforeCursor.lastIndexOf('#');
    
    const newValue = 
      textBeforeCursor.substring(0, hashtagStart) + 
      `#${hashtag} ` + 
      textAfterCursor;
    
    onChange(newValue);
    setShowHashtagSuggestions(false);
    
    // Set cursor position after the inserted hashtag
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = hashtagStart + hashtag.length + 2;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Handle mention selection (mock data for now)
  const handleMentionSelect = (mention: string) => {
    if (!textareaRef.current) return;

    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    
    const newValue = 
      textBeforeCursor.substring(0, mentionStart) + 
      `@${mention} ` + 
      textAfterCursor;
    
    onChange(newValue);
    setShowMentionSuggestions(false);
    
    // Set cursor position after the inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStart + mention.length + 2;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setShowHashtagSuggestions(false);
      setShowMentionSuggestions(false);
    }
  };

  // Filter hashtag suggestions
  const filteredHashtags = POPULAR_HASHTAGS.filter(tag =>
    tag.toLowerCase().includes(hashtagQuery.toLowerCase())
  ).slice(0, 5);

  // Mock mention suggestions
  const mockMentions = ['johndoe', 'janedoe', 'company', 'brand', 'influencer'];
  const filteredMentions = mockMentions.filter(mention =>
    mention.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5);

  // Extract hashtags from content
  const extractedHashtags = value.match(/#\w+/g) || [];
  const uniqueHashtags = Array.from(new Set(extractedHashtags));

  // Extract mentions from content
  const extractedMentions = value.match(/@\w+/g) || [];
  const uniqueMentions = Array.from(new Set(extractedMentions));

  // Check if Instagram is selected for first comment
  const showFirstComment = selectedPlatforms.includes(SocialPlatform.INSTAGRAM);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Content Editor */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-white">
            Content *
          </label>
          <div className="flex items-center space-x-3">
            {/* Character Counter */}
            <div className="flex items-center space-x-2">
              {characterCounts.length > 1 ? (
                <div className="text-xs text-gray-400">
                  {characterCounts.map(({ platform, count, limit, exceeded }) => (
                    <span
                      key={platform}
                      className={`inline-block mr-2 ${exceeded ? 'text-red-400 font-semibold' : ''}`}
                    >
                      {platform.charAt(0).toUpperCase()}: {count}/{limit}
                    </span>
                  ))}
                </div>
              ) : (
                <span
                  className={`text-xs ${
                    mostRestrictiveLimit.exceeded ? 'text-red-400 font-semibold' : 'text-gray-400'
                  }`}
                >
                  {mostRestrictiveLimit.count} / {mostRestrictiveLimit.limit}
                </span>
              )}
            </div>

            {/* AI Generate Button */}
            {onAIGenerate && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onAIGenerate}
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI Generate
              </Button>
            )}
          </div>
        </div>

        {/* Text Editor */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind? Share your thoughts with your audience... Use # for hashtags and @ for mentions"
            className="w-full h-40 glass-input resize-none font-normal"
            style={{ lineHeight: '1.5' }}
          />

          {/* Hashtag Autocomplete */}
          {showHashtagSuggestions && filteredHashtags.length > 0 && (
            <Card className="absolute z-10 mt-1 w-64 glass-card p-2 shadow-lg">
              <div className="text-xs text-gray-400 mb-2 px-2">Suggested Hashtags</div>
              {filteredHashtags.map((hashtag) => (
                <button
                  key={hashtag}
                  onClick={() => handleHashtagSelect(hashtag)}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors flex items-center space-x-2"
                >
                  <Hash className="w-3 h-3 text-gray-400" />
                  <span>{hashtag}</span>
                </button>
              ))}
            </Card>
          )}

          {/* Mention Autocomplete */}
          {showMentionSuggestions && filteredMentions.length > 0 && (
            <Card className="absolute z-10 mt-1 w-64 glass-card p-2 shadow-lg">
              <div className="text-xs text-gray-400 mb-2 px-2">Suggested Mentions</div>
              {filteredMentions.map((mention) => (
                <button
                  key={mention}
                  onClick={() => handleMentionSelect(mention)}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors flex items-center space-x-2"
                >
                  <AtSign className="w-3 h-3 text-gray-400" />
                  <span>{mention}</span>
                </button>
              ))}
            </Card>
          )}
        </div>

        {/* Editor Tips */}
        <div className="flex items-start space-x-2 mt-2">
          <div className="flex-1">
            <p className="text-xs text-gray-400">
              <span className="font-medium">Tips:</span> Use emojis 😊, hashtags #trending, and mentions @username to increase engagement
            </p>
          </div>
        </div>

        {/* Extracted Hashtags and Mentions */}
        {(uniqueHashtags.length > 0 || uniqueMentions.length > 0) && (
          <div className="mt-3 space-y-2">
            {uniqueHashtags.length > 0 && (
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs text-gray-400">Hashtags:</span>
                {uniqueHashtags.map((tag, index) => (
                  <Badge key={index} variant="glass" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {uniqueMentions.length > 0 && (
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs text-gray-400">Mentions:</span>
                {uniqueMentions.map((mention, index) => (
                  <Badge key={index} variant="glass" className="text-xs">
                    {mention}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="glass-card p-3 border-red-500/20">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              {validationErrors.map((error, index) => (
                <p key={index} className="text-xs text-red-400">
                  {error.message}
                </p>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Link Preview */}
      {linkPreview && !linkPreview.loading && (
        <Card className="glass-card p-4">
          <div className="flex items-start space-x-3">
            {linkPreview.image && (
              <img
                src={linkPreview.image}
                alt={linkPreview.title || 'Link preview'}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {linkPreview.title && (
                    <h4 className="text-sm font-medium text-white truncate">
                      {linkPreview.title}
                    </h4>
                  )}
                  {linkPreview.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {linkPreview.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-1 mt-2">
                    <LinkIcon className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500 truncate">
                      {linkPreview.url}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {linkPreview?.loading && (
        <Card className="glass-card p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm text-gray-400">Loading link preview...</span>
          </div>
        </Card>
      )}

      {/* Media Attachment Preview */}
      {mediaFiles.length > 0 && (
        <Card className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white">
                Media Attachments ({mediaFiles.length})
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {mediaFiles.slice(0, 4).map((file, index) => (
              <div key={index} className="relative aspect-square rounded overflow-hidden bg-white/5">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                {index === 3 && mediaFiles.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      +{mediaFiles.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Instagram First Comment */}
      {showFirstComment && onFirstCommentChange && (
        <div>
          <label className="text-sm font-medium text-white mb-3 block">
            Instagram First Comment (Optional)
          </label>
          <textarea
            ref={firstCommentRef}
            value={firstComment}
            onChange={(e) => onFirstCommentChange(e.target.value)}
            placeholder="Add hashtags or additional context for Instagram... This will be posted as the first comment"
            className="w-full h-24 glass-input resize-none text-sm"
          />
          <p className="text-xs text-gray-400 mt-2">
            Pro tip: Use first comment for hashtags to keep your caption clean
          </p>
        </div>
      )}

      {/* Platform-Specific Customization Info */}
      {selectedPlatforms.length > 1 && (
        <Card className="glass-card p-3">
          <div className="text-xs text-gray-400">
            <span className="font-medium text-white">Platform Customization:</span> Content will be automatically adapted for each platform's requirements (character limits, hashtag placement, etc.)
          </div>
        </Card>
      )}
    </div>
  );
}
