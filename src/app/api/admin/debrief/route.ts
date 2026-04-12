import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// GET — Retrieve past debrief reports
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const user = authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getDb();
    const result = await db.query(`
      SELECT id, report_date, report_type, day_number,
             scorecard, highlights, concerns, student_voice,
             tomorrow_prep, updates_needed, programme_health_score,
             alerts_extracted, claude_response, created_at
      FROM debrief_reports
      ORDER BY report_date DESC, created_at DESC
      LIMIT 50
    `);

    return NextResponse.json({
      reports: result.rows.map((r) => ({
        id: r.id,
        date: r.report_date,
        type: r.report_type,
        dayNumber: r.day_number,
        scorecard: r.scorecard,
        highlights: r.highlights,
        concerns: r.concerns,
        studentVoice: r.student_voice,
        tomorrowPrep: r.tomorrow_prep,
        updatesNeeded: r.updates_needed,
        healthScore: r.programme_health_score,
        alerts: r.alerts_extracted,
        fullReport: r.claude_response,
        created_at: r.created_at,
      })),
    });
  } catch (error) {
    console.error("Debrief GET error:", error);
    return NextResponse.json({ reports: [] });
  }
}

// ---------------------------------------------------------------------------
// POST — Generate a new debrief report
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const user = authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getDb();
    const today = new Date().toISOString().split("T")[0];
    const dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" });

    // ── Determine day_number (how many programme days have passed) ──
    const dayCountResult = await db.query(`
      SELECT COUNT(DISTINCT session_date) as programme_days
      FROM sessions WHERE status = 'completed'
    `);
    const dayNumber = Math.max(1, parseInt(dayCountResult.rows[0]?.programme_days || "1"));

    // Determine report type: daily for first 6 days, weekly on Fridays after
    const isFriday = new Date().getDay() === 5;
    const reportType = dayNumber <= 6 ? "daily" : (isFriday ? "weekly" : "daily");

    // ── 1. Session stats ──
    const sessionsResult = await db.query(`
      SELECT
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'no-show' OR status = 'noshow') as no_shows,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status = 'walk-in' OR status = 'walkin') as walk_ins
      FROM sessions WHERE session_date = $1
    `, [today]);
    const ss = sessionsResult.rows[0] || {};

    // ── 2. Feedback stats ──
    const feedbackStatsResult = await db.query(`
      SELECT
        ROUND(AVG(f.rating)::numeric, 1) as avg_rating,
        ROUND(AVG(f.nps)::numeric, 1) as avg_nps,
        COUNT(*) as feedback_count
      FROM feedback f WHERE f.created_at::date = $1
    `, [today]);
    const fs = feedbackStatsResult.rows[0] || {};

    // Rating distribution
    const ratingDistResult = await db.query(`
      SELECT rating, COUNT(*) as cnt
      FROM feedback WHERE created_at::date = $1 AND rating IS NOT NULL
      GROUP BY rating ORDER BY rating DESC
    `, [today]);
    const ratingDist: Record<string, number> = {};
    for (const r of ratingDistResult.rows) {
      ratingDist[r.rating] = parseInt(r.cnt);
    }

    // ── 3. Counsellor-wise stats (enriched) ──
    const counsellorResult = await db.query(`
      SELECT
        s.counsellor_name,
        s.cabin_id,
        COUNT(*) as sessions_count,
        COUNT(*) FILTER (WHERE s.status = 'completed') as completed,
        ROUND(AVG(f.rating)::numeric, 1) as avg_rating,
        ROUND(AVG(f.nps)::numeric, 1) as avg_nps,
        ROUND(AVG(EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 60)::numeric, 1) as avg_session_min,
        ARRAY_AGG(DISTINCT s.recommended_streams) FILTER (WHERE s.recommended_streams IS NOT NULL) as streams_recommended
      FROM sessions s
      LEFT JOIN feedback f ON f.session_id = s.id
      WHERE s.session_date = $1
      GROUP BY s.counsellor_name, s.cabin_id
      ORDER BY sessions_count DESC
    `, [today]);

    // ── 4. Stream distribution ──
    const streamResult = await db.query(`
      SELECT f.career_considering as stream, COUNT(*) as count
      FROM feedback f
      WHERE f.created_at::date = $1 AND f.career_considering IS NOT NULL AND f.career_considering != ''
      GROUP BY f.career_considering ORDER BY count DESC
    `, [today]);

    // ── 5. Feedback texts ──
    const feedbackTextsResult = await db.query(`
      SELECT f.most_useful, f.suggestion, r.full_name as student_name
      FROM feedback f
      LEFT JOIN registrations r ON r.id = f.student_id
      WHERE f.created_at::date = $1
        AND (f.most_useful IS NOT NULL OR f.suggestion IS NOT NULL)
      ORDER BY f.created_at DESC LIMIT 30
    `, [today]);

    // ── 6. References generated today ──
    const refsResult = await db.query(`
      SELECT
        COUNT(*) as total_refs,
        ARRAY_AGG(DISTINCT rs.institution) FILTER (WHERE rs.institution IS NOT NULL) as institutions,
        ARRAY_AGG(DISTINCT rs.programme) FILTER (WHERE rs.programme IS NOT NULL) as programmes
      FROM reference_slips rs WHERE rs.created_at::date = $1
    `, [today]);
    const refs = refsResult.rows[0] || {};

    // ── 7. Career Kit inventory ──
    const inventoryResult = await db.query(`
      SELECT item, current_stock FROM career_kit_inventory
    `);
    const inventory: Record<string, number> = {};
    const lowStock: string[] = [];
    for (const r of inventoryResult.rows) {
      inventory[r.item] = parseInt(r.current_stock);
      if (parseInt(r.current_stock) < 100) lowStock.push(r.item);
    }

    // ── 8. QR scans breakdown ──
    const qrResult = await db.query(`
      SELECT scan_point, COUNT(*) as cnt
      FROM qr_scans WHERE scanned_at::date = $1
      GROUP BY scan_point
    `, [today]);
    const qrScans: Record<string, number> = {};
    for (const r of qrResult.rows) {
      qrScans[r.scan_point] = parseInt(r.cnt);
    }

    // ── 9. Certificates printed today ──
    const certsResult = await db.query(`
      SELECT COUNT(*) as cnt FROM certificates WHERE created_at::date = $1
    `, [today]);

    // ── 10. Cumulative students ──
    const cumulativeResult = await db.query(`
      SELECT COUNT(*) as cnt FROM sessions WHERE status = 'completed'
    `);

    // ── 11. Testimonials recorded today ──
    const testimonialsResult = await db.query(`
      SELECT COUNT(*) as cnt FROM feedback
      WHERE created_at::date = $1 AND most_useful IS NOT NULL AND most_useful != ''
    `, [today]);

    // ── 12. Previous debrief concerns (for trend tracking) ──
    const prevDebriefResult = await db.query(`
      SELECT concerns FROM debrief_reports
      WHERE report_date < $1
      ORDER BY report_date DESC, created_at DESC LIMIT 1
    `, [today]);
    const previousConcerns = prevDebriefResult.rows[0]?.concerns || "";

    // ── Build full data payload per spec ──
    const dataPayload = {
      date: today,
      day_number: dayNumber,
      programme_day: dayOfWeek,
      cumulative_students: parseInt(cumulativeResult.rows[0]?.cnt || "0"),
      total_target: 3014,
      sessions: {
        booked: parseInt(ss.total_sessions || "0"),
        completed: parseInt(ss.completed || "0"),
        no_show: parseInt(ss.no_shows || "0"),
        cancelled: parseInt(ss.cancelled || "0"),
        walk_in: parseInt(ss.walk_ins || "0"),
      },
      counsellors: counsellorResult.rows.map((c) => ({
        name: c.counsellor_name,
        cabin: c.cabin_id,
        sessions_completed: parseInt(c.completed || "0"),
        avg_rating: parseFloat(c.avg_rating) || null,
        avg_nps: parseFloat(c.avg_nps) || null,
        avg_session_duration_min: parseFloat(c.avg_session_min) || null,
        streams_recommended: c.streams_recommended || [],
      })),
      feedback_summary: {
        avg_rating: parseFloat(fs.avg_rating) || 0,
        avg_nps: parseFloat(fs.avg_nps) || 0,
        feedback_count: parseInt(fs.feedback_count || "0"),
        rating_distribution: ratingDist,
        top_most_useful: feedbackTextsResult.rows
          .filter((f) => f.most_useful)
          .slice(0, 5)
          .map((f) => f.most_useful),
        careers_considering: Object.fromEntries(
          streamResult.rows.map((s) => [s.stream, parseInt(s.count)])
        ),
        suggestions: feedbackTextsResult.rows
          .filter((f) => f.suggestion)
          .slice(0, 5)
          .map((f) => f.suggestion),
      },
      references: {
        total_today: parseInt(refs.total_refs || "0"),
        institutions: refs.institutions || [],
        programmes: refs.programmes || [],
      },
      career_kit: {
        inventory,
        low_stock_items: lowStock,
        certificates_printed: parseInt(certsResult.rows[0]?.cnt || "0"),
      },
      qr_scans: qrScans,
      testimonials_recorded: parseInt(testimonialsResult.rows[0]?.cnt || "0"),
      previous_debrief_concerns: previousConcerns
        ? previousConcerns.split("\n").filter((l: string) => l.trim())
        : [],
    };

    // ── System prompt (exact spec version) ──
    const systemPrompt = `You are CareerArc's programme intelligence engine.

CareerArc is a daily career guidance programme at BITE Campus,
Varanasi, serving 3,014 students from rural eastern UP.
8 faculty counsellors conduct 15-minute sessions daily (2-4 PM).
48 students/day target. Programme runs May–mid July.

You receive one day's complete data as JSON.
Produce a structured debrief report with EXACTLY 6 sections:

## 1. TODAY'S SCORECARD
Key numbers in 3–4 bullet points: completed vs target,
no-shows, NPS, rating, notable milestones.

## 2. HIGHLIGHTS
2–3 things that went well. Be specific — name counsellors,
quote student feedback, note positive patterns.

## 3. CONCERNS
2–3 things that need attention. Flag: any counsellor with
avg rating <7 or session time >18 min. No-show patterns.
Student suggestions that repeat. Be direct, not diplomatic.

## 4. STUDENT VOICE
What are students actually saying? Pull from most_useful
and suggestions. Identify emerging themes. Quote directly
when powerful. Note sentiment shifts from previous days.

## 5. TOMORROW'S PREP
2–3 specific actions for tomorrow based on today's data.
E.g.: "Counsellor X needs check-in," "Restock Science
handouts," "Address recurring question about [topic]."

## 6. MANUAL UPDATES NEEDED
Any changes needed to session manual, handouts, process,
or training based on what students are asking/saying.
If none, say "No updates needed."

RULES:
- Under 500 words total.
- Use Hindi phrases where students used them.
- Never be generic. Every insight must reference specific data.
- If previous_debrief_concerns exists, report whether each
  concern improved, worsened, or stayed the same.
- Flag any counsellor below 7.0 avg rating explicitly.
- Flag any session duration avg >17 min explicitly.
- If day_number <= 6, add a "CALIBRATION NOTE" at the end
  with one observation about programme setup quality.`;

    // Add weekly instructions if applicable
    const weeklyAddendum = reportType === "weekly" ? `

ADDITIONAL INSTRUCTION FOR WEEKLY DEBRIEF:
This is a WEEKLY debrief covering Monday–Friday.
Include all 6 sections but add:

## 7. WEEK-OVER-WEEK COMPARISON
Compare this week vs last week: sessions, NPS, rating,
no-show rate, stream distribution changes, new concerns.

## 8. COUNSELLOR RANKINGS
Rank all 8 counsellors by composite score (rating + NPS +
session count). Note top performer and lowest performer.

## 9. PROGRAMME HEALTH SCORE
Give a single score 1–10 for overall programme health.
Justify with 2–3 reasons.` : "";

    // ── Call Claude API ──
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt + weeklyAddendum,
      messages: [
        {
          role: "user",
          content: JSON.stringify(dataPayload, null, 2),
        },
      ],
    });

    const claudeResponse =
      message.content[0].type === "text" ? message.content[0].text : "";

    // ── Parse all 6 sections ──
    const scorecard = extractSection(claudeResponse, "SCORECARD", "HIGHLIGHTS");
    const highlights = extractSection(claudeResponse, "HIGHLIGHTS", "CONCERNS");
    const concerns = extractSection(claudeResponse, "CONCERNS", "STUDENT VOICE");
    const studentVoice = extractSection(claudeResponse, "STUDENT VOICE", "TOMORROW");
    const tomorrowPrep = extractSection(claudeResponse, "TOMORROW", "MANUAL UPDATE");
    const updatesNeeded = extractSection(claudeResponse, "MANUAL UPDATE", "CALIBRATION|WEEK-OVER-WEEK|$");

    // Extract programme health score for weekly reports
    let healthScore: number | null = null;
    if (reportType === "weekly") {
      const healthMatch = claudeResponse.match(/(?:HEALTH SCORE|score[:\s]+)(\d+(?:\.\d+)?)\s*\/?\s*10/i);
      if (healthMatch) healthScore = parseFloat(healthMatch[1]);
    }

    // ── Extract alerts ──
    const alerts = extractAlerts(claudeResponse, dataPayload);

    // ── Store in database ──
    const insertResult = await db.query(
      `INSERT INTO debrief_reports
        (report_date, report_type, day_number, data_json, claude_response,
         scorecard, highlights, concerns, student_voice,
         tomorrow_prep, updates_needed, programme_health_score,
         alerts_extracted, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       RETURNING id, report_date, report_type, day_number, scorecard, highlights,
                 concerns, student_voice, tomorrow_prep, updates_needed,
                 programme_health_score, alerts_extracted, claude_response, created_at`,
      [
        today, reportType, dayNumber,
        JSON.stringify(dataPayload), claudeResponse,
        scorecard, highlights, concerns, studentVoice,
        tomorrowPrep, updatesNeeded, healthScore,
        JSON.stringify(alerts),
      ]
    );

    const row = insertResult.rows[0];

    // ── Push alerts to notifications table ──
    for (const alert of alerts) {
      await db.query(
        `INSERT INTO user_notifications (user_role, title, message, type, created_at)
         VALUES ('admin', $1, $2, $3, NOW())`,
        [alert.title, alert.detail, alert.severity === "HIGH" ? "alert" : "info"]
      );
    }

    return NextResponse.json({
      success: true,
      report: {
        id: row.id,
        date: row.report_date,
        type: row.report_type,
        dayNumber: row.day_number,
        scorecard: row.scorecard,
        highlights: row.highlights,
        concerns: row.concerns,
        studentVoice: row.student_voice,
        tomorrowPrep: row.tomorrow_prep,
        updatesNeeded: row.updates_needed,
        healthScore: row.programme_health_score,
        alerts: row.alerts_extracted,
        fullReport: row.claude_response,
        created_at: row.created_at,
      },
    });
  } catch (error) {
    console.error("Debrief POST error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate debrief", detail: message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Section extraction — handles ## N. TITLE headers
// ---------------------------------------------------------------------------
function extractSection(text: string, startMarker: string, endMarker: string): string {
  const lines = text.split("\n");
  let capturing = false;
  const captured: string[] = [];
  const startRe = new RegExp(startMarker, "i");
  const endRe = new RegExp(endMarker, "i");

  for (const line of lines) {
    if (startRe.test(line) && line.trim().startsWith("#")) {
      capturing = true;
      continue;
    }
    if (capturing && endRe.test(line) && line.trim().startsWith("#")) {
      break;
    }
    if (capturing) {
      captured.push(line);
    }
  }
  return captured.join("\n").trim();
}

// ---------------------------------------------------------------------------
// Alert extraction — scans Claude response + raw data for actionable alerts
// ---------------------------------------------------------------------------
interface DebriefAlert {
  type: string;
  title: string;
  detail: string;
  severity: "HIGH" | "MEDIUM" | "INFO";
}

function extractAlerts(
  response: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): DebriefAlert[] {
  const alerts: DebriefAlert[] = [];

  // Counsellor rating below 7.0
  for (const c of data.counsellors || []) {
    if (c.avg_rating !== null && c.avg_rating < 7.0) {
      alerts.push({
        type: "LOW_COUNSELLOR_RATING",
        title: `${c.name}: Rating ${c.avg_rating}/10`,
        detail: `Counsellor ${c.name} has avg rating ${c.avg_rating} — below 7.0 threshold.`,
        severity: "HIGH",
      });
    }
  }

  // Session time > 17 min
  for (const c of data.counsellors || []) {
    if (c.avg_session_duration_min !== null && c.avg_session_duration_min > 17) {
      alerts.push({
        type: "SESSION_OVERTIME",
        title: `${c.name}: Avg ${c.avg_session_duration_min} min/session`,
        detail: `Counsellor ${c.name} averaging ${c.avg_session_duration_min} min — above 17 min threshold.`,
        severity: "MEDIUM",
      });
    }
  }

  // No-show > 10%
  const booked = data.sessions?.booked || 0;
  const noShow = data.sessions?.no_show || 0;
  if (booked > 0 && (noShow / booked) > 0.1) {
    alerts.push({
      type: "HIGH_NO_SHOW",
      title: `No-show rate: ${Math.round((noShow / booked) * 100)}%`,
      detail: `${noShow}/${booked} students didn't show up — above 10% threshold.`,
      severity: "MEDIUM",
    });
  }

  // Low inventory
  for (const item of data.career_kit?.low_stock_items || []) {
    alerts.push({
      type: "INVENTORY_LOW",
      title: `Low stock: ${item}`,
      detail: `${item} stock below 100 units.`,
      severity: "HIGH",
    });
  }

  // Manual updates detected
  if (response.match(/manual update/i) && !response.match(/no updates needed/i)) {
    alerts.push({
      type: "MANUAL_UPDATE_NEEDED",
      title: "Manual updates recommended",
      detail: "Claude identified manual updates needed — check Updates section.",
      severity: "INFO",
    });
  }

  return alerts;
}
