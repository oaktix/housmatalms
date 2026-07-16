import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { overallScore, phase, modules } = await request.json();

    if (!Array.isArray(modules)) {
      return NextResponse.json(
        { success: false, error: "Missing required field: modules (array)" },
        { status: 400 }
      );
    }

    const moduleLines = modules
      .map(
        (m: { title: string; quizScore?: number; assignmentGrade?: number; finalGrade?: number; feedback?: string }) =>
          `- ${m.title}: quiz ${m.quizScore ?? "n/a"}%, assignment ${m.assignmentGrade ?? "n/a"}%, weighted ${m.finalGrade ?? "n/a"}%${m.feedback ? ` | feedback: ${m.feedback}` : ""}`
      )
      .join("\n");

    const lowest = [...modules]
      .filter((m: { finalGrade?: number }) => typeof m.finalGrade === "number")
      .sort((a: { finalGrade: number }, b: { finalGrade: number }) => a.finalGrade - b.finalGrade)
      .slice(0, 2)
      .map((m: { title: string }) => m.title);

    const result = await callOpenRouter(request, {
      system: `You are a supportive academic coach for a real-estate training academy.
Given a student's module scorecard, write a short, encouraging performance insight:
1. One sentence on what they're doing well.
2. One sentence on where to focus next (reference their lowest modules if listed).
3. 2-3 concrete next-step bullet points.
Use plain language. Do NOT invent scores or grades. Keep it under ~140 words.`,
      user: `Overall weighted average: ${overallScore ?? "n/a"}%
Current phase: ${phase ?? "n/a"}
Lowest modules: ${lowest.join(", ") || "none"}
\nModule scorecard:\n${moduleLines}`,
      temperature: 0.4,
      fallback: () =>
        `Your overall average is ${overallScore ?? "n/a"}%. ${
          lowest.length ? `Focus next on: ${lowest.join(", ")}.` : "Keep up the consistent effort across modules."
        } Suggested next steps:\n• Review lesson material for weaker modules.\n• Retake practice quizzes to lift quiz scores.\n• Ask your instructor for feedback on assignment drafts.`,
    });

    return NextResponse.json({
      success: true,
      result: result.text,
      simulated: result.simulated,
    });
  } catch (error: unknown) {
    console.error("[OPENROUTER ERROR] performance-insight failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
