import assert from "node:assert/strict";
import { test } from "node:test";
import {
  findPublishedProgramBySlug,
  listPublishedPrograms
} from "../src/repositories/programRepository.js";
import { programs } from "../src/data/programs.js";

test("lists published programs from PostgreSQL", async () => {
  let executedQuery;
  const expectedRows = [{ id: "livein", title: "Riset Lapangan", description: "Research" }];
  const database = {
    async query(query) {
      executedQuery = query;
      return { rows: expectedRows };
    }
  };

  assert.deepEqual(await listPublishedPrograms(database), expectedRows);
  assert.match(executedQuery, /FROM programs/);
  assert.match(executedQuery, /status = 'published'/);
});

test("finds a published program by parameterized slug", async () => {
  let executedValues;
  const expectedRow = { id: "livein", title: "Riset Lapangan", description: "Research" };
  const database = {
    async query(_query, values) {
      executedValues = values;
      return { rows: [expectedRow] };
    }
  };

  assert.deepEqual(
    await findPublishedProgramBySlug("livein", database),
    expectedRow
  );
  assert.deepEqual(executedValues, ["livein"]);
});

test("uses bundled programs only when PostgreSQL is not configured", async () => {
  assert.deepEqual(await listPublishedPrograms(null), programs);
  assert.equal(
    (await findPublishedProgramBySlug("livein", null)).title,
    "Riset Lapangan"
  );
  assert.equal(await findPublishedProgramBySlug("unknown", null), null);
});
