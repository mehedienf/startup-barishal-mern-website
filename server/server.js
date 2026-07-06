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
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(EVENT_UPLOADS_DIR, { recursive: true });

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
      { id: "prog-001", title: "Pre-Seed Cohort", summary: "For first-time founders with an idea or paper prototype. 4-week sprint to validate problem-solution fit.", duration: "4 weeks", benefits: ["Office desk + high-speed internet", "1:1 mentorship (weekly)", "Up to BDT 50,000 micro-grant", "Intro to angel investor network"], eligibility: "Student or first-time founder with a problem statement validated by at least 5 user interviews.", createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "prog-002", title: "Early-Stage Cohort", summary: "For teams with a working MVP. 8-week program to reach first paying customers and prepare for seed.", duration: "8 weeks", benefits: ["Dedicated office space", "Biannual mentor matching", "Up to BDT 250,000 seed matching", "Demo Day presentation slot", "AWS / Google Cloud credits"], eligibility: "Team of 2-5 with a deployed MVP and at least 10 active users.", createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "prog-003", title: "Growth Cohort", summary: "For post-revenue startups ready to scale. 12-week intensive focused on unit economics and Series A readiness.", duration: "12 weeks", benefits: ["Premium office + meeting rooms", "Investor matching and pitch coaching", "Up to BDT 1,000,000 follow-on funding", "Legal and IP advisory", "Accountability group with peer founders"], eligibility: "Revenue-generating startup with at least 3 months of consistent MRR.", createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
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
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
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
  });
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
  const { fullName, email, startupName, stage, description, teamSize } = req.body;
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
crudRouter(app, "teamMembers", "team", ["name", "role"]);
crudRouter(app, "incubationPrograms", "prog", ["title", "summary", "duration"]);

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
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    cb(null, `partner-${stamp}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    if (/^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files (png/jpg/webp/gif/svg) are allowed."));
  },
});

// Serve uploaded files statically.  /uploads/partners/* still comes from the
// admin assets folder (legacy partner logos), while /uploads/events/* is
// served from server/uploads (new per-event folders).
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

  app.delete("/api/partners/:id", (req, res) => {
    const db = readDB();
    const arr = db.partners || [];
    const idx = arr.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Partner not found" });
    const [removed] = arr.splice(idx, 1);
    // Best-effort cleanup of the orphan logo on disk
    if (removed?.logoUrl && removed.logoUrl.startsWith("/uploads/partners/")) {
      const filePath = path.join(UPLOADS_DIR, path.basename(removed.logoUrl));
      fs.promises.unlink(filePath).catch(() => {});
    }
    writeDB(db);
    res.json({ success: true, data: removed });
  });
}

partnerRouter(app);

// Dedicated logo upload endpoint (multipart/form-data, field: "logo")
app.post("/api/partners/:id/logo", upload.single("logo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  const db = readDB();
  const arr = db.partners || [];
  const idx = arr.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    fs.unlink(req.file.path, () => {});
    return res.status(404).json({ error: "Partner not found." });
  }
  // remove old upload (if any) before replacing
  if (arr[idx].logoUrl?.startsWith("/uploads/partners/")) {
    fs.unlink(path.join(UPLOADS_DIR, path.basename(arr[idx].logoUrl)), () => {});
  }
  arr[idx].logoUrl = `/uploads/partners/${req.file.filename}`;
  arr[idx].updatedAt = new Date().toISOString();
  writeDB(db);
  res.json({ success: true, data: arr[idx] });
});

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Startup Barishal API] listening on http://localhost:${PORT}`);
  console.log(`  CORS: ${CLIENT_ORIGIN}, ${ADMIN_ORIGIN}`);
});
