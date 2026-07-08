# Startup Barishal — MERN Monorepo

A single repository hosting three independent workspaces that together run the Startup Barishal platform:

| Workspace  | Stack                          | Port (dev)               | Purpose                                                                                  |
| ---------- | ------------------------------ | ------------------------ | ---------------------------------------------------------------------------------------- |
| `client/`  | Vite + React 19 + Tailwind 4   | `:5173`                  | Public-facing marketing site (Home, About, Events, Incubation, Membership, Contact).     |
| `admin/`   | Vite + React 19 + Tailwind 4   | `:5174` (base `/admin/`) | Internal console for reviewing applications, contacts, subscribers, members, etc.        |
| `server/`  | Node + Express + JSON file DB  | `:3000`                  | REST API serving `db.json` + uploaded files; also serves the built SPA bundles in prod.  |

Both SPAs proxy `/api/*` and `/uploads/*` to `:3000` in dev, so you only ever hit one URL from the browser.

---

## 1. Quick start

```bash
# 1. Install every workspace
npm run install:all

# 2. Run server + client + admin in parallel
npm run dev
```

Open:

- Public site → <http://localhost:5173>
- Admin console → <http://localhost:5174>
- API → <http://localhost:3000/api/health>

Default admin credentials (created on first boot if `db.json` is empty):

```
username: admin
password: startupbarishal
```

> Override these in production by setting `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `server/.env` **before the first boot**.

---

## 2. Run workspaces individually

```bash
npm run dev:server   # API only (reload via node --watch)
npm run dev:client   # Public site only
npm run dev:admin    # Admin console only
```

Run any two together with `npx npm-run-all2 --parallel dev:server dev:client`.

---

## 3. Project layout

```
startup-barishal-mern/
├── client/                 # Public-facing Vite SPA
│   ├── index.html
│   ├── vite.config.js      # base '/', /api + /uploads proxies
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── assets/
│       └── components/     # NavBar, HomeView, AboutView, EventsView, ...
├── admin/                  # Internal Vite SPA (base '/admin/')
│   ├── index.html
│   ├── vite.config.js      # base '/admin/', /api + /uploads proxies
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── assets/partners/
│       ├── components/     # Sidebar, Dashboard, ApplicationsPage, ...
│       └── hooks/useAdminData.js
├── server/                 # Express API + JSON-file DB
│   ├── server.js           # Slim entry (~90 lines): wires modules + static mount
│   ├── package.json
│   ├── data/db.json        # File-based database (auto-seeded on first boot)
│   ├── uploads/            # Per-resource multer destinations
│   │   ├── events/<id>/
│   │   ├── cohorts/<id>/
│   │   ├── teams/<id>/
│   │   ├── partners/<id>/
│   │   └── featured/<id>/
│   └── src/
│       ├── config/         # env.js, cors.js, paths.js
│       ├── lib/            # auth.js, db.js, crud.js (factories)
│       ├── middleware/     # requireAuth.js
│       ├── uploads/        # One multer module per resource (5 files)
│       ├── routes/         # One route module per resource (13 files)
│       └── staticSpa.js    # 5-layer SPA fallback for prod hosting
├── public/
│   └── .htaccess           # Apache SPA fallback — copied to dist/ on build
├── scripts/
│   ├── dev-all.js          # Spawns server + client + admin via npm-run-all2
│   ├── collect-dist.js     # Merges client/dist + admin/dist into repo /dist
│   └── seed-bulk.js        # One-shot seeder (~100 synthetic entries per inbox)
├── .cpanel.yml             # cPanel deployment hook (cp -R dist/* $DEPLOYPATH)
├── package.json            # Root scripts: install:all, dev, build, start:server
├── README.md               # ← you are here
└── ARCHITECTURE.md         # System design, data flow, extension points
```

See `ARCHITECTURE.md` for a deeper dive into how these pieces fit together.

---

## 4. Configuration

Copy `server/.env.example` to `server/.env` and fill in the keys you care about. Every key is optional; the defaults are dev-friendly.

| Key                 | Default                              | Purpose                                                                                       |
| ------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `PORT`              | `3000`                               | Port the Express API binds to.                                                                |
| `CLIENT_ORIGIN`     | `http://localhost:5173`              | Allowed CORS origin for the public site.                                                      |
| `ADMIN_ORIGIN`      | `http://localhost:5174`              | Allowed CORS origin for the admin console.                                                    |
| `EXTRA_ORIGINS`     | *(empty)*                            | Comma-separated extra allowed origins (e.g. `https://staging.example.com,https://foo.com`).  |
| `SESSION_SECRET`    | *(dev fallback)*                     | HMAC secret for signing the admin session cookie. **Set a strong random value in production.**|
| `SESSION_COOKIE`    | `sb_admin_session`                   | Name of the session cookie.                                                                   |
| `SESSION_TTL_MS`    | `604800000` (7 days)                 | Session lifetime in milliseconds.                                                             |
| `ADMIN_USERNAME`    | `admin`                              | Username seeded on first boot if `db.json` has no admin user.                                 |
| `ADMIN_PASSWORD`    | `startupbarishal`                    | Password seeded on first boot if `db.json` has no admin user. **Change in production.**       |
| `DIST_DIR`          | `<repo>/dist`                        | Where the Express static mount expects the merged SPA bundle.                                |
| `SERVER_UPLOADS_DIR`| `<repo>/server/uploads`              | Where multer writes uploaded files.                                                           |

