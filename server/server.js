// Server entrypoint.
//
// This file is intentionally thin — its only job is to wire the pieces
// together. The actual logic lives in `server/src/`:
//
//   config/      — env, CORS, paths
//   lib/         — DB, auth, helpers
//   middleware/  — auth gate, error handler
//   uploads/     — per-resource multer pipelines
//   routes/      — one file per REST resource
//   staticSpa.js — dist/ + uploads/ + SPA fallback mount
//
// To add a new resource, create `server/src/routes/<name>.js` exporting
// a `register(app)` function, then call it here. Nothing else needs to
// change.

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { PORT } from "./src/config/env.js";
import { ALLOWED_ORIGINS } from "./src/config/cors.js";
import { ensureUploadDirs } from "./src/config/paths.js";
import { readDB } from "./src/lib/db.js";

import { registerHealth } from "./src/routes/health.js";
import { registerAuth } from "./src/routes/auth.js";
import { registerStats } from "./src/routes/stats.js";
import { registerMembers } from "./src/routes/members.js";
import { registerContacts } from "./src/routes/contacts.js";
import { registerApplications } from "./src/routes/applications.js";
import { registerSubscribers } from "./src/routes/subscribers.js";
import { registerMemberships } from "./src/routes/memberships.js";
import { registerPartners } from "./src/routes/partners.js";
import { registerCohorts } from "./src/routes/cohorts.js";
import { registerEvents } from "./src/routes/events.js";
import { registerFeatured } from "./src/routes/featured.js";
import { registerInitiatives } from "./src/routes/initiatives.js";

import { mountStaticSpa } from "./src/staticSpa.js";

// Make sure every per-resource upload folder exists before we start
// accepting requests — multer will crash with ENOENT otherwise.
ensureUploadDirs();

// Read the DB once at boot. This also runs the on-disk migrations
// (admin-user seed, cohort status backfill) and creates a default
// db.json if the file is missing.
readDB();

const app = express();

// Trust the first proxy hop (Apache / Nginx / Cloudflare) so that
// `req.secure`, `req.ip`, and `req.protocol` reflect the *original*
// request rather than the loopback proxy connection. Without this the
// session cookie would be marked insecure in production (because the
// proxy terminates TLS) and SameSite=None cookies would never reach the
// browser.
app.set("trust proxy", 1);

// CORS — allow the dev hosts plus any explicit production origins.
// `credentials: true` so the admin's HttpOnly session cookie
// round-trips between the admin origin (5174) and the API (3000).
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Register API routes. Order is health → auth → stats → resources;
// within resources we go alphabetical so a new contributor can grep
// for where their resource belongs.
registerHealth(app);
registerAuth(app);
registerStats(app);
registerApplications(app);
registerContacts(app);
registerCohorts(app);
registerEvents(app);
registerFeatured(app);
registerInitiatives(app);
registerMembers(app);
registerMemberships(app);
registerPartners(app);
registerSubscribers(app);

// Static SPA mount — must come last. Any /api/* request that hasn't
// matched by now returns 404 from Express.
mountStaticSpa(app);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
