// Membership applications (`POST /api/memberships` from the public
// site). The admin review surface is the same `crudRouter` factory.
// No special PUT logic.

import { crudRouter, bulkDeleteRouter } from "../lib/crud.js";
import { readDB, writeDB, newId } from "../lib/db.js";

const RESOURCE = "memberships";
const PREFIX = "mem";

export function registerMemberships(app) {
  app.post(`/api/${RESOURCE}`, (req, res) => {
    const { fullName, email, organization, role, reason } = req.body || {};
    if (!fullName || !email) {
      return res
        .status(400)
        .json({ error: "fullName and email are required." });
    }
    const db = readDB();
    if (!db[RESOURCE]) db[RESOURCE] = [];
    const item = {
      id: newId(PREFIX),
      fullName,
      email,
      organization: organization || "",
      role: role || "",
      reason: reason || "",
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    db[RESOURCE].unshift(item);
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  crudRouter(app, RESOURCE, PREFIX, ["fullName", "email"]);
  bulkDeleteRouter(app, RESOURCE, ["status"]);
}
