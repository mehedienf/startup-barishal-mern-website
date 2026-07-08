// Centralized environment variable parsing.
//
// All env reads go through this module so:
//   1. The rest of the code never calls `process.env.X` directly.
//   2. Defaults are documented in one place.
//   3. Tests can mock this module to vary config without touching the
//      real environment.
//
// See `server/.env.example` for the full list of supported variables.

import dotenv from "dotenv";

dotenv.config();

/** Server port. Defaults to 3000 for local dev. */
export const PORT = Number(process.env.PORT) || 3000;

/**
 * HMAC key used to sign admin session tokens. MUST be set to a random
 * string in production. The dev fallback is intentionally weak — if you
 * see "dev-only-…" in the boot log you are not running production.
 */
export const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "dev-only-startup-barishal-session-secret-change-me-7e2c";

/** Admin username seeded into the DB on first boot. */
export const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";

/** Admin password seeded into the DB on first boot. */
export const DEFAULT_ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "startupbarishal";

/** Cookie name for the admin session token. */
export const SESSION_COOKIE =
  process.env.SESSION_COOKIE || "sb_admin_session";

/** Session lifetime in milliseconds (7 days by default). */
export const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS) ||
  7 * 24 * 60 * 60 * 1000;

/**
 * Comma-separated list of additional origins allowed through CORS. Used
 * to allow the deployed admin at e.g. https://startupbarishal.olivosoft.com
 * when the API is hosted on a separate origin / behind a reverse proxy.
 */
export const EXTRA_ORIGINS = (process.env.EXTRA_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// -------------------------------------------------------------------------
// Sub-domain hosting topology
// -------------------------------------------------------------------------
//
// When SUBDOMAIN_MODE is true the public site, the admin console, and the
// API live on three separate origins that share a parent domain:
//
//     Public:  https://<CLIENT_PUBLIC_HOST>/
//     Admin:   https://<ADMIN_PUBLIC_HOST>/
//     API:     https://<API_PUBLIC_HOST>/api/*
//
// In that mode the server's cookie has to be set with:
//   - `Domain=.parent`            (so the browser sends it across subdomains)
//   - `SameSite=None; Secure`    (required for cross-site fetch calls)
// and the SPA-fallback mount has to pick the right `index.html` based on
// the request's Host header.
//
// When SUBDOMAIN_MODE is unset/false the code keeps the original
// behaviour: single origin, no Domain attribute, SameSite=Lax, and the
// admin shell is served from `<dist>/admin/index.html`.
//
// Set the three *_PUBLIC_HOST vars to the *bare* host (no protocol, no
// path). Defaults match the typical production layout for this project.
// -------------------------------------------------------------------------

export const SUBDOMAIN_MODE =
  (process.env.SUBDOMAIN_MODE || "").toLowerCase() === "true";

/** Bare host serving the public site, e.g. `startupbarishal.olivosoft.com`. */
export const CLIENT_PUBLIC_HOST =
  process.env.CLIENT_PUBLIC_HOST || "";

/** Bare host serving the admin console, e.g. `admin.startupbarishal.olivosoft.com`. */
export const ADMIN_PUBLIC_HOST =
  process.env.ADMIN_PUBLIC_HOST || "";

/** Bare host serving the API, e.g. `api.startupbarishal.olivosoft.com`. */
export const API_PUBLIC_HOST =
  process.env.API_PUBLIC_HOST || "";

/**
 * Cookie `Domain` attribute. Empty means "host-only" (the cookie is only
 * sent to the exact host that set it). `.example.com` means "any
 * subdomain of example.com". Use a leading dot so the cookie is shared
 * between `admin.example.com` and `api.example.com`.
 */
export const SESSION_COOKIE_DOMAIN =
  process.env.SESSION_COOKIE_DOMAIN || "";

/**
 * Cookie `SameSite`. Strictest is `strict`, then `lax` (default), then
 * `none`. `none` REQUIRES `Secure=true` and is needed whenever the admin
 * SPA on one subdomain calls the API on a different subdomain.
 */
export const SESSION_COOKIE_SAMESITE =
  (process.env.SESSION_COOKIE_SAMESITE || "lax").toLowerCase();

/**
 * Cookie `Secure` flag. When unset we derive it from `req.secure` (which
 * becomes reliable once `app.set('trust proxy', 1)` is configured) and
 * fall back to `false`. Force to `true` in production to make sure
 * cross-site cookies are accepted.
 */
export const SESSION_COOKIE_SECURE = (() => {
  const raw = (process.env.SESSION_COOKIE_SECURE || "").toLowerCase();
  if (raw === "true") return true;
  if (raw === "false") return false;
  // Default: force `Secure` whenever `SameSite=None` because browsers
  // reject `SameSite=None` cookies without the `Secure` attribute.
  return SESSION_COOKIE_SAMESITE === "none";
})();

/**
 * Origin used by the admin SPA's "Public Site" link. Falls back to the
 * dev server when unset so local development keeps working.
 */
export const PUBLIC_SITE_URL =
  process.env.PUBLIC_SITE_URL || "http://localhost:5173";