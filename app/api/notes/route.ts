import { pool } from "@/lib/db";
import { z } from "zod";

const NoteIn = z.object({
  user_email: z.string().email().optional(),
  body: z.string().min(1).max(2000),
});

export async function GET() {
  const { rows } = await pool.query(
    "SELECT id, user_email, body, created_at FROM notes ORDER BY created_at DESC LIMIT 20"
  );
  return Response.json(rows);
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = NoteIn.parse(json);

    await pool.query(
      "INSERT INTO notes (user_email, body) VALUES ($1, $2)",
      [data.user_email ?? null, data.body]
    );

    return new Response(null, { status: 201 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "invalid request" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }
}
