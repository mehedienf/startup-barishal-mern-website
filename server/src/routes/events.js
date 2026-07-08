// Events. Used both for "upcoming" cards on the home page and the
// dedicated Events page. DB key is `events`. Galleries can hold an
// arbitrary number of remote URLs or self-hosted `/uploads/events/...`
// paths.
//
// The cover image is managed via `POST /api/events/:id/cover`. The
// gallery endpoints let admins append a batch of fresh uploads without
// replacing the existing gallery.

import path from "node:path";
import fs from "node:fs";
import {
  eventUpload,
  pickEventFile,
  pickEventFiles,
  publicUrlForEventFile,
  removeEventFileIfOwned,
} from "../uploads/eventUploads.js";
import { readDB, writeDB, newId } from "../lib/db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { EVENT_UPLOADS_DIR } from "../config/paths.js";

const RESOURCE = "events";
const PREFIX = "evt";

export function registerEvents(app) {
  app.get(`/api/${RESOURCE}`, (_req, res) => {
    res.json(readDB()[RESOURCE] || []);
  });

  app.get(`/api/${RESOURCE}/:id`, (req, res) => {
    const item = (readDB()[RESOURCE] || []).find(
      (e) => e.id === req.params.id,
    );
    if (!item) return res.status(404).json({ error: "Event not found." });
    res.json(item);
  });

  app.post(`/api/${RESOURCE}`, requireAuth, (req, res) => {
    const { title, date, location, description, status } = req.body || {};
    if (!title || !date || !location || !description) {
      return res.status(400).json({
        error:
          "title, date, location, and description are required.",
      });
    }
    const db = readDB();
    if (!db[RESOURCE]) db[RESOURCE] = [];
    const item = {
      id: newId(PREFIX),
      title,
      date,
      location,
      description,
      status: status || "Upcoming",
      coverImage: req.body.coverImage || "",
      gallery: Array.isArray(req.body.gallery) ? req.body.gallery : [],
      createdAt: new Date().toISOString(),
    };
    db[RESOURCE].unshift(item);
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  app.put(`/api/${RESOURCE}/:id`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[RESOURCE] || [];
    const idx = arr.findIndex((e) => e.id === req.params.id);
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
    const idx = arr.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found." });
    const [removed] = arr.splice(idx, 1);
    db[RESOURCE] = arr;
    writeDB(db);
    fs.rm(
      path.join(EVENT_UPLOADS_DIR, removed.id),
      { recursive: true, force: true },
      () => {},
    );
    res.json({ success: true, data: removed });
  });

  // Cover image — single file. Replaces `coverImage`.
  app.post(
    `/api/${RESOURCE}/:id/cover`,
    requireAuth,
    eventUpload.single("cover"),
    (req, res) => {
      const file = pickEventFile(req);
      if (!file) return res.status(400).json({ error: "No file uploaded." });
      const db = readDB();
      const arr = db[RESOURCE] || [];
      const idx = arr.findIndex((e) => e.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Not found." });
      removeEventFileIfOwned(req.params.id, arr[idx].coverImage);
      const url = publicUrlForEventFile(req.params.id, file.filename);
      arr[idx] = { ...arr[idx], coverImage: url, updatedAt: new Date().toISOString() };
      db[RESOURCE] = arr;
      writeDB(db);
      res.json({ success: true, data: { url } });
    },
  );

  app.delete(`/api/${RESOURCE}/:id/cover`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[RESOURCE] || [];
    const idx = arr.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found." });
    removeEventFileIfOwned(req.params.id, arr[idx].coverImage);
    arr[idx] = { ...arr[idx], coverImage: "", updatedAt: new Date().toISOString() };
    db[RESOURCE] = arr;
    writeDB(db);
    res.json({ success: true });
  });

  // Gallery — multi-file, fields `images` OR `gallery`. Adds to
  // existing gallery; does not replace.
  app.post(
    `/api/${RESOURCE}/:id/gallery`,
    requireAuth,
    eventUpload.array("images", 12),
    (req, res) => {
      const files = pickEventFiles(req);
      if (files.length === 0) {
        return res.status(400).json({ error: "No files uploaded." });
      }
      const db = readDB();
      const arr = db[RESOURCE] || [];
      const idx = arr.findIndex((e) => e.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Not found." });
      const urls = files.map((file) =>
        publicUrlForEventFile(req.params.id, file.filename),
      );
      arr[idx] = {
        ...arr[idx],
        gallery: [...(arr[idx].gallery || []), ...urls],
        updatedAt: new Date().toISOString(),
      };
      db[RESOURCE] = arr;
      writeDB(db);
      res.json({ success: true, data: { urls } });
    },
  );

  app.delete(
    `/api/${RESOURCE}/:id/gallery`,
    requireAuth,
    (req, res) => {
      const { url } = req.body || {};
      if (!url) {
        return res.status(400).json({ error: "url is required." });
      }
      const db = readDB();
      const arr = db[RESOURCE] || [];
      const idx = arr.findIndex((e) => e.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Not found." });
      removeEventFileIfOwned(req.params.id, url);
      arr[idx] = {
        ...arr[idx],
        gallery: (arr[idx].gallery || []).filter((g) => g !== url),
        updatedAt: new Date().toISOString(),
      };
      db[RESOURCE] = arr;
      writeDB(db);
      res.json({ success: true });
    },
  );
}
