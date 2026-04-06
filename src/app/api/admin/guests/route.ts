import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

// GET — List all guest registrations
export async function GET(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const search = searchParams.get("search");

    let result;
    if (search) {
      result = await sql`
        SELECT * FROM guest_registrations
        WHERE guest_name ILIKE ${"%" + search + "%"} OR guest_mobile LIKE ${"%" + search + "%"} OR student_mobile LIKE ${"%" + search + "%"}
        ORDER BY registered_at DESC
      `;
    } else if (date) {
      result = await sql`
        SELECT * FROM guest_registrations WHERE preferred_date = ${date} ORDER BY registered_at DESC
      `;
    } else {
      result = await sql`SELECT * FROM guest_registrations ORDER BY registered_at DESC`;
    }

    const day1Count = await sql`SELECT COUNT(*) as count FROM guest_registrations WHERE preferred_date = 'day1'`;
    const day2Count = await sql`SELECT COUNT(*) as count FROM guest_registrations WHERE preferred_date = 'day2'`;
    const totalCount = await sql`SELECT COUNT(*) as count FROM guest_registrations`;

    return NextResponse.json({
      guests: result.rows,
      stats: {
        total: parseInt(totalCount.rows[0].count),
        day1: parseInt(day1Count.rows[0].count),
        day2: parseInt(day2Count.rows[0].count),
        day1Limit: 200,
        day2Limit: 200,
      },
    });
  } catch (error) {
    console.error("Error fetching guests:", error);
    return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 });
  }
}

// DELETE — Delete a guest registration
export async function DELETE(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    await sql`DELETE FROM guest_registrations WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting guest:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
