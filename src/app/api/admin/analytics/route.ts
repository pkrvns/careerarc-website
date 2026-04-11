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

    // --- Feedback Analytics ---
    const feedbackAgg = await db.sql`
      SELECT
        COUNT(*)::int AS total_feedback,
        ROUND(AVG(rating)::numeric, 1) AS avg_rating,
        ROUND(AVG(nps)::numeric, 1) AS avg_nps
      FROM feedback
    `;

    const totalFeedback = feedbackAgg.rows[0]?.total_feedback || 0;
    const avgRating = parseFloat(feedbackAgg.rows[0]?.avg_rating) || 0;
    const avgNps = parseFloat(feedbackAgg.rows[0]?.avg_nps) || 0;

    // Rating distribution (1-10)
    const ratingDist = await db.sql`
      SELECT rating, COUNT(*)::int AS count
      FROM feedback
      WHERE rating IS NOT NULL
      GROUP BY rating
      ORDER BY rating
    `;
    const ratingDistribution = Array(10).fill(0);
    for (const row of ratingDist.rows) {
      const idx = parseInt(row.rating) - 1;
      if (idx >= 0 && idx < 10) ratingDistribution[idx] = row.count;
    }

    // Stream popularity from career_considering
    const streamRows = await db.sql`
      SELECT career_considering, COUNT(*)::int AS count
      FROM feedback
      WHERE career_considering IS NOT NULL AND career_considering != ''
      GROUP BY career_considering
      ORDER BY count DESC
    `;
    const streamPopularity: Record<string, number> = {};
    for (const row of streamRows.rows) {
      streamPopularity[row.career_considering] = row.count;
    }

    // Top words from most_useful field
    const usefulRows = await db.sql`
      SELECT most_useful FROM feedback
      WHERE most_useful IS NOT NULL AND most_useful != ''
    `;
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "was", "it", "i", "my", "me", "we", "our", "very", "that", "this", "about", "from", "they", "their", "how", "what", "so", "not", "all", "has", "had", "have", "been", "are", "were"]);
    for (const row of usefulRows.rows) {
      const words = (row.most_useful as string).toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
      for (const w of words) {
        if (w.length > 2 && !stopWords.has(w)) {
          wordFreq[w] = (wordFreq[w] || 0) + 1;
        }
      }
    }
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word);

    // --- Student Analytics ---
    const totalCounselled = await db.sql`
      SELECT COUNT(*)::int AS count FROM sessions WHERE status = 'completed'
    `;
    const totalBooked = await db.sql`
      SELECT COUNT(*)::int AS count FROM sessions
    `;
    const counselledCount = totalCounselled.rows[0]?.count || 0;
    const bookedCount = totalBooked.rows[0]?.count || 0;
    const showUpRate = bookedCount > 0 ? Math.round((counselledCount / bookedCount) * 100) : 0;

    // Guest vs ARC-T count
    const guestCount = await db.sql`
      SELECT COUNT(*)::int AS count FROM guest_registrations
    `;
    const arctCount = await db.sql`
      SELECT COUNT(*)::int AS count FROM arct_participants
    `;

    // By institution (top 10)
    const byInstitution = await db.sql`
      SELECT r.institution AS name, COUNT(*)::int AS count
      FROM sessions s
      JOIN registrations r ON r.id = s.student_id
      WHERE s.status = 'completed'
      GROUP BY r.institution
      ORDER BY count DESC
      LIMIT 10
    `;

    // By stream
    const byStream = await db.sql`
      SELECT r.stream_interest AS stream, COUNT(*)::int AS count
      FROM sessions s
      JOIN registrations r ON r.id = s.student_id
      WHERE s.status = 'completed' AND r.stream_interest IS NOT NULL AND r.stream_interest != ''
      GROUP BY r.stream_interest
      ORDER BY count DESC
    `;
    const streamBreakdown: Record<string, number> = {};
    for (const row of byStream.rows) {
      streamBreakdown[row.stream] = row.count;
    }

    // --- Counsellor Performance ---
    const counsellors = await db.sql`
      SELECT
        s.counsellor_name AS name,
        COUNT(s.id)::int AS sessions,
        ROUND(AVG(f.rating)::numeric, 1) AS avg_rating,
        ROUND(AVG(f.nps)::numeric, 1) AS avg_nps
      FROM sessions s
      LEFT JOIN feedback f ON f.session_id = s.id
      WHERE s.counsellor_name IS NOT NULL AND s.counsellor_name != ''
      GROUP BY s.counsellor_name
      ORDER BY sessions DESC
    `;

    return NextResponse.json({
      feedback: {
        avgRating,
        avgNps,
        totalFeedback,
        ratingDistribution,
        streamPopularity,
        topWords,
      },
      students: {
        totalCounselled: counselledCount,
        totalBooked: bookedCount,
        showUpRate,
        guestCount: guestCount.rows[0]?.count || 0,
        arctCount: arctCount.rows[0]?.count || 0,
        byInstitution: byInstitution.rows,
        byStream: streamBreakdown,
      },
      counsellors: counsellors.rows.map((c) => ({
        name: c.name,
        sessions: c.sessions,
        avgRating: parseFloat(c.avg_rating) || 0,
        avgNps: parseFloat(c.avg_nps) || 0,
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
