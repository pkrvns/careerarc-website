import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const url = new URL(request.url);
    const startDate = url.searchParams.get("start");
    const endDate = url.searchParams.get("end");

    let query = `
      SELECT s.*,
        COALESCE(s.booked_count, 0)::int AS booked_count,
        s.max_students::int AS max_students
      FROM schedules s
    `;
    const params: string[] = [];

    if (startDate && endDate) {
      query += ` WHERE s.schedule_date >= $1 AND s.schedule_date <= $2`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` WHERE s.schedule_date >= $1`;
      params.push(startDate);
    }

    query += ` ORDER BY s.schedule_date ASC, s.shift_time ASC, s.cabin_id ASC`;

    const result = await db.query(query, params);

    // Also get counsellors for assignment
    const counsellors = await db.sql`
      SELECT id, name, cabin_id FROM portal_users
      WHERE role = 'counsellor' AND is_active = true
      ORDER BY name
    `;

    return NextResponse.json({
      schedules: result.rows,
      counsellors: counsellors.rows,
    });
  } catch (error) {
    console.error("Schedules GET error:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const body = await request.json();
    const { id, schedule_date, shift_time, counsellor_name, cabin_id, max_students, is_blocked } = body;

    if (!schedule_date || !shift_time) {
      return NextResponse.json({ error: "Date and shift are required" }, { status: 400 });
    }

    if (id) {
      // Update existing
      await db.query(
        `UPDATE schedules
         SET counsellor_name = $1, cabin_id = $2, max_students = $3
         WHERE id = $4`,
        [counsellor_name || null, cabin_id || null, max_students || 8, id]
      );
      return NextResponse.json({ success: true, action: "updated" });
    }

    // If is_blocked, create a blocked entry (max_students = 0)
    if (is_blocked) {
      await db.query(
        `INSERT INTO schedules (schedule_date, shift_time, counsellor_name, cabin_id, max_students, booked_count)
         VALUES ($1, $2, 'BLOCKED', $3, 0, 0)`,
        [schedule_date, shift_time, cabin_id || null]
      );
      return NextResponse.json({ success: true, action: "blocked" });
    }

    // Check for duplicate
    const existing = await db.query(
      `SELECT id FROM schedules WHERE schedule_date = $1 AND shift_time = $2 AND cabin_id = $3`,
      [schedule_date, shift_time, cabin_id || null]
    );

    if (existing.rows.length > 0) {
      // Update instead
      await db.query(
        `UPDATE schedules SET counsellor_name = $1, max_students = $2 WHERE id = $3`,
        [counsellor_name || null, max_students || 8, existing.rows[0].id]
      );
      return NextResponse.json({ success: true, action: "updated" });
    }

    await db.query(
      `INSERT INTO schedules (schedule_date, shift_time, counsellor_name, cabin_id, max_students, booked_count)
       VALUES ($1, $2, $3, $4, $5, 0)`,
      [schedule_date, shift_time, counsellor_name || null, cabin_id || null, max_students || 8]
    );

    // Log activity
    try {
      await db.query(
        `INSERT INTO activity_log (user_name, action, entity_type) VALUES ($1, $2, 'schedule')`,
        [user.username, `Schedule: ${counsellor_name || "TBD"} on ${schedule_date} (${shift_time}) cabin ${cabin_id || "N/A"}`]
      );
    } catch { /* ignore */ }

    return NextResponse.json({ success: true, action: "created" });
  } catch (error) {
    console.error("Schedules POST error:", error);
    return NextResponse.json({ error: "Failed to save schedule" }, { status: 500 });
  }
}

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

    await db.query(`DELETE FROM schedules WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Schedules DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
  }
}
