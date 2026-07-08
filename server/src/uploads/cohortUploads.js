// Incubation-program ("cohort") cover uploads. Files are scoped to
// `uploads/cohorts/<id>/`. The DB key on the record is `coverImage`.

import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { COHORT_UPLOADS_DIR } from "../config/paths.js";

const STORAGE = multer.diskStorage({
  destination: (req, _file, cb) => {
    const id = req.params.id;
    if (!id) return cb(new Error("Missing cohort id in route."));
    const dir = path.join(COHORT_UPLOADS_DIR, id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "") || ".jpg";
    const base = path
      .basename(file.originalname || "cover", ext)
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .slice(0, 40) || "cover";
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

export const cohortUpload = multer({ storage: STORAGE });

export function pickCohortFile(req) {
  if (!req.file) return null;
  if (Array.isArray(req.files) && req.files.length > 0) return req.files[0];
  if (req.files && typeof req.files === "object") {
    for (const value of Object.values(req.files)) {
      if (Array.isArray(value) && value.length > 0) return value[0];
    }
  }
  return req.file;
}

export function publicUrlForCohortFile(id, filename) {
  return `/uploads/cohorts/${id}/${filename}`;
}

export function removeCohortFileIfOwned(id, url) {
  if (!url || !id) return;
  const prefix = `/uploads/cohorts/${id}/`;
  if (!url.startsWith(prefix)) return;
  const filename = url.slice(prefix.length);
  if (!filename) return;
  fs.unlink(path.join(COHORT_UPLOADS_DIR, id, filename), () => {});
}
