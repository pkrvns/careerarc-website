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

    const { name, phone, institution, classYear } = await request.json();

    if (!name || !phone || !institution || !classYear) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid mobile number" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check for duplicate
    const existing = await db.sql`
      SELECT id FROM registrations WHERE mobile = ${phone}
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "This mobile number is already registered", alreadyRegistered: true },
        { status: 409 }
      );
    }

    // Insert walk-in registration
    const result = await db.sql`
      INSERT INTO registrations (full_name, mobile, institution, class_year, preferred_date, has_smartphone, registered_at)
      VALUES (${name}, ${phone}, ${institution}, ${classYear}, 'walkin', FALSE, NOW())
      RETURNING id
    `;

    // Log activity
    await db.sql`
      INSERT INTO activity_log (user_name, action, entity_type, entity_id, metadata, created_at)
      VALUES (${volunteer.name}, 'registered_walkin', 'registration', ${result.rows[0].id}, ${JSON.stringify({ studentName: name, phone })}, NOW())
    `;

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      message: `Walk-in registered: ${name}`,
    });
  } catch (error) {
    console.error("Walk-in registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
