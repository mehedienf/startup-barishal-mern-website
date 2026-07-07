import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN || "http://localhost:5174";
const DB_FILE = path.join(__dirname, "data", "db.json");
const UPLOADS_DIR = path.join(__dirname, "..", "admin", "src", "assets", "partners");
const SERVER_UPLOADS_DIR = path.join(__dirname, "uploads");
const EVENT_UPLOADS_DIR = path.join(SERVER_UPLOADS_DIR, "events");
const COHORT_UPLOADS_DIR = path.join(SERVER_UPLOADS_DIR, "cohorts");
const TEAM_UPLOADS_DIR = path.join(SERVER_UPLOADS_DIR, "teams");
const PARTNER_UPLOADS_DIR = path.join(SERVER_UPLOADS_DIR, "partners");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(EVENT_UPLOADS_DIR, { recursive: true });
fs.mkdirSync(COHORT_UPLOADS_DIR, { recursive: true });
fs.mkdirSync(TEAM_UPLOADS_DIR, { recursive: true });
fs.mkdirSync(PARTNER_UPLOADS_DIR, { recursive: true });

// ---------- Helpers ----------
function newId(prefix) {
  return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
}

function crudRouter(app, resourceName, prefix, requiredFields = []) {
  app.get(`/api/${resourceName}`, (_req, res) => {
    const db = readDB();
    res.json(db[resourceName] || []);
  });

  app.get(`/api/${resourceName}/:id`, (req, res) => {
    const db = readDB();
    const item = (db[resourceName] || []).find((x) => x.id === req.params.id);
    if (!item) return res.status(404).json({ error: `${resourceName} record not found.` });
    res.json(item);
  });

  app.post(`/api/${resourceName}`, (req, res) => {
    for (const field of requiredFields) {
      if (!req.body[field] || (typeof req.body[field] === "string" && !req.body[field].trim())) {
        return res.status(400).json({ error: `Field "${field}" is required.` });
      }
    }
    const db = readDB();
    if (!db[resourceName]) db[resourceName] = [];
    const item = {
      id: newId(prefix),
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    db[resourceName].unshift(item);
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  app.put(`/api/${resourceName}/:id`, (req, res) => {
    const db = readDB();
    const arr = db[resourceName] || [];
    const idx = arr.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: `${resourceName} record not found.` });
    arr[idx] = { ...arr[idx], ...req.body, id: arr[idx].id, updatedAt: new Date().toISOString() };
    db[resourceName] = arr;
    writeDB(db);
    res.json({ success: true, data: arr[idx] });
  });

  app.delete(`/api/${resourceName}/:id`, (req, res) => {
    const db = readDB();
    const arr = db[resourceName] || [];
    const idx = arr.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: `${resourceName} record not found.` });
    const [removed] = arr.splice(idx, 1);
    db[resourceName] = arr;
    writeDB(db);
    res.json({ success: true, data: removed });
  });
}

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

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = seedDefaults();
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    // Migration: backfill `status` on cohorts that pre-date the field.
    // First live program wins; rest default to closed. Persist once.
    if (Array.isArray(data.incubationPrograms)) {
      let touched = false;
      let sawLive = false;
      data.incubationPrograms = data.incubationPrograms.map((p) => {
        if (!p.status) {
          touched = true;
          if (!sawLive) {
            sawLive = true;
            return { ...p, status: "live" };
          }
          return { ...p, status: "closed" };
        }
        return p;
      });
      if (touched) writeDB(data);
    }
    return data;
  } catch (error) {
    console.error("DB Read Error, reverting to memory DB:", error);
    return seedDefaults();
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("DB Write Error:", error);
  }
}

const app = express();

app.use(
  cors({
    origin: [CLIENT_ORIGIN, ADMIN_ORIGIN],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "startup-barishal-server", port: PORT });
});

app.get("/api/stats", (_req, res) => {
  const db = readDB();
  res.json({
    cohortsCompleted: 4,
    eventsCount: (db.events || []).length,
    startupsMentored: (db.applications || []).filter((a) => a.status === "Approved").length + 12,
    investorsOnboarded: 5,
    currentApplicationsCount: (db.applications || []).length,
    currentContactsCount: (db.contacts || []).length,
    currentSubscribersCount: (db.subscribers || []).length,
    currentTeamCount: (db.teamMembers || []).length,
    currentProgramsCount: (db.incubationPrograms || []).length,
    currentMembershipsCount: (db.memberships || []).length,
  });
});

