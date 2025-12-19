import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Upload, X, File as FileIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

const dropzoneVariants = cva(
  "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 text-center",
  {
    variants: {
      isDragActive: {
        true: "border-blue-500 bg-blue-50 dark:bg-blue-500/10",
        false: "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]",
      },
      error: {
        true: "border-rose-500 bg-rose-50 dark:bg-rose-500/10",
        false: "",
      }
    },
    defaultVariants: {
      isDragActive: false,
      error: false,
    },
  }
);

export interface FileDropzoneProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrop'> {
  onDrop?: (files: File[]) => void;
  accept?: Record<string, string[]>; // e.g. { 'image/*': ['.png', '.jpg'] }
  maxFiles?: number;
  maxSize?: number; // in bytes
  label?: string;
  description?: string;
}

export const FileDropzone = React.forwardRef<HTMLDivElement, FileDropzoneProps>(
  ({ className, onDrop, maxFiles = 1, maxSize, label = "Upload files", description = "Drag & drop or click to upload", ...props }, ref) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
    };

    const validateFiles = (fileList: File[]) => {
      if (maxFiles && fileList.length > maxFiles) {
        setError(`Max ${maxFiles} files allowed`);
        return false;
      }
      if (maxSize) {
        const oversized = fileList.some(f => f.size > maxSize);
        if (oversized) {
          setError(`File too large (max ${maxSize / 1024 / 1024}MB)`);
          return false;
        }
      }
      setError(null);
      return true;
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (validateFiles(droppedFiles)) {
        setFiles(droppedFiles);
        onDrop?.(droppedFiles);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        if (validateFiles(selectedFiles)) {
          setFiles(selectedFiles);
          onDrop?.(selectedFiles);
        }
      }
    };

    const removeFile = (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onDrop?.(newFiles);
    };

    return (
      <div className="w-full space-y-4">
        <div
          ref={ref}
          className={cn(dropzoneVariants({ isDragActive, error: !!error, className }), "p-8 cursor-pointer")}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          {...props}
        >
          <input 
            ref={inputRef}
            type="file" 
            className="hidden" 
            multiple={maxFiles > 1} 
            onChange={handleChange} 
          />
          
          <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-white/10">
            <Upload className="h-6 w-6 text-gray-500 dark:text-white/70" />
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-white/50">
            {description}
          </div>
          {error && (
            <div className="mt-2 text-xs font-medium text-rose-500">
              {error}
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="grid gap-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/10">
                    <FileIcon className="h-4 w-4 text-gray-500 dark:text-white/70" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-gray-500 dark:text-white/50">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => removeFile(i, e)}
                  className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
FileDropzone.displayName = 'FileDropzone';
