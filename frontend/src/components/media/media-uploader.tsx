import { useState, useCallback } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/lib/utils';

interface MediaUploaderProps {
  folder?: string | null;
  onUpload: (files: File[]) => void;
  onClose: () => void;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function MediaUploader({ folder, onUpload, onClose }: MediaUploaderProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  }, []);

  const addFiles = (newFiles: File[]) => {
    const filesWithProgress: FileWithProgress[] = newFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...filesWithProgress]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const filesToUpload = files.filter((f) => f.status === 'pending').map((f) => f.file);
    
    if (filesToUpload.length === 0) {
      onClose();
      return;
    }

    // Simulate upload progress
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'pending' ? { ...f, status: 'uploading' as const } : f
      )
    );

    // Simulate progress
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading' && f.progress < 90
            ? { ...f, progress: f.progress + 10 }
            : f
        )
      );
    }, 200);

    try {
      await onUpload(filesToUpload);
      
      clearInterval(interval);
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading'
            ? { ...f, status: 'success' as const, progress: 100 }
            : f
        )
      );

      // Close after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      clearInterval(interval);
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading'
            ? {
                ...f,
                status: 'error' as const,
                error: error.message || 'Upload failed',
              }
            : f
        )
      );
    }
  };

  const getStatusIcon = (status: FileWithProgress['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
  const canUpload = files.length > 0 && files.some((f) => f.status === 'pending');

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          {folder && (
            <p className="text-sm text-gray-400">Uploading to: {folder}</p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              Drag and drop files here
            </p>
            <p className="text-sm text-gray-400 mb-4">
              or click to browse
            </p>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button
                type="button"
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                Browse Files
              </Button>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((fileWithProgress, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                >
                  {getStatusIcon(fileWithProgress.status)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileWithProgress.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatBytes(fileWithProgress.file.size)}
                    </p>
                    
                    {fileWithProgress.status === 'uploading' && (
                      <Progress
                        value={fileWithProgress.progress}
                        className="mt-2 h-1"
                      />
                    )}
                    
                    {fileWithProgress.status === 'error' && (
                      <p className="text-xs text-red-400 mt-1">
                        {fileWithProgress.error}
                      </p>
                    )}
                  </div>

                  {fileWithProgress.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0 hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {files.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-400 pt-2 border-t border-gray-800">
              <span>
                {files.length} file{files.length !== 1 ? 's' : ''} ({formatBytes(totalSize)})
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!canUpload}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Upload {files.filter((f) => f.status === 'pending').length} File
            {files.filter((f) => f.status === 'pending').length !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
