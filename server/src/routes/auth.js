// Admin login / logout / me.
//
//   POST /api/auth/login   → set HttpOnly signed cookie, return admin
//   POST /api/auth/logout  → clear cookie
//   GET  /api/auth/me      → returns the current admin (or 401)
//
// The session is stateless: a signed token in the cookie carries the
// issue/expiry timestamps. See `lib/auth.js`.
//
// Cookie attributes are environment-driven (env.js) so the same code
// supports two topologies:
//
//   - Single origin (no SUBDOMAIN_MODE): cookie stays host-only with
//     `SameSite=Lax; Secure` when behind HTTPS.
//
//   - Sub-domains (SUBDOMAIN_MODE=true): cookie is set with
//     `Domain=.parent.example` + `SameSite=None; Secure` so the
//     browser sends it across `admin.example.com` ↔ `api.example.com`.

import bcrypt from "bcryptjs";
import { readDB } from "../lib/db.js";
import { signToken, verifyToken } from "../lib/auth.js";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_DOMAIN,
  SESSION_COOKIE_SAMESITE,
  SESSION_COOKIE_SECURE,
  SESSION_TTL_MS,
} from "../config/env.js";

/**
 * Build the cookie-options object for the admin session.
 *
 * `secure` falls back to `req.secure`. Behind a reverse proxy Express
 * needs `app.set('trust proxy', 1)` for `req.secure` to reflect the
 * original X-Forwarded-Proto header — otherwise production cookies
 * will be marked insecure and the browser will drop cross-site cookies
 * after HTTPS termination at the proxy.
 */
function buildCookieOptions(req) {
  const isHttps =
    SESSION_COOKIE_SECURE || req.secure || req.headers["x-forwarded-proto"] === "https";
  return {
    httpOnly: true,
    sameSite: SESSION_COOKIE_SAMESITE,
    secure: isHttps,
    maxAge: SESSION_TTL_MS,
    path: "/",
    // Empty string means "don't set the Domain attribute" → host-only
    // cookie. Otherwise `.example.com` is required (leading dot) so the
    // cookie is shared between `admin.example.com` and `api.example.com`.
    ...(SESSION_COOKIE_DOMAIN ? { domain: SESSION_COOKIE_DOMAIN } : {}),
  };
}

export function registerAuth(app) {
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body || {};
    const db = readDB();
    const user = (db.adminUsers || []).find((u) => u.username === username);
    if (!user || !bcrypt.compareSync(password || "", user.passwordHash || "")) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken({
      sub: user.username,
      exp: Date.now() + SESSION_TTL_MS,
    });
    res.cookie(SESSION_COOKIE, token, buildCookieOptions(req));
    res.json({
      success: true,
      data: { username: user.username },
    });
  });

  /**
   * GET /api/auth/me — used by the admin SPA on every page load to check
   * whether the session cookie is still valid. Returns `{ username }` on
   * success or 401 if the cookie is missing / expired / tampered.
   *
   * NOTE: previously this endpoint didn't exist; the SPA's `checkSession`
   * would always receive 404 and trigger a redirect to the login screen
   * — which is exactly the "refresh kicks me out" bug this commit fixes.
   */
  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies ? req.cookies[SESSION_COOKIE] : null;
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return res.status(401).json({ error: "Not signed in." });
    }
    res.json({ username: payload.sub });
  });

  app.post("/api/auth/logout", (req, res) => {
    // Mirror the same Domain/SameSite/Secure as the original cookie so
    // the browser actually deletes it. Skipping any of these means the
    // browser keeps a "phantom" copy and the user appears still signed
    // in on the next request.
    res.clearCookie(SESSION_COOKIE, buildCookieOptions(req));
    res.json({ success: true });
  });
}
