import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { topic, date } = await request.json();

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing required field: topic" },
        { status: 400 }
      );
    }

    const result = await callOpenRouter(request, {
      system: `You are a trainer for a real-estate training academy.
Given a live-class topic, produce:
1. A short 30-minute agenda with 3-4 timed blocks.
2. A brief cohort announcement blurb (prefixed "Announcement:") inviting trainees, ~2 sentences.
Keep it practical and encouraging.`,
      user: `Class topic: ${topic.trim()}${date ? `\nScheduled: ${date}` : ""}`,
      temperature: 0.5,
      fallback: () =>
        `Agenda for "${topic.trim()}":\n- 0:00 Welcome & objectives (5 min)\n- 0:05 Core walkthrough (15 min)\n- 0:20 Guided practice (10 min)\n- 0:30 Recap & Q&A (5 min)\n\nAnnouncement: Join our live class on "${topic.trim()}" — bring your questions and a recent assignment for live feedback.`,
    });

    return NextResponse.json({
      success: true,
      result: result.text,
      simulated: result.simulated,
    });
  } catch (error: unknown) {
    console.error("[OPENROUTER ERROR] generate-agenda failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
