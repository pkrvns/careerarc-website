import { getDb } from "@/lib/db";
import { generatePortalToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = rateLimit(`rep-login:${ip}`, 10, 15 * 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { phone } = await request.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = await db.sql`
      SELECT name, phone, role, department
      FROM portal_users
      WHERE phone = ${phone} AND role = 'rep' AND is_active = TRUE
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "No active institution representative found with this phone number" },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    const response = NextResponse.json({
      success: true,
      name: user.name,
      department: user.department,
    });

    response.cookies.set("rep_token", generatePortalToken({
      name: user.name,
      phone: user.phone,
      department: user.department,
      role: "rep",
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 12, // 12 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Rep login error:", error);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
