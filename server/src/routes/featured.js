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
    // The carousel must reflect each record's `order` value. Records
    // with the same `order` fall back to creation time so the rotation
    // is stable across reloads.
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
      (f) => f.id === req.params.id,
    );
    if (!item) return res.status(404).json({ error: "Not found." });
    res.json(item);
  });

  app.post(`/api/${RESOURCE}`, requireAuth, (req, res) => {
    const { title, subtitle, ctaLabel, ctaUrl, imageUrl } = req.body || {};
    // `title` is required (carousel entry needs a caption), but `imageUrl`
    // is optional: the admin uploads the image in a separate step via
    // PUT /api/featured/:id/image, after the record exists. Rejecting
    // here would block the entire create-then-upload flow.
    if (!title) {
      return res.status(400).json({ error: "title is required." });
    }
    const db = readDB();
    if (!db[RESOURCE]) db[RESOURCE] = [];
    const item = {
      id: newId(PREFIX),
      title,
      subtitle: subtitle || "",
      ctaLabel: ctaLabel || "",
      ctaUrl: ctaUrl || "#",
      imageUrl: imageUrl || "",
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

  // Image upload — registered under POST (legacy) and PUT (admin
  // client convention). Same handler, both methods, one chain.
  const uploadImage = [
    requireAuth,
    // Field name is "photo" because the shared admin upload form
// (ResourcePage.jsx) appends "photo" to its FormData; "image" is
// only the URL suffix.
    featuredUpload.single("photo"),
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
  ];
  app.post(`/api/${RESOURCE}/:id/image`, ...uploadImage);
  app.put(`/api/${RESOURCE}/:id/image`,  ...uploadImage);

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
