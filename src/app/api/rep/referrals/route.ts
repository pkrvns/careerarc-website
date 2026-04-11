import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

function getRepFromCookie(request: Request): { name: string; phone: string; department: string } | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.match(/rep_token=([^;]+)/);
  if (!match) return null;

  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

// GET — Fetch referrals for this rep's institution
export async function GET(request: Request) {
  const rep = getRepFromCookie(request);
  if (!rep) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    const result = await db.sql`
      SELECT
        rs.id,
        rs.ref_code,
        rs.student_id,
        rs.counsellor_name,
        rs.institution,
        rs.programme,
        rs.status,
        rs.rep_name,
        rs.reached_at,
        rs.crm_at,
        rs.admission_at,
        rs.created_at,
        r.full_name AS student_name,
        r.mobile AS student_phone
      FROM reference_slips rs
      LEFT JOIN registrations r ON rs.student_id = r.id
      WHERE rs.institution = ${rep.department}
      ORDER BY rs.created_at DESC
    `;

    // Compute funnel stats
    const rows = result.rows;
    const total = rows.length;
    const reached = rows.filter((r) => ['reached', 'crm', 'admission'].includes(String(r.status))).length;
    const crm = rows.filter((r) => ['crm', 'admission'].includes(String(r.status))).length;
    const admission = rows.filter((r) => String(r.status) === 'admission').length;

    return NextResponse.json({
      referrals: rows,
      stats: { total, reached, crm, admission },
    });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
  }
}

// PUT — Update referral status
export async function PUT(request: Request) {
  const rep = getRepFromCookie(request);
  if (!rep) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const { id, status, notes } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const validStatuses = ["reference", "reached", "crm", "admission"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify this referral belongs to rep's institution
    const check = await db.sql`
      SELECT id FROM reference_slips WHERE id = ${id} AND institution = ${rep.department}
    `;
    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    // Update status and corresponding timestamp
    if (status === "reached") {
      await db.sql`
        UPDATE reference_slips
        SET status = ${status}, rep_name = ${rep.name}, reached_at = NOW()
        WHERE id = ${id}
      `;
    } else if (status === "crm") {
      await db.sql`
        UPDATE reference_slips
        SET status = ${status}, rep_name = ${rep.name}, crm_at = NOW()
        WHERE id = ${id}
      `;
    } else if (status === "admission") {
      await db.sql`
        UPDATE reference_slips
        SET status = ${status}, rep_name = ${rep.name}, admission_at = NOW()
        WHERE id = ${id}
      `;
    } else {
      await db.sql`
        UPDATE reference_slips
        SET status = ${status}, rep_name = ${rep.name}
        WHERE id = ${id}
      `;
    }

    // Log activity
    await db.sql`
      INSERT INTO activity_log (user_name, action, entity_type, entity_id, metadata)
      VALUES (
        ${rep.name},
        ${"status_update_to_" + status},
        'reference_slip',
        ${id},
        ${JSON.stringify({ notes: notes || "", previous_status: "", new_status: status })}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating referral:", error);
    return NextResponse.json({ error: "Failed to update referral" }, { status: 500 });
  }
}
