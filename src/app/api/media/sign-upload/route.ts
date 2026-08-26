import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { safeFileName } from "@/lib/files";

/**
 * Signs a direct browser -> Cloudinary upload.
 *
 * The client first asks this endpoint for a signature scoped to its own user
 * folder, then POSTs the file straight to Cloudinary (no file bytes ever touch
 * our server — no double bandwidth, no serverless body limits).
 *
 * PDFs are uploaded as resource_type "raw" so the original bytes are served
 * untouched (requires the dashboard setting "Allow delivery of PDF and ZIP
 * files" to be enabled). Everything else uses "auto".
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
const API_KEY = process.env.CLOUDINARY_API_KEY || "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

const SUBMISSIONS_FOLDER_ROOT = "housmata/submissions";

function isConfigured(): boolean {
  return Boolean(
    CLOUD_NAME &&
      API_KEY &&
      API_SECRET &&
      !CLOUD_NAME.startsWith("your-cloud") &&
      !API_KEY.startsWith("your-api")
  );
}

/** SHA-1 of alphabetically-sorted params joined with & , plus the API secret. */
function signParams(params: Record<string, string>): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(toSign + API_SECRET).digest("hex");
}

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({ success: false, error: "Media storage not configured" }, { status: 503 });
  }

  let body: { userId?: unknown; fileName?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Expected JSON body" }, { status: 400 });
  }

  const userId = String(body.userId ?? "").trim();
  const fileName = String(body.fileName ?? "").trim();

  // userId becomes part of the folder path; keep it strict.
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(userId)) {
    return NextResponse.json({ success: false, error: "Invalid user id" }, { status: 400 });
  }
  if (!fileName || fileName.length > 255) {
    return NextResponse.json({ success: false, error: "Missing or invalid file name" }, { status: 400 });
  }

  // Split off the extension. Assets are stored WITHOUT extensions in
  // public_id (Cloudinary appends the detected format).
  //
  // PDFs are uploaded as resource_type "image": the original still delivers
  // as application/pdf (requires the dashboard setting "Allow delivery of PDF
  // and ZIP files"), AND per-page transformations become available
  // (pg_N,f_jpg -> JPEG) which powers inline previews on mobile browsers,
  // where native PDF-in-iframe rendering is not supported.
  const extMatch = fileName.match(/\.([A-Za-z0-9]{1,10})$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "";
  const baseName = safeFileName(extMatch ? fileName.slice(0, fileName.length - extMatch[0].length) : fileName);

  const isPdf = ext === "pdf";
  const resourceType = isPdf ? "image" : "auto";
  const suffix = randomUUID().slice(0, 8);
  const publicId = `${suffix}-${baseName}`;
  const folder = `${SUBMISSIONS_FOLDER_ROOT}/${userId}`;
  const timestamp = Math.round(Date.now() / 1000);

  const signature = signParams({ folder, public_id: publicId, timestamp: String(timestamp) });

  return NextResponse.json({
    success: true,
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    timestamp,
    signature,
    folder,
    publicId,
    resourceType,
    uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
  });
}
