import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = rateLimit(`register:${ip}`, 20, 60 * 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const db = getDb();

    const body = await request.json();
    const { fullName, mobile, institution, classYear, preferredDate, parentAttending, parentName, hasSmartphone, streamInterest } = body;

    // Validate required fields
    if (!fullName || !mobile || !institution || !classYear || !preferredDate) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Validate mobile number
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: "Invalid mobile number" },
        { status: 400 }
      );
    }

    // Check for duplicate registration
    const existing = await db.sql`
      SELECT id FROM registrations WHERE mobile = ${mobile}
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "This mobile number is already registered", alreadyRegistered: true },
        { status: 409 }
      );
    }

    // Insert registration
    const result = await db.sql`
      INSERT INTO registrations (full_name, mobile, institution, class_year, preferred_date, parent_attending, parent_name, has_smartphone, stream_interest, registered_at)
      VALUES (${fullName}, ${mobile}, ${institution}, ${classYear}, ${preferredDate}, ${parentAttending || false}, ${parentName || null}, ${hasSmartphone !== "false"}, ${streamInterest || null}, NOW())
      RETURNING id, preferred_date
    `;

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      date: result.rows[0].preferred_date,
      message: "Registration successful!",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
