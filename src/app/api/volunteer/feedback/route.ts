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

    const { studentPhone, rating, nps, mostUseful, careerConsidering, suggestion } = await request.json();

    if (!studentPhone || !rating || !nps) {
      return NextResponse.json(
        { error: "Student phone, rating, and NPS are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Look up student by phone
    const student = await db.sql`
      SELECT id, full_name FROM registrations WHERE mobile = ${studentPhone}
    `;

    if (student.rows.length === 0) {
      return NextResponse.json(
        { error: "No student found with this phone number" },
        { status: 404 }
      );
    }

    const studentId = student.rows[0].id;
    const studentName = student.rows[0].full_name;

    // Find the latest session for this student (if any)
    const session = await db.sql`
      SELECT id FROM sessions WHERE student_id = ${studentId} ORDER BY created_at DESC LIMIT 1
    `;

    const sessionId = session.rows.length > 0 ? session.rows[0].id : null;

    // Insert feedback
    const result = await db.sql`
      INSERT INTO feedback (session_id, student_id, rating, nps, most_useful, career_considering, suggestion, created_at)
      VALUES (${sessionId}, ${studentId}, ${rating}, ${nps}, ${mostUseful || null}, ${careerConsidering || null}, ${suggestion || null}, NOW())
      RETURNING id
    `;

    // Log activity
    await db.sql`
      INSERT INTO activity_log (user_name, action, entity_type, entity_id, metadata, created_at)
      VALUES (${volunteer.name}, 'collected_feedback', 'feedback', ${result.rows[0].id}, ${JSON.stringify({ studentName, rating, nps })}, NOW())
    `;

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      message: `Feedback collected from ${studentName}`,
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
