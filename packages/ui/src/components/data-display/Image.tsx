import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import { Skeleton } from '../feedback/Skeleton';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  containerClassName?: string;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, containerClassName, alt, src, fallback, onLoad, onError, ...props }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isInstant, setIsInstant] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Synchronous check if image is already cached
    useEffect(() => {
      if (imgRef.current?.complete) {
        setIsLoading(false);
        setIsInstant(true);
      }
    }, [src]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoading(false);
      onLoad?.(e);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoading(false);
      setHasError(true);
      onError?.(e);
    };

    if (hasError && fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={cn("relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10", containerClassName)}>
        {isLoading && (
           <Skeleton className="absolute inset-0 h-full w-full" />
        )}
        <img
          ref={(node) => {
            // Support both forwardRef and internal ref
            (imgRef as any).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as any).current = node;
          }}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "h-full w-full object-cover",
            !isInstant && "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Image.displayName = "Image";
