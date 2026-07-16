/**
 * Cloudinary client-side upload helpers.
 *
 * Flow:
 *  1. Ask our server (`/api/media/upload-signed`) for a signature.
 *  2. Upload the file DIRECTLY to Cloudinary from the browser (keeps large
 *     PDFs/videos off our server and out of localStorage/Postgres).
 *  3. Return a lightweight descriptor (URL + public_id) that we store in the DB.
 *
 * PDFs are uploaded as `image` resource type in Cloudinary. This is intentional:
 * Cloudinary treats PDFs as multi-page "images", which unlocks:
 *   - Automatic thumbnail generation (first page): `.../<public_id>.jpg`
 *   - Page count, on-the-fly format conversion, and inline preview.
 * If you prefer the file to stay a pure download (no transformations), switch
 * resourceType to 'raw'.
 */

export interface UploadedMedia {
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: "image" | "video" | "raw";
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  pages?: number;
  originalFilename: string;
}

export type UploadProgressHandler = (percent: number) => void;

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/** Decide the Cloudinary resource_type from a File's MIME type. */
export function resourceTypeFor(file: File): "image" | "video" | "raw" {
  if (file.type === "application/pdf") return "image"; // PDF => image for previews
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "raw"; // docx, pptx, zip, txt, etc.
}

/**
 * Upload a single file to Cloudinary using a server-generated signature.
 * Uses XHR so we can report real upload progress.
 */
export async function uploadToCloudinary(
  file: File,
  opts: {
    folder?: string;
    onProgress?: UploadProgressHandler;
  } = {}
): Promise<UploadedMedia> {
  const folder = opts.folder ?? "housmata/submissions";
  const resourceType = resourceTypeFor(file);

  // 1. Get signature from our API
  const sigRes = await fetch("/api/media/upload-signed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, resourceType }),
  });
  if (!sigRes.ok) {
    throw new Error("Could not initialise upload. Please try again.");
  }
  const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

  // 2. Upload directly to Cloudinary
  const endpoint = `https://api.cloudinary.com/v1_1/${
    cloudName || CLOUD_NAME
  }/${resourceType}/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts.onProgress) {
        opts.onProgress(Math.round((e.loaded * 100) / e.total));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed (${xhr.status}). Please try again.`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(form);
  });

  return {
    publicId: result.public_id as string,
    url: result.url as string,
    secureUrl: result.secure_url as string,
    resourceType: (result.resource_type as UploadedMedia["resourceType"]) ?? resourceType,
    format: (result.format as string) ?? file.name.split(".").pop() ?? "",
    bytes: (result.bytes as number) ?? file.size,
    width: result.width as number | undefined,
    height: result.height as number | undefined,
    pages: result.pages as number | undefined,
    originalFilename: file.name,
  };
}

/** Build a first-page JPG thumbnail URL for a PDF stored on Cloudinary. */
export function pdfThumbnailUrl(publicId: string, width = 400): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_${width},pg_1,f_jpg/${publicId}.jpg`;
}

/** Build a delivery URL for a PDF (inline view / download). */
export function pdfUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}.pdf`;
}
