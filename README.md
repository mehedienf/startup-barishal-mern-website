# Startup Barishal — MERN Monorepo

Three independent workspaces that together form the Startup Barishal platform:

```
.
├── client/   # Public-facing site (Vite + React 19)        → http://localhost:5173
├── admin/    # Admin DB Console (Vite + React 19)          → http://localhost:5174
└── server/   # Express + JSON-file mock DB API + CORS      → http://localhost:3000
```

## Quick start

```bash
# 1. Install all three workspaces
npm run install:all

# 2. Run everything in parallel
npm run dev
```

This starts the API on `:3000`, the public site on `:5173`, and the admin console on `:5174` at the same time. The client and admin apps proxy `/api/*` to the server, so you only need to hit one URL from the browser.

## Run each workspace individually

```bash
npm run dev:server   # API only
npm run dev:client   # Public site only
npm run dev:admin    # Admin console only
```

## Production build

```bash
npm run build         # builds client + admin into client/dist and admin/dist
npm run start:server  # runs the API (serves JSON only — host the static bundles from any CDN)
```

## Project layout

| Folder    | Tech                                | Purpose                                                                 |
|-----------|-------------------------------------|-------------------------------------------------------------------------|
| `client/` | Vite + React 19 + Tailwind 4        | Public marketing site: Home, About, Events, Contact, Incubation forms.  |
| `admin/`  | Vite + React 19 + Tailwind 4        | Internal DB console to review applications, contacts, subscribers.     |
| `server/` | Node + Express + CORS + JSON file   | REST API serving `db.json` for both apps.                               |

## API surface

All endpoints live under `/api` and are proxied automatically in dev:

- `GET  /api/health`
- `GET  /api/stats`
- `POST /api/contact`  ·  `GET /api/contacts`
- `POST /api/applications`  ·  `GET /api/applications`  ·  `PUT /api/applications/:id`
- `POST /api/newsletter`  ·  `GET /api/subscribers`

## Configuration

Copy `server/.env.example` to `server/.env` to override:

```
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
ADMIN_ORIGIN=http://localhost:5174
```