/**
 * Public members directory — returns only Approved memberships with a
 * safe, curated shape (no email/phone/notes/message exposed).
 *
 * Sorted: newest approvals first. Each entry gets a stable `joinedAt`
 * string so the UI can pretty-print the join month/year.
 */
app.get("/api/members", (_req, res) => {
  const db = readDB();
  const list = (db.memberships || [])
    .filter((m) => m.status === "Approved")
    .sort((a, b) => {
      const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return tb - ta;
    })
    .map((m) => {
      const stamp = m.updatedAt || m.createdAt || null;
      const d = stamp ? new Date(stamp) : null;
      const joinedAt = d && !Number.isNaN(d.getTime())
        ? d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : null;
      const initials = (m.fullName || "?")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "?";
      return {
        id: m.id,
        fullName: m.fullName || "Member",
        email: m.email || "",
        phone: m.phone || "",
        organization: m.organization || "",
        role: m.role || "",
        interests: Array.isArray(m.interests) ? m.interests : [],
        joinedAt,
        initials,
      };
    });
  res.json(list);
});

app.post("/api/contact", (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: "Email and Message fields are required." });
  }
  const db = readDB();
  const newMsg = {
    id: newId("msg"),
    firstName: firstName || "",
    lastName: lastName || "",
    email,
    subject: subject || "General Inquiry",
    message,
    createdAt: new Date().toISOString(),
  };
  if (!db.contacts) db.contacts = [];
  db.contacts.unshift(newMsg);
  writeDB(db);
  res.status(201).json({ success: true, message: "Thank you! Your message was saved.", data: newMsg });
});

app.get("/api/contacts", (_req, res) => {
  res.json(readDB().contacts || []);
});

app.post("/api/applications", (req, res) => {
  const { fullName, email, startupName, stage, description, teamSize, programId, programName } = req.body;
  if (!fullName || !email || !startupName || !description) {
    return res.status(400).json({ error: "Full Name, Email, Startup Name and Project Description are required." });
  }
  const db = readDB();
  const newApp = {
    id: newId("app"),
    fullName,
    email,
    startupName,
    stage: stage || "Prototype",
    description,
    teamSize: Number(teamSize) || 1,
    status: "Pending",
    // Cohort/program the applicant applied against. Optional so older
    // submissions without this field still render cleanly in admin.
    programId: programId || null,
    programName: programName || null,
    createdAt: new Date().toISOString(),
  };
  if (!db.applications) db.applications = [];
  db.applications.unshift(newApp);
  writeDB(db);
  res.status(201).json({ success: true, message: "Successfully submitted.", data: newApp });
});

app.get("/api/applications", (_req, res) => {
  res.json(readDB().applications || []);
});

app.put("/api/applications/:id", (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const db = readDB();
  const idx = (db.applications || []).findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ error: "Application not found in DB." });
  db.applications[idx].status = status || db.applications[idx].status;
  if (notes !== undefined) db.applications[idx].notes = notes;
  writeDB(db);
  res.json({ success: true, message: "Application status updated.", data: db.applications[idx] });
});

/**
 * Bulk delete for inbox-style resources (subscribers, applications, contacts).
 *
 * Body: { ids?: string[], filter?: { field, op, value }, all?: boolean }
 *  - ids:    remove these specific records
 *  - filter: remove records matching a single field predicate
 *            (op ∈ "equals" | "contains")
 *  - all:    remove every record (used by "clear all visible" button)
 *
 * Returns { success, deleted, remaining }.
 */
function bulkDeleteResource(app, resource, allowedFields = []) {
  app.delete(`/api/${resource}/bulk`, (req, res) => {
    const db = readDB();
    const list = db[resource] || [];
    const { ids, filter, all } = req.body || {};

    let survivors;
    let deletedCount;

    if (all === true) {
      deletedCount = list.length;
      survivors = [];
    } else if (Array.isArray(ids) && ids.length > 0) {
      const idSet = new Set(ids);
      survivors = list.filter((r) => !idSet.has(r.id));
      deletedCount = list.length - survivors.length;
    } else if (filter && typeof filter === "object" && filter.field) {
      if (allowedFields.length > 0 && !allowedFields.includes(filter.field)) {
        return res.status(400).json({
          error: `Filter field "${filter.field}" is not allowed for ${resource}.`,
        });
      }
      const op = filter.op || "equals";
      const val = filter.value;
      survivors = list.filter((r) => {
        const target = r[filter.field];
        if (target == null) return false;
        if (op === "contains") {
          return String(target).toLowerCase().includes(String(val).toLowerCase());
        }
        // default: equals (case-insensitive for strings)
        if (typeof target === "string" && typeof val === "string") {
          return target.toLowerCase() === val.toLowerCase();
        }
        return target === val;
      });
      deletedCount = list.length - survivors.length;
    } else {
      return res.status(400).json({
        error: "Provide one of: ids[], filter{...}, or all:true.",
      });
    }

    db[resource] = survivors;
    writeDB(db);
    res.json({
      success: true,
      deleted: deletedCount,
      remaining: survivors.length,
    });
  });
}

