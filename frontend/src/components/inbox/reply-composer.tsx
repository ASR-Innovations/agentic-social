'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Send, Paperclip, Smile, Sparkles, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReplyComposerProps {
  onSend: (content: string, mediaFiles?: File[]) => Promise<void>;
  onAIAssist?: () => void;
  templates?: ReplyTemplate[];
  isLoading?: boolean;
}

interface ReplyTemplate {
  id: string;
  name: string;
  content: string;
}

export function ReplyComposer({
  onSend,
  onAIAssist,
  templates = [],
  isLoading = false,
}: ReplyComposerProps) {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsSending(true);
    try {
      await onSend(content, mediaFiles.length > 0 ? mediaFiles : undefined);
      setContent('');
      setMediaFiles([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles((prev) => [...prev, ...files]);
  };

  const handleTemplateSelect = (template: ReplyTemplate) => {
    setContent(template.content);
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-white/10 p-4 space-y-3">
      {/* Media Preview */}
      {mediaFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mediaFiles.map((file, index) => (
            <div
              key={index}
              className="relative group glass-card p-2 rounded-lg border border-white/10"
            >
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300 truncate max-w-[150px]">
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Text Input */}
      <div className="relative">
        <Textarea
          placeholder="Type your reply... (Cmd/Ctrl + Enter to send)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || isSending}
          className="glass-input min-h-[100px] pr-12 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Attach File */}
          <label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading || isSending}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              disabled={isLoading || isSending}
              asChild
            >
              <span>
                <Paperclip className="h-4 w-4" />
              </span>
            </Button>
          </label>

          {/* Templates */}
          {templates.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  disabled={isLoading || isSending}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="glass-card border-white/10 w-64">
                {templates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{template.name}</span>
                      <span className="text-xs text-gray-400 line-clamp-1">
                        {template.content}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* AI Assist */}
          {onAIAssist && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAIAssist}
              className="text-purple-400 hover:text-purple-300"
              disabled={isLoading || isSending}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Assist
            </Button>
          )}
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={(!content.trim() && mediaFiles.length === 0) || isLoading || isSending}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isSending ? (
            <>Sending...</>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send
            </>
          )}
        </Button>
      </div>

      {/* Helper Text */}
      <div className="text-xs text-gray-400">
        Press <kbd className="px-1 py-0.5 bg-white/10 rounded">Cmd/Ctrl + Enter</kbd> to send
      </div>
    </div>
  );
}
