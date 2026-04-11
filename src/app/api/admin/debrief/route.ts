// Required table (add to /api/setup):
// CREATE TABLE IF NOT EXISTS debrief_reports (
//   id SERIAL PRIMARY KEY,
//   report_date DATE NOT NULL,
//   report_type VARCHAR(20) DEFAULT 'daily',
//   data_json TEXT,
//   claude_response TEXT,
//   highlights TEXT,
//   concerns TEXT,
//   suggestions TEXT,
//   created_at TIMESTAMP DEFAULT NOW()
// )

import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export async function GET(request: Request) {
  const user = authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getDb();

    const result = await db.query(`
      SELECT id, report_date, report_type, highlights, concerns, suggestions, claude_response, created_at
      FROM debrief_reports
      ORDER BY report_date DESC, created_at DESC
      LIMIT 50
    `);

    return NextResponse.json({
      reports: result.rows.map((r) => ({
        id: r.id,
        date: r.report_date,
        type: r.report_type,
        highlights: r.highlights,
        concerns: r.concerns,
        suggestions: r.suggestions,
        fullReport: r.claude_response,
        created_at: r.created_at,
      })),
    });
  } catch (error) {
    console.error("Debrief GET error:", error);
    return NextResponse.json({ reports: [] });
  }
}

export async function POST(request: Request) {
  const user = authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getDb();
    const today = new Date().toISOString().split("T")[0];

    // 1. Sessions completed today
    const sessionsResult = await db.query(`
      SELECT
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'no-show' OR status = 'noshow') as no_shows
      FROM sessions
      WHERE session_date = $1
    `, [today]);

    const sessionStats = sessionsResult.rows[0] || { total_sessions: 0, completed: 0, no_shows: 0 };

    // 2. Average rating and NPS from today's feedback
    const feedbackStatsResult = await db.query(`
      SELECT
        ROUND(AVG(f.rating)::numeric, 1) as avg_rating,
        ROUND(AVG(f.nps)::numeric, 1) as avg_nps,
        COUNT(*) as feedback_count
      FROM feedback f
      WHERE f.created_at::date = $1
    `, [today]);

    const feedbackStats = feedbackStatsResult.rows[0] || { avg_rating: 0, avg_nps: 0, feedback_count: 0 };

    // 3. Counsellor-wise stats
    const counsellorResult = await db.query(`
      SELECT
        s.counsellor_name,
        COUNT(*) as sessions_count,
        COUNT(*) FILTER (WHERE s.status = 'completed') as completed,
        ROUND(AVG(f.rating)::numeric, 1) as avg_rating
      FROM sessions s
      LEFT JOIN feedback f ON f.session_id = s.id
      WHERE s.session_date = $1
      GROUP BY s.counsellor_name
      ORDER BY sessions_count DESC
    `, [today]);

    const counsellorStats = counsellorResult.rows;

    // 4. Stream distribution from feedback (career_considering field)
    const streamResult = await db.query(`
      SELECT
        f.career_considering as stream,
        COUNT(*) as count
      FROM feedback f
      WHERE f.created_at::date = $1 AND f.career_considering IS NOT NULL AND f.career_considering != ''
      GROUP BY f.career_considering
      ORDER BY count DESC
    `, [today]);

    const streamDistribution = streamResult.rows;

    // 5. Feedback texts (most_useful + suggestion)
    const feedbackTextsResult = await db.query(`
      SELECT f.most_useful, f.suggestion, r.full_name as student_name
      FROM feedback f
      LEFT JOIN registrations r ON r.id = f.student_id
      WHERE f.created_at::date = $1
        AND (f.most_useful IS NOT NULL OR f.suggestion IS NOT NULL)
      ORDER BY f.created_at DESC
      LIMIT 30
    `, [today]);

    const feedbackTexts = feedbackTextsResult.rows;

    // 6. References generated today
    const refsResult = await db.query(`
      SELECT COUNT(*) as total_refs
      FROM reference_slips
      WHERE created_at::date = $1
    `, [today]);

    const refsGenerated = parseInt(refsResult.rows[0]?.total_refs || "0");

    // Package data
    const dataPackage = {
      date: today,
      sessions: {
        total: parseInt(sessionStats.total_sessions),
        completed: parseInt(sessionStats.completed),
        noShows: parseInt(sessionStats.no_shows),
      },
      feedback: {
        count: parseInt(feedbackStats.feedback_count),
        avgRating: parseFloat(feedbackStats.avg_rating) || 0,
        avgNps: parseFloat(feedbackStats.avg_nps) || 0,
      },
      counsellors: counsellorStats.map((c) => ({
        name: c.counsellor_name,
        sessions: parseInt(c.sessions_count),
        completed: parseInt(c.completed),
        avgRating: parseFloat(c.avg_rating) || null,
      })),
      streamDistribution: streamDistribution.map((s) => ({
        stream: s.stream,
        count: parseInt(s.count),
      })),
      studentFeedback: feedbackTexts.map((f) => ({
        name: f.student_name,
        mostUseful: f.most_useful,
        suggestion: f.suggestion,
      })),
      referencesGenerated: refsGenerated,
    };

    // Call Claude API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `You are the CareerArc Debrief Analyst. Analyse the following daily counselling data and produce a structured report with: (1) Today's Highlights, (2) Concerns/Flags (any counsellor below 7 avg, unusual patterns), (3) Student Voice Analysis (frequent words, common questions, sentiment), (4) Tomorrow's Preparation suggestions, (5) Manual Updates Needed. Be specific. Use names. Flag actionable items. Keep the report under 500 words. Hindi student quotes can be included.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here is today's CareerArc counselling data for ${today}:\n\n${JSON.stringify(dataPackage, null, 2)}`,
        },
      ],
    });

    const claudeResponse =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse sections from response
    const highlights = extractSection(claudeResponse, "Highlights", "Concerns");
    const concerns = extractSection(claudeResponse, "Concerns", "Student Voice");
    const suggestions = extractSection(claudeResponse, "Preparation", "Manual Updates");

    // Store in database
    const insertResult = await db.query(
      `INSERT INTO debrief_reports (report_date, report_type, data_json, claude_response, highlights, concerns, suggestions, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, report_date, report_type, highlights, concerns, suggestions, claude_response, created_at`,
      [today, "daily", JSON.stringify(dataPackage), claudeResponse, highlights, concerns, suggestions]
    );

    const row = insertResult.rows[0];

    return NextResponse.json({
      success: true,
      report: {
        id: row.id,
        date: row.report_date,
        type: row.report_type,
        highlights: row.highlights,
        concerns: row.concerns,
        suggestions: row.suggestions,
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

function extractSection(text: string, startMarker: string, endMarker: string): string {
  const lines = text.split("\n");
  let capturing = false;
  const captured: string[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes(startMarker.toLowerCase())) {
      capturing = true;
      continue;
    }
    if (capturing && lower.includes(endMarker.toLowerCase())) {
      break;
    }
    if (capturing) {
      captured.push(line);
    }
  }

  return captured.join("\n").trim();
}
