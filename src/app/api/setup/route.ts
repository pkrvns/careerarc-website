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
    await db.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS riasec_type VARCHAR(10)`);
    await db.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS riasec_scores_json TEXT`);
    await db.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE`);
    await db.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(15)`);
    await db.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS qr_code_hash VARCHAR(100)`);

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

    // Add missing columns to sessions
    await db.query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS start_time TIMESTAMP`);
    await db.query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS end_time TIMESTAMP`);
    await db.query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS pathway_card_data TEXT`);
    await db.query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS career_kit_issued BOOLEAN DEFAULT FALSE`);

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

    // Add missing columns to feedback
    await db.query(`ALTER TABLE feedback ADD COLUMN IF NOT EXISTS captured_by VARCHAR(255)`);

    // Add missing columns to qr_scans
    await db.query(`ALTER TABLE qr_scans ADD COLUMN IF NOT EXISTS aadhaar_verified BOOLEAN DEFAULT FALSE`);
    await db.query(`ALTER TABLE qr_scans ADD COLUMN IF NOT EXISTS location_note VARCHAR(255)`);

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

    // Certificates table
    await db.sql`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        student_id INTEGER,
        cert_type VARCHAR(50) NOT NULL,
        certificate_data TEXT,
        pdf_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'generated',
        sent_via_whatsapp BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Debrief reports table
    await db.sql`
      CREATE TABLE IF NOT EXISTS debrief_reports (
        id SERIAL PRIMARY KEY,
        report_date DATE NOT NULL,
        report_type VARCHAR(20) DEFAULT 'daily',
        data_json TEXT,
        claude_response TEXT,
        highlights TEXT,
        concerns TEXT,
        suggestions TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Career Kit Inventory table
    await db.sql`
      CREATE TABLE IF NOT EXISTS career_kit_inventory (
        id SERIAL PRIMARY KEY,
        item VARCHAR(100) NOT NULL UNIQUE,
        stock_in INTEGER DEFAULT 0,
        stock_out INTEGER DEFAULT 0,
        current_stock INTEGER DEFAULT 0,
        alert_threshold INTEGER DEFAULT 200,
        last_updated TIMESTAMP DEFAULT NOW()
      )
    `;

    // Notifications table
    await db.sql`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        severity VARCHAR(20) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // WhatsApp messages tracking
    await db.sql`
      CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id SERIAL PRIMARY KEY,
        student_id INTEGER,
        template_type VARCHAR(50),
        phone VARCHAR(15),
        status VARCHAR(20) DEFAULT 'queued',
        msg91_message_id VARCHAR(100),
        sent_at TIMESTAMP,
        delivered_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Institutions master table
    await db.sql`
      CREATE TABLE IF NOT EXISTS institutions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        principal_name VARCHAR(255),
        phone VARCHAR(15),
        address TEXT,
        district VARCHAR(100),
        teacher_confirmed BOOLEAN DEFAULT FALSE,
        students_count INTEGER DEFAULT 0,
        rep_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Add missing columns to debrief_reports
    await db.query(`ALTER TABLE debrief_reports ADD COLUMN IF NOT EXISTS tomorrow_prep TEXT`);
    await db.query(`ALTER TABLE debrief_reports ADD COLUMN IF NOT EXISTS updates_needed TEXT`);
    await db.query(`ALTER TABLE debrief_reports ADD COLUMN IF NOT EXISTS scorecard TEXT`);
    await db.query(`ALTER TABLE debrief_reports ADD COLUMN IF NOT EXISTS student_voice TEXT`);
    await db.query(`ALTER TABLE debrief_reports ADD COLUMN IF NOT EXISTS day_number INTEGER`);
    await db.query(`ALTER TABLE debrief_reports ADD COLUMN IF NOT EXISTS programme_health_score FLOAT`);
    await db.query(`ALTER TABLE debrief_reports ADD COLUMN IF NOT EXISTS alerts_extracted JSONB`);
    await db.query(`ALTER TABLE debrief_reports ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT FALSE`);

    // Add missing columns to reference_slips
    await db.query(`ALTER TABLE reference_slips ADD COLUMN IF NOT EXISTS thermal_printed BOOLEAN DEFAULT FALSE`);

    // Add missing columns to certificates
    await db.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS tagline VARCHAR(500)`);
    await db.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS best_wishes_msg TEXT`);
    await db.query(`ALTER TABLE certificates ADD COLUMN IF NOT EXISTS printed BOOLEAN DEFAULT FALSE`);

    return NextResponse.json({
      success: true,
      message: "All database tables created successfully (16 tables + all columns)",
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
