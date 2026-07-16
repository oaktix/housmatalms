import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { feedback } = await request.json();

    if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing required field: feedback" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

    // Graceful fallback to a locally restructured note if OpenRouter is not configured.
    if (!apiKey) {
      const restructured = buildFallbackNote(feedback);
      console.log(`[OPENROUTER SIMULATION] (No API key) restructured feedback:
${restructured}`);
      return NextResponse.json({ success: true, restructured });
    }

    const host = request.headers.get("host") || "";
    const protocol = host.includes("localhost") ? "http" : "https";
    const referer = `${protocol}://${host}`;

    const systemPrompt = `You are an experienced instructional coach for a real-estate training academy.
Your job is to restructure an instructor's raw evaluation notes into clear, professional, and constructive coaching feedback for a student.

Guidelines:
- Rewrite ONLY the instructor's draft notes provided below. Do not invent new criticisms, scores, or facts.
- Use clear sections where relevant: "Strengths", "Areas for Improvement / Corrections", and "Next Steps / Coaching Tips".
- Preserve the instructor's intent, tone, and any encouragement. Do not invent scores or grades.
- Be concise, specific, and well-organized. Avoid generic platitudes.
- Write in a supportive, professional voice suitable for a student receiving graded work.`;

    const userPrompt = `Instructor's draft notes:\n${feedback.trim()}`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "Housmata LMS",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[OPENROUTER ERROR] Non-OK response:", res.status, text);
      return NextResponse.json(
        { success: false, error: `OpenRouter request failed (${res.status})` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const restructured: string | undefined =
      data?.choices?.[0]?.message?.content?.trim();

    if (!restructured) {
      console.error("[OPENROUTER ERROR] Unexpected response shape:", data);
      return NextResponse.json(
        { success: false, error: "OpenRouter returned an empty response" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, restructured });
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
