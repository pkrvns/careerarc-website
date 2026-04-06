import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

// GET — Get ARC-T participant count
export async function GET(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const result = await db.sql`SELECT COUNT(*) as count FROM arct_participants`;
    return NextResponse.json({
      total: parseInt(result.rows[0].count),
    });
  } catch (error) {
    console.error("Error fetching arct participants:", error);
    return NextResponse.json({ total: 0 });
  }
}