bulkDeleteResource(app, "subscribers", ["email"]);
bulkDeleteResource(app, "applications", ["status", "stage"]);
bulkDeleteResource(app, "contacts", ["subject", "email"]);
bulkDeleteResource(app, "memberships", ["status"]);

app.post("/api/newsletter", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }
  const db = readDB();
  const subs = db.subscribers || [];
  const emails = subs.map((s) => s.email.toLowerCase());
  if (emails.includes(email.toLowerCase())) {
    return res.json({ success: true, message: "Already subscribed." });
  }
  const newSub = { id: newId("sub"), email, createdAt: new Date().toISOString() };
  subs.unshift(newSub);
  db.subscribers = subs;
  writeDB(db);
  res.status(201).json({ success: true, message: "Subscribed successfully.", data: newSub });
});

app.get("/api/subscribers", (_req, res) => {
  res.json(readDB().subscribers || []);
});

// Three new resources get full CRUD via the factory.
// Three new resources get full CRUD via the factory.
crudRouter(app, "teamMembers", "team", ["name", "role"]);
// Custom DELETE so we can wipe the per-member uploads folder on disk.
app.delete("/api/teamMembers/:id", async (req, res) => {
  const db = readDB();
  const arr = db.teamMembers || [];
  const idx = arr.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "teamMembers record not found." });
  const [removed] = arr.splice(idx, 1);
  db.teamMembers = arr;
  writeDB(db);
  await removeTeamFolder(removed.id);
  res.json({ success: true, data: removed });
});

// Cohorts (incubationPrograms) get a dedicated router because the
// constraint is stricter than plain CRUD: at most one program can be
// "live" at a time. The public client only ever reads the live one
// via /api/incubation-programs/active.
const COHORT_REQUIRED = ["title", "summary", "duration"];
const COHORT_STATUSES = new Set(["live", "closed"]);

function normalizeCohortStatus(value, fallback = "closed") {
  if (typeof value !== "string") return fallback;
  const v = value.trim().toLowerCase();
  return COHORT_STATUSES.has(v) ? v : fallback;
}

