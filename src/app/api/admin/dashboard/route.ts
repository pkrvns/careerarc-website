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

    // Run all queries in parallel
    const [
      todaySessions,
      totalRegistrations,
      counsellors,
      todayScans,
      todayFeedback,
      referralFunnel,
      activityFeed,
      todayAlerts,
      inventoryData,
    ] = await Promise.all([
      // 1. Today's sessions
      db.sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
          COUNT(*) FILTER (WHERE status IN ('in_progress', 'booked'))::int AS in_progress,
          COUNT(*) FILTER (WHERE status = 'no_show')::int AS no_show
        FROM sessions
        WHERE session_date = CURRENT_DATE
      `,

      // 2. Total registrations (progress toward 3,014 goal)
      db.sql`
        SELECT COUNT(*)::int AS total FROM registrations
      `,

      // 3. Counsellors with status
      db.sql`
        SELECT
          pu.id, pu.name, pu.cabin_id, pu.is_active,
          COALESCE(ts.sessions_done, 0)::int AS sessions_done,
          ts.current_student,
          ts.latest_status
        FROM portal_users pu
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*) FILTER (WHERE s.status = 'completed') AS sessions_done,
            (SELECT r.full_name FROM sessions s2 JOIN registrations r ON r.id = s2.student_id
             WHERE s2.counsellor_name = pu.name AND s2.session_date = CURRENT_DATE
             AND s2.status = 'in_progress' LIMIT 1) AS current_student,
            (SELECT s3.status FROM sessions s3
             WHERE s3.counsellor_name = pu.name AND s3.session_date = CURRENT_DATE
             ORDER BY s3.created_at DESC LIMIT 1) AS latest_status
          FROM sessions s
          WHERE s.counsellor_name = pu.name AND s.session_date = CURRENT_DATE
        ) ts ON true
        WHERE pu.role = 'counsellor' AND pu.is_active = true
        ORDER BY pu.name
      `,

      // 4. QR scans by stage today
      db.sql`
        SELECT scan_point, COUNT(*)::int AS count
        FROM qr_scans
        WHERE scanned_at::date = CURRENT_DATE
        GROUP BY scan_point
      `,

      // 5. Today's feedback averages
      db.sql`
        SELECT
          ROUND(AVG(nps)::numeric, 1) AS avg_nps,
          ROUND(AVG(rating)::numeric, 1) AS avg_rating
        FROM feedback
        WHERE created_at::date = CURRENT_DATE
      `,

      // 6. Referral funnel
      db.sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE reached_at IS NOT NULL)::int AS reached,
          COUNT(*) FILTER (WHERE crm_at IS NOT NULL)::int AS crm,
          COUNT(*) FILTER (WHERE admission_at IS NOT NULL)::int AS admission
        FROM reference_slips
      `,

      // 7. Activity feed (last 10)
      db.sql`
        SELECT user_name, action, entity_type, entity_id, metadata, created_at
        FROM activity_log
        ORDER BY created_at DESC
        LIMIT 10
      `,

      // 8. Today's alerts (reuse logic from alerts endpoint)
      (async () => {
        type Alert = { type: string; severity: string; message: string; timestamp: string };
        const alerts: Alert[] = [];
        const now = new Date().toISOString();

        const lowRating = await db.sql`
          SELECT s.counsellor_name, ROUND(AVG(f.rating)::numeric, 1) AS avg_rating
          FROM sessions s JOIN feedback f ON f.session_id = s.id
          WHERE f.created_at::date = CURRENT_DATE AND s.counsellor_name IS NOT NULL
          GROUP BY s.counsellor_name HAVING AVG(f.rating) < 6
        `;
        for (const row of lowRating.rows) {
          alerts.push({ type: "LOW_RATING", severity: "HIGH", message: `${row.counsellor_name} avg rating ${row.avg_rating}`, timestamp: now });
        }

        const noShows = await db.sql`SELECT COUNT(*)::int AS count FROM sessions WHERE status = 'no_show' AND session_date = CURRENT_DATE`;
        const nsc = noShows.rows[0]?.count || 0;
        if (nsc > 5) {
          alerts.push({ type: "NO_SHOW_SPIKE", severity: "MEDIUM", message: `${nsc} no-shows today`, timestamp: now });
        }

        // Inventory low-stock alerts
        try {
          const lowStock = await db.sql`SELECT item, current_stock, alert_threshold FROM career_kit_inventory WHERE current_stock < alert_threshold`;
          for (const row of lowStock.rows) {
            alerts.push({ type: "LOW_STOCK", severity: "HIGH", message: `${row.item}: only ${row.current_stock} left (threshold: ${row.alert_threshold})`, timestamp: now });
          }
        } catch { /* table may not exist yet */ }

        return alerts;
      })(),

      // 9. Career kit inventory
      (async () => {
        try {
          const inv = await db.sql`SELECT item, current_stock, alert_threshold FROM career_kit_inventory ORDER BY item`;
          return inv.rows;
        } catch {
          return [];
        }
      })(),
    ]);

    // Parse scan stages
    const scanStages: Record<string, number> = { gate: 0, test: 0, waiting: 0, guidance: 0, exit: 0 };
    for (const row of todayScans.rows) {
      const key = (row.scan_point || "").toLowerCase();
      if (key in scanStages) scanStages[key] = row.count;
    }

    // Stream popularity from sessions
    let streamPopularity: { stream: string; count: number }[] = [];
    try {
      const streams = await db.sql`
        SELECT recommended_streams AS stream, COUNT(*)::int AS count
        FROM sessions
        WHERE recommended_streams IS NOT NULL AND recommended_streams != ''
        GROUP BY recommended_streams
        ORDER BY count DESC
        LIMIT 5
      `;
      streamPopularity = streams.rows.map((r: Record<string, unknown>) => ({ stream: r.stream as string, count: r.count as number }));
    } catch { /* ignore */ }

    // Build counsellor grid
    const counsellorGrid = counsellors.rows.map((c: Record<string, unknown>) => {
      let status: "free" | "occupied" | "break" = "free";
      if (c.current_student) status = "occupied";
      if (!c.is_active) status = "break";
      return {
        name: c.name,
        cabin_id: c.cabin_id,
        status,
        current_student: c.current_student || null,
        sessions_done: c.sessions_done,
      };
    });

    const sessionRow = todaySessions.rows[0] || { total: 0, completed: 0, in_progress: 0, no_show: 0 };
    const feedbackRow = todayFeedback.rows[0] || { avg_nps: 0, avg_rating: 0 };
    const funnelRow = referralFunnel.rows[0] || { total: 0, reached: 0, crm: 0, admission: 0 };
    const totalReg = totalRegistrations.rows[0]?.total || 0;

    return NextResponse.json({
      todayBar: {
        students: sessionRow.total,
        capacity: 48,
        completed: sessionRow.completed,
        in_progress: sessionRow.in_progress,
        no_show: sessionRow.no_show,
        nps: parseFloat(feedbackRow.avg_nps) || 0,
        rating: parseFloat(feedbackRow.avg_rating) || 0,
      },
      progress: {
        guided: totalReg,
        target: 3014,
        percentage: totalReg > 0 ? Math.round((totalReg / 3014) * 100) : 0,
      },
      counsellorGrid,
      campusLive: scanStages,
      streamPopularity,
      referralFunnel: {
        reference: funnelRow.total,
        reached: funnelRow.reached,
        crm: funnelRow.crm,
        admission: funnelRow.admission,
      },
      careerKitStock: inventoryData,
      alerts: todayAlerts,
      activityFeed: activityFeed.rows,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
