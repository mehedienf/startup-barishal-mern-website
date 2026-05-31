import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Helper top-level functions for mock DB persistence
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        contacts: [
          {
            id: "msg-1234",
            firstName: "Sabbir",
            lastName: "Hassan",
            email: "sabbir@example.com",
            subject: "Mentorship",
            message: "I am a CSE student from Barishal University. I have a prototype for an agritech platform and would love to get structural mentoring regarding business registration.",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "msg-5678",
            firstName: "Nadia",
            lastName: "Islam",
            email: "nadia.islam@startup.bd",
            subject: "Partnership",
            message: "We represent a microfinance fund looking to explore supporting local incubators with standard seed matching. Let's schedule a conference call.",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
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
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
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
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        subscribers: [
          {
            id: "sub-1",
            email: "enammehedi06@gmail.com",
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "sub-2",
            email: "partner@barishalhub.org",
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("DB Read Error, reverting to memory DB:", error);
    return { contacts: [], applications: [], subscribers: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("DB Write Error:", error);
  }
}

async function startServer() {
  const app = express();
  
  // Body parsing parser middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route: Get DB Stats (cohort submissions, contacts count)
  app.get("/api/stats", (req, res) => {
    const db = readDB();
    res.json({
      cohortsCompleted: 4, // static benchmark
      eventsCount: db.applications.length + db.contacts.length + 8, // scalable
      startupsMentored: db.applications.filter((a) => a.status === "Approved").length + 12,
      investorsOnboarded: 5, // static
      currentApplicationsCount: db.applications.length,
      currentContactsCount: db.contacts.length,
      currentSubscribersCount: db.subscribers.length
    });
  });

  // API Route: Save Contact Message
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
      createdAt: new Date().toISOString()
    };
    
    db.contacts.unshift(newMsg);
    writeDB(db);
    res.status(201).json({ success: true, message: "Thank you! Your message was saved securely on the server DB.", data: newMsg });
  });

  // API Route: Get Contact Messages (Admin Console)
  app.get("/api/contacts", (req, res) => {
    const db = readDB();
    res.json(db.contacts);
  });

  // API Route: Save Dynamic Application
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
      createdAt: new Date().toISOString()
    };

    db.applications.unshift(newApp);
    writeDB(db);
    res.status(201).json({ success: true, message: "Successfully submitted to the Startup cohort! Review details below.", data: newApp });
  });

  // API Route: Get Cohort Applications (Admin Console)
  app.get("/api/applications", (req, res) => {
    const db = readDB();
    res.json(db.applications);
  });

  // API Route: Update Application Status
  app.put("/api/applications/:id", (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const db = readDB();
    const applicationIndex = db.applications.findIndex((a) => a.id === id);
    if (applicationIndex === -1) {
      return res.status(404).json({ error: "Application not found in DB." });
    }

    db.applications[applicationIndex].status = status || db.applications[applicationIndex].status;
    if (notes !== undefined) {
      db.applications[applicationIndex].notes = notes;
    }

    writeDB(db);
    res.json({ success: true, message: "Application status updated successfully.", data: db.applications[applicationIndex] });
  });

  // API Route: Add Custom Newsletter Subscriber
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
      createdAt: new Date().toISOString()
    };

    db.subscribers.unshift(newSub);
    writeDB(db);
    res.status(201).json({ success: true, message: "Boom! Successfully subscribed to Startup Barishal announcements.", data: newSub });
  });

  // API Route: Get subscribers list
  app.get("/api/subscribers", (req, res) => {
    const db = readDB();
    res.json(db.subscribers);
  });

  // Setup Vite Dev server or static asset production pipeline
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Startup Barishal Server] Full-stack Node API running securely at http://localhost:${PORT}`);
  });
}

startServer();