function cohortsRouter(app) {
  // Admin: list all (including closed).
  app.get("/api/incubationPrograms", (_req, res) => {
    const db = readDB();
    res.json(db.incubationPrograms || []);
  });

  // Public: only the currently live cohort. 404 if none.
  app.get("/api/incubationPrograms/active", (_req, res) => {
    const db = readDB();
    const list = db.incubationPrograms || [];
    const live = list.find((p) => p.status === "live");
    if (!live) return res.status(404).json({ error: "No active cohort is currently running." });
    res.json(live);
  });

  app.get("/api/incubationPrograms/:id", (req, res) => {
    const db = readDB();
    const item = (db.incubationPrograms || []).find((x) => x.id === req.params.id);
    if (!item) return res.status(404).json({ error: "incubationPrograms record not found." });
    res.json(item);
  });

  app.post("/api/incubationPrograms", (req, res) => {
    for (const field of COHORT_REQUIRED) {
      if (!req.body[field] || (typeof req.body[field] === "string" && !req.body[field].trim())) {
        return res.status(400).json({ error: `Field "${field}" is required.` });
      }
    }
    const db = readDB();
    if (!db.incubationPrograms) db.incubationPrograms = [];
    const incomingStatus = normalizeCohortStatus(req.body.status, "closed");
    // Single-active guard: if this one is going live, demote any current live.
    if (incomingStatus === "live") {
      db.incubationPrograms = db.incubationPrograms.map((p) =>
        p.status === "live" ? { ...p, status: "closed", updatedAt: new Date().toISOString() } : p
      );
    }
    const item = {
      id: newId("prog"),
      ...req.body,
      status: incomingStatus,
      createdAt: new Date().toISOString(),
    };
    db.incubationPrograms.unshift(item);
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  app.put("/api/incubationPrograms/:id", (req, res) => {
    const db = readDB();
    const arr = db.incubationPrograms || [];
    const idx = arr.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "incubationPrograms record not found." });
    const incomingStatus = req.body.status === undefined
      ? arr[idx].status
      : normalizeCohortStatus(req.body.status, arr[idx].status);
    // Single-active guard.
    if (incomingStatus === "live") {
      for (let i = 0; i < arr.length; i++) {
        if (i !== idx && arr[i].status === "live") {
          arr[i] = { ...arr[i], status: "closed", updatedAt: new Date().toISOString() };
        }
      }
    }
    arr[idx] = {
      ...arr[idx],
      ...req.body,
      id: arr[idx].id,
      status: incomingStatus,
      updatedAt: new Date().toISOString(),
    };
    db.incubationPrograms = arr;
    writeDB(db);
    res.json({ success: true, data: arr[idx] });
  });

  app.delete("/api/incubationPrograms/:id", async (req, res) => {
    const db = readDB();
    const arr = db.incubationPrograms || [];
    const idx = arr.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "incubationPrograms record not found." });
    const [removed] = arr.splice(idx, 1);
    db.incubationPrograms = arr;
    writeDB(db);
    // Best-effort cleanup of the per-cohort uploads folder.
    await removeCohortFolder(removed.id);
    res.json({ success: true, data: removed });
  });
}

cohortsRouter(app);

// Events use the factory for POST/PUT (and GET), but DELETE is custom so we
// can also wipe the per-event uploads folder on disk.
crudRouter(app, "events", "evt", ["title", "date", "location", "description"]);
app.delete("/api/events/:id", async (req, res) => {
  const db = readDB();
  const arr = db.events || [];
  const idx = arr.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "events record not found." });
  const [removed] = arr.splice(idx, 1);
  db.events = arr;
  writeDB(db);
  // Best-effort cleanup of the per-event uploads folder.
  await removeEventFolder(removed.id);
  res.json({ success: true, data: removed });
});

// ---------- Partner logo upload ----------
// New logos land in server/uploads/partners/<partnerId>/<file>. The legacy
// admin/src/assets/partners folder is still mounted under /uploads/partners so
// existing seed URLs (e.g. /uploads/partners/brand-x.png) keep resolving until
// the admin re-uploads them.
const PARTNER_ALLOWED_IMAGE_MIME = /^image\/(png|jpe?g|webp|gif|svg\+xml)$/i;
const partnerLogoStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(PARTNER_UPLOADS_DIR, req.params.id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    cb(null, `logo-${stamp}${ext}`);
  },
});
const partnerLogoUpload = multer({
  storage: partnerLogoStorage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB
  fileFilter: (_req, file, cb) => {
    if (PARTNER_ALLOWED_IMAGE_MIME.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files (png/jpg/webp/gif/svg) are allowed."));
  },
});

// Pulls the first uploaded file regardless of whether the client sent
// field "logo" (legacy form) or "photo" (the shared ResourcePage UI).
function pickPartnerLogoFile(req) {
  if (req.file) return req.file;
  if (Array.isArray(req.files) && req.files.length) return req.files[0];
  if (req.files && typeof req.files === "object") {
    for (const key of Object.keys(req.files)) {
      const entry = req.files[key];
      if (Array.isArray(entry) && entry[0]) return entry[0];
    }
  }
  return null;
}

function publicUrlForPartnerLogo(partnerId, filename) {
  return `/uploads/partners/${partnerId}/${filename}`;
}

function removePartnerLogoIfOwned(partnerId, url) {
  if (!url || typeof url !== "string") return;
  const prefix = publicUrlForPartnerLogo(partnerId, "");
  if (!url.startsWith(prefix)) return;
  const safe = path.basename(url);
  const filePath = path.join(PARTNER_UPLOADS_DIR, partnerId, safe);
  fs.promises.unlink(filePath).catch(() => {});
}

async function removePartnerFolder(partnerId) {
  const dir = path.join(PARTNER_UPLOADS_DIR, partnerId);
  await fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {});
}

