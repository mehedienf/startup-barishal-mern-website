// JSON-file backed mock DB.
//
// `readDB()` lazily creates the file with `seedDefaults()` if missing
// and runs any pending migrations. `writeDB()` is a thin wrapper around
// `fs.writeFileSync`. Both are synchronous because every write is
// immediately flushed to disk — durability > throughput for an admin
// tool.
//
// This module also exposes `newId(prefix)` so route files don't have to
// import crypto themselves.

import fs from "node:fs";
import path from "node:path";
import { DB_FILE } from "../config/paths.js";
import {
  DEFAULT_ADMIN_USERNAME,
  DEFAULT_ADMIN_PASSWORD,
} from "../config/env.js";
import { seedAdminUser } from "./auth.js";

/** Generate a short random id with a resource prefix, e.g. `evt-7aeltq76`. */
export function newId(prefix) {
  return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Coerce a value to a non-negative integer. Used for the home-page stats
 * (eventsCount, startupsMentored, investorsOnboarded, cohortsCompleted)
 * so the admin form can post strings and the public site always gets
 * a clean number.
 *
 * `null` is returned for `null`/empty-string inputs so the caller can
 * treat those as "clear the override" (see /api/homeStats).
 */
export function coerceStat(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

/** Like `coerceStat` but defaults to 0 instead of null. */
export function numOrZero(v) {
  const n = coerceStat(v);
  return n === null ? 0 : n;
}

/** Initial seed for a fresh DB. Used by `readDB()` on first run. */
function seedDefaults() {
  return {
    contacts: [
      { id: "msg-1234", firstName: "Sabbir", lastName: "Hassan", email: "sabbir@example.com", subject: "Mentorship", message: "I am a CSE student from Barishal University. I have a prototype for an agritech platform and would love to get structural mentoring regarding business registration.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "msg-5678", firstName: "Nadia", lastName: "Islam", email: "nadia.islam@startup.bd", subject: "Partnership", message: "We represent a microfinance fund looking to explore supporting local incubators with standard seed matching. Let us schedule a conference call.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    applications: [
      { id: "app-9876", fullName: "Zamil Ahmed", email: "zamil@greenbarishal.co", startupName: "GreenBarishal Logistics", stage: "Early Traction", description: "Eco-friendly last-mile delivery system utilizing electric vans to transport fresh fish from Barishal divisions directly to major markets.", teamSize: 5, status: "Approved", notes: "Outstanding logistics unit. Approved for June cohort incubation, allocated workspace desk.", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "app-5432", fullName: "Tahmina Akter", email: "tahmina@sheinnovates.io", startupName: "SheInnovates EdTech", stage: "Prototype", description: "An offline-first interactive learning kit matching technical training in regional schools to global tech syllabi.", teamSize: 3, status: "Pending", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    subscribers: [
      { id: "sub-1", email: "enammehedi06@gmail.com", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "sub-2", email: "partner@barishalhub.org", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    memberships: [],
    teamMembers: [
      { id: "team-001", name: "Tahmid Rahman", role: "Founder and Lead Mentor", bio: "Ex-Product Lead turned ecosystem builder. 8 years of experience scaling regional SaaS startups across Bangladesh.", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", linkedinUrl: "https://linkedin.com/in/tahmid", order: 1, createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "team-002", name: "Mehedi Hasan", role: "Program Director", bio: "Coordinates incubation cohorts and matches founders with the right mentors. Passionate about student-led startups.", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80", linkedinUrl: "https://linkedin.com/in/mehedi", order: 2, createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "team-003", name: "Sumaiya Akter", role: "Investor Relations Lead", bio: "Connects cohort startups with angel investors and micro-VCs in Bangladesh. Previously at a fintech accelerator.", photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80", linkedinUrl: "https://linkedin.com/in/sumaiya", order: 3, createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    events: [
      { id: "evt-001", title: "Startup Networking Summit 2024", date: "2024-06-25", location: "Barishal Innovation Hub", description: "Connect with fellow entrepreneurs, investors, and mentors in the Barishal startup ecosystem. This premier networking event brings together industry leaders and successful founders.", coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80", status: "Past", gallery: ["https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"], createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "evt-002", title: "Product Development Workshop", date: "2024-07-05", location: "Tech Academy Center", description: "Learn essential skills in MVP development and customer validation through hands-on exercises and real-world case studies.", coverImage: "https://images.unsplash.com/photo-1531535934027-667f687cada1?auto=format&fit=crop&w=800&q=80", status: "Past", gallery: ["https://images.unsplash.com/photo-1531535934027-667f687cada1?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1542744173-8e7e53415bb6?auto=format&fit=crop&w=800&q=80"], createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "evt-003", title: "Fundraising Masterclass", date: "2024-07-15", location: "Business District Conference Room", description: "Understand the investor perspective and learn how to pitch your startup effectively. Topics include equity, valuation, and due diligence.", coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80", status: "Past", gallery: ["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80"], createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "evt-004", title: "Tech Demo Day", date: "2024-08-10", location: "Grand Convention Hall", description: "Showcase your innovative products to a room full of investors, media, and industry experts.", coverImage: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80", status: "Past", gallery: ["https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"], createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    incubationPrograms: [
      { id: "prog-001", title: "Pre-Seed Cohort", summary: "For first-time founders with an idea or paper prototype. 4-week sprint to validate problem-solution fit.", duration: "4 weeks", benefits: ["Office desk + high-speed internet", "1:1 mentorship (weekly)", "Up to BDT 50,000 micro-grant", "Intro to angel investor network"], eligibility: "Student or first-time founder with a problem statement validated by at least 5 user interviews.", status: "live", createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "prog-002", title: "Early-Stage Cohort", summary: "For teams with a working MVP. 8-week program to reach first paying customers and prepare for seed.", duration: "8 weeks", benefits: ["Dedicated office space", "Biannual mentor matching", "Up to BDT 250,000 seed matching", "Demo Day presentation slot", "AWS / Google Cloud credits"], eligibility: "Team of 2-5 with a deployed MVP and at least 10 active users.", status: "closed", createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "prog-003", title: "Growth Cohort", summary: "For post-revenue startups ready to scale. 12-week intensive focused on unit economics and Series A readiness.", duration: "12 weeks", benefits: ["Premium office + meeting rooms", "Investor matching and pitch coaching", "Up to BDT 1,000,000 follow-on funding", "Legal and IP advisory", "Accountability group with peer founders"], eligibility: "Revenue-generating startup with at least 3 months of consistent MRR.", status: "closed", createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  };
}

/**
 * Migrations that should run on every read. Each migration must be
 * idempotent and self-check whether it has work to do (the migration
 * itself decides whether to persist).
 *
 * Currently:
 *   - `seedAdminUser`: write the default admin into a brand-new DB.
 *   - cohort `status` backfill: pre-feature cohorts defaulted to closed,
 *     with the first one promoted to live if none are live yet.
 */
function runMigrations(data) {
  let touched = false;

  if (
    seedAdminUser(data, {
      username: DEFAULT_ADMIN_USERNAME,
      password: DEFAULT_ADMIN_PASSWORD,
    })
  ) {
    writeDB(data);
    touched = true;
  }

  if (Array.isArray(data.incubationPrograms)) {
    let sawLive = false;
    let cohortTouched = false;
    data.incubationPrograms = data.incubationPrograms.map((p) => {
      if (!p.status) {
        cohortTouched = true;
        if (!sawLive) {
          sawLive = true;
          return { ...p, status: "live" };
        }
        return { ...p, status: "closed" };
      }
      return p;
    });
    if (cohortTouched) {
      writeDB(data);
      touched = true;
    }
  }

  return touched;
}

/**
 * Read the DB from disk. Creates the file with `seedDefaults()` if it
 * doesn't exist, then runs any pending migrations. Returns the parsed
 * object on success.
 *
 * On a parse/IO error we fall back to an in-memory `seedDefaults()` so
 * the server keeps serving (without persistence) rather than crashing.
 */
export function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = seedDefaults();
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    runMigrations(data);
    return data;
  } catch (error) {
    console.error("DB Read Error, reverting to memory DB:", error);
    return seedDefaults();
  }
}

/** Persist the DB to disk. Errors are logged but never thrown so the
 *  request handler always returns a sane response to the client. */
export function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("DB Write Error:", error);
  }
}