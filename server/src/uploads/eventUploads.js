// Event uploads (cover image + gallery). Same shape as partner uploads:
// one multer disk-storage instance that scopes files under
// `uploads/events/<id>/`.

import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { EVENT_UPLOADS_DIR } from "../config/paths.js";

const STORAGE = multer.diskStorage({
  destination: (req, _file, cb) => {
    const id = req.params.id;
    if (!id) return cb(new Error("Missing event id in route."));
    const dir = path.join(EVENT_UPLOADS_DIR, id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "") || ".jpg";
    const base = path
      .basename(file.originalname || "image", ext)
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .slice(0, 40) || "image";
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

export const eventUpload = multer({ storage: STORAGE });

/** Pull the first file out of `req.files` regardless of field name. */
export function pickEventFile(req) {
  if (!req.file) return null;
  if (Array.isArray(req.files) && req.files.length > 0) return req.files[0];
  if (req.files && typeof req.files === "object") {
    for (const value of Object.values(req.files)) {
      if (Array.isArray(value) && value.length > 0) return value[0];
    }
  }
  return req.file;
}

/** Pull every file out of `req.files`. */
export function pickEventFiles(req) {
  if (!req.files) return [];
  if (Array.isArray(req.files)) return req.files;
  const out = [];
  for (const value of Object.values(req.files)) {
    if (Array.isArray(value)) out.push(...value);
  }
  return out;
}

export function publicUrlForEventFile(id, filename) {
  return `/uploads/events/${id}/${filename}`;
}

export function removeEventFileIfOwned(id, url) {
  if (!url || !id) return;
  const prefix = `/uploads/events/${id}/`;
  if (!url.startsWith(prefix)) return;
  const filename = url.slice(prefix.length);
  if (!filename) return;
  fs.unlink(path.join(EVENT_UPLOADS_DIR, id, filename), () => {});
}
