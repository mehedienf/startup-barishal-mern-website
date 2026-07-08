/* Static-SPA mount.
 *
 * This server hosts two separate SPA bundles out of one of two layouts:
 *
 *   SUBDOMAIN_MODE=false (default — single origin):
 *
 *     dist/index.html         ← public site at /
 *     dist/admin/index.html   ← admin console at /admin
 *
 *   SUBDOMAIN_MODE=true (sub-domain topology):
 *
 *     dist/client/index.html    ← public site at /    (only on CLIENT_PUBLIC_HOST)
 *     dist/admin/index.html     ← admin console at /  (only on ADMIN_PUBLIC_HOST)
 *
 * In the sub-domain layout the API typically lives on its own host too
 * (API_PUBLIC_HOST) and the reverse proxy is what forwards
 * `admin.example.com/api/*` and `api.example.com/api/*` here. The
 * server picks the right shell purely from the request's `Host`
 * header, so both sub-domains can sit behind the same Node process.
 *
 * The asset folders are intentionally *separate* (`dist/client/assets`
 * vs `dist/admin/assets`) — Vite emits hashed filenames like
 * `index-abc123.js` and a single shared folder would collide between
 * the two bundles.
 */

import fs from "node:fs";
import path from "node:path";
import express from "express";
import {
  DIST_DIR,
  SERVER_UPLOADS_DIR,
  LEGACY_UPLOADS_DIR,
} from "./config/paths.js";
import {
  ADMIN_PUBLIC_HOST,
  CLIENT_PUBLIC_HOST,
  SUBDOMAIN_MODE,
} from "./config/env.js";

/** Resolve the on-disk root for a given shell based on layout. */
function shellRoot(shell) {
  if (SUBDOMAIN_MODE) {
    return shell === "admin"
      ? path.join(DIST_DIR, "admin")
      : path.join(DIST_DIR, "client");
  }
  // Single-origin layout: `dist/` is the public site, admin sits under
  // `dist/admin/`.
  return shell === "admin"
    ? path.join(DIST_DIR, "admin")
    : DIST_DIR;
}

/** File-extension guard: if the last path segment has an extension,
 *  treat the request as a missing asset (404) instead of returning the
 *  SPA shell. */
function looksLikeAsset(req) {
  const last = req.path.split("/").pop() || "";
  return /\.[a-zA-Z0-9]+$/.test(last);
}

/** Bare hostname from a request — strips the port and lowercases so
 *  comparisons are robust against `Host: example.com:443` vs `Host:
 *  example.com`. */
function requestHost(req) {
  const host = req.headers.host || "";
  return host.split(":")[0].toLowerCase();
}

/** Decide which shell (`public` | `admin`) should serve this request.
 *  Returns `null` when neither applies. */
function pickShell(req) {
  const host = requestHost(req);
  if (SUBDOMAIN_MODE) {
    if (ADMIN_PUBLIC_HOST && host === ADMIN_PUBLIC_HOST.toLowerCase()) {
      return "admin";
    }
    if (CLIENT_PUBLIC_HOST && host === CLIENT_PUBLIC_HOST.toLowerCase()) {
      return "public";
    }
    // Hosts configured but this request didn't match → 404 (the
    // unknown origin can hit /api/* but won't get a UI).
    if (ADMIN_PUBLIC_HOST || CLIENT_PUBLIC_HOST) return null;
  }
  // Legacy single-origin dispatch: /admin/* → admin shell, else public.
  if (req.path === "/admin" || req.path.startsWith("/admin/")) {
    return "admin";
  }
  return "public";
}

/** Register the static-asset, upload, and SPA-fallback layers. */
export function mountStaticSpa(app) {
  const publicRoot = shellRoot("public");
  const adminRoot = shellRoot("admin");

  // (1) Static asset folders — we use top-level `app.use()` rather than
  // host-gated routing because Express.static short-circuits internally
  // and missing files just fall through to the SPA fallback. The folder
  // layout guarantees the two bundles never accidentally serve each
  // other's hashed bundles.
  app.use(
    "/assets",
    express.static(path.join(publicRoot, "assets"), {
      maxAge: "30d",
      immutable: true,
    }),
  );
  app.use(
    "/admin/assets",
    express.static(path.join(adminRoot, "assets"), {
      maxAge: "30d",
      immutable: true,
    }),
  );

  // (2) Uploads — the JSON DB references these URLs and we need to be
  // able to read them back. Legacy partners live under the admin asset
  // tree (kept for backwards compatibility with pre-refactor URLs).
  app.use(
    "/uploads",
    express.static(SERVER_UPLOADS_DIR, { maxAge: "7d" }),
  );
  app.use(
    "/uploads/partners",
    express.static(LEGACY_UPLOADS_DIR, { maxAge: "7d" }),
  );

  // (3) Anything else in dist/ (favicon, manifest, etc.) — fall through
  // to the SPA fallback if missing.
  app.use(express.static(publicRoot));

  // (4) Resolve which index.html we'll serve, if any. Failure to find
  // them isn't fatal (the API still works) — just log and skip.
  const publicIndex = path.join(publicRoot, "index.html");
  const adminIndex = path.join(adminRoot, "index.html");
  let publicIndexAvailable = false;
  let adminIndexAvailable = false;
  try {
    if (fs.existsSync(publicRoot)) {
      publicIndexAvailable = fs.existsSync(publicIndex);
    }
    if (fs.existsSync(adminRoot)) {
      adminIndexAvailable = fs.existsSync(adminIndex);
    }
    if (!publicIndexAvailable && !adminIndexAvailable && !fs.existsSync(DIST_DIR)) {
      console.warn(
        `[staticSpa] dist/ not found at ${DIST_DIR}. Static SPA mount skipped — API only.`,
      );
    }
  } catch (error) {
    console.warn(`[staticSpa] failed to inspect dist/ — ${error.message}`);
  }

  // SPA fallback: send the appropriate shell for the request. The
  // exclude-/-api/ regex keeps API 404s from Express (not the SPA).
  app.get(/^(?!\/api\/|\/uploads\/).*/, (req, res, next) => {
    if (looksLikeAsset(req)) return next();
    const shell = pickShell(req);
    if (shell === "admin" && adminIndexAvailable) {
      return res.sendFile(adminIndex);
    }
    if (shell === "public" && publicIndexAvailable) {
      return res.sendFile(publicIndex);
    }
    // No shell matched (e.g. request hit a sub-domain we don't serve)
    // — fall through so /api/* etc. still surface a real 404.
    return next();
  });
}
