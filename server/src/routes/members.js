// Team members CRUD.
//
// Public: `GET /api/teamMembers` and `GET /api/teamMembers/:id` (used by
// the About page).
// Admin: `POST`, `PUT`, `DELETE`, plus `POST /api/teamMembers/:id/photo`
// for uploading a new headshot (multipart single-file under field
// `photo` or first file in `req.files`).

import path from "node:path";
import fs from "node:fs";
import { readDB, writeDB, newId } from "../lib/db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  teamUpload,
  pickTeamFile,
  publicUrlForTeamFile,
  removeTeamFileIfOwned,
} from "../uploads/teamUploads.js";
import { TEAM_UPLOADS_DIR } from "../config/paths.js";

const RESOURCE = "teamMembers";
const PREFIX = "team";

export function registerMembers(app) {
  app.get(`/api/${RESOURCE}`, (_req, res) => {
    res.json(readDB()[RESOURCE] || []);
  });

  app.get(`/api/${RESOURCE}/:id`, (req, res) => {
    const item = (readDB()[RESOURCE] || []).find((m) => m.id === req.params.id);
    if (!item) return res.status(404).json({ error: "Team member not found." });
    res.json(item);
  });

  app.post(`/api/${RESOURCE}`, requireAuth, (req, res) => {
    const { name, role, bio } = req.body || {};
    if (!name || !role || !bio) {
      return res
        .status(400)
        .json({ error: "Fields name, role, and bio are required." });
    }
    const db = readDB();
    if (!db[RESOURCE]) db[RESOURCE] = [];
    const item = {
      id: newId(PREFIX),
      name,
      role,
      bio,
      photoUrl: req.body.photoUrl || "",
      linkedinUrl: req.body.linkedinUrl || "",
      order: req.body.order || 999,
      createdAt: new Date().toISOString(),
    };
    db[RESOURCE].unshift(item);
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  app.put(`/api/${RESOURCE}/:id`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[RESOURCE] || [];
    const idx = arr.findIndex((m) => m.id === req.params.id);
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
    const idx = arr.findIndex((m) => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found." });
    const [removed] = arr.splice(idx, 1);
    db[RESOURCE] = arr;
    writeDB(db);
    // Tidy up the on-disk folder too.
    fs.rm(path.join(TEAM_UPLOADS_DIR, removed.id), { recursive: true, force: true }, () => {});
    res.json({ success: true, data: removed });
  });

  app.post(
    `/api/${RESOURCE}/:id/photo`,
    requireAuth,
    teamUpload.single("photo"),
    (req, res) => {
      const file = pickTeamFile(req);
      if (!file) {
        return res.status(400).json({ error: "No file uploaded." });
      }
      const url = publicUrlForTeamFile(req.params.id, file.filename);
      const db = readDB();
      const arr = db[RESOURCE] || [];
      const idx = arr.findIndex((m) => m.id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ error: "Team member not found." });
      }
      removeTeamFileIfOwned(req.params.id, arr[idx].photoUrl);
      arr[idx] = { ...arr[idx], photoUrl: url, updatedAt: new Date().toISOString() };
      db[RESOURCE] = arr;
      writeDB(db);
      res.json({ success: true, data: { url } });
    },
  );

  app.delete(`/api/${RESOURCE}/:id/photo`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[RESOURCE] || [];
    const idx = arr.findIndex((m) => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found." });
    removeTeamFileIfOwned(req.params.id, arr[idx].photoUrl);
    arr[idx] = { ...arr[idx], photoUrl: "", updatedAt: new Date().toISOString() };
    db[RESOURCE] = arr;
    writeDB(db);
    res.json({ success: true });
  });
}
