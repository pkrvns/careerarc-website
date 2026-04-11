import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

function parseCounsellorCookie(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/counsellor_token=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const token = parseCounsellorCookie(request);
    if (!token || !token.name) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { sessionId, studentId, institution, programme } =
      await request.json();

    if (!studentId || !institution || !programme) {
      return NextResponse.json(
        { error: "Student, institution, and programme are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Generate unique ref code: REF-2026-XXXX
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const refCode = `REF-2026-${randomDigits}`;

    // Check uniqueness
    const existing = await db.sql`
      SELECT id FROM reference_slips WHERE ref_code = ${refCode}
    `;
    if (existing.rows.length > 0) {
      // Retry with different random
      const retry = Math.floor(1000 + Math.random() * 9000);
      const retryCode = `REF-2026-${retry}`;

      await db.query(
        `INSERT INTO reference_slips (ref_code, student_id, counsellor_name, institution, programme)
         VALUES ($1, $2, $3, $4, $5)`,
        [retryCode, studentId, token.name, institution, programme]
      );

      await db.query(
        `INSERT INTO activity_log (user_name, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          token.name,
          "generated_reference_slip",
          "reference_slip",
          studentId,
          JSON.stringify({
            refCode: retryCode,
            institution,
            programme,
            sessionId,
          }),
        ]
      );

      return NextResponse.json({
        success: true,
        refCode: retryCode,
        institution,
        programme,
      });
    }

    await db.query(
      `INSERT INTO reference_slips (ref_code, student_id, counsellor_name, institution, programme)
       VALUES ($1, $2, $3, $4, $5)`,
      [refCode, studentId, token.name, institution, programme]
    );

    // Log to activity_log
    await db.query(
      `INSERT INTO activity_log (user_name, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        token.name,
        "generated_reference_slip",
        "reference_slip",
        studentId,
        JSON.stringify({ refCode, institution, programme, sessionId }),
      ]
    );

    return NextResponse.json({
      success: true,
      refCode,
      institution,
      programme,
    });
  } catch (error) {
    console.error("Reference slip error:", error);
    return NextResponse.json(
      { error: "Failed to generate reference slip" },
      { status: 500 }
    );
  }
}
