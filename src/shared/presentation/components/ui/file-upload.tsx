'use client';

import * as React from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onChange?: (files: File[]) => void;
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  ({ className, accept, multiple, maxSizeMB, onChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [fileNames, setFileNames] = React.useState<string[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [dragging, setDragging] = React.useState(false);

    const processFiles = (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (maxSizeMB !== undefined) {
        const maxBytes = maxSizeMB * 1024 * 1024;
        const oversized = files.find((f) => f.size > maxBytes);
        if (oversized) {
          setError(`File "${oversized.name}" is too large (max ${maxSizeMB} MB, got ${(oversized.size / 1024 / 1024).toFixed(1)} MB)`);
          return;
        }
      }
      setError(null);
      setFileNames(files.map((f) => f.name));
      onChange?.(files);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--rule)] p-6 text-sm text-[var(--ink-3)] transition-colors cursor-pointer',
          dragging && 'border-[var(--forest)] bg-[var(--forest-bg)]',
          className,
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        {...props}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={handleChange}
          onClick={(e) => e.stopPropagation()}
        />
        <Upload className="h-6 w-6" />
        <span>Drag & drop or click to upload</span>
        {error && <p className="text-[var(--terracotta)] text-xs">{error}</p>}
        {fileNames.length > 0 && !error && (
          <ul className="text-xs text-[var(--ink-2)]">
            {fileNames.map((n) => <li key={n}>{n}</li>)}
          </ul>
        )}
      </div>
    );
  },
);
FileUpload.displayName = 'FileUpload';

export { FileUpload };
