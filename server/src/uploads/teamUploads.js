// Team member photo uploads. Files are scoped to `uploads/teams/<id>/`.

import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { TEAM_UPLOADS_DIR } from "../config/paths.js";

const STORAGE = multer.diskStorage({
  destination: (req, _file, cb) => {
    const id = req.params.id;
    if (!id) return cb(new Error("Missing team member id in route."));
    const dir = path.join(TEAM_UPLOADS_DIR, id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "") || ".jpg";
    const base = path
      .basename(file.originalname || "photo", ext)
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .slice(0, 40) || "photo";
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

export const teamUpload = multer({ storage: STORAGE });

export function pickTeamFile(req) {
  if (!req.file) return null;
  if (Array.isArray(req.files) && req.files.length > 0) return req.files[0];
  if (req.files && typeof req.files === "object") {
    for (const value of Object.values(req.files)) {
      if (Array.isArray(value) && value.length > 0) return value[0];
    }
  }
  return req.file;
}

export function publicUrlForTeamFile(id, filename) {
  return `/uploads/teams/${id}/${filename}`;
}

export function removeTeamFileIfOwned(id, url) {
  if (!url || !id) return;
  const prefix = `/uploads/teams/${id}/`;
  if (!url.startsWith(prefix)) return;
  const filename = url.slice(prefix.length);
  if (!filename) return;
  fs.unlink(path.join(TEAM_UPLOADS_DIR, id, filename), () => {});
}
