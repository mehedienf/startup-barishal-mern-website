var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.js
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var PORT = 3e3;
var DB_FILE = import_path.default.join(process.cwd(), "db.json");
function readDB() {
  try {
    if (!import_fs.default.existsSync(DB_FILE)) {
      const initialData = {
        contacts: [
          {
            id: "msg-1234",
            firstName: "Sabbir",
            lastName: "Hassan",
            email: "sabbir@example.com",
            subject: "Mentorship",
            message: "I am a CSE student from Barishal University. I have a prototype for an agritech platform and would love to get structural mentoring regarding business registration.",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toISOString()
          },
          {
            id: "msg-5678",
            firstName: "Nadia",
            lastName: "Islam",
            email: "nadia.islam@startup.bd",
            subject: "Partnership",
            message: "We represent a microfinance fund looking to explore supporting local incubators with standard seed matching. Let's schedule a conference call.",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString()
          }
        ],
        applications: [
          {
            id: "app-9876",
            fullName: "Zamil Ahmed",
            email: "zamil@greenbarishal.co",
            startupName: "GreenBarishal Logistics",
            stage: "Early Traction",
            description: "Eco-friendly last-mile delivery system utilizing electric vans to transport fresh fish from Barishal divisions directly to major markets.",
            teamSize: 5,
            status: "Approved",
            notes: "Outstanding logistics unit. Approved for June cohort incubation, allocated workspace desk.",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString()
          },
          {
            id: "app-5432",
            fullName: "Tahmina Akter",
            email: "tahmina@sheinnovates.io",
            startupName: "SheInnovates EdTech",
            stage: "Prototype",
            description: "An offline-first interactive learning kit matching technical training in regional schools to global tech syllabi.",
            teamSize: 3,
            status: "Pending",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString()
          }
        ],
        subscribers: [
          {
            id: "sub-1",
            email: "enammehedi06@gmail.com",
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1e3).toISOString()
          },
          {
            id: "sub-2",
            email: "partner@barishalhub.org",
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1e3).toISOString()
          }
        ]
      };
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }
    const content = import_fs.default.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("DB Read Error, reverting to memory DB:", error);
    return { contacts: [], applications: [], subscribers: [] };
  }
}
function writeDB(data) {
  try {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("DB Write Error:", error);
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  app.use(import_express.default.urlencoded({ extended: true }));
  app.get("/api/stats", (req, res) => {
    const db = readDB();
    res.json({
      cohortsCompleted: 4,
      // static benchmark
      eventsCount: db.applications.length + db.contacts.length + 8,
      // scalable
      startupsMentored: db.applications.filter((a) => a.status === "Approved").length + 12,
      investorsOnboarded: 5,
      // static
      currentApplicationsCount: db.applications.length,
      currentContactsCount: db.contacts.length,
      currentSubscribersCount: db.subscribers.length
    });
  });
  app.post("/api/contact", (req, res) => {
    const { firstName, lastName, email, subject, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ error: "Email and Message fields are required *." });
    }
    const db = readDB();
    const newMsg = {
      id: "msg-" + Math.random().toString(36).substring(2, 9),
      firstName: firstName || "",
      lastName: lastName || "",
      email,
      subject: subject || "General Inquiry",
      message,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.contacts.unshift(newMsg);
    writeDB(db);
    res.status(201).json({ success: true, message: "Thank you! Your message was saved securely on the server DB.", data: newMsg });
  });
  app.get("/api/contacts", (req, res) => {
    const db = readDB();
    res.json(db.contacts);
  });
  app.post("/api/applications", (req, res) => {
    const { fullName, email, startupName, stage, description, teamSize } = req.body;
    if (!fullName || !email || !startupName || !description) {
      return res.status(400).json({ error: "Full Name, Email, Startup Name and Project Description are required." });
    }
    const db = readDB();
    const newApp = {
      id: "app-" + Math.random().toString(36).substring(2, 9),
      fullName,
      email,
      startupName,
      stage: stage || "Prototype",
      description,
      teamSize: Number(teamSize) || 1,
      status: "Pending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.applications.unshift(newApp);
    writeDB(db);
    res.status(201).json({ success: true, message: "Successfully submitted to the Startup cohort! Review details below.", data: newApp });
  });
  app.get("/api/applications", (req, res) => {
    const db = readDB();
    res.json(db.applications);
  });
  app.put("/api/applications/:id", (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const db = readDB();
    const applicationIndex = db.applications.findIndex((a) => a.id === id);
    if (applicationIndex === -1) {
      return res.status(404).json({ error: "Application not found in DB." });
    }
    db.applications[applicationIndex].status = status || db.applications[applicationIndex].status;
    if (notes !== void 0) {
      db.applications[applicationIndex].notes = notes;
    }
    writeDB(db);
    res.json({ success: true, message: "Application status updated successfully.", data: db.applications[applicationIndex] });
  });
  app.post("/api/newsletter", (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    const db = readDB();
    const emails = db.subscribers.map((s) => s.email.toLowerCase());
    if (emails.includes(email.toLowerCase())) {
      return res.json({ success: true, message: "You are already subscribed to the Startup Barishal newsletter! Double-pulse active." });
    }
    const newSub = {
      id: "sub-" + Math.random().toString(36).substring(2, 9),
      email,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.subscribers.unshift(newSub);
    writeDB(db);
    res.status(201).json({ success: true, message: "Boom! Successfully subscribed to Startup Barishal announcements.", data: newSub });
  });
  app.get("/api/subscribers", (req, res) => {
    const db = readDB();
    res.json(db.subscribers);
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Startup Barishal Server] Full-stack Node API running securely at http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