// Serve uploaded files statically.  /uploads/partners/* prefers the new
// server/uploads/partners tree and falls back to admin/src/assets/partners
// for legacy seed URLs.
app.use(
  "/uploads/partners",
  express.static(PARTNER_UPLOADS_DIR)
);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "admin", "src", "assets"))
);
app.use("/uploads", express.static(SERVER_UPLOADS_DIR));

// Partners — full CRUD plus a special "upload logo" endpoint.
// Stored schema: { id, name, website?, logoUrl, order }
const PARTNER_REQUIRED = ["name"]; // logoUrl optional; upload endpoint fills it in

function partnerRouter(app) {
  app.get("/api/partners", (_req, res) => {
    const db = readDB();
    const list = (db.partners || []).slice().sort(
      (a, b) => (a.order ?? 99) - (b.order ?? 99)
    );
    res.json(list);
  });

  app.get("/api/partners/:id", (req, res) => {
    const db = readDB();
    const item = (db.partners || []).find((p) => p.id === req.params.id);
    if (!item) return res.status(404).json({ error: "Partner not found" });
    res.json(item);
  });

  app.post("/api/partners", (req, res) => {
    for (const f of PARTNER_REQUIRED) {
      if (!req.body[f] || (typeof req.body[f] === "string" && !req.body[f].trim())) {
        return res.status(400).json({ error: `Field "${f}" is required.` });
      }
    }
    const db = readDB();
    if (!db.partners) db.partners = [];
    const item = {
      id: newId("part"),
      name: req.body.name,
      website: req.body.website || "",
      logoUrl: req.body.logoUrl || "",
      order: Number(req.body.order) || db.partners.length + 1,
      createdAt: new Date().toISOString(),
    };
    db.partners.unshift(item);
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  app.put("/api/partners/:id", (req, res) => {
    const db = readDB();
    const arr = db.partners || [];
    const idx = arr.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Partner not found" });
    arr[idx] = {
      ...arr[idx],
      ...req.body,
      id: arr[idx].id,
      updatedAt: new Date().toISOString(),
    };
    writeDB(db);
    res.json({ success: true, data: arr[idx] });
  });

  app.delete("/api/partners/:id", async (req, res) => {
    const db = readDB();
    const arr = db.partners || [];
    const idx = arr.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Partner not found" });
    const [removed] = arr.splice(idx, 1);
    // Best-effort cleanup of the orphan logo on disk (only files we own).
    if (removed?.logoUrl) {
      removePartnerLogoIfOwned(removed.id, removed.logoUrl);
    }
    // Wipe the entire per-partner uploads folder so future creates with the
    // same id start clean. Awaited so the response confirms cleanup completed.
    await removePartnerFolder(removed.id);
    writeDB(db);
    res.json({ success: true, data: removed });
  });
}

partnerRouter(app);

// Dedicated logo upload endpoint (multipart/form-data, field: "logo")
// Stores the file under server/uploads/partners/<partnerId>/ and writes
// logoUrl = /uploads/partners/<partnerId>/<filename> onto the partner record.
app.post(
  "/api/partners/:id/logo",
  partnerLogoUpload.any(),
  (req, res) => {
    const file = pickPartnerLogoFile(req);
    if (!file) return res.status(400).json({ error: "No file uploaded." });
    const db = readDB();
    const arr = db.partners || [];
    const idx = arr.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      fs.unlink(file.path, () => {});
      return res.status(404).json({ error: "Partner not found." });
    }
    removePartnerLogoIfOwned(arr[idx].id, arr[idx].logoUrl);
    arr[idx].logoUrl = publicUrlForPartnerLogo(arr[idx].id, file.filename);
    arr[idx].updatedAt = new Date().toISOString();
    writeDB(db);
    res.json({ success: true, data: arr[idx] });
  }
);

// PUT alias — some admin UIs prefer PUT.
app.put(
  "/api/partners/:id/logo",
  partnerLogoUpload.any(),
  (req, res) => {
    const file = pickPartnerLogoFile(req);
    if (!file) return res.status(400).json({ error: "No file uploaded." });
    const db = readDB();
    const arr = db.partners || [];
    const idx = arr.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      fs.unlink(file.path, () => {});
      return res.status(404).json({ error: "Partner not found." });
    }
    removePartnerLogoIfOwned(arr[idx].id, arr[idx].logoUrl);
    arr[idx].logoUrl = publicUrlForPartnerLogo(arr[idx].id, file.filename);
    arr[idx].updatedAt = new Date().toISOString();
    writeDB(db);
    res.status(200).json({ success: true, data: arr[idx] });
  }
);

