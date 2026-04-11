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

export async function POST(request: Request) {
  try {
    const volunteer = getVolunteerFromCookie(request);
    if (!volunteer) {
      return NextResponse.json(
        { error: "Not authenticated. Please log in." },
        { status: 401 }
      );
    }

    const { student_id, scan_point, scanned_by } = await request.json();

    if (!student_id || !scan_point || !scanned_by) {
      return NextResponse.json(
        { error: "student_id, scan_point, and scanned_by are required" },
        { status: 400 }
      );
    }

    const validScanPoints = ["Gate", "RIASEC", "Counselling", "Institution"];
    if (!validScanPoints.includes(scan_point)) {
      return NextResponse.json(
        { error: `Invalid scan_point. Must be one of: ${validScanPoints.join(", ")}` },
        { status: 400 }
      );
    }

    const db = getDb();

    // Record the scan in qr_scans
    const result = await db.sql`
      INSERT INTO qr_scans (student_id, scan_point, scanned_by, scanned_at)
      VALUES (${student_id}, ${scan_point}, ${scanned_by}, NOW())
      RETURNING id
    `;

    // Log activity
    await db.sql`
      INSERT INTO activity_log (user_name, action, entity_type, entity_id, metadata, created_at)
      VALUES (
        ${volunteer.name},
        'scanned_qr',
        'qr_scan',
        ${result.rows[0].id},
        ${JSON.stringify({ student_id, scan_point })},
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      message: `Scan recorded at ${scan_point}`,
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
