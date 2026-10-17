import { pool } from "../config/database.js";
import { programs as defaultPrograms } from "../data/programs.js";

const publishedProgramsQuery = `
  SELECT slug AS id, title, description
  FROM programs
  WHERE status = 'published'
  ORDER BY
    CASE slug
      WHEN 'livein' THEN 1
      WHEN 'kerjabakti' THEN 2
      WHEN 'kids' THEN 3
      WHEN 'baksos' THEN 4
      ELSE 5
    END,
    title,
    slug
`;

export async function listPublishedPrograms(database = pool) {
  if (!database) {
    return defaultPrograms;
  }

  const { rows } = await database.query(publishedProgramsQuery);
  return rows;
}

export async function findPublishedProgramBySlug(slug, database = pool) {
  if (!database) {
    return defaultPrograms.find((program) => program.id === slug) ?? null;
  }

  const { rows } = await database.query(
    `SELECT slug AS id, title, description
     FROM programs
     WHERE slug = $1 AND status = 'published'
     LIMIT 1`,
    [slug]
  );

  return rows[0] ?? null;
}
