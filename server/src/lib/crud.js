// Reusable route factories.
//
// Most resources in this app are simple CRUD: GET a list, GET one by id,
// POST create, PUT update, DELETE remove. `crudRouter` wires those five
// handlers for any collection, validating required fields on create.
//
// `bulkDeleteRouter` adds a single `DELETE /api/<resource>/bulk` endpoint
// that supports three modes: ids[], filter{...}, or all:true. Used by
// the admin inbox pages for batch cleanup.

import { readDB, writeDB, newId } from "./db.js";
import { requireAuth } from "../middleware/requireAuth.js";

/**
 * Register the standard CRUD endpoints for a collection on the given
 * Express app. `resourceName` is the DB key (and the URL slug after
 * /api/). `requiredFields` is the list of body keys that must be
 * present and non-empty on POST.
 */
export function crudRouter(app, resourceName, prefix, requiredFields = []) {
  app.get(`/api/${resourceName}`, (_req, res) => {
    res.json(readDB()[resourceName] || []);
  });

  app.get(`/api/${resourceName}/:id`, (req, res) => {
    const item = (readDB()[resourceName] || []).find(
      (x) => x.id === req.params.id,
    );
    if (!item) {
      return res
        .status(404)
        .json({ error: `${resourceName} record not found.` });
    }
    res.json(item);
  });

  app.post(`/api/${resourceName}`, requireAuth, (req, res) => {
    for (const field of requiredFields) {
      const v = req.body[field];
      if (!v || (typeof v === "string" && !v.trim())) {
        return res
          .status(400)
          .json({ error: `Field "${field}" is required.` });
      }
    }
    const db = readDB();
    if (!db[resourceName]) db[resourceName] = [];
    const item = {
      id: newId(prefix),
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    db[resourceName].unshift(item);
    writeDB(db);
    res.status(201).json({ success: true, data: item });
  });

  app.put(`/api/${resourceName}/:id`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[resourceName] || [];
    const idx = arr.findIndex((x) => x.id === req.params.id);
    if (idx === -1) {
      return res
        .status(404)
        .json({ error: `${resourceName} record not found.` });
    }
    arr[idx] = {
      ...arr[idx],
      ...req.body,
      id: arr[idx].id,
      updatedAt: new Date().toISOString(),
    };
    db[resourceName] = arr;
    writeDB(db);
    res.json({ success: true, data: arr[idx] });
  });

  app.delete(`/api/${resourceName}/:id`, requireAuth, (req, res) => {
    const db = readDB();
    const arr = db[resourceName] || [];
    const idx = arr.findIndex((x) => x.id === req.params.id);
    if (idx === -1) {
      return res
        .status(404)
        .json({ error: `${resourceName} record not found.` });
    }
    const [removed] = arr.splice(idx, 1);
    db[resourceName] = arr;
    writeDB(db);
    res.json({ success: true, data: removed });
  });
}

/**
 * Register `DELETE /api/<resource>/bulk` on the app.
 *
 * Body: { ids?: string[], filter?: { field, op, value }, all?: boolean }
 *  - ids:    remove these specific records.
 *  - filter: remove records matching a single field predicate
 *            (op ∈ "equals" | "contains"). `allowedFields` gates which
 *            fields the caller is permitted to filter on, so an admin
 *            can't craft `{filter: {field: "passwordHash"}}` for example.
 *  - all:    remove every record (used by "clear all visible").
 *
 * Returns { success, deleted, remaining }.
 */
export function bulkDeleteRouter(app, resource, allowedFields = []) {
  app.delete(`/api/${resource}/bulk`, requireAuth, (req, res) => {
    const db = readDB();
    const list = db[resource] || [];
    const { ids, filter, all } = req.body || {};

    let survivors;
    let deletedCount;

    if (all === true) {
      deletedCount = list.length;
      survivors = [];
    } else if (Array.isArray(ids) && ids.length > 0) {
      const idSet = new Set(ids);
      survivors = list.filter((r) => !idSet.has(r.id));
      deletedCount = list.length - survivors.length;
    } else if (filter && typeof filter === "object" && filter.field) {
      if (allowedFields.length > 0 && !allowedFields.includes(filter.field)) {
        return res.status(400).json({
          error: `Filter field "${filter.field}" is not allowed for ${resource}.`,
        });
      }
      const op = filter.op || "equals";
      const val = filter.value;
      survivors = list.filter((r) => {
        const target = r[filter.field];
        if (target == null) return false;
        if (op === "contains") {
          return String(target)
            .toLowerCase()
            .includes(String(val).toLowerCase());
        }
        // default: equals (case-insensitive for strings)
        if (typeof target === "string" && typeof val === "string") {
          return target.toLowerCase() === val.toLowerCase();
        }
        return target === val;
      });
      deletedCount = list.length - survivors.length;
    } else {
      return res.status(400).json({
        error: "Provide one of: ids[], filter{...}, or all:true.",
      });
    }

    db[resource] = survivors;
    writeDB(db);
    res.json({
      success: true,
      deleted: deletedCount,
      remaining: survivors.length,
    });
  });
}