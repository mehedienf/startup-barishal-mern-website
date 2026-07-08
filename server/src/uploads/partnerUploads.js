// Partner logo uploads. Each partner gets its own subfolder under
// `uploads/partners/<id>/` so we can scope deletion cleanly. The DB
// record is the source of truth for `logoUrl`; the file path is derived
// from the request id when the upload is finalized.

import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { PARTNER_UPLOADS_DIR } from "../config/paths.js";

const STORAGE = multer.diskStorage({
  destination: (req, _file, cb) => {
    const id = req.params.id;
    if (!id) return cb(new Error("Missing partner id in route."));
    const dir = path.join(PARTNER_UPLOADS_DIR, id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "") || ".png";
    const base = path
      .basename(file.originalname || "logo", ext)
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .slice(0, 40) || "logo";
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

export const partnerUpload = multer({ storage: STORAGE });

/** Extract the saved multer file from a request, regardless of field name. */
export function pickPartnerFile(req) {
  if (!req.file) return null;
  if (Array.isArray(req.files) && req.files.length > 0) return req.files[0];
  if (req.files && typeof req.files === "object") {
    for (const value of Object.values(req.files)) {
      if (Array.isArray(value) && value.length > 0) return value[0];
    }
  }
  return req.file;
}

/** Build the public URL for a saved partner logo. */
export function publicUrlForPartnerFile(id, filename) {
  return `/uploads/partners/${id}/${filename}`;
}

/** Delete a partner's logo if it lives under the managed uploads dir. */
export function removePartnerFileIfOwned(id, url) {
  if (!url || !id) return;
  const prefix = `/uploads/partners/${id}/`;
  if (!url.startsWith(prefix)) return;
  const filename = url.slice(prefix.length);
  if (!filename) return;
  const filePath = path.join(PARTNER_UPLOADS_DIR, id, filename);
  fs.unlink(filePath, () => {});
}
