import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { X, ZoomIn, ZoomOut, Download, Maximize2, RotateCw } from 'lucide-react';
import { Animate } from '../../primitives/Animate';
import { Presence } from '../../primitives/Presence';
import { useDrag } from '../../hooks/useDrag';

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  type?: 'image' | 'video';
  fileName?: string;
  caption?: string;
}

export function MediaLightbox({ isOpen, onClose, url, type = 'image', fileName, caption }: MediaLightboxProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const drag = useDrag();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setScale(1);
      setRotation(0);
      drag.offset.x = 0; // Reset manually since it's a ref-based state in my hook
      drag.offset.y = 0;
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  if (!isOpen) return null;

  return (
    <Presence present={isOpen} exitDuration={300}>
      <Animate 
        preset="fade"
        className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-2xl overflow-hidden"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        tabIndex={0}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-white">
              <p className="text-sm font-bold truncate max-w-[200px]">{fileName || 'Arquivo de Mídia'}</p>
              <p className="text-[10px] text-white/50">WhatsApp Media Viewer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handleZoomOut} className="p-2.5 rounded-full hover:bg-white/10 text-white transition-all"><ZoomOut size={20} /></button>
            <button onClick={handleZoomIn} className="p-2.5 rounded-full hover:bg-white/10 text-white transition-all"><ZoomIn size={20} /></button>
            <button onClick={handleRotate} className="p-2.5 rounded-full hover:bg-white/10 text-white transition-all"><RotateCw size={20} /></button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button onClick={onClose} className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500 text-white transition-all shadow-xl"><X size={20} /></button>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 relative flex items-center justify-center p-4 sm:p-12 overflow-hidden">
          <div 
            {...drag.dragProps}
            className="relative max-w-full max-h-full"
            style={{ 
              ...drag.dragProps.style,
              transform: `translate3d(${drag.offset.x}px, ${drag.offset.y}px, 0) scale(${scale}) rotate(${rotation}deg)`,
              transition: drag.isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' 
            }}
          >
            {type === 'image' ? (
              <img 
                src={url} 
                alt={caption || 'Media'} 
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] select-none pointer-events-none" 
              />
            ) : (
              <video 
                src={url} 
                controls 
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" 
              />
            )}
          </div>
        </div>

        {/* Footer / Caption */}
        {caption && (
          <div className="p-8 text-center bg-gradient-to-t from-black/50 to-transparent">
            <p className="text-white text-base font-medium max-w-2xl mx-auto drop-shadow-md">
              {caption}
            </p>
          </div>
        )}
      </Animate>
    </Presence>
  );
}
