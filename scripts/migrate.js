import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../src/config/database.js";

const migrationsDirectory = fileURLToPath(
  new URL("../database/migrations/", import.meta.url)
);
const migrationPattern = /^\d{3}_[a-z0-9_]+\.sql$/;

if (!pool) {
  throw new Error(
    "DATABASE_URL is required. Configure it in .env before running migrations."
  );
}

const client = await pool.connect();

try {
  await client.query("BEGIN");
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name varchar(160) PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await client.query("COMMIT");

  const filenames = (await readdir(migrationsDirectory))
    .filter((filename) => migrationPattern.test(filename))
    .sort();

  for (const name of filenames) {
    const applied = await client.query(
      "SELECT 1 FROM schema_migrations WHERE name = $1",
      [name]
    );

    if (applied.rowCount > 0) {
      console.log(`Already applied: ${name}`);
      continue;
    }

    const sql = await readFile(path.join(migrationsDirectory, name), "utf8");

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
        name
      ]);
      await client.query("COMMIT");
      console.log(`Applied: ${name}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw new Error(`Migration ${name} failed: ${error.message}`, {
        cause: error
      });
    }
  }

  console.log("Database migrations are up to date.");
} finally {
  client.release();
  await pool.end();
}
