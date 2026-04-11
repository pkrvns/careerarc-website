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

    await db.sql`
      CREATE TABLE IF NOT EXISTS arct_participants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        father_name VARCHAR(255),
        institution VARCHAR(255),
        mobile VARCHAR(15),
        arct_roll VARCHAR(50) UNIQUE,
        status VARCHAR(50) DEFAULT 'pending',
        imported_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Add new columns to registrations if missing
    await db.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS has_smartphone BOOLEAN DEFAULT TRUE`);
    await db.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS stream_interest VARCHAR(100)`);

    // Sessions table — for counselling programme
    await db.sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES registrations(id),
        counsellor_name VARCHAR(255),
        cabin_id VARCHAR(10),
        session_date DATE,
        shift VARCHAR(50),
        status VARCHAR(50) DEFAULT 'booked',
        notes TEXT,
        recommended_streams TEXT,
        feedback_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Feedback table
    await db.sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions(id),
        student_id INTEGER,
        rating INTEGER,
        nps INTEGER,
        most_useful TEXT,
        career_considering VARCHAR(100),
        suggestion TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // QR scans table
    await db.sql`
      CREATE TABLE IF NOT EXISTS qr_scans (
        id SERIAL PRIMARY KEY,
        student_id INTEGER,
        scan_point VARCHAR(50),
        scanned_by VARCHAR(255),
        scanned_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Reference slips table
    await db.sql`
      CREATE TABLE IF NOT EXISTS reference_slips (
        id SERIAL PRIMARY KEY,
        ref_code VARCHAR(20) UNIQUE,
        student_id INTEGER,
        counsellor_name VARCHAR(255),
        institution VARCHAR(100),
        programme VARCHAR(255),
        status VARCHAR(50) DEFAULT 'reference',
        rep_name VARCHAR(255),
        reached_at TIMESTAMP,
        crm_at TIMESTAMP,
        admission_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Portal users table (volunteers, counsellors, reps, coordinators)
    await db.sql`
      CREATE TABLE IF NOT EXISTS portal_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(15) NOT NULL UNIQUE,
        role VARCHAR(50) NOT NULL,
        department VARCHAR(100),
        cabin_id VARCHAR(10),
        specialization TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Activity log
    await db.sql`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(255),
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Counselling schedules
    await db.sql`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        schedule_date DATE NOT NULL,
        shift_time VARCHAR(50) NOT NULL,
        counsellor_name VARCHAR(255),
        cabin_id VARCHAR(10),
        max_students INTEGER DEFAULT 8,
        booked_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      message: "All database tables created successfully",
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
