#!/usr/bin/env node
// Combines the per-app Vite outputs into a single `dist/` directory at the
// repo root so the existing `.cpanel.yml` (`cp -R dist/* $DEPLOYPATH`) keeps
// working without modification.
//
// Layout produced (sub-domain topology — `SUBDOMAIN_MODE=true`):
//
//   dist/client/index.html      <-- public site (served at https://<CLIENT_PUBLIC_HOST>/)
//   dist/client/assets/...      <-- public bundle + hashed logo files
//   dist/admin/index.html       <-- admin console (served at https://<ADMIN_PUBLIC_HOST>/)
//   dist/admin/assets/...       <-- admin bundle + its hashed logo files
//
// Layout produced (legacy single-origin — default):
//
//   dist/index.html          <-- public site at /
//   dist/assets/...          <-- public bundle
//   dist/admin/index.html    <-- admin console (served at /admin)
//   dist/admin/assets/...    <-- admin bundle
//
// Both layouts coexist so a deploy can flip the topology by changing
// `SUBDOMAIN_MODE` without rebuilding — the server reads whichever
// layout exists on disk.
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
  { from: path.join(root, "client", "dist"), to: path.join(out, "client") },
  { from: path.join(root, "admin", "dist"), to: path.join(out, "admin") },
];

// The Apache `.htaccess` lives in `public/` at the repo root and is copied
// verbatim into `dist/` AFTER the wipe so it survives every build. Without
// this copy step the file would be erased by the `rm(out, ...)` below and
// SPA deep links (e.g. /about) would 404 on the deployed cPanel host.
const htaccessSource = path.join(root, "public", ".htaccess");
const htaccessDest = path.join(out, ".htaccess");

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

  // Copy the Apache SPA-fallback `.htaccess` from `public/` into the
  // merged output so the next `npm run build` doesn't wipe it. The rule
  // is hard-coded to rewrite to /index.html, which is the public site;
  // on the admin sub-domain the reverse proxy is responsible for its
  // own SPA fallback (Passenger/Nginx) so this .htaccess never runs.
  if (await exists(htaccessSource)) {
    await cp(htaccessSource, htaccessDest);
    console.log(`[collect-dist] copied public/.htaccess -> dist/.htaccess`);
  } else {
    console.warn(`[collect-dist] WARNING: ${htaccessSource} not found — SPA deep links will 404 on refresh`);
  }

  console.log(`[collect-dist] done -> ${path.relative(root, out)}`);
}

main().catch((err) => {
  console.error("[collect-dist] failed:", err);
  process.exit(1);
});