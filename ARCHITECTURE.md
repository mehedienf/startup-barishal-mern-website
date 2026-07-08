# Startup Barishal — Architecture

This document explains how the three workspaces (`client/`, `admin/`, `server/`) fit together, what each module in `server/src/` is responsible for, and where to plug in when extending the system. For the day-to-day "how do I run it" questions, see `README.md`.

---

## 1. System overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Browser                                         │
│                                                                            │
│   public site (React Router, base '/')       admin console (base '/admin/')  │
│   http://localhost:5173                       http://localhost:5174         │
└──────────────────┬─────────────────────────────┬───────────────────────────┘
                   │                             │
                   │ /api/*, /uploads/*          │ /api/*, /uploads/*
                   │ (proxied in dev by Vite)    │
                   ▼                             ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          Express (server/server.js)                        │
│                                                                            │
│  middleware:   cors → cookieParser → express.json                          │
│                                                                            │
│  routes:       /api/health, /api/stats, /api/homeStats                     │
│                /api/auth/{login,logout}                                    │
│                /api/{contacts,applications,memberships,subscribers}        │
│                  … (public POST) + (admin CRUD)                            │
│                /api/{partners,cohorts,events,members,featured}              │
│                  … (public GET) + (admin CRUD)                             │
│                                                                            │
│  static:       5-layer SPA fallback  ←────  server/src/staticSpa.js        │
│  uploads:      /uploads/* served from disk                                 │
└──────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       File-based JSON DB (db.json)                         │
│                                                                            │
│   collections: applications[], contacts[], subscribers[], memberships[],  │
│                events[], cohorts[] (under key incubationPrograms),         │
│                members[] (under key teamMembers), partners[],              │
│                featured[], homeStats{}, adminUsers[]                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

In dev, Vite proxies `/api/*` and `/uploads/*` to `:3000` so the browser never has to call two origins. In production, the same Express process serves the API **and** the built SPA bundles out of `dist/`.

---

## 2. Server source layout

```
server/
├── server.js               # slim entry: imports modules, registers routes
└── src/
    ├── config/             # environment + filesystem constants
    │   ├── env.js          # reads server/.env, exports PORT, SESSION_SECRET, …
    │   ├── cors.js         # builds ALLOWED_ORIGINS from env + deployed host
    │   └── paths.js        # REPO_ROOT, DB_FILE, DIST_DIR, per-resource upload dirs
    │
    ├── lib/                # framework-agnostic helpers
    │   ├── auth.js         # HMAC sign/verify, base64url, seedAdminUser()
    │   ├── db.js           # readDB(), writeDB(), newId(), seedDefaults(), migrations
    │   └── crud.js         # crudRouter(), bulkDeleteRouter()  ← generic factories
    │
    ├── middleware/
    │   └── requireAuth.js  # verifies sb_admin_session cookie → req.session
    │
    ├── uploads/            # one multer config per resource
    │   ├── partnerUploads.js
    │   ├── eventUploads.js   (cover + gallery)
    │   ├── cohortUploads.js
    │   ├── teamUploads.js
    │   └── featuredUploads.js
    │
    ├── routes/             # one register(app) function per resource
    │   ├── health.js
    │   ├── auth.js
    │   ├── stats.js
    │   ├── members.js
    │   ├── contacts.js
    │   ├── applications.js
    │   ├── subscribers.js
    │   ├── memberships.js
    │   ├── partners.js
    │   ├── cohorts.js
    │   ├── events.js
    │   └── featured.js
    │
    └── staticSpa.js        # 5-layer SPA fallback for production hosting
```

### `server.js` — what it actually does

```js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ALLOWED_ORIGINS } from "./src/config/cors.js";
import { registerHealth } from "./src/routes/health.js";
import { registerAuth }    from "./src/routes/auth.js";
// … one import per resource module
import { mountStaticSpa }  from "./src/staticSpa.js";

const app = express();
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

registerHealth(app);
registerAuth(app);
registerStats(app);
registerApplications(app);
registerContacts(app);
registerCohorts(app);
registerEvents(app);
registerFeatured(app);
registerMembers(app);
registerMemberships(app);
registerPartners(app);
registerSubscribers(app);

mountStaticSpa(app);

app.listen(PORT, "0.0.0.0", () => log(...));
```

That's it. Adding a new resource means creating a new `routes/<name>.js`, importing it, and calling `register<Name>(app)`.

---

## 3. Request flow

### Public form submission (e.g. contact)

```
ContactView.jsx
   │  fetch('POST /api/contact', { body: { name, email, message } })
   ▼
Vite dev proxy (or Express static path in prod)
   │
   ▼
routes/contacts.js → app.post('/api/contact', ...)
   │  writeDB(db => { db.contacts.unshift(newRecord) })
   │  also writes app.db.json atomically
   ▼
201 { ok: true, record }
```

### Admin write (e.g. update a partner)

```
PartnersPage.jsx
   │  fetch('PUT /api/partners/<id>', { credentials: 'include', body })
   ▼
Vite dev proxy
   │
   ▼
middleware/requireAuth.js
   │  verifyToken(req.cookies[SESSION_COOKIE])
   │  req.session = { username }
   ▼
routes/partners.js → app.put('/api/partners/:id', requireAuth, handler)
   │  readDB → mutate → writeDB
   ▼
200 { ok: true, record }
```

### File upload (e.g. partner logo)

```
PartnersPage.jsx
   │  FormData with file field 'logo'
   ▼
uploads/partnerUploads.js  →  multer.diskStorage
   │  filename: randomId + ext
   │  destination: uploads/partners/<id>/
   │  (directory pre-created before multer writes)
   ▼
publicUrl = `/uploads/partners/<id>/<file>`
   │  persisted into the partner record's `logo` field
   ▼
GET /uploads/partners/<id>/<file> served by staticSpa.js (express.static)
```

---

## 4. Auth flow

We use a **stateless, HMAC-signed session cookie** so there's no server-side session store to manage.

### Login

1. `POST /api/auth/login { username, password }`
2. `lib/db.js` reads `db.json`, finds the admin user, bcrypt.compare the password.
3. On success, `lib/auth.signToken({ sub, exp })` produces:
   ```
   base64url(JSON) + "." + HMAC-SHA256(secret, base64url(JSON))
   ```
4. The API sets `Set-Cookie: sb_admin_session=<token>; HttpOnly; SameSite=Lax; Max-Age=<ttl>` and returns `{ ok: true }`.

### Authenticated request

1. `requireAuth` middleware reads `req.cookies[SESSION_COOKIE]`.
2. `lib/auth.verifyToken(token)` re-computes the HMAC (constant-time compare) and checks the `exp` claim.
3. On success, sets `req.session = { username }`. On failure, returns `401`.

### Logout

`POST /api/auth/logout` clears the cookie via `res.clearCookie(SESSION_COOKIE)`.

> The cookie name and lifetime are env-driven (`SESSION_COOKIE`, `SESSION_TTL_MS`) so a host can brand the session without code changes.

---

## 5. Static SPA fallback (production)

`server/src/staticSpa.js` mounts the merged `dist/` bundle with five layers, in order:

| Layer | Path             | Mount                                              |
| ----- | ---------------- | -------------------------------------------------- |
| 1     | `dist/assets`    | `express.static(DIST_DIR/assets)` for hashed bundles |
| 2     | `dist/admin/assets` | `express.static(DIST_DIR/admin/assets)`          |
| 3     | `dist/uploads`   | `express.static(DIST_DIR/uploads)`                |
| 4     | `dist/uploads/partners` (legacy) | compatibility shim              |
| 5     | catch-all        | React Router shells — admin if path matches `/^\/admin(\/.*)?$/`, public else |

Layer 5 contains an **in-handler extension guard**: if the last URL segment has a dot (`.js`, `.png`, etc.) and no matching file exists on disk, the request 404s rather than getting an HTML shell — so a missing asset doesn't masquerade as a route.

### Why both `.htaccess` AND the Express catch-all?

- Apache (in front of Passenger on cPanel) needs its own rewrite rules for SPA deep links. Without `public/.htaccess`, Apache returns `404 Not Found` for `/about` before Express ever sees the request.
- The Express catch-all in `staticSpa.js` is the second line of defense: if Apache is misconfigured or the deployment is plain Express, deep links still resolve.

Both layers share the same intent: **if the path isn't a real file, directory, or `/api/*` request, hand back the SPA shell**. See `public/.htaccess` and `server/src/staticSpa.js` for the implementations.

---

## 6. File upload pipeline

Each resource gets its own multer module so destination rules stay co-located with the route handler:

```
uploads/<resource>/<id>/<random>-<originalName>
```

| Resource | Module                       | Storage path                            |
| -------- | ---------------------------- | --------------------------------------- |
| Partners | `uploads/partnerUploads.js`  | `server/uploads/partners/<id>/`         |
| Events   | `uploads/eventUploads.js`    | `server/uploads/events/<id>/` (cover + `gallery/` subdir) |
| Cohorts  | `uploads/cohortUploads.js`   | `server/uploads/cohorts/<id>/`          |
| Members  | `uploads/teamUploads.js`     | `server/uploads/teams/<id>/`            |
| Featured | `uploads/featuredUploads.js` | `server/uploads/featured/<id>/`         |

The directory is created *before* multer writes (`paths.ensureUploadDirs()`), so `ENOENT` is avoided even when uploading against a freshly-issued id.

Returned URLs look like `/uploads/partners/<id>/abc123-logo.png`. The admin console uses them directly; the public site uses them via `<img src="/uploads/...">`. Vite proxies `/uploads/*` to the API in dev.

To delete uploads along with a record, each route's DELETE handler walks the upload dir for that record and removes any files referenced by the record's URL fields.

---

## 7. Build & deploy pipeline

```
npm run build
   │
   ├── 1. build:client    →  client/dist/
   │
   ├── 2. build:admin     →  admin/dist/
   │
   └── 3. collect:dist    →  dist/
            ├── wipes dist/
            ├── copies client/dist/  →  dist/
            ├── copies admin/dist/   →  dist/admin/
            └── copies public/.htaccess →  dist/.htaccess
```

After `collect:dist`, the layout matches what cPanel expects:

```
dist/
├── index.html             # public site entry
├── assets/...             # hashed client bundles
├── admin/
│   ├── index.html         # admin entry
│   └── assets/...         # hashed admin bundles
└── .htaccess              # Apache SPA fallback
```

`.cpanel.yml` then tells the cPanel Git hook:

```yaml
deployment:
  tasks:
    - export DEPLOYPATH=/home/<user>/<public_html>/
    - /bin/cp -R dist/* $DEPLOYPATH
```

So after a push, cPanel builds + deploys in one shot.

---

## 8. Extension points

| Goal                                       | Where to make the change                                                                  |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Add a new API resource                     | 1. `server/src/lib/db.js` — if it needs a top-level collection, register it in `seedDefaults()`. 2. Create `server/src/routes/<name>.js` exporting `register<Name>(app)`. 3. Import + call it from `server/server.js`. 4. (Optional) Add a multer module in `server/src/uploads/`. |
| Add a new file-upload field                | Create / extend a `server/src/uploads/<name>Uploads.js` and wire it from the route.       |
| Change session lifetime or cookie name     | Edit `server/.env` (`SESSION_TTL_MS`, `SESSION_COOKIE`).                                 |
| Rotate the admin password                  | Set `ADMIN_PASSWORD` in `.env` **before** first boot (or change `db.json` post-boot and re-bcrypt). |
| Add a new CORS origin                      | Set `EXTRA_ORIGINS=https://foo,https://bar` in `.env`, or append to `ALLOWED_ORIGINS` in `server/src/config/cors.js` for permanent entries. |
| Add a new admin SPA page                   | 1. Create `admin/src/components/<Name>Page.jsx`. 2. Register the route in `admin/src/App.jsx`. 3. Add a sidebar link in `admin/src/components/Sidebar.jsx`. |
| Add a new public SPA page                  | 1. Create `client/src/components/<Name>View.jsx`. 2. Register the route in `client/src/App.jsx`. 3. Add a NavBar link in `client/src/components/NavBar.jsx`. |
| Tweak the SPA fallback                     | `server/src/staticSpa.js` (Express) and/or `public/.htaccess` (Apache).                  |
| Swap the JSON DB for SQLite/Postgres       | Replace `lib/db.js`'s `readDB`/`writeDB` with SQL equivalents; route modules don't need to change because they only call those two functions. |

---

## 9. Why this layout

The split into 22 files under `server/src/` is intentional:

- **Each route module owns its resource end-to-end** (list + create + update + delete + bulk-delete + uploads), so dropping a resource means deleting one folder under `routes/` and one under `uploads/`.
- **Cross-cutting concerns live in dedicated folders** (`lib/` for pure helpers, `middleware/` for Express middleware, `config/` for environment + filesystem).
- **`lib/crud.js` provides generic factories** so 90% of each route file is just a *registry call* — what's left is genuinely resource-specific (validation rules, side-effects, upload side-effects).
- **`server/server.js` stays under ~90 lines** so any reader sees the system's wiring at a glance.

Every new contributor should be able to answer "where does feature X live?" by reading this document.
