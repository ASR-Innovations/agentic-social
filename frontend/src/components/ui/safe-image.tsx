'use client';

import React, { useState, ImgHTMLAttributes } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';

interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  showErrorIcon?: boolean;
}

/**
 * Safe image component that handles loading errors gracefully
 * and displays a fallback UI when images fail to load.
 */
export function SafeImage({
  src,
  alt,
  fallback,
  showErrorIcon = true,
  className = '',
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        role="img"
        aria-label={alt}
      >
        {showErrorIcon && (
          <div className="text-center p-4">
            <ImageOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Image unavailable</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div
          className={`bg-gray-200 rounded-lg animate-pulse ${className}`}
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onLoad={() => setLoading(false)}
        loading="lazy"
        className={`${className} ${loading ? 'hidden' : ''}`}
        {...props}
      />
    </>
  );
}

interface SafeNextImageProps extends Omit<ImageProps, 'onError'> {
  fallback?: React.ReactNode;
  showErrorIcon?: boolean;
}

/**
 * Safe Next.js Image component that handles loading errors gracefully
 */
export function SafeNextImage({
  src,
  alt,
  fallback,
  showErrorIcon = true,
  className = '',
  ...props
}: SafeNextImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        role="img"
        aria-label={alt}
        style={{
          width: props.width || '100%',
          height: props.height || 'auto',
        }}
      >
        {showErrorIcon && (
          <div className="text-center p-4">
            <ImageOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Image unavailable</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={className}
      {...props}
    />
  );
}

/**
 * Safe avatar component with fallback to initials
 */
export function SafeAvatar({
  src,
  alt,
  name,
  size = 'md',
  className = '',
}: {
  src?: string;
  alt: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!src || error) {
    return (
      <div
        className={`${sizeClasses[size]} ${getBackgroundColor(name)} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
        role="img"
        aria-label={alt}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      loading="lazy"
    />
  );
}
