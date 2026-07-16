import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { stats, sampleResponses } = await request.json();

    if (!stats || typeof stats !== "object") {
      return NextResponse.json(
        { success: false, error: "Missing required field: stats" },
        { status: 400 }
      );
    }

    const statsText = Object.entries(stats)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n");

    const sampleText = Array.isArray(sampleResponses) && sampleResponses.length > 0
      ? `\n\nSample free-text responses:\n${sampleResponses.slice(0, 10).join("\n")}`
      : "";

    const result = await callOpenRouter(request, {
      system: `You are a outcomes analyst for a real-estate training academy.
Given pre-course vs post-course survey statistics, write a 2-3 sentence outcome narrative for administrators.
Highlight the biggest growth, note any anomalies or areas with low post-course scores, and keep it professional and data-driven. No more than ~120 words.`,
      user: `Survey statistics:\n${statsText}${sampleText}`,
      temperature: 0.4,
      fallback: () =>
        `Outcome summary (auto): overall baseline ${stats.overallPre ?? "?"}/5.0 rose to ${stats.overallPost ?? "?"}/5.0. Highest growth dimension: ${stats.maxGrowthTopic ?? "N/A"}. Knowledge gap reduction: ${stats.gapReduction ?? "?"}}%.`,
    });

    return NextResponse.json({
      success: true,
      result: result.text,
      simulated: result.simulated,
    });
  } catch (error: unknown) {
    console.error("[OPENROUTER ERROR] summarize-surveys failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
