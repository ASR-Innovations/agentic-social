/**
 * Dashboard Formatting Utilities
 * 
 * Pure functions for formatting values for display.
 * These functions are designed to be easily testable with property-based tests.
 */

/**
 * Format a number with abbreviations (K, M, B)
 * 
 * @param value - Number to format
 * @param decimals - Number of decimal places (default 1)
 * @returns Formatted string with abbreviation
 * 
 * @example
 * formatNumber(1234) // returns "1.2K"
 * formatNumber(1234567) // returns "1.2M"
 * formatNumber(1234567890) // returns "1.2B"
 */
export function formatNumber(value: number, decimals: number = 1): string {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(decimals).replace(/\.0+$/, '') + 'B';
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(decimals).replace(/\.0+$/, '') + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(decimals).replace(/\.0+$/, '') + 'K';
  }
  return String(Math.round(value));
}

/**
 * Format a number with thousand separators
 * 
 * @param value - Number to format
 * @returns Formatted string with commas
 * 
 * @example
 * formatNumberWithCommas(1234567) // returns "1,234,567"
 */
export function formatNumberWithCommas(value: number): string {
  return value.toLocaleString('en-US');
}

/**
 * Format a date in human-readable format
 * 
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 * 
 * @example
 * formatDate(new Date()) // returns "Friday, December 5"
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * 
 * @param date - Date to format
 * @returns Relative time string
 * 
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // returns "1 hour ago"
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  }
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  
  return formatDate(dateObj, { month: 'short', day: 'numeric' });
}

/**
 * Get time-based greeting
 * 
 * @param hour - Hour of the day (0-23), defaults to current hour
 * @returns Appropriate greeting string
 * 
 * @example
 * getTimeBasedGreeting(9)  // returns "Good morning"
 * getTimeBasedGreeting(14) // returns "Good afternoon"
 * getTimeBasedGreeting(20) // returns "Good evening"
 */
export function getTimeBasedGreeting(hour?: number): string {
  const currentHour = hour ?? new Date().getHours();
  
  if (currentHour >= 0 && currentHour < 12) {
    return 'Good morning';
  }
  if (currentHour >= 12 && currentHour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

/**
 * Format percentage with sign
 * 
 * @param value - Percentage value
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string with + or - sign
 * 
 * @example
 * formatPercentageChange(12.5) // returns "+12.5%"
 * formatPercentageChange(-5.2) // returns "-5.2%"
 */
export function formatPercentageChange(
  value: number,
  decimals: number = 1
): string {
  const formatted = Math.abs(value).toFixed(decimals);
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${formatted}%`;
}

/**
 * Format percentage without sign
 * 
 * @param value - Percentage value
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 * 
 * @example
 * formatPercentage(12.5) // returns "12.5%"
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format currency
 * 
 * @param value - Currency value
 * @param currency - Currency code (default USD)
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(1234.56) // returns "$1,234.56"
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format time for display (HH:MM AM/PM)
 * 
 * @param date - Date to format
 * @returns Formatted time string
 * 
 * @example
 * formatTime(new Date('2024-01-01T14:30:00')) // returns "2:30 PM"
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date and time together
 * 
 * @param date - Date to format
 * @returns Formatted date and time string
 * 
 * @example
 * formatDateTime(new Date()) // returns "Dec 5, 2024 at 2:30 PM"
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dateStr = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = formatTime(dateObj);
  return `${dateStr} at ${timeStr}`;
}

/**
 * Truncate text with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 * 
 * @example
 * truncateText("Hello World", 5) // returns "Hello..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Format platform name for display
 * 
 * @param platform - Platform identifier
 * @returns Formatted platform name
 * 
 * @example
 * formatPlatformName('twitter') // returns "Twitter"
 * formatPlatformName('linkedin') // returns "LinkedIn"
 */
export function formatPlatformName(platform: string): string {
  const platformNames: Record<string, string> = {
    twitter: 'Twitter',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    pinterest: 'Pinterest',
    threads: 'Threads',
    reddit: 'Reddit',
  };
  
  return platformNames[platform.toLowerCase()] || 
    platform.charAt(0).toUpperCase() + platform.slice(1);
}

/**
 * Format agent type for display
 * 
 * @param type - Agent type identifier
 * @returns Formatted agent type name
 * 
 * @example
 * formatAgentType('content_creator') // returns "Content Creator"
 */
export function formatAgentType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format file size
 * 
 * @param bytes - Size in bytes
 * @returns Formatted size string
 * 
 * @example
 * formatFileSize(1024) // returns "1 KB"
 * formatFileSize(1048576) // returns "1 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human readable
 * 
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 * 
 * @example
 * formatDuration(3661000) // returns "1h 1m"
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}
