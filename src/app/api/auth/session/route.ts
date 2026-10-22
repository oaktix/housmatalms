import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
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

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  let profile: seeds.Profile | null = null;

  if (isConfigured()) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(session.userId)}&limit=1`,
        {
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            Accept: "application/vnd.pgrst.object+json",
          },
          cache: "no-store",
        }
      );
      if (res.ok) {
        profile = await res.json();
      }
    } catch {
      // Fallback below
    }
  }

  if (!profile) {
    profile = seeds.seedProfiles.find((p: seeds.Profile) => p.id === session.userId) || null;
  }

  return NextResponse.json({
    authenticated: true,
    user: profile || {
      id: session.userId,
      email: session.email,
      role: session.role,
      full_name: session.fullName || "User",
      avatar_url: "",
    },
  });
}
