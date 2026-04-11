import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getDb();
    const result = await db.query(
      "SELECT id, name, phone, role, department, cabin_id, is_active, created_at FROM portal_users ORDER BY role, name"
    );
    return NextResponse.json({ users: result.rows });
  } catch {
    return NextResponse.json({ users: [] });
  }
}

export async function POST(request: Request) {
  const user = authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getDb();
    const { name, phone, role, department, cabin_id } = await request.json();

    if (!name || !phone || !role) {
      return NextResponse.json({ error: "Name, phone, and role are required" }, { status: 400 });
    }

    await db.query(
      "INSERT INTO portal_users (name, phone, role, department, cabin_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (phone) DO UPDATE SET name=$1, role=$3, department=$4, cabin_id=$5",
      [name, phone, role, department || null, cabin_id || null]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getDb();
    const { id, is_active } = await request.json();
    await db.query("UPDATE portal_users SET is_active = $1 WHERE id = $2", [is_active, id]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = authenticateRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = getDb();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.query("DELETE FROM portal_users WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
