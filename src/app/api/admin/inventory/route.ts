import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

const DEFAULT_ITEMS = [
  { item: "Tote bags", stock_in: 3200, alert_threshold: 200 },
  { item: "Notebooks", stock_in: 3200, alert_threshold: 200 },
  { item: "Pens", stock_in: 3500, alert_threshold: 200 },
  { item: "Report card rolls", stock_in: 50, alert_threshold: 10 },
  { item: "Pathway cards", stock_in: 3200, alert_threshold: 200 },
  { item: "Handouts - Science", stock_in: 500, alert_threshold: 100 },
  { item: "Handouts - Commerce", stock_in: 500, alert_threshold: 100 },
  { item: "Handouts - Arts", stock_in: 500, alert_threshold: 100 },
  { item: "Handouts - Engineering", stock_in: 500, alert_threshold: 100 },
  { item: "Handouts - Medical", stock_in: 500, alert_threshold: 100 },
  { item: "Handouts - Law", stock_in: 500, alert_threshold: 100 },
  { item: "Handouts - Design", stock_in: 500, alert_threshold: 100 },
  { item: "Handouts - Education", stock_in: 500, alert_threshold: 100 },
  { item: "Handouts - IT/CS", stock_in: 500, alert_threshold: 100 },
  { item: "Handouts - Management", stock_in: 500, alert_threshold: 100 },
  { item: "Scholarship guides", stock_in: 3200, alert_threshold: 200 },
  { item: "Action plan cards", stock_in: 3200, alert_threshold: 200 },
  { item: "Certificate paper", stock_in: 500, alert_threshold: 100 },
];

async function seedIfEmpty(db: ReturnType<typeof getDb>) {
  const check = await db.sql`SELECT COUNT(*)::int AS count FROM career_kit_inventory`;
  if (check.rows[0].count === 0) {
    for (const item of DEFAULT_ITEMS) {
      await db.query(
        `INSERT INTO career_kit_inventory (item, stock_in, stock_out, current_stock, alert_threshold)
         VALUES ($1, $2, 0, $2, $3)
         ON CONFLICT (item) DO NOTHING`,
        [item.item, item.stock_in, item.alert_threshold]
      );
    }
  }
}

export async function GET(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    // Ensure table exists
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

    await seedIfEmpty(db);

    const result = await db.sql`SELECT * FROM career_kit_inventory ORDER BY item`;
    const lowStock = result.rows.filter((r: Record<string, unknown>) => (r.current_stock as number) < (r.alert_threshold as number));

    return NextResponse.json({
      items: result.rows,
      lowStockCount: lowStock.length,
      lowStockItems: lowStock,
    });
  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const body = await request.json();
    const { item, stock_in, stock_out } = body;

    if (!item) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    if (stock_in != null && stock_in > 0) {
      await db.query(
        `UPDATE career_kit_inventory
         SET stock_in = stock_in + $1,
             current_stock = current_stock + $1,
             last_updated = NOW()
         WHERE item = $2`,
        [stock_in, item]
      );
    }

    if (stock_out != null && stock_out > 0) {
      await db.query(
        `UPDATE career_kit_inventory
         SET stock_out = stock_out + $1,
             current_stock = GREATEST(0, current_stock - $1),
             last_updated = NOW()
         WHERE item = $2`,
        [stock_out, item]
      );
    }

    // Log activity
    try {
      const action = stock_in ? `Added ${stock_in} to ${item}` : `Removed ${stock_out} from ${item}`;
      await db.query(
        `INSERT INTO activity_log (user_name, action, entity_type) VALUES ($1, $2, 'inventory')`,
        [user.username, action]
      );
    } catch { /* ignore */ }

    // Return updated item
    const updated = await db.query(`SELECT * FROM career_kit_inventory WHERE item = $1`, [item]);

    return NextResponse.json({ success: true, item: updated.rows[0] });
  } catch (error) {
    console.error("Inventory POST error:", error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}
