import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { question, options, correctOptionIndex, lessonContext } = await request.json();

    if (
      !question ||
      !Array.isArray(options) ||
      typeof correctOptionIndex !== "number"
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: question, options, correctOptionIndex" },
        { status: 400 }
      );
    }

    const correct = options[correctOptionIndex] ?? "";
    const safeContext = lessonContext ? String(lessonContext).slice(0, 4000) : "";

    const result = await callOpenRouter(request, {
      system: `You are a patient tutor for a real-estate training academy.
Explain why the correct answer is right, and briefly why a common wrong choice is tempting but incorrect.
Keep it to 2-3 encouraging sentences. Do not reveal the answer in a way that feels like a giveaway—name it as "the correct answer".`,
      user: `Question: ${question}
Options:
${options.map((o: string, i: number) => `${i + 1}. ${o}`).join("\n")}
Correct answer: ${correct}
${safeContext ? `Lesson context:\n${safeContext}` : ""}`,
      temperature: 0.4,
      fallback: () => `The correct answer is: ${correct}`,
    });

    return NextResponse.json({
      success: true,
      result: result.text,
      simulated: result.simulated,
    });
  } catch (error: unknown) {
    console.error("[OPENROUTER ERROR] explain-answer failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
