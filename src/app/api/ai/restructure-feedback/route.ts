import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { feedback } = await request.json();

    if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing required field: feedback" },
        { status: 400 }
      );
    }

    const result = await callOpenRouter(request, {
      system: `You are an experienced instructional coach for a real-estate training academy.
Your job is to restructure an instructor's raw evaluation notes into clear, professional, and constructive coaching feedback for a student.

Guidelines:
- Rewrite ONLY the instructor's draft notes provided below. Do not invent new criticisms, scores, or facts.
- Use clear sections where relevant: "Strengths", "Areas for Improvement / Corrections", and "Next Steps / Coaching Tips".
- Preserve the instructor's intent, tone, and any encouragement. Do not invent scores or grades.
- Be concise, specific, and well-organized. Avoid generic platitudes.
- Write in a supportive, professional voice suitable for a student receiving graded work.`,
      user: `Instructor's draft notes:\n${feedback.trim()}`,
      temperature: 0.4,
      fallback: () => buildFallbackNote(feedback),
    });

    return NextResponse.json({ success: true, restructured: result.text });
  } catch (error: unknown) {
    console.error("[OPENROUTER ERROR] Failed to restructure feedback:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to restructure feedback";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

function buildFallbackNote(feedback: string): string {
  return [
    "Strengths:\n- (note what was done well based on the draft below)",
    "",
    "Areas for Improvement / Corrections:\n- (organize the corrections from the draft)",
    "",
    "Next Steps / Coaching Tips:\n- (actionable guidance)",
    "",
    `Instructor's original notes:\n${feedback.trim()}`,
  ].join("\n");
}
