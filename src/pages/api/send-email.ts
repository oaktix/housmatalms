import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

/**
 * API route to send real emails via SMTP (e.g., AWS SES).
 * Expects JSON body: { recipient: string, subject: string, body: string }
 * Uses environment variables for SMTP configuration:
 *   EMAIL_SMTP_HOST, EMAIL_SMTP_PORT, EMAIL_SMTP_USER, EMAIL_SMTP_PASS, EMAIL_FROM
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { recipient, subject, body } = req.body ?? {};
  if (!recipient || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: Number(process.env.EMAIL_SMTP_PORT ?? 587),
    secure: Number(process.env.EMAIL_SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SMTP_USER,
      pass: process.env.EMAIL_SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? 'no-reply@housmata.com',
      to: recipient,
      subject,
      html: body,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Email API] Failed to send email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
