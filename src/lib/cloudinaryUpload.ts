/**
 * Client-side submission upload helper.
 *
 * Two-step direct-to-Cloudinary upload:
 *  1. POST /api/media/sign-upload  -> per-user folder + signature
 *  2. XHR the file straight to Cloudinary (keeps real progress events)
 *
 * The DB row stores the returned CDN URL in submissions.content_link and the
 * asset id in content_public_id — Supabase keeps data only, never bytes.
 */

export interface UploadedFileRef {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  fileName: string;
  bytes: number;
}

export type UploadProgressHandler = (percent: number) => void;

interface SignPayload {
  success?: boolean;
  error?: string;
  cloudName?: string;
  apiKey?: string;
  timestamp?: number;
  signature?: string;
  folder?: string;
  publicId?: string;
  resourceType?: string;
  uploadUrl?: string;
}

async function fetchUploadSignature(userId: string, fileName: string): Promise<Required<SignPayload>> {
  const res = await fetch("/api/media/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, fileName }),
  });
  const payload = (await res.json().catch(() => null)) as SignPayload | null;
  if (!res.ok || !payload?.success || !payload.uploadUrl || !payload.signature) {
    throw new Error(payload?.error || `Could not prepare the upload (${res.status}).`);
  }
  return payload as Required<SignPayload>;
}

/** Map common Cloudinary errors to friendly messages. */
function cloudinaryErrorMessage(err: string): string {
  if (/file size too large|maximum file size/i.test(err)) {
    return "File is too large for the media host. Please try a smaller file.";
  }
  return `Upload failed: ${err}`;
}

export function uploadSubmissionFile(
  file: File,
  userId: string,
  opts: { onProgress?: UploadProgressHandler } = {}
): Promise<UploadedFileRef> {
  return (async () => {
    // 1. Get a signature scoped to this user's folder.
    let sig: Required<SignPayload>;
    try {
      sig = await fetchUploadSignature(userId, file.name);
    } catch (err) {
      throw err instanceof Error ? err : new Error("Could not prepare the upload.");
    }

    // 2. Upload directly to Cloudinary with progress callbacks.
    return await new Promise<UploadedFileRef>((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.apiKey);
      form.append("timestamp", String(sig.timestamp));
      form.append("signature", sig.signature);
      form.append("folder", sig.folder);
      form.append("public_id", sig.publicId);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", sig.uploadUrl);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && opts.onProgress) {
          opts.onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        let payload: { secure_url?: string; public_id?: string; resource_type?: string; error?: { message?: string } } | null = null;
        try {
          payload = JSON.parse(xhr.responseText);
        } catch {
          // fall through with null
        }
        if (xhr.status >= 200 && xhr.status < 300 && payload?.secure_url && payload?.public_id) {
          resolve({
            secureUrl: payload.secure_url,
            publicId: payload.public_id,
            resourceType: payload.resource_type || sig.resourceType,
            fileName: file.name,
            bytes: file.size,
          });
        } else {
          reject(new Error(cloudinaryErrorMessage(payload?.error?.message || `HTTP ${xhr.status}`)));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload."));

      xhr.send(form);
    });
  })();
}
