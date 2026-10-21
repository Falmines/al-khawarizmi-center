import "dotenv/config";

const cleanValue = (value) => {
  if (typeof value !== "string") return null;

  const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
  return trimmed || null;
};

const normalizeDatabaseUrl = (value) => {
  const candidate = cleanValue(value);
  if (!candidate) return null;

  const withoutRepeatedPrefix = candidate.replace(/^DATABASE_URL=/i, "").trim();
  const finalValue = cleanValue(withoutRepeatedPrefix);

  return finalValue || null;
};

const buildDatabaseUrl = () => {
  const configuredUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (configuredUrl) {
    return configuredUrl;
  }

  const host = cleanValue(process.env.PGHOST) ?? "localhost";
  const port = cleanValue(process.env.PGPORT) ?? "5432";
  const database = cleanValue(process.env.PGDATABASE) ?? "al_khawarizmi_center";
  const user = cleanValue(process.env.PGUSER) ?? "postgres";
  const password = cleanValue(process.env.PGPASSWORD);

  if (!password) {
    return null;
  }

  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
};

const port = Number(process.env.PORT ?? 3000);
const postgresSsl = (cleanValue(process.env.PGSSL) ?? "false").toLowerCase();

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

if (!["false", "true", "require", "verify-full"].includes(postgresSsl)) {
  throw new Error("PGSSL must be false, true, require, or verify-full.");
}

export const env = Object.freeze({
  nodeEnv: cleanValue(process.env.NODE_ENV) ?? "development",
  port,
  databaseUrl: buildDatabaseUrl(),
  jwtSecret: cleanValue(process.env.JWT_SECRET) ?? "development-secret-change-me",
  jwtExpiresIn: cleanValue(process.env.JWT_EXPIRES_IN) ?? "1h",
  corsOrigins: (cleanValue(process.env.CORS_ORIGIN) ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  postgresSsl,
  adminEmail: cleanValue(process.env.ADMIN_EMAIL)?.toLowerCase() ?? null,
  adminPassword: cleanValue(process.env.ADMIN_PASSWORD) ?? null
});
