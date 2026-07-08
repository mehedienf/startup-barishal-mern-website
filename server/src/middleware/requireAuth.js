// `requireAuth` middleware: rejects the request unless the request
// carries a valid signed session cookie.

import { SESSION_COOKIE } from "../config/env.js";
import { verifyToken } from "../lib/auth.js";

export function requireAuth(req, res, next) {
  const token = req.cookies ? req.cookies[SESSION_COOKIE] : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: "Not signed in." });
  }
  req.session = payload;
  next();
}