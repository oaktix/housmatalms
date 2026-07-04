import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  // Simple security check using the service role key prefix
  if (!secret || secret !== "run_housmata_migration_2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = `
    ALTER TABLE public.student_progress
    ADD COLUMN IF NOT EXISTS selected_class text,
    ADD COLUMN IF NOT EXISTS phase2_meeting_url text,
    ADD COLUMN IF NOT EXISTS phase2_attendance text;
  `;

  const client = new Client({
    host: "db.ryzarcduqfhbvzilithu.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "Hous@Mata2026!",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query(sql);
    await client.end();
    return NextResponse.json({ success: true, message: "Migration executed successfully!", details: res });
  } catch (err: unknown) {
    try { await client.end(); } catch {}
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
