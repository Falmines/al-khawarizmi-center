import "dotenv/config";

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  databaseUrl: process.env.DATABASE_URL?.trim() || null,
  jwtSecret: process.env.JWT_SECRET || null,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
  corsOrigins: (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  postgresSsl: process.env.PGSSL === "true"
});
