import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = getDb();

    await db.sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(15) NOT NULL UNIQUE,
        institution VARCHAR(255) NOT NULL,
        class_year VARCHAR(50) NOT NULL,
        preferred_date VARCHAR(10) NOT NULL,
        parent_attending BOOLEAN DEFAULT FALSE,
        parent_name VARCHAR(255),
        registered_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS guest_registrations (
        id SERIAL PRIMARY KEY,
        guest_name VARCHAR(255) NOT NULL,
        guest_mobile VARCHAR(15) NOT NULL UNIQUE,
        relationship VARCHAR(50) NOT NULL,
        student_mobile VARCHAR(15) NOT NULL,
        student_name VARCHAR(255),
        preferred_date VARCHAR(10) NOT NULL,
        registered_at TIMESTAMP DEFAULT NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      message: "Database tables created successfully (registrations + guest_registrations)",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Setup error:", message);
    return NextResponse.json(
      { error: "Failed to create tables", detail: message },
      { status: 500 }
    );
  }
}
