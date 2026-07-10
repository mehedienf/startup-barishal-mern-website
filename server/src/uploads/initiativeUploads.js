// Initiative (mentored startup) logo uploads. Each entry gets its own
// subfolder under `uploads/initiatives/<id>/`. The DB record is the
// source of truth for `logoUrl`; the file path is derived from the
// request id when the upload is finalized.

import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { INITIATIVE_UPLOADS_DIR } from "../config/paths.js";

const STORAGE = multer.diskStorage({
  destination: (req, _file, cb) => {
    const id = req.params.id;
    if (!id) return cb(new Error("Missing initiative id in route."));
    const dir = path.join(INITIATIVE_UPLOADS_DIR, id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "") || ".png";
    const base = path
      .basename(file.originalname || "initiative", ext)
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .slice(0, 40) || "initiative";
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

export const initiativeUpload = multer({ storage: STORAGE });

/** Extract the saved multer file from a request, regardless of field name. */
export function pickInitiativeFile(req) {
  if (!req.file) return null;
  if (Array.isArray(req.files) && req.files.length > 0) return req.files[0];
  if (req.files && typeof req.files === "object") {
    for (const value of Object.values(req.files)) {
      if (Array.isArray(value) && value.length > 0) return value[0];
    }
  }
  return req.file;
}

/** Build the public URL for a saved initiative logo. */
export function publicUrlForInitiativeFile(id, filename) {
  return `/uploads/initiatives/${id}/${filename}`;
}

/** Delete an initiative's logo if it lives under the managed uploads dir. */
export function removeInitiativeFileIfOwned(id, url) {
  if (!url || !id) return;
  const prefix = `/uploads/initiatives/${id}/`;
  if (!url.startsWith(prefix)) return;
  const filename = url.slice(prefix.length);
  if (!filename) return;
  const filePath = path.join(INITIATIVE_UPLOADS_DIR, id, filename);
  fs.unlink(filePath, () => {});
}
