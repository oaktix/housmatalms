import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import * as seeds from "@/lib/mockData";

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

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
    }

    const { email, password, token } = body;

    let targetProfile: seeds.Profile | null = null;

    // 1. Token-based authentication
    if (token) {
      // Find by ID or email
      if (isConfigured()) {
        try {
          const res = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?or=(id.eq.${encodeURIComponent(token)},email.eq.${encodeURIComponent(token)})&limit=1`,
            {
              headers: {
                apikey: SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
                Accept: "application/vnd.pgrst.object+json",
              },
            }
          );
          if (res.ok) {
            targetProfile = await res.json();
          }
        } catch (err) {
          console.warn("[Auth/Login] Token lookup in Supabase failed, checking seeds:", err);
        }
      }

      if (!targetProfile) {
        targetProfile =
          seeds.seedProfiles.find((p: seeds.Profile) => p.id === token || p.email.toLowerCase() === token.toLowerCase()) || null;
      }

      if (!targetProfile) {
        return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
      }
    } else {
      // 2. Email + Password authentication
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: "Email and password are required" },
          { status: 400 }
        );
      }

      // Password check: in demo/prototype environment "housmata2024" or profile-specific
      const DEMO_PASSWORD = process.env.MASTER_DEMO_PASSWORD || "housmata2024";
      if (password !== DEMO_PASSWORD) {
        return NextResponse.json(
          { success: false, error: "Incorrect password. Please verify your credentials." },
          { status: 401 }
        );
      }

      // Lookup profile in Supabase first
      if (isConfigured()) {
        try {
          const res = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email.trim().toLowerCase())}&limit=1`,
            {
              headers: {
                apikey: SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
                Accept: "application/vnd.pgrst.object+json",
              },
            }
          );
          if (res.ok) {
            targetProfile = await res.json();
          }
        } catch (err) {
          console.warn("[Auth/Login] Profile lookup in Supabase failed, checking seeds:", err);
        }
      }

      // Fallback to seeds if not found in Supabase
      if (!targetProfile) {
        targetProfile =
          seeds.seedProfiles.find(
            (p: seeds.Profile) => p.email.toLowerCase() === email.trim().toLowerCase()
          ) || null;
      }

      if (!targetProfile) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No approved account found for this email. Applications must be approved by an administrator before accessing the LMS.",
          },
          { status: 403 }
        );
      }
    }

    // Generate signed HMAC session token
    const sessionToken = await createSessionToken({
      userId: targetProfile.id,
      email: targetProfile.email,
      role: targetProfile.role,
      fullName: targetProfile.full_name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: targetProfile.id,
        email: targetProfile.email,
        role: targetProfile.role,
        full_name: targetProfile.full_name,
        avatar_url: targetProfile.avatar_url,
      },
    });

    // Set secure HttpOnly cookie (valid for 7 days)
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error("[Auth/Login] Internal error:", err);
    return NextResponse.json({ success: false, error: "Authentication system error" }, { status: 500 });
  }
}
