import { NextResponse } from "next/server";
import { cloudStorePut, cloudStoreList } from "@/lib/cloudStoreServer";

const ALLOWED = new Set([
  "submissions",
  "applications",
  "quiz_attempts",
  "student_progress",
  "cohort_members",
  "announcements",
  "meetings",
  "attendance",
  "certificates",
  "graduate_status",
  "email_logs",
  "survey_responses",
  "profiles",
  "instructors",
  "cohorts",
]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get("collection") || "";
    if (!ALLOWED.has(collection)) {
      return NextResponse.json({ success: false, error: "Unknown collection" }, { status: 400 });
    }
    const records = await cloudStoreList(collection);
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("[store] GET failed:", error);
    return NextResponse.json({ success: false, error: "Failed to read store" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { collection, id, record } = await request.json();
    if (!ALLOWED.has(collection) || !id || typeof record !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid store payload" },
        { status: 400 }
      );
    }
    const ok = await cloudStorePut(collection, String(id), record);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Store unavailable" },
        { status: 502 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[store] POST failed:", error);
    return NextResponse.json({ success: false, error: "Failed to write store" }, { status: 500 });
  }
}
