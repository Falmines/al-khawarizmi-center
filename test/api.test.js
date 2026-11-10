import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import app from "../src/app.js";

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("serves the website and its assets", async () => {
  const page = await fetch(baseUrl);
  const html = await page.text();

  assert.equal(page.status, 200);
  assert.match(html, /Al-Khawarizmi Center/);

  for (const asset of [
    "/css/style.css",
    "/js/script.js",
    "/assets/images/al-khawarizmi-seal.png"
  ]) {
    const response = await fetch(new URL(asset, baseUrl));
    assert.equal(response.status, 200, `${asset} should be served`);
  }
});

test("serves every Grand Plan poster in the separate poster gallery", async () => {
  const page = await fetch(baseUrl);
  const html = await page.text();
  const visionIndex = html.indexOf('id="vision-mission"');
  const posterIndex = html.indexOf('id="grandplan-posters"');
  const textPlanIndex = html.indexOf('id="grandplan"');
  const posterPaths = [...html.matchAll(/data-poster-src="([^"]+)"/g)].map((match) => match[1]);
  const previewPaths = [...html.matchAll(/<img src="(\/assets\/images\/grand-plan\/thumbnails\/[^"]+\.jpg)"/g)].map((match) => match[1]);

  assert.ok(visionIndex >= 0 && visionIndex < posterIndex);
  assert.ok(posterIndex < textPlanIndex);
  assert.equal(posterPaths.length, 18);
  assert.equal(previewPaths.length, 18);

  for (const posterPath of [
    "/assets/images/grand-plan/visi-misi.png",
    "/assets/images/grand-plan/vision.png",
    "/assets/images/grand-plan/mission.png"
  ]) {
    assert.ok(posterPaths.includes(posterPath), `${posterPath} should appear in the gallery`);
    const posterResponse = await fetch(new URL(posterPath, baseUrl), { method: "HEAD" });
    assert.equal(posterResponse.status, 200, `${posterPath} should be served`);
    const previewPath = posterPath.replace("/grand-plan/", "/grand-plan/thumbnails/").replace(".png", ".jpg");
    assert.ok(previewPaths.includes(previewPath), `${previewPath} should be used for the thumbnail`);
    const previewResponse = await fetch(new URL(previewPath, baseUrl), { method: "HEAD" });
    assert.equal(previewResponse.status, 200, `${previewPath} should be served`);
  }

  for (const year of [2027, 2028, 2029, 2030, 2031]) {
    for (const phase of [1, 2, 3]) {
      const posterPath = `/assets/images/grand-plan/${year}-phase-${phase}.png`;
      assert.ok(posterPaths.includes(posterPath), `${posterPath} should appear in the gallery`);
      const response = await fetch(new URL(posterPath, baseUrl), { method: "HEAD" });
      assert.equal(response.status, 200, `${posterPath} should be served`);
      const previewPath = posterPath.replace("/grand-plan/", "/grand-plan/thumbnails/").replace(".png", ".jpg");
      assert.ok(previewPaths.includes(previewPath), `${previewPath} should be used for the thumbnail`);
      const previewResponse = await fetch(new URL(previewPath, baseUrl), { method: "HEAD" });
      assert.equal(previewResponse.status, 200, `${previewPath} should be served`);
    }
  }
});

test("returns health status and security headers", async () => {
  const response = await fetch(`${baseUrl}/api/v1/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-powered-by"), null);
});

test("lists programs and returns one program by ID", async () => {
  const listResponse = await fetch(`${baseUrl}/api/v1/programs`);
  const list = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.equal(list.data.length, 4);

  const detailResponse = await fetch(
    `${baseUrl}/api/v1/programs/livein`
  );
  const detail = await detailResponse.json();
  assert.equal(detailResponse.status, 200);
  assert.equal(detail.data.title, "Riset Lapangan");
});

test("validates program IDs and returns consistent errors", async () => {
  const invalid = await fetch(`${baseUrl}/api/v1/programs/invalid%21`);
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).error.message, "Invalid program ID.");

  const missing = await fetch(`${baseUrl}/api/v1/programs/not-found`);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error.message, "Program not found.");
});

test("blocks origins not present in the CORS allowlist", async () => {
  const response = await fetch(`${baseUrl}/api/v1/health`, {
    headers: { origin: "https://not-allowed.example" }
  });

  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.message, "Origin not allowed.");
});

test("returns JSON for unknown routes", async () => {
  const response = await fetch(`${baseUrl}/api/v1/unknown`);

  assert.equal(response.status, 404);
  assert.equal((await response.json()).error.message, "Resource not found.");
});
