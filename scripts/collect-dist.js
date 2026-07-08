#!/usr/bin/env node
// Combines the per-app Vite outputs into a single `dist/` directory at the
// repo root so the existing `.cpanel.yml` (`cp -R dist/* $DEPLOYPATH`) keeps
// working without modification.
//
// Layout produced:
//
//   dist/index.html          <-- client (public site)
//   dist/assets/...          <-- client bundle + hashed logo files
//   dist/admin/index.html    <-- admin console (served at /admin/*)
//   dist/admin/assets/...    <-- admin bundle + its hashed logo files
//
// Without this step both apps build into `client/dist/` and `admin/dist/`
// separately, which means the root `dist/` that `.cpanel.yml` expects is
// empty after `npm run build`.

import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const out = path.join(root, "dist");
const sources = [
  { from: path.join(root, "client", "dist"), to: out }, // public site at /
  { from: path.join(root, "admin", "dist"), to: path.join(out, "admin") },
];

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(sources[0].from))) {
    console.error(
      `[collect-dist] missing ${sources[0].from} — run "npm run build:client" first`,
    );
    process.exit(1);
  }
  if (!(await exists(sources[1].from))) {
    console.error(
      `[collect-dist] missing ${sources[1].from} — run "npm run build:admin" first`,
    );
    process.exit(1);
  }

  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  for (const { from, to } of sources) {
    await cp(from, to, { recursive: true });
    console.log(`[collect-dist] copied ${path.relative(root, from)} -> ${path.relative(root, to)}`);
  }

  console.log(`[collect-dist] done -> ${path.relative(root, out)}`);
}

main().catch((err) => {
  console.error("[collect-dist] failed:", err);
  process.exit(1);
});