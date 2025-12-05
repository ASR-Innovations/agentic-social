import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  TrendingUp,
  Users,
  Globe,
  PenTool,
  Target,
  MessageSquare,
  BarChart3,
  Eye,
  Type,
  FileText,
  Image,
  Hash,
  Calendar,
  Send,
  Shield,
  UserCheck,
  Edit3,
  Zap,
  MousePointer,
  Share2,
  Heart,
  type LucideIcon,
} from 'lucide-react';

// Map of icon names to Lucide components
export const iconMap: Record<string, LucideIcon> = {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  TrendingUp,
  Users,
  Globe,
  PenTool,
  Target,
  MessageSquare,
  BarChart3,
  Eye,
  Type,
  FileText,
  Image,
  Hash,
  Calendar,
  Send,
  Shield,
  UserCheck,
  Edit3,
  Zap,
  MousePointer,
  Share2,
  Heart,
};

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Dynamic icon component that renders Lucide icons by name
 * This avoids storing JSX in data objects which causes webpack issues with dynamic imports
 */
export function Icon({ name, className = 'w-6 h-6', size }: IconProps) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon map`);
    return null;
  }
  
  return <IconComponent className={className} size={size} />;
}

/**
 * Get the icon component by name (for cases where you need the component itself)
 */
export function getIconComponent(name: string): LucideIcon | null {
  return iconMap[name] || null;
}
