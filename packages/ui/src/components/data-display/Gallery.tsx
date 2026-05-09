import React, { useState, useCallback, useRef } from 'react';
import { cn } from '../../utils/cn';
import { Upload, X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

export interface GalleryImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface GalleryProps extends React.HTMLAttributes<HTMLDivElement> {
  images: GalleryImage[];
  /** Number of columns @default 3 */
  columns?: 2 | 3 | 4 | 5;
  /** Gap between images in pixels @default 8 */
  gap?: number;
  /** Image aspect ratio */
  aspect?: 'square' | 'video' | 'auto';
  /** Enable lightbox on click @default true */
  lightbox?: boolean;
  /** Image border radius */
  rounded?: 'none' | 'md' | 'lg' | 'xl' | '2xl';
}

const colClasses: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
};

const aspectClasses: Record<string, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  auto: '',
};

const roundedClasses: Record<string, string> = {
  none: 'rounded-none',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

/**
 * Image gallery grid with built-in lightbox viewer.
 * Supports keyboard navigation, captions, and responsive columns.
 *
 * @example
 * ```tsx
 * <Gallery
 *   images={[
 *     { src: '/photo1.jpg', alt: 'Beach', caption: 'Sunset at the beach' },
 *     { src: '/photo2.jpg', alt: 'Mountain' },
 *   ]}
 *   columns={3}
 *   aspect="square"
 * />
 * ```
 */
export function Gallery({
  images,
  columns = 3,
  gap = 8,
  aspect = 'square',
  lightbox = true,
  rounded = '2xl',
  className,
  ...props
}: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => {
    if (!lightbox) return;
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  }, [lightbox]);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    document.body.style.overflow = '';
  }, []);

  const navigate = useCallback((dir: 1 | -1) => {
    setSelectedIndex(prev => {
      if (prev === null) return null;
      const next = prev + dir;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  }, [images.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  }, [closeLightbox, navigate]);

  return (
    <>
      {/* Grid */}
      <div
        className={cn('grid', colClasses[columns], className)}
        style={{ gap: `${gap}px` }}
        {...props}
      >
        {images.map((image, i) => (
          <button
            key={i}
            type="button"
            onClick={() => openLightbox(i)}
            className={cn(
              'group relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 transition-all duration-300',
              lightbox && 'cursor-zoom-in hover:shadow-xl hover:scale-[1.02]',
              aspectClasses[aspect],
              roundedClasses[rounded],
            )}
          >
            <img
              src={image.src}
              alt={image.alt || ''}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />

            {/* Hover overlay */}
            {lightbox && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
              </div>
            )}

            {/* Caption overlay */}
            {image.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs text-white font-medium truncate">{image.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (() => {
        const currentImage = images[selectedIndex]!;
        return (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Nav: Previous */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Image */}
          <img
            src={currentImage.src}
            alt={currentImage.alt || ''}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Nav: Next */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(1); }}
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Caption + Counter */}
          <div className="absolute bottom-6 inset-x-0 text-center">
            {currentImage.caption && (
              <p className="text-white text-sm mb-2">{currentImage.caption}</p>
            )}
            <p className="text-white/50 text-xs tabular-nums">{selectedIndex + 1} / {images.length}</p>
          </div>
        </div>
        );
      })()}
    </>
  );
}

Gallery.displayName = 'Gallery';
