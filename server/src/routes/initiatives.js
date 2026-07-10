// Mentored startups ("initiatives"). Each entry is a startup or app that
// the incubator has mentored. Listed on the public home page above the
// partner marquee. Admins CRUD entries and upload/clear their logo.
//
//   GET    /api/initiatives                  — public list (ordered)
//   POST   /api/initiatives                  — create (auth)
//   GET    /api/initiatives/:id              — fetch one
//   PUT    /api/initiatives/:id              — update (auth)
//   DELETE /api/initiatives/:id              — delete (auth, deletes logo too)
//   POST   /api/initiatives/:id/logo         — multipart single-file upload
//   DELETE /api/initiatives/:id/logo         — clear stored logo
//
// The `logoUrl` field on the record holds either a remote URL or
// `/uploads/initiatives/<id>/<file>`. Uploaded files are scoped to the
// initiative id so DELETE only has to walk that folder.

import path from "node:path";
import fs from "node:fs";
import {
  initiativeUpload,
  pickInitiativeFile,
  publicUrlForInitiativeFile,
  removeInitiativeFileIfOwned,
} from "../uploads/initiativeUploads.js";
import { readDB, writeDB, newId } from "../lib/db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { INITIATIVE_UPLOADS_DIR } from "../config/paths.js";

const RESOURCE = "initiatives";
const PREFIX = "init";

export function registerInitiatives(app) {
  app.get(`/api/${RESOURCE}`, (_req, res) => {
    // Public list — order by `order` then creation time so the rotation
    // matches the admin's chosen sequence even across reloads.
    const items = (readDB()[RESOURCE] || []).slice().sort((a, b) => {
      const oa = Number.isFinite(Number(a.order)) ? Number(a.order) : Infinity;
      const ob = Number.isFinite(Number(b.order)) ? Number(b.order) : Infinity;
      if (oa !== ob) return oa - ob;
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return ta - tb;
    });
    res.json(items);
  });

  app.get(`/api/${RESOURCE}/:id`, (req, res) => {
    const item = (readDB()[RESOURCE] || []).find(
      (x) => x.id === req.params.id,
    );
    if (!item) return res.status(404).json({ error: "Initiative not found." });
    res.json(item);
  });

  app.post(`/api/${RESOURCE}`, requireAuth, (req, res) => {
    const { name, website, tagline, category, description } = req.body || {};
    if (!name) {
      return res.status(400).json({ error: "name is required." });
    }
    const db = readDB();
    if (!db[RESOURCE]) db[RESOURCE] = [];
    const item = {
      id: newId(PREFIX),
      name,
      // The public client reads `data.website`, so we store it under the
      // matching key. Legacy `websiteUrl` is also accepted via spread.
      website: website || req.body.websiteUrl || "",
      tagline: tagline || "",
      category: category || "",
      description: description || "",
      logoUrl: req.body.logoUrl || "",
      order: Number.isFinite(Number(req.body.order)) ? Number(req.body.order) : 999,
      createdAt: new Date().toISOString(),
    };
    db[RESOURCE].push(item); // append for ordering
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  app.put(`/api/${RESOURCE}/:id`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[RESOURCE] || [];
    const idx = arr.findIndex((x) => x.id === req.params.id);
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
    const idx = arr.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found." });
    const [removed] = arr.splice(idx, 1);
    db[RESOURCE] = arr;
    writeDB(db);
    fs.rm(
      path.join(INITIATIVE_UPLOADS_DIR, removed.id),
      { recursive: true, force: true },
      () => {},
    );
    res.json({ success: true, data: removed });
  });

  // Logo upload — registered under both POST (legacy) and PUT (admin
  // client convention). Same handler, both methods, one chain. Field
  // name is "photo" because the shared admin upload form (ResourcePage)
  // always sends `fd.append("photo", photoFile)` regardless of resource.
  const uploadLogo = [
    requireAuth,
    initiativeUpload.single("photo"),
    (req, res) => {
      const file = pickInitiativeFile(req);
      if (!file) {
        return res.status(400).json({ error: "No file uploaded." });
      }
      const db = readDB();
      const arr = db[RESOURCE] || [];
      const idx = arr.findIndex((x) => x.id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ error: "Initiative not found." });
      }
      removeInitiativeFileIfOwned(req.params.id, arr[idx].logoUrl);
      const url = publicUrlForInitiativeFile(req.params.id, file.filename);
      arr[idx] = { ...arr[idx], logoUrl: url, updatedAt: new Date().toISOString() };
      db[RESOURCE] = arr;
      writeDB(db);
      res.json({ success: true, data: { url } });
    },
  ];
  app.post(`/api/${RESOURCE}/:id/logo`, ...uploadLogo);
  app.put(`/api/${RESOURCE}/:id/logo`,  ...uploadLogo);

  app.delete(`/api/${RESOURCE}/:id/logo`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[RESOURCE] || [];
    const idx = arr.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found." });
    removeInitiativeFileIfOwned(req.params.id, arr[idx].logoUrl);
    arr[idx] = { ...arr[idx], logoUrl: "", updatedAt: new Date().toISOString() };
    db[RESOURCE] = arr;
    writeDB(db);
    res.json({ success: true });
  });
}
