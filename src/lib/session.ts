/**
 * Cryptographic Session & JWT-equivalent token management using Web Crypto API.
 * Compatible with Edge Runtime, Node.js, and Next.js Route Handlers.
 */

export interface SessionPayload {
  userId: string;
  email: string;
  role: "admin" | "instructor" | "student";
  fullName?: string;
  iat?: number;
  exp?: number;
}

export const SESSION_COOKIE_NAME = "lms_session";
const DEFAULT_EXPIRATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getSecretKey(): string {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "housmata-lms-enterprise-security-session-secret-salt-2026";
  return secret;
}

function base64UrlEncode(data: Uint8Array | string): string {
  let base64: string;
  if (typeof data === "string") {
    if (typeof btoa !== "undefined") {
      base64 = btoa(unescape(encodeURIComponent(data)));
    } else {
      base64 = Buffer.from(data, "utf-8").toString("base64");
    }
  } else {
    if (typeof btoa !== "undefined") {
      let binary = "";
      for (let i = 0; i < data.byteLength; i++) {
        binary += String.fromCharCode(data[i]);
      }
      base64 = btoa(binary);
    } else {
      base64 = Buffer.from(data).toString("base64");
    }
  }
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  if (typeof atob !== "undefined") {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  return new Uint8Array(Buffer.from(base64, "base64"));
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyData = enc.encode(getSecretKey());
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a signed JWT-style session token.
 */
export async function createSessionToken(
  payload: SessionPayload,
  expiresInSeconds: number = DEFAULT_EXPIRATION_SECONDS
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${headerB64}.${payloadB64}`;

  const key = await getCryptoKey();
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(dataToSign)
  );

  const sigB64 = base64UrlEncode(new Uint8Array(signatureBytes));
  return `${dataToSign}.${sigB64}`;
}

/**
 * Verifies the signature and expiration of a session token.
 * Returns the decoded payload if valid, null otherwise.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = parts;
  const dataToVerify = `${headerB64}.${payloadB64}`;

  try {
    const key = await getCryptoKey();
    const signatureBytes = base64UrlDecode(sigB64);

    const signatureBuffer = signatureBytes.buffer.slice(
      signatureBytes.byteOffset,
      signatureBytes.byteOffset + signatureBytes.byteLength
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer as ArrayBuffer,
      new TextEncoder().encode(dataToVerify)
    );

    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(payloadB64);
    const payloadText = new TextDecoder().decode(payloadBytes);
    const payload = JSON.parse(payloadText) as SessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    console.error("[Session] Verification failed:", err);
    return null;
  }
}

/**
 * Extracts and verifies session payload from Request headers or cookies.
 */
export async function getSessionFromRequest(request: Request): Promise<SessionPayload | null> {
  // 1. Check Bearer authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    const verified = await verifySessionToken(token);
    if (verified) return verified;
  }

  // 2. Check x-lms-session header
  const xSession = request.headers.get("x-lms-session");
  if (xSession) {
    const verified = await verifySessionToken(xSession);
    if (verified) return verified;
  }

  // 3. Check Cookie header
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${SESSION_COOKIE_NAME}=`)) {
        const token = cookie.substring(SESSION_COOKIE_NAME.length + 1);
        const verified = await verifySessionToken(token);
        if (verified) return verified;
      }
    }
  }

  return null;
}
