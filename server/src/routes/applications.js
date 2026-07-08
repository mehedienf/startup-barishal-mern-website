// Public incubation-application form (`POST /api/applications`) and
// the admin review/decision workflow (`GET /:id`, `PUT /:id`,
// `DELETE /bulk`).
//
// `status` is one of `"Pending" | "Approved" | "Rejected"`. Admin PUT
// can also update `notes`.

import { crudRouter, bulkDeleteRouter } from "../lib/crud.js";
import { readDB, writeDB, newId } from "../lib/db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const RESOURCE = "applications";
const PREFIX = "app";

export function registerApplications(app) {
  app.post(`/api/${RESOURCE}`, (req, res) => {
    const { fullName, email, startupName, stage, description, teamSize } =
      req.body || {};
    if (!fullName || !email || !startupName || !description) {
      return res.status(400).json({
        error:
          "fullName, email, startupName, and description are required.",
      });
    }
    const db = readDB();
    if (!db[RESOURCE]) db[RESOURCE] = [];
    const item = {
      id: newId(PREFIX),
      fullName,
      email,
      startupName,
      stage: stage || "Idea",
      description,
      teamSize: Number(teamSize) || 1,
      status: "Pending",
      notes: "",
      createdAt: new Date().toISOString(),
    };
    db[RESOURCE].unshift(item);
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  // Override PUT so admins can update status + notes cleanly without
  // re-sending the full row.
  app.put(`/api/${RESOURCE}/:id`, requireAuth, (req, res) => {
    const { status, notes } = req.body || {};
    const db = readDB();
    const arr = db[RESOURCE] || [];
    const idx = arr.findIndex((a) => a.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: "Application not found." });
    }
    arr[idx] = {
      ...arr[idx],
      ...req.body,
      id: arr[idx].id,
      status: status || arr[idx].status,
      notes: notes !== undefined ? notes : arr[idx].notes,
      updatedAt: new Date().toISOString(),
    };
    db[RESOURCE] = arr;
    writeDB(db);
    res.json({ success: true, data: arr[idx] });
  });

  // List / Get / Delete via the generic factory.
  app.get(`/api/${RESOURCE}`, requireAuth, (_req, res) => {
    res.json(readDB()[RESOURCE] || []);
  });
  app.get(`/api/${RESOURCE}/:id`, requireAuth, (req, res) => {
    const item = (readDB()[RESOURCE] || []).find(
      (x) => x.id === req.params.id,
    );
    if (!item) {
      return res.status(404).json({ error: "Application not found." });
    }
    res.json(item);
  });
  app.delete(`/api/${RESOURCE}/:id`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[RESOURCE] || [];
    const idx = arr.findIndex((x) => x.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: "Application not found." });
    }
    const [removed] = arr.splice(idx, 1);
    db[RESOURCE] = arr;
    writeDB(db);
    res.json({ success: true, data: removed });
  });

  bulkDeleteRouter(app, RESOURCE, ["status"]);
}
