import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { students } = await request.json();

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required field: students (non-empty array)" },
        { status: 400 }
      );
    }

    const formatted = students
      .map((s: { name: string; phase: number; avgGrade: number | null; completedModules: number; flags: string[] }) =>
        `- ${s.name} (Phase ${s.phase}, avg grade ${s.avgGrade ?? "N/A"}%, ${s.completedModules} modules done) — flags: ${s.flags.join(", ")}`
      )
      .join("\n");

    const result = await callOpenRouter(request, {
      system: `You are an academic success coach for a real-estate training academy.
Given this list of at-risk trainees (with their risk flags), write a concise admin briefing:
1. A 1-2 sentence overall summary.
2. 2-4 grouped recommendations / interventions tailored to the flags.
Be direct, supportive, and actionable. No more than ~150 words.`,
      user: `At-risk trainees:\n${formatted}`,
      temperature: 0.4,
      fallback: () =>
        `Students needing attention (${students.length}):\n\n` +
        students
          .map(
            (s: { name: string; flags: string[] }) =>
              `• ${s.name}: ${s.flags.join(", ")}`
          )
          .join("\n"),
    });

    return NextResponse.json({
      success: true,
      result: result.text,
      simulated: result.simulated,
    });
  } catch (error: unknown) {
    console.error("[OPENROUTER ERROR] at-risk failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
