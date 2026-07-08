// Partner organizations. The list is shown on the public About page,
// and admins can CRUD the entries and upload/clear their logo.
//
//   GET    /api/partners                  — public list
//   POST   /api/partners                  — create (auth)
//   GET    /api/partners/:id              — fetch one
//   PUT    /api/partners/:id              — update (auth)
//   DELETE /api/partners/:id              — delete (auth, deletes logo too)
//   POST   /api/partners/:id/logo         — multipart single-file upload
//   DELETE /api/partners/:id/logo         — clear stored logo
//
// The `logoUrl` field on the record holds either a remote URL or
// `/uploads/partners/<id>/<file>`. Uploaded files are scoped to the
// partner id so DELETE only has to walk the partner's folder.

import path from "node:path";
import fs from "node:fs";
import {
  partnerUpload,
  pickPartnerFile,
  publicUrlForPartnerFile,
  removePartnerFileIfOwned,
} from "../uploads/partnerUploads.js";
import { readDB, writeDB, newId } from "../lib/db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { PARTNER_UPLOADS_DIR } from "../config/paths.js";

const RESOURCE = "partners";
const PREFIX = "part";

export function registerPartners(app) {
  app.get(`/api/${RESOURCE}`, (_req, res) => {
    res.json(readDB()[RESOURCE] || []);
  });

  app.get(`/api/${RESOURCE}/:id`, (req, res) => {
    const item = (readDB()[RESOURCE] || []).find(
      (p) => p.id === req.params.id,
    );
    if (!item) return res.status(404).json({ error: "Partner not found." });
    res.json(item);
  });

  app.post(`/api/${RESOURCE}`, requireAuth, (req, res) => {
    const { name, websiteUrl, category, description } = req.body || {};
    if (!name) {
      return res.status(400).json({ error: "name is required." });
    }
    const db = readDB();
    if (!db[RESOURCE]) db[RESOURCE] = [];
    const item = {
      id: newId(PREFIX),
      name,
      websiteUrl: websiteUrl || "",
      category: category || "",
      description: description || "",
      logoUrl: req.body.logoUrl || "",
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
    const idx = arr.findIndex((p) => p.id === req.params.id);
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
    const idx = arr.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found." });
    const [removed] = arr.splice(idx, 1);
    db[RESOURCE] = arr;
    writeDB(db);
    fs.rm(
      path.join(PARTNER_UPLOADS_DIR, removed.id),
      { recursive: true, force: true },
      () => {},
    );
    res.json({ success: true, data: removed });
  });

  // Logo upload — registered under both POST (legacy) and PUT (admin
  // client convention). Same handler, both methods, one chain.
  const uploadLogo = [
    requireAuth,
    // Field name is "photo" because the shared admin upload form
// (ResourcePage.jsx) appends "photo" to its FormData; "logo" is
// only the URL suffix.
    partnerUpload.single("photo"),
    (req, res) => {
      const file = pickPartnerFile(req);
      if (!file) {
        return res.status(400).json({ error: "No file uploaded." });
      }
      const db = readDB();
      const arr = db[RESOURCE] || [];
      const idx = arr.findIndex((p) => p.id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ error: "Partner not found." });
      }
      removePartnerFileIfOwned(req.params.id, arr[idx].logoUrl);
      const url = publicUrlForPartnerFile(req.params.id, file.filename);
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
    const idx = arr.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found." });
    removePartnerFileIfOwned(req.params.id, arr[idx].logoUrl);
    arr[idx] = { ...arr[idx], logoUrl: "", updatedAt: new Date().toISOString() };
    db[RESOURCE] = arr;
    writeDB(db);
    res.json({ success: true });
  });
}
