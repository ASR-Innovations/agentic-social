'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Video, File, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MediaUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onClose: () => void;
  maxFiles?: number;
  acceptedFileTypes?: string[];
}

export function MediaUploader({
  onFilesSelected,
  onClose,
  maxFiles = 10,
  acceptedFileTypes = ['image/*', 'video/*'],
}: MediaUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setUploading(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    onFilesSelected(files);
    setUploading(false);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type.startsWith('video/')) return Video;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="glass-card p-6 space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-white/20 hover:border-white/40'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-white font-medium">Drop the files here...</p>
        ) : (
          <>
            <p className="text-white font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-400">
              Supports images and videos (max {maxFiles} files)
            </p>
          </>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">
              Selected Files ({files.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiles([])}
            >
              Clear All
            </Button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 glass-card rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* File Type Info */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="glass" className="text-xs">
          <ImageIcon className="w-3 h-3 mr-1" />
          Images: JPG, PNG, GIF
        </Badge>
        <Badge variant="glass" className="text-xs">
          <Video className="w-3 h-3 mr-1" />
          Videos: MP4, MOV, AVI
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3 pt-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 gradient-primary"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Add Files
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
