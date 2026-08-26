/** Shared helpers for serving submission files. */

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  txt: "text/plain",
  csv: "text/csv",
  mp4: "video/mp4",
  webm: "video/webm",
  zip: "application/zip",
};

export function mimeFromName(name?: string | null): string | undefined {
  if (!name) return undefined;
  const ext = name.split(".").pop()?.toLowerCase();
  return ext ? MIME_BY_EXT[ext] : undefined;
}

export function isPreviewableMime(mime?: string | null): boolean {
  if (!mime) return false;
  return mime === "application/pdf" || mime.startsWith("image/");
}

/** Strip path separators / control chars and cap length for safe object keys. */
export function safeFileName(name?: string | null): string {
  const base = (name || "file").split(/[/\\]/).pop() || "file";
  const cleaned = base.replace(/[\x00-\x1f?#%&{}<>|"^`\s]+/g, "_").slice(0, 90);
  return cleaned.length ? cleaned : "file";
}

export function storageObjectUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  return `${base}/storage/v1/object/submissions/${path}`;
}
