import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Upload, X, File as FileIcon, FileText, Image as ImageIcon, Video as VideoIcon, Music as MusicIcon, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

// Class variance authority for main dropzone styles
const dropzoneVariants = cva(
  "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 text-center select-none group/dropzone",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-gray-50/50 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]",
        glass: "border-white/10 bg-white/[0.01] backdrop-blur-xl hover:bg-white/[0.03] shadow-xl shadow-black/5",
        minimalist: "border-transparent bg-transparent py-4 px-2 hover:bg-white/[0.02] border-0"
      },
      isDragActive: {
        true: "border-purple-500 bg-purple-500/[0.03] scale-[0.99] shadow-inner",
        false: "",
      },
      error: {
        true: "border-rose-500/50 bg-rose-500/[0.02]",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      isDragActive: false,
      error: false,
    }
  }
);

// File in queue model with reactive progress states
export interface DropzoneFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  thumbnailUrl?: string;
  error?: string;
}

export interface FileDropzoneProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrop'> {
  /** Style preset variation */
  variant?: 'default' | 'glass' | 'minimalist';
  /** Action trigger when files are validated and added */
  onDrop?: (files: File[]) => void;
  /** Accept file types mapping e.g., { 'image/*': ['.png', '.jpg'] } */
  accept?: Record<string, string[]>;
  /** Max files limit */
  maxFiles?: number;
  /** Max size per file in bytes */
  maxSize?: number;
  /** Header label text */
  label?: string;
  /** Description subtext */
  description?: string;
  /** If true, automatically simulates upload progress bars (0 to 100%) for gorgeous presentation */
  simulateUpload?: boolean;
  /** Shows image thumbnail previews directly in the queue list */
  showThumbnails?: boolean;
  /** Fully custom class for the queue list container */
  listClassName?: string;
}

/**
 * Custom Hook useFileDropzone
 * Encapsulates the complete state machine, validation, and progress animation logic 
 * for building custom file uploaders.
 */
