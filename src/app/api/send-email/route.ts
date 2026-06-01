import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generateEmailHtml } from "@/lib/emailTemplate";

export async function POST(request: Request) {
  try {
    const { recipient, subject, body } = await request.json();

    if (!recipient || !subject || !body) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: recipient, subject, body" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || "Housmata Academy <admissions@housmata.com.ng>";

    // Graceful fallback to simulation mode if Resend API key is not configured
    if (!apiKey) {
      console.log(`[RESEND SIMULATION] (No API key)
To: ${recipient}
Subject: ${subject}
Body: ${body}
`);
      return NextResponse.json({
        success: true,
        message: "Email simulated successfully (Resend API key not configured).",
      });
    }

    // Determine the host and protocol to construct the absolute origin for image assets
    const host = request.headers.get("host") || "";
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;

    // Generate the beautifully formatted email template wrapper
    const htmlBody = generateEmailHtml(subject, body, recipient, origin);

    // Initialize Resend
    const resend = new Resend(apiKey);

    // Send the email via Resend (with both html template and plaintext fallback)
    const { data, error } = await resend.emails.send({
      from,
      to: recipient,
      subject,
      text: body,
      html: htmlBody,
    });

    if (error) {
      console.error("[RESEND ERROR] Failed to send email via Resend:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`[RESEND SUCCESS] Email sent to ${recipient}. ID: ${data?.id}`);
    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (error: unknown) {
    console.error("[RESEND ERROR] Failed to send email:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
