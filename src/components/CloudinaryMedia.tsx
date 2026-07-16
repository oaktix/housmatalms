"use client";

import { FileText, Download, Eye } from "lucide-react";
import { pdfThumbnailUrl, pdfUrl } from "@/lib/cloudinaryUpload";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

interface CloudinaryImageProps {
  publicId: string;
  alt?: string;
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  className?: string;
}

/** Optimized image via Cloudinary auto-format + auto-quality. */
export function CloudinaryImage({
  publicId,
  alt = "",
  width,
  height,
  crop = "limit",
  quality = "auto",
  className = "",
}: CloudinaryImageProps) {
  const t = [`q_${quality}`, "f_auto", `c_${crop}`];
  if (width) t.push(`w_${width}`);
  if (height) t.push(`h_${height}`);
  const src = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${t.join(",")}/${publicId}`;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={width} height={height} loading="lazy" className={className} />;
}

interface CloudinaryVideoProps {
  publicId: string;
  width?: number;
  controls?: boolean;
  className?: string;
}

export function CloudinaryVideo({
  publicId,
  width = 640,
  controls = true,
  className = "",
}: CloudinaryVideoProps) {
  const src = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/q_auto,w_${width}/${publicId}.mp4`;
  const poster = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_${width}/${publicId}.jpg`;
  return (
    <video controls={controls} poster={poster} playsInline className={className} width={width}>
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

interface CloudinaryPdfProps {
  publicId: string;
  fileName?: string;
  /** Show an inline iframe preview in addition to the download button. */
  inline?: boolean;
  className?: string;
}

/**
 * PDF viewer/card. PDFs live on Cloudinary as `image` resources, so we can
 * render a first-page thumbnail and offer inline preview + download.
 */
export function CloudinaryPdf({
  publicId,
  fileName = "document.pdf",
  inline = false,
  className = "",
}: CloudinaryPdfProps) {
  const fileHref = pdfUrl(publicId);
  const thumb = pdfThumbnailUrl(publicId, 300);

  if (inline) {
    return (
      <div className={`w-full ${className}`}>
        <iframe src={fileHref} title={fileName} className="w-full h-[600px] rounded-lg border border-border-main" />
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-text-muted truncate">{fileName}</span>
          <a href={fileHref} download={fileName} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <Download size={14} /> Download
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 p-3 rounded-xl border border-border-main bg-bg-main ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumb} alt={fileName} className="w-16 h-20 object-cover rounded-md border border-border-main bg-white" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-text-main font-semibold truncate">
          <FileText size={16} className="text-red-500 shrink-0" />
          <span className="truncate">{fileName}</span>
        </div>
        <div className="flex gap-3 mt-2">
          <a href={fileHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <Eye size={14} /> View
          </a>
          <a href={fileHref} download={fileName} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <Download size={14} /> Download
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Smart renderer: pick the right viewer based on resource type / filename.
 * Useful for submission content that could be a PDF, image, or video.
 */
export function CloudinaryAsset({
  publicId,
  resourceType,
  fileName,
  className,
}: {
  publicId: string;
  resourceType: "image" | "video" | "raw";
  fileName?: string;
  className?: string;
}) {
  const isPdf = fileName?.toLowerCase().endsWith(".pdf") || publicId.toLowerCase().endsWith(".pdf");
  if (isPdf) return <CloudinaryPdf publicId={publicId.replace(/\.pdf$/i, "")} fileName={fileName} className={className} />;
  if (resourceType === "video") return <CloudinaryVideo publicId={publicId} className={className} />;
  if (resourceType === "image") return <CloudinaryImage publicId={publicId} alt={fileName} className={className} />;
  // raw file → download link
  return (
    <a
      href={`https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/${publicId}`}
      download={fileName}
      className={`inline-flex items-center gap-2 text-primary hover:underline ${className ?? ""}`}
    >
      <Download size={16} /> {fileName ?? "Download file"}
    </a>
  );
}
