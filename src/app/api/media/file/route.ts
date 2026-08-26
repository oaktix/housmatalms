import { NextResponse } from "next/server";
import { mimeFromName, storageObjectUrl } from "@/lib/files";

/**
 * Serves a submission file to the browser, whatever backend originally held it:
 *
 * - `storage:<path>`  → streamed from the Supabase Storage "submissions" bucket
 * - `data:<mime>;base64,…` (legacy rows) → decoded and returned as bytes
 * - `https://…` (Cloudinary CDN) → 302 redirect to the CDN
 *
 * This single endpoint backs both inline previews (<iframe src>) and downloads
 * (?download=1). Auth-free for now — same posture as /api/db; add a session
 * check before exposing publicly.
 */

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function isConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
      SERVICE_ROLE_KEY &&
      SUPABASE_URL !== "https://your-project-id.supabase.co" &&
      !SERVICE_ROLE_KEY.startsWith("your-service")
  );
}

function dispositionHeader(download: boolean, fileName?: string | null): string {
  const type = download ? "attachment" : "inline";
  if (!fileName) return type;
  const encoded = encodeURIComponent(fileName);
  return `${type}; filename*=UTF-8''${encoded}`;
}

/**
 * Prepend a Cloudinary delivery flag right after /upload/, before any version
 * segment — the canonical position.
 */
function withCloudinaryFlag(url: string, flag: string): string {
  const m = url.match(/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video|raw|auto)\/upload\/)(.*)$/i);
  if (!m) return url;
  return `${m[1]}${flag}/${m[2]}`;
}

async function fetchSubmissionRow(id: string): Promise<{ content_link?: string; content_file_name?: string } | null> {
  const url =
    `${SUPABASE_URL}/rest/v1/submissions?select=content_link,content_file_name` +
    `&id=eq.${encodeURIComponent(id)}&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<{ content_link?: string; content_file_name?: string }>;
  return rows[0] ?? null;
}

export async function GET(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ success: false, error: "Storage not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  const download = searchParams.get("download") === "1";

  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return NextResponse.json({ success: false, error: "Invalid submission id" }, { status: 400 });
  }

  let row: { content_link?: string; content_file_name?: string } | null;
  try {
    row = await fetchSubmissionRow(id);
  } catch (err) {
    console.error("[media/file] row lookup failed:", err);
    return NextResponse.json({ success: false, error: "File lookup failed" }, { status: 502 });
  }

  const link = row?.content_link;
  if (!row || !link) {
    return NextResponse.json({ success: false, error: "Submitted file not found" }, { status: 404 });
  }

  const fileName = row.content_file_name || undefined;
  const headers = new Headers();
  headers.set("Content-Disposition", dispositionHeader(download, fileName));
  // Rows are immutable (resubmission creates a new id), but keep caches polite.
  headers.set("Cache-Control", "private, max-age=3600");

  try {
    if (link.startsWith("storage:")) {
      const objectPath = link.slice("storage:".length).replace(/^\/+/, "");
      const upstream = await fetch(storageObjectUrl(objectPath), {
        headers: { Authorization: `Bearer ${SERVICE_ROLE_KEY}`, apikey: SERVICE_ROLE_KEY },
        cache: "no-store",
      });
      if (!upstream.ok || !upstream.body) {
        return NextResponse.json({ success: false, error: "Stored file not found" }, { status: 404 });
      }
      headers.set(
        "Content-Type",
        mimeFromName(fileName) || upstream.headers.get("content-type") || "application/octet-stream"
      );
      const len = upstream.headers.get("content-length");
      if (len) headers.set("Content-Length", len);
      return new Response(upstream.body, { status: 200, headers });
    }

    if (link.startsWith("data:")) {
      const match = link.match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/);
      if (!match) {
        return NextResponse.json({ success: false, error: "Unreadable file payload" }, { status: 422 });
      }
      const mime = match[1] || mimeFromName(fileName) || "application/octet-stream";
      const buffer = match[2]
        ? Buffer.from(match[3], "base64")
        : Buffer.from(decodeURIComponent(match[3]), "utf8");
      headers.set("Content-Type", mime);
      headers.set("Content-Length", String(buffer.length));
      return new Response(new Uint8Array(buffer), { status: 200, headers });
    }

    if (/^https?:\/\//i.test(link)) {
      let target = link;
      // Downloads: bare fl_attachment makes Cloudinary serve
      // Content-Disposition: attachment using the asset's own (original)
      // filename. Flag values with dots are rejected, so no custom names.
      if (/^https?:\/\/res\.cloudinary\.com\//i.test(link) && download) {
        target = withCloudinaryFlag(link, "fl_attachment");
      }
      return NextResponse.redirect(target, 302);
    }

    return NextResponse.json({ success: false, error: "Unsupported file reference" }, { status: 422 });
  } catch (err) {
    console.error("[media/file] serve failed:", err);
    return NextResponse.json({ success: false, error: "Could not read submitted file" }, { status: 502 });
  }
}
