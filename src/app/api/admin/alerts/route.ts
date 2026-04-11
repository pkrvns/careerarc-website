import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

type Alert = {
  type: string;
  severity: "HIGH" | "MEDIUM" | "INFO";
  message: string;
  timestamp: string;
};

export async function GET(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const alerts: Alert[] = [];
    const now = new Date().toISOString();

    // 1. LOW RATING — any counsellor with avg rating < 6 today
    const lowRating = await db.sql`
      SELECT s.counsellor_name, ROUND(AVG(f.rating)::numeric, 1) AS avg_rating
      FROM sessions s
      JOIN feedback f ON f.session_id = s.id
      WHERE f.created_at::date = CURRENT_DATE
        AND s.counsellor_name IS NOT NULL
      GROUP BY s.counsellor_name
      HAVING AVG(f.rating) < 6
    `;
    for (const row of lowRating.rows) {
      alerts.push({
        type: "LOW_RATING",
        severity: "HIGH",
        message: `${row.counsellor_name} has an average rating of ${row.avg_rating} today — needs attention.`,
        timestamp: now,
      });
    }

    // 2. NO-SHOW SPIKE — more than 5 no-shows today
    const noShows = await db.sql`
      SELECT COUNT(*)::int AS count
      FROM sessions
      WHERE status = 'no_show' AND session_date = CURRENT_DATE
    `;
    const noShowCount = noShows.rows[0]?.count || 0;
    if (noShowCount > 5) {
      alerts.push({
        type: "NO_SHOW_SPIKE",
        severity: "MEDIUM",
        message: `${noShowCount} no-shows recorded today — significantly higher than usual.`,
        timestamp: now,
      });
    }

    // 3. MILESTONE — total counselled (every 100th)
    const totalCounselled = await db.sql`
      SELECT COUNT(*)::int AS count FROM sessions WHERE status = 'completed'
    `;
    const total = totalCounselled.rows[0]?.count || 0;
    if (total > 0 && total % 100 === 0) {
      alerts.push({
        type: "MILESTONE",
        severity: "INFO",
        message: `Milestone reached! ${total} students have been counselled.`,
        timestamp: now,
      });
    }
    // Also alert for the nearest passed milestone
    const lastMilestone = Math.floor(total / 100) * 100;
    if (lastMilestone > 0 && total % 100 !== 0) {
      alerts.push({
        type: "MILESTONE",
        severity: "INFO",
        message: `${lastMilestone} students counselled — next milestone at ${lastMilestone + 100}.`,
        timestamp: now,
      });
    }

    // 4. REFERENCE SPIKE — more than 10 references to a single institution today
    const refSpike = await db.sql`
      SELECT institution, COUNT(*)::int AS count
      FROM reference_slips
      WHERE created_at::date = CURRENT_DATE
      GROUP BY institution
      HAVING COUNT(*) > 10
      ORDER BY count DESC
    `;
    for (const row of refSpike.rows) {
      alerts.push({
        type: "REFERENCE_SPIKE",
        severity: "INFO",
        message: `${row.count} reference slips to ${row.institution} today — unusually high.`,
        timestamp: now,
      });
    }

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Alerts error:", error);
    return NextResponse.json({ error: "Failed to generate alerts" }, { status: 500 });
  }
}
