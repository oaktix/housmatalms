import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { title, body, mode, audience } = await request.json();

    const isImprove = mode === "improve";
    const hasInput = (title && title.trim()) || (body && body.trim());

    if (!isImprove && !hasInput) {
      return NextResponse.json(
        { success: false, error: "Provide a topic (title/body) to draft, or existing body to improve." },
        { status: 400 }
      );
    }
    if (isImprove && (!body || !body.trim())) {
      return NextResponse.json(
        { success: false, error: "Missing required field: body (to improve)" },
        { status: 400 }
      );
    }

    const audienceText = audience
      ? `Target audience: ${audience}.`
      : "Target audience: all enrolled trainees.";

    const result = await callOpenRouter(request, {
      system: isImprove
        ? `You are a communications editor for a real-estate training academy.
Rewrite the announcement below to be clearer, warmer, and more professional while preserving its meaning and any key facts (dates, links, actions). Keep it concise. ${audienceText}`
        : `You are a communications writer for a real-estate training academy.
Write a polished, friendly broadcast announcement from the brief provided. Include a short subject line (prefixed "Subject:") and 2-4 sentences of body. ${audienceText}`,
      user: isImprove
        ? `Current announcement:\n${body.trim()}`
        : `Brief:\n${[title, body].filter(Boolean).join("\n")}`,
      temperature: 0.5,
      fallback: () =>
        isImprove
          ? body.trim()
          : `Subject: ${title?.trim() || "Academy Announcement"}\n\n${body?.trim() || "Details to follow. Please check back soon."}`,
    });

    return NextResponse.json({
      success: true,
      result: result.text,
      simulated: result.simulated,
    });
  } catch (error: unknown) {
    console.error("[OPENROUTER ERROR] draft-announcement failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
