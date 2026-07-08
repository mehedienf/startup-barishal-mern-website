// Admin session token: stateless, HMAC-signed, base64url-encoded.
//
// The token is `<base64url(json)>.<base64url(hmac)>` — no DB lookup on
// every request, just verify the signature and the `exp` claim.
//
// Sign in (POST /api/auth/login) issues a token, /api/auth/me verifies
// one, and the `requireAuth` middleware enforces that verification on
// every protected route.

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { SESSION_SECRET, SESSION_TTL_MS } from "../config/env.js";

function base64urlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(input) {
  const padded =
    input.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((input.length + 3) % 4);
  return Buffer.from(padded, "base64").toString();
}

/** Sign a payload and return `<base64url(json)>.<base64url(hmac)>`. */
export function signToken(payload) {
  const body = base64urlEncode(JSON.stringify(payload));
  const sig = base64urlEncode(
    crypto.createHmac("sha256", SESSION_SECRET).update(body).digest(),
  );
  return `${body}.${sig}`;
}

/**
 * Verify a token. Returns the decoded payload on success, or `null` if
 * the signature is invalid, the format is wrong, or the token has
 * expired.
 */
export function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = base64urlEncode(
    crypto.createHmac("sha256", SESSION_SECRET).update(body).digest(),
  );
  // Constant-time compare to avoid timing leaks on the signature.
  const ok =
    expected.length === sig.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  if (!ok) return null;

  let payload;
  try {
    payload = JSON.parse(base64urlDecode(body));
  } catch {
    return null;
  }
  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.exp !== "number" ||
    payload.exp < Date.now()
  ) {
    return null;
  }
  return payload;
}

/**
 * Ensure the DB has at least one admin user. Returns `true` if the DB
 * was modified (caller should persist), `false` if the user already
 * existed. The default credentials are sourced from `config/env.js`
 * so production deploys can override them via env vars.
 */
export function seedAdminUser(db, defaults) {
  const users = db.adminUsers || [];
  if (users.length > 0) return false;
  const username = defaults.username;
  const passwordHash = bcrypt.hashSync(defaults.password, 10);
  db.adminUsers = [
    { username, passwordHash, createdAt: new Date().toISOString() },
  ];
  return true;
}