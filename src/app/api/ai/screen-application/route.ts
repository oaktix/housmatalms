import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { applicant_name, state, experience_level, course_id, motivation } = await request.json();

    if (!motivation || typeof motivation !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing required field: motivation" },
        { status: 400 }
      );
    }

    const courseName =
      course_id === "property-advisor-hcpa"
        ? "Housmata Certified Property Advisor (HCPA)"
        : "Housmata Certified Estate Manager (HCEM)";

    const result = await callOpenRouter(request, {
      system: `You are an admissions reviewer for a real-estate training academy.
Given the applicant profile, return:
1. A one-word verdict: ADMIT, REVIEW, or DECLINE.
2. 2-3 bullet points of rationale.
3. Any risk flags (e.g. unclear motivation, mismatch with course, low experience for advanced track).
Be fair, concise, and professional. Do not invent facts beyond what is provided.`,
      user: `Applicant: ${applicant_name || "N/A"}
State: ${state || "N/A"}
Experience level: ${experience_level || "Beginner"}
Course: ${courseName}
Motivation statement:
${motivation.trim()}`,
      temperature: 0.3,
      fallback: () =>
        `AI screening unavailable.\n\nRecommended action: MANUAL REVIEW\n\nMotivation provided (${motivation.trim().length} chars). An administrator should read the statement and decide ADMIT / REVIEW / DECLINE based on course fit and experience.`,
    });

    return NextResponse.json({
      success: true,
      result: result.text,
      simulated: result.simulated,
    });
  } catch (error: unknown) {
    console.error("[OPENROUTER ERROR] screen-application failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
