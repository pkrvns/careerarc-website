import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

// POST — Bulk import ARC-T participants
export async function POST(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const { participants } = await request.json();

    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json({ error: "No participants data provided" }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;

    // Insert in batches of 50
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      try {
        await db.sql`
          INSERT INTO arct_participants (name, father_name, institution, mobile, arct_roll, status)
          VALUES (${p.name}, ${p.father_name || null}, ${p.institution || null}, ${p.mobile || null}, ${p.arct_roll || null}, ${p.status || 'pending'})
          ON CONFLICT (arct_roll) DO NOTHING
        `;
        imported++;
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: participants.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import participants" }, { status: 500 });
  }
}
