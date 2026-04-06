import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

// GET — List all student registrations
export async function GET(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // "day1" or "day2"
    const search = searchParams.get("search");

    let result;
    if (search) {
      result = await sql`
        SELECT * FROM registrations
        WHERE full_name ILIKE ${"%" + search + "%"} OR mobile LIKE ${"%" + search + "%"}
        ORDER BY registered_at DESC
      `;
    } else if (date) {
      result = await sql`
        SELECT * FROM registrations WHERE preferred_date = ${date} ORDER BY registered_at DESC
      `;
    } else {
      result = await sql`SELECT * FROM registrations ORDER BY registered_at DESC`;
    }

    // Get counts
    const day1Count = await sql`SELECT COUNT(*) as count FROM registrations WHERE preferred_date = 'day1'`;
    const day2Count = await sql`SELECT COUNT(*) as count FROM registrations WHERE preferred_date = 'day2'`;
    const totalCount = await sql`SELECT COUNT(*) as count FROM registrations`;

    return NextResponse.json({
      registrations: result.rows,
      stats: {
        total: parseInt(totalCount.rows[0].count),
        day1: parseInt(day1Count.rows[0].count),
        day2: parseInt(day2Count.rows[0].count),
      },
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}

// PUT — Update a registration
export async function PUT(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, fullName, mobile, institution, classYear, preferredDate, parentAttending, parentName } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
    }

    await sql`
      UPDATE registrations SET
        full_name = ${fullName},
        mobile = ${mobile},
        institution = ${institution},
        class_year = ${classYear},
        preferred_date = ${preferredDate},
        parent_attending = ${parentAttending || false},
        parent_name = ${parentName || null}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE — Delete a registration
export async function DELETE(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
    }

    await sql`DELETE FROM registrations WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting registration:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
