import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

// GET — List certificates with filters
export async function GET(request: Request) {
  const user = authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getDb();
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "";
    const status = url.searchParams.get("status") || "";

    let query = `
      SELECT c.*, r.full_name as student_name, r.mobile as student_phone, r.institution
      FROM certificates c
      LEFT JOIN registrations r ON c.student_id = r.id
    `;
    const conditions: string[] = [];
    const values: (string | number)[] = [];
    let idx = 1;

    if (type) {
      conditions.push(`c.cert_type = $${idx}`);
      values.push(type);
      idx++;
    }
    if (status) {
      conditions.push(`c.status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
    query += " ORDER BY c.created_at DESC LIMIT 200";

    const result = await db.query(query, values);

    const statsResult = await db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'generated') as generated,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE cert_type = 'arct_counselling') as arct_counselling,
        COUNT(*) FILTER (WHERE cert_type = 'guest') as guest,
        COUNT(*) FILTER (WHERE cert_type = 'merit') as merit,
        COUNT(*) FILTER (WHERE cert_type = 'teacher') as teacher,
        COUNT(*) FILTER (WHERE cert_type = 'counsellor') as counsellor_cert,
        COUNT(*) FILTER (WHERE cert_type = 'volunteer') as volunteer_cert
      FROM certificates
    `);

    return NextResponse.json({
      certificates: result.rows,
      stats: {
        total: parseInt(statsResult.rows[0].total),
        generated: parseInt(statsResult.rows[0].generated),
        sent: parseInt(statsResult.rows[0].sent),
        byType: {
          arct_counselling: parseInt(statsResult.rows[0].arct_counselling),
          guest: parseInt(statsResult.rows[0].guest),
          merit: parseInt(statsResult.rows[0].merit),
          teacher: parseInt(statsResult.rows[0].teacher),
          counsellor: parseInt(statsResult.rows[0].counsellor_cert),
          volunteer: parseInt(statsResult.rows[0].volunteer_cert),
        },
      },
    });
  } catch {
    return NextResponse.json({ certificates: [], stats: { total: 0, generated: 0, sent: 0, byType: {} } });
  }
}

// POST — Generate certificate(s)
export async function POST(request: Request) {
  const user = authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getDb();
    const { studentId, certType, batch } = await request.json();

    if (batch) {
      // Batch generate for all completed sessions today
      const sessions = await db.query(`
        SELECT s.id as session_id, s.student_id, s.counsellor_name, s.recommended_streams, s.session_date,
               r.full_name, r.institution
        FROM sessions s
        JOIN registrations r ON s.student_id = r.id
        WHERE s.status = 'completed'
        AND s.session_date = CURRENT_DATE
        AND s.student_id NOT IN (SELECT student_id FROM certificates WHERE cert_type = 'arct_counselling' AND student_id IS NOT NULL)
      `);

      let generated = 0;
      for (const s of sessions.rows) {
        const certData = JSON.stringify({
          studentName: s.full_name,
          institution: s.institution,
          counsellor: s.counsellor_name,
          streams: s.recommended_streams,
          date: s.session_date,
          tagline: "From Aptitude to Understanding",
        });

        await db.query(
          `INSERT INTO certificates (student_id, cert_type, certificate_data, status) VALUES ($1, $2, $3, 'generated')`,
          [s.student_id, "arct_counselling", certData]
        );
        generated++;
      }

      return NextResponse.json({ success: true, generated });
    }

    // Single certificate
    if (!studentId || !certType) {
      return NextResponse.json({ error: "studentId and certType required" }, { status: 400 });
    }

    const student = await db.query("SELECT * FROM registrations WHERE id = $1", [studentId]);
    if (student.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const s = student.rows[0];
    const session = await db.query(
      "SELECT * FROM sessions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1",
      [studentId]
    );

    const certData = JSON.stringify({
      studentName: s.full_name,
      institution: s.institution,
      counsellor: session.rows[0]?.counsellor_name || "",
      streams: session.rows[0]?.recommended_streams || "",
      date: session.rows[0]?.session_date || new Date().toISOString().split("T")[0],
      tagline: "From Aptitude to Understanding",
      type: certType,
    });

    const result = await db.query(
      `INSERT INTO certificates (student_id, cert_type, certificate_data, status) VALUES ($1, $2, $3, 'generated') RETURNING id`,
      [studentId, certType, certData]
    );

    return NextResponse.json({ success: true, certificateId: result.rows[0].id });
  } catch (error) {
    console.error("Certificate error:", error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
