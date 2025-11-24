import { toast as hotToast } from 'react-hot-toast';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = ({ title, description, variant }: ToastOptions) => {
    const message = description ? `${title}\n${description}` : title;
    
    if (variant === 'destructive') {
      hotToast.error(message);
    } else {
      hotToast.success(message);
    }
  };

  return { toast };
}
