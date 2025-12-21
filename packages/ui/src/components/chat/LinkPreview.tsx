import React from 'react';
import { cn } from '../../utils/cn';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps extends React.HTMLAttributes<HTMLAnchorElement> {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export function LinkPreview({ url, title, description, image, siteName, className, ...props }: LinkPreviewProps) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={cn(
        "block overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all group",
        className
      )} 
      {...props}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden border-b border-gray-200 dark:border-white/10">
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-3 space-y-1">
        {siteName && <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">{siteName}</p>}
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{title || url}</h4>
        {description && <p className="text-xs text-gray-500 dark:text-white/50 line-clamp-2">{description}</p>}
        <div className="flex items-center gap-1 text-[10px] text-gray-400 pt-1">
          <ExternalLink className="h-3 w-3" />
          <span className="truncate">{new URL(url).hostname}</span>
        </div>
      </div>
    </a>
  );
}