> The admin's deployed origin (`https://startupbarishal.olivosoft.com`) is hard-coded in `server/src/config/cors.js`. If you deploy to a different host, add it to `EXTRA_ORIGINS` or update that list.

The client and admin apps need **no** env vars in development — Vite handles the dev server, and the production bundle is fully self-contained.

---

## 5. API surface

Every endpoint lives under `/api`. Public POSTs accept the same JSON shape the React forms send; admin endpoints require the `sb_admin_session` cookie (set by `POST /api/auth/login`).

### Health & stats

| Method | Path              | Auth | Notes                                                |
| ------ | ----------------- | ---- | ---------------------------------------------------- |
| GET    | `/api/health`     | —    | `{ ok: true, uptime }` for liveness probes.          |
| GET    | `/api/stats`      | —    | Aggregate counts across the entire DB.               |
| GET    | `/api/homeStats`  | —    | Smaller dashboard summary used by the public site.   |
| PUT    | `/api/homeStats`  | ✅   | Persist admin-edited home stat counters.             |

### Auth

| Method | Path                  | Auth | Notes                                                |
| ------ | --------------------- | ---- | ---------------------------------------------------- |
| POST   | `/api/auth/login`     | —    | Body: `{ username, password }`. Sets the session cookie on success. |
| POST   | `/api/auth/logout`    | —    | Clears the session cookie.                           |

### Public forms (no auth)

| Method | Path                  | Used by (client)         | Notes                                                                 |
| ------ | --------------------- | ------------------------ | --------------------------------------------------------------------- |
| POST   | `/api/contact`        | `ContactView.jsx`        | Singular form endpoint. Alias of `/api/contacts`.                     |
| POST   | `/api/applications`   | `IncubationView.jsx`     | Submit an incubation application.                                     |
| POST   | `/api/memberships`    | `MembershipView.jsx`     | Apply for membership.                                                 |
| POST   | `/api/newsletter`     | `Footer.jsx`             | Subscribe to the newsletter.                                          |

### Admin read endpoints (auth required)

`GET /api/<resource>` returns the full list. `GET /api/<resource>/:id` returns a single record. Filters and search are handled client-side in `admin/src/components/<Resource>Page.jsx`.

| Resource              | List path                              |
| --------------------- | -------------------------------------- |
| Contacts              | `/api/contacts`                        |
| Applications          | `/api/applications`                    |
| Subscribers           | `/api/subscribers`                     |
| Memberships           | `/api/memberships`                     |
| Team members          | `/api/teamMembers`                     |
| Partners              | `/api/partners`                        |
| Incubation programs   | `/api/incubationPrograms`              |
| Events                | `/api/events`                          |
| Featured images       | `/api/featured`                        |
| Stats counters        | `/api/stats`                           |

### Admin write endpoints (auth required)

For every resource above:

| Verb   | Path                          | Purpose                                                                 |
| ------ | ----------------------------- | ----------------------------------------------------------------------- |
| POST   | `/api/<resource>`             | Create a new record.                                                    |
| PUT    | `/api/<resource>/:id`         | Update a record (partial).                                              |
| DELETE | `/api/<resource>/:id`         | Delete a record and any associated uploaded files.                      |
| POST   | `/api/<resource>/bulk-delete` | Body: `{ ids: [...] }` or `{ filter: {...}, all: true }`. Smart delete. |

### File upload endpoints (auth required, `multipart/form-data`)

| Resource | Endpoint                                  | Field name(s)        | Stored at                              |
| -------- | ----------------------------------------- | -------------------- | -------------------------------------- |
| Partners | `POST /api/partners/:id/logo`             | `logo`               | `server/uploads/partners/<id>/`        |
| Events   | `POST /api/events/:id/cover`              | `cover`              | `server/uploads/events/<id>/`          |
| Events   | `POST /api/events/:id/gallery`            | `images` (multiple)  | `server/uploads/events/<id>/gallery/`  |
| Cohorts  | `POST /api/incubationPrograms/:id/cover`  | `cover`              | `server/uploads/cohorts/<id>/`         |
| Members  | `POST /api/teamMembers/:id/photo`         | `photo`              | `server/uploads/teams/<id>/`           |
| Featured | `POST /api/featured/:id/image`            | `image`              | `server/uploads/featured/<id>/`        |

Uploaded files are served back at `/uploads/<resource>/<id>/filename`.

---

## 6. Production build & deploy

