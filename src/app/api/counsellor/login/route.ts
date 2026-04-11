import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = await db.sql`
      SELECT name, phone, role, cabin_id, specialization
      FROM portal_users
      WHERE phone = ${phone} AND role = 'counsellor' AND is_active = TRUE
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No active counsellor found with this phone number" },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    const response = NextResponse.json({
      success: true,
      name: user.name,
      cabinId: user.cabin_id,
      specialization: user.specialization,
    });

    response.cookies.set(
      "counsellor_token",
      JSON.stringify({
        name: user.name,
        phone: user.phone,
        cabinId: user.cabin_id,
      }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 12, // 12 hours
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error("Counsellor login error:", error);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
