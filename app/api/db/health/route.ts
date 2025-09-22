import { pool } from '@/lib/db';
export async function GET() {
  const r = await pool.query('select 1 as ok');
  return new Response(JSON.stringify(r.rows[0]), { headers: { 'content-type': 'application/json' } });
}
