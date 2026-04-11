import { getDb } from "@/lib/db";
import { getPortalUserFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const volunteer = getPortalUserFromCookie(request, "volunteer_token");
    if (!volunteer) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("id");
    const mobile = searchParams.get("mobile");

    if (!studentId && !mobile) {
      return NextResponse.json(
        { error: "Provide id or mobile query parameter" },
        { status: 400 }
      );
    }

    const db = getDb();

    let result;
    if (studentId) {
      result = await db.sql`
        SELECT id, full_name, mobile, institution, class_year
        FROM registrations WHERE id = ${parseInt(studentId)}
      `;
    } else {
      result = await db.sql`
        SELECT id, full_name, mobile, institution, class_year
        FROM registrations WHERE mobile = ${mobile}
      `;
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const s = result.rows[0];
    return NextResponse.json({
      id: s.id,
      name: s.full_name,
      mobile: s.mobile,
      institution: s.institution,
      classYear: s.class_year,
    });
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json(
      { error: "Failed to look up student" },
      { status: 500 }
    );
  }
}