// DELETE only the logo (keeps the partner record, clears logoUrl).
app.delete("/api/partners/:id/logo", (req, res) => {
  const db = readDB();
  const arr = db.partners || [];
  const idx = arr.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Partner not found." });
  removePartnerLogoIfOwned(arr[idx].id, arr[idx].logoUrl);
  arr[idx].logoUrl = "";
  arr[idx].updatedAt = new Date().toISOString();
  writeDB(db);
  res.json({ success: true, data: arr[idx] });
});

// ---------- Membership applications ----------
// Stored schema:
//   { id, fullName, email, phone, organization, role,
//     interests: string[], message, status, notes, createdAt, updatedAt }
// Public-site submissions land with status="Pending"; admins move them to
// "Approved" or "Rejected" from the admin Memberships page.
app.post("/api/memberships", (req, res) => {
  const { fullName, email, message } = req.body;
  if (!fullName || !email || !message) {
    return res.status(400).json({
      error: "Full name, email, and message are required.",
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }
  const db = readDB();
  if (!db.memberships) db.memberships = [];
  const item = {
    id: newId("mem"),
    fullName,
    email,
    phone: req.body.phone || "",
    organization: req.body.organization || "",
    role: req.body.role || "",
    interests: Array.isArray(req.body.interests)
      ? req.body.interests.filter(Boolean)
      : [],
    message,
    notes: "",
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  db.memberships.unshift(item);
  writeDB(db);
  res.status(201).json({ success: true, data: item });
});

crudRouter(app, "memberships", "mem");

// ---------- Event image uploads ----------
// Files land in server/uploads/events/<eventId>/<random>.<ext>
// URL prefix is /uploads/events/<eventId>/<file>
const ALLOWED_IMAGE_MIME = /^image\/(png|jpe?g|webp|gif)$/i;

const eventImageStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const eventId = req.params.id;
    const dir = path.join(EVENT_UPLOADS_DIR, eventId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    cb(null, `img-${stamp}${ext}`);
  },
});
const eventImageUpload = multer({
  storage: eventImageStorage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB per file
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files (png/jpg/webp/gif) are allowed."));
  },
});

function publicUrlForEventFile(eventId, filename) {
  return `/uploads/events/${eventId}/${filename}`;
}

function removeEventFileIfOwned(eventId, url) {
  if (!url || typeof url !== "string") return;
  const prefix = publicUrlForEventFile(eventId, "");
  if (!url.startsWith(prefix)) return;
  const safe = path.basename(url);
  const filePath = path.join(EVENT_UPLOADS_DIR, eventId, safe);
  fs.promises.unlink(filePath).catch(() => {});
}

async function removeEventFolder(eventId) {
  const dir = path.join(EVENT_UPLOADS_DIR, eventId);
  await fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {});
}

// Add one or more images to an event's gallery (and optionally the cover).
// Multipart fields: "images" (one or more files).  If "cover=true" is in the
// body, the FIRST uploaded file becomes the new cover image.
app.post(
  "/api/events/:id/images",
  eventImageUpload.array("images", 20),
  (req, res) => {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: "No files uploaded." });
    }
    const db = readDB();
    const arr = db.events || [];
    const idx = arr.findIndex((e) => e.id === req.params.id);
    if (idx === -1) {
      files.forEach((f) => fs.unlink(f.path, () => {}));
      return res.status(404).json({ error: "Event not found." });
    }

    const wantCover = String(req.body.cover || "").toLowerCase() === "true";
    const gallery = Array.isArray(arr[idx].gallery) ? arr[idx].gallery : [];

    const newUrls = files.map((f) =>
      publicUrlForEventFile(arr[idx].id, f.filename)
    );

    if (wantCover) {
      // Replace existing cover (if owned by us).
      removeEventFileIfOwned(arr[idx].id, arr[idx].coverImage);
      arr[idx].coverImage = newUrls[0];
      // Remaining files (if any) still go into the gallery.
      for (const url of newUrls.slice(1)) gallery.push(url);
    } else {
      for (const url of newUrls) gallery.push(url);
      // Convenience: if the event has no cover yet, the first uploaded
      // image becomes the cover so the strip card isn't blank.
      if (!arr[idx].coverImage && newUrls.length) {
        arr[idx].coverImage = newUrls[0];
      }
    }

    arr[idx].gallery = gallery;
    arr[idx].updatedAt = new Date().toISOString();
    writeDB(db);
    res.json({ success: true, data: arr[idx] });
  }
);

