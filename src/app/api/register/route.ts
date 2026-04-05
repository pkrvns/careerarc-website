import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, mobile, institution, classYear, preferredDate, parentAttending, parentName } = body;

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
    const existing = await sql`
      SELECT id FROM registrations WHERE mobile = ${mobile}
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "This mobile number is already registered", alreadyRegistered: true },
        { status: 409 }
      );
    }

    // Insert registration
    const result = await sql`
      INSERT INTO registrations (full_name, mobile, institution, class_year, preferred_date, parent_attending, parent_name, registered_at)
      VALUES (${fullName}, ${mobile}, ${institution}, ${classYear}, ${preferredDate}, ${parentAttending || false}, ${parentName || null}, NOW())
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
