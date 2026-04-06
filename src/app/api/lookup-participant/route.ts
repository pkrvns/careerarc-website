import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

// GET — Look up ARC-T participant by mobile number
export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get("mobile");

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json({ error: "Valid mobile number required" }, { status: 400 });
    }

    const result = await db.sql`
      SELECT name, institution, arct_roll, status FROM arct_participants WHERE mobile = ${mobile}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ found: false });
    }

    const participant = result.rows[0];
    return NextResponse.json({
      found: true,
      name: participant.name,
      institution: participant.institution,
      arctRoll: participant.arct_roll,
      status: participant.status,
    });
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
