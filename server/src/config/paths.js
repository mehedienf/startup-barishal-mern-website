// All filesystem paths used by the server live here.
//
// Centralizing them means that changing the upload layout, the build
// folder, or the DB location only touches one file. Upload subfolders
// are created at boot via `ensureUploadDirs()`.

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Repo root — two levels up from server/src/config/paths.js. */
export const REPO_ROOT = path.join(__dirname, "..", "..", "..");

/** The directory server.js itself lives in (server/). */
export const SERVER_ROOT = path.join(__dirname, "..", "..");

/** JSON-file mock DB. Lives next to the server bundle so it survives
 *  `node --watch` reloads and `npm run collect:dist` rewrites. */
export const DB_FILE = path.join(SERVER_ROOT, "data", "db.json");

/**
 * Combined production build directory (created by `npm run build` at
 * the repo root). When present, the server hosts both the public site
 * (`/`) and the admin console (`/admin`) on the same origin as the API,
 * which keeps the auth cookie same-site and removes CORS complications
 * on a cPanel deploy.
 *
 * Override via env var if the build lives elsewhere on the host.
 */
export const DIST_DIR =
  process.env.DIST_DIR || path.join(REPO_ROOT, "dist");

// ---------- Upload folders ----------
//
// Legacy: the original admin/src/assets/partners folder is still served
// at /uploads/partners/* so existing seed URLs keep resolving. New
// partner uploads land in SERVER_UPLOADS_DIR instead.

/** Legacy seed assets (read-only, served as /uploads/*). */
export const LEGACY_UPLOADS_DIR = path.join(
  REPO_ROOT,
  "admin",
  "src",
  "assets",
  "partners",
);

/** Where all newly-uploaded files land. */
export const SERVER_UPLOADS_DIR = path.join(SERVER_ROOT, "uploads");

export const EVENT_UPLOADS_DIR = path.join(SERVER_UPLOADS_DIR, "events");
export const COHORT_UPLOADS_DIR = path.join(SERVER_UPLOADS_DIR, "cohorts");
export const TEAM_UPLOADS_DIR = path.join(SERVER_UPLOADS_DIR, "teams");
export const PARTNER_UPLOADS_DIR = path.join(SERVER_UPLOADS_DIR, "partners");
export const FEATURED_UPLOADS_DIR = path.join(SERVER_UPLOADS_DIR, "featured");
export const INITIATIVE_UPLOADS_DIR = path.join(SERVER_UPLOADS_DIR, "initiatives");

const ALL_UPLOAD_DIRS = [
  LEGACY_UPLOADS_DIR,
  EVENT_UPLOADS_DIR,
  COHORT_UPLOADS_DIR,
  TEAM_UPLOADS_DIR,
  PARTNER_UPLOADS_DIR,
  FEATURED_UPLOADS_DIR,
  INITIATIVE_UPLOADS_DIR,
];

/**
 * Create every upload subdirectory at boot. Safe to run repeatedly —
 * mkdir with { recursive: true } is idempotent.
 */
export function ensureUploadDirs() {
  for (const dir of ALL_UPLOAD_DIRS) {
    fs.mkdirSync(dir, { recursive: true });
  }
}