export function useFileDropzone({
  onDrop,
  maxFiles = 5,
  maxSize,
  accept,
  simulateUpload = true
}: {
  onDrop?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  simulateUpload?: boolean;
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState<DropzoneFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auto clean object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.thumbnailUrl) {
          URL.revokeObjectURL(f.thumbnailUrl);
        }
      });
    };
  }, [files]);

  // Matches file types against accept map rules
  const matchFileType = (file: File): boolean => {
    if (!accept) return true;
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    return Object.entries(accept).some(([mimeRule, extensions]) => {
      // Validate Mime pattern
      if (mimeRule.endsWith('/*')) {
        const baseMime = mimeRule.replace('/*', '');
        if (fileType.startsWith(baseMime)) return true;
      } else if (fileType === mimeRule) {
        return true;
      }
      
      // Validate extensions
      return extensions.some(ext => fileName.endsWith(ext.toLowerCase()));
    });
  };

  const validateAndAddFiles = (newRawFiles: File[]) => {
    const validFiles: DropzoneFile[] = [];
    let validationError: string | null = null;

    if (files.length + newRawFiles.length > maxFiles) {
      validationError = `Limite máximo excedido (Máximo de ${maxFiles} arquivos)`;
      setError(validationError);
      return;
    }

    for (const file of newRawFiles) {
      if (maxSize && file.size > maxSize) {
        validationError = `Arquivo "${file.name}" é muito grande (Máximo ${(maxSize / 1024 / 1024).toFixed(1)}MB)`;
        break;
      }

      if (!matchFileType(file)) {
        validationError = `Formato de arquivo não aceito para "${file.name}"`;
        break;
      }

      const fileId = Math.random().toString(36).substring(2, 9);
      const isImage = file.type.startsWith('image/');

      validFiles.push({
        id: fileId,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: simulateUpload ? 0 : 100,
        status: simulateUpload ? 'uploading' : 'success',
        thumbnailUrl: isImage ? URL.createObjectURL(file) : undefined
      });
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setFiles(prev => [...prev, ...validFiles]);
    onDrop?.(newRawFiles);

    // Simulated progress loop for delightful feedback
    if (simulateUpload) {
      validFiles.forEach(vf => {
        let currentProgress = 0;
        const speed = 50 + Math.random() * 80; // random upload speed
        const interval = setInterval(() => {
          currentProgress += Math.floor(Math.random() * 15) + 5;
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);
            setFiles(prev => prev.map(f => f.id === vf.id ? { ...f, progress: 100, status: 'success' } : f));
          } else {
            setFiles(prev => prev.map(f => f.id === vf.id ? { ...f, progress: currentProgress } : f));
          }
        }, speed);
      });
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target?.thumbnailUrl) {
        URL.revokeObjectURL(target.thumbnailUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const clearQueue = () => {
    files.forEach(f => f.thumbnailUrl && URL.revokeObjectURL(f.thumbnailUrl));
    setFiles([]);
    setError(null);
  };

  return {
    isDragActive,
    setIsDragActive,
    files,
    error,
    setError,
    validateAndAddFiles,
    removeFile,
    clearQueue
  };
}

/**
 * Super Advanced FileDropzone Component
 * Features real-time image previews, smooth simulated progress metrics,
 * gorgeous animations, error diagnostics, and a secondary low-level state hook.
 */
export const FileDropzone = React.forwardRef<HTMLDivElement, FileDropzoneProps>(
  ({ 
    variant = "default",
    onDrop, 
    accept,
    maxFiles = 5, 
    maxSize = 10 * 1024 * 1024, // 10MB Default
    label = "Arraste seus arquivos para cá", 
    description = "PNG, JPG, PDF ou MP4 até 10MB", 
    simulateUpload = true,
    showThumbnails = true,
    listClassName,
    className,
    ...props 
  }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    const {
      isDragActive,
      setIsDragActive,
      files,
      error,
      validateAndAddFiles,
      removeFile
    } = useFileDropzone({ onDrop, maxFiles, maxSize, accept, simulateUpload });

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      validateAndAddFiles(droppedFiles);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        validateAndAddFiles(selectedFiles);
      }
    };

    // Formatter utility for file sizes
    const formatSize = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Dynamic icon provider matching the file type
    const getFileIcon = (mimeType: string) => {
      if (mimeType.startsWith('image/')) return <ImageIcon className="h-4 w-4 text-emerald-400" />;
      if (mimeType.startsWith('video/')) return <VideoIcon className="h-4 w-4 text-purple-400" />;
      if (mimeType.startsWith('audio/')) return <MusicIcon className="h-4 w-4 text-amber-400" />;
      if (mimeType.startsWith('text/') || mimeType.includes('pdf') || mimeType.includes('document')) {
        return <FileText className="h-4 w-4 text-blue-400" />;
      }
      return <FileIcon className="h-4 w-4 text-zinc-400" />;
    };

    return (
      <div className="w-full space-y-4">
        {/* Dropzone container */}
        <div
          ref={ref}
          className={cn(
            dropzoneVariants({ variant, isDragActive, error: !!error, className }),
            "p-8 cursor-pointer relative overflow-hidden transition-all duration-300"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          {...props}
        >
          {/* Neon Glow underlays on hover/drag active */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity duration-300 pointer-events-none",
            (isDragActive || variant === 'glass') && "opacity-100"
          )} />
          
          <input 
            ref={inputRef}
            type="file" 
            className="hidden" 
            multiple={maxFiles > 1} 
            onChange={handleChange} 
          />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={cn(
              "mb-4 rounded-2xl bg-white/5 border border-white/10 p-3.5 shadow-md",
              "group-hover/dropzone:scale-110 group-hover/dropzone:border-purple-500/30 transition-all duration-300",
              isDragActive && "scale-110 border-purple-500 bg-purple-500/10 text-purple-400 animate-pulse"
            )}>
              <Upload className={cn("h-6 w-6 text-white/50 transition-colors duration-300 group-hover/dropzone:text-purple-400", isDragActive && "text-purple-400")} />
            </div>
            
            <div className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
              {isDragActive ? (
                <span className="text-purple-400 font-bold flex items-center gap-1">
                  Solte para enviar os arquivos <Sparkles size={14} className="animate-spin" />
                </span>
              ) : (
                label
              )}
            </div>
            
            <div className="mt-1.5 text-xs text-zinc-500 dark:text-white/40 font-medium">
              {description}
            </div>
            
            {error && (
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-500 animate-shake">
                <AlertCircle size={12} />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic File Queue List with individual status and thumbnail extraction */}
        {files.length > 0 && (
          <div className={cn("grid gap-2.5", listClassName)}>
            {files.map((item) => (
              <div 
                key={item.id} 
                className={cn(
                  "relative overflow-hidden flex flex-col rounded-xl border p-3.5 transition-all duration-300",
                  "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]",
                  item.status === 'success' && "border-emerald-500/20 bg-emerald-500/[0.01]"
                )}
              >
                {/* Simulated Glow for files in uploading progress */}
                {item.status === 'uploading' && (
                  <div 
                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                )}

                <div className="flex items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Render high-fidelity image thumbnail or specific icon */}
                    {showThumbnails && item.thumbnailUrl ? (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40">
                        <img 
                          src={item.thumbnailUrl} 
                          alt={item.name} 
                          className="h-full w-full object-cover animate-fade-in"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-sm">
                        {getFileIcon(item.type)}
                      </div>
                    )}
                    
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[240px] md:max-w-[320px]">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-white/30 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                        {formatSize(item.size)}
                        <span className="h-1 w-1 rounded-full bg-white/10" />
                        {item.status === 'uploading' ? (
                          <span className="text-purple-400 animate-pulse">Enviando ({item.progress}%)</span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            Concluído <CheckCircle2 size={10} />
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(item.id);
                    }}
                    className="rounded-lg p-2 hover:bg-white/5 text-white/40 hover:text-white transition-all active:scale-95 shrink-0"
                    title="Remover arquivo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

FileDropzone.displayName = 'FileDropzone';
