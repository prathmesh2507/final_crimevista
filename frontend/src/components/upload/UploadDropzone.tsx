import React, { useRef, useState } from 'react';
import { FileSpreadsheetIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface UploadDropzoneProps {
  acceptedExtensions: string[];
  maxFileSizeMb: number;
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  error?: string | null;
}

export function UploadDropzone({ acceptedExtensions, maxFileSizeMb, onFileSelected, disabled = false, error }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby="dropzone-hint"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics',
          dragging ? 'border-analytics bg-analytics-soft' : error ? 'border-danger/40 bg-danger-soft' : 'border-line bg-surface hover:border-subtle',
          disabled && 'cursor-not-allowed opacity-60'
        )}>
        
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-analytics-soft text-analytics">
          <FileSpreadsheetIcon className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-4 text-sm font-semibold text-fg">{dragging ? 'Drop file to select it' : 'Drag and drop a dataset, or click to browse'}</p>
        <p id="dropzone-hint" className="mt-1 text-xs text-muted">
          {acceptedExtensions.join(', ') || 'Any file type'} · up to {maxFileSizeMb} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          accept={acceptedExtensions.join(',')}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }} />
        
      </div>
      {error &&
      <p role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      }
    </div>);

}