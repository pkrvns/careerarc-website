import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

function parseGuideCookie(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/guide_token=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const token = parseGuideCookie(request);
    if (!token || !token.name) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const db = getDb();
    const today = new Date().toISOString().split("T")[0];

    const result = await db.query(
      `SELECT
        s.id AS session_id,
        s.status,
        s.shift,
        s.notes,
        s.recommended_streams,
        s.cabin_id,
        s.session_date,
        r.id AS student_id,
        r.full_name AS student_name,
        r.mobile AS student_mobile,
        r.institution,
        r.class_year,
        r.stream_interest,
        ap.arct_roll,
        ap.status AS arct_status
      FROM sessions s
      LEFT JOIN registrations r ON s.student_id = r.id
      LEFT JOIN arct_participants ap ON r.mobile = ap.mobile
      WHERE s.counsellor_name = $1
        AND s.session_date = $2
      ORDER BY s.shift ASC, s.id ASC`,
      [token.name, today]
    );

    return NextResponse.json({
      success: true,
      sessions: result.rows,
      counsellorName: token.name,
      cabinId: token.cabinId,
    });
  } catch (error) {
    console.error("Schedule fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
