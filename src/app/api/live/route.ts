import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = getDb();
    const today = new Date().toISOString().split("T")[0];

    // Run all queries in parallel
    const [
      campusFlowResult,
      counsellorsResult,
      sessionsTodayResult,
      feedbackResult,
      noShowsResult,
      referencesResult,
      activityResult,
      cumulativeResult,
    ] = await Promise.all([
      // Campus flow: count students at each scan point today
      db.query(`
        SELECT scan_point, COUNT(*) as count
        FROM qr_scans
        WHERE scanned_at::date = CURRENT_DATE
        GROUP BY scan_point
      `),

      // Counsellors with current status
      db.query(`
        SELECT
          pu.name,
          pu.cabin_id,
          COALESCE(
            (SELECT s.status FROM sessions s
             WHERE s.counsellor_name = pu.name
               AND s.session_date = $1
               AND s.status = 'in_progress'
             LIMIT 1),
            'free'
          ) AS current_status,
          (SELECT r.full_name FROM sessions s
           JOIN registrations r ON s.student_id = r.id
           WHERE s.counsellor_name = pu.name
             AND s.session_date = $1
             AND s.status = 'in_progress'
           LIMIT 1) AS current_student,
          (SELECT COUNT(*) FROM sessions s
           WHERE s.counsellor_name = pu.name
             AND s.session_date = $1
             AND s.status IN ('completed', 'in_progress')
          ) AS sessions_today
        FROM portal_users pu
        WHERE pu.role = 'counsellor' AND pu.is_active = TRUE
        ORDER BY pu.name ASC
      `, [today]),

      // Total sessions today
      db.query(`
        SELECT COUNT(*) as count FROM sessions
        WHERE session_date = $1
      `, [today]),

      // Feedback stats today
      db.query(`
        SELECT
          AVG(rating) as avg_rating,
          AVG(nps) as avg_nps,
          COUNT(*) as testimonial_count
        FROM feedback
        WHERE created_at::date = CURRENT_DATE
      `),

      // No-shows today
      db.query(`
        SELECT COUNT(*) as count FROM sessions
        WHERE session_date = $1 AND status = 'no_show'
      `, [today]),

      // References generated today
      db.query(`
        SELECT COUNT(*) as count FROM reference_slips
        WHERE created_at::date = CURRENT_DATE
      `),

      // Recent activity
      db.query(`
        SELECT
          COALESCE(user_name, 'System') || ' ' || action AS text,
          TO_CHAR(created_at, 'HH12:MI AM') AS time
        FROM activity_log
        ORDER BY created_at DESC
        LIMIT 10
      `),

      // Cumulative counselled (all completed sessions ever)
      db.query(`
        SELECT COUNT(*) as count FROM sessions
        WHERE status = 'completed'
      `),
    ]);

    // Map scan_point values to campus flow stages
    const flowMap: Record<string, number> = {
      gate: 0, riasec: 0, waiting: 0, counselling: 0, feedback: 0, exit: 0,
    };
    for (const row of campusFlowResult.rows) {
      const point = (row.scan_point || "").toLowerCase();
      if (point in flowMap) {
        flowMap[point] = parseInt(row.count);
      }
    }

    // Map counsellor statuses
    const counsellors = counsellorsResult.rows.map((row) => {
      let status: "free" | "occupied" | "break" = "free";
      if (row.current_status === "in_progress") {
        status = "occupied";
      } else if (row.current_status === "break") {
        status = "break";
      }
      return {
        name: row.name,
        cabinId: row.cabin_id,
        status,
        currentStudent: row.current_student || null,
        sessionsToday: parseInt(row.sessions_today) || 0,
      };
    });

    const feedbackRow = feedbackResult.rows[0];

    return NextResponse.json({
      campusFlow: flowMap,
      counsellors,
      todayStats: {
        total: parseInt(sessionsTodayResult.rows[0].count) || 0,
        target: 48,
        avgRating: feedbackRow?.avg_rating ? parseFloat(parseFloat(feedbackRow.avg_rating).toFixed(1)) : 0,
        nps: feedbackRow?.avg_nps ? parseFloat(parseFloat(feedbackRow.avg_nps).toFixed(1)) : 0,
        testimonials: parseInt(feedbackRow?.testimonial_count) || 0,
        noShows: parseInt(noShowsResult.rows[0].count) || 0,
        references: parseInt(referencesResult.rows[0].count) || 0,
      },
      activity: activityResult.rows,
      cumulative: {
        counselled: parseInt(cumulativeResult.rows[0].count) || 0,
        target: 3014,
      },
    });
  } catch (error) {
    console.error("Live dashboard error:", error);
    return NextResponse.json({
      campusFlow: { gate: 0, riasec: 0, waiting: 0, counselling: 0, feedback: 0, exit: 0 },
      counsellors: [],
      todayStats: { total: 0, target: 48, avgRating: 0, nps: 0, testimonials: 0, noShows: 0, references: 0 },
      activity: [],
      cumulative: { counselled: 0, target: 3014 },
    });
  }
}
