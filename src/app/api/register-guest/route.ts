import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

const GUEST_LIMIT_PER_DAY = 200;

export async function POST(request: Request) {
  try {
    const db = getDb();

    const body = await request.json();
    const { guestName, guestMobile, relationship, studentMobile, preferredDate } = body;

    // Validate required fields
    if (!guestName || !guestMobile || !relationship || !studentMobile || !preferredDate) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate mobile numbers
    if (!/^[6-9]\d{9}$/.test(guestMobile)) {
      return NextResponse.json(
        { error: "Invalid guest mobile number" },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(studentMobile)) {
      return NextResponse.json(
        { error: "Invalid student mobile number" },
        { status: 400 }
      );
    }

    // Verify the student is registered
    const student = await db.sql`
      SELECT id, full_name FROM registrations WHERE mobile = ${studentMobile}
    `;

    if (student.rows.length === 0) {
      return NextResponse.json(
        { error: "No registered student found with this mobile number. The student must register first." },
        { status: 404 }
      );
    }

    // Check duplicate guest registration
    const existingGuest = await db.sql`
      SELECT id FROM guest_registrations WHERE guest_mobile = ${guestMobile}
    `;

    if (existingGuest.rows.length > 0) {
      return NextResponse.json(
        { error: "This mobile number is already registered as a guest.", alreadyRegistered: true },
        { status: 409 }
      );
    }

    // Check guest capacity for the preferred date
    const guestCount = await db.sql`
      SELECT COUNT(*) as count FROM guest_registrations WHERE preferred_date = ${preferredDate}
    `;

    if (parseInt(guestCount.rows[0].count) >= GUEST_LIMIT_PER_DAY) {
      return NextResponse.json(
        { error: `Guest capacity for ${preferredDate === "day1" ? "Day 1 (25 April)" : "Day 2 (26 April)"} is full (${GUEST_LIMIT_PER_DAY} limit). Please try the other date.` },
        { status: 409 }
      );
    }

    // Insert guest registration
    const result = await db.sql`
      INSERT INTO guest_registrations (guest_name, guest_mobile, relationship, student_mobile, student_name, preferred_date, registered_at)
      VALUES (${guestName}, ${guestMobile}, ${relationship}, ${studentMobile}, ${student.rows[0].full_name}, ${preferredDate}, NOW())
      RETURNING id, preferred_date
    `;

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      date: result.rows[0].preferred_date,
      studentName: student.rows[0].full_name,
      message: "Guest registration successful!",
    });
  } catch (error) {
    console.error("Guest registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
