// `/api/stats` — counts shown on the dashboard quick-glance widget.
//
// `/api/homeStats` (GET / PUT) — the four headline numbers shown on the
// public homepage. PUT is admin-only so marketing can override live
// counts without doing a code release.

import { readDB, writeDB } from "../lib/db.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { coerceStat } from "../lib/db.js";

function computeStats(db) {
  return {
    // Aliases for the dashboard tiles. Backend keeps the canonical
    // collection names; the dashboard reads these friendly aliases.
    currentApplicationsCount: (db.applications || []).length,
    currentContactsCount: (db.contacts || []).length,
    currentSubscribersCount: (db.subscribers || []).length,
    currentTeamCount: (db.teamMembers || []).length,
    currentProgramsCount: (db.incubationPrograms || []).length,
    currentMembershipsCount: (db.memberships || []).length,
    eventsCount: (db.events || []).length,
    // Keep canonical names too so existing callers keep working.
    contacts: (db.contacts || []).length,
    applications: (db.applications || []).length,
    subscribers: (db.subscribers || []).length,
    memberships: (db.memberships || []).length,
  };
}

const DEFAULT_HOME_STATS = {
  eventsCount: 0,
  startupsMentored: 0,
  investorsOnboarded: 0,
  cohortsCompleted: 0,
};

export function registerStats(app) {
  app.get("/api/stats", (_req, res) => {
    res.json(computeStats(readDB()));
  });

  app.get("/api/homeStats", (_req, res) => {
    const db = readDB();
    res.json({ ...DEFAULT_HOME_STATS, ...(db.homeStats || {}) });
  });

  app.put("/api/homeStats", requireAuth, (req, res) => {
    const incoming = req.body || {};
    const next = { ...DEFAULT_HOME_STATS };
    for (const key of Object.keys(DEFAULT_HOME_STATS)) {
      const raw = incoming[key];
      // null / empty string clears the override; number sets it.
      if (raw === null || raw === undefined || raw === "") {
        next[key] = 0;
      } else {
        const v = coerceStat(raw);
        next[key] = v === null ? 0 : v;
      }
    }
    const db = readDB();
    db.homeStats = next;
    writeDB(db);
    res.json({ success: true, data: next });
  });
}