### Build locally

```bash
npm run build
```

This runs three steps in order:

1. `build:client` — Vite bundles the public site into `client/dist/`.
2. `build:admin`  — Vite bundles the admin console into `admin/dist/`.
3. `collect:dist` — `scripts/collect-dist.js` merges both into a single repo-root `dist/`:

```
dist/index.html
dist/assets/...
dist/admin/index.html
dist/admin/assets/...
dist/.htaccess        # copied from public/.htaccess for SPA fallback
```

### Deploy to cPanel

`.cpanel.yml` at the repo root tells the cPanel Git deployment hook what to copy:

```yaml
deployment:
  tasks:
    - export DEPLOYPATH=/home/<user>/<public_html>/
    - /bin/cp -R dist/* $DEPLOYPATH
```

After pushing to the cPanel-managed Git remote, cPanel runs `npm run build` (or whatever your hook invokes) and copies the merged `dist/` into the document root.

### Start the API in production

```bash
npm run start:server   # node server/server.js
```

The Express server then does double duty:

- **API** on `/api/*` — see the surface above.
- **Static SPA** on everything else — `server/src/staticSpa.js` mounts the merged `dist/` bundle with a 5-layer fallback so deep links like `/about` and `/admin/applications` resolve to the correct `index.html`.

### SPA fallback (why both `.htaccess` AND the Express catch-all are needed)

- **Apache `.htaccess`** sits in front of Passenger/Express on cPanel and rewrites unknown paths to `index.html`. Without it, Apache returns `404 Not Found` before Express ever sees the request.
- **Express catch-all** in `server/src/staticSpa.js` is the second line of defense: if Apache is misconfigured (or you're hosting on plain Express without Apache), Express still serves the SPA shell.

Both layers share the same intent — if the path isn't a real file, directory, or `/api/*` request, hand back the SPA shell so React Router can handle the route.

---

## 7. Common tasks

### Reset the database

```bash
rm server/data/db.json
npm run dev:server       # auto-seeds a fresh db.json on first boot
```

### Seed ~100 synthetic inbox entries

```bash
node scripts/seed-bulk.js
```

Useful for exercising pagination, filter chips, and bulk-delete in the admin panel. Safe to run multiple times; only ever appends.

### Run a one-off API smoke test

```bash
PORT=3011 SESSION_SECRET=dev-secret node server/server.js &
curl http://localhost:3011/api/health
curl -X POST http://localhost:3011/api/contact \
  -H 'content-type: application/json' \
  -d '{"name":"Test","email":"t@example.com","message":"hi"}'
```

### Log in via curl

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H 'content-type: application/json' \
  -c cookies.txt \
  -d '{"username":"admin","password":"startupbarishal"}'

curl -b cookies.txt http://localhost:3000/api/stats
```

---

## 8. Troubleshooting

| Symptom                                                                | Likely cause                                                                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `404 Not Found` on `/about`, `/events`, etc. after refresh on cPanel   | `.htaccess` was not copied into `dist/`. Run `npm run build` again and check `dist/.htaccess` exists.          |
| `CORS policy` errors in browser console                                | Your dev/preview host isn't in `ALLOWED_ORIGINS`. Add it to `EXTRA_ORIGINS` in `server/.env`.                |
| Admin login returns `401`                                              | Wrong credentials, or `db.json` was hand-edited and lost the admin user. Delete the file and restart the API. |
| Uploaded image shows broken in admin                                   | Browser cached the old `/uploads/...` URL. Hard-refresh (`Cmd+Shift+R` / `Ctrl+F5`).                          |
| `dist/.htaccess` is missing after build                                | `public/.htaccess` was deleted. Restore it; `collect-dist.js` warns when it's absent.                        |
| Multer error `ENOENT: ... uploads/<resource>/<id>`                     | The API created an upload dir for an id that hasn't been persisted yet. Restart with the latest `server/src`.|

---

## 9. Where to find things

| If you want to…                                | Look in…                                                                                            |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Add a new API endpoint                         | `server/src/routes/<resource>.js` (and re-export from `server/server.js` if it's a new resource)   |
| Change the CORS allow-list                     | `server/src/config/cors.js`                                                                         |
| Add or change an env var                       | `server/src/config/env.js` + `server/.env.example`                                                  |
| Tweak the admin SPA fallback                   | `server/src/staticSpa.js` (Express) and `public/.htaccess` (Apache)                                 |
| Change the login cookie name or lifetime       | `server/.env` (`SESSION_COOKIE`, `SESSION_TTL_MS`)                                                  |
| Add a new admin page                           | `admin/src/components/<Name>Page.jsx` + `admin/src/App.jsx`                                         |
| Add a new public page                          | `client/src/components/<Name>View.jsx` + `client/src/App.jsx`                                       |
| See the full backend layout                    | `ARCHITECTURE.md`                                                                                   |

---

## 10. License

Proprietary — internal Startup Barishal project.