// Explicit cover-image replacement endpoint.
app.put("/api/events/:id/cover", eventImageUpload.single("cover"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No cover file uploaded." });
  const db = readDB();
  const arr = db.events || [];
  const idx = arr.findIndex((e) => e.id === req.params.id);
  if (idx === -1) {
    fs.unlink(req.file.path, () => {});
    return res.status(404).json({ error: "Event not found." });
  }
  removeEventFileIfOwned(arr[idx].id, arr[idx].coverImage);
  arr[idx].coverImage = publicUrlForEventFile(arr[idx].id, req.file.filename);
  arr[idx].updatedAt = new Date().toISOString();
  writeDB(db);
  res.json({ success: true, data: arr[idx] });
});

// Remove a single image file (and clear coverImage / splice gallery).
// DELETE /api/events/:id/images?url=/uploads/events/<id>/<file>
app.delete("/api/events/:id/images", (req, res) => {
  const url = req.query.url;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing image url query parameter." });
  }
  const db = readDB();
  const arr = db.events || [];
  const idx = arr.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Event not found." });

  // Only allow deletion of URLs that live under our event folder.
  const prefix = publicUrlForEventFile(arr[idx].id, "");
  if (!url.startsWith(prefix)) {
    return res.status(400).json({
      error: "Only locally uploaded event images can be removed here.",
    });
  }

  if (arr[idx].coverImage === url) {
    removeEventFileIfOwned(arr[idx].id, url);
    arr[idx].coverImage = "";
  } else {
    const gallery = Array.isArray(arr[idx].gallery) ? arr[idx].gallery : [];
    const next = gallery.filter((u) => u !== url);
    if (next.length !== gallery.length) {
      removeEventFileIfOwned(arr[idx].id, url);
      arr[idx].gallery = next;
    } else {
      // URL wasn't in gallery or cover, but still try to delete the file
      // (admin cleanup).
      removeEventFileIfOwned(arr[idx].id, url);
    }
  }
  arr[idx].updatedAt = new Date().toISOString();
  writeDB(db);
  res.json({ success: true, data: arr[idx] });
});

// ---------- Cohort cover image uploads ----------
// Files land in server/uploads/cohorts/<cohortId>/cover-<random>.<ext>
// URL prefix is /uploads/cohorts/<cohortId>/<file>
const cohortCoverStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const cohortId = req.params.id;
    const dir = path.join(COHORT_UPLOADS_DIR, cohortId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    cb(null, `cover-${stamp}${ext}`);
  },
});
const cohortCoverUpload = multer({
  storage: cohortCoverStorage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files (png/jpg/webp/gif) are allowed."));
  },
});

function publicUrlForCohortFile(cohortId, filename) {
  return `/uploads/cohorts/${cohortId}/${filename}`;
}

function removeCohortFileIfOwned(cohortId, url) {
  if (!url || typeof url !== "string") return;
  const prefix = publicUrlForCohortFile(cohortId, "");
  if (!url.startsWith(prefix)) return;
  const safe = path.basename(url);
  const filePath = path.join(COHORT_UPLOADS_DIR, cohortId, safe);
  fs.promises.unlink(filePath).catch(() => {});
}

async function removeCohortFolder(cohortId) {
  const dir = path.join(COHORT_UPLOADS_DIR, cohortId);
  await fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {});
}

// Upload / replace cohort cover image.
// Multipart field: "cover" (single file).
app.post(
  "/api/incubationPrograms/:id/cover",
  cohortCoverUpload.single("cover"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No cover file uploaded." });
    const db = readDB();
    const arr = db.incubationPrograms || [];
    const idx = arr.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ error: "Cohort not found." });
    }
    removeCohortFileIfOwned(arr[idx].id, arr[idx].coverImage);
    arr[idx].coverImage = publicUrlForCohortFile(arr[idx].id, req.file.filename);
    arr[idx].updatedAt = new Date().toISOString();
    writeDB(db);
    res.status(201).json({ success: true, data: arr[idx] });
  }
);

