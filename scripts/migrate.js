import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { closeDatabase, pool } from "../db/db.js";

const migrationsDirectory = fileURLToPath(
  new URL("../database/migrations/", import.meta.url)
);
const migrationPattern = /^\d{3}_[a-z0-9_]+\.sql$/;
const migrationLock = [0x414c4b, 1];

if (!pool) {
  throw new Error(
    "DATABASE_URL is required. Configure it in .env before running migrations."
  );
}

async function runMigrations() {
  let client;
  let lockAcquired = false;
  let migrationError;

  try {
    try {
      client = await pool.connect();
    } catch (error) {
      const reason = error.code ?? error.message;
      throw new Error(
        `Could not connect to PostgreSQL (${reason}). Verify that DATABASE_URL uses the correct project hostname, port, database, and password.`,
        { cause: error }
      );
    }

    await client.query("SELECT pg_advisory_lock($1, $2)", migrationLock);
    lockAcquired = true;

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name varchar(160) PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

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
        try {
          await client.query("ROLLBACK");
        } catch (rollbackError) {
          console.error(`Rollback failed for migration ${name}:`, rollbackError);
        }
        throw new Error(`Migration ${name} failed: ${error.message}`, {
          cause: error
        });
      }
    }

    console.log("Database migrations are up to date.");
  } catch (error) {
    migrationError = error;
    throw error;
  } finally {
    if (client) {
      if (lockAcquired) {
        try {
          await client.query("SELECT pg_advisory_unlock($1, $2)", migrationLock);
        } catch (unlockError) {
          client.release(unlockError);
          client = undefined;
          if (migrationError) {
            console.error("Failed to release the migration lock:", unlockError);
          } else {
            throw new Error("Failed to release the migration lock.", {
              cause: unlockError
            });
          }
        }
      }
      client?.release();
    }
    await closeDatabase();
  }
}

await runMigrations();
