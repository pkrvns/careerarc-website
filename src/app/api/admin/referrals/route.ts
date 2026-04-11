import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getDb();

    const result = await db.query(`
      SELECT rs.*, r.full_name as student_name, r.mobile as student_phone
      FROM reference_slips rs
      LEFT JOIN registrations r ON rs.student_id = r.id
      ORDER BY rs.created_at DESC
      LIMIT 200
    `);

    const statsResult = await db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'reached' OR status = 'crm' OR status = 'admission') as reached,
        COUNT(*) FILTER (WHERE status = 'crm' OR status = 'admission') as crm,
        COUNT(*) FILTER (WHERE status = 'admission') as admission
      FROM reference_slips
    `);

    return NextResponse.json({
      referrals: result.rows,
      stats: {
        total: parseInt(statsResult.rows[0].total),
        reached: parseInt(statsResult.rows[0].reached),
        crm: parseInt(statsResult.rows[0].crm),
        admission: parseInt(statsResult.rows[0].admission),
      },
    });
  } catch {
    return NextResponse.json({ referrals: [], stats: { total: 0, reached: 0, crm: 0, admission: 0 } });
  }
}
