import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { recipient, subject, body } = await request.json();

    if (!recipient || !subject || !body) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: recipient, subject, body" },
        { status: 400 }
      );
    }

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM || "Housmata Academy <admissions@housmata.co>";

    // Graceful fallback to simulation mode if SMTP credentials are not configured
    if (!host || !user || !pass) {
      console.log(`[SMTP SIMULATION] (No credentials)
To: ${recipient}
Subject: ${subject}
Body: ${body}
`);
      return NextResponse.json({
        success: true,
        message: "Email simulated successfully (SMTP not configured).",
      });
    }

    // Create Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: false, // true for port 465, false for other ports like 587 (STARTTLS)
      auth: {
        user,
        pass,
      },
      tls: {
        // AWS SES SMTP requires TLS
        rejectUnauthorized: true,
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from,
      to: recipient,
      subject,
      text: body,
    });

    console.log(`[SMTP SUCCESS] Email sent to ${recipient}. MessageID: ${info.messageId}`);
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error: unknown) {
    console.error("[SMTP ERROR] Failed to send email via AWS SES SMTP:", error);
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
