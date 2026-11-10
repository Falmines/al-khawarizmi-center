
import "dotenv/config";
import pg from "pg";
import { env } from "../src/config/env.js";

const { Pool } = pg;

let closePromise = null;

function getSSLConfig() {
  const mode = String(
    env.postgresSsl ?? "false"
  ).toLowerCase();

  if (mode === "false" || mode === "disable") {
    return false;
  }

  if (mode === "no-verify") {
    return { rejectUnauthorized: false };
  }

  return { rejectUnauthorized: true };
}

export const pool = env.databaseUrl
  ? new Pool({
      connectionString: env.databaseUrl,
      ssl: getSSLConfig(),

      max: process.env.VERCEL ? 2 : 10,

      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,

      allowExitOnIdle: true
    })
  : null;

// Handle unexpected pool errors
pool?.on("error", (error) => {
  console.error(
    "[PostgreSQL] Unexpected pool error:",
    error.message
  );
});

// Check database connection
export async function checkDatabaseConnection() {
  if (!pool) {
    return {
      connected: false,
      message: "DATABASE_URL is not configured"
    };
  }

  let client;

  try {
    client = await pool.connect();

    const result = await client.query(`
      SELECT
        NOW() AS server_time,
        current_database() AS database_name,
        current_user AS database_user
    `);

    return {
      connected: true,
      message: "PostgreSQL connected successfully",
      database: result.rows[0].database_name,
      user: result.rows[0].database_user,
      serverTime: result.rows[0].server_time
    };

  } catch (error) {
    console.error(
      "[PostgreSQL] Connection failed:",
      error.message
    );

    return {
      connected: false,
      message: error.message
    };

  } finally {
    client?.release();
  }
}

// Execute SQL queries
export async function query(sql, params = []) {
  if (!pool) {
    throw new Error(
      "PostgreSQL is not configured. Set DATABASE_URL."
    );
  }

  return pool.query(sql, params);
}

// Close connection pool safely
export async function closeDatabase() {
  if (!pool) return;

  closePromise ??= pool.end();

  await closePromise;
}
