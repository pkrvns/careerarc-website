import { getDb } from "@/lib/db";
import { getPortalUserFromCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const token = getPortalUserFromCookie(request, "guide_token");
    if (!token || !token.name) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { sessionId, notes, recommendedStreams, status, followUpNeeded, pathwayCardData } =
      await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Build metadata string for notes
    const metadata = JSON.stringify({
      followUpNeeded: followUpNeeded || false,
      pathwayCardData: pathwayCardData || null,
      updatedAt: new Date().toISOString(),
    });

    const notesWithMeta = notes
      ? `${notes}\n---meta:${metadata}`
      : `---meta:${metadata}`;

    await db.query(
      `UPDATE sessions
       SET notes = $1,
           recommended_streams = $2,
           status = COALESCE($3, status)
       WHERE id = $4 AND counsellor_name = $5`,
      [
        notesWithMeta,
        recommendedStreams || null,
        status || null,
        sessionId,
        token.name,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Session notes saved",
    });
  } catch (error) {
    console.error("Session notes error:", error);
    return NextResponse.json(
      { error: "Failed to save session notes" },
      { status: 500 }
    );
  }
}
