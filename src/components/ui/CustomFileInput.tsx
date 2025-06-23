/* eslint-disable @typescript-eslint/no-explicit-any */
// /components/ui/CustomFileInput.tsx
"use client";

import { useState, useRef, DragEvent } from 'react';
import { useController, Control } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { FileUp, File as FileIcon, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface CustomFileInputProps {
  name: string;
  control: Control<any>;
  label: string;
  expectedFileName?: string;
}

export function CustomFileInput({ name, control, label, expectedFileName }: CustomFileInputProps) {
  const { field } = useController({ name, control });
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const file = field.value as File | null;
  const isNameCorrect = file && expectedFileName ? file.name === expectedFileName : null;

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      field.onChange(files[0]);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      field.onChange(files[0]);
    }
  };

  const handleRemoveFile = () => {
    field.onChange(null);
    if (inputRef.current) {
        inputRef.current.value = '';
    }
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      {file ? (
        <div className="p-4 border-2 border-dashed rounded-md flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileIcon className="h-8 w-8 text-gray-500 flex-shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-mono text-sm truncate" title={file.name}>{file.name}</span>
              <span className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </span>
            </div>
          </div>
          <button type="button" onClick={handleRemoveFile} className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary/80"
          )}
        >
          <FileUp className="w-10 h-10 text-gray-400 mb-2" />
          <p className="text-sm text-center text-gray-600">
            <span className="font-semibold text-primary">Klik untuk memilih</span> atau seret file
          </p>
          <p className="text-xs text-gray-500 mt-1">Hanya file berekstensi .mdb</p>
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".mdb, application/vnd.ms-access"
          />
        </div>
      )}
      {expectedFileName && (
        <div className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1.5">
            {isNameCorrect === true && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-px" />}
            {isNameCorrect === false && <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-px" />}
            <p>Nama file yang disarankan: <span className="font-mono">{expectedFileName}</span></p>
        </div>
      )}
    </div>
  );
}