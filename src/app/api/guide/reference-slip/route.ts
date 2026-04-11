import { getDb } from "@/lib/db";
import { getPortalUserFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const token = getPortalUserFromCookie(request, "guide_token");
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

    // Generate unique ref code with INSERT ... ON CONFLICT to avoid TOCTOU race condition
    const MAX_ATTEMPTS = 5;
    let finalRefCode: string | null = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const candidateCode = `REF-2026-${randomDigits}`;

      const insertResult = await db.query(
        `INSERT INTO reference_slips (ref_code, student_id, counsellor_name, institution, programme, status)
         VALUES ($1, $2, $3, $4, $5, 'reference')
         ON CONFLICT (ref_code) DO NOTHING
         RETURNING id`,
        [candidateCode, studentId, token.name, institution, programme]
      );

      if (insertResult.rows.length > 0) {
        finalRefCode = candidateCode;
        break;
      }
    }

    if (!finalRefCode) {
      return NextResponse.json(
        { error: "Failed to generate a unique reference code. Please try again." },
        { status: 500 }
      );
    }

    // Log to activity_log
    await db.query(
      `INSERT INTO activity_log (user_name, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        token.name,
        "generated_reference_slip",
        "reference_slip",
        studentId,
        JSON.stringify({ refCode: finalRefCode, institution, programme, sessionId }),
      ]
    );

    return NextResponse.json({
      success: true,
      refCode: finalRefCode,
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
