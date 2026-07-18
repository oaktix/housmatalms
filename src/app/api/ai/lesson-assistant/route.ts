import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { context, question, mode } = await request.json();

    if (!context || typeof context !== "string" || !context.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing required field: context" },
        { status: 400 }
      );
    }

    const safeContext = context.slice(0, 12000);
    const isAsk = mode === "ask";

    if (isAsk && (!question || !question.trim())) {
      return NextResponse.json(
        { success: false, error: "Missing required field: question (for ask mode)" },
        { status: 400 }
      );
    }

    const result = await callOpenRouter(request, {
      system: isAsk
        ? `You are a friendly tutor for a real-estate training academy.
Answer the student's question using ONLY the lesson context provided below.
If the answer is not covered in the context, say so honestly and briefly.
Keep responses concise, encouraging, and free of jargon. Use 1-3 short paragraphs.
Write in plain, clean text. Do NOT use markdown, asterisks, em dashes, or horizontal rules.`
        : `You are a study coach for a real-estate training academy.
Summarize the lesson below into 5 clear bullet points of the key takeaways a trainee must remember.
Use plain language, keep each bullet to one sentence, and focus on actionable knowledge.
Write in plain, clean text. Do NOT use markdown, asterisks, em dashes, or horizontal rules. Use a normal hyphen for bullets.`,
      user: isAsk
        ? `Lesson context:\n${safeContext}\n\nStudent question: ${question.trim()}`
        : `Lesson content:\n${safeContext}`,
      temperature: isAsk ? 0.3 : 0.4,
      fallback: () =>
        isAsk
          ? `AI unavailable. Your question: "${question?.trim()}". Review the lesson text above for the answer.`
          : safeContext.slice(0, 400) + (safeContext.length > 400 ? "…" : ""),
    });

    return NextResponse.json({
      success: true,
      result: result.text,
      simulated: result.simulated,
    });
  } catch (error: unknown) {
    console.error("[OPENROUTER ERROR] lesson-assistant failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
