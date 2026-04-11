import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

// GET — List ARC-T participants with search, filters, pagination
export async function GET(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    const institution = url.searchParams.get("institution") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Build WHERE clauses
    const conditions: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(LOWER(name) LIKE $${paramIndex} OR mobile LIKE $${paramIndex + 1} OR LOWER(arct_roll) LIKE $${paramIndex + 2})`);
      values.push(`%${search.toLowerCase()}%`, `%${search}%`, `%${search.toLowerCase()}%`);
      paramIndex += 3;
    }
    if (status) {
      conditions.push(`LOWER(status) = $${paramIndex}`);
      values.push(status.toLowerCase());
      paramIndex += 1;
    }
    if (institution) {
      conditions.push(`LOWER(institution) LIKE $${paramIndex}`);
      values.push(`%${institution.toLowerCase()}%`);
      paramIndex += 1;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM arct_participants ${whereClause}`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const dataQuery = `SELECT id, name, father_name, institution, mobile, arct_roll, status, imported_at
      FROM arct_participants ${whereClause}
      ORDER BY id ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const dataResult = await db.query(dataQuery, [...values, limit, offset]);

    // Get stats
    const statsResult = await db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE LOWER(status) = 'complete') as complete,
        COUNT(*) FILTER (WHERE LOWER(status) = 'pending') as pending
      FROM arct_participants
    `);

    // Get distinct institutions for filter dropdown
    const instResult = await db.query(`
      SELECT DISTINCT institution FROM arct_participants
      WHERE institution IS NOT NULL AND institution != ''
      ORDER BY institution ASC
    `);

    return NextResponse.json({
      participants: dataResult.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        total: parseInt(statsResult.rows[0].total),
        complete: parseInt(statsResult.rows[0].complete),
        pending: parseInt(statsResult.rows[0].pending),
      },
      institutions: instResult.rows.map((r: { institution: string }) => r.institution),
    });
  } catch (error) {
    console.error("Error fetching arct participants:", error);
    return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 });
  }
}

// PUT — Update a participant
export async function PUT(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const body = await request.json();
    const { id, name, father_name, institution, mobile, status } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.query(
      `UPDATE arct_participants SET name = $1, father_name = $2, institution = $3, mobile = $4, status = $5 WHERE id = $6`,
      [name, father_name, institution, mobile, status, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating participant:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE — Delete a participant
export async function DELETE(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.query(`DELETE FROM arct_participants WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting participant:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
