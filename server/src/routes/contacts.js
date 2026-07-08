// Public contact form (`POST /api/contact`) plus admin list
// (`GET /api/contacts`) and bulk-delete (`DELETE /api/contacts/bulk`).
//
// The JSON form requires `firstName`, `lastName`, `email`, `subject`,
// `message`. The server only stores the form payload; it does NOT email
// anyone or send notifications.

import { crudRouter, bulkDeleteRouter } from "../lib/crud.js";
import { readDB, writeDB, newId } from "../lib/db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const RESOURCE = "contacts";
const PREFIX = "msg";

export function registerContacts(app) {
  // Public submit. No auth — anyone with a browser can drop a message.
  app.post(`/api/${RESOURCE}`, (req, res) => {
    const { firstName, lastName, email, subject, message } = req.body || {};
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        error:
          "firstName, lastName, email, subject, and message are required.",
      });
    }
    const db = readDB();
    if (!db[RESOURCE]) db[RESOURCE] = [];
    const item = {
      id: newId(PREFIX),
      firstName,
      lastName,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };
    db[RESOURCE].unshift(item);
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  // Public form posts to /api/contact (singular) for backwards
  // compatibility with the public site's ContactView. The plural
  // /api/contacts collection is reserved for the admin review queue.
  app.post("/api/contact", (req, res) => {
    const { firstName, lastName, email, subject, message } = req.body || {};
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        error:
          "firstName, lastName, email, subject, and message are required.",
      });
    }
    const db = readDB();
    if (!db[RESOURCE]) db[RESOURCE] = [];
    const item = {
      id: newId(PREFIX),
      firstName,
      lastName,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };
    db[RESOURCE].unshift(item);
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  // BULK MUST COME FIRST: crudRouter's `/:id` DELETE would otherwise
  // shadow `DELETE /api/contacts/bulk` because Express matches in
  // registration order.
  bulkDeleteRouter(app, RESOURCE, ["status"]);
  crudRouter(
    app,
    RESOURCE,
    PREFIX,
    ["firstName", "lastName", "email", "subject", "message"],
  );
}
