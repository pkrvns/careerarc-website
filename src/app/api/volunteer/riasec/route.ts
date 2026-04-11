import { getDb } from "@/lib/db";
import { getPortalUserFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const volunteer = getPortalUserFromCookie(request, "volunteer_token");
    if (!volunteer) {
      return NextResponse.json(
        { error: "Not authenticated. Please log in." },
        { status: 401 }
      );
    }

    const { student_mobile, scores, top_types } = await request.json();

    if (!student_mobile || !scores || !top_types) {
      return NextResponse.json(
        { error: "student_mobile, scores, and top_types are required" },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(student_mobile)) {
      return NextResponse.json(
        { error: "Invalid mobile number" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Look up student
    const student = await db.sql`
      SELECT id, full_name FROM registrations WHERE mobile = ${student_mobile}
    `;

    if (student.rows.length === 0) {
      return NextResponse.json(
        { error: "No student found with this phone number. Register them first." },
        { status: 404 }
      );
    }

    const studentId = student.rows[0].id;
    const studentName = student.rows[0].full_name;

    // Store RIASEC result in activity_log
    await db.sql`
      INSERT INTO activity_log (user_name, action, entity_type, entity_id, metadata, created_at)
      VALUES (
        ${volunteer.name},
        'riasec_completed',
        'registration',
        ${studentId},
        ${JSON.stringify({ studentName, student_mobile, scores, top_types })},
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      message: `RIASEC result saved for ${studentName}`,
      studentName,
    });
  } catch (error) {
    console.error("RIASEC save error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
