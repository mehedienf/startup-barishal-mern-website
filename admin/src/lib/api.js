/**
 * API helpers for the admin console.
 *
 * Why this exists:
 *   In production the admin is served from `admin.startupbarishal.olivosoft.com`
 *   and the Express API lives on `api.startupbarishal.olivosoft.com`. The
 *   admin host has no Node listener — it's just the static `dist/` bundle
 *   served by Apache — so a bare `fetch("/api/...")` returns a 404 from
 *   Apache (HTML, not JSON). Every fetch has to go to the API origin,
 *   which is baked in at build time via `VITE_API_ORIGIN`.
 *
 *   In dev, `VITE_API_ORIGIN` is intentionally unset so the helper falls
 *   back to a relative path. The Vite dev server's `proxy` config then
 *   forwards `/api/*` to `http://localhost:3000`. Auth still works in
 *   dev because the proxy and the API share `localhost` (no cross-origin
 *   cookie quirks).
 *
 * Usage:
 *   import { apiFetch } from "../lib/api.js";
 *   const res = await apiFetch("/api/applications");
 *   const res = await apiFetch(`/api/applications/${id}`, { method: "PUT", body: ... });
 *
 *   `credentials: "include"` is set unconditionally — every admin call
 *   rides the HTTP-only session cookie, so omitting it would break auth
 *   on the first guarded request after sign-in.
 */

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "";

/**
 * Build an absolute API URL.
 *
 *   - Inputs starting with `http://` or `https://` pass through.
 *   - Inputs starting with `/` get the API origin prepended (when set).
 *   - Bare paths get a leading slash added before the prefix.
 *   - When API_ORIGIN is empty (dev), the path is returned as a relative
 *     URL so the Vite proxy can forward it.
 */
export function apiUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_ORIGIN) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/${path}`;
}

/**
 * Thin `fetch` wrapper that always sends to the API origin. Always sets
 * `credentials: "include"` so the HTTP-only session cookie rides along —
 * the admin gate would not survive a sign-in otherwise. Spread the rest
 * of the init options so callers can override `credentials` explicitly
 * (e.g. for a public endpoint) or pass through `method` / `body` / etc.
 */
export function apiFetch(path, init = {}) {
  const { credentials = "include", ...rest } = init;
  return fetch(apiUrl(path), { credentials, ...rest });
}

/**
 * Resolve a server-relative asset URL (typically an `/uploads/...` path
 * coming back from the API as `logoUrl`, `coverImage`, `photoUrl`, etc.)
 * to a fully-qualified URL the browser can actually load.
 *
 *   - Empty / nullish input returns an empty string (so React can render
 *     `<img src="">` without logging a noisy warning).
 *   - Absolute `http(s)://` URLs and client-side `blob:` / `data:` URLs
 *     pass through unchanged — those are already browser-loadable.
 *     `blob:` URLs look like `blob:https://host/uuid` (note: there's a
 *     full `https://host` authority embedded after the colon), so the
 *     scheme check must match on the bare prefix, not on `://`.
 *   - When API_ORIGIN is set, server-relative paths get prefixed so the
 *     request hits the API host where the file is actually served.
 *   - In dev (no API_ORIGIN), returns the path unchanged so the Vite
 *     proxy can serve the upload.
 */
export function resolveAssetUrl(path) {
  if (!path) return "";
  // Pass through any URL the browser can already load. Match on the
  // scheme prefix only — `blob:` and `data:` carry an authority (e.g.
  // `blob:https://host/uuid`) so the older `://` check was wrong and
  // produced mangled URLs in production where API_ORIGIN is set.
  if (/^(https?|blob|data):/i.test(path)) return path;
  if (!API_ORIGIN) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/${path}`;
}
