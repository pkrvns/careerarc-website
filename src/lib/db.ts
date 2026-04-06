import { createPool, VercelPool } from "@vercel/postgres";

let _pool: VercelPool | null = null;

export function getDb(): VercelPool {
  if (!_pool) {
    const connectionString =
      process.env.POSTGRES_URL ||
      process.env.STORAGE_URL ||
      process.env.DATABASE_URL ||
      "";

    _pool = createPool({ connectionString });
  }
  return _pool;
}
