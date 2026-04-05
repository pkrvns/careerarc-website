import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await sql`
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

    return NextResponse.json({
      success: true,
      message: "Database table created successfully",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to create table" },
      { status: 500 }
    );
  }
}
