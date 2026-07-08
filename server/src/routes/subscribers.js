// Newsletter subscribe (`POST /api/newsletter`) and admin list
// (`GET /api/subscribers`) + bulk-delete (`DELETE /api/subscribers/bulk`).
//
// We dedupe by email so a user re-subscribing doesn't create a second
// row.

import { crudRouter, bulkDeleteRouter } from "../lib/crud.js";
import { readDB, writeDB, newId } from "../lib/db.js";

const RESOURCE = "subscribers";
const PREFIX = "sub";

export function registerSubscribers(app) {
  app.post(`/api/newsletter`, (req, res) => {
    const { email } = req.body || {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: "Valid email is required." });
    }
    const db = readDB();
    if (!db[RESOURCE]) db[RESOURCE] = [];
    const exists = db[RESOURCE].some(
      (s) => s.email.toLowerCase() === email.toLowerCase(),
    );
    if (exists) {
      return res.json({ success: true, alreadySubscribed: true });
    }
    const item = {
      id: newId(PREFIX),
      email,
      createdAt: new Date().toISOString(),
    };
    db[RESOURCE].unshift(item);
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  crudRouter(app, RESOURCE, PREFIX, ["email"]);
  bulkDeleteRouter(app, RESOURCE, ["email"]);
}
