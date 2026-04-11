import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = getDb();

    const [regResult, arctResult] = await Promise.all([
      db.query("SELECT COUNT(*) as count FROM registrations"),
      db.query("SELECT COUNT(*) as count FROM arct_participants"),
    ]);

    return NextResponse.json({
      registered: parseInt(regResult.rows[0].count),
      arctTotal: parseInt(arctResult.rows[0].count),
    });
  } catch {
    return NextResponse.json({ registered: 0, arctTotal: 0 });
  }
}
