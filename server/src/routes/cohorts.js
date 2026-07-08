// Incubation programs ("cohorts"). Public list is exposed as
// `/api/incubationPrograms` so the frontend can use a stable URL; the
// DB key is `incubationPrograms`. PUT is reserved for admin edits.
//
// Cover uploads: `POST /api/incubationPrograms/:id/cover` (single
// multipart, replaces existing). DELETE on the same path clears the
// stored image.

import {
  cohortUpload,
  pickCohortFile,
  publicUrlForCohortFile,
  removeCohortFileIfOwned,
} from "../uploads/cohortUploads.js";
import { readDB, writeDB, newId } from "../lib/db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const RESOURCE = "incubationPrograms";
const PREFIX = "prog";

export function registerCohorts(app) {
  app.get(`/api/${RESOURCE}`, (_req, res) => {
    res.json(readDB()[RESOURCE] || []);
  });

  // Convenience endpoint for the public site: return the single
  // cohort that is currently accepting applications, or 404 if none.
  // "Active" is defined as `status === 'live'`. If multiple are live,
  // the most recently updated wins.
  app.get(`/api/${RESOURCE}/active`, (_req, res) => {
    const all = readDB()[RESOURCE] || [];
    const live = all
      .filter((c) => (c.status || "").toLowerCase() === "live")
      .sort((a, b) => {
        const ta = new Date(b.updatedAt || b.createdAt || 0).getTime();
        const tb = new Date(a.updatedAt || a.createdAt || 0).getTime();
        return ta - tb;
      });
    if (live.length === 0) {
      return res.status(404).json({ error: "No active cohort." });
    }
    res.json(live[0]);
  });

  app.get(`/api/${RESOURCE}/:id`, (req, res) => {
    if (req.params.id === "active") return; // handled above; silence :id match
    const item = (readDB()[RESOURCE] || []).find(
      (c) => c.id === req.params.id,
    );
    if (!item) return res.status(404).json({ error: "Cohort not found." });
    res.json(item);
  });

  app.post(`/api/${RESOURCE}`, requireAuth, (req, res) => {
    const { title, summary, duration, eligibility, status } = req.body || {};
    if (!title || !summary || !duration || !eligibility) {
      return res.status(400).json({
        error:
          "title, summary, duration, and eligibility are required.",
      });
    }
    const db = readDB();
    if (!db[RESOURCE]) db[RESOURCE] = [];
    const item = {
      id: newId(PREFIX),
      title,
      summary,
      duration,
      eligibility,
      benefits: Array.isArray(req.body.benefits) ? req.body.benefits : [],
      coverImage: req.body.coverImage || "",
      status: status || "closed",
      createdAt: new Date().toISOString(),
    };
    db[RESOURCE].unshift(item);
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  app.put(`/api/${RESOURCE}/:id`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[RESOURCE] || [];
    const idx = arr.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found." });
    arr[idx] = {
      ...arr[idx],
      ...req.body,
      id: arr[idx].id,
      updatedAt: new Date().toISOString(),
    };
    db[RESOURCE] = arr;
    writeDB(db);
    res.json({ success: true, data: arr[idx] });
  });

  app.delete(`/api/${RESOURCE}/:id`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[RESOURCE] || [];
    const idx = arr.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found." });
    const [removed] = arr.splice(idx, 1);
    db[RESOURCE] = arr;
    writeDB(db);
    res.json({ success: true, data: removed });
  });

  app.post(
    `/api/${RESOURCE}/:id/cover`,
    requireAuth,
    cohortUpload.single("cover"),
    (req, res) => {
      const file = pickCohortFile(req);
      if (!file) {
        return res.status(400).json({ error: "No file uploaded." });
      }
      const db = readDB();
      const arr = db[RESOURCE] || [];
      const idx = arr.findIndex((c) => c.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Not found." });
      removeCohortFileIfOwned(req.params.id, arr[idx].coverImage);
      const url = publicUrlForCohortFile(req.params.id, file.filename);
      arr[idx] = { ...arr[idx], coverImage: url, updatedAt: new Date().toISOString() };
      db[RESOURCE] = arr;
      writeDB(db);
      res.json({ success: true, data: { url } });
    },
  );

  app.delete(`/api/${RESOURCE}/:id/cover`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[RESOURCE] || [];
    const idx = arr.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found." });
    removeCohortFileIfOwned(req.params.id, arr[idx].coverImage);
    arr[idx] = { ...arr[idx], coverImage: "", updatedAt: new Date().toISOString() };
    db[RESOURCE] = arr;
    writeDB(db);
    res.json({ success: true });
  });
}
