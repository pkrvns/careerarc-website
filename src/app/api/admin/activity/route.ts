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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 100;
    const offset = (page - 1) * limit;

    let result;
    if (type) {
      result = await db.sql`
        SELECT id, user_name, action, entity_type, entity_id, metadata, created_at
        FROM activity_log
        WHERE action = ${type}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      result = await db.sql`
        SELECT id, user_name, action, entity_type, entity_id, metadata, created_at
        FROM activity_log
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const countResult = type
      ? await db.sql`SELECT COUNT(*)::int AS count FROM activity_log WHERE action = ${type}`
      : await db.sql`SELECT COUNT(*)::int AS count FROM activity_log`;

    const totalCount = countResult.rows[0]?.count || 0;

    return NextResponse.json({
      activities: result.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Activity log error:", error);
    return NextResponse.json({ error: "Failed to fetch activity log" }, { status: 500 });
  }
}
