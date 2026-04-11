import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

function getVolunteerFromCookie(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/volunteer_token=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const volunteer = getVolunteerFromCookie(request);
    if (!volunteer) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const db = getDb();

    // Today's scans
    const scans = await db.sql`
      SELECT COUNT(*) as count FROM qr_scans WHERE scanned_at::date = CURRENT_DATE
    `;

    // Today's feedback
    const feedbackCount = await db.sql`
      SELECT COUNT(*) as count FROM feedback WHERE created_at::date = CURRENT_DATE
    `;

    // Today's registrations
    const regCount = await db.sql`
      SELECT COUNT(*) as count FROM registrations WHERE registered_at::date = CURRENT_DATE
    `;

    // Recent activity (last 20)
    const activity = await db.sql`
      SELECT user_name, action, entity_type, entity_id, metadata, created_at
      FROM activity_log
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({
      scansToday: parseInt(scans.rows[0].count) || 0,
      feedbackToday: parseInt(feedbackCount.rows[0].count) || 0,
      registrationsToday: parseInt(regCount.rows[0].count) || 0,
      recentActivity: activity.rows,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
