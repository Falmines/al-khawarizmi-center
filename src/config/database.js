import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = env.databaseUrl
  ? new Pool({
      connectionString: env.databaseUrl,
      ssl: env.postgresSsl ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000
    })
  : null;

pool?.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

export async function closeDatabase() {
  if (pool) {
    await pool.end();
  }
}
