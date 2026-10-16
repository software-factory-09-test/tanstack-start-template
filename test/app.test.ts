import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("sanity check", () => {
  assert.equal(1 + 1, 2);
});

test("canonical template bloatware removal invariants", () => {
  const repoRoot = path.resolve(import.meta.dirname, "..");
  const srcDir = path.join(repoRoot, "src");

  // Secondary routes and footer must not exist
  assert.equal(fs.existsSync(path.join(srcDir, "routes/about.tsx")), false, "about.tsx should be removed");
  assert.equal(fs.existsSync(path.join(srcDir, "components/Footer.tsx")), false, "Footer.tsx should be removed");

  // routeTree.gen.ts must not contain references to about
  const routeTreeContent = fs.readFileSync(path.join(srcDir, "routeTree.gen.ts"), "utf-8");
  assert.equal(routeTreeContent.includes("AboutRoute"), false, "routeTree should not contain AboutRoute");
  assert.equal(routeTreeContent.includes("about"), false, "routeTree should not contain about");

  // Root layout must not import Footer or TanStackDevtools
  const rootContent = fs.readFileSync(path.join(srcDir, "routes/__root.tsx"), "utf-8");
  assert.equal(rootContent.includes("Footer"), false, "__root.tsx should not reference Footer");
  assert.equal(rootContent.includes("TanStackDevtools"), false, "__root.tsx should not reference TanStackDevtools");

  // Header must not contain external links or about link
  const headerContent = fs.readFileSync(path.join(srcDir, "components/Header.tsx"), "utf-8");
  assert.equal(headerContent.includes("to=\"/about\""), false, "Header should not link to /about");
  assert.equal(headerContent.includes("tanstack.com"), false, "Header should not link to tanstack.com");
  assert.equal(headerContent.includes("x.com"), false, "Header should not link to x.com");
  assert.equal(headerContent.includes("github.com"), false, "Header should not link to github.com");

  // Index route must contain clean workspace prompt and no marketing copy
  const indexContent = fs.readFileSync(path.join(srcDir, "routes/index.tsx"), "utf-8");
  assert.ok(indexContent.includes("Application Workspace"), "index.tsx should contain Application Workspace");
  assert.ok(indexContent.includes("Ready for development. Prompt Factory Studio to build features and components."), "index.tsx should contain prompt guidance");
  assert.equal(indexContent.includes("Start simple, ship quickly"), false, "index.tsx should not contain old hero headline");
  assert.equal(indexContent.includes("TANSTACK START BASE TEMPLATE"), false, "index.tsx should not contain old kicker");
  assert.equal(indexContent.includes("Type-Safe Routing"), false, "index.tsx should not contain feature cards");
});

