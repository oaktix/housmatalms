"use client";

import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { uploadToCloudinary, UploadedMedia } from "@/lib/cloudinaryUpload";

interface MediaUploaderProps {
  folder?: string;
  /** Accept attribute for the file input. Defaults to PDF-only. */
  accept?: string;
  /** Max size in MB. */
  maxSizeMb?: number;
  onUploaded: (media: UploadedMedia) => void;
  disabled?: boolean;
}

/**
 * Drag-and-drop uploader that streams files directly to Cloudinary.
 * Optimised for PDFs (the primary media type) but supports images/video too.
 */
export function MediaUploader({
  folder = "housmata/submissions",
  accept = ".pdf",
  maxSizeMb = 20,
  onUploaded,
  disabled = false,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`File is too large. Maximum ${maxSizeMb} MB allowed.`);
        return;
      }

      setFileName(file.name);
      setIsUploading(true);
      setProgress(0);

      try {
        const media = await uploadToCloudinary(file, {
          folder,
          onProgress: setProgress,
        });
        onUploaded(media);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
        setFileName(null);
      } finally {
        setIsUploading(false);
      }
    },
    [folder, maxSizeMb, onUploaded]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300
          ${isDragging ? "border-primary bg-primary/5" : "border-primary/30 bg-bg-main/50 hover:bg-bg-main hover:border-primary/50"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          aria-label="Upload file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        {isUploading ? (
          <div className="text-center space-y-3 w-full max-w-xs">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm font-bold text-primary truncate">{fileName}</p>
            <div className="w-full bg-border-main rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-text-muted">{progress}% uploaded</p>
          </div>
        ) : fileName ? (
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
              <FileText size={22} />
            </div>
            <p className="text-sm font-bold text-accent truncate max-w-[240px]">{fileName}</p>
            <p className="text-xs text-text-muted">Uploaded to Cloudinary</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFileName(null);
                setProgress(0);
              }}
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-red-500"
            >
              <X size={12} /> Choose another
            </button>
          </div>
        ) : (
          <div className="text-center space-y-2 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <UploadCloud size={22} />
            </div>
            <p className="text-sm font-bold text-primary">Click to browse or drag &amp; drop</p>
            <p className="text-xs text-text-muted">
              {accept.replace(/\./g, "").toUpperCase()} up to {maxSizeMb} MB
            </p>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
