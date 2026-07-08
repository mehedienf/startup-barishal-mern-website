// Allowed origins for CORS.
//
// In dev, `CLIENT_ORIGIN` and `ADMIN_ORIGIN` point at the Vite dev
// servers (5173 / 5174). In production, when SUBDOMAIN_MODE is true,
// the admin lives on its own subdomain and is added via the three
// `*_PUBLIC_HOST` env vars (see `env.js`). When SUBDOMAIN_MODE is
// false, the deployed admin and public site share an origin with the
// API so we just list the single host.

import {
  ADMIN_PUBLIC_HOST,
  API_PUBLIC_HOST,
  CLIENT_PUBLIC_HOST,
  EXTRA_ORIGINS,
  SUBDOMAIN_MODE,
} from "./env.js";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN || "http://localhost:5174";

/** Build a complete origin string from a bare host, defaulting to https. */
function originFromHost(host) {
  if (!host) return null;
  return /^https?:\/\//i.test(host) ? host : `https://${host}`;
}

// Production origins we have to allow through CORS so the admin can call
// the API with `credentials: include` and the browser doesn't block the
// response. Each entry gets de-duplicated before being exported.
const productionOrigins = [];
if (SUBDOMAIN_MODE) {
  for (const host of [CLIENT_PUBLIC_HOST, ADMIN_PUBLIC_HOST, API_PUBLIC_HOST]) {
    const origin = originFromHost(host);
    if (origin) productionOrigins.push(origin);
  }
} else {
  // Single-origin production (legacy): public site + admin + API all on
  // the same host. Both https + http variants are listed so a temporary
  // cert-down scenario still works.
  productionOrigins.push(
    "https://startupbarishal.olivosoft.com",
    "http://startupbarishal.olivosoft.com",
  );
}

const ALL_ORIGINS = [
  CLIENT_ORIGIN,
  ADMIN_ORIGIN,
  ...EXTRA_ORIGINS,
  ...productionOrigins,
];

/** De-duplicate while preserving order — the cors() helper matches with `===`. */
export const ALLOWED_ORIGINS = Array.from(new Set(ALL_ORIGINS));