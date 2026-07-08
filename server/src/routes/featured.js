// Featured (homepage hero) images. Admins manage a small carousel;
// the public site polls `GET /api/featured` and renders the ordered
// list.
//
//   GET    /api/featured                  — public list (ordered)
//   POST   /api/featured                  — create (auth)
//   GET    /api/featured/:id              — fetch one
//   PUT    /api/featured/:id              — update (auth)
//   DELETE /api/featured/:id              — delete (auth)
//   POST   /api/featured/:id/image        — multipart single-file upload
//   DELETE /api/featured/:id/image        — clear stored image

import {
  featuredUpload,
  pickFeaturedFile,
  publicUrlForFeaturedFile,
  removeFeaturedFileIfOwned,
} from "../uploads/featuredUploads.js";
import { readDB, writeDB, newId } from "../lib/db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const RESOURCE = "featured";
const PREFIX = "feat";

export function registerFeatured(app) {
  app.get(`/api/${RESOURCE}`, (_req, res) => {
    res.json(readDB()[RESOURCE] || []);
  });

  app.get(`/api/${RESOURCE}/:id`, (req, res) => {
    const item = (readDB()[RESOURCE] || []).find(
      (f) => f.id === req.params.id,
    );
    if (!item) return res.status(404).json({ error: "Not found." });
    res.json(item);
  });

  app.post(`/api/${RESOURCE}`, requireAuth, (req, res) => {
    const { title, subtitle, ctaLabel, ctaUrl, imageUrl } = req.body || {};
    if (!title || !imageUrl) {
      return res.status(400).json({ error: "title and imageUrl required." });
    }
    const db = readDB();
    if (!db[RESOURCE]) db[RESOURCE] = [];
    const item = {
      id: newId(PREFIX),
      title,
      subtitle: subtitle || "",
      ctaLabel: ctaLabel || "",
      ctaUrl: ctaUrl || "#",
      imageUrl,
      order: req.body.order || 999,
      createdAt: new Date().toISOString(),
    };
    db[RESOURCE].push(item); // append for ordering
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  app.put(`/api/${RESOURCE}/:id`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[RESOURCE] || [];
    const idx = arr.findIndex((f) => f.id === req.params.id);
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
    const idx = arr.findIndex((f) => f.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found." });
    const [removed] = arr.splice(idx, 1);
    db[RESOURCE] = arr;
    writeDB(db);
    removeFeaturedFileIfOwned(req.params.id, removed.imageUrl);
    res.json({ success: true, data: removed });
  });

  app.post(
    `/api/${RESOURCE}/:id/image`,
    requireAuth,
    featuredUpload.single("image"),
    (req, res) => {
      const file = pickFeaturedFile(req);
      if (!file) return res.status(400).json({ error: "No file uploaded." });
      const db = readDB();
      const arr = db[RESOURCE] || [];
      const idx = arr.findIndex((f) => f.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Not found." });
      removeFeaturedFileIfOwned(req.params.id, arr[idx].imageUrl);
      const url = publicUrlForFeaturedFile(req.params.id, file.filename);
      arr[idx] = { ...arr[idx], imageUrl: url, updatedAt: new Date().toISOString() };
      db[RESOURCE] = arr;
      writeDB(db);
      res.json({ success: true, data: { url } });
    },
  );

  app.delete(`/api/${RESOURCE}/:id/image`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[RESOURCE] || [];
    const idx = arr.findIndex((f) => f.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found." });
    removeFeaturedFileIfOwned(req.params.id, arr[idx].imageUrl);
    arr[idx] = { ...arr[idx], imageUrl: "", updatedAt: new Date().toISOString() };
    db[RESOURCE] = arr;
    writeDB(db);
    res.json({ success: true });
  });
}
