import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/inventory_verification';

export const pool = new Pool({
  connectionString,
});

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}