// Same endpoint, PUT alias (used by some admin UIs).
app.put(
  "/api/incubationPrograms/:id/cover",
  cohortCoverUpload.single("cover"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No cover file uploaded." });
    const db = readDB();
    const arr = db.incubationPrograms || [];
    const idx = arr.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ error: "Cohort not found." });
    }
    removeCohortFileIfOwned(arr[idx].id, arr[idx].coverImage);
    arr[idx].coverImage = publicUrlForCohortFile(arr[idx].id, req.file.filename);
    arr[idx].updatedAt = new Date().toISOString();
    writeDB(db);
    res.json({ success: true, data: arr[idx] });
  }
);

// Remove a cohort's cover image.  Only deletes locally-uploaded assets.
// DELETE /api/incubationPrograms/:id/cover
app.delete("/api/incubationPrograms/:id/cover", (req, res) => {
  const db = readDB();
  const arr = db.incubationPrograms || [];
  const idx = arr.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Cohort not found." });
  removeCohortFileIfOwned(arr[idx].id, arr[idx].coverImage);
  arr[idx].coverImage = "";
  arr[idx].updatedAt = new Date().toISOString();
  writeDB(db);
  res.json({ success: true, data: arr[idx] });
});

// ---------- Team member photo uploads ----------
// Files land in server/uploads/teams/<memberId>/photo-<ts>.<ext>
// URL prefix is /uploads/teams/<memberId>/<file>
const teamPhotoStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const memberId = req.params.id;
    const dir = path.join(TEAM_UPLOADS_DIR, memberId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    cb(null, `photo-${stamp}${ext}`);
  },
});
const teamPhotoUpload = multer({
  storage: teamPhotoStorage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files (png/jpg/webp/gif) are allowed."));
  },
});

function publicUrlForTeamFile(memberId, filename) {
  return `/uploads/teams/${memberId}/${filename}`;
}

function removeTeamFileIfOwned(memberId, url) {
  if (!url || typeof url !== "string") return;
  const prefix = publicUrlForTeamFile(memberId, "");
  if (!url.startsWith(prefix)) return;
  const safe = path.basename(url);
  const filePath = path.join(TEAM_UPLOADS_DIR, memberId, safe);
  fs.promises.unlink(filePath).catch(() => {});
}

async function removeTeamFolder(memberId) {
  const dir = path.join(TEAM_UPLOADS_DIR, memberId);
  await fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {});
}

// Upload / replace a team member's profile photo.
// Multipart field: "photo" (single file). Stored on record.photoUrl.
app.post(
  "/api/teamMembers/:id/photo",
  teamPhotoUpload.single("photo"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No photo file uploaded." });
    const db = readDB();
    const arr = db.teamMembers || [];
    const idx = arr.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ error: "Team member not found." });
    }
    // Replace previous locally-uploaded photo (if any) before writing the new URL.
    removeTeamFileIfOwned(arr[idx].id, arr[idx].photoUrl);
    arr[idx].photoUrl = publicUrlForTeamFile(arr[idx].id, req.file.filename);
    arr[idx].updatedAt = new Date().toISOString();
    writeDB(db);
    res.status(201).json({ success: true, data: arr[idx] });
  }
);

// PUT alias — some admin UIs prefer PUT.
app.put(
  "/api/teamMembers/:id/photo",
  teamPhotoUpload.single("photo"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No photo file uploaded." });
    const db = readDB();
    const arr = db.teamMembers || [];
    const idx = arr.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ error: "Team member not found." });
    }
    removeTeamFileIfOwned(arr[idx].id, arr[idx].photoUrl);
    arr[idx].photoUrl = publicUrlForTeamFile(arr[idx].id, req.file.filename);
    arr[idx].updatedAt = new Date().toISOString();
    writeDB(db);
    res.json({ success: true, data: arr[idx] });
  }
);

// Remove a team member's photo (only deletes locally-uploaded assets).
app.delete("/api/teamMembers/:id/photo", (req, res) => {
  const db = readDB();
  const arr = db.teamMembers || [];
  const idx = arr.findIndex((m) => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Team member not found." });
  removeTeamFileIfOwned(arr[idx].id, arr[idx].photoUrl);
  arr[idx].photoUrl = "";
  arr[idx].updatedAt = new Date().toISOString();
  writeDB(db);
  res.json({ success: true, data: arr[idx] });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Startup Barishal API] listening on http://localhost:${PORT}`);
  console.log(`  CORS: ${CLIENT_ORIGIN}, ${ADMIN_ORIGIN}`);
});
